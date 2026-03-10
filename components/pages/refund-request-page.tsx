import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  History,
  IndianRupee,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { createCashfreeRefund } from '../../lib/cashfree';
import {
  cancelRefundByOrder,
  hasSupabaseConfig,
  listUserPayments,
  markRefundedByOrderWithMeta,
  requestRefundByOrder,
  UserPayment,
} from '../../lib/supabase';
import { store as globalStore, Payment } from '../../lib/store';

interface RefundRequestPageProps {
  user: any;
}

interface ServiceContext {
  serviceId?: string;
  name: string;
  plan: string;
  renewalCost: number;
  cashfreeOrderId?: string;
}

type RefundCandidate = {
  source: 'store' | 'supabase';
  storePaymentId?: string;
  cashfreeOrderId: string;
  displayOrderId: string;
  amountRupees: number;
  status: Payment['status'];
  service: string;
  plan: string;
  date: string;
  refundReason?: string;
  refundNotes?: string;
};

const REFUND_REASON_OPTIONS = [
  { value: 'accidental_purchase', label: 'Accidental purchase' },
  { value: 'duplicate_payment', label: 'Duplicate payment' },
  { value: 'wrong_plan_selected', label: 'Wrong plan selected' },
  { value: 'service_not_used', label: 'Service not used' },
  { value: 'technical_issue', label: 'Technical issue / service issue' },
  { value: 'other', label: 'Other' },
] as const;

const SETTLED_REFUND_STATUSES = new Set(['SUCCESS', 'COMPLETED', 'PROCESSED', 'REFUNDED']);

const normalizeLookupKey = (value: string) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const resolveServiceBucket = (value: string) => {
  const normalized = normalizeLookupKey(value);
  if (normalized.includes('sales')) return 'sales';
  if (normalized.includes('voice') || normalized.includes('call')) return 'voice';
  if (normalized.includes('marketing') || normalized.includes('content')) return 'marketing';
  if (normalized.includes('business')) return 'business';
  return '';
};

const normalizeRefundStatus = (status: string | undefined | null): Payment['status'] => {
  const normalized = String(status || '').trim().toLowerCase();
  if (normalized === 'completed' || normalized === 'success' || normalized === 'paid') return 'completed';
  if (normalized === 'refund_pending' || normalized === 'refund_requested' || normalized === 'requested') return 'refund_pending';
  if (normalized === 'refund_cancelled' || normalized === 'refund_canceled' || normalized === 'cancelled') return 'refund_cancelled';
  if (normalized === 'refunded' || normalized === 'refund') return 'refunded';
  if (normalized === 'pending') return 'pending';
  return 'failed';
};

const toSupabaseStatus = (status: Payment['status']): UserPayment['status'] => {
  if (status === 'refund_pending') return 'refund_requested';
  if (status === 'refunded') return 'refunded';
  if (status === 'pending') return 'pending';
  if (status === 'failed') return 'failed';
  return 'success';
};

const getRefundCandidatePriority = (status: Payment['status']) => {
  if (status === 'completed') return 5;
  if (status === 'refund_cancelled') return 4;
  if (status === 'refund_pending') return 3;
  if (status === 'refunded') return 2;
  if (status === 'pending') return 1;
  return 0;
};

const getReasonLabel = (value: string) =>
  REFUND_REASON_OPTIONS.find((option) => option.value === value)?.label || 'Other';

const getStatusBadgeClass = (status: Payment['status'] | null) => {
  if (status === 'completed') return 'bg-emerald-100 text-emerald-700';
  if (status === 'refund_pending') return 'bg-amber-100 text-amber-700';
  if (status === 'refund_cancelled') return 'bg-slate-100 text-slate-700';
  if (status === 'refunded') return 'bg-purple-100 text-purple-700';
  if (status === 'pending') return 'bg-blue-100 text-blue-700';
  return 'bg-red-100 text-red-700';
};

const formatPaymentHistoryLoadError = (error: unknown) => {
  const rawMessage = error instanceof Error
    ? error.message
    : 'Unable to load payment history for refund workflow.';

  const normalized = String(rawMessage || '').toLowerCase();

  if (normalized.includes('user_payments') && normalized.includes('does not exist')) {
    return 'Supabase payment table is missing. Run `supabase-user-payments.sql` and refresh.';
  }

  if (
    normalized.includes('row-level security') ||
    normalized.includes('permission denied') ||
    normalized.includes('policy')
  ) {
    return 'Supabase RLS policy blocked payment history read. Update policies from `supabase-user-payments.sql` and retry.';
  }

  if (normalized.includes('jwt') || normalized.includes('auth')) {
    return 'Your session is not authorized to read payment history. Please sign in again and retry.';
  }

  return rawMessage;
};

const getSafeTimestamp = (value: string) => {
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};

const isServiceAligned = (
  candidateService: string,
  candidatePlan: string,
  serviceName: string,
  serviceBucket: string,
  requestedServiceId: string
) => {
  if (!serviceName && !serviceBucket && !requestedServiceId) {
    return true;
  }

  const candidateKey = normalizeLookupKey(candidateService);
  const candidatePlanKey = normalizeLookupKey(candidatePlan);
  const serviceKey = normalizeLookupKey(serviceName);
  const candidateBucket = resolveServiceBucket(`${candidateService} ${candidatePlan}`);

  const directMatch = Boolean(
    serviceKey && candidateKey && (
      candidateKey === serviceKey ||
      candidateKey.includes(serviceKey) ||
      serviceKey.includes(candidateKey)
    )
  );

  const planMatch = Boolean(
    serviceKey && candidatePlanKey && (
      candidatePlanKey === serviceKey ||
      candidatePlanKey.includes(serviceKey) ||
      serviceKey.includes(candidatePlanKey)
    )
  );

  const bucketMatch = Boolean(serviceBucket && candidateBucket && serviceBucket === candidateBucket);
  const requestedServiceMatch = Boolean(
    requestedServiceId && candidateBucket && requestedServiceId === candidateBucket
  );

  return directMatch || planMatch || bucketMatch || requestedServiceMatch;
};

export function RefundRequestPage({ user }: RefundRequestPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const locationState = location.state as { service?: Partial<ServiceContext> } | null;

  const serviceContext = useMemo<ServiceContext>(() => {
    const serviceFromState = locationState?.service;

    const queryServiceId = String(searchParams.get('serviceId') || '').trim();
    const queryServiceName = String(searchParams.get('serviceName') || '').trim();
    const queryPlan = String(searchParams.get('plan') || '').trim();
    const queryAmount = Number(searchParams.get('amount') || '0');
    const queryOrderId = String(searchParams.get('orderId') || '').trim();

    return {
      serviceId: String(serviceFromState?.serviceId || queryServiceId || '').trim() || undefined,
      name: String(serviceFromState?.name || queryServiceName || '').trim(),
      plan: String(serviceFromState?.plan || queryPlan || '').trim(),
      renewalCost: Number.isFinite(Number(serviceFromState?.renewalCost))
        ? Number(serviceFromState?.renewalCost)
        : Number.isFinite(queryAmount)
          ? queryAmount
          : 0,
      cashfreeOrderId: String(serviceFromState?.cashfreeOrderId || queryOrderId || '').trim() || undefined,
    };
  }, [locationState, searchParams]);

  const [storePayments, setStorePayments] = useState<Payment[]>(globalStore.getPayments());
  const [supabasePayments, setSupabasePayments] = useState<UserPayment[]>([]);
  const [supabaseLoadError, setSupabaseLoadError] = useState('');
  const [loadingSupabasePayments, setLoadingSupabasePayments] = useState(false);

  const [reason, setReason] = useState(REFUND_REASON_OPTIONS[0].value);
  const [notes, setNotes] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [backendError, setBackendError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusOverride, setStatusOverride] = useState<Payment['status'] | null>(null);

  const currentUserId = String(user?.id || '').trim();
  const currentUserEmail = String(user?.email || '').trim().toLowerCase();

  useEffect(() => {
    const syncStorePayments = () => {
      setStorePayments(globalStore.getPayments());
    };

    syncStorePayments();
    const unsubscribe = globalStore.subscribe(syncStorePayments);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const defaultEmail = String(user?.email || '').trim().toLowerCase();
    const defaultPhone = String(user?.user_metadata?.phone || user?.phone || '').trim();

    setContactEmail(defaultEmail);
    setContactPhone(defaultPhone);
  }, [user?.email, user?.phone, user?.user_metadata?.phone]);

  useEffect(() => {
    if (!hasSupabaseConfig || (!currentUserId && !currentUserEmail)) {
      setSupabasePayments([]);
      setSupabaseLoadError('');
      setLoadingSupabasePayments(false);
      return;
    }

    let cancelled = false;
    setLoadingSupabasePayments(true);
    setSupabaseLoadError('');

    listUserPayments(currentUserId, 80, currentUserEmail)
      .then((rows) => {
        if (cancelled) return;
        setSupabasePayments(rows);
      })
      .catch((error) => {
        if (cancelled) return;
        const message = formatPaymentHistoryLoadError(error);
        setSupabaseLoadError(message);
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingSupabasePayments(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentUserEmail, currentUserId]);

  const selectedCandidate = useMemo<RefundCandidate | null>(() => {
    const requestedOrderId = String(serviceContext.cashfreeOrderId || '').trim();
    const requestedServiceId = String(serviceContext.serviceId || '').trim().toLowerCase();
    const requestedServiceName = String(serviceContext.name || '').trim();
    const requestedServiceBucket = resolveServiceBucket(serviceContext.serviceId || requestedServiceName);

    const userMatchedStorePayments = storePayments.filter((payment) => {
      const paymentUserId = String(payment.userId || '').trim().toLowerCase();
      const paymentEmail = String(payment.userEmail || '').trim().toLowerCase();

      if (currentUserId && paymentUserId === currentUserId.toLowerCase()) return true;
      if (currentUserEmail && paymentEmail === currentUserEmail) return true;
      return false;
    });

    const storeCandidates: RefundCandidate[] = userMatchedStorePayments
      .map((payment) => {
        const safeOrderId = String(payment.cashfreeOrderId || '').trim();
        if (!safeOrderId) return null;

        return {
          source: 'store' as const,
          storePaymentId: payment.id,
          cashfreeOrderId: safeOrderId,
          displayOrderId: String(payment.orderId || safeOrderId),
          amountRupees: Number(payment.amount || 0),
          status: normalizeRefundStatus(payment.status),
          service: String(payment.service || ''),
          plan: String(payment.plan || ''),
          date: String(payment.date || ''),
          refundReason: payment.refundReason,
          refundNotes: payment.refundNotes,
        };
      })
      .filter((candidate): candidate is RefundCandidate => candidate !== null);

    const supabaseCandidates: RefundCandidate[] = supabasePayments
      .map((payment) => {
        const safeOrderId = String(payment.cashfree_order_id || '').trim();
        if (!safeOrderId) return null;

        return {
          source: 'supabase' as const,
          cashfreeOrderId: safeOrderId,
          displayOrderId: safeOrderId,
          amountRupees: Number.isFinite(Number(payment.amount)) ? Number(payment.amount) / 100 : 0,
          status: normalizeRefundStatus(payment.status),
          service: String(payment.plan_name || ''),
          plan: String(payment.plan_id || ''),
          date: String(payment.created_at || ''),
          refundReason: payment.refund_reason || undefined,
          refundNotes: payment.refund_note || undefined,
        };
      })
      .filter((candidate): candidate is RefundCandidate => candidate !== null);

    const mergedCandidates = [
      ...storeCandidates,
      ...supabaseCandidates.filter(
        (supabaseCandidate) => !storeCandidates.some((storeCandidate) => storeCandidate.cashfreeOrderId === supabaseCandidate.cashfreeOrderId)
      ),
    ];

    if (!mergedCandidates.length) {
      return null;
    }

    const scoreCandidate = (candidate: RefundCandidate) => {
      const orderMatchBoost = requestedOrderId && candidate.cashfreeOrderId === requestedOrderId ? 1000 : 0;
      const serviceMatchBoost = isServiceAligned(
        candidate.service,
        candidate.plan,
        requestedServiceName,
        requestedServiceBucket,
        requestedServiceId
      )
        ? 200
        : 0;
      const statusBoost = getRefundCandidatePriority(candidate.status) * 10;
      const sourceBoost = candidate.source === 'store' ? 1 : 0;

      return orderMatchBoost + serviceMatchBoost + statusBoost + sourceBoost;
    };

    return mergedCandidates
      .sort((left, right) => {
        const scoreDiff = scoreCandidate(right) - scoreCandidate(left);
        if (scoreDiff !== 0) return scoreDiff;
        return getSafeTimestamp(right.date) - getSafeTimestamp(left.date);
      })[0] || null;
  }, [
    currentUserEmail,
    currentUserId,
    serviceContext.cashfreeOrderId,
    serviceContext.name,
    serviceContext.serviceId,
    storePayments,
    supabasePayments,
  ]);

  useEffect(() => {
    setStatusOverride(null);
  }, [selectedCandidate?.cashfreeOrderId]);

  const selectedPaymentStatus = statusOverride || selectedCandidate?.status || null;
  const canRequestRefund = selectedPaymentStatus === 'completed' || selectedPaymentStatus === 'refund_cancelled';
  const canCancelRequest = selectedPaymentStatus === 'refund_pending';
  const isAlreadyRefunded = selectedPaymentStatus === 'refunded';

  const displayServiceName = serviceContext.name || selectedCandidate?.service || 'Selected Service';
  const displayPlan = serviceContext.plan || selectedCandidate?.plan || 'Plan';
  const displayAmount =
    serviceContext.renewalCost > 0
      ? serviceContext.renewalCost
      : Number.isFinite(Number(selectedCandidate?.amountRupees))
        ? Number(selectedCandidate?.amountRupees)
        : 0;

  const applyCandidateStatus = (
    orderId: string,
    nextStatus: Payment['status'],
    options?: { reason?: string; notes?: string }
  ) => {
    setStatusOverride(nextStatus);

    setSupabasePayments((previous) =>
      previous.map((payment) =>
        String(payment.cashfree_order_id || '') === orderId
          ? {
              ...payment,
              status: toSupabaseStatus(nextStatus),
              refund_reason: options?.reason || payment.refund_reason,
              refund_note: options?.notes || payment.refund_note,
              refund_requested_at:
                nextStatus === 'refund_pending'
                  ? new Date().toISOString()
                  : payment.refund_requested_at,
              refund_completed_at:
                nextStatus === 'refunded'
                  ? new Date().toISOString()
                  : nextStatus === 'refund_cancelled'
                    ? null
                    : payment.refund_completed_at,
            }
          : payment
      )
    );

    const matchingStorePayment = globalStore
      .getPayments()
      .find((payment) => String(payment.cashfreeOrderId || '').trim() === orderId);

    if (matchingStorePayment) {
      globalStore.updatePaymentStatus(matchingStorePayment.id, nextStatus, options);
    }
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    const trimmedNotes = notes.trim();
    const trimmedEmail = contactEmail.trim().toLowerCase();
    const normalizedPhoneDigits = contactPhone.replace(/\D/g, '');

    if (!reason) {
      nextErrors.reason = 'Select a refund reason.';
    }

    if (trimmedNotes.length < 20) {
      nextErrors.notes = 'Please provide at least 20 characters describing the issue.';
    }

    if (reason === 'other' && trimmedNotes.length < 30) {
      nextErrors.notes = 'Please provide at least 30 characters for Other reason.';
    }

    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      nextErrors.contactEmail = 'Enter a valid contact email address.';
    }

    if (!/^\d{10,15}$/.test(normalizedPhoneDigits)) {
      nextErrors.contactPhone = 'Enter a valid contact phone number.';
    }

    if (!policyAccepted) {
      nextErrors.policy = 'Please acknowledge the refund policy before submitting.';
    }

    setFormErrors(nextErrors);

    return {
      isValid: Object.keys(nextErrors).length === 0,
      trimmedNotes,
      trimmedEmail,
      normalizedPhoneDigits,
    };
  };

  const handleSubmitRefundRequest = async () => {
    if (!selectedCandidate) {
      setBackendError('Unable to find payment details for this refund request.');
      return;
    }

    const validation = validateForm();
    if (!validation.isValid) return;

    const safeOrderId = String(selectedCandidate.cashfreeOrderId || '').trim();
    if (!safeOrderId) {
      setBackendError('Refund cannot be submitted because backend payment reference is missing. Contact support.');
      return;
    }

    setSubmitting(true);
    setBackendError('');
    setSuccessMessage('');

    try {
      const reasonLabel = getReasonLabel(reason);
      const refundPayload = [
        `Reason: ${reasonLabel}`,
        `Details: ${validation.trimmedNotes}`,
        `Contact Email: ${validation.trimmedEmail}`,
        `Contact Phone: ${validation.normalizedPhoneDigits}`,
        'Policy Acknowledged: Yes',
      ].join(' | ');

      if (hasSupabaseConfig) {
        try {
          await requestRefundByOrder(safeOrderId, refundPayload);
        } catch (supabaseError) {
          console.warn('[refund] failed to persist request before automation:', supabaseError);
        }
      }

      applyCandidateStatus(safeOrderId, 'refund_pending', {
        reason: reasonLabel,
        notes: validation.trimmedNotes,
      });

      let automationMessage = hasSupabaseConfig
        ? ' Refund request recorded.'
        : ' Refund request recorded locally.';

      try {
        const refundResponse = await createCashfreeRefund({
          orderId: safeOrderId,
          reason: `${reasonLabel} | ${validation.trimmedNotes}`,
          refundSpeed: 'STANDARD',
        });

        const gatewayStatus = String(refundResponse.refund_status || '').toUpperCase();
        const settled = SETTLED_REFUND_STATUSES.has(gatewayStatus);
        const isOnHold =
          gatewayStatus === 'ONHOLD' ||
          String(refundResponse.liquidity_state || '').toUpperCase() === 'ONHOLD';

        if (settled) {
          if (hasSupabaseConfig) {
            try {
              await markRefundedByOrderWithMeta(safeOrderId, {
                refundId: refundResponse.refund_id,
                refundAmountPaise: Math.round(Number(refundResponse.refund_amount || displayAmount) * 100),
                refundStatus: gatewayStatus,
                refundNote: `${reasonLabel} | ${validation.trimmedNotes}`,
              });
            } catch (supabaseError) {
              console.warn('[refund] failed to persist settled refund meta:', supabaseError);
            }
          }

          applyCandidateStatus(safeOrderId, 'refunded', {
            reason: reasonLabel,
            notes: `Refund Ref: ${refundResponse.refund_id} | Gateway Status: ${gatewayStatus}`,
          });

          automationMessage = ' Refund approved automatically and handed to gateway settlement.';
        } else {
          automationMessage = isOnHold
            ? ' Refund is currently ONHOLD due insufficient refund wallet/settlement balance. It will auto-process once liquidity is available.'
            : ` Auto-processing started with gateway status ${gatewayStatus || 'PENDING'}. Settlement updates will continue in background.`;
        }
      } catch (automationError) {
        console.warn('[refund] auto-processing fallback:', automationError);

        const automationErrorMessage = automationError instanceof Error
          ? automationError.message
          : 'Unable to process refund with gateway.';
        const normalizedAutomationError = automationErrorMessage.toLowerCase();

        const missingOrderInGateway =
          normalizedAutomationError.includes('order reference id does not exist') ||
          normalizedAutomationError.includes('order_not_found');
        const orderNotPaidYet =
          normalizedAutomationError.includes('only for paid orders') ||
          normalizedAutomationError.includes('current order status: active');

        if (missingOrderInGateway || orderNotPaidYet) {
          if (hasSupabaseConfig) {
            try {
              await cancelRefundByOrder(safeOrderId);
            } catch (supabaseError) {
              console.warn('[refund] failed to rollback refund_requested status after gateway validation error:', supabaseError);
            }
          }

          applyCandidateStatus(safeOrderId, 'refund_cancelled', {
            notes: automationErrorMessage,
          });

          setBackendError(
            missingOrderInGateway
              ? 'Cashfree could not find this order. Use a real paid Cashfree sandbox order ID before submitting refund.'
              : 'Cashfree can process refunds only for paid orders. Complete payment first, then retry refund.'
          );

          return;
        }

        automationMessage =
          ' Auto-processing could not settle immediately; request remains queued and will continue through billing workflow.';
      }

      setSuccessMessage(
        `Refund submitted successfully.${automationMessage} Amount is credited to original source in 3-7 working days.`
      );
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Unable to submit refund request right now. Please try again.';
      setBackendError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRefundRequest = async () => {
    if (!selectedCandidate) {
      setBackendError('No refund request is available to cancel.');
      return;
    }

    const safeOrderId = String(selectedCandidate.cashfreeOrderId || '').trim();
    if (!safeOrderId) {
      setBackendError('Refund cancellation failed because backend payment reference is missing.');
      return;
    }

    setSubmitting(true);
    setBackendError('');
    setSuccessMessage('');

    try {
      if (hasSupabaseConfig) {
        try {
          await cancelRefundByOrder(safeOrderId);
        } catch (supabaseError) {
          console.warn('[refund] failed to persist cancellation, continuing locally:', supabaseError);
        }
      }

      applyCandidateStatus(safeOrderId, 'refund_cancelled', {
        notes: notes.trim(),
      });
      setSuccessMessage('Refund request cancelled successfully.');
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Unable to cancel refund request right now. Please try again.';
      setBackendError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" className="gap-2" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Button>
          <Badge className="border-blue-200 bg-blue-100 text-blue-700">Refund Workflow</Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-xl font-bold text-slate-900">Refund Request</h1>
            <p className="mt-1 text-sm text-slate-500">
              Submit required details and we will auto-initiate refund workflow after verification.
            </p>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Service Details</div>
              <div className="font-bold text-slate-900">{displayServiceName}</div>
              <div>Plan: {displayPlan}</div>
              <div className="mt-1 flex items-center gap-1 font-semibold text-slate-900">
                <IndianRupee size={14} /> Refund amount reference: {displayAmount.toLocaleString('en-IN')}
              </div>
              {selectedCandidate?.displayOrderId && (
                <div className="pt-1 text-xs text-slate-500">Order: {selectedCandidate.displayOrderId}</div>
              )}
            </div>

            {selectedCandidate && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Refund Status</span>
                <Badge className={cn('uppercase', getStatusBadgeClass(selectedPaymentStatus))}>
                  {(selectedPaymentStatus || 'failed').replace('_', ' ')}
                </Badge>
              </div>
            )}

            {loadingSupabasePayments && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
                <Loader2 size={14} className="animate-spin" />
                Checking payment history for eligible refund records...
              </div>
            )}

            {supabaseLoadError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {supabaseLoadError}
              </div>
            )}

            {!selectedCandidate && !loadingSupabasePayments && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                No eligible payment was found for this account and service. Please contact support for manual assistance.
              </div>
            )}

            {backendError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {backendError}
              </div>
            )}

            {successMessage && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            )}

            {canRequestRefund && selectedCandidate && (
              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Refund Reason</label>
                  <select
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {REFUND_REASON_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  {formErrors.reason && <p className="mt-1 text-xs text-red-500">{formErrors.reason}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Detailed Explanation</label>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Describe what happened and why you are requesting a refund"
                    className="min-h-[120px] w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formErrors.notes && <p className="mt-1 text-xs text-red-500">{formErrors.notes}</p>}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Contact Email</label>
                    <Input
                      value={contactEmail}
                      onChange={(event) => setContactEmail(event.target.value)}
                      className="h-11"
                    />
                    {formErrors.contactEmail && <p className="text-xs text-red-500">{formErrors.contactEmail}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Contact Phone</label>
                    <Input
                      value={contactPhone}
                      onChange={(event) => setContactPhone(event.target.value)}
                      className="h-11"
                    />
                    {formErrors.contactPhone && <p className="text-xs text-red-500">{formErrors.contactPhone}</p>}
                  </div>
                </div>

                <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <input
                    type="checkbox"
                    checked={policyAccepted}
                    onChange={(event) => setPolicyAccepted(event.target.checked)}
                    className="mt-0.5 size-4 rounded border-slate-300"
                  />
                  <span className="text-xs text-slate-600">
                    I confirm that refund details are accurate and understand that approval depends on billing verification.
                  </span>
                </label>
                {formErrors.policy && <p className="-mt-2 text-xs text-red-500">{formErrors.policy}</p>}

                <div className="flex gap-3">
                  <Button className="flex-1 gap-2" onClick={handleSubmitRefundRequest} loading={submitting}>
                    <History size={16} /> Confirm Refund Request
                  </Button>
                </div>
              </div>
            )}

            {canCancelRequest && selectedCandidate && (
              <div className="mt-5 space-y-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
                <p>Your refund request is pending. You can still cancel it before final settlement.</p>
                <Button variant="outline" className="gap-2" onClick={handleCancelRefundRequest} loading={submitting}>
                  Cancel Refund Request
                </Button>
              </div>
            )}

            {isAlreadyRefunded && selectedCandidate && (
              <div className="mt-5 rounded-xl border border-purple-100 bg-purple-50 p-4 text-sm text-purple-700">
                This payment has already been refunded to the original payment source.
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-700">
                <Clock3 size={16} /> Process Timeline
              </h2>
              <ul className="mt-3 space-y-3 text-sm text-slate-600">
                <li className="flex gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 text-blue-600" />
                  <span>Request submitted with user details and reason.</span>
                </li>
                <li className="flex gap-2">
                  <ShieldCheck size={16} className="mt-0.5 text-amber-600" />
                  <span>Validation and risk checks complete in backend automation.</span>
                </li>
                <li className="flex gap-2">
                  <History size={16} className="mt-0.5 text-emerald-600" />
                  <span>Gateway refund is auto-initiated for eligible paid orders.</span>
                </li>
                <li className="flex gap-2">
                  <IndianRupee size={16} className="mt-0.5 text-purple-600" />
                  <span>Amount is credited to original source in 3-7 working days.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Support</h2>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p className="flex items-center gap-2"><Mail size={15} /> volosist.ai@gmail.com</p>
                <p className="flex items-center gap-2"><Phone size={15} /> +91 9769789769</p>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-700">
              <p className="flex items-start gap-2">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                Real refund automation is live: submit once and backend will initiate gateway payout without requiring manual admin approval.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
