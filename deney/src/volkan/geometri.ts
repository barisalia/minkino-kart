// Deneyler · Köpüren Renk Volkanı (Paket Deney-Y3, ikinci yazım 23 Kasım): fon pikseli (1672 × 941), Astra brief'iyle birebir
// (CLAUDE-ASTRA-MESAJLAR.md → "Paket Deney-Y3 … ikinci yazım"). Tezgâh soldan sağa: Lokum (arkada) ve şişe kasası → kolba →
// volkan → kavanoz ve kaşık; Kino sağda tezgâhın arkasında. Duvarda askılık (önlük, gözlük), sonra tarif kartı.
export const FON = { w: 1672, h: 941 } as const;
export type Kutu = { x: number; y: number; w: number; h: number };
export type Nokta = { x: number; y: number };
const K = (x: number, y: number, w: number, h: number): Kutu => ({ x, y, w, h });
export const merkez = (k: Kutu): Nokta => ({ x: k.x + k.w / 2, y: k.y + k.h / 2 });

/** Tezgâhın arka kenarı (fonda düz çizgi): Kino ve Lokum bu çizginin arkasında, çizimlerinin alt kenarı burada düz kesik. */
export const TEZGAH_Y = 640;
/** Tepsideki parçaların tabanı. */
export const TABAN_Y = 880;

// ----- Hazırlık -----
/** Askılıktaki önlük ve gözlük (askı çivileri fonda: önlük (480, 62), gözlük (715, 80)). */
export const ONLUK = K(380, 50, 200, 260);
export const GOZLUK = K(620, 70, 190, 110);
/** Tezgâh örtüsü: tepsinin üstünü kaplar (açılış kareleri aynı tuvalde, rulo solda). */
export const ORTU = K(80, 680, 1530, 245);

// ----- Karakterler -----
/** Kino (tezgâhın arkasında, sağda): 382 × 540, alt kenarı tezgâh çizgisinde. Göğsü (önlük ve gözlüğün bırakıldığı yer). */
export const KINO = K(1290, TEZGAH_Y - 540, 382, 540);
export const KINO_GOGUS: Nokta = { x: 1480, y: 400 };
/** Lokum (tezgâhın arkasında, solda; Kino'nun 0,63 boyu): 300 × 360. Patileri tuvalde (150, 190): getirdiği malzeme orada. */
export const LOKUM = K(20, TEZGAH_Y - 360, 300, 360);
export const LOKUM_EL: Nokta = { x: LOKUM.x + 150, y: LOKUM.y + 190 };

// ----- Malzemeler (tabanları y 880) -----
/** Ahşap şişe kasası: arka yüz (`sepet`) ve ön tahta (`sepet-on`) aynı tuvalde; şişeler aralarında durur. */
export const SEPET = K(60, 630, 380, 250);
/** Kasadaki üç şişe (110 × 260); alt kısımları ön tahtanın arkasında. Ağız tuvalde (55, 18). */
export const SISELER: Record<'kirmizi' | 'sari' | 'mavi', Kutu> = {
  kirmizi: K(82, 600, 110, 260), sari: K(195, 600, 110, 260), mavi: K(308, 600, 110, 260),
};
export const SISE_AGZI: Nokta = { x: 55, y: 18 };
/** Cam kolba: 250 × 320; ağzı tuvalde (125, 26); sıvı tuvalde y 140…300 arası dolar (3 ölçek). */
export const KOLBA = K(455, 560, 250, 320);
export const KOLBA_AGZI: Nokta = { x: 125, y: 26 };
export const KOLBA_SIVI = { ust: 140, alt: 300 } as const;
/** Oyuncak volkan: 500 × 550; krater ortası tuvalde (250, 40), eni 150. */
export const VOLKAN = K(640, 330, 500, 550);
export const KRATER: Nokta = { x: VOLKAN.x + 250, y: VOLKAN.y + 40 };
/** Kocaman volkan: aynı biçim 1,2 kat (600 × 660); krater tuvalde (300, 48), dünyada aynı x'te. */
export const DEV_OLCEK = 1.2;
export const DEV_VOLKAN = K(590, TABAN_Y - 660, 600, 660);
export const DEV_KRATER: Nokta = { x: DEV_VOLKAN.x + 300, y: DEV_VOLKAN.y + 48 };
/** Kraterdeki karbonat yığını: 150 × 56; tabanı tuvalde y 50 (kraterin ağzı). */
export const KARBONAT = K(KRATER.x - 75, KRATER.y - 50, 150, 56);
/** Kavanoz (karbonat dolu): 220 × 280; ağzı tuvalde (110, 26). */
export const KAVANOZ = K(1150, 600, 220, 280);
export const KAVANOZ_AGZI: Nokta = { x: KAVANOZ.x + 110, y: KAVANOZ.y + 26 };
/** Tahta kaşık (kavanozun önünde yatar): 290 × 95; çanağı tuvalde (55, 48). */
export const KASIK = K(1130, 805, 290, 95);
export const KASIK_CANAK: Nokta = { x: 55, y: 48 };
/** Lokum'un getirdiği malzemenin ölçeği (patilerinde). */
export const TASIMA_OLCEGI = { volkan: 0.42, kolba: 0.55, kavanoz: 0.6, sepet: 0.5 } as const;
/** Malzemenin tezgâhtaki yeri. */
export const MALZEME_YERI = { volkan: VOLKAN, kolba: KOLBA, kavanoz: KAVANOZ, sepet: SEPET } as const;
/** Malzeme yerinin ışığı (örtünün üstünde, tabanın ortasında): 300 × 90. */
export const yuvaIsigi = (k: Kutu): Kutu => K(k.x + k.w / 2 - 150, TABAN_Y - 55, 300, 90);

// ----- Köpük -----
/**
 * Köpük kareleri tek tuvalde (900 × 880), volkanı ve tepsiyi kaplar: krater tuvalde (450, 350). Kocaman volkanda tuval krater
 * çevresinde 1,2 kat büyür (volkanın biçimi aynı olduğu için akış yamaca oturur).
 */
export const KOPUK = K(KRATER.x - 450, KRATER.y - 350, 900, 880);
export const KOPUK_KRATER: Nokta = { x: 450, y: 350 };
/** Tepsideki köpük birikintileri (240 × 80, ortaları): 0 sol, 1 sağ (köpük karelerinin birikintileriyle aynı yer), 2–3 önde. */
export const BIRIKINTILER: readonly Nokta[] = [{ x: 585, y: 868 }, { x: 1195, y: 868 }, { x: 790, y: 893 }, { x: 1000, y: 893 }];
export const BIRIKINTI_BOYU = { w: 240, h: 80 } as const;
/** Sünger (Lokum getirir): 170 × 110. */
export const SUNGER = { w: 170, h: 110 } as const;

// ----- Kartlar ve ödül -----
/** Tarif kartı (duvarda, askılığın yerinde): iki küçük damla → büyük damla. Damlaların ortaları ve boyları tuvalde. */
export const TARIF = K(360, 36, 220, 160);
export const TARIF_DAMLALAR = [
  { x: 42, y: 50, w: 46, h: 58 }, { x: 42, y: 112, w: 46, h: 58 }, { x: 160, y: 82, w: 80, h: 100 },
] as const;
/** İkinci tur seçimi: iki iri kart (başka renk, kocaman volkan). */
export const SECIM_RENK = K(460, 250, 340, 340);
export const SECIM_DEV = K(872, 250, 340, 340);
/** Deney defteri (ortada): kapalı, açılan ve açık kareler aynı tuvalde (600 × 520). Sol sayfada yeni çıkartma, sağda koleksiyon. */
export const DEFTER = K(536, 150, 600, 520);
export const DEFTER_YENI = { x: 165, y: 255, w: 200 } as const;
export const DEFTER_RAF: readonly Nokta[] = [
  { x: 360, y: 190 }, { x: 450, y: 190 }, { x: 540, y: 190 }, { x: 360, y: 330 }, { x: 450, y: 330 }, { x: 540, y: 330 },
];
export const RAF_BOYU = 80;
