export const pageVariants = {
  initial: { opacity: 0, y: 24, filter: 'blur(8px)' },
  animate: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  exit: { 
    opacity: 0, 
    y: -16, 
    filter: 'blur(4px)',
    transition: { duration: 0.3 }
  }
};

export const cardVariants = {
  initial:  { opacity: 0, y: 32, scale: 0.96 },
  animate:  { 
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  hover: {
    y: -8, scale: 1.02,
    boxShadow: '0 32px 64px rgba(0,0,0,0.5), 0 0 40px rgba(99,102,241,0.2)',
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  },
  tap: { scale: 0.98 }
};

export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

export const slideInLeft = {
  initial: { x: -40, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.4 } }
};

export const fadeInUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.35 } }
};

export const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, opacity: 1,
    transition: { type: 'spring', stiffness: 400, damping: 25 }
  }
};
