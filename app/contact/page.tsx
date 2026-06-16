'use client';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { spring } from '@/lib/animations';
import { Send, Github, Music, Gamepad2 } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'validation_error'>('idle');

  const handleSend = async () => {
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('validation_error');
      setTimeout(() => setStatus('idle'), 2050);
      return;
    }
    
    setStatus('loading');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setTimeout(() => {
          setStatus('idle');
          setFormData({ name: '', email: '', message: '' });
        }, 3000);
      } else {
        console.error('Contact submission error response status:', response.status);
        setStatus('error');
        setTimeout(() => setStatus('idle'), 4000);
      }
    } catch (e) {
      console.error('Contact submission request failed:', e);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  const statusText = { 
    idle: 'Отправить →', 
    loading: 'Отправляю...', 
    success: '✓ Отправлено', 
    error: 'Ошибка! Попробуйте позже',
    validation_error: 'Заполните все поля!'
  };

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center py-24 px-6 relative z-10 animate-fade-in">
      <div className="w-full max-w-[600px] mx-auto">
        <SectionLabel>/ 05 КОНТАКТ</SectionLabel>
        <h2 className="font-display text-4xl text-text mt-4">Есть что обсудить?</h2>
        <p className="font-body text-text-dim mt-3">Нужен фронтендер для сайта или приложения? Пиши!</p>
        <div className="mt-12 flex flex-col gap-6">
          <input type="text" placeholder="Имя" value={formData.name} onChange={(e) => setFormData(d => ({ ...d, name: e.target.value }))} className="w-full bg-transparent border-0 border-b border-[rgba(184,173,158,0.2)] pb-3 text-text font-body focus:outline-none focus:border-accent transition-colors placeholder:text-text-muted placeholder:font-mono placeholder:text-sm" />
          <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData(d => ({ ...d, email: e.target.value }))} className="w-full bg-transparent border-0 border-b border-[rgba(184,173,158,0.2)] pb-3 text-text font-body focus:outline-none focus:border-accent transition-colors placeholder:text-text-muted placeholder:font-mono placeholder:text-sm" />
          <textarea placeholder="Сообщение" rows={4} value={formData.message} onChange={(e) => setFormData(d => ({ ...d, message: e.target.value }))} className="w-full bg-transparent border-0 border-b border-[rgba(184,173,158,0.2)] pb-3 text-text font-body focus:outline-none focus:border-accent transition-colors placeholder:text-text-muted placeholder:font-mono placeholder:text-sm resize-none" />
          <button onClick={handleSend} disabled={status === 'loading' || status === 'success'} className="mt-6 flex items-center justify-center relative h-12 overflow-hidden border border-accent bg-transparent text-accent font-mono text-sm hover:bg-[rgba(184,173,158,0.05)] transition-colors disabled:opacity-50">
            <AnimatePresence mode="wait">
              <motion.span key={status} initial={{ y: 20, opacity: 0, scale: status === 'success' || status === 'validation_error' ? 1.05 : 1 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -20, opacity: 0 }} transition={spring.snappy} className={`absolute inset-0 flex items-center justify-center font-mono ${status === 'validation_error' ? 'text-accent font-semibold' : ''}`}>
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
            <a href={c.url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" key={c.label} className="bg-surface border border-[rgba(184,173,158,0.08)] rounded-lg px-5 py-4 flex items-center gap-4 hover:border-[rgba(184,173,158,0.2)] hover:-translate-y-0.5 transition-all text-left group cursor-pointer block">
              <div className="flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">{c.icon}</div>
              <div className="flex flex-col">
                <span className="font-mono text-xs text-text-muted">{c.label}</span>
                <span className="font-mono text-sm text-text">{c.handle}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
