import type { MetadataRoute } from 'next';
export const runtime = 'edge'
const base =
  process.env.PUBLIC_BASE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  'https://dh22.ru';

export default function robots(): MetadataRoute.Robots {
  const host = base.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return {
    // Можно добавить несколько правил (включая запреты для AI-ботов)
    rules: [
      { userAgent: '*', allow: '/' },
      {
        userAgent: [
          'Amazonbot',
          'Applebot-Extended',
          'Bytespider',
          'CCBot',
          'ClaudeBot',
          'Google-Extended',
          'GPTBot',
          'meta-externalagent',
        ],
        disallow: '/',
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host,
  };
}
