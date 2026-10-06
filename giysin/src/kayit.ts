/**
 * Kino Ne Giysin? kaydı (yalnız cihazda, localStorage; uygulamada @capacitor/preferences'a da yansır).
 * Albüm: fotoğrafı çekilen mevsimler.
 */
export const KAYIT_ANAHTARI = 'minkino-giysin-v1';
export type Mevsim = 'kis' | 'ilkbahar' | 'yaz' | 'sonbahar';
export const MEVSIMLER: Mevsim[] = ['kis', 'ilkbahar', 'yaz', 'sonbahar'];

export interface Kayit {
  album: Mevsim[];
  /** kaç kez çıkıldı */
  tur: number;
}

function oku(): Kayit {
  try {
    const o = JSON.parse(localStorage.getItem(KAYIT_ANAHTARI) ?? 'null') as Partial<Kayit> | null;
    return {
      album: Array.isArray(o?.album) ? (o.album.filter((m) => MEVSIMLER.includes(m as Mevsim)) as Mevsim[]) : [],
      tur: typeof o?.tur === 'number' ? o.tur : 0,
    };
  } catch {
    return { album: [], tur: 0 };
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

export function fotoEkle(m: Mevsim) {
  if (!kayit.album.includes(m)) kayit.album.push(m);
  kayit.tur++;
  kaydet();
}

export function sifirla() {
  kayit.album = [];
  kayit.tur = 0;
  kaydet();
}
