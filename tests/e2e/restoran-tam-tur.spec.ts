/**
 * Tıkır Tıkır Lokanta · P6 uçtan uca (ekip/senaryo/RESTORAN.md §12 P6 "bitti"):
 *  - 12 tarifin her biri lokantada GERÇEK mini oyunlarla pişirilir ve müşteriye servis edilir (salata, menemen, ayran,
 *    patates, çorba, pankek, pide, köfte, limonata, meyve şiş, sigara böreği, sütlaç).
 *  - 12 gizli sürprizin her biri bir kez tetiklenir (§9).
 *  - Lavabo yığını → Bulaşık → Babaanne'nin bahşişi kasaya; 5-6 personel yemeği.
 *  - Konsol hatası yok; hiçbir resim kaynak pikselinin üstüne büyütülmez (buyutulen).
 * Telefon yatay 844×390 (3-4) ve dikey 390×844 (5-6), DPR 3. Ekran kareleri tests/screens/ (git'e girmez).
 */
import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

type Nokta = { x: number; y: number };
interface Durum {
  acik: boolean;
  menu: string[];
  bahcede: boolean;
  bekleyen: string | null;
  hazir: number;
  istasyon: boolean;
  kasa: number;
  gunBitti: boolean;
  yigin: number;
  masalar: { oturan: string | null; durum: string | null; kirli: boolean }[];
  tepkiler: { musteri: string; istek: string; tepki: string; neden?: string; yemek?: string }[];
  surprizler: string[];
  personel: { ad: string; doydu: boolean; tepki?: string }[] | null;
  personelOldu: boolean;
}
const D = (page: Page) => page.evaluate(() => (window as unknown as { __rsGun?: { durum(): unknown } }).__rsGun?.durum() as Durum | undefined);
const buyutulen = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLImageElement>('.rs-kok img')]
      .filter((i) => i.naturalWidth && i.getBoundingClientRect().width > 4 && !i.getAnimations().length && !i.closest('.rs-ucan-jeton, .rs-df-ucan, .rs-hayalet, .rs-p5-elde'))
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
const orta = async (page: Page, sec: string): Promise<Nokta> => {
  const r = (await page.locator(sec).first().boundingBox())!;
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
};
const dokun = async (page: Page, sec: string, bek = 200) => {
  const p = await orta(page, sec);
  await page.mouse.click(p.x, p.y);
  await page.waitForTimeout(bek);
};
async function cek(page: Page, a: Nokta, b: Nokta, n = 8, bek = 12) {
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  for (let i = 1; i <= n; i++) {
    await page.mouse.move(a.x + ((b.x - a.x) * i) / n, a.y + ((b.y - a.y) * i) / n);
    if (bek) await page.waitForTimeout(bek);
  }
  await page.mouse.up();
  await page.waitForTimeout(80);
}
const kancaCagir = (page: Page, ad: string, fn: string, ...arg: unknown[]) =>
  page.evaluate(([a, f, x]) => (window as unknown as Record<string, Record<string, (...y: unknown[]) => unknown>>)[a as string][f as string](...(x as unknown[])), [ad, fn, arg] as const);
const olaylar = (page: Page, ad: string) => page.evaluate((a) => (window as unknown as Record<string, { olaylar: string[] }>)[a]?.olaylar.slice() ?? [], ad);

/** Menü tahtası: seçim varsa önce istenenler, zil; gün açılana kadar */
async function menuSec(page: Page, once: string[] = []) {
  await expect.poll(async () => (await D(page))?.acik || (await page.locator('.rs-menu-tahtasi[data-secim="1"] .rs-mt-kart').count()) > 0, { timeout: 30_000 }).toBe(true);
  if (!(await D(page))?.acik) {
    for (const t of once) {
      const k = page.locator(`.rs-mt-kart[data-tarif="${t}"]:not(.rs-mt-tahtada)`);
      if (await k.count()) await k.click();
    }
    for (let i = 0; i < 4 && !(await page.locator('.rs-mt-zil').isVisible()); i++) await page.locator('.rs-mt-kart:not(.rs-mt-tahtada)').first().click();
    await page.locator('.rs-mt-zil').click();
  }
  await expect.poll(async () => (await D(page))?.acik, { timeout: 30_000 }).toBe(true);
}

/** Bir gün açılır: dün alınmış tarif (yeni) bugün ilk müşterinin isteği; o müşteri oturup sipariş verene dek */
async function gunAc(page: Page, s: { tarif: string; acilan: string; musteri?: string; yas?: 'kucuk' | 'buyuk'; ek?: string }) {
  const m = s.musteri ?? 'bulut';
  await page.goto(`./restoran/?test=1&sifirla=1&yas=${s.yas ?? 'kucuk'}&ekran=lokanta&gun=7&acilan=${s.acilan}&yeni=${s.tarif}&musteriler=${m}&tohum=5&personel=0${s.ek ?? ''}`);
  await menuSec(page, [s.tarif]);
  expect((await D(page))!.menu).toContain(s.tarif);
  await expect.poll(async () => (await D(page))?.bekleyen, { timeout: 40_000 }).toBe(m);
  const plan = await page.evaluate(() => (window as unknown as { __rsGun: { plan: { musteriler: { musteri: string; istek: { tur: string; tarif?: string } }[] } } }).__rsGun.plan);
  expect(plan.musteriler[0]).toMatchObject({ musteri: m, istek: { tur: 'resimli', tarif: s.tarif } });
}
/** İstasyona gir (gerekirse bahçeye kay; aynı istasyonda birden çok oyun varsa alet düğmesinden seç) */
async function gir(page: Page, ist: string, oyun: string) {
  const d = (await D(page))!;
  const bahceIst = ist === 'mangal';
  if (bahceIst !== d.bahcede) {
    await page.locator('.rs-bahce-gec').click();
    await page.waitForTimeout(500);
  }
  await page.locator(`.rs-ist[data-istasyon="${ist}"]`).click();
  const sec = page.locator(`.rs-oyun-secim-dugme[data-oyun="${oyun}"]`);
  const ekran = page.locator(`.rs-istasyon[data-oyun="${oyun}"]`);
  await expect.poll(async () => (await ekran.count()) + (await sec.count()), { timeout: 8000 }).toBeGreaterThan(0);
  if (await sec.count()) await sec.click();
  await expect(ekran).toBeVisible();
  await page.waitForTimeout(350);
}
async function tepsi(page: Page) {
  await page.locator('.rs-tepsi-dugme').click();
  await expect.poll(async () => (await D(page))?.istasyon, { timeout: 15_000 }).toBe(false);
  await page.waitForTimeout(300);
}
/** Hazır tabak Kino'ya: masaya taşır, müşteri yer, tepki */
async function servis(page: Page, musteri = 'bulut') {
  if ((await D(page))!.bahcede) {
    await page.locator('.rs-bahce-gec').click();
    await page.waitForTimeout(500);
  }
  await expect.poll(async () => (await D(page))?.hazir, { timeout: 10_000 }).toBeGreaterThan(0);
  await page.locator('.rs-hazir').first().click();
  await expect.poll(async () => !!(await D(page))?.tepkiler.find((t) => t.musteri === musteri), { timeout: 60_000 }).toBe(true);
  return (await D(page))!.tepkiler.find((t) => t.musteri === musteri)!;
}
/** Tabakla: tepsideki her şeyi tabağa sürükle, servis zili */
async function tabakla(page: Page) {
  await gir(page, 'servis', 'tabakla');
  const m = (await kancaCagir(page, '__rsTabakla', 'merkez')) as { cx: number; cy: number; R: number };
  const k = (await page.locator('.rs-tabakla').boundingBox())!;
  for (let i = 0; i < 4; i++) {
    const u = page.locator('.rs-tb-urun:not(.rs-kullanildi)');
    if (!(await u.count())) break;
    await cek(page, await orta(page, '.rs-tb-urun:not(.rs-kullanildi)'), { x: k.x + m.cx + (i - 1) * m.R * 0.2, y: k.y + m.cy + 34 }, 8, 8);
    await page.waitForTimeout(250);
  }
  await tepsi(page);
}
/** Doğra: raftan seç, her birinin üstünden dikine kaydır */
async function dogra(page: Page, malzemeler: string[]) {
  await gir(page, 'tezgah', 'dogra');
  for (const m of malzemeler) {
    await dokun(page, `.rs-dg-raf-oge[data-malzeme="${m}"]`, 450);
    for (let i = 0; i < 2; i++) {
      const r = (await page.locator(`.rs-p2-parca[data-malzeme="${m}"]`).first().boundingBox())!;
      const x = r.x + r.width * (0.35 + i * 0.3);
      await cek(page, { x, y: r.y - 30 }, { x, y: r.y + r.height + 30 }, 6, 0);
    }
  }
  await tepsi(page);
}

const TARIF_YOLU: Record<string, { acilan: string; pisir: (page: Page) => Promise<void> }> = {
  salata: {
    acilan: '',
    pisir: async (page) => {
      await dogra(page, ['salatalik', 'domates']);
      await tabakla(page);
    },
  },
  menemen: {
    acilan: '',
    pisir: async (page) => {
      await dogra(page, ['domates', 'biber']);
      await gir(page, 'ocak', 'tava');
      await dokun(page, '.rs-tv-raf-oge[data-tur="yag"]');
      await dokun(page, '.rs-tv-raf-oge[data-tur="kase"]', 400);
      await dokun(page, '.rs-tv-raf-oge[data-tur="yumurta"]', 400);
      await dokun(page, '.rs-tv-kenar-yumurta', 400);
      if (await page.locator('.rs-tv-kenar-yumurta').count()) await dokun(page, '.rs-tv-kenar-yumurta', 400);
      for (let i = 0; i < 4; i++) await dokun(page, '.rs-tv-spatula', 250);
      await kancaCagir(page, '__rsTava', 'pisir', 30);
      await tepsi(page);
      await tabakla(page);
    },
  },
  ayran: {
    acilan: 'ayran',
    pisir: async (page) => {
      await gir(page, 'icecek', 'icecek');
      for (const ad of ['yogurt', 'yogurt', 'yogurt', 'su', 'su', 'su']) await dokun(page, `.rs-ic-raf-oge[data-ad="${ad}"]`, 380);
      await dokun(page, '.rs-ic-kapak', 300);
      const k = (await page.locator('.rs-icecek').boundingBox())!;
      const s = ((await kancaCagir(page, '__rsIcecek', 'durum')) as { surahi: { x: number; y: number; h: number } }).surahi;
      await page.mouse.move(k.x + s.x, k.y + s.y + s.h * 0.2);
      await page.mouse.down();
      for (let i = 0; i < 16; i++) {
        await page.mouse.move(k.x + s.x + (i % 2 ? 40 : -40), k.y + s.y + s.h * 0.2);
        await page.waitForTimeout(40);
      }
      await page.mouse.up();
      await page.waitForTimeout(300);
      await dokun(page, '.rs-ic-kapak', 300);
      await tepsi(page);
    },
  },
  limonata: {
    acilan: 'limonata',
    pisir: async (page) => {
      await gir(page, 'icecek', 'icecek');
      await dokun(page, '.rs-ic-raf-oge[data-ad="limon"]', 600);
      const q = await orta(page, '.rs-ic-kesme');
      await cek(page, { x: q.x - 70, y: q.y }, { x: q.x + 70, y: q.y }, 10, 16);
      await dokun(page, '.rs-ic-kesme', 300);
      const pr = (await page.locator('.rs-ic-pres').boundingBox())!;
      const cx = pr.x + pr.width / 2;
      const cy = pr.y + pr.height / 2;
      await page.mouse.move(cx + 20, cy);
      await page.mouse.down();
      for (let i = 0; i < 70; i++) {
        await page.mouse.move(cx + Math.cos(i * 0.3) * 20, cy + Math.sin(i * 0.3) * 14);
        await page.waitForTimeout(16);
      }
      await page.mouse.up();
      await page.waitForTimeout(600);
      for (const ad of ['su', 'su', 'su']) await dokun(page, `.rs-ic-raf-oge[data-ad="${ad}"]`, 380);
      await tepsi(page);
    },
  },
  patates: {
    acilan: 'patates',
    pisir: async (page) => {
      await gir(page, 'ocak', 'kizart');
      await dokun(page, '.rs-kzr-raf-oge[data-malzeme="patates"]', 420);
      await dokun(page, '.rs-kzr-raf-oge[data-malzeme="patates"]', 420);
      const s0 = await orta(page, '.rs-kzr-sepet');
      await cek(page, s0, { x: s0.x, y: s0.y + 60 }, 8, 16);
      await page.waitForTimeout(300);
      await kancaCagir(page, '__rsKizart', 'pisir', 8);
      await tepsi(page);
    },
  },
  corba: {
    acilan: 'corba',
    pisir: async (page) => {
      await gir(page, 'ocak', 'kazan');
      await dokun(page, '.rs-p5-raf-oge[data-tur="mercimek"]', 300);
      await dokun(page, '.rs-p5-raf-oge[data-tur="mercimek"]', 300);
      for (let i = 0; i < 4; i++) await dokun(page, '.rs-kz-kepce', 450);
      await kancaCagir(page, '__rsKazan', 'pisir', 20);
      await tepsi(page);
    },
  },
  pankek: {
    acilan: 'pankek',
    pisir: async (page) => {
      await gir(page, 'mermer', 'kir-cirp');
      await dokun(page, '.rs-p5-raf-oge[data-tur="yumurta"]', 400);
      await dokun(page, '.rs-kc-kenar-yumurta', 400);
      if (await page.locator('.rs-kc-kenar-yumurta').count()) await dokun(page, '.rs-kc-kenar-yumurta', 400);
      await dokun(page, '.rs-p5-raf-oge[data-tur="sut"]', 300);
      await dokun(page, '.rs-p5-raf-oge[data-tur="un"]', 200);
      await dokun(page, '.rs-p5-raf-oge[data-tur="un"]', 200);
      for (let i = 0; i < 10 && !(await olaylar(page, '__rsKirCirp')).includes('puruzsuz'); i++) await dokun(page, '.rs-kc-tel', 500);
      await tepsi(page);
      await gir(page, 'ocak', 'tava');
      await dokun(page, '.rs-tv-raf-oge[data-tur="hamur"]', 500);
      await kancaCagir(page, '__rsTava', 'pisir', 8);
      const p = await orta(page, '.rs-tv-pankek');
      await cek(page, p, { x: p.x, y: p.y - 90 }, 4, 10);
      await page.waitForTimeout(800);
      await kancaCagir(page, '__rsTava', 'pisir', 6);
      await tepsi(page);
      await tabakla(page);
    },
  },
  pide: {
    acilan: 'pide',
    pisir: async (page) => {
      await gir(page, 'firin', 'pide');
      const m = (await kancaCagir(page, '__rsPide', 'merkez')) as { px: number; py: number; r0: number; merdane: Nokta };
      await page.mouse.move(m.merdane.x, m.merdane.y);
      await page.mouse.down();
      await page.mouse.move(m.px, m.py + 20, { steps: 6 });
      for (let i = 0; i < 3; i++) {
        await page.mouse.move(m.px + m.r0 * 1.4, m.py + 20, { steps: 6 });
        await page.mouse.move(m.px - m.r0 * 1.4, m.py + 20, { steps: 6 });
      }
      await page.mouse.up();
      for (const t of ['kasar', 'kasar', 'sucuk']) await dokun(page, `.rs-p5-raf-oge[data-tur="${t}"]`, 120);
      await dokun(page, '.rs-pd-kurek', 600);
      await dokun(page, '.rs-pd-kurek', 600);
      await kancaCagir(page, '__rsPide', 'pisir', 9);
      await dokun(page, '.rs-pd-kurek', 900);
      await tepsi(page);
    },
  },
  kofte: {
    acilan: 'bahce,kofte',
    pisir: async (page) => {
      await gir(page, 'mermer', 'yogur');
      for (let i = 0; i < 3; i++) await dokun(page, '.rs-yg-kase', 180);
      for (let i = 0; i < 2; i++) await dokun(page, '.rs-yg-kase', 350);
      for (const q of (await kancaCagir(page, '__rsYogur', 'topakYeri')) as Nokta[]) {
        await page.mouse.click(q.x, q.y);
        await page.waitForTimeout(500);
      }
      await tepsi(page);
      await gir(page, 'mangal', 'mangal');
      await dokun(page, '.rs-p5-raf-oge[data-tur="sini"]', 500);
      await kancaCagir(page, '__rsMangal', 'pisir', 10);
      for (const q of ((await kancaCagir(page, '__rsMangal', 'parcaYeri')) as (Nokta & { tur: string })[]).filter((x) => x.tur === 'kofte')) {
        await page.mouse.click(q.x, q.y);
        await page.waitForTimeout(450);
      }
      await kancaCagir(page, '__rsMangal', 'pisir', 10);
      await tepsi(page);
      await tabakla(page);
    },
  },
  sis: {
    acilan: 'sis',
    pisir: async (page) => {
      await gir(page, 'tezgah', 'sis');
      for (const m of ['cilek', 'muz', 'cilek', 'muz', 'kavun', 'uzum', 'kavun', 'uzum']) await dokun(page, `.rs-p5-raf-oge[data-tur="${m}"]`, 160);
      await tepsi(page);
    },
  },
  borek: {
    acilan: 'borek',
    pisir: async (page) => {
      await gir(page, 'mermer', 'sar');
      await dokun(page, '.rs-p5-raf-oge[data-tur="peynir"]', 200);
      await dokun(page, '.rs-p5-raf-oge[data-tur="maydanoz"]', 200);
      await dokun(page, '.rs-sr-yufka', 200);
      await dokun(page, '.rs-sr-yufka', 200);
      await dokun(page, '.rs-p5-raf-oge[data-tur="su"]', 900);
      await page.locator('.rs-sr-rulolar .rs-sr-rulo').first().click({ force: true });
      await page.waitForTimeout(300);
      await kancaCagir(page, '__rsSar', 'pisir', 5);
      await tepsi(page);
    },
  },
  sutlac: {
    acilan: 'sutlac',
    pisir: async (page) => {
      await gir(page, 'ocak', 'sutlac');
      for (const m of ['sut', 'pirinc', 'seker']) await dokun(page, `.rs-p5-raf-oge[data-tur="${m}"]`, 200);
      for (let i = 0; i < 2; i++) await dokun(page, '.rs-sl-kepce', 600);
      for (let i = 0; i < 2; i++) {
        await page.locator('.rs-sl-tepsi .rs-sl-kase').nth(i).click({ force: true });
        await page.waitForTimeout(900);
      }
      await dokun(page, '.rs-sl-firin', 300);
      await kancaCagir(page, '__rsSutlac', 'pisir', 5);
      await dokun(page, '.rs-sl-firin', 400);
      await dokun(page, '.rs-p5-raf-oge[data-tur="tarcin"]', 300);
      await tepsi(page);
    },
  },
};

test.describe('P6 · 12 tarif uçtan uca (gerçek mini oyunlarla pişir, servis et)', () => {
  test.use({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  test.beforeEach(({}, info) => test.skip(info.project.name !== 'iphone', 'telefon boyu ayrı'));
  for (const [tarif, y] of Object.entries(TARIF_YOLU)) {
    test(`${tarif}: istenir, pişirilir, servis edilir, müşteri yer ve tepki verir`, async ({ page }) => {
      test.setTimeout(240_000);
      const hatalar = hataTopla(page);
      await gunAc(page, { tarif, acilan: [y.acilan, tarif].filter(Boolean).join(',') });
      await y.pisir(page);
      const t = await servis(page);
      expect(t.yemek, JSON.stringify(t)).toBe(tarif);
      expect(['bayildi', 'mmm', 'komik']).toContain(t.tepki);
      expect(await buyutulen(page)).toEqual([]);
      await page.screenshot({ path: `tests/screens/restoran-tur-${tarif}.png` });
      expect(hatalar).toEqual([]);
    });
  }
});

/** Kapıda kimse yokken */
async function kapiBos(page: Page) {
  await expect.poll(async () => (await page.evaluate(() => (window as unknown as { __rsGun: { durum(): { kapida: unknown } } }).__rsGun.durum().kapida)) === null, { timeout: 30_000 }).toBe(true);
}
const surprizVar = async (page: Page, ad: string, timeout = 15_000) => expect.poll(async () => (await D(page))?.surprizler.includes(ad), { timeout }).toBe(true);

test.describe('P6 · gizli sürprizler ve lavabo (yatay 844×390, 3-4)', () => {
  test.use({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  test.beforeEach(({}, info) => test.skip(info.project.name !== 'iphone', 'telefon boyu ayrı'));

  test('sürprizler: fotoğraf, gramofon, akvaryum, tuzluk, kapı zili, masa örtüsü, soğan gözyaşı, Lokum patisi, Kino patatesi, Fındık → Nehir, mangal isi', async ({ page }) => {
    test.setTimeout(300_000);
    const hatalar = hataTopla(page);
    await gunAc(page, { tarif: 'patates', acilan: 'patates,masa-3,gramofon,akvaryum,bahce,kofte', ek: '&findik=1&patates=1&pati=1' });
    // 8. Babaanne'nin fotoğrafı göz kırpar
    await page.locator('.rs-sp-foto').click();
    await surprizVar(page, 'foto');
    // 9. gramofon: müzik, oturanlar sallanır
    await page.locator('.rs-sus[data-sus="gramofon"]').click({ force: true });
    await surprizVar(page, 'gramofon');
    await page.screenshot({ path: 'tests/screens/restoran-surpriz-gramofon.png' });
    // 10. akvaryum: balık parmağı izler
    const ak = (await page.locator('.rs-sus[data-sus="akvaryum"]').boundingBox())!;
    await cek(page, { x: ak.x + ak.width * 0.25, y: ak.y + ak.height * 0.5 }, { x: ak.x + ak.width * 0.75, y: ak.y + ak.height * 0.5 }, 8, 20);
    await surprizVar(page, 'akvaryum');
    // 5. tuzluk: beş dokunuş, yakındaki müşteri hapşırır
    for (let i = 0; i < 5; i++) {
      await page.locator('.rs-sp-tuzluk').first().click({ force: true });
      await page.waitForTimeout(90);
    }
    await surprizVar(page, 'tuzluk');
    // 11. kapının camından Fındık: havlar, sıradaki müşteri Nehir abla
    await page.locator('.rs-sp-findik.rs-gorunur').click({ timeout: 10_000 });
    await surprizVar(page, 'findik');
    const plan = await page.evaluate(() => (window as unknown as { __rsGun: { plan: { musteriler: { musteri: string }[] } } }).__rsGun.plan);
    expect(plan.musteriler.map((m) => m.musteri)).toContain('nehir');
    // 3. kapı zili: kimse yok, oturanlar kapıya bakar
    await kapiBos(page);
    const kp = (await page.locator('.rs-kapi').boundingBox())!;
    await page.mouse.click(kp.x + kp.width * 0.5, kp.y + kp.height * 0.15);
    await surprizVar(page, 'kapi');
    // 4. boş masaya iki dokunuş: Kino örtüyü çeker, ta-da
    const bos = (await D(page))!.masalar.findIndex((m) => !m.oturan && !m.kirli);
    expect(bos).toBeGreaterThanOrEqual(0);
    const mb = (await page.locator(`.rs-masa[data-masa="${bos}"]`).boundingBox())!;
    await page.mouse.click(mb.x + mb.width * 0.35, mb.y + mb.height * 0.5);
    await page.waitForTimeout(120);
    await page.mouse.click(mb.x + mb.width * 0.35, mb.y + mb.height * 0.5);
    await surprizVar(page, 'ortu');
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'tests/screens/restoran-surpriz-ortu.png' });
    // 1. soğan gözyaşı (Doğra) ve 2. Lokum'un patisi
    await gir(page, 'tezgah', 'dogra');
    await dokun(page, '.rs-dg-raf-oge[data-malzeme="sogan"]', 450);
    const sogan = page.locator('.rs-p2-parca[data-malzeme="sogan"]');
    for (let i = 0; i < 3; i++) {
      const d = (await kancaCagir(page, '__rsDogra', 'durum')) as { tahta: { ad: string; kabuk: number }[] };
      if (!d.tahta.find((t) => t.ad === 'sogan')?.kabuk) break;
      const r = (await sogan.first().boundingBox())!;
      await cek(page, { x: r.x + r.width / 2, y: r.y + r.height / 2 }, { x: r.x + r.width / 2 + 70, y: r.y + r.height / 2 - 40 }, 5, 10);
    }
    for (let i = 0; i < 4; i++) {
      const r = (await sogan.first().boundingBox())!;
      await cek(page, { x: r.x + r.width / 2, y: r.y - 30 }, { x: r.x + r.width / 2, y: r.y + r.height + 30 }, 6, 0);
    }
    await expect(page.locator('.rs-dg-mendil.rs-gorunur')).toBeVisible({ timeout: 8000 });
    await page.screenshot({ path: 'tests/screens/restoran-surpriz-sogan.png' });
    await page.locator('.rs-dg-mendil').click();
    await expect.poll(async () => (await olaylar(page, '__rsDogra')).includes('mendil')).toBe(true);
    await dokun(page, '.rs-dg-raf-oge[data-malzeme="salatalik"]', 450);
    const sal = (await page.locator('.rs-p2-parca[data-malzeme="salatalik"]').first().boundingBox())!;
    await cek(page, { x: sal.x + sal.width / 2, y: sal.y - 30 }, { x: sal.x + sal.width / 2, y: sal.y + sal.height + 30 }, 6, 0);
    // dokunmadan bekle: pati alttan uzanır, dilim çalar; patiye dokun: Lokum kıkırdayıp geri koyar
    await surprizVar(page, 'pati', 12_000);
    const pati = page.locator('.rs-sp-pati');
    if (await pati.count()) await pati.click({ force: true }).catch(() => undefined);
    await page.screenshot({ path: 'tests/screens/restoran-surpriz-pati.png' });
    await page.waitForTimeout(1500);
    await page.locator('.rs-ist-geri').click();
    await expect.poll(async () => (await D(page))?.istasyon).toBe(false);
    // 7. Kino'nun patatesi: patatesli tabağı taşırken bir tane alır; Kino'ya dokununca utanıp geri koyar
    await TARIF_YOLU.patates.pisir(page);
    await page.locator('.rs-hazir').first().click();
    await expect(page.locator('.rs-kino.rs-calar')).toHaveCount(1, { timeout: 15_000 });
    const kb = (await page.locator('.rs-kino').boundingBox())!;
    await page.mouse.click(kb.x + kb.width / 2, kb.y + kb.height * 0.5);
    await surprizVar(page, 'patates');
    // mangal: çok yelpaze → duman, Kino'nun yüzü is (lokantada da)
    await gir(page, 'mangal', 'mangal');
    await dokun(page, '.rs-p5-raf-oge[data-tur="biber"]', 300);
    const y = await orta(page, '.rs-mg-yelpaze');
    const mg = (await page.locator('.rs-mg-mangal').boundingBox())!;
    await page.mouse.move(y.x, y.y);
    await page.mouse.down();
    for (let i = 0; i < 16; i++) {
      await page.mouse.move(mg.x + mg.width / 2 + (i % 2 ? 80 : -80), mg.y + mg.height * 0.35 + 34, { steps: 3 });
      await page.waitForTimeout(30);
    }
    await page.mouse.up();
    await surprizVar(page, 'isli');
    await page.locator('.rs-ist-geri').click();
    await expect.poll(async () => (await D(page))?.istasyon).toBe(false);
    if ((await D(page))!.bahcede) await page.locator('.rs-bahce-gec').click();
    await page.waitForTimeout(500);
    await expect(page.locator('.rs-kino .rs-sp-is')).toHaveCount(1);
    await page.screenshot({ path: 'tests/screens/restoran-surpriz-isli-kino.png' });
    expect(await buyutulen(page)).toEqual([]);
    expect(hatalar).toEqual([]);
  });

  test('lavabo: Kino toplar, tabak yığılır, Bulaşık oynanır, Babaanne bahşişi kasaya', async ({ page }) => {
    test.setTimeout(240_000);
    const hatalar = hataTopla(page);
    await gunAc(page, { tarif: 'salata', acilan: '' });
    await TARIF_YOLU.salata.pisir(page);
    await servis(page);
    await expect.poll(async () => (await D(page))?.yigin, { timeout: 40_000 }).toBeGreaterThan(0);
    await expect(page.locator('.rs-ist[data-istasyon="lavabo"] .rs-lav-yigin i')).not.toHaveCount(0);
    const kasa = (await D(page))!.kasa;
    await gir(page, 'lavabo', 'bulasik');
    for (let i = 0; i < 30; i++) {
      if ((await olaylar(page, '__rsBulasik')).includes('dogalSon')) break;
      const st = await page.evaluate(() => document.querySelector<HTMLElement>('.rs-bl-tabak')?.dataset.durum);
      if (st === 'kirli') await dokun(page, '.rs-bl-sunger', 700);
      else if (st) await dokun(page, '.rs-bl-tabak', 1200);
      else await page.waitForTimeout(300);
    }
    await page.screenshot({ path: 'tests/screens/restoran-lavabo-bulasik.png' });
    await tepsi(page);
    await expect.poll(async () => (await D(page))?.kasa, { timeout: 10_000 }).toBe(kasa + 1);
    expect((await D(page))!.yigin).toBe(0);
    expect(hatalar).toEqual([]);
  });
});

test.describe('P6 · 5-6 (dikey 390×844): pankek şapka, portakal tacı, personel yemeği', () => {
  test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  test.beforeEach(({}, info) => test.skip(info.project.name !== 'iphone', 'telefon boyu ayrı'));

  test('tavana yapışan pankek Kino başına şapka; tek parça portakal kabuğu Lokum başına taç; personel yemeğinde üçü kendi zevkine göre yer', async ({ page }) => {
    test.setTimeout(300_000);
    const hatalar = hataTopla(page);
    // personel yemeği açık (gunAc &personel=0 koymasın diye elle)
    await page.goto('./restoran/?test=1&sifirla=1&yas=buyuk&ekran=lokanta&gun=7&acilan=pankek,patates&musteriler=bulut&tohum=5');
    await menuSec(page, ['pankek', 'patates']);
    // 6. pankek: hamur, tavada pişer, çok güçlü fiske tavana yapışır; hemen lokantaya dönülür → Kino'nun şapkası
    await gir(page, 'mermer', 'kir-cirp');
    await dokun(page, '.rs-p5-raf-oge[data-tur="sut"]', 300);
    await dokun(page, '.rs-p5-raf-oge[data-tur="un"]', 200);
    await dokun(page, '.rs-p5-raf-oge[data-tur="un"]', 200);
    for (let i = 0; i < 12 && !(await olaylar(page, '__rsKirCirp')).includes('puruzsuz'); i++) await dokun(page, '.rs-kc-tel', 500);
    await tepsi(page);
    await gir(page, 'ocak', 'tava');
    await dokun(page, '.rs-tv-raf-oge[data-tur="hamur"]', 500);
    await kancaCagir(page, '__rsTava', 'pisir', 8);
    const p = await orta(page, '.rs-tv-pankek');
    await cek(page, p, { x: p.x, y: p.y - 140 }, 3, 0);
    await expect.poll(async () => (await olaylar(page, '__rsTava')).includes('tavan')).toBe(true);
    await page.locator('.rs-ist-geri').click();
    await surprizVar(page, 'sapka');
    await expect(page.locator('.rs-kino .rs-sp-sapka')).toHaveCount(1);
    await page.screenshot({ path: 'tests/screens/restoran-surpriz-sapka.png' });
    // 12. portakal: parmağı kaldırmadan daire, tek parça spiral → Lokum'un başına taç
    await gir(page, 'tezgah', 'soy');
    await dokun(page, '.rs-sy-raf-oge[data-malzeme="portakal"]', 600);
    const k = (await page.locator('.rs-soy').boundingBox())!;
    const a = ((await kancaCagir(page, '__rsSoy', 'durum')) as { aktif: { x: number; y: number; boy: number; govde: { cx: number; cy: number; rx: number } } }).aktif;
    const cx = k.x + a.x - a.boy / 2 + (a.govde.cx / 100) * a.boy;
    const cy = k.y + a.y - a.boy / 2 + (a.govde.cy / 100) * a.boy;
    const R = (a.govde.rx / 100) * a.boy;
    await page.mouse.move(cx + R * 0.8, cy);
    await page.mouse.down();
    for (let i = 0; i < 160; i++) {
      await page.mouse.move(cx + Math.cos(i * 0.1) * R * 0.8, cy + Math.sin(i * 0.1) * R * 0.8);
      await page.waitForTimeout(12);
    }
    await page.mouse.up();
    await expect.poll(async () => (await olaylar(page, '__rsSoy')).includes('tac'), { timeout: 10_000 }).toBe(true);
    await page.screenshot({ path: 'tests/screens/restoran-surpriz-tac.png' });
    await page.locator('.rs-ist-geri').click();
    await expect.poll(async () => (await D(page))?.istasyon).toBe(false);
    // personel yemeği: müşteriler bitince Kino oturur, Lokum gelir, Mino masaya; üç tabak kızartma
    await page.evaluate(() => (window as unknown as { __rsGun: { musterileriBitir(): void } }).__rsGun.musterileriBitir());
    await expect.poll(async () => (await D(page))?.personel?.length ?? 0, { timeout: 20_000 }).toBe(3);
    await expect(page.locator('.rs-pr-levha')).toBeVisible();
    await page.waitForTimeout(1500);
    for (let i = 0; i < 3; i++) {
      await TARIF_YOLU.patates.pisir(page);
      await expect.poll(async () => (await D(page))?.hazir, { timeout: 10_000 }).toBeGreaterThan(0);
      await page.locator('.rs-hazir').first().click();
      await expect.poll(async () => (await D(page))?.personel?.filter((x) => x.doydu).length ?? 3, { timeout: 30_000 }).toBeGreaterThanOrEqual(i + 1);
      if (i === 0) await page.screenshot({ path: 'tests/screens/restoran-personel.png' });
    }
    await expect.poll(async () => (await D(page))?.gunBitti, { timeout: 30_000 }).toBe(true);
    await expect(page.locator('.rs-gun-sonu')).toBeVisible({ timeout: 20_000 });
    expect(await buyutulen(page)).toEqual([]);
    expect(hatalar).toEqual([]);
  });
});
