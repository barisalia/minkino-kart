/**
 * Dedektif Mino · Vaka 3 "Kaybolan Yıldız Kurabiyeler": DOM'suz mantık (birim testli: tests/unit/dedektif-vaka3.test.ts).
 * Tasarım: ekip/senaryo/dedektif-vaka3.md. Kalıp Vaka 1 ve 2 ile aynı (büyüteçle ipucu → 3 resimli kart → "Demek ki…" →
 * çizgi roman); yeni mekanikler: boş yerleri dokunarak sayma (Halka 1), yıldız şeker izi (Halka 3), üç kovuk araması,
 * finalde sayma ve kurabiyeyi Fındık'ın patisine sürükleme.
 *
 * Mekân (assets/dedektif3, 4096×2286; çizim yoksa resimler3.ts'nin yer tutucusu aynı oranda): Pasta Otobüsü'nün içi,
 * otobüsün yanı (park), büyük ağaç, ağacın kovuğunun içi (kiler). Koordinatlar resmin oranı (x: en, y: boy; 0..1, sol
 * üstten), boylar oda yüksekliğinin oranı (mantik.ts gibi).
 *
 * YAYIN: Vaka 3 henüz oyunda seçilemez (VAKA3_YAYINDA = false). Denemek için: /dedektif/?vaka=3 (doğrudan vaka) ya da
 * /dedektif/?vaka3=1 (seçim ekranında üçüncü dosya). Açmak için VAKA3_YAYINDA = true.
 */
import D from '../../content/dedektif.json';
import { type DosyaHalkasi, type IpucuTanim, type Kadraj, type OdaId, type SorguHalkasi } from './mantik';

export const V3 = D.vaka3;
export const M3 = V3.mino;
export const K3 = V3.kino;
export const F3 = V3.findik;
/** yalnız balonda yazan sözler (seslendirilmez) */
export const B3 = V3.balon;

// ---------------------------------------------------------------- yayın bayrağı
/** Vaka 3 oyunda (seçim ekranı, Vaka Dosyam) görünsün mü. false: yalnız ?vaka=3 / ?vaka3=1 ile açılır. */
export const VAKA3_YAYINDA = false;
/** Bu sayfada Vaka 3 görünür mü (bayrak ya da adres: ?vaka=3, ?vaka3=1, test kısayolu ekran=vaka3) */
export function vaka3Gorunur(adres: string = typeof location !== 'undefined' ? location.search : ''): boolean {
  if (VAKA3_YAYINDA) return true;
  const q = new URLSearchParams(adres);
  return q.get('vaka') === '3' || q.has('vaka3') || q.get('ekran') === 'vaka3';
}

export type Sahne3 = Extract<OdaId, 'otobus-ic' | 'otobus-yani' | 'agac' | 'kiler'>;
export const SAHNELER3: Sahne3[] = ['otobus-ic', 'otobus-yani', 'agac', 'kiler'];

// ---------------------------------------------------------------- adımlar
export const ADIMLAR3 = ['giris', 'sayi', 'cikis', 'yol', 'kim', 'kovuk', 'neden', 'final', 'roman'] as const;
export type Adim3 = (typeof ADIMLAR3)[number];
export type Halka3Id = 'sayi' | 'cikis' | 'yol' | 'kim' | 'neden';
export const adim3mu = (a: string | null): a is Adim3 => !!a && (ADIMLAR3 as readonly string[]).includes(a);
export const halka3Adimi = (a: Adim3): Halka3Id | null => (a === 'sayi' || a === 'cikis' || a === 'yol' || a === 'kim' || a === 'neden' ? a : null);

// ---------------------------------------------------------------- kartlar
/** Kart: resim 'v3/<ad>' (resimler3.ts: assets/dedektif3 ya da yer tutucu); hepsi aynı çerçevede, aynı boyda */
export interface Kart3 {
  resim: string;
  renk: string;
  /** yanlış kartın kendi sahnesi (sorgu3.ts) */
  tepki?: string;
}
export const KARTLAR3: Record<string, Kart3> = {
  // Halka 1: tepsinin resmi, o kadar yıldız kurabiye (kodla dizilir: resimler3.ts → kart-kurabiye-n)
  'kurabiye-2': { resim: 'v3/kart-kurabiye-2', renk: '#ffd86b', tepki: 'iki' },
  'kurabiye-4': { resim: 'v3/kart-kurabiye-4', renk: '#ffd86b' },
  'kurabiye-6': { resim: 'v3/kart-kurabiye-6', renk: '#ffd86b', tepki: 'alti' },
  // Halka 2: otobüsün kendi parçaları
  kapi: { resim: 'v3/kart-kapi', renk: '#f49ab8', tepki: 'kapi' },
  pencere: { resim: 'v3/kart-pencere', renk: '#f49ab8' },
  baca: { resim: 'v3/kart-baca', renk: '#f49ab8', tepki: 'baca' },
  // Halka 3: nesnenin kendisi
  tohum: { resim: 'v3/ipucu-tohum', renk: '#e9d8a6', tepki: 'tohum' },
  havuc: { resim: 'v3/havuc', renk: '#ff9f43', tepki: 'havuc' },
  'yildiz-seker': { resim: 'v3/ipucu-yildiz-seker', renk: '#ffd23f' },
  // Halka 4: hayvanların kendisi (önden, aynı duruşta)
  kus: { resim: 'v3/kart-kus', renk: '#7fb4e6', tepki: 'kus' },
  sincap: { resim: 'v3/kart-sincap', renk: '#f0904a' },
  kirpi: { resim: 'v3/kart-kirpi', renk: '#b98a5e', tepki: 'kirpi' },
  // Halka 5: Fındık'ın üç hâli
  ac: { resim: 'v3/kart-sincap-ac', renk: '#ffb36b', tepki: 'ac' },
  kiler: { resim: 'v3/kart-sincap-kiler', renk: '#9fd0f0' },
  parti: { resim: 'v3/kart-sincap-parti', renk: '#ff8fb8', tepki: 'parti' },
};

// ---------------------------------------------------------------- halkalar
export interface Halka3 extends SorguHalkasi, DosyaHalkasi {
  id: Halka3Id;
  oda: Sahne3;
  /** ipucunun arandığı kadraj */
  kadraj: Kadraj;
  ipuclari: IpucuTanim[];
  /** delil fotoğrafı (yoksa ilk ipucunun fotoğrafı) ve ikinci fotoğraf */
  foto?: string;
  ekFoto?: string;
}

/**
 * İpuçları. 'kirp': ipucu sahnenin kendi resminden kırpılmış bir parçadır (kovuğun içindeki kurabiyeler, kar tanesi:
 * çizim zaten arka planda; kopya aynı yere oturur, büyüteç onu "inceler"). Gizli olmayanlar çıplak gözle de görünür.
 */
export interface IpucuTanim3 extends IpucuTanim {
  kirp?: { w: number; h: number };
}

export const HALKALAR3: Halka3[] = [
  {
    id: 'sayi',
    oda: 'otobus-ic',
    kadraj: [0.25, 0.56, 0.59, 0.95],
    // tepsinin dört boş yerindeki un halkaları (tek ipucu: dördü birlikte)
    ipuclari: [{ id: 'un', oda: 'otobus-ic', resim: 'v3/un-halka', foto: 'v3/foto-tepsi', x: 0.42, y: 0.78, h: 0.15, gizli: true }],
    foto: 'v3/foto-tepsi',
    soru: M3.kac_kayip,
    kino: K3.hepsi,
    kinoKart: 'kurabiye-6',
    kartlar: ['kurabiye-2', 'kurabiye-4', 'kurabiye-6'],
    dogru: 'kurabiye-4',
    demekKi: M3.demek_dort,
    demekResim: 'v3/kart-kurabiye-4',
  },
  {
    id: 'cikis',
    oda: 'otobus-ic',
    kadraj: [0.06, 0.02, 0.94, 0.96],
    ipuclari: [{ id: 'kirinti', oda: 'otobus-ic', resim: 'v3/ipucu-kirinti', x: 0.6, y: 0.683, h: 0.05, gizli: true }],
    soru: M3.nereden,
    kino: K3.kapidan,
    kinoKart: 'kapi',
    kartlar: ['kapi', 'pencere', 'baca'],
    dogru: 'pencere',
    demekKi: M3.demek_pencere,
    demekResim: 'v3/kart-pencere',
  },
  {
    id: 'yol',
    oda: 'otobus-yani',
    kadraj: [0.3, 0.52, 0.76, 0.98],
    ipuclari: [
      { id: 'tohum', oda: 'otobus-yani', resim: 'v3/ipucu-tohum', x: 0.46, y: 0.832, h: 0.06, gizli: true },
      { id: 'havuc', oda: 'otobus-yani', resim: 'v3/havuc', x: 0.51, y: 0.85, h: 0.06, don: -12, gizli: true },
      { id: 'seker', oda: 'otobus-yani', resim: 'v3/ipucu-yildiz-seker', x: 0.56, y: 0.832, h: 0.055, gizli: true },
    ],
    // soru girişteki kurabiye fotoğrafına bakarak sorulur (cevabın adı söylenmez)
    foto: 'v3/foto-kurabiye',
    soru: M3.ustunde,
    kino: K3.havuc,
    kinoCevap: M3.havuc_sevmez,
    kinoKart: 'havuc',
    kartlar: ['tohum', 'havuc', 'yildiz-seker'],
    dogru: 'yildiz-seker',
    demekKi: M3.demek_agac,
    demekResim: 'v3/demek-agac',
  },
  {
    id: 'kim',
    oda: 'agac',
    kadraj: [0.2, 0.42, 0.62, 1],
    ipuclari: [
      { id: 'el-izi', oda: 'agac', resim: 'v3/ipucu-el-izi', x: 0.365, y: 0.93, h: 0.075, gizli: true },
      { id: 'tuy', oda: 'agac', resim: 'v3/ipucu-tuy', x: 0.445, y: 0.76, h: 0.07, gizli: true },
    ],
    soru: M3.kim_yasiyor,
    kino: K3.kus,
    kinoKart: 'kus',
    kartlar: ['kus', 'sincap', 'kirpi'],
    dogru: 'sincap',
    demekKi: M3.demek_sincap,
    demekResim: 'v3/kart-sincap',
  },
  {
    id: 'neden',
    oda: 'kiler',
    kadraj: [0.1, 0.12, 0.9, 0.95],
    ipuclari: [
      { id: 'kurabiyeler', oda: 'kiler', resim: 'v3/foto-kiler-kurabiye', x: 0.567, y: 0.63, h: 0.2, gizli: false, kirp: { w: 0.2, h: 0.22 } },
      { id: 'kar-tanesi', oda: 'kiler', resim: 'v3/foto-kar-tanesi', x: 0.42, y: 0.33, h: 0.2, gizli: false, kirp: { w: 0.1, h: 0.2 } },
    ] as IpucuTanim3[],
    foto: 'v3/foto-kiler',
    ekFoto: 'v3/foto-kar-tanesi',
    soru: M3.neden,
    kino: K3.acikmis,
    kinoKart: 'ac',
    kartlar: ['ac', 'kiler', 'parti'],
    dogru: 'kiler',
    demekKi: M3.demek_kis,
    demekResim: 'v3/kart-sincap-kiler',
  },
];
export const halka3 = (id: Halka3Id) => HALKALAR3.find((h) => h.id === id)!;
/** Dosyadaki beş gözün halkaları */
export const DOSYA3: readonly DosyaHalkasi[] = HALKALAR3;

// ---------------------------------------------------------------- otobüsün içi (yer tutucu: pasta otobüsünün içi + tezgâh)
/**
 * Tepsi tezgâhın üstünde, pencerenin önünde: altı yer (3 × 2; arka sıra biraz yukarıda). Girişte iki kurabiye (0 ve 4),
 * dört boş yer un halkalı. Yerler tepsinin kutusunun oranı (x, y: kurabiyenin ortası).
 */
export const TEPSI = { x: 0.42, y: 0.855, w: 0.25 };
/** tepsi çiziminin boy / en oranı (yer-tutucu3.ts → tepsiSvg) */
export const TEPSI_ORAN = 0.36;
export const TEPSI_YERLERI: [number, number][] = [
  [0.26, 0.3],
  [0.5, 0.28],
  [0.74, 0.3],
  [0.24, 0.66],
  [0.5, 0.68],
  [0.76, 0.66],
];
/** girişte tepside kalan iki kurabiyenin yerleri (TEPSI_YERLERI sırası); öbür dördü boş */
export const KALAN = [0, 4];
export const BOS_YERLER = TEPSI_YERLERI.map((_, i) => i).filter((i) => !KALAN.includes(i));
/** kurabiyenin eni / tepsinin eni */
export const KURABIYE_EN = 0.2;
/** Otobüsün parçaları (oda oranı): pencere, pervaz (ön katman kesimi), kapı ve sürgüsü, tavandaki baca kapağı */
export const OTOBUS = {
  pencere: { x0: 0.355, y0: 0.27, x1: 0.645, y1: 0.69 },
  /** pervaz: pencerenin alt çerçevesi (ön katman: sahnenin kendi resminden kesilir; Fındık finalde arkasında durur) */
  pervaz: { x0: 0.34, y0: 0.655, x1: 0.66, y1: 0.725 },
  kapi: { x0: 0.025, y0: 0.3, x1: 0.125, y1: 0.95 },
  surgu: { x: 0.112, y: 0.6 },
  baca: { x0: 0.39, y0: 0.0, x1: 0.61, y1: 0.115 },
  /** finalde pencerenin önündeki tabela ve yeni kurabiye */
  tabela: { x: 0.43, y: 0.66, h: 0.13 },
  yeniKurabiye: { x: 0.585, y: 0.69, h: 0.075 },
  /** Fındık pencerede (ayak tabanı pervazın arkasında) */
  findik: { x: 0.53, y: 0.73, h: 0.2 },
};

// ---------------------------------------------------------------- otobüsün yanı (park)
/** Üç patika pencerenin altından başlar: gölete (tohum), banka (havuç), büyük ağaca (yıldız şeker) */
export type Patika = 'golet' | 'bank' | 'agac';
export const PATIKALAR: Record<Patika, { bas: [number, number]; son: [number, number]; ipucu: string }> = {
  golet: { bas: [0.46, 0.84], son: [0.585, 0.66], ipucu: 'tohum' },
  bank: { bas: [0.51, 0.855], son: [0.755, 0.71], ipucu: 'havuc' },
  agac: { bas: [0.56, 0.84], son: [0.93, 0.79], ipucu: 'seker' },
};
export interface IzNoktasi3 {
  x: number;
  y: number;
  h: number;
  don: number;
}
/**
 * Yıldız şeker izi: ağaç patikasının başından ağaca. Yolda iki şeker eksik (aralık kısa); dokunarak ya da üstünden
 * parmağı kaydırarak sırayla. Kural: son nokta ekranın içinde (ağacın dibine yakın), alt kenara inmez.
 */
export const SEKER_IZI: IzNoktasi3[] = [
  { x: 0.595, y: 0.83, h: 0.034, don: 10 },
  { x: 0.635, y: 0.824, h: 0.033, don: -18 },
  { x: 0.675, y: 0.818, h: 0.032, don: 24 },
  // (eksik)
  { x: 0.745, y: 0.808, h: 0.031, don: -8 },
  { x: 0.78, y: 0.803, h: 0.03, don: 16 },
  // (eksik)
  { x: 0.84, y: 0.795, h: 0.029, don: -20 },
  { x: 0.875, y: 0.79, h: 0.028, don: 12 },
];
/** İz sürme: sırayla dokunulur (atlanmaz; yanlış sıradaki şeker yalnız hafifçe titrer). Kilitlenmez. */
export class SekerIzi {
  alinan = 0;
  constructor(readonly n: number = SEKER_IZI.length) {}
  /** i. şekere dokunuldu (ya da parmak üstünden geçti): sıradakiyse alınır; döner: alındı mı, nota sırası, bitti mi */
  dokun(i: number): { alindi: boolean; sira: number; bitti: boolean } {
    if (i === this.alinan && i < this.n) {
      this.alinan++;
      return { alindi: true, sira: i, bitti: this.bitti };
    }
    return { alindi: false, sira: -1, bitti: this.bitti };
  }
  get siradaki(): number | null {
    return this.alinan < this.n ? this.alinan : null;
  }
  get bitti() {
    return this.alinan >= this.n;
  }
}
/** Otobüsün yanındaki eşyalar (yer tutucu sahnenin düzeni; Gemini çizimi gelince ölçülür) */
export const YANI = {
  pencere: { x: 0.385, y: 0.36 },
  golet: { x: 0.6, y: 0.64 },
  bank: { x: 0.76, y: 0.68 },
  agac: { x: 0.93, y: 0.82 },
};

// ---------------------------------------------------------------- büyük ağaç ve kovuklar
export type KovukId = 'ust' | 'orta' | 'alt';
export interface Kovuk {
  id: KovukId;
  /** ağzın ortası, yarı eni (oda eni oranı) ve yarı boyu (oda boyu oranı) */
  x: number;
  y: number;
  rx: number;
  ry: number;
  /** dudağın (kabuk halkasının) kalınlığı: ağzın yarı boyunun oranı */
  dudak: number;
}
export const KOVUKLAR: Record<KovukId, Kovuk> = {
  ust: { id: 'ust', x: 0.535, y: 0.44, rx: 0.036, ry: 0.07, dudak: 0.32 },
  orta: { id: 'orta', x: 0.455, y: 0.6, rx: 0.038, ry: 0.072, dudak: 0.32 },
  alt: { id: 'alt', x: 0.545, y: 0.78, rx: 0.042, ry: 0.078, dudak: 0.32 },
};
/** Kovuk araması: üç kovuğun içinde ne var (hepsinin soluk izi baştan görünür); kuyruk ucu alt kovuktan sarkar */
export const KOVUK_ICI = {
  baykus: { kovuk: 'ust' as KovukId, h: 0.12 },
  yuva: { kovuk: 'orta' as KovukId },
  /** kuyruk ucunun kökü (alt dudağın arkasında) ve boyu */
  kuyruk: { x: 0.548, y: 0.825, h: 0.13 },
};
/** Fındık kovuktan fırlayınca ağacın dibinde durduğu yer (ayak tabanı) ve boyu (Mino'nun 0.6'sı: boy.ts gibi) */
export const FINDIK_YERI = { x: 0.62, y: 0.95 };
export const FINDIK_BOY = 0.6;
/** Finalde Fındık'ın önüne dizilen dört kurabiye (ağacın dibinde, toprakta) */
export const FINAL_KURABIYELER: [number, number][] = [
  [0.4, 0.93],
  [0.455, 0.94],
  [0.51, 0.935],
  [0.565, 0.94],
];
/** Kuyruğa kaç kez dokunulunca Fındık çıkar (ilkinde "fırr" diye kaçar) */
export const KUYRUK_DOKUNUS = 2;

/** Kovuk araması: kuyruk bulunup iki kez dokunulunca biter; baykuş ve yuva serbest (dokununca kendi tepkisi). */
export class KovukArama {
  readonly gorulen = new Set<string>();
  kuyrukDokunus = 0;
  gor(id: 'baykus' | 'yuva' | 'kuyruk') {
    this.gorulen.add(id);
  }
  /** kuyruğa dokunuldu: döner: 'kac' (ilk: içeri kaçar) ya da 'cik' (Fındık fırlar) */
  kuyruk(): 'kac' | 'cik' {
    this.kuyrukDokunus++;
    return this.kuyrukDokunus >= KUYRUK_DOKUNUS ? 'cik' : 'kac';
  }
  get bitti() {
    return this.kuyrukDokunus >= KUYRUK_DOKUNUS;
  }
}

// ---------------------------------------------------------------- sayma (Halka 1 ve final)
/** Dokunarak sayma: her yeni dokunuş bir sonraki sayıyı alır (aynı yere iki kez dokunmak sayılmaz). Kilitlenmez. */
export class Sayma {
  readonly sayilan: number[] = [];
  constructor(readonly toplam: number) {}
  /** yer i'ye dokunuldu: döner: o yerin sayısı (1'den), daha önce sayıldıysa null */
  dokun(i: number): number | null {
    if (this.sayilan.includes(i) || i < 0 || i >= this.toplam) return null;
    this.sayilan.push(i);
    return this.sayilan.length;
  }
  get bitti() {
    return this.sayilan.length >= this.toplam;
  }
  /** henüz sayılmamış ilk yer (yardım parmağı) */
  get siradaki(): number | null {
    for (let i = 0; i < this.toplam; i++) if (!this.sayilan.includes(i)) return i;
    return null;
  }
}

/**
 * Halka 1'in kart denemesi: kart kaç kurabiye koyar? Tepside 2 kurabiye var, 4 boş yer.
 * 6: altısı dağılır, ikisi var olanların üstüne biner (fazla iki düşer); 2: iki boş yer hâlâ boş; 4: tam oturur.
 */
export function kurabiyeDene(n: number): { dolan: number; bos: number; fazla: number } {
  const bos = BOS_YERLER.length;
  const dolan = Math.min(n, bos);
  return { dolan, bos: bos - dolan, fazla: Math.max(0, n - bos) };
}
export const kartKurabiyeSayisi = (id: string) => Number(/^kurabiye-(\d)$/.exec(id)?.[1] ?? 0);

// ---------------------------------------------------------------- final
/** Fındık'a verilecek kurabiye sayısı (Kino: "İki tane al!") */
export const VERILECEK = 2;

// ---------------------------------------------------------------- çizgi roman
export const ROMAN3 = [
  { sira: 1, resim: 'v3/roman-1' },
  { sira: 2, resim: 'v3/roman-2' },
  { sira: 3, resim: 'v3/roman-3' },
  { sira: 4, resim: 'v3/roman-4' },
];

// ---------------------------------------------------------------- kadrajlar (oda oranı)
export const KADRAJ3 = {
  ic: [0.12, 0.08, 0.88, 1],
  tepsi: [0.28, 0.62, 0.56, 0.98],
  pencere: [0.3, 0.2, 0.7, 0.85],
  yani: [0.25, 0.3, 0.85, 1],
  patikalar: [0.3, 0.6, 0.78, 1],
  agac: [0.2, 0.15, 0.8, 1],
  kovuklar: [0.3, 0.26, 0.7, 0.9],
  findik: [0.36, 0.52, 0.8, 1],
  kiler: [0.05, 0.05, 0.95, 0.98],
  final: [0.28, 0.5, 0.82, 1],
  son: [0.28, 0.25, 0.72, 0.9],
} satisfies Record<string, Kadraj>;
