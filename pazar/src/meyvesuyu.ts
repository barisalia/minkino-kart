/**
 * Meyve Suyu Köşesi (pazarın yan dalı): renk karışımı mantığı ve müşteri istekleri (DOM yok; birim testleri bunu kullanır).
 *
 * Her meyvenin bir suyu rengi var. Karışım ana renklerle hesaplanır: kırmızı, sarı, mavi.
 * Ara renkli meyveler (portakal, üzüm, armut) iki ana renkten sayılır; bu yüzden portakal + muz yine turuncu,
 * üzüm + muz ise hepsi karıştığı için kahverengi olur (komik "bu olmadı" anı).
 *   kırmızı + sarı = turuncu · sarı + mavi = yeşil · kırmızı + mavi = mor · üçü birden = kahverengi
 * 3-4 yaş: tek meyve = tek renk. 5-6 yaş: iki ana rengi karıştırıp ara rengi yapar.
 */
import P from '../../content/pazar.json';
import { buyukHarfBas } from '../../src/audio/metin';
import type { Yas } from '../../src/engine/types';

export type Rnd = () => number;
export type Ana = 'kırmızı' | 'sarı' | 'mavi';
export type SuRengi = Ana | 'turuncu' | 'yeşil' | 'mor' | 'kahverengi';

/** Bir turda kaç müşteri meyve suyu içer */
export const MS_MUSTERI = 4;
/** Blender'a en çok kaç meyve sığar */
export const KAPASITE = 3;

/** Meyve → suyunun rengi. yabanmersini kodla çizilir (assets/meyveler'de yok), ötekiler mevcut görseller. */
export const MEYVE_RENGI: Record<string, SuRengi> = {
  cilek: 'kırmızı',
  kiraz: 'kırmızı',
  nar: 'kırmızı',
  muz: 'sarı',
  limon: 'sarı',
  ananas: 'sarı',
  yabanmersini: 'mavi',
  portakal: 'turuncu',
  uzum: 'mor',
  armut: 'yeşil',
};

/** Ara renkler hangi ana renklerden oluşur */
export const BILESEN: Record<SuRengi, Ana[]> = {
  kırmızı: ['kırmızı'],
  sarı: ['sarı'],
  mavi: ['mavi'],
  turuncu: ['kırmızı', 'sarı'],
  yeşil: ['sarı', 'mavi'],
  mor: ['kırmızı', 'mavi'],
  kahverengi: ['kırmızı', 'sarı', 'mavi'],
};

/** Suyun ekrandaki rengi (pazar renk kodlarıyla aynı ton; mavi ve kahverengi ek) */
export const SU_KODU: Record<SuRengi, string> = {
  kırmızı: '#F0413F',
  sarı: '#FFC72C',
  turuncu: '#FF8A2B',
  yeşil: '#5DBE3F',
  mor: '#9B5CE0',
  mavi: '#3E9DF2',
  kahverengi: '#8B5A2B',
};

const ANA_SIRA: Ana[] = ['kırmızı', 'sarı', 'mavi'];
/** Ana renk kümesinden (sıra önemsiz) sonuç rengi */
function kumeden(k: Set<Ana>): SuRengi | null {
  const r = k.has('kırmızı');
  const s = k.has('sarı');
  const m = k.has('mavi');
  if (r && s && m) return 'kahverengi';
  if (r && s) return 'turuncu';
  if (s && m) return 'yeşil';
  if (r && m) return 'mor';
  if (r) return 'kırmızı';
  if (s) return 'sarı';
  if (m) return 'mavi';
  return null;
}

/** Blender'daki meyvelerin suyu hangi renk olur (boşsa null). Aynı meyveden iki tane rengi değiştirmez. */
export function karisim(meyveler: string[]): SuRengi | null {
  const k = new Set<Ana>();
  for (const m of meyveler) for (const a of BILESEN[MEYVE_RENGI[m]] ?? []) k.add(a);
  return kumeden(k);
}

/** İki rengin karışımı (renk tablosu / ipucu için) */
export function renkKaristir(a: SuRengi, b: SuRengi): SuRengi {
  return kumeden(new Set([...BILESEN[a], ...BILESEN[b]])) ?? a;
}

/** Bir ara rengi yapan iki ana renk (ipucu balonunda gösterilir) */
export const tarif = (r: SuRengi): Ana[] => ANA_SIRA.filter((a) => BILESEN[r].includes(a));

export interface MsIstek {
  hedef: SuRengi;
  /** tezgâhtaki meyveler, karışık sırada */
  tezgah: string[];
  /** karışım mı (5-6 yaş) */
  karisik: boolean;
  soz: string[];
  yazi: string;
}

const M = P.meyvesuyu;
const sec = <T>(a: readonly T[], rnd: Rnd): T => a[Math.floor(rnd() * a.length)];
function karistir<T>(a: T[], rnd: Rnd): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}
/** O renkte suyu olan meyveler */
const renktekiler = (r: SuRengi) => Object.keys(MEYVE_RENGI).filter((m) => MEYVE_RENGI[m] === r);

/** İstek cümlesi: "Turuncu meyve suyu lütfen!" */
export const istekCumlesi = (r: SuRengi) => M.istek.replaceAll('{Renk}', buyukHarfBas(r));

const TEK_RENKLER: SuRengi[] = ['kırmızı', 'sarı', 'turuncu', 'mor', 'yeşil', 'mavi'];
const ARA_RENKLER: SuRengi[] = ['turuncu', 'yeşil', 'mor'];

/**
 * sira: kaçıncı müşteri. onceki: bir önceki müşterinin istediği renk (aynısı art arda gelmesin).
 * 3 yaş: 3 farklı renkte meyve, biri istenen. 4 yaş: 4 farklı renk.
 * 5 yaş: ara renk; tezgâhta her ana renkten birer meyve (ara renkli meyve yok: karıştırmak şart).
 * 6 yaş: ara renk; tezgâhta ana renkler + fazladan bir ana renk + istenenden başka bir ara renkli çeldirici
 * (onu katan kahverengi yapar).
 */
export function msIstekUret(yas: Yas, _sira: number, rnd: Rnd = Math.random, onceki?: SuRengi): MsIstek {
  if (yas <= 4) {
    const havuz = TEK_RENKLER.filter((r) => r !== onceki);
    const hedef = sec(havuz, rnd);
    const digerler = karistir(TEK_RENKLER.filter((r) => r !== hedef), rnd).slice(0, yas === 3 ? 2 : 3);
    const tezgah = karistir([hedef, ...digerler].map((r) => sec(renktekiler(r), rnd)), rnd);
    const s = istekCumlesi(hedef);
    return { hedef, tezgah, karisik: false, soz: [s], yazi: s };
  }
  const hedef = sec(ARA_RENKLER.filter((r) => r !== onceki), rnd);
  const anaMeyve = (a: Ana, haric: string[] = []) => sec(renktekiler(a).filter((m) => !haric.includes(m)), rnd);
  const tezgah = ANA_SIRA.map((a) => anaMeyve(a));
  if (yas >= 6) {
    // fazladan bir ana renk (tarifteki renklerden biri: iki yol da olur) ve bir ara renkli çeldirici
    const ek = sec(tarif(hedef), rnd);
    const ekMeyve = renktekiler(ek).find((m) => !tezgah.includes(m));
    if (ekMeyve) tezgah.push(ekMeyve);
    tezgah.push(sec(renktekiler(sec(ARA_RENKLER.filter((r) => r !== hedef), rnd)), rnd));
  }
  const s = istekCumlesi(hedef);
  return { hedef, tezgah: karistir(tezgah, rnd), karisik: true, soz: [s], yazi: s };
}

export type MsSonuc = 'tamam' | 'yanlis' | 'bos';
export function msDenetle(ist: MsIstek, blender: string[]): MsSonuc {
  const r = karisim(blender);
  if (!r) return 'bos';
  return r === ist.hedef ? 'tamam' : 'yanlis';
}

/** Tezgâhtaki meyvelerle istek yapılabilir mi (birim testi ve ipucu: doğru meyveler) */
export function dogruSecim(ist: MsIstek): string[] | null {
  const t = ist.tezgah;
  for (const a of t) if (karisim([a]) === ist.hedef) return [a];
  for (let i = 0; i < t.length; i++) for (let j = i + 1; j < t.length; j++) if (karisim([t[i], t[j]]) === ist.hedef) return [t[i], t[j]];
  return null;
}

/** Doğru karışımdan sonra söylenen açıklama ("Kırmızı ve sarı turuncu yapar!") */
export const karisimCumlesi = (r: SuRengi): string | undefined => (M.karisim as Record<string, string>)[r];

/** Meyve suyu köşesinin söyleyebileceği bütün cümleler (seslendirme listesi) */
export function meyveSuyuCumleleri(): string[] {
  return [
    M.giris,
    ...TEK_RENKLER.map(istekCumlesi),
    M.at,
    M.bas,
    M.karistir,
    ...M.dogru,
    ...M.yanlis,
    M.tekrar,
    ...Object.values(M.karisim),
    M.kahverengi,
    M.doldu,
  ];
}
