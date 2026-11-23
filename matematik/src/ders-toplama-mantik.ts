// Ceren Öğretmen dersi 6 · Toplama ve çıkarma başlangıcı (5+ yaş): DOM'suz kurallar (birim testleri buradan sınar).
// Ders kodu: ders-toplama.ts. Yol haritası adım 8. Çizimler: Astra Paket M7 (assets/matematik/ders/topla/), sözler:
// ders-toplama-sozler.json. Beş pencereli otobüs beşlik çerçevedir, iki otobüs onluk. Sayı masasının topla ve çıkar
// turları pekiştirir.
import sozler from './ders-toplama-sozler.json';

/** Dört iş, her biri bir kez: bir fazla · beşe tamamla · eksilme · ona tamamla. */
export const ETKINLIKLER = ['fazla', 'doldur', 'eksik', 'on'] as const;
export type Etkinlik = (typeof ETKINLIKLER)[number];
export const ETKINLIK_ADI: Record<Etkinlik, string> = { fazla: 'bir fazla', doldur: 'beşe tamamla', eksik: 'eksilme', on: 'ona tamamla' };

export const PENCERE = 5;
export const YOLCULAR = ['yolcu-ayicik', 'yolcu-kedi', 'yolcu-kopek', 'yolcu-penguen', 'yolcu-koala'] as const;

/**
 * Bir işin kurgusu. `otobusler`: otobüslerdeki yolcu sayısı (ikinci otobüs onluk için); `durakta`: bekleyen yolcu;
 * `is`: çocuğun eylemi — 'bin' (bekleyene dokunur, biner), 'in' (otobüstekine dokunur, iner), 'tahmin' (önce sayıyı
 * seçer, sonra yolcular kendiliğinden biner: sonucu görür). `adet` kaç yolcunun bineceği / ineceği.
 */
export type Soru = {
  otobusler: readonly number[]; durakta: number; is: 'bin' | 'in' | 'tahmin'; adet: number;
  cevap: number; secenek: readonly number[]; tanit: string; sor: string; dogru: string; ipucu: string;
};
export const SORULAR: Record<Etkinlik, Soru> = {
  // 2 + 1 = 3
  fazla: { otobusler: [2], durakta: 1, is: 'bin', adet: 1, cevap: 3, secenek: [2, 3, 4], tanit: 'fazla_bin', sor: 'fazla_sor', dogru: 'fazla_dogru', ipucu: 'ipucu' },
  // 3 + ? = 5 (çocuk doldurur, kaç kişinin bindiğini söyler)
  doldur: { otobusler: [3], durakta: 2, is: 'bin', adet: 2, cevap: 2, secenek: [2, 3, 4], tanit: 'doldur_bin', sor: 'doldur_sor', dogru: 'doldur_dogru', ipucu: 'ipucu' },
  // 5 − 2 = 3
  eksik: { otobusler: [5], durakta: 0, is: 'in', adet: 2, cevap: 3, secenek: [1, 2, 3], tanit: 'eksik_in', sor: 'eksik_sor', dogru: 'eksik_dogru', ipucu: 'ipucu' },
  // 5 + 3 + ? = 10 (önce tahmin, sonra iki yolcu biner)
  on: { otobusler: [5, 3], durakta: 2, is: 'tahmin', adet: 2, cevap: 2, secenek: [2, 3, 4], tanit: 'on_gel', sor: 'on_sor', dogru: 'on_dogru', ipucu: 'ipucu_bos' },
};

/** İşten sonraki yolcu sayısı (otobüslerin toplamı). */
export const sonuc = (s: Soru) => s.otobusler.reduce((a, b) => a + b, 0) + (s.is === 'in' ? -s.adet : s.adet);
/** Cevabın neden doğru olduğu: işin sayıları. */
export function denklem(s: Soru): [number, '+' | '−', number, number] {
  const once = s.otobusler.reduce((a, b) => a + b, 0);
  return s.is === 'in' ? [once, '−', s.adet, once - s.adet] : [once, '+', s.adet, once + s.adet];
}

/**
 * Pencerelerde ve durakta kimler var: her işte yolcular başka sırada (aynı yüz aynı pencerede kalmasın).
 * Onlukta beş çizim iki otobüse yeter diye yolcular ikinci otobüste yeniden görünür, sıraları kayar.
 */
export function yerlesim(e: Etkinlik) {
  const s = SORULAR[e], kay = ETKINLIKLER.indexOf(e);
  let i = kay;
  const sonraki = () => YOLCULAR[i++ % YOLCULAR.length];
  const otobusler = s.otobusler.map((n) => Array.from({ length: n }, sonraki));
  const durakta = Array.from({ length: s.durakta }, sonraki);
  return { otobusler, durakta };
}

export const POZLAR = ['el-salla', 'bir-fazla'] as const;
export const GEREKLI_CIZIMLER: readonly string[] = ['durak', 'otobus', ...YOLCULAR, ...POZLAR.map((p) => 'ceren-' + p), 'hatira-bilet'];
export const GEREKLI_SESLER: readonly string[] = Object.keys(sozler);

export type ToplamaKaydi = { biten: Etkinlik[]; simdi: Etkinlik; tanitildi: boolean; bitti: boolean };
export const TOPLAMA_KAYIT_ANAHTARI = 'minkino-matematik-ceren-topla-v1';
export function kaydiCoz(metin: string | null): ToplamaKaydi {
  const bos: ToplamaKaydi = { biten: [], simdi: ETKINLIKLER[0], tanitildi: false, bitti: false };
  try {
    const v = JSON.parse(metin ?? 'null') as Partial<ToplamaKaydi> | null;
    if (!v || typeof v !== 'object') return bos;
    const biten = Array.isArray(v.biten) ? [...new Set(v.biten.filter((k): k is Etkinlik => (ETKINLIKLER as readonly string[]).includes(k)))] : [];
    const simdi = ETKINLIKLER.includes(v.simdi as Etkinlik) ? (v.simdi as Etkinlik) : ETKINLIKLER.find((k) => !biten.includes(k)) ?? ETKINLIKLER[0];
    return { biten, simdi, tanitildi: !!v.tanitildi, bitti: !!v.bitti && ETKINLIKLER.every((k) => biten.includes(k)) };
  } catch { return bos; }
}
export const siradaki = (k: ToplamaKaydi) => ETKINLIKLER.find((x) => !k.biten.includes(x));
/** Ders yalnız 5 yaş ve üzerinde (menüdeki yaş seçilmemişse 5+ sayılır). */
export const yasUygun = (yas: number | null) => (yas ?? 5) >= 5;
