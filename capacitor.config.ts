import type { CapacitorConfig } from '@capacitor/cli';

// Minkino mağaza uygulaması (iOS / Android). Web dosyaları `npm run build:app` ile dist/'e derlenir, sonra `npx cap sync`.
// Ayrıntı: ekip/uygulama/PAKET-PLANI.md, ekip/uygulama/YAYIN-ADIMLARI.md
const config: CapacitorConfig = {
  appId: 'com.minkino.app',
  appName: 'Minkino',
  webDir: 'dist',
  backgroundColor: '#FFF4DD',
  android: {
    // WebView hata ayıklaması yalnız debug derlemede (Capacitor varsayılanı); karışık içerik yok
    allowMixedContent: false,
  },
  ios: {
    contentInset: 'never',
    backgroundColor: '#FFF4DD',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 900,
      launchAutoHide: true,
      launchFadeOutDuration: 250,
      backgroundColor: '#FFF4DD',
      showSpinner: false,
    },
  },
};

export default config;
