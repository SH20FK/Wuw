'use client';
import { useEffect, useState } from 'react';
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [smoothPos, setSmoothPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setHasWebGL(isWebGLAvailable());
    
    // Set initial position to center of screen before mouse moves
    setMousePos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    setSmoothPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  }, []);

  // Listen to mouse moving across window
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Smooth out coordinate tracking with viscous spring effect
  useEffect(() => {
    let active = true;
    const tick = () => {
      if (!active) return;
      setSmoothPos(prev => {
        const dx = mousePos.x - prev.x;
        const dy = mousePos.y - prev.y;
        return {
          x: prev.x + dx * 0.025, // slow viscous response
          y: prev.y + dy * 0.025
        };
      });
      requestAnimationFrame(tick);
    };
    tick();
    return () => { active = false; };
  }, [mousePos]);

  return (
    <>
      {/* 1. Soft, ultra-low opacity spotlight following mouse coordinates behind page content */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(750px circle at ${smoothPos.x}px ${smoothPos.y}px, var(--color-accent-glow), transparent 75%)`,
          opacity: 0.28,
        }}
      />

      {/* 2. Dynamic GLSL film grain overlay canvas */}
      {hasWebGL && <CanvasObj />}
    </>
  );
}

