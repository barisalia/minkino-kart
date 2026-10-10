/**
 * Kino ve Ailesi (Seri 2) bölümlerinin uygulamadaki listesi: Çizgi Filmler'e (film/src/katalog.ts) yeni bir dizi olarak
 * eklenmeye hazır. Menüde DEĞİL: SERI2_MENUDE = false (Barış onaylayınca true; katalog ekranı bu listeyi okur).
 * Erişim anahtarı film/seri2-<bolum> (src/engine/erisim.ts: Bölüm 1 ücretsiz önerisi, gerisi 'film/*' abonelik).
 */
import { tahminiSure, zamanla, type Bolum } from './bicim';

export const SERI2_MENUDE = false;

const BOLUMLER: Record<string, Bolum> = import.meta.glob('../../../content/film2/bolum-*.json', { eager: true, import: 'default' });
const KAPAKLAR: Record<string, string> = import.meta.glob<string>('../../../assets/film-seri2/kapak/*.webp', { eager: true, query: '?url', import: 'default' });

export interface Seri2Bolum {
  /** bölüm dosyası: bolum-01 */
  ad: string;
  /** erişim kimliği (src/engine/erisim.ts) */
  erisim: string;
  numara: number;
  baslik: string;
  /** dakika (açılış ve jenerik dahil; ses gelmeden metnin hece ritmiyle tahmin) */
  dakika: number;
  kapak: string;
}

export const seri2Bolum = (ad: string): Bolum | undefined => BOLUMLER[`../../../content/film2/${ad}.json`];

export function seri2Katalog(): Seri2Bolum[] {
  return Object.values(BOLUMLER)
    .sort((a, b) => a.numara - b.numara)
    .map((b) => {
      const sn = 30 + b.sahneler.reduce((t, s) => t + zamanla(s, tahminiSure).sure, 0);
      return { ad: b.kimlik, erisim: `film/seri2-${b.kimlik}`, numara: b.numara, baslik: b.baslik, dakika: Math.max(1, Math.round(sn / 60)), kapak: KAPAKLAR[`../../../assets/film-seri2/kapak/${b.kimlik}.webp`] ?? '' };
    });
}
