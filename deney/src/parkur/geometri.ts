// Deneyler · Zincirleme Top Parkuru (Paket Deney-Y1). Bütün ölçüler fon pikseli (1672 × 941), Astra'nın brief'iyle birebir
// (CLAUDE-ASTRA-MESAJLAR.md 22 Kasım 16:0x ve ek ölçü notu). Fizik (fizik.ts) ve çizimlerin yerleşimi (main.ts) buradan okur.

export const FON = { w: 1672, h: 941 } as const;
export type Nokta = { x: number; y: number };
export type Kutu = { x: number; y: number; w: number; h: number };
export type Dogru = readonly [Nokta, Nokta];
const n = (x: number, y: number): Nokta => ({ x, y });

/** Parkur zemini: dominolar, zil, rampa ve trambolin ayakları bu çizgiye basar (masanın uzak yarısı). */
export const ZEMIN_Y = 690;
/** Masanın arka kenarı: Kino'nun patileri, Ceren'in elleri. */
export const MASA_ARKA_Y = 470;
export const TOP_R = 33;

/** Fondaki başlangıç kulesi: düz platform (top burada bekler) ve sağa inen başlangıç rampası. */
export const PLATFORM: Dogru = [n(80, 300), n(170, 300)];
export const BASLANGIC_RAMPA: Dogru = [n(170, 300), n(430, 350)];
export const TOP_BASI: Nokta = n(128, 300 - TOP_R);

/** Kırmızı kol: taban kulenin önünde; sap pivot etrafında 0° → 55° döner. */
export const KOL = {
  taban: { x: 40, y: 410, w: 140, h: 160 } as Kutu,
  pivot: n(110, 520),
  sap: { w: 140, h: 200, pivot: n(70, 190) },
  aci: 55,
} as const;

export type ParcaId = 'rampa' | 'huni' | 'trambolin';
export const PARCALAR: readonly ParcaId[] = ['rampa', 'huni', 'trambolin'];

/**
 * Çocuğun yerleştirdiği parçalar: çizimin yerindeki kutusu ve fiziğin kullandığı çizgiler. Akış (ONERI-10 Tur 2):
 * başlangıç rampası → köprü rampa → trambolin → top havada yay çizip huniye yukarıdan düşer → huninin çıkış kanalı → dominolar.
 */
export const PARCA = {
  /** Sarı köprü rampa: başlangıç rampasının ucundan trambolinin üstüne. */
  rampa: { kutu: { x: 440, y: 360, w: 240, h: 330 } as Kutu, yuzey: [n(450, 372), n(650, 412)] as Dogru },
  /** Turuncu trambolin: bez y 622, x 705…915; yan yüzleri x 698 ve 922 (kaçan top çarpar). */
  trambolin: {
    kutu: { x: 690, y: 602, w: 240, h: 90 } as Kutu, yuzey: [n(705, 622), n(915, 622)] as Dogru,
    yanlar: [[n(698, 626), n(698, 690)], [n(922, 626), n(922, 690)]] as readonly Dogru[],
  },
  /**
   * Mor huni, iki ayaklı sehpasında: ağız x 935…1105 (y 400), çıkış ağzı x 978…1062 (y 560), çıkışın altında sağa inen
   * kanal (985, 590) → (1135, 650): top kanaldan ilk dominoya yuvarlanır. Sehpanın sol ayağı x 975 (kaçan top çarpar).
   */
  huni: {
    kutu: { x: 920, y: 388, w: 230, h: 302 } as Kutu,
    agizY: 400, agizSol: 935, agizSag: 1105, cikisY: 560, cikisSol: 978, cikisSag: 1062,
    kanal: [n(985, 590), n(1135, 650)] as Dogru,
    ayak: [n(975, 600), n(975, 690)] as Dogru,
  },
} as const;
export const HUNI_ORTA = (PARCA.huni.cikisSol + PARCA.huni.cikisSag) / 2;

/** Dominolar: gövde 44 × 140, zeminde; ortaları. Aralık 90: bir domino devrilme açısını (≈17°) geçince yanındakine değer. */
export const DOMINO = { w: 44, h: 140, ortalar: [1180, 1270, 1360, 1450] as const, renkler: ['kirmizi', 'sari', 'yesil', 'mavi'] as const };
/** Masa zili: tuval 150 × 110, tabanı zeminde; düğmenin üstü (1560, 592). */
export const ZIL = { kutu: { x: 1485, y: ZEMIN_Y - 108, w: 150, h: 110 } as Kutu, dugme: n(1560, 592) };

/** Trambolinden fırlayan topun hedefi: huninin ağzının ortası (topun merkezi), yukarıdan iner. */
export const TRAMBOLIN_HEDEF: Nokta = n((PARCA.huni.agizSol + PARCA.huni.agizSag) / 2, PARCA.huni.agizY - 8);
export const TRAMBOLIN_UCUS = 0.9;

/** Karakterler masanın arkasında (patiler/eller y 470). */
export const KINO_KUTU: Kutu = { x: 360, y: MASA_ARKA_Y - 400, w: 520, h: 420 };
export const CEREN_KUTU: Kutu = { x: 1250, y: MASA_ARKA_Y - 440, w: 420, h: 460 };

/**
 * Ön tepsi (fonda; onaylı anahtar karedeki gibi x 380…1290, y 700…825, üç bölme) ve bölmelerin ortaları. Tepside her
 * parça kendi oranıyla bölmeye sığacak kadar küçülür; dokunma alanı bölmenin genişliği ve en az 160 px yükseklik.
 */
export const TEPSI = { kutu: { x: 380, y: 700, w: 910, h: 125 } as Kutu, bolmeler: [n(535, 762), n(835, 762), n(1135, 762)], bolme: { w: 280, h: 110 }, dokunma: 160 };
/** Parçanın tepsideki ölçeği: bölmenin %92'sine sığar. */
/**
 * Tepsideki parçanın ölçeği: bölmenin enine sığar; boyu bölmeden uzun parça (rampa, huni) en az 0,6 ölçekte kalır ve tepsiden
 * yukarı taşar (kalite denetimi 22: rampa 0,31 ölçekte ince bir çizgi gibiydi). Taban tepsinin içinde (main.ts → tepsiyeKoy).
 */
export const tepsiOlcegi = (k: Kutu) => Math.min((0.92 * TEPSI.bolme.w) / k.w, Math.max((0.92 * TEPSI.bolme.h) / k.h, 0.6));

export type Yas = 'minik' | 'dort' | 'bes';
/** Yaşa göre eksik parçalar (CEVAP-09 Yön 1, ONERI-10 §2B): 2–3 yaş bir, 4 yaş iki, 5+ üç. */
export const EKSIK: Record<Yas, readonly ParcaId[]> = {
  minik: ['rampa'],
  dort: ['rampa', 'trambolin'],
  bes: ['rampa', 'huni', 'trambolin'],
};
