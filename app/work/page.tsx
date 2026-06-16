'use client';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { motion } from 'framer-motion';
import { Magnetic } from '@/components/ui/Magnetic';
import useLastFmStore from '@/store/useLastFmStore';
import Link from 'next/link';

export default function WorkPage() {
  const { nowPlaying } = useLastFmStore();
  const trackName = nowPlaying?.name || 'Silence';
  const artistName = nowPlaying?.artist?.['#text'] || 'Offline';
  const isPlaying = nowPlaying?.['@attr']?.nowplaying === 'true';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: 'spring', stiffness: 180, damping: 20 }
    }
  };

  return (
    <main className="w-full relative bg-bg min-h-screen py-32 px-6 md:px-16 overflow-x-hidden">
      {/* Dynamic ambient backdrop light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[var(--color-accent)]/2 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto z-10 relative">
        <div className="mb-12">
          <SectionLabel>/ 03 WORK</SectionLabel>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mt-4 gap-4">
            <h2 className="font-display text-4xl md:text-5xl font-light text-text tracking-tighter">
              Разработки & <span className="font-medium text-accent">Концепты</span>
            </h2>
            <span className="font-mono text-xs text-text-muted">
              bento-grid structure · active logs
            </span>
          </div>
        </div>

        {/* Bento Grid Layout - 3 column grid on md+, staggered card heights/widths */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 auto-rows-[250px]"
        >
          
          {/* Item 1: NiosCraft Launcher - 2 cols wide */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -6, borderColor: 'var(--color-accent)' }}
            className="col-span-1 md:col-span-2 row-span-1 border border-[rgba(184,173,158,0.08)] bg-surface/20 hover:bg-surface/35 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden transition-colors"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/4 rounded-full blur-[40px] pointer-events-none" />
            <div className="flex justify-between items-start">
              <span className="font-mono text-[9px] text-accent tracking-widest border border-accent/25 rounded-full px-2.5 py-0.5 bg-accent-glow uppercase font-semibold">
                [In active update]
              </span>
              <span className="font-mono text-[9px] text-text-muted">2026 / WEB</span>
            </div>
            
            <div>
              <h3 className="font-display text-2xl font-light text-text">NiosCraft Launcher V3</h3>
              <p className="font-body text-xs text-text-dim mt-2 leading-relaxed max-w-xl">
                Игровой лаунчер со встроенным личным кабинетом игрока, бесшовной подгрузкой ресурсов и современным веб-интерфейсом. Перерабатывается под полностью модульный React-стек.
              </p>
            </div>

            <div className="flex justify-between items-center bg-surface/50 border border-[rgba(184,173,158,0.04)] px-4 py-2.5 rounded-xl font-mono text-[9.5px]">
              <span className="text-text-muted">Stack:</span>
              <span className="text-text font-medium text-[8.5px]">Next.js · Electron · TypeScript</span>
            </div>
          </motion.div>

          {/* Item 2: Last.fm Live color - 1 col wide, 2 rows tall */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -6, borderColor: 'var(--color-accent)' }}
            className="col-span-1 row-span-2 border border-[rgba(184,173,158,0.08)] bg-surface/25 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group transition-colors"
          >
            {/* Dynamic visualizers bars */}
            <div className="absolute -bottom-10 -right-10 w-44 h-44 border border-accent/10 rounded-full group-hover:scale-110 transition-transform duration-[1.2s] pointer-events-none" />
            
            <div className="flex justify-between items-start">
              <span className="font-mono text-[9px] text-accent tracking-widest border border-accent/25 rounded-full px-2.5 py-0.5 bg-accent-glow uppercase font-semibold">
                [Core engine]
              </span>
              <span className="font-mono text-[9px] text-text-muted">Active</span>
            </div>

            <div className="my-auto flex flex-col items-center text-center justify-center py-4">
              <div className="w-12 h-12 rounded-full border border-accent/20 flex items-center justify-center bg-bg shadow-xl relative">
                <span className="text-lg animate-spin" style={{ animationDuration: isPlaying ? '6s' : '20s' }}>🎵</span>
                {isPlaying && (
                  <span className="absolute -bottom-1 -right-0.5 w-3 h-3 bg-accent rounded-full border-2 border-bg animate-ping" />
                )}
              </div>

              <div className="mt-5 max-w-[200px]">
                <span className="font-mono text-[9px] text-accent font-semibold tracking-wider uppercase block mb-1">
                  {isPlaying ? 'Слушаю сейчас' : 'Тишина'}
                </span>
                <p className="font-mono text-xs text-text truncate font-bold leading-snug">{trackName}</p>
                <p className="font-mono text-[9.5px] text-text-muted truncate mt-0.5">{artistName}</p>
              </div>

              {/* Dynamic waveform simulation blocks */}
              <div className="flex items-end justify-center gap-1 mt-6 h-6 w-24">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={isPlaying ? { height: [4, 24, 6, 20, 4] } : { height: 3 }}
                    transition={{
                      duration: 0.8 + i * 0.15,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    className="w-1.5 bg-accent/60 rounded-full"
                  />
                ))}
              </div>
            </div>

            <p className="font-body text-[10.5px] text-text-muted text-center leading-normal">
              Основа дизайна: цветовой спектр страницы плавно подчиняется текущему треку по API Last.fm.
            </p>
          </motion.div>

          {/* Item 3: JVM Custom Overlays - 1 col wide, 1 row tall */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -6, borderColor: 'var(--color-accent)' }}
            className="col-span-1 row-span-1 border border-[rgba(184,173,158,0.08)] bg-surface/20 hover:bg-surface/35 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between transition-colors"
          >
            <div className="flex justify-between items-start">
              <span className="font-mono text-[9px] text-accent/80 tracking-widest border border-accent/15 rounded-full px-2.5 py-0.5 bg-surface font-semibold">
                [In Queue]
              </span>
              <span className="font-mono text-[9px] text-text-muted">JAVA / MOD</span>
            </div>

            <div>
              <h3 className="font-display text-lg text-text">JVM Client Overlays</h3>
              <p className="font-body text-[11px] text-text-muted mt-2 leading-relaxed">
                Реактивные ин-гейм интерфейсы и накладываемые HUD-дисплеи статистики для Forge/Fabric клиентов.
              </p>
            </div>

            <div className="font-mono text-[9px] text-text-dim/80">
              ▸ OpenGL · Custom shaders · JVM Bridge
            </div>
          </motion.div>

          {/* Item 4: WebGL Core Portfolios - 1 col wide, 1 row tall */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -6, borderColor: 'var(--color-accent)' }}
            className="col-span-1 row-span-1 border border-[rgba(184,173,158,0.08)] bg-surface/20 hover:bg-surface/35 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between transition-colors"
          >
            <div className="flex justify-between items-start">
              <span className="font-mono text-[9px] text-accent tracking-widest border border-accent/25 rounded-full px-2.5 py-0.5 bg-accent-glow uppercase font-semibold">
                [Optimized]
              </span>
              <span className="font-mono text-[9px] text-text-muted">GLSL</span>
            </div>

            <div>
              <h3 className="font-display text-lg text-text">Velocity Warp Shaders</h3>
              <p className="font-body text-[11px] text-text-muted mt-2 leading-relaxed">
                Полноэкранные WebGL фильтры с эффектом искажения при скролле и переходом методом просачивания.
              </p>
            </div>

            <div className="font-mono text-[9px] text-text-dim bg-bg border border-[rgba(184,173,158,0.04)] px-3 py-1 rounded-md w-fit">
              Three.js · ShaderMaterial
            </div>
          </motion.div>

          {/* Item 5: Contact Connection - 1 col wide */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -6, borderColor: 'var(--color-accent)' }}
            className="col-span-1 md:col-span-1 row-span-1 border border-[rgba(184,173,158,0.12)] bg-accent-glow/20 rounded-2xl p-6 flex flex-col justify-between transition-colors relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-[30px] pointer-events-none group-hover:scale-125 transition-transform" />
            <div className="flex justify-between items-start">
              <span className="font-mono text-[8px] text-accent tracking-[0.25em] font-bold uppercase">
                Direct route
              </span>
              <span className="font-mono text-[9px] text-text-muted">Contact</span>
            </div>

            <div>
              <h3 className="font-display text-lg text-text font-medium leading-tight">Обсудить проект?</h3>
              <p className="font-body text-[11px] text-text-muted mt-2 leading-normal">
                Ищешь креативного фронтендера? Оставь мне весточку в контактной форме или Telegram.
              </p>
            </div>

            <Link href="/contact" className="flex items-center gap-2 font-mono text-[10px] text-accent hover:underline font-semibold focus:outline-none">
              Открыть форму ↗
            </Link>
          </motion.div>

        </motion.div>
      </div>
    </main>
  );
}
