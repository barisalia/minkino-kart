/**
 * Kino kukla kiti: vektör çizim yardımcıları (yalnız düz matematik, kütüphane yok).
 * - inceSerit: kalemle çizilmiş gibi ucu incelen çizgi (kaş, kapalı göz, üzgün ağız): kapalı dolgu yolu döner
 * - daire, cokgen, elips: basit kapalı yollar
 * - kubik / ornekle: kübik Bezier örnekleme
 * Koordinatlar Kino C çiziminin 1792×2432 karesinde.
 */

const yuvarla = (v) => Math.round(v * 100) / 100;
const nokta = (p) => `${yuvarla(p[0])} ${yuvarla(p[1])}`;

/** kübik Bezier üstünde t noktası */
function kubik(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
}

/** Bezier zinciri [p0, c1, c2, p1, c1, c2, p2 …] boyunca n örnek */
function ornekle(zincir, n = 80) {
  const parca = (zincir.length - 1) / 3;
  const cikti = [];
  for (let i = 0; i <= n; i++) {
    const s = (i / n) * parca;
    const k = Math.min(parca - 1, Math.floor(s));
    const t = s - k;
    cikti.push(kubik(zincir[3 * k], zincir[3 * k + 1], zincir[3 * k + 2], zincir[3 * k + 3], t));
  }
  return cikti;
}

/** Noktalardan pürüzsüz kapalı yol (Catmull-Rom → kübik Bezier) */
function puruzsuzKapali(n) {
  const L = n.length;
  let d = `M${nokta(n[0])}`;
  for (let i = 0; i < L; i++) {
    const p0 = n[(i - 1 + L) % L], p1 = n[i], p2 = n[(i + 1) % L], p3 = n[(i + 2) % L];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${nokta(c1)} ${nokta(c2)} ${nokta(p2)}`;
  }
  return d + 'Z';
}

/**
 * Ucu incelen çizgi: Bezier zinciri boyunca, ortada `kalin`, uçlarda `uc` kalınlığında; uçlar yuvarlak.
 * profil: 0..1 arası t → 0..1 kalınlık çarpanı (varsayılan: ortası dolgun, uçlar incelir)
 */
function inceSerit(zincir, kalin, uc = kalin * 0.45, profil) {
  const pr = profil || ((t) => Math.pow(Math.sin(Math.PI * t), 0.6));
  const p = ornekle(zincir, 90);
  const sol = [], sag = [];
  for (let i = 0; i < p.length; i++) {
    const a = p[Math.max(0, i - 1)], b = p[Math.min(p.length - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const l = Math.hypot(tx, ty) || 1;
    tx /= l; ty /= l;
    const w = (uc + (kalin - uc) * pr(i / (p.length - 1))) / 2;
    sol.push([p[i][0] - ty * w, p[i][1] + tx * w]);
    sag.push([p[i][0] + ty * w, p[i][1] - tx * w]);
  }
  // yuvarlak uçlar: uç noktası çevresinde yarım daire
  const kapak = (m, yon, w) => {
    const c = [];
    const a0 = Math.atan2(yon[1], yon[0]);
    for (let k = 1; k < 8; k++) {
      const a = a0 - Math.PI / 2 + (Math.PI * k) / 8;
      c.push([m[0] + Math.cos(a) * w, m[1] + Math.sin(a) * w]);
    }
    return c;
  };
  const n = p.length;
  const yonSon = [p[n - 1][0] - p[n - 2][0], p[n - 1][1] - p[n - 2][1]];
  const yonBas = [p[0][0] - p[1][0], p[0][1] - p[1][1]];
  const nb = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
  const tum = [...sol, ...kapak(p[n - 1], nb(yonSon), uc / 2).reverse(), ...sag.reverse(), ...kapak(p[0], nb(yonBas), uc / 2).reverse()];
  return 'M' + tum.map(nokta).join('L') + 'Z';
}

// Bütün kapalı şekiller ekranda saat yönünde: kırpma birleşimlerinde (aynı clipPath içinde birden çok şekil)
// sarım sayıları birbirini götürmesin (librsvg bunları tek yol gibi birleştiriyor).
const daire = (cx, cy, r) => `M${yuvarla(cx - r)} ${yuvarla(cy)}a${r} ${r} 0 1 1 ${2 * r} 0a${r} ${r} 0 1 1 ${-2 * r} 0Z`;
const elips = (cx, cy, rx, ry) => `M${yuvarla(cx - rx)} ${yuvarla(cy)}a${rx} ${ry} 0 1 1 ${2 * rx} 0a${rx} ${ry} 0 1 1 ${-2 * rx} 0Z`;
function cokgen(n) {
  let a = 0;
  for (let i = 0; i < n.length; i++) { const p = n[i], q = n[(i + 1) % n.length]; a += p[0] * q[1] - q[0] * p[1]; }
  const s = a < 0 ? [...n].reverse() : n;
  return 'M' + s.map(nokta).join('L') + 'Z';
}

/** p noktasından geçen, yon doğrultusuna dik doğrunun "ileri" yanını kapsayan büyük dörtgen (kırpma için) */
function yariDuzlem(p, yon, buyuk = 3000) {
  const l = Math.hypot(yon[0], yon[1]);
  const u = [yon[0] / l, yon[1] / l];
  const d = [-u[1], u[0]];
  return cokgen([
    [p[0] + d[0] * buyuk, p[1] + d[1] * buyuk],
    [p[0] + d[0] * buyuk + u[0] * buyuk, p[1] + d[1] * buyuk + u[1] * buyuk],
    [p[0] - d[0] * buyuk + u[0] * buyuk, p[1] - d[1] * buyuk + u[1] * buyuk],
    [p[0] - d[0] * buyuk, p[1] - d[1] * buyuk],
  ]);
}

/** iki dik doğru arasındaki şerit (a'dan b'ye doğru eksene dik iki kesim) */
function serit(a, b, buyuk = 3000) {
  const yon = [b[0] - a[0], b[1] - a[1]];
  const l = Math.hypot(yon[0], yon[1]);
  const u = [yon[0] / l, yon[1] / l];
  const d = [-u[1], u[0]];
  return cokgen([
    [a[0] + d[0] * buyuk, a[1] + d[1] * buyuk],
    [b[0] + d[0] * buyuk, b[1] + d[1] * buyuk],
    [b[0] - d[0] * buyuk, b[1] - d[1] * buyuk],
    [a[0] - d[0] * buyuk, a[1] - d[1] * buyuk],
  ]);
}

module.exports = { kubik, ornekle, puruzsuzKapali, inceSerit, daire, elips, cokgen, yariDuzlem, serit, yuvarla };
