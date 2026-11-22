import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RunnerIcon from '../components/RunnerIcon';
import PhoneFullscreenModal from '../components/PhoneFullscreenModal';
import { ArrowRight, Sparkles, UserCheck, Maximize, Minimize, Smartphone, QrCode } from 'lucide-react';

export default function WelcomeScreen({ onGetStarted }) {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [demoOpen, setDemoOpen] = useState(false);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));

  const handleStart = () => {
    // Attempt entering hardware fullscreen if user has gesture interaction
    if (!document.fullscreenElement && window.innerWidth < 768) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    }
    if (onGetStarted) {
      onGetStarted();
    } else {
      navigate('/onboarding');
    }
  };

  const handleQuickDemo = async (email, pass) => {
    setLoggingIn(true);
    try {
      await login(email, pass);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoggingIn(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="relative w-full min-h-[100dvh] bg-[#F9FBF9] flex flex-col justify-between items-center px-6 py-6 sm:py-8 overflow-hidden select-none">
      
      {/* Decorative Soft Pastel Circles Matching Reference Image */}
      {/* 1. Mint Circle (Top Left) */}
      <div className="absolute -top-12 -left-12 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-[#D7EFE3] pointer-events-none" />

      {/* 2. Soft Blue Circle (Mid-Upper Right) */}
      <div className="absolute top-36 right-6 sm:right-16 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#E1F0F8] pointer-events-none" />

      {/* 3. Soft Warm Cream Circle (Bottom Right) */}
      <div className="absolute bottom-16 right-4 sm:right-12 w-32 h-32 sm:w-44 sm:h-44 rounded-full bg-[#F8F3E4] pointer-events-none" />

      {/* Top Bar / Actions */}
      <div className="w-full max-w-md flex items-center justify-between z-10 pt-2 gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleFullscreen}
            className="text-xs font-bold px-2.5 py-1.5 rounded-full bg-white/85 backdrop-blur-xs border border-slate-200 text-slate-700 shadow-2xs hover:bg-white flex items-center gap-1 cursor-pointer transition-all"
            title="Toggle Browser Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Full Screen'}</span>
          </button>

          <button
            onClick={() => setPhoneModalOpen(true)}
            className="text-xs font-bold px-2.5 py-1.5 rounded-full bg-white/85 backdrop-blur-xs border border-emerald-300 text-emerald-800 shadow-2xs hover:bg-white flex items-center gap-1 cursor-pointer transition-all"
            title="Open on Phone (Full Screen App)"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Open on Phone</span>
          </button>
        </div>

        <button
          onClick={() => setDemoOpen(!demoOpen)}
          className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/85 backdrop-blur-xs border border-slate-200 text-slate-700 shadow-2xs hover:bg-white cursor-pointer"
        >
          {user ? `Logged in: ${user.profile?.fullName?.split(' ')[0]}` : '⚡ Quick Demos'}
        </button>
      </div>

      {/* Quick Demo Personas Dropdown Sheet */}
      {demoOpen && (
        <div className="absolute top-16 right-6 z-30 bg-white rounded-2xl p-4 shadow-xl border border-slate-200 w-64 space-y-2 animate-fadeIn">
          <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Select A Demo Module:</p>
          <div className="grid grid-cols-1 gap-1.5 text-xs">
            <button
              onClick={() => handleQuickDemo('senior@fitora.com', 'fitora123')}
              className="p-2 text-left rounded-xl hover:bg-emerald-50 text-slate-700 font-bold flex items-center gap-2 cursor-pointer"
            >
              <span>👵</span> Senior Citizen (Vitality & Meds)
            </button>
            <button
              onClick={() => handleQuickDemo('athlete@fitora.com', 'fitora123')}
              className="p-2 text-left rounded-xl hover:bg-amber-50 text-slate-700 font-bold flex items-center gap-2 cursor-pointer"
            >
              <span>⚡</span> Athlete (Performance & Recovery)
            </button>
            <button
              onClick={() => handleQuickDemo('gym@fitora.com', 'fitora123')}
              className="p-2 text-left rounded-xl hover:bg-purple-50 text-slate-700 font-bold flex items-center gap-2 cursor-pointer"
            >
              <span>💪</span> Gym Freak (Hypertrophy Splits)
            </button>
            <button
              onClick={() => handleQuickDemo('user@fitora.com', 'fitora123')}
              className="p-2 text-left rounded-xl hover:bg-sky-50 text-slate-700 font-bold flex items-center gap-2 cursor-pointer"
            >
              <span>🏃</span> Everyday Wellness (Habits & Diet)
            </button>
          </div>
        </div>
      )}

      {/* Main Center Branding - Exact Match */}
      <div className="flex-1 flex flex-col items-center justify-center text-center z-10 max-w-sm w-full my-auto space-y-7">
        
        {/* Rounded Squircle App Icon with Green-to-Blue Gradient and Runner Figure */}
        <div className="relative group">
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-[36px] sm:rounded-[40px] bg-gradient-to-b from-[#2EAC6E] via-[#2BA483] to-[#2B9FD4] shadow-[0_16px_35px_rgba(43,172,110,0.30)] flex items-center justify-center overflow-hidden transform transition-transform group-hover:scale-105 duration-300">
            {/* Subtle inner highlight */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/30 pointer-events-none" />
            <RunnerIcon className="w-20 h-20 sm:w-22 sm:h-22 drop-shadow-md" />
          </div>
        </div>

        {/* Brand Name + Golden Sparkle Icon */}
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center gap-2">
            <h1 className="text-4xl sm:text-5xl font-black text-[#19242E] tracking-tight brand-font">
              Fitora
            </h1>
            {/* Golden Sparkle SVG matching the exact four-pointed star in the reference image */}
            <svg
              className="w-8 h-8 sm:w-9 sm:h-9 text-[#F59E0B] fill-[#F59E0B] drop-shadow-xs animate-pulse"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
            </svg>
          </div>

          {/* Tagline */}
          <p className="text-base sm:text-lg font-medium text-[#64748B] tracking-normal">
            Your AI-Powered Health Companion
          </p>
        </div>

        {/* 5 Health Emojis Row matching reference image */}
        <div className="flex items-center justify-center gap-5 sm:gap-6 text-2xl sm:text-3xl py-1">
          <span className="hover:scale-125 transition-transform cursor-pointer" title="Strength">💪</span>
          <span className="hover:scale-125 transition-transform cursor-pointer" title="Healthy Nutrition">🥗</span>
          <span className="hover:scale-125 transition-transform cursor-pointer" title="Hydration">💧</span>
          <span className="hover:scale-125 transition-transform cursor-pointer" title="Mind & Recovery">🧘</span>
          <span className="hover:scale-125 transition-transform cursor-pointer" title="Habits & Burn">🔥</span>
        </div>

        {/* Pill-shaped Get Started Button */}
        <div className="w-full pt-4 space-y-4">
          <button
            onClick={handleStart}
            className="w-full py-4 px-8 rounded-full bg-gradient-to-r from-[#24A36B] to-[#2FA878] hover:from-[#1E8D5B] hover:to-[#279B68] text-white font-extrabold text-lg sm:text-xl shadow-[0_12px_28px_rgba(36,163,107,0.38)] hover:shadow-[0_16px_34px_rgba(36,163,107,0.48)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {/* Small golden sparkle inside button */}
            <svg className="w-6 h-6 text-[#FDE047] fill-[#FDE047]" viewBox="0 0 24 24">
              <path d="M12 2L14 9L21 11L14 13L12 20L10 13L3 11L10 9L12 2Z" />
            </svg>
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-0.5 stroke-[2.5]" />
          </button>

          {/* Subtitle Caption */}
          <p className="text-xs sm:text-sm font-medium text-[#94A3B8]">
            Personalized fitness • Nutrition • Wellness
          </p>
        </div>
      </div>

      {/* Bottom Area: Sign-in link & Native Home Indicator */}
      <div className="w-full flex flex-col items-center gap-4 z-10 pb-2">
        <div className="text-xs text-slate-500 flex gap-2">
          <span>Already have an account?</span>
          <button
            onClick={() => navigate('/login')}
            className="text-emerald-700 font-extrabold hover:underline cursor-pointer"
          >
            Sign In
          </button>
        </div>

        {/* iOS / Mobile Home Indicator Bar matching the image */}
        <div className="w-32 h-1 bg-[#475569] rounded-full opacity-70" />
      </div>

      {/* Phone and Full Screen Instructions Modal */}
      <PhoneFullscreenModal
        isOpen={phoneModalOpen}
        onClose={() => setPhoneModalOpen(false)}
      />
    </div>
  );
}
