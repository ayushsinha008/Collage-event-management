import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { AuthPage } from './pages/AuthPage.tsx';
import './index.css';
import { initTheme, initDensity } from './utils/theme.ts';

initTheme();
initDensity();

const StudentApp = lazy(() => import('./App.tsx'));
const OrganizerApp = lazy(() => import('./OrganizerApp.tsx'));
const VolunteerApp = lazy(() => import('./VolunteerApp.tsx'));

const AppLoader = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4 text-on-background">
    <div className="w-12 h-12 border-4 border-on-background border-t-primary rounded-full animate-spin" />
    <p className="font-bold uppercase tracking-widest text-sm">Loading FestFlow...</p>
  </div>
);

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#fff5f5] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border-4 border-black p-8 shadow-[6px_6px_0_#000]">
            <h1 className="text-xl font-black uppercase mb-2">FestFlow failed to load</h1>
            <p className="text-sm text-slate-600 mb-4">{this.state.error.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-orange-500 text-white border-2 border-black px-4 py-2 font-bold uppercase text-xs"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
    <AppErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<AppLoader />}>
            <Routes>
              <Route path="/login" element={<AuthPage />} />
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
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </AppErrorBoundary>
  </React.StrictMode>
);

