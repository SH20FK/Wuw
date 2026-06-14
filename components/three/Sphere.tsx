'use client';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';

export function Sphere() {
  const pointsRef = useRef<THREE.Points>(null);
  const { size } = useThree();
  const geometry = useMemo(() => new THREE.SphereGeometry(1.8, 48, 48), []);
  const mouseActivity = useRef(0);

  useEffect(() => {
    const handleMouseMove = () => { mouseActivity.current = 1.0; };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    let targetSpeedY = 0.0015;
    let targetSpeedX = 0.0007;
    if (mouseActivity.current > 0) {
      targetSpeedY = 0.01;
      targetSpeedX = 0.005;
      mouseActivity.current -= delta * 0.5;
      if (mouseActivity.current < 0) mouseActivity.current = 0;
    }
    pointsRef.current.rotation.y += THREE.MathUtils.lerp(0.0015, targetSpeedY, mouseActivity.current);
    pointsRef.current.rotation.x += THREE.MathUtils.lerp(0.0007, targetSpeedX, mouseActivity.current);
    const scale = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.06;
    pointsRef.current.scale.set(scale, scale, scale);
  });

  return (
    <points ref={pointsRef} renderOrder={1}>
      <sphereGeometry args={[1.8, 48, 48]} />
      <pointsMaterial color="#B8AD9E" size={0.012} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}
