/**
 * Konuşma satırlarındaki küçük karakter yüzleri (madalyon): kitabın KENDİ tam sayfa çizimlerinden yuvarlak kırpılır,
 * yalnız küçültülür (netlik: madalyon en çok 48 CSS px; 144 px çıktı × DPR 3'e yeter).
 *   node ekip/kitap/kitap-yuz.cjs            → assets/kitap/okul/yuz-<kim>.webp
 * Yeni kitap: TABLO'ya [kitap, kim, sayfa, merkez x, merkez y, yarıçap] (1376×768 çizimdeki px) eklenir.
 * Çizim daha büyük gelirse (2752) ölçüler kaynak enine göre kendiliğinden ölçeklenir.
 */
const sharp = require('sharp');
const path = require('node:path');

const TABLO = [
  ['okul', 'kino', 's02', 923, 324, 98],
  ['okul', 'anne', 's02', 1141, 201, 100],
  ['okul', 'baba', 's02', 390, 252, 112],
  ['okul', 'lokum', 's02', 1146, 556, 88],
  ['okul', 'mino', 's03', 310, 396, 100],
  ['okul', 'ogretmen', 's04', 930, 235, 105],
  ['okul', 'tombi', 's10', 222, 452, 100],
];
const BOY = 144;

(async () => {
  const bulut = path.resolve(__dirname, '../kalite/minkino-gorsel-rehberi/pozlar/bulut/on.png');
  const kitaplar = { dizim: 180, doktor: 168, okul: 144, ucurtma: 180, ustkat: 180 };
  for (const [kitap, boy] of Object.entries(kitaplar)) {
    const maske = Buffer.from(`<svg width="${boy}" height="${boy}"><circle cx="${boy/2}" cy="${boy/2}" r="${boy/2}"/></svg>`);
    const portre = await sharp(bulut).extract({ left: 53, top: 0, width: 911, height: 911 })
      .resize(boy, boy).flatten({ background: '#ccede2' }).png().toBuffer();
    await sharp(portre).ensureAlpha().composite([{ input: maske, blend: 'dest-in' }])
      .webp({ lossless: true }).toFile(path.resolve(__dirname, '../../assets/kitap', kitap, 'yuz-bulut.webp'));
  }
  if (process.argv.includes('--bulut')) return;
  for (const [kitap, kim, sayfa, x, y, r] of TABLO) {
    const klasor = path.join(__dirname, '..', '..', 'assets', 'kitap', kitap);
    const kaynak = path.join(klasor, `${sayfa}-tam.webp`);
    const { width } = await sharp(kaynak).metadata();
    const k = width / 1376;
    const [cx, cy, cr] = [x * k, y * k, r * k].map(Math.round);
    const daire = Buffer.from(`<svg width="${BOY}" height="${BOY}"><circle cx="${BOY / 2}" cy="${BOY / 2}" r="${BOY / 2}" fill="#000"/></svg>`);
    await sharp(kaynak)
      .extract({ left: cx - cr, top: cy - cr, width: 2 * cr, height: 2 * cr })
      .resize(BOY, BOY, { kernel: 'lanczos3' })
      .ensureAlpha()
      .composite([{ input: daire, blend: 'dest-in' }])
      .webp({ quality: 92, alphaQuality: 100 })
      .toFile(path.join(klasor, `yuz-${kim}.webp`));
    console.log(kitap, kim, `${2 * cr}px → ${BOY}px`);
  }
})();
