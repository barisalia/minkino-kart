/**
 * Mino — konuşan, tepki veren kedi karakteri.
 * Vektör çizim katmanlara ayrılmıştır (kafa, gövde, iki kol, kuyruk; ekip/mino/mino-final.svg → scripts/mino/rig.mjs);
 * hareketler CSS değişkenleriyle her karede güncellenir. Ağız, konuşma sesinin gücüne göre açılıp kapanır.
 */
import { konusmaGucu } from '../audio/motor';
import { konusuyorMu } from '../audio/ses';
import { h, TEST_MODU } from '../ui/dom';
import { MINO_SVG } from './mino-svg';

// Dönme noktaları (çizimin 2048'lik koordinatları; tasarımcının önerisi)
const BOYUN = { x: 1024, y: 1240 };
const KUYRUK = { x: 1250, y: 1680 };
const AYAK = { x: 1024, y: 1885 };
const KOL_SOL = { x: 840, y: 1290 };
const KOL_SAG = { x: 1205, y: 1290 };
/** ağzın üst kenarı (bıyık çizgisinin iki ucu) ve genişliği */
const AGIZ = { x: 1024, y: 992, g: 168 };
/** Kollar bundan fazla kalkınca kol ucunda kontur izi görünüyor (çizimin bilinen sınırı) */
const KOL_EN_COK = 24;
/** Zıplama miktarları eski çizimin ölçeğinde yazıldı; yeni çizim daha büyük */
const OLCEK = 1.35;

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

/**
 * Ağız: 0 = kapalı gülümseme (ω), 1 = kocaman açık. Tasarımcının ağız katmanıyla aynı biçim:
 * burundan inen çizgi, üst kenarı ω olan ağız, altta dil.
 */
function agizYollari(acik: number, gulum: number) {
  const { x: cx, y: ust, g } = AGIZ;
  const burunAlt = 956;
  if (acik < 0.06) {
    // kapalı: burun çizgisi + kedi gülümsemesi (ω)
    const orta = ust - 4;
    const cukur = ust + 14 + 26 * gulum;
    const cizgi = `M${cx} ${burunAlt}V${orta}M${cx - 80} ${ust - 14}Q${cx - 44} ${cukur + 6} ${cx} ${orta}Q${cx + 44} ${cukur + 6} ${cx + 80} ${ust - 14}`;
    return { ic: '', dil: '', cizgi };
  }
  const gen = g * (1 - acik * 0.18);
  const x0 = cx - gen / 2;
  const x1 = cx + gen / 2;
  const derin = 10 + acik * 108;
  const alt = ust + derin;
  // üst kenar: iki yanda aşağı, ortada burna doğru kalkan ω
  const tepe = ust - 16 - 10 * gulum;
  const ic = `M${x0} ${ust}Q${(x0 + cx) / 2} ${ust + 4} ${cx} ${tepe}Q${(x1 + cx) / 2} ${ust + 4} ${x1} ${ust}Q${x1 + 8} ${ust + derin * 0.85} ${cx} ${alt}Q${x0 - 8} ${ust + derin * 0.85} ${x0} ${ust}Z`;
  const dilY = alt - 8;
  const dil = acik < 0.3 ? '' : `M${cx - 44} ${dilY}Q${cx} ${dilY - 40 * acik} ${cx + 44} ${dilY}Q${cx} ${dilY + 8} ${cx - 44} ${dilY}Z`;
  // ağız kenarı + yanlarda yanağa kıvrılan uçlar + burun çizgisi
  const cizgi = `${ic}M${x0} ${ust}Q${x0 - 18} ${ust - 18} ${x0 - 36} ${ust - 40}M${x1} ${ust}Q${x1 + 18} ${ust - 18} ${x1 + 36} ${ust - 40}M${cx} ${burunAlt}V${tepe}`;
  return { ic, dil, cizgi };
}

export class Mino {
  readonly el: HTMLElement;
  private kok: SVGSVGElement;
  private agizIc: SVGPathElement;
  private dil: SVGPathElement;
  private agizCizgi: SVGPathElement;
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
    if (Math.hypot(vx - 1024, vy - 915) < 75) return 'burun';
    if (vx > 1300 && vy > 1180) return 'kuyruk';
    if (vy < BOYUN.y - 20) return 'kafa';
    if (vy > 1680) return 'ayak';
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
    // kollar: derece, + = dışa/yukarı kalkar (iki kol için aynı yön anlamı)
    let kolSol = sin(t * (uyku ? 1.3 : 2.1)) * 1.5;
    let kolSag = sin(t * (uyku ? 1.3 : 2.1) + 0.4) * 1.5;

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
            kolSol += (6 + sin(t * 34) * 5) * zarf;
            kolSag += (6 + sin(t * 34 + 1.5) * 5) * zarf;
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
            // havadayken iki kol da kalkar
            kolSol += 22 * Math.max(0, sin(p * Math.PI));
            kolSag += 22 * Math.max(0, sin(p * Math.PI));
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
              kolSol += 12 * sin(Math.min(1, f * 2) * Math.PI);
              kolSag += 12 * sin(Math.min(1, f * 2) * Math.PI);
            }
            break;
          case 'sasir':
            ziplaY = -sin(Math.min(1, e * 2) * Math.PI) * 60;
            sy += 0.04 * zarf;
            agizHedef = 1;
            gulum = -0.2;
            kolSol += 16 * zarf;
            kolSag += 16 * zarf;
            break;
          case 'hayir':
            kafaAci += sin(e * Math.PI * 6) * 9 * zarf;
            agizHedef = 0.08;
            gulum = -0.6;
            kolSol -= 4 * zarf;
            kolSag -= 4 * zarf;
            break;
          case 'evet':
            kafaY += sin(e * Math.PI * 4) * 16 * zarf;
            mutlu = 1;
            agizHedef = 0.9;
            // el sallama (sağ kol)
            kolSag += (15 + sin(e * Math.PI * 6) * 8) * zarf;
            break;
          case 'ham': {
            const cig = Math.abs(sin(e * Math.PI * 7));
            agizHedef = cig * 0.75;
            mutlu = 1;
            sx = 1 + 0.03 * zarf;
            kolSol -= 6 * zarf;
            kolSag -= 6 * zarf;
            kafaAci += sin(e * Math.PI * 3.5) * 4;
            break;
          }
          case 'dans':
            govdeAci = sin(e * Math.PI * 8) * 8;
            kafaAci += sin(e * Math.PI * 8 + 0.6) * 8;
            ziplaY = -Math.abs(sin(e * Math.PI * 8)) * 60 * zarf;
            kuyrukAci += sin(e * Math.PI * 8) * 12;
            // kollar sırayla kalkar
            kolSol += (10 + sin(e * Math.PI * 8) * 12) * zarf;
            kolSag += (10 - sin(e * Math.PI * 8) * 12) * zarf;
            mutlu = 1;
            agizHedef = 0.95;
            break;
          case 'esne':
            agizHedef = 1.1 * zarf;
            gozKapali = Math.max(gozKapali, zarf);
            kafaAci -= 8 * zarf;
            sy += 0.03 * zarf;
            // esnerken gerinir
            kolSol += 18 * zarf;
            kolSag += 18 * zarf;
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
    const govde = `translate(0px, ${ziplaY * OLCEK}px) ` + donus(AYAK, govdeAci, sx, sy);
    s.setProperty('--govde', govde);
    // kafa fazla yukarı kalkarsa fuların üstünde boynun konturu görünür: yukarı en çok 6 birim
    s.setProperty('--kafa', donus(BOYUN, kafaAci, 1, 1, 0, Math.max(-6, kafaY)));
    s.setProperty('--kuyruk', donus(KUYRUK, kuyrukAci));
    const kol = (a: number) => Math.max(-8, Math.min(KOL_EN_COK, a));
    s.setProperty('--kol-sol', donus(KOL_SOL, kol(kolSol)));
    s.setProperty('--kol-sag', donus(KOL_SAG, -kol(kolSag)));
    s.setProperty('--golge', String(1 - Math.min(0.5, -ziplaY / 400)));
    // Göz: açık çizim ↔ kapalı / mutlu göz çizgisi (katman değişimi; kırpma anında)
    this.el.classList.toggle('mutlu', mutlu > 0.5);
    this.el.classList.toggle('gozkapali', mutlu <= 0.5 && gozKapali > 0.5);
    const { ic, dil, cizgi } = agizYollari(Math.max(0, d.agiz), gulum);
    this.agizIc.setAttribute('d', ic);
    this.dil.setAttribute('d', dil);
    this.agizCizgi.setAttribute('d', cizgi);
  }
}
