/**
 * Okula Hazırım! · Kelime Köprüsü (/okul/): telefonda ve tablette köprünün bütün etkinlikleri dokunarak baştan sona
 * (Okul Yolu → köprü → her taş → çıkartmayı albüme yapıştır → sıradaki), sonunda "Kelime Ustası" rozeti, taşlar
 * köprüye yerleşir, Mino ile Kino karşıya geçer. Kino'nun hata anı her etkinlikte; yanlışa ceza yok.
 * Ekran kareleri tests/screens/okul-kelime-*.png (telefon), okul-kelime-ipad-*.png (tablet).
 */
import { expect, test, type Locator, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

const SIRA = ['kelime-dinle', 'kelime-hecele', 'kelime-tersi', 'kelime-boya', 'kelime-grup', 'kelime-eksik'];
const KISA = { timeout: 1500 };

async function surukle(page: Page, kaynak: Locator, hedef: Locator) {
  const a = (await kaynak.boundingBox())!;
  const b = (await hedef.boundingBox())!;
  const x0 = a.x + a.width / 2;
  const y0 = a.y + a.height / 2;
  const x1 = b.x + b.width / 2;
  const y1 = b.y + b.height / 2;
  await page.mouse.move(x0, y0);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) await page.mouse.move(x0 + ((x1 - x0) * i) / 8, y0 + ((y1 - y0) * i) / 8);
  await page.mouse.up();
}
const ekran = (page: Page) => page.locator('.ok-etkinlik');
const adimda = async (page: Page, adim: string) => (await page.locator(`.ok-etkinlik[data-adim="${adim}"]`).count()) > 0;
const gorunur = async (l: Locator) => (await l.count()) > 0 && (await l.first().isVisible());
const tikla = async (l: Locator) => {
  if (await gorunur(l)) await l.first().click({ timeout: 2000 }).catch(() => undefined);
};

async function bitene(page: Page, ad: string, adim: () => Promise<void>) {
  const son = Date.now() + 90_000;
  let sonHata: unknown = null;
  while (Date.now() < son) {
    if (await page.locator('.ok-sonuc').count()) return;
    try {
      await adim();
    } catch (e) {
      sonHata = e;
    }
    await page.waitForTimeout(40);
  }
  throw new Error(`${ad} bitmedi ${sonHata ? String(sonHata) : ''}`);
}

/** Bir kez yanlışa dokunur (ceza yok: ekran sürer), sonra doğruya */
async function birYanlisSonraDogru(page: Page, kartlar: string) {
  const e = ekran(page);
  if (!(await e.getAttribute('data-denendi', KISA))) {
    const yanlis = page.locator(`${kartlar}:not([data-dogru])`).first();
    if (await gorunur(yanlis)) {
      await e.evaluate((x) => x.setAttribute('data-denendi', '1'));
      await yanlis.click();
      await page.waitForTimeout(300);
    }
  }
  await tikla(page.locator(`${kartlar}[data-dogru="1"]`));
}

async function oyna(page: Page, id: string, kareAl: (ad: string) => Promise<void>) {
  await expect(ekran(page)).toHaveAttribute('data-etkinlik', id);
  let kare = false;
  const birKare = async (ad: string) => {
    if (kare) return;
    kare = true;
    await kareAl(ad);
  };
  switch (id) {
    case 'kelime-dinle':
      return bitene(page, id, async () => {
        if (!(await adimda(page, 'sec'))) return;
        await birYanlisSonraDogru(page, '.ok-k-gol-tas');
        await page.waitForTimeout(100);
      });
    case 'kelime-hecele':
      return bitene(page, id, async () => {
        if (!(await adimda(page, 'vur'))) return;
        const e = ekran(page);
        const hedef = Number(await e.getAttribute('data-hedef', KISA));
        const n = Number((await e.getAttribute('data-vurus', KISA)) ?? 0);
        if (hedef && n < hedef) {
          await page.locator('.ok-k-davul').click();
          if (n + 1 === hedef) await birKare('hecele');
        }
        await page.waitForTimeout(60);
      });
    case 'kelime-tersi':
      return bitene(page, id, async () => {
        if (!(await adimda(page, 'sec'))) return;
        await birKare('tersi');
        await birYanlisSonraDogru(page, '.ok-k-ters-kart');
        await page.waitForTimeout(100);
      });
    case 'kelime-boya':
      return bitene(page, id, async () => {
        if (!(await adimda(page, 'boya'))) return;
        await birYanlisSonraDogru(page, '.ok-k-kova');
        await page.waitForTimeout(100);
      });
    case 'kelime-grup':
      return bitene(page, id, async () => {
        if (!(await adimda(page, 'surukle'))) return;
        await birKare('grup');
        const o = page.locator('.ok-k-oge:not([data-yerlesti]):not(.ok-k-gitti)').first();
        if (!(await o.count())) return;
        const k = await o.getAttribute('data-kategori', KISA);
        // bir kez yanlış yere (geri seker, ceza yok)
        const e = ekran(page);
        if (!(await e.getAttribute('data-denendi', KISA))) {
          await e.evaluate((x) => x.setAttribute('data-denendi', '1'));
          await surukle(page, o, page.locator(`.ok-k-grup-yer:not([data-kategori="${k}"])`).first());
          await page.waitForTimeout(300);
          return;
        }
        await surukle(page, o, page.locator(`.ok-k-grup-yer[data-kategori="${k}"]`));
        await page.waitForTimeout(150);
      });
    case 'kelime-eksik':
      return bitene(page, id, async () => {
        if (!(await adimda(page, 'sec'))) return;
        await birYanlisSonraDogru(page, '.ok-k-kart');
        await page.waitForTimeout(100);
      });
  }
}

async function sonuc(page: Page, id: string, kareAl: (ad: string) => Promise<void>): Promise<boolean> {
  const s = page.locator('.ok-sonuc');
  await expect(s).toHaveAttribute('data-etkinlik', id);
  await expect(s).toHaveAttribute('data-durum', 'yapistir', { timeout: 10000 });
  const yuva = page.locator(`.ok-yuva[data-yuva="${id}"]`);
  await surukle(page, page.locator('.ok-yeni-cikartma'), yuva);
  await expect(yuva).toHaveClass(/dolu/);
  await expect(s).toHaveAttribute('data-durum', /rozet|bitti/, { timeout: 10000 });
  if ((await s.getAttribute('data-durum')) === 'rozet') {
    await kareAl('rozet');
    await expect(s).toHaveAttribute('data-durum', 'bitti', { timeout: 10000 });
  }
  const sira = page.locator('.ok-siradaki');
  if (await sira.isVisible()) {
    await sira.click();
    return true;
  }
  await page.locator('.ok-harita-dugme').click();
  return false;
}

test('Okula Hazırım: Kelime Köprüsü baştan sona; taşlar yerleşir, Mino ile Kino karşıya geçer', async ({ page }, info) => {
  test.setTimeout(480_000);
  const hatalar = hataTopla(page);
  const telefon = info.project.name === 'iphone';
  const kareAl = async (ad: string) => {
    await page.waitForFunction(() => [...document.images].every((i) => i.complete));
    await page.waitForTimeout(400);
    await page.screenshot({ path: `tests/screens/okul-kelime-${telefon ? '' : info.project.name + '-'}${ad}.png` });
  };
  await page.goto('./okul/?test=1&sifirla=1&yas=6&tohum=11');
  // Okul Yolu: Kelime Köprüsü açık
  await expect(page.locator('.ok-bolge-kart[data-bolge="kelime"] .ok-yakinda')).toHaveCount(0);
  await page.locator('.ok-bolge-kart[data-bolge="kelime"]').click();

  // köprü: 6 taş yuvası, önerilen ilki
  await expect(page.locator('.ok-kopru-ekran')).toBeVisible();
  await expect(page.locator('.ok-kp-tas')).toHaveCount(6);
  await expect(page.locator('.ok-kp-tas[data-etkinlik="kelime-dinle"]')).toHaveAttribute('data-durum', 'oneri');
  await kareAl('kopru-bos');
  await page.locator('.ok-kp-tas[data-etkinlik="kelime-dinle"]').click();

  for (const id of SIRA) {
    await oyna(page, id, kareAl);
    const devam = await sonuc(page, id, kareAl);
    if (id !== SIRA[SIRA.length - 1]) expect(devam, id).toBe(true);
  }

  // köprü tamam: taşlar yerinde, şenlik, rozet
  await expect(page.locator('.ok-kopru-ekran')).toBeVisible();
  await expect(page.locator('.ok-kopru-ekran')).toHaveAttribute('data-hazir', '1', { timeout: 20000 });
  await expect(page.locator('.ok-kp-tas[data-durum="bitti"]')).toHaveCount(6);
  await expect(page.locator('.ok-kp-sahne')).toHaveAttribute('data-senlik', '1');
  await expect(page.locator('.ok-kp-rozet')).toBeVisible();
  const kayit = await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-okul-v1') ?? '{}'));
  expect(kayit.biten).toEqual(SIRA);
  expect(kayit.rozet).toEqual(['kelime']);
  const kopru = await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-okul-kelime-v1') ?? '{}'));
  expect(kopru.gecti).toBe(true);
  await kareAl('kopru');

  // albümde Kelime Köprüsü sayfası
  await page.locator('.ok-album-dugme').click();
  await expect(page.locator('.ok-album')).toHaveAttribute('data-bolge', 'kelime');
  await expect(page.locator('.ok-sayfa[data-bolge="kelime"] .ok-yuva.dolu')).toHaveCount(6);
  await kareAl('album');
  await page.getByRole('button', { name: 'Geri', exact: true }).click();
  await expect(page.locator('.ok-kopru-ekran')).toBeVisible();
  expect(hatalar).toEqual([]);
});

test('Okula Hazırım: Kelime Köprüsü yatay telefonda ve 1024×768 tablette sığıyor', async ({ page }, info) => {
  test.skip(info.project.name !== 'iphone', 'yalnız bir kez');
  const hatalar = hataTopla(page);
  for (const [w, hh] of [
    [844, 390],
    [1024, 768],
  ]) {
    await page.setViewportSize({ width: w, height: hh });
    const tasmaYok = async () => {
      for (const el of await page.locator('.ok-etkinlik .ok-alan > *, .ok-secim > *, .ok-mino-yer, .ok-kino-yer, .ok-kp-tas').all()) {
        if (!(await el.isVisible())) continue;
        const k = (await el.boundingBox())!;
        expect(k.x).toBeGreaterThanOrEqual(-2);
        expect(k.x + k.width).toBeLessThanOrEqual(w + 2);
        expect(k.y + k.height).toBeLessThanOrEqual(hh + 2);
      }
    };
    await page.goto('./okul/?test=1&sifirla=1&yas=6&ekran=bolge&bolge=kelime&biten=kelime-dinle,kelime-hecele');
    await expect(page.locator('.ok-kp-tas')).toHaveCount(6);
    await page.waitForTimeout(400);
    await tasmaYok();
    await page.screenshot({ path: `tests/screens/okul-kelime-${w}-kopru.png` });
    for (const [id, adim] of [
      ['kelime-dinle', 'sec'],
      ['kelime-hecele', 'vur'],
      ['kelime-tersi', 'sec'],
      ['kelime-boya', 'boya'],
      ['kelime-grup', 'surukle'],
      ['kelime-eksik', 'sec'],
    ]) {
      await page.goto(`./okul/?test=1&yas=6&tohum=4&etkinlik=${id}`);
      await expect(page.locator(`.ok-etkinlik[data-adim="${adim}"]`)).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(300);
      await tasmaYok();
      await page.screenshot({ path: `tests/screens/okul-kelime-${w}-${id.slice(7)}.png` });
    }
  }
  expect(hatalar).toEqual([]);
});
