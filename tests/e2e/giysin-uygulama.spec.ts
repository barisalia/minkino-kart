/**
 * Kino Ne Giysin? uygulama derlemesinde (Capacitor benzeri sunucu): `npm run build:app` çıktısı (dist/) klasör
 * adreslerini index.html'e çözmeyen, bilinmeyen her yolu kökteki index.html'e düşüren bir sunucudan açılır.
 * Menüdeki karta dokunulur (adres açıkça .../index.html olmalı, yoksa menüye düşer), oda açılır, perde, dolap; dış
 * sahne ve albüm resimleri yerelde. Yalnız UYGULAMA_DIST verilince koşar (ör. UYGULAMA_DIST=dist, build:app'ten sonra).
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { expect, test } from '@playwright/test';

const KOK = process.env.UYGULAMA_DIST ? resolve(process.env.UYGULAMA_DIST) : '';
const PORT = 4332;
const TUR: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};
let sunucu: Server | null = null;

test.skip(!KOK || !existsSync(join(KOK, 'index.html')), 'UYGULAMA_DIST (build:app çıktısı) yok');

test.beforeAll(async () => {
  sunucu = createServer((istek, yanit) => {
    const yol = decodeURIComponent(new URL(istek.url ?? '/', 'http://x').pathname);
    let dosya = normalize(join(KOK, yol));
    if (!dosya.startsWith(KOK) || !existsSync(dosya) || statSync(dosya).isDirectory()) dosya = join(KOK, 'index.html');
    yanit.writeHead(200, { 'content-type': TUR[extname(dosya)] ?? 'application/octet-stream' });
    createReadStream(dosya).pipe(yanit);
  });
  await new Promise<void>((r) => sunucu!.listen(PORT, r));
});
test.afterAll(() => new Promise<void>((r) => (sunucu ? sunucu.close(() => r()) : r())));

test('Uygulama derlemesi: menüden Kino Ne Giysin? açılır (kış ücretsiz), oda, dış sahne, albüm', async ({ page }) => {
  test.skip(test.info().project.name !== 'iphone', 'bir kez yeter');
  const sorunlar: string[] = [];
  page.on('console', (m) => m.type() === 'error' && sorunlar.push(`konsol: ${m.text()}`));
  page.on('pageerror', (e) => sorunlar.push(`hata: ${String(e)}`));
  page.on('response', (r) => r.status() >= 400 && sorunlar.push(`${r.status()} ${r.url()}`));
  await page.goto(`http://localhost:${PORT}/index.html?test=1&uygulama=ios`);
  const kart = page.locator('.ug-kart[data-oyun="giysin"]');
  await expect(kart).toHaveAttribute('href', /giysin\/index\.html$/);
  // ilk mevsim ücretsiz: kilit yok
  await expect(kart.locator('.mk-kilit')).toHaveCount(0);
  await kart.click();
  await expect(page).toHaveURL(/giysin\/index\.html/);
  await expect(page.locator('.gy-ekran')).toHaveCount(1);
  await expect.poll(() => page.locator('.gy-ekran').getAttribute('data-adim'), { timeout: 20_000 }).toBe('perde');
  await page.locator('.gy-pencere').click({ force: true });
  await expect.poll(() => page.locator('.gy-ekran').getAttribute('data-adim'), { timeout: 20_000 }).toBe('dolap');
  await page.locator('.gy-dolap').click({ force: true });
  await expect.poll(() => page.locator('.gy-ekran').getAttribute('data-adim'), { timeout: 20_000 }).toBe('giyin');
  await page.waitForTimeout(500);
  const bozuk = () => page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute('src')).map((i) => i.src));
  expect(await bozuk()).toEqual([]);
  await page.screenshot({ path: 'tests/screens/giysin-uygulama.png' });
  // dış sahne ve albüm (test kısayolu): resimler yerelde
  await page.goto(`http://localhost:${PORT}/giysin/index.html?test=1&ekran=disari`);
  await expect(page.locator('.gy-son.acik')).toHaveCount(1, { timeout: 15_000 });
  expect(await bozuk()).toEqual([]);
  await page.locator('.gy-album-dugme').click();
  await expect(page.locator('.gy-album-sayfa.kis.dolu')).toHaveCount(1);
  expect(await bozuk()).toEqual([]);
  expect(sorunlar).toEqual([]);
});
