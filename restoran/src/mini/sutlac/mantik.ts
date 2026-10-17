/**
 * SÜTLAÇ · saf mantık (DOM yok, birim testli). ekip/senaryo/RESTORAN.md §8 M17 (v1.1).
 *
 * Tencerede süt + pirinç (+ şeker): kepçeyle karıştırdıkça koyulaşır (3-4: üç tur, 5-6: beş tur ve biraz da
 * pişme). Kâselere kepçe kepçe dökülür: tuttukça dolar (3-4 çizgide durur, 5-6 taşabilir: komik). Kâseler fırında
 * üstten kızarır (çiğ → az → altın → çıtır; kömür yok), tarçın serpilir.
 */
import type { Pisme, Yas, YemekOzelligi } from '../arayuz';

export const TUR_GEREK: Record<Yas, number> = { kucuk: 3, buyuk: 5 };
export const CIZGI = 0.85;
export const DOLUM_HIZ = 0.55; // saniyede (kepçe kâsenin üstünde tutulurken)
export const FIRIN_HIZ = 0.45; // saniyede

export interface Tencere {
  sut: number;
  pirinc: number;
  seker: number;
  /** karıştırma: 0-1 */
  kivam: number;
  /** kalan sütlaç (kâse doldurdukça azalır, 0-1) */
  kalan: number;
}
export interface Kase {
  dolum: number;
  tasti: boolean;
  /** fırın: 0 … 3.6 */
  p: number;
  tarcin: number;
}

export const bosTencere = (): Tencere => ({ sut: 0, pirinc: 0, seker: 0, kivam: 0, kalan: 1 });
export const bosKase = (): Kase => ({ dolum: 0, tasti: false, p: 0, tarcin: 0 });
export const icerikVar = (t: Tencere) => t.sut > 0 && t.pirinc > 0;

/** Karıştırma: yol (px) / tencere iç yarıçapı; bir tam tur ~ 2π yarıçap */
export function karistir(t: Tencere, yol: number, yaricap: number, yas: Yas): { koyulasti: boolean } {
  if (!icerikVar(t)) return { koyulasti: false };
  const once = t.kivam;
  const tur = yol / (Math.PI * 2 * Math.max(20, yaricap * 0.55));
  t.kivam = Math.min(1, t.kivam + tur / TUR_GEREK[yas]);
  return { koyulasti: once < 1 && t.kivam >= 1 };
}

/** Kepçe kâsenin üstünde sn saniye: dolar. 3-4 çizgide durur; 5-6 taşar. */
export function doldur(k: Kase, t: Tencere, sn: number, yas: Yas): { durdu: boolean; tasti: boolean } {
  if (t.kalan <= 0) return { durdu: true, tasti: false };
  const once = k.dolum;
  const ek = Math.min(t.kalan * 3, DOLUM_HIZ * sn);
  let yeni = once + ek;
  let durdu = false;
  if (yas === 'kucuk' && yeni >= CIZGI) {
    yeni = CIZGI;
    durdu = true;
  }
  k.dolum = Math.min(1.15, yeni);
  t.kalan = Math.max(0, t.kalan - (k.dolum - once) / 3);
  let tasti = false;
  if (k.dolum > 1 && !k.tasti) {
    k.tasti = true;
    tasti = true;
  }
  return { durdu, tasti };
}

export const pismeAdi = (p: number): Pisme => (p < 0.8 ? 'cig' : p < 2 ? 'az' : p < 3 ? 'altin' : 'citir');
export const firinda = (k: Kase, sn: number) => {
  if (k.dolum > 0) k.p = Math.min(3.6, k.p + sn * FIRIN_HIZ);
};

export function sutlacOzelligi(t: Tencere, ks: Kase[]): YemekOzelligi {
  const dolu = ks.filter((k) => k.dolum > 0.1);
  const o: YemekOzelligi = {
    malzemeler: {},
    sicak: false,
    tatli: Math.min(3, t.seker),
    karisim: +t.kivam.toFixed(2),
    dolum: dolu.length ? +(dolu.reduce((s, k) => s + Math.min(1, k.dolum), 0) / dolu.length).toFixed(2) : 0,
    porsiyon: dolu.length >= 3 || dolu.some((k) => k.tasti) ? 'kocaman' : 'normal',
  };
  if (t.sut) o.malzemeler.sut = { adet: t.sut };
  if (t.pirinc) o.malzemeler.pirinc = { adet: t.pirinc };
  if (t.seker) o.malzemeler.seker = { adet: t.seker };
  const tarcin = dolu.reduce((s, k) => s + k.tarcin, 0);
  if (tarcin) o.malzemeler.tarcin = { adet: tarcin };
  if (dolu.length) o.pisme = pismeAdi(Math.min(...dolu.map((k) => k.p)));
  return o;
}
