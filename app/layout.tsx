import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://woosenteur.fr'),
  title: {
    default: 'WooSenteur - Générateur de Fiches Produits Beauté par IA',
    template: '%s | WooSenteur'
  },
  description: 'Créez des fiches produits WooCommerce optimisées SEO pour parfums, cosmétiques et soins en 3 minutes grâce à l\'IA Gemini. Score Rank Math 83% garanti.',
  keywords: ['génération fiche produit', 'WooCommerce', 'SEO beauté', 'IA parfums', 'cosmétiques', 'e-commerce beauté', 'Rank Math', 'optimisation SEO'],
  authors: [{ name: 'WooSenteur' }],
  creator: 'WooSenteur',
  publisher: 'WooSenteur',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://woosenteur.fr',
    siteName: 'WooSenteur',
    title: 'WooSenteur - Générateur de Fiches Produits Beauté par IA',
    description: 'Générez des fiches produits WooCommerce optimisées SEO en 3 minutes. Score Rank Math 83% garanti pour parfums et cosmétiques.',
    images: [{
      url: 'https://woosenteur.fr/og-image.png',
      width: 1200,
      height: 630,
      alt: 'WooSenteur - Fiches Produits Beauté par IA'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WooSenteur - Générateur de Fiches Produits Beauté par IA',
    description: 'Générez des fiches produits WooCommerce optimisées SEO en 3 minutes',
    images: ['https://woosenteur.fr/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'votre-code-google-search-console',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://woosenteur.fr" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "WooSenteur",
              "url": "https://woosenteur.fr",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://woosenteur.fr/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 dark:from-slate-950 dark:via-violet-950 dark:to-slate-950 font-body`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Header />
            <main className="min-h-[calc(100vh-4rem)]">
              {children}
            </main>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
