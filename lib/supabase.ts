import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

if (!hasSupabaseConfig) {
  console.warn(
    '[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Running with placeholder client until env vars are configured.'
  );
}

export const supabase = createClient(
  hasSupabaseConfig ? supabaseUrl : 'https://placeholder.supabase.co',
  hasSupabaseConfig
    ? supabaseAnonKey
    : 'placeholder-anon-key-for-local-ui-render-only'
);

/* ------------------------------------------------------------------ */
/*  Payment helpers                                                     */
/* ------------------------------------------------------------------ */

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refund_requested' | 'refunded';

export interface UserPayment {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  plan_id: string;
  plan_name: string;
  amount: number;           // in paise (INR) / smallest currency unit
  currency: string;
  cashfree_order_id: string;
  cashfree_payment_id?: string;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
  refund_reason?: string;
  refund_requested_at?: string;
  refund_completed_at?: string;
  refund_id?: string;
  refund_amount?: number;
  refund_status?: string;
  refund_note?: string;
}

const SKIP_SUPABASE_ERROR = '[supabase] skipped because environment is not configured';

const normalizeEmail = (value: unknown) => String(value || '').trim().toLowerCase();

const getAuthenticatedUser = async () => {
  if (!hasSupabaseConfig) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.warn('[supabase] auth.getUser failed:', error.message);
    return null;
  }

  return data.user || null;
};

const assertSupabaseConfigured = () => {
  if (!hasSupabaseConfig) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
  }
};

const ensureOrderId = (orderId: string) => {
  const safeOrderId = String(orderId || '').trim();
  if (!safeOrderId) {
    throw new Error('Missing payment order reference for refund action.');
  }
  return safeOrderId;
};

const ensurePaymentFound = (data: UserPayment | null, orderId: string, action: string) => {
  if (!data) {
    throw new Error(`Unable to ${action}. No payment record found for order ${orderId}.`);
  }
};

/** Check if the current user has an active (paid) subscription. */
export async function getUserActivePayment(userId: string): Promise<UserPayment | null> {
  if (!hasSupabaseConfig) {
    console.warn(SKIP_SUPABASE_ERROR);
    return null;
  }

  const { data, error } = await supabase
    .from('user_payments')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'success')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) console.error('[supabase] getUserActivePayment:', error.message);
  return data ?? null;
}

/** List recent payments for a user (latest first). */
export async function listUserPayments(userId: string, limit = 50, userEmail?: string): Promise<UserPayment[]> {
  if (!hasSupabaseConfig) {
    console.warn(SKIP_SUPABASE_ERROR);
    return [];
  }

  const safeUserId = String(userId || '').trim();
  const safeUserEmail = normalizeEmail(userEmail);
  if (!safeUserId && !safeUserEmail) {
    return [];
  }

  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(200, Math.floor(limit))) : 50;

  if (safeUserId) {
    const { data, error } = await supabase
      .from('user_payments')
      .select('*')
      .eq('user_id', safeUserId)
      .order('created_at', { ascending: false })
      .limit(safeLimit);

    if (error) {
      throw error;
    }

    if ((data || []).length > 0 || !safeUserEmail) {
      return (data || []) as UserPayment[];
    }
  }

  if (safeUserEmail) {
    const { data, error } = await supabase
      .from('user_payments')
      .select('*')
      .eq('user_email', safeUserEmail)
      .order('created_at', { ascending: false })
      .limit(safeLimit);

    if (error) {
      throw error;
    }

    return (data || []) as UserPayment[];
  }

  return [];
}

/** Upsert a payment record (called after Cashfree webhook/return). */
export async function upsertPayment(payment: Partial<UserPayment>) {
  if (!hasSupabaseConfig) {
    console.warn(SKIP_SUPABASE_ERROR);
    return payment as UserPayment;
  }

  const authUser = await getAuthenticatedUser();
  const safeUserId = String(authUser?.id || payment.user_id || '').trim();
  const safeOrderId = String(payment.cashfree_order_id || '').trim();
  const safePlanId = String(payment.plan_id || '').trim();
  const safePlanName = String(payment.plan_name || '').trim();

  if (!safeUserId) {
    throw new Error('Unable to store payment in Supabase. User session not found. Please sign in again.');
  }

  if (!safeOrderId) {
    throw new Error('Unable to store payment in Supabase. Missing cashfree_order_id.');
  }

  if (!safePlanId || !safePlanName) {
    throw new Error('Unable to store payment in Supabase. Missing plan details.');
  }

  const amountPaise = Number(payment.amount);
  if (!Number.isFinite(amountPaise) || amountPaise < 0) {
    throw new Error('Unable to store payment in Supabase. Invalid amount.');
  }

  const metadata = authUser?.user_metadata || {};
  const firstName = String(metadata.first_name || '').trim();
  const lastName = String(metadata.last_name || '').trim();
  const fullName = String(metadata.full_name || '').trim();
  const fallbackName = normalizeEmail(authUser?.email || payment.user_email).split('@')[0] || 'User';

  const payload: Partial<UserPayment> = {
    ...payment,
    user_id: safeUserId,
    user_name:
      String(payment.user_name || '').trim() ||
      fullName ||
      `${firstName} ${lastName}`.trim() ||
      fallbackName,
    user_email: normalizeEmail(authUser?.email || payment.user_email) || undefined,
    user_phone: String(payment.user_phone || metadata.phone || '').trim() || undefined,
    plan_id: safePlanId,
    plan_name: safePlanName,
    amount: Math.round(amountPaise),
    currency: String(payment.currency || 'INR').trim().toUpperCase() || 'INR',
    cashfree_order_id: safeOrderId,
    status: payment.status || 'pending',
    created_at: payment.created_at || new Date().toISOString(),
    updated_at: payment.updated_at || new Date().toISOString(),
  };

  const runUpsert = async (nextPayload: Partial<UserPayment>) => {
    return supabase
      .from('user_payments')
      .upsert(nextPayload, { onConflict: 'cashfree_order_id' })
      .select()
      .single();
  };

  let response = await runUpsert(payload);

  if (response.error) {
    const errorMessage = String(response.error.message || '').toLowerCase();
    const isMissingProfileColumnError =
      errorMessage.includes('column') &&
      (errorMessage.includes('user_name') || errorMessage.includes('user_email') || errorMessage.includes('user_phone'));

    if (isMissingProfileColumnError) {
      const { user_name, user_email, user_phone, ...legacyPayload } = payload;
      response = await runUpsert(legacyPayload);
    }
  }

  if (response.error) throw response.error;
  return response.data as UserPayment;
}

/** Submit a refund request. */
export async function requestRefund(paymentId: string, reason: string) {
  if (!hasSupabaseConfig) {
    console.warn(SKIP_SUPABASE_ERROR);
    return { id: paymentId, status: 'refund_requested', refund_reason: reason } as UserPayment;
  }

  const { data, error } = await supabase
    .from('user_payments')
    .update({
      status: 'refund_requested',
      refund_reason: reason,
      refund_requested_at: new Date().toISOString(),
    })
    .eq('id', paymentId)
    .select()
    .single();
  if (error) throw error;
  return data as UserPayment;
}

export async function requestRefundByOrder(orderId: string, reason: string) {
  assertSupabaseConfigured();
  const safeOrderId = ensureOrderId(orderId);
  const safeReason = String(reason || '').trim();
  if (!safeReason) {
    throw new Error('Refund reason is required before submitting the request.');
  }

  const { data, error } = await supabase
    .from('user_payments')
    .update({
      status: 'refund_requested',
      refund_reason: safeReason,
      refund_requested_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('cashfree_order_id', safeOrderId)
    .select()
    .maybeSingle();

  if (error) throw error;
  ensurePaymentFound(data as UserPayment | null, safeOrderId, 'submit refund request');
  return data as UserPayment;
}

export async function cancelRefundByOrder(orderId: string) {
  assertSupabaseConfigured();
  const safeOrderId = ensureOrderId(orderId);

  const { data, error } = await supabase
    .from('user_payments')
    .update({
      status: 'success',
      updated_at: new Date().toISOString(),
      refund_reason: null,
      refund_requested_at: null,
      refund_completed_at: null,
    })
    .eq('cashfree_order_id', safeOrderId)
    .select()
    .maybeSingle();

  if (error) throw error;
  ensurePaymentFound(data as UserPayment | null, safeOrderId, 'cancel refund request');
  return data as UserPayment;
}

export async function markRefundedByOrder(orderId: string) {
  assertSupabaseConfigured();
  const safeOrderId = ensureOrderId(orderId);

  const basePayload = {
    status: 'refunded',
    refund_completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('user_payments')
    .update(basePayload)
    .eq('cashfree_order_id', safeOrderId)
    .select()
    .maybeSingle();

  if (error) throw error;
  ensurePaymentFound(data as UserPayment | null, safeOrderId, 'mark payment as refunded');
  return data as UserPayment;
}

export async function markRefundedByOrderWithMeta(
  orderId: string,
  refundMeta: {
    refundId?: string;
    refundAmountPaise?: number;
    refundStatus?: string;
    refundNote?: string;
  }
) {
  assertSupabaseConfigured();
  const safeOrderId = ensureOrderId(orderId);

  const basePayload = {
    status: 'refunded',
    refund_completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const richPayload = {
    ...basePayload,
    refund_id: refundMeta.refundId || null,
    refund_amount: Number.isFinite(refundMeta.refundAmountPaise)
      ? Number(refundMeta.refundAmountPaise)
      : null,
    refund_status: refundMeta.refundStatus || 'SUCCESS',
    refund_note: refundMeta.refundNote || null,
  };

  const runUpdate = async (payload: Record<string, unknown>) => {
    return supabase
      .from('user_payments')
      .update(payload)
      .eq('cashfree_order_id', safeOrderId)
      .select()
      .maybeSingle();
  };

  let response = await runUpdate(richPayload);

  if (response.error) {
    const errorMessage = String(response.error.message || '').toLowerCase();
    const isMissingColumnError =
      errorMessage.includes('column') ||
      errorMessage.includes('schema cache') ||
      errorMessage.includes('does not exist');

    if (!isMissingColumnError) {
      throw response.error;
    }

    response = await runUpdate(basePayload);
  }

  if (response.error) throw response.error;
  ensurePaymentFound(response.data as UserPayment | null, safeOrderId, 'mark payment as refunded');
  return response.data as UserPayment;
}
