/**
 * Elle çizim yardımcıları (aile kitleri): noktalardan pürüzsüz kapalı yol (köşe işaretli), açık eğri zinciri
 * (inceSerit için), uzuv (iki daire arasında incelen boru), noktaları aynalama.
 */
const yuv = (v) => Math.round(v * 100) / 100;
const nk = (p) => `${yuv(p[0])} ${yuv(p[1])}`;

/** saat yönüne çevir (kırpma birleşimlerinde sarım sayıları birbirini götürmesin) */
function saatYonu(n) {
  let a = 0;
  for (let i = 0; i < n.length; i++) { const p = n[i], q = n[(i + 1) % n.length]; a += p[0] * q[1] - q[0] * p[1]; }
  return a < 0 ? [...n].reverse() : n;
}

/**
 * Kapalı pürüzsüz yol: noktalar [x, y] ya da [x, y, 'k'] (köşe). g: gerilim (1 = Catmull-Rom).
 * Ekranda saat yönünde döner.
 */
function kapali(noktalar, g = 1) {
  const n = saatYonu(noktalar);
  const L = n.length;
  const tan = (i) => {
    const p = n[i];
    if (p[2] === 'k') return [0, 0];
    const a = n[(i - 1 + L) % L], b = n[(i + 1) % L];
    return [((b[0] - a[0]) / 6) * g, ((b[1] - a[1]) / 6) * g];
  };
  let d = `M${nk(n[0])}`;
  for (let i = 0; i < L; i++) {
    const p1 = n[i], p2 = n[(i + 1) % L];
    const t1 = tan(i), t2 = tan((i + 1) % L);
    d += `C${nk([p1[0] + t1[0], p1[1] + t1[1]])} ${nk([p2[0] - t2[0], p2[1] - t2[1]])} ${nk(p2)}`;
  }
  return d + 'Z';
}

/** Açık eğri: noktalardan Bezier zinciri [p0, c1, c2, p1, …] (Z.inceSerit / Z.ornekle için) */
function zincir(n, g = 1) {
  const L = n.length;
  const tan = (i) => {
    const a = n[Math.max(0, i - 1)], b = n[Math.min(L - 1, i + 1)];
    const k = i === 0 || i === L - 1 ? 3 : 6;
    return [((b[0] - a[0]) / k) * g, ((b[1] - a[1]) / k) * g];
  };
  const z = [n[0]];
  for (let i = 0; i < L - 1; i++) {
    const t1 = tan(i), t2 = tan(i + 1);
    z.push([n[i][0] + t1[0], n[i][1] + t1[1]], [n[i + 1][0] - t2[0], n[i + 1][1] - t2[1]], n[i + 1]);
  }
  return z;
}
/** Açık eğrinin yol hâli (M…C…) */
function acikYol(n, g = 1) {
  const z = zincir(n, g);
  let d = `M${nk(z[0])}`;
  for (let i = 1; i < z.length; i += 3) d += `C${nk(z[i])} ${nk(z[i + 1])} ${nk(z[i + 2])}`;
  return d;
}

/** İki daire (a, ra) → (b, rb) arasındaki boru (uzuv): dış teğetler + yuvarlak uçlar, çokgen (5° adım) */
function uzuv(a, ra, b, rb) {
  const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy);
  const th = Math.atan2(dy, dx), al = Math.acos(Math.max(-1, Math.min(1, (ra - rb) / d)));
  const n = [];
  const yay = (c, r, a0, a1) => {
    const adim = (5 * Math.PI) / 180, say = Math.max(2, Math.ceil(Math.abs(a1 - a0) / adim));
    for (let i = 0; i <= say; i++) { const t = a0 + ((a1 - a0) * i) / say; n.push([c[0] + r * Math.cos(t), c[1] + r * Math.sin(t)]); }
  };
  yay(b, rb, th - al, th + al);
  yay(a, ra, th + al, th - al + 2 * Math.PI);
  return 'M' + saatYonu(n).map(nk).join('L') + 'Z';
}

/** noktaları x = eksen etrafında aynala */
const aynaN = (n, eksen) => n.map((p) => [2 * eksen - p[0], p[1], ...p.slice(2)]);

module.exports = { kapali, zincir, acikYol, uzuv, aynaN, saatYonu };
