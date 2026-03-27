import React from 'react';
import { useThreeBackground } from '../../hooks/useThreeBackground';

const ParticleBackground = () => {
  const mountRef = useThreeBackground();

  return (
    <div 
      ref={mountRef} 
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ overflow: 'hidden' }}
    />
  );
};

export default ParticleBackground;
