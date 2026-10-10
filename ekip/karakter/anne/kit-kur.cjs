#!/usr/bin/env node
/**
 * Anne (Defne) kesme kukla kiti: Kino C'nin kitinden türer (aynı çizgi, renk, göz / burun / ağız / el / kulak / kuyruk).
 * Yetişkin oranı: boy Kino'nun 1.6 katı, ~3.6 kafa; yüzde gözler küçük, burun-ağız bölgesi uzun; omuz geniş, kol ve
 * bacak uzun. Kıyafet: hardal V yaka hırka (üç kahve düğme), altında petrol mavisi elbise, koyu kahve düz ayakkabı,
 * başında mercan fiyonk.
 *
 * Kullanım: node ekip/karakter/anne/kit-kur.cjs   (çıktı assets/karakter/anne/, önizleme ekip/karakter/anne/onizleme)
 * Boy tablosu: assets/karakter/aile-boy.json. Ortak: ekip/karakter/aile-ortak/.
 */
const path = require('path');
const K = require('../aile-ortak/kino-kaynak.cjs');
const Y = require('../aile-ortak/yol.cjs');
const { ust, boya, ince, hilal, kulakCiz, uzuvKatman, uzuvYumusak } = require('../aile-ortak/parcalar.cjs');
const { uret } = require('../aile-ortak/kit.cjs');

const { R, Z, tamam, sekil } = K;
const KOK = path.resolve(__dirname, '..', '..', '..');
const W = 2000, H = 3520, CX = 1000, ZEMIN = 3400;

// ---------- renkler ----------
const HARDAL = 'rgb(232,170,58)', HARDAL_K = 'rgb(196,128,36)';
const ELBISE = 'rgb(46,138,140)', ELBISE_K = 'rgb(26,98,104)';
const DUGME = 'rgb(140,82,48)';
const AYAKKABI = 'rgb(104,62,44)', AYAKKABI_K = 'rgb(66,36,26)';
const FIYONK = R.YANAK, FIYONK_K = R.KOYU;

const parcalar = [];
const ekle = (ad, katman, pivot, ustP, sinir = null, ek = {}) => parcalar.push({ ad, katman, pivot, ust: ustP, sinir, ...ek });

// ---------- kafa ----------
const KAFA = Y.kapali([[1000, 134], [1185, 165], [1318, 285], [1372, 470], [1362, 640], [1306, 790], [1214, 905], [1100, 978], [1000, 996], [900, 978], [786, 905], [694, 790], [638, 640], [628, 470], [682, 285], [815, 165]]);
const kafaKatman = [sekil(KAFA, R.BEYAZ), ...hilal(KAFA, R.BEJ, R.BEYAZ, -40, -22).map((e) => ({ ...e, k: [KAFA] }))];
ekle('kafa', kafaKatman, [CX, 1010], 'govde', [-20, 20]);

// ---------- kulaklar ----------
const KULAK = { kok: [1258, 196], s: 0.84, aci: 5 };
const kSag = kulakCiz({ ...KULAK, kok: [2 * CX - KULAK.kok[0], KULAK.kok[1]], yon: -1 }), kSol = kulakCiz({ ...KULAK, yon: 1 });
ekle('kulak-sag', kSag.katman, kSag.pivot, 'kafa', [-25, 25]);
ekle('kulak-sol', kSol.katman, kSol.pivot, 'kafa', [-25, 25]);

// ---------- yüz ----------
const GOZ = [[884, 558], [1116, 558]];
const lashlar = (hal, i, h) => {
  const sx = i === 0 ? -1 : 1, rx = 84 * 0.56, ry = 117.5 * 0.56;
  if (['acik', 'sola', 'saga', 'saskin'].includes(hal)) {
    const k = hal === 'saskin' ? 1.06 : 1;
    return [55, 75, 95].map((a, j) => {
      const r = (a * Math.PI) / 180;
      const p = [h[0] + sx * rx * k * Math.sin(r), h[1] - ry * k * Math.cos(r)];
      const yon = [sx * Math.sin(r + 0.35), -Math.cos(r + 0.35)];
      const L = 30 - j * 3;
      return ince([[p[0] - yon[0] * 4, p[1] - yon[1] * 4], [p[0] + yon[0] * L * 0.5, p[1] + yon[1] * L * 0.5 - 2], [p[0] + yon[0] * L, p[1] + yon[1] * L - 4]], 10, 4);
    });
  }
  const yy = { kapali: 0.08, mutlu: 0.3, yari: 0.31 }[hal] ?? 0.1;
  const p = [h[0] + sx * rx * 0.98, h[1] + ry * yy];
  return [0, 1].map((j) => ince([p, [p[0] + sx * (16 + j * 6), p[1] - 12 + j * 14], [p[0] + sx * (26 + j * 8), p[1] - 22 + j * 24]], 9, 4));
};
const yuz = K.yuzSetleri({ goz: GOZ, gozS: 0.56, kas: [[884, 446], [1116, 446]], kasS: 0.86, kasKalin: 11, agizN: [996, 852], agizS: 0.62, gozEk: lashlar });
const YUZ_PIVOT = [CX, 600];
for (const [hal, k] of Object.entries(yuz.goz)) ekle(`gozler-${hal}`, k, YUZ_PIVOT, 'kafa', null, { yuva: 'gozler' });
for (const [hal, k] of Object.entries(yuz.kaslar)) ekle(`kaslar-${hal}`, k, YUZ_PIVOT, 'kafa', null, { yuva: 'kaslar' });
for (const [hal, k] of Object.entries(yuz.agiz)) ekle(`agiz-${hal}`, k, [996, 864], 'kafa', null, { yuva: 'agiz' });
// burun (Kino'nun burnu ve üstündeki çizgi), yanaklar
const BURUN_S = 0.74;
ekle('burun', K.tasi(K.orj(K.G.burun, null, false), K.yerlestir([718, 811], [CX, 764], BURUN_S), { olcek: BURUN_S }), [CX, 764], 'kafa');
ekle('yanaklar', [
  ...K.tasi(K.orj(K.G.yanakSag, null, false), K.yerlestir([463, 781], [804, 728], 0.72)),
  ...K.tasi(K.orj(K.G.yanakSag, null, false), K.yerlestir([463, 781], [1196, 728], 0.72)),
], [CX, 712], 'kafa');

// ---------- fiyonk (kafanın sağ üstü, kulak kökünün yanı) ----------
function fiyonk(c, s, aci) {
  const f = (n) => n.map(([x, y, k]) => { const r = (aci * Math.PI) / 180; const X = x * s, Yy = y * s; return [c[0] + X * Math.cos(r) - Yy * Math.sin(r), c[1] + X * Math.sin(r) + Yy * Math.cos(r), k]; });
  const solK = Y.kapali(f([[-14, -4], [-50, -46], [-92, -50], [-108, -10], [-96, 38], [-54, 44], [-14, 10]]));
  const sagK = Y.kapali(f([[14, -4], [50, -46], [92, -50], [108, -10], [96, 38], [54, 44], [14, 10]]));
  const dugum = Z.elips(c[0], c[1], 26 * s, 30 * s);
  return [
    ust(solK, FIYONK), ...hilal(solK, FIYONK_K, FIYONK, 0, -16).map((e) => ({ ...e, k: [...e.k, 'M-7000 -7000h1v1h-1Z'] })),
    ust(sagK, FIYONK), ...hilal(sagK, FIYONK_K, FIYONK, 0, -16).map((e) => ({ ...e, k: [...e.k, 'M-7010 -7000h1v1h-1Z'] })),
    ince(f([[-30, -10], [-58, -24], [-80, -22]]), 8, 3), ince(f([[30, -10], [58, -24], [80, -22]]), 8, 3),
    ust(dugum, FIYONK),
    boya(Z.elips(c[0] - 8 * s, c[1] - 10 * s, 8 * s, 6 * s), R.BEYAZ, [dugum]),
  ];
}
ekle('toka', fiyonk([1222, 228], 1.05, 18), [1222, 228], 'kafa');

// ---------- gövde: boyun + hırka + V yakada elbise ----------
const BOYUN = Y.kapali([[928, 930], [1072, 930], [1082, 1100, 'k'], [918, 1100, 'k']]);
const HIRKA = Y.kapali([[904, 1036], [790, 1062], [700, 1104], [672, 1180], [700, 1420], [748, 1640], [738, 1860], [730, 1942, 'k'], [1000, 1962], [1270, 1942, 'k'], [1262, 1860], [1252, 1640], [1300, 1420], [1328, 1180], [1300, 1104], [1210, 1062], [1096, 1036]]);
const V = Y.kapali([[912, 1030, 'k'], [1088, 1030, 'k'], [1000, 1388, 'k']], 0.6);
const GOGUS = Y.kapali([[934, 1030, 'k'], [1066, 1030, 'k'], [1040, 1092], [1000, 1110], [960, 1092]]);
const gHirka = [
  sekil(BOYUN, R.BEYAZ),
  boya(Z.elips(1000, 1010, 70, 40), R.BEJ, [BOYUN]),
  ust(HIRKA, HARDAL),
  boya(Y.kapali([[1205, 1060], [1360, 1060], [1360, 1980], [1218, 1980], [1196, 1700], [1222, 1430], [1250, 1250]]), HARDAL_K, [HIRKA]),
  boya(Z.inceSerit(Y.zincir([[770, 1210], [752, 1330], [756, 1450]]), 24, 10), 'rgb(250,214,140)', [HIRKA]),
  ust(V, ELBISE),
  boya(Y.kapali([[1030, 1030], [1090, 1030], [1000, 1388]]), ELBISE_K, [V]),
  ust(GOGUS, R.BEYAZ, [V]),
  // hırkanın ön kenarı (düğme şeridi) ve etek ribanası
  ince([[1000, 1384], [1002, 1600], [1000, 1955]], 9, 6),
  ince([[736, 1868], [870, 1886], [1000, 1890], [1130, 1886], [1264, 1868]], 9, 5),
];
for (const y of [1480, 1610, 1740]) {
  const d = Z.daire(1036, y, 23);
  gHirka.push(ust(d, DUGME), boya(Z.daire(1029, y - 8, 7), 'rgb(214,160,120)', [d]));
}
ekle('govde', gHirka, [CX, 1880], 'kalca', [-15, 15]);

// ---------- etek (elbisenin alt yarısı) ----------
const ETEK = Y.kapali([[770, 1800, 'k'], [1230, 1800, 'k'], [1268, 2050], [1320, 2300], [1352, 2452, 'k'], [1180, 2478], [1000, 2486], [820, 2478], [648, 2452, 'k'], [680, 2300], [732, 2050]]);
ekle('etek', [
  sekil(ETEK, ELBISE),
  boya(Y.kapali([[1170, 1800], [1260, 1800], [1360, 2470], [1205, 2490], [1210, 2200]]), ELBISE_K, [ETEK]),
  ince([[1110, 2300], [1124, 2390], [1130, 2470]], 8, 3),
  ince([[880, 2320], [872, 2400], [866, 2472]], 8, 3),
], [CX, 1900], 'kalca', [-8, 8]);

// ---------- kalça ve bacaklar (beyaz tüy) ----------
ekle('kalca', [tamam(Y.kapali([[840, 1830], [1160, 1830], [1170, 2000], [1000, 2040], [830, 2000]]), R.BEYAZ)], [CX, 1900], null, null, { kume: 'bacaklar' });
const BACAK = {
  sag: { kalca: [892, 1960], diz: [886, 2640], bilek: [880, 3230] },
  sol: { kalca: [1108, 1960], diz: [1114, 2640], bilek: [1120, 3230] },
};
for (const y of ['sag', 'sol']) {
  const b = BACAK[y];
  ekle(`bacak-ust-${y}`, uzuvYumusak({ nokta: [[...b.kalca, 112], [(b.kalca[0] + b.diz[0]) / 2, (b.kalca[1] + b.diz[1]) / 2, 100], [...b.diz, 86]], renk: R.BEYAZ, golge: R.BEJ }), b.kalca, 'kalca', [-35, 35], { kume: 'bacaklar' });
  // baldır: dizden aşağı hafif dolgunlaşır, bileğe incelir
    const ara = (t) => [b.diz[0] + (b.bilek[0] - b.diz[0]) * t, b.diz[1] + (b.bilek[1] + 40 - b.diz[1]) * t];
  ekle(`bacak-alt-${y}`, uzuvYumusak({ nokta: [[...b.diz, 86], [...ara(0.16), 88], [...ara(0.32), 89], [...ara(0.55), 83], [...ara(0.8), 71], [b.bilek[0], b.bilek[1] + 40, 64]], renk: R.BEYAZ, golge: R.BEJ }), b.diz, `bacak-ust-${y}`, [-10, 70], { kume: 'bacaklar' });
  // düz ayakkabı: önden burun kubbesi, üstte ayağın beyazı; uç dışa döner
  const sx = y === 'sag' ? -1 : 1, x = b.bilek[0];
  const nok = (n) => n.map(([a, c, k]) => [x + sx * a, c, k]);
  const AYAK = Y.kapali(nok([[-56, 3250], [60, 3250], [80, 3324], [20, 3330], [-52, 3326]]));
  const AYAKKABI_D = Y.kapali(nok([[-74, 3322], [-20, 3312], [60, 3310], [140, 3318], [190, 3350], [184, 3396], [84, 3414], [-40, 3412], [-86, 3396], [-92, 3356]]));
  ekle(`ayak-${y}`, [
    tamam(AYAK, R.BEYAZ),
    ust(AYAKKABI_D, AYAKKABI),
    ...hilal(AYAKKABI_D, AYAKKABI_K, AYAKKABI, -sx * 34, -18),
    ince(nok([[-90, 3380], [-20, 3393], [80, 3395], [162, 3374]]), 8, 4),
    boya(Z.inceSerit(Y.zincir(nok([[-40, 3336], [10, 3326], [60, 3326]])), 16, 8), 'rgb(170,118,92)', [AYAKKABI_D]),
  ], b.bilek, `bacak-alt-${y}`, [-30, 30]);
}

// ---------- kuyruk (Kino'nun kuyruğu, büyük) ----------
ekle('kuyruk', K.tasi(K.kuyruk(), K.yerlestir(K.KUYRUK_KOK, [1232, 1890], 1.12, 30)), [1232, 1890], 'kalca', [-35, 35]);

// ---------- kollar (hırka kolu, riba manşet, Kino'nun eli) ----------
const KOL = {
  sag: { omuz: [722, 1176], dirsek: [676, 1640], bilek: [640, 2030] },
  sol: { omuz: [1278, 1176], dirsek: [1324, 1640], bilek: [1360, 2030] },
};
for (const y of ['sag', 'sol']) {
  const k = KOL[y];
  const sx = y === 'sag' ? -1 : 1;
  ekle(`kol-ust-${y}`, uzuvKatman({ a: k.omuz, ra: 80, b: k.dirsek, rb: 66, renk: HARDAL, golge: HARDAL_K, golgeDx: -30 }), k.omuz, 'govde', y === 'sag' ? [-60, 175] : [-175, 60], { kume: `kol-${y}` });
  // manşet: bileğin hemen üstünde, kolun ucunu saran riba bant
  const eksen = Math.atan2(k.bilek[1] - k.dirsek[1], k.bilek[0] - k.dirsek[0]);
  const ux = Math.cos(eksen), uy = Math.sin(eksen);
  const m0 = [k.bilek[0] - ux * 70, k.bilek[1] - uy * 70], m1 = [k.bilek[0] + ux * 4, k.bilek[1] + uy * 4];
  const px = -uy, py = ux;
  const MANSET = Y.kapali([[m0[0] + px * 60, m0[1] + py * 60], [m1[0] + px * 62 + ux * 6, m1[1] + py * 62 + uy * 6, 'k'], [m1[0] + ux * 14, m1[1] + uy * 14], [m1[0] - px * 62 + ux * 6, m1[1] - py * 62 + uy * 6, 'k'], [m0[0] - px * 60, m0[1] - py * 60]]);
  const kenar = (p, r) => [[p[0] - uy * r, p[1] + ux * r], [p[0] + ux * 10, p[1] + uy * 10], [p[0] + uy * r, p[1] - ux * r]];
  ekle(`kol-alt-${y}`, [
    ...uzuvKatman({ a: k.dirsek, ra: 66, b: m0, rb: 58, renk: HARDAL, golge: HARDAL_K, golgeDx: -28 }),
    ust(MANSET, HARDAL),
    ...hilal(MANSET, HARDAL_K, HARDAL, -26, 0).map((e) => ({ ...e, k: [...e.k, `M-7${y === 'sag' ? 1 : 2}00 -7000h1v1h-1Z`] })),
    ...[-30, 0, 30].map((o) => ince([[m0[0] - uy * o + ux * 12, m0[1] + ux * o + uy * 12], [m1[0] - uy * o * 0.95 - ux * 8, m1[1] + ux * o * 0.95 - uy * 8]], 6, 4)),
  ], k.dirsek, `kol-ust-${y}`, [-150, 150], { kume: `kol-${y}` });
  void kenar; void sx;
  const aci = (eksen * 180) / Math.PI;
  ekle(`el-${y}`, K.elYerlestir(y, [k.bilek[0] + Math.cos(eksen) * 50, k.bilek[1] + Math.sin(eksen) * 50], 0.92, aci), k.bilek, `kol-alt-${y}`, [-45, 45], { kume: `kol-${y}` });
}

// ---------- çizim sırası ----------
const KUMELER = {
  bacaklar: ['bacak-alt-sag', 'bacak-alt-sol', 'bacak-ust-sag', 'bacak-ust-sol', 'kalca'],
  'kol-sag': ['el-sag', 'kol-alt-sag', 'kol-ust-sag'],
  'kol-sol': ['el-sol', 'kol-alt-sol', 'kol-ust-sol'],
};
const SIRA = ['kuyruk', { kume: 'bacaklar' }, 'ayak-sag', 'ayak-sol', 'etek', 'govde', 'kafa', 'yanaklar', 'burun', 'gozler', 'kaslar', 'agiz', 'kulak-sag', 'kulak-sol', 'toka', { kume: 'kol-sag' }, { kume: 'kol-sol' }];
const YUVA = { gozler: 'gozler-acik', kaslar: 'kaslar-notr', agiz: 'agiz-gulumse' };

uret({
  ad: 'anne', W, H, zemin: ZEMIN, parcalar, sira: SIRA, kumeler: KUMELER, yuvaVarsayilan: YUVA,
  cikti: path.join(KOK, 'assets/karakter/anne'),
  onizleme: process.argv[2] || path.join(__dirname, 'onizleme'),
  aciklama: 'Anne (Defne) kesme kukla kiti (ön görünüş), Kino C kitinden türetildi. Koordinatlar 2000x3520 karesinde, Kino ile aynı birim; açı derece, + saat yönü. sag = karakterin sağı = ekranın solu.',
  kur: 'ekip/karakter/anne/kit-kur.cjs',
  yuzKutu: [460, 80, 1080, 1000],
  yuzParcalar: (s) => ['kafa', 'yanaklar', 'burun', s.gozler, s.kaslar, s.agiz, 'kulak-sag', 'kulak-sol', 'toka'],
}).catch((e) => { console.error(e); process.exit(1); });
