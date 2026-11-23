/**
 * Açılır kitap (22 Kasım 2026 gecesi) · DOM'suz veri: sahne ölçüleri, parçalar, pozlar, sesler.
 *
 * Barış: "çileği eksik: çok özenilmiş, saatlerce günlerce uğraşılmış bir bölüm lazım". Göl masalı gerçek, 3 boyutlu bir
 * açılır kitap olarak kurulur (tasarım: ekip/ingilizce/MASAL-GOL-CILEK.md). Sayfa yatıktır, kâğıt katmanlar diktir,
 * karakterler ayrı karton kesimlerdir; her tepki Astra'nın çizdiği poz dizisidir (resim kodla esnetilmez).
 *
 * Bütün ölçüler çizim brief'iyle aynıdır (Paket Masal-K2-A). Birimler:
 *   - masa pikseli: 2400 × 1600, kitap ortada;
 *   - kitap pikseli: 1800 × 1140, baskı alanı (açılım) x 100–1700, y 70–1070, sırt x = 900;
 *   - açılım pikseli: 1600 × 1000; dik parçalar zeminde `y` çizgisine dikilir (alt kenarları o çizgidedir).
 */
import type { SesMetni } from '../icerik';

export const MASA = { en: 2400, boy: 1600 } as const;
export const KITAP = { en: 1800, boy: 1140, sirt: 900 } as const;
export const ACILIM = { x: 100, y: 70, en: 1600, boy: 1000 } as const;
/** yatık sayfanın eğimi (derece): kamera kitaba önden ve yukarıdan bakar; dik parçalar aynı açıyla kalkıp kameraya döner */
export const EGIM = 52;

/** Dik katman: karşıdan çizilmiş, alt kenarı zeminde `y` çizgisinde */
export interface DikKatman { id: string; resim: string; x: number; y: number; en: number; boy: number }

/**
 * Oyuncu (karakter): kare tuvalli pozlar. `x`, `y` zeminde bastığı nokta; `en` açılım pikselinde görünen genişlik;
 * `taban` tuvalde taban çizgisinin oranı (760 / 800). Bir pozun birden çok karesi varsa konuşurken ağzı o kareleri izler;
 * `kirp` gözü kapalı karedir (ara ara görünür).
 */
export interface OyuncuTanimi {
  id: string;
  /** ağzı kaydı izleyen konuşmacı (ses.ts) */
  kim?: 'polly' | 'ceren' | 'kino';
  x: number; y: number; en: number;
  /** tuval oranı: yükseklik / genişlik */
  oran: number;
  taban: number;
  pozlar: Readonly<Record<string, readonly string[]>>;
  kirp?: Readonly<Record<string, string>>;
  ilk: string;
}

const g = (ad: string) => `kitap/gol/${ad}`;

export const KITAP_CIZIMLERI = { masa: g('masa'), taban: g('kitap-taban'), kapak: g('kapak') } as const;

/** Göl dekoru: zemin ve üç dik katman (arka gök ve tepeler, orta sazlar, ön çimen) */
export const GOL_DEKORU = {
  zemin: g('gol-zemin'),
  dikler: [
    { id: 'arka', resim: g('gol-arka'), x: 0, y: 110, en: 1600, boy: 700 },
    { id: 'orta', resim: g('gol-orta'), x: 0, y: 500, en: 1600, boy: 360 },
    { id: 'on', resim: g('gol-on'), x: 0, y: 965, en: 1600, boy: 220 },
  ] as readonly DikKatman[],
} as const;

/** Suyun yarığı: ördek buradan yaylanarak çıkar; önünde küçük kâğıt dalga durur */
export const YARIK = { x: 1080, y: 610 } as const;
// dalga ördeğin yalnız su çizgisini örter (gövdesi görünsün): çizim 460 × 130, sahnede biraz küçük ve yarığa yakın
export const DALGA: DikKatman = { id: 'dalga', resim: g('dalga'), x: YARIK.x - 205, y: YARIK.y + 26, en: 410, boy: 116 };

export const KINO: OyuncuTanimi = {
  id: 'kino', kim: 'kino', x: 420, y: 800, en: 560, oran: 1, taban: 760 / 800, ilk: 'diz',
  pozlar: {
    diz: [g('kino-diz-0')],
    sasir: [g('kino-sasir')],
    gul: [g('kino-gul')],
    // yalnız ağız değişir: konuşurken kaydı izler
    sor: [g('kino-sor-0'), g('kino-sor-1'), g('kino-sor-2')],
  },
  kirp: { diz: g('kino-diz-kirp') },
};

/**
 * Muzlu ördek. Çizimde gövde y = 738'e kadar iner (brief'teki su çizgisi y = 620). Önündeki dalga yaklaşık 140 tuval
 * pikseli örttüğü için yarığın kenarına y = 715 oturtulur: gaga ve kanatların üstü dalganın üstünde kalır, gövdenin
 * altını dalga örter (22 Kasım, sahnede ölçüldü: y = 620'de gaga dalganın arkasında kalıyordu).
 */
export const ORDEK: OyuncuTanimi = {
  // su üstü boyu çömelmiş Kino'nun yaklaşık yüzde yetmişi (anahtar karedeki oran)
  id: 'ordek', x: YARIK.x, y: YARIK.y, en: 570, oran: 1, taban: 715 / 800, ilk: 'cik',
  pozlar: {
    cik: [g('ordek-muz-0')],
    bak: [g('ordek-muz-1')],
    omuz: [g('ordek-muz-2')],
    dal: [g('ordek-muz-3')],
    evet: [g('ordek-muz-evet')],
  },
  kirp: { cik: g('ordek-muz-kirp') },
};

/**
 * Polly kitabın sol kenarında, arka köşede durur (açılım pikseli; ayakları `y` çizgisinde). Sayfanın dışına taşar:
 * sazların (orta katman, x 140–340) arkasında kalmasın.
 */
export const POLLY: OyuncuTanimi = {
  id: 'polly', kim: 'polly', x: -50, y: 150, en: 330, oran: 1, taban: 540 / 600, ilk: 'otur',
  pozlar: {
    otur: [g('polly-kitap-0')],
    // konuşurken bir kanadıyla sahneyi gösterir; yalnız gagası değişir (0 kapalı, 1 yarım, 2 açık)
    konus: [g('polly-kitap-konus-0'), g('polly-kitap-konus-1'), g('polly-kitap-konus-2')],
    gul: [g('polly-kitap-gul')],
    sasir: [g('polly-kitap-sasir')],
  },
  kirp: { otur: g('polly-kitap-kirp') },
};

/**
 * Ceren Öğretmen kapalı kitabın solunda, masanın üstünde ayakta duran karton kesimdir (kitap pikseli; tam boy, 800 × 1000
 * tuval, taban y = 960). Kapak açılırken sola kayıp çekilir (kapak onun durduğu yere iner).
 */
export const CEREN: OyuncuTanimi = {
  id: 'ceren', kim: 'ceren', x: 470, y: 760, en: 640, oran: 1000 / 800, taban: 960 / 1000, ilk: 'dur',
  pozlar: { dur: [g('ceren-kitap-0'), g('ceren-kitap-1')] },
  kirp: { dur: g('ceren-kitap-kirp') },
};

export const EFEKT_CIZIMLERI = {
  kabarcik: [g('kabarcik-0'), g('kabarcik-1')],
  sicrama: [g('sicrama-0'), g('sicrama-1'), g('sicrama-2')],
  halka: g('halka'),
  muzSuda: g('muz-suda'),
  etiketEvet: g('etiket-evet'),
  etiketHayir: g('etiket-hayir'),
  etiketSozcuk: g('etiket-sozcuk'),
} as const;

const hece = (s: string) => (s.toLowerCase().match(/[aeiouy]+/g) ?? []).length || 1;
const polly = (id: string, metin: string): SesMetni => ({ id, kim: 'polly', dil: 'en', metin, hece: hece(metin) });

/** Kanıt sayfası (4. sayfa · kabarcıklar): kayıtların hepsi Masal 2.0 v2 için üretildi (masal2-veri.ts → G2) */
export const KABARCIK_SAYFASI = {
  en: 'Look! Bubbles! Who is there?',
  tr: 'Bak! Kabarcıklar! Kim var orada?',
  sesler: {
    giris: 'tr/c-gol2-giris',
    cumle: 'en/g-gol2-4',
    soru: 'en/k-gol2-sor',
    hayir: 'en/g-gol2-4b',
    ordek: 'efekt/duck',
    muz: 'en/w-banana',
    son: 'en/g-the-end',
  },
  soru: 'Is this my hat?',
  cevap: "No! It's a banana!",
} as const;

/** Yeni kayıtlar (son sayfanın Şapka Çarkı; çizimler bağlanınca üretilir) */
export const kitapSesMetinleri = (): SesMetni[] => [
  polly('en/g-gol2-cark', 'Turn the wheel!'),
  polly('en/g-gol2-cark-1', 'Kino has a flower!'),
  polly('en/g-gol2-cark-2', 'The cow has a banana!'),
  polly('en/g-gol2-cark-3', 'Kino has a banana!'),
];

const pozCizimleri = (o: OyuncuTanimi): string[] => [...Object.values(o.pozlar).flat(), ...Object.values(o.kirp ?? {})];

/** Kanıt sayfasının bütün çizimleri (Paket Masal-K2-A: 40 çizim ve Polly'nin kapalı gagalı konuşma karesi) */
export const kanitCizimleri = (): string[] => [
  ...Object.values(KITAP_CIZIMLERI),
  GOL_DEKORU.zemin, ...GOL_DEKORU.dikler.map((d) => d.resim), DALGA.resim,
  ...EFEKT_CIZIMLERI.kabarcik, ...EFEKT_CIZIMLERI.sicrama, EFEKT_CIZIMLERI.halka, EFEKT_CIZIMLERI.muzSuda,
  EFEKT_CIZIMLERI.etiketEvet, EFEKT_CIZIMLERI.etiketHayir, EFEKT_CIZIMLERI.etiketSozcuk,
  ...[KINO, ORDEK, POLLY, CEREN].flatMap(pozCizimleri),
];

export const kanitSesleri = (): string[] => [...Object.values(KABARCIK_SAYFASI.sesler), 'en/g-yes', 'en/g-no'];

/**
 * Açılma değeri (0 kapalı … 1 açık ve katmanlar kalkmış) → kapağın açısı ve katmanların kalkışı. İlk %55 kapak döner,
 * sonra katmanlar arkadan öne sırayla kalkar (her biri kendi payında). Sayfa parmakla çevrilirken de aynı eşleme kullanılır.
 */
export function acilmaDurumu(a: number, katmanSayisi: number): { kapak: number; kalkis: number[] } {
  const k = Math.min(1, Math.max(0, a));
  const kapak = Math.min(1, k / 0.55);
  // tam açıkta kayan nokta payı 0,9999… kalmasın: son katman da tam kalksın
  const pay = k >= 1 ? 1 : (k - 0.55) / 0.45;
  const adim = katmanSayisi > 1 ? 0.5 / (katmanSayisi - 1) : 0;
  const kalkis = Array.from({ length: katmanSayisi }, (_, i) => Math.min(1, Math.max(0, (pay - i * adim) / 0.5)));
  return { kapak, kalkis };
}

/** Yaylanma: 0 → 1, sonda hafif taşar (kâğıdın yaylanması) */
export const yay = (t: number): number => {
  const x = Math.min(1, Math.max(0, t)), c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2;
};
