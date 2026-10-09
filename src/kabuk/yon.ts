/**
 * Uygulama kabuğuna istekler (olayla; web sitesinde dinleyen yoktur, hiçbir şey olmaz):
 * - Ekran yönü: telefonda geniş sahneli oyunlar yatay kilitli, öbür sayfalar cihazı izler; tablet her yerde serbest,
 *   yalnız film oynarken yatay (src/kabuk/yerel.ts → src/kabuk/yon-yonetici.ts → @capacitor/screen-orientation).
 * - Arka plan: uygulama arka plana geçince / geri gelince duyurulur (oyunlar isterse duraklar).
 */
export const YON_OLAYI = 'minkino:yon';
/** Başka sayfaya geçmeden önce: gidilecek sayfanın yönü ayarlanır (krem perde inerken; yatay oyun dikey açılmasın) */
export const SAYFA_YON_OLAYI = 'minkino:sayfa-yon';
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

/** Açık katmanlar (oyunun kendi açılır pencereleri, yakın bakış …): geri tuşu önce en üsttekini kapatır. */
const katmanlar: { el: Element; kapat: () => void }[] = [];
let katmanDinleniyor = false;

/**
 * Oyunun açtığı pencereyi geri tuşuna bağlar: açıkken Android geri tuşu oyundan çıkmaz, önce bu pencere kapanır
 * (`kapat` çağrılır). Pencere başka yoldan kapanınca dönen fonksiyon çağrılır; çağrılmasa da sayfadan kalkmış
 * (`el` bağlı değil) pencere atlanır. Bırakma fonksiyonu döner.
 */
export function katmanAc(el: Element, kapat: () => void): () => void {
  if (!katmanDinleniyor) {
    katmanDinleniyor = true;
    geriDinle(() => {
      while (katmanlar.length) {
        const k = katmanlar.pop()!;
        if (!k.el.isConnected) continue;
        k.kapat();
        return true;
      }
      return false;
    });
  }
  const k = { el, kapat };
  katmanlar.push(k);
  return () => {
    const i = katmanlar.indexOf(k);
    if (i >= 0) katmanlar.splice(i, 1);
  };
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

/** Telefon mu: kısa kenar 600 dp'den küçük (yön fark etmez). Tablet her yerde serbest döner. */
export const TELEFON_KISA_KENAR = 600;
export function telefonMu(en: number, boy: number): boolean {
  return Math.min(en, boy) < TELEFON_KISA_KENAR;
}

/**
 * Telefonda yatay kilitli sayfalar: geniş, sahneli oyunlar (Pasta Otobüsü, Mino'nun Pazarı, Sesli Maceralar,
 * Dedektif Mino, Çizgi Filmler, Kino Ne Giysin?, Kino'nun Otobüsü). Öbürleri (menü, Kartlar, Çiz Canlansın) iki
 * yönde de güzel durur: cihazı izler.
 */
export const YATAY_SAYFALAR: readonly string[] = ['pasta', 'pazar', 'macera', 'dedektif', 'film', 'giysin', 'kino-otobus'];

/** Sayfanın telefondaki yönü (adres yolundan: /pasta/index.html → yatay, / ve /kartlar/ → serbest) */
export function sayfaYonu(yol: string): Yon {
  const klasor = yol.replace(/^\/+/, '').split('/')[0];
  return YATAY_SAYFALAR.includes(klasor) ? 'yatay' : 'serbest';
}

/**
 * Yön kararı (saf, test edilir). Telefonda sayfa karar verir (yatay oyun kilitli, öbürü serbest; sayfa içi istek
 * — film oynatıcısı — yok sayılır). Tablette sayfa serbest; yalnız sayfa içi istek (film oynarken) yatay kilitler.
 */
export function yonKarari(d: { telefon: boolean; sayfa: Yon; istek?: Yon }): 'kilitle' | 'birak' {
  if (d.telefon) return d.sayfa === 'yatay' ? 'kilitle' : 'birak';
  return d.istek === 'yatay' ? 'kilitle' : 'birak';
}

/** Sayfa içi yön isteği (film oynatıcısı: açılınca yatay, kapanınca serbest) */
export function yonIste(yon: Yon) {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent<Yon>(YON_OLAYI, { detail: yon }));
}

export interface SayfaYonIstegi {
  /** gidilecek sayfanın adres yolu */
  yol: string;
  /** kabuk buraya bekleme sözü ekler (ekran dönene kadar; en çok ~1 sn) */
  bekle: Promise<unknown>[];
}

/**
 * Başka sayfaya geçmeden önce (src/ui/gecis.ts → sayfadanCik): uygulamada gidilecek sayfanın yönü ayarlanır, gerekirse
 * ekranın dönmesi beklenir. Web sitesinde dinleyen yok: hemen biter.
 */
export function sayfaYonunuHazirla(hedef: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  let yol: string;
  try {
    yol = new URL(hedef, location.href).pathname;
  } catch {
    return Promise.resolve();
  }
  const istek: SayfaYonIstegi = { yol, bekle: [] };
  window.dispatchEvent(new CustomEvent<SayfaYonIstegi>(SAYFA_YON_OLAYI, { detail: istek }));
  return istek.bekle.length ? Promise.all(istek.bekle).then(() => undefined, () => undefined) : Promise.resolve();
}

/** Arka plan değişince çağrılır (arkada: true = uygulama arka planda); bırakma fonksiyonu döner */
export function arkaPlanDinle(fn: (arkada: boolean) => void): () => void {
  const d = (e: Event) => fn((e as CustomEvent<{ arkada: boolean }>).detail.arkada);
  window.addEventListener(ARKA_PLAN_OLAYI, d);
  return () => window.removeEventListener(ARKA_PLAN_OLAYI, d);
}
