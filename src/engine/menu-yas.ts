import { durum, kaydetDurum } from './ilerleme';
import { YASLAR, type Yas } from './types';

export const MENU_YASLARI = [2, ...YASLAR] as const;
export type MenuYasi = 2 | Yas;

const ANAHTAR = 'minkino-menu-yas';
// Önceki menü yalnız bu etiketleri saklıyordu. Mevcut içeriğe en yakın desteklenen yaşa taşınır.
const ESKI_YASLAR: Record<string, Yas> = { '2–3 yaş': 3, '4–5 yaş': 4, '6–7 yaş': 6 };

/** Oyun içinde değiştirilen ortak yaş, menüye dönüldüğünde de geçerlidir. */
export function menuYasiOku(): MenuYasi | null {
  if (durum.i.ikiYas && durum.i.yas === 3) return 2;
  if (YASLAR.includes(durum.i.yas as Yas)) return durum.i.yas;
  try {
    const eski = globalThis.localStorage?.getItem(ANAHTAR);
    return eski ? ESKI_YASLAR[eski] ?? null : null;
  } catch {
    return null;
  }
}

/** Yalnız yaş alanını değiştirir; albüm, yıldızlar ve oyun ilerlemesi korunur. */
export function menuYasiniSec(yas: MenuYasi): void {
  if (!MENU_YASLARI.includes(yas)) return;
  if (yas === 2) durum.i.ikiYas = true;
  else delete durum.i.ikiYas;
  durum.i.yas = yas === 2 ? 3 : yas;
  kaydetDurum();
  try {
    globalThis.localStorage?.removeItem(ANAHTAR);
  } catch {
    // Depolama kapalıysa seçim mevcut oturumda kullanılmaya devam eder.
  }
}

/** Dondurma oyununun mevcut 3–4 / 5–6 yaş modları. */
export function menuYasModu(): 'kucuk' | 'buyuk' | null {
  const yas = menuYasiOku();
  return yas === null ? null : yas <= 4 ? 'kucuk' : 'buyuk';
}
