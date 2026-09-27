import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

async function tut(page: Page, ms: number) {
  await page.mouse.move(200, 500);
  await page.mouse.down();
  await page.waitForTimeout(ms);
  await page.mouse.up();
}
async function dokun(page: Page, kez: number) {
  for (let i = 0; i < kez; i++) {
    await page.mouse.click(200, 500);
    await page.waitForTimeout(90);
  }
}
const ekran = (page: Page, ad: string, proje: string) => page.screenshot({ path: `tests/screens/${proje}-${ad}.png` });

test('Sesli Maceralar: açılış', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./macera/?test=1&yas=5');
  await expect(page.locator('.mc-bolum-kart')).toBeVisible();
  await page.waitForTimeout(400);
  await ekran(page, '100-macera-acilis', info.project.name);
  expect(hatalar).toEqual([]);
});

test("Ada'nın Doğum Günü: dokunarak baştan sona (5 yaş)", async ({ page }, info) => {
  test.setTimeout(180_000);
  const hatalar = hataTopla(page);
  await page.goto('./macera/?test=1&ekran=bolum&yas=5');
  const p = info.project.name;
  // balonlar
  await expect(page.locator('.mc-balon')).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(200);
  await ekran(page, '101-macera-giris', p);
  for (let i = 0; i < 5; i++) {
    await expect(page.locator('.mc-balon:not(.asili):not(.asiliyor)')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(150);
    if (i === 2) {
      await page.mouse.move(200, 500);
      await page.mouse.down();
      await page.waitForTimeout(900);
      await ekran(page, '102-macera-balon', p);
      await page.waitForTimeout(200);
      await page.mouse.up();
    } else await tut(page, 1700);
  }
  // saklan, sus
  await expect(page.locator('.mc-sessiz')).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(300);
  await ekran(page, '103-macera-sessiz', p);
  await tut(page, 5600);
  // sürpriz
  await expect(page.locator('.mc-buyuk-dugme')).toBeVisible({ timeout: 15000 });
  await ekran(page, '104-macera-surpriz-once', p);
  await page.locator('.mc-buyuk-dugme').click();
  await page.waitForTimeout(700);
  await ekran(page, '105-macera-surpriz', p);
  // şarkı
  await expect(page.locator('.mc-karaoke')).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(300);
  await ekran(page, '106-macera-sarki', p);
  // mumlar
  await expect(page.locator('.mc-mum').first()).toBeVisible({ timeout: 30000 });
  await page.waitForTimeout(1300);
  await ekran(page, '107-macera-mumlar', p);
  await tut(page, 2600);
  // pasta
  await expect(page.locator('.mc-kesim.acik')).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(800);
  // dilim uçarken gelen dokunuş sayılmaz (çocuk art arda tıklarsa pasta karışmasın): sayı artana kadar tekrar dokun
  for (let i = 0; i < 5; i++) {
    await expect(async () => {
      await dokun(page, 1);
      await expect(page.locator('.mc-kesim-yer.dolu')).toHaveCount(i + 1, { timeout: 1500 });
    }).toPass({ timeout: 15000 });
    if (i === 2) await ekran(page, '108-macera-pasta', p);
  }
  // dans
  await expect(page.locator('.mc-ipucu.acik')).toHaveText('Alkışla!', { timeout: 15000 });
  for (let i = 0; i < 6; i++) {
    await dokun(page, 1);
    await page.waitForTimeout(250);
  }
  await ekran(page, '109-macera-dans', p);
  for (let i = 0; i < 6; i++) {
    await dokun(page, 1);
    await page.waitForTimeout(250);
  }
  await expect(page.locator('.mc-son')).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(500);
  await ekran(page, '110-macera-son', p);
  expect(hatalar).toEqual([]);
});
