'use client';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import useLastFmStore from '@/store/useLastFmStore';

const GEOMETRY_ARGS = [1.8, 48, 48] as const; // Increased resolution for much higher fidelity since operations are now ultra-fast on GPU!

export function Sphere() {
  const pointsRef = useRef<THREE.Points>(null);
  const outerPointsRef = useRef<THREE.Points>(null);
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  
  const { accentColor, nowPlaying } = useLastFmStore();
  const isPlaying = nowPlaying?.['@attr']?.nowplaying === 'true';

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

  // Generate outer loose acoustic cloud particles in a shell of 2.2 to 5.0 radius
  const outerParticles = useMemo(() => {
    const count = 400; // slightly boosted for cinematic depth
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

  // Define GPU Shaders
  const mainShaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(accentColor) },
        uSize: { value: 0.016 },
        uWaveAmp: { value: 0.08 },
        uWaveFreq: { value: 0.35 },
        uBreath: { value: 1.0 },
        uOpacity: { value: 0.5 },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uSize;
        uniform float uWaveAmp;
        uniform float uWaveFreq;
        uniform float uBreath;
        
        varying vec3 vPosition;
        
        // Classic 3D Simplex Noise by Stefan Gustavson
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
        
        float snoise(vec3 v){
          const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
          const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
        
          vec3 i  = floor(v + dot(v, C.yyy) );
          vec3 x0 =   v - i + dot(i, C.xxx) ;
        
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min( g.xyz, l.zxy );
          vec3 i2 = max( g.xyz, l.zxy );
        
          vec3 x1 = x0 - i1 + 1.0 * C.xxx;
          vec3 x2 = x0 - i2 + 2.0 * C.xxx;
          vec3 x3 = x0 - D.yyy;
        
          i = mod(i, 289.0 );
          vec4 p = permute( permute( permute(
                     i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
        
          float n_ = 0.142857142857;
          vec3  ns = n_ * D.wyz - D.xzx;
        
          vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
        
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_ );
        
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
        
          vec4 b0 = vec4( x.xy, y.xy );
          vec4 b1 = vec4( x.zw, y.zw );
        
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
        
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
        
          vec3 p0 = vec3(a0.xy,h.x);
          vec3 p1 = vec3(a0.zw,h.y);
          vec3 p2 = vec3(a1.xy,h.z);
          vec3 p3 = vec3(a1.zw,h.w);
        
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
        
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                        dot(p2,x2), dot(p3,x3) ) );
        }
        
        void main() {
          vPosition = position;
          
          vec3 normalDir = normalize(position);
          
          // Multi-frequency noise along the normal vector creates hyper-fluid organic waves
          vec3 noiseCoords = normalDir * uWaveFreq;
          float n1 = snoise(noiseCoords + vec3(0.0, 0.0, uTime * 0.6));
          float n2 = snoise(noiseCoords * 2.5 - vec3(uTime * 0.3, uTime * 0.2, 0.0)) * 0.45;
          float displacement = (n1 + n2) * uWaveAmp;
          
          vec3 displaced = position + normalDir * displacement;
          displaced *= uBreath;
          
          vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          // Size attenuation based on distance from camera
          gl_PointSize = uSize * (300.0 / -mvPosition.z);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        
        void main() {
          // Soft glowing micro-disks instead of pixelated squares
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          float alpha = smoothstep(0.5, 0.1, dist) * uOpacity;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [accentColor]);

  const outerShaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(accentColor) },
        uSize: { value: 0.010 },
        uOpacity: { value: 0.22 },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uSize;
        
        varying vec3 vPosition;
        
        void main() {
          vPosition = position;
          
          // Elegant slow background swell on the GPU so cloud is ambient & alive
          float driftX = sin(position.y * 0.4 + uTime * 0.15) * 0.08;
          float driftY = cos(position.x * 0.4 + uTime * 0.15) * 0.08;
          float driftZ = sin(position.z * 0.4 + uTime * 0.15) * 0.08;
          
          vec3 displaced = position + vec3(driftX, driftY, driftZ);
          
          vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = uSize * (300.0 / -mvPosition.z);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = smoothstep(0.5, 0.1, dist) * uOpacity;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [accentColor]);

  useFrame((state, delta) => {
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

    // Compute Auto Rotations
    const autoSpeed = isPlaying ? 0.35 : 0.08;
    const autoY = state.clock.getElapsedTime() * autoSpeed;
    const autoX = state.clock.getElapsedTime() * (autoSpeed * 0.5);
    
    // Core Sphere Rotation & Parallax
    if (pointsRef.current) {
      pointsRef.current.rotation.y = autoY + mouse.current.x * 0.7;
      pointsRef.current.rotation.x = autoX + mouse.current.y * 0.5;
    }

    // Outer Cloud Rotation & Deeper Parallax
    if (outerPointsRef.current) {
      outerPointsRef.current.rotation.y = (autoY * 0.3) + mouse.current.x * 1.6;
      outerPointsRef.current.rotation.x = (autoX * 0.3) + mouse.current.y * 1.2;
    }

    // Update Main Shader Uniforms dynamically with inertial states
    mainShaderMaterial.uniforms.uTime.value = warpTimeRef.current;
    mainShaderMaterial.uniforms.uWaveAmp.value = currentWaveAmpRef.current;
    mainShaderMaterial.uniforms.uWaveFreq.value = currentWaveFreqRef.current;
    mainShaderMaterial.uniforms.uBreath.value = 1.0 + Math.sin(breathPhaseRef.current) * currentBreathAmpRef.current;
    mainShaderMaterial.uniforms.uSize.value = isPlaying ? 0.024 : 0.016;
    mainShaderMaterial.uniforms.uOpacity.value = isPlaying ? 0.75 : 0.5;
    mainShaderMaterial.uniforms.uColor.value.set(accentColor);

    // Update Outer Shader Uniforms for ambient swell
    outerShaderMaterial.uniforms.uTime.value = state.clock.getElapsedTime();
    outerShaderMaterial.uniforms.uOpacity.value = isPlaying ? 0.35 : 0.22;
    outerShaderMaterial.uniforms.uColor.value.set(accentColor);
  });

  return (
    <group>
      {/* Main Core Sphere - 100% GPU Assisted */}
      <points ref={pointsRef} renderOrder={2} material={mainShaderMaterial}>
        <sphereGeometry args={GEOMETRY_ARGS} />
      </points>

      {/* Loose Outer Acoustic Cloud - Ambient & Glowing */}
      <points ref={outerPointsRef} renderOrder={1} material={outerShaderMaterial}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[outerParticles, 3]}
          />
        </bufferGeometry>
      </points>
    </group>
  );
}
