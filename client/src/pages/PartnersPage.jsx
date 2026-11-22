import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Users,
  Building2,
  Stethoscope,
  Apple,
  Star,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Calendar,
  X,
  Tag,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PartnersPage() {
  const { user, seniorMode, tier } = useAuth();
  const { showToast } = useNotification();

  const [partners, setPartners] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingPartner, setBookingPartner] = useState(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingNotes, setBookingNotes] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);

  const fetchPartners = async () => {
    try {
      const endpoint = filterType ? `/partners?type=${filterType}` : '/partners';
      const res = await api.get(endpoint);
      if (res.success) {
        setPartners(res.partners || []);
      }
    } catch (err) {
      showToast('Failed to load partner directory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [filterType]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setSubmittingBooking(true);
    try {
      const res = await api.post('/partners/book', {
        partnerId: bookingPartner.id,
        serviceId: bookingPartner.services?.[0]?.id || null,
        bookingDate,
        notes: bookingNotes
      });

      if (res.success) {
        showToast(res.message, 'success');
        setBookingPartner(null);
      }
    } catch (err) {
      showToast(err.message || 'Booking submission failed.', 'error');
    } finally {
      setSubmittingBooking(false);
    }
  };

  return (
    <div className={`w-full px-4 py-4 space-y-5 pb-24 ${seniorMode ? 'senior-mode' : ''}`}>
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200">
          Wellness Network & Directory
        </span>
        <h1 className="text-3xl font-black text-slate-900 mt-2 brand-font">Verified Partner Network</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Direct access to partner gyms, senior healthcare hospitals, and sports nutrition providers across India.
        </p>
      </div>

      {/* Demonstration Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
        <strong>Partner Network Disclosure:</strong> Partner listings displayed represent authorized network directories and clearly labelled demonstration records. Services and discounts are fulfilled directly by partner organizations.
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { label: 'All Partners', val: '' },
          { label: 'Gyms & Training Studios', val: 'GYM', icon: Building2 },
          { label: 'Hospitals & Geriatric Care', val: 'HOSPITAL', icon: Stethoscope },
          { label: 'Nutrition & Supplements', val: 'NUTRITION', icon: Apple }
        ].map((item) => (
          <button
            key={item.val}
            onClick={() => setFilterType(item.val)}
            className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
              filterType === item.val
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {item.icon && <item.icon className="w-3.5 h-3.5" />}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Partner Cards Grid */}
      {loading ? (
        <div className="text-center py-20 text-xs text-slate-400">Loading verified partner directory...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {partners.map((p) => (
            <div
              key={p.id}
              className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {p.partnerType}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{p.rating}</span>
                  </div>
                </div>

                <h3 className="font-extrabold text-lg text-slate-900 brand-font mb-1">{p.name}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{p.city}</span>
                </p>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {p.description}
                </p>

                {p.discountOffer && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-bold flex items-center gap-2 mb-4">
                    <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{p.discountOffer}</span>
                  </div>
                )}

                {/* Services */}
                {p.services?.length > 0 && (
                  <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                    <p className="font-bold text-slate-700">Available Package:</p>
                    {p.services.map((s) => (
                      <div key={s.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex justify-between items-center font-bold text-slate-800">
                          <span>{s.title}</span>
                          <span className="text-emerald-700">₹{s.priceInr}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                {tier === 'PREMIUM' ? (
                  <button
                    onClick={() => setBookingPartner(p)}
                    className="w-full py-2.5 rounded-xl bg-[#2FA878] hover:bg-[#176B4D] text-white font-extrabold text-xs shadow-2xs"
                  >
                    Book Appointment / Enquire
                  </button>
                ) : (
                  <Link
                    to="/subscriptions"
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-extrabold text-xs border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Unlock Booking with Premium</span>
                  </Link>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {p.phone || 'Helpline'}
                  </span>
                  <a
                    href={p.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-0.5 text-emerald-700 font-bold hover:underline"
                  >
                    <span>Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Appointment / Enquiry Modal */}
      {bookingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setBookingPartner(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900 brand-font mb-1">
              Book with {bookingPartner.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">{bookingPartner.discountOffer || 'Exclusive Fitora Member Privileges'}</p>

            <form onSubmit={handleBooking} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Preferred Date</label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Appointment Notes / Special Care Request</label>
                <textarea
                  rows={3}
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="e.g. Senior mobility checkup, trainer schedule, or supplement delivery instructions"
                  className="w-full px-3.5 py-2.5 border rounded-xl"
                />
              </div>

              <button
                type="submit"
                disabled={submittingBooking}
                className="w-full py-3 bg-[#2FA878] hover:bg-[#176B4D] text-white font-extrabold text-sm rounded-xl shadow-xs"
              >
                {submittingBooking ? 'Transmitting Request...' : 'Confirm Appointment Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
