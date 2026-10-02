/**
 * Rakam şablonları (Rakamı çiz): 0..1 kare koordinatında, yazılış yönünde çizgiler (her çizgi ayrı parmak hareketi).
 * Çiz Canlansın'ın şablon biçimi (canlan/src/resimler.ts → Resim) kullanılır; puanlama ve şablona çekme oradan.
 * Yazılış: okul öncesi "çizgi çalışması" (yeşil noktadan başlar, okla yön gösterilir).
 */
import type { Nokta, Resim } from '../../canlan/src/resimler';
import { yay } from '../../canlan/src/resimler';

const C = (...n: Nokta[]) => n;

export const RAKAM_YOLU: Record<number, Nokta[][]> = {
  1: [C([0.36, 0.27], [0.56, 0.1], [0.56, 0.9])],
  2: [[...yay(0.5, 0.32, 0.2, 0.2, 200, 380, 24), [0.28, 0.9], [0.74, 0.9]]],
  3: [[...yay(0.5, 0.3, 0.18, 0.18, 210, 450, 22), ...yay(0.5, 0.69, 0.21, 0.21, 270, 520, 24)]],
  4: [C([0.62, 0.1], [0.24, 0.64], [0.78, 0.64]), C([0.62, 0.32], [0.62, 0.9])],
  5: [[[0.34, 0.1] as Nokta, [0.31, 0.46] as Nokta, ...yay(0.49, 0.66, 0.22, 0.22, 230, 510, 24)], C([0.34, 0.1], [0.72, 0.1])],
  6: [[[0.68, 0.12] as Nokta, [0.52, 0.19] as Nokta, [0.38, 0.33] as Nokta, [0.31, 0.5] as Nokta, ...yay(0.5, 0.68, 0.2, 0.2, 180, -180, 28)]],
  7: [C([0.26, 0.12], [0.74, 0.12], [0.42, 0.9])],
  8: [[...yay(0.5, 0.29, 0.18, 0.18, -90, -270, 16), ...yay(0.5, 0.69, 0.21, 0.21, -90, 270, 30), ...yay(0.5, 0.29, 0.18, 0.18, 90, -90, 16)]],
  9: [[...yay(0.48, 0.31, 0.19, 0.19, 0, -360, 28), [0.67, 0.31], [0.6, 0.9]]],
};

/** Rakamın Çiz Canlansın şablonu (puanla / toparla için) */
export function rakamResmi(n: number): Resim {
  return {
    id: `rakam-${n}`,
    ad: String(n),
    zorluk: 1,
    renk: '#3E9DF2',
    sahne: 'cayir',
    cizgiler: (RAKAM_YOLU[n] ?? []).map((cizgi, i) => ({ parca: `c${i}`, n: cizgi })),
    canlan: {},
  };
}

/** Çizgiyi SVG yoluna (0..100 kutu) çevirir */
export function yolD(n: Nokta[], ayna = false): string {
  return n.map((p, i) => `${i ? 'L' : 'M'}${((ayna ? 1 - p[0] : p[0]) * 100).toFixed(1)} ${(p[1] * 100).toFixed(1)}`).join(' ');
}

/** Çizgi kabul ölçütü: şablonun çoğunun üstünden geçilmiş ve çizgi şablona yakın (puan gösterilmez) */
export const KABUL = { kapsama: 0.72, isabet: 0.55 };

const K = '#6b3a1f';
/**
 * Rakam canlanınca üstüne gelen süs (0..100 kutu): 1 mum alevi, 2 kuğu, 3 kuş, 4 yelkenli, 6 salyangoz,
 * 8 kardan adam, 9 balon ipi; 5 ve 7 gözlerini açıp dans eder.
 */
export function canlanmaSusu(n: number): string {
  const goz = (x: number, y: number) => `<circle cx="${x}" cy="${y}" r="3.2" fill="${K}"/><circle cx="${x + 1}" cy="${y - 1}" r="1.1" fill="#fff"/>`;
  const gulus = (x: number, y: number) => `<path d="M${x - 5} ${y} q5 5 10 0" fill="none" stroke="${K}" stroke-width="2.4" stroke-linecap="round"/>`;
  switch (n) {
    case 1:
      return `<g class="ok-alev"><path d="M56 -6 C64 2 62 8 56 10 C50 8 48 2 56 -6z" fill="#FFC72C" stroke="${K}" stroke-width="2.4"/><path d="M56 0 C59 4 58 7 56 8 C54 7 53 4 56 0z" fill="#FF8A2B"/></g>${goz(52, 40)}${goz(61, 40)}${gulus(56, 48)}`;
    case 2:
      return `${goz(36, 22)}<path d="M30 26 l-9 3 l9 3z" fill="#FF9F1C" stroke="${K}" stroke-width="2"/><path d="M18 97 q8 -5 16 0 t16 0 t16 0 t16 0" fill="none" stroke="#3E9DF2" stroke-width="3" stroke-linecap="round"/>`;
    case 3:
      return `<ellipse cx="30" cy="50" rx="9" ry="7" fill="#FFC72C" stroke="${K}" stroke-width="2.4"/>${goz(29, 48)}<path d="M21 50 l-7 2 l7 3z" fill="#FF9F1C" stroke="${K}" stroke-width="2"/>`;
    case 4:
      return `<path d="M20 92 h62 l-8 9 h-46z" fill="#9A6A42" stroke="${K}" stroke-width="2.6" stroke-linejoin="round"/><path d="M12 104 q8 -5 16 0 t16 0 t16 0 t16 0 t16 0" fill="none" stroke="#3E9DF2" stroke-width="3" stroke-linecap="round"/>`;
    case 6:
      return `<path d="M26 88 h50 q8 0 8 -6" fill="none" stroke="#5DBE3F" stroke-width="7" stroke-linecap="round"/><path d="M80 82 l4 -10 M84 82 l8 -8" stroke="${K}" stroke-width="2.4" stroke-linecap="round"/>${goz(84, 72)}`;
    case 8:
      return `<path d="M36 6 h28 l-3 -14 h-22z M30 9 h40" fill="#4a3a33" stroke="${K}" stroke-width="2.4" stroke-linejoin="round"/>${goz(44, 24)}${goz(56, 24)}<path d="M50 30 l12 3 l-12 3z" fill="#FF8A2B" stroke="${K}" stroke-width="1.8"/><circle cx="50" cy="62" r="2.6" fill="${K}"/><circle cx="50" cy="72" r="2.6" fill="${K}"/><circle cx="50" cy="82" r="2.6" fill="${K}"/>`;
    case 9:
      return `${goz(43, 28)}${goz(53, 28)}${gulus(48, 35)}`;
    default:
      return `${goz(n === 5 ? 44 : 50, n === 5 ? 64 : 22)}${goz(n === 5 ? 54 : 60, n === 5 ? 64 : 22)}${gulus(n === 5 ? 49 : 55, n === 5 ? 72 : 30)}`;
  }
}
