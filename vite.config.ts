import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

// İki ayrı uygulama: kart oyunu (/) ve Minik Sanatçı (/sanatci/)
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
      },
    },
  },
  test: { include: ['tests/unit/**/*.test.ts'] },
});
