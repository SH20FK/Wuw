import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Музыка',
  description:
    'Что играет прямо сейчас: скробблы, история прослушиваний, любимые артисты и топ треков из Last.fm — с настоящими обложками.',
  alternates: { canonical: '/music' },
  openGraph: {
    type: 'website',
    title: 'Музыка · SH20FK',
    description: 'Текущий трек, история прослушиваний и топ артистов из Last.fm.',
    url: '/music',
  },
};

export default function MusicLayout({ children }: { children: React.ReactNode }) {
  return children;
}