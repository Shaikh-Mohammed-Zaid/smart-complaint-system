import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', elevated = false, glow = '', onClick, ...props }) => {
  const baseClass = elevated ? 'glass-card-elevated' : 'glass-card';
  const glowClass = glow ? `glow-${glow}` : '';

  return (
    <motion.div
      whileHover={{ scale: 1.005 }}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`${baseClass} ${glowClass} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
