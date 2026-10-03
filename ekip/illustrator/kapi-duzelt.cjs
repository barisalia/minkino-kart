// Okula Hazırım kapı görselleri (assets/okul/kelime/kapi-acik.webp, kapi-kapali.webp) cilası.
// Gemini kapılarında çerçevenin dış kenarı konturlu değil, beyaza doğru soluyor; genel kesme bu kenarı pürüzlü bırakır.
// Çare: alfa kapatma (kapama + açma) ile kenar düzleşir, eksik kenar pikselleri aynı satırdaki en yakın çerçeve renginden dolar,
// dış kenara (yalnız açık renkli kenar piksellerine) ince koyu kahve kontur karışır. Açık kapıda doğru aralığındaki ışık lekesi şeffaflaşır.
// okul-ses-kelime-isle.cjs sonunda otomatik çalışır (girdi: aynı dosya, tekrar çalıştırmak güvenli: kenar zaten düzse değişmez).
// node kapi-duzelt.cjs [dosya ...]
const fs = require('fs');
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const KONTUR = [122, 58, 23], DIR = 'assets/okul/kelime/';
// açık kapıda temizlenecek doğru aralığı (tuval 529x540; kapı kanadının sağ kenarı x≈299, kasa iç kenarları x≈395, y≈55)
const ARALIK = { 'kapi-acik': [[150, 57], [394, 57], [394, 531], [299, 531], [299, 487], [299, 86]] };
// kapi-kapali: çerçevenin dış kenarı soluk ve basamaklı; satır satır düz (hafif bombeli) kenar çizgileriyle değiştirilir (y aralığında): [[x,y],...] sol ve sağ
const KENAR = { 'kapi-kapali': { y0: 16, y1: 486, sol: [[96, 16], [88, 70], [86, 200], [86, 420], [92, 486]], sag: [[436, 16], [436, 120], [431, 300], [429, 420], [434, 486]] } };
const enterp = (pts, y) => { for (let i = 0; i + 1 < pts.length; i++) if (y >= pts[i][1] && y <= pts[i + 1][1]) return pts[i][0] + ((y - pts[i][1]) / (pts[i + 1][1] - pts[i][1])) * (pts[i + 1][0] - pts[i][0]); return pts[pts.length - 1][0]; };
function poligonMaske(W, H, pts) { // basit tarama çizgisi dolgusu
  const m = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) { const xs = []; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0])); }
    xs.sort((p, q) => p - q); for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.ceil(xs[k]); x <= xs[k + 1]; x++) if (x >= 0 && x < W) m[y * W + x] = 1; }
  return m;
}
function maxFiltre(m, W, H, r) { const t = new Uint8Array(W * H), o = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let v = 0; for (let d = -r; d <= r && !v; d++) { const xx = x + d; if (xx >= 0 && xx < W && m[y * W + xx]) v = 1; } t[y * W + x] = v; }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let v = 0; for (let d = -r; d <= r && !v; d++) { const yy = y + d; if (yy >= 0 && yy < H && t[yy * W + x]) v = 1; } o[y * W + x] = v; }
  return o; }
const tersle = (m) => m.map((v) => 1 - v);
const kapat = (m, W, H, r) => tersle(maxFiltre(tersle(maxFiltre(m, W, H, r)), W, H, r)); // kapama: büyüt sonra küçült
const ac = (m, W, H, r) => maxFiltre(tersle(maxFiltre(tersle(m), W, H, r)), W, H, r);      // açma: küçült sonra büyüt

async function isle(ad) {
  const yol = DIR + ad + '.webp'; if (!fs.existsSync(yol)) return;
  const { data, info } = await s(fs.readFileSync(yol)).ensureAlpha().raw().toBuffer({ resolveWithObject: true }); const W = info.width, H = info.height, n = W * H;
  if (W !== 529 || H !== 540) { console.log(ad + ': tuval ' + W + 'x' + H + ' (beklenen 529x540 değil), atlandı'); return; }
  if (ARALIK[ad]) { const m = poligonMaske(W, H, ARALIK[ad]); for (let i = 0; i < n; i++) if (m[i]) data[i * 4 + 3] = 0; }
  let mask = new Uint8Array(n); for (let i = 0; i < n; i++) mask[i] = data[i * 4 + 3] > 100 ? 1 : 0;
  const onceki = Uint8Array.from(mask);
  mask = kapat(mask, W, H, 18); mask = ac(mask, W, H, 9); mask = kapat(mask, W, H, 6);
  if (ARALIK[ad]) { const m = poligonMaske(W, H, ARALIK[ad]); for (let i = 0; i < n; i++) if (m[i]) mask[i] = 0; }
  if (KENAR[ad]) { const K = KENAR[ad]; for (let y = K.y0; y <= K.y1; y++) { const xl = Math.round(enterp(K.sol, y)), xr = Math.round(enterp(K.sag, y)); for (let x = 0; x < W; x++) { const i = y * W + x; if (x >= xl && x <= xr) mask[i] = 1; else if (x < xl && x > xl - 70 && y < 478) mask[i] = 0; else if (x > xr && x < xr + 70 && y < 478) mask[i] = 0; } } }
  // yeni dolan pikseller: aynı satırda en yakın opak çerçeve rengi (≤ 60 px)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (!mask[i] || onceki[i]) continue;
    let bulundu = false; for (let d = 1; d <= 60 && !bulundu; d++) for (const xx of [x - d, x + d]) { if (xx < 0 || xx >= W) continue; const j = y * W + xx; if (onceki[j]) { for (let c = 0; c < 3; c++) data[i * 4 + c] = data[j * 4 + c]; bulundu = true; break; } }
    if (!bulundu) for (let d = 1; d <= 60 && !bulundu; d++) for (const yy of [y - d, y + d]) { if (yy < 0 || yy >= H) continue; const j = yy * W + x; if (onceki[j]) { for (let c = 0; c < 3; c++) data[i * 4 + c] = data[j * 4 + c]; bulundu = true; break; } } }
  // dış kenara kontur: kenar bandında (dışa ≤ 6 px) açık renkli pikseller koyu kahveye karışır
  const uz = new Int16Array(n).fill(99); let sinir = []; for (let i = 0; i < n; i++) if (!mask[i]) { uz[i] = 0; sinir.push(i); }
  for (let k = 1; k <= 6; k++) { const yeni = []; for (const p of sinir) { const x = p % W; for (const d of [-1, 1, -W, W]) { const r = p + d; if (r < 0 || r >= n || uz[r] <= k) continue; if ((d === -1 && x === 0) || (d === 1 && x === W - 1)) continue; uz[r] = k; yeni.push(r); } } sinir = yeni; }
  for (let i = 0; i < n; i++) { if (!mask[i]) { data[i * 4 + 3] = 0; continue; } const k = uz[i];
    const lum = (data[i * 4] * 3 + data[i * 4 + 1] * 6 + data[i * 4 + 2]) / 10;
    let t = k <= 3 ? 1 : k === 4 ? 0.6 : k === 5 ? 0.3 : 0;       // 3 px tam kontur, sonra yumuşak
    if (lum < 100) t = 0;                                         // zaten koyu çizgi varsa dokunma
    if (k <= 6 && t > 0) for (let c = 0; c < 3; c++) data[i * 4 + c] = Math.round(data[i * 4 + c] * (1 - t) + KONTUR[c] * t);
    data[i * 4 + 3] = 255; }
  // kenar yumuşatma (1 px alfa): dış komşusu olan piksellerin alfası kısılır
  for (let i = 0; i < n; i++) if (mask[i] && uz[i] === 1) data[i * 4 + 3] = 200;
  const buf = await s(data, { raw: { width: W, height: H, channels: 4 } }).webp({ quality: 94, alphaQuality: 100, effort: 5 }).toBuffer();
  fs.writeFileSync(yol, buf); console.log(ad + ': kenar düzeltildi, ' + W + 'x' + H + ', ' + Math.round(buf.length / 1024) + ' KB');
}
(async () => { for (const a of (process.argv.length > 2 ? process.argv.slice(2) : ['kapi-acik', 'kapi-kapali'])) await isle(a); })();
