import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'fr.woosenteur.app',
  appName: 'WooSenteur',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    hostname: 'woosenteur.fr'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#7C3AED', // Violet thème WooSenteur
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      spinnerColor: '#FFFFFF'
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#7C3AED'
    }
  }
};

export default config;
