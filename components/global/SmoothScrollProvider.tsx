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
    let currentVelocity = 0;
    let publishedVelocity = 0;

    lenis.on('scroll', (e: any) => {
      ScrollTrigger.update();
      const computedVelocity = Math.min(Math.abs(e.velocity) / 30, 2.0);
      if (computedVelocity > currentVelocity) {
        currentVelocity = computedVelocity;
      }
    });

    const updateFrame = (time: number) => {
      lenis.raf(time * 1000);
      
      // Natural spring-like decay towards rest
      currentVelocity += (0.0 - currentVelocity) * 0.07;
      if (currentVelocity < 0.001) {
        currentVelocity = 0.0;
      }
      // Publish only on a meaningful change so idle frames don't wake every subscriber.
      if (Math.abs(currentVelocity - publishedVelocity) > 0.002) {
        publishedVelocity = currentVelocity;
        setVelocity(currentVelocity);
      }
    };

    gsap.ticker.add(updateFrame);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(updateFrame);
    };
  }, []);
  return <>{children}</>;
}
