/** Mino'nun Pasta Otobüsü ilerlemesi (yalnız bu cihazda; localStorage, hata olursa sessizce bellekte kalır). */
import { RAF, SON_OYNANAN } from './model';

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
  /** her günün en iyi yıldızı (1-3) */
  yildiz: Record<string, number>;
}

const bos = (): PastaKayit => ({ jeton: 0, acikGun: 1, biten: [], alinan: [], boya: 'pembe', yildiz: {} });
const gunMu = (g: unknown) => typeof g === 'number' && Number.isInteger(g) && g >= 1 && g <= SON_OYNANAN;

function yukle(): PastaKayit {
  try {
    const ham = globalThis.localStorage?.getItem(ANAHTAR);
    if (!ham) return bos();
    const k = JSON.parse(ham) as Partial<PastaKayit>;
    const idler = new Set(RAF.map((r) => r.id));
    const yildiz: Record<string, number> = {};
    if (k.yildiz && typeof k.yildiz === 'object') for (const [g, n] of Object.entries(k.yildiz)) if (gunMu(Number(g))) yildiz[g] = Math.max(0, Math.min(3, Math.floor(Number(n) || 0)));
    return {
      jeton: Math.max(0, Math.floor(Number(k.jeton) || 0)),
      acikGun: Math.min(SON_OYNANAN, Math.max(1, Math.floor(Number(k.acikGun) || 1))),
      biten: Array.isArray(k.biten) ? k.biten.filter(gunMu) : [],
      alinan: Array.isArray(k.alinan) ? k.alinan.filter((x) => typeof x === 'string' && idler.has(x)) : [],
      boya: typeof k.boya === 'string' ? k.boya : 'pembe',
      yildiz,
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

/** Toplam yıldız (her günün en iyisi) */
export const toplamYildiz = (k: PastaKayit = kayit) => Object.values(k.yildiz).reduce((t, n) => t + n, 0);

/** Gün bitti: yıldız yazılır (en iyisi kalır), bir sonraki gün açılır */
export function gunBitti(gun: number, yildiz = 1) {
  if (!kayit.biten.includes(gun)) kayit.biten.push(gun);
  kayit.yildiz[String(gun)] = Math.max(kayit.yildiz[String(gun)] ?? 0, Math.max(1, Math.min(3, yildiz)));
  kayit.acikGun = Math.min(SON_OYNANAN, Math.max(kayit.acikGun, gun + 1));
  kaydet();
}
