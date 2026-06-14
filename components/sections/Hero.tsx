'use client';
import { motion } from 'framer-motion';
import { spring, stagger } from '@/lib/animations';
import { Button } from '@/components/ui/Button';
import { useEffect, useState } from 'react';

export function Hero({ onLoadingComplete }: { onLoadingComplete: () => void }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => { setLoaded(true); onLoadingComplete(); }, 1200);
    return () => clearTimeout(t);
  }, [onLoadingComplete]);

  return (
    <section className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center">
      {loaded && (
        <motion.div variants={stagger.container} initial="hidden" animate="visible" className="relative z-10 flex flex-col items-center text-center mt-[-10vh]">
          <motion.h1 variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { ...spring.slow, delay: 0.9 } } }} className="font-display text-[clamp(4rem,10vw,8rem)] leading-none tracking-tight text-text">
            SH20FK
          </motion.h1>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { ...spring.default, delay: 1.1 } } }} className="font-mono text-sm tracking-wider text-text-muted mt-4">
            Frontend Developer
          </motion.div>
          <motion.div variants={{ hidden: { scaleX: 0, opacity: 0 }, visible: { scaleX: 1, opacity: 0.4, transition: { ...spring.snappy, delay: 1.2 } } }} className="w-[60px] h-px bg-accent mt-6 origin-center" />
          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { ...spring.default, delay: 1.2 } } }} className="font-mono text-xs text-text-muted mt-4">
            Челябинск · Россия
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { ...spring.default, delay: 1.4 } } }} className="flex items-center gap-4 mt-12">
            <Button variant="filled" href="/work">Работы</Button>
            <Button variant="outlined" href="/music">Музыка</Button>
          </motion.div>
        </motion.div>
      )}
      {loaded && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <motion.div animate={{ y: [0, 40], opacity: [1, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="w-[1px] h-[40px] bg-gradient-to-b from-accent to-transparent" />
        </motion.div>
      )}
    </section>
  );
}
