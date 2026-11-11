'use client';
import { useEffect, useRef, useState } from 'react';
import useLastFmStore from '@/store/useLastFmStore';
import { accentRgba, applyAccent } from '@/lib/accent';

/**
 * Track change = a ring of the new accent colour sweeping in from the
 * bottom-right corner (where the now-playing pill lives).
 *
 * The colour itself is applied instantly; the ring is the visible cue. A view
 * transition was tried first, but the page only changes its accent — the before
 * and after snapshots are 95% identical, so the circular wipe was invisible.
 *
 * Transform + opacity only, skipped entirely for reduced motion.
 */
export function AccentSplash() {
  const accentColor = useLastFmStore((state) => state.accentColor);
  const applied = useRef<string | null>(null);
  const [splash, setSplash] = useState<{ id: number; color: string } | null>(null);

  // Manual trigger for checking the effect: window.__accentPreview('#3b82f6')
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__accentPreview = (color?: string) => {
      const next = color || `hsl(${Math.round(Math.random() * 360)} 55% 58%)`;
      useLastFmStore.getState().setAccentColor(next);
    };
  }, []);

  useEffect(() => {
    if (applied.current === null) {
      applied.current = accentColor;
      applyAccent(accentColor);
      return;
    }
    if (applied.current === accentColor) return;
    applied.current = accentColor;

    applyAccent(accentColor);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    setSplash({ id: Date.now(), color: accentColor });
    const timer = setTimeout(() => setSplash(null), 1300);
    return () => clearTimeout(timer);
  }, [accentColor]);

  if (!splash) return null;

  return (
    <div
      key={splash.id}
      aria-hidden="true"
      className="accent-splash"
      style={{
        background: `radial-gradient(circle closest-side, transparent 52%, ${accentRgba(
          splash.color,
          0.4
        )} 76%, ${accentRgba(splash.color, 0.95)} 89%, transparent 100%)`,
      }}
    />
  );
}