'use client';
import { useRef, MouseEvent } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { type: 'spring' as const, stiffness: 140, damping: 12, mass: 0.15 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  // Cached ref coordinates to avoid layout thrashing via getBoundingClientRect on mousemove
  const rectRef = useRef<{ centerX: number; centerY: number } | null>(null);

  const handleMouseEnter = () => {
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
    const { centerX, centerY } = rectRef.current;
    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;
    x.set(distX * 0.12);
    y.set(distY * 0.12);
  };

  const handleMouseLeave = () => {
    rectRef.current = null;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: smoothX, y: smoothY }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}