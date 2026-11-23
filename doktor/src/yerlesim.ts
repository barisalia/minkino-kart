// Sahne yerleşimi: 1600 × 900 birimlik sahne, ekranı kaplayacak biçimde ölçeklenir (iPad yatayda yanlardan, telefon
// yatayda üstten ve alttan kırpılır). Güvenli alan: x 200–1400, y 80–820; önemli her şey bunun içinde.
// Noktalar Antigravity'nin çizimlerinden (ISTEK-08, 22 Kasım) %100 boyda ölçüldü; pozlar kırpılmış webp'nin oranıdır
// (0–1, soldan ve üstten). Diz yakın planının noktaları çizimden kendiliğinden bulunur (varliklar.opakKutu).
import type { Cizim } from './varliklar';

export const SAHNE = { g: 1600, y: 900 } as const;

export type ZipzipPozu = 'zipzip-korkulu' | 'zipzip-gulumseyen' | 'zipzip-zipla' | 'zipzip-ayakta-gosteriyor';
export type KinoPozu = 'kino-merhaba' | 'kino-gosteriyor' | 'kino-sevinc';

/** Korkulu pozun (kırpılmış) sahnedeki boyu; bütün Zıpzıp pozları aynı ölçekte çizildi, ölçek buradan gelir. */
export const ZIPZIP_BOY = 360;
/** Kino'nun merhaba pozunun boyu; öbür Kino pozları aynı ölçekte. */
export const KINO_BOY = 430;

/** Pozun taban noktasının (gövde ortası, yer çizgisi) sahnedeki yeri. Koltuk: oturağın önü; ayaklar sarkar. */
export const YER = {
  koltuk: { x: 800, y: 656 },
  giris: { x: 1820, y: 724 },
  kapi: { x: 1222, y: 736 },
  kino: { x: 372, y: 802 },
};

export interface PozNoktalari {
  /** gövde ortası ve yer çizgisi: pozlar değişince Zıpzıp yerinden kaymaz (bütün çizimlerde burun x'i aynı) */
  taban: [number, number];
  /** göğsün ortası (yıldız buraya yapışır) */
  gogus: [number, number];
  /** kalbin yeri (Zıpzıp'ın solu, bize göre sağ; stetoskop burada bekler) */
  kalp: [number, number];
  /** dokununca yakın plan açılan diz; yalnız oturan pozlarda */
  diz?: [number, number];
  /** küçük yara bandı: yer, genişlik (pozun genişliğine oran), açı. Bant hep aynı dizde (son pozda gösterdiği diz). */
  bant?: [number, number, number, number];
}
export const POZ: Record<ZipzipPozu, PozNoktalari> = {
  'zipzip-korkulu': { taban: [0.55, 0.983], gogus: [0.489, 0.558], kalp: [0.572, 0.577], diz: [0.564, 0.758] },
  'zipzip-gulumseyen': { taban: [0.558, 0.984], gogus: [0.575, 0.605], kalp: [0.661, 0.616], diz: [0.566, 0.783], bant: [0.566, 0.786, 0.22, -8] },
  'zipzip-zipla': { taban: [0.548, 1.078], gogus: [0.54, 0.531], kalp: [0.612, 0.542], bant: [0.648, 0.799, 0.19, -14] },
  'zipzip-ayakta-gosteriyor': { taban: [0.557, 0.984], gogus: [0.557, 0.546], kalp: [0.642, 0.557], bant: [0.698, 0.81, 0.21, -6] },
};
export const KINO_TABAN: Record<KinoPozu, [number, number]> = {
  'kino-merhaba': [0.504, 0.989], 'kino-gosteriyor': [0.494, 0.988], 'kino-sevinc': [0.503, 0.988],
};

/** Girişte Zıpzıp hangi pozla seker (korkulu: dizini tutarak sekiyor). */
export const GIRIS_POZU: ZipzipPozu = 'zipzip-korkulu';

export interface AletTanimi {
  ad: Cizim;
  etiket: string;
  /** elde tutulan boy (sahne birimi, çizimin uzun kenarı) */
  boy: number;
  /** parmağın tuttuğu nokta ve aletin iş yapan ucu (çizimin oranı); alet ayrıca parmaktan biraz yukarı kalkar */
  tut: [number, number];
  uc: [number, number];
  /** aynalı (stetoskobun hortumu Zıpzıp'ın yüzüne değil tepsiye doğru uzansın); oranlar aynalı çizime göredir */
  ayna?: boolean;
}
export type AletAdi = 'stetoskop' | 'buyutec' | 'cimbiz' | 'pamuk' | 'bant' | 'yildiz' | 'damga';
export const ALET: Record<AletAdi, AletTanimi> = {
  stetoskop: { ad: 'stetoskop', etiket: 'Stetoskop', boy: 205, tut: [0.14, 0.86], uc: [0.133, 0.81], ayna: true },
  buyutec: { ad: 'buyutec', etiket: 'Büyüteç', boy: 430, tut: [0.86, 0.87], uc: [0.371, 0.361] },
  cimbiz: { ad: 'cimbiz', etiket: 'Cımbız', boy: 380, tut: [0.6, 0.46], uc: [0.09, 0.92] },
  pamuk: { ad: 'pamuk-islak', etiket: 'Islak pamuk', boy: 190, tut: [0.45, 0.55], uc: [0.445, 0.5] },
  bant: { ad: 'bant-yildiz', etiket: 'Yara bandı', boy: 360, tut: [0.5, 0.5], uc: [0.5, 0.5] },
  yildiz: { ad: 'yildiz-cikartma', etiket: 'Yıldız çıkartması', boy: 64, tut: [0.5, 0.5], uc: [0.5, 0.5] },
  damga: { ad: 'damga', etiket: 'Damga', boy: 230, tut: [0.5, 0.3], uc: [0.5, 0.84] },
};
/** Büyüteç camının merkezi ve yarıçapı (çizimin genişliğine oran); cam açık mavi düz alan, içi canlı büyütme. */
export const BUYUTEC_CAM = { x: 0.376, y: 0.366, r: 0.262, buyutme: 2.2 };

/** Sağlık karnesi: sahnedeki yeri (orta) ve genişliği; damga yeri (kesikli daire) ve izin boyu karnenin oranı. */
export const KARNE = { x: 505, y: 450, g: 590, damgaYeri: [0.722, 0.501] as [number, number], izBoy: 0.25 };

export const BANTLAR = ['bant-yildiz', 'bant-kalp', 'bant-gokkusagi', 'bant-pati'] as const;
export type BantAdi = (typeof BANTLAR)[number];
