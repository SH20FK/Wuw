'use client';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { createNoise3D } from 'simplex-noise';
import useLastFmStore from '@/store/useLastFmStore';

const GEOMETRY_ARGS = [1.8, 36, 36] as const;

export function Sphere() {
  const pointsRef = useRef<THREE.Points>(null);
  const outerPointsRef = useRef<THREE.Points>(null);
  const geomRef = useRef<THREE.BufferGeometry>(null);
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  
  const { accentColor, nowPlaying } = useLastFmStore();
  const isPlaying = nowPlaying?.['@attr']?.nowplaying === 'true';

  const noise3D = useMemo(() => createNoise3D(), []);

  // Continuous animation phase accumulators to prevent phase-jump glitches
  const warpTimeRef = useRef(0);
  const breathPhaseRef = useRef(0);

  // Parameter smooth transitions
  const currentSpeedRef = useRef(0.4);
  const currentWaveAmpRef = useRef(0.08);
  const currentWaveFreqRef = useRef(0.35);
  const currentBreathAmpRef = useRef(0.03);
  const currentBreathRateRef = useRef(0.8);

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

  // Generate outer loose acoustic cloud particles in a shell of 2.2 to 5.0 radius
  const outerParticles = useMemo(() => {
    const count = 350;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2.2 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current || !geomRef.current || !outerPointsRef.current) return;

    // Throttle high deltas (e.g. background tab suspension) to prevent massive delta leaps
    const dt = Math.min(delta, 0.1);

    // Smoothly interpolate current mouse to target mouse with inertia
    const lerpSpeed = 0.04;
    mouse.current.x += (mouse.current.targetX - mouse.current.x) * lerpSpeed;
    mouse.current.y += (mouse.current.targetY - mouse.current.y) * lerpSpeed;

    // Define target parameters depending on play status
    const targetSpeed = isPlaying ? 1.4 : 0.4;
    const targetWaveAmp = isPlaying ? 0.32 : 0.08;
    const targetWaveFreq = isPlaying ? 0.8 : 0.4;
    const targetBreathAmp = isPlaying ? 0.08 : 0.03;
    const targetBreathRate = isPlaying ? 2.2 : 0.8;

    // Inertial smoothing for parameters over time
    const paramLerp = 0.06;
    currentSpeedRef.current += (targetSpeed - currentSpeedRef.current) * paramLerp;
    currentWaveAmpRef.current += (targetWaveAmp - currentWaveAmpRef.current) * paramLerp;
    currentWaveFreqRef.current += (targetWaveFreq - currentWaveFreqRef.current) * paramLerp;
    currentBreathAmpRef.current += (targetBreathAmp - currentBreathAmpRef.current) * paramLerp;
    currentBreathRateRef.current += (targetBreathRate - currentBreathRateRef.current) * paramLerp;

    // Accumulate timeline positions using the smoothed speeds
    warpTimeRef.current += dt * currentSpeedRef.current;
    breathPhaseRef.current += dt * currentBreathRateRef.current;

    // Adjust rate of particle self-rotation based on smoothed speed
    const autoSpeed = isPlaying ? 0.35 : 0.08;
    const autoY = state.clock.getElapsedTime() * autoSpeed;
    const autoX = state.clock.getElapsedTime() * (autoSpeed * 0.5);
    
    // Core Sphere Rotation
    pointsRef.current.rotation.y = autoY + mouse.current.x * 0.7;
    pointsRef.current.rotation.x = autoX + mouse.current.y * 0.5;

    // Outer Cloud: rotates slower but has far more mouse parallax tilt (giving depth)
    outerPointsRef.current.rotation.y = (autoY * 0.3) + mouse.current.x * 1.6;
    outerPointsRef.current.rotation.x = (autoX * 0.3) + mouse.current.y * 1.2;

    // Organic expansion breathing with accumulated continuous phase (completely eliminates visual pops)
    const scale = 1.0 + Math.sin(breathPhaseRef.current) * currentBreathAmpRef.current;
    pointsRef.current.scale.set(scale, scale, scale);
    
    const outerBreath = 1.0 + Math.sin(breathPhaseRef.current * 0.7) * (currentBreathAmpRef.current * 1.3);
    outerPointsRef.current.scale.set(outerBreath, outerBreath, outerBreath);

    // Dynamic wave distortion turbulence (simplex 3D noise)
    const positions = geomRef.current.getAttribute('position');
    const count = positions.count;
    const waveFreq = currentWaveFreqRef.current;
    const waveAmp = currentWaveAmpRef.current;
    const warpTime = warpTimeRef.current;

    for (let i = 0; i < count; i++) {
      const rx = initialPositions.getX(i);
      const ry = initialPositions.getY(i);
      const rz = initialPositions.getZ(i);

      // Separate 3D noise translation for x, y, z with varied seed offsets to avoid synchronization
      const dx = noise3D(rx * waveFreq + warpTime, ry * waveFreq, rz * waveFreq) * waveAmp;
      const dy = noise3D(rx * waveFreq, ry * waveFreq + warpTime + 100.0, rz * waveFreq) * waveAmp;
      const dz = noise3D(rx * waveFreq, ry * waveFreq, rz * waveFreq + warpTime + 200.0) * waveAmp;

      positions.setXYZ(i, rx + dx, ry + dy, rz + dz);
    }
    positions.needsUpdate = true;
  });

  return (
    <group>
      {/* Main Core Sphere */}
      <points ref={pointsRef} renderOrder={2}>
        <sphereGeometry ref={geomRef} args={GEOMETRY_ARGS} />
        <pointsMaterial 
          color={accentColor} 
          size={isPlaying ? 0.016 : 0.012} 
          transparent 
          opacity={isPlaying ? 0.8 : 0.55} 
          sizeAttenuation 
        />
      </points>

      {/* Loose Outer Acoustic Cloud */}
      <points ref={outerPointsRef} renderOrder={1}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[outerParticles, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color={accentColor}
          size={0.007}
          transparent
          opacity={isPlaying ? 0.35 : 0.22}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
