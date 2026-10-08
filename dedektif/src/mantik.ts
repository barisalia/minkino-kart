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
/** Vaka 1: ev odaları; Vaka 2: bahçenin üç bölümü (çamaşır ipi, çalılı yol, gölet kenarı) */
export type OdaId = 'calisma' | 'koridor' | 'yatak' | 'mutfak' | 'bahce-ip' | 'bahce-yol' | 'bahce-golet';
/** Odanın en / boy oranı (resimlerin kendi oranı: film/ev 2752×1536, koridor ve yatak odası 1920×1080, bahçe 4096×2286) */
export const ODA_ORAN: Record<OdaId, number> = {
  calisma: 2752 / 1536,
  koridor: 16 / 9,
  yatak: 16 / 9,
  mutfak: 2752 / 1536,
  'bahce-ip': 4096 / 2286,
  'bahce-yol': 4096 / 2286,
  'bahce-golet': 4096 / 2286,
};
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
/**
 * Kartlar ipucunun kopyası değil, sorunun cevabıdır: Halka 1'de izi bırakabilecek HAYVANLAR (kedi, ördek, zürafa;
 * çocuk izi hayvanın ayağıyla karşılaştırır), Halka 2'de üç kedi, Halka 3'te kedinin masaya zıplama NEDENLERİ
 * (kelebeği kovalamak, süt içmek, uyumak: beyaz kedinin kendi sahnesi).
 */
export type KartId = 'zurafa' | 'ordek' | 'kedi' | 'kedi-turuncu' | 'kedi-siyah' | 'kedi-beyaz' | 'kedi-sut' | 'kedi-uyku' | 'kedi-kelebek';
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
  zurafa: { id: 'zurafa', resim: 'zurafa', tepki: 'zurafa', renk: '#f6c343' },
  ordek: { id: 'ordek', resim: 'ordek', tepki: 'ordek', renk: '#ff9f43' },
  kedi: { id: 'kedi', resim: 'kart-kedi-gri', renk: '#b9b3c6' },
  'kedi-turuncu': { id: 'kedi-turuncu', resim: 'kart-kedi-turuncu', tepki: 'turuncu', renk: '#f39a3d' },
  'kedi-siyah': { id: 'kedi-siyah', resim: 'kart-kedi-siyah', tepki: 'siyah', renk: '#3b3340' },
  'kedi-beyaz': { id: 'kedi-beyaz', resim: 'kart-kedi-beyaz', renk: '#fbf7f2' },
  'kedi-sut': { id: 'kedi-sut', resim: 'kart-kedi-sut', tepki: 'sut', renk: '#7fb4e6' },
  'kedi-uyku': { id: 'kedi-uyku', resim: 'kart-kedi-uyku', tepki: 'yastik', renk: '#e2b7ef' },
  'kedi-kelebek': { id: 'kedi-kelebek', resim: 'kart-kedi-kelebek', renk: '#ffd23f' },
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
    ipuclari: [{ id: 'pati-hali', oda: 'calisma', resim: 'kart-kedi-pati-izi', foto: 'ipucu-kedi-pati-hali', x: 0.555, y: 0.85, h: 0.075, don: -18, gizli: true }],
    soru: M.iz_kimin,
    kino: K.zurafa,
    kinoKart: 'zurafa',
    kartlar: ['zurafa', 'ordek', 'kedi'],
    dogru: 'kedi',
    demekKi: M.demek_kedi,
    demekResim: 'kart-kedi-gri',
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
    kinoKart: 'kedi-sut',
    kartlar: ['kedi-sut', 'kedi-uyku', 'kedi-kelebek'],
    dogru: 'kedi-kelebek',
    demekKi: M.demek_kelebek,
    demekResim: 'kart-kedi-kelebek',
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
  kalem: { x: 0.628, y: 0.674, h: 0.042, don: -3 },
  /** pencerenin camı (kelebek bunun içinde uçar) */
  cam: { x0: 0.345, y0: 0.13, x1: 0.705, y1: 0.6 },
  /** pervaz (toz) */
  pervaz: { x: 0.61, y: 0.646 },
};

/**
 * İzler odanın alt kenarına inmez: kamera odanın altını ekranın altına dayar, en alttaki iz telefonun ev çubuğunun
 * (yatayda alttaki ~21 px) üstünde kalsın. Kural: iz merkezi y + h/2 ≤ IZ_ALT_SINIR (e2e: izler kenardan uzak).
 */
export const IZ_ALT_SINIR = 0.955;
/** Lambadan sağa giden izler: halının alt kenarından, trenle terliklerin arasındaki boşluğa (terliklere basmaz) */
export const CALISMA_IZLERI: IzNoktasi[] = [
  { x: 0.54, y: 0.912, don: 78, h: 0.058 },
  { x: 0.579, y: 0.89, don: 96, h: 0.058 },
  { x: 0.617, y: 0.906, don: 80, h: 0.058 },
  { x: 0.656, y: 0.885, don: 98, h: 0.058 },
  { x: 0.694, y: 0.9, don: 82, h: 0.057 },
  { x: 0.733, y: 0.876, don: 92, h: 0.057 },
  { x: 0.771, y: 0.888, don: 78, h: 0.056 },
  { x: 0.808, y: 0.864, don: 84, h: 0.056 },
];
/** Koridor: önden ortaya kadar ortak iz, sonra ikiye ayrılır (perspektif: uzaktaki izler küçük) */
export const KORIDOR_IZLERI: IzNoktasi[] = [
  { x: 0.508, y: 0.925, don: -4, h: 0.058 },
  { x: 0.486, y: 0.882, don: -8, h: 0.052 },
  { x: 0.5, y: 0.845, don: 2, h: 0.046 },
];
export type Yol = 'mutfak' | 'yatak';
/** Kapılar: sol kemerli kapı ve sağ kapı (eşikleri) */
export const KAPI = { sol: { x: 0.315, y: 0.745 }, sag: { x: 0.725, y: 0.805 } };
/**
 * Ayrılan izler: kapıya doğru küçülür. Mutfağa gidenler büyük ve tırnaklı (Kino), yatak odasına gidenler küçük, yuvarlak.
 * dar (dikey telefon): kamera koridorun ortasından dar bir dilim görür, Mino ile Kino alt köşelerde durur; iki yol
 * yanlara (kapılar zaten görünmez) değil, aradaki boşlukta derine doğru hafifçe ayrılır: her iz ekranda, karakterlerin üstünde.
 */
export function yolIzleri(yan: 'sol' | 'sag', dar = false): IzNoktasi[] {
  if (dar)
    return yan === 'sol'
      ? [
          { x: 0.479, y: 0.775, don: -26, h: 0.044 },
          { x: 0.464, y: 0.715, don: -30, h: 0.04 },
          { x: 0.45, y: 0.655, don: -28, h: 0.036 },
        ]
      : [
          { x: 0.523, y: 0.775, don: 26, h: 0.044 },
          { x: 0.538, y: 0.715, don: 30, h: 0.04 },
          { x: 0.552, y: 0.655, don: 28, h: 0.036 },
        ];
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
  { x: 0.6, y: 0.91, don: -64, h: 0.06 },
  { x: 0.545, y: 0.888, don: -70, h: 0.058 },
  { x: 0.49, y: 0.868, don: -62, h: 0.057 },
  { x: 0.437, y: 0.85, don: -70, h: 0.055 },
];
export const YATAK = {
  /** yatağın ön katmanının odadaki kutusu (assets/dedektif/yatak-on.webp: yatak-odasi resminden yatağın çizgisiyle kesilmiş; 1920×1080 resimde 0,470 822×470 px) */
  on: { x0: 0, y0: 470 / 1080, x1: 822 / 1920, y1: 1 - 140 / 1080 },
  /** yatağın altındaki karanlık aralık */
  alt: { x0: 0.06, y0: 0.775, x1: 0.405, y1: 0.842 },
  /** sallanan kuyruk ucunun kökü (yatağın altında, ayak ucu bacağının hemen solunda) */
  kuyruk: { x: 0.455, y: 0.77, h: 0.18 },
  /**
   * Pamuk'un saklandığı yer ve çıkınca durduğu yer (ayak tabanı). Saklanırken gövdesi ayak ucunun arkasında kalır
   * (yatağın kenarından sağa yalnız sallanan kuyruğu taşar); kenar: saklanırken bu çizginin solu kırpılır
   */
  saklan: { x: 0.381, y: 0.85 },
  kenar: 0.397,
  cik: { x: 0.53, y: 0.94 },
};
/** Mutfak: Kino'nun izleri buzdolabının önünde biter */
export const MUTFAK_IZLERI: IzNoktasi[] = [
  { x: 0.5, y: 0.905, don: -70, h: 0.072 },
  { x: 0.41, y: 0.893, don: -76, h: 0.071 },
  { x: 0.32, y: 0.88, don: -70, h: 0.07 },
  { x: 0.24, y: 0.866, don: -74, h: 0.068 },
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
/** Kart sorusunun bilmesi gerekenler (Vaka 1'in Halka'sı da, Vaka 2'nin halkaları da bu kalıpta) */
export interface SorguHalkasi {
  id: string;
  soru: string;
  kino?: string;
  kinoKart?: string;
  kartlar: readonly string[];
  dogru?: string;
  demekKi: string;
  demekResim: string;
}
export interface SecimSonucu {
  dogru: boolean;
  /** bu seçimden sonra doğru kart parlasın mı (2 yanlış) */
  parla: boolean;
  /** kaçıncı yanlış (doğruda 0) */
  yanlis: number;
}
/** Bir halkanın kart sorusu: yanlış kartlar kendini anlatıp soluklaşır, 2 yanlıştan sonra doğru kart parlar. Kilitlenmez. */
export class Soru {
  readonly yanlislar: string[] = [];
  cozuldu = false;
  constructor(readonly halka: SorguHalkasi) {
    if (!halka.dogru || !halka.kartlar.includes(halka.dogru)) throw new Error(`Halka ${halka.id}: doğru kart yok`);
  }
  sec(id: string): SecimSonucu {
    if (!this.halka.kartlar.includes(id)) throw new Error(`Bu soruda olmayan kart: ${id}`);
    if (id === this.halka.dogru) {
      this.cozuldu = true;
      return { dogru: true, parla: false, yanlis: 0 };
    }
    if (!this.yanlislar.includes(id)) this.yanlislar.push(id);
    return { dogru: false, parla: this.parlasin, yanlis: this.yanlislar.length };
  }
  /** seçilebilir kartlar (soluklaşan yanlışlar hariç) */
  get acik(): string[] {
    return this.halka.kartlar.filter((k) => !this.yanlislar.includes(k));
  }
  get parlasin(): boolean {
    return this.yanlislar.length >= YARDIM.parlaYanlis;
  }
}

/** Kartları karıştırır; Kino'nun gösterdiği kart ortada olmasın (atılıp gösterişi görünsün diye kenarda) */
export function kartSirasi(h: SorguHalkasi, rnd: () => number = Math.random): string[] {
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
  halka: string;
  /** bulunan ipuçları */
  ipuclari: string[];
  /** "Demek ki" kartı girdi mi */
  demek: boolean;
}
/** Dosyadaki bir göz için halkanın bilmesi gerekenler (Vaka 1 ve Vaka 2 halkaları) */
export interface DosyaHalkasi {
  id: string;
  ipuclari: readonly { id: string; resim: string; foto?: string }[];
  demekResim: string;
}
/** Ekranın üstündeki vaka dosyası: her halkaya bir göz; ipuçları ve "demek ki" kartları buraya yapışır */
export class Dosya {
  readonly gozler: DosyaGozu[];
  constructor(readonly halkalar: readonly DosyaHalkasi[] = HALKALAR) {
    this.gozler = halkalar.map((h) => ({ halka: h.id, ipuclari: [], demek: false }));
  }
  goz(h: string): DosyaGozu {
    return this.gozler.find((g) => g.halka === h)!;
  }
  ipucuEkle(h: string, ipucu: string) {
    const g = this.goz(h);
    if (!g.ipuclari.includes(ipucu)) g.ipuclari.push(ipucu);
  }
  demekEkle(h: string) {
    this.goz(h).demek = true;
  }
  /** halkanın bütün ipuçları bulundu mu */
  ipuclariTamam(h: string): boolean {
    const t = this.halkalar.find((x) => x.id === h)?.ipuclari ?? [];
    return t.every((i) => this.goz(h).ipuclari.includes(i.id));
  }
  /** çözülen halka sayısı */
  get cozulen(): number {
    return this.gozler.filter((g) => g.demek).length;
  }
  get tamam(): boolean {
    return this.cozulen === this.halkalar.length;
  }
  /** Test kısayolu: bu adımdan önceki halkalar çözülmüş sayılır (adımlar: vakanın adım sırası) */
  static adimdan(a: string, adimlar: readonly string[] = ADIMLAR, halkalar: readonly DosyaHalkasi[] = HALKALAR): Dosya {
    const d = new Dosya(halkalar);
    const n = adimlar.indexOf(a);
    for (const h of halkalar) {
      if (adimlar.indexOf(h.id) >= n) break;
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
/** Arka plan resmi cihazda doğal pikselinin en çok bu katına büyür (üstü bulanık görünür; GORSEL-DENETIM.md #4) */
export const PIKSEL_SINIR = 2.2;
/**
 * Kameranın en büyük ölçeği: ölçek × cihaz piksel oranı, resmin dünya pikseli başına doğal pikselinin (dogalBoy / ODA_H)
 * PIKSEL_SINIR katını geçmez. Daha büyük çizim gelince sınır kendiliğinden açılır.
 */
export const yakinlikSiniri = (dogalBoy: number, dpr: number) => (PIKSEL_SINIR * dogalBoy) / ODA_H / Math.max(1, dpr);
/**
 * Kadrajı ekrandaki güvenli bölgeye sığdırır: dünya ekranı hep tamamen kaplar (boş kenar yok); kadraj sığmıyorsa
 * ortası güvenli bölgenin ortasına gelir. guvenli: ekran içinde [sol, üst, sağ, alt] px. enCok: ölçeğin üst sınırı
 * (yakinlikSiniri; resim bulanıklaşmasın): yakınlık bunu geçmez, ama ekranı kaplamak her zaman önce gelir.
 */
export function kameraHesap(kadraj: Kadraj, dunya: { w: number; h: number }, ekran: { w: number; h: number }, guvenli: [number, number, number, number] = [0, 0, ekran.w, ekran.h], yakin = 1, enAz = 1, enCok = Infinity): Kamera {
  const [x0, y0, x1, y1] = kadraj;
  const kw = Math.max(1, (x1 - x0) * dunya.w);
  const kh = Math.max(1, (y1 - y0) * dunya.h);
  const gw = Math.max(1, guvenli[2] - guvenli[0]);
  const gh = Math.max(1, guvenli[3] - guvenli[1]);
  const kapla = Math.max(ekran.w / dunya.w, ekran.h / dunya.h);
  const s = Math.max(kapla, Math.min(enCok, Math.max(kapla * enAz, Math.min(gw / kw, gh / kh) * yakin)));
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
  const v2 = D.vaka2;
  return [...new Set([...topla(D.mino), ...topla(D.kart), ...topla(D.pamuk), ...topla(v2.mino), ...topla(v2.ordek), ...topla(v2.konuk)])];
}
/** Kino'nun kendi sesiyle seslendirilecek cümleler (iki vaka) */
export function dedektifKinoCumleleri(): string[] {
  return [...new Set([...topla(D.kino), ...topla(D.vaka2.kino)])];
}

// ---------------------------------------------------------------- dikey çalışma odası (film/ev/oda-dikey, 1536×2752)
/**
 * Dikey ekranda (boy > en) çalışma odası 9:16 tek resimdir: üstte ince pencere şeridi, ortada duvar, altta geniş
 * parke ve ortası boş oval halı (y ≈ 0.6-0.88). Eşyalar, ipuçları ve izler halıya / zemine; kadrajlar o orana.
 * calismaYerlesim(true) tabloları (CALISMA, CALISMA_IZLERI, KADRAJ, ipuçları) yerinde bu değerlere çevirir,
 * false yatay değerleri geri koyar (oda her vakada yeniden kurulur; dosya yoksa hep yatay).
 */
export const DIKEY_ORAN = 1536 / 2752;
const DIKEY = {
  calisma: {
    masa: { x: 0.7, y: 0.635, h: 0.15 },
    masaUst: { x: 0.7, y: 0.511 },
    lambaDevrik: { x: 0.3, y: 0.73, h: 0.11 },
    lambaDik: { x: 0.6, y: 0.513, h: 0.13 },
    kalem: { x: 0.655, y: 0.505, h: 0.017, don: -8 },
    cam: { x0: 0.235, y0: 0.004, x1: 0.765, y1: 0.112 },
    pervaz: { x: 0.6, y: 0.135 },
  },
  izler: [
    // Mino ile Kino alt köşelerde durur: izler halının üst yarısından sağa gider (dokunuş karakterlere gelmesin).
    // Kamera dikeyde odanın ortasından ~%75'ini görür (x ≈ 0.12-0.88): son iz de kenardan uzakta, ekranın içinde
    { x: 0.37, y: 0.727, don: 78, h: 0.04 },
    { x: 0.427, y: 0.757, don: 96, h: 0.04 },
    { x: 0.484, y: 0.727, don: 80, h: 0.04 },
    { x: 0.541, y: 0.757, don: 98, h: 0.04 },
    { x: 0.598, y: 0.727, don: 84, h: 0.04 },
    { x: 0.655, y: 0.755, don: 92, h: 0.04 },
    { x: 0.712, y: 0.725, don: 86, h: 0.04 },
    { x: 0.77, y: 0.75, don: 92, h: 0.04 },
  ] as IzNoktasi[],
  kadraj: {
    genel: [0, 0, 1, 1],
    giris: [0, 0.4, 1, 1],
    hali: [0, 0.55, 1, 0.95],
    masa: [0.25, 0.36, 1, 0.68],
    pencere: [0.05, 0, 0.95, 0.4],
    sahne3: [0, 0.3, 1, 0.95],
    izler: [0.2, 0.6, 1, 1],
    final: [0, 0.35, 1, 1],
  } as Partial<Record<KadrajAdi, Kadraj>>,
  ipucu: {
    'pati-hali': { x: 0.55, y: 0.8, h: 0.052 },
    tuy: { x: 0.79, y: 0.505, h: 0.06 },
    toz: { x: 0.6, y: 0.135, h: 0.042 },
    kelebek: { x: 0.45, y: 0.08, h: 0.055 },
  } as Record<string, { x: number; y: number; h: number }>,
};
const YATAY = {
  oran: ODA_ORAN.calisma,
  calisma: structuredClone(CALISMA),
  izler: structuredClone(CALISMA_IZLERI),
  kadraj: structuredClone(KADRAJ) as Record<KadrajAdi, Kadraj>,
  ipucu: Object.fromEntries(HALKALAR.flatMap((hk) => hk.ipuclari).map((t) => [t.id, { x: t.x, y: t.y, h: t.h }])),
};
/** Çalışma odası yerleşimi dikey mi (calismaYerlesim son çağrısı) */
export let calismaDikey = false;
export function calismaYerlesim(dikey: boolean) {
  calismaDikey = dikey;
  ODA_ORAN.calisma = dikey ? DIKEY_ORAN : YATAY.oran;
  const c = structuredClone(dikey ? DIKEY.calisma : YATAY.calisma);
  for (const k of Object.keys(c) as (keyof typeof CALISMA)[]) Object.assign(CALISMA[k], c[k]);
  CALISMA_IZLERI.splice(0, CALISMA_IZLERI.length, ...structuredClone(dikey ? DIKEY.izler : YATAY.izler));
  const tablo = KADRAJ as Record<KadrajAdi, Kadraj>;
  for (const [ad, k] of Object.entries(YATAY.kadraj) as [KadrajAdi, Kadraj][]) tablo[ad] = [...((dikey ? DIKEY.kadraj[ad] : undefined) ?? k)] as Kadraj;
  for (const t of HALKALAR.flatMap((hk) => hk.ipuclari)) Object.assign(t, (dikey ? DIKEY.ipucu : YATAY.ipucu)[t.id]);
}
