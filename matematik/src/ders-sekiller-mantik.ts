// Ceren Öğretmen dersi 2 · Şekiller: DOM'suz kurallar (birim testleri buradan sınar). Ders kodu: ders-sekiller.ts.
// Yol haritası adım 4. Çizimler: Astra Paket M3 (assets/matematik/ders/sekiller/), sözler: ders-sekiller-sozler.json.
import sozler from './ders-sekiller-sozler.json';
import { esitAralikla, type Nokta } from './ceren-ders-mantik';

export const SEKILLER = ['daire', 'kare', 'ucgen', 'dikdortgen'] as const;
export type Sekil = (typeof SEKILLER)[number];
export const SEKIL_ADI: Record<Sekil, string> = { daire: 'daire', kare: 'kare', ucgen: 'üçgen', dikdortgen: 'dikdörtgen' };
/** 2–3 yaş ilk üç şekilde biter (dikdörtgen kareye çok benzer; 4 yaştan sonra). */
export const dersSekilleri = (minik: boolean): readonly Sekil[] => (minik ? SEKILLER.slice(0, 3) : SEKILLER);

/** Her şekilde tek etkinlik, sırayla değişir: çiz · bul · çiz · bul (aynı oyun art arda gelmez). */
export type SekilEtkinligi = 'ciz' | 'bul';
export const sekilEtkinligi = (s: Sekil): SekilEtkinligi => (SEKILLER.indexOf(s) % 2 ? 'bul' : 'ciz');
/** "Sınıfta bul": doğru nesne ve iki çeldirici (her nesne başka bir şekil). Bütün sınıf nesneleri derste bir kez görünür. */
export const BUL: Record<'kare' | 'dikdortgen', { dogru: string; celdirici: [string, string] }> = {
  kare: { dogru: 'pencere', celdirici: ['top', 'pizza-dilimi'] },
  dikdortgen: { dogru: 'kitap', celdirici: ['saat', 'tabela'] },
};
/** Nesneler odadaki doğal yerlerinde: pencere ve saat duvarda, top ve tabela yerde, kitap ve pizza masada. Her turda üç yer. */
export type NesneYeri = 'duvar' | 'yer' | 'masa';
export const NESNE_YERI: Record<string, NesneYeri> = { pencere: 'duvar', saat: 'duvar', top: 'yer', tabela: 'yer', 'pizza-dilimi': 'masa', kitap: 'masa' };
/** Astra'nın masalı fonu (sinif-sekiller-2) gelene dek masa nesneleri yerde, masanın önünde durur. */
export const MASALI_FON = 'sinif-sekiller-2';
/** Seçeneklerin sırası: doğru cevap her şekilde başka yerde (soldan sağa). */
export function bulSecenekleri(s: 'kare' | 'dikdortgen'): string[] {
  const { dogru, celdirici } = BUL[s];
  return s === 'kare' ? [celdirici[0], dogru, celdirici[1]] : [celdirici[0], celdirici[1], dogru];
}

/**
 * Çizim yolları (1000 × 1000 kutuda, Astra'nın iz çizimleriyle aynı yer: kesik çizginin ortası). Daire üstten başlar,
 * saat yönünün tersine; kare ve dikdörtgen sol üstten saat yönünde; üçgen tepeden sola iner. Tek çizgi, kapanır.
 */
export function sekilYolu(s: Sekil, adim = 14): Nokta[] {
  let k: Nokta[];
  if (s === 'daire') {
    k = Array.from({ length: 73 }, (_, i) => {
      const a = -Math.PI / 2 - (i / 72) * Math.PI * 2;
      return [500 + 388 * Math.cos(a), 500 + 388 * Math.sin(a)] as Nokta;
    });
  } else if (s === 'kare') k = [[112, 112], [888, 112], [888, 888], [112, 888], [112, 112]];
  else if (s === 'ucgen') k = [[500, 168], [112, 833], [888, 833], [500, 168]];
  else k = [[52, 232], [948, 232], [948, 768], [52, 768], [52, 232]];
  return esitAralikla(k, adim);
}

export const GEREKLI_CIZIMLER: readonly string[] = [
  'sinif-sekiller', ...SEKILLER, ...SEKILLER.filter((s) => sekilEtkinligi(s) === 'ciz').map((s) => 'iz-' + s),
  ...Object.values(BUL).flatMap((b) => [b.dogru, ...b.celdirici]), 'ceren-havada-ciz', 'ceren-buyutec', 'ceren-dusun', 'hatira-sekil-kutusu',
];
export const tanitSesi = (s: Sekil) => 'tanit_' + s;
export const bitisSesi = (sekiller: readonly Sekil[]) => 'bitis_' + sekiller.length;
export const GEREKLI_SESLER: readonly string[] = Object.keys(sozler);

export type SekilKaydi = { biten: Sekil[]; simdi: Sekil; tanitildi: boolean; bitti: boolean };
export const SEKIL_KAYIT_ANAHTARI = 'minkino-matematik-ceren-sekiller-v1';
export function kaydiCoz(metin: string | null, sekiller: readonly Sekil[] = SEKILLER): SekilKaydi {
  const bos: SekilKaydi = { biten: [], simdi: sekiller[0], tanitildi: false, bitti: false };
  try {
    const v = JSON.parse(metin ?? 'null') as Partial<SekilKaydi> | null;
    if (!v || typeof v !== 'object') return bos;
    const biten = Array.isArray(v.biten) ? [...new Set(v.biten.filter((s): s is Sekil => (SEKILLER as readonly string[]).includes(s)))] : [];
    const simdi = sekiller.includes(v.simdi as Sekil) ? (v.simdi as Sekil) : sekiller.find((s) => !biten.includes(s)) ?? sekiller[0];
    return { biten, simdi, tanitildi: !!v.tanitildi, bitti: !!v.bitti && sekiller.every((s) => biten.includes(s)) };
  } catch { return bos; }
}
export const siradaki = (k: SekilKaydi, sekiller: readonly Sekil[]) => sekiller.find((s) => !k.biten.includes(s));
