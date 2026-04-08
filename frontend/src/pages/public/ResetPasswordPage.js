import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import ParticleBackground from '../../components/three/ParticleBackground';
import GlassCard from '../../components/common/GlassCard';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      const { data } = await api.put(`/auth/reset-password/${token}`, { password, confirmPassword });
      toast.success(data.message || 'Password reset successful');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. The link may be expired.');
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
          <Link to="/login" className="flex items-center text-white/60 hover:text-white w-fit transition-colors">
            <ArrowLeft size={20} className="mr-2" /> Back to Login
          </Link>
        </div>
        <div>
          <h1 className="text-5xl font-display font-bold mb-6 text-white">
            Set a new<br/>
            password.<br/>
            <span className="text-indigo-400">Stay secure.</span>
          </h1>
          <p className="text-white/60 text-lg max-w-md">Choose a strong, unique password to protect your Shreyarth Resolve account.</p>
        </div>
        <div className="text-white/30 text-sm">© Shreyarth Resolve 2026</div>
      </div>

      <div className="flex items-center justify-center p-6 relative z-10">
        <Link to="/login" className="lg:hidden absolute top-8 left-6 text-white/50"><ArrowLeft/></Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <GlassCard className="p-8 pb-10" elevated>
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <ShieldCheck size={40} className="text-indigo-400 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">New Password</h2>
              <p className="text-white/50 text-sm">Enter and confirm your new password below.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <div>
                <label className="label-glass">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-white/30" size={18} />
                  <input
                    type="password"
                    required
                    className="input-glass pl-10"
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="label-glass">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-white/30" size={18} />
                  <input
                    type="password"
                    required
                    className="input-glass pl-10"
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-red-400 text-xs">Passwords do not match</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex justify-center items-center mt-6"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Reset Password <ShieldCheck size={18} className="ml-2" /></>
                )}
              </button>
            </form>
          </GlassCard>

          <p className="text-center text-sm text-white/50 mt-8">
            Remember your password? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 ml-1">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
