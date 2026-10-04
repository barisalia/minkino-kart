import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '.',
  timeout: 900_000,
  workers: 1,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4310/', locale: 'tr-TR', deviceScaleFactor: 1, isMobile: true, hasTouch: true },
  webServer: {
    command: 'npx vite build && npx vite preview --port 4310 --strictPort',
    url: 'http://localhost:4310/',
    reuseExistingServer: true,
    timeout: 240_000,
  },
});
