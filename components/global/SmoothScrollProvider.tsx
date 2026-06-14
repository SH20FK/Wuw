'use client';
import { ReactNode, useEffect } from 'react';
import Lenis from 'lenis';
import useScrollStore from '@/store/useScrollStore';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });
    const setVelocity = useScrollStore.getState().setVelocity;
    const velocityTracker = { value: 0 };
    lenis.on('scroll', (e: any) => {
      ScrollTrigger.update();
      const v = Math.min(Math.abs(e.velocity) / 80, 1.0);
      setVelocity(v);
      gsap.to(velocityTracker, {
        value: 0, duration: 1.2, ease: 'expo.out', overwrite: true,
        onUpdate: () => setVelocity(velocityTracker.value),
      });
      velocityTracker.value = v;
    });
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
  }, []);
  return <>{children}</>;
}
