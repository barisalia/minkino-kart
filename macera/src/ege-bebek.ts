/**
 * Bebek Ege: yüz ifadeleri, baş çevirme (kuklalara bakar), ayak sallama, gözyaşı, önlük ve mama lekeleri.
 * Adobe iskeleti gelene kadar SVG yer tutucu; ifadeler göz + ağız gruplarının açılıp kapanmasıyla (ege.css).
 */
import { h } from '../../src/ui/dom';
import { AZ_HAREKET } from './oyuncu';

export type EgeIfade = 'agliyor' | 'bakiyor' | 'am' | 'kikir' | 'kahkaha' | 'saskin' | 'buzuk' | 'esniyor' | 'uyuyor' | 'uykuda-gulumsuyor' | 'tek-goz';

/** ifade → [göz, ağız, kaşlar çatık mı, gözyaşı] */
const IFADE: Record<EgeIfade, [string, string, boolean?, boolean?]> = {
  agliyor: ['sikili', 'agla', false, true],
  bakiyor: ['acik', 'notr'],
  am: ['acik', 'am'],
  kikir: ['mutlu', 'gul'],
  kahkaha: ['mutlu', 'kahkaha'],
  saskin: ['iri', 'o'],
  buzuk: ['acik', 'buzuk', true],
  esniyor: ['kapali', 'esne'],
  uyuyor: ['kapali', 'uyku'],
  'uykuda-gulumsuyor': ['kapali', 'gulumse'],
  'tek-goz': ['tek', 'uyku'],
};

const K = '#5a3617';
const TEN = '#f6c9a0';
const goz = (x: number, rx = 8, ry = 10) => `<ellipse cx="${x}" cy="80" rx="${rx}" ry="${ry}" fill="#3a2418"/><circle cx="${x + 3}" cy="${76 - (ry - 10)}" r="${rx * 0.36}" fill="#fff"/>`;
const kapaliGoz = (x: number) => `<path d="M${x - 10} 79Q${x} 88 ${x + 10} 79" stroke="${K}" stroke-width="4" fill="none" stroke-linecap="round"/>`;

const SVG = `<svg class="eg-bebek-svg" viewBox="0 0 200 232" xmlns="http://www.w3.org/2000/svg">
<g class="eg-bacak eg-bacak-sol"><path d="M62 196Q44 214 50 226Q66 232 80 222Q86 208 82 196Z" fill="#a8d8f0" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><ellipse cx="58" cy="224" rx="14" ry="8" fill="${TEN}" stroke="${K}" stroke-width="4"/></g>
<g class="eg-bacak eg-bacak-sag"><path d="M138 196Q156 214 150 226Q134 232 120 222Q114 208 118 196Z" fill="#a8d8f0" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><ellipse cx="142" cy="224" rx="14" ry="8" fill="${TEN}" stroke="${K}" stroke-width="4"/></g>
<g class="eg-govde"><path d="M46 184Q40 132 100 128Q160 132 154 184Q150 210 100 212Q50 210 46 184Z" fill="#a8d8f0" stroke="${K}" stroke-width="6"/><circle cx="100" cy="164" r="4" fill="#fff"/><circle cx="100" cy="182" r="4" fill="#fff"/><path d="M72 142Q100 152 128 142" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"/></g>
<g class="eg-onluk"><path d="M70 136Q100 150 130 136Q138 176 100 186Q62 176 70 136Z" fill="#fff" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><path d="M80 154Q100 162 120 154Q118 176 100 178Q82 176 80 154Z" fill="#9fd89a"/></g>
<g class="eg-kol eg-kol-sol"><path d="M52 146Q26 160 32 184Q44 190 52 178Q60 164 64 152Z" fill="#a8d8f0" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><circle cx="36" cy="184" r="10" fill="${TEN}" stroke="${K}" stroke-width="4"/></g>
<g class="eg-kol eg-kol-sag"><path d="M148 146Q174 160 168 184Q156 190 148 178Q140 164 136 152Z" fill="#a8d8f0" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><circle cx="164" cy="184" r="10" fill="${TEN}" stroke="${K}" stroke-width="4"/></g>
<g class="eg-kafa">
<circle cx="40" cy="88" r="13" fill="${TEN}" stroke="${K}" stroke-width="5"/><circle cx="160" cy="88" r="13" fill="${TEN}" stroke="${K}" stroke-width="5"/>
<circle cx="100" cy="82" r="62" fill="${TEN}" stroke="${K}" stroke-width="6"/>
<path d="M84 24Q92 8 108 14Q118 20 110 28Q104 22 98 26" fill="none" stroke="#8a4b22" stroke-width="7" stroke-linecap="round"/><path d="M62 36Q80 22 100 22Q124 22 140 36" fill="none" stroke="#8a4b22" stroke-width="5" stroke-linecap="round" opacity=".7"/>
<g class="eg-yuz">
<ellipse class="eg-yanak" cx="66" cy="104" rx="13" ry="8" fill="#ff9aa8" opacity=".55"/><ellipse class="eg-yanak" cx="134" cy="104" rx="13" ry="8" fill="#ff9aa8" opacity=".55"/>
<g class="eg-kas"><path d="M68 62L88 68M132 62L112 68" stroke="${K}" stroke-width="4" stroke-linecap="round"/></g>
<g class="g g-acik">${goz(78)}${goz(122)}</g>
<g class="g g-iri">${goz(78, 10, 13)}${goz(122, 10, 13)}</g>
<g class="g g-kapali">${kapaliGoz(78)}${kapaliGoz(122)}</g>
<g class="g g-mutlu"><path d="M68 84Q78 70 88 84M112 84Q122 70 132 84" stroke="${K}" stroke-width="4.5" fill="none" stroke-linecap="round"/></g>
<g class="g g-sikili"><path d="M68 72L86 80L68 88M132 72L114 80L132 88" stroke="${K}" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
<g class="g g-tek">${kapaliGoz(78)}${goz(122)}</g>
<g class="a a-notr"><path d="M92 112Q100 118 108 112" stroke="${K}" stroke-width="4" fill="none" stroke-linecap="round"/></g>
<g class="a a-uyku"><path d="M95 114Q100 117 105 114" stroke="${K}" stroke-width="3.5" fill="none" stroke-linecap="round"/></g>
<g class="a a-gulumse"><path d="M88 110Q100 122 112 110" stroke="${K}" stroke-width="4" fill="none" stroke-linecap="round"/></g>
<g class="a a-agla"><ellipse cx="100" cy="118" rx="19" ry="14" fill="#8e2b2b" stroke="${K}" stroke-width="4"/><ellipse cx="100" cy="126" rx="10" ry="5" fill="#ff7a8a"/></g>
<g class="a a-am"><circle cx="100" cy="116" r="12" fill="#8e2b2b" stroke="${K}" stroke-width="4"/></g>
<g class="a a-gul"><path d="M84 108Q100 130 116 108Z" fill="#8e2b2b" stroke="${K}" stroke-width="4" stroke-linejoin="round"/><path d="M92 120Q100 126 108 120" stroke="#ff7a8a" stroke-width="4" fill="none" stroke-linecap="round"/></g>
<g class="a a-kahkaha"><path d="M78 104Q100 142 122 104Z" fill="#8e2b2b" stroke="${K}" stroke-width="4" stroke-linejoin="round"/><path d="M88 124Q100 132 112 124" stroke="#ff7a8a" stroke-width="5" fill="none" stroke-linecap="round"/></g>
<g class="a a-o"><ellipse cx="100" cy="117" rx="7" ry="9" fill="#8e2b2b" stroke="${K}" stroke-width="4"/></g>
<g class="a a-buzuk"><path d="M88 120Q100 108 112 120" stroke="${K}" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M94 122Q100 126 106 122" stroke="#d9867a" stroke-width="4" fill="none" stroke-linecap="round"/></g>
<g class="a a-esne"><ellipse cx="100" cy="116" rx="11" ry="17" fill="#8e2b2b" stroke="${K}" stroke-width="4"/></g>
<g class="eg-yas"><path class="eg-damla" d="M68 90Q64 100 68 104Q72 100 68 90Z" fill="#7cc8f5"/><path class="eg-damla" d="M132 90Q128 100 132 104Q136 100 132 90Z" fill="#7cc8f5"/></g>
<g class="eg-lekeler"></g>
</g>
</g>
</svg>`;

export class Ege {
  readonly el: HTMLElement;
  private svgEl: SVGSVGElement;
  private balonEl: HTMLElement;
  private temel: EgeIfade = 'bakiyor';
  private gecici = 0;
  private kirp = 0;
  private simdiki: EgeIfade = 'bakiyor';

  constructor() {
    this.balonEl = h('div.eg-balon');
    this.el = h('div.eg-ege', { 'data-ege': 'bebek' }, h('div.eg-bebek', { html: SVG }), this.balonEl);
    this.svgEl = this.el.querySelector('svg')!;
    this.goster('bakiyor');
    this.kirpPlanla();
  }

  private goster(ad: EgeIfade) {
    this.simdiki = ad;
    const [g, a, kas, yas] = IFADE[ad];
    const s = this.svgEl;
    s.dataset.goz = g;
    s.dataset.agiz = a;
    s.classList.toggle('kasli', !!kas);
    s.classList.toggle('agliyor', !!yas);
    this.el.dataset.ifade = ad;
  }

  /** İfade; ms verilirse o süre sonra temel ifadeye döner, verilmezse yeni temel ifade olur */
  ifade(ad: EgeIfade, ms = 0) {
    clearTimeout(this.gecici);
    if (!ms) this.temel = ad;
    this.goster(ad);
    if (ms) this.gecici = window.setTimeout(() => this.goster(this.temel), ms);
  }

  get ifadeAdi() {
    return this.simdiki;
  }

  /** Ara sıra göz kırpar (gözler açıkken) */
  private kirpPlanla() {
    clearTimeout(this.kirp);
    this.kirp = window.setTimeout(() => {
      if (!this.el.isConnected && this.el.dataset.baglandi) return;
      if (this.el.isConnected) this.el.dataset.baglandi = '1';
      const s = this.svgEl;
      if (s.dataset.goz === 'acik' || s.dataset.goz === 'iri') {
        const g = s.dataset.goz;
        s.dataset.goz = 'kapali';
        setTimeout(() => {
          if (s.dataset.goz === 'kapali') s.dataset.goz = g;
        }, 130);
      }
      this.kirpPlanla();
    }, 2200 + Math.random() * 2600);
  }

  /** Başını çevir: -1 sola (ayı), 1 sağa (civciv), 0 önüne */
  bak(yon: -1 | 0 | 1) {
    this.el.style.setProperty('--bak', String(yon));
  }

  /** Ayak sallama (sevinç / yemek) */
  ayakSalla(ms = 900) {
    if (AZ_HAREKET) return;
    this.el.classList.remove('ayak');
    void this.el.offsetWidth;
    this.el.classList.add('ayak');
    setTimeout(() => this.el.classList.remove('ayak'), ms);
  }

  /** Kıpırdanma / zıplama */
  kipir(guc = 1) {
    this.el.querySelector('.eg-bebek')!.animate(
      [{ transform: 'translateY(0) scale(1)' }, { transform: `translateY(${-4 * guc}%) scale(${1 - 0.03 * guc}, ${1 + 0.04 * guc})` }, { transform: 'translateY(0) scale(1.03, 0.97)' }, { transform: 'translateY(0) scale(1)' }],
      { duration: 420, easing: 'ease-out' },
    );
  }

  /** Başın üstünde minik kalpler */
  kalpler(adet = 5) {
    for (let i = 0; i < adet; i++) {
      const k = h('i.eg-kalp', { style: `--i:${i};--x:${(i - (adet - 1) / 2) * 16}%` });
      this.el.append(k);
      setTimeout(() => k.remove(), 1800);
    }
  }

  async balon(yazi: string, ms = 1300) {
    this.balonEl.textContent = yazi;
    this.balonEl.classList.remove('acik');
    void this.balonEl.offsetWidth;
    this.balonEl.classList.add('acik');
    await new Promise((r) => setTimeout(r, ms));
    this.balonEl.classList.remove('acik');
  }

  set onluk(tak: boolean) {
    this.svgEl.classList.toggle('onluklu', tak);
  }

  /** Yüzüne bir mama lekesi ekler (ağız çevresine) */
  lekeEkle() {
    const g = this.svgEl.querySelector('.eg-lekeler')!;
    const n = g.childElementCount;
    const yerler = [[86, 128], [118, 126], [72, 116], [128, 112], [100, 134], [80, 100], [124, 96]];
    const [x, y] = yerler[n % yerler.length];
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    c.setAttribute('cx', String(x + Math.random() * 4 - 2));
    c.setAttribute('cy', String(y + Math.random() * 4 - 2));
    c.setAttribute('rx', String(7 + Math.random() * 3));
    c.setAttribute('ry', String(5 + Math.random() * 2));
    c.setAttribute('fill', '#f2c14e');
    c.setAttribute('stroke', '#c98e22');
    c.setAttribute('stroke-width', '1.5');
    c.classList.add('eg-leke');
    g.append(c);
  }

  /** Silinmemiş lekeler */
  lekeler(): SVGElement[] {
    return [...this.svgEl.querySelectorAll<SVGElement>('.eg-leke:not(.silindi)')];
  }

  /** Bir noktanın (ekran px) çevresindeki lekeleri siler; silinen var mı */
  sil(px: number, py: number, yaricap: number, miktar: number): boolean {
    let degisti = false;
    for (const l of this.lekeler()) {
      const r = l.getBoundingClientRect();
      const d = Math.hypot(r.left + r.width / 2 - px, r.top + r.height / 2 - py);
      if (d > yaricap + r.width / 2) continue;
      const o = Number(l.dataset.o ?? 1) - miktar;
      l.dataset.o = String(o);
      l.style.opacity = String(Math.max(0, o));
      if (o <= 0) l.classList.add('silindi');
      degisti = true;
    }
    return degisti;
  }

  /** Ağzın ekrandaki konumu (kaşık hedefi) */
  agizKutusu(): DOMRect {
    const y = this.yuzKutusu();
    return new DOMRect(y.left + y.width * 0.3, y.top + y.height * 0.6, y.width * 0.4, y.height * 0.35);
  }

  /** Yüzün ekrandaki kutusu */
  yuzKutusu(): DOMRect {
    return this.svgEl.querySelector('.eg-kafa > circle:nth-of-type(3)')!.getBoundingClientRect();
  }

  kapat() {
    clearTimeout(this.gecici);
    clearTimeout(this.kirp);
  }
}
