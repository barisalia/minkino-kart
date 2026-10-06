import { rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnv, type Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

// Ayrı uygulamalar: ana menü (/), kart oyunu (/kartlar/), Çiz Canlansın (/canlan/), Uyuyan Orman (/orman/),
// Mino'nun Pazarı (/pazar/), Mino'nun Pasta Otobüsü (/pasta/), Okula Hazırım! (/okul/) …; /uygulama/ eski menü adresi, köke yönlendirir;
// /gizlilik/ ve /sartlar/ mağazaların istediği sade sayfalar.
const SAYFALAR = {
  menu: 'index.html',
  kartlar: 'kartlar/index.html',
  canlan: 'canlan/index.html',
  sesTesti: 'ses-testi/index.html',
  orman: 'orman/index.html',
  macera: 'macera/index.html',
  pazar: 'pazar/index.html',
  pasta: 'pasta/index.html',
  okul: 'okul/index.html',
  dedektif: 'dedektif/index.html',
  giysin: 'giysin/index.html',
  film: 'film/index.html',
  uygulama: 'uygulama/index.html',
  gizlilik: 'gizlilik/index.html',
  sartlar: 'sartlar/index.html',
} as const;

/**
 * Uygulama derlemesi (`npm run build:app` = `vite build --mode uygulama`, Capacitor'ın webDir'i dist/):
 * - Mikrofon testi ve Uyuyan Orman uygulamaya girmez;
 *   eski /uygulama/ yönlendirmesi ve gizlilik/şartlar sayfaları da (bağlantılar web sitesine gider).
 * - Her sayfanın başına uygulama kabuğu (src/kabuk/yerel.ts) eklenir: kayıtlar, arka plan, ekran yönü.
 */
const UYGULAMADA_YOK = ['sesTesti', 'orman', 'uygulama', 'gizlilik', 'sartlar'];
/** public/ altından uygulamaya girmeyenler (ses karşılaştırma örnekleri) */
const UYGULAMADA_YOK_DOSYA = ['ses-ornek', 'ses-deneme.html'];

function uygulamaKabugu(): Plugin {
  return {
    name: 'minkino-uygulama-kabugu',
    transformIndexHtml: {
      order: 'pre',
      // sayfa geçişlerinde ve açılışta beyaz parlama olmasın: zemin açılış ekranının kremi (capacitor.config.ts ile aynı)
      handler: (html) =>
        html.replace(/<head>/i, '<head>\n    <style>html,body{background:#FFF4DD}</style>\n    <script type="module" src="/src/kabuk/yerel.ts"></script>'),
    },
    closeBundle() {
      for (const d of UYGULAMADA_YOK_DOSYA) rmSync(resolve(__dirname, 'dist', d), { recursive: true, force: true });
    },
  };
}

export default defineConfig(({ mode }) => {
  const uygulama = mode === 'uygulama';
  // RevenueCat public SDK anahtarları: yalnız uygulama derlemesine, ortam değişkeninden (ya da .env.uygulama)
  const env = uygulama ? { ...loadEnv(mode, __dirname, 'REVENUECAT_'), ...process.env } : {};
  const input = Object.fromEntries(
    Object.entries(SAYFALAR)
      .filter(([ad]) => !uygulama || !UYGULAMADA_YOK.includes(ad))
      .map(([ad, yol]) => [ad, resolve(__dirname, yol)]),
  );
  return {
    base: './',
    plugins: uygulama ? [uygulamaKabugu()] : [],
    define: {
      __REVENUECAT_IOS_KEY__: JSON.stringify(env.REVENUECAT_IOS_KEY ?? ''),
      __REVENUECAT_ANDROID_KEY__: JSON.stringify(env.REVENUECAT_ANDROID_KEY ?? ''),
    },
    build: {
      outDir: 'dist',
      assetsInlineLimit: 2048,
      target: 'es2020',
      rollupOptions: { input },
    },
    test: { include: ['tests/unit/**/*.test.ts'] },
  };
});
