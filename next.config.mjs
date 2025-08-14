import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  images: {
    loader: 'default',
    remotePatterns: [
      { protocol: 'https', hostname: 'dh22.ru', pathname: '/i/**' },
      { protocol: 'https', hostname: 'dh22.pages.dev', pathname: '/i/**' },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },

  async redirects() {
    return [];
  },
  async rewrites() {
    const base = process.env.NEXT_PUBLIC_CF_IMAGES_BASE;
    return base ? [{ source: '/i/:id', destination: `${base}/:id/public` }] : [];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
});
