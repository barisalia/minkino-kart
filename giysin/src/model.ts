/**
 * Kino Ne Giysin? oyun mantığı (saf, DOM yok; tests/unit/giysin.test.ts).
 *
 * Koordinatlar Kino iskeletinin 2048'lik tuvalinde (assets/karakter-iskelet/kino.svg, ön görünüş).
 * Dört mevsim, her birinin bir turu (ekip/senaryo/kino-ne-giysin.md, tablo 3):
 * - Kış · Kardan adam: çorap → bot, mont, bere, eldiven; atkı serbest; şort ve güneş gözlüğü kışa uymaz.
 * - İlkbahar · Çiçek toplamak (yağmur sonrası güneş, çamur): çorap → çizme, hırka, sepet; şapka serbest;
 *   mont ve bere sıcak gelir, sandalet çamura batar.
 * - Yaz · Deniz: mayo, şapka, güneş gözlüğü, kova; sandalet serbest; mont, bere, bot sıcak gelir; küçük görev güneş kremi.
 * - Sonbahar · Su birikintisi (yağmur): çorap → çizme, yağmurluk, şemsiye; hırka ve şapka ıslanır, sandalet çamura
 *   batar, gözlüğe damla dolar; küçük görev şemsiyeyi açmak.
 * Uymayan giysi oturur, Kino komik tepki verir (tepki türü aşağıda), giysi dolaba geri süzülür.
 */
import YER from './giysi-yer.json';

export type Mevsim = 'kis' | 'ilkbahar' | 'yaz' | 'sonbahar';
export const MEVSIMLER: Mevsim[] = ['kis', 'ilkbahar', 'yaz', 'sonbahar'];

export type Bolge = 'bas' | 'goz' | 'boyun' | 'govde' | 'el' | 'bacak' | 'ayak';
export type GiysiId =
  | 'corap' | 'bot' | 'mont' | 'atki' | 'bere' | 'eldiven' | 'sort' | 'gozluk'
  | 'hirka' | 'cizme' | 'sapka' | 'mayo' | 'sandalet' | 'yagmurluk' | 'sepet' | 'kova' | 'semsiye';
export type Sozu = 'kafaya' | 'el_icin' | 'ayaga' | 'ustume' | 'boyna';

export interface Giysi {
  id: GiysiId;
  bolge: Bolge;
  /** Kino'nun üstündeki çizimler (assets/giysin/giysi/<parca>.webp; takma adlar PARCA_DOSYA'da) */
  parcalar: string[];
  /** çizim sırası: büyük olan önde */
  z: number;
  /** başka yere götürülünce Kino'nun sorusu (content/giysin.json → kino) */
  soru: Sozu;
  /** başa bağlı (kafa döner, giysi de) */
  kafada?: boolean;
  /** patide tutulan eşya (sepet, kova, şemsiye): sağ patiye çizilir */
  tutulan?: boolean;
}

export const GIYSILER: Giysi[] = [
  { id: 'corap', bolge: 'ayak', parcalar: ['corap'], z: 1, soru: 'ayaga' },
  { id: 'bot', bolge: 'ayak', parcalar: ['bot'], z: 2, soru: 'ayaga' },
  { id: 'cizme', bolge: 'ayak', parcalar: ['cizme'], z: 2.1, soru: 'ayaga' },
  { id: 'sandalet', bolge: 'ayak', parcalar: ['sandalet'], z: 2.2, soru: 'ayaga' },
  { id: 'sort', bolge: 'bacak', parcalar: ['sort'], z: 3, soru: 'ayaga' },
  { id: 'mayo', bolge: 'govde', parcalar: ['mayo'], z: 3.5, soru: 'ustume' },
  { id: 'mont', bolge: 'govde', parcalar: ['mont'], z: 4, soru: 'ustume' },
  { id: 'hirka', bolge: 'govde', parcalar: ['hirka'], z: 4.1, soru: 'ustume' },
  { id: 'yagmurluk', bolge: 'govde', parcalar: ['yagmurluk'], z: 4.2, soru: 'ustume' },
  { id: 'atki', bolge: 'boyun', parcalar: ['atki'], z: 5, soru: 'boyna' },
  { id: 'eldiven', bolge: 'el', parcalar: ['eldiven-sol', 'eldiven-sag'], z: 6, soru: 'el_icin' },
  { id: 'sepet', bolge: 'el', parcalar: ['sepet', 'sepet-pati'], z: 6.5, soru: 'el_icin', tutulan: true },
  { id: 'kova', bolge: 'el', parcalar: ['kova', 'kova-pati'], z: 6.5, soru: 'el_icin', tutulan: true },
  { id: 'semsiye', bolge: 'el', parcalar: ['semsiye-acik', 'semsiye-kapali', 'semsiye-kanca', 'semsiye-pati'], z: 6.5, soru: 'el_icin', tutulan: true },
  { id: 'gozluk', bolge: 'goz', parcalar: ['gozluk'], z: 7, soru: 'kafaya', kafada: true },
  { id: 'bere', bolge: 'bas', parcalar: ['bere'], z: 8, soru: 'kafaya', kafada: true },
  { id: 'sapka', bolge: 'bas', parcalar: ['sapka'], z: 8.1, soru: 'kafaya', kafada: true },
];
export const giysi = (id: GiysiId): Giysi => GIYSILER.find((g) => g.id === id)!;

/** Parçaların iskelet tuvalindeki yeri [x, y, en, boy] (ekip/giysin/varlik.cjs üretir) */
const YERLER = YER as unknown as Record<string, [number, number, number, number]>;
/** Aynı çizimi kullanan parçalar (patinin parmakları her tutulan eşyanın üstünde) */
export const PARCA_DOSYA: Record<string, string> = { 'sepet-pati': 'pati-sag', 'kova-pati': 'pati-sag', 'semsiye-pati': 'pati-sag' };
export const parcaDosyasi = (p: string) => PARCA_DOSYA[p] ?? p;
export const PARCA_YERI: Record<string, [number, number, number, number]> = new Proxy(YERLER, { get: (t, p: string) => t[parcaDosyasi(p)] });
/** Kino'nun arkasında çizilen parçalar (açık şemsiye: sap başın arkasından geçer) */
export const ARKA_PARCA = new Set(['semsiye-acik']);
/** Şemsiye açılınca görünenler / gizlenenler */
export const ACIK_SEMSIYE = new Set(['semsiye-acik', 'semsiye-kanca']);
export const KAPALI_SEMSIYE = new Set(['semsiye-kapali']);

/** Bölgelerin merkezleri (iskelet tuvali); el iki tane */
export const BOLGE_MERKEZ: Record<Bolge, [number, number][]> = {
  bas: [[975, 330]],
  goz: [[950, 730]],
  boyun: [[1020, 1215]],
  govde: [[1030, 1390]],
  el: [[715, 1540], [1290, 1510]],
  bacak: [[1030, 1600]],
  ayak: [[1050, 1810]],
};

/** Mıknatıs: kendi bölgesine bu kadar yakınsa (tuval birimi) bölge parlar ve bırakınca oturur */
export const MIKNATIS = 430;
/** Kino'nun üstüne bırakılmış sayılır (bundan uzak: ıska, giysi dolaba döner) */
export const KINO_ICI = { x0: 300, x1: 1750, y0: 80, y1: 2000 };

// ---------------------------------------------------------------- mevsim turları

/** Uymayan giysinin tepkisi: titrer (buz sarkıtı), buğu, terler, çamura batar, ıslanır, gözlüğe damla dolar */
export type Tepki = 'usu' | 'bugu' | 'sicak' | 'camur' | 'islak' | 'damla';
/** Uyan giysinin sevimli tepkisi */
export type IyiTepki = 'sicacik' | 'cool' | 'pat' | 'keyif' | 'zipla';
export type Gorev = 'krem' | 'semsiye';

export interface Tur {
  mevsim: Mevsim;
  /** dolaptaki 8 giysi: 3 askıda (üst sıra), 3 rafta, 2 en altta */
  dizi: GiysiId[];
  /** gerekli giysiler, giyinme sırasıyla (ipucu bu sırayla parlar) */
  gerekli: GiysiId[];
  /** giyilebilir ama şart değil */
  serbest: GiysiId[];
  uymaz: Partial<Record<GiysiId, Tepki>>;
  iyi: Partial<Record<GiysiId, IyiTepki>>;
  /** hepsi giyilince küçük görev (bölüm 1, adım 4) */
  gorev: Gorev | null;
}

export const TURLAR: Record<Mevsim, Tur> = {
  kis: {
    mevsim: 'kis',
    dizi: ['mont', 'atki', 'sort', 'bere', 'gozluk', 'eldiven', 'corap', 'bot'],
    gerekli: ['corap', 'bot', 'mont', 'bere', 'eldiven'],
    serbest: ['atki'],
    uymaz: { sort: 'usu', gozluk: 'bugu' },
    iyi: { mont: 'sicacik' },
    gorev: null,
  },
  ilkbahar: {
    mevsim: 'ilkbahar',
    dizi: ['hirka', 'mont', 'sapka', 'bere', 'sandalet', 'sepet', 'corap', 'cizme'],
    gerekli: ['corap', 'cizme', 'hirka', 'sepet'],
    serbest: ['sapka'],
    uymaz: { mont: 'sicak', bere: 'sicak', sandalet: 'camur' },
    iyi: { hirka: 'keyif', cizme: 'pat' },
    gorev: null,
  },
  yaz: {
    mevsim: 'yaz',
    dizi: ['mayo', 'mont', 'sapka', 'bere', 'gozluk', 'kova', 'sandalet', 'bot'],
    gerekli: ['mayo', 'sapka', 'gozluk', 'kova'],
    serbest: ['sandalet'],
    uymaz: { mont: 'sicak', bere: 'sicak', bot: 'sicak' },
    iyi: { gozluk: 'cool' },
    gorev: 'krem',
  },
  sonbahar: {
    mevsim: 'sonbahar',
    dizi: ['yagmurluk', 'hirka', 'sapka', 'gozluk', 'semsiye', 'corap', 'cizme', 'sandalet'],
    gerekli: ['corap', 'cizme', 'yagmurluk', 'semsiye'],
    serbest: [],
    uymaz: { hirka: 'islak', sapka: 'islak', sandalet: 'camur', gozluk: 'damla' },
    iyi: { cizme: 'pat', yagmurluk: 'keyif' },
    gorev: 'semsiye',
  },
};

/** Dolapta askıda duran (sallanan) giysiler: dizinin üst sırası */
export const askida = (t: Tur) => t.dizi.slice(0, 3);

const uzak = (a: [number, number], x: number, y: number) => Math.hypot(a[0] - x, a[1] - y);
export const bolgeUzakligi = (b: Bolge, x: number, y: number) => Math.min(...BOLGE_MERKEZ[b].map((m) => uzak(m, x, y)));

/** Bırakılan noktanın en yakın bölgesi */
export function enYakinBolge(x: number, y: number): Bolge {
  let en: Bolge = 'govde';
  let d = Infinity;
  for (const b of Object.keys(BOLGE_MERKEZ) as Bolge[]) {
    const u = bolgeUzakligi(b, x, y);
    if (u < d) {
      d = u;
      en = b;
    }
  }
  return en;
}

export type Kural = 'once_corap' | 'once_mont' | 'eldiven_son';
export type Sonuc =
  | { tur: 'iska' }
  | { tur: 'yanlisYer'; bolge: Bolge }
  | { tur: 'yerles' }
  /** mevsime uymaz: giysi bir an oturur, Kino tepki verir, giysi dolaba döner */
  | { tur: 'uymaz'; tepki: Tepki }
  /** sıra yanlış: giysi bir an oturur, komik sonuç, sonra `geri`dekiler dolaba döner */
  | { tur: 'sira'; kural: Kural; geri: GiysiId[] };

/** ayakkabılar (çoraptan sonra giyilir) ve üst giysiler (atkı ile eldivenden önce) */
const AYAKKABI: GiysiId[] = ['bot', 'cizme'];
const UST: GiysiId[] = ['mont', 'hirka', 'yagmurluk'];

/**
 * Giysi (id) iskelet tuvalinde (x, y) noktasına bırakıldı; giyili: o an Kino'nun üstündekiler; tur: mevsim turu.
 * Kendi bölgesi mıknatıs içindeyse (başka bölge daha yakın olsa bile) oturur: 4-5 yaşa hoşgörülü.
 */
export function birak(giyili: ReadonlySet<GiysiId>, id: GiysiId, x: number, y: number, tur: Tur = TURLAR.kis): Sonuc {
  const g = giysi(id);
  if (x < KINO_ICI.x0 || x > KINO_ICI.x1 || y < KINO_ICI.y0 || y > KINO_ICI.y1) return { tur: 'iska' };
  if (bolgeUzakligi(g.bolge, x, y) > MIKNATIS) {
    const b = enYakinBolge(x, y);
    // göz ile baş, bacak ile ayak birbirine çok yakın: kardeş bölgeye bırakmak "yanlış yer" sayılmaz, ıska
    return b === g.bolge ? { tur: 'iska' } : { tur: 'yanlisYer', bolge: b };
  }
  const tepki = tur.uymaz[id];
  if (tepki) return { tur: 'uymaz', tepki };
  if (id === 'corap') {
    const ayakkabi = AYAKKABI.find((a) => giyili.has(a));
    if (ayakkabi) return { tur: 'sira', kural: 'once_corap', geri: ['corap', ayakkabi] };
  }
  if (UST.includes(id)) {
    const geri = (['atki', 'eldiven'] as GiysiId[]).filter((k) => giyili.has(k));
    if (geri.length) return { tur: 'sira', kural: giyili.has('atki') ? 'once_mont' : 'eldiven_son', geri };
  }
  return { tur: 'yerles' };
}

/** Turda eksik kalan gerekli giysiler (giyinme sırasıyla) */
export function eksikler(giyili: ReadonlySet<GiysiId>, tur: Tur = TURLAR.kis): GiysiId[] {
  return tur.gerekli.filter((g) => !giyili.has(g));
}

/**
 * İpucu: 8 sn hareket olmazsa parlayacak giysi (bölüm 9: önce sürükleme; dokununca kendiliğinden uçar).
 * Sıra kurallarına uyan ilk eksik (turun gerekli sırası).
 */
export function siradaki(giyili: ReadonlySet<GiysiId>, tur: Tur = TURLAR.kis): GiysiId | null {
  return eksikler(giyili, tur)[0] ?? null;
}

/** Çizim sırası: arkadan öne */
export const zSirasi = (ids: Iterable<GiysiId>) => [...ids].sort((a, b) => giysi(a).z - giysi(b).z);

/** Bir sonraki mevsim (sonbahardan sonra yok) */
export const sonrakiMevsim = (m: Mevsim): Mevsim | null => MEVSIMLER[MEVSIMLER.indexOf(m) + 1] ?? null;
