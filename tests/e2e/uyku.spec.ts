import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

/**
 * Uyku Vakti (uygulama/src/uyku.ts; bayrak UYKU_ACIK kapalı, testte ?uyku=1). Telefon önce: 844×390 ve 390×844 ayrı.
 * yardim=0: yardım merdiveni kapalı (dokunma / sürükleme testinde kendiliğinden ilerlemesin).
 */
const BOYLAR = [
  { ad: 'yatay', viewport: { width: 844, height: 390 } },
  { ad: 'dikey', viewport: { width: 390, height: 844 } },
];
const ANAHTAR = 'minkino-uyku-v1';

const adim = (page: Page) => page.locator('.ug-u-oda').getAttribute('data-adim');
const adimBekle = (page: Page, a: string, timeout = 15000) => expect.poll(() => adim(page), { timeout }).toBe(a);
/** Hareket bitene kadar bekler (eşya yerine oturdu) */
const tikla = async (page: Page, sec: string) => {
  await page.locator(sec).first().click({ force: true });
  await page.waitForTimeout(150);
};
async function surukle(page: Page, kaynak: string, hedef: string) {
  const a = (await page.locator(kaynak).first().boundingBox())!;
  const b = (await page.locator(hedef).first().boundingBox())!;
  const [x0, y0, x1, y1] = [a.x + a.width / 2, a.y + a.height / 2, b.x + b.width / 2, b.y + b.height / 2];
  await page.mouse.move(x0, y0);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(x0 + ((x1 - x0) * i) / 10, y0 + ((y1 - y0) * i) / 10);
  await page.mouse.up();
  await page.waitForTimeout(150);
}

/** Karakterlerin yüz kutusu ile görünen eşya / öbür karakter kutusu kesişimi (px²): 0 olmalı */
async function yuzOrtusmesi(page: Page): Promise<number> {
  return page.evaluate(() => {
    const yuz = (kim: string) => {
      const r = document.querySelector(`.ug-u-kar[data-kim="${kim}"]`)!.getBoundingClientRect();
      return { left: r.left + r.width * 0.3, right: r.left + r.width * 0.7, top: r.top + r.height * 0.22, bottom: r.top + r.height * 0.52 };
    };
    const kes = (a: { left: number; right: number; top: number; bottom: number }, b: DOMRect) =>
      Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    let t = 0;
    const esyalar = [...document.querySelectorAll<HTMLElement>('.ug-u-oyuncak:not(.ug-u-kemik-kino), .ug-u-yastik:not(.ug-u-yerinde), .ug-u-battaniye:not([data-durum="ortulu"]), .ug-u-yigin, .ug-u-lamba, .ug-u-komodin, .ug-u-sepet')].filter(
      (e) => getComputedStyle(e).opacity !== '0' && getComputedStyle(e).display !== 'none',
    );
    for (const kim of ['mino', 'kino']) {
      const y = yuz(kim);
      for (const e of esyalar) t += kes(y, e.getBoundingClientRect());
      t += kes(y, document.querySelector(`.ug-u-kar[data-kim="${kim === 'mino' ? 'kino' : 'mino'}"]`)!.getBoundingClientRect());
    }
    return Math.round(t);
  });
}

for (const boy of BOYLAR) {
  test.describe(`Uyku Vakti ${boy.ad}`, () => {
    test.use({ viewport: boy.viewport, deviceScaleFactor: 3 });
    test.beforeEach(({}, info) => test.skip(info.project.name !== 'iphone', 'telefon boyları ayrı veriliyor'));

    test('dokunarak (sürüklemesiz) baştan sona, kilit yazılır', async ({ page }, info) => {
      const hatalar = hataTopla(page);
      await page.goto('./?test=1&uyku=1&saat=21&ekran=uyku&yardim=0');
      await adimBekle(page, 'oyuncak');
      expect(await yuzOrtusmesi(page)).toBe(0);
      for (const a of ['top', 'kupler', 'tren']) await tikla(page, `.ug-u-oyuncak[data-ad="${a}"]`);
      await tikla(page, '.ug-u-oyuncak[data-ad="kemik"]');
      await adimBekle(page, 'yastik');
      await expect(page.locator('.ug-u-kemik-kino')).toHaveCount(1);
      await page.waitForTimeout(200);
      expect(await yuzOrtusmesi(page)).toBe(0);
      await tikla(page, '.ug-u-yastik[data-sahip="mino"]');
      await tikla(page, '.ug-u-yastik[data-sahip="kino"]');
      await adimBekle(page, 'battaniye');
      await expect(page.locator('.ug-u-kar.ug-u-yatakta')).toHaveCount(2);
      await page.waitForTimeout(200);
      expect(await yuzOrtusmesi(page)).toBe(0);
      await tikla(page, '.ug-u-battaniye[data-sahip="mino"]');
      await tikla(page, '.ug-u-battaniye[data-sahip="kino"]');
      // Kino bir kez tekmeler: battaniye yere yığılır, yığına dokununca yerinde kalır
      await expect(page.locator('.ug-u-yigin:not(.ug-u-yok)')).toHaveCount(1);
      await tikla(page, '.ug-u-yigin');
      await adimBekle(page, 'perde');
      await expect(page.locator('.ug-u-battaniye[data-sahip="kino"]')).toHaveAttribute('data-durum', 'ortulu');
      await tikla(page, '.ug-u-pencere');
      await adimBekle(page, 'lamba');
      await expect(page.locator('.ug-u-pencere')).toHaveAttribute('data-durum', 'kapali');
      await tikla(page, '.ug-u-lamba');
      await adimBekle(page, 'oda');
      await expect(page.locator('.ug-u-lamba')).toHaveAttribute('data-durum', 'yanik');
      await expect(page.locator('.ug-u-oda.ug-u-uyudu')).toHaveCount(1);
      expect(await page.evaluate((k) => localStorage.getItem(k), ANAHTAR)).toContain('bitti');
      // uykudaki karaktere dokununca uyanmaz
      await tikla(page, '.ug-u-kar[data-kim="kino"]');
      await expect(page.locator('.ug-u-oda')).toHaveAttribute('data-adim', 'oda');
      await page.screenshot({ path: `tests/screens/uyku-${boy.ad}-oda.png` });
      expect(hatalar).toEqual([]);
      void info;
    });

    test('sürükleyerek: yanlış yatağa bırakılan yastık geri seker', async ({ page }) => {
      const hatalar = hataTopla(page);
      await page.goto('./?test=1&uyku=1&saat=21&ekran=uyku&yardim=0');
      await adimBekle(page, 'oyuncak');
      for (const a of ['top', 'kupler', 'tren']) await surukle(page, `.ug-u-oyuncak[data-ad="${a}"]`, '.ug-u-sepet');
      await surukle(page, '.ug-u-oyuncak[data-ad="kemik"]', '.ug-u-kar[data-kim="kino"]');
      await adimBekle(page, 'yastik');
      // Mino'nun yastığı Kino'nun yatağına: geri seker, yerinde bekler
      await surukle(page, '.ug-u-yastik[data-sahip="mino"]', '.ug-u-yatak[data-sahip="kino"]');
      await page.waitForTimeout(500);
      await expect(page.locator('.ug-u-yastik[data-sahip="mino"]')).toHaveAttribute('data-yer', 'yastik-mino-bekle');
      await surukle(page, '.ug-u-yastik[data-sahip="mino"]', '.ug-u-yatak[data-sahip="mino"]');
      await surukle(page, '.ug-u-yastik[data-sahip="kino"]', '.ug-u-yatak[data-sahip="kino"]');
      await adimBekle(page, 'battaniye');
      await page.waitForTimeout(200);
      await surukle(page, '.ug-u-battaniye[data-sahip="mino"]', '.ug-u-yatak[data-sahip="mino"]');
      await surukle(page, '.ug-u-battaniye[data-sahip="kino"]', '.ug-u-yatak[data-sahip="kino"]');
      await expect(page.locator('.ug-u-yigin:not(.ug-u-yok)')).toHaveCount(1);
      await surukle(page, '.ug-u-yigin', '.ug-u-yatak[data-sahip="kino"]');
      await adimBekle(page, 'perde');
      await tikla(page, '.ug-u-pencere');
      await adimBekle(page, 'lamba');
      await tikla(page, '.ug-u-lamba');
      await adimBekle(page, 'oda');
      expect(hatalar).toEqual([]);
    });

    test('hiç dokunmadan: yardım merdiveniyle kendiliğinden biter', async ({ page }) => {
      const hatalar = hataTopla(page);
      await page.goto('./?test=1&uyku=1&saat=21&ekran=uyku');
      await adimBekle(page, 'oda', 60000);
      expect(await page.evaluate((k) => localStorage.getItem(k), ANAHTAR)).toContain('bitti');
      expect(hatalar).toEqual([]);
    });
  });
}

test.describe('Uyku Vakti menü ve kilit', () => {
  test.use({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 3 });
  test.beforeEach(({}, info) => test.skip(info.project.name !== 'iphone', 'telefon'));

  test('akşam ay lambası; gündüz ve bayrak kapalıyken yok', async ({ page }) => {
    const hatalar = hataTopla(page);
    await page.goto('./?test=1&uyku=1&saat=11');
    await expect(page.locator('.ug-menu')).toBeVisible();
    await expect(page.locator('.ug-ay-lamba')).toHaveCount(0);
    // bayrak kapalı (uyku=1 yok): akşam da yok, Ebeveyn Köşesi'nde düğme yok
    await page.goto('./?test=1&saat=21');
    await expect(page.locator('.ug-menu')).toBeVisible();
    await expect(page.locator('.ug-ay-lamba')).toHaveCount(0);
    await page.goto('./?test=1&saat=21&ekran=ayarlar');
    await expect(page.getByRole('button', { name: 'Uyku vaktini başlat' })).toHaveCount(0);
    await page.goto('./?test=1&uyku=1&saat=21');
    await expect(page.locator('.ug-ay-lamba')).toBeVisible();
    await page.locator('.ug-ay-lamba').click({ force: true });
    await expect(page.locator('.ug-u-oda')).toBeVisible();
    expect(hatalar).toEqual([]);
  });

  test('Ebeveyn Köşesi: "Uyku vaktini başlat" uyku ekranını açar', async ({ page }) => {
    await page.goto('./?test=1&uyku=1&saat=11&ekran=ayarlar');
    await page.getByRole('button', { name: 'Uyku vaktini başlat' }).click();
    await expect(page.locator('.ug-u-oda')).toBeVisible();
  });

  test('kilit: yeniden açılınca uyuyan oda; ebeveyn kapısı kilidi siler; sabah bir kez Günaydın', async ({ page }) => {
    const hatalar = hataTopla(page);
    // 21:00'de bitmiş ritüel (saat taklidiyle bugünün 21:00'i)
    await page.goto('./?test=1&uyku=1&saat=11');
    await page.evaluate((k) => {
      const d = new Date();
      d.setHours(21, 0, 0, 0);
      localStorage.setItem(k, JSON.stringify({ bitti: d.getTime() }));
    }, ANAHTAR);
    await page.goto('./?test=1&uyku=1&saat=22');
    await expect(page.locator('.ug-u-oda')).toHaveAttribute('data-adim', 'oda');
    await expect(page.locator('.ug-menu')).toHaveCount(0);
    // bayrak kapalıyken kilit hiç devreye girmez
    await page.goto('./?test=1&saat=22');
    await expect(page.locator('.ug-menu')).toBeVisible();
    // sabah 07:00: menü, Günaydın bir kez
    await page.goto('./?test=1&uyku=1&saat=7');
    await expect(page.locator('.ug-menu')).toHaveAttribute('data-gunaydin', '1');
    await page.goto('./?test=1&uyku=1&saat=7');
    await expect(page.locator('.ug-menu')).toBeVisible();
    await expect(page.locator('.ug-menu[data-gunaydin]')).toHaveCount(0);
    // yeniden kilit, ebeveyn kapısından geçilince menü ve kilit silinir
    await page.evaluate((k) => {
      const d = new Date();
      d.setHours(21, 0, 0, 0);
      localStorage.setItem(k, JSON.stringify({ bitti: d.getTime() }));
    }, ANAHTAR);
    await page.goto('./?test=1&uyku=1&saat=23');
    await expect(page.locator('.ug-u-oda')).toHaveAttribute('data-adim', 'oda');
    await page.locator('.ug-u-kapi').click();
    const soru = page.locator('.ebeveyn-kapisi .kapi-soru');
    const toplam = (await soru.getAttribute('data-toplam'))!;
    for (const r of toplam) await page.locator('.ebeveyn-kapisi .tus', { hasText: new RegExp(`^${r}$`) }).click();
    await page.getByRole('button', { name: 'tamam' }).click();
    await expect(page.locator('.ug-menu')).toBeVisible();
    expect(await page.evaluate((k) => localStorage.getItem(k), ANAHTAR)).toBeNull();
    expect(hatalar).toEqual([]);
  });
});
