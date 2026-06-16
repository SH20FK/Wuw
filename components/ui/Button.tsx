'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { spring } from '@/lib/animations';
import { useSfx } from '@/lib/useSfx';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'filled' | 'outlined';
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function Button({ children, variant = 'filled', href, onClick, className = '' }: ButtonProps) {
  const { playHover, playClick } = useSfx();
  const baseClasses = "relative inline-flex items-center justify-center font-mono text-sm px-6 py-3 cursor-pointer overflow-hidden group";
  const variants = {
    filled: "bg-accent text-bg",
    outlined: "border border-accent text-accent bg-transparent"
  };
  const inner = (
    <>
      <span className="relative z-10 transition-colors duration-300 group-hover:text-bg">{children}</span>
      {variant === 'outlined' && (
        <motion.div className="absolute inset-0 bg-accent origin-bottom" initial={{ scaleY: 0 }} whileHover={{ scaleY: 1 }} transition={spring.snappy} />
      )}
      {variant === 'filled' && (
        <motion.div className="absolute inset-0 bg-surface origin-bottom" initial={{ scaleY: 0 }} whileHover={{ scaleY: 1 }} transition={spring.snappy} />
      )}
    </>
  );

  const handleOnClick = () => {
    playClick();
    onClick?.();
  };

  if (href) return (
    <Link 
      href={href} 
      onMouseEnter={playHover} 
      onClick={handleOnClick} 
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {inner}
    </Link>
  );
  return (
    <button 
      onMouseEnter={playHover} 
      onClick={handleOnClick} 
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {inner}
    </button>
  );
}
