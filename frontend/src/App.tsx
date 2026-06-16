import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import PageTransition from './components/animations/PageTransition';
import Login from './pages/Login';
import Home from './pages/Home';
import Athletes from './pages/Athletes';
import Competitions from './pages/Competitions';
import Payments from './pages/Payments';
import Staff from './pages/Staff';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Support from './pages/Support';
import AthletePayments from './pages/portal/AthletePayments';
import AthletePerformance from './pages/portal/AthletePerformance';
import AthleteCompetitions from './pages/portal/AthleteCompetitions';

function ThemeAwareToaster() {
  const { isDark } = useTheme();
  return (
    <Toaster
      position="top-right"
      richColors
      theme={isDark ? 'dark' : 'light'}
      toastOptions={{
        style: {
          background: isDark ? 'rgba(18, 33, 49, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
          color: isDark ? '#d4e4fa' : '#1a1a2e',
          fontFamily: 'Inter, sans-serif',
        },
      }}
    />
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AthleteRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'athlete') return <Navigate to="/" />;
  return <>{children}</>;
}

function AthleteRedirect({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role === 'athlete') {
    return <Navigate to="/athlete/pagos" />;
  }
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role === 'athlete') {
    return <Navigate to="/athlete/pagos" />;
  }
  return <>{children}</>;
}

function AnimatedRoutes() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" />
            ) : (
              <PageTransition>
                <Login />
              </PageTransition>
            )
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AthleteRedirect>
                <Layout>
                  <PageTransition>
                    <Home />
                  </PageTransition>
                </Layout>
              </AthleteRedirect>
            </ProtectedRoute>
          }
        />
        <Route
          path="/athletes"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <Layout>
                  <PageTransition>
                    <Athletes />
                  </PageTransition>
                </Layout>
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/competitions"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <Layout>
                  <PageTransition>
                    <Competitions />
                  </PageTransition>
                </Layout>
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <Layout>
                  <PageTransition>
                    <Payments />
                  </PageTransition>
                </Layout>
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <Layout>
                  <PageTransition>
                    <Staff />
                  </PageTransition>
                </Layout>
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/privacy"
          element={
            <ProtectedRoute>
              <Layout>
                <PageTransition>
                  <Privacy />
                </PageTransition>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/terms"
          element={
            <ProtectedRoute>
              <Layout>
                <PageTransition>
                  <Terms />
                </PageTransition>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <Layout>
                <PageTransition>
                  <Support />
                </PageTransition>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/athlete/pagos"
          element={
            <AthleteRoute>
              <Layout>
                <PageTransition>
                  <AthletePayments />
                </PageTransition>
              </Layout>
            </AthleteRoute>
          }
        />
        <Route
          path="/athlete/rendimiento"
          element={
            <AthleteRoute>
              <Layout>
                <PageTransition>
                  <AthletePerformance />
                </PageTransition>
              </Layout>
            </AthleteRoute>
          }
        />
        <Route
          path="/athlete/competencias"
          element={
            <AthleteRoute>
              <Layout>
                <PageTransition>
                  <AthleteCompetitions />
                </PageTransition>
              </Layout>
            </AthleteRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

function AppRoutes() {
  return <AnimatedRoutes />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <ThemeAwareToaster />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
