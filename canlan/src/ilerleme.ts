/** Çiz Canlansın ilerlemesi (bu cihazda). Yaş, kart oyunuyla ortak kayıttan gelir. */
import type { Mod } from './resimler';

const ANAHTAR = 'minkino-canlan-v1';

interface Kayit {
  /** `${mod}:${resim}` → en iyi yıldız */
  enIyi: Record<string, number>;
  /** yaş → seçilen mod */
  mod: Record<string, Mod>;
}

function yukle(): Kayit {
  try {
    const ham = globalThis.localStorage?.getItem(ANAHTAR);
    if (ham) {
      const k = JSON.parse(ham) as Partial<Kayit>;
      return { enIyi: k.enIyi ?? {}, mod: k.mod ?? {} };
    }
  } catch {
    /* bozuk kayıt: sıfırdan */
  }
  return { enIyi: {}, mod: {} };
}

export const kayit = yukle();

export function kaydet() {
  try {
    globalThis.localStorage?.setItem(ANAHTAR, JSON.stringify(kayit));
  } catch {
    /* gizli sekme vb. */
  }
}

export const enIyi = (mod: Mod, id: string) => kayit.enIyi[`${mod}:${id}`] ?? 0;

/** Yeni rekor mu? */
export function yildizKaydet(mod: Mod, id: string, y: number): boolean {
  const eski = enIyi(mod, id);
  if (y <= eski) return false;
  kayit.enIyi[`${mod}:${id}`] = y;
  kaydet();
  return true;
}
