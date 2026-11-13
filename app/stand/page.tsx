import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, MoveUpRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Стенд / Hero links',
  robots: { index: false, follow: false },
};

const ITEMS = [
  { href: '/work', index: '02', label: 'Работы', meta: '2 проекта' },
  { href: '/music', index: '03', label: 'Музыка', meta: 'Last.fm' },
];

const REFERENCES = [
  { name: 'paco.me', url: 'https://paco.me', note: 'почти без UI: только типографика, ссылки без рамок' },
  { name: 'rauno.me', url: 'https://rauno.me', note: 'индекс ссылок, hover раскрывает детали' },
  { name: 'family.co', url: 'https://www.family.co', note: 'пункты меню с заливкой на hover' },
  { name: 'basement.studio', url: 'https://basement.studio', note: 'моно-навигация: смена цвета + микро-сдвиг' },
  { name: 'linear.app', url: 'https://linear.app', note: 'CTA — текст со стрелкой, без коробки' },
  { name: 'vercel.com', url: 'https://vercel.com', note: 'подчёркивание-линия как единственный акцент' },
  { name: 'brianlovin.com', url: 'https://brianlovin.com', note: 'сайдбар-индекс разделов' },
  { name: 'studiofreight.com', url: 'https://www.studiofreight.com', note: 'типографика вместо кнопок' },
  { name: 'aristidebenoist.com', url: 'https://aristidebenoist.com', note: 'полноэкранный список крупным кеглем' },
];

const HAIRLINE = 'rgba(184,173,158,0.14)';
const EASE = 'ease-[cubic-bezier(0.16,1,0.3,1)]';

function Variant({
  id,
  name,
  note,
  children,
}: {
  id: string;
  name: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-6 border-t border-[rgba(184,173,158,0.1)] py-10 md:grid-cols-[230px_1fr] md:gap-8 md:py-12">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">{id}</span>
        <h2 className="font-display text-lg font-black uppercase leading-none tracking-tight text-text">{name}</h2>
        <p className="mt-1 max-w-[210px] font-mono text-[10px] leading-relaxed text-text-dim">{note}</p>
      </div>
      <div className="flex flex-col items-start gap-7">{children}</div>
    </section>
  );
}

/* V1 — номер + волосяная линия */
function IndexLink({ href, index, label }: { href: string; index: string; label: string }) {
  return (
    <Link
      href={href}
      className={`group relative flex min-w-[9.5rem] flex-col gap-2.5 border-t pb-1 pr-1 pt-3.5 ${EASE}`}
      style={{ borderColor: HAIRLINE }}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-700 ${EASE} group-hover:scale-x-100`}
      />
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted transition-colors duration-300 group-hover:text-accent">
        {index}
      </span>
      <span className="flex items-center gap-2">
        <span className="font-display text-[1.15rem] font-black uppercase leading-none tracking-tight text-text transition-colors duration-300 group-hover:text-accent">
          {label}
        </span>
        <MoveUpRight
          className={`h-4 w-4 shrink-0 text-text-muted transition-all duration-500 ${EASE} group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent`}
          strokeWidth={1.5}
        />
      </span>
    </Link>
  );
}

export default function StandPage() {
  return (
    <main className="relative min-h-screen w-full bg-bg px-6 py-16 md:px-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl">
        {/* header */}
        <header className="flex flex-col gap-4 border-b border-[rgba(184,173,158,0.12)] pb-8">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">Стенд / 2026</span>
          <h1 className="font-brand text-[clamp(2rem,6vw,4rem)] font-black uppercase leading-[0.95] tracking-tighter text-text">
            Hero links
          </h1>
          <p className="max-w-[560px] font-mono text-[11px] leading-relaxed text-text-dim">
            Восемь вариантов пары «Работы / Музыка» для главного экрана. Все без коробок: типографика, линии, стрелки.
            Скажи номер — поставлю на главную.
          </p>
        </header>

        {/* references */}
        <section className="grid gap-6 border-b border-[rgba(184,173,158,0.12)] py-10 md:grid-cols-[230px_1fr] md:gap-8">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">REF</span>
            <h2 className="font-display text-lg font-black uppercase leading-none tracking-tight text-text">Референсы</h2>
            <p className="mt-1 max-w-[210px] font-mono text-[10px] leading-relaxed text-text-dim">
              Что смотрел, прежде чем рисовать варианты.
            </p>
          </div>
          <ol className="grid gap-x-10 gap-y-3 sm:grid-cols-2">
            {REFERENCES.map((ref, i) => (
              <li key={ref.url} className="group flex items-baseline gap-3 border-b border-[rgba(184,173,158,0.07)] pb-2">
                <span className="font-mono text-[9px] tabular-nums text-text-muted">0{i + 1}</span>
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] text-text transition-colors duration-300 hover:text-accent"
                >
                  {ref.name}
                </a>
                <span className="font-mono text-[9px] text-text-muted">{ref.note}</span>
                <ArrowUpRight className="ml-auto h-3 w-3 shrink-0 text-text-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </li>
            ))}
          </ol>
        </section>

        {/* V1 */}
        <Variant id="V1" name="Индекс" note="Номер раздела как в хедере + волосяная линия, которая заливается акцентом. Сейчас стоит на главной.">
          <div className="flex flex-wrap gap-x-10 gap-y-6">
            {ITEMS.map((it) => (
              <IndexLink key={it.href} href={it.href} index={it.index} label={it.label} />
            ))}
          </div>
        </Variant>

        {/* V2 */}
        <Variant id="V2" name="Подчёркивание" note="Крупный кегль, акцентная линия растёт слева. Стрелка уезжает по диагонали.">
          {ITEMS.map((it) => (
            <Link key={it.href} href={it.href} className="group flex items-baseline gap-3 py-1">
              <span className="relative font-display text-[1.55rem] font-black uppercase leading-none tracking-tight text-text transition-colors duration-300 group-hover:text-accent">
                {it.label}
                <span
                  className={`absolute -bottom-1.5 left-0 h-[2px] w-full origin-left scale-x-0 bg-accent transition-transform duration-700 ${EASE} group-hover:scale-x-100`}
                />
              </span>
              <MoveUpRight
                className={`h-4 w-4 text-accent transition-transform duration-500 ${EASE} group-hover:-translate-y-1 group-hover:translate-x-1`}
                strokeWidth={1.5}
              />
            </Link>
          ))}
        </Variant>

        {/* V3 */}
        <Variant id="V3" name="Подмена" note="Слово уезжает вверх, снизу поднимается его акцентная копия. Тихий приём, хорошо работает на тёмном.">
          {ITEMS.map((it) => (
            <Link key={it.href} href={it.href} className="group flex items-center gap-3 py-1">
              <span className="relative block h-[1em] overflow-hidden font-display text-[1.55rem] font-black uppercase leading-none tracking-tight">
                <span className={`block text-text transition-transform duration-500 ${EASE} group-hover:-translate-y-full`}>
                  {it.label}
                </span>
                <span className={`absolute left-0 top-0 block translate-y-full text-accent transition-transform duration-500 ${EASE} group-hover:translate-y-0`}>
                  {it.label}
                </span>
              </span>
            </Link>
          ))}
        </Variant>

        {/* V4 */}
        <Variant id="V4" name="Капсула" note="Стрелка в круге: круг заливается акцентом, стрелка разворачивается на 45°.">
          {ITEMS.map((it) => (
            <Link key={it.href} href={it.href} className="group flex items-center gap-3.5 py-1">
              <span className="font-display text-[1.5rem] font-black uppercase leading-none tracking-tight text-text transition-colors duration-300 group-hover:text-accent">
                {it.label}
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(184,173,158,0.25)] text-text-muted transition-all duration-500 group-hover:border-accent group-hover:bg-accent group-hover:text-bg">
                <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" strokeWidth={1.5} />
              </span>
            </Link>
          ))}
        </Variant>

        {/* V5 */}
        <Variant id="V5" name="Строки" note="Список на всю ширину: номер, название, стрелка. На hover строка заливается акцентом на 7% и сдвигается.">
          <div className="w-full max-w-[440px] border-t border-[rgba(184,173,158,0.12)]">
            {ITEMS.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className="group relative flex items-center gap-4 border-b border-[rgba(184,173,158,0.12)] px-1 py-3.5"
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-0 origin-left scale-x-0 bg-accent/[0.07] transition-transform duration-500 ${EASE} group-hover:scale-x-100`}
                />
                <span className="relative font-mono text-[10px] tabular-nums text-text-muted transition-colors group-hover:text-accent">
                  {it.index}
                </span>
                <span className="relative flex-1 font-display text-base font-black uppercase leading-none tracking-tight text-text transition-all duration-500 group-hover:translate-x-1 group-hover:text-accent">
                  {it.label}
                </span>
                <MoveUpRight
                  className={`relative h-4 w-4 text-text-muted transition-all duration-500 ${EASE} group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent`}
                  strokeWidth={1.5}
                />
              </Link>
            ))}
          </div>
        </Variant>

        {/* V6 */}
        <Variant id="V6" name="Маркер" note="Акцентная плашка-хайлайтер растёт слева под словом, текст инвертируется в цвет фона.">
          {ITEMS.map((it) => (
            <Link key={it.href} href={it.href} className="group inline-flex items-center py-1">
              <span className="relative font-display text-[1.55rem] font-black uppercase leading-none tracking-tight text-text transition-colors duration-300 delay-100 group-hover:text-bg">
                <span
                  aria-hidden="true"
                  className={`absolute -left-[7px] -right-[7px] bottom-[0.04em] top-[0.36em] origin-left scale-x-0 bg-accent transition-transform duration-500 ${EASE} group-hover:scale-x-100`}
                />
                <span className="relative">{it.label}</span>
              </span>
            </Link>
          ))}
        </Variant>

        {/* V7 */}
        <Variant id="V7" name="Мета" note="Слева название, справа подпись. На hover подпись сменяется стрелкой, название уезжает вправо.">
          <div className="w-full max-w-[440px]">
            {ITEMS.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className="group flex items-baseline justify-between gap-6 border-b border-[rgba(184,173,158,0.12)] py-4"
              >
                <span className="font-display text-[1.35rem] font-black uppercase leading-none tracking-tight text-text transition-all duration-500 group-hover:translate-x-1 group-hover:text-accent">
                  {it.label}
                </span>
                <span className="relative block h-3 w-[92px] shrink-0 text-right font-mono text-[9px] uppercase tracking-[0.18em]">
                  <span className="absolute right-0 top-0 text-text-muted transition-all duration-300 group-hover:opacity-0">
                    {it.meta}
                  </span>
                  <span
                    className={`absolute right-0 top-0 translate-x-1 text-accent opacity-0 transition-all duration-500 ${EASE} group-hover:translate-x-0 group-hover:opacity-100`}
                  >
                    открыть →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </Variant>

        {/* V8 */}
        <Variant id="V8" name="Линия до края" note="Название, затем линия до стрелки: на hover линия становится акцентной.">
          {ITEMS.map((it) => (
            <Link key={it.href} href={it.href} className="group flex w-full max-w-[440px] items-center gap-3 py-2">
              <span className="font-mono text-[10px] tabular-nums text-text-muted transition-colors group-hover:text-accent">
                {it.index}
              </span>
              <span className="font-display text-[1.2rem] font-black uppercase leading-none tracking-tight text-text transition-colors duration-300 group-hover:text-accent">
                {it.label}
              </span>
              <span className={`h-px flex-1 transition-colors duration-500 ${EASE} bg-[rgba(184,173,158,0.18)] group-hover:bg-accent`} />
              <MoveUpRight
                className={`h-4 w-4 shrink-0 text-text-muted transition-all duration-500 ${EASE} group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent`}
                strokeWidth={1.5}
              />
            </Link>
          ))}
        </Variant>

        <footer className="mt-4 flex items-center justify-between border-t border-[rgba(184,173,158,0.12)] pt-6 font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">
          <span>sh20fk / stand</span>
          <span>localhost:3000/stand</span>
        </footer>
      </div>
    </main>
  );
}
