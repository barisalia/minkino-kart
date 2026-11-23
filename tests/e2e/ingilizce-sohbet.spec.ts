// Karakterlerle sohbet (ingilizce/src/ekranlar/sohbet.ts): ana ekranda Polly, Mino, Zıpzıp ya da Lokum'a dokununca açılır;
// dört tur, resimli cevaplar. Kino'nun sohbeti yok: dokununca el sallar, selam verir, panel açılmaz.
import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

const tik = { force: true, timeout: 4000 } as const;

async function anaEkran(page: Page) {
  await page.goto('./ingilizce/?test=1');
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: 4 })); });
  await page.goto('./ingilizce/?test=1');
  // ağaç evi girişi kaldırıldı (Barış, 23 Kasım)
  await expect(page.locator('.ing-ae-giris')).toHaveCount(0);
  await expect(page.locator('[data-nesne="polly"]')).toBeVisible();
}

/** Sohbeti baştan sona oynar: her turda tur numarası ve cevap kartları gelince bir kart seçer; soruları döner */
async function sohbetOyna(page: Page, karakter: string): Promise<string[]> {
  await page.locator(`[data-nesne="${karakter}"]`).click(tik);
  const ortu = page.locator(`.ing-shb[data-karakter="${karakter}"]`);
  await expect(ortu).toBeVisible();
  const sorular: string[] = [];
  for (let i = 0; i < 4; i++) {
    await expect(ortu).toHaveAttribute('data-tur', String(i), { timeout: 10000 });
    await expect(ortu).toHaveAttribute('data-bekliyor', '1', { timeout: 10000 });
    const kartlar = page.locator('.ing-shb-kart:not(.ing-shb-cekil)');
    await expect(kartlar).toHaveCount(i < 3 ? 3 : 2);
    sorular.push(await page.locator('.ing-shb-balon strong').innerText());
    // dokunma hedefi en az 64 px; kart giriş hareketi bitince ölçülür
    await expect(kartlar.first()).toBeInViewport({ ratio: 0.95 });
    const k = (await kartlar.first().boundingBox())!;
    expect(Math.min(k.width, k.height)).toBeGreaterThanOrEqual(64);
    await (i === 3 ? page.locator('.ing-shb-kart[data-cevap="yes"]') : kartlar.last()).click(tik);
  }
  // veda (test kipinde çok kısa) ve kapanış
  await expect(page.locator('.ing-shb')).toHaveCount(0, { timeout: 10000 });
  return sorular;
}

for (const karakter of ['polly', 'mino', 'zipzip', 'lokum']) {
  test(`${karakter} ile sohbet: dört tur, her turda üç (sonda iki) resimli cevap; sonunda veda edip kapanır`, async ({ page }) => {
    const hatalar = hataTopla(page);
    await anaEkran(page);
    const sorular = await sohbetOyna(page, karakter);
    expect(new Set(sorular).size).toBe(4);
    // sohbet bitince sınıf yerinde, derse başlanabilir
    await expect(page.locator('[data-nesne="minder"]')).toBeVisible();
    expect(hatalar).toEqual([]);
  });
}

test('Kino: sohbeti yok; dokununca el sallar, panel açılmaz', async ({ page }) => {
  const hatalar = hataTopla(page);
  await anaEkran(page);
  await page.locator('[data-nesne="kino"]').click(tik);
  await page.waitForTimeout(400);
  await expect(page.locator('.ing-shb')).toHaveCount(0);
  expect(hatalar).toEqual([]);
});

test('sohbet: kapat düğmesi, dışarı dokunuş ve çift dokunuş', async ({ page }) => {
  const hatalar = hataTopla(page);
  await anaEkran(page);
  await page.locator('[data-nesne="polly"]').click(tik);
  await expect(page.locator('.ing-shb')).toBeVisible();
  await page.locator('.ing-shb-kapat').click(tik);
  await expect(page.locator('.ing-shb')).toHaveCount(0);
  await page.locator('[data-nesne="mino"]').click(tik);
  await expect(page.locator('.ing-shb')).toBeVisible();
  await page.mouse.click(5, page.viewportSize()!.height - 5);
  await expect(page.locator('.ing-shb')).toHaveCount(0);
  // çift dokunuş tek sohbet açar
  await page.locator('[data-nesne="zipzip"]').dblclick({ force: true });
  await expect(page.locator('.ing-shb')).toHaveCount(1);
  await page.waitForTimeout(600);
  await expect(page.locator('.ing-shb')).toHaveCount(1);
  expect(hatalar).toEqual([]);
});
