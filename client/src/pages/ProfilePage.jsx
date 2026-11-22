import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  User,
  ShieldCheck,
  PhoneCall,
  Heart,
  Save,
  Plus,
  Trash2,
  Lock,
  Eye,
  CheckCircle2,
  Bell,
  Clock,
  Sparkles,
  Shield,
  ArrowRight,
  LogOut,
  AlertTriangle,
  UserCheck,
  Settings,
  Mail,
  Calendar
} from 'lucide-react';

const CATEGORIES = [
  { id: 'ATHLETE', label: 'Athlete', desc: 'Performance, sports nutrition & recovery', emoji: '⚡' },
  { id: 'SENIOR', label: 'Senior Citizen', desc: 'Gentle mobility, medication alerts & large fonts', emoji: '👵' },
  { id: 'GYM_FREAK', label: 'Gym Freak', desc: 'Hypertrophy splits, macros & progressive overload', emoji: '💪' },
  { id: 'NORMAL', label: 'Normal Person', desc: 'Sustainable everyday fitness, hydration & balance', emoji: '🏃' }
];

export default function ProfilePage() {
  const { user, seniorMode, toggleSeniorMode, switchCategory, refreshUser, logout, tier } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subSummary, setSubSummary] = useState(null);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    fullName: '',
    age: '',
    gender: '',
    heightCm: '',
    weightKg: '',
    country: 'India',
    location: '',
    activityLevel: 'Moderate',
    selectedCategory: 'NORMAL',
    somatotype: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: '',
    emergencyConsent: true,
    seniorModeEnabled: false
  });

  // Notification Preferences State
  const [notifications, setNotifications] = useState({
    browserEnabled: true,
    checkinTime: '09:00',
    medicineAlerts: true,
    workoutReminders: true,
    habitReminders: true
  });

  const [healthConditions, setHealthConditions] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [newCondition, setNewCondition] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const fetchProfileAndSubscription = async () => {
    try {
      const [profileRes, subRes] = await Promise.all([
        api.get('/profile'),
        api.get('/subscriptions/current')
      ]);

      if (profileRes.success && profileRes.profile) {
        setProfileData({
          fullName: profileRes.profile.fullName || '',
          age: profileRes.profile.age || '',
          gender: profileRes.profile.gender || '',
          heightCm: profileRes.profile.heightCm || '',
          weightKg: profileRes.profile.weightKg || '',
          country: profileRes.profile.country || 'India',
          location: profileRes.profile.location || '',
          activityLevel: profileRes.profile.activityLevel || 'Moderate',
          selectedCategory: profileRes.profile.selectedCategory || 'NORMAL',
          somatotype: profileRes.profile.somatotype || '',
          emergencyName: profileRes.profile.emergencyName || '',
          emergencyPhone: profileRes.profile.emergencyPhone || '',
          emergencyRelation: profileRes.profile.emergencyRelation || '',
          emergencyConsent: profileRes.profile.emergencyConsent ?? true,
          seniorModeEnabled: profileRes.profile.seniorModeEnabled ?? false
        });

        if (profileRes.notificationPreferences) {
          setNotifications(profileRes.notificationPreferences);
        }

        setHealthConditions(profileRes.healthConditions || []);
        setAllergies(profileRes.allergies || []);
      }

      if (subRes.success) {
        setSubSummary({
          tier: subRes.currentTier,
          subscription: subRes.subscription,
          features: subRes.availableFeatures || []
        });
      }
    } catch (err) {
      showToast('Failed to load profile details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndSubscription();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/profile', {
        ...profileData,
        notifications
      });
      if (res.success) {
        showToast('Profile, emergency contacts & notifications updated!', 'success');
        if (profileData.selectedCategory !== user?.profile?.selectedCategory) {
          await switchCategory(profileData.selectedCategory);
        }
        await refreshUser();
      }
    } catch (err) {
      showToast(err.message || 'Failed to save profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCondition = async () => {
    if (!newCondition.trim()) return;
    try {
      const res = await api.post('/profile/health-conditions', { conditionName: newCondition.trim() });
      if (res.success) {
        setHealthConditions((prev) => [...prev, res.condition]);
        setNewCondition('');
        showToast('Health condition added.', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to add condition.', 'error');
    }
  };

  const handleDeleteCondition = async (id) => {
    try {
      const res = await api.delete(`/profile/health-conditions/${id}`);
      if (res.success) {
        setHealthConditions((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      showToast('Failed to remove condition.', 'error');
    }
  };

  const handleAddAllergy = async () => {
    if (!newAllergy.trim()) return;
    try {
      const res = await api.post('/profile/allergies', { allergen: newAllergy.trim() });
      if (res.success) {
        setAllergies((prev) => [...prev, res.allergy]);
        setNewAllergy('');
        showToast('Allergy recorded.', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to add allergy.', 'error');
    }
  };

  const handleDeleteAllergy = async (id) => {
    try {
      const res = await api.delete(`/profile/allergies/${id}`);
      if (res.success) {
        setAllergies((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      showToast('Failed to remove allergy.', 'error');
    }
  };

  const handleSignOut = () => {
    setShowSignOutConfirm(false);
    logout();
    showToast('You have been securely signed out.', 'info');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading user profile & account settings...</p>
      </div>
    );
  }

  return (
    <div className={`w-full py-4 space-y-7 pb-24 max-w-4xl mx-auto ${seniorMode ? 'senior-mode' : ''}`}>
      
      {/* 1. Header with Avatar & User Summary */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#176B4D] to-[#2FA878] flex items-center justify-center text-white font-black text-2xl shadow-sm">
            {profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 brand-font">{profileData.fullName || 'Fitora Member'}</h1>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {tier} Plan
              </span>
            </div>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Current Category: <strong className="text-slate-700">{profileData.selectedCategory}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-[#2FA878] hover:bg-[#176B4D] disabled:opacity-50 text-white font-black text-xs shadow-xs flex items-center gap-2 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
        </button>
      </div>

      {/* 2. CURRENT SUBSCRIPTION SUMMARY CARD */}
      <section className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white border border-emerald-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-700 text-white">
                Active Subscription Summary
              </span>
              <span className="text-xs font-bold text-slate-600">
                {subSummary?.subscription?.plan?.name || 'Free Basic Tier'}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {subSummary?.subscription ? (
                <>
                  Active until <strong className="text-slate-900">{new Date(subSummary.subscription.currentPeriodEnd).toLocaleDateString()}</strong>
                  {subSummary.subscription.cancelAtPeriodEnd && ' (Auto-renewal paused)'}
                </>
              ) : (
                'You are currently enjoying the Free Basic plan with lifetime fitness tracking.'
              )}
            </p>
          </div>

          <Link
            to="/subscriptions"
            className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-black shadow-2xs flex items-center gap-2 transition-colors shrink-0"
          >
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>View & Manage Full Plans</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
          </Link>
        </div>

        {subSummary?.features?.length > 0 && (
          <div className="pt-2 border-t border-emerald-100 flex flex-wrap gap-2">
            {subSummary.features.slice(0, 3).map((feat, idx) => (
              <span key={idx} className="text-[11px] bg-white px-2.5 py-1 rounded-lg border border-emerald-200 text-emerald-900 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{feat}</span>
              </span>
            ))}
          </div>
        )}
      </section>

      <form onSubmit={handleSave} className="space-y-7">
        
        {/* 3. SELECTED USER CATEGORY */}
        <section className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-black text-slate-900 brand-font">Selected Health Category</h2>
            <p className="text-xs text-slate-500">
              Your workouts, AI coaching, guidelines, and subscription options adapt to your chosen category.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => {
              const selected = profileData.selectedCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setProfileData({ ...profileData, selectedCategory: cat.id })}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selected
                      ? 'border-2 border-emerald-500 bg-emerald-50/50 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">{cat.emoji}</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      selected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {selected ? 'Active Category' : 'Select'}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900">{cat.label}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">{cat.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. PERSONAL DEMOGRAPHICS & BIOMETRICS */}
        <section className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-black text-slate-900 brand-font">Personal Demographics & Biometrics</h2>
            <p className="text-xs text-slate-500">Helps calibrate daily hydration goals and calorie baselines.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Age</label>
              <input
                type="number"
                min="10"
                max="120"
                value={profileData.age}
                onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                className="w-full px-3.5 py-2.5 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Gender</label>
              <select
                value={profileData.gender}
                onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                className="w-full px-3.5 py-2.5 border rounded-xl bg-white"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Height (cm)</label>
              <input
                type="number"
                value={profileData.heightCm}
                onChange={(e) => setProfileData({ ...profileData, heightCm: e.target.value })}
                placeholder="e.g. 172"
                className="w-full px-3.5 py-2.5 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.5"
                value={profileData.weightKg}
                onChange={(e) => setProfileData({ ...profileData, weightKg: e.target.value })}
                placeholder="e.g. 68.5"
                className="w-full px-3.5 py-2.5 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Activity Level</label>
              <select
                value={profileData.activityLevel}
                onChange={(e) => setProfileData({ ...profileData, activityLevel: e.target.value })}
                className="w-full px-3.5 py-2.5 border rounded-xl bg-white"
              >
                <option value="Sedentary">Sedentary (Little or no exercise)</option>
                <option value="Light">Lightly Active (1-3 days/week)</option>
                <option value="Moderate">Moderately Active (3-5 days/week)</option>
                <option value="Very Active">Very Active (6-7 days/week)</option>
                <option value="Athlete">Extra Active (Intense training / sports)</option>
              </select>
            </div>
          </div>
        </section>

        {/* 5. EMERGENCY CONTACT & CONSENT */}
        <section className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-rose-600" />
              <h2 className="text-base font-black text-slate-900 brand-font">Emergency Contact Settings</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Designate a primary contact for the one-tap emergency calling shortcut on your dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Name</label>
              <input
                type="text"
                value={profileData.emergencyName}
                onChange={(e) => setProfileData({ ...profileData, emergencyName: e.target.value })}
                placeholder="Caregiver / Relative"
                className="w-full px-3.5 py-2.5 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Phone Number</label>
              <input
                type="tel"
                value={profileData.emergencyPhone}
                onChange={(e) => setProfileData({ ...profileData, emergencyPhone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Relationship</label>
              <input
                type="text"
                value={profileData.emergencyRelation}
                onChange={(e) => setProfileData({ ...profileData, emergencyRelation: e.target.value })}
                placeholder="e.g. Daughter, Spouse, Coach"
                className="w-full px-3.5 py-2.5 border rounded-xl"
              />
            </div>
          </div>

          <label className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={profileData.emergencyConsent}
              onChange={(e) => setProfileData({ ...profileData, emergencyConsent: e.target.checked })}
              className="mt-0.5 rounded text-emerald-600"
            />
            <span className="text-xs text-slate-700 leading-snug">
              I explicitly consent to storing this contact for one-tap calling during emergency assistance.
            </span>
          </label>
        </section>

        {/* 6. NOTIFICATION PREFERENCES */}
        <section className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-700" />
              <h2 className="text-base font-black text-slate-900 brand-font">Notification Preferences</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize reminder timings and alert types sent by your health companion.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
              <span className="font-bold text-slate-800">Browser Push Notifications</span>
              <input
                type="checkbox"
                checked={notifications.browserEnabled}
                onChange={(e) => setNotifications({ ...notifications, browserEnabled: e.target.checked })}
                className="rounded text-emerald-600"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
              <span className="font-bold text-slate-800">Medicine Schedule Alerts</span>
              <input
                type="checkbox"
                checked={notifications.medicineAlerts}
                onChange={(e) => setNotifications({ ...notifications, medicineAlerts: e.target.checked })}
                className="rounded text-emerald-600"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
              <span className="font-bold text-slate-800">Workout & Movement Reminders</span>
              <input
                type="checkbox"
                checked={notifications.workoutReminders}
                onChange={(e) => setNotifications({ ...notifications, workoutReminders: e.target.checked })}
                className="rounded text-emerald-600"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
              <span className="font-bold text-slate-800">Habit Streak Coach Check-ins</span>
              <input
                type="checkbox"
                checked={notifications.habitReminders}
                onChange={(e) => setNotifications({ ...notifications, habitReminders: e.target.checked })}
                className="rounded text-emerald-600"
              />
            </label>
          </div>

          <div className="pt-2 flex items-center gap-3 text-xs">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-slate-700">Daily Wellness Check-in Time:</span>
            <input
              type="time"
              value={notifications.checkinTime}
              onChange={(e) => setNotifications({ ...notifications, checkinTime: e.target.value })}
              className="px-3 py-1.5 border rounded-xl text-xs font-mono font-bold bg-white"
            />
          </div>
        </section>

        {/* 7. HEALTH CONDITIONS & ALLERGIES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-black text-sm text-slate-900 brand-font">Medical & Health Conditions</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                placeholder="e.g. Hypertension, Arthritis"
                className="flex-1 px-3.5 py-2 border rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={handleAddCondition}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
              >
                Add
              </button>
            </div>

            <div className="space-y-1.5">
              {healthConditions.length === 0 ? (
                <p className="text-[11px] text-slate-400">No medical conditions recorded.</p>
              ) : (
                healthConditions.map((c) => (
                  <div key={c.id} className="p-2.5 bg-slate-50 rounded-xl border flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800">{c.conditionName}</span>
                    <button type="button" onClick={() => handleDeleteCondition(c.id)} className="text-slate-400 hover:text-rose-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-black text-sm text-slate-900 brand-font">Food Allergies & Intolerances</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                placeholder="e.g. Peanuts, Lactose, Gluten"
                className="flex-1 px-3.5 py-2 border rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={handleAddAllergy}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
              >
                Add
              </button>
            </div>

            <div className="space-y-1.5">
              {allergies.length === 0 ? (
                <p className="text-[11px] text-slate-400">No dietary allergies recorded.</p>
              ) : (
                allergies.map((a) => (
                  <div key={a.id} className="p-2.5 bg-slate-50 rounded-xl border flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800">{a.allergen}</span>
                    <button type="button" onClick={() => handleDeleteAllergy(a.id)} className="text-slate-400 hover:text-rose-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* 8. ACCOUNT SETTINGS & SECURITY */}
        <section className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-500" />
            <h2 className="text-base font-black text-slate-900 brand-font">Account Settings & Session</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Registered Email</span>
              <span className="font-mono font-bold text-slate-800">{user?.email}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Account Role</span>
              <span className="font-bold text-slate-800">{user?.role || 'USER'}</span>
            </div>
          </div>
        </section>

        {/* 9. SIGN OUT OPTION */}
        <section className="p-6 rounded-3xl bg-white border border-rose-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 brand-font flex items-center gap-2">
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Session Sign Out</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Terminates your current session and securely clears saved credentials from this device.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowSignOutConfirm(true)}
            className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-black text-xs transition-colors shrink-0 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </section>

        {/* Submit Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#2FA878] hover:bg-[#176B4D] disabled:opacity-50 text-white font-black text-sm shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Profile...' : 'Save Profile & Preferences'}</span>
          </button>
        </div>
      </form>

      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-lg font-black text-slate-900 brand-font">Sign Out of Fitora?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Your session will be cleared and you will be redirected to the sign-in page.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-xs"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
