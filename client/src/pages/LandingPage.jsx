import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Heart,
  Activity,
  Sparkles,
  Zap,
  Users,
  Shield,
  Pill,
  Watch,
  PhoneCall,
  CheckCircle,
  ArrowRight,
  ChevronRight,
  Award,
  Stethoscope,
  Dumbbell,
  Scale
} from 'lucide-react';

export default function LandingPage({ onOpenEmergency, onOpenAICoach }) {
  const { user } = useAuth();

  const categories = [
    {
      id: 'ATHLETE',
      title: 'Athletes',
      tagline: 'High Performance & Rapid Recovery',
      badge: 'Freemium ₹99/mo',
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50/80 hover:bg-amber-50 border-amber-200',
      icon: Zap,
      features: [
        'Sport-specific training schedules',
        'Performance & VO2 max recovery tracking',
        'AI sports companion & recovery check-ins',
        'Sports nutrition, protein shakes & partner products'
      ],
      link: '/onboarding?category=ATHLETE'
    },
    {
      id: 'SENIOR',
      title: 'Senior Citizens',
      tagline: 'Gentle Mobility, Medicine & Emergency Care',
      badge: 'Package ₹1,999',
      color: 'from-emerald-600 to-teal-700',
      bgColor: 'bg-emerald-50/80 hover:bg-emerald-50 border-emerald-200',
      icon: Heart,
      features: [
        'Senior-friendly large font interface & voice support',
        'Daily medicine reminders & schedule alerts',
        'Gentle joint mobility, stretching & walking',
        'One-tap Emergency Call (112 / 108) & hospital directory'
      ],
      link: '/onboarding?category=SENIOR'
    },
    {
      id: 'GYM_FREAK',
      title: 'Gym Freaks',
      tagline: 'Hypertrophy, Strength & Progressive Overload',
      badge: 'Premium ₹299/mo',
      color: 'from-purple-600 to-indigo-700',
      bgColor: 'bg-purple-50/80 hover:bg-purple-50 border-purple-200',
      icon: Dumbbell,
      features: [
        'Targeted muscle gain & fat loss splits',
        'Daily protein, creatine & hydration calculator',
        'Educational somatotype guidance (Ecto/Meso/Endo)',
        'Partner gym passes & certified trainer discovery'
      ],
      link: '/onboarding?category=GYM_FREAK'
    },
    {
      id: 'NORMAL',
      title: 'Normal People',
      tagline: 'Sustainable Healthy Living & Daily Habits',
      badge: 'Premium ₹299/mo',
      color: 'from-sky-500 to-blue-600',
      bgColor: 'bg-sky-50/80 hover:bg-sky-50 border-sky-200',
      icon: Activity,
      features: [
        'Beginner-friendly 20-minute home workouts',
        'Water intake, sleep duration & habit streaks',
        'Delicious, healthy balanced Indian recipe library',
        'AI lifestyle companion for daily encouragement'
      ],
      link: '/onboarding?category=NORMAL'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 bg-gradient-to-b from-white via-[#F7FAF8] to-[#E8F5EE]/40 border-b border-slate-200">
        
        {/* Soft decorative background circles */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-emerald-100/40 via-sky-100/30 to-teal-100/40 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-6 shadow-2xs">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>FITORA 2.0 • Complete AI Health & Wellness Platform</span>
          </div>

          {/* Main Title & Tagline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#176B4D] mb-6 leading-tight brand-font">
            FITORA
          </h1>
          <p className="text-2xl sm:text-3xl font-bold text-[#1D2B32] mb-4">
            Your AI-Powered Health Companion
          </p>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
            Tailored health ecosystems designed specifically for <span className="font-semibold text-emerald-800">Athletes</span>, <span className="font-semibold text-emerald-800">Senior Citizens</span>, <span className="font-semibold text-emerald-800">Gym Freaks</span>, and <span className="font-semibold text-emerald-800">Everyday Wellness</span> with medical reminders, habit streaks, and 24/7 AI coaching.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12">
            {user ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#2FA878] hover:bg-[#176B4D] text-white font-extrabold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Enter Your Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#2FA878] hover:bg-[#176B4D] text-white font-extrabold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-base shadow-2xs transition-all"
                >
                  Login to Account
                </Link>
              </>
            )}
          </div>

          {/* Trust stats pill bar */}
          <div className="inline-grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 p-4 sm:p-5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs max-w-4xl mx-auto text-left">
            <div>
              <p className="text-2xl font-black text-slate-900 brand-font">4 Modules</p>
              <p className="text-xs text-slate-500 font-medium">Personalized journeys</p>
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-700 brand-font">24/7 AI</p>
              <p className="text-xs text-slate-500 font-medium">Health companion</p>
            </div>
            <div>
              <p className="text-2xl font-black text-sky-700 brand-font">100% Secure</p>
              <p className="text-xs text-slate-500 font-medium">PostgreSQL privacy</p>
            </div>
            <div>
              <p className="text-2xl font-black text-amber-700 brand-font">₹ INR</p>
              <p className="text-xs text-slate-500 font-medium">Affordable Indian plans</p>
            </div>
          </div>
        </div>
      </section>

      {/* Four Category Cards Section */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
            Four Personalized Ecosystems
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 mb-4 brand-font">
            Choose The Module Tailored To Your Life
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            No one-size-fits-all algorithms. Select your category to unlock personalized dashboards, exercise intensities, nutrition rules, and companion check-ins.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className={`rounded-2xl border p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${cat.bgColor}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white shadow-sm`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      {cat.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 mb-1 brand-font">{cat.title}</h3>
                  <p className="text-xs text-slate-600 font-medium mb-4">{cat.tagline}</p>

                  <ul className="space-y-2 mb-6">
                    {cat.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to={user ? `/onboarding?category=${cat.id}` : `/register?category=${cat.id}`}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <span>Select {cat.title}</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Deep Dive Grid */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 brand-font">
              Complete Built-in Health Infrastructure
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              All tools connected to a single verified PostgreSQL database.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Context-Aware AI Companion</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Trained to recognize user goals, water logs, and streak milestones with built-in medical safety guardrails for emergency symptoms.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-4">
                <Pill className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Scheduled Medicine Reminders</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Senior-friendly routine manager with dosage notes, scheduled alerts, and browser push notification support.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                <Watch className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Wearables & Partner Network</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Integration layer for Apple Health, Google Fit, Fitbit, and Garmin plus verified directories of gyms, clinics, and clean nutrition partners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Pricing Overview */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200">
            Transparent Indian Pricing
          </span>
          <h2 className="text-3xl font-black text-slate-900 mt-2 brand-font">Simple, Accessible Subscription Plans</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Free Basic plan forever. Upgrade anytime to unlock AI companion check-ins, partner offers, and care packages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Basic */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">Always Available</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1 mb-2 brand-font">Free Basic</h3>
              <p className="text-3xl font-extrabold text-slate-900 mb-4">₹0</p>
              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Full exercise & workout library</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Daily hydration & sleep logging</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Medicine reminders & SOS dialer</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> 5 free AI companion test prompts</li>
              </ul>
            </div>
            <Link
              to="/register"
              className="w-full py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-center text-slate-700 hover:bg-slate-50"
            >
              Start Free
            </Link>
          </div>

          {/* Freemium */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-emerald-50 to-white border-2 border-emerald-400 shadow-md flex flex-col justify-between relative">
            <span className="absolute -top-3 right-6 text-[10px] font-extrabold px-3 py-0.5 rounded-full bg-emerald-600 text-white uppercase tracking-wider">
              Popular
            </span>
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase">AI Enhanced</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1 mb-2 brand-font">Freemium</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-extrabold text-[#176B4D]">₹99 - ₹199</span>
                <span className="text-xs text-slate-500 font-medium">/ month</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> All Basic features</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> 24/7 Unlimited AI Companion coaching</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Scheduled daily health & habit check-ins</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Voice-enabled read-aloud for Seniors</li>
              </ul>
            </div>
            <Link
              to="/subscriptions"
              className="w-full py-2.5 rounded-xl bg-[#2FA878] hover:bg-[#176B4D] font-bold text-xs text-center text-white shadow-xs"
            >
              View Freemium Options
            </Link>
          </div>

          {/* Premium */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-purple-700 uppercase">Complete Partner Care</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1 mb-2 brand-font">Premium & Packages</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-extrabold text-slate-900">₹299</span>
                <span className="text-xs text-slate-500 font-medium">/ mo or ₹1,999 Care</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> All Freemium features</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Partner gym discounts & guest passes</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Hospital partner directory & booking</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Sports nutrition discounts & starter kits</li>
              </ul>
            </div>
            <Link
              to="/subscriptions"
              className="w-full py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-center text-slate-700 hover:bg-slate-50"
            >
              Explore Premium
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
