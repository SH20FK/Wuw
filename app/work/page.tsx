'use client';
import { Project, ProjectCard } from '@/components/ui/ProjectCard';
import { SectionLabel } from '@/components/ui/SectionLabel';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

import { useState } from 'react';

const projects: Project[] = [
  { 
    id: '1', 
    year: '2025', 
    type: 'WEB', 
    title: 'NiosCraft Web Launcher', 
    description: 'Индивидуальный игровой лаунчер с веб-панелью, современным личным кабинетом игрока и бесшовной подгрузкой игровых ресурсов.', 
    image: 'https://picsum.photos/seed/nios/800/450', 
    url: 'https://nioscraft.ru', 
    tags: ['Next.js', 'Electron', 'TypeScript'] 
  },
  { 
    id: '2', 
    year: '2025', 
    type: 'WEB', 
    title: 'Music Hub / Last.fm Widget', 
    description: 'Адаптивный музыкальный центр с интеграцией Last.fm API, автоопределением цвета обложек, графиком скроблинга и резервной базой iTunes/Deezer.', 
    image: 'https://picsum.photos/seed/music/800/450', 
    url: '/music', 
    tags: ['Last.fm API', 'Framer Motion', 'Tailwind'] 
  },
  { 
    id: '3', 
    year: '2024', 
    type: 'MOD', 
    title: 'NiosCraft Client Overlays', 
    description: 'Реактивные внутриигровые интерфейсы и дисплеи статистики, встраиваемые непосредственно в JVM-клиенты Forge/Fabric.', 
    image: 'https://picsum.photos/seed/minecraft/800/450', 
    url: 'https://nioscraft.ru', 
    tags: ['Java', 'Forge', 'Fabric'] 
  },
  { 
    id: '4', 
    year: '2024', 
    type: 'UTIL', 
    title: 'Velocity Warp Shaders', 
    description: 'Комплекс WebGL шейдеров: эффект растягивания при прокрутке и переход страниц методом просачивания чернил (Ink Bleed).', 
    image: 'https://picsum.photos/seed/shader/800/450', 
    url: '/', 
    tags: ['Three.js', 'GLSL', 'GSAP'] 
  }
];

export default function WorkPage() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState<'ALL' | 'WEB' | 'MOD' | 'UTIL'>('ALL');

  const filteredProjects = category === 'ALL' 
    ? projects 
    : projects.filter(p => p.type === category);

  const handleCategoryChange = (newCat: 'ALL' | 'WEB' | 'MOD' | 'UTIL') => {
    // 1. Reset mobile horizontal scroll
    if (trackRef.current) {
      const parent = trackRef.current.parentElement;
      if (parent) {
        parent.scrollTo({ left: 0, behavior: 'instant' as any });
      }
    }

    // 2. Clear current GSAP ScrollTriggers associated with this section
    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger.vars.trigger === sectionRef.current) {
        trigger.kill();
      }
    });

    // 3. Reset window vertical scroll back to top of page/section
    window.scrollTo({ top: 0, behavior: 'instant' as any });

    // 4. Update the active filter category
    setCategory(newCat);
  };

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Small timeout to allow browser layout to paint and calculate actual container widths
      const initScroll = () => {
        const scrollTween = gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth),
          ease: 'none',
          scrollTrigger: { 
            trigger: section, 
            start: 'top top', 
            end: () => `+=${track.scrollWidth - window.innerWidth}`, 
            scrub: 1.2, 
            pin: true,
            invalidateOnRefresh: true
          }
        });

        const cards = gsap.utils.toArray('.project-card') as HTMLDivElement[];
        cards.forEach(card => {
          gsap.to(card, {
            scale: 1,
            scrollTrigger: {
              trigger: card,
              containerAnimation: scrollTween,
              start: 'left center', end: 'right center', scrub: true,
              onUpdate: () => {
                const rect = card.getBoundingClientRect();
                const dist = Math.abs((rect.left + rect.width / 2) - (window.innerWidth / 2)) / (window.innerWidth / 2);
                gsap.set(card, { scale: 1 - Math.min(dist * 0.08, 0.08) });
              }
            }
          });
        });
      };

      initScroll();
    }, sectionRef);

    // Refresh ScrollTrigger as dimensions settle down
    const timer1 = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);

    const timer2 = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 1000);

    return () => {
      ctx.revert();
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [category]);

  return (
    <main className="w-full overflow-x-hidden font-body bg-bg min-h-screen">
      <section ref={sectionRef} className="relative min-h-screen w-full bg-bg flex flex-col pt-24 md:pt-0">
        {/* Section header & Category filters */}
        <div className="md:absolute top-24 left-8 md:left-16 z-20 px-8 py-4 md:px-0 md:py-0">
          <SectionLabel>/ 03 WORK</SectionLabel>
          <div className="flex gap-4 font-mono text-xs md:text-sm text-text-muted mt-2 flex-wrap">
            <button onClick={() => handleCategoryChange('ALL')} className={`${category === 'ALL' ? 'text-accent font-semibold' : 'hover:text-accent'} transition-colors`}>Все</button>
            <button onClick={() => handleCategoryChange('WEB')} className={`${category === 'WEB' ? 'text-accent font-semibold' : 'hover:text-accent'} transition-colors`}>Web</button>
            <button onClick={() => handleCategoryChange('MOD')} className={`${category === 'MOD' ? 'text-accent font-semibold' : 'hover:text-accent'} transition-colors`}>Моды</button>
            <button onClick={() => handleCategoryChange('UTIL')} className={`${category === 'UTIL' ? 'text-accent font-semibold' : 'hover:text-accent'} transition-colors`}>Утилиты</button>
          </div>
        </div>

        {/* Mobile View: Vertical scrollable layout for clean stacking on touch screen devices */}
        <div className="block md:hidden w-full px-6 pb-24 pt-6 z-10">
          <div className="flex flex-col gap-6">
            {filteredProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
            <div className="w-full py-12 px-6 border border-dashed border-[rgba(184,173,158,0.15)] rounded-lg flex items-center justify-center font-mono text-xs text-text-muted">
              В разработке...
            </div>
          </div>
        </div>

        {/* Desktop View: Horizontal scroll-hijacked gallery pinned by GSAP */}
        <div className="hidden md:flex w-full h-full md:absolute md:inset-0 items-center overflow-x-hidden py-12 md:py-0">
          <div ref={trackRef} className="flex items-center px-6 md:px-[30vw] gap-4 md:gap-0 h-full">
            {filteredProjects.map((p) => <ProjectCard key={p.id} project={p} />)}
            <div className="w-[85vw] md:w-[420px] shrink-0 mx-4 h-[350px] md:h-[450px] border border-dashed border-[rgba(184,173,158,0.15)] rounded-lg flex items-center justify-center font-mono text-xs md:text-sm text-text-muted snap-center">В разработке...</div>
          </div>
        </div>
      </section>
    </main>
  );
}
