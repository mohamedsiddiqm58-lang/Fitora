import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, PhoneCall, Mail, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#2FA878] flex items-center justify-center text-white">
                <Heart className="w-4 h-4 fill-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-[#176B4D] brand-font">FITORA</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your AI-Powered Health Companion. Supporting Athletes, Senior Citizens, Fitness Enthusiasts, and Everyday Wellness across India.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ISO & HIPPA Aligned Principles</span>
            </div>
          </div>

          {/* User Modules */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-xs tracking-wider uppercase">User Modules</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/workouts?category=ATHLETE" className="hover:text-emerald-600 transition-colors">
                  Athletes (High Performance)
                </Link>
              </li>
              <li>
                <Link to="/workouts?category=SENIOR" className="hover:text-emerald-600 transition-colors">
                  Senior Citizens (Gentle Vitality)
                </Link>
              </li>
              <li>
                <Link to="/workouts?category=GYM_FREAK" className="hover:text-emerald-600 transition-colors">
                  Gym Freaks (Hypertrophy & Strength)
                </Link>
              </li>
              <li>
                <Link to="/workouts?category=NORMAL" className="hover:text-emerald-600 transition-colors">
                  Normal People (Healthy Habits)
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links & Services */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-xs tracking-wider uppercase">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/subscriptions" className="hover:text-emerald-600">Plans & Indian Pricing</Link></li>
              <li><Link to="/partners" className="hover:text-emerald-600">Partner Gyms & Hospitals</Link></li>
              <li><Link to="/wearables" className="hover:text-emerald-600">Wearables Integration</Link></li>
              <li><Link to="/medicine" className="hover:text-emerald-600">Medicine Reminders</Link></li>
            </ul>
          </div>

          {/* Emergency & Support */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-xs tracking-wider uppercase">Emergency & Contact</h4>
            <div className="space-y-2 text-xs">
              <p className="flex items-center gap-2 font-semibold text-rose-700">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>National Emergency: 112 / 108</span>
              </p>
              <p className="flex items-center gap-2 text-slate-600">
                <Mail className="w-3.5 h-3.5" />
                <span>support@fitora.health</span>
              </p>
              <p className="text-[11px] text-slate-400 pt-2 leading-relaxed">
                Tapping emergency links triggers your phone’s local dialer. Fitora does not autonomously dispatch ambulances.
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>
            © {new Date().getFullYear()} FITORA Platform. All rights reserved. Medical Disclaimer: Content is provided for educational and fitness companion purposes only.
          </p>
          <div className="flex gap-4">
            <a href="#privacy" className="hover:underline">Privacy Policy</a>
            <a href="#terms" className="hover:underline">Terms of Service</a>
            <a href="#support" className="hover:underline">Contact Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
