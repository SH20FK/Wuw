'use client';
import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { spring, stagger } from '@/lib/animations';
import { Magnetic } from '@/components/ui/Magnetic';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import useScrollStore from '@/store/useScrollStore';

const HeroCanvas = dynamic(() => import('@/components/three/HeroCanvas'), { ssr: false });

/**
 * Section entry link: label + arrow capsule.
 * On hover the capsule fills with the accent, the arrow turns 45° and the word takes the accent.
 */
function SectionLink({ href, label }: { href: string; label: string }) {
  return (
    <Magnetic>
      <Link href={href} className="group flex items-center gap-3.5 py-1">
        <span className="font-display text-[1.2rem] sm:text-[1.4rem] font-black uppercase leading-none tracking-tight text-text transition-colors duration-300 group-hover:text-accent">
          {label}
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(184,173,158,0.25)] text-text-muted transition-all duration-500 group-hover:border-accent group-hover:bg-accent group-hover:text-bg">
          <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" strokeWidth={1.5} />
        </span>
      </Link>
    </Magnetic>
  );
}

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

export function Hero() {
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    setHasWebGL(isWebGLAvailable());
  }, []);

  useEffect(() => {
    const el = h1Ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Transform-only kinetic tilt: writing font-weight / letter-spacing every frame
    // forces a text re-shape and layout on every tick, which is what made scrolling janky.
    let raf = 0;
    let skew = 0;

    const tick = () => {
      const velocity = useScrollStore.getState().velocity;
      const target = Math.max(-9, Math.min(9, velocity * -7));
      skew += (target - skew) * 0.14;
      el.style.transform = `skewX(${skew.toFixed(2)}deg)`;

      if (Math.abs(velocity) < 0.001 && Math.abs(skew) < 0.02) {
        el.style.transform = '';
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const unsubscribe = useScrollStore.subscribe(() => {
      if (!raf) raf = requestAnimationFrame(tick);
    });

    return () => {
      unsubscribe();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="relative w-full min-h-screen overflow-hidden flex flex-col">
      {hasWebGL && <HeroCanvas />}

      {/* Main stage — identity on the left, 3D sphere glides over the right column */}
      <div className="relative z-10 flex-1 w-full max-w-[1200px] mx-auto px-6 flex flex-col justify-center pt-28 pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center w-full">
          <motion.div
            variants={{ hidden: {}, visible: { transition: stagger.container } }}
            initial="hidden"
            animate="visible"
            className="lg:col-span-8 xl:col-span-7 flex flex-col items-start text-left select-none"
          >
            <motion.h1
              ref={h1Ref}
              variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { ...spring.slow, delay: 0.1 } } }}
              className="font-brand font-black text-[clamp(3.25rem,11vw,8rem)] leading-[0.92] tracking-tighter text-text cursor-default select-none origin-left"
            >
              SH20FK
            </motion.h1>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { ...spring.default, delay: 0.3 } } }}
              className="font-mono text-xs md:text-sm tracking-[0.25em] text-text-muted mt-7 uppercase font-semibold"
            >
              Frontend Developer
            </motion.div>

            <motion.div
              variants={{ hidden: { scaleX: 0, opacity: 0 }, visible: { scaleX: 1, opacity: 0.4, transition: { ...spring.snappy, delay: 0.45 } } }}
              className="w-[60px] h-[1px] bg-accent mt-6 origin-left"
            />

            <motion.div
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { ...spring.default, delay: 0.55 } } }}
              className="font-mono text-[10px] md:text-xs text-text-muted mt-4 tracking-wider uppercase"
            >
              Челябинск · Россия
            </motion.div>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { ...spring.default, delay: 0.7 } } }}
              className="flex flex-wrap items-center gap-x-10 gap-y-5 mt-12"
            >
              <SectionLink href="/work" label="Работы" />
              <SectionLink href="/music" label="Музыка" />
            </motion.div>
          </motion.div>

          {/* Reserved stage for the WebGL sphere */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-5" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
