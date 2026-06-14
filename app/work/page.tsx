'use client';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { motion } from 'framer-motion';

export default function WorkPage() {
  return (
    <main className="w-full relative bg-bg min-h-screen flex items-center justify-center overflow-hidden">
      {/* Decorative ambient background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-accent/3 rounded-full blur-[100px] pointer-events-none" />

      {/* Top absolute division header */}
      <div className="absolute top-24 left-8 md:top-32 md:left-16 z-20">
        <SectionLabel>/ 03 WORK</SectionLabel>
      </div>

      {/* Polish Centered Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 20 }}
        className="max-w-md w-full mx-6 p-8 md:p-12 border border-[rgba(184,173,158,0.1)] bg-surface/30 backdrop-blur-md rounded-2xl relative overflow-hidden flex flex-col items-center justify-center text-center shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        
        <div className="mb-6 select-none flex items-center justify-center w-14 h-14 rounded-full bg-surface border border-[rgba(184,173,158,0.08)]">
          <span className="font-mono text-xl text-accent animate-pulse">🛠️</span>
        </div>

        <span className="font-mono text-[10px] text-accent tracking-[0.25em] uppercase mb-3 font-semibold">Status: Active Update</span>
        <h2 className="font-display text-2xl md:text-3xl font-medium text-text mt-1 tracking-tight">В разработке</h2>
        
        <p className="font-body text-xs md:text-sm text-text-muted mt-4 leading-relaxed max-w-[280px]">
          Раздел обновляется. Скоро здесь будут представлены новые проекты, лаунчеры и кастомные разработки.
        </p>

        <div className="w-8 h-px bg-[rgba(184,173,158,0.15)] my-6" />

        <div className="flex items-center gap-2 font-mono text-[9px] text-text-muted uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-accent/50 animate-ping" />
          <span>sh20fk studio • 2026</span>
        </div>
      </motion.div>
    </main>
  );
}
