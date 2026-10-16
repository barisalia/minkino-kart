/**
 * Pati Dükkânı kaydı. YALNIZ BU CİHAZDA (localStorage; hata olursa bellekte kalır). Çocuğun seçtiği adlar dahil hiçbir
 * şey bir yere gönderilmez.
 *
 * v2 anahtarı `minkino-pati-v2`. v1 kaydı (`minkino-pati-v1`, yalnız yaş) varsa yalnız yaş taşınır.
 * Paket 2 (dükkân, Bakım Odası) ve paket 3 (ziyaretçi, mağaza, süs) için alanlar şimdiden burada; boş başlar.
 */
import type { Yas } from './ihtiyac';
import type { IhtiyacAdi, KoseAdi, MinderRenk } from './katalog';

const ANAHTAR = 'minkino-pati-v2';
const ESKI = 'minkino-pati-v1';

/** Tepki defteri: hayvan → eşya → tepki (Hayvan Defteri, paket 2) */
export type DefterTepki = 'sever' | 'olur' | 'sevmez';

export interface SahipHayvan {
  /** hayvan kimliği (katalog: tür ya da renk yavrusu) */
  id: string;
  /** çocuğun seçtiği ad (varsayılan hayvanın kendi adı) */
  ad: string;
  kose: KoseAdi;
  /** köşedeki yeri (0'dan) */
  yer: number;
  minder: MinderRenk | null;
  /** dolu kalp (0..KALP_SAYISI) */
  kalp: number;
  /** kaç kez dans etti */
  dans: number;
  /** son dansın zamanı (ms, Date.now; dinlenme) */
  sonDans: number;
  /** açık ihtiyaç (paket 2: ihtiyaç saati) */
  ihtiyac: IhtiyacAdi | null;
}

export interface PatiKayit {
  yas: Yas | null;
  /** ilk açılış (Nehir abla dükkânı bırakır, ilk jetonlar) görüldü mü */
  acildi: boolean;
  jeton: number;
  hayvanlar: SahipHayvan[];
  /** alınmış eşyalar (baştan olanlar sayılmaz; paket 3 mağaza) */
  esyalar: string[];
  /** süsler ve yerleri (paket 3) */
  susler: { ad: string; nokta: string }[];
  /** açık köşeler (salon baştan) */
  koseler: KoseAdi[];
  defter: Record<string, Record<string, DefterTepki>>;
  /** ziyaretçi sahneleri: kimlik → kaç kez (paket 3) */
  ziyaretler: Record<string, number>;
  /** günün fotoğrafları (paket 2 kapanış) */
  pano: string[];
}

export const bosKayit = (): PatiKayit => ({ yas: null, acildi: false, jeton: 0, hayvanlar: [], esyalar: [], susler: [], koseler: ['salon'], defter: {}, ziyaretler: {}, pano: [] });

const sayi = (v: unknown, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const dizi = <T>(v: unknown, f: (x: unknown) => T | null): T[] => (Array.isArray(v) ? v.map(f).filter((x): x is T => x !== null) : []);
const yasCoz = (v: unknown): Yas | null => (v === 'kucuk' || v === 'buyuk' ? v : null);
const nesne = <T>(v: unknown): T => (v && typeof v === 'object' && !Array.isArray(v) ? (v as T) : ({} as T));

function hayvanCoz(v: unknown): SahipHayvan | null {
  if (!v || typeof v !== 'object') return null;
  const h = v as Partial<SahipHayvan>;
  if (typeof h.id !== 'string' || typeof h.ad !== 'string') return null;
  return {
    id: h.id,
    ad: h.ad,
    kose: typeof h.kose === 'string' ? h.kose : 'salon',
    yer: Math.max(0, Math.floor(sayi(h.yer))),
    minder: typeof h.minder === 'string' ? h.minder : null,
    kalp: Math.max(0, Math.floor(sayi(h.kalp))),
    dans: Math.max(0, Math.floor(sayi(h.dans))),
    sonDans: sayi(h.sonDans),
    ihtiyac: typeof h.ihtiyac === 'string' ? h.ihtiyac : null,
  };
}

/** Ham kayıt (v2) → temiz kayıt; bozuk alanlar varsayılana döner. eski: v1 kaydı (yalnız yaş taşınır) */
export function kayitCoz(ham: string | null | undefined, eski?: string | null): PatiKayit {
  const k = bosKayit();
  try {
    const v = JSON.parse(ham ?? 'null') as Partial<PatiKayit> | null;
    if (v && typeof v === 'object') {
      k.yas = yasCoz(v.yas);
      k.acildi = !!v.acildi;
      k.jeton = Math.max(0, Math.floor(sayi(v.jeton)));
      k.hayvanlar = dizi(v.hayvanlar, hayvanCoz);
      k.esyalar = dizi(v.esyalar, (x) => (typeof x === 'string' ? x : null));
      k.susler = dizi(v.susler, (x) => {
        const s = x as { ad?: unknown; nokta?: unknown } | null;
        return s && typeof s.ad === 'string' ? { ad: s.ad, nokta: String(s.nokta ?? '') } : null;
      });
      const kos = dizi(v.koseler, (x) => (typeof x === 'string' ? (x as KoseAdi) : null));
      k.koseler = kos.includes('salon') ? kos : ['salon', ...kos];
      k.defter = nesne(v.defter);
      k.ziyaretler = nesne(v.ziyaretler);
      k.pano = dizi(v.pano, (x) => (typeof x === 'string' ? x : null));
      return k;
    }
  } catch {
    /* bozuk: boş kayıt */
  }
  try {
    k.yas = yasCoz((JSON.parse(eski ?? 'null') as { yas?: unknown } | null)?.yas);
  } catch {
    /* yok say */
  }
  return k;
}

function yukle(): PatiKayit {
  try {
    const ls = globalThis.localStorage;
    return kayitCoz(ls?.getItem(ANAHTAR), ls?.getItem(ESKI));
  } catch {
    return bosKayit();
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

/** Kaydı sıfırlar (test: &sifirla=1) */
export function sifirla() {
  Object.assign(kayit, bosKayit());
  kaydet();
}
