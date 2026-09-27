/**
 * Sesli Maceralar: Mino Banyo Yapmıyor! — dokunarak baştan sona (3-4 ve 5-6 yaş), konsol hatası yok.
 * Oyun her görevde sahneye data-bn-gorev (ve ovalama/çamurda data-bn-hedef) yazar; test onu okuyup parmakla oynar.
 * Ayrıca gerçek hızda (?onizleme=1) bir .webm kaydı alınır: tests/screens/macera-banyo-<proje>.webm
 */
import { expect, test, type Locator, type Page } from '@playwright/test';
import fs from 'node:fs';
import { hataTopla } from './yardimci';

const SAHNE = '.bn-sahne';

async function merkez(l: Locator) {
  const k = (await l.boundingBox())!;
  return { x: k.x + k.width / 2, y: k.y + k.height / 2, k };
}
async function dokun(page: Page, l: Locator) {
  const { x, y } = await merkez(l);
  await page.mouse.click(x, y);
}
async function surukle(page: Page, kaynak: Locator, hedef: Locator | { x: number; y: number }, adim = 12) {
  const a = await merkez(kaynak);
  const b = 'x' in hedef ? hedef : await merkez(hedef);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  for (let i = 1; i <= adim; i++) await page.mouse.move(a.x + ((b.x - a.x) * i) / adim, a.y + ((b.y - a.y) * i) / adim);
  await page.mouse.up();
}
/** Bir noktanın çevresinde zikzak (ovalama / silme) */
async function zikzak(page: Page, x: number, y: number, en: number, boy: number, kez = 14) {
  for (let i = 0; i < kez; i++) await page.mouse.move(x + (i % 2 ? en : -en), y + ((i % 4) - 1.5) * (boy / 3), { steps: 3 });
}
async function gorev(page: Page) {
  return (await page.locator(SAHNE).getAttribute('data-bn-gorev')) ?? '';
}
async function hedef(page: Page) {
  return (await page.locator(SAHNE).getAttribute('data-bn-hedef')) ?? '';
}
async function gorevBekle(page: Page, adlar: string[], ms = 30000) {
  await expect.poll(() => gorev(page), { timeout: ms }).toMatch(new RegExp(`^(${adlar.join('|')})$`));
  return gorev(page);
}
const bolge = (page: Page, id: string) => page.locator(`circle.bn-bolge[data-bolge="${id}"]`);

/** Bölümü baştan sona dokunarak oyna; ekran: ad → görüntü al */
async function oyna(page: Page, ekran: (ad: string) => Promise<unknown>, gercekHiz = false) {
  const T = gercekHiz ? 90000 : 30000;
  // 1. çamur
  await gorevBekle(page, ['camur'], T);
  await ekran('01-camur');
  while (true) {
    const g = await gorevBekle(page, ['camur', 'camur-bekle', 'fular'], T);
    if (g === 'fular') break;
    if (g === 'camur-bekle') {
      await page.waitForTimeout(80);
      continue;
    }
    const id = await hedef(page);
    if (!id) continue;
    await dokun(page, bolge(page, id));
    await page.waitForTimeout(gercekHiz ? 400 : 120);
  }
  // 2. fularlar ve saklambaç
  await ekran('02-fular');
  for (const renk of ['kirmizi', 'mavi']) {
    await surukle(page, page.locator(`.bn-fular[data-renk="${renk}"]`), page.locator('.bn-askilik-hedef'));
    await page.waitForTimeout(200);
  }
  for (let i = 0; i < 3; i++) {
    await gorevBekle(page, ['bul'], T);
    await page.waitForTimeout(gercekHiz ? 2600 : 150);
    if (i === 1) await ekran('03-saklambac');
    // saklandığı yer: kuyruk ucunun ve dikizin çıktığı alan
    await dokun(page, page.locator('.bn-sakli-hedef'));
    await expect.poll(() => gorev(page), { timeout: T }).not.toBe('bul');
  }
  // 3. su
  await gorevBekle(page, ['musluk'], T);
  await dokun(page, page.locator('.bn-musluk[data-renk="kirmizi"]'));
  await page.waitForTimeout(gercekHiz ? 2500 : 100);
  await dokun(page, page.locator('.bn-musluk[data-renk="mavi"]'));
  await page.waitForTimeout(300);
  await ekran('04-su');
  await gorevBekle(page, ['kapat'], T);
  await dokun(page, page.locator('.bn-musluk[data-renk="kirmizi"]'));
  await dokun(page, page.locator('.bn-musluk[data-renk="mavi"]'));
  // 4. köpük ve baloncuk
  await gorevBekle(page, ['kopuk'], T);
  await surukle(page, page.locator('.bn-sise-kopuk'), page.locator('.bn-su-on'));
  await gorevBekle(page, ['ufle'], T);
  await ekran('05-baloncuk');
  let ufleEkran = false;
  while ((await gorev(page)) === 'ufle') {
    const { x, y } = await merkez(page.locator('.bn-halka'));
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.waitForTimeout(gercekHiz ? 1200 : 700);
    if (!ufleEkran) {
      ufleEkran = true;
      await ekran('05b-ufle');
    }
    await page.waitForTimeout(gercekHiz ? 0 : 500);
    await page.mouse.up();
    await page.waitForTimeout(gercekHiz ? 2600 : 400);
  }
  await page.waitForTimeout(gercekHiz ? 1200 : 200);
  await ekran('06-slap');
  // 5. köpürt
  let sacEkran = false;
  let ovaEkran = false;
  while (true) {
    const g = await gorevBekle(page, ['sampuan', 'ova', 'sac'], T);
    if (g === 'sac') break;
    const id = await hedef(page);
    if (g === 'sampuan') {
      await surukle(page, page.locator('.bn-sise-sampuan'), bolge(page, id || 'mino-kafa'));
      await page.waitForTimeout(300);
      continue;
    }
    if (!id) continue;
    const { x, y, k } = await merkez(bolge(page, id));
    await page.mouse.move(x, y);
    await page.mouse.down();
    if (!ovaEkran && id === 'mino-kulak') {
      // ovalamanın ortası: köpük ve ilerleme halkası
      await zikzak(page, x, y, Math.max(8, k.width * 0.35), k.height * 0.4, 2);
      await ekran('07b-ova');
      ovaEkran = true;
    }
    await zikzak(page, x, y, Math.max(8, k.width * 0.35), k.height * 0.4, 16);
    await page.mouse.up();
    if (!sacEkran && id === 'mino-kuyruk') {
      await ekran('07-kopurt');
      sacEkran = true;
    }
    await page.waitForTimeout(150);
  }
  for (let i = 0; i < 3; i++) {
    await dokun(page, bolge(page, 'kino-kafa'));
    await page.waitForTimeout(gercekHiz ? 900 : 150);
  }
  await ekran('08-kopuk-sac');
  await dokun(page, page.locator('.mc-buyuk-dugme'));
  // 6. duş, uluma, tıpa
  await gorevBekle(page, ['dus'], T);
  // kamera (duşu kadraja alan çekim) otursun; konumlar her turda yeniden ölçülür
  await page.waitForTimeout(800);
  const dus = await merkez(page.locator('.bn-dus'));
  await page.mouse.move(dus.x, dus.y);
  await page.mouse.down();
  for (let tur = 0; tur < 40 && (await gorev(page)) === 'dus'; tur++) {
    const mino = await merkez(page.locator('[data-kisi="mino"] .bn-cizim'));
    const kino = await merkez(page.locator('[data-kisi="kino"] .bn-cizim'));
    const ust = Math.min(mino.k.y, kino.k.y) - 10;
    const sol = Math.min(mino.k.x, kino.k.x);
    const sag = Math.max(mino.k.x + mino.k.width, kino.k.x + kino.k.width);
    const [a, b] = tur % 2 ? [sag, sol] : [sol, sag];
    for (let i = 0; i <= 24; i++) {
      await page.mouse.move(a + ((b - a) * i) / 24, ust + (i % 3) * 6);
      await page.waitForTimeout(gercekHiz ? 45 : 16);
      if (i === 12 && tur === 1) await ekran('09-dus');
    }
  }
  await page.mouse.up();
  await gorevBekle(page, ['ulu'], T);
  while ((await gorev(page)) === 'ulu') {
    const { x, y } = await merkez(bolge(page, 'kino-kafa'));
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y - 30, { steps: 5 });
    await page.waitForTimeout(gercekHiz ? 1400 : 500);
    await ekran('10-ulu');
    await page.mouse.up();
    await page.waitForTimeout(gercekHiz ? 1800 : 300);
  }
  await gorevBekle(page, ['tipa'], T);
  const halka = await merkez(page.locator('.bn-zincir-halka'));
  await page.mouse.move(halka.x, halka.y);
  await page.mouse.down();
  await page.mouse.move(halka.x, halka.y + 110, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(gercekHiz ? 1200 : 200);
  await ekran('11-gider');
  // 7. kurula, ekranı sil, tara
  for (const [ad, renk, kisi] of [
    ['havlu-kino', 'mavi', 'kino'],
    ['havlu-mino', 'turuncu', 'mino'],
  ] as const) {
    await gorevBekle(page, [ad], T);
    const hv = await merkez(page.locator(`.bn-havlu[data-renk="${renk}"]`));
    const k = await merkez(page.locator(`[data-kisi="${kisi}"] .bn-cizim`));
    // havlular üst üste: mavinin alt yarısından, turuncunun üst yarısından tut
    await page.mouse.move(hv.x, hv.y + hv.k.height * (renk === 'mavi' ? 0.28 : -0.2));
    await page.mouse.down();
    await page.mouse.move(k.x, k.y, { steps: 8 });
    for (let i = 0; i < 12 && (await gorev(page)) === ad; i++) await zikzak(page, k.x, k.y, k.k.width * 0.3, k.k.height * 0.5, 8);
    await page.mouse.up();
    if (ad === 'havlu-kino') {
      await gorevBekle(page, ['ekran'], T);
      await page.waitForTimeout(200);
      await ekran('12-ekran-damla');
      const vp = page.viewportSize()!;
      for (let i = 0; i < 12 && (await gorev(page)) === 'ekran'; i++) {
        await page.mouse.move(10, vp.height * 0.15);
        await page.mouse.down();
        for (let s = 0; s < 14; s++) await page.mouse.move(s % 2 ? vp.width - 10 : 10, vp.height * (0.15 + (s * 0.75) / 14), { steps: 6 });
        await page.mouse.up();
      }
    }
  }
  await page.waitForTimeout(gercekHiz ? 1500 : 200);
  await ekran('13-pofuduk');
  await gorevBekle(page, ['tara'], T);
  {
    const tr = await merkez(page.locator('.bn-tarak'));
    const m = await merkez(page.locator('[data-kisi="mino"] .bn-cizim'));
    await page.mouse.move(tr.x, tr.y);
    await page.mouse.down();
    for (let i = 0; i < 8 && (await gorev(page)) === 'tara'; i++) {
      await page.mouse.move(m.x, m.k.y + 10, { steps: 6 });
      await page.mouse.move(m.x, m.k.y + m.k.height * 0.9, { steps: 10 });
    }
    await page.mouse.up();
  }
  // 8. toplan, fularlar, ayna
  await gorevBekle(page, ['sepet'], T);
  for (const renk of ['turuncu', 'mavi']) {
    await surukle(page, page.locator(`.bn-havlu[data-renk="${renk}"]`), page.locator('.bn-sepet:not(.bn-sepet-on)'));
    await page.waitForTimeout(300);
  }
  await page.waitForTimeout(gercekHiz ? 600 : 200);
  await ekran('13b-sepet');
  await gorevBekle(page, ['ordek'], T);
  await surukle(page, page.locator('.bn-ordek-kap'), page.locator('.bn-raf-hedef'));
  await gorevBekle(page, ['fular-tak'], T);
  await surukle(page, page.locator('.bn-fular[data-renk="kirmizi"]'), page.locator('[data-kisi="mino"] .bn-cizim'));
  await page.waitForTimeout(300);
  await surukle(page, page.locator('.bn-fular[data-renk="mavi"]'), page.locator('[data-kisi="kino"] .bn-cizim'));
  await gorevBekle(page, ['ayna'], T);
  await page.waitForTimeout(300);
  await ekran('14-ayna');
  const cam = await merkez(page.locator('.bn-bugu'));
  for (let i = 0; i < 10 && (await gorev(page)) === 'ayna'; i++) {
    await page.mouse.move(cam.x, cam.y);
    await page.mouse.down();
    await zikzak(page, cam.x, cam.y, cam.k.width * 0.4, cam.k.height * 0.8, 16);
    await page.mouse.up();
  }
  await page.waitForTimeout(gercekHiz ? 2500 : 300);
  await ekran('15-temiz');
  await expect(page.locator('.mc-son')).toBeVisible({ timeout: gercekHiz ? 120000 : 30000 });
  await page.waitForTimeout(400);
  await ekran('16-son');
}

for (const yas of [3, 6]) {
  test(`Mino Banyo Yapmıyor: dokunarak baştan sona (${yas} yaş)`, async ({ page }, info) => {
    test.setTimeout(480_000);
    const hatalar = hataTopla(page);
    await page.goto(`./macera/?test=1&ekran=bolum&yas=${yas}&bolum=banyo`);
    const p = info.project.name;
    await oyna(page, (ad) => page.screenshot({ path: `tests/screens/${p}-banyo-${yas}yas-${ad}.png` }));
    expect(hatalar).toEqual([]);
  });
}

test('Mino Banyo Yapmıyor: açılış kartı', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./macera/?test=1&yas=5');
  await expect(page.locator('.bn-bolum-kart')).toBeVisible();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `tests/screens/${info.project.name}-banyo-acilis.png` });
  await page.locator('.bn-bolum-kart').click();
  await expect(page.locator('.bn-sahne')).toBeVisible({ timeout: 15000 });
  expect(hatalar).toEqual([]);
});

test('Mino Banyo Yapmıyor: gerçek hızda video', async ({ browser }, info) => {
  test.skip(!process.env.BANYO_VIDEO, 'video yalnız BANYO_VIDEO=1 ile (uzun sürer)');
  test.setTimeout(900_000);
  const dir = `tests/screens/video-${info.project.name}`;
  const vp = info.project.use.viewport ?? { width: 390, height: 844 };
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'tr-TR', baseURL: info.project.use.baseURL, recordVideo: { dir, size: vp } });
  const page = await ctx.newPage();
  const hatalar = hataTopla(page);
  await page.goto(`./macera/?onizleme=1&ekran=bolum&yas=5&bolum=banyo`);
  // BANYO_VIDEO_EKRAN=1: gerçek hızda ekran görüntüleri de (baloncuklar, köpük, saklambaç gerçek hızında görünür)
  const ekran = process.env.BANYO_VIDEO_EKRAN ? (ad: string) => page.screenshot({ path: `tests/screens/${info.project.name}-banyo-gercek-${ad}.png` }) : async () => undefined;
  await oyna(page, ekran, true);
  await page.waitForTimeout(1500);
  const video = page.video();
  await ctx.close();
  if (video) fs.copyFileSync(await video.path(), `tests/screens/macera-banyo-${info.project.name}.webm`);
  expect(hatalar).toEqual([]);
});
