// Gemini çıkartmaları (kalın beyaz kenarlı etiket, beyaz zemin üstünde, dışta yumuşak gölge) → şeffaf webp; beyaz kenar İÇTE kalır, dış zemin ve gölge şeffaf olur.
// Yöntem: çizim = doygun (max-min > 28) veya koyu (min < 120) pikseller; çizim kenar genişliği (R px, çıkartma boyuna göre) kadar büyütülür (kesim şekli) ve yalnız
// gerçekten beyaz pikseller (min >= 243, düşük doygunluk) ile çizimde kalır (dıştaki gölge ve gri kenar çizgisi dışarıda kalır); kapalı iç boşluklar (inek karnı, davul derisi) doldurulur;
// kenar 1 px yumuşatılır. node cikartma-isle.cjs <girdi klasörü> <çıktı klasörü> [ad ...]   (ad verilmezse cikartma-*.png)
const fs = require('fs'), path = require('path');
const guvenliYaz = require('./guvenli-yaz.cjs');
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const [girdi, cikti, ...adlar0] = process.argv.slice(2);
const adlar = adlar0.length ? adlar0 : fs.readdirSync(girdi).filter((f) => /^cikartma-.*\.png$/.test(f)).map((f) => f.replace(/\.png$/, ''));
function disk(r) { const o = []; for (let dy = -r; dy <= r; dy++) { const w = Math.floor(Math.sqrt(r * r - dy * dy)); o.push([dy, w]); } return o; }
function buyut(m, W, H, r) { // disk yapı elemanıyla genişletme (ayrılabilir değil; satır aralıkları ile)
  const ar = disk(r), t = new Uint8Array(W * H), o = new Uint8Array(W * H);
  // yatay genişletme farklı yarıçaplar için: her satır için w genişliği gerekir → iki aşamalı yaklaşım: önce satır başına koşular
  const koşu = new Int32Array(W * H); // her piksel için soldaki en yakın dolu pikselin uzaklığı (sağdan sola ve soldan sağa)
  const sol = new Int32Array(W * H), sag = new Int32Array(W * H);
  for (let y = 0; y < H; y++) { let d = 1e9; for (let x = 0; x < W; x++) { d = m[y * W + x] ? 0 : d + 1; sol[y * W + x] = d; } d = 1e9; for (let x = W - 1; x >= 0; x--) { d = m[y * W + x] ? 0 : d + 1; sag[y * W + x] = d; } }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) koşu[y * W + x] = Math.min(sol[y * W + x], sag[y * W + x]);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let v = 0; for (const [dy, w] of ar) { const yy = y + dy; if (yy < 0 || yy >= H) continue; if (koşu[yy * W + x] <= w) { v = 1; break; } } o[y * W + x] = v; }
  void t; return o;
}
async function isle(ad) {
  const { data, info } = await s(path.join(girdi, ad + '.png')).removeAlpha().raw().toBuffer({ resolveWithObject: true }); const W = info.width, H = info.height, n = W * H;
  const R = Math.round(Math.max(W, H) * 0.0235);                 // ≈ 20 px @ 880
  const D = new Uint8Array(n), BEY = new Uint8Array(n);
  for (let i = 0; i < n; i++) { const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b); D[i] = mx - mn > 28 || mn < 120 ? 1 : 0; BEY[i] = mn >= 243 && mx - mn < 14 ? 1 : 0; }
  const A = buyut(D, W, H, R + 4);
  let M = new Uint8Array(n); for (let i = 0; i < n; i++) M[i] = A[i] && (D[i] || BEY[i]) ? 1 : 0;
  // çizimden bağlı olmayan beyaz kalıntılar (gölgeye yakın) için: çizimden 1 px genişletilmiş ana bileşen
  const et = new Int32Array(n).fill(-1), q = new Int32Array(n); let ana = -1, anaA = 0; const boy = [];
  for (let i = 0; i < n; i++) { if (!M[i] || et[i] >= 0) continue; let b = 0, e = 0; q[e++] = i; et[i] = boy.length; while (b < e) { const p = q[b++], x = p % W; for (const d of [-1, 1, -W, W]) { const r = p + d; if (r < 0 || r >= n || et[r] >= 0 || !M[r]) continue; if ((d === -1 && x === 0) || (d === 1 && x === W - 1)) continue; et[r] = boy.length; q[e++] = r; } } boy.push(e); if (e > anaA) { anaA = e; ana = boy.length - 1; } }
  for (let i = 0; i < n; i++) if (M[i] && et[i] !== ana) M[i] = 0;
  // kapalı iç boşluklar
  const zem = new Uint8Array(n); let b = 0, e = 0; for (let i = 0; i < n; i++) { const x = i % W, y = (i / W) | 0; if (!M[i] && (x === 0 || y === 0 || x === W - 1 || y === H - 1)) { zem[i] = 1; q[e++] = i; } }
  while (b < e) { const p = q[b++], x = p % W; for (const d of [-1, 1, -W, W]) { const r = p + d; if (r < 0 || r >= n || zem[r] || M[r]) continue; if ((d === -1 && x === 0) || (d === 1 && x === W - 1)) continue; zem[r] = 1; q[e++] = r; } }
  // kapalı iç boşluklar: sınırı çoğunlukla ÇİZİM (D) ise çizimin içidir (inek karnı, davul derisi) → doldur; sınırı beyaz kenar ise gerçek delik (sepet sapı içi) → şeffaf kalır
  { const hv = new Int32Array(n).fill(-1); const liste = []; for (let i = 0; i < n; i++) { if (M[i] || zem[i] || hv[i] >= 0) continue; let bb = 0, ee = 0, dS = 0, mS = 0; q[ee++] = i; hv[i] = liste.length; const uye = [];
      while (bb < ee) { const pp = q[bb++], x = pp % W; uye.push(pp); for (const d of [-1, 1, -W, W]) { const r = pp + d; if (r < 0 || r >= n) continue; if ((d === -1 && x === 0) || (d === 1 && x === W - 1)) continue; if (M[r]) { mS++; if (D[r]) dS++; continue; } if (zem[r] || hv[r] >= 0) continue; hv[r] = liste.length; q[ee++] = r; } }
      liste.push(1); if (mS && dS / mS > 0.6 || uye.length < 40) for (const pp of uye) M[pp] = 1; } }
  // küçük çıkıntıları ve pürüzü yumuşat: 3 px açma sonra 1 px bulanık alfa
  const ab = await s(Buffer.from(M.map((v) => v * 255)), { raw: { width: W, height: H, channels: 1 } }).blur(1.2).extractChannel(0).raw().toBuffer({ resolveWithObject: true }); const alfa = ab.data; if (ab.info.channels !== 1) throw new Error('alfa kanal sayısı ' + ab.info.channels);
  const out = Buffer.alloc(n * 4); let x0 = W, y0 = H, x1 = 0, y1 = 0;
  for (let i = 0; i < n; i++) { const a = Math.max(0, Math.min(255, Math.round((alfa[i] - 128) * 2 + 128))); out[i * 4] = data[i * 3]; out[i * 4 + 1] = data[i * 3 + 1]; out[i * 4 + 2] = data[i * 3 + 2]; out[i * 4 + 3] = a;
    if (a > 8) { const x = i % W, y = (i / W) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
  // dış kenarda gölgeden gelen koyu renk karışmasın: alfa < 255 piksellerin rengi beyaza çekilir
  for (let i = 0; i < n; i++) { const a = out[i * 4 + 3]; if (a > 0 && a < 255) { const t = 1 - a / 255; for (let c = 0; c < 3; c++) out[i * 4 + c] = Math.round(out[i * 4 + c] * (1 - t) + 255 * t); } }
  fs.mkdirSync(cikti, { recursive: true });
  const k = 4, ex = { left: Math.max(0, x0 - k), top: Math.max(0, y0 - k) }; ex.width = Math.min(W - 1, x1 + k) - ex.left + 1; ex.height = Math.min(H - 1, y1 + k) - ex.top + 1;
  const webp = await s(out, { raw: { width: W, height: H, channels: 4 } }).extract(ex).webp({ quality: 94, alphaQuality: 100, effort: 5 }).toBuffer();
  await guvenliYaz(path.join(cikti, ad + '.webp'), webp); console.log(`${ad}: ${ex.width}x${ex.height}, ${Math.round(webp.length / 1024)} KB (kenar ${R} px)`);
}
(async () => { for (const a of adlar) await isle(a); })();
