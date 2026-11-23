// "Önce Kuzu" sahnesinin yerleşimi. Ölçüler Paket Doktor-K1 brief'i ve ölçü ekiyle aynıdır (CLAUDE-ASTRA-MESAJLAR.md):
// her çizim kendi tuvalinde, bilinen yer çizgisi ve eksenle gelir; burada o tuvaller 1600 × 900 birimlik sahneye oturur.
// Çizimler gelince ölçülecek tek şeyler HEDEF altındaki noktalardır (Kuzu'nun göğsü, kalp, Kino'nun avucu).
// Saf hesap: DOM yok.
import type { Plan } from './akis';

export const SAHNE = { g: 1600, y: 900 } as const;
/** Orta plan çizim pikselinin sahne birimi karşılığı: Zıpzıp ayakta 1000 px = 400 birim. */
export const OLCEK = 0.4;
/** Karakterlerin ve masanın bastığı yer çizgisi (sahne birimi). */
export const YER_Y = 800;

/**
 * Odadaki yerler (sahne birimi), `fon-muayene` ile birlikte ölçüldü (22 Kasım, Astra'nın K1 teslimi): muayene masası
 * (minder 400 birim) pencere ile alet masasının arasındaki boş duvarda durur; minder x 500–900, alet masası 925'te başlar.
 * Kino masanın sol ucunun önünde, pencerenin sağ yarısının önünde durur; iPad'de görünen alanın (x 200–1400) içinde.
 */
export const MASA_X = 700;
export const KINO_X = 350;

export type TuvalAdi = 'zipzip' | 'kino' | 'masa' | 'yakin';
interface Tuval { g: number; y: number; /** tuvalde yer çizgisi ve gövde ekseni (px) */ yer: number; eksen: number; /** eksenin sahnedeki x'i */ sahneX: number; olcek: number; }
export const TUVAL: Record<TuvalAdi, Tuval> = {
  // Zıpzıp, orta plan: 1300 × 1500; yer y = 1440; oturuşta kalça (650, 1020)
  zipzip: { g: 1300, y: 1500, yer: 1440, eksen: 650, sahneX: MASA_X, olcek: OLCEK },
  // Kino, orta plan: 1300 × 1600; yer y = 1540; masanın solunda durur
  kino: { g: 1300, y: 1600, yer: 1540, eksen: 650, sahneX: KINO_X, olcek: OLCEK },
  // Muayene masası ve tabure: 2000 × 1000; yer y = 840; Zıpzıp'ın oturduğu eksen x = 1000, oturak üstü y = 420; minder x 500–1500
  masa: { g: 2000, y: 1000, yer: 840, eksen: 1000, sahneX: MASA_X, olcek: OLCEK },
  // Yakın plan (bel üstü): 2048 × 1536, sahnenin boyuna sığar ve ortalanır; baş ekseni x = 1024
  yakin: { g: 2048, y: 1536, yer: 1536, eksen: 1024, sahneX: 800, olcek: SAHNE.y / 1536 },
};

export interface Kutu { sol: number; ust: number; g: number; y: number; }
/** Tuvalin sahnedeki kutusu (sahne birimi). */
export function tuvalKutusu(ad: TuvalAdi): Kutu {
  const t = TUVAL[ad];
  const taban = ad === 'yakin' ? SAHNE.y : YER_Y;
  return { sol: t.sahneX - t.eksen * t.olcek, ust: taban - t.yer * t.olcek, g: t.g * t.olcek, y: t.y * t.olcek };
}
/** Tuvaldeki bir pikselin sahnedeki yeri. */
export function tuvalNoktasi(ad: TuvalAdi, x: number, y: number): { x: number; y: number } {
  const k = tuvalKutusu(ad), t = TUVAL[ad];
  return { x: k.sol + x * t.olcek, y: k.ust + y * t.olcek };
}

/** Kamera: plan başına büyütme ve sahnede ortalanan nokta. Yakın planda oda büyür ve bulanır, üstüne yakın çizim gelir. */
export const KAMERA: Record<Plan, { olcek: number; x: number; y: number }> = {
  genis: { olcek: 1, x: 800, y: 450 },
  orta: { olcek: 1.42, x: (KINO_X + MASA_X) / 2 + 25, y: 540 },
  yakin: { olcek: 2.6, x: MASA_X, y: 470 },
};
/** Kameranın CSS dönüşümü (dönüşüm kökeni 0 0): odak noktası sahnenin ortasına gelir. */
export function kameraDonusumu(plan: Plan): { tx: number; ty: number; s: number } {
  const k = KAMERA[plan];
  return { tx: SAHNE.g / 2 - k.x * k.olcek, ty: SAHNE.y / 2 - k.y * k.olcek, s: k.olcek };
}
/** Sahnedeki bir noktanın kameradan sonraki yeri (sahne birimi). */
export function kameradan(plan: Plan, p: { x: number; y: number }): { x: number; y: number } {
  const d = kameraDonusumu(plan);
  return { x: p.x * d.s + d.tx, y: p.y * d.s + d.ty };
}

/** Çizimlere bağlı noktalar (tuval pikseli). Çizimler gelince %100 boyda ölçülüp güncellenir. */
export const HEDEF = {
  /** `zipzip-saklan-3/4`te Kuzu'nun göğsü (kurdelenin altı): ölçü ekinde x = 650 ± 60 istendi */
  kuzuGogus: { tuval: 'zipzip' as const, x: 650, y: 780, yaricap: 130 },
  /** `kino-egil-3`te stetoskobun durduğu açık avuç: çocuk buradan alır */
  kinoAvuc: { tuval: 'kino' as const, x: 930, y: 1010, yaricap: 150 },
  /** yakın planda kalp: Zıpzıp'ın solu, bize göre tişörtün sağ yarısı */
  kalp: { tuval: 'yakin' as const, x: 1150, y: 1090 },
  /** yakın planda tişörtün boş göğüs alanı (stetoskop burada gezer; ilk değişte "serinmiş") */
  gogus: { tuval: 'yakin' as const, sol: 674, ust: 880, g: 700, y: 450 },
  /** yakın planda stetoskobun beklediği yer: ucu ekranın altından uzanır (sahne birimi) */
  stetoskopDinlenme: { x: 1130, y: 760 },
} as const;

/**
 * Perdenin sahnedeki kutusu (900 × 1100 çizim): pencerenin üstüne oturur. `fon-muayene`den ölçüldü (22 Kasım): pencere
 * çerçevesi sahnede x 101…490, y 43…555, pervaz x 89…502. Perde çizimi gelince askı ve etek hizasına göre son kez bakılacak.
 */
export const PERDE: Kutu = { sol: 86, ust: 28, g: 418, y: 511 };

/** Stetoskop çizimi (1600 × 1600): uç altta ortada (800, 1400). Elde baş aşağı tutulur: uç üstte, hortum ekranın altına uzanır. */
export const STETOSKOP = {
  /** ters çevrilmiş çizimde ucun yeri (oran) */
  uc: [0.5, 0.125] as [number, number],
  /** ucun çapı çizimin enine oranı: teslim edilen çizimde 311 / 1600 (uç merkezi 804, 1398) */
  ucCapi: 0.194,
  /** elde tutulan çizimin kenarı (sahne birimi): orta planda Kuzu'ya göre, yakın planda göğse göre */
  boy: { orta: 420, yakin: 700 },
} as const;

/** Uygulamadaki iki ana ekran: sahne ekranı kaplar (cover). Ölçek ve görünen sahne alanı. */
export function ekranOlcegi(en: number, boy: number): { s: number; gorunen: Kutu } {
  const s = Math.max(en / SAHNE.g, boy / SAHNE.y);
  const g = en / s, y = boy / s;
  return { s, gorunen: { sol: (SAHNE.g - g) / 2, ust: (SAHNE.y - y) / 2, g, y } };
}
