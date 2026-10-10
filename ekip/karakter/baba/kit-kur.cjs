#!/usr/bin/env node
/**
 * Baba (Murat) kesme kukla kiti: Kino C'nin kitinden türer (aynı çizgi, renk, göz / burun / ağız / el / kulak / kuyruk).
 * Genç, sevecen baba. Yetişkin oranı: boy Kino'nun 1.75 katı, ~3.7 kafa; geniş omuz, hafif göbek, uzun kol ve bacak;
 * kafa oval (şakakta geniş, çeneye daralır), açık sevecen gözler, uzun burun-ağız bölgesi, kulak kökünde küçük çikolata
 * leke, koyu çikolata kulaklar; yuvarlak gözlük isteğe bağlı eşya (varsayılan gizli). Kol ve bacaklar el işi profil
 * (uzuvEl): pantolonda uyluk dolgunluğu, cep, diz ve paça kırışıkları, ışık şeridi; önkolda kas dolgunluğu; eller
 * Kino'nun eli, parmaklar uzun. Kıyafet: vişne bisiklet yaka kazak (kollar sıvalı), lacivert pantolon, kahve terlik.
 *
 * Kullanım: node ekip/karakter/baba/kit-kur.cjs   (çıktı assets/karakter/baba/, önizleme ekip/karakter/baba/onizleme)
 */
const path = require('path');
const K = require('../aile-ortak/kino-kaynak.cjs');
const Y = require('../aile-ortak/yol.cjs');
const { ust, boya, ince, hilal, kulakCiz, bant, profil, uzuvEl } = require('../aile-ortak/parcalar.cjs');
const { uret } = require('../aile-ortak/kit.cjs');

const { R, Z, tamam, sekil } = K;
const KOK = path.resolve(__dirname, '..', '..', '..');
const W = 2300, H = 3820, CX = 1150, ZEMIN = 3700;
/** yetişkin eli: Kino'nun eli, parmaklar uzun, el ince (K.elYerlestir) */
const OLGUN_EL = { parmak: 0.34, en: 0.88, avucEn: 0.94, u0: 64, gecis: 46 };

// ---------- renkler ----------
const CIKOLATA = 'rgb(122,70,44)', CIKOLATA_K = 'rgb(80,42,28)', CIKOLATA_A = 'rgb(168,110,80)';
const VISNE = 'rgb(170,46,64)', VISNE_K = 'rgb(120,28,44)', VISNE_A = 'rgb(214,98,112)';
const PANTOLON = 'rgb(62,84,126)', PANTOLON_K = 'rgb(40,56,92)', PANTOLON_A = 'rgb(96,122,168)';
const TERLIK = 'rgb(156,104,64)', TERLIK_K = 'rgb(108,68,40)', TERLIK_A = 'rgb(206,156,112)';

const parcalar = [];
const ekle = (ad, katman, pivot, ustP, sinir = null, ek = {}) => parcalar.push({ ad, katman, pivot, ust: ustP, sinir, ...ek });

// ---------- kafa: genç yetişkin (oval, şakakta geniş, çeneye daralır; Anne'den biraz geniş ve köşeli çene) ----------
const KAFA = Y.kapali([[1150, 124], [1340, 150], [1478, 250], [1546, 410], [1556, 580], [1530, 740], [1476, 880], [1392, 990], [1280, 1062], [1150, 1090], [1020, 1062], [908, 990], [824, 880], [770, 740], [744, 580], [754, 410], [822, 250], [960, 150]].map(([x, y]) => [CX + (x - CX) * 0.93, y]));
// kulak tarafında küçük çikolata leke (karakterin solu: kulağın kökünden kafaya taşar, yarısı kulağın altında)
const LEKE = Y.kapali([[1300, 300], [1330, 274], [1370, 270], [1388, 300], [1374, 340], [1336, 356], [1306, 344]]);
ekle('kafa', [
  sekil(KAFA, R.BEYAZ),
  ...hilal(KAFA, R.BEJ, R.BEYAZ, -44, -24),
  ust(LEKE, CIKOLATA, [KAFA]),
  boya(Z.inceSerit(Y.zincir([[1314, 306], [1330, 288], [1352, 282]]), 10, 4), CIKOLATA_A, [LEKE]),
], [CX, 1090], 'govde', [-20, 20]);

// ---------- kulaklar (koyu çikolata) ----------
const KULAK = { kok: [1390, 206], s: 0.92, aci: 4, renk: CIKOLATA, golge: CIKOLATA_K, parlakRenk: CIKOLATA_A };
const kSag = kulakCiz({ ...KULAK, kok: [2 * CX - KULAK.kok[0], KULAK.kok[1]], yon: -1 }), kSol = kulakCiz({ ...KULAK, yon: 1 });
ekle('kulak-sag', kSag.katman, kSag.pivot, 'kafa', [-25, 25]);
ekle('kulak-sol', kSol.katman, kSol.pivot, 'kafa', [-25, 25]);

// ---------- yüz: sevecen açık gözler (Kino'nun gözü, yetişkin boyunda), uzun burun-ağız bölgesi ----------
const GOZ = [[1036, 540], [1264, 540]], GOZ_S = 0.53;
const yuz = K.yuzSetleri({ goz: GOZ, gozS: GOZ_S, kas: [[1036, 426], [1264, 426]], kasS: 1.0, kasKalin: 12, kasIz: 6, agizN: [1146, 902], agizS: 0.64 });
const YUZ_PIVOT = [CX, 600];
for (const [hal, k] of Object.entries(yuz.goz)) ekle(`gozler-${hal}`, k, YUZ_PIVOT, 'kafa', null, { yuva: 'gozler' });
for (const [hal, k] of Object.entries(yuz.kaslar)) ekle(`kaslar-${hal}`, k, YUZ_PIVOT, 'kafa', null, { yuva: 'kaslar' });
for (const [hal, k] of Object.entries(yuz.agiz)) ekle(`agiz-${hal}`, k, [1146, 914], 'kafa', null, { yuva: 'agiz' });
const BURUN_S = 0.86;
ekle('burun', K.tasi(K.orj(K.G.burun, null, false), K.yerlestir([718, 811], [CX, 800], BURUN_S), { olcek: BURUN_S }), [CX, 800], 'kafa');
ekle('yanaklar', [
  ...K.tasi(K.orj(K.G.yanakSag, null, false), K.yerlestir([463, 781], [962, 730], 0.6)),
  ...K.tasi(K.orj(K.G.yanakSag, null, false), K.yerlestir([463, 781], [1338, 730], 0.6)),
], [CX, 730], 'kafa');
// gözlük: yuvarlak ince çerçeve, köprü. İSTEĞE BAĞLI eşya: varsayılan gizli (sahnede o: 1 ile takılır)
function halka(cx, cy, r, k) {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 1 ${2 * r} 0a${r} ${r} 0 1 1 ${-2 * r} 0Z` + `M${cx - r + k} ${cy}a${r - k} ${r - k} 0 1 0 ${2 * (r - k)} 0a${r - k} ${r - k} 0 1 0 ${-2 * (r - k)} 0Z`;
}
ekle('gozluk', [
  ...GOZ.map(([x, y]) => boya(halka(x, y + 4, 88, 13), R.OL)),
  ...GOZ.map(([x, y]) => boya(Z.inceSerit(Y.zincir([[x - 54, y - 30], [x - 40, y - 54], [x - 16, y - 66]]), 9, 4), R.BEYAZ)),
  ince([[1124, 530], [1150, 516], [1176, 530]], 12, 10),
  ince([[GOZ[0][0] - 88, 534], [GOZ[0][0] - 124, 522], [GOZ[0][0] - 160, 514]], 11, 9),
  ince([[GOZ[1][0] + 88, 534], [GOZ[1][0] + 124, 522], [GOZ[1][0] + 160, 514]], 11, 9),
], [CX, 540], 'kafa', null, { gizli: true });

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

// ---------- pantolon: kalça + bacaklar (kumaş: uyluk dolgun, dizde hafif daralır, paçada kırılıp bollaşır) ----------
ekle('kalca', [tamam(Y.kapali([[900, 2040, 'k'], [1400, 2040, 'k'], [1414, 2240], [1300, 2322], [1150, 2350, 'k'], [1000, 2322], [886, 2240]]), PANTOLON)], [CX, 2210], null, null, { kume: 'bacaklar' });
const aynaUzuv = (n) => n.map(([x, y, a, b]) => [2 * CX - x, y, b, a]);
// ekranın solundaki bacak (karakterin sağı); A = ekranın solu (dış yan). Eklem çevresinde profil sabit (gölge basamaksız)
const BACAK_SAG = {
  kalca: [998, 2240], diz: [978, 2890], bilek: [968, 3520],
  ust: [[998, 2240, 124, 124], [994, 2400, 134, 120], [988, 2610, 116, 108], [981, 2800, 102, 102], [978, 2890, 101, 101]],
  alt: [[978, 2890, 101, 101], [977, 2980, 101, 100], [974, 3150, 96, 94], [970, 3330, 99, 97], [968, 3450, 109, 106], [968, 3550, 114, 114]],
};
const BACAK = {
  sag: BACAK_SAG,
  sol: { kalca: [2 * CX - 998, 2240], diz: [2 * CX - 978, 2890], bilek: [2 * CX - 968, 3520], ust: aynaUzuv(BACAK_SAG.ust), alt: aynaUzuv(BACAK_SAG.alt) },
};
for (const y of ['sag', 'sol']) {
  const b = BACAK[y];
  const ic = y === 'sag' ? -1 : 1, dis = -ic; // profilde iç (ağ) yan ve dış yan
  const pU = profil(b.ust), pA = profil(b.alt);
  ekle(`bacak-ust-${y}`, [
    ...uzuvEl({ nokta: b.ust, renk: PANTOLON, golge: PANTOLON_K, golgeOran: 0.28, isik: PANTOLON_A, isikT: [0.12, 0.85], isikGen: 18 }),
    // cep ağzı (dış yanda, kalçadan aşağı kavis), ağdan uyluğa kırışıklar
    ince([pU.kenar(0.02, dis, 4), pU.kesit(0.1, dis * 0.62), pU.kesit(0.2, dis * 0.82), pU.kenar(0.26, dis, 6)], 7, 3),
    ince([pU.kenar(0.08, ic, 5), pU.kesit(0.13, ic * 0.55), pU.kesit(0.15, ic * 0.25)], 7, 2),
    ince([pU.kenar(0.17, ic, 5), pU.kesit(0.21, ic * 0.5)], 6, 2),
  ], b.kalca, 'kalca', [-35, 35], { kume: 'bacaklar' });
  ekle(`bacak-alt-${y}`, [
    ...uzuvEl({ nokta: b.alt, renk: PANTOLON, golge: PANTOLON_K, golgeOran: 0.28, isik: PANTOLON_A, isikT: [0.08, 0.66], isikGen: 18, vurguT: [0.1, 0.8] }),
    // diz arkası kırışıkları (iç yandan), paçada kırılma (iki yumuşak kat)
    ince([pA.kenar(0.04, ic, 5), pA.kesit(0.08, ic * 0.45), pA.kesit(0.09, ic * 0.1)], 8, 2),
    ince([pA.kenar(0.12, ic, 5), pA.kesit(0.15, ic * 0.5)], 6, 2),
    ince([pA.kenar(0.7, dis, 5), pA.kesit(0.76, dis * 0.35), pA.kesit(0.78, -dis * 0.1)], 8, 2),
    ince([pA.kenar(0.8, ic, 5), pA.kesit(0.84, ic * 0.4), pA.kesit(0.83, -ic * 0.05)], 7, 2),
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

// ---------- kollar: kazak kolu sıvalı (dirsekte kıvrık bant), beyaz önkol (dirsek altında kas dolgunluğu), yetişkin el ----------
const KOL_SAG = { omuz: [808, 1266], dirsek: [676, 1784], bilek: [624, 2214] };
const KOL = { sag: KOL_SAG, sol: { omuz: [2 * CX - 808, 1266], dirsek: [2 * CX - 676, 1784], bilek: [2 * CX - 624, 2214] } };
for (const y of ['sag', 'sol']) {
  const k = KOL[y];
  const ayna = y === 'sol' ? aynaUzuv : (n) => n;
  const ic = y === 'sag' ? -1 : 1;
  const L = Math.hypot(k.dirsek[0] - k.omuz[0], k.dirsek[1] - k.omuz[1]);
  const ux = (k.dirsek[0] - k.omuz[0]) / L, uy = (k.dirsek[1] - k.omuz[1]) / L;
  const b0 = [k.dirsek[0] - ux * 70, k.dirsek[1] - uy * 70], b1 = [k.dirsek[0] + ux * 46, k.dirsek[1] + uy * 46];
  const KIVRIM = bant(b0, b1, 104, 100, 18);
  // kazak kolu (ekranın solundaki kolun koordinatlarıyla; aynalanır): omuzda yuvarlak, pazıda bol, bantta toplanır
  const s = KOL_SAG, sL = Math.hypot(s.dirsek[0] - s.omuz[0], s.dirsek[1] - s.omuz[1]);
  const sux = (s.dirsek[0] - s.omuz[0]) / sL, suy = (s.dirsek[1] - s.omuz[1]) / sL;
  const ara = (t) => [s.omuz[0] + sux * (sL - 70) * t, s.omuz[1] + suy * (sL - 70) * t];
  const kolN = ayna([[...ara(0), 104, 104], [...ara(0.3), 110, 100], [...ara(0.68), 100, 95], [...ara(1), 95, 95]]);
  const kP = profil(kolN);
  ekle(`kol-ust-${y}`, [
    ...uzuvEl({ nokta: kolN, renk: VISNE, golge: VISNE_K, golgeOran: 0.3, isik: VISNE_A, isikT: [0.15, 0.7], isikGen: 22 }),
    // kolun bantta toplandığı yerde iki kat
    ince([kP.kenar(0.78, ic, 5), kP.kesit(0.84, ic * 0.45), kP.kesit(0.86, ic * 0.1)], 7, 2),
    ince([kP.kenar(0.84, -ic, 5), kP.kesit(0.9, -ic * 0.4)], 6, 2),
    ust(KIVRIM.d, VISNE),
    ...hilal(KIVRIM.d, VISNE_K, VISNE, -34, 0),
    ince([KIVRIM.ust[0], [(KIVRIM.ust[1][0] + KIVRIM.alt[1][0]) / 2, (KIVRIM.ust[1][1] + KIVRIM.alt[1][1]) / 2], KIVRIM.ust[2]].map((p, j) => (j === 1 ? p : [p[0] + ux * 52, p[1] + uy * 52])), 7, 4),
  ], k.omuz, 'govde', y === 'sag' ? [-60, 175] : [-175, 60], { kume: `kol-${y}` });
  // ön kol: dirsek altında dış yanda kas dolgunluğu, bileğe incelir
  const onN = ayna([[676, 1784, 76, 76], [672, 1846, 77, 76], [663, 1940, 86, 77], [649, 2060, 73, 65], [632, 2170, 60, 57], [624, 2214, 58, 58]]);
  ekle(`kol-alt-${y}`, uzuvEl({ nokta: onN, renk: R.BEYAZ, golge: R.BEJ, golgeOran: 0.32, vurguT: [0.2, 0.85] }), k.dirsek, `kol-ust-${y}`, [-150, 150], { kume: `kol-${y}` });
  const eksen = Math.atan2(k.bilek[1] - k.dirsek[1], k.bilek[0] - k.dirsek[0]);
  ekle(`el-${y}`, K.elYerlestir(y, [k.bilek[0] + Math.cos(eksen) * 10, k.bilek[1] + Math.sin(eksen) * 10], 1.02, (eksen * 180) / Math.PI, OLGUN_EL), k.bilek, `kol-alt-${y}`, [-45, 45], { kume: `kol-${y}` });
}

// ---------- çizim sırası ----------
const KUMELER = {
  bacaklar: ['bacak-alt-sag', 'bacak-alt-sol', 'bacak-ust-sag', 'bacak-ust-sol', 'kalca'],
  'kol-sag': ['el-sag', 'kol-alt-sag', 'kol-ust-sag'],
  'kol-sol': ['el-sol', 'kol-alt-sol', 'kol-ust-sol'],
};
const SIRA = ['kuyruk', { kume: 'bacaklar' }, 'ayak-sag', 'ayak-sol', 'govde', 'kafa', 'yanaklar', 'burun', 'gozler', 'kaslar', 'agiz', 'gozluk', 'kulak-sag', 'kulak-sol', { kume: 'kol-sag' }, { kume: 'kol-sol' }];
const YUVA = { gozler: 'gozler-acik', kaslar: 'kaslar-notr', agiz: 'agiz-gulumse' };

uret({
  ad: 'baba', W, H, zemin: ZEMIN, parcalar, sira: SIRA, kumeler: KUMELER, yuvaVarsayilan: YUVA,
  cikti: path.join(KOK, 'assets/karakter/baba'),
  onizleme: process.argv[2] || path.join(__dirname, 'onizleme'),
  aciklama: 'Baba (Murat) kesme kukla kiti (ön görünüş), Kino C kitinden türetildi. Koordinatlar 2300x3820 karesinde, Kino ile aynı birim; açı derece, + saat yönü. sag = karakterin sağı = ekranın solu. gozluk isteğe bağlı eşya: varsayılan gizli (o: 1 ile takılır).',
  kur: 'ekip/karakter/baba/kit-kur.cjs',
  yuzKutu: [540, 50, 1220, 1100],
  yuzParcalar: (s) => ['kafa', 'yanaklar', 'burun', s.gozler, s.kaslar, s.agiz, 'kulak-sag', 'kulak-sol'],
}).catch((e) => { console.error(e); process.exit(1); });
