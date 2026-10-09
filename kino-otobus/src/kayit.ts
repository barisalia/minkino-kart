/** Kino'nun Otobüsü ilerlemesi (yalnız bu cihazda; localStorage, hata olursa sessizce bellekte kalır). */
import { BOYA, GUN_SAYISI, OTOBUS_SUSLERI, type Gun, type Yas } from './model';

const ANAHTAR = 'minkino-kino-otobus-v1';

export interface OtobusKayit {
  /** kumbaradaki jeton */
  jeton: number;
  /** oynanabilen en yüksek gün (1-3) */
  acikGun: number;
  /** bitirilen günler */
  biten: number[];
  /** dükkândan alınan otobüs süsleri (model.ts → OTOBUS_SUSLERI kimlikleri) */
  alinan: string[];
  /** otobüsün boyası (BOYA anahtarı; asıl renk buz mavisi) */
  boya: string;
  /** yaş ayarı (ilk açılışta seçilir; ebeveyn değiştirebilir) */
  yas: Yas | null;
  /** her günün en çok mutlu müşterisi */
  mutlu: Record<string, number>;
}

const bos = (): OtobusKayit => ({ jeton: 0, acikGun: 1, biten: [], alinan: [], boya: 'buz', yas: null, mutlu: {} });
const gunMu = (g: unknown) => typeof g === 'number' && Number.isInteger(g) && g >= 1 && g <= GUN_SAYISI;

export function kayitCoz(ham: string | null | undefined): OtobusKayit {
  if (!ham) return bos();
  try {
    const k = JSON.parse(ham) as Partial<OtobusKayit>;
    const idler = new Set(OTOBUS_SUSLERI.map((r) => r.id));
    const mutlu: Record<string, number> = {};
    if (k.mutlu && typeof k.mutlu === 'object') for (const [g, n] of Object.entries(k.mutlu)) if (gunMu(Number(g))) mutlu[g] = Math.max(0, Math.min(5, Math.floor(Number(n) || 0)));
    return {
      jeton: Math.max(0, Math.floor(Number(k.jeton) || 0)),
      acikGun: Math.min(GUN_SAYISI, Math.max(1, Math.floor(Number(k.acikGun) || 1))),
      biten: Array.isArray(k.biten) ? k.biten.filter(gunMu) : [],
      alinan: Array.isArray(k.alinan) ? k.alinan.filter((x) => typeof x === 'string' && idler.has(x)) : [],
      boya: typeof k.boya === 'string' && BOYA[k.boya] ? k.boya : 'buz',
      yas: k.yas === 'kucuk' || k.yas === 'buyuk' ? k.yas : null,
      mutlu,
    };
  } catch {
    return bos();
  }
}

function yukle(): OtobusKayit {
  try {
    return kayitCoz(globalThis.localStorage?.getItem(ANAHTAR));
  } catch {
    return bos();
  }
}

export const kayit: OtobusKayit = yukle();

export function kaydet() {
  try {
    globalThis.localStorage?.setItem(ANAHTAR, JSON.stringify(kayit));
  } catch {
    /* gizli sekme, kota: bellekte kalır */
  }
}

/** Test / gösterim: kaydı sıfırlar */
export function sifirla() {
  Object.assign(kayit, bos());
  kaydet();
}

/**
 * Gün bitti: günün jetonları hemen kumbaraya yazılır (akşam sayımı yalnız gösterir; sayım bitmeden çıkılsa da jeton
 * kaybolmaz), bir sonraki gün açılır, en çok mutlu müşteri kalır.
 */
export function gunBitti(k: OtobusKayit, gun: Gun, jeton: number, mutlu: number) {
  if (!k.biten.includes(gun)) k.biten.push(gun);
  k.jeton += Math.max(0, Math.floor(jeton) || 0);
  k.mutlu[String(gun)] = Math.max(k.mutlu[String(gun)] ?? 0, Math.max(0, Math.min(5, mutlu)));
  k.acikGun = Math.min(GUN_SAYISI, Math.max(k.acikGun, gun + 1));
}
