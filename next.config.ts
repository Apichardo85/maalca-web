import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      { source: '/ecosistema', destination: '/casos', permanent: true },
      // /maalca era el espacio de MaalCa como si fuera un negocio cliente más: una página de
      // negocio genérica (con un servicio de prueba a $0.00) que no le decía nada a un visitante.
      // La agenda de la videollamada vive ahora en /agendar, dentro de la vitrina. No es
      // permanente a propósito: mientras se separa el espacio de los inquilinos (Fase 3) puede
      // volver a hacer falta. Solo la ruta exacta; /space/maalca (el panel) no se toca.
      { source: '/maalca', destination: '/agendar', permanent: false },
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
