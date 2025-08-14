/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    loader: 'custom',
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};
module.exports = nextConfig;
