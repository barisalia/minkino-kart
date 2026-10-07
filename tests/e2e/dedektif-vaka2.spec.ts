/**
 * Dedektif Mino · Vaka 2 "Kino'nun Kayıp Atkısı" (/dedektif/): vaka seçimi (Vaka 1 çözülmeden kilitli), vaka baştan
 * sona (telefon ve tablet): mandal → kart (makas yanlış, rüzgâr doğru) → ördek izi + kırmızı iplik → ayak boyu (köpek
 * ve tavşan yanlış, ördek ayağı oturur) → renk izi (mavi ip Ada'yı gösterir, yaprak uçar, kırmızılar sırayla) → üç
 * çalı dinlenir → ses kartı (kurbağa kendi çalısına, ördek ördeğin çalısına) → çalı aralanır → olaylar sıralanır
 * (bir yanlış sekme) → atkı yumurtalara örtülür → üç dokunuşla çatlar → çizgi roman → Vaka Dosyam'da iki vaka.
 * Kareler: tests/screens/vaka2-*.png (git'e girmez).
 */
import { expect, test, type Locator, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

const adim = (page: Page) => page.locator('.dd-vaka').getAttribute('data-adim');
async function adimBekle(page: Page, beklenen: RegExp, timeout = 30_000) {
  await expect.poll(() => adim(page), { timeout }).toMatch(beklenen);
}
async function ortasi(l: Locator): Promise<[number, number]> {
  const b = (await l.boundingBox())!;
  return [b.x + b.width / 2, b.y + b.height / 2];
}
async function surukle(page: Page, kaynak: Locator, hedef: Locator) {
  const [x0, y0] = await ortasi(kaynak);
  const [x1, y1] = await ortasi(hedef);
  await page.mouse.move(x0, y0);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(x0 + ((x1 - x0) * i) / 10, y0 + ((y1 - y0) * i) / 10);
  await page.mouse.up();
}
async function ipucuBul(page: Page, id: string) {
  const ip = page.locator(`.dd-sahne [data-ipucu="${id}"]`);
  await expect(ip).toHaveCount(1);
  // mercek oraya gelir (kamera kayarken ıskalarsa çocuk gibi bir daha dener), görülen ipucuna dokunulur
  for (let d = 0; d < 6 && !(await ip.getAttribute('class'))?.includes('dd-alindi'); d++) {
    await page.waitForTimeout(250);
    const [x, y] = await ortasi(ip);
    await page.mouse.click(x, y);
  }
  await expect(ip).toHaveClass(/dd-alindi/);
}
/** Ekranda gerçekten o noktaya dokun (üstünde başka bir şey varsa dokunuş ona gider: örtme hatası yakalanır) */
async function dokun(page: Page, l: Locator) {
  await page.waitForTimeout(120);
  const [x, y] = await ortasi(l);
  await page.mouse.click(x, y);
}
/** Ekranda görünen (üst çubuğun altında, karakterlerin üstünde) ilk öğeye dokun; yoksa (zorunluysa) bekle */
async function gorunenDokun(page: Page, l: Locator, zorunlu = true) {
  const bitis = Date.now() + 10_000;
  do {
    const kutular = await l.evaluateAll((x) => x.map((e) => e.getBoundingClientRect().toJSON() as DOMRect));
    const v = page.viewportSize() ?? { width: 0, height: 0 };
    const g = kutular.find((b) => b.x + b.width / 2 > 20 && b.x + b.width / 2 < v.width - 20 && b.y > 70 && b.y + b.height < v.height - 4);
    if (g) {
      await page.mouse.click(g.x + g.width / 2, g.y + g.height / 2);
      return;
    }
    await page.waitForTimeout(200);
  } while (zorunlu && Date.now() < bitis);
  if (zorunlu) throw new Error('ekranda dokunulacak öğe yok');
}
const ekranAdi = (ad: string, proje: string) => `tests/screens/vaka2-${ad}${proje === 'iphone' ? '' : '-' + proje}.png`;

test('Dedektif Vaka 2: seçim ekranı, kilit, vaka baştan sona, çizgi roman, iki vakalı Vaka Dosyam', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  const p = info.project.name;
  // uzun vaka (beş halka + final + roman): yavaş makinede de yetsin
  test.setTimeout(300_000);
  // Vaka 1 çözülmeden Vaka 2 kilitli: dokununca açılmaz
  await page.goto('./dedektif/?test=1&sifirla=1');
  await expect(page.locator('.dd-klasor')).toHaveCount(2);
  await expect(page.locator('.dd-klasor[data-vaka="vaka2"]')).toHaveClass(/dd-kilitli/);
  await page.locator('.dd-klasor[data-vaka="vaka2"]').click();
  await page.waitForTimeout(300);
  await expect(page.locator('.dd-acilis')).toHaveCount(1);
  await page.screenshot({ path: ekranAdi('kilitli', p) });
  // Vaka 1 çözülünce açılır
  await page.goto('./dedektif/?test=1&sifirla=1&cozuldu=1');
  await expect(page.locator('.dd-klasor[data-vaka="vaka2"]')).not.toHaveClass(/dd-kilitli/);
  await expect(page.locator('.dd-klasor[data-vaka="vaka1"] .dd-muhur')).toBeVisible();
  await page.waitForTimeout(300);
  await page.screenshot({ path: ekranAdi('secim', p) });
  await page.locator('.dd-klasor[data-vaka="vaka2"]').click();

  // Halka 1: çimde mandal; makas yanlış (ip gösterilir), rüzgâr doğru
  await adimBekle(page, /^ara-ne$/);
  await expect(page.locator('.dd-vaka2 .dd-goz')).toHaveCount(5);
  await ipucuBul(page, 'mandal');
  await adimBekle(page, /^kart$/);
  await page.screenshot({ path: ekranAdi('halka1-kartlar', p) });
  await surukle(page, page.locator('.dd-kart[data-kart="makas"]'), page.locator('.dd-delil'));
  await expect(page.locator('.dd-kart[data-kart="makas"]')).toHaveClass(/dd-soluk/);
  await surukle(page, page.locator('.dd-kart[data-dogru="1"]'), page.locator('.dd-delil'));
  await adimBekle(page, /^(demek-ne|canlandir|ara-kim)$/);
  await expect(page.locator('.dd-goz[data-halka="ne"]')).toHaveClass(/dd-cozuldu/);

  // Halka 2: ördek izi + kırmızı iplik; ayak boyu: köpek patisi taşar, tavşan ayağı aşar (2 yanlış: ördek parlar)
  await adimBekle(page, /^ara-kim$/);
  await ipucuBul(page, 'ordek-izi');
  await ipucuBul(page, 'iplik');
  await adimBekle(page, /^kart$/);
  await surukle(page, page.locator('.dd-kart[data-kart="kopek-izi"]'), page.locator('.dd-delil'));
  await expect(page.locator('.dd-kart[data-kart="kopek-izi"]')).toHaveClass(/dd-soluk/);
  await surukle(page, page.locator('.dd-kart[data-kart="tavsan-izi"]'), page.locator('.dd-delil'));
  await expect(page.locator('.dd-kart[data-kart="tavsan-izi"]')).toHaveClass(/dd-soluk/);
  await expect(page.locator('.dd-kart[data-kart="ordek-izi"]')).toHaveClass(/dd-parla/);
  await page.screenshot({ path: ekranAdi('halka2-ayak', p) });
  await surukle(page, page.locator('.dd-kart[data-kart="ordek-izi"]'), page.locator('.dd-delil'));
  await adimBekle(page, /^(demek-kim|renk-izi)$/);

  // Halka 3: renk izi: önce mavi (Ada), bir yaprak, sonra kırmızılar
  await adimBekle(page, /^renk-izi$/);
  await expect(page.locator('.dd-sahne .dd-ada.acik')).toHaveCount(1);
  await page.screenshot({ path: ekranAdi('halka3-renk', p) });
  // yaprak uçup gider (bir şey olmaz)
  await gorunenDokun(page, page.locator('.dd-sahne .dd-parca[data-tur="yaprak"]'), false);
  const bitis = Date.now() + 60_000;
  let mavi = false;
  for (let n = 0; Date.now() < bitis && (await adim(page)) === 'renk-izi'; n++) {
    const k = page.locator('.dd-sahne .dd-parca[data-tur="kirmizi"]:not(.dd-alindi)');
    if (!(await k.count())) break;
    // birkaç kırmızıdan sonra ekranda bir mavi ip: kamera Ada'ya kayar, sonra geri döner
    if (n >= 2 && !mavi && (await k.count()) <= 4) {
      await gorunenDokun(page, page.locator('.dd-sahne .dd-parca[data-tur="mavi"]:not(.dd-soluk-parca)'), false);
      await page.waitForTimeout(100);
      // mavi soluklaştı: Ada gösterildi (test modunda kamera bir anda gidip döner)
      if (await page.locator('.dd-sahne .dd-parca.dd-soluk-parca').count()) {
        mavi = true;
        await adimBekle(page, /^renk-izi$/);
      }
    }
    // görünen ilk kırmızıya dokun (dikeyde kamera sıradakine kayar)
    await gorunenDokun(page, k, false);
    await page.waitForTimeout(150);
  }
  expect(mavi, 'mavi ip Ada\'yı gösterdi').toBe(true);
  await adimBekle(page, /^(demek-renk|ses-dinle)$/);
  await expect(page.locator('.dd-goz[data-halka="renk"]')).toHaveClass(/dd-cozuldu/);

  // Halka 4: üç çalıyı dinle (dikeyde kamera sıradakine kayar), sonra ördek kartı ördeğin çalısına
  await adimBekle(page, /^ses-dinle$/);
  for (let i = 0; i < 3; i++) {
    const c = page.locator(`.dd-sahne .dd-cali[data-cali="${i}"] .dd-cali-kopya`);
    await expect.poll(async () => {
      const b = await c.boundingBox();
      return !!b && b.x + b.width / 2 > 0 && b.x + b.width / 2 < (page.viewportSize()?.width ?? 0);
    }).toBe(true);
    await page.waitForTimeout(250);
    await dokun(page, c);
    await expect(page.locator(`.dd-sahne .dd-cali[data-cali="${i}"]`)).toHaveClass(/dinlendi/);
  }
  await adimBekle(page, /^(soru-ses|ses-kart)$/);
  await adimBekle(page, /^ses-kart$/);
  await expect(page.locator('.dd-cali-foto')).toHaveCount(3);
  await page.screenshot({ path: ekranAdi('halka4-ses', p) });
  // kurbağa ördeğin çalısına bırakılsa da kendi çalısına uçar (eşleşme gösterilir)
  await surukle(page, page.locator('.dd-ses-sorgu .dd-kart[data-kart="kurbaga"]'), page.locator('.dd-cali-foto[data-cali="2"]'));
  await expect(page.locator('.dd-ses-sorgu .dd-kart[data-kart="kurbaga"]')).toHaveClass(/dd-eslesti/);
  await surukle(page, page.locator('.dd-ses-sorgu .dd-kart[data-kart="ordek"]'), page.locator('.dd-cali-foto[data-cali="2"]'));
  await adimBekle(page, /^(demek-ses|arala)$/);
  // çalıyı kenara çek: Vakvak Anne yuvada
  await adimBekle(page, /^arala$/);
  await surukle(page, page.locator('.dd-sahne .dd-cali[data-cali="2"] .dd-cali-kopya'), page.locator('.dd-ust'));
  await adimBekle(page, /^(ordek|sen-mi|soru-sira|sira-kart)$/);
  await expect(page.locator('.dd-sahne .dd-ordek-dunya.acik')).toHaveCount(1);

  // Halka 5: sırala (önce bir yanlış: kart seker)
  await adimBekle(page, /^sira-kart$/);
  await page.screenshot({ path: ekranAdi('halka5-sira', p) });
  // (kareler sorgunun kendi kabında aranır: üç kare dolunca karelerin kopyası dosyaya uçar ve sorgu kapanır;
  // kopya .dd-ucan içinde, asıl kareler o sırada görünmez: ekranda tek dizi var)
  const kareSec = (i: number | string) => `.dd-sira-sorgu .dd-sira-kare[data-kare="${i}"]`;
  await surukle(page, page.locator('.dd-olay[data-olay="2"]'), page.locator(kareSec(0)));
  await page.waitForTimeout(200);
  await expect(page.locator('.dd-sira-sorgu .dd-sira-kare.dolu')).toHaveCount(0);
  for (const i of [0, 1, 2]) {
    const kare = page.locator(kareSec(i));
    // (önceki kart sekerken bırakılırsa oturmaz: çocuk gibi bir daha dener; tek ölçüm: sorgu kapanırken de doğru)
    const oturdu = () => page.evaluate((s) => document.querySelector(s)?.classList.contains('dolu') ?? true, kareSec(i));
    for (let d = 0; d < 3 && !(await oturdu()); d++) {
      await page.waitForTimeout(300);
      await surukle(page, page.locator(`.dd-olay[data-olay="${i}"]`), kare);
      await page.waitForTimeout(300);
    }
    expect(await oturdu()).toBe(true);
  }
  await adimBekle(page, /^(demek-sira|final|titriyor|atki-ort)$/);
  await expect(page.locator('.dd-goz.dd-cozuldu')).toHaveCount(5);

  // Final: atkıyı yumurtalara ört, üç kez dokun
  await adimBekle(page, /^atki-ort$/);
  await page.screenshot({ path: ekranAdi('final-titriyor', p) });
  for (let deneme = 0; deneme < 3 && (await adim(page)) === 'atki-ort' && (await page.locator('.dd-atki-tasi').count()); deneme++) {
    await page.waitForTimeout(300);
    await surukle(page, page.locator('.dd-atki-tasi'), page.locator('.dd-sahne .dd-yuva-kap'));
    await page.waitForTimeout(500);
  }
  await adimBekle(page, /^yumurta$/);
  for (let i = 0; i < 3; i++) await dokun(page, page.locator('.dd-sahne .dd-yuva-dokun'));
  await adimBekle(page, /^(yavrular|roman|bitti)$/);
  await expect(page.locator('.dd-sahne .dd-yavrular.acik')).toHaveCount(1);
  await page.waitForTimeout(200);
  await page.screenshot({ path: ekranAdi('final', p) });

  // Ödül: 4 kareli çizgi roman, mühür, kayıt
  await adimBekle(page, /^bitti$/, 40_000);
  await expect(page.locator('.dd-roman[data-vaka="vaka2"] .dd-kare.geldi')).toHaveCount(4);
  await expect(page.locator('.dd-roman .dd-muhur.bas')).toBeVisible();
  await page.waitForTimeout(400);
  await page.screenshot({ path: ekranAdi('roman', p) });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-dedektif-v1') ?? '{}').cozulen)).toEqual(['vaka1', 'vaka2']);
  // Vaka Dosyam: iki vaka, Vaka 2'nin romanı açılır
  await page.locator('.dd-rd-dosya').click();
  await expect(page.locator('.dd-vaka-kart.dd-cozulmus')).toHaveCount(2);
  await page.waitForTimeout(300);
  await page.screenshot({ path: ekranAdi('dosyam', p) });
  await page.locator('.dd-vaka-kart.dd-cozulmus[data-vaka="vaka2"]').click();
  await expect(page.locator('.dd-dosya-ekran .dd-roman[data-vaka="vaka2"] .dd-kare.geldi')).toHaveCount(4);
  expect(hatalar).toEqual([]);
});

test('Dedektif Vaka 2: yardım hiç takılmaz (10 sn Kino koklar; renk izinde sıradaki titrer)', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./dedektif/?test=1&sifirla=1&ekran=vaka2&adim=kim&kokla=1200');
  await adimBekle(page, /^ara-kim$/);
  await expect(page.locator('.bt-mercek:not(.bt-gizlendi)')).toHaveCount(1);
  expect(await page.locator('.dd-sahne [data-ipucu="ordek-izi"]').evaluate((e) => getComputedStyle(e).opacity)).toBe('0');
  await adimBekle(page, /^kokla-(ordek-izi|iplik)$/, 15_000);
  await adimBekle(page, /^ara-kim$/, 15_000);
  expect(hatalar).toEqual([]);
});

for (const [en, boy] of [
  [844, 390],
  [932, 430],
  [1024, 768],
  [390, 844],
] as const) {
  test(`Dedektif Vaka 2: ${en}×${boy} yerleşim (kartlar, çalılar, kareler, yuva ekranda)`, async ({ page }) => {
    test.skip(test.info().project.name !== 'iphone', 'bir kez yeter');
    const hatalar = hataTopla(page);
    await page.setViewportSize({ width: en, height: boy });
    const icinde = async (l: Locator, ad: string) => {
      for (const k of await l.evaluateAll((x) => x.map((e) => e.getBoundingClientRect().toJSON() as DOMRect))) {
        expect(k.x, `${ad} sol`).toBeGreaterThanOrEqual(-1);
        expect(k.y, `${ad} üst`).toBeGreaterThanOrEqual(-1);
        expect(k.x + k.width, `${ad} sağ`).toBeLessThanOrEqual(en + 1);
        expect(k.y + k.height, `${ad} alt`).toBeLessThanOrEqual(boy + 1);
      }
    };
    // seçim ekranı: iki dosya ekranda, üst üste binmez
    await page.goto('./dedektif/?test=1&sifirla=1&cozuldu=1');
    await icinde(page.locator('.dd-klasor'), 'dosya');
    const [a, b] = await page.locator('.dd-klasor').evaluateAll((x) => x.map((e) => e.getBoundingClientRect().toJSON() as DOMRect));
    expect(Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) > 4 && Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) > 4, 'dosyalar üst üste').toBe(false);
    await page.screenshot({ path: `tests/screens/vaka2-secim-${en}x${boy}.png` });
    // Halka 2: ayak kartları ve ipucu fotoğrafı
    await page.goto('./dedektif/?test=1&ekran=vaka2&adim=kim');
    await adimBekle(page, /^ara-kim$/);
    await icinde(page.locator('.dd-sahne [data-ipucu]'), 'ipucu');
    await ipucuBul(page, 'ordek-izi');
    await ipucuBul(page, 'iplik');
    await adimBekle(page, /^kart$/);
    await page.waitForTimeout(900);
    await icinde(page.locator('.dd-kart'), 'kart');
    await icinde(page.locator('.dd-delil'), 'delil');
    await icinde(page.locator('.dd-dosya'), 'dosya şeridi');
    await page.screenshot({ path: `tests/screens/vaka2-kart-${en}x${boy}.png` });
    // Halka 3: ilk kırmızı iplikler ekranda
    await page.goto('./dedektif/?test=1&ekran=vaka2&adim=renk');
    await adimBekle(page, /^renk-izi$/);
    const ilk = page.locator('.dd-sahne .dd-parca[data-tur="kirmizi"]').first();
    await icinde(ilk, 'ilk kırmızı');
    await page.screenshot({ path: `tests/screens/vaka2-renk-${en}x${boy}.png` });
    // Halka 4: dinlenen ilk çalı ekranda; soru katmanı ekranda
    await page.goto('./dedektif/?test=1&ekran=vaka2&adim=ses');
    await adimBekle(page, /^ses-dinle$/);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `tests/screens/vaka2-calilar-${en}x${boy}.png` });
    // Halka 5: kareler ve olay kartları ekranda
    await page.goto('./dedektif/?test=1&ekran=vaka2&adim=sira');
    await adimBekle(page, /^sira-kart$/);
    await icinde(page.locator('.dd-sira-kare'), 'kare');
    await icinde(page.locator('.dd-olay'), 'olay');
    await page.screenshot({ path: `tests/screens/vaka2-sira-${en}x${boy}.png` });
    // Final: yuva ve atkı ekranda
    await page.goto('./dedektif/?test=1&ekran=vaka2&adim=final');
    await adimBekle(page, /^atki-ort$/);
    await icinde(page.locator('.dd-sahne .dd-yuva-kap'), 'yuva');
    await icinde(page.locator('.dd-atki-tasi'), 'atkı');
    await page.screenshot({ path: `tests/screens/vaka2-final-${en}x${boy}.png` });
    expect(hatalar).toEqual([]);
  });
}

// web sitesinde telefonun yönü serbest: vakanın ortasında dönünce bahçe yeni yönün çizimine geçer, iş ekranda kalır
for (const [ad, bas, son] of [
  ['dikeyden yataya', { width: 390, height: 844 }, { width: 844, height: 390 }],
  ['yataydan dikeye', { width: 844, height: 390 }, { width: 390, height: 844 }],
  ['dikeyden geniş yataya', { width: 430, height: 932 }, { width: 932, height: 430 }],
] as const) {
  test(`Dedektif Vaka 2: telefon ${ad} dönünce (DPR 3) ipuçları, renk izi, çalılar ve atkı ekranda`, async ({ browser }, info) => {
    test.skip(info.project.name !== 'iphone', 'bir kez yeter');
    const ctx = await browser.newContext({ baseURL: info.project.use.baseURL, viewport: bas, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: 'tr-TR' });
    const page = await ctx.newPage();
    const hatalar = hataTopla(page);
    const don = async (b: { width: number; height: number }) => {
      await page.setViewportSize(b);
      await expect.poll(() => page.evaluate(() => innerWidth)).toBe(b.width);
      await page.waitForTimeout(400);
    };
    const ekranda = async (l: Locator, pay = 0) => {
      const [x, y] = await ortasi(l);
      const { width: w, height: hh } = page.viewportSize()!;
      expect(x, 'sol').toBeGreaterThan(pay);
      expect(x, 'sağ').toBeLessThan(w - pay);
      expect(y, 'üst').toBeGreaterThan(pay);
      expect(y, 'alt').toBeLessThan(hh - pay);
    };
    const git = async (a: string, bekle: RegExp) => {
      await page.setViewportSize(bas);
      await page.goto(`./dedektif/?test=1&sifirla=1&ekran=vaka2&adim=${a}`);
      await adimBekle(page, bekle);
      await don(son);
      // yataya dönünce Mino ile Kino bütünüyle ekranda (dikeyde kenara çekilmişlerdi; dikeyin kenar dizilişi bilerek yarı dışarıda)
      if (son.width > son.height)
        for (const s of ['.dd-mino-yer .mino', '.dd-kino-yer .dd-kino-kutu']) {
          const b = (await page.locator(s).boundingBox())!;
          expect(b.x, `${s} sol`).toBeGreaterThanOrEqual(-1);
          expect(b.x + b.width, `${s} sağ`).toBeLessThanOrEqual(son.width + 1);
        }
    };
    // Halka 1: mandal (bahçe yeni yönün çizimine geçti)
    await git('ne', /^ara-ne$/);
    const zemin = page.locator('.dd-sahne .dd-dunya[data-oda="bahce-ip"] img.dd-zemin');
    if (son.height > son.width) await expect(zemin).toHaveAttribute('src', /-dikey/);
    else await expect(zemin).not.toHaveAttribute('src', /-dikey/);
    await ekranda(page.locator('.dd-sahne [data-ipucu="mandal"]'), 15);
    await ipucuBul(page, 'mandal');
    // Halka 2: ördek izi ve kırmızı iplik
    await git('kim', /^ara-kim$/);
    for (const id of ['ordek-izi', 'iplik']) {
      await ekranda(page.locator(`.dd-sahne [data-ipucu="${id}"]`), 15);
      await ipucuBul(page, id);
    }
    await adimBekle(page, /^kart$/);
    // Halka 3: renk izi: ikisi bir yönde, kalanlar döndükten sonra (hep ekranda bir kırmızı var)
    await page.setViewportSize(bas);
    await page.goto('./dedektif/?test=1&sifirla=1&ekran=vaka2&adim=renk');
    await adimBekle(page, /^renk-izi$/);
    const kirmizi = page.locator('.dd-sahne .dd-parca[data-tur="kirmizi"]:not(.dd-alindi)');
    for (let n = 0; n < 2; n++) {
      await gorunenDokun(page, kirmizi);
      await page.waitForTimeout(150);
    }
    await don(son);
    for (let n = 0; n < 8 && (await adim(page)) === 'renk-izi' && (await kirmizi.count()); n++) {
      await gorunenDokun(page, kirmizi);
      await page.waitForTimeout(150);
    }
    await adimBekle(page, /^(demek-renk|ses-dinle)$/);
    // Halka 4: üç çalı (dönünce de ekranda; dar ekranda kamera sıradakine kayar)
    await git('ses', /^ses-dinle$/);
    for (let i = 0; i < 3; i++) {
      const c = page.locator(`.dd-sahne .dd-cali[data-cali="${i}"] .dd-cali-kopya`);
      await expect.poll(async () => {
        const b = await c.boundingBox();
        const v = page.viewportSize()!;
        return !!b && b.x + b.width / 2 > 0 && b.x + b.width / 2 < v.width && b.y + b.height / 2 > 0 && b.y + b.height / 2 < v.height;
      }).toBe(true);
      await page.waitForTimeout(250);
      await dokun(page, c);
      await expect(page.locator(`.dd-sahne .dd-cali[data-cali="${i}"]`)).toHaveClass(/dinlendi/);
    }
    await adimBekle(page, /^(soru-ses|ses-kart)$/);
    // Final: atkı ve yuva dönünce de ekranda; atkı yumurtalara örtülür
    await git('final', /^atki-ort$/);
    await page.waitForTimeout(300);
    await ekranda(page.locator('.dd-atki-tasi'));
    await ekranda(page.locator('.dd-sahne .dd-yuva-kap'));
    await page.screenshot({ path: `tests/screens/vaka2-donus-final-${son.width}x${son.height}.png` });
    for (let deneme = 0; deneme < 3 && (await adim(page)) === 'atki-ort'; deneme++) {
      await surukle(page, page.locator('.dd-atki-tasi'), page.locator('.dd-sahne .dd-yuva-kap'));
      await page.waitForTimeout(500);
    }
    await adimBekle(page, /^yumurta$/);
    expect(hatalar).toEqual([]);
    await ctx.close();
  });
}
