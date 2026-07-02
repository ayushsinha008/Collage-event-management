import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import StudentApp from './App.tsx';
import OrganizerApp from './OrganizerApp.tsx';
import VolunteerApp from './VolunteerApp.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { AuthPage } from './pages/AuthPage.tsx';
import './index.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('student' | 'organizer' | 'volunteer')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4 font-body-md text-on-background">
        <div className="w-12 h-12 border-4 border-on-background border-t-primary rounded-full animate-spin"></div>
        <p className="font-label-bold uppercase tracking-widest">LOADING SESSION...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect them to the /login page, but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If they are an organizer/volunteer, they are allowed to browse the student portal.
    // If they are a student and try to access /organizer or /volunteer, redirect them to /
    if (user.role === 'student') {
      return <Navigate to="/" replace />;
    }
    // Otherwise redirect to their own respective dashboard
    if (user.role === 'organizer') {
      return <Navigate to="/organizer/dashboard" replace />;
    }
    if (user.role === 'volunteer') {
      return <Navigate to="/volunteer" replace />;
    }
  }

  return <>{children}</>;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public login gateway */}
          <Route path="/login" element={<AuthPage />} />

          {/* Protected Role-Based Routes */}
          <Route
            path="/organizer/*"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <OrganizerApp />
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer/*"
            element={
              <ProtectedRoute allowedRoles={['volunteer']}>
                <VolunteerApp />
              </ProtectedRoute>
            }
          />
          <Route
            path="/*"
            element={
              <ProtectedRoute allowedRoles={['student', 'organizer', 'volunteer']}>
                <StudentApp />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);

