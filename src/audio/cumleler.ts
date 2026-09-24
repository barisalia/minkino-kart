/**
 * Oyunun söyleyebileceği tüm cümleler. Seslendirme betiği (scripts/seslendir.ts) bu listeyi kullanır;
 * oyun da cümleleri aynı parçalara bölerek söyler, böylece her parça için bir kayıt dosyası olur.
 */
import metinler from '../../content/metinler.json';
import { kart, KARTLAR, refCoz, TEMALAR, tumIcerikDosyalari } from '../engine/katalog';
import type { KartGirdi, Soru } from '../engine/types';
import { buyukHarfBas, sayiAdi } from './metin';

/** Kayıt anahtarı: boşlukları sadeleştirilmiş metin. */
export const normal = (t: string) => t.replace(/\s+/g, ' ').trim();

/** Doğru cevaptan sonra övgünün ardından söylenecek parçalar. */
export function aciklamaParcalari(s: Soru, g: KartGirdi | undefined): string[] {
  if (s.dogru_ses) return [s.dogru_ses];
  if (!g) return [];
  const r = refCoz(g);
  if (r.yazi) return [`${buyukHarfBas(r.yazi.toLocaleLowerCase('tr'))}!`];
  const k = r.kart ? kart(r.kart) : undefined;
  if (!k) return [];
  if (k.tur === 'sayi') return [`${k.ad}!`];
  if (r.adet && r.adet > 1) return [`${buyukHarfBas(sayiAdi(r.adet))} ${k.ad.toLocaleLowerCase('tr')}!`];
  if (k.tur === 'harf') return [k.ses ?? `${k.ad}!`];
  return k.ses && k.tur === 'resim' ? [`${k.ad}!`, k.ses] : [`${k.ad}!`];
}

function ozet(t: string): number {
  let h = 0;
  for (const c of t) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}
const dizi = (a: string) => [M[a]].flat() as string[];

/** Soruya sabit bir övgü seçer (her soru için tek, bütün hâlinde kaydedilebilsin diye). */
export function ovgu(s: Soru): string {
  const d = dizi('dogru');
  return d[ozet(s.soru_metni + (s.soru_ses ?? '')) % d.length];
}

/** Doğru cevapta söylenen: sadece kısa bir övgü ("Aferin!") — uzatmadan sonraki soruya geçilir. */
export function dogruCumlesi(s: Soru, _g?: KartGirdi): string[] {
  return [ovgu(s)];
}

/** Hafızada eşleşme cümlesi: karta göre sabit bir övgü + kart adı. */
export function eslestiCumlesi(ad: string): string[] {
  const d = dizi('hafiza_eslesti');
  return [d[ozet(ad) % d.length], `${ad}!`];
}

/** Bir kartın adı + sesi (albümde dokununca). */
export function kartSesi(id: string): string[] {
  const k = kart(id);
  if (!k) return [];
  return k.ses ? [`${k.ad}!`, k.ses] : [`${k.ad}!`];
}

const M = metinler as Record<string, string | string[]>;

/** metinler.json'daki değişkenlerin alabileceği tüm değerler. */
const DEGISKENLER: Record<string, (string | number)[]> = {
  yas: [3, 4, 5, 6],
  tema: TEMALAR.map((t) => t.ad),
  kalan: Array.from({ length: 40 }, (_, i) => i + 1),
  yildiz: [1, 2, 3].map(sayiAdi),
};

export function tumCumleler(): string[] {
  const set = new Set<string>();
  const ekle = (t?: string | null) => {
    if (t && normal(t)) set.add(normal(t));
  };

  for (const [anahtar, v] of Object.entries(M)) {
    for (const cumle of Array.isArray(v) ? v : [v]) {
      const degisken = cumle.match(/\{(\w+)\}/)?.[1];
      if (!degisken) ekle(cumle);
      else if (DEGISKENLER[degisken]) {
        for (const d of DEGISKENLER[degisken]) {
          const s = cumle.replaceAll(`{${degisken}}`, String(d));
          ekle(anahtar === 'yildiz' ? buyukHarfBas(s) : s);
        }
      }
    }
  }
  for (const t of TEMALAR) ekle(`${t.ad}.`);
  for (const k of KARTLAR) kartSesi(k.id).forEach(ekle);
  for (const d of tumIcerikDosyalari()) {
    for (const s of d.sorular) {
      ekle(s.soru_ses ?? s.soru_metni);
      ekle(s.ipucu);
      if (s.tip === 'HAFIZA') {
        for (const g of s.kartlar) {
          const r = refCoz(g);
          ekle(r.yazi ? `${r.yazi}!` : `${kart(r.kart ?? '')?.ad ?? ''}!`);
        }
      }
    }
  }
  // Birleşik cümleler: oyun bunları varsa tek parça çalar (doğal tonlama, parçalar arası boşluk yok)
  const birlesik = (p: (string | undefined | null)[]) => {
    const parcalar = p.filter((x): x is string => !!x && !!normal(x));
    if (parcalar.length > 1) ekle(parcalar.join(' '));
  };
  for (const k of KARTLAR) birlesik(kartSesi(k.id));
  for (const t of dizi('tekrar_dene')) birlesik([t, M.ipucu_genel as string]);
  birlesik([M.acilis as string, M.yas_sor as string]);
  for (const t of TEMALAR) birlesik([`${t.ad}.`, M.album_bos as string]);
  for (const t of dizi('tur_sonu'))
    for (const y of [1, 2, 3])
      for (const yeni of [true, false]) birlesik([t, buyukHarfBas((M.yildiz as string).replace('{yildiz}', sayiAdi(y))), yeni ? (M.yeni_kartlar as string) : '']);
  for (const d of tumIcerikDosyalari()) {
    for (const s of d.sorular) {
      if (s.tip === 'HAFIZA') {
        for (const g of s.kartlar) {
          const r = refCoz(g);
          birlesik(eslestiCumlesi(r.yazi ?? kart(r.kart ?? '')?.ad ?? ''));
        }
        for (const t of dizi('hafiza_eslesti')) ekle(t);
      }
    }
  }
  return [...set];
}
