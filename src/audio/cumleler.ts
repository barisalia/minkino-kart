/**
 * Oyunun söyleyebileceği tüm cümleler. Seslendirme betiği (scripts/seslendir.ts) bu listeyi kullanır;
 * oyun da cümleleri aynı parçalara bölerek söyler, böylece her parça için bir kayıt dosyası olur.
 */
import metinler from '../../content/metinler.json';
import { kart, KARTLAR, refCoz, TEMALAR, tumIcerikDosyalari } from '../engine/katalog';
import { dogruIndeks } from '../engine/soru';
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
      } else aciklamaParcalari(s, s.kartlar[dogruIndeks(s)]).forEach(ekle);
    }
  }
  return [...set];
}
