'use client';
import { Canvas } from '@react-three/fiber';
import { Sphere } from './Sphere';

export default function HeroCanvas() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ preserveDrawingBuffer: false, antialias: true, alpha: true }}
        dpr={[1, 1.5]}
        style={{ pointerEvents: 'none' }}
        className="w-full h-full opacity-60"
      >
        <Sphere />
      </Canvas>
    </div>
  );
}
