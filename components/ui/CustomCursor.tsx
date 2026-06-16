'use client';
import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { stiffness: 450, damping: 30, mass: 0.15 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX - 12);
      cursorY.set(e.clientY - 12);
      const isOutside = e.clientX <= 0 || e.clientY <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight;
      setIsVisible(!isOutside);
    };

    const handleMouseDown = () => setIsActive(true);
    const handleMouseUp = () => setIsActive(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      const isInteractive = 
        target.closest('a') || 
        target.closest('button') || 
        target.closest('input') || 
        target.closest('textarea') || 
        target.dataset.cursor === 'hover' ||
        target.closest('[role="button"]') ||
        target.classList.contains('cursor-pointer');
      
      setIsHovered(!!isInteractive);
    };

    const handleMouseLeaveWindow = () => setIsVisible(false);
    const handleMouseEnterWindow = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeaveWindow);
    document.addEventListener('mouseenter', handleMouseEnterWindow);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
      document.removeEventListener('mouseenter', handleMouseEnterWindow);
    };
  }, [cursorX, cursorY]);

  // Disable custom cursor on mobile/tablet touch devices
  const [isTouchDevice, setIsTouchDevice] = useState(true);
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  if (isTouchDevice || !isVisible) return null;

  return (
    <>
      {/* Outer focus halo ring */}
      <motion.div
        className="fixed top-0 left-0 w-6 h-6 rounded-full border border-[var(--color-accent)] pointer-events-none z-[99999]"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          scale: isHovered ? 1.8 : isActive ? 0.85 : 1.0,
          backgroundColor: isHovered ? 'var(--color-accent-glow)' : 'transparent',
          borderColor: 'var(--color-accent)',
        }}
      />
      {/* Inner physical targeting dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[99999] -translate-x-[2px] -translate-y-[2px]"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          scale: isHovered ? 0.4 : isActive ? 0.7 : 1.0,
          backgroundColor: 'var(--color-accent)',
          left: '10px',
          top: '10px'
        }}
      />
    </>
  );
}
