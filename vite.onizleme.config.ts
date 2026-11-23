import { sefOnizlemeVarliklari } from './sef/onizleme-varliklari';
import { defineConfig, mergeConfig } from 'vite';
import minkinoConfig from './vite.config';

/** Yalnız yeni geliştirme oturumları: mevcut film/oyun sunucularını yeniden başlatmaz. */
export default defineConfig((env) => mergeConfig(minkinoConfig(env), {
  plugins: [sefOnizlemeVarliklari()],
  optimizeDeps: { entries: ['index.html', '*/index.html', '!dist/**', '!android/**', '!ios/**', '!output/**', '!ekip/**'] },
  server: {
    port: 5173,
    // İkinci npm run dev, sessizce başka portta aynı projeyi tekrar izlemeye başlamasın.
    strictPort: true,
    watch: {
      // Üretim çıktıları HTTP üzerinden sunulabilir; uygulamanın sıcak yenileme listesine alınmaz.
      // '*.indiriliyor': ses üretimi sırasında yarım yazılan dosyalar (Windows'ta izleyiciyi EBUSY ile düşürüyordu)
      // 'dist-*': başka adla alınan derlemeler (dist-dedektif-yeni …) binlerce dosya yazıp sunucuyu dakikalarca meşgul ediyordu
      ignored: ['**/*.indiriliyor', '**/android/**', '**/ios/**', '**/dist/**', '**/dist-*/**','**/ekip/**', '**/output/**', '**/tests/screens/**', '**/test-results/**', '**/playwright-report/**'],
    },
  },
}));
