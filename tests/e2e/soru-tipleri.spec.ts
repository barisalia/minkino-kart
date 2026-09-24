import { expect, test } from '@playwright/test';
import { hataTopla, soruDegisti, soruyuCevapla, suruklе } from './yardimci';

const TIPLER: [string, number, string][] = [
  ['BUL', 3, 'hayvanlar'],
  ['ESLESTIR', 4, 'meyveler'],
  ['SAY', 6, 'sayilar'],
  ['FARKLI', 5, 'meyveler'],
  ['SIRADAKI', 5, 'renkler'],
  ['HAFIZA', 6, 'hayvanlar'],
];

for (const [tip, yas, tema] of TIPLER) {
  test(`soru tipi ${tip} (${yas} yaş, ${tema})`, async ({ page }, info) => {
    const hatalar = hataTopla(page);
    await page.goto(`./?test=1&yas=${yas}&tema=${tema}&tip=${tip}`);
    await expect(page.locator(`.oyun-alan[data-tip="${tip}"]`)).toBeVisible();
    await page.waitForTimeout(150);
    await page.screenshot({ path: `tests/screens/${info.project.name}-tip-${tip}.png` });
    await soruyuCevapla(page);
    await soruDegisti(page, 0);
    expect(hatalar).toEqual([]);
  });
}

test('yanlış cevap: kart sallanır, soluklaşır, doğru kart ışıldar, tekrar denenir', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./?test=1&yas=5&tema=hayvanlar&tip=BUL');
  const yanlis = page.locator('.secenek:not([data-dogru])').first();
  await yanlis.click();
  await expect(yanlis).toHaveClass(/soluk/);
  await expect(page.locator('[data-dogru="1"]')).toHaveClass(/isilti/);
  await expect(page.locator('.ilerleme i.tamam')).toHaveCount(0);
  await page.screenshot({ path: `tests/screens/${info.project.name}-yanlis-cevap.png` });
  await page.locator('[data-dogru="1"]').click();
  await soruDegisti(page, 0);
  expect(hatalar).toEqual([]);
});

test('eşleştir: yanlış kartı hedefe sürüklemek kabul edilmez', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./?test=1&yas=3&tema=hayvanlar&tip=ESLESTIR');
  const hedef = page.locator('.gosterge-alan .kart').first();
  await suruklе(page, page.locator('.secenek:not([data-dogru])').first(), hedef);
  await expect(page.locator('.ilerleme i.tamam')).toHaveCount(0);
  await expect(page.locator('[data-dogru="1"]')).toHaveClass(/isilti/);
  await suruklе(page, page.locator('[data-dogru="1"]'), hedef);
  await soruDegisti(page, 0);
  expect(hatalar).toEqual([]);
});

test('tüm yaş ve temalarda tur başlar ve ilk soru cevaplanır', async ({ page }) => {
  test.skip(test.info().project.name !== 'iphone', 'tek boyutta yeterli');
  const hatalar = hataTopla(page);
  for (const yas of [3, 4, 5, 6]) {
    for (const tema of ['hayvanlar', 'meyveler', 'tasitlar', 'renkler', 'sayilar', 'harfler']) {
      await page.goto(`./?test=1&yas=${yas}&tema=${tema}`);
      await expect(page.locator('.oyun-alan[data-tip]')).toBeVisible();
      await soruyuCevapla(page);
      await soruDegisti(page, 0);
    }
  }
  expect(hatalar).toEqual([]);
});
