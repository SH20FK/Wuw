import { motion } from 'motion/react';
import { spring } from '@/lib/animations';

export function TechChip({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, backgroundColor: 'rgba(184,173,158,0.1)', color: 'var(--color-accent)' }}
      transition={spring.snappy}
      className="font-mono text-xs text-text-muted bg-[rgba(184,173,158,0.06)] border border-[rgba(184,173,158,0.1)] rounded-pill px-3 py-1 cursor-default tracking-wide"
    >
      {children}
    </motion.div>
  );
}
