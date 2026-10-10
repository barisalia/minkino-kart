#!/usr/bin/env node
/**
 * Anne (Defne) kesme kukla kiti: Kino C'nin kitinden türer (aynı çizgi, renk, göz / burun / ağız / el / kulak / kuyruk).
 * Yetişkin oranı: boy Kino'nun 1.6 katı, ~3.6 kafa; kafa oval (şakakta geniş, yanaktan çeneye daralır), gözler kafanın
 * ortasına yakın, burun-ağız bölgesi uzun; omuz geniş, kol ve bacak uzun. Kol ve bacaklar el işi profil (uzuvEl): baldır
 * kıvrımı, bilekte incelme, eninle değişen gölge, gölge yanında kalınlaşan mürekkep; eller Kino'nun eli, parmaklar uzun
 * (elYerlestir olgun). Kıyafet: hardal V yaka hırka (üç kahve düğme, dirsekte kırışık), altında kıvrımlı etekli petrol
 * mavisi elbise, bantlı koyu kahve düz ayakkabı, başında mercan fiyonk.
 *
 * Kullanım: node ekip/karakter/anne/kit-kur.cjs   (çıktı assets/karakter/anne/, önizleme ekip/karakter/anne/onizleme)
 * Boy tablosu: assets/karakter/aile-boy.json. Ortak: ekip/karakter/aile-ortak/.
 */
const path = require('path');
const K = require('../aile-ortak/kino-kaynak.cjs');
const Y = require('../aile-ortak/yol.cjs');
const { ust, boya, ince, hilal, kulakCiz, profil, uzuvEl } = require('../aile-ortak/parcalar.cjs');
const { uret } = require('../aile-ortak/kit.cjs');

const { R, Z, tamam, sekil } = K;
const KOK = path.resolve(__dirname, '..', '..', '..');
const W = 2000, H = 3520, CX = 1000, ZEMIN = 3400;
/** yetişkin eli: Kino'nun eli, parmaklar uzun, el ince (K.elYerlestir) */
const OLGUN_EL = { parmak: 0.34, en: 0.86, avucEn: 0.92, u0: 64, gecis: 46 };

// ---------- renkler ----------
const HARDAL = 'rgb(232,170,58)', HARDAL_K = 'rgb(196,128,36)';
const ELBISE = 'rgb(46,138,140)', ELBISE_K = 'rgb(26,98,104)', ELBISE_A = 'rgb(84,170,168)';
const DUGME = 'rgb(140,82,48)';
const AYAKKABI = 'rgb(104,62,44)', AYAKKABI_K = 'rgb(66,36,26)';
const FIYONK = R.YANAK, FIYONK_K = R.KOYU;

const parcalar = [];
const ekle = (ad, katman, pivot, ustP, sinir = null, ek = {}) => parcalar.push({ ad, katman, pivot, ust: ustP, sinir, ...ek });

// ---------- kafa ----------
// yetişkin kafası: Kino'nunki gibi yanakta değil şakakta en geniş; yanaktan çeneye yumuşakça daralan yumurta (oval)
const KAFA = Y.kapali([[1000, 130], [1176, 154], [1306, 250], [1368, 410], [1370, 560], [1342, 700], [1286, 830], [1200, 940], [1100, 1012], [1000, 1034], [900, 1012], [800, 940], [714, 830], [658, 700], [630, 560], [632, 410], [694, 250], [824, 154]].map(([x, y]) => [CX + (x - CX) * 0.96, 150 + (y - 130) * 0.965]));
const kafaKatman = [sekil(KAFA, R.BEYAZ), ...hilal(KAFA, R.BEJ, R.BEYAZ, -40, -22).map((e) => ({ ...e, k: [KAFA] }))];
ekle('kafa', kafaKatman, [CX, 1020], 'govde', [-20, 20]);

// ---------- kulaklar ----------
const KULAK = { kok: [1246, 208], s: 0.84, aci: 5 };
const kSag = kulakCiz({ ...KULAK, kok: [2 * CX - KULAK.kok[0], KULAK.kok[1]], yon: -1 }), kSol = kulakCiz({ ...KULAK, yon: 1 });
ekle('kulak-sag', kSag.katman, kSag.pivot, 'kafa', [-25, 25]);
ekle('kulak-sol', kSol.katman, kSol.pivot, 'kafa', [-25, 25]);

// ---------- yüz ----------
// gözler kafanın ortasına yakın (çocukta aşağıda), burun ve ağız daha aşağıda: uzun burun-ağız bölgesi
const GOZ = [[884, 536], [1116, 536]];
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
const yuz = K.yuzSetleri({ goz: GOZ, gozS: 0.56, kas: [[884, 424], [1116, 424]], kasS: 0.86, kasKalin: 11, agizN: [996, 884], agizS: 0.62, gozEk: lashlar });
const YUZ_PIVOT = [CX, 600];
for (const [hal, k] of Object.entries(yuz.goz)) ekle(`gozler-${hal}`, k, YUZ_PIVOT, 'kafa', null, { yuva: 'gozler' });
for (const [hal, k] of Object.entries(yuz.kaslar)) ekle(`kaslar-${hal}`, k, YUZ_PIVOT, 'kafa', null, { yuva: 'kaslar' });
for (const [hal, k] of Object.entries(yuz.agiz)) ekle(`agiz-${hal}`, k, [996, 896], 'kafa', null, { yuva: 'agiz' });
// burun (Kino'nun burnu ve üstündeki çizgi), yanaklar (yetişkinde daha küçük allık)
const BURUN_S = 0.74;
ekle('burun', K.tasi(K.orj(K.G.burun, null, false), K.yerlestir([718, 811], [CX, 794], BURUN_S), { olcek: BURUN_S }), [CX, 794], 'kafa');
ekle('yanaklar', [
  ...K.tasi(K.orj(K.G.yanakSag, null, false), K.yerlestir([463, 781], [814, 722], 0.62)),
  ...K.tasi(K.orj(K.G.yanakSag, null, false), K.yerlestir([463, 781], [1186, 722], 0.62)),
], [CX, 722], 'kafa');

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
ekle('toka', fiyonk([1212, 238], 1.05, 18), [1212, 238], 'kafa');

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

// ---------- etek (elbisenin alt yarısı): A kesim, etek ucunda üç kıvrım (dalgalı uç, yukarı incelen kat izleri) ----------
const ETEK = Y.kapali([[770, 1800, 'k'], [1230, 1800, 'k'], [1268, 2050], [1316, 2290], [1356, 2448, 'k'], [1300, 2480], [1236, 2492], [1184, 2470], [1122, 2494], [1060, 2502], [1000, 2480], [940, 2502], [878, 2494], [816, 2470], [764, 2492], [700, 2480], [644, 2448, 'k'], [684, 2290], [732, 2050]]);
/** kat izi: yukarıda incecik, etek ucunda kalın (çizgiye karışır) */
const katIzi = (n, kalin = 10) => ({ d: Z.inceSerit(Y.zincir(n), kalin, 1.5, (t) => Math.pow(t, 0.75)), f: R.OL, k: [ETEK], c: false });
ekle('etek', [
  sekil(ETEK, ELBISE),
  // kıvrım gölgeleri: her katın sağında, uca doğru genişleyen koyu kama
  ...[[1184, 2470, 1146, 2190], [1000, 2480, 1004, 2240], [816, 2470, 850, 2200]].map(([x, y, ux, uy]) => boya(Y.kapali([[ux, uy, 'k'], [x + 4, y], [x + 46, y + 26], [x + 30, y - 120]]), ELBISE_K, [ETEK])),
  // sağ yan gölge, sol panelde ışık
  boya(Y.kapali([[1176, 1800], [1262, 1800], [1366, 2470], [1240, 2496], [1236, 2300], [1206, 2060]]), ELBISE_K, [ETEK]),
  boya(Z.inceSerit(Y.zincir([[752, 2080], [728, 2240], [714, 2400]]), 24, 6), ELBISE_A, [ETEK]),
  boya(Z.inceSerit(Y.zincir([[920, 2300], [906, 2380], [898, 2460]]), 16, 4), ELBISE_A, [ETEK]),
  katIzi([[1146, 2190], [1166, 2340], [1184, 2470]]),
  katIzi([[1004, 2240], [1002, 2370], [1000, 2480]], 9),
  katIzi([[850, 2200], [832, 2340], [816, 2470]]),
  // bel altı yumuşak kırışık
  ince([[900, 1990], [930, 2040], [944, 2100]], 7, 2),
  ince([[1106, 1996], [1080, 2050], [1070, 2110]], 7, 2),
], [CX, 1900], 'kalca', [-8, 8]);

// ---------- kalça ve bacaklar (beyaz tüy, el işi profil: diz, baldır kıvrımı, bilekte incelme) ----------
ekle('kalca', [tamam(Y.kapali([[840, 1830], [1160, 1830], [1170, 2000], [1000, 2040], [830, 2000]]), R.BEYAZ)], [CX, 1900], null, null, { kume: 'bacaklar' });
// ekranın solundaki bacak (karakterin sağı); A = ekranın solu (dış yan), B = iç yan
const BX = -14; // bacaklar arası açıklık (iki baldır birbirine değmesin)
const BACAK_SAG = {
  kalca: [892 + BX, 1960], diz: [902 + BX, 2660], bilek: [884 + BX, 3236],
  // eklem çevresinde (bilye yarıçapı boyunca) profil sabit: iki parçanın gölgesi dizde basamaksız birleşir
  ust: [[892, 1960, 116, 116], [896, 2200, 116, 108], [900, 2440, 100, 94], [902, 2580, 88, 88], [902, 2660, 87, 87]].map(([x, ...r]) => [x + BX, ...r]),
  // diz altında baldır dışa doğru dolgunlaşır, bileğe incelir, ayağa hafif açılır
  alt: [[902, 2660, 87, 87], [902, 2740, 88, 86], [901, 2810, 99, 89], [899, 2890, 110, 93], [895, 2990, 102, 87], [890, 3100, 74, 66], [886, 3200, 52, 50], [884, 3276, 58, 58]].map(([x, ...r]) => [x + BX, ...r]),
};
const aynaUzuv = (n) => n.map(([x, y, a, b]) => [2 * CX - x, y, b, a]);
const aynaN = ([x, y]) => [2 * CX - x, y];
const BACAK = {
  sag: BACAK_SAG,
  sol: { kalca: aynaN(BACAK_SAG.kalca), diz: aynaN(BACAK_SAG.diz), bilek: aynaN(BACAK_SAG.bilek), ust: aynaUzuv(BACAK_SAG.ust), alt: aynaUzuv(BACAK_SAG.alt) },
};
for (const y of ['sag', 'sol']) {
  const b = BACAK[y];
  const ic = y === 'sag' ? -1 : 1; // iç yan (profilde)
  const pAlt = profil(b.alt);
  ekle(`bacak-ust-${y}`, uzuvEl({ nokta: b.ust, renk: R.BEYAZ, golge: R.BEJ }), b.kalca, 'kalca', [-35, 35], { kume: 'bacaklar' });
  ekle(`bacak-alt-${y}`, [
    ...uzuvEl({ nokta: b.alt, renk: R.BEYAZ, golge: R.BEJ }),
    // diz kapağının altında yumuşak kıvrım (iç yandan)
    ince([pAlt.kenar(0.05, ic, 6), pAlt.kesit(0.09, ic * 0.55), pAlt.kesit(0.1, ic * 0.15)], 8, 2),
  ], b.diz, `bacak-ust-${y}`, [-10, 70], { kume: 'bacaklar' });
  // düz ayakkabı (bantlı): önden burun kubbesi, üstte ayağın beyazı, ayak üstünde bant ve düğme; uç dışa döner
  const sx = y === 'sag' ? -1 : 1, x = b.bilek[0];
  const nok = (n) => n.map(([a, c, k]) => [x + sx * a, c, k]);
  const AYAK = Y.kapali(nok([[-56, 3250], [60, 3250], [80, 3324], [20, 3330], [-52, 3326]]));
  const AYAKKABI_D = Y.kapali(nok([[-74, 3322], [-20, 3312], [60, 3310], [140, 3318], [190, 3350], [184, 3396], [84, 3414], [-40, 3412], [-86, 3396], [-92, 3356]]));
  const BANT = Y.kapali(nok([[-60, 3284, 'k'], [64, 3280, 'k'], [70, 3308, 'k'], [-60, 3312, 'k']]), 0.4);
  ekle(`ayak-${y}`, [
    tamam(AYAK, R.BEYAZ),
    boya(Y.kapali(nok([[20, 3250], [60, 3250], [80, 3324], [30, 3330]])), R.BEJ, [AYAK]),
    ust(BANT, AYAKKABI),
    boya(Y.kapali(nok([[30, 3270], [80, 3270], [80, 3320], [36, 3320]])), AYAKKABI_K, [BANT]),
    ust(Z.daire(x + sx * 34, 3297, 13), 'rgb(214,160,120)'),
    ust(AYAKKABI_D, AYAKKABI),
    ...hilal(AYAKKABI_D, AYAKKABI_K, AYAKKABI, -sx * 34, -18),
    ince(nok([[-90, 3380], [-20, 3393], [80, 3395], [162, 3374]]), 8, 4),
    boya(Z.inceSerit(Y.zincir(nok([[-40, 3336], [10, 3326], [60, 3326]])), 16, 8), 'rgb(170,118,92)', [AYAKKABI_D]),
  ], b.bilek, `bacak-alt-${y}`, [-30, 30]);
}

// ---------- kuyruk (Kino'nun kuyruğu, büyük) ----------
ekle('kuyruk', K.tasi(K.kuyruk(), K.yerlestir(K.KUYRUK_KOK, [1232, 1890], 1.12, 30)), [1232, 1890], 'kalca', [-35, 35]);

// ---------- kollar (hırka kolu: omuzda dolgun, dirsekte kırışık, manşete doğru hafif bol; riba manşet; yetişkin el) ----------
const KOL_SAG = { omuz: [722, 1176], dirsek: [682, 1630], bilek: [652, 2024] };
const KOL = { sag: KOL_SAG, sol: { omuz: [2 * CX - 722, 1176], dirsek: [2 * CX - 682, 1630], bilek: [2 * CX - 652, 2024] } };
for (const y of ['sag', 'sol']) {
  const k = KOL[y];
  const ayna = y === 'sol' ? aynaUzuv : (n) => n;
  const ic = y === 'sag' ? -1 : 1; // gövde yanı (profilde)
  const eksen = Math.atan2(k.bilek[1] - k.dirsek[1], k.bilek[0] - k.dirsek[0]);
  const ux = Math.cos(eksen), uy = Math.sin(eksen);
  const m0 = [k.bilek[0] - ux * 70, k.bilek[1] - uy * 70], m1 = [k.bilek[0] + ux * 4, k.bilek[1] + uy * 4];
  // üst kol: omuz yuvarlağı, pazıda hafif dolgunluk, dirseğe incelir (ekranın solundaki kol koordinatlarıyla, aynalanır)
  const ust_ = ayna([[722, 1176, 80, 80], [714, 1290, 84, 78], [702, 1450, 75, 71], [690, 1572, 67, 67], [682, 1630, 66, 66]]);
  const ustP = profil(ust_);
  ekle(`kol-ust-${y}`, [
    ...uzuvEl({ nokta: ust_, renk: HARDAL, golge: HARDAL_K, golgeOran: 0.3, isik: 'rgb(250,214,140)', isikT: [0.12, 0.7], isikGen: 20 }),
    ince([ustP.kenar(0.82, ic, 5), ustP.kesit(0.86, ic * 0.45), ustP.kesit(0.84, ic * 0.1)], 7, 2),
  ], k.omuz, 'govde', y === 'sag' ? [-60, 175] : [-175, 60], { kume: `kol-${y}` });
  // ön kol: dirsekten sonra kumaş hafif bollaşır, manşete toplanır
  const alt_ = ayna([[682, 1630, 66, 66], [678, 1690, 66, 66], [673, 1790, 71, 67], [668, 1880, 69, 65], [y === 'sag' ? m0[0] : 2 * CX - m0[0], m0[1], 60, 60]]);
  const altP = profil(alt_);
  const px = -uy, py = ux;
  const MANSET = Y.kapali([[m0[0] + px * 60, m0[1] + py * 60], [m1[0] + px * 62 + ux * 6, m1[1] + py * 62 + uy * 6, 'k'], [m1[0] + ux * 14, m1[1] + uy * 14], [m1[0] - px * 62 + ux * 6, m1[1] - py * 62 + uy * 6, 'k'], [m0[0] - px * 60, m0[1] - py * 60]]);
  ekle(`kol-alt-${y}`, [
    ...uzuvEl({ nokta: alt_, renk: HARDAL, golge: HARDAL_K, golgeOran: 0.3, vurguT: [0.15, 0.8] }),
    // dirsek içinde iki kırışık, manşet üstünde toplanma
    ince([altP.kenar(0.06, ic, 5), altP.kesit(0.12, ic * 0.5), altP.kesit(0.14, ic * 0.12)], 8, 2),
    ince([altP.kenar(0.22, ic, 5), altP.kesit(0.26, ic * 0.55)], 7, 2),
    ince([altP.kenar(0.8, -ic, 5), altP.kesit(0.84, -ic * 0.45), altP.kesit(0.83, -ic * 0.1)], 7, 2),
    ust(MANSET, HARDAL),
    ...hilal(MANSET, HARDAL_K, HARDAL, -26, 0).map((e) => ({ ...e, k: [...e.k, `M-7${y === 'sag' ? 1 : 2}00 -7000h1v1h-1Z`] })),
    ...[-30, 0, 30].map((o) => ince([[m0[0] - uy * o + ux * 12, m0[1] + ux * o + uy * 12], [m1[0] - uy * o * 0.95 - ux * 8, m1[1] + ux * o * 0.95 - uy * 8]], 6, 4)),
  ], k.dirsek, `kol-ust-${y}`, [-150, 150], { kume: `kol-${y}` });
  const aci = (eksen * 180) / Math.PI;
  ekle(`el-${y}`, K.elYerlestir(y, [k.bilek[0] + ux * 50, k.bilek[1] + uy * 50], 0.9, aci, OLGUN_EL), k.bilek, `kol-alt-${y}`, [-45, 45], { kume: `kol-${y}` });
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
