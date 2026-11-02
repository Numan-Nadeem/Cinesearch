import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Sole smooth-scroll engine hook using Lenis connected to GSAP ScrollTrigger.
 * Strictly bypassed under prefers-reduced-motion: reduce and cleaned up on unmount.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lenis = null;
    let tickerCallback = null;

    const destroyLenis = () => {
      if (tickerCallback) {
        gsap.ticker.remove(tickerCallback);
        tickerCallback = null;
      }
      if (lenis) {
        lenis.destroy();
        lenis = null;
      }
    };

    const initLenis = () => {
      destroyLenis();
      if (motionQuery.matches) {
        ScrollTrigger.refresh();
        return;
      }

      lenis = new Lenis({
        lerp: 0.09,
        smoothWheel: true,
        syncTouch: false,
      });

      lenis.on('scroll', ScrollTrigger.update);

      tickerCallback = (time) => {
        if (lenis) {
          lenis.raf(time * 1000);
        }
      };

      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);
    };

    initLenis();

    // Refresh ScrollTrigger measurements once web fonts finish loading
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }

    const handleMotionChange = () => {
      initLenis();
    };

    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      destroyLenis();
    };
  }, []);
}
