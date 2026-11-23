/**
 * Geliştirme sunucusuna (npm run dev, :5173) karşı hızlı e2e: derleme beklemeden tek oyunu baştan sona oynatmak için.
 * Kullanım: npx playwright test -c playwright.gelistirme.config.ts tests/e2e/dedektif.spec.ts --project=ipad-yatay
 * Asıl denetim yine playwright.config.ts (derlenmiş paket) ile yapılır.
 */
import { defineConfig } from '@playwright/test';
import asil from './playwright.config';

export default defineConfig({
  ...asil,
  use: { ...asil.use, baseURL: process.env.E2E_ADRES ?? 'http://localhost:5173/' },
  webServer: undefined,
  projects: [
    ...(asil.projects ?? []),
    // iPad yatay (4:3) ve yatay telefon (uygulamada telefonlar yatay kilitli)
    { name: 'ipad-yatay', use: { viewport: { width: 1024, height: 768 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } },
    { name: 'telefon-yatay', use: { viewport: { width: 844, height: 390 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } },
  ],
});
