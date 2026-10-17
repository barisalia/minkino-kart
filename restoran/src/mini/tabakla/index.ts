/**
 * TABAKLA (servis penceresi) · sunum. ekip/senaryo/RESTORAN.md §8 M14.
 *
 * Büyük boş tabak. Rafta önce tepsideki ürünler (doğranmış kâse, tava), sonra süsler (maydanoz, limon, zeytin, ekmek,
 * açılanlara göre çilek, muz) ve gezdirme şişeleri (zeytinyağı, bal). Her şey serbest:
 *   - Ürün tabağa sürüklenince (ya da dokununca) içindekiler tabağa dökülür; her parça tek tek kaydırılır (hafif
 *     mıknatıs: tabağın içine çekilir; çok dışarı bırakılan süs tabaktan iner).
 *   - Süs bırakılan yere konur (dokununca boş bir yere uçar).
 *   - Şişe tabağın üstünde gezdirilince düz bir çizgi akar (desen değil).
 *   - Yüz yapmak serbest: iki yuvarlak göz + altında bir yay (ya da üç parçalı gülümseme) olunca tabak "canlanır":
 *     gözler kırpışır, ağız kıpırdar, Mino kıkırdar.
 *   - Boş tabakla da servis olur: Mino "Tabak bomboş!", tepsiye yine gider (müşteride "Görünmez yemek!").
 * Ödül: servis zili "ding!", tabakta tek parıltı, tabak tepsiye kayar.
 */
import { konusuyorMu } from '../../../../src/audio/ses';
import { h, TEST_MODU } from '../../../../src/ui/dom';
import metin from '../../../../content/restoran/mini-tabakla.json';
import { MALZEME_ADI, urunId, type Kesim, type Malzeme, type MiniBaglam, type MiniGirdi, type MiniOturum, type MiniOyun, type Urun } from '../arayuz';
import { ezil, hopla, kipirda, parilti, TITRESIM, ucur } from '../dogra/efekt';
import { alet, parcaEl, rafSimge } from '../dogra/gorsel';
import type { Gorunum } from '../dogra/mantik';
import { surukle } from '../dogra/surukle';
import { tavaGorsel, type TavaUrunBilgi } from '../tava';
import { bicimBul, bosMu, GARNITUR, miknatis, tabakOzelligi, yuzBul, type Sise, type TabakOzeti, type TabakParca } from './mantik';
import './tabakla.css';

const M = metin.mino;
const GOR: Record<Kesim, Gorunum> = { butun: 'kirpik', yarim: 'yarim', iri: 'kup', dilim: 'dilim', ince: 'dilim', kup: 'kup', serit: 'serit', cubuk: 'cubuk', kiyim: 'kiyim', pure: 'pure' };
/** Parça boyları (tabak yarıçapı cinsinden) [en, boy] */
const BOY: Record<string, [number, number]> = {
  dilim: [0.27, 0.27],
  yarimdilim: [0.27, 0.15],
  yarim: [0.36, 0.36],
  kup: [0.14, 0.14],
  serit: [0.36, 0.1],
  cubuk: [0.38, 0.1],
  kiyim: [0.24, 0.17],
  pure: [0.62, 0.42],
  kirpik: [0.5, 0.5],
};
const SUS_BOY: Partial<Record<Malzeme, [number, number, Gorunum]>> = {
  zeytin: [0.17, 0.14, 'dilim'],
  limon: [0.27, 0.27, 'dilim'],
  maydanoz: [0.22, 0.16, 'kiyim'],
  ekmek: [0.44, 0.3, 'dilim'],
  cilek: [0.24, 0.24, 'kirpik'],
  muz: [0.2, 0.2, 'dilim'],
};

interface TParca {
  id: number;
  m: Malzeme | 'yemek';
  g: Gorunum | 'ozel';
  u: number;
  v: number;
  w: number;
  h: number;
  /** 'sus' ya da ürün kimliği */
  kaynak: string;
  el: HTMLElement;
  /** çocuk bu parçayı kendisi koydu ya da kaydırdı (yüz ancak bilerek yapılınca sayılır) */
  elle?: boolean;
  /** özel (tava yemeği, bilinmeyen ürün): eleman üretici */
  ozel?: () => HTMLElement;
  /** zincir: soyulmuş gelen (Soy → Doğra) kesitte kabuk halkası yok */
  s?: boolean;
}

export const oyun: MiniOyun = {
  ad: 'tabakla',
  istasyon: 'servis',
  simge: () => {
    const u = alet('tabak');
    return u ? h('img.rs-tb-simge', { src: u, alt: '', draggable: 'false' }) : h('span.rs-tb-simge-yt');
  },
  baslat: (b, g) => tabaklaBaslat(b, g),
};

let sira = 1;

function tabaklaBaslat(b: MiniBaglam, g: MiniGirdi): MiniOturum {
  const olaylar: string[] = [];
  const kok = h('div.rs-tabakla', { 'data-yas': g.yas });
  const olay = (ad: string) => {
    olaylar.push(ad);
    kok.dataset.olay = ad;
  };
  const raf = h('div.rs-tb-raf');
  const tabakResim = alet('tabak');
  const tabak = h('div.rs-tb-tabak', {}, tabakResim ? h('img.rs-tb-tabak-resim', { src: tabakResim, alt: '', draggable: 'false' }) : h('i.rs-tb-tabak-yt'));
  const svgNS = 'http://www.w3.org/2000/svg';
  const cizgi = document.createElementNS(svgNS, 'svg');
  cizgi.setAttribute('class', 'rs-tb-cizgi');
  cizgi.setAttribute('viewBox', '-1 -1 2 2');
  const parcaKat = h('div.rs-tb-parcalar');
  tabak.append(cizgi, parcaKat);
  const eldeKat = h('div.rs-tb-elde-kat');
  kok.append(tabak, raf, eldeKat);
  b.kok.append(kok);

  // ------------------------------------------------------------ durum
  const parcalar: TParca[] = [];
  const kullanilan: string[] = [];
  const urunOz: Urun[] = [];
  const sus: Partial<Record<Malzeme, number>> = {};
  const cizgiler: { sise: Sise; noktalar: [number, number][]; el: SVGPolylineElement }[] = [];
  let bal = 0;
  let yag = 0;
  let yuzVar = false;
  let sonYuz = 0;
  let odulde = false;

  // ------------------------------------------------------------ raf: tepsideki ürünler, süsler, şişeler
  const urunler = g.tepsi.filter((u) => u.tur !== 'tabak');
  const susler = GARNITUR.filter((m) => ['maydanoz', 'limon', 'zeytin', 'ekmek'].includes(m) || g.malzemeler.includes(m));
  const rafEl: HTMLElement[] = [];
  for (const u of urunler) {
    const el = h('button.rs-tb-raf-oge.rs-tb-urun', { type: 'button', 'aria-label': u.tur, 'data-urun': u.id, 'data-tur': u.tur }, h('span.rs-tb-urun-gorsel', {}, u.gorsel()));
    raf.append(el);
    rafEl.push(el);
    surukle(el, kok, {
      basla: (x, y) => {
        if (el.classList.contains('rs-kullanildi')) return false;
        eldeAl(el, x, y);
        el.classList.add('rs-tb-bos');
        b.ses.cal('hop', { guc: 0.4 });
      },
      hareket: (x, y) => eldeTasi(x, y),
      birak: (x, y) => {
        el.classList.remove('rs-tb-bos');
        const t = tabakIci(x, y - 34);
        if (t && Math.hypot(t.u, t.v) < 1.25) {
          eldeBirak();
          urunKoy(u, el, t.u, t.v);
        } else eldeBirak(el);
      },
      dokun: () => {
        eldeBirak();
        if (el.classList.contains('rs-kullanildi')) return;
        urunKoy(u, el, 0, 0.05);
      },
    });
  }
  for (const m of susler) {
    const el = h('button.rs-tb-raf-oge', { type: 'button', 'aria-label': MALZEME_ADI[m], 'data-sus': m }, susSimge(m));
    raf.append(el);
    rafEl.push(el);
    surukle(el, kok, {
      basla: (x, y) => {
        eldeAl(el, x, y);
        adSoyle(m);
        b.ses.cal('hop', { guc: 0.35, perde: 1.2 });
      },
      hareket: (x, y) => eldeTasi(x, y),
      birak: (x, y) => {
        const t = tabakIci(x, y - 34);
        const mk = t ? miknatis(t.u, t.v) : null;
        if (mk) {
          eldeBirak();
          susKoy(m, mk.u, mk.v, null);
        } else eldeBirak(el);
      },
      dokun: () => {
        eldeBirak();
        adSoyle(m);
        const yer = bosYer();
        susKoy(m, yer.u, yer.v, el);
      },
    });
  }
  const siseler: Sise[] = ['zeytinyagi', ...(g.malzemeler.includes('bal') || !g.tarif || g.tarif === 'pankek' ? (['bal'] as Sise[]) : [])];
  for (const s of siseler) {
    const resim = alet(s === 'bal' ? 'bal' : 'zeytinyagi');
    const el = h('button.rs-tb-raf-oge.rs-tb-sise', { type: 'button', 'aria-label': MALZEME_ADI[s], 'data-sise': s }, resim ? h('img.rs-tb-raf-resim', { src: resim, alt: '', draggable: 'false' }) : h(`i.rs-tb-yt.rs-tb-yt-${s}`));
    raf.append(el);
    rafEl.push(el);
    let cizgiNo = -1;
    surukle(el, kok, {
      basla: (x, y) => {
        eldeAl(el, x, y).classList.add('rs-tb-elde-sise');
        adSoyle(s);
        cizgiNo = -1;
      },
      hareket: (x, y) => {
        eldeTasi(x, y);
        const t = tabakIci(x, y - 34 + 30);
        const ic = t && Math.hypot(t.u, t.v) < 0.9;
        elde?.classList.toggle('rs-tb-akiyor', !!ic);
        if (!ic || !t) {
          cizgiNo = -1;
          return;
        }
        if (cizgiNo < 0) cizgiNo = cizgiBasla(s);
        cizgiEkle(cizgiNo, t.u, t.v);
      },
      birak: () => {
        eldeBirak(el);
        yuzDenetle();
        durumGuncelle();
      },
      dokun: () => {
        eldeBirak();
        // dokununca şişe tabağın üstünden bir kez geçer: düz, hafif dalgalı bir çizgi
        adSoyle(s);
        ezil(el, 1.3);
        const n = cizgiBasla(s);
        const v0 = (Math.random() - 0.5) * 0.4;
        for (let i = 0; i <= 12; i++) cizgiEkle(n, -0.6 + i * 0.1, v0 + Math.sin(i * 0.8) * 0.06);
        durumGuncelle();
      },
    });
  }

  let sonAd = 0;
  function adSoyle(m: string) {
    if (performance.now() - sonAd < 1200 || konusuyorMu()) return;
    sonAd = performance.now();
    const s = (M.ad as Record<string, string>)[m];
    if (s) void b.mino.soyle(s);
  }

  // ------------------------------------------------------------ yerleşim
  let cx = 400;
  let cy = 220;
  let R = 130;
  function yerlestir() {
    const W = kok.clientWidth;
    const H = kok.clientHeight;
    if (!W || !H) return;
    const yatay = W >= H;
    kok.dataset.yon = yatay ? 'yatay' : 'dikey';
    const n = raf.childElementCount || 1;
    const solBos = 78;
    const rafEn = W - solBos - 10;
    let s = Math.max(64, Math.min(80, yatay ? H * 0.2 : 74, rafEn / n - 8));
    const sigan = Math.max(1, Math.floor(rafEn / (s + 8)));
    const satir = Math.ceil(n / sigan);
    if (satir > 1) s = Math.max(64, Math.min(s, rafEn / Math.ceil(n / satir) - 8));
    raf.style.cssText = `left:${solBos}px;top:8px;width:${rafEn}px;--s:${s}px`;
    const rafAlt = 8 + satir * (s + 8);
    const yuk = H - rafAlt - 10;
    if (yatay) {
      R = Math.min(yuk * 0.47, W * 0.24);
      cx = W / 2;
      cy = rafAlt + 4 + yuk / 2;
    } else {
      R = Math.min(W * 0.43, yuk * 0.32);
      cx = W / 2;
      cy = rafAlt + 16 + R * 1.05;
    }
    tabak.style.cssText = `left:${cx - R * 1.12}px;top:${cy - R * 1.12}px;width:${R * 2.24}px;height:${R * 2.24}px`;
  }
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => yerlestir()) : null;
  ro?.observe(kok);
  yerlestir();

  /** kap px → tabak koordinatı (yarıçap 1) */
  const tabakIci = (x: number, y: number) => ({ u: (x - cx) / R, v: (y - cy) / R });

  // ------------------------------------------------------------ elde tutulan
  let elde: HTMLElement | null = null;
  function eldeAl(kaynak: HTMLElement, x: number, y: number): HTMLElement {
    const el = h('div.rs-tb-elde', {}, (kaynak.firstElementChild as HTMLElement).cloneNode(true) as HTMLElement);
    el.style.transform = `translate(${x}px,${y - 34}px)`;
    eldeKat.append(el);
    elde = el;
    return el;
  }
  const eldeTasi = (x: number, y: number) => {
    if (elde) elde.style.transform = `translate(${x}px,${y - 34}px)`;
  };
  function eldeBirak(geri?: HTMLElement) {
    const el = elde;
    elde = null;
    if (!el) return;
    if (!geri) return el.remove();
    const r = geri.getBoundingClientRect();
    const kr = kok.getBoundingClientRect();
    const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(el.style.transform);
    void ucur(el, r.left - kr.left + r.width / 2 - (m ? +m[1] : 0), r.top - kr.top + r.height / 2 - (m ? +m[2] : 0), 240, -16).then(() => el.remove());
  }

  // ------------------------------------------------------------ parçalar
  function parcaYap(p: Omit<TParca, 'el' | 'id'>): TParca {
    const el = p.ozel ? h('div.rs-tb-ozel', {}, p.ozel()) : parcaEl(p.m as Malzeme, { id: 0, gorunum: p.g as Gorunum, x: 0, y: 0, w: 0, h: 0 }, !!p.s);
    el.classList.add('rs-tb-parca');
    const t: TParca = { ...p, id: sira++, el };
    parcaKoy(t);
    parcaKat.append(el);
    parcalar.push(t);
    parcaSurukle(t);
    return t;
  }
  function parcaKoy(t: TParca) {
    t.el.style.left = `${50 + t.u * 50}%`;
    t.el.style.top = `${50 + t.v * 50}%`;
    t.el.style.width = `${t.w * 50}%`;
    t.el.style.height = `${t.h * 50}%`;
  }
  /** Bir parça tabakta kaydırılır (hafif mıknatıs); süs çok dışarı bırakılırsa tabaktan iner */
  function parcaSurukle(t: TParca) {
    let dx = 0;
    let dy = 0;
    surukle(t.el, kok, {
      basla: (x, y) => {
        if (odulde) return false;
        dx = cx + t.u * R - x;
        dy = cy + t.v * R - y;
        t.el.classList.add('rs-tutuluyor');
        parcaKat.append(t.el); // en üste
        b.ses.cal('tik', { guc: 0.3, perde: 1.3 });
        b.dokunsal(TITRESIM.hafif);
      },
      hareket: (x, y) => {
        const p = tabakIci(x + dx, y + dy - 10);
        t.u = p.u;
        t.v = p.v;
        parcaKoy(t);
      },
      birak: () => {
        t.el.classList.remove('rs-tutuluyor');
        t.elle = true;
        const mk = miknatis(t.u, t.v);
        if (!mk) {
          if (t.kaynak === 'sus') return parcaKaldir(t);
          const ic = miknatis(t.u, t.v, 0.82, 99)!;
          t.u = ic.u;
          t.v = ic.v;
        } else {
          t.u = mk.u;
          t.v = mk.v;
        }
        parcaKoy(t);
        ezil(t.el, 1);
        b.ses.cal('tik', { guc: 0.4 });
        yuzDenetle();
        durumGuncelle();
      },
      dokun: () => {
        t.el.classList.remove('rs-tutuluyor');
        hopla(t.el, 6, 220);
        b.ses.cal('tik', { guc: 0.3, perde: 1.5 });
      },
    });
  }
  function parcaKaldir(t: TParca) {
    const i = parcalar.indexOf(t);
    if (i >= 0) parcalar.splice(i, 1);
    if (t.kaynak === 'sus' && t.m !== 'yemek') sus[t.m] = Math.max(0, (sus[t.m] ?? 0) - 1);
    b.ses.cal('pof', { guc: 0.4 });
    void ucur(t.el, 0, 30, 200, -10).then(() => t.el.remove());
    yuzDenetle();
    durumGuncelle();
  }

  /** Boş bir yer: tabakta mevcut parçalardan en uzak aday nokta */
  function bosYer(): { u: number; v: number } {
    let en = { u: 0, v: 0, d: -1 };
    for (let i = 0; i < 40; i++) {
      const a = i * 2.39996;
      const r = 0.15 + 0.62 * Math.sqrt(((i % 20) + 0.5) / 20);
      const u = Math.cos(a) * r;
      const v = Math.sin(a) * r;
      const d = parcalar.reduce((m, p) => Math.min(m, Math.hypot(p.u - u, p.v - v) - Math.max(p.w, p.h) * 0.4), 9);
      if (d > en.d) en = { u, v, d };
    }
    return en;
  }

  function susKoy(m: Malzeme, u: number, v: number, kaynakEl: HTMLElement | null) {
    const [w, hh, gor] = SUS_BOY[m] ?? [0.22, 0.22, 'dilim'];
    const t = parcaYap({ m, g: gor, u, v, w, h: hh, kaynak: 'sus', elle: true });
    sus[m] = (sus[m] ?? 0) + 1;
    olay('sus');
    b.ses.cal('tik', { perde: 1.2 });
    b.dokunsal(TITRESIM.hafif);
    if (kaynakEl) {
      // raftan uç
      const kr = kaynakEl.getBoundingClientRect();
      const tr = t.el.getBoundingClientRect();
      try {
        t.el.animate([{ transform: `translate(${kr.left + kr.width / 2 - (tr.left + tr.width / 2)}px,${kr.top + kr.height / 2 - (tr.top + tr.height / 2)}px) scale(0.6)` }, { transform: 'translate(0,-10px) scale(1.1,0.9)', offset: 0.8 }, { transform: 'none' }], {
          duration: TEST_MODU ? 30 : 360,
          easing: 'cubic-bezier(.3,.6,.4,1)',
        });
      } catch {
        /* yok say */
      }
    } else ezil(t.el, 1.3);
    yuzDenetle();
    durumGuncelle();
  }

  function urunKoy(u: Urun, el: HTMLElement, pu: number, pv: number) {
    el.classList.add('rs-kullanildi');
    kullanilan.push(u.id);
    urunOz.push(u);
    olay('urun');
    const kr = el.getBoundingClientRect();
    const ok = kok.getBoundingClientRect();
    const kaynak = { x: kr.left - ok.left + kr.width / 2, y: kr.top - ok.top + kr.height / 2 };
    const yeniler: TParca[] = [];
    const tava = (u as Urun & Partial<TavaUrunBilgi>).tava;
    const merkez = miknatis(pu * 0.6, pv * 0.6) ?? { u: 0, v: 0 };
    if (tava) {
      // tava yemeği tabağa tek bir öbek olarak kayar (pankek: yuvarlak pankek)
      const w = tava.pankek ? 0.75 + 0.45 * tava.pankek.boy : 1.05;
      yeniler.push(parcaYap({ m: 'yemek', g: 'ozel', u: merkez.u * 0.5, v: merkez.v * 0.5, w, h: w, kaynak: u.id, ozel: () => tavaGorsel(tava, false) }));
      b.ses.cal('pof');
    } else if (!u.butun && (u.tur === 'dogranmis' || Object.keys(u.ozellik.malzemeler).length)) {
      // kâsedeki parçalar tabağa dökülür (dokununca ortaya, sürükleyince bırakılan yere)
      let i = 0;
      const toplam = Object.values(u.ozellik.malzemeler).reduce((t, d) => t + Math.min(d!.adet, 7), 0);
      for (const [m, d] of Object.entries(u.ozellik.malzemeler)) {
        const gor = GOR[d!.kesim ?? 'kup'] ?? 'kup';
        const [w, hh] = BOY[gor] ?? [0.2, 0.2];
        const n = gor === 'pure' ? 1 : Math.min(d!.adet, 7);
        for (let k = 0; k < n; k++, i++) {
          const a = i * 2.39996 + Math.random() * 0.3;
          const r = 0.5 * Math.sqrt((i + 0.5) / Math.max(1, toplam));
          const yer = miknatis(merkez.u + Math.cos(a) * r, merkez.v + Math.sin(a) * r)!;
          yeniler.push(parcaYap({ m: m as Malzeme, g: gor, u: yer.u, v: yer.v, w, h: hh, kaynak: u.id, s: !!d!.soyuldu }));
        }
      }
      b.ses.cal('pof', { guc: 0.6 });
    } else {
      yeniler.push(parcaYap({ m: 'yemek', g: 'ozel', u: merkez.u, v: merkez.v, w: 0.9, h: 0.9, kaynak: u.id, ozel: () => u.gorsel() }));
      b.ses.cal('pof');
    }
    b.dokunsal(TITRESIM.kesim);
    // kâseden tabağa kavisle dökülür
    yeniler.forEach((t, i) => {
      const tr = t.el.getBoundingClientRect();
      try {
        t.el.animate(
          [
            { transform: `translate(${kaynak.x + ok.left - (tr.left + tr.width / 2)}px,${kaynak.y + ok.top - (tr.top + tr.height / 2)}px) scale(0.5)` },
            { transform: 'translate(0,-16px) scale(1.08,0.92)', offset: 0.75 },
            { transform: 'none' },
          ],
          { duration: TEST_MODU ? 30 : 420, delay: TEST_MODU ? 0 : i * 30, easing: 'cubic-bezier(.3,.6,.4,1)', fill: 'backwards' },
        );
      } catch {
        /* yok say */
      }
    });
    window.setTimeout(() => ezil(tabak, 0.4), TEST_MODU ? 0 : 420);
    yuzDenetle();
    durumGuncelle();
  }

  // ------------------------------------------------------------ gezdirme (bal, zeytinyağı): düz çizgi
  function cizgiBasla(s: Sise): number {
    const el = document.createElementNS(svgNS, 'polyline');
    el.setAttribute('class', `rs-tb-cizgi-${s}`);
    cizgi.append(el);
    cizgiler.push({ sise: s, noktalar: [], el });
    olay(s);
    return cizgiler.length - 1;
  }
  function cizgiEkle(n: number, u: number, v: number) {
    const c = cizgiler[n];
    const son = c.noktalar[c.noktalar.length - 1];
    if (son) {
      const d = Math.hypot(u - son[0], v - son[1]);
      if (d < 0.035) return;
      if (c.sise === 'bal') bal += d / 2;
      else yag += d / 2;
      if (Math.random() < 0.3) b.ses.cal('siril', { guc: 0.18, perde: 1.5 });
    }
    c.noktalar.push([u, v]);
    c.el.setAttribute('points', c.noktalar.map(([a, z]) => `${a.toFixed(3)},${z.toFixed(3)}`).join(' '));
  }

  // ------------------------------------------------------------ yüz tanıma
  function tabakParcalari(): TabakParca[] {
    return parcalar.map((p) => ({ u: p.u, v: p.v, w: p.w, h: p.h, bicim: p.g === 'ozel' ? 'diger' : bicimBul(p.g, p.m, p.w, p.h) }));
  }
  function yuzDenetle() {
    let y = yuzBul(tabakParcalari());
    // kâseden dökülen parçalar tesadüfen yüz olmasın: en az bir parçası çocuğun eliyle konmuş olmalı
    if (y && ![...y.gozler, ...y.agiz].some((i) => parcalar[i].elle)) y = null;
    const once = yuzVar;
    yuzVar = !!y;
    kok.dataset.yuz = yuzVar ? '1' : '0';
    if (!y || once || performance.now() - sonYuz < 1500) return;
    sonYuz = performance.now();
    olay('yuz');
    // tabak canlanır: gözler kırpışır, ağız kıpırdar
    const goz = y.gozler.map((i) => parcalar[i].el);
    const agiz = y.agiz.map((i) => parcalar[i].el);
    window.setTimeout(
      () => {
        for (const el of goz)
          try {
            el.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0.1)', offset: 0.45 }, { transform: 'scaleY(0.1)', offset: 0.55 }, { transform: 'scaleY(1)' }], { duration: TEST_MODU ? 30 : 260, iterations: 2 });
          } catch {
            /* yok say */
          }
        for (const el of agiz) hopla(el, 5, 300);
        b.ses.cal('ting', { perde: 1.1 });
        b.ses.cal('boing', { guc: 0.4, perde: 1.4 });
        const mx = cx + (parcalar[y.gozler[0]].u + parcalar[y.gozler[1]].u) * 0.5 * R;
        const my = cy + parcalar[y.gozler[0]].v * R;
        parilti(kok, mx, my, 6, R * 0.5);
        void b.mino.tepki('sevin', 1200);
        void b.mino.soyle(M.yuz);
      },
      TEST_MODU ? 0 : 160,
    );
  }

  // ------------------------------------------------------------ doğal son, ipucu
  let hoplandi = false;
  function ozet(): TabakOzeti {
    return {
      urunler: urunOz.map((u) => u.ozellik),
      urunPorsiyon: urunOz.map((u) => u.ozellik.porsiyon),
      yemekParca: parcalar.filter((p) => p.kaynak !== 'sus').reduce((t, p) => t + (p.g === 'ozel' ? 6 : 1), 0),
      sus: { ...sus },
      bal,
      yag,
      yuz: yuzVar,
    };
  }
  function durumGuncelle() {
    const hepsi = urunler.length > 0 && urunler.every((u) => kullanilan.includes(u.id));
    const bitti = (hepsi || !urunler.length) && Object.values(sus).some(Boolean);
    if (bitti && !hoplandi) {
      hoplandi = true;
      b.tepsi.hopla();
      olay('dogalSon');
    }
    kok.dataset.durum = JSON.stringify({ parca: parcalar.length, sus, yuz: yuzVar, bal: +bal.toFixed(2), yag: +yag.toFixed(2), kullanilan: kullanilan.length });
    ipucuGuncelle();
  }
  function ipucuGuncelle() {
    if (odulde) return b.ipucu.hedef(null);
    const bekleyen = rafEl.find((e) => e.classList.contains('rs-tb-urun') && !e.classList.contains('rs-kullanildi'));
    if (bekleyen) return b.ipucu.hedef({ el: () => bekleyen, soz: parcalar.length ? M.ipucu.tepsi : M.ipucu.bos, hareket: 'surukle', nereye: () => tabak });
    if (!parcalar.length) return b.ipucu.hedef({ el: () => rafEl[0] ?? null, soz: M.ipucu.bos, hareket: 'surukle', nereye: () => tabak });
    b.ipucu.hedef({ el: () => b.tepsi.el, soz: M.ipucu.hazir, hareket: 'dokun' });
  }
  durumGuncelle();

  // ------------------------------------------------------------ servis: ding!
  let coz: (u: Urun[]) => void = () => undefined;
  const bitti = new Promise<Urun[]>((r) => (coz = r));
  b.tepsi.dinle(() => {
    if (odulde) return;
    odulde = true;
    b.ipucu.hedef(null);
    const o = ozet();
    const bos = bosMu(o);
    const bekle = (ms: number) => new Promise<void>((r) => window.setTimeout(r, TEST_MODU ? Math.min(ms, 30) : ms));
    void (async () => {
      if (bos) {
        // en komik başarısızlık: boş tabak. Mino tabağa bakar, şaşırır, güler; yine servis edilir
        olay('bosTabak');
        kipirda(tabak, 6, 320);
        b.ses.cal('boing', { perde: 0.8 });
        void b.mino.tepki('sasir', 900);
        await b.mino.soyle(M.bos);
        void b.mino.tepki('sevin', 900);
        await b.mino.soyle(M.gorunmez);
      } else if (o.yuz && !konusuyorMu()) void b.mino.soyle(M.guzel);
      b.ses.cal('zil');
      olay('ding');
      parilti(kok, cx, cy - R * 0.3, 1, 10);
      parilti(kok, cx + R * 0.35, cy - R * 0.45, 5, R * 0.3);
      await bekle(520);
      const snap = parcalar.map((p) => ({ m: p.m, g: p.g, u: p.u, v: p.v, w: p.w, h: p.h, ozel: p.ozel, s: p.s }));
      const cz = cizgiler.map((c) => ({ sise: c.sise, noktalar: c.noktalar.slice() }));
      const urun: Urun = {
        id: urunId('tabak'),
        tur: 'tabak',
        yemek: urunOz.find((u) => u.yemek)?.yemek ?? (bos ? undefined : g.tarif),
        ozellik: tabakOzelligi(o),
        servis: true,
        kullanilan: kullanilan.slice(),
        gorsel: () => tabakGorsel(snap, cz),
      };
      const tr = b.tepsi.el.getBoundingClientRect();
      const kr = kok.getBoundingClientRect();
      await ucur(tabak, tr.left - kr.left + tr.width / 2 - cx, tr.top - kr.top + tr.height / 2 - cy, 380, -30);
      coz([urun]);
    })();
  });

  (window as unknown as { __rsTabakla?: unknown }).__rsTabakla = { olaylar, durum: () => ({ ...ozet(), parcalar: parcalar.map((p) => ({ m: p.m, g: p.g, u: +p.u.toFixed(2), v: +p.v.toFixed(2) })) }), merkez: () => ({ cx, cy, R }) };

  return {
    bitti,
    kapat() {
      ro?.disconnect();
      kok.remove();
    },
  };
}

/** Raftaki süs simgesi */
function susSimge(m: Malzeme): HTMLElement {
  const u = alet(`sus-${m}`);
  if (u) return h('img.rs-tb-raf-resim', { src: u, alt: '', draggable: 'false' });
  if (m === 'cilek' || m === 'muz') return rafSimge(m);
  const [w, hh, gor] = SUS_BOY[m] ?? [0.22, 0.22, 'dilim'];
  const kap = h('span.rs-tb-sus-simge');
  const p = parcaEl(m, { id: 0, gorunum: gor, x: 0, y: 0, w: 0, h: 0 });
  p.style.width = `${Math.min(90, (w / Math.max(w, hh)) * 80)}%`;
  p.style.height = `${Math.min(90, (hh / Math.max(w, hh)) * 80)}%`;
  kap.append(p);
  return kap;
}

/** Tabağın küçük hâli (tepside, masada, "günün tabağı"): parçalar yüzde konumlu; kutusunu doldurur */
export function tabakGorsel(ps: { m: Malzeme | 'yemek'; g: Gorunum | 'ozel'; u: number; v: number; w: number; h: number; ozel?: () => HTMLElement; s?: boolean }[], cz: { sise: Sise; noktalar: [number, number][] }[]): HTMLElement {
  const el = h('div.rs-tb-mini');
  const tabakResim = alet('tabak');
  el.append(tabakResim ? h('img.rs-tb-tabak-resim', { src: tabakResim, alt: '', draggable: 'false' }) : h('i.rs-tb-tabak-yt'));
  const ic = h('div.rs-tb-mini-ic');
  if (cz.length) {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('class', 'rs-tb-cizgi');
    s.setAttribute('viewBox', '-1 -1 2 2');
    for (const c of cz) {
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      p.setAttribute('class', `rs-tb-cizgi-${c.sise}`);
      p.setAttribute('points', c.noktalar.map(([a, b]) => `${a},${b}`).join(' '));
      s.append(p);
    }
    ic.append(s);
  }
  for (const p of ps) {
    const pe = p.ozel ? h('div.rs-tb-ozel', {}, p.ozel()) : parcaEl(p.m as Malzeme, { id: 0, gorunum: p.g as Gorunum, x: 0, y: 0, w: 0, h: 0 }, !!p.s);
    pe.classList.add('rs-tb-parca');
    pe.style.left = `${50 + p.u * 50}%`;
    pe.style.top = `${50 + p.v * 50}%`;
    pe.style.width = `${p.w * 50}%`;
    pe.style.height = `${p.h * 50}%`;
    ic.append(pe);
  }
  el.append(ic);
  return el;
}
