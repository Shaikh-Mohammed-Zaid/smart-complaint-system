import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import ParticleBackground from '../../components/three/ParticleBackground';
import GlassCard from '../../components/common/GlassCard';
import { ArrowLeft, Mail, Lock, User, Hash, Briefcase } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', department: '', rollNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if(formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        rollNumber: formData.rollNumber,
        role: 'student' // Defaulting to student registration on public flow
      });
      toast.success('Account created successfully!');
      navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] relative overflow-hidden flex items-center justify-center p-6 py-12">
      <ParticleBackground />

      <Link to="/" className="absolute top-8 left-6 md:left-12 flex items-center text-white/60 hover:text-white transition-colors z-20">
        <ArrowLeft size={20} className="mr-2" /> Back
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl relative z-10"
      >
        <GlassCard className="p-8 sm:p-12 overflow-hidden relative" elevated>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-white/50">Join the SmartFlow platform as a student.</p>
          </div>

          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
            <div className="md:col-span-2">
              <label className="label-glass">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-white/30" size={18} />
                <input type="text" required className="input-glass pl-10"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="label-glass">College Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-white/30" size={18} />
                <input type="email" required className="input-glass pl-10"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="label-glass">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-white/30" size={18} />
                <input type="password" required minLength="6" className="input-glass pl-10"
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="label-glass">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-white/30" size={18} />
                <input type="password" required minLength="6" className="input-glass pl-10"
                  value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="label-glass">Department</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 text-white/30" size={18} />
                <input type="text" className="input-glass pl-10" placeholder="Computer Science" 
                  value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="label-glass">Roll Number</label>
              <div className="relative">
                <Hash className="absolute left-3 top-3 text-white/30" size={18} />
                <input type="text" className="input-glass pl-10" placeholder="CS2023001" 
                  value={formData.rollNumber} onChange={e => setFormData({...formData, rollNumber: e.target.value})}
                />
              </div>
            </div>

            <div className="md:col-span-2 mt-6">
              <button disabled={loading} type="submit" className="btn-primary w-full flex justify-center py-3">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Register Account'}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-white/50 mt-8 relative z-10">
            Already registered? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 ml-1">Sign in instead</Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
