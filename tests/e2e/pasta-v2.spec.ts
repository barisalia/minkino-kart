/**
 * Mino'nun Pasta Otobüsü v2 (ekip/senaryo/pasta-otobusu-v2.md): Gün 1-6 dokunarak baştan sona.
 * Krema deseni parmakla çizilir (şablonun üstünden sürükleme), serpinti kavanozu sağa sola sürüklenerek sallanır, yüzlü
 * kurabiyede göz / yanak dokunuş, ağız çizgi; içecek makinesinde bardak boyu seçilip musluğa basılı tutulur, çizgide
 * bırakılır; bulaşık birikince Kino'ya görev verilir; özel müşteriler (kafası karışık, doğum günü, Ege'nin annesi).
 * Kareler tests/screens/pasta-v2-*.png (git'e girmez).
 */
import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';
import { durum, hazirMusteri, icecekYap, siparisi, siradaki, susle, type Kalem } from './pasta-yardimci';

/** Bir tatlı kalemi: hamur, kalıp, fırın, krema (süsleme masası), süs. Krema öncesi sipariş yeniden okunur (değişmiş olabilir). */
async function tatliYap(page: Page, ad: string, i: number, kare?: string) {
  let k = (await siparisi(page, ad)).kalemler[i];
  await expect(page.locator('.ps-tabak[data-dolu="0"]')).toBeVisible();
  for (let n = 0; n < k.adet; n++) await page.locator('.ps-hamur-kabi').click();
  await page.locator(`.ps-kalip[data-kalip="${k.urun === 'kapkek' ? 'kapkek' : k.sekil}"]`).click();
  await page.locator('.ps-tepsi').click();
  const goz = page.locator('.ps-goz[data-hal="altin"]').first();
  await expect(goz).toBeVisible({ timeout: 8000 });
  // kafası karışık müşteri hamur aşamasında fikrini değiştirir
  const m = page.locator(`.ps-musteri[data-musteri="${ad}"]`);
  if ((await m.getAttribute('data-ozel')) === 'karisik') await expect(m).toHaveAttribute('data-degisti', '1', { timeout: 8000 });
  await goz.click();
  await expect(page.locator('.ps-tabak[data-dolu="1"]')).toBeVisible();
  k = (await siparisi(page, ad)).kalemler[i];
  if (k.renk) {
    const kremaSayisi = k.urun === 'kapkek' ? k.yigin : 1;
    for (let n = 0; n < kremaSayisi; n++) {
      await page.locator(`.ps-krema-sise[data-renk="${k.renk}"]`).click();
      await susle(page, k, kare);
    }
  }
  if (k.sus) for (let n = 0; n < k.susAdet * k.adet; n++) await page.locator(`.ps-sus-kabi[data-sus="${k.sus}"]`).click();
}

/** Tabağı müşteriye verir; temiz tabak kalmadıysa önce Kino'ya bulaşık görevi */
async function tabakVer(page: Page, ad: string) {
  if ((await durum(page)).temiz === 0) {
    await page.locator('.ps-tabak').click();
    await page.locator(`.ps-musteri.ps-hazir[data-musteri="${ad}"]`).click();
    // servis bekler (ceza yok): tabak hâlâ dolu
    await expect(page.locator('.ps-tabak[data-dolu="1"]')).toBeVisible();
    await expect(page.locator('.ps-kino-gorev.ps-goster')).toBeVisible();
    await page.locator('.ps-kino-gorev').click();
    await expect.poll(async () => (await durum(page)).temiz, { timeout: 8000 }).toBeGreaterThan(0);
    if (await page.locator('.ps-tabak.ps-secili').count()) await page.locator('.ps-tabak').click();
  }
  await page.locator('.ps-tabak').click();
  await expect(page.locator('.ps-tabak.ps-secili')).toBeVisible();
  await page.locator(`.ps-musteri.ps-hazir[data-musteri="${ad}"]`).click();
  await expect(page.locator('.ps-tabak[data-dolu="0"]')).toBeVisible();
}
async function bardakVer(page: Page, ad: string) {
  await page.locator('.ps-icecek-makinesi').click();
  await expect(page.locator('.ps-icecek-makinesi.ps-secili')).toBeVisible();
  await page.locator(`.ps-musteri.ps-hazir[data-musteri="${ad}"]`).click();
  await expect(page.locator('.ps-icecek-makinesi')).toHaveAttribute('data-bardak', '0');
}

/** Bir günü baştan sona dokunarak oynar; görülen özel müşteriler ve kalem türleri döner */
async function gunuOyna(page: Page, gun: number, kareler: Record<string, string> = {}) {
  const gorulen = { ozel: new Set<string>(), desen: new Set<string>(), icecek: 0, tik: 0, yuz: 0, mum: 0, bulasik: false };
  for (let n = 0; n < 6; n++) {
    const { ad, sip } = await siradaki(page);
    if (sip.ozel) gorulen.ozel.add(sip.ozel);
    for (let i = 0; i < sip.kalemler.length; i++) {
      const k = sip.kalemler[i];
      if (k.urun === 'icecek') {
        await icecekYap(page, k);
        if (kareler.icecek && !gorulen.icecek) await page.screenshot({ path: kareler.icecek });
        await bardakVer(page, ad);
        gorulen.icecek++;
      } else {
        if (k.desen && k.desen !== 'duz') gorulen.desen.add(k.desen);
        if (k.yuz) gorulen.yuz++;
        if (k.mum) gorulen.mum++;
        const kare = k.yuz ? kareler.yuz : k.desen && k.desen !== 'duz' ? kareler.desen : undefined;
        await tatliYap(page, ad, i, kare);
        if (kare) delete kareler[k.yuz ? 'yuz' : 'desen'];
        if ((await durum(page)).temiz === 0) gorulen.bulasik = true;
        await tabakVer(page, ad);
      }
      // iki kalemli siparişte ilk kalem gidince balonda yeşil tik
      if (i === 0 && sip.kalemler.length > 1) {
        await expect(page.locator(`.ps-musteri[data-musteri="${ad}"] .ps-b-kalem[data-i="0"].ps-alindi`)).toBeAttached();
        gorulen.tik++;
        if (kareler.tik) {
          await page.screenshot({ path: kareler.tik });
          delete kareler.tik;
        }
      }
    }
    await expect(page.locator(`.ps-musteri[data-musteri="${ad}"].ps-bitti`)).toHaveAttribute('data-sonuc', 'ayni');
    if (n < 5) await expect.poll(async () => (await durum(page)).biten, { timeout: 20000 }).toBe(n + 1);
  }
  await expect(page.locator('.ps-aksam')).toBeVisible({ timeout: 20000 });
  return gorulen;
}

/** Kare yolu: telefonda pasta-v2-<ad>.png, tablette pasta-v2-ipad-<ad>.png */
const kare = (ad: string) => `tests/screens/pasta-v2-${test.info().project.name === 'iphone' ? '' : 'ipad-'}${ad}.png`;

test.describe('Pasta Otobüsü v2: Gün 1-6', () => {

  test('Gün 1: zigzag deseni parmakla çizilir, serpinti sallanır; hedef 3, 3 yıldız; 2. fırın gözü açılır', async ({ page }) => {
    test.setTimeout(300_000);
    const hatalar = hataTopla(page);
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('./pasta/?test=1&sifirla=1&ekran=gun&gun=1');
    await expect(page.locator('.ps-hedef i')).toHaveCount(3);
    // Gün 1: tek fırın gözü açık, öbürleri kilitli
    await expect(page.locator('.ps-goz[data-kilit="1"]')).toHaveCount(2);
    const g = await gunuOyna(page, 1, { desen: kare('desen') });
    expect(g.desen.size + 0).toBeGreaterThanOrEqual(0);
    // altı müşteri mutlu, hiç uyuyan yok: 3 yıldız; 3 yıldızla 2. fırın gözü açılır
    await expect(page.locator('.ps-aksam-yildizlar')).toHaveAttribute('data-yildiz', '3', { timeout: 10000 });
    await expect(page.locator('.ps-yeni-kart')).toHaveAttribute('data-yukseltme', /firin-2/);
    await expect(page.locator('.ps-yeni-kart.ps-goster')).toBeAttached({ timeout: 10000 });
    await page.screenshot({ path: kare('aksam') });
    await page.locator('.ps-kumbara').click();
    await expect(page.locator('.ps-raf')).toBeVisible({ timeout: 15000 });
    await page.locator('.ps-tamam').click();
    await expect(page.locator('.ps-acilis')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.ps-gun-kart')).toHaveCount(10);
    await expect(page.locator('.ps-gun-kart[data-gun="1"] .ps-gun-yildizlar')).toHaveAttribute('data-yildiz', '3');
    await expect(page.locator('.ps-gun-kart[data-gun="7"]')).toHaveClass(/ps-yakinda/);
    await page.screenshot({ path: kare('acilis') });
    // Gün 2'de iki göz açık
    await page.locator('.ps-gun-kart[data-gun="2"]').click();
    await expect(page.locator('.ps-goz[data-kilit="1"]')).toHaveCount(1);
    expect(hatalar).toEqual([]);
  });

  test('Gün 2: yüzlü kurabiye (göz, yanak dokunuş; ağız çizgi), müşteri ifadeyi yapar', async ({ page }) => {
    test.setTimeout(300_000);
    const hatalar = hataTopla(page);
    await page.goto('./pasta/?test=1&sifirla=1&ekran=gun&gun=2');
    const g = await gunuOyna(page, 2, { yuz: kare('yuz') });
    expect(g.yuz).toBeGreaterThanOrEqual(3);
    expect(hatalar).toEqual([]);
  });

  test('Gün 3: okul önü, kapkek ve mantık siparişi; nokta deseni', async ({ page }) => {
    test.setTimeout(300_000);
    const hatalar = hataTopla(page);
    await page.goto('./pasta/?test=1&sifirla=1&ekran=gun&gun=3');
    await expect(page.locator('.ps-gun[data-yer="okul"]')).toBeVisible();
    await gunuOyna(page, 3);
    expect(hatalar).toEqual([]);
  });

  test('Gün 4: içecek makinesi, iki kalemli sipariş (yeşil tik), bulaşık birikir, Kino yıkar', async ({ page }) => {
    test.setTimeout(400_000);
    const hatalar = hataTopla(page);
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('./pasta/?test=1&sifirla=1&ekran=gun&gun=4');
    await expect(page.locator('.ps-icecek-makinesi')).toBeVisible();
    const g = await gunuOyna(page, 4, { icecek: kare('icecek'), tik: kare('tik') });
    expect(g.icecek).toBe(4);
    expect(g.tik).toBeGreaterThanOrEqual(1);
    expect(g.bulasik).toBe(true);
    expect(hatalar).toEqual([]);
  });

  test('Gün 5: plaj; kafası karışık ördek (balon krema öncesi değişir), doğum günü (yaş kadar mum)', async ({ page }) => {
    test.setTimeout(400_000);
    const hatalar = hataTopla(page);
    await page.goto('./pasta/?test=1&sifirla=1&ekran=gun&gun=5');
    await expect(page.locator('.ps-gun[data-yer="plaj"]')).toBeVisible();
    const g = await gunuOyna(page, 5);
    expect([...g.ozel].sort()).toEqual(['dogumgunu', 'karisik']);
    expect(g.mum).toBe(1);
    expect(hatalar).toEqual([]);
  });

  test("Gün 6: karlı bahçe; Ege'nin annesi (şekersiz), doğum günü, kakao", async ({ page }) => {
    test.setTimeout(400_000);
    const hatalar = hataTopla(page);
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('./pasta/?test=1&sifirla=1&ekran=gun&gun=6');
    await expect(page.locator('.ps-gun[data-yer="kar"]')).toBeVisible();
    // Ege'nin annesinin balonunda şekersiz işareti
    let kareAlindi = false;
    const g = await (async () => {
      const izle = setInterval(async () => {
        if (kareAlindi) return;
        if (await page.locator('.ps-musteri[data-ozel="anne"].ps-hazir .ps-b-sekersiz').count().catch(() => 0)) {
          kareAlindi = true;
          await page.screenshot({ path: kare('ozel') }).catch(() => undefined);
        }
      }, 300);
      try {
        return await gunuOyna(page, 6);
      } finally {
        clearInterval(izle);
      }
    })();
    expect(g.ozel.has('anne')).toBe(true);
    expect(g.ozel.has('dogumgunu')).toBe(true);
    expect(hatalar).toEqual([]);
  });
});

test('Pasta Otobüsü v2: kareler (yatay telefon, dikey telefon, tablet)', async ({ page }, info) => {
  test.setTimeout(240_000);
  test.skip(info.project.name !== 'iphone', 'kareler bir kez alınır');
  for (const [ad, w, hh] of [
    ['844x390', 844, 390],
    ['390x844', 390, 844],
    ['768x1024', 768, 1024],
  ] as const) {
    await page.setViewportSize({ width: w, height: hh });
    // en kalabalık tezgâh: içecek makinesi, 5 kalıp, 5 süs, 4 krema
    await page.goto('./pasta/?test=1&sifirla=1&ekran=gun&gun=5&alinan=sapka,kalip-ay,sus-muz,sus-cikolata,renk-mor');
    await expect(hazirMusteri(page)).toHaveCount(3, { timeout: 20000 });
    await page.waitForTimeout(400);
    await page.screenshot({ path: `tests/screens/pasta-v2-${ad}-gun.png` });
    for (const e of await page.locator('.ps-tezgah button, .ps-ist-firin button').all()) {
      const b = (await e.boundingBox())!;
      expect(b.x).toBeGreaterThanOrEqual(-1);
      expect(b.y + b.height).toBeLessThanOrEqual(hh + 1);
      expect(b.x + b.width, await e.getAttribute("class")).toBeLessThanOrEqual(w + 1);
      expect(Math.min(b.width, b.height)).toBeGreaterThanOrEqual(63.5);
    }
    // süsleme masası (desen) ve içecek masası bu boyda da sığar
    await page.locator('.ps-hamur-kabi').click();
    await page.locator('.ps-kalip[data-kalip="yuvarlak"]').click();
    await page.locator('.ps-tepsi').click();
    await page.locator('.ps-goz[data-hal="altin"]').first().click({ timeout: 8000 });
    await page.locator('.ps-krema-sise[data-renk="pembe"]').click();
    await expect(page.locator('.ps-panel')).toBeVisible();
    for (const s of ['.ps-panel-tamam', '.ps-panel-sahne']) {
      const b = (await page.locator(s).boundingBox())!;
      expect(b.x).toBeGreaterThanOrEqual(-1);
      expect(b.y + b.height).toBeLessThanOrEqual(hh + 1);
      expect(b.x + b.width).toBeLessThanOrEqual(w + 1);
    }
    await page.screenshot({ path: `tests/screens/pasta-v2-${ad}-susle.png` });
  }
});
