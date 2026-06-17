'use client';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Sphere } from './Sphere';

export default function HeroCanvas() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ preserveDrawingBuffer: false, antialias: true, alpha: true }}
        dpr={[1, 1.5]}
        style={{ pointerEvents: 'none' }}
        className="w-full h-full"
      >
        <Sphere />
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={1.2}
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
