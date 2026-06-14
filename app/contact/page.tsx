'use client';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { spring } from '@/lib/animations';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSend = async () => {
    if (!formData.name || !formData.email || !formData.message) return;
    setStatus('loading');
    await new Promise(r => setTimeout(r, 1500));
    setStatus('success');
    setTimeout(() => { setStatus('idle'); setFormData({ name: '', email: '', message: '' }); }, 3000);
  };

  const statusText = { idle: 'Отправить →', loading: 'Отправляю...', success: '✓ Отправлено', error: 'Ошибка, попробуй снова' };

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center py-24 px-6 relative z-10">
      <div className="w-full max-w-[600px] mx-auto">
        <SectionLabel>/ 05 КОНТАКТ</SectionLabel>
        <h2 className="font-display text-4xl text-text mt-4">Есть что обсудить?</h2>
        <p className="font-body text-text-dim mt-3">Пишу код, делаю анимации. Если нужен фронтендер — давай.</p>
        <div className="mt-12 flex flex-col gap-6">
          <input type="text" placeholder="Имя" value={formData.name} onChange={(e) => setFormData(d => ({ ...d, name: e.target.value }))} className="w-full bg-transparent border-0 border-b border-[rgba(184,173,158,0.2)] pb-3 text-text font-body focus:outline-none focus:border-accent transition-colors placeholder:text-text-muted placeholder:font-mono placeholder:text-sm" />
          <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData(d => ({ ...d, email: e.target.value }))} className="w-full bg-transparent border-0 border-b border-[rgba(184,173,158,0.2)] pb-3 text-text font-body focus:outline-none focus:border-accent transition-colors placeholder:text-text-muted placeholder:font-mono placeholder:text-sm" />
          <textarea placeholder="Сообщение" rows={4} value={formData.message} onChange={(e) => setFormData(d => ({ ...d, message: e.target.value }))} className="w-full bg-transparent border-0 border-b border-[rgba(184,173,158,0.2)] pb-3 text-text font-body focus:outline-none focus:border-accent transition-colors placeholder:text-text-muted placeholder:font-mono placeholder:text-sm resize-none" />
          <button onClick={handleSend} disabled={status === 'loading' || status === 'success'} className="mt-6 flex items-center justify-center relative h-12 overflow-hidden border border-accent bg-transparent text-accent font-mono text-sm hover:bg-[rgba(184,173,158,0.05)] transition-colors disabled:opacity-50">
            <AnimatePresence mode="wait">
              <motion.span key={status} initial={{ y: 20, opacity: 0, scale: status === 'success' ? 1.2 : 1 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -20, opacity: 0 }} transition={spring.snappy} className="absolute inset-0 flex items-center justify-center font-mono">
                {statusText[status]}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Telegram', handle: '@Door0S', icon: '↗' }, { label: 'GitHub', handle: 'SH20FK', icon: '↗' },
            { label: 'Last.fm', handle: 'SH20FK', icon: '🎵' }, { label: 'Steam', handle: 'SH20FK', icon: '🎮' },
          ].map(c => (
            <div key={c.label} className="bg-surface border border-[rgba(184,173,158,0.08)] rounded-lg px-5 py-4 flex items-center gap-4 hover:border-[rgba(184,173,158,0.2)] hover:-translate-y-0.5 transition-all text-left group cursor-pointer">
              <div className="text-accent text-lg flex items-center justify-center group-hover:scale-110 transition-transform">{c.icon}</div>
              <div className="flex flex-col">
                <span className="font-mono text-xs text-text-muted">{c.label}</span>
                <span className="font-mono text-sm text-text">{c.handle}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
