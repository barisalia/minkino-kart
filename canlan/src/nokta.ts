/**
 * Noktaları birleştir (4 yaş): gerçek bir nokta birleştirme oyunu.
 * - Numaralı noktalar çizgi çizgi gelir; sıradaki nokta parlar, parmak ipucu yolu gösterir.
 * - Çocuk parmağını sürükler; sıradaki noktaya varınca çizgi "yapışır", nota çalar ve sayı söylenir (Bir, İki…).
 * - Çizgi, çocuğun el hareketiyle şablonun karışımıdır: onun çizgisi ama düzgün.
 * - Parmak kalkarsa yarım kalan parça geri çekilir, kaldığı noktadan devam edilir.
 */
import { efekt, konus } from '../../src/audio/ses';
import { svg as ikon } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import type { Cizgi, Tuval } from '../../sanatci/src/tuval';
import { yolD } from './canlandir';
import { noktaDizisi, ornekle, uzunluk } from './puan';
import type { Nokta, Resim } from './resimler';

const NS = 'http://www.w3.org/2000/svg';
const sv = <K extends keyof SVGElementTagNameMap>(ad: K, a: Record<string, string | number> = {}) => {
  const e = document.createElementNS(NS, ad);
  for (const [k, v] of Object.entries(a)) e.setAttribute(k, String(v));
  return e;
};
const SAYILAR = ['Bir', 'İki', 'Üç', 'Dört', 'Beş', 'Altı', 'Yedi', 'Sekiz', 'Dokuz', 'On'];
/** Noktaya "vardı" sayılma yarıçapı ve başlarken noktaya dokunma yarıçapı */
const VARIS = 0.06;
const DOKUNMA = 0.085;

interface Seritler {
  noktalar: Nokta[];
  /** yoğun şablon yolu ve her noktanın bu yoldaki yeri */
  yol: Nokta[];
  yer: number[];
  kapali: boolean;
}

function hazirla(r: Resim): Seritler[] {
  return r.cizgiler.map((c) => {
    const noktalar = noktaDizisi(c);
    const yol = ornekle(c.n, 0.004);
    const yer: number[] = [];
    let bas = 0;
    for (const p of noktalar) {
      let en = bas;
      let enU = Infinity;
      for (let i = bas; i < yol.length; i++) {
        const u = Math.hypot(yol[i][0] - p[0], yol[i][1] - p[1]);
        if (u < enU) {
          enU = u;
          en = i;
        }
      }
      yer.push(en);
      bas = en;
    }
    return { noktalar, yol, yer, kapali: !!c.kapali && noktalar.length > 2 };
  });
}

/** Şablon parçası ile çocuğun yolunu karıştırır (%60 şablon): hem düzgün hem onun çizgisi. */
function karistir(sablon: Nokta[], cocuk: Nokta[]): Nokta[] {
  const L = Math.max(0.01, uzunluk(sablon));
  const m = Math.max(6, Math.round(L / 0.008));
  const es = (n: Nokta[]) => {
    const u = uzunluk(n);
    if (n.length < 2 || u === 0) return Array.from({ length: m + 1 }, () => n[0]);
    const o = ornekle(n, u / m);
    while (o.length < m + 1) o.push(n[n.length - 1]);
    return o.slice(0, m + 1);
  };
  const a = es(sablon);
  const b = es(cocuk.length > 1 ? cocuk : sablon);
  return a.map((p, i): Nokta => (i === 0 || i === m ? p : [p[0] * 0.6 + b[i][0] * 0.4, p[1] * 0.6 + b[i][1] * 0.4]));
}

/** Parmak ipucu: bir el simgesi verilen yol boyunca kayar (yol tek noktaysa oraya dokunur). */
export function parmakIpucu(kagit: HTMLElement, kilavuz?: SVGPathElement) {
  const el = document.createElement('div');
  el.className = 'cc-el';
  el.append(ikon(IKON.el));
  el.hidden = true;
  kagit.append(el);
  let raf = 0;
  return {
    goster(yol: Nokta[]) {
      cancelAnimationFrame(raf);
      if (!yol.length) return;
      if (kilavuz && yol.length > 2) kilavuz.setAttribute('d', yolD(yol));
      el.hidden = false;
      const t0 = performance.now();
      const adim = (t: number) => {
        const u = (Math.max(0, t - t0) / 1700) % 1.5;
        const k = Math.min(1, u);
        const p = yol[Math.min(yol.length - 1, Math.floor(k * (yol.length - 1)))];
        el.style.left = `${p[0] * 100}%`;
        el.style.top = `${p[1] * 100}%`;
        el.classList.toggle('basiyor', yol.length > 2 ? u < 1 : u % 0.75 < 0.35);
        raf = requestAnimationFrame(adim);
      };
      raf = requestAnimationFrame(adim);
    },
    gizle() {
      cancelAnimationFrame(raf);
      el.hidden = true;
      kilavuz?.setAttribute('d', '');
    },
  };
}

export interface NoktaOyunu {
  geriAl(): void;
  temizle(): void;
  kapat(): void;
  /** Yanlış başlangıç sayısı */
  readonly hata: number;
}

export function noktaOyunu(o: { r: Resim; kagit: HTMLElement; ust: SVGSVGElement; tuval: Tuval; bitti: (hata: number) => void }): NoktaOyunu {
  const { r, kagit, ust, tuval } = o;
  const seritler = hazirla(r);
  tuval.el.style.pointerEvents = 'none';
  const katman = sv('g', { class: 'cc-noktalar' });
  const canli = sv('path', { class: 'cc-nokta-canli', fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const kilavuz = sv('path', { class: 'cc-nokta-kilavuz' });
  ust.append(kilavuz, canli, katman);
  const ipucu = parmakIpucu(kagit, kilavuz);
  const adimlar = document.createElement('div');
  adimlar.className = 'cc-adimlar';
  kagit.append(adimlar);

  let s = 0; // hangi çizgi
  let hedef = 0; // sıradaki nokta (0: başlangıç noktasına dokunulmalı)
  let toplam: Nokta[] = []; // bu çizginin yapışmış kısmı
  let yolParca: Nokta[] = []; // son noktadan beri parmağın izi
  let ciziyor = false;
  let bitenler: Cizgi[] = [];
  let hata = 0;
  let kapandi = false;
  let bosta: number | undefined;

  const sayiHedef = () => {
    const sr = seritler[s];
    return sr.kapali && hedef === sr.noktalar.length ? 0 : hedef;
  };
  const bittiMi = () => {
    const sr = seritler[s];
    return hedef >= sr.noktalar.length + (sr.kapali ? 1 : 0);
  };

  function adimlariCiz() {
    adimlar.replaceChildren(
      ...seritler.map((_, i) => {
        const d = document.createElement('i');
        if (i < s) d.className = 'bitti';
        else if (i === s) d.className = 'simdi';
        return d;
      }),
    );
  }

  function ciz() {
    katman.replaceChildren();
    const sr = seritler[s];
    if (!sr) return;
    const tek = sr.noktalar.length === 1;
    const siradaki = hedef === 0 ? 0 : bittiMi() ? -1 : sayiHedef();
    sr.noktalar.forEach(([x, y], i) => {
      const vardi = hedef > 0 && i < hedef && !(sr.kapali && i === 0 && hedef === sr.noktalar.length);
      const sinif = ['cc-nokta', vardi ? 'yandi' : '', i === siradaki ? 'siradaki' : '', i === 0 ? 'ilk' : '', tek ? 'tek' : ''].filter(Boolean).join(' ');
      const g = sv('g', { class: sinif, transform: `translate(${x} ${y})`, 'data-i': i });
      if (i === siradaki) g.append(sv('circle', { r: 0.05, class: 'cc-nokta-halka' }));
      g.append(sv('circle', { r: tek ? 0.034 : 0.032, class: 'cc-nokta-daire' }));
      const t = sv('text', { y: 0.012 });
      t.textContent = tek ? '★' : String(i + 1);
      g.append(t);
      katman.append(g);
    });
    canli.setAttribute('d', toplam.length ? yolD([...toplam, ...yolParca.slice(1)]) : '');
    canli.setAttribute('stroke', tuval.renk);
    canli.setAttribute('stroke-width', String(tuval.kalinlik));
    adimlariCiz();
  }

  // --- ipucu: bir süre bir şey olmazsa parmak yolu gösterir
  const ipucuGizle = () => ipucu.gizle();
  function bostaKur() {
    clearTimeout(bosta);
    ipucuGizle();
    bosta = window.setTimeout(ipucuGoster, 3200);
  }
  function ipucuGoster() {
    if (kapandi || ciziyor) return;
    const sr = seritler[s];
    if (!sr) return;
    if (hedef === 0 || sr.noktalar.length === 1) return ipucu.goster([sr.noktalar[0]]);
    const bas = hedef - 1;
    const son = sayiHedef();
    ipucu.goster(son === 0 ? sr.yol.slice(sr.yer[bas]) : sr.yol.slice(sr.yer[bas], sr.yer[son] + 1));
  }

  function konum(e: PointerEvent): Nokta {
    const b = tuval.el.getBoundingClientRect();
    return [(e.clientX - b.left) / b.width, (e.clientY - b.top) / b.height];
  }
  const yakin = (a: Nokta, b: Nokta, r: number) => Math.hypot(a[0] - b[0], a[1] - b[1]) < r;

  function salla(i: number) {
    const g = katman.querySelector<SVGGElement>(`[data-i="${i}"]`);
    g?.classList.remove('salla');
    void g?.getBoundingClientRect();
    g?.classList.add('salla');
  }

  function soyle(i: number) {
    efekt.nota(i);
    if (i < SAYILAR.length) void konus(`${SAYILAR[i]}!`);
  }

  function cizgiBitti(n: Nokta[]) {
    bitenler.push({ renk: tuval.renk, kalinlik: tuval.kalinlik, silgi: false, noktalar: n });
    tuval.yukle(bitenler);
    toplam = [];
    yolParca = [];
    ciziyor = false;
    s++;
    hedef = 0;
    efekt.eslesti();
    kagit.classList.remove('parla');
    void kagit.offsetWidth;
    kagit.classList.add('parla');
    ciz();
    if (s >= seritler.length) {
      clearTimeout(bosta);
      setTimeout(() => !kapandi && o.bitti(hata), 700);
    } else bostaKur();
  }

  function bas(e: PointerEvent) {
    if (kapandi || s >= seritler.length) return;
    e.preventDefault();
    bostaKur();
    const p = konum(e);
    const sr = seritler[s];
    if (sr.noktalar.length === 1) {
      // tek nokta (göz gibi): dokununca küçük şekil kendiliğinden çizilir
      if (yakin(p, sr.noktalar[0], DOKUNMA)) {
        soyle(0);
        cizgiBitti(ornekle(r.cizgiler[s].n, 0.006));
      } else {
        hata++;
        salla(0);
      }
      return;
    }
    const baslangic = hedef === 0 ? sr.noktalar[0] : (toplam[toplam.length - 1] ?? sr.noktalar[0]);
    if (!yakin(p, baslangic, DOKUNMA)) {
      hata++;
      salla(hedef === 0 ? 0 : hedef - 1);
      efekt.dokunma();
      return;
    }
    kagit.setPointerCapture?.(e.pointerId);
    ciziyor = true;
    if (hedef === 0) {
      hedef = 1;
      toplam = [sr.noktalar[0]];
      soyle(0);
    }
    yolParca = [toplam[toplam.length - 1]];
    ciz();
  }

  function surukle(e: PointerEvent) {
    if (!ciziyor) return;
    const sr = seritler[s];
    const olaylar = e.getCoalescedEvents?.() ?? [e];
    for (const ev of olaylar) {
      const p = konum(ev);
      yolParca.push(p);
      const i = sayiHedef();
      if (!yakin(p, sr.noktalar[i], VARIS)) continue;
      // vardı: şablon parçası + çocuğun izi → yapıştır
      const bas = hedef - 1;
      const parca = i === 0 ? sr.yol.slice(sr.yer[bas]) : sr.yol.slice(sr.yer[bas], sr.yer[i] + 1);
      toplam.push(...karistir(parca, yolParca).slice(1));
      yolParca = [toplam[toplam.length - 1]];
      if (i === 0) efekt.nota(sr.noktalar.length);
      else soyle(hedef);
      hedef++;
      if (bittiMi()) {
        cizgiBitti(toplam);
        return;
      }
    }
    ciz();
  }

  function birak() {
    if (!ciziyor) return;
    ciziyor = false;
    // yarım kalan kısım geri çekilir
    yolParca = [];
    ciz();
    bostaKur();
  }

  kagit.addEventListener('pointerdown', bas);
  kagit.addEventListener('pointermove', surukle);
  kagit.addEventListener('pointerup', birak);
  kagit.addEventListener('pointercancel', birak);
  ciz();
  bostaKur();

  return {
    get hata() {
      return hata;
    },
    geriAl() {
      if (toplam.length > 1 || hedef > 0) {
        hedef = 0;
        toplam = [];
        yolParca = [];
      } else if (bitenler.length) {
        bitenler.pop();
        tuval.yukle(bitenler);
        s = Math.max(0, s - 1);
        hedef = 0;
      }
      ciz();
      bostaKur();
    },
    temizle() {
      bitenler = [];
      tuval.yukle([]);
      s = 0;
      hedef = 0;
      toplam = [];
      yolParca = [];
      ciz();
      bostaKur();
    },
    kapat() {
      kapandi = true;
      clearTimeout(bosta);
      ipucuGizle();
      kagit.removeEventListener('pointerdown', bas);
      kagit.removeEventListener('pointermove', surukle);
      kagit.removeEventListener('pointerup', birak);
      kagit.removeEventListener('pointercancel', birak);
    },
  };
}
