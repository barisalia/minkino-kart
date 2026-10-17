/**
 * YOĞUR VE YUVARLA · saf mantık (DOM yok, birim testli). ekip/senaryo/RESTORAN.md §8 M8.
 *
 * Harç kâsede (başta 6 birim). Raftan eklenen malzeme harcı yeniden "karışmamış" yapar; sıkıştırdıkça karışır
 * (3-4: üç sıkıştırma, 5-6: beş). Avuç avuç koparılır: ne kadar tutarsan o kadar büyük (küçük topak … kocaman).
 * Topak tahtada daire çizilerek yuvarlanır (3-4: bir daire, 5-6: bir tam tur), bastırılınca yassı köfte olur;
 * çok bastırılırsa incecik krep (komik: Mino yüzüne maske yapar). Krep de köftedir, yine pişer ve yenir.
 */
import type { Malzeme, Yas, YemekOzelligi } from '../arayuz';

export const HARC_BASTA = 6;
/** harcın karışması için gereken sıkıştırma */
export const SIKMA_GEREK: Record<Yas, number> = { kucuk: 3, buyuk: 5 };
/** tutma süresinden topak boyu (harç birimi) */
export const BOY_EN_AZ = 0.6;
export const BOY_EN_COK = 2.2;
/** bir tam boyun büyümesi kaç ms tutmak */
export const BUYUME_MS = 1100;

export type Sekil = 'putur' | 'top' | 'yassi' | 'ince' | 'krep';
export type BoyAdi = 'kucuk' | 'orta' | 'kocaman';

export interface Topak {
  id: number;
  /** harç birimi (0.6 … 2.2) */
  boy: number;
  sekil: Sekil;
  /** yuvarlama ilerlemesi 0-1 (1 = top) */
  yuvarlak: number;
  /** koparıldığında harç ne kadar karışmıştı (0-1) */
  karisim: number;
}

export interface YogurDurum {
  /** kâsede kalan harç (birim) */
  harc: number;
  /** 0-1 */
  karisim: number;
  sikma: number;
  /** harca eklenenler (avuç sayısı) */
  eklenen: Partial<Record<Malzeme, number>>;
  tuz: number;
  aci: number;
  topaklar: Topak[];
}

export const bosDurum = (): YogurDurum => ({ harc: HARC_BASTA, karisim: 0, sikma: 0, eklenen: {}, tuz: 0, aci: 0, topaklar: [] });

/** Bir sıkıştırma: karışma artar (eşikte 1) */
export function sik(d: YogurDurum, yas: Yas): { karisti: boolean } {
  const once = d.karisim;
  d.sikma++;
  d.karisim = Math.min(1, d.karisim + 1 / SIKMA_GEREK[yas]);
  return { karisti: once < 1 && d.karisim >= 1 };
}

/** Harca malzeme eklendi: yeni şey karışmamış durur (karışma yarıya iner, en az bir sıkıştırma daha) */
export function malzemeEkle(d: YogurDurum, m: Malzeme | 'tuz' | 'pulbiber') {
  if (m === 'tuz') d.tuz++;
  else if (m === 'pulbiber') d.aci++;
  else d.eklenen[m] = (d.eklenen[m] ?? 0) + 1;
  d.karisim *= 0.5;
}

/** Tutma süresinden (ms) topak boyu; kalan harcı aşmaz */
export function koparBoyu(ms: number, kalan: number): number {
  const b = BOY_EN_AZ + (Math.max(0, ms) / BUYUME_MS) * (BOY_EN_COK - BOY_EN_AZ) * 0.7;
  return +Math.min(BOY_EN_COK, Math.max(Math.min(BOY_EN_AZ, kalan), Math.min(b, kalan))).toFixed(2);
}

export const boyAdi = (boy: number): BoyAdi => (boy < 0.95 ? 'kucuk' : boy < 1.55 ? 'orta' : 'kocaman');

/** Harçtan bir avuç koparır (kalan harç yetmezse null) */
let sayac = 1;
export function kopar(d: YogurDurum, boy: number): Topak | null {
  if (d.harc < 0.25) return null;
  const b = Math.min(boy, d.harc);
  d.harc = +(d.harc - b).toFixed(2);
  if (d.harc < 0.25) d.harc = 0;
  const t: Topak = { id: sayac++, boy: b, sekil: 'putur', yuvarlak: 0, karisim: d.karisim };
  d.topaklar.push(t);
  return t;
}

/** Topak tahtadan harca geri döner (bırakılacak yer yoksa) */
export function geriKoy(d: YogurDurum, t: Topak) {
  d.topaklar = d.topaklar.filter((x) => x !== t);
  d.harc = +Math.min(HARC_BASTA, d.harc + t.boy).toFixed(2);
}

/** Daire çizerek yuvarla: aci = dönülen açı (radyan, işaretsiz). Top olunca true. */
export function yuvarla(t: Topak, aci: number, yas: Yas): boolean {
  if (t.sekil !== 'putur') return false;
  const tur = yas === 'kucuk' ? Math.PI * 1.5 : Math.PI * 2;
  t.yuvarlak = Math.min(1, t.yuvarlak + Math.abs(aci) / tur);
  if (t.yuvarlak >= 1) {
    t.sekil = 'top';
    return true;
  }
  return false;
}

/** Bastır: top → yassı → ince → krep (son durak). Pütürlü topak da bastırılınca yassılaşır. */
export function bastir(t: Topak): Sekil {
  const sira: Sekil[] = ['putur', 'top', 'yassi', 'ince', 'krep'];
  if (t.sekil === 'putur') t.sekil = 'yassi';
  else t.sekil = sira[Math.min(sira.length - 1, sira.indexOf(t.sekil) + 1)];
  if (t.sekil !== 'putur') t.yuvarlak = 1;
  return t.sekil;
}

/** Biçimlenmiş köfte (top ya da yassı ya da krep) */
export const bicimli = (t: Topak) => t.sekil !== 'putur';

/** 5-6: köfteler aynı boyda mı (en az üç biçimli köfte, boyları ortalamanın ±%20'sinde) */
export function ayniBoy(topaklar: Topak[]): boolean {
  const b = topaklar.filter(bicimli);
  if (b.length < 3) return false;
  const ort = b.reduce((t, x) => t + x.boy, 0) / b.length;
  return b.every((x) => Math.abs(x.boy - ort) <= ort * 0.2);
}

/** Porsiyon: kocaman topak ya da toplam ≥ 5 birim → kocaman; toplam ≤ 1.2 → az */
export function porsiyonBul(topaklar: Topak[]): 'az' | 'normal' | 'kocaman' {
  const top = topaklar.reduce((t, x) => t + x.boy, 0);
  if (topaklar.some((x) => boyAdi(x.boy) === 'kocaman') || top >= 5) return 'kocaman';
  if (top <= 1.2) return 'az';
  return 'normal';
}

/** İşin doğal sonu: harç bitti ve her topak biçimlendi (ya da en az 3 / 4 biçimli köfte) */
export function dogalSon(d: YogurDurum, yas: Yas): boolean {
  const b = d.topaklar.filter(bicimli).length;
  if (!d.topaklar.length) return false;
  if (d.harc <= 0 && b === d.topaklar.length) return true;
  return b >= (yas === 'kucuk' ? 3 : 4) && b === d.topaklar.length;
}

/** Ürünün özellik seti (çiğ köfte; mangal pişirir) */
export function kofteOzelligi(d: YogurDurum): YemekOzelligi {
  const malzemeler: YemekOzelligi['malzemeler'] = { kofte: { adet: d.topaklar.length } };
  for (const [m, n] of Object.entries(d.eklenen)) if (n) malzemeler[m as Malzeme] = { adet: n, kesim: 'kiyim' };
  const o: YemekOzelligi = {
    malzemeler,
    porsiyon: porsiyonBul(d.topaklar),
    karisim: +(d.topaklar.length ? d.topaklar.reduce((t, x) => t + x.karisim, 0) / d.topaklar.length : d.karisim).toFixed(2),
  };
  if (d.tuz) o.tuz = Math.min(3, d.tuz);
  if (d.aci) o.aci = Math.min(3, d.aci);
  return o;
}

/** Topak ekranda kaç css px (taban: orta boy köftenin çapı) */
export function topakCap(t: Pick<Topak, 'boy' | 'sekil'>, taban: number): number {
  const k = Math.sqrt(t.boy);
  const yay = t.sekil === 'yassi' ? 1.22 : t.sekil === 'ince' ? 1.45 : t.sekil === 'krep' ? 1.85 : t.sekil === 'top' ? 0.92 : 1;
  return taban * k * yay;
}
