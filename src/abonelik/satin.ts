/**
 * Satın alma sağlayıcısı: abonelik ekranı yalnız bu arayüzü bilir.
 * - Uygulamada: RevenueCat (src/abonelik/revenuecat.ts; yalnız uygulama derlemesinde pakete girer).
 * - Test (?test=1&uygulama=…): sahte sağlayıcı (src/abonelik/sahte.ts), gerçek SDK çağrısı yok.
 * - Web sitesinde ya da anahtar yokken: null → abonelik ekranı "yakında" der.
 *
 * Fiyatlar uygulamaya yazılmaz: mağazanın yerel fiyatı (priceString) RevenueCat paketinden gelir.
 */
import { premiumAyarla } from '../engine/erisim';
import { SAHTE_UYGULAMA, satinAlmaAnahtari, UYGULAMA_DERLEMESI, uygulamaPlatformu, type Platform } from '../kabuk/ortam';

export type PlanId = 'aylik' | 'yillik';

export interface Plan {
  id: PlanId;
  /** Mağazanın yerel fiyatı: "₺99,99" */
  fiyat: string;
  /** Yıllık planda aylığa düşen (mağazadan; yoksa hesaplanır) */
  ayBasi: string | null;
  /** Ücretsiz deneme süresi (gün); yoksa null */
  denemeGun: number | null;
}

export type SatinSonuc = 'tamam' | 'iptal' | 'hata';

export interface Saglayici {
  /** Mağazadaki planlar (yüklenemezse hata atar) */
  planlar(): Promise<Plan[]>;
  satinAl(id: PlanId): Promise<SatinSonuc>;
  /** Geri yükleme sonrası abonelik var mı */
  geriYukle(): Promise<boolean>;
  /** Mağazadan güncel durumu sorar (çevrimdışıysa hata atar; son bilinen durum geçerli kalır) */
  durumSor(): Promise<boolean>;
}

let hazir: Promise<Saglayici | null> | null = null;

async function kur(p: Platform, anahtar: string): Promise<Saglayici | null> {
  if (SAHTE_UYGULAMA) return (await import('./sahte')).sahteSaglayici();
  if (UYGULAMA_DERLEMESI) return (await import('./revenuecat')).revenueCatSaglayici(p, anahtar);
  return null;
}

/** Sağlayıcı (bir kez kurulur); web'de ya da anahtar yokken null */
export function saglayici(): Promise<Saglayici | null> {
  if (hazir) return hazir;
  const p = uygulamaPlatformu();
  const anahtar = satinAlmaAnahtari(p);
  hazir = p && anahtar ? kur(p, anahtar).catch((e) => (console.warn('Satın alma kurulamadı', e), null)) : Promise.resolve(null);
  return hazir;
}

/**
 * Sayfa açılınca: mağazadan güncel abonelik durumunu sorar ve kaydeder (kilit rozetleri buna göre yenilenir).
 * Çevrimdışıysa son bilinen durum kalır.
 */
export async function durumuTazele(): Promise<void> {
  const s = await saglayici();
  if (!s) return;
  try {
    premiumAyarla(await s.durumSor());
  } catch {
    /* çevrimdışı: son bilinen durum geçerli */
  }
}

/** Gün sayısı → "7 gün", "1 hafta" gibi değil: her zaman gün ("7 gün ücretsiz dene") */
export function denemeGunu(birim: string | undefined, sayi: number | undefined): number | null {
  if (!birim || !sayi || sayi <= 0) return null;
  const u = birim.toUpperCase();
  if (u.startsWith('DAY') || u === 'D') return sayi;
  if (u.startsWith('WEEK') || u === 'W') return sayi * 7;
  if (u.startsWith('MONTH') || u === 'M') return sayi * 30;
  if (u.startsWith('YEAR') || u === 'Y') return sayi * 365;
  return null;
}

/** Yıllık fiyatın aylığı (mağaza vermezse): para birimiyle biçimlenir */
export function ayaBol(fiyat: number, paraBirimi: string): string | null {
  if (!(fiyat > 0) || !paraBirimi) return null;
  try {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: paraBirimi, maximumFractionDigits: 2 }).format(Math.floor((fiyat / 12) * 100) / 100);
  } catch {
    return null;
  }
}
