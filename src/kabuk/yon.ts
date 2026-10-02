/**
 * Uygulama kabuğuna istekler (olayla; web sitesinde dinleyen yoktur, hiçbir şey olmaz):
 * - Ekran yönü: film açılınca yatay kilit, çıkınca serbest (src/kabuk/yerel.ts → @capacitor/screen-orientation).
 * - Arka plan: uygulama arka plana geçince / geri gelince duyurulur (oyunlar isterse duraklar).
 */
export const YON_OLAYI = 'minkino:yon';
export const ARKA_PLAN_OLAYI = 'minkino:arkaplan';

export type Yon = 'yatay' | 'serbest';

export function yonIste(yon: Yon) {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent<Yon>(YON_OLAYI, { detail: yon }));
}

/** Arka plan değişince çağrılır (arkada: true = uygulama arka planda); bırakma fonksiyonu döner */
export function arkaPlanDinle(fn: (arkada: boolean) => void): () => void {
  const d = (e: Event) => fn((e as CustomEvent<{ arkada: boolean }>).detail.arkada);
  window.addEventListener(ARKA_PLAN_OLAYI, d);
  return () => window.removeEventListener(ARKA_PLAN_OLAYI, d);
}
