/**
 * Tart Bakalım kantarı: üstte leğen (terazi kefesi çizimi, zincirsiz), kısa sap, kadran (terazi tabanı çiziminin
 * kadranı) ve ahşap ayak. Leğende gerçek 2B fizik (fizik.ts): meyveler düşer, seker, yuvarlanır, yığılır; çarpınca
 * yumuşakça ezilip yaylanır ve ses çıkarır. Kadranın ibresi yaylı: her meyvede sallanıp yeni yerine oturur,
 * leğen de hafifçe yaylanır. Tartmada kadranda renkli bölgeler (rakam yok): yeşil = tamam, kırmızımsı = fazla.
 *
 * Etkileşim: leğene hafif dokunuş leğeni sarsar; meyveye dokunmak onu zıplatır; meyveyi sürükleyip çıkarmak
 * (kasaya, komposta) ekran tarafından karara bağlanır (tutuldu / birakildi).
 * Başarım: en çok ~12 cisim, uyuyan cisim çizilmez, her şey durunca döngü durur, sayfa gizlenince durur.
 * Yalnız transform (cisimler, ibre, leğen yayı).
 */
import { h, TEST_MODU } from '../../src/ui/dom';
import { type Cisim, type Dunya } from './fizik';
import { adres } from './gorsel';
import { ARKA_KIRP, legenDunyasi, LEGEN_BOY, LEGEN_KESIT, ON_KIRP } from './tart-legen';
import { carpmaSesi, sarsSesi } from './tart-ses';
import { BOLGE_ACI, ibreAcisi, IBRE_EN, toplam, yaricap, type KasaMeyve, type TartIstek } from './tart';

const K = '#5a3617';
const AZ = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const ras = (a: number, b: number) => a + Math.random() * (b - a);

/** Açılış düğmesinin ikonu: kadranlı küçük kantar ve domates */
export const KANTAR_IKON = `<svg viewBox="0 0 48 48" aria-hidden="true">
  <path d="M6 20h36l-4 8H10z" fill="#f3c04f" stroke="${K}" stroke-width="3.5" stroke-linejoin="round"/>
  <circle cx="19" cy="14" r="7" fill="#f0413f" stroke="${K}" stroke-width="3"/><circle cx="30" cy="15" r="6" fill="#ff8a2b" stroke="${K}" stroke-width="3"/>
  <path d="M16 8l3 2 3-2" fill="none" stroke="#3d9a32" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M10 44a14 14 0 0 1 28 0z" fill="#fdf1d6" stroke="${K}" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M24 44l5-9" stroke="#f0413f" stroke-width="3.5" stroke-linecap="round"/><path d="M20 30v-2" stroke="${K}" stroke-width="3"/>
</svg>`;

/** Kadran çizimi (terazi-taban.webp'nin üst kısmı, 691 × 380): yüzün merkezi ve yarıçapı */
const KX = 345;
const KY = 322;
const KR = 280;
const kutup = (aci: number, r: number) => {
  const t = ((aci - 90) * Math.PI) / 180;
  return [KX + r * Math.cos(t), KY + r * Math.sin(t)] as const;
};
/** Halka dilimi (açılar derece, 0 yukarı) */
function dilim(a0: number, a1: number, r0: number, r1: number) {
  const [x0, y0] = kutup(a0, r1);
  const [x1, y1] = kutup(a1, r1);
  const [x2, y2] = kutup(a1, r0);
  const [x3, y3] = kutup(a0, r0);
  const b = a1 - a0 > 180 ? 1 : 0;
  return `M${x0.toFixed(1)} ${y0.toFixed(1)}A${r1} ${r1} 0 ${b} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}A${r0} ${r0} 0 ${b} 0 ${x3.toFixed(1)} ${y3.toFixed(1)}Z`;
}

/** Kadranın yüzü: krem zemin (çizimin yeşil dilimini örter), kalın çentikler; tartmada renkli bölgeler */
function kadranYuzu(ist: TartIstek | null): string {
  const cent = [-80, -60, -40, -20, 0, 20, 40, 60, 80]
    .map((a) => {
      const [x0, y0] = kutup(a, a % 40 === 0 ? 196 : 212);
      const [x1, y1] = kutup(a, 248);
      return `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)}L${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="${K}" stroke-width="${a % 40 === 0 ? 15 : 11}" stroke-linecap="round"/>`;
    })
    .join('');
  let bolge = '';
  if (ist?.mod === 'tart') {
    const [r0, r1] = [150, 262];
    const z = BOLGE_ACI;
    bolge = `
      <path d="${dilim(-IBRE_EN - 4, -z, r0, r1)}" fill="url(#tb-once)"/>
      <path d="${dilim(z, IBRE_EN + 4, r0, r1)}" fill="url(#tb-sonra)"/>
      <path class="tb-yesil" d="${dilim(-z, z, r0 - 30, r1 + 6)}" fill="url(#tb-yesil)" stroke="${K}" stroke-width="9" stroke-linejoin="round"/>
      <path d="${dilim(-z + 5, z - 5, r1 - 30, r1 - 12)}" fill="#fff" opacity=".45"/>`;
  }
  return `<svg class="tb-yuz" viewBox="0 0 691 380" aria-hidden="true">
    <defs>
      <linearGradient id="tb-yesil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ee86a"/><stop offset="1" stop-color="#3fae2f"/></linearGradient>
      <linearGradient id="tb-once" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#fff3c4"/><stop offset="1" stop-color="#ffd76a"/></linearGradient>
      <linearGradient id="tb-sonra" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb08a"/><stop offset="1" stop-color="#ff7a6b"/></linearGradient>
      <radialGradient id="tb-gobek" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fff2b8"/><stop offset=".45" stop-color="#f3c04f"/><stop offset="1" stop-color="#c98a22"/></radialGradient>
    </defs>
    <path d="M${KX - KR} ${KY}A${KR} ${KR - 6} 0 0 1 ${KX + KR} ${KY}Z" fill="#fdf1d6"/>
    ${bolge}
    ${cent}
  </svg>`;
}

/** İbre (göbeğin çevresinde döner) ve göbek */
const IBRE = `<svg class="tb-ibre-svg" viewBox="0 0 691 380" aria-hidden="true">
  <g class="tb-ibre"><path d="M${KX - 15} ${KY + 4} L${KX - 6} ${KY - 236} Q${KX} ${KY - 252} ${KX + 6} ${KY - 236} L${KX + 15} ${KY + 4} Z" fill="#F0413F" stroke="${K}" stroke-width="9" stroke-linejoin="round"/>
  <path d="M${KX - 3} ${KY - 40} L${KX - 2} ${KY - 200}" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6"/></g>
  <path d="M${KX - 70} ${KY + 2} A70 70 0 0 1 ${KX + 70} ${KY + 2} Z" fill="url(#tb-gobek)" stroke="${K}" stroke-width="9" stroke-linejoin="round"/>
  <ellipse cx="${KX - 22}" cy="${KY - 38}" rx="16" ry="9" fill="#fff" opacity=".75" transform="rotate(-30 ${KX - 22} ${KY - 38})"/>
</svg>`;

/** Çürük meyvenin lekeleri (yer tutucu; Gemini çizimi gelene kadar: ekip/gemini/IS-LISTESI-YENI.md) */
export const CURUK_LEKE = `<svg class="tb-leke" viewBox="0 0 100 100" aria-hidden="true">
  <g fill="#7a4a1c" stroke="#4a2a0c" stroke-width="2.5" stroke-linejoin="round">
    <path d="M30 40 q8 -10 18 -3 q9 6 1 15 q-7 8 -16 3 q-9 -6 -3 -15z" opacity=".92"/>
    <path d="M60 58 q7 -4 11 2 q4 7 -3 11 q-7 3 -10 -3 q-2 -6 2 -10z" opacity=".9"/>
    <path d="M36 66 q4 -3 7 0 q3 4 -1 6 q-4 2 -6 -2z" opacity=".85"/>
  </g>
  <g fill="#a8743a" opacity=".55"><ellipse cx="37" cy="44" rx="5" ry="3"/><ellipse cx="64" cy="61" rx="3" ry="2"/></g>
  <path d="M55 30 q6 3 9 9" fill="none" stroke="#4a2a0c" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>
</svg>`;
/** Çürüğün çevresinde dönen sinek (kanatları çırpar) */
export const SINEK = `<svg class="tb-sinek-svg" viewBox="0 0 40 30" aria-hidden="true">
  <g class="tb-kanat"><ellipse cx="15" cy="9" rx="8" ry="6" fill="#e8f6ff" stroke="${K}" stroke-width="2" opacity=".9"/><ellipse cx="25" cy="9" rx="8" ry="6" fill="#e8f6ff" stroke="${K}" stroke-width="2" opacity=".9"/></g>
  <ellipse cx="20" cy="18" rx="9" ry="7" fill="#3a3a48" stroke="${K}" stroke-width="2"/>
  <circle cx="27" cy="16" r="3.2" fill="#fff"/><circle cx="27.6" cy="16" r="1.6" fill="#222"/>
</svg>`;

/** Meyvenin çizimi (çürükse lekeler ve sinek) */
export function meyveCizimi(km: KasaMeyve, sinek = true): HTMLElement {
  // çürüğün kendi çizimi geldiyse o (assets/pazar/domates-curuk.webp, Gemini); yoksa sağlam çizim + lekeler
  const curukUrl = km.curuk ? adres(`pazar/${km.meyve}-curuk`) : '';
  const url = curukUrl || adres(`meyveler/${km.meyve}`);
  const ic = h(`div.tb-meyve-ic${km.curuk && !curukUrl ? '.tb-curuk' : ''}`, {}, url ? h('img', { src: url, alt: '', draggable: 'false' }) : h('i.tb-yedek'));
  if (km.curuk && !curukUrl) ic.append(h('div.tb-leke-yer', { html: CURUK_LEKE }));
  const el = h('div.tb-meyve-cizim', {}, ic);
  if (km.curuk && sinek) el.append(h('i.tb-sinek', { html: SINEK, style: `--g:${ras(-2, 0).toFixed(2)}s` }));
  return el;
}

interface Govde {
  c: Cisim;
  km: KasaMeyve;
  el: HTMLElement;
  ic: HTMLElement;
  /** son çizilen dönüşüm (değişmediyse yazılmaz) */
  son: string;
}

export interface KantarOlay {
  /** meyve leğene ilk kez değdi */
  degdi?: (km: KasaMeyve, ilk: boolean) => void;
  /** leğendeki meyve parmakla tutuldu */
  tutuldu?: (km: KasaMeyve) => void;
  /**
   * tutulan meyve bırakıldı (leğenin dışında): ekran nereye gittiğine karar verir. true dönerse meyve leğenden
   * çıkar (ekran kendi canlandırmasını yapar), false dönerse leğene geri düşer.
   */
  disari?: (km: KasaMeyve, x: number, y: number, kutu: DOMRect) => boolean;
  /** parmak sürüklerken (kompost vurgusu için) */
  tasiniyor?: (x: number, y: number) => void;
  /** ağırlık değişti (leğene değen meyveler) */
  agirlik?: (kg: number) => void;
}

export class Kantar {
  readonly el: HTMLElement;
  /** bırakma alanı: leğen ve üstündeki boşluk */
  readonly hedef: HTMLElement;
  readonly legen: HTMLElement;
  private kefeKutu: HTMLElement;
  private fizikEl: HTMLElement;
  private yuzYer: HTMLElement;
  private ibre: SVGGElement | null;
  private dunya: Dunya;
  private govdeler: Govde[] = [];
  private ist: TartIstek | null = null;
  private raf = 0;
  private son = 0;
  private o = 2;
  private aci = -IBRE_EN;
  private aciHiz = 0;
  private sag = 0;
  private sagHiz = 0;
  private kg = 0;
  private acik = true;
  private girdi = true;
  private ro: ResizeObserver | null;
  private sonSes = 0;
  private tutulan: { g: Govde; id: number; x0: number; y0: number; uzak: number; t0: number; px: number; py: number; pt: number; vx: number; vy: number } | null = null;
  olay: KantarOlay = {};

  constructor() {
    const kefe = adres('pazar/terazi-kefe');
    const taban = adres('pazar/terazi-taban');
    const kefeStil = (kirp: string) => `background-image:url("${kefe}");clip-path:${kirp}`;
    this.fizikEl = h('div.tb-fizik');
    this.kefeKutu = h(
      'div.tb-kefe-kutu',
      {},
      h('i.tb-legen-arka', { style: kefeStil(ARKA_KIRP) }),
      this.fizikEl,
      h('i.tb-legen-on', { style: kefeStil(ON_KIRP) }),
    );
    this.legen = h('div.tb-legen', { style: `aspect-ratio:100/${LEGEN_BOY.toFixed(3)}` }, this.kefeKutu);
    this.hedef = h('div.tb-hedef', { 'aria-hidden': 'true' });
    this.yuzYer = h('div.tb-yuz-yer', { html: kadranYuzu(null) });
    const ibreYer = h('div.tb-ibre-yer', { html: IBRE });
    this.ibre = ibreYer.querySelector('.tb-ibre');
    const tabanStil = `background-image:url("${taban}")`;
    this.el = h(
      'div.tb-kantar',
      { role: 'region', 'aria-label': 'Kantar' },
      h('i.tb-ayak', { style: tabanStil }),
      h('i.tb-sap', { style: tabanStil }),
      h('div.tb-kadran', { style: tabanStil }, this.yuzYer, ibreYer),
      this.legen,
      this.hedef,
    );
    this.dunya = legenDunyasi();
    this.dunya.carpinca = (x) => this.carpti(x.c, x.hiz, x.diger, x.ilk);
    this.ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => this.olc()) : null;
    this.ro?.observe(this.legen);
    this.el.addEventListener('pointerdown', this.bas);
    this.el.addEventListener('pointermove', this.kaydir);
    this.el.addEventListener('pointerup', this.birakti);
    this.el.addEventListener('pointercancel', this.birakti);
    document.addEventListener('visibilitychange', this.gorunurluk);
    this.ibreCiz();
    this.uyan();
  }

  /** Yeni müşteri: kadranın yüzü (tartmada bölgeler), leğen boşalır */
  ayarla(ist: TartIstek) {
    this.ist = ist;
    this.yuzYer.innerHTML = kadranYuzu(ist);
    this.el.dataset.mod = ist.mod;
    this.bosalt();
  }

  bosalt() {
    for (const g of this.govdeler) g.el.remove();
    this.govdeler = [];
    for (const c of [...this.dunya.cisimler]) this.dunya.cikar(c);
    this.agirlikGuncelle();
  }

  /** Leğendeki (parmakta olmayan) meyveler */
  get icindekiler(): KasaMeyve[] {
    return this.govdeler.filter((g) => !g.c.tutuluyor).map((g) => g.km);
  }
  get adet() {
    return this.govdeler.length;
  }
  /** Teraziye değmiş meyvelerin ağırlığı (kg) */
  get agirlik() {
    return this.kg;
  }

  /** Bir piksel kaç fizik birimi: leğenin eni 100 birim */
  private olc() {
    const w = this.legen.offsetWidth;
    if (!w) return;
    this.o = w / 100;
    this.el.style.setProperty('--o', String(this.o));
    for (const g of this.govdeler) g.son = '';
    this.ciz(true);
  }

  /** Ekran noktası → dünya birimi */
  private dunyada(x: number, y: number): [number, number] {
    const r = this.fizikEl.getBoundingClientRect();
    const o = r.width / 100 || this.o;
    return [(x - r.left) / o, (y - r.top) / o];
  }

  /** Bu x'teki yığının tepesi (yeni meyve oraya doğar, cisimlerin içinde doğmasın) */
  private yiginTepesi(x: number, r: number): number {
    let ust = LEGEN_KESIT[0][1] - r - 1;
    for (const g of this.govdeler) {
      const c = g.c;
      if (c.tutuluyor) continue;
      const dx = Math.abs(c.x - x);
      const R = c.r + r + 0.5;
      if (dx < R) ust = Math.min(ust, c.y - Math.sqrt(R * R - dx * dx));
    }
    return ust;
  }

  /** Kasadan gelen meyveyi ekran noktasında leğene bırakır (vx, vy: parmağın hızı, px/sn) */
  birak(km: KasaMeyve, x: number, y: number, vx = 0, vy = 0): void {
    const r = yaricap(km);
    let [wx, wy] = this.dunyada(x, y);
    const k = LEGEN_KESIT;
    wx = Math.max(k[0][0] + r + 0.5, Math.min(k[k.length - 1][0] - r - 0.5, wx));
    wy = Math.min(wy, this.yiginTepesi(wx, r));
    const c = this.dunya.ekle(wx, wy, r, { sek: km.meyve === 'patates' ? 0.18 : km.meyve === 'elma' ? 0.38 : 0.3 });
    // fırlatılan meyve fırlatıldığı yönde uçar (sınırlı)
    c.vx = Math.max(-260, Math.min(260, vx / this.o));
    c.vy = Math.max(-300, Math.min(400, vy / this.o));
    c.w = ras(-3, 3);
    c.a = ras(-0.4, 0.4);
    this.govdeEkle(c, km);
  }

  private govdeEkle(c: Cisim, km: KasaMeyve) {
    const cizim = meyveCizimi(km);
    const el = h('div.tb-govde', { style: `width:calc(${(c.r * 2).toFixed(2)} * var(--o) * 1px);height:calc(${(c.r * 2).toFixed(2)} * var(--o) * 1px)`, 'data-meyve': km.meyve, 'data-curuk': km.curuk ? '1' : '0' }, cizim);
    const ic = cizim.querySelector<HTMLElement>('.tb-meyve-ic')!;
    this.fizikEl.append(el);
    const g: Govde = { c, km, el, ic, son: '' };
    this.govdeler.push(g);
    this.ciz(true);
    this.uyan();
  }

  /** Meyveyi leğenden alır: ekrandaki kutusunu döner (canlandırma için) */
  al(km: KasaMeyve): DOMRect | null {
    const g = this.govdeler.find((x) => x.km === km);
    if (!g) return null;
    const r = g.ic.getBoundingClientRect();
    g.el.remove();
    this.govdeler.splice(this.govdeler.indexOf(g), 1);
    this.dunya.cikar(g.c);
    this.agirlikGuncelle();
    this.uyan();
    return r;
  }

  /** Meyvenin ekrandaki kutusu */
  kutu(km: KasaMeyve): DOMRect | null {
    return this.govdeler.find((x) => x.km === km)?.ic.getBoundingClientRect() ?? null;
  }

  /** Leğeni hafifçe sarsar (dokunuş) */
  sars(guc = 1) {
    this.dunya.sars(170 * guc);
    this.sagHiz += 40 * guc;
    this.aciHiz += ras(-60, 60) * guc;
    this.legen.classList.remove('tb-sarsildi');
    void this.legen.offsetWidth;
    this.legen.classList.add('tb-sarsildi');
    sarsSesi();
    this.uyan();
  }

  /** Meyveyi leğende zıplatır (dokunuş) */
  private zipla(g: Govde) {
    this.dunya.uyandir();
    g.c.vy = -320;
    g.c.vx += ras(-40, 40);
    g.c.w += ras(-8, 8);
    g.c.ezHiz -= 2;
    this.uyan();
  }

  private carpti(c: Cisim, hiz: number, diger: Cisim | null, ilk: boolean) {
    const g = this.govdeler.find((x) => x.c === c);
    if (!g) return;
    if (ilk) {
      this.agirlikGuncelle();
      this.olay.degdi?.(g.km, true);
      // kadran: yeni ağırlıkla ibre sıçrar, leğen yaylanır
      this.aciHiz += Math.min(240, hiz * 0.35);
      this.sagHiz += Math.min(60, hiz * 0.12);
    } else if (!diger && hiz > 120) {
      this.sagHiz += Math.min(30, hiz * 0.05);
      this.aciHiz += Math.min(90, hiz * 0.1);
    }
    const t = this.dunya.t;
    if (hiz > 45 && t - c.sonSes > 0.09 && performance.now() - this.sonSes > 28) {
      c.sonSes = t;
      this.sonSes = performance.now();
      carpmaSesi(g.km.meyve, Math.min(1, hiz / 650), !!diger);
    }
  }

  private agirlikGuncelle() {
    const kg = toplam(this.govdeler.filter((g) => g.c.degdi && !g.c.tutuluyor).map((g) => g.km));
    if (kg === this.kg) return;
    this.kg = kg;
    this.el.dataset.kg = kg.toFixed(3);
    this.olay.agirlik?.(kg);
    this.uyan();
  }

  // ---------------------------------------------------------------- dokunma
  private isabet(x: number, y: number): Govde | null {
    const [wx, wy] = this.dunyada(x, y);
    let en: Govde | null = null;
    let enUz = Infinity;
    for (const g of this.govdeler) {
      const d = Math.hypot(g.c.x - wx, g.c.y - wy);
      // küçük parmak için pay: yarıçapın biraz dışı da sayılır
      if (d < g.c.r + 3 && d < enUz) {
        en = g;
        enUz = d;
      }
    }
    return en;
  }

  private readonly bas = (e: PointerEvent) => {
    if (this.tutulan || (e.pointerType === 'mouse' && e.button !== 0) || !this.acik || !this.girdi) return;
    const g = this.isabet(e.clientX, e.clientY);
    if (!g) {
      // leğene ya da kadrana dokundu: hafif sarsıntı
      const lr = this.legen.getBoundingClientRect();
      if (e.clientY > lr.top - lr.height * 0.4) this.sars(0.8);
      return;
    }
    e.preventDefault();
    try {
      this.el.setPointerCapture(e.pointerId);
    } catch {
      /* yok say */
    }
    const t = performance.now();
    this.tutulan = { g, id: e.pointerId, x0: e.clientX, y0: e.clientY, uzak: 0, t0: t, px: e.clientX, py: e.clientY, pt: t, vx: 0, vy: 0 };
  };

  private readonly kaydir = (e: PointerEvent) => {
    const tu = this.tutulan;
    if (!tu || e.pointerId !== tu.id) return;
    tu.uzak = Math.max(tu.uzak, Math.hypot(e.clientX - tu.x0, e.clientY - tu.y0));
    const t = performance.now();
    const dt = Math.max(8, t - tu.pt) / 1000;
    tu.vx = tu.vx * 0.5 + ((e.clientX - tu.px) / dt) * 0.5;
    tu.vy = tu.vy * 0.5 + ((e.clientY - tu.py) / dt) * 0.5;
    tu.px = e.clientX;
    tu.py = e.clientY;
    tu.pt = t;
    if (tu.uzak < 10) return;
    const c = tu.g.c;
    if (!c.tutuluyor) {
      // parmağa alındı: fizikten çıkar, ağırlıktan düşer, ötekiler uyanır
      c.tutuluyor = true;
      c.vx = c.vy = 0;
      tu.g.el.classList.add('tb-tutulan');
      this.el.classList.add('tb-tutuyor');
      this.dunya.uyandir();
      this.agirlikGuncelle();
      this.olay.tutuldu?.(tu.g.km);
    }
    const [wx, wy] = this.dunyada(e.clientX, e.clientY);
    c.x = wx;
    c.y = wy;
    c.a += (tu.vx / this.o) * 0.0008;
    this.olay.tasiniyor?.(e.clientX, e.clientY);
    this.uyan();
  };

  private readonly birakti = (e: PointerEvent) => {
    const tu = this.tutulan;
    if (!tu || e.pointerId !== tu.id) return;
    this.tutulan = null;
    const g = tu.g;
    const c = g.c;
    if (!c.tutuluyor) {
      // dokunuş: meyve leğende zıplar
      if (e.type === 'pointerup') this.zipla(g);
      return;
    }
    g.el.classList.remove('tb-tutulan');
    this.el.classList.remove('tb-tutuyor');
    const hr = this.hedef.getBoundingClientRect();
    const legende = e.clientX > hr.left - 20 && e.clientX < hr.right + 20 && e.clientY > hr.top - 30 && e.clientY < hr.bottom + 20;
    if (!legende && e.type === 'pointerup' && this.olay.disari?.(g.km, e.clientX, e.clientY, g.ic.getBoundingClientRect())) {
      this.al(g.km);
      return;
    }
    // leğene geri düşer (fırlatılırsa fırlatıldığı yöne)
    c.tutuluyor = false;
    c.degdi = false;
    const k = LEGEN_KESIT;
    c.x = Math.max(k[0][0] + c.r + 0.5, Math.min(k[k.length - 1][0] - c.r - 0.5, c.x));
    // başka bir cismin içine bırakılmasın
    for (const x of this.govdeler) if (x !== g && !x.c.tutuluyor && Math.hypot(x.c.x - c.x, x.c.y - c.y) < x.c.r + c.r) c.y = Math.min(c.y, this.yiginTepesiHaric(c.x, c.r, g));
    c.vx = Math.max(-260, Math.min(260, tu.vx / this.o));
    c.vy = Math.max(-300, Math.min(400, tu.vy / this.o));
    this.dunya.uyandir();
    this.uyan();
  };

  private yiginTepesiHaric(x: number, r: number, haric: Govde): number {
    const tut = haric.c.tutuluyor;
    haric.c.tutuluyor = true;
    const y = this.yiginTepesi(x, r);
    haric.c.tutuluyor = tut;
    return y;
  }

  // ---------------------------------------------------------------- döngü
  private readonly gorunurluk = () => {
    if (document.hidden) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    } else this.uyan();
  };

  /** Döngüyü (duruyorsa) başlatır */
  uyan() {
    if (this.raf || !this.acik || (typeof document !== 'undefined' && document.hidden)) return;
    this.son = performance.now();
    this.raf = requestAnimationFrame(this.kare);
  }

  private readonly kare = (t: number) => {
    this.raf = 0;
    const dt = Math.min(0.05, Math.max(0, (t - this.son) / 1000));
    this.son = t;
    this.dunya.adim(dt);
    // test modunda ibre ve leğen hemen yerine oturur
    const hedefAci = this.ist ? ibreAcisi(this.ist, this.kg) : -IBRE_EN;
    const hedefSag = Math.min(4, this.kg * 2.4);
    if (TEST_MODU || AZ) {
      this.aci = hedefAci;
      this.aciHiz = 0;
      this.sag = hedefSag;
      this.sagHiz = 0;
    } else {
      this.aciHiz += (60 * (hedefAci - this.aci) - 5.5 * this.aciHiz) * dt;
      this.aci += this.aciHiz * dt;
      this.sagHiz += (380 * (hedefSag - this.sag) - 16 * this.sagHiz) * dt;
      this.sag += this.sagHiz * dt;
    }
    // duran meyve yavaşça dik döner (sapı yukarı): ters duran elma / domates tuhaf görünmesin
    let donuyor = false;
    for (const g of this.govdeler) {
      const c = g.c;
      if (!c.uyuyor) continue;
      const dik = Math.round(c.a / (2 * Math.PI)) * 2 * Math.PI;
      const fark = dik - c.a;
      if (Math.abs(fark) < 0.004) continue;
      c.a += fark * Math.min(1, dt * 7);
      g.son = '';
      donuyor = true;
    }
    this.ibreCiz();
    this.ciz(false);
    const ibreDurdu = Math.abs(this.aci - hedefAci) < 0.15 && Math.abs(this.aciHiz) < 0.5 && Math.abs(this.sag - hedefSag) < 0.05 && Math.abs(this.sagHiz) < 0.2;
    if (!this.dunya.sakin || !ibreDurdu || this.tutulan || donuyor) this.raf = requestAnimationFrame(this.kare);
  };

  private ibreCiz() {
    const a = Math.max(-IBRE_EN - 8, Math.min(IBRE_EN + 8, this.aci));
    this.ibre?.setAttribute('transform', `rotate(${a.toFixed(2)} ${KX} ${KY})`);
    this.kefeKutu.style.transform = `translateY(${(this.sag * this.o * 0.5).toFixed(2)}px)`;
    this.el.dataset.aci = a.toFixed(1);
  }

  /** Cisimleri çizer (uyuyan / değişmeyen yazılmaz) */
  private ciz(hepsi: boolean) {
    const o = this.o;
    for (const g of this.govdeler) {
      const c = g.c;
      if (!hepsi && c.uyuyor && !c.ez && !c.ezHiz && g.son) continue;
      // çizim: konum ve ezilme; dönüş içteki resimde
      const ez = Math.max(-0.16, Math.min(0.26, c.ez));
      const s = `translate(${((c.x - c.r) * o).toFixed(1)}px, ${((c.y - c.r) * o).toFixed(1)}px) scale(${(1 + ez * 0.85).toFixed(3)}, ${(1 - ez).toFixed(3)})`;
      const d = `rotate(${c.a.toFixed(3)}rad)`;
      if (s !== g.son || hepsi || !c.uyuyor) {
        g.el.style.transform = s;
        g.ic.style.transform = d;
        g.son = s;
      } else g.ic.style.transform = d;
    }
  }

  /** Teslim: leğendeki meyvelerin ekrandaki kutuları (sonra boşaltılır) */
  kutular(): { km: KasaMeyve; r: DOMRect; el: HTMLElement }[] {
    return this.govdeler.map((g) => ({ km: g.km, r: g.ic.getBoundingClientRect(), el: g.el }));
  }

  /** Etkileşimi açar / kapar (teslimde kapalı) */
  etkin(v: boolean) {
    this.girdi = v;
    this.el.classList.toggle('tb-kapali', !v);
  }

  kapat() {
    this.acik = false;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.ro?.disconnect();
    document.removeEventListener('visibilitychange', this.gorunurluk);
  }
}
