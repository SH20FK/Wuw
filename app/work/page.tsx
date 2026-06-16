'use client';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { motion } from 'framer-motion';
import { Magnetic } from '@/components/ui/Magnetic';
import Link from 'next/link';
import { useRef, useEffect } from 'react';
import { useSfx } from '@/lib/useSfx';

export default function WorkPage() {
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { playHover, playClick } = useSfx();

  useEffect(() => {
    let active = true;
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;
    const velocityRef = { current: 0 };
    
    let currentSkew = 0;
    let currentSpacing = 0;
    let currentWeight = 300;

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      const elapsed = Math.max(1, now - lastTime);
      
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const dist = Math.hypot(dx, dy);
      
      const rawVelocity = dist / elapsed;
      const direction = dx >= 0 ? 1 : -1;
      
      velocityRef.current = Math.min(22, rawVelocity * 2.5) * direction;

      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = now;
    };

    const updateKinetic = () => {
      if (!active) return;

      velocityRef.current *= 0.92;

      currentSkew += (velocityRef.current * -1.4 - currentSkew) * 0.12;
      currentSpacing += (Math.abs(velocityRef.current) * 0.9 - currentSpacing) * 0.12;
      currentWeight += ((300 + Math.abs(velocityRef.current) * 14) - currentWeight) * 0.12;

      if (textRef.current) {
        textRef.current.style.transform = `skewX(${Math.max(-18, Math.min(18, currentSkew))}deg)`;
        textRef.current.style.letterSpacing = `${Math.max(0, Math.min(28, currentSpacing))}px`;
        textRef.current.style.fontWeight = `${Math.max(100, Math.min(700, Math.round(currentWeight)))}`;
      }

      requestAnimationFrame(updateKinetic);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    updateKinetic();

    return () => {
      active = false;
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  return (
    <main className="w-full relative bg-bg min-h-screen flex flex-col justify-between overflow-hidden py-32 px-6 sm:px-16">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-accent)]/[0.035] rounded-full blur-[140px] pointer-events-none" />

      <div>
        <SectionLabel>/ 03 WORK</SectionLabel>
      </div>

      <div className="my-auto py-12 flex flex-col items-start max-w-5xl z-10 relative">
        <div className="flex items-center gap-2.5 font-mono text-[10px] sm:text-xs text-text-muted mb-8 uppercase tracking-widest select-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-duration-1000"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span>AVAILABLE FOR NEW PROJECTS // 2026</span>
        </div>

        <div ref={containerRef} className="w-full">
          <Magnetic>
            <Link 
              href="/contact"
              onMouseEnter={playHover}
              onClick={playClick}
              className="inline-block group focus:outline-none select-none"
            >
              <div 
                ref={textRef}
                className="font-display text-[clamp(2.8rem,10vw,7.5rem)] text-text group-hover:text-accent font-light leading-[0.9] tracking-tighter transition-colors duration-500 origin-left ease-out"
              >
                ОБСУДИТЬ<br />ПРОЕКТ →
              </div>
            </Link>
          </Magnetic>
        </div>
      </div>

      <div className="flex items-center gap-2 font-mono text-[9px] text-text-muted uppercase tracking-[0.2em] select-none mt-auto">
        <span>sh20fk studio • built with integrity</span>
      </div>
    </main>
  );
}
