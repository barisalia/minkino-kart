// Ana menünün bölümleri ve her bölüme düşen kartlar (yatay-menu.ts kullanır; saf mantık, birim testi:
// tests/unit/menu-bolumleri.test.ts).
//
// Sürüm 6 (ekip/uygulama/SURUM-6-PLAN.md, 7a): beşinci bölüm "Dersler" = Türkçe (alfabe), Matematik, İngilizce
// (INGILIZCE_MENUDE açıksa), Deney (DENEY_MENUDE açıksa). Ana ekranda ilk sırada. Etkinlikler'de Okula Hazırlanalım,
// Çiz Canlansın, Bil Bakalım, Sesli Maceralar kalır. Barış görüp onaylamadan menü değişmez: DERSLER_MENUDE = false.
// Bayrak kapalıyken bugünkü dört bölümlü düzen birebir aynı kalır.
import type { OyunKarti } from './oyunlar';
import { DENEY_KARTI, DENEY_MENUDE } from '../../deney/src/bayrak';
import { DOKTOR_KARTI, DOKTOR_MENUDE } from '../../doktor/src/bayrak';

/** Dersler bölümü menüde (Barış onaylayınca true). Simgesi (assets/uygulama/kategoriler/ders-ikon.webp) yoksa yine kapalı. */
export const DERSLER_MENUDE = false;

export type BolumId = 'ders' | 'etkinlik' | 'kitap' | 'oyun' | 'film';

/** Dersler'in kartları, bu sırayla */
export const DERS_KARTLARI = ['alfabe', 'matematik', 'ingilizce', 'deney'];
/** Dersler açıkken Etkinlikler'de kalanlar */
export const ETKINLIK_KARTLARI = ['hazirlik', 'canlan', 'kartlar', 'macera'];
/** Bugünkü (dört bölümlü) düzende Etkinlikler */
/** (22 Kasım 2026: İngilizce menüye girdi; Dersler bölümü kapalıyken Türkçe ve Matematik'in yanında, Etkinlikler'de durur) */
/** (Deney: yalnız DENEY_MENUDE açıkken var; Dersler kapalıyken öbür derslerle birlikte burada) */
export const ESKI_ETKINLIK_KARTLARI = ['matematik', 'alfabe', 'ingilizce', 'deney', 'hazirlik', 'canlan', 'kartlar', 'macera'];

/**
 * "Deneyler" kartı (deney/src/bayrak.ts; Deney oturumu, 22 Kasım; eski adı "Deney Atölyesi", Barış: "Atölye" adı kalktı). Kapak
 * assets/uygulama/oyun-kapaklari/deney.webp (Astra Paket D S1) gelince menü onu kendiliğinden kullanır.
 */
export const DENEY_OYUN_KARTI: OyunKarti = { id: DENEY_KARTI.id, ad: 'Deneyler', adres: './deney/', renk: '#8fd3c8', katmanlar: [] };

/** Menü kartlarına Deney'i ekler (yalnız DENEY_MENUDE açıkken; Türkçe / İngilizce'nin ardına). */
export function deneyliKartlar(kartlar: readonly OyunKarti[], acik: boolean = DENEY_MENUDE): OyunKarti[] {
  if (!acik || kartlar.some((k) => k.id === DENEY_OYUN_KARTI.id)) return [...kartlar];
  const once = Math.max(kartlar.findIndex((k) => k.id === 'ingilizce'), kartlar.findIndex((k) => k.id === 'alfabe'));
  const l = [...kartlar];
  l.splice(once + 1, 0, DENEY_OYUN_KARTI);
  return l;
}

/**
 * "Minik Doktor" kartı (doktor/src/bayrak.ts; Barış 23 Kasım 2026: menüde, tamamen premium). Oyunlar bölümünde durur
 * (ders ya da etkinlik değil). Kapak assets/uygulama/oyun-kapaklari/doktor.webp gelince menü onu kendiliğinden kullanır.
 */
export const DOKTOR_OYUN_KARTI: OyunKarti = { id: DOKTOR_KARTI.id, ad: 'Minik Doktor', adres: './doktor/', renk: '#f7b9c8', rozet: 'Yeni', katmanlar: [] };

/** Menü kartlarına Minik Doktor'u ekler (yalnız DOKTOR_MENUDE açıkken; Minik Şef'in ardına, o yoksa sona). */
export function doktorluKartlar(kartlar: readonly OyunKarti[], acik: boolean = DOKTOR_MENUDE): OyunKarti[] {
  if (!acik || kartlar.some((k) => k.id === DOKTOR_OYUN_KARTI.id)) return [...kartlar];
  const sef = kartlar.findIndex((k) => k.id === 'sef');
  const l = [...kartlar];
  l.splice(sef < 0 ? l.length : sef + 1, 0, DOKTOR_OYUN_KARTI);
  return l;
}

/**
 * Dersler bölümü görünür mü. Gerçek uygulamada: bayrak açık VE simge var (simge yoksa eski dört bölüm).
 * Test kipinde (?test=1) `?dersler=1` bayrağı açar, `?dersler=0` kapatır; simge yoksa yer tutucu kullanılır.
 */
export function dersBolumuAcik(o: { bayrak: boolean; simgeVar: boolean; testModu: boolean; istek: string | null }): boolean {
  const acik = o.testModu && o.istek !== null ? o.istek === '1' : o.bayrak;
  return acik && (o.simgeVar || o.testModu);
}

/** Ana ekrandaki bölüm sırası */
export function bolumSirasi(dersler: boolean): BolumId[] {
  return dersler ? ['ders', 'etkinlik', 'kitap', 'oyun', 'film'] : ['etkinlik', 'kitap', 'oyun', 'film'];
}

/**
 * Oyun kartı taşıyan bölümlerin (Dersler, Etkinlikler, Oyunlar) kartları. `kartlar`: menuOyunlari + yasaGore sonucu
 * (kilit ve yaş süzgeci öncesi ile aynı). Kitaplar ve Çizgi Filmler kendi listelerinden gelir.
 */
export function bolumKartlari(bolum: BolumId, kartlar: readonly OyunKarti[], dersler: boolean): OyunKarti[] {
  if (!dersler) {
    // bugünkü düzen, değişmeden
    if (bolum === 'etkinlik') return kartlar.filter((k) => ESKI_ETKINLIK_KARTLARI.includes(k.id));
    if (bolum === 'oyun') return kartlar.filter((k) => ![...ESKI_ETKINLIK_KARTLARI, 'film', 'kitap'].includes(k.id));
    return [];
  }
  if (bolum === 'ders') return DERS_KARTLARI.flatMap((id) => kartlar.filter((k) => k.id === id));
  if (bolum === 'etkinlik') return kartlar.filter((k) => ETKINLIK_KARTLARI.includes(k.id));
  if (bolum === 'oyun') return kartlar.filter((k) => ![...DERS_KARTLARI, ...ETKINLIK_KARTLARI, 'film', 'kitap'].includes(k.id));
  return [];
}
