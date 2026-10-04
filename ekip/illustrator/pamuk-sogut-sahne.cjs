// Sahne görsellerinde (dedektif kapak, roman-2..4) YALNIZ Pamuk'un kürkünü soğuk beyaza çevirir; duvar, halı, abajur, battaniye, kâğıt vb. değişmez.
// Pamuk maskesi: elle seçilmiş tohum noktalarından (TOHUM) koyu kontur ve renk sınırıyla (kürk/beyaz/pembe tonları; koyu, mavi, yeşil, ahşap kahvesi değil) yayılan bileşen,
// ayrıca YASAK çokgenler (maskeye girmeyen bölgeler: açık sınırlarda sızıntıyı keser). Kürk dönüşümü pamuk-sogut.cjs ile aynı (Lab, parlaklık korunur) ama yalnız maske içinde.
// Kullanım: const { sogutSahne } = require('./pamuk-sogut-sahne.cjs'); const { buf, degisen } = await sogutSahne(webpBuffer, 'roman-2');
// CLI (hata ayıklama): node pamuk-sogut-sahne.cjs <ad> <girdi.webp> <cikti.webp> [maske-kaplama.png]   |   node pamuk-sogut-sahne.cjs --farki <ad> <once.webp> <sonra.webp> <fark.png>
const sharp = require(require.resolve('sharp', { paths: [process.cwd()] }));
const { rgb2lab, lab2rgb, agirlik } = require('./pamuk-sogut.cjs');
// ad → { tohum: [[x,y],...], yasak: [ [[x,y],...], ... ] }  (1600x1200 koordinatları)
const AYAR = {
  kapak: { tohum: [[940, 590], [1050, 600], [1000, 700], [940, 770], [900, 560], [1105, 1012]], yasak: [] },
  'roman-2': { tohum: [[985, 470], [900, 540], [760, 470], [700, 520], [510, 340], [570, 600], [690, 625], [880, 640], [970, 720], [1065, 690]], yasak: [] },
  'roman-3': { tohum: [[620, 310], [830, 540], [900, 600], [1030, 500], [1100, 540], [480, 470], [560, 610], [880, 700], [990, 690], [880, 725], [990, 715]], yasak: [] },
  'roman-4': { tohum: [[880, 760], [1000, 760], [800, 880], [860, 950], [1040, 915]], yasak: [] },
};
const KOYU_L = 58;
function izinli(L, a, b) { return L >= KOYU_L && b >= -6 && b <= 30 && a >= -8 && a <= 45; }
function poligonIcinde(x, y, p) { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) if (((p[i][1] > y) !== (p[j][1] > y)) && (x < ((p[j][0] - p[i][0]) * (y - p[i][1])) / (p[j][1] - p[i][1]) + p[i][0])) c = !c; return c; }

async function pamukMaskesi(rgb, W, H, ad) {
  const cfg = AYAR[ad]; if (!cfg) throw new Error('ayar yok: ' + ad); const n = W * H;
  const ok = new Uint8Array(n), Ls = new Float32Array(n), As = new Float32Array(n), Bs = new Float32Array(n);
  for (let i = 0; i < n; i++) { const [L, a, b] = rgb2lab(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]); Ls[i] = L; As[i] = a; Bs[i] = b; ok[i] = izinli(L, a, b) ? 1 : 0; }
  for (const p of cfg.yasak || []) { let x0 = W, x1 = 0, y0 = H, y1 = 0; for (const [x, y] of p) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    for (let y = Math.max(0, y0); y <= Math.min(H - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(W - 1, x1); x++) if (poligonIcinde(x, y, p)) ok[y * W + x] = 0; }
  const m = new Uint8Array(n), q = new Int32Array(n); let bas = 0, son = 0;
  for (const [x, y] of cfg.tohum) { const i = y * W + x; if (!ok[i]) { console.log(ad + ': tohum izinli değil, atlandı', x, y); continue; } if (!m[i]) { m[i] = 1; q[son++] = i; } }
  while (bas < son) { const p = q[bas++], x = p % W; for (const d of [-1, 1, -W, W]) { const r = p + d; if (r < 0 || r >= n || m[r] || !ok[r]) continue; if ((d === -1 && x === 0) || (d === 1 && x === W - 1)) continue; m[r] = 1; q[son++] = r; } }
  return { m, Ls, As, Bs, alan: son };
}
const ALFA = 0.29, BETA = -1.7, AK = 3.0;
/** Ham RGB (3 kanal, W*H*3) üzerinde yerinde: yalnız Pamuk maskesindeki kürk pikselleri değişir; yeniden sıkıştırma yok. Döner: { degisen, alan } */
async function sogutSahneRaw(rgb, W, H, ad) {
  const { m, Ls, As, Bs, alan } = await pamukMaskesi(rgb, W, H, ad); let degisen = 0;
  for (let i = 0; i < W * H; i++) { if (!m[i]) continue; const w = agirlik(Ls[i], As[i], Bs[i]); if (w < 0.01) continue;
    const bn = BETA - ALFA * Bs[i], an = As[i] - AK, [r, g, b] = lab2rgb(Ls[i], As[i] + (an - As[i]) * w, Bs[i] + (bn - Bs[i]) * w); rgb[i * 3] = r; rgb[i * 3 + 1] = g; rgb[i * 3 + 2] = b; degisen++; }
  console.log(ad + ': Pamuk maskesi ' + alan + ' px, kürk değişen ' + degisen + ' px'); return { degisen, alan };
}
async function sogutSahne(webp, ad, kaplamaYol) {
  const { data, info } = await sharp(webp).removeAlpha().raw().toBuffer({ resolveWithObject: true }); const W = info.width, H = info.height, n = W * H;
  const { m, Ls, As, Bs, alan } = await pamukMaskesi(data, W, H, ad); const out = Buffer.from(data); let degisen = 0;
  for (let i = 0; i < n; i++) { if (!m[i]) continue; const w = agirlik(Ls[i], As[i], Bs[i]); if (w < 0.01) continue;
    const bn = BETA - ALFA * Bs[i], an = As[i] - AK, [r, g, b] = lab2rgb(Ls[i], As[i] + (an - As[i]) * w, Bs[i] + (bn - Bs[i]) * w); out[i * 3] = r; out[i * 3 + 1] = g; out[i * 3 + 2] = b; degisen++; }
  if (kaplamaYol) { const k = Buffer.from(data); for (let i = 0; i < n; i++) if (m[i]) { k[i * 3] = Math.round(k[i * 3] * 0.45 + 255 * 0.55); k[i * 3 + 1] = Math.round(k[i * 3 + 1] * 0.45); k[i * 3 + 2] = Math.round(k[i * 3 + 2] * 0.45 + 255 * 0.55); }
    await sharp(k, { raw: { width: W, height: H, channels: 3 } }).png().toFile(kaplamaYol); }
  const buf = await sharp(out, { raw: { width: W, height: H, channels: 3 } }).webp({ quality: 90, effort: 5 }).toBuffer();
  console.log(ad + ': Pamuk maskesi ' + alan + ' px, kürk değişen ' + degisen + ' px');
  return { buf, degisen, alan };
}
module.exports = { sogutSahne, sogutSahneRaw, AYAR };
if (require.main === module) {
  const fs = require('fs'); const a = process.argv.slice(2);
  if (a[0] === '--farki') { // iki görsel arasında değişen piksellerin haritası (değişmeyen soluk; değişen kırmızı): "başka hiçbir şeye dokunulmadı" doğrulaması
    const [, , once, sonra, cikti] = a; Promise.all([sharp(once).removeAlpha().raw().toBuffer({ resolveWithObject: true }), sharp(sonra).removeAlpha().raw().toBuffer({ resolveWithObject: true })]).then(async ([A, B]) => {
      const n = A.info.width * A.info.height, k = Buffer.alloc(n * 3); let say = 0; for (let i = 0; i < n; i++) { const d = Math.abs(A.data[i * 3] - B.data[i * 3]) + Math.abs(A.data[i * 3 + 1] - B.data[i * 3 + 1]) + Math.abs(A.data[i * 3 + 2] - B.data[i * 3 + 2]);
        if (d > 3) { k[i * 3] = 255; say++; } else { k[i * 3] = A.data[i * 3] * 0.25 + 190; k[i * 3 + 1] = A.data[i * 3 + 1] * 0.25 + 190; k[i * 3 + 2] = A.data[i * 3 + 2] * 0.25 + 190; } }
      await sharp(k, { raw: { width: A.info.width, height: A.info.height, channels: 3 } }).png().toFile(cikti); console.log('değişen piksel', say); }); }
  else { const [ad, girdi, cikti, kaplama] = a; sogutSahne(fs.readFileSync(girdi), ad, kaplama).then((r) => fs.writeFileSync(cikti, r.buf)); }
}
