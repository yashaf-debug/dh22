import type { MetadataRoute } from 'next';

import { SITE } from '@/lib/seo';

export const runtime = 'edge';

const BASE_URL = SITE.url;
const HOST = SITE.domain;

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
