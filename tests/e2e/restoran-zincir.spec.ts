/**
 * Tıkır Tıkır Lokanta · malzeme zinciri (restoran/src/mini/arayuz.ts: Hal, hazirlikStogu; ORTAK_NOTLAR 2026-10-17):
 * Yıka'nın "temiz"i ve Soy'un "soyuldu"su Doğra'da görünür (yıkanmış parlak, yıkanmamış küçük toprak lekesi, soyulmuş
 * kesitte kabuk halkası yok), tabağa ve müşteriye geçer: Babaanne yıkanmış salataya bayılır, yıkanmamış sebze komik
 * "Hmm, biraz toprak tadı var!" (ceza yok: yer, öder). Telefon iki yön, DPR 3. Ekran kareleri tests/screens/ (git'e girmez).
 */
import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

type Nokta = { x: number; y: number };
type Durum = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const agDisi = (h: string) => !h.includes('ERR_CONNECTION_RESET') && !h.includes('Failed to load resource');

const TELEFON = [
  { ad: 'yatay', viewport: { width: 844, height: 390 } },
  { ad: 'dikey', viewport: { width: 390, height: 844 } },
] as const;

const orta = async (page: Page, sec: string): Promise<Nokta> => {
  const r = (await page.locator(sec).first().boundingBox())!;
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
};
async function kaydir(page: Page, a: Nokta, b: Nokta, n = 8, bek = 12) {
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  for (let i = 1; i <= n; i++) {
    await page.mouse.move(a.x + ((b.x - a.x) * i) / n, a.y + ((b.y - a.y) * i) / n);
    if (bek) await page.waitForTimeout(bek);
  }
  await page.mouse.up();
  await page.waitForTimeout(60);
}
const gun = (page: Page) => page.evaluate(() => (window as unknown as { __rsGun?: { durum(): Durum } }).__rsGun?.durum());
const dogra = (page: Page) => page.evaluate(() => (window as unknown as { __rsDogra: { durum(): Durum } }).__rsDogra.durum());
const istasyonKapandi = (page: Page) => expect.poll(async () => (await gun(page))?.istasyon, { timeout: 10_000 });
/** müşteri masasında yemeğini bekliyor */
async function bekliyor(page: Page, ad: string) {
  try {
    await expect.poll(async () => ((await gun(page))?.masalar as Durum[] | undefined)?.some((m) => m.oturan === ad && m.durum === 'bekliyor'), { timeout: 60_000 }).toBe(true);
  } catch (e) {
    throw new Error(`${ad} beklemiyor: ${JSON.stringify(await gun(page))}`, { cause: e });
  }
}
/** günün jetonu: kasaya kayan + masalarda bekleyen */
const jeton = async (page: Page) => {
  const d = (await gun(page))!;
  return (d.gunJeton as number) + (d.masalar as Durum[]).reduce((t, m) => t + (m.jeton as number), 0);
};

/** Yıka: raftan leğene, daire çizerek ov, musluğun altında durula, süzgece */
async function yika(page: Page, m: string) {
  await page.locator(`.rs-yk-raf-oge[data-malzeme="${m}"]`).click();
  await page.waitForTimeout(350);
  const k = (await page.locator('.rs-yika').boundingBox())!;
  const d = await page.evaluate(() => (window as unknown as { __rsYika: { durum(): Durum } }).__rsYika.durum());
  const L = d.legen;
  await page.mouse.move(k.x + L.cx + 30, k.y + L.cy);
  await page.mouse.down();
  for (let i = 0; i < 260; i++) {
    const a = i * 0.25;
    await page.mouse.move(k.x + L.cx + Math.cos(a) * L.R * 0.25, k.y + L.cy + Math.sin(a) * L.R * 0.2);
    await page.waitForTimeout(6);
  }
  const M = d.musluk;
  const S = d.suzgec;
  const ux = k.x + M.x;
  const uy = k.y + (M.ust + M.alt) / 2 + 26;
  for (let i = 1; i <= 16; i++) {
    await page.mouse.move(k.x + L.cx + ((ux - k.x - L.cx) * i) / 16, k.y + L.cy + ((uy - k.y - L.cy) * i) / 16);
    await page.waitForTimeout(16);
  }
  for (let i = 0; i < 70; i++) {
    await page.mouse.move(ux + (i % 2) * 3, uy);
    await page.waitForTimeout(16);
  }
  for (let i = 1; i <= 12; i++) {
    await page.mouse.move(ux + ((k.x + S.cx - ux) * i) / 12, uy + ((k.y + S.cy - uy) * i) / 12);
    await page.waitForTimeout(16);
  }
  await page.mouse.up();
  await page.waitForTimeout(400);
}

/** Doğra: raftan tahtaya, bir kez dik kes */
async function al(page: Page, m: string) {
  await page.locator(`.rs-dg-raf-oge[data-malzeme="${m}"]`).click();
  await page.waitForTimeout(500);
}
/** bir kaydırma: yatay = havuç gibi dik duran sebze (kesim ekseni y); oran: kirpiğin neresinden */
async function kes(page: Page, m: string, oran = 0.5, yatay = false) {
  const r = (await page.locator(`.rs-p2-parca[data-malzeme="${m}"][data-gorunum="kirpik"]`).last().boundingBox())!;
  if (yatay) {
    const y = r.y + r.height * oran;
    await kaydir(page, { x: r.x - 30, y }, { x: r.x + r.width + 30, y }, 6, 0);
  } else {
    const x = r.x + r.width * oran;
    await kaydir(page, { x, y: r.y - 30 }, { x, y: r.y + r.height + 30 }, 6, 0);
  }
  await page.waitForTimeout(150);
}
const kesitSayisi = (page: Page, m: string) => page.locator(`.rs-p2-parca[data-malzeme="${m}"]:not([data-gorunum="kirpik"])`).count();

/** Servis penceresinde kâseyi tabağa döker, tabağı Kino'ya verir; müşterinin tepkisini bekler */
async function tabaklaVeServis(page: Page, musteri: string) {
  await page.locator('.rs-ist[data-istasyon="servis"]').click();
  await expect(page.locator('.rs-tabakla')).toBeVisible();
  await page.waitForTimeout(300);
  await page.locator('.rs-tb-urun').first().click();
  await page.waitForTimeout(400);
  await page.locator('.rs-tepsi-dugme').click();
  await istasyonKapandi(page).toBe(false);
  // tabağı müşterinin masasına sürükle
  const i = ((await gun(page))!.masalar as Durum[]).findIndex((m) => m.oturan === musteri);
  const t = (await page.locator('.rs-hazir').first().boundingBox())!;
  const m2 = (await page.locator(`.rs-masa[data-masa="${i}"]`).boundingBox())!;
  await kaydir(page, { x: t.x + t.width / 2, y: t.y + t.height / 2 }, { x: m2.x + m2.width / 2, y: m2.y + m2.height * 0.3 }, 12, 16);
  try {
    await expect.poll(async () => ((await gun(page))!.tepkiler as Durum[]).find((t) => t.musteri === musteri), { timeout: 30_000 }).toBeTruthy();
  } catch (e) {
    throw new Error(`${musteri} yemedi: ${JSON.stringify(await gun(page))}`, { cause: e });
  }
  return ((await gun(page))!.tepkiler as Durum[]).find((t) => t.musteri === musteri)!;
}

for (const boy of TELEFON) {
  test.describe(`Restoran malzeme zinciri telefon ${boy.ad}`, () => {
    test.use({ viewport: boy.viewport, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    test.beforeEach(({}, info) => test.skip(info.project.name !== 'iphone', 'telefon boyları ayrı veriliyor'));

    test('Doğra tepsideki Yıka / Soy ürünlerini görür: yıkanmış parlak, yıkanmamış toprak lekeli, soyulmuş kesit; artan sebze tepsiye döner', async ({ page }) => {
      const hatalar = hataTopla(page);
      await page.goto('./restoran/mini.html?test=1&oyun=dogra&yas=kucuk&malzemeler=patates,havuc,domates,salatalik&tepsi=yikanmis,soyulmus&yikama=1');
      await expect(page.locator('.rs-istasyon')).toBeVisible();
      await page.waitForTimeout(300);
      // yıkanmış domates (süzgeçten): parlak, toprak yok
      await al(page, 'domates');
      const dom = page.locator('.rs-p2-parca[data-malzeme="domates"]').first();
      await expect(dom).toHaveAttribute('data-temiz', '1');
      await expect(page.locator('.rs-p2-parca[data-malzeme="domates"] .rs-p2-parlak')).toHaveCount(1);
      await expect(page.locator('.rs-p2-parca[data-malzeme="domates"] .rs-p2-toprak')).toHaveCount(0);
      // yıkanmamış salatalık (lavabo açık): küçük toprak lekesi
      await al(page, 'salatalik');
      await expect(page.locator('.rs-p2-parca[data-malzeme="salatalik"]').first()).toHaveAttribute('data-toprak', '1');
      const leke = (await page.locator('.rs-p2-parca[data-malzeme="salatalik"] .rs-p2-toprak').boundingBox())!;
      const sal = (await page.locator('.rs-p2-parca[data-malzeme="salatalik"]').first().boundingBox())!;
      expect(leke.width).toBeGreaterThan(6);
      // küçük: sebzenin en çok üçte biri
      expect(leke.width * leke.height).toBeLessThan((sal.width * sal.height) / 3);
      await page.screenshot({ path: `tests/screens/restoran-zincir-${boy.ad}-dogra-temiz-toprak.png` });
      await kes(page, 'domates');
      await kes(page, 'salatalik');
      // tahta doldu (3-4: iki yuva): kâseye alınca yer açılır
      await page.locator('.rs-dg-kase').click();
      await page.waitForTimeout(500);
      // soyulmuş patates ve havuç (Soy'dan): bütün kısım açık tonlu, kesitin kenarı kabuk rengi değil
      await al(page, 'patates');
      await al(page, 'havuc');
      await expect(page.locator('.rs-p2-parca[data-malzeme="patates"]').first()).toHaveAttribute('data-soyuldu', '1');
      await expect(page.locator('.rs-p2-parca[data-malzeme="havuc"]').first()).toHaveAttribute('data-soyuldu', '1');
      // sert sebze: iki kaydırmada bir dilim; kenardan ince dilimler kesit olur
      for (let i = 0; i < 16 && (await kesitSayisi(page, 'patates')) < 2; i++) await kes(page, 'patates', 0.82);
      for (let i = 0; i < 16 && (await kesitSayisi(page, 'havuc')) < 2; i++) await kes(page, 'havuc', 0.85, true);
      const kesitler = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('.rs-p2-parca:is([data-malzeme="patates"],[data-malzeme="havuc"]):not([data-gorunum="kirpik"])')].map((e) => ({ m: e.dataset.malzeme, soyuldu: e.dataset.soyuldu, dis: e.style.getPropertyValue('--dis') })),
      );
      expect(kesitler.length).toBeGreaterThan(1);
      for (const k of kesitler) {
        expect(k.soyuldu).toBe('1');
        // kabuk renkleri (RENK dış): patates #A87444, havuç #E9772A — soyulmuşta yok
        expect(['#A87444', '#E9772A']).not.toContain(k.dis.trim().toUpperCase());
      }
      const d = await dogra(page);
      expect(d.tahta.find((t: Durum) => t.ad === 'patates')).toMatchObject({ soyuldu: true, temiz: true });
      await page.screenshot({ path: `tests/screens/restoran-zincir-${boy.ad}-dogra-soyulmus.png` });
      await page.locator('.rs-tepsi-dugme').click();
      await expect(page.locator('.rs-mini-sonuc')).toBeVisible({ timeout: 8000 });
      const u = await page.evaluate(() => (window as unknown as { __rsMiniSonuc: Durum[] }).__rsMiniSonuc.map((x) => ({ tur: x.tur, ozellik: x.ozellik, kullanilan: x.kullanilan })));
      const kase = u.find((x) => x.tur === 'dogranmis')!;
      expect(kase.ozellik.malzemeler.domates).toMatchObject({ temiz: true });
      expect(kase.ozellik.malzemeler.salatalik).toMatchObject({ temiz: false });
      expect(kase.ozellik.malzemeler.patates).toMatchObject({ temiz: true, soyuldu: true });
      expect(kase.ozellik.malzemeler.havuc).toMatchObject({ temiz: true, soyuldu: true });
      expect(kase.ozellik.temiz).toBe(false);
      expect(kase.kullanilan).toHaveLength(2);
      // süzgeçte bir yıkanmış domates artar, tepsiye geri döner (soyulmuşların ikisi de kullanıldı)
      const artan = u.filter((x) => x.tur !== 'dogranmis');
      expect(artan).toEqual([{ tur: 'yikanmis', ozellik: expect.objectContaining({ malzemeler: { domates: { adet: 1, temiz: true } } }), kullanilan: undefined }]);
      expect(hatalar.filter(agDisi)).toEqual([]);
    });

    test('lokantada uçtan uca: Yıka → Doğra → Tabakla → Babaanne bayılır (keşif: temiz); yıkanmamış salata → komik "toprak tadı", ceza yok', async ({ page }) => {
      test.setTimeout(300_000);
      const hatalar = hataTopla(page);
      // Gün 2: lavabo açık. Babaanne'nin ve Anne'nin isteği salataya uysun diye tohum aranır (resimli salata, ipuçlu,
      // sürpriz); tabak doğrudan müşterinin masasına sürüklenir
      let tohum = 1;
      for (; tohum < 60; tohum++) {
        await page.goto(`./restoran/?test=1&sifirla=1&yas=kucuk&gun=2&ekran=lokanta&musteriler=babaanne,anne&tohum=${tohum}`);
        await expect(page.locator('.rs-lokanta')).toBeVisible();
        await expect.poll(async () => (await page.evaluate(() => (window as unknown as { __rsGun?: { plan?: unknown } }).__rsGun?.plan)) !== undefined).toBe(true);
        const plan = await page.evaluate(() => (window as unknown as { __rsGun: { plan: { musteriler: { musteri: string; istek: Durum }[] } } }).__rsGun.plan.musteriler);
        const ist = plan.find((p) => p.musteri === 'babaanne')?.istek;
        const uyar = (i?: Durum) => !!i && (i.tur === 'surpriz' || (i.tur === 'resimli' && i.tarif === 'salata') || (i.tur === 'ipuclu' && ['serin', 'domatesli', 'sebzeli'].includes(i.ipucu)));
        if (plan[0].musteri === 'babaanne' && uyar(ist) && uyar(plan.find((p) => p.musteri === 'anne')?.istek)) break;
      }
      expect(tohum).toBeLessThan(60);
      await bekliyor(page, 'babaanne');
      // 1) lavabo: domates ve salatalık yıkanır
      await page.locator('.rs-ist[data-istasyon="lavabo"]').click();
      await expect(page.locator('.rs-yika')).toBeVisible();
      await page.waitForTimeout(400);
      await yika(page, 'domates');
      await yika(page, 'salatalik');
      const yk = await page.evaluate(() => (window as unknown as { __rsYika: { durum(): Durum } }).__rsYika.durum());
      expect(yk.sebzeler.every((s: Durum) => s.temiz && s.yer === 'suzgec'), JSON.stringify(yk.sebzeler)).toBe(true);
      await page.locator('.rs-tepsi-dugme').click();
      await istasyonKapandi(page).toBe(false);
      expect((await gun(page))!.tepsi).toEqual(['yikanmis']);
      // 2) tezgâh: yıkanmışlar parlak gelir, doğranır; süzgeç tepsiden kalkar
      await page.locator('.rs-ist[data-istasyon="tezgah"]').click();
      await expect(page.locator('.rs-dogra')).toBeVisible();
      await page.waitForTimeout(400);
      await al(page, 'domates');
      await al(page, 'salatalik');
      await expect(page.locator('.rs-p2-parca[data-temiz]')).toHaveCount(2);
      await expect(page.locator('.rs-p2-toprak')).toHaveCount(0);
      await page.screenshot({ path: `tests/screens/restoran-zincir-${boy.ad}-lokanta-yikanmis.png` });
      await kes(page, 'domates');
      await kes(page, 'salatalik');
      await page.locator('.rs-tepsi-dugme').click();
      await istasyonKapandi(page).toBe(false);
      expect((await gun(page))!.tepsi).toEqual(['dogranmis']);
      // 3) servis: tabak → Babaanne; yıkanmış salataya bayılır, panoya "temiz" keşfi
      const t1 = await tabaklaVeServis(page, 'babaanne');
      expect(t1).toMatchObject({ tepki: 'bayildi' });
      await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('minkino-restoran-v1') ?? '{}').pano?.babaanne), { timeout: 15_000 }).toEqual(['temiz']);
      // 4) Anne: yıkamadan doğranır → toprak lekesi; tabak → komik "toprak tadı" (ceza yok: jeton yine gelir)
      await bekliyor(page, 'anne');
      await page.locator('.rs-ist[data-istasyon="tezgah"]').click();
      await expect(page.locator('.rs-dogra')).toBeVisible();
      await page.waitForTimeout(400);
      await al(page, 'domates');
      await expect(page.locator('.rs-p2-parca[data-malzeme="domates"]').first()).toHaveAttribute('data-toprak', '1');
      await expect(page.locator('.rs-p2-toprak')).toHaveCount(1);
      await page.screenshot({ path: `tests/screens/restoran-zincir-${boy.ad}-lokanta-toprak.png` });
      await kes(page, 'domates');
      await al(page, 'salatalik');
      await kes(page, 'salatalik');
      await page.locator('.rs-tepsi-dugme').click();
      await istasyonKapandi(page).toBe(false);
      const once = await jeton(page);
      // konuşma balonları (test modunda kısa sürer): gözlemciyle toplanır
      await page.evaluate(() => {
        const w = window as unknown as { __sozler: string[] };
        w.__sozler = [];
        new MutationObserver((ls) => ls.forEach((l) => l.addedNodes.forEach((n) => n instanceof HTMLElement && n.matches('.rs-soz') && w.__sozler.push(n.textContent ?? '')))).observe(document.body, { childList: true, subtree: true });
      });
      const t2 = await tabaklaVeServis(page, 'anne');
      expect(t2).toMatchObject({ tepki: 'komik', neden: 'toprak' });
      await expect.poll(() => page.evaluate(() => (window as unknown as { __sozler: string[] }).__sozler), { timeout: 15_000 }).toContain('Hmm, biraz toprak tadı var!');
      await expect.poll(async () => (await jeton(page)) - once, { timeout: 20_000 }).toBeGreaterThanOrEqual(2);
      expect(hatalar.filter(agDisi)).toEqual([]);
    });
  });
}
