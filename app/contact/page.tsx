'use client';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { spring } from '@/lib/animations';
import { Send, Github, Music, Gamepad2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSfx } from '@/lib/useSfx';
import { Turnstile } from '@marsidev/react-turnstile';

async function solveChallenge(challenge: { timestamp: number; randomValue: string; signature: string; difficulty: number }) {
  const { timestamp, randomValue, signature, difficulty } = challenge;
  const salt = `${timestamp}-${randomValue}-${signature}`;
  const prefix = '0'.repeat(difficulty);
  let nonce = 0;

  const encoder = new TextEncoder();
  while (true) {
    const data = encoder.encode(salt + nonce);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (hashHex.startsWith(prefix)) {
      return nonce;
    }
    nonce++;
    if (nonce % 500 === 0) {
      // Yield execution to the browser to prevent freezing the UI
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
}

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [honeypotValue, setHoneypotValue] = useState('');
  const [honeypotFieldName, setHoneypotFieldName] = useState('website');
  const [challenge, setChallenge] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'validation_error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const turnstileRef = useRef<any>(null);
  const { playHover, playClick, playType } = useSfx();

  useEffect(() => {
    // Fetch Turnstile config dynamically
    fetch('/api/turnstile-config')
      .then(res => res.json())
      .then(data => {
        if (data.siteKey) {
          setSiteKey(data.siteKey);
        } else {
          setSiteKey('1x00000000000000000000AA');
        }
      })
      .catch(() => {
        setSiteKey('1x00000000000000000000AA');
      });

    // Fetch dynamic security challenge & dynamic honeypot field name on mount
    fetch('/api/contact')
      .then(res => res.json())
      .then(data => {
        setChallenge(data);
        if (data.honeypotField) {
          setHoneypotFieldName(data.honeypotField);
        }
      })
      .catch((err) => {
        console.warn('Failed to prefetch security challenge ticket:', err);
      });
  }, []);

  const handleInputChange = (field: 'name' | 'email' | 'message', val: string) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    playType();
  };

  const handleHoneypotChange = (val: string) => {
    setHoneypotValue(val);
  };

  const handleSend = async () => {
    // 1. Validation check
    if (!formData.name || !formData.email || !formData.message) {
      playClick();
      setStatus('validation_error');
      setTimeout(() => setStatus('idle'), 2500);
      return;
    }

    const emailStr = formData.email.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailStr)) {
      playClick();
      setErrorMessage('Некорректный формат email!');
      setStatus('error');
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 2500);
      return;
    }

    // Block obvious dummy emails
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
      playClick();
      setErrorMessage('Пожалуйста, введите реальный email!');
      setStatus('error');
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 2500);
      return;
    }

    // Check Turnstile Token
    if (!turnstileToken) {
      playClick();
      setErrorMessage('Подождите проверку безопасности Cloudflare...');
      setStatus('error');
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 3500);
      return;
    }
    
    playClick();
    setStatus('loading');

    try {
      // 2. Use pre-fetched challenge or retrieve one if not loaded yet
      let currentChallenge = challenge;
      if (!currentChallenge) {
        const challengeRes = await fetch('/api/contact');
        if (!challengeRes.ok) {
          throw new Error('Failed to retrieve security token');
        }
        currentChallenge = await challengeRes.json();
      }

      // 3. Solve Cryptographic Proof-of-Work locally in browser (invisible CAPTCHA)
      const nonce = await solveChallenge(currentChallenge);

      // 4. Send submission payload along with solved challenge & Cloudflare Turnstile token
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          [honeypotFieldName]: honeypotValue,
          turnstileToken,
          challenge: {
            ...currentChallenge,
            nonce
          }
        }),
      });

      if (response.ok) {
        setStatus('success');
        setTurnstileToken(null);
        if (turnstileRef.current) {
          turnstileRef.current.reset();
        }
        
        // Pre-fetch a fresh challenge for any subsequent submissions
        fetch('/api/contact')
          .then(res => res.json())
          .then(data => {
            setChallenge(data);
            if (data.honeypotField) {
              setHoneypotFieldName(data.honeypotField);
            }
          })
          .catch((err) => console.warn(err));

        setTimeout(() => {
          setStatus('idle');
          setFormData({ name: '', email: '', message: '' });
          setHoneypotValue('');
        }, 3000);
      } else {
        console.error('Contact submission error');
        const data = await response.json().catch(() => ({}));
        setErrorMessage(data.error || 'Ошибка! Попробуйте позже');
        setStatus('error');
        setTurnstileToken(null);
        if (turnstileRef.current) {
          turnstileRef.current.reset();
        }

        // Pre-fetch a fresh challenge on error
        fetch('/api/contact')
          .then(res => res.json())
          .then(data => {
            setChallenge(data);
            if (data.honeypotField) {
              setHoneypotFieldName(data.honeypotField);
            }
          })
          .catch((err) => console.warn(err));

        setTimeout(() => {
          setStatus('idle');
          setErrorMessage('');
        }, 4500);
      }
    } catch (e) {
      console.error('Contact submission request failed:', e);
      setStatus('error');
      setErrorMessage('Сбой соединения');
      setTurnstileToken(null);
      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }

      // Pre-fetch a fresh challenge on error
      fetch('/api/contact')
        .then(res => res.json())
        .then(data => {
          setChallenge(data);
          if (data.honeypotField) {
            setHoneypotFieldName(data.honeypotField);
          }
        })
        .catch((err) => console.warn(err));

      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 4500);
    }
  };

  const statusText = { 
    idle: 'Отправить →', 
    loading: 'Отправляю...', 
    success: '✓ Отправлено', 
    error: errorMessage || 'Ошибка! Попробуйте позже',
    validation_error: 'Заполните все поля!'
  };

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center py-24 px-6 relative z-10">
      <div className="w-full max-w-[600px] mx-auto select-none">
        <SectionLabel>/ 05 КОНТАКТ</SectionLabel>
        <h2 className="font-display text-4xl text-text mt-4">Есть что обсудить?</h2>
        <p className="font-body text-text-dim mt-3">Нужен фронтендер для сайта или приложения? Пиши!</p>
        
        <div className="mt-12 flex flex-col gap-6">
          <div className="flex flex-col">
            <input 
              type="text" 
              placeholder="Имя" 
              value={formData.name} 
              disabled={status === 'loading' || status === 'success'}
              onChange={(e) => handleInputChange('name', e.target.value)} 
              className="w-full bg-transparent border-0 border-b border-[rgba(184,173,158,0.15)] pb-3 text-text font-body focus:outline-none focus:border-accent transition-colors placeholder:text-text-muted placeholder:font-mono placeholder:text-sm rounded-none text-base"
            />
          </div>
          
          <div className="flex flex-col">
            <input 
              type="email" 
              placeholder="Email" 
              value={formData.email} 
              disabled={status === 'loading' || status === 'success'}
              onChange={(e) => handleInputChange('email', e.target.value)} 
              className="w-full bg-transparent border-0 border-b border-[rgba(184,173,158,0.15)] pb-3 text-text font-body focus:outline-none focus:border-accent transition-colors placeholder:text-text-muted placeholder:font-mono placeholder:text-sm rounded-none text-base"
            />
          </div>

          <div className="flex flex-col">
            <textarea 
              placeholder="Сообщение" 
              rows={4} 
              value={formData.message} 
              disabled={status === 'loading' || status === 'success'}
              onChange={(e) => handleInputChange('message', e.target.value)} 
              className="w-full bg-transparent border-0 border-b border-[rgba(184,173,158,0.15)] pb-3 text-text font-body focus:outline-none focus:border-accent transition-colors placeholder:text-text-muted placeholder:font-mono placeholder:text-sm resize-none rounded-none text-base"
            />
          </div>

          {/* Honeypot field - invisible to humans, irresistible to spam bots */}
          <div className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden" aria-hidden="true">
            <input 
              type="text" 
              name={honeypotFieldName} 
              value={honeypotValue} 
              tabIndex={-1}
              autoComplete="off"
              onChange={(e) => handleHoneypotChange(e.target.value)}
            />
          </div>

          {siteKey && (
            <Turnstile
              ref={turnstileRef}
              siteKey={siteKey}
              onSuccess={setTurnstileToken}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setTurnstileToken(null)}
              options={{
                theme: 'dark',
                size: 'invisible'
              }}
            />
          )}

          <button 
            onClick={handleSend} 
            disabled={status === 'loading' || status === 'success'}
            onMouseEnter={playHover}
            className="mt-6 flex items-center justify-center relative h-12 overflow-hidden border border-accent bg-transparent text-accent font-mono text-sm hover:bg-[rgba(184,173,158,0.05)] transition-colors disabled:opacity-50 cursor-pointer rounded-lg"
          >
            <AnimatePresence mode="wait">
              <motion.span 
                key={status} 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                exit={{ y: -20, opacity: 0 }} 
                transition={spring.snappy} 
                className="absolute inset-0 flex items-center justify-center font-mono"
              >
                {statusText[status]}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Telegram', handle: '@Door0S', icon: <Send className="w-4 h-4 text-accent" />, url: 'https://t.me/Door0S' },
            { label: 'GitHub', handle: 'SH20FK', icon: <Github className="w-4 h-4 text-accent" />, url: 'https://github.com/SH20FK' },
            { label: 'Last.fm', handle: 'SH20FK', icon: <Music className="w-4 h-4 text-accent" />, url: 'https://www.last.fm/user/SH20FK' },
            { label: 'Steam', handle: 'SH20FK', icon: <Gamepad2 className="w-4 h-4 text-accent" />, url: 'https://steamcommunity.com/search/users/#text=SH20FK' },
          ].map(c => (
            <a 
              href={c.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              referrerPolicy="no-referrer" 
              onMouseEnter={playHover}
              onClick={playClick}
              key={c.label} 
              className="bg-surface border border-[rgba(184,173,158,0.08)] rounded-xl px-5 py-4 flex items-center gap-4 hover:border-[rgba(184,173,158,0.2)] hover:-translate-y-0.5 transition-all text-left group cursor-pointer block duration-300"
            >
              <div className="flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">{c.icon}</div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">{c.label}</span>
                <span className="font-mono text-sm text-text mt-0.5">{c.handle}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
