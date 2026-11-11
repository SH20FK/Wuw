'use client';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import useLastFmStore from '@/store/useLastFmStore';

const BRAND = '#D97757';
const RADIUS = 1.7;

/** Three.js simplex noise — the height field the contour lines are cut from. */
const NOISE = `
vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

const VERTEX = `
varying vec3 vN;
varying vec3 vView;
varying vec3 vPos;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vView = normalize(-mv.xyz);
  vPos = position;
  gl_Position = projectionMatrix * mv;
}
`;

const FRAGMENT = NOISE + `
uniform float uTime;
uniform vec3 uAccent;
uniform vec3 uBone;
uniform float uEnergy;
uniform float uBurst;

varying vec3 vN;
varying vec3 vView;
varying vec3 vPos;

void main() {
  // Contour density is CONSTANT: the song never adds lines, otherwise the
  // surface reads as noise instead of a relief.
  float warp = uTime * (0.1 + uEnergy * 0.12);

  float h = snoise(vPos * 1.9 + vec3(0.0, warp, warp * 0.28)) * 0.72
          + snoise(vPos * 4.2 - vec3(warp * 0.45)) * 0.26
          + uBurst * 0.02;

  float minor = fract(h * 12.0);
  float major = fract(h * 4.0);

  float wMinor = fwidth(minor) * 0.9 + 0.001;
  float wMajor = fwidth(major) * 2.0 + 0.0028;

  float lineMinor = 1.0 - smoothstep(0.0, wMinor, min(minor, 1.0 - minor));
  float lineMajor = 1.0 - smoothstep(0.0, wMajor, min(major, 1.0 - major));

  vec3 L = normalize(vec3(0.4, 0.9, 0.35));
  float lam = clamp(dot(vN, L), 0.0, 1.0);

  vec3 base = mix(vec3(0.026, 0.024, 0.030), vec3(0.09, 0.08, 0.09), lam);
  base += uAccent * smoothstep(0.25, 0.95, h) * (0.03 + uEnergy * 0.02);

  float rim = pow(1.0 - max(dot(vN, vView), 0.0), 3.2);
  // slow breathing instead of density changes
  float breath = 0.5 + 0.5 * sin(uTime * 1.1);

  vec3 boneLine = mix(uBone, uAccent, 0.3);
  vec3 col = base
           + boneLine * lineMinor * (0.055 + uEnergy * 0.025)
           + mix(uBone, uAccent, 0.85) * lineMajor * (0.72 + uEnergy * 0.16 * breath + uBurst * 0.25)
           + uAccent * rim * (0.28 + uEnergy * 0.14 * breath + uBurst * 0.3)
           + uAccent * uBurst * 0.025;

  gl_FragColor = vec4(col, 1.0);
}
`;

export function Sphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  // Single source of truth: the accent the whole site already uses. It is
  // persisted between pages, so the sphere never flashes back to the brand
  // colour when a cover is missing.
  const accentColor = useLastFmStore((state) => state.accentColor);
  const isPlaying = useLastFmStore((state) => state.nowPlaying?.['@attr']?.nowplaying === 'true');
  const trackUrl = useLastFmStore((state) => state.nowPlaying?.url);

  const accent = useMemo(() => {
    const c = new THREE.Color(accentColor || BRAND);
    const l = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
    if (l < 0.22) c.lerp(new THREE.Color('#EAE5DC'), 0.4);
    return c;
  }, [accentColor]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAccent: { value: accent.clone() },
      uBone: { value: new THREE.Color('#EAE5DC') },
      uEnergy: { value: 0 },
      uBurst: { value: 0 },
    }),
    []
  );

  useEffect(() => {
    uniforms.uAccent.value.copy(accent);
  }, [accent, uniforms]);

  const burstRef = useRef(0);
  const energyRef = useRef(0);
  const lastTrackRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const url = trackUrl;
    if (url && url !== lastTrackRef.current) {
      if (lastTrackRef.current !== undefined) burstRef.current = 1;
      lastTrackRef.current = url;
    }
  }, [trackUrl]);

  // Desktop: keep the whole object inside the canvas instead of clipping it.
  const viewportWidth = useThree((state) => state.viewport.width);
  const stageWidth = useThree((state) => state.size.width);
  const shiftX = useMemo(() => {
    if (stageWidth < 1024) return 0;
    const maxShift = Math.max(0, viewportWidth / 2 - RADIUS * 1.04);
    return Math.min(viewportWidth * 0.19, maxShift);
  }, [viewportWidth, stageWidth]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);

    const target = isPlaying ? 1 : 0;
    energyRef.current += (target - energyRef.current) * Math.min(1, dt * 1.2);
    burstRef.current = Math.max(0, burstRef.current - dt * 0.7);

    uniforms.uTime.value += dt;
    uniforms.uEnergy.value = energyRef.current;
    uniforms.uBurst.value = burstRef.current;

    if (meshRef.current) {
      // Always turning on its own; playback only nudges the pace.
      meshRef.current.rotation.y += dt * (0.1 + energyRef.current * 0.06);
      meshRef.current.rotation.x = 0.18 + Math.sin(uniforms.uTime.value * 0.16) * 0.06;
      const breath = 1 + Math.sin(uniforms.uTime.value * 1.1) * (0.003 + energyRef.current * 0.005);
      meshRef.current.scale.setScalar(breath);
    }
  });

  return (
    <group position={[shiftX, 0, 0]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[RADIUS, 128, 96]} />
        <shaderMaterial vertexShader={VERTEX} fragmentShader={FRAGMENT} uniforms={uniforms} />
      </mesh>
    </group>
  );
}