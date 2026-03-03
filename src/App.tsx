import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MobileLayout } from './components/layout/MobileLayout';
import { Home } from './pages/Home';
import { RhymeDetail } from './pages/RhymeDetail';
import { SplashScreen } from './pages/onboarding/SplashScreen';
import { AgeGate } from './pages/onboarding/AgeGate';
import { IntroCarousel } from './pages/onboarding/IntroCarousel';
import { AvatarCreator } from './pages/onboarding/AvatarCreator';
import { Login } from './pages/Login';
import { AuthCallback } from './pages/AuthCallback';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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

function AppRoutes() {
  return (
    <MobileLayout>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/splash" replace />} />

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
