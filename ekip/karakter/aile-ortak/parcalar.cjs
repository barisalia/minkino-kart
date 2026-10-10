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

module.exports = { blok, TUM, ust, boya, ince, hilal, kulaklar, kulakCiz, bant, uzuvKatman, uzuvYumusak };
