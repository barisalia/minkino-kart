#!/usr/bin/env node
/**
 * Dede (Hasan) kesme kukla kiti: Kino C'nin kitinden türer (aynı çizgi, renk, göz / burun / ağız / el / kulak /
 * kuyruk); yöntem Anne ve Baba kitleriyle aynı (ekip/karakter/{anne,baba}/kit-kur.cjs).
 * İnce, hafif kambur: boy Kino'nun 1.63 katı, ~3.5 kafa. Kamburluk önden: omuzlar yüksek ve yuvarlak (baş omuzların
 * arasına gömülü, kulak uçları omuza değer), yüz hafif öne eğik (gözler aşağıda, kasketin tepesi çok görünür), dizler
 * hafif kırık ve dışa, eller öne ve içe sarkar. Gri-kahve kulaklar, gür beyaz kaşlar (bulut kaş, 4 hal), beyaz bıyık
 * (Baba'nınkinin yaşlısı; aileden ayıran işaret), sevecen yaşlı gözler (dış köşede kırışık, gözaltında yumuşak kıvrım).
 * Kıyafet: gri kasket (ayrı parça: klipte düzeltilir), zeytin yeşili yelek (cep saati zinciri), krem gömlek (kolları
 * uzun, manşetli), kahve pantolon (ütü çizgisi, paça kıvrık), koyu kahve bağcıklı ayakkabı.
 *
 * Kullanım: node ekip/karakter/dede/kit-kur.cjs   (çıktı assets/karakter/dede/, önizleme ekip/karakter/dede/onizleme)
 * Boy tablosu: assets/karakter/aile-boy.json. Ortak: ekip/karakter/aile-ortak/.
 */
const path = require('path');
const K = require('../aile-ortak/kino-kaynak.cjs');
const Y = require('../aile-ortak/yol.cjs');
const { ust, boya, ince, hilal, kulakCiz, profil, uzuvEl } = require('../aile-ortak/parcalar.cjs');
const { uret } = require('../aile-ortak/kit.cjs');

const { R, Z, tamam, sekil } = K;
const KOK = path.resolve(__dirname, '..', '..', '..');
const W = 2100, H = 3640, CX = 1050, ZEMIN = 3520;
/** yaşlı erkek eli: Kino'nun eli, parmaklar uzun, el ince */
const OLGUN_EL = { parmak: 0.36, en: 0.85, avucEn: 0.92, u0: 64, gecis: 46 };

// ---------- renkler ----------
const GRIKAHVE = 'rgb(150,126,110)', GRIKAHVE_K = 'rgb(104,84,74)', GRIKAHVE_A = 'rgb(190,172,158)';
const KASKET = 'rgb(146,146,154)', KASKET_K = 'rgb(104,104,114)', KASKET_A = 'rgb(186,186,194)';
const ZEYTIN = 'rgb(120,128,58)', ZEYTIN_K = 'rgb(84,92,36)', ZEYTIN_A = 'rgb(160,168,94)';
const KREM = 'rgb(247,234,204)', KREM_K = 'rgb(222,200,160)', KREM_A = 'rgb(255,248,230)';
const PANTOLON = 'rgb(136,92,62)', PANTOLON_K = 'rgb(96,62,40)', PANTOLON_A = 'rgb(174,128,94)';
const AYAKKABI = 'rgb(86,56,42)', AYAKKABI_K = 'rgb(58,36,28)', AYAKKABI_A = 'rgb(138,98,78)';
const ALTIN = 'rgb(226,174,66)';
const KAS_GRI = 'rgb(222,220,230)';

const parcalar = [];
const ekle = (ad, katman, pivot, ustP, sinir = null, ek = {}) => parcalar.push({ ad, katman, pivot, ust: ustP, sinir, ...ek });
const ayna = (n) => n.map(([x, y, k]) => [2 * CX - x, y, k]);
const simetrik = (yari) => {
  const sag = yari.map(([dx, y, k]) => [CX + dx, y, k]);
  const sol = ayna(sag).reverse();
  return Y.kapali([...sag, ...sol.filter((p) => Math.abs(p[0] - CX) > 0.5)]);
};

// ---------- kafa: ince uzun oval, çenede hafif sarkık yanak ----------
const KAFA = simetrik([[0, 290], [160, 304], [272, 362], [342, 456], [374, 578], [382, 706], [374, 834], [350, 948], [296, 1048], [204, 1116], [80, 1146]]);
ekle('kafa', [
  sekil(KAFA, R.BEYAZ),
  ...hilal(KAFA, R.BEJ, R.BEYAZ, -42, -24),


], [CX, 1140], 'govde', [-20, 20]);

// ---------- kulaklar (gri-kahve; uzun, yaşla sarkmış: uçları omuza değer) ----------
const KULAK = { kok: [CX + 246, 380], s: 0.84, aci: 3, boy: 1.06, renk: GRIKAHVE, golge: GRIKAHVE_K, parlakRenk: GRIKAHVE_A };
const kSag = kulakCiz({ ...KULAK, kok: [2 * CX - KULAK.kok[0], KULAK.kok[1]], yon: -1 }), kSol = kulakCiz({ ...KULAK, yon: 1 });
ekle('kulak-sag', kSag.katman, kSag.pivot, 'kafa', [-25, 25]);
ekle('kulak-sol', kSol.katman, kSol.pivot, 'kafa', [-25, 25]);

// ---------- yüz: sevecen yaşlı gözler (kafa hafif öne eğik: yüz aşağıda), gür beyaz kaşlar, beyaz bıyık ----------
const GOZ = [[CX - 120, 708], [CX + 120, 708]], GOZ_S = 0.52;
const RX = 84 * GOZ_S, RY = 117.5 * GOZ_S;
const bejInce = (n, kalin, uc) => ({ ...ince(n, kalin, uc), f: R.BEJ });
const kirisik = (hal, i, h) => {
  const sx = i === 0 ? -1 : 1;
  const k = [];
  const acik = ['acik', 'sola', 'saga', 'saskin', 'yari'].includes(hal);
  const kose = [h[0] + sx * RX * 1.42, h[1] + RY * (acik ? 0.12 : 0.24)];
  // [dikey kayma, açı, boy]: çizgiler ayrı noktalardan başlar, dışa hafif yelpaze (ok ucu gibi birleşmez)
  const cizgiler = acik ? [[-11, -16, 24], [11, 14, 22]] : [[-16, -20, 26], [0, 0, 28], [16, 18, 24]];
  for (const [dy, aci, L] of cizgiler) {
    const r = (aci * Math.PI) / 180, u = [sx * Math.cos(r), Math.sin(r)], p = [kose[0], kose[1] + dy];
    k.push(ince([p, [p[0] + u[0] * L * 0.5, p[1] + u[1] * L * 0.5 - 1.5], [p[0] + u[0] * L, p[1] + u[1] * L - 2]], 7, 2.5));
  }
  const altY = h[1] + RY * (acik ? 1.2 : 0.98);
  k.push(bejInce([[-0.1, 6], [0.45, 5], [0.95, -10]].map(([a, dy]) => [h[0] + sx * a * RX, altY + dy]), 9, 3));
  return k;
};
// yüz setleri: göz ve ağız Kino'nun (kaşlar aşağıda: Dede'nin kendi bulut kaşı)
const yuz = K.yuzSetleri({ goz: GOZ, gozS: GOZ_S, kas: [[CX - 120, 600], [CX + 120, 600]], kasS: 0.8, agizN: [CX - 4, 1032], agizS: 0.6, gozEk: kirisik });
// gülümseme: Kino'nun W gülüşünün üstü bıyığın altında kalıp dudak gibi görünüyor; Dede'de bıyığın altında yalnız küçük
// bir alt kavis (sıcak, sakin gülüş)
yuz.agiz.gulumse = [ince([[CX - 58, 1034], [CX - 24, 1058], [CX + 24, 1058], [CX + 58, 1034]], 12, 5)];
const YUZ_PIVOT = [CX, 760];
for (const [hal, k] of Object.entries(yuz.goz)) ekle(`gozler-${hal}`, k, YUZ_PIVOT, 'kafa', null, { yuva: 'gozler' });

// gür beyaz kaş: üst kenarı tüylü (üç kabarık), dış ucu aşağı sarkar; ekranın solundaki kaş (iç uç +x)
const KAS_N = [[-98, 30], [-90, 6], [-70, -16], [-44, -30], [-20, -40], [0, -34], [18, -40], [40, -32], [62, -24], [82, -8], [94, 14], [82, 26], [52, 22], [22, 18], [-8, 18], [-40, 22], [-68, 30], [-86, 38]];
const KAS_IC = [[-62, 8], [-24, -6], [18, -6], [58, 4]];
function kasCiz(merkez, sx, aci, dy, olcek = 1.2) {
  const r = (aci * Math.PI) / 180;
  const tr = ([x, y]) => {
    const X = x * olcek, Yy = y * olcek;
    return [merkez[0] + sx * (X * Math.cos(r) - Yy * Math.sin(r)), merkez[1] + dy + X * Math.sin(r) + Yy * Math.cos(r)];
  };
  const d = Y.kapali(KAS_N.map(tr));
  return [
    ust(d, R.BEYAZ),
    boya(Y.kapali([[-104, 22], [-70, 30], [-30, 20], [-20, 70], [-104, 70]].map(tr)), KAS_GRI, [d]),
    ince(KAS_IC.map(tr), 6, 2, [d]),

  ];
}
let kasSay = 0;
for (const [hal, [a1, y1, a2, y2]] of Object.entries(K.KAS_HALLERI)) {
  // Kino'nun kaş halleri: a1 / y1 ekranın solundaki kaş, a2 / y2 sağdaki (sağ aynalı)
  const ol = hal === 'kalkik' ? 1.25 : 1.2;
  const k = [...kasCiz([CX - 122, 590], 1, a1, y1, ol), ...kasCiz([CX + 122, 590], -1, -a2, y2, ol)];
  ekle(`kaslar-${hal}`, k.map((e) => ({ ...e, k: e.k ? [...e.k, `M-7${kasSay}0 -7100h1v1h-1Z`] : e.k })), YUZ_PIVOT, 'kafa', null, { yuva: 'kaslar' });
  kasSay++;
}
for (const [hal, k] of Object.entries(yuz.agiz)) ekle(`agiz-${hal}`, k, [CX - 4, 1044], 'kafa', null, { yuva: 'agiz' });

// beyaz bıyık: burnun altında iki kabarık yarım, uçları hafif sarkık; altında açık gri gölge
const BIYIK = Y.kapali([[CX + 0, 950], [CX + 34, 938], [CX + 80, 938], [CX + 124, 948], [CX + 160, 956], [CX + 184, 952], [CX + 180, 972], [CX + 160, 988], [CX + 138, 996], [CX + 118, 1004], [CX + 98, 998], [CX + 78, 1006], [CX + 56, 998], [CX + 34, 1004], [CX + 14, 996], [CX, 1002], [CX - 14, 996], [CX - 34, 1004], [CX - 56, 998], [CX - 78, 1006], [CX - 98, 998], [CX - 118, 1004], [CX - 138, 996], [CX - 160, 988], [CX - 180, 972], [CX - 184, 952], [CX - 160, 956], [CX - 124, 948], [CX - 80, 938], [CX - 34, 938]]);
ekle('biyik', [
  ust(BIYIK, R.BEYAZ),
  boya(Y.kapali([[CX - 200, 990], [CX - 100, 990], [CX, 994], [CX + 100, 990], [CX + 200, 990], [CX + 200, 1050], [CX - 200, 1050]]), KAS_GRI, [BIYIK]),
  ince([[CX - 20, 962], [CX - 70, 958], [CX - 124, 964]], 6, 2, [BIYIK]),
  ince([[CX + 20, 962], [CX + 70, 958], [CX + 124, 964]], 6, 2, [BIYIK]),
], [CX, 980], 'kafa');
const BURUN_S = 0.78;
ekle('burun', K.tasi(K.orj(K.G.burun, null, false), K.yerlestir([718, 811], [CX, 908], BURUN_S), { olcek: BURUN_S }), [CX, 908], 'kafa');
ekle('yanaklar', [
  ...K.tasi(K.orj(K.G.yanakSag, null, false), K.yerlestir([463, 781], [CX - 196, 876], 0.56)),
  ...K.tasi(K.orj(K.G.yanakSag, null, false), K.yerlestir([463, 781], [CX + 196, 876], 0.56)),
], [CX, 876], 'kafa');

// ---------- kasket (ayrı parça: klipte düzeltilir): yumuşak tepe, önde siper, ön dikiş ve üstte düğme ----------
const TEPE = Y.kapali([[CX - 388, 440, 'k'], [CX - 410, 360], [CX - 352, 268], [CX - 214, 214], [CX, 206], [CX + 214, 214], [CX + 352, 268], [CX + 410, 360], [CX + 388, 440, 'k'], [CX + 200, 462], [CX, 468], [CX - 200, 462]]);
const SIPER = Y.kapali([[CX - 300, 440, 'k'], [CX - 150, 452], [CX, 456], [CX + 150, 452], [CX + 300, 440, 'k'], [CX + 270, 486], [CX + 150, 516], [CX, 526], [CX - 150, 516], [CX - 270, 486]]);
ekle('kasket', [
  ust(TEPE, KASKET),
  ...hilal(TEPE, KASKET_K, KASKET, -40, -26).map((e) => ({ ...e, k: [...e.k, 'M-7500 -7000h1v1h-1Z'] })),
  boya(Z.inceSerit(Y.zincir([[CX - 330, 330], [CX - 250, 262], [CX - 140, 230]]), 22, 8), KASKET_A, [TEPE]),
  // ön panelin dikişi: tepeden siperliğe kavisli iki dikiş
  ince([[CX - 40, 214], [CX - 70, 320], [CX - 120, 452]], 7, 3, [TEPE]),
  ince([[CX + 60, 214], [CX + 96, 320], [CX + 140, 452]], 7, 3, [TEPE]),
  ust(Z.daire(CX + 8, 226, 22), KASKET_K),
  ust(SIPER, KASKET),
  boya(Y.kapali([[CX + 150, 440], [CX + 320, 440], [CX + 280, 500], [CX + 150, 530]]), KASKET_K, [SIPER]),
  ince([[CX - 250, 470], [CX, 498], [CX + 250, 470]], 6, 3, [SIPER]),
], [CX, 440], 'kafa', [-20, 20]);

// ---------- gövde: kambur (omuzlar yüksek ve yuvarlak), krem gömlek, zeytin yelek (V yaka, dört düğme, cep saati) ----------
const GOMLEK = simetrik([[70, 1060], [170, 1040], [252, 1058], [312, 1120], [344, 1220], [348, 1330], [330, 1500], [314, 1700], [306, 1900], [302, 2080, 'k'], [120, 2090, 'k']]);
// gömlek yakası: çenenin altında iki sivri uç
const YAKA_N = [[CX - 4, 1150, 'k'], [CX - 84, 1104, 'k'], [CX - 130, 1130], [CX - 118, 1240, 'k'], [CX - 40, 1214]];
const YELEK_N = [[70, 1150, 'k'], [176, 1150], [248, 1210], [262, 1320], [300, 1420], [316, 1600], [310, 1800], [300, 1980], [282, 2070], [180, 2110], [40, 2170, 'k'], [0, 2128, 'k']];
const YELEK = simetrik(YELEK_N);
const V = Y.kapali([[CX - 72, 1146, 'k'], [CX + 72, 1146, 'k'], [CX, 1590, 'k']], 0.6);
const gGovde = [
  sekil(GOMLEK, KREM),
  boya(Y.kapali([[CX + 250, 1100], [CX + 380, 1100], [CX + 380, 2100], [CX + 250, 2100]]), KREM_K, [GOMLEK]),
  // kamburun yuvarlağı: omuz başlarında açık ışık
  boya(Z.inceSerit(Y.zincir([[CX - 290, 1146], [CX - 220, 1110], [CX - 140, 1096]]), 20, 8), KREM_A, [GOMLEK]),
  ust(YELEK, ZEYTIN),
  boya(Y.kapali([[CX + 210, 1150], [CX + 340, 1150], [CX + 340, 2200], [CX + 160, 2200], [CX + 220, 1900], [CX + 230, 1500]]), ZEYTIN_K, [YELEK]),
  boya(Z.inceSerit(Y.zincir([[CX - 250, 1420], [CX - 278, 1600], [CX - 280, 1800]]), 22, 8), ZEYTIN_A, [YELEK]),
  ust(V, KREM, [YELEK]),
  boya(Y.kapali([[CX + 20, 1146], [CX + 80, 1146], [CX, 1590]]), KREM_K, [V]),
  // gömlek patı ve düğmeleri (V içinde)
  ince([[CX, 1240], [CX, 1580]], 6, 4, [V]),
  ...[1300, 1440].map((y) => boya(Z.daire(CX + 14, y, 9), KREM_K, [V])),
  // yelek önü: ortada birleşme çizgisi, dört düğme
  ince([[CX, 1586], [CX, 1900], [CX, 2124]], 8, 5),
  ...[1660, 1780, 1900, 2020].map((y) => ust(Z.daire(CX - 26, y, 18), ZEYTIN_K)),
  ...[1660, 1780, 1900, 2020].map((y) => boya(Z.daire(CX - 31, y - 6, 6), ZEYTIN_A)),
  // cepler (fileto): iki yanda eğik ağız
  ...[-1, 1].map((s) => ust(Y.kapali([[CX + s * 110, 1858, 'k'], [CX + s * 246, 1840, 'k'], [CX + s * 248, 1868, 'k'], [CX + s * 112, 1886, 'k']]), ZEYTIN)),
  ust(Y.kapali([[CX - 230, 1430, 'k'], [CX - 120, 1416, 'k'], [CX - 118, 1440, 'k'], [CX - 228, 1454, 'k']]), ZEYTIN),
  // cep saati zinciri: düğmeden sağ cebe
  boya(Z.inceSerit(Y.zincir([[CX - 14, 1780], [CX + 60, 1836], [CX + 140, 1854], [CX + 200, 1846]]), 9, 7), ALTIN),
  // yelek kırışıkları (göbekte, koltuk altında)
  ince([[CX - 250, 1560], [CX - 200, 1590], [CX - 150, 1596]], 6, 2),
  ince([[CX + 150, 1600], [CX + 200, 1594], [CX + 246, 1566]], 6, 2),
  ince([[CX - 200, 1990], [CX - 140, 2010], [CX - 80, 2010]], 6, 2),
  // gömlek yakası (çenenin altında)
  ust(Y.kapali(YAKA_N), KREM_A),
  ust(Y.kapali(ayna(YAKA_N)), KREM_A),
  boya(Y.kapali(ayna([[CX - 4, 1150], [CX - 60, 1110], [CX - 130, 1180], [CX - 118, 1250]])), KREM, [Y.kapali(ayna(YAKA_N))]),
];
ekle('govde', gGovde, [CX, 2060], 'kalca', [-12, 12]);

// ---------- pantolon: kalça + bacaklar (bol, dizde hafif kırık ve dışa: yaşlı duruş; ütü çizgisi, kıvrık paça) ----------
ekle('kalca', [tamam(Y.kapali([[CX - 290, 2010, 'k'], [CX + 290, 2010, 'k'], [CX + 300, 2200], [CX + 200, 2280], [CX, 2300, 'k'], [CX - 200, 2280], [CX - 300, 2200]]), PANTOLON)], [CX, 2160], null, null, { kume: 'bacaklar' });
const aynaUzuv = (n) => n.map(([x, y, a, b]) => [2 * CX - x, y, b, a]);
const aynaN = ([x, y]) => [2 * CX - x, y];
// ekranın solundaki bacak (karakterin sağı); dizler hafif dışa (yay bacak), bilek içe
const BACAK_SAG = {
  kalca: [CX - 150, 2200], diz: [CX - 190, 2810], bilek: [CX - 148, 3400],
  ust: [[CX - 150, 2200, 120, 120], [CX - 162, 2380, 122, 112], [CX - 178, 2600, 108, 102], [CX - 188, 2760, 102, 100], [CX - 190, 2810, 101, 101]],
  alt: [[CX - 190, 2810, 101, 101], [CX - 189, 2880, 103, 98], [CX - 178, 3040, 96, 92], [CX - 162, 3210, 98, 96], [CX - 152, 3320, 104, 104], [CX - 148, 3400, 106, 106]],
};
const BACAK = {
  sag: BACAK_SAG,
  sol: { kalca: aynaN(BACAK_SAG.kalca), diz: aynaN(BACAK_SAG.diz), bilek: aynaN(BACAK_SAG.bilek), ust: aynaUzuv(BACAK_SAG.ust), alt: aynaUzuv(BACAK_SAG.alt) },
};
for (const y of ['sag', 'sol']) {
  const b = BACAK[y];
  const ic = y === 'sag' ? -1 : 1, dis = -ic;
  const pU = profil(b.ust), pA = profil(b.alt);
  ekle(`bacak-ust-${y}`, [
    ...uzuvEl({ nokta: b.ust, renk: PANTOLON, golge: PANTOLON_K, golgeOran: 0.28, isik: PANTOLON_A, isikT: [0.12, 0.85], isikGen: 16 }),
    // ütü çizgisi (orta), ağdan uyluğa kırışık
    ince([pU.kesit(0.2, 0.05), pU.kesit(0.55, 0.06), pU.kesit(0.95, 0.04)], 5, 2),
    ince([pU.kenar(0.08, ic, 5), pU.kesit(0.13, ic * 0.55), pU.kesit(0.15, ic * 0.25)], 7, 2),
    ince([pU.kenar(0.2, ic, 5), pU.kesit(0.24, ic * 0.5)], 6, 2),
  ], b.kalca, 'kalca', [-35, 35], { kume: 'bacaklar' });
  // kıvrık paça bandı
  const s0 = pA.at(0.86), s1 = pA.at(1);
  const PACA = Y.kapali([[s0.p[0] - 112, s0.p[1] - 6, 'k'], [s0.p[0], s0.p[1] + 8], [s0.p[0] + 112, s0.p[1] - 6, 'k'], [s1.p[0] + 112, s1.p[1] + 14, 'k'], [s1.p[0], s1.p[1] + 28], [s1.p[0] - 112, s1.p[1] + 14, 'k']]);
  ekle(`bacak-alt-${y}`, [
    ...uzuvEl({ nokta: b.alt, renk: PANTOLON, golge: PANTOLON_K, golgeOran: 0.28, isik: PANTOLON_A, isikT: [0.08, 0.66], isikGen: 16, vurguT: [0.1, 0.8] }),
    ince([pA.kesit(0.05, 0.04), pA.kesit(0.4, 0.06), pA.kesit(0.8, 0.04)], 5, 2),
    // diz arkası ve paça üstünde kırışıklar
    ince([pA.kenar(0.04, ic, 5), pA.kesit(0.08, ic * 0.45), pA.kesit(0.09, ic * 0.1)], 8, 2),
    ince([pA.kenar(0.13, dis, 5), pA.kesit(0.16, dis * 0.5)], 6, 2),
    ince([pA.kenar(0.7, dis, 5), pA.kesit(0.75, dis * 0.35), pA.kesit(0.77, -dis * 0.1)], 7, 2),
    ust(PACA, PANTOLON),
    ...hilal(PACA, PANTOLON_K, PANTOLON, (y === 'sag' ? 1 : -1) * -30, 0).map((e) => ({ ...e, k: [...e.k, `M-7${y === 'sag' ? 6 : 7}00 -7000h1v1h-1Z`] })),
  ], b.diz, `bacak-ust-${y}`, [-10, 70], { kume: 'bacaklar' });
  // bağcıklı ayakkabı (koyu kahve, parlak burun)
  const sx = y === 'sag' ? -1 : 1, x = b.bilek[0];
  const nok = (n) => n.map(([a, c, k]) => [x + sx * a, c, k]);
  const AYK = Y.kapali(nok([[-104, 3434], [-40, 3404], [60, 3398], [150, 3412], [218, 3452], [226, 3490], [170, 3510], [20, 3512], [-96, 3506], [-118, 3474]]));
  const DIL = Y.kapali(nok([[-40, 3396, 'k'], [56, 3396, 'k'], [62, 3444], [10, 3452], [-46, 3442]]));
  const TABAN = Y.kapali(nok([[-120, 3480, 'k'], [50, 3496], [230, 3478, 'k'], [222, 3508], [130, 3524], [-40, 3524], [-114, 3514]]));
  ekle(`ayak-${y}`, [
    ust(AYK, AYAKKABI),
    ...hilal(AYK, AYAKKABI_K, AYAKKABI, -sx * 38, -12),
    boya(Z.inceSerit(Y.zincir(nok([[90, 3424], [150, 3436], [194, 3458]])), 18, 8), AYAKKABI_A, [AYK]),
    ust(DIL, AYAKKABI),
    ince(nok([[-30, 3414], [40, 3430]]), 6, 5),
    ince(nok([[-30, 3432], [44, 3414]]), 6, 5),
    ust(TABAN, AYAKKABI_K),
  ], b.bilek, `bacak-alt-${y}`, [-30, 30]);
}

// ---------- kuyruk (Kino'nun kuyruğu, gri-kahve) ----------
ekle('kuyruk', K.tasi(K.kuyruk(), K.yerlestir(K.KUYRUK_KOK, [CX + 290, 2120], 1.06, 30), { renk: { [R.KAHVE]: GRIKAHVE, [R.KOYU]: GRIKAHVE_K } }), [CX + 290, 2120], 'kalca', [-35, 35]);

// ---------- kollar: krem gömlek kolu (omuz yüksek, dirsekte kırışık), manşet, eller öne-içe sarkar ----------
const KOL_SAG = { omuz: [CX - 300, 1214], dirsek: [CX - 338, 1650], bilek: [CX - 266, 2016] };
const KOL = { sag: KOL_SAG, sol: { omuz: aynaN(KOL_SAG.omuz), dirsek: aynaN(KOL_SAG.dirsek), bilek: aynaN(KOL_SAG.bilek) } };
for (const y of ['sag', 'sol']) {
  const k = KOL[y];
  const aynaK = y === 'sol' ? aynaUzuv : (n) => n;
  const ic = y === 'sag' ? -1 : 1;
  const eksen = Math.atan2(k.bilek[1] - k.dirsek[1], k.bilek[0] - k.dirsek[0]);
  const ux = Math.cos(eksen), uy = Math.sin(eksen);
  const m0 = [k.bilek[0] - ux * 64, k.bilek[1] - uy * 64], m1 = [k.bilek[0] + ux * 4, k.bilek[1] + uy * 4];
  const s = KOL_SAG;
  const ara = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const ust_ = aynaK([[...s.omuz, 84, 84], [...ara(s.omuz, s.dirsek, 0.28), 86, 80], [...ara(s.omuz, s.dirsek, 0.66), 78, 74], [...ara(s.omuz, s.dirsek, 0.88), 72, 72], [...s.dirsek, 71, 71]]);
  const ustP = profil(ust_);
  ekle(`kol-ust-${y}`, [
    ...uzuvEl({ nokta: ust_, renk: KREM, golge: KREM_K, golgeOran: 0.3, isik: KREM_A, isikT: [0.1, 0.7], isikGen: 18 }),
    ince([ustP.kenar(0.8, ic, 5), ustP.kesit(0.85, ic * 0.45), ustP.kesit(0.84, ic * 0.1)], 7, 2),
    ince([ustP.kenar(0.66, ic, 5), ustP.kesit(0.7, ic * 0.4)], 6, 2),
    // omuz dikişi
    ince([ustP.kesit(0.06, -1), ustP.kesit(0.1, 0), ustP.kesit(0.06, 1)], 6, 3),
  ], k.omuz, 'govde', y === 'sag' ? [-60, 175] : [-175, 60], { kume: `kol-${y}` });
  const sm0 = y === 'sag' ? m0 : aynaN(m0);
  const alt_ = aynaK([[...s.dirsek, 71, 71], [...ara(s.dirsek, sm0, 0.2), 72, 70], [...ara(s.dirsek, sm0, 0.6), 72, 68], [sm0[0], sm0[1], 66, 66]]);
  const altP = profil(alt_);
  const px = -uy, py = ux;
  const MANSET = Y.kapali([[m0[0] + px * 68, m0[1] + py * 68], [m1[0] + px * 68 + ux * 4, m1[1] + py * 68 + uy * 4, 'k'], [m1[0] + ux * 10, m1[1] + uy * 10], [m1[0] - px * 68 + ux * 4, m1[1] - py * 68 + uy * 4, 'k'], [m0[0] - px * 68, m0[1] - py * 68]]);
  ekle(`kol-alt-${y}`, [
    ...uzuvEl({ nokta: alt_, renk: KREM, golge: KREM_K, golgeOran: 0.3, vurguT: [0.15, 0.8] }),
    ince([altP.kenar(0.06, ic, 5), altP.kesit(0.12, ic * 0.5), altP.kesit(0.14, ic * 0.12)], 8, 2),
    ince([altP.kenar(0.24, ic, 5), altP.kesit(0.28, ic * 0.55)], 7, 2),
    ince([altP.kenar(0.76, -ic, 5), altP.kesit(0.81, -ic * 0.45), altP.kesit(0.8, -ic * 0.1)], 7, 2),
    ust(MANSET, KREM),
    ...hilal(MANSET, KREM_K, KREM, -24, 0).map((e) => ({ ...e, k: [...e.k, `M-7${y === 'sag' ? 8 : 9}00 -7000h1v1h-1Z`] })),
    ust(Z.daire(m0[0] + ux * 34 - px * 30 * ic, m0[1] + uy * 34 - py * 30 * ic, 11), KREM_K),
  ], k.dirsek, `kol-ust-${y}`, [-150, 150], { kume: `kol-${y}` });
  ekle(`el-${y}`, K.elYerlestir(y, [k.bilek[0] + ux * 44, k.bilek[1] + uy * 44], 0.9, (eksen * 180) / Math.PI, OLGUN_EL), k.bilek, `kol-alt-${y}`, [-45, 45], { kume: `kol-${y}` });
}

// ---------- çizim sırası ----------
const KUMELER = {
  bacaklar: ['bacak-alt-sag', 'bacak-alt-sol', 'bacak-ust-sag', 'bacak-ust-sol', 'kalca'],
  'kol-sag': ['el-sag', 'kol-alt-sag', 'kol-ust-sag'],
  'kol-sol': ['el-sol', 'kol-alt-sol', 'kol-ust-sol'],
};
const SIRA = ['kuyruk', { kume: 'bacaklar' }, 'ayak-sag', 'ayak-sol', 'govde', 'kafa', 'yanaklar', 'gozler', 'kaslar', 'agiz', 'biyik', 'burun', 'kulak-sag', 'kulak-sol', 'kasket', { kume: 'kol-sag' }, { kume: 'kol-sol' }];
const YUVA = { gozler: 'gozler-acik', kaslar: 'kaslar-notr', agiz: 'agiz-gulumse' };

uret({
  ad: 'dede', W, H, zemin: ZEMIN, parcalar, sira: SIRA, kumeler: KUMELER, yuvaVarsayilan: YUVA,
  cikti: path.join(KOK, 'assets/karakter/dede'),
  onizleme: process.argv[2] || path.join(__dirname, 'onizleme'),
  aciklama: 'Dede (Hasan) kesme kukla kiti (ön görünüş), Kino C kitinden türetildi. Koordinatlar 2100x3640 karesinde, Kino ile aynı birim; açı derece, + saat yönü. sag = karakterin sağı = ekranın solu. kasket ve biyik kafanın çocuğu (kasket klipte düzeltilir: a / y).',
  kur: 'ekip/karakter/dede/kit-kur.cjs',
  yuzKutu: [500, 160, 1100, 1040],
  yuzParcalar: (s) => ['kafa', 'yanaklar', s.gozler, s.kaslar, s.agiz, 'biyik', 'burun', 'kulak-sag', 'kulak-sol', 'kasket'],
}).catch((e) => { console.error(e); process.exit(1); });
