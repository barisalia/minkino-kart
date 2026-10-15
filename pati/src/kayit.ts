/** Pati Dükkânı kaydı (yalnız bu cihazda; localStorage, hata olursa bellekte kalır). İlk Gün diliminde yalnız yaş. */
import type { Yas } from './ihtiyac';

const ANAHTAR = 'minkino-pati-v1';

export interface PatiKayit {
  yas: Yas | null;
}

export function kayitCoz(ham: string | null | undefined): PatiKayit {
  try {
    const k = JSON.parse(ham ?? '{}') as Partial<PatiKayit>;
    return { yas: k.yas === 'kucuk' || k.yas === 'buyuk' ? k.yas : null };
  } catch {
    return { yas: null };
  }
}

function yukle(): PatiKayit {
  try {
    return kayitCoz(globalThis.localStorage?.getItem(ANAHTAR));
  } catch {
    return { yas: null };
  }
}

export const kayit: PatiKayit = yukle();

export function kaydet() {
  try {
    globalThis.localStorage?.setItem(ANAHTAR, JSON.stringify(kayit));
  } catch {
    /* yok say */
  }
}
