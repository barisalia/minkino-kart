/**
 * Mino'nun Pasta Otobüsü (/pasta/), sade sürüm: üç gün baştan sona yalnız PARLAYAN işe dokunarak oynanır (sıradaki işin
 * yeri her an belli olmalı; izleyen çocuk her siparişi tam yapar). Yanlış dokunuşlar zararsız; fırının üç gözü de açık
 * ve paralel pişer; Gün 1'de kurabiye yanmaz; sabır kalbi yalnız uyuklatır; Gün 3 zigzag kreması kolay bir kaydırma.
 * Ekran kareleri tests/screens/pasta-sade-*.png (git'e girmez).
 */
import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

interface Durum {
  biten: number;
  gelen: number;
  mutlu: number;
  bugun: number;
  panel: boolean;
  adim: string | null;
}
const durum = async (page: Page) => JSON.parse((await page.locator('.ps-gun').getAttribute('data-durum')) ?? '{}') as Durum;

/** Zigzag paneli açıksa kurabiyenin üstünde parmağı yana kaydırır */
async function zigzagKaydir(page: Page) {
  const panel = page.locator('.ps-panel[data-adim="desen"]');
  if (!(await panel.isVisible().catch(() => false))) return false;
  await panel.locator('.ps-panel-sahne').evaluate((e) => Promise.all(e.getAnimations().map((a) => a.finished)));
  const r = (await page.locator('.ps-panel-cizim').boundingBox())!;
  const [y, x0, x1] = [r.y + r.height * 0.45, r.x + r.width * 0.3, r.x + r.width * 0.7];
  await page.mouse.move(x0, y);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) await page.mouse.move(x0 + ((x1 - x0) * i) / 8, y + (i % 2 ? -6 : 6));
  await page.mouse.up();
  // kaydırma hemen sayılır, krema oturur, panel kapanır
  await expect(panel).toHaveCount(0, { timeout: 5000 });
  return true;
}

/** Bir günü yalnız parlayan işe dokunarak sonuna kadar oynar; görülen adımlar döner */
async function parlayaniIzle(page: Page, gun: number, kare?: (n: number) => Promise<void>) {
  const adimlar = new Set<string>();
  let zigzag = 0;
  for (let n = 0; n < 400; n++) {
    if (await page.locator('.ps-aksam').isVisible().catch(() => false)) break;
    if (await zigzagKaydir(page)) {
      zigzag++;
      continue;
    }
    const d = await durum(page).catch(() => null);
    const hedef = page.locator('.ps-gun .ps-sirada');
    if (!d?.adim || !(await hedef.count())) {
      await page.waitForTimeout(120);
      continue;
    }
    adimlar.add(d.adim);
    await kare?.(n);
    await hedef.first().click({ timeout: 3000 }).catch(() => undefined);
    await page.waitForTimeout(60);
  }
  await expect(page.locator('.ps-aksam')).toBeVisible({ timeout: 20000 });
  return { adimlar, zigzag, gun };
}

test('Pasta Otobüsü: üç gün yalnız parlayan işi izleyerek baştan sona; her sipariş tam aynı', async ({ page }) => {
  test.setTimeout(420_000);
  const hatalar = hataTopla(page);
  await page.goto('./pasta/?test=1&sifirla=1');
  await expect(page.locator('.ps-logo')).toBeVisible();
  await expect(page.locator('.ps-gun-kart')).toHaveCount(3);
  await expect(page.locator('.ps-gun-kart[data-gun="2"]')).toHaveClass(/ps-kilitli/);
  for (const gun of [1, 2, 3]) {
    await page.locator(`.ps-gun-kart[data-gun="${gun}"]`).click();
    await expect(page.locator(`.ps-gun[data-gun="${gun}"]`)).toBeVisible();
    // fırının üç gözü de açık (kilit yok); Gün 1'de süs kavanozu yok
    await expect(page.locator('.ps-goz')).toHaveCount(3);
    await expect(page.locator('.ps-goz-kilit')).toHaveCount(0);
    await expect(page.locator('.ps-sus-kabi')).toHaveCount(gun === 1 ? 0 : 3);
    const s = await parlayaniIzle(page, gun);
    expect([...s.adimlar]).toEqual(expect.arrayContaining(['hamur', 'kalip', 'tepsi', 'firin', 'krema', 'servis']));
    if (gun >= 2) expect(s.adimlar.has('sus')).toBe(true);
    // Gün 3: iki sipariş zigzag kremalı (kolay kaydırma)
    expect(s.zigzag).toBe(gun === 3 ? 2 : 0);
    // akşam: dört müşterinin dördü de mutlu → üç yıldız
    await expect(page.locator('.ps-aksam-yildizlar')).toHaveAttribute('data-yildiz', '3', { timeout: 15000 });
    await page.locator('.ps-kumbara').click();
    await expect(page.locator('.ps-raf')).toBeVisible({ timeout: 20000 });
    await expect(page.locator('.ps-raf-urun')).toHaveCount(3);
    await page.locator('.ps-tamam').click();
    await expect(page.locator('.ps-acilis')).toBeVisible({ timeout: 10000 });
    await expect(page.locator(`.ps-gun-kart[data-gun="${gun}"]`)).toHaveClass(/ps-biten/);
  }
  // 3 gün × 4 müşteri × (3 + 1 bahşiş) = 48 jeton (şapka alınmadıysa)
  const jeton = await page.evaluate(() => (window as unknown as { __pasta: { kayit: { jeton: number } } }).__pasta.kayit.jeton);
  expect(jeton).toBe(48);
  expect(hatalar).toEqual([]);
});

test('Pasta Otobüsü: yanlış dokunuşlar zararsız; fazla hamur, yanlış süs ve fazla süs kayar', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./pasta/?test=1&sifirla=1&ekran=gun&gun=2');
  await expect(page.locator('.ps-musteri.ps-hazir').first()).toBeVisible({ timeout: 20000 });
  const sip = JSON.parse((await page.locator('.ps-musteri.ps-hazir').first().getAttribute('data-siparis'))!) as {
    kalemler: { adet: number; sekil: string; renk: string; sus: string; susAdet: number }[];
  };
  const k = sip.kalemler[0];
  // boş tabakta krema / süs, boş tepside kalıp: hiçbir şey olmaz
  await page.locator('.ps-krema-sise').first().click();
  await page.locator('.ps-sus-kabi').first().click();
  await page.locator('.ps-kalip').first().click();
  await expect(page.locator('.ps-tabak[data-dolu="0"]')).toBeVisible();
  await expect(page.locator('.ps-tepsi-parca')).toHaveCount(0);
  // hamur: siparişteki kadar top; fazlası seker (Kino yer)
  for (let i = 0; i < k.adet + 2; i++) await page.locator('.ps-hamur-kabi').click();
  await expect(page.locator('.ps-tepsi-parca')).toHaveCount(k.adet);
  // yanlış kalıp sonra doğru kalıp: hepsi doğru şekil olur
  const yanlisSekil = ['yuvarlak', 'yildiz', 'kalp'].find((x) => x !== k.sekil)!;
  await page.locator(`.ps-kalip[data-kalip="${yanlisSekil}"]`).click();
  await page.locator(`.ps-kalip[data-kalip="${k.sekil}"]`).click();
  await expect(page.locator(`.ps-tepsi-parca[data-kalip="${k.sekil}"]`)).toHaveCount(k.adet);
  // tepsiyi fırına sürükle
  const t = (await page.locator('.ps-tepsi-ic').boundingBox())!;
  const f = (await page.locator('.ps-goz[data-goz="1"]').boundingBox())!;
  await page.mouse.move(t.x + t.width / 2, t.y + t.height / 2);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(t.x + t.width / 2 + ((f.x + f.width / 2 - t.x - t.width / 2) * i) / 10, t.y + t.height / 2 + ((f.y + f.height / 2 - t.y - t.height / 2) * i) / 10);
  await page.mouse.up();
  await expect(page.locator('.ps-goz[data-goz="1"]')).not.toHaveAttribute('data-hal', 'bos');
  await page.locator('.ps-goz[data-hal="altin"]').first().click({ timeout: 8000 });
  await expect(page.locator('.ps-tabak[data-dolu="1"]')).toBeVisible();
  // eksik tabak servis edilmez (krema yok): tabak yerinde kalır
  await page.locator('.ps-tabak').click();
  await expect(page.locator('.ps-tabak[data-dolu="1"]')).toBeVisible();
  // yanlış krema sonra doğru krema: renk değişir
  const yanlisRenk = ['pembe', 'mavi', 'sari'].find((x) => x !== k.renk)!;
  await page.locator(`.ps-krema-sise[data-renk="${yanlisRenk}"]`).click();
  await page.locator(`.ps-krema-sise[data-renk="${k.renk}"]`).click();
  // yanlış süs kayar; doğru süsün fazlası kayar
  const yanlisSus = ['cilek', 'cikolata', 'muz'].find((x) => x !== k.sus)!;
  await page.locator(`.ps-sus-kabi[data-sus="${yanlisSus}"]`).click();
  for (let i = 0; i < k.susAdet * k.adet + 2; i++) await page.locator(`.ps-sus-kabi[data-sus="${k.sus}"]`).click();
  const parti = JSON.parse((await page.locator('.ps-tabak').getAttribute('data-parti'))!) as { parcalar: { renk: string; susler: string[] }[] };
  for (const p of parti.parcalar) {
    expect(p.renk).toBe(k.renk);
    expect(p.susler).toEqual(Array.from({ length: k.susAdet }, () => k.sus));
  }
  // hazır tabak: tabağa dokununca sahibine gider, tam aynı
  await page.locator('.ps-tabak').click();
  await expect(page.locator('.ps-musteri.ps-bitti')).toHaveAttribute('data-sonuc', 'ayni');
  expect(hatalar).toEqual([]);
});

test('Pasta Otobüsü: fırının üç gözü paralel pişer; Gün 2-3 unutulan kurabiye yanar, Kino yer; Gün 1 yanmaz', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./pasta/?test=1&sifirla=1&ekran=gun&gun=2&firin=300,2500');
  await expect(page.locator('.ps-musteri.ps-hazir').first()).toBeVisible({ timeout: 20000 });
  for (let i = 0; i < 3; i++) {
    await page.locator('.ps-hamur-kabi').click();
    await page.locator('.ps-kalip[data-kalip="kalp"]').click();
    await page.locator('.ps-tepsi').click();
  }
  await expect(page.locator('.ps-goz[data-hal="bos"]')).toHaveCount(0);
  await expect(page.locator('.ps-goz[data-hal="altin"]')).toHaveCount(3, { timeout: 3000 });
  // unutulanlar yanar, Kino yer: gözler boşalır
  await expect(page.locator('.ps-goz[data-hal="bos"]')).toHaveCount(3, { timeout: 8000 });
  // Gün 1: hiç yanmaz
  await page.goto('./pasta/?test=1&sifirla=1&ekran=gun&gun=1&firin=300,1200');
  await expect(page.locator('.ps-musteri.ps-hazir').first()).toBeVisible({ timeout: 20000 });
  await page.locator('.ps-hamur-kabi').click();
  await page.locator('.ps-kalip[data-kalip="yuvarlak"]').click();
  await page.locator('.ps-tepsi').click();
  await expect(page.locator('.ps-goz[data-hal="altin"]')).toHaveCount(1, { timeout: 3000 });
  await page.waitForTimeout(2500);
  await expect(page.locator('.ps-goz[data-hal="altin"]')).toHaveCount(1);
  expect(hatalar).toEqual([]);
});

test('Pasta Otobüsü: sabır kalbi dolunca müşteri yalnız uyuklar (gitmez), dokununca uyanır; el ipucu çıkar', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./pasta/?test=1&sifirla=1&ekran=gun&gun=1&sabir=1200&ipucu=1');
  const m = page.locator('.ps-musteri.ps-hazir').first();
  await expect(m).toBeVisible({ timeout: 20000 });
  await expect(m).toHaveClass(/ps-uyuyor/, { timeout: 5000 });
  await page.waitForTimeout(1500);
  await expect(m).toHaveClass(/ps-uyuyor/);
  await expect(m).toHaveClass(/ps-hazir/);
  // 4 sn dokunulmazsa sıradaki işin (hamur) üstünde el
  await expect(page.locator('.ps-hamur-kabi.ps-sirada')).toBeVisible();
  const el = page.locator('.ps-el-ipucu.ps-goster .ps-el-el');
  await expect(el).toBeVisible({ timeout: 8000 });
  // el iri (önceden simge kutusu 16 px kalıyordu) ve sıradaki işin üstünde
  const eb = (await el.boundingBox())!;
  expect(eb.width).toBeGreaterThanOrEqual(44);
  const hb = (await page.locator('.ps-hamur-kabi').boundingBox())!;
  expect(eb.x + eb.width * 0.44).toBeGreaterThan(hb.x - 30);
  expect(eb.x + eb.width * 0.44).toBeLessThan(hb.x + hb.width + 30);
  await m.click();
  await expect(m).not.toHaveClass(/ps-uyuyor/);
  await expect(page.locator('.ps-el-ipucu.ps-goster')).toHaveCount(0);
  expect(hatalar).toEqual([]);
});

test('Pasta Otobüsü: ekran kareleri ve dizilim (16:9 … 19.5:9 telefon, çok geniş ekran, yatay / dikey tablet, dikey telefon)', async ({ page }, info) => {
  test.setTimeout(360_000);
  test.skip(info.project.name !== 'iphone', 'kareler bir kez alınır');
  for (const [ad, w, hh, enAz] of [
    ['gun', 844, 390, 63.5],
    ['genis', 932, 430, 63.5],
    ['kucuk', 667, 375, 59.5],
    ['cok-genis', 1280, 500, 63.5],
    ['yatay-tablet', 1024, 768, 63.5],
    ['dikey', 390, 844, 63.5],
    ['tablet', 768, 1024, 63.5],
    ['tablet-buyuk', 834, 1194, 63.5],
  ] as const) {
    await page.setViewportSize({ width: w, height: hh });
    await page.goto('./pasta/?test=1&sifirla=1&ekran=gun&gun=2&firin=600,60000');
    await expect(page.locator('.ps-musteri.ps-hazir')).toHaveCount(2, { timeout: 20000 });
    // sipariş yarıda: kurabiye kremalı ve bir süslü, bir tepsi fırında
    for (let i = 0; i < 12; i++) {
      const adim = (await durum(page)).adim;
      if (adim === 'sus') break;
      await page.locator('.ps-gun .ps-sirada').first().click({ timeout: 3000 }).catch(() => undefined);
      await page.waitForTimeout(80);
    }
    await page.locator('.ps-gun .ps-sirada').first().click();
    await page.locator('.ps-hamur-kabi').click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: `tests/screens/pasta-sade-${ad}.png` });
    if (ad === 'gun') await page.locator('.ps-musteri.ps-hazir .ps-balon').first().screenshot({ path: 'tests/screens/pasta-sade-balon.png' });
    // sahne en çok 2.17:1, ortada (çok geniş ekranda yanlar otobüs duvarı)
    const sahne = (await page.locator('.ps-gun').boundingBox())!;
    expect(sahne.width / sahne.height, `${ad} sahne oranı`).toBeLessThanOrEqual(2.18);
    expect(Math.abs(sahne.x + sahne.width / 2 - w / 2), `${ad} sahne ortada`).toBeLessThan(1.5);
    // dokunma alanları sahnenin içinde ve iri
    const dugmeler: { ad: string; b: { x: number; y: number; width: number; height: number } }[] = [];
    for (const e of await page.locator('.ps-tezgah button, .ps-ist-firin button').all()) {
      const b = (await e.boundingBox())!;
      dugmeler.push({ ad: (await e.getAttribute('aria-label')) ?? '', b });
      expect(b.x, `${ad} sol`).toBeGreaterThanOrEqual(sahne.x - 1);
      expect(b.y + b.height, `${ad} alt`).toBeLessThanOrEqual(sahne.y + sahne.height + 1);
      expect(b.x + b.width, `${ad} sağ`).toBeLessThanOrEqual(sahne.x + sahne.width + 1);
      expect(Math.min(b.width, b.height), `${ad} boy`).toBeGreaterThanOrEqual(enAz);
    }
    // fırın dik bir dolap: üç göz üst üste, aynı hizada; tezgâhtaki hiçbir istasyonun üstüne binmez
    const firin = (await page.locator('.ps-firin-dik').boundingBox())!;
    expect(firin.height, `${ad} fırın dik`).toBeGreaterThan(firin.width * 1.4);
    const gozler = dugmeler.filter((d) => d.ad.startsWith('Fırın')).map((d) => d.b);
    expect(gozler).toHaveLength(3);
    for (let i = 1; i < 3; i++) {
      expect(gozler[i].y, `${ad} göz ${i} altta`).toBeGreaterThan(gozler[i - 1].y + gozler[i - 1].height * 0.8);
      expect(Math.abs(gozler[i].x - gozler[0].x)).toBeLessThan(1.5);
    }
    for (const d of dugmeler.filter((x) => !x.ad.startsWith('Fırın') && x.ad !== 'Kasa')) {
      const b = d.b;
      const ust = !(b.x + b.width <= firin.x + 1 || firin.x + firin.width <= b.x + 1 || b.y + b.height <= firin.y + 1 || firin.y + firin.height <= b.y + 1);
      expect(ust, `${ad} ${d.ad} fırının üstünde`).toBe(false);
    }
    // her balon pencerenin görünen açıklığının içinde (çerçeve, duvar ya da tezgâh hiçbir kenarını örtmez)
    const pencere = (await page.locator('.ps-pencere').boundingBox())!;
    const balonlar = await Promise.all((await page.locator('.ps-musteri.ps-hazir .ps-balon').all()).map((e) => e.boundingBox()));
    expect(balonlar.length).toBe(2);
    for (const b of balonlar) {
      expect(b!.x, `${ad} balon sol`).toBeGreaterThanOrEqual(pencere.x - 0.5);
      expect(b!.x + b!.width, `${ad} balon sağ`).toBeLessThanOrEqual(pencere.x + pencere.width + 0.5);
      expect(b!.y, `${ad} balon üst`).toBeGreaterThanOrEqual(pencere.y - 0.5);
      expect(b!.y + b!.height, `${ad} balon alt`).toBeLessThanOrEqual(pencere.y + pencere.height + 0.5);
    }
    const [a, c] = balonlar as { x: number; y: number; width: number; height: number }[];
    if (a && c) expect(a.x + a.width <= c.x || c.x + c.width <= a.x || a.y + a.height <= c.y || c.y + c.height <= a.y).toBe(true);
  }
});
