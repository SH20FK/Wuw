import type { MetadataRoute } from 'next';

const BASE = process.env.APP_URL || 'https://sh20fk.ru';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Стенды с вариантами — рабочий стол, а не контент сайта.
        disallow: ['/stand', '/stand/'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}