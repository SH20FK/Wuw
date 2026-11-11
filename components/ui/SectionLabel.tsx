'use client';
import { useRef, useEffect } from 'react';
import useScrollStore from '@/store/useScrollStore';

export function SectionLabel({ children }: { children: React.ReactNode }) {
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = labelRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Transform-only skew. Animating font-weight/letter-spacing here re-shaped
    // the text on every frame and forced a layout pass while scrolling.
    let raf = 0;
    let skew = 0;

    const tick = () => {
      const velocity = useScrollStore.getState().velocity;
      const target = Math.max(-10, Math.min(10, velocity * -6));
      skew += (target - skew) * 0.14;
      el.style.transform = `skewX(${skew.toFixed(2)}deg)`;

      if (Math.abs(velocity) < 0.001 && Math.abs(skew) < 0.02) {
        el.style.transform = '';
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const unsubscribe = useScrollStore.subscribe(() => {
      if (!raf) raf = requestAnimationFrame(tick);
    });

    return () => {
      unsubscribe();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={labelRef}
      className="font-mono text-xs text-accent tracking-wider uppercase mb-8 inline-block origin-left"
    >
      {children}
    </div>
  );
}