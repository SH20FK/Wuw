'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef, useMemo, ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uProgress;
varying vec2 vUv;

// Procedural noise function
float hash(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
             mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  vec2 shift = vec2(100.0);
  for (int i = 0; i < 4; ++i) {
    v += a * noise(p);
    p = p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  float dist = distance(uv, vec2(0.5));
  float noiseVal = fbm(uv * 7.0);

  // uProgress moves from 0 (fully transparent) to 1.5 (fully filled ink background)
  float threshold = uProgress * 1.5 - 0.25;
  
  // Calculate ink dilution alpha
  float alpha = smoothstep(threshold, threshold + 0.15, noiseVal + (1.0 - dist * 0.7));
  
  // Deep rich background color matching --color-bg (#0E0C0F)
  vec3 bgCol = vec3(0.054, 0.047, 0.058); 
  
  gl_FragColor = vec4(bgCol, 1.0 - alpha);
}
`;

interface TransitionPlaneProps {
  progressRef: React.MutableRefObject<number>;
}

function TransitionPlane({ progressRef }: TransitionPlaneProps) {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uProgress: { value: 0.0 }
  }), []);

  useFrame(() => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uProgress.value = progressRef.current;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={shaderRef}
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

function isWebGLAvailable(): boolean {
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

export function InkBleedTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState<ReactNode>(children);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const progressRef = useRef(0.0);
  const previousPathnameRef = useRef(pathname);

  useEffect(() => {
    // Check if prefers-reduced-motion is true OR if it is a mobile device (touch or small viewport) OR WebGL is missing
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    const noWebGL = !isWebGLAvailable();
    if (mediaQuery.matches || isMobile || noWebGL) {
      setUseFallback(true);
    }
  }, []);

  useEffect(() => {
    // Skip on first initial render
    if (pathname === previousPathnameRef.current) {
      setDisplayChildren(children);
      return;
    }

    previousPathnameRef.current = pathname;
    setIsTransitioning(true);

    const timeline = gsap.timeline({
      onComplete: () => {
        setIsTransitioning(false);
      }
    });

    // 1. Ink fills the screen (opacity from transparent to solid core bg)
    timeline.to(progressRef, {
      current: 1.1,
      duration: 0.4,
      ease: 'power2.inOut',
      onComplete: () => {
        // Swap display layout exactly when screen is covered
        setDisplayChildren(children);
      }
    });

    // 2. Slow reveal dissolve
    timeline.to(progressRef, {
      current: 0.0,
      duration: 0.4,
      ease: 'power2.out',
      delay: 0.08
    });

    return () => {
      timeline.kill();
    };
  }, [pathname, children]);

  return (
    <>
      <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-40 select-none pointer-events-none' : 'opacity-100'}`}>
        {displayChildren}
      </div>
      
      {/* Absolute fullscreen transition layer */}
      {useFallback ? (
        <div 
          className="fixed inset-0 bg-[#0E0C0F] transition-all duration-300 pointer-events-none"
          style={{ 
            zIndex: 85, 
            opacity: isTransitioning ? 1 : 0,
            visibility: isTransitioning ? 'visible' : 'hidden',
          }}
        />
      ) : (
        <div 
          className="fixed inset-0 w-full h-full"
          style={{ 
            zIndex: 80, 
            pointerEvents: isTransitioning ? 'auto' : 'none',
            visibility: isTransitioning ? 'visible' : 'hidden'
          }}
        >
          <Canvas
            orthographic
            camera={{ left: -1, right: 1, top: 1, bottom: -1, near: 0, far: 1 }}
            gl={{ antialias: false, alpha: true }}
            dpr={[1, 1.5]}
            style={{ width: '100%', height: '100%' }}
          >
            <TransitionPlane progressRef={progressRef} />
          </Canvas>
        </div>
      )}
    </>
  );
}
