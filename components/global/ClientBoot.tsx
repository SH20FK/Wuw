'use client';
import { useLastFm } from '@/hooks/useLastFm';
import useLastFmStore from '@/store/useLastFmStore';
import { useEffect } from 'react';

export function ClientBoot() {
  useLastFm();
  const accentColor = useLastFmStore((state) => state.accentColor);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--color-accent', accentColor);
    
    // Calculate and apply glows
    let r = 230, g = 28, b = 28;
    if (accentColor.startsWith('rgb')) {
      const parts = accentColor.match(/\d+/g);
      if (parts && parts.length >= 3) {
        r = parseInt(parts[0], 10);
        g = parseInt(parts[1], 10);
        b = parseInt(parts[2], 10);
      }
    } else if (accentColor.startsWith('#')) {
      const hex = accentColor.replace('#', '');
      if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      }
    }
    
    root.style.setProperty('--color-accent-glow', `rgba(${r}, ${g}, ${b}, 0.08)`);
    // Calibrate secondary/sub-accent based on the extracted color
    // Let's make it a slightly desaturated steel version of the dominant color
    const sr = Math.max(0, Math.floor(r * 0.7));
    const sg = Math.max(0, Math.floor(g * 0.73));
    const sb = Math.max(0, Math.floor(b * 0.8));
    root.style.setProperty('--color-accent-sub', `rgb(${sr}, ${sg}, ${sb})`);

  }, [accentColor]);

  return null;
}
