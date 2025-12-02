import type { NextConfig } from "next";

// Mode export pour Capacitor (build Android uniquement)
// Pour web: utiliser Firebase App Hosting (SSR)
const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true';

const nextConfig: NextConfig = {
  ...(isCapacitorBuild && { output: 'export' }),
  images: {
    unoptimized: isCapacitorBuild, // Optimisé sur App Hosting
  },
  turbopack: {},
  trailingSlash: true,
  // Headers SEO uniquement pour build web (incompatible avec export)
  ...(!isCapacitorBuild && {
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
  }),
};

export default nextConfig;
