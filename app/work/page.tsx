'use client';
import { Project, ProjectCard } from '@/components/ui/ProjectCard';
import { SectionLabel } from '@/components/ui/SectionLabel';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

import { useState } from 'react';

const projects: Project[] = [
  { id: '1', year: '2025', type: 'WEB', title: 'Victor Sin Portfolio', description: 'A study on visual aesthetic, grain, and muted palettes.', image: 'https://picsum.photos/seed/p1/800/450', url: '#', tags: ['WebGL', 'Next.js'] },
  { id: '2', year: '2024', type: 'WEB', title: 'Scroll Driven 3D World', description: 'Implementation of the Ink Bleed transition technique.', image: 'https://picsum.photos/seed/p2/800/450', url: '#', tags: ['GSAP', 'GLSL'] },
  { id: '3', year: '2024', type: 'MOD', title: 'Minecraft WebUI', description: 'React-driven interfaces injected directly into the game client.', image: 'https://picsum.photos/seed/p3/800/450', url: '#', tags: ['React', 'Java'] },
  { id: '4', year: '2023', type: 'UTIL', title: 'Velocity Warp', description: 'Distorting reality based on how fast you scroll down the page.', image: 'https://picsum.photos/seed/p4/800/450', url: '#', tags: ['Three.js'] }
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
    <main className="w-full overflow-x-hidden font-body">
      <section ref={sectionRef} className="relative min-h-[90vh] md:h-screen w-full overflow-hidden bg-bg flex flex-col md:flex-row items-center justify-center pt-24 md:pt-0">
        <div className="absolute top-24 left-8 md:left-16 z-20 pointer-events-none">
          <SectionLabel>/ 03 WORK</SectionLabel>
          <div className="flex gap-4 font-mono text-xs md:text-sm text-text-muted mt-2 pointer-events-auto">
            <button onClick={() => handleCategoryChange('ALL')} className={`${category === 'ALL' ? 'text-accent font-semibold' : 'hover:text-accent'} transition-colors`}>Все</button>
            <button onClick={() => handleCategoryChange('WEB')} className={`${category === 'WEB' ? 'text-accent font-semibold' : 'hover:text-accent'} transition-colors`}>Web</button>
            <button onClick={() => handleCategoryChange('MOD')} className={`${category === 'MOD' ? 'text-accent font-semibold' : 'hover:text-accent'} transition-colors`}>Моды</button>
            <button onClick={() => handleCategoryChange('UTIL')} className={`${category === 'UTIL' ? 'text-accent font-semibold' : 'hover:text-accent'} transition-colors`}>Утилиты</button>
          </div>
        </div>
        <div className="w-full h-full md:absolute md:inset-0 flex items-center overflow-x-auto md:overflow-x-hidden snap-x snap-mandatory md:snap-none scrollbar-none py-12 md:py-0">
          <div ref={trackRef} className="flex items-center px-6 md:px-[30vw] gap-4 md:gap-0 h-full">
            {filteredProjects.map((p) => <ProjectCard key={p.id} project={p} />)}
            <div className="w-[85vw] md:w-[420px] shrink-0 mx-4 h-[350px] md:h-[450px] border border-dashed border-[rgba(184,173,158,0.15)] rounded-lg flex items-center justify-center font-mono text-xs md:text-sm text-text-muted snap-center">В разработке...</div>
          </div>
        </div>
      </section>
    </main>
  );
}
