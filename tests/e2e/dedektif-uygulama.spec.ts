/**
 * Dedektif Mino uygulama derlemesinde (Capacitor benzeri sunucu): `npm run build:app` çıktısı (dist/) klasör adresleri
 * index.html'e çözmeyen, bilinmeyen her yolu kökteki index.html'e düşüren bir sunucudan açılır (Capacitor'ın yerel
 * sunucusu gibi). Vaka seçimi, Vaka 2'nin açılışı ve bir halkası, Vaka Dosyam; eksik dosya ve konsol hatası yok.
 * Yalnız UYGULAMA_DIST verilince koşar (ör. UYGULAMA_DIST=dist, build:app'ten sonra).
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { expect, test } from '@playwright/test';

const KOK = process.env.UYGULAMA_DIST ? resolve(process.env.UYGULAMA_DIST) : '';
const PORT = 4331;
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
    // Capacitor gibi: klasör adresi (…/) ya da bulunamayan yol → kökteki index.html
    if (!dosya.startsWith(KOK) || !existsSync(dosya) || statSync(dosya).isDirectory()) dosya = join(KOK, 'index.html');
    yanit.writeHead(200, { 'content-type': TUR[extname(dosya)] ?? 'application/octet-stream' });
    createReadStream(dosya).pipe(yanit);
  });
  await new Promise<void>((r) => sunucu!.listen(PORT, r));
});
test.afterAll(() => new Promise<void>((r) => (sunucu ? sunucu.close(() => r()) : r())));

test('Uygulama derlemesi: Dedektif iki vaka, Vaka 2 açılır ve oynanır, dosyalar yerelde', async ({ page }) => {
  test.skip(test.info().project.name !== 'iphone', 'bir kez yeter');
  const sorunlar: string[] = [];
  page.on('console', (m) => m.type() === 'error' && sorunlar.push(`konsol: ${m.text()}`));
  page.on('pageerror', (e) => sorunlar.push(`hata: ${String(e)}`));
  page.on('response', (r) => r.status() >= 400 && sorunlar.push(`${r.status()} ${r.url()}`));
  // uygulamada her adres açıkça index.html (src/kabuk/sayfa.ts); klasör adresi menüye düşer
  await page.goto(`http://localhost:${PORT}/dedektif/index.html?test=1&sifirla=1&cozuldu=1`);
  await expect(page.locator('.dd-klasor')).toHaveCount(2);
  await page.locator('.dd-klasor[data-vaka="vaka2"]').click();
  await expect.poll(() => page.locator('.dd-vaka').getAttribute('data-adim'), { timeout: 30_000 }).toBe('ara-ne');
  // bahçe resmi ve Vaka 2 çizimleri yüklendi (bozuk resim yok)
  await page.waitForTimeout(800);
  const bozuk = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute('src')).map((i) => i.src));
  expect(bozuk).toEqual([]);
  await page.screenshot({ path: 'tests/screens/vaka2-uygulama.png' });
  // geri: vaka seçimi; Vaka Dosyam iki vakalı
  await page.locator('.dd-vaka .dd-geri').click();
  await expect(page.locator('.dd-klasor')).toHaveCount(2);
  await page.locator('.dd-dosya-dugme').click();
  await expect(page.locator('.dd-vaka-kart[data-vaka="vaka2"]')).toHaveCount(1);
  expect(sorunlar).toEqual([]);
  // klasör adresi (index.html'siz) Capacitor'da kökün index.html'ine düşer (Dedektif açılmaz): bu yüzden uygulama
  // içindeki her adres açıkça index.html (src/kabuk/sayfa.ts); Dedektif'in kendi ekranları sayfa değiştirmez
  await page.goto(`http://localhost:${PORT}/dedektif/?test=1`);
  await expect(page.locator('.dd-klasor')).toHaveCount(0);
});
