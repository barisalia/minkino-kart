/**
 * Yandan yürüyüş döngüsü: saf hesap (DOM yok, birim testli). mino-profil.ts her karede bunu çizer; ortak
 * "yandan yürüyen karakter" (src/karakter/yandan.ts: köpek, ileride tavşan, ördek …) aynı döngüyü kendi
 * geometrisiyle (yuruyusGeometrisi: dönme noktaları, pati zarfı, ölçüler) kullanır. Varsayılan geometri Mino'nunki.
 *
 * Bir döngü (faz 0..1) = iki adım. Her adım çizgi film yürüyüşünün dört evresinden geçer (adım fazı φ):
 *  - TEMAS    (φ = 0)    : öndeki pati basar, arkadaki geride parmak ucunda; bacaklar en açık
 *  - ÇÖKÜŞ    (φ ≈ 0.15) : ağırlık öndeki bacağa biner, gövde basılır (en alçak, hafif yayvan)
 *  - GEÇİŞ    (φ = 0.5)  : basan bacak dik, havadaki bacak kalkık hâlde onun yanından öne geçer
 *  - YÜKSELİŞ (φ ≈ 0.7)  : basan bacak iter, gövde en yüksek ve uzamış, öne biraz daha eğik
 * Bacaklar kalçadaki dönme noktasından DÖNER. Tasarımcının çiziminde bacaklar dinlenmede kalçanın altında
 * (ortalanmış), iki patinin tabanı aynı zeminde ve iki kalça yan yana (yatayda 115 birim); kalça kökleri iki yöne
 * de ±25°'ye kadar temiz: öne ve geriye eşit açılır.
 * Basan bacakta açının sinüsü zamanla doğrusal: gövde sabit hızla giderken basan pati yerde kaymaz.
 * İki adım eşit: her bacağın açısı, kendi boyuyla aynı adım yolunu alacak kadardır (yakın bacak ±24°, uzak bacak
 * 10 birim uzun olduğu için ±23°); gövde iki adımda da aynı yolu alır, aynı iner-kalkar.
 * Havadaki bacak ease'li döner (itişin devamıyla biraz geri, sonra öne uzanıp yerine oturur) ve kalkar.
 * Kollar bacakların tersine, kuyruk / kulaklar / fular gövdenin iniş-çıkışını geriden izler (follow-through).
 * Gövdenin yüksekliği patilerden hesaplanır (iki adımda aynı, aksamaz); her pati ayrıca bacağın küçük dikey
 * kaymasıyla tam yere (ZEMIN) oturur: basan pati yere değer, hiçbir pati yere gömülmez.
 */

/** Dönme noktaları (çizim birimi; ekip/mino/mino-profil.json → donme ile aynı, birim testi denetler) */
export const DONME = {
  'bacak-on': [1160, 1670],
  'bacak-arka': [1045, 1660],
  govde: [1100, 1880],
} as const;

export type BacakAdi = 'bacak-on' | 'bacak-arka';

// ---- Ölçülen geometri: node scripts/mino/pati-olc.mjs (katman resimlerinin opak piksellerinden) ----

/**
 * Patilerin dinlenme duruşunda yere değen çizgisi (çizim birimi): iki patinin tabanı da burada. profil.mjs'teki
 * TABAN ile aynı → önden çizimin ayak çizgisi.
 */
export const ZEMIN = 1919;

/**
 * Bacağın alt kısmının dışbükey zarfı (çizim birimi; ilk nokta dinlenmede en alttaki taban noktası). Bacak
 * dönünce pati yuvarlak tabanı üstünde yuvarlanır: hangi köşe en altta kalıyorsa gövde ona göre iner / kalkar.
 */
const PATI: Record<BacakAdi, readonly (readonly [number, number])[]> = {
  'bacak-on': [
    [1197, 1919], [1234, 1919], [1185, 1918], [1176, 1917], [1253, 1916], [1160, 1915], [1154, 1914], [1261, 1914],
    [1269, 1911], [1137, 1910], [1128, 1907], [1280, 1905], [1121, 1904], [1111, 1898], [1291, 1893], [1102, 1890],
    [1294, 1887], [1297, 1878], [1095, 1878], [1298, 1872], [1298, 1862], [1297, 1856],
  ],
  'bacak-arka': [
    [1120, 1919], [1100, 1919], [1127, 1918], [1093, 1918], [1083, 1916], [1140, 1914], [1072, 1913], [1060, 1909],
    [1154, 1906], [1045, 1903], [1163, 1896], [1021, 1891], [1167, 1888], [1011, 1885], [1169, 1882], [1005, 1881],
    [995, 1873], [989, 1867], [983, 1859], [977, 1843], [977, 1828],
  ],
};

/** Ölçüler (derece / çizim birimi) */
export const OLCU = {
  /** kısa bacağın (yakın) basışta öne / itişte geriye açısı; uzun bacak (uzak) aynı adım yolu için biraz az
   * döner (sınır ±25; havadaki bacağın taşması dahil) */
  BACAK: 24,
  /** yakın kol / uzak kol salınımı (bacakların tersine) */
  KOL_ON: 22,
  KOL_ARKA: 19,
  /** havadaki patinin kalkma yüksekliği */
  KALDIR: 26,
  /** gövdenin öne eğimi (+ yükselişte ek) */
  EGIM: 3.2,
  EGIM_EK: 1.3,
  /** çöküşte basılma / yükselişte uzama (dikey ölçek payı) */
  BASIL: 0.02,
  UZA: 0.014,
  /** çöküşte ek iniş / yükselişte ek kalkış (çizim birimi) */
  COKUS: 9,
  YUKSELIS: 8,
  /** takip hareketi sınırları (tasarımcı: kuyruk ±6, kulak kökleri ±10'a kadar temiz) */
  KUYRUK: 6,
  KULAK: 10,
  FULAR: 3.5,
  /** yürürken kuyruğun ayrıca hızlı sallanması (derece; Mino'da yok, köpekte neşe) */
  KUYRUK_SALLA: 0,
} as const;

/** Yürüyüş ölçüleri (OLCU'nun biçimi; her karakter kendi değerlerini verebilir) */
export type YuruyusOlcu = { readonly [K in keyof typeof OLCU]: number };

const RAD = Math.PI / 180;
const TAM = Math.PI * 2;

/**
 * Yandan yürüyen bir karakterin geometrisi (Mino ya da Adobe'nin <ad>-profil iskeletlerinden biri).
 * Dönme noktaları ve pati zarfı çizim biriminde; türetilenler (adım yolu, bacak açıları) yuruyusGeometrisi'nden.
 */
export interface YuruyusGeometri {
  donme: Record<BacakAdi | 'govde', readonly [number, number]>;
  /** patilerin dinlenmede yere değdiği çizgi */
  zemin: number;
  /** bacağın alt kısmının dışbükey zarfı (ilk nokta dinlenmede en alttaki taban noktası) */
  pati: Record<BacakAdi, readonly (readonly [number, number])[]>;
  olcu: YuruyusOlcu;
  /** bir adımda gövdenin aldığı yol; bir döngüde (iki adım) */
  adimYolu: number;
  donguYolu: number;
  /** her bacağın basıştaki en büyük açısı (derece) */
  bacakAci: Record<BacakAdi, number>;
}

/**
 * Geometriyi kurar. Bir adımda gövdenin aldığı yol: basan patinin taban noktası kalçaya göre 2·h·sin(açı) geri
 * gider (h: bacağın boyu, dönme noktasından taban noktasına). Kısa bacak olcu.BACAK kadar döner; uzun bacağın
 * açısı aynı yolu alacak kadar (iki adım eşit).
 */
export function yuruyusGeometrisi(g: Pick<YuruyusGeometri, 'donme' | 'zemin' | 'pati'> & { olcu?: Partial<YuruyusOlcu> }): YuruyusGeometri {
  const olcu: YuruyusOlcu = { ...OLCU, ...g.olcu };
  const boy = (ad: BacakAdi) => g.pati[ad][0][1] - g.donme[ad][1];
  const adimYolu = 2 * Math.min(boy('bacak-on'), boy('bacak-arka')) * Math.sin(olcu.BACAK * RAD);
  return {
    donme: g.donme,
    zemin: g.zemin,
    pati: g.pati,
    olcu,
    adimYolu,
    donguYolu: 2 * adimYolu,
    bacakAci: {
      'bacak-on': Math.asin(adimYolu / (2 * boy('bacak-on'))) / RAD,
      'bacak-arka': Math.asin(adimYolu / (2 * boy('bacak-arka'))) / RAD,
    },
  };
}

/** Mino'nun geometrisi (varsayılan) */
export const MINO_YURUYUS = yuruyusGeometrisi({ donme: DONME, zemin: ZEMIN, pati: PATI });

/** Bir adımda gövdenin aldığı yol (çizim birimi; Mino) */
export const MINO_ADIM_YOLU = MINO_YURUYUS.adimYolu;
/** Her bacağın basıştaki en büyük açısı (derece; Mino) */
export const BACAK_ACI: Record<BacakAdi, number> = MINO_YURUYUS.bacakAci;
/** Bir tam döngüde (iki adım) gövdenin aldığı yol (çizim birimi; Mino) */
export const MINO_DONGU_YOLU = MINO_YURUYUS.donguYolu;

/**
 * Pati ölçümü: opaklık eşiği (kenar yumuşatmasının yarısı) ve zarfın alt kısmı (kalçadan bacak boyunun bu kadarı
 * aşağıdaki köşeler; ±25° dönüşte daha yukarısı yere inemez)
 */
export const PATI_OLCUM = { ESIK: 128, ALT_PAY: 0.6 } as const;

/**
 * Bir bacak katmanının opak piksellerinden (çizim biriminde noktalar) yere değebilecek köşeler: dışbükey zarfın
 * kalçadan altPay kadar aşağıdaki köşeleri; en alttaki (taban) önce, eşitse ortadaki. scripts/mino/pati-olc.mjs ile
 * aynı yol (Mino'nun PATI'si oradan); yeni profil iskeletleri (köpek, tavşan, ördek …) tarayıcıda bununla ölçülür.
 */
export function patiKoseleri(noktalar: readonly (readonly [number, number])[], kalcaY: number, altPay: number): [number, number][] {
  const p = [...noktalar].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cap = (o: readonly number[], a: readonly number[], b: readonly number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const alt: (readonly [number, number])[] = [];
  for (const q of p) {
    while (alt.length >= 2 && cap(alt[alt.length - 2], alt[alt.length - 1], q) <= 0) alt.pop();
    alt.push(q);
  }
  const ust: (readonly [number, number])[] = [];
  for (const q of p.reverse()) {
    while (ust.length >= 2 && cap(ust[ust.length - 2], ust[ust.length - 1], q) <= 0) ust.pop();
    ust.push(q);
  }
  const kose: [number, number][] = [];
  for (const [x, y] of alt.slice(0, -1).concat(ust.slice(0, -1))) {
    if (y < kalcaY + altPay) continue;
    const q: [number, number] = [Math.round(x), Math.round(y)];
    if (!kose.some((k) => Math.hypot(k[0] - q[0], k[1] - q[1]) < 6)) kose.push(q);
  }
  if (!kose.length) return kose;
  const enAlt = Math.max(...kose.map((k) => k[1]));
  const taban = kose.filter((k) => k[1] >= enAlt - 1);
  const ortaX = taban.reduce((s, k) => s + k[0], 0) / taban.length;
  kose.sort((a, b) => b[1] - a[1] || Math.abs(a[0] - ortaX) - Math.abs(b[0] - ortaX));
  // taban noktası: en alttakilerin ortası (basan patinin kaymama ölçüsü)
  kose.unshift([Math.round(ortaX), enAlt]);
  return kose;
}

/** [-0.5, 0.5) aralığına sarar */
const sar = (x: number) => x - Math.floor(x + 0.5);
/** φ çevresinde yumuşak tepe (periyodik) */
const tepe = (x: number, merkez: number, genislik: number) => Math.exp(-((sar(x - merkez) / genislik) ** 2));
const kirp = (x: number, s: number) => Math.max(-s, Math.min(s, x));

/**
 * Bir bacağın açısı (+ ayak geriye) ve kalkması, bacağın kendi fazında (q = 0: öne basma anı).
 * 0..0.5 basıyor, 0.5..1 havada. A: basıştaki en büyük açı (derece); kaldir: havadaki patinin kalkma yüksekliği.
 */
export function bacakEvresi(q: number, A: number = OLCU.BACAK, kaldirma: number = OLCU.KALDIR): { aci: number; kaldir: number } {
  q = ((q % 1) + 1) % 1;
  const sinA = Math.sin(A * RAD);
  if (q < 0.5) {
    // basan bacak: sin(açı) doğrusal → pati kaymaz
    return { aci: Math.asin(sinA * (4 * q - 1)) / RAD, kaldir: 0 };
  }
  // havadaki bacak: Hermite eğrisi. Başta itişin hızıyla biraz daha geri gider (m0), sonunda öne uzanıp
  // geri oturarak basar (m1 > 0: hafif öne taşma). Hızlar: s birimi başına derece.
  const s = (q - 0.5) / 0.5;
  const m0 = 14;
  const m1 = 10;
  const s2 = s * s;
  const s3 = s2 * s;
  const aci = (2 * s3 - 3 * s2 + 1) * A + (s3 - 2 * s2 + s) * m0 + (-2 * s3 + 3 * s2) * -A + (s3 - s2) * m1;
  // kalkış itişten hemen sonra hızlı, iniş yumuşak (tepe s ≈ 0.4'te)
  const kaldir = kaldirma * Math.sin(Math.PI * Math.pow(s, 0.75));
  return { aci, kaldir };
}

export interface YuruyusPozu {
  /** bacak açıları (+ ayak geriye) ve bacakların dikey kayması (bedenin içinde; − yukarı) */
  bacakOn: number;
  bacakOnY: number;
  bacakArka: number;
  bacakArkaY: number;
  kolOn: number;
  kolArka: number;
  /** bütün bedenin dikey kayması (+ aşağı), öne eğimi (derece) ve ölçeği (dönme noktası donme.govde) */
  bob: number;
  egim: number;
  sx: number;
  sy: number;
  kafa: number;
  kafaY: number;
  kulak: number;
  kuyruk: number;
  fular: number;
}

/**
 * Bir pozda patinin dünyadaki en alt noktası, yer çizgisinden yüksekliği (yer; + havada, − gömülü) ve
 * taban noktasının x'i (bütün dönüşümlerle; mino-profil.ts'in yazdığı transform zinciriyle aynı).
 * Birim testleri: basan pati yere değer, hiçbir pati yere gömülmez, basan pati kaymaz.
 */
export function patiDunya(ad: BacakAdi, z: YuruyusPozu, g: YuruyusGeometri = MINO_YURUYUS): { enAlt: number; yer: number; tabanX: number } {
  const [px, py] = g.donme[ad];
  const [ax, ay] = g.donme.govde;
  const a = (ad === 'bacak-on' ? z.bacakOn : z.bacakArka) * RAD;
  const dy = ad === 'bacak-on' ? z.bacakOnY : z.bacakArkaY;
  const e = z.egim * RAD;
  const dunya = (x: number, y: number): [number, number] => {
    const bx = px + (x - px) * Math.cos(a) - (y - py) * Math.sin(a);
    const by = py + (x - px) * Math.sin(a) + (y - py) * Math.cos(a) + dy;
    const ox = (bx - ax) * z.sx;
    const oy = (by - ay) * z.sy;
    return [ax + ox * Math.cos(e) - oy * Math.sin(e), ay + ox * Math.sin(e) + oy * Math.cos(e) + z.bob];
  };
  let enAlt = -Infinity;
  for (const [x, y] of g.pati[ad]) enAlt = Math.max(enAlt, dunya(x, y)[1]);
  return { enAlt, yer: g.zemin - enAlt, tabanX: dunya(g.pati[ad][0][0], g.pati[ad][0][1])[0] };
}

/**
 * Bacak (derece kadar dönmüş) ve beden (ölçek + eğim) dönüşümünden sonra patinin en alt noktasını yer
 * çizgisine değdirmek için bedenin ne kadar inmesi gerektiği (+ aşağı).
 */
function yereInis(g: YuruyusGeometri, ad: BacakAdi, aci: number, sx: number, sy: number, egim: number): number {
  const [px, py] = g.donme[ad];
  const [ax, ay] = g.donme.govde;
  const a = aci * RAD;
  const e = egim * RAD;
  let enAlt = -Infinity;
  for (const [x, y] of g.pati[ad]) {
    // bacak dönüşü (SVG rotate: saat yönü +)
    const bx = px + (x - px) * Math.cos(a) - (y - py) * Math.sin(a);
    const by = py + (x - px) * Math.sin(a) + (y - py) * Math.cos(a);
    // beden: ölçek, sonra eğim (ikisi de govde noktası çevresinde)
    const ox = (bx - ax) * sx;
    const oy = (by - ay) * sy;
    enAlt = Math.max(enAlt, ay + ox * Math.sin(e) + oy * Math.cos(e));
  }
  return g.zemin - enAlt;
}

/**
 * Bir karenin pozu.
 * faz: döngü (0..1, iki adım); guc: yürüyüş gücü (0 dururken, 1 tam yürüyüş); t: saniye (dururken nefes, bakınma);
 * g: karakterin geometrisi (varsayılan Mino).
 */
export function yuruyusPozu(faz: number, guc: number, t: number, g: YuruyusGeometri = MINO_YURUYUS): YuruyusPozu {
  const O = g.olcu;
  const w = Math.max(0, Math.min(1, guc));
  const p = ((faz % 1) + 1) % 1;
  const phi = (2 * p) % 1; // adım fazı: 0 temas, ~0.15 çöküş, 0.5 geçiş, ~0.7 yükseliş
  const nefes = Math.sin(t * 2.1);

  // gövde: çöküşte basılır (yayvanlaşır), yükselişte uzar ve biraz daha öne eğilir
  const cok = tepe(phi, 0.15, 0.12);
  const yuk = tepe(phi, 0.7, 0.14);
  const sy = 1 + w * (-O.BASIL * cok + O.UZA * yuk) + (1 - w) * nefes * 0.008;
  const sx = 1 + w * (0.6 * O.BASIL * cok - 0.5 * O.UZA * yuk);
  const egim = w * (O.EGIM + O.EGIM_EK * yuk);

  const bacaklar = (q: number) => {
    const on = bacakEvresi(q, g.bacakAci['bacak-on'], O.KALDIR);
    const arka = bacakEvresi(q + 0.5, g.bacakAci['bacak-arka'], O.KALDIR);
    return {
      on: w * on.aci,
      arka: w * arka.aci,
      onKaldir: w * on.kaldir,
      arkaKaldir: w * arka.kaldir,
      onIn: yereInis(g, 'bacak-on', w * on.aci, sx, sy, egim),
      arkaIn: yereInis(g, 'bacak-arka', w * arka.aci, sx, sy, egim),
    };
  };
  const b = bacaklar(p);
  const b2 = bacaklar(p + 0.5);

  // gövdenin yüksekliği: patiler yere değecek kadar iner. İki bacağın boyu, kalçanın gövde noktasına göre yeri
  // ve öne eğimdeki kalkışı farklı olduğundan yalnız buna bakılsa gövde bir adımda yüksek, ötekinde alçak kalır (aksama);
  // bu yüzden iki adımın ortalaması alınır (her adım aynı) ve üstüne çöküşte ek iniş, yükselişte ek kalkış eklenir.
  const bob = (Math.min(b.onIn, b.arkaIn) + Math.min(b2.onIn, b2.arkaIn)) / 2 + w * (O.COKUS * cok - O.YUKSELIS * yuk);
  // bacaklar: her pati tam yere değsin diye bacak bedenin içinde dikeyde kayar (diz bükülmesinin yerine; kalça
  // kökü gövdenin altında kalır), havadaki bacak ayrıca kalkar
  const olc = sy * Math.cos(egim * RAD);
  const bacakOnY = (b.onIn - bob) / olc - b.onKaldir;
  const bacakArkaY = (b.arkaIn - bob) / olc - b.arkaKaldir;

  // kollar bacakların tersine (yakın kol yakın bacağın tersine), bir tık geriden gelir
  const kolDalga = Math.cos(TAM * (p - 0.03));
  const kolOn = w * O.KOL_ON * kolDalga + (1 - w) * nefes * 1.2;
  const kolArka = -w * O.KOL_ARKA * kolDalga + (1 - w) * nefes * 1.2;

  // takip hareketleri: gövdenin iniş-çıkışını (en alçak φ ≈ 0.1, en yüksek ≈ 0.6) geriden izler.
  // Genlikler karakterin sınırına oranlı (Mino: kulak ±10, kuyruk ±6).
  const izle = (gecikme: number) => Math.sin(TAM * (phi - gecikme));
  const kafa = w * 1.6 * izle(0.2) + (1 - w) * Math.sin(t * 0.9) * 1.6;
  const kafaY = w * 5 * Math.cos(TAM * (phi - 0.22));
  // kulaklar sınırın hemen altında sallanır: Mino'nun yakın kulağı tam −10'da kökte minik çıkıntı gösteriyor
  const kk = O.KULAK / 10;
  const kulak = kirp(kk * (w * 7 * izle(0.3) + Math.sin(t * 1.7) * 1.8), O.KULAK - 1);
  const ky = O.KUYRUK / 6;
  const kuyruk = kirp(ky * (w * (1.2 + 4.6 * izle(0.35)) + (1 - w * 0.6) * Math.sin(t * 2.3) * 3.5) + w * O.KUYRUK_SALLA * Math.sin(t * 15), O.KUYRUK);
  const fular = kirp(w * 3 * izle(0.32) + (1 - w) * nefes * 0.6, O.FULAR);

  return { bacakOn: b.on, bacakOnY, bacakArka: b.arka, bacakArkaY, kolOn, kolArka, bob, egim, sx, sy, kafa, kafaY, kulak, kuyruk, fular };
}
