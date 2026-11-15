import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { fileURLToPath } from 'node:url';
const here = path => fileURLToPath(new URL(path, import.meta.url));
export default defineConfig({
  root: here('./'), base: './', publicDir:false,
  plugins:[viteSingleFile()],
  build:{outDir:here('../output/ingilizce/oyun'),emptyOutDir:false}
});
