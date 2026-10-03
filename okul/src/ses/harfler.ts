/**
 * Ses Kulesi (Ünite 1) mantığı: harf tablosu, kelimeler, tur üreticileri, seslendirme cümleleri. DOM yok
 * (tests/unit/okul-ses.test.ts denetler). İçerik content/okul-ses.json'da; harfler Maarif 1. sınıf ses sırasıyla
 * (A N E T İ L), harfin adı değil SESİ söylenir.
 */
import S from '../../../content/okul-ses.json';
import O from '../../../content/okul.json';
import { karistir, type Rnd } from '../sayi';

export interface Harf {
  /** oda kimliği eki: 'a' → etkinlik 'ses-a' (İ → 'i') */
  id: string;
  buyuk: string;
  kucuk: string;
  /** Mino'nun söylediği SES (harfin adı değil): "Aaa!", "Tı!" */
  ses: string;
  renk: string;
  /** Kino harfi nasıl yanlış çizer: aynada (И, Ǝ) ya da baş aşağı (∀, ⊥) */
  kino: 'ayna' | 'ters';
  /** Sesin odasındaki iki resim */
  oda: string[];
  /** bu sesle başlayan kelimeler (ilk ses avı, sesli kutu) */
  kelimeler: string[];
}

export const HARFLER: Harf[] = S.harfler as Harf[];
export const harf = (id: string) => HARFLER.find((h) => h.id === id);
/** Odanın etkinlik kimliği (erişim: 'okul/ses-a') */
export const odaId = (h: Harf) => `ses-${h.id}`;
export const odaHarfi = (etkinlikId: string) => harf(etkinlikId.replace(/^ses-/, ''));

export interface Kelime {
  ad: string;
  /** ilk sesi uzatılmış söyleyiş ("Aaarı!"); ilk sesi odanın sesi olmayanlarda düz ad ("Kedi!") */
  uzun: string;
}
export const KELIMELER = S.kelimeler as Record<string, Kelime>;
export const kelime = (k: string): Kelime => KELIMELER[k] ?? { ad: k, uzun: `${k}!` };

/** Kelimenin ilk harfi (Türkçe büyük harf: i → İ, ı → I) */
export const ilkHarf = (k: string) => kelime(k).ad.charAt(0).toLocaleUpperCase('tr');
/** Kelime bu harfin sesiyle mi başlıyor */
export const sesleBaslar = (k: string, h: Harf) => ilkHarf(k) === h.buyuk;

/**
 * Depoda hazır çizimi olan kelimeler (assets/<yol>.webp). Olmayanlar assets/okul/ses/<kelime>.webp yuvasından gelir
 * (Gemini listesi: ORTAK_NOTLAR.md → "Gemini – Ses Kulesi"); o da yoksa yumuşak yer tutucu kart.
 */
export const HAZIR_RESIM: Record<string, string> = {
  ari: 'hayvanlar/ari',
  ayi: 'hayvanlar/ayi',
  araba: 'tasitlar/araba',
  armut: 'meyveler/armut',
  aslan: 'hayvanlar/aslan',
  ananas: 'meyveler/ananas',
  nar: 'meyveler/nar',
  elma: 'meyveler/elma',
  ev: 'canlan/ev',
  top: 'renkler/top',
  tavsan: 'hayvanlar/tavsan',
  tren: 'tasitlar/tren',
  tavuk: 'hayvanlar/tavuk',
  traktor: 'tasitlar/traktor',
  inek: 'hayvanlar/inek',
  itfaiye: 'tasitlar/itfaiye',
  limon: 'meyveler/limon',
  lamba: 'dedektif/lamba-dik',
  kedi: 'hayvanlar/kedi',
  balik: 'hayvanlar/balik',
  muz: 'meyveler/muz',
  fil: 'hayvanlar/fil',
  gemi: 'tasitlar/gemi',
  ucak: 'tasitlar/ucak',
  cilek: 'meyveler/cilek',
  kopek: 'hayvanlar/kopek',
  kus: 'hayvanlar/kus',
  uzum: 'meyveler/uzum',
  kiraz: 'meyveler/kiraz',
  balon: 'renkler/balon',
  gunes: 'renkler/gunes',
  yildiz: 'canlan/yildiz',
  roket: 'tasitlar/roket',
  zurafa: 'hayvanlar/zurafa',
  ordek: 'hayvanlar/ordek',
  maymun: 'hayvanlar/maymun',
};
/** Gemini'nin çizeceği kelimeler (hazır çizimi olmayanlar): assets/okul/ses/<kelime>.webp */
export const CIZILECEK = () => [...new Set(HARFLER.flatMap((h) => h.kelimeler))].filter((k) => !HAZIR_RESIM[k]);

/**
 * Bu odada çeldirici olabilecek kelimeler: başka odaların kelimeleri + genel çeldiriciler; ilk sesi farklı ve hazır
 * çizimi olanlar (yer tutucu kartın üstündeki harf cevabı ele vermesin).
 */
export function celdiriciler(h: Harf): string[] {
  const hepsi = [...HARFLER.filter((x) => x !== h).flatMap((x) => x.kelimeler), ...(S.celdiriciler as string[])];
  return [...new Set(hepsi)].filter((k) => !sesleBaslar(k, h) && !!HAZIR_RESIM[k]);
}

// ---------------------------------------------------------------- İlk ses avı
export interface AvTuru {
  dogru: string;
  secenekler: string[];
}
/** 3 tur: her turda 1 doğru (odanın kelimeleri sırayla, karışık) + 2 çeldirici; seçenekler karışık */
export function avTurlari(h: Harf, rnd: Rnd, adet = 3): AvTuru[] {
  const dogrular = karistir(h.kelimeler, rnd);
  const cel = karistir(celdiriciler(h), rnd);
  return Array.from({ length: adet }, (_, i) => {
    const dogru = dogrular[i % dogrular.length];
    const yanlis = [cel[(i * 2) % cel.length], cel[(i * 2 + 1) % cel.length]];
    return { dogru, secenekler: karistir([dogru, ...yanlis], rnd) };
  });
}

// ---------------------------------------------------------------- Hangisi farklı?
/** Şekli benzeyen (karışabilen) harfler: farklı olan bunlardan seçilir */
export const BENZER: Record<string, [string[], string[]]> = {
  a: [['N', 'V', 'H'], ['e', 'o', 'u']],
  n: [['M', 'H', 'Z'], ['m', 'u', 'h']],
  e: [['F', 'B', 'L'], ['a', 'o', 'c']],
  t: [['İ', 'L', 'Y'], ['f', 'l', 'i']],
  i: [['L', 'T', 'J'], ['l', 'j', 't']],
  l: [['T', 'İ', 'E'], ['i', 't', 'b']],
};
export interface FarkliTuru {
  harfler: string[];
  /** farklı olanın sırası */
  farkli: number;
}
/** 2 tur: büyük harfler (A A A N), sonra küçükler (a a a e) */
export function farkliTurlari(h: Harf, rnd: Rnd): FarkliTuru[] {
  const [buyukler, kucukler] = BENZER[h.id] ?? [['O'], ['o']];
  return [
    [h.buyuk, buyukler],
    [h.kucuk, kucukler],
  ].map(([ayni, benzer]) => {
    const b = benzer as string[];
    const f = b[Math.floor(rnd() * b.length)];
    const farkli = Math.floor(rnd() * 4);
    return { harfler: Array.from({ length: 4 }, (_, i) => (i === farkli ? f : (ayni as string))), farkli };
  });
}

// ---------------------------------------------------------------- Sesli kutu
export interface KutuTuru {
  /** bu sesle başlayanlar (ses sepetine) */
  dogrular: string[];
  /** ötekiler (öbür sepete) */
  digerleri: string[];
  /** tepsideki karışık sıra */
  hepsi: string[];
}
/** 3 doğru + 2 öteki */
export function kutuTuru(h: Harf, rnd: Rnd, dogruAdet = 3, digerAdet = 2): KutuTuru {
  const dogrular = karistir(h.kelimeler, rnd).slice(0, dogruAdet);
  const digerleri = karistir(celdiriciler(h), rnd).slice(0, digerAdet);
  return { dogrular, digerleri, hepsi: karistir([...dogrular, ...digerleri], rnd) };
}

// ---------------------------------------------------------------- oda içi sıra
/** Bir odanın etkinlikleri (sırayla; her biri bir tur noktası) */
export const ODA_ADIMLARI = ['tanis', 'av', 'izle', 'farkli', 'kutu'] as const;
export type OdaAdimi = (typeof ODA_ADIMLARI)[number];

/** Oda açık mı: ilk oda hep, ötekiler bir öncekisi bitince (Maarif sırası) */
export function odaAcik(i: number, biten: string[]): boolean {
  return i === 0 || biten.includes(odaId(HARFLER[i - 1]));
}

// ---------------------------------------------------------------- Cümleler
const topla = (v: unknown): string[] => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(topla) : v && typeof v === 'object' ? Object.values(v).flatMap(topla) : []);

/** "Bu odanın sesi: Aaa!" gibi birleşik cümleler (oyun önce bütününü, yoksa parçalarını çalar) */
export const odaSesiSozu = (h: Harf) => [S.mino.oda_sesi, h.ses];
export const avSozu = (h: Harf) => [h.ses, S.mino.avi];

/** Anlatıcı sesiyle seslendirilecek bütün Ses Kulesi cümleleri: Mino, harf sesleri, kelimeler (uzatılmış), birleşikler */
export function sesKulesiCumleleri(): string[] {
  const c = [...topla(S.mino)];
  for (const h of HARFLER) {
    c.push(h.ses, odaSesiSozu(h).join(' '), avSozu(h).join(' '));
  }
  for (const k of Object.values(KELIMELER)) c.push(k.uzun);
  return [...new Set(c.map((t) => t.replace(/\s+/g, ' ').trim()))];
}
/** Kino'nun kendi sesiyle seslendirilecek cümleler */
export function sesKulesiKinoCumleleri(): string[] {
  return [...new Set(topla(S.kino))];
}

/** Ortak (okul.json) cümleler: yeni kayıt istemez */
export const ORTAK = { ovgu: O.mino.ovgu, tekrar: O.mino.tekrar, ters: O.mino.rakam_ciz.ters, kinoCiz: O.kino.ciz, yakinda: O.mino.yakinda, kinoTekrar: O.kino.tekrar };
export { S as SES_ICERIK };
