import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

/**
 * Pati Dükkânı · YAYIN KAPSAMI (pati/src/yayin.ts; 2026-10-18 yayını): ekranda hiçbir yer tutucu görünmez.
 * Yalnız çizimi tamamlanmış içerik: salon (Tarçın, Fındık, Pofuduk) + Recraft vektör çizimli 5 köşe (Fıstık, Kurabiye,
 * Pırıl, Limon, Tospik; Bahçe'de gece misafiri Diken); çizili eşyalar ve süsler.
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

const hayvan = (id: string, ad: string, yer: number, kose = 'salon') => ({ id, ad, kose, yer, minder: kose === 'salon' ? 'mavi' : null, kalp: 0, dans: 0, sonDans: 0, ihtiyac: null });
const UC = () => [hayvan('tarcin', 'Tarçın', 0), hayvan('findik', 'Fındık', 1), hayvan('pofuduk', 'Pofuduk', 2)];
/** Bütün köşeler açık, çizimi olan bütün hayvanlar yerinde */
const SEKIZ = () => [...UC(), hayvan('fistik', 'Fıstık', 0, 'kemirgen'), hayvan('kurabiye', 'Kurabiye', 1, 'kemirgen'), hayvan('piril', 'Pırıl', 0, 'akvaryum'), hayvan('limon', 'Limon', 0, 'kus'), hayvan('tospik', 'Tospik', 0, 'surungen')];
const KOSELER = ['kemirgen', 'akvaryum', 'kus', 'bahce', 'surungen'];
/** Ekrandaki her raster resmin etkin ölçeği (görünen px × 3 / doğal px; SVG sınırsız) */
const enBuyukOlcek = (page: Page) =>
  page.evaluate(() => {
    let en = 0;
    let kim = '';
    for (const i of document.querySelectorAll<HTMLImageElement>('.pt-kok img')) {
      const r = i.getBoundingClientRect();
      if (!i.naturalWidth || /\.svg/.test(i.src) || r.width < 2 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
      const k = Math.min(r.width / i.naturalWidth, r.height / i.naturalHeight) * 3;
      if (k > en) {
        en = k;
        kim = i.src.split('/').pop()!;
      }
    }
    return { en, kim };
  });
/** Dükkân şeridinde bir bölüme yürür (kenar düğmeleriyle, çocuk gibi) */
async function panelGit(page: Page, hedef: string) {
  for (let i = 0; i < 10; i++) {
    const [simdi, l] = await Promise.all([P<string>(page, 'panel'), P<string[]>(page, 'paneller')]);
    if (simdi === hedef) return;
    await page.locator(`.pt-kenar[data-yon="${l.indexOf(hedef) > l.indexOf(simdi) ? 1 : -1}"]`).click();
    await page.waitForTimeout(250);
  }
  expect(await P<string>(page, 'panel')).toBe(hedef);
}
const dokun = async (page: Page, sec: string) => {
  const r = (await page.locator(sec).first().boundingBox())!;
  await page.mouse.click(r.x + r.width / 2, r.y + r.height * 0.55);
};
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

    test('ilk açılış: vitrinde 3 çizili yavru; Kemirgen, Akvaryum, Kuş perdeleri gölgeli; yer tutucu yok', async ({ page }) => {
      const hatalar = hataTopla(page);
      await page.goto('/pati/?test=1&yas=kucuk&sifirla=1');
      await expect.poll(() => P<boolean>(page, 'acilis'), { timeout: 15000 }).toBe(false);
      expect(await P(page, 'vitrin')).toEqual(['tarcin', 'findik', 'pofuduk', null, null, null]);
      // Bahçe Dede'nin ilk ziyaretinden, Sürüngen 4 hayvandan sonra görünür
      expect(await P(page, 'paneller')).toEqual(['vitrin', 'salon', 'kose-kemirgen', 'kose-akvaryum', 'kose-kus']);
      await expect(page.locator('.pt-perde .pt-kose-golge')).toHaveCount(3);
      expect(await yerTutucular(page)).toEqual([]);
      expect(hatalar).toEqual([]);
    });

    test('eski kayıttaki gizli hayvan (Zümrüt) yüklenmez; mağazada gizli eşya yok, köşeler satılık', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, kayit('kucuk', [...UC(), hayvan('zumrut', 'Zümrüt', 1, 'surungen')], 40, { esyalar: ['bezelye'] }));
      expect((await P<{ id: string }[]>(page, 'hayvanlar')).map((x) => x.id)).toEqual(['tarcin', 'findik', 'pofuduk']);
      expect(await P(page, 'paneller')).toEqual(['vitrin', 'salon', 'kose-kemirgen', 'kose-akvaryum', 'kose-kus']);
      await page.locator('.pt-katalog-dugme').click();
      // Yavrular: köşesi kapalı çizili yavrular perdeli (Zümrüt yok), yer tutucu yok
      await expect(page.locator('.pt-magaza[data-sekme="yavru"]')).toHaveCount(1);
      expect(await page.locator('.pt-mg-izgara [data-kalem]').evaluateAll((l) => l.map((e) => (e as HTMLElement).dataset.kalem))).toEqual(['fistik', 'kurabiye', 'piril', 'limon', 'tospik']);
      await expect(page.locator('.pt-mg-izgara .pt-mg-perde')).toHaveCount(5);
      expect(await yerTutucular(page)).toEqual([]);
      await page.locator('.pt-mg-sekme[data-sekme="esya"]').click();
      for (const c of await page.locator('.pt-mg-cekmece').evaluateAll((l) => l.map((e) => (e as HTMLElement).dataset.cekmece!))) {
        await page.locator(`.pt-mg-cekmece[data-cekmece="${c}"]`).click();
        await page.waitForTimeout(100);
        expect(await yerTutucular(page), c).toEqual([]);
        for (const g of ['bezelye', 'aycekirdegi', 'tirmanma-dali', 'mini-havuz']) await expect(page.locator(`[data-kalem="${g}"]`)).toHaveCount(0);
      }
      await page.locator('.pt-mg-sekme[data-sekme="sus"]').click();
      expect(await page.locator('[data-kalem^="kose-"]').evaluateAll((l) => l.map((e) => (e as HTMLElement).dataset.kalem))).toEqual(['kose-kemirgen', 'kose-akvaryum', 'kose-kus']);
      await expect(page.locator('.pt-mg-izgara [data-kalem]')).toHaveCount(12);
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

    test('ziyaretler: Babaanne tepsisi çizili (börek, çilek; pişi ve bezelye yok), parti düğmeleri çizili, Dede bahçeyi getirir', async ({ page }) => {
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

      // Dede: ilk ziyaret "Arkada bahçe olur…": Bahçe perdesi dükkân şeridine gelir
      await P(page, 'ziyaretGetir', 'dede');
      await expect.poll(async () => (await P<{ bekleyis: string | null }>(page, 'ziyaret')).bekleyis, { timeout: 15000 }).toBe('hayvan');
      await P(page, 'hayvanVer', 'tarcin');
      await expect.poll(async () => (await P<{ aktif: string | null }>(page, 'ziyaret')).aktif, { timeout: 30000 }).toBeNull();
      expect(await P(page, 'paneller')).toContain('kose-bahce');
      // Baba: Babaanne'nin çayı yok (çay bardağının çizimi yok; eskiden oyuncak küp resmi çıkıyordu)
      await P(page, 'ziyaretGetir', 'baba');
      await expect.poll(async () => (await P<{ bekleyis: string | null }>(page, 'ziyaret')).bekleyis, { timeout: 15000 }).toBe('hayvan');
      await expect(page.locator('[data-ikram="cay"]')).toHaveCount(0);
      expect(await yerTutucular(page)).toEqual([]);
      expect(hatalar).toEqual([]);
    });

    test('açık köşeler: 5 vektör çizim, hayvanlar habitatlarında, Diken bahçede; yer tutucu yok, netlik', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, kayit('kucuk', SEKIZ(), 5, { koseler: ['salon', ...KOSELER], ziyaretler: { kino: 1, dede: 1 } }));
      expect(await P(page, 'paneller')).toEqual(['vitrin', 'salon', ...KOSELER.map((k) => `kose-${k}`)]);
      const beklenen: Record<string, string[]> = { kemirgen: ['fistik', 'kurabiye'], akvaryum: ['piril'], kus: ['limon'], bahce: [], surungen: ['tospik'] };
      for (const k of KOSELER) {
        await panelGit(page, `kose-${k}`);
        await page.waitForTimeout(700);
        const panel = page.locator(`.pt-panel[data-panel="kose-${k}"]`);
        // çizim: yatayda bütün SVG, dikeyde habitatların kesit kartı (aynı SVG)
        if (ekran.w > ekran.h) expect(await panel.locator('.pt-kose-resim').getAttribute('src')).toMatch(/\.svg$/);
        else await expect(panel.locator('.pt-kose-yuva.pt-kesit')).toHaveCount(2);
        expect((await P<Record<string, ({ id: string } | null)[]>>(page, 'koseler'))[k].filter(Boolean).map((x) => x!.id)).toEqual(beklenen[k]);
        // her hayvan ekranda, kendi habitatının (kesitin) içinde, üst çubuğun altında
        const kutular = await panel.evaluate((el) =>
          [...el.querySelectorAll<HTMLElement>('.pt-kose-yuva')].flatMap((y) => {
            const img = y.querySelector<HTMLImageElement>('.pt-hayvan:not(.pt-kose-diken) .pt-resim');
            if (!img) return [];
            const a = img.getBoundingClientRect();
            const b = y.getBoundingClientRect();
            return [{ a: [a.left, a.top, a.right, a.bottom], b: [b.left, b.top, b.right, b.bottom] }];
          }),
        );
        expect(kutular.length).toBe(beklenen[k].length);
        for (const { a, b } of kutular) {
          expect(a[0]).toBeGreaterThanOrEqual(b[0] - 2);
          expect(a[2]).toBeLessThanOrEqual(b[2] + 2);
          expect(a[1]).toBeGreaterThanOrEqual(Math.max(b[1] - 2, 60));
          expect(a[3]).toBeLessThanOrEqual(Math.min(b[3] + 2, ekran.h));
        }
        if (k === 'bahce') await expect(panel.locator('.pt-hayvan.pt-kose-diken .pt-resim')).toBeVisible();
        expect(await yerTutucular(page), k).toEqual([]);
        expect((await enBuyukOlcek(page)).en, k).toBeLessThanOrEqual(1.02);
        await page.screenshot({ path: `tests/screens/pati-kose-${ekran.ad}-${k}.png` });
      }
      // Diken'e dokununca koklar (Nehir: "Diken yabani, evi bahçe."); Bakım Odası açılmaz
      await panelGit(page, 'kose-bahce');
      await page.locator('.pt-panel[data-panel="kose-bahce"] .pt-kose-alan[data-diken]').click();
      await page.waitForTimeout(300);
      expect((await P<{ acik: boolean }>(page, 'oda')).acik).toBe(false);
      expect(hatalar).toEqual([]);
    });

    test('köşe al: perde → katalog → gölge → vitrin → Fıstık köşesine → Bakım Odası; açılan ihtiyaçlarda yer tutucu yok', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, kayit('kucuk', UC(), 14));
      await panelGit(page, 'kose-kemirgen');
      await page.locator('.pt-perde[data-kose="kemirgen"]').click();
      await expect.poll(async () => (await P<{ sekme: string }>(page, 'magaza')).sekme).toBe('sus');
      await page.locator('[data-kalem="kose-kemirgen"]').click();
      await expect.poll(async () => Object.keys(await P<Record<string, unknown>>(page, 'koseler')), { timeout: 15000 }).toEqual(['kemirgen']);
      expect(await P<number>(page, 'jeton')).toBe(10);
      expect(await P<string>(page, 'panel')).toBe('kose-kemirgen');
      // boş habitatlarda iki yavrunun gölgesi (Fıstık, Kurabiye)
      await expect(page.locator('.pt-panel[data-panel="kose-kemirgen"] .pt-kose-golge2')).toHaveCount(2);
      expect(await yerTutucular(page)).toEqual([]);
      await page.locator('.pt-kose-golge2[data-golge="fistik"]').click();
      await expect.poll(() => P(page, 'panel')).toBe('vitrin');
      const i = (await P<(string | null)[]>(page, 'vitrin')).indexOf('fistik');
      expect(i).toBeGreaterThanOrEqual(0);
      await expect(page.locator(`[data-bolme="${i}"][data-tanisti="1"]`)).toHaveCount(1, { timeout: 10000 });
      await page.waitForTimeout(300);
      await page.locator(`[data-bolme="${i}"]`).click();
      await expect.poll(async () => (await P<Record<string, ({ id: string } | null)[]>>(page, 'koseler')).kemirgen.some((x) => x?.id === 'fistik'), { timeout: 15000 }).toBe(true);
      expect(await P<string>(page, 'panel')).toBe('kose-kemirgen');
      await expect(page.locator('.pt-panel[data-panel="kose-kemirgen"] .pt-kose-golge2')).toHaveCount(1);
      await page.waitForTimeout(600);
      await page.screenshot({ path: `tests/screens/pati-kose-${ekran.ad}-alindi.png` });
      // Fıstık'a dokununca Bakım Odası; çekmecelerde yer tutucu yok
      await dokun(page, '.pt-panel[data-panel="kose-kemirgen"] .pt-kose-alan[data-kose-yer="0"]');
      await expect.poll(async () => (await P<{ hayvan: string }>(page, 'oda')).hayvan).toBe('fistik');
      for (const ih of ['susuz', 'sikildi', 'uykulu']) {
        await P(page, 'ihtiyacAc', 'fistik', ih);
        await page.waitForTimeout(200);
        expect(await yerTutucular(page), ih).toEqual([]);
      }
      expect((await enBuyukOlcek(page)).en).toBeLessThanOrEqual(1.02);
      expect(hatalar).toEqual([]);
    });

    test("sırası değişen köşe: Akvaryum (Kemirgen'den önce) alınınca şerit akvaryumda kalır, Pırıl'ın gölgesi tek", async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, kayit('kucuk', UC(), 14));
      await panelGit(page, 'kose-akvaryum');
      await page.locator('.pt-perde[data-kose="akvaryum"]').click();
      await expect.poll(async () => (await P<{ sekme: string }>(page, 'magaza')).sekme).toBe('sus');
      await page.locator('[data-kalem="kose-akvaryum"]').click();
      await expect.poll(async () => Object.keys(await P<Record<string, unknown>>(page, 'koseler')), { timeout: 15000 }).toEqual(['akvaryum']);
      expect(await P(page, 'paneller')).toEqual(['vitrin', 'salon', 'kose-akvaryum', 'kose-kemirgen', 'kose-kus']);
      expect(await P<string>(page, 'panel')).toBe('kose-akvaryum');
      // ekranda gerçekten akvaryum (başka köşenin perdesi değil)
      await expect.poll(async () => Math.round((await page.locator('.pt-panel[data-panel="kose-akvaryum"]').boundingBox())!.x), { timeout: 5000 }).toBe(0);
      // tek balık: yalnız bir habitatta gölge, öbür akvaryum boş su
      await expect(page.locator('.pt-panel[data-panel="kose-akvaryum"] .pt-kose-golge2')).toHaveCount(1);
      expect(await yerTutucular(page)).toEqual([]);
      expect(hatalar).toEqual([]);
    });

    test('gece misafiri Diken: Bahçe açıkken kapanışta gelir, tabağını seçeriz; gece bahçede yok', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, kayit('kucuk', SEKIZ(), 0, { koseler: ['salon', ...KOSELER], ziyaretler: { kino: 1, dede: 1 } }));
      // akşam: ip iki kez (herkes uyusun → gece); fotoğraftan sonra Diken çalılıktan çıkar
      await P(page, 'ipCek');
      await page.waitForTimeout(400);
      await P(page, 'ipCek');
      await expect.poll(async () => (await P<{ aktif: string | null }>(page, 'ziyaret')).aktif, { timeout: 30000 }).toBe('diken');
      await expect.poll(async () => (await P<{ bekleyis: string | null }>(page, 'ziyaret')).bekleyis, { timeout: 15000 }).toBe('tabak');
      await expect(page.locator('[data-tabak] img')).toHaveCount(4);
      expect(await yerTutucular(page)).toEqual([]);
      await page.screenshot({ path: `tests/screens/pati-kose-${ekran.ad}-diken.png` });
      await page.locator('[data-tabak="kedi-mamasi"]').click();
      await expect.poll(async () => (await P<{ aktif: string | null }>(page, 'ziyaret')).aktif, { timeout: 15000 }).toBeNull();
      expect((await P<{ gunluk: string[] }>(page, 'ziyaret')).gunluk).toContain('diken:kedi-mamasi:sever');
      // gece Diken bahçesinde görünmez (dükkâna geldi)
      await expect(page.locator('.pt-panel[data-panel="kose-bahce"] .pt-hayvan.pt-kose-diken .pt-resim')).toBeHidden();
      expect(hatalar).toEqual([]);
    });
  });
}
