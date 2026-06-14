'use client';
import dynamic from 'next/dynamic';

const CanvasObj = dynamic(() => import('@/components/three/GrainCanvas'), { ssr: false });

export function BackgroundWrapper() {
  return <CanvasObj />;
}
