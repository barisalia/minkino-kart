/**
 * Tıkır Tıkır Lokanta · Gün 1 GERÇEK HIZDA, GERÇEK DOKUNUŞLA baştan sona (Gemini R-Gün 1 çizimleriyle):
 * anahtar → menü zili → müşteriyi masaya sürükle → Doğra (kaydırarak kes) → Tabakla (tabağa sürükle) → tabağı Kino'ya
 * ver → hesap tabağına dokun (jeton kasaya) → gün biter. Her dokunuştan önce o noktada en üstteki öğenin hedefin
 * kendisi olduğu denetlenir (başka bir şey örtüyorsa çocuk da dokunamaz): özellikle hesap tabağı (eskiden masadaki
 * tuzluk sürprizi örtüyordu, 932×430'da tamamen; gün bitmiyordu). Hiçbir öğeye sayfa içinden tıklanmaz.
 * Telefon: 844×390, 932×430, 667×375, 390×844 (DPR 3). Ölçü: en uzun karakter ≤ %40, netlik (DPR 3, %2 pay).
 * Ekran kareleri tests/screens/ (git'e girmez).
 */
import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

const BOYLAR = [
  { width: 844, height: 390 },
  { width: 932, height: 430 },
  { width: 667, height: 375 },
  { width: 390, height: 844 },
];

type Nokta = { x: number; y: number };
interface Durum {
  gunBitti: boolean;
  istasyon: boolean;
  hazir: number;
  bekleyen: string | null;
  siradaki: number;
  gunJeton: number;
  hizmet: number;
  kapida: { ad: string; hazir: boolean } | null;
  masalar: { oturan: string | null; kirli: boolean; jeton: number }[];
  tepkiler: { musteri: string; tepki: string }[];
}
const D = (page: Page) => page.evaluate(() => (window as unknown as { __rsGun?: { durum(): unknown } }).__rsGun?.durum() as Durum | undefined);

/** Seçicinin ilk görünür öğesinin ortası ve o noktada en üstte o öğe (ya da içindeki bir şey) mi */
async function hedef(page: Page, sec: string, konum?: (r: DOMRect) => Nokta) {
  return page.evaluate(
    ([s, k]) => {
      const el = [...document.querySelectorAll<HTMLElement>(s as string)].find((e) => e.getBoundingClientRect().width > 0);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const p = k === 'ust' ? { x: r.x + r.width / 2, y: r.y + r.height * 0.35 } : { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      const ust = document.elementFromPoint(p.x, p.y);
      return { ...p, acik: !!ust && (ust === el || el.contains(ust)), ust: ust ? `${ust.tagName}.${ust.className}` : '' };
    },
    [sec, konum ? 'ust' : 'orta'] as const,
  );
}
/** Gerçek dokunuş: önce örtülmediğini doğrular */
async function dokun(page: Page, sec: string, bek = 400) {
  const h = await hedef(page, sec);
  if (!h) return false;
  expect(h.acik, `${sec} örtülü: üstte ${h.ust}`).toBe(true);
  await page.mouse.click(h.x, h.y);
  await page.waitForTimeout(bek);
  return true;
}
async function cek(page: Page, a: Nokta, b: Nokta, n = 12, bek = 18) {
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  for (let i = 1; i <= n; i++) {
    await page.mouse.move(a.x + ((b.x - a.x) * i) / n, a.y + ((b.y - a.y) * i) / n);
    await page.waitForTimeout(bek);
  }
  await page.mouse.up();
  await page.waitForTimeout(150);
}
const orta = async (page: Page, sec: string): Promise<Nokta> => {
  const r = (await page.locator(sec).first().boundingBox())!;
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
};

/** Görünen resimler kaynak pikselinin (DPR 3) %2'den fazla üstüne büyütülmüş mü */
const buyutulen = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLImageElement>('.rs-kok img')]
      .filter((i) => i.naturalWidth && i.getBoundingClientRect().width > 4 && !i.getAnimations().length && !i.closest('.rs-ucan-jeton, .rs-df-ucan, .rs-hayalet'))
      .filter((i) => {
        const r = i.getBoundingClientRect();
        return r.right > 0 && r.left < innerWidth && r.bottom > 0 && r.top < innerHeight;
      })
      .map((i) => {
        const r = i.getBoundingClientRect();
        const fit = getComputedStyle(i).objectFit;
        const en = fit === 'contain' || fit === 'scale-down' ? Math.min(r.width, (r.height * i.naturalWidth) / i.naturalHeight) : r.width;
        return { src: i.src.split('/').pop(), en, dogal: i.naturalWidth };
      })
      .filter((x) => x.en * 3 > x.dogal * 1.02),
  );
const enUzunKarakter = (page: Page) =>
  page.evaluate(() => {
    let en = 0;
    for (const el of document.querySelectorAll<HTMLElement>('.rs-lokanta .rs-kisi')) {
      const r = el.getBoundingClientRect();
      if (!r.width) continue;
      const [tepe, taban] = (el.dataset.figur ?? '0,1').split(',').map(Number);
      en = Math.max(en, (r.height * (taban - tepe)) / innerHeight);
    }
    return en;
  });

for (const boy of BOYLAR) {
  test.describe(`Restoran Gün 1 gerçek dokunuş ${boy.width}x${boy.height}`, () => {
    test.use({ viewport: boy, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    test.beforeEach(({}, info) => test.skip(info.project.name !== 'iphone', 'telefon boyları ayrı veriliyor'));

    test('baştan sona: anahtar, müşteri, Doğra, Tabakla, servis, hesap tabağı dokunuşla alınır, gün biter', async ({ page }) => {
      test.setTimeout(420_000);
      const hatalar = hataTopla(page);
      await page.goto('./restoran/?test=1&sifirla=1&yas=kucuk');
      // dik karşıdan eski sahne (yedek; 3/4 sahne: restoran-34-gun1.spec.ts)
      await page.goto('./restoran/?onizleme=1&ekran=lokanta&eski=1');
      const ad = `${boy.width}x${boy.height}`;
      const istasyonaGir = async (ist: string, oyun: string) => {
        await dokun(page, `.rs-ist[data-istasyon="${ist}"]`, 700);
        if (await page.locator(`.rs-oyun-secim-dugme[data-oyun="${oyun}"]`).count()) await dokun(page, `.rs-oyun-secim-dugme[data-oyun="${oyun}"]`, 400);
        await expect(page.locator(`.rs-istasyon[data-oyun="${oyun}"]`)).toBeVisible({ timeout: 15_000 });
        await page.waitForTimeout(1200);
        expect(await buyutulen(page)).toEqual([]);
      };
      const tepsi = async () => {
        await dokun(page, '.rs-tepsi-dugme', 300);
        await expect.poll(async () => (await D(page))?.istasyon, { timeout: 15_000 }).toBe(false);
        await page.waitForTimeout(800);
      };
      let enUzun = 0;
      let hesapDokunus = 0;
      let kare = false;
      const t0 = Date.now();
      for (let tur = 0; Date.now() - t0 < 360_000; tur++) {
        await page.waitForTimeout(400);
        if (await page.locator('.rs-anahtar:visible').count()) {
          await dokun(page, '.rs-anahtar', 800);
          continue;
        }
        if (await page.locator('.rs-mt-zil:visible').count()) {
          await dokun(page, '.rs-mt-zil', 800);
          continue;
        }
        const d = await D(page);
        if (!d) continue;
        if (tur % 8 === 0) {
          enUzun = Math.max(enUzun, await enUzunKarakter(page));
          expect(await buyutulen(page)).toEqual([]);
        }
        if (d.gunBitti) break;
        // dolu hesap tabağı her an dokunulabilir olmalı (tuzluk, Kino, tabak örtmesin)
        for (let i = 0; i < d.masalar.length; i++) {
          if (!d.masalar[i].jeton) continue;
          const h = await hedef(page, `.rs-masa[data-masa="${i}"] .rs-hesap.rs-dolu`);
          if (h) expect(h.acik, `masa ${i} hesap tabağı örtülü: üstte ${h.ust}`).toBe(true);
        }
        if (d.kapida?.hazir) {
          const bos = d.masalar.findIndex((m) => !m.oturan && !m.kirli);
          if (bos >= 0) {
            const a = (await page.locator(`.rs-kisi[data-kisi="${d.kapida.ad}"]`).first().boundingBox())!;
            const b = (await page.locator(`.rs-masa[data-masa="${bos}"]`).first().boundingBox())!;
            await cek(page, { x: a.x + a.width / 2, y: a.y + a.height * 0.6 }, { x: b.x + b.width / 2, y: b.y + b.height / 2 }, 16, 25);
            await page.waitForTimeout(1500);
            continue;
          }
        }
        if (d.hazir > 0 && d.bekleyen) {
          await dokun(page, '.rs-hazir', 1500);
          continue;
        }
        if (d.bekleyen && !d.istasyon) {
          // Doğra: salatalık + domates, kaydırarak kes
          await istasyonaGir('tezgah', 'dogra');
          for (const m of ['salatalik', 'domates']) {
            await dokun(page, `.rs-dg-raf-oge[data-malzeme="${m}"]`, 1300);
            for (let i = 0; i < 3; i++) {
              const r = await page.locator(`.rs-p2-parca[data-malzeme="${m}"]`).first().boundingBox();
              if (!r) break;
              const x = r.x + r.width * (0.3 + i * 0.2);
              await cek(page, { x, y: r.y - 30 }, { x, y: r.y + r.height + 30 }, 10, 20);
              await page.waitForTimeout(500);
            }
          }
          if (!kare) await page.screenshot({ path: `tests/screens/restoran-gun1-dokunus-dogra-${ad}.png` });
          await tepsi();
          // Tabakla: kâseyi tabağa, bir garnitür
          await istasyonaGir('servis', 'tabakla');
          const m = (await page.evaluate(() => (window as unknown as { __rsTabakla: { merkez(): { cx: number; cy: number; R: number } } }).__rsTabakla.merkez()))!;
          const k = (await page.locator('.rs-tabakla').boundingBox())!;
          for (let i = 0; i < 4 && (await page.locator('.rs-tb-urun:not(.rs-kullanildi)').count()); i++) {
            await cek(page, await orta(page, '.rs-tb-urun:not(.rs-kullanildi)'), { x: k.x + m.cx + (i - 1) * m.R * 0.2, y: k.y + m.cy + 34 }, 14, 18);
            await page.waitForTimeout(900);
          }
          if (await page.locator('.rs-tb-raf-oge:not(.rs-tb-urun)').count()) {
            await cek(page, await orta(page, '.rs-tb-raf-oge:not(.rs-tb-urun)'), { x: k.x + m.cx + m.R * 0.3, y: k.y + m.cy - m.R * 0.2 }, 14, 18);
            await page.waitForTimeout(700);
          }
          if (!kare) await page.screenshot({ path: `tests/screens/restoran-gun1-dokunus-tabakla-${ad}.png` });
          await tepsi();
          if (!kare) await page.screenshot({ path: `tests/screens/restoran-gun1-dokunus-lokanta-${ad}.png` });
          kare = true;
          continue;
        }
        const dolu = d.masalar.findIndex((x) => x.jeton > 0);
        if (dolu >= 0) {
          const once = (await D(page))!.gunJeton;
          await dokun(page, `.rs-masa[data-masa="${dolu}"] .rs-hesap.rs-dolu`, 600);
          hesapDokunus++;
          await expect.poll(async () => (await D(page))!.gunJeton, { timeout: 20_000 }).toBeGreaterThan(once);
          await page.waitForTimeout(1500);
        }
      }
      const son = (await D(page))!;
      await page.screenshot({ path: `tests/screens/restoran-gun1-dokunus-gun-sonu-${ad}.png` });
      expect(son.gunBitti).toBe(true);
      expect(son.tepkiler.length).toBe(4);
      expect(hesapDokunus).toBeGreaterThanOrEqual(3); // iki müşteri aynı masada üst üste yiyip tek dokunuşla alınabilir
      expect(son.gunJeton).toBeGreaterThan(4);
      expect(enUzun).toBeLessThanOrEqual(0.4);
      expect(hatalar).toEqual([]);
    });
  });
}
