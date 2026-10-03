// Tek kaynaktan bütün simgeler: assets/uygulama/ikon-kaynak-2048.webp (Recraft/nano banana pro, asıl Mino+Kino+MINKINO)
// Play 512, App Store ve iOS boyutları, Android eski ve uyarlanabilir (adaptive) katmanlar, özellik grafiği 1024x500.
const s = require(process.cwd() + '/node_modules/sharp');
const fs = require('fs');
const KAYNAK = 'assets/uygulama/ikon-kaynak-2048.webp';
(async () => {
  const kare = (n) => s(KAYNAK).resize(n, n).removeAlpha().png();
  await kare(1024).toFile('assets/uygulama/ikon-magaza-1024.png');
  await kare(512).toFile('assets/uygulama/ikonlar/android/ic_launcher-playstore.png');
  // iOS
  const dir = 'ios/App/App/Assets.xcassets/AppIcon.appiconset/';
  const c = JSON.parse(fs.readFileSync(dir + 'Contents.json', 'utf8'));
  for (const im of c.images) {
    if (!im.filename) continue;
    const n = Math.round(parseFloat(im.size) * parseFloat(im.scale || '1'));
    await kare(n).toFile(dir + im.filename);
  }
  // Android: köşedeki gök mavisi rengi, uyarlanabilir simgenin taşan kısmı için
  const { data } = await s(KAYNAK).resize(8, 8).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const kenar = { r: data[0], g: data[1], b: data[2] };
  const yogunluk = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
  for (const [ad, k] of Object.entries(yogunluk)) {
    const d = `android/app/src/main/res/mipmap-${ad}/`;
    const eski = Math.round(48 * k);
    await kare(eski).toFile(d + 'ic_launcher.png');
    const daire = Buffer.from(`<svg width="${eski}" height="${eski}"><circle cx="${eski / 2}" cy="${eski / 2}" r="${eski / 2}"/></svg>`);
    await kare(eski).composite([{ input: daire, blend: 'dest-in' }]).png().toFile(d + 'ic_launcher_round.png');
    // uyarlanabilir: 108dp katman, görünen ~72dp daire; tasarım 64dp'ye sığdırılır, kalan zemin gök mavisi
    const kat = Math.round(108 * k), ic = Math.round(64 * k), pay = Math.round((kat - ic) / 2);
    const icBuf = await s(KAYNAK).resize(ic, ic).png().toBuffer();
    await s({ create: { width: kat, height: kat, channels: 4, background: { ...kenar, alpha: 1 } } })
      .composite([{ input: icBuf, left: pay, top: pay }]).png().toFile(d + 'ic_launcher_background.png');
    await s({ create: { width: kat, height: kat, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png().toFile(d + 'ic_launcher_foreground.png');
  }
  // Özellik grafiği 1024x500 (kaynak 2752x1536; üst-alt eşit kırpılır)
  const m = await s('assets/uygulama/ozellik-kaynak.webp').metadata();
  const h = Math.round(m.width * 500 / 1024), ust = Math.round((m.height - h) / 2) - 20;
  await s('assets/uygulama/ozellik-kaynak.webp').extract({ left: 0, top: Math.max(0, ust), width: m.width, height: h }).resize(1024, 500).removeAlpha().png().toFile('assets/uygulama/one-cikan.png');
  console.log('simgeler hazır; kenar rengi', kenar);
})();
