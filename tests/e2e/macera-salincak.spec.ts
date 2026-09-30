/**
 * Sesli Maceralar: Salıncak Kimin? — dokunarak baştan sona (3 ve 6 yaş), konsol hatası yok.
 * Oyun her görevde sahneye data-sl-gorev (ve gerekirse data-sl-hedef, data-sl-pencere, data-sl-hazir) yazar; test onu
 * okuyup parmakla oynar (mikrofonsuz: her sesli görevin dokunma karşılığı).
 * Kareler: tests/screens/salincak-<proje>-<yaş>yas-<ad>.png (git'e girmez). Telefonda (iphone) yatay 844×390 da oynanır.
 */
import { expect, test, type Locator, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

const SAHNE = '.sl-sahne';

async function merkez(l: Locator, ox = 0.5, oy = 0.5) {
  const k = (await l.boundingBox())!;
  return { x: k.x + k.width * ox, y: k.y + k.height * oy, k };
}
/** Kamera kayarken ölçülen yer eskir: kutu iki ölçümde aynı kalana kadar bekle */
async function sabit(l: Locator) {
  let once = await l.boundingBox();
  for (let i = 0; i < 30; i++) {
    await l.page().waitForTimeout(90);
    const simdi = await l.boundingBox();
    if (once && simdi && Math.abs(once.x - simdi.x) < 1.5 && Math.abs(once.y - simdi.y) < 1.5) return;
    once = simdi;
  }
}
async function gorev(page: Page) {
  return (await page.locator(SAHNE).getAttribute('data-sl-gorev')) ?? '';
}
async function veri(page: Page, ad: string) {
  return (await page.locator(SAHNE).getAttribute(`data-sl-${ad}`)) ?? '';
}
async function gorevBekle(page: Page, adlar: string[], ms = 40000) {
  await expect.poll(() => gorev(page), { timeout: ms }).toMatch(new RegExp(`^(${adlar.join('|')})$`));
  return gorev(page);
}
const el = (page: Page, ad: string) => page.locator(`[data-el="${ad}"]`).first();

/** Salıncağın dokunma alanına dokun (alan salınımla gider: anlık yeri) */
async function salincagaDokun(page: Page, ad = 'salincak') {
  const m = await merkez(el(page, ad), 0.5, 0.55);
  await page.mouse.click(m.x, m.y);
}

async function oyna(page: Page, yas: number, ekran: (ad: string) => Promise<unknown>, T = 40000) {
  const bekle = (ms: number) => page.waitForTimeout(ms);

  // 1. ters binen Kino: parmakla çevir (önce tek dokunuş: "Hı?"), sonra "Hop!" (dokun; 5-6 yaş halka parlayınca)
  await gorevBekle(page, ['cevir'], T);
  await bekle(300);
  await ekran('1-ters');
  {
    const k = el(page, 'salincak');
    await sabit(k);
    let m = await merkez(k, 0.5, 0.5);
    await page.mouse.click(m.x, m.y);
    await bekle(300);
    m = await merkez(k, 0.5, 0.5);
    await page.mouse.move(m.x - 30, m.y);
    await page.mouse.down();
    for (let i = 1; i <= 10; i++) await page.mouse.move(m.x - 30 + i * 12, m.y - Math.sin(i / 3) * 25);
    await page.mouse.up();
  }
  await gorevBekle(page, ['hop'], T);
  await bekle(300);
  await ekran('1b-hop');
  for (let i = 0; i < 60 && (await gorev(page)) === 'hop'; i++) {
    if (yas >= 5) await expect.poll(() => veri(page, 'pencere'), { timeout: 8000 }).toBe('1').catch(() => undefined);
    if ((await gorev(page)) !== 'hop') break;
    await salincagaDokun(page);
    if (i === 2) await ekran('1c-sallaniyor');
    await bekle(yas >= 5 ? 350 : 250);
  }

  // 2. say: salıncak her gelişinde dokun (sayılmaya hazırken)
  await gorevBekle(page, ['say'], T);
  await bekle(300);
  await ekran('2-say');
  const hedefSayi = Number(await veri(page, 'hedef'));
  expect(hedefSayi).toBe(yas <= 4 ? 5 : 10);
  // salıncak gelmeden bir kez (sayılmaz; Can'ın parmağı havada)
  for (let i = 0; i < 80 && (await gorev(page)) === 'say'; i++) {
    await expect.poll(() => veri(page, 'hazir'), { timeout: 8000 }).toBe('1').catch(() => undefined);
    if ((await gorev(page)) !== 'say') break;
    await salincagaDokun(page);
    if (i === 3) await ekran('2b-sayiyor');
    await bekle(150);
  }

  // 3. "Bir daha!": salıncağa basılı tut, dursun
  await gorevBekle(page, ['sus'], T);
  await bekle(300);
  await ekran('3-bir-daha');
  {
    const m = await merkez(el(page, 'salincak'), 0.5, 0.5);
    await page.mouse.move(m.x, m.y);
    await page.mouse.down();
    await expect.poll(() => gorev(page), { timeout: T }).not.toBe('sus');
    await page.mouse.up();
  }
  await bekle(1200);
  await ekran('3b-beklemek-zor');

  // 4. kaydırak: Kino'yu kaydırak boyunca aşağı çek (iki kayış)
  for (let k = 0; k < 2; k++) {
    await gorevBekle(page, ['kay'], T);
    await sabit(el(page, 'kino'));
    await bekle(200);
    if (k === 0) await ekran('4-kaydirak');
    const a = await merkez(el(page, 'kino'), 0.5, 0.6);
    const b = await merkez(el(page, 'kaydirak-son'));
    await page.mouse.move(a.x, a.y);
    await page.mouse.down();
    for (let i = 1; i <= 16; i++) {
      const t = i / 16;
      await page.mouse.move(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * Math.pow(t, 0.6));
      await bekle(30);
    }
    await page.mouse.up();
    await expect.poll(() => gorev(page), { timeout: T }).not.toBe('kay');
    if (k === 0) {
      await el(page, 'yigin').waitFor({ timeout: 8000 }).catch(() => undefined);
      await ekran('4b-kuma-gomuldu');
    }
  }

  // 5. nazlı Mino: önce sert kaydırma (fular Kino'ya uçar), sonra hafif dokunuşlar
  await gorevBekle(page, ['yavas'], T);
  await bekle(300);
  await ekran('5-mino');
  {
    const m = await merkez(el(page, 'salincak'), 0.5, 0.5);
    await page.mouse.move(m.x - 120, m.y);
    await page.mouse.down();
    await page.mouse.move(m.x + 160, m.y, { steps: 3 });
    await page.mouse.up();
    await bekle(700);
    await ekran('5b-fular');
  }
  for (let i = 0; i < 30 && (await gorev(page)) === 'yavas'; i++) {
    await salincagaDokun(page);
    await bekle(900);
  }

  // 6. Ege'nin sırası: sıkışan Kino'yu yukarı çek, sonra minicik dokun
  await gorevBekle(page, ['cek'], T);
  await bekle(400);
  await ekran('6-sikisti');
  {
    await sabit(el(page, 'bebek-salincak'));
    const m = await merkez(el(page, 'bebek-salincak'), 0.5, 0.45);
    await page.mouse.move(m.x, m.y);
    await page.mouse.down();
    for (let i = 1; i <= 12; i++) await page.mouse.move(m.x, m.y - i * 22);
    await page.mouse.up();
  }
  await gorevBekle(page, ['fisilti'], T);
  await bekle(300);
  await ekran('6b-ege');
  for (let i = 0; i < 30 && (await gorev(page)) === 'fisilti'; i++) {
    await salincagaDokun(page, 'bebek-salincak');
    await bekle(800);
  }

  // 7. iki salıncak birden: dize dinlenir, sonra iki kez dokunulur
  await gorevBekle(page, ['dinle', 'alkis'], T);
  await ekran('7-iki-salincak');
  let tur = 0;
  for (let i = 0; i < 400 && tur < (yas <= 4 ? 2 : 4); i++) {
    const g = await gorevBekle(page, ['alkis', 'dinle'], T);
    if (g === 'dinle') {
      await bekle(120);
      continue;
    }
    const hd = await veri(page, 'hedef');
    const n = Number(hd.split('/')[0]);
    expect(n).toBe(2);
    for (let j = 0; j < n; j++) {
      await salincagaDokun(page);
      await bekle(280);
    }
    if (tur === 0) await ekran('7b-alkis');
    await expect.poll(async () => (await gorev(page)) + (await veri(page, 'hedef')), { timeout: T }).not.toBe('alkis' + hd);
    tur++;
  }
  expect(tur).toBe(yas <= 4 ? 2 : 4);
  await expect(el(page, 'odul')).toBeVisible({ timeout: 60000 });
  await ekran('7c-sira-ustasi');
  await expect(page.locator('.mc-son')).toBeVisible({ timeout: 40000 });
  await bekle(400);
  await ekran('7d-son');
}

for (const yas of [3, 6]) {
  test(`Salıncak Kimin: dokunarak baştan sona (${yas} yaş)`, async ({ page }, info) => {
    test.setTimeout(420_000);
    const hatalar = hataTopla(page);
    await page.goto(`./macera/?test=1&ekran=bolum&yas=${yas}&bolum=salincak`);
    const p = info.project.name;
    try {
      await oyna(page, yas, (ad) => page.screenshot({ path: `tests/screens/salincak-${p}-${yas}yas-${ad}.png` }));
    } finally {
      if (hatalar.length) console.log('HATALAR', hatalar);
      await page.screenshot({ path: `tests/screens/salincak-${p}-${yas}yas-zz-son-durum.png` }).catch(() => undefined);
    }
    expect(hatalar).toEqual([]);
  });
}

for (const yas of [3, 6]) {
  test(`Salıncak Kimin: yatay telefon (844×390, ${yas} yaş)`, async ({ browser }, info) => {
    test.skip(info.project.name !== 'iphone', 'yatay yalnız telefon projesinde');
    test.setTimeout(420_000);
    const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'tr-TR', baseURL: info.project.use.baseURL });
    const page = await ctx.newPage();
    const hatalar = hataTopla(page);
    await page.goto(`./macera/?test=1&ekran=bolum&yas=${yas}&bolum=salincak`);
    try {
      await oyna(page, yas, (ad) => page.screenshot({ path: `tests/screens/salincak-yatay-${yas}yas-${ad}.png` }));
    } finally {
      await page.screenshot({ path: `tests/screens/salincak-yatay-${yas}yas-zz-son-durum.png` }).catch(() => undefined);
    }
    expect(hatalar).toEqual([]);
    await ctx.close();
  });
}

test('Salıncak Kimin: açılış kartı', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./macera/?test=1&yas=5');
  await expect(page.locator('.sl-bolum-kart')).toBeVisible();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `tests/screens/salincak-${info.project.name}-acilis.png` });
  await page.locator('.sl-bolum-kart').click();
  await expect(page.locator('.sl-sahne')).toBeVisible({ timeout: 15000 });
  expect(hatalar).toEqual([]);
});
