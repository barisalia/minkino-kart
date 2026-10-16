/**
 * P5 mini oyunlarının (Kır ve Çırp, Kazan, Rendele, Pide) ortak parçaları: raf, elde tutulan araç (parmağın biraz
 * üstünde), resim bulma (Gemini kesiti varsa o, yoksa SADE YER TUTUCU), olay kaydı, Mino'nun yüzüne konan şeyler (un,
 * köpük, domates beneği) ve birkaç küçük sentez sesi (rende hışırtısı, fırın çıtırtısı, süt lıkırtısı).
 * Ortak hareketler P2'nin dogra/efekt.ts ve dogra/surukle.ts'inden gelir (yeniden yazılmaz).
 *
 * Yer tutucular bitmiş çizim değildir: düz renk + kahve kontur (ortak.css). Gemini sayfaları (§11e #37 istasyon-kazan,
 * #38 soyacak-rende, #39 yumurta-cirpma; §11f #43 pide-sayfasi) ekip/illustrator/restoran/restoran-isle.cjs ile
 * kesilince `assets/restoran/{alet,yiyecek}/<ad>.webp` olur; kod değişmez.
 */
import { baglam, efektCikisi } from '../../../../src/audio/motor';
import { h, TEST_MODU } from '../../../../src/ui/dom';
import { ucur } from '../dogra/efekt';
import { yeni } from '../dogra/gorsel';
import type { MinoKose } from '../arayuz';
import './ortak.css';

/** Parmağın üstünde tutma payı (parmak aracı örtmesin, §1d) */
export const YUKARI = 34;

const IST = import.meta.glob<string>('../../../../assets/restoran/istasyon/*.{webp,png}', { eager: true, query: '?url', import: 'default' });
/** İstasyon çizimi (mermer, firin) ya da null */
export function istasyonResmi(ad: string): string | null {
  const e = Object.entries(IST).find(([y]) => new RegExp(`/istasyon/${ad}(-\\d+)?\\.(webp|png)$`).test(y.replace(/\\/g, '/')));
  return e ? e[1] : null;
}

/** Gemini kesiti: 'alet/rende', 'yiyecek/kasar-butun' ... ya da null */
export const resim = (yol: string): string | null => yeni(yol) ?? yeni(yol.replace(/^yiyecek\//, 'alet/')) ?? yeni(yol.replace(/^alet\//, 'yiyecek/'));

/** Resim varsa <img>, yoksa sade yer tutucu (ortak.css: .rs-p5-yt[data-yt=ad]) */
export function resimYa(yol: string, yt: string, sinif = 'rs-p5-resim'): HTMLElement {
  const u = resim(yol);
  return u ? h(`img.${sinif}`, { src: u, alt: '', draggable: 'false' }) : h('i.rs-p5-yt', { 'data-yt': yt });
}

/** Olay kaydı (e2e ve ipucu): kok.dataset.olay son olay */
export function olayci(kok: HTMLElement) {
  const olaylar: string[] = [];
  return {
    olaylar,
    olay(ad: string) {
      olaylar.push(ad);
      kok.dataset.olay = ad;
    },
  };
}

// ------------------------------------------------------------------ raf

export interface RafOge<T extends string = string> {
  tur: T;
  el: HTMLElement;
}
/** Raf: sol üstteki geri düğmesinin sağından başlar, öğeler ≥ 64 css px. Rafın alt kenarını döner. */
export function rafYerlestir(kok: HTMLElement, raf: HTMLElement, yatay: boolean): number {
  const W = kok.clientWidth;
  const H = kok.clientHeight;
  const n = raf.childElementCount || 1;
  const solBos = 78;
  const rafEn = W - solBos - 10;
  let s = Math.max(64, Math.min(82, yatay ? H * 0.2 : 76, rafEn / n - 8));
  const sigan = Math.max(1, Math.floor(rafEn / (s + 8)));
  const satir = Math.ceil(n / sigan);
  if (satir > 1) s = Math.max(64, Math.min(s, rafEn / Math.ceil(n / satir) - 8));
  raf.style.cssText = `left:${solBos}px;top:8px;width:${rafEn}px;--s:${s}px`;
  return 8 + satir * (s + 8);
}
export function rafOge<T extends string>(raf: HTMLElement, liste: RafOge<T>[], tur: T, icerik: HTMLElement, etiket: string): HTMLElement {
  const el = h('button.rs-p5-raf-oge', { type: 'button', 'aria-label': etiket, 'data-tur': tur }, icerik);
  raf.append(el);
  liste.push({ tur, el });
  return el;
}

// ------------------------------------------------------------------ elde tutulan

/** Raftan alınan şeyin parmağı izleyen kopyası (aynı karede görünür) */
export class Elde {
  el: HTMLElement | null = null;
  constructor(
    private kat: HTMLElement,
    private kok: HTMLElement,
  ) {}
  al(kaynak: HTMLElement, x: number, y: number, sinif = ''): HTMLElement {
    this.el?.remove();
    const ic = (kaynak.firstElementChild as HTMLElement | null)?.cloneNode(true) as HTMLElement | undefined;
    const el = h(`div.rs-p5-elde${sinif ? '.' + sinif : ''}`, {}, ic ?? h('i'));
    this.kat.append(el);
    this.el = el;
    this.tasi(x, y);
    return el;
  }
  tasi(x: number, y: number) {
    if (this.el) this.el.style.transform = `translate(${x}px,${y - YUKARI}px)`;
  }
  /** geriEl: rafa kayarak döner; yoksa söner */
  birak(geriEl?: HTMLElement | null) {
    const el = this.el;
    this.el = null;
    if (!el) return;
    if (!geriEl) return el.remove();
    const r = geriEl.getBoundingClientRect();
    const kr = this.kok.getBoundingClientRect();
    const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(el.style.transform);
    const x = m ? +m[1] : 0;
    const y = m ? +m[2] : 0;
    void ucur(el, r.left - kr.left + r.width / 2 - x, r.top - kr.top + r.height / 2 - y, 240, -20).then(() => el.remove());
  }
}

/** Bir elemanın kap içindeki merkezi (px) */
export function merkez(el: Element, kap: Element) {
  const r = el.getBoundingClientRect();
  const k = kap.getBoundingClientRect();
  return { x: r.left - k.left + r.width / 2, y: r.top - k.top + r.height / 2, w: r.width, h: r.height };
}

// ------------------------------------------------------------------ Mino'nun yüzüne konanlar

/**
 * Mino'nun yüzüne bir şey konar (un bulutu, köpük, domates beneği): Mino köşesinin baş bölgesinin üstünde, kendi
 * katmanımızda (çerçeveye dokunmadan). ms sonra söner. Kod çizimi Mino'da da, Gemini Mino'sunda da baş üst yarıda.
 */
export function minoYuzune(kok: HTMLElement, mino: MinoKose, tur: 'un' | 'kopuk' | 'domates' | 'kizar', ms = 2600) {
  const r = mino.el.getBoundingClientRect();
  const k = kok.getBoundingClientRect();
  if (!r.width) return;
  const yuz = h('div.rs-p5-mino-yuz', { 'data-tur': tur, 'aria-hidden': 'true' });
  const w = r.width * 0.62;
  yuz.style.cssText = `left:${r.left - k.left + r.width / 2 - w / 2}px;top:${r.top - k.top + r.height * 0.16}px;width:${w}px;height:${w * 0.72}px`;
  const n = tur === 'un' ? 1 : tur === 'kizar' ? 2 : tur === 'kopuk' ? 5 : 7;
  for (let i = 0; i < n; i++) {
    const b = h('i');
    const a = tur === 'kizar' ? i * Math.PI : i * 2.39996;
    const rr = tur === 'un' ? 0 : tur === 'kizar' ? 30 : 34 * Math.sqrt((i + 0.6) / n);
    b.style.left = `${50 + Math.cos(a) * rr}%`;
    b.style.top = `${(tur === 'kizar' ? 60 : 48) + Math.sin(a) * rr * 0.8}%`;
    yuz.append(b);
  }
  kok.append(yuz);
  try {
    yuz.animate([{ opacity: 0, transform: 'scale(0.6)' }, { opacity: 1, transform: 'scale(1.08)', offset: 0.25 }, { opacity: 1, transform: 'scale(1)', offset: 0.8 }, { opacity: 0, transform: 'scale(1)' }], {
      duration: TEST_MODU ? 80 : ms,
      easing: 'ease-out',
      fill: 'forwards',
    }).finished.then(
      () => yuz.remove(),
      () => yuz.remove(),
    );
  } catch {
    yuz.remove();
  }
}

// ------------------------------------------------------------------ küçük sentez sesleri (Web Audio, dosya yok)

function hazir(): [AudioContext, GainNode] | null {
  const c = baglam();
  const o = efektCikisi();
  if (!c || !o || c.state !== 'running') return null;
  return [c, o];
}
let gurultuT: AudioBuffer | null = null;
function gurultu(bas: number, sure: number, f1: number, f2: number, ses: number, q = 1, tip: BiquadFilterType = 'bandpass') {
  const hz = hazir();
  if (!hz) return;
  const [c, cikis] = hz;
  if (!gurultuT) {
    gurultuT = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = gurultuT.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = c.currentTime + bas;
  const s = c.createBufferSource();
  s.buffer = gurultuT;
  const f = c.createBiquadFilter();
  f.type = tip;
  f.Q.value = q;
  f.frequency.setValueAtTime(f1, t);
  f.frequency.exponentialRampToValueAtTime(f2, t + sure);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(ses, t + Math.min(0.012, sure * 0.25));
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  s.connect(f).connect(g).connect(cikis);
  s.start(t, Math.random() * 0.5);
  s.stop(t + sure + 0.05);
}
function ton(frek: number, bas: number, sure: number, tip: OscillatorType, ses: number, bitis?: number) {
  const hz = hazir();
  if (!hz) return;
  const [c, cikis] = hz;
  const t = c.currentTime + bas;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = tip;
  o.frequency.setValueAtTime(frek, t);
  if (bitis) o.frequency.exponentialRampToValueAtTime(bitis, t + sure);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(ses, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  o.connect(g).connect(cikis);
  o.start(t);
  o.stop(t + sure + 0.05);
}

export const p5Ses = {
  /** rende: kısa pürüzlü "hışt" (perde: sürtme hızı, sert: havuç) */
  hisir(perde = 1, sert = false) {
    gurultu(0, 0.075, 5200 * perde, 2600 * perde, sert ? 0.22 : 0.17, 1.6);
    gurultu(0.02, 0.05, 3400 * perde, 2000 * perde, 0.08, 3);
    if (sert) ton(1300 * perde, 0, 0.03, 'square', 0.025);
  },
  /** domates rendesi: ıslak "fışşş" */
  fis() {
    gurultu(0, 0.5, 2200, 7000, 0.24, 0.7, 'highpass');
    gurultu(0.05, 0.3, 700, 300, 0.12, 0.8, 'lowpass');
  },
  /** boş rendeye sürtme: metal "tıkır" */
  metal() {
    ton(2300, 0, 0.06, 'square', 0.04, 1900);
    ton(3100, 0.05, 0.05, 'square', 0.03, 2700);
  },
  /** çırpma teli kâsede: ince tel şıkırtısı */
  tel(perde = 1) {
    ton(2600 * perde, 0, 0.04, 'triangle', 0.05, 2200 * perde);
    gurultu(0, 0.04, 6000, 4500, 0.04, 4);
  },
  /** süt: lıkır lıkır */
  likir(perde = 1) {
    ton(520 * perde, 0, 0.07, 'sine', 0.1, 820 * perde);
    ton(640 * perde, 0.08, 0.06, 'sine', 0.07, 980 * perde);
  },
  /** un / şeker kaşığı: yumuşak "pof" (şekerde ince şıkırtı) */
  kasik(seker: boolean) {
    if (seker) for (let i = 0; i < 5; i++) gurultu(i * 0.025, 0.025, 7000, 5000, 0.07, 5);
    else gurultu(0, 0.22, 900, 250, 0.22, 0.6, 'lowpass');
  },
  /** hapşu (Mino; un bulutu) */
  hapsu() {
    gurultu(0, 0.22, 1200, 2400, 0.08, 1.2);
    gurultu(0.24, 0.18, 4200, 1500, 0.26, 0.8);
    ton(420, 0.24, 0.16, 'triangle', 0.08, 260);
  },
  /** kepçe kâseye: şlurp */
  slurp() {
    gurultu(0, 0.24, 500, 1600, 0.16, 1.4, 'lowpass');
    ton(300, 0.02, 0.2, 'sine', 0.06, 620);
  },
  /** mercimek kazana: tane tane şıkırtı */
  tane() {
    for (let i = 0; i < 7; i++) gurultu(i * 0.03 + Math.random() * 0.02, 0.02, 3800, 2600, 0.08, 4);
  },
  /** fırın çıtırtısı (odun ateşi) */
  citirti() {
    const n = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) gurultu(i * (0.03 + Math.random() * 0.05), 0.018, 2600 + Math.random() * 2000, 1800, 0.07 + Math.random() * 0.05, 3);
  },
  /** merdane hamurda: yumuşak tok yuvarlanma */
  merdane(perde = 1) {
    gurultu(0, 0.09, 300 * perde, 180 * perde, 0.12, 0.9, 'lowpass');
  },
  /** peynir ipi kopar */
  ip(i = 0) {
    ton(700 + i * 120, 0, 0.09, 'sine', 0.1, 1300 + i * 160);
  },
  /** kürek fırına kayar */
  kay() {
    gurultu(0, 0.3, 1600, 600, 0.12, 0.8);
  },
};
