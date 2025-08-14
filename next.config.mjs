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
  async redirects() {
    return [
      { source: '/delivery', destination: '/legal/delivery', permanent: true },
      { source: '/returns', destination: '/legal/returns', permanent: true },
      { source: '/privacy', destination: '/legal/privacy', permanent: true },
      { source: '/terms', destination: '/legal/terms', permanent: true },
      { source: '/oferta', destination: '/legal/oferta', permanent: true },
    ];
  },
  async rewrites() {
    const base = process.env.NEXT_PUBLIC_CF_IMAGES_BASE;
    return base ? [{ source: '/i/:id', destination: `${base}/:id/public` }] : [];
  },
};
export default nextConfig;
