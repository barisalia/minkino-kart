/**
 * Okula Hazırım! · Sayı Bahçesi'nin mantığı (DOM yok; tests/unit/okul.test.ts denetler).
 *
 * Yaş kuralı (ekip/senaryo/okul-oncesi.md): 3-4 yaş 1-5 arası, toplama-çıkarma yok; 5-6 yaş 1-10 arası, 5'e kadar
 * toplama ve çıkarma. Her üretici `rnd` alır (testte sabit tohum).
 */
import O from '../../content/okul.json';
import { buyukHarfBas, sayiAdi } from '../../src/audio/metin';

export type Yas = 3 | 4 | 5 | 6;
export type Rnd = () => number;

/** Yaşa göre en büyük sayı: 3-4 yaş 5, 5-6 yaş 10 */
export const enBuyuk = (yas: number) => (yas <= 4 ? 5 : 10);
/** Toplama ve çıkarma yalnız 5-6 yaşta */
export const islemVar = (yas: number) => yas >= 5;

/** [a, b] arasında tam sayı (ikisi dahil) */
export function tamsayi(rnd: Rnd, a: number, b: number): number {
  return a + Math.floor(rnd() * (b - a + 1));
}

export function karistir<T>(dizi: T[], rnd: Rnd): T[] {
  const a = dizi.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** "Bir!", "İki!" … "On!" (mevcut kayıtlar) */
export const sayiSozu = (n: number) => `${buyukHarfBas(sayiAdi(n))}!`;

/** Kalıptaki {Sayi} yerine sayının adı ("{Sayi} havuç lütfen!" → "Dört havuç lütfen!") */
export const kalipDoldur = (kalip: string, n: number) => kalip.replaceAll('{Sayi}', buyukHarfBas(sayiAdi(n)));

/**
 * Sayı kartı seçenekleri: doğru cevap + yakın sayılar (±1, ±2), hepsi farklı ve [en az, en çok] içinde; karışık sırada.
 * Yakın sayılar seçilir: çocuk tahminle değil sayarak bulsun.
 */
export function secenekler(dogru: number, enCok: number, rnd: Rnd, adet = 3, enAz = 1): number[] {
  const yakin = karistir([-1, 1, -2, 2, -3, 3], rnd)
    .map((d) => dogru + d)
    .filter((n) => n >= enAz && n <= enCok);
  const uzak = karistir(
    Array.from({ length: enCok - enAz + 1 }, (_, i) => enAz + i).filter((n) => n !== dogru && !yakin.includes(n)),
    rnd,
  );
  const digerleri = [...yakin, ...uzak].slice(0, Math.max(0, adet - 1));
  return karistir([dogru, ...digerleri], rnd);
}

// ---------------------------------------------------------------- Etkinlik 1: Kaç elma?
/** Ağaçtaki elma sayıları (2 tur). Kino'nun turunda (ilk tur) 5 olmaz: Kino'nun "beş"i yanlış kalsın. */
export function elmaTurlari(yas: number, rnd: Rnd): number[] {
  const ust = enBuyuk(yas);
  const alt = yas <= 4 ? 2 : 3;
  let ilk = tamsayi(rnd, alt, ust);
  if (ilk === 5) ilk = yas <= 4 ? 4 : 6;
  return [ilk, tamsayi(rnd, alt, ust)];
}

// ---------------------------------------------------------------- Etkinlik 2: Sayı kartı
/** Üç sepet (farklı elma sayıları), 2 tur. 5-6 yaşta ilk turda Kino'nun ters tuttuğu 6 vardır. */
export function sepetTurlari(yas: number, rnd: Rnd): number[][] {
  const ust = enBuyuk(yas);
  const tur = (zorunlu?: number) => {
    const havuz = karistir(Array.from({ length: ust }, (_, i) => i + 1).filter((n) => n !== zorunlu), rnd);
    return karistir([...(zorunlu ? [zorunlu] : []), ...havuz].slice(0, 3), rnd);
  };
  return [tur(yas >= 5 ? 6 : undefined), tur()];
}
/** Kart sepete uyar mı (rakam = elma sayısı) */
export const kartUyar = (kart: number, sepetteki: number) => kart === sepetteki;

// ---------------------------------------------------------------- Etkinlik 3: Sepete koy
/** Tavşanın istediği havuç sayıları (2 tur) */
export function havucTurlari(yas: number, rnd: Rnd): number[] {
  return yas <= 4 ? [tamsayi(rnd, 2, 4), tamsayi(rnd, 3, 5)] : [tamsayi(rnd, 3, 6), tamsayi(rnd, 5, 8)];
}
export type SepetDurumu = 'eksik' | 'tam' | 'fazla';
export function sepetDurumu(istenen: number, sepette: number): SepetDurumu {
  return sepette < istenen ? 'eksik' : sepette > istenen ? 'fazla' : 'tam';
}

// ---------------------------------------------------------------- Etkinlik 4: Hangisinde çok?
export type Soru = 'cok' | 'az' | 'esit';
export type Taraf = 'sol' | 'sag' | 'esit';
export interface TabakTuru {
  soru: Soru;
  sol: number;
  sag: number;
  /** büyük tabak hangi yanda: büyük tabakta hep az kurabiye var (boyut ile miktar karışmasın) */
  buyuk: 'sol' | 'sag';
}
/** a, b'ye göre */
export function kiyasla(a: number, b: number): Soru {
  return a > b ? 'cok' : a < b ? 'az' : 'esit';
}
/** Sorunun doğru cevabı: hangi tabak (ya da "Eşit!") */
export function dogruTaraf(t: Pick<TabakTuru, 'soru' | 'sol' | 'sag'>): Taraf {
  if (t.sol === t.sag) return 'esit';
  if (t.soru === 'az') return t.sol < t.sag ? 'sol' : 'sag';
  return t.sol > t.sag ? 'sol' : 'sag';
}
/** Üç tur: çok, az, eşit. Eşit olmayan turlarda büyük tabak azdır (Kino'nun tuzağı). */
export function tabakTurlari(yas: number, rnd: Rnd): TabakTuru[] {
  const ust = enBuyuk(yas);
  const fark = yas <= 4 ? 2 : 1;
  const cift = (): [number, number] => {
    const az = tamsayi(rnd, 1, ust - fark);
    return [az, tamsayi(rnd, az + fark, ust)];
  };
  return (['cok', 'az', 'esit'] as Soru[]).map((soru) => {
    const buyuk: 'sol' | 'sag' = rnd() < 0.5 ? 'sol' : 'sag';
    if (soru === 'esit') {
      const n = tamsayi(rnd, 2, Math.min(ust, 6));
      return { soru, sol: n, sag: n, buyuk };
    }
    const [az, cok] = cift();
    return buyuk === 'sol' ? { soru, sol: az, sag: cok, buyuk } : { soru, sol: cok, sag: az, buyuk };
  });
}

// ---------------------------------------------------------------- Etkinlik 5: Bir fazla, bir eksik
export interface TrenTuru {
  tur: 'fazla' | 'eksik';
  bas: number;
}
export const trenSonucu = (t: TrenTuru) => (t.tur === 'fazla' ? t.bas + 1 : t.bas - 1);
/** 3-4 yaş yalnız "bir fazla" (1-5); 5-6 yaş ikisi (vagonlar ekrana sığsın diye en çok 8) */
export function trenTurlari(yas: number, rnd: Rnd): TrenTuru[] {
  if (yas <= 4) return [{ tur: 'fazla', bas: tamsayi(rnd, 1, 3) }, { tur: 'fazla', bas: tamsayi(rnd, 2, 4) }];
  return [
    { tur: 'fazla', bas: tamsayi(rnd, 3, 7) },
    { tur: 'eksik', bas: tamsayi(rnd, 4, 8) },
  ];
}

// ---------------------------------------------------------------- Etkinlik 6: Sayı merdiveni
export interface MerdivenTuru {
  /** basamak sayısı (1..n) */
  n: number;
  /** düşen (eksik) rakamlar, küçükten büyüğe */
  eksik: number[];
}
/** 3-4 yaş 1-5 (1 eksik), 5-6 yaş 1-10 (2-3 eksik); 2 tur */
export function merdivenTurlari(yas: number, rnd: Rnd): MerdivenTuru[] {
  const n = enBuyuk(yas);
  const tur = (adet: number): MerdivenTuru => ({ n, eksik: karistir(Array.from({ length: n }, (_, i) => i + 1), rnd).slice(0, adet).sort((a, b) => a - b) });
  return yas <= 4 ? [tur(1), tur(2)] : [tur(2), tur(3)];
}
/** Rakam bu basamağa uyar mı */
export const basamakUyar = (rakam: number, basamak: number) => rakam === basamak;

// ---------------------------------------------------------------- Etkinlik 7: Kaç alkış?
export type AlkisDurumu = 'eksik' | 'tam' | 'fazla';
export const alkisDurumu = (hedef: number, sayi: number): AlkisDurumu => (sayi < hedef ? 'eksik' : sayi > hedef ? 'fazla' : 'tam');
/** Alkış hedefleri (2 tur): 3-4 yaş 1-5, 5-6 yaş 3-8 (on alkış küçük eller için çok uzun) */
export function alkisTurlari(yas: number, rnd: Rnd): number[] {
  return yas <= 4 ? [tamsayi(rnd, 2, 4), tamsayi(rnd, 3, 5)] : [tamsayi(rnd, 3, 6), tamsayi(rnd, 5, 8)];
}

// ---------------------------------------------------------------- Etkinlik 8: Rakamı çiz
/** Her oturumda 3 rakam: 3-4 yaş 1-5, 5-6 yaş 1-9. İlki (Kino'nun ters çizdiği) aynada farklı görünen bir rakam. */
export function cizimRakamlari(yas: number, rnd: Rnd): number[] {
  const ust = yas <= 4 ? 5 : 9;
  const hepsi = karistir(Array.from({ length: ust }, (_, i) => i + 1), rnd);
  const ilk = hepsi.find((n) => n !== 1 && n !== 8) ?? 3;
  return [ilk, ...hepsi.filter((n) => n !== ilk)].slice(0, 3);
}

// ---------------------------------------------------------------- Etkinlik 9: Kuşlar geldi! (5-6 yaş)
export interface KusTuru {
  tur: 'topla' | 'cikar';
  /** daldaki kuşlar */
  a: number;
  /** gelen ya da uçan */
  b: number;
}
export const kusSonucu = (t: KusTuru) => (t.tur === 'topla' ? t.a + t.b : t.a - t.b);
/**
 * 4 tur (topla, çıkar, topla, çıkar); sonuç 5'i geçmez, en az 1. İlk tur sabit 2 + 1 (Kino kelebeği de sayar:
 * "Bir, iki, üç, dört!").
 */
export function kusTurlari(rnd: Rnd): KusTuru[] {
  const topla = (): KusTuru => {
    const b = tamsayi(rnd, 1, 2);
    return { tur: 'topla', a: tamsayi(rnd, 1, 5 - b), b };
  };
  const cikar = (): KusTuru => {
    const b = tamsayi(rnd, 1, 2);
    return { tur: 'cikar', a: tamsayi(rnd, b + 1, 5), b };
  };
  return [{ tur: 'topla', a: 2, b: 1 }, cikar(), topla(), cikar()];
}

// ---------------------------------------------------------------- Etkinlik 10: Piknik!
export interface PiknikPlani {
  /** misafirler (sırayla) */
  misafirler: string[];
  /** masada fazladan tabak (birebir eşleme: hepsi kullanılmaz) */
  tabak: number;
  /** herkese 2 elma (yalnız 5-6 yaş) */
  elma: boolean;
  /** "Kim çok aldı?": Kino ile ayının kurabiyeleri */
  kurabiye: { kino: number; ayi: number };
}
export const MISAFIRLER = ['tavsan', 'ayi', 'ordek', 'maymun'] as const;
export function piknikPlani(yas: number, rnd: Rnd): PiknikPlani {
  const n = yas <= 4 ? 3 : 4;
  const az = tamsayi(rnd, 1, 2);
  const cok = tamsayi(rnd, az + 2, Math.min(enBuyuk(yas), az + 4));
  const kinoCok = rnd() < 0.5;
  return { misafirler: MISAFIRLER.slice(0, n), tabak: n + 2, elma: islemVar(yas), kurabiye: kinoCok ? { kino: cok, ayi: az } : { kino: az, ayi: cok } };
}
/** Tabağa elma konabilir mi (herkese iki) */
export const elmaSigar = (tabaktaki: number) => tabaktaki < 2;

// ---------------------------------------------------------------- Cümleler
const topla = (v: unknown): string[] => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(topla) : v && typeof v === 'object' ? Object.values(v).flatMap(topla) : []);

/** Anlatıcı sesiyle seslendirilecek bütün cümleler (Mino, tavşan, kalıplar 1-10 ile açılmış, rakam canlanmaları) */
export function okulCumleleri(): string[] {
  const c = [...topla(O.mino), ...topla(O.tavsan), ...topla(O.canlan), ...Array.from({ length: 10 }, (_, i) => sayiSozu(i + 1))];
  for (const k of Object.values(O.kalip)) for (let n = 1; n <= 10; n++) c.push(kalipDoldur(k, n));
  return [...new Set(c)];
}
/** Kino'nun kendi sesiyle seslendirilecek cümleler */
export function okulKinoCumleleri(): string[] {
  return [...new Set(topla(O.kino))];
}
