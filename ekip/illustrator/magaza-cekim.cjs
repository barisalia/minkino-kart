// Mağaza ekran görüntüleri için ham oyun görüntüleri (Playwright, mobil emülasyon): assets/uygulama/ekran-ham/{telefon,tablet}/NN-ad.webp (+ ek/ klasörüne yedek sahneler).
// Telefon 390x844 @3x (1170x2532), tablet 768x1024 @2.5x (1920x2560). Üretim derlemesi gerekir: npx vite build --outDir <klasör>; sunucu: statik http (örn. node sunucu.cjs <klasör> 4178).
// Sıra magaza-ekran.cjs ile aynı: 01 ana menü (Mino ve Kino), 02 Ege (ses), 03 Pazar (say/eşleştir), 04 Salıncak (hikâye), 05 Çizgi film listesi (öğüt), 06 Meyve Suyu Pazarı (güvenli/reklamsız; Pasta Otobüsü'nün yeni çizimleri bağlanınca ek/pasta-acilis yerine pasta oyun sahnesi çekilip 06 olarak konabilir).
// node magaza-cekim.cjs [taban=http://localhost:4178] [NN ...]
const fs = require('fs'), path = require('path');
const { chromium } = require(require.resolve('playwright', { paths: [process.cwd()] }));
const sharp = require(require.resolve('sharp', { paths: [process.cwd()] }));
const TABAN = process.argv.slice(2).find((x) => x.startsWith('http')) || 'http://localhost:4178', NN = process.argv.slice(2).filter((x) => /^\d\d$/.test(x));
const HAM = 'assets/uygulama/ekran-ham/';
// [klasör, ad, adres, bekleme ms, (isteğe bağlı) etkileşim]
const LISTE = [
  ['', '01-ana-menu', '/uygulama/', 5000],
  ['', '02-ege', '/macera/?test=1&ekran=bolum&yas=5&bolum=ege', 4500],
  ['', '03-pazar', '/pazar/?test=1&yas=5&ekran=pazar', 4500],
  ['', '04-salincak', '/macera/?test=1&ekran=bolum&yas=5&bolum=salincak', 4500],
  ['', '05-film', '/film/?test=1', 4000],
  ['', '06-meyve-suyu', '/pazar/?test=1&yas=4&ekran=meyvesuyu', 4500],
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
    for (const [alt, ad, adres, bekle] of LISTE) {
      if (NN.length && !(alt === '' && NN.includes(ad.slice(0, 2)))) continue;
      const p = await ctx.newPage();
      try {
        await p.goto(TABAN + adres, { waitUntil: 'load', timeout: 30000 }); await p.waitForTimeout(bekle);
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
