import type { Metadata } from 'next';
import './globals.css';
import { Hanken_Grotesk, Unbounded, JetBrains_Mono } from 'next/font/google';
import { BackgroundWrapper } from '@/components/global/BackgroundWrapper';
import SmoothScrollProvider from '@/components/global/SmoothScrollProvider';
import { NavBar } from '@/components/ui/NavBar';
import { NowPlayingFAB } from '@/components/ui/NowPlayingFAB';
import { ClientBoot } from '@/components/global/ClientBoot';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { InkBleedTransition } from '@/components/global/InkBleedTransition';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

const hanken = Hanken_Grotesk({ subsets: ['latin', 'cyrillic-ext'], variable: '--font-body' });
const unbounded = Unbounded({ subsets: ['latin', 'cyrillic'], variable: '--font-display' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'SH20FK / Frontend Developer',
  description: 'Portfolio of Alexander Salamatin (SH20FK)'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${hanken.variable} ${unbounded.variable} ${jetbrainsMono.variable}`}>
      <body suppressHydrationWarning className="font-body text-text bg-bg antialiased selection:bg-accent selection:text-bg">
        <ClientBoot />
        <CustomCursor />
        <SmoothScrollProvider>
          <BackgroundWrapper />
          <NavBar />
          <InkBleedTransition>{children}</InkBleedTransition>
          <NowPlayingFAB />
        </SmoothScrollProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
