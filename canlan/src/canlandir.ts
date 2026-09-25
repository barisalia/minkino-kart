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
  if (tur === 'sus' && g) {
    const arka = el('g');
    arka.innerHTML = g.sus.filter((x) => x.arka).map((x) => x.svg).join('');
    s.prepend(arka);
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
    sus.innerHTML = g.sus.filter((x) => !x.arka).map((x) => x.svg).join('');
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
  /** Dokunma tepkisi (canlandıktan sonra) */
  dokun(): void;
}

const ters = (p: Nokta, d: Donusum): Nokta => [(p[0] - d.tx) / d.s, (p[1] - d.ty) / d.s];
const yumusakBasla = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const TUR = Math.PI * 2;

/** Rengi Minkino konturuna (koyu kahve) doğru koyulaştırır: çocuğun rengi seçilir ama kitap gibi durur. */
function koyu(hex: string, t = 0.6): string {
  const v = parseInt(hex.replace('#', ''), 16);
  const k = [0x3b, 0x23, 0x14];
  const c = [(v >> 16) & 255, (v >> 8) & 255, v & 255].map((x, i) => Math.round(x * (1 - t) + k[i] * t));
  return `#${c.map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

export function canliCizim(r: Resim, parcalar: Parcali[], donusum: Donusum, o: { kalinlik: number; renk: string }): Canli {
  const svg = el('svg', { viewBox: '0 0 1 1', class: 'cc-canli', 'aria-hidden': 'true' });
  // Katmanlar: tum (yolculuk, şablon birimi) > yer (çizimi sahnede ortalar) > ic (tüm-resim hareketleri, çizim birimi) > parçalar
  const tum = el('g', { class: 'cc-tum' });
  const tepkiG = el('g', { class: 'cc-tepki' });
  const yer = el('g', { class: 'cc-yer' });
  const ic = el('g');
  yer.append(ic);
  tepkiG.append(yer);
  tum.append(tepkiG);
  svg.append(tum);
  const k = donusum.s;
  const P = (p: Nokta) => ters(p, donusum);
  const T = (p: Nokta): Nokta => [p[0] * k + donusum.tx, p[1] * k + donusum.ty];

  // parça grupları (şablondaki sırayla)
  const adlar = [...new Set([...r.cizgiler.map((c) => c.parca), ...parcalar.map((p) => p.parca)])];
  const gruplar = new Map<string, { g: SVGGElement; arka: SVGGElement; boya: SVGGElement; sus: SVGGElement; yollar: { n: Nokta[]; p: SVGPathElement[] }[] }>();
  for (const ad of adlar) {
    const g = el('g', { 'data-parca': ad });
    const arka = el('g', { class: 'cc-sus-katman' });
    const boya = el('g', { class: 'cc-boya-katman' });
    const sus = el('g', { class: 'cc-sus-katman' });
    g.append(arka, boya, sus);
    ic.append(g);
    gruplar.set(ad, { g, arka, boya, sus, yollar: [] });
  }
  // Çizgi: kitaptaki gibi koyu kahve kontur; içi boyanmayan (yalnız çizgi olan) parçalar renkli kalın çizgi
  const kalin = Math.max(0.017, Math.min(0.03, o.kalinlik * k * 0.8));
  const tumNoktalar: Nokta[] = [];
  for (const p of parcalar) {
    const grup = gruplar.get(p.parca)!;
    const cizgiParca = parcaAlanlari(r, p.parca).length === 0;
    const renk = r.canlan.renkler?.[p.parca] ?? o.renk;
    const d = yolD(p.n);
    const W = cizgiParca ? kalin * 1.5 : kalin;
    const yollar: SVGPathElement[] = [el('path', { d, class: 'cc-alt', 'stroke-width': (W + 0.022) / k })];
    yollar.push(el('path', { d, class: 'cc-cizgi', stroke: koyu(renk), 'stroke-width': (cizgiParca ? W + 0.012 : W) / k, pathLength: 1 }));
    if (cizgiParca) yollar.push(el('path', { d, class: 'cc-cizgi cc-renkli', stroke: renk, 'stroke-width': W / k, pathLength: 1 }));
    for (const y of yollar) grup.g.insertBefore(y, grup.sus);
    grup.yollar.push({ n: p.n, p: yollar });
    tumNoktalar.push(...p.n);
  }
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of tumNoktalar) {
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  }
  const merkez: Nokta = [(x0 + x1) / 2, (y0 + y1) / 2];
  // sahnede: şablonun yerine ve büyüklüğüne oturur; zemini olan resim yere basar
  const alt = T([merkez[0], y1])[1];
  const kay = r.canlan.zemin !== undefined ? r.canlan.zemin - alt : 0;
  yer.setAttribute('transform', `translate(0 ${kay.toFixed(4)}) matrix(${k} 0 0 ${k} ${donusum.tx} ${donusum.ty})`);
  const merkezT: Nokta = [T(merkez)[0], T(merkez)[1] + kay];
  // yere basan resimlere yumuşak gölge
  if (['cayir', 'yol', 'kar'].includes(r.sahne) && r.canlan.yol !== 'yuksel' && r.canlan.yol !== 'suzul') {
    const g = (T([x1, y1])[0] - T([x0, y1])[0]) * 0.46;
    tum.prepend(el('ellipse', { cx: merkezT[0], cy: alt + kay + 0.012, rx: Math.max(0.08, g), ry: 0.028, class: 'cc-golge' }));
  }

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
        const x = 0.14 * Math.sin(w * t) * e;
        const yon = Math.max(-1, Math.min(1, Math.cos(w * t) * 5));
        const y = 0.02 * Math.sin(TUR * 0.5 * t) * e;
        const sx = e < 1 ? 1 : yon;
        return `translate(${x} ${y}) translate(${merkezT[0]} ${merkezT[1]}) scale(${sx.toFixed(3)} 1) translate(${-merkezT[0]} ${-merkezT[1]})`;
      }
      case 'git': {
        // soldan gelir, ortada durup zıplar, sağdan çıkar (7 sn)
        const f = (t / 7 + 0.4) % 1;
        const yavas = (u: number) => 1 - (1 - u) ** 3;
        const x = f < 0.3 ? -1.1 * (1 - yavas(f / 0.3)) : f < 0.7 ? 0 : 1.1 * ((f - 0.7) / 0.3) ** 3;
        return `translate(${(e * x).toFixed(4)} ${(0.008 * Math.sin(TUR * 3 * t)).toFixed(4)})`;
      }
      case 'yuksel': {
        // ortada salınır, sonra yükselip gider, alttan geri gelir (9 sn)
        const f = (t / 9) % 1;
        const y = f < 0.65 ? 0 : f < 0.85 ? -1.2 * ((f - 0.65) / 0.2) ** 2 : 1.2 * (1 - (f - 0.85) / 0.15) ** 2;
        return `translate(${(0.03 * Math.sin(TUR * 0.4 * t)).toFixed(4)} ${(e * y + 0.02 * Math.sin(TUR * 0.3 * t)).toFixed(4)})`;
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

  // Dokununca kısa, hafif tepki (0.7 sn)
  let tepkiBas = -1;
  function tepkiDonusumu(zaman: number): string {
    if (tepkiBas < 0) return '';
    const u = (zaman - tepkiBas) / 700;
    if (u >= 1 || u < 0) return '';
    const [mx, my] = merkezT;
    const etrafinda = (d: string) => `translate(${mx} ${my}) ${d} translate(${-mx} ${-my})`;
    switch (r.canlan.tepki ?? 'zipla') {
      case 'atis': {
        const s = 1 + 0.12 * Math.abs(Math.sin(TUR * u)) * (1 - u * 0.5);
        return etrafinda(`scale(${s.toFixed(4)})`);
      }
      case 'salla':
        return etrafinda(`rotate(${(9 * Math.sin(2 * TUR * u) * (1 - u)).toFixed(3)})`);
      case 'don':
        return etrafinda(`rotate(${(360 * (1 - (1 - u) ** 3)).toFixed(2)})`);
      case 'titre':
        return `translate(${(0.018 * Math.sin(5 * TUR * u) * (1 - u)).toFixed(4)} 0)`;
      default: {
        const y = -0.07 * Math.sin(Math.PI * Math.min(1, u * 1.3));
        const ez = u > 0.75 ? Math.sin(Math.PI * ((u - 0.75) / 0.25)) : 0;
        return `translate(0 ${y.toFixed(4)}) ${etrafinda(`scale(${(1 + 0.08 * ez).toFixed(4)} ${(1 - 0.1 * ez).toFixed(4)})`)}`;
      }
    }
  }

  let raf = 0;
  let bas = 0;
  const dalgalar = (h: Hareket[] | undefined) => (h ?? []).filter((x): x is Extract<Hareket, { tip: 'dalga' }> => x.tip === 'dalga');
  const tumDalga = dalgalar(r.canlan.tum);

  function kare(zaman: number) {
    const t = (zaman - bas) / 1000;
    // önce 0.9 sn parlayarak çizilir, sonra hareket yavaşça açılır
    const e = yumusakBasla((t - 0.9) / 0.8);
    const tt = Math.max(0, t - 0.9);
    tum.setAttribute('transform', yolDonusumu(tt, e));
    tepkiG.setAttribute('transform', tepkiDonusumu(zaman));
    ic.setAttribute('transform', (r.canlan.tum ?? []).map((h) => donusumYaz(h, tt, e)).join(' '));
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
        grup.arka.setAttribute('transform', kay);
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
        (x.arka ? grup.arka : grup.sus).append(dis);
      });
    },
    dokun() {
      tepkiBas = performance.now();
    },
    noktaAl(x, y) {
      const m = ic.getScreenCTM();
      if (!m) return [0, 0];
      const q = new DOMPoint(x, y).matrixTransform(m.inverse());
      return [q.x, q.y];
    },
    hayalet(liste) {
      ic.querySelector('.cc-hayalet')?.remove();
      const g = el('g', { class: 'cc-hayalet' });
      const secili: SablonCizgi[] = r.cizgiler.filter((c) => liste === 'hepsi' || liste.includes(c.parca));
      for (const c of secili)
        g.append(el('path', { d: yolD(c.n.map(P)), 'stroke-width': 0.014 / k, pathLength: 1 }));
      ic.append(g);
    },
  };
}
