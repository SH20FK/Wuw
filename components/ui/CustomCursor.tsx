'use client';
import { useEffect, useState, useRef } from 'react';
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

  const visibleRef = useRef(false);
  const hoveredRef = useRef(false);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      cursorX.set(e.clientX - 12);
      cursorY.set(e.clientY - 12);
      const inside =
        e.clientX > 0 &&
        e.clientY > 0 &&
        e.clientX < window.innerWidth &&
        e.clientY < window.innerHeight;
      if (inside !== visibleRef.current) {
        visibleRef.current = inside;
        setIsVisible(inside);
      }
    };

    const handleMouseDown = () => setIsActive(true);
    const handleMouseUp = () => setIsActive(false);

    // One `closest()` walk against a combined selector instead of six queries per mouseover.
    const handlePointerOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const interactive = !!(
        target &&
        target.closest('a,button,input,textarea,select,[role="button"],.cursor-pointer,[data-cursor="hover"]')
      );
      if (interactive !== hoveredRef.current) {
        hoveredRef.current = interactive;
        setIsHovered(interactive);
      }
    };

    const handleMouseLeaveWindow = () => {
      visibleRef.current = false;
      setIsVisible(false);
    };
    const handleMouseEnterWindow = () => {
      visibleRef.current = true;
      setIsVisible(true);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('pointerover', handlePointerOver, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeaveWindow);
    document.addEventListener('mouseenter', handleMouseEnterWindow);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('pointerover', handlePointerOver);
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
