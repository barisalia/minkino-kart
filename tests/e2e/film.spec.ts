import { expect, test } from '@playwright/test';
import { hataTopla } from './yardimci';

test('Film: Mino’nun Karpuzu animatiği baştan sona oynar, sonda öğüt kartı', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./film/?test=1');
  await expect(page.locator('.fl-baslik')).toHaveText("Mino'nun Karpuzu");
  await page.screenshot({ path: `tests/screens/${info.project.name}-f0-film-kapak.png` });
  await page.getByRole('button', { name: 'Oynat' }).click();
  // sahne 1: Mino ve karpuz sahnede
  await expect(page.locator('.fl-sahne[data-sahne="1-pazar-kapaniyor"]')).toBeVisible();
  await expect(page.locator('.fl-nesne[data-oyuncu="mino"] .mino-svg')).toBeVisible();
  await expect(page.locator('.fl-nesne[data-esya="karpuz"]')).toBeVisible();
  // sahne 2: köpek (iskeletli karakter) gelir, karpuz ikiye bölünür
  await expect(page.locator('.fl-sahne[data-sahne="2-ac-kopek"]')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('.fl-nesne[data-oyuncu="kopek"] .kr-karakter')).toBeVisible();
  await expect(page.locator('.fl-sahne[data-son-soz="Hav! Teşekkürler!"]')).toBeVisible({ timeout: 15000 });
  await page.screenshot({ path: `tests/screens/${info.project.name}-f1-film-sahne2.png` });
  // son: öğüt kartı
  await expect(page.locator('.fl-ogut')).toContainText('Paylaşmak güzeldir.', { timeout: 15000 });
  await page.screenshot({ path: `tests/screens/${info.project.name}-f2-film-ogut.png` });
  expect(hatalar).toEqual([]);
});

test('Film: duraklat / devam', async ({ page }, info) => {
  test.skip(info.project.name !== 'iphone', 'bir kez yeter');
  await page.goto('./film/?onizleme=1&sessiz=1');
  await page.getByRole('button', { name: 'Oynat' }).click();
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: 'Duraklat' }).click();
  await expect(page.locator('.fl-sahne.duraklatildi')).toBeVisible();
  const kamera = await page.locator('.fl-orta').evaluate((e) => e.style.transform);
  await page.waitForTimeout(700);
  expect(await page.locator('.fl-orta').evaluate((e) => e.style.transform)).toBe(kamera);
  await page.getByRole('button', { name: 'Devam' }).click();
  await expect(page.locator('.fl-sahne.duraklatildi')).toHaveCount(0);
});
