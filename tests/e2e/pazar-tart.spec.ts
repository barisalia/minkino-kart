import { expect, test, type Locator, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

interface TartVerisi {
  mod: 'say' | 'tart';
  meyve: string;
  adet?: number;
  bolge?: [number, number];
  kasa: { meyve: string; agirlik: number; curuk: boolean }[];
}

/** Parmakla (fareyle) sürükler: kasadan leğene, leğenden komposta */
async function surukle(page: Page, kaynak: Locator, hedef: Locator, oy = 0.35) {
  const a = (await kaynak.boundingBox())!;
  const b = (await hedef.boundingBox())!;
  const [x0, y0] = [a.x + a.width / 2, a.y + a.height / 2];
  const [x1, y1] = [b.x + b.width / 2, b.y + b.height * oy];
  await page.mouse.move(x0, y0);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(x0 + ((x1 - x0) * i) / 10, y0 + ((y1 - y0) * i) / 10);
  await page.mouse.up();
}

async function istek(page: Page): Promise<TartVerisi> {
  await expect(page.locator('.tb-ekran.pz-aktif')).toBeVisible({ timeout: 10000 });
  return JSON.parse((await page.locator('.tb-ekran').getAttribute('data-istek'))!) as TartVerisi;
}
const kg = async (page: Page) => Number((await page.locator('.tb-kantar').getAttribute('data-kg')) ?? 0);
const legen = (page: Page) => page.locator('.tb-hedef');
const saglam = (page: Page) => page.locator('.tb-yuva:not(.tb-bos) .tb-urun[data-curuk="0"]').first();
/** "Ver" istenene ulaşınca nabız gibi atar (hiç durmaz): tıklama beklemeden */
const ver = (page: Page) => page.locator('.tb-ver').click({ force: true });

test('Tart Bakalım: açılıştan girilir, bir kilo tartılır (yeşil bölge), müşteri sevinir, yıldız (6 yaş)', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./pazar/?test=1&yas=6&meyve=patates&curuk=0');
  await page.getByRole('button', { name: 'Tart Bakalım' }).click();
  const ist = await istek(page);
  expect(ist.mod).toBe('tart');
  await expect(page.locator('.pz-istek-balon .tb-kilo')).toBeVisible();
  await expect(page.locator('.tb-kantar .tb-yesil')).toBeAttached();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `tests/screens/${info.project.name}-t1-tart-istek.png` });
  const [lo, hi] = ist.bolge!;
  // meyveler leğene düşer, ibre yükselir; yeşile girince Ver parlar
  let onceki = await kg(page);
  while ((await kg(page)) < lo) {
    await surukle(page, saglam(page), legen(page));
    await expect.poll(() => kg(page), { timeout: 4000 }).toBeGreaterThan(onceki);
    onceki = await kg(page);
  }
  expect(onceki).toBeLessThanOrEqual(hi);
  await expect(page.locator('.tb-ver.tb-hazir')).toBeVisible();
  // ibre yeşilde (tepe ±20°)
  expect(Math.abs(Number(await page.locator('.tb-kantar').getAttribute('data-aci')))).toBeLessThanOrEqual(21);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `tests/screens/${info.project.name}-t2-tart-yesil.png` });
  await ver(page);
  await expect(page.locator('.pz-musteri.sevindi')).toBeVisible();
  await expect(page.locator('.pz-yildiz.dolu')).toHaveCount(1);
  // sıradaki müşteri gelir, leğen boş
  await istek(page);
  await expect(page.locator('.tb-govde')).toHaveCount(0);
  expect(hatalar).toEqual([]);
});

test('Tart Bakalım: 4 yaş sayar — fazlası "Ver"de olmaz, bir tane çıkarınca olur', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./pazar/?test=1&yas=4&ekran=tart&meyve=elma&curuk=0');
  const ist = await istek(page);
  expect(ist.mod).toBe('say');
  await expect(page.locator('.pz-istek-balon .pz-istek-grup b')).toHaveText(String(ist.adet));
  for (let i = 0; i <= ist.adet!; i++) {
    await surukle(page, saglam(page), legen(page));
    await expect(page.locator('.tb-govde')).toHaveCount(i + 1);
  }
  await expect.poll(async () => JSON.parse((await page.locator('.tb-ekran').getAttribute('data-legen'))!).length).toBe(ist.adet! + 1);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `tests/screens/${info.project.name}-t3-tart-sayma.png` });
  // bir fazla: Ver olmaz, yıldız yok
  await expect(page.locator('.tb-ver.tb-hazir')).toHaveCount(0);
  await ver(page);
  await page.waitForTimeout(200);
  await expect(page.locator('.pz-yildiz.dolu')).toHaveCount(0);
  // birini leğenden yığına geri sürükle
  await surukle(page, page.locator('.tb-govde').first(), page.locator('.tb-kasa'), 0.5);
  await expect(page.locator('.tb-govde')).toHaveCount(ist.adet!);
  await expect(page.locator('.tb-ver.tb-hazir')).toBeVisible();
  await ver(page);
  await expect(page.locator('.pz-yildiz.dolu')).toHaveCount(1);
  expect(hatalar).toEqual([]);
});

test('Tart Bakalım: çürük domates — verilirse müşteri geri verir, komposta atılınca kompost sevinir', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./pazar/?test=1&yas=3&ekran=tart&meyve=domates&curuk=1');
  const ist = await istek(page);
  expect(ist.kasa.filter((k) => k.curuk)).toHaveLength(1);
  const curuk = page.locator('.tb-urun[data-curuk="1"]');
  await expect(curuk.locator('.tb-leke')).toBeAttached();
  await expect(curuk.locator('.tb-sinek')).toBeAttached();
  // çürük ve istenen kadar sağlam leğene
  await surukle(page, curuk, legen(page));
  await expect(page.locator('.tb-kompost.pz-parla')).toBeVisible();
  for (let i = 0; i < ist.adet!; i++) await surukle(page, saglam(page), legen(page));
  await expect(page.locator('.tb-govde')).toHaveCount(ist.adet! + 1);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `tests/screens/${info.project.name}-t4-tart-curuk.png` });
  // Ver: müşteri "ııh" yapar, çürüğü geri verir (leğene düşer); ceza yok, yıldız yok
  await ver(page);
  await expect(page.locator('.pz-musteri.pz-burus')).toBeAttached();
  await expect(page.locator('.tb-govde[data-curuk="1"]')).toHaveCount(0);
  await expect(page.locator('.tb-govde[data-curuk="1"]')).toHaveCount(1, { timeout: 6000 });
  await expect(page.locator('.pz-yildiz.dolu')).toHaveCount(0);
  // çürüğü leğenden komposta: kompost yutar
  await page.waitForTimeout(400);
  await surukle(page, page.locator('.tb-govde[data-curuk="1"]'), page.locator('.tb-kompost'), 0.4);
  await expect(page.locator('.tb-kompost.tb-yedi')).toBeAttached();
  await expect(page.locator('.tb-govde[data-curuk="1"]')).toHaveCount(0);
  await expect(page.locator('.tb-ver.tb-hazir')).toBeVisible();
  await ver(page);
  await expect(page.locator('.pz-yildiz.dolu')).toHaveCount(1);
  expect(hatalar).toEqual([]);
});

test('Tart Bakalım: sağlam meyve komposta atılmaz, yığına döner; şenlik açılır', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./pazar/?test=1&yas=5&ekran=tart&meyve=portakal&curuk=0');
  const ist = await istek(page);
  const n = ist.kasa.length;
  await surukle(page, saglam(page), page.locator('.tb-kompost'), 0.4);
  await expect(page.locator('.tb-kompost.tb-hayir')).toBeAttached();
  await expect(page.locator('.tb-yuva:not(.tb-bos)')).toHaveCount(n);
  // şenlik ekranı: "Bir daha" tart'a, yanındaki düğme pazara
  await page.goto('./pazar/?test=1&yas=5&ekran=senlik');
  await expect(page.locator('.pz-senlik-hayvan')).toHaveCount(5);
  expect(hatalar).toEqual([]);
});
