/** Uyuyan Orman'ın altı bölgesi: her biri bir ses gücü öğretir. */
import O from '../../content/orman.json';
import type { Yas } from '../../src/engine/types';
import { ciftlikGorevleri } from './bolge-ciftlik';
import { davulGorevleri } from './bolge-davul';
import { devGorevleri } from './bolge-dev';
import { heceGorevleri } from './bolge-hece';
import { kusGorevleri } from './bolge-kus';
import { ruzgarGorevleri } from './bolge-ruzgar';
import type { GorevFabrika } from './gorev';
import type { HayvanSesi } from './sesler';

export type BolgeId = 'ruzgar' | 'kus' | 'ciftlik' | 'davul' | 'hece' | 'dev';

export interface Bolge {
  id: BolgeId;
  ad: string;
  giris: string;
  renk: string;
  /** bölgenin ev sahibi (uyuyan, sonunda uyanan) */
  ev: string;
  evSesi: HayvanSesi;
  /** haritadaki yeri (0..1) */
  konum: [number, number];
  gorevler(yas: Yas): GorevFabrika[];
}

const B = O.bolgeler;

export const BOLGELER: Bolge[] = [
  { id: 'ruzgar', ...B.ruzgar, renk: '#3E9DF2', ev: 'orman-karakter/sincap', evSesi: 'sincap', konum: [0.27, 0.84], gorevler: ruzgarGorevleri },
  { id: 'kus', ...B.kus, renk: '#5DBE3F', ev: 'hayvanlar/kus', evSesi: 'kus', konum: [0.73, 0.71], gorevler: kusGorevleri },
  { id: 'ciftlik', ...B.ciftlik, renk: '#F0413F', ev: 'hayvanlar/inek', evSesi: 'inek', konum: [0.27, 0.57], gorevler: ciftlikGorevleri },
  { id: 'davul', ...B.davul, renk: '#FF8A2B', ev: 'hayvanlar/maymun', evSesi: 'maymun', konum: [0.73, 0.44], gorevler: davulGorevleri },
  { id: 'hece', ...B.hece, renk: '#9B5CE0', ev: 'orman-karakter/baykus', evSesi: 'baykus', konum: [0.27, 0.31], gorevler: heceGorevleri },
  { id: 'dev', ...B.dev, renk: '#2E6FB8', ev: 'orman-karakter/dev', evSesi: 'horlama', konum: [0.72, 0.18], gorevler: devGorevleri },
];

export const bolge = (id: string) => BOLGELER.find((b) => b.id === id);
