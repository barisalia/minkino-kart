/**
 * Dedektif Mino · Vaka 3 "Kaybolan Yıldız Kurabiyeler" (/dedektif/?vaka=3; seçim ekranında henüz gizli): vaka baştan
 * sona (telefon ve tablet): un halkaları → boş yerleri say → kart (6 yanlış, 2 yanlış, 4 doğru) → pervazda kırıntı →
 * kart (kapı yanlış, pencere doğru) → üç patika (tohum, havuç, yıldız şeker) → kart (tohum yanlış, yıldız şeker doğru) →
 * yıldız şeker izi → el izi + tüy → kart (kuş ve kirpi yanlış: sincap parlar) → kovuklar (baykuş, kuyruk iki kez) →
 * Fındık "Mmf mmf!" → kovuğun içi → kart (aç ve parti yanlış, kiler doğru) → final (dört kurabiyeyi say, ikisini
 * Fındık'a sürükle) → çizgi roman → Vaka Dosyam'da üç vaka. Ayrıca: gizlilik, yerleşim (4 ekran), dönüş.
 * Kareler: tests/screens/vaka3-*.png (git'e girmez).
 */
import { expect, test, type Locator, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

/** zaman çarpanı (gerçek hızda beklemeler uzar) */
let Z = 1;
const adim = (page: Page) => page.locator('.dd-vaka').getAttribute('data-adim');
async function adimBekle(page: Page, beklenen: RegExp, timeout = 30_000) {
  await expect.poll(() => adim(page), { timeout: timeout * Z }).toMatch(beklenen);
}
async function ortasi(l: Locator): Promise<[number, number]> {
  const b = (await l.boundingBox())!;
  return [b.x + b.width / 2, b.y + b.height / 2];
}
async function surukle(page: Page, kaynak: Locator, hedef: Locator) {
  const [x0, y0] = await ortasi(kaynak);
  const [x1, y1] = await ortasi(hedef);
  await page.mouse.move(x0, y0);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(x0 + ((x1 - x0) * i) / 10, y0 + ((y1 - y0) * i) / 10);
  await page.waitForTimeout(60);
  await page.mouse.up();
}
async function ipucuBul(page: Page, id: string) {
  const ip = page.locator(`.dd-sahne [data-ipucu="${id}"]`);
  await expect(ip).toHaveCount(1);
  for (let d = 0; d < 6 && !(await ip.getAttribute('class'))?.includes('dd-alindi'); d++) {
    await page.waitForTimeout(250);
    const [x, y] = await ortasi(ip);
    await page.mouse.click(x, y);
  }
  await expect(ip).toHaveClass(/dd-alindi/, { timeout: 5000 * Z });
}
async function dokun(page: Page, l: Locator) {
  await page.waitForTimeout(120);
  const [x, y] = await ortasi(l);
  await page.mouse.click(x, y);
}
/** Sayma: her öğeye sırayla dokun, rakamı belirmeden sonrakine geçme (fazla dokunuş açılan kartlara gitmesin) */
async function say(page: Page, secici: string) {
  const n = await page.locator(secici).count();
  for (let i = 0; i < n; i++) {
    const d = page.locator(secici).nth(i);
    await expect(d).toBeVisible();
    await dokun(page, d);
    await expect(d).toHaveClass(/sayildi/, { timeout: 5000 * Z });
  }
}
/** Kart sorusunda bir kartı fotoğrafa sürükle; yanlışsa soluklaşmasını bekle */
async function kart(page: Page, id: string, yanlis: boolean) {
  const k = page.locator(`.dd-sorgu .dd-kart[data-kart="${id}"]`);
  await surukle(page, k, page.locator('.dd-sorgu .dd-delil'));
  if (Z > 1) {
    await page.waitForTimeout(1600);
    await page.screenshot({ path: ekranAdi(`kart-${id}`, 'gercek') });
  }
  if (yanlis) await expect(k).toHaveClass(/dd-soluk/, { timeout: 20_000 * Z });
}
let ekranAdi = (ad: string, proje: string) => `tests/screens/vaka3-${ad}${proje === 'iphone' ? '' : '-' + proje}.png`;

test('Dedektif Vaka 3: oyunda gizli; ?vaka3=1 ile üçüncü dosya (Vaka 2 çözülmeden kilitli)', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./dedektif/?test=1&sifirla=1&cozuldu=2');
  await expect(page.locator('.dd-klasor')).toHaveCount(2);
  await expect(page.locator('.dd-klasor[data-vaka="vaka3"]')).toHaveCount(0);
  await page.goto('./dedektif/?test=1&sifirla=1&cozuldu=1&vaka3=1');
  await expect(page.locator('.dd-klasor')).toHaveCount(3);
  await expect(page.locator('.dd-klasor[data-vaka="vaka3"]')).toHaveClass(/dd-kilitli/);
  await page.goto('./dedektif/?test=1&sifirla=1&cozuldu=2&vaka3=1');
  await expect(page.locator('.dd-klasor[data-vaka="vaka3"]')).not.toHaveClass(/dd-kilitli/);
  await page.waitForTimeout(400);
  await page.screenshot({ path: ekranAdi('secim', test.info().project.name) });
  await page.locator('.dd-klasor[data-vaka="vaka3"]').click();
  await adimBekle(page, /^(giris|ara-sayi)$/);
  expect(hatalar).toEqual([]);
});

/**
 * Vakayı baştan sona oynar. gercek: gerçek hızda (?onizleme=1: konuşmalar ve canlandırmalar tam sürer; yalnız elle,
 * VAKA3_GERCEK=<klasör> ile: her adımın karesi o klasöre); değilse test hızında (?test=1).
 */
async function oyna(page: Page, p: string, gercek: string | null) {
  const hatalar = hataTopla(page);
  Z = gercek ? 8 : 1;
  if (gercek) ekranAdi = (ad: string) => `${gercek}/vaka3-${ad}.png`;
  await page.goto(gercek ? './dedektif/?onizleme=1&sifirla=1&cozuldu=2&ekran=vaka3' : './dedektif/?test=1&sifirla=1&cozuldu=2&vaka=3&ekran=vaka3');
  if (gercek) {
    await page.mouse.click(5, 200);
    for (const [re, ad] of [[/^giris$/, 'giris-1'], [/^giris$/, 'giris-2'], [/^giris$/, 'giris-3']] as const) {
      await adimBekle(page, re);
      await page.waitForTimeout(2500);
      await page.screenshot({ path: ekranAdi(ad, p) });
    }
  }

  // Halka 1: un halkaları, say, kart
  await adimBekle(page, /^ara-sayi$/);
  await expect(page.locator('.dd-vaka3 .dd-goz')).toHaveCount(5);
  await expect(page.locator('.dd-goz[data-halka="yol"] .dd-goz-fotolar img')).toHaveCount(1);
  await page.screenshot({ path: ekranAdi('halka1-ara', p) });
  await ipucuBul(page, 'un');
  await adimBekle(page, /^say$/);
  await say(page, '.dd-sahne .dd-v3-say');
  await expect(page.locator('.dd-sahne .dd-v3-say.sayildi')).toHaveCount(4);
  await adimBekle(page, /^kart$/);
  await page.screenshot({ path: ekranAdi('halka1-kartlar', p) });
  await kart(page, 'kurabiye-6', true);
  await kart(page, 'kurabiye-2', true);
  await expect(page.locator('.dd-sorgu .dd-kart[data-kart="kurabiye-4"]')).toHaveClass(/dd-parla/);
  await kart(page, 'kurabiye-4', false);
  await adimBekle(page, /^(demek-sayi|ara-cikis)$/);

  // Halka 2: pervazda kırıntı; kapı yanlış, pencere doğru; Kino pencereye kafasını sokar
  await adimBekle(page, /^ara-cikis$/);
  await ipucuBul(page, 'kirinti');
  await adimBekle(page, /^kart$/);
  await kart(page, 'kapi', true);
  await kart(page, 'pencere', false);
  await adimBekle(page, /^(demek-cikis|kino-pencere|ara-yol)$/);

  // Halka 3: üç patika; tohum yanlış (kuş), yıldız şeker doğru; şeker izi
  await adimBekle(page, /^ara-yol$/);
  for (const id of ['tohum', 'havuc', 'seker']) await ipucuBul(page, id);
  await adimBekle(page, /^kart$/);
  await page.screenshot({ path: ekranAdi('halka3-kartlar', p) });
  await kart(page, 'tohum', true);
  await kart(page, 'yildiz-seker', false);
  await adimBekle(page, /^seker-izi$/);
  for (let i = 0; i < 7; i++) {
    const s = page.locator(`.dd-sahne .dd-v3-seker[data-iz="${i}"]`);
    await expect.poll(async () => {
      const b = await s.boundingBox();
      return !!b && b.x > 0 && b.x + b.width < (page.viewportSize()?.width ?? 0);
    }).toBe(true);
    await dokun(page, s);
    await expect(s).toHaveClass(/dd-yandi/);
  }
  await adimBekle(page, /^(demek-yol|ara-kim)$/);

  // Halka 4: el izi + tüy; kuş ve kirpi yanlış, sincap parlar ve doğru
  await adimBekle(page, /^ara-kim$/);
  await ipucuBul(page, 'el-izi');
  await ipucuBul(page, 'tuy');
  await adimBekle(page, /^kart$/);
  await kart(page, 'kus', true);
  await kart(page, 'kirpi', true);
  await expect(page.locator('.dd-sorgu .dd-kart[data-kart="sincap"]')).toHaveClass(/dd-parla/);
  await page.screenshot({ path: ekranAdi('halka4-kartlar', p) });
  await kart(page, 'sincap', false);

  // Kovuklar: baykuş uyanır, kuyruk kaçar, ikinci dokunuşta Fındık fırlar
  await adimBekle(page, /^ara-kovuk$/, 40_000);
  await page.screenshot({ path: ekranAdi('kovuklar', p) });
  await ipucuBul2(page, 'baykus');
  await ipucuBul2(page, 'kuyruk');
  // (ilk dokunuşta kuyruk kaçar; yeniden sarkınca ikinci dokunuş Fındık'ı çıkarır)
  await adimBekle(page, /^(kuyruk|findik|mmf|ara-neden)$/);
  if ((await adim(page)) === 'kuyruk') await dokun(page, page.locator('.dd-sahne [data-ipucu="kuyruk"]'));
  await adimBekle(page, /^(findik|mmf|ara-neden)$/);
  await page.screenshot({ path: ekranAdi('findik', p) });

  // Halka 5: kovuğun içi; aç ve parti yanlış, kiler doğru
  await adimBekle(page, /^ara-neden$/, 40_000);
  await ipucuBul(page, 'kurabiyeler');
  await ipucuBul(page, 'kar-tanesi');
  await adimBekle(page, /^kart$/);
  await kart(page, 'ac', true);
  await kart(page, 'parti', true);
  await kart(page, 'kiler', false);
  await adimBekle(page, /^(demek-neden|final|final-say)$/);
  await expect(page.locator('.dd-goz.dd-cozuldu')).toHaveCount(5);

  // Final: dört kurabiyeyi say, ikisini Fındık'a sürükle
  await adimBekle(page, /^final-say$/, 30_000);
  await say(page, '.dd-sahne .dd-v3-final-kurabiye');
  await adimBekle(page, /^(sormak|ver)$/);
  await adimBekle(page, /^ver$/, 30_000);
  await page.screenshot({ path: ekranAdi('final-ver', p) });
  for (let i = 0; i < 2; i++) {
    const k = page.locator('.dd-sahne .dd-v3-final-kurabiye.dd-v3-tasinir:not(.verildi)').first();
    await surukle(page, k, page.locator('.dd-sahne .dd-v3-findik'));
    await page.waitForTimeout(400);
  }
  await adimBekle(page, /^(saril|palamut|son|roman|bitti)$/);

  // Ödül: 4 kareli çizgi roman, mühür, kayıt
  await adimBekle(page, /^bitti$/, 60_000);
  await expect(page.locator('.dd-roman[data-vaka="vaka3"] .dd-kare.geldi')).toHaveCount(4);
  await page.waitForTimeout(400);
  await page.screenshot({ path: ekranAdi('roman', p) });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-dedektif-v1') ?? '{}').cozulen)).toContain('vaka3');
  await page.locator('.dd-rd-dosya').click();
  await expect(page.locator('.dd-vaka-kart.dd-cozulmus')).toHaveCount(3);
  expect(hatalar).toEqual([]);
}

test('Dedektif Vaka 3: vaka baştan sona, çizgi roman, üç vakalı Vaka Dosyam', async ({ page }, info) => {
  test.setTimeout(400_000);
  await oyna(page, info.project.name, null);
});

// gerçek hızda, yatay telefon (844×390, DPR 3): yalnız elle (VAKA3_GERCEK=<kare klasörü> npx playwright test -g "gerçek hız");
// başka boy: VAKA3_BOYUT=390x844 (dikey sahneler) ya da 768x1024 (tablet, DPR 2)
test('Dedektif Vaka 3: gerçek hız, yatay telefon', async ({ browser }, info) => {
  const klasor = process.env.VAKA3_GERCEK;
  test.skip(!klasor || info.project.name !== 'iphone', 'elle çalıştırılır');
  test.setTimeout(1_200_000);
  const [en, boy] = (process.env.VAKA3_BOYUT ?? '844x390').split('x').map(Number);
  const ctx = await browser.newContext({ baseURL: info.project.use.baseURL, viewport: { width: en, height: boy }, deviceScaleFactor: Math.min(en, boy) >= 600 ? 2 : 3, isMobile: true, hasTouch: true, locale: 'tr-TR' });
  const page = await ctx.newPage();
  await oyna(page, 'gercek', klasor!);
  await ctx.close();
});

/** Kovuk araması: hedefi mercekle gör, sonra dokun */
async function ipucuBul2(page: Page, id: string) {
  const ip = page.locator(`.dd-sahne [data-ipucu="${id}"]`);
  for (let d = 0; d < 4 && !(await ip.getAttribute('class'))?.includes('dd-goruldu'); d++) {
    await page.waitForTimeout(250);
    const [x, y] = await ortasi(ip);
    await page.mouse.click(x, y);
  }
  await page.waitForTimeout(200);
  const [x, y] = await ortasi(ip);
  await page.mouse.click(x, y);
  await page.waitForTimeout(300);
}

for (const [en, boy] of [
  [844, 390],
  [932, 430],
  [667, 375],
  [1024, 768],
  [390, 844],
] as const) {
  test(`Dedektif Vaka 3: ${en}×${boy} yerleşim (ipuçları, kartlar, kovuklar, final ekranda)`, async ({ page }) => {
    test.skip(test.info().project.name !== 'iphone', 'bir kez yeter');
    const hatalar = hataTopla(page);
    await page.setViewportSize({ width: en, height: boy });
    const icinde = async (l: Locator, ad: string) => {
      for (const k of await l.evaluateAll((x) => x.map((e) => e.getBoundingClientRect().toJSON() as DOMRect))) {
        expect(k.x, `${ad} sol`).toBeGreaterThanOrEqual(-1);
        expect(k.y, `${ad} üst`).toBeGreaterThanOrEqual(-1);
        expect(k.x + k.width, `${ad} sağ`).toBeLessThanOrEqual(en + 1);
        expect(k.y + k.height, `${ad} alt`).toBeLessThanOrEqual(boy + 1);
      }
    };
    // ipucu: ortası ekranda, üst çubuğun altında (kenarı taşabilir: büyüteç camın herhangi bir yerinde görür)
    const ortada = async (l: Locator, ad: string) => {
      for (const k of await l.evaluateAll((x) => x.map((e) => e.getBoundingClientRect().toJSON() as DOMRect))) {
        expect(k.x + k.width / 2, `${ad} yatay`).toBeGreaterThan(8);
        expect(k.x + k.width / 2, `${ad} yatay`).toBeLessThan(en - 8);
        expect(k.y + k.height / 2, `${ad} dikey`).toBeGreaterThan(60);
        expect(k.y + k.height / 2, `${ad} dikey`).toBeLessThan(boy - 8);
      }
    };
    for (const [a, bekle, ipuclari] of [
      ['sayi', /^ara-sayi$/, ['un']],
      ['cikis', /^ara-cikis$/, ['kirinti']],
      ['yol', /^ara-yol$/, ['tohum', 'havuc', 'seker']],
      ['kim', /^ara-kim$/, ['el-izi', 'tuy']],
      ['neden', /^ara-neden$/, ['kurabiyeler', 'kar-tanesi']],
    ] as const) {
      await page.goto(`./dedektif/?test=1&ekran=vaka3&adim=${a}`);
      await adimBekle(page, bekle);
      await page.waitForTimeout(200);
      for (const id of ipuclari) await ortada(page.locator(`.dd-sahne [data-ipucu="${id}"]`), `${a}/${id}`);
      await page.screenshot({ path: `tests/screens/vaka3-${a}-${en}x${boy}.png` });
      for (const id of ipuclari) await ipucuBul(page, id);
      if (a === 'sayi') {
        await adimBekle(page, /^say$/);
        await icinde(page.locator('.dd-sahne .dd-v3-say'), 'sayma');
        await say(page, '.dd-sahne .dd-v3-say');
      }
      await adimBekle(page, /^kart$/);
      await page.waitForTimeout(700);
      await icinde(page.locator('.dd-sorgu .dd-kart'), 'kart');
      await icinde(page.locator('.dd-sorgu .dd-delil'), 'delil');
      await page.screenshot({ path: `tests/screens/vaka3-${a}-kart-${en}x${boy}.png` });
    }
    await page.goto('./dedektif/?test=1&ekran=vaka3&adim=kovuk');
    await adimBekle(page, /^ara-kovuk$/);
    await ortada(page.locator('.dd-sahne [data-ipucu="kuyruk"]'), 'kuyruk');
    await page.goto('./dedektif/?test=1&ekran=vaka3&adim=final');
    await adimBekle(page, /^final-say$/);
    await icinde(page.locator('.dd-sahne .dd-v3-final-kurabiye'), 'final kurabiye');
    await ortada(page.locator('.dd-sahne .dd-v3-findik'), 'Fındık');
    await page.screenshot({ path: `tests/screens/vaka3-final-${en}x${boy}.png` });
    expect(hatalar).toEqual([]);
  });
}

// web sitesinde yön serbest: vakanın ortasında dönünce iş ekranda kalır
for (const [ad, bas, son] of [
  ['yataydan dikeye', { width: 844, height: 390 }, { width: 390, height: 844 }],
  ['dikeyden yataya', { width: 390, height: 844 }, { width: 844, height: 390 }],
] as const) {
  test(`Dedektif Vaka 3: telefon ${ad} dönünce (DPR 3) ipuçları ve şeker izi ekranda`, async ({ browser }, info) => {
    test.skip(info.project.name !== 'iphone', 'bir kez yeter');
    const ctx = await browser.newContext({ baseURL: info.project.use.baseURL, viewport: bas, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: 'tr-TR' });
    const page = await ctx.newPage();
    const hatalar = hataTopla(page);
    const don = async (b: { width: number; height: number }) => {
      await page.setViewportSize(b);
      await expect.poll(() => page.evaluate(() => innerWidth)).toBe(b.width);
      await page.waitForTimeout(400);
    };
    await page.goto('./dedektif/?test=1&sifirla=1&ekran=vaka3&adim=yol');
    await adimBekle(page, /^ara-yol$/);
    await don(son);
    for (const id of ['tohum', 'havuc', 'seker']) await ipucuBul(page, id);
    await adimBekle(page, /^kart$/);
    await page.screenshot({ path: `tests/screens/vaka3-donus-${son.width}x${son.height}.png` });
    expect(hatalar).toEqual([]);
    await ctx.close();
  });
}

// ---------------------------------------------------------------- kod incelemesinin bulduğu hatalar
test('Dedektif Vaka 3: Halka 4 delilinde el izi + kızıl tüy; 2 yanlışta tüy kabarır', async ({ page }, info) => {
  test.skip(info.project.name !== 'iphone', 'bir kez yeter');
  const hatalar = hataTopla(page);
  await page.goto('./dedektif/?test=1&sifirla=1&ekran=vaka3&adim=kim');
  await adimBekle(page, /^ara-kim$/);
  await ipucuBul(page, 'el-izi');
  await ipucuBul(page, 'tuy');
  await adimBekle(page, /^kart$/);
  const tuy = page.locator('.dd-sorgu .dd-delil-ekk img');
  await expect(tuy).toHaveCount(1);
  await expect.poll(() => tuy.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  await kart(page, 'kus', true);
  await kart(page, 'kirpi', true);
  await expect(page.locator('.dd-sorgu .dd-delil-ekk')).toHaveClass(/dd-isil/);
  await page.screenshot({ path: 'tests/screens/vaka3-halka4-tuy.png' });
  expect(hatalar).toEqual([]);
});

// gerçek hızda (koklama ~4 sn sürer): Kino koklarken ipucu bulunur, arama biter
test('Dedektif Vaka 3: arama bitince koklamaya giden Kino geri döner, adım bozulmaz', async ({ page }, info) => {
  test.skip(info.project.name !== 'iphone', 'bir kez yeter');
  test.setTimeout(90_000);
  const hatalar = hataTopla(page);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('./dedektif/?onizleme=1&sifirla=1&ekran=vaka3&adim=sayi');
  await page.mouse.click(5, 200);
  await adimBekle(page, /^kokla-un$/, 30_000);
  await expect(page.locator('.dd-oyuncular')).toHaveClass(/dd-onde/);
  // gerçek hızda mercek yavaş kayar: görülene, sonra alınana dek dokun
  const un = page.locator('.dd-sahne [data-ipucu="un"]');
  for (let d = 0; d < 20 && !(await un.getAttribute('class'))?.includes('dd-alindi'); d++) {
    const [x, y] = await ortasi(un);
    await page.mouse.click(x, y);
    await page.waitForTimeout(350);
  }
  await expect(un).toHaveClass(/dd-alindi/);
  await adimBekle(page, /^say$/, 10_000);
  await expect(page.locator('.dd-oyuncular')).not.toHaveClass(/dd-onde/, { timeout: 1500 });
  // Kino yerine döner (hareket katmanı başlangıç yerinde)
  await expect
    .poll(() => page.locator('.dd-kino-yer > .dd-hareket').evaluate((e) => new DOMMatrix(getComputedStyle(e).transform).m41 ** 2 + new DOMMatrix(getComputedStyle(e).transform).m42 ** 2), { timeout: 3000 })
    .toBeLessThan(1);
  await page.waitForTimeout(1500);
  expect(await adim(page)).toBe('say');
  expect(hatalar).toEqual([]);
});

test('Dedektif Vaka 3: kovuklar (gerçek hız): baykuşa art arda dokunmak birikmez; arama bitince kovuklar sönmüş', async ({ page }, info) => {
  test.skip(info.project.name !== 'iphone', 'bir kez yeter');
  test.setTimeout(150_000);
  const hatalar = hataTopla(page);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('./dedektif/?onizleme=1&sifirla=1&cozuldu=2&ekran=vaka3&adim=kovuk');
  await page.mouse.click(5, 200);
  await adimBekle(page, /^ara-kovuk$/, 30_000);
  await ipucuBul2(page, 'baykus');
  // baykuş tepki verirken art arda dokunuşlar: tek sallanma (söz de tek)
  const baykus = page.locator('.dd-sahne [data-ipucu="baykus"]');
  const [bx, by] = await ortasi(baykus);
  for (let i = 0; i < 6; i++) {
    await page.mouse.click(bx, by);
    await page.waitForTimeout(90);
  }
  expect(await page.locator('.dd-sahne .dd-v3-baykus').evaluate((b) => b.getAnimations().length)).toBeLessThanOrEqual(1);
  await ipucuBul2(page, 'kuyruk');
  await adimBekle(page, /^(kuyruk|findik|mmf)$/, 20_000);
  // arama bitti: hiçbir kovukta aranıyor / görüldü işareti (nabız halkası, göz kırpan yıldız, soluk baykuş) kalmaz
  await expect(page.locator('.dd-sahne .dd-ipucu.dd-aranan, .dd-sahne .dd-ipucu.dd-goruldu')).toHaveCount(0);
  if ((await adim(page)) === 'kuyruk') await dokun(page, page.locator('.dd-sahne [data-ipucu="kuyruk"]'));
  await adimBekle(page, /^(findik|mmf)$/, 20_000);
  await expect(page.locator('.dd-sahne .dd-ipucu.dd-aranan, .dd-sahne .dd-ipucu.dd-goruldu')).toHaveCount(0);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'tests/screens/vaka3-findik-kovuklar-sonuk.png' });
  expect(hatalar).toEqual([]);
});

test('Dedektif Vaka 3: Vaka Dosyam romanı kareleri hazır olunca açılır (boş kare yok)', async ({ page }, info) => {
  test.skip(info.project.name !== 'iphone', 'bir kez yeter');
  const hatalar = hataTopla(page);
  await page.goto('./dedektif/?test=1&sifirla=1&cozuldu=3&vaka3=1&ekran=dosya');
  await page.locator('.dd-vaka-kart[data-vaka="vaka3"]').click();
  const kareler = page.locator('.dd-roman[data-vaka="vaka3"] img.dd-kare-resim');
  await expect(kareler).toHaveCount(4);
  for (const s of await kareler.evaluateAll((x) => x.map((i) => (i as HTMLImageElement).getAttribute('src') ?? ''))) expect(s.length).toBeGreaterThan(0);
  await expect.poll(() => kareler.evaluateAll((x) => x.every((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0))).toBe(true);
  expect(hatalar).toEqual([]);
});

test('Dedektif Vaka 3: finalde Fındık\'a en yakın iki kurabiye de verilir; ikisi verilince kalanlar taşınmaz', async ({ page }, info) => {
  test.skip(info.project.name !== 'iphone', 'bir kez yeter');
  const hatalar = hataTopla(page);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('./dedektif/?test=1&sifirla=1&ekran=vaka3&adim=final');
  await adimBekle(page, /^final-say$/);
  await say(page, '.dd-sahne .dd-v3-final-kurabiye');
  await adimBekle(page, /^ver$/);
  const kur = page.locator('.dd-sahne .dd-v3-final-kurabiye');
  await expect(page.locator('.dd-sahne .dd-v3-final-kurabiye.dd-v3-tasinir')).toHaveCount(4);
  // sağdaki kurabiye Fındık'ın arkasında kalmaz
  const sag = (await kur.nth(3).boundingBox())!;
  const f = (await page.locator('.dd-sahne .dd-v3-findik').boundingBox())!;
  expect(sag.x + sag.width).toBeLessThanOrEqual(f.x + f.width * 0.2);
  await surukle(page, kur.nth(3), page.locator('.dd-sahne .dd-v3-findik'));
  await expect(kur.nth(3)).toHaveClass(/verildi/);
  await surukle(page, kur.nth(2), page.locator('.dd-sahne .dd-v3-findik'));
  await expect(kur.nth(2)).toHaveClass(/verildi/);
  await adimBekle(page, /^(saril|palamut|son|roman|bitti)$/);
  await expect(kur.nth(0)).not.toHaveClass(/dd-v3-tasinir|verildi/);
  await expect(kur.nth(1)).not.toHaveClass(/dd-v3-tasinir|verildi/);
  expect(hatalar).toEqual([]);
});

for (const [en, boy] of [
  [844, 390],
  [667, 375],
  [1024, 768],
  [768, 1024],
] as const) {
  test(`Dedektif Vaka 3: Halka 2'de (${en}×${boy}) tepsi ya bütünüyle ekranda ya da sönük`, async ({ page }, info) => {
    test.skip(info.project.name !== 'iphone', 'bir kez yeter');
    await page.setViewportSize({ width: en, height: boy });
    await page.goto('./dedektif/?test=1&sifirla=1&ekran=vaka3&adim=cikis');
    await adimBekle(page, /^ara-cikis$/);
    await page.waitForTimeout(1200);
    const t = await page.locator('.dd-sahne .dd-v3-tepsi').evaluate((e) => ({ r: e.getBoundingClientRect().toJSON() as DOMRect, o: Number(getComputedStyle(e).opacity) }));
    const icinde = t.r.x >= -1 && t.r.y >= -1 && t.r.x + t.r.width <= en + 1 && t.r.y + t.r.height <= boy + 1;
    expect(icinde || t.o === 0, JSON.stringify(t)).toBe(true);
  });
}

// ---------------------------------------------------------------- vakadan çıkınca hiçbir şey sürmez
/**
 * Sayfaya kanca: çıkıştan (__iz.kesik) sonra tıklayan setInterval'ler (geç kurulanlar da), yeni Web Audio sesleri (osilatör,
 * tampon), müzik / konuşma çalma, kopmuş (ekrandan kalkmış) öğelerin ölçülmesi (el ipucu döngüsü kaynak() ile ölçer).
 */
async function izKur(page: Page) {
  await page.addInitScript(() => {
    const z = { kesik: false, tik: {} as Record<string, number>, ses: 0, oynat: 0, kopuk: 0, kopukNe: [] as string[] };
    (window as unknown as { __iz: typeof z }).__iz = z;
    const si = window.setInterval.bind(window);
    let no = 0;
    // uygulamanın genel ninni müziği (src/audio/muzik.ts: 100 ms'lik planlayıcı) her ekranda çalar: sayılmaz
    let muzikte = false;
    window.setInterval = ((fn: TimerHandler, ms?: number, ...a: unknown[]) => {
      const muzik = ms === 100;
      const ad = `${++no}@${ms}${z.kesik ? ' (çıkıştan sonra kuruldu)' : ''}:${(new Error().stack ?? '').split('\n').slice(2, 4).join(' ').replace(/\s+/g, ' ').slice(0, 160)}`;
      return si(() => {
        if (z.kesik && !muzik) z.tik[ad] = (z.tik[ad] ?? 0) + 1;
        muzikte = muzik;
        try {
          if (typeof fn === 'function') (fn as (...x: unknown[]) => void)(...a);
        } finally {
          muzikte = false;
        }
      }, ms);
    }) as typeof window.setInterval;
    const AC = window.AudioContext.prototype as unknown as Record<string, (...x: unknown[]) => unknown>;
    for (const m of ['createOscillator', 'createBufferSource']) {
      const asil = AC[m];
      AC[m] = function (this: AudioContext, ...x: unknown[]) {
        if (z.kesik && !muzikte) z.ses++;
        return asil.apply(this, x);
      };
    }
    const oyn = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
      if (z.kesik) z.oynat++;
      return oyn.call(this);
    };
    if (window.speechSynthesis) {
      const konus = window.speechSynthesis.speak.bind(window.speechSynthesis);
      window.speechSynthesis.speak = (u: SpeechSynthesisUtterance) => {
        if (z.kesik) z.oynat++;
        konus(u);
      };
    }
    const olc = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function (this: Element) {
      if (z.kesik && !this.isConnected) {
        z.kopuk++;
        if (z.kopukNe.length < 5) z.kopukNe.push(String(this.className).slice(0, 60));
      }
      return olc.call(this);
    };
  });
}
type Iz = { tik: Record<string, number>; ses: number; oynat: number; kopuk: number; kopukNe: string[] };
const iz = (page: Page) => page.evaluate(() => (window as unknown as { __iz: Iz }).__iz);
/** Geri ile çık; çıkış geçişi bitince 3 sn boyunca: eski zamanlayıcı tıkı, yeni ses, kopuk ölçüm, el ipucu yok */
async function cikVeDinle(page: Page) {
  await page.evaluate(() => ((window as unknown as { __iz: { kesik: boolean } }).__iz.kesik = true));
  await page.locator('.dd-vaka3 .dd-geri').click();
  await expect(page.locator('.dd-vaka3')).toHaveCount(0, { timeout: 5000 });
  await page.waitForTimeout(1500);
  const a = await iz(page);
  await page.waitForTimeout(3000);
  const b = await iz(page);
  const tiklar = Object.entries(b.tik).filter(([ad, n]) => n > (a.tik[ad] ?? 0));
  expect(tiklar, 'çıkıştan sonra tıklamaya devam eden zamanlayıcı').toEqual([]);
  expect(b.ses - a.ses, 'çıkıştan sonra yeni ses').toBe(0);
  expect(b.oynat - a.oynat, 'çıkıştan sonra müzik / konuşma').toBe(0);
  expect(b.kopuk, `kalkmış ekranı ölçen döngü (${b.kopukNe.join(', ')})`).toBe(0);
  await expect(page.locator('.dd-parmak')).toHaveCount(0);
}

test('Dedektif Vaka 3: finalde (kurabiyeler uçarken, gerçek hız) çıkınca ses, zamanlayıcı, döngü sürmez', async ({ page }, info) => {
  test.skip(info.project.name !== 'iphone', 'bir kez yeter');
  test.setTimeout(90_000);
  const hatalar = hataTopla(page);
  await page.setViewportSize({ width: 844, height: 390 });
  await izKur(page);
  await page.goto('./dedektif/?onizleme=1&sifirla=1&cozuldu=2&ekran=vaka3&adim=final');
  // ses motoru açılsın (dokunuş)
  await page.mouse.click(5, 200);
  await adimBekle(page, /^final$/);
  await page.waitForTimeout(1600);
  expect(await adim(page)).toBe('final');
  await cikVeDinle(page);
  expect(hatalar).toEqual([]);
});

test('Dedektif Vaka 3: kurabiye verirken (el ipucu açık) çıkınca el döngüsü ve zamanlayıcılar durur', async ({ page }, info) => {
  test.skip(info.project.name !== 'iphone', 'bir kez yeter');
  const hatalar = hataTopla(page);
  await izKur(page);
  await page.goto('./dedektif/?test=1&sifirla=1&cozuldu=2&ekran=vaka3&adim=final');
  await adimBekle(page, /^final-say$/);
  await say(page, '.dd-sahne .dd-v3-final-kurabiye');
  await adimBekle(page, /^ver$/);
  await expect(page.locator('.dd-vaka3 .dd-parmak')).toHaveCount(1, { timeout: 5000 });
  await cikVeDinle(page);
  expect(hatalar).toEqual([]);
});

test('Dedektif Vaka 3: sayarken çıkınca sayma yardımı durur', async ({ page }, info) => {
  test.skip(info.project.name !== 'iphone', 'bir kez yeter');
  const hatalar = hataTopla(page);
  await izKur(page);
  await page.goto('./dedektif/?test=1&sifirla=1&cozuldu=2&ekran=vaka3&adim=final');
  await adimBekle(page, /^final-say$/);
  await cikVeDinle(page);
  expect(hatalar).toEqual([]);
});
