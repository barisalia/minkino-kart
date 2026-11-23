// Ceren Öğretmen dersi 4 · Örüntü: DOM'suz kurallar (birim testleri buradan sınar). Ders kodu: ders-oruntu.ts.
// Yol haritası adım 6. Çizimler: Astra Paket M5 (assets/matematik/ders/oruntu/), sözler: ders-oruntu-sozler.json.
// Fener tiyatrosu (renkli fener gösterisi) örüntüyü pekiştirir.
import sozler from './ders-oruntu-sozler.json';

export const ETKINLIKLER = ['renk', 'sekil', 'ses', 'kendi'] as const;
export type Etkinlik = (typeof ETKINLIKLER)[number];
export const ETKINLIK_ADI: Record<Etkinlik, string> = { renk: 'renk örüntüsü', sekil: 'şekil örüntüsü', ses: 'ses örüntüsü', kendi: 'kendi örüntün' };
export type OYol = 'minik' | 'dort' | 'bes';
/** 2–3 yaş renk, şekil, ses (AB, tek boşluk); 4 yaştan sonra iki boşluk ve sonunda kendi örüntüsü. */
export const dersEtkinlikleri = (yol: OYol): readonly Etkinlik[] => (yol === 'minik' ? ETKINLIKLER.slice(0, 3) : ETKINLIKLER);

export const BAYRAKLAR = ['bayrak-kirmizi', 'bayrak-mavi', 'bayrak-sari'] as const;
export const TASLAR = ['tas-kirmizi-daire', 'tas-mavi-kare', 'tas-sari-ucgen', 'tas-yesil-yildiz'] as const;
export const CALGILAR = ['davul', 'cingirak', 'alkis'] as const;
/** Çalgının sesi (src/audio/bando calgiSesi): davul, çıngırak (hışırtı), alkış. */
export const CALGI_SESI: Record<(typeof CALGILAR)[number], number> = { davul: 0, cingirak: 2, alkis: 1 };

/** Altı yuvalı dizi: görünenler ve boşluklar (null). Boşluklar sırayla doldurulur. */
export const YUVA = 6;
export type Desen = { dizi: string[]; bosluk: number; tanit: string; sor: string; secenek: string[] };
const kur = (birim: string[], bosluk: number, tanit: string, sor: string, secenek: string[]): Desen => ({
  dizi: Array.from({ length: YUVA }, (_, i) => birim[i % birim.length]), bosluk, tanit, sor, secenek,
});
const [K, M, S] = BAYRAKLAR;
const [DA, KA, UC, YI] = TASLAR;
export function desen(e: Exclude<Etkinlik, 'kendi'>, yol: OYol): Desen {
  const iki = yol === 'minik' ? 1 : 2;
  if (e === 'renk') return yol === 'bes' ? kur([K, M, S], 2, 'renk_abc', 'renk_sor', [...BAYRAKLAR]) : kur([K, M], iki, 'renk_ab', 'renk_sor', [...BAYRAKLAR]);
  if (e === 'sekil') return yol === 'minik' ? kur([DA, KA], 1, 'sekil_ab', 'sekil_sor', [DA, KA, UC]) : kur([DA, DA, KA], 2, 'sekil_aab', 'sekil_sor', yol === 'bes' ? [...TASLAR] : [DA, KA, YI]);
  return yol === 'bes' ? kur(['davul', 'davul', 'alkis'], 2, 'ses_dinle', 'ses_sor', [...CALGILAR]) : kur(['davul', 'cingirak'], iki, 'ses_dinle', 'ses_sor', [...CALGILAR]);
}
/** Görünen yuvalar (boşluklar sonda). */
export const gorunen = (d: Desen) => d.dizi.slice(0, YUVA - d.bosluk);
/** Sıradaki boşluğun beklenen cevabı (dolu sayısına göre). */
export const beklenen = (d: Desen, dolu: number) => d.dizi[YUVA - d.bosluk + dolu];
/** Çocuğun kendi örüntüsü: seçtiği iki bayrak ipte tekrar eder. */
export const kendiDizisi = (secim: readonly [string, string]) => Array.from({ length: YUVA }, (_, i) => secim[i % 2]);

export const dogruSesi = (i: number) => 'dogru_' + ((i % 3) + 1);
export const POZLAR = ['sira-goster', 'davul'] as const;
export const GEREKLI_CIZIMLER: readonly string[] = ['bayram-sinifi', ...BAYRAKLAR, ...TASLAR, ...CALGILAR, ...POZLAR.map((p) => 'ceren-' + p), 'hatira-bayrak-dizisi'];
export const GEREKLI_SESLER: readonly string[] = Object.keys(sozler);

export type OruntuKaydi = { biten: Etkinlik[]; simdi: Etkinlik; tanitildi: boolean; bitti: boolean };
export const ORUNTU_KAYIT_ANAHTARI = 'minkino-matematik-ceren-oruntu-v1';
export function kaydiCoz(metin: string | null, etkinlikler: readonly Etkinlik[] = ETKINLIKLER): OruntuKaydi {
  const bos: OruntuKaydi = { biten: [], simdi: etkinlikler[0], tanitildi: false, bitti: false };
  try {
    const v = JSON.parse(metin ?? 'null') as Partial<OruntuKaydi> | null;
    if (!v || typeof v !== 'object') return bos;
    const biten = Array.isArray(v.biten) ? [...new Set(v.biten.filter((k): k is Etkinlik => (ETKINLIKLER as readonly string[]).includes(k)))] : [];
    const simdi = etkinlikler.includes(v.simdi as Etkinlik) ? (v.simdi as Etkinlik) : etkinlikler.find((k) => !biten.includes(k)) ?? etkinlikler[0];
    return { biten, simdi, tanitildi: !!v.tanitildi, bitti: !!v.bitti && etkinlikler.every((k) => biten.includes(k)) };
  } catch { return bos; }
}
export const siradaki = (k: OruntuKaydi, etkinlikler: readonly Etkinlik[]) => etkinlikler.find((x) => !k.biten.includes(x));
