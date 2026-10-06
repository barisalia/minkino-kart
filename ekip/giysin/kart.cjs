// Menü kartı resmi: kış giysileriyle Kino (assets/giysin/kart-kino.webp) — ana menü kartı (uygulama/src/oyunlar.ts)
const sharp = require('sharp');
const yer = require(process.cwd() + '/giysin/src/giysi-yer.json');
(async () => {
  const sira = ['corap', 'bot', 'mont', 'atki', 'eldiven-sol', 'eldiven-sag', 'bere'];
  const buf = await sharp('ekip/kino/kino-final.png')
    .composite(sira.map((p) => ({ input: `assets/giysin/giysi/${p}.webp`, left: yer[p][0], top: yer[p][1] })))
    .png()
    .toBuffer();
  const k = await sharp(buf).trim({ threshold: 1 }).png().toBuffer();
  await sharp(k).resize(520, 520, { fit: 'inside' }).webp({ quality: 86, alphaQuality: 100 }).toFile('assets/giysin/kart-kino.webp');
  // dosyanın satır sonunu da düzelt (cumleler.ts CRLF)
  const fs = require('fs');
  let s = fs.readFileSync('src/audio/cumleler.ts', 'utf8');
  s = s.replace(/\r?\n/g, '\r\n');
  fs.writeFileSync('src/audio/cumleler.ts', s);
})();
