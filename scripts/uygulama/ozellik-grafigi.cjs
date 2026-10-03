// Google Play özellik grafiği (1024x500): Recraft arka planı + asıl Mino, Kino ve MINKINO logosu
const s = require(process.cwd() + '/node_modules/sharp');
(async () => {
  const W = 1024, H = 500;
  const bg = await s('assets/uygulama/ozellik-arka.svg', { density: 200 }).resize(W, 512, { fit: 'cover' }).extract({ left: 0, top: 6, width: W, height: H }).png().toBuffer();
  const logo = await s('assets/uygulama/logo-minkino-asil-kenarli.png').resize({ width: 500 }).toBuffer();
  const lm = await s(logo).metadata();
  const mino = await s('ekip/mino/mino-final.png').trim({ threshold: 1 }).resize({ height: 330 }).toBuffer();
  const kino = await s('ekip/kino/kino-final.png').trim({ threshold: 1 }).resize({ height: 318 }).toBuffer();
  const mm = await s(mino).metadata();
  await s(bg).composite([
    { input: logo, left: 300, top: 34 },
    { input: kino, left: 300 + 250 - 10, top: H - 318 - 8 },
    { input: mino, left: 300 + 250 - mm.width + 30, top: H - 330 - 8 },
  ]).flatten({ background: '#2f95ea' }).png().toFile('assets/uygulama/one-cikan.png');
})();
