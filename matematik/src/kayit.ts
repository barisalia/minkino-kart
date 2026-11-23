import { menuYasiOku } from '../../src/engine/menu-yas';
import { ESKI_SON, KAYIT_SURUMU, SIRALAR, adimiTasi, etkinSira, surum2Tasi, type Kose, type Yol } from './tur-sirasi';
import { ekAcik } from './ek-turlar';
export type { Kose } from './tur-sirasi';
export const koseler: Kose[] = ['sayi', 'sekil', 'olcu', 'fener'];
export const adlar: Record<Kose, string> = {
  sayi: 'Sayı masası',
  sekil: 'Şekil evi',
  olcu: 'Ölçü tezgâhı',
  fener: 'Fener tiyatrosu',
};
export let minik = false;
export let dortYas = false;
let onek = '';
const yol = (): Yol => (minik ? 'minik' : dortYas ? 'dort' : 'bes');
/** Oyuncağın oynanan sırası: eski turlar ve çizimi, sesi tamam ek turlar (tur-sirasi.ts → etkinSira; ek-turlar.ts). */
const siralar = new Map<string, number[]>();
export const sira = (k: Kose, y: Yol = yol()) => {
  const a = y + k;
  if (!siralar.has(a)) siralar.set(a, etkinSira(y, k, ekAcik));
  return siralar.get(a)!;
};
/** Oyuncağın hatırasına kadar tur sayısı (yaşa göre). */
export const sonu = (k: Kose) => sira(k).length;
// Küçük masalarda miktar, ince motor yükü ve hatırlanacak adım sayısı ayrı ilerler; her tür en çok iki kez gelir.
export const turNumarasi = (k: Kose, adim: number) => sira(k)[Math.min(adim, sonu(k) - 1)];
export type Tur = {
  adim: number;
  yer: number;
  secimler: number[];
  hatira: boolean;
  boncukHazir?: boolean;
  tarif?: number;
  kuleTamam?: boolean;
  misketiGecti?: boolean;
  gezginBulunan?: number[];
  cizim?: { satir: number; nokta: number };
  tekrar?: number;
  /** Uzun açıklayan övgüsü söylenmiş tur türleri (bu oynayışta; yeniden oynayışta sıfırlanır). */
  anlatilan?: string[];
  /** Hızlı Gözler turunun soru adetleri (akıllı tekrar öne almış olabilir) ve öne alınan zor sayılar; tur bitince silinir. */
  plan?: number[];
  planZor?: number[];
  /** Kayıt düzeni: yoksa eski 16 turluk kayıttır (tur-sirasi.ts → KAYIT_SURUMU). */
  surum?: number;
};
const bos = (): Tur => ({ adim: 0, yer: 0, secimler: [], hatira: false, surum: KAYIT_SURUMU });
/** Eski ya da sınırı aşan kaydı yeni sıraya taşır: oran korunur, yarım tur baştan açılır (ara hareketler başka işe aitti). */
function tasi(k: Kose, v: Tur, eskiSon: number): Tur {
  // Sürüm 1 (eski 16 turluk sıra): oran yalnız eski turların sırasına göre alınır, sonra o eski turun etkin sıradaki yerine
  // gidilir (sürüm 2 gibi). Ek turlar orana girmez: Astra'nın çizimleri geldikçe aynı kayıt başka tura kaymaz.
  const { adim, hatira } = v.surum === undefined
    ? (({ adim: a, hatira: h }) => surum2Tasi(yol(), k, a, h, sira(k)))(adimiTasi(v.adim, v.hatira === true, eskiSon, SIRALAR[yol()][k].length))
    : adimiTasi(v.adim, v.hatira, eskiSon, sonu(k));
  const yeni: Tur = { ...v, adim, hatira, yer: 0, secimler: [], surum: KAYIT_SURUMU };
  // Yarım turun ara bilgileri silinir (eski sürümlerin tekne/sipariş/araba/örüntü bayrakları da).
  for (const ara of ['tekne', 'siparis', 'araba', 'tarif', 'cizim', 'boncukHazir', 'oruntuGiris', 'plan', 'planZor']) delete (yeni as Record<string, unknown>)[ara];
  return yeni;
}

function oku(k: Kose): Tur {
  try {
    const v = JSON.parse(localStorage.getItem(onek + k) || 'null');
    if (
      v &&
      Number.isInteger(v.adim) &&
      v.adim >= 0 &&
      v.adim <= Math.max(ESKI_SON, sonu(k)) &&
      Number.isInteger(v.yer) &&
      v.yer >= 0 &&
      v.yer <= 10 &&
      Array.isArray(v.secimler) &&
      // Üç ölçütlü sınıflama 18 seçim tutar (derinlik.ts).
      v.secimler.length <= 24 &&
      v.secimler.every((n: unknown) => Number.isInteger(n) && Number(n) >= 0 && Number(n) <= 10)
    ) {
      const { tangramlar, tangramFinal, ...ham } = v;
      // Sürüm 2 (ek turlardan önceki sıra): eski turlar aynı sırada, çocuk kaldığı turdan sürer; bitirmişse yeni turlara geçer.
      if (ham.surum === 2) {
        const t2 = surum2Tasi(yol(), k, ham.adim, ham.hatira === true, sira(k));
        Object.assign(ham, { adim: t2.adim, hatira: t2.hatira, surum: KAYIT_SURUMU }, t2.ayniYer ? {} : { yer: 0, secimler: [] });
        if (!t2.ayniYer) for (const ara of ['tarif', 'cizim', 'boncukHazir', 'plan', 'planZor']) delete (ham as Record<string, unknown>)[ara];
      }
      const tur = ham.surum === KAYIT_SURUMU && ham.adim <= sonu(k) ? ham : tasi(k, ham, ham.surum === KAYIT_SURUMU ? ham.adim : ESKI_SON);
      const bulunan = tangramFinal === 'baykus' ? [0, 1, 2, 3, 4, 5, 6]
        : tur.gezginBulunan ?? tangramlar?.gezgin?.bulunan;
      return {
        ...tur,
        gezginBulunan: k === 'sekil' && Array.isArray(bulunan)
          ? [...new Set<number>(bulunan.filter((i: number) => Number.isInteger(i) && i >= 0 && i <= 6))]
          : undefined,
        tarif: [0, 1, 2].includes(tur.tarif) ? tur.tarif : undefined,
        tekrar: Number.isSafeInteger(v.tekrar) && v.tekrar >= 0 ? v.tekrar % 60 : 0,
        anlatilan: Array.isArray(v.anlatilan) ? v.anlatilan.filter((x: unknown) => typeof x === 'string').slice(0, 20) : undefined,
        hatira: tur.hatira === true || tur.adim === sonu(k),
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
    for (const k of koseler) {
      durum[k] = oku(k);
      // Eski düzenden taşınan kayıt hemen yeni biçimde yazılır (bir sonraki açılış aynı yerden sürsün).
      try {
        const ham = localStorage.getItem(onek + k);
        const v = ham && JSON.parse(ham);
        if (v && (v.surum !== KAYIT_SURUMU || v.adim !== durum[k].adim)) kaydet(k);
      } catch {}
    }
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
        const eskiSon = eski?.surum === KAYIT_SURUMU ? sira(k, 'bes').length : eski?.surum === 2 ? etkinSira('bes', k, (n) => n < 100).length : ESKI_SON;
        if (!Number.isInteger(eski?.adim) || eski.adim < 0 || eski.adim > eskiSon) continue;
        durum[k] = { ...bos(), ...adimiTasi(eski.adim, eski.hatira === true, eskiSon, sonu(k)) };
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
