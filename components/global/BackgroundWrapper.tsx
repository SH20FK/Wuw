'use client';
import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

const CanvasObj = dynamic(() => import('@/components/three/GrainCanvas'), { ssr: false });

function isWebGLAvailable() {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

export function BackgroundWrapper() {
  const [hasWebGL, setHasWebGL] = useState(true);
  const spotlightRef = useRef<HTMLDivElement>(null);
  
  // Keep mouse target and current smooth values in refs to avoid any React re-renders on every frame/mouse move
  const mousePosRef = useRef({ x: 0, y: 0 });
  const smoothPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setHasWebGL(isWebGLAvailable());
    
    // Set initial position to center of screen before mouse moves
    const initX = window.innerWidth / 2;
    const initY = window.innerHeight / 2;
    mousePosRef.current = { x: initX, y: initY };
    smoothPosRef.current = { x: initX, y: initY };
    
    if (spotlightRef.current) {
      spotlightRef.current.style.background = `radial-gradient(750px circle at ${initX}px ${initY}px, var(--color-accent-glow), transparent 75%)`;
    }
  }, []);

  // Listen to mouse moving across window
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Smooth out coordinate tracking with viscous spring effect in a single rAF loop
  useEffect(() => {
    let rafId: number;
    let active = true;
    
    const tick = () => {
      if (!active) return;
      
      const targetMouse = mousePosRef.current;
      const currentSmooth = smoothPosRef.current;
      
      const dx = targetMouse.x - currentSmooth.x;
      const dy = targetMouse.y - currentSmooth.y;
      
      const nextX = currentSmooth.x + dx * 0.025; // slow viscous response
      const nextY = currentSmooth.y + dy * 0.025;
      
      smoothPosRef.current = { x: nextX, y: nextY };
      
      // Write directly to div ref style to avoid React state re-renders entirely
      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(750px circle at ${nextX}px ${nextY}px, var(--color-accent-glow), transparent 75%)`;
      }
      
      rafId = requestAnimationFrame(tick);
    };
    
    rafId = requestAnimationFrame(tick);
    return () => {
      active = false;
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      {/* 1. Soft, ultra-low opacity spotlight following mouse coordinates behind page content */}
      <div 
        ref={spotlightRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(750px circle at 50% 50%, var(--color-accent-glow), transparent 75%)`,
          opacity: 0.28,
        }}
      />

      {/* 2. Dynamic GLSL film grain overlay canvas */}
      {hasWebGL && <CanvasObj />}
    </>
  );
}
