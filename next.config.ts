import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Configure both webpack and turbopack for compatibility
  webpack: (config) => {
    // Fix for react-pdf canvas issues
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
  // Turbopack configuration (required for Next.js 16)
  turbopack: {
    rules: {
      '*.pdf': {
        loaders: ['file-loader'],
      },
    },
  },
};

export default nextConfig;
