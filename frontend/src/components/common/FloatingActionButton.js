import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

const FloatingActionButton = ({ onClick, tooltip = "Create Complaint" }) => {
  return (
    <div className="fixed bottom-8 right-8 z-40 group">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#16162a] text-sm text-white/90 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl"
        >
          {tooltip}
        </motion.div>
      </AnimatePresence>
      
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_30px_rgba(99,102,241,0.5)] border border-white/20 hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] transition-shadow"
      >
        <Plus size={28} strokeWidth={2.5} />
      </motion.button>
    </div>
  );
};

export default FloatingActionButton;
