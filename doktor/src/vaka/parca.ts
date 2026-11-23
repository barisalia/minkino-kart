// Vaka sahnelerinin ortak yapı taşları: sahnelerin oyundan aldığı ortam (Ortam), üst üste boyalı kare dizileri
// (KareDizisi, Pozlar) ve parmağı izleyen parça (Surukle: kalkar, gölgesi düşer, gittiği yöne yatar).
// Hepsi yalnız transform ve saydamlıkla çalışır; kareler baştan boyalıdır, değişim anında çözme beklenmez.
import { ELDE_OLCEK, type Kutu, type Nokta, type Yas } from './veri';

export const el = <K extends keyof HTMLElementTagNameMap>(etiket: K, sinif: string): HTMLElementTagNameMap[K] => { const e = document.createElement(etiket); e.className = sinif; return e; };
export const koy = (e: HTMLElement, k: Kutu) => { Object.assign(e.style, { left: k.sol + 'px', top: k.ust + 'px', width: k.g + 'px', height: k.y + 'px' }); };
export const ortala = (e: HTMLElement, p: Nokta, g: number, y: number) => koy(e, { sol: p.x - g / 2, ust: p.y - y / 2, g, y });
export const uzak = (a: Nokta, b: Nokta) => Math.hypot(a.x - b.x, a.y - b.y);

/** Bir sahnenin oyundan aldığı her şey (sahne.ts kurar). */
export interface Ortam {
  kok: HTMLElement; sahne: HTMLElement; yas: Yas; sinyal: AbortSignal;
  /** sahnenin dışında kalan ekran payı (sahne pikseli) */
  tasma: { yan: number; dik: number };
  noktaya(e: PointerEvent): Nokta;
  resim(ad: string, sinif?: string): HTMLImageElement;
  /** baştan çözülmüş çizim (tuvale çizmek için); yoksa undefined */
  cozulmus(ad: string): HTMLImageElement | undefined;
  varMi(ad: string): boolean;
  /** tam sahne boyundaki katmanın sahnedeki kutusu (bağlanırken kırpıldıysa dolu alanı; yoksa sahnenin tamamı) */
  kutu(ad: string): Kutu;
  ses(ad: string, kazanc?: number, hiz?: number): void;
  soyle(ad: string): void;
  /** test kipinde kısalan süre ve bekleme */
  sure(ms: number): number;
  bekle(ms: number): Promise<void>;
  parilti(p: Nokta, boy: number, hedef: HTMLElement): void;
  yildizHavuzu(kati: HTMLElement, adet: number): HTMLImageElement[];
  yildizSac(havuz: HTMLImageElement[], p: Nokta, adet: number, uzaklik?: number, boy?: number): void;
  asamaYaz(ad: string): void;
  calisiyor(): boolean;
}

/** Bir sahne: görünümü, her karede çağrılan adımı, baştan sona oynatması ve test için okumaları. */
export interface AltSahne {
  gorunum: HTMLElement;
  /** sahne görünürken her karede */
  kare(an: number, dt: number): void;
  /** sahneyi başlatır; çocuk işi bitirince çözülür */
  oyna(): Promise<void>;
  nokta(ad: string, i?: number): Nokta | null;
  sayim(): Record<string, unknown>;
  /** sahne içeriğini büyütüyorsa (defter): sahne noktasını kendi iç ölçüsüne çevirir */
  yerel?(p: Nokta): Nokta;
}

/** Görünümü olan bir sahne: üst etki katmanı ve "sıra bende" ipucu da var. */
export type GorunumSahnesi = AltSahne & { ust: HTMLElement; ipucu(): void };

/** Aynı yerde duran kareler: hepsi baştan boyalı, yalnız biri görünür. */
export class KareDizisi {
  readonly kutu: HTMLDivElement;
  private readonly kareler: HTMLImageElement[];
  private simdi = -1;
  constructor(o: Ortam, adlar: readonly string[], sinif: string) {
    this.kutu = el('div', sinif + ' vk-yigin');
    this.kareler = adlar.map(ad => o.resim(ad));
    this.kutu.append(...this.kareler);
    this.goster(0);
  }
  goster(i: number): void {
    const k = Math.max(0, Math.min(this.kareler.length - 1, Math.floor(i)));
    if (k === this.simdi) return;
    this.kareler[this.simdi]?.classList.remove('vk-gorunur');
    this.kareler[k]?.classList.add('vk-gorunur');
    this.simdi = k;
  }
  get kare(): number { return this.simdi; }
  get adet(): number { return this.kareler.length; }
}
/** Adlı pozlar (bir karakterin ifadeleri): aynı kutuda, adıyla gösterilir. */
export class Pozlar<A extends string> {
  readonly kutu: HTMLDivElement;
  private readonly dizi: KareDizisi;
  private readonly sira: A[];
  constructor(o: Ortam, pozlar: Record<A, string>, sinif: string) {
    this.sira = Object.keys(pozlar) as A[];
    this.dizi = new KareDizisi(o, this.sira.map(a => pozlar[a]), sinif);
    this.kutu = this.dizi.kutu;
  }
  goster(ad: A): void { this.dizi.goster(this.sira.indexOf(ad)); }
  get simdi(): A { return this.sira[this.dizi.kare]; }
}

export interface SurukleSecenek {
  /** tutulabilir mi (aşama, sıra) */
  izin?: () => boolean;
  /** izin yokken dokunulursa (yanlış sıra): komik karşılık için */
  reddedildi?: () => void;
  basladi?: () => void;
  /** her karede, tutulurken: parçanın merkezi, kare süresi (ms), parmağın bu karedeki yolu (px) */
  tutulurken?: (merkez: Nokta, dt: number, yol: number) => void;
  /** bırakıldı; true dönerse parça eve dönmez (yerine oturdu ya da kendisi konumlanacak) */
  birakildi?: (merkez: Nokta) => boolean | void;
  /** parçanın sol üst köşesinin gezebileceği alan */
  sinir?: Kutu;
  /** parmağın üstünde kaç piksel yukarıda dursun (parmak parçayı kapatmasın) */
  kaldir?: number;
  golge?: HTMLCanvasElement;
  /** gittiği yöne yatsın mı (varsayılan evet) */
  egim?: boolean;
}

/**
 * Parmağı izleyen parça. Dokununca kalkar (biraz büyür, gölgesi belirir), parmağı izler, gittiği yöne hafifçe yatar;
 * bırakılınca yerine süzülür. Konumu sahne pikselidir; hareket yalnız transform'dur.
 */
export class Surukle {
  /** o anki sol üst köşe (sahne pikseli) */
  sol: number; ust: number;
  tutuluyor = false;
  /** parmağın hızı (sahne pikseli/ms) */
  hiz = 0;
  private parmak: Nokta = { x: 0, y: 0 };
  private fark: Nokta = { x: 0, y: 0 };
  private once: Nokta = { x: 0, y: 0 };
  private id = -1;
  private egim = 0;
  private olcek = 1;
  constructor(private readonly o: Ortam, readonly parca: HTMLElement, readonly ev: Kutu, private readonly s: SurukleSecenek = {}) {
    this.sol = ev.sol; this.ust = ev.ust;
    koy(parca, ev);
    parca.style.willChange = 'transform';
    parca.style.touchAction = 'none';
    if (s.golge) { koy(s.golge, ev); s.golge.style.width = ev.g + 'px'; s.golge.style.height = ev.y + 'px'; }
    parca.addEventListener('pointerdown', e => {
      if (e.button !== 0 || this.tutuluyor) return;
      if (s.izin && !s.izin()) { s.reddedildi?.(); return; }
      e.preventDefault(); e.stopPropagation();
      this.tutuluyor = true; this.id = e.pointerId;
      this.parmak = o.noktaya(e); this.once = this.parmak;
      this.fark = { x: this.parmak.x - this.sol, y: this.parmak.y - this.ust + (s.kaldir ?? 0) };
      try { parca.setPointerCapture(e.pointerId); } catch { /* yakalanamazsa pencere olayları yeter */ }
      parca.getAnimations().forEach(a => { if (a.id === 'eve') a.cancel(); });
      this.olcek = ELDE_OLCEK;
      parca.classList.add('vk-elde');
      s.golge?.getAnimations().forEach(a => a.cancel());
      s.golge?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: o.sure(140), fill: 'forwards' });
      this.yerles();
      this.ciz();
      s.basladi?.();
    });
    addEventListener('pointermove', e => { if (this.tutuluyor && e.pointerId === this.id) { this.parmak = o.noktaya(e); this.yerles(); this.ciz(); } }, { signal: o.sinyal });
    const kalk = (e: PointerEvent) => {
      if (!this.tutuluyor || e.pointerId !== this.id) return;
      this.birak();
    };
    addEventListener('pointerup', kalk, { signal: o.sinyal });
    addEventListener('pointercancel', kalk, { signal: o.sinyal });
  }
  private yerles(): void {
    let x = this.parmak.x - this.fark.x, y = this.parmak.y - this.fark.y;
    const k = this.s.sinir;
    if (k) { x = Math.max(k.sol, Math.min(k.sol + k.g, x)); y = Math.max(k.ust, Math.min(k.ust + k.y, y)); }
    this.sol = x; this.ust = y;
  }
  private ciz(): void {
    const d = `translate3d(${(this.sol - this.ev.sol).toFixed(1)}px, ${(this.ust - this.ev.ust).toFixed(1)}px, 0) rotate(${this.egim.toFixed(2)}deg) scale(${this.olcek})`;
    this.parca.style.transform = d;
    if (this.s.golge) this.s.golge.style.transform = `translate3d(${(this.sol - this.ev.sol + 18).toFixed(1)}px, ${(this.ust - this.ev.ust + 32).toFixed(1)}px, 0) rotate(${this.egim.toFixed(2)}deg) scale(${this.olcek})`;
  }
  get merkez(): Nokta { return { x: this.sol + this.ev.g / 2, y: this.ust + this.ev.y / 2 }; }
  /** her karede: hız, eğim ve tutulurken çağrısı */
  kare(dt: number): void {
    if (!this.tutuluyor) return;
    const yol = uzak(this.parmak, this.once), hx = (this.parmak.x - this.once.x) / Math.max(1, dt);
    this.hiz = yol / Math.max(1, dt);
    this.once = this.parmak;
    if (this.s.egim !== false) {
      const hedef = Math.max(-8, Math.min(8, hx * 9)), onceki = this.egim;
      this.egim += (hedef - this.egim) * Math.min(1, dt / 90);
      if (Math.abs(this.egim - onceki) > 0.01) this.ciz();
    }
    this.s.tutulurken?.(this.merkez, dt, yol);
  }
  /** parmağı bırakmış gibi sonlandırır */
  birak(): void {
    if (!this.tutuluyor) return;
    this.tutuluyor = false; this.hiz = 0;
    this.parca.classList.remove('vk-elde');
    const g = this.s.golge;
    if (g) { g.getAnimations().forEach(a => a.cancel()); g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: this.o.sure(150), fill: 'forwards' }); }
    if (this.s.birakildi?.(this.merkez) === true) { this.egim = 0; this.olcek = 1; this.ciz(); return; }
    this.eve();
  }
  /** parçayı sahnede bir yere koyar (sol üst köşe), tutulmuyorken */
  konumla(sol: number, ust: number, olcek = 1): void { this.sol = sol; this.ust = ust; this.egim = 0; this.olcek = olcek; this.ciz(); }
  /** yerine süzülür */
  eve(ani = false): void {
    const bas = this.parca.style.transform || 'translate3d(0px, 0px, 0) rotate(0deg) scale(1)';
    this.sol = this.ev.sol; this.ust = this.ev.ust; this.egim = 0; this.olcek = 1;
    this.ciz();
    if (ani) return;
    const a = this.parca.animate([{ transform: bas }, { transform: this.parca.style.transform }], { duration: this.o.sure(190), easing: 'cubic-bezier(.3,.7,.3,1)' });
    a.id = 'eve';
  }
}

/** Yerinde büyüyüp zıplar: "sıra bende". */
export const ziplat = (o: Ortam, e: HTMLElement) => { e.animate([{ scale: '1', translate: '0 0' }, { scale: '1.22', translate: '0 -14px', offset: 0.4 }, { scale: '1', translate: '0 0' }], { duration: o.sure(280), easing: 'ease-out' }); };
/** Küçük bir zıplayış (karakterin tepkisi). */
export const hop = (o: Ortam, e: HTMLElement | null | undefined, px = 20, ms = 260) => { e?.animate([{ translate: '0 0' }, { translate: `0 ${-px}px`, offset: 0.4 }, { translate: '0 0' }], { duration: o.sure(ms), easing: 'ease-out', composite: 'add' }); };
/** Belirir: küçükten büyüyerek. */
export const belir = (o: Ortam, e: HTMLElement, ms = 220) => e.animate([{ scale: '.6', opacity: 0 }, { scale: '1.1', opacity: 1, offset: 0.65 }, { scale: '1', opacity: 1 }], { duration: o.sure(ms), easing: 'ease-out' });
/** Başını sallar: "sıram değil". */
export const salla = (o: Ortam, e: HTMLElement) => e.animate([{ rotate: '0deg' }, { rotate: '-7deg' }, { rotate: '6deg' }, { rotate: '0deg' }], { duration: o.sure(240), easing: 'ease-in-out' });
