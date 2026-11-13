'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SiTelegram, SiGithub, SiLastdotfm, SiSteam } from 'react-icons/si';
import type { IconType } from 'react-icons';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Turnstile } from '@marsidev/react-turnstile';

const CHANNELS: { label: string; handle: string; href: string; Icon: IconType }[] = [
  { label: 'Telegram', handle: '@Door0S', href: 'https://t.me/Door0S', Icon: SiTelegram },
  { label: 'GitHub', handle: 'SH20FK', href: 'https://github.com/SH20FK', Icon: SiGithub },
  { label: 'Last.fm', handle: 'SH20FK', href: 'https://www.last.fm/user/SH20FK', Icon: SiLastdotfm },
  { label: 'Steam', handle: 'SH20FK', href: 'https://steamcommunity.com/search/users/#text=SH20FK', Icon: SiSteam },
];

type Challenge = {
  timestamp: number;
  randomValue: string;
  signature: string;
  difficulty: number;
  honeypotField?: string;
};

async function solveChallenge(challenge: Challenge) {
  const { timestamp, randomValue, signature, difficulty } = challenge;
  const salt = `${timestamp}-${randomValue}-${signature}`;
  const prefix = '0'.repeat(difficulty);
  let nonce = 0;

  const encoder = new TextEncoder();
  while (true) {
    const data = encoder.encode(salt + nonce);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    if (hashHex.startsWith(prefix)) {
      return nonce;
    }
    nonce++;
    if (nonce % 500 === 0) {
      // Yield to the browser so the UI never freezes while the nonce is mined.
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
}

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [honeypotValue, setHoneypotValue] = useState('');
  const [honeypotFieldName, setHoneypotFieldName] = useState('website');
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'validation_error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const turnstileRef = useRef<any>(null);
  const turnstileResolveRef = useRef<((token: string) => void) | null>(null);

  useEffect(() => {
    fetch('/api/turnstile-config')
      .then((res) => res.json())
      .then((data) => {
        setSiteKey(data.siteKey || '1x00000000000000000000AA');
      })
      .catch(() => {
        setSiteKey('1x00000000000000000000AA');
      });

    fetch('/api/contact')
      .then((res) => res.json())
      .then((data) => {
        setChallenge(data);
        if (data.honeypotField) {
          setHoneypotFieldName(data.honeypotField);
        }
      })
      .catch((err) => {
        console.warn('Failed to prefetch security challenge ticket:', err);
      });
  }, []);

  const handleInputChange = (field: 'name' | 'email' | 'message', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (status === 'error' || status === 'validation_error') {
      setStatus('idle');
      setErrorMessage('');
    }
  };

  const refreshChallenge = () => {
    fetch('/api/contact')
      .then((res) => res.json())
      .then((data) => {
        setChallenge(data);
        if (data.honeypotField) {
          setHoneypotFieldName(data.honeypotField);
        }
      })
      .catch((err) => console.warn(err));
  };

  const handleSend = async () => {
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('validation_error');
      window.setTimeout(() => setStatus('idle'), 2500);
      return;
    }

    const emailStr = formData.email.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailStr)) {
      setErrorMessage('Некорректный формат email!');
      setStatus('error');
      window.setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 2500);
      return;
    }

    const lowerEmail = emailStr.toLowerCase();
    const isObviousFake =
      lowerEmail.startsWith('test@') ||
      lowerEmail.startsWith('admin@') ||
      lowerEmail === 'asdf@asdf.com' ||
      lowerEmail === 'test@test.com' ||
      lowerEmail === '1@1.com' ||
      lowerEmail.endsWith('.temp') ||
      lowerEmail.endsWith('.tmp') ||
      lowerEmail.includes('tempmail') ||
      lowerEmail.includes('10minutemail');

    if (isObviousFake) {
      setErrorMessage('Пожалуйста, введите реальный email!');
      setStatus('error');
      window.setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 2500);
      return;
    }

    setStatus('loading');

    let currentToken = turnstileToken;
    if (!currentToken) {
      try {
        if (turnstileRef.current) {
          const tokenPromise = new Promise<string>((resolve, reject) => {
            turnstileResolveRef.current = resolve;

            const timeoutId = window.setTimeout(() => {
              if (turnstileResolveRef.current === resolve) {
                turnstileResolveRef.current = null;
                reject(new Error('Время ожидания проверки Cloudflare истекло. Попробуйте ещё раз.'));
              }
            }, 10000);

            try {
              turnstileRef.current.execute();
            } catch (err) {
              window.clearTimeout(timeoutId);
              reject(err);
            }
          });
          currentToken = await tokenPromise;
        } else {
          throw new Error('Система проверки Cloudflare ещё не готова. Попробуйте через секунду.');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Ошибка безопасности Cloudflare.');
        setStatus('error');
        window.setTimeout(() => {
          setStatus('idle');
          setErrorMessage('');
        }, 3500);
        return;
      }
    }

    try {
      let currentChallenge = challenge;
      if (!currentChallenge) {
        const challengeRes = await fetch('/api/contact');
        if (!challengeRes.ok) {
          throw new Error('Failed to retrieve security token');
        }
        currentChallenge = (await challengeRes.json()) as Challenge;
      }

      const nonce = await solveChallenge(currentChallenge);

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          [honeypotFieldName]: honeypotValue,
          turnstileToken: currentToken,
          challenge: {
            ...currentChallenge,
            nonce,
          },
        }),
      });

      if (response.ok) {
        setStatus('success');
        setTurnstileToken(null);
        if (turnstileRef.current) {
          turnstileRef.current.reset();
        }

        refreshChallenge();
        window.setTimeout(() => {
          setStatus('idle');
          setFormData({ name: '', email: '', message: '' });
          setHoneypotValue('');
        }, 3000);
      } else {
        const data = await response.json().catch(() => ({}));
        setErrorMessage(data.error || 'Ошибка! Попробуйте позже');
        setStatus('error');
        setTurnstileToken(null);
        if (turnstileRef.current) {
          turnstileRef.current.reset();
        }

        refreshChallenge();
        window.setTimeout(() => {
          setStatus('idle');
          setErrorMessage('');
        }, 4500);
      }
    } catch (err) {
      console.error('Contact submission request failed:', err);
      setStatus('error');
      setErrorMessage('Сбой соединения');
      setTurnstileToken(null);
      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }

      refreshChallenge();
      window.setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 4500);
    }
  };

  const buttonLabel =
    status === 'loading' ? 'Отправляю…' : status === 'success' ? 'Отправлено' : 'Отправить';

  const liveMessage =
    status === 'loading'
      ? 'Проверяю и отправляю…'
      : status === 'success'
        ? 'Готово. Отвечу в течение дня.'
        : status === 'validation_error'
          ? 'Заполни имя, email и сообщение.'
          : status === 'error'
            ? errorMessage
            : '';

  return (
    <main className="relative flex min-h-screen w-full flex-col overflow-hidden bg-bg py-14 md:py-20">
      <div className="pointer-events-none absolute left-1/3 top-1/2 h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.02] blur-[130px]" />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 sm:px-10">
        <SectionLabel>/ КОНТАКТ</SectionLabel>

        <h1 className="mt-4 max-w-[18ch] font-display text-[clamp(2.4rem,7vw,5rem)] font-black uppercase leading-[0.92] tracking-tight text-text">
          Расскажи, что собираем.
        </h1>
        <p className="mt-5 max-w-[52ch] font-body text-sm leading-relaxed text-text-dim">
          Опиши задачу в двух словах — я отвечу, задам пару вопросов и скажу, реально ли это в твои сроки. Обычно
          отвечаю в течение дня.
        </p>

        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (status !== 'loading' && status !== 'success') handleSend();
          }}
          className="mt-10 border-t border-[rgba(184,173,158,0.16)]"
        >
          <label className="group grid gap-2 border-b border-[rgba(184,173,158,0.16)] py-5 sm:grid-cols-[120px_1fr] sm:items-baseline">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted transition-colors group-focus-within:text-accent">
              Имя
            </span>
            <input
              type="text"
              value={formData.name}
              disabled={status === 'loading' || status === 'success'}
              onChange={(event) => handleInputChange('name', event.target.value)}
              placeholder="Как тебя зовут"
              className="w-full bg-transparent font-display text-[clamp(1.25rem,2.8vw,1.9rem)] font-black uppercase leading-none tracking-tight text-text outline-none placeholder:text-text-muted/70 disabled:opacity-60"
            />
          </label>

          <label className="group grid gap-2 border-b border-[rgba(184,173,158,0.16)] py-5 sm:grid-cols-[120px_1fr] sm:items-baseline">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted transition-colors group-focus-within:text-accent">
              Email
            </span>
            <input
              type="email"
              value={formData.email}
              disabled={status === 'loading' || status === 'success'}
              onChange={(event) => handleInputChange('email', event.target.value)}
              placeholder="you@mail.ru"
              className="w-full bg-transparent font-display text-[clamp(1.25rem,2.8vw,1.9rem)] font-black uppercase leading-none tracking-tight text-text outline-none placeholder:text-text-muted/70 disabled:opacity-60"
            />
          </label>

          <label className="group grid gap-2 border-b border-[rgba(184,173,158,0.16)] py-5 sm:grid-cols-[120px_1fr] sm:items-baseline">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted transition-colors group-focus-within:text-accent">
              Задача
            </span>
            <textarea
              rows={3}
              value={formData.message}
              disabled={status === 'loading' || status === 'success'}
              onChange={(event) => handleInputChange('message', event.target.value)}
              placeholder="Пара слов о проекте"
              className="w-full resize-none bg-transparent font-display text-[clamp(1.25rem,2.8vw,1.9rem)] font-black uppercase leading-[1.1] tracking-tight text-text outline-none placeholder:text-text-muted/70 disabled:opacity-60"
            />
          </label>

          {/* Honeypot — invisible to humans, irresistible to bots */}
          <div className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0" aria-hidden="true">
            <input
              type="text"
              name={honeypotFieldName}
              value={honeypotValue}
              tabIndex={-1}
              autoComplete="off"
              onChange={(event) => setHoneypotValue(event.target.value)}
            />
          </div>

          {siteKey && (
            <Turnstile
              ref={turnstileRef}
              siteKey={siteKey}
              onSuccess={(token) => {
                setTurnstileToken(token);
                if (turnstileResolveRef.current) {
                  turnstileResolveRef.current(token);
                  turnstileResolveRef.current = null;
                }
              }}
              onExpire={() => {
                setTurnstileToken(null);
                turnstileResolveRef.current = null;
              }}
              onError={() => {
                setTurnstileToken(null);
                turnstileResolveRef.current = null;
              }}
              options={{ theme: 'dark', size: 'invisible' }}
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 py-6">
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="group inline-flex items-center gap-3 font-display text-xl font-black uppercase leading-none tracking-tight text-text transition-colors hover:text-accent disabled:opacity-60 sm:text-2xl"
            >
              {buttonLabel}
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(184,173,158,0.25)] text-text-muted transition-all duration-500 group-hover:border-accent group-hover:bg-accent group-hover:text-bg sm:h-10 sm:w-10">
                <ArrowUpRight
                  className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45"
                  strokeWidth={1.5}
                />
              </span>
            </button>

            <p
              role="status"
              aria-live="polite"
              className={`font-mono text-[10px] leading-relaxed ${
                status === 'error'
                  ? 'text-[#E0876A]'
                  : status === 'success'
                    ? 'text-accent'
                    : 'text-text-muted'
              }`}
            >
              {liveMessage}
            </p>
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
                referrerPolicy="no-referrer"
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
    </main>
  );
}
