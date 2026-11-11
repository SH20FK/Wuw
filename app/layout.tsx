import type { Metadata } from 'next';
import './globals.css';
import { Montserrat_Alternates, Unbounded, Golos_Text, IBM_Plex_Mono } from 'next/font/google';
import { BackgroundWrapper } from '@/components/global/BackgroundWrapper';
import SmoothScrollProvider from '@/components/global/SmoothScrollProvider';
import { NavBar } from '@/components/ui/NavBar';
import { NowPlayingFAB } from '@/components/ui/NowPlayingFAB';
import { ClientBoot } from '@/components/global/ClientBoot';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { InkBleedTransition } from '@/components/global/InkBleedTransition';
import { AccentSplash } from '@/components/global/AccentSplash';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

const montserrat = Montserrat_Alternates({
  subsets: ['latin', 'cyrillic'],
  weight: ['700', '800', '900'],
  variable: '--font-display',
});
const unbounded = Unbounded({ subsets: ['latin', 'cyrillic'], variable: '--font-brand' });
const golos = Golos_Text({ subsets: ['latin', 'cyrillic'], variable: '--font-body' });
const plexMono = IBM_Plex_Mono({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || 'https://sh20fk.ru'),
  title: 'SH20FK / Frontend Developer',
  description: 'Portfolio of Alexander Salamatin (SH20FK)'
};

/** Applies the stored track colour before first paint so navigation never flashes the brand accent. */
const ACCENT_BOOT = `(function(){try{var c=localStorage.getItem('SH20FK_accent');if(!c)return;var r=217,g=119,b=87;if(c.indexOf('rgb')===0){var p=c.match(/\\d+/g);if(p&&p.length>=3){r=+p[0];g=+p[1];b=+p[2];}}else if(c.charAt(0)==='#'){var h=c.slice(1);if(h.length===6){r=parseInt(h.slice(0,2),16);g=parseInt(h.slice(2,4),16);b=parseInt(h.slice(4,6),16);}}var sr=Math.floor(r*0.75),sg=Math.floor(g*0.65),sb=Math.floor(b*0.55);var s=document.documentElement.style;s.setProperty('--color-accent',c);s.setProperty('--accent-rgb',r+' '+g+' '+b);s.setProperty('--color-accent-glow','rgba('+r+','+g+','+b+',0.08)');s.setProperty('--color-accent-sub','rgb('+sr+','+sg+','+sb+')');s.setProperty('--accent-sub-rgb',sr+' '+sg+' '+sb);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${golos.variable} ${montserrat.variable} ${unbounded.variable} ${plexMono.variable}`}>
      <body suppressHydrationWarning className="font-body text-text bg-bg antialiased selection:bg-accent selection:text-bg">
        <script dangerouslySetInnerHTML={{ __html: ACCENT_BOOT }} />
        <ClientBoot />
        <CustomCursor />
        <SmoothScrollProvider>
          <BackgroundWrapper />
          <NavBar />
          <InkBleedTransition>{children}</InkBleedTransition>
          <AccentSplash />
          <NowPlayingFAB />
        </SmoothScrollProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
