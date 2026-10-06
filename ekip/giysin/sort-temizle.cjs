// Şortun altına karışan pembe çorap yakasını siler (e4 çiziminde şort ve çorap üst üste): pembe/kırmızı pikseller
// ve onların altındaki kontur artığı. node ekip/giysin/sort-temizle.cjs  (sonra: node ekip/giysin/varlik.cjs ikon)
const sharp = require('sharp');
const fs = require('fs');
(async () => {
  const yol = 'ekip/giysin/parca/sort.png';
  const { data, info } = await sharp(yol).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const pembe = (i) => data[i * 4] > 170 && data[i * 4] - data[i * 4 + 2] > 18 && data[i * 4] - data[i * 4 + 1] > 30;
  // her sütunda ilk pembe pikselden aşağısı silinir (çorap yakası şortun altında)
  for (let x = 0; x < W; x++) {
    let y0 = -1;
    for (let y = Math.round(H * 0.55); y < H; y++) if (data[(y * W + x) * 4 + 3] > 100 && pembe(y * W + x)) { y0 = y; break; }
    if (y0 < 0) continue;
    for (let y = Math.max(0, y0 - 3); y < H; y++) data[(y * W + x) * 4 + 3] = y < y0 ? Math.min(data[(y * W + x) * 4 + 3], 255 - (y0 - y) * 60) : 0;
  }
  // şort paçasının altı (çizimin bacak artığı): her sütunda son mavi pikselin 14 px altından aşağısı silinir
  const mavi = (i) => data[i * 4 + 3] > 100 && data[i * 4 + 2] - data[i * 4] > 40;
  for (let x = 0; x < W; x++) {
    let son = -1;
    for (let y = 0; y < H; y++) if (mavi(y * W + x)) son = y;
    const kes = son < 0 ? 0 : son + 14;
    for (let y = kes; y < H; y++) {
      const d = y - kes;
      data[(y * W + x) * 4 + 3] = d < 3 ? Math.round(data[(y * W + x) * 4 + 3] * (1 - d / 3)) : 0;
    }
  }
  const buf = await sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
  fs.writeFileSync(yol, buf);
  await sharp(buf).webp({ quality: 86, alphaQuality: 100 }).toFile('assets/giysin/giysi/sort.webp');
  console.log('sort temiz');
  // sağ eldiven: soluna atkı saçağı ve kol artığı karışmış; eldivenin en soldaki kırmızısından 14 px ötesi silinir
  {
    const y2 = 'ekip/giysin/parca/eldiven-sag.png';
    const { data: d, info: f } = await sharp(y2).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const kirmizi = (i) => d[i * 4 + 3] > 150 && d[i * 4] > 150 && d[i * 4 + 1] < 110 && d[i * 4 + 2] < 110;
    const say = new Int32Array(f.width);
    for (let i = 0; i < f.width * f.height; i++) if (kirmizi(i)) say[i % f.width]++;
    const x0 = say.findIndex((n) => n > f.height * 0.12);
    const kes = Math.max(0, x0 - 5);
    for (let i = 0; i < f.width * f.height; i++) {
      const x = i % f.width;
      if (x < kes) d[i * 4 + 3] = 0;
      else if (x < kes + 3) d[i * 4 + 3] = Math.round(d[i * 4 + 3] * ((x - kes + 1) / 4));
    }
    const b2 = await sharp(d, { raw: { width: f.width, height: f.height, channels: 4 } }).png().toBuffer();
    fs.writeFileSync(y2, b2);
    await sharp(b2).webp({ quality: 86, alphaQuality: 100 }).toFile('assets/giysin/giysi/eldiven-sag.webp');
    console.log('eldiven temiz', kes);
  }
})();
