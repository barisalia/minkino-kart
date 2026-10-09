/**
 * Kino'nun Otobüsü görsel efektleri (yalnız transform / opacity, WAAPI): buz parıltısı, "pof" bulutu, uçan kalpler,
 * konfeti, yükselen yazı, kavisle uçuş (top: kaptan yuvaya, jeton: müşteriden kumbaraya), boşluğa buz yıldızı.
 * Efekt katmanı dokunuşları geçirir; hiçbir efekt girdiyi kilitlemez.
 */
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { BUZ_YILDIZ, KALP } from './cizim';

export const AZ_HAREKET = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const sakin = () => AZ_HAREKET || TEST_MODU;
const ras = (a: number, b: number) => a + Math.random() * (b - a);
const sil = (a: Animation, e: Element) => a.finished.then(() => e.remove(), () => e.remove());

export class Efekt {
  readonly el = h('div.ko-efekt', { 'aria-hidden': 'true' });
  constructor(private kok: HTMLElement) {}

  kutu(): DOMRect {
    return (this.el.isConnected ? this.el : this.kok).getBoundingClientRect();
  }
  /** Bir elemanın içindeki nokta (efekt katmanına göre) */
  merkez(e: Element, ox = 0.5, oy = 0.5): [number, number] {
    const a = e.getBoundingClientRect();
    const k = this.kutu();
    return [a.left - k.left + a.width * ox, a.top - k.top + a.height * oy];
  }

  /** Buz parıltıları: dört köşeli ışıklar dışa uçar */
  parilti(x: number, y: number, adet = 6, boy = 1, renk = '#fff') {
    if (sakin()) return;
    for (let i = 0; i < adet; i++) {
      const a = (i / adet) * Math.PI * 2 + ras(-0.4, 0.4);
      const r = ras(30, 70) * boy;
      const p = h('i.ko-parilti', { style: `left:${x}px;top:${y}px;--renk:${renk}` });
      this.el.append(p);
      sil(
        p.animate(
          [
            { transform: 'translate(-50%, -50%) scale(0) rotate(0deg)', opacity: 1 },
            { transform: `translate(-50%, -50%) translate(${(Math.cos(a) * r * 0.7).toFixed(0)}px, ${(Math.sin(a) * r * 0.7).toFixed(0)}px) scale(${boy}) rotate(90deg)`, opacity: 1, offset: 0.5 },
            { transform: `translate(-50%, -50%) translate(${(Math.cos(a) * r).toFixed(0)}px, ${(Math.sin(a) * r + 8).toFixed(0)}px) scale(0) rotate(180deg)`, opacity: 0 },
          ],
          { duration: 600 + i * 25, easing: 'ease-out' },
        ),
        p,
      );
    }
  }

  /** "Pof": yumuşak bulut topları açılıp söner */
  pof(x: number, y: number, boy = 1, renk = '#fff') {
    if (sakin()) return;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + ras(-0.3, 0.3);
      const r = ras(18, 32) * boy;
      const p = h('i.ko-pof-bulut', { style: `left:${x}px;top:${y}px;width:${(ras(16, 26) * boy).toFixed(0)}px;background:${renk}` });
      this.el.append(p);
      sil(
        p.animate(
          [
            { transform: 'translate(-50%, -50%) scale(.3)', opacity: 0.95 },
            { transform: `translate(-50%, -50%) translate(${(Math.cos(a) * r).toFixed(0)}px, ${(Math.sin(a) * r - 4).toFixed(0)}px) scale(1.1)`, opacity: 0.85, offset: 0.55 },
            { transform: `translate(-50%, -50%) translate(${(Math.cos(a) * r * 1.3).toFixed(0)}px, ${(Math.sin(a) * r * 1.3 - 10).toFixed(0)}px) scale(.5)`, opacity: 0 },
          ],
          { duration: 460, easing: 'cubic-bezier(.2,.8,.3,1)' },
        ),
        p,
      );
    }
  }

  /** Boşluğa dokunma: minik buz yıldızı (sessiz) */
  buzYildizi(x: number, y: number) {
    if (sakin()) return;
    const p = h('i.ko-buz', { html: BUZ_YILDIZ, style: `left:${x}px;top:${y}px` });
    this.el.append(p);
    sil(
      p.animate(
        [
          { transform: 'translate(-50%, -50%) scale(.2) rotate(0deg)', opacity: 0 },
          { transform: 'translate(-50%, -50%) scale(1) rotate(45deg)', opacity: 1, offset: 0.35 },
          { transform: 'translate(-50%, -50%) translateY(-14px) scale(.6) rotate(90deg)', opacity: 0 },
        ],
        { duration: 650, easing: 'ease-out' },
      ),
      p,
    );
  }

  kalpler(x: number, y: number, adet = 5) {
    if (sakin()) return;
    for (let i = 0; i < adet; i++) {
      const k = h('i.ko-kalp', { html: KALP, style: `left:${x + ras(-26, 26)}px;top:${y}px` });
      this.el.append(k);
      const dx = ras(-40, 40);
      sil(
        k.animate(
          [
            { transform: 'translate(-50%, -50%) scale(.2)', opacity: 0 },
            { transform: `translate(-50%, -50%) translate(${dx * 0.4}px, -26px) scale(1.15)`, opacity: 1, offset: 0.25 },
            { transform: `translate(-50%, -50%) translate(${dx}px, -100px) scale(.9) rotate(${dx / 3}deg)`, opacity: 0 },
          ],
          { duration: 1200, delay: i * 110, easing: 'ease-out', fill: 'backwards' },
        ),
        k,
      );
    }
  }

  /** Kocaman tek kalp (tam istediği gibi): başın üstünde yaylanarak açılır, süzülüp söner */
  buyukKalp(x: number, y: number) {
    if (sakin()) return;
    const k = h('i.ko-buyuk-kalp', { html: KALP, style: `left:${x}px;top:${y}px` });
    this.el.append(k);
    sil(
      k.animate(
        [
          { transform: 'translate(-50%, -50%) scale(.1)', opacity: 0 },
          { transform: 'translate(-50%, -60%) scale(1.25)', opacity: 1, offset: 0.18 },
          { transform: 'translate(-50%, -60%) scale(.95)', opacity: 1, offset: 0.3 },
          { transform: 'translate(-50%, -64%) scale(1)', opacity: 1, offset: 0.7 },
          { transform: 'translate(-50%, -110%) scale(.8)', opacity: 0 },
        ],
        { duration: 1400, easing: 'ease-out' },
      ),
      k,
    );
  }

  konfeti(x: number, y: number, adet = 20) {
    if (sakin()) return;
    const renkler = ['#FF8DB4', '#FFE45C', '#8ED3F2', '#A9DB8C', '#8C88E0', '#FFF1C2'];
    for (let i = 0; i < adet; i++) {
      const p = h('i.ko-konfeti', { style: `left:${x}px;top:${y}px;background:${renkler[i % renkler.length]}` });
      if (i % 3 === 0) p.style.borderRadius = '50%';
      this.el.append(p);
      const a = -Math.PI / 2 + ras(-1.2, 1.2);
      const r = ras(60, 140);
      const dx = Math.cos(a) * r;
      const dy = Math.sin(a) * r;
      sil(
        p.animate(
          [
            { transform: 'translate(-50%, -50%) scale(.4) rotate(0deg)', opacity: 1 },
            { transform: `translate(-50%, -50%) translate(${dx.toFixed(0)}px, ${dy.toFixed(0)}px) scale(1) rotate(${ras(180, 360).toFixed(0)}deg)`, opacity: 1, offset: 0.35 },
            { transform: `translate(-50%, -50%) translate(${(dx * 1.3).toFixed(0)}px, ${(dy + 150).toFixed(0)}px) scale(.9) rotate(${ras(500, 900).toFixed(0)}deg)`, opacity: 0 },
          ],
          { duration: ras(1000, 1500), delay: ras(0, 120), easing: 'cubic-bezier(.2,.7,.4,1)', fill: 'backwards' },
        ),
        p,
      );
    }
  }

  /** Yükselen yazı ("+3") */
  yazi(x: number, y: number, metin: string, renk = '#FFD23F') {
    if (sakin()) return;
    const p = h('b.ko-ucan-yazi', { style: `left:${x}px;top:${y}px;color:${renk}` }, metin);
    this.el.append(p);
    sil(
      p.animate(
        [
          { transform: 'translate(-50%, -50%) scale(.3)', opacity: 0 },
          { transform: 'translate(-50%, -50%) translateY(-16px) scale(1.25)', opacity: 1, offset: 0.25 },
          { transform: 'translate(-50%, -50%) translateY(-30px) scale(1)', opacity: 1, offset: 0.7 },
          { transform: 'translate(-50%, -50%) translateY(-54px) scale(.9)', opacity: 0 },
        ],
        { duration: 1100, easing: 'ease-out' },
      ),
      p,
    );
  }

  /** Bir görüntüyü bir noktadan ötekine kavisle uçurur (efekt katmanında; bitince kalkar) */
  async ucur(icerik: HTMLElement, [x0, y0]: [number, number], [x1, y1]: [number, number], o: { ms?: number; kavis?: number; boy0?: number; boy1?: number; gecikme?: number; don?: number } = {}) {
    const { ms = 420, kavis = -60, boy0 = 1, boy1 = 1, gecikme = 0, don = 0 } = o;
    const kap = h('div.ko-ucan', { style: `left:${x0}px;top:${y0}px` }, icerik);
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
export function salla(e: Element | null | undefined, sinif = 'ko-zipla') {
  if (!e) return;
  e.classList.remove(sinif);
  void (e as HTMLElement).offsetWidth;
  e.classList.add(sinif);
}

/** Abartısız ekran sallanması */
export function ekranSalla(e: HTMLElement, guc = 3) {
  if (sakin()) return;
  const k = (f: number) => `translate(${(ras(-1, 1) * guc * f).toFixed(1)}px, ${(ras(-1, 1) * guc * f).toFixed(1)}px)`;
  e.animate([{ transform: 'none' }, { transform: k(1) }, { transform: k(0.6) }, { transform: 'none' }], { duration: 240, easing: 'ease-out' });
}
