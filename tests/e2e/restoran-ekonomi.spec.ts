/**
 * Tıkır Tıkır Lokanta · P4 ekonomi ve büyüme (ekip/senaryo/RESTORAN.md §6, §12 P4 "bitti"): Babaanne'nin anahtarı,
 * menü tahtası, gün sonu + Babaanne'nin Defteri, masa / süs yerleştirme, bahçe kayması; 5 gün art arda (her gün bir
 * alım, masa müşteri sayısını artırır, alınan tarif menüye ve isteklere girer), kayıt. Telefon ölçüleri DPR 3.
 * Ekran kareleri tests/screens/ (git'e girmez).
 */
import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

interface Durum {
  acik: boolean;
  menu: string[];
  masaYuvalari: string[];
  bahcede: boolean;
  gunBitti: boolean;
}
type Gun = { plan: { musteriler: { musteri: string; istek: { tur: string; tarif?: string } }[] }; durum(): Durum; gunuBitir(): void };
const gunK = (page: Page) => page.evaluate(() => (window as unknown as { __rsGun?: Gun }).__rsGun?.durum());
const plan = (page: Page) => page.evaluate(() => (window as unknown as { __rsGun: Gun }).__rsGun.plan);
const kayit = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('minkino-restoran-v1') ?? '{}'));

/** Görsel kaynak pikselinin üstüne büyütülmüş mü (DPR 3) */
const buyutulen = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLImageElement>('.rs-kok img')]
      .filter((i) => i.naturalWidth && i.getBoundingClientRect().width > 4 && !i.closest('.rs-ucan-jeton, .rs-df-ucan'))
      .filter((i) => {
        const r = i.getBoundingClientRect();
        // ekranın dışında (bahçe kayınca salon) sayılmaz
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

/** Menü tahtası: seçim varsa raftan kartlara dokunur (önce istenen), zile basar; gün açılana kadar bekler */
async function menuSec(page: Page, once: string[] = []) {
  await expect.poll(async () => (await gunK(page))?.acik || (await page.locator('.rs-menu-tahtasi[data-secim="1"] .rs-mt-kart').count()) > 0, { timeout: 20_000 }).toBe(true);
  if (!(await gunK(page))?.acik) {
    for (const t of once) {
      const k = page.locator(`.rs-mt-kart[data-tarif="${t}"]:not(.rs-mt-tahtada)`);
      if (await k.count()) await k.click();
    }
    for (let i = 0; i < 4 && !(await page.locator('.rs-mt-zil').isVisible()); i++) await page.locator('.rs-mt-kart:not(.rs-mt-tahtada)').first().click();
    await page.locator('.rs-mt-zil').click();
  }
  await expect.poll(async () => (await gunK(page))?.acik, { timeout: 20_000 }).toBe(true);
}

/** Günü bitir → defter; sekmedeki kartı al (yuva gerekiyorsa ilk boş yuva) → yarın */
async function defterdenAl(page: Page, sekme: string, kalem?: string) {
  await page.evaluate(() => (window as unknown as { __rsGun: Gun }).__rsGun.gunuBitir());
  await expect(page.locator('.rs-defter')).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('.rs-df-kart').first()).toBeVisible();
  await page.locator(`.rs-df-sekme[data-sekme="${sekme}"]`).click();
  const kart = kalem ? page.locator(`.rs-df-kart[data-kalem="${kalem}"]`) : page.locator('.rs-df-kart[data-yetiyor="1"]').first();
  await kart.click();
  const yuva = page.locator('.rs-yuva');
  await expect.poll(async () => (await yuva.count()) > 0 || (await page.locator('.rs-df-yarin').isVisible()), { timeout: 20_000 }).toBe(true);
  if (await yuva.count()) await yuva.last().click();
  await expect(page.locator('.rs-df-yarin')).toBeVisible({ timeout: 20_000 });
}

const TELEFON = [
  { ad: '844x390', viewport: { width: 844, height: 390 } },
  { ad: '932x430', viewport: { width: 932, height: 430 } },
  { ad: '667x375', viewport: { width: 667, height: 375 } },
  { ad: '390x844', viewport: { width: 390, height: 844 } },
] as const;

for (const boy of TELEFON) {
  test.describe(`Lokanta büyüme ${boy.ad}`, () => {
    test.use({ viewport: boy.viewport, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    test.beforeEach(({}, info) => test.skip(info.project.name !== 'iphone', 'telefon boyları ayrı veriliyor'));

    test('ilk açılış (gerçek hız): Babaanne anahtarı uzatır, menü tahtası kendiliğinden, müşteri gelir', async ({ page }) => {
      test.setTimeout(120_000);
      const hatalar = hataTopla(page);
      await page.goto('./restoran/?test=1&sifirla=1&yas=kucuk');
      await page.goto('./restoran/?onizleme=1&ekran=lokanta&deneme=1');
      const anahtar = page.locator('.rs-anahtar');
      await expect(anahtar).toBeVisible({ timeout: 20_000 });
      await page.waitForTimeout(600);
      expect(await buyutulen(page)).toEqual([]);
      await page.screenshot({ path: `tests/screens/restoran-p4-${boy.ad}-anahtar.png` });
      await anahtar.click();
      // menü tahtası (seçim yok: salata ve menemen kendiliğinden yerleşir), sonra gün açılır
      await expect(page.locator('.rs-menu-tahtasi')).toBeVisible({ timeout: 20_000 });
      await expect.poll(async () => (await gunK(page))?.acik, { timeout: 30_000 }).toBe(true);
      expect((await gunK(page))!.menu).toEqual(['salata', 'menemen']);
      expect((await kayit(page)).ilkOyun).toBe(true);
      await expect(page.locator('.rs-kisi[data-kisi="anne"]')).toBeVisible({ timeout: 20_000 });
      expect(hatalar).toEqual([]);
    });

    test('gün sonu: defter dört sekme, fiyat jeton resimleriyle, masa alınır ve yuvası seçilir', async ({ page }) => {
      test.setTimeout(120_000);
      const hatalar = hataTopla(page);
      await page.goto('./restoran/?test=1&sifirla=1&yas=kucuk&ekran=lokanta&deneme=1&jeton=9&acilan=saksi,avize,resim,akvaryum');
      await menuSec(page);
      await page.evaluate(() => (window as unknown as { __rsGun: Gun }).__rsGun.gunuBitir());
      await expect(page.locator('.rs-defter')).toBeVisible({ timeout: 20_000 });
      await expect(page.locator('.rs-df-sekme')).toHaveCount(4);
      await page.locator('.rs-df-sekme[data-sekme="masa"]').click();
      const kart = page.locator('.rs-df-kart[data-kalem="masa-3"]');
      await expect(kart.locator('.rs-df-jeton')).toHaveCount(5);
      await page.waitForTimeout(400);
      expect(await buyutulen(page)).toEqual([]);
      await page.screenshot({ path: `tests/screens/restoran-p4-${boy.ad}-defter.png` });
      await kart.click();
      await expect(page.locator('.rs-yuva[data-tur="masa"]')).toHaveCount(2, { timeout: 20_000 });
      await page.screenshot({ path: `tests/screens/restoran-p4-${boy.ad}-yuva.png` });
      await page.locator('.rs-yuva[data-yuva="3"]').click();
      await expect(page.locator('.rs-masa[data-yuva="3"]')).toBeVisible();
      await expect(page.locator('.rs-df-yarin')).toBeVisible({ timeout: 20_000 });
      const k = await kayit(page);
      expect(k.jeton).toBe(4);
      expect(k.yerlesim.masa['3']).toBe('masa-3');
      // ertesi gün: üç masa, süsler yerinde
      await page.locator('.rs-df-yarin').click();
      await menuSec(page);
      expect((await gunK(page))!.masaYuvalari).toEqual(['0', '1', '3']);
      await expect(page.locator('.rs-sus')).toHaveCount(4);
      await page.waitForTimeout(400);
      expect(await buyutulen(page)).toEqual([]);
      await page.screenshot({ path: `tests/screens/restoran-p4-${boy.ad}-salon.png` });
      expect(hatalar).toEqual([]);
    });
  });
}

test.describe('Lokanta büyüme: 5 gün', () => {
  test.use({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  test.beforeEach(({}, info) => test.skip(info.project.name !== 'iphone'));

  test('5 gün art arda: her gün bir alım; masa müşteri sayısını artırır; alınan tarif menüye ve isteklere girer; bahçe', async ({ page }) => {
    test.setTimeout(240_000);
    const hatalar = hataTopla(page);
    await page.goto('./restoran/?test=1&sifirla=1&yas=kucuk&ekran=lokanta&deneme=1&jeton=40');
    // Gün 1: ayran (tarif, içecek tezgâhıyla)
    await menuSec(page);
    expect((await plan(page)).musteriler.length).toBe(4);
    await defterdenAl(page, 'tarif', 'ayran');
    expect((await kayit(page)).yeniTarif).toBe('ayran');
    await page.locator('.rs-df-yarin').click();
    // Gün 2: menüde seçim var (3 tarif, 2 yuva); yeni tarif hazır yuvada; ilk müşteri ayran ister; Babaanne tadar
    await expect(page.locator('.rs-menu-tahtasi[data-secim="1"]')).toBeVisible({ timeout: 20_000 });
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'tests/screens/restoran-p4-844x390-menu.png' });
    await menuSec(page, ['salata']);
    expect((await gunK(page))!.menu).toContain('ayran');
    expect((await plan(page)).musteriler[0].istek).toEqual({ tur: 'resimli', tarif: 'ayran' });
    await expect(page.locator('.rs-ist[data-istasyon="icecek"]')).toBeVisible();
    const once = (await plan(page)).musteriler.length;
    await defterdenAl(page, 'masa');
    await page.locator('.rs-df-yarin').click();
    // Gün 3: üç masa → müşteri sayısı arttı
    await menuSec(page);
    expect((await gunK(page))!.masaYuvalari.length).toBe(3);
    expect((await plan(page)).musteriler.length).toBeGreaterThan(once);
    await defterdenAl(page, 'sus');
    await page.locator('.rs-df-yarin').click();
    // Gün 4: bahçe
    await menuSec(page);
    await defterdenAl(page, 'bolum', 'bahce');
    await page.locator('.rs-df-yarin').click();
    // Gün 5: bahçe masaları ve kayma
    await menuSec(page);
    expect((await gunK(page))!.masaYuvalari).toEqual(expect.arrayContaining(['4', '5']));
    await page.locator('.rs-bahce-gec').click();
    await expect.poll(async () => (await gunK(page))?.bahcede).toBe(true);
    await page.waitForTimeout(300);
    expect(await buyutulen(page)).toEqual([]);
    await page.screenshot({ path: 'tests/screens/restoran-p4-844x390-bahce.png' });
    await page.locator('.rs-bahce-gec').click();
    await defterdenAl(page, 'sus');
    const k = await kayit(page);
    expect(k.gun).toBe(5);
    expect(k.acilan.tarif).toContain('ayran');
    expect(k.acilan.bolum).toEqual(['bahce']);
    expect(Object.keys(k.yerlesim.masa).length).toBe(5);
    expect(hatalar).toEqual([]);
  });
});
