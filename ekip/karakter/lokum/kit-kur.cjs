#!/usr/bin/env node
/**
 * Lokum (2 yaş) kesme kukla kiti: kafası doğrudan Kino C'nin kafası (göz lekesi yok, bir kulağı beyaz), küçültülmüş;
 * gözler kafaya göre Kino'nunkinden de büyük, gövde yuvarlak ve kısa (v2 Lokum'un oranı: ~2 kafa). Lokum pembesi
 * kısa kollu tulum, iki beyaz çıtçıt; yalınayak (pati); ağızda iki minik diş.
 *
 * Kullanım: node ekip/karakter/lokum/kit-kur.cjs   (çıktı assets/karakter/lokum/, önizleme ekip/karakter/lokum/onizleme)
 */
const path = require('path');
const K = require('../aile-ortak/kino-kaynak.cjs');
const Y = require('../aile-ortak/yol.cjs');
const { ust, boya, ince, hilal, uzuvKatman } = require('../aile-ortak/parcalar.cjs');
const { uret } = require('../aile-ortak/kit.cjs');

const { R, Z, tamam, orj } = K;
const KOK = path.resolve(__dirname, '..', '..', '..');
const W = 1300, H = 1720, CX = 650, ZEMIN = 1600;

const PEMBE = 'rgb(246,168,190)', PEMBE_K = 'rgb(218,118,150)', PEMBE_A = 'rgb(252,212,224)';

const parcalar = [];
const ekle = (ad, katman, pivot, ustP, sinir = null, ek = {}) => parcalar.push({ ad, katman, pivot, ust: ustP, sinir, ...ek });

// Kino karesinden Lokum karesine: kafa tepesi (790, 244) → (650, 168), ölçek 0.78
const S = 0.78;
const T = K.yerlestir([790, 244], [CX, 168], S);
const nT = (p) => [CX + (p[0] - 790) * S, 168 + (p[1] - 244) * S];

// ---------- kafa (Kino kitindeki kafa: görünen kafa + kulak altı tamamlama; göz lekesi yok) ----------
const KAFA_TAMAM = 'M820 1050L1120 1000C1200 940 1250 840 1258 720C1265 600 1240 480 1180 390C1120 310 1010 288 900 292C780 296 660 318 578 374C490 432 446 530 428 640C418 720 420 780 432 820L600 1000Z';
ekle('kafa', K.tasi([tamam(KAFA_TAMAM, R.BEYAZ), ...orj(K.G.kafa)], T), nT([812, 1118]), 'govde', [-20, 20]);

// ---------- kulaklar: ekranın solundaki beyaz, sağdaki kestane (Kino'nun kulakları) ----------
const PERCEM_KENAR = Z.cokgen([[988, 270], [1069, 300], [1136, 358], [1172, 444], [1177, 524], [1148, 524], [1140, 454], [1110, 384], [1050, 334], [988, 298]]);
ekle('kulak-sag', K.tasi(orj(K.G.kulakSag), T, { renk: { [R.KAHVE]: R.BEYAZ, [R.KOYU]: R.BEJ } }).filter((e, i) => i !== 2), nT([566, 352]), 'kafa', [-25, 25]);
ekle('kulak-sol', K.tasi(orj(K.G.kulakSol).map((e) => ({ ...e, kc: ['!' + PERCEM_KENAR] })), T), nT([1186, 410]), 'kafa', [-25, 25]);

// ---------- yüz (Kino'nun yerleri; gözler biraz daha büyük) ----------
const GOZ = [nT([617, 662]), nT([968, 668])];
const disler = (hal) => {
  if (hal !== 'gulumse') return [];
  const n = nT([712, 926]);
  return [-1, 1].map((sx) => {
    const x = n[0] + sx * 13;
    const d = Y.kapali([[x - 11, n[1] + 2, 'k'], [x + 11, n[1] + 2, 'k'], [x + 11, n[1] + 22], [x, n[1] + 27], [x - 11, n[1] + 22]], 0.6);
    return ust(d, R.BEYAZ);
  });
};
const yuz = K.yuzSetleri({ goz: GOZ, gozS: S * 1.1, kas: [nT([620.5, 405]), nT([977.5, 432])], kasS: S, agizN: nT([712, 926]), agizS: S * 0.92, agizEk: disler });
const YUZ_PIVOT = nT([790, 660]);
for (const [hal, k] of Object.entries(yuz.goz)) ekle(`gozler-${hal}`, k, YUZ_PIVOT, 'kafa', null, { yuva: 'gozler' });
for (const [hal, k] of Object.entries(yuz.kaslar)) ekle(`kaslar-${hal}`, k, YUZ_PIVOT, 'kafa', null, { yuva: 'kaslar' });
for (const [hal, k] of Object.entries(yuz.agiz)) ekle(`agiz-${hal}`, k, nT([712, 940]), 'kafa', null, { yuva: 'agiz' });
ekle('burun', K.tasi(orj(K.G.burun, null, false), T, { olcek: S }), nT([723, 812]), 'kafa');
ekle('yanaklar', K.tasi(orj([4, 20], null, false), T), nT([790, 810]), 'kafa');

// ---------- gövde: yuvarlak tulum ----------
const TULUM = Y.kapali([[566, 846], [478, 872], [430, 930], [414, 1040], [404, 1160], [424, 1268], [474, 1336], [560, 1374], [650, 1382], [740, 1374], [826, 1336], [876, 1268], [896, 1160], [886, 1040], [870, 930], [822, 872], [734, 846]]);
const YAKA = Y.kapali([[556, 848, 'k'], [650, 900], [744, 848, 'k'], [764, 880], [700, 930], [650, 940], [600, 930], [536, 880]]);
ekle('govde', [
  ust(TULUM, PEMBE),
  boya(Y.kapali([[790, 860], [920, 860], [920, 1400], [760, 1400], [830, 1240], [840, 1040]]), PEMBE_K, [TULUM]),
  boya(Z.inceSerit(Y.zincir([[468, 1000], [452, 1110], [462, 1220]]), 22, 8), PEMBE_A, [TULUM]),
  ust(YAKA, PEMBE_A),
  ...[1020, 1124].map((y) => ust(Z.daire(650, y, 20), R.BEYAZ)),
  ...[1020, 1124].map((y) => boya(Z.daire(650, y, 6), R.GRI)),
], [CX, 1300], 'kalca', [-15, 15]);

// ---------- kalça ve bacaklar (kısa, beyaz; üstte tulumun paçası) ----------
ekle('kalca', [tamam(Y.kapali([[520, 1250], [780, 1250], [790, 1370], [650, 1400], [510, 1370]]), PEMBE)], [CX, 1320], null, null, { kume: 'bacaklar' });
const BACAK = {
  sag: { kalca: [578, 1340], diz: [570, 1440], bilek: [566, 1520] },
  sol: { kalca: [722, 1340], diz: [730, 1440], bilek: [734, 1520] },
};
for (const y of ['sag', 'sol']) {
  const b = BACAK[y];
  const PACA = Y.kapali([[b.kalca[0] - 76, 1330, 'k'], [b.kalca[0] + 76, 1330, 'k'], [b.kalca[0] + 74, 1396], [b.kalca[0], 1408], [b.kalca[0] - 74, 1396]]);
  ekle(`bacak-ust-${y}`, [
    ...uzuvKatman({ a: b.kalca, ra: 66, b: b.diz, rb: 58, renk: R.BEYAZ, golge: R.BEJ, golgeDx: -18 }),
    ust(PACA, PEMBE),
    ...hilal(PACA, PEMBE_K, PEMBE, -22, 0),
  ], b.kalca, 'kalca', [-35, 35], { kume: 'bacaklar' });
  ekle(`bacak-alt-${y}`, uzuvKatman({ a: b.diz, ra: 58, b: [b.bilek[0], b.bilek[1] + 10], rb: 52, renk: R.BEYAZ, golge: R.BEJ, golgeDx: -18 }), b.diz, `bacak-ust-${y}`, [-10, 70], { kume: 'bacaklar' });
  // pati: yuvarlak, üç parmak çizgisi, sağ yanda bej gölge
  const sx = y === 'sag' ? -1 : 1, px = b.bilek[0] + sx * 14;
  const PATI = Y.kapali([[px - 96, 1556], [px - 80, 1508], [px - 30, 1484], [px + 30, 1484], [px + 80, 1508], [px + 98, 1556], [px + 84, 1600], [px, 1614], [px - 84, 1600]]);
  ekle(`ayak-${y}`, [
    ust(PATI, R.BEYAZ),
    ...hilal(PATI, R.BEJ, R.BEYAZ, -24, -8),
    ...[-34, 0, 34].map((o) => ince([[px + o, 1608], [px + o * 1.04, 1586], [px + o * 1.08, 1568]], 9, 4)),
  ], b.bilek, `bacak-alt-${y}`, [-30, 30]);
}

// ---------- kuyruk (Kino'nun kuyruğu, küçük) ----------
ekle('kuyruk', K.tasi(K.kuyruk(), K.yerlestir(K.KUYRUK_KOK, [808, 1290], 0.62, 24)), [808, 1290], 'kalca', [-35, 35]);

// ---------- kollar: pembe kısa kol, beyaz kol, Kino'nun eli (küçük) ----------
const KOL = {
  sag: { omuz: [486, 936], dirsek: [446, 1080], bilek: [428, 1186] },
  sol: { omuz: [814, 936], dirsek: [854, 1080], bilek: [872, 1186] },
};
for (const y of ['sag', 'sol']) {
  const k = KOL[y];
  const sx = y === 'sag' ? -1 : 1;
  const KOLCUK = Y.kapali([[k.omuz[0] - 62, k.omuz[1] - 20], [k.omuz[0] - 10, k.omuz[1] - 72], [k.omuz[0] + 56, k.omuz[1] - 40], [k.omuz[0] + 66, k.omuz[1] + 30], [k.omuz[0] + 50, k.omuz[1] + 84, 'k'], [k.omuz[0] - 4, k.omuz[1] + 100], [k.omuz[0] - 70, k.omuz[1] + 80, 'k']].map(([x, yy, kk]) => [k.omuz[0] + (x - k.omuz[0]) * -sx, yy, kk]));
  ekle(`kol-ust-${y}`, [
    ...uzuvKatman({ a: k.omuz, ra: 50, b: k.dirsek, rb: 44, renk: R.BEYAZ, golge: R.BEJ, golgeDx: -16 }),
    ust(KOLCUK, PEMBE),
    ...hilal(KOLCUK, PEMBE_K, PEMBE, -24, 0),
  ], k.omuz, 'govde', y === 'sag' ? [-60, 175] : [-175, 60], { kume: `kol-${y}` });
  ekle(`kol-alt-${y}`, uzuvKatman({ a: k.dirsek, ra: 44, b: k.bilek, rb: 40, renk: R.BEYAZ, golge: R.BEJ, golgeDx: -16 }), k.dirsek, `kol-ust-${y}`, [-150, 150], { kume: `kol-${y}` });
  const eksen = Math.atan2(k.bilek[1] - k.dirsek[1], k.bilek[0] - k.dirsek[0]);
  ekle(`el-${y}`, K.elYerlestir(y, k.bilek, 0.6, (eksen * 180) / Math.PI), k.bilek, `kol-alt-${y}`, [-45, 45], { kume: `kol-${y}` });
}

const KUMELER = {
  bacaklar: ['bacak-alt-sag', 'bacak-alt-sol', 'bacak-ust-sag', 'bacak-ust-sol', 'kalca'],
  'kol-sag': ['el-sag', 'kol-alt-sag', 'kol-ust-sag'],
  'kol-sol': ['el-sol', 'kol-alt-sol', 'kol-ust-sol'],
};
const SIRA = ['kuyruk', { kume: 'bacaklar' }, 'ayak-sag', 'ayak-sol', 'govde', 'kafa', 'yanaklar', 'burun', 'gozler', 'kaslar', 'agiz', 'kulak-sag', 'kulak-sol', { kume: 'kol-sag' }, { kume: 'kol-sol' }];
const YUVA = { gozler: 'gozler-acik', kaslar: 'kaslar-notr', agiz: 'agiz-gulumse' };

uret({
  ad: 'lokum', W, H, zemin: ZEMIN, parcalar, sira: SIRA, kumeler: KUMELER, yuvaVarsayilan: YUVA,
  cikti: path.join(KOK, 'assets/karakter/lokum'),
  onizleme: process.argv[2] || path.join(__dirname, 'onizleme'),
  aciklama: 'Lokum kesme kukla kiti (ön görünüş), Kino C kitinden türetildi. Koordinatlar 1300x1720 karesinde, Kino ile aynı birim; açı derece, + saat yönü. sag = karakterin sağı = ekranın solu.',
  kur: 'ekip/karakter/lokum/kit-kur.cjs',
  yuzKutu: [150, 110, 1000, 820],
  yuzParcalar: (s) => ['kafa', 'yanaklar', 'burun', s.gozler, s.kaslar, s.agiz, 'kulak-sag', 'kulak-sol'],
}).catch((e) => { console.error(e); process.exit(1); });
