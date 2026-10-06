/**
 * Kino Ne Giysin? giysi ayırma hattı.
 * Gemini/nano-banana "Kino X giymiş" çizimini Kino iskeletinin (2048) koordinatına oturtur (bölgesel kayıt:
 * ölçek + kayma, kayıt bölgesinde ana çizimle fark en az), farkı alıp giysiyi şeffaf katman olarak çıkarır.
 *
 * node ekip/giysin/ayir.cjs <duzenleme.png> <cikti-adi> <kayit x0,y0,x1,y1> <alan x0,y0,x1,y1> [esik=48] [fark-yok-alan x0,y0,x1,y1 ...]
 * Çıktı: ekip/giysin/parca/<ad>.png (kırpılmış) + ekip/giysin/parca/<ad>.json {x,y,w,h, s, dx, dy}
 */
const sharp = require('sharp');
const fs = require('fs');
const N = 2048;
const AC = +(process.env.AC ?? 1);

async function rgb(yol, beyaz = true) {
  let s = sharp(yol).resize(N, N, { fit: 'fill' });
  if (beyaz) s = s.flatten({ background: '#ffffff' });
  const { data } = await s.removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return data;
}
const kutu = (t) => t.split(',').map(Number);

(async () => {
  const [, , duz, ad, kayitT, alanT, esikT, ...yokT] = process.argv;
  const esik = Number(esikT || 48);
  const B = await rgb('ekip/kino/kino-final.png');
  const E = await rgb(duz);
  const [rx0, ry0, rx1, ry1] = kutu(kayitT);
  const cx = (rx0 + rx1) / 2;
  const cy = (ry0 + ry1) / 2;
  const gri = (D, x, y) => {
    const i = (y * N + x) * 3;
    return D[i] * 0.3 + D[i + 1] * 0.59 + D[i + 2] * 0.11;
  };
  const ornek = (D, x, y, k) => {
    // bilinear
    if (x < 0 || y < 0 || x >= N - 1 || y >= N - 1) return 255;
    const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0;
    const i = (y0 * N + x0) * 3 + k;
    return (D[i] * (1 - fx) + D[i + 3] * fx) * (1 - fy) + (D[i + N * 3] * (1 - fx) + D[i + N * 3 + 3] * fx) * fy;
  };
  // örnek noktalar (kayıt bölgesinde, ana çizimde kenar olanlar ağırlıklı)
  const noktalar = [];
  for (let y = ry0; y < ry1; y += 3) for (let x = rx0; x < rx1; x += 3) {
    // yalnız kenarlar (göz, kontur): düz krem yüzey kaymayı göstermez
    const gx = Math.abs(gri(B, x + 4, y) - gri(B, x - 4, y)), gy = Math.abs(gri(B, x, y + 4) - gri(B, x, y - 4));
    const g = gri(B, x, y);
    if (gx + gy > 60 || g < 90) noktalar.push([x, y, g]);
  }
  const maliyet = (s, dx, dy) => {
    let t = 0;
    for (const [x, y, g] of noktalar) {
      const qx = s * (x - cx) + cx + dx, qy = s * (y - cy) + cy + dy;
      t += Math.abs(g - (ornek(E, qx, qy, 0) * 0.3 + ornek(E, qx, qy, 1) * 0.59 + ornek(E, qx, qy, 2) * 0.11));
    }
    return t;
  };
  let en = [Infinity, 1, 0, 0];
  for (let s = 0.75; s <= 1.15; s += 0.02) for (let dx = -240; dx <= 240; dx += 12) for (let dy = -240; dy <= 240; dy += 12) {
    const m = maliyet(s, dx, dy);
    if (m < en[0]) en = [m, s, dx, dy];
  }
  for (const [ds, dd] of [[0.008, 4], [0.003, 1.5], [0.001, 0.5]]) {
    const [, s0, x0, y0] = en;
    for (let s = s0 - ds * 3; s <= s0 + ds * 3; s += ds) for (let dx = x0 - dd * 4; dx <= x0 + dd * 4; dx += dd) for (let dy = y0 - dd * 4; dy <= y0 + dd * 4; dy += dd) {
      const m = maliyet(s, dx, dy);
      if (m < en[0]) en = [m, s, dx, dy];
    }
  }
  const [mal, s, dx, dy] = en;
  console.log(ad, 'kayit', { s: +s.toFixed(4), dx, dy, ort: +(mal / noktalar.length).toFixed(1) });

  // düzenlemenin zemini: kenardan ulaşılan beyazlar (kapalı konturun içindeki beyaz kürk/ponpon zemin değil)
  const zeminE = new Uint8Array(N * N);
  {
    const beyaz = (j) => E[j * 3] > 236 && E[j * 3 + 1] > 236 && E[j * 3 + 2] > 236;
    const st = [];
    for (let i = 0; i < N; i++) st.push(i, (N - 1) * N + i, i * N, i * N + N - 1);
    while (st.length) {
      const j = st.pop();
      if (zeminE[j] || !beyaz(j)) continue;
      zeminE[j] = 1;
      const x = j % N;
      if (x > 0) st.push(j - 1);
      if (x < N - 1) st.push(j + 1);
      if (j >= N) st.push(j - N);
      if (j < N * (N - 1)) st.push(j + N);
    }
  }
  const [ax0, ay0, ax1, ay1] = kutu(alanT);
  const yoklar = yokT.map(kutu);
  const W = ax1 - ax0, H = ay1 - ay0;
  const renk = Buffer.alloc(W * H * 3);
  const mask = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const X = x + ax0, Y = y + ay0;
    const qx = s * (X - cx) + cx + dx, qy = s * (Y - cy) + cy + dy;
    let fark = 0;
    for (let k = 0; k < 3; k++) {
      const v = ornek(E, qx, qy, k);
      renk[(y * W + x) * 3 + k] = v;
      fark = Math.max(fark, Math.abs(v - B[(Y * N + X) * 3 + k]));
    }
    const yok = yoklar.some(([a, b, c, d]) => X >= a && X < c && Y >= b && Y < d);
    const i3 = (y * W + x) * 3;
    // düzenlemede beyaz zemin (ana çizimin eski konturu farkı): giysi değil; içi kapalı beyazlar sonra doldurulur
    const qi = Math.round(qy) * N + Math.round(qx);
    const zemin = qx < 0 || qy < 0 || qx >= N || qy >= N || zeminE[qi];
    // beyaz/gri kürk (krem Kino tüyünden ayrı: mavi kanal kırmızıdan düşük değil)
    const kurk = Math.min(renk[i3], renk[i3 + 1], renk[i3 + 2]) > 195 && renk[i3 + 2] - renk[i3] > -9 && fark > 8;
    mask[y * W + x] = !yok && !zemin && (process.env.HEPSI || fark > esik || kurk) ? 1 : 0;
  }
  const kom = (m, f) => {
    const o = new Uint8Array(W * H);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      const v = [m[i], m[i - 1], m[i + 1], m[i - W], m[i + W]];
      o[i] = f === 'asin' ? (v.every(Boolean) ? 1 : 0) : v.some(Boolean) ? 1 : 0;
    }
    return o;
  };
  // açma: kırıntı farkları (ince kontur kaymaları) gider
  let m = mask;
  for (let i = 0; i < AC; i++) m = kom(m, 'asin');
  for (let i = 0; i < AC; i++) m = kom(m, 'gen');
  // en büyük parçalar (alanın %0.3'ünden küçük adacıklar atılır)
  const etiket = new Int32Array(W * H);
  const boy = [0];
  for (let i = 0; i < W * H; i++) {
    if (!m[i] || etiket[i]) continue;
    const id = boy.length;
    let n = 0;
    const st = [i];
    etiket[i] = id;
    while (st.length) {
      const j = st.pop();
      n++;
      const x = j % W, y = (j / W) | 0;
      for (const k of [x > 0 ? j - 1 : -1, x < W - 1 ? j + 1 : -1, y > 0 ? j - W : -1, y < H - 1 ? j + W : -1])
        if (k >= 0 && m[k] && !etiket[k]) { etiket[k] = id; st.push(k); }
    }
    boy.push(n);
  }
  const enBuyuk = Math.max(...boy);
  for (let i = 0; i < W * H; i++) m[i] = m[i] && boy[etiket[i]] > enBuyuk * 0.04 ? 1 : 0;
  // delik doldur: kenardan ulaşılamayan boşluklar (beyaz ponpon, beyaz kürk) giysinin içi
  const dis = new Uint8Array(W * H);
  const st = [];
  for (let x = 0; x < W; x++) st.push(x, (H - 1) * W + x);
  for (let y = 0; y < H; y++) st.push(y * W, y * W + W - 1);
  while (st.length) {
    const j = st.pop();
    if (dis[j] || m[j]) continue;
    dis[j] = 1;
    const x = j % W, y = (j / W) | 0;
    if (x > 0) st.push(j - 1);
    if (x < W - 1) st.push(j + 1);
    if (y > 0) st.push(j - W);
    if (y < H - 1) st.push(j + W);
  }
  for (let i = 0; i < W * H; i++) if (!dis[i]) m[i] = 1;
  // hale: kenardan 1 piksel içeri, sonra yumuşak kenar
  m = kom(m, 'asin');
  const a = Buffer.alloc(W * H);
  for (let i = 0; i < W * H; i++) a[i] = m[i] * 255;
  const alfa = Buffer.alloc(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let t = 0, n = 0;
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
      const X = x + i, Y = y + j;
      if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
      t += a[Y * W + X] * (i === 0 && j === 0 ? 4 : i === 0 || j === 0 ? 2 : 1);
      n += i === 0 && j === 0 ? 4 : i === 0 || j === 0 ? 2 : 1;
    }
    alfa[y * W + x] = Math.round(t / n);
  }
  const rgba = Buffer.alloc(W * H * 4);
  let [bx0, by0, bx1, by1] = [W, H, 0, 0];
  for (let i = 0; i < W * H; i++) {
    rgba[i * 4] = renk[i * 3];
    rgba[i * 4 + 1] = renk[i * 3 + 1];
    rgba[i * 4 + 2] = renk[i * 3 + 2];
    rgba[i * 4 + 3] = alfa[i];
    if (alfa[i] > 8) {
      const x = i % W, y = (i / W) | 0;
      bx0 = Math.min(bx0, x); by0 = Math.min(by0, y); bx1 = Math.max(bx1, x); by1 = Math.max(by1, y);
    }
  }
  fs.mkdirSync('ekip/giysin/parca', { recursive: true });
  const kw = bx1 - bx0 + 3, kh = by1 - by0 + 3;
  const ox = Math.max(0, bx0 - 1), oy = Math.max(0, by0 - 1);
  await sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
    .extract({ left: ox, top: oy, width: Math.min(kw, W - ox), height: Math.min(kh, H - oy) })
    .png()
    .toFile(`ekip/giysin/parca/${ad}.png`);
  const bilgi = { x: ox + ax0, y: oy + ay0, w: Math.min(kw, W - ox), h: Math.min(kh, H - oy), s: +s.toFixed(4), dx, dy };
  fs.writeFileSync(`ekip/giysin/parca/${ad}.json`, JSON.stringify(bilgi));
  console.log(bilgi);
})();
