/**
 * Bebek Ege: ortak parçalı karakter (src/karakter) + tasarımcının iskeleti (ekip/ege/ege.svg + ege.json →
 * scripts/karakter/iskelet-al.mjs → assets/karakter-iskelet/ege.*). Katmanlar: govde, kol-sol/sag, bacak-sol/sag,
 * kafa, kas, agiz, goz-sol/sag, gizli goz-kapali. Açılar: kafa ±10, kol -40…+35, bacak ±8 (kisilik.ts).
 *
 * İfadeler (ağlıyor, am, kıkırdama, kahkaha, şaşkın, dudak büzük, esneme, uyku, uykuda gülümseme, bir göz açık)
 * Gemini'den gelene kadar KODLA: çizimin göz/ağız/kaş katmanları gizlenir ya da ölçeklenir, yerine kafa katmanına
 * eklenen vektör parçalar (aynı kontur ve ten rengi) görünür. Gözyaşı, mama lekesi, emzik ve önlük de kafa / gövde
 * katmanına eklenen SVG'dir: kafa dönünce onlar da döner. Başını çevirme: kafa eğilir, yüz parçaları o yana kayar.
 * Hareketler (ağlarken çırpınma, kıkırdama, kahkaha, tekme, irkilme, esneme, uyku nefesi) Karakter.ekHareket ile.
 * Yalnız transform / opacity.
 */
import '../../src/karakter/karakter.css';
import { Karakter, type Poz } from '../../src/karakter/karakter';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { egeAdres } from './ege-cizim';
import { AZ_HAREKET } from './oyuncu';

export const EGE_ISKELET = 'ege';
/** Çizimin kırpımı (x, y, en, boy; 2048'lik iskelet koordinatı) */
const KIRPIM: [number, number, number, number] = [215, 118, 1620, 1840];
/** Ege kutusunun boy/en oranı */
export const EGE_ORAN = KIRPIM[3] / KIRPIM[2];

/** Yüz noktaları (iskelet koordinatı) */
const GOZ_SOL: [number, number] = [846, 663];
const GOZ_SAG: [number, number] = [1207, 662];
const AGIZ: [number, number] = [1026, 842];
const K = '#4b1917';
const TEN = '#ecb399';
const KAS = '#8a5b46';

export type EgeIfade = 'agliyor' | 'bakiyor' | 'am' | 'kikir' | 'kahkaha' | 'saskin' | 'buzuk' | 'esniyor' | 'uyuyor' | 'uykuda-gulumsuyor' | 'tek-goz';
type Goz = 'acik' | 'iri' | 'kapali' | 'mutlu' | 'sikili' | 'tek';
type Agiz = 'notr' | 'agla' | 'am' | 'gul' | 'kahkaha' | 'o' | 'buzuk' | 'esne' | 'uyku';
type Kas = 'normal' | 'yukari' | 'uzgun';
/** ifade → [göz, ağız, kaş, gözyaşı, yanak kızarması] */
const IFADE: Record<EgeIfade, [Goz, Agiz, Kas, boolean, boolean]> = {
  agliyor: ['sikili', 'agla', 'uzgun', true, true],
  bakiyor: ['acik', 'notr', 'normal', false, false],
  am: ['acik', 'am', 'yukari', false, false],
  kikir: ['mutlu', 'gul', 'normal', false, true],
  kahkaha: ['mutlu', 'kahkaha', 'yukari', false, true],
  saskin: ['iri', 'o', 'yukari', false, false],
  buzuk: ['acik', 'buzuk', 'uzgun', false, false],
  esniyor: ['kapali', 'esne', 'yukari', false, false],
  uyuyor: ['kapali', 'uyku', 'normal', false, false],
  'uykuda-gulumsuyor': ['kapali', 'notr', 'normal', false, true],
  'tek-goz': ['tek', 'uyku', 'normal', false, false],
};

export type EgeHareket = 'kikir' | 'kahkaha' | 'ayak' | 'irkil' | 'esne' | 'kipir' | 'vur' | 'cirp' | 'am' | 'gurul' | 'hayir';
type Mod = 'normal' | 'agla' | 'uyku' | 'yatik';

const NS = 'http://www.w3.org/2000/svg';
const svgEl = (ad: string, html: string, sinif = '') => {
  const e = document.createElementNS(NS, ad);
  if (sinif) e.setAttribute('class', sinif);
  e.innerHTML = html;
  return e as SVGGElement;
};

/** Kodla çizilen yüz parçaları (kafa katmanına eklenir) */
function yuzSvg(): string {
  const [lx, ly] = GOZ_SOL;
  const [rx, ry] = GOZ_SAG;
  const [ax, ay] = AGIZ;
  const yama = (x: number, y: number) => `<ellipse cx="${x}" cy="${y}" rx="112" ry="116" fill="url(#egTen)"/>`;
  const s = `stroke="${K}" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  const dil = (y: number, rx2: number, ry2: number) => `<ellipse cx="${ax}" cy="${y}" rx="${rx2}" ry="${ry2}" fill="#e56f78"/>`;
  return `
<defs><radialGradient id="egTen"><stop offset=".62" stop-color="${TEN}"/><stop offset="1" stop-color="${TEN}" stop-opacity="0"/></radialGradient></defs>
<g class="eg-yanak"><ellipse cx="800" cy="780" rx="92" ry="60" fill="#ef8a82"/><ellipse cx="1254" cy="782" rx="92" ry="60" fill="#ef8a82"/></g>
<g class="eg-yuz-on">
  <g class="eg-g eg-g-mutlu">${yama(lx, ly)}${yama(rx, ry)}<path d="M${lx - 70} ${ly + 22}Q${lx} ${ly - 70} ${lx + 70} ${ly + 22}" ${s} stroke-width="20"/><path d="M${rx - 70} ${ry + 22}Q${rx} ${ry - 70} ${rx + 70} ${ry + 22}" ${s} stroke-width="20"/></g>
  <g class="eg-g eg-g-sikili">${yama(lx, ly)}${yama(rx, ry)}<path d="M${lx - 64} ${ly - 44}L${lx + 50} ${ly}L${lx - 64} ${ly + 44}" ${s} stroke-width="20"/><path d="M${rx + 64} ${ry - 44}L${rx - 50} ${ry}L${rx + 64} ${ry + 44}" ${s} stroke-width="20"/></g>
  <g class="eg-g eg-g-tek">${yama(lx, ly)}<path d="M${lx - 66} ${ly + 4}Q${lx} ${ly + 56} ${lx + 66} ${ly + 4}" ${s} stroke-width="18"/><path d="M${lx - 70} ${ly - 8}L${lx - 92} ${ly - 30}" ${s} stroke-width="12"/></g>
  <g class="eg-kas-uzgun"><path d="M${lx - 80} ${ly - 150}Q${lx - 20} ${ly - 170} ${lx + 50} ${ly - 205}" ${s} stroke="${KAS}" stroke-width="26"/><path d="M${rx + 80} ${ry - 150}Q${rx + 20} ${ry - 170} ${rx - 50} ${ry - 205}" ${s} stroke="${KAS}" stroke-width="26"/></g>
  <g class="eg-a eg-a-agla"><path d="M${ax - 100} ${ay - 6}Q${ax} ${ay - 64} ${ax + 100} ${ay - 6}Q${ax + 96} ${ay + 104} ${ax} ${ay + 110}Q${ax - 96} ${ay + 104} ${ax - 100} ${ay - 6}Z" fill="#7a2320" stroke="${K}" stroke-width="14" stroke-linejoin="round"/>${dil(ay + 76, 58, 24)}</g>
  <g class="eg-a eg-a-am"><circle cx="${ax}" cy="${ay + 14}" r="52" fill="#7a2320" stroke="${K}" stroke-width="14"/>${dil(ay + 42, 30, 14)}</g>
  <g class="eg-a eg-a-gul"><path d="M${ax - 88} ${ay - 22}Q${ax} ${ay - 4} ${ax + 88} ${ay - 22}Q${ax + 78} ${ay + 70} ${ax} ${ay + 76}Q${ax - 78} ${ay + 70} ${ax - 88} ${ay - 22}Z" fill="#7a2320" stroke="${K}" stroke-width="14" stroke-linejoin="round"/>${dil(ay + 50, 42, 18)}</g>
  <g class="eg-a eg-a-kahkaha"><path d="M${ax - 118} ${ay - 34}Q${ax} ${ay - 12} ${ax + 118} ${ay - 34}Q${ax + 104} ${ay + 116} ${ax} ${ay + 122}Q${ax - 104} ${ay + 116} ${ax - 118} ${ay - 34}Z" fill="#7a2320" stroke="${K}" stroke-width="14" stroke-linejoin="round"/>${dil(ay + 86, 64, 26)}<path d="M${ax - 80} ${ay - 24}Q${ax} ${ay - 8} ${ax + 80} ${ay - 24}" stroke="#fff" stroke-width="16" fill="none" stroke-linecap="round" opacity=".9"/></g>
  <g class="eg-a eg-a-o"><ellipse cx="${ax}" cy="${ay + 14}" rx="32" ry="42" fill="#7a2320" stroke="${K}" stroke-width="13"/></g>
  <g class="eg-a eg-a-buzuk"><path d="M${ax - 50} ${ay + 20}Q${ax} ${ay - 24} ${ax + 50} ${ay + 20}Q${ax} ${ay + 50} ${ax - 50} ${ay + 20}Z" fill="#d77a70" stroke="${K}" stroke-width="12" stroke-linejoin="round"/><path d="M${ax - 34} ${ay + 18}Q${ax} ${ay + 10} ${ax + 34} ${ay + 18}" ${s} stroke-width="8"/></g>
  <g class="eg-a eg-a-esne"><ellipse cx="${ax}" cy="${ay + 34}" rx="50" ry="78" fill="#7a2320" stroke="${K}" stroke-width="14"/>${dil(ay + 84, 32, 16)}</g>
  <g class="eg-a eg-a-uyku"><path d="M${ax - 34} ${ay + 4}Q${ax} ${ay + 24} ${ax + 34} ${ay + 4}" ${s} stroke-width="12"/></g>
  <g class="eg-yas">
    <path class="eg-yas-iz" d="M${lx + 20} ${ly + 70}Q${lx + 6} ${ly + 150} ${lx + 26} ${ly + 230}" stroke="#9fd8f6" stroke-width="22" fill="none" stroke-linecap="round" opacity=".85"/>
    <path class="eg-yas-iz" d="M${rx - 20} ${ry + 70}Q${rx - 6} ${ry + 150} ${rx - 26} ${ry + 230}" stroke="#9fd8f6" stroke-width="22" fill="none" stroke-linecap="round" opacity=".85"/>
    ${[0, 1, 2, 3].map((i) => `<path class="eg-damla" style="--i:${i}" d="M${i % 2 ? rx - 30 : lx + 30} ${ly + 80}q-24 40 0 56q24-16 0-56z" fill="#8fd2f7" stroke="#3f8fc0" stroke-width="6"/>`).join('')}
  </g>
  <g class="eg-lekeler"></g>
  <g class="eg-emzik"></g>
</g>`;
}

/** Mama lekesinin yerleri (kafa koordinatı): ağız çevresi, yanaklar, burun, alın */
const LEKE_YER: [number, number, number][] = [
  [920, 922, 52], [1136, 914, 48], [786, 838, 46], [1268, 832, 50], [1036, 984, 44], [1052, 750, 34], [900, 520, 42],
];

export class Ege {
  readonly el: HTMLElement;
  readonly kar: Karakter;
  private kutuEl: HTMLElement;
  private balonEl: HTMLElement;
  private temel: EgeIfade = 'bakiyor';
  private gecici = 0;
  private simdiki: EgeIfade = 'bakiyor';
  private hazirP: Promise<void>;
  private mod: Mod = 'normal';
  private hr: { ad: EgeHareket; bas: number; sure: number } | null = null;
  private bakHedef = 0;
  private bakSimdi = 0;
  private emzikEmme = 0;
  /** ağlama gücü 0..1 (çırpınma genliği) */
  aglamaGucu = 1;
  private lekeSay = 0;

  constructor() {
    this.kar = new Karakter(EGE_ISKELET, h('div'));
    // ağzın yeri (test ve erişilebilirlik için işaret; kutuyla birlikte döner)
    const agizIsaret = h('i.eg-agiz-isaret', { 'data-ege': 'agiz', style: `left:${(((AGIZ[0] - KIRPIM[0]) / KIRPIM[2]) * 100).toFixed(1)}%;top:${(((AGIZ[1] + 20 - KIRPIM[1]) / KIRPIM[3]) * 100).toFixed(1)}%` });
    this.kutuEl = h('div.eg-ege-kutu', { style: `--ar:${(1 / EGE_ORAN).toFixed(4)}` }, this.kar.el, agizIsaret);
    this.balonEl = h('div.eg-balon');
    this.el = h('div.eg-ege.eg-yuzlu', { 'data-ege': 'bebek' }, h('i.eg-ege-golge'), this.kutuEl, this.balonEl);
    this.hazirP = this.kur();
    this.goster('bakiyor');
  }

  /** İskelet yüklendi ve yüz parçaları eklendi */
  hazir() {
    return this.hazirP;
  }

  private async kur() {
    for (let i = 0; i < 240 && !this.kar.el.classList.contains('kr-iskeletli'); i++) await new Promise((r) => setTimeout(r, 25));
    const s = this.svg();
    if (!s) return;
    s.setAttribute('viewBox', KIRPIM.join(' '));
    this.parca('kafa')?.append(svgEl('g', yuzSvg(), 'eg-yuz'));
    // önlük: gövdenin boynunda (kafanın altında, kolların arkasında)
    const onluk = egeAdres('onluk');
    const g = svgEl(
      'g',
      onluk
        ? `<image href="${onluk}" x="792" y="930" width="456" height="497" preserveAspectRatio="xMidYMid meet"/>`
        : `<path d="M820 960Q1020 1060 1220 960Q1260 1040 1230 1080Q1280 1360 1020 1400Q760 1360 810 1080Q780 1040 820 960Z" fill="#fbeeb0" stroke="${K}" stroke-width="14"/>`,
      'eg-onluk',
    );
    this.parca('govde')?.append(g);
    const em = egeAdres('emzik');
    const emzik = s.querySelector('.eg-emzik');
    if (emzik)
      emzik.innerHTML = em
        ? `<image href="${em}" x="${AGIZ[0] - 92}" y="${AGIZ[1] - 64}" width="184" height="220"/>`
        : `<ellipse cx="${AGIZ[0]}" cy="${AGIZ[1] + 10}" rx="92" ry="34" fill="#9fd2f2" stroke="${K}" stroke-width="12"/><circle cx="${AGIZ[0]}" cy="${AGIZ[1] + 70}" r="44" fill="none" stroke="#a978c9" stroke-width="20"/>`;
    this.kar.ekHareket = (p, t) => this.poz(p, t);
  }

  private svg(): SVGSVGElement | null {
    return this.kar.el.querySelector('svg');
  }
  private parca(ad: string): SVGGElement | null {
    return this.svg()?.querySelector<SVGGElement>(`g[data-parca="${ad}"]`) ?? null;
  }

  // ---------------------------------------------------------------- ifade
  private goster(ad: EgeIfade) {
    this.simdiki = ad;
    const [g, a, k, yas, yanak] = IFADE[ad];
    const d = this.el.dataset;
    d.goz = g;
    d.agiz = a;
    d.kas = k;
    d.ifade = ad;
    this.el.classList.toggle('yasli', yas);
    this.el.classList.toggle('kizarik', yanak);
  }

  /** İfade; ms verilirse o süre sonra temel ifadeye döner, verilmezse yeni temel ifade olur */
  ifade(ad: EgeIfade, ms = 0) {
    clearTimeout(this.gecici);
    if (!ms) this.temel = ad;
    this.goster(ad);
    if (ms) this.gecici = window.setTimeout(() => this.goster(this.temel), sure(ms));
  }
  get ifadeAdi() {
    return this.simdiki;
  }

  // ---------------------------------------------------------------- hareket
  /** Sürekli durum: normal, ağlıyor (çırpınır), uyku (yavaş nefes, kollar gevşek) */
  durum(m: Mod) {
    this.mod = m;
    this.el.classList.toggle('uykuda', m === 'uyku' || m === 'yatik');
  }
  /** Kısa hareket (ms) */
  oynat(ad: EgeHareket, ms = 900) {
    this.hr = { ad, bas: performance.now() / 1000, sure: TEST_MODU ? 0.05 : (AZ_HAREKET ? Math.min(ms, 500) : ms) / 1000 };
  }
  /** Başını çevir: -1 sola (ayı), 1 sağa (civciv), 0 önüne */
  bak(yon: number) {
    this.bakHedef = Math.max(-1, Math.min(1, yon));
    this.el.style.setProperty('--bak', String(this.bakHedef));
  }
  /** Ayak sallama (sevinç / yemek) */
  ayakSalla(ms = 900) {
    this.oynat('ayak', ms);
  }
  /** Kıpırdanma */
  kipir(guc = 1) {
    this.oynat(guc > 0.7 ? 'irkil' : 'kipir', 500 + guc * 300);
  }

  private poz(p: Poz, t: number) {
    const S = Math.sin;
    const az = AZ_HAREKET ? 0.3 : 1;
    // bakış yumuşakça döner (takip: kafa önce, yüz parçaları CSS geçişiyle)
    this.bakSimdi += (this.bakHedef - this.bakSimdi) * 0.12;
    p.kafa += this.bakSimdi * 9;
    // bebek: kollar hafif iner-kalkar, ayaklar arada kıpırdar
    p.kolSol += S(t * 1.6) * 3;
    p.kolSag += S(t * 1.6 + 0.8) * 3;
    if (this.mod === 'agla') {
      const g = this.aglamaGucu * az;
      p.kafa += S(t * 9) * 2.5 * g;
      p.y -= Math.abs(S(t * 4.5)) * 1.4 * g;
      p.sy *= 1 + S(t * 9) * 0.018 * g;
      p.kolSol += (14 + S(t * 7) * 16) * g;
      p.kolSag += (14 + S(t * 7 + 1.3) * 16) * g;
      p.bacakSol += S(t * 8) * 7 * g;
      p.bacakSag += S(t * 8 + 1.6) * 7 * g;
    } else if (this.mod === 'uyku' || this.mod === 'yatik') {
      p.sy = 1 + S(t * 1.3) * 0.022;
      p.sx = 1 - S(t * 1.3) * 0.01;
      p.kafa += (this.mod === 'uyku' ? 5 : 0) + S(t * 0.6) * 1;
      p.kolSol = -28 + S(t * 1.3) * 2;
      p.kolSag = -28 + S(t * 1.3 + 0.3) * 2;
    }
    // emzik: cup cup
    if (this.el.classList.contains('emzikli')) {
      const hiz = this.emzikEmme > performance.now() ? 11 : 4;
      this.el.style.setProperty('--emme', (1 + Math.max(0, S(t * hiz)) * 0.07).toFixed(3));
    }
    const hr = this.hr;
    if (!hr) return;
    const u = (performance.now() / 1000 - hr.bas) / hr.sure;
    if (u >= 1) {
      this.hr = null;
      return;
    }
    const z = Math.min(1, u / 0.12, (1 - u) / 0.15);
    const yay = (n: number) => Math.abs(S(u * Math.PI * n));
    switch (hr.ad) {
      case 'kikir':
        p.y -= yay(6) * 2.6 * z * az;
        p.sx *= 1 + yay(6) * 0.03 * z;
        p.sy *= 1 - yay(6) * 0.03 * z;
        p.kolSol += 22 * yay(6) * z;
        p.kolSag += 22 * yay(6) * z;
        p.bacakSol += 7 * S(u * Math.PI * 8) * z;
        p.bacakSag -= 7 * S(u * Math.PI * 8) * z;
        p.kafa -= 3 * z;
        break;
      case 'kahkaha':
        p.y -= yay(8) * 5 * z * az;
        p.sx *= 1 + yay(8) * 0.05 * z;
        p.sy *= 1 - yay(8) * 0.05 * z + 0.02 * z;
        p.kolSol += (18 + 17 * yay(8)) * z;
        p.kolSag += (18 + 17 * yay(8)) * z;
        p.bacakSol += 8 * S(u * Math.PI * 12) * z;
        p.bacakSag -= 8 * S(u * Math.PI * 12) * z;
        p.kafa += 4 * S(u * Math.PI * 4) * z;
        break;
      case 'ayak':
        p.bacakSol += 8 * S(u * Math.PI * 10) * z;
        p.bacakSag -= 8 * S(u * Math.PI * 10) * z;
        p.y -= yay(10) * 0.8 * z;
        break;
      case 'irkil': {
        // irkilme: ani sıçrar (uzar), kollar açılır, sonra toparlanır (follow-through)
        const e = u < 0.18 ? u / 0.18 : Math.max(0, 1 - (u - 0.18) / 0.82);
        p.y -= 6 * e * az;
        p.sy *= 1 + 0.07 * e;
        p.sx *= 1 - 0.04 * e;
        p.kolSol += 35 * e;
        p.kolSag += 35 * e;
        p.bacakSol += 8 * e;
        p.bacakSag += 8 * e;
        p.kafa -= 5 * e;
        break;
      }
      case 'kipir':
        p.don += S(u * Math.PI * 4) * 3 * z;
        p.bacakSol += 6 * S(u * Math.PI * 5) * z;
        p.kolSag += 12 * S(u * Math.PI * 3) * z;
        break;
      case 'esne': {
        const e = S(u * Math.PI);
        p.sy *= 1 + 0.05 * e;
        p.sx *= 1 - 0.02 * e;
        p.kolSol = 35 * e + p.kolSol * (1 - e);
        p.kolSag = 35 * e + p.kolSag * (1 - e);
        p.kafa -= 6 * e;
        break;
      }
      case 'vur':
        // ritim: kollar bir kez çırpar
        p.kolSol += 32 * S(u * Math.PI);
        p.kolSag += 32 * S(u * Math.PI);
        p.y -= 1.5 * S(u * Math.PI);
        break;
      case 'cirp':
        p.kolSol += 25 + 10 * S(u * Math.PI * 8);
        p.kolSag += 25 - 10 * S(u * Math.PI * 8);
        p.y -= yay(4) * 2 * z;
        break;
      case 'am':
        // yer: öne eğilir, çiğner
        p.kafa += 4 * S(u * Math.PI) ;
        p.sx *= 1 + 0.03 * yay(6) * z;
        p.kafaY += 1.2 * yay(6) * z;
        break;
      case 'gurul':
        p.sx *= 1 + 0.03 * S(u * Math.PI * 16) * z;
        p.sy *= 1 - 0.03 * S(u * Math.PI * 16) * z;
        break;
      case 'hayir':
        p.kafa += 9 * S(u * Math.PI * 4) * z;
        break;
    }
  }

  // ---------------------------------------------------------------- balon, önlük, emzik
  async balon(yazi: string, ms = 1300) {
    this.balonEl.textContent = yazi;
    this.balonEl.classList.remove('acik');
    void this.balonEl.offsetWidth;
    this.balonEl.classList.add('acik');
    await new Promise((r) => setTimeout(r, sure(ms)));
    this.balonEl.classList.remove('acik');
  }
  set onluk(tak: boolean) {
    this.el.classList.toggle('onluklu', tak);
  }
  set emzik(tak: boolean) {
    this.el.classList.toggle('emzikli', tak);
  }
  /** Emziği hızlı hızlı emer (uykuda kıpırdanınca) */
  emzikHizli(ms = 1500) {
    this.emzikEmme = performance.now() + ms;
  }

  // ---------------------------------------------------------------- mama lekeleri
  /** Yüzüne bir mama lekesi ekler */
  lekeEkle() {
    const g = this.svg()?.querySelector('.eg-lekeler');
    if (!g) return;
    const [x, y, r] = LEKE_YER[this.lekeSay++ % LEKE_YER.length];
    const n = 9;
    let d = '';
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rr = r * (0.82 + 0.2 * Math.sin(i * 2.7 + x));
      d += `${i ? 'L' : 'M'}${(x + Math.cos(a) * rr).toFixed(0)} ${(y + Math.sin(a) * rr * 0.85).toFixed(0)}`;
    }
    const e = document.createElementNS(NS, 'g');
    e.setAttribute('class', 'eg-leke');
    e.dataset.x = String(x);
    e.dataset.y = String(y);
    e.dataset.r = String(r);
    e.innerHTML = `<path d="${d}Z" fill="#f4c65c" stroke="#c98e22" stroke-width="7" stroke-linejoin="round"/><ellipse cx="${x - r * 0.3}" cy="${y - r * 0.3}" rx="${r * 0.22}" ry="${r * 0.14}" fill="#fff6c8"/>`;
    g.append(e);
    e.animate([{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1)' }], { duration: sure(260), easing: 'cubic-bezier(.3,1.6,.5,1)' });
  }
  /** Silinmemiş lekeler */
  lekeler(): SVGGElement[] {
    return [...(this.svg()?.querySelectorAll<SVGGElement>('.eg-leke:not(.silindi)') ?? [])];
  }
  /** Bir noktanın (ekran px) çevresindeki lekeleri siler (miktar: bu harekette silinen oran); silinen var mı */
  sil(px: number, py: number, yaricap: number, miktar: number): boolean {
    let degisti = false;
    for (const l of this.lekeler()) {
      const [x, y] = this.ekranda(Number(l.dataset.x), Number(l.dataset.y));
      const r = Number(l.dataset.r) * this.birim();
      if (Math.hypot(x - px, y - py) > yaricap + r) continue;
      const o = Number(l.dataset.o ?? 1) - miktar;
      l.dataset.o = String(o);
      l.style.opacity = String(Math.max(0, o));
      if (o <= 0) l.classList.add('silindi');
      degisti = true;
    }
    return degisti;
  }
  /** En yakın silinmemiş lekenin ekrandaki yeri (ipucu) */
  lekeEkran(): [number, number] | null {
    const l = this.lekeler()[0];
    return l ? this.ekranda(Number(l.dataset.x), Number(l.dataset.y)) : null;
  }

  // ---------------------------------------------------------------- koordinat
  /** Çizim koordinatı → ekran */
  ekranda(x: number, y: number): [number, number] {
    const r = (this.svg() ?? this.kutuEl).getBoundingClientRect();
    const [vx, vy, vw, vh] = KIRPIM;
    return [r.left + ((x - vx) / vw) * r.width, r.top + ((y - vy) / vh) * r.height];
  }
  birim() {
    return (this.svg() ?? this.kutuEl).getBoundingClientRect().width / KIRPIM[2];
  }
  /** Ağzın ekrandaki kutusu (kaşık hedefi) */
  agizKutusu(): DOMRect {
    const [x, y] = this.ekranda(AGIZ[0] + this.bakSimdi * 30, AGIZ[1] + 20);
    const b = this.birim() * 220;
    return new DOMRect(x - b / 2, y - b / 2, b, b);
  }
  /** Yüzün ekrandaki kutusu */
  yuzKutusu(): DOMRect {
    const [x0, y0] = this.ekranda(640, 380);
    const [x1, y1] = this.ekranda(1410, 1030);
    return new DOMRect(x0, y0, x1 - x0, y1 - y0);
  }
  /** Başın üstü (kalpler, Zzz) ekran noktası */
  basUstu(): [number, number] {
    return this.ekranda(1020, 220);
  }
  /** Gövdenin ekrandaki kutusu (önlük, battaniye hedefi) */
  govdeKutusu(): DOMRect {
    const [x0, y0] = this.ekranda(700, 900);
    const [x1, y1] = this.ekranda(1340, 1700);
    return new DOMRect(x0, y0, x1 - x0, y1 - y0);
  }

  kapat() {
    clearTimeout(this.gecici);
    this.kar.kapat();
  }
}
