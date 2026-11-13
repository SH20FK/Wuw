'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { spring } from '@/lib/animations';
import { useEffect, useState } from 'react';

const LINKS = [
  { name: 'About', href: '/#about' },
  { name: 'Work', href: '/work' },
  { name: 'Music', href: '/music' },
  { name: 'Contact', href: '/contact' },
];

export function NavBar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const format = () => {
      try {
        return new Intl.DateTimeFormat('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Yekaterinburg',
        }).format(new Date());
      } catch {
        return '';
      }
    };
    setTime(format());
    const id = setInterval(() => setTime(format()), 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-500 ease-out ${
        scrolled
          ? 'border-[rgba(184,173,158,0.08)] bg-[rgba(14,12,15,0.72)] backdrop-blur-xl'
          : 'border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 sm:h-[68px]">
        <Link
          href="/"
          aria-label="SH20FK — на главную"
          className="font-brand text-[13px] font-black tracking-tight text-accent"
        >
          [SH20FK]
        </Link>

        <nav aria-label="Основная навигация">
          <ul className="flex items-center gap-4 sm:gap-7">
            {LINKS.map((link) => {
              const active =
                pathname === link.href || (pathname === '/' && link.href === '/#about' && scrolled);

              return (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={`relative inline-flex items-baseline gap-1.5 font-body text-[13px] leading-none transition-colors duration-300 ${
                      active ? 'text-accent' : 'text-text-dim hover:text-text'
                    }`}
                  >
                    <span>{link.name}</span>
                    {active && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-[7px] left-0 right-0 h-px bg-accent"
                        transition={spring.snappy}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-text-muted sm:flex">
          <span>Челябинск</span>
          <span className="h-3 w-px bg-[rgba(184,173,158,0.18)]" />
          <span className="text-text-dim tabular-nums">{time || '--:--'}</span>
        </div>
      </div>
    </header>
  );
}