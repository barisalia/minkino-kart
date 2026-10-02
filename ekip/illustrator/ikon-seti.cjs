// Uygulama ikon takımı: public/ikon-1024.png (+ assets/uygulama/ikon-on.png, ikon-arka.png) kaynağından
//  - web:     public/ikon-512.png, public/ikon-180.png (apple-touch), public/favicon.svg (gömülü PNG), public/favicon.ico (16/32/48)
//  - Android: assets/uygulama/ikonlar/android/mipmap-*/ (ic_launcher, ic_launcher_round, ic_launcher_foreground, ic_launcher_background) + mipmap-anydpi-v26/*.xml + ic_launcher-playstore.png (512)
//  - iOS:     assets/uygulama/ikonlar/ios/AppIcon.appiconset/ (iPhone + iPad + 1024 pazarlama, alfasız) + Contents.json
// Paketleme (cap add sonrası) kopyalama yerleri: assets/uygulama/ikonlar/OKU.md. Tekrar çalıştırmak güvenli. node ikon-seti.cjs
const fs = require('fs'), path = require('path');
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const KAYNAK = 'public/ikon-1024.png', ON = 'assets/uygulama/ikon-on.png', ARKA = 'assets/uygulama/ikon-arka.png', KOK = 'assets/uygulama/ikonlar/';
const yaz = (yol, buf) => { fs.mkdirSync(path.dirname(yol), { recursive: true }); fs.writeFileSync(yol, buf); };
const kare = (px) => s(KAYNAK).resize(px, px, { kernel: 'lanczos3' }).removeAlpha().png().toBuffer();
const yuvarlak = async (px, oran) => s(await s(KAYNAK).resize(px, px, { kernel: 'lanczos3' }).ensureAlpha().png().toBuffer()).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}"><rect width="${px}" height="${px}" rx="${px * oran}" fill="#fff"/></svg>`), blend: 'dest-in' }]).png().toBuffer();
const daire = async (px) => s(await s(KAYNAK).resize(px, px, { kernel: 'lanczos3' }).ensureAlpha().png().toBuffer()).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}"><circle cx="${px / 2}" cy="${px / 2}" r="${px / 2}" fill="#fff"/></svg>`), blend: 'dest-in' }]).png().toBuffer();
const ayri = async (kaynak, px, alfasiz) => { let g = s(kaynak).resize(px, px, { kernel: 'lanczos3' }); if (alfasiz) g = g.flatten({ background: '#FFF4DD' }).removeAlpha(); return g.png().toBuffer(); };

(async () => {
  // ---- web
  yaz('public/ikon-512.png', await kare(512)); yaz('public/ikon-180.png', await kare(180));
  const g128 = await yuvarlak(128, 0.22);
  yaz('public/favicon.svg', Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 64 64"><image width="64" height="64" xlink:href="data:image/png;base64,${g128.toString('base64')}"/></svg>\n`));
  const ico = [16, 32, 48]; const png = []; for (const p of ico) png.push(await yuvarlak(p, 0.2));
  const baslik = Buffer.alloc(6 + 16 * ico.length); baslik.writeUInt16LE(0, 0); baslik.writeUInt16LE(1, 2); baslik.writeUInt16LE(ico.length, 4);
  let ofs = baslik.length; ico.forEach((p, i) => { const o = 6 + 16 * i; baslik[o] = p; baslik[o + 1] = p; baslik[o + 2] = 0; baslik[o + 3] = 0; baslik.writeUInt16LE(1, o + 4); baslik.writeUInt16LE(32, o + 6); baslik.writeUInt32LE(png[i].length, o + 8); baslik.writeUInt32LE(ofs, o + 12); ofs += png[i].length; });
  yaz('public/favicon.ico', Buffer.concat([baslik, ...png]));

  // ---- Android
  const A = KOK + 'android/';
  const yog = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
  for (const [ad, k] of Object.entries(yog)) {
    const d = `${A}mipmap-${ad}/`, lp = Math.round(48 * k), ap = Math.round(108 * k);
    yaz(d + 'ic_launcher.png', await yuvarlak(lp, 0.16)); yaz(d + 'ic_launcher_round.png', await daire(lp));
    yaz(d + 'ic_launcher_foreground.png', await ayri(ON, ap, false)); yaz(d + 'ic_launcher_background.png', await ayri(ARKA, ap, true));
  }
  const xml = (r) => `<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n    <background android:drawable="@mipmap/ic_launcher_background"/>\n    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n</adaptive-icon>\n`;
  yaz(A + 'mipmap-anydpi-v26/ic_launcher.xml', xml()); yaz(A + 'mipmap-anydpi-v26/ic_launcher_round.xml', xml());
  yaz(A + 'ic_launcher-playstore.png', await kare(512));

  // ---- iOS
  const I = KOK + 'ios/AppIcon.appiconset/';
  const liste = [
    ['iphone', 20, 2], ['iphone', 20, 3], ['iphone', 29, 2], ['iphone', 29, 3], ['iphone', 40, 2], ['iphone', 40, 3], ['iphone', 60, 2], ['iphone', 60, 3],
    ['ipad', 20, 1], ['ipad', 20, 2], ['ipad', 29, 1], ['ipad', 29, 2], ['ipad', 40, 1], ['ipad', 40, 2], ['ipad', 76, 1], ['ipad', 76, 2], ['ipad', 83.5, 2],
  ];
  const resimler = [];
  for (const [idiom, boy, k] of liste) { const px = Math.round(boy * k), ad = `AppIcon-${boy}x${boy}@${k}x${idiom === 'ipad' ? '~ipad' : ''}.png`; yaz(I + ad, await kare(px)); resimler.push({ filename: ad, idiom, scale: `${k}x`, size: `${boy}x${boy}` }); }
  yaz(I + 'AppIcon-1024.png', await kare(1024)); resimler.push({ filename: 'AppIcon-1024.png', idiom: 'ios-marketing', scale: '1x', size: '1024x1024' });
  yaz(I + 'Contents.json', Buffer.from(JSON.stringify({ images: resimler, info: { author: 'xcode', version: 1 } }, null, 2) + '\n'));

  yaz(KOK + 'OKU.md', Buffer.from(`# Uygulama ikon takımı (otomatik: ekip/illustrator/ikon-seti.cjs)

Kaynak: \`public/ikon-1024.png\` (Mino + Kino, gökyüzü ve tepecik), \`assets/uygulama/ikon-on.png\` (uyarlanabilir ön), \`ikon-arka.png\` (uyarlanabilir arka). Yeniden üretmek için önce \`node ekip/illustrator/magaza-yedek.cjs\` (ya da Gemini ikonu gelince onun betiği), sonra \`node ekip/illustrator/ikon-seti.cjs\`.

## Capacitor'dan sonra nereye
**Android** (\`npx cap add android\` sonrası):
- \`android/*/mipmap-*\` klasörlerinin içeriğini \`android/app/src/main/res/\` içine kopyala (var olan \`ic_launcher*.png\` ve \`mipmap-anydpi-v26/*.xml\` üzerine yaz).
- Capacitor şablonundaki \`res/drawable/ic_launcher_background.xml\` ve \`res/drawable-v24/ic_launcher_foreground.xml\` artık kullanılmaz: silinebilir (yeni XML'ler \`@mipmap/ic_launcher_background\` ve \`@mipmap/ic_launcher_foreground\` PNG'lerine bakar). \`values/ic_launcher_background.xml\` kalabilir.
- \`ic_launcher-playstore.png\` (512x512): Play Console mağaza ikonu.
- Ön katman 108 dp (mdpi 108 … xxxhdpi 432 px); içerik 66 dp'lik güvenli dairenin içinde.

**iOS** (\`npx cap add ios\` sonrası):
- \`ios/AppIcon.appiconset\` klasörünün tamamını \`ios/App/App/Assets.xcassets/AppIcon.appiconset/\` yerine koy. Hepsi alfasız. \`AppIcon-1024.png\` App Store pazarlama ikonu; Xcode 14+ tek 1024 dosyasını da kabul eder, ama tam set eski sürümlerle de çalışır.

**Web**: \`public/ikon-512.png\`, \`public/ikon-180.png\` (apple-touch), \`public/favicon.svg\`, \`public/favicon.ico\` doğrudan \`public/\` içinde üretildi.
`));
  // özet
  const sayi = (d) => fs.readdirSync(d, { recursive: true }).filter((f) => /\.(png|xml|json|md)$/.test(String(f))).length; console.log('dosya sayısı', sayi(KOK));
})();
