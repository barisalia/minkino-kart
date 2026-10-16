/**
 * SOY mini oyununun saf kuralları (DOM yok; tests/unit/restoran-mini-p3.test.ts). RESTORAN.md §8 M3.
 * Soyacak gövdenin üstünden geçtikçe geçtiği şerit soyulur. Gövde iki yüzlüdür: bir yüz bitince sebze döner
 * (3-4 kendiliğinden, 5-6 yanına dokununca). Soyulmuşu soymaya devam edersen sebze incelir, sonunda kürdan kalır.
 * 5-6 portakal: parmağı kaldırmadan daire çizilirse tek parça spiral kabuk (gizli ödül: Lokum'a taç).
 * Koordinatlar gövde ekseninde: U = u·(rx/ry), V = v (u, v ∈ -1..1); fırça yarıçapı V biriminde.
 */
import type { Malzeme, MalzemeDurumu, Yas, YemekOzelligi } from '../arayuz';

export const SOY = {
  kucuk: { yuz: 2, firca: 0.46, esik: 0.76, kendiDon: true },
  buyuk: { yuz: 2, firca: 0.24, esik: 0.86, kendiDon: false },
} as const;

/** soyulmuşu soydukça incelme çarpanı; bu oranın altı kürdan */
export const INCE = { carpan: 0.8, kurdan: 0.36 } as const;
/** spiral: parmağı kaldırmadan bu kadar açı (radyan) = bütün portakal tek parça */
export const SPIRAL_ACI = Math.PI * 2 * 2.3;
/** spiral sayılması için yarıçap bandı (gövde yarıçapının oranı) */
export const SPIRAL_BANT = [0.25, 1.6] as const;

export interface Nokta {
  U: number;
  V: number;
}

/** Gövdenin örnek noktaları (eşit ızgara; elips içi): kaplama ölçülür */
export function ornekler(rx: number, ry: number, adim = 0.2): Nokta[] {
  const k = rx / ry;
  const n: Nokta[] = [];
  for (let u = -1 + adim / 2; u < 1; u += adim) for (let v = -1 + adim / 2; v < 1; v += adim) if (u * u + v * v <= 0.92) n.push({ U: u * k, V: v });
  return n;
}

/** Bir parça soyma çizgisi: (a → b) segmentinin fırça yarıçapındaki örnekleri işaretler; yeni işaretlenen sayısı */
export function fircala(ornek: Nokta[], soyulan: Uint8Array, a: Nokta, b: Nokta, firca: number): number {
  let yeni = 0;
  const dx = b.U - a.U;
  const dy = b.V - a.V;
  const L2 = dx * dx + dy * dy || 1e-9;
  for (let i = 0; i < ornek.length; i++) {
    if (soyulan[i]) continue;
    const p = ornek[i];
    const t = Math.max(0, Math.min(1, ((p.U - a.U) * dx + (p.V - a.V) * dy) / L2));
    const x = a.U + dx * t - p.U;
    const y = a.V + dy * t - p.V;
    if (x * x + y * y <= firca * firca) {
      soyulan[i] = 1;
      yeni++;
    }
  }
  return yeni;
}

export const kaplama = (s: Uint8Array) => (s.length ? s.reduce((t, x) => t + x, 0) / s.length : 0);

export interface SoyDurum {
  m: Malzeme;
  /** kaçıncı yüz (0'dan) */
  yuz: number;
  /** bitmiş yüzler (0..yuz sayısı) */
  bitenYuz: number;
  /** soyulmuş: bütün yüzler bitti */
  soyuldu: boolean;
  /** kalınlık (1 = tam); soyulmuşu soydukça incelir */
  ince: number;
  kurdan: boolean;
}

export const yeniSebze = (m: Malzeme): SoyDurum => ({ m, yuz: 0, bitenYuz: 0, soyuldu: false, ince: 1, kurdan: false });

/** Bu yüzün kaplaması eşiği geçti mi */
export const yuzBitti = (k: number, yas: Yas) => k >= SOY[yas].esik;

/** Yüz bitti: sıradaki yüze geç ya da sebze soyuldu */
export function yuzTamam(d: SoyDurum, yas: Yas): 'don' | 'soyuldu' {
  d.bitenYuz = Math.min(SOY[yas].yuz, d.bitenYuz + 1);
  if (d.bitenYuz >= SOY[yas].yuz) {
    d.soyuldu = true;
    return 'soyuldu';
  }
  return 'don';
}

/** Soyulmuş sebzeyi bir kez daha soy: incelir; kürdana dönünce true */
export function incelt(d: SoyDurum): boolean {
  if (d.kurdan) return false;
  d.ince *= INCE.carpan;
  if (d.ince < INCE.kurdan) {
    d.kurdan = true;
    return true;
  }
  return false;
}

/** Soyma oranı (0-1): bitmiş yüzler + bu yüzün kaplaması */
export function soymaOrani(d: SoyDurum, k: number, yas: Yas): number {
  if (d.soyuldu) return 1;
  return Math.min(1, (d.bitenYuz + Math.min(1, k / SOY[yas].esik)) / SOY[yas].yuz);
}

/** Tepsiye: her malzemenin adedi ve soyuldu mu (oran ≥ 0,75). Kürdan olan Mino'nun bıyığı oldu, tepsiye gitmez. */
export function soyOzeti(liste: { m: Malzeme; oran: number; kurdan: boolean }[]): YemekOzelligi {
  const malzemeler: Partial<Record<Malzeme, MalzemeDurumu>> = {};
  for (const x of liste) {
    if (x.kurdan) continue;
    const s = x.oran >= 0.75;
    const d = malzemeler[x.m];
    if (d) {
      d.adet++;
      d.soyuldu = !!d.soyuldu && s;
    } else malzemeler[x.m] = { adet: 1, soyuldu: s };
  }
  return { malzemeler, sicak: false };
}
