// Pamuk poz görsellerinde (poz-pamuk-*) KREM kürkü oyundaki SOĞUK BEYAZ Pamuk'a çevirir (referans: ekip/pamuk/pamuk-final: taban 236,244,248, gölge 196,204,220 mavi-gri).
// Yöntem (Lab, parlaklık L korunur → gölge ve doku aynen kalır): yalnız kürk pikselleri (sarımsı, düşük kroma, L yüksek) etkilenir;
//   b* (sarılık): b' = BETA - ALFA*b  (taban b≈8 → -4, gölge b≈22 → -8: kürk mavimsi beyaza, gölge mavi-griye), a' = a - AK.
// Pembe fiyonk/kulak içi/burun (a* yüksek), mavi göz (b* < 0), kahverengi kontur (L düşük), beyaz parlaklıklar (b*≈0) ağırlık dışıdır; kontur kenarı yumuşak ağırlıkla geçer (hale yok).
// Kullanım: const { sogut } = require('./pamuk-sogut.cjs'); const yeniWebp = await sogut(webpBuffer);   CLI: node pamuk-sogut.cjs <girdi.webp> <çıktı.webp>
const sharp = require(require.resolve('sharp', { paths: [process.cwd()] }));
const ALFA = 0.29, BETA = -1.7, AK = 3.0;
const sm = (x, a, b) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const gam = (c) => { const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055; return Math.max(0, Math.min(255, Math.round(v * 255))); };
const XN = 0.95047, YN = 1, ZN = 1.08883, E = 216 / 24389, K = 24389 / 27;
const f = (t) => (t > E ? Math.cbrt(t) : (K * t + 16) / 116), fi = (t) => (t * t * t > E ? t * t * t : (116 * t - 16) / K);
function rgb2lab(r, g, b) { const R = lin(r), G = lin(g), B = lin(b); const x = 0.4124564 * R + 0.3575761 * G + 0.1804375 * B, y = 0.2126729 * R + 0.7151522 * G + 0.072175 * B, z = 0.0193339 * R + 0.119192 * G + 0.9503041 * B;
  const fx = f(x / XN), fy = f(y / YN), fz = f(z / ZN); return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]; }
function lab2rgb(L, a, b) { const fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - b / 200; const x = XN * fi(fx), y = YN * fi(fy), z = ZN * fi(fz);
  return [gam(3.2404542 * x - 1.5371385 * y - 0.4985314 * z), gam(-0.969266 * x + 1.8760108 * y + 0.041556 * z), gam(0.0556434 * x - 0.2040259 * y + 1.0572252 * z)]; }
/** kürk ağırlığı (0..1) */
function agirlik(L, a, b) {
  const wL = sm(L, 62, 80);                                   // kontur ve koyu kenar dışı
  const wb = sm(b, 1.5, 4.5) * (1 - sm(b, 30, 40));          // sarımsı (krem); b≈0 beyaz parlaklık ve b<0 mavi göz dışı
  const wa = 1 - sm(a, 9, 15);                                // pembe (fiyonk, kulak içi, burun) dışı
  return wL * wb * wa;
}
async function sogut(webp) {
  const { data, info } = await sharp(webp).ensureAlpha().raw().toBuffer({ resolveWithObject: true }); const out = Buffer.from(data); let n = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const [L, a, b] = rgb2lab(data[i], data[i + 1], data[i + 2]), w = agirlik(L, a, b); if (w < 0.01) continue;
    const bn = BETA - ALFA * b, an = a - AK, [r, g, bl] = lab2rgb(L, a + (an - a) * w, b + (bn - b) * w);
    out[i] = r; out[i + 1] = g; out[i + 2] = bl; n++;
  }
  const buf = await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).webp({ quality: 94, alphaQuality: 100, effort: 5 }).toBuffer();
  return { buf, degisen: n, genislik: info.width, yukseklik: info.height };
}
module.exports = { sogut, rgb2lab, agirlik };
if (require.main === module) {
  const fs = require('fs'); const [girdi, cikti] = process.argv.slice(2);
  if (!girdi) { // referans renkler: Lab ve ağırlık
    for (const [ad, c] of [['krem taban', [248, 240, 224]], ['krem taban2', [248, 248, 232]], ['krem taban3', [248, 248, 240]], ['krem gölge', [232, 208, 176]], ['krem gölge2', [232, 208, 184]], ['beyaz', [248, 248, 248]], ['pembe fiyonk', [248, 168, 168]], ['pembe gölgeli', [240, 208, 184]], ['mavi göz', [90, 150, 200]], ['kontur', [90, 40, 25]], ['soğuk taban', [236, 244, 248]], ['soğuk gölge', [196, 204, 220]]]) {
      const [L, a, b] = rgb2lab(...c); console.log(ad.padEnd(14), c.join(',').padEnd(12), 'L', L.toFixed(1), 'a', a.toFixed(1), 'b', b.toFixed(1), 'ağırlık', agirlik(L, a, b).toFixed(2)); }
  } else sogut(fs.readFileSync(girdi)).then((r) => { fs.writeFileSync(cikti, r.buf); console.log(cikti, r.genislik + 'x' + r.yukseklik, r.degisen + ' piksel değişti'); });
}
