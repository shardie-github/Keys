import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://keys.dev';

  const routes = [
    '',
    '/what-is-keys',
    '/open-source',
    '/library',
    '/docs',
    '/governance',
    '/enterprise',
    '/about',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/library' ? 0.9 : 0.7,
  }));
}
