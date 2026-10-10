/**
 * Kino ailesi kitleri için ortak kaynak: Kino C vektörünün (ekip/film/seri-2/karakter/v1/kino-on-c.svg) yolları,
 * renkleri ve Kino kitindeki (ekip/karakter/kino-yeni/kit-kur.cjs) yüz setleri, el, kuyruk, kulak çizimleri.
 *
 * Aile (Anne, Baba, Lokum) bunlardan türer: aynı çizgi (alttan 17 px fırça), aynı renkler, aynı göz / burun / ağız /
 * el / kulak / kuyruk biçimi; yalnız yerleri, ölçüleri ve renkleri değişir. Yeni parçalar (kafa biçimi, kıyafet, bacak)
 * kitlerin kendi betiklerinde çizilir.
 *
 * Katman: { d, f, k?, c?, alt?, kc?, iz? }
 *   d yol, f dolgu, k kırpma listesi (birleşim; '!' önekli: dışı), c alttan çizgi, alt tamamlama (kaynağın altında),
 *   kc yalnız çizgi kırpması, iz dolgu renginde ek fırça (ince çizgileri kalınlaştırmak için).
 */
const fs = require('fs');
const path = require('path');
const svgpath = require('svgpath');
const Z = require('../kino-yeni/cizim.cjs');

const KOK = path.resolve(__dirname, '..', '..', '..');
const KAYNAK = path.join(KOK, 'ekip/film/seri-2/karakter/v1/kino-on-c.svg');
const KW = 1792;

// ---------- renkler (Kino C) ----------
const R = {
  OL: 'rgb(64,19,18)',
  BEYAZ: 'rgb(252,251,249)',
  BEJ: 'rgb(221,180,164)',
  KAHVE: 'rgb(220,124,78)',
  KOYU: 'rgb(159,55,45)',
  GOZ: 'rgb(23,8,10)',
  AGIZ_IC: 'rgb(122,32,36)',
  DIL: 'rgb(240,112,104)',
  YANAK: 'rgb(250,86,77)',
  GRI: 'rgb(196,190,204)',
  BURUN: 'rgb(86,39,38)',
};

const kaynak = fs.readFileSync(KAYNAK, 'utf8');
/** kaynak yollar (en/boy düzeltilmiş, Kino karesinde) */
const P = [...kaynak.matchAll(/<path[^>]*fill="([^"]*)"[^>]*d="([^"]*)"/g)].map((m) => ({ f: m[1], d: svgpath(m[2]).scale(KW / 2432, 1).round(2).toString() }));
if (P.length !== 87) throw new Error(`beklenmeyen yol sayısı: ${P.length}`);

const G = {
  kafa: [2, 3],
  gozLeke: [5, 6],
  kulakSag: [35, 36, 37],
  kulakSol: [30, 31],
  gozSag: [12, 15, 16, 17],
  gozSol: [7, 8, 9, 10],
  burun: [13, 14, 18, 19, 23],
  agiz: [21],
  yanakSag: [20],
  yanakSol: [4],
  kolSag: [42, 43, 44, 45, 46],
  kolSol: [38, 39, 40, 41],
  kuyruk: [55, 56, 57, 58],
};

// ---------- katman yardımcıları ----------
const orj = (ids, k = null, c = true) => ids.map((i) => ({ d: P[i].d, f: P[i].f, k, c }));
const sekil = (d, f, k = null, c = true) => ({ d, f, k, c });
const tamam = (d, f, k = null) => ({ d, f, k, c: true, alt: true });
const cizgi = (d, k = null) => ({ d, f: R.OL, k, c: false });
const donustur = (d, f) => f(svgpath(d)).round(2).toString();

/**
 * Katmanları dönüştürür (yol ve kırpmalar). f: svgpath → svgpath.
 * olcek: dönüşümün ölçeği; koyu (çizgi rengindeki) ince şekiller ölçekle incelmesin diye `iz` eklenir
 * (kalinlik: kaynaktaki çizgi kalınlığı tahmini).
 */
function tasi(katmanlar, f, { olcek = 1, kalinlik = 10, renk = null } = {}) {
  const kirp = (k) => (k ? k.map((s) => (s[0] === '!' || s[0] === '~' ? s[0] + donustur(s.slice(1), f) : donustur(s, f))) : k);
  return katmanlar.map((e) => {
    const yeni = { ...e, d: donustur(e.d, f), k: kirp(e.k), kc: kirp(e.kc) };
    if (renk && renk[e.f]) yeni.f = renk[e.f];
    if (olcek < 1 && (e.f === R.OL || e.f === R.GOZ) && !e.c) yeni.iz = (e.iz ?? 0) * olcek + kalinlik * (1 - olcek);
    return yeni;
  });
}
/** merkez c çevresinde ölçek s, sonra hedef h'ye taşı (isteğe bağlı açı, derece) */
const yerlestir = (c, h, s, aci = 0, sy = s) => (p) => p.translate(-c[0], -c[1]).scale(s, sy).rotate(aci).translate(h[0], h[1]);
/** dikey eksende ayna (x = eksen) */
const ayna = (eksen) => (p) => p.translate(-eksen, 0).scale(-1, 1).translate(eksen, 0);

// ---------- el (Kino kiti: kol-alt'ın ötesi, bilek bilyesiyle) ----------
const KOL = {
  sag: { ust: [522, 1388], dirsek: [483, 1515], bilek: [452, 1640], bilekR: 54 },
  sol: { ust: [1185, 1415], dirsek: [1226, 1527], bilek: [1253, 1640], bilekR: 98 },
};
/** Kino'nun eli (Kino karesinde): bilek noktası ve kol ekseni ile */
function el(y) {
  const k = KOL[y];
  const eksen = [k.bilek[0] - k.ust[0], k.bilek[1] - k.ust[1]];
  const bilekB = Z.daire(...k.bilek, k.bilekR);
  const yari = Z.yariDuzlem(k.bilek, eksen);
  return { katman: [tamam(bilekB, R.BEYAZ), ...orj(y === 'sag' ? G.kolSag : G.kolSol, [yari, bilekB])], bilek: k.bilek, aci: (Math.atan2(eksen[1], eksen[0]) * 180) / Math.PI };
}
/**
 * Eli yeni bileğe taşır: ölçek s, yeni kol ekseni açısı (derece, atan2 ile; aşağı = 90). Kino'nun sağ eli (ekranın solu)
 * ya da sol eli. Çizgi kalınlığı fırçadan geldiği için ölçekle değişmez; parmak çizgileri iz ile korunur.
 */
function elYerlestir(y, bilek, s, eksenAci, olgun = null) {
  const e = el(y);
  const yer = yerlestir(e.bilek, bilek, s, eksenAci - e.aci);
  if (!olgun) return tasi(e.katman, yer, { olcek: s });
  const b = elBukucu(e.bilek, e.aci, olgun);
  return tasi(e.katman, (p) => yer(b(p)), { olcek: s });
}

/**
 * Yetişkin eli (Kino'nun eli, olgunlaştırılmış): bilekten kol ekseni boyunca u, ona dik v. Avuç (u < u0) aynen kalır;
 * parmaklar (u > u0) yumuşak bir geçişle `parmak` oranında uzar, el `en` oranında incelir. Çizim yöntemi ve çizgi
 * aynı (Kino'nun yolları büküldü): yalnız oran yetişkin. olgun: { parmak: 0.3, en: 0.9, u0: 70, gecis: 50 }
 */
function elBukucu(merkez, aciDer, { parmak = 0.3, en = 0.9, u0 = 70, gecis = 50, avucEn = null } = {}) {
  const a = (aciDer * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
  const uzat = (z) => (z <= 0 ? 0 : z < gecis ? (z * z) / (2 * gecis) : z - gecis / 2);
  const harita = (x, yy) => {
    const dx = x - merkez[0], dy = yy - merkez[1];
    const u = dx * ca + dy * sa, v = -dx * sa + dy * ca;
    const u2 = u + parmak * uzat(u - u0);
    // avuç (bilek yanı) avucEn ile, parmaklar en ile incelir; arası yumuşak
    const t = Math.max(0, Math.min(1, (u - u0 * 0.3) / (u0 * 1.2)));
    const v2 = v * ((avucEn ?? en) + (en - (avucEn ?? en)) * t * t * (3 - 2 * t));
    return [merkez[0] + u2 * ca - v2 * sa, merkez[1] + u2 * sa + v2 * ca];
  };
  return (p) => p.abs().unarc().unshort().iterate((sg, i, x, yy) => {
    const c = sg[0];
    if (c === 'H') { const q = harita(sg[1], yy); return [['L', q[0], q[1]]]; }
    if (c === 'V') { const q = harita(x, sg[1]); return [['L', q[0], q[1]]]; }
    for (let k = 1; k + 1 < sg.length; k += 2) { const q = harita(sg[k], sg[k + 1]); sg[k] = q[0]; sg[k + 1] = q[1]; }
    return undefined;
  });
}

// ---------- kuyruk ----------
const KUYRUK_TAMAM = Z.puruzsuzKapali([[1350, 1528], [1405, 1565], [1408, 1640], [1360, 1690], [1280, 1722], [1200, 1734], [1168, 1700], [1230, 1640], [1300, 1574]]);
const KUYRUK_KOK = [1372, 1648];
const kuyruk = () => [tamam(KUYRUK_TAMAM, R.KAHVE), ...orj(G.kuyruk)];

// ---------- kulak (ekranın sağındaki Kino kulağı: tam damla + perçem) ----------
const KULAK_KOK = [1186, 410];
const kulak = () => orj(G.kulakSol);

// ---------- yüz setleri (Kino karesinde; kit-kur.cjs ile aynı çizimler) ----------
const GOZ1 = { cx: 617, cy: 652.5, rx: 84, ry: 117.5, ids: G.gozSag };
const GOZ2 = { cx: 968.5, cy: 663.5, rx: 94.5, ry: 128.5, ids: G.gozSol };
const gozAyni = (g, f) => g.ids.map((i) => sekil(donustur(P[i].d, f), P[i].f, null, false));
/** göz halleri; ten: göz kapağının rengi (yari) */
const GOZ_HALLERI = {
  acik: (g) => orj(g.ids, null, false),
  yari: (g, ten) => {
    const lidY = g.cy - g.ry * 0.05;
    const zincirK = [[g.cx - g.rx * 1.02, lidY + g.ry * 0.36], [g.cx - g.rx * 0.62, lidY - g.ry * 0.1], [g.cx + g.rx * 0.62, lidY - g.ry * 0.1], [g.cx + g.rx * 1.02, lidY + g.ry * 0.36]];
    const yay = Z.ornekle(zincirK, 40);
    const alt = Z.cokgen([[g.cx - 400, yay[0][1]], ...yay, [g.cx + 400, yay[yay.length - 1][1]], [g.cx + 400, g.cy + 400], [g.cx - 400, g.cy + 400]]);
    void ten;
    return [...orj(g.ids, [alt], false), sekil(Z.inceSerit(zincirK, 12, 5), R.OL, null, false)];
  },
  kapali: (g) => [sekil(Z.inceSerit([[g.cx - g.rx * 0.98, g.cy + g.ry * 0.08], [g.cx - g.rx * 0.45, g.cy + g.ry * 0.42], [g.cx + g.rx * 0.45, g.cy + g.ry * 0.42], [g.cx + g.rx * 0.98, g.cy + g.ry * 0.08]], 15, 6), R.OL, null, false)],
  mutlu: (g) => [sekil(Z.inceSerit([[g.cx - g.rx * 0.95, g.cy + g.ry * 0.3], [g.cx - g.rx * 0.5, g.cy - g.ry * 0.38], [g.cx + g.rx * 0.5, g.cy - g.ry * 0.38], [g.cx + g.rx * 0.95, g.cy + g.ry * 0.3]], 17, 7), R.OL, null, false)],
  sola: (g) => gozAyni(g, (s) => s.translate(-g.rx * 0.2, 0)),
  saga: (g) => gozAyni(g, (s) => s.translate(g.rx * 0.2, 0)),
  saskin: (g) => [
    sekil(Z.elips(g.cx, g.cy - g.ry * 0.04, g.rx * 1.06, g.ry * 1.04), R.BEYAZ, null, true),
    ...gozAyni(g, (s) => s.translate(-g.cx, -g.cy).scale(0.6).translate(g.cx, g.cy + g.ry * 0.06)),
  ],
};
const KAS1 = { c: [620.5, 413], d: P[22].d };
const KAS2 = { c: [977.5, 439.5], d: P[11].d };
const KAS_HALLERI = { notr: [0, 0, 0, 0], kalkik: [-4, -32, 6, -12], uzgun: [-16, -14, 16, -14], kizgin: [18, 10, -18, 10] };
/** tek kaş (Kino karesinde, kendi merkezinde): hal açısı ve kayması */
const kas = (k, aci, dy, olcek = 1) => sekil(donustur(k.d, (s) => s.translate(-k.c[0], -k.c[1]).scale(olcek).rotate(aci).translate(k.c[0], k.c[1] + dy)), R.OL, null, false);

const N = [712, 926]; // ağız çentiği (burnun altı)
function acikAgiz({ sol, sag, alt, cukur = 14, dil = 0.5, dis = 0, ustDudak = 1 }) {
  const ust = (a, b, h) => `C${a[0] + (b[0] - a[0]) * 0.3} ${a[1] + h} ${b[0] - (b[0] - a[0]) * 0.28} ${b[1] + h} ${b[0]} ${b[1]}`;
  const ag = `M${sol[0]} ${sol[1]}${ust(sol, N, cukur)}${ust(N, sag, cukur)}` +
    `C${sag[0] + 6} ${sag[1] + (alt - sag[1]) * 0.75} ${N[0] + (sag[0] - N[0]) * 0.55} ${alt} ${N[0] + 4} ${alt}` +
    `C${N[0] - (N[0] - sol[0]) * 0.55} ${alt} ${sol[0] - 6} ${sol[1] + (alt - sol[1]) * 0.75} ${sol[0]} ${sol[1]}Z`;
  const k = [sekil(ag, R.AGIZ_IC)];
  if (dil > 0) k.push(sekil(Z.elips(N[0] + 10, alt - (alt - N[1]) * dil * 0.3, (sag[0] - sol[0]) * 0.3, (alt - N[1]) * dil * 0.55), R.DIL, [ag], false));
  if (dis > 0) k.push(sekil(Z.cokgen([[sol[0] - 20, sol[1] - 40], [sag[0] + 20, sag[1] - 40], [sag[0] + 20, N[1] + dis], [sol[0] - 20, N[1] + dis]]), R.BEYAZ, [ag], false));
  if (ustDudak) {
    const kose = (p, yon) => sekil(Z.inceSerit([[p[0] + yon * 6, p[1] + 4], [p[0] - yon * 4, p[1] - 4], [p[0] - yon * 14, p[1] - 14], [p[0] - yon * 20, p[1] - 26]], 12, 6), R.OL, null, false);
    k.push(kose(sol, 1), kose(sag, -1));
  }
  return k;
}
/** Kino'nun 8 ağzı (Kino karesinde, çentik N) */
const agizlar = () => ({
  gulumse: orj(G.agiz, null, false),
  az: acikAgiz({ sol: [662, 914], sag: [782, 914], alt: 968, cukur: 10, dil: 0.5, ustDudak: 0 }),
  orta: acikAgiz({ sol: [640, 905], sag: [812, 905], alt: 1000, cukur: 14, dil: 0.6, ustDudak: 0 }),
  genis: acikAgiz({ sol: [618, 896], sag: [842, 896], alt: 1040, cukur: 16, dil: 0.7 }),
  o: [sekil(Z.elips(716, 958, 40, 50), R.AGIZ_IC), sekil(Z.elips(720, 990, 26, 16), R.DIL, [Z.elips(716, 958, 40, 50)], false)],
  e: acikAgiz({ sol: [628, 906], sag: [830, 906], alt: 968, cukur: 8, dil: 0.25, dis: 22, ustDudak: 0 }),
  kahkaha: acikAgiz({ sol: [598, 884], sag: [880, 882], alt: 1062, cukur: 18, dil: 0.75 }),
  uzgun: [sekil(Z.inceSerit([[640, 962], [668, 930], [760, 924], [792, 958]], 15, 7), R.OL, null, false)],
});

/**
 * Yüz setleri yeni yüze: gözler (iki göz ayrı merkez), kaşlar, ağız.
 * o: { goz: [[x,y],[x,y]], gozS, kas: [[x,y],[x,y]], kasS, agizN: [x,y], agizS, gozEk?(hal, gozIndeksi, yerlesik) → ek katman }
 * Gözlerin ikisi de Kino'nun ekranın solundaki gözünden (GOZ1): parıltılar aynı yanda, ışık tutarlı.
 */
function yuzSetleri(o) {
  const goz = {};
  for (const [hal, f] of Object.entries(GOZ_HALLERI)) {
    const katman = [];
    o.goz.forEach((h, i) => {
      const g = GOZ1;
      const sx = o.gozS * (o.gozSx ?? 1), sy = o.gozS;
      const tr = (p) => p.translate(-g.cx, -g.cy).scale(sx, sy).translate(h[0], h[1]);
      katman.push(...tasi(f(g, o.ten), tr, { olcek: o.gozS }));
      if (o.gozEk) katman.push(...o.gozEk(hal, i, h));
    });
    goz[hal] = katman;
  }
  const kaslar = {};
  for (const [hal, [a1, y1, a2, y2]] of Object.entries(KAS_HALLERI)) {
    const ol = hal === 'kalkik' ? 1.06 : 1;
    // iki kaş da Kino'nun sol kaşından (KAS1) aynalanmadan: sağdaki ayna gerekir (kaş yönü)
    const k1 = tasi([kas(KAS1, a1, y1 * (o.kasDy ?? 1), ol)], (p) => p.translate(-KAS1.c[0], -KAS1.c[1]).scale(o.kasS).translate(o.kas[0][0], o.kas[0][1]), { olcek: o.kasS, kalinlik: o.kasKalin ?? 10 });
    const k2 = tasi([kas(KAS1, -a2, y2 * (o.kasDy ?? 1), ol)], (p) => p.translate(-KAS1.c[0], -KAS1.c[1]).scale(-o.kasS, o.kasS).translate(o.kas[1][0], o.kas[1][1]), { olcek: o.kasS, kalinlik: o.kasKalin ?? 10 });
    if (o.kasIz) for (const e of [...k1, ...k2]) e.iz = (e.iz ?? 0) + o.kasIz;
    kaslar[hal] = [...k1, ...k2];
  }
  const ag = {};
  for (const [hal, k] of Object.entries(agizlar())) {
    ag[hal] = tasi(k, (p) => p.translate(-N[0], -N[1]).scale(o.agizS * (o.agizSx ?? 1), o.agizS).translate(o.agizN[0], o.agizN[1]), { olcek: o.agizS, kalinlik: 11 });
    if (o.agizEk) ag[hal].push(...o.agizEk(hal));
  }
  return { goz, kaslar, agiz: ag };
}

module.exports = { R, P, G, Z, KW, orj, sekil, tamam, cizgi, donustur, tasi, yerlestir, ayna, el, elYerlestir, elBukucu, KOL, kuyruk, KUYRUK_KOK, kulak, KULAK_KOK, GOZ1, GOZ2, GOZ_HALLERI, KAS1, KAS2, KAS_HALLERI, kas, N, agizlar, acikAgiz, yuzSetleri };
