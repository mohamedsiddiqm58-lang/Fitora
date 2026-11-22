import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import {
  PhoneCall,
  AlertTriangle,
  X,
  ShieldAlert,
  HeartHandshake,
  CheckCircle,
  HelpCircle,
  Smartphone,
  ChevronRight,
  ShieldCheck,
  UserPlus
} from 'lucide-react';

export default function EmergencyModal({ isOpen, onClose }) {
  const [emergencyData, setEmergencyData] = useState(null);
  const [confirmingCall, setConfirmingCall] = useState(null); // { label, number, type }
  const [dialerLaunched, setDialerLaunched] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfirmingCall(null);
      setDialerLaunched(false);
      api.get('/emergency')
        .then((res) => {
          if (res.success) setEmergencyData(res);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirmAndDial = (callInfo) => {
    api.post('/emergency/log-shortcut-tap', {
      contactType: callInfo.type,
      targetNumber: callInfo.number
    }).catch(() => {});

    setDialerLaunched(true);
    // Launch device telephony dialer
    window.location.href = `tel:${callInfo.number}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border-2 border-rose-300 relative my-auto">
        <button
          onClick={onClose}
          aria-label="Close emergency dialog"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 text-rose-600 mb-4 pb-3 border-b border-rose-100">
          <div className="p-3 bg-rose-100 rounded-2xl text-rose-600 shrink-0">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                Official SOS Shortcut
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black brand-font text-rose-700 mt-0.5">
              Emergency Assistance
            </h3>
            <p className="text-xs text-slate-500">Fast telephone shortcuts for medical and safety response</p>
          </div>
        </div>

        {/* Confirmation Step (Prevents Accidental Calls) */}
        {confirmingCall ? (
          <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-center space-y-4 animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center mx-auto">
              <PhoneCall className="w-7 h-7 animate-pulse" />
            </div>

            <div>
              <p className="text-xs uppercase font-extrabold text-rose-800 tracking-wider">Confirm Call Request</p>
              <h4 className="text-xl font-black text-slate-900 mt-1">
                {confirmingCall.label}
              </h4>
              <p className="text-2xl font-black text-rose-700 font-mono mt-1">
                {confirmingCall.number}
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              Tapping below will launch your device’s native phone dialer with <strong>{confirmingCall.number}</strong>. Confirm to proceed.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleConfirmAndDial(confirmingCall)}
                className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Confirm & Open Phone Dialer</span>
              </button>

              <button
                type="button"
                onClick={() => setConfirmingCall(null)}
                className="py-3 px-4 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : dialerLaunched ? (
          /* Post-dial state */
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-3">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="text-lg font-bold text-slate-900">Device Dialer Opened</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your device dialer has been launched. Please complete the call in your phone application. If calling is unavailable on this device, please manually dial on a phone.
            </p>
            <button
              onClick={() => {
                setDialerLaunched(false);
                onClose();
              }}
              className="py-2.5 px-6 bg-emerald-700 text-white rounded-xl font-bold text-xs"
            >
              Done / Return to Fitora
            </button>
          </div>
        ) : (
          /* Standard Emergency Choices */
          <div className="space-y-4">
            
            {/* Device Compatibility Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-[11px]">
                <p className="font-bold text-amber-950">Accidental Call Protection & Device Compatibility:</p>
                <p>
                  To prevent accidental calls, selecting an option requires explicit confirmation. On mobile devices, your phone app will open to dial. On desktop computers without calling hardware, please dial these numbers manually on your mobile phone.
                </p>
              </div>
            </div>

            {/* Official Indian Helplines Grid */}
            <div className="space-y-2">
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                Official Indian Responders:
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmingCall({
                    label: 'National Emergency Response System (Police, Fire, Ambulance)',
                    number: '112',
                    type: 'NATIONAL_EMERGENCY'
                  })}
                  className="flex items-center justify-between p-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold shadow-xs hover:shadow transition-all text-left group"
                >
                  <div>
                    <p className="text-[10px] text-white/80 font-semibold uppercase">National Emergency</p>
                    <p className="text-2xl font-black brand-font tracking-tight">112</p>
                  </div>
                  <PhoneCall className="w-5 h-5 text-white/80 group-hover:scale-110 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmingCall({
                    label: 'Medical Ambulance & Healthcare Responders',
                    number: '108',
                    type: 'AMBULANCE'
                  })}
                  className="flex items-center justify-between p-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold shadow-xs hover:shadow transition-all text-left group"
                >
                  <div>
                    <p className="text-[10px] text-white/80 font-semibold uppercase">Medical Ambulance</p>
                    <p className="text-2xl font-black brand-font tracking-tight">108</p>
                  </div>
                  <PhoneCall className="w-5 h-5 text-white/80 group-hover:scale-110 transition-transform" />
                </button>
              </div>

              {/* Elder Line for Senior Citizens */}
              <button
                type="button"
                onClick={() => setConfirmingCall({
                  label: 'Elder Line (National Senior Citizen Helpline)',
                  number: '14567',
                  type: 'SENIOR_HELPLINE'
                })}
                className="w-full flex items-center justify-between p-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold shadow-xs transition-all text-left"
              >
                <div>
                  <p className="text-[10px] text-emerald-100 font-semibold uppercase">Senior Citizen Dedicated Care</p>
                  <p className="text-base font-black">Elder Line (14567)</p>
                </div>
                <HeartHandshake className="w-5 h-5 text-emerald-200" />
              </button>
            </div>

            {/* Saved Personal Emergency Contact */}
            <div className="pt-2 border-t border-slate-200">
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                Personal Emergency Contact:
              </p>

              {emergencyData?.primaryContact?.name && emergencyData?.primaryContact?.phone ? (
                <div className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-extrabold text-slate-900 text-xs">
                      {emergencyData.primaryContact.name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {emergencyData.primaryContact.relation || 'Caregiver'} • {emergencyData.primaryContact.phone}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfirmingCall({
                      label: `Personal Contact: ${emergencyData.primaryContact.name}`,
                      number: emergencyData.primaryContact.phone,
                      type: 'PERSONAL_CONTACT'
                    })}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs shrink-0"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Contact</span>
                  </button>
                </div>
              ) : (
                <div className="border border-dashed border-slate-300 rounded-2xl p-3.5 text-center bg-slate-50 space-y-1.5">
                  <p className="text-xs text-slate-500 font-medium">No personal emergency contact saved.</p>
                  <Link
                    to="/profile"
                    onClick={onClose}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Configure Emergency Contact in Profile</span>
                  </Link>
                </div>
              )}
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 py-1"
              >
                Close Emergency Window
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
