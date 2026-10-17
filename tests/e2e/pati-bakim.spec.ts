import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

/**
 * Pati Dükkânı v2 · paket 2 (ekip/senaryo/PATI-V2.md §4e, §8d, §12): Bakım Odası, ihtiyaç saati ve yardım merdiveni,
 * Hayvan Defteri, dükkânın bölümleri, akşam ve günün fotoğrafı. Yalnız /pati/ (menüde yok).
 * Telefon önce: 844×390 (yatay) ve 390×844 (dikey), DPR 3.
 *  (1) salonda hayvana dokun → Bakım Odası; ✗ komik (cezasız), ★ ihtiyacı kapatır: kalp, jeton, altın kalp, defter;
 *      üç kalp → dans → jeton; dükkâna dönünce salonun kalpleri aynı
 *  (2) eşya hayvana sürüklenir (kâse) ve fırça hayvanın üstünde sürtülür
 *  (3) hiç dokunmadan: hiçbir şey kötüleşmez; merdiven 25 sn balon (3-4) / 40 sn yalnız doğru çekmecenin kulpu
 *  (4) 5-6: 6 çekmece, çekmecede 4-6 eşya, balon yok
 *  (5) defter resimli dolar; kaydırma: perdeli köşe; akşam: herkes kendi yatağıyla uyur, gece, polaroid panoda
 *  hepsinde: konsol hatası yok, hiçbir görsel kaynak pikselinin üstüne büyümüyor (DPR 3)
 */
test.beforeEach(({}, info) => test.skip(info.project.name !== 'iphone', 'yalnız telefon projesinde (boyutları test kendisi verir)'));

const hayvan = (id: string, ad: string, yer: number, ihtiyac: string | null, kalp = 0) => ({ id, ad, kose: 'salon', yer, minder: 'mavi', kalp, dans: 0, sonDans: 0, ihtiyac });
const kayit = (yas: 'kucuk' | 'buyuk', hayvanlar: unknown[], jeton = 2) => ({ yas, acildi: true, jeton, hayvanlar, esyalar: [], susler: [], koseler: ['salon'], defter: {}, ziyaretler: {}, pano: [], uzman: [] });

type Oda = { acik: boolean; hayvan: string | null; ihtiyac: string | null; kalp: number; cekmece: string | null; esyalar: string[]; cekmeceler: string[]; sonTepki: { esya: string; tepki: string; gag?: string } | null; mesgul: boolean; balon: boolean; cagri: string | null };
const P = <T>(page: Page, f: string) => page.evaluate((k) => (window as unknown as { __pati: Record<string, (...a: unknown[]) => unknown> }).__pati[k](), f) as Promise<T>;
const oda = (page: Page) => P<Oda>(page, 'oda');

async function ac(page: Page, k: unknown, ek = '') {
  await page.addInitScript((v) => {
    if (!sessionStorage.getItem('pati-k')) {
      localStorage.setItem('minkino-pati-v2', v);
      sessionStorage.setItem('pati-k', '1');
    }
  }, JSON.stringify(k));
  await page.goto(`/pati/?test=1&yas=${(k as { yas: string }).yas}${ek}`);
  await expect.poll(() => P<string>(page, 'panel'), { timeout: 15000 }).toBe('salon');
}

/** Ekrandaki her raster görselin etkin ölçeği (görünen px × 3 / doğal px); 1'in üstü = büyütülmüş */
const enBuyukOlcek = (page: Page) =>
  page.evaluate(() => {
    let en = 0;
    let kim = '';
    for (const i of document.querySelectorAll<HTMLImageElement>('.pt-kok img')) {
      const r = i.getBoundingClientRect();
      if (!i.naturalWidth || r.width < 2 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
      if (i.closest('[aria-hidden="true"], [data-panel-gizli]') && !i.closest('.ko-efekt')) continue;
      const fit = getComputedStyle(i).objectFit;
      const k = fit === 'contain' ? Math.min(r.width / i.naturalWidth, r.height / i.naturalHeight) : r.width / i.naturalWidth;
      if (k * 3 > en) {
        en = k * 3;
        kim = i.src.split('/').pop()!;
      }
    }
    for (const e of document.querySelectorAll<HTMLElement>('.pt-kesit, .pt-dekor-sahne')) {
      const r = e.getBoundingClientRect();
      if (!e.offsetWidth || r.width < 2 || e.closest('[aria-hidden="true"], [data-panel-gizli]')) continue;
      const k = (r.width / e.offsetWidth) * 3;
      if (k > en) {
        en = k;
        kim = e.className;
      }
    }
    return { en, kim };
  });

/** Bir öğeyi parmakla (fare) hedefe sürükler */
async function surukle(page: Page, kaynak: string, hedef: string, yolla?: (x: number, y: number) => Promise<void>) {
  const a = (await page.locator(kaynak).boundingBox())!;
  const b = (await page.locator(hedef).boundingBox())!;
  const [x0, y0] = [a.x + a.width / 2, a.y + a.height / 2];
  const [x1, y1] = [b.x + b.width / 2, b.y + b.height * 0.5];
  await page.mouse.move(x0, y0);
  await page.mouse.down();
  for (let i = 1; i <= 12; i++) await page.mouse.move(x0 + ((x1 - x0) * i) / 12, y0 + ((y1 - y0) * i) / 12);
  if (yolla) await yolla(x1, y1);
  await page.mouse.up();
}

for (const ekran of [
  { ad: 'yatay', w: 844, h: 390 },
  { ad: 'dikey', w: 390, h: 844 },
]) {
  test.describe(`Pati v2 Bakım Odası ${ekran.ad} ${ekran.w}x${ekran.h}`, () => {
    test.use({ viewport: { width: ekran.w, height: ekran.h }, deviceScaleFactor: 3 });

    test('hayvana dokun → oda; ✗ komik ve cezasız; ★ kalp, jeton, altın kalp; üç kalp → dans', async ({ page }) => {
      const hatalar = hataTopla(page);
      // bütün eşyalar alınmış (çekmecenin sahipliğe göre sırası pati-p3.spec.ts'te)
      await ac(page, kayit('kucuk', [hayvan('tarcin', 'Tarçın', 0, 'ac', 1), hayvan('findik', 'Fındık', 1, 'susuz')]), '&esyalar=hepsi');
      await page.locator('.pt-yer[data-yer="0"]').click();
      await expect.poll(async () => (await oda(page)).acik).toBe(true);
      let o = await oda(page);
      expect(o.hayvan).toBe('tarcin');
      // 3-4: 4 çekmece; temizlik çekmecesi mağazadan alınmış (esyalar=hepsi)
      expect(o.cekmeceler).toEqual(['mama', 'su', 'oyuncak', 'temizlik', 'yatak']);
      // öbür hayvan da bir şey istiyor: sol üstte yüzü (çağrı penceresi)
      expect(o.cagri).toBe('findik');
      await page.screenshot({ path: `tests/screens/pati2-${ekran.ad}-oda.png` });

      // hiçbir çekmece "doğru" diye işaretli değil: çekmeceye dokununca 3 eşya
      await page.locator('.pt-cekmece[data-cekmece="mama"]').click();
      await expect(page.locator('.pt-tepsi2.acik .pt-esya')).toHaveCount(3);
      o = await oda(page);
      expect([...o.esyalar].sort()).toEqual(['kedi-mamasi', 'kemik-biskuvi', 'konserve']);
      for (const b of await page.locator('.pt-esya').all()) {
        const r = (await b.boundingBox())!;
        expect(r.width).toBeGreaterThanOrEqual(88);
      }
      await expect(page.locator('.pt-esya .pt-altin-kalp')).toHaveCount(0);
      await page.screenshot({ path: `tests/screens/pati2-${ekran.ad}-cekmece.png` });
      expect((await enBuyukOlcek(page)).en).toBeLessThanOrEqual(1.02);

      // ✗: kemik bisküvi → komik tepki; kalp, jeton, ihtiyaç aynı
      await page.locator('.pt-esya[data-esya="kemik-biskuvi"]').click();
      await expect.poll(async () => (await oda(page)).sonTepki?.tepki).toBe('sevmez');
      await expect.poll(async () => (await oda(page)).mesgul, { timeout: 10000 }).toBe(false);
      o = await oda(page);
      expect(o.sonTepki?.gag).toBe('burun-cevir');
      expect(o.ihtiyac).toBe('ac');
      expect(o.kalp).toBe(1);
      expect(await P(page, 'jeton')).toBe(2);
      // eşya çekmecesine döndü
      await expect(page.locator('.pt-esya[data-esya="kemik-biskuvi"]:not(.pt-kullanimda)')).toHaveCount(1);

      // ★: kedi maması → ihtiyaç kapanır, kalp +1, jeton +1 (★) +1 (ilk ★), altın kalp, defter
      await page.locator('.pt-esya[data-esya="kedi-mamasi"]').click();
      await expect.poll(async () => (await oda(page)).ihtiyac, { timeout: 10000 }).toBeNull();
      await expect.poll(async () => (await oda(page)).kalp).toBe(2);
      expect(await P(page, 'jeton')).toBe(4);
      await expect(page.locator('.pt-esya[data-esya="kedi-mamasi"] .pt-altin-kalp')).toHaveCount(1);
      expect(await P(page, 'defter')).toEqual({ tarcin: { 'kemik-biskuvi': 'sevmez', 'kedi-mamasi': 'sever' } });
      await expect.poll(async () => (await oda(page)).mesgul, { timeout: 10000 }).toBe(false);

      // ihtiyacı yokken de denenir: ✓ konserve küçük sevinç, jeton yok
      await page.locator('.pt-esya[data-esya="konserve"]').click();
      await expect.poll(async () => (await oda(page)).sonTepki?.esya).toBe('konserve');
      await expect.poll(async () => (await oda(page)).mesgul, { timeout: 10000 }).toBe(false);
      expect(await P(page, 'jeton')).toBe(4);
      expect((await oda(page)).kalp).toBe(2);

      // üçüncü kalp (yeni ihtiyaç: susuz → ★ su kabı değil, kedi çeşmesi; ✓ su kabı da ihtiyacı kapatır) → dans → jeton
      await page.evaluate(() => (window as unknown as { __pati: { ihtiyacAc: (a: string, b: string) => void } }).__pati.ihtiyacAc('tarcin', 'susuz'));
      await page.locator('.pt-sekme[data-cekmece="su"]').click();
      await expect(page.locator('.pt-tepsi2.acik .pt-esya')).toHaveCount(3);
      await page.locator('.pt-esya[data-esya="su-kabi"]').click();
      await expect.poll(async () => (await oda(page)).ihtiyac, { timeout: 10000 }).toBeNull();
      // olur (1) + dans (2)
      await expect.poll(() => P(page, 'jeton'), { timeout: 15000 }).toBe(7);
      await expect.poll(async () => (await oda(page)).kalp).toBe(0);
      expect((await P<{ dans: number }[]>(page, 'hayvanlar'))[0].dans).toBe(1);

      // dükkâna dönüş: salonun kalpleri ve kumbara aynı
      await page.locator('.pt-ust .mk-dugme, .pt-ust button').first().click();
      await expect.poll(async () => (await oda(page)).acik).toBe(false);
      await expect.poll(() => P(page, 'kumbara'), { timeout: 10000 }).toBe(7);
      expect((await P<{ kalp: number }[]>(page, 'salon'))[0].kalp).toBe(0);
      expect(hatalar).toEqual([]);
    });

    test('eşya hayvana sürüklenir; fırça hayvanın üstünde sürtülür (5-6)', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, kayit('buyuk', [hayvan('findik', 'Fındık', 1, 'ac'), hayvan('tarcin', 'Tarçın', 0, 'kirli')]));
      await page.evaluate(() => (window as unknown as { __pati: { odaAc: (a: string) => void } }).__pati.odaAc('findik'));
      await expect.poll(async () => (await oda(page)).acik).toBe(true);
      expect((await oda(page)).cekmeceler).toEqual(['mama', 'su', 'oyuncak', 'temizlik', 'yatak', 'ecza']);
      await page.locator('.pt-cekmece[data-cekmece="mama"]').click();
      const n = await page.locator('.pt-tepsi2.acik .pt-esya').count();
      expect(n).toBeGreaterThanOrEqual(4);
      expect(n).toBeLessThanOrEqual(6);
      // köpek maması (✓): kâse hayvanın üstüne bırakılır
      await surukle(page, '.pt-esya[data-esya="kopek-mamasi"]', '.pt-oda-alan');
      await expect.poll(async () => (await oda(page)).ihtiyac, { timeout: 10000 }).toBeNull();
      expect((await oda(page)).sonTepki).toMatchObject({ esya: 'kopek-mamasi', tepki: 'olur' });
      await expect.poll(async () => (await oda(page)).mesgul, { timeout: 10000 }).toBe(false);

      // Tarçın kirli: yumuşak fırça hayvanın üstünde ileri geri (çağrı penceresinden geçilir)
      await expect.poll(async () => (await oda(page)).cagri).toBe('tarcin');
      await page.locator('.pt-cagri').click();
      await expect.poll(async () => (await oda(page)).hayvan).toBe('tarcin');
      await page.locator('.pt-cekmece[data-cekmece="temizlik"]').click();
      await surukle(page, '.pt-esya[data-esya="yumusak-firca"]', '.pt-oda-alan', async (x, y) => {
        for (let k = 0; k < 8; k++)
          for (let s = 0; s <= 6; s++) await page.mouse.move(x + (k % 2 ? 60 - s * 20 : -60 + s * 20), y);
      });
      await expect.poll(async () => (await oda(page)).ihtiyac, { timeout: 10000 }).toBeNull();
      expect((await oda(page)).sonTepki).toMatchObject({ esya: 'yumusak-firca', tepki: 'sever' });
      // su spreyi: kedi kutuya kaçar (komik), cezasız
      await expect.poll(async () => (await oda(page)).mesgul, { timeout: 10000 }).toBe(false);
      await page.locator('.pt-esya[data-esya="su-spreyi"]').click();
      await expect.poll(async () => (await oda(page)).sonTepki?.gag, { timeout: 10000 }).toBe('kutuya-kac');
      await page.screenshot({ path: `tests/screens/pati2-${ekran.ad}-sprey.png` });
      expect((await enBuyukOlcek(page)).en).toBeLessThanOrEqual(1.02);
      expect(hatalar).toEqual([]);
    });

    test('hiç dokunmadan hiçbir şey kötüleşmez; merdiven: 25 sn balon (3-4), 40 sn doğru çekmecenin kulpu', async ({ page }) => {
      const hatalar = hataTopla(page);
      // saat 20 kat hızlı: 2 dakika = 6 sn
      await ac(page, kayit('kucuk', [hayvan('tarcin', 'Tarçın', 0, null, 1), hayvan('findik', 'Fındık', 1, null)], 3), '&hiz=20');
      await page.evaluate(() => (window as unknown as { __pati: { ihtiyacAc: (a: string, b: string) => void } }).__pati.ihtiyacAc('findik', 'uykulu'));
      await expect(page.locator('.pt-salon-balon[data-hayvan="findik"]')).toHaveCount(0);
      // 25 sn: resim balonu (yastık: ihtiyacın genel resmi, eşya değil)
      await expect(page.locator('.pt-salon-balon[data-hayvan="findik"][data-cekmece="yatak"]')).toHaveCount(1, { timeout: 5000 });
      await page.screenshot({ path: `tests/screens/pati2-${ekran.ad}-balon.png` });
      await page.waitForTimeout(6000);
      const h = await P<{ id: string; ihtiyac: string | null; kalp: number }[]>(page, 'hayvanlar');
      expect(h.map((x) => [x.id, x.ihtiyac, x.kalp])).toEqual([['tarcin', null, 1], ['findik', 'uykulu', 0]]);
      expect(await P(page, 'jeton')).toBe(3);
      // odada: kulp yalnız yatak çekmecesinde kıpırdar; parlayan eşya yok
      await page.locator('.pt-yer[data-yer="1"]').click();
      await expect.poll(async () => Number(await page.locator('.pt-cekmece[data-cekmece="yatak"]').getAttribute('data-kipir')), { timeout: 5000 }).toBeGreaterThan(0);
      for (const c of ['mama', 'su', 'oyuncak']) expect(await page.locator(`.pt-cekmece[data-cekmece="${c}"]`).getAttribute('data-kipir')).toBeNull();
      expect((await oda(page)).balon).toBe(true);
      expect(hatalar).toEqual([]);
    });

    test('5-6: balon yok; ders: süt kediyi sonra hasta eder', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, kayit('buyuk', [hayvan('tarcin', 'Tarçın', 0, 'ac'), hayvan('findik', 'Fındık', 1, null)]), '&hiz=20&esyalar=hepsi');
      await page.waitForTimeout(2000);
      await expect(page.locator('.pt-salon-balon')).toHaveCount(0);
      await page.locator('.pt-yer[data-yer="0"]').click();
      await page.locator('.pt-cekmece[data-cekmece="mama"]').click();
      await page.locator('.pt-esya[data-esya="sut-kasesi"]').click();
      await expect.poll(async () => (await oda(page)).sonTepki?.tepki).toBe('ders');
      await expect.poll(async () => (await oda(page)).ihtiyac, { timeout: 10000 }).toBe('hasta');
      expect(hatalar).toEqual([]);
    });

    test('defter resimli dolar; perdeli köşe; akşam herkes kendi yatağıyla uyur, gece, polaroid panoda', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, kayit('kucuk', [hayvan('tarcin', 'Tarçın', 0, null), hayvan('findik', 'Fındık', 1, null)]), '&esyalar=hepsi&tam=1');
      // tam oyun (&tam=1): yayın kapsamında köşe perdesi yok (pati/src/yayin.ts)
      // kaydırma: sağ kenar → kapalı köşe (perde), sonra parmakla geri
      await page.locator('.pt-kenar[data-yon="1"]').click();
      await expect.poll(() => P(page, 'panel')).toBe('kose-kemirgen');
      await page.locator('.pt-perde[data-kose="kemirgen"]').click();
      await page.screenshot({ path: `tests/screens/pati2-${ekran.ad}-perde.png` });
      // paket 3: perde kataloğu o köşenin sayfasında açar; geri ile kapanır
      await expect.poll(async () => ((await P(page, 'magaza')) as { acik: boolean; sekme: string }).sekme).toBe('sus');
      await page.locator('.pt-ust button[aria-label="Geri"]').click();
      await expect.poll(async () => ((await P(page, 'magaza')) as { acik: boolean }).acik).toBe(false);
      const y = ekran.h * 0.85;
      await page.mouse.move(ekran.w * 0.2, y);
      await page.mouse.down();
      for (let i = 1; i <= 10; i++) await page.mouse.move(ekran.w * 0.2 + i * ekran.w * 0.06, y);
      await page.mouse.up();
      await expect.poll(() => P(page, 'panel')).toBe('salon');

      // akşam: ip çekilir → herkes uyusun; dokunulan hayvanın odası yatak çekmecesiyle açılır
      await page.evaluate(() => (window as unknown as { __pati: { ipCek: () => void } }).__pati.ipCek());
      await expect.poll(() => P(page, 'isik')).toBe('uyutma');
      await page.locator('.pt-yer[data-yer="0"]').click();
      await expect.poll(async () => (await oda(page)).cekmece).toBe('yatak');
      // ✗ kafes örtüsü: komik, uyumaz
      await page.locator('.pt-esya[data-esya="kafes-ortusu"]').click();
      await expect.poll(async () => (await oda(page)).sonTepki?.gag).toBe('ortu-alti');
      await expect.poll(async () => (await oda(page)).mesgul, { timeout: 10000 }).toBe(false);
      expect(await P<string[]>(page, 'uyuyan')).toEqual([]);
      // ★ karton kutu: uyur, salona dönülür
      await page.locator('.pt-esya[data-esya="karton-kutu"]').click();
      await expect.poll(() => P<string[]>(page, 'uyuyan'), { timeout: 10000 }).toEqual(['tarcin']);
      await expect.poll(async () => (await oda(page)).acik).toBe(false);
      await page.locator('.pt-yer[data-yer="1"]').click();
      await page.locator('.pt-esya[data-esya="minder"]').click();
      await expect.poll(() => P<string[]>(page, 'uyuyan'), { timeout: 10000 }).toEqual(['tarcin', 'findik']);

      // defter: iki satırda eşyalar ve işaretleri
      await page.locator('.pt-defter-dugme').click();
      // 3-4: aç, susuz, sıkılmış, uykulu + kirli (temizlik çekmecesi alınmış: esyalar=hepsi)
      await expect(page.locator('.pt-defter.acik .pt-defter-satir')).toHaveCount(5);
      await page.locator('.pt-defter-sekme[data-hayvan="tarcin"]').click();
      await expect(page.locator('.pt-defter-satir[data-ihtiyac="uykulu"] .pt-defter-esya')).toHaveCount(2);
      await expect(page.locator('.pt-defter-esya[data-esya="karton-kutu"][data-tepki="sever"] .pt-isaret')).toHaveCount(1);
      await page.screenshot({ path: `tests/screens/pati2-${ekran.ad}-defter.png` });
      await page.locator('.pt-defter-esya[data-esya="kafes-ortusu"]').click();
      await page.locator('.pt-defter').click({ position: { x: 4, y: ekran.h - 4 } });
      await expect(page.locator('.pt-defter.acik')).toHaveCount(0);

      // gece ve polaroid
      await page.evaluate(() => (window as unknown as { __pati: { ipCek: () => void } }).__pati.ipCek());
      await expect.poll(() => P(page, 'isik')).toBe('gece');
      await expect.poll(() => P<string[]>(page, 'pano'), { timeout: 10000 }).toHaveLength(1);
      // sabah kendiliğinden (ya da dokununca); hiçbir şey kilitlenmez
      await expect.poll(() => P(page, 'isik'), { timeout: 15000 }).toBe('gun');
      expect(hatalar).toEqual([]);
    });
  });
}
