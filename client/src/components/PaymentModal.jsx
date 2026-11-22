import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle,
  X,
  Lock,
  ArrowRight,
  AlertTriangle,
  Receipt,
  Download,
  Info,
  Check
} from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, selectedPlan, onPaymentSuccess }) {
  const { user, refreshUser } = useAuth();
  const { showToast } = useNotification();
  const [method, setMethod] = useState('UPI');
  const [upiId, setUpiId] = useState(`${user?.email?.split('@')[0] || 'member'}@okhdfcbank`);
  const [loading, setLoading] = useState(false);
  const [gatewayConfig, setGatewayConfig] = useState(null);
  const [successReceipt, setSuccessReceipt] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSuccessReceipt(null);
      // Fetch gateway config to know if sandbox or live
      api.get('/subscriptions/config')
        .then((res) => {
          if (res.success) setGatewayConfig(res.config);
        })
        .catch(() => {
          setGatewayConfig({ isDevelopmentMode: true, gatewayName: 'Fitora Development Sandbox Gateway' });
        });
    }
  }, [isOpen]);

  if (!isOpen || !selectedPlan) return null;

  const isDevMode = gatewayConfig?.isDevelopmentMode ?? true;
  const subtotal = Math.round((selectedPlan.priceInr / 1.18) * 100) / 100;
  const gstAmount = Math.round((selectedPlan.priceInr - subtotal) * 100) / 100;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // 1. Initiate server-side order
      const orderRes = await api.post('/payments/create-order', {
        planId: selectedPlan.id
      });

      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Could not initiate checkout order.');
      }

      // Simulate network verification latency (800ms)
      await new Promise((resolve) => setTimeout(resolve, 800));

      const paymentMethodLabel = method === 'UPI'
        ? `UPI (${upiId || 'test@upi'})`
        : method === 'CARD'
          ? 'Indian RuPay / Visa (Sandbox 4242)'
          : 'NetBanking (Sandbox HDFC)';

      // 2. Server-side payment verification & atomic database activation
      const verifyRes = await api.post('/payments/verify', {
        orderId: orderRes.order.orderId,
        planId: selectedPlan.id,
        paymentMethod: paymentMethodLabel
      });

      if (verifyRes.success) {
        setSuccessReceipt(verifyRes);
        await refreshUser();
        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {}
        showToast(`Payment verified! ${selectedPlan.name} is now active on your account.`, 'success');
        if (onPaymentSuccess) onPaymentSuccess(verifyRes);
      } else {
        throw new Error(verifyRes.message || 'Payment verification failed.');
      }
    } catch (err) {
      showToast(err.message || 'Payment processing failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative overflow-hidden my-auto">
        <button
          onClick={onClose}
          aria-label="Close checkout modal"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!successReceipt ? (
          <div>
            {/* Development Sandbox vs Live Gateway Badge */}
            {isDevMode ? (
              <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">Development Sandbox Checkout</p>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Live payment gateway credentials (Razorpay) are not configured in your environment. Testing sandbox is active. Real server-side verification and database persistence will be performed.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full w-fit mb-3 border border-emerald-200">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit Encrypted Payment Gateway</span>
              </div>
            )}

            <div className="mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {selectedPlan.tier} Plan
              </span>
              <h3 className="text-2xl font-black text-slate-900 brand-font mt-1">
                Checkout: {selectedPlan.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Duration: {selectedPlan.billingCycle.replace('_', ' ')} • Includes all {selectedPlan.tier} tier features
              </p>
            </div>

            {/* Price Box with GST transparency */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white border border-emerald-200 mb-5 space-y-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Payable Amount</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-[#176B4D]">₹{selectedPlan.priceInr}</span>
                    <span className="text-xs text-slate-500 font-bold">INR</span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500 space-y-0.5">
                  <p>Subtotal: <span className="font-semibold text-slate-700">₹{subtotal}</span></p>
                  <p>GST (18%): <span className="font-semibold text-slate-700">₹{gstAmount}</span></p>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="mb-5 space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                {isDevMode ? 'Select Sandbox Payment Method' : 'Select Payment Method'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('UPI')}
                  className={`p-3 rounded-2xl border text-left text-xs font-bold flex items-center gap-2.5 transition-all ${
                    method === 'UPI'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="font-extrabold">UPI / QR Code</p>
                    <p className="text-[10px] text-slate-400 font-normal">GPay, PhonePe, Paytm</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('CARD')}
                  className={`p-3 rounded-2xl border text-left text-xs font-bold flex items-center gap-2.5 transition-all ${
                    method === 'CARD'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="font-extrabold">Debit / Credit Card</p>
                    <p className="text-[10px] text-slate-400 font-normal">RuPay, Visa, Master</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Method Inputs */}
            {method === 'UPI' ? (
              <div className="mb-6 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">UPI ID (VPA)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="username@okaxis / username@upi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                <p className="text-[11px] text-slate-400">
                  {isDevMode
                    ? 'Sandbox Mode: You can enter any UPI ID for test validation.'
                    : 'A payment notification will be dispatched to your UPI app.'}
                </p>
              </div>
            ) : (
              <div className="mb-6 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Simulated Test Card</label>
                <input
                  type="text"
                  disabled
                  value="4242 •••• •••• 4242 (RuPay / Visa Test Card)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 text-slate-500 cursor-not-allowed font-mono"
                />
                <p className="text-[11px] text-slate-400">
                  Sandbox card with automated 3D-Secure approval enabled.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#2FA878] hover:bg-[#176B4D] disabled:opacity-50 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying & Granting Entitlements...</span>
                  </div>
                ) : (
                  <>
                    <span>Pay ₹{selectedPlan.priceInr} INR & Activate Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel Checkout
              </button>
            </div>

            <p className="text-[10px] text-slate-400 text-center mt-3">
              Server-side atomic transaction confirms payment before unlocking features. No card data stored.
            </p>
          </div>
        ) : (
          /* Payment Success State */
          <div className="text-center py-3 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Payment Verified
              </span>
              <h3 className="text-2xl font-black text-slate-900 brand-font mt-1">Subscription Activated!</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Receipt Number: <span className="font-mono font-bold text-slate-700">{successReceipt.receiptNumber}</span>
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Plan Activated:</span>
                <span className="font-extrabold text-slate-800">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-black text-emerald-700">₹{selectedPlan.priceInr} INR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gateway Status:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> VERIFIED & ACTIVE
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration:</span>
                <span className="font-semibold text-slate-700">{selectedPlan.billingCycle.replace('_', ' ')}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-[#2FA878] hover:bg-[#176B4D] text-white rounded-xl font-black text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>Access Your {selectedPlan.name} Features</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
