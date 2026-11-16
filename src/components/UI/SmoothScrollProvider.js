import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

export const LenisContext = createContext(null);
export const useLenis = () => useContext(LenisContext);

/**
 * SmoothScrollProvider integrates Lenis (darkroomengineering/lenis)
 * into the React application with automatic RAF loop, route-change reset,
 * and safe fallback for Jest/testing environments.
 */
export const SmoothScrollProvider = ({ children }) => {
  const lenisRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    // Check for browser and testing environment
    if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') {
      return;
    }

    try {
      const lenis = new Lenis({
        lerp: 0.09,
        duration: 1.2,
        smoothWheel: true,
        smoothTouch: false, // Keep native iOS / touch momentum
        wheelMultiplier: 0.95,
        touchMultiplier: 1.5,
      });

      lenisRef.current = lenis;

      let rafId;
      function raf(time) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);

      return () => {
        cancelAnimationFrame(rafId);
        lenis.destroy();
        lenisRef.current = null;
      };
    } catch (err) {
      console.warn('Lenis initialization skipped:', err);
    }
  }, []);

  // Scroll to top instantly on route change
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return (
    <LenisContext.Provider value={lenisRef.current}>
      {children}
    </LenisContext.Provider>
  );
};

export default SmoothScrollProvider;
