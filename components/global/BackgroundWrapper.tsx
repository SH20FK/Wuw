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

  useEffect(() => {
    setHasWebGL(isWebGLAvailable());
  }, []);

  if (!hasWebGL) return null;
  return <CanvasObj />;
}
