import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Home,
  Dumbbell,
  Apple,
  Shield,
  User,
  Sparkles,
  Eye,
  Maximize,
  Minimize,
  ArrowLeft,
  Smartphone,
  LogOut,
  ChevronDown,
  ShieldAlert,
  Settings,
  Heart
} from 'lucide-react';
import PhoneFullscreenModal from './PhoneFullscreenModal';

export default function MobileAppShell({
  children,
  onOpenAICoach
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, seniorMode, toggleSeniorMode, category, tier } = useAuth();
  const { showToast } = useNotification();

  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  const isWelcomeScreen = location.pathname === '/';

  // 5 Canonical Navigation Options for Mobile and Desktop
  const navTabs = [
    { label: 'Home', path: user ? '/dashboard' : '/', icon: Home },
    { label: 'Workouts', path: '/workouts', icon: Dumbbell },
    { label: 'Nutrition', path: '/nutrition', icon: Apple },
    { label: 'Subscription', path: '/subscriptions', icon: Shield },
    { label: 'Profile', path: '/profile', icon: User }
  ];

  const categoryBadges = {
    ATHLETE: { label: 'Athlete', emoji: '⚡', bg: 'bg-amber-100 text-amber-900 border-amber-300' },
    SENIOR: { label: 'Senior Care', emoji: '👵', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    GYM_FREAK: { label: 'Gym Freak', emoji: '💪', bg: 'bg-purple-100 text-purple-900 border-purple-300' },
    NORMAL: { label: 'Daily Wellness', emoji: '🏃', bg: 'bg-sky-100 text-sky-900 border-sky-300' }
  };

  const currentBadge = categoryBadges[category] || categoryBadges.NORMAL;

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync fullscreen state
  useEffect(() => {
    const handleFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleFs);
    return () => document.removeEventListener('fullscreenchange', handleFs);
  }, []);

  const toggleHardwareFullscreen = () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const handleSignOut = () => {
    setAccountMenuOpen(false);
    logout();
    showToast('You have been securely signed out.', 'info');
    navigate('/login');
  };

  const isTabActive = (tabPath) => {
    if (tabPath === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    if (tabPath === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(tabPath);
  };

  return (
    <div className={`w-full min-h-[100dvh] bg-[#F9FBF9] text-[#1D2B32] flex flex-col relative overflow-x-hidden ${seniorMode ? 'senior-mode' : ''}`}>
      
      {/* Fullscreen Prompt Top Banner */}
      {!isFullscreen && !bannerDismissed && !isWelcomeScreen && (
        <div className="bg-emerald-900 text-white px-3 py-1.5 flex items-center justify-between text-xs z-50 shadow-xs border-b border-emerald-800">
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
            <span className="font-semibold text-[11px]">Run Fitora in Full Screen App Mode</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleHardwareFullscreen}
              className="px-2.5 py-0.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-extrabold rounded-md text-[11px] cursor-pointer"
            >
              Go Fullscreen
            </button>
            <button
              onClick={() => setBannerDismissed(true)}
              className="text-emerald-300 hover:text-white p-0.5 text-xs font-bold"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Top Header Bar for Desktop & Mobile */}
      {!isWelcomeScreen && (
        <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            
            {/* Left: Brand & Back */}
            <div className="flex items-center gap-2.5">
              {location.pathname !== '/dashboard' && location.pathname !== '/' && (
                <button
                  onClick={() => navigate(-1)}
                  className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-full transition-colors md:hidden"
                  title="Back"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#176B4D] via-[#2FA878] to-[#3197C8] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                  <Heart className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-black text-[#176B4D] brand-font tracking-tight">Fitora</span>
                    <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 hidden sm:inline-block">
                      Wellness
                    </span>
                  </div>
                </div>
              </Link>

              {user && (
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border hidden sm:inline-flex items-center gap-1 ${currentBadge.bg}`}>
                  <span>{currentBadge.emoji}</span>
                  <span>{currentBadge.label}</span>
                </span>
              )}
            </div>

            {/* Center: Desktop Navigation Bar with 5 Canonical Pages */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Desktop Navigation">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const active = isTabActive(tab.path);
                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs lg:text-sm font-extrabold transition-all ${
                      active
                        ? 'bg-emerald-50 text-[#176B4D] border border-emerald-200/80 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-[#2FA878] stroke-[2.5]' : 'text-slate-400 stroke-[1.8]'}`} />
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right: Controls & Account Flow */}
            <div className="flex items-center gap-2">
              {/* Senior Font Mode Toggle */}
              <button
                onClick={toggleSeniorMode}
                title="Toggle Senior High-Contrast & Large Fonts"
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                  seniorMode
                    ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[11px] font-bold">{seniorMode ? 'Large Font' : 'Font'}</span>
              </button>

              {/* Hardware Fullscreen Toggle (desktop/phone) */}
              <button
                onClick={toggleHardwareFullscreen}
                className="hidden sm:flex p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs transition-colors"
                title="Toggle Fullscreen"
                aria-label="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>

              {/* Logged Out: Show Sign In & Sign Up */}
              {!user ? (
                <div className="flex items-center gap-2 ml-1">
                  <Link
                    to="/login"
                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-black rounded-xl text-white bg-[#2FA878] hover:bg-[#176B4D] shadow-2xs transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                /* Logged In: Account Menu Dropdown */
                <div className="relative" ref={accountMenuRef}>
                  <button
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="flex items-center gap-2 p-1 sm:pl-1.5 sm:pr-2.5 sm:py-1 rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors"
                    aria-label="Account Menu"
                    aria-expanded={accountMenuOpen}
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-emerald-800 font-black text-xs">
                      {user.profile?.fullName ? user.profile.fullName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="hidden xl:block text-left text-xs leading-tight">
                      <p className="font-extrabold text-slate-900 truncate max-w-[110px]">{user.profile?.fullName || 'User'}</p>
                      <span className="text-[10px] text-emerald-700 font-bold">{tier}</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Account Menu Dropdown Card */}
                  {accountMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 space-y-2.5 z-50 animate-fadeIn">
                      <div className="pb-2.5 border-b border-slate-100">
                        <p className="text-xs font-black text-slate-900 truncate">
                          {user.profile?.fullName || 'Fitora Member'}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {tier} Plan
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${currentBadge.bg}`}>
                            {currentBadge.label}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Link
                          to="/profile"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>Profile & Health Settings</span>
                        </Link>

                        <Link
                          to="/subscriptions"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-emerald-600" />
                          <span>Subscription & Billing</span>
                        </Link>

                        {user.role === 'ADMIN' && (
                          <Link
                            to="/admin"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-purple-700 hover:bg-purple-50 transition-colors"
                          >
                            <Settings className="w-4 h-4 text-purple-600" />
                            <span>Admin Portal</span>
                          </Link>
                        )}
                      </div>

                      {/* Separate Sign Out Option */}
                      <div className="pt-2 border-t border-slate-100">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-extrabold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Responsive Content Area */}
      <main className="flex-1 w-full flex flex-col relative pb-24 md:pb-12">
        <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col px-3 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Floating AI Coach Button (Active when logged in and not on welcome screen) */}
      {!isWelcomeScreen && user && (
        <button
          onClick={onOpenAICoach}
          className="fixed bottom-20 md:bottom-6 right-4 md:right-8 z-40 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-xl flex items-center gap-2 transform active:scale-95 transition-all border-2 border-white"
        >
          <Sparkles className="w-4 h-4 text-emerald-200 animate-spin-slow" />
          <span>AI Coach</span>
        </button>
      )}

      {/* 2. Fixed Bottom Mobile Tab Bar (Strictly 5 items: Home, Workouts, Nutrition, Subscription, Profile) */}
      {!isWelcomeScreen && (
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-slate-200 shadow-lg"
        >
          <div className="max-w-md mx-auto h-16 px-2 flex items-center justify-around">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const active = isTabActive(tab.path);
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                    active ? 'text-[#2FA878] scale-105' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'stroke-[2.6]' : 'stroke-[1.8]'}`} />
                  <span className={`text-[10px] mt-0.5 font-bold ${active ? 'text-[#176B4D] font-black' : 'text-slate-500'}`}>
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Bottom Mobile Safe Indicator Bar */}
          <div className="w-full py-1 bg-white flex justify-center shrink-0">
            <div className="w-28 h-1 bg-slate-400 rounded-full opacity-50" />
          </div>
        </nav>
      )}

      {/* Phone and Fullscreen Mode Modal */}
      <PhoneFullscreenModal
        isOpen={phoneModalOpen}
        onClose={() => setPhoneModalOpen(false)}
      />
    </div>
  );
}
