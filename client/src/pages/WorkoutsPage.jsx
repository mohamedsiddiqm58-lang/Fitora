import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Dumbbell,
  Clock,
  Flame,
  ShieldAlert,
  Play,
  CheckCircle,
  Filter,
  Eye,
  X,
  Plus
} from 'lucide-react';

export default function WorkoutsPage() {
  const { user, seniorMode, category } = useAuth();
  const { showToast } = useNotification();

  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [loggingExercise, setLoggingExercise] = useState(null);
  const [filterCategory, setFilterCategory] = useState(category || '');
  const [seniorFriendlyOnly, setSeniorFriendlyOnly] = useState(seniorMode);
  const [loading, setLoading] = useState(true);

  // Log form state
  const [logDuration, setLogDuration] = useState('20');
  const [logCalories, setLogCalories] = useState('80');
  const [logFeedback, setLogFeedback] = useState('Felt energized and well-paced');
  const [submittingLog, setSubmittingLog] = useState(false);

  const fetchExercises = async () => {
    try {
      let endpoint = `/workouts?`;
      if (filterCategory) endpoint += `category=${filterCategory}&`;
      if (seniorFriendlyOnly) endpoint += `seniorFriendly=true&`;

      const res = await api.get(endpoint);
      if (res.success) {
        setExercises(res.exercises || []);
      }
    } catch (err) {
      showToast('Failed to load exercises.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [filterCategory, seniorFriendlyOnly]);

  const handleLogWorkout = async (e) => {
    e.preventDefault();
    setSubmittingLog(true);
    try {
      const res = await api.post('/workouts/log', {
        exerciseId: loggingExercise?.id,
        workoutTitle: loggingExercise?.name || 'General Exercise Session',
        durationMinutes: logDuration,
        caloriesBurned: logCalories,
        feedback: logFeedback
      });

      if (res.success) {
        showToast('Workout session recorded! Calories and streak updated.', 'success');
        setLoggingExercise(null);
      }
    } catch (err) {
      showToast(err.message || 'Failed to log workout session.', 'error');
    } finally {
      setSubmittingLog(false);
    }
  };

  return (
    <div className={`w-full px-4 py-4 space-y-5 pb-24 ${seniorMode ? 'senior-mode' : ''}`}>
      
      {/* Header */}
      <div className="flex flex-col gap-3 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200">
            Exercise & Mobility Library
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2 brand-font">Workout Programs</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Certified routines with step-by-step techniques, safety notes, and calorie estimates.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
          >
            <option value="">All Categories</option>
            <option value="ATHLETE">Athletes</option>
            <option value="SENIOR">Senior Citizens</option>
            <option value="GYM_FREAK">Gym Freaks</option>
            <option value="NORMAL">Normal Everyday</option>
          </select>

          <button
            onClick={() => setSeniorFriendlyOnly(!seniorFriendlyOnly)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              seniorFriendlyOnly
                ? 'bg-emerald-100 border-emerald-300 text-emerald-900 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-emerald-700" />
            <span>Senior Friendly Only</span>
          </button>
        </div>
      </div>

      {/* Grid of Exercises */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs">Loading exercise library...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((ex) => (
            <div
              key={ex.id}
              className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="h-44 overflow-hidden relative">
                {ex.mediaUrl && (
                  <img src={ex.mediaUrl} alt={ex.name} className="w-full h-full object-cover" />
                )}
                <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 text-white backdrop-blur-xs">
                  {ex.difficulty}
                </span>
                {ex.isSeniorFriendly && (
                  <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                    Senior Safe
                  </span>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 brand-font">{ex.name}</h3>
                  <p className="text-xs text-emerald-800 font-semibold mt-0.5">{ex.muscleGroup}</p>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                    {ex.instructions}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-500" /> ~{ex.estimatedCalories} kcal
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {ex.sets ? `${ex.sets} sets × ${ex.reps} reps` : `${ex.durationSeconds}s`}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedExercise(ex)}
                      className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
                    >
                      Instructions
                    </button>
                    <button
                      onClick={() => {
                        setLoggingExercise(ex);
                        setLogCalories(String(ex.estimatedCalories || 80));
                      }}
                      className="py-2 px-3.5 rounded-xl bg-[#2FA878] hover:bg-[#176B4D] text-white text-xs font-extrabold shadow-2xs transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Log</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exercise Details Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedExercise(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-900 brand-font mb-1">{selectedExercise.name}</h3>
            <p className="text-xs text-emerald-800 font-bold mb-4">{selectedExercise.muscleGroup}</p>

            {selectedExercise.mediaUrl && (
              <img
                src={selectedExercise.mediaUrl}
                alt={selectedExercise.name}
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
            )}

            <div className="space-y-4 text-xs">
              <div>
                <p className="font-bold text-slate-800 uppercase tracking-wider mb-1">Step-by-Step Instructions</p>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedExercise.instructions}
                </p>
              </div>

              {selectedExercise.safetyNotes && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                  <p className="font-bold flex items-center gap-1.5 mb-1">
                    <ShieldAlert className="w-4 h-4 text-amber-600" /> Safety Notes
                  </p>
                  <p>{selectedExercise.safetyNotes}</p>
                </div>
              )}

              {selectedExercise.modifications && (
                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-900">
                  <p className="font-bold mb-1">Modifications & Regressions</p>
                  <p>{selectedExercise.modifications}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setLoggingExercise(selectedExercise);
                setLogCalories(String(selectedExercise.estimatedCalories || 80));
                setSelectedExercise(null);
              }}
              className="mt-6 w-full py-3 bg-[#2FA878] hover:bg-[#176B4D] text-white font-extrabold text-sm rounded-xl"
            >
              Complete & Log This Exercise
            </button>
          </div>
        </div>
      )}

      {/* Log Workout Modal */}
      {loggingExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setLoggingExercise(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900 brand-font mb-1">Log Completed Workout</h3>
            <p className="text-xs text-slate-500 mb-4">{loggingExercise.name}</p>

            <form onSubmit={handleLogWorkout} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  required
                  value={logDuration}
                  onChange={(e) => setLogDuration(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Estimated Calories Burned</label>
                <input
                  type="number"
                  required
                  value={logCalories}
                  onChange={(e) => setLogCalories(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Personal Notes / RPE Feedback</label>
                <input
                  type="text"
                  value={logFeedback}
                  onChange={(e) => setLogFeedback(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <button
                type="submit"
                disabled={submittingLog}
                className="w-full py-3 bg-[#2FA878] text-white font-bold rounded-xl hover:bg-[#176B4D]"
              >
                {submittingLog ? 'Saving...' : 'Save to Workout Logs'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
