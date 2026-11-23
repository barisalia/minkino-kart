// Deneyler · Mucit Panosu (Paket Deney-Y2): fon pikseli (1672 × 941), Astra brief'iyle birebir (CLAUDE-ASTRA-MESAJLAR.md 22 Kasım akşamı).
import type { Kare } from './devre';

export const FON = { w: 1672, h: 941 } as const;
export type Kutu = { x: number; y: number; w: number; h: number };
/** Izgara: 7 × 4 kare, her biri 150 px; sol üst (310, 130). */
export const IZGARA = { x: 310, y: 130, kare: 150 } as const;
export const kareKutusu = (k: Kare, w = 1, h = 1): Kutu => ({ x: IZGARA.x + k.i * IZGARA.kare, y: IZGARA.y + k.j * IZGARA.kare, w: w * IZGARA.kare, h: h * IZGARA.kare });
export const kareOrtasi = (k: Kare) => ({ x: IZGARA.x + (k.i + 0.5) * IZGARA.kare, y: IZGARA.y + (k.j + 0.5) * IZGARA.kare });
/** Fon pikselinden kareye (ızgara dışıysa null). */
export function hangiKare(x: number, y: number): Kare | null {
  const i = Math.floor((x - IZGARA.x) / IZGARA.kare), j = Math.floor((y - IZGARA.y) / IZGARA.kare);
  return i >= 0 && i < 7 && j >= 0 && j < 4 ? { i, j } : null;
}
/** Tepsi (fonda): x 380…1290, y 780…910, üç bölme. */
export const TEPSI = { bolmeler: [{ x: 535, y: 845 }, { x: 835, y: 845 }, { x: 1135, y: 845 }], bolme: { w: 280, h: 120 }, dokunma: 160 } as const;
/** Karakterler panonun alt köşelerinde (ayakta, yarım boy). */
export const KINO_KUTU: Kutu = { x: 0, y: 421, w: 420, h: 520 };
export const CEREN_KUTU: Kutu = { x: 1252, y: 421, w: 420, h: 520 };
/** Su turu: depo 2 × 2 (0–1, 0–1), vana çıkış borusunun üstünde, çark 2 × 2 (5–6, 2–3). */
export const DEPO: Kutu = kareKutusu({ i: 0, j: 0 }, 2, 2);
export const VANA: Kutu = { x: IZGARA.x + 2 * IZGARA.kare - 95, y: IZGARA.y + 1.5 * IZGARA.kare - 115, w: 120, h: 120 };
export const CARK: Kutu = kareKutusu({ i: 5, j: 2 }, 2, 2);
/** Işık turu: pil 2 × 1 (0–1, 3), şalter (3,3), ampul 1 × 2 (5, 1–2), pervane gövdesi (6,2), kanat üstünde. */
export const PIL: Kutu = kareKutusu({ i: 0, j: 3 }, 2, 1);
export const SALTER: Kutu = kareKutusu({ i: 3, j: 3 });
export const AMPUL: Kutu = kareKutusu({ i: 5, j: 1 }, 1, 2);
export const PERVANE_GOVDE: Kutu = kareKutusu({ i: 6, j: 2 });
export const PERVANE_KANAT: Kutu = { x: IZGARA.x + 6.5 * IZGARA.kare - 80, y: IZGARA.y + 2 * IZGARA.kare + 30 - 80, w: 160, h: 160 };
