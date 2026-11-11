'use client';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { ChelyabinskMark } from '@/components/ui/ChelyabinskMark';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const INTERESTS = ['Minecraft Modding', 'Russian Rap', 'Anime'];

const MARQUEE = [
  'Frontend',
  'Three.js',
  'GSAP',
  'React',
  'Next.js',
  'TypeScript',
  'Tailwind',
  'Flutter',
  'Minecraft Modding',
];

// Same noise field the rest of the site uses for its grain, scaled up into a material plate.
const NOISE = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

export function About() {
  const reduce = useReducedMotion();

  const reveal = (i: number) => ({
    initial: reduce ? undefined : { opacity: 0, y: 26 },
    whileInView: reduce ? undefined : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.65, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <section id="about" className="relative w-full border-t border-[rgba(184,173,158,0.08)] py-[clamp(5rem,10vw,9rem)] overflow-hidden">
      <div className="mx-auto w-full max-w-[1200px] px-6">
        <SectionLabel>/ 02 ABOUT</SectionLabel>

        {/* Statement — the name takes the full measure instead of hiding in a card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-end">
          <motion.h2
            {...reveal(0)}
            className="lg:col-span-8 font-display font-black uppercase text-text leading-[0.86] tracking-tight text-[clamp(2.5rem,7.5vw,5.5rem)]"
          >
            Александр
            <br />
            Саламатин
          </motion.h2>

          <motion.div {...reveal(1)} className="lg:col-span-4 flex flex-col gap-2.5 lg:pb-2">
            <span className="font-mono text-sm text-accent">@SH20FK</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              Frontend Developer
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              Челябинск · Россия
            </span>
          </motion.div>
        </div>
      </div>

      {/* Full-bleed stack strip */}
      <div className="relative mt-12 md:mt-16 w-full border-y border-[rgba(184,173,158,0.08)] py-4 md:py-5 overflow-hidden">
        <div className="marquee-track flex w-max">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center gap-8 md:gap-12 pr-8 md:pr-12" aria-hidden={copy === 1}>
              {MARQUEE.map((word) => (
                <span key={word} className="flex items-center gap-8 md:gap-12">
                  <span className="font-display font-black uppercase text-[clamp(1.05rem,2.1vw,1.75rem)] text-text-muted whitespace-nowrap">
                    {word}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/70 shrink-0" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1200px] px-6 mt-3">
        {/* Bento — 7/5 then 5/4/3, no empty cells */}
        <div className="grid grid-cols-12 gap-x-3 gap-y-8 lg:gap-3">
          {/* Bio — open editorial text on phones, card on desktop */}
          <motion.div
            {...reveal(2)}
            className="col-span-12 lg:col-span-7 flex flex-col justify-between gap-8 lg:gap-10 lg:rounded-2xl lg:border lg:border-[rgba(184,173,158,0.08)] lg:bg-surface/40 lg:p-8"
          >
            <p className="font-body text-[17px] sm:text-lg lg:text-xl text-text-dim leading-relaxed max-w-[54ch]">
              Привет, я Александр. Создаю сайты, приложения и игровые моды. Люблю, когда всё двигается плавно и с
              анимашками: интерфейс должен отзываться на курсор, скролл и клавиши, а не просто лежать на экране.
            </p>

            <Link
              href="/contact"
              className="group self-start inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-text border-b border-[rgba(184,173,158,0.25)] pb-1.5 hover:text-accent hover:border-accent transition-colors"
            >
              Написать
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.5} />
            </Link>
          </motion.div>

          {/* Status — narrow card next to the plate on phones */}
          <motion.div
            {...reveal(3)}
            className="col-span-7 lg:col-span-5 rounded-2xl border border-accent/25 bg-accent/[0.06] p-5 sm:p-6 lg:p-8 flex flex-col justify-between gap-6 lg:gap-10"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">Статус</span>
            <div>
              <div className="font-display font-black uppercase text-text leading-none text-[clamp(1.5rem,3.4vw,2.75rem)]">
                Доступен
              </div>
              <div className="mt-3 lg:mt-4 flex items-start gap-2.5 font-mono text-[11px] lg:text-xs text-text-dim">
                <span className="relative flex h-2 w-2 shrink-0 mt-1 lg:mt-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                Открыт для проектов
              </div>
            </div>
          </motion.div>

          {/* Interests — open list with a hairline on phones */}
          <motion.div
            {...reveal(5)}
            className="order-4 lg:order-none col-span-12 lg:col-span-5 border-t border-[rgba(184,173,158,0.08)] pt-8 lg:border lg:rounded-2xl lg:p-8 flex flex-col justify-between gap-5 lg:gap-8"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">Вне кода</span>
            <div className="flex flex-col">
              {INTERESTS.map((item, i) => (
                <motion.span
                  key={item}
                  whileHover={reduce ? undefined : { x: 6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  className="font-display font-black uppercase text-text leading-tight py-2 cursor-default transition-colors duration-300 hover:text-accent text-[clamp(1.3rem,4.2vw,1.5rem)]"
                >
                  <span className="font-mono text-[10px] text-text-muted mr-3 align-middle">0{i + 1}</span>
                  {item}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Material plate — sits beside the status card on phones */}
          <motion.div
            {...reveal(6)}
            className="order-3 lg:order-none col-span-5 lg:col-span-7 relative overflow-hidden rounded-2xl border border-[rgba(184,173,158,0.08)] min-h-[150px] lg:min-h-[180px]"
          >
            <div
              className="absolute inset-0 opacity-40"
              style={{ background: 'radial-gradient(120% 95% at 12% 108%, var(--color-accent), transparent 72%)' }}
            />
            <div
              className="absolute inset-0 opacity-[0.22] mix-blend-overlay pointer-events-none"
              style={{ backgroundImage: NOISE }}
            />
            <ChelyabinskMark className="pointer-events-none absolute -right-2 bottom-0 hidden h-[118%] w-auto text-accent sm:block lg:right-2" />
            <div className="relative z-10 h-full p-4 sm:p-5 lg:p-6 flex flex-col justify-between gap-5 lg:gap-8">
              <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-text-muted">Координаты</span>
              <div className="flex flex-col gap-2.5 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[11px] lg:text-xs text-text">55.16° N</span>
                  <span className="font-mono text-[11px] lg:text-xs text-text">61.43° E</span>
                </div>
                <span className="font-mono text-[9px] lg:text-[10px] text-text-muted lg:text-right">GMT+5<br />Челябинск</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
