/**
 * Banyo bölümünün iki kahramanı: Mino (src/mino) ve Kino (src/karakter iskeleti).
 *
 * Kino: assets/karakter-iskelet/kino.* (ekip/kino/kino-final → scripts/karakter/iskelet-al.mjs). Başka bir Kino
 * seçeneği gelirse katman adları aynı kaldıkça kod değişmez; gerekirse yalnız KINO_ISKELET, KINO_KIRPIM ve
 * KINO_BOLGE güncellenir. İskelette fular / açık ağız / dışarıda dil katmanı yoksa (ör. geçici pazar köpeği:
 * KINO_ISKELET = 'kopek') bunlar kodla çizilir.
 *
 * Çamur, köpük, ıslaklık parıltısı ve Kino'nun ağzı çizimin kendi koordinatlarında, ilgili parçanın (kafa, gövde,
 * kuyruk, kulak, kol) katmanına eklenen SVG gruplarıdır: parça dönünce onlar da döner.
 */
import { Karakter, type Poz } from '../../src/karakter/karakter';
import { Mino, type Tepki } from '../../src/mino/mino';
import { MINO_DONGU_YOLU, MINO_KUTU_GENISLIK, YuruyenMino } from '../../src/mino/mino-profil';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { fularSvg } from './banyo-gorsel';
import type { Bolum, BolgeId, KisiAdi } from './banyo-mantik';

/** Kino'nun iskeleti (assets/karakter-iskelet/<ad>): Kino gelince 'kino' */
export const KINO_ISKELET = 'kino';
/** Kino çiziminin kırpımı (x, y, en, boy): Mino'yla aynı kutu oranı */
const KINO_KIRPIM: [number, number, number, number] = [370, 110, 1410, 1856];
/** Mino çiziminin viewBox'ı (src/mino/mino-svg.ts) */
const MINO_KUTU: [number, number, number, number] = [344, 140, 1360, 1790];

export const AZ_HAREKET = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, sure(ms)));
const K = '#3a1210';

interface BolgeTanim {
  x: number;
  y: number;
  r: number;
  /** Mino: sınıf (k kafa, g gövde, q kuyruk, kl sol kol); Kino: iskelet parçası */
  parca: string;
}
/** Vücut bölümleri (çizimin koordinatları) */
const MINO_BOLGE: Partial<Record<Bolum, BolgeTanim>> = {
  kulak: { x: 650, y: 390, r: 110, parca: 'k' },
  kafa: { x: 1030, y: 430, r: 150, parca: 'k' },
  gobek: { x: 1030, y: 1590, r: 115, parca: 'g' },
  pati: { x: 725, y: 1525, r: 88, parca: 'kl' },
  kuyruk: { x: 1565, y: 1265, r: 110, parca: 'q' },
};
const KINO_BOLGE: Partial<Record<Bolum, BolgeTanim>> = {
  kulak: { x: 470, y: 820, r: 120, parca: 'kulak-sol' },
  kafa: { x: 1030, y: 390, r: 150, parca: 'kafa' },
  burun: { x: 925, y: 860, r: 82, parca: 'kafa' },
  gobek: { x: 1030, y: 1610, r: 105, parca: 'govde' },
  sirt: { x: 1160, y: 1410, r: 80, parca: 'govde' },
  kuyruk: { x: 1420, y: 1440, r: 90, parca: 'kuyruk' },
};
/** Kino'nun fuları ve ağzı (çizim koordinatı) */
const KINO_FULAR: [number, number] = [975, 1300];
const KINO_AGIZ: [number, number] = [930, 1000];
/** Kino'nun kulakları sarkık: "kalkar / açılır" yönü Karakter'in kulak açısının tersi */
const KULAK_DIS = -1;

const NS = 'http://www.w3.org/2000/svg';
function svgEl<K extends keyof SVGElementTagNameMap>(ad: K, attrs: Record<string, string | number> = {}, html = ''): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, ad);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  if (html) e.innerHTML = html;
  return e;
}

/** Yumuşak, düzensiz leke yolu (çamur); tohumla sabit */
function lekeYolu(x: number, y: number, r: number, tohum: number) {
  const n = 12;
  const nokta: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (0.78 + 0.22 * Math.sin(tohum * 7.1 + i * 2.3) + 0.08 * Math.cos(tohum * 3 + i * 5));
    nokta.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.86]);
  }
  let d = `M${((nokta[0][0] + nokta[n - 1][0]) / 2).toFixed(0)} ${((nokta[0][1] + nokta[n - 1][1]) / 2).toFixed(0)}`;
  for (let i = 0; i < n; i++) {
    const p = nokta[i];
    const q = nokta[(i + 1) % n];
    d += ` Q${p[0].toFixed(0)} ${p[1].toFixed(0)} ${((p[0] + q[0]) / 2).toFixed(0)} ${((p[1] + q[1]) / 2).toFixed(0)}`;
  }
  return d + 'Z';
}

/** Köpük kümesi: beyaz baloncuklar (parlak vurgulu, açık gri-mavi kontur) */
export function kopukHtml(x: number, y: number, r: number, tohum: number) {
  let s = '';
  const n = 12;
  for (let i = 0; i < n; i++) {
    const a = tohum + i * 2.39;
    const d = r * 0.62 * Math.sqrt((i + 0.5) / n);
    const cx = x + Math.cos(a) * d;
    const cy = y + Math.sin(a) * d * 0.85;
    const rr = r * (0.28 + 0.14 * Math.sin(tohum + i * 1.7));
    s += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${rr.toFixed(0)}" fill="#fff" stroke="#b9c9d8" stroke-width="${(r * 0.05).toFixed(1)}"/>`;
    s += `<circle cx="${(cx - rr * 0.35).toFixed(0)}" cy="${(cy - rr * 0.38).toFixed(0)}" r="${(rr * 0.22).toFixed(0)}" fill="#dff3ff"/>`;
  }
  return s;
}

export type KinoHareket = 'silkelen' | 'ulu' | 'titre' | 'tekme' | 'coskulu' | 'yuz' | 'kulakDik' | 'ic' | 'dinle' | 'bak' | 'dans' | 'sevin';
/** Kino'nun çizilmiş yüz ifadeleri (ekip/kino/IFADELER.md) */
export type KinoIfade = 'heyecan' | 'sicak' | 'titreme' | 'keyif' | 'uluma' | 'uzgun' | 'saskin';
/** Kendi yüzü olan hareketler */
const KINO_OTO_IFADE: Partial<Record<KinoHareket, KinoIfade>> = { coskulu: 'heyecan', yuz: 'heyecan', ulu: 'uluma', titre: 'titreme', dans: 'heyecan', sevin: 'heyecan' };
/**
 * Kino'nun kolu omuzdan en çok bu kadar kalkar (derece): fazlasında omuz dikişi ve kol ucunda kontur izi görünüyor
 * (iskelet kolu -5 … 60'a izin verir; 25°'den sonra omuzda yarık görünüyor, banyo hareketleri 20'de kalır).
 */
const KINO_KOL_EN_COK = 20;
/** Kuyruk kökünden en çok bu kadar döner (derece; aşağı yalnız %40'ı): fazlasında kökte beyaz yarık görünüyor */
const KINO_KUYRUK_EN_COK = 20;
/** Mino'nun hâl çizimleri (sırılsıklam / pofuduk) varken ifade eki bindirilen tepkiler: hâl yüzüyle uyuşmuyor */
const HAL_IFADESIZ = new Set<Tepki>(['zorlan', 'sersem', 'kararsiz']);
/** Köpük saçın şekilleri (aynı çizim: yatay, dikey esneme) */
const SAC_SEKIL: [number, number][] = [
  [1, 1],
  [1.28, 0.82],
  [0.84, 1.34],
];

export class Kisi {
  readonly ad: KisiAdi;
  /** konum katmanı (--x, --y alttan %, --w) */
  readonly el: HTMLElement;
  /** yol katmanı: yürüme / zıplama yayı (WAAPI) */
  readonly yol: HTMLElement;
  /** gövde katmanı: esneme-basılma, titreme, silkelenme (WAAPI) */
  readonly gov: HTMLElement;
  /** çizim kutusu (dokunma burada) */
  readonly kap: HTMLElement;
  readonly mino: Mino | null = null;
  /** Mino: önden ↔ yandan yürüyen sarmal (koşarken yana döner, adımları yola göre) */
  readonly yuruyen: YuruyenMino | null = null;
  readonly kar: Karakter | null = null;
  private balonEl: HTMLElement;
  private pofEl: HTMLElement | null = null;
  private damlaEl: HTMLElement;
  private hazirP: Promise<void>;
  private ekler = new Map<string, SVGGElement>();
  private bolgeler: Partial<Record<Bolum, BolgeTanim>>;
  private kutu: [number, number, number, number];
  /** Kino: özel hareket (ekHareket) */
  private ozel: { ad: KinoHareket; bas: number; sure: number; yon: number } | null = null;
  private kinoKonus = false;
  private kinoAgiz = 0;
  kinoIslak = false;
  kinoKulakYon = 0;

  constructor(ad: KisiAdi) {
    this.ad = ad;
    this.bolgeler = ad === 'mino' ? MINO_BOLGE : KINO_BOLGE;
    this.kutu = ad === 'mino' ? MINO_KUTU : KINO_KIRPIM;
    this.kap = h('div.bn-cizim');
    if (ad === 'mino') {
      this.mino = new Mino();
      this.yuruyen = new YuruyenMino(this.mino);
      this.kap.append(this.yuruyen.el);
      this.hazirP = Promise.resolve();
    } else {
      this.kar = new Karakter(KINO_ISKELET, h('div'));
      this.kap.append(this.kar.el);
      this.hazirP = this.kinoKur();
    }
    this.balonEl = h('div.mc-oy-balon.bn-balon');
    this.damlaEl = h('div.bn-damlalar', {}, ...Array.from({ length: 5 }, (_, i) => h('i', { style: `--i:${i}` })));
    this.gov = h('div.bn-kisi-gov', {}, this.kap, this.damlaEl);
    this.yol = h('div.bn-kisi-yol', {}, h('i.bn-kisi-golge'), this.gov);
    this.el = h('div.bn-kisi', { 'data-kisi': ad }, this.yol, this.balonEl);
  }

  /** Çizim hazır (Kino'nun iskeleti yüklendi) */
  hazir() {
    return this.hazirP;
  }

  private async kinoKur() {
    const kar = this.kar!;
    // iskeletin gelmesini bekle (yavaş cihazda 5 sn'yi geçebiliyor: eskiden beklemeyi bırakınca Kino'nun çamur /
    // dokunma bölgeleri hiç kurulmuyor, ilk görev takılıyordu)
    await kar.hazir;
    const s = this.svg();
    if (!s) return;
    s.setAttribute('viewBox', KINO_KIRPIM.join(' '));
    // iskelette fular yoksa (geçici çizim) mavi fular kodla takılır; boynun altında, kafanın arkasında
    const govde = this.parcaG('govde');
    if (govde && !this.parcaG('fular')) {
      const f = svgEl('g', { class: 'bn-kino-fular' });
      f.innerHTML = fularSvg('mavi').replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
      f.setAttribute('transform', `translate(${KINO_FULAR[0] - 178} ${KINO_FULAR[1] - 130}) scale(1.78)`);
      govde.append(f);
    }
    // açık ağız ve dışarıda dil: iskelette yoksa kodla
    const kafa = this.parcaG('kafa');
    const [ax, ay] = KINO_AGIZ;
    if (kafa && !this.parcaG('agiz-acik'))
      kafa.append(svgEl('g', { class: 'bn-kino-agiz' }, `<ellipse cx="${ax}" cy="${ay + 40}" rx="66" ry="52" fill="#6b1a1a" stroke="${K}" stroke-width="12"/><ellipse cx="${ax}" cy="${ay + 66}" rx="40" ry="22" fill="#ec7683"/>`));
    if (kafa && !this.parcaG('dil-disarida'))
      kafa.append(svgEl('g', { class: 'bn-kino-dil' }, `<path d="M${ax - 32} ${ay + 30} Q${ax - 34} ${ay + 110} ${ax} ${ay + 116} Q${ax + 36} ${ay + 110} ${ax + 32} ${ay + 30} Z" fill="#ec7683" stroke="${K}" stroke-width="11" stroke-linejoin="round"/>`));
    kar.ekHareket = (p, t) => this.kinoPoz(p, t);
  }

  svg(): SVGSVGElement | null {
    return this.kap.querySelector('svg');
  }

  private parcaG(parca: string): SVGGElement | null {
    const s = this.svg();
    if (!s) return null;
    if (this.ad === 'mino') {
      // Mino: aynı sınıfla yeni grup (mino.css o sınıfın dönüşümünü uygular)
      let g = this.ekler.get(parca);
      if (!g) {
        g = svgEl('g', { class: `${parca} bn-ek` });
        s.append(g);
        this.ekler.set(parca, g);
      }
      return g;
    }
    return s.querySelector<SVGGElement>(`g[data-parca="${parca}"]`);
  }

  bolge(b: Bolum): BolgeTanim | undefined {
    return this.bolgeler[b];
  }

  // ---------------------------------------------------------------- koordinat
  /** Çizim koordinatı → ekran (client) koordinatı */
  ekranda(x: number, y: number): [number, number] {
    const s = this.svg();
    const r = (s ?? this.kap).getBoundingClientRect();
    const [vx, vy, vw, vh] = this.kutu;
    return [r.left + ((x - vx) / vw) * r.width, r.top + ((y - vy) / vh) * r.height];
  }
  /** Ekran → çizim koordinatı */
  cizimde(cx: number, cy: number): [number, number] {
    const s = this.svg();
    const r = (s ?? this.kap).getBoundingClientRect();
    const [vx, vy, vw, vh] = this.kutu;
    return [vx + ((cx - r.left) / r.width) * vw, vy + ((cy - r.top) / r.height) * vh];
  }
  /** Çizim biriminin ekrandaki piksel karşılığı */
  birim(): number {
    const r = (this.svg() ?? this.kap).getBoundingClientRect();
    return r.width / this.kutu[2];
  }
  /** Dokunulan bölüm (yakınlık: bölge yarıçapı × pay) */
  bolgeBul(cx: number, cy: number, pay = 1.25, sadece?: Bolum[]): Bolum | null {
    const [x, y] = this.cizimde(cx, cy);
    let en: Bolum | null = null;
    let enD = Infinity;
    for (const [b, t] of Object.entries(this.bolgeler) as [Bolum, BolgeTanim][]) {
      if (sadece && !sadece.includes(b)) continue;
      const d = Math.hypot(x - t.x, y - t.y) / t.r;
      if (d < pay && d < enD) {
        en = b;
        enD = d;
      }
    }
    return en;
  }
  /** Bölümün ekrandaki merkezi */
  bolgeEkran(b: Bolum): [number, number] {
    const t = this.bolgeler[b];
    if (!t) {
      const r = this.kap.getBoundingClientRect();
      return [r.left + r.width / 2, r.top + r.height / 2];
    }
    return this.ekranda(t.x, t.y);
  }

  // ---------------------------------------------------------------- çamur, köpük, parıltı
  private sprite(b: Bolum, tur: string): SVGGElement | null {
    return this.kap.querySelector<SVGGElement>(`g.bn-${tur}[data-bolum="${b}"]`);
  }

  camurEkle(b: Bolum, tohum = 1) {
    const t = this.bolgeler[b];
    const g = t && this.parcaG(t.parca);
    if (!t || !g) return null;
    const r = t.r * 1.05;
    const e = svgEl('g', { class: 'bn-camur', 'data-bolum': b, 'data-bolge': `${this.ad}-${b}`, style: `transform-origin:${t.x}px ${t.y}px` });
    e.innerHTML =
      `<path d="${lekeYolu(t.x, t.y, r, tohum)}" fill="#8a5a33" stroke="#5a3620" stroke-width="${(r * 0.07).toFixed(0)}"/>` +
      `<path d="${lekeYolu(t.x - r * 0.12, t.y - r * 0.1, r * 0.55, tohum + 3)}" fill="#a06c40"/>` +
      `<circle cx="${t.x - r * 0.3}" cy="${t.y - r * 0.32}" r="${r * 0.12}" fill="#c89468"/>` +
      `<circle cx="${t.x + r * 0.95}" cy="${t.y + r * 0.55}" r="${r * 0.16}" fill="#8a5a33" stroke="#5a3620" stroke-width="${(r * 0.05).toFixed(0)}"/>` +
      `<circle cx="${t.x - r * 0.9}" cy="${t.y + r * 0.7}" r="${r * 0.1}" fill="#8a5a33"/>` +
      `<circle class="bn-isabet" cx="${t.x}" cy="${t.y}" r="${t.r * 1.15}" fill="transparent"/>`;
    g.append(e);
    return e;
  }

  camur(b: Bolum) {
    return this.sprite(b, 'camur');
  }

  /** Bu kişinin bütün çamur lekeleri */
  camurlar(): SVGGElement[] {
    return [...this.kap.querySelectorAll<SVGGElement>('g.bn-camur')];
  }

  /** Köpük: oran 0 (yok) … 1 (kabarık küme); ilk çağrıda oluşur */
  kopuk(b: Bolum, oran: number) {
    let e = this.sprite(b, 'kopuk');
    if (!e) {
      const t = this.bolgeler[b];
      const g = t && this.parcaG(t.parca);
      if (!t || !g) return;
      e = svgEl('g', { class: 'bn-kopuk', 'data-bolum': b, style: `transform-origin:${t.x}px ${t.y}px` });
      e.innerHTML = kopukHtml(t.x, t.y, t.r * 1.35, t.x % 7);
      g.append(e);
    }
    e.style.setProperty('--k', oran.toFixed(3));
    // köpük büyüdükçe altındaki çamur kaybolur
    const c = this.camur(b);
    if (c) c.style.opacity = String(Math.min(Number(c.style.opacity || 1), Math.max(0, 1 - oran * 1.4)));
  }
  kopukOrani(b: Bolum): number {
    const e = this.sprite(b, 'kopuk');
    return e ? Number(e.style.getPropertyValue('--k') || 0) : 0;
  }
  /** Bütün köpük bölümleri */
  kopukluBolumler(): Bolum[] {
    return [...this.kap.querySelectorAll<SVGGElement>('g.bn-kopuk')].filter((e) => Number(e.style.getPropertyValue('--k') || 0) > 0.02).map((e) => e.dataset.bolum as Bolum);
  }

  /** Bölge parlaması (3-4 yaş: nereyi ovalayacağı) */
  parla(b: Bolum | null) {
    this.kap.querySelectorAll('g.bn-parla').forEach((e) => e.remove());
    if (!b) return;
    const t = this.bolgeler[b];
    const g = t && this.parcaG(t.parca);
    if (!t || !g) return;
    const e = svgEl('g', { class: 'bn-parla', style: `transform-origin:${t.x}px ${t.y}px` });
    e.innerHTML = `<circle cx="${t.x}" cy="${t.y}" r="${t.r * 1.05}" fill="rgba(255,236,120,.28)" stroke="#ffd84a" stroke-width="${t.r * 0.1}" stroke-dasharray="${t.r * 0.3} ${t.r * 0.18}"/>`;
    g.append(e);
  }

  /**
   * Ovalamanın ilerleme halkası: bölgenin çevresinde dolan yeşil çember (0..1). b null: kaldırır.
   * Çocuk ne kadar kaldığını görür; dolunca bölge biter.
   */
  ilerlemeCiz(b: Bolum | null, oran = 0) {
    let e = this.kap.querySelector<SVGGElement>('g.bn-ilerleme');
    if (!b) {
      e?.remove();
      return;
    }
    const t = this.bolgeler[b];
    const g = t && this.parcaG(t.parca);
    if (!t || !g) return;
    const r = t.r * 1.3;
    const cevre = 2 * Math.PI * r;
    if (!e || e.dataset.bolum !== b) {
      e?.remove();
      e = svgEl('g', { class: 'bn-ilerleme', 'data-bolum': b });
      e.innerHTML =
        `<circle cx="${t.x}" cy="${t.y}" r="${r}" fill="none" stroke="rgba(255,255,255,.8)" stroke-width="${(t.r * 0.2).toFixed(0)}"/>` +
        `<circle class="bn-ilerleme-dolu" cx="${t.x}" cy="${t.y}" r="${r}" fill="none" stroke="#4fc94a" stroke-width="${(t.r * 0.2).toFixed(0)}" stroke-linecap="round" stroke-dasharray="0 ${cevre.toFixed(0)}" transform="rotate(-90 ${t.x} ${t.y})"/>`;
      g.append(e);
    }
    e.querySelector('.bn-ilerleme-dolu')?.setAttribute('stroke-dasharray', `${(cevre * Math.max(0, Math.min(1, oran))).toFixed(1)} ${cevre.toFixed(0)}`);
  }

  /**
   * Mino'nun tek bir parçasının donuk kopyası (saklambaç: arkadan görünen kuyruk ucu 'q', dikizleyen kafa 'k').
   * Asıl çizimle aynı kutu ve ölçek; yalnız o parça görünür (banyo.css → bn-klon-q / bn-klon-k).
   */
  minoKlon(parca: 'q' | 'k'): HTMLElement | null {
    if (!this.mino) return null;
    const k = this.mino.el.cloneNode(true) as HTMLElement;
    for (const c of [...k.classList]) if (c.startsWith('ifade-') || c === 'gozkapali' || c === 'mutlu' || c === 'uyuyor') k.classList.remove(c);
    for (const v of ['--govde', '--kafa', '--kuyruk', '--kol-sol', '--kol-sag']) k.style.setProperty(v, 'translate(0px, 0px)');
    k.classList.add(`bn-klon-${parca}`);
    // dokunma / test çemberleri ve parlamalar kopyada olmaz (asıl çizimde kalır)
    k.querySelectorAll('.bn-bolge, .bn-isabet, .bn-ilerleme, .bn-parla, .mino-zzz').forEach((e) => e.remove());
    return k;
  }

  /** Dokunma/test için görünmez bölge çemberleri (data-bolge) */
  isabetleriKur() {
    for (const [b, t] of Object.entries(this.bolgeler) as [Bolum, BolgeTanim][]) {
      if (this.kap.querySelector(`circle.bn-bolge[data-bolge="${this.ad}-${b}"]`)) continue;
      const g = this.parcaG(t.parca);
      g?.append(svgEl('circle', { class: 'bn-bolge', 'data-bolge': `${this.ad}-${b}`, cx: t.x, cy: t.y, r: t.r * 0.7, fill: 'transparent' }));
    }
  }

  // ---------------------------------------------------------------- ıslaklık
  /** Islak parlaklık (0 kuru … 1 sırılsıklam) ve damlayan su */
  islak(oran: number) {
    if (this.ad === 'mino') {
      // Mino: gerçek sırılsıklam çizimi (hâl eki; damlalar ve ıslak parlamalar çizimin içinde)
      this.islakOran = oran;
      this.minoHalGuncelle();
      this.gov.classList.toggle('damliyor', oran > 0.35);
      this.gov.classList.toggle('bn-sirilsiklam', oran > 0.6);
      return;
    }
    // Kino: ıslak parlamalar kodla (hâl çizimi yok)
    let e = this.kap.querySelector<SVGGElement>('g.bn-islak-k');
    if (!e && oran > 0) {
      const kafa = this.parcaG('kafa');
      const govde = this.parcaG('govde');
      const parilti = (d: string, w: number) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="${w}" stroke-linecap="round" opacity=".8"/>`;
      e = svgEl('g', { class: 'bn-islak-k' });
      e.innerHTML = parilti('M820 520 Q880 470 960 460', 24) + parilti('M1150 480 Q1210 500 1240 550', 16) + parilti('M760 860 Q770 950 820 990', 16);
      const e2 = svgEl('g', { class: 'bn-islak-g' });
      e2.innerHTML = parilti('M930 1330 Q920 1430 950 1520', 18) + parilti('M1110 1350 Q1120 1400 1110 1450', 12);
      kafa?.append(e);
      govde?.append(e2);
    }
    this.kap.querySelectorAll<SVGGElement>('g.bn-islak-k, g.bn-islak-g').forEach((g) => (g.style.opacity = String(oran)));
    this.gov.classList.toggle('damliyor', oran > 0.35);
    this.kinoIslak = oran > 0.6;
  }

  private islakOran = 0;
  private pofOran = 0;
  /**
   * Mino'nun hâli (mino.ts → hal): kurulanırken ıslaklık azalıp kabarıklık arttıkça sırılsıklam → normal → pofuduk.
   * Hâl değişince kısa bir "silkinme" (basılıp toparlanma) ile geçer.
   */
  private minoHalGuncelle() {
    const m = this.mino;
    if (!m) return;
    const hal = this.pofOran > 0.3 ? 'pofuduk' : this.islakOran > 0.35 ? 'islak' : null;
    if (hal === m.halAd) return;
    void m.hal(hal).then(() => {
      if (m.halAd !== hal) return;
      this.kap.animate([{ scale: '1 1' }, { scale: '1.08 0.92' }, { scale: '0.96 1.04' }, { scale: '1 1' }], { duration: sure(380), easing: 'cubic-bezier(0.3, 1.4, 0.5, 1)' });
    });
  }

  // ---------------------------------------------------------------- Mino'nun fuları
  private fularYollari(): SVGElement[] {
    const s = this.svg();
    if (!s) return [];
    // hâl eklerindeki (m-hal) aynı renkli burun yolları fular sayılmaz
    return [...s.querySelectorAll<SVGElement>('path')].filter((e) => /^#(f03137|cd5b6b)$/i.test(e.getAttribute('fill') ?? '') && !e.closest('.m-hal'));
  }
  /** Fular takılı mı (Mino: çizimdeki fular; Kino: kodla takılan) */
  fular(takili: boolean) {
    if (this.ad === 'kino') {
      // Kino'nun çiziminde fuların altı (göğüs, yuvarlak boyun dolgusu) temiz: fular yalnız gizlenir.
      // (Eskiden kodla konan köşeli göğüs yaması baş kalkınca — uluma — boyunda düz çizgili bir kutu gibi görünüyordu.)
      const f = this.parcaG('fular') ?? this.kap.querySelector<SVGGElement>('g.bn-kino-fular');
      if (f) f.style.visibility = takili ? '' : 'hidden';
      return;
    }
    // yandan (profil) çizimdeki fular da (banyo.css → bn-fularsiz)
    this.el.classList.toggle('bn-fularsiz', !takili);
    const yollar = this.fularYollari();
    yollar.forEach((e) => (e.style.display = takili ? '' : 'none'));
    const s = this.svg();
    let gogus = s?.querySelector('path.bn-gogus');
    if (!takili && !gogus && yollar.length) {
      // fular çıkınca: boynun altındaki koyu fular zemini krem göğüs tüyüyle örtülür
      yollar[yollar.length - 1].insertAdjacentHTML(
        'afterend',
        `<path class="bn-gogus" d="M792 1206 Q1030 1262 1268 1206 Q1282 1250 1262 1296 Q1232 1318 1196 1316 Q1206 1356 1170 1376 Q1178 1420 1136 1438 Q1128 1486 1086 1494 Q1060 1536 1030 1520 Q1000 1536 974 1494 Q932 1486 924 1438 Q882 1420 890 1376 Q854 1356 864 1316 Q828 1318 798 1296 Q778 1250 792 1206 Z" fill="#e8dfd0" stroke="${K}" stroke-width="12" stroke-linejoin="round"/>`,
      );
      gogus = s?.querySelector('path.bn-gogus');
    }
    if (gogus) (gogus as SVGElement).style.display = takili ? 'none' : '';
    // Hâl çizimlerinde (sırılsıklam, pofuduk) asıl kafa grubu — ve onunla göğüs yaması — gizlenir; fuların koyu
    // zemini açıkta kalıyordu. Aynı yama hâl kafasının hemen altına da konur (yalnız hâl açıkken görünür; banyo.css).
    let halGogus = s?.querySelector<SVGElement>('path.bn-gogus-hal');
    if (!takili && !halGogus && gogus) {
      const kafaHal = s?.querySelector<SVGGElement>(':scope > .k > .m-hal');
      if (kafaHal) {
        halGogus = gogus.cloneNode() as SVGElement;
        halGogus.setAttribute('class', 'bn-gogus-hal');
        halGogus.style.display = '';
        kafaHal.before(halGogus);
      }
    }
    if (halGogus) halGogus.style.display = takili ? 'none' : '';
  }
  /** Fuların ekrandaki yeri */
  fularEkran(): [number, number] {
    return this.ad === 'mino' ? this.ekranda(1030, 1330) : this.ekranda(...KINO_FULAR);
  }

  // ---------------------------------------------------------------- pofuduk (Mino)
  /** Kurulandıkça kabaran tüy topu: 0 yok … 1 kocaman pofuduk top */
  pofuduk(oran: number) {
    if (this.mino) {
      // Mino: gerçek pofuduk çizimi (hâl eki); taradıkça oran düşer, düzelince normal çizime döner
      this.pofOran = oran;
      this.minoHalGuncelle();
      this.gov.classList.toggle('bn-kabarik', oran > 0.3);
      return;
    }
    if (!this.pofEl) {
      const tuy = Array.from({ length: 22 }, (_, i) => {
        const a = (i / 22) * Math.PI * 2;
        return `${(200 + Math.cos(a) * 176).toFixed(0)},${(200 + Math.sin(a) * 176).toFixed(0)}`;
      });
      let d = '';
      tuy.forEach((p, i) => {
        const [x, y] = p.split(',').map(Number);
        const a = ((i + 0.5) / 22) * Math.PI * 2;
        const ux = 200 + Math.cos(a) * 196;
        const uy = 200 + Math.sin(a) * 196;
        d += i === 0 ? `M${x} ${y}` : '';
        const [nx, ny] = tuy[(i + 1) % 22].split(',').map(Number);
        d += ` Q${ux.toFixed(0)} ${uy.toFixed(0)} ${nx} ${ny}`;
      });
      this.pofEl = h('div.bn-pofuduk', {
        html: `<svg viewBox="0 0 400 400" aria-hidden="true">
          <defs><radialGradient id="bnPof" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#ffc27a"/><stop offset=".7" stop-color="#fa9e3c"/><stop offset="1" stop-color="#e07a2e"/></radialGradient></defs>
          <path d="${d}Z" fill="url(#bnPof)" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>
          <g fill="none" stroke="#e25b1c" stroke-width="7" stroke-linecap="round"><path d="M150 70 Q160 100 150 120"/><path d="M200 60 Q205 95 200 118"/><path d="M250 70 Q240 100 250 120"/></g>
          <path d="M112 118 Q100 60 130 40 Q150 80 160 104 Z M288 118 Q300 60 270 40 Q250 80 240 104 Z" fill="#fa9e3c" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>
          <path d="M122 104 Q118 70 132 56 Q142 80 148 100 Z M278 104 Q282 70 268 56 Q258 80 252 100 Z" fill="#ee7683"/>
          <ellipse cx="200" cy="232" rx="92" ry="62" fill="#fff1dc" opacity=".9"/>
          <g><ellipse cx="160" cy="180" rx="30" ry="34" fill="#fff" stroke="${K}" stroke-width="6"/><circle cx="164" cy="184" r="21" fill="#3a1210"/><circle cx="156" cy="175" r="8" fill="#fff"/>
          <ellipse cx="240" cy="180" rx="30" ry="34" fill="#fff" stroke="${K}" stroke-width="6"/><circle cx="236" cy="184" r="21" fill="#3a1210"/><circle cx="228" cy="175" r="8" fill="#fff"/></g>
          <path d="M190 218 Q200 212 210 218 Q206 228 200 230 Q194 228 190 218 Z" fill="#ec7683" stroke="${K}" stroke-width="4"/>
          <path d="M184 240 Q200 252 216 240" fill="none" stroke="${K}" stroke-width="6" stroke-linecap="round"/>
          <path d="M70 150 Q90 130 110 140 M300 140 Q320 128 334 150" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".7"/>
        </svg>`,
      });
      this.gov.append(this.pofEl);
    }
    this.pofEl.style.setProperty('--p', oran.toFixed(3));
    this.pofEl.classList.toggle('gorunur', oran > 0.02);
    this.gov.classList.toggle('bn-kabarik', oran > 0.02);
  }

  // ---------------------------------------------------------------- saklanma
  /** Saklandı: tamamen görünmez (görünen kuyruk ucu / dikiz ayrı parçalardır; banyo.ts → sakliGoster) */
  sakla(acik: boolean) {
    this.el.classList.toggle('bn-sakli', acik);
  }

  // ---------------------------------------------------------------- hareket
  koy(x: number, y: number) {
    this.el.style.setProperty('--x', String(x));
    this.el.style.setProperty('--y', String(y));
    this.hedef = x;
  }
  private hedef: number | null = null;
  /** Gittiği (ya da durduğu) yer: kamera kadrajı buna göre hazırlanır (yol animasyonu bitmeden bilinsin) */
  get hedefX() {
    return this.hedef ?? this.x;
  }
  /** Yürümeye başlarken haber (bölüm kamerası karakteri kadrajda tutmak için) */
  gitBasi: ((x: number, ms: number) => void) | null = null;
  get x() {
    return Number(this.el.style.getPropertyValue('--x')) || 50;
  }
  get y() {
    return Number(this.el.style.getPropertyValue('--y')) || 0;
  }
  set katman(z: number) {
    this.el.style.zIndex = String(z);
  }

  /**
   * (x, y) noktasına git (sahnenin %'si, y alttan). yay: zıplama yüksekliği (sahne yüksekliğinin %'si).
   * Yalnız transform: yol katmanı kayar, sonra konum işlenir.
   */
  async git(x: number, y: number, ms = 800, yay = 0, egri = 'cubic-bezier(0.45, 0, 0.3, 1)', yandan = false) {
    const kok = this.el.parentElement;
    if (!kok) return this.koy(x, y);
    this.hedef = x;
    this.gitBasi?.(x, ms);
    const W = kok.clientWidth;
    const H = kok.clientHeight;
    const dx = ((x - this.x) / 100) * W;
    const dy = (-(y - this.y) / 100) * H;
    // Mino yandan yürür / koşar: profil iskeleti, adım hızı yola göre (pati yerde kaymaz)
    if (yandan && !yay && this.yuruyen && Math.abs(dx) > this.el.offsetWidth * 0.15) {
      const dongu = (Math.abs(dx) / Math.max(1, this.el.offsetWidth)) * (MINO_KUTU_GENISLIK / MINO_DONGU_YOLU);
      this.yuruyen.el.classList.toggle('sola', dx < 0);
      if (this.yuruyen.yuru(Math.min(4.5, Math.max(1.2, dongu / Math.max(0.1, sure(ms) / 1000))))) {
        const a = this.yol.animate([{ transform: 'translate(0, 0)' }, { transform: `translate(${dx}px, ${dy}px)` }], { duration: sure(ms), easing: 'linear', fill: 'forwards' });
        await a.finished.catch(() => undefined);
        this.yuruyen.dur();
        this.koy(x, y);
        a.cancel();
        return;
      }
    }
    const yh = (yay / 100) * H;
    const kf: Keyframe[] = yay
      ? [
          { transform: 'translate(0, 0)' },
          { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - yh}px)`, offset: 0.5 },
          { transform: `translate(${dx}px, ${dy}px)` },
        ]
      : [{ transform: 'translate(0, 0)' }, { transform: `translate(${dx}px, ${dy}px)` }];
    if (yay) {
      // havada uzar, inişte basılır
      void this.gov
        .animate(
          [
            { transform: 'scale(1.12, 0.86)', offset: 0 },
            { transform: 'scale(0.9, 1.12)', offset: 0.25 },
            { transform: 'scale(1, 1)', offset: 0.55 },
            { transform: 'scale(0.94, 1.08)', offset: 0.85 },
            { transform: 'scale(1.16, 0.84)', offset: 0.95 },
            { transform: 'scale(1, 1)' },
          ],
          { duration: sure(ms * 1.1), easing: 'linear' },
        )
        .finished.catch(() => undefined);
    }
    const a = this.yol.animate(kf, { duration: sure(ms), easing: yay ? 'linear' : egri, fill: 'forwards' });
    if (this.kar && !yay) void this.kar.oynat('yuru', ms);
    await a.finished.catch(() => undefined);
    this.koy(x, y);
    a.cancel();
  }

  /** Esneyip basılan zıplama (yerinde) */
  zipla(yukseklik = 22, ms = 700) {
    const y = AZ_HAREKET ? yukseklik * 0.4 : yukseklik;
    return this.gov
      .animate(
        [
          { transform: 'translateY(0) scale(1, 1)' },
          { transform: 'translateY(0) scale(1.14, 0.84)', offset: 0.18 },
          { transform: `translateY(-${y * 0.85}%) scale(0.9, 1.12)`, offset: 0.38 },
          { transform: `translateY(-${y}%) scale(1, 1)`, offset: 0.5 },
          { transform: `translateY(-${y * 0.3}%) scale(0.94, 1.08)`, offset: 0.66 },
          { transform: 'translateY(0) scale(1.18, 0.82)', offset: 0.76 },
          { transform: 'translateY(0) scale(0.97, 1.04)', offset: 0.9 },
          { transform: 'translateY(0) scale(1, 1)' },
        ],
        { duration: sure(ms), easing: 'cubic-bezier(0.45, 0, 0.3, 1)' },
      )
      .finished.catch(() => undefined);
  }

  /** Titreme (soğuk, ıslak "Brrr") */
  titre(ms = 700) {
    if (AZ_HAREKET) return Promise.resolve();
    const kf: Keyframe[] = Array.from({ length: 11 }, (_, i) => ({ transform: `translateX(${i % 2 ? 2.2 : -2.2}%) rotate(${i % 2 ? 1 : -1}deg)` }));
    kf.push({ transform: 'none' });
    return this.gov.animate(kf, { duration: sure(ms), easing: 'linear' }).finished.catch(() => undefined);
  }

  /** Kısa esneyip toparlanma (dokunuş tepkisi) */
  kipir() {
    return this.gov
      .animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06, 0.93)' }, { transform: 'scale(0.97, 1.04)' }, { transform: 'scale(1)' }], { duration: sure(380), easing: 'ease-out' })
      .finished.catch(() => undefined);
  }

  /** Konuşma balonu (seslendirilmez) */
  async balon(yazi: string, ms = 1300) {
    this.balonEl.textContent = yazi;
    this.balonEl.classList.remove('acik');
    void this.balonEl.offsetWidth;
    this.balonEl.classList.add('acik');
    await bekle(ms);
    this.balonEl.classList.remove('acik');
  }

  /** Mino tepkisi (Kino'da karşılığı) */
  tepki(t: Tepki, sn?: number) {
    if (this.mino) {
      this.mino.tepki(t, sn);
      // hâl çizimi açıkken ifade eki (normal kafaya göre kesilmiş) hâl kafasının üstünde yamalı duruyor: gösterme
      if (this.mino.halAd && HAL_IFADESIZ.has(t)) void this.mino.ifade(null);
    } else if (this.kar) {
      const es: Partial<Record<Tepki, () => void>> = {
        // Kino'nun kendi sevinci ve dansı (karakterin "kovala" dansında kuyruk tam tur dönüyor, kopuk görünüyordu)
        zipla: () => this.kinoOynat('sevin', 900),
        dans: () => this.kinoOynat('dans', 1600),
        sasir: () => this.kinoOynat('kulakDik', 900),
        hayir: () => void this.kar!.oynat('hayir', 700),
        evet: () => void this.kar!.oynat('huy', 900),
        gidik: () => this.kinoOynat('tekme', 1200),
      };
      (es[t] ?? (() => void this.kar!.oynat('huy', 900)))();
    }
  }

  // ---------------------------------------------------------------- Kino'ya özel
  /** Kino konuşuyor: ağız açılıp kapanır (iskeletin agiz-acik katmanı), kafa hafif sallanır */
  konus(acik: boolean) {
    this.kinoKonus = acik;
    this.kar?.konus(acik);
  }
  /** Ağız açık (uluma, su içme): 0..1 */
  agiz(acik: number) {
    this.kinoAgiz = acik;
  }
  /** Gözler sıkıca kapalı (köpük kaçmasın) */
  gozKapali = false;
  /** İkisi için de "gözler sıkıca kapalı" (Mino: ifade eki olmadan, ıslak / pofuduk hâlde de temiz) */
  gozSik(acik: boolean) {
    if (this.mino) this.mino.gozZorla = acik;
    else this.gozKapali = acik;
  }
  /** Kino'ya özel hareket (ms; 0 = durdurana kadar) */
  kinoOynat(ad: KinoHareket, ms = 1000, yon = 1) {
    if (!this.kar) return;
    this.ozel = { ad, bas: performance.now() / 1000, sure: ms ? (TEST_MODU ? 0.03 : ms / 1000) : Infinity, yon };
    // hareketin yüzü (çizilmiş ifade): coşku → heyecan, uluma → uluma, titreme → titreme
    const oto = KINO_OTO_IFADE[ad];
    if (oto) {
      this.kar.ifade(oto, ms);
      this.otoIfade = oto;
    } else this.otoIfadeBitir();
  }
  kinoDur() {
    this.ozel = null;
    this.otoIfadeBitir();
  }
  /** Hareketin kendiliğinden açtığı ifade hâlâ duruyorsa kapatır (elle verilen ifadeye dokunmaz) */
  private otoIfadeBitir() {
    if (this.otoIfade && this.kar?.ifadeSu === this.otoIfade) this.kar.ifade(null);
    this.otoIfade = null;
  }
  private otoIfade: KinoIfade | null = null;

  /**
   * Kino'nun yüz ifadesi (iskeletin çizilmiş ekleri; ekip/kino/IFADELER.md): gözler, ağız ve dil yerine ifade
   * çizimi. ms: süre (0: kaldırılana kadar); null normale döner.
   */
  kinoIfade(ad: KinoIfade | null, ms = 0) {
    this.kar?.ifade(ad, ms);
    this.otoIfade = null;
  }

  /**
   * Kino'nun köpük saçı (çizilmiş kopuk-sac eki; hiçbir şeyi gizlemez). sekil: 0 kabarık, 1 geniş taç, 2 uzun tepe
   * (aynı çizim farklı esnetilir); null kaldırır.
   */
  kopukSac(sekil: number | null) {
    const kar = this.kar;
    if (!kar) return;
    kar.ek('kopuk-sac', sekil !== null);
    this.sacSekil = sekil;
    const g = this.parcaG('kopuk-sac');
    if (!g || sekil === null) return;
    let ic = g.querySelector<SVGGElement>(':scope > g.bn-sac-ic');
    if (!ic) {
      ic = svgEl('g', { class: 'bn-sac-ic' });
      ic.append(...[...g.childNodes]);
      g.append(ic);
    }
    const [sx, sy] = SAC_SEKIL[sekil % SAC_SEKIL.length];
    ic.style.transform = `scale(${sx}, ${sy})`;
    ic.animate([{ scale: '0.6' }, { scale: '1.12' }, { scale: '1' }], { duration: sure(380), easing: 'cubic-bezier(0.3, 1.6, 0.5, 1)' });
  }
  /** Köpük saç takılı mı (null: yok) */
  sacSekil: number | null = null;
  get kinoHareket() {
    return this.ozel?.ad ?? null;
  }

  /** Parçanın üstüne SVG ekle (ör. buz sarkıtı, köpük sakal, köpük saç). Döner: grup */
  ekle(parca: string, sinif: string, html: string): SVGGElement | null {
    const g = this.parcaG(parca);
    if (!g) return null;
    const e = svgEl('g', { class: sinif }, html);
    g.append(e);
    return e;
  }

  private dilSon: boolean | null = null;
  private kinoPoz(p: Poz, _t: number) {
    const simdi = performance.now() / 1000;
    const S = Math.sin;
    /** kulak ekle: + = dışa açılır / kalkar, − = sarkar */
    const kulak = (sol: number, sag = sol) => {
      p.kulakSol += KULAK_DIS * sol;
      p.kulakSag += KULAK_DIS * sag;
    };
    // ıslakken kulaklar sarkık
    if (this.kinoIslak) kulak(-12);
    if (this.gozKapali) p.gozKapali = true;
    let agiz = this.kinoAgiz;
    let dil = false;
    if (this.kinoKonus) p.kafaY -= 0.6 * Math.abs(S(simdi * 9));
    const o = this.ozel;
    if (o) {
      const u = (simdi - o.bas) / o.sure;
      if (u >= 1) this.ozel = null;
      else {
        const z = o.sure === Infinity ? Math.min(1, (simdi - o.bas) / 0.2) : Math.min(1, u / 0.12, (1 - u) / 0.12);
        const t = simdi - o.bas;
        const az = AZ_HAREKET ? 0.3 : 1;
        switch (o.ad) {
          case 'silkelen':
            // kulaklar pervane gibi, gövde iki yana
            p.don += 12 * S(t * 38) * z * az;
            p.x += 2.5 * S(t * 38) * z * az;
            kulak(18 * S(t * 44) * z * az, 18 * S(t * 44 + 1.2) * z * az);
            p.kuyruk += 40 * S(t * 36) * z;
            p.gozKapali = z > 0.4;
            p.sx *= 1 + 0.04 * S(t * 76) * z;
            break;
          case 'ulu':
            // baş yukarı (≈ −15°; uluma ifadesiyle)
            p.kafaY -= 3 * z;
            p.kafa -= 8 * z;
            p.sy *= 1 + 0.05 * z;
            kulak((this.kinoKulakYon * 20 + 4 * S(t * 11)) * z, (this.kinoKulakYon * 20 + 4 * S(t * 11 + 1)) * z);
            p.gozKapali = z > 0.5;
            agiz = Math.max(agiz, z);
            break;
          case 'dinle':
            // çocuğun sesini dinlerken sessizce "şarkıya hazırlanır"
            p.kafaY -= 1.5 * z;
            kulak(this.kinoKulakYon * 18 * z);
            agiz = Math.max(agiz, 0.6 * z);
            break;
          case 'titre':
            p.x += 1.3 * S(t * 70) * z * az;
            kulak(-14 * z);
            p.kolSol -= 4 * z;
            p.kolSag -= 4 * z;
            break;
          case 'tekme':
            // gıdık: refleksle pat pat (gövde sekerek, pati vurur)
            p.y -= 3 * Math.abs(S(t * 22)) * z;
            p.kolSag += 40 * Math.abs(S(t * 22)) * z;
            p.kuyruk += 30 * S(t * 30) * z;
            p.don -= 4 * z;
            p.gozKapali = true;
            dil = true;
            break;
          case 'coskulu':
            p.kuyruk += 45 * S(t * 32) * z;
            kulak(12 * Math.abs(S(t * 9)) * z, 12 * Math.abs(S(t * 9 + 0.5)) * z);
            p.y -= 4 * Math.abs(S(t * 9)) * z * az;
            dil = true;
            break;
          case 'yuz':
            p.kolSol += (30 + 30 * S(t * 9)) * z;
            p.kolSag += (30 - 30 * S(t * 9)) * z;
            p.don += 5 * S(t * 4.5) * z;
            p.kuyruk += 25 * S(t * 14) * z;
            dil = true;
            break;
          case 'kulakDik':
            kulak(24 * z);
            p.y -= 3 * z;
            break;
          case 'ic':
            p.kafaY -= 2 * z;
            agiz = Math.max(agiz, 0.8 * z);
            p.gozKapali = true;
            break;
          case 'bak':
            p.kafa += 9 * z * o.yon;
            kulak(6 * z);
            break;
          case 'dans': {
            // sevinç dansı: iki yana sallanarak hoplar, kollar sırayla kalkar, kuyruk pervane gibi sallanır (dönmez)
            const hop = Math.abs(S(t * 9));
            p.y -= 9 * hop * z * az;
            p.don += 6 * S(t * 4.5) * z * az;
            p.kafa -= 4 * S(t * 4.5 + 0.6) * z;
            p.kolSol += (14 + 22 * Math.max(0, S(t * 9))) * z;
            p.kolSag += (14 + 22 * Math.max(0, -S(t * 9))) * z;
            p.kuyruk += 40 * S(t * 30) * z;
            kulak(14 * S(t * 18) * z, 14 * S(t * 18 + 1) * z);
            dil = true;
            break;
          }
          case 'sevin': {
            // kısa sevinç: iki hop, kollar havada, kuyruk sallanır
            const hop = Math.abs(S(u * Math.PI * 2));
            p.y -= 12 * hop * z * az;
            p.sy *= 1 + 0.04 * hop * z;
            p.kolSol += 34 * z;
            p.kolSag += 34 * z;
            p.kuyruk += 35 * S(t * 30) * z;
            kulak(16 * hop * z);
            dil = true;
            break;
          }
        }
      }
    }
    // kollar omuzdan fazla kalkmasın (omuz dikişi görünmesin)
    p.kolSol = Math.min(p.kolSol, KINO_KOL_EN_COK);
    p.kolSag = Math.min(p.kolSag, KINO_KOL_EN_COK);
    // kuyruk kökünde yarık açılmasın (sallanma hızlı ama dar)
    p.kuyruk = Math.max(-KINO_KUYRUK_EN_COK * 0.4, Math.min(KINO_KUYRUK_EN_COK, p.kuyruk));
    p.agizAcik = Math.max(p.agizAcik, agiz > 0.5 ? 1 : 0);
    // kodla çizilen ağız / dil (iskelette yoksa); iskeletin "dil-disarida" katmanı
    const ag = this.kap.querySelector<SVGGElement>('g.bn-kino-agiz');
    if (ag) ag.style.opacity = agiz > 0.5 || (this.kinoKonus && S(simdi * 18) > 0) ? '1' : '0';
    // çizilmiş ifade açıkken (kendi ağzı ve dili var) dışarıdaki dil gösterilmez
    const dilGoster = dil && agiz <= 0.5 && !this.kinoKonus && !this.kar?.ifadeSu;
    if (dilGoster !== this.dilSon) {
      this.dilSon = dilGoster;
      const dl = this.parcaG('dil-disarida') ?? this.kap.querySelector<SVGGElement>('g.bn-kino-dil');
      if (dl) dl.style.opacity = dilGoster ? '1' : '0';
    }
  }

  kapat() {
    if (this.yuruyen) this.yuruyen.kapat();
    else this.mino?.kapat();
    this.kar?.kapat();
  }
}

/** Bölge kimliği → [kişi, bölüm] ve iki kişiden bölge sprite'ını bulma yardımcıları */
export function bolgeKisi(id: BolgeId, mino: Kisi, kino: Kisi): [Kisi, Bolum] {
  const [k, b] = id.split('-') as [KisiAdi, Bolum];
  return [k === 'mino' ? mino : kino, b];
}
