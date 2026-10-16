/**
 * PİDE FIRINI · saf kurallar (DOM yok; tests/unit/restoran-mini-pide.test.ts). ekip/senaryo/RESTORAN.md §8 M10, §3c.
 *
 * Hamur: merdane hamurun üstünde sürüklendikçe hamur o yönde uzar (yatay sürükleme eni, dikey sürükleme boyu açar).
 * Şekli çocuk belirler: hep bir yöne açılırsa uzun KAYIK (pide), iki yöne açılırsa YUVARLAK (lahmacun gibi).
 * Hamur çok açılırsa incelir, ortası delinir: "Pencereli pide!" (pişince delik kalp olur). 3-4 yaşta her sürükleme
 * belirgin açar ve delinme daha geç. En ve boy hamur topunun yarıçapı cinsinden (top = 1 × 1).
 * Fırın: pide fırında kendi pişer: çiğ → az → altın → çıtır; ÇITIR SON DURAK, kömür yok. Kabarma pişmeyle artar.
 */
import type { Pisme, Yas } from '../arayuz';
import { pismeAdi } from '../tava/mantik';

export interface Hamur {
  en: number;
  boy: number;
}
export const topHamur = (): Hamur => ({ en: 1, boy: 1 });

/** Merdanenin açma gücü: hamur yarıçapı kadar sürükleme bu kadar açar */
export const ACMA = { kucuk: 0.34, buyuk: 0.22 } as const;
export const EN_COK = { en: 2.7, boy: 2.1 } as const;
/** Bu alanı (en × boy) geçen hamur delinir */
export const DELIK_ALAN = { kucuk: 4.6, buyuk: 3.7 } as const;

/** Merdane hamurun üstünde (dx, dy) px yürüdü; r0: hamur topunun yarıçapı (px) */
export function merdane(h: Hamur, dx: number, dy: number, r0: number, yas: Yas): Hamur {
  const k = ACMA[yas] / Math.max(1, r0);
  return { en: Math.min(EN_COK.en, h.en + Math.abs(dx) * k), boy: Math.min(EN_COK.boy, h.boy + Math.abs(dy) * k * 0.9) };
}
export const alan = (h: Hamur) => h.en * h.boy;
/** Kalınlık 0-1 (top 1, en ince 0) */
export const kalinlik = (h: Hamur) => Math.max(0, Math.min(1, (EN_COK.en * EN_COK.boy - alan(h)) / (EN_COK.en * EN_COK.boy - 1)));

export type Sekil = 'top' | 'kayik' | 'yuvarlak' | 'oval';
export function sekil(h: Hamur): Sekil {
  if (alan(h) < 1.7) return 'top';
  const o = h.en / h.boy;
  if (o >= 1.55 || o <= 1 / 1.55) return 'kayik';
  if (o <= 1.25 && o >= 0.8) return 'yuvarlak';
  return 'oval';
}
/** Delik var mı ve ne kadar (0-1) */
export function delik(h: Hamur, yas: Yas): number {
  const a = alan(h) - DELIK_ALAN[yas];
  return a <= 0 ? 0 : Math.min(1, a / 1.2 + 0.25);
}

/** Bir nokta (hamur merkezine göre px) hamurun içinde mi; pay: 1 kenar */
export function hamurda(x: number, y: number, h: Hamur, r0: number, pay = 1): boolean {
  const rx = h.en * r0 * pay;
  const ry = h.boy * r0 * pay;
  return (x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1;
}
/** Kenar bandında mı (kenar kıvırma dokunuşu) */
export function kenardaMi(x: number, y: number, h: Hamur, r0: number): boolean {
  return hamurda(x, y, h, r0, 1.18) && !hamurda(x, y, h, r0, 0.72);
}
/**
 * Hafif mıknatıs: hamurun hemen dışına bırakılan malzeme kenarın içine çekilir; uzağa bırakılan tezgâhta kalır (null).
 * Dönen konum hamur merkezine göre px.
 */
export function miknatis(x: number, y: number, h: Hamur, r0: number): { x: number; y: number } | null {
  if (hamurda(x, y, h, r0, 0.82)) return { x, y };
  if (!hamurda(x, y, h, r0, 1.35)) return null;
  // elips üzerindeki yöne göre %78'e çek
  const a = Math.atan2(y / (h.boy * r0), x / (h.en * r0));
  return { x: Math.cos(a) * h.en * r0 * 0.74, y: Math.sin(a) * h.boy * r0 * 0.74 };
}

/** Fırın: saniyede pişme */
export const FIRIN_HIZ = 1 / 4.5;
export const FIRIN_TAVAN = 3.6;
export const firinPis = (p: number, sn: number) => Math.min(FIRIN_TAVAN, p + Math.max(0, sn) * FIRIN_HIZ);
export const pidePisme = (p: number): Pisme => pismeAdi(p);
/** Kabarma 0-1 */
export const kabarma = (p: number) => Math.min(1, p / 2.2);

/** Porsiyon: malzeme yığınına göre (Baba kocamanı sever, Lokum'un ağzı açılmaz) */
export function pidePorsiyon(malzemeAdet: number, h: Hamur): 'az' | 'normal' | 'kocaman' {
  if (malzemeAdet >= 22 || (malzemeAdet >= 14 && alan(h) >= 3)) return 'kocaman';
  if (malzemeAdet <= 3) return 'az';
  return 'normal';
}

/** Kenar: 3-4 yaşta küreğe alınınca kendiliğinden kıvrılır; 5-6'da iki dokunuş */
export const KENAR_DOKUNUS = 2;
