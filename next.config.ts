import type { NextConfig } from "next";

// Mode export pour Capacitor (build Android uniquement)
// Désactivé par défaut pour permettre les routes API en dev/web
const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true';

const nextConfig: NextConfig = {
  ...(isCapacitorBuild && { output: 'export' }),
  images: {
    unoptimized: true,
  },
  turbopack: {},
  trailingSlash: true,
  // SEO Configuration
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
        ],
      },
    ];
  },
};

export default nextConfig;
