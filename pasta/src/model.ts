/**
 * Mino'nun Pasta Otobüsü: oyunun saf mantığı (DOM yok; birim testleri buradan sınar).
 * Tasarım: ekip/senaryo/pasta-otobusu.md (ilk sürüm) ve pasta-otobusu-v2.md (derinleştirme, Barış: "çok basit").
 *
 * - Sipariş: bir ya da iki kalem (kurabiye / kapkek / içecek). Kurabiye: adet, şekil, krema rengi ve deseni (düz,
 *   zigzag, dalga, nokta, kalp), serpinti (yok / az / bol), yüz (Gün 2+), süs ve kurabiye başına süs sayısı. Kapkek
 *   (Gün 3): krema yığını sayısı ve rengi, tek süs ya da doğum günü mumları. İçecek (Gün 4): süt, kakao, limonata;
 *   bardak boyu; çizgiye kadar dolu mu.
 * - Çocuğun yaptığı: bir "parti" (aynı kalıptan çıkmış 1-5 parça; her parçanın kreması, deseni, serpintisi, yüzü,
 *   yığınları, süsleri) ya da bir bardak.
 * - Karşılaştırma ret etmez: farklı olan şeyler listelenir (balonda ve tabakta bir an parlarlar).
 * - Gün: 10 günlük tablo (v2 3d); bu sürümde Gün 1-6 oynanır, 7-10 tabloda "yakında". Günlük hedef (mutlu müşteri)
 *   ve 1-3 yıldız; yıldızlar yükseltme açar (2. fırın gözü …), jetonlar dükkân rafından süs alır.
 */
import P from '../../content/pasta.json';
import { buyukHarfBas, sayiAdi } from '../../src/audio/metin';
import { DESENLER, serpintiSeviye, type Desen, type Yuz } from './desen';

export type { Desen, Yuz } from './desen';
export type Sekil = 'yuvarlak' | 'yildiz' | 'kalp' | 'ay';
export type Kalip = Sekil | 'kapkek';
export type Urun = 'kurabiye' | 'kapkek' | 'icecek';
export type Renk = 'pembe' | 'mavi' | 'sari' | 'mor';
export type Sus = 'cilek' | 'havuc' | 'bal' | 'muz' | 'cikolata';
export type Icecek = 'sut' | 'kakao' | 'limonata';
export type Boy = 'kucuk' | 'buyuk';
export type Gun = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type Yer = 'park' | 'okul' | 'plaj' | 'kar' | 'senlik';
export type Fark = 'urun' | 'adet' | 'sekil' | 'renk' | 'desen' | 'yuz' | 'yigin' | 'sus' | 'serpinti' | 'mum' | 'icecek' | 'boy' | 'dolum';

/** Bir günde gelen müşteri */
export const MUSTERI_SAYISI = 6;
/** Aynı anda en çok bu kadar müşteri sırada */
export const EN_COK_MUSTERI = 3;
/** Fırının kapı sayısı (görselde üç kapı; ilki açık, öbürleri yükseltmeyle açılır) */
export const FIRIN_GOZ = 3;
/** Tepsiye en çok bu kadar hamur topu sığar */
export const EN_COK_HAMUR = 5;
/** Bir kurabiyenin üstüne en çok bu kadar süs sığar; fazlası kayıp düşer (Kino yakalar) */
export const EN_COK_SUS = 3;
/** Kapkeğin üstüne en çok bu kadar krema yığını sığar */
export const EN_COK_YIGIN = 3;
/** Doğum günü kapkeğine en çok bu kadar mum */
export const EN_COK_MUM = 6;
/** Oynanabilen son gün (bu sürüm); sonrası tabloda "yakında" */
export const SON_OYNANAN = 6;
/** Bulaşık (Gün 4+): otobüste bu kadar tabak var */
export const TABAK_SAYISI = 4;

export const SEKILLER: Sekil[] = ['yuvarlak', 'yildiz', 'kalp', 'ay'];
export const RENKLER: Renk[] = ['pembe', 'mavi', 'sari', 'mor'];
export const SUSLER: Sus[] = ['cilek', 'havuc', 'bal', 'muz', 'cikolata'];
export const ICECEKLER: Icecek[] = ['sut', 'kakao', 'limonata'];

/** Krema renkleri (parlak, iştah açıcı) */
export const RENK_KODU: Record<Renk, string> = { pembe: '#FF8CC0', mavi: '#6CC4FF', sari: '#FFD84A', mor: '#B98BFF' };
/** İçeceklerin rengi */
export const ICECEK_KODU: Record<Icecek, string> = { sut: '#FFF3DA', kakao: '#9A5B35', limonata: '#FFE45C' };

export interface Kalem {
  urun: Urun;
  adet: number;
  /** kurabiyenin şekli (kapkek ve içecekte null) */
  sekil: Sekil | null;
  /** krema rengi (null: kremasız; içecekte null) */
  renk: Renk | null;
  sus: Sus | null;
  /** parça başına süs sayısı */
  susAdet: number;
  /** kapkekte krema yığını sayısı (kurabiyede 0) */
  yigin: number;
  /** kurabiyede krema deseni (yoksa düz) */
  desen?: Desen;
  /** serpinti seviyesi: 0 yok, 1 az, 2 bol (yoksa 0) */
  serpinti?: number;
  /** yüzlü kurabiye (Gün 2+) */
  yuz?: Yuz | null;
  /** doğum günü kapkeği: yaş kadar mum */
  mum?: number;
  icecek?: Icecek;
  boy?: Boy;
}

export type Ozel = 'dogumgunu' | 'karisik' | 'anne';
export interface Siparis {
  musteri: string;
  kalemler: Kalem[];
  /** mantık siparişi (Gün 3): "Tavşanınkinden bir fazla çilek!" (balonda tavşanın kurabiyesi ve +1 çilek) */
  mantik?: { kaynak: string; kalem: Kalem; fazla: number };
  /** özel müşteri: doğum günü (yaş kadar mum), kafası karışık (balon krema öncesi değişir), Ege'nin annesi (şekersiz) */
  ozel?: Ozel;
  /** kafası karışık müşterinin yeni isteği (kalemin değişen alanları) */
  degisim?: { i: number; renk?: Renk; desen?: Desen };
}

/** Tepside / fırında / tabakta bir parça */
export interface Parca {
  /** kurabiyenin kreması (kapkekte yığınların rengi ayrı) */
  renk: Renk | null;
  yigin: Renk[];
  susler: Sus[];
  /** krema deseni (yoksa düz) */
  desen?: Desen | null;
  /** serpinti tanesi sayısı (seviyesi serpintiSeviye ile) */
  serpinti?: number;
  yuz?: Yuz | null;
  mum?: number;
}
/** Bardak (içecek makinesinden) */
export interface Bardak {
  icecek: Icecek | null;
  boy: Boy;
  /** doluluk, çizgiye oranla (1 = tam çizgide) */
  dolum: number;
}
/** Aynı kalıptan çıkan bir parti (fırının bir gözü, tabağın üstü) ya da bir bardak */
export interface Parti {
  urun: Urun;
  sekil: Sekil | null;
  parcalar: Parca[];
  bardak?: Bardak;
}

// ---------------------------------------------------------------- günler ve müşteriler
/** Günün yeniliği (açılış kartında resimle) */
export type Yenilik = 'desen' | 'serpinti' | 'yuz' | 'kapkek' | 'icecek' | 'bulasik' | 'karisik' | 'dogumgunu' | 'anne' | 'donut' | 'aceleci' | 'paket' | 'sandvic' | 'kule' | 'para' | 'dilim' | 'senlik';
export interface GunAyari {
  yer: Yer;
  musteriler: string[];
  /** iki müşterinin gelişi arasındaki en kısa süre (ms) */
  aralik: number;
  /** sabır kalbinin dolma süresi (ms); dolunca müşteri uyuklar */
  sabir: number;
  /** günlük hedef: bu kadar mutlu müşteri (sipariş tam aynı) */
  hedef: number;
  /** bu günde ilk kez gelenler */
  yeni: Yenilik[];
}
const HERKES = ['tavsan', 'ordek', 'can', 'ayi', 'ada', 'elif'];
/**
 * 10 günlük tablo (v2 3d). Mekânlar: park (1-2), okul önü (3-4), plaj (5, 7), karlı bahçe (6, 8, 9), şenlik (10).
 * Bu sürümde özel müşteriler öne alındı: kafası karışık ve doğum günü Gün 5'te, Ege'nin annesi Gün 6'da (tabloda
 * 7-9'du); donut, paket, sandviç, kule, para üstü, dilimleme sonraki sürümde.
 */
export const GUNLER: Record<Gun, GunAyari> = {
  1: { yer: 'park', musteriler: ['tavsan', 'ordek', 'can'], aralik: 14000, sabir: 60000, hedef: 3, yeni: ['desen', 'serpinti'] },
  2: { yer: 'park', musteriler: ['ayi', 'ada', 'elif'], aralik: 13000, sabir: 60000, hedef: 4, yeni: ['yuz'] },
  3: { yer: 'okul', musteriler: HERKES, aralik: 12000, sabir: 60000, hedef: 4, yeni: ['kapkek'] },
  4: { yer: 'okul', musteriler: HERKES, aralik: 12000, sabir: 65000, hedef: 5, yeni: ['icecek', 'bulasik'] },
  5: { yer: 'plaj', musteriler: HERKES, aralik: 12000, sabir: 65000, hedef: 5, yeni: ['karisik', 'dogumgunu'] },
  6: { yer: 'kar', musteriler: ['anne', 'can', 'ayi', 'ada', 'tavsan', 'ordek'], aralik: 12000, sabir: 65000, hedef: 5, yeni: ['anne'] },
  7: { yer: 'plaj', musteriler: HERKES, aralik: 11000, sabir: 60000, hedef: 6, yeni: ['sandvic', 'donut', 'aceleci'] },
  8: { yer: 'kar', musteriler: HERKES, aralik: 11000, sabir: 60000, hedef: 6, yeni: ['kule', 'para'] },
  9: { yer: 'kar', musteriler: HERKES, aralik: 11000, sabir: 60000, hedef: 6, yeni: ['dilim', 'paket'] },
  10: { yer: 'senlik', musteriler: [...HERKES, 'pamuk'], aralik: 10000, sabir: 60000, hedef: 8, yeni: ['senlik'] },
};
export const GUN_SAYISI = 10;
export const oynanirMi = (g: number) => g >= 1 && g <= SON_OYNANAN;
export const HAYVANLAR = ['tavsan', 'ordek', 'ayi'];
export const COCUK_MUSTERILER = ['can', 'ada', 'elif'];

/** Müşterinin sevdiği şey siparişine yansır: tavşan havuçlu, ayı ballı, ördek sarı kremalı */
export const SEVGI: Record<string, { renk?: Renk; sus?: Sus }> = { tavsan: { sus: 'havuc' }, ayi: { sus: 'bal' }, ordek: { renk: 'sari' } };

// ---------------------------------------------------------------- yıldız, hedef, yükseltme
/** Günün yıldızı: 1 gün bitti (her zaman), 2 hedef tuttu, 3 hedef + hiç uyuyan müşteri yok */
export function yildizHesapla(mutlu: number, hedef: number, uyuyanVar: boolean): 1 | 2 | 3 {
  if (mutlu < hedef) return 1;
  return uyuyanVar ? 2 : 3;
}

export interface Yukseltme {
  id: string;
  /** bu kadar toplam yıldızla erken açılır (null: bu sürümde yok, "yakında") */
  esik: number | null;
  /** yıldız yetmese de bu günden itibaren açık (oyun hiç tıkanmaz: içecek günü makinesiz kalmaz) */
  gun: number;
}
/** Yükseltmeler, belgedeki sırayla (v2 3b). Yıldızla açılır; jeton yalnız süs (dükkân rafı) alır. */
export const YUKSELTMELER: Yukseltme[] = [
  { id: 'firin-2', esik: 3, gun: 3 },
  { id: 'icecek', esik: 6, gun: 4 },
  { id: 'hamur-makinesi', esik: null, gun: 99 },
  { id: 'hizli-firin', esik: 9, gun: 6 },
  { id: 'paket', esik: null, gun: 99 },
  { id: 'kavanoz', esik: null, gun: 99 },
  { id: 'firin-3', esik: null, gun: 99 },
];
/** Açık yükseltmeler: toplam yıldız eşiği geçti ya da o gün geldi */
export function acikYukseltmeler(yildiz: number, gun: number): string[] {
  return YUKSELTMELER.filter((y) => y.esik !== null && (yildiz >= y.esik || gun >= y.gun)).map((y) => y.id);
}
/** Sıradaki (henüz açılmamış) yükseltme ve eşiği (yoksa null) */
export function siradakiYukseltme(yildiz: number, gun: number): Yukseltme | null {
  const acik = acikYukseltmeler(yildiz, gun);
  return YUKSELTMELER.find((y) => y.esik !== null && !acik.includes(y.id)) ?? null;
}
/** Açık fırın gözü sayısı */
export const firinGozSayisi = (yuk: readonly string[]) => 1 + (yuk.includes('firin-2') ? 1 : 0) + (yuk.includes('firin-3') ? 1 : 0);

/** Açık olan (kullanılabilen) kalıplar, renkler, süsler, desenler … */
export interface Acik {
  sekiller: Sekil[];
  renkler: Renk[];
  susler: Sus[];
  kapkek: boolean;
  desenler: Desen[];
  /** yüzlü kurabiye */
  yuz: boolean;
  /** içecek makinesi (yükseltme) */
  icecek: boolean;
  /** bulaşık: tabaklar birikir, Kino yıkar */
  bulasik: boolean;
}

/**
 * Oynanan güne, dükkândan alınanlara ve açık yükseltmelere göre açık olanlar. Gün 2'den itibaren havuç dilimi ve bal
 * damlası, yüz ve dalga deseni; Gün 3'te kapkek ve nokta deseni; Gün 4'te bulaşık; Gün 5'te kalp deseni. Ay kalıbı,
 * mor krema, muz ve çikolata dükkândan alınır; içecekler makine yükseltmesiyle.
 */
export function acikOlanlar(gun: number, alinan: readonly string[] = [], yuk: readonly string[] = acikYukseltmeler(0, gun)): Acik {
  const al = (id: string) => alinan.includes(id);
  return {
    sekiller: ['yuvarlak', 'yildiz', 'kalp', ...(al('kalip-ay') ? (['ay'] as const) : [])],
    renkler: ['pembe', 'mavi', 'sari', ...(al('renk-mor') ? (['mor'] as const) : [])],
    susler: ['cilek', ...(gun >= 2 ? (['havuc', 'bal'] as const) : []), ...(al('sus-muz') ? (['muz'] as const) : []), ...(al('sus-cikolata') ? (['cikolata'] as const) : [])],
    kapkek: gun >= 3,
    desenler: DESENLER.filter((d) => (d === 'dalga' ? gun >= 2 : d === 'nokta' ? gun >= 3 : d === 'kalp' ? gun >= 5 : true)),
    yuz: gun >= 2,
    icecek: yuk.includes('icecek'),
    bulasik: gun >= 4,
  };
}

type Rnd = () => number;
const sec = <T>(a: readonly T[], rnd: Rnd): T => a[Math.floor(rnd() * a.length) % a.length];
const arasi = (a: number, b: number, rnd: Rnd) => a + Math.floor(rnd() * (b - a + 1));

/** Desen seçimi: düz olmayanlar daha sık (çizgi çalışması); en yeni desen biraz daha sık */
function desenSec(acik: Acik, rnd: Rnd): Desen {
  const d = acik.desenler;
  if (d.length <= 1) return 'duz';
  if (rnd() < 0.25) return 'duz';
  const cizgili = d.filter((x) => x !== 'duz');
  return rnd() < 0.4 ? cizgili[cizgili.length - 1] : sec(cizgili, rnd);
}
/** Serpinti seviyesi: yok / az / bol */
const serpintiSec = (rnd: Rnd) => sec([0, 1, 2], rnd);

/** Bir kurabiye kalemi (günün kuralına göre) */
export function kurabiyeKalemi(gun: Gun, musteri: string, acik: Acik, rnd: Rnd = Math.random, susZorla?: Sus | null): Kalem {
  const sevgi = SEVGI[musteri] ?? {};
  const renk = sevgi.renk && acik.renkler.includes(sevgi.renk) ? sevgi.renk : sec(acik.renkler, rnd);
  const sekil = sec(acik.sekiller, rnd);
  const desen = desenSec(acik, rnd);
  const serpinti = serpintiSec(rnd);
  if (gun === 1) return { urun: 'kurabiye', adet: 1, sekil, renk, sus: null, susAdet: 0, yigin: 0, desen, serpinti };
  const adet = gun >= 4 ? arasi(1, 2, rnd) : arasi(2, 3, rnd);
  const sus = susZorla !== undefined ? susZorla : sevgi.sus && acik.susler.includes(sevgi.sus) ? sevgi.sus : sec(acik.susler, rnd);
  // üç kurabiyede kurabiye başına en çok iki süs (toplam dokunuş 6'yı geçmesin)
  const susAdet = sus ? arasi(1, adet === 3 ? 2 : 3, rnd) : 0;
  return { urun: 'kurabiye', adet, sekil, renk, sus, susAdet, yigin: 0, desen, serpinti };
}

/** Yüzlü kurabiye (Gün 2+): tek kurabiye, düz krema, yüz; süs ve serpinti yok (yüz görünsün) */
export function yuzluKalem(musteri: string, acik: Acik, rnd: Rnd = Math.random): Kalem {
  const sevgi = SEVGI[musteri] ?? {};
  const renk = sevgi.renk && acik.renkler.includes(sevgi.renk) ? sevgi.renk : sec(acik.renkler, rnd);
  // yıldızın içi dar: yüz yuvarlak ya da kalp kurabiyede
  const sekil = sec(acik.sekiller.filter((s) => s === 'yuvarlak' || s === 'kalp'), rnd);
  return { urun: 'kurabiye', adet: 1, sekil, renk, sus: null, susAdet: 0, yigin: 0, desen: 'duz', serpinti: 0, yuz: sec(['gulen', 'saskin', 'kirpan'] as const, rnd) };
}

/** Bir kapkek kalemi (Gün 3): 1 kapkek, 1-3 krema yığını, belki tek süs */
export function kapkekKalemi(musteri: string, acik: Acik, rnd: Rnd = Math.random): Kalem {
  const sevgi = SEVGI[musteri] ?? {};
  const renk = sevgi.renk && acik.renkler.includes(sevgi.renk) ? sevgi.renk : sec(acik.renkler, rnd);
  const sus = rnd() < 0.5 ? (sevgi.sus && acik.susler.includes(sevgi.sus) ? sevgi.sus : sec(acik.susler, rnd)) : null;
  return { urun: 'kapkek', adet: 1, sekil: null, renk, sus, susAdet: sus ? 1 : 0, yigin: arasi(1, EN_COK_YIGIN, rnd) };
}

/** Doğum günü kapkeği: bir yığın krema ve yaş kadar mum (4-6) */
export function dogumgunuKalemi(musteri: string, acik: Acik, rnd: Rnd = Math.random): Kalem {
  const sevgi = SEVGI[musteri] ?? {};
  const renk = sevgi.renk && acik.renkler.includes(sevgi.renk) ? sevgi.renk : sec(acik.renkler, rnd);
  return { urun: 'kapkek', adet: 1, sekil: null, renk, sus: null, susAdet: 0, yigin: 1, mum: arasi(4, EN_COK_MUM, rnd) };
}

/** İçecek: mekâna göre (okul önünde süt, plajda limonata, karda kakao çok satılır) */
export function icecekKalemi(yer: Yer, rnd: Rnd = Math.random): Kalem {
  const agirlik: Record<Yer, Icecek[]> = {
    park: ['sut', 'kakao', 'limonata'],
    okul: ['sut', 'sut', 'sut', 'kakao', 'limonata'],
    plaj: ['limonata', 'limonata', 'limonata', 'sut'],
    kar: ['kakao', 'kakao', 'kakao', 'sut'],
    senlik: ['sut', 'kakao', 'limonata'],
  };
  return { urun: 'icecek', adet: 1, sekil: null, renk: null, sus: null, susAdet: 0, yigin: 0, icecek: sec(agirlik[yer], rnd), boy: rnd() < 0.5 ? 'kucuk' : 'buyuk' };
}

/** Aynı karakter arka arkaya gelmesin diye karıştırır */
export function sirala<T>(adlar: T[], rnd: Rnd = Math.random): T[] {
  for (let deneme = 0; deneme < 30; deneme++) {
    const a = adlar.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    if (a.every((x, i) => i === 0 || x !== a[i - 1])) return a;
  }
  return adlar.slice();
}

/**
 * Günün 6 siparişi (sırasıyla).
 * Gün 1: tek kurabiye, tek şekil, tek renk; desen (düz ya da zigzag) ve serpinti.
 * Gün 2: yarısı yüzlü kurabiye, yarısı 2-3 kurabiye (süs ve süs sayısı 1-3).
 * Gün 3 (okul önü): iki kapkek, bir ikili (kurabiye + kapkek), tavşanın çilekli kurabiyesi ve sonra ayının mantık
 * siparişi ("tavşanınkinden bir fazla çilek"), bir de Gün 2 türü kurabiye. İçecek makinesi erken açıldıysa iki
 * siparişe içecek eklenir.
 * Gün 4-6: dördüne içecek (tatlı + içecek), tatlı kurabiye ya da kapkek. Gün 5 (plaj): kafası karışık ördek, doğum
 * günü (Elif). Gün 6 (karlı bahçe): Ege'nin annesi (süt + şekersiz kurabiye), doğum günü (Can), kafası karışık ördek.
 */
export function gunPlani(gun: Gun, acik: Acik, rnd: Rnd = Math.random): Siparis[] {
  const g = GUNLER[gun];
  if (gun === 1) return sirala([...g.musteriler, ...g.musteriler], rnd).map((musteri) => ({ musteri, kalemler: [kurabiyeKalemi(1, musteri, acik, rnd)] }));
  if (gun === 2) {
    const adlar = sirala([...g.musteriler, ...g.musteriler], rnd);
    const ilk = new Set<string>();
    const yuzIlk = new Map(g.musteriler.map((m) => [m, rnd() < 0.5]));
    return adlar.map((musteri) => {
      // her karakterin bir siparişi yüzlü, öbürü süslü
      const yuzlu = acik.yuz && !ilk.has(musteri) === yuzIlk.get(musteri);
      ilk.add(musteri);
      return { musteri, kalemler: [yuzlu ? yuzluKalem(musteri, acik, rnd) : kurabiyeKalemi(2, musteri, acik, rnd)] };
    });
  }
  if (gun === 3) return icecekEkle(gun3Plani(acik, rnd), g.yer, acik.icecek ? 2 : 0, rnd);
  // Gün 4-6
  const adlar = sirala(g.musteriler, rnd);
  const plan: Siparis[] = adlar.map((musteri) => {
    if (gun === 5 && musteri === 'elif') return { musteri, ozel: 'dogumgunu', kalemler: [dogumgunuKalemi(musteri, acik, rnd)] };
    if (gun === 6 && musteri === 'can') return { musteri, ozel: 'dogumgunu', kalemler: [dogumgunuKalemi(musteri, acik, rnd)] };
    if (gun === 6 && musteri === 'anne') {
      // Ege bebek: yumuşak, kremasız, şekersiz kurabiye ve küçük süt
      const k: Kalem = { urun: 'kurabiye', adet: 1, sekil: 'yuvarlak', renk: null, sus: null, susAdet: 0, yigin: 0, desen: 'duz', serpinti: 0 };
      return { musteri, ozel: 'anne', kalemler: [k, { ...icecekKalemi(g.yer, rnd), icecek: 'sut', boy: 'kucuk' }] };
    }
    const tatli = acik.kapkek && rnd() < 0.3 ? kapkekKalemi(musteri, acik, rnd) : kurabiyeKalemi(gun, musteri, acik, rnd, rnd() < 0.5 ? null : undefined);
    if (musteri === 'ordek' && gun >= 5) {
      // kafası karışık: krema öncesi kremanın rengini değiştirir ("Şey… hayır, şöyle olsun!")
      const k = kurabiyeKalemi(gun, musteri, acik, rnd);
      return { musteri, ozel: 'karisik', kalemler: [k], degisim: { i: 0, renk: sec(acik.renkler.filter((r) => r !== k.renk), rnd) } };
    }
    return { musteri, kalemler: [tatli] };
  });
  // plajda çikolata erir: süs çikolata olmaz
  if (g.yer === 'plaj') for (const s of plan) for (const k of s.kalemler) if (k.sus === 'cikolata') k.sus = acik.susler[0];
  return icecekEkle(plan, g.yer, acik.icecek ? 4 : 0, rnd);
}

/** n siparişe içecek ekler (tek kalemli, özel olmayan siparişlere; tatlı + içecek) */
function icecekEkle(plan: Siparis[], yer: Yer, n: number, rnd: Rnd): Siparis[] {
  const adaylar = plan.map((_, i) => i).filter((i) => plan[i].kalemler.length === 1 && !plan[i].mantik && plan[i].ozel !== 'dogumgunu');
  const secilen = sirala(adaylar, rnd).slice(0, n);
  for (const i of secilen) plan[i].kalemler.push(icecekKalemi(yer, rnd));
  return plan;
}

function gun3Plani(acik: Acik, rnd: Rnd): Siparis[] {
  const g = GUNLER[3];
  // tavşan ayıdan önce gelir (ayı onun kurabiyesine bakar)
  let adlar = sirala(g.musteriler, rnd);
  if (adlar.indexOf('tavsan') > adlar.indexOf('ayi')) adlar = adlar.map((x) => (x === 'tavsan' ? 'ayi' : x === 'ayi' ? 'tavsan' : x));
  const digerTurler = sirala(['kapkek', 'kapkek', 'ikili', 'kurabiye'], rnd);
  let tavsanKalemi: Kalem | null = null;
  const plan: Siparis[] = [];
  for (const musteri of adlar) {
    if (musteri === 'tavsan') {
      const k = kurabiyeKalemi(3, musteri, acik, rnd, 'cilek');
      tavsanKalemi = { ...k, adet: 1, susAdet: arasi(1, 2, rnd) };
      plan.push({ musteri, kalemler: [tavsanKalemi] });
      continue;
    }
    if (musteri === 'ayi' && tavsanKalemi) {
      const kalem: Kalem = { ...tavsanKalemi, susAdet: tavsanKalemi.susAdet + 1 };
      plan.push({ musteri, kalemler: [kalem], mantik: { kaynak: 'tavsan', kalem: tavsanKalemi, fazla: 1 } });
      continue;
    }
    const tur = digerTurler.shift() ?? 'kurabiye';
    if (tur === 'kapkek') plan.push({ musteri, kalemler: [kapkekKalemi(musteri, acik, rnd)] });
    else if (tur === 'ikili') {
      const k = kurabiyeKalemi(3, musteri, acik, rnd, null);
      plan.push({ musteri, kalemler: [{ ...k, adet: 1 }, { ...kapkekKalemi(musteri, acik, rnd), yigin: arasi(1, 2, rnd) }] });
    } else plan.push({ musteri, kalemler: [kurabiyeKalemi(3, musteri, acik, rnd)] });
  }
  return plan;
}

/** Kafası karışık müşterinin isteği değişir (krema öncesi): yeni sipariş (eskisi değişmez) */
export function degisimUygula(sip: Siparis): Siparis {
  const d = sip.degisim;
  if (!d) return sip;
  const kalemler = sip.kalemler.map((k, i) => (i === d.i ? { ...k, ...(d.renk ? { renk: d.renk } : {}), ...(d.desen ? { desen: d.desen } : {}) } : k));
  return { ...sip, kalemler, degisim: undefined };
}

/** Sıradaki müşteri: kuyrukta, şu an tezgâhta olmayan ilk karakter (aynı karakter iki kez görünmesin) */
export function siradakiIndeks(kuyruk: readonly Siparis[], mevcut: readonly string[]): number {
  return kuyruk.findIndex((s) => !mevcut.includes(s.musteri));
}

// ---------------------------------------------------------------- karşılaştırma
/** Parçanın krema renkleri (kurabiye: kreması, kapkek: yığınları) */
const parcaRenkleri = (urun: Urun, p: Parca): (Renk | null)[] => (urun === 'kurabiye' ? [p.renk] : p.yigin.length ? p.yigin : [null]);

/** İçeceğin doluluğu: çizginin altında mı, çizgide mi, taştı mı (taşanı Kino siler: tam sayılır) */
export const DOLUM_PAY = 0.13;
export function dolumSonucu(d: number): 'az' | 'tam' | 'tasti' {
  return d < 1 - DOLUM_PAY ? 'az' : d <= 1 + DOLUM_PAY ? 'tam' : 'tasti';
}

/** Bir kalem ile verilen parti arasındaki farklar (boşsa tam aynı) */
export function karsilastir(kalem: Kalem, parti: Parti | null | undefined): Fark[] {
  if (!parti || (!parti.parcalar.length && !parti.bardak)) return ['urun'];
  const f = new Set<Fark>();
  if (parti.urun !== kalem.urun) f.add('urun');
  if (kalem.urun === 'icecek' || parti.urun === 'icecek') {
    const b = parti.bardak;
    if (b && kalem.urun === 'icecek') {
      if (b.icecek !== kalem.icecek) f.add('icecek');
      if (b.boy !== kalem.boy) f.add('boy');
      if (dolumSonucu(b.dolum) === 'az') f.add('dolum');
    }
    return siraliFark(f);
  }
  if (parti.parcalar.length !== kalem.adet) f.add('adet');
  if (kalem.urun === 'kurabiye' && parti.urun === 'kurabiye' && parti.sekil !== kalem.sekil) f.add('sekil');
  for (const p of parti.parcalar) {
    if (parcaRenkleri(parti.urun, p).some((r) => r !== kalem.renk)) f.add('renk');
    if (kalem.urun === 'kapkek' && parti.urun === 'kapkek' && p.yigin.length !== kalem.yigin) f.add('yigin');
    if (p.susler.length !== kalem.susAdet || p.susler.some((s) => s !== kalem.sus)) f.add('sus');
    if (kalem.urun === 'kurabiye' && parti.urun === 'kurabiye') {
      // kremasız kurabiyede desen sorulmaz
      if (kalem.renk && p.renk && (p.desen ?? 'duz') !== (kalem.desen ?? 'duz')) f.add('desen');
      if ((p.yuz ?? null) !== (kalem.yuz ?? null)) f.add('yuz');
      if (serpintiSeviye(p.serpinti ?? 0) !== (kalem.serpinti ?? 0)) f.add('serpinti');
    }
    if (kalem.urun === 'kapkek' && (p.mum ?? 0) !== (kalem.mum ?? 0)) f.add('mum');
  }
  return siraliFark(f);
}
const FARK_SIRA: Fark[] = ['urun', 'adet', 'sekil', 'renk', 'desen', 'yuz', 'yigin', 'sus', 'serpinti', 'mum', 'icecek', 'boy', 'dolum'];
const siraliFark = (f: Set<Fark>) => FARK_SIRA.filter((x) => f.has(x));

/** Verilen parti siparişin hangi kalemine gider: önce aynı üründen boş kalem, yoksa ilk boş kalem (-1: hepsi dolu) */
export function kalemSec(sip: Siparis, verilen: readonly (Parti | null)[], parti: Parti): number {
  const bos = sip.kalemler.map((_, i) => i).filter((i) => !verilen[i]);
  return bos.find((i) => sip.kalemler[i].urun === parti.urun) ?? bos[0] ?? -1;
}

export interface Sonuc {
  ayni: boolean;
  /** kalem kalem farklar */
  farklar: Fark[][];
}
export function siparisSonucu(sip: Siparis, verilen: readonly (Parti | null)[]): Sonuc {
  const farklar = sip.kalemler.map((k, i) => karsilastir(k, verilen[i]));
  return { ayni: farklar.every((f) => !f.length), farklar };
}

/**
 * Tabaktaki parti hangi müşterinin hangi kalemi için yapılıyor (krema deseni, yüz ve mum bu kaleme göre çıkar).
 * Önce aynı ürün + şekil + adet eşleşen, gelişi en eski müşterinin boş kalemi; yoksa aynı üründen ilk boş kalem.
 */
export function hedefKalem(bekleyenler: readonly { sip: Siparis; verilen: readonly (Parti | null)[] }[], parti: Parti, renk?: Renk | null): Kalem | null {
  const bos = bekleyenler.flatMap((m) => m.sip.kalemler.filter((_, i) => !m.verilen[i]));
  // en çok tutan kalem (şekil, adet, sıkılan kremanın rengi); eşitse gelişi en eski
  let en: Kalem | null = null;
  let enPuan = -1;
  for (const k of bos) {
    if (k.urun !== parti.urun) continue;
    const puan = (k.urun !== 'kurabiye' || k.sekil === parti.sekil ? 4 : 0) + (k.adet === parti.parcalar.length ? 2 : 0) + (renk && k.renk === renk ? 1 : 0);
    if (puan > enPuan) {
      enPuan = puan;
      en = k;
    }
  }
  return en;
}

// ---------------------------------------------------------------- fırın
/** Fırın zamanları (ms): beyaz (çiğ) → altın sarısı (tam kıvamında, "ding") → kahverengi (yanık, 6 sn sonra) */
export const FIRIN = { altin: 6000, yanik: 12000 };
export type FirinZaman = typeof FIRIN;
export type FirinHali = 'cig' | 'altin' | 'yanik';

export function firinHali(gecen: number, z: FirinZaman = FIRIN): FirinHali {
  return gecen >= z.yanik ? 'yanik' : gecen >= z.altin ? 'altin' : 'cig';
}
/** Pişme: 0 çiğ … 1 altın … 2 yanık (renk geçişi için, sınırlı) */
export function pisme(gecen: number, z: FirinZaman = FIRIN): number {
  if (gecen <= 0) return 0;
  if (gecen < z.altin) return gecen / z.altin;
  return Math.min(2, 1 + (gecen - z.altin) / (z.yanik - z.altin));
}

/** İki renk (#rrggbb) arasında doğrusal geçiş */
export function renkKaristir(a: string, b: string, t: number): string {
  const u = Math.max(0, Math.min(1, t));
  const p = (s: string, i: number) => parseInt(s.slice(1 + i * 2, 3 + i * 2), 16);
  return '#' + [0, 1, 2].map((i) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * u).toString(16).padStart(2, '0')).join('');
}
/** Hamurun rengi: beyaz → altın → kahverengi */
export const HAMUR_RENK = { cig: '#FBF0DC', altin: '#F3B54A', yanik: '#7B4526' };
export function hamurRengi(pismeDegeri: number): string {
  return pismeDegeri <= 1 ? renkKaristir(HAMUR_RENK.cig, HAMUR_RENK.altin, pismeDegeri) : renkKaristir(HAMUR_RENK.altin, HAMUR_RENK.yanik, pismeDegeri - 1);
}

// ---------------------------------------------------------------- jeton
/** Sabır kalbi bu orandan önce servis edilirse (ve müşteri uyuklamadıysa) bahşiş */
export const HIZLI = 0.75;
/**
 * Tam aynıysa 3 jeton (+1 bahşiş: hızlı servis), farklıysa 2 jeton. Ret yok, ceza yok.
 * sabir: servis anında sabır kalbinin doluluğu (0..1).
 */
export function jetonHesapla(ayni: boolean, sabir: number, uyudu: boolean): { jeton: number; bahsis: number } {
  if (!ayni) return { jeton: 2, bahsis: 0 };
  return { jeton: 3, bahsis: !uyudu && sabir < HIZLI ? 1 : 0 };
}

/**
 * Akşam kumbara sayımı: 10'a kadar tek tek ("Bir!" … "On!"), fazlası beşer beşer ("Beş!", "On!", "On beş!", "Yirmi!").
 * Dönen: söylenecek sayılar ve her sözde kumbaraya düşen jeton sayısı.
 */
export function sayim(n: number): { soz: string[]; adim: number[] } {
  if (n <= 0) return { soz: [], adim: [] };
  if (n <= 10) return { soz: Array.from({ length: n }, (_, i) => sayiSozu(i + 1)), adim: Array.from({ length: n }, () => 1) };
  const besli = P.parca.besli;
  const soz: string[] = [];
  const adim: number[] = [];
  let sayilan = 0;
  for (let i = 0; i < besli.length && sayilan + 5 <= n; i++) {
    soz.push(besli[i]);
    adim.push(5);
    sayilan += 5;
  }
  // artan jetonlar sessizce düşer (ekranda sayı görünür)
  if (n > sayilan) adim.push(n - sayilan);
  return { soz, adim };
}

// ---------------------------------------------------------------- dükkân rafı
export type RafTuru = 'sapka' | 'kalip' | 'sus' | 'renk' | 'boya';
export interface RafUrunu {
  id: string;
  tur: RafTuru;
  deger: string;
  fiyat: number;
}
/** Akşam dükkân rafı: fiyatlar jetonla (çocuk "yeter mi?" diye sayar) */
export const RAF: RafUrunu[] = [
  { id: 'sapka', tur: 'sapka', deger: 'sapka', fiyat: 5 },
  { id: 'kalip-ay', tur: 'kalip', deger: 'ay', fiyat: 8 },
  { id: 'sus-muz', tur: 'sus', deger: 'muz', fiyat: 6 },
  { id: 'sus-cikolata', tur: 'sus', deger: 'cikolata', fiyat: 7 },
  { id: 'renk-mor', tur: 'renk', deger: 'mor', fiyat: 7 },
  { id: 'boya-nane', tur: 'boya', deger: 'nane', fiyat: 10 },
  { id: 'boya-limon', tur: 'boya', deger: 'limon', fiyat: 10 },
];
/** Otobüs boyaları (varsayılan pembe) */
export const BOYA: Record<string, { govde: string; koyu: string }> = {
  pembe: { govde: '#FF8CC0', koyu: '#E2609E' },
  nane: { govde: '#7FE0C4', koyu: '#3FB596' },
  limon: { govde: '#FFD84A', koyu: '#E8AE1E' },
};

export interface Cuzdan {
  jeton: number;
  alinan: string[];
}
/** Alınabilir mi: alınmamış ve jeton yetiyor */
export const alinabilir = (c: Cuzdan, u: RafUrunu) => !c.alinan.includes(u.id) && c.jeton >= u.fiyat;
/** Satın alır (jeton düşer); olmadıysa false */
export function satinAl(c: Cuzdan, id: string): boolean {
  const u = RAF.find((x) => x.id === id);
  if (!u || !alinabilir(c, u)) return false;
  c.jeton -= u.fiyat;
  c.alinan.push(u.id);
  return true;
}

// ---------------------------------------------------------------- konuşma
/** "İki!" (mevcut sayı kayıtları) */
export const sayiSozu = (n: number) => `${buyukHarfBas(sayiAdi(n))}!`;

/** Siparişin okunuşu (parçalı kayıt): {sayı} {şekil} kurabiye, {renk} kremalı, {desen}, {süs}lü, {serpinti}! + içecek */
export function okuma(sip: Siparis): string[] {
  if (sip.mantik) return [P.mino.mantik];
  if (sip.ozel === 'anne') return [P.mino.ege, ...sip.kalemler.filter((k) => k.urun === 'icecek').flatMap(kalemOkumasi)];
  if (sip.ozel === 'dogumgunu') return [P.mino.dogumgunu, ...sip.kalemler.flatMap(kalemOkumasi)];
  return sip.kalemler.flatMap((k) => kalemOkumasi(k));
}
export function kalemOkumasi(k: Kalem): string[] {
  if (k.urun === 'icecek') return [(P.parca.icecek as Record<string, string>)[`${k.boy ?? 'kucuk'}-${k.icecek ?? 'sut'}`]];
  const sekil = P.parca.sekil[k.urun === 'kapkek' ? 'kapkek' : (k.sekil ?? 'yuvarlak')];
  const ekler: string[] = [];
  if (k.urun === 'kurabiye' && k.desen && k.desen !== 'duz') ekler.push((P.parca.desen as Record<string, string>)[k.desen]);
  if (k.yuz) ekler.push(P.parca.yuz[k.yuz]);
  if (k.sus) ekler.push(P.parca.sus[k.sus]);
  if (k.serpinti) ekler.push(k.serpinti >= 2 ? P.parca.serpinti.bol : P.parca.serpinti.az);
  if (k.mum) ekler.push((P.parca.mum as Record<string, string>)[String(k.mum)] ?? sayiSozu(k.mum));
  const renk = k.renk ? [(ekler.length ? P.parca.renk_ara : P.parca.renk_son)[k.renk]] : [];
  return [sayiSozu(k.adet), sekil, ...renk, ...ekler];
}

/** Müşterinin teşekkürü: sevdiği şey tabaktaysa birinci cümle (ör. tavşan "Mmm, havuç!"), yoksa ikinci */
export function tesekkur(musteri: string, verilen: readonly (Parti | null)[], rnd: Rnd = Math.random): string {
  const t = (P.musteri as unknown as Record<string, string[]>)[musteri];
  if (!t) return P.mino.afiyet;
  const sevgi = SEVGI[musteri];
  if (sevgi) {
    const parcalar = verilen.flatMap((v) => v?.parcalar ?? []);
    const var_ = parcalar.some((p) => (sevgi.sus && p.susler.includes(sevgi.sus)) || (sevgi.renk && (p.renk === sevgi.renk || p.yigin.includes(sevgi.renk))));
    return var_ ? t[0] : t[1];
  }
  return sec(t, rnd);
}

const topla = (v: unknown): string[] => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(topla) : v && typeof v === 'object' ? Object.values(v).flatMap(topla) : []);

/** Anlatıcı sesiyle seslendirilecek bütün cümleler (Mino, müşteriler, parçalar, sayılar) */
export function pastaCumleleri(): string[] {
  const c = [...topla(P.mino), ...topla(P.musteri), ...topla(P.parca), ...Array.from({ length: 10 }, (_, i) => sayiSozu(i + 1))];
  return [...new Set(c)];
}
/** Kino'nun kendi sesiyle seslendirilecek cümleler */
export function pastaKinoCumleleri(): string[] {
  return topla(P.kino);
}
