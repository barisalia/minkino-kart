/**
 * BULAŞIK · saf mantık (DOM yok, birim testli). ekip/senaryo/RESTORAN.md §8 M15.
 *
 * Kirli tabak lavaboya gelir: lekeleri tabakta ne yendiyse ondan (salata yeşil-kırmızı, menemen sarı-kırmızı, çorba
 * turuncu halka, köfte kahve kırıntı ...). Sünger lekenin üstünde gezdikçe leke söner (3-4: iki tur, 5-6: daha çok,
 * 5-6'da kenarda küçük gizli bir leke de var). Deterjan ovmayı hızlandırır; çok deterjan köpük dağı yapar (komik).
 * Temizlenen tabak musluğun altında durulanır, rafa dizilir. Hepsi rafa dizilince Babaanne bir bahşiş jetonu bırakır.
 */
import type { Yas } from '../arayuz';

export interface Leke {
  /** tabağın merkezine göre (-1 … 1, tabak yarıçapı birim) */
  u: number;
  v: number;
  /** yarıçap (tabak yarıçapı birim) */
  r: number;
  renk: string;
  /** 1 = kirli, 0 = temiz */
  kir: number;
  gizli?: boolean;
}

export type TabakDurum = 'kirli' | 'kopuklu' | 'temiz' | 'rafta';

export interface Tabak {
  id: number;
  tur: string;
  lekeler: Leke[];
  durum: TabakDurum;
  deterjan: number;
}

/** Yemeğe göre leke renkleri */
const LEKE_RENK: Record<string, string[]> = {
  salata: ['#4FA83D', '#E8483A', '#F2CF2A'],
  menemen: ['#F2B233', '#E8483A', '#E07A2C'],
  corba: ['#E8862C', '#D96A1E'],
  patates: ['#E8483A', '#F2C14E'],
  pankek: ['#E3A23A', '#C9772A'],
  pide: ['#E8B04A', '#B8742E'],
  kofte: ['#8A4A2A', '#B5654A'],
  izgara: ['#8A4A2A', '#5E8E2E'],
  tabak: ['#E8483A', '#F2B233', '#4FA83D'],
};

/** Basit tohumlu rastgele */
export function rastgele(tohum: number): () => number {
  let a = tohum >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let sayac = 1;
/** Kirli tabak: 3-4'te 2-3, 5-6'da 3-4 leke (+ kenarda küçük gizli bir leke) */
export function kirliTabak(tur: string, yas: Yas, tohum: number): Tabak {
  const r = rastgele(tohum);
  const renkler = LEKE_RENK[tur] ?? LEKE_RENK.tabak;
  const n = yas === 'kucuk' ? 2 + Math.floor(r() * 2) : 3 + Math.floor(r() * 2);
  const lekeler: Leke[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r() * 0.8;
    const d = 0.18 + r() * 0.32;
    lekeler.push({ u: Math.cos(a) * d, v: Math.sin(a) * d, r: 0.17 + r() * 0.1, renk: renkler[i % renkler.length], kir: 1 });
  }
  if (yas === 'buyuk') {
    const a = r() * Math.PI * 2;
    lekeler.push({ u: Math.cos(a) * 0.72, v: Math.sin(a) * 0.72, r: 0.08, renk: renkler[0], kir: 1, gizli: true });
  }
  return { id: sayac++, tur, lekeler, durum: 'kirli', deterjan: 0 };
}

/** Bir lekeyi silmek için süngerin gezmesi gereken yol (px; tabak yarıçapına göre ölçeklenir) */
export const OVMA_YOLU: Record<Yas, number> = { kucuk: 2.6, buyuk: 3.6 };

/**
 * Sünger (u, v) noktasında yol kadar gezdi (tabak yarıçapı birim). Yakındaki lekeler söner. Deterjan hızlandırır.
 * Döner: bu ovmada sönüp biten lekeler.
 */
export function ov(t: Tabak, u: number, v: number, yol: number, yas: Yas): Leke[] {
  if (t.durum !== 'kirli') return [];
  const hiz = t.deterjan > 0 ? 1.6 : 1;
  const biten: Leke[] = [];
  for (const l of t.lekeler) {
    if (l.kir <= 0) continue;
    const m = Math.hypot(l.u - u, l.v - v);
    if (m > l.r + 0.22) continue;
    l.kir = Math.max(0, l.kir - (yol * hiz) / OVMA_YOLU[yas]);
    if (l.kir <= 0) biten.push(l);
  }
  if (t.lekeler.every((l) => l.kir <= 0)) t.durum = 'kopuklu';
  return biten;
}

/** En kirli (görünür) leke; 3-4 dokunuş yolu için */
export const enKirli = (t: Tabak): Leke | undefined => [...t.lekeler].filter((l) => l.kir > 0).sort((a, b) => Number(!!a.gizli) - Number(!!b.gizli) || b.kir - a.kir)[0];

/** Durula: köpüklüyse temiz olur; kirliyken durularsa lekeler biraz söner ama kalır */
export function durula(t: Tabak): 'temiz' | 'hala-kirli' | 'zaten' {
  if (t.durum === 'kopuklu') {
    t.durum = 'temiz';
    return 'temiz';
  }
  if (t.durum === 'kirli') {
    for (const l of t.lekeler) l.kir = Math.max(0.35, l.kir - 0.15);
    return 'hala-kirli';
  }
  return 'zaten';
}

/** Deterjan: 4. sıkışta köpük dağı (komik) */
export function deterjanSik(t: Tabak): { dag: boolean } {
  t.deterjan++;
  return { dag: t.deterjan === 4 };
}

export const bitti = (ts: Tabak[]) => ts.length > 0 && ts.every((t) => t.durum === 'rafta');
