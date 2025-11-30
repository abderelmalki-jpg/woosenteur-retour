import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // Commenté pour permettre API routes serveur (development)
  images: {
    unoptimized: true,
  },
  turbopack: {},
};

export default nextConfig;
