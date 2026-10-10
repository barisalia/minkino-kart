import { expect, test } from '@playwright/test';
import { hataTopla } from './yardimci';

/**
 * Kino ve Ailesi (Seri 2): aynı bölüm dosyası iki çıktı verir.
 * - Uygulama oynatıcısı (/film/?seri2=bolum-01, menüde yok): kapak → oynat → duraklat, altyazı, ilerleme, çıkış.
 * - Önizleme / YouTube kayıt sayfası (/film/bolum.html): yalnız geliştirme sunucusunda (FILM2_GELISTIRME=1).
 */
test('Seri 2 bölümü uygulamada canlı oynar: duraklat, altyazı, ilerleme cihazda', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.setViewportSize(info.project.name === 'iphone' ? { width: 844, height: 390 } : { width: 1024, height: 768 });
  await page.goto('film/?seri2=bolum-01');
  const ekran = page.locator('.f2-ekran');
  await expect(ekran).toHaveAttribute('data-durum', 'kapak', { timeout: 30_000 });
  // canvas kadraja oturdu (16:9) ve çizildi
  const kutu = (await page.locator('.f2-tuval').boundingBox())!;
  expect(Math.abs(kutu.width / kutu.height - 16 / 9)).toBeLessThan(0.02);
  await page.locator('.fl-oynat').click();
  await expect(ekran).toHaveAttribute('data-durum', 'oynuyor');
  await expect.poll(() => page.evaluate(() => window.seri2!.saat()), { timeout: 15_000 }).toBeGreaterThan(1.5);
  // canvas boş değil: ortadaki piksel zeminin koyu rengi değil (açılış sahnesi çiziliyor)
  const dolu = await page.evaluate(() => {
    const c = document.querySelector<HTMLCanvasElement>('.f2-tuval')!;
    const d = c.getContext('2d')!.getImageData(c.width / 2, c.height / 2, 1, 1).data;
    return d[0] + d[1] + d[2] > 120;
  });
  expect(dolu).toBe(true);
  await page.screenshot({ path: `tests/screens/${info.project.name}-seri2-oynuyor.png` });
  // altyazı kapat / aç
  const altyazi = page.getByRole('button', { name: 'Altyazı' });
  await altyazi.click();
  await expect(altyazi).toHaveAttribute('aria-pressed', 'false');
  await altyazi.click();
  await expect(altyazi).toHaveAttribute('aria-pressed', 'true');
  // duraklat: saat durur, ilerleme kaydedilir
  await page.getByRole('button', { name: 'Duraklat' }).click();
  await expect(ekran).toHaveAttribute('data-durum', 'durdu');
  const t1 = await page.evaluate(() => window.seri2!.saat());
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => window.seri2!.saat())).toBe(t1);
  const kayit = await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-film2-v1') ?? '{}'));
  expect(kayit['bolum-01'].t).toBeGreaterThan(1);
  // çıkış: Çizgi Filmler listesi
  await page.getByRole('button', { name: 'Çizgi Filmler' }).first().click();
  await expect(page.locator('.f2-ekran')).toHaveCount(0);
  expect(hatalar).toEqual([]);
});

test('bölüm önizleme sayfası: dosya hatasız, eksikler listeli, kapak kurulur', async ({ page }) => {
  test.skip(!process.env.FILM2_GELISTIRME, 'önizleme sayfası yalnız geliştirme sunucusunda (FILM2_GELISTIRME=1)');
  const hatalar = hataTopla(page);
  await page.setViewportSize({ width: 1280, height: 780 });
  await page.goto('film/bolum.html?parca=s4');
  await expect(page.locator('#film2')).toHaveAttribute('data-durum', 'hazir', { timeout: 60_000 });
  expect(await page.evaluate(() => window.film2!.hatalar())).toEqual([]);
  const eksik = await page.evaluate(() => window.film2!.eksikler());
  expect(eksik.some((e) => e.startsWith('görsel: albüm fotoğrafı'))).toBe(true);
  // Sahne 4'ün sesleri geldi: eksik listesinde s4 sesi yok
  expect(eksik.filter((e) => e.startsWith('ses: b01-s4'))).toEqual([]);
  await page.goto('film/bolum.html?kapak=1');
  await page.waitForFunction(() => window.film2Kapak);
  await page.evaluate(() => window.film2Kapak!.hazir);
  const png = await page.evaluate(() => window.film2Kapak!.png());
  expect(png.length).toBeGreaterThan(100_000);
  expect(hatalar).toEqual([]);
});
