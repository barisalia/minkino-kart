/**
 * Dedektif Mino · Vaka 2 "Kino'nun Kayıp Atkısı": DOM'suz mantık (birim testli: tests/unit/dedektif-vaka2.test.ts).
 * Tasarım: ekip/senaryo/dedektif-vaka2.md. Kalıp Vaka 1'le aynı (ipucu → kart → "Demek ki…"); üstüne dört yeni
 * mekanik: ayak boyu ölçme (Halka 2), renk izi (Halka 3), ses ipucu (Halka 4), olayları sıralama (Halka 5).
 *
 * Mekân: bahçenin üç bölümü (assets/dedektif2/bahce-*.webp, 4096×2286): çamaşır ipi, çalılı yol, gölet kenarı.
 * Koordinatlar resmin oranı (x: en, y: boy; 0..1, sol üstten), boylar oda yüksekliğinin oranı (mantik.ts gibi).
 */
import D from '../../content/dedektif.json';
import { ODA_ORAN, type IpucuTanim, type Kadraj, type OdaId, type SorguHalkasi, type DosyaHalkasi } from './mantik';

export const V2 = D.vaka2;
export const M2 = V2.mino;
export const K2 = V2.kino;
export const O2 = V2.ordek;
export const G2 = V2.konuk;

export type BahceId = Extract<OdaId, 'bahce-ip' | 'bahce-yol' | 'bahce-golet'>;
export const BAHCELER: BahceId[] = ['bahce-ip', 'bahce-yol', 'bahce-golet'];

// ---------------------------------------------------------------- adımlar
export const ADIMLAR2 = ['giris', 'ne', 'kim', 'renk', 'ses', 'sira', 'final', 'roman'] as const;
export type Adim2 = (typeof ADIMLAR2)[number];
export type Halka2Id = 'ne' | 'kim' | 'renk' | 'ses' | 'sira';
export const adim2mi = (a: string | null): a is Adim2 => !!a && (ADIMLAR2 as readonly string[]).includes(a);

// ---------------------------------------------------------------- kartlar
export interface Kart2 {
  resim: string;
  renk: string;
  tepki?: string;
}
export const KARTLAR2: Record<string, Kart2> = {
  makas: { resim: 'v2/kart-makas', renk: '#ff7b7b', tepki: 'makas' },
  ruzgar: { resim: 'v2/kart-ruzgar', renk: '#8fd3ff' },
  yagmur: { resim: 'v2/kart-yagmur', renk: '#6fa8ea', tepki: 'yagmur' },
  'kopek-izi': { resim: 'v2/kart-kopek-izi', renk: '#c98a5a', tepki: 'kopek' },
  'tavsan-izi': { resim: 'v2/kart-tavsan-izi', renk: '#f2a7bd', tepki: 'tavsan' },
  'ordek-izi': { resim: 'v2/kart-ordek-izi', renk: '#ff9f43' },
  kurbaga: { resim: 'v2/kart-kurbaga', renk: '#6cc070' },
  ari: { resim: 'v2/kart-ari', renk: '#ffd23f' },
  ordek: { resim: 'v2/kart-ordek', renk: '#ffb347' },
};

// ---------------------------------------------------------------- halkalar
export interface Halka2 extends SorguHalkasi, DosyaHalkasi {
  id: Halka2Id;
  oda: BahceId;
  /** ipucunun arandığı / halkanın oynandığı kadraj */
  kadraj: Kadraj;
  ipuclari: IpucuTanim[];
}

export const HALKALAR2: Halka2[] = [
  {
    id: 'ne',
    oda: 'bahce-ip',
    kadraj: [0.24, 0.5, 0.82, 1],
    ipuclari: [{ id: 'mandal', oda: 'bahce-ip', resim: 'v2/mandal', x: 0.535, y: 0.875, h: 0.05, don: 16, gizli: true }],
    soru: M2.mandal,
    kino: K2.hirsiz,
    kinoKart: 'makas',
    kartlar: ['makas', 'ruzgar', 'yagmur'],
    dogru: 'ruzgar',
    demekKi: M2.demek_ruzgar,
    demekResim: 'v2/kart-ruzgar',
  },
  {
    id: 'kim',
    oda: 'bahce-yol',
    kadraj: [0.26, 0.56, 0.76, 1],
    ipuclari: [
      { id: 'ordek-izi', oda: 'bahce-yol', resim: 'v2/ordek-izi', x: 0.49, y: 0.838, h: 0.085, gizli: true },
      { id: 'iplik', oda: 'bahce-yol', resim: 'v2/iplik-kirmizi', x: 0.538, y: 0.874, h: 0.024, don: -10, gizli: true },
    ],
    soru: M2.iz_uyar,
    kino: K2.karabas,
    kinoKart: 'kopek-izi',
    kartlar: ['kopek-izi', 'tavsan-izi', 'ordek-izi'],
    dogru: 'ordek-izi',
    demekKi: M2.demek_ordek,
    demekResim: 'v2/kart-ordek-izi',
  },
  {
    id: 'renk',
    oda: 'bahce-yol',
    kadraj: [0.34, 0.6, 0.88, 0.97],
    ipuclari: [],
    soru: M2.renk,
    kino: K2.mavi,
    kartlar: [],
    demekKi: M2.demek_golet,
    demekResim: 'v2/iplik-kirmizi',
  },
  {
    id: 'ses',
    oda: 'bahce-golet',
    kadraj: [0.1, 0.52, 0.9, 1],
    ipuclari: [],
    soru: M2.hangi_ses,
    kino: K2.hav,
    kartlar: ['kurbaga', 'ari', 'ordek'],
    dogru: 'ordek',
    demekKi: M2.demek_cali,
    demekResim: 'v2/kart-ordek',
  },
  {
    id: 'sira',
    oda: 'bahce-golet',
    kadraj: [0.5, 0.42, 1, 1],
    ipuclari: [],
    soru: M2.sirala,
    kartlar: [],
    demekKi: M2.demek_yanlis,
    demekResim: 'v2/atki-yerde',
  },
];
export const halka2 = (id: Halka2Id) => HALKALAR2.find((h) => h.id === id)!;
export const halka2Adimi = (a: Adim2): Halka2Id | null => (a === 'ne' || a === 'kim' || a === 'renk' || a === 'ses' || a === 'sira' ? a : null);

// ---------------------------------------------------------------- bahçe yerleşimi
/** Çamaşır ipi: iki direk arasında, mandallar ipte; ipin ortasında iki açık mandal rüzgârda sallanır */
export const IP = {
  /** ipin ortadaki boş bölümü (iki boyalı mandalın arası) */
  bos: { x0: 0.455, x1: 0.572, y: 0.452 },
  /** açık mandallar (ipte, sallanır) */
  mandallar: [
    { x: 0.49, y: 0.449, h: 0.05, don: 74 },
    { x: 0.538, y: 0.452, h: 0.05, don: 104 },
  ],
  /** ipin parladığı noktalar (makas kartı: "İp kesik değil ki!") */
  noktalar: [
    [0.262, 0.372],
    [0.31, 0.41],
    [0.36, 0.433],
    [0.41, 0.447],
    [0.46, 0.453],
    [0.51, 0.455],
    [0.56, 0.452],
    [0.61, 0.446],
    [0.66, 0.432],
    [0.71, 0.41],
    [0.755, 0.384],
  ] as [number, number][],
  /** anı: ipteki atkı (Halka 1 "demek ki" canlandırması) */
  atki: { x: 0.513, y: 0.425, h: 0.27 },
};

/** Çalılı yol: çamurlu parça (izler) ve iki iz yolu: kırmızı iplikler sağa (gölete), mavi ipler sola (Ada'ya) */
export interface Parca {
  tur: 'kirmizi' | 'mavi' | 'yaprak';
  x: number;
  y: number;
  h: number;
  don: number;
}
export const YOL_PARCALARI: Parca[] = [
  // kırmızı: çamurdan sağa, çalılara takılmış ve yolda (sırayla yükselen notalar)
  { tur: 'kirmizi', x: 0.585, y: 0.79, h: 0.022, don: -14 },
  { tur: 'kirmizi', x: 0.63, y: 0.856, h: 0.022, don: 8 },
  { tur: 'kirmizi', x: 0.675, y: 0.775, h: 0.022, don: -20 },
  { tur: 'kirmizi', x: 0.72, y: 0.86, h: 0.022, don: 12 },
  { tur: 'kirmizi', x: 0.77, y: 0.79, h: 0.022, don: -8 },
  { tur: 'kirmizi', x: 0.815, y: 0.865, h: 0.022, don: 16 },
  // mavi: Ada'nın balon ipi (çamurdan sola)
  { tur: 'mavi', x: 0.43, y: 0.79, h: 0.022, don: 10 },
  { tur: 'mavi', x: 0.385, y: 0.865, h: 0.022, don: -12 },
  { tur: 'mavi', x: 0.73, y: 0.73, h: 0.022, don: 18 },
  // yeşil yapraklar arada
  { tur: 'yaprak', x: 0.6, y: 0.905, h: 0.034, don: 30 },
  { tur: 'yaprak', x: 0.75, y: 0.912, h: 0.034, don: -40 },
  { tur: 'yaprak', x: 0.45, y: 0.885, h: 0.034, don: 60 },
];
export const kirmizilar = () => YOL_PARCALARI.filter((p) => p.tur === 'kirmizi');
/** Ada çalıların önünde, yolun solunda (ayak tabanı) */
export const ADA_YERI = { x: 0.27, y: 0.795 };

/** Gölet kenarı: üç büyük çalı (kutuları: resim oranı), her biri bir ses */
export type CaliSes = 'kurbaga' | 'ari' | 'ordek';
export interface Cali {
  ses: CaliSes;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}
export const CALILAR: Cali[] = [
  { ses: 'kurbaga', x0: 0.138, y0: 0.682, x1: 0.299, y1: 0.918 },
  { ses: 'ari', x0: 0.411, y0: 0.682, x1: 0.573, y1: 0.918 },
  { ses: 'ordek', x0: 0.697, y0: 0.684, x1: 0.859, y1: 0.922 },
];
/** Kırmızı iz gölette çalının önünde biter */
export const GOLET_PARCALARI: Parca[] = [
  { tur: 'kirmizi', x: 0.62, y: 0.95, h: 0.022, don: -12 },
  { tur: 'kirmizi', x: 0.67, y: 0.915, h: 0.022, don: 18 },
];
/** Yuva: üçüncü çalının önünde (ayak tabanı / yuvanın alt ortası) */
export const YUVA = { x: 0.778, y: 0.93 };

// ---------------------------------------------------------------- Halka 2: ayak boyu
/**
 * Fotoğraftaki (ordek-izi.webp) sağdaki iz: fotoğraf kutusunun oranı (resim kareye contain sığar). Kartlar ize
 * gerçek boylarında konur: ördek ayağı tam oturur, köpek patisi taşar (büyük), tavşan ayağı boydan boya aşar (uzun).
 */
export const IZ_YERI = { x: 0.678, y: 0.47, w: 0.25, don: -28 };
export const AYAK_BOYU: Record<'ordek-izi' | 'kopek-izi' | 'tavsan-izi', number> = { 'ordek-izi': 1, 'kopek-izi': 1.9, 'tavsan-izi': 2.7 };
/** Kart izin içine oturur mu: boyu ize göre %15'ten fazla farklıysa taşar ya da yüzer */
export type Uyum = 'tam' | 'tasar' | 'yuzer';
export const uyum = (oran: number): Uyum => (oran > 1.15 ? 'tasar' : oran < 0.85 ? 'yuzer' : 'tam');
/** Kino'nun patisi ize göre (şaka: "Benim ayağım minicik!") */
export const KINO_PATI = 0.45;

// ---------------------------------------------------------------- Halka 3: renk izi
/** Renk izi: yalnız kırmızılar sayılır; her kırmızı bir üst nota; mavi Ada'yı, yaprak rüzgârı gösterir. Kilitlenmez. */
export class RenkIzi {
  readonly alinan = new Set<number>();
  mavi = 0;
  constructor(readonly parcalar: readonly Parca[]) {}
  /** dokunuş: sonuç ve (kırmızıysa) kaçıncı kırmızı olduğu (nota) */
  dokun(i: number): { tur: Parca['tur']; sira: number; bitti: boolean } {
    const p = this.parcalar[i];
    if (!p) throw new Error(`parça yok: ${i}`);
    if (p.tur === 'kirmizi' && !this.alinan.has(i)) this.alinan.add(i);
    if (p.tur === 'mavi') this.mavi++;
    return { tur: p.tur, sira: p.tur === 'kirmizi' ? this.alinan.size - 1 : -1, bitti: this.bitti };
  }
  get kirmiziSayisi() {
    return this.parcalar.filter((p) => p.tur === 'kirmizi').length;
  }
  get bitti() {
    return this.alinan.size >= this.kirmiziSayisi;
  }
  /** sıradaki (alınmamış en soldaki) kırmızının sırası: kamera onu gösterir, yardımda o titrer */
  get siradaki(): number | null {
    // dizideki sıra izin yolu boyunca (yatayda soldan sağa; dikeyde yolun kıvrımı boyunca)
    const i = this.parcalar.findIndex((p, j) => p.tur === 'kirmizi' && !this.alinan.has(j));
    return i < 0 ? null : i;
  }
}

// ---------------------------------------------------------------- Halka 4: ses ipucu
export interface SesSonucu {
  dogru: boolean;
  /** yanlış kart kendi çalısına uçar (eşleşme gösterilir): o çalının sırası; ördek yanlış çalıdaysa null */
  kendiCalisi: number | null;
  yanlis: number;
  /** 2 yanlıştan sonra doğru çalının sesi bir kez daha, yüksek */
  parla: boolean;
}
/** Üç çalı dinlenir; sonra "Ördek hangi sesi çıkarır?": ördek kartı ördeğin çalısına. Ceza yok, kilitlenmez. */
export class SesSorusu {
  readonly dinlenen = new Set<number>();
  yanlis = 0;
  cozuldu = false;
  readonly eslesen = new Set<string>();
  constructor(readonly calilar: readonly Cali[] = CALILAR) {}
  dinle(i: number) {
    if (i >= 0 && i < this.calilar.length) this.dinlenen.add(i);
  }
  get hepsiDinlendi() {
    return this.dinlenen.size >= this.calilar.length;
  }
  /** sıradaki dinlenmemiş çalı (yardım ve dikeyde kamera) */
  get siradaki(): number | null {
    for (let i = 0; i < this.calilar.length; i++) if (!this.dinlenen.has(i)) return i;
    return null;
  }
  get dogruCali() {
    return this.calilar.findIndex((c) => c.ses === 'ordek');
  }
  birak(kart: string, cali: number): SesSonucu {
    if (kart === 'ordek' && cali === this.dogruCali) {
      this.cozuldu = true;
      return { dogru: true, kendiCalisi: null, yanlis: this.yanlis, parla: false };
    }
    this.yanlis++;
    const kendi = kart === 'ordek' ? null : this.calilar.findIndex((c) => c.ses === kart);
    if (kendi !== null && kendi >= 0) this.eslesen.add(kart);
    return { dogru: false, kendiCalisi: kendi !== null && kendi >= 0 ? kendi : null, yanlis: this.yanlis, parla: this.yanlis >= 2 };
  }
}

// ---------------------------------------------------------------- Halka 5: sıralama
/** Olay kartları (roman karelerinin ilk üçü): rüzgâr uçuruyor · ördek buluyor · ördek yumurtalara örtüyor */
export const OLAYLAR = [
  { sira: 1, resim: 'v2/roman-1' },
  { sira: 2, resim: 'v2/roman-2' },
  { sira: 3, resim: 'v2/roman-3' },
];
/** Üç kare: her kareye yalnız kendi olayı oturur; yanlış kart nazikçe geri seker. Kilitlenmez. */
export class Siralama {
  readonly yerler: (number | null)[] = [null, null, null];
  yanlis = 0;
  /** olay i (0..2) kare j'ye (0..2) bırakıldı */
  koy(olay: number, kare: number): { dogru: boolean; bitti: boolean } {
    if (kare < 0 || kare > 2 || olay < 0 || olay > 2) throw new Error('kare / olay yok');
    if (this.yerler[kare] !== null || this.yerler.includes(olay)) return { dogru: false, bitti: this.bitti };
    if (olay === kare) {
      this.yerler[kare] = olay;
      return { dogru: true, bitti: this.bitti };
    }
    this.yanlis++;
    return { dogru: false, bitti: this.bitti };
  }
  /** dokununca kart ilk boş kareye denenir */
  get siradaki(): number | null {
    const i = this.yerler.indexOf(null);
    return i < 0 ? null : i;
  }
  get bitti() {
    return this.yerler.every((x) => x !== null);
  }
}

/** Olay kartlarının ekrandaki sırası: karışık ama hiçbir kart kendi karesinin altında değil (çocuk düşünsün) */
export function olaySirasi(rnd: () => number = Math.random): number[] {
  const hepsi = [
    [1, 2, 0],
    [2, 0, 1],
  ];
  return hepsi[Math.floor(rnd() * hepsi.length) % hepsi.length];
}

// ---------------------------------------------------------------- final ve roman
/** Yumurtalara kaç kez dokunulunca çatlar */
export const CATLAMA = 3;
export const ROMAN2 = [
  { sira: 1, resim: 'v2/roman-1' },
  { sira: 2, resim: 'v2/roman-2' },
  { sira: 3, resim: 'v2/roman-3' },
  { sira: 4, resim: 'v2/roman-4' },
];

// ---------------------------------------------------------------- kadrajlar (oda oranı)
export const KADRAJ2 = {
  giris: [0.12, 0.28, 0.88, 1],
  ip: [0.2, 0.3, 0.82, 1],
  yol: [0.2, 0.5, 0.9, 1],
  calilar: [0.1, 0.52, 0.9, 1],
  cali3: [0.6, 0.5, 0.95, 1],
  final: [0.52, 0.45, 1, 1],
} satisfies Record<string, Kadraj>;

/** Dosyadaki beş gözün halkaları (dosya şeridi bunlardan kurulur) */
export const DOSYA2: readonly DosyaHalkasi[] = HALKALAR2;

// ---------------------------------------------------------------- dikey bahçe (assets/dedektif2/bahce-*-dikey, 1536×2752)
/**
 * Dikey ekranda (boy > en) her bahçe bölümü kendi 9:16 çizimidir (Vaka 1'in film/ev/oda-dikey kalıbı): ipuçları,
 * iz parçaları, Ada, çalılar ve yuva o resmin görünen zeminine. bahceYerlesim(oda, true) o bölümün tablolarını yerinde
 * dikey değerlere çevirir, false yatayı geri koyar (vaka her açılışta yeniden kurulur; dosya yoksa o bölüm yatay kalır).
 * Kamera dikeyde az yaklaşır (dunya.ts: kadraj tam en); koordinatlar ekranın ortasına, karakterlerin arasına göre.
 */
export const BAHCE_DIKEY_ORAN = 1536 / 2752;
const kirmizi = (x: number, y: number, don: number): Parca => ({ tur: 'kirmizi', x, y, h: 0.022, don });
type Yer = { x: number; y: number; h: number };
const DIKEY2 = {
  'bahce-ip': {
    ip: {
      bos: { x0: 0.46, x1: 0.57, y: 0.103 },
      mandallar: [
        { x: 0.49, y: 0.103, h: 0.026, don: 74 },
        { x: 0.535, y: 0.104, h: 0.026, don: 104 },
      ],
      noktalar: [
        [0.27, 0.08],
        [0.31, 0.088],
        [0.36, 0.094],
        [0.41, 0.099],
        [0.46, 0.102],
        [0.51, 0.104],
        [0.56, 0.103],
        [0.61, 0.1],
        [0.66, 0.096],
        [0.71, 0.09],
        [0.75, 0.083],
      ] as [number, number][],
      atki: { x: 0.513, y: 0.09, h: 0.11 },
    },
    ipucu: { mandal: { x: 0.53, y: 0.5, h: 0.045 } } as Record<string, Yer>,
    kadraj: { ne: [0, 0, 1, 0.7] } as Partial<Record<Halka2Id, Kadraj>>,
    kadraj2: { giris: [0, 0, 1, 0.6], ip: [0, 0, 1, 0.55] } as Record<string, Kadraj>,
  },
  'bahce-yol': {
    parcalar: [
      // kırmızı: çamurdan yolun kıvrımı boyunca yukarı (sırayla yükselen notalar)
      kirmizi(0.27, 0.785, -14),
      kirmizi(0.2, 0.72, 8),
      kirmizi(0.26, 0.655, -20),
      kirmizi(0.38, 0.61, 12),
      kirmizi(0.52, 0.575, -8),
      kirmizi(0.66, 0.535, 16),
      // mavi: Ada'nın balon ipi (Ada yolun yukarısında, sağda)
      { tur: 'mavi', x: 0.66, y: 0.852, h: 0.022, don: 10 },
      { tur: 'mavi', x: 0.34, y: 0.7, h: 0.022, don: -12 },
      { tur: 'mavi', x: 0.72, y: 0.49, h: 0.022, don: 18 },
      { tur: 'yaprak', x: 0.45, y: 0.66, h: 0.034, don: 30 },
      { tur: 'yaprak', x: 0.56, y: 0.885, h: 0.034, don: -40 },
      { tur: 'yaprak', x: 0.3, y: 0.87, h: 0.034, don: 60 },
    ] as Parca[],
    ada: { x: 0.78, y: 0.465 },
    ipucu: { 'ordek-izi': { x: 0.44, y: 0.83, h: 0.065 }, iplik: { x: 0.56, y: 0.836, h: 0.022 } } as Record<string, Yer>,
    kadraj: { kim: [0, 0.5, 1, 1], renk: [0, 0.4, 1, 0.95] } as Partial<Record<Halka2Id, Kadraj>>,
    kadraj2: { yol: [0, 0.4, 1, 1] } as Record<string, Kadraj>,
  },
  'bahce-golet': {
    // üç çalı ekranın dikey ortasında, gölet arkada biraz sağda
    calilar: [
      { x0: 0.067, y0: 0.437, x1: 0.342, y1: 0.572 },
      { x0: 0.35, y0: 0.44, x1: 0.62, y1: 0.575 },
      { x0: 0.653, y0: 0.442, x1: 0.925, y1: 0.576 },
    ],
    son: [kirmizi(0.6, 0.665, -12), kirmizi(0.68, 0.63, 18)],
    yuva: { x: 0.755, y: 0.635 },
    ipucu: {} as Record<string, Yer>,
    kadraj: { ses: [0, 0.16, 1, 0.86], sira: [0, 0.2, 1, 0.9] } as Partial<Record<Halka2Id, Kadraj>>,
    kadraj2: { calilar: [0, 0.16, 1, 0.86], cali3: [0, 0.16, 1, 0.86], final: [0, 0.25, 1, 0.95] } as Record<string, Kadraj>,
  },
};
const YATAY2 = structuredClone({
  ip: IP,
  parcalar: YOL_PARCALARI,
  ada: ADA_YERI,
  calilar: CALILAR,
  son: GOLET_PARCALARI,
  yuva: YUVA,
  kadraj: Object.fromEntries(HALKALAR2.map((hk) => [hk.id, hk.kadraj])) as Record<Halka2Id, Kadraj>,
  kadraj2: KADRAJ2 as Record<string, Kadraj>,
  ipucu: Object.fromEntries(HALKALAR2.flatMap((hk) => hk.ipuclari).map((t) => [t.id, { x: t.x, y: t.y, h: t.h }])) as Record<string, Yer>,
  oran: ODA_ORAN['bahce-ip'],
});
/** Hangi bahçe bölümü dikey kuruldu (bahceYerlesim son çağrısı) */
export const BAHCE_DIKEY: Record<BahceId, boolean> = { 'bahce-ip': false, 'bahce-yol': false, 'bahce-golet': false };

export function bahceYerlesim(oda: BahceId, dikey: boolean) {
  BAHCE_DIKEY[oda] = dikey;
  ODA_ORAN[oda] = dikey ? BAHCE_DIKEY_ORAN : YATAY2.oran;
  const d = DIKEY2[oda];
  const y = structuredClone(YATAY2);
  const k2 = KADRAJ2 as Record<string, Kadraj>;
  for (const ad of Object.keys(d.kadraj2)) k2[ad] = [...(dikey ? d.kadraj2[ad] : y.kadraj2[ad])] as Kadraj;
  for (const hk of HALKALAR2) {
    const dk = d.kadraj[hk.id];
    if (dk) hk.kadraj = [...(dikey ? dk : y.kadraj[hk.id])] as Kadraj;
    for (const t of hk.ipuclari) if (d.ipucu[t.id]) Object.assign(t, dikey ? d.ipucu[t.id] : y.ipucu[t.id]);
  }
  if (oda === 'bahce-ip') {
    const k = dikey ? structuredClone(DIKEY2['bahce-ip'].ip) : y.ip;
    Object.assign(IP.bos, k.bos);
    Object.assign(IP.atki, k.atki);
    IP.mandallar.splice(0, IP.mandallar.length, ...k.mandallar);
    IP.noktalar.splice(0, IP.noktalar.length, ...k.noktalar);
  } else if (oda === 'bahce-yol') {
    YOL_PARCALARI.splice(0, YOL_PARCALARI.length, ...structuredClone(dikey ? DIKEY2['bahce-yol'].parcalar : y.parcalar));
    Object.assign(ADA_YERI, dikey ? DIKEY2['bahce-yol'].ada : y.ada);
  } else {
    const g = DIKEY2['bahce-golet'];
    CALILAR.forEach((c, i) => Object.assign(c, dikey ? g.calilar[i] : y.calilar[i]));
    GOLET_PARCALARI.splice(0, GOLET_PARCALARI.length, ...structuredClone(dikey ? g.son : y.son));
    Object.assign(YUVA, dikey ? g.yuva : y.yuva);
  }
}
