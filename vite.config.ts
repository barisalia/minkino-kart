import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './',
  build: { outDir: 'dist', assetsInlineLimit: 2048, target: 'es2020' },
  test: { include: ['tests/unit/**/*.test.ts'] },
});
