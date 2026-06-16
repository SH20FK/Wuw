'use client';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { motion } from 'framer-motion';
import { Magnetic } from '@/components/ui/Magnetic';
import Link from 'next/link';

export default function WorkPage() {
  return (
    <main className="w-full relative bg-bg min-h-screen flex items-center justify-center overflow-hidden py-32 px-6">
      {/* Dynamic ambient backdrop light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[var(--color-accent)]/3 rounded-full blur-[120px] pointer-events-none" />

      {/* Top section division header */}
      <div className="absolute top-24 left-8 md:top-32 md:left-16 z-20">
        <SectionLabel>/ 03 WORK</SectionLabel>
      </div>

      <div className="max-w-md w-full z-10 relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.97, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 20 }}
          className="w-full border border-[rgba(184,173,158,0.1)] bg-surface/30 backdrop-blur-md rounded-2xl p-8 md:p-12 relative overflow-hidden flex flex-col items-center justify-center text-center shadow-2xl"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--color-accent)]/30 to-transparent" />
          
          <div className="mb-6 select-none flex items-center justify-center w-14 h-14 rounded-full bg-surface border border-[rgba(184,173,158,0.08)]">
            <span className="font-mono text-xl text-accent animate-pulse">🛠️</span>
          </div>

          <span className="font-mono text-[9px] text-accent tracking-[0.25em] uppercase mb-3 font-semibold">Status: Active update</span>
          <h2 className="font-display text-2xl md:text-3xl font-medium text-text mt-1 tracking-tight">Обсудить проект?</h2>
          
          <p className="font-body text-xs md:text-sm text-text-muted mt-4 leading-relaxed max-w-[280px]">
            Ищешь креативного разработчика? Все проекты находятся на обновлении, давай создадим что-то крутое вместе.
          </p>

          <div className="w-8 h-px bg-[rgba(184,173,158,0.15)] my-6" />

          <Magnetic>
            <Link 
              href="/contact" 
              className="inline-block border border-[rgba(184,173,158,0.15)] hover:border-accent bg-surface/40 hover:bg-surface/80 font-mono text-xs text-text hover:text-accent tracking-widest uppercase py-3 px-8 rounded-full transition-all duration-300 shadow-lg focus:outline-none"
            >
              Связаться ↗
            </Link>
          </Magnetic>

          <div className="flex items-center gap-2 font-mono text-[9px] text-text-muted uppercase tracking-wider mt-8 justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-accent/50 animate-ping" />
            <span>sh20fk studio • 2026</span>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
