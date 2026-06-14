'use client';
import { Project, ProjectCard } from '@/components/ui/ProjectCard';
import { SectionLabel } from '@/components/ui/SectionLabel';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

const projects: Project[] = [
  { id: '1', year: '2025', type: 'WEB', title: 'Victor Sin Portfolio', description: 'A study on visual aesthetic, grain, and muted palettes.', image: 'https://picsum.photos/seed/p1/800/450', url: '#', tags: ['WebGL', 'Next.js'] },
  { id: '2', year: '2024', type: 'WEB', title: 'Scroll Driven 3D World', description: 'Implementation of the Ink Bleed transition technique.', image: 'https://picsum.photos/seed/p2/800/450', url: '#', tags: ['GSAP', 'GLSL'] },
  { id: '3', year: '2024', type: 'MOD', title: 'Minecraft WebUI', description: 'React-driven interfaces injected directly into the game client.', image: 'https://picsum.photos/seed/p3/800/450', url: '#', tags: ['React', 'Java'] },
  { id: '4', year: '2023', type: 'UTIL', title: 'Velocity Warp', description: 'Distorting reality based on how fast you scroll down the page.', image: 'https://picsum.photos/seed/p4/800/450', url: '#', tags: ['Three.js'] }
];

export default function WorkPage() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top top', end: () => `+=${track.scrollWidth - window.innerWidth}`, scrub: 1.2, pin: true }
      });

      const cards = gsap.utils.toArray('.project-card') as HTMLDivElement[];
      cards.forEach(card => {
        gsap.to(card, {
          scale: 1,
          scrollTrigger: {
            trigger: card,
            containerAnimation: ScrollTrigger.getById(track.id),
            start: 'left center', end: 'right center', scrub: true,
            onUpdate: () => {
              const rect = card.getBoundingClientRect();
              const dist = Math.abs((rect.left + rect.width / 2) - (window.innerWidth / 2)) / (window.innerWidth / 2);
              gsap.set(card, { scale: 1 - Math.min(dist * 0.08, 0.08) });
            }
          }
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <main>
      <section ref={sectionRef} className="h-screen sticky top-0 overflow-hidden bg-bg">
        <div className="absolute top-24 left-8 md:left-16 z-10 pointer-events-none">
          <SectionLabel>/ 03 WORK</SectionLabel>
          <div className="flex gap-4 font-mono text-sm text-text-muted mt-2 pointer-events-auto">
            <button className="text-accent hover:text-accent transition-colors">Все</button>
            <button className="hover:text-accent transition-colors">Web</button>
            <button className="hover:text-accent transition-colors">Моды</button>
            <button className="hover:text-accent transition-colors">Утилиты</button>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center md:items-stretch pt-24 pb-8 h-full">
          <div ref={trackRef} className="flex items-center px-[50vw] md:px-[30vw] h-full">
            {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
            <div className="w-[85vw] md:w-[420px] shrink-0 mx-4 h-[400px] border border-dashed border-[rgba(184,173,158,0.2)] rounded-lg flex items-center justify-center font-mono text-sm text-text-muted">В разработке...</div>
          </div>
        </div>
      </section>
    </main>
  );
}
