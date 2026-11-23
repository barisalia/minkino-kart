// 2. sahne · klinik kapısı (çekim listesi 2.1–2.3). Çizim adları Paket Doktor-K2 brief'iyle birebirdir.
// Çocuk tabelayı çevirir; Zıpzıp tek ayak üstünde sekerek gelir, kapıda çekinir; kapı açılır, Kino onun boyuna iner.
// Saf veri: DOM yok.
import type { Dizi } from '../once-kuzu/diziler';
import type { Adim, Yuru } from '../motor/akis';

const sira = (onek: string, bas: number, son: number): string[] => Array.from({ length: son - bas + 1 }, (_, i) => onek + (bas + i));

export const K2_KAPI = {
  fon: 'fon-klinik-dis',
  kapi: sira('kapi-', 0, 2),
  tabela: sira('tabela-', 0, 2),
  sek: sira('zipzip-sek-', 0, 7),
  cekin: sira('zipzip-cekin-', 0, 3),
  cekinKirp: 'zipzip-cekin-kirp',
  cekinAgiz: sira('zipzip-cekin-agiz-', 0, 5),
  karsila: sira('kino-karsila-', 0, 5),
  karsilaAgiz: sira('kino-karsila-agiz-', 0, 5),
  karsilaKirp: 'kino-karsila-kirp',
} as const;
export const KAPI_DOSYALAR: readonly string[] = Object.values(K2_KAPI).flat();

const z = K2_KAPI;
export const KAPI_DIZI = {
  /** tabela ay tarafından güneş tarafına döner */
  'tabela-don': { kareler: z.tabela, sureler: [120, 120, 0] },
  /** tek ayak üstünde sekme döngüsü: 0–2 ayak yerde, 3–5 havada, 6–7 iniş ve toparlanma */
  'zipzip-sek': { kareler: z.sek, sureler: [110, 110, 90, 90, 110, 90, 110, 110], donus: 0 },
  /** içeri bakar, boynunu uzatır, geri çekilir, çekinme pozunda kalır */
  'zipzip-cekin': { kareler: z.cekin, sureler: [500, 400, 260, 0] },
  'kapi-ac': { kareler: z.kapi, sureler: [160, 160, 0] },
  /** eşikten çıkar, dizlerini büküp Zıpzıp'ın boyuna iner */
  'kino-karsila': { kareler: z.karsila, sureler: [260, 220, 180, 180, 200, 0] },
} as const satisfies Record<string, Dizi>;

/** Sekerek geliş: beş sekme, her biri 300 px (çizim pikseli); yalnız havadaki pozlarda ilerler. Zıpzıp sağdan gelir. */
export const SEK: Yuru = { adim: 300, hava: [3, 4, 5], tekrar: 5, yon: -1 };
const SEK_DONGU = KAPI_DIZI['zipzip-sek'].sureler.reduce((a: number, b: number) => a + b, 0);
/** bir döngüde ayağın yere değdiği an (ms) */
const INIS = KAPI_DIZI['zipzip-sek'].sureler.slice(0, 6).reduce((a: number, b: number) => a + b, 0);

export type KapiOlayi = 'tabela-cevrildi';
export const KAPI_REPLIKLER: readonly { ad: string; kim: 'kino' | 'zipzip'; metin: string }[] = [
  { ad: 'z2-uf', kim: 'zipzip', metin: 'Uf… uf… uf…' },
  { ad: 'z2-aciyacak', kim: 'zipzip', metin: 'Acıyacak mı?' },
  { ad: 'k2-hos-geldin', kim: 'kino', metin: 'Hoş geldin Zıpzıp! Dizine birlikte bakalım mı?' },
];
export const KAPI_EFEKTLER = ['e2-tak', 'e2-zil', 'e2-kapi', 'e2-pat'] as const;
/** Kayıt süreleri (ms; kırpılmış dosyalardan). Sahne gerçek süreyi ses dosyasından alır. */
export const KAPI_KAYIT_MS: Record<string, number> = { 'z2-uf': 2610, 'z2-aciyacak': 1090, 'k2-hos-geldin': 3260 };

const CEKIN = z.cekin[3];
export const KAPI_ADIMLAR: readonly Adim<KapiOlayi>[] = [
  // 2.1 · tabela ay tarafında; çocuk çevirir
  { ad: 's2-tabela', plan: 'genis', katman: { tabela: { poz: z.tabela[0] }, kapi: { poz: z.kapi[0] }, kino: { yok: true }, zipzip: { yok: true } }, bitis: { tur: 'cocuk', olay: 'tabela-cevrildi' } },
  { ad: 's2-don', plan: 'genis', katman: { tabela: { dizi: 'tabela-don' } }, efekt: [{ ad: 'e2-tak' }, { ad: 'e2-zil', gecikme: 260 }], bitis: { tur: 'sure', ms: 1100 } },
  // 2.2 · Zıpzıp sekerek gelir, kapıda çekinir
  { ad: 's2-sek', plan: 'genis', katman: { zipzip: { dizi: 'zipzip-sek', yuru: SEK } }, ses: { kim: 'zipzip', ad: 'z2-uf', gecikme: 500, agiz: null },
    efekt: Array.from({ length: SEK.tekrar }, (_, i) => ({ ad: 'e2-pat', gecikme: INIS + i * SEK_DONGU, kazanc: 0.6 })), bitis: { tur: 'sure', ms: SEK_DONGU * SEK.tekrar } },
  { ad: 's2-dur', plan: 'orta', katman: { zipzip: { dizi: 'zipzip-cekin' } }, bitis: { tur: 'sure', ms: 1500 } },
  { ad: 's2-aciyacak', plan: 'orta', katman: { zipzip: { poz: CEKIN } }, ses: { kim: 'zipzip', ad: 'z2-aciyacak', agiz: 'zipzip-cekin', dinlenme: 0 }, bitis: { tur: 'ses', ek: 350 } },
  // 2.3 · kapı açılır, Kino karşılar
  { ad: 's2-kapi', plan: 'orta', katman: { kapi: { dizi: 'kapi-ac' }, kino: { poz: z.karsila[0] }, zipzip: { poz: CEKIN, kirp: z.cekinKirp, kirpAnlari: [300] } },
    efekt: [{ ad: 'e2-kapi' }], bitis: { tur: 'sure', ms: 900 } },
  { ad: 's2-karsila', plan: 'orta', katman: { kino: { dizi: 'kino-karsila' } }, bitis: { tur: 'sure', ms: 1300 } },
  { ad: 's2-hos-geldin', plan: 'orta', katman: { kino: { poz: z.karsila[5] }, zipzip: { poz: CEKIN, kirp: z.cekinKirp, kirpAnlari: [900, 2600] } },
    ses: { kim: 'kino', ad: 'k2-hos-geldin', agiz: 'kino-karsila', dinlenme: 5 }, bitis: { tur: 'ses', ek: 500 } },
  { ad: 's2-bak', plan: 'orta', katman: { kino: { poz: z.karsila[5], kirp: z.karsilaKirp, kirpAnlari: [250] } }, bitis: { tur: 'sure', ms: 700 } },
];

/** Yerleşim (sahne birimi; çizim pikseli × 0,4). Fon gelince kapı boşluğu ve tabela kancası ölçülüp güncellenir. */
export const KAPI_OLCEK = 0.4;
export const KAPI_YERLESIM = {
  /** kapı boşluğu: fonun ortasında, eşik y = %78 (brief) */
  bosluk: { sol: 648, ust: 162, g: 304, y: 540 },
  /** yer çizgileri: Kino eşikte, Zıpzıp kaldırımda (kameraya biraz daha yakın) */
  kinoYer: 712, zipzipYer: 760,
  /** gövde eksenleri: Kino kapının ortasında, Zıpzıp kapının sağında durur */
  kinoX: 800, zipzipX: 1060,
  /** tabela: kapının sağındaki kancada (500 × 600 çizim) */
  tabela: { sol: 1010, ust: 250, g: 200, y: 240 },
} as const;
export const KAPI_KAMERA = { genis: { olcek: 1, x: 800, y: 450 }, orta: { olcek: 1.35, x: 900, y: 500 } } as const;

/** Katman kutuları, arkadan öne (tuvaller: Zıpzıp 1300 × 1500 yer 1440; Kino 1300 × 1600 yer 1540; kapı 800 × 1400). */
export function kapiKatmanlari() {
  const o = KAPI_OLCEK, y = KAPI_YERLESIM;
  return [
    { ad: 'kino', kutu: { sol: y.kinoX - 650 * o, ust: y.kinoYer - 1540 * o, g: 1300 * o, y: 1600 * o }, olcek: o },
    { ad: 'kapi', kutu: { sol: y.bosluk.sol - 20 * o, ust: y.bosluk.ust + y.bosluk.y - 1390 * o, g: 800 * o, y: 1400 * o }, olcek: o },
    { ad: 'tabela', kutu: { ...y.tabela }, olcek: o },
    { ad: 'zipzip', kutu: { sol: y.zipzipX - 650 * o, ust: y.zipzipYer - 1440 * o, g: 1300 * o, y: 1500 * o }, olcek: o },
  ];
}
