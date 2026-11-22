import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import confetti from 'canvas-confetti';
import {
  Flame,
  CheckCircle2,
  Circle,
  Calendar,
  Award,
  Sparkles,
  TrendingUp,
  Heart
} from 'lucide-react';

export default function HabitsPage() {
  const { user, seniorMode } = useAuth();
  const { showToast } = useNotification();

  const [habitsData, setHabitsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHabits = async () => {
    try {
      const res = await api.get('/habits');
      if (res.success) {
        setHabitsData(res);
      }
    } catch (err) {
      showToast('Failed to load habit tracker.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleToggle = async (habitId) => {
    try {
      const res = await api.post('/habits/toggle', { habitId });
      if (res.success) {
        setHabitsData((prev) => ({
          ...prev,
          today: res.today,
          streak: res.streak
        }));
        if (res.today.completionPercentage === 100) {
          confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
          showToast('🌟 100% completion! Outstanding habit discipline today.', 'success');
        }
      }
    } catch (err) {
      showToast('Failed to toggle habit.', 'error');
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-xs text-slate-400">Loading daily habit matrix...</div>;
  }

  const today = habitsData?.today || {};
  const streak = habitsData?.streak || { currentStreak: 0, longestStreak: 0 };
  const habitsList = Array.isArray(today.habitsJson) ? today.habitsJson : [];
  const history = habitsData?.weeklyHistory || [];

  return (
    <div className={`w-full px-4 py-4 space-y-5 pb-24 ${seniorMode ? 'senior-mode' : ''}`}>
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200">
          Consistency & Milestones
        </span>
        <h1 className="text-3xl font-black text-slate-900 mt-2 brand-font">Habit & Streak System</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Track daily health commitments without harsh penalties for designated recovery days.
        </p>
      </div>

      {/* Streak Dashboard Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-600 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <Flame className="w-9 h-9 fill-white" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-90">Current Active Streak</span>
            <h2 className="text-4xl sm:text-5xl font-black brand-font">{streak.currentStreak} Days</h2>
            <p className="text-xs text-white/90 font-medium mt-1">
              Personal Best: {streak.longestStreak} consecutive days of self-care
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center sm:text-right">
          <p className="text-xs text-white/80">Today's Progress</p>
          <p className="text-3xl font-black brand-font">{today.completionPercentage}%</p>
          <p className="text-[11px] text-white/90">
            {today.completionPercentage >= 60 ? '✓ Streak extended for today!' : 'Complete 60% to extend streak'}
          </p>
        </div>
      </div>

      {/* Checklist */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 brand-font">Today's Tasks</h3>
          <span className="text-xs text-slate-400 font-medium">Click to check or uncheck</span>
        </div>

        <div className="space-y-3">
          {habitsList.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggle(item.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                item.completed
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                  : 'bg-slate-50/60 hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100 shrink-0" />
                ) : (
                  <Circle className="w-6 h-6 text-slate-300 shrink-0" />
                )}
                <div>
                  <p className={`text-sm ${item.completed ? 'line-through text-slate-500' : ''}`}>
                    {item.label}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {item.completed ? 'Completed' : 'Pending for today'}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {item.completed ? 'Done' : 'Tap'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly History Timeline */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-lg font-black text-slate-900 brand-font flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-700" />
          <span>Last 7 Days Activity</span>
        </h3>

        <div className="grid grid-cols-7 gap-2 pt-2">
          {history.length > 0 ? (
            history.map((log) => {
              const dateObj = new Date(log.date);
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNum = dateObj.getDate();

              return (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1"
                >
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{dayName}</p>
                  <p className="text-sm font-black text-slate-800">{dayNum}</p>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${log.completionPercentage}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-emerald-800 font-bold">{log.completionPercentage}%</p>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-400 col-span-7 text-center py-4">
              Your weekly history will build day by day as you complete daily goals.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
