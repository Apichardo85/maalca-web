import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to complete even with ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to complete even with TypeScript errors
    ignoreBuildErrors: true,
  },
  images: {
    // Enable image optimization for better performance
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    domains: [],
    // Keep unoptimized for SVGs only (handled in ProjectImage component)
  },
};

export default nextConfig;
