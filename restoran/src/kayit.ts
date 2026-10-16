/**
 * Kayıt: localStorage['minkino-restoran-v1'] (§6e). Her hesapta ve her alımda yazılır (uygulama kapansa da para
 * kaybolmaz). Bozuk ya da eski kayıt sessizce göç eder / sıfırlanır.
 */
import { ILK_TARIFLER } from './model';
import type { Yas } from './mini/arayuz';

export const KAYIT_ANAHTARI = 'minkino-restoran-v1';

export interface RestoranKayit {
  surum: 1;
  yas: Yas | null;
  /** tamamlanan gün sayısı */
  gun: number;
  /** kasadaki jeton */
  jeton: number;
  acilan: { tarif: string[]; alet: string[]; masa: string[]; sus: string[]; bolum: string[] };
  /** yuva → eşya (masa yerleşimi, süs) */
  yerlesim: { masa: Record<string, string>; sus: Record<string, string> };
  /** son seçilen menü (ertesi gün öneri) */
  menu: string[];
  /** son 2 günün müşterileri */
  gorulen: string[];
  /** müşteri → keşfedilen sevdikleri (pano) */
  pano: Record<string, string[]>;
  /** Babaanne'nin açılışı gösterildi mi */
  ilkOyun: boolean;
  /** masa örtüsü (defterin süs sekmesi): bütün masalara serilir */
  ortu: string | null;
  /** dün defterden alınan tarif: bugün bir müşteri mutlaka ister, Babaanne tadına bakmaya gelir (P4) */
  yeniTarif: string | null;
}

export const bosKayit = (): RestoranKayit => ({
  surum: 1,
  yas: null,
  gun: 0,
  jeton: 0,
  acilan: { tarif: [...ILK_TARIFLER], alet: [], masa: ['masa-1', 'masa-2'], sus: [], bolum: [] },
  yerlesim: { masa: { '0': 'masa-1', '1': 'masa-2' }, sus: {} },
  menu: [...ILK_TARIFLER],
  gorulen: [],
  pano: {},
  ilkOyun: false,
  ortu: null,
  yeniTarif: null,
});

const dizi = (v: unknown, yedek: string[]): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : yedek);
const kayitNesne = (v: unknown): Record<string, string> => (v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).filter(([, x]) => typeof x === 'string')) as Record<string, string> : {});

/** Ham veriden geçerli kayıt (saf; göç ve bozuk veri) */
export function kayitCoz(ham: unknown): RestoranKayit {
  const b = bosKayit();
  if (!ham || typeof ham !== 'object') return b;
  const o = ham as Partial<Record<keyof RestoranKayit, unknown>>;
  const a = (o.acilan ?? {}) as Record<string, unknown>;
  const y = (o.yerlesim ?? {}) as Record<string, unknown>;
  const pano: Record<string, string[]> = {};
  if (o.pano && typeof o.pano === 'object') for (const [k, v] of Object.entries(o.pano)) pano[k] = dizi(v, []);
  const tarif = dizi(a.tarif, b.acilan.tarif);
  for (const t of ILK_TARIFLER) if (!tarif.includes(t)) tarif.unshift(t);
  const masa = dizi(a.masa, b.acilan.masa);
  for (const m of ['masa-1', 'masa-2']) if (!masa.includes(m)) masa.unshift(m);
  // göç (P1 kaydı): masa yerleşimi yoksa masalar sırayla ilk yuvalara
  const yMasa = kayitNesne(y.masa);
  const yerde = new Set(Object.values(yMasa));
  for (const m of masa) if (!yerde.has(m)) {
    const bos = (m.startsWith('bahce-') ? ['4', '5'] : ['0', '1', '2', '3']).find((i) => !yMasa[i]);
    if (bos) yMasa[bos] = m;
  }
  return {
    surum: 1,
    yas: o.yas === 'kucuk' || o.yas === 'buyuk' ? o.yas : null,
    gun: Math.max(0, Math.floor(Number(o.gun) || 0)),
    jeton: Math.max(0, Math.floor(Number(o.jeton) || 0)),
    acilan: { tarif, alet: dizi(a.alet, []), masa, sus: dizi(a.sus, []), bolum: dizi(a.bolum, []) },
    yerlesim: { masa: yMasa, sus: kayitNesne(y.sus) },
    menu: dizi(o.menu, b.menu),
    gorulen: dizi(o.gorulen, []).slice(-16),
    pano,
    ilkOyun: o.ilkOyun === true,
    ortu: typeof o.ortu === 'string' ? o.ortu : null,
    yeniTarif: typeof o.yeniTarif === 'string' && tarif.includes(o.yeniTarif) ? o.yeniTarif : null,
  };
}

function oku(): RestoranKayit {
  try {
    const k = kayitCoz(JSON.parse(localStorage.getItem(KAYIT_ANAHTARI) ?? 'null'));
    // yaş ortak ayardan başlar (kart oyunu)
    if (!k.yas) {
      const kart = JSON.parse(localStorage.getItem('minkino-kartlar-v1') ?? 'null') as { yas?: number } | null;
      if (kart?.yas) k.yas = kart.yas >= 5 ? 'buyuk' : 'kucuk';
    }
    return k;
  } catch {
    return bosKayit();
  }
}

export const kayit: RestoranKayit = oku();

export function kaydet() {
  try {
    localStorage.setItem(KAYIT_ANAHTARI, JSON.stringify(kayit));
  } catch {
    /* gizli sekme: oyun sürer */
  }
}

export function sifirla() {
  Object.assign(kayit, bosKayit());
  try {
    localStorage.removeItem(KAYIT_ANAHTARI);
  } catch {
    /* yok say */
  }
}
