// Varlık panosu: assets/giysin altındaki şeffaf resimler koyu ve açık zeminde (hale denetimi)
// node ekip/giysin/pano.cjs <cikti.png> <zemin> dosya1 dosya2 ...
const sharp = require('sharp');
(async () => {
  const [, , cikti, zemin, ...dosyalar] = process.argv;
  const H = 300;
  const parca = [];
  let x = 10;
  for (const d of dosyalar) {
    const b = await sharp(d).resize({ height: H, width: 420, fit: 'inside' }).png().toBuffer({ resolveWithObject: true });
    parca.push({ input: b.data, left: x, top: 10 });
    x += b.info.width + 10;
  }
  await sharp({ create: { width: x, height: H + 20, channels: 4, background: zemin } }).composite(parca).png().toFile(cikti);
})();
