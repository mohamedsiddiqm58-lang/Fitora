import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Heart,
  Dumbbell,
  Apple,
  CheckCircle2,
  Pill,
  Watch,
  Users,
  Shield,
  Menu,
  X,
  PhoneCall,
  Sparkles,
  LogOut,
  User as UserIcon,
  Eye
} from 'lucide-react';

export default function Navbar({ onOpenEmergency, onOpenAICoach }) {
  const { user, logout, seniorMode, toggleSeniorMode, category, tier } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: Activity },
    { label: 'Workouts', path: '/workouts', icon: Dumbbell },
    { label: 'Nutrition', path: '/nutrition', icon: Apple },
    { label: 'Habits', path: '/habits', icon: CheckCircle2 },
    { label: 'Medicine', path: '/medicine', icon: Pill },
    { label: 'Wearables', path: '/wearables', icon: Watch },
    { label: 'Partners', path: '/partners', icon: Users },
    { label: 'Plans', path: '/subscriptions', icon: Shield }
  ];

  const categoryLabels = {
    ATHLETE: { label: 'Athlete', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    SENIOR: { label: 'Senior Care', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    GYM_FREAK: { label: 'Gym Freak', color: 'bg-purple-100 text-purple-800 border-purple-300' },
    NORMAL: { label: 'Daily Wellness', color: 'bg-sky-100 text-sky-800 border-sky-300' }
  };

  const currentCatInfo = categoryLabels[category] || categoryLabels.NORMAL;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-[#176B4D] via-[#2FA878] to-[#3197C8] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#176B4D] brand-font">FITORA</span>
                <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  AI HEALTH
                </span>
              </div>
              <p className="text-[11px] text-[#556976] hidden sm:block font-medium">Your AI-Powered Health Companion</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {user && (
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-[#176B4D] font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#2FA878]' : 'text-slate-400'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Action Buttons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Senior Friendly Mode Button */}
            <button
              onClick={toggleSeniorMode}
              title="Toggle Large Fonts & Senior Friendly Mode"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                seniorMode
                  ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">{seniorMode ? 'Senior Font: ON' : 'Senior Mode'}</span>
            </button>

            {/* AI Companion Floating Entry */}
            {user && (
              <button
                onClick={onOpenAICoach}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xs hover:shadow transition-all"
              >
                <Sparkles className="w-4 h-4 text-emerald-200 animate-spin-slow" />
                <span>AI Coach</span>
              </button>
            )}

            {/* User status or Auth buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#E8F5EE] border border-[#2FA878] flex items-center justify-center text-[#176B4D] font-bold text-xs">
                    {user.profile?.fullName ? user.profile.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden xl:block text-left text-xs leading-tight">
                    <p className="font-bold text-slate-900 truncate max-w-[100px]">{user.profile?.fullName || 'User'}</p>
                    <span className="text-[10px] text-emerald-700 font-semibold">{tier}</span>
                  </div>
                </Link>

                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className="hidden sm:inline-flex px-2 py-1 text-xs font-bold bg-purple-100 text-purple-800 rounded border border-purple-200 hover:bg-purple-200"
                  >
                    Admin
                  </Link>
                )}

                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  title="Log out"
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs sm:text-sm font-bold rounded-lg text-white bg-[#2FA878] hover:bg-[#176B4D] shadow-xs hover:shadow transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            {user && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && user && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <p className="font-bold text-slate-900">{user.profile?.fullName}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded font-semibold border ${currentCatInfo.color}`}>
              {currentCatInfo.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-[#176B4D] font-bold border border-emerald-200'
                      : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#2FA878]" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAICoach();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm bg-emerald-600 text-white"
            >
              <Sparkles className="w-4 h-4" />
              Chat AI Coach
            </button>
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-lg font-bold text-sm border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Profile
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
