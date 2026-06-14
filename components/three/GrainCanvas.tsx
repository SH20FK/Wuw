'use client';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo, useEffect } from 'react';
import useLastFmStore from '@/store/useLastFmStore';
import { Sphere } from './Sphere';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform float uIntensity;
uniform float uSpeed;
varying vec2 vUv;
float random(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  vec2 uv = vUv;
  float t = floor(uTime * uSpeed * 24.0) / 24.0;
  float g = random(uv + t);
  if (uIntensity <= 0.0) discard;
  vec3 outColor = vec3(g);
  gl_FragColor = vec4(outColor, uIntensity);
}
`;

function GrainPlane() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const intensity = useLastFmStore(state => state.grainIntensity);
  const speed = useLastFmStore(state => state.grainSpeed);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uIntensity: { value: intensity },
    uSpeed: { value: speed }
  }), [intensity, speed]);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uIntensity.value = intensity;
      materialRef.current.uniforms.uSpeed.value = speed;
    }
  }, [intensity, speed]);

  useFrame((state) => {
    if (materialRef.current) materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh renderOrder={999}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

export default function BackgroundCanvas() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 100 }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ preserveDrawingBuffer: false, antialias: false, alpha: true }} dpr={[1, 2]}>
        <GrainPlane />
        <Sphere />
      </Canvas>
    </div>
  );
}
