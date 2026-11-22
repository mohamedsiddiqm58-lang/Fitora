import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('fitora_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('fitora_token') || null);
  const [loading, setLoading] = useState(true);
  const [seniorMode, setSeniorMode] = useState(() => {
    return localStorage.getItem('fitora_senior_mode') === 'true';
  });

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('fitora_token');
    if (!savedToken) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('fitora_user', JSON.stringify(res.user));
        if (res.user.profile?.selectedCategory === 'SENIOR' || res.user.profile?.seniorModeEnabled) {
          setSeniorMode(true);
          localStorage.setItem('fitora_senior_mode', 'true');
        }
      }
    } catch (err) {
      console.warn('Session refresh failed:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.token) {
      localStorage.setItem('fitora_token', res.token);
      localStorage.setItem('fitora_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      if (res.user.profile?.selectedCategory === 'SENIOR' || res.user.profile?.seniorModeEnabled) {
        setSeniorMode(true);
        localStorage.setItem('fitora_senior_mode', 'true');
      }
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    if (res.success && res.token) {
      localStorage.setItem('fitora_token', res.token);
      localStorage.setItem('fitora_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      if (data.category === 'SENIOR' || data.seniorMode) {
        setSeniorMode(true);
        localStorage.setItem('fitora_senior_mode', 'true');
      }
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('fitora_token');
    localStorage.removeItem('fitora_user');
    setToken(null);
    setUser(null);
  };

  const toggleSeniorMode = () => {
    setSeniorMode((prev) => {
      const next = !prev;
      localStorage.setItem('fitora_senior_mode', String(next));
      return next;
    });
  };

  const switchCategory = async (category) => {
    if (!user) return;
    try {
      const res = await api.put('/profile', { selectedCategory: category, seniorModeEnabled: category === 'SENIOR' });
      if (res.success) {
        setUser((prev) => ({
          ...prev,
          profile: res.profile
        }));
        if (category === 'SENIOR') {
          setSeniorMode(true);
          localStorage.setItem('fitora_senior_mode', 'true');
        }
      }
    } catch (err) {
      console.error('Failed to switch category:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        seniorMode,
        tier: user?.subscriptionTier || 'BASIC',
        category: user?.profile?.selectedCategory || 'NORMAL',
        login,
        register,
        logout,
        refreshUser,
        toggleSeniorMode,
        switchCategory
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
