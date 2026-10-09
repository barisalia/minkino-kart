/**
 * Kino'nun Otobüsü (dondurma): oyunun saf mantığı (DOM yok, birim testli). Tasarım: ekip/senaryo/kino-otobus.md.
 *
 * - Tatlar, soslar, süsler, kaplar; günlerin açtıkları (Gün 1 park, Gün 2 plaj, Gün 3 doğum günü bahçesi).
 * - Günün müşteri planı (yaşa göre: 3-4 'kucuk', 5-6 'buyuk'): her gün 5 müşteri; istek türleri renk, aynısı, sıra,
 *   örüntü, bir fazla, paylaşma, sıcak gün, doğum günü.
 * - Hazırlık yuvası: kap koy, top koy, sos dök, süs koy, en üsttekini ye (geri alma); kap değişince içindekiler yeni
 *   kaba geçer (hiçbir şey kaybolmaz). Süre yok: hiçbir işlem beklemez.
 * - Kontrol (aynı mı, neresi farklı), sıradaki iş (parlama ve el ipucu), jeton, akşam sayımı, otobüs süs dükkânı.
 */
import K from '../../content/kino-otobus.json';
import { buyukHarfBas, sayiAdi } from '../../src/audio/metin';

export type Tat = 'cilek' | 'vanilya' | 'cikolata' | 'limon' | 'fistik' | 'yabanmersini';
/** istekte bir top: belli bir tat ya da 'serin' (sıcak gün: limon ya da çilek, ikisi de olur) */
export type TatIstek = Tat | 'serin';
export type Kap = 'kulah' | 'kase' | 'kupa';
export type Sos = 'cikolata' | 'cilek' | 'karamel';
export type Sus = 'serpinti' | 'kiraz' | 'gofret' | 'semsiye' | 'kalp';
export type Yas = 'kucuk' | 'buyuk';
export type Gun = 1 | 2 | 3;
export type Yer = 'park' | 'plaj' | 'dogumgunu';
export type IstekTuru = 'ogretici' | 'renk' | 'ayni' | 'sira' | 'oruntu' | 'birFazla' | 'paylasma' | 'sicak' | 'dogumgunu';

export const TATLAR: readonly Tat[] = ['cilek', 'vanilya', 'cikolata', 'limon', 'fistik', 'yabanmersini'];
export const SOSLAR: readonly Sos[] = ['cikolata', 'cilek', 'karamel'];
export const SUSLER: readonly Sus[] = ['serpinti', 'kiraz', 'gofret', 'semsiye', 'kalp'];
export const KAPLAR: readonly Kap[] = ['kulah', 'kase', 'kupa'];
/** sıcak günün serin tatları */
export const SERIN: readonly Tat[] = ['limon', 'cilek'];

/** Tatların renkleri (yer tutucu çizimler ve balon simgeleri; gerçek görsel gelince yalnız yedek) */
export const TAT_RENK: Record<Tat, { ana: string; koyu: string; acik: string }> = {
  cilek: { ana: '#FF8DB4', koyu: '#E2588A', acik: '#FFC6DA' },
  vanilya: { ana: '#FFEFC2', koyu: '#E8CB86', acik: '#FFFBEA' },
  cikolata: { ana: '#9A5B3A', koyu: '#6E3B22', acik: '#C0835E' },
  limon: { ana: '#FFE45C', koyu: '#E2BE1E', acik: '#FFF4A8' },
  fistik: { ana: '#A9DB8C', koyu: '#77B65A', acik: '#D3F0C0' },
  yabanmersini: { ana: '#8C88E0', koyu: '#5F5ABD', acik: '#BDBAF5' },
};
export const SOS_RENK: Record<Sos, { ana: string; koyu: string }> = {
  cikolata: { ana: '#6B3A22', koyu: '#4A2412' },
  cilek: { ana: '#F0436F', koyu: '#C42452' },
  karamel: { ana: '#E39A2F', koyu: '#B86F12' },
};

/** Bir kapta en çok kaç top (fazlası: Kino havada yakalar, yer) */
export const EN_COK_TOP: Record<Kap, number> = { kulah: 4, kase: 3, kupa: 5 };
/** Bir süsten en çok kaç tane (serpinti tek: bir kez serpilir) */
export const EN_COK_SUS: Record<Sus, number> = { serpinti: 1, kiraz: 5, gofret: 5, semsiye: 5, kalp: 5 };
/** Doğru ve farklı dondurmanın jetonu */
export const JETON = { ayni: 3, farkli: 2 } as const;

export interface GunAyar {
  yer: Yer;
  tatlar: readonly Tat[];
  soslar: readonly Sos[];
  susler: readonly Sus[];
  kaplar: readonly Kap[];
  /** hedef: mutlu (tam istediği gibi) müşteri sayısı */
  hedef: number;
}
export const GUN_SAYISI = 3;
export const GUNLER: Record<Gun, GunAyar> = {
  1: { yer: 'park', tatlar: ['cilek', 'vanilya', 'cikolata'], soslar: ['cikolata'], susler: [], kaplar: ['kulah', 'kase'], hedef: 3 },
  2: { yer: 'plaj', tatlar: TATLAR, soslar: SOSLAR, susler: ['serpinti', 'kiraz', 'gofret'], kaplar: ['kulah', 'kase'], hedef: 4 },
  3: { yer: 'dogumgunu', tatlar: TATLAR, soslar: SOSLAR, susler: SUSLER, kaplar: KAPLAR, hedef: 4 },
};

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
export interface Siparis {
  /** günün içindeki sıra (0..4) */
  no: number;
  musteri: string;
  /** paylaşma: yanında kardeşi */
  ikinci?: string;
  tur: IstekTuru;
  /** bir ya da (paylaşmada) iki dondurma */
  istek: Istenen[];
  /** topların sırası önemli mi (5-6 sıra ve örüntü) */
  sira: boolean;
  /** "bir fazla": kimin dondurmasından (balonda onun dondurması + bir top) */
  referans?: { musteri: string; dondurma: Istenen };
  /** örüntü: balonda bu sıradaki top "?" olarak görünür */
  gizli?: number;
  /** paylaşma (5-6): balonda büyük kupa (bütün toplar) ve iki boş kâse */
  kupaResmi?: boolean;
  /** sıcak gün: müşteri terli */
  terli?: boolean;
}

const ist = (kap: Kap, toplar: TatIstek[], sos: Sos | null = null, susler: Partial<Record<Sus, number>> = {}): Istenen => ({ kap, toplar, sos, susler });

/** Günün müşteri planı (sabit; tasarım belgesindeki istekler). Yaş farkı yalnız top sayısı, sıra ve örüntüde. */
export function gunPlani(gun: Gun, yas: Yas): Siparis[] {
  const b = yas === 'buyuk';
  const l: Omit<Siparis, 'no'>[] = [];
  const ekle = (s: Omit<Siparis, 'no' | 'sira'> & { sira?: boolean }) => l.push({ sira: false, ...s });
  if (gun === 1) {
    ekle({ musteri: 'mino', tur: 'ogretici', istek: [ist('kulah', b ? ['cilek', 'vanilya'] : ['cilek'])] });
    ekle({ musteri: 'tavsan', tur: 'renk', istek: [ist('kulah', b ? ['cilek', 'cilek', 'cilek'] : ['cilek', 'cilek'])] });
    ekle({ musteri: 'ayi', tur: 'renk', istek: [ist('kase', b ? ['cikolata', 'vanilya'] : ['cikolata'], 'cikolata')] });
    ekle({ musteri: 'ordek', tur: 'ayni', istek: [ist('kase', b ? ['vanilya', 'cilek', 'vanilya'] : ['vanilya', 'cilek'])] });
    if (b) ekle({ musteri: 'can', tur: 'sira', sira: true, istek: [ist('kulah', ['cikolata', 'vanilya'], 'cikolata')] });
    else ekle({ musteri: 'can', tur: 'renk', istek: [ist('kulah', ['vanilya', 'cikolata'], 'cikolata')] });
  } else if (gun === 2) {
    if (b) {
      const tavsanin = ist('kulah', ['cilek', 'limon']);
      ekle({ musteri: 'pamuk', tur: 'renk', istek: [ist('kase', ['cilek', 'cilek', 'cilek'], 'cilek', { serpinti: 1 })] });
      ekle({ musteri: 'tavsan', tur: 'renk', istek: [tavsanin] });
      ekle({ musteri: 'ayi', tur: 'birFazla', referans: { musteri: 'tavsan', dondurma: tavsanin }, istek: [ist('kulah', ['cilek', 'limon', 'limon'])] });
      ekle({ musteri: 'elif', tur: 'sicak', terli: true, istek: [ist('kulah', ['serin', 'serin'], null, { kiraz: 1 })] });
      ekle({ musteri: 'maymun', tur: 'renk', istek: [ist('kase', ['fistik', 'yabanmersini'], 'karamel', { gofret: 2 })] });
    } else {
      ekle({ musteri: 'pamuk', tur: 'renk', istek: [ist('kase', ['cilek', 'cilek'], 'cilek')] });
      ekle({ musteri: 'elif', tur: 'sicak', terli: true, istek: [ist('kulah', ['serin'])] });
      ekle({ musteri: 'maymun', tur: 'renk', istek: [ist('kase', ['fistik'], null, { gofret: 1 })] });
      ekle({ musteri: 'kus', tur: 'renk', istek: [ist('kulah', ['yabanmersini'], null, { kiraz: 2 })] });
      ekle({ musteri: 'kopek', tur: 'renk', istek: [ist('kase', ['vanilya', 'cikolata'], 'karamel', { serpinti: 1 })] });
    }
  } else {
    if (b) {
      ekle({ musteri: 'inek', tur: 'renk', istek: [ist('kupa', ['vanilya', 'cikolata', 'vanilya', 'cikolata'], 'karamel')] });
      ekle({ musteri: 'deniz', ikinci: 'zeynep', tur: 'paylasma', kupaResmi: true, istek: [ist('kase', ['cilek', 'vanilya']), ist('kase', ['cilek', 'vanilya'])] });
      ekle({ musteri: 'ordek', tur: 'oruntu', sira: true, gizli: 3, istek: [ist('kulah', ['limon', 'cilek', 'limon', 'cilek'])] });
      ekle({ musteri: 'kus', tur: 'sira', sira: true, istek: [ist('kase', ['yabanmersini', 'fistik', 'limon'], null, { semsiye: 1, kalp: 2 })] });
      ekle({ musteri: 'mino', tur: 'dogumgunu', istek: [ist('kupa', ['cilek', 'vanilya', 'cikolata', 'cilek'], 'cilek', { kiraz: 1 })] });
    } else {
      ekle({ musteri: 'inek', tur: 'renk', istek: [ist('kupa', ['cilek', 'vanilya', 'cikolata'], 'karamel')] });
      ekle({ musteri: 'deniz', ikinci: 'zeynep', tur: 'paylasma', istek: [ist('kase', ['cilek']), ist('kase', ['cilek'])] });
      ekle({ musteri: 'ordek', tur: 'renk', istek: [ist('kulah', ['limon', 'limon'], null, { semsiye: 1 })] });
      ekle({ musteri: 'pamuk', tur: 'renk', istek: [ist('kase', ['cilek'], 'cilek', { kalp: 3 })] });
      ekle({ musteri: 'mino', tur: 'dogumgunu', istek: [ist('kupa', ['cilek', 'vanilya', 'cikolata'], 'cilek', { kiraz: 1 })] });
    }
  }
  return l.map((s, no) => ({ ...s, no }));
}

/** İstekte kullanılan bütün tat, sos, süs ve kaplar o gün açık mı (plan denetimi) */
export function planGunUygun(sip: Siparis, gun: Gun): boolean {
  const a = GUNLER[gun];
  return sip.istek.every(
    (d) =>
      a.kaplar.includes(d.kap) &&
      d.toplar.every((t) => (t === 'serin' ? SERIN.every((s) => a.tatlar.includes(s)) : a.tatlar.includes(t))) &&
      (!d.sos || a.soslar.includes(d.sos)) &&
      Object.keys(d.susler).every((s) => a.susler.includes(s as Sus)),
  );
}

// ---------------------------------------------------------------- karşılaştırma

export type Fark = 'kap' | 'top' | 'sira' | 'sos' | 'sus';

const tatUyar = (istenen: TatIstek, t: Tat) => (istenen === 'serin' ? SERIN.includes(t) : istenen === t);

/** Topların sırası önemsizken: istenenlerin hepsi, fazlasız (serin: limon ya da çilek) */
export function toplarUyar(istenen: readonly TatIstek[], var_: readonly Tat[], sira: boolean): boolean {
  if (istenen.length !== var_.length) return false;
  if (sira) return istenen.every((t, i) => tatUyar(t, var_[i]));
  // önce belli tatlar, sonra serinler (serin her iki tatı da kabul eder)
  const kalan = [...var_];
  const sirali = [...istenen].sort((a, b) => Number(a === 'serin') - Number(b === 'serin'));
  for (const t of sirali) {
    const i = kalan.findIndex((v) => tatUyar(t, v));
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
 * Siparişin sonucu: verilen dondurmalar istenenlerle eşlenir (paylaşmada kâselerin sırası önemsiz).
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

export const jetonHesapla = (ayni: boolean) => (ayni ? JETON.ayni : JETON.farkli);

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

// ---------------------------------------------------------------- sıradaki iş

export type Is =
  | { tur: 'kap'; kap: Kap }
  | { tur: 'sec'; kap: number }
  | { tur: 'top'; tat: Tat }
  | { tur: 'ye' }
  | { tur: 'sos'; sos: Sos }
  | { tur: 'sus'; sus: Sus }
  | { tur: 'ver' };

/** Serin istekte hangi tat önerilir (parlayan): limon, açık değilse çilek */
const serinCoz = (t: TatIstek, acik: readonly Tat[]): Tat => (t === 'serin' ? (SERIN.find((s) => acik.includes(s)) ?? 'cilek') : t);

/** Tek kap için sıradaki iş (kap doğru varsayılır değil: denetlenir) */
export function kapIsi(ist_: Istenen, d: Dondurma | undefined, sira: boolean, acik: readonly Tat[] = TATLAR): Is {
  if (!d || d.kap !== ist_.kap) return { tur: 'kap', kap: ist_.kap };
  const n = d.toplar.length;
  if (sira) {
    const ilkYanlis = d.toplar.findIndex((t, i) => i >= ist_.toplar.length || !tatUyar(ist_.toplar[i], t));
    if (ilkYanlis >= 0) return { tur: 'ye' };
    if (n < ist_.toplar.length) return { tur: 'top', tat: serinCoz(ist_.toplar[n], acik) };
  } else {
    // fazla (istenmeyen) top var mı
    const kalan = [...ist_.toplar].sort((a, b) => Number(a === 'serin') - Number(b === 'serin'));
    let fazla = false;
    const sirali = [...d.toplar].sort((a, b) => Number(SERIN.includes(a)) - Number(SERIN.includes(b)));
    for (const t of sirali) {
      const i = kalan.findIndex((k) => tatUyar(k, t));
      if (i < 0) fazla = true;
      else kalan.splice(i, 1);
    }
    if (fazla) return { tur: 'ye' };
    if (kalan.length) {
      // istek sırasındaki ilk eksik tat
      const eksik = ist_.toplar.find((t) => kalan.includes(t)) ?? kalan[0];
      return { tur: 'top', tat: serinCoz(eksik, acik) };
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
 * Yuvanın sıradaki işi (müşterinin siparişine göre). Paylaşmada: önce iki kap, sonra seçili kap tamamlanır, sonra öbür
 * kap seçilir; ikisi de tamamsa ver.
 */
export function yuvaIsi(sip: Siparis, y: Yuva, acik: readonly Tat[] = TATLAR): Is {
  if (sip.istek.length === 2) {
    if (y.kaplar.length < 2) return { tur: 'kap', kap: sip.istek[y.kaplar.length].kap };
    const secili = kapIsi(sip.istek[y.secili], y.kaplar[y.secili], sip.sira, acik);
    if (secili.tur !== 'ver') return secili;
    const o = 1 - y.secili;
    const obur = kapIsi(sip.istek[o], y.kaplar[o], sip.sira, acik);
    if (obur.tur !== 'ver') return { tur: 'sec', kap: o };
    return { tur: 'ver' };
  }
  return kapIsi(sip.istek[0], y.kaplar[0], sip.sira, acik);
}

// ---------------------------------------------------------------- konuşma (istek okuması)

const P = K.parca;
const tatAdi = (t: Tat) => P.tat[t];
export const kapSayiSozu = (kap: Kap, n: number) => P.kap_sayi.replace('{Kap}', P.kap[kap]).replace('{sayi}', sayiAdi(n));
export const tatSozu = (t: Tat, son: boolean) => (son ? P.tat_son : P.tat_ara).replace('{tat}', tatAdi(t));
export const sosSozu = (s: Sos) => P.sos[s];
export function susSozu(s: Sus, n: number): string {
  if (s === 'serpinti') return P.serpinti;
  return P.sus_sayi.replace('{Sayi}', buyukHarfBas(sayiAdi(n))).replace('{sus}', P.sus[s]);
}
export const sayiSozu = (n: number) => `${buyukHarfBas(sayiAdi(n))}!`;

function istekOkumasi(d: Istenen, sira: boolean): string[] {
  const s: string[] = [kapSayiSozu(d.kap, d.toplar.length)];
  if (d.toplar.every((t) => t === 'serin')) s.push(K.mino.serin);
  else if (sira && d.toplar.length >= 2) {
    const t = d.toplar as Tat[];
    s.push(P.en_alt.replace('{tat}', tatAdi(t[0])));
    if (t.length === 3) s.push(P.orta.replace('{tat}', tatAdi(t[1])));
    s.push(P.ust.replace('{tat}', tatAdi(t[t.length - 1])));
  } else {
    // aynı tatlar art arda bir kez okunur ("üç top: çilek!")
    const tekil = d.toplar.filter((t, i) => t !== 'serin' && d.toplar.indexOf(t) === i) as Tat[];
    tekil.forEach((t, i) => s.push(tatSozu(t, i === tekil.length - 1)));
  }
  if (d.sos) s.push(sosSozu(d.sos));
  for (const sus of SUSLER) if (d.susler[sus]) s.push(susSozu(sus, d.susler[sus]!));
  return s;
}

/** Mino'nun (anlatıcı) okuduğu istek: kısa parçalar (her biri ayrı kayıt) */
export function okuma(sip: Siparis): string[] {
  switch (sip.tur) {
    case 'ayni':
      return [K.mino.ayni];
    case 'oruntu':
      return [K.mino.oruntu];
    case 'birFazla':
      return [K.mino.bir_fazla];
    case 'paylasma':
      return sip.kupaResmi ? [K.mino.esit] : [K.mino.ikisine, ...istekOkumasi(sip.istek[0], false)];
    case 'dogumgunu':
      return [K.mino.dogumgunu, ...istekOkumasi(sip.istek[0], sip.sira)];
    default:
      return istekOkumasi(sip.istek[0], sip.sira);
  }
}

// ---------------------------------------------------------------- akşam: sayım ve süs dükkânı

/** Kumbara sayımı: 3-4 tek tek (en çok ona kadar; artanlar sessiz düşer), 5-6 beşer ("Beş! On! On beş!") */
export function sayim(n: number, yas: Yas): { soz: string[]; adim: number[] } {
  if (n <= 0) return { soz: [], adim: [] };
  const soz: string[] = [];
  const adim: number[] = [];
  if (yas === 'kucuk' || n < 5) {
    const tek = Math.min(n, 10);
    for (let i = 1; i <= tek; i++) {
      soz.push(sayiSozu(i));
      adim.push(1);
    }
    if (n > tek) adim.push(n - tek);
    return { soz, adim };
  }
  let sayilan = 0;
  for (let i = 0; i < P.besli.length && sayilan + 5 <= n; i++) {
    soz.push(P.besli[i]);
    adim.push(5);
    sayilan += 5;
  }
  if (n > sayilan) adim.push(n - sayilan);
  return { soz, adim };
}

export type SusTuru = 'tabela' | 'flama' | 'kulah' | 'ampul' | 'jant' | 'boya' | 'korna' | 'sapka';
export interface OtobusSusu {
  id: string;
  tur: SusTuru;
  /** boya: renk adı */
  deger?: string;
  fiyat: number;
  /** dükkânda kaçıncı günden sonra görünür */
  gun: Gun;
  /** ücretsiz (abonelik gerekmez) */
  ucretsiz?: boolean;
}
/** Otobüs süsleri (8 çeşit; 3 boya ayrı ayrı alınır). Fiyatlar en çok 10 jeton. */
export const OTOBUS_SUSLERI: readonly OtobusSusu[] = [
  { id: 'kemik-tabela', tur: 'tabela', fiyat: 5, gun: 1, ucretsiz: true },
  { id: 'flama', tur: 'flama', fiyat: 6, gun: 1, ucretsiz: true },
  { id: 'cati-kulah', tur: 'kulah', fiyat: 8, gun: 2 },
  { id: 'ampul', tur: 'ampul', fiyat: 7, gun: 2 },
  { id: 'korna', tur: 'korna', fiyat: 5, gun: 2 },
  { id: 'jant', tur: 'jant', fiyat: 6, gun: 3 },
  { id: 'boya-nane', tur: 'boya', deger: 'nane', fiyat: 4, gun: 3 },
  { id: 'boya-limon', tur: 'boya', deger: 'limon', fiyat: 4, gun: 3 },
  { id: 'boya-cilek', tur: 'boya', deger: 'cilek', fiyat: 4, gun: 3 },
  { id: 'kino-sapka', tur: 'sapka', fiyat: 9, gun: 3 },
];
/** Otobüsün boyaları (buz mavisi asıl renk) */
export const BOYA: Record<string, { govde: string; koyu: string; filtre: string }> = {
  buz: { govde: '#9FDCF5', koyu: '#5FB4DC', filtre: 'none' },
  nane: { govde: '#A8E8C8', koyu: '#5EC496', filtre: 'hue-rotate(-50deg) saturate(1.05)' },
  limon: { govde: '#FFE98A', koyu: '#F0C83C', filtre: 'hue-rotate(-160deg) saturate(1.3) brightness(1.08)' },
  cilek: { govde: '#FFB3CF', koyu: '#F07AA5', filtre: 'hue-rotate(140deg) saturate(1.1)' },
};

/** Akşam dükkânında görünenler: o güne kadar açılanlar */
export const dukkan = (gun: Gun) => OTOBUS_SUSLERI.filter((s) => s.gun <= gun);

export interface Kumbara {
  jeton: number;
  alinan: string[];
}
export const alinabilir = (k: Kumbara, s: OtobusSusu) => !k.alinan.includes(s.id) && k.jeton >= s.fiyat;
export function satinAl(k: Kumbara, id: string): boolean {
  const s = OTOBUS_SUSLERI.find((x) => x.id === id);
  if (!s || !alinabilir(k, s)) return false;
  k.jeton -= s.fiyat;
  k.alinan.push(id);
  return true;
}

// ---------------------------------------------------------------- seslendirilecek cümleler

const topla = (v: unknown): string[] => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(topla) : v && typeof v === 'object' ? Object.values(v).flatMap(topla) : []);

/** Anlatıcı (Mino) sesiyle seslendirilecek bütün cümleler: sabit sözler ve açılmış istek parçaları */
export function kinoOtobusCumleleri(): string[] {
  const c: string[] = [...topla(K.mino), ...P.besli, P.serpinti, ...Object.values(P.sos)];
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
