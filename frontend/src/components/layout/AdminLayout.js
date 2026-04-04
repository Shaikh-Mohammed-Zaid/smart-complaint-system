import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, AlertCircle, TrendingUp, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../common/NotificationBell';
import ParticleBackground from '../three/ParticleBackground';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Analytics' },
    { path: '/admin/complaints', icon: AlertCircle, label: 'Manage Complaints' },
    { path: '/admin/trending', icon: TrendingUp, label: 'Trending Log' },
    { path: '/admin/users', icon: Users, label: 'Manage Users' }
  ];

  return (
    <div className="min-h-screen flex text-white relative bg-[#0f0f1a]">
      <ParticleBackground />

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed inset-y-0 left-0 z-50 w-64 glass-card-elevated border-l-0 border-y-0 flex flex-col rounded-r-3xl rounded-l-none transition-transform duration-300 transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:flex`}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              A
            </div>
            <h1 className="font-display font-bold text-xl tracking-tight">AdminPortal</h1>
          </div>
          <button className="lg:hidden text-white/50 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-amber-500/10 to-transparent text-amber-500 border-l-2 border-amber-500 glow-amber' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="p-6 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold border border-amber-500/30">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{user?.name}</p>
              <p className="text-xs text-amber-500/70 font-mono truncate">Administrator</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 transition-colors border border-rose-500/20"
          >
            <LogOut size={18} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </motion.aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <header className="relative z-50 h-20 glass-card rounded-none border-x-0 border-t-0 flex items-center justify-between px-6 lg:px-10 shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-white/70 hover:text-white bg-white/5 rounded-lg" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h2 className="hidden sm:block text-lg font-semibold text-white/80">
              Administrator Access
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationBell />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
