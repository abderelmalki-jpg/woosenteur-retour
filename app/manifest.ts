import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'WooSenteur - Générateur Fiches Produits Beauté IA',
    short_name: 'WooSenteur',
    description: 'Générez des fiches produits WooCommerce optimisées SEO pour parfums et cosmétiques en 3 minutes',
    start_url: '/',
    display: 'standalone',
    background_color: '#7C3AED',
    theme_color: '#7C3AED',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['business', 'productivity'],
    lang: 'fr',
  };
}
