/**
 * Tıkır Tıkır Lokanta · P6 mini oyunları tek başına (/restoran/mini.html?oyun=yogur|mangal|bulasik|sis|sar|sutlac;
 * ekip/senaryo/RESTORAN.md §8 M8, M9, M15, M13, M16, M17): telefon iki yön (844×390 3-4, 390×844 5-6) + 932×430 +
 * 667×375. Her oyunda komik başarısızlık (krep maske, duman/isli Kino, köpük dağı, fırlayan meyve, fışkıran peynir,
 * taşan sütlaç), ödül anı, 3-4 / 5-6 farkı; dokunuştan ilk görüntüye ≤ 1 kare (≤ 32 ms), zoom yok, konsol hatası yok.
 * Ekran kareleri tests/screens/ (git'e girmez).
 */
import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

const TELEFON = [
  { ad: 'yatay', viewport: { width: 844, height: 390 }, yas: 'kucuk' },
  { ad: 'dikey', viewport: { width: 390, height: 844 }, yas: 'buyuk' },
] as const;
const DIGER = [
  { ad: '932x430', viewport: { width: 932, height: 430 } },
  { ad: '667x375', viewport: { width: 667, height: 375 } },
] as const;

type Nokta = { x: number; y: number };
type Pencere = '__rsYogur' | '__rsMangal' | '__rsBulasik' | '__rsSis' | '__rsSar' | '__rsSutlac';

/** Görsel kaynak pikselinin üstüne büyütülmüş mü (DPR 3) */
const buyutulen = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLImageElement>('.rs-kok img')]
      .filter((i) => i.naturalWidth && i.getBoundingClientRect().width > 4 && !i.getAnimations().length && !i.closest('.rs-p5-elde, .rs-mini-sonuc'))
      .map((i) => {
        const r = i.getBoundingClientRect();
        const fit = getComputedStyle(i).objectFit;
        const en = fit === 'contain' || fit === 'scale-down' ? Math.min(r.width, (r.height * i.naturalWidth) / i.naturalHeight) : r.width;
        return { src: i.src.split('/').pop(), en, dogal: i.naturalWidth };
      })
      .filter((x) => x.en * 3 > x.dogal * 1.02),
  );
const orta = async (page: Page, sec: string): Promise<Nokta> => {
  const r = (await page.locator(sec).first().boundingBox())!;
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
};
const dokun = async (page: Page, sec: string, bek = 140) => {
  const p = await orta(page, sec);
  await page.mouse.click(p.x, p.y);
  await page.waitForTimeout(bek);
};
const raf = (tur: string) => `.rs-p5-raf-oge[data-tur="${tur}"]`;
const olaylar = (page: Page, ad: Pencere) => page.evaluate((a) => (window as unknown as Record<string, { olaylar: string[] }>)[a].olaylar.slice(), ad);
const durum = <T>(page: Page, ad: Pencere) => page.evaluate((a) => (window as unknown as Record<string, { durum(): unknown }>)[a].durum(), ad) as Promise<T>;
const cagir = <T>(page: Page, ad: Pencere, fn: string, ...arg: unknown[]) => page.evaluate(([a, f, x]) => (window as unknown as Record<string, Record<string, (...y: unknown[]) => unknown>>)[a as string][f as string](...(x as unknown[])), [ad, fn, arg] as const) as Promise<T>;
const bekleOlay = (page: Page, ad: Pencere, olay: string, timeout = 8000) => expect.poll(async () => (await olaylar(page, ad)).includes(olay), { timeout }).toBe(true);

/** Gecikme ölçer: her pointerdown'dan sonraki ilk karede (rAF) geçen süre ve o anki görüntü (seçici var mı) */
async function gecikmeKur(page: Page, secici: string) {
  await page.evaluate((s) => {
    const w = window as unknown as { __gecikme: { ms: number; gorunur: boolean }[] };
    w.__gecikme = [];
    addEventListener(
      'pointerdown',
      (e) => {
        const t0 = e.timeStamp;
        requestAnimationFrame(() => w.__gecikme.push({ ms: performance.now() - t0, gorunur: !!document.querySelector(s) }));
      },
      { capture: true },
    );
  }, secici);
}
async function gecikmeDenetle(page: Page) {
  const g = await page.evaluate(() => (window as unknown as { __gecikme: { ms: number; gorunur: boolean }[] }).__gecikme.filter((x) => x.gorunur));
  expect(g.length).toBeGreaterThan(0);
  expect(Math.max(...g.map((x) => x.ms)), JSON.stringify(g)).toBeLessThanOrEqual(32);
}
async function daire(page: Page, c: Nokta, r: number, tur: number, dy = 0, adim = 18) {
  for (let i = 0; i <= tur * adim; i++) {
    const a = (i / adim) * Math.PI * 2;
    await page.mouse.move(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r + dy);
    await page.waitForTimeout(6);
  }
}
async function surukle(page: Page, a: Nokta, b: Nokta, adim = 10, bekle = 0) {
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(b.x, b.y, { steps: adim });
  if (bekle) await page.waitForTimeout(bekle);
  await page.mouse.up();
}
const ac = async (page: Page, sorgu: string) => {
  await page.goto(`./restoran/mini.html?test=1&${sorgu}`);
  await expect(page.locator('.rs-istasyon')).toBeVisible();
  await page.waitForTimeout(350);
  // ısınma: uygulamanın ilk dokunuşu ortak ses kilidini açar (sesiAc: AudioContext, bütün oyunlarda ~40 ms, bir kez)
  const v = page.viewportSize()!;
  await page.mouse.click(v.width - 3, 3);
  await page.waitForTimeout(250);
};
/** Basılı tutup bırakır (gecikme ölçümü: dokunuşun ilk karesi bırakmadan önce çizilsin) */
const bas = async (page: Page, sec: string, ms = 90) => {
  const p = await orta(page, sec);
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  await page.waitForTimeout(ms);
  await page.mouse.up();
  await page.waitForTimeout(140);
};
const tepsiyeAl = async <T>(page: Page) => {
  await page.locator('.rs-tepsi-dugme').click();
  await expect(page.locator('.rs-mini-sonuc')).toBeVisible({ timeout: 8000 });
  return page.evaluate(() => (window as unknown as { __rsMiniSonuc: unknown[] }).__rsMiniSonuc) as Promise<T[]>;
};
type U = { tur: string; yemek?: string; servis?: boolean; butun?: boolean; ozellik: { malzemeler: Record<string, { adet: number }>; pisme?: string; porsiyon?: string; tatli?: number }; temiz?: number };

for (const boy of TELEFON) {
  test.describe(`Restoran P6 mini oyunları telefon ${boy.ad} (${boy.yas})`, () => {
    test.use({ viewport: boy.viewport, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    test.beforeEach(({}, info) => test.skip(info.project.name !== 'iphone', 'telefon boyları ayrı veriliyor'));

    test('Yoğur ve Yuvarla: sıkıştır, tut-kopar (kocaman), yuvarla, bastır → krep maske; 5-6 aynı boy; sini tepsiye', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, `oyun=yogur&yas=${boy.yas}&tarif=kofte`);
      await gecikmeKur(page, '.rs-yg-iz');
      await dokun(page, raf('sogan'));
      const kase = await orta(page, '.rs-yg-kase');
      const gerek = boy.yas === 'kucuk' ? 3 : 5;
      for (let i = 0; i < gerek; i++) await dokun(page, '.rs-yg-kase', 160);
      await bekleOlay(page, '__rsYogur', 'karisti');
      await gecikmeDenetle(page);
      if (boy.yas === 'buyuk') {
        // 5-6: üç orta avuç (dokunuş), üçü de bastırılır → aynı boy, yıldızlar
        for (let i = 0; i < 3; i++) await dokun(page, '.rs-yg-kase', 260);
        let t = await cagir<(Nokta & { sekil: string })[]>(page, '__rsYogur', 'topakYeri');
        for (const q of t) {
          await page.mouse.click(q.x, q.y);
          await page.waitForTimeout(220);
        }
        await bekleOlay(page, '__rsYogur', 'ayni');
        // tam tur daire: yeni pütürlü topak (tut-kopar) top olur
        await surukle(page, kase, kase, 2, 1200);
        await page.waitForTimeout(300);
        t = await cagir(page, '__rsYogur', 'topakYeri');
        const yeni = t.find((q) => q.sekil === 'putur')!;
        await page.mouse.move(yeni.x + 22, yeni.y);
        await page.mouse.down();
        await daire(page, yeni, 22, 1.2);
        await page.mouse.up();
        await bekleOlay(page, '__rsYogur', 'top');
      } else {
        // 3-4: tut, avuç büyür, tahtaya: kocaman
        const m = await cagir<{ tb: { x: number; y: number; w: number; h: number } }>(page, '__rsYogur', 'merkez');
        const ok = (await page.locator('.rs-yogur').boundingBox())!;
        await page.mouse.move(kase.x, kase.y);
        await page.mouse.down();
        await page.waitForTimeout(1300);
        await page.mouse.move(ok.x + m.tb.x + m.tb.w * 0.2, ok.y + m.tb.y + m.tb.h * 0.3 + 34, { steps: 10 });
        await page.mouse.up();
        await bekleOlay(page, '__rsYogur', 'kocaman');
        await dokun(page, '.rs-yg-kase', 300);
        // pütürlü topağa dokun: kendisi yuvarlanır
        let t = await cagir<(Nokta & { sekil: string })[]>(page, '__rsYogur', 'topakYeri');
        await page.mouse.click(t[1].x, t[1].y);
        await bekleOlay(page, '__rsYogur', 'top');
        await page.screenshot({ path: `tests/screens/restoran-mini-yogur-${boy.ad}-tahta.png` });
        // üç bastırış: yassı → ince → krep (Mino maske yapar)
        for (let i = 0; i < 3; i++) {
          t = await cagir(page, '__rsYogur', 'topakYeri');
          await page.mouse.click(t[1].x, t[1].y);
          await page.waitForTimeout(260);
        }
        await bekleOlay(page, '__rsYogur', 'maske');
        await page.waitForTimeout(250);
        await page.screenshot({ path: `tests/screens/restoran-mini-yogur-${boy.ad}-maske.png` });
      }
      expect(await buyutulen(page)).toEqual([]);
      const u = await tepsiyeAl<U>(page);
      expect(u[0]).toMatchObject({ tur: 'kofte-cig', yemek: 'kofte' });
      expect(u[0].ozellik.malzemeler.kofte.adet).toBeGreaterThanOrEqual(2);
      expect(u[0].ozellik.malzemeler.sogan.adet).toBe(1);
      expect(hatalar).toEqual([]);
    });

    test('Mangal: köfteler ızgarada, yelpaze közü canlandırır, fazlası duman (Kino is), maşayla çevir, kalpler; arka planda pişer', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, `oyun=mangal&yas=${boy.yas}&tarif=kofte`);
      await dokun(page, raf('sini'));
      await dokun(page, raf('biber'));
      expect(await olaylar(page, '__rsMangal')).toEqual(expect.arrayContaining(['kofteKondu', 'kondu-biber']));
      // yelpaze: mangalın üstünde sağa sola, çok: duman bulutu, Kino öksürür, yüzü is
      const y = await orta(page, '.rs-mg-yelpaze');
      const mg = (await page.locator('.rs-mg-mangal').boundingBox())!;
      const c = { x: mg.x + mg.width / 2, y: mg.y + mg.height * 0.35 + 34 };
      await page.mouse.move(y.x, y.y);
      await page.mouse.down();
      for (let i = 0; i < 16; i++) {
        await page.mouse.move(c.x + (i % 2 ? 80 : -80), c.y, { steps: 3 });
        await page.waitForTimeout(30);
      }
      await page.mouse.up();
      await bekleOlay(page, '__rsMangal', 'alev');
      await bekleOlay(page, '__rsMangal', 'isli', 12000);
      await page.screenshot({ path: `tests/screens/restoran-mini-mangal-${boy.ad}-duman.png` });
      // maşa: dokununca çevirir (aynı karede maşa görünür)
      await gecikmeKur(page, '.rs-mg-masa.rs-tutuyor');
      await cagir(page, '__rsMangal', 'pisir', 8);
      for (const q of (await cagir<(Nokta & { tur: string })[]>(page, '__rsMangal', 'parcaYeri')).filter((q) => q.tur === 'kofte')) {
        await page.mouse.click(q.x, q.y);
        await page.waitForTimeout(450);
      }
      await gecikmeDenetle(page);
      expect(await olaylar(page, '__rsMangal')).toContain('cevir');
      if (boy.yas === 'buyuk') {
        // 5-6: köfteyi başka yere taşı → aynı yüze ikinci iz çapraz
        const q = (await cagir<(Nokta & { tur: string })[]>(page, '__rsMangal', 'parcaYeri')).find((x) => x.tur === 'kofte')!;
        const bos = await page.evaluate(() => {
          const w = (window as unknown as { __rsMangal: { merkez(): { yuvalar: Nokta[] } } }).__rsMangal;
          const ok = document.querySelector('.rs-mangal')!.getBoundingClientRect();
          const y = w.merkez().yuvalar[5];
          return { x: ok.left + y.x, y: ok.top + y.y };
        });
        await cagir(page, '__rsMangal', 'pisir', 3);
        await surukle(page, q, { x: bos.x, y: bos.y + 34 }, 12);
        await cagir(page, '__rsMangal', 'pisir', 6);
        await bekleOlay(page, '__rsMangal', 'capraz');
      }
      await cagir(page, '__rsMangal', 'pisir', 12);
      await bekleOlay(page, '__rsMangal', 'kalp');
      await page.screenshot({ path: `tests/screens/restoran-mini-mangal-${boy.ad}-kalp.png` });
      expect(await buyutulen(page)).toEqual([]);
      const u = await tepsiyeAl<U>(page);
      expect(u[0]).toMatchObject({ tur: 'izgara', yemek: 'kofte', butun: true });
      expect(['altin', 'citir']).toContain(u[0].ozellik.pisme);
      expect(u[0].ozellik.malzemeler.biber.adet).toBe(1);
      expect(hatalar).toEqual([]);
    });

    test('Bulaşık: sünger ovar, köpük, durula, rafa; köpük dağı (Mino hapşırır); en büyük balonda Lokum; bahşiş', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, `oyun=bulasik&yas=${boy.yas}`);
      await gecikmeKur(page, '.rs-bl-sunger.rs-tutuluyor');
      // dört deterjan: köpük dağı, balon Mino'nun burnunda, hapşu
      for (let i = 0; i < 4; i++) await dokun(page, '.rs-bl-deterjan', 120);
      await bekleOlay(page, '__rsBulasik', 'hapsu');
      await page.screenshot({ path: `tests/screens/restoran-mini-bulasik-${boy.ad}-dag.png` });
      // gizli: en büyük köpük balonu, içinde Lokum
      await expect.poll(async () => (await cagir<{ buyuk: boolean }[]>(page, '__rsBulasik', 'balonlar')).some((x) => x.buyuk), { timeout: 20000 }).toBe(true);
      const bb = (await cagir<(Nokta & { buyuk: boolean })[]>(page, '__rsBulasik', 'balonlar')).find((x) => x.buyuk)!;
      await page.mouse.click(bb.x, bb.y);
      await bekleOlay(page, '__rsBulasik', 'lokumBalon');
      await page.screenshot({ path: `tests/screens/restoran-mini-bulasik-${boy.ad}-lokum.png` });
      for (let tur = 0; tur < 40; tur++) {
        const d = await durum<{ tabaklar: { durum: string }[] }>(page, '__rsBulasik');
        if (d.tabaklar.every((t) => t.durum === 'rafta')) break;
        const st = await page.evaluate(() => document.querySelector<HTMLElement>('.rs-bl-tabak')?.dataset.durum);
        if (st === 'kirli') {
          if (boy.yas === 'buyuk') {
            // 5-6: süngeri lekelerin üstünde daire daire gezdir (kenardaki gizli leke dahil)
            const s = await orta(page, '.rs-bl-sunger');
            await page.mouse.move(s.x, s.y);
            await page.mouse.down();
            for (const l of await cagir<Nokta[]>(page, '__rsBulasik', 'lekeYeri')) await daire(page, l, 22, 4, 34);
            await page.mouse.up();
          } else await dokun(page, '.rs-bl-sunger', 900);
        } else if (st === 'kopuklu') {
          if (boy.yas === 'buyuk') {
            const t = await orta(page, '.rs-bl-tabak');
            const m = await cagir<{ muslukYer: Nokta; tR: number }>(page, '__rsBulasik', 'merkez');
            const ok = (await page.locator('.rs-bulasik').boundingBox())!;
            await surukle(page, t, { x: ok.x + m.muslukYer.x, y: ok.y + m.muslukYer.y + m.tR * 0.5 + 34 }, 8);
          } else await dokun(page, '.rs-bl-tabak', 200);
          await page.waitForTimeout(1500);
        } else if (st === 'temiz') {
          if (boy.yas === 'buyuk') {
            const t = await orta(page, '.rs-bl-tabak');
            const r = await orta(page, '.rs-bl-raf');
            await surukle(page, t, { x: r.x, y: r.y + 34 }, 8);
          } else await dokun(page, '.rs-bl-tabak', 200);
          await page.waitForTimeout(900);
        } else await page.waitForTimeout(400);
      }
      await gecikmeDenetle(page);
      const o = await olaylar(page, '__rsBulasik');
      expect(o).toEqual(expect.arrayContaining(['kopuklu', 'durula', 'piril', 'rafta', 'dogalSon']));
      if (boy.yas === 'buyuk') expect(o).toContain('gizliLeke');
      expect(await buyutulen(page)).toEqual([]);
      const u = await tepsiyeAl<U>(page);
      expect(u[0]).toMatchObject({ tur: 'bulasik', temiz: 3 });
      expect(hatalar).toEqual([]);
    });

    test('v1.1 Meyve Şiş: tık diye geçer; dolu şişte fırlayan meyveyi Mino yakalar; bal; 5-6 örüntü', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, `oyun=sis&yas=${boy.yas}&tarif=sis${boy.yas === 'buyuk' ? '&ornek=1' : ''}`);
      await gecikmeKur(page, '.rs-p5-elde');
      // sürükleyerek: ilk şişin ucuna (5-6: örüntü kartındaki sırayla)
      const s = await cagir<{ x: number; y: number; uc: number }[]>(page, '__rsSis', 'sisYeri');
      const oruntu = (await durum<{ oruntu: string[] | null }>(page, '__rsSis')).oruntu;
      for (const m of oruntu ?? ['cilek']) {
        const k = await orta(page, raf(m));
        await surukle(page, k, { x: s[0].uc, y: s[0].y + 34 }, 8);
        await page.waitForTimeout(160);
      }
      await gecikmeDenetle(page);
      expect((await durum<{ sisler: { meyveler: string[] }[] }>(page, '__rsSis')).sisler[0].meyveler.length).toBeGreaterThan(0);
      if (oruntu) await bekleOlay(page, '__rsSis', 'oruntu');
      // dokunarak doldur, sonra fazlası: en dipteki fırlar, Mino yakalar
      for (let i = 0; i < 14; i++) await dokun(page, raf(['muz', 'kavun', 'uzum', 'cilek'][i % 4]), 110);
      await bekleOlay(page, '__rsSis', 'hap');
      await dokun(page, raf('bal'), 200);
      await page.screenshot({ path: `tests/screens/restoran-mini-sis-${boy.ad}.png` });
      expect(await buyutulen(page)).toEqual([]);
      const u = await tepsiyeAl<U>(page);
      expect(u[0]).toMatchObject({ tur: 'sis', yemek: 'sis', servis: true });
      expect(u[0].ozellik.malzemeler.bal.adet).toBeGreaterThan(0);
      expect(hatalar).toEqual([]);
    });

    test('v1.1 Sar: peynir çizgisi, yukarı kaydırarak rulo, çok peynir fışkırır, su ile yapışır, tavada altın', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, `oyun=sar&yas=${boy.yas}&tarif=borek`);
      await gecikmeKur(page, '.rs-p5-elde');
      await bas(page, raf('peynir'));
      await dokun(page, raf('peynir'));
      await dokun(page, raf('maydanoz'));
      await gecikmeDenetle(page);
      const yuf = (await page.locator('.rs-sr-yufka').boundingBox())!;
      for (let i = 0; i < 4; i++) {
        await surukle(page, { x: yuf.x + yuf.width / 2, y: yuf.y + yuf.height * 0.85 }, { x: yuf.x + yuf.width / 2, y: yuf.y + yuf.height * 0.85 - 70 }, 6);
        await page.waitForTimeout(160);
      }
      await bekleOlay(page, '__rsSar', 'fiskirdi');
      await page.screenshot({ path: `tests/screens/restoran-mini-sar-${boy.ad}-fiskirdi.png` });
      await dokun(page, raf('su'), 900);
      await bekleOlay(page, '__rsSar', 'yapisti');
      // ikinci börek: az peynir, dokunarak (3-4) ya da kaydırarak
      await dokun(page, raf('peynir'), 300);
      for (let i = 0; i < 4; i++) {
        await surukle(page, { x: yuf.x + yuf.width / 2, y: yuf.y + yuf.height * 0.85 }, { x: yuf.x + yuf.width / 2, y: yuf.y + yuf.height * 0.85 - 70 }, 6);
        await page.waitForTimeout(160);
      }
      await page.waitForTimeout(200);
      await dokun(page, '.rs-sr-yufka', 900);
      await expect.poll(async () => (await durum<{ bitmis: unknown[] }>(page, '__rsSar')).bitmis.length, { timeout: 5000 }).toBe(2);
      // rulolar tavaya
      for (let i = 0; i < 2; i++) {
        await page.locator('.rs-sr-rulolar .rs-sr-rulo').nth(i).click({ force: true });
        await page.waitForTimeout(250);
      }
      await bekleOlay(page, '__rsSar', 'yaga');
      await cagir(page, '__rsSar', 'pisir', 5);
      await bekleOlay(page, '__rsSar', boy.yas === 'kucuk' ? 'dogalSon' : 'altin');
      await page.screenshot({ path: `tests/screens/restoran-mini-sar-${boy.ad}-tava.png` });
      expect(await buyutulen(page)).toEqual([]);
      const u = await tepsiyeAl<U>(page);
      expect(u[0]).toMatchObject({ tur: 'borek', yemek: 'borek', servis: true });
      expect(['altin', 'citir']).toContain(u[0].ozellik.pisme);
      expect(hatalar).toEqual([]);
    });

    test('v1.1 Sütlaç: süt + pirinç, karıştır koyulaşır, kâselere dök (5-6 taşar), fırında kızarır, tarçın', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, `oyun=sutlac&yas=${boy.yas}&tarif=sutlac`);
      await gecikmeKur(page, '.rs-p5-elde');
      await bas(page, raf('sut'));
      for (const m of ['pirinc', 'seker']) await dokun(page, raf(m));
      await gecikmeDenetle(page);
      const m = await cagir<{ cx: number; cy: number; R: number }>(page, '__rsSutlac', 'merkez');
      const ok = (await page.locator('.rs-sutlac').boundingBox())!;
      const k = await orta(page, '.rs-sl-kepce');
      await page.mouse.move(k.x, k.y);
      await page.mouse.down();
      await daire(page, { x: ok.x + m.cx, y: ok.y + m.cy }, m.R * 0.45, boy.yas === 'kucuk' ? 4 : 6, 26);
      await bekleOlay(page, '__rsSutlac', 'koyulasti');
      // dolu kepçe ilk kâsenin üstünde tutulur
      const kb = await orta(page, '.rs-sl-tepsi .rs-sl-kase');
      await page.mouse.move(kb.x, kb.y + 26, { steps: 8 });
      await page.waitForTimeout(boy.yas === 'buyuk' ? 2600 : 1900);
      await page.mouse.up();
      if (boy.yas === 'buyuk') await bekleOlay(page, '__rsSutlac', 'tasti');
      // öbür kâseler: dokununca kepçe çizgiye kadar doldurur
      await page.locator('.rs-sl-tepsi .rs-sl-kase').nth(1).click({ force: true });
      await bekleOlay(page, '__rsSutlac', 'kaseDoldu');
      await page.screenshot({ path: `tests/screens/restoran-mini-sutlac-${boy.ad}-kase.png` });
      await dokun(page, '.rs-sl-firin', 300);
      await bekleOlay(page, '__rsSutlac', 'firina');
      await cagir(page, '__rsSutlac', 'pisir', 5);
      await dokun(page, '.rs-sl-firin', 400);
      await bekleOlay(page, '__rsSutlac', 'firindan');
      await dokun(page, raf('tarcin'), 300);
      await bekleOlay(page, '__rsSutlac', 'dogalSon');
      await page.screenshot({ path: `tests/screens/restoran-mini-sutlac-${boy.ad}-tarcin.png` });
      expect(await buyutulen(page)).toEqual([]);
      const u = await tepsiyeAl<U>(page);
      expect(u[0]).toMatchObject({ tur: 'sutlac', yemek: 'sutlac', servis: true });
      expect(u[0].ozellik.malzemeler.tarcin.adet).toBeGreaterThan(0);
      expect(hatalar).toEqual([]);
    });
  });
}

for (const boy of DIGER) {
  test.describe(`Restoran P6 mini oyunları ${boy.ad}`, () => {
    test.use({ viewport: boy.viewport, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    test.beforeEach(({}, info) => test.skip(info.project.name !== 'iphone', 'telefon boyları ayrı veriliyor'));
    test('altı oyun açılır, ana öğeler ekranda ve tepsi düğmesiyle / Mino köşesiyle çakışmaz, zoom yok', async ({ page }) => {
      const hatalar = hataTopla(page);
      const ANA: Record<string, string[]> = {
        yogur: ['.rs-yg-kase', '.rs-yg-tahta'],
        mangal: ['.rs-mg-mangal', '.rs-mg-masa', '.rs-mg-yelpaze'],
        bulasik: ['.rs-bl-legen', '.rs-bl-sunger', '.rs-bl-raf', '.rs-bl-deterjan'],
        sis: ['.rs-ss-tahta'],
        sar: ['.rs-sr-mermer', '.rs-sr-tava', '.rs-sr-tabak'],
        sutlac: ['.rs-sl-tencere', '.rs-sl-tepsi', '.rs-sl-firin'],
      };
      for (const [oyun, secler] of Object.entries(ANA)) {
        await ac(page, `oyun=${oyun}&yas=kucuk`);
        const sorun = await page.evaluate((s) => {
          const kes = (a: DOMRect, b: DOMRect) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
          const tepsi = document.querySelector('.rs-tepsi-dugme')!.getBoundingClientRect();
          const mino = document.querySelector('.rs-mino-kose')!.getBoundingClientRect();
          const out: string[] = [];
          for (const sec of s) {
            const r = document.querySelector(sec)?.getBoundingClientRect();
            if (!r || !r.width) {
              out.push(`${sec} yok`);
              continue;
            }
            if (r.left < -2 || r.top < -2 || r.right > innerWidth + 2 || r.bottom > innerHeight + 2) out.push(`${sec} ekran dışı`);
            if (kes(r, tepsi) > tepsi.width * tepsi.height * 0.15) out.push(`${sec} tepsiyle çakışıyor`);
            if (kes(r, mino) > mino.width * mino.height * 0.25) out.push(`${sec} Mino'yla çakışıyor`);
          }
          return out;
        }, secler);
        expect(sorun, oyun).toEqual([]);
        expect(await buyutulen(page)).toEqual([]);
        await page.screenshot({ path: `tests/screens/restoran-mini-${oyun}-${boy.ad}.png` });
      }
      expect(hatalar).toEqual([]);
    });
  });
}
