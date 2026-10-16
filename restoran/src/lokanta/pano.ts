/**
 * Müşteri panosu (§4b keşif ödülü): bir müşterinin sevdiğini ilk kez bulunca o müşterinin fotoğrafı (polaroid)
 * mutfak panosuna asılır, üstüne o şeyin minik çıkartması yapışır. Ek sistem değil, duvarda bir resim.
 * Fotoğraf: müşterinin kendi çizimi (Gemini poz karesi > Seri 2 kuklası > Otobüs durağan resmi), bir kez çizilip
 * resme çevrilir (her polaroid için sürekli çizim yok).
 */
import { h } from '../../../src/ui/dom';
import { RENK } from '../mini/deneme';
import type { Malzeme } from '../mini/arayuz';
import { TARIFLER } from '../model';
import type { Yon } from '../olcek';
import { yemekResmi } from './istek-gorsel';
import { Kisi } from './kisi';

/** Pano kutusu (sahne yüzdesi) */
export const PANO_YER: Record<Yon, { x: number; y: number; w: number; h: number }> = {
  yatay: { x: 75, y: 9.5, w: 12, h: 14 },
  dikey: { x: 71, y: 1.5, w: 19, h: 8.5 },
};

const fotolar = new Map<string, Promise<string | null>>();

/** Müşterinin fotoğrafı (bir kez çizilir, önbellekte) */
function foto(ad: string, kap: HTMLElement): Promise<string | null> {
  let p = fotolar.get(ad);
  if (p) return p;
  p = (async () => {
    const k = new Kisi(ad);
    k.el.classList.add('rs-pano-cizim');
    kap.append(k.el);
    try {
      await k.hazir;
      await new Promise((r) => requestAnimationFrame(r));
      const c = k.govde.querySelector('canvas');
      if (c && c.width > 1) return c.toDataURL('image/webp', 0.9);
      const i = k.govde.querySelector('img');
      return i?.src || null;
    } catch {
      return null;
    } finally {
      k.kapat();
    }
  })();
  fotolar.set(ad, p);
  return p;
}

/** Çıkartma: malzemenin rengi, yemek resmi ya da yıldız */
function cikartma(sevdigi: string): HTMLElement {
  if (TARIFLER[sevdigi]) return h('span.rs-pano-cikartma', {}, yemekResmi(sevdigi));
  const r = RENK[sevdigi as Malzeme];
  return h('span.rs-pano-cikartma', { 'data-tur': r ? 'malzeme' : 'yildiz', style: r ? `--rs-renk:${r}` : undefined });
}

export function panoCiz(pano: HTMLElement, kayitPano: Record<string, string[]>, yeni?: string) {
  const adlar = Object.keys(kayitPano).filter((k) => kayitPano[k]?.length);
  pano.dataset.adet = String(adlar.length);
  const ic = pano.querySelector('.rs-pano-ic') ?? pano.appendChild(h('div.rs-pano-ic'));
  ic.replaceChildren();
  adlar.slice(-6).forEach((ad, i) => {
    const p = h('span.rs-polaroid', { 'data-musteri': ad, style: `--i:${i}` }, h('span.rs-polaroid-resim'), cikartma(kayitPano[ad][kayitPano[ad].length - 1]));
    if (ad === yeni) p.classList.add('rs-polaroid-yeni');
    ic.append(p);
    void foto(ad, pano).then((u) => {
      const r = p.querySelector('.rs-polaroid-resim') as HTMLElement;
      if (u) r.style.backgroundImage = `url("${u}")`;
    });
  });
}
