/**
 * Pati Dükkânı v2: ekonomi (saf, DOM yok; birim testli: tests/unit/pati-ekonomi.test.ts).
 *
 * - Pati jetonu: kumbaradaki jeton sayısı tek bir sayıdır. 5-6'da beşlikler BÜYÜK JETON olarak görünür ve "Beş!" diye
 *   sayılır, sonra birlikler devam eder ("Altı! Yedi!"). 3-4'te hep tek tek ("Bir! İki! Üç!").
 * - Hiçbir şey kötüleşmez: jeton erimez, kira yok, satın alınan hayvan hep dükkânda kalır.
 * - Vitrin: 6 cam bölme. Başlangıçta 3 yavru (kedi, köpek, tavşan; sabit bölmeleri 0-2), ilk alımdan sonra renk
 *   yavruları, köşesi açılınca o köşenin hayvanları. Çizimi gelmemiş yavru vitrine çıkmaz (bölme boş kalır).
 * - Kancalar (paket 2-3): kazanc() bakım ve ziyaret jetonları, koseAlinabilir/koseAc mağaza, esyaAl eşya.
 */
import { hayvanBilgi, HAYVAN_IDLERI, KOSELER, V2, yasla, esyaBilgi, type KoseAdi, type Yas } from './katalog';
import type { PatiKayit, SahipHayvan } from './kayit';

export const BUYUK_JETON = 5;
export const VITRIN_BOLME = 6;

export const baslangicJetonu = (yas: Yas) => yasla(V2.baslangic_jeton, yas);
export const fiyat = (id: string, yas: Yas) => yasla(hayvanBilgi(id).fiyat, yas);

export type KazancOlayi = keyof typeof V2.kazanc;
/** Bir olayın kazandırdığı jeton (PATI-V2 §5c) */
export const kazanc = (olay: KazancOlayi, yas: Yas) => yasla(V2.kazanc[olay], yas);

/** n jetonun görünüşü (büyükten küçüğe): 5-6'da beşlikler büyük jeton, 3-4'te hep tek */
export function jetonParcalari(n: number, yas: Yas): number[] {
  const p: number[] = [];
  let k = Math.max(0, Math.floor(n));
  if (yas === 'buyuk') while (k >= BUYUK_JETON) {
    p.push(BUYUK_JETON);
    k -= BUYUK_JETON;
  }
  while (k-- > 0) p.push(1);
  return p;
}

const SAYILAR = V2.nehir.sayi;
/** Toplam n'in sözü ("Bir!" … "On altı!"); listede yoksa rakam */
export const sayiSozu = (n: number) => SAYILAR[n - 1] ?? `${n}!`;

export interface Odeme {
  /** kumbaradan etikete sırayla uçan jetonlar (değerleri) */
  ucan: number[];
  /** her jeton indiğinde söylenen sayı (o ana kadarki toplam) */
  soz: string[];
  /** ödenen toplam */
  odenen: number;
  /** eksik kalan (0: alındı) */
  eksik: number;
}

/**
 * Ödeme dizisi: kumbaradaki jetonlar etikete uçar. Yeterse fiyat kadar (5-6'da önce büyük jeton: "Beş! Altı! Yedi!"),
 * yetmezse eldeki hepsi uçar, eksikler etikette boş daire kalır ve jetonlar kumbaraya döner.
 */
export function odemeDizisi(fiyat_: number, jeton: number, yas: Yas): Odeme {
  const odenecek = Math.min(fiyat_, Math.max(0, jeton));
  const ucan: number[] = [];
  let kalan = odenecek;
  // büyük jeton yalnız kumbarada varsa (jeton >= 5) ve ödenecek kısım en az 5 ise
  let buyukVar = yas === 'buyuk' ? Math.floor(jeton / BUYUK_JETON) : 0;
  while (buyukVar > 0 && kalan >= BUYUK_JETON) {
    ucan.push(BUYUK_JETON);
    kalan -= BUYUK_JETON;
    buyukVar--;
  }
  while (kalan-- > 0) ucan.push(1);
  let t = 0;
  const soz = ucan.map((v) => sayiSozu((t += v)));
  return { ucan, soz, odenen: odenecek, eksik: fiyat_ - odenecek };
}

/** Etiketteki fiyat yuvaları (büyükten küçüğe) ve bir ödeme toplamına göre hangilerinin dolduğu */
export const etiketYuvalari = (fiyat_: number, yas: Yas) => jetonParcalari(fiyat_, yas);
export function doluYuvalar(yuvalar: readonly number[], odenen: number): boolean[] {
  let t = 0;
  return yuvalar.map((v) => (t += v) <= odenen);
}

// ---------------------------------------------------------------- köşe ve yer

export const koseAcik = (k: PatiKayit, kose: KoseAdi) => k.koseler.includes(kose);
export const koseDolu = (k: PatiKayit, kose: KoseAdi) => k.hayvanlar.filter((h) => h.kose === kose).length >= KOSELER[kose].yer;
/** Köşedeki ilk boş yer (yoksa -1) */
export function bosYer(k: PatiKayit, kose: KoseAdi): number {
  const dolu = new Set(k.hayvanlar.filter((h) => h.kose === kose).map((h) => h.yer));
  for (let i = 0; i < KOSELER[kose].yer; i++) if (!dolu.has(i)) return i;
  return -1;
}
/** Bu hayvana dükkânda yer var mı (köşesi açık ve boş yeri var) */
export const yerVar = (k: PatiKayit, id: string) => koseAcik(k, hayvanBilgi(id).kose) && bosYer(k, hayvanBilgi(id).kose) >= 0;
export const sahipMi = (k: PatiKayit, id: string) => k.hayvanlar.some((h) => h.id === id);

/** Köşe mağazada görünür mü (Bahçe: Dede'nin ilk ziyaretinden sonra; Sürüngen: 4 hayvandan sonra) — paket 3 */
export function koseGorunur(k: PatiKayit, kose: KoseAdi): boolean {
  const kosul = KOSELER[kose].kosul;
  if (kosul === 'dede-ziyareti') return (k.ziyaretler['dede'] ?? 0) > 0;
  if (kosul === 'dort-hayvan') return k.hayvanlar.length >= 4;
  return true;
}
export const koseFiyati = (kose: KoseAdi, yas: Yas) => yasla(KOSELER[kose].fiyat, yas);
export const koseAlinabilir = (k: PatiKayit, kose: KoseAdi, yas: Yas) => !koseAcik(k, kose) && koseGorunur(k, kose) && k.jeton >= koseFiyati(kose, yas);
/** Köşe satın alır (paket 3 mağaza); alınamazsa false, hiçbir şey değişmez */
export function koseAc(k: PatiKayit, kose: KoseAdi, yas: Yas): boolean {
  if (!koseAlinabilir(k, kose, yas)) return false;
  k.jeton -= koseFiyati(kose, yas);
  k.koseler.push(kose);
  return true;
}
/** Eşya satın alır (paket 3 mağaza): bir kez alınır, hiç bitmez */
export function esyaAl(k: PatiKayit, id: string, yas: Yas): boolean {
  const e = esyaBilgi(id);
  const f = yasla(e.fiyat, yas);
  if (e.bastan || k.esyalar.includes(id) || k.jeton < f) return false;
  k.jeton -= f;
  k.esyalar.push(id);
  return true;
}

// ---------------------------------------------------------------- vitrin ve satın alma

/** Bu yavru vitrine çıkabilir mi (alınmamış, zamanı gelmiş) */
export function vitrineGelir(k: PatiKayit, id: string): boolean {
  if (sahipMi(k, id)) return false;
  const b = hayvanBilgi(id);
  if (b.vitrin === 'baslangic') return true;
  if (b.vitrin === 'ilk-alim') return k.hayvanlar.length > 0;
  return koseAcik(k, b.kose);
}

/**
 * Vitrindeki 6 bölme (boş: null). Başlangıç yavruları kendi bölmelerinde (0, 1, 2) durur; ötekiler boş bölmelere sırayla
 * gelir. gorselVar: çizimi olmayan yavru vitrine çıkmaz.
 */
export function vitrin(k: PatiKayit, gorselVar: (id: string) => boolean = () => true): (string | null)[] {
  const bolme: (string | null)[] = Array(VITRIN_BOLME).fill(null);
  const baslangic = HAYVAN_IDLERI.filter((id) => hayvanBilgi(id).vitrin === 'baslangic');
  baslangic.forEach((id, i) => {
    if (i < VITRIN_BOLME && vitrineGelir(k, id) && gorselVar(id)) bolme[i] = id;
  });
  const oteki = HAYVAN_IDLERI.filter((id) => hayvanBilgi(id).vitrin !== 'baslangic' && vitrineGelir(k, id) && gorselVar(id));
  for (const id of oteki) {
    const i = bolme.indexOf(null, baslangic.length) >= 0 ? bolme.indexOf(null, baslangic.length) : bolme.indexOf(null);
    if (i < 0) break;
    bolme[i] = id;
  }
  return bolme;
}

export type AlimSonucu = { durum: 'tamam'; hayvan: SahipHayvan } | { durum: 'jeton'; eksik: number } | { durum: 'yer' } | { durum: 'yok' };

/** Satın alma: jeton yetmez ya da yer yoksa hiçbir şey değişmez */
export function satinAl(k: PatiKayit, id: string, yas: Yas): AlimSonucu {
  if (!vitrineGelir(k, id)) return { durum: 'yok' };
  if (!yerVar(k, id)) return { durum: 'yer' };
  const f = fiyat(id, yas);
  if (k.jeton < f) return { durum: 'jeton', eksik: f - k.jeton };
  const b = hayvanBilgi(id);
  k.jeton -= f;
  const h: SahipHayvan = { id, ad: b.ad, kose: b.kose, yer: bosYer(k, b.kose), minder: null, kalp: 0, dans: 0, sonDans: 0, ihtiyac: null };
  k.hayvanlar.push(h);
  return { durum: 'tamam', hayvan: h };
}
