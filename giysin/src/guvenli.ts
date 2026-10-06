/**
 * Telefonun güvenli alanı (çentik, yuvarlak köşe, ana ekran çubuğu): env(safe-area-inset-*) px olarak.
 * Yerleşim JS'te olduğu için CSS değerleri gizli bir ölçü kutusundan okunur. Deneme / test için
 * ?guvenli=ust,sag,alt,sol (px) çentikli telefonu taklit eder (CSS değişkenleri --gy-g-*).
 */
import { h } from '../../src/ui/dom';

export interface Guvenli {
  ust: number;
  sag: number;
  alt: number;
  sol: number;
}

/** Test / önizleme için sabit güvenli alan (kök elemana CSS değişkeni olarak) */
export function guvenliTaklit(kok: HTMLElement) {
  const q = new URLSearchParams(location.search).get('guvenli');
  if (!q) return;
  const [ust, sag, alt, sol] = q.split(',').map((v) => `${Number(v) || 0}px`);
  kok.style.setProperty('--gy-g-ust', ust);
  kok.style.setProperty('--gy-g-sag', sag);
  kok.style.setProperty('--gy-g-alt', alt);
  kok.style.setProperty('--gy-g-sol', sol);
}

/** Ekranın güvenli alan payları (px); ölçü kutusu ekranın içine bir kez eklenir */
export function guvenliOlc(el: HTMLElement): Guvenli {
  let o = el.querySelector<HTMLElement>(':scope > .gy-guvenli-olc');
  if (!o) {
    o = h('div.gy-guvenli-olc', { 'aria-hidden': 'true' });
    el.append(o);
  }
  const r = el.getBoundingClientRect(), g = o.getBoundingClientRect();
  if (!r.width || !g.width) return { ust: 0, sag: 0, alt: 0, sol: 0 };
  return { ust: g.top - r.top, sag: r.right - g.right, alt: r.bottom - g.bottom, sol: g.left - r.left };
}
