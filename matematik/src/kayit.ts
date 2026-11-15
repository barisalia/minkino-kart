import { menuYasiOku } from '../../src/engine/menu-yas';
export type Kose = 'sayi' | 'sekil' | 'olcu' | 'fener';
export const koseler: Kose[] = ['sayi', 'sekil', 'olcu', 'fener'];
export const adlar: Record<Kose, string> = {
  sayi: 'Sayı masası',
  sekil: 'Şekil atölyesi',
  olcu: 'Ölçü tezgâhı',
  fener: 'Fener tiyatrosu',
};
export const son = 16;
export let minik = false;
export let dortYas = false;
let onek = '';
// Küçük masalarda miktar, ince motor yükü ve hatırlanacak adım sayısı ayrı ilerler.
const minikTurlar: Record<Kose, number[]> = {
  sayi: [0, 2, 1, 4, 2, 0, 5, 1, 2, 4, 1, 5, 4, 2, 5, 8],
  sekil: [0, 1, 4, 0, 2, 4, 1, 3, 4, 6, 0, 5, 1, 3, 4, 5],
  olcu: [0, 2, 1, 4, 2, 0, 4, 2, 3, 4, 7, 8, 0, 7, 8, 3],
  fener: [0, 1, 0, 3, 1, 2, 3, 4, 1, 3, 4, 10, 2, 4, 3, 10],
};
const dortYasTurlari: Record<Kose, number[]> = {
  sayi: [1, 2, 4, 3, 5, 6, 7, 8, 4, 9, 7, 8, 5, 10, 9, 12],
  sekil: [0, 4, 1, 2, 3, 5, 6, 8, 4, 7, 10, 9, 8, 5, 10, 12],
  olcu: [0, 4, 2, 3, 4, 7, 6, 8, 2, 8, 9, 10, 7, 9, 8, 12],
  fener: [1, 0, 3, 4, 5, 3, 6, 7, 10, 4, 7, 8, 10, 7, 8, 10],
};
export const turNumarasi = (k: Kose, adim: number) =>
  minik ? minikTurlar[k][adim] : dortYas ? dortYasTurlari[k][adim] : adim;
export type Tur = {
  adim: number;
  yer: number;
  secimler: number[];
  hatira: boolean;
  boncukHazir?: boolean;
  oruntuGiris?: boolean;
  tarif?: number;
  araba?: boolean;
  tekne?: boolean;
  siparis?: boolean;
  kuleTamam?: boolean;
  misketiGecti?: boolean;
  gezginBulunan?: number[];
  cizim?: { satir: number; nokta: number };
  tekrar?: number;
};
const bos = (): Tur => ({ adim: 0, yer: 0, secimler: [], hatira: false });
function oku(k: Kose): Tur {
  try {
    const v = JSON.parse(localStorage.getItem(onek + k) || 'null');
    if (
      v &&
      Number.isInteger(v.adim) &&
      v.adim >= 0 &&
      v.adim <= son &&
      Number.isInteger(v.yer) &&
      v.yer >= 0 &&
      v.yer <= 10 &&
      Array.isArray(v.secimler) &&
      v.secimler.length <= 16 &&
      v.secimler.every((n: unknown) => Number.isInteger(n) && Number(n) >= 0 && Number(n) <= 10)
    ) {
      const { tangramlar, tangramFinal, ...tur } = v;
      const bulunan = tangramFinal === 'baykus' ? [0, 1, 2, 3, 4, 5, 6]
        : tur.gezginBulunan ?? tangramlar?.gezgin?.bulunan;
      return {
        ...tur,
        // Eski köprü turlarında pozitif değerler tahta uzunluğuydu; ölçü taşı sıfırdır.
        secimler: k === 'olcu' && [0, 1, 4, 5].includes(turNumarasi(k, v.adim)) && v.secimler.some((n: number) => n > 0)
          ? [] : v.secimler,
        gezginBulunan: k === 'sekil' && Array.isArray(bulunan)
          ? [...new Set<number>(bulunan.filter((i: number) => Number.isInteger(i) && i >= 0 && i <= 6))]
          : undefined,
        tarif: [0, 1, 2].includes(v.tarif) ? v.tarif : undefined,
        tekrar: Number.isSafeInteger(v.tekrar) && v.tekrar >= 0 ? v.tekrar % 60 : 0,
        hatira: v.hatira === true || v.adim === son,
      };
    }
  } catch {}
  return bos();
}
export const durum = {} as Record<Kose, Tur>;
export function seviyeyiYukle() {
  const yas = menuYasiOku();
  minik = yas !== null && yas < 4;
  dortYas = yas === 4;
  const yeni = minik ? 'minkino-matematik-1-minik-' : dortYas ? 'minkino-matematik-1-dort-' : 'minkino-matematik-1-';
  if (onek !== yeni) {
    onek = yeni;
    for (const k of koseler) durum[k] = oku(k);
  }
  // İlk yükseltmede eski tek yoldaki bitmiş turları, seçili yaşın yoluna aktar.
  // Ara hareketler farklı sorulara ait olabileceği için yeni tur baştan açılır.
  if (yas === null) return;
  try {
    const aktarim = 'minkino-matematik-1-yas-aktarildi';
    if (localStorage.getItem(aktarim)) return;
    if (minik || dortYas) {
      for (const k of koseler) {
        if (localStorage.getItem(onek + k)) continue;
        const eski = JSON.parse(localStorage.getItem('minkino-matematik-1-' + k) || 'null');
        if (!Number.isInteger(eski?.adim) || eski.adim < 0 || eski.adim > son) continue;
        durum[k] = { ...bos(), adim: eski.adim, hatira: eski.hatira === true || eski.adim === son };
        kaydet(k);
      }
    }
    localStorage.setItem(aktarim, '1');
  } catch {}

}
seviyeyiYukle();
export function kaydet(k: Kose) {
  try {
    localStorage.setItem(onek + k, JSON.stringify(durum[k]));
  } catch {}
}
export function sifirla(k: Kose) {
  durum[k] = { ...bos(), hatira: durum[k].hatira, tekrar: ((durum[k].tekrar ?? 0) + 1) % 60 };
  kaydet(k);
}
