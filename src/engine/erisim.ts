/**
 * Erişim: hangi oyun / bölüm ücretsiz, hangisi abonelikle (Minkino Premium).
 *
 * TEK TABLO: aşağıdaki `ERISIM`. Değiştirmek için yalnız burayı düzenleyin.
 * - Anahtar: oyun kimliği (ana menü kartının `id`'si: 'kartlar', 'pazar' …) ya da bölümlü oyunlarda
 *   'oyun/bolum' ('macera/elektrik', 'film/mino-karpuz').
 * - 'oyun/*': o oyunun tabloda adı geçmeyen (yeni eklenen dahil) bütün bölümleri.
 * - Tabloda hiç geçmeyen içerik aboneliklidir ("gerisi abonelikle").
 *
 * Kilitler yalnız mağaza uygulamasında ve satın alma anahtarı varken çalışır (src/kabuk/ortam.ts → kilitlerEtkin).
 * Web sitesinde her şey açıktır.
 */
import { kilitlerEtkin } from '../kabuk/ortam';

export type Erisim = 'ucretsiz' | 'abonelik';

export const ERISIM: Record<string, Erisim> = {
  // Kartlar: bütünüyle ücretsiz
  kartlar: 'ucretsiz',
  // Çizgi Filmler: yalnız "Mino'nun Karpuzu" ücretsiz
  'film/mino-karpuz': 'ucretsiz',
  'film/*': 'abonelik',
  // Sesli Maceralar: yalnız "Elektrikler Kesildi!" ücretsiz
  'macera/elektrik': 'ucretsiz',
  'macera/*': 'abonelik',
  // Okula Hazırım: Sayı Bahçesi'nin ilk 3 etkinliği ücretsiz
  'okul/kac-elma': 'ucretsiz',
  'okul/sayi-karti': 'ucretsiz',
  'okul/sepete-koy': 'ucretsiz',
  // Okula Hazırım · Ses Kulesi: A odası ücretsiz (gerisi okul/* ile abonelik)
  'okul/ses-a': 'ucretsiz',
  // Kelime Köprüsü'nün ilk etkinliği ücretsiz
  'okul/kelime-dinle': 'ucretsiz',
  'okul/*': 'abonelik',
  // Bütünüyle abonelikle
  pazar: 'abonelik',
  canlan: 'abonelik',
  pasta: 'abonelik',
  dedektif: 'abonelik',
  // Kino Ne Giysin?: ilk mevsim (Kış · Kardan adam) ücretsiz, diğer mevsimler abonelikle
  'giysin/kis': 'ucretsiz',
  'giysin/*': 'abonelik',
};

/** Tablodan bir içeriğin erişim türü (oyun ya da 'oyun/bolum') */
export function erisimTuru(id: string, tablo: Record<string, Erisim> = ERISIM): Erisim {
  if (tablo[id]) return tablo[id];
  const i = id.indexOf('/');
  if (i > 0) {
    const oyun = id.slice(0, i);
    return tablo[`${oyun}/*`] ?? tablo[oyun] ?? 'abonelik';
  }
  // bölümlü oyun (tabloda yalnız bölümleri var): bir bölümü bile ücretsizse oyun açılır, kilit bölümlerde
  if (Object.entries(tablo).some(([k, v]) => k.startsWith(`${id}/`) && v === 'ucretsiz')) return 'ucretsiz';
  return 'abonelik';
}

/** Kilit kararı (saf): kilitler etkin değilse ya da abonelik varsa her şey açık */
export function kilitliMi(id: string, d: { etkin: boolean; premium: boolean }, tablo: Record<string, Erisim> = ERISIM): boolean {
  if (!d.etkin || d.premium) return false;
  return erisimTuru(id, tablo) === 'abonelik';
}

// ---------------------------------------------------------------- abonelik durumu (son bilinen)

/** Son bilinen abonelik durumu: localStorage'da (uygulamada @capacitor/preferences'a da yansır; çevrimdışında bu kullanılır) */
export const ABONELIK_ANAHTARI = 'minkino-abonelik-v1';
export const ERISIM_OLAYI = 'minkino:erisim';

interface Kayit {
  premium: boolean;
  /** son doğrulama (ms) */
  zaman: number;
}

function oku(): Kayit {
  try {
    const o = JSON.parse(localStorage.getItem(ABONELIK_ANAHTARI) ?? 'null') as Partial<Kayit> | null;
    return { premium: o?.premium === true, zaman: Number(o?.zaman) || 0 };
  } catch {
    return { premium: false, zaman: 0 };
  }
}

let premium = oku().premium;

// ---------------------------------------------------------------- mağaza inceleme kilidi

/**
 * Mağaza inceleme ekibi (Google Play / App Store) satın alamaz, deneme başlatamaz: Ebeveyn Köşesi → "İnceleme kodu"
 * ile bu cihazda bütün içerik açılır (kod denetimi: src/abonelik/inceleme.ts). Mağazanın abonelik durumundan
 * bağımsızdır: RevenueCat "premium yok" dese de açık kalır.
 */
export const INCELEME_ANAHTARI = 'minkino-inceleme';

function incelemeOku(): boolean {
  try {
    return localStorage.getItem(INCELEME_ANAHTARI) === '1';
  } catch {
    return false;
  }
}

let inceleme = incelemeOku();

/** İnceleme kilidi bu cihazda açık mı */
export const incelemeAcikMi = () => inceleme;

/** İnceleme kilidini açar: kaydedilir ve sayfaya duyurulur (kilit rozetleri kalkar) */
export function incelemeAc() {
  const degisti = !inceleme;
  inceleme = true;
  try {
    localStorage.setItem(INCELEME_ANAHTARI, '1');
  } catch {
    /* gizli sekme: bu sayfa boyunca açık */
  }
  if (degisti && typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(ERISIM_OLAYI, { detail: { premium: true } }));
}

/** Premium erişim var mı: mağazadaki abonelik ya da inceleme kilidi */
export const premiumMu = () => premium || inceleme;

/** Mağazadan gelen yeni durum: kaydedilir, değiştiyse sayfaya duyurulur (kilit rozetleri yenilenir) */
export function premiumAyarla(v: boolean) {
  const degisti = v !== premium;
  premium = v;
  try {
    localStorage.setItem(ABONELIK_ANAHTARI, JSON.stringify({ premium: v, zaman: Date.now() } satisfies Kayit));
  } catch {
    /* gizli sekme */
  }
  if (degisti && typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(ERISIM_OLAYI, { detail: { premium: v } }));
}

/** Erişim değişince (satın alma, geri yükleme, mağazadan gelen durum) çağrılır; bırakma fonksiyonu döner */
export function erisimDinle(fn: () => void): () => void {
  window.addEventListener(ERISIM_OLAYI, fn);
  return () => window.removeEventListener(ERISIM_OLAYI, fn);
}

/** Bu içerik şu an kilitli mi (uygulamada, abonelik ya da inceleme kilidi yokken, tablo "abonelik" diyorsa) */
export const kilitli = (id: string): boolean => kilitliMi(id, { etkin: kilitlerEtkin(), premium: premiumMu() });
