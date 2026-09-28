/**
 * Sesli Maceralar: Elektrikler Kesildi! — dokunarak baştan sona (3-4 ve 5-6 yaş), konsol hatası yok.
 * Oyun her görevde sahneye data-el-gorev (ve gerekirse data-el-hedef) yazar; test onu okuyup parmakla oynar
 * (mikrofonsuz: her sesli görevin dokunma karşılığı). Kareler: tests/screens/elektrik-<proje>-<yaş>yas-<ad>.png
 * Telefonda (iphone projesi) yatay 844×390 da oynanır.
 */
import { expect, test, type Locator, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

const SAHNE = '.el-sahne';

async function merkez(l: Locator, ox = 0.5, oy = 0.5) {
  const k = (await l.boundingBox())!;
  return { x: k.x + k.width * ox, y: k.y + k.height * oy, k };
}
/** Kamera kayarken ölçülen yer eskir: kutu iki ölçümde aynı kalana kadar bekle */
async function sabit(l: Locator) {
  let once = await l.boundingBox();
  for (let i = 0; i < 30; i++) {
    await l.page().waitForTimeout(100);
    const simdi = await l.boundingBox();
    if (once && simdi && Math.abs(once.x - simdi.x) < 1 && Math.abs(once.y - simdi.y) < 1 && Math.abs(once.width - simdi.width) < 1) return;
    once = simdi;
  }
}
async function dokun(page: Page, l: Locator, ox = 0.5, oy = 0.5) {
  await sabit(l);
  const { x, y } = await merkez(l, ox, oy);
  await page.mouse.click(x, y);
}
async function surukle(page: Page, kaynak: Locator, hedef: Locator, adim = 14) {
  await sabit(kaynak);
  await sabit(hedef);
  const a = await merkez(kaynak);
  const b = await merkez(hedef);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  for (let i = 1; i <= adim; i++) await page.mouse.move(a.x + ((b.x - a.x) * i) / adim, a.y + ((b.y - a.y) * i) / adim);
  await page.mouse.up();
}
async function gorev(page: Page) {
  return (await page.locator(SAHNE).getAttribute('data-el-gorev')) ?? '';
}
async function hedef(page: Page) {
  return (await page.locator(SAHNE).getAttribute('data-el-hedef')) ?? '';
}
async function gorevBekle(page: Page, adlar: string[], ms = 30000) {
  await expect.poll(() => gorev(page), { timeout: ms }).toMatch(new RegExp(`^(${adlar.join('|')})$`));
  return gorev(page);
}
const el = (page: Page, ad: string) => page.locator(`[data-el="${ad}"]`).first();

async function oyna(page: Page, yas: number, ekran: (ad: string) => Promise<unknown>, T = 30000) {
  const bekle = (ms: number) => page.waitForTimeout(ms);

  // 1. Pıt! Kino masanın altında: örtüyü okşa (kulak → burun → çıkış)
  await gorevBekle(page, ['cagir'], T);
  await bekle(300);
  await ekran('1-pit');
  const masa = el(page, 'masa');
  for (let i = 0; i < 30 && (await gorev(page)) === 'cagir'; i++) {
    const m = await merkez(masa, 0.5, 0.45);
    await page.mouse.move(m.x - m.k.width * 0.3, m.y);
    await page.mouse.down();
    for (let j = 0; j <= 12; j++) await page.mouse.move(m.x + m.k.width * 0.3 * Math.cos(j * 0.8), m.y + 6 * Math.sin(j));
    await page.mouse.up();
    if (i === 0) await ekran('1b-oksa');
    await bekle(250);
  }

  // 2. çekmece: önce yanlış eşya (eldiven: Kino'nun şapkası), sonra fener (5-6: pil de)
  await gorevBekle(page, ['cekmece'], T);
  await bekle(400);
  await ekran('2-cekmece');
  await dokun(page, page.locator('[data-esya="eldiven"]'));
  await bekle(500);
  await ekran('2b-sapka');
  for (let i = 0; i < 12; i++) {
    const g = await gorevBekle(page, ['cekmece', 'dugme', 'pil', 'isik'], T);
    if (g === 'isik') break;
    await bekle(200);
    if (g === 'cekmece') await dokun(page, page.locator(`[data-esya="${await hedef(page)}"]`));
    else if (g === 'dugme') await dokun(page, page.locator('.el-yesya[data-esya="fener"]'), 0.5, 0.5);
    else await surukle(page, page.locator('[data-esya="pil"]'), page.locator('.el-yesya[data-esya="fener"]'));
    await expect.poll(() => gorev(page), { timeout: T }).not.toBe(g);
  }

  // 3. ışık lekesi: koltuk, masa, perde; sonra Kino
  await gorevBekle(page, ['isik'], T);
  await bekle(300);
  await ekran('3-isik');
  for (const yer of ['koltuk', 'masa', 'perde']) {
    await gorevBekle(page, ['isik'], T);
    const sayi = Number(await hedef(page));
    const h = el(page, `${yer}-hedef`);
    await sabit(h);
    let m = await merkez(h);
    const vp = page.viewportSize()!;
    if (m.y < 150) {
      // yatay telefonda perde çekimin üstünde: ışığı üst kenara götür, kamera kayar
      await page.mouse.move(vp.width * 0.28, vp.height * 0.5);
      await page.mouse.down();
      await page.mouse.move(vp.width * 0.28, 40, { steps: 8 });
      await expect.poll(async () => (await merkez(h)).y, { timeout: 8000 }).toBeGreaterThan(170);
      m = await merkez(h);
      await page.mouse.move(m.x, m.y, { steps: 6 });
    } else {
      await page.mouse.move(m.x, m.y);
      await page.mouse.down();
    }
    await bekle(T > 30000 ? 1500 : 400);
    await page.mouse.up();
    if (yer === 'koltuk') {
      await bekle(250);
      await ekran('3b-mino-ziplar');
    }
    // Mino zıplayıp dönene kadar bekle (sonraki hedef ancak o zaman sayılır)
    await expect.poll(async () => (await gorev(page)) === 'kino' || Number(await hedef(page)) > sayi, { timeout: T }).toBe(true);
  }
  await gorevBekle(page, ['kino'], T);
  {
    const m = await merkez(el(page, 'kino'), 0.5, 0.35);
    await page.mouse.move(m.x, m.y);
    await page.mouse.down();
    await bekle(T > 30000 ? 1500 : 400);
    await page.mouse.up();
  }
  await expect.poll(() => gorev(page), { timeout: T }).not.toBe('kino');
  await bekle(300);
  await ekran('3c-kino-guluyor');

  // 4. karanlığın sesleri: kulağa basılı tut (sessizlik), sesin geldiği yere dokun
  for (let tur = 0; tur < 3; tur++) {
    await gorevBekle(page, ['sessiz'], T);
    const k = await merkez(page.locator('.el-kulak-dugme'));
    await page.mouse.move(k.x, k.y);
    await page.mouse.down();
    if (tur === 0) {
      await bekle(300);
      await ekran('4-sessiz');
    }
    await expect.poll(() => gorev(page), { timeout: T }).not.toBe('sessiz');
    await page.mouse.up();
    await gorevBekle(page, ['bul'], T);
    const ad = await hedef(page);
    if (tur === 0) {
      // yanlış yere: "Burada yok"
      await dokun(page, el(page, 'koltuk'));
      await bekle(200);
    }
    await dokun(page, el(page, ad === 'kemik' ? 'kino' : ad), 0.5, 0.5);
    await expect.poll(() => gorev(page), { timeout: T }).not.toBe('bul');
    if (ad === 'kemik') {
      await bekle(500);
      await ekran('4b-benmisim');
    }
  }

  // 5. karşıdaki Can: işaret kadar fener düğmesine dokun (seri 1.4 sn sessizlikte biter; tutmazsa Can tekrarlar)
  await gorevBekle(page, ['alkis'], T);
  await ekran('5-can');
  for (let i = 0; i < 12; i++) {
    const g = await gorevBekle(page, ['alkis', 'sandalye'], T);
    if (g === 'sandalye') break;
    const n = Number(await hedef(page));
    const d = await merkez(el(page, 'fener-dugme'));
    for (let j = 0; j < n; j++) {
      await page.mouse.click(d.x, d.y);
      await bekle(160);
    }
    if (i === 1) await ekran('5b-can-selam');
    await bekle(2200);
  }

  // 6. çadır: sandalyeler, battaniye, mandallar, kamp şarkısı
  await gorevBekle(page, ['sandalye'], T);
  await bekle(300);
  await ekran('6-sandalye');
  await surukle(page, el(page, 'sandalye-1'), el(page, 'sandalye-yeri-1'));
  await bekle(300);
  await surukle(page, el(page, 'sandalye-2'), el(page, 'sandalye-yeri-2'));
  await gorevBekle(page, ['battaniye'], T);
  await surukle(page, el(page, 'battaniye'), el(page, 'cadir-yeri'));
  await gorevBekle(page, ['mandal'], T);
  await bekle(300);
  await dokun(page, el(page, 'mandal-1'));
  await bekle(600);
  await dokun(page, el(page, 'mandal-2'));
  // kamp şarkısı: önce dinlenir, sonra iki tur yankı (yastığa vur: 3-4 yaşta 3'er, 5-6 yaşta 4'er vuruş)
  await gorevBekle(page, ['sarki-dinle', 'sarki'], T);
  let tur = 0;
  for (let i = 0; i < 600 && tur < 2; i++) {
    const g = await gorevBekle(page, ['sarki', 'sarki-dinle'], T);
    if (g === 'sarki-dinle') {
      await bekle(150);
      continue;
    }
    const hd = await hedef(page);
    const n = Number(hd.split('/')[0]);
    expect(n).toBe(yas <= 4 ? 3 : 4);
    await sabit(el(page, 'yastik'));
    const y = await merkez(el(page, 'yastik'), 0.5, 0.35);
    for (let j = 0; j < n; j++) {
      await page.mouse.click(y.x, y.y);
      await bekle(300);
    }
    if (tur === 1) await ekran('6b-sarki');
    await expect.poll(async () => (await gorev(page)) + (await hedef(page)), { timeout: T }).not.toBe('sarki' + hd);
    tur++;
  }
  expect(tur).toBe(2);
  // çadır çöker: hayalet Kino (test hızında kısa sürer; yakalanırsa kare alınır)
  if (await el(page, 'cokuk').isVisible({ timeout: 0 }).catch(() => false) || (await el(page, 'cokuk').waitFor({ timeout: 8000 }).then(() => true).catch(() => false))) await ekran('6c-hayalet-kino');

  // 7. Geldiii! büyük düğme, feneri kapat, çekmeceye koy; Kino lambayı kapatır
  await gorevBekle(page, ['bagir'], T);
  await bekle(300);
  await ekran('7-geldi');
  await dokun(page, page.locator('.mc-buyuk-dugme'));
  await gorevBekle(page, ['kapat'], T);
  await dokun(page, el(page, 'fener'));
  await gorevBekle(page, ['koy'], T);
  await surukle(page, el(page, 'fener'), el(page, 'komodin'));
  await expect(el(page, 'odul')).toBeVisible({ timeout: 40000 });
  await ekran('7b-cesur-kino');
  await expect(page.locator('.mc-son')).toBeVisible({ timeout: 40000 });
  await bekle(400);
  await ekran('7c-son');
}

for (const yas of [3, 6]) {
  test(`Elektrikler Kesildi: dokunarak baştan sona (${yas} yaş)`, async ({ page }, info) => {
    test.setTimeout(300_000);
    const hatalar = hataTopla(page);
    await page.goto(`./macera/?test=1&ekran=bolum&yas=${yas}&bolum=elektrik`);
    const p = info.project.name;
    try {
      await oyna(page, yas, (ad) => page.screenshot({ path: `tests/screens/elektrik-${p}-${yas}yas-${ad}.png` }));
    } finally {
      if (hatalar.length) console.log('HATALAR', hatalar);
      await page.screenshot({ path: `tests/screens/elektrik-${p}-${yas}yas-zz-son-durum.png` }).catch(() => undefined);
    }
    expect(hatalar).toEqual([]);
  });
}

test('Elektrikler Kesildi: yatay telefon (844×390)', async ({ browser }, info) => {
  test.skip(info.project.name !== 'iphone', 'yatay yalnız telefon projesinde');
  test.setTimeout(300_000);
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'tr-TR', baseURL: info.project.use.baseURL });
  const page = await ctx.newPage();
  const hatalar = hataTopla(page);
  await page.goto('./macera/?test=1&ekran=bolum&yas=6&bolum=elektrik');
  await oyna(page, 6, (ad) => page.screenshot({ path: `tests/screens/elektrik-yatay-6yas-${ad}.png` }));
  expect(hatalar).toEqual([]);
  await ctx.close();
});

test('Elektrikler Kesildi: açılış kartı', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./macera/?test=1&yas=5');
  await expect(page.locator('.el-bolum-kart')).toBeVisible();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `tests/screens/elektrik-${info.project.name}-acilis.png` });
  await page.locator('.el-bolum-kart').click();
  await expect(page.locator('.el-sahne')).toBeVisible({ timeout: 15000 });
  expect(hatalar).toEqual([]);
});

test('Elektrikler Kesildi: gerçek hızda (kayıtlı şarkıyla)', async ({ page }, info) => {
  test.skip(!process.env.ELEKTRIK_GERCEK, 'yalnız ELEKTRIK_GERCEK=1 ile (uzun sürer)');
  test.setTimeout(900_000);
  const hatalar = hataTopla(page);
  await page.goto('./macera/?onizleme=1&ekran=bolum&yas=6&bolum=elektrik');
  const p = info.project.name;
  await oyna(page, 6, (ad) => page.screenshot({ path: `tests/screens/elektrik-gercek-${p}-${ad}.png` }), 90000);
  expect(hatalar).toEqual([]);
});
