/**
 * Uygulama (mağaza) ayarları: tek yer.
 *
 * RevenueCat PUBLIC SDK anahtarları uygulamanın içine gömülür (gizli değildir, ama repoya elle yazmayın):
 * derleme sırasında ortam değişkeninden gelir: `REVENUECAT_IOS_KEY`, `REVENUECAT_ANDROID_KEY`
 * (GitHub Actions / Codemagic'te tanımlanır; yerelde `.env.uygulama` dosyası da olur, git'e girmez).
 * Anahtar boşsa uygulamada kilitler kapalıdır ve abonelik ekranı "yakında" der (bkz. src/kabuk/ortam.ts).
 */
export const REVENUECAT = {
  iosAnahtar: typeof __REVENUECAT_IOS_KEY__ === 'string' ? __REVENUECAT_IOS_KEY__ : '',
  androidAnahtar: typeof __REVENUECAT_ANDROID_KEY__ === 'string' ? __REVENUECAT_ANDROID_KEY__ : '',
  /** RevenueCat'teki yetki (entitlement) adı */
  yetki: 'premium',
  /** Mağaza ürün kimlikleri (App Store Connect ve Play Console'da aynı adla açılır) */
  urunler: { aylik: 'minkino_aylik', yillik: 'minkino_yillik' },
} as const;

/** Gizlilik politikası ve kullanım şartları (web sitesindeki sayfalar; mağazalara da bu adresler yazılır) */
export const SITE = 'https://minkino-site.barisalidogan.workers.dev';
export const GIZLILIK_ADRESI = `${SITE}/gizlilik/`;
export const SARTLAR_ADRESI = `${SITE}/sartlar/`;

/** Mağazanın abonelik yönetim sayfası (Ebeveyn Köşesi → "Aboneliği yönet") */
export const ABONELIK_YONETIM = {
  ios: 'https://apps.apple.com/account/subscriptions',
  android: 'https://play.google.com/store/account/subscriptions?package=com.minkino.app',
} as const;
