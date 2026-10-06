/**
 * Kino Ne Giysin? kaydı (yalnız cihazda, localStorage; uygulamada @capacitor/preferences'a da yansır).
 * Albüm: fotoğrafı çekilen mevsimler ve o fotoğraftaki giysiler; dört mevsim dolunca Mevsim Ustası rozeti.
 */
import { MEVSIMLER, TURLAR, type GiysiId, type Mevsim } from './model';

export { MEVSIMLER, type Mevsim };
export const KAYIT_ANAHTARI = 'minkino-giysin-v1';

export interface Kayit {
  album: Mevsim[];
  /** her mevsimin fotoğrafındaki giysiler (albümde aynı kare) */
  kiyafet: Partial<Record<Mevsim, GiysiId[]>>;
  /** kaç kez çıkıldı */
  tur: number;
  /** Mevsim Ustası rozeti verildi (töreni bir kez) */
  rozet: boolean;
}

function oku(): Kayit {
  try {
    const o = JSON.parse(localStorage.getItem(KAYIT_ANAHTARI) ?? 'null') as Partial<Kayit> | null;
    const kiyafet: Kayit['kiyafet'] = {};
    if (o?.kiyafet && typeof o.kiyafet === 'object')
      for (const m of MEVSIMLER) {
        const k = (o.kiyafet as Record<string, unknown>)[m];
        if (Array.isArray(k)) kiyafet[m] = k.filter((g): g is GiysiId => typeof g === 'string');
      }
    return {
      album: Array.isArray(o?.album) ? (o.album.filter((m) => MEVSIMLER.includes(m as Mevsim)) as Mevsim[]) : [],
      kiyafet,
      tur: typeof o?.tur === 'number' ? o.tur : 0,
      rozet: o?.rozet === true,
    };
  } catch {
    return { album: [], kiyafet: {}, tur: 0, rozet: false };
  }
}

export const kayit: Kayit = oku();

export function kaydet() {
  try {
    localStorage.setItem(KAYIT_ANAHTARI, JSON.stringify(kayit));
  } catch {
    /* gizli sekme: kayıt tutulmaz, oyun sürer */
  }
}

/** Fotoğraf albüme girdi; dört mevsim ilk kez dolduysa true (rozet töreni) */
export function fotoEkle(m: Mevsim, giyili?: GiysiId[]): boolean {
  if (!kayit.album.includes(m)) kayit.album.push(m);
  if (giyili?.length) kayit.kiyafet[m] = [...giyili];
  kayit.tur++;
  const yeniRozet = !kayit.rozet && MEVSIMLER.every((x) => kayit.album.includes(x));
  if (yeniRozet) kayit.rozet = true;
  kaydet();
  return yeniRozet;
}

/** Albümdeki karenin giysileri (kayıt yoksa turun gerekli giysileri) */
export const fotoKiyafeti = (m: Mevsim): GiysiId[] => kayit.kiyafet[m] ?? TURLAR[m].gerekli;

export function sifirla() {
  kayit.album = [];
  kayit.kiyafet = {};
  kayit.tur = 0;
  kayit.rozet = false;
  kaydet();
}
