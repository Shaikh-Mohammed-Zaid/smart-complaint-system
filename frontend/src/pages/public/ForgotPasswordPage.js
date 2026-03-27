import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import ParticleBackground from '../../components/three/ParticleBackground';
import GlassCard from '../../components/common/GlassCard';
import { ArrowLeft, Mail, Send, CheckCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      toast.success(data.message || 'Reset link sent to your email');
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
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
            Forgot your<br/>
            password?<br/>
            <span className="text-indigo-400">No worries.</span>
          </h1>
          <p className="text-white/60 text-lg max-w-md">Enter your email and we'll send you a secure link to reset your password.</p>
        </div>
        <div className="text-white/30 text-sm">© SmartFlow 2026</div>
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
            {!sent ? (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                  <p className="text-white/50 text-sm">Enter your registered email address to receive a reset link.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                  <div>
                    <label className="label-glass">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-white/30" size={18} />
                      <input
                        type="email"
                        required
                        className="input-glass pl-10"
                        placeholder="Enter your email"
                        autoComplete="new-password"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full flex justify-center items-center mt-6"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Send Reset Link <Send size={18} className="ml-2" /></>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <CheckCircle size={64} className="text-emerald-400 mx-auto mb-6" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
                <p className="text-white/50 text-sm mb-6">
                  We've sent a password reset link to <span className="text-indigo-400">{email}</span>. The link expires in 10 minutes.
                </p>
                <button
                  onClick={() => { setSent(false); setEmail(''); }}
                  className="btn-ghost text-sm"
                >
                  Didn't receive it? Try again
                </button>
              </div>
            )}
          </GlassCard>

          <p className="text-center text-sm text-white/50 mt-8">
            Remember your password? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 ml-1">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
