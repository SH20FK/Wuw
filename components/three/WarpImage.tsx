'use client';
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useScrollStore from '@/store/useScrollStore';

const vertexShader = `
uniform float uVelocity;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 pos = position;
  float stretch = sin(pos.x * 3.14159 + 3.14159 / 2.0);
  float warpAmt = stretch * uVelocity * 2.0; 
  pos.x += warpAmt * sign(pos.x); 
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D uTexture;
varying vec2 vUv;
void main() {
  vec4 color = texture2D(uTexture, vUv);
  gl_FragColor = color;
}
`;

function PlaneImage({ src }: { src: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const texture = useMemo(() => new THREE.TextureLoader().load(src), [src]);
  const uniforms = useMemo(() => ({
    uTexture: { value: texture },
    uVelocity: { value: 0 },
  }), [texture]);
  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uVelocity.value = useScrollStore.getState().velocity;
    }
  });
  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2, 32, 32]} />
      <shaderMaterial ref={materialRef} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} transparent={true} />
    </mesh>
  );
}

export function WarpImage({ src, alt }: { src: string, alt: string }) {
  return (
    <div className="w-full h-full relative overflow-hidden">
      <Canvas camera={{ position: [0, 0, 1], fov: 90 }} gl={{ alpha: true, antialias: false }} className="w-full h-full">
        <PlaneImage src={src} />
      </Canvas>
    </div>
  );
}
