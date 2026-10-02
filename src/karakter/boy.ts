/**
 * Karakter boyları: tek tablo (Barış, 2026-10-01: "İnsan karakterler hep küçük duruyor, perspektif olarak yanlış").
 *
 * Mino ve Kino küçük kedi / köpek yavrusu; bir çocuk onların yanında belirgin şekilde uzun: Mino çocuğun göğsüne ya da
 * omzuna gelir. Anne çocuktan ~1.35 kat uzun. Bebek Ege oturan hâliyle Mino'dan biraz büyük.
 *
 * Boylar Mino'nun görünen boyu cinsinden (kulak / saç tepesinden ayak tabanına, ayakta; Ege oturarak). Bir sahnede
 * Mino'nun kutusu seçilir (film: JSON'daki w, maceralar: bölümün Mino genişliği); herkesin kutusu buradan hesaplanır:
 * boyGenislik(ad, minoW). Önden ve yan (-profil) iskeletler farklı ölçekte çizildi (Can'ın yan görünüşü önden
 * çiziminden %20 uzun): ikisi de CIZIM'deki kendi ölçüsüyle aynı boya getirilir.
 *
 * Kullananlar: film (film/src/oyuncu.ts ayak payı, content/film/*.json genişlikleri: tests/unit/film.test.ts denetler),
 * Sesli Maceralar (Ege: ege.ts, ege-cocuk.ts; Salıncak: salincak.ts, salincak-karakter.ts; Elektrik: Can'ın penceresi).
 */

/** Çizimin kutusu [en, boy] ve içindeki figürün başın tepesi / ayak tabanı (kutu birimi, üstten) */
export interface Cizim {
  kutu: [number, number];
  tepe: number;
  taban: number;
}

const K = (tepe: number, taban: number): Cizim => ({ kutu: [2048, 2048], tepe, taban });

/**
 * Ölçüler: ham çizim, varsayılan duruş (gizli ekler kapalı), opak piksellerin sınırı (2026-10-01; ölçüm betiği
 * tuvale çizip alfa > 60 satırlarını bulur). Mino: src/mino/mino-svg.ts (viewBox 1360×1790; kulak uçları kutunun
 * hemen altında, ayaklar kutunun dibinde).
 */
export const CIZIM: Record<string, Cizim> = {
  mino: { kutu: [1360, 1790], tepe: 16, taban: 1790 },
  kino: K(194, 1888),
  'kino-profil': K(190, 1890),
  'kino-34': K(124, 1928),
  ada: K(42, 2012),
  'ada-profil': K(116, 1936),
  'ada-34': K(106, 1946),
  can: K(250, 1814),
  'can-profil': K(90, 1960),
  elif: K(334, 1908),
  'elif-profil': K(108, 1940),
  deniz: K(128, 1918),
  'deniz-profil': K(106, 1944),
  zeynep: K(146, 1922),
  'zeynep-profil': K(92, 1956),
  /** bebek Ege oturuyor (assets/karakter-iskelet/ege) */
  ege: K(164, 1938),
  /** anne ayakta (assets/ege/anne.webp ve iskeleti aynı tuval) */
  anne: { kutu: [428, 1143], tepe: 8, taban: 1135 },
  kopek: K(310, 1808),
  'kopek-profil': K(306, 1822),
  tavsan: K(112, 1936),
  'tavsan-profil': K(112, 1948),
  ordek: K(92, 1982),
  'ordek-profil': K(92, 2006),
  ayi: K(312, 1880),
  inek: K(136, 1914),
  kus: K(142, 1906),
  maymun: K(88, 1954),
  /** Pamuk: komşunun beyaz kedisi (Dedektif Mino) */
  pamuk: K(192, 1889),
};

export const COCUKLAR = ['ada', 'can', 'elif', 'deniz', 'zeynep'] as const;

/** Boylar (Mino = 1) */
export const BOY = {
  mino: 1,
  /** Kino, Mino'dan biraz kısa (yavru köpek; filmlerdeki oran) */
  kino: 0.74,
  /** çocuklar (Ada, Can, Elif, Deniz, Zeynep): Mino göğüslerine / omuzlarına gelir */
  cocuk: 1.35,
  /** anne: çocuktan 1.35 kat */
  anne: 1.35 * 1.35,
  /** bebek Ege, oturan hâliyle */
  bebek: 1.1,
  // pazar hayvanları (müşteriler; film: Mino'nun Karpuzu): Mino'yla aynı kutuda çizildikleri boy
  kopek: 0.56,
  tavsan: 0.68,
  ordek: 0.71,
  ayi: 0.59,
  inek: 0.67,
  kus: 0.66,
  maymun: 0.7,
  /** Pamuk, Mino gibi bir kedi: aynı boy */
  pamuk: 1,
} as const;
export type BoyTipi = keyof typeof BOY;

/** Karakterin (ya da çiziminin: 'can-profil', 'kino-34') boy tipi; tabloda yoksa undefined */
export function boyTipi(ad: string): BoyTipi | undefined {
  const k = ad.replace(/-(profil|34)$/, '');
  if ((COCUKLAR as readonly string[]).includes(k)) return 'cocuk';
  if (k === 'ege') return 'bebek';
  return k in BOY ? (k as BoyTipi) : undefined;
}

/** Görünen boy / kutu genişliği */
export const boyOrani = (c: Cizim) => (c.taban - c.tepe) / c.kutu[0];
/** Kutunun altındaki boş pay (kutu yüksekliğinin oranı): ayak tabanı bu kadar yukarıda */
export const altPayi = (c: Cizim) => (c.kutu[1] - c.taban) / c.kutu[1];
/** Kutunun üstündeki boş pay (kutu yüksekliğinin oranı) */
export const ustPayi = (c: Cizim) => c.tepe / c.kutu[1];
/** Mino'nun görünen boyu (kutusunun genişliği minoW iken; aynı birimde) */
export const minoBoyu = (minoW: number) => minoW * boyOrani(CIZIM.mino);

/**
 * Karakterin kutu genişliği: Mino'nun kutusu minoW iken tablodaki boyda görünsün (aynı birimde).
 * ad: karakter ya da çizim adı ('zeynep', 'zeynep-profil'); c: çizimin ölçüsü (bölüme özel tuval ya da kırpım
 * kullanılıyorsa onunki; yoksa CIZIM[ad]). tip: tablodaki boy (yoksa addan).
 */
export function boyGenislik(ad: string, minoW: number, c: Cizim | undefined = CIZIM[ad], tip = boyTipi(ad)): number {
  if (!c || !tip) throw new Error(`Boy tablosunda yok: ${ad}`);
  return (BOY[tip] * minoBoyu(minoW)) / boyOrani(c);
}

/** Karakterin görünen boyu (kutu genişliği w iken) */
export const gorunenBoy = (ad: string, w: number, c: Cizim | undefined = CIZIM[ad]) => (c ? w * boyOrani(c) : 0);

/**
 * Yan görünüşün kutusu, önden kutuya göre (aynı boyda görünsünler): profil kutusu = önden kutu × yanOlcek(ad).
 * Profil yoksa 1.
 */
export function yanOlcek(ad: string): number {
  const on = CIZIM[ad];
  const yan = CIZIM[`${ad}-profil`];
  return on && yan ? boyOrani(on) / boyOrani(yan) : 1;
}
