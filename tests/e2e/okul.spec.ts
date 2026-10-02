/**
 * Okula Hazırım! (/okul/): 3 ve 6 yaşla Sayı Bahçesi'nin bütün etkinlikleri dokunarak baştan sona (Okul Yolu →
 * Sayı Bahçesi → her durak → çıkartmayı albüme yapıştır → sıradaki), sonunda "Sayı Ustası" rozeti. Kino'nun hata anı
 * her etkinlikte görülür; yanlış cevaba ceza yok, 2 yanlıştan sonra ipucu parlar. Ekran kareleri tests/screens/okul-*.png.
 */
import { expect, test, type Locator, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

const SIRA = ['kac-elma', 'sayi-karti', 'sepete-koy', 'hangisinde-cok', 'bir-fazla', 'merdiven', 'kac-alkis', 'rakam-ciz', 'kuslar', 'piknik'];

/** Fareyle (parmak gibi) sürükler */
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

/** Ekran o arada değişebilir (sonuç ekranı): öznitelik okumaları kısa sürede vazgeçer */
const KISA = { timeout: 1500 };
const ekran = (page: Page) => page.locator('.ok-etkinlik');
const adimda = async (page: Page, adim: string) => (await page.locator(`.ok-etkinlik[data-adim="${adim}"]`).count()) > 0;
const gorunur = async (l: Locator) => (await l.count()) > 0 && (await l.first().isVisible());
/** Görünürse dokunur (ekran o arada değişebilir: bulunamazsa döngü yeniden dener) */
const tikla = async (l: Locator) => {
  if (await gorunur(l)) await l.first().click({ timeout: 2000 }).catch(() => undefined);
};

/** Etkinlik bitene (sonuç ekranı gelene) kadar adim() tekrarlanır */
async function bitene(page: Page, ad: string, adim: () => Promise<void>) {
  const son = Date.now() + 60_000;
  let sonHata: unknown = null;
  while (Date.now() < son) {
    if (await page.locator('.ok-sonuc').count()) return;
    try {
      await adim();
    } catch (e) {
      // ekran tam o anda değiştiyse (sonuç ekranı) okunamayan öznitelik: döngü yeniden bakar
      sonHata = e;
    }
    await page.waitForTimeout(40);
  }
  throw new Error(`${ad} bitmedi ${sonHata ? String(sonHata) : ''}`);
}

async function oyna(page: Page, id: string, kareAl: (ad: string) => Promise<void>) {
  await expect(ekran(page)).toHaveAttribute('data-etkinlik', id);
  let kare = false;
  const birKare = async () => {
    if (kare) return;
    kare = true;
    await kareAl(id);
  };
  switch (id) {
    case 'kac-elma':
      return bitene(page, id, async () => {
        const elma = page.locator('.ok-agac .ok-elma:not([data-sayildi])');
        if ((await adimda(page, 'say')) && (await elma.count())) {
          await birKare();
          await tikla(elma);
        } else if (await gorunur(page.locator('.ok-cevap[data-dogru="1"]'))) {
          // bir kez yanlış cevap: ceza yok, Mino birlikte sayar
          const yanlis = page.locator('.ok-cevap:not([data-dogru])').first();
          if (!(await page.locator('.ok-etkinlik').getAttribute('data-denendi', KISA))) {
            await page.locator('.ok-etkinlik').evaluate((e) => e.setAttribute('data-denendi', '1'));
            await yanlis.click();
            await expect(page.locator('.ok-cevap.ok-dogru')).toHaveCount(0);
            await page.waitForTimeout(400);
          }
          await tikla(page.locator('.ok-cevap[data-dogru="1"]'));
        }
      });
    case 'sayi-karti':
      return bitene(page, id, async () => {
        if (!(await adimda(page, 'surukle'))) return;
        await birKare();
        const kart = page.locator('.ok-etiket:not([data-yapisti])').first();
        if (!(await kart.count())) return;
        const n = await kart.getAttribute('data-sayi', KISA);
        await surukle(page, kart, page.locator(`.ok-e2-sepet[data-hedef-sayi="${n}"]`));
        await page.waitForTimeout(150);
      });
    case 'sepete-koy':
      return bitene(page, id, async () => {
        if (!(await adimda(page, 'surukle'))) return;
        await birKare();
        const sepet = page.locator('.ok-e3-sepet');
        const istenen = Number(await sepet.getAttribute('data-istenen', KISA));
        const adet = Number((await sepet.getAttribute('data-adet', KISA)) ?? 0);
        if (adet < istenen) await surukle(page, page.locator('.ok-havuc:not([data-sepette])').first(), sepet);
        else await tikla(page.locator('.ok-ver'));
        await page.waitForTimeout(120);
      });
    case 'hangisinde-cok':
      return bitene(page, id, async () => {
        if (!(await adimda(page, 'sec'))) return;
        await birKare();
        await tikla(page.locator('[data-dogru="1"]'));
        await page.waitForTimeout(150);
      });
    case 'bir-fazla':
      return bitene(page, id, async () => {
        if (!(await adimda(page, 'surukle'))) return;
        const k = page.locator('.ok-e5 [data-surukle]');
        if (!(await k.count())) return;
        await birKare();
        await surukle(page, k, page.locator('.ok-e5 [data-hedef]'));
        await page.waitForTimeout(150);
      });
    case 'merdiven':
      return bitene(page, id, async () => {
        if (!(await adimda(page, 'surukle'))) return;
        const r = page.locator('.ok-dusen:not([data-yerinde])').first();
        if (!(await r.count())) return;
        await birKare();
        const n = await r.getAttribute('data-sayi', KISA);
        await surukle(page, r, page.locator(`.ok-basamak[data-basamak="${n}"]`));
        await page.waitForTimeout(120);
      });
    case 'kac-alkis':
      return bitene(page, id, async () => {
        if (!(await adimda(page, 'alkis'))) return;
        await birKare();
        const e = ekran(page);
        const hedef = Number(await e.getAttribute('data-hedef', KISA));
        const n = Number((await e.getAttribute('data-alkis', KISA)) ?? 0);
        // davula dokunma (alkışın dokunma karşılığı)
        if (n < hedef) await tikla(page.locator('.ok-davul'));
      });
    case 'rakam-ciz':
      return bitene(page, id, async () => {
        if (!(await adimda(page, 'ciz'))) return;
        const kagit = page.locator('.ok-kagit:not(.ok-canli)');
        if (!(await kagit.count())) return;
        await birKare();
        const tur = await ekran(page).getAttribute('data-tur', KISA);
        const yollar = JSON.parse((await kagit.getAttribute('data-yol', KISA))!) as [number, number][][];
        const r = (await page.locator('.ok-cizim-svg').boundingBox())!;
        for (const y of yollar) {
          await page.mouse.move(r.x + y[0][0] * r.width, r.y + y[0][1] * r.height);
          await page.mouse.down();
          for (const [x, yy] of y.slice(1)) await page.mouse.move(r.x + x * r.width, r.y + yy * r.height, { steps: 2 });
          await page.mouse.up();
          await page.waitForTimeout(60);
        }
        await expect.poll(async () => (await page.locator('.ok-sonuc').count()) > 0 || (await ekran(page).getAttribute('data-tur', KISA)) !== tur, { timeout: 15000 }).toBe(true);
      });
    case 'kuslar':
      return bitene(page, id, async () => {
        if (!(await adimda(page, 'kart'))) return;
        await birKare();
        // kuşlara dokunarak say (kelebek sayılmaz)
        if (!(await gorunur(page.locator('.ok-cevap[data-dogru="1"]')))) return;
        for (const k of await page.locator('.ok-e9-kus:not(.ok-uctu):not([data-sayildi])').all()) await tikla(k);
        await tikla(page.locator('.ok-cevap[data-dogru="1"]'));
        await page.waitForTimeout(100);
      });
    case 'piknik':
      return bitene(page, id, async () => {
        if (await adimda(page, 'kart')) {
          await birKare();
          await tikla(page.locator('.ok-cevap[data-dogru="1"]'));
        } else if (await adimda(page, 'tabak')) {
          const t = page.locator('.ok-p-yigin .ok-p-tabak-dugme:not([data-konuldu])').first();
          const yer = page.locator('.ok-p-yer:not([data-tabak])').first();
          if ((await t.count()) && (await yer.count())) await surukle(page, t, yer);
        } else if (await adimda(page, 'elma')) {
          const yerler = await page.locator('.ok-p-yer').all();
          for (const y of yerler) {
            if ((await y.locator('.ok-p-elma').count()) >= 2) continue;
            const e = page.locator('.ok-p-yigin .ok-p-elma:not([data-konuldu])').first();
            if (await e.count()) await surukle(page, e, y);
            break;
          }
        } else if (await adimda(page, 'kim')) {
          if (!(await gorunur(page.locator('.ok-p-kim[data-dogru="1"]')))) return;
          await kareAl('piknik-kim');
          await tikla(page.locator('.ok-p-kim[data-dogru="1"]'));
        }
        await page.waitForTimeout(100);
      });
  }
}

/** Sonuç ekranı: çıkartma albüme sürüklenerek yapıştırılır; sonra sıradaki durak (ya da bölge) */
async function sonuc(page: Page, id: string, kareAl: (ad: string) => Promise<void>): Promise<boolean> {
  const s = page.locator('.ok-sonuc');
  await expect(s).toHaveAttribute('data-etkinlik', id);
  await expect(s).toHaveAttribute('data-durum', 'yapistir', { timeout: 10000 });
  const c = page.locator('.ok-yeni-cikartma');
  await expect(c).toBeVisible();
  const yuva = page.locator(`.ok-yuva[data-yuva="${id}"]`);
  await surukle(page, c, yuva);
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

for (const yas of [3, 6]) {
  test(`Okula Hazırım: ${yas} yaşla Sayı Bahçesi baştan sona dokunarak`, async ({ page }, info) => {
    test.setTimeout(480_000);
    const hatalar = hataTopla(page);
    const kareAl = async (ad: string) => {
      if (info.project.name !== 'iphone' && yas === 6 && !['harita', 'bolge', 'rozet'].includes(ad)) return;
      // görseller yüklensin, giriş animasyonları bitsin
      await page.waitForFunction(() => [...document.images].every((i) => i.complete));
      await page.waitForTimeout(500);
      await page.screenshot({ path: `tests/screens/okul-${info.project.name}-${yas}-${ad}.png` });
    };
    await page.goto(`./okul/?test=1&sifirla=1&yas=${yas}&tohum=${yas * 7}`);
    // Okul Yolu: Sayı Bahçesi açık, Ses Kulesi ve Kelime Köprüsü yakında (kilitli)
    await expect(page.locator('.ok-harita .ok-bolge-kart')).toHaveCount(3);
    await expect(page.locator('.ok-bolge-kart[data-bolge="ses"] .ok-yakinda')).toBeVisible();
    await expect(page.locator('.ok-bolge-kart[data-bolge="kelime"] .ok-yakinda')).toBeVisible();
    await page.locator('.ok-bolge-kart[data-bolge="ses"]').click();
    await expect(page.locator('.ok-harita')).toBeVisible();
    await kareAl('harita');
    await page.locator('.ok-bolge-kart[data-bolge="sayi"]').click();

    // Sayı Bahçesi: 10 durak, önerilen ilki; Kuşlar geldi! yalnız 5-6 yaş
    await expect(page.locator('.ok-durak')).toHaveCount(10);
    await expect(page.locator('.ok-durak[data-etkinlik="kac-elma"]')).toHaveAttribute('data-durum', 'oneri');
    const kuslar = page.locator('.ok-durak[data-etkinlik="kuslar"]');
    if (yas < 5) {
      await expect(kuslar).toHaveAttribute('data-durum', 'buyuk');
      await kuslar.click();
      await expect(page.locator('.ok-bolge')).toBeVisible();
    } else await expect(kuslar).not.toHaveAttribute('data-durum', 'buyuk');
    await kareAl('bolge');

    await page.locator('.ok-durak[data-etkinlik="kac-elma"]').click();
    const oynanacak = SIRA.filter((id) => yas >= 5 || id !== 'kuslar');
    for (const id of oynanacak) {
      await oyna(page, id, kareAl);
      // Kino'nun hata anı her etkinlikte (Kino komik hatayı yapar, çocuk düzeltir)
      await expect(page.locator('.ok-sonuc')).toBeVisible();
      const devam = await sonuc(page, id, kareAl);
      if (id !== oynanacak[oynanacak.length - 1]) expect(devam, id).toBe(true);
    }

    // bölge bitti: duraklar parlıyor, rozet kazanıldı, kayıt cihazda
    await expect(page.locator('.ok-bolge')).toBeVisible();
    await expect(page.locator('.ok-durak[data-durum="bitti"]')).toHaveCount(oynanacak.length);
    await expect(page.locator('.ok-bahce-rozet')).toBeVisible();
    const kayit = await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-okul-v1') ?? '{}'));
    expect(kayit.biten).toEqual(oynanacak);
    expect(kayit.cikartma).toEqual(oynanacak);
    expect(kayit.rozet).toEqual(['sayi']);
    await kareAl('bolge-bitti');
    expect(hatalar).toEqual([]);
  });
}

test('Okula Hazırım: Kino her etkinlikte hata yapar; 2 yanlıştan sonra ipucu parlar', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./okul/?test=1&sifirla=1&yas=4&tohum=3&etkinlik=hangisinde-cok');
  await expect(page.locator('.ok-etkinlik[data-adim="sec"]')).toBeVisible();
  await expect(page.locator('.ok-etkinlik')).toHaveAttribute('data-kino-hata', '1');
  const yanlis = page.locator('.ok-tabak:not([data-dogru]), .ok-esit:not([data-dogru])').first();
  await yanlis.click();
  await expect(page.locator('.ok-ipucu')).toHaveCount(0);
  await page.waitForTimeout(500);
  await yanlis.click();
  await expect(page.locator('[data-dogru="1"].ok-ipucu')).toBeVisible();
  expect(hatalar).toEqual([]);
});

test('Okula Hazırım: yatay telefonda ekranlar sığıyor, geri düğmeleri', async ({ page }, info) => {
  test.skip(info.project.name !== 'iphone', 'yalnız telefon');
  const hatalar = hataTopla(page);
  await page.setViewportSize({ width: 844, height: 390 });
  const tasmaYok = async () => {
    for (const el of await page.locator('.ok-etkinlik .ok-alan > *, .ok-secim > *, .ok-mino-yer, .ok-kino-yer, .ok-durak, .ok-bolge-kart').all()) {
      if (!(await el.isVisible())) continue;
      const k = (await el.boundingBox())!;
      expect(k.x).toBeGreaterThanOrEqual(-2);
      expect(k.x + k.width).toBeLessThanOrEqual(846);
      expect(k.y + k.height).toBeLessThanOrEqual(392);
    }
  };
  await page.goto('./okul/?test=1&sifirla=1&yas=6');
  await expect(page.locator('.ok-bolge-kart')).toHaveCount(3);
  await tasmaYok();
  await page.screenshot({ path: 'tests/screens/okul-yatay-harita.png' });
  for (const id of ['kac-elma', 'sepete-koy', 'piknik']) {
    await page.goto(`./okul/?test=1&yas=6&tohum=4&etkinlik=${id}`);
    await expect(page.locator('.ok-etkinlik[data-adim]:not([data-adim="kino-hata"])')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(300);
    await tasmaYok();
    await page.screenshot({ path: `tests/screens/okul-yatay-${id}.png` });
  }
  // etkinlikten geri: bölgeye; bölgeden geri: Okul Yolu
  await page.getByRole('button', { name: 'Geri', exact: true }).click();
  await expect(page.locator('.ok-bolge')).toBeVisible();
  await page.getByRole('button', { name: 'Harita', exact: true }).click();
  await expect(page.locator('.ok-harita')).toBeVisible();
  expect(hatalar).toEqual([]);
});
