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
    '../../../assets/renkler/{top,balon,gunes,hediye}.webp',
    '../../../assets/film/esya/hediye-kutusu.webp',
    '../../../assets/dedektif/lamba-dik.webp',
  ],
  { eager: true, query: '?url', import: 'default' },
);
const ROZET = import.meta.glob<string>('../../../assets/okul/rozet-ses.webp', { eager: true, query: '?url', import: 'default' });
/** Çizilmiş çıkartmalar (assets/okul/odul/<ad>.webp): gelince kendiliğinden kullanılır */
const ODUL = import.meta.glob<string>('../../../assets/okul/odul/*.webp', { eager: true, query: '?url', import: 'default' });
/** Odanın çizilmiş çıkartması: önce <etkinlik id> (ses-a), sonra ses-<kahraman>, sonra <kahraman>; yoksa '' */
export const odulAdres = (odaId: string, kahraman: string): string =>
  [odaId, `ses-${kahraman}`, kahraman].map((ad) => ODUL[`../../../assets/okul/odul/${ad}.webp`]).find(Boolean) ?? '';

/** Kelimenin görsel adresi ('' = yok, yer tutucu) */
export function resimAdres(k: string): string {
  const yuva = YUVA[`../../../assets/okul/ses/${k}.webp`];
  if (yuva) return yuva;
  const yol = HAZIR_RESIM[k];
  return (yol && HAZIR[`../../../assets/${yol}.webp`]) || '';
}

/** Sahne eşyası (assets/<yol>.webp): hediye kutuları vb. */
export const esyaAdres = (yol: string): string => HAZIR[`../../../assets/${yol}.webp`] ?? '';

/** Kelimenin resmi (img) ya da yer tutucu kart */
export function resimEl(k: string, renk = '#9B5CE0'): HTMLElement {
  const adres = resimAdres(k);
  if (adres) return h('img.ok-ses-img', { src: adres, alt: '', draggable: 'false' });
  return h('span.ok-ses-yer', { style: `--r:${renk}`, 'data-yer-tutucu': k }, h('b', {}, ilkHarf(k)), h('small', {}, kelime(k).ad.toLocaleLowerCase('tr')));
}

/**
 * Odanın kahramanı (A: arı, N: nar, E: elma, T: tavşan, İ: inek, L: leylek): assets/okul/ses/<kahraman>.webp ve pozları
 * <kahraman>-<poz>.webp (ucan / zipla / mo, mutlu). Pozlar aynı tuvalde aynı ölçekte; poz çizimi yoksa duruş resmi.
 * Kahraman odaya gelir, sevinir, izlenen harf ona dönüşür.
 */
export type Poz = string;
const yuvaAdres = (k: string) => YUVA[`../../../assets/okul/ses/${k}.webp`] ?? '';
export const pozVar = (k: string, poz: Poz) => !!poz && !!yuvaAdres(`${k}-${poz}`);
export const pozAdres = (k: string, poz: Poz = ''): string => (pozVar(k, poz) && yuvaAdres(`${k}-${poz}`)) || yuvaAdres(k) || resimAdres(k);

export function kahramanEl(k: string, renk: string, poz: Poz = ''): HTMLElement {
  const adres = pozAdres(k, poz);
  const ic = adres ? h('img.ok-ses-img', { src: adres, alt: '', draggable: 'false' }) : resimEl(k, renk);
  return h('span.ok-ses-kahraman', { 'data-kelime': k, 'data-poz': pozVar(k, poz) ? poz : 'dur' }, ic);
}

/**
 * Kahramanın pozunu değiştirir (ms sonra eski pozuna döner). Sert kesme yok: önce ezilir, resim ezilmenin en dibinde
 * değişir, sonra esneyip toparlanır.
 */
export function pozla(el: HTMLElement, poz: Poz, ms = 0) {
  const k = el.dataset.kelime ?? '';
  const img = el.querySelector('img');
  const once = el.dataset.poz === 'dur' ? '' : (el.dataset.poz ?? '');
  const yeni = pozVar(k, poz) ? poz : 'dur';
  if (yeni === el.dataset.poz && !ms) return;
  el.dataset.poz = yeni;
  el.classList.remove('ok-ses-poz');
  void el.offsetWidth;
  el.classList.add('ok-ses-poz');
  const zaman = Number(el.dataset.pozZaman ?? 0);
  if (zaman) clearTimeout(zaman);
  window.setTimeout(() => {
    if (img && el.dataset.poz === yeni) img.src = pozAdres(k, poz);
  }, 130);
  if (ms > 0) el.dataset.pozZaman = String(window.setTimeout(() => el.isConnected && pozla(el, once), ms));
}

/** Kule odasının arka planı (assets/okul/ses/kule-kat.webp; her harf odasının zemini) */
export const kuleKatAdres = (): string => YUVA['../../../assets/okul/ses/kule-kat.webp'] ?? '';

/** "Ses Dedektifi" rozetinin çizimi (assets/okul/rozet-ses.webp) varsa adresi */
export const rozetSesAdres = (): string => ROZET['../../../assets/okul/rozet-ses.webp'] ?? '';
