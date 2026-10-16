/**
 * Kino'nun Otobüsü (dondurma): oyunun saf mantığı (DOM yok, birim testli). Tasarım: ekip/senaryo/KINO-OTOBUS-V3.md
 * (V3 · Seç, Sat, Kazan, Büyüt; eskisi kino-otobus.md).
 *
 * - Tatlar, soslar, süsler, kaplar; günlerin açtıkları (Gün 1 park, Gün 2 plaj, Gün 3 doğum günü bahçesi). Ödülle açılan
 *   tat ve süs (vişne, portakal, pamuk şeker; yıldız kurabiye, muz, çikolata parçası) tezgâhın özel yuvasında durur.
 * - Müşteri havuzu (26): sevdiği ve sevmediği şeyler, kaynağı (iskelet, kit, durağan resim), kendi sesi.
 * - Günün planı: güne bağlı istek şablonları (resimli, ipuçlu, sürpriz, 5-6'da özel) + havuzdan rastgele müşteriler.
 * - Kabul ve tepki: bayıldı / mmm / komik (ceza yok); ödeme top sayısı kadar jeton (bayılırsa +1; 3-4 en çok 3,
 *   5-6 en çok 5).
 * - Hazırlık yuvası: kap koy, top koy, sos dök, süs koy, en üsttekini ye (geri alma). Süre yok: hiçbir işlem beklemez.
 * - Gün sonu ödülü: üç kart (tat, süs, görünüm), biri seçilir, ertesi gün oyunda.
 */
import K from '../../content/kino-otobus.json';
import { buyukHarfBas, sayiAdi } from '../../src/audio/metin';

export type Tat = 'cilek' | 'vanilya' | 'cikolata' | 'limon' | 'fistik' | 'yabanmersini' | 'visne' | 'portakal' | 'pamukseker';
/** istekteki bir top (eski kayıtlarla uyum için ad korunur: artık yalnız tat) */
export type TatIstek = Tat;
export type Kap = 'kulah' | 'kase' | 'kupa';
export type Sos = 'cikolata' | 'cilek' | 'karamel';
export type Sus = 'serpinti' | 'kiraz' | 'gofret' | 'semsiye' | 'kalp' | 'yildiz' | 'muz' | 'cikolataParca';
export type Yas = 'kucuk' | 'buyuk';
export type Gun = 1 | 2 | 3;
export type Yer = 'park' | 'plaj' | 'dogumgunu';
/** resimli: balonda tam dondurma resmi; ipucu: tek ipucu resmi (birden çok doğru); surpriz: "sen seç"; ötekiler 5-6 özel istekleri (resimli) */
export type IstekTuru = 'resimli' | 'ipucu' | 'surpriz' | 'sira' | 'oruntu' | 'birFazla' | 'paylasma' | 'dogumgunu';

/** Gün 1-3'ün temel tatları (ödülle açılanlar özel yuvada) */
export const TEMEL_TATLAR: readonly Tat[] = ['cilek', 'vanilya', 'cikolata', 'limon', 'fistik', 'yabanmersini'];
/** Ödülle açılan tatlar (sırayla) */
export const YENI_TATLAR: readonly Tat[] = ['visne', 'portakal', 'pamukseker'];
export const TATLAR: readonly Tat[] = [...TEMEL_TATLAR, ...YENI_TATLAR];
export const SOSLAR: readonly Sos[] = ['cikolata', 'cilek', 'karamel'];
export const TEMEL_SUSLER: readonly Sus[] = ['serpinti', 'kiraz', 'gofret', 'semsiye', 'kalp'];
/** Ödülle açılan süsler (sırayla) */
export const YENI_SUSLER: readonly Sus[] = ['yildiz', 'muz', 'cikolataParca'];
export const SUSLER: readonly Sus[] = [...TEMEL_SUSLER, ...YENI_SUSLER];
export const KAPLAR: readonly Kap[] = ['kulah', 'kase', 'kupa'];

/** Tatların renkleri (yer tutucu çizimler; gerçek görsel gelince yalnız yedek) */
export const TAT_RENK: Record<Tat, { ana: string; koyu: string; acik: string }> = {
  cilek: { ana: '#FF8DB4', koyu: '#E2588A', acik: '#FFC6DA' },
  vanilya: { ana: '#FFEFC2', koyu: '#E8CB86', acik: '#FFFBEA' },
  cikolata: { ana: '#9A5B3A', koyu: '#6E3B22', acik: '#C0835E' },
  limon: { ana: '#FFE45C', koyu: '#E2BE1E', acik: '#FFF4A8' },
  fistik: { ana: '#A9DB8C', koyu: '#77B65A', acik: '#D3F0C0' },
  yabanmersini: { ana: '#8C88E0', koyu: '#5F5ABD', acik: '#BDBAF5' },
  visne: { ana: '#D8324A', koyu: '#A81F35', acik: '#F07A8A' },
  portakal: { ana: '#FFA23A', koyu: '#E07A12', acik: '#FFCB8A' },
  pamukseker: { ana: '#9FD8F5', koyu: '#62B4E0', acik: '#D2EEFC' },
};
export const SOS_RENK: Record<Sos, { ana: string; koyu: string }> = {
  cikolata: { ana: '#6B3A22', koyu: '#4A2412' },
  cilek: { ana: '#F0436F', koyu: '#C42452' },
  karamel: { ana: '#E39A2F', koyu: '#B86F12' },
};

/** Bir kapta en çok kaç top (fazlası: Kino havada yakalar, yer) */
export const EN_COK_TOP: Record<Kap, number> = { kulah: 4, kase: 3, kupa: 5 };
/** Bir süsten en çok kaç tane (serpinti tek: bir kez serpilir) */
export const EN_COK_SUS: Record<Sus, number> = { serpinti: 1, kiraz: 5, gofret: 5, semsiye: 5, kalp: 5, yildiz: 3, muz: 3, cikolataParca: 3 };

export interface GunAyar {
  yer: Yer;
  tatlar: readonly Tat[];
  soslar: readonly Sos[];
  susler: readonly Sus[];
  kaplar: readonly Kap[];
  /** hedef: mutlu (bayıldı ya da mmm) müşteri sayısı */
  hedef: number;
}
export const GUN_SAYISI = 3;
export const GUNLER: Record<Gun, GunAyar> = {
  1: { yer: 'park', tatlar: ['cilek', 'vanilya', 'cikolata'], soslar: ['cikolata'], susler: [], kaplar: ['kulah', 'kase'], hedef: 3 },
  2: { yer: 'plaj', tatlar: TEMEL_TATLAR, soslar: SOSLAR, susler: ['serpinti', 'kiraz', 'gofret'], kaplar: ['kulah', 'kase'], hedef: 4 },
  3: { yer: 'dogumgunu', tatlar: TEMEL_TATLAR, soslar: SOSLAR, susler: TEMEL_SUSLER, kaplar: KAPLAR, hedef: 4 },
};

/** Ödülle açılanlar (kayıtta) */
export interface Acilan {
  tat: Tat[];
  sus: Sus[];
  /** otobüs / Kino süsleri (OTOBUS_SUSLERI kimlikleri) */
  gorunum: string[];
}
export const bosAcilan = (): Acilan => ({ tat: [], sus: [], gorunum: [] });

/** O gün tezgâhta açık olanlar: günün temel tatları + bugünün özel tadı; temel süsler + özel süs */
export function acikGun(gun: Gun, ozelTat: Tat | null = null, ozelSus: Sus | null = null): GunAyar {
  const a = GUNLER[gun];
  return {
    ...a,
    tatlar: ozelTat && !a.tatlar.includes(ozelTat) ? [...a.tatlar, ozelTat] : a.tatlar,
    susler: ozelSus && !a.susler.includes(ozelSus) ? [...a.susler, ozelSus] : a.susler,
  };
}

// ---------------------------------------------------------------- dondurma ve istek

/** Yapılan dondurma: kap, alttan üste toplar, en üstteki topun sosu, konuş sırasıyla süsler */
export interface Dondurma {
  kap: Kap;
  toplar: Tat[];
  sos: Sos | null;
  susler: Sus[];
}
/** İstenen dondurma */
export interface Istenen {
  kap: Kap;
  toplar: TatIstek[];
  sos: Sos | null;
  susler: Partial<Record<Sus, number>>;
}

/** İpucu türleri: balonda tek ipucu resmi */
export type IpucuOzellik = 'serin' | 'pembe' | 'kocaman' | 'cikolata' | 'ikiRenk' | 'meyveli' | 'yeni';
export interface Ipucu {
  ozellik: IpucuOzellik;
  /** 5-6: ikinci özellik, tam top sayısı ("serin ve iki top") */
  top?: number;
  /** yeni: dün açılan tat ya da süs */
  yeni?: { tat?: Tat; sus?: Sus };
}

export interface Siparis {
  /** günün içindeki sıra (0..4) */
  no: number;
  musteri: string;
  /** paylaşma: yanında kardeşi (Deniz-Zeynep, Bıdık-Bıdıcık) */
  ikinci?: string;
  tur: IstekTuru;
  /**
   * Bir ya da (paylaşmada) iki dondurma. İpuçlu ve sürprizde bu yalnız ÖRNEK bir doğrudur (geç ipucu buna göre
   * parlar); kabul kuralı ipucu / sürpriz.
   */
  istek: Istenen[];
  /** topların sırası önemli mi (5-6 sıra ve örüntü) */
  sira: boolean;
  ipucu?: Ipucu;
  /** "bir fazla": kimin dondurmasından (balonda onun dondurması + bir top) */
  referans?: { musteri: string; dondurma: Istenen };
  /** örüntü: balonda bu sıradaki top "?" olarak görünür */
  gizli?: number;
  /** paylaşma (5-6): balonda büyük kupa (bütün toplar) ve iki boş kâse */
  kupaResmi?: boolean;
  /** ilk oynayışta Gün 1'in ilk müşterisi (Mino): durumu anlatır, emir vermez */
  ogretici?: boolean;
}

const ist = (kap: Kap, toplar: TatIstek[], sos: Sos | null = null, susler: Partial<Record<Sus, number>> = {}): Istenen => ({ kap, toplar, sos, susler });

// ---------------------------------------------------------------- müşteri havuzu (26)

export type Kaynak = 'mino' | 'iskelet' | 'kit' | 'duragan';
/** Sevmediği verilince oynanan komik an (MVP: yüz değişimi, titreme, "!"; yama resimleri Faz 2) */
export type Gag = 'eksi' | 'morDil' | 'kahveGaga' | 'yapiskan' | 'omuz' | 'kulak' | 'tuy' | 'gomul' | 'bugu' | 'dis' | 'mavi' | 'sakal' | 'bos';
export interface MusteriTanim {
  ad: string;
  kaynak: Kaynak;
  /** sevdiği bir şey var mı (bayılma) */
  sever: (d: Dondurma) => boolean;
  /** sevmediği bir şey var mı (komik) */
  sevmez?: (d: Dondurma) => boolean;
  gag?: Gag;
  /** resimli isteklerde konan tat ({sevdigi}) */
  favori: Tat;
  favoriSos?: Sos;
  favoriSus?: Sus;
  /** sevmediği tatlar (istek şablonu bunları koymaz) */
  sevmezTat?: Tat[];
  sevmezSos?: Sos;
  sevmezSus?: Sus;
  /** istekteki top sayısı sınırı (Tombi kocaman ister, Lokum tek top) */
  enAzTop?: number;
  enCokTop?: number;
  /** kendi sesi (content/film2/sesler.json anahtarı) */
  ses?: string;
  /** çift (hep birlikte gelir): ikinci kişinin adı */
  ikinci?: string;
}
const tatVar = (d: Dondurma, ...t: Tat[]) => d.toplar.some((x) => t.includes(x));
const susVar = (d: Dondurma, ...s: Sus[]) => d.susler.some((x) => s.includes(x));
const PEMBE = (d: Dondurma) => tatVar(d, 'cilek') || d.sos === 'cilek' || susVar(d, 'kalp');
const m = (t: MusteriTanim) => t;

/** Havuzun müşterileri (V3 §6). Mino yalnız ilk Gün 1'de ve Gün 3'ün doğum gününde gelir. */
export const MUSTERILER: readonly MusteriTanim[] = [
  m({ ad: 'mino', kaynak: 'mino', sever: (d) => tatVar(d, 'cilek'), favori: 'cilek' }),
  m({ ad: 'tavsan', kaynak: 'iskelet', sever: (d) => tatVar(d, 'cilek'), sevmez: (d) => tatVar(d, 'limon'), gag: 'eksi', favori: 'cilek', sevmezTat: ['limon'] }),
  m({ ad: 'ayi', kaynak: 'iskelet', sever: (d) => d.sos === 'karamel', sevmez: (d) => tatVar(d, 'yabanmersini'), gag: 'morDil', favori: 'vanilya', favoriSos: 'karamel', sevmezTat: ['yabanmersini'] }),
  m({ ad: 'ordek', kaynak: 'iskelet', sever: (d) => tatVar(d, 'limon'), sevmez: (d) => tatVar(d, 'cikolata') || d.sos === 'cikolata', gag: 'kahveGaga', favori: 'limon', sevmezTat: ['cikolata'], sevmezSos: 'cikolata' }),
  m({ ad: 'kus', kaynak: 'iskelet', sever: (d) => tatVar(d, 'yabanmersini'), sevmez: (d) => d.sos === 'karamel', gag: 'yapiskan', favori: 'yabanmersini', sevmezSos: 'karamel' }),
  m({ ad: 'maymun', kaynak: 'iskelet', sever: (d) => tatVar(d, 'fistik') || susVar(d, 'gofret'), sevmez: (d) => d.toplar.length > 0 && d.toplar.every((t) => t === 'vanilya'), gag: 'omuz', favori: 'fistik', favoriSus: 'gofret' }),
  m({ ad: 'inek', kaynak: 'iskelet', sever: (d) => tatVar(d, 'vanilya'), favori: 'vanilya' }),
  m({ ad: 'kopek', kaynak: 'iskelet', sever: (d) => tatVar(d, 'vanilya'), sevmez: (d) => tatVar(d, 'limon'), gag: 'kulak', favori: 'vanilya', sevmezTat: ['limon'] }),
  m({ ad: 'pamuk', kaynak: 'iskelet', sever: PEMBE, sevmez: (d) => tatVar(d, 'fistik'), gag: 'tuy', favori: 'cilek', favoriSos: 'cilek', sevmezTat: ['fistik'] }),
  m({ ad: 'ada', kaynak: 'iskelet', sever: (d) => tatVar(d, 'cilek') || susVar(d, 'serpinti'), favori: 'cilek', favoriSus: 'serpinti' }),
  m({ ad: 'can', kaynak: 'iskelet', sever: (d) => tatVar(d, 'cikolata'), sevmez: (d) => tatVar(d, 'limon'), gag: 'eksi', favori: 'cikolata', sevmezTat: ['limon'] }),
  m({ ad: 'elif', kaynak: 'iskelet', sever: (d) => tatVar(d, 'limon'), sevmez: (d) => d.sos === 'karamel', gag: 'yapiskan', favori: 'limon', sevmezSos: 'karamel' }),
  m({ ad: 'deniz', kaynak: 'iskelet', ikinci: 'zeynep', sever: () => false, favori: 'cilek' }),
  m({ ad: 'zeynep', kaynak: 'iskelet', sever: () => false, favori: 'vanilya' }),
  m({ ad: 'lokum', kaynak: 'kit', ses: 'lokum', sever: (d) => d.toplar.length === 1 && tatVar(d, 'vanilya'), sevmez: (d) => d.toplar.length >= 3, gag: 'gomul', favori: 'vanilya', enCokTop: 1 }),
  m({ ad: 'anne', kaynak: 'kit', ses: 'anne', sever: (d) => tatVar(d, 'cilek', 'yabanmersini'), favori: 'cilek' }),
  m({ ad: 'baba', kaynak: 'kit', ses: 'baba', sever: (d) => tatVar(d, 'cikolata') || d.sos === 'karamel', sevmez: (d) => tatVar(d, 'limon'), gag: 'bugu', favori: 'cikolata', favoriSos: 'karamel', sevmezTat: ['limon'] }),
  m({ ad: 'babaanne', kaynak: 'kit', ses: 'babaanne', sever: (d) => tatVar(d, 'fistik'), sevmez: (d) => susVar(d, 'serpinti'), gag: 'dis', favori: 'fistik', sevmezSus: 'serpinti' }),
  m({ ad: 'dede', kaynak: 'kit', ses: 'dede', sever: (d) => tatVar(d, 'vanilya') || susVar(d, 'kiraz'), sevmez: (d) => tatVar(d, 'pamukseker'), gag: 'mavi', favori: 'vanilya', favoriSus: 'kiraz', sevmezTat: ['pamukseker'] }),
  m({ ad: 'nehir', kaynak: 'duragan', ses: 'nehir', sever: (d) => tatVar(d, 'yabanmersini'), favori: 'yabanmersini' }),
  m({ ad: 'bidik', kaynak: 'duragan', ses: 'bidik', ikinci: 'bidicik', sever: (d) => d.toplar.length > 0, favori: 'cikolata' }),
  m({ ad: 'bidicik', kaynak: 'duragan', ses: 'bidicik', sever: (d) => d.toplar.length > 0, favori: 'cilek' }),
  m({ ad: 'bidik-baba', kaynak: 'duragan', ses: 'bidik-baba', sever: (d) => tatVar(d, 'limon'), sevmez: (d) => tatVar(d, 'cikolata') || d.sos === 'cikolata', gag: 'sakal', favori: 'limon', sevmezTat: ['cikolata'], sevmezSos: 'cikolata' }),
  m({ ad: 'tombi', kaynak: 'duragan', ses: 'tombi', sever: (d) => d.toplar.length >= 3, sevmez: (d) => d.toplar.length === 1, gag: 'bos', favori: 'cikolata', enAzTop: 3 }),
  m({ ad: 'bulut', kaynak: 'duragan', ses: 'bulut', sever: (d) => tatVar(d, 'vanilya'), favori: 'vanilya' }),
  m({ ad: 'zipzip', kaynak: 'duragan', ses: 'zipzip', sever: (d) => tatVar(d, 'portakal', 'limon'), favori: 'limon' }),
];
export const musteriTanim = (ad: string): MusteriTanim | undefined => MUSTERILER.find((t) => t.ad === ad);
/** Kendi sesi olan (Seri 2) müşteriler: isteğini kendi söyler (ses gelene dek balonda yazı + Mino'nun durum cümlesi) */
export const sesliMi = (ad: string) => !!musteriTanim(ad)?.ses;

// ---------------------------------------------------------------- rastgele (tohumlu)

/** Tohumlu rastgele (mulberry32): aynı tohum aynı plan */
export function rastgeleUret(tohum: number): () => number {
  let a = tohum >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const karistir = <T>(l: readonly T[], r: () => number): T[] => {
  const a = [...l];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const sec = <T>(l: readonly T[], r: () => number): T => l[Math.floor(r() * l.length)];

// ---------------------------------------------------------------- günün planı: şablon + havuz

/** Şablon yuvası: istek türü; ipucu yuvasında 'yeni' zorlanabilir */
type Yuvacik = 'resimli' | 'ipucu' | 'surpriz' | 'sira' | 'birFazla' | 'paylasma' | 'oruntu' | 'dogumgunu';
/** Günün karışımı (V3 §2.2) */
export function gunSablonu(gun: Gun, yas: Yas): Yuvacik[] {
  if (yas === 'kucuk') {
    if (gun === 3) return ['resimli', 'ipucu', 'surpriz', 'ipucu', 'dogumgunu'];
    return ['resimli', 'ipucu', 'surpriz', 'resimli', 'ipucu'];
  }
  if (gun === 1) return ['resimli', 'ipucu', 'sira', 'surpriz', 'ipucu'];
  if (gun === 2) return ['ipucu', 'resimli', 'birFazla', 'surpriz', 'ipucu'];
  return ['ipucu', 'paylasma', 'surpriz', 'oruntu', 'dogumgunu'];
}

export interface PlanAyar {
  /** rastgele tohumu (aynı tohum: aynı plan) */
  tohum?: number;
  /** son oyunlarda gelen müşteriler (önce gelmeyenler seçilir) */
  gorulen?: readonly string[];
  /** ilk oynayış (Gün 1'in ilk müşterisi Mino) */
  ilk?: boolean;
  /** bugün tezgâhta duran özel tat / süs */
  ozelTat?: Tat | null;
  ozelSus?: Sus | null;
  /** dün açılan (1 istek mutlaka onu içerir) */
  yeni?: { tat?: Tat; sus?: Sus } | null;
  /** resmi gelmiş müşteriler (yoksa havuzdan düşer); verilmezse hepsi var */
  varMi?: (ad: string) => boolean;
  /** önce seçilecekler (test ve gösterim: belli müşteriler) */
  once?: readonly string[];
}

const KIT_EN_COK = 2;

/** İpucu özelliği bir dondurmada var mı (5-6'da top sayısı da) */
export function ipucuUyar(ip: Ipucu, d: Dondurma): boolean {
  if (!d.toplar.length) return false;
  if (ip.top !== undefined && d.toplar.length !== ip.top) return false;
  switch (ip.ozellik) {
    case 'serin':
      return d.toplar.every((t) => SERIN_TATLAR.includes(t));
    case 'pembe':
      return PEMBE(d);
    case 'kocaman':
      return d.toplar.length >= 3;
    case 'cikolata':
      return tatVar(d, 'cikolata') || d.sos === 'cikolata' || susVar(d, 'cikolataParca');
    case 'ikiRenk':
      return new Set(d.toplar).size >= 2;
    case 'meyveli':
      return tatVar(d, ...MEYVELI);
    case 'yeni':
      return (!!ip.yeni?.tat && tatVar(d, ip.yeni.tat)) || (!!ip.yeni?.sus && susVar(d, ip.yeni.sus));
  }
}
/** serin (sıcak gün): ekşi ve meyveli tatlar */
export const SERIN_TATLAR: readonly Tat[] = ['limon', 'cilek', 'portakal', 'visne'];
export const MEYVELI: readonly Tat[] = ['cilek', 'limon', 'yabanmersini', 'visne', 'portakal'];

/** Müşteriye uygun (sevmediği olmayan) açık tatlar */
function uygunTatlar(t: MusteriTanim | undefined, acik: readonly Tat[]): Tat[] {
  const l = acik.filter((x) => !t?.sevmezTat?.includes(x) && x !== 'pamukseker' && x !== 'visne' && x !== 'portakal');
  return l.length ? l : [...acik];
}

/** İpuçlu istek için örnek bir doğru dondurma (geç ipucu buna göre parlar) */
function ipucuOrnek(ip: Ipucu, t: MusteriTanim | undefined, a: GunAyar, r: () => number): Istenen {
  const uygun = uygunTatlar(t, a.tatlar);
  const fav = uygun.includes(t?.favori as Tat) ? t!.favori : uygun[0];
  const n = ip.top ?? Math.min(t?.enCokTop ?? 9, Math.max(t?.enAzTop ?? 0, ip.ozellik === 'kocaman' ? 3 : ip.ozellik === 'ikiRenk' ? 2 : 1));
  const kap: Kap = n > 3 ? (a.kaplar.includes('kupa') ? 'kupa' : 'kulah') : sec(a.kaplar.filter((k) => k !== 'kupa'), r);
  const ilk = (l: readonly Tat[]) => l.find((x) => uygun.includes(x) && a.tatlar.includes(x)) ?? l.find((x) => a.tatlar.includes(x)) ?? fav;
  let tat: Tat;
  let sos: Sos | null = null;
  const susler: Partial<Record<Sus, number>> = {};
  switch (ip.ozellik) {
    case 'serin':
      tat = ilk(SERIN_TATLAR.includes(fav) ? [fav, ...SERIN_TATLAR] : SERIN_TATLAR);
      break;
    case 'pembe':
      tat = 'cilek';
      break;
    case 'cikolata':
      tat = ilk(['cikolata']);
      break;
    case 'meyveli':
      tat = ilk(MEYVELI.includes(fav) ? [fav, ...MEYVELI] : MEYVELI);
      break;
    case 'yeni':
      tat = ip.yeni?.tat && a.tatlar.includes(ip.yeni.tat) ? ip.yeni.tat : fav;
      if (ip.yeni?.sus && a.susler.includes(ip.yeni.sus)) susler[ip.yeni.sus] = 1;
      break;
    default:
      tat = fav;
  }
  const toplar: Tat[] = [tat];
  while (toplar.length < n) {
    // iki renk: ikinci top farklı; serin: yine serin; öbürleri favori
    const ikinci = ip.ozellik === 'ikiRenk' || ip.ozellik === 'meyveli' ? uygun.find((x) => !toplar.includes(x)) : ip.ozellik === 'serin' ? ilk(SERIN_TATLAR) : tat;
    toplar.push(ikinci ?? tat);
  }
  if (ip.ozellik === 'serin' && !toplar.every((x) => SERIN_TATLAR.includes(x))) toplar.fill('cilek');
  return ist(kap, toplar, sos, susler);
}

/** Resimli (ve 5-6 özel) istek: {sevdigi} müşterinin favorisi; sevmediği hiçbir şey konmaz */
function resimliIstek(t: MusteriTanim | undefined, a: GunAyar, yas: Yas, r: () => number, ozelTat: Tat | null, ozelSus: Sus | null): Istenen {
  const uygun = uygunTatlar(t, a.tatlar);
  const fav = uygun.includes(t?.favori as Tat) ? t!.favori : sec(uygun, r);
  const n = Math.min(t?.enCokTop ?? 9, Math.max(t?.enAzTop ?? 0, yas === 'buyuk' ? 2 + Math.floor(r() * 2) : 1 + Math.floor(r() * 2)));
  const kap: Kap = sec(a.kaplar.filter((k) => k !== 'kupa'), r);
  const toplar: Tat[] = [fav];
  while (toplar.length < n) toplar.push(r() < 0.5 ? fav : sec(uygun, r));
  // özel tat dolaptaysa bazen istenir (çocuk yeni tadı kullanır)
  if (ozelTat && a.tatlar.includes(ozelTat) && !t?.sevmezTat?.includes(ozelTat) && r() < 0.35) toplar[toplar.length - 1] = ozelTat;
  let sos: Sos | null = null;
  if (t?.favoriSos && a.soslar.includes(t.favoriSos)) sos = t.favoriSos;
  else if (r() < 0.4) {
    const s = a.soslar.filter((x) => x !== t?.sevmezSos);
    if (s.length) sos = sec(s, r);
  }
  const susler: Partial<Record<Sus, number>> = {};
  if (yas === 'buyuk' || r() < 0.5) {
    const fs = t?.favoriSus && a.susler.includes(t.favoriSus) ? t.favoriSus : ozelSus && a.susler.includes(ozelSus) && r() < 0.4 ? ozelSus : null;
    if (fs) susler[fs] = fs === 'serpinti' ? 1 : 1 + Math.floor(r() * (yas === 'buyuk' ? 3 : 2));
  }
  return ist(kap, toplar, sos, susler);
}

/** Bir müşteri (ya da çift) bir yuvaya uygun mu */
function yuvayaUygun(y: Yuvacik, t: MusteriTanim, yas: Yas): boolean {
  if (t.kaynak === 'mino') return false;
  if (y === 'paylasma') return !!t.ikinci;
  // çiftler 3-4'te resimli yuvada "ikisine aynısı" olarak gelir; 5-6'da yalnız paylaşmada
  if (t.ikinci) return yas === 'kucuk' && y === 'resimli';
  const gerek = ({ sira: 2, birFazla: 3, oruntu: 4 } as Partial<Record<Yuvacik, number>>)[y];
  if (gerek && (t.enCokTop ?? 9) < gerek) return false;
  if (y === 'oruntu') return !t.sevmezTat?.includes('limon') && !t.sevmezTat?.includes('cilek');
  return true;
}

/**
 * Günün planı (V3 §2.2, §6): güne bağlı şablon, müşteriler havuzdan rastgele. Kurallar: aynı gün aynı müşteri iki kez
 * gelmez; son oyunlarda gelmeyenler önce; Mino yalnız ilk Gün 1 (anlatır) ve Gün 3 doğum gününde; çiftler birlikte;
 * kit (aile) günde en çok 2; dün açılan tat / süs bir istekte.
 */
export function gunPlani(gun: Gun, yas: Yas, o: PlanAyar = {}): Siparis[] {
  const r = rastgeleUret(o.tohum ?? 1);
  const a = acikGun(gun, o.ozelTat ?? null, o.ozelSus ?? null);
  const sablon = gunSablonu(gun, yas);
  const gorulen = new Set(o.gorulen ?? []);
  const varMi = o.varMi ?? (() => true);
  // ikinciler (Zeynep, Bıdıcık) kendi başına seçilmez: çiftin ilkiyle gelir
  const ikinciler = new Set(MUSTERILER.flatMap((t) => (t.ikinci ? [t.ikinci] : [])));
  const aday = MUSTERILER.filter((t) => t.kaynak !== 'mino' && !ikinciler.has(t.ad) && varMi(t.ad) && (!t.ikinci || varMi(t.ikinci)));
  // önce gelmeyenler (karışık), sonra gelenler (karışık)
  const once = o.once ?? [];
  const sira = [
    ...once.flatMap((ad) => aday.filter((t) => t.ad === ad)),
    ...karistir(aday.filter((t) => !gorulen.has(t.ad) && !once.includes(t.ad)), r),
    ...karistir(aday.filter((t) => gorulen.has(t.ad) && !once.includes(t.ad)), r),
  ];
  const kullanilan = new Set<string>();
  let kit = 0;
  let yeniKondu = !o.yeni || (!o.yeni.tat && !o.yeni.sus);
  const l: Omit<Siparis, 'no'>[] = [];
  sablon.forEach((y, i) => {
    if (y === 'dogumgunu') {
      const toplar: Tat[] = yas === 'buyuk' ? ['cilek', 'vanilya', 'cikolata', 'cilek'] : ['cilek', 'vanilya', 'cikolata'];
      l.push({ musteri: 'mino', tur: 'dogumgunu', sira: false, istek: [ist('kupa', toplar, 'cilek', { kiraz: 1 })] });
      return;
    }
    if (i === 0 && o.ilk && gun === 1) {
      // ilk oynayış: Mino tezgâha yaslanır, "Pembe bir şey canım çekti…" (ipucu: pembe)
      const ip: Ipucu = { ozellik: 'pembe' };
      l.push({ musteri: 'mino', tur: 'ipucu', sira: false, ipucu: ip, ogretici: true, istek: [ipucuOrnek(ip, musteriTanim('mino'), a, r)] });
      return;
    }
    const t = sira.find((x) => !kullanilan.has(x.ad) && yuvayaUygun(y, x, yas) && (x.kaynak !== 'kit' || kit < KIT_EN_COK)) ?? sira.find((x) => !kullanilan.has(x.ad) && !x.ikinci) ?? sira[0];
    kullanilan.add(t.ad);
    if (t.kaynak === 'kit') kit++;
    const s: Omit<Siparis, 'no'> = { musteri: t.ad, tur: 'resimli', sira: false, istek: [] };
    if (t.ikinci) {
      // çift: iki kâse (3-4 "ikisine aynısı"; 5-6 paylaşma: büyük kupa → iki eşit kâse)
      const ikinci = musteriTanim(t.ikinci);
      const uygun = uygunTatlar(t, a.tatlar).filter((x) => !ikinci?.sevmezTat?.includes(x));
      const b = yas === 'buyuk';
      const toplar: Tat[] = b ? [t.favori, uygun.find((x) => x !== t.favori) ?? 'vanilya'] : [t.favori];
      const d = ist('kase', toplar);
      Object.assign(s, { ikinci: t.ikinci, tur: 'paylasma', kupaResmi: b, istek: [d, { ...d, toplar: [...toplar] }] });
    } else if (y === 'ipucu' || y === 'surpriz') {
      let ip: Ipucu;
      if (y === 'surpriz') {
        s.tur = 'surpriz';
        s.istek = [ipucuOrnek({ ozellik: 'yeni', yeni: { tat: t.favori } }, t, a, r)];
        l.push(s);
        return;
      }
      if (!yeniKondu && o.yeni) {
        ip = { ozellik: 'yeni', yeni: o.yeni };
        yeniKondu = true;
      } else {
        const ozellikler: IpucuOzellik[] = yas === 'buyuk' ? ['serin', 'pembe', 'kocaman', 'cikolata', 'ikiRenk', 'meyveli'] : ['serin', 'pembe', 'kocaman'];
        // sevmediğine çıkan ipucu verilmez (ör. limonu sevmeyene "serin" de olur: çilek de serin)
        const zaten = new Set(l.flatMap((x) => (x.ipucu ? [x.ipucu.ozellik] : [])));
        const tercih = ozellikler.filter((z) => !zaten.has(z));
        ip = { ozellik: sec(tercih.length ? tercih : ozellikler, r) };
        if (yas === 'buyuk' && ip.ozellik !== 'kocaman') ip.top = ip.ozellik === 'ikiRenk' ? 2 + Math.floor(r() * 2) : 1 + Math.floor(r() * 3);
      }
      s.tur = 'ipucu';
      s.ipucu = ip;
      s.istek = [ipucuOrnek(ip, t, a, r)];
    } else if (y === 'sira') {
      const uygun = uygunTatlar(t, a.tatlar);
      const alt = uygun.includes('cikolata') ? 'cikolata' : uygun[0];
      const ust = uygun.find((x) => x !== alt) ?? alt;
      Object.assign(s, { tur: 'sira', sira: true, istek: [ist('kulah', [alt, ust], t.sevmezSos === 'cikolata' ? null : 'cikolata')] });
    } else if (y === 'birFazla') {
      const tavsanin = ist('kulah', ['cilek', 'vanilya']);
      const uygun = uygunTatlar(t, a.tatlar);
      const ek = uygun.includes(t.favori) ? t.favori : uygun[0];
      Object.assign(s, { tur: 'birFazla', referans: { musteri: 'tavsan', dondurma: tavsanin }, istek: [ist('kulah', ['cilek', 'vanilya', ek])] });
    } else if (y === 'oruntu') {
      Object.assign(s, { tur: 'oruntu', sira: true, gizli: 3, istek: [ist('kulah', ['limon', 'cilek', 'limon', 'cilek'])] });
    } else {
      s.istek = [resimliIstek(t, a, yas, r, o.ozelTat ?? null, o.ozelSus ?? null)];
      // dün açılan şey resimli istekte de olabilir (ipucu yuvası yoksa)
      if (!yeniKondu && o.yeni) {
        if (o.yeni.tat && a.tatlar.includes(o.yeni.tat)) s.istek[0].toplar[0] = o.yeni.tat;
        if (o.yeni.sus && a.susler.includes(o.yeni.sus)) s.istek[0].susler = { [o.yeni.sus]: 1 };
        yeniKondu = true;
      }
    }
    l.push(s);
  });
  return l.map((s, no) => ({ ...s, no }));
}

/** İstekte kullanılan bütün tat, sos, süs ve kaplar o gün açık mı (plan denetimi) */
export function planGunUygun(sip: Siparis, a: GunAyar): boolean {
  return sip.istek.every(
    (d) =>
      a.kaplar.includes(d.kap) &&
      d.toplar.every((t) => a.tatlar.includes(t)) &&
      (!d.sos || a.soslar.includes(d.sos)) &&
      Object.keys(d.susler).every((s) => a.susler.includes(s as Sus)),
  );
}

// ---------------------------------------------------------------- karşılaştırma

export type Fark = 'kap' | 'top' | 'sira' | 'sos' | 'sus';

/** Topların sırası önemsizken: istenenlerin hepsi, fazlasız */
export function toplarUyar(istenen: readonly TatIstek[], var_: readonly Tat[], sira: boolean): boolean {
  if (istenen.length !== var_.length) return false;
  if (sira) return istenen.every((t, i) => t === var_[i]);
  const kalan = [...var_];
  for (const t of istenen) {
    const i = kalan.indexOf(t);
    if (i < 0) return false;
    kalan.splice(i, 1);
  }
  return true;
}

export const susSay = (s: readonly Sus[]): Partial<Record<Sus, number>> => s.reduce<Partial<Record<Sus, number>>>((t, x) => ({ ...t, [x]: (t[x] ?? 0) + 1 }), {});
export function suslerUyar(istenen: Partial<Record<Sus, number>>, var_: readonly Sus[]): boolean {
  const v = susSay(var_);
  return SUSLER.every((s) => (istenen[s] ?? 0) === (v[s] ?? 0));
}

/** Bir dondurmanın istenenle farkları (boş: tam aynı) */
export function farklar(ist_: Istenen, d: Dondurma | null, sira: boolean): Fark[] {
  if (!d) return ['kap', 'top'];
  const f: Fark[] = [];
  if (d.kap !== ist_.kap) f.push('kap');
  if (!toplarUyar(ist_.toplar, d.toplar, sira)) f.push(sira && toplarUyar(ist_.toplar, d.toplar, false) ? 'sira' : 'top');
  if (d.sos !== ist_.sos) f.push('sos');
  if (!suslerUyar(ist_.susler, d.susler)) f.push('sus');
  return f;
}

/**
 * Siparişin sonucu (resimli istekler): verilen dondurmalar istenenlerle eşlenir (paylaşmada kâselerin sırası önemsiz).
 * ayni: hepsi tam istediği gibi; farklar: her istenen için farklı olan parçalar.
 */
export function siparisSonucu(sip: Siparis, verilen: readonly Dondurma[]): { ayni: boolean; farklar: Fark[][] } {
  const tek = (i: number, d: Dondurma | undefined) => farklar(sip.istek[i], d ?? null, sip.sira);
  if (sip.istek.length === 2 && verilen.length === 2) {
    const duz = [tek(0, verilen[0]), tek(1, verilen[1])];
    const ters = [tek(0, verilen[1]), tek(1, verilen[0])];
    const say = (x: Fark[][]) => x[0].length + x[1].length;
    const f = say(ters) < say(duz) ? ters : duz;
    return { ayni: say(f) === 0, farklar: f };
  }
  const f = sip.istek.map((_, i) => tek(i, verilen[i]));
  return { ayni: f.every((x) => x.length === 0), farklar: f };
}

/** İsteğe uyuyor mu: resimli tam aynı; ipuçlu her dondurmada özellik var; sürpriz her şey */
export function istegeUyar(sip: Siparis, verilen: readonly Dondurma[]): boolean {
  if (!verilen.length || verilen.some((d) => !d.toplar.length)) return false;
  if (sip.tur === 'surpriz') return true;
  if (sip.tur === 'ipucu' && sip.ipucu) return verilen.every((d) => ipucuUyar(sip.ipucu!, d));
  return siparisSonucu(sip, verilen).ayni;
}

export type Tepki = 'bayildi' | 'mmm' | 'komik';
/**
 * Müşterinin tepkisi (V3 §2.3; ceza yok): sevmediği varsa komik; isteğe uyuyor ve sevdiği var (ya da resimli istek
 * tam aynı) bayıldı; yalnız uyuyorsa mmm; uymuyorsa komik ("Farklıymış ama güzel!").
 */
export function tepkiHesapla(sip: Siparis, verilen: readonly Dondurma[], t: MusteriTanim | undefined = musteriTanim(sip.musteri)): Tepki {
  const uyar = istegeUyar(sip, verilen);
  if (t?.sevmez && verilen.some((d) => t.sevmez!(d))) return 'komik';
  if (!uyar) return 'komik';
  const resimli = sip.tur !== 'ipucu' && sip.tur !== 'surpriz';
  if (resimli || verilen.some((d) => t?.sever(d))) return 'bayildi';
  return 'mmm';
}
/** Resimli istekte yalnız kap farklı (külah bitti, kâse verildi): "Kâseden de olur!" */
export const yalnizKapFarkli = (sip: Siparis, verilen: readonly Dondurma[]) => sip.tur !== 'ipucu' && sip.tur !== 'surpriz' && siparisSonucu(sip, verilen).farklar.every((f) => f.every((x) => x === 'kap')) && !siparisSonucu(sip, verilen).ayni;

/** Jeton üst sınırı: 3-4 en çok 3, 5-6 en çok 5 */
export const ODEME_SINIR: Record<Yas, number> = { kucuk: 3, buyuk: 5 };
/** Ödeme: dondurmadaki top sayısı kadar jeton, bayılırsa +1 bahşiş; en az 1, yaşa göre üst sınır */
export function odeme(verilen: readonly Dondurma[], tepki: Tepki, yas: Yas): number {
  const top = verilen.reduce((t, d) => t + d.toplar.length, 0);
  return Math.max(1, Math.min(ODEME_SINIR[yas], top + (tepki === 'bayildi' ? 1 : 0)));
}
/** Kumbaranın gün hedefi (jeton): 3-4 8, 5-6 14; dolmasa da Kino kendi cebinden atar */
export const KUMBARA_HEDEF: Record<Yas, number> = { kucuk: 8, buyuk: 14 };
/** "Kaç jeton oldu?" (5-6, günde en çok 2): doğru, bir eksik, bir fazla (karışık) */
export function sayiSecenekleri(n: number, r: () => number = Math.random): number[] {
  const l = [n, Math.max(1, n - 1) === n ? n + 2 : n - 1, n + 1];
  return karistir(l, r);
}

// ---------------------------------------------------------------- hazırlık yuvası

/** Bir hazırlık yuvası: bir (paylaşmada iki) kap ve seçili kap */
export interface Yuva {
  kaplar: Dondurma[];
  secili: number;
}
export const bosYuva = (): Yuva => ({ kaplar: [], secili: 0 });
const bosDondurma = (kap: Kap): Dondurma => ({ kap, toplar: [], sos: null, susler: [] });

/**
 * Kap koy: yuva boşsa kap oturur; paylaşma siparişinde ikinci kap yanına gelir; yoksa seçili kap değişir ve
 * içindekiler yeni kaba geçer (kapta yer yoksa fazla toplar döner: Kino yer). Dönen: ne oldu ve taşan toplar.
 */
export function kapKoy(y: Yuva, kap: Kap, kacKap = 1): { olay: 'kondu' | 'eklendi' | 'degisti' | 'ayni'; tasan: Tat[] } {
  if (!y.kaplar.length) {
    y.kaplar.push(bosDondurma(kap));
    y.secili = 0;
    return { olay: 'kondu', tasan: [] };
  }
  if (y.kaplar.length < kacKap) {
    y.kaplar.push(bosDondurma(kap));
    y.secili = y.kaplar.length - 1;
    return { olay: 'eklendi', tasan: [] };
  }
  const d = y.kaplar[y.secili];
  if (d.kap === kap) return { olay: 'ayni', tasan: [] };
  d.kap = kap;
  const tasan = d.toplar.splice(EN_COK_TOP[kap]);
  if (!d.toplar.length) d.sos = null;
  return { olay: 'degisti', tasan };
}

/** Top koy (seçili kaba): kap yoksa 'kapYok'; kap doluysa 'tasti' (Kino yakalar, yer) */
export function topKoy(y: Yuva, tat: Tat): 'kondu' | 'kapYok' | 'tasti' {
  const d = y.kaplar[y.secili];
  if (!d) return 'kapYok';
  if (d.toplar.length >= EN_COK_TOP[d.kap]) return 'tasti';
  d.toplar.push(tat);
  return 'kondu';
}

/** Sos dök (seçili kaptaki en üst topa): top yoksa 'topYok'; aynı sos 'ayni'; başka sos varsa yenisi onun yerine */
export function sosKoy(y: Yuva, sos: Sos): 'kondu' | 'ayni' | 'topYok' {
  const d = y.kaplar[y.secili];
  if (!d?.toplar.length) return 'topYok';
  if (d.sos === sos) return 'ayni';
  d.sos = sos;
  return 'kondu';
}

/** Süs koy: top yoksa 'topYok'; o süsten en çok kadar varsa 'dolu' (serpinti: yeniden serpilir, sayı değişmez) */
export function susKoy(y: Yuva, sus: Sus): 'kondu' | 'dolu' | 'topYok' {
  const d = y.kaplar[y.secili];
  if (!d?.toplar.length) return 'topYok';
  if ((susSay(d.susler)[sus] ?? 0) >= EN_COK_SUS[sus]) return 'dolu';
  d.susler.push(sus);
  return 'kondu';
}

export type Katman = { tur: 'sus'; sus: Sus } | { tur: 'sos'; sos: Sos } | { tur: 'top'; tat: Tat } | { tur: 'kap'; kap: Kap };
/**
 * Geri alma: seçili kaptaki en üst katmanı kaldırır (Kino yer): önce son süs, sonra sos, sonra en üst top; boş kap
 * da kalkar (paylaşmada ikinci kap kalkınca seçim birinciye döner). Boşsa null.
 */
export function ye(y: Yuva): Katman | null {
  const d = y.kaplar[y.secili];
  if (!d) return null;
  if (d.susler.length) return { tur: 'sus', sus: d.susler.pop()! };
  if (d.sos) {
    const sos = d.sos;
    d.sos = null;
    return { tur: 'sos', sos };
  }
  if (d.toplar.length) return { tur: 'top', tat: d.toplar.pop()! };
  y.kaplar.splice(y.secili, 1);
  y.secili = Math.max(0, Math.min(y.secili, y.kaplar.length - 1));
  return { tur: 'kap', kap: d.kap };
}

/** Yuvada verilebilecek bir şey var mı: istenen kadar kap ve her kapta en az bir top */
export const verilebilir = (y: Yuva, sip: Siparis) => y.kaplar.length === sip.istek.length && y.kaplar.every((d) => d.toplar.length > 0);

/** Seçili kabın topları istenen kadar olunca (paylaşmada) öbür kap hâlâ eksikse seçim ona geçer */
export function secimiIlerlet(y: Yuva, sip: Siparis): boolean {
  if (y.kaplar.length < 2 || sip.istek.length < 2) return false;
  const d = y.kaplar[y.secili];
  const o = y.kaplar[1 - y.secili];
  const gerek = sip.istek[y.secili]?.toplar.length ?? 0;
  if (d.toplar.length >= gerek && o.toplar.length < (sip.istek[1 - y.secili]?.toplar.length ?? 0)) {
    y.secili = 1 - y.secili;
    return true;
  }
  return false;
}

// ---------------------------------------------------------------- sıradaki iş (geç ipucu: 30 sn'de parlar)

export type Is =
  | { tur: 'kap'; kap: Kap }
  | { tur: 'sec'; kap: number }
  | { tur: 'top'; tat: Tat }
  | { tur: 'ye' }
  | { tur: 'sos'; sos: Sos }
  | { tur: 'sus'; sus: Sus }
  | { tur: 'ver' };

/** Tek kap için sıradaki iş (kap doğru varsayılır değil: denetlenir) */
export function kapIsi(ist_: Istenen, d: Dondurma | undefined, sira: boolean): Is {
  if (!d || d.kap !== ist_.kap) return { tur: 'kap', kap: ist_.kap };
  const n = d.toplar.length;
  if (sira) {
    const ilkYanlis = d.toplar.findIndex((t, i) => i >= ist_.toplar.length || ist_.toplar[i] !== t);
    if (ilkYanlis >= 0) return { tur: 'ye' };
    if (n < ist_.toplar.length) return { tur: 'top', tat: ist_.toplar[n] };
  } else {
    // fazla (istenmeyen) top var mı
    const kalan = [...ist_.toplar];
    let fazla = false;
    for (const t of d.toplar) {
      const i = kalan.indexOf(t);
      if (i < 0) fazla = true;
      else kalan.splice(i, 1);
    }
    if (fazla) return { tur: 'ye' };
    if (kalan.length) {
      // balondaki sırayla: kule balondaki gibi gidiyorsa sıradaki top, yoksa istek sırasındaki ilk eksik tat
      const sirada = ist_.toplar[n];
      const balondaki = d.toplar.every((t, i) => ist_.toplar[i] === t);
      const eksik = (balondaki && sirada !== undefined && kalan.includes(sirada) ? sirada : null) ?? ist_.toplar.find((t) => kalan.includes(t)) ?? kalan[0];
      return { tur: 'top', tat: eksik };
    }
  }
  if (ist_.sos && d.sos !== ist_.sos) return { tur: 'sos', sos: ist_.sos };
  const v = susSay(d.susler);
  if (SUSLER.some((s) => (v[s] ?? 0) > (ist_.susler[s] ?? 0))) return { tur: 'ye' };
  if (!ist_.sos && d.sos) return { tur: 'ye' };
  const eksikSus = SUSLER.find((s) => (v[s] ?? 0) < (ist_.susler[s] ?? 0));
  if (eksikSus) return { tur: 'sus', sus: eksikSus };
  return { tur: 'ver' };
}

/**
 * Yuvanın sıradaki işi (müşterinin siparişine göre). İpuçlu ve sürprizde yuvadaki dondurma zaten uyuyorsa ver; yoksa
 * örnek doğruya göre (kap serbest: çocuğun seçtiği kap kalır). Paylaşmada: önce iki kap, sonra seçili kap tamamlanır,
 * sonra öbür kap seçilir; ikisi de tamamsa ver.
 */
export function yuvaIsi(sip: Siparis, y: Yuva): Is {
  if ((sip.tur === 'ipucu' || sip.tur === 'surpriz') && sip.istek.length === 1) {
    const d = y.kaplar[0];
    if (d && verilebilir(y, sip) && istegeUyar(sip, y.kaplar)) return { tur: 'ver' };
    const ornek = d ? { ...sip.istek[0], kap: d.kap } : sip.istek[0];
    return kapIsi(ornek, d, false);
  }
  if (sip.istek.length === 2) {
    if (y.kaplar.length < 2) return { tur: 'kap', kap: sip.istek[y.kaplar.length].kap };
    const secili = kapIsi(sip.istek[y.secili], y.kaplar[y.secili], sip.sira);
    if (secili.tur !== 'ver') return secili;
    const o = 1 - y.secili;
    const obur = kapIsi(sip.istek[o], y.kaplar[o], sip.sira);
    if (obur.tur !== 'ver') return { tur: 'sec', kap: o };
    return { tur: 'ver' };
  }
  return kapIsi(sip.istek[0], y.kaplar[0], sip.sira);
}

// ---------------------------------------------------------------- konuşma (istek okuması ve durum anlatımı)

const P = K.parca;
const tatAdi = (t: Tat) => (P.tat as Record<Tat, string>)[t];
export const kapSayiSozu = (kap: Kap, n: number) => P.kap_sayi.replace('{Kap}', P.kap[kap]).replace('{sayi}', sayiAdi(n));
export const tatSozu = (t: Tat, son: boolean) => (son ? P.tat_son : P.tat_ara).replace('{tat}', tatAdi(t));
export const sosSozu = (s: Sos) => P.sos[s];
export function susSozu(s: Sus, n: number): string {
  if (s === 'serpinti') return P.serpinti;
  return P.sus_sayi.replace('{Sayi}', buyukHarfBas(sayiAdi(n))).replace('{sus}', (P.sus as Record<string, string>)[s]);
}
export const sayiSozu = (n: number) => `${buyukHarfBas(sayiAdi(n))}!`;

function istekOkumasi(d: Istenen, sira: boolean): string[] {
  const s: string[] = [kapSayiSozu(d.kap, d.toplar.length)];
  if (sira && d.toplar.length >= 2) {
    const t = d.toplar;
    s.push(P.en_alt.replace('{tat}', tatAdi(t[0])));
    if (t.length === 3) s.push(P.orta.replace('{tat}', tatAdi(t[1])));
    s.push(P.ust.replace('{tat}', tatAdi(t[t.length - 1])));
  } else {
    // aynı tatlar art arda bir kez okunur ("üç top: çilek!")
    const tekil = d.toplar.filter((t, i) => d.toplar.indexOf(t) === i);
    tekil.forEach((t, i) => s.push(tatSozu(t, i === tekil.length - 1)));
  }
  if (d.sos) s.push(sosSozu(d.sos));
  for (const sus of SUSLER) if (d.susler[sus]) s.push(susSozu(sus, d.susler[sus]!));
  return s;
}

/** Mino'nun (anlatıcı) okuduğu resimli istek: kısa parçalar (her biri ayrı kayıt). Yalnız günün ilk 2 resimli isteğinde. */
export function okuma(sip: Siparis): string[] {
  switch (sip.tur) {
    case 'oruntu':
      return [K.mino.oruntu];
    case 'birFazla':
      return [K.mino.bir_fazla];
    case 'paylasma':
      return sip.kupaResmi ? [K.mino.esit] : [K.mino.ikisine, ...istekOkumasi(sip.istek[0], false)];
    case 'dogumgunu':
      return [K.mino.dogumgunu, ...istekOkumasi(sip.istek[0], sip.sira)];
    case 'ipucu':
    case 'surpriz':
      return [durumSozu(sip)];
    default:
      return istekOkumasi(sip.istek[0], sip.sira);
  }
}

/**
 * Mino'nun durum anlatımı (emir vermez, isteği okumaz): sesi olmayan müşteride ve ipuçlu / sürpriz isteklerde.
 * 5-6 ipucunda top sayısı ikinci cümle.
 */
export function durumSozu(sip: Siparis): string {
  const D = K.mino.durum as Record<string, string>;
  if (sip.ogretici) return D.mino;
  if (sip.tur === 'surpriz') return D.surpriz;
  if (sip.tur === 'ipucu' && sip.ipucu) return D[sip.ipucu.ozellik];
  return D.resimli;
}
export const durumTopSozu = (n: number) => (K.mino.durum_top as Record<string, string>)[String(n)] ?? null;

/** Müşterinin kendi cümlesi (kendi sesiyle; ses gelene dek balonda yazı) */
export function musteriSozu(ad: string, ne: 'istek' | 'bayildi' | 'komik'): string | null {
  const s = (K.musteri as Record<string, Record<string, string>>)[ad];
  return s?.[ne] ?? null;
}
/** Ses etiketleri ([happy] …) yalnız seslendirme içindir: balonda görünmez */
export const etiketsiz = (s: string) => s.replace(/\[[^\]]*\]\s*/g, '').trim();

// ---------------------------------------------------------------- gün sonu ödülü: üç kart

export type SusTuru = 'tabela' | 'flama' | 'kulah' | 'ampul' | 'jant' | 'boya' | 'korna' | 'sapka';
export interface OtobusSusu {
  id: string;
  tur: SusTuru;
  /** boya: renk adı */
  deger?: string;
}
/** Otobüs ve Kino süsleri (görünüm kartı; ödül sırası) */
export const OTOBUS_SUSLERI: readonly OtobusSusu[] = [
  { id: 'flama', tur: 'flama' },
  { id: 'kino-sapka', tur: 'sapka' },
  { id: 'ampul', tur: 'ampul' },
  { id: 'cati-kulah', tur: 'kulah' },
  { id: 'korna', tur: 'korna' },
  { id: 'kemik-tabela', tur: 'tabela' },
  { id: 'jant', tur: 'jant' },
  { id: 'boya-nane', tur: 'boya', deger: 'nane' },
  { id: 'boya-limon', tur: 'boya', deger: 'limon' },
  { id: 'boya-cilek', tur: 'boya', deger: 'cilek' },
];
/** Otobüsün boyaları (buz mavisi asıl renk) */
export const BOYA: Record<string, { govde: string; koyu: string; filtre: string }> = {
  buz: { govde: '#9FDCF5', koyu: '#5FB4DC', filtre: 'none' },
  nane: { govde: '#A8E8C8', koyu: '#5EC496', filtre: 'hue-rotate(-50deg) saturate(1.05)' },
  limon: { govde: '#FFE98A', koyu: '#F0C83C', filtre: 'hue-rotate(-160deg) saturate(1.3) brightness(1.08)' },
  cilek: { govde: '#FFB3CF', koyu: '#F07AA5', filtre: 'hue-rotate(140deg) saturate(1.1)' },
};

export type OdulKategori = 'tat' | 'sus' | 'gorunum';
export const ODUL_KATALOGU: { tat: readonly Tat[]; sus: readonly Sus[]; gorunum: readonly string[] } = {
  tat: YENI_TATLAR,
  sus: YENI_SUSLER,
  gorunum: OTOBUS_SUSLERI.map((s) => s.id),
};
/** Bir kart: kategorinin sıradaki ödülü; kategori bittiyse "Kino'ya dondurma ısmarla" (id null) */
export interface OdulKarti {
  kategori: OdulKategori;
  id: string | null;
  /** kategorinin ilk ödülü (ücretsiz oyuncu da alır) */
  ilk: boolean;
}
/** Gün sonunun üç kartı: tat, süs, görünüm (her kategoride sıradaki) */
export function gunOdulleri(a: Acilan): OdulKarti[] {
  return (['tat', 'sus', 'gorunum'] as const).map((k) => {
    const alinan = a[k] as readonly string[];
    const id = (ODUL_KATALOGU[k] as readonly string[]).find((x) => !alinan.includes(x)) ?? null;
    return { kategori: k, id, ilk: alinan.length === 0 };
  });
}
/** Kartı seçince: açılanlara yazılır (boya seçilince otobüs o renge boyanır). Dönen: yeni boya (varsa) */
export function odulAl(a: Acilan, kart: OdulKarti): { boya?: string } {
  if (!kart.id) return {};
  const l = a[kart.kategori] as string[];
  if (!l.includes(kart.id)) l.push(kart.id);
  const s = OTOBUS_SUSLERI.find((x) => x.id === kart.id);
  return s?.tur === 'boya' ? { boya: s.deger } : {};
}

// ---------------------------------------------------------------- seslendirilecek cümleler

const topla = (v: unknown): string[] => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(topla) : v && typeof v === 'object' ? Object.values(v).flatMap(topla) : []);

/** Anlatıcı (Mino) sesiyle seslendirilecek bütün cümleler: sabit sözler ve açılmış istek parçaları */
export function kinoOtobusCumleleri(): string[] {
  const c: string[] = [...topla(K.mino), P.serpinti, ...Object.values(P.sos)];
  for (const kap of KAPLAR) for (let n = 1; n <= EN_COK_TOP[kap]; n++) c.push(kapSayiSozu(kap, n));
  for (const t of TATLAR) {
    c.push(tatSozu(t, false), tatSozu(t, true));
    for (const k of [P.en_alt, P.orta, P.ust]) c.push(k.replace('{tat}', tatAdi(t)));
  }
  for (const s of SUSLER) if (s !== 'serpinti') for (let n = 1; n <= EN_COK_SUS[s]; n++) c.push(susSozu(s, n));
  for (let n = 1; n <= 10; n++) c.push(sayiSozu(n));
  return [...new Set(c)];
}
/** Kino'nun kendi sesiyle seslendirilecek cümleler */
export const kinoOtobusKinoCumleleri = (): string[] => topla(K.kino);
/**
 * Müşterilerin kendi sesiyle seslendirilecek cümleleri (36; eleven_v4, content/film2/sesler.json). ONAY BEKLİYOR
 * (Barış): üretilmez; ses gelene dek balonda yazı + Mino'nun durum cümlesi.
 */
export const kinoOtobusMusteriCumleleri = (): Record<string, string[]> => Object.fromEntries(Object.entries(K.musteri).map(([ad, s]) => [ad, Object.values(s as Record<string, string>)]));
