/**
 * Pasta otobüsünün görsel efektleri (yalnız transform / opacity, WAAPI): "pof" bulutu, parıltı, uçan kalpler,
 * bir şeyin kavisle bir yerden bir yere uçması (jeton → kasa, tepsi → fırın). Park arka planı adresleri.
 */
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { KALP } from './cizim';

export const AZ_HAREKET = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const sakin = () => AZ_HAREKET || TEST_MODU;
const ras = (a: number, b: number) => a + Math.random() * (b - a);

const MEKAN = import.meta.glob<string>(['../../assets/film/park/*.webp', '../../assets/film/plaj/*.webp', '../../assets/film/kar/*.webp'], { eager: true, query: '?url', import: 'default' });
/** Mekân katmanının adresi (assets/film/<park|plaj|kar>/<ad>.webp); yoksa parkınki */
export const parkAdres = (ad: string, mekan: 'park' | 'plaj' | 'kar' = 'park') => MEKAN[`../../assets/film/${mekan}/${ad}.webp`] ?? MEKAN[`../../assets/film/park/${ad}.webp`] ?? '';

/** Efekt katmanı: ekranın üstünde, dokunuşları geçirir. Koordinatlar ekran köküne göre (px). */
export class Efekt {
  readonly el = h('div.ps-efekt', { 'aria-hidden': 'true' });
  constructor(private kok: HTMLElement) {}

  /** Efekt katmanının kendi kutusu (ekrana yerleştiyse; geniş ekranda sahne ortalanır, kökle aynı yerde olmayabilir) */
  kutu(): DOMRect {
    return (this.el.isConnected ? this.el : this.kok).getBoundingClientRect();
  }
  /** Bir elemanın merkezi (efekt katmanına göre) */
  merkez(e: Element, ox = 0.5, oy = 0.5): [number, number] {
    const a = e.getBoundingClientRect();
    const k = this.kutu();
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
  /** Kocaman tek kalp: başın üstünde yaylanarak açılır, biraz durur, yukarı süzülüp söner (tam istediği gibiyse) */
  buyukKalp(x: number, y: number) {
    if (sakin()) return;
    const k = h('i.ps-buyuk-kalp', { html: KALP, style: `left:${x}px;top:${y}px` });
    this.el.append(k);
    k.animate(
      [
        { transform: 'translate(-50%, -50%) scale(.1)', opacity: 0 },
        { transform: 'translate(-50%, -60%) scale(1.25)', opacity: 1, offset: 0.18 },
        { transform: 'translate(-50%, -60%) scale(.95)', opacity: 1, offset: 0.3 },
        { transform: 'translate(-50%, -62%) scale(1.05)', opacity: 1, offset: 0.42 },
        { transform: 'translate(-50%, -64%) scale(1)', opacity: 1, offset: 0.7 },
        { transform: 'translate(-50%, -110%) scale(.8)', opacity: 0 },
      ],
      { duration: 1500, easing: 'ease-out' },
    ).finished.then(() => k.remove(), () => k.remove());
  }

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

  /** Konfeti: renkli kâğıtlar patlayıp dönerek düşer (doğru sipariş) */
  konfeti(x: number, y: number, adet = 22) {
    if (sakin()) return;
    const renkler = ['#FF5A7A', '#FFD84A', '#6CC4FF', '#7FE0C4', '#B98BFF', '#FF8A2B'];
    for (let i = 0; i < adet; i++) {
      const p = h('i.ps-konfeti', { style: `left:${x}px;top:${y}px;background:${renkler[i % renkler.length]}` });
      if (i % 3 === 0) p.style.borderRadius = '50%';
      this.el.append(p);
      const a = -Math.PI / 2 + ras(-1.2, 1.2);
      const r = ras(70, 150);
      const dx = Math.cos(a) * r;
      const dy = Math.sin(a) * r;
      p.animate(
        [
          { transform: 'translate(-50%, -50%) scale(.4) rotate(0deg)', opacity: 1 },
          { transform: `translate(-50%, -50%) translate(${dx.toFixed(0)}px, ${dy.toFixed(0)}px) scale(1) rotate(${ras(180, 360).toFixed(0)}deg)`, opacity: 1, offset: 0.35 },
          { transform: `translate(-50%, -50%) translate(${(dx * 1.3).toFixed(0)}px, ${(dy + 160).toFixed(0)}px) scale(.9) rotate(${ras(500, 900).toFixed(0)}deg)`, opacity: 0 },
        ],
        { duration: ras(1100, 1600), delay: ras(0, 120), easing: 'cubic-bezier(.2,.7,.4,1)', fill: 'backwards' },
      ).finished.then(() => p.remove(), () => p.remove());
    }
  }

  /** Kısa ışık patlaması (fırın "ding"): yumuşak sarı halka büyüyüp söner */
  isik(x: number, y: number, boy = 1) {
    if (sakin()) return;
    const p = h('i.ps-isik', { style: `left:${x}px;top:${y}px;width:${(150 * boy).toFixed(0)}px` });
    this.el.append(p);
    p.animate(
      [
        { transform: 'translate(-50%, -50%) scale(.2)', opacity: 0.95 },
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.8, offset: 0.35 },
        { transform: 'translate(-50%, -50%) scale(1.4)', opacity: 0 },
      ],
      { duration: 520, easing: 'ease-out' },
    ).finished.then(() => p.remove(), () => p.remove());
  }

  /** Yükselen yazı ("+3"): kalın konturlu, zıplayarak çıkar */
  yazi(x: number, y: number, metin: string, renk = '#FFD23F') {
    if (sakin()) return;
    const p = h('b.ps-ucan-yazi', { style: `left:${x}px;top:${y}px;color:${renk}` }, metin);
    this.el.append(p);
    p.animate(
      [
        { transform: 'translate(-50%, -50%) scale(.3)', opacity: 0 },
        { transform: 'translate(-50%, -50%) translateY(-18px) scale(1.25)', opacity: 1, offset: 0.25 },
        { transform: 'translate(-50%, -50%) translateY(-34px) scale(1)', opacity: 1, offset: 0.7 },
        { transform: 'translate(-50%, -50%) translateY(-60px) scale(.9)', opacity: 0 },
      ],
      { duration: 1200, easing: 'ease-out' },
    ).finished.then(() => p.remove(), () => p.remove());
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

/** Abartısız ekran sallanması (birkaç piksel, kısa) */
export function ekranSalla(e: HTMLElement, guc = 3) {
  if (sakin()) return;
  const k = (f: number) => `translate(${(ras(-1, 1) * guc * f).toFixed(1)}px, ${(ras(-1, 1) * guc * f).toFixed(1)}px)`;
  e.animate([{ transform: 'none' }, { transform: k(1) }, { transform: k(0.7) }, { transform: k(0.4) }, { transform: 'none' }], { duration: 260, easing: 'ease-out' });
}

/** Sınıfı yeniden ekleyerek CSS animasyonunu baştan oynatır (zıpla, salla …) */
export function salla(e: Element | null | undefined, sinif = 'ps-salla') {
  if (!e) return;
  e.classList.remove(sinif);
  void (e as HTMLElement).offsetWidth;
  e.classList.add(sinif);
}
