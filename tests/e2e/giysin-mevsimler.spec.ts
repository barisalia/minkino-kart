/**
 * Kino Ne Giysin? · İlkbahar, Yaz, Sonbahar (/giysin/?mevsim=…): her mevsimin turu baştan sona (telefon ve tablet).
 * Perde, dolap; mevsime uymayan bir giysi Kino'da komik tepkiyle döner (ilkbahar: sandalet çamura batar, yaz: bere
 * terletir, sonbahar: hırka ıslanır); gerekli giysiler sırayla; küçük görev (yaz: güneş kremi, sonbahar: şemsiyeyi aç);
 * ayna, kapı, dış sahne, fotoğraf albüme. Sonbahar dördüncü sayfayı doldurunca Mevsim Ustası rozeti gelir.
 * Kareler: tests/screens/giysin-<mevsim>-*.png (git'e girmez).
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
/** Kino'nun tuvalinde (2048) bir noktaya dokun */
async function kinoyaDokun(page: Page, tx: number, ty: number) {
  const k = (await page.locator('.gy-kino').first().boundingBox())!;
  await page.mouse.click(k.x + (tx / 2048) * k.width, k.y + (ty / 2048) * k.height);
  await page.waitForTimeout(60);
}
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
const kinodaki = (page: Page, id: string) => page.locator(`.gy-kino g[data-giysi="${id}"]`).evaluateAll((gs) => gs.some((g) => (g as SVGGElement).style.opacity === '1'));

const NOKTA: Record<string, [number, number]> = {
  bas: [975, 330], goz: [950, 730], govde: [1030, 1390], ayak: [1050, 1810], el: [1290, 1510],
};
const YER: Record<string, keyof typeof NOKTA> = {
  corap: 'ayak', cizme: 'ayak', sandalet: 'ayak', bot: 'ayak', hirka: 'govde', mont: 'govde', mayo: 'govde', yagmurluk: 'govde',
  sapka: 'bas', bere: 'bas', gozluk: 'goz', sepet: 'el', kova: 'el', semsiye: 'el',
};

interface Senaryo {
  mevsim: 'ilkbahar' | 'yaz' | 'sonbahar';
  uymaz: string;
  gerekli: string[];
  album?: string;
}
const SENARYOLAR: Senaryo[] = [
  { mevsim: 'ilkbahar', uymaz: 'sandalet', gerekli: ['corap', 'cizme', 'hirka', 'sepet'] },
  { mevsim: 'yaz', uymaz: 'bere', gerekli: ['mayo', 'sapka', 'gozluk', 'kova'] },
  { mevsim: 'sonbahar', uymaz: 'hirka', gerekli: ['corap', 'cizme', 'yagmurluk', 'semsiye'], album: 'kis,ilkbahar,yaz' },
];

for (const s of SENARYOLAR)
  test(`Kino Ne Giysin? ${s.mevsim} turu: tepki, giyinme, görev, dış sahne, albüm`, async ({ page }, info) => {
    const hatalar = hataTopla(page);
    const p = info.project.name;
    const ad = (k: string) => `tests/screens/giysin-${s.mevsim}-${k}-${p}.png`;
    await page.goto(`./giysin/index.html?test=1&sifirla=1&mevsim=${s.mevsim}${s.album ? `&album=${s.album}` : ''}`);
    await expect(page.locator(`.gy-ekran[data-mevsim="${s.mevsim}"]`)).toHaveCount(1);
    await adimBekle(page, /perde/);
    await page.locator('.gy-kino svg').first().waitFor();
    await dokun(page, page.locator('.gy-pencere'));
    await adimBekle(page, /dolap/);
    await page.screenshot({ path: ad('pencere') });
    await dokun(page, page.locator('.gy-dolap'));
    await adimBekle(page, /giyin/);
    await page.screenshot({ path: ad('dolap') });

    // mevsime uymayan giysi: oturur, Kino tepki verir, dolaba döner
    await giydir(page, s.uymaz, ...NOKTA[YER[s.uymaz]]);
    await expect.poll(() => kinodaki(page, s.uymaz), { timeout: 10_000 }).toBe(false);
    await expect(page.locator(`.gy-giysi[data-giysi="${s.uymaz}"]`)).not.toHaveClass(/bos/);
    for (const id of s.gerekli) {
      await giydir(page, id, ...NOKTA[YER[id]]);
      await expect.poll(() => kinodaki(page, id), { message: id, timeout: 10_000 }).toBe(true);
    }
    await page.screenshot({ path: ad('giyik') });
    // küçük görev
    if (s.mevsim === 'yaz') {
      await adimBekle(page, /gorev/);
      await expect(page.locator('.gy-krem-halka')).toHaveCount(3);
      await page.screenshot({ path: ad('krem') });
      for (const [x, y] of [[915, 845], [420, 900], [1590, 880]] as const) for (let i = 0; i < 3; i++) await kinoyaDokun(page, x, y);
    }
    if (s.mevsim === 'sonbahar') {
      await adimBekle(page, /gorev/);
      await kinoyaDokun(page, 1500, 1300);
      await expect.poll(() => page.locator('.gy-kino g[data-parca="semsiye-acik"]').first().evaluate((g) => (g as SVGGElement).style.opacity)).toBe('1');
    }
    await adimBekle(page, /kapi/);
    await page.waitForTimeout(300);
    await dokun(page, page.locator('.gy-kapi'));
    await expect(page.locator(`.gy-dis.${s.mevsim}`)).toHaveCount(1, { timeout: 10_000 });
    await page.screenshot({ path: ad('dis') });
    if (s.album) {
      // dört mevsim doldu: Mevsim Ustası
      await expect(page.locator('.gy-dis[data-rozet="1"]')).toHaveCount(1, { timeout: 15_000 });
      await page.screenshot({ path: ad('rozet') });
    }
    await expect(page.locator('.gy-son.acik')).toHaveCount(1, { timeout: 15_000 });
    await page.screenshot({ path: ad('son') });
    const album = await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-giysin-v1') ?? '{}'));
    expect(album.album).toContain(s.mevsim);
    if (s.album) expect(album.rozet).toBe(true);
    // sonraki mevsim düğmesi (sonbahardan sonra yok)
    await expect(page.locator('.gy-son-dugme.sonraki')).toHaveCount(s.mevsim === 'sonbahar' ? 0 : 1);
    await dokun(page, page.locator('.gy-album-dugme'));
    await expect(page.locator(`.gy-album-sayfa.${s.mevsim}.dolu`)).toHaveCount(1);
    if (s.album) await expect(page.locator('.gy-album-rozet')).toHaveCount(1);
    await page.waitForTimeout(400);
    await page.screenshot({ path: ad('album') });
    expect(hatalar).toEqual([]);
  });

test('Kino Ne Giysin? mevsim geçişi: kıştan ilkbahara, oda ilkbaharda açılır', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./giysin/index.html?test=1&sifirla=1&ekran=gecis&den=kis&mevsim=ilkbahar');
  // test modunda geçiş çok kısa: oda yeni mevsimde açılır
  await expect(page.locator('.gy-ekran.gy-oda-ekran[data-mevsim="ilkbahar"]')).toHaveCount(1, { timeout: 10_000 });
  expect(hatalar).toEqual([]);
});
