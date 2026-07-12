import { BrowserRouter, Routes, Route } from 'react-router-dom';

import MarketingLayout from '../layouts/MarketingLayout';
import AuthLayout from '../layouts/AuthLayout';
import AppLayout from '../layouts/AppLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';

import Landing from '../pages/Landing';
import NotFound from '../pages/NotFound';
import Register from '../pages/auth/Register';
import Login from '../pages/auth/Login';
import AcceptInvite from '../pages/auth/AcceptInvite';
import Dashboard from '../pages/app/Dashboard';
import Team from '../pages/app/Team';
import Settings from '../pages/app/Settings';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <MarketingLayout>
              <Landing />
            </MarketingLayout>
          }
        />

        <Route
          path="/register"
          element={
            <AuthLayout>
              <Register />
            </AuthLayout>
          }
        />
        <Route
          path="/login"
          element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          }
        />
        <Route
          path="/accept-invite/:token"
          element={
            <AuthLayout>
              <AcceptInvite />
            </AuthLayout>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/team"
          element={
            <AdminRoute>
              <AppLayout>
                <Team />
              </AppLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <AdminRoute>
              <AppLayout>
                <Settings />
              </AppLayout>
            </AdminRoute>
          }
        />

        <Route
          path="*"
          element={
            <MarketingLayout>
              <NotFound />
            </MarketingLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
