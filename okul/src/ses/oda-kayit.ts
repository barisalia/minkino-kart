/**
 * Ses Kulesi oda içi ilerleme (yalnız bu cihazda): oda 4-5 dakika; çocuk yarıda çıkarsa kaldığı etkinlikten devam
 * eder. Oda bitince silinir. Ortak kayıt (okul/src/kayit.ts → minkino-okul-v1) değişmez.
 */
import type { Depo } from '../../../src/engine/ilerleme';

export const ODA_ANAHTARI = 'minkino-okul-ses-v1';

function yerelDepo(): Depo | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/** Oda → sıradaki etkinliğin sırası (0: baştan) */
export function odaAdimlari(d: Depo | null = yerelDepo()): Record<string, number> {
  try {
    const o = JSON.parse(d?.getItem(ODA_ANAHTARI) ?? '{}') as Record<string, unknown>;
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(o ?? {})) if (Number.isInteger(v) && (v as number) > 0) out[k] = v as number;
    return out;
  } catch {
    return {};
  }
}

export const odaAdimi = (oda: string, d: Depo | null = yerelDepo()) => odaAdimlari(d)[oda] ?? 0;

/** n: sıradaki etkinlik; 0 ya da oda bitince kayıt silinir */
export function odaAdimiYaz(oda: string, n: number, d: Depo | null = yerelDepo()) {
  const o = odaAdimlari(d);
  if (n > 0) o[oda] = n;
  else delete o[oda];
  try {
    d?.setItem(ODA_ANAHTARI, JSON.stringify(o));
  } catch {
    /* gizli sekme, kota */
  }
}
