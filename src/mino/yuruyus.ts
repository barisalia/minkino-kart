/**
 * Mino'nun yandan yürüyüş döngüsü: saf hesap (DOM yok, birim testli). mino-profil.ts her karede bunu çizer.
 *
 * Bir döngü (faz 0..1) = iki adım. Her adım çizgi film yürüyüşünün dört evresinden geçer (adım fazı φ):
 *  - TEMAS    (φ = 0)    : öndeki pati basar, arkadaki geride parmak ucunda; bacaklar en açık
 *  - ÇÖKÜŞ    (φ ≈ 0.15) : ağırlık öndeki bacağa biner, gövde basılır (en alçak, hafif yayvan)
 *  - GEÇİŞ    (φ = 0.5)  : basan bacak dik, havadaki bacak kalkık hâlde onun yanından öne geçer
 *  - YÜKSELİŞ (φ ≈ 0.7)  : basan bacak iter, gövde en yüksek ve uzamış, öne biraz daha eğik
 * Bacaklar kalçadaki dönme noktasından DÖNER (Adobe'nin çiziminde kalça kökleri ±25°'ye kadar temiz).
 * Basan bacakta açının sinüsü zamanla doğrusal: gövde sabit hızla giderken basan pati yerde kaymaz.
 * Havadaki bacak ease'li döner (itişin devamıyla biraz geri, sonra öne uzanıp yerine oturur) ve kalkar.
 * Kollar bacakların tersine, kuyruk / kulaklar / fular gövdenin iniş-çıkışını geriden izler (follow-through).
 * Gövdenin yüksekliği patilerden hesaplanır (iki adımda aynı, aksamaz); her pati ayrıca bacağın küçük dikey
 * kaymasıyla tam yere (ZEMIN) oturur: basan pati yere değer, hiçbir pati yere gömülmez.
 */

/** Dönme noktaları (çizim birimi; ekip/mino/mino-profil.json → donme ile aynı, birim testi denetler) */
export const DONME = {
  'bacak-on': [1160, 1670],
  'bacak-arka': [935, 1660],
  govde: [1100, 1880],
} as const;

/** Patilerin dinlenme duruşunda yere değen çizgisi (çizim birimi) */
export const ZEMIN = 1895;

/**
 * Patilerin alt konturu (çizim birimi; katman resimlerinin opak kenarından ölçüldü). Bacak dönünce pati
 * yuvarlak tabanı üstünde yuvarlanır: hangi noktası en altta kalıyorsa gövde ona göre iner / kalkar.
 */
const PATI: Record<'bacak-on' | 'bacak-arka', readonly (readonly [number, number])[]> = {
  'bacak-on': [
    [1233, 1895], [1211, 1890], [1258, 1890], [1198, 1881], [1285, 1881], [1189, 1869], [1314, 1869],
    [1184, 1860], [1331, 1860], [1175, 1845], [1353, 1845], [1165, 1830], [1369, 1830], [1152, 1812], [1378, 1812],
  ],
  'bacak-arka': [
    [952, 1895], [929, 1890], [974, 1890], [909, 1881], [988, 1881], [891, 1869], [996, 1869],
    [879, 1860], [1000, 1860], [863, 1845], [1001, 1845], [848, 1830], [999, 1830], [835, 1812], [990, 1812],
  ],
};

/** Ölçüler (derece / çizim birimi) */
export const OLCU = {
  /** bacağın basışta öne / itişte geriye açısı (sınır ±25; havadaki bacağın taşması dahil) */
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
  /** takip hareketi sınırları (tasarımcı: kuyruk ve kulak ±6'ya kadar) */
  KUYRUK: 6,
  KULAK: 6,
  FULAR: 3.5,
} as const;

const RAD = Math.PI / 180;
const TAM = Math.PI * 2;
const sinA = Math.sin(OLCU.BACAK * RAD);

/**
 * Bir tam döngüde (iki adım) gövdenin aldığı yol (çizim birimi): her adımda basan patinin taban noktası
 * kalçaya göre 2·h·sin(BACAK) geri gider (h: dönme noktasından yere yükseklik).
 */
export const MINO_DONGU_YOLU = 2 * sinA * (ZEMIN - DONME['bacak-on'][1] + (ZEMIN - DONME['bacak-arka'][1]));

/** [-0.5, 0.5) aralığına sarar */
const sar = (x: number) => x - Math.floor(x + 0.5);
/** φ çevresinde yumuşak tepe (periyodik) */
const tepe = (x: number, merkez: number, genislik: number) => Math.exp(-((sar(x - merkez) / genislik) ** 2));
const kirp = (x: number, s: number) => Math.max(-s, Math.min(s, x));

/**
 * Bir bacağın açısı (+ ayak geriye) ve kalkması, bacağın kendi fazında (q = 0: öne basma anı).
 * 0..0.5 basıyor, 0.5..1 havada.
 */
export function bacakEvresi(q: number): { aci: number; kaldir: number } {
  q = ((q % 1) + 1) % 1;
  const A = OLCU.BACAK;
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
  const kaldir = OLCU.KALDIR * Math.sin(Math.PI * Math.pow(s, 0.75));
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
  /** bütün bedenin dikey kayması (+ aşağı), öne eğimi (derece) ve ölçeği (dönme noktası DONME.govde) */
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

type BacakAdi = 'bacak-on' | 'bacak-arka';

/**
 * Bir pozda patinin dünyadaki en alt noktası ve taban ucunun x'i (bütün dönüşümlerle; mino-profil.ts'in yazdığı
 * transform zinciriyle aynı). Birim testleri: basan pati yere değer, hiçbir pati yere gömülmez, basan pati kaymaz.
 */
export function patiDunya(ad: BacakAdi, z: YuruyusPozu): { enAlt: number; tabanX: number } {
  const [px, py] = DONME[ad];
  const [ax, ay] = DONME.govde;
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
  for (const [x, y] of PATI[ad]) enAlt = Math.max(enAlt, dunya(x, y)[1]);
  return { enAlt, tabanX: dunya(PATI[ad][0][0], PATI[ad][0][1])[0] };
}

/**
 * Bacak (derece kadar dönmüş) ve beden (ölçek + eğim) dönüşümünden sonra patinin en alt noktasını yere
 * değdirmek için bedenin ne kadar inmesi gerektiği (+ aşağı).
 */
function yereInis(ad: BacakAdi, aci: number, sx: number, sy: number, egim: number): number {
  const [px, py] = DONME[ad];
  const [ax, ay] = DONME.govde;
  const a = aci * RAD;
  const e = egim * RAD;
  let enAlt = -Infinity;
  for (const [x, y] of PATI[ad]) {
    // bacak dönüşü (SVG rotate: saat yönü +)
    const bx = px + (x - px) * Math.cos(a) - (y - py) * Math.sin(a);
    const by = py + (x - px) * Math.sin(a) + (y - py) * Math.cos(a);
    // beden: ölçek, sonra eğim (ikisi de govde noktası çevresinde)
    const ox = (bx - ax) * sx;
    const oy = (by - ay) * sy;
    enAlt = Math.max(enAlt, ay + ox * Math.sin(e) + oy * Math.cos(e));
  }
  return ZEMIN - enAlt;
}

/**
 * Bir karenin pozu.
 * faz: döngü (0..1, iki adım); guc: yürüyüş gücü (0 dururken, 1 tam yürüyüş); t: saniye (dururken nefes, bakınma).
 */
export function yuruyusPozu(faz: number, guc: number, t: number): YuruyusPozu {
  const w = Math.max(0, Math.min(1, guc));
  const p = ((faz % 1) + 1) % 1;
  const phi = (2 * p) % 1; // adım fazı: 0 temas, ~0.15 çöküş, 0.5 geçiş, ~0.7 yükseliş
  const nefes = Math.sin(t * 2.1);

  // gövde: çöküşte basılır (yayvanlaşır), yükselişte uzar ve biraz daha öne eğilir
  const cok = tepe(phi, 0.15, 0.12);
  const yuk = tepe(phi, 0.7, 0.14);
  const sy = 1 + w * (-OLCU.BASIL * cok + OLCU.UZA * yuk) + (1 - w) * nefes * 0.008;
  const sx = 1 + w * (0.6 * OLCU.BASIL * cok - 0.5 * OLCU.UZA * yuk);
  const egim = w * (OLCU.EGIM + OLCU.EGIM_EK * yuk);

  const bacaklar = (q: number) => {
    const on = bacakEvresi(q);
    const arka = bacakEvresi(q + 0.5);
    return {
      on: w * on.aci,
      arka: w * arka.aci,
      onKaldir: w * on.kaldir,
      arkaKaldir: w * arka.kaldir,
      onIn: yereInis('bacak-on', w * on.aci, sx, sy, egim),
      arkaIn: yereInis('bacak-arka', w * arka.aci, sx, sy, egim),
    };
  };
  const b = bacaklar(p);
  const b2 = bacaklar(p + 0.5);

  // gövdenin yüksekliği: patiler yere değecek kadar iner. Yakın bacağın patisi kalçanın önünde, uzak bacağınki
  // altında olduğundan yalnız buna bakılsa gövde bir adımda yüksek, ötekinde alçak kalır (aksama); bu yüzden iki
  // adımın ortalaması alınır (her adım aynı) ve üstüne çöküşte ek iniş, yükselişte ek kalkış eklenir.
  const bob = (Math.min(b.onIn, b.arkaIn) + Math.min(b2.onIn, b2.arkaIn)) / 2 + w * (OLCU.COKUS * cok - OLCU.YUKSELIS * yuk);
  // bacaklar: her pati tam yere değsin diye bacak bedenin içinde dikeyde kayar (diz bükülmesinin yerine; kalça
  // kökü gövdenin altında kalır), havadaki bacak ayrıca kalkar
  const olc = sy * Math.cos(egim * RAD);
  const bacakOnY = (b.onIn - bob) / olc - b.onKaldir;
  const bacakArkaY = (b.arkaIn - bob) / olc - b.arkaKaldir;

  // kollar bacakların tersine (yakın kol yakın bacağın tersine), bir tık geriden gelir
  const kolDalga = Math.cos(TAM * (p - 0.03));
  const kolOn = w * OLCU.KOL_ON * kolDalga + (1 - w) * nefes * 1.2;
  const kolArka = -w * OLCU.KOL_ARKA * kolDalga + (1 - w) * nefes * 1.2;

  // takip hareketleri: gövdenin iniş-çıkışını (en alçak φ ≈ 0.1, en yüksek ≈ 0.6) geriden izler
  const izle = (gecikme: number) => Math.sin(TAM * (phi - gecikme));
  const kafa = w * 1.6 * izle(0.2) + (1 - w) * Math.sin(t * 0.9) * 1.6;
  const kafaY = w * 5 * Math.cos(TAM * (phi - 0.22));
  // kulaklar sınırın (±6) altında sallanır: katman resmi kulak dibinde kesildiği için büyük açıda ince kesik görünüyor
  const kulak = kirp(w * 4 * izle(0.3) + Math.sin(t * 1.7) * 1.2, OLCU.KULAK);
  const kuyruk = kirp(w * (1.2 + 4.6 * izle(0.35)) + (1 - w * 0.6) * Math.sin(t * 2.3) * 3.5, OLCU.KUYRUK);
  const fular = kirp(w * 3 * izle(0.32) + (1 - w) * nefes * 0.6, OLCU.FULAR);

  return { bacakOn: b.on, bacakOnY, bacakArka: b.arka, bacakArkaY, kolOn, kolArka, bob, egim, sx, sy, kafa, kafaY, kulak, kuyruk, fular };
}
