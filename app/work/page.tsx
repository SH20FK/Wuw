'use client';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { motion } from 'framer-motion';
import { Magnetic } from '@/components/ui/Magnetic';
import { ProjectCard, Project } from '@/components/ui/ProjectCard';
import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';
import { useSfx } from '@/lib/useSfx';
import { ArrowRight, MoveRight } from 'lucide-react';

const PROJECTS: Project[] = [
  {
    id: '1',
    year: '2024-2026',
    type: 'Mobile / Flutter',
    title: 'NiosMess',
    description: '',
    image: 'https://i.imgur.com/4oQdpNH.png',
    url: 'https://github.com/SH20FK',
    tags: ['Flutter', 'Dart', 'WebSockets']
  },
  {
    id: '2',
    year: '24-25',
    type: 'Minecraft Mod / Fabric',
    title: 'Project3',
    description: '',
    image: 'https://i.imgur.com/loGyHFn.png',
    url: 'https://github.com/SH20FK',
    tags: ['Java', 'Fabric API', 'MinecraftGL']
  }
];

export default function WorkPage() {
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { playHover, playClick } = useSfx();
  const [scrollProgress, setScrollProgress] = useState(0);

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

  // Vertical wheel to Horizontal Scroll Redirector on Desktop
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      const isScrollable = el.scrollWidth > el.clientWidth;
      const isAtStart = el.scrollLeft <= 0;
      const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;

      if (isScrollable) {
        // Prevent default only if we are taking action in bounds
        if ((e.deltaY > 0 && !isAtEnd) || (e.deltaY < 0 && !isAtStart)) {
          e.preventDefault();
          el.scrollLeft += e.deltaY * 0.85; // smooth step factor
        }
      }
    };

    const handleScroll = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;
      setScrollProgress(el.scrollLeft / maxScroll);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('scroll', handleScroll);

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <main className="w-full relative bg-bg min-h-screen flex flex-col justify-between overflow-hidden py-16 md:py-24 select-none">
      {/* Soft background ambient gradient glow */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[var(--color-accent)]/[0.02] rounded-full blur-[130px] pointer-events-none" />

      {/* Top section labels */}
      <div className="px-6 sm:px-16 flex items-center justify-between">
        <SectionLabel>/ 03 WORK</SectionLabel>
        <span className="font-mono text-[9px] text-text-muted uppercase tracking-widest hidden sm:inline-block">
          Колесико мыши листает вбок
        </span>
      </div>

      {/* Horizontal horizontal scrolling projects track */}
      <div className="my-auto py-6 md:py-10 relative">
        <div 
          ref={scrollContainerRef}
          className="flex flex-nowrap overflow-x-auto gap-4 md:gap-8 px-6 sm:px-16 pb-6 md:pb-8 scrollbar-none snap-x snap-mandatory cursor-grab active:cursor-grabbing"
          style={{ scrollBehavior: 'auto' }}
        >
          {PROJECTS.map((project, idx) => (
            <motion.div 
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.12 }}
              className="snap-start shrink-0"
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}

          {/* Connected Slide leading to Contact Action represent ending of reel */}
          <div ref={containerRef} className="snap-start shrink-0 flex items-center justify-center pl-4 pr-12 md:pl-8 md:pr-24">
            <Magnetic>
              <Link 
                href="/contact"
                onMouseEnter={playHover}
                onClick={playClick}
                className="inline-block group focus:outline-none select-none relative"
              >
                <div className="flex items-center gap-2.5 font-mono text-[10px] sm:text-xs text-text-muted mb-4 uppercase tracking-widest select-none">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span>ОБСУДИМ И ТВОЙ ПРОЕКТ // 2026</span>
                </div>
                <div 
                  ref={textRef}
                  className="font-display text-[clamp(2rem,6vw,6.5rem)] text-text group-hover:text-accent font-light leading-[0.95] tracking-tighter transition-colors duration-500 origin-left ease-out"
                >
                  ОБСУДИТЬ<br />ПРОЕКТ →
                </div>
                <div className="mt-4 flex items-center gap-2 font-mono text-[10px] text-accent font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Перейти к контактам</span>
                  <MoveRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            </Magnetic>
          </div>
        </div>

        {/* Minimal Scrollbar Progress Track at bottom */}
        <div className="px-6 sm:px-16 max-w-xs sm:max-w-sm mt-4">
          <div className="flex items-center justify-between font-mono text-[9px] text-text-muted uppercase tracking-wider mb-2">
            <span>Прокрутка</span>
            <span>{Math.round(scrollProgress * 100)}%</span>
          </div>
          <div className="w-full h-[1px] bg-[rgba(184,173,158,0.06)] relative">
            <motion.div 
              className="absolute left-0 top-0 h-full bg-accent origin-left"
              style={{ scaleX: scrollProgress, width: '100%' }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            />
          </div>
        </div>
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

