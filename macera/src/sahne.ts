/**
 * Sahne: bölümün geçtiği oda. Dünya katmanı kamera ile yaklaşır/uzaklaşır; ışıklar söner/yanar;
 * nesneler sahneye yüzde konumla (x: yatay merkez, y: alttan, w: genişlik) yerleşir.
 */
import { h } from '../../src/ui/dom';
import { adres } from './gorsel';

export interface Konum {
  x: number;
  y: number;
  w: number;
  z?: number;
}

const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export class Sahne {
  readonly el: HTMLElement;
  readonly dunya: HTMLElement;
  readonly on: HTMLElement;
  private karanlik: HTMLElement;
  private disko: HTMLElement;

  constructor(arka: string) {
    this.dunya = h('div.mc-dunya', {}, h('div.mc-oda', { style: `--resim:url("${adres(arka)}")` }));
    this.karanlik = h('div.mc-karanlik');
    this.disko = h('div.mc-disko');
    this.on = h('div.mc-on');
    this.el = h('div.mc-sahne', {}, this.dunya, this.karanlik, this.disko, this.on);
  }

  /** Nesneyi dünyaya yerleştir */
  koy<T extends HTMLElement>(el: T, k: Konum): T {
    el.classList.add('mc-oge');
    el.style.setProperty('--x', String(k.x));
    el.style.setProperty('--y', String(k.y));
    el.style.setProperty('--w', String(k.w));
    if (k.z !== undefined) el.style.zIndex = String(k.z);
    this.dunya.append(el);
    return el;
  }

  /** Kamera: (x, y) odak noktası (sahnenin %'si, üstten), z yakınlık */
  async kamera(x: number, y: number, z: number, ms = 1200) {
    this.dunya.style.transitionDuration = `${ms}ms`;
    this.dunya.style.transformOrigin = `${x}% ${y}%`;
    this.dunya.style.transform = `scale(${z})`;
    await bekle(ms);
  }

  async isik(acik: boolean, ms = 900) {
    this.karanlik.style.transitionDuration = `${ms}ms`;
    this.karanlik.classList.toggle('acik', !acik);
    await bekle(ms);
  }

  /** Disko ışığı (dans sahnesi): her alkışta renk değişir */
  diskoRenk(renk: string | null) {
    this.disko.classList.toggle('acik', !!renk);
    if (renk) this.disko.style.setProperty('--renk', renk);
  }

  /** Sahnenin ekrandaki konumu (konfeti gibi ekran koordinatı isteyen efektler için) */
  noktaEkran(x: number, yUstten: number): [number, number] {
    const r = this.el.getBoundingClientRect();
    return [r.left + (r.width * x) / 100, r.top + (r.height * yUstten) / 100];
  }
}
