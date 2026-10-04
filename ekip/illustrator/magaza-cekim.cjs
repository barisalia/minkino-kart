// Mağaza ekran görüntüleri için ham oyun görüntüleri (Playwright, mobil emülasyon): assets/uygulama/ekran-ham/{telefon,tablet}/NN-ad.webp (+ ek/ klasörüne yedek sahneler).
// Telefon 390x844 @3x (1170x2532), tablet 768x1024 @2.5x (1920x2560). Uygulama derlemesi gerekir (npm run build:app: Minik Sanatçı yok, ana menü kökte); sunucu: npx vite preview --port 4178 (ya da başka statik http).
// Sıra magaza-ekran.cjs ile aynı: 01 ana menü (Mino ve Kino), 02 Ege (ses), 03 Pazar (say/eşleştir), 04 Salıncak (hikâye), 05 Çizgi film listesi (eğlenceli, eğitici), 06 Pasta Otobüsü (güvenli/reklamsız), 07 Okula Hazırım (rakam çizme; sayılar, harfler).
// node magaza-cekim.cjs [taban=http://localhost:4178] [NN ...]
const fs = require('fs'), path = require('path');
const { chromium } = require(require.resolve('playwright', { paths: [process.cwd()] }));
const sharp = require(require.resolve('sharp', { paths: [process.cwd()] }));
const TABAN = process.argv.slice(2).find((x) => x.startsWith('http')) || 'http://localhost:4178', NN = process.argv.slice(2).filter((x) => /^\d\d$/.test(x));
const HAM = 'assets/uygulama/ekran-ham/';
// 07 Okula Hazırım · Rakamı çiz: 1. tur (Kino'nun ters çizdiği) baştan sona çizilir; 2. turda balonda "Parmağınla üstünden
// geç!" yazarken rakamın ilk çizgisinin ~%70'i çizilmiş (parmak hâlâ ekranda) kare
async function rakamCiz(p) {
  const kagit = p.locator('.ok-kagit');
  await kagit.waitFor();
  await p.waitForTimeout(6000);
  const ciz = async (yollar, oran) => {
    const b = await p.locator('.ok-cizim-svg').boundingBox();
    const xy = ([x, y]) => [b.x + x * b.width, b.y + y * b.height];
    for (const y of yollar) {
      const n = [];
      for (let i = 0; i < y.length - 1; i++) for (let t = 0; t < 1; t += 0.1) n.push([y[i][0] + (y[i + 1][0] - y[i][0]) * t, y[i][1] + (y[i + 1][1] - y[i][1]) * t]);
      n.push(y[y.length - 1]);
      const son = oran < 1 ? Math.floor(n.length * oran) : n.length - 1;
      await p.mouse.move(...xy(n[0])); await p.mouse.down();
      for (let i = 1; i <= son; i++) await p.mouse.move(...xy(n[i]), { steps: 2 });
      if (oran < 1) return;
      await p.mouse.up(); await p.waitForTimeout(300);
    }
  };
  const ilk = await kagit.getAttribute('data-rakam');
  await ciz(JSON.parse(await kagit.getAttribute('data-yol')), 1);
  await p.waitForFunction((r) => { const k = document.querySelector('.ok-kagit'); return k && k.dataset.rakam !== r; }, ilk, { timeout: 20000 });
  await p.waitForTimeout(3500);
  await ciz(JSON.parse(await p.locator('.ok-kagit').getAttribute('data-yol')), 0.72);
}
// 06 Pasta Otobüsü: sipariş ortası. Parlayan (sıradaki) işe dokunulur; tabakta kremalı kurabiye, süs sırası gelince durulur
async function pastaSiparis(p) {
  for (let i = 0; i < 40; i++) {
    if ((await p.locator('.ps-gun').getAttribute('data-adim')) === 'sus') break;
    const s = p.locator('.ps-sirada').first();
    if (await s.count()) await s.click({ force: true }).catch(() => {});
    await p.waitForTimeout(900);
  }
  await p.waitForTimeout(1200);
}
// [klasör, ad, adres, bekleme ms, (isteğe bağlı) etkileşim]. Uygulama derlemesi (npm run build:app): ana menü sitenin kökünde
const LISTE = [
  ['', '01-ana-menu', '/', 5000],
  ['', '02-ege', '/macera/?test=1&ekran=bolum&yas=5&bolum=ege', 4500],
  ['', '03-pazar', '/pazar/?test=1&yas=5&ekran=pazar', 4500],
  ['', '04-salincak', '/macera/?test=1&ekran=bolum&yas=5&bolum=salincak', 4500],
  ['', '05-film', '/film/?test=1', 4000],
  ['', '06-pasta', '/pasta/?test=1&sifirla=1&ekran=gun&gun=2&firin=600,600000', 6000, pastaSiparis], // sipariş ortası (parlayan işe dokunarak)
  ['', '07-okul', '/okul/?test=1&yas=5&sifirla=1&tohum=7&etkinlik=rakam-ciz', 500, rakamCiz],
  ['ek/', 'meyve-suyu', '/pazar/?test=1&yas=4&ekran=meyvesuyu', 4500],
  ['ek/', 'banyo', '/macera/?test=1&ekran=bolum&yas=5&bolum=banyo', 4500],
  ['ek/', 'kartlar-bul', '/kartlar/?test=1&yas=5&tema=hayvanlar&tip=BUL', 3500],
  ['ek/', 'pasta-acilis', '/pasta/?test=1', 4500],
  ['ek/', 'canlan-ciz', '/canlan/?test=1&yas=5&ekran=ciz&resim=araba&mod=kopya', 4500],
];
const CIHAZ = { telefon: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 }, tablet: { viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2.5 } };
(async () => {
  const br = await chromium.launch();
  for (const [tur, c] of Object.entries(CIHAZ)) {
    const ctx = await br.newContext({ ...c, isMobile: true, hasTouch: true, locale: 'tr-TR' });
    for (const [alt, ad, adres, bekle, etkilesim] of LISTE) {
      if (NN.length && !(alt === '' && NN.includes(ad.slice(0, 2)))) continue;
      const p = await ctx.newPage();
      try {
        await p.goto(TABAN + adres, { waitUntil: 'load', timeout: 30000 }); await p.waitForTimeout(bekle);
        if (etkilesim) await etkilesim(p);
        const buf = await p.screenshot({ type: 'png' });
        const yol = path.join(HAM, tur, alt ? 'ek' : '', (alt ? ad : ad) + '.webp'); fs.mkdirSync(path.dirname(yol), { recursive: true });
        await sharp(buf).removeAlpha().webp({ quality: 95, effort: 5 }).toFile(yol); console.log(yol);
      } catch (e) { console.log(tur, ad, 'HATA', String(e).slice(0, 100)); }
      await p.close();
    }
    await ctx.close();
  }
  await br.close();
})();
