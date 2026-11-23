/**
 * Polly's Riddles ve Odd One Out'un o çocuğa göre planı: yalnız kelime derslerini (Seviye 1) bitirdiği adaların ve
 * çizimi gelmiş kelimelerin. Taslak ve test kipinde bütün adalar. Oyunlar ekranı (kart açık mı) ve ders ekranı kullanır.
 */
import { TEST_MODU } from '../../../src/ui/dom';
import { TUM_DERSLER, UNITELER, kelimeBul } from '../icerik';
import { dersBittiMi, type Kayit } from '../ilerleme';
import type { Yas } from '../plan';
import { dersHazir, kelimeAcik, TASLAK } from '../varlik';
import type { AdaOyunu } from './ada-oyunlari-veri';
import { bilmecePlani, farkliPlani } from './bilmece-veri';
import { oncekiBilmeceler } from './bilmece';

/** Kelime dersleri biten adalar */
export function bitenAdalar(k: Kayit): Set<string> {
  if (TASLAK || TEST_MODU) return new Set(UNITELER.map((u) => u.id));
  return new Set(UNITELER.filter((u) => {
    const dersler = TUM_DERSLER.filter((d) => d.unite === u && d.seviye === 1 && dersHazir(u, d.no));
    return dersler.length > 0 && dersler.every((d) => dersBittiMi(k, d.id));
  }).map((u) => u.id));
}
const acik = (id: string) => { const w = kelimeBul(id); return !!w && (TASLAK || TEST_MODU || kelimeAcik(w)); };

/** Dört bilmece kurulabiliyorsa oyun (4 ve 5+); yoksa null (kart kilitli) */
export function bilmeceOyunu(k: Kayit, yas: Yas): AdaOyunu | null {
  const turlar = bilmecePlani(bitenAdalar(k), oncekiBilmeceler(), yas, Math.random, acik);
  return turlar.length >= 4 ? { ad: 'bilmece', turlar } : null;
}
/** Dört tur kurulabiliyorsa oyun; yoksa null */
export function farkliOyunu(k: Kayit, yas: Yas): AdaOyunu | null {
  const turlar = farkliPlani(bitenAdalar(k), yas, Math.random, acik);
  return turlar.length >= 4 ? { ad: 'farkli', turlar } : null;
}
