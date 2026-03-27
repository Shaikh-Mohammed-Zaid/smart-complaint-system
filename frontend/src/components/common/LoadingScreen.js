import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingScreen = ({ fullScreen = false, text = 'Loading...' }) => {
  const containerClass = fullScreen 
    ? "fixed inset-0 z-50 flex items-center justify-center bg-[#0f0f1a] mesh-bg" 
    : "flex flex-1 items-center justify-center p-12 min-h-[400px]";

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className={containerClass}
      >
        <div className="relative flex flex-col items-center">
          {fullScreen && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
              <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent animate-pulse" />
            </div>
          )}
          
          <div className="relative w-16 h-16">
            <svg className="animate-spin w-full h-full text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div className="absolute inset-0 border-t-2 border-cyan-400 rounded-full animate-ping opacity-30"></div>
          </div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-xl font-bold gradient-text tracking-widest uppercase text-center"
          >
            {text}
          </motion.h2>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingScreen;
