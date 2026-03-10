import crypto from 'crypto';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '.env.local'), override: true });

const app = express();

const PORT = Number(process.env.PORT || 3001);
const CASHFREE_ENV = (process.env.CASHFREE_ENV || 'sandbox').toLowerCase();
const CASHFREE_BASE_URL = CASHFREE_ENV === 'production'
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || process.env.CASHFREE_CLIENT_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || process.env.CASHFREE_SECRET;
const CASHFREE_API_VERSION = process.env.CASHFREE_API_VERSION || '2023-08-01';
const ALLOWED_ORIGIN = process.env.APP_ORIGIN || 'http://localhost:3000';
const CASHFREE_WEBHOOK_URL = process.env.CASHFREE_WEBHOOK_URL || `${ALLOWED_ORIGIN}/api/cashfree/webhook`;
const CASHFREE_DEFAULT_REFUND_SPEED = String(process.env.CASHFREE_DEFAULT_REFUND_SPEED || 'STANDARD').trim().toUpperCase();
const GST_RATE = 0.18;
const TEAM_INVITE_BASE_URL = String(process.env.TEAM_INVITE_BASE_URL || ALLOWED_ORIGIN).replace(/\/$/, '');
const TEAM_INVITE_EXPIRY_HOURS_RAW = Number(process.env.TEAM_INVITE_EXPIRY_HOURS || 72);
const TEAM_INVITE_EXPIRY_HOURS = Number.isFinite(TEAM_INVITE_EXPIRY_HOURS_RAW) && TEAM_INVITE_EXPIRY_HOURS_RAW > 0
  ? TEAM_INVITE_EXPIRY_HOURS_RAW
  : 72;
const TEAM_ACCESS_EMAIL_PROVIDER = String(process.env.TEAM_ACCESS_EMAIL_PROVIDER || 'resend').trim().toLowerCase();
const TEAM_ACCESS_FROM_EMAIL = String(process.env.TEAM_ACCESS_FROM_EMAIL || 'Volosist Team <noreply@volosist.com>').trim();
const RESEND_API_KEY = String(process.env.RESEND_API_KEY || '').trim();
const SUPABASE_URL = String(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '');
const SUPABASE_SERVICE_ROLE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const SUPABASE_REFUNDS_TABLE = String(process.env.SUPABASE_REFUNDS_TABLE || 'refunds').trim();
const SUPABASE_USER_PAYMENTS_TABLE = String(process.env.SUPABASE_USER_PAYMENTS_TABLE || 'user_payments').trim();

const REFUND_SPEEDS = new Set(['STANDARD', 'INSTANT']);
const SETTLED_REFUND_STATUSES = new Set(['SUCCESS', 'COMPLETED', 'PROCESSED', 'REFUNDED']);
const PENDING_REFUND_STATUSES = new Set(['PENDING', 'PROCESSING', 'ONHOLD', 'INITIATED']);
const FAILED_REFUND_STATUSES = new Set(['FAILED', 'CANCELLED', 'CANCELED', 'REJECTED']);

const SERVICE_CATALOG = {
  sales: { Basic: 490, Pro: 1490, Business: 4990 },
  voice: { Basic: 790, Pro: 1990, Business: 4990 },
  marketing: { Basic: 490, Pro: 1290, Business: 3990 },
  business: { Basic: 990, Pro: 2490, Business: 6990 },
};

const LEGACY_PLAN_PRICING = {
  basic_monthly: { subtotal: 490, planName: 'Basic' },
  basic_yearly: { subtotal: 4900, planName: 'Basic (Annual)' },
  pro_monthly: { subtotal: 1490, planName: 'Pro' },
  pro_yearly: { subtotal: 14900, planName: 'Pro (Annual)' },
  business_monthly: { subtotal: 4990, planName: 'Business' },
  business_yearly: { subtotal: 49900, planName: 'Business (Annual)' },
};

const pendingOrders = new Map();
const requestWindow = new Map();
const refundsByRefundId = new Map();
const refundIdsByEntity = new Map();
const teamInvitationsById = new Map();
const teamInvitationIdByToken = new Map();
const TEAM_ROLES = new Set(['Admin', 'Editor', 'Viewer']);

app.use(cors({
  origin: ALLOWED_ORIGIN,
  credentials: true,
}));

app.post(['/cashfree/webhook', '/api/cashfree/webhook'], express.raw({ type: '*/*' }), async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    const rawBody = req.body?.toString('utf8') || '';

    if (!signature || !timestamp || !CASHFREE_SECRET_KEY) {
      return res.status(400).json({ message: 'Invalid webhook headers' });
    }

    const signedPayload = `${timestamp}${rawBody}`;
    const expectedHex = crypto
      .createHmac('sha256', CASHFREE_SECRET_KEY)
      .update(signedPayload)
      .digest('hex');

    const expectedBase64 = crypto
      .createHmac('sha256', CASHFREE_SECRET_KEY)
      .update(signedPayload)
      .digest('base64');

    const incoming = String(signature);
    if (incoming !== expectedHex && incoming !== expectedBase64) {
      return res.status(401).json({ message: 'Invalid webhook signature' });
    }

    const body = JSON.parse(rawBody || '{}');
    const orderId = body?.data?.order?.order_id;
    const orderStatus = body?.data?.order?.order_status;
    const paymentStatus = body?.data?.payment?.payment_status;

    if (orderId && pendingOrders.has(orderId)) {
      const saved = pendingOrders.get(orderId);
      saved.status = orderStatus || saved.status;
      saved.paymentStatus = paymentStatus || saved.paymentStatus;
      pendingOrders.set(orderId, saved);
    }

    const refundSnapshot = extractRefundWebhookSnapshot(body);
    if (refundSnapshot) {
      const webhookEvent = String(body?.type || body?.event || body?.event_type || '').trim().toUpperCase() || 'UNKNOWN';
      const refundRecord = upsertRefundLedgerRecord({
        ...refundSnapshot,
        webhookEvent,
        source: 'cashfree_webhook',
        lastUpdatedAt: new Date().toISOString(),
        rawWebhook: body,
      });

      if (refundRecord) {
        await upsertRefundRecordInSupabase(refundRecord).catch((error) => {
          console.warn('[cashfree/webhook] unable to sync refund record to Supabase:', error?.message || error);
        });

        if (refundRecord.orderId) {
          await syncUserPaymentRefundStateInSupabase(refundRecord.orderId, refundRecord).catch((error) => {
            console.warn('[cashfree/webhook] unable to sync user payment refund state:', error?.message || error);
          });
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('[cashfree/webhook]', error);
    return res.status(500).json({ message: 'Webhook processing failed' });
  }
});

app.use(express.json({ limit: '1mb' }));

app.use((err, _req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }
  return next(err);
});

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

function isRateLimited(ip, routeKey) {
  const key = `${ip}:${routeKey}`;
  const now = Date.now();
  const windowMs = 60_000;
  const maxRequests = 30;

  const entries = requestWindow.get(key) || [];
  const recent = entries.filter((t) => now - t < windowMs);
  recent.push(now);
  requestWindow.set(key, recent);

  return recent.length > maxRequests;
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function isValidEmail(value) {
  return /^\S+@\S+\.\S+$/.test(String(value || '').trim());
}

function normalizeRefundStatus(value) {
  const normalized = String(value || '').trim().toUpperCase();
  if (!normalized) return 'PENDING';
  if (normalized === 'SUCCESSFUL') return 'SUCCESS';
  if (normalized === 'CANCEL') return 'CANCELLED';
  return normalized;
}

function normalizeRefundSpeed(value) {
  const normalized = String(value || '').trim().toUpperCase();
  if (REFUND_SPEEDS.has(normalized)) {
    return normalized;
  }

  if (REFUND_SPEEDS.has(CASHFREE_DEFAULT_REFUND_SPEED)) {
    return CASHFREE_DEFAULT_REFUND_SPEED;
  }

  return 'STANDARD';
}

function normalizeRefundId(value) {
  return String(value || '')
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 40);
}

function generateRefundId(seed = '') {
  const safeSeed = normalizeRefundId(seed).slice(-8);
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(8).toString('hex').toUpperCase();
  return normalizeRefundId(`${safeSeed}${timestamp}${random}`).slice(0, 40);
}

function parseAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return null;
  if (amount <= 0) return null;
  return Number(amount.toFixed(2));
}

function resolveRefundEntity(body) {
  const orderId = String(body?.orderId || '').trim();
  const subscriptionId = String(body?.subscriptionId || '').trim();
  const explicitEntity = String(body?.entityType || '').trim().toLowerCase();

  if (explicitEntity === 'subscription' || (!orderId && subscriptionId)) {
    return {
      entityType: 'subscription',
      entityId: subscriptionId,
      orderId,
      subscriptionId,
    };
  }

  return {
    entityType: 'order',
    entityId: orderId,
    orderId,
    subscriptionId,
  };
}

function buildRefundEntityKey(entityType, entityId) {
  return `${entityType}:${entityId}`;
}

function upsertRefundLedgerRecord(partialRecord) {
  const refundId = normalizeRefundId(partialRecord?.refundId);
  if (!refundId) return null;

  const existing = refundsByRefundId.get(refundId) || {};
  const nowIso = new Date().toISOString();
  const entityType = partialRecord?.entityType === 'subscription' ? 'subscription' : 'order';

  const record = {
    refundId,
    cashfreeRefundId: String(partialRecord?.cashfreeRefundId || existing.cashfreeRefundId || '').trim() || null,
    entityType,
    entityId: String(partialRecord?.entityId || existing.entityId || '').trim(),
    orderId: String(partialRecord?.orderId || existing.orderId || '').trim() || null,
    subscriptionId: String(partialRecord?.subscriptionId || existing.subscriptionId || '').trim() || null,
    paymentId: String(partialRecord?.paymentId || existing.paymentId || '').trim() || null,
    refundAmount: Number.isFinite(Number(partialRecord?.refundAmount))
      ? Number(partialRecord.refundAmount)
      : Number.isFinite(Number(existing.refundAmount))
        ? Number(existing.refundAmount)
        : null,
    refundSpeed: normalizeRefundSpeed(partialRecord?.refundSpeed || existing.refundSpeed),
    refundStatus: normalizeRefundStatus(partialRecord?.refundStatus || existing.refundStatus),
    refundNote: String(partialRecord?.refundNote || existing.refundNote || '').trim() || null,
    reason: String(partialRecord?.reason || existing.reason || '').trim() || null,
    liquidityState: String(partialRecord?.liquidityState || existing.liquidityState || '').trim() || null,
    bankReference: String(partialRecord?.bankReference || existing.bankReference || '').trim() || null,
    source: String(partialRecord?.source || existing.source || 'merchant_api').trim(),
    requestedAt: String(partialRecord?.requestedAt || existing.requestedAt || nowIso),
    lastUpdatedAt: String(partialRecord?.lastUpdatedAt || nowIso),
    webhookEvent: String(partialRecord?.webhookEvent || existing.webhookEvent || '').trim() || null,
    rawResponse: partialRecord?.rawResponse ?? existing.rawResponse ?? null,
    rawWebhook: partialRecord?.rawWebhook ?? existing.rawWebhook ?? null,
  };

  if (!record.entityId) {
    record.entityId = record.entityType === 'subscription'
      ? String(record.subscriptionId || '').trim()
      : String(record.orderId || '').trim();
  }

  refundsByRefundId.set(refundId, record);

  if (record.entityId) {
    const entityKey = buildRefundEntityKey(record.entityType, record.entityId);
    const ids = refundIdsByEntity.get(entityKey) || [];
    if (!ids.includes(refundId)) {
      ids.unshift(refundId);
    }
    refundIdsByEntity.set(entityKey, ids.slice(0, 100));
  }

  return record;
}

function listRefundLedgerRecords(entityType, entityId) {
  const key = buildRefundEntityKey(entityType, entityId);
  const ids = refundIdsByEntity.get(key) || [];

  return ids
    .map((refundId) => refundsByRefundId.get(refundId))
    .filter(Boolean)
    .sort((left, right) => new Date(right.lastUpdatedAt).getTime() - new Date(left.lastUpdatedAt).getTime());
}

function mapRefundStatusToUserPaymentStatus(refundStatus) {
  const normalized = normalizeRefundStatus(refundStatus);

  if (SETTLED_REFUND_STATUSES.has(normalized)) {
    return 'refunded';
  }

  if (FAILED_REFUND_STATUSES.has(normalized)) {
    return 'success';
  }

  if (PENDING_REFUND_STATUSES.has(normalized)) {
    return 'refund_requested';
  }

  return 'refund_requested';
}

const hasSupabaseAdminConfig = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

async function supabaseRestRequest(pathname, options = {}) {
  if (!hasSupabaseAdminConfig) {
    return null;
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1${pathname}`, {
    method: options.method || 'GET',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.prefer ? { Prefer: options.prefer } : {}),
      ...(options.headers || {}),
    },
    body: typeof options.body === 'undefined' ? undefined : JSON.stringify(options.body),
  });

  const contentType = String(response.headers.get('content-type') || '').toLowerCase();
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => ({}))
    : await response.text().catch(() => '');

  if (!response.ok) {
    const message = payload?.message || payload?.error || response.statusText || 'Supabase request failed';
    const error = new Error(message);
    error.statusCode = response.status;
    error.details = payload;
    throw error;
  }

  return payload;
}

function toSupabaseRefundAmountPaise(amountRupees) {
  if (!Number.isFinite(Number(amountRupees))) return null;
  return Math.max(0, Math.round(Number(amountRupees) * 100));
}

function toSupabaseRefundRow(record) {
  return {
    refund_id: record.refundId,
    cashfree_refund_id: record.cashfreeRefundId,
    entity_type: record.entityType,
    entity_id: record.entityId,
    order_id: record.orderId,
    subscription_id: record.subscriptionId,
    payment_id: record.paymentId,
    refund_amount: toSupabaseRefundAmountPaise(record.refundAmount),
    refund_speed: record.refundSpeed,
    refund_status: record.refundStatus,
    liquidity_state: record.liquidityState,
    bank_reference: record.bankReference,
    reason: record.reason,
    refund_note: record.refundNote,
    source: record.source,
    requested_at: record.requestedAt,
    last_updated_at: record.lastUpdatedAt,
    webhook_event: record.webhookEvent,
    raw_response: record.rawResponse,
    raw_webhook: record.rawWebhook,
  };
}

async function upsertRefundRecordInSupabase(record) {
  if (!hasSupabaseAdminConfig || !record) {
    return;
  }

  const row = toSupabaseRefundRow(record);
  await supabaseRestRequest(`/${SUPABASE_REFUNDS_TABLE}?on_conflict=refund_id`, {
    method: 'POST',
    body: [row],
    prefer: 'resolution=merge-duplicates,return=minimal',
  });
}

async function syncUserPaymentRefundStateInSupabase(orderId, refundRecord) {
  if (!hasSupabaseAdminConfig || !orderId || !refundRecord) {
    return;
  }

  const nowIso = new Date().toISOString();
  const normalizedRefundStatus = normalizeRefundStatus(refundRecord.refundStatus);
  const paymentStatus = mapRefundStatusToUserPaymentStatus(normalizedRefundStatus);

  const payload = {
    status: paymentStatus,
    updated_at: nowIso,
    refund_status: normalizedRefundStatus,
    refund_id: refundRecord.refundId || null,
    refund_amount: toSupabaseRefundAmountPaise(refundRecord.refundAmount),
    refund_note: refundRecord.refundNote || null,
    refund_reason: refundRecord.reason || null,
  };

  if (paymentStatus === 'refunded') {
    payload.refund_requested_at = refundRecord.requestedAt || nowIso;
    payload.refund_completed_at = nowIso;
  } else if (paymentStatus === 'refund_requested') {
    payload.refund_requested_at = refundRecord.requestedAt || nowIso;
    payload.refund_completed_at = null;
  } else {
    payload.refund_requested_at = null;
    payload.refund_completed_at = null;
  }

  await supabaseRestRequest(`/${SUPABASE_USER_PAYMENTS_TABLE}?cashfree_order_id=eq.${encodeURIComponent(orderId)}`, {
    method: 'PATCH',
    body: payload,
    prefer: 'return=minimal',
  });
}

function extractRefundWebhookSnapshot(body) {
  const data = body?.data || {};
  const refundNode = data?.refund || data?.refund_details || body?.refund || {};
  const orderNode = data?.order || body?.order || {};
  const subscriptionNode = data?.subscription || body?.subscription || {};
  const paymentNode = data?.payment || body?.payment || {};

  const merchantRefundId = normalizeRefundId(refundNode?.refund_id || body?.refund_id);
  const cashfreeRefundId = String(refundNode?.cf_refund_id || body?.cf_refund_id || '').trim() || null;
  const fallbackRefundId = merchantRefundId || normalizeRefundId(cashfreeRefundId);
  if (!fallbackRefundId) {
    return null;
  }

  const orderId = String(orderNode?.order_id || refundNode?.order_id || body?.order_id || '').trim() || null;
  const subscriptionId = String(
    subscriptionNode?.subscription_id ||
    refundNode?.subscription_id ||
    body?.subscription_id ||
    ''
  ).trim() || null;

  const entityType = subscriptionId ? 'subscription' : 'order';
  const entityId = subscriptionId || orderId;
  if (!entityId) {
    return null;
  }

  const webhookEvent = String(body?.type || body?.event || body?.event_type || body?.name || '').trim().toUpperCase() || null;
  const refundStatus = normalizeRefundStatus(refundNode?.refund_status || body?.refund_status || body?.status);

  return {
    refundId: fallbackRefundId,
    cashfreeRefundId,
    entityType,
    entityId,
    orderId,
    subscriptionId,
    paymentId: String(paymentNode?.cf_payment_id || paymentNode?.payment_id || body?.payment_id || '').trim() || null,
    refundAmount: parseAmount(refundNode?.refund_amount ?? body?.refund_amount),
    refundSpeed: normalizeRefundSpeed(refundNode?.refund_speed || body?.refund_speed),
    refundStatus,
    liquidityState: refundStatus === 'ONHOLD' ? 'ONHOLD' : 'AVAILABLE',
    refundNote: String(refundNode?.refund_note || body?.refund_note || '').trim() || null,
    reason: String(refundNode?.reason || body?.reason || '').trim() || null,
    bankReference: String(refundNode?.bank_reference || refundNode?.utr || body?.bank_reference || body?.utr || '').trim() || null,
    webhookEvent,
    source: 'cashfree_webhook',
    lastUpdatedAt: new Date().toISOString(),
    rawWebhook: body,
  };
}

function normalizeDisplayName(value, fallback = 'User') {
  return String(value || '').trim() || fallback;
}

function normalizeRole(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'admin') return 'Admin';
  if (normalized === 'editor') return 'Editor';
  return 'Viewer';
}

function generateTeamInvitationId() {
  return `tinv_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

function generateTeamInvitationToken() {
  return crypto.randomBytes(24).toString('hex');
}

function buildTeamInviteAcceptUrl(token) {
  return `${TEAM_INVITE_BASE_URL}/dashboard/team-invite?token=${encodeURIComponent(token)}`;
}

function isTeamInviteExpired(record, now = Date.now()) {
  const expiresAtTs = new Date(record?.expiresAt || '').getTime();
  if (!Number.isFinite(expiresAtTs)) return false;
  return expiresAtTs <= now;
}

function hydrateTeamInviteStatus(record) {
  if (!record) return null;

  if (record.status === 'pending' && isTeamInviteExpired(record)) {
    record.status = 'expired';
  }

  return record;
}

function sanitizeTeamInvites() {
  const now = Date.now();
  const maxRetentionMs = 14 * 24 * 60 * 60 * 1000;

  for (const [inviteId, record] of teamInvitationsById.entries()) {
    hydrateTeamInviteStatus(record);

    const invitedAtTs = new Date(record?.invitedAt || '').getTime();
    const shouldPrune = Number.isFinite(invitedAtTs) ? now - invitedAtTs > maxRetentionMs : false;

    if (shouldPrune) {
      teamInvitationsById.delete(inviteId);
      teamInvitationIdByToken.delete(record.token);
    }
  }
}

function toPublicTeamInviteRecord(record) {
  const safeRecord = hydrateTeamInviteStatus(record);
  if (!safeRecord) return null;

  return {
    id: safeRecord.id,
    ownerUserId: safeRecord.ownerUserId,
    ownerEmail: safeRecord.ownerEmail,
    ownerName: safeRecord.ownerName,
    memberEmail: safeRecord.memberEmail,
    memberName: safeRecord.memberName,
    role: safeRecord.role,
    status: safeRecord.status,
    invitedAt: safeRecord.invitedAt,
    expiresAt: safeRecord.expiresAt,
    acceptedAt: safeRecord.acceptedAt || undefined,
    memberUserId: safeRecord.memberUserId || undefined,
  };
}

function findTeamInviteByToken(token) {
  const invitationId = teamInvitationIdByToken.get(token);
  if (!invitationId) return null;
  const record = teamInvitationsById.get(invitationId);
  return hydrateTeamInviteStatus(record);
}

function saveTeamInvite(record) {
  teamInvitationsById.set(record.id, record);
  teamInvitationIdByToken.set(record.token, record.id);
  return record;
}

async function sendTeamInviteEmail({ toEmail, toName, ownerName, ownerEmail, role, acceptUrl }) {
  if (TEAM_ACCESS_EMAIL_PROVIDER !== 'resend' || !RESEND_API_KEY) {
    return { delivery: 'preview' };
  }

  const subject = `${ownerName} invited you to collaborate on Volosist dashboard`;
  const html = [
    '<div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">',
    `<p>Hi ${toName},</p>`,
    `<p><strong>${ownerName}</strong> (${ownerEmail}) invited you to collaborate on the Volosist dashboard as <strong>${role}</strong>.</p>`,
    '<p>Use the button below to accept access:</p>',
    `<p><a href="${acceptUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-weight: 700;">Accept Team Access</a></p>`,
    `<p>If the button does not work, open this link directly:<br /><a href="${acceptUrl}">${acceptUrl}</a></p>`,
    `<p>This invite expires automatically after ${TEAM_INVITE_EXPIRY_HOURS} hours.</p>`,
    '<p>Thanks,<br />Volosist Team</p>',
    '</div>',
  ].join('');

  const text = [
    `Hi ${toName},`,
    `${ownerName} (${ownerEmail}) invited you to collaborate on the Volosist dashboard as ${role}.`,
    `Accept access: ${acceptUrl}`,
    `This invite expires automatically after ${TEAM_INVITE_EXPIRY_HOURS} hours.`,
    'Thanks,',
    'Volosist Team',
  ].join('\n\n');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: TEAM_ACCESS_FROM_EMAIL,
      to: [toEmail],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = body?.message || body?.error || 'Failed to send invite email';
    throw new Error(message);
  }

  return { delivery: 'sent' };
}

function validateCreateOrderPayload(body) {
  const required = ['orderId', 'currency', 'customerName', 'customerEmail', 'customerPhone', 'planId', 'planName', 'returnUrl'];
  for (const field of required) {
    if (!body?.[field]) {
      return `Missing required field: ${field}`;
    }
  }

  if (body.currency !== 'INR') {
    return 'Only INR currency is currently supported';
  }

  if (!/^\S+@\S+\.\S+$/.test(body.customerEmail)) {
    return 'Invalid customer email';
  }

  if (!/^\d{10,15}$/.test(String(body.customerPhone).replace(/\D/g, ''))) {
    return 'Invalid customer phone';
  }

  try {
    const parsed = new URL(body.returnUrl);
    if (!/^https?:$/.test(parsed.protocol)) {
      return 'Invalid returnUrl protocol';
    }
  } catch {
    return 'Invalid returnUrl';
  }

  return null;
}

function validateRefundPayload(body) {
  const { entityType, orderId, subscriptionId } = resolveRefundEntity(body);

  if (entityType === 'subscription' && !subscriptionId) {
    return 'Missing required field: subscriptionId';
  }

  if (entityType === 'order' && !orderId) {
    return 'Missing required field: orderId';
  }

  const reason = String(body?.reason || '').trim();
  if (reason.length < 5) {
    return 'Refund reason is required (minimum 5 characters)';
  }

  if (typeof body?.refundAmount !== 'undefined') {
    const requestedAmount = parseAmount(body.refundAmount);
    if (!requestedAmount) {
      return 'Invalid refund amount';
    }
  } else if (entityType === 'subscription') {
    return 'refundAmount is required for subscription refunds';
  }

  const refundId = String(body?.refundId || '').trim();
  if (refundId && !/^[A-Za-z0-9]{3,40}$/.test(refundId)) {
    return 'refundId must be alphanumeric and between 3 to 40 characters';
  }

  const refundSpeed = String(body?.refundSpeed || '').trim().toUpperCase();
  if (refundSpeed && !REFUND_SPEEDS.has(refundSpeed)) {
    return 'refundSpeed must be either STANDARD or INSTANT';
  }

  return null;
}

function computeOrderTotals(body) {
  const cartItems = Array.isArray(body?.cartItems) ? body.cartItems : [];

  if (cartItems.length > 0) {
    let subtotal = 0;

    for (const item of cartItems) {
      const serviceId = String(item?.serviceId || '').trim();
      const planName = String(item?.plan || '').trim();
      const servicePlans = SERVICE_CATALOG[serviceId];
      const planEntry = servicePlans
        ? Object.entries(servicePlans).find(([key]) => key.toLowerCase() === planName.toLowerCase())
        : null;
      if (!servicePlans || !planEntry) {
        throw new Error(`Invalid cart item pricing reference: ${serviceId} (${planName})`);
      }
      const quantityRaw = Number(item?.quantity ?? 1);
      const quantity = Number.isFinite(quantityRaw) && quantityRaw > 0 ? Math.floor(quantityRaw) : 1;
      subtotal += Number(planEntry[1]) * quantity;
    }

    const tax = Number((subtotal * GST_RATE).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));

    return { subtotal, tax, total };
  }

  const legacy = LEGACY_PLAN_PRICING[String(body?.planId || '').trim()];
  if (!legacy) {
    throw new Error('Unsupported plan id. Unable to compute amount on server.');
  }

  const subtotal = Number(legacy.subtotal.toFixed(2));
  const tax = Number((subtotal * GST_RATE).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  return { subtotal, tax, total };
}

async function cashfreeRequest(path, options = {}) {
  if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
    throw new Error('Missing CASHFREE_APP_ID or CASHFREE_SECRET_KEY on server');
  }

  const response = await fetch(`${CASHFREE_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': CASHFREE_APP_ID,
      'x-client-secret': CASHFREE_SECRET_KEY,
      'x-api-version': CASHFREE_API_VERSION,
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message || data?.error || 'Cashfree API request failed';
    const err = new Error(message);
    err.statusCode = response.status;
    err.details = data;
    throw err;
  }

  return data;
}

app.get(['/health', '/api/health'], (_req, res) => {
  res.json({
    ok: true,
    env: CASHFREE_ENV,
    cashfreeConfigured: Boolean(CASHFREE_APP_ID && CASHFREE_SECRET_KEY),
  });
});

app.post(['/cashfree/create-order', '/api/cashfree/create-order'], async (req, res) => {
  const ip = getClientIp(req);
  if (isRateLimited(ip, 'create-order')) {
    return res.status(429).json({ message: 'Too many requests. Please try again shortly.' });
  }

  const validationError = validateCreateOrderPayload(req.body);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const { subtotal, tax, total } = computeOrderTotals(req.body);
    const normalizedPhone = String(req.body.customerPhone).replace(/\D/g, '');

    const cfOrderPayload = {
      order_id: req.body.orderId,
      order_amount: total,
      order_currency: req.body.currency,
      customer_details: {
        customer_id: `cust_${normalizedPhone.slice(-10)}`,
        customer_name: req.body.customerName,
        customer_email: req.body.customerEmail,
        customer_phone: normalizedPhone,
      },
      order_meta: {
        return_url: req.body.returnUrl,
        notify_url: CASHFREE_WEBHOOK_URL,
      },
      order_note: `${req.body.planName} (${req.body.planId})`,
    };

    const cfResponse = await cashfreeRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(cfOrderPayload),
    });

    let paymentLink = cfResponse.payment_link || cfResponse?.order_meta?.payment_link || null;
    if (!paymentLink && cfResponse?.order_id) {
      const orderDetails = await cashfreeRequest(`/orders/${cfResponse.order_id}`, { method: 'GET' }).catch(() => null);
      paymentLink = orderDetails?.payment_link || orderDetails?.order_meta?.payment_link || null;
    }

    pendingOrders.set(req.body.orderId, {
      subtotal,
      tax,
      amount: total,
      currency: req.body.currency,
      planId: req.body.planId,
      planName: req.body.planName,
      email: req.body.customerEmail,
      createdAt: Date.now(),
      status: 'ACTIVE',
    });

    return res.status(200).json({
      order_id: cfResponse.order_id,
      payment_session_id: cfResponse.payment_session_id,
      order_status: cfResponse.order_status,
      order_amount: total,
      subtotal,
      tax,
      payment_link: paymentLink,
    });
  } catch (error) {
    console.error('[cashfree/create-order]', error);
    return res.status(error.statusCode || 500).json({
      message: error.message || 'Failed to create Cashfree order',
      details: error.details || null,
    });
  }
});

app.get(['/cashfree/verify-order/:orderId', '/api/cashfree/verify-order/:orderId'], async (req, res) => {
  const ip = getClientIp(req);
  if (isRateLimited(ip, 'verify-order')) {
    return res.status(429).json({ message: 'Too many requests. Please try again shortly.' });
  }

  const { orderId } = req.params;
  if (!orderId) {
    return res.status(400).json({ message: 'Missing order id' });
  }

  try {
    const order = await cashfreeRequest(`/orders/${orderId}`, { method: 'GET' });
    const payments = await cashfreeRequest(`/orders/${orderId}/payments`, { method: 'GET' }).catch(() => []);

    const lastPayment = Array.isArray(payments) && payments.length > 0 ? payments[payments.length - 1] : null;
    const saved = pendingOrders.get(orderId);

    if (saved) {
      const amountMatches = Number(order.order_amount) === Number(saved.amount);
      const currencyMatches = order.order_currency === saved.currency;

      if (!amountMatches || !currencyMatches) {
        return res.status(409).json({
          message: 'Order amount/currency mismatch detected',
          order_id: orderId,
          order_status: order.order_status,
        });
      }

      saved.status = order.order_status;
      pendingOrders.set(orderId, saved);
    }

    return res.status(200).json({
      order_id: order.order_id,
      order_status: order.order_status,
      order_amount: order.order_amount,
      order_currency: order.order_currency,
      payment_id: lastPayment?.cf_payment_id,
      payment_status: lastPayment?.payment_status,
    });
  } catch (error) {
    console.error('[cashfree/verify-order]', error);
    return res.status(error.statusCode || 500).json({
      message: error.message || 'Failed to verify order',
      details: error.details || null,
    });
  }
});

app.post(['/cashfree/refund-order', '/api/cashfree/refund-order'], async (req, res) => {
  const ip = getClientIp(req);
  if (isRateLimited(ip, 'refund-order')) {
    return res.status(429).json({ message: 'Too many requests. Please try again shortly.' });
  }

  const validationError = validateRefundPayload(req.body);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const { entityType, entityId, orderId, subscriptionId } = resolveRefundEntity(req.body);
    const normalizedReason = String(req.body.reason || '').trim();
    const refundSpeed = normalizeRefundSpeed(req.body.refundSpeed);
    const providedRefundId = normalizeRefundId(req.body.refundId);
    const generatedRefundId = providedRefundId || generateRefundId(entityId);

    let paymentId = null;
    let referenceAmount =
      typeof req.body.refundAmount !== 'undefined'
        ? parseAmount(req.body.refundAmount)
        : null;

    if (entityType === 'order') {
      const order = await cashfreeRequest(`/orders/${orderId}`, { method: 'GET' });
      const payments = await cashfreeRequest(`/orders/${orderId}/payments`, { method: 'GET' }).catch(() => []);

      const orderStatus = String(order?.order_status || '').toUpperCase();
      if (orderStatus !== 'PAID') {
        return res.status(409).json({
          message: `Refund can be processed only for paid orders. Current order status: ${order?.order_status || 'UNKNOWN'}`,
        });
      }

      const successfulPayment = Array.isArray(payments)
        ? [...payments].reverse().find((payment) => String(payment?.payment_status || '').toUpperCase() === 'SUCCESS')
        : null;

      if (!successfulPayment) {
        return res.status(409).json({
          message: 'Refund can be processed only after a successful payment capture.',
        });
      }

      paymentId = successfulPayment?.cf_payment_id || successfulPayment?.payment_id || null;

      const paidAmount = parseAmount(order?.order_amount);
      if (!paidAmount) {
        throw new Error('Unable to determine paid order amount for refund.');
      }

      if (!referenceAmount) {
        referenceAmount = paidAmount;
      }

      if (referenceAmount > paidAmount) {
        return res.status(400).json({
          message: `refundAmount cannot exceed captured amount ${paidAmount}.`,
        });
      }
    }

    if (!referenceAmount) {
      return res.status(400).json({ message: 'refundAmount is required and must be greater than zero.' });
    }

    const refundPayload = {
      refund_amount: referenceAmount,
      refund_id: generatedRefundId,
      refund_note: normalizedReason.slice(0, 180),
      refund_speed: refundSpeed,
    };

    const cashfreeRefundPath = entityType === 'subscription'
      ? `/subscriptions/${subscriptionId}/refunds`
      : `/orders/${orderId}/refunds`;

    const refundResponse = await cashfreeRequest(cashfreeRefundPath, {
      method: 'POST',
      body: JSON.stringify(refundPayload),
    });

    const cashfreeRefundId = String(refundResponse?.cf_refund_id || refundResponse?.cf_refundId || '').trim() || null;
    const refundStatus = normalizeRefundStatus(refundResponse?.refund_status || refundResponse?.status || 'PENDING');
    const refundAmount = parseAmount(refundResponse?.refund_amount) || referenceAmount;
    const bankReference =
      refundResponse?.bank_reference ||
      refundResponse?.utr ||
      refundResponse?.reference_id ||
      null;
    const liquidityState = refundStatus === 'ONHOLD' ? 'ONHOLD' : 'AVAILABLE';

    const savedOrder = pendingOrders.get(orderId);
    if (orderId && savedOrder) {
      savedOrder.refundId = refundResponse?.refund_id || generatedRefundId;
      savedOrder.refundStatus = refundStatus;
      savedOrder.refundAmount = refundAmount;
      pendingOrders.set(orderId, savedOrder);
    }

    const refundRecord = upsertRefundLedgerRecord({
      refundId: normalizeRefundId(refundResponse?.refund_id || generatedRefundId),
      cashfreeRefundId,
      entityType,
      entityId,
      orderId: orderId || null,
      subscriptionId: subscriptionId || null,
      paymentId,
      refundAmount,
      refundSpeed,
      refundStatus,
      refundNote: normalizedReason.slice(0, 180),
      reason: normalizedReason,
      liquidityState,
      bankReference,
      source: 'merchant_api',
      requestedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      rawResponse: refundResponse,
    });

    if (refundRecord) {
      await upsertRefundRecordInSupabase(refundRecord).catch((error) => {
        console.warn('[cashfree/refund-order] unable to persist refund record to Supabase:', error?.message || error);
      });

      if (orderId) {
        await syncUserPaymentRefundStateInSupabase(orderId, refundRecord).catch((error) => {
          console.warn('[cashfree/refund-order] unable to sync user payment refund state:', error?.message || error);
        });
      }
    }

    return res.status(200).json({
      entity_type: entityType,
      entity_id: entityId,
      order_id: orderId || null,
      subscription_id: subscriptionId || null,
      payment_id: paymentId,
      refund_id: refundResponse?.refund_id || generatedRefundId,
      cf_refund_id: cashfreeRefundId,
      refund_status: refundStatus,
      refund_speed: refundSpeed,
      liquidity_state: liquidityState,
      refund_amount: refundAmount,
      bank_reference: bankReference,
      raw: refundResponse,
    });
  } catch (error) {
    console.error('[cashfree/refund-order]', error);
    return res.status(error.statusCode || 500).json({
      message: error.message || 'Failed to process refund',
      details: error.details || null,
    });
  }
});

app.get(['/cashfree/refunds', '/api/cashfree/refunds'], (req, res) => {
  const refundId = normalizeRefundId(req.query?.refundId);
  if (refundId) {
    const record = refundsByRefundId.get(refundId);
    if (!record) {
      return res.status(404).json({ message: 'Refund record not found.' });
    }

    return res.status(200).json({ refund: record });
  }

  const orderId = String(req.query?.orderId || '').trim();
  const subscriptionId = String(req.query?.subscriptionId || '').trim();

  if (!orderId && !subscriptionId) {
    return res.status(400).json({ message: 'Provide refundId, orderId, or subscriptionId.' });
  }

  const entityType = subscriptionId ? 'subscription' : 'order';
  const entityId = subscriptionId || orderId;
  const refunds = listRefundLedgerRecords(entityType, entityId);
  return res.status(200).json({ refunds });
});

app.post(['/team-access/invite', '/api/team-access/invite'], async (req, res) => {
  const ip = getClientIp(req);
  if (isRateLimited(ip, 'team-invite-create')) {
    return res.status(429).json({ message: 'Too many requests. Please try again shortly.' });
  }

  sanitizeTeamInvites();

  const ownerUserId = String(req.body?.ownerUserId || '').trim();
  const ownerEmail = normalizeEmail(req.body?.ownerEmail);
  const ownerName = normalizeDisplayName(req.body?.ownerName, ownerEmail.split('@')[0] || 'Owner');
  const memberEmail = normalizeEmail(req.body?.memberEmail);
  const memberName = normalizeDisplayName(req.body?.memberName, memberEmail.split('@')[0] || 'Team Member');
  const role = normalizeRole(req.body?.role);

  if (!ownerUserId || !ownerEmail || !memberEmail) {
    return res.status(400).json({ message: 'ownerUserId, ownerEmail, and memberEmail are required.' });
  }

  if (!isValidEmail(ownerEmail) || !isValidEmail(memberEmail)) {
    return res.status(400).json({ message: 'A valid owner and member email are required.' });
  }

  if (!TEAM_ROLES.has(role)) {
    return res.status(400).json({ message: 'Invalid role. Allowed roles are Admin, Editor, Viewer.' });
  }

  if (ownerEmail === memberEmail) {
    return res.status(400).json({ message: 'You cannot invite your own account as a team member.' });
  }

  const existingRecord = Array.from(teamInvitationsById.values())
    .map((record) => hydrateTeamInviteStatus(record))
    .find((record) =>
      record &&
      record.ownerUserId === ownerUserId &&
      normalizeEmail(record.memberEmail) === memberEmail &&
      (record.status === 'pending' || record.status === 'active')
    );

  if (existingRecord?.status === 'active') {
    return res.status(409).json({ message: 'This member already has active access.' });
  }

  const nowIso = new Date().toISOString();
  const expiresAtIso = new Date(Date.now() + TEAM_INVITE_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

  let invitationRecord;
  if (existingRecord) {
    teamInvitationIdByToken.delete(existingRecord.token);
    existingRecord.token = generateTeamInvitationToken();
    existingRecord.ownerName = ownerName;
    existingRecord.memberName = memberName;
    existingRecord.role = role;
    existingRecord.status = 'pending';
    existingRecord.invitedAt = nowIso;
    existingRecord.expiresAt = expiresAtIso;
    existingRecord.acceptedAt = null;
    existingRecord.memberUserId = null;
    invitationRecord = saveTeamInvite(existingRecord);
  } else {
    invitationRecord = saveTeamInvite({
      id: generateTeamInvitationId(),
      token: generateTeamInvitationToken(),
      ownerUserId,
      ownerEmail,
      ownerName,
      memberEmail,
      memberName,
      role,
      status: 'pending',
      invitedAt: nowIso,
      expiresAt: expiresAtIso,
      acceptedAt: null,
      memberUserId: null,
    });
  }

  const acceptUrl = buildTeamInviteAcceptUrl(invitationRecord.token);
  let delivery = 'preview';

  try {
    const result = await sendTeamInviteEmail({
      toEmail: memberEmail,
      toName: memberName,
      ownerName,
      ownerEmail,
      role,
      acceptUrl,
    });

    delivery = result.delivery === 'sent' ? 'sent' : 'preview';
  } catch (error) {
    console.warn('[team-access/invite] email delivery failed, falling back to preview mode:', error);
    delivery = 'preview';
  }

  return res.status(200).json({
    invitation: toPublicTeamInviteRecord(invitationRecord),
    acceptUrl,
    delivery,
  });
});

app.get(['/team-access/members/:ownerUserId', '/api/team-access/members/:ownerUserId'], (req, res) => {
  const ip = getClientIp(req);
  if (isRateLimited(ip, 'team-members-list')) {
    return res.status(429).json({ message: 'Too many requests. Please try again shortly.' });
  }

  sanitizeTeamInvites();

  const ownerUserId = String(req.params?.ownerUserId || '').trim();
  const ownerEmail = normalizeEmail(req.query?.ownerEmail);

  if (!ownerUserId) {
    return res.status(400).json({ message: 'ownerUserId is required.' });
  }

  const members = Array.from(teamInvitationsById.values())
    .map((record) => hydrateTeamInviteStatus(record))
    .filter((record) => {
      if (!record) return false;
      if (record.ownerUserId === ownerUserId) return true;
      if (ownerEmail && record.ownerEmail === ownerEmail) return true;
      return false;
    })
    .sort((a, b) => new Date(b.invitedAt).getTime() - new Date(a.invitedAt).getTime())
    .map((record) => toPublicTeamInviteRecord(record));

  return res.status(200).json({ members });
});

app.get(['/team-access/invite/:token', '/api/team-access/invite/:token'], (req, res) => {
  const ip = getClientIp(req);
  if (isRateLimited(ip, 'team-invite-details')) {
    return res.status(429).json({ message: 'Too many requests. Please try again shortly.' });
  }

  sanitizeTeamInvites();

  const token = String(req.params?.token || '').trim();
  if (!token) {
    return res.status(400).json({ message: 'Invite token is required.' });
  }

  const invitationRecord = findTeamInviteByToken(token);
  if (!invitationRecord) {
    return res.status(404).json({ message: 'Invitation not found or already invalid.' });
  }

  return res.status(200).json({
    invitation: toPublicTeamInviteRecord(invitationRecord),
    acceptUrl: buildTeamInviteAcceptUrl(token),
  });
});

app.post(['/team-access/invite/:token/accept', '/api/team-access/invite/:token/accept'], (req, res) => {
  const ip = getClientIp(req);
  if (isRateLimited(ip, 'team-invite-accept')) {
    return res.status(429).json({ message: 'Too many requests. Please try again shortly.' });
  }

  sanitizeTeamInvites();

  const token = String(req.params?.token || '').trim();
  if (!token) {
    return res.status(400).json({ message: 'Invite token is required.' });
  }

  const invitationRecord = findTeamInviteByToken(token);
  if (!invitationRecord) {
    return res.status(404).json({ message: 'Invitation not found or already invalid.' });
  }

  if (invitationRecord.status === 'revoked') {
    return res.status(410).json({ message: 'This invitation has been revoked by the owner.' });
  }

  if (invitationRecord.status === 'expired') {
    return res.status(410).json({ message: 'This invitation has expired. Ask the owner for a new invite.' });
  }

  const memberUserId = String(req.body?.memberUserId || '').trim();
  const memberEmail = normalizeEmail(req.body?.memberEmail);
  const memberName = normalizeDisplayName(req.body?.memberName, invitationRecord.memberName || memberEmail.split('@')[0] || 'Team Member');

  if (!memberUserId || !memberEmail) {
    return res.status(400).json({ message: 'memberUserId and memberEmail are required to accept invite.' });
  }

  if (memberEmail !== invitationRecord.memberEmail) {
    return res.status(403).json({
      message: `This invitation is for ${invitationRecord.memberEmail}. Sign in with the invited account to continue.`,
    });
  }

  if (invitationRecord.status === 'active') {
    if (invitationRecord.memberUserId && invitationRecord.memberUserId !== memberUserId) {
      return res.status(409).json({ message: 'This invitation was already accepted by another account.' });
    }

    return res.status(200).json({
      invitation: toPublicTeamInviteRecord(invitationRecord),
      acceptUrl: buildTeamInviteAcceptUrl(token),
    });
  }

  invitationRecord.status = 'active';
  invitationRecord.memberUserId = memberUserId;
  invitationRecord.memberName = memberName;
  invitationRecord.acceptedAt = new Date().toISOString();
  saveTeamInvite(invitationRecord);

  return res.status(200).json({
    invitation: toPublicTeamInviteRecord(invitationRecord),
    acceptUrl: buildTeamInviteAcceptUrl(token),
  });
});

app.patch(['/team-access/members/:invitationId', '/api/team-access/members/:invitationId'], (req, res) => {
  const ip = getClientIp(req);
  if (isRateLimited(ip, 'team-member-update')) {
    return res.status(429).json({ message: 'Too many requests. Please try again shortly.' });
  }

  sanitizeTeamInvites();

  const invitationId = String(req.params?.invitationId || '').trim();
  if (!invitationId) {
    return res.status(400).json({ message: 'invitationId is required.' });
  }

  const invitationRecord = hydrateTeamInviteStatus(teamInvitationsById.get(invitationId));
  if (!invitationRecord) {
    return res.status(404).json({ message: 'Team member record not found.' });
  }

  const ownerUserId = String(req.body?.ownerUserId || '').trim();
  const ownerEmail = normalizeEmail(req.body?.ownerEmail);
  if (!ownerUserId && !ownerEmail) {
    return res.status(400).json({ message: 'ownerUserId or ownerEmail is required.' });
  }

  const isOwnerAuthorized =
    (ownerUserId && ownerUserId === invitationRecord.ownerUserId) ||
    (ownerEmail && ownerEmail === invitationRecord.ownerEmail);

  if (!isOwnerAuthorized) {
    return res.status(403).json({ message: 'Only the invitation owner can update this member.' });
  }

  if (invitationRecord.status === 'revoked') {
    return res.status(409).json({ message: 'Cannot update role for a revoked member.' });
  }

  const nextRole = normalizeRole(req.body?.role);
  if (!TEAM_ROLES.has(nextRole)) {
    return res.status(400).json({ message: 'Invalid role. Allowed roles are Admin, Editor, Viewer.' });
  }

  invitationRecord.role = nextRole;
  saveTeamInvite(invitationRecord);

  return res.status(200).json({
    member: toPublicTeamInviteRecord(invitationRecord),
  });
});

app.post(['/team-access/members/:invitationId/revoke', '/api/team-access/members/:invitationId/revoke'], (req, res) => {
  const ip = getClientIp(req);
  if (isRateLimited(ip, 'team-member-revoke')) {
    return res.status(429).json({ message: 'Too many requests. Please try again shortly.' });
  }

  sanitizeTeamInvites();

  const invitationId = String(req.params?.invitationId || '').trim();
  if (!invitationId) {
    return res.status(400).json({ message: 'invitationId is required.' });
  }

  const invitationRecord = hydrateTeamInviteStatus(teamInvitationsById.get(invitationId));
  if (!invitationRecord) {
    return res.status(404).json({ message: 'Team member record not found.' });
  }

  const ownerUserId = String(req.body?.ownerUserId || '').trim();
  const ownerEmail = normalizeEmail(req.body?.ownerEmail);
  const isOwnerAuthorized =
    (ownerUserId && ownerUserId === invitationRecord.ownerUserId) ||
    (ownerEmail && ownerEmail === invitationRecord.ownerEmail);

  if (!isOwnerAuthorized) {
    return res.status(403).json({ message: 'Only the invitation owner can revoke this member.' });
  }

  invitationRecord.status = 'revoked';
  saveTeamInvite(invitationRecord);

  return res.status(200).json({
    success: true,
    invitationId,
  });
});

function cleanupOldPendingOrders() {
  const now = Date.now();
  const maxAgeMs = 24 * 60 * 60 * 1000;
  for (const [orderId, orderData] of pendingOrders.entries()) {
    if (now - orderData.createdAt > maxAgeMs) {
      pendingOrders.delete(orderId);
    }
  }

  const maxRefundAgeMs = 45 * 24 * 60 * 60 * 1000;
  for (const [refundId, record] of refundsByRefundId.entries()) {
    const updatedAtTs = new Date(record?.lastUpdatedAt || record?.requestedAt || '').getTime();
    if (!Number.isFinite(updatedAtTs)) continue;
    if (now - updatedAtTs <= maxRefundAgeMs) continue;

    refundsByRefundId.delete(refundId);

    if (record?.entityType && record?.entityId) {
      const entityKey = buildRefundEntityKey(record.entityType, record.entityId);
      const ids = (refundIdsByEntity.get(entityKey) || []).filter((id) => id !== refundId);
      if (ids.length > 0) {
        refundIdsByEntity.set(entityKey, ids);
      } else {
        refundIdsByEntity.delete(entityKey);
      }
    }
  }

  sanitizeTeamInvites();
}

setInterval(cleanupOldPendingOrders, 30 * 60 * 1000);

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`[cashfree-server] Listening on port ${port}`);
    console.log(`[cashfree-server] Environment: ${CASHFREE_ENV}`);
    console.log(`[cashfree-server] Refund default speed: ${normalizeRefundSpeed(CASHFREE_DEFAULT_REFUND_SPEED)}`);
    console.log(
      `[cashfree-server] Team invite email mode: ${
        TEAM_ACCESS_EMAIL_PROVIDER === 'resend' && RESEND_API_KEY ? 'resend (live)' : 'preview (email provider not configured)'
      }`
    );
    console.log(
      `[cashfree-server] Refund persistence: ${
        hasSupabaseAdminConfig
          ? `supabase (${SUPABASE_REFUNDS_TABLE} + ${SUPABASE_USER_PAYMENTS_TABLE})`
          : 'in-memory only (set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY for persistent reconciliation)'
      }`
    );
    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
      console.warn('[cashfree-server] Missing CASHFREE_APP_ID / CASHFREE_SECRET_KEY. Payment calls will fail until configured.');
    }
  });

  server.on('error', (error) => {
    if (error?.code === 'EADDRINUSE') {
      console.error(`[cashfree-server] Port ${port} is already in use. Stop the conflicting process and restart.`);
      process.exit(1);
    }

    console.error('[cashfree-server] Failed to start server:', error);
    process.exit(1);
  });
}

startServer(PORT);
