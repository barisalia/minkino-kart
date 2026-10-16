/**
 * KIZART mini oyununun saf kuralları (DOM yok; tests/unit/restoran-mini-p3.test.ts). RESTORAN.md §8 M11, §3c.
 * Pişme sırası çiğ → az → altın → çıtır; çıtır son durak, KÖMÜR YOK. Altın uzun sürer (3-4 tek daldırışta altın).
 * 5-6: sepetin üst katmanı yavaş pişer; sallayınca katmanlar karışır (eşit kızarır). Sallamazsan üsttekiler soluk kalır.
 */
import type { Kesim, Malzeme, MalzemeDurumu, Pisme, Yas, YemekOzelligi } from '../arayuz';

/** pişme değeri p: 0-1 çiğ, 1-2 az, 2-3 altın, 3+ çıtır (en çok TAVAN) */
export const TAVAN = 3.4;
/** saniyede: altına kadar hızlı, altından sonra yavaş (altın penceresi geniş) */
export const HIZ = { once: 0.4, sonra: 0.12 } as const;
/** 5-6'da üst katman bu kadar yavaş */
export const UST_CARPAN = 0.4;

export function pismeAdi(p: number): Pisme {
  return p < 1 ? 'cig' : p < 2 ? 'az' : p < 3 ? 'altin' : 'citir';
}

/** sn saniye yağda: yeni p */
export function pis(p: number, sn: number, carpan = 1): number {
  let kalan = sn * carpan;
  let x = p;
  if (x < 2) {
    const ilk = Math.min(kalan, (2 - x) / HIZ.once);
    x += ilk * HIZ.once;
    kalan -= ilk;
  }
  if (kalan > 0) x += kalan * HIZ.sonra;
  return Math.min(TAVAN, x);
}

export interface Parca {
  m: Malzeme;
  p: number;
  /** sepette alt ya da üst katman (5-6) */
  ust: boolean;
}

export const kesimi = (m: Malzeme): Kesim => (m === 'sogan' || m === 'biber' ? 'serit' : m === 'ekmek' ? 'kup' : 'cubuk');

/** Bir avuç: 3-4'te 5, 5-6'da 4 parça; sepet en çok 14 */
export const AVUC = { kucuk: 5, buyuk: 4 } as const;
export const SEPET_EN_COK = 14;

export function avucEkle(sepet: Parca[], m: Malzeme, yas: Yas): Parca[] {
  const yeni: Parca[] = [];
  const n = Math.min(AVUC[yas], SEPET_EN_COK - sepet.length);
  for (let i = 0; i < n; i++) {
    const p: Parca = { m, p: 0, ust: yas === 'buyuk' && (sepet.length + i) % 2 === 1 };
    yeni.push(p);
  }
  sepet.push(...yeni);
  return yeni;
}

/** dt saniye yağda: katmana göre pişir */
export function sepetPis(sepet: Parca[], sn: number, yas: Yas) {
  for (const x of sepet) x.p = pis(x.p, sn, yas === 'buyuk' && x.ust ? UST_CARPAN : 1);
}

/** sallama: katmanlar karışır (r: 0-1 rastgele) */
export function salla(sepet: Parca[], r: () => number) {
  for (const x of sepet) if (r() < 0.5) x.ust = !x.ust;
}

/** tuz: her silkeleme */
export const TUZ = { kucuk: 0.5, buyuk: 0.34, bulut: 3.4 } as const;
export const tuzEkle = (t: number, yas: Yas) => t + TUZ[yas];
/** tuz düzeyi (YemekOzelligi.tuz): 0 yok, 1 az, 2 iyi, 3+ çok */
export const tuzDuzeyi = (t: number) => (t <= 0 ? 0 : t < 1 ? 1 : t < 2.5 ? 2 : 3);

/** külahtakiler: en çok görülen pişme (eşitlikte daha pişmiş) */
export function cogunluk(liste: Parca[]): Pisme | undefined {
  if (!liste.length) return undefined;
  const say: Record<Pisme, number> = { cig: 0, az: 0, altin: 0, citir: 0 };
  for (const x of liste) say[pismeAdi(x.p)]++;
  return (['citir', 'altin', 'az', 'cig'] as Pisme[]).reduce((a, b) => (say[b] > say[a] ? b : a), 'citir' as Pisme);
}

export function kizartmaOzeti(kulah: Parca[], tuz: number, ketcap: number): YemekOzelligi {
  const malzemeler: Partial<Record<Malzeme, MalzemeDurumu>> = {};
  for (const x of kulah) {
    const d = malzemeler[x.m];
    if (d) d.adet++;
    else malzemeler[x.m] = { adet: 1, kesim: kesimi(x.m) };
  }
  const n = kulah.length;
  return {
    malzemeler,
    pisme: cogunluk(kulah),
    tuz: tuzDuzeyi(tuz),
    sus: ketcap || undefined,
    sicak: true,
    porsiyon: n <= 4 ? 'az' : n >= 12 ? 'kocaman' : 'normal',
  };
}
