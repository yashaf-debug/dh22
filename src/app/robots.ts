import type { MetadataRoute } from 'next';

export const runtime = 'edge';

const BASE_URL = 'https://dh22.ru';
const HOST = new URL(BASE_URL).host;

export default function robots(): MetadataRoute.Robots {
  return {
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
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: HOST,
  };
}
