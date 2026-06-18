'use client';
import { useRef, MouseEvent } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useSfx } from '@/lib/useSfx';

export function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const { playHover } = useSfx();

  const springConfig = { type: 'spring' as const, stiffness: 140, damping: 12, mass: 0.15 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  // Cached ref coordinates to avoid layout thrashing via getBoundingClientRect on mousemove
  const rectRef = useRef<{ centerX: number; centerY: number } | null>(null);

  const handleMouseEnter = () => {
    playHover();
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      rectRef.current = {
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!rectRef.current) return;
    const { clientX, clientY } = e;
    const { centerX, centerY } = rectRef.current;
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;
    
    // Smooth pull multiplier
    x.set(distanceX * 0.35);
    y.set(distanceY * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    rectRef.current = null;
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ x: smoothX, y: smoothY }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}
