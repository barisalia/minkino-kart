/**
 * KIR VE ÇIRP · saf kurallar (DOM yok; tests/unit/restoran-mini-kir-cirp.test.ts). ekip/senaryo/RESTORAN.md §8 M5.
 *
 * Yumurta kâsenin kenarına iki kez vurulunca kırılır (Tava'nın kenar kuralı: restoran/src/mini/tava/mantik.ts);
 * çok hızlı vuruşta kabuk kâseye düşer ve kaygan bir av başlar (3-4'te ikinci, 5-6'da üçüncü dokunuşta yakalanır).
 * Çırpma: kâsenin içinde çizilen yol (daire de olur, yay da olur) karışmayı ilerletir; 3-4 yaşta üç tur, 5-6'da beş
 * tur pürüzsüz yapar. 5-6'da her kaşık un iki topak bırakır: tel üstünden geçince patlar. Çok hızlı çırpınca köpük
 * Mino'nun yüzüne sıçrar. Her dördüncü kaşık un büyük bir bulut kaldırır: Mino hapşırır.
 */
import type { Yas } from '../arayuz';

export interface CirpDurum {
  yumurta: number;
  /** süt miktarı (0-3; 1 = bir bardak) */
  sut: number;
  /** un kaşığı */
  un: number;
  /** şeker kaşığı */
  seker: number;
  /** 0-1 */
  karisim: number;
  /** kâsede kalan kabuk parçası */
  kabuk: number;
  /** patlamamış un topağı (5-6) */
  topak: number;
}
export const bosDurum = (): CirpDurum => ({ yumurta: 0, sut: 0, un: 0, seker: 0, karisim: 0, kabuk: 0, topak: 0 });

/** En çok kaç yumurta (§8 M5: 1-4) */
export const EN_COK_YUMURTA = 4;
/** Kaygan kabuk kaçıncı dokunuşta yakalanır */
export const KABUK_YAKALA = { kucuk: 2, buyuk: 3 } as const;
/** Pürüzsüz için gereken tur (yol = tur × çevre) */
export const TUR = { kucuk: 3, buyuk: 5 } as const;
/** Çırpma hızı (px/ms) bunu geçerse köpük Mino'ya sıçrar */
export const KOPUK_HIZ = { kucuk: 3.6, buyuk: 2.8 } as const;
/** Her kaşık unun topağı (yalnız 5-6) */
export const KASIK_TOPAK = { kucuk: 0, buyuk: 2 } as const;
/** Kaçıncı kaşıkta un bulutu kalkar (her n'de bir) */
export const BULUT_HER = 4;

/** Karıştırılacak bir şey var mı */
export const icerikVar = (d: CirpDurum) => d.yumurta > 0 || d.sut > 0 || d.un > 0 || d.seker > 0;

/**
 * Çırpma: kâsede alınan yol (px), kâse yarıçapı R (px). Yol 0.55 R yarıçaplı çemberin çevresiyle tura çevrilir.
 * Yeni malzeme eklenince karışma geri düşer (aşağıda: ekle()).
 */
export function cirp(k: number, yolPx: number, R: number, yas: Yas): number {
  const tur = yolPx / (2 * Math.PI * R * 0.55);
  const v = k + tur / TUR[yas];
  return v >= 0.999 ? 1 : v;
}

/** Yeni malzeme eklendi: karışma o malzemenin payı kadar geri düşer (üstte çırpılmamış katman) */
export function ekle(d: CirpDurum, ne: 'yumurta' | 'sut' | 'un' | 'seker', miktar: number, yas: Yas): CirpDurum {
  const once = toplam(d);
  const n = { ...d, [ne]: (d[ne] as number) + miktar };
  if (ne === 'un') n.topak += KASIK_TOPAK[yas] * miktar;
  const sonra = toplam(n);
  n.karisim = sonra > 0 ? (d.karisim * once) / sonra : 0;
  return n;
}
/** Kâsedeki toplam (yumurta 1, süt bardağı 1.5, kaşık 0.5) */
export const toplam = (d: CirpDurum) => d.yumurta + d.sut * 1.5 + (d.un + d.seker) * 0.5;

/**
 * Kâsedeki her katmanın (bir yumurta, süt göleti, bir kaşık un...) kendi karışması var: yeni eklenen katman
 * çırpılmamış durur, eskiler karışmış kalır. Bütün kâsenin karışması katmanların ağırlıklı ortalamasıdır (ekle() ile aynı sonuç).
 */
export interface Katman {
  tur: 'yumurta' | 'sut' | 'un' | 'seker';
  /** ağırlık: yumurta 1, süt bardağı 1.5, kaşık 0.5 */
  w: number;
  /** 0-1 */
  m: number;
}
export const AGIRLIK = { yumurta: 1, sut: 1.5, un: 0.5, seker: 0.5 } as const;
export function ortalamaKarisim(k: readonly Katman[]): number {
  const t = k.reduce((a, x) => a + x.w, 0);
  return t ? k.reduce((a, x) => a + x.w * x.m, 0) / t : 0;
}
/** Çırpma bütün katmanları aynı yol kadar karıştırır */
export function katmanlariCirp(k: Katman[], yolPx: number, R: number, yas: Yas) {
  for (const x of k) x.m = cirp(x.m, yolPx, R, yas);
}
/** Süt göletine süt eklenince o katman seyrelir (yeni süt çırpılmamış) */
export function katmanaEkle(x: Katman, w: number) {
  x.m = (x.m * x.w) / (x.w + w);
  x.w += w;
}

/** Vuruşun sertliği kabuğu kâseye düşürür mü (Tava'nın eşikleri: 3-4 hoşgörülü) */
export { SERT_VURUS, kenaraVurdu } from '../tava/mantik';

/** Bir dokunuş kabuğu yakaladı mı (n: kaçıncı dokunuş) */
export const kabukYakalandi = (n: number, yas: Yas) => n >= KABUK_YAKALA[yas];

/** Un bulutu: bu kaşıkla Mino hapşırır mı */
export const unBulutu = (unKasik: number) => unKasik > 0 && unKasik % BULUT_HER === 0;

/** Kıvam: hamur ne kadar koyu (un / sıvı) */
export function kivam(d: CirpDurum): 'yok' | 'sulu' | 'iyi' | 'koyu' {
  const sivi = d.yumurta + d.sut * 2;
  if (!d.un) return sivi ? 'sulu' : 'yok';
  const oran = d.un / Math.max(0.5, sivi);
  if (oran < 0.45) return 'sulu';
  if (oran > 1.6) return 'koyu';
  return 'iyi';
}

/** Doğal son: içinde yumurta ya da süt var, karıştı, topak kalmadı */
export const bitti = (d: CirpDurum) => (d.yumurta > 0 || d.sut > 0) && d.karisim >= 0.999 && d.topak === 0;

/** Ürün türü: unlu = pankek hamuru (Tava onu kepçeyle döker); yalnız süt (+şeker) = sütlaç karışımı; yoksa çırpılmış yumurta */
export function urunTuru(d: CirpDurum): { tur: string; yemek?: string } {
  if (d.un > 0) return { tur: 'hamur', yemek: 'pankek' };
  if (d.sut > 0 && !d.yumurta) return { tur: 'sut-karisimi', yemek: 'sutlac' };
  return { tur: 'cirpilmis-yumurta', yemek: 'menemen' };
}

// ------------------------------------------------------------------ renk

type Rgb = [number, number, number];
const hex = (h: string): Rgb => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const RENK: Record<'yumurta' | 'sut' | 'un' | 'seker', Rgb> = { yumurta: hex('#FFC23A'), sut: hex('#FFFFFF'), un: hex('#F6EEDD'), seker: hex('#FBF7EF') };
/** Kâsenin karışmış rengi (malzemelerin ağırlıklı ortalaması; yumurta ağır basar) */
export function karisikRenk(d: CirpDurum): string {
  const a = { yumurta: d.yumurta * 2.2, sut: d.sut * 1.4, un: d.un * 0.6, seker: d.seker * 0.25 };
  const t = a.yumurta + a.sut + a.un + a.seker;
  if (!t) return '#FFFFFF';
  const c: Rgb = [0, 0, 0];
  for (const k of Object.keys(a) as (keyof typeof a)[]) for (let i = 0; i < 3; i++) c[i] += (RENK[k][i] * a[k]) / t;
  // krema tonu: çok hafif sıcaklaştır
  return '#' + c.map((v, i) => Math.round(Math.min(255, v * (i === 2 ? 0.93 : 1))).toString(16).padStart(2, '0')).join('');
}
