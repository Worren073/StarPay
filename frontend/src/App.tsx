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
              <Layout>
                <PageTransition>
                  <Home />
                </PageTransition>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/athletes"
          element={
            <ProtectedRoute>
              <Layout>
                <PageTransition>
                  <Athletes />
                </PageTransition>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/competitions"
          element={
            <ProtectedRoute>
              <Layout>
                <PageTransition>
                  <Competitions />
                </PageTransition>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <Layout>
                <PageTransition>
                  <Payments />
                </PageTransition>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute>
              <Layout>
                <PageTransition>
                  <Staff />
                </PageTransition>
              </Layout>
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
