#!/usr/bin/env node
/**
 * Baba (Murat) kesme kukla kiti: Kino C'nin kitinden türer (aynı çizgi, renk, göz / burun / ağız / el / kulak / kuyruk).
 * Yetişkin oranı: boy Kino'nun 1.75 katı, ~3.7 kafa; geniş omuz, tombul göbek, uzun kol ve bacak; yüzde küçük,
 * yarı kapaklı uykulu-sevecen gözler, uzun burun-ağız bölgesi, bıyık biçiminde çikolata leke, başta çikolata takke,
 * koyu çikolata kulaklar, yuvarlak gözlük (ayrı parça: sahnede gizlenebilir). Kıyafet: vişne bisiklet yaka kazak (kollar
 * sıvalı), lacivert-gri pantolon, kahve terlik.
 *
 * Kullanım: node ekip/karakter/baba/kit-kur.cjs   (çıktı assets/karakter/baba/, önizleme ekip/karakter/baba/onizleme)
 */
const path = require('path');
const K = require('../aile-ortak/kino-kaynak.cjs');
const Y = require('../aile-ortak/yol.cjs');
const { ust, boya, ince, hilal, kulakCiz, bant, uzuvKatman, uzuvYumusak } = require('../aile-ortak/parcalar.cjs');
const { uret } = require('../aile-ortak/kit.cjs');

const { R, Z, tamam, sekil } = K;
const KOK = path.resolve(__dirname, '..', '..', '..');
const W = 2300, H = 3820, CX = 1150, ZEMIN = 3700;

// ---------- renkler ----------
const CIKOLATA = 'rgb(122,70,44)', CIKOLATA_K = 'rgb(80,42,28)', CIKOLATA_A = 'rgb(168,110,80)';
const VISNE = 'rgb(170,46,64)', VISNE_K = 'rgb(120,28,44)', VISNE_A = 'rgb(214,98,112)';
const PANTOLON = 'rgb(62,84,126)', PANTOLON_K = 'rgb(40,56,92)';
const TERLIK = 'rgb(156,104,64)', TERLIK_K = 'rgb(108,68,40)', TERLIK_A = 'rgb(206,156,112)';

const parcalar = [];
const ekle = (ad, katman, pivot, ustP, sinir = null, ek = {}) => parcalar.push({ ad, katman, pivot, ust: ustP, sinir, ...ek });

// ---------- kafa (geniş, yanakları dolgun) + takke lekesi ----------
const KAFA = Y.kapali([[1150, 128], [1362, 158], [1508, 288], [1566, 480], [1558, 664], [1506, 826], [1408, 952], [1286, 1040], [1150, 1074], [1014, 1040], [892, 952], [794, 826], [742, 664], [734, 480], [792, 288], [938, 158]]);
const TAKKE = Y.kapali([[1000, 70, 'k'], [1330, 70, 'k'], [1336, 170], [1296, 236], [1222, 270], [1140, 276], [1060, 262], [1004, 224], [984, 160]]);
ekle('kafa', [
  sekil(KAFA, R.BEYAZ),
  ...hilal(KAFA, R.BEJ, R.BEYAZ, -44, -24),
  ust(TAKKE, CIKOLATA, [KAFA]),
  boya(Z.inceSerit(Y.zincir([[1040, 190], [1090, 162], [1150, 152]]), 18, 8), CIKOLATA_A, [TAKKE]),
], [CX, 1090], 'govde', [-20, 20]);

// ---------- kulaklar (koyu çikolata) ----------
const KULAK = { kok: [1404, 200], s: 0.92, aci: 4, renk: CIKOLATA, golge: CIKOLATA_K, parlakRenk: CIKOLATA_A };
const kSag = kulakCiz({ ...KULAK, kok: [2 * CX - KULAK.kok[0], KULAK.kok[1]], yon: -1 }), kSol = kulakCiz({ ...KULAK, yon: 1 });
ekle('kulak-sag', kSag.katman, kSag.pivot, 'kafa', [-25, 25]);
ekle('kulak-sol', kSol.katman, kSol.pivot, 'kafa', [-25, 25]);

// ---------- yüz ----------
const GOZ = [[1034, 566], [1266, 566]], GOZ_S = 0.5;
const grx = 84 * GOZ_S, gry = 117.5 * GOZ_S;
/** yarı kapak: gözün üst çeyreği ten renginde, kenarında kapak çizgisi (uykulu, sevecen) */
const kapak = (hal, i, h) => {
  if (!['acik', 'sola', 'saga'].includes(hal)) return [];
  const [cx, cy] = h;
  const kenar = [[cx - grx - 8, cy - gry * 0.06], [cx - grx * 0.55, cy - gry * 0.5], [cx, cy - gry * 0.62], [cx + grx * 0.55, cy - gry * 0.5], [cx + grx + 8, cy - gry * 0.06]];
  const yay = Z.ornekle(Y.zincir(kenar), 30);
  const ust_ = Y.kapali([...yay.map((p, j) => (j === 0 || j === yay.length - 1 ? [...p, 'k'] : p)), [cx + grx + 30, cy - gry - 40, 'k'], [cx - grx - 30, cy - gry - 40, 'k']], 0.5);
  return [boya(ust_, R.BEYAZ, [Z.elips(cx, cy, grx + 12, gry + 12)]), ince(kenar, 13, 7)];
};
const yuz = K.yuzSetleri({ goz: GOZ, gozS: GOZ_S, kas: [[1034, 452], [1266, 452]], kasS: 1.02, kasKalin: 12, kasIz: 6, agizN: [1146, 912], agizS: 0.64, gozEk: kapak });
const YUZ_PIVOT = [CX, 600];
for (const [hal, k] of Object.entries(yuz.goz)) ekle(`gozler-${hal}`, k, YUZ_PIVOT, 'kafa', null, { yuva: 'gozler' });
for (const [hal, k] of Object.entries(yuz.kaslar)) ekle(`kaslar-${hal}`, k, YUZ_PIVOT, 'kafa', null, { yuva: 'kaslar' });
for (const [hal, k] of Object.entries(yuz.agiz)) ekle(`agiz-${hal}`, k, [1146, 924], 'kafa', null, { yuva: 'agiz' });
const BURUN_S = 0.86;
ekle('burun', K.tasi(K.orj(K.G.burun, null, false), K.yerlestir([718, 811], [CX, 768], BURUN_S), { olcek: BURUN_S }), [CX, 768], 'kafa');
ekle('yanaklar', [
  ...K.tasi(K.orj(K.G.yanakSag, null, false), K.yerlestir([463, 781], [944, 742], 0.72)),
  ...K.tasi(K.orj(K.G.yanakSag, null, false), K.yerlestir([463, 781], [1356, 742], 0.72)),
], [CX, 742], 'kafa');
// bıyık lekesi (burnun altında, ağzın üstünde)
const BIYIK = Y.kapali([[1150, 832], [1192, 820], [1240, 822], [1284, 840], [1300, 866], [1274, 876], [1230, 866], [1186, 860], [1150, 870], [1114, 860], [1070, 866], [1026, 876], [1000, 866], [1016, 840], [1060, 822], [1108, 820]]);
ekle('biyik', [ust(BIYIK, CIKOLATA), boya(Z.inceSerit(Y.zincir([[1046, 840], [1090, 830], [1128, 836]]), 11, 5), CIKOLATA_A, [BIYIK])], [CX, 850], 'kafa');
// gözlük: yuvarlak ince çerçeve, köprü
function halka(cx, cy, r, k) {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 1 ${2 * r} 0a${r} ${r} 0 1 1 ${-2 * r} 0Z` + `M${cx - r + k} ${cy}a${r - k} ${r - k} 0 1 0 ${2 * (r - k)} 0a${r - k} ${r - k} 0 1 0 ${-2 * (r - k)} 0Z`;
}
ekle('gozluk', [
  ...GOZ.map(([x, y]) => boya(halka(x, y + 4, 86, 13), R.OL)),
  ...GOZ.map(([x, y]) => boya(Z.inceSerit(Y.zincir([[x - 52, y - 30], [x - 38, y - 52], [x - 16, y - 64]]), 9, 4), R.BEYAZ)),
  ince([[1114, 556], [1150, 540], [1186, 556]], 12, 10),
  ince([[GOZ[0][0] - 86, 560], [GOZ[0][0] - 130, 548], [GOZ[0][0] - 180, 540]], 11, 9),
  ince([[GOZ[1][0] + 86, 560], [GOZ[1][0] + 130, 548], [GOZ[1][0] + 180, 540]], 11, 9),
], [CX, 560], 'kafa');

// ---------- gövde: boyun + kazak ----------
const BOYUN = Y.kapali([[1052, 960], [1248, 960], [1262, 1160, 'k'], [1038, 1160, 'k']]);
const KAZAK = Y.kapali([[1040, 1104], [900, 1132], [790, 1180], [742, 1262], [748, 1440], [700, 1660], [650, 1880], [676, 2040], [760, 2150, 'k'], [1150, 2186], [1540, 2150, 'k'], [1624, 2040], [1650, 1880], [1600, 1660], [1552, 1440], [1558, 1262], [1510, 1180], [1400, 1132], [1260, 1104]]);
const YAKA = Y.kapali([[1036, 1096, 'k'], [1150, 1120], [1264, 1096, 'k'], [1290, 1140], [1150, 1176], [1010, 1140]]);
const RIBANA = Y.kapali([[688, 2078, 'k'], [1150, 2116], [1612, 2078, 'k'], [1540, 2156, 'k'], [1150, 2190], [760, 2156, 'k']]);
ekle('govde', [
  sekil(BOYUN, R.BEYAZ),
  boya(Z.elips(1150, 1050, 110, 60), R.BEJ, [BOYUN]),
  ust(KAZAK, VISNE),
  boya(Y.kapali([[1420, 1140], [1660, 1140], [1660, 2200], [1460, 2200], [1520, 1880], [1470, 1500]]), VISNE_K, [KAZAK]),
  boya(Z.inceSerit(Y.zincir([[780, 1600], [736, 1760], [730, 1920]]), 30, 12), VISNE_A, [KAZAK]),
  // göbeğin yumuşak kıvrımı
  ince([[920, 1990], [1040, 2036], [1180, 2046], [1320, 2020]], 9, 3),
  ust(YAKA, VISNE_K),
  ...[1080, 1150, 1220].map((x) => ince([[x, 1120 + (x === 1150 ? 6 : 0)], [x, 1160 + (x === 1150 ? 8 : 0)]], 6, 4)),
  ust(RIBANA, VISNE),
  boya(Y.kapali([[1460, 2070], [1640, 2070], [1620, 2200], [1450, 2200]]), VISNE_K, [RIBANA]),
  ...[840, 990, 1150, 1310, 1460].map((x) => ince([[x, 2112 - Math.abs(x - 1150) * 0.08], [x, 2168 - Math.abs(x - 1150) * 0.05]], 6, 4)),
], [CX, 2100], 'kalca', [-15, 15]);

// ---------- pantolon: kalça + bacaklar ----------
ekle('kalca', [tamam(Y.kapali([[900, 2040, 'k'], [1400, 2040, 'k'], [1414, 2240], [1300, 2322], [1150, 2350, 'k'], [1000, 2322], [886, 2240]]), PANTOLON)], [CX, 2210], null, null, { kume: 'bacaklar' });
const BACAK = {
  sag: { kalca: [998, 2240], diz: [978, 2890], bilek: [968, 3520] },
  sol: { kalca: [1302, 2240], diz: [1322, 2890], bilek: [1332, 3520] },
};
for (const y of ['sag', 'sol']) {
  const b = BACAK[y];
  ekle(`bacak-ust-${y}`, uzuvYumusak({ nokta: [[...b.kalca, 116], [(b.kalca[0] + b.diz[0]) / 2, (b.kalca[1] + b.diz[1]) / 2, 108], [...b.diz, 98]], renk: PANTOLON, golge: PANTOLON_K, golgeW: 34 }), b.kalca, 'kalca', [-35, 35], { kume: 'bacaklar' });
  ekle(`bacak-alt-${y}`, [
    ...uzuvYumusak({ nokta: [[...b.diz, 98], [(b.diz[0] + b.bilek[0]) / 2, (b.diz[1] + b.bilek[1]) / 2 + 15, 100], [b.bilek[0], b.bilek[1] + 30, 104]], renk: PANTOLON, golge: PANTOLON_K, golgeW: 34 }),
    ince([[b.diz[0] - 30, b.diz[1] - 20], [b.diz[0] - 6, b.diz[1] + 14], [b.diz[0] + 22, b.diz[1] + 26]], 8, 3),
  ], b.diz, `bacak-ust-${y}`, [-10, 70], { kume: 'bacaklar' });
  // terlik: önden burun kubbesi, kalın taban, dışa dönük
  const sx = y === 'sag' ? -1 : 1, x = b.bilek[0];
  const nok = (n) => n.map(([a, c, k]) => [x + sx * a, c, k]);
  const TERLIK_D = Y.kapali(nok([[-124, 3556], [-40, 3520], [70, 3514], [180, 3538], [246, 3596], [240, 3666], [120, 3704], [-40, 3702], [-130, 3682], [-150, 3620]]));
  const TABAN = Y.kapali(nok([[-146, 3650, 'k'], [0, 3676], [244, 3650, 'k'], [236, 3690], [120, 3716], [-40, 3714], [-136, 3696]]));
  ekle(`ayak-${y}`, [
    ust(TERLIK_D, TERLIK),
    ...hilal(TERLIK_D, TERLIK_K, TERLIK, -sx * 40, -10),
    boya(Z.inceSerit(Y.zincir(nok([[-70, 3578], [0, 3556], [70, 3556]])), 22, 10), TERLIK_A, [TERLIK_D]),
    ust(TABAN, TERLIK_K),
  ], b.bilek, `bacak-alt-${y}`, [-30, 30]);
}

// ---------- kuyruk (Kino'nun kuyruğu, çikolata) ----------
ekle('kuyruk', K.tasi(K.kuyruk(), K.yerlestir(K.KUYRUK_KOK, [1462, 2150], 1.24, 30), { renk: { [R.KAHVE]: CIKOLATA, [R.KOYU]: CIKOLATA_K } }), [1462, 2150], 'kalca', [-35, 35]);

// ---------- kollar: kazak kolu sıvalı (dirsekte kıvrık bant), beyaz önkol, Kino'nun eli ----------
const KOL = {
  sag: { omuz: [808, 1266], dirsek: [676, 1784], bilek: [624, 2214] },
  sol: { omuz: [1492, 1266], dirsek: [1624, 1784], bilek: [1676, 2214] },
};
for (const y of ['sag', 'sol']) {
  const k = KOL[y];
  const L = Math.hypot(k.dirsek[0] - k.omuz[0], k.dirsek[1] - k.omuz[1]);
  const ux = (k.dirsek[0] - k.omuz[0]) / L, uy = (k.dirsek[1] - k.omuz[1]) / L;
  const b0 = [k.dirsek[0] - ux * 70, k.dirsek[1] - uy * 70], b1 = [k.dirsek[0] + ux * 46, k.dirsek[1] + uy * 46];
  const KIVRIM = bant(b0, b1, 104, 100, 18);
  ekle(`kol-ust-${y}`, [
    ...uzuvKatman({ a: k.omuz, ra: 104, b: b0, rb: 94, renk: VISNE, golge: VISNE_K, golgeDx: -36 }),
    ust(KIVRIM.d, VISNE),
    ...hilal(KIVRIM.d, VISNE_K, VISNE, -34, 0),
    ince([KIVRIM.ust[0], [(KIVRIM.ust[1][0] + KIVRIM.alt[1][0]) / 2, (KIVRIM.ust[1][1] + KIVRIM.alt[1][1]) / 2], KIVRIM.ust[2]].map((p, j) => (j === 1 ? p : [p[0] + ux * 52, p[1] + uy * 52])), 7, 4),
  ], k.omuz, 'govde', y === 'sag' ? [-60, 175] : [-175, 60], { kume: `kol-${y}` });
  ekle(`kol-alt-${y}`, uzuvKatman({ a: k.dirsek, ra: 76, b: k.bilek, rb: 64, renk: R.BEYAZ, golge: R.BEJ, golgeDx: -24 }), k.dirsek, `kol-ust-${y}`, [-150, 150], { kume: `kol-${y}` });
  const eksen = Math.atan2(k.bilek[1] - k.dirsek[1], k.bilek[0] - k.dirsek[0]);
  ekle(`el-${y}`, K.elYerlestir(y, [k.bilek[0] + Math.cos(eksen) * 10, k.bilek[1] + Math.sin(eksen) * 10], 1.08, (eksen * 180) / Math.PI), k.bilek, `kol-alt-${y}`, [-45, 45], { kume: `kol-${y}` });
}

// ---------- çizim sırası ----------
const KUMELER = {
  bacaklar: ['bacak-alt-sag', 'bacak-alt-sol', 'bacak-ust-sag', 'bacak-ust-sol', 'kalca'],
  'kol-sag': ['el-sag', 'kol-alt-sag', 'kol-ust-sag'],
  'kol-sol': ['el-sol', 'kol-alt-sol', 'kol-ust-sol'],
};
const SIRA = ['kuyruk', { kume: 'bacaklar' }, 'ayak-sag', 'ayak-sol', 'govde', 'kafa', 'yanaklar', 'burun', 'gozler', 'kaslar', 'agiz', 'biyik', 'gozluk', 'kulak-sag', 'kulak-sol', { kume: 'kol-sag' }, { kume: 'kol-sol' }];
const YUVA = { gozler: 'gozler-acik', kaslar: 'kaslar-notr', agiz: 'agiz-gulumse' };

uret({
  ad: 'baba', W, H, zemin: ZEMIN, parcalar, sira: SIRA, kumeler: KUMELER, yuvaVarsayilan: YUVA,
  cikti: path.join(KOK, 'assets/karakter/baba'),
  onizleme: process.argv[2] || path.join(__dirname, 'onizleme'),
  aciklama: 'Baba (Murat) kesme kukla kiti (ön görünüş), Kino C kitinden türetildi. Koordinatlar 2300x3820 karesinde, Kino ile aynı birim; açı derece, + saat yönü. sag = karakterin sağı = ekranın solu. gozluk ayrı parça (o: 0 ile gizlenir).',
  kur: 'ekip/karakter/baba/kit-kur.cjs',
  yuzKutu: [560, 60, 1180, 1080],
  yuzParcalar: (s) => ['kafa', 'yanaklar', 'burun', s.gozler, s.kaslar, s.agiz, 'biyik', 'gozluk', 'kulak-sag', 'kulak-sol'],
}).catch((e) => { console.error(e); process.exit(1); });
