import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Droplets,
  Flame,
  Moon,
  Pill,
  Watch,
  PhoneCall,
  CheckCircle2,
  Circle,
  Plus,
  Play,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Dumbbell,
  Heart,
  Zap,
  Activity,
  AlertTriangle
} from 'lucide-react';

export default function DashboardPage({ onOpenEmergency, onOpenAICoach, onOpenPayment }) {
  const { user, seniorMode, category, tier } = useAuth();
  const { showToast } = useNotification();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingWater, setAddingWater] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard');
      if (res.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      showToast('Could not load dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleAddWater = async (amount) => {
    setAddingWater(true);
    try {
      const res = await api.post('/water/add', { amountMl: amount });
      if (res.success) {
        setDashboardData((prev) => ({
          ...prev,
          water: {
            amountMl: res.water.amountMl,
            targetMl: res.water.targetMl,
            percentage: Math.min(100, Math.round((res.water.amountMl / res.water.targetMl) * 100))
          }
        }));
        showToast(`+${amount}ml water added! Keep hydrating.`, 'success');
      }
    } catch (err) {
      showToast('Failed to add water.', 'error');
    } finally {
      setAddingWater(false);
    }
  };

  const handleToggleHabit = async (habitId) => {
    try {
      const res = await api.post('/habits/toggle', { habitId });
      if (res.success) {
        setDashboardData((prev) => ({
          ...prev,
          habits: res.today,
          streak: res.streak
        }));
        if (res.today.completionPercentage === 100) {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
          showToast('🎉 All habits completed for today! Amazing dedication.', 'success');
        }
      }
    } catch (err) {
      showToast('Failed to update habit.', 'error');
    }
  };

  const handleAcknowledgeMedicine = async (reminderId, medName) => {
    try {
      const res = await api.patch(`/medications/${reminderId}/acknowledge`);
      if (res.success) {
        setDashboardData((prev) => ({
          ...prev,
          medicineReminders: prev.medicineReminders.map((m) =>
            m.id === reminderId ? { ...m, acknowledgedToday: true } : m
          )
        }));
        showToast(`Marked ${medName} as taken!`, 'success');
      }
    } catch (err) {
      showToast('Failed to mark medicine as taken.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Activity className="w-8 h-8 text-[#2FA878] animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Assembling your personalized health companion...</p>
      </div>
    );
  }

  const d = dashboardData || {};
  const isSenior = d.isSenior;
  const habitsList = Array.isArray(d.habits?.habitsJson) ? d.habits.habitsJson : [];

  const categoryThemes = {
    ATHLETE: { label: 'Athlete Performance', icon: Zap, gradient: 'from-amber-600 to-orange-600' },
    SENIOR: { label: 'Senior Vitality', icon: Heart, gradient: 'from-emerald-700 to-teal-800' },
    GYM_FREAK: { label: 'Gym Freak Hypertrophy', icon: Dumbbell, gradient: 'from-purple-700 to-indigo-800' },
    NORMAL: { label: 'Everyday Wellness', icon: Activity, gradient: 'from-sky-600 to-blue-700' }
  };
  const currentTheme = categoryThemes[d.category] || categoryThemes.NORMAL;
  const CategoryIcon = currentTheme.icon;

  return (
    <div className={`w-full px-4 py-4 space-y-5 pb-24 ${isSenior ? 'senior-mode' : ''}`}>
      
      {/* 1. Welcome & Greeting Banner */}
      <div className={`rounded-3xl p-5 sm:p-6 text-white bg-gradient-to-r ${currentTheme.gradient} shadow-md relative overflow-hidden flex flex-col items-start justify-between gap-4`}>
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
              {currentTheme.label}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/25">
              {d.subscriptionTier} TIER
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black brand-font leading-tight">
            Namaste, {d.profile?.fullName || 'Health Seeker'}!
          </h1>
          <p className="text-xs text-white/90 leading-relaxed">
            {isSenior
              ? 'Here is your gentle daily care plan: stay hydrated, take your medicines on time, and enjoy a slow stroll.'
              : d.category === 'ATHLETE'
              ? 'Target high athletic intensity, maintain adequate electrolyte saturation, and prioritize muscle recovery.'
              : d.category === 'GYM_FREAK'
              ? 'Focus on progressive overload resistance, hit your daily protein macro, and push for maximum muscle stimulus.'
              : 'Keep up your daily active habits, drink wholesome water, and enjoy balanced home-cooked meals.'}
          </p>
        </div>

        {/* Action Widgets in Header */}
        <div className="relative z-10 flex w-full">
          <button
            onClick={onOpenAICoach}
            className="w-full py-2.5 px-4 rounded-xl bg-white text-slate-900 font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Chat with AI Wellness Coach</span>
          </button>
        </div>
      </div>

      {/* CANONICAL SINGLE SOS BUTTON (Strictly ONE location in the entire app, fixed & accessible on Home/Dashboard) */}
      <button
        onClick={onOpenEmergency}
        aria-label="Emergency SOS"
        title="Emergency SOS Quick Assistance (112 / 108 / Personal Emergency Contact)"
        className="fixed top-20 sm:top-24 right-4 sm:right-8 z-30 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg border-2 border-white transition-all active:scale-95 cursor-pointer hover:shadow-xl"
      >
        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
          <PhoneCall className="w-3.5 h-3.5 fill-white text-rose-600" />
        </div>
        <span className="tracking-wider font-extrabold">SOS</span>
      </button>

      {/* 2. Top Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Streak Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-orange-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Habit Streak</p>
            <h3 className="text-2xl font-black text-slate-900 brand-font">
              {d.streak?.currentStreak || 0} <span className="text-xs font-medium text-slate-400">days</span>
            </h3>
            <p className="text-[11px] text-emerald-700 font-bold">Best: {d.streak?.longestStreak || 0} days</p>
          </div>
        </div>

        {/* Water Intake Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <Droplets className="w-6 h-6 fill-sky-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Hydration Today</p>
            <h3 className="text-2xl font-black text-slate-900 brand-font">
              {d.water?.amountMl || 0} <span className="text-xs font-medium text-slate-400">/ {d.water?.targetMl} ml</span>
            </h3>
            <p className="text-[11px] text-sky-700 font-bold">{d.water?.percentage}% of daily goal</p>
          </div>
        </div>

        {/* Sleep Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Moon className="w-6 h-6 fill-purple-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Last Night Sleep</p>
            <h3 className="text-2xl font-black text-slate-900 brand-font">
              {d.latestSleep?.durationHours || 7.5} <span className="text-xs font-medium text-slate-400">hrs</span>
            </h3>
            <p className="text-[11px] text-purple-700 font-bold">Quality: {d.latestSleep?.qualityRating || 8}/10</p>
          </div>
        </div>

        {/* Workouts Completed */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Workouts Logged</p>
            <h3 className="text-2xl font-black text-slate-900 brand-font">
              {d.completedWorkoutsCount || 0} <span className="text-xs font-medium text-slate-400">sessions</span>
            </h3>
            <Link to="/workouts" className="text-[11px] text-emerald-700 font-bold hover:underline">
              Browse exercises →
            </Link>
          </div>
        </div>
      </div>

      {/* 3. SENIOR SPECIAL WIDGET: Prominent Medicine Reminders & Caregiver Emergency Alert */}
      {isSenior && (
        <div className="p-6 rounded-3xl bg-amber-50/70 border-2 border-amber-300 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-amber-200/80 rounded-xl text-amber-900">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-amber-950 brand-font">
                  Today's Medicine Schedule & Acknowledgement
                </h3>
                <p className="text-xs text-amber-800">
                  Senior Care: Please take each medicine with water as prescribed by your doctor.
                </p>
              </div>
            </div>
            <Link
              to="/medicine"
              className="text-xs font-extrabold text-amber-900 bg-white border border-amber-300 px-3 py-1.5 rounded-xl hover:bg-amber-100"
            >
              Manage Prescriptions
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {d.medicineReminders?.length > 0 ? (
              d.medicineReminders.map((med) => (
                <div
                  key={med.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    med.acknowledgedToday
                      ? 'bg-emerald-50 border-emerald-300'
                      : 'bg-white border-amber-200 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                        {med.scheduleTime}
                      </span>
                      {med.acknowledgedToday && (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Taken
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-sm text-slate-900 mt-1">{med.medicineName}</p>
                    <p className="text-xs text-slate-600">{med.dosage}</p>
                  </div>

                  {!med.acknowledgedToday && (
                    <button
                      onClick={() => handleAcknowledgeMedicine(med.id, med.medicineName)}
                      className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-2xs"
                    >
                      ✓ Mark as Taken Now
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 col-span-3">No medicine reminders configured yet.</p>
            )}
          </div>
        </div>
      )}

      {/* 4. Main Two Column Section: Habits Checklist + Hydration Interactive Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Today's Habit Checklist */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 brand-font">Today's Health Habits Checklist</h3>
              <p className="text-xs text-slate-500">Check off daily tasks to maintain your habit streak</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-extrabold text-[#176B4D]">
                {d.habits?.completionPercentage || 0}%
              </span>
              <p className="text-[10px] text-slate-400">Completed</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#2FA878] to-[#3197C8] transition-all duration-500"
              style={{ width: `${d.habits?.completionPercentage || 0}%` }}
            />
          </div>

          <div className="space-y-2.5 pt-2">
            {habitsList.map((habit) => (
              <div
                key={habit.id}
                onClick={() => handleToggleHabit(habit.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  habit.completed
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold'
                    : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {habit.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300" />
                  )}
                  <span className={`text-sm ${habit.completed ? 'line-through text-slate-500' : ''}`}>
                    {habit.label}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-medium">Tap to toggle</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Quick Water Hydration Box */}
        <div className="p-6 rounded-3xl bg-gradient-to-b from-sky-50 to-white border border-sky-200 shadow-xs space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sky-800 font-bold text-sm">
                <Droplets className="w-5 h-5 fill-sky-500" />
                <span>Hydration Tracker</span>
              </div>
              <span className="text-xs font-semibold text-slate-500">{d.water?.amountMl} / {d.water?.targetMl} ml</span>
            </div>

            {/* Visual Glass Fill Bar */}
            <div className="w-full bg-sky-100 rounded-2xl h-8 overflow-hidden p-1 border border-sky-200 mb-4 flex items-center">
              <div
                className="h-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-300"
                style={{ width: `${d.water?.percentage || 0}%` }}
              />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Drinking adequate water boosts mitochondrial output, reduces joint friction, and improves mental acuity.
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t border-sky-100">
            <p className="text-xs font-bold text-slate-700">Quick Log Water:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={addingWater}
                onClick={() => handleAddWater(250)}
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-sky-50 border border-sky-300 text-sky-900 font-extrabold text-xs flex items-center justify-center gap-1 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+250 ml Glass</span>
              </button>
              <button
                disabled={addingWater}
                onClick={() => handleAddWater(500)}
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-sky-50 border border-sky-300 text-sky-900 font-extrabold text-xs flex items-center justify-center gap-1 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+500 ml Bottle</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Recommended Workouts for user's category */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900 brand-font">Recommended Workouts For You</h3>
            <p className="text-xs text-slate-500">
              Calibrated for {currentTheme.label} with estimated calorie expenditure
            </p>
          </div>
          <Link to="/workouts" className="text-xs font-bold text-emerald-700 hover:underline">
            View All Workouts →
          </Link>
        </div>

        <div className="flex gap-3.5 overflow-x-auto pb-2 pt-1 no-scrollbar">
          {d.recommendedWorkouts?.map((ex) => (
            <div
              key={ex.id}
              className="min-w-[220px] max-w-[220px] rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between shrink-0"
            >
              {ex.mediaUrl && (
                <div className="h-28 overflow-hidden relative">
                  <img
                    src={ex.mediaUrl}
                    alt={ex.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs">
                    {ex.difficulty}
                  </span>
                </div>
              )}
              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{ex.name}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{ex.muscleGroup}</p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 border-t border-slate-100 pt-2 font-medium">
                  <span>~{ex.estimatedCalories} kcal</span>
                  <span>{ex.sets ? `${ex.sets}x${ex.reps}` : `${ex.durationSeconds}s`}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Recommended Meals & Recipes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 brand-font">Wholesome Recipes</h3>
            <p className="text-xs text-slate-500">Balanced macronutrients</p>
          </div>
          <Link to="/nutrition" className="text-xs font-bold text-emerald-700 hover:underline">
            View All →
          </Link>
        </div>

        <div className="flex gap-3.5 overflow-x-auto pb-2 pt-1 no-scrollbar">
          {d.recommendedRecipes?.map((rec) => (
            <div key={rec.id} className="min-w-[220px] max-w-[220px] rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between shrink-0">
              {rec.imageUrl && (
                <div className="h-28 overflow-hidden">
                  <img src={rec.imageUrl} alt={rec.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-3.5 space-y-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                  {rec.mealType}
                </span>
                <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{rec.title}</h4>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-semibold">
                  <span>🔥 {rec.calories} kcal</span>
                  <span className="text-emerald-700">{rec.proteinGrams}g Protein</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
