import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  Heart,
  Zap,
  Dumbbell,
  Activity
} from 'lucide-react';

export default function OnboardingWizardPage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const selectedCategory = searchParams.get('category') || user?.profile?.selectedCategory || 'NORMAL';
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [answers, setAnswers] = useState({
    // General
    age: user?.profile?.age || '',
    gender: user?.profile?.gender || '',
    heightCm: user?.profile?.heightCm || '',
    weightKg: user?.profile?.weightKg || '',
    activityLevel: user?.profile?.activityLevel || 'Moderate',
    // Athlete
    sport: 'Cricket / Track & Field',
    competitiveLevel: 'Collegiate / Semi-Pro',
    performanceGoal: 'Speed & Aerobic Endurance',
    trainingDaysPerWeek: '5',
    trainingHoursPerDay: '2.5',
    // Senior
    healthConditions: ['Mild Joint Stiffness'],
    mobilityLevel: 'Can walk independently 20-30 mins',
    medicationsSummary: 'Blood pressure tablets in the morning',
    emergencyName: '',
    emergencyPhone: '',
    emergencyConsent: true,
    // Gym Freak
    gymGoal: 'Hypertrophy & Muscle Gain',
    trainingExperience: '2-4 Years',
    workoutPreference: 'Strength & Progressive Resistance',
    somatotype: 'Mesomorph',
    dailyProteinTarget: '140g - 160g',
    // Normal Person
    fitnessGoal: 'Healthy weight, steady stamina, and habit consistency',
    workoutLocation: 'Home Workouts (Low Equipment)',
    dailyWaterGoal: '2500ml',
    sleepTarget: '7-8 hours',
    dietPreference: 'Vegetarian / Flexitarian'
  });

  const handleChange = (field, value) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxToggle = (field, item) => {
    setAnswers((prev) => {
      const list = prev[field] || [];
      if (list.includes(item)) {
        return { ...prev, [field]: list.filter((i) => i !== item) };
      } else {
        return { ...prev, [field]: [...list, item] };
      }
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.post('/onboarding/submit', {
        category: selectedCategory,
        answers
      });

      if (res.success) {
        showToast('Onboarding saved! Your dashboard is customized.', 'success');
        await refreshUser();
        navigate('/dashboard');
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit onboarding answers.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const categoryHeaders = {
    ATHLETE: { title: 'Athlete Onboarding', icon: Zap, color: 'text-amber-700 bg-amber-50' },
    SENIOR: { title: 'Senior Vitality Profile', icon: Heart, color: 'text-emerald-700 bg-emerald-50' },
    GYM_FREAK: { title: 'Gym Freak Performance Split', icon: Dumbbell, color: 'text-purple-700 bg-purple-50' },
    NORMAL: { title: 'Everyday Health & Habit Setup', icon: Activity, color: 'text-sky-700 bg-sky-50' }
  };

  const currentHeader = categoryHeaders[selectedCategory] || categoryHeaders.NORMAL;
  const Icon = currentHeader.icon;

  return (
    <div className="w-full px-4 py-4 max-w-md mx-auto space-y-4 pb-20">
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentHeader.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 brand-font">{currentHeader.title}</h2>
              <p className="text-xs text-slate-500">Step {currentStep} of 2 • Tailoring your health parameters</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs text-slate-400 hover:text-slate-700 font-medium"
          >
            Skip for now →
          </button>
        </div>

        {/* Step 1: Biometrics & Core Profile */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              1. Basic Biometrics & Vital Statistics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  value={answers.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  placeholder="e.g. 28 or 65"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                <select
                  value={answers.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={answers.heightCm}
                  onChange={(e) => handleChange('heightCm', e.target.value)}
                  placeholder="e.g. 172"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={answers.weightKg}
                  onChange={(e) => handleChange('weightKg', e.target.value)}
                  placeholder="e.g. 70"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Current Activity Level</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Sedentary', 'Light Activity', 'Moderate', 'Very Active'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleChange('activityLevel', lvl)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                      answers.activityLevel === lvl
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 rounded-xl bg-[#2FA878] hover:bg-[#176B4D] text-white font-extrabold text-sm flex items-center gap-2 shadow-xs"
              >
                <span>Continue to {currentHeader.title}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Category-Specific Questionnaire */}
        {currentStep === 2 && (
          <div className="space-y-6">
            
            {/* Athlete Specific Questions */}
            {selectedCategory === 'ATHLETE' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider">
                  Athlete Training & Sports Recovery Parameters
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Primary Sport</label>
                    <input
                      type="text"
                      value={answers.sport}
                      onChange={(e) => handleChange('sport', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Competitive Level</label>
                    <select
                      value={answers.competitiveLevel}
                      onChange={(e) => handleChange('competitiveLevel', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    >
                      <option value="Club / Recreational">Club / Recreational</option>
                      <option value="Collegiate / Semi-Pro">Collegiate / Semi-Pro</option>
                      <option value="Professional / National">Professional / National</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Training Days / Week</label>
                    <select
                      value={answers.trainingDaysPerWeek}
                      onChange={(e) => handleChange('trainingDaysPerWeek', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    >
                      <option value="3">3 Days (Maintenance)</option>
                      <option value="4">4 Days</option>
                      <option value="5">5 Days (Standard)</option>
                      <option value="6">6 Days (Intensive)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Training Hours / Day</label>
                    <input
                      type="text"
                      value={answers.trainingHoursPerDay}
                      onChange={(e) => handleChange('trainingHoursPerDay', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Senior Specific Questions */}
            {selectedCategory === 'SENIOR' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider">
                  Senior Health & Emergency Contact Setup
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Known Health Conditions (Select any that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {['Blood Pressure / Hypertension', 'Type 2 Diabetes', 'Knee / Joint Pain', 'Heart Care Routine'].map((cond) => (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => handleCheckboxToggle('healthConditions', cond)}
                        className={`p-3 rounded-xl border text-left font-semibold transition-all ${
                          answers.healthConditions?.includes(cond)
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-2xs font-bold'
                            : 'border-slate-200 text-slate-700'
                        }`}
                      >
                        {answers.healthConditions?.includes(cond) ? '✓ ' : '+ '}{cond}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <ShieldAlert className="w-4 h-4 text-emerald-700" />
                    <span>Emergency Contact (With Explicit Consent)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={answers.emergencyName}
                      onChange={(e) => handleChange('emergencyName', e.target.value)}
                      placeholder="Caregiver / Relative Name"
                      className="px-3 py-2 bg-white rounded-xl border border-emerald-200 text-xs"
                    />
                    <input
                      type="tel"
                      value={answers.emergencyPhone}
                      onChange={(e) => handleChange('emergencyPhone', e.target.value)}
                      placeholder="Phone Number (e.g. +91 98765 43210)"
                      className="px-3 py-2 bg-white rounded-xl border border-emerald-200 text-xs"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-[11px] text-emerald-800 font-medium">
                    <input
                      type="checkbox"
                      checked={answers.emergencyConsent}
                      onChange={(e) => handleChange('emergencyConsent', e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>I consent to saving this contact for one-tap emergency calling within Fitora.</span>
                  </label>
                </div>
              </div>
            )}

            {/* Gym Freak Specific Questions */}
            {selectedCategory === 'GYM_FREAK' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-purple-800 uppercase tracking-wider">
                  Hypertrophy Goals & Educational Somatotype
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Primary Goal</label>
                    <select
                      value={answers.gymGoal}
                      onChange={(e) => handleChange('gymGoal', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    >
                      <option value="Hypertrophy & Muscle Gain">Hypertrophy & Muscle Gain</option>
                      <option value="Fat Loss & Definition">Fat Loss & Definition</option>
                      <option value="Powerlifting / Max Strength">Powerlifting / Max Strength</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Educational Somatotype</label>
                    <select
                      value={answers.somatotype}
                      onChange={(e) => handleChange('somatotype', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    >
                      <option value="Mesomorph">Mesomorph (Athletic / Fast Response)</option>
                      <option value="Ectomorph">Ectomorph (Lean / Fast Metabolism)</option>
                      <option value="Endomorph">Endomorph (Solid / Higher Fat Storage Tendency)</option>
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">Used for educational training personalization.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Normal Person Specific Questions */}
            {selectedCategory === 'NORMAL' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-sky-800 uppercase tracking-wider">
                  Lifestyle Habits & Routine Targets
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Workout Location</label>
                    <select
                      value={answers.workoutLocation}
                      onChange={(e) => handleChange('workoutLocation', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    >
                      <option value="Home Workouts (Low Equipment)">Home Workouts (Low Equipment)</option>
                      <option value="Outdoor Walking & Jogging">Outdoor Walking & Jogging</option>
                      <option value="Gym & Fitness Studio">Gym & Fitness Studio</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Sleep / Night</label>
                    <select
                      value={answers.sleepTarget}
                      onChange={(e) => handleChange('sleepTarget', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    >
                      <option value="7-8 hours">7 - 8 Hours (Recommended)</option>
                      <option value="6-7 hours">6 - 7 Hours</option>
                      <option value="8+ hours">8+ Hours</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-7 py-3 rounded-xl bg-[#2FA878] hover:bg-[#176B4D] disabled:opacity-50 text-white font-extrabold text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                {loading ? 'Personalizing Dashboard...' : 'Complete & Launch Dashboard'}
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
