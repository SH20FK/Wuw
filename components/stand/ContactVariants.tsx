'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, Check, Copy, Send } from 'lucide-react';
import { SiTelegram, SiGithub, SiLastdotfm, SiSteam } from 'react-icons/si';
import type { IconType } from 'react-icons';
import { ChelyabinskMark } from '@/components/ui/ChelyabinskMark';

const EMAIL = 'hi@sh20fk.ru';
const TG = 'https://t.me/Door0S';

type Channel = {
  label: string;
  handle: string;
  href: string;
  Icon: IconType;
};

const CHANNELS: Channel[] = [
  { label: 'Telegram', handle: '@Door0S', href: TG, Icon: SiTelegram },
  { label: 'GitHub', handle: 'SH20FK', href: 'https://github.com/SH20FK', Icon: SiGithub },
  { label: 'Last.fm', handle: 'SH20FK', href: 'https://www.last.fm/user/SH20FK', Icon: SiLastdotfm },
  { label: 'Steam', handle: 'SH20FK', href: 'https://steamcommunity.com/search/users/#text=SH20FK', Icon: SiSteam },
];

/* ------------------------------------------------------------------ form */

type FormKey = 'name' | 'email' | 'message' | 'subject';
type FormValues = Record<FormKey, string>;
type FormStatus = 'idle' | 'sending' | 'sent' | 'error';

function useStandForm() {
  const [values, setValues] = useState<FormValues>({ name: '', email: '', message: '', subject: '' });
  const [status, setStatus] = useState<FormStatus>('idle');
  const [error, setError] = useState('');

  const update =
    (key: FormKey) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setValues((prev) => ({ ...prev, [key]: value }));
      if (status === 'error') {
        setStatus('idle');
        setError('');
      }
    };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!values.name.trim()) {
      setError('Напиши, как к тебе обращаться');
      setStatus('error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
      setError('Нужен рабочий email для ответа');
      setStatus('error');
      return;
    }
    if (!values.message.trim()) {
      setError('Добавь пару слов о задаче');
      setStatus('error');
      return;
    }

    setStatus('sending');
    window.setTimeout(() => {
      setStatus('sent');
      setValues({ name: '', email: '', message: '', subject: '' });
      window.setTimeout(() => setStatus('idle'), 3000);
    }, 800);
  };

  return { values, status, error, update, submit };
}

function submitLabel(status: FormStatus, idle: string) {
  if (status === 'sending') return 'Отправляю…';
  if (status === 'sent') return 'Отправлено';
  if (status === 'error') return 'Попробуй ещё';
  return idle;
}

function ErrorLine({ error }: { error: string }) {
  if (!error) return null;
  return (
    <p role="alert" className="font-mono text-[10px] leading-relaxed text-[#E0876A]">
      {error}
    </p>
  );
}

function useClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const fmt = () =>
      new Intl.DateTimeFormat('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Yekaterinburg',
      }).format(new Date());
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 30000);
    return () => clearInterval(id);
  }, []);
  return time;
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ V1 — маршрутизатор */

const INTENTS = [
  { id: 'project', label: 'Проект', hint: 'сайт, приложение, мод', subject: 'Новый проект' },
  { id: 'job', label: 'Работа', hint: 'вакансия или стажировка', subject: 'Предложение о работе' },
  { id: 'question', label: 'Вопрос', hint: 'быстрый вопрос', subject: 'Вопрос' },
  { id: 'press', label: 'Пресса', hint: 'интервью и материалы', subject: 'Пресса' },
];

function V1Router() {
  const form = useStandForm();
  const [intent, setIntent] = useState('project');
  const current = INTENTS.find((item) => item.id === intent) ?? INTENTS[0];

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">Контакты</span>
          <h3 className="font-display text-[clamp(1.8rem,4vw,2.8rem)] font-black uppercase leading-none tracking-tight text-text">
            С чем пришёл?
          </h3>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">Отвечаю в течение дня</span>
      </div>

      <div role="tablist" aria-label="Тема обращения" className="mt-6 flex flex-wrap gap-2">
        {INTENTS.map((item) => {
          const active = item.id === intent;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setIntent(item.id)}
              className={`flex flex-col gap-1 border px-4 py-2.5 text-left transition-colors duration-300 ${
                active
                  ? 'border-accent bg-accent/[0.07]'
                  : 'border-[rgba(184,173,158,0.14)] hover:border-accent/50'
              }`}
            >
              <span
                className={`font-display text-sm font-black uppercase leading-none tracking-tight transition-colors ${
                  active ? 'text-accent' : 'text-text'
                }`}
              >
                {item.label}
              </span>
              <span className="font-mono text-[9px] leading-none text-text-muted">{item.hint}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid border border-[rgba(184,173,158,0.16)] md:grid-cols-[1fr_260px]">
        <form onSubmit={form.submit} className="flex flex-col gap-5 p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">{current.subject}</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted">Письмо</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">Имя</span>
              <input
                value={form.values.name}
                onChange={form.update('name')}
                placeholder="Как тебя зовут"
                className="v-inp"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">Email</span>
              <input
                type="email"
                value={form.values.email}
                onChange={form.update('email')}
                placeholder="you@mail.ru"
                className="v-inp"
              />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">Сообщение</span>
            <textarea
              rows={4}
              value={form.values.message}
              onChange={form.update('message')}
              placeholder="Задача, сроки, ссылки — в свободной форме"
              className="v-inp resize-none"
            />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="submit"
              disabled={form.status === 'sending' || form.status === 'sent'}
              className="group flex h-11 items-center gap-3 bg-accent px-5 font-mono text-[10px] uppercase tracking-[0.18em] text-bg transition-opacity disabled:opacity-70"
            >
              {submitLabel(form.status, 'Отправить')}
              <Send className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
            </button>
            <ErrorLine error={form.error} />
          </div>
        </form>

        <aside className="flex flex-col border-t border-[rgba(184,173,158,0.16)] p-5 md:border-l md:border-t-0">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">Напрямую</span>
          <a
            href={`mailto:${EMAIL}`}
            className="mt-3 inline-flex items-start gap-2 font-mono text-[12px] leading-relaxed text-text transition-colors hover:text-accent"
          >
            {EMAIL}
            <ArrowUpRight className="mt-0.5 h-3 w-3 shrink-0" strokeWidth={1.5} />
          </a>

          <div className="mt-5 flex flex-col border-t border-[rgba(184,173,158,0.12)]">
            {CHANNELS.map((channel) => (
              <a
                key={channel.label}
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2.5 border-b border-[rgba(184,173,158,0.12)] py-2.5 font-mono text-[10px] text-text-dim transition-colors hover:text-accent"
              >
                <channel.Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                <span className="text-text">{channel.label}</span>
                <span className="ml-auto text-text-muted transition-colors group-hover:text-accent">
                  {channel.handle}
                </span>
              </a>
            ))}
          </div>

          <p className="mt-auto pt-5 font-mono text-[9px] leading-relaxed text-text-muted">
            Telegram — самый быстрый способ.
          </p>
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ V2 — сплит */

function V2Split() {
  const form = useStandForm();
  const time = useClock();

  return (
    <div className="grid w-full gap-10 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:gap-14">
      <aside className="flex flex-col gap-7 md:sticky md:top-24 md:self-start">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">Связь</span>
          <h3 className="font-display text-[clamp(1.9rem,4.2vw,3rem)] font-black uppercase leading-[0.94] tracking-tight text-text">
            Открыт
            <br />к проектам
          </h3>
          <p className="max-w-[34ch] font-body text-sm leading-relaxed text-text-dim">
            Сайты, интерфейсы, небольшие игры. Беру задачи, где нужно собрать всё целиком — от идеи до продакшена.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">Почта</span>
          <a
            href={`mailto:${EMAIL}`}
            className="group inline-flex items-baseline gap-2 font-display text-lg font-black tracking-tight text-text transition-colors hover:text-accent"
          >
            {EMAIL}
            <ArrowUpRight
              className="h-4 w-4 shrink-0 text-text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
              strokeWidth={1.5}
            />
          </a>
        </div>

        <div className="grid grid-cols-2 gap-px border border-[rgba(184,173,158,0.14)] bg-[rgba(184,173,158,0.14)]">
          {CHANNELS.map((channel) => (
            <a
              key={channel.label}
              href={channel.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-3 bg-bg p-4 transition-colors hover:bg-[#17141c]"
            >
              <channel.Icon aria-hidden="true" className="h-4 w-4 text-text-muted transition-colors group-hover:text-accent" />
              <span className="flex flex-col gap-0.5">
                <span className="font-display text-xs font-black uppercase tracking-tight text-text transition-colors group-hover:text-accent">
                  {channel.label}
                </span>
                <span className="font-mono text-[9px] text-text-muted">{channel.handle}</span>
              </span>
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2.5 border-t border-[rgba(184,173,158,0.14)] pt-5 font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          на связи · {time || '--:--'}
        </div>
      </aside>

      <form onSubmit={form.submit} className="flex flex-col gap-6">
        <div className="flex items-end justify-between gap-4 border-b border-[rgba(184,173,158,0.14)] pb-4">
          <h4 className="font-display text-2xl font-black uppercase leading-none tracking-tight text-text">Написать</h4>
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">Без посредников</span>
        </div>

        <label className="flex flex-col gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">Имя</span>
          <input
            value={form.values.name}
            onChange={form.update('name')}
            placeholder="Как тебя зовут"
            className="border-b border-[rgba(184,173,158,0.18)] bg-transparent pb-3 font-body text-lg text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">Email</span>
          <input
            type="email"
            value={form.values.email}
            onChange={form.update('email')}
            placeholder="you@mail.ru"
            className="border-b border-[rgba(184,173,158,0.18)] bg-transparent pb-3 font-body text-lg text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">Задача</span>
          <textarea
            rows={5}
            value={form.values.message}
            onChange={form.update('message')}
            placeholder="Что делаем, когда, зачем"
            className="resize-none border-b border-[rgba(184,173,158,0.18)] bg-transparent pb-3 font-body text-lg leading-relaxed text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent"
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="submit"
            disabled={form.status === 'sending' || form.status === 'sent'}
            className="group flex h-12 items-center gap-6 bg-accent px-5 font-mono text-[10px] uppercase tracking-[0.18em] text-bg transition-opacity disabled:opacity-70"
          >
            {submitLabel(form.status, 'Отправить сообщение')}
            <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
          </button>
          <ErrorLine error={form.error} />
        </div>

        <p className="font-mono text-[9px] leading-relaxed text-text-muted">
          Или сразу в{' '}
          <a href={TG} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            Telegram
          </a>
          . Так быстрее.
        </p>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ V3 — редакционная полоса */

function V3Editorial() {
  const form = useStandForm();

  return (
    <div className="w-full">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">Написать</span>
      <h3 className="mt-4 max-w-[18ch] font-display text-[clamp(2.2rem,6vw,4.4rem)] font-black uppercase leading-[0.92] tracking-tight text-text">
        Расскажи, что собираем.
      </h3>
      <p className="mt-5 max-w-[52ch] font-body text-sm leading-relaxed text-text-dim">
        Опиши задачу в двух словах — я отвечу, задам пару вопросов и скажу, реально ли это в твои сроки.
      </p>

      <form onSubmit={form.submit} className="mt-9 border-t border-[rgba(184,173,158,0.16)]">
        <label className="group grid gap-2 border-b border-[rgba(184,173,158,0.16)] py-5 sm:grid-cols-[120px_1fr] sm:items-baseline">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted transition-colors group-focus-within:text-accent">
            Имя
          </span>
          <input
            value={form.values.name}
            onChange={form.update('name')}
            placeholder="Как тебя зовут"
            className="w-full bg-transparent font-display text-[clamp(1.3rem,3vw,2rem)] font-black uppercase leading-none tracking-tight text-text outline-none placeholder:text-text-muted/70"
          />
        </label>

        <label className="group grid gap-2 border-b border-[rgba(184,173,158,0.16)] py-5 sm:grid-cols-[120px_1fr] sm:items-baseline">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted transition-colors group-focus-within:text-accent">
            Email
          </span>
          <input
            type="email"
            value={form.values.email}
            onChange={form.update('email')}
            placeholder="you@mail.ru"
            className="w-full bg-transparent font-display text-[clamp(1.3rem,3vw,2rem)] font-black uppercase leading-none tracking-tight text-text outline-none placeholder:text-text-muted/70"
          />
        </label>

        <label className="group grid gap-2 border-b border-[rgba(184,173,158,0.16)] py-5 sm:grid-cols-[120px_1fr] sm:items-baseline">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted transition-colors group-focus-within:text-accent">
            Задача
          </span>
          <textarea
            rows={3}
            value={form.values.message}
            onChange={form.update('message')}
            placeholder="Пара слов о проекте"
            className="w-full resize-none bg-transparent font-display text-[clamp(1.3rem,3vw,2rem)] font-black uppercase leading-[1.1] tracking-tight text-text outline-none placeholder:text-text-muted/70"
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-4 py-6">
          <button
            type="submit"
            disabled={form.status === 'sending' || form.status === 'sent'}
            className="group inline-flex items-center gap-3 font-display text-xl font-black uppercase leading-none tracking-tight text-text transition-colors hover:text-accent disabled:opacity-70"
          >
            {submitLabel(form.status, 'Отправить')}
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(184,173,158,0.25)] text-text-muted transition-all duration-500 group-hover:border-accent group-hover:bg-accent group-hover:text-bg">
              <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" strokeWidth={1.5} />
            </span>
          </button>
          <ErrorLine error={form.error} />
        </div>
      </form>

      <div className="mt-10 border-t border-[rgba(184,173,158,0.16)] pt-7">
        <div className="grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          {CHANNELS.map((channel) => (
            <a
              key={channel.label}
              href={channel.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5"
            >
              <channel.Icon aria-hidden="true" className="h-[18px] w-[18px] shrink-0 text-text-dim transition-colors group-hover:text-accent" />
              <span className="flex min-w-0 flex-col">
                <span className="font-display text-lg font-black uppercase leading-none tracking-tight text-text transition-colors group-hover:text-accent">
                  {channel.label}
                </span>
                <span className="mt-1 font-mono text-[9px] text-text-muted">{channel.handle}</span>
              </span>
              <ArrowUpRight
                className="ml-auto h-3.5 w-3.5 shrink-0 text-text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                strokeWidth={1.5}
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ V4 — визитка */

function V4Card() {
  const form = useStandForm();

  return (
    <div className="flex w-full justify-center">
      <div className="relative w-full max-w-3xl border border-[rgba(184,173,158,0.22)] bg-[#121016] p-6 shadow-[18px_20px_0_-14px_rgba(0,0,0,0.45)] sm:p-9">
        <div className="flex items-start justify-between gap-5 border-b border-dashed border-[rgba(184,173,158,0.2)] pb-5">
          <div className="flex flex-col gap-1">
            <span className="font-brand text-xl font-black uppercase tracking-tight text-text">[SH20FK]</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
              карточка контакта
            </span>
          </div>
          <div className="flex h-16 w-12 rotate-2 flex-col items-center justify-center gap-1 border border-accent/45 text-accent">
            <ChelyabinskMark className="h-7 w-5" />
            <span className="font-mono text-[7px] uppercase tracking-[0.14em]">ЧБ</span>
          </div>
        </div>

        <div className="grid gap-8 pt-6 md:grid-cols-[1fr_220px] md:gap-10">
          <form onSubmit={form.submit} className="flex flex-col gap-5">
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-text-muted">от кого</span>
              <input
                value={form.values.name}
                onChange={form.update('name')}
                placeholder="имя"
                className="border-b border-dashed border-[rgba(184,173,158,0.28)] bg-transparent pb-2.5 font-body text-base text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-text-muted">
                обратный адрес
              </span>
              <input
                type="email"
                value={form.values.email}
                onChange={form.update('email')}
                placeholder="email"
                className="border-b border-dashed border-[rgba(184,173,158,0.28)] bg-transparent pb-2.5 font-body text-base text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-text-muted">сообщение</span>
              <textarea
                rows={4}
                value={form.values.message}
                onChange={form.update('message')}
                placeholder="пара строк от руки"
                className="resize-none border-b border-dashed border-[rgba(184,173,158,0.28)] bg-transparent pb-2.5 font-body text-base leading-relaxed text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent"
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="submit"
                disabled={form.status === 'sending' || form.status === 'sent'}
                className="group flex items-center gap-2 border-b border-accent pb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent disabled:opacity-70"
              >
                {submitLabel(form.status, 'Отправить')}
                <Send className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} />
              </button>
              <ErrorLine error={form.error} />
            </div>
          </form>

          <aside className="flex flex-col gap-5 border-t border-dashed border-[rgba(184,173,158,0.2)] pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-text-muted">почта</span>
              <a
                href={`mailto:${EMAIL}`}
                className="font-mono text-[11px] leading-relaxed text-text transition-colors hover:text-accent"
              >
                {EMAIL}
              </a>
            </div>

            <div className="flex flex-col border-t border-dashed border-[rgba(184,173,158,0.2)] pt-4">
              {CHANNELS.map((channel) => (
                <a
                  key={channel.label}
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 py-1.5 font-mono text-[10px] text-text-dim transition-colors hover:text-accent"
                >
                  <channel.Icon aria-hidden="true" className="h-3 w-3 shrink-0" />
                  <span className="text-text transition-colors group-hover:text-accent">{channel.label}</span>
                  <span className="ml-auto text-text-muted">{channel.handle}</span>
                </a>
              ))}
            </div>

            <span className="mt-auto font-mono text-[8px] uppercase tracking-[0.2em] text-text-muted">
              Челябинск · Россия
            </span>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ V5 — индекс каналов */

function V5Index() {
  const form = useStandForm();
  const [copied, setCopied] = useState('');

  const onCopy = async (value: string, label: string) => {
    if (await copyText(value)) {
      setCopied(label);
      window.setTimeout(() => setCopied(''), 1600);
    }
  };

  return (
    <div className="grid w-full gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-14">
      <div className="flex flex-col">
        <div className="flex items-end justify-between gap-4 border-b border-[rgba(184,173,158,0.16)] pb-4">
          <h3 className="font-display text-[clamp(1.7rem,4vw,2.5rem)] font-black uppercase leading-none tracking-tight text-text">
            Каналы
          </h3>
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">Выбери любой</span>
        </div>

        <div className="group flex items-center gap-3 border-b border-[rgba(184,173,158,0.16)] py-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-[rgba(184,173,158,0.16)] text-text-muted">
            <span className="font-mono text-[11px]">@</span>
          </span>
          <a href={`mailto:${EMAIL}`} className="flex min-w-0 flex-1 items-baseline justify-between gap-4">
            <span className="font-display text-lg font-black uppercase tracking-tight text-text transition-colors group-hover:text-accent">
              Почта
            </span>
            <span className="truncate font-mono text-[10px] text-text-dim">{EMAIL}</span>
          </a>
          <button
            type="button"
            onClick={() => onCopy(EMAIL, 'email')}
            aria-label="Скопировать email"
            className="flex h-8 w-8 shrink-0 items-center justify-center border border-transparent text-text-muted transition-all hover:border-accent/40 hover:text-accent"
          >
            {copied === 'email' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>

        {CHANNELS.map((channel) => (
          <div
            key={channel.label}
            className="group flex items-center gap-3 border-b border-[rgba(184,173,158,0.16)] py-4 transition-colors hover:bg-accent/[0.03]"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-[rgba(184,173,158,0.16)] text-text-muted transition-colors group-hover:border-accent/40 group-hover:text-accent">
              <channel.Icon aria-hidden="true" className="h-3.5 w-3.5" />
            </span>
            <a
              href={channel.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-w-0 flex-1 items-baseline justify-between gap-4"
            >
              <span className="font-display text-lg font-black uppercase tracking-tight text-text transition-colors group-hover:text-accent">
                {channel.label}
              </span>
              <span className="font-mono text-[10px] text-text-dim">{channel.handle}</span>
            </a>
            <button
              type="button"
              onClick={() => onCopy(channel.handle, channel.label)}
              aria-label={`Скопировать ${channel.handle}`}
              className="flex h-8 w-8 shrink-0 items-center justify-center border border-transparent text-text-muted transition-all hover:border-accent/40 hover:text-accent"
            >
              {copied === channel.label ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        ))}

        <p className="mt-5 font-mono text-[9px] leading-relaxed text-text-muted">
          Быстрее всего — Telegram. Если нужен формальный след — почта.
        </p>
      </div>

      <form onSubmit={form.submit} className="flex flex-col gap-5 border border-[rgba(184,173,158,0.16)] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <h4 className="font-display text-xl font-black uppercase leading-none tracking-tight text-text">
            Или письмом
          </h4>
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted">Форма</span>
        </div>

        <label className="flex flex-col gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">Имя</span>
          <input value={form.values.name} onChange={form.update('name')} placeholder="Как тебя зовут" className="v-inp" />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">Email</span>
          <input
            type="email"
            value={form.values.email}
            onChange={form.update('email')}
            placeholder="you@mail.ru"
            className="v-inp"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">Сообщение</span>
          <textarea
            rows={4}
            value={form.values.message}
            onChange={form.update('message')}
            placeholder="Что нужно сделать"
            className="v-inp resize-none"
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="submit"
            disabled={form.status === 'sending' || form.status === 'sent'}
            className="group flex h-10 items-center gap-5 bg-accent px-4 font-mono text-[10px] uppercase tracking-[0.18em] text-bg disabled:opacity-70"
          >
            {submitLabel(form.status, 'Отправить')}
            <Send className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
          </button>
          <ErrorLine error={form.error} />
        </div>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ V6 — письмо */

function V6Composer() {
  const form = useStandForm();
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    if (await copyText(EMAIL)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl overflow-hidden border border-[rgba(184,173,158,0.18)] bg-[#100e12]">
      <div className="flex items-center gap-2 border-b border-[rgba(184,173,158,0.16)] px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-[rgba(184,173,158,0.25)]" />
        <span className="h-2 w-2 rounded-full bg-[rgba(184,173,158,0.25)]" />
        <span className="h-2 w-2 rounded-full bg-[rgba(184,173,158,0.25)]" />
        <span className="ml-3 font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">новое сообщение</span>
        <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted">sh20fk mail</span>
      </div>

      <div className="grid md:grid-cols-[1fr_220px]">
        <form onSubmit={form.submit} className="flex min-w-0 flex-col">
          <div className="flex items-center gap-3 border-b border-[rgba(184,173,158,0.14)] px-5 py-3">
            <span className="w-14 shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted">Кому</span>
            <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-text-dim">{EMAIL}</span>
            <button
              type="button"
              onClick={onCopy}
              aria-label="Скопировать email"
              className="shrink-0 text-text-muted transition-colors hover:text-accent"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>

          <label className="flex items-center gap-3 border-b border-[rgba(184,173,158,0.14)] px-5 py-2.5">
            <span className="w-14 shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted">От</span>
            <input
              value={form.values.name}
              onChange={form.update('name')}
              placeholder="имя"
              className="min-w-0 flex-1 bg-transparent font-body text-sm text-text outline-none placeholder:text-text-muted"
            />
          </label>

          <label className="flex items-center gap-3 border-b border-[rgba(184,173,158,0.14)] px-5 py-2.5">
            <span className="w-14 shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted">
              Обратно
            </span>
            <input
              type="email"
              value={form.values.email}
              onChange={form.update('email')}
              placeholder="email"
              className="min-w-0 flex-1 bg-transparent font-body text-sm text-text outline-none placeholder:text-text-muted"
            />
          </label>

          <label className="flex items-center gap-3 border-b border-[rgba(184,173,158,0.14)] px-5 py-2.5">
            <span className="w-14 shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted">Тема</span>
            <input
              value={form.values.subject}
              onChange={form.update('subject')}
              placeholder="проект, работа, вопрос"
              className="min-w-0 flex-1 bg-transparent font-body text-sm text-text outline-none placeholder:text-text-muted"
            />
          </label>

          <textarea
            rows={7}
            value={form.values.message}
            onChange={form.update('message')}
            placeholder="Текст письма…"
            className="resize-none bg-transparent px-5 py-4 font-body text-sm leading-relaxed text-text outline-none placeholder:text-text-muted"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(184,173,158,0.14)] px-5 py-3">
            <button
              type="submit"
              disabled={form.status === 'sending' || form.status === 'sent'}
              className="group flex h-9 items-center gap-3 bg-accent px-4 font-mono text-[10px] uppercase tracking-[0.18em] text-bg disabled:opacity-70"
            >
              {submitLabel(form.status, 'Отправить')}
              <Send className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
            </button>
            <ErrorLine error={form.error} />
          </div>
        </form>

        <aside className="border-t border-[rgba(184,173,158,0.16)] p-4 md:border-l md:border-t-0">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">Быстрые каналы</span>
          <div className="mt-2 flex flex-col">
            {CHANNELS.map((channel) => (
              <a
                key={channel.label}
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 border-b border-[rgba(184,173,158,0.1)] py-2.5 font-mono text-[10px] text-text-dim transition-colors last:border-b-0 hover:text-accent"
              >
                <channel.Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                <span className="text-text transition-colors group-hover:text-accent">{channel.label}</span>
                <span className="ml-auto text-[9px] text-text-muted">{channel.handle}</span>
              </a>
            ))}
          </div>

          <a
            href={`mailto:${EMAIL}`}
            className="mt-4 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-accent hover:underline"
          >
            {EMAIL}
            <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
          </a>
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ V7 — письмо в предложении */

function V7MadLibs() {
  const form = useStandForm();

  return (
    <div className="w-full">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">Без анкеты</span>

      <form onSubmit={form.submit} className="mt-6">
        <p className="max-w-[24ch] font-display text-[clamp(1.8rem,4.2vw,3rem)] font-black uppercase leading-[1.35] tracking-tight text-text sm:max-w-none">
          Привет, я{' '}
          <input
            value={form.values.name}
            onChange={form.update('name')}
            placeholder="имя"
            aria-label="Имя"
            className="inline-block w-[4.6em] border-b-2 border-accent/50 bg-transparent text-accent outline-none transition-colors placeholder:text-accent/30 focus:border-accent"
          />
          .
          <br />
          Ответь на{' '}
          <input
            type="email"
            value={form.values.email}
            onChange={form.update('email')}
            placeholder="email"
            aria-label="Email"
            className="inline-block w-[8.4em] border-b-2 border-accent/50 bg-transparent text-accent outline-none transition-colors placeholder:text-accent/30 focus:border-accent"
          />
          .
          <br />
          Хочу обсудить:
        </p>

        <textarea
          rows={3}
          value={form.values.message}
          onChange={form.update('message')}
          aria-label="Сообщение"
          placeholder="проект, сроки, бюджет — в двух словах"
          className="mt-5 w-full resize-none border-b-2 border-accent/40 bg-transparent pb-3 font-display text-[clamp(1.3rem,3.4vw,2.2rem)] font-black uppercase leading-[1.15] tracking-tight text-text outline-none placeholder:text-text-muted/60 focus:border-accent"
        />

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <button
            type="submit"
            disabled={form.status === 'sending' || form.status === 'sent'}
            className="group flex items-center gap-3 font-display text-lg font-black uppercase leading-none tracking-tight text-text transition-colors hover:text-accent disabled:opacity-70"
          >
            {submitLabel(form.status, 'Отправить')}
            <ArrowUpRight
              className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              strokeWidth={1.5}
            />
          </button>
          <ErrorLine error={form.error} />
          <a
            href={`mailto:${EMAIL}`}
            className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted transition-colors hover:text-accent"
          >
            или просто на {EMAIL}
          </a>
        </div>
      </form>

      <div className="mt-10 flex flex-wrap items-baseline gap-x-7 gap-y-2 border-t border-[rgba(184,173,158,0.16)] pt-5">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">Я ещё тут</span>
        {CHANNELS.map((channel) => (
          <a
            key={channel.label}
            href={channel.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-xl font-black uppercase leading-none tracking-tight text-text transition-colors hover:text-accent"
          >
            {channel.label}
          </a>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ V8 — терминал */

function V8Terminal() {
  const form = useStandForm();

  return (
    <div className="grid w-full gap-5 md:grid-cols-[0.9fr_1.1fr]">
      <div className="flex flex-col border border-[rgba(184,173,158,0.16)] bg-[#0a090b]">
        <div className="flex items-center gap-2 border-b border-[rgba(184,173,158,0.14)] px-4 py-2.5">
          <span className="h-2 w-2 rounded-full bg-[#333]" />
          <span className="h-2 w-2 rounded-full bg-[#333]" />
          <span className="h-2 w-2 rounded-full bg-[#333]" />
          <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">contact@sh20fk:~</span>
        </div>

        <div className="flex flex-1 flex-col gap-2.5 p-4 font-mono text-[11px] leading-relaxed">
          <p className="text-text-muted">
            <span className="text-accent">$</span> whoami
          </p>
          <p className="text-text-dim">frontend developer · sh20fk</p>

          <p className="mt-2 text-text-muted">
            <span className="text-accent">$</span> contacts
          </p>
          <div className="flex flex-col gap-0.5">
            {CHANNELS.map((channel) => (
              <a
                key={channel.label}
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-baseline gap-2 text-text-dim transition-colors hover:text-accent"
              >
                <span className="w-[72px] shrink-0 text-text-muted">{channel.label.toLowerCase()}</span>
                <span className="text-text transition-colors group-hover:text-accent">{channel.handle}</span>
              </a>
            ))}
            <a
              href={`mailto:${EMAIL}`}
              className="group flex items-baseline gap-2 text-text-dim transition-colors hover:text-accent"
            >
              <span className="w-[72px] shrink-0 text-text-muted">email</span>
              <span className="text-text transition-colors group-hover:text-accent">{EMAIL}</span>
            </a>
          </div>

          <p className="mt-2 text-text-muted">
            <span className="text-accent">$</span> mail --new
          </p>
          <p className="text-text-muted">форма справа. или telegram — быстрее.</p>

          <p className="mt-auto flex items-center gap-2 pt-4 text-text-muted">
            <span className="text-accent">$</span>
            <span className="inline-block h-3 w-1.5 animate-pulse bg-text-muted" />
          </p>
        </div>
      </div>

      <form onSubmit={form.submit} className="flex flex-col gap-4 border border-[rgba(184,173,158,0.16)] p-5">
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">mail --new</span>
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted">stdin</span>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">имя</span>
          <input value={form.values.name} onChange={form.update('name')} placeholder="твоё имя" className="v-inp font-mono" />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">email</span>
          <input
            type="email"
            value={form.values.email}
            onChange={form.update('email')}
            placeholder="you@mail.ru"
            className="v-inp font-mono"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">сообщение</span>
          <textarea
            rows={5}
            value={form.values.message}
            onChange={form.update('message')}
            placeholder="что нужно сделать"
            className="v-inp resize-none font-mono"
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="submit"
            disabled={form.status === 'sending' || form.status === 'sent'}
            className="flex h-10 items-center gap-2 border border-accent px-4 font-mono text-[10px] uppercase tracking-[0.18em] text-accent transition-colors hover:bg-accent hover:text-bg disabled:opacity-70"
          >
            {submitLabel(form.status, '[ отправить ]')}
          </button>
          <ErrorLine error={form.error} />
        </div>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ V9 — слоты */

function V9Slots() {
  const form = useStandForm();
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);

  const days = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index + 1);
    return {
      key: date.toISOString().slice(0, 10),
      dow: new Intl.DateTimeFormat('ru-RU', { weekday: 'short' }).format(date),
      date: new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit' }).format(date),
    };
  });

  const times = ['11:00', '13:00', '15:00', '17:00', '19:00'];

  return (
    <div className="w-full">
      <div className="grid gap-8 md:grid-cols-[1fr_320px] md:gap-12">
        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">Созвон</span>
            <h3 className="font-display text-[clamp(1.8rem,4.4vw,2.8rem)] font-black uppercase leading-none tracking-tight text-text">
              30 минут
            </h3>
            <p className="max-w-[42ch] font-body text-sm leading-relaxed text-text-dim">
              Разберём задачу, скажу сроки и вилку. Без обязательств. Если удобнее письмом — форма справа.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">День</span>
            <div className="flex flex-wrap gap-2">
              {days.map((item, index) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setDay(index);
                    setSlot(null);
                  }}
                  className={`flex min-w-[62px] flex-col items-center gap-1 rounded-xl border px-3 py-2.5 transition-all duration-300 ${
                    day === index
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-[rgba(184,173,158,0.16)] text-text-dim hover:border-accent/50'
                  }`}
                >
                  <span className="font-mono text-[9px] uppercase">{item.dow}</span>
                  <span className="font-display text-sm font-black tabular-nums">{item.date}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">Время</span>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {times.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSlot(time)}
                  className={`rounded-full border py-2 font-mono text-[11px] tabular-nums transition-all duration-300 ${
                    slot === time
                      ? 'border-accent bg-accent text-bg'
                      : 'border-[rgba(184,173,158,0.16)] text-text-dim hover:border-accent/50 hover:text-accent'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-[rgba(184,173,158,0.16)] pt-4">
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">Выбрано</span>
            <span className="font-display text-sm font-black uppercase tracking-tight text-text">
              {slot ? `${days[day].date} · ${slot}` : 'время не выбрано'}
            </span>
          </div>
        </div>

        <form onSubmit={form.submit} className="flex flex-col gap-4 border border-[rgba(184,173,158,0.16)] p-5">
          <div className="flex items-center justify-between gap-3">
            <h4 className="font-display text-lg font-black uppercase leading-none tracking-tight text-text">
              Кто на связи
            </h4>
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted">Форма</span>
          </div>

          <label className="flex flex-col gap-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">Имя</span>
            <input value={form.values.name} onChange={form.update('name')} placeholder="Как тебя зовут" className="v-inp" />
          </label>

          <label className="flex flex-col gap-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">Email</span>
            <input
              type="email"
              value={form.values.email}
              onChange={form.update('email')}
              placeholder="you@mail.ru"
              className="v-inp"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">Сообщение</span>
            <textarea
              rows={3}
              value={form.values.message}
              onChange={form.update('message')}
              placeholder="Что обсудим"
              className="v-inp resize-none"
            />
          </label>

          <button
            type="submit"
            disabled={form.status === 'sending' || form.status === 'sent'}
            className="flex h-10 items-center justify-center gap-2 bg-accent font-mono text-[10px] uppercase tracking-[0.18em] text-bg disabled:opacity-70"
          >
            {submitLabel(form.status, 'Отправить')}
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <ErrorLine error={form.error} />
        </form>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[rgba(184,173,158,0.16)] pt-5">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">Или напрямую</span>
        {CHANNELS.map((channel) => (
          <a
            key={channel.label}
            href={channel.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 font-mono text-[10px] text-text-dim transition-colors hover:text-accent"
          >
            <channel.Icon aria-hidden="true" className="h-3 w-3" />
            {channel.label}
          </a>
        ))}
        <a
          href={`mailto:${EMAIL}`}
          className="font-mono text-[10px] text-text-muted transition-colors hover:text-accent"
        >
          {EMAIL}
        </a>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ export */

const VARIANTS: { id: string; name: string; note: string; node: React.ReactNode }[] = [
  {
    id: 'V1',
    name: 'Маршрутизатор',
    note: 'Linear / Cal: сначала тема обращения, форма и все каналы остаются на виду. Ничего не прячется за выбором.',
    node: <V1Router />,
  },
  {
    id: 'V2',
    name: 'Сплит',
    note: 'Charmer / Remedy: слева — кто я, почта и соцсети, справа — форма. Слева липнет при скролле.',
    node: <V2Split />,
  },
  {
    id: 'V3',
    name: 'Редакционная полоса',
    note: 'Ragged Edge / DixonBaxi: огромный заголовок, поля как строки текста, каналы — внизу. Почти без коробок.',
    node: <V3Editorial />,
  },
  {
    id: 'V4',
    name: 'Визитка',
    note: 'Adham / h2a: физическая карточка. Слева форма, справа адресная сторона с почтой и каналами.',
    node: <V4Card />,
  },
  {
    id: 'V5',
    name: 'Индекс',
    note: 'Vercel: плотная таблица каналов с копированием и форма письмом рядом. Сухо, быстро, всё перед глазами.',
    node: <V5Index />,
  },
  {
    id: 'V6',
    name: 'Письмо',
    note: 'Почтовый клиент: Кому / От / Обратно / Тема / тело письма. Каналы — в боковой панели.',
    node: <V6Composer />,
  },
  {
    id: 'V7',
    name: 'В предложении',
    note: 'Mad libs: имя и почта вписаны прямо в фразу, задача — продолжение. Каналы крупными словами внизу.',
    node: <V7MadLibs />,
  },
  {
    id: 'V8',
    name: 'Терминал',
    note: 'Контакты как вывод whoami / contacts, форма как mail --new. Для тех, кто живёт в клавиатуре.',
    node: <V8Terminal />,
  },
  {
    id: 'V9',
    name: 'Слоты',
    note: 'Cal.com: выбор дня и времени, короткая форма и все каналы внизу. Созвон или письмо — на выбор.',
    node: <V9Slots />,
  },
];

export function ContactVariants() {
  return (
    <div className="flex flex-col">
      {VARIANTS.map((variant) => (
        <section
          key={variant.id}
          className="grid gap-6 border-t border-[rgba(184,173,158,0.1)] py-10 md:grid-cols-[220px_1fr] md:gap-10 md:py-14"
        >
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">{variant.id}</span>
            <h2 className="font-display text-lg font-black uppercase leading-none tracking-tight text-text">
              {variant.name}
            </h2>
            <p className="mt-1 max-w-[200px] font-mono text-[10px] leading-relaxed text-text-dim">{variant.note}</p>
          </div>
          <div className="min-w-0">{variant.node}</div>
        </section>
      ))}
    </div>
  );
}
