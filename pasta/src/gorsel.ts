/**
 * Pasta otobüsünün görsel efektleri (yalnız transform / opacity, WAAPI): "pof" bulutu, parıltı, uçan kalpler,
 * bir şeyin kavisle bir yerden bir yere uçması (jeton → kasa, tepsi → fırın). Park arka planı adresleri.
 */
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { KALP } from './cizim';

export const AZ_HAREKET = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const sakin = () => AZ_HAREKET || TEST_MODU;
const ras = (a: number, b: number) => a + Math.random() * (b - a);

const PARK = import.meta.glob<string>('../../assets/film/park/*.webp', { eager: true, query: '?url', import: 'default' });
/** Park katmanının adresi (assets/film/park/<ad>.webp) */
export const parkAdres = (ad: string) => PARK[`../../assets/film/park/${ad}.webp`] ?? '';

/** Efekt katmanı: ekranın üstünde, dokunuşları geçirir. Koordinatlar ekran köküne göre (px). */
export class Efekt {
  readonly el = h('div.ps-efekt', { 'aria-hidden': 'true' });
  constructor(private kok: HTMLElement) {}

  /** Bir elemanın merkezi (efekt katmanına göre) */
  merkez(e: Element, ox = 0.5, oy = 0.5): [number, number] {
    const a = e.getBoundingClientRect();
    const k = this.kok.getBoundingClientRect();
    return [a.left - k.left + a.width * ox, a.top - k.top + a.height * oy];
  }

  /** "Pof": yumuşak beyaz bulut topları açılıp söner, araya parıltı */
  pof(x: number, y: number, boy = 1, renk = '#fff') {
    if (sakin()) return;
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + ras(-0.3, 0.3);
      const r = ras(24, 40) * boy;
      const p = h('i.ps-pof', { style: `left:${x}px;top:${y}px;width:${(ras(22, 34) * boy).toFixed(0)}px;background:${renk}` });
      this.el.append(p);
      p.animate(
        [
          { transform: 'translate(-50%, -50%) scale(.3)', opacity: 0.95 },
          { transform: `translate(-50%, -50%) translate(${(Math.cos(a) * r).toFixed(0)}px, ${(Math.sin(a) * r - 6).toFixed(0)}px) scale(1.15)`, opacity: 0.9, offset: 0.55 },
          { transform: `translate(-50%, -50%) translate(${(Math.cos(a) * r * 1.25).toFixed(0)}px, ${(Math.sin(a) * r * 1.25 - 14).toFixed(0)}px) scale(.6)`, opacity: 0 },
        ],
        { duration: 520, easing: 'cubic-bezier(.2,.8,.3,1)' },
      ).finished.then(() => p.remove(), () => p.remove());
    }
    this.parilti(x, y, 5, 0.7 * boy);
  }

  /** Dört köşeli parıltılar dışa uçar */
  parilti(x: number, y: number, adet = 8, boy = 1) {
    if (sakin()) return;
    for (let i = 0; i < adet; i++) {
      const a = (i / adet) * Math.PI * 2 + ras(-0.4, 0.4);
      const r = ras(40, 80) * boy;
      const p = h('i.ps-parilti', { style: `left:${x}px;top:${y}px` });
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

  /** Beğeni: kalpler yükselip söner */
  kalpler(x: number, y: number, adet = 5) {
    if (sakin()) return;
    for (let i = 0; i < adet; i++) {
      const k = h('i.ps-kalp', { html: KALP, style: `left:${x + ras(-30, 30)}px;top:${y}px` });
      this.el.append(k);
      const dx = ras(-40, 40);
      k.animate(
        [
          { transform: 'translate(-50%, -50%) scale(.2)', opacity: 0 },
          { transform: `translate(-50%, -50%) translate(${dx * 0.4}px, -30px) scale(1.15)`, opacity: 1, offset: 0.25 },
          { transform: `translate(-50%, -50%) translate(${dx}px, -110px) scale(.9) rotate(${dx / 3}deg)`, opacity: 0 },
        ],
        { duration: 1300, delay: i * 120, easing: 'ease-out', fill: 'backwards' },
      ).finished.then(() => k.remove(), () => k.remove());
    }
  }

  /** Minik duman (yanık): gri bulutlar yükselir */
  duman(x: number, y: number) {
    if (sakin()) return;
    for (let i = 0; i < 4; i++) {
      const p = h('i.ps-duman', { style: `left:${x + ras(-14, 14)}px;top:${y}px` });
      this.el.append(p);
      p.animate(
        [
          { transform: 'translate(-50%, -50%) scale(.3)', opacity: 0 },
          { transform: `translate(-50%, -50%) translate(${ras(-10, 10)}px, -30px) scale(1)`, opacity: 0.75, offset: 0.35 },
          { transform: `translate(-50%, -50%) translate(${ras(-24, 24)}px, -80px) scale(1.6)`, opacity: 0 },
        ],
        { duration: 1400, delay: i * 220, easing: 'ease-out', fill: 'backwards' },
      ).finished.then(() => p.remove(), () => p.remove());
    }
  }

  /**
   * Bir görüntüyü (eleman ya da kopyası) bir noktadan ötekine kavisle uçurur; boy: başta ve sonda ölçek.
   * Uçan eleman efekt katmanında; bitince kaldırılır.
   */
  async ucur(icerik: HTMLElement, [x0, y0]: [number, number], [x1, y1]: [number, number], o: { ms?: number; kavis?: number; boy0?: number; boy1?: number; gecikme?: number; don?: number } = {}) {
    const { ms = 560, kavis = -60, boy0 = 1, boy1 = 1, gecikme = 0, don = 0 } = o;
    const kap = h('div.ps-ucan', { style: `left:${x0}px;top:${y0}px` }, icerik);
    this.el.append(kap);
    const dx = x1 - x0;
    const dy = y1 - y0;
    const a = kap.animate(
      [
        { transform: `translate(-50%, -50%) scale(${boy0})` },
        { transform: `translate(-50%, -50%) translate(${dx * 0.5}px, ${dy * 0.5 + kavis}px) scale(${(boy0 + boy1) / 2 + 0.12}) rotate(${don / 2}deg)`, offset: 0.5 },
        { transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${boy1}) rotate(${don}deg)` },
      ],
      { duration: sure(ms), delay: sure(gecikme), easing: 'cubic-bezier(.45,.05,.4,1)', fill: 'both' },
    );
    await a.finished.catch(() => undefined);
    kap.remove();
  }
}

/** Sınıfı yeniden ekleyerek CSS animasyonunu baştan oynatır (zıpla, salla …) */
export function salla(e: Element | null | undefined, sinif = 'ps-salla') {
  if (!e) return;
  e.classList.remove(sinif);
  void (e as HTMLElement).offsetWidth;
  e.classList.add(sinif);
}
