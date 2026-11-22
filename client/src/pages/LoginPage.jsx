import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Heart, Lock, Mail, ArrowRight, Sparkles, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      showToast('Welcome back to Fitora!', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
      showToast('Logged in with demo persona!', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Demo login failed.', 'error');
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
          <h2 className="text-2xl font-black text-slate-900 brand-font">Log In to FITORA</h2>
          <p className="text-xs text-slate-500">Access your personalized health companion dashboard</p>
        </div>

        {/* Demo Personas Quick Login */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Instant Demo Logins (One-Click)</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemo('senior@fitora.com', 'fitora123')}
              className="px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-emerald-900 font-bold hover:bg-emerald-100 transition-colors text-left"
            >
              👵 Senior Citizen
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('athlete@fitora.com', 'fitora123')}
              className="px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-emerald-900 font-bold hover:bg-emerald-100 transition-colors text-left"
            >
              ⚡ Athlete
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('gym@fitora.com', 'fitora123')}
              className="px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-emerald-900 font-bold hover:bg-emerald-100 transition-colors text-left"
            >
              💪 Gym Freak
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('user@fitora.com', 'fitora123')}
              className="px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-emerald-900 font-bold hover:bg-emerald-100 transition-colors text-left"
            >
              🏃 Normal Person
            </button>
          </div>
          <button
            type="button"
            onClick={() => handleQuickDemo('admin@fitora.com', 'admin123')}
            className="w-full py-1 text-[11px] text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 font-bold rounded-md"
          >
            🛡️ Log in as Admin
          </button>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#2FA878] hover:bg-[#176B4D] disabled:opacity-50 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            {loading ? 'Authenticating...' : 'Sign In to Fitora'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-emerald-700 font-bold hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
