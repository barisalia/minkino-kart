/**
 * RevenueCat ile satın alma (yalnız uygulama derlemesinde, src/abonelik/satin.ts → dinamik import).
 * - Kullanıcı kimliği RevenueCat'in anonim kimliğidir (hesap, ad, e-posta yok).
 * - Yetki: REVENUECAT.yetki ('premium'); ürünler minkino_aylik / minkino_yillik.
 * - Fiyat ve deneme süresi mağazadan gelir (yerel para birimiyle).
 */
import {
  INTRO_ELIGIBILITY_STATUS,
  LOG_LEVEL,
  Purchases,
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type PurchasesPackage,
  type PurchasesStoreProduct,
} from '@revenuecat/purchases-capacitor';
import { premiumAyarla } from '../engine/erisim';
import { REVENUECAT } from '../kabuk/ayar';
import type { Platform } from '../kabuk/ortam';
import { ayaBol, denemeGunu, gosterilecekDeneme, type Plan, type PlanId, type Saglayici } from './satin';

const premiumVar = (c: CustomerInfo) => !!c.entitlements.active[REVENUECAT.yetki];

/**
 * Pakette ücretsiz deneme var mı (iOS: introPrice 0; Android: varsayılan seçeneğin ücretsiz evresi).
 * iOS'ta introPrice ürünün bilgisidir, bu kullanıcının hakkı değil: hak ayrıca sorulur (iosDenemeHakki).
 */
function deneme(u: PurchasesStoreProduct): number | null {
  const bedava = u.defaultOption?.freePhase?.billingPeriod;
  if (bedava) return denemeGunu(bedava.unit, bedava.value);
  if (u.introPrice && u.introPrice.price === 0) return denemeGunu(u.introPrice.periodUnit, u.introPrice.periodNumberOfUnits);
  return null;
}

/** Ürün kimliği eşleşir mi (Android'de "minkino_aylik:taban-plan" biçiminde gelebilir) */
const eslesir = (u: PurchasesStoreProduct, kimlik: string) => u.identifier === kimlik || u.identifier.startsWith(`${kimlik}:`);

/**
 * iOS: bu Apple Kimliği ürünün ücretsiz denemesini hâlâ kullanabilir mi (daha önce denemiş, uygulamayı yeniden
 * kurmuş ya da iptal edip dönen ebeveyn kullanamaz). Yalnız mağaza "uygun" derse true; bilinmiyorsa ya da
 * sorulamadıysa false (RevenueCat'in önerisi: emin değilsen deneme vaat etme).
 */
async function iosDenemeHakki(kimlikler: string[]): Promise<Record<string, boolean>> {
  if (!kimlikler.length) return {};
  try {
    const sonuc = await Purchases.checkTrialOrIntroductoryPriceEligibility({ productIdentifiers: kimlikler });
    return Object.fromEntries(kimlikler.map((k) => [k, sonuc[k]?.status === INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE]));
  } catch {
    return {};
  }
}

export async function revenueCatSaglayici(p: Platform, anahtar: string): Promise<Saglayici> {
  // Hata ayıklama kaydı kapalı (anahtar ya da kimlik loga düşmesin)
  await Purchases.setLogLevel({ level: LOG_LEVEL.WARN }).catch(() => undefined);
  const { isConfigured } = await Purchases.isConfigured().catch(() => ({ isConfigured: false }));
  // çok sayfalı uygulama: her sayfa açılışında yeniden yapılandırma yok (yerel taraf tek örnek)
  if (!isConfigured) await Purchases.configure({ apiKey: anahtar });
  void Purchases.addCustomerInfoUpdateListener((c) => premiumAyarla(premiumVar(c))).catch(() => undefined);

  let paketler: Partial<Record<PlanId, PurchasesPackage>> = {};

  return {
    async planlar(): Promise<Plan[]> {
      const o = await Purchases.getOfferings();
      const teklif = o.current;
      if (!teklif) throw new Error('Teklif yok');
      const bul = (kimlik: string, yedek: PurchasesPackage | null) => teklif.availablePackages.find((p) => eslesir(p.product, kimlik)) ?? yedek ?? undefined;
      paketler = { aylik: bul(REVENUECAT.urunler.aylik, teklif.monthly), yillik: bul(REVENUECAT.urunler.yillik, teklif.annual) };
      const ios = p === 'ios';
      const urunler = (['aylik', 'yillik'] as const).map((id) => paketler[id]?.product).filter((u): u is PurchasesStoreProduct => !!u);
      // iOS'ta deneme hakkı kullanıcıya göre: yalnız denemesi olan ürünler için mağazaya sorulur
      const hak = ios ? await iosDenemeHakki(urunler.filter((u) => deneme(u)).map((u) => u.identifier)) : {};
      const sonuc: Plan[] = [];
      for (const id of ['aylik', 'yillik'] as const) {
        const u = paketler[id]?.product;
        if (!u) continue;
        sonuc.push({
          id,
          fiyat: u.priceString,
          ayBasi: id === 'yillik' ? (u.pricePerMonthString ?? ayaBol(u.price, u.currencyCode)) : null,
          denemeGun: gosterilecekDeneme(deneme(u), ios, hak[u.identifier]),
        });
      }
      if (!sonuc.length) throw new Error('Paket yok');
      return sonuc;
    },
    async satinAl(id: PlanId) {
      const paket = paketler[id];
      if (!paket) return 'hata';
      try {
        const { customerInfo } = await Purchases.purchasePackage({ aPackage: paket });
        const var_ = premiumVar(customerInfo);
        premiumAyarla(var_);
        return var_ ? 'tamam' : 'hata';
      } catch (e) {
        const h = e as { code?: string; userCancelled?: boolean | null };
        if (h.userCancelled || h.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) return 'iptal';
        return 'hata';
      }
    },
    async geriYukle() {
      const { customerInfo } = await Purchases.restorePurchases();
      const var_ = premiumVar(customerInfo);
      premiumAyarla(var_);
      return var_;
    },
    async durumSor() {
      const { customerInfo } = await Purchases.getCustomerInfo();
      return premiumVar(customerInfo);
    },
  };
}
