import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ArrowRight, 
  RefreshCw,
  Home,
  Mail,
  AlertTriangle
} from 'lucide-react';
import { verifyPayment, VerifyPaymentResponse } from '../../lib/cashfree';
import { supabase, upsertPayment } from '../../lib/supabase';

type PaymentStatus = 'verifying' | 'success' | 'failed' | 'pending';

export function PaymentStatusPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');
  
  const [status, setStatus] = useState<PaymentStatus>('verifying');
  const [paymentDetails, setPaymentDetails] = useState<VerifyPaymentResponse | null>(null);
  const [error, setError] = useState('');
  const verifyAttempted = useRef(false);

  useEffect(() => {
    if (!orderId || verifyAttempted.current) return;
    verifyAttempted.current = true;

    const doVerify = async () => {
      try {
        // Get stored order info (saved during checkout)
        const pendingOrderStr = localStorage.getItem('pendingOrder');
        const pendingOrder = pendingOrderStr ? JSON.parse(pendingOrderStr) : null;

        // Step 3: Verify payment via backend → Cashfree API
        // Backend checks GET /pg/orders/{order_id}/payments → payment_status
        const result = await verifyPayment(orderId);
        setPaymentDetails(result);

        if (result.payment_status === 'SUCCESS') {
          setStatus('success');

          // Save completed purchase info for dashboard to pick up
          const purchaseInfo = {
            orderId: result.order_id,
            planId: pendingOrder?.planId || 'custom',
            planName: pendingOrder?.planName || 'Service Plan',
            amount: result.order_amount || pendingOrder?.amount || 0,
            paymentId: result.payment_id,
            purchaseDate: new Date().toISOString(),
          };
          localStorage.setItem('completedPurchase', JSON.stringify(purchaseInfo));

          // Save to Supabase database (if available)
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user && pendingOrder) {
            const amountRupees = Number(result.order_amount ?? pendingOrder.amount ?? 0);
            const amountPaise = Number.isFinite(amountRupees)
              ? Math.max(0, Math.round(amountRupees * 100))
              : 0;

            const metadata = userData.user.user_metadata || {};
            const firstName = String(metadata.first_name || '').trim();
            const lastName = String(metadata.last_name || '').trim();
            const fullName = String(metadata.full_name || '').trim();
            const userName = fullName || `${firstName} ${lastName}`.trim() || userData.user.email?.split('@')[0] || 'User';
            const userPhone = String(metadata.phone || '').trim();

            await upsertPayment({
              user_id: userData.user.id,
              user_name: userName,
              user_email: String(userData.user.email || '').trim().toLowerCase() || undefined,
              user_phone: userPhone || undefined,
              plan_id: pendingOrder.planId,
              plan_name: pendingOrder.planName,
              amount: amountPaise,
              currency: result.order_currency || 'INR',
              cashfree_order_id: result.order_id,
              cashfree_payment_id: result.payment_id || undefined,
              status: 'success',
            });
          }

          // Clear pending order from localStorage
          localStorage.removeItem('pendingOrder');
        } else if (
          result.payment_status === 'PENDING' ||
          result.payment_status === 'NOT_FOUND' ||
          result.order_status === 'ACTIVE'
        ) {
          setStatus('pending');
        } else {
          setStatus('failed');
        }
      } catch (err: any) {
        console.error('Payment verification error:', err);
        setError(err.message || 'Failed to verify payment');
        setStatus('failed');
      }
    };

    // Small delay to allow Cashfree to process
    setTimeout(doVerify, 2000);
  }, [orderId]);

  const handleRetry = () => {
    verifyAttempted.current = false;
    setStatus('verifying');
    setError('');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        {/* Verifying */}
        {status === 'verifying' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center">
            <div className="size-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="size-10 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Verifying Payment</h1>
            <p className="text-slate-500">Please wait while we confirm your payment...</p>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="size-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="size-10 text-emerald-600" />
            </motion.div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
            <p className="text-slate-500 mb-6">
              Thank you for your purchase. Your subscription is now active.
            </p>

            {paymentDetails && (
              <div className="bg-slate-50 rounded-2xl p-4 mb-6 text-left">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Order ID</span>
                  <span className="font-mono text-slate-700">{paymentDetails.order_id}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Amount</span>
                  <span className="font-bold text-slate-900">
                    ₹{paymentDetails.order_amount?.toLocaleString('en-IN')}
                  </span>
                </div>
                {paymentDetails.payment_id && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Payment ID</span>
                    <span className="font-mono text-slate-700 text-xs">{paymentDetails.payment_id}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate('/dashboard')}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2"
              >
                Go to Dashboard <ArrowRight className="size-4" />
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full h-12 rounded-xl gap-2"
              >
                <Home className="size-4" /> Back to Home
              </Button>
            </div>
          </div>
        )}

        {/* Pending */}
        {status === 'pending' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center">
            <div className="size-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="size-10 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Pending</h1>
            <p className="text-slate-500 mb-6">
              Your payment is being processed. This may take a few minutes.
            </p>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleRetry}
                className="w-full h-12 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold gap-2"
              >
                <RefreshCw className="size-4" /> Check Again
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full h-12 rounded-xl gap-2"
              >
                <Home className="size-4" /> Back to Home
              </Button>
            </div>

            <p className="text-xs text-slate-400 mt-4">
              If payment was successful, it should reflect within 5 minutes.
            </p>
          </div>
        )}

        {/* Failed */}
        {status === 'failed' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center">
            <div className="size-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <XCircle className="size-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Failed</h1>
            <p className="text-slate-500 mb-4">
              {error || 'Your payment could not be processed. Please try again.'}
            </p>

            {paymentDetails?.order_id && (
              <p className="text-xs text-slate-400 mb-6 font-mono">
                Order: {paymentDetails.order_id}
              </p>
            )}

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate(-1)}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2"
              >
                <RefreshCw className="size-4" /> Try Again
              </Button>
              <Button
                onClick={() => window.location.href = 'mailto:volosist.ai@gmail.com?subject=Payment Issue'}
                variant="outline"
                className="w-full h-12 rounded-xl gap-2"
              >
                <Mail className="size-4" /> Contact Support
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                className="w-full h-10 rounded-xl gap-2 text-slate-500"
              >
                <Home className="size-4" /> Back to Home
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
