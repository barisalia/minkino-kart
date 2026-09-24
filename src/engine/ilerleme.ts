import type { Yas } from './types';

export interface Ayarlar {
  muzik: boolean;
  efekt: boolean;
  konusma: boolean;
  /** 0..1 ana ses seviyesi */
  seviye: number;
}

export interface Ilerleme {
  surum: 1;
  yas: Yas | null;
  /** Kazanılan albüm kartlarının id'leri */
  album: string[];
  /** `${yas}-${tema}` → o temada alınan en iyi yıldız */
  enIyi: Record<string, number>;
  toplamYildiz: number;
  turSayisi: number;
  /** Açılış kutlaması yapılmış temalar */
  kutlananTemalar: string[];
  premium: boolean;
  ayarlar: Ayarlar;
}

const ANAHTAR = 'minkino-kartlar-v1';

export function varsayilan(): Ilerleme {
  return {
    surum: 1,
    yas: null,
    album: [],
    enIyi: {},
    toplamYildiz: 0,
    turSayisi: 0,
    kutlananTemalar: [],
    premium: false,
    ayarlar: { muzik: true, efekt: true, konusma: true, seviye: 0.9 },
  };
}

export interface Depo {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
}

function depo(): Depo | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function yukle(d: Depo | null = depo()): Ilerleme {
  const v = varsayilan();
  try {
    const ham = d?.getItem(ANAHTAR);
    if (!ham) return v;
    const o = JSON.parse(ham) as Partial<Ilerleme>;
    return {
      ...v,
      ...o,
      album: Array.isArray(o.album) ? o.album : [],
      enIyi: o.enIyi ?? {},
      kutlananTemalar: Array.isArray(o.kutlananTemalar) ? o.kutlananTemalar : [],
      ayarlar: { ...v.ayarlar, ...(o.ayarlar ?? {}) },
      surum: 1,
    };
  } catch {
    return v;
  }
}

export function kaydet(i: Ilerleme, d: Depo | null = depo()): void {
  try {
    d?.setItem(ANAHTAR, JSON.stringify(i));
  } catch {
    /* gizli sekme vb. — ilerleme bu oturumla sınırlı kalır */
  }
}

export function sifirla(d: Depo | null = depo()): Ilerleme {
  try {
    d?.removeItem(ANAHTAR);
  } catch {
    /* yok say */
  }
  return varsayilan();
}

/** Uygulama genelinde tek ilerleme nesnesi. */
export const durum: { i: Ilerleme } = { i: yukle() };
export const kaydetDurum = () => kaydet(durum.i);
