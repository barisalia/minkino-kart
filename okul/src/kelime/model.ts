/**
 * Okula Hazırım! · Ünite 3 "Kelime Köprüsü" mantığı (DOM yok; tests/unit/okul-kelime.test.ts denetler).
 *
 * Kelimeler önce depodaki hazır görsellerden seçildi (Kartlar'ın hayvan, meyve, taşıt, renk resimleri; film eşyaları).
 * Görseli olmayan kelimenin yuvası assets/okul/kelime/<ad>.webp (Gemini listesi: GEMINI_KELIME). Görseli henüz
 * gelmemiş kelime turlara girmez (hazir()); dosya gelince kendiliğinden oyuna girer.
 */
import K from '../../../content/okul-kelime.json';
import { hecele } from '../../../ses-testi/src/analiz';
import { buyukHarfBas } from '../../../src/audio/metin';
import { karistir, sayiSozu, type Rnd } from '../sayi';

export type Kategori = 'meyve' | 'hayvan' | 'tasit';

export interface Kelime {
  id: string;
  /** söylenen ve yazan ad ("Kedi") */
  ad: string;
  /** görsel: assets/ altında yol, uzantısız ('hayvanlar/kedi'); 'okul/kelime/<id>' = Gemini yuvası */
  resim: string;
  kategori?: Kategori;
}

const KL = K.kelimeler as Record<string, string>;
const tablo: [string, string, string, Kategori?][] = [
  // hayvanlar (Kartlar)
  ['kedi', 'Kedi', 'hayvanlar/kedi', 'hayvan'],
  ['kopek', 'Köpek', 'hayvanlar/kopek', 'hayvan'],
  ['ordek', 'Ördek', 'hayvanlar/ordek', 'hayvan'],
  ['balik', 'Balık', 'hayvanlar/balik', 'hayvan'],
  ['fil', 'Fil', 'hayvanlar/fil', 'hayvan'],
  ['tavsan', 'Tavşan', 'hayvanlar/tavsan', 'hayvan'],
  ['kus', 'Kuş', 'hayvanlar/kus', 'hayvan'],
  ['zurafa', 'Zürafa', 'hayvanlar/zurafa', 'hayvan'],
  ['kelebek', 'Kelebek', 'hayvanlar/kelebek', 'hayvan'],
  ['penguen', 'Penguen', 'hayvanlar/penguen', 'hayvan'],
  ['maymun', 'Maymun', 'hayvanlar/maymun', 'hayvan'],
  ['inek', 'İnek', 'hayvanlar/inek', 'hayvan'],
  ['ayi', 'Ayı', 'hayvanlar/ayi', 'hayvan'],
  ['civciv', 'Civciv', 'hayvanlar/civciv', 'hayvan'],
  ['aslan', 'Aslan', 'hayvanlar/aslan', 'hayvan'],
  // meyveler (Kartlar)
  ['elma', 'Elma', 'meyveler/elma', 'meyve'],
  ['muz', 'Muz', 'meyveler/muz', 'meyve'],
  ['cilek', 'Çilek', 'meyveler/cilek', 'meyve'],
  ['karpuz', 'Karpuz', 'meyveler/karpuz', 'meyve'],
  ['armut', 'Armut', 'meyveler/armut', 'meyve'],
  ['uzum', 'Üzüm', 'meyveler/uzum', 'meyve'],
  ['portakal', 'Portakal', 'meyveler/portakal', 'meyve'],
  ['limon', 'Limon', 'meyveler/limon', 'meyve'],
  ['nar', 'Nar', 'meyveler/nar', 'meyve'],
  ['ananas', 'Ananas', 'meyveler/ananas', 'meyve'],
  ['kiraz', 'Kiraz', 'meyveler/kiraz', 'meyve'],
  // sebze (kategori dışı)
  ['havuc', 'Havuç', 'meyveler/havuc'],
  ['salatalik', 'Salatalık', 'meyveler/salatalik'],
  // taşıtlar (Kartlar)
  ['araba', 'Araba', 'tasitlar/araba', 'tasit'],
  ['otobus', 'Otobüs', 'tasitlar/otobus', 'tasit'],
  ['tren', 'Tren', 'tasitlar/tren', 'tasit'],
  ['ucak', 'Uçak', 'tasitlar/ucak', 'tasit'],
  ['gemi', 'Gemi', 'tasitlar/gemi', 'tasit'],
  ['bisiklet', 'Bisiklet', 'tasitlar/bisiklet', 'tasit'],
  ['helikopter', 'Helikopter', 'tasitlar/helikopter', 'tasit'],
  ['traktor', 'Traktör', 'tasitlar/traktor', 'tasit'],
  ['kamyon', 'Kamyon', 'tasitlar/kamyon', 'tasit'],
  ['roket', 'Roket', 'tasitlar/roket', 'tasit'],
  ['motosiklet', 'Motosiklet', 'tasitlar/motosiklet', 'tasit'],
  // eşyalar (Kartlar'ın renk resimleri, film eşyaları)
  ['top', 'Top', 'renkler/top'],
  ['balon', 'Balon', 'renkler/balon'],
  ['semsiye', 'Şemsiye', 'renkler/semsiye'],
  ['gunes', 'Güneş', 'renkler/gunes'],
  ['dondurma', 'Dondurma', 'renkler/dondurma'],
  ['corba', 'Çorba', 'renkler/corba'],
  ['hediye', 'Hediye Kutusu', 'renkler/hediye'],
  ['kitap', KL.kitap, 'film/esya/kitap'],
  ['bulut', KL.bulut, 'film/esya/bulut'],
  ['cizme', KL.cizme, 'film/esya/yagmur-botu'],
  ['kova', KL.kova, 'film/esya/kova'],
  ['havlu', KL.havlu, 'banyo/havlu-mavi'],
  ['sepet', KL.sepet, 'pazar/sepet'],
  // Gemini yuvaları (görsel gelene kadar turlara girmez)
  ['kemik', KL.kemik, 'okul/kelime/kemik'],
];

export const KELIMELER: Record<string, Kelime> = Object.fromEntries(tablo.map(([id, ad, resim, kategori]) => [id, { id, ad, resim, kategori }]));
export const kelime = (id: string): Kelime => KELIMELER[id] ?? { id, ad: id, resim: `okul/kelime/${id}` };
/** Kelimenin söylenişi: "Kedi!" (Kartlar'ın kaydıyla aynı metin) */
export const kelimeSozu = (id: string) => `${kelime(id).ad}!`;

/** Görsel var mı (tarayıcıda resim.ts'in glob'u; testte her şey var sayılabilir) */
export type Hazir = (resim: string) => boolean;
export const hepsiHazir: Hazir = () => true;
/** Gemini'den beklenen görseller (assets/okul/kelime/<ad>.webp; tek nesne, beyaz zemin, Mino stili) */
export const GEMINI_KELIME: Record<string, string> = {
  kemik: 'köpek kemiği (klasik iki ucu yumru kemik), krem beyazı',
  'havlu-islak': 'ıslak, sarkık mavi havlu; ucundan su damlaları damlıyor (banyo/havlu-mavi ile aynı havlu)',
  'rozet-kelime': '“Kelime Ustası” rozeti: altın madalya, iki mavi kurdele, ortada resimli taşlı küçük köprü',
};

const sec = <T>(dizi: T[], rnd: Rnd): T => dizi[Math.floor(rnd() * dizi.length)];

// ---------------------------------------------------------------- 1 · Dinle, bul
/** Dinle, bul: tek turun hedefi ve seçenekleri (hedef dahil, karışık) */
export interface DinleTuru {
  hedef: string;
  secenekler: string[];
}
const DINLE_HAVUZU = ['kedi', 'kopek', 'ordek', 'balik', 'fil', 'tavsan', 'zurafa', 'elma', 'muz', 'cilek', 'karpuz', 'araba', 'tren', 'ucak', 'gemi', 'top', 'balon', 'semsiye', 'gunes', 'dondurma', 'kitap', 'bulut'];
/**
 * 4 tur. İlk tur Kino'nun: hedef kedi, seçeneklerde köpek var (Kino köpeği gösterir: "Kedi! İşte burada!").
 * 3-4 yaş 3 resim, 5-6 yaş 4 resim.
 */
export function dinleTurlari(yas: number, rnd: Rnd, hazir: Hazir = hepsiHazir): DinleTuru[] {
  const adet = yas <= 4 ? 3 : 4;
  const havuz = DINLE_HAVUZU.filter((id) => hazir(kelime(id).resim));
  const turlar: DinleTuru[] = [];
  const kullanilan = new Set<string>(['kedi', 'kopek']);
  const tur = (hedef: string, zorunlu: string[] = []): DinleTuru => {
    const digerleri = karistir(
      havuz.filter((id) => id !== hedef && !zorunlu.includes(id)),
      rnd,
    ).slice(0, adet - 1 - zorunlu.length);
    return { hedef, secenekler: karistir([hedef, ...zorunlu, ...digerleri], rnd) };
  };
  turlar.push(tur('kedi', ['kopek']));
  const hedefler = karistir(
    havuz.filter((id) => !kullanilan.has(id)),
    rnd,
  ).slice(0, 3);
  for (const h of hedefler) turlar.push(tur(h));
  return turlar;
}

// ---------------------------------------------------------------- 2 · Alkışla hecele
/** Kelimenin heceleri (Türkçe hece kuralı, ses-testi hecele) */
export const heceler = (id: string) => hecele(kelime(id).ad);
/** Hecenin söylenişi: "Kar!" */
export const heceSozu = (hece: string) => `${buyukHarfBas(hece)}!`;
/** Hece sayısına göre kelimeler (hepsinin görseli var; "ğ" ile başlayan hece yok: tek başına okunuşu zor) */
export const HECE_KELIMELERI: Record<1 | 2 | 3 | 4, string[]> = {
  1: ['top', 'muz', 'fil', 'nar'],
  2: ['kedi', 'elma', 'balik', 'tavsan', 'ordek', 'ucak', 'gemi', 'limon'],
  3: ['araba', 'zurafa', 'kelebek', 'portakal', 'ananas', 'penguen', 'otobus'],
  4: ['helikopter', 'salatalik', 'motosiklet'],
};
/** Kino'nun turu: "Karpuz"a beş kere vurur; Mino: "Kar-puz. İki!" */
export const KINO_HECE = 'karpuz';
/** 3 kelime: ilk Kino'nun karpuzu; 3-4 yaş sonra 1 ve 3 heceli, 5-6 yaş 3 ve 4 heceli */
export function heceTurlari(yas: number, rnd: Rnd): string[] {
  const [a, b] = yas <= 4 ? ([1, 3] as const) : ([3, 4] as const);
  return [KINO_HECE, sec(HECE_KELIMELERI[a], rnd), sec(HECE_KELIMELERI[b], rnd)];
}
export type HeceDurumu = 'eksik' | 'tam' | 'fazla';
export const heceDurumu = (hedef: number, vurus: number): HeceDurumu => (vurus < hedef ? 'eksik' : vurus > hedef ? 'fazla' : 'tam');

// ---------------------------------------------------------------- 3 · Tersi ne?
export type TersId = 'acik' | 'buyuk' | 'sicak' | 'uzun' | 'dolu' | 'kuru';
export interface TersCift {
  id: TersId;
  /** doğru durum (Mino ister) ve Kino'nun yaptığı ters durum */
  a: string;
  b: string;
  /** turun oynanması için gereken görseller */
  gerek: string[];
}
/** Belgedeki altı zıt çift: açık-kapalı, büyük-küçük, sıcak-soğuk, uzun-kısa, dolu-boş, ıslak-kuru */
export const TERS_CIFTLER: TersCift[] = [
  { id: 'acik', a: 'açık', b: 'kapalı', gerek: ['ege/perde-acik', 'ege/perde-kapali'] },
  { id: 'buyuk', a: 'büyük', b: 'küçük', gerek: ['renkler/top'] },
  { id: 'sicak', a: 'sıcak', b: 'soğuk', gerek: ['renkler/corba', 'renkler/dondurma'] },
  { id: 'uzun', a: 'uzun', b: 'kısa', gerek: ['tasitlar/tren', 'okul/vagon'] },
  { id: 'dolu', a: 'dolu', b: 'boş', gerek: ['pazar/sepet', 'meyveler/elma'] },
  { id: 'kuru', a: 'kuru', b: 'ıslak', gerek: ['banyo/havlu-mavi', 'okul/kelime/havlu-islak'] },
];
/** Görseli hazır çiftlerden 4 tur (karışık); 5-6 yaş 5 tur */
export function tersTurlari(yas: number, rnd: Rnd, hazir: Hazir = hepsiHazir): TersCift[] {
  const oynanir = TERS_CIFTLER.filter((c) => c.gerek.every(hazir));
  return karistir(oynanir, rnd).slice(0, yas <= 4 ? 4 : 5);
}

// ---------------------------------------------------------------- 4 · Boya kovası
export interface Renk {
  id: string;
  /** Kartlar'daki adı (kaydı var: "Kırmızı!") */
  ad: string;
  deger: string;
}
export const RENKLER: Renk[] = [
  { id: 'kirmizi', ad: 'Kırmızı', deger: '#F0413F' },
  { id: 'mavi', ad: 'Mavi', deger: '#3E9DF2' },
  { id: 'sari', ad: 'Sarı', deger: '#FFC72C' },
  { id: 'yesil', ad: 'Yeşil', deger: '#5DBE3F' },
  { id: 'turuncu', ad: 'Turuncu', deger: '#FF8A2B' },
  { id: 'mor', ad: 'Mor', deger: '#9B5CE0' },
  { id: 'pembe', ad: 'Pembe', deger: '#FF7EB6' },
];
export const renk = (id: string) => RENKLER.find((r) => r.id === id) ?? RENKLER[0];
export const renkSozu = (id: string) => `${renk(id).ad}!`;
/** Boyanacak nesneler (boyanınca bütünü o renge döner) */
export const BOYA_NESNELERI = ['balon', 'semsiye', 'hediye', 'araba', 'dondurma'];
export interface BoyaTuru {
  nesne: string;
  renk: string;
  /** kovalar (renk kimlikleri, karışık; hedef dahil) */
  kovalar: string[];
}
/**
 * 4 tur: her turda başka nesne, başka hedef renk. 3-4 yaş ilk dört temel renkten 3 kova, 5-6 yaş yedi renkten 4 kova.
 * İlk tur Kino'nun: mavi kova var ve hedef mavi değil (Kino mavi kovaya atlar).
 */
export function boyaTurlari(yas: number, rnd: Rnd): BoyaTuru[] {
  const kucuk = yas <= 4;
  const palet = (kucuk ? RENKLER.slice(0, 4) : RENKLER).map((r) => r.id);
  const adet = kucuk ? 3 : 4;
  const nesneler = karistir(BOYA_NESNELERI, rnd).slice(0, 4);
  const hedefler = karistir(palet.filter((r) => r !== 'mavi'), rnd);
  // ilk tur mavi olmayan bir renk; sonrakiler kalanlardan (mavi de olabilir)
  const sira = [hedefler[0], ...karistir([...hedefler.slice(1), 'mavi'], rnd)];
  return nesneler.map((nesne, i) => {
    const hedef = sira[i % sira.length];
    const zorunlu = i === 0 ? ['mavi'] : [];
    const digerleri = karistir(
      palet.filter((r) => r !== hedef && !zorunlu.includes(r)),
      rnd,
    ).slice(0, adet - 1 - zorunlu.length);
    return { nesne, renk: hedef, kovalar: karistir([hedef, ...zorunlu, ...digerleri], rnd) };
  });
}

// ---------------------------------------------------------------- 5 · Hangi grup?
export const KATEGORILER: Kategori[] = ['meyve', 'hayvan', 'tasit'];
/** Sepetin üstündeki simge resmi (o grubun en tanıdık üyesi; sıralanacaklar arasında yok) */
export const KATEGORI_SIMGE: Record<Kategori, string> = { meyve: 'uzum', hayvan: 'kedi', tasit: 'otobus' };
/** Kino'nun yanlış sepete koyduğu (taşıt sepetine balık) */
export const KINO_GRUP = 'balik';
const GRUP_HAVUZU: Record<Kategori, string[]> = {
  meyve: ['elma', 'muz', 'cilek', 'karpuz', 'armut', 'portakal', 'limon', 'kiraz'],
  hayvan: ['ordek', 'fil', 'tavsan', 'zurafa', 'penguen', 'maymun', 'inek', 'civciv'],
  tasit: ['araba', 'tren', 'ucak', 'gemi', 'bisiklet', 'helikopter', 'traktor', 'roket'],
};
/** Sıralanacak resimler (karışık): 3-4 yaş her gruptan 2, 5-6 yaş 3; hayvanlardan biri Kino'nun balığı */
export function grupResimleri(yas: number, rnd: Rnd): string[] {
  const n = yas <= 4 ? 2 : 3;
  const secilen = KATEGORILER.flatMap((k) => {
    const havuz = karistir(GRUP_HAVUZU[k], rnd).slice(0, k === 'hayvan' ? n - 1 : n);
    return k === 'hayvan' ? [KINO_GRUP, ...havuz] : havuz;
  });
  return karistir(secilen, rnd);
}
/** Resim bu sepete girer mi */
export const grubaUyar = (id: string, sepet: Kategori) => kelime(id).kategori === sepet;

// ---------------------------------------------------------------- 6 · Eksik kelime
export type CumleId = keyof typeof K.mino.eksik.cumleler;
export interface EksikTuru {
  cumle: CumleId;
  dogru: string;
  /** üç resim (karışık; doğru dahil) */
  secenekler: string[];
}
/** Cümlelerin seçenekleri: doğru + iki komik yanlış (Kino yanlışı dener: "Ihh! Lastik tadı var!") */
export const EKSIK_SECENEK: Record<CumleId, [string, string, string]> = {
  kemik: ['kemik', 'cizme', 'bulut'],
  elma: ['elma', 'cizme', 'bulut'],
  semsiye: ['semsiye', 'muz', 'top'],
  balon: ['balon', 'elma', 'kitap'],
  ucak: ['ucak', 'fil', 'araba'],
  havuc: ['havuc', 'tren', 'semsiye'],
};
/**
 * İlk cümle Kino'nun: "Kino bir … yedi." (kemik; kemiğin görseli gelene kadar elma). Sonra karışık cümleler:
 * 3-4 yaş 3, 5-6 yaş 4 cümle.
 */
export function eksikTurlari(yas: number, rnd: Rnd, hazir: Hazir = hepsiHazir): EksikTuru[] {
  const ilk: CumleId = hazir(kelime('kemik').resim) ? 'kemik' : 'elma';
  const digerleri = karistir(['semsiye', 'balon', 'ucak', 'havuc'] as CumleId[], rnd).slice(0, yas <= 4 ? 2 : 3);
  return [ilk, ...digerleri].map((c) => ({ cumle: c, dogru: EKSIK_SECENEK[c][0], secenekler: karistir([...EKSIK_SECENEK[c]], rnd) }));
}

// ---------------------------------------------------------------- Cümleler
const topla = (v: unknown): string[] => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(topla) : v && typeof v === 'object' ? Object.values(v).flatMap(topla) : []);

/** Söylenen bütün kelimeler ("Kedi!"; çoğu Kartlar'da var) */
export function kelimeSozleri(): string[] {
  const ids = new Set<string>([
    ...DINLE_HAVUZU,
    ...Object.values(EKSIK_SECENEK).flat(),
    ...Object.values(GRUP_HAVUZU).flat(),
    KINO_GRUP,
    ...Object.values(HECE_KELIMELERI).flat(),
    KINO_HECE,
  ]);
  return [...ids].map(kelimeSozu);
}
/** Söylenen bütün heceler ("Kar!", "Puz!") */
export function heceSozleri(): string[] {
  const ids = [KINO_HECE, ...Object.values(HECE_KELIMELERI).flat()];
  return [...new Set(ids.flatMap((id) => heceler(id).map(heceSozu)))];
}

/** Anlatıcı sesiyle seslendirilecek bütün cümleler (Mino, kelimeler, heceler, renkler, hece sayıları) */
export function kelimeCumleleri(): string[] {
  const c = [
    ...topla(K.mino),
    ...kelimeSozleri(),
    ...heceSozleri(),
    ...RENKLER.map((r) => renkSozu(r.id)),
    ...KATEGORILER.map((k) => `${KL[k]}!`),
    ...[1, 2, 3, 4].map(sayiSozu),
  ];
  return [...new Set(c)];
}
/** Kino'nun kendi sesiyle seslendirilecek cümleler */
export function kelimeKinoCumleleri(): string[] {
  return [...new Set(topla(K.kino))];
}
