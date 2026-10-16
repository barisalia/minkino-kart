/**
 * P3 mini oyunlarının (Yıka, Soy, Kızart, Çalkala ve Doldur) ortakları. ekip/senaryo/RESTORAN.md §8 M2, M3, M11, M12.
 *
 *  - Bütün sebze resmi + gövde elipsi: resim (Gemini `yiyecek/<m>-butun` ya da var olan Recraft `assets/meyveler`)
 *    ve resmin içinde sebzenin GÖVDESİ (havucun yaprağı, salatalığın sapı hariç): leke, soyma, köpük oraya düşer.
 *    Resim yoksa sade yer tutucu (düz renk + kahve kontur). Netlik: resim kaynak px / 3'ten büyük çizilmez.
 *  - Kenardan bakan kişi (Lokum, Kino): Seri 2 kesme kukla kitinin baş ve omuz parçaları, dinlenme duruşunda; yalnız
 *    yüz değişimi (göz, ağız) ve bütün gövdenin ezilme-esnemesi. PARÇA DÖNDÜRME YOK.
 *  - Küçük müzik cümleleri (Web Audio; dosya yok) ve olay kaydı (e2e).
 */
import { baglam, efektCikisi } from '../../../../src/audio/motor';
import { h, TEST_MODU } from '../../../../src/ui/dom';
import { NETLIK_DPR } from '../../../../src/ui/netlik';
import lokumJson from '../../../../assets/karakter/lokum/lokum.json';
import kinoJson from '../../../../assets/karakter/kino-yeni/kino-yeni.json';
import type { Malzeme } from '../arayuz';
import { butunResim, enCokCss, RENK, yeni } from '../dogra/gorsel';
import './ortak.css';

export const sureMs = (ms: number) => (TEST_MODU ? Math.min(ms, 40) : ms);
export const bekle = (ms: number) => new Promise<void>((r) => window.setTimeout(r, sureMs(ms)));

// ------------------------------------------------------------------ istasyon çizimi var mı

const ISTASYON = import.meta.glob<string>('../../../../assets/restoran/istasyon/*.{webp,png}', { eager: true, query: '?url', import: 'default' });
/** 'lavabo' → çizim geldi mi (gelmediyse nesneler sade yer tutucuyla çizilir) */
export const istasyonCizimi = (ad: string) => Object.keys(ISTASYON).some((y) => new RegExp(`/istasyon/${ad}(-\\d+)?\\.(webp|png)$`).test(y));

// ------------------------------------------------------------------ bütün sebze

/** Resmin içinde gövde: merkez ve yarıçaplar resim kutusunun yüzdesi, a derece (saat yönü). */
export interface Elips {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  a: number;
}
/** Var olan Recraft resimlerinde gövde (assets/meyveler; 560 px kare) */
const GOVDE_ESKI: Partial<Record<Malzeme, Elips>> = {
  patates: { cx: 50, cy: 50, rx: 43, ry: 31, a: -28 },
  havuc: { cx: 62, cy: 70, rx: 27, ry: 13, a: 62 },
  salatalik: { cx: 50, cy: 50, rx: 44, ry: 10, a: -38 },
  portakal: { cx: 47, cy: 55, rx: 37, ry: 35, a: 0 },
  limon: { cx: 50, cy: 50, rx: 40, ry: 31, a: -50 },
  domates: { cx: 50, cy: 58, rx: 41, ry: 33, a: 0 },
  biber: { cx: 46, cy: 62, rx: 33, ry: 30, a: 0 },
  elma: { cx: 50, cy: 60, rx: 38, ry: 33, a: 0 },
};
/** Gemini sebze sayfası (§11a SEBZE: "lying horizontally", büyük) ve yer tutucu için varsayılan */
const GOVDE_YENI: Partial<Record<Malzeme, Elips>> = {
  havuc: { cx: 46, cy: 50, rx: 40, ry: 14, a: 0 },
  salatalik: { cx: 50, cy: 50, rx: 46, ry: 14, a: 0 },
  patates: { cx: 50, cy: 50, rx: 44, ry: 32, a: 0 },
};
const GOVDE_VARSAYILAN: Elips = { cx: 50, cy: 52, rx: 40, ry: 34, a: 0 };

export interface Sebze {
  el: HTMLElement;
  /** resim (yoksa yer tutucu) */
  img: HTMLImageElement | null;
  govde: Elips;
  /** resim kutusunun en / boy oranı */
  oran: number;
  /** bu sebze en çok kaç css px eninde çizilebilir (netlik) */
  enCok: number;
}

/** Bütün sebze (Yıka, Soy): kutusunu doldurur; boyu dışarıdan verilir (sebzeBoyu). */
export function sebzeEl(m: Malzeme, soyulmus = false): Sebze {
  const b = butunResim(m, soyulmus);
  const el = h('div.rs-p3-sebze', { 'data-malzeme': m, 'aria-hidden': 'true' });
  const [dis, ic] = RENK[m] ?? ['#9bc46a', '#d9efb4', '#fff'];
  el.style.setProperty('--dis', dis);
  el.style.setProperty('--ic', ic);
  if (!b) {
    el.dataset.yertutucu = '1';
    el.append(h('i.rs-p3-sebze-yt'));
    return { el, img: null, govde: GOVDE_YENI[m] ?? GOVDE_VARSAYILAN, oran: 1, enCok: 4000 };
  }
  const img = h('img.rs-p3-sebze-resim', { src: b.url, alt: '', draggable: 'false' }) as HTMLImageElement;
  el.append(img);
  const eskiMi = b.yol.startsWith('meyveler/');
  return { el, img, govde: (eskiMi ? GOVDE_ESKI[m] : GOVDE_YENI[m]) ?? GOVDE_VARSAYILAN, oran: 1, enCok: enCokCss(b.yol, b.url) };
}

/** Elipsin içinde mi (yerel px; kutu w×h) — pay: 1 = tam elips */
export function elipsIcinde(e: Elips, w: number, h: number, x: number, y: number, pay = 1): boolean {
  const cx = (e.cx / 100) * w;
  const cy = (e.cy / 100) * h;
  const a = (e.a * Math.PI) / 180;
  const dx = x - cx;
  const dy = y - cy;
  const u = dx * Math.cos(a) + dy * Math.sin(a);
  const v = -dx * Math.sin(a) + dy * Math.cos(a);
  const rx = (e.rx / 100) * w * pay;
  const ry = (e.ry / 100) * h * pay;
  return (u * u) / (rx * rx) + (v * v) / (ry * ry) <= 1;
}
/** Elips üstünde (u, v ∈ -1..1, gövde ekseninde) bir noktanın yerel px'i */
export function elipsNokta(e: Elips, w: number, h: number, u: number, v: number): { x: number; y: number } {
  const a = (e.a * Math.PI) / 180;
  const U = u * (e.rx / 100) * w;
  const V = v * (e.ry / 100) * h;
  return { x: (e.cx / 100) * w + U * Math.cos(a) - V * Math.sin(a), y: (e.cy / 100) * h + U * Math.sin(a) + V * Math.cos(a) };
}

// ------------------------------------------------------------------ kenardan bakan kişi (Lokum, Kino)

interface KitParca {
  resim: string;
  kutu: [number, number, number, number];
}
interface Kit {
  boyut: [number, number];
  parcalar: Record<string, KitParca>;
  sira: string[];
  gizli?: string[];
  tepe?: number;
}
const KIT: Record<'lokum' | 'kino', { j: Kit; klasor: string }> = {
  lokum: { j: lokumJson as unknown as Kit, klasor: 'lokum' },
  kino: { j: kinoJson as unknown as Kit, klasor: 'kino-yeni' },
};
const PARCA = import.meta.glob<string>('../../../../assets/karakter/{lokum,kino-yeni}/*.webp', { eager: true, query: '?url', import: 'default' });
/** Bakarken görünmeyen parçalar (bacak, ayak, kuyruk, kalça) */
const ALT = /^(bacak|ayak|kuyruk|kalca)/;

export type Goz = 'acik' | 'mutlu' | 'kapali' | 'saskin' | 'yari';
export type Agiz = 'gulumse' | 'kahkaha' | 'o' | 'genis' | 'az';

export interface Bakan {
  el: HTMLElement;
  /** yan: 'alt' (alt kenardan yükselir) ya da 'sag' (sağ kenardan uzanır); x/y: kenar boyunca konum (px); boy: figürün baş-omuz yüksekliği (px) */
  gel(yan: 'alt' | 'sag', konum: number, boy: number): Promise<void>;
  git(): Promise<void>;
  yuz(goz: Goz, agiz: Agiz): void;
  /** kap içi px: başın tepesi, burun, ağız */
  nokta(ad: 'tepe' | 'burun' | 'agiz'): { x: number; y: number };
  /** başın üstüne bir şey koy (taç): kap içi değil, figürün içine yerleşir */
  basinaKoy(el: HTMLElement, en: number): void;
  sil(): void;
}

/** Lokum ya da Kino kenardan bakar (kukla kitinin baş + omuz parçaları; kaynak px'in üstüne büyütülmez) */
export function bakanKur(kap: HTMLElement, kim: 'lokum' | 'kino'): Bakan {
  const { j, klasor } = KIT[kim];
  const [W, H] = j.boyut;
  const tepe = j.tepe ?? Math.min(...Object.values(j.parcalar).map((p) => p.kutu[1]));
  // baş-omuz: tepeden gövdenin ortasına kadar
  const govde = j.parcalar.govde?.kutu ?? [0, H * 0.5, W, H * 0.3];
  const omuzAlt = govde[1] + govde[3] * 0.55;
  const figur = h('div.rs-p3-bakan-figur');
  const el = h('div.rs-p3-bakan', { 'data-kim': kim, 'aria-hidden': 'true' }, figur);
  const gizli = new Set(j.gizli ?? []);
  const imgler = new Map<string, HTMLImageElement>();
  for (const ad of j.sira) {
    if (ALT.test(ad)) continue;
    const p = j.parcalar[ad];
    const u = PARCA[`../../../../assets/karakter/${klasor}/${ad}.webp`];
    if (!p || !u) continue;
    const [x, y, w, hh] = p.kutu;
    const img = h('img.rs-p3-bakan-parca', { src: u, alt: '', draggable: 'false', 'data-parca': ad }) as HTMLImageElement;
    img.style.cssText = `left:${(x / W) * 100}%;top:${(y / H) * 100}%;width:${(w / W) * 100}%;height:${(hh / H) * 100}%`;
    if (gizli.has(ad)) img.hidden = true;
    imgler.set(ad, img);
    figur.append(img);
  }
  const ust = h('div.rs-p3-bakan-ust');
  figur.append(ust);
  kap.append(el);
  let olcek = 0.2;
  let yan: 'alt' | 'sag' = 'alt';

  const yuz = (goz: Goz, agiz: Agiz) => {
    for (const [ad, img] of imgler) {
      if (ad.startsWith('gozler-')) img.hidden = ad !== `gozler-${goz}`;
      else if (ad.startsWith('agiz-')) img.hidden = ad !== `agiz-${agiz}`;
    }
  };
  const nokta = (ad: 'tepe' | 'burun' | 'agiz') => {
    const r = figur.getBoundingClientRect();
    const k = kap.getBoundingClientRect();
    const p = ad === 'tepe' ? [W * 0.5, tepe] : ad === 'burun' ? (() => { const b = j.parcalar.burun?.kutu ?? [W * 0.45, H * 0.3, W * 0.1, H * 0.06]; return [b[0] + b[2] / 2, b[1] + b[3] / 2]; })() : (() => { const a = j.parcalar['agiz-gulumse']?.kutu ?? [W * 0.45, H * 0.38, W * 0.1, H * 0.04]; return [a[0] + a[2] / 2, a[1] + a[3] / 2]; })();
    return { x: r.left - k.left + (p[0] / W) * r.width, y: r.top - k.top + (p[1] / H) * r.height };
  };
  return {
    el,
    yuz,
    nokta,
    async gel(y, konum, boy) {
      yan = y;
      // boy: tepeden omuz altına kadar görünen kısım; netlik: kit pikselinin üstüne çıkmaz (DPR 3)
      olcek = Math.min(boy / (omuzAlt - tepe), 1 / NETLIK_DPR);
      const fw = W * olcek;
      const fh = H * olcek;
      figur.style.width = `${fw}px`;
      figur.style.height = `${fh}px`;
      el.dataset.yan = y;
      const kw = kap.clientWidth;
      const kh = kap.clientHeight;
      const gorunen = (omuzAlt - tepe) * olcek;
      // figürün sol üstü: alt kenardan başın tepesi kh - gorunen'de
      const sol = y === 'alt' ? konum - fw / 2 : kw - (W * 0.62) * olcek;
      const ustY = y === 'alt' ? kh - gorunen - tepe * olcek : konum - (tepe * olcek + gorunen * 0.45);
      el.style.transform = `translate(${sol}px,${ustY}px)`;
      const gizle = y === 'alt' ? `translateY(${gorunen + 20}px)` : `translateX(${W * 0.7 * olcek}px)`;
      el.classList.add('rs-gorunur');
      try {
        await figur.animate([{ transform: gizle }, { transform: 'translate(0,0) scale(1.04,0.95)', offset: 0.75 }, { transform: 'none' }], { duration: sureMs(380), easing: 'cubic-bezier(.3,.7,.4,1.2)', fill: 'backwards' }).finished;
      } catch {
        /* yok say */
      }
    },
    async git() {
      const gorunen = (omuzAlt - tepe) * olcek;
      const gizle = yan === 'alt' ? `translateY(${gorunen + 20}px)` : `translateX(${W * 0.7 * olcek}px)`;
      try {
        await figur.animate([{ transform: 'none' }, { transform: gizle }], { duration: sureMs(320), easing: 'ease-in', fill: 'forwards' }).finished;
      } catch {
        /* yok say */
      }
      el.classList.remove('rs-gorunur');
      figur.getAnimations().forEach((a) => a.cancel());
    },
    basinaKoy(x, en) {
      ust.replaceChildren(x);
      const fw = W * olcek;
      ust.style.cssText = `left:${(fw - en) / 2}px;top:${tepe * olcek - en * 0.42}px;width:${en}px;height:${en * 0.6}px`;
    },
    sil() {
      el.remove();
    },
  };
}

// ------------------------------------------------------------------ küçük müzik cümleleri

function hazir(): [AudioContext, GainNode] | null {
  const c = baglam();
  const o = efektCikisi();
  if (!c || !o || c.state !== 'running') return null;
  return [c, o];
}
const NOTA = (n: number) => 440 * Math.pow(2, (n - 69) / 12);
export function nota(n: number, bas: number, sure: number, tip: OscillatorType = 'triangle', ses = 0.11, kay?: number) {
  const hz = hazir();
  if (!hz) return;
  const [c, cikis] = hz;
  const t = c.currentTime + bas;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = tip;
  o.frequency.setValueAtTime(NOTA(n), t);
  if (kay) o.frequency.exponentialRampToValueAtTime(NOTA(n + kay), t + sure);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(ses, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  o.connect(g).connect(cikis);
  o.start(t);
  o.stop(t + sure + 0.05);
}
/** Gürültü patlaması (fışkırma, tuz bulutu, kanat) */
export function hisir(bas: number, sure: number, f1: number, f2: number, ses = 0.16, tip: BiquadFilterType = 'bandpass') {
  const hz = hazir();
  if (!hz) return;
  const [c, cikis] = hz;
  const t = c.currentTime + bas;
  const n = Math.max(1, Math.floor(c.sampleRate * (sure + 0.05)));
  const buf = c.createBuffer(1, n, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const s = c.createBufferSource();
  s.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = tip;
  f.frequency.setValueAtTime(f1, t);
  f.frequency.exponentialRampToValueAtTime(f2, t + sure);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(ses, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  s.connect(f).connect(g).connect(cikis);
  s.start(t);
  s.stop(t + sure + 0.05);
}
/** Ödül cümlesi: oyun başına ayrı kısa ezgi (aynı ödül müziği tekrar etmesin) */
export function odulEzgi(dizi: number[], ara = 0.1) {
  dizi.forEach((n, i) => nota(n, i * ara, 0.18, 'triangle', 0.11));
  nota(dizi[dizi.length - 1] + 12, dizi.length * ara + 0.05, 0.35, 'sine', 0.08);
}
/** Kanat pırpırı (uğur böceği) */
export function pirpir() {
  for (let i = 0; i < 6; i++) hisir(i * 0.045, 0.035, 2600, 1800, 0.06);
}
/** Hapşırık: "ha… ha… hapşu!" */
export function hapsu() {
  nota(67, 0, 0.16, 'sine', 0.07, 3);
  nota(70, 0.22, 0.16, 'sine', 0.08, 3);
  hisir(0.46, 0.22, 3000, 900, 0.22);
  nota(62, 0.46, 0.12, 'triangle', 0.08, -7);
}
/** Kıkırdama */
export function kikir() {
  [79, 81, 79, 83].forEach((n, i) => nota(n, i * 0.08, 0.07, 'triangle', 0.07));
}

// ------------------------------------------------------------------ olay kaydı ve bekleme

export function olayKaydi(kok: HTMLElement) {
  const olaylar: string[] = [];
  return {
    olaylar,
    olay(ad: string) {
      olaylar.push(ad);
      kok.dataset.olay = ad;
    },
  };
}

/** Bir elemanın kap içi merkezi */
export function merkez(el: Element, kap: Element): { x: number; y: number } {
  const r = el.getBoundingClientRect();
  const k = kap.getBoundingClientRect();
  return { x: r.left - k.left + r.width / 2, y: r.top - k.top + r.height / 2 };
}

/** Yeni Gemini aleti / efekti, yoksa null (dogra/gorsel'in `yeni`si; yol: 'alet/soyacak') */
export const resim = (yol: string) => yeni(yol);
