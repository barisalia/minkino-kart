/**
 * Kino Ne Giysin? oyun mantığı (saf, DOM yok; tests/unit/giysin.test.ts).
 *
 * Koordinatlar Kino iskeletinin 2048'lik tuvalinde (assets/karakter-iskelet/kino.svg, ön görünüş).
 * Kış turu (Kardan adam): gerekli 5 parça (çorap → bot, mont → eldiven, bere); atkı serbest (montun üstüne);
 * şort ve güneş gözlüğü kışa uymaz (Kino komik tepki verir, giysi dolaba geri süzülür).
 */
import YER from './giysi-yer.json';

export type Bolge = 'bas' | 'goz' | 'boyun' | 'govde' | 'el' | 'bacak' | 'ayak';
export type GiysiId = 'corap' | 'bot' | 'mont' | 'atki' | 'bere' | 'eldiven' | 'sort' | 'gozluk';
export type Sozu = 'kafaya' | 'el_icin' | 'ayaga' | 'ustume' | 'boyna';

export interface Giysi {
  id: GiysiId;
  bolge: Bolge;
  /** Kino'nun üstündeki çizimler (assets/giysin/giysi/<parca>.webp) */
  parcalar: string[];
  /** çizim sırası: büyük olan önde */
  z: number;
  /** başka yere götürülünce Kino'nun sorusu (content/giysin.json → kino) */
  soru: Sozu;
  /** kış için: gerekli, serbest (giyilebilir) ya da uymaz */
  kis: 'gerekli' | 'serbest' | 'uymaz';
  /** başa bağlı (kafa döner, giysi de) */
  kafada?: boolean;
}

export const GIYSILER: Giysi[] = [
  { id: 'corap', bolge: 'ayak', parcalar: ['corap'], z: 1, soru: 'ayaga', kis: 'gerekli' },
  { id: 'bot', bolge: 'ayak', parcalar: ['bot'], z: 2, soru: 'ayaga', kis: 'gerekli' },
  { id: 'sort', bolge: 'bacak', parcalar: ['sort'], z: 3, soru: 'ayaga', kis: 'uymaz' },
  { id: 'mont', bolge: 'govde', parcalar: ['mont'], z: 4, soru: 'ustume', kis: 'gerekli' },
  { id: 'atki', bolge: 'boyun', parcalar: ['atki'], z: 5, soru: 'boyna', kis: 'serbest' },
  { id: 'eldiven', bolge: 'el', parcalar: ['eldiven-sol', 'eldiven-sag'], z: 6, soru: 'el_icin', kis: 'gerekli' },
  { id: 'gozluk', bolge: 'goz', parcalar: ['gozluk'], z: 7, soru: 'kafaya', kis: 'uymaz', kafada: true },
  { id: 'bere', bolge: 'bas', parcalar: ['bere'], z: 8, soru: 'kafaya', kis: 'gerekli', kafada: true },
];
export const giysi = (id: GiysiId): Giysi => GIYSILER.find((g) => g.id === id)!;

/** Parçaların iskelet tuvalindeki yeri [x, y, en, boy] (ekip/giysin/varlik.cjs üretir) */
export const PARCA_YERI = YER as unknown as Record<string, [number, number, number, number]>;

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
  | { tur: 'kisinDegil' }
  /** sıra yanlış: giysi bir an oturur, komik sonuç, sonra `geri`dekiler dolaba döner */
  | { tur: 'sira'; kural: Kural; geri: GiysiId[] };

/**
 * Giysi (id) iskelet tuvalinde (x, y) noktasına bırakıldı; giyili: o an Kino'nun üstündekiler.
 * Kendi bölgesi mıknatıs içindeyse (başka bölge daha yakın olsa bile) oturur: 4-5 yaşa hoşgörülü.
 */
export function birak(giyili: ReadonlySet<GiysiId>, id: GiysiId, x: number, y: number): Sonuc {
  const g = giysi(id);
  if (x < KINO_ICI.x0 || x > KINO_ICI.x1 || y < KINO_ICI.y0 || y > KINO_ICI.y1) return { tur: 'iska' };
  if (bolgeUzakligi(g.bolge, x, y) > MIKNATIS) {
    const b = enYakinBolge(x, y);
    // göz ile baş, bacak ile ayak birbirine çok yakın: kardeş bölgeye bırakmak "yanlış yer" sayılmaz, ıska
    return b === g.bolge ? { tur: 'iska' } : { tur: 'yanlisYer', bolge: b };
  }
  if (g.kis === 'uymaz') return { tur: 'kisinDegil' };
  if (id === 'corap' && giyili.has('bot')) return { tur: 'sira', kural: 'once_corap', geri: ['corap', 'bot'] };
  if (id === 'mont') {
    const geri = (['atki', 'eldiven'] as GiysiId[]).filter((k) => giyili.has(k));
    if (geri.length) return { tur: 'sira', kural: giyili.has('atki') ? 'once_mont' : 'eldiven_son', geri };
  }
  return { tur: 'yerles' };
}

/** Kış turunda eksik kalan gerekli giysiler (giyinme sırasıyla) */
export function eksikler(giyili: ReadonlySet<GiysiId>): GiysiId[] {
  return GIYSILER.filter((g) => g.kis === 'gerekli' && !giyili.has(g.id)).map((g) => g.id);
}

/**
 * İpucu: 8 sn hareket olmazsa parlayacak giysi (bölüm 9: önce sürükleme; dokununca kendiliğinden uçar).
 * Sıra kurallarına uyan ilk eksik: çorap → bot → mont → bere → eldiven.
 */
export function siradaki(giyili: ReadonlySet<GiysiId>): GiysiId | null {
  const sira: GiysiId[] = ['corap', 'bot', 'mont', 'bere', 'eldiven'];
  return sira.find((k) => !giyili.has(k)) ?? null;
}

/** Çizim sırası: arkadan öne */
export const zSirasi = (ids: Iterable<GiysiId>) => [...ids].sort((a, b) => giysi(a).z - giysi(b).z);
