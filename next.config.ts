import type { NextConfig } from "next";

// Export statique pour Firebase Hosting et Capacitor
const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  turbopack: {},
  trailingSlash: true,
};

export default nextConfig;
