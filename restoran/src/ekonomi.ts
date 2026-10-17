/**
 * Tıkır Tıkır Lokanta · ekonomi (SAF; DOM yok, birim testli; ekip/senaryo/RESTORAN.md §6).
 *
 * Babaanne'nin Defteri dört sekme: tarif (aletiyle gelir = yeni mini oyun), masa, süs, bölüm (bahçe). Fiyatlar
 * `[3-4, 5-6]` çifti (Pati kalıbı). Kuralar:
 *  - Her gün en az bir şey alınabilir: kasadaki para hiçbir kartı karşılamıyorsa Babaanne en ucuz karta yetecek kadar
 *    jeton atar (babaanneHediyesi).
 *  - Tarif ancak mini oyunları yazılmışsa defterde görünür (oynanabilir); P3/P5 oyunları geldikçe kendiliğinden dolar.
 *  - Masa, boş masa yuvası varsa görünür (salon 4 yuva, bahçe alınınca +2 yuva ve iki bahçe masası).
 *  - Alınan tarif ertesi gün mutlaka bir müşteri tarafından istenir (kayıt: yeniTarif → gunPlani.yeniTarif).
 */
import type { Istasyon, Yas } from './mini/arayuz';
import { ILK_TARIFLER, TARIFLER } from './model';

export type Sekme = 'tarif' | 'masa' | 'sus' | 'bolum';
export const SEKMELER: readonly Sekme[] = ['tarif', 'masa', 'sus', 'bolum'];

/** Süsün nereye konduğu: örtü bütün masalara serilir (yuvasız), diğerleri kendi türündeki yuvalardan birine */
export type SusYeri = 'ortu' | 'duvar' | 'zemin' | 'tavan';

export interface DefterKalemi {
  id: string;
  sekme: Sekme;
  /** [3-4 yaş, 5-6 yaş] */
  fiyat: readonly [number, number];
  /** defterde öne çıktığı gün (§6c; daha önce de görünür, sırası arkada) */
  gun: number;
  /** tarif: yeni alet (mutfakta görünür) ve açtığı istasyon (yoksa var olan istasyonlarda oynanır) */
  alet?: string;
  istasyon?: Istasyon;
  /** süs: nereye konur */
  yer?: SusYeri;
}

/** Fiyat tablosu (§6b) */
export const FIYAT = {
  sus: [3, 5],
  masa: [5, 8],
  tarif: [6, 10],
  buyukAlet: [10, 16],
  bahce: [14, 24],
} as const;

export const KATALOG: readonly DefterKalemi[] = [
  // tarif + alet (§6c açılma sırası)
  { id: 'ayran', sekme: 'tarif', fiyat: FIYAT.tarif, gun: 1, alet: 'icecek', istasyon: 'icecek' },
  { id: 'patates', sekme: 'tarif', fiyat: FIYAT.tarif, gun: 2, alet: 'fritoz' },
  { id: 'corba', sekme: 'tarif', fiyat: FIYAT.tarif, gun: 3, alet: 'kazan' },
  { id: 'pankek', sekme: 'tarif', fiyat: FIYAT.tarif, gun: 3, alet: 'cirpma' },
  { id: 'limonata', sekme: 'tarif', fiyat: FIYAT.tarif, gun: 4, alet: 'icecek', istasyon: 'icecek' },
  { id: 'pide', sekme: 'tarif', fiyat: FIYAT.buyukAlet, gun: 4, alet: 'firin', istasyon: 'firin' },
  { id: 'kofte', sekme: 'tarif', fiyat: FIYAT.buyukAlet, gun: 5, alet: 'mangal', istasyon: 'mangal' },
  // v1.1 (P6): kendi mini oyunlarıyla, var olan istasyonlarda (şiş tezgâhta, sar mermerde, sütlaç ocakta)
  { id: 'sis', sekme: 'tarif', fiyat: FIYAT.tarif, gun: 6 },
  { id: 'borek', sekme: 'tarif', fiyat: FIYAT.tarif, gun: 6 },
  { id: 'sutlac', sekme: 'tarif', fiyat: FIYAT.tarif, gun: 6 },
  // masa
  { id: 'masa-3', sekme: 'masa', fiyat: FIYAT.masa, gun: 1 },
  { id: 'masa-4', sekme: 'masa', fiyat: FIYAT.masa, gun: 3 },
  // süs
  { id: 'ortu-kareli', sekme: 'sus', fiyat: FIYAT.sus, gun: 1, yer: 'ortu' },
  { id: 'ortu-cicekli', sekme: 'sus', fiyat: FIYAT.sus, gun: 1, yer: 'ortu' },
  { id: 'ortu-puantiyeli', sekme: 'sus', fiyat: FIYAT.sus, gun: 1, yer: 'ortu' },
  { id: 'saksi', sekme: 'sus', fiyat: FIYAT.sus, gun: 2, yer: 'zemin' },
  { id: 'resim', sekme: 'sus', fiyat: FIYAT.sus, gun: 3, yer: 'duvar' },
  { id: 'avize', sekme: 'sus', fiyat: FIYAT.sus, gun: 4, yer: 'tavan' },
  { id: 'bitki', sekme: 'sus', fiyat: FIYAT.sus, gun: 4, yer: 'zemin' },
  { id: 'akvaryum', sekme: 'sus', fiyat: FIYAT.sus, gun: 6, yer: 'zemin' },
  // P6: gramofon (§6c Gün 4; dokununca müzik, oturanlar sallanır: lokanta/surpriz.ts)
  { id: 'gramofon', sekme: 'sus', fiyat: FIYAT.sus, gun: 4, yer: 'zemin' },
  // bölüm
  { id: 'bahce', sekme: 'bolum', fiyat: FIYAT.bahce, gun: 5 },
];
export const kalem = (id: string) => KATALOG.find((k) => k.id === id);

/** Salon masa yuvası sayısı ve bahçenin getirdiği yuvalar (olcek.ts YERLESIM.masalar + bahçe) */
export const SALON_YUVA = 4;
export const BAHCE_YUVA = 2;
/** Mutfaktaki boş alet yuvaları (yeni istasyonlar: içecek tezgâhı, fırın); mangal bahçedeki mangal yuvasına */
export const ALET_YUVA = 2;
/** Süs yuvaları (lokanta/yerlesim.ts konumları) */
export const SUS_YUVALARI: Record<Exclude<SusYeri, 'ortu'>, readonly string[]> = {
  duvar: ['duvar-1', 'duvar-2'],
  zemin: ['zemin-1', 'zemin-2', 'zemin-3'],
  tavan: ['tavan-1', 'tavan-2'],
};

/** Ekonominin okuduğu kayıt alanları (kayit.ts → RestoranKayit'in alt kümesi) */
export interface EkonomiDurumu {
  jeton: number;
  acilan: { tarif: string[]; alet: string[]; masa: string[]; sus: string[]; bolum: string[] };
  yerlesim: { masa: Record<string, string>; sus: Record<string, string> };
  ortu: string | null;
  yeniTarif?: string | null;
}

export const fiyat = (k: DefterKalemi, yas: Yas) => k.fiyat[yas === 'kucuk' ? 0 : 1];
export const alinabilirMi = (k: DefterKalemi, jeton: number, yas: Yas) => jeton >= fiyat(k, yas);

/** Fiyatın jeton resimleri (§6b): 3-4 tek tek (en çok 8 resim), 5-6 beşlik büyük jeton + kalan tekler */
export function fiyatJetonlari(n: number, yas: Yas): { bes: number; tek: number } {
  if (yas === 'kucuk') return { bes: 0, tek: n };
  return { bes: Math.floor(n / 5), tek: n % 5 };
}

/** Bu kalem şu an alınmış mı */
export function alindiMi(d: EkonomiDurumu, k: DefterKalemi): boolean {
  if (k.sekme === 'tarif') return d.acilan.tarif.includes(k.id);
  if (k.sekme === 'masa') return d.acilan.masa.includes(k.id);
  if (k.sekme === 'sus') return d.acilan.sus.includes(k.id);
  return d.acilan.bolum.includes(k.id);
}

/** Masa yuvaları (salon 0-3; bahçe alınınca 4-5) */
export const masaYuvalari = (d: Pick<EkonomiDurumu, 'acilan'>): string[] => {
  const n = SALON_YUVA + (d.acilan.bolum.includes('bahce') ? BAHCE_YUVA : 0);
  return Array.from({ length: n }, (_, i) => String(i));
};
export const bosMasaYuvalari = (d: Pick<EkonomiDurumu, 'acilan' | 'yerlesim'>) => masaYuvalari(d).filter((y) => !d.yerlesim.masa[y]);
/** Süsün konabileceği boş yuvalar (örtü: yuvasız) */
export function bosSusYuvalari(d: Pick<EkonomiDurumu, 'yerlesim'>, k: DefterKalemi): string[] {
  if (!k.yer || k.yer === 'ortu') return [];
  return SUS_YUVALARI[k.yer].filter((y) => !d.yerlesim.sus[y]);
}
/** Mutfakta yeni istasyon isteyen tarifin aleti zaten var mı (limonata, ayranın içecek tezgâhını paylaşır) */
export const istasyonVarMi = (d: Pick<EkonomiDurumu, 'acilan'>, ist: Istasyon) =>
  d.acilan.alet.some((a) => KATALOG.some((k) => k.alet === a && k.istasyon === ist));
/** Alet yuvası gerekiyor mu ve boş yer var mı */
export function aletSigar(d: Pick<EkonomiDurumu, 'acilan'>, k: DefterKalemi): boolean {
  if (!k.istasyon || istasyonVarMi(d, k.istasyon)) return true;
  // mangal bahçedeki mangal yuvasına kurulur
  if (k.istasyon === 'mangal') return d.acilan.bolum.includes('bahce');
  const dolu = new Set(d.acilan.alet.map((a) => KATALOG.find((x) => x.alet === a)?.istasyon).filter((i) => i && i !== 'mangal')).size;
  return dolu < ALET_YUVA;
}

export interface DefterSecenek {
  yas: Yas;
  /** bugün (1'den) */
  gun: number;
  /** tarifin mini oyunları yazılmış mı (katalog); test/deneme modunda hep true */
  oynanabilir: (tarif: string) => boolean;
  /** her sekmede en çok kaç kart (3-4: 3, 5-6: 4) */
  enCok?: number;
}

/** Defterde bir kalemin görünüp görünmeyeceği (alınmamış, yeri var, oynanabilir) */
export function gorunurMu(d: EkonomiDurumu, k: DefterKalemi, s: Pick<DefterSecenek, 'oynanabilir'>): boolean {
  if (alindiMi(d, k)) return false;
  if (k.sekme === 'tarif') return !!TARIFLER[k.id] && s.oynanabilir(k.id) && aletSigar(d, k);
  if (k.sekme === 'masa') return bosMasaYuvalari(d).length > 0;
  if (k.sekme === 'sus') return k.yer === 'ortu' ? d.ortu !== k.id.replace(/^ortu-/, '') : bosSusYuvalari(d, k).length > 0;
  return true;
}

/** Sekme sekme defter kartları: öne çıkanlar (gün ≤ bugün, en yeni önce), sonra ucuzdan pahalıya */
export function defterKartlari(d: EkonomiDurumu, s: DefterSecenek): Record<Sekme, DefterKalemi[]> {
  const enCok = s.enCok ?? (s.yas === 'kucuk' ? 3 : 4);
  const r = { tarif: [], masa: [], sus: [], bolum: [] } as Record<Sekme, DefterKalemi[]>;
  for (const sekme of SEKMELER) {
    const l = KATALOG.filter((k) => k.sekme === sekme && gorunurMu(d, k, s));
    // aynı türden tek kart (masa-3 ile masa-4 aynı anda değil; ilk boş masa)
    const tek = sekme === 'masa' ? l.slice(0, 1) : l;
    r[sekme] = tek
      .map((k, i) => ({ k, p: (k.gun <= s.gun ? 0 : 100) + (k.gun <= s.gun ? -k.gun : k.gun) * 2 + fiyat(k, s.yas) * 0.1 + i * 0.001 }))
      .sort((a, b) => a.p - b.p)
      .slice(0, enCok)
      .map((x) => x.k);
  }
  return r;
}

/** Defterdeki en ucuz kart (yoksa null) */
export function enUcuz(kartlar: Record<Sekme, DefterKalemi[]>, yas: Yas): DefterKalemi | null {
  const hepsi = SEKMELER.flatMap((s) => kartlar[s]);
  return hepsi.length ? hepsi.reduce((a, b) => (fiyat(b, yas) < fiyat(a, yas) ? b : a)) : null;
}

/** "Kasa boş kalmaz" (§6b): hiçbir kart alınamıyorsa Babaanne en ucuz karta yetecek kadar jeton atar */
export function babaanneHediyesi(d: EkonomiDurumu, kartlar: Record<Sekme, DefterKalemi[]>, yas: Yas): number {
  const u = enUcuz(kartlar, yas);
  if (!u) return 0;
  const hepsi = SEKMELER.flatMap((s) => kartlar[s]);
  if (hepsi.some((k) => alinabilirMi(k, d.jeton, yas))) return 0;
  return fiyat(u, yas) - d.jeton;
}

export interface AlimSonucu {
  ok: boolean;
  /** yerleştirilmesi gereken (masa / süs): çocuk boş yuvalardan birini seçer */
  yuvalar?: string[];
  /** yeni mutfak istasyonu açıldı */
  istasyon?: Istasyon;
}

/**
 * Satın al: jeton düşer, kalem açılanlara yazılır. Masa ve yuvalı süs için çocuğun seçeceği boş yuvalar döner
 * (yerlestir ile konur). Tarif: aleti de gelir, yeniTarif olur (ertesi gün bir müşteri ister). Bahçe: iki bahçe
 * masası kendi yuvalarına kendiliğinden kurulur.
 */
export function satinAl(d: EkonomiDurumu, k: DefterKalemi, yas: Yas): AlimSonucu {
  if (alindiMi(d, k) || !alinabilirMi(k, d.jeton, yas)) return { ok: false };
  const f = fiyat(k, yas);
  if (k.sekme === 'tarif') {
    const yeniIst = k.istasyon && !istasyonVarMi(d, k.istasyon) ? k.istasyon : undefined;
    d.jeton -= f;
    d.acilan.tarif.push(k.id);
    if (k.alet && !d.acilan.alet.includes(k.alet)) d.acilan.alet.push(k.alet);
    d.yeniTarif = k.id;
    return { ok: true, istasyon: yeniIst };
  }
  if (k.sekme === 'masa') {
    const bos = bosMasaYuvalari(d);
    if (!bos.length) return { ok: false };
    d.jeton -= f;
    d.acilan.masa.push(k.id);
    return { ok: true, yuvalar: bos };
  }
  if (k.sekme === 'sus') {
    const bos = bosSusYuvalari(d, k);
    if (k.yer !== 'ortu' && !bos.length) return { ok: false };
    d.jeton -= f;
    d.acilan.sus.push(k.id);
    if (k.yer === 'ortu') {
      d.ortu = k.id.replace(/^ortu-/, '');
      return { ok: true };
    }
    return { ok: true, yuvalar: bos };
  }
  // bölüm: bahçe → iki bahçe masası
  d.jeton -= f;
  d.acilan.bolum.push(k.id);
  if (k.id === 'bahce')
    for (const [i, y] of ['4', '5'].entries()) {
      const id = `bahce-masa-${i + 1}`;
      if (!d.acilan.masa.includes(id)) d.acilan.masa.push(id);
      d.yerlesim.masa[y] ??= id;
    }
  return { ok: true };
}

/** Alınan masayı / süsü seçilen yuvaya koy */
export function yerlestir(d: EkonomiDurumu, id: string, yuva: string): boolean {
  const k = kalem(id);
  if (k?.sekme === 'masa') {
    if (!bosMasaYuvalari(d).includes(yuva)) return false;
    d.yerlesim.masa[yuva] = id;
    return true;
  }
  if (k?.sekme === 'sus') {
    if (!bosSusYuvalari(d, k).includes(yuva)) return false;
    d.yerlesim.sus[yuva] = id;
    return true;
  }
  return false;
}

/** Alınmış ama henüz yerleştirilmemiş masa / süs (uygulama yerleştirme ortasında kapandıysa: ilk boş yuvaya) */
export function yerlesmemisleriKoy(d: EkonomiDurumu) {
  const yerdeki = new Set([...Object.values(d.yerlesim.masa), ...Object.values(d.yerlesim.sus)]);
  for (const id of d.acilan.masa)
    if (!yerdeki.has(id)) {
      // bahçe masaları bahçe yuvalarına (4-5), diğerleri salona (0-3)
      const y = bosMasaYuvalari(d).find((x) => (Number(x) >= SALON_YUVA) === id.startsWith('bahce-'));
      if (y) d.yerlesim.masa[y] = id;
    }
  for (const id of d.acilan.sus) {
    const k = kalem(id);
    if (!k || k.yer === 'ortu' || yerdeki.has(id)) continue;
    const y = bosSusYuvalari(d, k)[0];
    if (y) d.yerlesim.sus[y] = id;
  }
}

/** Masa sayısı (günün planı: müşteri sayısı ve aynı anda masada) */
export const masaSayisi = (d: Pick<EkonomiDurumu, 'yerlesim'>) => Object.keys(d.yerlesim.masa).length;

/** Menü tahtasındaki yuva sayısı (§3a.2): 3-4 yaşta 2, 5-6 yaşta 3 */
export const menuYuvasi = (yas: Yas) => (yas === 'kucuk' ? 2 : 3);

/**
 * Bugünün menü önerisi: yeni tarif (dün alındı, bir müşteri mutlaka ister) başta, sonra dünkü menü, sonra ilk
 * tarifler. Açık tarif yuvadan azsa hepsi kendiliğinden yerleşir (seçim yok).
 */
export function menuOnerisi(acik: string[], dunku: string[], yas: Yas, yeni?: string | null): string[] {
  const n = menuYuvasi(yas);
  const sira = [...(yeni ? [yeni] : []), ...dunku, ...ILK_TARIFLER, ...acik].filter((t, i, a) => acik.includes(t) && a.indexOf(t) === i);
  return sira.slice(0, n);
}
/** Menü tahtasında gerçek bir seçim var mı (açık tarif yuvadan çok) */
export const menuSecimiVar = (acik: string[], yas: Yas) => acik.length > menuYuvasi(yas);
