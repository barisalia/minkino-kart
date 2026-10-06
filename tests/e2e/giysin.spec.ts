/**
 * Kino Ne Giysin? · Kış / Kardan adam (/giysin/): tur baştan sona (telefon ve tablet).
 * Perdeye dokunulur, dolap açılır; şort kışa uymaz (Kino titrer, şort dolaba döner); bot çoraptan önce giyilir,
 * çorap botun üstüne geçer (sıra şakası, ikisi de döner); sonra doğru sırayla çorap, bot, mont, bere, eldiven.
 * Ayna, kapı, dış sahne (kardan adam), fotoğraf albüme girer. Kareler: tests/screens/giysin-e2e-*.png (git'e girmez).
 */
import { expect, test, type Locator, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

const adim = (page: Page) => page.locator('.gy-ekran').first().getAttribute('data-adim');
async function adimBekle(page: Page, beklenen: RegExp, timeout = 20_000) {
  await expect.poll(() => adim(page), { timeout }).toMatch(beklenen);
}
async function ortasi(l: Locator): Promise<[number, number]> {
  const b = (await l.boundingBox())!;
  return [b.x + b.width / 2, b.y + b.height / 2];
}
async function dokun(page: Page, l: Locator) {
  await page.waitForTimeout(120);
  const [x, y] = await ortasi(l);
  await page.mouse.click(x, y);
}
/** Giysiyi Kino'nun tuvalinde (2048) bir noktaya sürükle */
async function giydir(page: Page, id: string, tx: number, ty: number) {
  const kaynak = page.locator(`.gy-giysi[data-giysi="${id}"]`);
  await expect(kaynak).not.toHaveClass(/bos/);
  const [x0, y0] = await ortasi(kaynak);
  const k = (await page.locator('.gy-kino').first().boundingBox())!;
  const x1 = k.x + (tx / 2048) * k.width, y1 = k.y + (ty / 2048) * k.height + 18;
  await page.mouse.move(x0, y0);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(x0 + ((x1 - x0) * i) / 10, y0 + ((y1 - y0) * i) / 10);
  await page.mouse.up();
  await page.waitForTimeout(250);
}
const kinodaki = (page: Page, id: string) => page.locator(`.gy-kino g[data-giysi="${id}"]`).first().evaluate((g) => (g as SVGGElement).style.opacity === '1');

test('Kino Ne Giysin? kış turu: perde, dolap, tepkiler, sıra, ayna, kapı, kardan adam, albüm', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  const p = info.project.name;
  await page.goto('./giysin/index.html?test=1&sifirla=1');
  await adimBekle(page, /perde/);
  await page.locator('.gy-kino svg').first().waitFor();
  await page.screenshot({ path: `tests/screens/giysin-e2e-istek-${p}.png` });
  await dokun(page, page.locator('.gy-pencere'));
  await adimBekle(page, /dolap/);
  await dokun(page, page.locator('.gy-dolap'));
  await adimBekle(page, /giyin/);
  await expect(page.locator('.gy-raf.acik')).toHaveCount(1);
  await page.screenshot({ path: `tests/screens/giysin-e2e-dolap-${p}.png` });

  // şort kışa uymaz: oturur, sonra dolaba döner
  await giydir(page, 'sort', 1030, 1600);
  await expect.poll(() => kinodaki(page, 'sort')).toBe(false);
  await expect(page.locator('.gy-giysi[data-giysi="sort"]')).not.toHaveClass(/bos/);
  // önce bot, sonra çorap: çorap botun üstüne geçer, ikisi de döner, çorap parlar
  await giydir(page, 'bot', 1050, 1810);
  await expect.poll(() => kinodaki(page, 'bot')).toBe(true);
  await giydir(page, 'corap', 1050, 1810);
  await expect.poll(() => kinodaki(page, 'bot')).toBe(false);
  await expect(page.locator('.gy-giysi[data-giysi="corap"]')).toHaveClass(/ipucu/);
  // yanlış yer: bere ayağa → dolaba döner
  await giydir(page, 'bere', 1050, 1810);
  await expect.poll(() => kinodaki(page, 'bere')).toBe(false);
  // doğru sıra
  for (const [id, x, y] of [['corap', 1050, 1810], ['bot', 1050, 1810], ['mont', 1030, 1390], ['bere', 975, 330], ['eldiven', 715, 1540]] as const) {
    await giydir(page, id, x, y);
    await expect.poll(() => kinodaki(page, id), { message: id }).toBe(true);
  }
  await page.screenshot({ path: `tests/screens/giysin-e2e-giyik-${p}.png` });
  // ayna, kamera kapıya kayar
  await adimBekle(page, /kapi/);
  await page.waitForTimeout(300);
  await dokun(page, page.locator('.gy-kapi'));
  // dış sahne: kardan adam, fotoğraf, albüm
  await expect(page.locator('.gy-dis')).toHaveCount(1, { timeout: 10_000 });
  await expect(page.locator('.gy-son.acik')).toHaveCount(1, { timeout: 15_000 });
  await page.screenshot({ path: `tests/screens/giysin-e2e-dis-${p}.png` });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-giysin-v1') ?? '{}').album)).toEqual(['kis']);
  await dokun(page, page.locator('.gy-album-dugme'));
  await expect(page.locator('.gy-album-sayfa.kis.dolu')).toHaveCount(1);
  await page.screenshot({ path: `tests/screens/giysin-e2e-album-${p}.png` });
  // yeniden oynanır
  expect(hatalar).toEqual([]);
});
