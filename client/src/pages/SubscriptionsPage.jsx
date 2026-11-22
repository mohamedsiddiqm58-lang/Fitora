import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Receipt,
  Download,
  AlertCircle,
  HelpCircle,
  Settings,
  X,
  CreditCard,
  Calendar,
  Check,
  Eye,
  RefreshCw,
  Clock,
  Zap,
  Info
} from 'lucide-react';

const CATEGORY_TABS = [
  { id: 'ALL', label: 'All Categories' },
  { id: 'ATHLETE', label: 'Athletes' },
  { id: 'SENIOR', label: 'Senior Citizens' },
  { id: 'GYM_FREAK', label: 'Gym Freaks' },
  { id: 'NORMAL', label: 'Normal People' }
];

export default function SubscriptionsPage({ onSelectPlan }) {
  const { user, seniorMode, category, tier, refreshUser } = useAuth();
  const { showToast } = useNotification();

  const [plans, setPlans] = useState([]);
  const [currentSub, setCurrentSub] = useState(null);
  const [currentTier, setCurrentTier] = useState(tier || 'BASIC');
  const [availableFeatures, setAvailableFeatures] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState(category || 'ALL');

  // Modals state
  const [detailModalPlan, setDetailModalPlan] = useState(null);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSubscriptionData = async () => {
    try {
      const [plansRes, currentRes] = await Promise.all([
        api.get('/subscriptions/plans'),
        api.get('/subscriptions/current')
      ]);

      if (plansRes.success) {
        setPlans(plansRes.plans || []);
      }
      if (currentRes.success) {
        setCurrentSub(currentRes.subscription);
        setCurrentTier(currentRes.currentTier || 'BASIC');
        setAvailableFeatures(currentRes.availableFeatures || []);
        setPayments(currentRes.paymentHistory || []);
      }
    } catch (err) {
      showToast('Failed to load subscription data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, [tier, user?.id]);

  // Sync category tab with user category if not already manually altered
  useEffect(() => {
    if (category && selectedCategoryTab === 'ALL') {
      setSelectedCategoryTab(category);
    }
  }, [category]);

  // 1. Select Free Basic Plan Action
  const handleSelectBasicPlan = async () => {
    if (!window.confirm('Switch to the Free Basic Plan? Any active paid features will be discontinued.')) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.post('/subscriptions/select-basic');
      if (res.success) {
        showToast(res.message, 'success');
        await refreshUser();
        await fetchSubscriptionData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to select Basic Plan.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Pause / Resume Auto-Renewal
  const handleToggleAutoRenewal = async () => {
    if (!currentSub) return;
    setActionLoading(true);
    try {
      if (currentSub.cancelAtPeriodEnd) {
        // Resume
        const res = await api.post('/subscriptions/resume');
        if (res.success) {
          showToast(res.message, 'success');
          await fetchSubscriptionData();
        }
      } else {
        // Pause auto-renewal
        const res = await api.post('/subscriptions/cancel', { immediate: false });
        if (res.success) {
          showToast(res.message, 'info');
          await fetchSubscriptionData();
        }
      }
    } catch (err) {
      showToast(err.message || 'Action failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Immediate Cancellation
  const handleImmediateCancel = async () => {
    if (!window.confirm('Cancel your subscription immediately? You will immediately lose access to paid features.')) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.post('/subscriptions/cancel', { immediate: true });
      if (res.success) {
        showToast(res.message, 'warning');
        setCancelModalOpen(false);
        setManageModalOpen(false);
        await refreshUser();
        await fetchSubscriptionData();
      }
    } catch (err) {
      showToast(err.message || 'Cancellation failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter plans based on the chosen category tab
  const displayedPlans = plans.filter((p) => {
    if (selectedCategoryTab === 'ALL') return true;
    if (p.tier === 'BASIC') return true;
    return p.category === selectedCategoryTab;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading subscription pricing & entitlements in ₹ INR...</p>
      </div>
    );
  }

  const isCurrentPlan = (plan) => {
    if (currentSub) {
      return currentSub.planId === plan.id;
    }
    return plan.tier === 'BASIC';
  };

  return (
    <div className={`w-full px-4 py-4 space-y-6 pb-28 max-w-7xl mx-auto ${seniorMode ? 'senior-mode' : ''}`}>
      
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Transparent Indian Pricing & Inclusions</span>
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2 brand-font">Subscription Plans</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Honest, transparent prices in ₹ INR with complete disclosure of included features, billing durations, and one-click cancellation.
            </p>
          </div>

          <button
            onClick={() => {
              setLoading(true);
              fetchSubscriptionData();
            }}
            className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Status</span>
          </button>
        </div>
      </div>

      {/* 6. MY SUBSCRIPTION DASHBOARD CARD */}
      <section className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border-2 border-emerald-200 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-700 text-white shadow-2xs">
                My Subscription Dashboard
              </span>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${
                currentSub?.status === 'ACTIVE'
                  ? currentSub.cancelAtPeriodEnd
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                {currentSub ? (
                  currentSub.cancelAtPeriodEnd ? 'Auto-Renewal Paused' : 'Active Status'
                ) : (
                  'Active (Free Basic)'
                )}
              </span>

              {user?.profile?.selectedCategory && (
                <span className="text-[10px] font-bold text-slate-600 px-2.5 py-1 rounded-md bg-white border border-slate-200">
                  Profile Category: {user.profile.selectedCategory}
                </span>
              )}
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 brand-font">
                {currentSub ? currentSub.plan?.name : 'Free Basic Tier'}
              </h2>
              <div className="flex flex-wrap items-baseline gap-2 mt-1">
                <span className="text-xl sm:text-2xl font-black text-[#176B4D]">
                  ₹{currentSub ? currentSub.amount : 0} INR
                </span>
                <span className="text-xs font-bold text-slate-500">
                  / {currentSub ? currentSub.billingInterval.replace('_', ' ').toLowerCase() : 'free forever'}
                </span>
              </div>
            </div>

            {/* Dates info */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-600">
              {currentSub ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Started: <strong className="text-slate-800">{new Date(currentSub.startDate).toLocaleDateString()}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {currentSub.cancelAtPeriodEnd ? 'Expires on: ' : 'Renews on: '}
                      <strong className="text-slate-800">
                        {new Date(currentSub.currentPeriodEnd).toLocaleDateString()}
                      </strong>
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-slate-500">
                  Enjoy unrestricted lifetime access to baseline fitness tracking, habit streaks, water intake, and medicine alerts.
                </p>
              )}
            </div>

            {/* Feature preview checklist for active tier */}
            <div className="pt-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Active Inclusions:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {availableFeatures.slice(0, 4).map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons on Dashboard Card */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto shrink-0">
            {currentSub && currentSub.planTier !== 'BASIC' ? (
              <>
                <button
                  onClick={() => setManageModalOpen(true)}
                  className="px-5 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-black shadow-2xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Settings className="w-4 h-4 text-emerald-700" />
                  <span>Manage Subscription</span>
                </button>

                <button
                  onClick={handleToggleAutoRenewal}
                  disabled={actionLoading}
                  className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-white text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <span>{currentSub.cancelAtPeriodEnd ? 'Resume Auto-Renewal' : 'Pause Auto-Renewal'}</span>
                </button>

                <button
                  onClick={() => setCancelModalOpen(true)}
                  className="px-5 py-2.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  Cancel Subscription
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 block text-center lg:text-left">
                  Need more specialized coaching?
                </span>
                <a
                  href="#plans-grid"
                  className="px-5 py-3 rounded-xl bg-[#2FA878] hover:bg-[#176B4D] text-white text-xs font-black shadow-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  <span>Upgrade to Freemium / Premium</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. CATEGORY TABS / SELECTOR */}
      <div id="plans-grid" className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 brand-font">Select Category & Compare Plans</h2>
            <p className="text-xs text-slate-500">
              Personalized plans tailored for your specific fitness stage, daily routine, and wellness goals.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          {CATEGORY_TABS.map((tab) => {
            const isUserCategory = user?.profile?.selectedCategory === tab.id;
            const isSelected = selectedCategoryTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategoryTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{tab.label}</span>
                {isUserCategory && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                    isSelected ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    My Category
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2 & 3. PLAN CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayedPlans.map((plan) => {
          const isCurrent = isCurrentPlan(plan);
          const isHighlight = plan.tier === 'PREMIUM' || plan.tier === 'FREEMIUM';

          return (
            <div
              key={plan.id}
              className={`p-6 sm:p-7 rounded-3xl border flex flex-col justify-between transition-all relative ${
                isCurrent
                  ? 'bg-white border-2 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                  : isHighlight
                    ? 'bg-white border-2 border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md'
                    : 'bg-white border-slate-200 shadow-2xs hover:shadow-xs'
              }`}
            >
              {/* Category & Tier Ribbon */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {plan.tier}
                    </span>
                    {plan.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {plan.category.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  {isCurrent && (
                    <span className="text-xs font-black text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-black text-slate-900 brand-font mb-1">{plan.name}</h3>
                
                {/* Price Display */}
                <div className="flex items-baseline gap-1.5 mb-5 pb-4 border-b border-slate-100">
                  <span className="text-3xl sm:text-4xl font-black text-[#176B4D]">₹{plan.priceInr}</span>
                  <span className="text-xs text-slate-500 font-bold">
                    INR / {plan.billingCycle.replace('_', ' ').toLowerCase()}
                  </span>
                </div>

                {/* Features Checklist */}
                <ul className="space-y-3 text-xs text-slate-600 mb-6">
                  {Array.isArray(plan.featuresJson) &&
                    plan.featuresJson.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-black text-xs cursor-default flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Current Active Plan</span>
                  </button>
                ) : plan.tier === 'BASIC' ? (
                  <button
                    onClick={handleSelectBasicPlan}
                    disabled={actionLoading}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-black text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Select Basic Plan</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onSelectPlan(plan)}
                    className="w-full py-3 bg-[#2FA878] hover:bg-[#176B4D] text-white rounded-xl font-black text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <span>{currentTier === 'BASIC' ? 'Subscribe Now' : `Switch to ${plan.name}`}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {/* View Plan Details button */}
                <button
                  type="button"
                  onClick={() => setDetailModalPlan(plan)}
                  className="w-full py-2 text-slate-500 hover:text-slate-800 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors hover:underline"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Plan Details & Inclusions</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 6. VERIFIED PAYMENT RECEIPTS & INVOICES TABLE */}
      {payments.length > 0 && (
        <section className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-black text-slate-900 brand-font flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-700" />
                <span>Verified Payment History & Digital Invoices</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Compliant with Indian digital invoicing terms. Click any receipt to inspect GST tax breakdown.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Plan / Description</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Gateway</th>
                  <th className="pb-3">Transaction ID</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => {
                  const receiptNumber = p.receiptUrl ? p.receiptUrl.split('/').pop() : `REC-${p.id.slice(0, 6)}`;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 font-medium text-slate-700">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 font-extrabold text-slate-900">
                        {p.subscription?.plan?.name || 'Fitora Subscription'}
                      </td>
                      <td className="py-3.5 font-black text-slate-900">
                        ₹{p.amountInr} INR
                      </td>
                      <td className="py-3.5 text-slate-600 text-[11px]">
                        {p.paymentGateway}
                      </td>
                      <td className="py-3.5 font-mono text-[11px] text-slate-500">
                        {p.gatewayPaymentId}
                      </td>
                      <td className="py-3.5">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={async () => {
                            try {
                              const res = await api.get(`/payments/receipt/${receiptNumber}`);
                              if (res.success) setSelectedReceipt(res.receipt);
                            } catch {
                              showToast('Failed to load invoice.', 'error');
                            }
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Receipt</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* MODAL 1: VIEW PLAN DETAILS */}
      {detailModalPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative my-auto">
            <button
              onClick={() => setDetailModalPlan(null)}
              aria-label="Close modal"
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {detailModalPlan.tier} Tier Specifications
            </span>
            <h3 className="text-2xl font-black text-slate-900 brand-font mt-1">
              {detailModalPlan.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Category: <strong className="text-slate-700">{detailModalPlan.category || 'All Users'}</strong> • Duration: {detailModalPlan.billingCycle.replace('_', ' ')}
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 my-4 flex items-baseline justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Plan Pricing</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#176B4D]">₹{detailModalPlan.priceInr}</span>
                  <span className="text-xs text-slate-500 font-bold">INR (Includes 18% GST)</span>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                Cancel Anytime
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Included In This Plan:</h4>
              <ul className="space-y-2.5 text-xs text-slate-600">
                {Array.isArray(detailModalPlan.featuresJson) &&
                  detailModalPlan.featuresJson.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 space-y-1 mb-5">
              <p className="font-bold flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-emerald-700" />
                <span>Transparent Renewal & Cancellation Terms</span>
              </p>
              <p className="text-emerald-800 leading-relaxed">
                You can pause auto-renewal anytime from your dashboard with one click. Entitlements continue until the end of your billing cycle.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setDetailModalPlan(null)}
                className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50"
              >
                Close
              </button>

              {!isCurrentPlan(detailModalPlan) && (
                <button
                  onClick={() => {
                    const target = detailModalPlan;
                    setDetailModalPlan(null);
                    if (target.tier === 'BASIC') {
                      handleSelectBasicPlan();
                    } else {
                      onSelectPlan(target);
                    }
                  }}
                  className="flex-1 py-3 bg-[#2FA878] hover:bg-[#176B4D] text-white rounded-xl font-black text-xs shadow-xs"
                >
                  {detailModalPlan.tier === 'BASIC' ? 'Select Basic Plan' : `Subscribe (₹${detailModalPlan.priceInr})`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: MANAGE SUBSCRIPTION */}
      {manageModalOpen && currentSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setManageModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-900 brand-font mb-1 flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-700" />
              <span>Manage Subscription</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Modify renewal settings or adjust billing options for your {currentSub.plan?.name}.
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2.5 mb-5">
              <div className="flex justify-between">
                <span className="text-slate-500">Plan:</span>
                <span className="font-bold text-slate-800">{currentSub.plan?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Billing Interval:</span>
                <span className="font-bold text-slate-800">{currentSub.billingInterval}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-black text-emerald-700">₹{currentSub.amount} INR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Auto-Renewal:</span>
                <span className={`font-bold ${currentSub.cancelAtPeriodEnd ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {currentSub.cancelAtPeriodEnd ? 'PAUSED (Will not renew)' : 'ACTIVE (Renews automatically)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Access Until:</span>
                <span className="font-bold text-slate-900">
                  {new Date(currentSub.currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleToggleAutoRenewal}
                disabled={actionLoading}
                className="w-full py-3 rounded-xl border border-slate-300 font-extrabold text-xs text-slate-800 hover:bg-slate-50"
              >
                {currentSub.cancelAtPeriodEnd ? 'Resume Auto-Renewal' : 'Pause Auto-Renewal at Period End'}
              </button>

              <button
                onClick={() => {
                  setManageModalOpen(false);
                  setCancelModalOpen(true);
                }}
                className="w-full py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs transition-colors"
              >
                Cancel Subscription Immediately
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CANCEL CONFIRMATION */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setCancelModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-slate-900 brand-font mb-1">
              Cancel Subscription?
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              We are sorry to see you go. Choose whether you want to pause auto-renewal (retaining benefits until period end) or cancel immediately.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  handleToggleAutoRenewal();
                  setCancelModalOpen(false);
                }}
                disabled={actionLoading}
                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
              >
                Pause Auto-Renewal (Keep benefits until {new Date(currentSub?.currentPeriodEnd || Date.now()).toLocaleDateString()})
              </button>

              <button
                onClick={handleImmediateCancel}
                disabled={actionLoading}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs"
              >
                Cancel Immediately & Revoke Paid Features
              </button>

              <button
                onClick={() => setCancelModalOpen(false)}
                className="w-full py-2.5 text-slate-500 hover:text-slate-800 font-bold text-xs"
              >
                Keep My Subscription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DIGITAL TAX INVOICE RECEIPT VIEWER */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-200 pb-4 mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Digital Tax Invoice
              </span>
              <h3 className="text-xl font-black text-slate-900 brand-font mt-1">Fitora Wellness Platform</h3>
              <p className="text-[11px] text-slate-500">Invoice #{selectedReceipt.receiptNumber}</p>
            </div>

            <div className="space-y-3 text-xs mb-5">
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="font-semibold text-slate-800">{new Date(selectedReceipt.date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-semibold text-slate-800">{selectedReceipt.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-mono text-slate-700">{selectedReceipt.customerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subscription Plan:</span>
                <span className="font-extrabold text-slate-900">{selectedReceipt.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Gateway:</span>
                <span className="font-medium text-slate-700">{selectedReceipt.paymentGateway}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono text-[11px] text-slate-600">{selectedReceipt.gatewayPaymentId}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>₹{selectedReceipt.subtotalInr || selectedReceipt.amountInr} INR</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST (18%):</span>
                  <span>₹{selectedReceipt.gstInr || 0} INR</span>
                </div>
                <div className="flex justify-between font-black text-sm text-[#176B4D] pt-1">
                  <span>Total Paid:</span>
                  <span>₹{selectedReceipt.amountInr} INR</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
