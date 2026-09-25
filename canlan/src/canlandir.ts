/**
 * Canlanma: çocuğun KENDİ çizgileri parça parça hareket eder (balığın kuyruğu çırpar, arabanın tekerleri döner…).
 * Çizgiler puanlamada en yakın şablon parçasına bölünür; hareketler şablon koordinatında tanımlıdır ve
 * hizalama dönüşümünün tersiyle çocuğun çizimine taşınır.
 */
import type { Donusum, Parcali } from './puan';
import { parcaAlanlari } from './boya';
import type { Hareket, Nokta, Resim, SablonCizgi } from './resimler';
import { SUS } from './susler';

const NS = 'http://www.w3.org/2000/svg';
const el = <K extends keyof SVGElementTagNameMap>(ad: K, a: Record<string, string | number> = {}) => {
  const e = document.createElementNS(NS, ad);
  for (const [k, v] of Object.entries(a)) e.setAttribute(k, String(v));
  return e;
};

/** Yumuşak çizgi yolu (tuvaldeki çizimle aynı eğri). */
export function yolD(n: Nokta[]): string {
  const f = (v: number) => v.toFixed(4);
  if (n.length === 1) return `M${f(n[0][0])} ${f(n[0][1])}l0.0001 0`;
  let d = `M${f(n[0][0])} ${f(n[0][1])}`;
  for (let i = 1; i < n.length - 1; i++) {
    const mx = (n[i][0] + n[i + 1][0]) / 2;
    const my = (n[i][1] + n[i + 1][1]) / 2;
    d += `Q${f(n[i][0])} ${f(n[i][1])} ${f(mx)} ${f(my)}`;
  }
  const s = n[n.length - 1];
  return `${d}L${f(s[0])} ${f(s[1])}`;
}

/**
 * Şablonu (örnek resim) çizer.
 * - "sus": liste kartındaki gibi bitmiş, boyalı ve süslü hâli
 * - "acik": bakarak çizmede olduğu gibi çizgiler + hafif boya ipucu
 * - "cizgi": yalnızca çizgiler
 */
export function sablonSvg(r: Resim, o: { kalinlik?: number; renk?: string; sinif?: string; tur?: 'sus' | 'acik' | 'cizgi' } = {}): SVGSVGElement {
  const s = el('svg', { viewBox: '0 0 1 1', class: o.sinif ?? 'cc-sablon', 'aria-hidden': 'true' });
  const tur = o.tur ?? 'cizgi';
  const g = SUS[r.id];
  if (tur !== 'cizgi' && g) {
    for (const p of [...new Set(r.cizgiler.map((c) => c.parca))]) {
      const renk = g.boya[p];
      if (!renk) continue;
      for (const a of parcaAlanlari(r, p)) s.append(el('path', { d: `M${a.map(([x, y]) => `${x.toFixed(4)} ${y.toFixed(4)}`).join('L')}Z`, fill: renk, opacity: tur === 'acik' ? 0.28 : 1 }));
    }
  }
  const renkler = r.canlan.renkler ?? {};
  for (const c of r.cizgiler) {
    s.append(
      el('path', {
        d: yolD(c.n),
        fill: 'none',
        stroke: tur === 'sus' ? renkler[c.parca] ?? '#5a3617' : renkler[c.parca] ?? o.renk ?? r.renk,
        'stroke-width': o.kalinlik ?? 0.035,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }),
    );
  }
  if (tur === 'sus' && g) {
    const sus = el('g');
    sus.innerHTML = g.sus.map((x) => x.svg).join('');
    s.append(sus);
  }
  return s;
}

export interface Canli {
  el: SVGSVGElement;
  /** Canlanmayı başlat (önce çizgiler parlayarak yeniden çizilir). */
  baslat(): void;
  durdur(): void;
  /** Eksik parçaları çocuğun çiziminin üstünde kesik çizgiyle göster. */
  hayalet(parcalar: string[] | 'hepsi'): void;
  /** Bir parçanın boyasını koy (resim adresi, çizim koordinatında 1x1). null: kaldır. */
  boyaKoy(parca: string, url: string | null): void;
  /** Süsleri (yüz, parlama, pencere…) sırayla belirt. */
  susGoster(): void;
  /** Ekran noktasını çizim koordinatına çevirir. */
  noktaAl(x: number, y: number): Nokta;
}

const ters = (p: Nokta, d: Donusum): Nokta => [(p[0] - d.tx) / d.s, (p[1] - d.ty) / d.s];
const yumusakBasla = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const TUR = Math.PI * 2;

export function canliCizim(r: Resim, parcalar: Parcali[], donusum: Donusum, o: { kalinlik: number; renk: string }): Canli {
  const svg = el('svg', { viewBox: '0 0 1 1', class: 'cc-canli', 'aria-hidden': 'true' });
  const tum = el('g', { class: 'cc-tum' });
  const ic = el('g');
  tum.append(ic);
  svg.append(tum);
  const k = donusum.s;
  const P = (p: Nokta) => ters(p, donusum);

  // parça grupları (şablondaki sırayla)
  const adlar = [...new Set([...r.cizgiler.map((c) => c.parca), ...parcalar.map((p) => p.parca)])];
  const gruplar = new Map<string, { g: SVGGElement; boya: SVGGElement; sus: SVGGElement; yollar: { n: Nokta[]; p: SVGPathElement[] }[] }>();
  for (const ad of adlar) {
    const g = el('g', { 'data-parca': ad });
    const boya = el('g', { class: 'cc-boya-katman' });
    const sus = el('g', { class: 'cc-sus-katman' });
    g.append(boya, sus);
    ic.append(g);
    gruplar.set(ad, { g, boya, sus, yollar: [] });
  }
  const tumNoktalar: Nokta[] = [];
  for (const p of parcalar) {
    const grup = gruplar.get(p.parca)!;
    const renk = r.canlan.renkler?.[p.parca] ?? o.renk;
    const d = yolD(p.n);
    const alt = el('path', { d, class: 'cc-alt', 'stroke-width': o.kalinlik * 1.9 });
    const ust = el('path', { d, class: 'cc-cizgi', stroke: renk, 'stroke-width': o.kalinlik, pathLength: 1 });
    grup.g.insertBefore(alt, grup.sus);
    grup.g.insertBefore(ust, grup.sus);
    grup.yollar.push({ n: p.n, p: [alt, ust] });
    tumNoktalar.push(...p.n);
  }
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of tumNoktalar) {
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  }
  const merkez: Nokta = [(x0 + x1) / 2, (y0 + y1) / 2];

  function donusumYaz(h: Hareket, t: number, e: number): string {
    switch (h.tip) {
      case 'don': {
        const [px, py] = P(h.pivot);
        return `rotate(${(e * h.aci * Math.sin(TUR * (h.hiz * t + (h.faz ?? 0)))).toFixed(3)} ${px} ${py})`;
      }
      case 'cevir': {
        const [px, py] = P(h.pivot);
        return `rotate(${(e * 360 * h.hiz * t) % 360} ${px} ${py})`;
      }
      case 'olcek': {
        const [px, py] = P(h.pivot);
        const u = (e * (Math.sin(TUR * (h.hiz * t + (h.faz ?? 0))) + 1)) / 2;
        const sx = 1 + (h.x - 1) * u;
        const sy = 1 + (h.y - 1) * u;
        return `translate(${px} ${py}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(${-px} ${-py})`;
      }
      case 'zipla': {
        const faz = (h.hiz * t) % 1;
        const yuk = Math.sin(Math.PI * faz);
        const zemin = P([0.5, h.zemin])[1];
        // yere değerken ezilip genişler
        const ez = e * Math.max(0, 0.18 - yuk) / 0.18;
        const sx = 1 + 0.14 * ez;
        const sy = 1 - 0.16 * ez;
        return `translate(0 ${(-e * (h.yukseklik / k) * yuk).toFixed(4)}) translate(${merkez[0]} ${zemin}) scale(${sx} ${sy}) translate(${-merkez[0]} ${-zemin})`;
      }
      case 'kaydir': {
        const v = e * Math.sin(TUR * (h.hiz * t + (h.faz ?? 0)));
        return `translate(${((h.dx / k) * v).toFixed(4)} ${((h.dy / k) * v).toFixed(4)})`;
      }
      default:
        return '';
    }
  }

  function dalgala(h: Extract<Hareket, { tip: 'dalga' }>, t: number, e: number) {
    return (p: Nokta): Nokta => {
      const g = (e * h.genlik) / k;
      const b = h.boy / k;
      if (h.eksen === 'x') return [p[0], p[1] + g * Math.sin(TUR * ((p[0] - x0) / b - h.hiz * t))];
      return [p[0] + g * Math.sin(TUR * ((p[1] - y0) / b - h.hiz * t)), p[1]];
    };
  }

  function yolDonusumu(t: number, e: number): string {
    switch (r.canlan.yol) {
      case 'yuz': {
        const w = TUR * 0.09;
        const x = (0.14 / k) * Math.sin(w * t) * e;
        const yon = Math.max(-1, Math.min(1, Math.cos(w * t) * 5));
        const y = 0.02 * Math.sin(TUR * 0.5 * t) * e;
        const sx = e < 1 ? 1 : yon;
        return `translate(${x} ${y}) translate(${merkez[0]} ${merkez[1]}) scale(${sx.toFixed(3)} 1) translate(${-merkez[0]} ${-merkez[1]})`;
      }
      case 'git': {
        const faz = (t * 0.16 + 0.5) % 1;
        const x = e * ((faz - 0.5) * 2.4);
        return `translate(${x.toFixed(4)} ${(0.008 * Math.sin(TUR * 3 * t)).toFixed(4)})`;
      }
      case 'yuksel': {
        const faz = (t * 0.1 + 0.5) % 1;
        const y = e * -((faz - 0.5) * 2.4);
        return `translate(${(0.03 * Math.sin(TUR * 0.4 * t)).toFixed(4)} ${y.toFixed(4)})`;
      }
      case 'suzul':
        return `translate(0 ${(0.03 * e * Math.sin(TUR * 0.35 * t)).toFixed(4)})`;
      default:
        return '';
    }
  }

  const merkezler = new Map<string, Nokta>();
  function parcaMerkezi(ad: string): Nokta {
    let m = merkezler.get(ad);
    if (!m) {
      const n = gruplar.get(ad)?.yollar.flatMap((y) => y.n) ?? [];
      m = n.length ? [n.reduce((a, p) => a + p[0], 0) / n.length, n.reduce((a, p) => a + p[1], 0) / n.length] : merkez;
      merkezler.set(ad, m);
    }
    return m;
  }
  // şablon → çizim koordinatı
  const matris = `matrix(${1 / k} 0 0 ${1 / k} ${-donusum.tx / k} ${-donusum.ty / k})`;

  let raf = 0;
  let bas = 0;
  const dalgalar = (h: Hareket[] | undefined) => (h ?? []).filter((x): x is Extract<Hareket, { tip: 'dalga' }> => x.tip === 'dalga');
  const tumDalga = dalgalar(r.canlan.tum);

  function kare(zaman: number) {
    const t = (zaman - bas) / 1000;
    // önce 0.9 sn parlayarak çizilir, sonra hareket yavaşça açılır
    const e = yumusakBasla((t - 0.9) / 0.8);
    const tt = Math.max(0, t - 0.9);
    tum.setAttribute('transform', `${yolDonusumu(tt, e)} ${(r.canlan.tum ?? []).map((h) => donusumYaz(h, tt, e)).join(' ')}`);
    for (const [ad, grup] of gruplar) {
      const hareketler = r.canlan.parca?.[ad] ?? [];
      grup.g.setAttribute('transform', hareketler.map((h) => donusumYaz(h, tt, e)).join(' '));
      const d = [...tumDalga, ...dalgalar(hareketler)];
      if (d.length && e > 0) {
        for (const y of grup.yollar) {
          const n = d.reduce((pts, h) => pts.map(dalgala(h, tt, e)), y.n);
          const yol = yolD(n);
          y.p.forEach((p) => p.setAttribute('d', yol));
        }
        // boya ve süsler, parçanın ortasındaki kaymayla birlikte gider
        const m = parcaMerkezi(ad);
        const q = d.reduce((pt, h) => dalgala(h, tt, e)(pt), m);
        const kay = `translate(${(q[0] - m[0]).toFixed(4)} ${(q[1] - m[1]).toFixed(4)})`;
        grup.boya.setAttribute('transform', kay);
        grup.sus.setAttribute('transform', kay);
      }
    }
    raf = requestAnimationFrame(kare);
  }

  return {
    el: svg,
    baslat() {
      cancelAnimationFrame(raf);
      svg.classList.add('canlaniyor');
      bas = performance.now();
      raf = requestAnimationFrame(kare);
    },
    durdur() {
      cancelAnimationFrame(raf);
    },
    boyaKoy(parca, url) {
      const g = gruplar.get(parca);
      if (!g) return;
      g.boya.replaceChildren();
      if (url) g.boya.append(el('image', { href: url, x: 0, y: 0, width: 1, height: 1, preserveAspectRatio: 'none', class: 'cc-boya-resim' }));
    },
    susGoster() {
      const g = SUS[r.id];
      if (!g) return;
      g.sus.forEach((x, i) => {
        const grup = gruplar.get(x.parca);
        if (!grup) return;
        const dis = el('g', { transform: matris });
        const icg = el('g', { class: 'cc-sus', style: `--i:${i}` });
        icg.innerHTML = x.svg;
        dis.append(icg);
        grup.sus.append(dis);
      });
    },
    noktaAl(x, y) {
      const b = svg.getBoundingClientRect();
      return [(x - b.left) / b.width, (y - b.top) / b.height];
    },
    hayalet(liste) {
      svg.querySelector('.cc-hayalet')?.remove();
      const g = el('g', { class: 'cc-hayalet' });
      const secili: SablonCizgi[] = r.cizgiler.filter((c) => liste === 'hepsi' || liste.includes(c.parca));
      for (const c of secili)
        g.append(el('path', { d: yolD(c.n.map(P)), 'stroke-width': Math.max(0.012, o.kalinlik * 0.8), pathLength: 1 }));
      svg.append(g);
    },
  };
}
