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
