import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

/**
 * Pati Dükkânı · YAYIN KAPSAMI (pati/src/yayin.ts; 2026-10-18 yayını): ekranda hiçbir yer tutucu görünmez.
 * Yalnız çizimi tamamlanmış içerik: Tarçın, Fındık, Pofuduk; yalnız salon (köşe perdesi yok); çizili eşyalar ve süsler.
 * Telefon önce: 844×390 ve 390×844, DPR 3. Tam oyun (&tam=1) pati-p3.spec.ts'te.
 */
test.beforeEach(({}, info) => test.skip(info.project.name !== 'iphone', 'yalnız telefon projesinde (boyutları test kendisi verir)'));

const P = <T>(page: Page, f: string, ...a: unknown[]) => page.evaluate(([k, a2]) => (window as unknown as { __pati: Record<string, (...x: unknown[]) => unknown> }).__pati[k as string](...(a2 as unknown[])), [f, a] as const) as Promise<T>;

/** Ekranda görünen yer tutucular (sade şekil, piktogram, CSS köşe) ve eski Recraft / yanlış resimler */
const yerTutucular = (page: Page) =>
  page.evaluate(() => {
    const gorunur = (e: Element) => {
      const r = e.getBoundingClientRect();
      if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.right < 0 || r.top > innerHeight || r.left > innerWidth) return false;
      for (let x: Element | null = e; x && x !== document.body; x = x.parentElement) {
        const cs = getComputedStyle(x);
        if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.05) return false;
      }
      return true;
    };
    const yt = [...document.querySelectorAll<HTMLElement>('[class*="pt-yer-tutucu"]')].filter(gorunur).map((e) => e.className);
    const kotu = [...document.querySelectorAll<HTMLImageElement>('.pt-kok img')].filter(gorunur).map((i) => i.src).filter((s) => /hayvanlar\/ordek|kupler/.test(s));
    return [...yt, ...kotu];
  });

const hayvan = (id: string, ad: string, yer: number) => ({ id, ad, kose: 'salon', yer, minder: 'mavi', kalp: 0, dans: 0, sonDans: 0, ihtiyac: null });
const UC = () => [hayvan('tarcin', 'Tarçın', 0), hayvan('findik', 'Fındık', 1), hayvan('pofuduk', 'Pofuduk', 2)];
const kayit = (yas: 'kucuk' | 'buyuk', hayvanlar: unknown[], jeton: number, ek: Record<string, unknown> = {}) => ({ yas, acildi: true, jeton, hayvanlar, esyalar: [], susler: [], koseler: ['salon'], defter: {}, ziyaretler: { kino: 1 }, pano: [], uzman: [], ...ek });
async function ac(page: Page, k: ReturnType<typeof kayit>) {
  await page.addInitScript((v) => {
    if (!sessionStorage.getItem('pati-k')) {
      localStorage.setItem('minkino-pati-v2', v);
      sessionStorage.setItem('pati-k', '1');
    }
  }, JSON.stringify(k));
  await page.goto(`/pati/?test=1&yas=${k.yas}&ziyaret=999999999`);
  await expect.poll(() => P<string>(page, 'panel'), { timeout: 15000 }).toBe('salon');
}

for (const ekran of [
  { ad: 'yatay', w: 844, h: 390 },
  { ad: 'dikey', w: 390, h: 844 },
]) {
  test.describe(`Pati yayın kapsamı ${ekran.ad} ${ekran.w}x${ekran.h}`, () => {
    test.use({ viewport: { width: ekran.w, height: ekran.h }, deviceScaleFactor: 3 });

    test('ilk açılış: vitrinde 3 çizili yavru, köşe perdesi yok, yer tutucu yok', async ({ page }) => {
      const hatalar = hataTopla(page);
      await page.goto('/pati/?test=1&yas=kucuk&sifirla=1');
      await expect.poll(() => P<boolean>(page, 'acilis'), { timeout: 15000 }).toBe(false);
      expect(await P(page, 'vitrin')).toEqual(['tarcin', 'findik', 'pofuduk', null, null, null]);
      expect(await P(page, 'paneller')).toEqual(['vitrin', 'salon']);
      await expect(page.locator('.pt-perde')).toHaveCount(0);
      expect(await yerTutucular(page)).toEqual([]);
      expect(hatalar).toEqual([]);
    });

    test('eski kayıttaki gizli hayvan ve köşe yüklenmez; mağazada köşe ve gizli eşya yok', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, kayit('kucuk', [...UC(), { ...hayvan('fistik', 'Fıstık', 0), kose: 'kemirgen' }], 40, { koseler: ['salon', 'kemirgen'], esyalar: ['bezelye'] }));
      expect((await P<{ id: string }[]>(page, 'hayvanlar')).map((x) => x.id)).toEqual(['tarcin', 'findik', 'pofuduk']);
      expect(await P(page, 'paneller')).toEqual(['vitrin', 'salon']);
      await page.locator('.pt-katalog-dugme').click();
      // bütün yavrular alındı: Yavrular sekmesi gizli, eşyalar açılır
      await expect(page.locator('.pt-mg-sekme[data-sekme="yavru"]')).toBeHidden();
      await expect(page.locator('.pt-magaza[data-sekme="esya"]')).toHaveCount(1);
      for (const c of await page.locator('.pt-mg-cekmece').evaluateAll((l) => l.map((e) => (e as HTMLElement).dataset.cekmece!))) {
        await page.locator(`.pt-mg-cekmece[data-cekmece="${c}"]`).click();
        await page.waitForTimeout(100);
        expect(await yerTutucular(page), c).toEqual([]);
        for (const g of ['bezelye', 'aycekirdegi', 'tirmanma-dali', 'mini-havuz']) await expect(page.locator(`[data-kalem="${g}"]`)).toHaveCount(0);
      }
      await page.locator('.pt-mg-sekme[data-sekme="sus"]').click();
      await expect(page.locator('[data-kalem^="kose-"]')).toHaveCount(0);
      await expect(page.locator('.pt-mg-izgara [data-kalem]')).toHaveCount(9);
      expect(await yerTutucular(page)).toEqual([]);
      expect(hatalar).toEqual([]);
    });

    test('Bakım Odası: çekmece önlerinde çizili etiket, bütün çekmecelerde yer tutucu yok (5-6)', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, kayit('buyuk', UC(), 5));
      await P(page, 'odaAc', 'pofuduk');
      await expect(page.locator('.pt-cekmece')).toHaveCount(6);
      await expect(page.locator('.pt-cekmece .pt-dolap-etiket img')).toHaveCount(6);
      expect(await yerTutucular(page)).toEqual([]);
      await page.locator('.pt-cekmece[data-cekmece="mama"]').click();
      for (const c of ['mama', 'su', 'oyuncak', 'temizlik', 'yatak', 'ecza']) {
        if (c !== 'mama') await page.locator(`.pt-sekme[data-cekmece="${c}"]`).click();
        await expect(page.locator('.pt-tepsi2.acik .pt-esya').first()).toBeVisible();
        expect(await yerTutucular(page), c).toEqual([]);
      }
      expect(hatalar).toEqual([]);
    });

    test('ziyaretler: Babaanne tepsisi çizili (börek, çilek; pişi ve bezelye yok), parti düğmeleri çizili, Dede bahçe açmaz', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, kayit('buyuk', UC(), 5));
      await P(page, 'ziyaretGetir', 'babaanne');
      await expect.poll(async () => (await P<{ bekleyis: string | null }>(page, 'ziyaret')).bekleyis, { timeout: 15000 }).toBe('ikram');
      expect((await P<{ tepsi: string[] }>(page, 'ziyaret')).tepsi).toEqual(['havuc', 'elma', 'cilek', 'borek']);
      expect(await yerTutucular(page)).toEqual([]);
      await page.locator('[data-ikram="borek"]').click();
      await page.locator('.pt-yer[data-yer="1"]').click();
      await expect.poll(async () => (await P<{ gunluk: string[] }>(page, 'ziyaret')).gunluk.join(' '), { timeout: 15000 }).toContain('ikram:borek:findik:insan-kapar');
      await expect.poll(async () => (await P<{ bekleyis: string | null }>(page, 'ziyaret')).bekleyis, { timeout: 15000 }).toBe('ikram');
      await page.locator('[data-ikram="havuc"]').click();
      await page.locator('.pt-yer[data-yer="2"]').click();
      await expect.poll(async () => (await P<{ gunluk: string[] }>(page, 'ziyaret')).gunluk.join(' '), { timeout: 15000 }).toContain('ikram:havuc:pofuduk');
      await expect.poll(async () => (await P<{ aktif: string | null }>(page, 'ziyaret')).aktif, { timeout: 30000 }).toBeNull();

      // parti: üç müzik düğmesi çizili (komik = Banyo'nun lastik ördeği, eski Recraft ördek değil)
      await P(page, 'ziyaretGetir', 'parti');
      await expect.poll(async () => (await P<{ bekleyis: string | null }>(page, 'ziyaret')).bekleyis, { timeout: 15000 }).toBe('muzik');
      await expect(page.locator('.pt-parti-dugme img')).toHaveCount(3);
      expect(await page.locator('.pt-parti-dugme[data-muzik="komik"] img').getAttribute('src')).toContain('ordek');
      expect(await yerTutucular(page)).toEqual([]);
      for (const m of ['hizli', 'yavas', 'komik']) {
        await page.locator(`.pt-parti-dugme[data-muzik="${m}"]`).click();
        await page.waitForTimeout(400);
      }
      await expect.poll(async () => (await P<{ aktif: string | null }>(page, 'ziyaret')).aktif, { timeout: 40000 }).toBeNull();

      // Dede: ilk ziyaret, bahçe Mağaza'ya gelmez (köşe yok)
      await P(page, 'ziyaretGetir', 'dede');
      await expect.poll(async () => (await P<{ bekleyis: string | null }>(page, 'ziyaret')).bekleyis, { timeout: 15000 }).toBe('hayvan');
      await P(page, 'hayvanVer', 'tarcin');
      await expect.poll(async () => (await P<{ aktif: string | null }>(page, 'ziyaret')).aktif, { timeout: 30000 }).toBeNull();
      expect(await P(page, 'paneller')).toEqual(['vitrin', 'salon']);
      // Baba: Babaanne'nin çayı yok (çay bardağının çizimi yok; eskiden oyuncak küp resmi çıkıyordu)
      await P(page, 'ziyaretGetir', 'baba');
      await expect.poll(async () => (await P<{ bekleyis: string | null }>(page, 'ziyaret')).bekleyis, { timeout: 15000 }).toBe('hayvan');
      await expect(page.locator('[data-ikram="cay"]')).toHaveCount(0);
      expect(await yerTutucular(page)).toEqual([]);
      expect(hatalar).toEqual([]);
    });
  });
}
