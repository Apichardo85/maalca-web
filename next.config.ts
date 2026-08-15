import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      { source: '/ecosistema', destination: '/casos', permanent: true },
    ];
  },
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
    qualities: [75, 85, 95, 100], // Required for Next.js 16
  },
  // Performance optimizations
  compress: true, // Enable Gzip compression
  poweredByHeader: false, // Remove X-Powered-By header for security
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  experimental: {
    optimizePackageImports: [], // framer-motion removed from most pages
  },
  // isomorphic-dompurify usa jsdom en el servidor, que trae dependencias (@exodus/bytes vía
  // html-encoding-sniffer) que rompen al bundlear con webpack en el build 'standalone' —
  // "require() of ES Module ... not supported". Server External Packages hace que Next las
  // cargue con require() nativo de Node en vez de intentar bundlearlas. Rompió /[slug] en
  // producción (500 en /pegote-barber y otros) el 2026-08-15 — no quitar esta línea.
  serverExternalPackages: ['isomorphic-dompurify', 'jsdom'],
  // Enable bundle analysis in production
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimize bundle size for client
      config.optimization = {
        ...config.optimization,
        usedExports: true, // Tree shaking
      };
    }
    return config;
  },
};

export default nextConfig;
