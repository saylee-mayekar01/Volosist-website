import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  CreditCard,
  Shield,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  User,
  Mail,
  Phone,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { createOrder, openCheckout } from '../../lib/cashfree';
import { supabase } from '../../lib/supabase';

// Plan display info (for UI only — actual pricing comes from backend)
const PLAN_DISPLAY: Record<string, { name: string; features: string[] }> = {
  basic_monthly: {
    name: 'Basic',
    features: ['Single Agent Workflow', 'Basic Lead Capture', 'Standard Email Support', 'Monthly Performance Audit', 'Infrastructure Setup'],
  },
  basic_yearly: {
    name: 'Basic (Annual)',
    features: ['Single Agent Workflow', 'Basic Lead Capture', 'Standard Email Support', 'Monthly Performance Audit', 'Infrastructure Setup'],
  },
  pro_monthly: {
    name: 'Pro',
    features: ['Multi-Agent Swarms', 'Inbound Voice Routing', 'CRM Real-time Sync', 'Priority Slack Support', 'Recursive Fine-tuning', 'Omnichannel Lead Gen'],
  },
  pro_yearly: {
    name: 'Pro (Annual)',
    features: ['Multi-Agent Swarms', 'Inbound Voice Routing', 'CRM Real-time Sync', 'Priority Slack Support', 'Recursive Fine-tuning', 'Omnichannel Lead Gen'],
  },
  business_monthly: {
    name: 'Business',
    features: ['Unlimited Integration Nodes', 'Custom LLM Training', 'Outbound AI Calling', 'Dedicated Solutions Engineer', 'Advanced Security Layer', 'White-label Dashboard'],
  },
  business_yearly: {
    name: 'Business (Annual)',
    features: ['Unlimited Integration Nodes', 'Custom LLM Training', 'Outbound AI Calling', 'Dedicated Solutions Engineer', 'Advanced Security Layer', 'White-label Dashboard'],
  },
};

export function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planId = searchParams.get('plan') || 'basic_monthly';
  const planDisplay = PLAN_DISPLAY[planId] || PLAN_DISPLAY.basic_monthly;

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill from Supabase auth if logged in
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setForm((f) => ({
          ...f,
          email: data.user.email || f.email,
          name: data.user.user_metadata?.full_name || f.name,
          phone: data.user.user_metadata?.phone || f.phone,
        }));
      }
    });
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Invalid email';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^\d{10,15}$/.test(form.phone.replace(/\D/g, '')))
      errs.phone = 'Invalid phone number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCheckout = async () => {
    if (!validate()) return;
    setLoading(true);
    setError('');

    try {
      // Step 1: Create order on backend (backend calculates amount + GST)
      const orderResponse = await createOrder({
        planId,
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone.replace(/\D/g, ''),
      });

      // Store order info in localStorage for the return page
      localStorage.setItem(
        'pendingOrder',
        JSON.stringify({
          orderId: orderResponse.order_id,
          planId,
          planName: orderResponse.plan_name,
          amount: orderResponse.order_amount,
          email: form.email,
          createdAt: Date.now(),
        })
      );

      // Step 2: Open Cashfree checkout (redirects to Cashfree payment page)
      openCheckout(orderResponse.payment_session_id);

    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="size-4" /> Back
        </motion.button>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left - Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-xl p-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="size-12 rounded-2xl bg-blue-600 flex items-center justify-center">
                <CreditCard className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Secure Checkout</h1>
                <p className="text-sm text-slate-500">Complete your purchase</p>
              </div>
            </div>

            {/* Sandbox Indicator */}
            <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <AlertCircle className="size-4 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">
                TEST MODE — No real charges will be made
              </span>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Shield className="size-4 text-emerald-500" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Lock className="size-4 text-blue-500" />
                <span>256-bit Encryption</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle2 className="size-4 text-violet-500" />
                <span>PCI Compliant</span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="John Doe"
                    className={`pl-11 h-12 rounded-xl ${errors.name ? 'border-red-300 focus:ring-red-200' : ''}`}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="john@company.com"
                    className={`pl-11 h-12 rounded-xl ${errors.email ? 'border-red-300 focus:ring-red-200' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="9876543210"
                    className={`pl-11 h-12 rounded-xl ${errors.phone ? 'border-red-300 focus:ring-red-200' : ''}`}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                  Company <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    value={form.company}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    placeholder="Acme Inc."
                    className="pl-11 h-12 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                <AlertCircle className="size-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full h-14 mt-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-widest text-sm gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Creating order...
                </>
              ) : (
                <>
                  <Lock className="size-4" />
                  Proceed to Payment
                </>
              )}
            </Button>

            <p className="text-center text-xs text-slate-400 mt-4">
              You'll be redirected to Cashfree's secure payment page. Amount includes 18% GST.
            </p>
          </motion.div>

          {/* Right - Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-slate-900 rounded-3xl p-6 text-white sticky top-8">
              <h2 className="text-lg font-bold mb-6">Order Summary</h2>

              <div className="p-4 rounded-2xl bg-white/10 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg">{planDisplay.name}</span>
                  <Badge className="bg-blue-500/20 text-blue-300 border-0 text-[10px] font-bold uppercase">
                    {planId.includes('yearly') ? 'Annual' : 'Monthly'}
                  </Badge>
                </div>
                <p className="text-slate-400 text-sm">AI Automation Platform</p>
              </div>

              <div className="space-y-3 mb-6">
                {planDisplay.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">GST (18%)</span>
                  <span className="text-slate-300">Calculated at checkout</span>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-white/10">
                  <span className="text-slate-400">Total</span>
                  <span className="text-emerald-400 font-bold">Includes GST</span>
                </div>
              </div>

              <div className="mt-6 p-3 rounded-xl bg-white/5 flex items-center gap-3">
                <Shield className="size-8 text-emerald-400" />
                <div>
                  <p className="text-xs font-bold text-white">30-Day Money Back</p>
                  <p className="text-[10px] text-slate-400">Full refund if not satisfied</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
