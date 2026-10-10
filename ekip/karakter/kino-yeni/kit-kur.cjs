#!/usr/bin/env node
/**
 * Kino C → kesme (cut-out) kukla kiti.
 *
 * Kaynak: ekip/film/seri-2/karakter/v1/kino-on-c.svg (Recraft vektörü, Barış onaylı; çizim DEĞİŞTİRİLMEZ).
 * Çıktı:  assets/karakter/kino-yeni/
 *           <parca>.svg          her parçanın vektörü (cizgi + dolgu grupları)
 *           <parca>.webp         saydam görsel (1792×2432 karesinde 1:1, karakter 2432 px boyunda)
 *           <parca>.dolgu.webp   birleşik kümelerde (kollar, bacaklar) dış çizgisiz katman (iki geçişli çizim)
 *           kino-yeni.json       iskelet: dönme noktaları, ebeveynler, çizim sırası, eklem sınırları, yuvalar
 * Kullanım: node ekip/karakter/kino-yeni/kit-kur.cjs [onizleme-klasoru]
 *
 * Önizleme (varsayılan ekip/karakter/kino-yeni/onizleme): dinlenme.png (parçalardan kurulan duruş), fark.png
 * (kaynakla fark, kırmızı), yuz-setleri.png (göz, kaş, ağız setleri). Deneme klibi: film/kukla-test.html,
 * kayıt: scripts/film/kukla-kayit.mjs.
 *
 * Yöntem:
 * 1. Kaynak SVG'de dış çizgi tek koyu şekil (1. yol), renkler onun üstünde. Ölçüldü: dış çizgi her yerde ~8.5 px.
 *    Bu yüzden her parçanın çizgisi, dolgularının 17 px koyu fırçayla altına çizilmesiyle yeniden kurulur
 *    (dolgular üstte, çizginin yarısı dışarıda kalır). Bütün parçalar birleşince kaynakla piksel piksel aynı.
 * 2. En/boy düzeltildi (viewBox 2432 kare, 1792 genişlikte basılıyordu): yatay 1792/2432 ile ölçeklendi.
 * 3. Kesilen yerler (dirsek, bilek, diz, omuz, kalça) yuvarlak "bilye" uçla kapanır, komşu parçanın altına girer.
 * 4. Gizli yerler (kulak altındaki kafa, kol altındaki gövde, tişört altındaki kalça, kuyruk kökü, fular arkası)
 *    aynı renk ve çizgiyle tamamlanır; dinlenme duruşunda görünmez (önizlemede kaynakla farkı ölçülür).
 * 5. Kollar ve bacaklar iki geçişle çizilir (önce çizgili görseller, sonra çizgisiz dolgu katmanları): dirsek,
 *    diz, bilekte çizgi kalmaz, büküm tek parça gibi görünür. Ayrıntı: film/src/kukla.ts.
 * 6. Yüz setleri (8 ağız, 7 göz, 4 kaş) kodla, Kino C'nin kendi göz/kaş/ağız çizgilerinden türetildi (Recraft yok).
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const svgpath = require('svgpath');
const Z = require('./cizim.cjs');

const KOK = path.resolve(__dirname, '..', '..', '..');
const KAYNAK = path.join(KOK, 'ekip/film/seri-2/karakter/v1/kino-on-c.svg');
const CIKTI = path.join(KOK, 'assets/karakter/kino-yeni');
const ONIZLEME = process.argv[2] || path.join(__dirname, 'onizleme');
const W = 1792, H = 2432;
const CIZGI = 17; // alttan fırça: 8.5 px görünen çizgi

// ---------- renkler (kaynaktan) ----------
const OL = 'rgb(64,19,18)', BEYAZ = 'rgb(252,251,249)', BEJ = 'rgb(221,180,164)', KAHVE = 'rgb(220,124,78)', KOYU = 'rgb(159,55,45)';
const YESIL = 'rgb(129,193,101)', LACI = 'rgb(51,57,125)', GOZ = 'rgb(23,8,10)';
const AGIZ_IC = 'rgb(122,32,36)', DIL = 'rgb(240,112,104)';

// ---------- kaynak yollar (en/boy düzeltilmiş) ----------
const kaynak = fs.readFileSync(KAYNAK, 'utf8');
const P = [...kaynak.matchAll(/<path[^>]*fill="([^"]*)"[^>]*d="([^"]*)"/g)].map((m) => ({ f: m[1], d: svgpath(m[2]).scale(W / 2432, 1).round(2).toString() }));
if (P.length !== 87) throw new Error(`beklenmeyen yol sayısı: ${P.length}`);

/** kaynak yollardan katmanlar (kırpma: birleşim listesi) */
const orj = (ids, k = null, c = true) => ids.map((i) => ({ d: P[i].d, f: P[i].f, k, c }));
const sekil = (d, f, k = null, c = true) => ({ d, f, k, c });
/** tamamlama / bilye: kaynak katmanların ALTINDA (önce kendi çizgisi ve dolgusu, sonra kaynağın çizgisi ve dolgusu) */
const tamam = (d, f, k = null) => ({ d, f, k, c: true, alt: true });
/** yalnız alttan çizgiyi kırp ('!' önekli: o bölgenin dışı) */
const cizgiKirp = (katman, kc) => katman.map((e) => ({ ...e, kc }));
const kaydir = (d, x, y) => svgpath(d).translate(x, y).round(2).toString();
const donustur = (d, f) => f(svgpath(d)).round(2).toString();

// kaynak gruplar (yol numaraları: kino-on-c.svg içindeki sıra)
const G = {
  kafa: [2, 3, 5, 6],
  kulakSag: [35, 36, 37], // karakterin sağı = ekranın solu
  kulakSol: [30, 31],
  gozSag: [12, 15, 16, 17],
  gozSol: [7, 8, 9, 10],
  kaslar: [11, 22],
  burun: [13, 14, 18, 19, 23],
  agiz: [21],
  yanaklar: [4, 20],
  tisort: [24, 25, 26, 27, 28, 29, 78, 79],
  fular: [60, 61, 63, 68, 69, 80],
  kolSag: [42, 43, 44, 45, 46],
  kolSol: [38, 39, 40, 41],
  bacak: [32, 33, 34],
  ayakSag: [47, 48, 49, 50, 59, 66, 67, 70, 72, 74, 76, 84, 85],
  ayakSol: [51, 52, 53, 54, 62, 64, 65, 71, 73, 75, 77, 81, 82, 83, 86],
  kuyruk: [55, 56, 57, 58],
};

// ---------- eklem geometrisi (kare koordinatı) ----------
const KOL = {
  sag: { omuz: [590, 1300], omuzR: 52, ust: [522, 1388], dirsek: [483, 1515], dirsekR: 44, bilek: [452, 1640], bilekR: 54 },
  sol: { omuz: [1110, 1300], omuzR: 92, ust: [1185, 1415], dirsek: [1226, 1527], dirsekR: 90, bilek: [1253, 1640], bilekR: 98 },
};
// kol dikişleri (kaynakta tişört dolgusundaki yarık; ortası ölçüldü, yukarıdan koltuk altına)
const DIKIS = {
  sag: [[627, 1233], [615, 1260], [604.5, 1280], [596.5, 1300], [588.5, 1320], [580.5, 1340], [573.5, 1360], [567.5, 1380], [562.5, 1395], [559, 1404]],
  sol: [[1024, 1346], [1026, 1360], [1030, 1380], [1034.5, 1400], [1039.5, 1420], [1045.5, 1440], [1052.5, 1460], [1058.5, 1475], [1063, 1486]],
};
const ters = (a) => [...a].reverse();
/** kırık çizgiyi düz Bezier zincirine çevir (inceSerit için) */
const zincir = (n) => n.flatMap((p, i) => (i === 0 ? [p] : [[n[i - 1][0] + (p[0] - n[i - 1][0]) / 3, n[i - 1][1] + (p[1] - n[i - 1][1]) / 3], [n[i - 1][0] + ((p[0] - n[i - 1][0]) * 2) / 3, n[i - 1][1] + ((p[1] - n[i - 1][1]) * 2) / 3], p]));
const BACAK = {
  sag: { kalca: [668, 1795], kalcaR: 105, diz: [655, 1915], dizR: 112, bilek: [648, 2080], bilekR: 92, x0: 470, x1: 845, dizY: 1915 },
  sol: { kalca: [1022, 1805], kalcaR: 105, diz: [1036, 1925], dizR: 112, bilek: [1046, 2092], bilekR: 92, x0: 845, x1: 1260, dizY: 1925 },
};

// tişört: kol = kol ağzından (kolevi) ötesi. Kolevi: kaynaktaki dikiş yarığı + yarığın ucundan omuz kenarına kısa bir
// uzantı. Omuz başı gövdede kalır; kol kalkınca tişört omuzsuz kalmaz, kol da boyuna uzun bir şerit gibi görünmez.
const KOLEVI = {
  // dikiş ucundan omuz kenarına (sonra şeklin dışına uzar: kırpma çokgeni için)
  sag: [[627, 1233], [610, 1216], [589, 1205]],
  sol: [[1024, 1346], [1070, 1300], [1130, 1258], [1189, 1222]],
};
const DIS = { sag: [[560, 1180], [470, 1100]], sol: [[1230, 1190], [1350, 1100]] };
const GOVDE_KIRP = Z.cokgen([[690, 990], [400, 990], ...ters(DIS.sag), ...ters(KOLEVI.sag), ...DIKIS.sag, [430, 1422], [430, 1800], [1260, 1800], [1260, 1532], ...ters(DIKIS.sol), ...KOLEVI.sol, ...DIS.sol, [1400, 990]]);
const KOL_SAG_KIRP = Z.cokgen([...ters(DIS.sag), ...ters(KOLEVI.sag), ...DIKIS.sag, [430, 1422], [300, 1300], [380, 1100]]);
const KOL_SOL_KIRP = Z.cokgen([...ters(DIS.sol), ...ters(KOLEVI.sol), ...DIKIS.sol, [1260, 1532], [1420, 1400], [1450, 1100]]);
// gövdenin yeni kenarlarına çizgi veren tamamlayıcı (kaynak tişört altında; yalnız kesim kenarlarında görünür)
// (dikiş kenarı 4 px gövdeye kaydırılır: çizgisi yarığın üstüne otursun, yanında ikinci ince çizgi kalmasın)
const kaydirDikis = (n, dx, dy) => n.map(([x, y]) => [x + dx, y + dy]);
const GOVDE_TAMAM = Z.cokgen([
  [730, 1050], [640, 1160], [600, 1212], [612, 1222], [630, 1237], ...kaydirDikis(DIKIS.sag, 3.7, 1.5).slice(1),
  [532, 1600], [545, 1640], [850, 1690], [1128, 1640],
  ...ters(kaydirDikis(DIKIS.sol, -3.9, 1)), [1068, 1296], [1128, 1254], [1180, 1224], [1150, 1190], [1110, 1140], [980, 1050],
]);
// kol kalkınca kolun üst kenarına çizgi (dinlenmede görünmez: motor açıyla açar, kol-ust-*-dikis)
const KOLEVI_CIZGI = {
  sag: Z.inceSerit(zincir([[630, 1238], ...KOLEVI.sag.slice(1), [580, 1201]]), 8.5, 4, (t) => Math.min(1, (1 - t) * 4)),
  sol: Z.inceSerit(zincir([[1022, 1350], ...KOLEVI.sol.slice(1), [1197, 1217]]), 8.5, 4, (t) => Math.min(1, (1 - t) * 4)),
};

// kafa: kulakların altında kalan yer (kaynakta yok)
const KAFA_TAMAM = 'M820 1050L1120 1000C1200 940 1250 840 1258 720C1265 600 1240 480 1180 390C1120 310 1010 288 900 292C780 296 660 318 578 374C490 432 446 530 428 640C418 720 420 780 432 820L600 1000Z';
// kalça: tişört altında kalan yer
// (orta bölge; yanlar uyluklarda: uyluk dönünce kalçanın köşesi dışarı taşmasın)
const KALCA_TAMAM = Z.cokgen([[600, 1590], [1060, 1590], [1060, 1790], [900, 1805], [605, 1795]]);
const KALCA_KIRP = Z.cokgen([[600, 1560], [1060, 1560], [1060, 1800], [900, 1862], [790, 1856], [722, 1838], [600, 1806]]);
// tişört eteğinin hemen altı: bacak katmanlarının üst kenarındaki (etekle ortak) çizgi tişört altında kalsın;
// gövde eğilince ikinci bir etek çizgisi görünmesin
const ETEK_ALTI = Z.cokgen([[470, 1655], [515, 1664], [540, 1676], [560, 1683], [600, 1696], [650, 1708], [700, 1717], [750, 1723], [800, 1726], [850, 1728], [900, 1727], [950, 1723], [1000, 1718], [1050, 1709], [1100, 1698], [1130, 1689], [1160, 1680], [1260, 1680], [1260, 2400], [470, 2400]]);
// ellerin kalçaya bindiği yer: kaynakta kalça dolgusunda el biçiminde oyuk var; kalça kenarı tamamlanır
const KALCA_YAN = {
  sag: Z.cokgen([[530, 1662], [620, 1662], [620, 1840], [570, 1825], [552, 1790], [546, 1740], [538, 1705]]),
  sol: Z.cokgen([[1100, 1672], [1150, 1674], [1151, 1720], [1148, 1790], [1138, 1830], [1100, 1850]]),
};
// bacak katmanlarının alttan çizgisi: etek altı, el oyuklarının kenarı hariç ('~': çift-tek kuralıyla tek yol)
const ETEK_KIRP = '~' + ETEK_ALTI + KALCA_YAN.sag + KALCA_YAN.sol;
// uyluklarda çatal (iki bacak arası) çizgisi yok: o çizgi kalçanın; uyluk dönünce ikinci bir çatal çizgisi kalmasın
const CATAL = Z.cokgen([[722, 1815], [786, 1815], [786, 1850], [722, 1850]]) + Z.cokgen([[800, 1815], [885, 1815], [885, 1858], [800, 1858]]);
const ETEK_KIRP_UYLUK = ETEK_KIRP + CATAL;
// kuyruk kökü: kolun ve kalçanın arkasında
const KUYRUK_TAMAM = Z.puruzsuzKapali([[1350, 1528], [1405, 1565], [1408, 1640], [1360, 1690], [1280, 1722], [1200, 1734], [1168, 1700], [1230, 1640], [1300, 1574]]);
// kuyruğun kolun arkasında kalan (oyuk) kenarı: kaynakta orada kol çizgisi var; kuyruk sallanınca kuyruğun
// üstünde çizgi olarak kalmasın
const KUYRUK_OYUK = Z.cokgen([[1250, 1440], [1330, 1440], [1336, 1530], [1360, 1600], [1382, 1663], [1392, 1720], [1250, 1720]]);

// ---------- parçalar ----------
const parcalar = [];
/** ad, katmanlar, pivot, ebeveyn, eklem sınırı [en az, en çok] (derece; + saat yönü) */
const ekle = (ad, katman, pivot, ust, sinir = null, ek = {}) => parcalar.push({ ad, katman, pivot, ust, sinir, ...ek });

ekle('kalca', [tamam(KALCA_TAMAM, BEYAZ), ...cizgiKirp(orj(G.bacak, [KALCA_KIRP]), [ETEK_KIRP])], [845, 1760], null, null, { kume: 'bacaklar' });
for (const y of ['sag', 'sol']) {
  const b = BACAK[y];
  // uyluk çatalın üstüne uzanmaz (orası kalçanın): uyluk dönünce çatal çizgisinin üstünü örtmesin
  const ustKirp = y === 'sag'
    ? Z.cokgen([[b.x0, 1600], [790, 1600], [790, 1830], [812, 1852], [b.x1, 1852], [b.x1, b.dizY], [b.x0, b.dizY]])
    : Z.cokgen([[900, 1600], [b.x1, 1600], [b.x1, b.dizY], [b.x0, b.dizY], [b.x0, 1856], [878, 1856], [900, 1835]]);
  const altKirp = Z.cokgen([[b.x0, b.dizY], [b.x1, b.dizY], [b.x1, 2200], [b.x0, 2200]]);
  const kalcaB = Z.daire(...b.kalca, b.kalcaR), dizB = Z.daire(...b.diz, b.dizR), bilekB = Z.daire(...b.bilek, b.bilekR);
  ekle(`bacak-ust-${y}`, [tamam(KALCA_YAN[y], y === 'sol' ? BEJ : BEYAZ), tamam(kalcaB, BEYAZ), tamam(dizB, BEYAZ), ...cizgiKirp(orj(G.bacak, [ustKirp, kalcaB, dizB]), [ETEK_KIRP_UYLUK])], b.kalca, 'kalca', [-35, 35], { kume: 'bacaklar' });
  // baldır: ayakkabının içine uzanır (kaynakta ayakkabı üstünde biter)
  const uzanti = y === 'sag' ? Z.cokgen([[545, 1990], [752, 2032], [748, 2120], [550, 2120]]) : Z.cokgen([[935, 2000], [1176, 1985], [1170, 2130], [940, 2130]]);
  ekle(`bacak-alt-${y}`, [tamam(uzanti, BEYAZ), tamam(bilekB, BEYAZ), tamam(dizB, BEYAZ), ...orj(G.bacak, [altKirp, dizB])], b.diz, `bacak-ust-${y}`, [-10, 70], { kume: 'bacaklar' });
  ekle(`ayak-${y}`, orj(y === 'sag' ? G.ayakSag : G.ayakSol), b.bilek, `bacak-alt-${y}`, [-30, 30]);
}
ekle('kuyruk', [tamam(KUYRUK_TAMAM, KAHVE), ...cizgiKirp(orj(G.kuyruk), ['!' + KUYRUK_OYUK])], [1372, 1648], 'kalca', [-35, 35]);
// tişörtte fuların oturduğu yer boş (kenarında çizgi var): fular kıpırdayınca görünmesin diye yeşil yama
const FULAR_YAMA = G.fular.map((i) => ({ d: P[i].d, f: YESIL, k: [GOVDE_KIRP], c: false, iz: 24 }));
// omuz yuvaları: dikişin ortasında yeşil bilye (gövdenin; dinlenmede yarısı kolun altında, yarısı tişörtün altında).
// Kol kalkınca açılan yeri kapatır, yuvarlak omuz olarak görünür.
const OMUZ_YUVA = ['sag', 'sol'].map((y) => tamam(Z.daire(...KOL[y].omuz, KOL[y].omuzR), YESIL));
// omuz ucu: kolevinin dış ucunda küçük bilye (kol içe dönünce omuz kenarında çentik açılmasın)
OMUZ_YUVA.push(tamam(Z.daire(586, 1232, 20), YESIL), tamam(Z.daire(1166, 1252, 30), YESIL));
ekle('govde', [tamam(GOVDE_TAMAM, YESIL), ...OMUZ_YUVA, ...FULAR_YAMA, ...orj(G.tisort, [GOVDE_KIRP])], [850, 1690], 'kalca', [-15, 15]);
// fuların çene altındaki devamı: dinlenmede kafanın arkasında kalır (kafa eğilince görünür)
const ceneAlti = (i) => [tamam(kaydir(P[i].d, 0, -34), LACI, [P[2].d]), tamam(kaydir(P[i].d, 0, -34), LACI, [KAFA_TAMAM])];
ekle('fular', [...ceneAlti(61), ...ceneAlti(69), ...orj(G.fular)], [870, 1150], 'govde', [-8, 8]);
ekle('kafa', [tamam(KAFA_TAMAM, BEYAZ), ...orj(G.kafa)], [812, 1118], 'govde', [-20, 20]);
ekle('kulak-sag', orj(G.kulakSag), [566, 352], 'kafa', [-25, 25]);
// kulak-sol'un kafa üstüne taşan kahverengi kısmının alt kenarında kaynakta çizgi yok (renk renge değer)
const PERCEM_KENAR = Z.cokgen([[988, 270], [1069, 300], [1136, 358], [1172, 444], [1177, 524], [1148, 524], [1140, 454], [1110, 384], [1050, 334], [988, 298]]);
ekle('kulak-sol', cizgiKirp(orj(G.kulakSol), ['!' + PERCEM_KENAR]), [1186, 410], 'kafa', [-25, 25]);
ekle('yanaklar', orj(G.yanaklar, null, false), [790, 810], 'kafa');
ekle('burun', orj(G.burun, null, false), [723, 812], 'kafa');

for (const y of ['sag', 'sol']) {
  const k = KOL[y];
  const eksen = [k.bilek[0] - k.ust[0], k.bilek[1] - k.ust[1]];
  const geri = [-eksen[0], -eksen[1]];
  const kol = y === 'sag' ? G.kolSag : G.kolSol;
  const dirsekB = Z.daire(...k.dirsek, k.dirsekR), bilekB = Z.daire(...k.bilek, k.bilekR);
  const yenKirp = y === 'sag' ? KOL_SAG_KIRP : KOL_SOL_KIRP;
  const ust = Z.yariDuzlem(k.dirsek, geri), orta = Z.serit(k.dirsek, k.bilek), el = Z.yariDuzlem(k.bilek, eksen);
  // kol-ust: tişört kolu + dirseğe kadar beyaz kol. Dikiş çizgisi kolun kendi kenarı (tam kalınlık): kolla döner.
  const dikis = sekil(Z.inceSerit(zincir(DIKIS[y]), 8.5, 3, (t) => Math.min(1, t * 4)), OL, null, false);
  ekle(`kol-ust-${y}`, [tamam(dirsekB, BEYAZ), ...orj(kol, [ust, dirsekB]), ...orj(G.tisort, [yenKirp]), dikis], k.omuz, 'govde', y === 'sag' ? [-60, 175] : [-175, 60], { kume: `kol-${y}` });
  ekle(`kol-alt-${y}`, [tamam(dirsekB, BEYAZ), tamam(bilekB, BEYAZ), ...orj(kol, [orta, dirsekB, bilekB])], k.dirsek, `kol-ust-${y}`, [-150, 150], { kume: `kol-${y}` });
  ekle(`el-${y}`, [tamam(bilekB, BEYAZ), ...orj(kol, [el, bilekB])], k.bilek, `kol-alt-${y}`, [-45, 45], { kume: `kol-${y}` });
  // kolun üst kenar çizgisi: ayrı katman, motor kol açısıyla görünür yapar (dinlenmede tişört omzu dikişsiz)
  ekle(`kol-ust-${y}-dikis`, [sekil(KOLEVI_CIZGI[y], OL, null, false)], k.omuz, `kol-ust-${y}`);
}

// ---------- yüz setleri (kodla, Kino C'nin kendi çizgisiyle) ----------
const GOZ1 = { cx: 617, cy: 652.5, rx: 84, ry: 117.5, ids: G.gozSag, ten: BEYAZ };
const GOZ2 = { cx: 968.5, cy: 663.5, rx: 94.5, ry: 128.5, ids: G.gozSol, ten: KAHVE };
const yuz = (ad, katman, pivot, yuva) => ekle(ad, katman, pivot, 'kafa', null, { yuva });

// gözler
const gozAyni = (g, f) => g.ids.map((i) => sekil(donustur(P[i].d, f), P[i].f, null, false));
const gozKatman = {
  acik: (g) => orj(g.ids, null, false),
  yari: (g) => {
    // göz kapağı yarıya inmiş: kenarı gözün üst yayına koşut, kubbeli (düz çizgi "kibirli" bakış veriyordu)
    const lidY = g.cy - g.ry * 0.05;
    const zincirK = [[g.cx - g.rx * 1.02, lidY + g.ry * 0.36], [g.cx - g.rx * 0.62, lidY - g.ry * 0.1], [g.cx + g.rx * 0.62, lidY - g.ry * 0.1], [g.cx + g.rx * 1.02, lidY + g.ry * 0.36]];
    const yay = Z.ornekle(zincirK, 40);
    const alt = Z.cokgen([[g.cx - 400, yay[0][1]], ...yay, [g.cx + 400, yay[yay.length - 1][1]], [g.cx + 400, g.cy + 400], [g.cx - 400, g.cy + 400]]);
    const kapak = Z.inceSerit(zincirK, 12, 5);
    return [...orj(g.ids, [alt], false), sekil(kapak, OL, null, false)];
  },
  kapali: (g) => [sekil(Z.inceSerit([[g.cx - g.rx * 0.98, g.cy + g.ry * 0.08], [g.cx - g.rx * 0.45, g.cy + g.ry * 0.42], [g.cx + g.rx * 0.45, g.cy + g.ry * 0.42], [g.cx + g.rx * 0.98, g.cy + g.ry * 0.08]], 15, 6), OL, null, false)],
  mutlu: (g) => [sekil(Z.inceSerit([[g.cx - g.rx * 0.95, g.cy + g.ry * 0.3], [g.cx - g.rx * 0.5, g.cy - g.ry * 0.38], [g.cx + g.rx * 0.5, g.cy - g.ry * 0.38], [g.cx + g.rx * 0.95, g.cy + g.ry * 0.3]], 17, 7), OL, null, false)],
  sola: (g) => gozAyni(g, (s) => s.translate(-g.rx * 0.2, 0)),
  saga: (g) => gozAyni(g, (s) => s.translate(g.rx * 0.2, 0)),
  saskin: (g) => [
    sekil(Z.elips(g.cx, g.cy - g.ry * 0.04, g.rx * 1.06, g.ry * 1.04), BEYAZ, null, true),
    ...gozAyni(g, (s) => s.translate(-g.cx, -g.cy).scale(0.6).translate(g.cx, g.cy + g.ry * 0.06)),
  ],
};
for (const [hal, f] of Object.entries(gozKatman)) yuz(`gozler-${hal}`, [...f(GOZ1), ...f(GOZ2)], [790, 660], 'gozler');

// kaşlar: kaynak kaşlar, döndürülerek / kaldırılarak
const KAS1 = { c: [620.5, 413], d: P[22].d }, KAS2 = { c: [977.5, 439.5], d: P[11].d };
const kas = (k, aci, dy, olcek = 1) => sekil(donustur(k.d, (s) => s.translate(-k.c[0], -k.c[1]).scale(olcek).rotate(aci).translate(k.c[0], k.c[1] + dy)), OL, null, false);
const KASLAR = { notr: [0, 0, 0, 0], kalkik: [-4, -32, 6, -12], uzgun: [-16, -14, 16, -14], kizgin: [18, 10, -18, 10] };
for (const [hal, [a1, y1, a2, y2]] of Object.entries(KASLAR)) yuz(`kaslar-${hal}`, [kas(KAS1, a1, y1, hal === 'kalkik' ? 1.06 : 1), kas(KAS2, a2, y2, hal === 'kalkik' ? 1.06 : 1)], [800, 425], 'kaslar');

// ağızlar: Kino C'nin "w" üst dudağı; açık ağızlar onun altından sarkar
const N = [712, 926]; // çentik (burnun altı)
function acikAgiz({ sol, sag, alt, cukur = 14, dil = 0.5, dis = 0, ustDudak = 1 }) {
  const ust = (a, b, h) => `C${a[0] + (b[0] - a[0]) * 0.3} ${a[1] + h} ${b[0] - (b[0] - a[0]) * 0.28} ${b[1] + h} ${b[0]} ${b[1]}`;
  const ag = `M${sol[0]} ${sol[1]}${ust(sol, N, cukur)}${ust(N, sag, cukur)}` +
    `C${sag[0] + 6} ${sag[1] + (alt - sag[1]) * 0.75} ${N[0] + (sag[0] - N[0]) * 0.55} ${alt} ${N[0] + 4} ${alt}` +
    `C${N[0] - (N[0] - sol[0]) * 0.55} ${alt} ${sol[0] - 6} ${sol[1] + (alt - sol[1]) * 0.75} ${sol[0]} ${sol[1]}Z`;
  const k = [sekil(ag, AGIZ_IC)];
  if (dil > 0) k.push(sekil(Z.elips(N[0] + 10, alt - (alt - N[1]) * dil * 0.3, (sag[0] - sol[0]) * 0.3, (alt - N[1]) * dil * 0.55), DIL, [ag], false));
  if (dis > 0) k.push(sekil(Z.cokgen([[sol[0] - 20, sol[1] - 40], [sag[0] + 20, sag[1] - 40], [sag[0] + 20, N[1] + dis], [sol[0] - 20, N[1] + dis]]), BEYAZ, [ag], false));
  if (ustDudak) {
    // ağız köşelerinde kısa gülüş çizgisi (kaynak gülüşün uçlarındaki gibi)
    const kose = (p, yon) => sekil(Z.inceSerit([[p[0] + yon * 6, p[1] + 4], [p[0] - yon * 4, p[1] - 4], [p[0] - yon * 14, p[1] - 14], [p[0] - yon * 20, p[1] - 26]], 12, 6), OL, null, false);
    k.push(kose(sol, 1), kose(sag, -1));
  }
  return k;
}
const AGIZLAR = {
  gulumse: orj(G.agiz, null, false),
  az: acikAgiz({ sol: [662, 914], sag: [782, 914], alt: 968, cukur: 10, dil: 0.5, ustDudak: 0 }),
  orta: acikAgiz({ sol: [640, 905], sag: [812, 905], alt: 1000, cukur: 14, dil: 0.6, ustDudak: 0 }),
  genis: acikAgiz({ sol: [618, 896], sag: [842, 896], alt: 1040, cukur: 16, dil: 0.7 }),
  o: [sekil(Z.elips(716, 958, 40, 50), AGIZ_IC), sekil(Z.elips(720, 990, 26, 16), DIL, [Z.elips(716, 958, 40, 50)], false)],
  e: acikAgiz({ sol: [628, 906], sag: [830, 906], alt: 968, cukur: 8, dil: 0.25, dis: 22, ustDudak: 0 }),
  kahkaha: acikAgiz({ sol: [598, 884], sag: [880, 882], alt: 1062, cukur: 18, dil: 0.75 }),
  uzgun: [sekil(Z.inceSerit([[640, 962], [668, 930], [760, 924], [792, 958]], 15, 7), OL, null, false)],
};
for (const [hal, k] of Object.entries(AGIZLAR)) yuz(`agiz-${hal}`, k, [N[0], 940], 'agiz');

// ---------- çizim sırası (arkadan öne); kume: iki geçişli birleşik çizim ----------
const KUMELER = {
  bacaklar: ['bacak-alt-sag', 'bacak-alt-sol', 'bacak-ust-sag', 'bacak-ust-sol', 'kalca'],
  'kol-sag': ['el-sag', 'kol-alt-sag', 'kol-ust-sag'],
  'kol-sol': ['el-sol', 'kol-alt-sol', 'kol-ust-sol'],
};
const SIRA = ['kuyruk', { kume: 'bacaklar' }, 'ayak-sag', 'ayak-sol', 'govde', 'fular', 'kafa', 'yanaklar', 'burun', 'gozler', 'kaslar', 'agiz', 'kulak-sag', 'kulak-sol', { kume: 'kol-sag' }, 'kol-ust-sag-dikis', { kume: 'kol-sol' }, 'kol-ust-sol-dikis'];
const YUVA_VARSAYILAN = { gozler: 'gozler-acik', kaslar: 'kaslar-notr', agiz: 'agiz-gulumse' };

// ---------- SVG ----------
function svgIcerik(p, onek) {
  const klip = new Map();
  const kid = (k) => {
    if (!k) return '';
    const key = k.join('|');
    if (!klip.has(key)) klip.set(key, `${onek}-k${klip.size}`);
    return ` clip-path="url(#${klip.get(key)})"`;
  };
  // Bloklar: aynı kırpmayı paylaşan ardışık katmanlar tek grupta (önce çizgileri, sonra dolguları); kırpma grubun
  // tamamına uygulanır. Böylece kesim kenarında çizgi ile dolgu üst üste yarı saydam kalmaz (ince koyu sızıntı yok).
  // Tamamlamalar (alt) kendi bloklarında, kaynak katmanların altında; kaynağın iç çizgileri (parmak, dikiş) üstte.
  const kalem = `fill="${OL}" stroke="${OL}" stroke-width="${CIZGI}" stroke-linejoin="round" stroke-linecap="round"`;
  const iz = (e) => (e.iz ? ` stroke="${e.f}" stroke-width="${e.iz}" stroke-linejoin="round"` : '');
  const sirali = [...p.katman.filter((e) => e.alt), ...p.katman.filter((e) => !e.alt)];
  const bloklar = [];
  for (const e of sirali) {
    const anahtar = `${!!e.alt}|${e.k ? e.k.join('|') : ''}`;
    const son = bloklar[bloklar.length - 1];
    if (son && son.anahtar === anahtar) son.e.push(e);
    else bloklar.push({ anahtar, k: e.k, e: [e] });
  }
  let tam = '', yalniz = '';
  for (const bl of bloklar) {
    const cz = bl.e.filter((e) => e.c).map((e) => (e.kc ? `<g${kid(e.kc)}><path d="${e.d}"/></g>` : `<path d="${e.d}"/>`)).join('');
    const dl = bl.e.map((e) => `<path d="${e.d}" fill="${e.f}"${iz(e)}/>`).join('');
    tam += `<g${kid(bl.k)}>${cz ? `<g ${kalem}>${cz}</g>` : ''}${dl}</g>`;
    yalniz += `<g${kid(bl.k)}>${dl}</g>`;
  }
  const tumu = 'M-9000 -9000H9000V9000H-9000Z';
  const defs = [...klip.entries()]
    .map(([key, id]) => {
      const yol = (d) => (d.startsWith('!') ? `<path clip-rule="evenodd" d="${tumu}${d.slice(1)}"/>` : d.startsWith('~') ? `<path clip-rule="evenodd" d="${d.slice(1)}"/>` : `<path d="${d}"/>`);
      return `<clipPath id="${id}">${key.split('|').map(yol).join('')}</clipPath>`;
    })
    .join('');
  return {
    defs: defs ? `<defs>${defs}</defs>` : '',
    /** tam görünüş (çizgi + dolgu, bloklar halinde) */
    cizgi: `<g id="parca">${tam}</g>`,
    dolgu: '',
    /** yalnız dolgular (dolgu katmanı hesabı için) */
    yalniz: `<g>${yalniz}</g>`,
  };
}
const svgSar = (vb, ic, olcek = 1) => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${vb.join(' ')}" width="${Math.round(vb[2] * olcek)}" height="${Math.round(vb[3] * olcek)}">${ic}</svg>`;

// ---------- raster yardımcıları ----------
async function rgba(svg) {
  const { data, info } = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}
function kutuBul({ data, w, h }) {
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > 2) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return x1 < 0 ? null : [x0, y0, x1 + 1, y1 + 1];
}
/** kare uzaklık dönüşümü (Felzenszwalb), maske=1 noktalara uzaklık² */
function uzaklik(maske, w, h) {
  const INF = 1e12, f = new Float64Array(Math.max(w, h)), d = new Float64Array(Math.max(w, h)), v = new Int32Array(Math.max(w, h)), z = new Float64Array(Math.max(w, h) + 1);
  const out = new Float64Array(w * h);
  for (let i = 0; i < w * h; i++) out[i] = maske[i] ? 0 : INF;
  const tek = (n) => {
    let k = 0; v[0] = 0; z[0] = -Infinity; z[1] = Infinity;
    for (let q = 1; q < n; q++) {
      let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
      k++; v[k] = q; z[k] = s; z[k + 1] = Infinity;
    }
    k = 0;
    for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) * (q - v[k]) + f[v[k]]; }
  };
  for (let x = 0; x < w; x++) { for (let y = 0; y < h; y++) f[y] = out[y * w + x]; tek(h); for (let y = 0; y < h; y++) out[y * w + x] = d[y]; }
  for (let y = 0; y < h; y++) { for (let x = 0; x < w; x++) f[x] = out[y * w + x]; tek(w); for (let x = 0; x < w; x++) out[y * w + x] = d[x]; }
  return out;
}
/**
 * Dolgu katmanı: dış çizgisiz, iç çizgiler (parmak, kol ağzı…) duruyor. Dolgu maskesinin kapanışı (r=7 px)
 * içindeki boşluklar iç çizgidir: oralarda tam görsel, dışarıda yalnız dolgu.
 */
function dolguYap(tam, yalniz, w, h, r = 7) {
  const n = w * h, m = new Uint8Array(n);
  for (let i = 0; i < n; i++) m[i] = yalniz[i * 4 + 3] > 127 ? 1 : 0;
  const d1 = uzaklik(m, w, h);
  const genis = new Uint8Array(n);
  for (let i = 0; i < n; i++) genis[i] = d1[i] <= r * r ? 0 : 1; // genişletmenin dışı
  const d2 = uzaklik(genis, w, h);
  const out = Buffer.from(yalniz);
  const ic = (r + 1.5) * (r + 1.5);
  for (let i = 0; i < n; i++) {
    // kapanış içinde ve kenardan en az 1.5 px içeride; dolgu tam örtmüyorsa: iç çizgi
    if (d2[i] > ic && yalniz[i * 4 + 3] < 250) { out[i * 4] = tam[i * 4]; out[i * 4 + 1] = tam[i * 4 + 1]; out[i * 4 + 2] = tam[i * 4 + 2]; out[i * 4 + 3] = tam[i * 4 + 3]; }
  }
  return out;
}

// ---------- üret ----------
(async () => {
  fs.mkdirSync(CIKTI, { recursive: true });
  fs.mkdirSync(ONIZLEME, { recursive: true });
  const bilgi = {};
  const tamSvg = []; // dinlenme duruşu birleşik önizleme için
  for (const p of parcalar) {
    const ic = svgIcerik(p, p.ad);
    // kutu: çeyrek ölçekte kaba, sonra pay
    const kaba = await rgba(svgSar([0, 0, W, H], ic.defs + ic.cizgi + ic.dolgu, 0.25));
    const k = kutuBul(kaba);
    if (!k) throw new Error(`boş parça: ${p.ad}`);
    const vb = [Math.max(0, k[0] * 4 - 8), Math.max(0, k[1] * 4 - 8), 0, 0];
    vb[2] = Math.min(W, k[2] * 4 + 8) - vb[0];
    vb[3] = Math.min(H, k[3] * 4 + 8) - vb[1];
    const svg = svgSar(vb, ic.defs + ic.cizgi + ic.dolgu);
    fs.writeFileSync(path.join(CIKTI, `${p.ad}.svg`), svg);
    const tam = await rgba(svg);
    await sharp(tam.data, { raw: { width: tam.w, height: tam.h, channels: 4 } }).webp({ lossless: true, effort: 5 }).toFile(path.join(CIKTI, `${p.ad}.webp`));
    const b = { resim: `${p.ad}.webp`, kutu: vb, pivot: p.pivot, ust: p.ust };
    if (p.sinir) b.sinir = p.sinir;
    if (p.yuva) b.yuva = p.yuva;
    if (p.kume) {
      const yalniz = await rgba(svgSar(vb, ic.defs + ic.yalniz));
      const dol = dolguYap(tam.data, yalniz.data, tam.w, tam.h);
      await sharp(dol, { raw: { width: tam.w, height: tam.h, channels: 4 } }).webp({ lossless: true, effort: 5 }).toFile(path.join(CIKTI, `${p.ad}.dolgu.webp`));
      b.kume = p.kume;
      b.dolgu = `${p.ad}.dolgu.webp`;
    }
    bilgi[p.ad] = b;
    tamSvg.push({ ad: p.ad, ic });
    console.log(p.ad.padEnd(18), vb.join(','));
  }

  // iskelet
  const sira = [];
  for (const s of SIRA) {
    if (typeof s === 'string') {
      const varyant = parcalar.filter((p) => p.yuva === s).map((p) => p.ad);
      sira.push(...(varyant.length ? varyant : [s]));
    } else sira.push(...KUMELER[s.kume]);
  }
  const yuvalar = {};
  for (const p of parcalar) if (p.yuva) (yuvalar[p.yuva] ??= { varsayilan: YUVA_VARSAYILAN[p.yuva], secenekler: [] }).secenekler.push(p.ad);
  const iskelet = {
    ad: 'kino-yeni',
    aciklama: 'Kino C kesme kukla kiti (ön görünüş). Koordinatlar 1792x2432 karesinde; açı derece, + saat yönü. Sol/sağ karakterin kendi solu/sağı (sag = ekranın solu).',
    kaynak: 'ekip/film/seri-2/karakter/v1/kino-on-c.svg',
    kur: 'ekip/karakter/kino-yeni/kit-kur.cjs',
    boyut: [W, H],
    zemin: 2290,
    cizgi: { renk: '#401312', kalinlik: CIZGI / 2 },
    parcalar: bilgi,
    cizim: SIRA.map((s) => (typeof s === 'string' ? (yuvalar[s] ? { yuva: s } : s) : { kume: s.kume, parcalar: KUMELER[s.kume] })),
    yuvalar,
    // eski iskelet biçimiyle (assets/karakter-iskelet) uyumlu özet alanlar
    sira,
    gizli: parcalar.filter((p) => p.yuva && YUVA_VARSAYILAN[p.yuva] !== p.ad).map((p) => p.ad).concat(['kol-ust-sag-dikis', 'kol-ust-sol-dikis']),
    bagli: Object.fromEntries(parcalar.filter((p) => p.ust).map((p) => [p.ad, p.ust])),
    donme: Object.fromEntries(parcalar.map((p) => [p.ad, p.pivot])),
  };
  fs.writeFileSync(path.join(CIKTI, 'kino-yeni.json'), JSON.stringify(iskelet, null, 1));

  // ---------- önizleme: dinlenme duruşu (iki geçişli) + kaynakla fark ----------
  const ic = (ad) => tamSvg.find((t) => t.ad === ad).ic;
  let govde = '';
  for (const s of iskelet.cizim) {
    if (typeof s === 'string') { if (iskelet.gizli.includes(s)) continue; const i = ic(s); govde += i.defs + i.cizgi + i.dolgu; }
    else if (s.yuva) { const i = ic(YUVA_VARSAYILAN[s.yuva]); govde += i.defs + i.cizgi + i.dolgu; }
    else {
      for (const a of s.parcalar) { const i = ic(a); govde += i.defs + i.cizgi + i.dolgu; }
      // dolgu geçişi: raster dolgu görselleri
      for (const a of s.parcalar) {
        const b = bilgi[a];
        const veri = (await sharp(path.join(CIKTI, b.dolgu)).png().toBuffer()).toString('base64');
        govde += `<image x="${b.kutu[0]}" y="${b.kutu[1]}" width="${b.kutu[2]}" height="${b.kutu[3]}" xlink:href="data:image/png;base64,${veri}"/>`;
      }
    }
  }
  const zemin = `<rect width="${W}" height="${H}" fill="${BEYAZ}"/>`;
  await sharp(Buffer.from(svgSar([0, 0, W, H], zemin + govde))).resize(896).png().toFile(path.join(ONIZLEME, 'dinlenme.png'));
  const orjSvg = svgSar([0, 0, W, H], zemin + P.slice(1).map((p) => `<path d="${p.d}" fill="${p.f}"/>`).join(''));
  const a = await rgba(svgSar([0, 0, W, H], zemin + govde)), o = await rgba(orjSvg);
  const fark = Buffer.alloc(W * H * 3, 255);
  let n = 0;
  for (let i = 0; i < W * H; i++) {
    const d = Math.abs(a.data[i * 4] - o.data[i * 4]) + Math.abs(a.data[i * 4 + 1] - o.data[i * 4 + 1]) + Math.abs(a.data[i * 4 + 2] - o.data[i * 4 + 2]);
    if (d > 150) { n++; fark[i * 3 + 1] = 0; fark[i * 3 + 2] = 0; }
  }
  await sharp(fark, { raw: { width: W, height: H, channels: 3 } }).resize(896).png().toFile(path.join(ONIZLEME, 'fark.png'));
  console.log(`kaynakla fark: ${n} piksel (%${((100 * n) / (W * H)).toFixed(3)})`);

  // ---------- yüz seti sayfası: her seçenek kafanın üstünde ----------
  const tam = (ad) => { const i = ic(ad); return i.defs + i.cizgi + i.dolgu; };
  const karolar = [];
  for (const [yuva, ilk] of Object.entries(YUVA_VARSAYILAN)) {
    for (const ad of yuvalar[yuva].secenekler) {
      const sec = { ...YUVA_VARSAYILAN, [yuva]: ad };
      if (yuva === 'agiz' && ad === 'agiz-kahkaha') sec.gozler = 'gozler-mutlu';
      const icerik = zemin + tam('kafa') + tam('yanaklar') + tam('burun') + tam(sec.gozler) + tam(sec.kaslar) + tam(sec.agiz) + tam('kulak-sag') + tam('kulak-sol');
      const png = await sharp(Buffer.from(svgSar([330, 240, 940, 900], icerik, 0.36))).png().toBuffer();
      karolar.push({ ad, png });
    }
    void ilk;
  }
  const KW = Math.round(940 * 0.36), KH = Math.round(900 * 0.36) + 30, SUT = 6;
  const sayfa = sharp({ create: { width: KW * SUT, height: KH * Math.ceil(karolar.length / SUT), channels: 3, background: '#ffffff' } });
  const parcaGorsel = [];
  for (let i = 0; i < karolar.length; i++) {
    const x = (i % SUT) * KW, y = Math.floor(i / SUT) * KH;
    parcaGorsel.push({ input: karolar[i].png, left: x, top: y });
    parcaGorsel.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${KW}" height="30"><text x="${KW / 2}" y="20" font-size="18" font-family="sans-serif" text-anchor="middle" fill="#401312">${karolar[i].ad}</text></svg>`), left: x, top: y + KH - 30 });
  }
  await sayfa.composite(parcaGorsel).png().toFile(path.join(ONIZLEME, 'yuz-setleri.png'));
})().catch((e) => { console.error(e); process.exit(1); });
