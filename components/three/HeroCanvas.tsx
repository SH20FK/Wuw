'use client';
import { Canvas, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { Sphere } from './Sphere';

const TARGET_FPS = 60;

/**
 * The sphere is slow ambient motion, so there is no reason to burn a 240 Hz
 * display refresh on it. With `frameloop="demand"` we render only when this
 * timer ticks, which caps the scene at TARGET_FPS and leaves the GPU free
 * for scroll and hover work.
 */
function FrameCap() {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    const id = window.setInterval(() => invalidate(), 1000 / TARGET_FPS);
    return () => window.clearInterval(id);
  }, [invalidate]);
  return null;
}

export default function HeroCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  // Stop the whole render loop while the hero is off-screen (e.g. reading About).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: '150px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
      style={{
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 6.5], fov: 45 }}
        gl={{ preserveDrawingBuffer: false, antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1]}
        frameloop={inView ? 'demand' : 'never'}
        style={{ pointerEvents: 'none' }}
        className="w-full h-full"
      >
        {inView && <FrameCap />}
        <Sphere />
      </Canvas>
    </div>
  );
}