'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
  onComplete?: () => void;
}

export function LoadingScreen({ isLoading, onComplete }: { isLoading: boolean; onComplete?: () => void }) {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [hasSkipped, setHasSkipped] = useState(false);

  // Skip mechanism
  const triggerSkip = () => {
    setHasSkipped((prev) => {
      if (prev) return prev;
      setProgress(100);
      return true;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setHasSkipped((prev) => {
          if (prev) return prev;
          setProgress(100);
          return true;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Trigger completion state once progress reaches 100%
  useEffect(() => {
    if (progress >= 100) {
      onComplete?.();
    }
  }, [progress, onComplete]);

  useEffect(() => {
    if (!isLoading) {
      setProgress(100);
      return;
    }

    // Step-by-step progress count-up over ~1.8 seconds max
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const step = Math.floor(Math.random() * 8) + 6;
        const next = prev + step;
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, 110);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Push systemic log events based on loading percentage progress
  useEffect(() => {
    const lines = [];
    if (progress >= 10) lines.push('> INIT: WebGL Core Particle scene initialized...');
    if (progress >= 35) lines.push('> TECH: Framework bindings verified [Next.js, R3F, GSAP 3]...');
    if (progress >= 60) lines.push('> AUDIO: Fetching broadcast status for last.fm: SH20FK...');
    if (progress >= 85) lines.push('> COGN: System calibration finished. Portals active...');
    setLogs(lines);
  }, [progress]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loader"
          exit={{ 
            opacity: 0,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
          }}
          className="fixed inset-0 z-[1000] bg-[#0E0C0F] flex flex-col justify-between p-8 md:p-16 select-none cursor-default"
        >
          {/* Top layout decoration */}
          <div className="flex justify-between items-center w-full font-mono text-[9px] text-text-muted tracking-widest uppercase">
            <span>Core Version // 2026.04</span>
            <span className="flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>Checking System State</span>
            </span>
          </div>

          {/* Central loading display */}
          <div className="max-w-[500px] w-full mx-auto flex flex-col items-start mt-[-5vh]">
            <span className="font-mono text-[10px] text-accent tracking-[0.3em] uppercase mb-2 font-semibold">BOOT PROTOCOL</span>
            <h2 className="font-display text-5xl md:text-7xl font-light text-text tracking-tighter hover:font-bold transition-[font-weight] duration-500">
              SH20FK
            </h2>
            
            {/* Live Terminal logs log rail */}
            <div className="mt-8 flex flex-col gap-2.5 font-mono text-[10px] text-text-muted text-left min-h-[100px] w-full">
              <AnimatePresence>
                {logs.map((log, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full break-all leading-relaxed"
                  >
                    <span className="text-accent/80 font-medium mr-1.5">✓</span>
                    {log}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Solid accent indicator line gauge */}
            <div className="mt-8 w-full h-[1px] bg-[rgba(184,173,158,0.1)] relative">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-accent" 
                animate={{ width: `${progress}%` }} 
                transition={{ ease: 'easeOut', duration: 0.2 }} 
              />
            </div>

            <div className="mt-3 flex justify-between items-center w-full font-mono text-[10px]">
              <span className="text-text-muted font-bold tracking-wider uppercase">Loading matrix</span>
              <span className="text-accent font-semibold">{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Bottom active trigger: Skip control */}
          <div className="flex flex-col items-center justify-center w-full gap-3">
            <button
              onClick={triggerSkip}
              className="pointer-events-auto border border-[rgba(184,173,158,0.15)] bg-[#181620]/30 hover:bg-[rgba(184,173,158,0.05)] hover:border-accent font-mono text-[10px] text-text-muted hover:text-accent tracking-widest uppercase py-2.5 px-6 rounded-md transition-all duration-300 md:active:scale-95"
            >
              SKIP BOOT SEQUENCE [ESC]
            </button>
            <span className="font-mono text-[8px] text-text-muted/60 lowercase">
              designed & developed by alexander salamatin
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
