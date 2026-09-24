import { existsSync } from 'node:fs';
import { defineConfig } from '@playwright/test';

// Bulut geliştirme ortamında önceden kurulu Chromium'u kullan
const yerelChromium = '/opt/pw-browsers/chromium';
const launchOptions = existsSync(yerelChromium) ? { executablePath: yerelChromium } : {};

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 120_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173/',
    launchOptions,
    locale: 'tr-TR',
  },
  projects: [
    { name: 'iphone', use: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } },
    { name: 'ipad', use: { viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: 'npx vite build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173/',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
