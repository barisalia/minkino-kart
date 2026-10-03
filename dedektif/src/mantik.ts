/**
 * Dedektif Mino · Vaka 1 "Devrilen Lamba": oyunun DOM'suz mantığı (birim testli: tests/unit/dedektif.test.ts).
 * Tasarım: ekip/senaryo/dedektif-mino.md (v2). Her vaka bir çıkarım zinciri: ipucunu büyüteçle bul → 3 karttan doğrusunu
 * ipucuna sürükle → "Demek ki…" kartı dosyaya girer → sonraki soru. Halka 4'te izler takip edilir, iki yoldan biri seçilir.
 * Sonunda dosyadaki 4 "demek ki" kartı 4 kareli çizgi roman olur.
 *
 * Koordinatlar: oda resminin oranı (x: en, y: boy; 0..1, sol üstten). Boylar oda yüksekliğinin oranı.
 */
import D from '../../content/dedektif.json';

export const M = D.mino;
export const K = D.kino;

// ---------------------------------------------------------------- odalar
export type OdaId = 'calisma' | 'koridor' | 'yatak' | 'mutfak';
/** Odanın en / boy oranı (resimlerin kendi oranı: film/ev 2752×1536, koridor ve yatak odası 1920×1080) */
export const ODA_ORAN: Record<OdaId, number> = { calisma: 2752 / 1536, koridor: 16 / 9, yatak: 16 / 9, mutfak: 2752 / 1536 };
/** Dünya biriminde oda yüksekliği (CSS px; kamera ölçekler) */
export const ODA_H = 1000;
export const odaW = (o: OdaId) => Math.round(ODA_H * ODA_ORAN[o]);

/** Kameranın göstermek istediği dikdörtgen (oda oranı): [x0, y0, x1, y1] */
export type Kadraj = [number, number, number, number];
export const KADRAJ = {
  genel: [0, 0, 1, 1],
  giris: [0.1, 0.32, 0.9, 1],
  hali: [0.26, 0.62, 0.78, 1],
  masa: [0.42, 0.42, 0.82, 0.92],
  pencere: [0.3, 0.12, 0.76, 0.74],
  sahne3: [0.3, 0.2, 0.82, 0.98],
  izler: [0.4, 0.6, 1, 1],
  final: [0.18, 0.3, 0.92, 1],
  koridor: [0.15, 0.35, 0.85, 1],
  yatak: [0, 0.4, 0.62, 1],
  mutfak: [0, 0.3, 0.6, 1],
} satisfies Record<string, Kadraj>;
export type KadrajAdi = keyof typeof KADRAJ;

// ---------------------------------------------------------------- ipuçları
export interface IpucuTanim {
  id: string;
  oda: OdaId;
  /** resim yuvası (resimler.ts → YUVA) */
  resim: string;
  /** sahnedeki yeri (oranı) ve yüksekliği (oda boyunun oranı) */
  x: number;
  y: number;
  h: number;
  /** döndürme (derece) */
  don?: number;
  /** büyüteçsiz görünmez (izler, tüy, toz); false: görünür ama yine büyüteçle "incelenir" (kelebek) */
  gizli: boolean;
  /** dosyaya giren fotoğraf (yuva adı); yoksa resim */
  foto?: string;
}

// ---------------------------------------------------------------- kartlar
export type KartId = 'zurafa-ayagi' | 'ordek-ayagi' | 'kedi-pati-izi' | 'kedi-turuncu' | 'kedi-siyah' | 'kedi-beyaz' | 'sut-kasesi' | 'yastik' | 'sari-kelebek';
/** Yanlış kartın kendini anlatışı (öğretici ve komik; ceza yok) */
export type KartTepki = 'zurafa' | 'ordek' | 'turuncu' | 'siyah' | 'sut' | 'yastik';
export interface KartTanim {
  id: KartId;
  /** resim yuvası (assets/dedektif/kart-<id>.webp) */
  resim: string;
  tepki?: KartTepki;
  /** kartın rengi (çerçeve ve kartı ipucuna yaklaştırınca kıyas lekesi) */
  renk: string;
}
export const KARTLAR: Record<KartId, KartTanim> = {
  'zurafa-ayagi': { id: 'zurafa-ayagi', resim: 'kart-zurafa-ayagi', tepki: 'zurafa', renk: '#f6c343' },
  'ordek-ayagi': { id: 'ordek-ayagi', resim: 'kart-ordek-ayagi', tepki: 'ordek', renk: '#ff9f43' },
  'kedi-pati-izi': { id: 'kedi-pati-izi', resim: 'kart-kedi-pati-izi', renk: '#a77b5a' },
  'kedi-turuncu': { id: 'kedi-turuncu', resim: 'kart-kedi-turuncu', tepki: 'turuncu', renk: '#f39a3d' },
  'kedi-siyah': { id: 'kedi-siyah', resim: 'kart-kedi-siyah', tepki: 'siyah', renk: '#3b3340' },
  'kedi-beyaz': { id: 'kedi-beyaz', resim: 'kart-kedi-beyaz', renk: '#fbf7f2' },
  'sut-kasesi': { id: 'sut-kasesi', resim: 'kart-sut-kasesi', tepki: 'sut', renk: '#7fb4e6' },
  yastik: { id: 'yastik', resim: 'kart-yastik', tepki: 'yastik', renk: '#e2b7ef' },
  'sari-kelebek': { id: 'sari-kelebek', resim: 'kart-sari-kelebek', renk: '#ffd23f' },
};

// ---------------------------------------------------------------- halkalar
export type HalkaId = 'iz' | 'tuy' | 'neden' | 'nerede';
export interface Halka {
  id: HalkaId;
  /** ipucunun arandığı kadraj */
  kadraj: KadrajAdi;
  /** ipucu ararken Mino'nun cümlesi (yoksa yalnız "büyüteci gezdir") */
  ara?: string;
  /** bulunması gereken ipuçları (hepsi) */
  ipuclari: IpucuTanim[];
  /** soru (Mino) */
  soru: string;
  /** Kino'nun atılıp söylediği yanlış tahmin ve gösterdiği kart */
  kino?: string;
  kinoKart?: KartId;
  /** 3 kart (ekrandaki sıra karıştırılır) ve doğrusu */
  kartlar: KartId[];
  dogru?: KartId;
  /** "Demek ki…" (Mino) ve dosyaya giren sonuç kartının resmi (çizgi roman karesi de bundan) */
  demekKi: string;
  demekResim: string;
}

/** Halka 4: lambadan kapıya, koridordan yatak odasına giden pati izleri (sırayla dokunulur / üstünden kaydırılır) */
export interface IzNoktasi {
  x: number;
  y: number;
  /** derece: izin yönü */
  don: number;
  /** boy (oda boyunun oranı; perspektifte uzaktakiler küçük) */
  h: number;
}

export const HALKALAR: Halka[] = [
  {
    id: 'iz',
    kadraj: 'hali',
    ipuclari: [{ id: 'pati-hali', oda: 'calisma', resim: 'kart-kedi-pati-izi', foto: 'ipucu-kedi-pati-hali', x: 0.565, y: 0.885, h: 0.075, don: -18, gizli: true }],
    soru: M.iz_kimin,
    kino: K.zurafa,
    kinoKart: 'zurafa-ayagi',
    kartlar: ['zurafa-ayagi', 'ordek-ayagi', 'kedi-pati-izi'],
    dogru: 'kedi-pati-izi',
    demekKi: M.demek_kedi,
    demekResim: 'kart-kedi-pati-izi',
  },
  {
    id: 'tuy',
    kadraj: 'masa',
    ara: M.masaya,
    ipuclari: [{ id: 'tuy', oda: 'calisma', resim: 'ipucu-beyaz-tuy', x: 0.672, y: 0.664, h: 0.085, don: 58, gizli: true }],
    soru: M.tuy_kimin,
    kino: K.minonun,
    kinoKart: 'kedi-turuncu',
    kartlar: ['kedi-turuncu', 'kedi-siyah', 'kedi-beyaz'],
    dogru: 'kedi-beyaz',
    demekKi: M.demek_beyaz,
    demekResim: 'kart-kedi-beyaz',
  },
  {
    id: 'neden',
    kadraj: 'pencere',
    ara: M.pencere,
    ipuclari: [
      { id: 'toz', oda: 'calisma', resim: 'ipucu-sari-kanat-tozu', x: 0.61, y: 0.646, h: 0.06, gizli: true },
      { id: 'kelebek', oda: 'calisma', resim: 'kart-sari-kelebek', x: 0.47, y: 0.36, h: 0.09, gizli: false },
    ],
    soru: M.neden,
    kino: K.sut,
    kinoKart: 'sut-kasesi',
    kartlar: ['sut-kasesi', 'yastik', 'sari-kelebek'],
    dogru: 'sari-kelebek',
    demekKi: M.demek_kelebek,
    demekResim: 'kart-sari-kelebek',
  },
  {
    id: 'nerede',
    kadraj: 'izler',
    ipuclari: [],
    soru: M.iki_yol,
    kartlar: [],
    demekKi: M.kuyruk,
    demekResim: 'pamuk-b',
  },
];
export const halka = (id: HalkaId) => HALKALAR.find((h) => h.id === id)!;

// ---------------------------------------------------------------- sahne yerleşimi (oda oranı)
/** Çalışma odası: masa pencerenin önünde, devrik lamba halının sol üstünde */
export const CALISMA = {
  masa: { x: 0.6, y: 0.865, h: 0.23 },
  /** masanın üst yüzü (dik lambanın oturduğu çizgi) */
  masaUst: { x: 0.6, y: 0.675 },
  lambaDevrik: { x: 0.49, y: 0.93, h: 0.16 },
  lambaDik: { x: 0.565, y: 0.678, h: 0.2 },
  /** devrik kalemlik / kalemler masanın üstünde */
  kalem: { x: 0.585, y: 0.666, h: 0.025, don: -8 },
  /** pencerenin camı (kelebek bunun içinde uçar) */
  cam: { x0: 0.345, y0: 0.13, x1: 0.705, y1: 0.6 },
  /** pervaz (toz) */
  pervaz: { x: 0.61, y: 0.646 },
};

/** Lambadan sağdaki kapıya giden izler (halının üstünden, terliklerin önünden) */
export const CALISMA_IZLERI: IzNoktasi[] = [
  { x: 0.55, y: 0.925, don: 78, h: 0.059 },
  { x: 0.6, y: 0.955, don: 96, h: 0.06 },
  { x: 0.65, y: 0.93, don: 80, h: 0.06 },
  { x: 0.715, y: 0.96, don: 98, h: 0.061 },
  { x: 0.78, y: 0.985, don: 84, h: 0.061 },
  { x: 0.845, y: 0.99, don: 92, h: 0.061 },
  { x: 0.91, y: 0.985, don: 86, h: 0.061 },
  { x: 0.975, y: 0.99, don: 92, h: 0.061 },
];
/** Koridor: önden ortaya kadar ortak iz, sonra ikiye ayrılır (perspektif: uzaktaki izler küçük) */
export const KORIDOR_IZLERI: IzNoktasi[] = [
  { x: 0.505, y: 0.975, don: -4, h: 0.065 },
  { x: 0.485, y: 0.915, don: -8, h: 0.057 },
  { x: 0.5, y: 0.862, don: 2, h: 0.049 },
];
export type Yol = 'mutfak' | 'yatak';
/** Kapılar: sol kemerli kapı ve sağ kapı (eşikleri) */
export const KAPI = { sol: { x: 0.315, y: 0.745 }, sag: { x: 0.725, y: 0.805 } };
/** Ayrılan izler: kapıya doğru küçülür. Mutfağa gidenler büyük ve tırnaklı (Kino), yatak odasına gidenler küçük, yuvarlak. */
export function yolIzleri(yan: 'sol' | 'sag'): IzNoktasi[] {
  return yan === 'sol'
    ? [
        { x: 0.455, y: 0.83, don: -58, h: 0.044 },
        { x: 0.405, y: 0.802, don: -64, h: 0.039 },
        { x: 0.36, y: 0.775, don: -62, h: 0.035 },
      ]
    : [
        { x: 0.56, y: 0.845, don: 62, h: 0.047 },
        { x: 0.62, y: 0.832, don: 70, h: 0.046 },
        { x: 0.675, y: 0.818, don: 66, h: 0.043 },
      ];
}
/** Yatak odası: izler halıdan yatağın ayak ucuna; kuyruk yatağın altından (ayak ucu bacağının yanında) sallanır */
export const YATAK_IZLERI: IzNoktasi[] = [
  { x: 0.6, y: 0.985, don: -64, h: 0.065 },
  { x: 0.54, y: 0.945, don: -70, h: 0.062 },
  { x: 0.48, y: 0.91, don: -62, h: 0.06 },
  { x: 0.43, y: 0.875, don: -70, h: 0.057 },
];
export const YATAK = {
  /** yatağın önden görünen kısmı (Pamuk bunun arkasında): çokgen, oran */
  on: [
    [0.02, 0.43],
    [0.44, 0.43],
    [0.44, 0.79],
    [0.408, 0.79],
    [0.408, 0.855],
    [0.372, 0.855],
    [0.372, 0.79],
    [0.058, 0.79],
    [0.058, 0.85],
    [0.028, 0.85],
    [0.02, 0.79],
  ] as [number, number][],
  /** yatağın altındaki karanlık aralık */
  alt: { x0: 0.06, y0: 0.775, x1: 0.372, y1: 0.842 },
  /** sallanan kuyruk ucunun kökü (yatağın altında, ayak ucu bacağının hemen solunda) */
  kuyruk: { x: 0.35, y: 0.83, h: 0.12 },
  /** Pamuk'un saklandığı yer ve çıkınca durduğu yer (ayak tabanı) */
  saklan: { x: 0.24, y: 0.845 },
  cik: { x: 0.53, y: 0.94 },
};
/** Mutfak: Kino'nun izleri buzdolabının önünde biter */
export const MUTFAK_IZLERI: IzNoktasi[] = [
  { x: 0.52, y: 0.99, don: -70, h: 0.078 },
  { x: 0.42, y: 0.95, don: -76, h: 0.075 },
  { x: 0.32, y: 0.93, don: -70, h: 0.073 },
  { x: 0.24, y: 0.9, don: -74, h: 0.07 },
];

/** Yolların kapılara dağılımı: test modunda (ya da tohum 0) mutfak solda; değilse rastgele (tekrar oynayınca değişsin) */
export function yollariDiz(rnd: () => number = Math.random): Record<'sol' | 'sag', Yol> {
  return rnd() < 0.5 ? { sol: 'mutfak', sag: 'yatak' } : { sol: 'yatak', sag: 'mutfak' };
}

/** İzlerin notası: her izde bir üst nota (pentatonik; kulağa hep hoş gelir) */
const PENTA = [67, 69, 72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96];
export const izNotasi = (sira: number) => PENTA[Math.max(0, Math.min(PENTA.length - 1, sira))];

// ---------------------------------------------------------------- yardım (yaş ayarı yerine)
export const YARDIM = {
  /** bu kadar sn ipucu bulunamazsa Kino burnuyla gösterir */
  koklaSn: 10,
  /** bu kadar yanlış karttan sonra doğru kart hafifçe parlar */
  parlaYanlis: 2,
  /** ipucu görüldü ama dokunulmadıysa: Mino "İpucuna dokun!" der, parmak gösterir */
  dokunSn: 4,
  /** kart seçilmezse parmak doğru olmayan bir yoldan değil, kartlardan ipucuna sürüklemeyi gösterir */
  surukleSn: 7,
  /** iz takibinde sıradaki ize bu kadar sn dokunulmazsa parmak gösterir */
  izSn: 5,
};

// ---------------------------------------------------------------- kart sorusu
export interface SecimSonucu {
  dogru: boolean;
  /** bu seçimden sonra doğru kart parlasın mı (2 yanlış) */
  parla: boolean;
  /** kaçıncı yanlış (doğruda 0) */
  yanlis: number;
}
/** Bir halkanın kart sorusu: yanlış kartlar kendini anlatıp soluklaşır, 2 yanlıştan sonra doğru kart parlar. Kilitlenmez. */
export class Soru {
  readonly yanlislar: KartId[] = [];
  cozuldu = false;
  constructor(readonly halka: Halka) {
    if (!halka.dogru || !halka.kartlar.includes(halka.dogru)) throw new Error(`Halka ${halka.id}: doğru kart yok`);
  }
  sec(id: KartId): SecimSonucu {
    if (!this.halka.kartlar.includes(id)) throw new Error(`Bu soruda olmayan kart: ${id}`);
    if (id === this.halka.dogru) {
      this.cozuldu = true;
      return { dogru: true, parla: false, yanlis: 0 };
    }
    if (!this.yanlislar.includes(id)) this.yanlislar.push(id);
    return { dogru: false, parla: this.parlasin, yanlis: this.yanlislar.length };
  }
  /** seçilebilir kartlar (soluklaşan yanlışlar hariç) */
  get acik(): KartId[] {
    return this.halka.kartlar.filter((k) => !this.yanlislar.includes(k));
  }
  get parlasin(): boolean {
    return this.yanlislar.length >= YARDIM.parlaYanlis;
  }
}

/** Kartları karıştırır; Kino'nun gösterdiği kart ortada olmasın (atılıp gösterişi görünsün diye kenarda) */
export function kartSirasi(h: Halka, rnd: () => number = Math.random): KartId[] {
  const a = [...h.kartlar];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (h.kinoKart && a.length === 3 && a[1] === h.kinoKart) [a[1], a[2]] = [a[2], a[1]];
  return a;
}

// ---------------------------------------------------------------- vaka dosyası (ilerleme)
export const ADIMLAR = ['giris', 'iz', 'tuy', 'neden', 'nerede', 'final', 'roman'] as const;
export type Adim = (typeof ADIMLAR)[number];
export const sonrakiAdim = (a: Adim): Adim | null => ADIMLAR[ADIMLAR.indexOf(a) + 1] ?? null;
export const halkaAdimi = (a: Adim): HalkaId | null => (a === 'iz' || a === 'tuy' || a === 'neden' || a === 'nerede' ? a : null);

export interface DosyaGozu {
  halka: HalkaId;
  /** bulunan ipuçları */
  ipuclari: string[];
  /** "Demek ki" kartı girdi mi */
  demek: boolean;
}
/** Ekranın üstündeki vaka dosyası: her halkaya bir göz; ipuçları ve "demek ki" kartları buraya yapışır */
export class Dosya {
  readonly gozler: DosyaGozu[] = HALKALAR.map((h) => ({ halka: h.id, ipuclari: [], demek: false }));
  goz(h: HalkaId): DosyaGozu {
    return this.gozler.find((g) => g.halka === h)!;
  }
  ipucuEkle(h: HalkaId, ipucu: string) {
    const g = this.goz(h);
    if (!g.ipuclari.includes(ipucu)) g.ipuclari.push(ipucu);
  }
  demekEkle(h: HalkaId) {
    this.goz(h).demek = true;
  }
  /** halkanın bütün ipuçları bulundu mu */
  ipuclariTamam(h: HalkaId): boolean {
    const t = halka(h).ipuclari;
    return t.every((i) => this.goz(h).ipuclari.includes(i.id));
  }
  /** çözülen halka sayısı */
  get cozulen(): number {
    return this.gozler.filter((g) => g.demek).length;
  }
  get tamam(): boolean {
    return this.cozulen === HALKALAR.length;
  }
  /** Test kısayolu: bu adımdan önceki halkalar çözülmüş sayılır */
  static adimdan(a: Adim): Dosya {
    const d = new Dosya();
    const n = ADIMLAR.indexOf(a);
    for (const h of HALKALAR) {
      if (ADIMLAR.indexOf(h.id) >= n) break;
      for (const i of h.ipuclari) d.ipucuEkle(h.id, i.id);
      d.demekEkle(h.id);
    }
    return d;
  }
}

// ---------------------------------------------------------------- çizgi roman
export interface RomanKaresi {
  sira: number;
  halka: HalkaId;
  /** Gemini'nin çizeceği kare (assets/dedektif/roman-<n>.webp); yoksa sahne çizimlerinden kurulur */
  resim: string;
  /** karenin sahne kurgusu (yedek) */
  kurgu: 'iz' | 'zipla' | 'devril' | 'saklan';
}
export const ROMAN: RomanKaresi[] = [
  { sira: 1, halka: 'iz', resim: 'roman-1', kurgu: 'iz' },
  { sira: 2, halka: 'tuy', resim: 'roman-2', kurgu: 'zipla' },
  { sira: 3, halka: 'neden', resim: 'roman-3', kurgu: 'devril' },
  { sira: 4, halka: 'nerede', resim: 'roman-4', kurgu: 'saklan' },
];
/** Dosyadaki "demek ki" kartlarından çizgi roman kareleri (yalnız çözülen halkalar; sırayla) */
export const romanKareleri = (d: Dosya): RomanKaresi[] => ROMAN.filter((r) => d.goz(r.halka).demek);

// ---------------------------------------------------------------- kamera (saf hesap)
export interface Kamera {
  /** ölçek (dünya px → ekran px) */
  s: number;
  /** öteleme (ekran px): ekran = dünya * s + t */
  tx: number;
  ty: number;
}
/**
 * Kadrajı ekrandaki güvenli bölgeye sığdırır: dünya ekranı hep tamamen kaplar (boş kenar yok); kadraj sığmıyorsa
 * ortası güvenli bölgenin ortasına gelir. guvenli: ekran içinde [sol, üst, sağ, alt] px.
 */
export function kameraHesap(kadraj: Kadraj, dunya: { w: number; h: number }, ekran: { w: number; h: number }, guvenli: [number, number, number, number] = [0, 0, ekran.w, ekran.h], yakin = 1, enAz = 1): Kamera {
  const [x0, y0, x1, y1] = kadraj;
  const kw = Math.max(1, (x1 - x0) * dunya.w);
  const kh = Math.max(1, (y1 - y0) * dunya.h);
  const gw = Math.max(1, guvenli[2] - guvenli[0]);
  const gh = Math.max(1, guvenli[3] - guvenli[1]);
  const kapla = Math.max(ekran.w / dunya.w, ekran.h / dunya.h);
  const s = Math.max(kapla * enAz, Math.min(gw / kw, gh / kh) * yakin);
  const cx = ((x0 + x1) / 2) * dunya.w;
  const cy = ((y0 + y1) / 2) * dunya.h;
  const gx = (guvenli[0] + guvenli[2]) / 2;
  const gy = (guvenli[1] + guvenli[3]) / 2;
  const sinir = (v: number, en: number, cok: number) => Math.min(cok, Math.max(en, v));
  return {
    s,
    tx: sinir(gx - cx * s, ekran.w - dunya.w * s, 0),
    ty: sinir(gy - cy * s, ekran.h - dunya.h * s, 0),
  };
}
/** Dünya noktası (oran) → ekran px */
export const ekranda = (k: Kamera, dunya: { w: number; h: number }, x: number, y: number): [number, number] => [x * dunya.w * k.s + k.tx, y * dunya.h * k.s + k.ty];

// ---------------------------------------------------------------- seslendirme listesi
const topla = (v: unknown): string[] => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(topla) : v && typeof v === 'object' ? Object.values(v).flatMap(topla) : []);
/** Anlatıcı sesiyle seslendirilen cümleler: Mino, kart hayvanları, Pamuk (tonlu çalınır); Kino'nunkiler yedek olarak da */
export function dedektifCumleleri(): string[] {
  return [...new Set([...topla(D.mino), ...topla(D.kart), ...topla(D.pamuk)])];
}
/** Kino'nun kendi sesiyle seslendirilecek cümleler */
export function dedektifKinoCumleleri(): string[] {
  return topla(D.kino);
}
