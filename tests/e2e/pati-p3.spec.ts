import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

/**
 * Pati Dükkânı v2 · paket 3 (ekip/senaryo/PATI-V2.md §9, §4f, §4g, §12): ziyaretçiler, mağaza, köşeler, süsleme, parti.
 * Yalnız /pati/ (menüde yok: PATI_MENUDE false). Telefon önce: 844×390 (yatay) ve 390×844 (dikey), DPR 3.
 *  (1) ziyaretçi: uygun ve uymayan hayvan; ikisi de bir sahne ve jeton verir (3-4: 3 / 1); hayvan dokunarak da
 *      sürüklenerek de verilir; 3-4'te resimli balon, 5-6'da yok
 *  (2) Kino'nun ikramları (sürükle, dokun + dokun), Anne'nin listesi (yanlış komik, doğru buldun), Baba çayla uyanır,
 *      Dede'nin kasketi, Babaanne'nin tepsisi, Mino'nun partisi (3 müzik, her hayvan başka tepki), dükkân fotoğrafı,
 *      gece misafiri Diken
 *  (3) mağaza: köşe al → perde açılır → hediye eşya → vitrine o köşenin yavrusu → alınca köşesine gider
 *  (4) çekmece sahipliğe göre: alınmamış eşya fiyat etiketli; dokununca jetonla alınır, hemen denenir
 *  (5) süs: katalogdan alınır, mıknatıslı noktaya konur; Uzman hediyesi süs
 *  hepsinde: konsol hatası yok, hiçbir görsel kaynak pikselinin üstüne büyümüyor (DPR 3), hiçbir şey kilitlenmiyor
 */
test.beforeEach(({}, info) => test.skip(info.project.name !== 'iphone', 'yalnız telefon projesinde (boyutları test kendisi verir)'));

const hayvan = (id: string, ad: string, yer: number, kose = 'salon', kalp = 0) => ({ id, ad, kose, yer, minder: kose === 'salon' ? 'mavi' : null, kalp, dans: 0, sonDans: 0, ihtiyac: null });
const UC = () => [hayvan('tarcin', 'Tarçın', 0), hayvan('findik', 'Fındık', 1), hayvan('pofuduk', 'Pofuduk', 2)];
const kayit = (yas: 'kucuk' | 'buyuk', hayvanlar: unknown[], jeton = 2, ek: Record<string, unknown> = {}) => ({ yas, acildi: true, jeton, hayvanlar, esyalar: [], susler: [], koseler: ['salon'], defter: {}, ziyaretler: { kino: 1 }, pano: [], uzman: [], ...ek });

type Ziyaret = { aktif: string | null; bekleyis: string | null; kisiler: string[]; gunluk: string[]; tepsi: string[]; balon: boolean };
const P = <T>(page: Page, f: string, ...a: unknown[]) => page.evaluate(([k, a2]) => (window as unknown as { __pati: Record<string, (...x: unknown[]) => unknown> }).__pati[k as string](...(a2 as unknown[])), [f, a] as const) as Promise<T>;
const zy = (page: Page) => P<Ziyaret>(page, 'ziyaret');

async function ac(page: Page, k: unknown, ek = '') {
  await page.addInitScript((v) => {
    if (!sessionStorage.getItem('pati-k')) {
      localStorage.setItem('minkino-pati-v2', v);
      sessionStorage.setItem('pati-k', '1');
    }
  }, JSON.stringify(k));
  // ziyaretçiler testte kendiliğinden gelmez (&ziyaret çok uzun); test getirir
  await page.goto(`/pati/?test=1&yas=${(k as { yas: string }).yas}&ziyaret=999999999${ek}`);
  await expect.poll(() => P<string>(page, 'panel'), { timeout: 15000 }).toBe('salon');
}
/** Ziyaretçiyi getirir, hayvan beklenene kadar */
async function getir(page: Page, id: string, beklenen = 'hayvan') {
  await P(page, 'ziyaretGetir', id);
  await expect.poll(async () => (await zy(page)).bekleyis, { timeout: 15000 }).toBe(beklenen);
}
/** Ziyaret bitene kadar */
const bitsin = (page: Page) => expect.poll(async () => (await zy(page)).aktif, { timeout: 20000 }).toBeNull();

/** Ekrandaki her raster görselin etkin ölçeği (görünen px × 3 / doğal px); kit canvas'ı kendi pikselinde çizilir */
const enBuyukOlcek = (page: Page) =>
  page.evaluate(() => {
    let en = 0;
    let kim = '';
    for (const i of document.querySelectorAll<HTMLImageElement>('.pt-kok img')) {
      const r = i.getBoundingClientRect();
      if (!i.naturalWidth || r.width < 2 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
      const k = Math.min(r.width / i.naturalWidth, r.height / i.naturalHeight) * 3;
      if (k > en) {
        en = k;
        kim = i.src.split('/').pop()!;
      }
    }
    for (const c of document.querySelectorAll<HTMLCanvasElement>('.pt-ziyaret canvas')) {
      const r = c.getBoundingClientRect();
      if (!c.width || r.width < 2) continue;
      // canvas pikseli ekrandaki boy × 3'ten az olabilir (kitin kendi pikseli sınır): büyütme oranı
      const k = (r.width * Math.min(3, devicePixelRatio)) / c.width;
      if (k > en) {
        en = k;
        kim = 'canvas';
      }
    }
    return { en, kim };
  });
const dokun = async (page: Page, sec: string) => {
  const r = (await page.locator(sec).first().boundingBox())!;
  await page.mouse.click(r.x + r.width / 2, r.y + r.height * 0.55);
};

for (const ekran of [
  { ad: 'yatay', w: 844, h: 390 },
  { ad: 'dikey', w: 390, h: 844 },
]) {
  test.describe(`Pati v2 paket 3 ${ekran.ad} ${ekran.w}x${ekran.h}`, () => {
    test.use({ viewport: { width: ekran.w, height: ekran.h }, deviceScaleFactor: 3 });

    test('ziyaretçi: uygun ve uymayan hayvan, ikisi de sahne ve jeton; 3-4 balon; sürükleyerek de', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, kayit('kucuk', UC(), 2));
      // Z2 Anne + Lokum: "yumuşacık biri" → tavşan uygun (3 jeton)
      await getir(page, 'lokum');
      let z = await zy(page);
      expect(z.kisiler).toEqual(['anne', 'lokum']);
      expect(z.balon).toBe(true);
      await page.screenshot({ path: `tests/screens/pati3-${ekran.ad}-ziyaret-lokum.png` });
      expect((await enBuyukOlcek(page)).en).toBeLessThanOrEqual(1.02);
      await dokun(page, '.pt-yer[data-yer="2"]');
      await bitsin(page);
      expect(await P<number>(page, 'jeton')).toBe(5);
      // Fındık: Lokum onu Kino sanır ("Abi! Abi!", hazır Seri 2 kaydı), Anne güler: uymayan, 1 jeton
      await getir(page, 'lokum');
      await dokun(page, '.pt-yer[data-yer="1"]');
      await expect.poll(async () => (await zy(page)).gunluk.join(' '), { timeout: 15000 }).toContain('lokum:hazir:s1-lok1');
      z = await zy(page);
      expect(z.gunluk).toContain('sahne:abi');
      expect(z.gunluk).toContain('uygun:0');
      expect(z.gunluk).toContain('anne:gul');
      await bitsin(page);
      expect(await P<number>(page, 'jeton')).toBe(6);
      // Z8 Can: hayvanı parmakla oyuğundan ziyaretçiye sürükle (köpek: top oynayan biri)
      await getir(page, 'can');
      const a = (await page.locator('.pt-yer[data-yer="1"]').boundingBox())!;
      const b = (await page.locator('.pt-ziyaretci[data-kim="can"]').boundingBox())!;
      await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
      await page.mouse.down();
      for (let i = 1; i <= 14; i++) await page.mouse.move(a.x + a.width / 2 + ((b.x + b.width / 2 - a.x - a.width / 2) * i) / 14, a.y + a.height / 2 + ((b.y + b.height / 2 - a.y - a.height / 2) * i) / 14);
      await page.mouse.up();
      await expect.poll(async () => (await zy(page)).gunluk.join(' '), { timeout: 15000 }).toContain('sahne:top');
      await bitsin(page);
      expect(await P<number>(page, 'jeton')).toBe(9);
      // ziyaretçi hiç beklenmeden gitmez; ziyaret bitince Bakım Odası yine açılır (kilit yok)
      await dokun(page, '.pt-yer[data-yer="0"]');
      await expect.poll(async () => ((await P<{ acik: boolean }>(page, 'oda')) as { acik: boolean }).acik).toBe(true);
      expect(hatalar).toEqual([]);
    });

    test("Kino'nun ikramları, Anne'nin listesi, Baba çayla, Dede'nin kasketi, Babaanne'nin tepsisi", async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, kayit('kucuk', UC(), 0, { ziyaretler: {} }));
      // Z1 Kino: üç ikram; sürükleyerek ve "dokun + dokun"
      await getir(page, 'kino', 'ikram');
      expect((await zy(page)).tepsi.sort()).toEqual(['balik-yemi', 'havuc', 'kemik-biskuvi']);
      await page.screenshot({ path: `tests/screens/pati3-${ekran.ad}-kino-ikram.png` });
      const ik = (await page.locator('[data-ikram="kemik-biskuvi"]').boundingBox())!;
      const fn = (await page.locator('.pt-yer[data-yer="1"]').boundingBox())!;
      await page.mouse.move(ik.x + ik.width / 2, ik.y + ik.height / 2);
      await page.mouse.down();
      for (let i = 1; i <= 12; i++) await page.mouse.move(ik.x + ik.width / 2 + ((fn.x + fn.width / 2 - ik.x - ik.width / 2) * i) / 12, ik.y + ik.height / 2 + ((fn.y + fn.height * 0.6 - ik.y - ik.height / 2) * i) / 12);
      await page.mouse.up();
      await expect.poll(async () => (await zy(page)).gunluk.join(' ')).toContain('ikram:kemik-biskuvi:findik:sever');
      await expect.poll(async () => (await zy(page)).bekleyis).toBe('ikram');
      await page.locator('[data-ikram="balik-yemi"]').click();
      await dokun(page, '.pt-yer[data-yer="0"]');
      await expect.poll(async () => (await zy(page)).gunluk.join(' ')).toContain('ikram:balik-yemi:tarcin:sevmez');
      await expect.poll(async () => (await zy(page)).gunluk).toContain('kino:hazir:s2-kino1');
      await expect.poll(async () => (await zy(page)).bekleyis).toBe('ikram');
      await page.locator('[data-ikram="havuc"]').click();
      await dokun(page, '.pt-yer[data-yer="2"]');
      await bitsin(page);
      expect(await P<number>(page, 'jeton')).toBe(3);

      // Z3 Anne'nin listesi: 6 seçenek; yanlış (sprey: ıslanır) komik, doğru: buldun + jeton
      await getir(page, 'liste', 'esya');
      let z = await zy(page);
      expect(z.tepsi).toHaveLength(6);
      expect(z.balon).toBe(true);
      await page.locator('.pt-zy-tepsi > [data-esya="su-spreyi"]').click();
      await expect.poll(async () => (await zy(page)).gunluk.join(' ')).toContain('liste:su-spreyi:islandim');
      await expect.poll(async () => (await zy(page)).bekleyis).toBe('esya');
      await page.locator('.pt-zy-tepsi > [data-esya="top"]').click();
      await bitsin(page);
      expect(await P<number>(page, 'jeton')).toBe(6);

      // Z5 Babaanne: tepsiden iki şey verilince gider, çay rafta kalır
      await getir(page, 'babaanne', 'ikram');
      expect((await zy(page)).tepsi.sort()).toEqual(['bezelye', 'elma', 'havuc']);
      await page.locator('[data-ikram="havuc"]').click();
      await dokun(page, '.pt-yer[data-yer="2"]');
      await expect.poll(async () => (await zy(page)).bekleyis).toBe('ikram');
      await page.locator('[data-ikram="elma"]').click();
      await dokun(page, '.pt-yer[data-yer="0"]');
      await bitsin(page);
      expect(await P<number>(page, 'jeton')).toBe(9);

      // Z4 Baba uyuyakaldı: Babaanne'nin çayı rafta → çay ile uyanır, bisküvi hediye
      await getir(page, 'baba');
      expect((await zy(page)).tepsi).toEqual(['cay']);
      await page.locator('[data-ikram="cay"]').click();
      await bitsin(page);
      expect(await P<string[]>(page, 'esyalar')).toContain('kemik-biskuvi');
      expect(await P<number>(page, 'jeton')).toBe(12);

      // Z6 Dede: köpek kasketi kapar (uymayan, komik); giderken Bahçe fikri → mağazada bahçe
      await getir(page, 'dede');
      await dokun(page, '.pt-yer[data-yer="1"]');
      await expect.poll(async () => (await zy(page)).gunluk.join(' ')).toContain('sahne:kasket');
      await expect.poll(async () => (await zy(page)).gunluk).toContain('dede:bak');
      await bitsin(page);
      expect((await zy(page)).gunluk).toContain('dede:bahce');
      expect(await P<string[]>(page, 'paneller')).toContain('kose-bahce');
      expect(hatalar).toEqual([]);
    });

    test("Mino'nun partisi (3 müzik), dükkân fotoğrafı, gece misafiri Diken", async ({ page }) => {
      const hatalar = hataTopla(page);
      const hepsi = [...UC(), hayvan('fistik', 'Fıstık', 0, 'kemirgen'), hayvan('piril', 'Pırıl', 0, 'akvaryum')];
      await ac(page, kayit('kucuk', hepsi, 0, { koseler: ['salon', 'kemirgen', 'akvaryum', 'bahce'], susler: [{ ad: 'muzik-kutusu', nokta: 'o1-yer' }] }));
      // müzik kutusuna dokununca Mino gelir
      await page.locator('.pt-sus[data-sus="muzik-kutusu"]').click();
      await expect.poll(async () => (await zy(page)).bekleyis, { timeout: 15000 }).toBe('muzik');
      expect((await zy(page)).tepsi).toEqual(['hizli', 'yavas', 'komik']);
      await page.screenshot({ path: `tests/screens/pati3-${ekran.ad}-parti.png` });
      for (const m of ['hizli', 'yavas', 'komik']) {
        await page.locator(`.pt-parti-dugme[data-muzik="${m}"]`).click();
        await page.waitForTimeout(400);
      }
      await bitsin(page);
      const g = (await zy(page)).gunluk.filter((x) => x.startsWith('parti:'));
      expect(g).toHaveLength(3);
      // Fındık hızlıda deli gibi, kedi komikte önce esner
      expect(g[0]).toContain('findik=deli');
      expect(g[2]).toContain('tarcin=esne');
      // ilk dansında her hayvan bir jeton bıraktı (salonda 3)
      await expect.poll(() => P<number>(page, 'jeton')).toBe(3);

      // Z9 dükkân fotoğrafı: bütün aile; en çok 4 hayvan
      await getir(page, 'foto', 'foto');
      expect((await zy(page)).kisiler).toEqual(['kino', 'anne', 'lokum', 'baba', 'babaanne', 'dede']);
      await dokun(page, '.pt-yer[data-yer="0"]');
      await page.screenshot({ path: `tests/screens/pati3-${ekran.ad}-foto.png` });
      expect((await enBuyukOlcek(page)).en).toBeLessThanOrEqual(1.02);
      await bitsin(page);
      expect((await zy(page)).gunluk.filter((x) => x.startsWith('foto:'))).toEqual(['foto:tarcin']);
      expect(await P<string[]>(page, 'pano')).toContain('tarcin:sevinc');

      // Z10 gece misafiri: Bahçe açık; tabağa kedi maması (sever) → sabah hediye süs
      await P(page, 'geceMisafiri');
      await expect.poll(async () => (await zy(page)).bekleyis, { timeout: 15000 }).toBe('tabak');
      await page.locator('[data-tabak="kedi-mamasi"]').click();
      await expect.poll(async () => (await zy(page)).aktif, { timeout: 15000 }).toBeNull();
      expect((await zy(page)).gunluk).toContain('diken:kedi-mamasi:sever');
      expect(hatalar).toEqual([]);
    });

    test('mağaza: köşe al → perde açılır → hediye eşya → yavru vitrinde → köşesine; çekmecede fiyatlı eşya; süs', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, kayit('kucuk', UC(), 14));
      // kapalı köşenin perdesi kataloğu o köşenin sayfasında açar
      await page.locator('.pt-kenar[data-yon="1"]').click();
      await expect.poll(() => P(page, 'panel')).toBe('kose-kemirgen');
      await page.locator('.pt-perde[data-kose="kemirgen"]').click();
      await expect.poll(async () => (await P<{ acik: boolean; sekme: string }>(page, 'magaza')).sekme).toBe('sus');
      await page.screenshot({ path: `tests/screens/pati3-${ekran.ad}-katalog.png` });
      await page.locator('[data-kalem="kose-kemirgen"]').click();
      await expect.poll(async () => Object.keys(await P<Record<string, unknown>>(page, 'koseler')), { timeout: 15000 }).toEqual(['kemirgen']);
      expect(await P<number>(page, 'jeton')).toBe(10);
      // hediye: köşenin hayvanının sevdiği eşya
      await expect.poll(() => P<string[]>(page, 'esyalar')).toContain('aycekirdegi');
      expect(await P<string>(page, 'panel')).toBe('kose-kemirgen');
      // boş yuvada gölge: dokununca vitrin, yavru kendini gösterir
      await page.locator('.pt-kose-golge2').first().click();
      await expect.poll(() => P(page, 'panel')).toBe('vitrin');
      const v = await P<(string | null)[]>(page, 'vitrin');
      const i = v.indexOf('fistik');
      expect(i).toBeGreaterThanOrEqual(0);
      // gölgeye dokununca yavru kendini gösterdi (tanıştı); bir daha dokununca sepete hoplar, alınır
      await expect(page.locator(`[data-bolme="${i}"][data-tanisti="1"]`)).toHaveCount(1, { timeout: 10000 });
      await page.waitForTimeout(300);
      await page.locator(`[data-bolme="${i}"]`).click();
      await expect.poll(async () => (await P<Record<string, ({ id: string } | null)[]>>(page, 'koseler')).kemirgen.some((x) => x?.id === 'fistik'), { timeout: 15000 }).toBe(true);
      expect(await P<string>(page, 'panel')).toBe('kose-kemirgen');
      expect(await P<number>(page, 'jeton')).toBe(8);
      // köşedeki hayvana dokununca Bakım Odası
      await dokun(page, '.pt-kose-alan[data-kose-yer="0"]');
      await expect.poll(async () => (await P<{ acik: boolean; hayvan: string }>(page, 'oda')).hayvan).toBe('fistik');
      await page.locator('.pt-ust button[aria-label="Geri"]').click();

      // çekmece sahipliğe göre: Fındık'ın mama çekmecesinde kemik bisküvi fiyat etiketli; dokununca alınır
      await page.locator('.pt-kenar[data-yon="-1"]').click();
      await expect.poll(() => P(page, 'panel')).toBe('salon');
      await dokun(page, '.pt-yer[data-yer="1"]');
      await page.locator('.pt-cekmece[data-cekmece="mama"]').click();
      await expect(page.locator('.pt-tepsi2.acik .pt-esya:not(.pt-satilik)')).toHaveCount(3);
      await expect(page.locator('.pt-tepsi2.acik .pt-satilik[data-esya="kemik-biskuvi"]')).toHaveCount(1);
      await page.screenshot({ path: `tests/screens/pati3-${ekran.ad}-cekmece-satilik.png` });
      await page.locator('.pt-satilik[data-esya="kemik-biskuvi"]').click();
      await expect(page.locator('.pt-tepsi2.acik .pt-esya[data-esya="kemik-biskuvi"]:not(.pt-satilik)')).toHaveCount(1, { timeout: 15000 });
      expect(await P<number>(page, 'jeton')).toBe(7);
      await page.locator('.pt-ust button[aria-label="Geri"]').click();

      // süs: katalogdan saksı → tepsi → mıknatıslı noktaya sürükle
      await page.locator('.pt-katalog-dugme').click();
      await page.locator('.pt-mg-sekme[data-sekme="sus"]').click();
      await page.locator('[data-kalem="saksi"]').click();
      await expect(page.locator('.pt-sus-tepsi.acik [data-sus="saksi"]')).toHaveCount(1, { timeout: 15000 });
      expect(await P<number>(page, 'jeton')).toBe(6);
      const s = (await page.locator('.pt-sus-tepsi [data-sus="saksi"]').boundingBox())!;
      await page.mouse.move(s.x + s.width / 2, s.y + s.height / 2);
      await page.mouse.down();
      await page.mouse.move(s.x + s.width / 2 + 10, s.y + s.height / 2 - 10);
      const nokta = (await page.locator('.pt-sus-nokta').first().boundingBox())!;
      for (let k = 1; k <= 10; k++) await page.mouse.move(s.x + s.width / 2 + ((nokta.x + nokta.width / 2 - s.x - s.width / 2) * k) / 10, s.y + s.height / 2 + ((nokta.y + nokta.height / 2 - s.y - s.height / 2) * k) / 10);
      await page.mouse.up();
      await expect.poll(async () => (await P<{ ad: string; nokta: string }[]>(page, 'susler')).find((x) => x.ad === 'saksi')?.nokta).toMatch(/^o\d-yer$/);
      await expect(page.locator('.pt-sus[data-sus="saksi"]')).toHaveCount(1);
      // Uzman hediyesi: süs tepsiye
      await P(page, 'susHediye');
      await expect.poll(async () => (await P<{ ad: string }[]>(page, 'susler')).length).toBe(2);
      await page.screenshot({ path: `tests/screens/pati3-${ekran.ad}-sus.png` });
      expect((await enBuyukOlcek(page)).en).toBeLessThanOrEqual(1.02);
      expect(hatalar).toEqual([]);
    });

    test('3-4 / 5-6 farkları: balon, rakam, yetmeyen kalem silik değil (eksikler boş daire)', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, kayit('buyuk', UC(), 3));
      // 5-6: ziyaretçinin balonu yok, yalnız söz
      await getir(page, 'can');
      expect((await zy(page)).balon).toBe(false);
      await dokun(page, '.pt-yer[data-yer="0"]');
      await bitsin(page);
      // uymayan 5-6: 2 jeton
      expect(await P<number>(page, 'jeton')).toBe(5);
      await expect(page.locator('.pt-kumbara-rakam')).toHaveText('5');
      // yetmeyen köşe: dokununca boş daireler, jeton kaybolmaz, köşe açılmaz
      await page.locator('.pt-katalog-dugme').click();
      await page.locator('.pt-mg-sekme[data-sekme="sus"]').click();
      await page.locator('[data-kalem="kose-kus"]').click();
      await expect.poll(async () => (await page.locator('[data-kalem="kose-kus"]').getAttribute('data-odeme')) === null, { timeout: 15000 }).toBe(true);
      expect(await P<number>(page, 'jeton')).toBe(5);
      expect(Object.keys(await P<Record<string, unknown>>(page, 'koseler'))).toEqual([]);
      expect(hatalar).toEqual([]);
    });
  });
}
