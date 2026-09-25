import { readFileSync } from 'node:fs';
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
