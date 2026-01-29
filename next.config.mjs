/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  poweredByHeader: false,

  // Next.js 16: Turbopack is default, add empty config to silence webpack warning
  turbopack: {},
};

export default nextConfig;
