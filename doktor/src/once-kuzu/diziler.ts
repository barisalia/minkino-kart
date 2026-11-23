// "Önce Kuzu" kanıt sahnesi · çizim adları ve poz dizileri. Adlar Astra'ya yazılan Paket Doktor-K1 brief'iyle birebirdir
// (CLAUDE-ASTRA-MESAJLAR.md, 22 Kasım 2026); çizim `assets/doktor/zipzip-diz/<ad>.webp` olarak klasöre düşünce bağlanır.
// Hareket çizilmiş pozların sırayla gösterilmesidir; kodla esnetme yok. Her pozun ekranda kalma süresi (ms) burada.
// Saf veri ve mantık: DOM yok, birim testleri buradan sınar.

const sira = (onek: string, bas: number, son: number): string[] => Array.from({ length: son - bas + 1 }, (_, i) => onek + (bas + i));

/** Paket Doktor-K1'in 68 çizimi, brief'teki sayfa sırasıyla. */
export const K1 = {
  // A · Zıpzıp, orta plan (26)
  zipzipTirman: sira('zipzip-tirman-', 0, 5),
  zipzipOturAgiz: sira('zipzip-otur-agiz-', 0, 5),
  zipzipOturKirp: 'zipzip-otur-kirp',
  zipzipOturBak: 'zipzip-otur-bak',
  zipzipSaklan: sira('zipzip-saklan-', 1, 4),
  zipzipMerak: sira('zipzip-merak-', 0, 3),
  zipzipKuzuKaldir: sira('zipzip-kuzu-kaldir-', 0, 3),
  // B · Zıpzıp, yakın plan (16)
  yakinDinle: 'zipzip-yakin-dinle',
  yakinKirp: 'zipzip-yakin-kirp',
  yakinSaskin: sira('zipzip-yakin-saskin-', 0, 1),
  yakinKikir: sira('zipzip-yakin-kikir-', 0, 3),
  yakinAgiz: sira('zipzip-yakin-agiz-', 0, 5),
  yakinGogus: 'zipzip-yakin-gogus',
  yakinBak: 'zipzip-yakin-bak',
  // C · Kino, orta plan (21)
  kinoGoster: sira('kino-steto-goster-', 0, 3),
  kinoAgiz: sira('kino-steto-agiz-', 0, 5),
  kinoKirp: 'kino-steto-kirp',
  kinoBakKuzu: 'kino-steto-bak-kuzu',
  kinoEgilBos: 'kino-egil-bos',
  kinoEgil: sira('kino-egil-', 0, 3),
  kinoGul: sira('kino-gul-', 0, 3),
  // D · eşya ve mekân (5)
  stetoskop: 'stetoskop',
  fon: 'fon-muayene',
  masa: 'muayene-masasi',
  perde: sira('perde-', 0, 1),
} as const;

export const K1_DOSYALAR: readonly string[] = Object.values(K1).flat();

/** Ağız dizileri: aynı poz, altı ağız. Sıra src/audio/dudak-mantik.ts → AGIZ_SEKILLERI ile aynı:
 *  0 kapalı, 1 az, 2 orta, 3 yuvarlak, 4 diş, 5 kapalı gülümseme. */
export const AGIZ = {
  'zipzip-otur': K1.zipzipOturAgiz,
  'zipzip-yakin': K1.yakinAgiz,
  'kino-steto': K1.kinoAgiz,
} as const;
export type AgizDizisi = keyof typeof AGIZ;

export interface Dizi {
  /** gösterilecek çizimler, sırayla (aynı çizim yinelenebilir) */
  kareler: readonly string[];
  /** her karenin süresi (ms); son karede 0: dizi orada durur */
  sureler: readonly number[];
  /** verilirse dizi bitince bu kareden başa döner (döngü) */
  donus?: number;
}
const z = K1;
/** Hareketler. Süreler oyunculuğa göre: anlatan poz uzun kalır, geçiş pozları kısa (saniyede 6–12 poz aralığında). */
export const DIZI = {
  /** Kuzu kolunda, basamaktan masaya çıkıp oturur; ilk pozda masaya bakar */
  'zipzip-tirman': { kareler: z.zipzipTirman, sureler: [520, 170, 170, 190, 230, 0] },
  /** irkilir, Kuzu'yu yüzünün önüne kaldırır */
  'zipzip-saklan': { kareler: z.zipzipSaklan, sureler: [130, 130, 170, 0] },
  /** Kuzu'nun arkasından önce tek göz, sonra iki göz */
  'zipzip-merak-cik': { kareler: [z.zipzipMerak[0], z.zipzipMerak[1]], sureler: [340, 0] },
  /** Kuzu göğse iner, "ben de" */
  'zipzip-merak-ben': { kareler: [z.zipzipMerak[2], z.zipzipMerak[3]], sureler: [260, 0] },
  /** sevinç: Kuzu'yu başının üstüne kaldırır, son iki poz arasında sallanır */
  'zipzip-kuzu-kaldir': { kareler: z.zipzipKuzuKaldir, sureler: [200, 150, 260, 260], donus: 2 },
  /** stetoskobun serinliğiyle ürperme */
  'yakin-saskin': { kareler: z.yakinSaskin, sureler: [170, 0] },
  /** kıkırdama: omuzlar iki kez sallanır, sonra durulur */
  'yakin-kikir': { kareler: [z.yakinKikir[0], z.yakinKikir[1], z.yakinKikir[2], z.yakinKikir[1], z.yakinKikir[2], z.yakinKikir[3]], sureler: [150, 210, 260, 200, 240, 0] },
  /** stetoskobu boynundan çıkarıp ucunu gösterir */
  'kino-goster': { kareler: z.kinoGoster, sureler: [280, 190, 190, 0] },
  /** Kuzu'nun hizasına inip stetoskobu çocuğa uzatır */
  'kino-egil': { kareler: z.kinoEgil, sureler: [200, 200, 220, 0] },
  /** eğilmişken doğrulur (uzatmanın tersi) */
  'kino-dogrul': { kareler: [z.kinoEgil[2], z.kinoEgil[1], z.kinoEgil[0]], sureler: [200, 200, 0] },
  /** güler: omuzlar iki kez sallanır */
  'kino-gul': { kareler: [z.kinoGul[0], z.kinoGul[1], z.kinoGul[2], z.kinoGul[1], z.kinoGul[2], z.kinoGul[3]], sureler: [180, 180, 240, 180, 240, 0] },
} as const satisfies Record<string, Dizi>;
export type DiziAdi = keyof typeof DIZI;

/** Dizinin toplam süresi (döngüsüz kısım, ms). */
export const diziSuresi = (d: Dizi): number => d.sureler.reduce((a, b) => a + b, 0);

/** Dizi başladıktan t ms sonra hangi çizim görünür. Dizi bitince son karede durur; `donus` varsa oradan döner. */
export function kareSec(d: Dizi, t: number): { kare: string; indeks: number; bitti: boolean } {
  const n = d.kareler.length;
  let kalan = Math.max(0, t);
  for (let i = 0; i < n; i++) {
    const s = d.sureler[i];
    if (s <= 0 || kalan < s) return { kare: d.kareler[i], indeks: i, bitti: s <= 0 && d.donus === undefined };
    kalan -= s;
  }
  if (d.donus === undefined) return { kare: d.kareler[n - 1], indeks: n - 1, bitti: true };
  const dongu = d.sureler.slice(d.donus).reduce((a, b) => a + b, 0);
  if (dongu <= 0) return { kare: d.kareler[n - 1], indeks: n - 1, bitti: true };
  kalan %= dongu;
  for (let i = d.donus; i < n; i++) {
    if (kalan < d.sureler[i]) return { kare: d.kareler[i], indeks: i, bitti: false };
    kalan -= d.sureler[i];
  }
  return { kare: d.kareler[n - 1], indeks: n - 1, bitti: false };
}

/** Göz kırpma: kapalı göz çizimi yaklaşık üç film karesi (130 ms) görünür. */
export const KIRPMA_MS = 130;
/** Verilen anlarda (ms, adımın başından) kırpma var mı. */
export const kirpiyorMu = (anlar: readonly number[], t: number): boolean => anlar.some(a => t >= a && t < a + KIRPMA_MS);
