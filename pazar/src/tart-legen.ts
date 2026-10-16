/**
 * Tart Bakalım leğeninin ölçüleri (DOM yok; fizik testleri de kullanır).
 *
 * Leğen: terazi kefesi çizimi (assets/pazar/terazi-kefe.webp, 2009 × 1491 px; 2026-10-16 Gemini netlik çizimi,
 * eskisinden biraz basık) zincirleri kırpılmış hâliyle. Ölçüler çizimin eni 631 birim sayılarak (eski çizimin pikseli;
 * çizim 631 × 468.3 birim). Kırpılan kutu çizimin y = KIRP_UST … KEFE_BOY arası; fizik birimi: kutunun eni 100 birim.
 * Leğenin iç kesiti (yan görünüş) bu
 * birimlerle çoklu çizgi; iki yandan yukarı görünmez duvarlar (meyve atılınca dışarı kaçmasın).
 */
import { Dunya } from './fizik';

export const KEFE_EN = 631;
export const KEFE_BOY = (631 * 1491) / 2009;
/** zincirler bu çizginin üstünde kalır (kenarın üst çizgisi korunur) */
export const KIRP_UST = 254;
/** çizim pikselinden fizik birimine */
const B = 100 / KEFE_EN;
export const LEGEN_BOY = (KEFE_BOY - KIRP_UST) * B;
const nokta = (x: number, y: number): [number, number] => [x * B, (y - KIRP_UST) * B];

/** İç kesit (soldan sağa): kenar → eğim → düz dip → eğim → kenar */
export const LEGEN_KESIT: [number, number][] = [
  nokta(20, 320),
  nokta(55, 345),
  nokta(110, 368),
  nokta(190, 386),
  nokta(441, 386),
  nokta(521, 368),
  nokta(576, 345),
  nokta(611, 320),
];

/** Kenarın üstündeki çizim (zincir izi kalmasın): kırpma çokgeni, kırpılmış kutuya göre yüzde */
const yuzdeX = (x: number) => (x / KEFE_EN) * 100;
const yuzdeY = (y: number) => ((y - KIRP_UST) / (KEFE_BOY - KIRP_UST)) * 100;
const cokgen = (n: [number, number][]) => `polygon(${n.map(([x, y]) => `${yuzdeX(x).toFixed(2)}% ${yuzdeY(y).toFixed(2)}%`).join(',')})`;
export const ARKA_KIRP = cokgen([
  [0, 322],
  [18, 307],
  [60, 293],
  [150, 277],
  [316, 262],
  [480, 277],
  [572, 293],
  [613, 307],
  [631, 322],
  [631, KEFE_BOY],
  [0, KEFE_BOY],
]);
/** Ön dudak: kenarın ön yüzü ve gövde; leğenin içindeki meyvelerin altı bunun arkasında kalır */
export const ON_KIRP = cokgen([
  [0, 324],
  [12, 330],
  [40, 340],
  [107, 353],
  [200, 364],
  [316, 370],
  [432, 364],
  [525, 353],
  [591, 340],
  [619, 330],
  [631, 324],
  [631, KEFE_BOY],
  [0, KEFE_BOY],
]);

/**
 * Görünmez yan duvarlar kenardan bu kadar içeride dik yükselir; kenardan oraya kısa, içe eğik bir rampa (DUDAK_UST
 * yükseklikte) iner. Dudağın üstüne düşen meyve rampadan içeri yuvarlanır: kenarda / sepetin önünde havada durmaz.
 */
export const DUDAK_IC = 6;
const DUDAK_UST = 8;
/** Meyvenin merkezi bu x'lerin arasında kalır (yarıçap kadar içeride): bırakma ve geri koyma sınırları */
export const IC_SOL = LEGEN_KESIT[0][0] + DUDAK_IC;
export const IC_SAG = LEGEN_KESIT[LEGEN_KESIT.length - 1][0] - DUDAK_IC;

/** Leğenin fizik dünyası: iç kesit, kenarlarda içe eğik kısa rampa ve üstünde dik görünmez duvar */
export function legenDunyasi(): Dunya {
  const d = new Dunya();
  const k = LEGEN_KESIT;
  const [sx, sy] = k[0];
  const [ex, ey] = k[k.length - 1];
  d.cizgi([[IC_SOL, -110], [IC_SOL, sy - DUDAK_UST], [sx, sy], ...k.slice(1, -1), [ex, ey], [IC_SAG, ey - DUDAK_UST], [IC_SAG, -110]]);
  return d;
}
