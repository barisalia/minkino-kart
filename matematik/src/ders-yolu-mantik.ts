// Matematik · Ders yolu "Minkino Bahçe Şenliği Hazırlığı" (yol haritası adım 9, yönetici kararı 20 Kasım; Antigravity
// CEVAP-06 C2): Ceren Öğretmen'in altı dersi şenliğin altı parçasıdır. DOM'suz kurallar (birim testleri buradan sınar).
// Sıra (Clements & Sarama; parça-bütün onluk yapıdan önce): Sayılar 1–10 → Şekiller → Karşılaştır ve ölç → Örüntü →
// Toplama ve çıkarma → Sayılar 11–20. 2–3 ve 4 yaşta ilk dört ders; son iki ders 5+ yaşta.
// Çizimler: Astra Paket M8 yeniden (assets/matematik/ders-yolu/), sözler: ders-yolu-sozler.json.
import sozler from './ders-yolu-sozler.json';

export const DERSLER = ['sayilar', 'sekiller', 'olcu', 'oruntu', 'topla', 'onluk'] as const;
export type DersId = (typeof DERSLER)[number];
export const DERS_ADI: Record<DersId, string> = {
  sayilar: 'Sayılar 1–10', sekiller: 'Şekiller', olcu: 'Karşılaştır ve ölç', oruntu: 'Örüntü', topla: 'Toplama ve çıkarma', onluk: 'Sayılar 11–20',
};
export const PARCA_ADI: Record<DersId, string> = {
  sayilar: 'meyve tezgâhı', sekiller: 'sahne', olcu: 'oyun parkuru', oruntu: 'fenerler ve bayraklar', topla: 'şenlik otobüsü', onluk: 'bilet gişesi',
};
/** Dersin oyuncağı (kilit aynı kalır: ders, açtığı oyuncağın kilidinin arkasında). */
export const KOSE: Record<DersId, 'sayi' | 'sekil' | 'olcu' | 'fener'> = { sayilar: 'sayi', sekiller: 'sekil', olcu: 'olcu', oruntu: 'fener', topla: 'sayi', onluk: 'sayi' };
/** Yaşa göre dersler: 5+ yaşta altısı, daha küçükte ilk dördü. */
export const yasDersleri = (yas: number | null): readonly DersId[] => ((yas ?? 5) >= 5 ? DERSLER : DERSLER.slice(0, 4));

/**
 * Parçanın durumu: bitti (canlandı, yeniden oynanır), sırada (parlıyor, dokununca ders açılır), bekliyor (önceki iş bitmeden
 * açılmaz), hazırlanıyor (dersin çizimleri henüz yok; yol onu atlar, sıradaki hazır derse geçer).
 */
export type ParcaDurumu = 'bitti' | 'sirada' | 'bekliyor' | 'hazirlaniyor';
export function yolDurumu(dersler: readonly DersId[], bitti: (d: DersId) => boolean, hazir: (d: DersId) => boolean): Record<DersId, ParcaDurumu> {
  const sonuc = {} as Record<DersId, ParcaDurumu>;
  let siraVerildi = false;
  for (const d of dersler) {
    if (bitti(d)) sonuc[d] = 'bitti';
    else if (!hazir(d)) sonuc[d] = 'hazirlaniyor';
    else if (!siraVerildi) { sonuc[d] = 'sirada'; siraVerildi = true; }
    else sonuc[d] = 'bekliyor';
  }
  return sonuc;
}
export const hepsiBitti = (dersler: readonly DersId[], bitti: (d: DersId) => boolean) => dersler.every(bitti);

/** Dersin hatıra çizimi (dersin kendi hatırası; panoya asılır). */
export const HATIRA: Record<DersId, string> = {
  sayilar: 'matematik/hatira-sayi', sekiller: 'matematik/ders/sekiller/hatira-sekil-kutusu', olcu: 'matematik/ders/olcu/hatira-mezura',
  oruntu: 'matematik/ders/oruntu/hatira-bayrak-dizisi', topla: 'matematik/ders/topla/hatira-bilet', onluk: 'matematik/ders/onluk/hatira-boncuk-kolye',
};
export const hazirSesi = (d: DersId) => 'hazir_' + d;

export const GEREKLI_CIZIMLER: readonly string[] = [
  'senlik-bahcesi', ...DERSLER.flatMap((d) => ['parca-' + d + '-bos', 'parca-' + d + '-hazir']), 'senlik-panosu', 'senlik-tabelasi',
];
export const GEREKLI_SESLER: readonly string[] = Object.keys(sozler);
/** Ders yolunun kendi kaydı: tanıtıldı mı, hangi parçaların canlanışı gösterildi (yeni biten ders bir kez kutlanır). */
export type YolKaydi = { tanitildi: boolean; kutlanan: DersId[] };
export const YOL_KAYIT_ANAHTARI = 'minkino-matematik-ders-yolu-v1';
export function yolKaydiCoz(metin: string | null): YolKaydi {
  try {
    const v = JSON.parse(metin ?? 'null') as Partial<YolKaydi> | null;
    return {
      tanitildi: !!v?.tanitildi,
      kutlanan: Array.isArray(v?.kutlanan) ? v!.kutlanan.filter((d): d is DersId => (DERSLER as readonly string[]).includes(d)) : [],
    };
  } catch { return { tanitildi: false, kutlanan: [] }; }
}
/** Bitmiş ama canlanışı henüz gösterilmemiş dersler (yola dönüldüğünde parça canlanır, hatıra panoya uçar). */
export const kutlanacak = (dersler: readonly DersId[], bitti: (d: DersId) => boolean, k: YolKaydi) => dersler.filter((d) => bitti(d) && !k.kutlanan.includes(d));
