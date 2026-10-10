/**
 * Tart Bakalım leğeninin ölçüleri (DOM yok; fizik testleri de kullanır).
 *
 * Leğen: terazi kefesi çizimi (assets/pazar/terazi-kefe.webp, 631 × 497) zincirleri kırpılmış hâliyle. Kırpılan
 * kutu çizimin y = KIRP_UST … 497 arası; fizik birimi: kutunun eni 100 birim. Leğenin iç kesiti (yan görünüş) bu
 * birimlerle çoklu çizgi; iki yandan yukarı görünmez duvarlar (meyve atılınca dışarı kaçmasın).
 */
import { Dunya } from './fizik';

export const KEFE_EN = 631;
export const KEFE_BOY = 497;
/** zincirler bu çizginin üstünde kalır (kenarın üst çizgisi korunur) */
export const KIRP_UST = 268;
/** çizim pikselinden fizik birimine */
const B = 100 / KEFE_EN;
export const LEGEN_BOY = (KEFE_BOY - KIRP_UST) * B;
const nokta = (x: number, y: number): [number, number] => [x * B, (y - KIRP_UST) * B];

/** İç kesit (soldan sağa): kenar → eğim → düz dip → eğim → kenar */
export const LEGEN_KESIT: [number, number][] = [
  nokta(20, 328),
  nokta(55, 358),
  nokta(115, 388),
  nokta(190, 404),
  nokta(441, 404),
  nokta(516, 388),
  nokta(576, 358),
  nokta(611, 328),
];

/** Kenarın üstündeki çizim (zincir izi kalmasın): kırpma çokgeni, kırpılmış kutuya göre yüzde */
const yuzdeX = (x: number) => (x / KEFE_EN) * 100;
const yuzdeY = (y: number) => ((y - KIRP_UST) / (KEFE_BOY - KIRP_UST)) * 100;
const cokgen = (n: [number, number][]) => `polygon(${n.map(([x, y]) => `${yuzdeX(x).toFixed(2)}% ${yuzdeY(y).toFixed(2)}%`).join(',')})`;
export const ARKA_KIRP = cokgen([
  [0, 334],
  [18, 316],
  [60, 302],
  [150, 287],
  [316, 276],
  [480, 287],
  [572, 302],
  [613, 316],
  [631, 334],
  [631, 497],
  [0, 497],
]);
/** Ön dudak: kenarın ön yüzü ve gövde; leğenin içindeki meyvelerin altı bunun arkasında kalır */
export const ON_KIRP = cokgen([
  [0, 336],
  [10, 341],
  [40, 354],
  [100, 373],
  [200, 389],
  [316, 395],
  [432, 389],
  [531, 373],
  [591, 354],
  [621, 341],
  [631, 336],
  [631, 497],
  [0, 497],
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
