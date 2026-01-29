/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  poweredByHeader: false,
  
  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      if (!isServer) {
        if (process.env.ANALYZE === 'true') {
          const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
          config.plugins.push(
            new BundleAnalyzerPlugin({
              analyzerMode: 'server',
              analyzerPort: 8888,
              openAnalyzer: true,
            })
          );
        }
        
        config.resolve.alias = {
          ...config.resolve.alias,
          moment$: 'moment/moment.js',
        };
      }
    }
    
    return config;
  },
};

export default nextConfig; 