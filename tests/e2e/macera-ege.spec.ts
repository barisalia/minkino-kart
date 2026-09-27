import { expect, test, type Locator, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

/** Bölüm 2 (Şşş, Ege Uyuyor!): sahne 1-4 dokunarak baştan sona (mikrofonsuz), 3 ve 5 yaş. */

const merkez = async (l: Locator, oy = 0.5) => {
  const b = (await l.boundingBox())!;
  return { x: b.x + b.width / 2, y: b.y + b.height * oy };
};
async function surukle(page: Page, kaynak: Locator, hedef: Locator | { x: number; y: number }, hedefOy = 0.5) {
  const a = await merkez(kaynak);
  const b = 'x' in hedef ? hedef : await merkez(hedef, hedefOy);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  for (let i = 1; i <= 12; i++) {
    const t = i / 12;
    await page.mouse.move(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
    await page.waitForTimeout(16);
  }
  await page.mouse.up();
}
async function dokun(page: Page, l: Locator) {
  const a = await merkez(l);
  await page.mouse.click(a.x, a.y);
}
const ekran = (page: Page, ad: string, proje: string) => page.screenshot({ path: `tests/screens/${proje}-${ad}.png` });

for (const yas of [3, 5] as const) {
  test(`Ege Uyuyor: sahne 1-4 dokunarak (${yas} yaş)`, async ({ page }, info) => {
    test.setTimeout(240_000);
    const hatalar = hataTopla(page);
    const p = `${info.project.name}-${yas}yas`;
    const ege = (ad: string) => page.locator(`[data-ege="${ad}"]`);
    await page.goto(`./macera/?test=1&ekran=bolum&yas=${yas}&bolum=ege`);

    // 1. anneye battaniye
    await expect(ege('battaniye')).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(300);
    await ekran(page, '200-ege-anne', p);
    // yanlış yere bırak: geri kayar, iz çıkar
    await surukle(page, ege('battaniye'), { x: 200, y: 200 });
    await page.waitForTimeout(250);
    await ekran(page, '201-ege-iz', p);
    await page.waitForTimeout(700);
    await surukle(page, ege('battaniye'), ege('anne'));
    await expect(ege('anne')).toHaveClass(/gulumsuyor/, { timeout: 5000 });

    // 2. sepette çıngırak
    await expect(ege('kup')).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(300);
    await ekran(page, '202-ege-sepet', p);
    await dokun(page, ege('ordek'));
    await page.waitForTimeout(150);
    await surukle(page, ege('top'), { x: 60, y: 700 });
    for (const ad of ['kup', 'kitap']) {
      await dokun(page, ege(ad));
      await page.waitForTimeout(150);
    }
    await expect(ege('cingirak')).toHaveClass(/parliyor/, { timeout: 8000 });
    await ekran(page, '203-ege-cingirak', p);
    await dokun(page, ege('cingirak'));
    // salla: 3-4 yaş 3 tık; 5-6 yaş ritmi tekrarla (tık-tık … tık)
    await expect(page.locator('.mc-ipucu.acik')).toHaveText(yas <= 4 ? /şaklat/ : /ritmi/, { timeout: 20000 });
    await page.waitForTimeout(yas <= 4 ? 200 : 900);
    for (const bekle of [0, 320, 700]) {
      await page.waitForTimeout(yas <= 4 ? 250 : bekle);
      await dokun(page, ege('cingirak'));
    }
    await ekran(page, '204-ege-salla', p);

    // 3. mama: önlük, kaşıklar, peçete
    await expect(ege('onluk')).toBeVisible({ timeout: 25000 });
    await page.waitForTimeout(500);
    await ekran(page, '205-ege-mama', p);
    await surukle(page, ege('onluk'), ege('bebek'), 0.72);
    const kasik = ege('kasik');
    await expect(kasik).toBeVisible({ timeout: 10000 });
    const tur = yas <= 4 ? 3 : 4;
    for (let i = 0; i < tur; i++) {
      await expect(kasik).not.toHaveClass(/dolu/, { timeout: 10000 });
      await page.waitForTimeout(300);
      await surukle(page, kasik, ege('kase'));
      await expect(kasik).toHaveClass(/sicak/, { timeout: 5000 });
      if (i === 0) {
        // sıcakken verirse Ege surat asar, kaşık döner
        await page.waitForTimeout(250);
        await surukle(page, kasik, ege('bebek'), 0.5);
        await expect(ege('bebek')).toHaveAttribute('data-ifade', 'buzuk', { timeout: 3000 });
        await page.waitForTimeout(900);
      }
      // üfle: kaşığa basılı tut
      const k = await merkez(kasik);
      await page.mouse.move(k.x, k.y);
      await page.mouse.down();
      if (i === 1) {
        await page.waitForTimeout(500);
        await ekran(page, '206-ege-ufle', p);
      }
      await expect(kasik).not.toHaveClass(/sicak/, { timeout: 6000 });
      await page.mouse.up();
      await page.waitForTimeout(300);
      await surukle(page, kasik, ege('bebek'), 0.5);
      await expect(ege('bebek')).toHaveAttribute('data-ifade', /am|kikir/, { timeout: 5000 });
    }
    await expect(ege('pecete')).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(400);
    await ekran(page, '207-ege-mamali', p);
    for (let i = 0; i < 12 && (await ege('pecete').count()); i++) {
      const a = await merkez(ege('pecete'));
      const b = await merkez(ege('bebek'), 0.5);
      await page.mouse.move(a.x, a.y);
      await page.mouse.down();
      for (let j = 0; j <= 30; j++) {
        const t = Math.min(1, j / 8);
        const s = Math.sin(j * 0.9) * 26;
        await page.mouse.move(a.x + (b.x - a.x) * t + s, a.y + (b.y - a.y) * t + Math.cos(j * 1.3) * 18);
        await page.waitForTimeout(12);
      }
      await page.mouse.up();
      await page.waitForTimeout(250);
    }
    await expect(ege('pecete')).toHaveCount(0, { timeout: 5000 });

    // 4. kuklalar
    await expect(ege('kukla-ayi')).toBeVisible({ timeout: 25000 });
    await page.waitForTimeout(700);
    await ekran(page, '208-ege-kutu', p);
    await surukle(page, ege('kukla-ayi'), page.locator('.mc-oyuncu[data-ad="ada"]'));
    await page.waitForTimeout(300);
    await surukle(page, ege('kukla-civciv'), page.locator('.mc-oyuncu[data-ad="can"]'));
    await expect(page.locator('.mc-ipucu.acik')).toHaveText(/İnce/, { timeout: 15000 });
    await dokun(page, ege('kukla-civciv'));
    await page.waitForTimeout(400);
    await ekran(page, '209-ege-civciv', p);
    await expect(page.locator('.mc-ipucu.acik')).toHaveText(/Kalın/, { timeout: 15000 });
    await dokun(page, ege('kukla-ayi'));
    await expect(page.locator('.mc-ipucu.acik')).toHaveText(/İnce ya da kalın/, { timeout: 15000 });
    const serbest = yas <= 4 ? 3 : 4;
    for (let i = 0; i < serbest; i++) {
      await page.waitForTimeout(250);
      await dokun(page, ege(i % 2 ? 'kukla-ayi' : 'kukla-civciv'));
      await page.waitForTimeout(1300);
    }
    await ekran(page, '210-ege-kahkaha', p);
    await expect(page.locator('.mc-son')).toBeVisible({ timeout: 20000 });
    expect(hatalar).toEqual([]);
  });
}

test('Sesli Maceralar: açılışta Bölüm 2 kartı', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./macera/?test=1&yas=5');
  await expect(page.locator('.eg-bolum-kart')).toBeVisible();
  await page.waitForTimeout(300);
  await ekran(page, '199-macera-acilis-bolum2', info.project.name);
  await page.locator('.eg-bolum-kart').click();
  await expect(page.locator('.eg-sahne')).toBeVisible({ timeout: 10000 });
  expect(hatalar).toEqual([]);
});
