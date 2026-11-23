// Resimli Sözlük'ün saf kuralları (tests/unit/alfabe-resimli-sozluk.test.ts sınar).
// Her harfin sayfasında o harfin resimli, Ceren kayıtlı sözcükleri (en çok 6): önce dersin örnek sözcüğü, sonra sözcük
// havuzu (Astra H6/H8), sonra öbür kaynaklar (sozcuk-kaynagi.ts). Ğ türkçede sözcük başında olmadığı için içinde geçenler.
// Sayfadaki "bul" anı her harfte bir kez; hedef sözcük örnek sözcük değildir ve iki harfte aynı sözcük hedef olmaz.
import { hecele } from './posta-kutusu-secim';

export type SozlukSozcugu = { id: string; ad: string; gorsel: string; ses: string };
export type SozlukHarfi = { id: string; upper: string; lower: string; example?: string };
export const EN_COK = 6;

const kucuk = (s: string) => s.toLocaleLowerCase('tr');

/** Sözcük bu harfin mi: harfle başlar; Ğ'de içinde geçer. */
export const harfinMi = (h: SozlukHarfi, ad: string) => (h.lower === 'ğ' ? kucuk(ad).includes('ğ') : kucuk(ad).startsWith(h.lower));

/** Dersin örnek sözcüğü mü (numara ya da ad). */
export const ornekMi = (h: SozlukHarfi, s: SozlukSozcugu) => s.id === h.id || (!!h.example && kucuk(s.ad) === kucuk(h.example));

/** Harfin sayfasındaki sözcükler: örnek sözcük önde, aynı ad bir kez, en çok 6. liste sırası öncelik sırasıdır. */
export function sayfaSozcukleri(h: SozlukHarfi, liste: readonly SozlukSozcugu[]): SozlukSozcugu[] {
  const aday = liste.filter(s => harfinMi(h, s.ad));
  // Örnek sözcük kaynakta ders numarasıyla ya da adıyla gelebilir (sozcuk-kaynagi.ts adıyla verir).
  const ornek = aday.filter(s => ornekMi(h, s));
  const sonuc: SozlukSozcugu[] = [], gorulen = new Set<string>();
  for (const s of [...ornek, ...aday]) {
    const a = kucuk(s.ad);
    if (gorulen.has(a)) continue;
    gorulen.add(a); sonuc.push(s);
    if (sonuc.length === EN_COK) break;
  }
  return sonuc;
}

/** Heceler, sözcük sözcük: "uğur böceği" → [["u","ğur"],["bö","ce","ği"]]. */
export const hecelere = (ad: string) => kucuk(ad).split(/\s+/).filter(Boolean).map(hecele);

/** Parlayacak harfin yeri: [sözcük, hece, harf] (Ğ'de ilk ğ, öbürlerinde ilk harf). */
export function parlayanYer(h: SozlukHarfi, ad: string): [number, number, number] {
  if (h.lower !== 'ğ') return [0, 0, 0];
  const heceler = hecelere(ad);
  for (let s = 0; s < heceler.length; s++) for (let c = 0; c < heceler[s].length; c++) {
    const i = heceler[s][c].indexOf('ğ');
    if (i >= 0) return [s, c, i];
  }
  return [0, 0, 0];
}

/**
 * Her harfin "bul" hedefi (harf sırasıyla): örnek sözcük dışındaki sözcüklerden, harfin sırasına göre dönen yerden
 * başlayarak, başka harfe hedef olmamış ilk sözcük. sayfalar: harf kimliği → sayfa sözcükleri.
 */
export function bulHedefleri(sira: readonly string[], sayfalar: Readonly<Record<string, readonly SozlukSozcugu[]>>,
  harfler: readonly SozlukHarfi[] = []): Record<string, string> {
  const kullanilan = new Set<string>(), sonuc: Record<string, string> = {};
  sira.forEach((id, n) => {
    const h = harfler.find(x => x.id === id) ?? { id, upper: '', lower: '' };
    const aday = (sayfalar[id] ?? []).filter(s => !ornekMi(h, s));
    if (!aday.length) return;
    for (let k = 0; k < aday.length; k++) {
      const s = aday[(n + k) % aday.length];
      const a = kucuk(s.ad);
      if (kullanilan.has(a)) continue;
      kullanilan.add(a); sonuc[id] = s.id;
      return;
    }
  });
  return sonuc;
}
