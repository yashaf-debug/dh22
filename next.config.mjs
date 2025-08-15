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
      { protocol: 'https', hostname: '**.r2.dev' },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },

  async redirects() {
    return [];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
});
