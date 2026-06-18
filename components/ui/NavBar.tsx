'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { spring } from '@/lib/animations';
import { useEffect, useState } from 'react';
import { Magnetic } from './Magnetic';
import useLastFmStore from '@/store/useLastFmStore';
import { useSfx } from '@/lib/useSfx';
import { Volume2, VolumeX } from 'lucide-react';

const LINKS = [
  { name: 'About', href: '/#about' },
  { name: 'Work', href: '/work' },
  { name: 'Music', href: '/music' },
  { name: 'Contact', href: '/contact' },
];

export function NavBar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { soundEnabled, toggleSound } = useLastFmStore();
  const { playClick, playHover } = useSfx();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll(); // Run immediately on mount to establish the correct state
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSoundToggle = () => {
    if (!soundEnabled) {
      setTimeout(() => {
        playClick();
      }, 50);
    } else {
      playClick();
    }
    toggleSound();
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-500 ease-out ${scrolled ? 'backdrop-blur-xl bg-[rgba(14,12,15,0.73)] border-[rgba(184,173,158,0.08)]' : 'backdrop-blur-none bg-transparent border-transparent'}`}>
      <div className="max-w-[1200px] mx-auto py-4 px-4 sm:px-8 flex items-center justify-between">
        <Magnetic>
          <Link href="/" className="font-mono text-accent inline-block p-1">[SH20FK]</Link>
        </Magnetic>
        <div className="flex items-center gap-1.5 sm:gap-4 md:gap-6">
          <div className="flex items-center gap-1 sm:gap-2 md:gap-5">
            {LINKS.map((link) => {
              const isActive = pathname === link.href || (pathname === '/' && link.href === '/#about' && scrolled);
              return (
                <Magnetic key={link.name}>
                  <Link href={link.href} className="relative group font-body text-xs md:text-sm text-text-dim hover:text-accent transition-colors block py-0.5 px-1.5 sm:py-1 sm:px-2">
                    {link.name}
                    {isActive && (
                      <motion.div layoutId="underline" className="absolute -bottom-1 left-0 right-0 h-[1px] bg-accent origin-left" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={spring.snappy} />
                    )}
                  </Link>
                </Magnetic>
              );
            })}
          </div>

          <div className="w-[1px] h-3 bg-[rgba(184,173,158,0.15)] mx-0.5 sm:mx-1" />

          <Magnetic>
            <button
              onClick={handleSoundToggle}
              onMouseEnter={playHover}
              className="relative group font-mono text-[10px] uppercase tracking-wider text-text-dim hover:text-accent transition-colors flex items-center gap-1.5 py-1 px-2 cursor-pointer bg-transparent border-none outline-none"
              title={soundEnabled ? "Mute UI sounds" : "Unmute UI sounds"}
            >
              <span className="flex items-center justify-center shrink-0">
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </span>
              <span className="hidden xs:inline">{soundEnabled ? 'sound' : 'mute'}</span>
            </button>
          </Magnetic>
        </div>
      </div>
    </nav>
  );
}
