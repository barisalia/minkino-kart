/**
 * Tıkır Tıkır Lokanta · P1 çekirdek (/restoran/, ekip/senaryo/RESTORAN.md §12 P1 "bitti"): Gün 1 uçtan uca (deneme
 * mini oyunuyla), 4 müşteri, 2 masa, resimli / ipuçlu / sürpriz istek, 3 tepki kademesi, jeton kasaya, kayıt; en uzun
 * karakter ekranın ≤ %40'ı, toplam karakter alanı ≤ %25; hiçbir resim kaynak pikselinin üstüne büyütülmez.
 * Ekran kareleri tests/screens/ (git'e girmez).
 */
import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

const TELEFON = [
  { ad: 'yatay', viewport: { width: 844, height: 390 } },
  { ad: 'dikey', viewport: { width: 390, height: 844 } },
] as const;

interface Durum {
  siradaki: number;
  kapida: { ad: string; hazir: boolean } | null;
  masalar: { oturan: string | null; durum: string | null; jeton: number; kirli: boolean }[];
  tepsi: string[];
  hazir: number;
  gunJeton: number;
  kasa: number;
  hizmet: number;
  gunBitti: boolean;
  istasyon: boolean;
  tepkiler: { musteri: string; istek: string; tepki: string; neden?: string }[];
  bekleyen: string | null;
}
const durum = (page: Page) => page.evaluate(() => (window as unknown as { __rsGun?: { durum(): unknown } }).__rsGun?.durum() as Durum | undefined);

/** Görsel kaynak pikselinin üstüne büyütülmüş mü (DPR 3) */
const buyutulen = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLImageElement>('.rs-kok img')]
      .filter((i) => i.naturalWidth && i.getBoundingClientRect().width > 4 && !i.closest('.rs-ucan-jeton'))
      .map((i) => {
        const r = i.getBoundingClientRect();
        const fit = getComputedStyle(i).objectFit;
        const en = fit === 'contain' || fit === 'scale-down' ? Math.min(r.width, (r.height * i.naturalWidth) / i.naturalHeight) : r.width;
        return { src: i.src.split('/').pop(), en, dogal: i.naturalWidth };
      })
      .filter((x) => x.en * 3 > x.dogal * 1.02),
  );

/** Karakterlerin figür kutuları (ekranda): en uzun / ekran yüksekliği, toplam alan / ekran alanı */
const karakterOlcu = (page: Page) =>
  page.evaluate(() => {
    const H = innerHeight;
    const W = innerWidth;
    let enUzun = 0;
    let alan = 0;
    for (const el of document.querySelectorAll<HTMLElement>('.rs-lokanta .rs-kisi')) {
      const r = el.getBoundingClientRect();
      if (!r.width) continue;
      const [tepe, taban] = (el.dataset.figur ?? '0,1').split(',').map(Number);
      const boy = r.height * (taban - tepe);
      enUzun = Math.max(enUzun, boy / H);
      alan += r.width * boy;
    }
    return { enUzun, alan: alan / (W * H) };
  });

/**
 * Bir günü oynar (test modu, deneme mini oyunu): bekleyen müşteriye göre tezgâhta malzeme seçer, servis
 * penceresinde tabağa dizer, tabağı Kino'ya verir, hesap tabağına dokunur. secim: müşteri → [malzemeler, garnitür]
 */
async function gunuOyna(page: Page, secim: Record<string, [string[], string[]]>, olcu?: () => Promise<void>) {
  for (let i = 0; i < 400; i++) {
    const s = await durum(page);
    if (!s) {
      await page.waitForTimeout(200);
      continue;
    }
    if (s.gunBitti) return s;
    if (i % 15 === 7) await olcu?.();
    if (s.hazir > 0 && s.bekleyen) {
      await page.locator('.rs-hazir').first().click();
      await page.waitForTimeout(200);
      continue;
    }
    if (s.bekleyen && !s.istasyon) {
      const [malzeme, garnitur] = secim[s.bekleyen] ?? [['domates', 'salatalik'], []];
      await page.locator('.rs-ist[data-istasyon="tezgah"]').click();
      for (const m of malzeme) await page.locator(`.rs-deneme-malzeme[data-malzeme="${m}"]`).click();
      await page.locator('.rs-tepsi-dugme').click();
      await expect.poll(async () => (await durum(page))?.istasyon).toBe(false);
      await page.locator('.rs-ist[data-istasyon="servis"]').click();
      const urun = page.locator('.rs-deneme-urun');
      if (await urun.count()) await urun.first().click();
      for (const g of garnitur) await page.locator(`.rs-deneme-malzeme[data-malzeme="${g}"]`).click();
      await page.locator('.rs-tepsi-dugme').click();
      await expect.poll(async () => (await durum(page))?.istasyon).toBe(false);
      continue;
    }
    const hesap = page.locator('.rs-hesap.rs-dolu');
    if (await hesap.count()) await hesap.first().click({ force: true });
    await page.waitForTimeout(150);
  }
  throw new Error('gün bitmedi');
}

for (const boy of TELEFON) {
  test.describe(`Tıkır Tıkır Lokanta telefon ${boy.ad}`, () => {
    test.use({ viewport: boy.viewport, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    test.beforeEach(({}, info) => test.skip(info.project.name !== 'iphone', 'telefon boyları ayrı veriliyor'));

    test('Gün 1 uçtan uca: 4 müşteri, üç tür istek, üç tepki kademesi, jeton kasaya, kayıt; karakterler dev değil', async ({ page }) => {
      test.setTimeout(240_000);
      const hatalar = hataTopla(page);
      await page.goto('./restoran/?test=1&sifirla=1&yas=kucuk&deneme=1');
      // açılış: levha döner, lokanta açılır
      await page.locator('.rs-levha').click();
      await expect(page.locator('.rs-lokanta')).toBeVisible();
      const plan = await page.evaluate(() => (window as unknown as { __rsGun: { plan: { musteriler: { musteri: string; istek: { tur: string } }[] } } }).__rsGun.plan);
      expect(plan.musteriler.map((m) => m.musteri)).toEqual(['anne', 'lokum', 'baba', 'tombi']);
      expect(new Set(plan.musteriler.map((m) => m.istek.tur))).toEqual(new Set(['resimli', 'ipuclu', 'surpriz']));
      let enUzun = 0;
      let enAlan = 0;
      const olcu = async () => {
        const o = await karakterOlcu(page);
        enUzun = Math.max(enUzun, o.enUzun);
        enAlan = Math.max(enAlan, o.alan);
      };
      // Anne: salata + limon (bayıldı); Lokum: yalnız domates (mmm); Baba: tek domates, az porsiyon (komik); Tombi: sürpriz
      const s = await gunuOyna(
        page,
        {
          anne: [['domates', 'salatalik'], ['limon']],
          lokum: [['domates', 'salatalik'], []],
          baba: [['domates'], []],
          tombi: [['salatalik', 'domates', 'biber'], []],
        },
        olcu,
      );
      const tepki = Object.fromEntries(s.tepkiler.map((t) => [t.musteri, t.tepki]));
      expect(tepki).toEqual({ anne: 'bayildi', lokum: 'mmm', baba: 'komik', tombi: 'mmm' });
      // jeton: 3-4 yaş taban 2, bayıldı +1 → 2+1 + 2 + 2 + 2 = 9 (toplanmayanlar gün sonunda kasaya kayar)
      await expect(page.locator('.rs-gun-sonu')).toBeVisible();
      expect((await durum(page))!.gunJeton).toBe(9);
      expect(enUzun).toBeGreaterThan(0.05);
      expect(enUzun).toBeLessThanOrEqual(0.4);
      expect(enAlan).toBeLessThanOrEqual(0.25);
      await expect(page.locator('.rs-gun-sonu')).toBeVisible();
      // gün sonu: Babaanne'nin Defteri (P4); süs sekmesinden kareli örtü (3 jeton)
      await expect(page.locator('.rs-defter')).toBeVisible({ timeout: 20_000 });
      await page.locator('.rs-df-sekme[data-sekme="sus"]').click();
      await page.locator('.rs-df-kart[data-kalem="ortu-kareli"]').click();
      await expect(page.locator('.rs-gs-yarin')).toBeVisible({ timeout: 20_000 });
      const kayit = await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-restoran-v1') ?? '{}'));
      expect(kayit).toMatchObject({ gun: 1, jeton: 6, ortu: 'kareli' });
      expect(kayit.pano.anne).toEqual(['limon']);
      await page.screenshot({ path: `tests/screens/restoran-${boy.ad}-gunsonu.png` });
      // ertesi gün: lokanta yeniden açılır, örtüler serili
      await page.locator('.rs-gs-yarin').click();
      await expect(page.locator('.rs-lokanta[data-gun="2"]')).toBeVisible();
      await expect(page.locator('.rs-masa[data-ortu="kareli"]').first()).toBeVisible();
      expect(hatalar).toEqual([]);
    });

    test('gerçek hız: müşteri masaya sürüklenir, oturur, istek balonu ve adisyon; tabak masaya sürüklenir; zoom yok', async ({ page }) => {
      test.setTimeout(180_000);
      const hatalar = hataTopla(page);
      await page.goto('./restoran/?test=1&sifirla=1&yas=kucuk&deneme=1');
      await page.goto('./restoran/?onizleme=1&ekran=lokanta&deneme=1');
      // ilk oyun: Babaanne anahtarı uzatır (P4)
      await page.locator('.rs-anahtar').click({ timeout: 20_000 });
      // müşteri kapıda hazır olunca boş masaya sürükle
      await expect.poll(async () => (await durum(page))?.kapida?.hazir, { timeout: 30_000 }).toBe(true);
      const kisi = page.locator('.rs-kisi[data-kisi="anne"]');
      const masa = page.locator('.rs-masa[data-masa="1"]');
      const a = (await kisi.boundingBox())!;
      const b = (await masa.boundingBox())!;
      await page.mouse.move(a.x + a.width / 2, a.y + a.height * 0.6);
      await page.mouse.down();
      for (let i = 1; i <= 12; i++) await page.mouse.move(a.x + a.width / 2 + ((b.x + b.width / 2 - a.x - a.width / 2) * i) / 12, a.y + a.height * 0.6 + ((b.y + b.height / 2 - a.y - a.height * 0.6) * i) / 12);
      await page.mouse.up();
      await expect.poll(async () => (await durum(page))?.masalar[1].oturan, { timeout: 10_000 }).toBe('anne');
      await expect(page.locator('.rs-kisi[data-kisi="anne"] .rs-balon')).toBeVisible({ timeout: 20_000 });
      await expect(page.locator('.rs-adisyon[data-masa="1"]')).toBeVisible({ timeout: 20_000 });
      await page.waitForTimeout(1500);
      expect(await buyutulen(page)).toEqual([]);
      const o = await karakterOlcu(page);
      expect(o.enUzun).toBeLessThanOrEqual(0.4);
      expect(o.alan).toBeLessThanOrEqual(0.25);
      await page.screenshot({ path: `tests/screens/restoran-${boy.ad}-lokanta.png` });
      // tezgâh → servis → tabağı masaya sürükle
      await page.locator('.rs-ist[data-istasyon="tezgah"]').click();
      await expect(page.locator('.rs-istasyon')).toBeVisible();
      await page.waitForTimeout(500);
      expect(await buyutulen(page)).toEqual([]);
      await page.screenshot({ path: `tests/screens/restoran-${boy.ad}-istasyon.png` });
      for (const m of ['domates', 'salatalik', 'sogan']) await page.locator(`.rs-deneme-malzeme[data-malzeme="${m}"]`).click();
      await page.locator('.rs-tepsi-dugme').click();
      await expect(page.locator('.rs-istasyon')).toHaveCount(0);
      await page.locator('.rs-ist[data-istasyon="servis"]').click();
      await page.locator('.rs-deneme-urun').first().click();
      await page.locator('.rs-tepsi-dugme').click();
      await expect(page.locator('.rs-hazir')).toHaveCount(1);
      const t = (await page.locator('.rs-hazir').boundingBox())!;
      const m2 = (await masa.boundingBox())!;
      await page.mouse.move(t.x + t.width / 2, t.y + t.height / 2);
      await page.mouse.down();
      for (let i = 1; i <= 12; i++) await page.mouse.move(t.x + t.width / 2 + ((m2.x + m2.width / 2 - t.x - t.width / 2) * i) / 12, t.y + t.height / 2 + ((m2.y + m2.height * 0.3 - t.y - t.height / 2) * i) / 12);
      await page.mouse.up();
      await expect.poll(async () => (await durum(page))?.masalar[1].durum, { timeout: 10_000 }).toBe('yiyor');
      await expect.poll(async () => (await durum(page))?.masalar[1].jeton ?? 0, { timeout: 40_000 }).toBeGreaterThan(0);
      expect(hatalar).toEqual([]);
    });
  });
}

test('mini oyun deneme sayfası tek başına açılır ve ürün verir', async ({ page }, info) => {
  test.skip(info.project.name !== 'iphone');
  await page.setViewportSize({ width: 844, height: 390 });
  const hatalar = hataTopla(page);
  await page.goto('./restoran/mini.html?oyun=deneme&test=1');
  await page.locator('.rs-deneme-malzeme').first().click();
  await page.locator('.rs-tepsi-dugme').click();
  await expect(page.locator('.rs-mini-sonuc[data-adet="1"]')).toBeVisible();
  expect(hatalar).toEqual([]);
});
