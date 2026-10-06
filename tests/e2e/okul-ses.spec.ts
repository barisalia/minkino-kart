/**
 * Okula Hazırım! · Ses Kulesi (/okul/): Okul Yolu → Ses Kulesi → A odası baştan sona dokunarak (Sesin odası, İlk ses
 * avı, Harfi izle, Hangisi farklı?, Sesli kutu) → çıkartma albüme → N odası açılır. Kino her etkinlikte hata yapar;
 * yanlışa ceza yok. Ekran kareleri tests/screens/okul-ses-*.png (telefon), okul-ses-tablet-*.png.
 */
import { expect, test, type Locator, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

async function surukle(page: Page, kaynak: Locator, hedef: Locator) {
  const a = (await kaynak.boundingBox())!;
  const b = (await hedef.boundingBox())!;
  const x0 = a.x + a.width / 2;
  const y0 = a.y + a.height / 2;
  const x1 = b.x + b.width / 2;
  const y1 = b.y + b.height / 2;
  await page.mouse.move(x0, y0);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(x0 + ((x1 - x0) * i) / 10, y0 + ((y1 - y0) * i) / 10);
  await page.mouse.up();
}

const ekran = (page: Page) => page.locator('.ok-etkinlik');
const adimda = async (page: Page, adim: string) => (await page.locator(`.ok-etkinlik[data-adim="${adim}"]`).count()) > 0;
const etkinlikte = async (page: Page, ad: string) => (await page.locator(`.ok-etkinlik[data-ses-adim="${ad}"]`).count()) > 0;
const tikla = async (l: Locator) => {
  if ((await l.count()) && (await l.first().isVisible())) await l.first().click({ timeout: 2000, force: true }).catch(() => undefined);
};

/** Bir etkinlik (data-ses-adim) bitene kadar adim() tekrarlanır */
async function bitene(page: Page, ad: string, adim: () => Promise<void>) {
  const son = Date.now() + 90_000;
  while (Date.now() < son) {
    if (!(await etkinlikte(page, ad)) || (await page.locator('.ok-sonuc:not(.cikiyor)').count())) return;
    try {
      await adim();
    } catch {
      /* ekran değişti: yeniden bak */
    }
    await page.waitForTimeout(50);
  }
  throw new Error(`${ad} bitmedi`);
}

/** Harfin çizgilerini parmakla (fareyle) izler: hafif titrek, şablonun biraz yanından */
async function harfiIzle(page: Page, titrek = 0.025) {
  const kagit = page.locator('.ok-ses-kagit:not(.ok-ses-tamam)');
  const yollar = JSON.parse((await kagit.getAttribute('data-yol', { timeout: 1500 }))!) as [number, number][][];
  const r = (await page.locator('.ok-ses-iz-svg').boundingBox())!;
  for (const [j, y] of yollar.entries()) {
    const n = y.length === 1 ? [y[0], y[0]] : y;
    const k = (p: [number, number], i: number): [number, number] => [r.x + (p[0] + Math.sin(i + j) * titrek) * r.width, r.y + (p[1] + Math.cos(i * 1.3) * titrek) * r.height];
    await page.mouse.move(...k(n[0], 0));
    await page.mouse.down();
    // noktalar arasını da doldur (gerçek parmak gibi)
    for (let i = 1; i < n.length; i++) {
      const [a, b] = [n[i - 1], n[i]];
      const adim = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.05));
      for (let s = 1; s <= adim; s++) await page.mouse.move(...k([a[0] + ((b[0] - a[0]) * s) / adim, a[1] + ((b[1] - a[1]) * s) / adim], i * 10 + s));
    }
    await page.mouse.up();
    await page.waitForTimeout(60);
  }
}

async function odaOyna(page: Page, kare: (ad: string) => Promise<void>) {
  // 1 · Sesin odası: harfe ve iki resme dokun
  await expect(page.locator('.ok-etkinlik[data-adim="tanis-dokun"]')).toBeVisible({ timeout: 15000 });
  await kare('oda');
  await bitene(page, 'tanis', async () => {
    await tikla(page.locator('.ok-ses-tanis .ok-ses-levha'));
    await page.waitForTimeout(150);
    for (const k of await page.locator('.ok-ses-tanis .ok-ses-kart').all()) await tikla(k);
  });
  // 2 · İlk ses avı: 3 tur (ağaç, tren, balonlar); ilk turda bir kez yanlış (ceza yok)
  let yanlisDenendi = false;
  await bitene(page, 'av', async () => {
    if (!(await adimda(page, 'av'))) return;
    if (!yanlisDenendi) {
      yanlisDenendi = true;
      await kare('av');
      await page.locator('.ok-ses-av .ok-ses-kart:not([data-dogru])').first().click();
      await expect(page.locator('.ok-ses-kart.ok-dogru')).toHaveCount(0);
      await page.waitForTimeout(300);
    }
    await tikla(page.locator('.ok-ses-av .ok-ses-kart[data-dogru="1"]'));
    await page.waitForTimeout(200);
  });
  // 3 · Harfi izle: büyük, sonra küçük
  let izKare = false;
  await bitene(page, 'izle', async () => {
    if (!(await adimda(page, 'izle')) || !(await page.locator('.ok-ses-kagit:not(.ok-ses-tamam)').count())) return;
    if (!izKare) {
      izKare = true;
      await kare('izle');
    }
    const harf = await page.locator('.ok-ses-kagit').getAttribute('data-harf');
    await harfiIzle(page);
    await expect.poll(async () => !(await etkinlikte(page, 'izle')) || (await page.locator('.ok-ses-kagit.ok-ses-tamam').count()) > 0 || (await page.locator('.ok-ses-kagit').getAttribute('data-harf').catch(() => harf)) !== harf, { timeout: 15000 }).toBe(true);
  });
  // 4 · Hangisi farklı?
  await bitene(page, 'farkli', async () => {
    if (await adimda(page, 'farkli')) await tikla(page.locator('.ok-ses-tas[data-dogru="1"]'));
  });
  // 5 · Sesli kutu: bu sesle başlayanlar harfli sepete, ötekiler öbür sepete
  let kutuKare = false;
  await bitene(page, 'kutu', async () => {
    if (!(await adimda(page, 'kutu'))) return;
    const kart = page.locator('.ok-ses-kutu .ok-ses-kart:not([data-yerde])').first();
    if (!(await kart.count())) return;
    const sepet = (await kart.getAttribute('data-sepet'))!;
    await surukle(page, kart, page.locator(`.ok-ses-sepet[data-sepet="${sepet}"]`));
    await page.waitForTimeout(150);
    if (!kutuKare) {
      kutuKare = true;
      await kare('kutu');
    }
  });
}

test('Ses Kulesi: A odası baştan sona dokunarak, çıkartma, sonraki oda açılır', async ({ page }, info) => {
  test.setTimeout(240_000);
  const hatalar = hataTopla(page);
  const telefon = info.project.name === 'iphone';
  const kare = async (ad: string) => {
    await page.waitForFunction(() => [...document.images].every((i) => i.complete));
    await page.waitForTimeout(450);
    await page.screenshot({ path: `tests/screens/okul-ses-${telefon ? '' : 'tablet-'}${ad}.png` });
  };
  await page.goto('./okul/?test=1&sifirla=1&yas=5&tohum=3');
  await page.locator('.ok-bolge-kart[data-bolge="ses"]').click();
  // kule: A odası önerilen, N ve üstü sırayla kilitli
  await expect(page.locator('.ok-kule-ekran .ok-oda')).toHaveCount(6);
  await expect(page.locator('.ok-oda[data-oda="ses-a"]')).toHaveAttribute('data-durum', 'oneri');
  await expect(page.locator('.ok-oda[data-oda="ses-n"]')).toHaveAttribute('data-durum', 'kilitli');
  await page.locator('.ok-oda[data-oda="ses-n"]').click();
  await expect(page.locator('.ok-kule-ekran')).toBeVisible();
  await kare('kule');

  await page.locator('.ok-oda[data-oda="ses-a"]').click();
  await expect(ekran(page)).toHaveAttribute('data-etkinlik', 'ses-a');
  await odaOyna(page, kare);

  // sonuç: çıkartmayı (A'lı arı) albüme kendi eliyle yapıştırır
  const s = page.locator('.ok-sonuc');
  await expect(s).toHaveAttribute('data-durum', 'yapistir', { timeout: 15000 });
  const yuva = page.locator('.ok-yuva[data-yuva="ses-a"]');
  await surukle(page, page.locator('.ok-yeni-cikartma'), yuva);
  await expect(yuva).toHaveClass(/dolu/);
  await expect(s).toHaveAttribute('data-durum', 'bitti', { timeout: 10000 });
  await kare('sonuc');
  // sıradaki: N odası (artık açık)
  await page.locator('.ok-harita-dugme').click();
  await expect(page.locator('.ok-oda[data-oda="ses-a"]')).toHaveAttribute('data-durum', 'bitti');
  await expect(page.locator('.ok-oda[data-oda="ses-n"]')).toHaveAttribute('data-durum', 'oneri');
  const kayit = await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-okul-v1') ?? '{}'));
  expect(kayit.biten).toEqual(['ses-a']);
  expect(kayit.cikartma).toEqual(['ses-a']);
  expect(hatalar).toEqual([]);
});

test('Ses Kulesi: yarıda çıkınca kaldığı etkinlikten devam; 6 oda bitince Ses Dedektifi rozeti', async ({ page }, info) => {
  test.skip(info.project.name !== 'iphone', 'yalnız telefon');
  const hatalar = hataTopla(page);
  await page.goto('./okul/?test=1&sifirla=1&yas=4&tohum=5&etkinlik=ses-a');
  await expect(page.locator('.ok-etkinlik[data-adim="tanis-dokun"]')).toBeVisible({ timeout: 15000 });
  await bitene(page, 'tanis', async () => {
    await tikla(page.locator('.ok-ses-tanis .ok-ses-levha'));
    await page.waitForTimeout(150);
    for (const k of await page.locator('.ok-ses-tanis .ok-ses-kart').all()) await tikla(k);
  });
  await expect(page.locator('.ok-etkinlik[data-ses-adim="av"]')).toBeVisible();
  // geri → kule: A odasında "yarım" işareti; yeniden girince İlk ses avından başlar
  await page.getByRole('button', { name: 'Geri', exact: true }).click();
  await expect(page.locator('.ok-oda[data-oda="ses-a"] .ok-oda-yarim')).toBeVisible();
  await page.locator('.ok-oda[data-oda="ses-a"]').click();
  await expect(page.locator('.ok-etkinlik[data-ses-adim="av"]')).toBeVisible({ timeout: 10000 });

  // son oda (L): öncekiler bitmiş sayılır; bitince rozet töreni
  await page.goto('./okul/?test=1&yas=4&tohum=5&biten=ses-a,ses-n,ses-e,ses-t,ses-i&etkinlik=ses-l');
  await odaOyna(page, async () => undefined);
  const s = page.locator('.ok-sonuc');
  await expect(s).toHaveAttribute('data-durum', 'yapistir', { timeout: 15000 });
  await surukle(page, page.locator('.ok-yeni-cikartma'), page.locator('.ok-yuva[data-yuva="ses-l"]'));
  // rozet töreni test modunda çok kısa: sonunda Mino'nun göğsünde Ses Dedektifi rozeti
  await expect(s).toHaveAttribute('data-durum', 'bitti', { timeout: 10000 });
  await expect(page.locator('.ok-gogus-rozet').first()).toBeVisible();
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'tests/screens/okul-ses-rozet.png' });
  const kayit = await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-okul-v1') ?? '{}'));
  expect(kayit.rozet).toContain('ses');
  expect(hatalar).toEqual([]);
});

test('Ses Kulesi: son etkinlikten sonra şenlikte Geri\'ye basılırsa oda kaybolmaz; yeniden girince şenlik ve çıkartma', async ({ page }, info) => {
  test.skip(info.project.name !== 'iphone', 'yalnız telefon');
  const hatalar = hataTopla(page);
  // 5. etkinlik (Sesli kutu) doğrudan
  await page.goto('./okul/?test=1&sifirla=1&yas=4&tohum=5&etkinlik=ses-a&sesadim=4');
  await expect(page.locator('.ok-etkinlik[data-ses-adim="kutu"]')).toBeVisible({ timeout: 15000 });
  // şenlik ekrana gelir gelmez Geri (çocuk konfetiyi görünce çıkar)
  await page.evaluate(() => {
    new MutationObserver((_, o) => {
      if (!document.querySelector('.ok-ses-final-kap')) return;
      o.disconnect();
      document.querySelector<HTMLButtonElement>('.ok-etkinlik .ok-geri')?.click();
    }).observe(document.body, { childList: true, subtree: true });
  });
  await bitene(page, 'kutu', async () => {
    if (!(await adimda(page, 'kutu'))) return;
    const kart = page.locator('.ok-ses-kutu .ok-ses-kart:not([data-yerde])').first();
    if (!(await kart.count())) return;
    const sepet = (await kart.getAttribute('data-sepet'))!;
    await surukle(page, kart, page.locator(`.ok-ses-sepet[data-sepet="${sepet}"]`));
    await page.waitForTimeout(150);
  });
  // kuleye döndü: oda bitmiş sayılmadı ama "yarım" (beş etkinlik kayıtlı)
  await expect(page.locator('.ok-kule-ekran')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('.ok-oda[data-oda="ses-a"] .ok-oda-yarim')).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-okul-ses-v1') ?? '{}'))).toEqual({ 'ses-a': 5 });
  // yeniden girince (uygulamayı kapatıp açmış gibi; &sesadim olmadan) baştan değil: şenlik, sonra çıkartma
  await page.goto('./okul/?test=1&yas=4&tohum=5');
  await page.locator('.ok-bolge-kart[data-bolge="ses"]').click();
  await expect(page.locator('.ok-oda[data-oda="ses-a"] .ok-oda-yarim')).toBeVisible();
  await page.locator('.ok-oda[data-oda="ses-a"]').click();
  await expect(page.locator('.ok-sonuc')).toHaveAttribute('data-durum', 'yapistir', { timeout: 15000 });
  const kayit = await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-okul-v1') ?? '{}'));
  expect(kayit.biten).toEqual(['ses-a']);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-okul-ses-v1') ?? '{}'))).toEqual({});
  expect(hatalar).toEqual([]);
});

test('Ses Kulesi: yatay telefonda kule ve etkinlikler sığıyor', async ({ page }, info) => {
  test.skip(info.project.name !== 'iphone', 'yalnız telefon');
  const hatalar = hataTopla(page);
  for (const [w, h] of [
    [844, 390],
    [1024, 768],
  ]) {
    await page.setViewportSize({ width: w, height: h });
    const tasmaYok = async () => {
      for (const el of await page.locator('.ok-oda, .ok-ses-kart, .ok-ses-levha, .ok-ses-kagit, .ok-ses-tas, .ok-ses-sepet').all()) {
        if (!(await el.isVisible())) continue;
        const k = (await el.boundingBox())!;
        expect(k.x, await el.getAttribute('class')).toBeGreaterThanOrEqual(-4);
        expect(k.x + k.width).toBeLessThanOrEqual(w + 4);
        expect(k.y + k.height).toBeLessThanOrEqual(h + 4);
      }
    };
    await page.goto('./okul/?test=1&sifirla=1&yas=6&ekran=bolge&bolge=ses&biten=ses-a');
    await expect(page.locator('.ok-oda')).toHaveCount(6);
    await page.waitForTimeout(700);
    await tasmaYok();
    await page.screenshot({ path: `tests/screens/okul-ses-${w}x${h}-kule.png` });
    for (const [n, ad] of ['tanis', 'av', 'izle', 'farkli', 'kutu'].entries()) {
      await page.goto(`./okul/?test=1&yas=6&tohum=4&etkinlik=ses-a&sesadim=${n}`);
      await expect(page.locator(`.ok-etkinlik[data-ses-adim="${ad}"][data-adim]:not([data-adim="kino-hata"])`)).toBeVisible({ timeout: 10000 });
      await page.waitForTimeout(1300);
      await tasmaYok();
      await page.screenshot({ path: `tests/screens/okul-ses-${w}x${h}-${ad}.png` });
    }
  }
  expect(hatalar).toEqual([]);
});
