import type { Metadata } from 'next';
import './globals.css';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { BackgroundWrapper } from '@/components/global/BackgroundWrapper';
import SmoothScrollProvider from '@/components/global/SmoothScrollProvider';
import { NavBar } from '@/components/ui/NavBar';
import { NowPlayingFAB } from '@/components/ui/NowPlayingFAB';
import { ClientBoot } from '@/components/global/ClientBoot';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { InkBleedTransition } from '@/components/global/InkBleedTransition';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'SH20FK / Frontend Developer',
  description: 'Portfolio of Alexander Salamatin (SH20FK)'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body suppressHydrationWarning className="font-body text-text bg-bg antialiased selection:bg-accent selection:text-bg">
        <ClientBoot />
        <CustomCursor />
        <SmoothScrollProvider>
          <BackgroundWrapper />
          <NavBar />
          <InkBleedTransition>{children}</InkBleedTransition>
          <NowPlayingFAB />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
