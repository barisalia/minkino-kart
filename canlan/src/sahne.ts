/** Canlanma sahnesi (deniz, gök, çayır…): kitap kalitesinde arka plan + hareketli süsler + açılan kâğıt + ışık hüzmesi. */
import { h } from '../../src/ui/dom';
import type { Resim } from './resimler';

export const SAHNE_RESIM = import.meta.glob<string>('../../assets/sahne/*.webp', { eager: true, query: '?url', import: 'default' });

/** Kâğıt tanesi (bir kez üretilir): sahnenin üstünde çok hafif, pastel resim hissi verir. */
let kagitUrl = '';
function kagitDokusu(): string {
  if (kagitUrl) return kagitUrl;
  try {
    const c = document.createElement('canvas');
    c.width = c.height = 160;
    const x = c.getContext('2d')!;
    const img = x.createImageData(160, 160);
    for (let i = 0; i < 160 * 160; i++) {
      const v = 200 + Math.random() * 55;
      img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    kagitUrl = c.toDataURL('image/png');
  } catch {
    kagitUrl = 'data:,';
  }
  return kagitUrl;
}

export function sahne(r: Resim): HTMLElement {
  const s = h(`div.cc-sahne.sahne-${r.sahne}`);
  s.style.setProperty('--kagit', `url("${kagitDokusu()}")`);
  const url = SAHNE_RESIM[`../../assets/sahne/${r.sahne}.webp`];
  if (url) {
    s.classList.add('resimli');
    s.style.setProperty('--sahne', `url("${url}")`);
    // kamera yaklaşırken arka plan ayrı katmanda büyür (derinlik)
    s.append(h('div.cc-sahne-arka'));
  }
  const sus = h('div.cc-sahne-sus', { 'aria-hidden': 'true' });
  const adet = { deniz: 7, okyanus: 0, gok: 3, cayir: 4, gece: 12, yol: 3, kar: 14 }[r.sahne];
  for (let i = 0; i < adet; i++) sus.append(h('i', { style: `--i:${i};--x:${(i * 37) % 100};--y:${(i * 53) % 100}` }));
  // canlanmadan önce kâğıt; canlanınca iki yana açılır, ortadan ışık hüzmesi çıkar
  s.append(sus, h('div.cc-kapak', { 'aria-hidden': 'true' }, h('i'), h('i')), h('div.cc-isik', { 'aria-hidden': 'true' }));
  return s;
}
