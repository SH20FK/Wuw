'use client';
import { useRef, useEffect, useState } from 'react';
import { TechChip } from './TechChip';
import Link from 'next/link';
import { WarpImage } from '@/components/three/WarpImage';

export interface Project {
  id: string; year: string; type: string; title: string; description: string; image: string; url: string; tags: string[];
}

export function ProjectCard({ project }: { project: Project }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const tiltContainerRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -6;
      const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 6;
      tiltRef.current.targetX = rotateX;
      tiltRef.current.targetY = rotateY;
    };
    const handleMouseLeave = () => { tiltRef.current.targetX = 0; tiltRef.current.targetY = 0; };
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    let rafId: number;
    const animate = () => {
      const tilt = tiltRef.current;
      tilt.x += (tilt.targetX - tilt.x) * 0.1;
      tilt.y += (tilt.targetY - tilt.y) * 0.1;
      if (tiltContainerRef.current) {
        tiltContainerRef.current.style.transform = `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`;
      }
      rafId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div 
      ref={cardRef} 
      className="project-card w-[82vw] sm:w-[350px] md:w-[420px] shrink-0 mx-2 md:mx-4 group cursor-pointer" 
      style={{ transformStyle: 'preserve-3d' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div ref={tiltContainerRef} className="w-full h-full bg-surface border border-[rgba(184,173,158,0.07)] rounded-xl overflow-hidden transition-colors duration-300 hover:border-[rgba(184,173,158,0.18)] flex flex-col" style={{ transformStyle: 'preserve-3d' }}>
        <div className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(ellipse_at_center,rgba(184,173,158,0.04),transparent)]" />
        <div 
          className="w-full aspect-[16/10] bg-surface-2 overflow-hidden relative"
          style={{
            clipPath: isHovered ? 'polygon(4% 0%, 100% 6%, 96% 100%, 0% 92%)' : 'polygon(0% 8%, 92% 0%, 100% 88%, 6% 100%)',
            transition: 'clip-path 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
          }}
        >
          <WarpImage src={project.image} alt={project.title} />
        </div>
        <div className="p-5 flex flex-col flex-1">
          <div className="font-mono text-[10px] text-text-muted tracking-wider mb-1.5 uppercase">{project.year} · {project.type}</div>
          <h3 className="font-display text-lg sm:text-xl text-text leading-tight mb-4">{project.title}</h3>
          
          <div className="mt-auto flex items-center justify-between pt-2 border-t border-[rgba(184,173,158,0.04)]">
            <div className="flex gap-1.5 flex-wrap">
              {project.tags.slice(0, 3).map(t => <TechChip key={t}>{t}</TechChip>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
