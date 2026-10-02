/**
 * Mino'nun Pasta Otobüsü (/pasta/): Gün 1'in 6 müşterisi dokunarak baştan sona; Gün 3'ün mantık siparişi
 * ("tavşanınkinden bir fazla çilek"); akşam kumbara ve dükkân rafı. Ekran kareleri tests/screens/pasta-*.png.
 */
import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

interface Kalem {
  urun: 'kurabiye' | 'kapkek';
  adet: number;
  sekil: string | null;
  renk: string;
  sus: string | null;
  susAdet: number;
  yigin: number;
}
interface Siparis {
  musteri: string;
  kalemler: Kalem[];
  mantik?: { kaynak: string; kalem: Kalem; fazla: number };
}

const hazirMusteri = (page: Page) => page.locator('.ps-musteri.ps-hazir:not(.ps-bitti)');

/** Sırada bekleyen ilk müşterinin siparişi (test modunda data-siparis) */
async function siradaki(page: Page): Promise<{ ad: string; sip: Siparis }> {
  await expect(hazirMusteri(page).first()).toBeVisible({ timeout: 15000 });
  // ad ve sipariş aynı elemandan, tek seferde (bu arada başka müşteri hazır olabilir)
  const [ad, veri] = await hazirMusteri(page).first().evaluate((e) => [e.getAttribute('data-musteri')!, e.getAttribute('data-siparis')!]);
  return { ad, sip: JSON.parse(veri) as Siparis };
}

/** Bir kalemi dokunarak yapar: hamur (adet kez), kalıp, tepsi → fırın, altında çıkar, krema, süs. Tabakta bırakır. */
async function kalemYap(page: Page, k: Kalem, o: { renk?: string } = {}) {
  await expect(page.locator('.ps-tabak[data-dolu="0"]')).toBeVisible();
  for (let i = 0; i < k.adet; i++) await page.locator('.ps-hamur-kabi').click();
  await expect(page.locator('.ps-tepsi-parca')).toHaveCount(k.adet);
  await page.locator(`.ps-kalip[data-kalip="${k.urun === 'kapkek' ? 'kapkek' : k.sekil}"]`).click();
  await expect(page.locator('.ps-tepsi')).toHaveAttribute('data-hazir', '1');
  await page.locator('.ps-tepsi').click();
  const goz = page.locator('.ps-goz[data-hal="altin"]').first();
  await expect(goz).toBeVisible({ timeout: 8000 });
  await goz.click();
  await expect(page.locator('.ps-tabak[data-dolu="1"]')).toBeVisible();
  const renk = o.renk ?? k.renk;
  const kremaSayisi = k.urun === 'kapkek' ? k.yigin : 1;
  for (let i = 0; i < kremaSayisi; i++) await page.locator(`.ps-krema-sise[data-renk="${renk}"]`).click();
  if (k.sus) for (let i = 0; i < k.susAdet * k.adet; i++) await page.locator(`.ps-sus-kabi[data-sus="${k.sus}"]`).click();
}

/** Tabağa sonra müşteriye dokunarak servis eder */
async function servisEt(page: Page, ad: string) {
  await page.locator('.ps-tabak').click();
  await expect(page.locator('.ps-tabak.ps-secili')).toBeVisible();
  await page.locator(`.ps-musteri.ps-hazir[data-musteri="${ad}"]`).click();
  await expect(page.locator('.ps-tabak[data-dolu="0"]')).toBeVisible();
}

const durum = async (page: Page) => JSON.parse((await page.locator('.ps-gun').getAttribute('data-durum')) ?? '{}') as { biten: number; bugun: number };

test('Pasta Otobüsü: açılış → Gün 1 (6 müşteri) dokunarak baştan sona → akşam kumbara ve raf', async ({ page }, info) => {
  test.setTimeout(240_000);
  const hatalar = hataTopla(page);
  await page.goto('./pasta/?test=1&sifirla=1');
  await expect(page.locator('.ps-logo')).toBeVisible();
  await expect(page.locator('.ps-gun-kart')).toHaveCount(3);
  await expect(page.locator('.ps-gun-kart[data-gun="2"]')).toHaveClass(/ps-kilitli/);
  await page.locator('.ps-gun-kart[data-gun="1"]').click();
  await expect(page.locator('.ps-gun[data-gun="1"]')).toBeVisible();

  // bütün dokunma alanları en az 64 px
  for (const s of ['.ps-hamur-kabi', '.ps-tepsi', '.ps-kalip', '.ps-goz', '.ps-krema-sise', '.ps-sus-kabi', '.ps-tabak', '.ps-kasa']) {
    for (const e of await page.locator(s).all()) {
      const b = (await e.boundingBox())!;
      expect(Math.min(b.width, b.height), s).toBeGreaterThanOrEqual(63.5);
    }
  }

  for (let n = 0; n < 6; n++) {
    const { ad, sip } = await siradaki(page);
    expect(sip.kalemler).toHaveLength(1);
    expect(sip.kalemler[0].adet).toBe(1);
    if (ad === 'ordek') expect(sip.kalemler[0].renk).toBe('sari');
    // ilk müşteride bilerek başka krema: ret yok, farklı olan parlar, 2 jeton
    const yanlis = n === 0 ? (sip.kalemler[0].renk === 'pembe' ? 'mavi' : 'pembe') : undefined;
    await kalemYap(page, sip.kalemler[0], { renk: yanlis });
    if (n === 0) await page.screenshot({ path: `tests/screens/pasta-${info.project.name}-calisma.png` });
    if (n === 1) {
      // ikinci müşteriye tabağı sürükleyerek
      const a = (await page.locator('.ps-tabak-ic').boundingBox())!;
      const b = (await page.locator(`.ps-musteri.ps-hazir[data-musteri="${ad}"]`).boundingBox())!;
      const [x0, y0, x1, y1] = [a.x + a.width / 2, a.y + a.height / 2, b.x + b.width / 2, b.y + b.height * 0.6];
      await page.mouse.move(x0, y0);
      await page.mouse.down();
      for (let i = 1; i <= 10; i++) await page.mouse.move(x0 + ((x1 - x0) * i) / 10, y0 + ((y1 - y0) * i) / 10);
      await page.mouse.up();
      await expect(page.locator('.ps-tabak[data-dolu="0"]')).toBeVisible();
    } else await servisEt(page, ad);
    const m = page.locator(`.ps-musteri[data-musteri="${ad}"].ps-bitti`);
    await expect(m).toHaveAttribute('data-sonuc', n === 0 ? 'farkli' : 'ayni');
    if (n === 0) {
      await expect(m.locator('.ps-fark[data-fark~="renk"]').first()).toBeAttached();
      await expect(m.locator('.ps-b-verilen')).toBeAttached();
    }
    // jetonlar tezgâha düşer; kasaya dokununca toplanır (son müşteride gün biter, kalanlar kendiliğinden toplanır)
    if (n < 5) {
      await expect(page.locator('.ps-jeton').first()).toBeVisible({ timeout: 8000 });
      await page.locator('.ps-kasa').click();
      await expect(page.locator('.ps-jeton')).toHaveCount(0, { timeout: 8000 });
      await expect.poll(async () => (await durum(page)).biten, { timeout: 15000 }).toBe(n + 1);
    }
  }
  // akşam: kumbara sayımı, raf
  await expect(page.locator('.ps-aksam')).toBeVisible({ timeout: 15000 });
  await page.locator('.ps-kumbara').click();
  await expect(page.locator('.ps-raf')).toBeVisible({ timeout: 15000 });
  // 1. müşteri 2 jeton (farklı), öbürleri 3 + 1 hızlı servis bahşişi: 2 + 5 × 4 = 22
  const jeton = await page.evaluate(() => (window as unknown as { __pasta: { kayit: { jeton: number } } }).__pasta.kayit.jeton);
  expect(jeton).toBe(22);
  await expect(page.locator('.ps-kumbara-sayi')).toHaveText('22');
  await page.screenshot({ path: `tests/screens/pasta-${info.project.name}-aksam.png` });
  // pastacı şapkası (5 jeton) alınır: Mino'nun kafasında
  await page.locator('.ps-raf-urun[data-raf="sapka"]').click();
  await expect(page.locator('.ps-raf-urun[data-raf="sapka"]')).toHaveClass(/ps-alindi/);
  await expect(page.locator('.ps-aksam .ps-mino-sapka')).toBeAttached();
  // pahalı boya (10) yetmiyorsa alınmaz
  await page.locator('.ps-tamam').click();
  await expect(page.locator('.ps-acilis')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('.ps-gun-kart[data-gun="2"]')).not.toHaveClass(/ps-kilitli/);
  await expect(page.locator('.ps-gun-kart[data-gun="1"]')).toHaveClass(/ps-biten/);
  // ilerleme kayıtlı: sayfa yeniden açılınca da
  await page.goto('./pasta/?test=1');
  await expect(page.locator('.ps-gun-kart[data-gun="2"]')).not.toHaveClass(/ps-kilitli/);
  expect(hatalar).toEqual([]);
});

test('Pasta Otobüsü: Gün 3 mantık siparişi (tavşanınkinden bir fazla çilek), kapkek ve ikili sipariş', async ({ page }) => {
  test.setTimeout(300_000);
  const hatalar = hataTopla(page);
  await page.goto('./pasta/?test=1&sifirla=1&ekran=gun&gun=3');
  await expect(page.locator('.ps-gun[data-gun="3"][data-yer="okul"]')).toBeVisible();
  const gorulen = new Map<string, Siparis>();
  let mantikGoruldu = false;
  for (let n = 0; n < 6; n++) {
    const { ad, sip } = await siradaki(page);
    for (const e of await page.locator('.ps-musteri[data-siparis]').all()) gorulen.set((await e.getAttribute('data-musteri'))!, JSON.parse((await e.getAttribute('data-siparis'))!) as Siparis);
    if (sip.mantik) {
      mantikGoruldu = true;
      expect(ad).toBe('ayi');
      // tavşan ayıdan önce gelir; ayı onun kurabiyesine bakar
      const tavsan = gorulen.get('tavsan');
      expect(tavsan).toBeTruthy();
      expect(sip.mantik.kaynak).toBe('tavsan');
      expect(sip.mantik.kalem).toEqual(tavsan!.kalemler[0]);
      const tavsanCilek = tavsan!.kalemler[0].susAdet;
      expect(tavsanCilek).toBeGreaterThan(0);
      // balonda tavşanın kurabiyesi ve +1 çilek
      const m = page.locator(`.ps-musteri[data-musteri="${ad}"]`);
      await expect(m.locator('.ps-b-mantik')).toBeVisible();
      await expect(m.locator('.ps-b-arti')).toHaveText('+1');
      expect(sip.kalemler[0].sus).toBe('cilek');
      expect(sip.kalemler[0].susAdet).toBe(tavsanCilek + 1);
      await page.screenshot({ path: `tests/screens/pasta-gun3-mantik.png` });
    }
    // çok kalemli siparişte her kalem ayrı servis edilir
    for (const k of sip.kalemler) {
      await kalemYap(page, k);
      await servisEt(page, ad);
    }
    await expect(page.locator(`.ps-musteri[data-musteri="${ad}"].ps-bitti`)).toHaveAttribute('data-sonuc', 'ayni');
    await expect.poll(async () => (await durum(page)).biten, { timeout: 15000 }).toBe(n + 1);
  }
  expect(mantikGoruldu).toBe(true);
  await expect(page.locator('.ps-aksam')).toBeVisible({ timeout: 15000 });
  expect(hatalar).toEqual([]);
});

test('Pasta Otobüsü: fırında yanan kurabiyeyi Kino yer, fazla süs kayar', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./pasta/?test=1&sifirla=1&ekran=gun&gun=2&firin=300,2500');
  await page.locator('.ps-hamur-kabi').click();
  await page.locator('.ps-kalip[data-kalip="kalp"]').click();
  await page.locator('.ps-tepsi').click();
  await expect(page.locator('.ps-goz[data-hal="altin"]')).toHaveCount(1, { timeout: 5000 });
  // yanar (kahverengi), Kino yer: göz boşalır
  await expect(page.locator('.ps-goz[data-hal="bos"]')).toHaveCount(3, { timeout: 5000 });
  // tabak boşken kremaya dokunmak bir şey bozmaz
  await page.locator('.ps-krema-sise').first().click();
  await expect(page.locator('.ps-tabak[data-dolu="0"]')).toBeVisible();
  // tek kurabiye, dört çilek: üçü sığar, dördüncüsü kayar
  await page.locator('.ps-hamur-kabi').click();
  await page.locator('.ps-kalip[data-kalip="yuvarlak"]').click();
  await page.locator('.ps-tepsi').click();
  await page.locator('.ps-goz[data-hal="altin"]').first().click();
  for (let i = 0; i < 4; i++) await page.locator('.ps-sus-kabi[data-sus="cilek"]').click();
  const parti = JSON.parse((await page.locator('.ps-tabak').getAttribute('data-parti'))!) as { parcalar: { susler: string[] }[] };
  expect(parti.parcalar[0].susler).toHaveLength(3);
  expect(hatalar).toEqual([]);
});

test('Pasta Otobüsü: sabır kalbi dolunca müşteri uyuklar, dokununca uyanır; bahşiş kaçar ama yine 3 jeton', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./pasta/?test=1&sifirla=1&ekran=gun&gun=1&sabir=1200');
  const { ad, sip } = await siradaki(page);
  const m = page.locator(`.ps-musteri[data-musteri="${ad}"]`);
  await expect(m).toHaveClass(/ps-uyuyor/, { timeout: 5000 });
  await m.click();
  await expect(m).not.toHaveClass(/ps-uyuyor/);
  await kalemYap(page, sip.kalemler[0]);
  await servisEt(page, ad);
  await expect(m).toHaveAttribute('data-sonuc', 'ayni');
  // uyukladı: bahşiş yok, 3 jeton
  await expect(page.locator('.ps-jeton')).toHaveCount(3, { timeout: 8000 });
  await expect(page.locator('.ps-jeton.ps-bahsis')).toHaveCount(0);
  expect(hatalar).toEqual([]);
});

test('Pasta Otobüsü: ekran kareleri (yatay telefon, dikey telefon, tablet)', async ({ page }, info) => {
  test.setTimeout(240_000);
  test.skip(info.project.name !== 'iphone', 'kareler bir kez alınır');
  for (const [ad, w, hh] of [
    ['844x390', 844, 390],
    ['390x844', 390, 844],
    ['768x1024', 768, 1024],
  ] as const) {
    await page.setViewportSize({ width: w, height: hh });
    await page.goto('./pasta/?test=1&sifirla=1&alinan=sapka');
    await expect(page.locator('.ps-gun-kart')).toHaveCount(3);
    await page.waitForTimeout(400);
    await page.screenshot({ path: `tests/screens/pasta-${ad}-acilis.png` });
    await page.goto('./pasta/?test=1&ekran=gun&gun=2&alinan=sapka');
    const { sip } = await siradaki(page);
    await expect(hazirMusteri(page)).toHaveCount(3, { timeout: 15000 });
    await kalemYap(page, sip.kalemler[0]);
    await page.waitForTimeout(500);
    await page.screenshot({ path: `tests/screens/pasta-${ad}-gun.png` });
    // dokunma alanları ekranın içinde, en az 64 px
    for (const e of await page.locator('.ps-tezgah button, .ps-ist-firin button').all()) {
      const b = (await e.boundingBox())!;
      expect(b.x).toBeGreaterThanOrEqual(-1);
      expect(b.y + b.height).toBeLessThanOrEqual(hh + 1);
      expect(b.x + b.width).toBeLessThanOrEqual(w + 1);
      expect(Math.min(b.width, b.height)).toBeGreaterThanOrEqual(63.5);
    }
  }
});
