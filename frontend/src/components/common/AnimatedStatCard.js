import React from 'react';
import { motion } from 'framer-motion';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';
import GlassCard from './GlassCard';

const AnimatedStatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => {
  const ref = useAnimatedCounter(value, 2);

  const colorMap = {
    blue: 'border-blue-500 bg-blue-500/10 text-blue-400',
    yellow: 'border-yellow-500 bg-yellow-500/10 text-yellow-400',
    indigo: 'border-indigo-500 bg-indigo-500/10 text-indigo-400',
    green: 'border-green-500 bg-green-500/10 text-green-400',
    cyan: 'border-cyan-500 bg-cyan-500/10 text-cyan-400',
    rose: 'border-rose-500 bg-rose-500/10 text-rose-400',
  };

  const borderGradient = {
    blue: 'from-blue-500 to-cyan-400',
    yellow: 'from-yellow-400 to-amber-600',
    indigo: 'from-indigo-500 to-purple-500',
    green: 'from-green-400 to-emerald-600',
    cyan: 'from-cyan-400 to-blue-500',
    rose: 'from-rose-400 to-pink-500',
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="relative group"
    >
      <GlassCard className={`overflow-hidden p-6 h-full transition-shadow duration-300 group-hover:glow-${color}`}>
        <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${borderGradient[color]} opacity-70`} />
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-white/50">{title}</p>
            <h3 className="text-3xl font-bold mt-2 text-white" ref={ref}>0</h3>
            {subtitle && (
              <p className="text-xs text-white/40 mt-1 flex items-center">
                {trend === 'up' && <span className="text-green-400 mr-1">↑</span>}
                {trend === 'down' && <span className="text-red-400 mr-1">↓</span>}
                {subtitle}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${colorMap[color]}`}>
            <Icon size={24} />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default AnimatedStatCard;
