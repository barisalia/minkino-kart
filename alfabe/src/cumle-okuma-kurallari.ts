// "Ceren'le oku" bölümünün DOM'suz kuralları: okunabilirlik süzgeci, yaşa göre seçim, kayıt adları.
import harfler from './harfler.json';
import veri from './cumle-okuma-veri.json';
import oykuVeri from './oyku-veri.json';
import { HARF_SIRASI, SES_GRUPLARI } from './harf-sirasi';

/** "Okuduğunu yaptır" anı (5+ yaş): çocuk sahnede hedefe dokunur, cümle gerçekleşir (cumle-NN → cumle-NN-sonra).
 *  points: dokunma bölgesi, sahne kartının yüzdesiyle çokgen (Resimde Bul'daki gibi "x,y x,y …"). */
export interface Yaptir { hedef: string; points: string }
/** zamanlar: Ceren'in cümle kaydında her sözcüğün başladığı an (ms; ElevenLabs zaman damgaları). */
/** gecici: Astra'nın sahnesi gelene kadar gösterilen resim (eski cümleler). gecici'si olmayan cümle sahnesi gelince açılır. */
export interface Cumle { id: string; metin: string; gecici?: string; zamanlar?: number[]; yaptir?: Yaptir }
export const cumleler = veri as Cumle[];
/** "Ceren'in Hikâye Defteri": her ses grubu bitince bir öykü uyanır; sayfalar cümle gibi okunur, son sayfa okuduğunu yaptır. */
export interface Oyku { id: string; grup: number; baslik: string; sayfalar: Cumle[] }
export const oykuler = oykuVeri as Oyku[];
// Astra'nın diskteki çizimleri (cümle sahneleri ve öykü sayfaları), dosya adıyla. Çizimi gelmeyen içerik görünmez.
const CIZIMLER = new Set(Object.keys(import.meta.glob('../../assets/alfabe/{cumle,oyku}/*.webp')).map((y) => y.split('/').pop()!.replace(/\.webp$/, '')));
export const cizimVar = (ad: string) => CIZIMLER.has(ad.replace(/\.webp$/, ''));
/** Cümle görünür mü: geçici resmi olan eski cümle her zaman; yenisi yalnız sahnesi geldiyse. */
export const gorunur = (c: Cumle) => !!c.gecici || cizimVar(c.id);
export type CumleYasi = '2-3' | '4' | '5+';

const kucuk = (s: string) => s.normalize('NFC').toLocaleLowerCase('tr');
/** Cümlenin sözcükleri (noktalama atılır, büyük harf korunur). */
export const sozcukleri = (metin: string) => metin.replace(/[.,!?]/g, '').split(/\s+/).filter(Boolean);
/** Her sözcüğün ardındaki noktalama (sözcüklerle aynı sırada): "Kino, Mino ile Lokum." → [',', '', '', '.']. Ekranda taşın dışında gösterilir. */
export const isaretleri = (metin: string) => metin.trim().split(/\s+/).filter((p) => /[\p{L}]/u.test(p)).map((p) => (p.match(/[.,!?]+$/) ?? [''])[0]);
/** Cümlede geçen bütün harfler (küçük, tekil). */
export function harfleri(metin: string): string[] {
  return [...new Set([...kucuk(metin)].filter((c) => /\p{L}/u.test(c)))];
}
/** Bitirilmiş harf kimliklerinden (01…29) çocuğun bildiği küçük harfler. */
export function bilinenHarfler(bitenHarfler: string[]): Set<string> {
  const k = new Set<string>();
  for (const h of harfler as { id: string; lower: string }[]) if (bitenHarfler.includes(h.id)) k.add(h.lower);
  return k;
}
/** Bir cümle yalnız çocuğun bitirdiği harflerden kuruluysa okunabilir. */
export function okunabilir(c: Cumle, bilinen: Set<string>) {
  return harfleri(c.metin).every((h) => bilinen.has(h));
}
/** 4 yaş: bir ya da iki sözcük. 5+: iki ile dört sözcük. 2–3 yaşta bölüm açılmaz. */
export function yasaUygun(c: Cumle, yas: CumleYasi) {
  const n = sozcukleri(c.metin).length;
  if (yas === '2-3') return false;
  return yas === '4' ? n <= 2 : n >= 2 && n <= 4;
}
/** Minkino kadrosu: cümlede bu adlardan biri geçiyorsa cümle öne alınır (çocuk önce tanıdığı kahramanları okur). */
export const KADRO = ['anne', 'baba', 'babaanne', 'dede', 'kino', 'mino', 'lokum', 'bulut', 'zıpzıp'];
export const kadrodan = (c: Cumle) => sozcukleri(c.metin).some((s) => KADRO.includes(kucuk(s)));
/** Okunabilir ve yaşa uygun cümleler; kadro cümleleri önde, kendi içlerinde listedeki sırayla. Harf sırasından bağımsız:
 *  bir cümle, içindeki harflerin hepsi bitince açılır (A–Z ya da MEB ses grupları fark etmez). */
export function okunacaklar(bitenHarfler: string[], yas: CumleYasi): Cumle[] {
  const bilinen = bilinenHarfler(bitenHarfler);
  const acik = cumleler.filter((c) => gorunur(c) && okunabilir(c, bilinen) && yasaUygun(c, yas));
  return [...acik.filter(kadrodan), ...acik.filter((c) => !kadrodan(c))];
}
/** "Okuduğunu yaptır" anı açılır mı: cümlenin yaptır verisi var, çocuk 5+ yaşta ve Astra'nın önce ile sonra karesi
 *  diskte (sahneVar: dosya adı → var mı). Test kipinde yerTutucu ile kareler olmadan da açılır. */
export function yaptirAcilir(c: Cumle, yas: CumleYasi, sahneVar: (ad: string) => boolean, yerTutucu = false) {
  return !!c.yaptir && yas === '5+' && ((sahneVar(c.id + '.webp') && sahneVar(c.id + '-sonra.webp')) || yerTutucu);
}
/** Öykü hazır mı: dört sayfanın ve son sayfanın sonra karesinin çizimi diskte (test kipinde çizimsiz de). */
export function oykuHazir(o: Oyku, cizimsiz = false) {
  return cizimsiz || o.sayfalar.every((s) => cizimVar(s.id) && (!s.yaptir || cizimVar(s.id + '-sonra')));
}
/** Açık öyküler (5+ yaş): kendi ses grubuna kadarki bütün harfler bitmiş ve çizimleri gelmiş. Bir ses grubunun ikinci
 *  öyküsü (2. cilt, oyku-6…10) o grubun önceki öyküsü okununca açılır (okunanOykuler: okunmuş öykü kimlikleri). */
export function acikOykuler(bitenHarfler: string[], yas: CumleYasi, cizimsiz = false, okunanOykuler: string[] = []): Oyku[] {
  if (yas !== '5+') return [];
  return oykuler.filter((o, i) => SES_GRUPLARI.slice(0, o.grup).flat().every((id) => bitenHarfler.includes(id)) && oykuHazir(o, cizimsiz) &&
    oykuler.slice(0, i).filter((x) => x.grup === o.grup).every((x) => okunanOykuler.includes(x.id)));
}
const ASCII: Record<string, string> = { ç: 'cc', ş: 'ss', ı: 'ii', ö: 'oo', ü: 'uu', ğ: 'gg' };
/** Sözcük kaydının adı: cumle-soz-<sözcük> (ASCII; ç→cc, ş→ss, ı→ii, ö→oo, ü→uu, ğ→gg). */
export function sozcukKaydi(sozcuk: string) {
  return 'cumle-soz-' + [...kucuk(sozcuk)].map((c) => ASCII[c] ?? c).join('');
}

/** Bölümün durumu (raf kartı ve boş durum için). acik: yaşa uygun, okunabilir cümle sayısı. Hiç açık cümle yoksa
 *  enYakin: öğretim sırasında en erken açılacak yaşa uygun cümle (kalan harflerinin sıradaki en geç yeri en küçük olan;
 *  eşitse kalan harfi az olan, o da eşitse kadro cümlesi), eksikHarfler: onun için kalan harfler, büyük harfle ve öğretim
 *  sırasıyla. Hiç harf bitmemişse 4 yaş "Anne." için ['A', 'N', 'E'], 5+ "Anne nane tat." için ['A', 'N', 'E', 'T'].
 *  2–3 yaşta hep boş. */
export interface CumleDurumu { acik: number; enYakin?: Cumle; eksikHarfler: string[] }
/** harfSirasi: rafın öğretim sırası (harf kimlikleri); verilmezse Harf Atölyesi'nin tek kaynağı harf-sirasi.ts → HARF_SIRASI (ses grupları). */
export function cumleDurumu(bitenHarfler: string[], yas: CumleYasi, harfSirasi: readonly string[] = HARF_SIRASI): CumleDurumu {
  const acik = okunacaklar(bitenHarfler, yas).length;
  if (acik || yas === '2-3') return { acik, eksikHarfler: [] };
  const bilinen = bilinenHarfler(bitenHarfler);
  const liste = harfler as { id: string; lower: string; upper: string }[];
  const sirali = harfSirasi.map((id) => liste.find((d) => d.id === id)!).filter(Boolean);
  const sira = (h: string) => { const i = sirali.findIndex((d) => d.lower === h); return i < 0 ? sirali.length : i; };
  // Kadro cümleleri listede önce: eşitlikte onlar seçilir.
  let enYakin: Cumle | undefined, eksik: number[] = [], acilis = Infinity;
  for (const c of [...cumleler.filter(kadrodan), ...cumleler.filter((x) => !kadrodan(x))]) {
    if (!gorunur(c) || !yasaUygun(c, yas)) continue;
    const e = harfleri(c.metin).filter((h) => !bilinen.has(h)).map(sira).sort((a, b) => a - b);
    const son = e.length ? e[e.length - 1] : -1;
    if (son < acilis || (son === acilis && e.length < eksik.length)) { enYakin = c; eksik = e; acilis = son; }
  }
  return { acik: 0, enYakin, eksikHarfler: eksik.filter((i) => i < sirali.length).map((i) => sirali[i].upper) };
}
