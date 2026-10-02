/**
 * Uygulama ortamı: web sitesi mi, mağaza uygulaması (Capacitor) mı?
 *
 * - `npm run build`      → web sitesi (bugünkü gibi; kilit yok, abonelik yok).
 * - `npm run build:app`  → uygulama derlemesi (`vite build --mode uygulama`): Capacitor kabuğu, abonelik, kilitler.
 *
 * Test için (yalnız `?test=1`): `&uygulama=ios|android` web derlemesinde uygulama modunu taklit eder; satın alma sahte
 * sağlayıcıyla yapılır (gerçek SDK çağrısı yok). `&anahtar=yok`: anahtarsız uygulama ("yakında" ekranı).
 */
import { TEST_MODU } from '../ui/dom';
import { REVENUECAT } from './ayar';

export type Platform = 'ios' | 'android';

/** Uygulama (Capacitor) derlemesi: derleme anında sabit; web derlemesinde bu dalların kodu pakete girmez */
export const UYGULAMA_DERLEMESI = import.meta.env.MODE === 'uygulama';

const q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();
const sahte = q.get('uygulama');
/** Test: web derlemesinde uygulama modu taklidi (yalnız ?test=1 ile) */
export const SAHTE_UYGULAMA: Platform | null = TEST_MODU && (sahte === 'ios' || sahte === 'android') ? sahte : null;

type CapGlobal = { isNativePlatform?: () => boolean; getPlatform?: () => string };

/** Capacitor'ın yerel köprüsü sayfaya `window.Capacitor` koyar (import gerekmez) */
export function yerelPlatform(): Platform | null {
  const c = (globalThis as { Capacitor?: CapGlobal }).Capacitor;
  if (!c?.isNativePlatform?.()) return null;
  const p = c.getPlatform?.();
  return p === 'ios' || p === 'android' ? p : null;
}

/** Uygulama içinde miyiz (gerçek ya da test taklidi); web sitesinde null */
export function uygulamaPlatformu(): Platform | null {
  if (SAHTE_UYGULAMA) return SAHTE_UYGULAMA;
  return UYGULAMA_DERLEMESI ? yerelPlatform() : null;
}

/** Bu platformun RevenueCat public SDK anahtarı (yoksa boş) */
export function satinAlmaAnahtari(p: Platform | null = uygulamaPlatformu()): string {
  if (!p) return '';
  if (SAHTE_UYGULAMA) return q.get('anahtar') === 'yok' ? '' : 'sahte';
  return (p === 'ios' ? REVENUECAT.iosAnahtar : REVENUECAT.androidAnahtar).trim();
}

/**
 * Kilitler açık mı: yalnız uygulamada VE satın alma anahtarı varken. Web sitesinde ya da anahtar yokken her şey açık
 * (site bugünkü gibi çalışır; anahtarsız uygulama da çökmez).
 */
export const kilitlerEtkin = (): boolean => !!uygulamaPlatformu() && !!satinAlmaAnahtari();
