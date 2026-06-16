'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { spring } from '@/lib/animations';
import { useEffect, useState } from 'react';
import { Magnetic } from './Magnetic';

const LINKS = [
  { name: 'About', href: '/#about' },
  { name: 'Work', href: '/work' },
  { name: 'Music', href: '/music' },
  { name: 'Contact', href: '/contact' },
];

export function NavBar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${scrolled ? 'backdrop-blur-[20px] bg-[rgba(14,12,15,0.7)] border-b border-[rgba(184,173,158,0.08)]' : ''}`}>
      <div className="max-w-[1200px] mx-auto py-4 px-8 flex items-center justify-between">
        <Magnetic>
          <Link href="/" className="font-mono text-accent inline-block p-1">[SH20FK]</Link>
        </Magnetic>
        <div className="flex items-center gap-5 md:gap-8">
          {LINKS.map((link) => {
            const isActive = pathname === link.href || (pathname === '/' && link.href === '/#about' && scrolled);
            return (
              <Magnetic key={link.name}>
                <Link href={link.href} className="relative group font-body text-xs md:text-sm text-text-dim hover:text-accent transition-colors block py-1 px-2">
                  {link.name}
                  {isActive && (
                    <motion.div layoutId="underline" className="absolute -bottom-1 left-0 right-0 h-[1px] bg-accent origin-left" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={spring.snappy} />
                  )}
                </Link>
              </Magnetic>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
