// Tek dosyalık sürüm (tüm görseller, fontlar ve kod tek HTML içinde) — önizleme paylaşımı için.
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
  // Kartlar oyunu (ana menü kökte ama diğer sayfalara bağlandığı için tek dosyaya uygun değil)
  build: { outDir: 'dist-tek', assetsInlineLimit: 100_000_000, target: 'es2020', rollupOptions: { input: 'kartlar/index.html' } },
});
