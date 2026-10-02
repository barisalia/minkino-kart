/**
 * Okula Hazırım! ilerlemesi: yalnız bu cihazda (localStorage, `src/engine/ilerleme.ts` Depo arayüzü; hata olursa
 * bellekte kalır). Yaş, öteki oyunlarla ortak kayıttan gelir (durum.i.yas).
 *
 *  - biten: bitirilen etkinlikler (durak parlar)
 *  - bekleyen: kazanılıp henüz albüme yapıştırılmamış çıkartmalar
 *  - cikartma: albüme yapıştırılanlar (çocuk kendi eliyle)
 *  - rozet: biten bölgeler (sayi, ses, kelime)
 *  - oynama: etkinlik kaç kez bitirildi (tekrar oynanınca Kino'nun başka şakası)
 */
import type { Depo } from '../../src/engine/ilerleme';

export const ANAHTAR = 'minkino-okul-v1';

export interface OkulKayit {
  biten: string[];
  bekleyen: string[];
  cikartma: string[];
  rozet: string[];
  oynama: Record<string, number>;
}

export const bos = (): OkulKayit => ({ biten: [], bekleyen: [], cikartma: [], rozet: [], oynama: {} });

function yerelDepo(): Depo | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

const dizi = (v: unknown): string[] => (Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === 'string'))] : []);

export function yukle(d: Depo | null = yerelDepo()): OkulKayit {
  try {
    const ham = d?.getItem(ANAHTAR);
    if (!ham) return bos();
    const k = JSON.parse(ham) as Partial<OkulKayit>;
    const oynama: Record<string, number> = {};
    if (k.oynama && typeof k.oynama === 'object') for (const [id, n] of Object.entries(k.oynama)) if (Number(n) > 0) oynama[id] = Math.floor(Number(n));
    return { biten: dizi(k.biten), bekleyen: dizi(k.bekleyen), cikartma: dizi(k.cikartma), rozet: dizi(k.rozet), oynama };
  } catch {
    return bos();
  }
}

export function kaydet(k: OkulKayit, d: Depo | null = yerelDepo()) {
  try {
    d?.setItem(ANAHTAR, JSON.stringify(k));
  } catch {
    /* gizli sekme, kota: bellekte kalır */
  }
}

export interface BitisSonucu {
  /** ilk kez bitti: yeni çıkartma kazanıldı */
  ilk: boolean;
  /** bu bitişle bölge tamamlandı: rozet kazanıldı */
  rozet: boolean;
  /** kaçıncı bitiş (1: ilk) */
  kez: number;
}

/**
 * Etkinlik bitti. bolgedekiler: o bölgenin bu yaşta oynanan bütün etkinlikleri (hepsi bitince rozet).
 */
export function etkinlikBitti(k: OkulKayit, id: string, bolge: string, bolgedekiler: string[]): BitisSonucu {
  const ilk = !k.biten.includes(id);
  if (ilk) {
    k.biten.push(id);
    if (!k.cikartma.includes(id) && !k.bekleyen.includes(id)) k.bekleyen.push(id);
  }
  k.oynama[id] = (k.oynama[id] ?? 0) + 1;
  const rozet = !k.rozet.includes(bolge) && bolgedekiler.length > 0 && bolgedekiler.every((e) => k.biten.includes(e));
  if (rozet) k.rozet.push(bolge);
  return { ilk, rozet, kez: k.oynama[id] };
}

/** Çocuk çıkartmayı albüme yapıştırdı */
export function yapistir(k: OkulKayit, id: string): boolean {
  if (!k.bekleyen.includes(id)) return false;
  k.bekleyen = k.bekleyen.filter((x) => x !== id);
  if (!k.cikartma.includes(id)) k.cikartma.push(id);
  return true;
}

/** Önerilen durak: sıradaki bitmemiş etkinlik (hepsi bittiyse ilki) */
export function siradaki(k: OkulKayit, sira: string[]): string | null {
  return sira.find((id) => !k.biten.includes(id)) ?? sira[0] ?? null;
}

/** Uygulama genelinde tek kayıt */
export const kayit: OkulKayit = yukle();
export const kaydetKayit = () => kaydet(kayit);
export function sifirla() {
  Object.assign(kayit, bos());
  kaydetKayit();
}
