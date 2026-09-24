/**
 * Mino — konuşan, tepki veren kedi karakteri.
 * Vektör çizim parçalarına ayrılmıştır (kafa, gövde, kuyruk); hareketler CSS değişkenleriyle
 * her karede güncellenir. Ağız, konuşma sesinin gücüne göre açılıp kapanır.
 */
import { konusmaGucu } from '../audio/motor';
import { konusuyorMu } from '../audio/ses';
import { h, TEST_MODU } from '../ui/dom';
import { MINO_SVG } from './mino-svg';

// Pivot noktaları (çizimin viewBox koordinatları)
const BOYUN = { x: 600, y: 1150 };
const KUYRUK = { x: 1140, y: 1165 };
const AYAK = { x: 600, y: 1690 };
const AGIZ = { x: 583, y: 884, g: 150 };

export type Tepki = 'gidik' | 'mir' | 'zipla' | 'hapsu' | 'sasir' | 'hayir' | 'evet' | 'ham' | 'dans' | 'esne';

interface Durum {
  tepki: Tepki | null;
  tepkiBas: number;
  tepkiSure: number;
  uyuyor: boolean;
  kirpBas: number;
  sonrakiKirp: number;
  agiz: number;
  bak: number;
}

function ara(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
const sin = Math.sin;
const donus = (p: { x: number; y: number }, derece: number, sx = 1, sy = 1, tx = 0, ty = 0) =>
  `translate(${p.x + tx}px, ${p.y + ty}px) rotate(${derece}deg) scale(${sx}, ${sy}) translate(${-p.x}px, ${-p.y}px)`;

/** Ağız: 0 = kapalı gülümseme, 1 = kocaman açık */
function agizYollari(acik: number, gulum: number) {
  const { x: cx, y: ust, g } = AGIZ;
  const gen = g * (1 - acik * 0.18);
  const x0 = cx - gen / 2;
  const x1 = cx + gen / 2;
  const derin = 6 + acik * 92;
  const alt = ust + derin;
  const ic = acik < 0.06
    ? ''
    : `M${x0} ${ust} Q${cx} ${ust + 10 * gulum} ${x1} ${ust} Q${x1 + 6} ${ust + derin * 0.85} ${cx} ${alt} Q${x0 - 6} ${ust + derin * 0.85} ${x0} ${ust}Z`;
  const dilY = alt - 6;
  const dil = acik < 0.3 ? '' : `M${cx - 36} ${dilY} Q${cx} ${dilY - 34 * acik} ${cx + 36} ${dilY} Q${cx} ${dilY + 6} ${cx - 36} ${dilY}Z`;
  // Kapalıyken kedi gülümsemesi (ω), açıkken ağız kenarı
  const cizgi = acik < 0.06
    ? `M${cx - 78} ${ust - 8} Q${cx - 40} ${ust + 26 * gulum + 8} ${cx} ${ust - 2} Q${cx + 40} ${ust + 26 * gulum + 8} ${cx + 78} ${ust - 8}`
    : ic;
  return { ic, dil, cizgi };
}

export class Mino {
  readonly el: HTMLElement;
  private kok: SVGSVGElement;
  private agizIc: SVGPathElement;
  private dil: SVGPathElement;
  private agizCizgi: SVGPathElement;
  private kapaklar: SVGGElement[];
  private zzz: HTMLElement;
  private raf = 0;
  private bas = performance.now();
  private d: Durum = { tepki: null, tepkiBas: 0, tepkiSure: 0, uyuyor: false, kirpBas: -1, sonrakiKirp: 1.5, agiz: 0.8, bak: 0 };

  constructor() {
    this.zzz = h('div.mino-zzz', { 'aria-hidden': 'true' }, h('span', {}, 'z'), h('span', {}, 'z'), h('span', {}, 'Z'));
    this.el = h('div.mino', { html: MINO_SVG });
    this.el.append(this.zzz);
    this.kok = this.el.querySelector('svg')!;
    this.agizIc = this.el.querySelector('.m-agiz-ic')!;
    this.dil = this.el.querySelector('.m-dil')!;
    this.agizCizgi = this.el.querySelector('.m-agiz-cizgi')!;
    this.kapaklar = [...this.el.querySelectorAll<SVGGElement>('.m-kapak')];
    this.kare = this.kare.bind(this);
    this.raf = requestAnimationFrame(this.kare);
  }

  /** Kısa bir tepki animasyonu oynat. */
  tepki(t: Tepki, sure?: number) {
    const varsayilan: Record<Tepki, number> = { gidik: 1.6, mir: 2.2, zipla: 0.9, hapsu: 1.2, sasir: 1.1, hayir: 1.0, evet: 0.9, ham: 1.4, dans: 2.4, esne: 2.2 };
    this.d.tepki = t;
    this.d.tepkiBas = this.zaman();
    this.d.tepkiSure = sure ?? varsayilan[t];
    if (t !== 'esne') this.uyan();
  }

  uyu() {
    this.d.uyuyor = true;
    this.el.classList.add('uyuyor');
  }

  uyan() {
    this.d.uyuyor = false;
    this.el.classList.remove('uyuyor');
  }

  get uyuyorMu() {
    return this.d.uyuyor;
  }

  /** Ekran koordinatında ağzın merkezi (yiyecek uçurmak için). */
  agizKonumu(): { x: number; y: number } {
    const r = this.kok.getBoundingClientRect();
    const vb = this.kok.viewBox.baseVal;
    return { x: r.left + ((AGIZ.x - vb.x) / vb.width) * r.width, y: r.top + ((AGIZ.y + 30 - vb.y) / vb.height) * r.height };
  }

  /** Dokunulan noktanın hangi bölgeye denk geldiği. */
  bolge(x: number, y: number): 'kafa' | 'burun' | 'gobek' | 'kuyruk' | 'ayak' {
    const r = this.kok.getBoundingClientRect();
    const vb = this.kok.viewBox.baseVal;
    const vx = vb.x + ((x - r.left) / r.width) * vb.width;
    const vy = vb.y + ((y - r.top) / r.height) * vb.height;
    if (Math.hypot(vx - 566, vy - 850) < 70) return 'burun';
    if (vx > 960 && vy > 850) return 'kuyruk';
    if (vy < BOYUN.y) return 'kafa';
    if (vy > 1560) return 'ayak';
    return 'gobek';
  }

  kapat() {
    cancelAnimationFrame(this.raf);
  }

  private zaman() {
    return (performance.now() - this.bas) / 1000;
  }

  private kare() {
    this.raf = requestAnimationFrame(this.kare);
    const t = this.zaman();
    const d = this.d;
    const uyku = d.uyuyor ? 1 : 0;

    // Temel (bekleme) hareketleri
    let nefes = sin(t * (uyku ? 1.3 : 2.1)) * (uyku ? 0.022 : 0.012);
    let kafaAci = sin(t * 0.9) * 2.2 + (uyku ? 7 : 0);
    let kafaY = uyku ? 14 : 0;
    let kuyrukAci = sin(t * (uyku ? 0.8 : 2.4)) * (uyku ? 3 : 6);
    let govdeAci = 0;
    let ziplaY = 0;
    let sx = 1;
    let sy = 1 + nefes;
    let gozKapali = uyku;
    let mutlu = 0;
    let agizHedef = uyku ? 0 : 0.72;
    let gulum = 1;

    // Göz kırpma
    if (!uyku && t > d.sonrakiKirp) {
      d.kirpBas = t;
      d.sonrakiKirp = t + 2.2 + Math.random() * 3.2;
    }
    if (d.kirpBas >= 0) {
      const k = (t - d.kirpBas) / 0.16;
      if (k < 1) gozKapali = Math.max(gozKapali, sin(k * Math.PI));
    }

    // Tepkiler
    if (d.tepki) {
      const e = (t - d.tepkiBas) / d.tepkiSure; // 0..1
      if (e >= 1) d.tepki = null;
      else {
        const zarf = sin(Math.min(1, e) * Math.PI); // yumuşak başlayıp biten
        switch (d.tepki) {
          case 'gidik':
            govdeAci = sin(t * 38) * 4 * zarf;
            kafaAci += sin(t * 30) * 5 * zarf;
            sy += sin(t * 25) * 0.03 * zarf;
            mutlu = zarf > 0.15 ? 1 : 0;
            agizHedef = 0.95;
            break;
          case 'mir':
            kafaAci += 10 * zarf;
            mutlu = zarf > 0.2 ? 1 : 0;
            agizHedef = 0.05;
            kuyrukAci += sin(t * 6) * 9 * zarf;
            break;
          case 'zipla': {
            const p = Math.min(1, e / 0.85);
            ziplaY = -Math.max(0, sin(p * Math.PI)) * 190;
            const bas = e < 0.12 ? sin((e / 0.12) * Math.PI) : 0;
            sx = 1 + bas * 0.1;
            sy = 1 - bas * 0.12 + (ziplaY < -20 ? 0.05 : 0);
            kuyrukAci += 5 * zarf;
            agizHedef = 1;
            break;
          }
          case 'hapsu':
            if (e < 0.55) {
              kafaAci -= 9 * (e / 0.55);
              kafaY -= 12 * (e / 0.55);
              gozKapali = Math.max(gozKapali, e / 0.55);
              agizHedef = 0.55;
            } else {
              const f = (e - 0.55) / 0.45;
              kafaAci += 14 * sin(Math.min(1, f * 2) * Math.PI) - 9 * (1 - f);
              kafaY += 18 * sin(Math.min(1, f * 2) * Math.PI);
              gozKapali = 1;
              agizHedef = 1;
            }
            break;
          case 'sasir':
            ziplaY = -sin(Math.min(1, e * 2) * Math.PI) * 60;
            sy += 0.04 * zarf;
            agizHedef = 1;
            gulum = -0.2;
            break;
          case 'hayir':
            kafaAci += sin(e * Math.PI * 6) * 9 * zarf;
            agizHedef = 0.08;
            gulum = -0.6;
            break;
          case 'evet':
            kafaY += sin(e * Math.PI * 4) * 16 * zarf;
            mutlu = 1;
            agizHedef = 0.9;
            break;
          case 'ham': {
            const cig = Math.abs(sin(e * Math.PI * 7));
            agizHedef = cig * 0.75;
            mutlu = 1;
            sx = 1 + 0.03 * zarf;
            kafaAci += sin(e * Math.PI * 3.5) * 4;
            break;
          }
          case 'dans':
            govdeAci = sin(e * Math.PI * 8) * 8;
            kafaAci += sin(e * Math.PI * 8 + 0.6) * 8;
            ziplaY = -Math.abs(sin(e * Math.PI * 8)) * 60 * zarf;
            kuyrukAci += sin(e * Math.PI * 8) * 12;
            mutlu = 1;
            agizHedef = 0.95;
            break;
          case 'esne':
            agizHedef = 1.1 * zarf;
            gozKapali = Math.max(gozKapali, zarf);
            kafaAci -= 8 * zarf;
            sy += 0.03 * zarf;
            break;
        }
      }
    }

    // Konuşurken ağız sesin gücüyle açılır
    if (konusuyorMu() && !uyku) {
      const guc = konusmaGucu();
      agizHedef = guc > 0.01 ? Math.min(1, 0.12 + guc * 1.3) : 0.1 + Math.abs(sin(t * 16)) * 0.6; // cihaz sesi: tahmini
      mutlu = 0;
    }
    d.agiz = ara(d.agiz, agizHedef, TEST_MODU ? 1 : 0.35);

    // Uygula
    const s = this.el.style;
    const govde = `translate(0px, ${ziplaY}px) ` + donus(AYAK, govdeAci, sx, sy);
    s.setProperty('--govde', govde);
    s.setProperty('--kafa', donus(BOYUN, kafaAci, 1, 1, 0, kafaY));
    s.setProperty('--kuyruk', donus(KUYRUK, kuyrukAci));
    s.setProperty('--golge', String(1 - Math.min(0.5, -ziplaY / 400)));
    const kapak = Math.max(gozKapali, mutlu);
    for (const k of this.kapaklar) k.style.transform = `translateY(var(--oy)) scaleY(${kapak}) translateY(calc(var(--oy) * -1))`;
    this.el.classList.toggle('mutlu', mutlu > 0.5);
    this.el.classList.toggle('gozkapali', mutlu <= 0.5 && kapak > 0.85);
    const { ic, dil, cizgi } = agizYollari(Math.max(0, d.agiz), gulum);
    this.agizIc.setAttribute('d', ic);
    this.dil.setAttribute('d', dil);
    this.agizCizgi.setAttribute('d', cizgi);
  }
}
