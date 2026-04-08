import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import ParticleBackground from '../../components/three/ParticleBackground';
import GlassCard from '../../components/common/GlassCard';
import { ArrowLeft, Mail, Lock, LogIn } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success('Welcome back!');
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#0f0f1a] relative overflow-hidden">
      <div className="absolute inset-0 lg:w-1/2 hidden lg:block pointer-events-none">
        <ParticleBackground />
      </div>

      <div className="hidden lg:flex flex-col justify-between p-12 relative z-10 border-r border-white/10">
        <div>
          <Link to="/" className="flex items-center text-white/60 hover:text-white w-fit transition-colors">
            <ArrowLeft size={20} className="mr-2" /> Back to Home
          </Link>
        </div>
        <div>
          <h1 className="text-5xl font-display font-bold mb-6 text-white">
            Secure.<br/>
            Real-time.<br/>
            <span className="text-indigo-400">Cinematic.</span>
          </h1>
          <p className="text-white/60 text-lg max-w-md">Access your dashboard to track, manage, and accelerate issue resolutions across the campus.</p>
        </div>
        <div className="text-white/30 text-sm">© Shreyarth Resolve 2026</div>
      </div>

      <div className="flex items-center justify-center p-6 relative z-10">
        <Link to="/" className="lg:hidden absolute top-8 left-6 text-white/50"><ArrowLeft/></Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <GlassCard className="p-8 pb-10" elevated>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-white/50 text-sm">Enter your credentials to access your account.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
              <div>
                <label className="label-glass">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-white/30" size={18} />
                  <input
                    type="email"
                    required
                    className="input-glass pl-10"
                    placeholder="Enter Email"
                    autoComplete="new-password"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="label-glass">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-white/30" size={18} />
                  <input
                    type="password"
                    required
                    className="input-glass pl-10"
                    placeholder="Enter Password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end mb-2">
                <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer">Forgot password?</Link>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full flex justify-center items-center mt-6"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Sign In <LogIn size={18} className="ml-2" /></>
                )}
              </button>
            </form>

            {/* <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-xs text-white/40 text-center mb-4">Quick login for reviewer</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => handleDemo('admin')} className="flex-1 btn-ghost text-xs py-2">Test Admin</button>
                <button type="button" onClick={() => handleDemo('student')} className="flex-1 btn-ghost text-xs py-2">Test Student</button>
              </div>
            </div> */}
          </GlassCard>

          <p className="text-center text-sm text-white/50 mt-8">
            Don't have an account? <Link to="/register" className="text-indigo-400 hover:text-indigo-300 ml-1">Register instead</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
