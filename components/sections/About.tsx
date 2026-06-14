'use client';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { TechChip } from '@/components/ui/TechChip';
import useLastFmStore from '@/store/useLastFmStore';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

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
            <div className="font-mono text-xs text-text-muted tracking-wider mb-2">ДОСЬЕ</div>
            <h3 className="font-display text-xl text-text leading-tight">Alexander Salamatin</h3>
            <div className="font-mono text-sm text-accent mt-1">@SH20FK</div>
            <div className="w-full h-px bg-[rgba(184,173,158,0.1)] my-4" />
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 font-mono text-xs text-text"><div className="w-2 h-2 rounded-full bg-green-500" />Available</div>
              <div className="flex items-center gap-2 font-mono text-xs text-text-dim"><span className="text-text-muted">▸</span> Chelyabinsk, RU</div>
            </div>
            <div className="w-full h-px bg-[rgba(184,173,158,0.1)] my-4" />
            <div className="flex items-center gap-3">
              <div className="w-[60px] h-[16px] rounded bg-bg relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
              </div>
              <div className="font-mono text-xs text-text-muted truncate max-w-[150px]">🎵 {nowPlaying ? nowPlaying.name : 'Silence'}</div>
            </div>
          </div>
        </div>
        <div ref={rightColRef} className="flex flex-col">
          <p className="font-body text-base text-text-dim leading-relaxed">Привет, я Александр. Занимаюсь фронтендом. Люблю, когда всё двигается правильно, а интерфейсы ощущаются физически. Создаю сайты, где производительность и плавность не конфликтуют с дизайном.</p>
          <h4 className="font-mono text-sm text-text-muted uppercase mt-12 mb-4 tracking-wider">Стек</h4>
          <div className="flex flex-wrap gap-2">{stack.map(item => <TechChip key={item}>{item}</TechChip>)}</div>
          <h4 className="font-mono text-sm text-text-muted uppercase mt-12 mb-4 tracking-wider">Интересы</h4>
          <div className="flex flex-wrap gap-2">{interests.map(item => <TechChip key={item}>{item}</TechChip>)}</div>
        </div>
      </div>
    </section>
  );
}
