import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

/**
 * Editorial Spring Physics configuration
 * Calm, tactile, no excessive bounce - tailored for Garden theme
 */
export const springTransition = {
  type: 'spring',
  stiffness: 320,
  damping: 26,
  mass: 0.8
};

export const gentleTransition = {
  duration: 0.28,
  ease: [0.16, 1, 0.3, 1]
};

/**
 * PageTransition wrapper
 * Smoothly transitions routes with subtle opacity and vertical drift
 */
export const PageTransition = ({ children, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
      transition={gentleTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * FadeInUp on view / mount
 */
export const FadeInUp = ({ children, delay = 0, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...gentleTransition, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Tactile Button Wrapper
 */
export const MotionButton = motion.button;
export const MotionDiv = motion.div;

export { motion, AnimatePresence, useReducedMotion };
