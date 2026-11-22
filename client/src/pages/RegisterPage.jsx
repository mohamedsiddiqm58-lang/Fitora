import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Heart, Lock, Mail, User, Shield, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const preselectedCategory = searchParams.get('category') || 'NORMAL';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState(preselectedCategory);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        fullName,
        email,
        password,
        category,
        seniorMode: category === 'SENIOR'
      });
      showToast('Registration successful! Let’s personalize your onboarding profile.', 'success');
      navigate(`/onboarding?category=${category}`);
    } catch (err) {
      showToast(err.message || 'Registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 py-6 my-auto max-w-sm mx-auto">
      <div className="w-full bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-5">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#176B4D] to-[#2FA878] flex items-center justify-center text-white mx-auto shadow-md">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 brand-font">Join FITORA Free</h2>
          <p className="text-xs text-slate-500">Your AI-Powered Health Companion</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Patel"
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Primary Module</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setCategory('ATHLETE')}
                className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                  category === 'ATHLETE'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                ⚡ Athlete
              </button>
              <button
                type="button"
                onClick={() => setCategory('SENIOR')}
                className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                  category === 'SENIOR'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                👵 Senior Citizen
              </button>
              <button
                type="button"
                onClick={() => setCategory('GYM_FREAK')}
                className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                  category === 'GYM_FREAK'
                    ? 'border-purple-500 bg-purple-50 text-purple-900 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                💪 Gym Freak
              </button>
              <button
                type="button"
                onClick={() => setCategory('NORMAL')}
                className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                  category === 'NORMAL'
                    ? 'border-sky-500 bg-sky-50 text-sky-900 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                🏃 Normal Person
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 leading-relaxed">
            By creating an account, you agree that Fitora is an automated health companion and will handle your information in accordance with our Privacy Policy.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#2FA878] hover:bg-[#176B4D] disabled:opacity-50 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            {loading ? 'Creating Account...' : 'Continue to Personalization'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-700 font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
