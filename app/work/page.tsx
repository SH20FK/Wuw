'use client';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { motion } from 'framer-motion';
import { Magnetic } from '@/components/ui/Magnetic';
import Link from 'next/link';
import { useRef, useEffect } from 'react';
import { useSfx } from '@/lib/useSfx';
import { MoveRight } from 'lucide-react';
import { TechChip } from '@/components/ui/TechChip';

const PROJECTS = [
  {
    id: '1',
    year: '2024-2026',
    type: 'Mobile / Flutter',
    title: 'NiosMess',
    url: 'https://github.com/SH20FK',
    tags: ['Flutter', 'Dart', 'WebSockets']
  },
  {
    id: '2',
    year: '2026',
    type: 'Minecraft Mod / Fabric',
    title: 'Project3',
    url: 'https://github.com/SH20FK',
    tags: ['Java', 'Fabric API', 'MinecraftGL']
  }
];

export default function WorkPage() {
  const textRef1 = useRef<HTMLDivElement>(null);
  const textRef2 = useRef<HTMLDivElement>(null);
  const textRef3 = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { playHover, playClick } = useSfx();

  // Mouse move kinetic text skew effect for the large list titles
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

      const skewStyle = `skewX(${Math.max(-18, Math.min(18, currentSkew))}deg)`;
      const spacingStyle = `${Math.max(0, Math.min(28, currentSpacing))}px`;
      const weightStyle = `${Math.max(100, Math.min(700, Math.round(currentWeight)))}`;

      if (textRef1.current) {
        textRef1.current.style.transform = skewStyle;
        textRef1.current.style.letterSpacing = spacingStyle;
        textRef1.current.style.fontWeight = weightStyle;
      }
      if (textRef2.current) {
        textRef2.current.style.transform = skewStyle;
        textRef2.current.style.letterSpacing = spacingStyle;
        textRef2.current.style.fontWeight = weightStyle;
      }
      if (textRef3.current) {
        textRef3.current.style.transform = skewStyle;
        textRef3.current.style.letterSpacing = spacingStyle;
        textRef3.current.style.fontWeight = weightStyle;
      }

      requestAnimationFrame(updateKinetic);
    };

    window.addEventListener('mousemove', handleMouseMove);
    updateKinetic();

    return () => {
      active = false;
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <main className="w-full relative bg-bg min-h-screen flex flex-col justify-between overflow-hidden py-14 md:py-20 select-none">
      {/* Soft background ambient gradient glow */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[var(--color-accent)]/[0.02] rounded-full blur-[130px] pointer-events-none" />

      {/* Top section labels */}
      <div className="px-6 sm:px-16 flex items-center justify-between z-10">
        <SectionLabel>/ 03 WORK</SectionLabel>
      </div>

      {/* Minimalist Kinetic List Parent */}
      <div ref={containerRef} className="w-full max-w-5xl mx-auto px-6 md:px-0 my-auto py-8 relative z-10 flex flex-col border-t border-[rgba(184,173,158,0.08)]">
        
        {/* ROW 1: NiosMess */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 90, damping: 20, delay: 0.05 }}
        >
          <div
            onMouseEnter={playHover}
            onClick={playClick}
            className="group flex items-start gap-4 md:gap-10 py-10 md:py-14 border-b border-[rgba(184,173,158,0.08)] transition-colors duration-300 hover:bg-[#181620]/20 w-full cursor-default"
          >
            <span className="font-mono text-xs md:text-sm text-text-muted select-none pt-2 md:pt-4">01</span>
            <div className="flex-1 text-left">
              <div 
                ref={textRef1}
                className="font-display text-[clamp(2rem,6vw,6.5rem)] text-text group-hover:text-accent font-light leading-[1.05] tracking-tighter transition-colors duration-500 ease-out uppercase origin-left"
              >
                {PROJECTS[0].title}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-4">
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
                  {PROJECTS[0].year} &nbsp;·&nbsp; {PROJECTS[0].type}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PROJECTS[0].tags.map(tag => (
                    <TechChip key={tag}>{tag}</TechChip>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ROW 2: Project3 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 90, damping: 20, delay: 0.15 }}
        >
          <div
            onMouseEnter={playHover}
            onClick={playClick}
            className="group flex items-start gap-4 md:gap-10 py-10 md:py-14 border-b border-[rgba(184,173,158,0.08)] transition-colors duration-300 hover:bg-[#181620]/20 w-full cursor-default"
          >
            <span className="font-mono text-xs md:text-sm text-text-muted select-none pt-2 md:pt-4">02</span>
            <div className="flex-1 text-left">
              <div 
                ref={textRef2}
                className="font-display text-[clamp(2rem,6vw,6.5rem)] text-text group-hover:text-accent font-light leading-[1.05] tracking-tighter transition-colors duration-500 ease-out uppercase origin-left"
              >
                {PROJECTS[1].title}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-4">
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
                  {PROJECTS[1].year} &nbsp;·&nbsp; {PROJECTS[1].type}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PROJECTS[1].tags.map(tag => (
                    <TechChip key={tag}>{tag}</TechChip>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ROW 3: Cooperation CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 90, damping: 20, delay: 0.25 }}
          className="group flex items-start gap-4 md:gap-10 py-10 md:py-14 border-b border-[rgba(184,173,158,0.08)] transition-colors duration-300 hover:bg-[#181620]/20 w-full"
        >
          <span className="font-mono text-xs md:text-sm text-text-muted select-none pt-2 md:pt-4">03</span>
          <div className="flex-1 text-left">
            <Magnetic>
              <Link 
                href="/contact"
                onMouseEnter={playHover}
                onClick={playClick}
                className="inline-block focus:outline-none select-none"
              >
                <div className="flex items-center gap-2.5 font-mono text-[10px] sm:text-xs text-text-muted mb-4 uppercase tracking-widest select-none">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span>ОБСУДИМ И ТВОЙ ПРОЕКТ // 2026</span>
                </div>

                <div 
                  ref={textRef3}
                  className="font-display text-[clamp(2.5rem,7vw,6.5rem)] text-text group-hover:text-accent font-light leading-[1.05] tracking-tighter transition-colors duration-500 uppercase origin-left ease-out"
                >
                  ОБСУДИТЬ<br />ПРОЕКТ →
                </div>

                <div className="mt-4 flex items-center gap-2 font-mono text-[10px] text-accent font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Перейти к контактам</span>
                  <MoveRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </Magnetic>
          </div>
        </motion.div>

      </div>

      {/* Footer bar */}
      <div className="px-6 sm:px-16 flex items-center justify-between text-text-muted mt-auto pt-4 md:pt-6 z-10">
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
