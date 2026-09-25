import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

// Ayrı uygulamalar: kart oyunu (/), Minik Sanatçı (/sanatci/), Çiz Canlansın (/canlan/)
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 2048,
    target: 'es2020',
    rollupOptions: {
      input: {
        kartlar: resolve(__dirname, 'index.html'),
        sanatci: resolve(__dirname, 'sanatci/index.html'),
        canlan: resolve(__dirname, 'canlan/index.html'),
      },
    },
  },
  test: { include: ['tests/unit/**/*.test.ts'] },
});
