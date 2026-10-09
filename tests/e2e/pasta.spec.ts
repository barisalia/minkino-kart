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
  let dokunus = 0;
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
    dokunus++;
    await page.waitForTimeout(60);
  }
  await expect(page.locator('.ps-aksam')).toBeVisible({ timeout: 20000 });
  return { adimlar, zigzag, gun, dokunus };
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

test('Pasta Otobüsü: uyuyan müşteriye tabağa dokunarak verilince uyanır (gözü kapalı, Zzz ile yemez)', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./pasta/?test=1&sifirla=1&ekran=gun&gun=1&sabir=1200');
  await expect(page.locator('.ps-musteri.ps-uyuyor').first()).toBeVisible({ timeout: 20000 });
  // yalnız tezgâhtaki parlayan işe dokun (müşteriye dokunma); tabak hazır olunca adım "servis" olur
  for (let n = 0; n < 200; n++) {
    const d = await durum(page).catch(() => null);
    if (d?.adim === 'servis') break;
    const hedef = page.locator('.ps-gun .ps-sirada');
    if (d?.adim && (await hedef.count())) await hedef.first().click({ timeout: 3000 }).catch(() => undefined);
    await page.waitForTimeout(80);
  }
  expect((await durum(page)).adim).toBe('servis');
  await expect(page.locator('.ps-musteri.ps-uyuyor').first()).toBeVisible();
  await page.locator('.ps-tabak').click();
  const verilen = page.locator('.ps-musteri.ps-bitti');
  await expect(verilen).toHaveCount(1, { timeout: 5000 });
  await expect(verilen).not.toHaveClass(/ps-uyuyor/);
  expect(hatalar).toEqual([]);
});

test('Pasta Otobüsü akşam: jetonlar ekran açılınca kaydedilir; erken kumbara dokunuşu sayımı bozmaz, kumbara çağırmaya devam etmez', async ({ page }) => {
  const hatalar = hataTopla(page);
  // kumbara ekrana gelir gelmez (yıldızlar dolmadan) dokunulur
  await page.addInitScript(() => {
    const g = new MutationObserver(() => {
      const k = document.querySelector<HTMLElement>('.ps-kumbara');
      if (!k) return;
      g.disconnect();
      window.setTimeout(() => k.click(), 0);
    });
    g.observe(document, { childList: true, subtree: true });
  });
  await page.goto('./pasta/?test=1&sifirla=1&ekran=aksam&gun=1&kazanc=5&jeton=3');
  await expect(page.locator('.ps-aksam')).toBeVisible();
  // sayım bitmeden kayıtta zaten 3 + 5
  const kayitli = await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-pasta-v1') ?? '{}').jeton as number);
  expect(kayitli).toBe(8);
  await expect(page.locator('.ps-raf')).toBeVisible({ timeout: 20000 });
  await expect(page.locator('.ps-kumbara-sayi')).toHaveText('8');
  await expect(page.locator('.ps-sayac')).toHaveText('5');
  await expect(page.locator('.ps-aksam-yildizlar')).toHaveAttribute('data-yildiz', /\d/);
  await page.waitForTimeout(600);
  await expect(page.locator('.ps-kumbara')).not.toHaveClass(/ps-cagir/);
  const jeton = await page.evaluate(() => (window as unknown as { __pasta: { kayit: { jeton: number } } }).__pasta.kayit.jeton);
  expect(jeton).toBe(8);
  // Kino'nun kuleleri erken dokunuşta hemen tamamlanır (sayım beklemez)
  await expect(page.locator('.ps-aksam-jetonlar')).toHaveAttribute('data-kule', 'tamam');
  expect(hatalar).toEqual([]);
});

// ================================================================ Mino ile Kino'nun Pasta Otobüsü (mino-kino-pasta.md)
// Barış'ın 9 eski şikâyeti tekrar etmesin: her biri aşağıda ayrı bir denetim (§2 tablosu).

type Kutu = { x: number; y: number; width: number; height: number };
const kesisir = (a: Kutu, b: Kutu) => !(a.x + a.width <= b.x + 1 || b.x + b.width <= a.x + 1 || a.y + a.height <= b.y + 1 || b.y + b.height <= a.y + 1);

/**
 * Sayfaya her karede Kino'yu denetleyen gözcü kurar: Kino'nun kutusu (çizimi) hiçbir fırın gözüne, tezgâh eşyasına,
 * üst çubuğa ya da müşteri balonuna binmez (#2, #6). Kino bir iş yaparken (data-kino-is) hamura dokunulur: dokunuş
 * hemen işler, tepsiye top düşer (#1 bekleme yok).
 */
async function kinoGozcusu(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __kino: { ihlal: string[]; isler: string[]; dokunus: Record<string, number>; kilit: string[] } };
    w.__kino = { ihlal: [], isler: [], dokunus: {}, kilit: [] };
    const kes = (a: DOMRect, c: DOMRect) => !(a.right <= c.left + 1 || c.right <= a.left + 1 || a.bottom <= c.top + 1 || c.bottom <= a.top + 1);
    let sonIs = '';
    const tur = () => {
      const yer = document.querySelector<HTMLElement>('.ps-gun .ps-kino-yer');
      const svg = yer?.querySelector('svg');
      if (yer && svg && !document.querySelector('.ps-giris')) {
        const k = svg.getBoundingClientRect();
        const is = yer.dataset.kinoIs ?? '';
        // fırın, gözleri, üst çubuk, balonlar: hiç değmez
        for (const e of document.querySelectorAll('.ps-goz, .ps-firin-dik, .ps-ust button, .ps-gun-etiket, .ps-musteri.ps-hazir .ps-balon')) {
          const r = e.getBoundingClientRect();
          if (r.width && kes(k, r)) w.__kino.ihlal.push(`${is || 'duruyor'}: ${e.getAttribute('aria-label') ?? e.className}`);
        }
        // tezgâhtaki eşyalar: Kino'nun gövdesi binmez (ayakları rafın arkasındaki kâsenin kepçesini sıyırabilir:
        // dikey örtüşme Kino boyunun %25'inden az; kino-is.ts → DIKEY_PAY)
        for (const e of document.querySelectorAll('.ps-tezgah button')) {
          const r = e.getBoundingClientRect();
          const dikey = Math.min(k.bottom, r.bottom) - Math.max(k.top, r.top);
          const yatay = Math.min(k.right, r.right) - Math.max(k.left, r.left);
          if (dikey > k.height * 0.25 && yatay > 1) w.__kino.ihlal.push(`${is || 'duruyor'}: ${e.getAttribute('aria-label')}`);
        }
        if (is && is !== sonIs) {
          w.__kino.isler.push(is);
          // iş sürerken hamura dokun: top hemen tepsiye düşmeli (tepsi doluysa top seker, Kino yer: o da işlemdir)
          const tepsi = document.querySelector<HTMLElement>('.ps-tepsi-ic');
          const hamur = document.querySelector<HTMLElement>('.ps-hamur-kabi');
          const tepsiDolu = document.querySelector<HTMLElement>('.ps-tepsi')?.dataset.hazir === '1';
          if (tepsi && hamur && !tepsiDolu && !document.querySelector('.ps-panel')) {
            const once = Number(tepsi.dataset.adet ?? 0);
            const r = hamur.getBoundingClientRect();
            const ust = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
            hamur.click();
            const sonra = Number(tepsi.dataset.adet ?? 0);
            if (ust?.closest('.ps-hamur-kabi') && sonra === once + 1) w.__kino.dokunus[is] = (w.__kino.dokunus[is] ?? 0) + 1;
            else if (sonra === once) {
              /* tepsi sınırda: top seker (zararsız) */
            } else w.__kino.kilit.push(is);
            if (!ust?.closest('.ps-hamur-kabi')) w.__kino.kilit.push(`${is}: hamurun üstü kapalı`);
          }
        }
        sonIs = is;
      }
      requestAnimationFrame(tur);
    };
    requestAnimationFrame(tur);
  });
}
const kinoSonuc = (page: Page) => page.evaluate(() => (window as unknown as { __kino: { ihlal: string[]; isler: string[]; dokunus: Record<string, number>; kilit: string[] } }).__kino);

test('Mino ile Kino: Kino karşılar, servis eder, çak yapar, hedefte zıplar; hiçbiri bekletmez ve fırına, istasyona, balona binmez; Gün 1 uzamaz', async ({ page }) => {
  test.setTimeout(240_000);
  const hatalar = hataTopla(page);
  await kinoGozcusu(page);
  await page.goto('./pasta/?test=1&sifirla=1&ekran=gun&gun=1');
  await expect(page.locator('.ps-gun')).toBeVisible();
  // #8 ilk karede tezgâh boş değil: giriş kalkar kalkmaz tezgâhın bütün resimleri çözülmüş, Mino ile Kino çizili
  await expect(page.locator('.ps-giris')).toHaveCount(0, { timeout: 15000 });
  const ilk = await page.evaluate(() => ({
    yukleniyor: document.querySelector('.ps-gun')!.classList.contains('ps-yukleniyor'),
    eksik: [...document.querySelectorAll<HTMLImageElement>('.ps-tezgah img, .ps-firin-dik img')].filter((i) => !i.complete || !i.naturalWidth).length,
    kino: !!document.querySelector('.ps-kino-yer .kr-iskeletli svg'),
    mino: !!document.querySelector('.ps-mino-yer svg'),
  }));
  expect(ilk).toEqual({ yukleniyor: false, eksik: 0, kino: true, mino: true });
  // Gün 1 uzamaz. Önceki ölçüm (bu iş öncesi ve sonrası aynı makinede, 844×390, test modu): 24 dokunuş; süre boş
  // makinede ~5 sn, yüklü makinede ~25 sn (ikisi de aynı). Dokunuş sayısı artmaz; süre bol payla sınırlı (bekleme
  // eklenseydi her müşteride saniyeler eklenirdi).
  const bas = Date.now();
  const g1 = await parlayaniIzle(page, 1);
  const sure = Date.now() - bas;
  expect(g1.dokunus, 'Gün 1 dokunuş sayısı').toBeLessThanOrEqual(24);
  expect(sure, 'Gün 1 süresi').toBeLessThan(60_000);
  const k = await kinoSonuc(page);
  // karşılama dönüşümlü (4 müşteriden 2'si), servis her müşteride, mutlu müşteride çak, hedef tutunca zıplama
  for (const is of ['selam', 'servis', 'cak', 'zipla']) expect(k.isler, `Kino işi: ${is}`).toContain(is);
  expect(k.isler.filter((x) => x === 'selam').length).toBe(2);
  // #1 Kino'nun işleri sırasında dokunuş hemen işler
  expect(k.kilit).toEqual([]);
  // (tepsi o an doluysa dokunuş denenmez; gün boyunca en az iki işte denenmiş olmalı)
  expect(Object.values(k.dokunus).reduce((a, b) => a + b, 0), `Kino işi sırasında hamur: ${JSON.stringify(k.dokunus)}`).toBeGreaterThanOrEqual(2);
  // #2, #6 Kino hiçbir fırın gözüne, istasyona, UI'ye, balona binmez (her karede)
  expect([...new Set(k.ihlal)]).toEqual([]);
  expect(hatalar).toEqual([]);
});

test('Mino ile Kino: ad ve başlık rozetleri; açılışta ve girişte tekerlekler açıkta (karakterler örtmez), Mino ile Kino pencerede', async ({ page }) => {
  const hatalar = hataTopla(page);
  /** tekerleğin ortası ve dört yanı tekerleğin kendisi (gövde, Mino, Kino örtmez) */
  const tekerAcik = () =>
    page.evaluate(() =>
      [...document.querySelectorAll('.ps-otobus:not(.ps-raf-otobus) .ps-ob-teker')].flatMap((t) => {
        const r = t.getBoundingClientRect();
        if (!r.width) return [];
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        return [
          [0, 0],
          [0.32, 0],
          [-0.32, 0],
          [0, 0.32],
          [0, -0.32],
        ]
          .map(([dx, dy]) => document.elementFromPoint(cx + dx * r.width, cy + dy * r.height))
          .filter((e) => !e?.closest('.ps-ob-teker, .ps-ob-teker-isik'))
          .map((e) => e?.closest('[class]')?.className.toString() ?? 'yok');
      }),
    );
  for (const [w, hh] of [
    [844, 390],
    [932, 430],
    [667, 375],
    [390, 844],
    [1024, 768],
  ] as const) {
    await page.setViewportSize({ width: w, height: hh });
    await page.goto('./pasta/?test=1&sifirla=1');
    await expect(page.locator('.ps-logo')).toHaveAttribute('aria-label', "Mino ile Kino'nun Pasta Otobüsü");
    await expect(page.locator('.ps-logo-ust-yazi')).toHaveText("Mino ile Kino'nun");
    await expect(page.locator('.ps-yuz-rozet .kr-iskeletli svg, .ps-yuz-rozet svg').first()).toBeVisible();
    await expect(page.locator('.ps-yuz-rozet')).toHaveCount(2);
    // başlık ekrana sığar, üst çubuğun düğmelerine binmez
    const logo = (await page.locator('.ps-logo-ust').boundingBox())!;
    expect(logo.x, `${w}x${hh} başlık sol`).toBeGreaterThanOrEqual(0);
    expect(logo.x + logo.width, `${w}x${hh} başlık sağ`).toBeLessThanOrEqual(w);
    for (const d of await page.locator('.ps-acilis .ust-cubuk button, .ps-acilis .ust-cubuk .ps-yildiz-rozet, .ps-acilis .ust-cubuk .ps-kumbara-rozet').all()) {
      const b = await d.boundingBox();
      if (b) expect(kesisir(logo, b), `${w}x${hh} başlık üst çubuğa biniyor`).toBe(false);
    }
    await page.waitForTimeout(400);
    expect(await tekerAcik(), `${w}x${hh} açılış tekerlekleri`).toEqual([]);
  }
  // #9 giriş (gerçek hız): otobüs gelir, kapak açılır, Mino ile Kino pencerede; tekerlekler önde
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('./pasta/?onizleme=1&sifirla=1&ekran=gun&gun=1');
  await expect(page.locator('.ps-giris-kino.ps-goster')).toHaveCount(1, { timeout: 15000 });
  await expect(page.locator('.ps-giris-mino.ps-goster')).toHaveCount(1);
  await page.waitForTimeout(600);
  expect(await tekerAcik(), 'giriş tekerlekleri').toEqual([]);
  // Mino ile Kino kapağın açıklığında (gövdenin içinde), tekerleklerin üstünde
  const kapak = (await page.locator('.ps-giris .ps-ob-tezgah').boundingBox())!;
  for (const s of ['.ps-giris-mino', '.ps-giris-kino']) {
    const b = (await page.locator(`${s} svg`).first().boundingBox())!;
    expect(b.x + b.width / 2, `${s} pencerede`).toBeGreaterThan(kapak.x);
    expect(b.x + b.width / 2, `${s} pencerede`).toBeLessThan(kapak.x + kapak.width);
  }
  expect(hatalar).toEqual([]);
});

test('Mino ile Kino: istasyonlar Kino eklenmeden önceki boyunda (#3); Kino fırına, istasyona binmez (#2)', async ({ page }) => {
  // bu işten önce ölçüldü (Gün 2, test modu): [aria-label | sınıf, en, boy] px
  const ONCE: Record<string, [string, number, number][]> = {
    '844x390': [['yuvarlak', 72, 72], ['yildiz', 72, 72], ['kalp', 72, 72], ['cilek', 72, 76], ['cikolata', 72, 76], ['muz', 72, 76], ['Kasa', 83, 78], ['Hamur', 115, 96], ['Tepsi', 124, 72], ['ps-firin-dik', 186, 301], ['Fırın 1', 160, 85], ['Fırın 2', 160, 83], ['Fırın 3', 160, 84], ['pembe', 72, 108], ['mavi', 72, 108], ['sari', 72, 108], ['Servis tabağı', 137, 76]],
    '390x844': [['yuvarlak', 64, 64], ['yildiz', 64, 64], ['kalp', 64, 64], ['cilek', 64, 68], ['cikolata', 64, 68], ['muz', 64, 68], ['Kasa', 77, 73], ['Hamur', 93, 77], ['Tepsi', 96, 64], ['ps-firin-dik', 164, 265], ['Fırın 1', 141, 75], ['Fırın 2', 141, 73], ['Fırın 3', 141, 74], ['pembe', 64, 99], ['mavi', 64, 99], ['sari', 64, 99], ['Servis tabağı', 125, 67]],
    '1024x768': [['yuvarlak', 95, 95], ['yildiz', 95, 95], ['kalp', 95, 95], ['cilek', 95, 101], ['cikolata', 95, 101], ['muz', 95, 101], ['Kasa', 110, 103], ['Hamur', 152, 127], ['Tepsi', 164, 95], ['ps-firin-dik', 205, 332], ['Fırın 1', 176, 94], ['Fırın 2', 176, 91], ['Fırın 3', 176, 93], ['pembe', 95, 143], ['mavi', 95, 143], ['sari', 95, 143], ['Servis tabağı', 181, 100]],
  };
  for (const [ad, liste] of Object.entries(ONCE)) {
    const [w, hh] = ad.split('x').map(Number);
    await page.setViewportSize({ width: w, height: hh });
    await page.goto('./pasta/?test=1&sifirla=1&ekran=gun&gun=2');
    await expect(page.locator('.ps-musteri.ps-hazir').first()).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(300);
    const simdi = await page.evaluate(() =>
      [...document.querySelectorAll('.ps-tezgah button, .ps-firin-dik')].map((e) => {
        const r = e.getBoundingClientRect();
        return [e.getAttribute('aria-label') || e.className, Math.round(r.width), Math.round(r.height)] as [string, number, number];
      }),
    );
    expect(simdi.length, `${ad} istasyon sayısı`).toBe(liste.length);
    for (let i = 0; i < liste.length; i++) {
      expect(simdi[i][0], `${ad} sıra`).toBe(liste[i][0]);
      expect(Math.abs(simdi[i][1] - liste[i][1]), `${ad} ${liste[i][0]} en`).toBeLessThanOrEqual(1);
      expect(Math.abs(simdi[i][2] - liste[i][2]), `${ad} ${liste[i][0]} boy`).toBeLessThanOrEqual(1);
    }
    // Kino'nun kutusu hiçbir fırın gözünün dokunma alanıyla kesişmez; gövdesi hiçbir istasyona binmez
    const kino = (await page.locator('.ps-kino-yer svg').boundingBox())!;
    for (const e of await page.locator('.ps-goz, .ps-firin-dik').all()) {
      const b = (await e.boundingBox())!;
      expect(kesisir(kino, b), `${ad} Kino fırının üstünde`).toBe(false);
    }
    for (const e of await page.locator('.ps-tezgah button').all()) {
      const b = (await e.boundingBox())!;
      const dikey = Math.min(kino.y + kino.height, b.y + b.height) - Math.max(kino.y, b.y);
      const yatay = Math.min(kino.x + kino.width, b.x + b.width) - Math.max(kino.x, b.x);
      expect(dikey > kino.height * 0.25 && yatay > 1, `${ad} Kino ${await e.getAttribute('aria-label')} üstünde`).toBe(false);
    }
  }
});

test('Mino ile Kino akşam: Kino jetonları beşli kuleler yapar; kuleler tezgâhın çizgisine oturur (#9 havada jeton yok); Mino beşer sayar', async ({ page }) => {
  const hatalar = hataTopla(page);
  for (const [w, hh] of [
    [844, 390],
    [390, 844],
    [1024, 768],
  ] as const) {
    await page.setViewportSize({ width: w, height: hh });
    await page.goto('./pasta/?test=1&sifirla=1&ekran=aksam&gun=1&kazanc=16&jeton=0');
    await expect(page.locator('.ps-aksam-jetonlar')).toHaveAttribute('data-kule', 'tamam', { timeout: 10000 });
    await page.waitForTimeout(400);
    const kuleler = await page.evaluate(() => {
      // tezgâhın üst yüzü: otobüs çiziminde (viewBox 640×420, ortalanmış) tahta rafın orta çizgisi y = 250
      const s = document.querySelector('.ps-aksam-otobus svg')!.getBoundingClientRect();
      const olcek = Math.min(s.width / 640, s.height / 420);
      const tz = { top: s.top + (s.height - 420 * olcek) / 2 + 250 * olcek };
      const js = [...document.querySelectorAll<HTMLElement>('.ps-aksam-jeton')];
      const kule = new Map<string, { alt: number; n: number; x: number }>();
      for (const j of js) {
        const r = j.getBoundingClientRect();
        const k = kule.get(j.dataset.kule!) ?? { alt: 0, n: 0, x: r.left };
        k.n++;
        if (j.dataset.k === '0') k.alt = r.bottom;
        kule.set(j.dataset.kule!, k);
      }
      return { tz: tz.top, kuleler: [...kule.values()], hepsiKulede: js.every((j) => j.classList.contains('ps-kulede')) };
    });
    expect(kuleler.hepsiKulede).toBe(true);
    expect(kuleler.kuleler.map((k) => k.n)).toEqual([5, 5, 5, 1]);
    for (const k of kuleler.kuleler) expect(Math.abs(k.alt - kuleler.tz), `${w}x${hh} kule tabanı tezgâhta`).toBeLessThanOrEqual(2);
    // kuleler yan yana, iç içe değil
    for (let i = 1; i < kuleler.kuleler.length; i++) expect(kuleler.kuleler[i].x).toBeGreaterThan(kuleler.kuleler[i - 1].x + 4);
  }
  // sayım: kumbaraya dokununca kuleler soldan sırayla gider ("Beş! On! On beş!"), artan en son
  await page.locator('.ps-kumbara').click();
  await expect(page.locator('.ps-raf')).toBeVisible({ timeout: 20000 });
  await expect(page.locator('.ps-sayac')).toHaveText('16');
  await expect(page.locator('.ps-aksam-jeton')).toHaveCount(0);
  expect(hatalar).toEqual([]);
});
