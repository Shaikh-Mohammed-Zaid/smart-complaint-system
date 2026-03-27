import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Contexts
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import StudentLayout from './components/layout/StudentLayout';
import AdminLayout from './components/layout/AdminLayout';
import LoadingScreen from './components/common/LoadingScreen';

// Public Pages
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import ResetPasswordPage from './pages/public/ResetPasswordPage';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import MyComplaints from './pages/student/MyComplaints';
import ComplaintDetail from './pages/student/ComplaintDetail';
import StudentTrending from './pages/student/Trending';
import Profile from './pages/student/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageComplaints from './pages/admin/ManageComplaints';
import ManageUsers from './pages/admin/ManageUsers';
import AdminTrending from './pages/admin/Trending';

// Route Guards
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen text="Authenticating..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* Student Routes */}
      <Route path="/student" element={
        <ProtectedRoute allowedRole="student">
          <StudentLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="complaints" element={<MyComplaints />} />
        <Route path="trending" element={<StudentTrending />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Shared Detail Route injected logically into correct layouts depending on origin, but mapped cleanly per role */}
      <Route path="/complaints/:id" element={
        <ProtectedRoute>
          <StudentLayout /> {/* We wrap the detailed view in the student layout for shared aesthetics, or separate it. For brevity, routing to student layout for view */}
        </ProtectedRoute>
      }>
        <Route index element={<ComplaintDetail />} />
      </Route>


      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRole="admin">
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="complaints" element={<ManageComplaints />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="trending" element={<AdminTrending />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <AppRoutes />
            <Toaster 
              position="top-right"
              toastOptions={{
                className: '!bg-[#1a1a2e] !text-white !border !border-white/10 !shadow-2xl !rounded-xl',
                style: { backdropFilter: 'blur(10px)' },
                success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
              }}
            />
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
