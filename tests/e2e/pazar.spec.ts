import { expect, test, type Locator, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

interface IstekVerisi {
  istenen: Record<string, number>;
  lira?: number;
}

/** Ürünü parmakla (fareyle) sepete sürükler */
async function sepeteSurukle(page: Page, urun: Locator) {
  const a = (await urun.boundingBox())!;
  const b = (await page.locator('.pz-sepet').boundingBox())!;
  const [x0, y0] = [a.x + a.width / 2, a.y + a.height / 2];
  const [x1, y1] = [b.x + b.width / 2, b.y + b.height / 2];
  await page.mouse.move(x0, y0);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(x0 + ((x1 - x0) * i) / 10, y0 + ((y1 - y0) * i) / 10);
  await page.mouse.up();
}

/** Müşteri hazır olunca isteğini okur (test modunda ekranda data-istek) */
async function istek(page: Page): Promise<IstekVerisi> {
  await expect(page.locator('.pz-pazar.pz-aktif')).toBeVisible({ timeout: 8000 });
  return JSON.parse((await page.locator('.pz-pazar').getAttribute('data-istek'))!) as IstekVerisi;
}

test('Mino’nun Pazarı: açılış → pazar, sürükleyerek 1 müşteri (3 yaş)', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./pazar/?test=1&yas=3');
  await expect(page.locator('.pz-logo')).toBeVisible();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `tests/screens/${info.project.name}-a0-pazar-acilis.png` });
  await page.getByRole('button', { name: 'Oyna' }).click();

  const ist = await istek(page);
  const [urun] = Object.keys(ist.istenen);
  await expect(page.locator('.pz-musteri')).toBeVisible();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `tests/screens/${info.project.name}-a1-pazar-3yas.png` });

  // yanlış ürün yumuşakça tezgâha geri döner
  const yanlis = page.locator(`.pz-urunler .pz-urun:not([data-urun="${urun}"])`).first();
  await sepeteSurukle(page, yanlis);
  await page.waitForTimeout(200);
  await expect(page.locator('.pz-sepet-ic .pz-urun')).toHaveCount(0);
  await expect(page.locator('.pz-yildiz.dolu')).toHaveCount(0);

  // doğru ürün → müşteri sevinir, yıldız
  await sepeteSurukle(page, page.locator(`.pz-urunler .pz-urun[data-urun="${urun}"]`));
  await expect(page.locator('.pz-yildiz.dolu')).toHaveCount(1);
  await expect(page.locator('.pz-musteri.sevindi')).toBeVisible();
  // sıradaki müşteri gelir
  await expect(page.locator('.pz-pazar.pz-aktif')).toBeVisible({ timeout: 8000 });
  const yildiz = await page.evaluate(() => (window as unknown as { __pazar: { kayit: { yildiz: number } } }).__pazar.kayit.yildiz);
  expect(yildiz).toBeGreaterThanOrEqual(1);
  expect(hatalar).toEqual([]);
});

test('Mino’nun Pazarı: 4 yaş sayma, "Ver" ile', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./pazar/?test=1&yas=4&ekran=pazar');
  const ist = await istek(page);
  const [urun] = Object.keys(ist.istenen);
  const n = ist.istenen[urun];
  for (let i = 0; i < n; i++) {
    await sepeteSurukle(page, page.locator(`.pz-urunler .pz-urun[data-urun="${urun}"]`).first());
    await page.waitForTimeout(80);
  }
  await expect(page.locator('.pz-sepet-ic .pz-urun')).toHaveCount(n);
  await page.waitForTimeout(200);
  await page.screenshot({ path: `tests/screens/${info.project.name}-a2-pazar-4yas-sayma.png` });
  await page.locator('.pz-ver').click();
  await expect(page.locator('.pz-yildiz.dolu')).toHaveCount(1);
  expect(hatalar).toEqual([]);
});

test('Mino’nun Pazarı: 6 yaş toplama ve para, 5 yaş ayırma, şenlik ekranı açılır', async ({ page }, info) => {
  test.skip(info.project.name !== 'iphone', 'bir kez yeter');
  const hatalar = hataTopla(page);
  await page.goto('./pazar/?test=1&yas=6&ekran=pazar');
  const ist = await istek(page);
  const [urun] = Object.keys(ist.istenen);
  for (let i = 0; i < ist.istenen[urun]; i++) await sepeteSurukle(page, page.locator(`.pz-urunler .pz-urun[data-urun="${urun}"]`).first());
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'tests/screens/iphone-a3-pazar-6yas-toplama.png' });
  await page.locator('.pz-ver').click();
  await expect(page.locator('.pz-yildiz.dolu')).toHaveCount(1);

  // ikinci müşteri: kasaya para
  await expect(page.locator('.pz-pazar[data-tur="ode"].pz-aktif')).toBeVisible({ timeout: 8000 });
  const ode = JSON.parse((await page.locator('.pz-pazar').getAttribute('data-istek'))!) as IstekVerisi;
  const lira = ode.lira ?? 0;
  for (let i = 0; i < Math.floor(lira / 5); i++) await sepeteSurukle(page, page.locator('.pz-urunler .pz-urun[data-urun="para-5"]').first());
  for (let i = 0; i < lira % 5; i++) await sepeteSurukle(page, page.locator('.pz-urunler .pz-urun[data-urun="para-1"]').first());
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'tests/screens/iphone-a4-pazar-6yas-para.png' });
  await page.locator('.pz-ver').click();
  await expect(page.locator('.pz-yildiz.dolu')).toHaveCount(2);

  await page.goto('./pazar/?test=1&yas=5&ekran=pazar');
  await istek(page);
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'tests/screens/iphone-a5-pazar-5yas.png' });

  await page.goto('./pazar/?test=1&yas=5&ekran=senlik');
  await expect(page.locator('.pz-senlik-hayvan')).toHaveCount(5);
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'tests/screens/iphone-a6-pazar-senlik.png' });
  expect(hatalar).toEqual([]);
});
