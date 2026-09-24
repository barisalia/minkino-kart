import kartlarJson from '../../content/kartlar.json';
import temalarJson from '../../content/temalar.json';
import type { IcerikDosyasi, Kart, KartGirdi, KartRef, Soru, Tema, Yas } from './types';

export const KARTLAR: Kart[] = (kartlarJson as { kartlar: Kart[] }).kartlar;
export const TEMALAR: Tema[] = (temalarJson as { temalar: Tema[] }).temalar;

const kartMap = new Map(KARTLAR.map((k) => [k.id, k]));

const dosyalar = import.meta.glob<IcerikDosyasi>('../../content/sorular/*/*.json', {
  eager: true,
  import: 'default',
});

/** yaş-tema → sorular */
const havuz = new Map<string, Soru[]>();
for (const d of Object.values(dosyalar)) havuz.set(`${d.yas}-${d.tema}`, d.sorular);

export function tumIcerikDosyalari(): IcerikDosyasi[] {
  return Object.values(dosyalar);
}

export function kart(id: string): Kart | undefined {
  return kartMap.get(id);
}

export function temaBul(id: string): Tema | undefined {
  return TEMALAR.find((t) => t.id === id);
}

export function sorular(yas: Yas, tema: string): Soru[] {
  return havuz.get(`${yas}-${tema}`) ?? [];
}

/** Albümde yer alan kartlar (tema sırasına göre). */
export function albumKartlari(tema: string): Kart[] {
  return KARTLAR.filter((k) => k.tema === tema && k.album !== false);
}

export function refCoz(g: KartGirdi): KartRef {
  return typeof g === 'string' ? { kart: g } : g;
}
