/**
 * TABAKLA · saf kurallar (DOM yok; tests/unit/restoran-mini-tabakla.test.ts). ekip/senaryo/RESTORAN.md §8 M14.
 *
 * Tabak koordinatı: merkez (0, 0), kenar yarıçapı 1 (u sağa, v aşağı). Parça boyları da yarıçap cinsinden.
 * Akıllı tanıma: yüz var mı (iki yuvarlak göz + altında bir yay ya da ağız sırası), süs sayısı, porsiyon.
 */
import type { Malzeme, MalzemeDurumu, Pisme, YemekOzelligi } from '../arayuz';

export type Bicim = 'yuvarlak' | 'uzun' | 'diger';

export interface TabakParca {
  u: number;
  v: number;
  /** en ve boy (yarıçap cinsinden) */
  w: number;
  h: number;
  bicim: Bicim;
}

export interface Yuz {
  gozler: [number, number];
  /** ağız: tek uzun parça ya da sıra */
  agiz: number[];
}

/** Göz olabilir mi: küçük ve yuvarlağa yakın */
const gozMu = (p: TabakParca) => p.bicim === 'yuvarlak' && Math.max(p.w, p.h) <= 0.45;

/**
 * Yüz tanıma: iki göz yan yana (aynı yükseklikte, arası makul), altlarında ortada bir ağız: uzun bir parça (şerit,
 * yarım ay, çubuk, ekmek) ya da yan yana en az üç küçük parça. Burun şart değil. Bulamazsa null.
 */
export function yuzBul(ps: TabakParca[]): Yuz | null {
  let en: { y: Yuz; puan: number } | null = null;
  for (let i = 0; i < ps.length; i++) {
    if (!gozMu(ps[i])) continue;
    for (let j = i + 1; j < ps.length; j++) {
      if (!gozMu(ps[j])) continue;
      const a = ps[i];
      const b = ps[j];
      const du = Math.abs(a.u - b.u);
      const dv = Math.abs(a.v - b.v);
      if (dv > 0.26 || du < 0.22 || du > 1.15) continue;
      const mu = (a.u + b.u) / 2;
      const mv = (a.v + b.v) / 2;
      if (mv > 0.45) continue;
      const altinda = (p: TabakParca) => p.v - mv >= 0.22 && p.v - mv <= 1.1 && Math.abs(p.u - mu) <= Math.max(0.42, du * 0.7);
      // tek uzun ağız
      for (let k = 0; k < ps.length; k++) {
        if (k === i || k === j) continue;
        const m = ps[k];
        if (m.bicim !== 'uzun' || !altinda(m)) continue;
        const puan = 2 - Math.abs(m.u - mu);
        if (!en || puan > en.puan) en = { y: { gozler: [i, j], agiz: [k] }, puan };
      }
      // ağız sırası: aynı yükseklikte en az üç parça, yayılımı en az gözler arası kadar
      const aday = ps.map((p, k) => ({ p, k })).filter(({ p, k }) => k !== i && k !== j && altinda(p) && Math.max(p.w, p.h) <= 0.5);
      for (const { p: o } of aday) {
        const sira = aday.filter(({ p }) => Math.abs(p.v - o.v) <= 0.16);
        if (sira.length < 3) continue;
        const us = sira.map(({ p }) => p.u);
        const yay = Math.max(...us) - Math.min(...us);
        if (yay < Math.max(0.3, du * 0.6)) continue;
        const puan = 1 + sira.length * 0.1;
        if (!en || puan > en.puan) en = { y: { gozler: [i, j], agiz: sira.map(({ k }) => k) }, puan };
      }
    }
  }
  return en?.y ?? null;
}

/** Parça biçimi (görünüm ve malzemeden): göz olabilecek yuvarlaklar, ağız olabilecek uzunlar */
export function bicimBul(gorunum: string, m: Malzeme | string, w: number, h: number): Bicim {
  if (m === 'zeytin' || m === 'cilek') return 'yuvarlak';
  if (m === 'ekmek') return 'uzun';
  if (gorunum === 'serit' || gorunum === 'cubuk' || gorunum === 'yarimdilim') return 'uzun';
  if (m === 'domates' && gorunum === 'dilim') return 'uzun'; // yarım ay
  if (gorunum === 'dilim' || gorunum === 'kup') return w / h > 1.5 || h / w > 1.5 ? 'uzun' : 'yuvarlak';
  if (w / h > 1.8 || h / w > 1.8) return 'uzun';
  return 'diger';
}

/** Tabağın üstü tabağın içinde mi (hafif mıknatıs): içeri çekilmiş konum; çok dışarıdaysa null (tabaktan iner) */
export function miknatis(u: number, v: number, r = 0.82, birakma = 1.55): { u: number; v: number } | null {
  const l = Math.hypot(u, v);
  if (l > birakma) return null;
  if (l <= r) return { u, v };
  return { u: (u / l) * r, v: (v / l) * r };
}

/** Porsiyon: tabaktaki yemek parçası sayısı ve ürünlerin kendi porsiyonlarından */
export function porsiyonBul(yemekParca: number, urunPorsiyon: ('az' | 'normal' | 'kocaman' | undefined)[]): 'az' | 'normal' | 'kocaman' {
  if (urunPorsiyon.includes('kocaman') || yemekParca >= 20) return 'kocaman';
  if (yemekParca <= 3 && !urunPorsiyon.includes('normal')) return 'az';
  return 'normal';
}

/** Süs (garnitür) malzemeleri: tabağa tek tek konur */
export const GARNITUR: Malzeme[] = ['maydanoz', 'limon', 'zeytin', 'ekmek', 'cilek', 'muz'];
/** Gezdirilen şişeler (düz çizgi, desen değil) */
export type Sise = 'bal' | 'zeytinyagi';

export interface TabakOzeti {
  urunler: YemekOzelligi[];
  urunPorsiyon: ('az' | 'normal' | 'kocaman' | undefined)[];
  /** tabaktaki yemek parçası sayısı (ürünlerden gelen) */
  yemekParca: number;
  /** konan süsler (malzeme → adet) */
  sus: Partial<Record<Malzeme, number>>;
  /** gezdirilen bal ve yağ (tabak çapı cinsinden çizgi boyu) */
  bal: number;
  yag: number;
  yuz: boolean;
}

/** Tabağın özelliği (müşteri buna bakar): ürünlerin malzemeleri + süsler; limon ekşi, bal / meyve tatlı */
export function tabakOzelligi(o: TabakOzeti): YemekOzelligi {
  const malzemeler: Partial<Record<Malzeme, MalzemeDurumu>> = {};
  let pisme: Pisme | undefined;
  let sicak = false;
  let tuz = 0;
  let aci = 0;
  let eksi = 0;
  let tatli = 0;
  let karisim: number | undefined;
  for (const u of o.urunler) {
    for (const [m, d] of Object.entries(u.malzemeler)) {
      const e = malzemeler[m as Malzeme];
      malzemeler[m as Malzeme] = e ? { ...e, adet: e.adet + d!.adet } : { ...d! };
    }
    pisme = pisme ?? u.pisme;
    sicak = sicak || !!u.sicak;
    tuz += u.tuz ?? 0;
    aci += u.aci ?? 0;
    eksi += u.eksi ?? 0;
    tatli += u.tatli ?? 0;
    karisim = karisim ?? u.karisim;
  }
  let susSayi = 0;
  for (const [m, n] of Object.entries(o.sus)) {
    if (!n) continue;
    susSayi += n;
    const e = malzemeler[m as Malzeme];
    malzemeler[m as Malzeme] = e ? { ...e, adet: e.adet + n } : { adet: n, kesim: m === 'limon' || m === 'muz' ? 'dilim' : undefined };
    if (m === 'limon') eksi += n;
    if (m === 'cilek' || m === 'muz') tatli += n * 0.5;
  }
  if (o.bal > 0) {
    tatli += Math.min(3, 1 + o.bal * 0.8);
    malzemeler.bal = { adet: 1 };
  }
  if (o.yag > 0) malzemeler.zeytinyagi = { adet: 1 };
  const oz: YemekOzelligi = {
    malzemeler,
    yuz: o.yuz,
    sus: susSayi,
    porsiyon: o.urunler.length || o.yemekParca ? porsiyonBul(o.yemekParca, o.urunPorsiyon) : 'az',
    sicak,
  };
  if (pisme) oz.pisme = pisme;
  if (tuz) oz.tuz = Math.min(3, tuz);
  if (aci) oz.aci = Math.min(3, aci);
  if (eksi) oz.eksi = Math.min(3, Math.round(eksi));
  if (tatli) oz.tatli = Math.min(3, Math.round(tatli));
  if (karisim !== undefined) oz.karisim = karisim;
  return oz;
}

/** Boş tabak mı (en komik başarısızlık: "Görünmez yemek!") */
export const bosMu = (o: TabakOzeti) => !o.urunler.length && !Object.values(o.sus).some(Boolean) && !o.bal && !o.yag;
