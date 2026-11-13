import type { MetadataRoute } from 'next';

const BASE = (process.env.APP_URL || 'https://sh20fk.ru').replace(/\/$/, '');

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/work`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/music`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
  ];
}