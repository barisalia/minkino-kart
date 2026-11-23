/**
 * İfade resmi: bir cümlenin anlamını Astra'nın çizimleriyle gösterir (icerik2.ts → Gorsel).
 * Burada hiçbir şey çizilmez; kelime resimleri dizilir (üç ördek, büyük inek ve küçük inek, kedi ile köpek),
 * Kino yanına konur ya da o ifadeye özel çizim (renkli/…, yer/…, eylem/…, hikaye/…) gösterilir.
 * Kart zemini kodla çizilir (KULLANICI-KURALLARI · 16 Kasım 2026 "katmanlar").
 */
import { h } from '../../src/ui/dom';
import { kelimeBul } from './icerik';
import type { Gorsel, Ifade, Parca } from './icerik2';
import { cikartmaResmi } from './kit';
import { KINO_POZU, resim } from './varlik';

function cizimYaDaYer(yol: string, sinif: string): HTMLElement {
  const adres = resim(yol);
  const el = h(`span.${sinif}`);
  if (adres) el.append(h('img', { src: adres, alt: '', draggable: 'false' }));
  else el.append(h('span.ing-yer-tutucu', {}, yol.split('/').pop() ?? yol));
  return el;
}

/** Tarifin "nesne" kısmı: özel çizim ya da kelime resmi (adet kadar), yanında varsa ikinci kelime */
function nesne(g: Gorsel): HTMLElement {
  if (g.ozel) return cizimYaDaYer(g.ozel, 'ing-g-ozel');
  const kap = h('span.ing-g-nesne');
  const w = g.k ? kelimeBul(g.k) : undefined;
  const adet = Math.max(1, g.adet ?? 1);
  // kadrajı dolduran duran resim kullanılır (zıplama karesinde hayvan, zıplayacağı boşluk yüzünden küçük durur)
  if (w) for (let i = 0; i < adet; i++) kap.append(cikartmaResmi(w));
  const ikinci = g.ile ? kelimeBul(g.ile) : undefined;
  if (ikinci) kap.append(cikartmaResmi(ikinci));
  kap.dataset.adet = String(adet + (ikinci ? 1 : 0));
  if (g.boy) kap.dataset.boy = g.boy;
  return kap;
}

export function gorselCiz(g: Gorsel, sinif = ''): HTMLElement {
  const el = h('span.ing-gorsel', { 'aria-hidden': 'true' });
  if (sinif) el.classList.add(...sinif.split(' ').filter(Boolean));
  if (g.kino) {
    el.dataset.kino = g.kino;
    const kino = cizimYaDaYer(KINO_POZU[g.kino], 'ing-g-kino');
    // elinde tutuyorsa nesne, Kino'nun gösterdiği kartın üstünde durur
    const yan = h(g.kino === 'tut' ? 'span.ing-g-yan.ing-g-kart' : 'span.ing-g-yan', {}, nesne(g));
    el.append(kino, yan);
  } else el.append(nesne(g));
  if (g.kalp) el.append(cizimYaDaYer('ui/soz-kalp', 'ing-g-kalp'));
  return el;
}

/** Cümle bandı: sözcükler ayrı ayrı durur ve cümle söylenirken sırayla yanar; altında küçük Türkçesi */
export function cumleBandi(f: Pick<Ifade, 'en' | 'tr' | 'id'>, sinif = ''): HTMLElement {
  const en = h('strong', { lang: 'en-US' });
  f.en.split(' ').forEach((sozcuk, i) => {
    if (i) en.append(h('span.ing-bosluk', {}, ' '));
    en.append(h('span', {}, sozcuk));
  });
  const el = h('div.ing-bant.ing-cumle-bandi', { 'data-ifade': f.id }, en, h('small', { lang: 'tr' }, f.tr));
  if (f.en.length > 22) el.classList.add('ing-uzun');
  if (sinif) el.classList.add(...sinif.split(' ').filter(Boolean));
  return el;
}

/** Cümle taşının içi: resim ya da simge (ikisi de yoksa yalnız yazı) + İngilizce yazı */
export function tasIcerigi(p: Parca): (Node | null)[] {
  const simge = p.simge ? resim(p.simge) : undefined;
  const ust = p.g ? gorselCiz(p.g, 'ing-tas-resim') : simge ? h('span.ing-tas-resim.ing-tas-simge', {}, h('img', { src: simge, alt: '', draggable: 'false' })) : null;
  return [ust, h('strong', { lang: 'en-US' }, p.en)];
}
