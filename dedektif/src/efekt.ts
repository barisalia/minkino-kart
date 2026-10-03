/**
 * Dedektif Mino görsel efektleri (yalnız transform / opacity, WAAPI; dokunuşları geçirir): dört köşeli parıltılar,
 * "buldun!" halkası, kavisle uçuş, nazik sallanma, el ipucu, tavana çarpma yıldızları, ekran sarsıntısı.
 * Koordinatlar efekt katmanına (ekran köküne) göre px.
 */
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { AZ_HAREKET } from './dunya';

const sakin = () => AZ_HAREKET || TEST_MODU;
const ras = (a: number, b: number) => a + Math.random() * (b - a);
const RENKLER = ['#ffd23f', '#ffffff', '#ffe58a', '#ff9fc6', '#9be7ff'];

export class Efekt {
  readonly el = h('div.dd-efekt', { 'aria-hidden': 'true' });
  constructor(private kok: HTMLElement) {}

  /** Bir elemanın noktası (efekt katmanına göre); ox, oy: elemanın içinde oran */
  merkez(e: Element, ox = 0.5, oy = 0.5): [number, number] {
    const a = e.getBoundingClientRect();
    const k = this.kok.getBoundingClientRect();
    return [a.left - k.left + a.width * ox, a.top - k.top + a.height * oy];
  }

  /** Dört köşeli parıltılar dışa saçılır */
  parilti(x: number, y: number, adet = 10, boy = 1) {
    if (sakin()) return;
    for (let i = 0; i < adet; i++) {
      const a = (i / adet) * Math.PI * 2 + ras(-0.35, 0.35);
      const r = ras(46, 96) * boy;
      const p = h('i.dd-parilti', { style: `left:${x}px;top:${y}px;--r:${RENKLER[i % RENKLER.length]};--b:${ras(0.6, 1.2).toFixed(2)}` });
      this.el.append(p);
      p.animate(
        [
          { transform: 'translate(-50%, -50%) scale(0) rotate(0deg)', opacity: 1 },
          { transform: `translate(-50%, -50%) translate(${(Math.cos(a) * r * 0.7).toFixed(0)}px, ${(Math.sin(a) * r * 0.7).toFixed(0)}px) scale(1) rotate(90deg)`, opacity: 1, offset: 0.45 },
          { transform: `translate(-50%, -50%) translate(${(Math.cos(a) * r).toFixed(0)}px, ${(Math.sin(a) * r + 14).toFixed(0)}px) scale(0) rotate(200deg)`, opacity: 0 },
        ],
        { duration: 650 + i * 28, easing: 'cubic-bezier(.2,.7,.3,1)' },
      ).finished.then(() => p.remove(), () => p.remove());
    }
  }

  /** "Buldun!": genişleyen ışık halkası + parıltılar */
  halka(x: number, y: number, r = 60) {
    if (sakin()) return;
    const c = h('i.dd-halka-isik', { style: `left:${x}px;top:${y}px;width:${r * 2}px;height:${r * 2}px` });
    this.el.append(c);
    c.animate(
      [
        { transform: 'translate(-50%, -50%) scale(0.3)', opacity: 0.95 },
        { transform: 'translate(-50%, -50%) scale(1.6)', opacity: 0 },
      ],
      { duration: 620, easing: 'cubic-bezier(.2,.8,.3,1)' },
    ).finished.then(() => c.remove(), () => c.remove());
    this.parilti(x, y, 12, r / 60);
  }

  /** Küçük ışıltı (büyüteç ipucuna yaklaşınca): tek parıltı, rastgele bir yanda */
  isilti(x: number, y: number, r = 30) {
    if (sakin()) return;
    const a = Math.random() * Math.PI * 2;
    const p = h('i.dd-parilti.dd-parilti-kucuk', { style: `left:${x + Math.cos(a) * r}px;top:${y + Math.sin(a) * r}px;--r:#fff6c8;--b:0.7` });
    this.el.append(p);
    p.animate(
      [
        { transform: 'translate(-50%, -50%) scale(0) rotate(0deg)', opacity: 0 },
        { transform: 'translate(-50%, -50%) scale(1) rotate(45deg)', opacity: 1, offset: 0.4 },
        { transform: 'translate(-50%, -50%) scale(0) rotate(90deg)', opacity: 0 },
      ],
      { duration: 520, easing: 'ease-out' },
    ).finished.then(() => p.remove(), () => p.remove());
  }

  /** Bir içeriği bir noktadan ötekine kavisle uçurur; bitince kaldırılır */
  async ucur(icerik: HTMLElement, [x0, y0]: [number, number], [x1, y1]: [number, number], o: { ms?: number; kavis?: number; boy0?: number; boy1?: number; don?: number; gecikme?: number } = {}) {
    const { ms = 620, kavis = -70, boy0 = 1, boy1 = 1, don = 0, gecikme = 0 } = o;
    const kap = h('div.dd-ucan', { style: `left:${x0}px;top:${y0}px` }, icerik);
    this.el.append(kap);
    const dx = x1 - x0;
    const dy = y1 - y0;
    const a = kap.animate(
      [
        { transform: `translate(-50%, -50%) scale(${boy0})` },
        { transform: `translate(-50%, -50%) translate(${dx * 0.5}px, ${dy * 0.5 + kavis}px) scale(${(boy0 + boy1) / 2 + 0.08}) rotate(${don / 2}deg)`, offset: 0.5 },
        { transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${boy1}) rotate(${don}deg)` },
      ],
      { duration: sure(ms), delay: sure(gecikme), easing: 'cubic-bezier(.45,.05,.35,1)', fill: 'both' },
    );
    await a.finished.catch(() => undefined);
    kap.remove();
  }

  /** Tavana çarpınca dönen yıldızlar */
  yildizlar(x: number, y: number) {
    if (sakin()) return;
    for (let i = 0; i < 5; i++) {
      const p = h('i.dd-yildizcik', { style: `left:${x}px;top:${y}px` });
      this.el.append(p);
      const a = (i / 5) * Math.PI * 2;
      p.animate(
        [
          { transform: 'translate(-50%, -50%) scale(0.2)', opacity: 0 },
          { transform: `translate(-50%, -50%) translate(${Math.cos(a) * 46}px, ${Math.sin(a) * 18 + 10}px) scale(1) rotate(120deg)`, opacity: 1, offset: 0.35 },
          { transform: `translate(-50%, -50%) translate(${Math.cos(a + 2) * 50}px, ${Math.sin(a + 2) * 20 + 14}px) scale(0.6) rotate(320deg)`, opacity: 0 },
        ],
        { duration: 1100, easing: 'ease-out' },
      ).finished.then(() => p.remove(), () => p.remove());
    }
  }

  /** Hafif ekran sarsıntısı (kök) */
  sars(guc = 6) {
    if (sakin()) return;
    const kf: Keyframe[] = Array.from({ length: 7 }, (_, i) => ({ transform: `translate(${i % 2 ? guc : -guc}px, ${i % 3 ? -guc / 2 : guc / 2}px)` }));
    kf.push({ transform: 'none' });
    void this.kok.animate(kf, { duration: 360, easing: 'linear' });
  }
}

/** Nazik sallanma (yanlış değil: "bir daha bakalım") */
export function salla(e: Element | null | undefined) {
  if (!e || sakin()) return Promise.resolve();
  return (e as HTMLElement)
    .animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(0)' }], { duration: 460, easing: 'ease-in-out', composite: 'add' })
    .finished.catch(() => undefined);
}

/** Yaylı "pop" (büyüyüp oturur) */
export function pop(e: Element | null | undefined, boy = 1.25) {
  if (!e || sakin()) return Promise.resolve();
  return (e as HTMLElement)
    .animate([{ transform: 'scale(1)' }, { transform: `scale(${boy})`, offset: 0.4 }, { transform: 'scale(0.95)', offset: 0.75 }, { transform: 'scale(1)' }], { duration: 420, easing: 'cubic-bezier(.3,1.4,.5,1)', composite: 'add' })
    .finished.catch(() => undefined);
}

/** Sınıfı yeniden ekleyerek CSS animasyonunu baştan oynatır */
export function oynat(e: Element | null | undefined, sinif: string) {
  if (!e) return;
  e.classList.remove(sinif);
  void (e as HTMLElement).offsetWidth;
  e.classList.add(sinif);
}

/**
 * El ipucu: parmak bir noktaya dokunur ya da bir yerden bir yere sürükler (tekrar eder). Döner: durdur.
 * kaynak / hedef ekran (client) dikdörtgenleri verir: kamera ya da kartlar kayınca da doğru yere gider.
 */
export function parmak(katman: HTMLElement, kaynak: () => DOMRect | null, hedef?: () => DOMRect | null): () => void {
  const el = h('div.dd-parmak', {
    html: '<svg viewBox="0 0 48 56"><path d="M18 4c3 0 5 2 5 5v17l3-1c2-6 11-4 10 2l4-1c3 0 5 3 4 6l-3 14c-1 5-5 8-10 8H21c-4 0-7-2-9-5L3 34c-2-3 1-7 5-5l5 4V9c0-3 2-5 5-5z" fill="#fff" stroke="#5a3617" stroke-width="3.5" stroke-linejoin="round"/></svg>',
  });
  katman.append(el);
  let dur = false;
  const dongu = async () => {
    while (!dur) {
      const a = kaynak();
      const k = katman.getBoundingClientRect();
      if (!a || TEST_MODU) {
        await new Promise((r) => setTimeout(r, 400));
        continue;
      }
      const x1 = a.left + a.width / 2 - k.left;
      const y1 = a.top + a.height / 2 - k.top;
      const b = hedef?.();
      if (b) {
        const x2 = b.left + b.width / 2 - k.left;
        const y2 = b.top + b.height / 2 - k.top;
        await el
          .animate(
            [
              { transform: `translate(${x1}px, ${y1}px) scale(1.15)`, opacity: 0 },
              { transform: `translate(${x1}px, ${y1}px) scale(0.92)`, opacity: 1, offset: 0.15 },
              { transform: `translate(${x2}px, ${y2}px) scale(0.92)`, opacity: 1, offset: 0.78 },
              { transform: `translate(${x2}px, ${y2}px) scale(1.1)`, opacity: 0 },
            ],
            { duration: 1800, easing: 'ease-in-out' },
          )
          .finished.catch(() => undefined);
      } else {
        await el
          .animate(
            [
              { transform: `translate(${x1}px, ${y1 + 30}px) scale(1)`, opacity: 0 },
              { transform: `translate(${x1}px, ${y1}px) scale(1)`, opacity: 1, offset: 0.3 },
              { transform: `translate(${x1}px, ${y1}px) scale(0.82)`, opacity: 1, offset: 0.45 },
              { transform: `translate(${x1}px, ${y1}px) scale(1)`, opacity: 1, offset: 0.6 },
              { transform: `translate(${x1}px, ${y1 + 24}px) scale(1)`, opacity: 0 },
            ],
            { duration: 1400, easing: 'ease-in-out' },
          )
          .finished.catch(() => undefined);
      }
      await new Promise((r) => setTimeout(r, 350));
    }
  };
  void dongu();
  return () => {
    dur = true;
    el.remove();
  };
}
