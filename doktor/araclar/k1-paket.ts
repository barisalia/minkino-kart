// Paket Doktor-K1 ("Önce Kuzu") · Astra'dan beklenen 68 çizimin dökümü: hangi sayfada, hangi tuvalde, hangi zeminle gelir.
// Ölçüler brief'tekiyle aynıdır (CLAUDE-ASTRA-MESAJLAR.md, 22 Kasım 04:16 kaydı ve 05:43 ölçü eki); adlar sahne kodundan alınır.
// Bağlama betiği (bagla.ts) ve önizleme sayfası bu dökümü kullanır. Saf veri: DOM ve dosya erişimi yok.
import { AGIZ, DIZI, K1, K1_DOSYALAR } from '../src/once-kuzu/diziler';
import { HEDEF, TUVAL } from '../src/once-kuzu/yerlesim';

/** Önizlemede çizimin üstüne konan ölçü çizgisi ya da kutusu (tuval pikseli). */
export interface Kilavuz { ad: string; tur: 'yatay' | 'dikey' | 'kutu' | 'daire'; konum?: number; kutu?: [number, number, number, number]; /** daire: merkez ve yarıçap */ nokta?: [number, number]; yaricap?: number; }
export type TuvalTuru = 'zipzip' | 'kino' | 'yakin' | 'stetoskop' | 'fon' | 'masa' | 'perde';
export interface TuvalTanimi { g: number; y: number; zemin: 'seffaf' | 'opak'; /** çizim tuvalin alt kenarında kesilebilir (bel üstü yakın plan) */ altKesik?: boolean; kilavuzlar: readonly Kilavuz[]; }

const yatay = (ad: string, konum: number): Kilavuz => ({ ad, tur: 'yatay', konum });
const dikey = (ad: string, konum: number): Kilavuz => ({ ad, tur: 'dikey', konum });
const daire = (ad: string, x: number, y: number, yaricap: number): Kilavuz => ({ ad, tur: 'daire', nokta: [x, y], yaricap });
const g = HEDEF.gogus;

export const TUVALLER: Record<TuvalTuru, TuvalTanimi> = {
  zipzip: {
    g: TUVAL.zipzip.g, y: TUVAL.zipzip.y, zemin: 'seffaf',
    kilavuzlar: [yatay('yer', TUVAL.zipzip.yer), dikey('eksen', TUVAL.zipzip.eksen), yatay('kalça (oturuş)', 1020), yatay('1. basamak', 1310), yatay('2. basamak', 1180)],
  },
  kino: { g: TUVAL.kino.g, y: TUVAL.kino.y, zemin: 'seffaf', kilavuzlar: [yatay('yer', TUVAL.kino.yer), dikey('eksen', TUVAL.kino.eksen)] },
  yakin: {
    g: TUVAL.yakin.g, y: TUVAL.yakin.y, zemin: 'seffaf', altKesik: true,
    kilavuzlar: [dikey('baş ekseni', TUVAL.yakin.eksen), yatay('çene', 820), { ad: 'boş göğüs alanı', tur: 'kutu', kutu: [g.sol, g.ust, g.g, g.y] }, daire('kalp (HEDEF.kalp)', HEDEF.kalp.x, HEDEF.kalp.y, 60)],
  },
  stetoskop: { g: 1600, y: 1600, zemin: 'seffaf', kilavuzlar: [dikey('uç ekseni', 800), yatay('uç merkezi', 1400), daire('uç', 800, 1400, 128)] },
  fon: { g: 2752, y: 1536, zemin: 'opak', kilavuzlar: [{ ad: 'önemli alan (orta %75 × %80)', tur: 'kutu', kutu: [344, 154, 2064, 1228] }] },
  masa: {
    g: TUVAL.masa.g, y: TUVAL.masa.y, zemin: 'seffaf',
    kilavuzlar: [yatay('yer', TUVAL.masa.yer), yatay('oturak üstü', 420), dikey('Zıpzıp ekseni', TUVAL.masa.eksen), yatay('1. basamak', 710), yatay('2. basamak', 580), { ad: 'tabure', tur: 'kutu', kutu: [650, 580, 260, 260] }],
  },
  perde: { g: 900, y: 1100, zemin: 'seffaf', kilavuzlar: [] },
};

export interface Sayfa {
  /** kaynak klasöründe sayfa (sheet) bu adla gelirse betik tanır: a1.png, b5.png … */
  anahtar: string;
  baslik: string;
  tuval: TuvalTuru;
  adlar: readonly string[];
  /** sayfadan kesilen pozların ortak ölçeği için: bu sıradaki poz ayakta ve boyu (px) bilinir */
  boyReferansi?: { kare: number; boy: number };
  /** sayfadan kesilen pozun alt-orta noktasının tuvalde oturacağı yer (ada göre); yoksa tuvalin ekseni ve yer çizgisi (tahmin) */
  capa?: Readonly<Record<string, readonly [number, number]>>;
}
const ZIPZIP_BOY = 1000, KINO_BOY = 1090;
const kinoYer = (adlar: readonly string[]) => Object.fromEntries(adlar.map(a => [a, [TUVAL.kino.eksen, TUVAL.kino.yer] as const]));
const z = K1;

/** Brief'teki sayfa ve çağrı sırasıyla (22 çağrı). */
export const SAYFALAR: readonly Sayfa[] = [
  { anahtar: 'a1', baslik: 'A1 · Zıpzıp masaya çıkar', tuval: 'zipzip', adlar: z.zipzipTirman, boyReferansi: { kare: 0, boy: ZIPZIP_BOY }, capa: { [z.zipzipTirman[0]]: [330, TUVAL.zipzip.yer] } },
  { anahtar: 'a2', baslik: 'A2 · Zıpzıp oturuş, altı ağız', tuval: 'zipzip', adlar: z.zipzipOturAgiz },
  { anahtar: 'a3', baslik: 'A3 · Zıpzıp kırpma, bakış, saklanma', tuval: 'zipzip', adlar: [z.zipzipOturKirp, z.zipzipOturBak, ...z.zipzipSaklan] },
  { anahtar: 'a4', baslik: 'A4 · Zıpzıp Kuzu\'nun arkasından çıkar', tuval: 'zipzip', adlar: z.zipzipMerak },
  { anahtar: 'a5', baslik: 'A5 · Zıpzıp Kuzu\'yu kaldırır', tuval: 'zipzip', adlar: z.zipzipKuzuKaldir },
  { anahtar: 'b1', baslik: 'B1 · yakın: dinleme ve kırpma', tuval: 'yakin', adlar: [z.yakinDinle, z.yakinKirp] },
  { anahtar: 'b2', baslik: 'B2 · yakın: ürperme', tuval: 'yakin', adlar: z.yakinSaskin },
  { anahtar: 'b3', baslik: 'B3 · yakın: kıkırdama 0–1', tuval: 'yakin', adlar: z.yakinKikir.slice(0, 2) },
  { anahtar: 'b4', baslik: 'B4 · yakın: kıkırdama 2–3', tuval: 'yakin', adlar: z.yakinKikir.slice(2, 4) },
  { anahtar: 'b5', baslik: 'B5 · yakın: ağız 0–1', tuval: 'yakin', adlar: z.yakinAgiz.slice(0, 2) },
  { anahtar: 'b6', baslik: 'B6 · yakın: ağız 2–3', tuval: 'yakin', adlar: z.yakinAgiz.slice(2, 4) },
  { anahtar: 'b7', baslik: 'B7 · yakın: ağız 4–5', tuval: 'yakin', adlar: z.yakinAgiz.slice(4, 6) },
  { anahtar: 'b8', baslik: 'B8 · yakın: göğüs ve bakış', tuval: 'yakin', adlar: [z.yakinGogus, z.yakinBak] },
  { anahtar: 'c1', baslik: 'C1 · Kino stetoskobu gösterir', tuval: 'kino', adlar: z.kinoGoster, boyReferansi: { kare: 0, boy: KINO_BOY }, capa: kinoYer(z.kinoGoster) },
  { anahtar: 'c2', baslik: 'C2 · Kino gösterme pozu, altı ağız', tuval: 'kino', adlar: z.kinoAgiz, boyReferansi: { kare: 0, boy: KINO_BOY }, capa: kinoYer(z.kinoAgiz) },
  { anahtar: 'c3', baslik: 'C3 · Kino kırpma, Kuzu\'ya bakış, boş avuç', tuval: 'kino', adlar: [z.kinoKirp, z.kinoBakKuzu, z.kinoEgilBos], boyReferansi: { kare: 0, boy: KINO_BOY }, capa: kinoYer([z.kinoKirp, z.kinoBakKuzu, z.kinoEgilBos]) },
  { anahtar: 'c4', baslik: 'C4 · Kino eğilir', tuval: 'kino', adlar: z.kinoEgil, boyReferansi: { kare: 0, boy: KINO_BOY }, capa: kinoYer(z.kinoEgil) },
  { anahtar: 'c5', baslik: 'C5 · Kino güler', tuval: 'kino', adlar: z.kinoGul, boyReferansi: { kare: 0, boy: KINO_BOY }, capa: kinoYer(z.kinoGul) },
  { anahtar: 'd1', baslik: 'D1 · stetoskop', tuval: 'stetoskop', adlar: [z.stetoskop] },
  { anahtar: 'd2', baslik: 'D2 · muayene odası (fon)', tuval: 'fon', adlar: [z.fon] },
  { anahtar: 'd3', baslik: 'D3 · muayene masası', tuval: 'masa', adlar: [z.masa] },
  { anahtar: 'd4', baslik: 'D4 · perde', tuval: 'perde', adlar: z.perde },
];

export interface Cizim { ad: string; sayfa: string; tuval: TuvalTuru; g: number; y: number; zemin: 'seffaf' | 'opak'; altKesik: boolean; }
export const CIZIMLER: readonly Cizim[] = SAYFALAR.flatMap(s => s.adlar.map(ad => {
  const t = TUVALLER[s.tuval];
  return { ad, sayfa: s.anahtar, tuval: s.tuval, g: t.g, y: t.y, zemin: t.zemin, altKesik: !!t.altKesik };
}));
/** Yalnız belirli çizimlerde görünen kılavuzlar: koddaki tahmini HEDEF noktaları (çizim gelince bunlara göre ölçülür). */
export const CIZIM_KILAVUZLARI: Readonly<Record<string, readonly Kilavuz[]>> = {
  [z.zipzipSaklan[2]]: [daire("Kuzu'nun göğsü (HEDEF.kuzuGogus)", HEDEF.kuzuGogus.x, HEDEF.kuzuGogus.y, HEDEF.kuzuGogus.yaricap)],
  [z.zipzipSaklan[3]]: [daire("Kuzu'nun göğsü (HEDEF.kuzuGogus)", HEDEF.kuzuGogus.x, HEDEF.kuzuGogus.y, HEDEF.kuzuGogus.yaricap)],
  [z.kinoEgil[3]]: [daire('açık avuç (HEDEF.kinoAvuc)', HEDEF.kinoAvuc.x, HEDEF.kinoAvuc.y, HEDEF.kinoAvuc.yaricap)],
  [z.kinoEgilBos]: [daire('açık avuç (HEDEF.kinoAvuc)', HEDEF.kinoAvuc.x, HEDEF.kinoAvuc.y, HEDEF.kinoAvuc.yaricap)],
};
export const cizimBul = (ad: string): Cizim | undefined => CIZIMLER.find(c => c.ad === ad);
export const sayfaBul = (anahtar: string): Sayfa | undefined => SAYFALAR.find(s => s.anahtar === anahtar);

/**
 * "Aynı poz" çiftleri: brief'e göre ikinci çizim birincinin aynısıdır, yalnız küçük bir yer değişir (ağız, göz, göğüs, avuç).
 * `enCok`: değişen piksellerin, temel çizimin görünen piksellerine oranı için uyarı eşiği (tahmin; gerçek çizimle ayarlanır).
 */
export interface AyniPoz { temel: string; es: string; ne: string; enCok: number; }
const agizlar = (set: readonly string[]): AyniPoz[] => set.slice(1).map(es => ({ temel: set[0], es, ne: 'yalnız ağız', enCok: 0.06 }));
export const AYNI_POZ: readonly AyniPoz[] = [
  { temel: z.zipzipTirman[5], es: z.zipzipOturAgiz[0], ne: 'temel oturuş', enCok: 0.06 },
  ...agizlar(z.zipzipOturAgiz),
  { temel: z.zipzipOturAgiz[0], es: z.zipzipOturKirp, ne: 'yalnız gözler (kapalı)', enCok: 0.06 },
  { temel: z.zipzipOturAgiz[0], es: z.zipzipOturBak, ne: 'yalnız gözler (sola)', enCok: 0.06 },
  { temel: z.zipzipOturAgiz[0], es: z.zipzipKuzuKaldir[0], ne: 'temel oturuş, gülümseme', enCok: 0.08 },
  { temel: z.yakinDinle, es: z.yakinKirp, ne: 'yalnız gözler (kapalı)', enCok: 0.06 },
  { temel: z.yakinDinle, es: z.yakinBak, ne: 'yalnız gözler (bize)', enCok: 0.06 },
  { temel: z.yakinDinle, es: z.yakinGogus, ne: 'göğüs 12–16 px kabarık', enCok: 0.2 },
  { temel: z.yakinBak, es: z.yakinAgiz[0], ne: 'aynı poz, ağız kapalı', enCok: 0.08 },
  ...agizlar(z.yakinAgiz),
  { temel: z.kinoGoster[3], es: z.kinoAgiz[0], ne: 'gösterme pozu', enCok: 0.06 },
  ...agizlar(z.kinoAgiz),
  { temel: z.kinoAgiz[0], es: z.kinoKirp, ne: 'yalnız gözler (kapalı)', enCok: 0.06 },
  { temel: z.kinoAgiz[0], es: z.kinoBakKuzu, ne: 'yalnız gözler (aşağı)', enCok: 0.06 },
  { temel: z.kinoGoster[3], es: z.kinoEgil[0], ne: 'gösterme pozu', enCok: 0.06 },
  { temel: z.kinoEgil[3], es: z.kinoEgilBos, ne: 'yalnız avuç (stetoskop yok)', enCok: 0.25 },
];

/** Önizlemede oynatılan diziler: sahnedeki sürelerle. */
export const ONIZLEME_DIZILERI: readonly { ad: string; kareler: readonly string[]; sureler: readonly number[]; donus?: number }[] =
  Object.entries(DIZI).map(([ad, d]) => ({ ad, kareler: d.kareler, sureler: d.sureler, donus: 'donus' in d ? d.donus : undefined }));
export const ONIZLEME_AGIZLARI: readonly { ad: string; kareler: readonly string[] }[] = Object.entries(AGIZ).map(([ad, kareler]) => ({ ad, kareler }));

/** Kaynak klasöründeki dosya adını çözer: tek çizim mi, sayfa mı. `a1@3x2.png` gibi ek, sayfanın ızgarasını verir. */
export interface KaynakAdi { tur: 'cizim' | 'sayfa' | 'bilinmiyor'; ad: string; izgara?: { sutun: number; satir: number }; }
export function kaynakAdiCoz(dosya: string): KaynakAdi {
  const taban = dosya.replace(/\.(png|webp|jpe?g)$/i, '').toLowerCase().trim();
  const m = taban.match(/^(.*?)@(\d+)x(\d+)$/);
  const ad = (m ? m[1] : taban).replace(/^(sayfa|sheet|k1)[-_ ]/, '');
  const izgara = m ? { sutun: +m[2], satir: +m[3] } : undefined;
  if (!izgara && cizimBul(ad)) return { tur: 'cizim', ad };
  if (sayfaBul(ad)) return { tur: 'sayfa', ad, izgara };
  // dizi öneki: zipzip-tirman, kino-gul, perde … (sayfanın bütün adları "önek-sayı" biçimindeyse)
  const s = SAYFALAR.find(x => x.adlar.length > 1 && x.adlar.every(a => a.startsWith(ad + '-') && /^\d+$/.test(a.slice(ad.length + 1))));
  if (s) return { tur: 'sayfa', ad: s.anahtar, izgara };
  return { tur: 'bilinmiyor', ad };
}

/**
 * Alt klasörle gelen ayrı pozlar: klasör adı sayfa anahtarı ya da dizi öneki (`a1/`, `zipzip-tirman/`), dosyalar ya K1
 * adıyla (`zipzip-tirman-0.png`) ya da sıra numarasıyla (`00.png`, `01.png` …) gelir. Numara sayfadaki sıradır ve
 * 0'dan başlar; 1…n tam takım gelirse 1'den başladığı kabul edilir. Tanınmayan dosyanın adı `null` döner.
 */
export function altKlasorEsle(klasor: string, dosyalar: readonly string[]): { sayfa: string; eslesme: { dosya: string; ad: string | null }[] } | null {
  const k = kaynakAdiCoz(klasor + '.png');
  if (k.tur !== 'sayfa') return null;
  const s = sayfaBul(k.ad)!;
  const resimler = dosyalar.filter(d => /\.(png|webp|jpe?g)$/i.test(d)).sort();
  const no = (d: string): number | null => { const m = d.replace(/\.[a-z]+$/i, '').match(/(\d+)$/); return m ? +m[1] : null; };
  const numarali = resimler.filter(d => !cizimBul(d.replace(/\.[a-z]+$/i, '').toLowerCase()) && no(d) !== null);
  // numara 0'dan başlar; yalnız 1…n tam takım gelmişse 1'den başladığı kabul edilir (eksik takımda sıra kaymasın)
  const nolar = numarali.map(d => no(d)!);
  const enKucuk = nolar.length && Math.min(...nolar) === 1 && Math.max(...nolar) === s.adlar.length ? 1 : 0;
  return {
    sayfa: s.anahtar,
    eslesme: resimler.map(dosya => {
      const taban = dosya.replace(/\.[a-z]+$/i, '').toLowerCase();
      if (s.adlar.includes(taban)) return { dosya, ad: taban };
      const n = no(dosya);
      const ad = n === null || cizimBul(taban) ? null : s.adlar[n - enKucuk] ?? null;
      return { dosya, ad };
    }),
  };
}

export { K1_DOSYALAR };
