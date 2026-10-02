/**
 * Görsel efektler (yalnız transform / opacity, WAAPI): parıltı, bir şeyin kavisle uçması, nazik sallanma, zıplama.
 * Efekt katmanı ekranın üstünde, dokunuşları geçirir; koordinatlar ekran köküne göre (px).
 */
import { h, sure, TEST_MODU } from '../../src/ui/dom';

export const AZ_HAREKET = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const sakin = () => AZ_HAREKET || TEST_MODU;
const ras = (a: number, b: number) => a + Math.random() * (b - a);

export class Efekt {
  readonly el = h('div.ok-efekt', { 'aria-hidden': 'true' });
  constructor(private kok: HTMLElement) {}

  /** Bir elemanın noktası (efekt katmanına göre); ox, oy: elemanın içinde oran */
  merkez(e: Element, ox = 0.5, oy = 0.5): [number, number] {
    const a = e.getBoundingClientRect();
    const k = this.kok.getBoundingClientRect();
    return [a.left - k.left + a.width * ox, a.top - k.top + a.height * oy];
  }

  /** Dört köşeli parıltılar dışa uçar */
  parilti(x: number, y: number, adet = 8, boy = 1) {
    if (sakin()) return;
    for (let i = 0; i < adet; i++) {
      const a = (i / adet) * Math.PI * 2 + ras(-0.4, 0.4);
      const r = ras(40, 80) * boy;
      const p = h('i.ok-parilti', { style: `left:${x}px;top:${y}px` });
      this.el.append(p);
      p.animate(
        [
          { transform: 'translate(-50%, -50%) scale(0) rotate(0deg)', opacity: 1 },
          { transform: `translate(-50%, -50%) translate(${(Math.cos(a) * r * 0.7).toFixed(0)}px, ${(Math.sin(a) * r * 0.7).toFixed(0)}px) scale(1) rotate(90deg)`, opacity: 1, offset: 0.5 },
          { transform: `translate(-50%, -50%) translate(${(Math.cos(a) * r).toFixed(0)}px, ${(Math.sin(a) * r + 10).toFixed(0)}px) scale(0) rotate(180deg)`, opacity: 0 },
        ],
        { duration: 700 + i * 30, easing: 'ease-out' },
      ).finished.then(() => p.remove(), () => p.remove());
    }
  }

  /** Bir elemanın kopyasını (ya da içeriği) bir noktadan ötekine kavisle uçurur; bitince kaldırılır */
  async ucur(icerik: HTMLElement, [x0, y0]: [number, number], [x1, y1]: [number, number], o: { ms?: number; kavis?: number; boy0?: number; boy1?: number; gecikme?: number; don?: number } = {}) {
    const { ms = 560, kavis = -60, boy0 = 1, boy1 = 1, gecikme = 0, don = 0 } = o;
    const kap = h('div.ok-ucan', { style: `left:${x0}px;top:${y0}px` }, icerik);
    this.el.append(kap);
    const dx = x1 - x0;
    const dy = y1 - y0;
    const a = kap.animate(
      [
        { transform: `translate(-50%, -50%) scale(${boy0})` },
        { transform: `translate(-50%, -50%) translate(${dx * 0.5}px, ${dy * 0.5 + kavis}px) scale(${(boy0 + boy1) / 2 + 0.1}) rotate(${don / 2}deg)`, offset: 0.5 },
        { transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${boy1}) rotate(${don}deg)` },
      ],
      { duration: sure(ms), delay: sure(gecikme), easing: 'cubic-bezier(.45,.05,.4,1)', fill: 'both' },
    );
    await a.finished.catch(() => undefined);
    kap.remove();
  }
}

/** Sınıfı yeniden ekleyerek CSS animasyonunu baştan oynatır (zıpla, salla …) */
export function oynat(e: Element | null | undefined, sinif: string) {
  if (!e) return;
  e.classList.remove(sinif);
  void (e as HTMLElement).offsetWidth;
  e.classList.add(sinif);
}

/** Elemanı kavisle başka bir kaba taşır (FLIP): eski yerinden yenisine kayarak gider */
export function tasi(el: HTMLElement, kap: HTMLElement, ms = 380) {
  const once = el.getBoundingClientRect();
  el.style.transition = 'none';
  el.style.transform = '';
  kap.append(el);
  const sonra = el.getBoundingClientRect();
  const dx = once.left + once.width / 2 - (sonra.left + sonra.width / 2);
  const dy = once.top + once.height / 2 - (sonra.top + sonra.height / 2);
  if (sakin() || (!dx && !dy)) return;
  el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 30}px)`, offset: 0.5 }, { transform: 'none' }], { duration: sure(ms), easing: 'cubic-bezier(.3,.9,.4,1)' });
}
