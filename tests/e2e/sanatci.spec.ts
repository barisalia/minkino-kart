import { copyFileSync, readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { hataTopla } from './yardimci';

const SONUC = readFileSync('assets/sanatci/ornek-kedi-sonuc.webp').toString('base64');

test('Minik Sanatçı: çiz → ne çizdin → ebeveyn onayı → sihir → sonuç → galeri', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  const p = info.project.name;
  await page.route('**/sanatci/ayar.json', (r) => r.fulfill({ json: { sunucu: 'https://sahte-sihir.test' } }));
  let giden: { konu?: string; resim?: string } = {};
  await page.route('https://sahte-sihir.test/sihir', async (r) => {
    giden = JSON.parse(r.request().postData() ?? '{}');
    await r.fulfill({ json: { resim: SONUC, mime: 'image/webp' }, headers: { 'Access-Control-Allow-Origin': '*' } });
  });

  await page.goto('./sanatci/?test=1');
  await expect(page.locator('.ms-logo')).toBeVisible();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `tests/screens/${p}-20-sanatci-acilis.png` });

  await page.getByRole('button', { name: 'Çiz' }).click();
  const tuval = page.locator('.ms-tuval');
  await expect(tuval).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sihir yap' })).toBeDisabled();
  const r = (await tuval.boundingBox())!;
  // Bir kedi yüzü karalayalım
  const cember = async (cx: number, cy: number, rad: number) => {
    await page.mouse.move(r.x + cx + rad, r.y + cy);
    await page.mouse.down();
    for (let i = 1; i <= 24; i++) await page.mouse.move(r.x + cx + Math.cos((i / 24) * Math.PI * 2) * rad, r.y + cy + Math.sin((i / 24) * Math.PI * 2) * rad);
    await page.mouse.up();
  };
  await cember(r.width / 2, r.height / 2, r.width * 0.25);
  await page.locator('[data-renk="#3E9DF2"]').click();
  await cember(r.width * 0.42, r.height * 0.45, 14);
  await cember(r.width * 0.58, r.height * 0.45, 14);
  await page.screenshot({ path: `tests/screens/${p}-21-sanatci-ciz.png` });

  await page.getByRole('button', { name: 'Sihir yap' }).click();
  await expect(page.locator('.ms-konu')).toHaveCount(12);
  await page.waitForFunction(() => [...document.querySelectorAll<HTMLImageElement>('.ms-konu img')].every((i) => i.complete && i.naturalWidth > 0));
  await page.screenshot({ path: `tests/screens/${p}-22-sanatci-konu.png` });
  await page.locator('[data-konu="kedi"]').click();

  // Ebeveyn onayı kapalı (EBEVEYN_KAPISI = false): doğrudan sihir
  await expect(page.locator('.ms-karsilastir')).toBeVisible({ timeout: 10000 });
  expect(giden.konu).toBe('kedi');
  expect(giden.resim?.length).toBeGreaterThan(1000);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `tests/screens/${p}-24-sanatci-sonuc.png` });

  await page.getByRole('button', { name: 'Bastır' }).click();
  await expect(page.locator('.ms-urun')).toHaveCount(3);
  await page.screenshot({ path: `tests/screens/${p}-25-sanatci-bastir.png` });
  await page.getByRole('button', { name: 'Geri' }).click();
  await page.getByRole('button', { name: 'Galerim' }).click();
  await expect(page.locator('.ms-eser')).toHaveCount(4); // 1 yeni + 3 örnek
  await page.screenshot({ path: `tests/screens/${p}-26-sanatci-galeri.png` });
  expect(hatalar).toEqual([]);
});

test('Minik Sanatçı: kota dolu — nazik mesaj, çizim sihirli çerçevede, takılma yok', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  // 429 tarayıcı konsoluna "kaynak yüklenemedi" yazar: beklenen durum, hata sayılmaz
  page.on('console', () => undefined);
  await page.route('**/sanatci/ayar.json', (r) => r.fulfill({ json: { sunucu: 'https://sahte-sihir.test' } }));
  let bekle = true;
  await page.route('https://sahte-sihir.test/sihir', async (r) => {
    // sihir beklerken Mino değnekle büyü yapar
    while (bekle) await new Promise((c) => setTimeout(c, 50));
    await r.fulfill({ status: 429, json: { hata: 'kota' }, headers: { 'Access-Control-Allow-Origin': '*' } });
  });
  await page.goto('./sanatci/?test=1');
  await page.getByRole('button', { name: 'Çiz' }).click();
  await expect(page.locator('.ms-ciz-mino .mino')).toBeAttached();
  const r = (await page.locator('.ms-tuval').boundingBox())!;
  await page.mouse.move(r.x + 60, r.y + 80);
  await page.mouse.down();
  for (let i = 1; i <= 12; i++) await page.mouse.move(r.x + 60 + i * 18, r.y + 80 + Math.sin(i) * 40);
  await page.mouse.up();
  await expect(page.locator('.fp-katman')).toBeAttached();
  await page.getByRole('button', { name: 'Sihir yap' }).click();
  await page.locator('[data-konu="kedi"]').click();
  await expect(page.locator('.ms-sihir-mino .cy-yoldas.buyu')).toBeAttached();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `tests/screens/${info.project.name}-23-sanatci-sihir-bekleme.png` });
  bekle = false;
  await expect(page.locator('.ms-cerceve-kutu.sihirli')).toBeVisible({ timeout: 8000 });
  await expect(page.locator('.ms-sihir-cizim')).toBeVisible();
  await expect(page.locator('.ms-sihir-yazi')).toContainText('dinleniyor');
  await expect(page.locator('.ms-sihir-mino .cy-yoldas.buyu')).toHaveCount(0);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `tests/screens/${info.project.name}-23b-sanatci-kota.png` });
  await page.getByRole('button', { name: 'Yeni resim' }).click();
  await expect(page.locator('.ms-tuval')).toBeVisible();
  expect(hatalar.filter((h) => !h.includes('429'))).toEqual([]);
});

test('Minik Sanatçı: cila videosu (gerçek hız)', async ({ browser }, info) => {
  test.skip(!process.env.CILA_VIDEO || info.project.name !== 'iphone', 'video yalnız CILA_VIDEO=1 ile (telefon)');
  test.setTimeout(240_000);
  const vp = info.project.use.viewport ?? { width: 390, height: 844 };
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'tr-TR', baseURL: info.project.use.baseURL, recordVideo: { dir: 'test-results/video-sanatci', size: vp } });
  const page = await ctx.newPage();
  const hatalar = hataTopla(page);
  page.on('console', () => undefined);
  await page.route('**/sanatci/ayar.json', (r) => r.fulfill({ json: { sunucu: 'https://sahte-sihir.test' } }));
  let kota = false;
  await page.route('https://sahte-sihir.test/sihir', async (r) => {
    // sihir biraz sürer: Mino değnekle büyü yapar
    await new Promise((c) => setTimeout(c, kota ? 3000 : 5000));
    if (kota) await r.fulfill({ status: 429, json: { hata: 'kota' }, headers: { 'Access-Control-Allow-Origin': '*' } });
    else await r.fulfill({ json: { resim: SONUC, mime: 'image/webp' }, headers: { 'Access-Control-Allow-Origin': '*' } });
  });
  await page.goto('./sanatci/');
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'Çiz' }).click({ force: true });
  await page.waitForTimeout(1000);
  const r = (await page.locator('.ms-tuval').boundingBox())!;
  const cember = async (cx: number, cy: number, rad: number, n = 36) => {
    await page.mouse.move(r.x + cx + rad, r.y + cy);
    await page.mouse.down();
    for (let i = 1; i <= n; i++) {
      await page.mouse.move(r.x + cx + Math.cos((i / n) * Math.PI * 2) * rad, r.y + cy + Math.sin((i / n) * Math.PI * 2) * rad);
      await page.waitForTimeout(16);
    }
    await page.mouse.up();
  };
  // kedi yüzü: kafa, kulaklar, gözler
  await page.locator('[data-renk="#FF8A2B"]').click({ force: true });
  await cember(r.width / 2, r.height / 2, r.width * 0.26);
  await page.locator('[data-renk="#2B2B2B"]').click({ force: true });
  await cember(r.width * 0.42, r.height * 0.46, 12, 16);
  await cember(r.width * 0.58, r.height * 0.46, 12, 16);
  // sağ alt köşeye doğru uzun çizgi: Mino yol verir
  await page.mouse.move(r.x + r.width * 0.5, r.y + r.height * 0.75);
  await page.mouse.down();
  for (let i = 1; i <= 30; i++) {
    await page.mouse.move(r.x + r.width * (0.5 + i * 0.015), r.y + r.height * (0.75 + i * 0.007));
    await page.waitForTimeout(16);
  }
  await page.mouse.up();
  await page.waitForTimeout(2200);
  await page.getByRole('button', { name: 'Sihir yap' }).click({ force: true });
  await page.waitForTimeout(900);
  await page.locator('[data-konu="kedi"]').click({ force: true });
  // sihir bekleme + perde + süpürme + konfeti
  await expect(page.locator('.ms-karsilastir')).toBeVisible({ timeout: 20000 });
  await page.waitForTimeout(5500);
  // kota dolu: nazik son (sihirli çerçeve)
  kota = true;
  await page.getByRole('button', { name: 'Yeni çizim' }).click({ force: true });
  await page.waitForTimeout(600);
  const r2 = (await page.locator('.ms-tuval').boundingBox())!;
  await page.mouse.move(r2.x + r2.width * 0.3, r2.y + r2.height * 0.5);
  await page.mouse.down();
  for (let i = 1; i <= 30; i++) {
    await page.mouse.move(r2.x + r2.width * (0.3 + i * 0.013), r2.y + r2.height * (0.5 + Math.sin(i / 3) * 0.12));
    await page.waitForTimeout(16);
  }
  await page.mouse.up();
  await page.getByRole('button', { name: 'Sihir yap' }).click({ force: true });
  await page.waitForTimeout(600);
  await page.locator('[data-konu="surpriz"]').click({ force: true });
  await expect(page.locator('.ms-cerceve-kutu.sihirli')).toBeVisible({ timeout: 20000 });
  await page.waitForTimeout(3000);
  const video = page.video();
  await ctx.close();
  if (video) copyFileSync(await video.path(), 'tests/screens/sanatci-cila.webm');
  expect(hatalar.filter((h) => !h.includes('429'))).toEqual([]);
});

test('Minik Sanatçı: sunucu yokken dostça uyarı', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.route('**/sanatci/ayar.json', (r) => r.fulfill({ json: {} }));
  await page.goto('./sanatci/?test=1');
  await page.evaluate(() => localStorage.setItem('minik-sanatci-onay-v1', '1'));
  await page.getByRole('button', { name: 'Çiz' }).click();
  const r = (await page.locator('.ms-tuval').boundingBox())!;
  await page.mouse.move(r.x + 50, r.y + 50);
  await page.mouse.down();
  await page.mouse.move(r.x + 200, r.y + 220, { steps: 8 });
  await page.mouse.up();
  await page.getByRole('button', { name: 'Sihir yap' }).click();
  await page.locator('[data-konu="surpriz"]').click();
  await expect(page.getByRole('button', { name: 'Tekrar dene' })).toBeVisible({ timeout: 8000 });
  await expect(page.locator('.ms-ebeveyn-not')).toContainText('sunucu');
  expect(hatalar).toEqual([]);
});
