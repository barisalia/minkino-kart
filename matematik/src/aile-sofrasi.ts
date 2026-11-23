// Matematik · "Kino Ailesinin Sofrası" (Ölçü tezgâhı; yönetici, 22 Kasım: 2–3 yaş yolunda içeriği en az olan yer):
// büyüklüğe göre eşleme ve sıralama. Baba, Anne ve Kino sofrada; çocuk kâse, bardak ve kaşıkları herkese kendi boyunda
// dağıtır. 2–3 yaşta yalnız Baba ve Kino (büyük, küçük); 4 ve 5+ yaşta üç boy (büyük, orta, küçük); 5+ yaşta üç takım.
// DOM'suz kurallar. Çizimler: Astra Paket M35 (CLAUDE-ASTRA-MESAJLAR.md 22 Kasım). Sahne main.ts → kinoAileSofrasi.
import type { Yol } from './tur-sirasi';
import { gelisSorusu, type Havuzlar } from './derinlik';

export type Esya = 'kase' | 'bardak' | 'kasik';
export type Boy = 'buyuk' | 'orta' | 'kucuk';
export type Kisi = 'baba' | 'anne' | 'kino';
export const KISI_BOYU: Record<Kisi, Boy> = { baba: 'buyuk', anne: 'orta', kino: 'kucuk' };
export const KISI_ADI: Record<Kisi, string> = { baba: 'Baba', anne: 'Anne', kino: 'Kino' };
export const ESYA_ADI: Record<Esya, string> = { kase: 'Kâse', bardak: 'Bardak', kasik: 'Kaşık' };
export const BOY_ADI: Record<Boy, string> = { buyuk: 'büyük', orta: 'orta', kucuk: 'küçük' };
export const sofradakiler = (yol: Yol): Kisi[] => (yol === 'minik' ? ['baba', 'kino'] : ['baba', 'anne', 'kino']);
export const boylar = (yol: Yol): Boy[] => (yol === 'minik' ? ['buyuk', 'kucuk'] : ['buyuk', 'orta', 'kucuk']);
/** Eşya kimin boyunda: büyük Baba'nın, orta Anne'nin, küçük Kino'nun. */
export const uyar = (boy: Boy, kisi: Kisi) => KISI_BOYU[kisi] === boy;

export type SofraTuru = { takimlar: Esya[]; dizilisler: Boy[][] };
/**
 * Gelişe göre takımlar (2–3 ve 4 yaş iki, 5+ üç) ve bekleyen eşyaların sırası. Sıra hiçbir takımda sofradakilerin
 * sırasıyla (soldan Baba, Anne, Kino: büyükten küçüğe) aynı değil; çocuk boyuna bakarak eşler.
 */
export function sofraTuru(yol: Yol, tekrar = 0): SofraTuru {
  const takimH: Havuzlar<readonly Esya[]> = yol === 'bes'
    ? [[['kase', 'bardak', 'kasik']], [['bardak', 'kasik', 'kase']], [['kasik', 'kase', 'bardak'], ['kase', 'kasik', 'bardak']]]
    : [[['kase', 'bardak']], [['bardak', 'kasik']], [['kasik', 'kase'], ['kase', 'kasik']]];
  const takimlar = [...gelisSorusu(takimH, tekrar)];
  const IKI: Boy[][] = [['kucuk', 'buyuk'], ['kucuk', 'buyuk']];
  const UC: Boy[][] = [['orta', 'kucuk', 'buyuk'], ['kucuk', 'buyuk', 'orta'], ['kucuk', 'orta', 'buyuk']];
  const kay = tekrar % 3;
  const dizilisler = takimlar.map((_, i) => [...(yol === 'minik' ? IKI[i % 2] : UC[(i + kay) % 3])]);
  return { takimlar, dizilisler };
}
/** Yanlış kişiye verilen eşyanın sözü: Kino'ya hep çok büyük, Baba'ya hep çok küçük, Anne'ye büyük ya da küçük. */
export const yanlisSozu = (boy: Boy, kisi: Kisi): 'kinoBuyuk' | 'babaKucuk' | 'anneBuyuk' | 'anneKucuk' =>
  kisi === 'kino' ? 'kinoBuyuk' : kisi === 'baba' ? 'babaKucuk' : boy === 'buyuk' ? 'anneBuyuk' : 'anneKucuk';

/**
 * Fon `aile-yemek-odasi` (1672 × 941, masasız oda) ve önünde `sofra-masasi` (1672 × 560, şeffaf; y 381'den başlar: masa üstü
 * y 470…720, ön kenar y 720, örtü y 941'e iner). Kişiler masanın arkasında oturur, alt gövdeleri masanın arkasında kalır.
 * Kişi pozu tuvali ve tabanı (oturduğu yer, masanın arkasında), yerleri (masada önlerindeki boş yer) ve bekleme sırası.
 */
export const POZ_TUVALI: Record<Kisi, { w: number; h: number }> = { baba: { w: 460, h: 620 }, anne: { w: 420, h: 560 }, kino: { w: 340, h: 440 } };
export const KISI_X: Record<Yol, Partial<Record<Kisi, number>>> = {
  minik: { baba: 470, kino: 1200 }, dort: { baba: 400, anne: 836, kino: 1270 }, bes: { baba: 400, anne: 836, kino: 1270 },
};
/** Kişilerin pozları y 760'ta oturur (masanın arkasında; masa y 470'ten aşağısını örter). */
export const OTURMA_Y = 760;
/** Masada kişinin önündeki yer: eşyanın tabanı y 600. Bekleyen eşyalar ön sırada, tabanı y 705. */
export const YER_Y = 600, BEKLEME_Y = 705;
export const beklemeX = (n: number) => (n === 2 ? [700, 972] : [600, 836, 1072]);
/** Eşya tuvalleri (gerçek boy oranıyla); dokunma kutusu her eşyada en az 170 × 170. */
export const ESYA_TUVALI: Record<Esya, Record<Boy, { w: number; h: number }>> = {
  kase: { buyuk: { w: 240, h: 130 }, orta: { w: 180, h: 100 }, kucuk: { w: 130, h: 75 } },
  bardak: { buyuk: { w: 110, h: 180 }, orta: { w: 85, h: 140 }, kucuk: { w: 65, h: 105 } },
  kasik: { buyuk: { w: 220, h: 55 }, orta: { w: 170, h: 45 }, kucuk: { w: 125, h: 35 } },
};
export const DOKUNMA = 170;
/** Bırakma alanı: kişinin ve önündeki yerin çevresi (fon pikseli). */
export const birakmaAlani = (x: number) => ({ x: x - 210, y: 120, w: 420, h: 480 });

export const SOFRA_SOZ = {
  giris: 319,
  takim: { 'kase-iki': 320, 'kase-uc': 321, 'bardak-iki': 322, 'bardak-uc': 323, 'kasik-iki': 324, 'kasik-uc': 325 } as Record<string, number>,
  dogru: { babaIki: 326, kinoIki: 327, baba: 328, anne: 329, kino: 330 },
  yanlis: { kinoBuyuk: 331, babaKucuk: 332, anneBuyuk: 333, anneKucuk: 334 },
  // "Afiyet olsun!" (125) Lokum'un İki Kâsesi'nden.
  afiyet: 125, bitti: 335,
} as const;
/** Doğru eşyayı alan kişinin sözü (2–3 yaşta "büyüğü / küçüğü", büyüklerde "en büyüğü / ortancası / en küçüğü"). */
export const dogruSozu = (kisi: Kisi, yol: Yol) =>
  yol === 'minik' ? (kisi === 'baba' ? SOFRA_SOZ.dogru.babaIki : SOFRA_SOZ.dogru.kinoIki) : SOFRA_SOZ.dogru[kisi];
export const takimSozu = (e: Esya, yol: Yol) => SOFRA_SOZ.takim[e + (yol === 'minik' ? '-iki' : '-uc')];
/** Astra M35 (`assets/matematik/aile-sofrasi/`): oda, sofra masası, üç eşyanın üç boyu, Baba, Anne ve Kino'nun ikişer pozu. */
export const SOFRA_CIZIMLERI = [
  'aile-yemek-odasi', 'sofra-masasi',
  ...(['kase', 'bardak', 'kasik'] as const).flatMap((e) => (['buyuk', 'orta', 'kucuk'] as const).map((b) => e + '-' + b)),
  'baba-sofra-0', 'baba-sofra-1', 'anne-sofra-0', 'anne-sofra-1', 'kino-sofra-0', 'kino-sofra-1',
] as const;
