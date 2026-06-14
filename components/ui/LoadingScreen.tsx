'use client';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';

export function LoadingScreen({ isLoading }: { isLoading: boolean }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress(p => (p >= 98 ? p : p + Math.random() * 15));
      }, 100);
      return () => clearInterval(interval);
    } else {
      let timer: NodeJS.Timeout;
      timer = setTimeout(() => setProgress(100), 0);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div key="loader" exit={{ y: '-100%', transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }} className="fixed inset-0 z-[100] bg-bg flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center">
            <h2 className="font-display text-4xl md:text-6xl text-text tracking-tight animate-pulse">SH20FK</h2>
            <div className="mt-8 w-[200px] h-[2px] bg-surface-2 rounded-full overflow-hidden">
              <motion.div className="h-full bg-accent" animate={{ width: `${Math.min(100, progress)}%` }} transition={{ ease: 'linear', duration: 0.1 }} />
            </div>
            <div className="mt-2 font-mono text-xs text-text-muted">
              {Math.min(100, Math.round(progress)).toString().padStart(3, '0')}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
