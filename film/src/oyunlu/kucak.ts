/**
 * Anne Lokum'u kalçasında taşır (kit dışı poz yok: iki kukla birlikte). Lokum'un kalçası Anne'nin kit noktası
 * KUCAK'ta; Anne'nin sol üst kolu Lokum'un arkasında kalır, ön kolu ve eli Lokum'un altından önden sarar.
 */
import type { Matris } from '../kukla';
import type { Aktor, Durus } from './aktor';

export const KUCAK: [number, number] = [1310, 1880];

export function kucakDurusu(d: Durus) {
  d.kolSol = -2;
  d.dirsekSol = 25;
  d.elSol = 30;
}
/** Lokum'un bacakları kucakta hafif önde, sarkık */
export function lokumKucakta(d: Durus) {
  d.ayakSag = { x: 10, y: -30, egim: -10 };
  d.ayakSol = { x: -10, y: -30, egim: 10 };
}
/** Lokum'u Anne'nin kalçasına oturtur (Anne'nin duruşu yazıldıktan ve adim() sonrası) */
export function kucagaOtur(anne: Aktor, lokum: Aktor) {
  const p = anne.dunyaNoktasi('kalca', KUCAK);
  lokum.nokta = [650, 1320];
  lokum.o = anne.o;
  lokum.x = p[0];
  lokum.y = p[1];
}
export function kucakCiz(ctx: CanvasRenderingContext2D, M: Matris, anne: Aktor, lokum: Aktor, lokumFirca?: (ctx: CanvasRenderingContext2D, M: Matris) => void) {
  anne.ciz(ctx, M, { haric: ['kol-alt-sol', 'el-sol'] });
  lokum.ciz(ctx, M);
  lokumFirca?.(ctx, M);
  anne.ciz(ctx, M, { yalniz: ['kol-alt-sol', 'el-sol'] });
}
