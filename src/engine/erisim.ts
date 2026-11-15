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
  // ---- Barış 2026-11-16: yeni düzen. Eski oyunlar bütünüyle premium; ana oyun ve etkinliklerde başı ücretsiz.
  // Eski oyunlar (tanıtımda yok, deneme yok): Bil Bakalım, Pazar, Çiz Canlansın, Sesli Maceralar, Giysin, Otobüs
  kartlar: 'abonelik',
  macera: 'abonelik',
  giysin: 'abonelik',
  otobus: 'abonelik',
  // Minik Dostlarım (pati-yeni): ilk 3 gün ücretsiz, 4. günden sonrası premium (pati-yeni/main.js 'uyu')
  pati: 'ucretsiz',
  'pati/gun-1': 'ucretsiz',
  'pati/gun-2': 'ucretsiz',
  'pati/gun-3': 'ucretsiz',
  // Minik Şef: en güzel oyun, bol ücretsiz: ilk 3 gün (restoran/gun-N, aşağıda), sonrası premium
  sef: 'ucretsiz',
  'restoran/gun-3': 'ucretsiz',
  // Kino'yla Sen Seç: 1. bölüm (Kino'nun Bir Günü) ücretsiz, Fırtına Geliyor premium
  'kino-ile-sen-sec': 'ucretsiz',
  'kino-ile-sen-sec/bir-gun': 'ucretsiz',
  'kino-ile-sen-sec/*': 'abonelik',
  // Harf Atölyesi: A, B, C, Ç ücretsiz; hece oyunlarından Trambolin ücretsiz, Manyetik Pano premium
  alfabe: 'ucretsiz',
  'alfabe/harf-01': 'ucretsiz',
  'alfabe/harf-02': 'ucretsiz',
  'alfabe/harf-03': 'ucretsiz',
  'alfabe/harf-04': 'ucretsiz',
  'alfabe/hece-trambolin': 'ucretsiz',
  'alfabe/*': 'abonelik',
  // Matematik Atölyesi: Sayı masası ücretsiz; Şekil, Ölçü, Fener premium
  matematik: 'ucretsiz',
  'matematik/sayi': 'ucretsiz',
  'matematik/*': 'abonelik',
  // Okula Hazırlanalım: ilk 2 okul günü ücretsiz, sonrası premium
  hazirlik: 'ucretsiz',
  'hazirlik/gun-1': 'ucretsiz',
  'hazirlik/gun-2': 'ucretsiz',
  'hazirlik/*': 'abonelik',
  // İlk İngilizcem: bütünüyle premium (içerik gelişiyor)
  ingilizce: 'abonelik',
  // Kitaplar: Okula Başlıyor, Doktora Gidiyor, Kurabiye Yapıyor ücretsiz; diğerleri premium
  kitap: 'ucretsiz',
  'kitap/okul': 'ucretsiz',
  'kitap/doktor': 'ucretsiz',
  'kitap/kurabiye': 'ucretsiz',
  'kitap/*': 'abonelik',
  // Video çizgi filmler (izle/, src/video/videolar.ts; Barış 2026-11-10: menüde yalnız Bisiklet): Bisiklet ücretsiz
  'izle/kino-bisiklet': 'ucretsiz',
  'izle/*': 'abonelik',
  // Çizgi Filmler (eski canlı filmler, film/; 2026-11-10'dan beri menüde ve uygulama paketinde yok): yalnız "Mino'nun Karpuzu" ücretsiz
  'film/mino-karpuz': 'ucretsiz',
  'film/*': 'abonelik',
  // Kino ve Ailesi (Seri 2, Çizgi Filmler içinde yeni dizi; ÖNERİ, menüde değil: film/src/film2/katalog.ts → SERI2_MENUDE):
  // Bölüm 1 ücretsiz, gerisi 'film/*' ile abonelikle
  'film/seri2-bolum-01': 'ucretsiz',
  // Sesli Maceralar: bütünüyle premium (yukarıda)
  'macera/*': 'abonelik',
  // Bütünüyle abonelikle
  pazar: 'abonelik',
  // Mino'nun Pazarı bölümleri (Oyna, Meyve Suyu, Tart Bakalım): oyunla birlikte abonelikle. DİKKAT: bu satırı kod
  // sorgulamaz; Pazar'ın tamamı ana menü kartının kilidiyle ('pazar') kapanır. Tart'ı ayrı açmak için yalnız burayı
  // değiştirmek yetmez, pazar açılışında da erisimVarMi('pazar/tart') gerekir.
  'pazar/tart': 'abonelik',
  canlan: 'abonelik',
  pasta: 'abonelik',
  dedektif: 'abonelik',
  // Dedektif Mino vakaları: hepsi abonelikle (Vaka 3 yayında: dedektif/src/mantik3.ts → VAKA3_YAYINDA; dosyaya
  // dokununca dedektif/<vaka> sorulur: dedektif/src/ekranlar.ts)
  'dedektif/vaka2': 'abonelik',
  'dedektif/vaka3': 'abonelik',
  'dedektif/*': 'abonelik',
  // Kino Ne Giysin?: bütünüyle premium (yukarıda)
  'giysin/*': 'abonelik',
  // Kino'nun Otobüsü: Gün 1 (Mino'lu öğretici, akşam sayımı, ilk iki otobüs süsü) ücretsiz; Gün 2-3 ve kalan süsler
  // abonelikle ('kino-otobus/susler'). Yaş ayarı kilitlenmez.
  'kino-otobus/*': 'abonelik',
  // Pati Dükkânı v2: başlangıç (vitrin, 3 başlangıç yavrusu, salon, eşyalar, süsler, ziyaretçiler) ücretsiz; yeni köşeler
  // (pati/kose-kemirgen, -akvaryum, -kus, -bahce, -surungen) abonelikle: kilit yalnız katalogda köşe alırken (magaza.ts)
  'pati/*': 'abonelik',
  // Otobüs (otobus/): tek menü kartı, içinde iki aşama. Kart açık (Dondurma'nın Gün 1'i ücretsiz); her aşama kendi
  // kuralıyla: Dondurma = 'kino-otobus/…', Pasta = 'pasta' (abonelikle)
  // Tıkır Tıkır Lokanta: Gün 1 ve Gün 2 (salata, menemen, yıka, ilk alım) ücretsiz; Gün 3 ve sonrası abonelikle
  // (ekip/senaryo/RESTORAN.md §6d; kilit P4'te gün geçişinde ve defterde sorulur)
  'restoran/gun-1': 'ucretsiz',
  'restoran/gun-2': 'ucretsiz',
  'restoran/*': 'abonelik',
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

/** Bu içerik şu an kilitli mi */
export const kilitli = (id: string): boolean => kilitliMi(id, { etkin: kilitlerEtkin(), premium: premiumMu() });
