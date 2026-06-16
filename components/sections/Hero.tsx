'use client';
import { motion } from 'framer-motion';
import { spring, stagger } from '@/lib/animations';
import { Button } from '@/components/ui/Button';
import { Magnetic } from '@/components/ui/Magnetic';
import dynamic from 'next/dynamic';

const HeroCanvas = dynamic(() => import('@/components/three/HeroCanvas'), { ssr: false });

export function Hero({ isLoading }: { isLoading: boolean }) {
  const isRevealed = !isLoading;

  return (
    <section className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center">
      <HeroCanvas />
      {isRevealed && (
        <motion.div variants={stagger.container} initial="hidden" animate="visible" className="relative z-10 flex flex-col items-center text-center mt-[-8vh] px-6 select-none">
          {/* Huge typography contrast: massive name, interactive weight transition on hover */}
          <motion.h1 
            variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { ...spring.slow, delay: 0.1 } } }} 
            className="font-display text-[clamp(4.5rem,15vw,12rem)] font-light leading-none tracking-tighter text-text hover:font-medium active:font-medium transition-[font-weight,color] duration-500 ease-out cursor-default"
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
      )}
      {isRevealed && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 1 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
          <motion.div animate={{ y: [0, 40], opacity: [1, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="w-[1px] h-[40px] bg-gradient-to-b from-accent to-transparent" />
        </motion.div>
      )}
    </section>
  );
}
