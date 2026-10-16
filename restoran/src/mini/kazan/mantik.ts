/**
 * KAZAN · saf kurallar (DOM yok; tests/unit/restoran-mini-kazan.test.ts). ekip/senaryo/RESTORAN.md §8 M7, §3c.
 *
 * Ocak hep yanar: kazanda bir şey varken çorba zamanla pişer (çiğ → az → hazır → koyu; KOYU SON DURAK, yanma yok).
 * Kepçeyle karıştırmak renkleri birleştirir; 3-4 yaşta üç tur, 5-6'da beş tur. Hazır = karıştı ve pişti.
 * Tadım: kepçe Mino'ya gider, Mino DOLAYLI söyler (tuzlu, tatsız, acı, ekşi, su gibi, daha pişmedi, mmm); ceza yok.
 * Kâseye doldurma: her kepçe kâsenin üçte biri; 3-4'te çizgide kendiliğinden durur, 5-6'da taşabilir (taşan çorba
 * tezgâha yayılır, Mino yalar; porsiyon kocaman olur).
 */
import type { Malzeme, Pisme, Yas } from '../arayuz';
import { pismeAdi } from '../tava/mantik';

export interface KazanDurum {
  /** kazandaki malzemeler (adet) */
  malzemeler: Partial<Record<Malzeme, number>>;
  /** mercimek avucu */
  mercimek: number;
  tuz: number;
  aci: number;
  eksi: number;
  nane: number;
  /** pişme puanı 0-3.6 (tava ile aynı ölçek) */
  p: number;
  /** karışma 0-1 */
  karisim: number;
  /** kâsedeki dolum 0-1 (taşınca 1'de kalır) */
  dolum: number;
  tasti: boolean;
}
export const bosKazan = (): KazanDurum => ({ malzemeler: {}, mercimek: 0, tuz: 0, aci: 0, eksi: 0, nane: 0, p: 0, karisim: 0, dolum: 0, tasti: false });

/** Saniyede pişme (ocakta) */
export const KAZAN_HIZ = 1 / 6;
export const KAZAN_TAVAN = 3.6;
/** Hazır için gereken karıştırma turu */
export const KAZAN_TUR = { kucuk: 3, buyuk: 5 } as const;
/** Bir kepçenin kâsedeki payı */
export const KEPCE = 0.34;
/** Kâsenin doldurma çizgisi */
export const CIZGI = 0.85;
/** 5-6'da bu dolumu geçen kepçe taşırır */
export const TASMA = 1.08;

export const icerikVar = (d: KazanDurum) => d.mercimek > 0 || Object.values(d.malzemeler).some((n) => (n ?? 0) > 0);

/** Zaman geçti: kazanda bir şey varsa pişer; tavanı aşmaz */
export function kazanPis(d: KazanDurum, sn: number): number {
  return icerikVar(d) ? Math.min(KAZAN_TAVAN, d.p + Math.max(0, sn) * KAZAN_HIZ) : d.p;
}
/** Pişme adı: Tava'nın ölçeği (çıtır = koyulaştı) */
export const kazanPisme = (p: number): Pisme => pismeAdi(p);

/** Kepçenin kazandaki yolu (px) → karışma. R: kazan iç yarıçapı. */
export function kepceKaristir(k: number, yolPx: number, R: number, yas: Yas): number {
  const tur = yolPx / (2 * Math.PI * R * 0.5);
  const v = k + tur / KAZAN_TUR[yas];
  return v >= 0.999 ? 1 : v;
}
/** Yeni malzeme karışmayı biraz geri düşürür */
export const yeniMalzeme = (k: number) => k * 0.7;

/** Hazır mı (doğal son): karıştı ve en az "az" (3-4) / "altın" (5-6) pişti */
export const hazir = (d: KazanDurum, yas: Yas) => icerikVar(d) && d.karisim >= 0.999 && d.p >= (yas === 'kucuk' ? 1 : 2);

export type Tat = 'su' | 'cig' | 'tuzlu' | 'aci' | 'eksi' | 'tatsiz' | 'mmm';
/** Mino'nun tadımı (dolaylı ipucu; öncelik sırasıyla) */
export function tadim(d: KazanDurum): Tat {
  if (!icerikVar(d)) return 'su';
  if (d.tuz >= 3) return 'tuzlu';
  if (d.aci >= 2) return 'aci';
  if (d.eksi >= 3) return 'eksi';
  if (d.p < 1) return 'cig';
  if (d.tuz === 0) return 'tatsiz';
  return 'mmm';
}

/**
 * Bir kepçe kâseye: yeni dolum ve taştı mı. 3-4: çizgide durur (fazlası kazana döner). 5-6: TASMA'yı geçerse
 * taşar (dolum 1'de kalır).
 */
export function kepceDok(dolum: number, yas: Yas): { dolum: number; tasti: boolean; dondu: boolean } {
  const yeni = dolum + KEPCE;
  if (yas === 'kucuk') return yeni > CIZGI ? { dolum: Math.max(dolum, CIZGI), tasti: false, dondu: yeni - CIZGI > 0.02 } : { dolum: yeni, tasti: false, dondu: false };
  if (yeni > TASMA) return { dolum: 1, tasti: true, dondu: false };
  return { dolum: yeni, tasti: false, dondu: false };
}
/** Porsiyon: az doldurulmuş az, taşan kocaman */
export function kasePorsiyon(dolum: number, tasti: boolean): 'az' | 'normal' | 'kocaman' {
  if (tasti) return 'kocaman';
  return dolum < 0.45 ? 'az' : 'normal';
}

// ------------------------------------------------------------------ renk

type Rgb = [number, number, number];
const hex = (h: string): Rgb => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const SU = hex('#CFE6EC');
const RENK: Partial<Record<Malzeme | 'mercimek', Rgb>> = {
  mercimek: hex('#F08C3A'),
  havuc: hex('#F29A3C'),
  sogan: hex('#F2E2C0'),
  domates: hex('#E4513A'),
  patates: hex('#F1DE9E'),
  biber: hex('#9CCB63'),
  sut: hex('#FFFDF6'),
};
/** Çorbanın rengi: su → malzemelerin ağırlıklı karışımı; karışma ve pişme arttıkça malzeme rengine yaklaşır */
export function corbaRengi(d: KazanDurum): string {
  const agir: [Rgb, number][] = [];
  if (d.mercimek) agir.push([RENK.mercimek!, d.mercimek * 2]);
  for (const [m, n] of Object.entries(d.malzemeler)) if (n) agir.push([RENK[m as Malzeme] ?? hex('#E7D2A8'), n * 0.5]);
  const t = agir.reduce((a, x) => a + x[1], 0);
  if (!t) return '#' + SU.map((v) => v.toString(16).padStart(2, '0')).join('');
  const c: Rgb = [0, 0, 0];
  for (const [r, w] of agir) for (let i = 0; i < 3; i++) c[i] += (r[i] * w) / t;
  // ne kadar karıştı ve pişti: suyun içinde o kadar çözüldü
  const k = Math.min(1, 0.25 + d.karisim * 0.45 + Math.min(1, d.p / 2) * 0.3);
  // koyulaştıkça biraz koyulaşır (çıtır = koyu)
  const koyu = d.p >= 3 ? 0.9 : 1;
  return '#' + c.map((v, i) => Math.round((SU[i] + (v - SU[i]) * k) * koyu).toString(16).padStart(2, '0')).join('');
}
