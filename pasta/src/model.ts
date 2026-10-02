/**
 * Mino'nun Pasta Otobüsü: oyunun saf mantığı (DOM yok; birim testleri buradan sınar).
 * Tasarım: ekip/senaryo/pasta-otobusu.md (Barış onaylı, 2026-10-02).
 *
 * - Sipariş: bir ya da iki kalem (kurabiye / kapkek). Kurabiye: adet, şekil, krema rengi, süs ve kurabiye başına süs
 *   sayısı. Kapkek (Gün 3): krema yığını sayısı ve rengi, isteğe bağlı tek süs.
 * - Çocuğun yaptığı: bir "parti" (aynı kalıptan çıkmış 1-5 parça; her parçanın kreması, yığınları, süsleri).
 * - Karşılaştırma ret etmez: farklı olan şeyler listelenir (balonda ve tabakta bir an parlarlar).
 */
import P from '../../content/pasta.json';
import { buyukHarfBas, sayiAdi } from '../../src/audio/metin';

export type Sekil = 'yuvarlak' | 'yildiz' | 'kalp' | 'ay';
export type Kalip = Sekil | 'kapkek';
export type Urun = 'kurabiye' | 'kapkek';
export type Renk = 'pembe' | 'mavi' | 'sari' | 'mor';
export type Sus = 'cilek' | 'havuc' | 'bal' | 'muz' | 'cikolata';
export type Gun = 1 | 2 | 3;
export type Fark = 'urun' | 'adet' | 'sekil' | 'renk' | 'sus' | 'yigin';

/** Bir günde gelen müşteri */
export const MUSTERI_SAYISI = 6;
/** Aynı anda en çok bu kadar müşteri sırada */
export const EN_COK_MUSTERI = 3;
export const FIRIN_GOZ = 3;
/** Tepsiye en çok bu kadar hamur topu sığar */
export const EN_COK_HAMUR = 5;
/** Bir kurabiyenin üstüne en çok bu kadar süs sığar; fazlası kayıp düşer (Kino yakalar) */
export const EN_COK_SUS = 3;
/** Kapkeğin üstüne en çok bu kadar krema yığını sığar */
export const EN_COK_YIGIN = 3;

export const SEKILLER: Sekil[] = ['yuvarlak', 'yildiz', 'kalp', 'ay'];
export const RENKLER: Renk[] = ['pembe', 'mavi', 'sari', 'mor'];
export const SUSLER: Sus[] = ['cilek', 'havuc', 'bal', 'muz', 'cikolata'];

/** Krema renkleri (parlak, iştah açıcı) */
export const RENK_KODU: Record<Renk, string> = { pembe: '#FF8CC0', mavi: '#6CC4FF', sari: '#FFD84A', mor: '#B98BFF' };

export interface Kalem {
  urun: Urun;
  adet: number;
  /** kurabiyenin şekli (kapkekte null) */
  sekil: Sekil | null;
  renk: Renk;
  sus: Sus | null;
  /** parça başına süs sayısı */
  susAdet: number;
  /** kapkekte krema yığını sayısı (kurabiyede 0) */
  yigin: number;
}

export interface Siparis {
  musteri: string;
  kalemler: Kalem[];
  /** mantık siparişi (Gün 3): "Tavşanınkinden bir fazla çilek!" (balonda tavşanın kurabiyesi ve +1 çilek) */
  mantik?: { kaynak: string; kalem: Kalem; fazla: number };
}

/** Tepside / fırında / tabakta bir parça */
export interface Parca {
  /** kurabiyenin kreması (kapkekte yığınların rengi ayrı) */
  renk: Renk | null;
  yigin: Renk[];
  susler: Sus[];
}
/** Aynı kalıptan çıkan bir parti (fırının bir gözü, tabağın üstü) */
export interface Parti {
  urun: Urun;
  sekil: Sekil | null;
  parcalar: Parca[];
}

// ---------------------------------------------------------------- günler ve müşteriler
export interface GunAyari {
  yer: 'park' | 'okul';
  musteriler: string[];
  /** iki müşterinin gelişi arasındaki en kısa süre (ms) */
  aralik: number;
  /** sabır kalbinin dolma süresi (ms); dolunca müşteri uyuklar */
  sabir: number;
}
export const GUNLER: Record<Gun, GunAyari> = {
  1: { yer: 'park', musteriler: ['tavsan', 'ordek', 'can'], aralik: 14000, sabir: 55000 },
  2: { yer: 'park', musteriler: ['ayi', 'ada', 'elif'], aralik: 12000, sabir: 50000 },
  3: { yer: 'okul', musteriler: ['tavsan', 'ordek', 'can', 'ayi', 'ada', 'elif'], aralik: 11000, sabir: 50000 },
};
export const HAYVANLAR = ['tavsan', 'ordek', 'ayi'];
export const COCUK_MUSTERILER = ['can', 'ada', 'elif'];

/** Müşterinin sevdiği şey siparişine yansır: tavşan havuçlu, ayı ballı, ördek sarı kremalı */
export const SEVGI: Record<string, { renk?: Renk; sus?: Sus }> = { tavsan: { sus: 'havuc' }, ayi: { sus: 'bal' }, ordek: { renk: 'sari' } };

/** Açık olan (kullanılabilen) kalıplar, renkler, süsler */
export interface Acik {
  sekiller: Sekil[];
  renkler: Renk[];
  susler: Sus[];
  kapkek: boolean;
}

/**
 * Oynanan güne ve dükkândan alınanlara göre açık olanlar. Gün 2'den itibaren havuç dilimi ve bal damlası açılır,
 * Gün 3'te kapkek kalıbı gelir. Ay kalıbı, mor krema, muz ve çikolata dükkândan alınır.
 */
export function acikOlanlar(gun: number, alinan: readonly string[] = []): Acik {
  const al = (id: string) => alinan.includes(id);
  return {
    sekiller: ['yuvarlak', 'yildiz', 'kalp', ...(al('kalip-ay') ? (['ay'] as const) : [])],
    renkler: ['pembe', 'mavi', 'sari', ...(al('renk-mor') ? (['mor'] as const) : [])],
    susler: ['cilek', ...(gun >= 2 ? (['havuc', 'bal'] as const) : []), ...(al('sus-muz') ? (['muz'] as const) : []), ...(al('sus-cikolata') ? (['cikolata'] as const) : [])],
    kapkek: gun >= 3,
  };
}

type Rnd = () => number;
const sec = <T>(a: readonly T[], rnd: Rnd): T => a[Math.floor(rnd() * a.length) % a.length];
const arasi = (a: number, b: number, rnd: Rnd) => a + Math.floor(rnd() * (b - a + 1));

/** Bir kurabiye kalemi (günün kuralına göre) */
export function kurabiyeKalemi(gun: Gun, musteri: string, acik: Acik, rnd: Rnd = Math.random, susZorla?: Sus | null): Kalem {
  const sevgi = SEVGI[musteri] ?? {};
  const renk = sevgi.renk && acik.renkler.includes(sevgi.renk) ? sevgi.renk : sec(acik.renkler, rnd);
  const sekil = sec(acik.sekiller, rnd);
  if (gun === 1) return { urun: 'kurabiye', adet: 1, sekil, renk, sus: null, susAdet: 0, yigin: 0 };
  const adet = arasi(2, 3, rnd);
  const sus = susZorla !== undefined ? susZorla : sevgi.sus && acik.susler.includes(sevgi.sus) ? sevgi.sus : sec(acik.susler, rnd);
  // üç kurabiyede kurabiye başına en çok iki süs (toplam dokunuş 6'yı geçmesin)
  const susAdet = sus ? arasi(1, adet === 3 ? 2 : 3, rnd) : 0;
  return { urun: 'kurabiye', adet, sekil, renk, sus, susAdet, yigin: 0 };
}

/** Bir kapkek kalemi (Gün 3): 1 kapkek, 1-3 krema yığını, belki tek süs */
export function kapkekKalemi(musteri: string, acik: Acik, rnd: Rnd = Math.random): Kalem {
  const sevgi = SEVGI[musteri] ?? {};
  const renk = sevgi.renk && acik.renkler.includes(sevgi.renk) ? sevgi.renk : sec(acik.renkler, rnd);
  const sus = rnd() < 0.5 ? (sevgi.sus && acik.susler.includes(sevgi.sus) ? sevgi.sus : sec(acik.susler, rnd)) : null;
  return { urun: 'kapkek', adet: 1, sekil: null, renk, sus, susAdet: sus ? 1 : 0, yigin: arasi(1, EN_COK_YIGIN, rnd) };
}

/** Aynı karakter arka arkaya gelmesin diye karıştırır */
export function sirala(adlar: string[], rnd: Rnd = Math.random): string[] {
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
 * Gün 1: tek kurabiye, tek şekil, tek renk. Gün 2: 2-3 kurabiye, süs ve süs sayısı (1-3).
 * Gün 3 (okul önü): iki kapkek, bir ikili (kurabiye + kapkek), tavşanın çilekli kurabiyesi ve hemen ardından değil ama
 * sonra gelen ayının mantık siparişi ("tavşanınkinden bir fazla çilek"), bir de Gün 2 türü kurabiye.
 */
export function gunPlani(gun: Gun, acik: Acik, rnd: Rnd = Math.random): Siparis[] {
  const g = GUNLER[gun];
  if (gun !== 3) {
    const adlar = sirala([...g.musteriler, ...g.musteriler], rnd);
    return adlar.map((musteri) => ({ musteri, kalemler: [kurabiyeKalemi(gun, musteri, acik, rnd)] }));
  }
  // Gün 3: tavşan ayıdan önce gelir (ayı onun kurabiyesine bakar)
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

/** Sıradaki müşteri: kuyrukta, şu an tezgâhta olmayan ilk karakter (aynı karakter iki kez görünmesin) */
export function siradakiIndeks(kuyruk: readonly Siparis[], mevcut: readonly string[]): number {
  return kuyruk.findIndex((s) => !mevcut.includes(s.musteri));
}

// ---------------------------------------------------------------- karşılaştırma
/** Parçanın krema renkleri (kurabiye: kreması, kapkek: yığınları) */
const parcaRenkleri = (urun: Urun, p: Parca): (Renk | null)[] => (urun === 'kurabiye' ? [p.renk] : p.yigin.length ? p.yigin : [null]);

/** Bir kalem ile verilen parti arasındaki farklar (boşsa tam aynı) */
export function karsilastir(kalem: Kalem, parti: Parti | null | undefined): Fark[] {
  if (!parti || !parti.parcalar.length) return ['urun'];
  const f = new Set<Fark>();
  if (parti.urun !== kalem.urun) f.add('urun');
  if (parti.parcalar.length !== kalem.adet) f.add('adet');
  if (kalem.urun === 'kurabiye' && parti.urun === 'kurabiye' && parti.sekil !== kalem.sekil) f.add('sekil');
  for (const p of parti.parcalar) {
    if (parcaRenkleri(parti.urun, p).some((r) => r !== kalem.renk)) f.add('renk');
    if (kalem.urun === 'kapkek' && parti.urun === 'kapkek' && p.yigin.length !== kalem.yigin) f.add('yigin');
    if (p.susler.length !== kalem.susAdet || p.susler.some((s) => s !== kalem.sus)) f.add('sus');
  }
  const sira: Fark[] = ['urun', 'adet', 'sekil', 'renk', 'yigin', 'sus'];
  return sira.filter((x) => f.has(x));
}

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

/** Siparişin okunuşu (parçalı kayıt): {sayı} {şekil} kurabiye, {renk} kremalı, {süs}lü! */
export function okuma(sip: Siparis): string[] {
  if (sip.mantik) return [P.mino.mantik];
  return sip.kalemler.flatMap((k) => kalemOkumasi(k));
}
export function kalemOkumasi(k: Kalem): string[] {
  const sekil = P.parca.sekil[k.urun === 'kapkek' ? 'kapkek' : (k.sekil ?? 'yuvarlak')];
  const renk = (k.sus ? P.parca.renk_ara : P.parca.renk_son)[k.renk];
  return [sayiSozu(k.adet), sekil, renk, ...(k.sus ? [P.parca.sus[k.sus]] : [])];
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
