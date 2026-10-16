import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

/**
 * Pati Dükkânı v2 · paket 1 (ekip/senaryo/PATI-V2.md §12): ekonomi ve vitrin. Yalnız /pati/ (menüde yok).
 * Telefon önce: 844×390 (yatay) ve 390×844 (dikey), DPR 3.
 *  (1) ilk açılış → başlangıç jetonu → yavru seç, al → ad → minder → okşama → 3 kalp → dans → jeton → yeni yavru
 *  (2) jeton yetmezse yavru bölmesine döner; hiçbir şey kaybolmaz, kilitlenmez
 *  (3) sürükleyerek sepete alma; ilerleme cihazda kalır (yeniden açınca)
 *  (4) 5-6: büyük jeton, rakam
 *  hepsinde: konsol hatası yok, hiçbir görsel kaynak pikselinin üstüne büyümüyor (DPR 3)
 */
test.beforeEach(({}, info) => test.skip(info.project.name !== 'iphone', 'yalnız telefon projesinde (boyutları test kendisi verir)'));

type Durum = {
  panel: string;
  acilis: boolean;
  jeton: number;
  kumbara: number;
  vitrin: (string | null)[];
  salon: ({ id: string; ad: string; minder: string | null; kalp: number; dans: number; mesgul: boolean } | null)[];
};
const durum = (page: Page) =>
  page.evaluate(() => {
    const p = (window as unknown as { __pati: Record<string, () => unknown> }).__pati;
    return { panel: p.panel(), acilis: p.acilis(), jeton: p.jeton(), kumbara: p.kumbara(), vitrin: p.vitrin(), salon: p.salon() } as Durum;
  });

/** Ekrandaki her raster görselin etkin ölçeği (görünen px × 3 / doğal px); 1'in üstü = büyütülmüş */
const enBuyukOlcek = (page: Page) =>
  page.evaluate(() => {
    let en = 0;
    let kim = '';
    for (const i of document.querySelectorAll<HTMLImageElement>('.pt-kok img')) {
      const r = i.getBoundingClientRect();
      if (!i.naturalWidth || r.width < 2 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
      const fit = getComputedStyle(i).objectFit;
      const k = fit === 'contain' ? Math.min(r.width / i.naturalWidth, r.height / i.naturalHeight) : r.width / i.naturalWidth;
      if (k * 3 > en) {
        en = k * 3;
        kim = i.src.split('/').pop()!;
      }
    }
    // çizimin kesitleri (arka plan konumu, 2752 px tuval) ve dekor
    for (const e of document.querySelectorAll<HTMLElement>('.pt-kesit, .pt-sepet-on, .pt-dekor-sahne')) {
      const r = e.getBoundingClientRect();
      if (!e.offsetWidth || r.width < 2) continue;
      const k = (r.width / e.offsetWidth) * 3;
      if (k > en) {
        en = k;
        kim = e.className;
      }
    }
    return { en, kim };
  });

/** Yavaş okşama: parmak hayvanın üstünde yavaşça ileri geri */
async function oksa(page: Page, yer = 0) {
  const r = (await page.locator(`.pt-yer[data-yer="${yer}"]`).boundingBox())!;
  const cx = r.x + r.width / 2;
  const cy = r.y + r.height * 0.55;
  const yol = Math.min(50, r.width * 0.3);
  await page.mouse.move(cx - yol, cy);
  await page.mouse.down();
  for (let k = 0; k < 3; k++)
    for (let s = 0; s <= 16; s++) {
      await page.mouse.move(cx - yol + (k % 2 ? 2 * yol - (s * yol) / 8 : (s * yol) / 8), cy);
      await page.waitForTimeout(25);
    }
  await page.mouse.up();
}

/** Yavruya dokun (tanışma), sonra yeniden (sepete hoplar) */
async function ikiKezDokun(page: Page, bolme: string) {
  await page.locator(`[data-bolme="${bolme}"]`).click();
  await expect(page.locator(`[data-bolme="${bolme}"][data-tanisti="1"]`)).toHaveCount(1);
  await page.waitForTimeout(150);
  await page.locator(`[data-bolme="${bolme}"]`).click();
}

for (const ekran of [
  { ad: 'yatay', w: 844, h: 390 },
  { ad: 'dikey', w: 390, h: 844 },
]) {
  test.describe(`Pati v2 ${ekran.ad} ${ekran.w}x${ekran.h}`, () => {
    test.use({ viewport: { width: ekran.w, height: ekran.h }, deviceScaleFactor: 3 });

    test('ilk açılış → yavru al → ad → minder → okşama → dans → jeton → yeni yavru', async ({ page }) => {
      const hatalar = hataTopla(page);
      await page.goto('/pati/?test=1&yas=kucuk&sifirla=1');
      await expect.poll(async () => (await durum(page)).acilis, { timeout: 15000 }).toBe(false);
      let d = await durum(page);
      expect(d.jeton).toBe(4);
      expect(d.kumbara).toBe(4);
      expect(d.vitrin).toEqual(['tarcin', 'findik', 'pofuduk', null, null, null]);
      await expect(page.locator('.pt-etiket')).toHaveCount(3);
      await page.screenshot({ path: `tests/screens/pati2-${ekran.ad}-vitrin.png` });
      expect((await enBuyukOlcek(page)).en).toBeLessThanOrEqual(1.02);

      await ikiKezDokun(page, '0');
      await expect.poll(async () => (await durum(page)).panel, { timeout: 15000 }).toBe('salon');
      await expect.poll(async () => (await durum(page)).salon[0]?.id, { timeout: 15000 }).toBe('tarcin');
      d = await durum(page);
      expect(d.jeton).toBe(1);
      expect(d.kumbara).toBe(1);

      // ad: tabelaya dokun, 9 ad, Zeytin
      await expect(page.locator('.pt-tabela[data-yer="0"]')).toBeVisible();
      await page.locator('.pt-tabela[data-yer="0"]').click();
      await expect(page.locator('.pt-adlar.acik .pt-ad')).toHaveCount(9);
      await page.locator('.pt-ad[data-ad="Zeytin"]').click();
      await expect(page.locator('.pt-tabela[data-yer="0"]')).toHaveText('Zeytin');
      await page.locator('.pt-adlar').click({ position: { x: 5, y: ekran.h - 5 } });
      await expect(page.locator('.pt-adlar.acik')).toHaveCount(0);

      // minder: dört renk; seçilen oyuğa iner, ilk minder 1 kalp
      await expect(page.locator('.pt-tepsi.acik .pt-minder-sec')).toHaveCount(4);
      await page.locator('.pt-minder-sec[data-renk="mavi"]').click();
      await expect.poll(async () => (await durum(page)).salon[0]?.minder).toBe('mavi');
      await expect.poll(async () => (await durum(page)).salon[0]?.kalp).toBe(1);
      await expect(page.locator('.pt-oyuk-minder[data-yer="0"]')).toHaveCount(1);
      await page.screenshot({ path: `tests/screens/pati2-${ekran.ad}-salon.png` });

      // okşama: iki kalp daha → dans → jeton (3-4: +2), kumbaraya uçar
      await expect.poll(async () => (await durum(page)).salon[0]?.mesgul).toBe(false);
      for (let i = 0; i < 4 && (await durum(page)).salon[0]?.dans === 0; i++) {
        const once = (await durum(page)).salon[0]!.kalp;
        await oksa(page);
        // her yavaş okşama bir kalp (testte bekleme kısa); üçüncüsü dans
        await expect.poll(async () => { const s = (await durum(page)).salon[0]!; return s.kalp > once || s.dans > 0; }).toBe(true);
        await page.waitForTimeout(250);
      }
      await expect.poll(async () => (await durum(page)).salon[0]?.dans, { timeout: 10000 }).toBe(1);
      await expect.poll(async () => (await durum(page)).jeton).toBe(3);
      await expect.poll(async () => (await durum(page)).kumbara, { timeout: 10000 }).toBe(3);
      expect((await durum(page)).salon[0]?.kalp).toBe(0);
      // dans sonrası dinlenme: kalp dolmaz, okşama yine olur, hiçbir şey kötüleşmez
      await oksa(page);
      expect((await durum(page)).salon[0]?.kalp).toBe(0);
      expect((await enBuyukOlcek(page)).en).toBeLessThanOrEqual(1.02);

      // jetonla yeni yavru: vitrine dön, Pofuduk (3)
      await page.locator('.pt-gecis').click();
      await expect.poll(async () => (await durum(page)).panel).toBe('vitrin');
      await ikiKezDokun(page, '2');
      await expect.poll(async () => (await durum(page)).salon[1]?.id, { timeout: 15000 }).toBe('pofuduk');
      expect((await durum(page)).jeton).toBe(0);
      await page.screenshot({ path: `tests/screens/pati2-${ekran.ad}-iki-hayvan.png` });
      expect(hatalar).toEqual([]);
    });

    test('jeton yetmezse yavru bölmesine döner, hiçbir şey kaybolmaz', async ({ page }) => {
      const hatalar = hataTopla(page);
      await page.goto('/pati/?test=1&yas=kucuk&sifirla=1&jeton=1');
      await expect.poll(async () => (await durum(page)).acilis, { timeout: 15000 }).toBe(false);
      for (const b of ['1', '2']) {
        await ikiKezDokun(page, b);
        await expect(page.locator('.pt-vitrin[data-aliniyor]')).toHaveCount(0, { timeout: 15000 });
        await page.waitForTimeout(200);
        const d = await durum(page);
        expect(d.panel).toBe('vitrin');
        expect(d.jeton).toBe(1);
        expect(d.kumbara).toBe(1);
        expect(d.vitrin).toEqual(['tarcin', 'findik', 'pofuduk', null, null, null]);
        expect(d.salon.filter(Boolean)).toHaveLength(0);
        // yavru yine bölmesinde, görünür
        await expect(page.locator(`[data-bolme="${b}"] .pt-hayvan:not(.pt-gizli)`)).toHaveCount(1);
      }
      await expect(page.locator('.pt-etiket.odeme')).toHaveCount(0);
      expect(hatalar).toEqual([]);
    });

    test('sürükleyerek sepete alma; ilerleme cihazda kalır', async ({ page }) => {
      const hatalar = hataTopla(page);
      await page.goto('/pati/?test=1&yas=kucuk&sifirla=1&jeton=4');
      await expect.poll(async () => (await durum(page)).acilis, { timeout: 15000 }).toBe(false);
      const a = (await page.locator('[data-bolme="1"] .pt-hayvan .pt-resim').boundingBox())!;
      const s = (await page.locator('.pt-sepet').boundingBox())!;
      const [x0, y0] = [a.x + a.width / 2, a.y + a.height / 2];
      const [x1, y1] = [s.x + s.width / 2, s.y + s.height * 0.6];
      await page.mouse.move(x0, y0);
      await page.mouse.down();
      for (let i = 1; i <= 12; i++) await page.mouse.move(x0 + ((x1 - x0) * i) / 12, y0 + ((y1 - y0) * i) / 12);
      await page.mouse.up();
      await expect.poll(async () => (await durum(page)).salon[0]?.id, { timeout: 15000 }).toBe('findik');
      expect((await durum(page)).jeton).toBe(0);
      await page.locator('.pt-minder-sec[data-renk="yesil"]').click();
      await expect.poll(async () => (await durum(page)).salon[0]?.minder).toBe('yesil');
      await expect.poll(async () => (await durum(page)).salon[0]?.kalp).toBe(1);
      // yeniden açılış: kayıt yerinde, hayvanı olan çocuk salonda açar
      await page.goto('/pati/?test=1&yas=kucuk');
      await expect.poll(async () => (await durum(page)).panel, { timeout: 15000 }).toBe('salon');
      const d = await durum(page);
      expect(d.salon[0]).toMatchObject({ id: 'findik', ad: 'Fındık', minder: 'yesil', kalp: 1 });
      expect(d.vitrin).not.toContain('findik');
      const kayit = await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-pati-v2') ?? '{}'));
      expect(kayit.hayvanlar).toHaveLength(1);
      expect(kayit.acildi).toBe(true);
      expect(hatalar).toEqual([]);
    });

    test('5-6: başlangıç 8 jeton, büyük jeton ve rakam', async ({ page }) => {
      const hatalar = hataTopla(page);
      await page.goto('/pati/?test=1&yas=buyuk&sifirla=1');
      await expect.poll(async () => (await durum(page)).acilis, { timeout: 15000 }).toBe(false);
      expect((await durum(page)).jeton).toBe(8);
      await expect(page.locator('.pt-kumbara-rakam')).toHaveText('8');
      await expect(page.locator('.pt-kumbara-jetonlar .pt-jeton.pt-buyuk')).toHaveCount(1);
      await expect(page.locator('[data-bolme="1"] .pt-etiket-rakam')).toHaveText('7');
      await expect(page.locator('[data-bolme="1"] .pt-yuva.pt-buyuk')).toHaveCount(1);
      await ikiKezDokun(page, '1');
      await expect.poll(async () => (await durum(page)).salon[0]?.id, { timeout: 15000 }).toBe('findik');
      expect((await durum(page)).jeton).toBe(1);
      await expect(page.locator('.pt-kumbara-rakam')).toHaveText('1');
      expect((await enBuyukOlcek(page)).en).toBeLessThanOrEqual(1.02);
      expect(hatalar).toEqual([]);
    });
  });
}
