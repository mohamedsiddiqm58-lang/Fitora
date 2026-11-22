import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Pill,
  Clock,
  Plus,
  Bell,
  CheckCircle2,
  Trash2,
  AlertCircle,
  X,
  Volume2
} from 'lucide-react';

export default function MedicineRemindersPage() {
  const { user, seniorMode } = useAuth();
  const { showToast, browserPermission, requestBrowserPermission } = useNotification();

  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Reminder Form State
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [scheduleTime, setScheduleTime] = useState('08:30');
  const [daysOfWeek, setDaysOfWeek] = useState('Everyday');
  const [instructions, setInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReminders = async () => {
    try {
      const res = await api.get('/medications');
      if (res.success) {
        setReminders(res.reminders || []);
      }
    } catch (err) {
      showToast('Failed to load medicine schedule.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/medications', {
        medicineName: name,
        dosage,
        scheduleTime,
        daysOfWeek,
        instructions
      });

      if (res.success) {
        showToast('Medicine reminder scheduled!', 'success');
        setReminders((prev) => [...prev, res.reminder]);
        setIsModalOpen(false);
        setName('');
        setDosage('');
        setInstructions('');
      }
    } catch (err) {
      showToast(err.message || 'Failed to create reminder.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await api.patch(`/medications/${id}/toggle`);
      if (res.success) {
        setReminders((prev) => prev.map((r) => (r.id === id ? res.reminder : r)));
      }
    } catch (err) {
      showToast('Failed to toggle reminder status.', 'error');
    }
  };

  const handleAcknowledge = async (id, medName) => {
    try {
      const res = await api.patch(`/medications/${id}/acknowledge`);
      if (res.success) {
        setReminders((prev) => prev.map((r) => (r.id === id ? res.reminder : r)));
        showToast(`Marked ${medName} as taken for today!`, 'success');
      }
    } catch (err) {
      showToast('Failed to mark as taken.', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/medications/${id}`);
      if (res.success) {
        setReminders((prev) => prev.filter((r) => r.id !== id));
        showToast('Medicine reminder removed.', 'info');
      }
    } catch (err) {
      showToast('Failed to remove reminder.', 'error');
    }
  };

  return (
    <div className={`w-full px-4 py-4 space-y-5 pb-24 ${seniorMode ? 'senior-mode' : ''}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider px-3 py-1 bg-amber-50 rounded-full border border-amber-200">
            Timely Health Adherence
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2 brand-font">Medicine Schedule & Reminders</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Never miss prescribed medications. Accurate reminders entered exclusively by you.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-[#2FA878] hover:bg-[#176B4D] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medicine Schedule</span>
        </button>
      </div>

      {/* Browser Notification Permission Strip */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-xs sm:text-sm text-slate-900">
              Browser Reminder Alerts ({browserPermission === 'granted' ? 'Enabled' : 'Permission Required'})
            </p>
            <p className="text-xs text-slate-500">
              Browser notifications require active permissions and online browser connectivity. Delivery cannot be guaranteed if device is offline.
            </p>
          </div>
        </div>

        {browserPermission !== 'granted' && (
          <button
            onClick={requestBrowserPermission}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shrink-0"
          >
            Enable Browser Alerts
          </button>
        )}
      </div>

      {/* Medicine Reminders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 text-xs text-slate-400">Loading prescription schedules...</div>
        ) : reminders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reminders.map((med) => (
              <div
                key={med.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  med.acknowledgedToday
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : med.isEnabled
                    ? 'bg-white border-slate-200 shadow-xs'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg">
                      ⏰ {med.scheduleTime} ({med.daysOfWeek})
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggle(med.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          med.isEnabled
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-slate-200 text-slate-600 border-slate-300'
                        }`}
                      >
                        {med.isEnabled ? 'Active' : 'Paused'}
                      </button>
                      <button
                        onClick={() => handleDelete(med.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 brand-font">{med.medicineName}</h3>
                  <p className="text-xs text-slate-700 font-semibold mt-0.5">Dosage: {med.dosage}</p>
                  {med.instructions && (
                    <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      💡 {med.instructions}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                  {med.acknowledgedToday ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Taken Today</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAcknowledge(med.id, med.medicineName)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs"
                    >
                      ✓ Mark as Taken Today
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
            <Pill className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700">No Medicine Reminders Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your daily or evening prescribed pills, drops, or tablets to receive timely alerts.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-[#2FA878] text-white rounded-xl text-xs font-bold"
            >
              Add First Medicine
            </button>
          </div>
        )}
      </div>

      {/* Add Reminder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900 brand-font mb-1">Add Medicine Schedule</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter prescribed details accurately as given by your doctor.
            </p>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Medicine Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Amlodipine 5mg"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Prescribed Dosage</label>
                <input
                  type="text"
                  required
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g. 1 tablet once daily with water"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reminder Time</label>
                  <input
                    type="time"
                    required
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Frequency</label>
                  <select
                    value={daysOfWeek}
                    onChange={(e) => setDaysOfWeek(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  >
                    <option value="Everyday">Everyday</option>
                    <option value="Weekdays">Weekdays (Mon-Fri)</option>
                    <option value="Alternate Days">Alternate Days</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Instructions (Optional)</label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Take immediately after breakfast"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                ⚠️ Fitora is an automated reminder utility and will never independently alter your dosage. Always consult your treating physician.
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#2FA878] hover:bg-[#176B4D] text-white font-extrabold text-sm rounded-xl shadow-xs"
              >
                {submitting ? 'Saving...' : 'Save Medicine Reminder'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
