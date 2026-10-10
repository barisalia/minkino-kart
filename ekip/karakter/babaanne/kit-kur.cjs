#!/usr/bin/env node
/**
 * Babaanne (Nazlı) kesme kukla kiti: Kino C'nin kitinden türer (aynı çizgi, renk, göz / burun / ağız / el / kulak /
 * kuyruk); yöntem Anne ve Baba kitleriyle aynı (ekip/karakter/{anne,baba}/kit-kur.cjs).
 * Tombul ve sıcak: boy Kino'nun 1.52 katı, ~3.4 kafa; yuvarlak, yanakları dolgun kafa, tepede minik gümüş tüy topuzu;
 * açık sütlü kahve kulaklar. Siluet armut: omuzlar yuvarlak ve düşük, en geniş yer göbek-kalça; kısa tombul bacaklar.
 * Yaşlı ama tatlı gözler: Kino'nun gözü, dış köşede iki ince kırışık, gözaltında yumuşak bej kıvrım; ip askılı
 * yuvarlak altın gözlük (camda düz tek ton parlama). Kıyafet: açık önlü lavanta hırka (cepli, kolları ribanalı),
 * altında yuvarlak yakalı krem elbise, bağcıklı kahve ayakkabı. Klip eşyası: börek tepsisi (tepsi, buhar; gizli).
 *
 * Kullanım: node ekip/karakter/babaanne/kit-kur.cjs   (çıktı assets/karakter/babaanne/, önizleme ekip/karakter/babaanne/onizleme)
 * Boy tablosu: assets/karakter/aile-boy.json. Ortak: ekip/karakter/aile-ortak/.
 */
const path = require('path');
const K = require('../aile-ortak/kino-kaynak.cjs');
const Y = require('../aile-ortak/yol.cjs');
const { ust, boya, ince, hilal, kulakCiz, profil, uzuvEl } = require('../aile-ortak/parcalar.cjs');
const { uret } = require('../aile-ortak/kit.cjs');

const { R, Z, tamam, sekil } = K;
const KOK = path.resolve(__dirname, '..', '..', '..');
const W = 2300, H = 3460, CX = 1150, ZEMIN = 3340;
/** yaşlı el: Kino'nun eli, parmaklar biraz uzun, el dolgun (tombul) */
const OLGUN_EL = { parmak: 0.24, en: 0.97, avucEn: 1.0, u0: 64, gecis: 46 };

// ---------- renkler ----------
const SUTLU = 'rgb(214,164,122)', SUTLU_K = 'rgb(168,114,80)', SUTLU_A = 'rgb(238,204,170)';
const GUMUS = 'rgb(214,216,226)', GUMUS_K = 'rgb(166,168,186)', GUMUS_A = 'rgb(244,245,250)';
const LAVANTA = 'rgb(176,152,212)', LAVANTA_K = 'rgb(134,110,176)', LAVANTA_A = 'rgb(210,194,236)';
const KREM = 'rgb(247,234,204)', KREM_K = 'rgb(222,200,160)', KREM_A = 'rgb(255,248,230)';
const AYAKKABI = 'rgb(140,90,58)', AYAKKABI_K = 'rgb(96,58,38)', AYAKKABI_A = 'rgb(190,140,104)';
const ALTIN = 'rgb(226,174,66)', ALTIN_K = 'rgb(172,120,36)';
const DUGME = 'rgb(150,120,190)';

const parcalar = [];
const ekle = (ad, katman, pivot, ustP, sinir = null, ek = {}) => parcalar.push({ ad, katman, pivot, ust: ustP, sinir, ...ek });
const ayna = (n) => n.map(([x, y, k]) => [2 * CX - x, y, k]);
/** ekranın sağ yarısının noktaları (CX'e göre dx) → simetrik kapalı yol (üstten saat yönünde) */
const simetrik = (yari) => {
  const sag = yari.map(([dx, y, k]) => [CX + dx, y, k]);
  const sol = ayna(sag).reverse();
  return Y.kapali([...sag, ...sol.filter((p) => Math.abs(p[0] - CX) > 0.5)]);
};

// ---------- kafa: yuvarlak, yanakları dolgun (yaşlı ve tombul); tepede minik gümüş tüy topuzu ----------
const KAFA_N = [[0, 330], [176, 346], [298, 400], [378, 490], [424, 610], [442, 742], [434, 872], [398, 982], [322, 1072], [204, 1130], [80, 1150]];
const KAFA = simetrik(KAFA_N.map(([x, y]) => [x * 0.95, y]));
const TOPUZ = Z.daire(CX, 314, 64);
// topuzun kökü: tepedeki gümüş tüy tutamı (kafanın tepe kenarına oturur, alt kenarı yumuşak tüy dalgası)
const TUTAM = Y.kapali([[CX - 156, 376], [CX - 132, 340], [CX - 80, 322], [CX, 330], [CX + 80, 322], [CX + 132, 340], [CX + 156, 376], [CX + 118, 396], [CX + 76, 384], [CX + 38, 404], [CX, 392], [CX - 38, 404], [CX - 76, 384], [CX - 118, 396]]);
ekle('kafa', [
  sekil(KAFA, R.BEYAZ),
  ...hilal(KAFA, R.BEJ, R.BEYAZ, -46, -26),
  ust(TUTAM, GUMUS),
  ...hilal(TUTAM, GUMUS_K, GUMUS, -20, -12).map((e) => ({ ...e, k: [...e.k, 'M-7300 -7000h1v1h-1Z'] })),
  // tutamın tüyleri topuza taranmış
  ...[[-120, 380, -50, 340], [-60, 384, -20, 338], [10, 380, 14, 336], [70, 384, 46, 340]].map(([x0, y0, x1, y1]) => ince([[CX + x0, y0], [CX + (x0 + x1) / 2, y0 - 26], [CX + x1, y1]], 6, 1.5, [TUTAM])),
  ust(TOPUZ, GUMUS),
  ...hilal(TOPUZ, GUMUS_K, GUMUS, -20, -18).map((e) => ({ ...e, k: [...e.k, 'M-7310 -7000h1v1h-1Z'] })),
  boya(Z.inceSerit(Y.zincir([[CX - 44, 284], [CX - 18, 268], [CX + 12, 270]]), 12, 4), GUMUS_A, [TOPUZ]),
  // topuzun sarmalı
  ince([[CX - 40, 326], [CX - 18, 292], [CX + 20, 290], [CX + 34, 322], [CX + 6, 344], [CX - 14, 326]], 7, 2.5, [TOPUZ]),
], [CX, 1140], 'govde', [-20, 20]);

// ---------- kulaklar (açık sütlü kahve; biraz uzun: yaşla sarkmış) ----------
const KULAK = { kok: [CX + 256, 404], s: 0.86, aci: 7, boy: 1.04, renk: SUTLU, golge: SUTLU_K, parlakRenk: SUTLU_A };
const kSag = kulakCiz({ ...KULAK, kok: [2 * CX - KULAK.kok[0], KULAK.kok[1]], yon: -1 }), kSol = kulakCiz({ ...KULAK, yon: 1 });
ekle('kulak-sag', kSag.katman, kSag.pivot, 'kafa', [-25, 25]);
ekle('kulak-sol', kSol.katman, kSol.pivot, 'kafa', [-25, 25]);

// ---------- yüz: sevecen yaşlı gözler (dış köşede kırışık, gözaltında yumuşak kıvrım) ----------
const GOZ = [[CX - 132, 700], [CX + 132, 700]], GOZ_S = 0.55;
const RX = 84 * GOZ_S, RY = 117.5 * GOZ_S;
const bejInce = (n, kalin, uc) => ({ ...ince(n, kalin, uc), f: R.BEJ });
const kirisik = (hal, i, h) => {
  const sx = i === 0 ? -1 : 1;
  const k = [];
  const acik = ['acik', 'sola', 'saga', 'saskin', 'yari'].includes(hal);
  // dış köşe kırışıkları (göz kapalıyken / gülerken daha belirgin, üç çizgi)
  // gözlüğün dışında, şakakta (camın içinde kalırsa çerçeveye karışır)
  const kose = [h[0] + sx * 112, h[1] + RY * (acik ? 0.16 : 0.26)];
  // [dikey kayma, açı, boy]: çizgiler ayrı noktalardan başlar, dışa hafif yelpaze (ok ucu gibi birleşmez)
  const cizgiler = acik ? [[-11, -16, 24], [11, 14, 22]] : [[-16, -20, 26], [0, 0, 28], [16, 18, 24]];
  for (const [dy, aci, L] of cizgiler) {
    const r = (aci * Math.PI) / 180, u = [sx * Math.cos(r), Math.sin(r)], p = [kose[0], kose[1] + dy];
    k.push(ince([p, [p[0] + u[0] * L * 0.5, p[1] + u[1] * L * 0.5 - 1.5], [p[0] + u[0] * L, p[1] + u[1] * L - 2]], 7, 2.5));
  }
  // gözaltı: yumuşak bej kıvrım (sevecen, yorgun değil)
  const altY = h[1] + RY * (acik ? 1.18 : 0.95);
  k.push(bejInce([[-0.75, -8], [-0.2, 6], [0.45, 4], [0.9, -10]].map(([a, dy]) => [h[0] + sx * a * RX, altY + dy]), 10, 3));
  return k;
};
const yuz = K.yuzSetleri({ goz: GOZ, gozS: GOZ_S, kas: [[CX - 132, 584], [CX + 132, 584]], kasS: 0.8, kasKalin: 10, agizN: [CX - 4, 1020], agizS: 0.64, gozEk: kirisik });
const YUZ_PIVOT = [CX, 760];
for (const [hal, k] of Object.entries(yuz.goz)) ekle(`gozler-${hal}`, k, YUZ_PIVOT, 'kafa', null, { yuva: 'gozler' });
for (const [hal, k] of Object.entries(yuz.kaslar)) ekle(`kaslar-${hal}`, k, YUZ_PIVOT, 'kafa', null, { yuva: 'kaslar' });
for (const [hal, k] of Object.entries(yuz.agiz)) ekle(`agiz-${hal}`, k, [CX - 4, 1032], 'kafa', null, { yuva: 'agiz' });
const BURUN_S = 0.8;
ekle('burun', K.tasi(K.orj(K.G.burun, null, false), K.yerlestir([718, 811], [CX, 924], BURUN_S), { olcek: BURUN_S }), [CX, 924], 'kafa');
// yanaklar: dolgun, pembe (Kino'nun allığı, büyük)
ekle('yanaklar', [
  ...K.tasi(K.orj(K.G.yanakSag, null, false), K.yerlestir([463, 781], [CX - 226, 902], 0.74)),
  ...K.tasi(K.orj(K.G.yanakSag, null, false), K.yerlestir([463, 781], [CX + 226, 902], 0.74)),
], [CX, 902], 'kafa');

// ---------- gözlük: yuvarlak altın çerçeve, köprü, sap; camda düz tek ton parlama; sapta ip askı ----------
const CAM_R = 90, CERCEVE = 13;
function halka(cx, cy, r, k) {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 1 ${2 * r} 0a${r} ${r} 0 1 1 ${-2 * r} 0Z` + `M${cx - r + k} ${cy}a${r - k} ${r - k} 0 1 0 ${2 * (r - k)} 0a${r - k} ${r - k} 0 1 0 ${-2 * (r - k)} 0Z`;
}
const gozluk = [];
for (const [i, [x, y0]] of GOZ.entries()) {
  const y = y0 + 6;
  const cam = Z.daire(x, y, CAM_R - CERCEVE / 2);
  const sx = i === 0 ? -1 : 1;
  // cam: çok açık mavi düz ton (yarı saydam), sol üstte iki eğik parlama şeridi (tek ton)
  // cam parlaması: sol üstte camın kenarına koşut tek ton hilal + kısa ikinci çizgi (göz bebeğinin üstüne binmez)
  const yay = (r0, r1, a0, a1) => {
    const n = [];
    for (let j = 0; j <= 12; j++) { const a = ((a0 + ((a1 - a0) * j) / 12) * Math.PI) / 180; n.push([x + r0 * Math.cos(a), y + r0 * Math.sin(a)]); }
    for (let j = 12; j >= 0; j--) { const a = ((a0 + ((a1 - a0) * j) / 12) * Math.PI) / 180; const r = r1 - (r1 - r0) * Math.pow(Math.abs(j - 6) / 6, 2) * 0.9; n.push([x + r * Math.cos(a), y + r * Math.sin(a)]); }
    return Z.cokgen(n);
  };
  gozluk.push(boya(cam, 'rgba(200,226,244,0.3)'));
  gozluk.push(boya(yay(CAM_R - 30, CAM_R - 12, 196, 262), 'rgba(255,255,255,0.92)', [cam]));
  gozluk.push(boya(yay(CAM_R - 30, CAM_R - 16, 20, 52), 'rgba(255,255,255,0.8)', [cam]));
  // sap: çerçevenin dış yanından kafanın kenarına (kulağın altında kalır), ucunda ip
  const sap = [[x + sx * (CAM_R - 4), y - 18], [x + sx * (CAM_R + 60), y - 30], [x + sx * (CAM_R + 128), y - 30]];
  gozluk.push(ust(Z.inceSerit(Y.zincir(sap), 16, 13), ALTIN));
  gozluk.push(boya(Z.inceSerit(Y.zincir([[x + sx * (CAM_R + 120), y - 30], [x + sx * (CAM_R + 150), y + 40], [x + sx * (CAM_R + 156), y + 160]]), 9, 7), ALTIN_K));
  gozluk.push(ust(halka(x, y, CAM_R, CERCEVE), ALTIN));
  gozluk.push(boya(Z.inceSerit(Y.zincir([[x - CAM_R + 10, y - 22], [x - CAM_R * 0.62, y - CAM_R * 0.74], [x - 20, y - CAM_R + 5]]), 5, 2), 'rgb(250,222,150)'));
}
const KOPRU = Y.kapali([[CX - 48, 690], [CX, 668], [CX + 48, 690], [CX + 46, 704], [CX, 684], [CX - 46, 704]]);
gozluk.push(ust(KOPRU, ALTIN));
ekle('gozluk', gozluk, [CX, 706], 'kafa');

// ---------- gövde: kısa boyun, açık önlü lavanta hırka, arada krem elbise (yuvarlak yaka, üç düğme) ----------
const BOYUN = Y.kapali([[CX - 96, 1060], [CX + 96, 1060], [CX + 110, 1250, 'k'], [CX - 110, 1250, 'k']]);
// hırka: omuzlar yuvarlak ve düşük, göğüs dolgun, en geniş yer göbek (armut / yumurta siluet)
const HIRKA = simetrik([[96, 1176], [200, 1190], [286, 1222], [346, 1284], [388, 1392], [430, 1560], [484, 1760], [510, 1940], [502, 2100], [468, 2216, 'k'], [250, 2252], [120, 2248, 'k']]);
// önden açık: elbise iki pervaz arasında görünür (göbek pervazları iter, aşağıda açılır)
const ON = Y.kapali([[CX - 104, 1172, 'k'], [CX + 104, 1172, 'k'], [CX + 122, 1400], [CX + 170, 1720], [CX + 204, 1980], [CX + 198, 2256, 'k'], [CX - 198, 2256, 'k'], [CX - 204, 1980], [CX - 170, 1720], [CX - 122, 1400]]);
const YAKA_N = [[CX - 6, 1188, 'k'], [CX - 106, 1170], [CX - 150, 1200], [CX - 140, 1262], [CX - 84, 1290], [CX - 16, 1260]];
const YAKA_SAG = Y.kapali(YAKA_N), YAKA_SOL = Y.kapali(ayna(YAKA_N));
const CEP = (x0) => Y.kapali([[x0, 1940, 'k'], [x0 + 190, 1946, 'k'], [x0 + 186, 2090], [x0 + 160, 2124], [x0 + 30, 2120], [x0 + 6, 2090]]);
const CEP_SAG = CEP(CX - 440), CEP_SOL = CEP(CX + 250);
const RIBANA = simetrik([[200, 2176, 'k'], [320, 2180], [494, 2150, 'k'], [468, 2236, 'k'], [250, 2256], [200, 2254, 'k']]);
// ip askı: gözlüğün ipi kulakların altından çıkıp göğse sarkar (uçları kafanın / kulakların altında)
const IP = [[CX - 330, 1120], [CX - 280, 1260], [CX - 150, 1350], [CX, 1378], [CX + 150, 1350], [CX + 280, 1260], [CX + 330, 1120]];
const gGovde = [
  sekil(BOYUN, R.BEYAZ),
  boya(Z.elips(CX, 1150, 140, 70), R.BEJ, [BOYUN]),
  ust(HIRKA, LAVANTA),
  // sağ yan gölge (göbeğin kavsini izler), sol omuzda ışık
  boya(Y.kapali([[CX + 320, 1230], [CX + 540, 1230], [CX + 540, 2280], [CX + 360, 2280], [CX + 410, 2060], [CX + 400, 1800], [CX + 350, 1560], [CX + 316, 1380]]), LAVANTA_K, [HIRKA]),
  boya(Z.inceSerit(Y.zincir([[CX - 318, 1290], [CX - 368, 1400], [CX - 394, 1540]]), 26, 10), LAVANTA_A, [HIRKA]),
  // elbise (önde)
  ust(ON, KREM, [HIRKA]),
  boya(Y.kapali([[CX + 40, 1172], [CX + 220, 1172], [CX + 220, 2260], [CX + 100, 2260], [CX + 120, 1960], [CX + 84, 1500]]), KREM_K, [ON]),
  // göğüs altında ve göbek altında yumuşak kırışık (göbeğin yuvarlağı)
  ince([[CX - 112, 1560], [CX - 46, 1592], [CX + 30, 1588]], 7, 2, [ON]),
  ince([[CX - 180, 2050], [CX - 90, 2090], [CX + 20, 2100], [CX + 120, 2080]], 8, 2, [ON]),
  ...[1420, 1620, 1820].map((y) => ust(Z.daire(CX, y, 17), 'rgb(232,212,176)')),
  // hırka pervazı: ön kenarlara koşut çizgi
  ince([[CX - 144, 1300], [CX - 172, 1620], [CX - 218, 1980], [CX - 216, 2214]], 7, 3),
  ince([[CX + 144, 1300], [CX + 172, 1620], [CX + 218, 1980], [CX + 216, 2214]], 7, 3),
  // gözlük ipi (ince altın kordon)
  boya(Z.inceSerit(Y.zincir(IP), 10, 8), ALTIN_K),
  // yaka (krem, yuvarlak): elbisenin yakası hırkanın üstüne taşar
  ust(YAKA_SAG, KREM_A),
  ust(YAKA_SOL, KREM_A),
  boya(Y.kapali([[CX + 70, 1180], [CX + 160, 1190], [CX + 160, 1280], [CX + 90, 1290]]), KREM, [YAKA_SOL]),
  // cepler: düz cep, ağzında kıvrım
  ust(CEP_SAG, LAVANTA),
  ince([[CX - 434, 1982], [CX - 336, 1990], [CX - 250, 1986]], 7, 3),
  ust(CEP_SOL, LAVANTA),
  boya(Y.kapali([[CX + 366, 1940], [CX + 460, 1940], [CX + 460, 2140], [CX + 366, 2140]]), LAVANTA_K, [CEP_SOL]),
  ince([[CX + 256, 1986], [CX + 342, 1990], [CX + 440, 1982]], 7, 3),
  // göbeğin üstünde hırkanın yumuşak katı
  ince([[CX - 360, 1830], [CX - 300, 1862], [CX - 240, 1868]], 7, 2),
  ince([[CX + 240, 1862], [CX + 306, 1858], [CX + 366, 1824]], 7, 2),
  // etek ribanası
  ust(RIBANA, LAVANTA),
  boya(Y.kapali([[CX + 350, 2140], [CX + 520, 2140], [CX + 500, 2270], [CX + 350, 2270]]), LAVANTA_K, [RIBANA]),
  ...[-440, -380, -320, -260, 260, 320, 380, 440].map((dx) => ince([[CX + dx, 2186 - Math.abs(dx) * 0.03], [CX + dx * 1.01, 2240 - Math.abs(dx) * 0.03]], 5, 3)),
  // hırkanın tek düğmesi (sol pervazda)
  ust(Z.daire(CX + 186, 1720, 21), DUGME),
  boya(Z.daire(CX + 180, 1713, 7), LAVANTA_A),
];
ekle('govde', gGovde, [CX, 2140], 'kalca', [-12, 12]);

// ---------- etek (elbisenin alt yarısı): kalçada dolgun, baldıra doğru daralır (yumurta siluet), uçta yumuşak kıvrımlar ----------
const ETEK = Y.kapali([[CX - 430, 2130, 'k'], [CX + 430, 2130, 'k'], [CX + 498, 2330], [CX + 490, 2560], [CX + 446, 2780], [CX + 424, 2840, 'k'], [CX + 356, 2864], [CX + 284, 2856], [CX + 222, 2876], [CX + 142, 2864], [CX + 71, 2880], [CX, 2866], [CX - 71, 2880], [CX - 142, 2864], [CX - 222, 2876], [CX - 284, 2856], [CX - 356, 2864], [CX - 424, 2840, 'k'], [CX - 446, 2780], [CX - 490, 2560], [CX - 498, 2330]]);
const katIzi = (n, kalin = 10) => ({ d: Z.inceSerit(Y.zincir(n), kalin, 1.5, (t) => Math.pow(t, 0.75)), f: R.OL, k: [ETEK], c: false });
ekle('etek', [
  sekil(ETEK, KREM),
  ...[[CX + 284, 2856, CX + 290, 2590], [CX + 71, 2880, CX + 84, 2620], [CX - 142, 2864, CX - 130, 2610]].map(([x, y, ux, uy]) => boya(Y.kapali([[ux, uy, 'k'], [x + 4, y], [x + 40, y + 22], [x + 28, y - 110]]), KREM_K, [ETEK])),
  boya(Y.kapali([[CX + 370, 2130], [CX + 540, 2130], [CX + 540, 2900], [CX + 360, 2900], [CX + 410, 2560], [CX + 416, 2300]]), KREM_K, [ETEK]),
  boya(Z.inceSerit(Y.zincir([[CX - 436, 2340], [CX - 446, 2520], [CX - 418, 2720]]), 24, 6), KREM_A, [ETEK]),
  katIzi([[CX + 290, 2590], [CX + 288, 2730], [CX + 284, 2856]]),
  katIzi([[CX + 84, 2620], [CX + 76, 2760], [CX + 71, 2880]], 9),
  katIzi([[CX - 130, 2610], [CX - 138, 2750], [CX - 142, 2864]]),
  katIzi([[CX - 270, 2640], [CX - 280, 2760], [CX - 284, 2856]], 8),
  // kalçada kumaşın yumuşak çekişi
  ince([[CX - 300, 2290], [CX - 250, 2350], [CX - 230, 2420]], 7, 2),
  ince([[CX + 300, 2290], [CX + 254, 2350], [CX + 236, 2420]], 7, 2),
], [CX, 2200], 'kalca', [-8, 8]);

// ---------- kalça ve bacaklar (beyaz tüy; kısa ve tombul: dolgun baldır, bilekte incelir) ----------
ekle('kalca', [tamam(Y.kapali([[CX - 300, 2140], [CX + 300, 2140], [CX + 316, 2340], [CX, 2400], [CX - 316, 2340]]), R.BEYAZ)], [CX, 2240], null, null, { kume: 'bacaklar' });
const BACAK_SAG = {
  kalca: [CX - 162, 2300], diz: [CX - 162, 2820], bilek: [CX - 156, 3226],
  ust: [[CX - 162, 2300, 136, 136], [CX - 164, 2480, 138, 130], [CX - 164, 2680, 124, 118], [CX - 162, 2780, 116, 116], [CX - 162, 2820, 115, 115]],
  alt: [[CX - 162, 2820, 115, 115], [CX - 163, 2880, 120, 114], [CX - 164, 2960, 134, 118], [CX - 162, 3050, 124, 110], [CX - 158, 3146, 96, 90], [CX - 156, 3226, 88, 88]],
};
const aynaUzuv = (n) => n.map(([x, y, a, b]) => [2 * CX - x, y, b, a]);
const aynaN = ([x, y]) => [2 * CX - x, y];
const BACAK = {
  sag: BACAK_SAG,
  sol: { kalca: aynaN(BACAK_SAG.kalca), diz: aynaN(BACAK_SAG.diz), bilek: aynaN(BACAK_SAG.bilek), ust: aynaUzuv(BACAK_SAG.ust), alt: aynaUzuv(BACAK_SAG.alt) },
};
for (const y of ['sag', 'sol']) {
  const b = BACAK[y];
  const ic = y === 'sag' ? -1 : 1;
  const pAlt = profil(b.alt);
  ekle(`bacak-ust-${y}`, uzuvEl({ nokta: b.ust, renk: R.BEYAZ, golge: R.BEJ, golgeOran: 0.24 }), b.kalca, 'kalca', [-35, 35], { kume: 'bacaklar' });
  ekle(`bacak-alt-${y}`, [
    ...uzuvEl({ nokta: b.alt, renk: R.BEYAZ, golge: R.BEJ, golgeOran: 0.24 }),
    ince([pAlt.kenar(0.05, ic, 6), pAlt.kesit(0.09, ic * 0.55), pAlt.kesit(0.1, ic * 0.15)], 8, 2),
  ], b.diz, `bacak-ust-${y}`, [-10, 70], { kume: 'bacaklar' });
  // bağcıklı kahve ayakkabı: yüksekçe burun kubbesi, dil, iki çapraz bağcık ve küçük fiyonk, kalın taban
  const sx = y === 'sag' ? -1 : 1, x = b.bilek[0];
  const nok = (n) => n.map(([a, c, k]) => [x + sx * a, c, k]);
  const AYAK = Y.kapali(nok([[-74, 3200], [74, 3200], [92, 3262], [-82, 3262]]));
  const AYAKKABI_D = Y.kapali(nok([[-104, 3250], [-50, 3218], [40, 3212], [118, 3226], [190, 3268], [200, 3306], [150, 3330], [20, 3334], [-90, 3328], [-116, 3296]]));
  const DIL = Y.kapali(nok([[-40, 3204, 'k'], [52, 3204, 'k'], [58, 3256], [6, 3266], [-46, 3256]]));
  const TABAN = Y.kapali(nok([[-118, 3300, 'k'], [40, 3316], [204, 3296, 'k'], [196, 3326], [120, 3344], [-40, 3344], [-110, 3334]]));
  ekle(`ayak-${y}`, [
    tamam(AYAK, R.BEYAZ),
    ust(AYAKKABI_D, AYAKKABI),
    ...hilal(AYAKKABI_D, AYAKKABI_K, AYAKKABI, -sx * 40, -14),
    boya(Z.inceSerit(Y.zincir(nok([[60, 3240], [120, 3248], [166, 3272]])), 18, 8), AYAKKABI_A, [AYAKKABI_D]),
    ust(DIL, AYAKKABI),
    boya(Y.kapali(nok([[20, 3204], [60, 3204], [60, 3260], [20, 3262]])), AYAKKABI_K, [DIL]),
    ince(nok([[-30, 3222], [36, 3240]]), 7, 5),
    ince(nok([[-30, 3244], [40, 3226]]), 7, 5),
    ince(nok([[-34, 3214], [-56, 3196], [-74, 3204], [-58, 3220], [-34, 3214]]), 7, 4),
    ince(nok([[-34, 3214], [-48, 3238], [-60, 3250]]), 6, 3),
    ust(TABAN, AYAKKABI_K),
  ], b.bilek, `bacak-alt-${y}`, [-30, 30]);
}

// ---------- kuyruk (Kino'nun kuyruğu, sütlü kahve) ----------
ekle('kuyruk', K.tasi(K.kuyruk(), K.yerlestir(K.KUYRUK_KOK, [CX + 440, 2250], 1.1, 34), { renk: { [R.KAHVE]: SUTLU, [R.KOYU]: SUTLU_K } }), [CX + 440, 2250], 'kalca', [-35, 35]);

// ---------- kollar: hırka kolu (omuz yuvarlak ve düşük, kol dolgun), dirsekte kırışık, ribanalı manşet, tombul el ----------
const KOL_SAG = { omuz: [CX - 326, 1340], dirsek: [CX - 498, 1740], bilek: [CX - 488, 2104] };
const KOL = { sag: KOL_SAG, sol: { omuz: aynaN(KOL_SAG.omuz), dirsek: aynaN(KOL_SAG.dirsek), bilek: aynaN(KOL_SAG.bilek) } };
for (const y of ['sag', 'sol']) {
  const k = KOL[y];
  const aynaK = y === 'sol' ? aynaUzuv : (n) => n;
  const ic = y === 'sag' ? -1 : 1;
  const eksen = Math.atan2(k.bilek[1] - k.dirsek[1], k.bilek[0] - k.dirsek[0]);
  const ux = Math.cos(eksen), uy = Math.sin(eksen);
  const m0 = [k.bilek[0] - ux * 74, k.bilek[1] - uy * 74], m1 = [k.bilek[0] + ux * 4, k.bilek[1] + uy * 4];
  const s = KOL_SAG;
  const ara = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const ust_ = aynaK([[...s.omuz, 98, 98], [...ara(s.omuz, s.dirsek, 0.28), 108, 98], [...ara(s.omuz, s.dirsek, 0.64), 100, 92], [...ara(s.omuz, s.dirsek, 0.86), 88, 88], [...s.dirsek, 87, 87]]);
  const ustP = profil(ust_);
  ekle(`kol-ust-${y}`, [
    ...uzuvEl({ nokta: ust_, renk: LAVANTA, golge: LAVANTA_K, golgeOran: 0.3, isik: LAVANTA_A, isikT: [0.1, 0.7], isikGen: 22 }),
    ince([ustP.kenar(0.8, ic, 5), ustP.kesit(0.85, ic * 0.45), ustP.kesit(0.84, ic * 0.1)], 7, 2),
    ince([ustP.kenar(0.1, -ic, 5), ustP.kesit(0.16, -ic * 0.4)], 6, 2),
  ], k.omuz, 'govde', y === 'sag' ? [-60, 175] : [-175, 60], { kume: `kol-${y}` });
  const sm0 = y === 'sag' ? m0 : aynaN(m0);
  const alt_ = aynaK([[...s.dirsek, 87, 87], [...ara(s.dirsek, sm0, 0.2), 88, 86], [...ara(s.dirsek, sm0, 0.55), 90, 84], [sm0[0], sm0[1], 80, 80]]);
  const altP = profil(alt_);
  const px = -uy, py = ux;
  const MANSET = Y.kapali([[m0[0] + px * 80, m0[1] + py * 80], [m1[0] + px * 82 + ux * 6, m1[1] + py * 82 + uy * 6, 'k'], [m1[0] + ux * 14, m1[1] + uy * 14], [m1[0] - px * 82 + ux * 6, m1[1] - py * 82 + uy * 6, 'k'], [m0[0] - px * 80, m0[1] - py * 80]]);
  ekle(`kol-alt-${y}`, [
    ...uzuvEl({ nokta: alt_, renk: LAVANTA, golge: LAVANTA_K, golgeOran: 0.3, vurguT: [0.15, 0.8] }),
    ince([altP.kenar(0.06, ic, 5), altP.kesit(0.12, ic * 0.5), altP.kesit(0.14, ic * 0.12)], 8, 2),
    ince([altP.kenar(0.24, ic, 5), altP.kesit(0.28, ic * 0.55)], 7, 2),
    ince([altP.kenar(0.78, -ic, 5), altP.kesit(0.83, -ic * 0.45), altP.kesit(0.82, -ic * 0.1)], 7, 2),
    ust(MANSET, LAVANTA),
    ...hilal(MANSET, LAVANTA_K, LAVANTA, -28, 0).map((e) => ({ ...e, k: [...e.k, `M-7${y === 'sag' ? 1 : 2}00 -7000h1v1h-1Z`] })),
    ...[-44, -15, 15, 44].map((o) => ince([[m0[0] - uy * o + ux * 12, m0[1] + ux * o + uy * 12], [m1[0] - uy * o * 0.95 - ux * 8, m1[1] + ux * o * 0.95 - uy * 8]], 6, 4)),
  ], k.dirsek, `kol-ust-${y}`, [-150, 150], { kume: `kol-${y}` });
  ekle(`el-${y}`, K.elYerlestir(y, [k.bilek[0] + ux * 50, k.bilek[1] + uy * 50], 0.94, (eksen * 180) / Math.PI, OLGUN_EL), k.bilek, `kol-alt-${y}`, [-45, 45], { kume: `kol-${y}` });
}

// ---------- börek tepsisi (klip eşyası, gizli): yuvarlak bakır tepsi, üstünde dilim börekler; buhar ----------
const TX = CX, TY = 1990;
const TEPSI = Z.elips(TX, TY, 330, 92);
const TEPSI_IC = Z.elips(TX, TY - 6, 296, 74);
const BAKIR = 'rgb(214,128,74)', BAKIR_K = 'rgb(160,82,44)', BAKIR_A = 'rgb(246,184,130)';
const BOREK = 'rgb(240,186,96)', BOREK_K = 'rgb(206,136,60)', BOREK_A = 'rgb(252,222,150)';
const tepsi = [
  sekil(TEPSI, BAKIR),
  boya(Z.elips(TX + 30, TY + 30, 330, 80), BAKIR_K, [TEPSI]),
  ust(TEPSI_IC, BAKIR_A),
  boya(Z.elips(TX + 26, TY + 6, 296, 70), BAKIR, [TEPSI_IC]),
];
// dilimler (arkadan öne): eğik dikdörtgen börek, üstte koyu kızarmış yüz, çörek otu
const dilim = (x, y, w, h) => {
  const ust_ = Y.kapali([[x - w, y - h * 0.5], [x + w * 0.1, y - h * 0.82], [x + w, y - h * 0.48], [x - w * 0.06, y - h * 0.14]], 0.7);
  const yan = Y.kapali([[x - w, y - h * 0.5, 'k'], [x - w * 0.06, y - h * 0.14, 'k'], [x + w, y - h * 0.48, 'k'], [x + w, y + h * 0.02, 'k'], [x - w * 0.06, y + h * 0.4, 'k'], [x - w, y, 'k']], 0.5);
  return [
    ust(yan, BOREK),
    boya(Y.kapali([[x - w * 0.06, y - h * 0.14], [x + w + 10, y - h * 0.48], [x + w + 10, y + h * 0.1], [x - w * 0.06, y + h * 0.5]]), BOREK_K, [yan]),
    ince([[x - w * 0.9, y - h * 0.22], [x - w * 0.4, y - h * 0.08], [x - w * 0.06, y + h * 0.06]], 5, 2, [yan]),
    ince([[x + w * 0.1, y + h * 0.04], [x + w * 0.5, y - h * 0.1], [x + w * 0.9, y - h * 0.22]], 5, 2, [yan]),
    ust(ust_, BOREK_A),
    boya(Z.elips(x + w * 0.1, y - h * 0.46, w * 0.5, h * 0.14), BOREK, [ust_]),
    ...[[-0.4, -0.5], [0.2, -0.62], [0.5, -0.44], [-0.1, -0.36]].map(([a, b]) => boya(Z.elips(x + w * a, y + h * b, 5, 3.5), R.OL, [ust_])),
  ];
};
for (const [x, y] of [[TX - 150, TY - 26], [TX + 40, TY - 36], [TX + 200, TY - 18], [TX - 60, TY + 6], [TX + 120, TY + 10]]) tepsi.push(...dilim(x, y, 86, 120));
ekle('tepsi', tepsi, [TX, TY], 'govde', null, { gizli: true });
// buhar: kıvrımlı beyaz şerit, altında açık mavi-gri gölgesi (krem elbisenin önünde de seçilsin)
const buharYol = (x0, s) => Z.inceSerit(Y.zincir([[x0, TY - 110], [x0 + 24 * s, TY - 160], [x0 - 12 * s, TY - 220], [x0 + 20 * s, TY - 280], [x0 + 4 * s, TY - 330]]), 30, 6);
const buharCizgi = (x0, s) => [boya(K.donustur(buharYol(x0, s), (p) => p.translate(6, 6)), 'rgba(150,170,200,0.55)'), boya(buharYol(x0, s), 'rgb(255,255,255)')];
ekle('buhar', [...buharCizgi(TX - 120, 1), ...buharCizgi(TX + 40, -1), ...buharCizgi(TX + 180, 1)], [TX, TY - 200], 'tepsi', null, { gizli: true });

// ---------- çizim sırası ----------
const KUMELER = {
  bacaklar: ['bacak-alt-sag', 'bacak-alt-sol', 'bacak-ust-sag', 'bacak-ust-sol', 'kalca'],
  'kol-sag': ['el-sag', 'kol-alt-sag', 'kol-ust-sag'],
  'kol-sol': ['el-sol', 'kol-alt-sol', 'kol-ust-sol'],
};
const SIRA = ['kuyruk', { kume: 'bacaklar' }, 'ayak-sag', 'ayak-sol', 'etek', 'govde', 'kafa', 'yanaklar', 'burun', 'gozler', 'kaslar', 'agiz', 'gozluk', 'kulak-sag', 'kulak-sol', 'tepsi', 'buhar', { kume: 'kol-sag' }, { kume: 'kol-sol' }];
const YUVA = { gozler: 'gozler-acik', kaslar: 'kaslar-notr', agiz: 'agiz-gulumse' };

uret({
  ad: 'babaanne', W, H, zemin: ZEMIN, parcalar, sira: SIRA, kumeler: KUMELER, yuvaVarsayilan: YUVA,
  cikti: path.join(KOK, 'assets/karakter/babaanne'),
  onizleme: process.argv[2] || path.join(__dirname, 'onizleme'),
  aciklama: 'Babaanne (Nazlı) kesme kukla kiti (ön görünüş), Kino C kitinden türetildi. Koordinatlar 2300x3460 karesinde, Kino ile aynı birim; açı derece, + saat yönü. sag = karakterin sağı = ekranın solu. tepsi ve buhar klip eşyası: varsayılan gizli (o: 1 ile görünür; tepsi gövdenin çocuğu, x / y ile ellere taşınır).',
  kur: 'ekip/karakter/babaanne/kit-kur.cjs',
  yuzKutu: [600, 220, 1100, 1000],
  yuzParcalar: (s) => ['kafa', 'yanaklar', 'burun', s.gozler, s.kaslar, s.agiz, 'gozluk', 'kulak-sag', 'kulak-sol'],
}).catch((e) => { console.error(e); process.exit(1); });
