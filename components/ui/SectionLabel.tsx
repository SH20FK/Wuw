'use client';
import { useRef, useEffect } from 'react';
import useScrollStore from '@/store/useScrollStore';

export function SectionLabel({ children }: { children: React.ReactNode }) {
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    let currentSkew = 0;
    let currentSpacing = 0;
    let currentWeight = 300;

    const updateKinetic = () => {
      if (!active) return;
      const targetVelocity = useScrollStore.getState().velocity;
      
      // Lerp decay logic
      currentSkew += (targetVelocity * -0.04 - currentSkew) * 0.12;
      currentSpacing += (Math.abs(targetVelocity) * 0.05 - currentSpacing) * 0.12;
      currentWeight += ((300 + Math.abs(targetVelocity) * 1.2) - currentWeight) * 0.12;

      if (labelRef.current) {
        labelRef.current.style.transform = `skewX(${Math.max(-12, Math.min(12, currentSkew))}deg)`;
        labelRef.current.style.letterSpacing = `${Math.max(0, Math.min(15, currentSpacing))}px`;
        labelRef.current.style.fontWeight = `${Math.max(100, Math.min(600, Math.round(currentWeight)))}`;
      }

      requestAnimationFrame(updateKinetic);
    };

    updateKinetic();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div 
      ref={labelRef} 
      className="font-mono text-xs text-accent tracking-wider uppercase mb-8 inline-block transition-all duration-300 origin-left ease-out"
    >
      {children}
    </div>
  );
}
