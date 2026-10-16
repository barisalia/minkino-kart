/**
 * RENDELE · saf kurallar (DOM yok; tests/unit/restoran-mini-rendele.test.ts). ekip/senaryo/RESTORAN.md §8 M4.
 *
 * Malzeme rendenin üstünde aşağı yukarı sürtülür: rende yüzeyinde alınan dikey yol, malzemenin boyuyla orantılı
 * olarak onu kısaltır ve yığını büyütür. 3-4 yaşta her sürtme belirgin (bir malzeme ~4 tam sürtmede biter), 5-6'da
 * ~6. Havuç sert (yavaş), elma yumuşak, domates sulu (en hızlı ve her yere fışkırır). Malzeme bitmez: raftan
 * yenisi alınır. 5-6 özel isteği "az" (küçük yığın) ya da "çok" (büyük yığın).
 */
import type { Yas } from '../arayuz';

export type RendeMalzeme = 'kasar' | 'havuc' | 'elma' | 'domates';
export const RENDE_MALZEMELER: readonly RendeMalzeme[] = ['kasar', 'havuc', 'elma', 'domates'];

/** Bir malzemenin bitmesi için gereken tam sürtme (rende boyu kadar yol) */
export const SURTME = { kucuk: 4, buyuk: 6 } as const;
/** Malzemenin sertliği: yolu bununla çarp */
export const KOLAYLIK: Record<RendeMalzeme, number> = { kasar: 1, havuc: 0.7, elma: 1.15, domates: 1.5 };

/**
 * Sürtme: rende yüzeyinde alınan dikey yol (px), rende boyu L (px). Kalan (0-1) azalır; dönen `rende` yığına giden
 * miktar (malzeme birimi: 1 = bütün bir kalıp).
 */
export function surt(kalan: number, yolPx: number, L: number, m: RendeMalzeme, yas: Yas): { kalan: number; rende: number } {
  if (kalan <= 0 || L <= 0) return { kalan: Math.max(0, kalan), rende: 0 };
  const al = Math.min(kalan, ((Math.abs(yolPx) / L) * KOLAYLIK[m]) / SURTME[yas]);
  return { kalan: kalan - al, rende: al };
}

/** Yığının görünen boyu: 0 yok, 1 küçük, 2 orta, 3 büyük, 4 dağ */
export function yiginBoyu(miktar: number): 0 | 1 | 2 | 3 | 4 {
  if (miktar <= 0.02) return 0;
  if (miktar < 0.4) return 1;
  if (miktar < 0.9) return 2;
  if (miktar < 1.6) return 3;
  return 4;
}

/** 5-6 özel istek: az = 0.15-0.7 kalıp, çok = en az 1.2 kalıp (ikinci kalıbı da rendelemek gerekir) */
export function istekTuttu(miktar: number, istek: 'az' | 'cok'): boolean {
  return istek === 'az' ? miktar >= 0.15 && miktar <= 0.7 : miktar >= 1.2;
}

/** Ürün adedi (müşterinin porsiyonu için): miktarın üç katı, en az 1 */
export const rendeAdet = (miktar: number) => Math.max(1, Math.round(miktar * 3));

/** Porsiyon: rendelerin toplamından */
export function rendePorsiyon(toplam: number): 'az' | 'normal' | 'kocaman' {
  if (toplam < 0.35) return 'az';
  if (toplam >= 1.6) return 'kocaman';
  return 'normal';
}
