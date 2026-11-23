// "Zıpzıp'ın Dizi" boyunca sahneden sahneye taşınan seçimler: çocuğun seçtiği bant ve yıldız hastanın üstünde kalır.
// Saf veri: DOM yok.
export type Yas = '2-3' | '4' | '5+';
export type BantDeseni = 'yildiz' | 'kalp' | 'gokkusagi' | 'pati';
export type YildizRengi = 'sari' | 'nane' | 'mavi';
export const BANT_DESENLERI: readonly BantDeseni[] = ['yildiz', 'kalp', 'gokkusagi', 'pati'];
export const YILDIZ_RENKLERI: readonly YildizRengi[] = ['sari', 'nane', 'mavi'];

export const oyun: { bant: BantDeseni | null; yildiz: YildizRengi | null; kuzuYildizi: YildizRengi | null } = { bant: null, yildiz: null, kuzuYildizi: null };
export function oyunuSifirla() { oyun.bant = null; oyun.yildiz = null; oyun.kuzuYildizi = null; }

/** Adımın yaş kısıtı: verilmişse yalnız o yaşlarda oynanır. */
export interface Yasli { yas?: readonly Yas[] }
export const yasaGore = <A extends Yasli>(adimlar: readonly A[], yas: Yas): A[] => adimlar.filter(a => !a.yas || a.yas.includes(yas));

/** Tedaviden sonraki pozlarda bant işaretinin ve yıldızın yeri (çizim pikseli, Zıpzıp tuvalinde 1300 × 1500).
 *  Çizimler gelince her poz için %100 boyda ölçülüp doldurulur; ölçülmeyen poz varsayılanı kullanır. */
export interface Bindirme { bant: [number, number]; yildiz: [number, number] }
export const BINDIRME_VARSAYILAN: Bindirme = { bant: [735, 1130], yildiz: [650, 800] };
export const BINDIRME: Record<string, Partial<Bindirme>> = {};
export const bindirme = (poz: string): Bindirme => ({ ...BINDIRME_VARSAYILAN, ...(BINDIRME[poz] ?? {}) });
