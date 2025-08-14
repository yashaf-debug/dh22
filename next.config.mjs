/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    loader: 'default',
    remotePatterns: [
      { protocol: 'https', hostname: 'dh22.ru', pathname: '/r/**' },
      { protocol: 'https', hostname: 'dh22.pages.dev', pathname: '/r/**' },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },

  async redirects() {
    return [];
  },
  async rewrites() {
    const base = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE;
    return base ? [{ source: '/r/:key', destination: `${base}/:key` }] : [];
  },
};
export default nextConfig;
