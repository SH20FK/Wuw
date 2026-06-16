'use client';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { TechChip } from '@/components/ui/TechChip';
import useLastFmStore from '@/store/useLastFmStore';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { getTrackImage } from '@/lib/utils';
import { motion } from 'framer-motion';

const stack = ['React', 'Three.js', 'GSAP', 'Next.js', 'TypeScript', 'Framer Motion', 'Zustand', 'HTML/CSS', 'Tailwind'];
const interests = ['Minecraft Modding', 'Russian Rap', 'Anime'];

export function About() {
  const { nowPlaying } = useLastFmStore();
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(leftColRef.current, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } });
      gsap.fromTo(rightColRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out', delay: 0.15, scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="about" className="w-full max-w-[1200px] mx-auto px-6 py-[clamp(6rem,12vw,10rem)]">
      <SectionLabel>/ 02 ABOUT</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <div ref={leftColRef} className="md:sticky md:top-24 h-fit">
          <div className="border border-[rgba(184,173,158,0.1)] p-6 rounded-lg bg-surface">
            <div className="font-mono text-xs text-text-muted tracking-wider mb-2">Обо мне</div>
            <h3 className="font-display text-xl text-text leading-tight">Alexander Salamatin</h3>
            <div className="font-mono text-sm text-accent mt-1">@SH20FK</div>
            <div className="w-full h-px bg-[rgba(184,173,158,0.1)] my-4" />
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 font-mono text-xs text-text"><div className="w-2 h-2 rounded-full bg-green-500" />Available</div>
              <div className="flex items-center gap-2 font-mono text-xs text-text-dim"><span className="text-text-muted">▸</span> Chelyabinsk, RU</div>
            </div>
            <div className="w-full h-px bg-[rgba(184,173,158,0.1)] my-4" />
            <div className="flex items-center gap-3 min-h-[44px]">
              {nowPlaying ? (
                <div className="flex items-center gap-3.5 w-full">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-accent/20 animate-spin bg-surface-2" style={{ animationDuration: '8s' }}>
                    {getTrackImage(nowPlaying) ? (
                      <Image src={getTrackImage(nowPlaying)} alt="cover" fill className="object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full bg-accent-sub" />
                    )}
                  </div>
                  <div className="flex flex-col truncate flex-1 py-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 font-mono text-[9px] text-accent tracking-widest uppercase font-semibold">
                      <span className="relative flex h-1.5 w-1.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
                      </span>
                      Слушаю сейчас
                    </div>
                    <div className="font-mono text-xs text-text truncate max-w-[200px] leading-normal font-medium">{nowPlaying.name}</div>
                    <div className="font-mono text-[9.5px] text-text-muted truncate max-w-[200px] leading-normal">{nowPlaying.artist?.['#text'] || 'Неизвестный исполнитель'}</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3.5 w-full">
                  <div className="w-9 h-9 rounded-full bg-[rgba(184,173,158,0.05)] border border-[rgba(184,173,158,0.1)] flex items-center justify-center text-xs text-text-muted shrink-0">
                    💤
                  </div>
                  <div className="flex flex-col py-0.5">
                    <div className="font-mono text-[9px] text-text-muted tracking-widest uppercase font-semibold">Offline</div>
                    <div className="font-mono text-xs text-text-muted leading-normal">Тишина в эфире</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div ref={rightColRef} className="flex flex-col">
          <p className="font-body text-base text-text-dim leading-relaxed">Привет, я Александр (SH20FK). Занимаюсь фронтендом и творческой разработкой интерфейсов. Люблю, когда всё двигается плавненько и с анимашками. Создаю сайты, приложения и игровые моды, кароче все что мне не лень будет.</p>
          
          <div className="mt-12 flex flex-col gap-8">
            <div>
              <h4 className="font-mono text-[10px] text-accent tracking-widest uppercase mb-4 font-semibold">01 / Технологический стек</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-[rgba(184,173,158,0.06)] bg-surface/50 hover:bg-[#181620]/30 hover:border-[rgba(184,173,158,0.12)] transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-[9px] text-text-muted uppercase tracking-wider block mb-3 font-semibold">Core Web / Фронтенд</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['React', 'Next.js 14/15', 'TypeScript', 'Tailwind CSS'].map(item => <TechChip key={item}>{item}</TechChip>)}
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-[rgba(184,173,158,0.06)] bg-surface/50 hover:bg-[#181620]/30 hover:border-[rgba(184,173,158,0.12)] transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-[9px] text-text-muted uppercase tracking-wider block mb-3 font-semibold">3D & Анимации</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['Three.js', 'R3F / Fiber', 'GSAP 3', 'Framer Motion'].map(item => <TechChip key={item}>{item}</TechChip>)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-mono text-[10px] text-accent tracking-widest uppercase mb-4 font-semibold">02 / Инструменты</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-[rgba(184,173,158,0.06)] bg-surface/50 hover:bg-[#181620]/30 hover:border-[rgba(184,173,158,0.12)] transition-all duration-300 col-span-1 sm:col-span-2">
                  <span className="font-mono text-[9px] text-text-muted uppercase tracking-wider block mb-3 font-semibold">Инструменты разработки</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Git / GitHub', 'VS Code', 'npm / pnpm'].map(item => <TechChip key={item}>{item}</TechChip>)}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-mono text-[10px] text-text-muted tracking-widest uppercase mb-4 font-semibold">03 / Специальные интересы</h4>
              <div className="flex flex-wrap gap-2">
                {interests.map(item => (
                  <motion.div
                    key={item}
                    whileHover={{ scale: 1.05 }}
                    className="font-mono text-xs text-text-dim bg-surface border border-[rgba(184,173,158,0.06)] rounded-lg px-4 py-2 hover:border-accent/15 hover:text-accent cursor-default transition-all duration-300"
                  >
                    {item}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
