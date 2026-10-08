/**
 * Pazar terazisi: pirinç kollu, zincirle asılı iki kefeli, kadranlı eski usul terazi. Çizim ayrı parçalar
 * (assets/pazar/terazi-taban, -kol, -kefe; Recraft, pazar setinin stilinde): taban yerinde durur, kol pivot çevresinde
 * döner, iki kefe kolun uçlarındaki halkalardan sarkar.
 * Kol yaylı-sönümlü bir fizikle salınır: her konan meyvede ağır taraf biraz iner, dengelenince iki kefe aynı hizaya
 * gelir, ibre kadranın yeşil bölgesinde durur ve kefeler parlar. Kefeler kol uçlarından sarkar, kol hızlanınca hafifçe
 * sallanır (sarkaç). Yalnız transform (rAF ile her karede) ve opacity.
 */
import { h, TEST_MODU } from '../../src/ui/dom';
import { adres } from './gorsel';

/** Çizim alanı (birim; px ölçüleri buna göre oranlanır) */
const G = 440;
const Y = 210;
/** kolun dönme noktası (kadranın altındaki göbek) */
const PIVOT = { x: 220, y: 74 };
/** kolun yarı boyu (pivottan kefe halkasına, yatayda) */
const L = 150;
/** kol uçlarındaki halkalar kolun ekseninin bu kadar altında */
const ASKI = 25.5;
/** bir birim ağırlık farkının kolu eğdiği açı; en çok ±AZAMI */
const BIRIM_ACI = 5;
const AZAMI = 16;

/** Parçaların çizim alanındaki yeri (birim): görseller terazi-hazirla betiğinin ölçüleriyle */
const yuzde = (x: number, y: number, w: number, hh: number) => `left:${(x / G) * 100}%;top:${(y / Y) * 100}%;width:${(w / G) * 100}%;height:${(hh / Y) * 100}%`;
const TABAN = yuzde(150.85, 3.5, 138.3, 200.55);
const KOL = yuzde(51.1, 23.75, 337.8, 84);
/** kadranın yeşil dilimi (denge anında parlar) */
const YESIL = `<svg class="pz-t-yesil" viewBox="0 0 ${G} ${Y}" aria-hidden="true"><path d="M205 15 Q219 11 233 15 L228 51 Q219 54 210 51 Z" fill="#c6ff9e"/></svg>`;

export class Terazi {
  readonly el: HTMLElement;
  readonly kefeSol: HTMLElement;
  readonly kefeSag: HTMLElement;
  /** kefelerin içi (ürünler buraya konur) */
  readonly icSol: HTMLElement;
  readonly icSag: HTMLElement;
  private kol: HTMLElement;
  private aci = 0;
  private hiz = 0;
  private hedef = 0;
  private esit = false;
  private raf = 0;
  private son = 0;
  private w = 0;
  private gozcu: ResizeObserver | null;

  constructor() {
    const resim = (yol: string, sinif: string, stil = '') => h(`img.${sinif}`, { src: adres(yol), alt: '', draggable: 'false', style: stil, 'aria-hidden': 'true' });
    const kefe = (ic: HTMLElement) => h('div.pz-t-kefe-govde', {}, resim('pazar/terazi-kefe', 'pz-t-kefe-resim'), ic);
    this.icSol = h('div.pz-kefe-ic');
    this.icSag = h('div.pz-kefe-ic');
    this.kefeSol = h('div.pz-t-kefe.pz-t-sol', {}, kefe(this.icSol), h('i.pz-t-parilti'));
    this.kefeSag = h('div.pz-t-kefe.pz-t-sag', { role: 'region', 'aria-label': 'Terazinin kefesi' }, kefe(this.icSag), h('i.pz-t-parilti'));
    // kol uçlarındaki halkaların yeri (kefeler buraya asılır; testler de bunu ölçer)
    const uc = (x: number, sinif: string) => h(`i.pz-t-uc.${sinif}`, { style: `left:${(x / G) * 100}%;top:${((PIVOT.y + ASKI) / Y) * 100}%` });
    this.kol = h('div.pz-t-kol', {}, resim('pazar/terazi-kol', 'pz-t-kol-resim', KOL), uc(PIVOT.x - L, 'pz-t-uc-sol'), uc(PIVOT.x + L, 'pz-t-uc-sag'));
    this.el = h(
      'div.pz-terazi',
      {},
      h('div.pz-t-taban', {}, resim('pazar/terazi-taban', 'pz-t-taban-resim', TABAN), h('div', { html: YESIL })),
      this.kol,
      this.kefeSol,
      this.kefeSag,
    );
    this.son = performance.now();
    this.raf = requestAnimationFrame((t) => this.kare(t));
    // genişlik vw/vh ile değişir (döndürme, tarayıcı çubuğu): kefeler px ile konduğu için yeniden ölçülür
    this.gozcu = typeof ResizeObserver === 'function' ? new ResizeObserver(this.olc) : null;
    this.gozcu?.observe(this.el);
    addEventListener('resize', this.olc);
    addEventListener('orientationchange', this.olc);
  }

  /** Kefelerdeki toplam ağırlıklar; kol yeni dengeye doğru salınır */
  agirliklar(sol: number, sag: number) {
    this.hedef = Math.max(-AZAMI, Math.min(AZAMI, (sag - sol) * BIRIM_ACI));
    this.esit = sol === sag && sol > 0;
    // yeni ağırlık gelince küçük bir itki: kefe "düşer" gibi
    this.hiz += (this.hedef - this.aci) * 1.8;
    if (!this.esit) this.el.classList.remove('dengede');
  }

  /** Kol ortada durdu ve kefeler eşit mi */
  get dengede() {
    return this.esit && Math.abs(this.aci) < 0.6 && Math.abs(this.hiz) < 4;
  }

  private kare(t: number) {
    this.raf = requestAnimationFrame((x) => this.kare(x));
    const dt = Math.min(0.05, (t - this.son) / 1000);
    this.son = t;
    if (TEST_MODU) {
      this.aci = this.hedef;
      this.hiz = 0;
    } else {
      // yaylı-sönümlü salınım (hafif fazla salınır, sonra oturur)
      const ivme = 42 * (this.hedef - this.aci) - 5.2 * this.hiz;
      this.hiz += ivme * dt;
      this.aci += this.hiz * dt;
    }
    if (!this.w) this.w = this.el.offsetWidth;
    const olcek = this.w / G;
    const r = (this.aci * Math.PI) / 180;
    const c = Math.cos(r);
    const s = Math.sin(r);
    const px = PIVOT.x * olcek;
    const py = PIVOT.y * olcek;
    const l = L * olcek;
    const a = ASKI * olcek;
    this.kol.style.transform = `rotate(${this.aci.toFixed(2)}deg)`;
    // kefeler kol uçlarındaki halkalardan sarkar (halka kolla birlikte döner); kol hızlanınca biraz geride kalıp sallanır (sarkaç)
    const sallan = Math.max(-10, Math.min(10, -this.hiz * 0.12));
    this.kefeSol.style.transform = `translate(${(px - l * c - a * s).toFixed(1)}px, ${(py - l * s + a * c).toFixed(1)}px) rotate(${sallan.toFixed(2)}deg)`;
    this.kefeSag.style.transform = `translate(${(px + l * c - a * s).toFixed(1)}px, ${(py + l * s + a * c).toFixed(1)}px) rotate(${sallan.toFixed(2)}deg)`;
    if (this.dengede) this.el.classList.add('dengede');
  }

  /** Boyut değişince (döndürme) yeniden ölçülsün; sonraki karede kefeler yeni ölçüyle kol uçlarına oturur */
  readonly olc = () => {
    this.w = this.el.offsetWidth;
  };

  kapat() {
    cancelAnimationFrame(this.raf);
    this.gozcu?.disconnect();
    removeEventListener('resize', this.olc);
    removeEventListener('orientationchange', this.olc);
  }
}
