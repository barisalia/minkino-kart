// Matematik · "Dede'nin Şekil Kutusu" (Şekil evi; yönetici, 22 Kasım sabahı: 2–3 yaş yolunda içeriği en az kalan
// üçüncü oyuncak; bugünkü yeni turlardan başka karakter ve sahne). Şekil tanıma ve eşleme: tahta şekiller kutunun önündeki
// deliklere sokulur. 2–3 yaşta daire, kare, üçgen; 4 yaşta dikdörtgen de; 5+ yaşta yıldız da ve bazı şekiller ters ya da yan
// gelir, dokunup çevirmek gerekir (uzamsal akıl yürütme). DOM'suz kurallar. Çizimler: Astra Paket M37. Sahne main.ts → sekilKutusu.
import type { Yol } from './tur-sirasi';
import { gelisSorusu, type Havuzlar } from './derinlik';

export const KUTU_SEKILLERI = ['daire', 'kare', 'ucgen', 'dikdortgen', 'yildiz'] as const;
export type KSekil = (typeof KUTU_SEKILLERI)[number];
export const KSEKIL_ADI: Record<KSekil, string> = { daire: 'Daire', kare: 'Kare', ucgen: 'Üçgen', dikdortgen: 'Dikdörtgen', yildiz: 'Yıldız' };
/** Şeklin deliğe girdiği dönüşler (derece, 90'ın katları): daire hep, kare dört yönde, dikdörtgen yatay iki yönde, üçgen ve yıldız tepesi yukarıdayken. */
export const girerMi = (s: KSekil, aci: number) => {
  const a = ((aci % 360) + 360) % 360;
  return s === 'daire' || s === 'kare' || (s === 'dikdortgen' ? a % 180 === 0 : a === 0);
};
export type Parca = { sekil: KSekil; aci: number };
export type KutuTuru = { parcalar: Parca[]; cevir: boolean };
const P = (sekil: KSekil, aci = 0): Parca => ({ sekil, aci });
/**
 * Gelişe göre parçalar. 2–3 yaş: dört parça (daire, kare, üçgen; biri iki kez), hepsi düz. 4 yaş: beş parça, dikdörtgen de,
 * hepsi düz. 5+: beş şekil, ikisi ters ya da yan (dokununca 90° döner).
 */
export function kutuTuru(yol: Yol, tekrar = 0): KutuTuru {
  const h: Havuzlar<readonly Parca[]> = yol === 'minik'
    ? [[[P('daire'), P('kare'), P('ucgen'), P('daire')]], [[P('kare'), P('ucgen'), P('daire'), P('kare')]],
      [[P('ucgen'), P('daire'), P('kare'), P('ucgen')], [P('daire'), P('ucgen'), P('kare'), P('kare')]]]
    : yol === 'dort'
      ? [[[P('kare'), P('daire'), P('dikdortgen'), P('ucgen'), P('daire')]], [[P('dikdortgen'), P('ucgen'), P('kare'), P('daire'), P('dikdortgen')]],
        [[P('ucgen'), P('dikdortgen'), P('daire'), P('kare'), P('ucgen')], [P('daire'), P('kare'), P('ucgen'), P('dikdortgen'), P('kare')]]]
      : [[[P('daire'), P('ucgen', 180), P('kare'), P('dikdortgen', 90), P('yildiz')]], [[P('yildiz', 180), P('kare'), P('ucgen', 90), P('daire'), P('dikdortgen')]],
        [[P('dikdortgen', 90), P('daire'), P('yildiz', 90), P('kare'), P('ucgen')], [P('ucgen', 270), P('dikdortgen', 90), P('kare'), P('yildiz'), P('daire')]]];
  return { parcalar: gelisSorusu(h, tekrar).map((p) => ({ ...p })), cevir: yol === 'bes' };
}

/**
 * Fon `dede-cardagi` (1672 × 941): sonbaharda bahçe çardağı. `sekil-kutusu` (700 × 520) ortada, önündeki beş delik tuvalde
 * sabit (merkez ve kutu); parçalar sağda battaniyede, Dede solda bankta.
 */
export const KUTU = { x: 486, y: 330, w: 700, h: 520 } as const;
export const DELIK: Record<KSekil, { x: number; y: number; w: number; h: number }> = {
  daire: { x: 150, y: 230, w: 130, h: 130 },
  kare: { x: 350, y: 230, w: 130, h: 130 },
  ucgen: { x: 550, y: 235, w: 140, h: 125 },
  dikdortgen: { x: 250, y: 400, w: 170, h: 95 },
  yildiz: { x: 450, y: 400, w: 140, h: 135 },
};
/** Parça tuvali (deliğinden biraz küçük); dokunma kutusu en az 160 × 160. */
export const PARCA_TUVALI: Record<KSekil, { w: number; h: number }> = {
  daire: { w: 120, h: 120 }, kare: { w: 120, h: 120 }, ucgen: { w: 130, h: 115 }, dikdortgen: { w: 160, h: 85 }, yildiz: { w: 130, h: 125 },
};
export const DOKUNMA = 160;
/** Parçaların battaniyedeki yerleri (merkez). */
export const PARCA_YERI = [[1300, 560], [1490, 560], [1300, 740], [1490, 740], [1395, 890]] as const;
export const DEDE = { x: 40, w: 430, h: 560, taban: 900 } as const;
/** Bırakılan noktanın deliği (fon pikseli; deliğin çevresinde 30 px pay). */
export function delikBul(x: number, y: number): KSekil | undefined {
  return KUTU_SEKILLERI.find((s) => {
    const d = DELIK[s], cx = KUTU.x + d.x, cy = KUTU.y + d.y;
    return Math.abs(x - cx) <= d.w / 2 + 30 && Math.abs(y - cy) <= d.h / 2 + 30;
  });
}

export const KUTU_SOZ = {
  giris: 348,
  girdi: { daire: 349, kare: 350, ucgen: 351, dikdortgen: 352, yildiz: 353 } as Record<KSekil, number>,
  yanlis: 354, cevir: 355, cevirYonerge: 356, bitti: 357,
} as const;
/** Astra M37 (`assets/matematik/sekil-kutusu/`): çardak, şekil kutusu, beş tahta parça, Dede'nin iki pozu. */
export const KUTU_CIZIMLERI = ['dede-cardagi', 'sekil-kutusu', ...KUTU_SEKILLERI.map((s) => 'parca-' + s), 'dede-kutu-0', 'dede-kutu-1'] as const;
