/**
 * Sesli Maceralar Bölüm 2: Şşş, Ege Uyuyor! — dokunarak baştan sona (3-4 ve 5-6 yaş), konsol hatası yok.
 * Akış (ekip/senaryo/ege-duzeltme.md, 7 sahne): battaniye → mama → sepet + kuklalar → yatak → ninni → sessizlik + burun
 * → fısıltı.
 * Oyun her görevde sahneye data-eg-gorev yazar; test onu okuyup parmakla oynar (mikrofonsuz: her sesli görevin
 * dokunma karşılığı). 3 yaşta Mino'nun burnu tutulmaz (HAPŞU dalı: kısa ninni + kısa sessizlik), 5 yaşta tutulur.
 * Gerçek hızda (?onizleme=1) .webm kaydı: EGE_VIDEO=1 → tests/screens/macera-ege-<proje>.webm
 */
import { expect, test, type Locator, type Page } from '@playwright/test';
import fs from 'node:fs';
import { hataTopla } from './yardimci';

const SAHNE = '.eg-sahne';

async function merkez(l: Locator, ox = 0.5, oy = 0.5) {
  const k = (await l.boundingBox())!;
  return { x: k.x + k.width * ox, y: k.y + k.height * oy, k };
}
async function dokun(page: Page, l: Locator) {
  const { x, y } = await merkez(l);
  await page.mouse.click(x, y);
}
/** Kamera kayarken ya da eşya uçarken ölçülen yer eskir: kutu iki ölçümde aynı kalana kadar bekle (en çok ~3 sn) */
async function sabit(l: Locator) {
  let once = await l.boundingBox();
  for (let i = 0; i < 30; i++) {
    await l.page().waitForTimeout(100);
    const simdi = await l.boundingBox();
    if (once && simdi && Math.abs(once.x - simdi.x) < 1 && Math.abs(once.y - simdi.y) < 1 && Math.abs(once.width - simdi.width) < 1) return;
    once = simdi;
  }
}
async function surukle(page: Page, kaynak: Locator, hedef: Locator | { x: number; y: number }, adim = 14, yavas = false) {
  await sabit(kaynak);
  if (!('x' in hedef)) await sabit(hedef);
  const a = await merkez(kaynak);
  const b = 'x' in hedef ? hedef : await merkez(hedef);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  for (let i = 1; i <= adim; i++) {
    await page.mouse.move(a.x + ((b.x - a.x) * i) / adim, a.y + ((b.y - a.y) * i) / adim);
    if (yavas) await page.waitForTimeout(30);
  }
  await page.mouse.up();
}
async function gorev(page: Page) {
  return (await page.locator(SAHNE).getAttribute('data-eg-gorev')) ?? '';
}
async function gorevBekle(page: Page, adlar: string[], ms = 30000) {
  await expect.poll(() => gorev(page), { timeout: ms }).toMatch(new RegExp(`^(${adlar.join('|')})$`));
  return gorev(page);
}
const ege = (page: Page, ad: string) => page.locator(`[data-ege="${ad}"]`).first();

/** Bölümü baştan sona dokunarak oyna; ekran: ad → görüntü al */
async function oyna(page: Page, yas: number, ekran: (ad: string) => Promise<unknown>, gercekHiz = false) {
  const T = gercekHiz ? 90000 : 30000;
  const bekle = (test: number, gercek: number) => page.waitForTimeout(gercekHiz ? gercek : test);
  const vp = page.viewportSize()!;

  // 1. anneye battaniye (önce yanlış yere: iz çıkar; 3-4 yaşta battaniye kendiliğinden anneye süzülüp açılır,
  // 5-6 yaşta geri kayar, ikinci sürükleme anneye)
  await gorevBekle(page, ['battaniye'], T);
  await bekle(300, 900);
  await ekran('01-anne-uyudu');
  await surukle(page, ege(page, 'battaniye'), { x: vp.width * 0.85, y: vp.height * 0.35 });
  await bekle(250, 400);
  await ekran('02-yanlis-iz');
  if (yas >= 5) {
    await bekle(700, 1200);
    await surukle(page, ege(page, 'battaniye'), page.locator('[data-ege="anne"] .eg-anne-gov'), 14, gercekHiz);
  }
  await bekle(150, 700);
  await ekran('02a-battaniye-acilis');
  await expect(ege(page, 'anne')).toHaveClass(/gulumsuyor/, { timeout: 8000 });
  // anne kanepede oturuş çiziminde (aynı piksel ölçeği), açık battaniye omzundan ayak bileklerine örtülü
  await expect(ege(page, 'anne')).toHaveAttribute('data-resim', 'uyuyor');
  await expect(page.locator('.eg-anne-ortu.acik')).toHaveCount(1);
  await bekle(700, 1200);
  await ekran('02b-anne-ortu');

  // 2. mama: önlük, kaşıklar (üfle: basılı tut), peçete
  await gorevBekle(page, ['onluk'], T);
  await bekle(400, 900);
  await ekran('03-mama');
  await surukle(page, ege(page, 'onluk'), ege(page, 'bebek'), 14, gercekHiz);
  let sicakDenendi = false;
  let ufleEkran = false;
  for (let adim = 0; adim < 40; adim++) {
    const gg = await gorevBekle(page, ['daldir', 'ufle', 'ver', 'sil'], T);
    if (gg === 'sil') break;
    if (gg === 'daldir') {
      await bekle(150, 500);
      await surukle(page, ege(page, 'kasik'), ege(page, 'kase'), 12, gercekHiz);
      await expect.poll(() => gorev(page), { timeout: T }).not.toBe('daldir');
    } else if (gg === 'ufle') {
      if (!sicakDenendi) {
        // sıcakken verirse Ege surat asar, kaşık geri döner
        sicakDenendi = true;
        await bekle(200, 600);
        await surukle(page, ege(page, 'kasik'), ege(page, 'agiz'), 12, gercekHiz);
        await expect(ege(page, 'bebek')).toHaveAttribute('data-ifade', 'buzuk', { timeout: 4000 });
        await ekran('04-sicak');
        await bekle(900, 2500);
      }
      const k = await merkez(ege(page, 'kasik'));
      await page.mouse.move(k.x, k.y);
      await page.mouse.down();
      if (!ufleEkran) {
        await bekle(500, 900);
        await ekran('05-ufle');
        ufleEkran = true;
      }
      await expect.poll(() => gorev(page), { timeout: 10000 }).not.toBe('ufle');
      await page.mouse.up();
    } else {
      await bekle(200, 500);
      await surukle(page, ege(page, 'kasik'), ege(page, 'agiz'), 12, gercekHiz);
      await expect.poll(() => gorev(page), { timeout: T }).not.toBe('ver');
    }
  }
  await bekle(300, 800);
  await ekran('06-mamali');
  for (let i = 0; i < 16 && (await gorev(page)) === 'sil'; i++) {
    const a = await merkez(ege(page, 'pecete'));
    const b = await merkez(ege(page, 'agiz'));
    await page.mouse.move(a.x, a.y);
    await page.mouse.down();
    for (let j = 0; j <= 34; j++) {
      const t = Math.min(1, j / 8);
      await page.mouse.move(a.x + (b.x - a.x) * t + Math.sin(j * 0.9) * 34, a.y + (b.y - a.y) * t + Math.cos(j * 1.3) * 26 - 10);
      if (gercekHiz) await page.waitForTimeout(16);
    }
    if (i === 0) await ekran('07-sil');
    await page.mouse.up();
    await bekle(150, 300);
  }

  // 3. Ege sıkılmış: sepetteki oyuncakları çıkarıp Ege'ye göster (dokun ya da sürükle), en alttaki kuklalar Ada'ya ve Can'a
  await gorevBekle(page, ['sepet'], T);
  await bekle(300, 800);
  await ekran('08-sepet');
  await dokun(page, ege(page, 'ordek'));
  await bekle(150, 700);
  await surukle(page, ege(page, 'top'), { x: vp.width * 0.15, y: vp.height * 0.9 }, 14, gercekHiz);
  // kalan oyuncaklara dokun (gerçek hızda uçuş animasyonu sürerken ıskalanırsa yeniden)
  for (let i = 0; i < 10 && (await gorev(page)) === 'sepet'; i++) {
    await bekle(200, 700);
    const kalan = page.locator('.eg-oyuncak:not([data-cikti])').first();
    if (!(await kalan.count())) break;
    await dokun(page, kalan);
  }
  await gorevBekle(page, ['kukla-tak'], T);
  await bekle(500, 1000);
  await ekran('09-kuklalar');
  await surukle(page, ege(page, 'kukla-ayi'), page.locator('.mc-oyuncu[data-ad="ada"]'), 14, gercekHiz);
  await bekle(300, 600);
  await surukle(page, ege(page, 'kukla-civciv'), page.locator('.mc-oyuncu[data-ad="can"]'), 14, gercekHiz);
  await gorevBekle(page, ['civciv'], T);
  await dokun(page, ege(page, 'kukla-civciv'));
  await bekle(500, 1200);
  await ekran('10-civciv');
  await gorevBekle(page, ['ayi'], T);
  await dokun(page, ege(page, 'kukla-ayi'));
  await bekle(400, 900);
  await ekran('11-ayi');
  for (let i = 0; i < 4; i++) {
    await gorevBekle(page, ['serbest'], T);
    await dokun(page, ege(page, i % 2 ? 'kukla-ayi' : 'kukla-civciv'));
    if (i === 3) {
      await bekle(700, 1400);
      await ekran('12-kahkaha');
    }
  }

  // 4. yatak hazırlığı (anne Ege'yi beşiğe yatırır): emzik, battaniye, lamba, perde
  await gorevBekle(page, ['hazirla'], T);
  await bekle(500, 1000);
  await ekran('13-yatak');
  await surukle(page, ege(page, 'emzik'), ege(page, 'agiz'), 14, gercekHiz);
  await bekle(300, 900);
  await surukle(page, ege(page, 'battaniye-ege'), ege(page, 'bebek'), 14, gercekHiz);
  // Ege beşiğin içinde (yuvada) yatıyor; açık battaniye örtülü
  await expect(page.locator('.eg-besik-yuva > [data-ege="bebek"].yatiyor')).toHaveCount(1);
  await expect(page.locator('.eg-besik-ortu.acik[data-ege="ortu"]')).toHaveCount(1, { timeout: 8000 });
  await bekle(700, 1200);
  await ekran('13b-besik-ortu');
  await dokun(page, ege(page, 'lamba'));
  await bekle(600, 1500);
  await ekran('14-lamba');
  {
    const p = await merkez(ege(page, 'perde'), 0.5, 0.45);
    await page.mouse.move(p.x, p.y);
    await page.mouse.down();
    for (let i = 0; i < 10 && (await gorev(page)) === 'hazirla'; i++) {
      await page.mouse.move(p.x + (i % 2 ? -1 : 1) * p.k.width * 0.35, p.y, { steps: gercekHiz ? 14 : 6 });
    }
    await page.mouse.up();
  }
  await bekle(800, 1800);
  await ekran('15-gece');

  // 7. ninni: beşiği sağa-sola salla (her yön değişimi bir nota)
  const sallaBitir = async (ad: string) => {
    await gorevBekle(page, ['ninni'], T);
    const b = await merkez(ege(page, 'besik'), 0.5, 0.75);
    await page.mouse.move(b.x, b.y);
    await page.mouse.down();
    for (let i = 0; i < 80 && (await gorev(page)) === 'ninni'; i++) {
      await page.mouse.move(b.x + (i % 2 ? -1 : 1) * 40, b.y, { steps: gercekHiz ? 10 : 4 });
      if (gercekHiz) await page.waitForTimeout(260);
      if (i === 8) await ekran(ad);
    }
    await page.mouse.up();
  };
  await sallaBitir('16-ninni');

  // 8. sessizlik (parmak basılı) + Mino'nun burnu
  const sessizBekle = async (ad?: string) => {
    await gorevBekle(page, ['sessiz'], T);
    await page.mouse.move(vp.width * 0.5, vp.height * 0.3);
    await page.mouse.down();
    if (ad) {
      await page.waitForTimeout(gercekHiz ? 2000 : 1200);
      await ekran(ad);
    }
    await expect.poll(() => gorev(page), { timeout: T }).not.toBe('sessiz');
    await page.mouse.up();
  };
  await sessizBekle('17-sessiz-ay');
  await gorevBekle(page, ['burun'], T);
  await bekle(400, 800);
  await ekran('18-burun');
  if (yas >= 5) {
    const n = await merkez(ege(page, 'burun'));
    await page.mouse.move(n.x, n.y);
    await page.mouse.down();
    await page.waitForTimeout(900);
    await ekran('19-burun-tut');
    await expect.poll(() => gorev(page), { timeout: 10000 }).not.toBe('burun');
    await page.mouse.up();
    await bekle(400, 900);
    await ekran('20-hipsu');
  } else {
    // tutmazsa HAPŞU: Ege uyanır, kısa ninni ve kısa sessizlik
    // (burun süresi duvar saatiyle: 9 sn; yavaş makinede kare hızı düşse de uzamaz)
    await expect.poll(() => gorev(page), { timeout: 20000 }).not.toBe('burun');
    await page.waitForTimeout(500);
    await ekran('19-hapsu');
    await sallaBitir('20-kisa-ninni');
  }
  await sessizBekle();

  // 9. fısıltı (dokunma: öpücük) ve final
  await gorevBekle(page, ['fisilti'], T);
  await bekle(300, 900);
  await ekran('21-fisilti');
  await dokun(page, page.locator('.mc-buyuk-dugme'));
  // final: anne kanepede kollarını açıp çocuklara sarılır
  await gorevBekle(page, ['saril'], T);
  await expect(ege(page, 'anne')).toHaveAttribute('data-resim', 'sariliyor');
  await expect(ege(page, 'anne')).toHaveClass(/sariliyor/);
  await ekran('22-saril');
  await bekle(200, 3000);
  await ekran('22-aferin');
  await expect(page.locator('.mc-son')).toBeVisible({ timeout: gercekHiz ? 120000 : 40000 });
  await page.waitForTimeout(500);
  await ekran('23-son');
}

for (const yas of (process.env.EGE_YASLAR ?? '3,5').split(',').map(Number)) {
  test(`Ege Uyuyor: dokunarak baştan sona (${yas} yaş)`, async ({ page }, info) => {
    test.setTimeout(300_000);
    const hatalar = hataTopla(page);
    await page.goto(`./macera/?test=1&ekran=bolum&yas=${yas}&bolum=ege`);
    const p = info.project.name;
    await oyna(page, yas, (ad) => page.screenshot({ path: `tests/screens/${p}-ege-${yas}yas-${ad}.png` }));
    expect(hatalar).toEqual([]);
  });
}

test('Ege Uyuyor: açılış kartı', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./macera/?test=1&yas=5');
  await expect(page.locator('.eg-bolum-kart')).toBeVisible();
  await expect(page.locator('.bn-bolum-kart')).toBeVisible();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `tests/screens/${info.project.name}-ege-acilis.png` });
  await page.locator('.eg-bolum-kart').click();
  await expect(page.locator('.eg-sahne')).toBeVisible({ timeout: 15000 });
  expect(hatalar).toEqual([]);
});

test('Ege Uyuyor: gerçek hızda video', async ({ browser }, info) => {
  test.skip(!process.env.EGE_VIDEO, 'video yalnız EGE_VIDEO=1 ile (uzun sürer)');
  test.setTimeout(1_200_000);
  const dir = `tests/screens/video-ege-${info.project.name}`;
  const vp = info.project.use.viewport ?? { width: 390, height: 844 };
  const yas = Number(process.env.EGE_YAS ?? 5);
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'tr-TR', baseURL: info.project.use.baseURL, recordVideo: { dir, size: vp } });
  const page = await ctx.newPage();
  const hatalar = hataTopla(page);
  await page.goto(`./macera/?onizleme=1&ekran=bolum&yas=${yas}&bolum=ege`);
  await oyna(page, yas, async () => undefined, true);
  await page.waitForTimeout(2000);
  const video = page.video();
  await ctx.close();
  if (video) fs.copyFileSync(await video.path(), `tests/screens/macera-ege-${yas}yas-${info.project.name}.webm`);
  expect(hatalar).toEqual([]);
});
