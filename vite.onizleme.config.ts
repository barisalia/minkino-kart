import { defineConfig, mergeConfig } from 'vite';
import minkinoConfig from './vite.config';

/** Yalnız yeni geliştirme oturumları: mevcut film/oyun sunucularını yeniden başlatmaz. */
export default defineConfig((env) => mergeConfig(minkinoConfig(env), {
  server: {
    port: 5173,
    // İkinci npm run dev, sessizce başka portta aynı projeyi tekrar izlemeye başlamasın.
    strictPort: true,
    watch: {
      // Üretim çıktıları HTTP üzerinden sunulabilir; uygulamanın sıcak yenileme listesine alınmaz.
      ignored: ['**/ekip/**', '**/output/**', '**/tests/screens/**', '**/test-results/**', '**/playwright-report/**'],
    },
  },
}));
