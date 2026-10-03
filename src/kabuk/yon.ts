/**
 * Uygulama kabuğuna istekler (olayla; web sitesinde dinleyen yoktur, hiçbir şey olmaz):
 * - Ekran yönü: film açılınca yatay kilit, çıkınca serbest (src/kabuk/yerel.ts → @capacitor/screen-orientation).
 * - Arka plan: uygulama arka plana geçince / geri gelince duyurulur (oyunlar isterse duraklar).
 */
export const YON_OLAYI = 'minkino:yon';
export const ARKA_PLAN_OLAYI = 'minkino:arkaplan';
/** Android geri tuşu (src/kabuk/yerel.ts duyurur; sayfa kendisi işlerse olayı iptal eder) */
export const GERI_OLAYI = 'minkino:geri';

/** Ana menü sayfası (sitenin / uygulamanın kökü) mı: oyun sayfaları bir klasör içinde (/pasta/, /kartlar/ …) */
export function menuSayfasiMi(yol: string): boolean {
  return /^\/(index\.html)?$/.test(yol);
}

/**
 * Android geri tuşuna sayfanın kendi cevabı: `fn` true dönerse tuş işlendi (ör. ebeveyn köşesinden menüye dönüldü).
 * İşlenmezse kabuk karar verir: ana menüde uygulamadan çıkılır, oyunda ana menüye dönülür. Bırakma fonksiyonu döner.
 */
export function geriDinle(fn: () => boolean): () => void {
  const d = (e: Event) => {
    if (fn()) e.preventDefault();
  };
  window.addEventListener(GERI_OLAYI, d);
  return () => window.removeEventListener(GERI_OLAYI, d);
}

/**
 * Geri tuşu kararı (saf, test edilir): açık pencere varsa kapanır, sayfa işlediyse bir şey yapılmaz,
 * ana menüdeyse çıkılır, oyundaysa ana menüye dönülür.
 */
export function geriKarari(d: { pencereAcik: boolean; sayfaIsledi: boolean; menude: boolean }): 'pencere' | 'yok' | 'cik' | 'menu' {
  if (d.pencereAcik) return 'pencere';
  if (d.sayfaIsledi) return 'yok';
  return d.menude ? 'cik' : 'menu';
}

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
