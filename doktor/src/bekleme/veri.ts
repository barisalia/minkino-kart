// 3. sahne · bekleme odası (çekim listesi 3.1–3.3). Çizim adları Paket Doktor-K2 brief'iyle birebirdir.
// Zıpzıp koltuğun ucuna ilişir. Çocuk raftan bir şey verir: Kuzu (sarılır, sahne onunla sürer), kitap ya da top
// (kısa tepki, sonra raf yeniden açık). Kino iç kapıda bekler, sırası gelince yol verir.
// Saf veri: DOM yok.
import type { Dizi } from '../once-kuzu/diziler';
import type { Adim } from '../motor/akis';

const sira = (onek: string, bas: number, son: number): string[] => Array.from({ length: son - bas + 1 }, (_, i) => onek + (bas + i));

export const K2_BEKLEME = {
  fon: 'fon-bekleme',
  koltuk: 'bekleme-koltugu',
  rafKuzu: 'raf-kuzu',
  rafKitap: 'raf-kitap',
  rafTop: 'raf-top',
  ilis: sira('zipzip-ilis-', 0, 5),
  ilisAgiz: sira('zipzip-ilis-agiz-', 0, 5),
  ilisKirp: 'zipzip-ilis-kirp',
  saril: sira('zipzip-saril-', 0, 3),
  sarilAgiz: sira('zipzip-saril-agiz-', 0, 5),
  kitap: sira('zipzip-kitap-', 0, 3),
  top: sira('zipzip-top-', 0, 3),
  kalkKuzu: sira('zipzip-kalk-kuzu-', 0, 3),
  kapida: sira('kino-kapida-', 0, 3),
  kapidaAgiz: sira('kino-kapida-agiz-', 0, 5),
  kapidaKirp: 'kino-kapida-kirp',
} as const;
export const BEKLEME_DOSYALAR: readonly string[] = Object.values(K2_BEKLEME).flat();

const z = K2_BEKLEME;
export const BEKLEME_DIZI = {
  /** koltuğun önünden ucuna ilişir */
  'zipzip-ilis': { kareler: z.ilis, sureler: [450, 240, 220, 220, 260, 0] },
  /** Kuzu'yu alır, sarılır (sıkıca sarıldığı pozda uzun kalır), gevşer */
  'zipzip-saril': { kareler: z.saril, sureler: [220, 240, 520, 0] },
  /** kitabı alır, açar: kitap ağzını ve burnunu örter */
  'zipzip-kitap-ac': { kareler: [z.kitap[0], z.kitap[1]], sureler: [420, 0] },
  /** gözleri kitabın üstünden bize bakar */
  'zipzip-kitap-bak': { kareler: [z.kitap[1], z.kitap[2]], sureler: [500, 0] },
  /** topu alır, göğsüne bastırır, üzgün bakar */
  'zipzip-top-al': { kareler: [z.top[0], z.top[1], z.top[2]], sureler: [380, 520, 0] },
  /** Kuzu'yu kolunun altına alıp koltuktan iner */
  'zipzip-kalk-kuzu': { kareler: z.kalkKuzu, sureler: [300, 260, 260, 0] },
  /** Kino pervazdan başını uzatır, eşiğe çıkar */
  'kino-kapida-gel': { kareler: [z.kapida[0], z.kapida[1]], sureler: [520, 0] },
  /** odayı gösterir, yol verir */
  'kino-davet': { kareler: [z.kapida[2], z.kapida[3]], sureler: [320, 0] },
} as const satisfies Record<string, Dizi>;

export type BeklemeOlayi = 'esya-verildi';
export type Esya = 'kuzu' | 'kitap' | 'top';
/** Çocuğun verdiği eşyaya göre gidilecek adım. */
export const ESYA_ADIMI: Record<Esya, string> = { kuzu: 's3-kuzu-al', kitap: 's3-kitap-al', top: 's3-top-al' };
export const ESYA_CIZIMI: Record<Esya, string> = { kuzu: z.rafKuzu, kitap: z.rafKitap, top: z.rafTop };

export const BEKLEME_REPLIKLER: readonly { ad: string; kim: 'kino' | 'zipzip'; metin: string }[] = [
  { ad: 'z3-ic-cek', kim: 'zipzip', metin: '(iç çeker)' },
  { ad: 'k3-arkadas', kim: 'kino', metin: 'Bekleyene bir arkadaş iyi gelir.' },
  { ad: 'z3-kitap', kim: 'zipzip', metin: 'Aa, Kino da doktora gitmiş!' },
  { ad: 'z3-top', kim: 'zipzip', metin: 'Benim topum çalıda kaldı…' },
  { ad: 'z3-kuzu', kim: 'zipzip', metin: 'Kuzu! Sen de mi kontrole geldin?' },
  { ad: 'k3-sira', kim: 'kino', metin: 'Sıra sende. Kuzu da gelsin mi?' },
];
export const BEKLEME_EFEKTLER = ['e1-minder'] as const;
export const BEKLEME_KAYIT_MS: Record<string, number> = { 'z3-ic-cek': 1670, 'k3-arkadas': 2290, 'z3-kitap': 2320, 'z3-top': 1880, 'z3-kuzu': 2530, 'k3-sira': 2480 };

const ILIS = z.ilis[5];
const ESIK = z.kapida[1];
export const BEKLEME_ADIMLAR: readonly Adim<BeklemeOlayi>[] = [
  // 3.1 · Zıpzıp ilişir; Kino iç kapının eşiğinde
  { ad: 's3-gel', plan: 'genis', katman: { koltuk: { poz: z.koltuk }, yanKitap: { yok: true }, yanTop: { yok: true }, zipzip: { dizi: 'zipzip-ilis' }, kino: { dizi: 'kino-kapida-gel' } },
    ses: { kim: 'zipzip', ad: 'z3-ic-cek', gecikme: 1500, agiz: null }, efekt: [{ ad: 'e1-minder', gecikme: 1150 }], bitis: { tur: 'sure', ms: 3300 } },
  { ad: 's3-arkadas', plan: 'genis', katman: { kino: { poz: ESIK }, zipzip: { poz: ILIS, kirp: z.ilisKirp, kirpAnlari: [600] } },
    ses: { kim: 'kino', ad: 'k3-arkadas', agiz: 'kino-kapida', dinlenme: 5 }, bitis: { tur: 'ses', ek: 300 } },
  // 3.2 · çocuk raftan bir şey verir
  { ad: 's3-raf', plan: 'orta', katman: { zipzip: { poz: ILIS, kirp: z.ilisKirp, kirpAnlari: [1200, 4300, 8000] }, kino: { poz: ESIK, kirp: z.kapidaKirp, kirpAnlari: [2500, 6800] } },
    bitis: { tur: 'cocuk', olay: 'esya-verildi' } },
  // kitap: açar, ağzı kitabın arkasında konuşur, yanına koyar; raf yeniden açık
  { ad: 's3-kitap-al', plan: 'orta', katman: { zipzip: { dizi: 'zipzip-kitap-ac' } }, bitis: { tur: 'sure', ms: 1000 } },
  { ad: 's3-kitap-soz', plan: 'orta', katman: { zipzip: { dizi: 'zipzip-kitap-bak' } }, ses: { kim: 'zipzip', ad: 'z3-kitap', gecikme: 200, agiz: null }, bitis: { tur: 'ses', ek: 400 } },
  { ad: 's3-kitap-birak', plan: 'orta', katman: { zipzip: { poz: z.kitap[3] } }, bitis: { tur: 'sure', ms: 520 } },
  { ad: 's3-kitap-yan', plan: 'orta', katman: { zipzip: { poz: ILIS }, yanKitap: { poz: z.rafKitap } }, bitis: { tur: 'sure', ms: 300 }, sonra: 's3-raf' },
  // top: sıkar, üzgün bakar, yanına koyar, temel pozda konuşur; raf yeniden açık
  { ad: 's3-top-al', plan: 'orta', katman: { zipzip: { dizi: 'zipzip-top-al' } }, bitis: { tur: 'sure', ms: 1700 } },
  { ad: 's3-top-birak', plan: 'orta', katman: { zipzip: { poz: z.top[3] } }, bitis: { tur: 'sure', ms: 480 } },
  { ad: 's3-top-soz', plan: 'orta', katman: { zipzip: { poz: z.ilisAgiz[0] }, yanTop: { poz: z.rafTop } }, ses: { kim: 'zipzip', ad: 'z3-top', agiz: 'zipzip-ilis', dinlenme: 0 }, bitis: { tur: 'ses', ek: 400 }, sonra: 's3-raf' },
  // Kuzu: sarılır, konuşur; 3.3 · Kino yol verir, Zıpzıp Kuzu'yla kalkar
  { ad: 's3-kuzu-al', plan: 'orta', katman: { zipzip: { dizi: 'zipzip-saril' } }, bitis: { tur: 'sure', ms: 1500 } },
  { ad: 's3-kuzu-soz', plan: 'orta', katman: { zipzip: { poz: z.sarilAgiz[5] } }, ses: { kim: 'zipzip', ad: 'z3-kuzu', agiz: 'zipzip-saril', dinlenme: 5 }, bitis: { tur: 'ses', ek: 400 } },
  { ad: 's3-sira', plan: 'genis', katman: { kino: { poz: ESIK } }, ses: { kim: 'kino', ad: 'k3-sira', agiz: 'kino-kapida', dinlenme: 5 }, bitis: { tur: 'ses', ek: 200 } },
  { ad: 's3-davet', plan: 'genis', katman: { kino: { dizi: 'kino-davet' }, zipzip: { dizi: 'zipzip-kalk-kuzu' } }, bitis: { tur: 'sure', ms: 1700 }, sonra: 'son' },
];

/** Yerleşim (sahne birimi; çizim pikseli × 0,4). Fon gelince raf ve iç kapı ölçülüp güncellenir. */
export const BEKLEME_OLCEK = 0.4;
export const BEKLEME_YERLESIM = {
  yer: 780,
  /** Zıpzıp ve koltuğun ekseni; Kino iç kapının eşiğinde (sağda) */
  zipzipX: 800, kinoX: 1230, kinoYer: 770,
  /** raftaki eşyalar (rafın üstü y = 600): Kuzu 500 × 500, kitap 400 × 500, top 400 × 400 çizim; rafta biraz küçük durur */
  raf: {
    kuzu: { sol: 210, ust: 430, g: 170, y: 170 },
    kitap: { sol: 395, ust: 430, g: 136, y: 170 },
    top: { sol: 545, ust: 464, g: 136, y: 136 },
  },
  /** yanına koyulan kitap ve top: oturağın üstünde (oturak y = 660) */
  yanKitap: { sol: 950, ust: 470, g: 152, y: 190 },
  yanTop: { sol: 560, ust: 520, g: 140, y: 140 },
  /** eşyanın bırakılacağı yer: Zıpzıp'ın kucağı (Zıpzıp tuvalinde) ve yarıçap (çizim pikseli) */
  kucak: { x: 650, y: 980, yaricap: 240 },
} as const;
/** orta plan rafı ve Zıpzıp'ı birlikte gösterir (iPad'de de); Kino'nun konuştuğu adımlar geniş plandadır */
export const BEKLEME_KAMERA = { genis: { olcek: 1, x: 800, y: 450 }, orta: { olcek: 1.25, x: 590, y: 520 } } as const;

/** Katman kutuları, arkadan öne (tuvaller: koltuk 1400 × 1100, oturak y = 520, yer y = 820, eksen x = 700;
 *  Zıpzıp 1300 × 1500, oturuşta kalça y = 1140; Kino 1300 × 1600). */
export function beklemeKatmanlari() {
  const o = BEKLEME_OLCEK, y = BEKLEME_YERLESIM;
  return [
    { ad: 'koltuk', kutu: { sol: y.zipzipX - 700 * o, ust: y.yer - 820 * o, g: 1400 * o, y: 1100 * o }, olcek: o },
    { ad: 'kino', kutu: { sol: y.kinoX - 650 * o, ust: y.kinoYer - 1540 * o, g: 1300 * o, y: 1600 * o }, olcek: o },
    { ad: 'yanKitap', kutu: { ...y.yanKitap }, olcek: o },
    { ad: 'yanTop', kutu: { ...y.yanTop }, olcek: o },
    { ad: 'zipzip', kutu: { sol: y.zipzipX - 650 * o, ust: y.yer - 1440 * o, g: 1300 * o, y: 1500 * o }, olcek: o },
  ];
}
