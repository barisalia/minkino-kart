/**
 * Pati Dükkânı v2: eşyaların el işi ve hayvanın tepkisinin "nasıl"ı (saf, DOM yok; tests/unit/pati-bakim.test.ts).
 * Neyin sevildiği tercih.ts'te; burada o tepkinin hangi el işiyle verildiği ve nasıl oynandığı.
 *
 * El işleri (v1 bakim.ts'ten genelleşti: mamaOlcek → kap, topAt → at, kusYakala → salla, minderKoy → yatak):
 *  - kap    : kâse / yiyecek / su masaya, hayvanın önüne konur; hayvan yer ya da içer
 *  - at     : top fırlatılır, sekip düşer; köpek koşup getirir, kedi bir kez iter
 *  - salla  : tüy değnek hayvanın üstünde sallanır; kedi pusuya yatar, atlar, yakalar
 *  - firca  : fırça / tarak / havlu hayvanın üstünde ileri geri sürtülür (her sürtüşte gövde yayılır)
 *  - sprey  : sprey hayvanın üstünde basılı tutulur, damlalar yağar
 *  - yatak  : minder, yuva, kutu hayvanın altına iner; hayvan döner, kıvrılır
 *  - ortu   : battaniye / örtü / ılık su torbası hayvanın üstüne örtülür
 *  - ver    : öteki her şey hayvanın yanına konur; hayvan ilgilenir
 * Dokunuş (sürüklemeden) aynı işi kendiliğinden yapar: eşya hayvana uçar, iki sürtüş, bir fırlatış …
 *
 * Komik tepkiler (sevmez; cezasız, PATI-V2 §6b): türe ve eşyaya göre küçük bir sahne. Listede yoksa çekmeceye göre genel.
 */
import { esyaBilgi, type CekmeceAdi, type IhtiyacAdi } from './katalog';
import type { Poz } from './varliklar';

export type Kullanim = 'kap' | 'at' | 'salla' | 'firca' | 'sprey' | 'yatak' | 'ortu' | 'ver';

const OZEL_KULLANIM: Record<string, Kullanim> = {
  top: 'at',
  'cingirakli-top': 'at',
  yumak: 'at',
  frizbi: 'at',
  'hamster-topu': 'at',
  'tuy-degnek': 'salla',
  'su-spreyi': 'sprey',
  'kum-banyosu': 'kap',
  'kus-banyo-kabi': 'kap',
  'su-kovasi': 'kap',
  'kum-saati': 'ver',
  'yara-bandi': 'ver',
  'surup-kasigi': 'kap',
  'kafes-ortusu': 'ortu',
  battaniye: 'ortu',
  'ilik-su-torbasi': 'ortu',
  'gece-lambasi': 'ver',
  'isi-lambasi': 'ver',
  'muzik-kutusu': 'ver',
  'pelus-ayi': 'yatak',
};
const CEKMECE_KULLANIM: Record<CekmeceAdi, Kullanim> = { mama: 'kap', su: 'kap', oyuncak: 'ver', temizlik: 'firca', yatak: 'yatak', ecza: 'ver' };

/** Eşyanın el işi */
export const kullanim = (esya: string): Kullanim => OZEL_KULLANIM[esya] ?? CEKMECE_KULLANIM[esyaBilgi(esya).cekmece];

/** Sürüklerken hayvanın üstünde tutularak yapılan iş mi (bırakınca değil, tutarken ilerler) */
export const tutarakMi = (k: Kullanim) => k === 'firca' || k === 'sprey' || k === 'salla';
/** Tutarak yapılan işin bitmesi için gereken ilerleme (firca: sürtüş, sprey: ms, salla: sallama) */
export const IS_GEREK: Record<'firca' | 'sprey' | 'salla', number> = { firca: 3, sprey: 900, salla: 3 };
/** Bir sürtüş sayılması için parmağın hayvanın üstünde gitmesi gereken yol (px) */
export const SURTUS_YOL = 110;

// ---------------------------------------------------------------- komik tepkiler
/**
 * burun-cevir : koklar, burnunu kırıştırır, başını çevirir; eşyayı burnuyla iter
 * iyy         : "ıyy", dili dışarıda, silkinir
 * islak       : sırılsıklam (incecik), sonra silkelenir, damlalar her yere
 * kutuya-kac  : ıslanır, tüyleri diken diken, karton kutuya kaçar; kutudan yalnız başı bakar (kedi + sprey)
 * hapsir      : burnu gıdıklanır, hapşırır; eşya (yaprak, tüy) kafasına yapışır
 * kafaya-gecer: kutu kafasına geçer, kör kör yürür (köpek + karton kutu)
 * esne        : bakar, patisiyle bir kez iter, esner (kedi + top)
 * urker       : ürker, köşeye büzülür, sonra merakla burnunu uzatır (tavşan + top)
 * sicak       : sıcaktan dili çıkar, altından kaçar (tavşan + ısı lambası)
 * ortu-alti   : örtünün altında kalır, örtü kıpırdar, örtü kayar
 * damla       : şişeyi yalar, damla burnuna düşer, şaşırır (suluk şişesi)
 */
export type Gag = 'burun-cevir' | 'iyy' | 'islak' | 'kutuya-kac' | 'hapsir' | 'kafaya-gecer' | 'esne' | 'urker' | 'sicak' | 'ortu-alti' | 'damla';

/** tür:eşya → gag (PATI-V2 §6b tablolarındaki ✗ sütunu) */
const GAG: Record<string, Gag> = {
  'kopek:marul': 'hapsir',
  'kopek:suluk-sisesi': 'damla',
  'kopek:su-spreyi': 'islak',
  'kopek:tuy-degnek': 'hapsir',
  'kopek:karton-kutu': 'kafaya-gecer',
  'kopek:top': 'esne',
  'kedi:kemik-biskuvi': 'burun-cevir',
  'kedi:suluk-sisesi': 'damla',
  'kedi:su-spreyi': 'kutuya-kac',
  'kedi:top': 'esne',
  'kedi:kafes-ortusu': 'ortu-alti',
  'kedi:kum-banyosu': 'iyy',
  'tavsan:kopek-mamasi': 'burun-cevir',
  'tavsan:su-spreyi': 'islak',
  'tavsan:top': 'urker',
  'tavsan:isi-lambasi': 'sicak',
  'kus:yumusak-firca': 'urker',
  'kus:minder': 'iyy',
  'kaplumbaga:kemik-biskuvi': 'urker',
  'kaplumbaga:tuy-degnek': 'urker',
  'kaplumbaga:battaniye': 'ortu-alti',
};
const GAG_ESYA: Record<string, Gag> = { 'su-spreyi': 'islak', 'tuy-degnek': 'hapsir', 'suluk-sisesi': 'damla', top: 'esne', 'karton-kutu': 'kafaya-gecer', 'kafes-ortusu': 'ortu-alti', battaniye: 'ortu-alti', 'isi-lambasi': 'sicak' };
const GAG_CEKMECE: Record<CekmeceAdi, Gag> = { mama: 'burun-cevir', su: 'burun-cevir', oyuncak: 'esne', temizlik: 'iyy', yatak: 'iyy', ecza: 'burun-cevir' };

/** Sevmediği eşyada komik tepki */
export function komik(tur: string, esya: string): Gag {
  return GAG[`${tur}:${esya}`] ?? GAG_ESYA[esya] ?? GAG_CEKMECE[esyaBilgi(esya).cekmece];
}

// ---------------------------------------------------------------- sevinç
/** İhtiyacı giderirken (sever / olur) hayvanın pozu: B ve H sayfalarından */
export const ISTE_POZ: Record<IhtiyacAdi, Poz> = { ac: 'yiyor', susuz: 'iciyor', kirli: 'fircalanma', sikildi: 'oyun', uykulu: 'uyku', hasta: 'fircalanma' };
/** Bu tepki işin ne kadarını sürer (ms) */
export const SEVINC_MS = { sever: 2000, olur: 1400 } as const;

/** Polaroid anı: hayvan + poz (günün en çok tekrarlanan anı; gun.ts'in foto'sundan) */
export const anAdi = (id: string, poz: Poz) => `${id}:${poz}`;
