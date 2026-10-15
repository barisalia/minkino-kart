import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

/**
 * Pati Dükkânı · İlk Gün dilimi (yalnız /pati/; menüde yok). Önce yatay telefon 844×390, sonra dikey 390×844.
 * - her ihtiyaç doğru eşyayla kapanır, gün akşama döner, uyutma + lamba ipi + polaroid
 * - yanlış eşya hiçbir şeyi bozmaz
 * - hiç dokunmadan (yardım merdiveni açık) gün baştan sona akar
 */
test.beforeEach(({}, info) => test.skip(info.project.name !== 'iphone', 'yalnız telefon projesinde (boyutları test kendisi verir)'));

type Acik = { hayvan: string; tur: string; esya: string; sayac: number };
const durum = (page: Page) => page.evaluate(() => {
  const p = (window as unknown as { __pati: { faz(): string; acik(): Acik[]; yakin(): string | null; biten(): number } }).__pati;
  return { faz: p.faz(), acik: p.acik(), yakin: p.yakin(), biten: p.biten() };
});

async function gunuOyna(page: Page, ekran: string, yanlisDene = false) {
  await expect.poll(async () => (await durum(page)).faz, { timeout: 15000 }).toBe('gun');
  let foto = 0;
  for (let tur = 0; tur < 60; tur++) {
    const d = await durum(page);
    if (d.faz !== 'gun') break;
    const a = d.acik[0];
    if (!a) {
      await page.waitForTimeout(150);
      continue;
    }
    if (d.yakin !== a.hayvan) {
      await page.locator(`[data-kose=${a.hayvan}]`).dispatchEvent('click');
      await expect(page.locator('.pt-raf.acik')).toBeVisible();
      if (foto++ < 2) await page.screenshot({ path: `tests/screens/pati-${ekran}-yakin-${a.hayvan}.png` });
    }
    if (yanlisDene) {
      // yanlış eşyalar: hayvan koklar, ihtiyaç açık kalır, hiçbir şey bozulmaz
      for (const y of await page.locator('.pt-raf-esya').evaluateAll((e) => e.map((x) => (x as HTMLElement).dataset.esya!))) {
        if (y === a.esya) continue;
        await page.locator(`.pt-raf-esya[data-esya=${y}]:not(.pt-kullanimda)`).first().click({ timeout: 3000 }).catch(() => undefined);
        await page.waitForTimeout(250);
      }
      const sonra = await durum(page);
      expect(sonra.acik.some((x) => x.hayvan === a.hayvan && x.tur === a.tur)).toBe(true);
    }
    await page.locator(`.pt-raf-esya[data-esya=${a.esya}]:not(.pt-kullanimda)`).first().click({ timeout: 5000 }).catch(() => undefined);
    await page.waitForTimeout(400);
  }
  await expect.poll(async () => (await durum(page)).biten, { timeout: 20000 }).toBe(5);
}

async function aksamVeFoto(page: Page, ekran: string) {
  await expect.poll(async () => (await durum(page)).faz, { timeout: 15000 }).toBe('aksam');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `tests/screens/pati-${ekran}-aksam.png` });
  for (const h of ['findik', 'tarcin', 'piril']) await page.locator(`[data-kose=${h}]`).dispatchEvent('click');
  await expect(page.locator('.pt-ekran[data-ip="1"]')).toBeVisible({ timeout: 8000 });
  await page.locator('.pt-ip-alan').dispatchEvent('click');
  await expect(page.locator('.pt-polaroid.acik')).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `tests/screens/pati-${ekran}-foto.png` });
}

test('yatay telefon 844×390: İlk Gün baştan sona, her ihtiyaç doğru eşyayla kapanır', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('pati/?test=1&sifirla=1');
  await expect(page.locator('.pt-yas-perde')).toBeVisible();
  await page.screenshot({ path: 'tests/screens/pati-yatay-acilis.png' });
  await page.locator('[data-yas=kucuk]').click();
  await expect.poll(async () => (await durum(page)).faz, { timeout: 15000 }).toBe('gun');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'tests/screens/pati-yatay-salon.png' });
  await gunuOyna(page, 'yatay');
  await aksamVeFoto(page, 'yatay');
  // polaroide dokununca yeni gün açılışı
  await page.locator('.pt-polaroid').click();
  await expect(page.locator('.pt-yas-perde')).toBeVisible();
  expect(hatalar).toEqual([]);
});

test('yanlış eşya hiçbir şeyi bozmaz (5-6 yaş)', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('pati/?test=1&yas=buyuk');
  await gunuOyna(page, 'yanlis', true);
  expect(hatalar).toEqual([]);
});

test('hiç dokunmadan gün akşama, akşam fotoğrafa döner (yardım merdiveni)', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('pati/?test=1&yas=kucuk&kendiliginden=1');
  await expect(page.locator('.pt-polaroid.acik')).toBeVisible({ timeout: 90000 });
  expect(hatalar).toEqual([]);
});

test('dikey telefon 390×844: salon, yakın çekim ve akşam', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('pati/?test=1&sifirla=1');
  await page.screenshot({ path: 'tests/screens/pati-dikey-acilis.png' });
  await page.locator('[data-yas=buyuk]').click();
  await expect.poll(async () => (await durum(page)).faz, { timeout: 15000 }).toBe('gun');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'tests/screens/pati-dikey-salon.png' });
  // raf ekranın içinde, eşyalar en az 72 px
  await page.locator('[data-kose=tarcin]').dispatchEvent('click');
  await expect.poll(async () => { const r = (await page.locator('.pt-raf.acik').boundingBox())!; return r.y + r.height; }).toBeLessThanOrEqual(844);
  const raf = (await page.locator('.pt-raf.acik').boundingBox())!;
  expect(raf.x).toBeGreaterThanOrEqual(0);
  const oge = (await page.locator('.pt-raf-esya').first().boundingBox())!;
  expect(Math.min(oge.width, oge.height)).toBeGreaterThanOrEqual(72);
  await page.locator('.pt-ust .yuvarlak').first().click();
  await gunuOyna(page, 'dikey');
  await aksamVeFoto(page, 'dikey');
  expect(hatalar).toEqual([]);
});
