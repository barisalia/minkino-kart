/**
 * Sahne arka planı ve kamera sınırı (oyunlu bölüm ve veriyle sürülen bölüm hattı ortak kullanır: bolum1.ts,
 * film/src/film2/sahne.ts). Dünya = arka planın pikseli.
 */
import type { Matris } from '../kukla';
import type { Kamera, Ortam } from './oynatici';

export const resim = async (a: string) => {
  const i = new Image();
  i.src = a;
  await i.decode();
  return i;
};

export interface Mekan {
  img: HTMLImageElement;
  /** dikey kadrajda resmin üstü / altı bu satır bantlarının tekrarıyla sürer (sahnenin devamı, siyah değil) */
  ust: [number, number];
  alt: [number, number];
}
export function arkaCiz(o: Ortam, m: Mekan, kam: Matris) {
  const { ctx, dpr, H } = o;
  ctx.setTransform(kam[0] * dpr, 0, 0, kam[3] * dpr, kam[4] * dpr, kam[5] * dpr);
  const s = kam[3];
  const ymin = -kam[5] / s, ymax = (H - kam[5]) / s;
  const W = m.img.width, Y = m.img.height;
  if (ymin < 0) {
    const [a, b] = m.ust, P = b - a;
    for (let y = a - P; y + P > ymin; y -= P) ctx.drawImage(m.img, 0, a, W, P, 0, y, W, P + 1);
  }
  if (ymax > Y) {
    const [a, b] = m.alt, P = b - a;
    for (let y = a + P; y < ymax; y += P) ctx.drawImage(m.img, 0, a, W, P, 0, y - 1, W, P + 1);
  }
  ctx.drawImage(m.img, 0, 0);
}
/** yatayda kamera resmin dışına taşmaz; dikeyde yalnız yatay sınır */
export function sinirliKamera(k: Kamera, o: Ortam, img: { width: number; height: number }): Kamera {
  const g = Math.min(k.g, img.width);
  const gy = (g * o.H) / o.W;
  const x = Math.max(g / 2, Math.min(img.width - g / 2, k.x));
  const y = o.dikey || gy > img.height ? k.y : Math.max(gy / 2, Math.min(img.height - gy / 2, k.y));
  return { x, y, g };
}
export const dprli = (m: Matris, dpr: number): Matris => [m[0] * dpr, m[1] * dpr, m[2] * dpr, m[3] * dpr, m[4] * dpr, m[5] * dpr];
