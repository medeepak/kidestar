import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MobileLayout } from './components/layout/MobileLayout';
import { Home } from './pages/Home';
import { RhymeDetail } from './pages/RhymeDetail';
import { RhymeCatalog } from './pages/RhymeCatalog';
import { GemStore } from './pages/GemStore';
import { ReferralPage } from './pages/ReferralPage';
import { SplashScreen } from './pages/onboarding/SplashScreen';
import { AgeGate } from './pages/onboarding/AgeGate';
import { IntroCarousel } from './pages/onboarding/IntroCarousel';
import { AvatarCreator } from './pages/onboarding/AvatarCreator';
import { Login } from './pages/Login';
import { AuthCallback } from './pages/AuthCallback';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NetworkErrorBanner } from './components/features/NetworkErrorBanner';
import { supabase } from './lib/supabase';
import './index.css';

// Guard: redirect to /login if user is not authenticated
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f8f6',
      }}>
        <div style={{
          width: 48,
          height: 48,
          border: '4px solid #38C6D4',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Applies referral code from ?ref=CODE query param after login
const ReferralHandler: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('ref');
    if (code && user?.id) {
      // Apply referral (idempotent — only sets referred_by if not already set)
      supabase.rpc('apply_referral_code', { p_new_user_id: user.id, p_code: code })
        .then(({ data, error }) => {
          if (!error && data) console.log(`Referral code ${code} applied`);
        });
    }
  }, [user?.id, location.search]);

  return null;
};

const RootRedirect: React.FC = () => {
  const location = useLocation();
  // If Supabase redirects to the root URL with an auth hash, forward it to the callback
  if (location.hash.includes('access_token=')) {
    return <Navigate to={`/auth/callback${location.hash}`} replace />;
  }
  return <Navigate to="/splash" replace />;
};

function AppRoutes() {
  return (
    <MobileLayout>
      {/* Persistent offline banner — shows on top of any screen */}
      <NetworkErrorBanner />
      {/* Applies ?ref=CODE referral param after login */}
      <ReferralHandler />

      <Routes>
        {/* Default redirect (catches hashes if Supabase falls back to Site URL) */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/splash" element={<SplashScreen />} />
        <Route path="/age-gate" element={<AgeGate />} />
        <Route path="/intro" element={<IntroCarousel />} />

        {/* Protected routes */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/avatar-create" element={<ProtectedRoute><AvatarCreator /></ProtectedRoute>} />
        <Route path="/rhyme/:id" element={<ProtectedRoute><RhymeDetail /></ProtectedRoute>} />
        <Route path="/catalog" element={<ProtectedRoute><RhymeCatalog /></ProtectedRoute>} />
        <Route path="/gem-store" element={<ProtectedRoute><GemStore /></ProtectedRoute>} />
        <Route path="/referral" element={<ProtectedRoute><ReferralPage /></ProtectedRoute>} />
      </Routes>
    </MobileLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
