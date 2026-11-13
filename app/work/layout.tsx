import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Работы',
  description:
    'Проекты SH20FK: мобильное приложение NiosMess на Flutter и мод Project3 для Minecraft на Fabric. Стек, год и ссылки.',
  alternates: { canonical: '/work' },
  openGraph: {
    type: 'website',
    title: 'Работы · SH20FK',
    description: 'Проекты SH20FK: NiosMess на Flutter и мод Project3 для Minecraft.',
    url: '/work',
  },
};

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return children;
}