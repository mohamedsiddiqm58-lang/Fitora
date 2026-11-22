import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import MobileAppShell from './components/MobileAppShell';
import EmergencyModal from './components/EmergencyModal';
import AICompanionModal from './components/AICompanionModal';
import PaymentModal from './components/PaymentModal';

import WelcomeScreen from './pages/WelcomeScreen';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingWizardPage from './pages/OnboardingWizardPage';
import DashboardPage from './pages/DashboardPage';
import WorkoutsPage from './pages/WorkoutsPage';
import NutritionPage from './pages/NutritionPage';
import HabitsPage from './pages/HabitsPage';
import MedicineRemindersPage from './pages/MedicineRemindersPage';
import WearablesPage from './pages/WearablesPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import PartnersPage from './pages/PartnersPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center text-xs text-slate-400 font-bold">Validating session...</div>;
  }
  return user ? children : <Navigate to="/login" replace />;
};

function MainApp() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [aiCoachOpen, setAiCoachOpen] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState(null);

  return (
    <MobileAppShell
      onOpenAICoach={() => setAiCoachOpen(true)}
    >
      <Routes>
        {/* Welcome Screen - Exact match of provided reference screenshot */}
        <Route
          path="/"
          element={
            <WelcomeScreen
              onGetStarted={() => {
                if (user) {
                  navigate('/dashboard');
                } else {
                  navigate('/register');
                }
              }}
            />
          }
        />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingWizardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage
                onOpenEmergency={() => setEmergencyOpen(true)}
                onOpenAICoach={() => setAiCoachOpen(true)}
                onOpenPayment={(plan) => setPaymentPlan(plan)}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/workouts"
          element={
            <ProtectedRoute>
              <WorkoutsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/nutrition"
          element={
            <ProtectedRoute>
              <NutritionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/habits"
          element={
            <ProtectedRoute>
              <HabitsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/medicine"
          element={
            <ProtectedRoute>
              <MedicineRemindersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/wearables"
          element={
            <ProtectedRoute>
              <WearablesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/subscriptions"
          element={
            <SubscriptionsPage
              onSelectPlan={(plan) => setPaymentPlan(plan)}
            />
          }
        />

        <Route
          path="/partners"
          element={
            <PartnersPage />
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Modals for Mobile App */}
      <EmergencyModal
        isOpen={emergencyOpen}
        onClose={() => setEmergencyOpen(false)}
      />

      <AICompanionModal
        isOpen={aiCoachOpen}
        onClose={() => setAiCoachOpen(false)}
      />

      <PaymentModal
        isOpen={Boolean(paymentPlan)}
        selectedPlan={paymentPlan}
        onClose={() => setPaymentPlan(null)}
        onPaymentSuccess={() => setPaymentPlan(null)}
      />
    </MobileAppShell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <MainApp />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
