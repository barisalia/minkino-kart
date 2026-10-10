/**
 * Dedektif Mino · Vaka 3 "Kaybolan Yıldız Kurabiyeler": DOM'suz mantık (birim testli: tests/unit/dedektif-vaka3.test.ts).
 * Tasarım: ekip/senaryo/dedektif-vaka3.md. Kalıp Vaka 1 ve 2 ile aynı (büyüteçle ipucu → 3 resimli kart → "Demek ki…" →
 * çizgi roman); yeni mekanikler: boş yerleri dokunarak sayma (Halka 1), yıldız şeker izi (Halka 3), üç kovuk araması,
 * finalde sayma ve kurabiyeyi Fındık'ın patisine sürükleme.
 *
 * Mekân (assets/dedektif3: Gemini çizimleri, yatay 2752×1536 ve dikey eşleri 1536×2752; çizim yoksa resimler3.ts'nin yer tutucusu): Pasta Otobüsü'nün içi,
 * otobüsün yanı (park), büyük ağaç, ağacın kovuğunun içi (kiler). Koordinatlar resmin oranı (x: en, y: boy; 0..1, sol
 * üstten), boylar oda yüksekliğinin oranı (mantik.ts gibi).
 *
 * YAYIN: Vaka 3 henüz oyunda seçilemez (VAKA3_YAYINDA = false). Denemek için: /dedektif/?vaka=3 (doğrudan vaka) ya da
 * /dedektif/?vaka3=1 (seçim ekranında üçüncü dosya). Açmak için VAKA3_YAYINDA = true.
 */
import D from '../../content/dedektif.json';
import { ODA_ORAN, type DosyaHalkasi, type IpucuTanim, type Kadraj, type OdaId, type SorguHalkasi } from './mantik';

export const V3 = D.vaka3;
export const M3 = V3.mino;
export const K3 = V3.kino;
export const F3 = V3.findik;
/** yalnız balonda yazan sözler (seslendirilmez) */
export const B3 = V3.balon;

// ---------------------------------------------------------------- yayın bayrağı
/** Vaka 3 oyunda (seçim ekranı, Vaka Dosyam) görünsün mü. false: yalnız web'de ?vaka=3 / ?vaka3=1 ile açılır. */
export const VAKA3_YAYINDA = false;
/** Uygulama (mağaza) derlemesi mi: orada bayrak kapalıyken hiçbir adres parametresi Vaka 3'ü açmaz */
const UYGULAMA = import.meta.env?.MODE === 'uygulama';
/**
 * Bu sayfada Vaka 3 görünür mü: bayrak ya da (yalnız web derlemesinde) adres: ?vaka=3, ?vaka3=1, test kısayolu
 * ekran=vaka3. Uygulama derlemesinde bayrak kapalıysa her zaman false (bitmemiş vaka mağazada açılamaz).
 */
export function vaka3Gorunur(adres: string = typeof location !== 'undefined' ? location.search : '', uygulama = UYGULAMA): boolean {
  if (VAKA3_YAYINDA) return true;
  if (uygulama) return false;
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
    kadraj: [0.5, 0.55, 1, 0.98],
    // tepsinin dört boş yerindeki un halkaları (tek ipucu: dördü birlikte)
    ipuclari: [{ id: 'un', oda: 'otobus-ic', resim: 'v3/un-halka', foto: 'v3/foto-tepsi', x: 0.776, y: 0.85, h: 0.09, gizli: true }],
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
    kadraj: [0.3, 0.1, 1, 0.96],
    ipuclari: [{ id: 'kirinti', oda: 'otobus-ic', resim: 'v3/ipucu-kirinti', x: 0.77, y: 0.648, h: 0.05, gizli: true }],
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
    kadraj: [0.36, 0.55, 0.8, 0.95],
    ipuclari: [
      { id: 'tohum', oda: 'otobus-yani', resim: 'v3/ipucu-tohum', x: 0.462, y: 0.715, h: 0.06, gizli: true },
      { id: 'havuc', oda: 'otobus-yani', resim: 'v3/havuc', x: 0.575, y: 0.722, h: 0.06, don: -12, gizli: true },
      { id: 'seker', oda: 'otobus-yani', resim: 'v3/ipucu-yildiz-seker', x: 0.66, y: 0.77, h: 0.055, gizli: true },
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
    kadraj: [0.3, 0.5, 0.85, 1],
    ipuclari: [
      { id: 'el-izi', oda: 'agac', resim: 'v3/ipucu-el-izi', x: 0.4, y: 0.91, h: 0.09, gizli: true },
      { id: 'tuy', oda: 'agac', resim: 'v3/ipucu-tuy', x: 0.585, y: 0.73, h: 0.07, gizli: true },
    ],
    // delil: el izi; yanında az önce bulunan kızıl tüy (kuş "Benim tüyüm…" der, 2 yanlışta tüy kabarır: sorgu3 → tuyKabar)
    ekFoto: 'v3/ipucu-tuy',
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
    kadraj: [0.15, 0.08, 0.9, 0.92],
    // kiler-ic çiziminden: sağ alt raftaki iki yıldız kurabiye, dalda asılı kâğıt kar tanesi
    ipuclari: [
      { id: 'kurabiyeler', oda: 'kiler', resim: 'v3/foto-kiler-kurabiye', x: 0.71, y: 0.605, h: 0.2, gizli: false, kirp: { w: 0.15, h: 0.2 } },
      { id: 'kar-tanesi', oda: 'kiler', resim: 'v3/foto-kar-tanesi', x: 0.6, y: 0.32, h: 0.17, gizli: false, kirp: { w: 0.07, h: 0.17 } },
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

// ---------------------------------------------------------------- yerleşim (Gemini çizimleri, assets/dedektif3)
/**
 * Sahnelerin yerleri çizimden ölçülür (oda oranı: x resmin eni, y boyu; 0..1, sol üstten). Yatay çizimler 2752 × 1536,
 * dikey eşleri (-dikey) 1536 × 2752. Aşağıdaki canlı tablolar (TEPSI3, OTOBUS, SEKER_IZI, KOVUKLAR, ...) yatay değerle
 * başlar; sahne3Yerlesim(sahne, true) o sahnenin tablolarını yerinde dikey değerlere çevirir, false yatayı geri koyar
 * (Vaka 2'nin bahceYerlesim kalıbı). Vaka her açılışta yeniden kurulur; telefon dönünce dunya3.ts → sahne3YenidenDiz.
 */
type Kutu = { x0: number; y0: number; x1: number; y1: number };
export interface Yer3 {
  x: number;
  y: number;
  h: number;
  don?: number;
}

// ---------------------------------------------------------------- otobüsün içi
/**
 * Tepsi çizimin kendi tepsisidir (tezgâhta, pencerenin önünde; perspektifte yayvan): altı yer (3 × 2, arka sıra biraz
 * yukarıda ve içeride). Girişte iki kurabiye (0 ve 4), dört boş yer un halkalı. Kurabiyeler tepsiye yatık durur
 * (basik: dikey basıklık). kutu: tepsinin kutusu; yerler: kurabiyenin ortası (oda oranı); en: kurabiyenin eni (oda boyu oranı).
 */
export interface Tepsi3 {
  kutu: Kutu;
  yerler: [number, number][];
  en: number;
  basik: number;
}
/** Kart ve delil fotoğrafındaki (kodla çizilen, yukarıdan bakılan) tepsi: çiziminin boy / en oranı (yer-tutucu3.ts → tepsiSvg) */
export const TEPSI_ORAN = 0.36;
/** Fotoğraftaki tepside altı yer (tepsinin kutusunun oranı) */
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
/** fotoğrafta kurabiyenin eni / tepsinin eni */
export const KURABIYE_EN = 0.2;

/** Pervaz (pencerenin önündeki geniş eşik): ön katman, sahnenin kendi resminden kendi biçimiyle (çokgen) kesilir */
export interface Pervaz3 extends Kutu {
  /** pervazın çizgisi (oda oranı): üst yüzü ve ön yüzü */
  cokgen: [number, number][];
}
export interface Otobus3 {
  /** pencerenin aralığı (pencere kartının kırpımı, Kino'nun kafasını soktuğu yer) */
  pencere: Kutu;
  pervaz: Pervaz3;
  kapi: Kutu;
  surgu: { x: number; y: number };
  baca: Kutu;
  /** finalde pervazdaki tabela (tabanı) ve tepsideki yeni kurabiye */
  tabela: Yer3;
  yeniKurabiye: Yer3;
  /** Fındık pencerede (ayak tabanı pervazın arkasında) */
  findik: Yer3;
}

// ---------------------------------------------------------------- otobüsün yanı (park)
/** Üç patika (çatallanan yolun üç kolu): gölete (tohum), banka (havuç), büyük ağaca (yıldız şeker) */
export type Patika = 'golet' | 'bank' | 'agac';
export interface IzNoktasi3 {
  x: number;
  y: number;
  h: number;
  don: number;
}

// ---------------------------------------------------------------- büyük ağaç ve kovuklar
export type KovukId = 'ust' | 'orta' | 'alt';
export interface Kovuk {
  id: KovukId;
  /** ağzın (koyu içinin) ortası, yarı eni (oda eni oranı) ve yarı boyu (oda boyu oranı) */
  x: number;
  y: number;
  rx: number;
  ry: number;
  /** dudağın (kabuk halkasının) altta kalınlığı: ağzın yarı boyunun oranı */
  dudak: number;
  /** dudağın yanlarda kalınlığı (ağzın yarı eninin oranı; yoksa dudak) */
  dudakX?: number;
}

interface Yerlesim3 {
  /** halkaların ipuçları (id) */
  ipucu: Record<string, Yer3>;
  /** halkaların kadrajı */
  kadraj: Partial<Record<Halka3Id, Kadraj>>;
  /** KADRAJ3'ün bu sahneye ait olanları */
  kadraj3: Partial<Record<Kadraj3Adi, Kadraj>>;
}
interface IcYerlesim extends Yerlesim3 {
  tepsi: Tepsi3;
  otobus: Otobus3;
}
interface YaniYerlesim extends Yerlesim3 {
  seker: IzNoktasi3[];
}
interface AgacYerlesim extends Yerlesim3 {
  kovuklar: Record<KovukId, Kovuk>;
  kuyruk: Yer3;
  findik: { x: number; y: number };
  kurabiyeler: [number, number][];
}
type Tablo3 = { 'otobus-ic': IcYerlesim; 'otobus-yani': YaniYerlesim; agac: AgacYerlesim };
/** Dikey eşi olan sahneler */
export type DikeySahne3 = keyof Tablo3;
export const DIKEY_SAHNELER3: DikeySahne3[] = ['otobus-ic', 'otobus-yani', 'agac'];

/** 3 × 2 yer, perspektifte yayvan tepsi: arka ve ön sıranın sol / sağ kenarı ve boyu */
function tepsiYerleri(arka: [number, number, number], on: [number, number, number]): [number, number][] {
  const sira = ([sol, sag, y]: [number, number, number]) => [1, 3, 5].map((k) => [sol + ((sag - sol) * k) / 6, y] as [number, number]);
  return [...sira(arka), ...sira(on)];
}

const YATAY3: Tablo3 = {
  'otobus-ic': {
    ipucu: { un: { x: 0.776, y: 0.85, h: 0.09 }, kirinti: { x: 0.77, y: 0.648, h: 0.05 } },
    kadraj: { sayi: [0.5, 0.55, 1, 0.98], cikis: [0.3, 0.1, 1, 0.96] },
    kadraj3: { ic: [0.08, 0.05, 0.98, 1], tepsi: [0.56, 0.62, 0.99, 0.98], pencere: [0.56, 0.05, 1, 0.85], son: [0.52, 0.2, 1, 0.95] },
    // tepsinin tabanı: arka kenar y 0.815 (x 0.613..0.84), ön kenar y 0.885 (x 0.65..0.94)
    tepsi: { kutu: { x0: 0.6, y0: 0.8, x1: 0.96, y1: 0.9 }, yerler: tepsiYerleri([0.626, 0.866, 0.836], [0.642, 0.91, 0.864]), en: 0.1, basik: 0.52 },
    otobus: {
      pencere: { x0: 0.69, y0: 0.04, x1: 0.96, y1: 0.73 },
      pervaz: {
        x0: 0.64,
        y0: 0.594,
        x1: 0.965,
        y1: 0.78,
        cokgen: [
          [0.646, 0.598],
          [0.8, 0.598],
          [0.902, 0.686],
          [0.902, 0.72],
          [0.963, 0.72],
          [0.963, 0.777],
          [0.84, 0.773],
          [0.66, 0.667],
          [0.644, 0.645],
        ],
      },
      kapi: { x0: 0.215, y0: 0.12, x1: 0.405, y1: 0.82 },
      surgu: { x: 0.355, y: 0.605 },
      baca: { x0: 0.42, y0: 0.015, x1: 0.555, y1: 0.115 },
      tabela: { x: 0.725, y: 0.655, h: 0.13 },
      yeniKurabiye: { x: 0.657, y: 0.636, h: 0.07 },
      findik: { x: 0.855, y: 0.68, h: 0.23 },
    },
  },
  'otobus-yani': {
    ipucu: { tohum: { x: 0.462, y: 0.715, h: 0.06 }, havuc: { x: 0.575, y: 0.722, h: 0.06, don: -12 }, seker: { x: 0.66, y: 0.77, h: 0.055 } },
    kadraj: { yol: [0.36, 0.55, 0.8, 0.95] },
    kadraj3: { yani: [0.05, 0.15, 0.85, 1], patikalar: [0.36, 0.55, 0.8, 0.95], izSonu: [0.6, 0.45, 1, 1] },
    // ağaç kolunun ortası: (0.66, 0.77) → (0.95, 0.643); çalının üstünden geçer. Yolda iki şeker eksik (aralık uzun)
    seker: [
      { x: 0.7, y: 0.749, h: 0.034, don: 10 },
      { x: 0.735, y: 0.728, h: 0.033, don: -18 },
      { x: 0.77, y: 0.709, h: 0.032, don: 24 },
      { x: 0.82, y: 0.688, h: 0.031, don: -8 },
      { x: 0.855, y: 0.674, h: 0.03, don: 16 },
      { x: 0.905, y: 0.658, h: 0.029, don: -20 },
      { x: 0.935, y: 0.65, h: 0.028, don: 12 },
    ],
  },
  agac: {
    ipucu: { 'el-izi': { x: 0.4, y: 0.91, h: 0.09 }, tuy: { x: 0.585, y: 0.73, h: 0.07 } },
    kadraj: { kim: [0.3, 0.5, 0.85, 1] },
    kadraj3: { agac: [0.3, 0.02, 0.98, 1], kovuklar: [0.45, 0.08, 0.95, 0.92], findik: [0.55, 0.5, 1, 1], final: [0.42, 0.5, 0.98, 1] },
    // ağızlar çizimin koyu içinin kenarından; dudak dış kontura kadar (alt dudak yanlarda kalın)
    kovuklar: {
      ust: { id: 'ust', x: 0.654, y: 0.188, rx: 0.0385, ry: 0.07, dudak: 0.5, dudakX: 0.43 },
      orta: { id: 'orta', x: 0.6345, y: 0.477, rx: 0.034, ry: 0.078, dudak: 0.29, dudakX: 0.5 },
      alt: { id: 'alt', x: 0.724, y: 0.6605, rx: 0.0225, ry: 0.056, dudak: 0.37, dudakX: 0.7 },
    },
    // kuyruğun kökü ağzın karanlığında (üstü karanlığa karışır: vaka3.css), dudağın önünden sarkar; çizimde kök ortanın biraz solunda
    kuyruk: { x: 0.731, y: 0.674, h: 0.24 },
    findik: { x: 0.82, y: 0.955 },
    kurabiyeler: [
      [0.53, 0.95],
      [0.575, 0.958],
      [0.62, 0.952],
      [0.665, 0.958],
    ],
  },
};

const DIKEY3: Tablo3 = {
  'otobus-ic': {
    ipucu: { un: { x: 0.755, y: 0.836, h: 0.07 }, kirinti: { x: 0.82, y: 0.645, h: 0.045 } },
    // tepsi resmin sağ altında, karakterlerin önünde: sayarken kamera tepsiye yaklaşır (dar kadraj: dunya.ts tam en yapmaz),
    // sahnenin altı ekranın altına dayanır, tepsi karakterlerin başının üstüne çıkar (vaka3.ts: ikisi solda)
    kadraj: { sayi: [0.56, 0.72, 0.95, 0.9], cikis: [0, 0.3, 1, 1] },
    kadraj3: { ic: [0, 0.05, 1, 1], tepsi: [0.56, 0.72, 0.95, 0.9], pencere: [0, 0.2, 1, 0.9], son: [0, 0.28, 1, 0.98] },
    // tepsi sağda resmin kenarından taşar: yerler görünen yarısında (telefonda en sağdaki de ekranda)
    tepsi: { kutu: { x0: 0.58, y0: 0.795, x1: 0.93, y1: 0.875 }, yerler: tepsiYerleri([0.61, 0.89, 0.822], [0.63, 0.91, 0.849]), en: 0.052, basik: 0.55 },
    otobus: {
      pencere: { x0: 0.66, y0: 0.22, x1: 1, y1: 0.62 },
      pervaz: {
        x0: 0.6,
        y0: 0.59,
        x1: 1,
        y1: 0.76,
        cokgen: [
          [0.612, 0.596],
          [0.78, 0.596],
          [1, 0.655],
          [1, 0.752],
          [0.66, 0.662],
          [0.615, 0.636],
        ],
      },
      kapi: { x0: 0, y0: 0.21, x1: 0.27, y1: 0.8 },
      surgu: { x: 0.12, y: 0.585 },
      baca: { x0: 0.29, y0: 0.02, x1: 0.66, y1: 0.115 },
      tabela: { x: 0.69, y: 0.626, h: 0.1 },
      yeniKurabiye: { x: 0.64, y: 0.618, h: 0.05 },
      findik: { x: 0.8, y: 0.665, h: 0.17 },
    },
  },
  'otobus-yani': {
    ipucu: { tohum: { x: 0.33, y: 0.775, h: 0.045 }, havuc: { x: 0.475, y: 0.775, h: 0.045, don: -12 }, seker: { x: 0.485, y: 0.878, h: 0.045 } },
    kadraj: { yol: [0, 0.6, 1, 1] },
    kadraj3: { yani: [0, 0.05, 1, 1], patikalar: [0, 0.6, 1, 1], izSonu: [0, 0.45, 1, 1] },
    // sağ kol: (0.55, 0.855) → (0.92, 0.787); son şeker telefonda da ekranda (x ≤ 0.88)
    seker: [
      { x: 0.545, y: 0.856, h: 0.03, don: 10 },
      { x: 0.6, y: 0.842, h: 0.03, don: -18 },
      { x: 0.655, y: 0.83, h: 0.029, don: 24 },
      { x: 0.71, y: 0.82, h: 0.029, don: -8 },
      { x: 0.765, y: 0.811, h: 0.028, don: 16 },
      { x: 0.82, y: 0.802, h: 0.028, don: -20 },
      { x: 0.875, y: 0.794, h: 0.027, don: 12 },
    ],
  },
  agac: {
    ipucu: { 'el-izi': { x: 0.55, y: 0.93, h: 0.065 }, tuy: { x: 0.4, y: 0.64, h: 0.06 } },
    kadraj: { kim: [0, 0.5, 1, 1] },
    kadraj3: { agac: [0, 0.05, 1, 1], kovuklar: [0, 0.08, 1, 0.85], findik: [0, 0.5, 1, 1], final: [0, 0.5, 1, 1] },
    kovuklar: {
      ust: { id: 'ust', x: 0.54, y: 0.1915, rx: 0.11, ry: 0.0565, dudak: 0.39, dudakX: 0.39 },
      orta: { id: 'orta', x: 0.4975, y: 0.4865, rx: 0.0825, ry: 0.0685, dudak: 0.28, dudakX: 0.4 },
      alt: { id: 'alt', x: 0.65, y: 0.689, rx: 0.0625, ry: 0.046, dudak: 0.55, dudakX: 0.74 },
    },
    kuyruk: { x: 0.663, y: 0.7, h: 0.19 },
    // karakterler alt köşelerde, ara dar: kurabiyeler 2 × 2 (kökün üstünde ve toprakta), Fındık sağlarında
    findik: { x: 0.69, y: 0.965 },
    kurabiyeler: [
      [0.35, 0.912],
      [0.35, 0.963],
      [0.475, 0.912],
      [0.475, 0.963],
    ],
  },
};

// ---------------------------------------------------------------- canlı tablolar (yatayla başlar)
export const TEPSI3: Tepsi3 = structuredClone(YATAY3['otobus-ic'].tepsi);
/** Otobüsün parçaları (oda oranı) */
export const OTOBUS: Otobus3 = structuredClone(YATAY3['otobus-ic'].otobus);
/** Yatay çizimdeki parçalar (kartlar yatay çizimden kırpılır: resimler3.ts → parca) */
export const OTOBUS_YATAY: Readonly<Otobus3> = YATAY3['otobus-ic'].otobus;
/** Yer tutucu çizimin (yer-tutucu3.ts) patikaları: çizim gelince kullanılmaz */
export const PATIKALAR: Record<Patika, { bas: [number, number]; son: [number, number]; ipucu: string }> = {
  golet: { bas: [0.46, 0.84], son: [0.585, 0.66], ipucu: 'tohum' },
  bank: { bas: [0.51, 0.855], son: [0.755, 0.71], ipucu: 'havuc' },
  agac: { bas: [0.56, 0.84], son: [0.93, 0.79], ipucu: 'seker' },
};
/**
 * Yıldız şeker izi: ağaç kolunun başından ağaca. Yolda iki şeker eksik (aralık uzun); dokunarak ya da üstünden
 * parmağı kaydırarak sırayla. Kural: son nokta ekranın içinde (ağacın dibine yakın), alt kenara inmez.
 */
export const SEKER_IZI: IzNoktasi3[] = structuredClone(YATAY3['otobus-yani'].seker);
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

export const KOVUKLAR: Record<KovukId, Kovuk> = structuredClone(YATAY3.agac.kovuklar);
/** Kovuk araması: üç kovuğun içinde ne var (hepsinin soluk izi baştan görünür); kuyruk ucu alt kovuktan sarkar */
export const KOVUK_ICI = {
  baykus: { kovuk: 'ust' as KovukId, h: 0.12 },
  yuva: { kovuk: 'orta' as KovukId },
  /** kuyruğun kökü (alt ağzın karanlığında) ve boyu: telefonda da kolay görülsün diye iri (çizim: findik-kuyruk) */
  kuyruk: structuredClone(YATAY3.agac.kuyruk),
};
/** Fındık kovuktan fırlayınca ağacın dibinde durduğu yer (ayak tabanı) ve boyu (Mino'nun 0.6'sı: boy.ts gibi) */
export const FINDIK_YERI = structuredClone(YATAY3.agac.findik);
export const FINDIK_BOY = 0.6;
/**
 * Finalde Fındık'ın önüne dizilen dört kurabiye (ağacın dibinde, toprakta). Sağdaki de Fındık'a değmez (arada boşluk:
 * kurabiye onun arkasında yarım kalmasın, çocuk sürükleyeceği yeri görsün). Dikey telefonda da soldaki ekranda kalır.
 */
export const FINAL_KURABIYELER: [number, number][] = structuredClone(YATAY3.agac.kurabiyeler);
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

/** Hangi sahne dikey kuruldu (sahne3Yerlesim son çağrısı) */
export const SAHNE3_DIKEY: Record<Sahne3, boolean> = { 'otobus-ic': false, 'otobus-yani': false, agac: false, kiler: false };
export const DIKEY3_ORAN = 1536 / 2752;
const YATAY3_ORAN = 2752 / 1536;
const yerine = (hedef: Kadraj, k: Kadraj) => hedef.splice(0, 4, ...k);

/** Sahnenin tablolarını yerinde yatay ya da dikey çizimin değerlerine çevirir (oda oranı, ipuçları, kadrajlar, eşyalar) */
export function sahne3Yerlesim(s: DikeySahne3, dikey: boolean) {
  SAHNE3_DIKEY[s] = dikey;
  ODA_ORAN[s] = dikey ? DIKEY3_ORAN : YATAY3_ORAN;
  const t = structuredClone((dikey ? DIKEY3 : YATAY3)[s]);
  for (const hk of HALKALAR3) {
    if (hk.oda !== s) continue;
    const k = t.kadraj[hk.id];
    if (k) yerine(hk.kadraj, k);
    for (const ip of hk.ipuclari) {
      const y = t.ipucu[ip.id];
      if (!y) continue;
      delete ip.don;
      Object.assign(ip, y);
    }
  }
  for (const [ad, k] of Object.entries(t.kadraj3) as [Kadraj3Adi, Kadraj][]) yerine(KADRAJ3[ad], k);
  if (s === 'otobus-ic') {
    const ic = t as IcYerlesim;
    Object.assign(TEPSI3, ic.tepsi);
    Object.assign(OTOBUS, ic.otobus);
  } else if (s === 'otobus-yani') {
    SEKER_IZI.splice(0, SEKER_IZI.length, ...(t as YaniYerlesim).seker);
  } else {
    const a = t as AgacYerlesim;
    for (const id of Object.keys(KOVUKLAR) as KovukId[]) Object.assign(KOVUKLAR[id], { dudakX: undefined }, a.kovuklar[id]);
    Object.assign(KOVUK_ICI.kuyruk, a.kuyruk);
    Object.assign(FINDIK_YERI, a.findik);
    FINAL_KURABIYELER.splice(0, FINAL_KURABIYELER.length, ...a.kurabiyeler);
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
  ic: [0.08, 0.05, 0.98, 1],
  tepsi: [0.56, 0.62, 0.99, 0.98],
  pencere: [0.56, 0.05, 1, 0.85],
  yani: [0.05, 0.15, 0.85, 1],
  patikalar: [0.36, 0.55, 0.8, 0.95],
  /** iz bitince: ağaç */
  izSonu: [0.6, 0.45, 1, 1],
  agac: [0.3, 0.02, 0.98, 1],
  kovuklar: [0.45, 0.08, 0.95, 0.92],
  findik: [0.55, 0.5, 1, 1],
  kiler: [0.05, 0.05, 0.95, 0.98],
  final: [0.42, 0.5, 0.98, 1],
  son: [0.52, 0.2, 1, 0.95],
} satisfies Record<string, Kadraj>;
export type Kadraj3Adi = keyof typeof KADRAJ3;
