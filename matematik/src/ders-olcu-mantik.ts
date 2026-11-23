// Ceren Öğretmen dersi 3 · Karşılaştır ve ölç: DOM'suz kurallar (birim testleri buradan sınar). Ders kodu: ders-olcu.ts.
// Yol haritası adım 5. Çizimler: Astra Paket M4 (assets/matematik/ders/olcu/), sözler: ders-olcu-sozler.json.
// Ölçü tezgâhının Boy Duvarı ve Yaprak Yolu oyunları birimle ölçmeyi pekiştirir; bu ders karşılaştırmanın dilini kurar.
import sozler from './ders-olcu-sozler.json';

export const KAVRAMLAR = ['buyuk-kucuk', 'uzun-kisa', 'cok-az', 'agir-hafif'] as const;
export type Kavram = (typeof KAVRAMLAR)[number];
export const KAVRAM_ADI: Record<Kavram, string> = { 'buyuk-kucuk': 'büyük ve küçük', 'uzun-kisa': 'uzun ve kısa', 'cok-az': 'çok ve az', 'agir-hafif': 'ağır ve hafif' };
/** 2–3 yaş ilk üç kavramda biter; ağır ve hafif 4 yaştan sonra. */
export const dersKavramlari = (minik: boolean): readonly Kavram[] => (minik ? KAVRAMLAR.slice(0, 3) : KAVRAMLAR);

/** Çizimin tuvali (Astra M4): kare nesneler 600 × 600 (taban y 580), yatay olanlar 900 × 300 (sol uç x 40), kavanoz ve ağırlıklar 500 × 600. */
export type Tuval = 'kare' | 'yatay' | 'dik';
export const TUVAL: Record<string, Tuval> = {
  'ayicik-buyuk': 'kare', 'ayicik-kucuk': 'kare', 'sapka-buyuk': 'kare', 'sapka-kucuk': 'kare', 'kupa-buyuk': 'kare', 'kupa-kucuk': 'kare',
  'kalem-uzun': 'yatay', 'kalem-kisa': 'yatay', 'atki-uzun': 'yatay', 'atki-kisa': 'yatay', 'tren-uzun': 'yatay', 'tren-kisa': 'yatay',
  'kavanoz-cok': 'dik', 'kavanoz-az': 'dik', karpuz: 'dik', tuy: 'dik',
};
/** Çiftin dizilişi: yatay olanlar üst üste, sol uçları aynı yerde (uzunluk adil karşılaştırılır); ötekiler yan yana. */
export const dizilis = (cift: readonly [string, string]) => (TUVAL[cift[0]] === 'yatay' ? 'ust-uste' : 'yan-yana');

/** Bir soru: iki nesne (soldan sağa ya da üstten alta), hangisi doğru, Ceren'in sözü. Doğru cevap sorudan soruya yer değiştirir. */
export type Soru = { cift: [string, string]; dogru: string; soz: string };
export type KavramPlani = {
  /** Tanıtılan çift ve tanıtma sözleri (sırayla; her söz bir nesneyi öne çıkarır, null ikisini birden). */
  tanit: { cift: [string, string]; sozler: { soz: string; one: string | null; poz: string }[] };
  sorular: Soru[];
};
export const PLAN: Record<Kavram, KavramPlani> = {
  'buyuk-kucuk': {
    tanit: { cift: ['ayicik-buyuk', 'ayicik-kucuk'], sozler: [
      { soz: 'tanit_buyuk', one: 'ayicik-buyuk', poz: 'buyuk' }, { soz: 'tanit_kucuk', one: 'ayicik-kucuk', poz: 'kucuk' }] },
    sorular: [
      { cift: ['sapka-kucuk', 'sapka-buyuk'], dogru: 'sapka-kucuk', soz: 'soru_kucuk_sapka' },
      { cift: ['kupa-kucuk', 'kupa-buyuk'], dogru: 'kupa-buyuk', soz: 'soru_buyuk_kupa' },
    ],
  },
  'uzun-kisa': {
    tanit: { cift: ['kalem-uzun', 'kalem-kisa'], sozler: [{ soz: 'tanit_uzunkisa', one: null, poz: 'goster' }] },
    sorular: [
      { cift: ['atki-kisa', 'atki-uzun'], dogru: 'atki-uzun', soz: 'soru_uzun_atki' },
      { cift: ['tren-uzun', 'tren-kisa'], dogru: 'tren-kisa', soz: 'soru_kisa_tren' },
    ],
  },
  'cok-az': {
    tanit: { cift: ['kavanoz-cok', 'kavanoz-az'], sozler: [{ soz: 'tanit_cokaz', one: null, poz: 'goster' }] },
    sorular: [{ cift: ['kavanoz-az', 'kavanoz-cok'], dogru: 'kavanoz-az', soz: 'soru_az_kavanoz' }],
  },
  'agir-hafif': {
    tanit: { cift: ['karpuz', 'tuy'], sozler: [{ soz: 'tanit_agirhafif', one: null, poz: 'tart' }] },
    sorular: [{ cift: ['tuy', 'karpuz'], dogru: 'tuy', soz: 'soru_hafif' }],
  },
};
/** Övgüler sırayla döner (aynı övgü art arda gelmez). */
export const dogruSesi = (i: number) => 'dogru_' + ((i % 3) + 1);
export const bitisSesi = (kavramlar: readonly Kavram[]) => 'bitis_' + kavramlar.length;

export const POZLAR = ['buyuk', 'kucuk', 'tart'] as const;
export const GEREKLI_CIZIMLER: readonly string[] = ['oyuncak-odasi', ...Object.keys(TUVAL), ...POZLAR.map((p) => 'ceren-' + p), 'hatira-mezura'];
export const GEREKLI_SESLER: readonly string[] = Object.keys(sozler);

export type OlcuKaydi = { biten: Kavram[]; simdi: Kavram; tanitildi: boolean; bitti: boolean };
export const OLCU_KAYIT_ANAHTARI = 'minkino-matematik-ceren-olcu-v1';
export function kaydiCoz(metin: string | null, kavramlar: readonly Kavram[] = KAVRAMLAR): OlcuKaydi {
  const bos: OlcuKaydi = { biten: [], simdi: kavramlar[0], tanitildi: false, bitti: false };
  try {
    const v = JSON.parse(metin ?? 'null') as Partial<OlcuKaydi> | null;
    if (!v || typeof v !== 'object') return bos;
    const biten = Array.isArray(v.biten) ? [...new Set(v.biten.filter((k): k is Kavram => (KAVRAMLAR as readonly string[]).includes(k)))] : [];
    const simdi = kavramlar.includes(v.simdi as Kavram) ? (v.simdi as Kavram) : kavramlar.find((k) => !biten.includes(k)) ?? kavramlar[0];
    return { biten, simdi, tanitildi: !!v.tanitildi, bitti: !!v.bitti && kavramlar.every((k) => biten.includes(k)) };
  } catch { return bos; }
}
export const siradaki = (k: OlcuKaydi, kavramlar: readonly Kavram[]) => kavramlar.find((x) => !k.biten.includes(x));
