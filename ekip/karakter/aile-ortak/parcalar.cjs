/**
 * Aile kitlerinin ortak parça çizimleri: yetişkin kafası (Kino'nun yüzü, yetişkin oranında), kulaklar, el, kol,
 * bacak, kuyruk. Her kit kendi ölçüleri ve renkleriyle çağırır (ekip/karakter/{anne,baba,lokum}/kit-kur.cjs).
 */
const K = require('./kino-kaynak.cjs');
const Y = require('./yol.cjs');

const { R, Z } = K;
let ayrac = 0;
/** ayrı çizim bloğu: kendi çizgisi kendinden öncekilerin ÜSTÜNDE görünür (aynı kırpmalı ardışık katmanlar birleşir) */
const blok = () => `M${-8000 - 3 * ++ayrac} -8000h1v1h-1Z`;
const TUM = 'M-9000 -9000H9000V9000H-9000Z';
/** üstte duran, kendi çizgisi görünen şekil (isteğe bağlı kırpma k) */
const ust = (d, f, k = null) => ({ d, f, k: [...(k ?? [TUM]), blok()], c: true });
/** çizgisiz dolgu (gölge, parlama): kırpma k içinde */
const boya = (d, f, k = null) => ({ d, f, k, c: false });
/** ince çizgi (dolgu olarak), uçları incelen */
const ince = (n, kalin = 9, uc = kalin * 0.5, k = null) => ({ d: Z.inceSerit(Y.zincir(n), kalin, uc), f: R.OL, k, c: false });

/**
 * Gölge hilali: şeklin (d) ötelenmiş kopyası açık renkte üstte; kenarda koyu hilal kalır.
 * [koyu dolgu, açık dolgu (ötelenmiş, şekle kırpık)]
 */
function hilal(d, koyu, acik, dx, dy) {
  return [boya(d, koyu, [d]), boya(K.donustur(d, (p) => p.translate(dx, dy)), acik, [d])];
}

/**
 * Kulak çifti (Kino'nun ekranın sağındaki kulağı ve aynası). Kino kulağının iç kenarı (x 1175, kafanın kenarı) ve
 * tepesi (y 267) hedefe gelir. o: { ic: [x, y] sağ kulağın iç-tepe noktası, s, eksen (yüz ortası), renk, golge, aci }
 * Döner: { sag, sol, pivotSag, pivotSol } (sag = karakterin sağı = ekranın solu, aynalanmış)
 */
function kulaklar(o) {
  const kaynakIc = [1175, 267];
  const f = K.yerlestir(kaynakIc, o.ic, o.s, o.aci ?? 0);
  const renk = { [R.KAHVE]: o.renk ?? R.KAHVE, [R.KOYU]: o.golge ?? R.KOYU };
  const sol = K.tasi(K.kulak(), f, { renk });
  const pivotSol = f(require('svgpath')(`M${K.KULAK_KOK[0]} ${K.KULAK_KOK[1]}`)).toString().match(/-?[\d.]+/g).map(Number);
  const sag = K.tasi(K.kulak(), (p) => K.ayna(o.eksen)(f(p)), { renk: { [R.KAHVE]: o.renkSag ?? o.renk ?? R.KAHVE, [R.KOYU]: o.golgeSag ?? o.golge ?? R.KOYU } });
  return { sag, sol, pivotSol, pivotSag: [2 * o.eksen - pivotSol[0], pivotSol[1]] };
}

/**
 * Uzun sarkık kulak (Kino'nun kulak biçimi: iç kenar düz iner, dışa doğru genişleyip yuvarlak biter; dışta koyu
 * hilal gölge, üst dış kenarda ince parlama). kok: kulağın kafadaki iç-tepe noktası, s ölçek (Kino = 1),
 * yon: +1 ekranın sağındaki kulak, -1 solundaki. aci: dışa açılma (derece).
 */
function kulakCiz({ kok, s = 1, yon = 1, aci = 0, renk = R.KAHVE, golge = R.KOYU, parlak = true, parlakRenk = 'rgb(240,170,130)', boy = 1 }) {
  const n0 = [[-4, 50], [24, 2], [70, 0], [140, 60], [240, 230], [326, 440], [366, 620], [354, 760], [290, 852], [190, 882], [100, 846], [38, 760], [10, 620], [-2, 420], [-8, 230]];
  // dışa açılma: alt uç dışa (yon yönüne) gider
  const t = (-yon * aci * Math.PI) / 180;
  const tr = ([x, y]) => { const X = x * s * yon, Yy = y * s * boy; return [kok[0] + X * Math.cos(t) - Yy * Math.sin(t), kok[1] + X * Math.sin(t) + Yy * Math.cos(t)]; };
  const d = Y.kapali(n0.map(tr));
  const k = [K.sekil(d, renk), ...hilal(d, golge, renk, -yon * 46 * s, -40 * s)];
  if (parlak) k.push(boya(Z.inceSerit(Y.zincir([[60, 30], [150, 110], [240, 270]].map(tr)), 14 * s, 4), parlakRenk, [d]));
  return { katman: k, pivot: tr([40, 60]) };
}

/**
 * Kolu / bacağı saran bant (manşet, kıvrılmış kol, paça): m0'dan m1'e, yarı genişlik r0 → r1; iki ucu eksen
 * yönünde kavis yapar (silindir gibi). Döner: { d, ust: üst kenar noktaları, alt: alt kenar noktaları }
 */
function bant(m0, m1, r0, r1, kavis = 14) {
  const L = Math.hypot(m1[0] - m0[0], m1[1] - m0[1]);
  const ux = (m1[0] - m0[0]) / L, uy = (m1[1] - m0[1]) / L, px = -uy, py = ux;
  const n = (m, r, t, k) => [m[0] + px * r * t + ux * k, m[1] + py * r * t + uy * k];
  const ust = [n(m0, r0, -1, 0), n(m0, r0, 0, kavis), n(m0, r0, 1, 0)];
  const alt = [n(m1, r1, 1, 0), n(m1, r1, 0, kavis), n(m1, r1, -1, 0)];
  return { d: Y.kapali([[...ust[0], 'k'], ust[1], [...ust[2], 'k'], [...alt[0], 'k'], alt[1], [...alt[2], 'k']]), ust, alt };
}

/**
 * Pürüzsüz uzuv: orta çizgi noktaları [x, y, yarıçap] boyunca yumuşak kenarlı boru (baldır, kalf), uçlarda eklem
 * bilyeleri; ekranın sağındaki kenarda gölge şeridi (kenara koşut, golgeW kalınlığında).
 */
function uzuvYumusak({ nokta, renk, golge, golgeW = 26 }) {
  const L = nokta.length;
  const nrm = nokta.map((p, i) => {
    const a = nokta[Math.max(0, i - 1)], b = nokta[Math.min(L - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
    return [-dy / l, dx / l];
  });
  // nrm: yönün soluna dik; ekranın sağı (x+) hangi yansa o kenar gölgeli
  const sagYan = nrm[0][0] > 0 ? 1 : -1;
  const kenar = (yon, k = 0) => nokta.map((p, i) => [p[0] + nrm[i][0] * yon * (p[2] - k), p[1] + nrm[i][1] * yon * (p[2] - k)]);
  const A = kenar(1), B = kenar(-1);
  const bas = nokta[0], son = nokta[L - 1];
  const uc = (n) => n.map((p, i) => (i === 0 || i === n.length - 1 ? [...p, 'k'] : p));
  const d = Y.kapali([...uc(A), ...uc(B.reverse())]);
  const k = [K.tamam(d, renk), K.tamam(Z.daire(bas[0], bas[1], bas[2]), renk), K.tamam(Z.daire(son[0], son[1], son[2]), renk)];
  if (golge) {
    // uçlardan eksen boyunca yarıçap kadar uzatılır: eklem bilyesinin altında da gölge sürsün (basamak kalmasın)
    const uzat = (n) => {
      const t0 = [nrm[0][1], -nrm[0][0]], t1 = [nrm[L - 1][1], -nrm[L - 1][0]];
      return [[n[0][0] - t0[0] * bas[2], n[0][1] - t0[1] * bas[2]], ...n, [n[L - 1][0] + t1[0] * son[2], n[L - 1][1] + t1[1] * son[2]]];
    };
    const dis = uzat(kenar(sagYan, -24)), ic = uzat(kenar(sagYan, golgeW));
    // uçlarda da biraz taşsın (komşu parçanın gölgesiyle birleşsin), kırpma şeklin kendisi + bilyeler
    k.push(boya(Y.kapali([...uc(dis), ...uc(ic.reverse())]), golge, [d, Z.daire(bas[0], bas[1], bas[2]), Z.daire(son[0], son[1], son[2])]));
  }
  return k;
}

/** Uzuv parçası (kol / bacak): boru + eklem bilyeleri; gölge hilali sağ yanda */
function uzuvKatman({ a, ra, b, rb, renk, golge, bilyeA = true, bilyeB = true, golgeDx = -26 }) {
  const d = Y.uzuv(a, ra, b, rb);
  const k = [K.tamam(d, renk)];
  if (bilyeA) k.push(K.tamam(Z.daire(a[0], a[1], ra), renk));
  if (bilyeB) k.push(K.tamam(Z.daire(b[0], b[1], rb), renk));
  // gölge yalnız iki uç arasında (uçlardaki yaylarda hilal izi kalmasın)
  if (golge) {
    const th = Math.atan2(b[1] - a[1], b[0] - a[0]), al = Math.acos(Math.max(-1, Math.min(1, (ra - rb) / Math.hypot(b[0] - a[0], b[1] - a[1]))));
    const yan = Math.cos(th - al) > Math.cos(th + al) ? th - al : th + al;
    const ux = Math.cos(th), uy = Math.sin(th);
    const pA = [a[0] + ra * Math.cos(yan) - ux * ra, a[1] + ra * Math.sin(yan) - uy * ra], pB = [b[0] + rb * Math.cos(yan) + ux * rb, b[1] + rb * Math.sin(yan) + uy * rb];
    const w = -golgeDx;
    const nx = Math.cos(yan), ny = Math.sin(yan);
    k.push(boya(Y.kapali([[pA[0] + nx * 20, pA[1] + ny * 20, 'k'], [pB[0] + nx * 20, pB[1] + ny * 20, 'k'], [pB[0] - nx * w, pB[1] - ny * w, 'k'], [pA[0] - nx * w, pA[1] - ny * w, 'k']]), golge, [d]));
  }
  return k;
}

/**
 * Uzuv profili: orta çizgi noktaları [x, y, rA, rB] (rA yönün solundaki yarı genişlik, rB sağındaki; aşağı inen
 * uzuvda rA ekranın solu). Catmull-Rom ile sık örneklenir; yarıçaplar da aynı eğriyle yumuşak değişir.
 * Döner: { o: [{ p, t, n, ra, rb }], at(t) en yakın örnek, kenar(t, yan, iceri) kenar noktası (yan +1 = A, -1 = B) }
 */
function profil(nokta, n = 72) {
  const L = nokta.length;
  const cr = (a, b, c, d, t) => a.map((_, i) => 0.5 * (2 * b[i] + (-a[i] + c[i]) * t + (2 * a[i] - 5 * b[i] + 4 * c[i] - d[i]) * t * t + (-a[i] + 3 * b[i] - 3 * c[i] + d[i]) * t * t * t));
  const ham = [];
  const m = Math.ceil(n / (L - 1));
  for (let s = 0; s < L - 1; s++) {
    const p0 = nokta[Math.max(0, s - 1)], p1 = nokta[s], p2 = nokta[s + 1], p3 = nokta[Math.min(L - 1, s + 2)];
    for (let i = 0; i < m + (s === L - 2 ? 1 : 0); i++) ham.push(cr(p0, p1, p2, p3, i / m));
  }
  const o = ham.map((q, i) => {
    const a = ham[Math.max(0, i - 1)], b = ham[Math.min(ham.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    return { p: [q[0], q[1]], t: i / (ham.length - 1), n: [-dy / l, dx / l], ra: q[2], rb: q[3] };
  });
  const at = (t) => o[Math.max(0, Math.min(o.length - 1, Math.round(t * (o.length - 1))))];
  const kenar = (t, yan, iceri = 0) => {
    const s = at(t), r = (yan > 0 ? s.ra : s.rb) - iceri;
    return [s.p[0] + s.n[0] * yan * r, s.p[1] + s.n[1] * yan * r];
  };
  /** eksen boyunca kesit noktası: f = -1 (B kenarı) … +1 (A kenarı) */
  const kesit = (t, f) => {
    const s = at(t), r = f > 0 ? s.ra * f : s.rb * f;
    return [s.p[0] + s.n[0] * r, s.p[1] + s.n[1] * r];
  };
  return { o, at, kenar, kesit };
}

/**
 * El işi uzuv (Kino'nun kol ve bacakları gibi): profil boyunca kıvrımlı, incelip kalınlaşan boru; uçlarda eklem
 * bilyeleri (uçta rA = rB olmalı, bilye pivotta dursun). Gölge ekranın sağındaki yanda, genişliği uzuvun o
 * noktadaki eninin `golgeOran` katı (baldır şişince gölge de genişler, bilekte incelir: Kino'daki gibi kavisli sınır).
 * vurgu: gölge yanındaki kenarda ucu incelen ek mürekkep (çizgi gölgede kalınlaşır, ışıkta ince kalır: el çizimi).
 * isik: ışık yanında ince parlak şerit rengi (kumaş için), isikT: [t0, t1] aralığı.
 */
function uzuvEl({ nokta, renk, golge, golgeOran = 0.3, vurgu = 14, vurguT = [0.12, 0.88], isik = null, isikT = [0.15, 0.8], isikGen = 22, bilyeA = true, bilyeB = true }) {
  const pr = profil(nokta);
  const o = pr.o, L = o.length;
  const kenarN = (yan, ic = 0) => o.map((s) => { const r = (yan > 0 ? s.ra : s.rb) - ic; return [s.p[0] + s.n[0] * yan * r, s.p[1] + s.n[1] * yan * r]; });
  const sec = (n) => n.filter((_, i) => i % 3 === 0 || i === n.length - 1);
  const uc = (n) => n.map((p, i) => (i === 0 || i === n.length - 1 ? [...p, 'k'] : p));
  const d = Y.kapali([...uc(sec(kenarN(1))), ...uc(sec(kenarN(-1)).reverse())]);
  const bilye = (s, ek = 0) => { const r = (s.ra + s.rb) / 2, k = (s.ra - s.rb) / 2; return Z.daire(s.p[0] + s.n[0] * k, s.p[1] + s.n[1] * k, r + ek); };
  // gölge / ışık kırpması bilyeden 1.5 px taşar: eklemde üstteki parçanın bilye kenarında açık renkli yay izi kalmasın
  // (beyaz dolgu ile gölgenin aynı kenarda yarı saydam üst üste binmesi)
  const kirp = [d];
  const k = [K.tamam(d, renk)];
  if (bilyeA) { k.push(K.tamam(bilye(o[0]), renk)); kirp.push(bilye(o[0], 1.5)); }
  if (bilyeB) { k.push(K.tamam(bilye(o[L - 1]), renk)); kirp.push(bilye(o[L - 1], 1.5)); }
  // ekranın sağı hangi yan: n'nin x bileşeni (+ ise A yanı sağda)
  const sagYan = o[Math.floor(L / 2)].n[0] > 0 ? 1 : -1;
  if (golge) {
    const dis = o.map((s) => { const r = (sagYan > 0 ? s.ra : s.rb) + 30; return [s.p[0] + s.n[0] * sagYan * r, s.p[1] + s.n[1] * sagYan * r]; });
    const ic = o.map((s) => { const r = (sagYan > 0 ? s.ra : s.rb) - golgeOran * (s.ra + s.rb); return [s.p[0] + s.n[0] * sagYan * r, s.p[1] + s.n[1] * sagYan * r]; });
    // uçlardan eksen boyunca bilye yarıçapı kadar uzat: eklemin altında da gölge sürsün
    const uzat = (n) => {
      const t0 = [o[0].n[1], -o[0].n[0]], t1 = [o[L - 1].n[1], -o[L - 1].n[0]];
      const r0 = (o[0].ra + o[0].rb) / 2, r1 = (o[L - 1].ra + o[L - 1].rb) / 2;
      return [[n[0][0] - t0[0] * r0, n[0][1] - t0[1] * r0], ...n, [n[L - 1][0] + t1[0] * r1, n[L - 1][1] + t1[1] * r1]];
    };
    k.push(boya(Y.kapali([...uc(sec(uzat(dis))), ...uc(sec(uzat(ic)).reverse())]), golge, kirp));
  }
  if (isik) {
    const i0 = Math.round(isikT[0] * (L - 1)), i1 = Math.round(isikT[1] * (L - 1));
    const yol = [];
    for (let i = i0; i <= i1; i += Math.max(1, Math.round((i1 - i0) / 6))) {
      const s = o[i], r = (sagYan > 0 ? s.rb : s.ra) - 34;
      yol.push([s.p[0] - s.n[0] * sagYan * r, s.p[1] - s.n[1] * sagYan * r]);
    }
    k.push(boya(Z.inceSerit(Y.zincir(yol), isikGen, 4), isik, kirp));
  }
  if (vurgu) {
    const i0 = Math.round(vurguT[0] * (L - 1)), i1 = Math.round(vurguT[1] * (L - 1));
    const yol = [];
    // merkez kenarın 1.5 px dışında: çizginin içine taşan kısım vurgu/2 - 1.5 px (alttaki çizgiyle arada boşluk kalmaz)
    for (let i = i0; i <= i1; i += Math.max(1, Math.round((i1 - i0) / 16))) {
      const s = o[i], r = (sagYan > 0 ? s.ra : s.rb) + 1.5;
      yol.push([s.p[0] + s.n[0] * sagYan * r, s.p[1] + s.n[1] * sagYan * r]);
    }
    k.push(ince(yol, vurgu, 1));
  }
  return k;
}

module.exports = { blok, TUM, ust, boya, ince, hilal, kulaklar, kulakCiz, bant, uzuvKatman, uzuvYumusak, profil, uzuvEl };
