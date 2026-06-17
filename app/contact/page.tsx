'use client';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { spring } from '@/lib/animations';
import { Github, Music, Gamepad2, Send, RotateCcw, Sparkles } from 'lucide-react';
import { useSfx } from '@/lib/useSfx';

type Phase = 'idle' | 'folding' | 'sealed' | 'swooshing' | 'success' | 'error';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [phase, setPhase] = useState<Phase>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const { playHover, playClick, playType, playFold, playSwoosh } = useSfx();

  const handleInputChange = (field: 'name' | 'email' | 'message', val: string) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    playType();
  };

  const handleSend = async () => {
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMsg('Пожалуйста, заполните все поля!');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    // Phase 1: Initiating the fold sequence
    setPhase('folding');
    playFold();

    // Phase 2: Fold completes, seal the envelope
    setTimeout(() => {
      setPhase('sealed');
      playClick();
    }, 1000);

    // Phase 3: The envelope swooshes off-screen
    setTimeout(() => {
      setPhase('swooshing');
      playSwoosh();
    }, 2200);

    // Wait and make the network call
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setTimeout(() => {
          setPhase('success');
        }, 2900);
      } else {
        console.error('Contact submission error');
        setTimeout(() => {
          setPhase('error');
        }, 2900);
      }
    } catch (e) {
      console.error('Contact submission request failed:', e);
      setTimeout(() => {
        setPhase('error');
      }, 2900);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', message: '' });
    setPhase('idle');
    playClick();
  };

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center py-20 px-6 relative z-10 select-none overflow-hidden">
      <div className="w-full max-w-[620px] mx-auto flex flex-col">
        <div className="mb-6">
          <SectionLabel>/ 05 КОНТАКТ</SectionLabel>
        </div>

        {/* Tactile Letter & Envelope Canvas Container */}
        <div className="relative w-full min-h-[460px] flex items-center justify-center py-8">
          <AnimatePresence mode="wait">
            
            {/* Phase IS Idle, Folding, Sealed, or Swooshing */}
            {(phase === 'idle' || phase === 'folding' || phase === 'sealed' || phase === 'swooshing') && (
              <motion.div
                key="letter-envelope-combo"
                className="relative w-full max-w-[500px] flex flex-col items-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ 
                  opacity: 1, 
                  y: phase === 'swooshing' ? -800 : 0,
                  rotate: phase === 'swooshing' ? -8 : 0,
                  scale: phase === 'swooshing' ? 0.75 : 1,
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: phase === 'swooshing' ? 150 : 100, 
                  damping: phase === 'swooshing' ? 30 : 20, 
                  mass: phase === 'swooshing' ? 1.5 : 1 
                }}
              >
                {/* 1. Envelope Sleeve Layout (Backplate) */}
                <div className="relative w-full bg-[#15131c] border border-[rgba(184,173,158,0.08)] rounded-2xl h-[330px] shadow-2xl flex flex-col justify-end p-6 overflow-hidden z-10 mt-20">
                  {/* Visual Left and Right folds of the envelope backplate */}
                  <div className="absolute inset-x-0 bottom-0 top-[40%] bg-[linear-gradient(135deg,transparent_50%,#181622_50%)] bg-[size:50%_100%] bg-no-repeat bg-left pointer-events-none opacity-40" />
                  <div className="absolute inset-x-0 bottom-0 top-[40%] bg-[linear-gradient(225deg,transparent_50%,#181622_50%)] bg-[size:50%_100%] bg-no-repeat bg-right pointer-events-none opacity-40" />
                  <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-[#110f17] to-transparent pointer-events-none" />

                  {/* Dynamic Envelope Flap Overlay */}
                  <motion.div 
                    className="absolute top-0 inset-x-0 h-[110px] bg-[#1a1824] border-b border-[rgba(184,173,158,0.12)] origin-top z-30"
                    style={{
                      clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)',
                    }}
                    animate={{
                      rotateX: (phase === 'sealed' || phase === 'swooshing') ? 180 : 0,
                      y: (phase === 'sealed' || phase === 'swooshing') ? 0 : 0,
                      filter: (phase === 'sealed' || phase === 'swooshing') ? 'brightness(0.7)' : 'brightness(1)',
                    }}
                    transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                  />

                  {/* Wax Seal Monogram */}
                  <AnimatePresence>
                    {(phase === 'sealed' || phase === 'swooshing') && (
                      <motion.div 
                        initial={{ scale: 2.2, opacity: 0, rotate: -20 }}
                        animate={{ scale: 1, opacity: 1, rotate: 12 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                        className="absolute top-[80px] left-[calc(50%-24px)] w-12 h-12 rounded-full bg-accent border-2 border-[var(--color-bg)] flex items-center justify-center shadow-xl cursor-default z-40 select-none font-mono text-[9px] text-bg font-bold tracking-tighter"
                      >
                        SH2O
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 2. Interactive Writing stationary (The Letter Paper) */}
                <motion.div
                  className="absolute inset-[8px] bottom-auto bg-[#EAE5DC] border border-[rgba(14,12,15,0.06)] rounded-xl shadow-lg p-5 sm:p-6 z-20 overflow-hidden"
                  style={{ transformOrigin: 'top center' }}
                  animate={{
                    y: phase === 'idle' ? -100 : 40,
                    scale: phase === 'idle' ? 1.0 : 0.85,
                    height: phase === 'idle' ? 'auto' : '220px',
                    opacity: phase === 'idle' ? 1.0 : 0.35,
                    rotateX: phase === 'folding' ? 45 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 90, damping: 18 }}
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[rgba(184,173,158,0.12)] border-b border-l border-[rgba(14,12,15,0.06)] flex items-center justify-center transform rotate-6 scale-90 select-none">
                    <span className="font-mono text-[10px] text-[rgba(14,12,15,0.4)] tracking-tighter">74 REG</span>
                  </div>

                  <h3 className="font-display text-xl text-[#0E0C0F] font-semibold tracking-tight mb-0.5">Оффлайн-письмо</h3>
                  <p className="font-mono text-[9px] text-[#5A5664] uppercase tracking-wider mb-6">на имя Эрика Саламатова</p>

                  <div className="flex flex-col gap-4 text-[#0E0C0F]">
                    <div>
                      <input 
                        type="text" 
                        placeholder="Ваше имя" 
                        value={formData.name} 
                        disabled={phase !== 'idle'}
                        onChange={(e) => handleInputChange('name', e.target.value)} 
                        className="w-full bg-transparent border-0 border-b border-[rgba(14,12,15,0.15)] pb-1.5 focus:border-[#0E0C0F] transition-colors focus:outline-none placeholder:text-[#5A5664]/60 placeholder:font-mono font-body text-sm rounded-none text-[#0E0C0F]" 
                      />
                    </div>
                    
                    <div>
                      <input 
                        type="email" 
                        placeholder="Ваш Email" 
                        value={formData.email} 
                        disabled={phase !== 'idle'}
                        onChange={(e) => handleInputChange('email', e.target.value)} 
                        className="w-full bg-transparent border-0 border-b border-[rgba(14,12,15,0.15)] pb-1.5 focus:border-[#0E0C0F] transition-colors focus:outline-none placeholder:text-[#5A5664]/60 placeholder:font-mono font-body text-sm rounded-none text-[#0E0C0F]" 
                      />
                    </div>

                    <div>
                      <textarea 
                        placeholder="Текст сообщения..." 
                        rows={3} 
                        value={formData.message} 
                        disabled={phase !== 'idle'}
                        onChange={(e) => handleInputChange('message', e.target.value)} 
                        className="w-full bg-transparent border-0 border-b border-[rgba(14,12,15,0.15)] pb-1 focus:border-[#0E0C0F] transition-colors focus:outline-none placeholder:text-[#5A5664]/60 placeholder:font-mono font-body text-sm resize-none rounded-none text-[#0E0C0F]" 
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between items-center border-t border-[rgba(14,12,15,0.06)] pt-4">
                    <span className="font-mono text-[8px] text-[#5A5664]">Built with integrity</span>
                    {errorMsg && (
                      <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="font-mono text-[9px] text-red-600 font-semibold">{errorMsg}</motion.span>
                    )}
                  </div>
                </motion.div>

                {/* Submit Trigger (Letter Send Wax Action Plate) */}
                {phase === 'idle' && (
                  <motion.div 
                    className="w-full mt-6 z-30"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <button 
                      onClick={handleSend}
                      disabled={phase !== 'idle'}
                      onMouseEnter={playHover}
                      className="w-full relative h-12 flex items-center justify-center border border-accent bg-transparent hover:bg-[rgba(184,173,158,0.05)] text-accent font-mono text-xs uppercase tracking-wider rounded-lg gap-2 cursor-pointer transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Отправить письмо</span>
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Phase Success - Dynamic Postal Receipt Confirmation */}
            {phase === 'success' && (
              <motion.div
                key="success-receipt"
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={spring.default}
                className="w-full max-w-[440px] bg-surface border border-[rgba(184,173,158,0.12)] p-6 rounded-2xl flex flex-col items-center text-center shadow-2xl relative"
              >
                <div className="absolute top-4 right-4 w-12 h-12 border border-accent/20 rounded-full flex items-center justify-center font-mono text-[8px] text-accent font-semibold tracking-wider uppercase rotate-12 select-none">
                  DELVD
                </div>

                <div className="w-12 h-12 bg-accent/80 text-bg rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-accent/10">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>

                <h3 className="font-display text-2xl text-text font-medium leading-snug">Письмо отправлено!</h3>
                <p className="font-body text-xs text-text-muted mt-2 max-w-[320px]">
                  Оффлайн-форма запечатана и отправлена. Эрик получит уведомление и свяжется с вами в течение пары часов.
                </p>

                {/* Digital Receipt lines */}
                <div className="w-full border-t border-b border-[rgba(184,173,158,0.06)] py-4 my-6 flex flex-col gap-2 font-mono text-[10px] text-left">
                  <div className="flex justify-between">
                    <span className="text-text-muted">ПОЛУЧАТЕЛЬ:</span>
                    <span className="text-text">Эрик Саламатов</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">СТАТУС:</span>
                    <span className="text-accent font-semibold">УСПЕШНО ДОСТАВЛЕНО</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">ВРЕМЯ ПЕРЕДАЧИ:</span>
                    <span className="text-text">{new Date().toLocaleTimeString()} UTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">ID ПАКЕТА:</span>
                    <span className="text-text truncate max-w-[150px]">{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
                  </div>
                </div>

                <button
                  onClick={resetForm}
                  onMouseEnter={playHover}
                  className="flex items-center gap-2 font-mono text-[10px] uppercase text-accent hover:underline cursor-pointer bg-transparent border-0 outline-none"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Написать ещё одно</span>
                </button>
              </motion.div>
            )}

            {/* Error Phase */}
            {phase === 'error' && (
              <motion.div
                key="error-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-[400px] bg-surface border border-red-500/20 p-6 rounded-xl flex flex-col items-center text-center shadow-lg"
              >
                <div className="w-10 h-10 border border-red-500/30 rounded-full flex items-center justify-center text-red-500 font-mono font-bold text-lg mb-4">
                  !
                </div>
                <h3 className="font-display text-xl text-text leading-tight">Произошла ошибка</h3>
                <p className="font-body text-xs text-text-dim mt-2">
                  Не удалось передать цифровую посылку. Проверьте подключение и повторите попытку.
                </p>
                <button
                  onClick={resetForm}
                  className="mt-6 flex items-center gap-1.5 font-mono text-[10px] text-accent uppercase hover:underline"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Попробовать снова</span>
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Dynamic Social Contact Blocks */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
              className="bg-surface border border-[rgba(184,173,158,0.05)] hover:border-[rgba(184,173,158,0.15)] rounded-xl px-5 py-3.5 flex items-center gap-4 transition-all duration-300 text-left cursor-pointer group"
            >
              <div className="flex items-center justify-center p-2.5 bg-bg border border-[rgba(184,173,158,0.06)] rounded-lg group-hover:scale-105 group-hover:border-accent/15 duration-300 transition-all shrink-0">
                {c.icon}
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[9px] text-text-muted uppercase tracking-wider">{c.label}</span>
                <span className="font-mono text-sm text-text mt-0.5">{c.handle}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}

