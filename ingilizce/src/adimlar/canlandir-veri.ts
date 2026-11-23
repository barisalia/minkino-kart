/**
 * Söyle, Canlansın (22 Kasım 2026) · DOM'suz veri: sahneler, parlayan yerler, plan, çizim ve ses listeleri.
 *
 * Neden: Renkler ve Yüzüm adalarında adaya özel tek etkinlik yoktu; Taşıtlar'da yalnız üç adanın paylaştığı Say ve Koy
 * vardı (Barış: "az tekrar, çok çeşit"). Bu üç adada 2. dersin ve şenliğin sonundaki düz "kelimeleri söyle" adımının
 * yerine adanın sahnesi gelir. Yeni bir söyleme eklenmez (22 Kasım: "devamlı ses soruyorsun"); var olan söyleme
 * sahneye bağlanır:
 *   - Yüzüm · Kardan Adam: kardan adamın bir yeri parlar, çocuk adını söyler ("nose"), o parça gelir (havuç burun).
 *     22 Kasım 08:19 kararı: klasik kardan adam; bacak, çizme, el ve eldiven yok. Yalnız yüzün kelimeleri (head: başına
 *     kova, eyes, nose, mouth); süpürge fonda dal kolunda. Yüzüm'ün 2. dersi (hands, feet, head, legs) düz söylemeyle kalır.
 *   - Renkler · Boyama Bahçesi: beyaz bir eşya parlar, yanında renk kartı; çocuk rengi söyler, eşya o renge boyanır.
 *   - Taşıtlar · Uyanan Taşıtlar: bir taşıt parlar; çocuk adını söyler, taşıt sesini çıkarıp yola çıkar ve geri gelir.
 * Hepsi bitince sahnenin tamamı birlikte canlanır.
 *
 * Çizimler (Astra, Paket 35): her sahne 1600 × 1000 aynı tuvalde; `fon` dolu zemin, parçalar şeffaf katman. Çizimi ya da
 * Ceren'in giriş sözü gelmeden ders bu adımı açmaz, düz söyleme adımını oynar (taslakta yer tutucuyla açılır).
 */
import type { Kelime, SesMetni } from '../icerik';
import type { Yas } from '../plan';

type Rnd = () => number;
const karistir = <T>(l: readonly T[], rnd: Rnd): T[] => { const a = [...l]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/** Tuvaldeki kutu, piksel: sol, üst, genişlik, yükseklik (1600 × 1000 tuvalde) */
export type Kutu = readonly [number, number, number, number];
export const TUVAL = { en: 1600, boy: 1000 } as const;

/** Söylenince: parça belirir (kardan adam), eşya boyanır (bahçe) ya da baştan duran taşıt hareket eder */
export type Canlanma = 'belir' | 'boyan' | 'yola';
/** Canlanırken çalan küçük hareket (canlandir.css) */
export type ScHareket = 'sek' | 'salla' | 'parla' | 'sur' | 'uc' | 'firla' | 'dalga';

export interface ScYeri {
  /** parlayan yer(ler); ilki hareketin merkezi */
  kutular: readonly Kutu[];
  hareket: ScHareket;
}

export interface CanlandirSahnesi {
  ad: 'kardan' | 'boya' | 'garaj';
  uniteId: string;
  canlanma: Canlanma;
  /** taslak kipinde fonun yerine düz renk */
  renk: string;
  /** Polly'nin sorusu: kelime çoğulsa "What are they?" */
  soru: (w: Kelime) => string;
  /** parlayan yerin yanında kelimenin kartı da görünsün mü (renkler: renk kartı) */
  kartGoster: boolean;
  yerler: Readonly<Record<string, ScYeri>>;
  giris: SesMetni;
  son: SesMetni;
}

const hece = (s: string) => (s.toLowerCase().match(/[aeiouy]+/g) ?? []).length || 1;
const polly = (id: string, metin: string): SesMetni => ({ id, kim: 'polly', dil: 'en', metin, hece: hece(metin) });
const ceren = (id: string, metin: string): SesMetni => ({ id, kim: 'ceren', dil: 'tr', metin, hece: (metin.toLocaleLowerCase('tr').match(/[aeıioöuü]/g) ?? []).length });
const COGUL = new Set(['eyes', 'ears', 'hands', 'feet', 'legs']);

export const CANLANDIR_SAHNELERI: readonly CanlandirSahnesi[] = [
  {
    ad: 'kardan', uniteId: 'yuzum', canlanma: 'belir', renk: '#e8f1fb', kartGoster: false,
    soru: (w) => (COGUL.has(w.id) ? 'en/g-what-are-they' : 'en/g-what-is-it'),
    yerler: {
      // kardan adam: baş topu 665–935 × 110–380, gövde topu 650–950 × 360–630, alt top 640–960 × 600–860; dal kollar ve
      // sağ dal kolun tuttuğu süpürge fonda
      head: { kutular: [[670, 10, 260, 150]], hareket: 'sek' },
      eyes: { kutular: [[715, 190, 170, 60]], hareket: 'parla' },
      nose: { kutular: [[790, 252, 100, 48]], hareket: 'salla' },
      mouth: { kutular: [[720, 305, 160, 50]], hareket: 'sek' },
    },
    giris: ceren('tr/c-sc-kardan-giris', 'Kardan adamımızın eksikleri var! Neresi parlıyorsa onu İngilizce söyle, o parça gelsin.'),
    son: polly('en/g-sc-kardan-son', 'Hello, Mister Snowman!'),
  },
  {
    ad: 'boya', uniteId: 'renkler', canlanma: 'boyan', renk: '#f4f8ec', kartGoster: true,
    soru: () => 'en/g-what-color',
    yerler: {
      yellow: { kutular: [[1300, 40, 220, 220]], hareket: 'parla' },
      green: { kutular: [[60, 120, 340, 600]], hareket: 'salla' },
      blue: { kutular: [[460, 700, 160, 180]], hareket: 'sek' },
      red: { kutular: [[660, 760, 150, 150]], hareket: 'sek' },
      orange: { kutular: [[880, 60, 200, 300]], hareket: 'salla' },
      pink: { kutular: [[1180, 640, 120, 300]], hareket: 'salla' },
      purple: { kutular: [[860, 420, 280, 300]], hareket: 'sek' },
      black: { kutular: [[1360, 800, 180, 140]], hareket: 'sek' },
    },
    giris: ceren('tr/c-sc-boya-giris', 'Bahçe bembeyaz kalmış! Parlayan eşyanın rengini İngilizce söyle, o renge boyansın.'),
    son: polly('en/g-sc-boya-son', 'What a colorful garden!'),
  },
  {
    ad: 'garaj', uniteId: 'tasitlar', canlanma: 'yola', renk: '#e6f3f6', kartGoster: false,
    soru: () => 'en/g-what-is-it',
    yerler: {
      plane: { kutular: [[80, 40, 340, 160]], hareket: 'uc' },
      rocket: { kutular: [[1390, 60, 130, 330]], hareket: 'firla' },
      train: { kutular: [[40, 440, 520, 150]], hareket: 'sur' },
      bus: { kutular: [[600, 520, 340, 200]], hareket: 'sur' },
      car: { kutular: [[980, 600, 240, 130]], hareket: 'sur' },
      truck: { kutular: [[1230, 520, 330, 210]], hareket: 'sur' },
      bike: { kutular: [[520, 780, 160, 120]], hareket: 'sur' },
      boat: { kutular: [[1000, 820, 280, 150]], hareket: 'dalga' },
    },
    giris: ceren('tr/c-sc-garaj-giris', 'Taşıtlar uyuyor! Parlayan taşıtın adını İngilizce söyle, uyansın ve yola çıksın.'),
    son: polly('en/g-sc-garaj-son', 'Beep beep! Here we go!'),
  },
];

export const canlandirSahnesi = (uniteId: string | undefined) => CANLANDIR_SAHNELERI.find((s) => s.uniteId === uniteId);
export const scYolu = (s: Pick<CanlandirSahnesi, 'ad'>, parca: string) => `oyun/canlandir/${s.ad}-${parca}`;
/** Bir sahnenin bütün çizimleri: fon ve her yerin katmanı */
export const canlandirCizimleri = (s: CanlandirSahnesi): string[] => [scYolu(s, 'fon'), ...Object.keys(s.yerler).map((id) => scYolu(s, id))];

export interface CanlandirPlani { sahne: CanlandirSahnesi['ad']; kelimeler: Kelime[] }

/**
 * Söylenecek kelimeler: düz söyleme adımının kelimelerinden sahnede yeri olanlar (2–3 yaşta en çok 3, diğerlerinde 4).
 * `tam`: dersin her kelimesi söylenmeli (2. ders); biri sahnede yoksa sahne açılmaz, düz söyleme kalır.
 */
export function canlandirPlani(uniteId: string, kelimeler: readonly Kelime[], yas: Yas, rnd: Rnd, tam = false): CanlandirPlani | null {
  const s = canlandirSahnesi(uniteId);
  if (!s) return null;
  if (tam && kelimeler.some((w) => !s.yerler[w.id])) return null;
  const secilen = karistir(kelimeler.filter((w) => !!s.yerler[w.id]), rnd).slice(0, yas === '2-3' ? 3 : 4);
  return secilen.length >= 2 ? { sahne: s.ad, kelimeler: secilen } : null;
}

/** Adımın kayıtları; taşıtların sesi efekttir */
export function canlandirSesleri(p: CanlandirPlani): string[] {
  const s = CANLANDIR_SAHNELERI.find((x) => x.ad === p.sahne)!;
  return [s.giris.id, s.son.id, ...new Set(p.kelimeler.map((w) => s.soru(w))), ...p.kelimeler.flatMap((w) => [`en/w-${w.id}`, `en/c-${w.id}`, ...(s.canlanma === 'yola' ? [`efekt/${w.id}`] : [])])];
}

export const canlandirSesMetinleri = (): SesMetni[] => CANLANDIR_SAHNELERI.flatMap((s) => [s.giris, s.son]);
