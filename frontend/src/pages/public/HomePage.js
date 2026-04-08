

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link, Navigate } from 'react-router-dom';
import { ShieldCheck, Activity, Zap, ArrowRight, Github } from 'lucide-react';
import ParticleBackground from '../../components/three/ParticleBackground';
import { useAuth } from '../../context/AuthContext';

const HomePage = () => {
  const { user, loading } = useAuth();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);

  if (loading) return null;
  if (user) {
    return user.role === 'admin' 
      ? <Navigate to="/admin/dashboard" replace /> 
      : <Navigate to="/student/dashboard" replace />;
  }

  const features = [
    { icon: Zap, title: "Real-time Processing", desc: "Get real-time updates on your complaints from submission to resolution." },
    { icon: Activity, title: "Smart Insights", desc: "Track complaint data, view reports, and understand system performance easily." },
    // ✅ FIXED TYPO HERE
    { icon: ShieldCheck, title: "Secure Access", desc: "Different access levels for students and admins with strong data protection." }
  ];

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white relative overflow-hidden">
      <ParticleBackground />

      {/* Navbar */}
      <nav className="absolute top-0 w-full z-50 px-6 py-6 md:px-12 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-display font-bold flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-[0_0_15px_rgba(99,102,241,0.5)] flex items-center justify-center">S</div>
          Shreyarth Resolve
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Link to="/login" className="btn-ghost mr-4 hidden sm:inline-block">Sign In</Link>
          <Link to="/register" className="btn-primary">Get Started</Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-32 pb-16 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-screen text-center">

        <motion.h1 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight mb-8 leading-tight"
        >
          Resolve Issues <br/>
          <span className="gradient-text">At Light Speed.</span>
        </motion.h1>

        {/* ✅ SIMPLIFIED TEXT */}
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 font-medium"
        >
          A smart system to report, track, and resolve complaints quickly.
        </motion.p>

        {/*  BUTTON TEXT UPDATED */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link to="/register" className="btn-primary flex items-center justify-center text-lg px-8 py-4">
            Report Issue <ArrowRight className="ml-2" size={20} />
          </Link>
          <a href="#features" className="btn-ghost flex items-center justify-center text-lg px-8 py-4 bg-white/5">
            See How It Works
          </a>
        </motion.div>

        {/* Floating Elements */}
        <motion.div style={{ y: y1 }} className="absolute -left-20 top-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <motion.div style={{ y: y2 }} className="absolute -right-20 bottom-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      </main>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center mb-16">
          {/*  HEADING CHANGED */}
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Powerful Features</h2>
          <p className="text-white/50 text-lg">Everything you need to manage complaints efficiently.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              key={idx}
              className="glass-card p-8 group hover:glow-brand transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition-transform">
                <f.icon size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-white/60 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20 relative z-10 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center text-sm text-white/40">
          <p>© {new Date().getFullYear()} Shreyarth Resolve. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;











// import React from 'react';
// import { motion, useScroll, useTransform } from 'framer-motion';
// import { Link, Navigate } from 'react-router-dom';
// import { ShieldCheck, Activity, Zap, ArrowRight, Github } from 'lucide-react';
// import ParticleBackground from '../../components/three/ParticleBackground';
// import { useAuth } from '../../context/AuthContext';

// const HomePage = () => {
//   const { user, loading } = useAuth();
//   const { scrollY } = useScroll();
//   const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
//   const y2 = useTransform(scrollY, [0, 1000], [0, -100]);

//   if (loading) return null;
//   if (user) {
//     return user.role === 'admin' 
//       ? <Navigate to="/admin/dashboard" replace /> 
//       : <Navigate to="/student/dashboard" replace />;
//   }

//   const features = [
//     { icon: Zap, title: "Real-time Processing", desc: "Instant socket.io driven updates from submission to resolution." },
//     { icon: Activity, title: "Analytics Engine", desc: "Comprehensive MongoDB aggregation pipelines for insights." },
//     { icon: ShieldCheck, title: "Role-base Security", desc: "Enterprise grade JWT protection with strict model validations." }
//   ];

//   return (
//     <div className="min-h-screen bg-[#0f0f1a] text-white relative overflow-hidden">
//       <ParticleBackground />

//       {/* Navbar */}
//       <nav className="absolute top-0 w-full z-50 px-6 py-6 md:px-12 flex justify-between items-center">
//         <motion.div 
//           initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
//           className="text-2xl font-display font-bold flex items-center gap-2"
//         >
//           <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-[0_0_15px_rgba(99,102,241,0.5)] flex items-center justify-center">S</div>
//           Shreyarth Resolve
//         </motion.div>
//         <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
//           <Link to="/login" className="btn-ghost mr-4 hidden sm:inline-block">Sign In</Link>
//           <Link to="/register" className="btn-primary">Get Started</Link>
//         </motion.div>
//       </nav>

//       {/* Hero Section */}
//       <main className="relative z-10 pt-32 pb-16 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-screen text-center">
// {/*         
//         <motion.div
//            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
//            className="mb-8 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium"
//         >
//           <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
//           v2.0 Cinematic Edition is Live
//         </motion.div> */}

//         <motion.h1 
//           initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
//           className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight mb-8 leading-tight"
//         >
//           Resolve Issues <br/>
//           <span className="gradient-text">At Light Speed.</span>
//         </motion.h1>

//         <motion.p 
//           initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
//           className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 font-medium"
//         >
//           The next generation Smart College Complaint & Issue Management System. Built with MERN, Framer Motion, and Three.js. Zero placeholders. Production ready.
//         </motion.p>

//         <motion.div 
//           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
//           className="flex flex-col sm:flex-row gap-4"
//         >
//           <Link to="/register" className="btn-primary flex items-center justify-center text-lg px-8 py-4">
//             Start Reporting <ArrowRight className="ml-2" size={20} />
//           </Link>
//           <a href="#features" className="btn-ghost flex items-center justify-center text-lg px-8 py-4 bg-white/5">
//             Explore Features
//           </a>
//         </motion.div>

//         {/* Floating Elements (Parallax) */}
//         <motion.div style={{ y: y1 }} className="absolute -left-20 top-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
//         <motion.div style={{ y: y2 }} className="absolute -right-20 bottom-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

//       </main>

//       {/* Features Grid */}
//       <section id="features" className="relative z-10 py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
//         <div className="text-center mb-16">
//           <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Enterprise Architecture.</h2>
//           <p className="text-white/50 text-lg">Built strictly matching the rigorous project specification.</p>
//         </div>

//         <div className="grid md:grid-cols-3 gap-8">
//           {features.map((f, idx) => (
//             <motion.div 
//               initial={{ opacity: 0, y: 30 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true, margin: "-100px" }}
//               transition={{ duration: 0.5, delay: idx * 0.1 }}
//               key={idx}
//               className="glass-card p-8 group hover:glow-brand transition-shadow"
//             >
//               <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition-transform">
//                 <f.icon size={28} />
//               </div>
//               <h3 className="text-xl font-bold mb-3">{f.title}</h3>
//               <p className="text-white/60 leading-relaxed">{f.desc}</p>
//             </motion.div>
//           ))}
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="border-t border-white/10 mt-20 relative z-10 bg-black/40 backdrop-blur-md">
//         <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center text-sm text-white/40">
//           <p>© {new Date().getFullYear()} Shreyarth Resolve. All rights reserved.</p>
//           <div className="flex items-center gap-4 mt-4 md:mt-0">
            
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default HomePage;