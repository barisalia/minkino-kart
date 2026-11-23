// Ceren Öğretmen dersi 5 · Sayılar 11–20 (5+ yaş): DOM'suz kurallar (birim testleri buradan sınar). Ders kodu: ders-onluk.ts.
// Yol haritası adım 7. Çizimler: Astra Paket M6 (assets/matematik/ders/onluk/; rakam blokları 1–10 assets/matematik/ceren/),
// sözler: ders-onluk-sozler.json; 1–10 sayma sözleri Sayılar dersinden (assets/matematik/ceren/ses/say_n).
import sozler from './ders-onluk-sozler.json';

export const GOREVLER = ['onluk', 'on-uc', 'abakus', 'yirmi'] as const;
export type Gorev = (typeof GOREVLER)[number];
export const GOREV_ADI: Record<Gorev, string> = { onluk: 'onluk', 'on-uc': 'on üç', abakus: 'abaküs', yirmi: 'yirmi' };

/** Sayının adı için Ceren'in kaydı: 1–10 Sayılar dersinden, 11–20 bu dersten. */
const ONLAR = ['', 'bir', 'iki', 'uc', 'dort', 'bes', 'alti', 'yedi', 'sekiz', 'dokuz'];
export function sayiSesi(n: number): string | null {
  if (n >= 1 && n <= 10) return 'say_' + n;
  if (n >= 11 && n <= 19) return 'on_' + ONLAR[n - 10];
  if (n === 20) return 'yirmi';
  return null;
}
/** Sayıyı onluk ve birliğe ayırır (rakam blokları: 14 → 1 ve 4). */
export const basamaklar = (n: number): [number, number] => [Math.floor(n / 10), n % 10];

/** Her görevin başlangıcı ve hedefi (onluk sayısı, birlik sayısı). */
export const GOREV: Record<Gorev, { bas: number; hedef: number; yonerge: string; sonuc: string }> = {
  onluk: { bas: 0, hedef: 10, yonerge: 'onluk_yonerge', sonuc: 'onluk_oldu' },
  'on-uc': { bas: 10, hedef: 13, yonerge: 'on_uc_yonerge', sonuc: 'on_uc_sonuc' },
  abakus: { bas: 0, hedef: 16, yonerge: 'abakus_yonerge', sonuc: 'on_alti_sonuc' },
  yirmi: { bas: 17, hedef: 20, yonerge: 'yirmi_yonerge', sonuc: 'yirmi_sonuc' },
};
/** Tek boncuklar: masada hedefe yetecek kadar ve iki fazla (seçim olsun, saymak gereksin değil, eksik kalmasın). */
export const tekBoncuk = (g: Gorev) => (g === 'abakus' ? 0 : GOREV[g].hedef - GOREV[g].bas + (g === 'onluk' ? 0 : 2));

/** Abaküs: her telde on boncuk; üst tel onluk, alt tel birlik. Durum: sola itilen boncuk sayıları. */
export const TELDE = 10;
export type Abakus = { ust: number; alt: number };
export const abakusDegeri = (a: Abakus) => a.ust * 10 + a.alt;
/** Hedefe göre: tamam, fazla (üstte ya da altta hedeften çok) ya da sürüyor. */
export function abakusDurumu(a: Abakus, hedef: number): 'tamam' | 'fazla' | 'suruyor' {
  const [o, b] = basamaklar(hedef);
  if (a.ust === o && a.alt === b) return 'tamam';
  if (a.ust > o || a.alt > b) return 'fazla';
  return 'suruyor';
}
/** Tele dokunuş: sağdaki boncuğa dokunmak birini sola iter, soldakine dokunmak birini geri alır. */
export const it = (sol: number, sagaDokundu: boolean) => Math.max(0, Math.min(TELDE, sol + (sagaDokundu ? 1 : -1)));

export const POZLAR = ['on-parmak'] as const;
export const GEREKLI_CIZIMLER: readonly string[] = [
  'boncuk-masasi', 'onluk-cubuk', 'birlik', 'abakus-cerceve', 'abakus-boncuk-kirmizi', 'abakus-boncuk-mavi', 'rakam-0', 'ceren-on-parmak', 'hatira-boncuk-kolye',
];
export const GEREKLI_SESLER: readonly string[] = Object.keys(sozler);

/** Ders 5+ yaşa; Sayı masasının hatırası alındıktan (1–10 bitti) sonra açılır. */
export const dersAcilir = (yas: number | null, sayiHatira: boolean) => (yas ?? 5) >= 5 && sayiHatira;

export type OnlukKaydi = { biten: Gorev[]; simdi: Gorev; tanitildi: boolean; bitti: boolean };
export const ONLUK_KAYIT_ANAHTARI = 'minkino-matematik-ceren-onluk-v1';
export function kaydiCoz(metin: string | null): OnlukKaydi {
  const bos: OnlukKaydi = { biten: [], simdi: GOREVLER[0], tanitildi: false, bitti: false };
  try {
    const v = JSON.parse(metin ?? 'null') as Partial<OnlukKaydi> | null;
    if (!v || typeof v !== 'object') return bos;
    const biten = Array.isArray(v.biten) ? [...new Set(v.biten.filter((k): k is Gorev => (GOREVLER as readonly string[]).includes(k)))] : [];
    const simdi = GOREVLER.includes(v.simdi as Gorev) ? (v.simdi as Gorev) : GOREVLER.find((k) => !biten.includes(k)) ?? GOREVLER[0];
    return { biten, simdi, tanitildi: !!v.tanitildi, bitti: !!v.bitti && GOREVLER.every((k) => biten.includes(k)) };
  } catch { return bos; }
}
export const siradaki = (k: OnlukKaydi) => GOREVLER.find((x) => !k.biten.includes(x));
