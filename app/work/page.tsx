'use client';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { motion } from 'framer-motion';
import { Magnetic } from '@/components/ui/Magnetic';
import Link from 'next/link';
import { ArrowUpRight, MoveRight } from 'lucide-react';
import { TechChip } from '@/components/ui/TechChip';
import { spring } from '@/lib/animations';

const PROJECTS = [
  {
    id: '1',
    year: '2024—2026',
    type: 'Mobile / Flutter',
    title: 'NiosMess',
    url: 'https://github.com/SH20FK',
    tags: ['Flutter', 'Dart', 'WebSockets'],
  },
  {
    id: '2',
    year: '2026',
    type: 'Minecraft Mod / Fabric',
    title: 'Project3',
    url: 'https://github.com/SH20FK',
    tags: ['Java', 'Fabric API', 'MinecraftGL'],
  },
];

export default function WorkPage() {
  return (
    <main className="w-full relative bg-bg min-h-screen flex flex-col justify-between overflow-hidden py-14 md:py-20">
      {/* Soft background ambient gradient glow */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-accent/[0.02] rounded-full blur-[130px] pointer-events-none" />

      {/* Top section labels */}
      <div className="px-6 sm:px-16 flex items-center justify-between z-10">
        <SectionLabel>/ 03 WORK</SectionLabel>
      </div>

      {/* Project list */}
      <div className="w-full max-w-5xl mx-auto px-6 md:px-0 my-auto py-8 relative z-10 flex flex-col border-t border-[rgba(184,173,158,0.08)]">
        {PROJECTS.map((project, index) => (
          <motion.a
            key={project.id}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring.default, delay: 0.05 + index * 0.09 }}
            className="group relative flex items-start gap-4 md:gap-10 py-10 md:py-14 px-2 md:px-4 border-b border-[rgba(184,173,158,0.08)] transition-colors duration-500 hover:bg-[#181620]/25 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-4px] focus-visible:outline-accent"
          >
            <span className="font-mono text-xs md:text-sm text-text-muted pt-2 md:pt-4 transition-colors duration-500 group-hover:text-accent">
              0{index + 1}
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-display text-[clamp(2.25rem,6vw,6.5rem)] text-text font-black leading-[1.02] tracking-tight uppercase origin-left transition-[color,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-accent group-hover:translate-x-2 md:group-hover:translate-x-4">
                  {project.title}
                </h2>

                <span className="shrink-0 mt-2 md:mt-5 text-text-muted opacity-0 -translate-x-2 translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-accent">
                  <ArrowUpRight className="w-5 h-5 md:w-7 md:h-7" strokeWidth={1.5} />
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-4">
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
                  {project.year} &nbsp;·&nbsp; {project.type}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <TechChip key={tag}>{tag}</TechChip>
                  ))}
                </div>
              </div>
            </div>
          </motion.a>
        ))}

        {/* Cooperation CTA */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring.default, delay: 0.23 }}
          className="group relative flex items-start gap-4 md:gap-10 py-10 md:py-14 px-2 md:px-4 border-b border-[rgba(184,173,158,0.08)] transition-colors duration-500 hover:bg-[#181620]/25"
        >
          <span className="font-mono text-xs md:text-sm text-text-muted pt-2 md:pt-4 transition-colors duration-500 group-hover:text-accent">
            03
          </span>

          <div className="flex-1 min-w-0">
            <Magnetic>
              <Link
                href="/contact"
                className="inline-block focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent rounded-sm"
              >
                <div className="flex items-center gap-2.5 font-mono text-[10px] sm:text-xs text-text-muted mb-4 uppercase tracking-widest">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  <span>ОБСУДИМ И ТВОЙ ПРОЕКТ // 2026</span>
                </div>

                <div className="font-display text-[clamp(2.5rem,7vw,6.5rem)] text-text font-black leading-[1.02] tracking-tight uppercase transition-[color,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-accent group-hover:translate-x-2 md:group-hover:translate-x-4">
                  <span className="block">ОБСУДИТЬ</span>
                  <span className="flex items-center gap-3">
                    ПРОЕКТ
                    <MoveRight className="w-[0.5em] h-[0.5em] shrink-0" strokeWidth={1.5} />
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2 font-mono text-[10px] text-accent font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Перейти к контактам</span>
                  <MoveRight className="w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-1" strokeWidth={1.5} />
                </div>
              </Link>
            </Magnetic>
          </div>
        </motion.div>
      </div>

      {/* Footer bar */}
      <div className="px-6 sm:px-16 flex items-center justify-between text-text-muted mt-auto pt-4 md:pt-6 z-10">
        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em]">
          <span>sh20fk • built with integrity</span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-widest hidden sm:inline-block">
          Челябинск · {new Date().getFullYear()}
        </span>
      </div>
    </main>
  );
}
