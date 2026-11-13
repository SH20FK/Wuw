import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Контакты',
  description:
    'Написать SH20FK: форма на сайте, Telegram @Door0S, GitHub, Last.fm и Steam. Отвечаю в течение дня.',
  alternates: { canonical: '/contact' },
  openGraph: {
    type: 'website',
    title: 'Контакты · SH20FK',
    description: 'Форма на сайте, Telegram @Door0S и другие каналы для связи.',
    url: '/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}