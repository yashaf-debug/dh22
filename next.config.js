/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.dh22.ru' },
      { protocol: 'https', hostname: 'static.dh22.ru' },
    ],
  },
};
module.exports = nextConfig;
