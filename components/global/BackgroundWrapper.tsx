'use client';
import { useEffect, useRef } from 'react';
import useLastFmStore from '@/store/useLastFmStore';

/**
 * Ambient background: a composited spotlight + a CSS film-grain layer.
 * Both are GPU-only (transform / opacity), no per-frame gradients or shaders,
 * so the background costs nothing while the page is idle.
 */
export function BackgroundWrapper() {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const grainIntensity = useLastFmStore((state) => state.grainIntensity);
  const grainSpeed = useLastFmStore((state) => state.grainSpeed);

  useEffect(() => {
    const el = spotlightRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const SIZE = 1500;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let x = targetX;
    let y = targetY;
    let raf = 0;

    const paint = () => {
      el.style.transform = `translate3d(${x - SIZE / 2}px, ${y - SIZE / 2}px, 0)`;
    };

    const tick = () => {
      x += (targetX - x) * 0.07;
      y += (targetY - y) * 0.07;
      paint();

      if (Math.abs(targetX - x) < 0.5 && Math.abs(targetY - y) < 0.5) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    paint();
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        ref={spotlightRef}
        className="fixed top-0 left-0 w-[1500px] h-[1500px] rounded-full pointer-events-none z-0 will-change-transform"
        style={{
          background: 'radial-gradient(circle closest-side, var(--color-accent-glow), transparent 100%)',
          opacity: 0.28,
        }}
      />

      <div
        className="grain-layer"
        aria-hidden="true"
        style={{
          opacity: grainIntensity,
          animationDuration: `${Math.max(0.5, 1.4 / Math.max(0.2, grainSpeed))}s`,
        }}
      />
    </>
  );
}