import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

// Ayrı uygulamalar: ana menü (/), kart oyunu (/kartlar/), Minik Sanatçı (/sanatci/), Çiz Canlansın (/canlan/), Uyuyan Orman (/orman/),
// Mino'nun Pazarı (/pazar/), Mino'nun Pasta Otobüsü (/pasta/) …; /uygulama/ eski menü adresi, köke yönlendirir
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 2048,
    target: 'es2020',
    rollupOptions: {
      input: {
        menu: resolve(__dirname, 'index.html'),
        kartlar: resolve(__dirname, 'kartlar/index.html'),
        sanatci: resolve(__dirname, 'sanatci/index.html'),
        canlan: resolve(__dirname, 'canlan/index.html'),
        sesTesti: resolve(__dirname, 'ses-testi/index.html'),
        orman: resolve(__dirname, 'orman/index.html'),
        macera: resolve(__dirname, 'macera/index.html'),
        pazar: resolve(__dirname, 'pazar/index.html'),
        pasta: resolve(__dirname, 'pasta/index.html'),
        film: resolve(__dirname, 'film/index.html'),
        uygulama: resolve(__dirname, 'uygulama/index.html'),
      },
    },
  },
  test: { include: ['tests/unit/**/*.test.ts'] },
});
