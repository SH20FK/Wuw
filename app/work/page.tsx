'use client';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { motion } from 'framer-motion';
import { Magnetic } from '@/components/ui/Magnetic';
import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';
import { useSfx } from '@/lib/useSfx';
import { MoveRight } from 'lucide-react';
import { WarpImage } from '@/components/three/WarpImage';
import { TechChip } from '@/components/ui/TechChip';

const PROJECTS = [
  {
    id: '1',
    year: '2024-2026',
    type: 'Mobile / Flutter',
    title: 'NiosMess',
    image: 'https://i.ibb.co/ZzPD74LR/IMG-20260617-125422.png',
    url: 'https://github.com/SH20FK',
    tags: ['Flutter', 'Dart', 'WebSockets']
  },
  {
    id: '2',
    year: '24-25',
    type: 'Minecraft Mod / Fabric',
    title: 'Project3',
    image: 'https://i.ibb.co/bgDsc3J9/IMG-20260617-130156.png',
    url: 'https://github.com/SH20FK',
    tags: ['Java', 'Fabric API', 'MinecraftGL']
  }
];

export default function WorkPage() {
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { playHover, playClick } = useSfx();
  const [isCollabHovered, setIsCollabHovered] = useState(false);

  // Mouse move kinetic text skew effect for the large banner CTA
  useEffect(() => {
    let active = true;
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;
    const velocityRef = { current: 0 };
    
    let currentSkew = 0;
    let currentSpacing = 0;
    let currentWeight = 300;

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      const elapsed = Math.max(1, now - lastTime);
      
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const dist = Math.hypot(dx, dy);
      
      const rawVelocity = dist / elapsed;
      const direction = dx >= 0 ? 1 : -1;
      
      velocityRef.current = Math.min(22, rawVelocity * 2.5) * direction;

      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = now;
    };

    const updateKinetic = () => {
      if (!active) return;

      velocityRef.current *= 0.92;

      currentSkew += (velocityRef.current * -1.4 - currentSkew) * 0.12;
      currentSpacing += (Math.abs(velocityRef.current) * 0.9 - currentSpacing) * 0.12;
      currentWeight += ((300 + Math.abs(velocityRef.current) * 14) - currentWeight) * 0.12;

      if (textRef.current) {
        textRef.current.style.transform = `skewX(${Math.max(-18, Math.min(18, currentSkew))}deg)`;
        textRef.current.style.letterSpacing = `${Math.max(0, Math.min(28, currentSpacing))}px`;
        textRef.current.style.fontWeight = `${Math.max(100, Math.min(700, Math.round(currentWeight)))}`;
      }

      requestAnimationFrame(updateKinetic);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    updateKinetic();

    return () => {
      active = false;
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  return (
    <main className="w-full relative bg-bg min-h-screen flex flex-col justify-between overflow-hidden py-14 md:py-20 select-none">
      {/* Soft background ambient gradient glow */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[var(--color-accent)]/[0.02] rounded-full blur-[130px] pointer-events-none" />

      {/* Top section labels */}
      <div className="px-6 sm:px-16 flex items-center justify-between">
        <SectionLabel>/ 03 WORK</SectionLabel>
        <span className="font-mono text-[9px] text-text-muted uppercase tracking-widest hidden sm:inline-block">
          Material 3 Expressive Showcase
        </span>
      </div>

      {/* Material 3 Expressive Parent Container */}
      <div 
        className="w-full max-w-5xl mx-auto px-4 md:px-0 my-auto py-4 relative z-10 transition-all duration-[1000ms]"
        style={{
          '--accent-tone-light': 'color-mix(in srgb, var(--color-accent) 60%, #ffffff 40%)',
          '--accent-tone-dark': 'color-mix(in srgb, var(--color-accent) 70%, #000000 30%)',
        } as React.CSSProperties}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          className="grid grid-cols-1 md:grid-cols-2 bg-[#121016]/80 border border-[rgba(184,173,158,0.12)] shadow-[0_0_60px_-15px_rgba(var(--color-accent),0.07)] overflow-hidden"
          style={{
            borderRadius: 'clamp(32px, 5vw, 56px)',
          }}
        >
          {/* ZONE 1: NiosMess (Grid: Top Left) */}
          <Link 
            href={PROJECTS[0].url}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={playHover}
            onClick={playClick}
            className="work-zone group relative h-[380px] md:h-[450px] overflow-hidden flex flex-col justify-end p-6 md:p-8 border-b md:border-b md:border-r border-[rgba(184,173,158,0.12)] cursor-pointer"
          >
            {/* Background Project Image */}
            <div className="absolute inset-0 z-0">
              <WarpImage src={PROJECTS[0].image} alt={PROJECTS[0].title} />
              {/* Subtle darkened vignette bottom for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg/95 via-transparent to-transparent opacity-80" />
            </div>

            {/* Dynamic GLSL Film Grain & Blur Fog layer */}
            <div className="absolute inset-0 z-10 fog-layer" />

            {/* Top Left Details */}
            <div className="absolute top-6 left-6 font-mono text-[9px] text-[#ffffff] font-bold uppercase tracking-widest z-25 flex items-center gap-1.5 bg-surface/90 px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.15)] backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-tone-light)] animate-pulse" />
              <span>{PROJECTS[0].type}</span>
            </div>

            {/* Top Right Year */}
            <div className="absolute top-6 right-6 font-mono text-[10px] text-text-muted z-20 font-medium">
              {PROJECTS[0].year}
            </div>

            {/* Bottom Info */}
            <div className="relative z-20 text-left pointer-events-none">
              <h3 className="font-display text-3xl font-medium tracking-tight text-text mb-3 group-hover:text-[var(--accent-tone-light)] transition-colors duration-500">
                {PROJECTS[0].title}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {PROJECTS[0].tags.map(tag => (
                  <TechChip key={tag}>{tag}</TechChip>
                ))}
              </div>
            </div>
          </Link>

          {/* ZONE 2: Project3 (Grid: Top Right) */}
          <Link 
            href={PROJECTS[1].url}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={playHover}
            onClick={playClick}
            className="work-zone group relative h-[380px] md:h-[450px] overflow-hidden flex flex-col justify-end p-6 md:p-8 border-b border-[rgba(184,173,158,0.12)] cursor-pointer"
          >
            {/* Background Project Image */}
            <div className="absolute inset-0 z-0">
              <WarpImage src={PROJECTS[1].image} alt={PROJECTS[1].title} />
              <div className="absolute inset-0 bg-gradient-to-t from-bg/95 via-transparent to-transparent opacity-80" />
            </div>

            {/* Dynamic GLSL Film Grain & Blur Fog layer */}
            <div className="absolute inset-0 z-10 fog-layer" />

            {/* TENSION DETAIL: Sharp corner solid technical tag in the top-right corner to contrast with soft organic elements */}
            <div className="absolute top-6 right-6 font-mono text-[9px] text-bg bg-[var(--accent-tone-dark)] font-bold uppercase tracking-widest px-3 py-1.5 border border-black z-25 rounded-none shadow-[2px_2px_0px_rgba(255,255,255,0.5)] select-none">
              SYSTEM: FABRIC CLIENT // {PROJECTS[1].year}
            </div>

            {/* Top Left Details */}
            <div className="absolute top-6 left-6 font-mono text-[9px] text-[#ffffff] font-bold uppercase tracking-widest z-25 flex items-center gap-1.5 bg-surface/90 px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.15)] backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-tone-dark)]" />
              <span>{PROJECTS[1].type}</span>
            </div>

            {/* Bottom Info */}
            <div className="relative z-20 text-left pointer-events-none">
              <h3 className="font-display text-3xl font-medium tracking-tight text-text mb-3 group-hover:text-[var(--accent-tone-dark)] transition-colors duration-500">
                {PROJECTS[1].title}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {PROJECTS[1].tags.map(tag => (
                  <TechChip key={tag}>{tag}</TechChip>
                ))}
              </div>
            </div>
          </Link>

          {/* ZONE 3: Bottom Collaboration (Grid: Full Width Bottom) */}
          <div 
            ref={containerRef}
            className="col-span-1 md:col-span-2 relative min-h-[340px] md:min-h-[380px] overflow-hidden flex flex-col justify-center items-center p-8 md:p-12 text-center"
          >
            {/* Dynamic GLSL Film Grain & Blur Fog layer */}
            <div className="absolute inset-0 z-10 fog-layer" />

            {/* Morphing Asymmetrical custom-glowing polygon behind text, constrained inside Zone 3 */}
            <div 
              className="absolute inset-0 pointer-events-none z-0 mix-blend-screen opacity-100 flex items-center justify-center"
            >
              <div 
                className="w-[85%] h-[85%] bg-gradient-to-tr from-[var(--color-accent)]/20 to-[var(--color-accent-sub)]/10 transition-all duration-[800ms]"
                style={{
                  filter: 'blur(32px)',
                  clipPath: isCollabHovered ? 'polygon(4% 0%, 100% 6%, 96% 100%, 0% 92%)' : 'polygon(0% 8%, 92% 0%, 100% 88%, 6% 100%)',
                }}
              />
            </div>

            {/* Kinetic / Magnetic container */}
            <div className="relative z-20 w-full max-w-2xl flex flex-col items-center">
              <Magnetic>
                <Link 
                  href="/contact"
                  onMouseEnter={() => {
                    playHover();
                    setIsCollabHovered(true);
                  }}
                  onMouseLeave={() => setIsCollabHovered(false)}
                  onClick={playClick}
                  className="inline-block group focus:outline-none select-none px-8 py-6"
                >
                  <div className="flex items-center justify-center gap-2.5 font-mono text-[10px] sm:text-xs text-text-muted mb-4 uppercase tracking-widest select-none">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span>ОБСУДИМ И ТВОЙ ПРОЕКТ // 2026</span>
                  </div>

                  <div 
                    ref={textRef}
                    className="font-display text-[clamp(2rem,5vw,5rem)] text-text group-hover:text-accent font-light leading-[1.05] tracking-tighter transition-colors duration-500 origin-center ease-out"
                  >
                    ОБСУДИТЬ<br />ПРОЕКТ →
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-2 font-mono text-[10px] text-accent font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Перейти к контактам</span>
                    <MoveRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </Magnetic>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer bar */}
      <div className="px-6 sm:px-16 flex items-center justify-between text-text-muted mt-auto pt-4 md:pt-6">
        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em]">
          <span>sh20fk • built with integrity</span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-widest hidden sm:inline-block">
          Челябинск · {new Date().getFullYear()}
        </span>
      </div>
    </main>
  );
}
