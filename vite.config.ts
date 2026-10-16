import { rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnv, type Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import { KINO_OTOBUS_MENUDE, PATI_MENUDE } from './uygulama/src/oyunlar';

// Ayrı uygulamalar: ana menü (/), kart oyunu (/kartlar/), Çiz Canlansın (/canlan/), Uyuyan Orman (/orman/),
// Mino'nun Pazarı (/pazar/), Mino'nun Pasta Otobüsü (/pasta/), Dedektif Mino (/dedektif/) …; /uygulama/ eski menü adresi, köke yönlendirir;
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
  // Kino'nun Otobüsü (dondurma): menüde ve uygulama derlemesinde bayrağa bağlı (uygulama/src/oyunlar.ts →
  // KINO_OTOBUS_MENUDE; kapalıyken aşağıda UYGULAMADA_YOK); web'de /kino-otobus/ her zaman açılır
  kinoOtobus: 'kino-otobus/index.html',
  dedektif: 'dedektif/index.html',
  // Pati Dükkânı (İlk Gün dilimi): menüde değil; uygulama derlemesine PATI_MENUDE true olunca girer (uygulama/src/oyunlar.ts)
  pati: 'pati/index.html',
  giysin: 'giysin/index.html',
  // Mino Ne Giysin? · Yardımcı Mino (Kino Ne Giysin? ile bir set; menüde uygulama/src/oyunlar.ts → MINO_GIYSIN_MENUDE)
  minoGiysin: 'mino-giysin/index.html',
  film: 'film/index.html',
  // Oyunlu çizgi film (Kino ve Ailesi) deneme sayfası: yalnız web'de, menüde yok; Barış onaylayınca uygulamaya girer
  oyunlu: 'oyunlu/kinonun-bir-gunu.html',
  uygulama: 'uygulama/index.html',
  gizlilik: 'gizlilik/index.html',
  sartlar: 'sartlar/index.html',
} as const;

/**
 * Uygulama derlemesi (`npm run build:app` = `vite build --mode uygulama`, Capacitor'ın webDir'i dist/):
 * - Mikrofon testi ve Uyuyan Orman uygulamaya girmez;
 *   eski /uygulama/ yönlendirmesi ve gizlilik/şartlar sayfaları da (bağlantılar web sitesine gider).
 * - Kino'nun Otobüsü menüde değilken (oyunlar.ts → KINO_OTOBUS_MENUDE = false) sayfası da uygulamaya girmez: bitmemiş
 *   yer tutucu çizimler mağaza uygulamasında hiçbir yoldan açılamaz. Web derlemesinde /kino-otobus/ denemek için kalır.
 *   Bayrak true olunca sayfa kendiliğinden geri girer (tek satır: oyunlar.ts).
 * - Her sayfanın başına uygulama kabuğu (src/kabuk/yerel.ts) eklenir: kayıtlar, arka plan, ekran yönü.
 */
const UYGULAMADA_YOK = ['sesTesti', 'orman', 'uygulama', 'gizlilik', 'sartlar', 'oyunlu', ...(KINO_OTOBUS_MENUDE ? [] : ['kinoOtobus']), ...(PATI_MENUDE ? [] : ['pati'])];
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

/**
 * Ortak stil (src/styles/ana.css) her sayfada oyun stillerinden ÖNCE yüklensin (geliştirmedeki import sırası).
 * Derlemede ana.css birçok sayfanın ortak, JS'siz stil parçası olur ve Vite onun <link>'ini sayfanın kendi stilinden
 * SONRA yazar: '.mk-kok .ekran { display:flex }' gibi genel kurallar oyunların eşit özgüllükteki kurallarını eziyordu
 * (Pazar / Maceralar açılışı, Kino'nun Otobüsü üst çubuğu …). Burada tek yerde düzeltilir: ana'nın bağlantısı
 * sayfanın ilk stil bağlantısının önüne taşınır. Yalnız derlemede (geliştirmede sıra zaten doğru).
 */
function anaStilOnce(): Plugin {
  return {
    name: 'minkino-ana-stil-once',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler: (html, ctx) => {
        const ana = Object.values(ctx.bundle ?? {}).find(
          (d) => d.type === 'asset' && d.fileName.endsWith('.css') && (d.names ?? []).includes('ana.css'),
        );
        if (!ana) return html;
        const dosya = ana.fileName.split('/').pop()!;
        const baglantilar = [...html.matchAll(/[ \t]*<link rel="stylesheet"[^>]*>\r?\n?/g)];
        const anaBag = baglantilar.find((m) => m[0].includes(`/${dosya}"`) || m[0].includes(`"${dosya}"`));
        if (!anaBag || baglantilar[0] === anaBag) return html;
        const ilk = baglantilar[0];
        const kalan = html.slice(0, anaBag.index) + html.slice(anaBag.index! + anaBag[0].length);
        return kalan.slice(0, ilk.index) + anaBag[0] + kalan.slice(ilk.index);
      },
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
    plugins: uygulama ? [anaStilOnce(), uygulamaKabugu()] : [anaStilOnce()],
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
