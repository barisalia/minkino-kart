// Başa giyilen parça (hasır şapka, yağmurluk başlığı …) düzenlemeden sütun sütun alınır: her sütunda yukarıdan
// aşağı, şapka renkleri (hasır, kurdele, koyu kontur, açık parıltı) sürdükçe iner; ilk deri / kulak / zemin
// pikselinde durur. Böylece siperin altındaki alın ve kulak uçları katmana karışmaz (fark maskesinin deliği yok).
// node ekip/giysin/sapka-temizle.cjs <duzenleme.png> <ad> <alan x0,y0,x1,y1>
const sharp = require('sharp');
const fs = require('fs');
const N = 2048;
(async () => {
  const [, , duz, ad, alanT] = process.argv;
  const [ax0, ay0, ax1, ay1] = alanT.split(',').map(Number);
  const E = await sharp(duz).resize(N, N).flatten({ background: '#fff' }).removeAlpha().raw().toBuffer();
  const W = ax1 - ax0, H = ay1 - ay0;
  const px = (x, y) => { const i = (y * N + x) * 3; return [E[i], E[i + 1], E[i + 2]]; };
  const beyaz = ([r, g, b]) => r > 236 && g > 236 && b > 236;
  const sapkaRengi = ([r, g, b]) =>
    (r > 150 && g > 100 && b < 160 && r - b > 50 && g - b > 20) || // hasır
    (r > 235 && g > 210 && b < 215 && r - b > 30) || // hasır parıltısı
    (r > 160 && g < 130 && b < 130 && r - g > 60) || // kurdele
    (r > 120 && g < 170 && b < 165 && r - g > 70 && r - b > 70) || // kurdele gölgesi, açık pembe geçiş
    (r < 105 && g < 55 && b < 55) || // kontur (koyu kahve; kulağın kahvesi değil)
    (r < 200 && g < 70 && b < 70 && r - g > 60); // kurdelenin koyu kırmızı konturu
  const alt = new Int32Array(W).fill(-1);
  for (let x = 0; x < W; x++) {
    let y = 0;
    while (y < H && beyaz(px(x + ax0, y + ay0))) y++;
    // kenar yumuşatma pikselleri: ilk şapka rengine kadar en çok 8 px
    let ust = -1;
    for (let k = 0; k < 8 && y + k < H; k++) if (sapkaRengi(px(x + ax0, y + k + ay0))) { ust = y + k; break; }
    if (ust < 0) continue;
    // şapka renkleri sürdükçe in (ara geçiş pikselleri için 5 px boşluk hoş görülür)
    let son = ust, bos = 0;
    for (y = ust; y < H && bos <= 9; y++) {
      const p = px(x + ax0, y + ay0);
      if (sapkaRengi(p)) { son = y; bos = 0; } else if (beyaz(p) && y - son < 160) bos = 0; // fiyonk ile siper arası zemin
      else bos++;
    }
    alt[x] = son - ust > 6 ? son + 1 : -1;
  }
  // siper çizgisini yumuşat (tek sütun sıçramaları: kulak konturu)
  const yum = Int32Array.from(alt, (_, x) => {
    const v = [];
    // aşağı sarkan dar sıçramalar (kulak konturu) atılır: ±22 sütunun alt %25'i
    for (let k = -22; k <= 22; k++) if (alt[x + k] !== undefined && alt[x + k] >= 0) v.push(alt[x + k]);
    if (v.length < 10) return alt[x];
    v.sort((a, b) => a - b);
    // yukarı kısa kalan dar sütun (geçiş pikseli yüzünden erken duran yürüyüş): komşuların ortancası
    const orta = v[v.length >> 1];
    if (alt[x] < orta - 25) return orta;
    return Math.min(alt[x], v[Math.floor(v.length * 0.25)] + 6);
  });
  // isteğe bağlı siper çizgisi (elle, x:y,x:y …): sütunun alt sınırı bu çizgiden aşağı inemez (kulak üstleri)
  const cizgi = process.argv[5] ? process.argv[5].split(',').map((p) => p.split(':').map(Number)) : null;
  const sinir = (X) => {
    if (!cizgi) return Infinity;
    if (X <= cizgi[0][0]) return cizgi[0][1];
    for (let i = 1; i < cizgi.length; i++) if (X <= cizgi[i][0]) {
      const [x0, y0] = cizgi[i - 1], [x1, y1] = cizgi[i];
      return y0 + ((y1 - y0) * (X - x0)) / (x1 - x0);
    }
    return cizgi[cizgi.length - 1][1];
  };
  const m = new Uint8Array(W * H);
  for (let x = 0; x < W; x++) for (let y = 0; y <= Math.min(yum[x], sinir(x + ax0) - ay0); y++) if (!beyaz(px(x + ax0, y + ay0))) m[y * W + x] = 1;
  // siperin altına sarkan ince dikey kulak konturları: satırda 18 px'ten kısa koşular atılır
  for (let y = 0; y < H; y++) {
    let x = 0;
    while (x < W) {
      if (!m[y * W + x]) { x++; continue; }
      let e = x;
      while (e < W && m[y * W + e]) e++;
      if (e - x < 18) for (let k = x; k < e; k++) m[y * W + k] = 0;
      x = e;
    }
  }
  const a = new Uint8Array(W * H);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x;
    a[i] = m[i] && m[i - 1] && m[i + 1] && m[i - W] && m[i + W] ? 1 : 0;
  }
  const rgba = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x;
    let t = 0, n = 0;
    for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++) {
      const X = x + k, Y = y + j;
      if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
      const w = k === 0 && j === 0 ? 4 : k === 0 || j === 0 ? 2 : 1;
      t += a[Y * W + X] * w;
      n += w;
    }
    const [r, g, b] = px(x + ax0, y + ay0);
    rgba[i * 4] = r; rgba[i * 4 + 1] = g; rgba[i * 4 + 2] = b;
    rgba[i * 4 + 3] = Math.round((255 * t) / n);
  }
  const k = await sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
  const kirp = await sharp(k).trim({ threshold: 1 }).png().toBuffer({ resolveWithObject: true });
  fs.writeFileSync(`ekip/giysin/parca/${ad}.png`, kirp.data);
  const j = { x: ax0 - (kirp.info.trimOffsetLeft ?? 0), y: ay0 - (kirp.info.trimOffsetTop ?? 0), w: kirp.info.width, h: kirp.info.height };
  fs.writeFileSync(`ekip/giysin/parca/${ad}.json`, JSON.stringify(j));
  console.log(ad, j);
})();
