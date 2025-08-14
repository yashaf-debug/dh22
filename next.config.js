/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    loader: 'default',
    remotePatterns: [
      { protocol: 'https', hostname: 'dh22.ru', pathname: '/i/**' },
      { protocol: 'https', hostname: 'dh22.pages.dev', pathname: '/i/**' },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
};
module.exports = nextConfig;
