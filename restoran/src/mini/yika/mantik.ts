/**
 * YIKA mini oyununun saf kuralları (DOM yok; tests/unit/restoran-mini-p3.test.ts). RESTORAN.md §8 M2.
 * Çamur lekesi parmakla ovulunca silinir; ovarken köpük olur; musluğun altında köpük gider. Yıkamadan geçmek de bir
 * seçim: temiz olmayan sebze de tepsiye gider (müşteride "kıtır… toprak?" şakası, lokantada).
 */
import type { Malzeme, MalzemeDurumu, Yas, YemekOzelligi } from '../arayuz';

export const YIKA = {
  kucuk: {
    /** sebze başına leke sayısı [en az, en çok] */
    leke: [2, 2] as const,
    /** lekenin boyu (gövde küçük ekseninin oranı) */
    boy: 0.62,
    /** bir lekeyi silmek için yakınında ovulan yol (px) */
    silme: 300,
    /** her tam tur en kirli lekeden bu kadar siler ("iki ovalama turu bir lekeyi siler") */
    tur: 0.5,
  },
  buyuk: { leke: [2, 4] as const, boy: 0.42, silme: 330, tur: 0 },
} as const;

/** Bir tur sayılması için gereken açı (radyan; tam daire değil, geniş tolerans) */
export const TUR_ACI = Math.PI * 1.6;
/** köpük: ovulan yol başına artar, musluk altında saniyede söner */
export const KOPUK = { yol: 420, durulaMs: 650 } as const;

export interface Leke {
  /** gövde ekseninde konum (-1..1) */
  u: number;
  v: number;
  /** boy (gövde küçük ekseninin oranı) */
  boy: number;
  /** 1 = çamur, 0 = silindi */
  kir: number;
  /** şekil (yer tutucu / Gemini camur-a|b|c) */
  sekil: 'a' | 'b' | 'c';
}

/** Basit tohumlu rastgele (testte aynı sonuç) */
export function rastgele(tohum: number) {
  let s = tohum >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 10000) / 10000;
  };
}

/** Sebzenin çamur lekeleri: gövdenin içinde, birbirine binmeden */
export function lekeUret(yas: Yas, r: () => number): Leke[] {
  const k = YIKA[yas];
  const n = k.leke[0] + Math.floor(r() * (k.leke[1] - k.leke[0] + 1));
  const l: Leke[] = [];
  let deneme = 0;
  while (l.length < n && deneme++ < 60) {
    const a = r() * Math.PI * 2;
    const d = 0.25 + r() * 0.42;
    const u = Math.cos(a) * d;
    const v = Math.sin(a) * d * 0.8;
    if (l.some((x) => Math.hypot(x.u - u, x.v - v) < 0.55)) continue;
    l.push({ u, v, boy: k.boy * (0.85 + r() * 0.3), kir: 1, sekil: (['a', 'b', 'c'] as const)[l.length % 3] });
  }
  return l;
}

/** Ovma: lekenin yakınından geçen yol (px) kiri azaltır. yakinlik 0-1 (1 = tam üstünde) */
export function lekeOv(l: Leke, yolPx: number, yakinlik: number, yas: Yas): number {
  if (yakinlik <= 0) return l.kir;
  l.kir = Math.max(0, l.kir - (yolPx * yakinlik) / YIKA[yas].silme);
  return l.kir;
}

/** Bir tur tamamlandı: (3-4) yarım kalan lekeden (yoksa ilk kirliden) bir parça siler. Değişen leke döner (yoksa null). */
export function turSil(lekeler: Leke[], yas: Yas): Leke | null {
  const k = YIKA[yas].tur;
  if (!k) return null;
  const en = lekeler.filter((l) => l.kir > 0.04).sort((a, b) => a.kir - b.kir)[0];
  if (!en) return null;
  en.kir = Math.max(0, en.kir - k);
  return en;
}

/** İki açı arasındaki en kısa fark (-π..π] */
export function aciFarki(a: number, b: number): number {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d <= -Math.PI) d += Math.PI * 2;
  return d;
}

export const temizMi = (l: Leke[]) => l.every((x) => x.kir <= 0.04);
export const kirOrani = (l: Leke[]) => (l.length ? l.reduce((t, x) => t + x.kir, 0) / l.length : 0);

export const kopukEkle = (k: number, yolPx: number) => Math.min(1, k + yolPx / KOPUK.yol);
export const durula = (k: number, ms: number) => Math.max(0, k - ms / KOPUK.durulaMs);

export interface YikananSebze {
  m: Malzeme;
  lekeler: Leke[];
  kopuk: number;
  /** süzgece kondu mu */
  suzgecte: boolean;
}

/** Tepsiye gidecek özellik: her malzemenin adedi ve temiz mi; hepsi temizse ürün de temiz */
export function yikamaOzeti(s: YikananSebze[]): YemekOzelligi {
  const malzemeler: Partial<Record<Malzeme, MalzemeDurumu>> = {};
  for (const x of s) {
    const t = temizMi(x.lekeler);
    const d = malzemeler[x.m];
    if (d) {
      d.adet++;
      d.temiz = d.temiz && t;
    } else malzemeler[x.m] = { adet: 1, temiz: t };
  }
  return { malzemeler, temiz: s.length > 0 && s.every((x) => temizMi(x.lekeler)), sicak: false };
}
