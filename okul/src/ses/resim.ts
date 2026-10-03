/**
 * Ses Kulesi resimleri: kelime → görsel. Önce assets/okul/ses/<kelime>.webp (Gemini çizince kendiliğinden gelir),
 * yoksa depodaki hazır çizim (harfler.ts → HAZIR_RESIM), o da yoksa yumuşak yer tutucu kart (kelimenin ilk harfi).
 * Eşyalar kodla çizilmez; yer tutucu yalnız çizim gelene kadar.
 */
import { h } from '../../../src/ui/dom';
import { HAZIR_RESIM, ilkHarf, kelime } from './harfler';

const YUVA = import.meta.glob<string>('../../../assets/okul/ses/*.webp', { eager: true, query: '?url', import: 'default' });
const HAZIR = import.meta.glob<string>(
  [
    '../../../assets/hayvanlar/*.webp',
    '../../../assets/meyveler/*.webp',
    '../../../assets/tasitlar/*.webp',
    '../../../assets/canlan/{ev,yildiz}.webp',
    '../../../assets/renkler/{top,balon,gunes}.webp',
    '../../../assets/dedektif/lamba-dik.webp',
  ],
  { eager: true, query: '?url', import: 'default' },
);
const ROZET = import.meta.glob<string>('../../../assets/okul/rozet-ses.webp', { eager: true, query: '?url', import: 'default' });

/** Kelimenin görsel adresi ('' = yok, yer tutucu) */
export function resimAdres(k: string): string {
  const yuva = YUVA[`../../../assets/okul/ses/${k}.webp`];
  if (yuva) return yuva;
  const yol = HAZIR_RESIM[k];
  return (yol && HAZIR[`../../../assets/${yol}.webp`]) || '';
}

/** Kelimenin resmi (img) ya da yer tutucu kart */
export function resimEl(k: string, renk = '#9B5CE0'): HTMLElement {
  const adres = resimAdres(k);
  if (adres) return h('img.ok-ses-img', { src: adres, alt: '', draggable: 'false' });
  return h('span.ok-ses-yer', { style: `--r:${renk}`, 'data-yer-tutucu': k }, h('b', {}, ilkHarf(k)), h('small', {}, kelime(k).ad.toLocaleLowerCase('tr')));
}

/**
 * Odanın kahramanı (A odasında arı): pozlar assets/okul/ses/<kelime>-<poz>.webp (ucan, mutlu); poz çizimi yoksa
 * kelimenin kendi resmi. Kahraman odada uçar, harfe konar, izlenen harf ona dönüşür.
 */
export type Poz = '' | 'ucan' | 'mutlu';
export const pozAdres = (k: string, poz: Poz = ''): string => (poz && YUVA[`../../../assets/okul/ses/${k}-${poz}.webp`]) || resimAdres(k);
export const pozVar = (k: string, poz: Exclude<Poz, ''>) => !!YUVA[`../../../assets/okul/ses/${k}-${poz}.webp`];

export function kahramanEl(k: string, renk: string, poz: Poz = ''): HTMLElement {
  const adres = pozAdres(k, poz);
  const ic = adres ? h('img.ok-ses-img', { src: adres, alt: '', draggable: 'false' }) : resimEl(k, renk);
  return h('span.ok-ses-kahraman', { 'data-kelime': k, 'data-poz': poz || 'dur' }, ic);
}

/** Kahramanın pozunu değiştirir (ms sonra eski pozuna döner); squash ile geçiş */
export function pozla(el: HTMLElement, poz: Poz, ms = 0) {
  const k = el.dataset.kelime ?? '';
  const img = el.querySelector('img');
  const once = (el.dataset.poz === 'dur' ? '' : el.dataset.poz) as Poz;
  if (img && pozAdres(k, poz)) img.src = pozAdres(k, poz);
  el.dataset.poz = poz || 'dur';
  el.classList.remove('ok-ses-poz');
  void el.offsetWidth;
  el.classList.add('ok-ses-poz');
  if (ms > 0) window.setTimeout(() => el.isConnected && pozla(el, once), ms);
}

/** "Ses Dedektifi" rozetinin çizimi (assets/okul/rozet-ses.webp) varsa adresi */
export const rozetSesAdres = (): string => ROZET['../../../assets/okul/rozet-ses.webp'] ?? '';
