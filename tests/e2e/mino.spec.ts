import { expect, test } from '@playwright/test';
import { hataTopla } from './yardimci';

test('Mino: açılıştan girilir, doğru kartı verince yeni tur başlar, dokununca tepki verir', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./?test=1');
  await page.getByRole('button', { name: 'Mino ile oyna' }).click();
  await expect(page.locator('.mino-svg')).toBeVisible();
  await expect(page.locator('.mino-tepsi .kart')).toHaveCount(3);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `tests/screens/${info.project.name}-10-mino.png` });

  // Yanlış kart: kabul edilmez
  await page.locator('.mino-tepsi .kart:not([data-dogru])').first().click();
  await expect(page.locator('.mino-tepsi [data-dogru="1"]')).toBeVisible();

  // Doğru kart → Mino yer, yeni istek gelir
  const onceki = await page.locator('.mino-tepsi [data-dogru="1"]').getAttribute('data-kart');
  await page.locator('.mino-tepsi [data-dogru="1"]').click();
  await expect
    .poll(async () => page.locator('.mino-tepsi [data-dogru="1"]').getAttribute('data-kart'), { timeout: 8000 })
    .not.toBe(onceki);

  // Mino'nun farklı yerlerine dokun
  const r = (await page.locator('.mino-svg').boundingBox())!;
  for (const [x, y] of [[0.4, 0.25], [0.45, 0.65], [0.85, 0.45], [0.4, 0.95]]) {
    await page.mouse.click(r.x + r.width * x, r.y + r.height * y);
    await page.waitForTimeout(750);
  }
  await page.getByRole('button', { name: 'Ana ekran' }).click();
  await expect(page.locator('.oyna-dugme')).toBeVisible();
  expect(hatalar).toEqual([]);
});

test('Mino: tepkiler (zıpla, dans, ağız açık, göz kapalı, mutlu) ekran görüntüsü', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./?test=1&yas=4&ekran=mino');
  await expect(page.locator('.mino-svg')).toBeVisible();
  await page.waitForTimeout(1500);
  // Görüntü Mino kutusunun biraz dışını da alsın: zıplayınca / dansta kulaklar kutudan taşar (sayfada taşma serbest)
  const k = (await page.locator('.mino').boundingBox())!;
  const pay = k.height * 0.3;
  const alan = { x: Math.max(0, k.x - 20), y: Math.max(0, k.y - pay), width: k.width + 40, height: k.height + pay };
  const mino = { screenshot: (o: { path: string }) => page.screenshot({ ...o, clip: alan }) };
  const tepki = (ad: string) => page.evaluate((a) => (window as unknown as { __mino: { tepki(t: string): void } }).__mino.tepki(a), ad);
  for (const [ad, ms, dosya] of [['zipla', 380, '11-mino-zipla'], ['dans', 450, '12-mino-dans'], ['sasir', 500, '13-mino-agiz-acik'], ['evet', 350, '14-mino-mutlu']] as const) {
    await tepki(ad);
    await page.waitForTimeout(ms);
    await mino.screenshot({ path: `tests/screens/${info.project.name}-${dosya}.png` });
    await page.waitForTimeout(2600);
  }
  // göz kırpma ve uyku aynı kapalı göz çizimini kullanır
  await page.evaluate(() => (window as unknown as { __mino: { uyu(): void } }).__mino.uyu());
  await expect(page.locator('.mino.gozkapali')).toBeVisible();
  await mino.screenshot({ path: `tests/screens/${info.project.name}-15-mino-goz-kapali.png` });
  expect(hatalar).toEqual([]);
});
