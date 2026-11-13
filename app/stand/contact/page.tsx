import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { ContactVariants } from '@/components/stand/ContactVariants';

export const metadata: Metadata = {
  title: 'Стенд / Contact',
  robots: { index: false, follow: false },
};

const REFERENCES = [
  { name: 'linear.app/contact', url: 'https://linear.app/contact', note: 'маршрутизация по интенту: sales / support / press' },
  { name: 'cal.com/contact', url: 'https://cal.com/contact', note: 'департаменты, прямые mailto, remote-first' },
  { name: 'vercel.com/contact', url: 'https://vercel.com/contact', note: 'плитки контактов рядом с формой' },
  { name: 'charmerstudio.com/ru/contact', url: 'https://charmerstudio.com/ru/contact', note: 'контакты и форма в две колонки, по-русски' },
  { name: 'remedyeditorial.com/contact', url: 'https://remedyeditorial.com/contact/', note: 'департаменты, почты, соцсети + форма' },
  { name: 'raggededge.com/contact', url: 'https://www.raggededge.com/contact', note: 'огромный заголовок, прямые линии, форма' },
  { name: 'adhamdannaway.com/contact', url: 'https://www.adhamdannaway.com/contact', note: 'сначала соцсети и почта, потом форма' },
  { name: 'h2a.lu/contact', url: 'https://www.h2a.lu/contact/', note: 'заявление, цветное поле, форма и адреса' },
  { name: 'posthog.com/contact', url: 'https://posthog.com/contact', note: '«talk to a human»: созвон вместо письма' },
];

export default function ContactStandPage() {
  return (
    <main className="relative min-h-screen w-full bg-bg px-6 py-16 md:px-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex flex-col gap-4 border-b border-[rgba(184,173,158,0.12)] pb-8">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">Стенд / 2026</span>
          <h1 className="font-brand text-[clamp(2rem,6vw,4rem)] font-black uppercase leading-[0.95] tracking-tighter text-text">
            Contact
          </h1>
          <p className="max-w-[620px] font-mono text-[11px] leading-relaxed text-text-dim">
            Девять структурно разных страниц контактов. В каждом варианте есть и форма, и все каналы — Telegram, GitHub,
            Last.fm, Steam, почта. Всё живое: жми, вводи, копируй. Скажи номер — поставлю на /contact.
          </p>
        </header>

        <section className="grid gap-6 border-b border-[rgba(184,173,158,0.12)] py-10 md:grid-cols-[230px_1fr] md:gap-8">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">REF</span>
            <h2 className="font-display text-lg font-black uppercase leading-none tracking-tight text-text">Референсы</h2>
            <p className="mt-1 max-w-[210px] font-mono text-[10px] leading-relaxed text-text-dim">
              Что разобрал, прежде чем рисовать. Не внешний вид, а структура решения.
            </p>
          </div>
          <ul className="grid gap-x-10 gap-y-3 sm:grid-cols-2">
            {REFERENCES.map((ref) => (
              <li key={ref.url} className="group flex items-baseline gap-3 border-b border-[rgba(184,173,158,0.07)] pb-2">
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 font-mono text-[11px] text-text transition-colors duration-300 hover:text-accent"
                >
                  {ref.name}
                </a>
                <span className="font-mono text-[9px] leading-snug text-text-muted">{ref.note}</span>
                <ArrowUpRight className="ml-auto h-3 w-3 shrink-0 text-text-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </li>
            ))}
          </ul>
        </section>

        <ContactVariants />

        <footer className="mt-4 flex items-center justify-between border-t border-[rgba(184,173,158,0.12)] pt-6 font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">
          <span>sh20fk / contact stand</span>
          <span>localhost:3000/stand/contact</span>
        </footer>
      </div>
    </main>
  );
}
