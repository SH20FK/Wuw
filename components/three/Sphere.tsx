'use client';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';

export function Sphere() {
  const pointsRef = useRef<THREE.Points>(null);
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    // Smoothly interpolate current mouse to target mouse with inertia
    const lerpSpeed = 0.03;
    mouse.current.x += (mouse.current.targetX - mouse.current.x) * lerpSpeed;
    mouse.current.y += (mouse.current.targetY - mouse.current.y) * lerpSpeed;

    // Apply smooth constant auto-rotation plus elegant parallax tilt
    const autoY = state.clock.elapsedTime * 0.06;
    const autoX = state.clock.elapsedTime * 0.03;
    
    pointsRef.current.rotation.y = autoY + mouse.current.x * 0.6;
    pointsRef.current.rotation.x = autoX + mouse.current.y * 0.4;

    // Gentle organic breathing scale
    const scale = 1.0 + Math.sin(state.clock.elapsedTime * 1.0) * 0.04;
    pointsRef.current.scale.set(scale, scale, scale);
  });

  return (
    <points ref={pointsRef} renderOrder={1}>
      <sphereGeometry args={[1.8, 48, 48]} />
      <pointsMaterial color="#B8AD9E" size={0.012} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}
