'use client';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import useLastFmStore from '@/store/useLastFmStore';

export function Sphere() {
  const pointsRef = useRef<THREE.Points>(null);
  const geomRef = useRef<THREE.BufferGeometry>(null);
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  
  const { accentColor, nowPlaying } = useLastFmStore();
  const isPlaying = nowPlaying?.['@attr']?.nowplaying === 'true';

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Save the initial spherical coordinates to calculate wave warps relative to home position
  const initialPositions = useMemo(() => {
    const geo = new THREE.SphereGeometry(1.8, 36, 36);
    return geo.getAttribute('position').clone();
  }, []);

  useFrame((state) => {
    if (!pointsRef.current || !geomRef.current) return;

    // Smoothly interpolate current mouse to target mouse with inertia
    const lerpSpeed = 0.04;
    mouse.current.x += (mouse.current.targetX - mouse.current.x) * lerpSpeed;
    mouse.current.y += (mouse.current.targetY - mouse.current.y) * lerpSpeed;

    // Adjust rate of particle self-rotation based on track playing state
    const autoSpeed = isPlaying ? 0.35 : 0.08;
    const autoY = state.clock.getElapsedTime() * autoSpeed;
    const autoX = state.clock.getElapsedTime() * (autoSpeed * 0.5);
    
    pointsRef.current.rotation.y = autoY + mouse.current.x * 0.7;
    pointsRef.current.rotation.x = autoX + mouse.current.y * 0.5;

    // Organic expansion breathing
    const breathRate = isPlaying ? 2.2 : 0.8;
    const breathAmp = isPlaying ? 0.08 : 0.03;
    const scale = 1.0 + Math.sin(state.clock.getElapsedTime() * breathRate) * breathAmp;
    pointsRef.current.scale.set(scale, scale, scale);

    // Dynamic wave distortion turbulence (sine noise wave) simulating a voice/audio print
    const positions = geomRef.current.getAttribute('position');
    const count = positions.count;
    const warpTime = state.clock.getElapsedTime() * (isPlaying ? 4.0 : 1.0);
    const waveFreq = isPlaying ? 1.5 : 0.6;
    const waveAmp = isPlaying ? 0.18 : 0.04;

    for (let i = 0; i < count; i++) {
      const rx = initialPositions.getX(i);
      const ry = initialPositions.getY(i);
      const rz = initialPositions.getZ(i);

      // Mutate coordinates to generate high-fidelity physical acoustics
      const offset = (rx + ry + rz) * waveFreq;
      const dx = Math.sin(warpTime + offset) * waveAmp;
      const dy = Math.cos(warpTime + offset) * waveAmp;
      const dz = Math.sin(warpTime + offset * 1.5) * waveAmp;

      positions.setXYZ(i, rx + dx, ry + dy, rz + dz);
    }
    positions.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} renderOrder={1}>
      <sphereGeometry ref={geomRef} args={[1.8, 36, 36]} />
      <pointsMaterial 
        color={accentColor} 
        size={isPlaying ? 0.016 : 0.012} 
        transparent 
        opacity={isPlaying ? 0.8 : 0.55} 
        sizeAttenuation 
      />
    </points>
  );
}
