'use client';
import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { spring, stagger } from '@/lib/animations';
import { Button } from '@/components/ui/Button';
import { Magnetic } from '@/components/ui/Magnetic';
import dynamic from 'next/dynamic';
import useScrollStore from '@/store/useScrollStore';

const HeroCanvas = dynamic(() => import('@/components/three/HeroCanvas'), { ssr: false });

export function Hero() {
  const h1Ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let active = true;
    let currentSkew = 0;
    let currentSpacing = 0;
    let currentWeight = 300;

    const updateKinetic = () => {
      if (!active) return;
      const targetVelocity = useScrollStore.getState().velocity;

      currentSkew += (targetVelocity * -0.05 - currentSkew) * 0.1;
      currentSpacing += (Math.abs(targetVelocity) * 0.08 - currentSpacing) * 0.1;
      currentWeight += ((300 + Math.abs(targetVelocity) * 1.5) - currentWeight) * 0.1;

      if (h1Ref.current) {
        h1Ref.current.style.transform = `skewX(${Math.max(-15, Math.min(15, currentSkew))}deg)`;
        h1Ref.current.style.letterSpacing = `${Math.max(0, Math.min(35, currentSpacing))}px`;
        h1Ref.current.style.fontWeight = `${Math.max(100, Math.min(700, Math.round(currentWeight)))}`;
      }

      requestAnimationFrame(updateKinetic);
    };

    updateKinetic();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center">
      <HeroCanvas />
      <motion.div variants={stagger.container} initial="hidden" animate="visible" className="relative z-10 flex flex-col items-center text-center mt-[-8vh] px-6 select-none">
        <motion.h1 
          ref={h1Ref}
          variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { ...spring.slow, delay: 0.1 } } }} 
          className="font-display text-[clamp(4.5rem,15vw,12rem)] leading-none tracking-tighter text-text cursor-default select-none inline-block origin-center transition-[color] duration-500 ease-out"
        >
          SH20FK
        </motion.h1>
        
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { ...spring.default, delay: 0.3 } } }} className="font-mono text-xs md:text-sm tracking-[0.25em] text-text-muted mt-6 uppercase font-semibold">
          Frontend Developer
        </motion.div>
        
        <motion.div variants={{ hidden: { scaleX: 0, opacity: 0 }, visible: { scaleX: 1, opacity: 0.4, transition: { ...spring.snappy, delay: 0.45 } } }} className="w-[60px] h-[1px] bg-accent mt-6 origin-center" />
        
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { ...spring.default, delay: 0.55 } } }} className="font-mono text-[10px] md:text-xs text-text-muted mt-4 tracking-wider uppercase">
          Челябинск · Россия
        </motion.div>
        
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { ...spring.default, delay: 0.7 } } }} className="flex items-center gap-4 mt-12 flex-wrap justify-center">
          <Magnetic>
            <Button variant="filled" href="/work">Работы</Button>
          </Magnetic>
          <Magnetic>
            <Button variant="outlined" href="/music">Музыка</Button>
          </Magnetic>
        </motion.div>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 1 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
        <motion.div animate={{ y: [0, 40], opacity: [1, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="w-[1px] h-[40px] bg-gradient-to-b from-accent to-transparent" />
      </motion.div>
    </section>
  );
}

