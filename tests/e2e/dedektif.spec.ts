/**
 * Dedektif Mino · Vaka 1 "Devrilen Lamba" (/dedektif/): vaka baştan sona oynanır (telefon ve tablet).
 * Büyüteç ipucunun üstüne getirilir (dokununca mercek oraya gelir, ipucu belirir, dokununca dosyaya uçar), kartlar
 * ipucuna sürüklenir (bir yanlış kart da denenir: kendini anlatır, soluklaşır), izler sırayla yakılır, önce yanlış yol
 * (mutfak: Kino'nun sosis izleri), sonra yatak odası; kuyruğa dokunulur, lamba masaya sürüklenir, düğmesine basılır,
 * çizgi roman gelir, "Vaka Dosyam"a girer. Kareler: tests/screens/dedektif-*.png (git'e girmez).
 */
import { expect, test, type Locator, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

const adim = (page: Page) => page.locator('.dd-vaka').getAttribute('data-adim');
async function adimBekle(page: Page, beklenen: RegExp, timeout = 30_000) {
  await expect.poll(() => adim(page), { timeout }).toMatch(beklenen);
}
async function ortasi(l: Locator): Promise<[number, number]> {
  const b = (await l.boundingBox())!;
  return [b.x + b.width / 2, b.y + b.height / 2];
}
/** Ekranda gerçekten o noktaya dokun (üstünde başka bir şey varsa dokunuş ona gider: örtme hatası yakalanır) */
async function dokun(page: Page, l: Locator) {
  await page.waitForTimeout(150);
  const [x, y] = await ortasi(l);
  await page.mouse.click(x, y);
}
/** Fareyle sürükle (adım adım) */
async function surukle(page: Page, kaynak: Locator, hedef: Locator) {
  const [x0, y0] = await ortasi(kaynak);
  const [x1, y1] = await ortasi(hedef);
  await page.mouse.move(x0, y0);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(x0 + ((x1 - x0) * i) / 10, y0 + ((y1 - y0) * i) / 10);
  await page.mouse.up();
}
/** Büyüteçle ipucunu bul: ipucunun yerine dokun (mercek gelir, ipucu belirir), sonra ipucuna dokun */
async function ipucuBul(page: Page, id: string) {
  const ip = page.locator(`.dd-sahne [data-ipucu="${id}"]`);
  await expect(ip).toHaveCount(1);
  const [x, y] = await ortasi(ip);
  await page.mouse.click(x, y);
  await expect(ip).toHaveClass(/dd-alindi|dd-goruldu/);
  if (!(await ip.getAttribute('class'))?.includes('dd-alindi')) await page.mouse.click(x, y);
  await expect(ip).toHaveClass(/dd-alindi/);
}
/** Kart sorusu: doğru kartı ipucunun fotoğrafına sürükle */
async function dogruKart(page: Page) {
  await adimBekle(page, /^kart$/);
  await surukle(page, page.locator('.dd-kart[data-dogru="1"]'), page.locator('.dd-delil'));
}
/** İzleri sırayla yak (parlayana dokun) */
async function izleriYak(page: Page, oda: string) {
  const ad = `iz-takip-${oda}`;
  await adimBekle(page, new RegExp(`^${ad}$`));
  const bitis = Date.now() + 60_000;
  while (Date.now() < bitis && (await adim(page)) === ad) {
    const sirada = page.locator('.dd-sahne .dd-iz.dd-sirada');
    // parlayan ize parmakla dokun (kamera kayarken yeri değişebilir: her seferinde ölçülür)
    const b = (await sirada.count()) ? await sirada.first().boundingBox() : null;
    if (b) await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
    await page.waitForTimeout(80);
  }
}

test('Dedektif Mino: Vaka 1 baştan sona, çizgi roman ve Vaka Dosyam', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  const ad = info.project.name;
  await page.goto('./dedektif/?test=1&sifirla=1');
  // açılış: dedektif Mino, vaka dosyası
  await expect(page.locator('.dd-acilis .mino svg')).toBeVisible();
  await expect(page.locator('.dd-klasor[data-vaka="vaka1"]')).toBeVisible();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `tests/screens/dedektif-giris${ad === 'iphone' ? '' : '-' + ad}.png` });
  await page.locator('.dd-klasor[data-vaka="vaka1"]').click();

  // giriş → Halka 1: halıda pati izi
  await adimBekle(page, /^ara-iz$/);
  await expect(page.locator('.dd-mino-yer .mino.dedektif-sapka')).toHaveCount(1);
  // büyüteç ipucunun yakınında: ışıltı (kare için)
  const iz = page.locator('.dd-sahne [data-ipucu="pati-hali"]');
  const [ix, iy] = await ortasi(iz);
  await page.mouse.click(ix + 40, iy - 30);
  await page.waitForTimeout(200);
  await page.screenshot({ path: `tests/screens/dedektif-buyutec${ad === 'iphone' ? '' : '-' + ad}.png` });
  await ipucuBul(page, 'pati-hali');
  // dosyanın ilk gözüne yapıştı
  await expect(page.locator('.dd-goz[data-halka="iz"] .dd-goz-fotolar img')).toHaveCount(1);
  // kartlar: önce yanlış (zürafa: kendini anlatır, soluklaşır), sonra doğru
  await adimBekle(page, /^kart$/);
  await expect(page.locator('.dd-kart')).toHaveCount(3);
  await expect(page.locator('.dd-delil .dd-delil-foto')).toBeVisible();
  await page.waitForTimeout(200);
  await page.screenshot({ path: `tests/screens/dedektif-halka${ad === 'iphone' ? '' : '-' + ad}.png` });
  await surukle(page, page.locator('.dd-kart[data-kart="zurafa-ayagi"]'), page.locator('.dd-delil'));
  await expect(page.locator('.dd-kart[data-kart="zurafa-ayagi"]')).toHaveClass(/dd-soluk/);
  await surukle(page, page.locator('.dd-kart[data-kart="ordek-ayagi"]'), page.locator('.dd-delil'));
  await expect(page.locator('.dd-kart[data-kart="ordek-ayagi"]')).toHaveClass(/dd-soluk/);
  // 2 yanlıştan sonra doğru kart parlar
  await expect(page.locator('.dd-kart[data-kart="kedi-pati-izi"]')).toHaveClass(/dd-parla/);
  await dogruKart(page);
  await adimBekle(page, /^(demek-iz|ara-tuy)$/);
  await expect(page.locator('.dd-goz[data-halka="iz"]')).toHaveClass(/dd-cozuldu/);

  // Halka 2: masada beyaz tüy (dokunmak da olur: doğru karta dokun)
  await adimBekle(page, /^ara-tuy$/);
  await ipucuBul(page, 'tuy');
  await adimBekle(page, /^kart$/);
  await page.locator('.dd-kart[data-dogru="1"]').click();
  await adimBekle(page, /^(demek-tuy|ara-neden)$/);

  // Halka 3: pervazda sarı kanat tozu + pencerede kelebek; canlandırma
  await adimBekle(page, /^ara-neden$/);
  await ipucuBul(page, 'toz');
  await ipucuBul(page, 'kelebek');
  await dogruKart(page);
  await expect(page.locator('.dd-goz.dd-cozuldu')).toHaveCount(3);

  // Halka 4: izleri takip et → koridor → önce mutfak (yanlış), sonra yatak odası
  await izleriYak(page, 'calisma');
  await izleriYak(page, 'koridor');
  await adimBekle(page, /^yol-sec$/);
  await dokun(page, page.locator('.dd-sahne .dd-izler-yol[data-yol="mutfak"] .dd-iz').first());
  await adimBekle(page, /^mutfak$/);
  await adimBekle(page, /^yol-sec$/);
  await expect(page.locator('.dd-sahne .dd-izler-yol[data-yol="mutfak"]')).toHaveClass(/dd-soluk/);
  await dokun(page, page.locator('.dd-sahne .dd-izler-yol[data-yol="yatak"] .dd-iz').first());
  await izleriYak(page, 'yatak');
  // kuyruk ucuna dokun: Pamuk çıkar
  await adimBekle(page, /^kuyruk$/);
  await dokun(page, page.locator('.dd-sahne .dd-kuyruk'));
  await adimBekle(page, /^(pamuk|final|lamba-tasi)$/);
  await expect(page.locator('.dd-goz.dd-cozuldu')).toHaveCount(4);

  // Final: lambayı masaya sürükle, düğmesine bas
  await adimBekle(page, /^lamba-tasi$/);
  // (yüklü makinede kamera / yerleşim kayarken ilk sürükleme ıskalayabilir: çocuk gibi bir daha dener)
  for (let deneme = 0; deneme < 3 && (await adim(page)) === 'lamba-tasi'; deneme++) {
    await page.waitForTimeout(400);
    await surukle(page, page.locator('.dd-sahne .dd-lamba-devrik'), page.locator('.dd-sahne .dd-masa-hedef'));
    await page.waitForTimeout(600);
  }
  await adimBekle(page, /^lamba-dugme$/);
  await expect(page.locator('.dd-sahne .dd-lamba-dik')).toHaveClass(/dd-yerinde/);
  await dokun(page, page.locator('.dd-sahne .dd-lamba-dugme'));
  await expect(page.locator('.dd-sahne .dd-lamba-isik')).toHaveClass(/acik/);
  // Pamuk ışık yanınca Mino'yla Kino'nun arasına gelir, kelebeğe el sallanır
  await adimBekle(page, /^(kelebek|roman|bitti)$/);
  await expect(page.locator('.dd-pamuk-yer')).toHaveCount(1);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `tests/screens/dedektif-final${ad === 'iphone' ? '' : '-' + ad}.png` });

  // Ödül: 4 kareli çizgi roman, "Çözüldü!" mührü, kayıt
  await adimBekle(page, /^bitti$/, 40_000);
  await expect(page.locator('.dd-kare.geldi')).toHaveCount(4);
  await expect(page.locator('.dd-roman .dd-muhur.bas')).toBeVisible();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `tests/screens/dedektif-cizgi-roman${ad === 'iphone' ? '' : '-' + ad}.png` });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-dedektif-v1') ?? '{}').cozulen)).toEqual(['vaka1']);
  // Vaka Dosyam: çizgi roman kartı, dokununca roman açılır
  await page.locator('.dd-rd-dosya').click();
  await expect(page.locator('.dd-vaka-kart.dd-cozulmus')).toBeVisible();
  await page.locator('.dd-vaka-kart.dd-cozulmus').click();
  await expect(page.locator('.dd-dosya-ekran .dd-kare.geldi')).toHaveCount(4);
  expect(hatalar).toEqual([]);
});

test('Dedektif Mino: 10 sn bulunamazsa Kino koklar; büyüteç ve dosya ekranda', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./dedektif/?test=1&sifirla=1&adim=tuy&kokla=1200');
  await adimBekle(page, /^ara-tuy$/);
  // büyüteç ekranda, ipucu çıplak gözle görünmez
  await expect(page.locator('.bt-mercek:not(.bt-gizlendi)')).toHaveCount(1);
  expect(await page.locator('.dd-sahne [data-ipucu="tuy"]').evaluate((e) => getComputedStyle(e).opacity)).toBe('0');
  // Kino koklar (burnuyla yeri gösterir)
  await adimBekle(page, /^kokla-tuy$/, 15_000);
  await adimBekle(page, /^ara-tuy$/, 15_000);
  // merceğin kopyasında ipucu görünür
  expect(await page.locator('.bt-mercek .bt-kopya [data-ipucu="tuy"]').count()).toBe(1);
  expect(hatalar).toEqual([]);
});

for (const [en, boy] of [
  [844, 390],
  [932, 430],
  [1024, 768],
  [390, 844],
] as const) {
  test(`Dedektif Mino: ${en}×${boy} yerleşim (dosya, kartlar, oyuncular ekranda)`, async ({ page }) => {
    test.skip(test.info().project.name !== 'iphone', 'bir kez yeter');
    await page.setViewportSize({ width: en, height: boy });
    await page.goto('./dedektif/?test=1&sifirla=1&adim=iz');
    await adimBekle(page, /^ara-iz$/);
    await ipucuBul(page, 'pati-hali');
    await adimBekle(page, /^kart$/);
    const kutular = [
      ...(await page.locator('.dd-kart').evaluateAll((l) => l.map((e) => e.getBoundingClientRect().toJSON() as DOMRect))),
      (await page.locator('.dd-delil').boundingBox())!,
      (await page.locator('.dd-dosya').boundingBox())!,
    ];
    for (const k of kutular) {
      expect(k.x, 'sol').toBeGreaterThanOrEqual(-1);
      expect(k.y, 'üst').toBeGreaterThanOrEqual(-1);
      expect(k.x + k.width, 'sağ').toBeLessThanOrEqual(en + 1);
      expect(k.y + k.height, 'alt').toBeLessThanOrEqual(boy + 1);
    }
    // kartlar ipucunun fotoğrafının üstüne binmez, kartlar iri
    const d = (await page.locator('.dd-delil').boundingBox())!;
    for (const k of kutular.slice(0, 3)) {
      const ust = Math.min(k.x + k.width, d.x + d.width) - Math.max(k.x, d.x) > 2 && Math.min(k.y + k.height, d.y + d.height) - Math.max(k.y, d.y) > 2;
      expect(ust, 'kart fotoğrafın üstünde').toBe(false);
      expect(k.width).toBeGreaterThan(80);
    }
    await page.screenshot({ path: `tests/screens/dedektif-yerlesim-${en}x${boy}.png` });
  });
}
