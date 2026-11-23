// 7. sahne · ödül köşesi (çekim listesi 7.1–7.4). Çizim adları Paket Doktor-K3 brief'iyle birebirdir.
// Zıpzıp masadan iner, dizini dener; çocuk yıldız seçip göğsüne yapıştırır, ikincisini Kuzu'ya verir; 5+ yaşta karneye
// damga vurur ve karne panoya asılır; Zıpzıp stetoskopla Kino'nun kalbini dinler.
// Saf veri: DOM yok.
import type { Dizi } from '../once-kuzu/diziler';
import { DIZI as K1_DIZI, K1 } from '../once-kuzu/diziler';
import type { Adim } from '../motor/akis';
import type { Yas, Yasli } from '../motor/oyun';

const sira = (onek: string, bas: number, son: number): string[] => Array.from({ length: son - bas + 1 }, (_, i) => onek + (bas + i));

export const K3_ODUL = {
  in: sira('zipzip-in-', 0, 5),
  ayaktaAgiz: sira('zipzip-ayakta-agiz-', 0, 5),
  ayaktaKirp: 'zipzip-ayakta-kirp',
  dizDene: sira('zipzip-diz-dene-', 0, 4),
  gurur: sira('zipzip-gurur-', 0, 3),
  doktor: sira('zipzip-doktor-', 0, 3),
  kinoDinlen: sira('kino-dinlen-', 0, 1),
  yildizlar: ['yildiz-sari', 'yildiz-nane', 'yildiz-mavi'],
  karne: 'saglik-karnesi',
  karneKucuk: 'karne-kucuk',
  damga: 'damga',
  damgaIzi: 'damga-izi',
  bantIsaretleri: ['bant-isaret-yildiz', 'bant-isaret-kalp', 'bant-isaret-gokkusagi', 'bant-isaret-pati'],
  kuzu: 'kuzu-oturur',
} as const;
/** Bu sahnenin K3'teki kendi çizimleri (40). */
export const ODUL_DOSYALAR: readonly string[] = Object.values(K3_ODUL).flat();
/** K1'den kullanılanlar: muayene odası, masa, Kino'nun gösterme pozu, ağızları ve gülüşü. */
export const ODUL_ODUNC: readonly string[] = [K1.fon, K1.masa, K1.kinoGoster[3], ...K1.kinoAgiz, K1.kinoKirp, ...K1.kinoGul];

const z = K3_ODUL;
const AYAKTA = z.in[5];
export const ODUL_DIZI = {
  /** basamaklardan iner */
  'zipzip-in': { kareler: z.in, sureler: [260, 220, 200, 200, 220, 0] },
  /** dizini büker, uzatır, çömelir, zıplar, yere iner */
  'diz-dene': { kareler: [...z.dizDene, AYAKTA], sureler: [500, 380, 380, 260, 320, 0] },
  /** göğsündeki yıldıza bakar, patilerini beline koyar, göğsünü kabartır */
  'gurur-kabar': { kareler: [z.gurur[0], z.gurur[1], z.gurur[2]], sureler: [420, 380, 0] },
  /** stetoskobu uzatır, Kino'nun göğsünü dinler, sevinir */
  'zipzip-doktor': { kareler: z.doktor, sureler: [300, 300, 900, 0] },
  /** Kino şaşırır, sonra güler */
  'kino-dinlen': { kareler: z.kinoDinlen, sureler: [700, 0] },
  'kino-gul': K1_DIZI['kino-gul'],
} as const satisfies Record<string, Dizi>;

export type OdulOlayi = 'yildiz-yapisti' | 'kuzu-yildiz' | 'damga-basildi';
export const ODUL_REPLIKLER: readonly { ad: string; kim: 'kino' | 'zipzip'; metin: string }[] = [
  { ad: 'zo-bukuluyor', kim: 'zipzip', metin: 'Bak! Bükülüyor!' },
  { ad: 'ko-yildiz', kim: 'kino', metin: 'Cesur hastaya bir yıldız yakışır.' },
  { ad: 'zo-kuzuya', kim: 'zipzip', metin: 'Kuzu’ya da! İlk hasta oydu!' },
  { ad: 'ko-pano', kim: 'kino', metin: 'Panomuzun ilk karnesi.' },
  { ad: 'zo-davul', kim: 'zipzip', metin: 'Seninki de davul!' },
];
export const ODUL_EFEKTLER = ['e1-basamak', 'e8-zipla', 'e7-damga', 'yildiz'] as const;
export const ODUL_KAYIT_MS: Record<string, number> = { 'zo-bukuluyor': 1460, 'ko-yildiz': 2660, 'zo-kuzuya': 2320, 'ko-pano': 1850, 'zo-davul': 1220 };

type OdulAdimi = Adim<OdulOlayi> & Yasli;
const BES: readonly Yas[] = ['5+'];
const KINO = { poz: K1.kinoGoster[3], kirp: K1.kinoKirp, kirpAnlari: [900, 3800] };
export const ODUL_ADIMLAR: readonly OdulAdimi[] = [
  // 7.1 · masadan iner, dizini dener
  { ad: 's7-in', plan: 'orta', katman: { masa: { poz: K1.masa }, kuzu: { poz: z.kuzu }, pano: { yok: true }, kino: KINO, zipzip: { dizi: 'zipzip-in' } }, efekt: [{ ad: 'e1-basamak', gecikme: 680 }], bitis: { tur: 'sure', ms: 1700 } },
  { ad: 's7-dene', plan: 'orta', katman: { zipzip: { dizi: 'diz-dene' } }, efekt: [{ ad: 'e8-zipla', gecikme: 1520, kazanc: 0.8 }], bitis: { tur: 'sure', ms: 2100 } },
  { ad: 's7-bukuluyor', plan: 'orta', katman: { zipzip: { poz: z.ayaktaAgiz[5] } }, ses: { kim: 'zipzip', ad: 'zo-bukuluyor', agiz: 'zipzip-ayakta', dinlenme: 5 }, bitis: { tur: 'ses', ek: 250 } },
  // 7.2 · yıldız göğse, ikincisi Kuzu'ya
  { ad: 's7-kino-yildiz', plan: 'orta', katman: { zipzip: { poz: AYAKTA, kirp: z.ayaktaKirp, kirpAnlari: [700] }, kino: { poz: K1.kinoGoster[3] } }, ses: { kim: 'kino', ad: 'ko-yildiz', agiz: 'kino-steto', dinlenme: 5 }, bitis: { tur: 'ses', ek: 200 } },
  { ad: 's7-yildiz', plan: 'orta', katman: { zipzip: { poz: AYAKTA, kirp: z.ayaktaKirp, kirpAnlari: [1500, 5000, 8600] }, kino: KINO }, bitis: { tur: 'cocuk', olay: 'yildiz-yapisti' } },
  { ad: 's7-gurur', plan: 'orta', katman: { zipzip: { dizi: 'gurur-kabar' } }, efekt: [{ ad: 'yildiz', kazanc: 0.9 }], bitis: { tur: 'sure', ms: 1500 } },
  { ad: 's7-kuzuya', plan: 'orta', katman: { zipzip: { poz: z.gurur[3] } }, ses: { kim: 'zipzip', ad: 'zo-kuzuya', agiz: null }, bitis: { tur: 'ses', ek: 100 } },
  { ad: 's7-kuzu-yildiz', plan: 'orta', bitis: { tur: 'cocuk', olay: 'kuzu-yildiz' } },
  { ad: 's7-kuzu-tamam', plan: 'orta', katman: { zipzip: { poz: AYAKTA, kirp: z.ayaktaKirp, kirpAnlari: [400] } }, efekt: [{ ad: 'yildiz', kazanc: 0.7 }], bitis: { tur: 'sure', ms: 900 } },
  // 7.3 · karne, damga, pano (5+)
  { ad: 's7-karne', plan: 'karne', yas: BES, bitis: { tur: 'cocuk', olay: 'damga-basildi' } },
  { ad: 's7-iz', plan: 'karne', yas: BES, efekt: [{ ad: 'e7-damga', kazanc: 1.2 }], bitis: { tur: 'sure', ms: 1200 } },
  { ad: 's7-pano', plan: 'orta', yas: BES, katman: { pano: { poz: z.karneKucuk }, kino: { poz: K1.kinoGoster[3] } }, ses: { kim: 'kino', ad: 'ko-pano', gecikme: 500, agiz: 'kino-steto', dinlenme: 5 }, bitis: { tur: 'ses', ek: 300 } },
  // 7.4 · Zıpzıp doktor olur
  { ad: 's7-doktor', plan: 'orta', katman: { zipzip: { dizi: 'zipzip-doktor' }, kino: { dizi: 'kino-dinlen' } }, bitis: { tur: 'sure', ms: 1900 } },
  { ad: 's7-davul', plan: 'orta', katman: { zipzip: { poz: z.doktor[3] }, kino: { dizi: 'kino-gul' } }, ses: { kim: 'zipzip', ad: 'zo-davul', agiz: null }, bitis: { tur: 'ses', ek: 1000 }, sonra: 'son' },
];

/** Yerleşim (sahne birimi). Yıldız seçenekleri alt ortada; karne ekranın ortasında; pano fonda (fon gelince ölçülür). */
export const ODUL_YERLESIM = {
  /** masadan indikten sonra Zıpzıp'ın katmanı bu kadar sola kayar (iniş pozu taburenin önünde biter) */
  inisKaymasi: -88,
  kuzu: { sol: 560, ust: 440, g: 200, y: 200 },
  /** yıldız seçenekleri: merkezler ve boy */
  yildizSecim: { x: 800, y: 770, aralik: 130, boy: 100 },
  /** Kuzu'nun göğsü (Kuzu kutusunun oranı) ve yıldızın boyu */
  kuzuGogus: [0.5, 0.66] as [number, number], kuzuYildizBoyu: 46,
  /** karne (1800 × 1300 çizim) ve damga yeri (karnenin oranı), izin çapı (karnenin enine oran) */
  karne: { sol: 350, ust: 125, g: 900, y: 650 }, damgaYeri: [0.75, 0.5] as [number, number], izCapi: 0.19,
  /** damganın beklediği yer ve elde boyu (sahne birimi); tutma ve uç (çizimin oranı) */
  damga: { x: 1320, y: 620, boy: 300, tut: [0.5, 0.3] as [number, number], uc: [0.5, 0.94] as [number, number] },
  /** mantar panodaki küçük karne */
  pano: { sol: 770, ust: 150, g: 110, y: 88 },
} as const;
