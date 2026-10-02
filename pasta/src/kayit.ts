/** Mino'nun Pasta Otobüsü ilerlemesi (yalnız bu cihazda; localStorage, hata olursa sessizce bellekte kalır). */
import { RAF } from './model';

const ANAHTAR = 'minkino-pasta-v1';

export interface PastaKayit {
  /** kumbaradaki jeton */
  jeton: number;
  /** oynanabilen en yüksek gün (1-3) */
  acikGun: number;
  /** bitirilen günler */
  biten: number[];
  /** dükkândan alınanlar (model.ts → RAF kimlikleri) */
  alinan: string[];
  /** otobüsün boyası */
  boya: string;
}

const bos = (): PastaKayit => ({ jeton: 0, acikGun: 1, biten: [], alinan: [], boya: 'pembe' });

function yukle(): PastaKayit {
  try {
    const ham = globalThis.localStorage?.getItem(ANAHTAR);
    if (!ham) return bos();
    const k = JSON.parse(ham) as Partial<PastaKayit>;
    const idler = new Set(RAF.map((r) => r.id));
    return {
      jeton: Math.max(0, Math.floor(Number(k.jeton) || 0)),
      acikGun: Math.min(3, Math.max(1, Math.floor(Number(k.acikGun) || 1))),
      biten: Array.isArray(k.biten) ? k.biten.filter((g) => g === 1 || g === 2 || g === 3) : [],
      alinan: Array.isArray(k.alinan) ? k.alinan.filter((x) => typeof x === 'string' && idler.has(x)) : [],
      boya: typeof k.boya === 'string' ? k.boya : 'pembe',
    };
  } catch {
    return bos();
  }
}

export const kayit: PastaKayit = yukle();

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

/** Gün bitti: bir sonraki gün açılır */
export function gunBitti(gun: number) {
  if (!kayit.biten.includes(gun)) kayit.biten.push(gun);
  kayit.acikGun = Math.min(3, Math.max(kayit.acikGun, gun + 1));
  kaydet();
}
