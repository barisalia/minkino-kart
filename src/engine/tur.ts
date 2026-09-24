import { karistir } from '../ui/dom';
import { sorular } from './katalog';
import { TUR_SORU_SAYISI } from './kurallar';
import { dogruIndeks } from './soru';
import type { Soru, Yas } from './types';

/** Seçeneklerin yerini karıştırır; `dogru` yeni sıra numarası olur. */
export function soruHazirla(s: Soru, rnd: () => number = Math.random): Soru {
  if (s.tip === 'HAFIZA') return { ...s };
  const d = dogruIndeks(s);
  const sira = karistir(s.kartlar.map((_, i) => i), rnd);
  return { ...s, kartlar: sira.map((i) => s.kartlar[i]), dogru: sira.indexOf(d) };
}

/**
 * Bir tur için 8 soru seçer: çeşitli tipler, en çok 1 HAFIZA,
 * aynı tip arka arkaya gelmemeye çalışır, HAFIZA ilk soru olmaz.
 */
export function turOlustur(yas: Yas, tema: string, rnd: () => number = Math.random, adet = TUR_SORU_SAYISI): Soru[] {
  const havuz = karistir(sorular(yas, tema), rnd);
  if (havuz.length === 0) return [];
  const secilen: Soru[] = [];
  let hafiza = 0;
  const kalan = havuz.filter((s) => {
    if (s.tip !== 'HAFIZA') return true;
    if (hafiza++ < 1) return true;
    return false;
  });
  while (secilen.length < adet && kalan.length) {
    const son = secilen[secilen.length - 1]?.tip;
    let i = kalan.findIndex((s) => s.tip !== son && !(secilen.length === 0 && s.tip === 'HAFIZA'));
    if (i < 0) i = 0;
    secilen.push(kalan.splice(i, 1)[0]);
  }
  // Havuz küçükse baştan tekrar doldur
  let j = 0;
  while (secilen.length < adet) secilen.push(havuz[j++ % havuz.length]);
  return secilen.map((s) => soruHazirla(s, rnd));
}
