/**
 * Cashfree Payments Integration
 *
 * Flow:
 *  1. Frontend calls createCashfreeOrder() → gets order_id + payment_session_id
 *  2. Cashfree checkout opens (hosted page or drop-in JS)
 *  3. On return, verifyPayment() checks status
 *  4. Confirmed orders are upserted to Supabase via upsertPayment()
 *
 * Backend requirement:
 *  You need a small server/edge-function that calls Cashfree's server-side API
 *  to create orders (secret key must NOT be in the browser).
 *
 *  For now the createOrder call goes to /api/cashfree/create-order on your
 *  backend. Wire VITE_API_URL in .env.local.
 */

export interface CashfreeOrderPayload {
  orderId: string;
  amount?: number;
  currency: string; // 'INR'
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  planId: string;
  planName: string;
  returnUrl: string; // e.g. https://yoursite.com/payment/return?order_id={order_id}
  cartItems?: Array<{
    serviceId: string;
    plan: string;
    billingCycle?: 'monthly' | 'yearly';
    quantity?: number;
  }>;
}

export interface CashfreeOrderResponse {
  order_id: string;
  payment_session_id: string;
  order_status: string;
  order_amount?: number;
  subtotal?: number;
  tax?: number;
  payment_link?: string | null;
}

export interface VerifyPaymentResponse {
  order_id: string;
  order_status: string;
  order_amount?: number;
  order_currency?: string;
  payment_id?: string;
  payment_status?: string;
}

export interface CashfreeRefundPayload {
  orderId?: string;
  subscriptionId?: string;
  entityType?: 'order' | 'subscription';
  reason: string;
  refundAmount?: number;
  refundId?: string;
  refundSpeed?: 'STANDARD' | 'INSTANT';
}

export interface CashfreeRefundResponse {
  entity_type?: 'order' | 'subscription';
  entity_id?: string;
  order_id?: string | null;
  subscription_id?: string;
  refund_id: string;
  cf_refund_id?: string;
  refund_status: string;
  refund_speed?: string;
  liquidity_state?: string;
  refund_amount: number;
  payment_id?: string;
  bank_reference?: string;
  raw?: Record<string, unknown>;
}

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

/** Ask your backend to create a Cashfree order. Returns session id for checkout. */
export async function createCashfreeOrder(
  payload: CashfreeOrderPayload
): Promise<CashfreeOrderResponse> {
  const res = await fetch(`${API_BASE}/cashfree/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create payment order');
  }
  return res.json();
}

/** Ask your backend to verify an existing Cashfree order. */
export async function verifyCashfreePayment(orderId: string): Promise<VerifyPaymentResponse> {
  const res = await fetch(`${API_BASE}/cashfree/verify-order/${orderId}`, {
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to verify payment');
  }
  return res.json();
}

/** Ask backend to execute a refund on an existing order. */
export async function createCashfreeRefund(payload: CashfreeRefundPayload): Promise<CashfreeRefundResponse> {
  const res = await fetch(`${API_BASE}/cashfree/refund-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to initiate refund');
  }

  return res.json();
}

/**
 * Open Cashfree hosted checkout in the same tab.
 * Requires the Cashfree JS SDK loaded in index.html:
 *   <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
 */
export async function openCashfreeCheckout(paymentSessionId: string, returnUrl: string, paymentLink?: string | null) {
  if (paymentLink) {
    window.location.assign(paymentLink);
    return;
  }

  const cashfreeMode = import.meta.env.VITE_CASHFREE_MODE || 'sandbox';
  const cashfree = (window as any).Cashfree?.({ mode: cashfreeMode });
  if (!cashfree) {
    throw new Error('Cashfree checkout is unavailable right now. Please refresh and try again.');
  }

  try {
    const result = await cashfree.checkout({
      paymentSessionId,
      redirectTarget: '_self',
      returnUrl,
    });

    if (result?.error) {
      const message =
        result.error?.message ||
        result.error?.reason ||
        'Unable to launch Cashfree checkout.';
      throw new Error(message);
    }
  } catch {
    throw new Error('Unable to launch Cashfree checkout.');
  }
}

type LegacyCreateOrderPayload = {
  planId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
};

type LegacyCreateOrderResponse = CashfreeOrderResponse & {
  order_amount: number;
  plan_name: string;
};

const PLAN_PRICING: Record<string, { amount: number; name: string }> = {
  basic_monthly: { amount: 490, name: 'Basic' },
  basic_yearly: { amount: 4900, name: 'Basic (Annual)' },
  pro_monthly: { amount: 1490, name: 'Pro' },
  pro_yearly: { amount: 14900, name: 'Pro (Annual)' },
  business_monthly: { amount: 4990, name: 'Business' },
  business_yearly: { amount: 49900, name: 'Business (Annual)' },
};

export async function createOrder(payload: LegacyCreateOrderPayload): Promise<LegacyCreateOrderResponse> {
  const plan = PLAN_PRICING[payload.planId] || { amount: 490, name: 'Basic' };
  const orderId = `cf_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const returnUrl = `${window.location.origin}/payment-status?order_id={order_id}`;

  const created = await createCashfreeOrder({
    orderId,
    amount: plan.amount,
    currency: 'INR',
    customerName: payload.customerName,
    customerEmail: payload.customerEmail,
    customerPhone: payload.customerPhone,
    planId: payload.planId,
    planName: plan.name,
    returnUrl,
  });

  return {
    ...created,
    order_amount: plan.amount,
    plan_name: plan.name,
  };
}

export function openCheckout(paymentSessionId: string, returnUrl?: string) {
  const fallbackReturnUrl = `${window.location.origin}/payment-status?order_id={order_id}`;
  openCashfreeCheckout(paymentSessionId, returnUrl || fallbackReturnUrl);
}

export async function verifyPayment(orderId: string): Promise<VerifyPaymentResponse> {
  return verifyCashfreePayment(orderId);
}
