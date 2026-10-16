/**
 * TAVA · saf kurallar (DOM yok; tests/unit/restoran-mini-tava.test.ts). ekip/senaryo/RESTORAN.md §8 M6, §3c.
 *
 * Pişme zamanla ilerler (ocak hep yanar, tavada yemek varken): çiğ → az → altın → çıtır. ÇITIR SON DURAK, kömür yok.
 * Spatulayla karıştırmak pişmeyi biraz hızlandırır ve yumurtayı karıştırır (az karıştırma iri, çok karıştırma ince).
 * Pankek: iki yüzü ayrı pişer (alttaki yüz pişer); kabarcık alttaki yüz "az"ı geçince çıkar. Fiske ile çevrilir:
 * 3-4 yaşta hep tavaya döner; 5-6 yaşta çok güçlü fiske = tavana yapışır (3 sn sonra düşer), erken çevirmek öbür yüzü
 * soluk bırakır. Yumurta kenara iki kez vurulunca kırılır; çok sert vuruşta kabuk tavaya düşer.
 */
import { PISME_SIRASI, type Pisme, type Yas } from '../arayuz';

/** Pişme puanı: 0-1 çiğ, 1-2 az, 2-3 altın, 3+ çıtır (en çok TAVAN; kömür yok) */
export const TAVAN = 3.6;
export function pismeAdi(p: number): Pisme {
  if (p >= 3) return 'citir';
  if (p >= 2) return 'altin';
  if (p >= 1) return 'az';
  return 'cig';
}
/** Saniyede pişme (ocakta) */
export const HIZ = { sebze: 1 / 6.5, yumurta: 1 / 6, pankek: 1 / 5.5 } as const;
/** Karıştırma pişmeye katkısı: spatulanın tavada aldığı her 100 px */
export const KARISTIR_PISME = 0.05;

/** Zaman geçti: puanı ilerletir, tavanı aşmaz */
export function pis(p: number, sn: number, hiz: number): number {
  return Math.min(TAVAN, p + Math.max(0, sn) * hiz);
}

/** Yumurtanın karışması: spatulanın tavadaki yolu (px) → 0-1. 3-4 yaşta daha çabuk. */
export function karisimEkle(k: number, yolPx: number, yas: Yas): number {
  const gereken = yas === 'kucuk' ? 900 : 1500;
  return Math.min(1, k + yolPx / gereken);
}
/** Yumurta kesimi (ürün): az karışık iri, çok karışık ince */
export const yumurtaKesim = (k: number) => (k < 0.15 ? 'butun' : k < 0.6 ? 'iri' : 'ince');

/**
 * Yumurta kenara vurdu mu: yumurtanın merkezi tavanın kenar bandına dışarıdan girdi mi. R: tava yarıçapı (px).
 * once / simdi: merkezden uzaklık. 3-4 yaşta bant geniş.
 */
export function kenaraVurdu(once: number, simdi: number, R: number, yas: Yas): boolean {
  const dis = R * (yas === 'kucuk' ? 1.32 : 1.2);
  const ic = R * (yas === 'kucuk' ? 0.62 : 0.74);
  return once > dis && simdi <= dis && simdi >= ic;
}
/** Vuruş hızı (px/ms) bunu geçerse kabuk tavaya düşer (5-6; 3-4'te daha hoşgörülü) */
export const SERT_VURUS = { kucuk: 3.2, buyuk: 2.1 } as const;

/** Fiske: parmak yukarı hızla kalktı mı. dy < 0 yukarı. */
export function fiskeMi(dy: number, ms: number, yas: Yas): boolean {
  if (ms > 450) return false;
  if (yas === 'kucuk') return Math.abs(dy) > 26; // 3-4: yön önemli değil
  return dy < -30;
}
/** Fiske sonucu: 5-6'da çok güçlü fiske tavana yapışır */
export function fiskeSonucu(hiz: number, yas: Yas): 'don' | 'tavan' {
  if (yas === 'kucuk') return 'don';
  return hiz > 2.4 ? 'tavan' : 'don';
}

export interface Pankek {
  /** dökülen hamurun boyu 0.35-1 (tavanın oranı) */
  boy: number;
  /** iki yüzün pişmesi: [0] alttaki yüz başta */
  yuz: [number, number];
  /** şu an altta (ocağa bakan) yüz: 0 ya da 1 */
  alt: 0 | 1;
  cevirme: number;
  tavanda: boolean;
}
export const yeniPankek = (boy: number): Pankek => ({ boy: Math.max(0.35, Math.min(1, boy)), yuz: [0, 0], alt: 0, cevirme: 0, tavanda: false });
/** Pankek pişer: yalnız alttaki yüz (tavandayken pişmez) */
export function pankekPis(p: Pankek, sn: number) {
  if (p.tavanda) return;
  p.yuz[p.alt] = pis(p.yuz[p.alt], sn, HIZ.pankek);
}
/** Kabarcık: alttaki yüz az'ı geçince (çevirme zamanı) */
export const kabarcikMi = (p: Pankek) => !p.tavanda && p.yuz[p.alt] >= 1.15;
export function cevir(p: Pankek) {
  p.alt = p.alt === 0 ? 1 : 0;
  p.cevirme++;
}
/** Üstte görünen yüz */
export const ustYuz = (p: Pankek) => p.yuz[p.alt === 0 ? 1 : 0];
/** Pankeğin pişmesi (ürün): iki yüzün ortalaması; biri çıtırsa çıtır. Hiç çevrilmediyse üst çiğ kalır. */
export function pankekPisme(p: Pankek): Pisme {
  const [a, b] = p.yuz;
  if (Math.max(a, b) >= 3 && Math.min(a, b) >= 2) return 'citir';
  return pismeAdi((a + b) / 2);
}
export const pankekBitti = (p: Pankek) => p.yuz[0] >= 2 && p.yuz[1] >= 2;

/** Porsiyon: tavadaki malzeme miktarından */
export function porsiyon(miktar: number): 'az' | 'normal' | 'kocaman' {
  if (miktar <= 1) return 'az';
  if (miktar >= 4) return 'kocaman';
  return 'normal';
}

/** Pişme aşamasına göre cızırtı gücü ve buhar */
export function cizirti(p: Pisme): { guc: number; buhar: boolean } {
  const i = PISME_SIRASI.indexOf(p);
  return { guc: [0.45, 0.65, 0.8, 1][i] ?? 0.5, buhar: i >= 1 };
}

/** Menemen (sebze + yumurta) işin doğal sonu: yumurta karıştı (ya da yok) ve altın oldu */
export function menemenBitti(p: number, yumurtaVar: boolean, karisim: number, sebzeVar: boolean): boolean {
  if (!yumurtaVar && !sebzeVar) return false;
  return p >= 2 && (!yumurtaVar || karisim >= 0.5);
}
