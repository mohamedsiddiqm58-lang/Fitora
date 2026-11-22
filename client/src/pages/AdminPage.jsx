import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  ShieldAlert,
  Users,
  CreditCard,
  Building2,
  Activity,
  DollarSign,
  CheckCircle,
  XCircle,
  Plus,
  Edit2,
  Save,
  Lock,
  List
} from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [userList, setUserList] = useState([]);
  const [plans, setPlans] = useState([]);
  const [partnerList, setPartnerList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Plan Price state
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [newPrice, setNewPrice] = useState('');

  // Add Partner form
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerType, setNewPartnerType] = useState('GYM');
  const [newPartnerCity, setNewPartnerCity] = useState('');
  const [newPartnerOffer, setNewPartnerOffer] = useState('');

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, plansRes, partnersRes, auditRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/plans'),
        api.get('/admin/partners'),
        api.get('/admin/audit-logs')
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success) setUserList(usersRes.users || []);
      if (plansRes.success) setPlans(plansRes.plans || []);
      if (partnersRes.success) setPartnerList(partnersRes.partners || []);
      if (auditRes.success) setAuditLogs(auditRes.logs || []);
    } catch (err) {
      showToast(err.message || 'Administrative access rejected.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdatePrice = async (planId) => {
    if (!newPrice) return;
    try {
      const res = await api.put(`/admin/plans/${planId}`, { priceInr: newPrice });
      if (res.success) {
        showToast('Plan price updated successfully in PostgreSQL!', 'success');
        setEditingPlanId(null);
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed to update plan price.', 'error');
    }
  };

  const handleTogglePartner = async (partnerId) => {
    try {
      const res = await api.patch(`/admin/partners/${partnerId}/verify`);
      if (res.success) {
        showToast('Partner status updated.', 'success');
        fetchAdminData();
      }
    } catch (err) {
      showToast('Status update failed.', 'error');
    }
  };

  const handleCreatePartner = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/partners', {
        name: newPartnerName,
        partnerType: newPartnerType,
        city: newPartnerCity,
        discountOffer: newPartnerOffer
      });

      if (res.success) {
        showToast('New partner registered & verified!', 'success');
        setNewPartnerName('');
        setNewPartnerCity('');
        setNewPartnerOffer('');
        fetchAdminData();
      }
    } catch (err) {
      showToast('Partner creation failed.', 'error');
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <Lock className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-xl font-black text-slate-900 brand-font">Administrative Privilege Required</h2>
        <p className="text-xs text-slate-500">
          This portal is protected by role-based authorization. Only authenticated administrators may inspect system operations.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-20 text-xs text-slate-400">Loading admin operations suite...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-800 uppercase tracking-wider px-3 py-1 bg-purple-50 rounded-full border border-purple-200">
            System Administration
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2 brand-font">Fitora Admin Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Platform governance, user management, plan pricing, and partner verifications.
          </p>
        </div>

        <div className="flex gap-2">
          {['overview', 'users', 'pricing', 'partners', 'audit'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <p className="text-xs text-slate-500 font-semibold">Total Accounts</p>
              <h3 className="text-3xl font-black text-slate-900 brand-font mt-1">{stats.totalUsers}</h3>
              <p className="text-[11px] text-emerald-700 font-bold">100% PostgreSQL verified</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <p className="text-xs text-slate-500 font-semibold">Active Subscriptions</p>
              <h3 className="text-3xl font-black text-emerald-700 brand-font mt-1">{stats.activeSubscriptions}</h3>
              <p className="text-[11px] text-slate-400">Paid & freemium tiers</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <p className="text-xs text-slate-500 font-semibold">Total Revenue</p>
              <h3 className="text-3xl font-black text-slate-900 brand-font mt-1">₹{stats.totalRevenueInr}</h3>
              <p className="text-[11px] text-emerald-700 font-bold">INR Verified Gateway</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <p className="text-xs text-slate-500 font-semibold">Verified Partners</p>
              <h3 className="text-3xl font-black text-purple-700 brand-font mt-1">{stats.totalPartners}</h3>
              <p className="text-[11px] text-slate-400">Gyms, clinics & nutrition</p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 brand-font">User Distribution Across 4 Modules</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.usersByCategory?.map((item) => (
                <div key={item.selectedCategory || 'NORMAL'} className="p-4 bg-slate-50 rounded-2xl border text-center">
                  <p className="text-xs text-slate-500 font-bold uppercase">{item.selectedCategory || 'NORMAL'}</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{item._count?.selectedCategory || 1}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 brand-font">User Accounts & Subscription Tiers</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Module</th>
                  <th className="pb-3">Subscription Tier</th>
                  <th className="pb-3">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userList.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 font-bold text-slate-900">{u.fullName || 'User'}</td>
                    <td className="py-3 text-slate-600">{u.email}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-slate-800">{u.category || 'NORMAL'}</td>
                    <td className="py-3 font-bold text-emerald-700">{u.tier} ({u.planName})</td>
                    <td className="py-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PRICING CONFIG */}
      {activeTab === 'pricing' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 brand-font">Dynamic Subscription Pricing & Tier Config</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Plan Name</th>
                  <th className="pb-3">Tier</th>
                  <th className="pb-3">Module</th>
                  <th className="pb-3">Current Price (INR)</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {plans.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 font-bold text-slate-900">{p.name}</td>
                    <td className="py-3 font-semibold text-slate-700">{p.tier}</td>
                    <td className="py-3 text-slate-600">{p.category || 'Global'}</td>
                    <td className="py-3">
                      {editingPlanId === p.id ? (
                        <input
                          type="number"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          className="w-24 px-2 py-1 border rounded text-xs font-bold"
                        />
                      ) : (
                        <span className="font-extrabold text-emerald-800">₹{p.priceInr}</span>
                      )}
                    </td>
                    <td className="py-3">
                      {editingPlanId === p.id ? (
                        <button
                          onClick={() => handleUpdatePrice(p.id)}
                          className="px-3 py-1 bg-emerald-600 text-white rounded font-bold text-xs"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingPlanId(p.id);
                            setNewPrice(String(p.priceInr));
                          }}
                          className="px-3 py-1 border rounded hover:bg-slate-50 font-bold text-xs"
                        >
                          Edit Price
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PARTNERS */}
      {activeTab === 'partners' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 brand-font">Register New Verified Partner</h3>
            <form onSubmit={handleCreatePartner} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <input
                type="text"
                required
                value={newPartnerName}
                onChange={(e) => setNewPartnerName(e.target.value)}
                placeholder="Partner Entity Name"
                className="px-3 py-2 border rounded-xl"
              />
              <select
                value={newPartnerType}
                onChange={(e) => setNewPartnerType(e.target.value)}
                className="px-3 py-2 border rounded-xl"
              >
                <option value="GYM">Gym / Fitness Center</option>
                <option value="HOSPITAL">Hospital / Clinic</option>
                <option value="NUTRITION">Nutrition / Supplements</option>
              </select>
              <input
                type="text"
                required
                value={newPartnerCity}
                onChange={(e) => setNewPartnerCity(e.target.value)}
                placeholder="Operating Cities"
                className="px-3 py-2 border rounded-xl"
              />
              <input
                type="text"
                value={newPartnerOffer}
                onChange={(e) => setNewPartnerOffer(e.target.value)}
                placeholder="Discount Offer (e.g. 20% off)"
                className="px-3 py-2 border rounded-xl"
              />
              <button
                type="submit"
                className="sm:col-span-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs"
              >
                Register & Verify Partner
              </button>
            </form>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 brand-font">Partner Verification Directory</h3>
            <div className="space-y-3">
              {partnerList.map((part) => (
                <div key={part.id} className="p-4 bg-slate-50 rounded-2xl border flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{part.name} ({part.partnerType})</p>
                    <p className="text-slate-500">{part.city} • {part.discountOffer}</p>
                  </div>
                  <button
                    onClick={() => handleTogglePartner(part.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold ${part.isVerified ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}`}
                  >
                    {part.isVerified ? '✓ Verified' : 'Unverified'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 brand-font flex items-center gap-2">
            <List className="w-5 h-5 text-purple-700" />
            <span>Security & Compliance Audit Trail</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Resource</th>
                  <th className="pb-3">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-2.5 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="py-2.5 font-bold text-purple-900">{log.action}</td>
                    <td className="py-2.5 text-slate-700 font-mono text-[11px]">{log.resource}</td>
                    <td className="py-2.5 text-slate-500">{log.user?.email || 'System'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
