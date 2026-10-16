// Kino'nun Otobüsü yeni dondurma tatları: mevcut top-/kap- çizimleri (assets/kino-otobus) yeniden boyanır, yeni çizim yok.
//   node ekip/illustrator/kino-otobus-tat-boya.cjs [--hata klasör] [--ikonsuz]   (repo kökünden; güvenli: daha büyük mevcut dosya ezilmez, ZORLA=1 ile ezilir)
//   --hata <klasör>: her çıktı için ağırlık haritası PNG'si (beyaz = tam boyandı) bu klasöre yazılır (denetim için).
// Eşleme: cilek → visne (koyu kiraz kırmızısı), limon → portakal, yabanmersini → pamukseker (açık bebek mavisi).
// Yöntem (CIE Lab / LCh):
//  - Kaynak tadın ana rengi (Ls,Cs,hs) top-<kaynak> çiziminden ölçüldü; hedef (Lt,Ct,ht) tablo. Aynı eşleme kaba da uygulanır
//    (kaptaki dondurma toptan biraz farklı tonda çizilmiş; aradaki ilişki korunur).
//  - Piksel dönüşümü: t = min(1, C/Cs) (beyaz parlama ↔ renk karışım oranı; beyaz/kreme yakın pikseller neredeyse hiç değişmez),
//    L' = L + t·((Lt + (L−Ls)·kL) − L), C' = C·Ct/Cs, h' = h + (ht − hs); sRGB dışına taşan renkte kroma düşürülür.
//  - Ağırlık: tonu kaynak tonun penceresinde (±tamTon tam, ±sonTon'da sıfıra yumuşak) × kontur kapısı (koyu kahve kontur: L düşük ve
//    kroma düşük → 0). Yalnız bölge boyanır: çekirdek (pencerede, doygun) 2 px şişirilmiş + çekirdeğe gömülü küçük delikler (beyaz
//    parlamalar, tohumlar; alan ≤ delik·tuval). Kabın krem gövdesi ve etiketin krem içi (limon ~ krem tonu) bu yüzden değişmez.
//  - Etiket simgesi (kap): renk kaydırması meyveyi değiştirmez (vişne kabında çilek kalırdı). ETIKET tablosunda olanlarda eski simge
//    satır satır sağ/sol etiket renginden doldurularak silinir, yerine mevcut çizim (kiraz.webp) aynı yere oturtulur. --ikonsuz: bu adım atlanır.
//    Portakal: limon dilimi turuncuya döner (portakal dilimi gibi, uygun). Pamukşeker: yaban mersini simgesi açık maviye döner (uygun simge yok).
//  - Alfa aynen kalır; çıktı boyutu girdiyle aynı.
const fs = require('fs'), path = require('path');
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const guvenliYaz = require('./guvenli-yaz.cjs');
const A = 'assets/kino-otobus';
const IKONSUZ = process.argv.includes('--ikonsuz');
/** kap etiketindeki meyve simgesi: sil [x0,y0,x1,y1] (eski simgenin kutusu, kap-<kaynak> pikseli), yeni simge, merkezi ve boyu (px) */
const ETIKET = { visne: { sil: [396, 690, 562, 900], ikon: 'kiraz.webp', merkez: [478, 796], boy: 196 } };
const hi = process.argv.indexOf('--hata'), HATA = hi >= 0 ? process.argv[hi + 1] : null;
/** kaynak: ana renk (top çiziminin baskın LCh'si), ton penceresi, çekirdek kroma eşiği; hedef: LCh + açıklık ölçeği kL */
const TAT = [
  { kaynak: 'cilek', hedef: 'visne', s: [69, 40, 20], tamTon: 22, sonTon: 36, cekC: 25, delik: 0.012, konturL: 32, konturC: 45, t: [47, 68, 22], kL: 1.0 },
  { kaynak: 'limon', hedef: 'portakal', s: [90, 50, 98], tamTon: 24, sonTon: 34, cekC: 36, delik: 0.012, konturL: 32, konturC: 45, t: [76, 70, 64], kL: 1.0 },
  { kaynak: 'yabanmersini', hedef: 'pamukseker', s: [60, 30, 291], tamTon: 26, sonTon: 42, cekC: 14, delik: 0.012, konturL: 32, konturC: 34, t: [84, 24, 236], kL: 0.75 },
];
// sRGB <-> Lab (D65)
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const gam = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055) * 255;
function rgb2lch(r, g, b) {
  const R = lin(r), G = lin(g), B = lin(b);
  const X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047, Y = R * 0.2126 + G * 0.7152 + B * 0.0722, Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116); const fx = f(X), fy = f(Y), fz = f(Z);
  const a = 500 * (fx - fy), bb = 200 * (fy - fz); return [116 * fy - 16, Math.hypot(a, bb), ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360];
}
function lch2rgbHam(L, C, h) {
  const a = C * Math.cos((h * Math.PI) / 180), bb = C * Math.sin((h * Math.PI) / 180), fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - bb / 200;
  const fi = (t) => (t * t * t > 0.008856 ? t * t * t : (t - 16 / 116) / 7.787); const X = fi(fx) * 0.95047, Y = fi(fy), Z = fi(fz) * 1.08883;
  return [X * 3.2406 + Y * -1.5372 + Z * -0.4986, X * -0.9689 + Y * 1.8758 + Z * 0.0415, X * 0.0557 + Y * -0.204 + Z * 1.057];
}
function lch2rgb(L, C, h) { // gamut dışında kroma ikiye bölmeyle düşürülür
  const ici = (v) => v.every((c) => c >= -0.0005 && c <= 1.0005); let v = lch2rgbHam(L, C, h);
  if (!ici(v)) { let lo = 0, up = C; for (let k = 0; k < 18; k++) { const m = (lo + up) / 2; if (ici(lch2rgbHam(L, m, h))) lo = m; else up = m; } v = lch2rgbHam(L, lo, h); }
  return v.map((c) => Math.max(0, Math.min(255, Math.round(gam(Math.max(0, Math.min(1, c)))))));
}
const yum = (x, a, b) => (x <= a ? 0 : x >= b ? 1 : ((x - a) / (b - a)) ** 2 * (3 - 2 * ((x - a) / (b - a))));
const tonFark = (h, h0) => { const d = Math.abs(h - h0) % 360; return d > 180 ? 360 - d : d; };

async function boya(girdi, cikti, T) {
  const { data, info } = await s(girdi).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, n = W * H; const [Ls, Cs, hs] = T.s, [Lt, Ct, ht] = T.t;
  const lch = new Float32Array(n * 3), agr = new Float32Array(n), cek = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    if (!data[i * 4 + 3]) continue; const [L, C, h] = rgb2lch(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]); lch[i * 3] = L; lch[i * 3 + 1] = C; lch[i * 3 + 2] = h;
    const wTon = 1 - yum(tonFark(h, hs), T.tamTon, T.sonTon), wKontur = Math.max(yum(L, T.konturL, T.konturL + 10), yum(C, T.konturC, T.konturC + 10));
    agr[i] = wTon * wKontur; if (agr[i] > 0.5 && C > T.cekC) cek[i] = 1;
  }
  // bölge = çekirdek (2 px şişirilmiş: kenar yumuşatması) ∪ çekirdeğin içine gömülü küçük delikler (beyaz parlamalar, tohumlar).
  // Büyük kapalı alanlar (kabın etiket içi: krem, kabın gövdesiyle aynı renk) delik sayılmaz → kap rengi değişmez.
  const bolge = new Uint8Array(n), q = new Int32Array(n);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (!cek[y * W + x]) continue; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H) bolge[yy * W + xx] = 1; } }
  const gor = new Uint8Array(n), maxDelik = n * T.delik;
  for (let i = 0; i < n; i++) { if (cek[i] || gor[i]) continue; let b = 0, e = 0, acik = false; q[e++] = i; gor[i] = 1;
    while (b < e) { const p = q[b++], x = p % W, y = (p / W) | 0; if (!data[p * 4 + 3] || x === 0 || y === 0 || x === W - 1 || y === H - 1) acik = true;
      for (const d of [-1, 1, -W, W]) { const r = p + d; if (r < 0 || r >= n || gor[r] || cek[r]) continue; if ((d === -1 && x === 0) || (d === 1 && x === W - 1)) continue; gor[r] = 1; q[e++] = r; } }
    if (!acik && e <= maxDelik) for (let k = 0; k < e; k++) bolge[q[k]] = 1; }
  const out = Buffer.from(data), harita = HATA ? Buffer.alloc(n) : null;
  for (let i = 0; i < n; i++) {
    const w = bolge[i] ? agr[i] : 0; if (harita) harita[i] = Math.round(w * 255); if (w <= 0) continue;
    const L = lch[i * 3], C = lch[i * 3 + 1], h = lch[i * 3 + 2], t = Math.min(1, C / Cs);
    const L2 = Math.max(0, Math.min(100, L + t * (Lt + (L - Ls) * T.kL - L))), C2 = (C * Ct) / Cs, h2 = (h + (ht - hs) + 360) % 360;
    const [r, g, bb] = lch2rgb(L2, C2, h2);
    out[i * 4] = Math.round(data[i * 4] + (r - data[i * 4]) * w); out[i * 4 + 1] = Math.round(data[i * 4 + 1] + (g - data[i * 4 + 1]) * w); out[i * 4 + 2] = Math.round(data[i * 4 + 2] + (bb - data[i * 4 + 2]) * w);
  }
  let son = s(out, { raw: { width: W, height: H, channels: 4 } });
  const E = ETIKET[T.hedef];
  if (E && !IKONSUZ && path.basename(girdi).startsWith('kap-')) { // eski simgeyi sil (satır başına sol/sağ etiket rengi arası doğrusal), yenisini koy
    const [x0, y0, x1, y1] = E.sil, ort = (x, y) => { const v = [0, 0, 0]; for (let k = 0; k < 4; k++) for (let c = 0; c < 3; c++) v[c] += out[(y * W + x + k) * 4 + c] / 4; return v; };
    for (let y = y0; y <= y1; y++) { const sol = ort(x0 - 5, y), sag = ort(x1 + 2, y); for (let x = x0; x <= x1; x++) { const u = (x - x0) / (x1 - x0), p = (y * W + x) * 4; for (let c = 0; c < 3; c++) out[p + c] = Math.round(sol[c] + (sag[c] - sol[c]) * u); } }
    const ik = await s(path.join(A, E.ikon)).resize({ height: E.boy, kernel: 'lanczos3' }).png().toBuffer(), im = await s(ik).metadata();
    son = s(await s(out, { raw: { width: W, height: H, channels: 4 } }).composite([{ input: ik, left: Math.round(E.merkez[0] - im.width / 2), top: Math.round(E.merkez[1] - im.height / 2) }]).png().toBuffer());
  }
  const buf = await son.webp({ quality: 94, alphaQuality: 100, smartSubsample: true, effort: 5 }).toBuffer();
  const yazildi = await guvenliYaz(cikti, buf);
  if (harita) { fs.mkdirSync(HATA, { recursive: true }); await s(harita, { raw: { width: W, height: H, channels: 1 } }).png().toFile(path.join(HATA, path.basename(cikti, '.webp') + '-agirlik.png')); }
  console.log(path.basename(cikti) + ': ' + W + 'x' + H + ', ' + Math.round(buf.length / 1024) + ' KB' + (yazildi ? '' : ' ATLANDI'));
}

(async () => {
  for (const T of TAT) for (const tur of ['top', 'kap']) await boya(path.join(A, `${tur}-${T.kaynak}.webp`), path.join(A, `${tur}-${T.hedef}.webp`), T);
})();
