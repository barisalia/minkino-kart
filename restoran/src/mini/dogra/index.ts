/**
 * DOĞRA (doğrama tahtası) · Tıkır Tıkır Lokanta'nın imza mini oyunu. ekip/senaryo/RESTORAN.md §8 M1, §1d.
 *
 * Rafta 3-8 malzeme: hangisini, kaç tane alacağı çocuğun seçimi (rafa dokununca Mino adını söyler, sebze tahtaya
 * uçar). Parmak tahtada kayınca bıçak parmağın biraz üstünde onu izler; parmağın geçtiği her sebze o yerden kesilir
 * (tek kaydırmada birden çok sebze). Her sebze başka türlü kesilir (kurallar mantik.ts'te). Parçalar tahtada kalır.
 * Komik anlar: domates "şlap" + fışkırma + tahtada leke; soğanın 3. kesiminde Mino ağlar, ekran kenarında su dalgası,
 * Kino kapıdan mendil uzatır (mendile dokununca Mino gürültüyle sümkürür); çok kesersen "Ağlamıyorum!" + hıçkırık;
 * aşırı kesilen domates püre ("vıcık"); boş tahtaya kesim "tok", Mino zıplar. Ödül: tepsiye alınca dilimler tahtada
 * yelpaze olur, "tıkır tıkır" bir ölçü çalar, kâseye kayar, kâse tepsiye.
 * Dokunuş: aynı karede bıçak + ses (+ titreşim). Seri kesimde ses tonu yükselir.
 */
import { konusuyorMu } from '../../../../src/audio/ses';
import { h, TEST_MODU } from '../../../../src/ui/dom';
import metin from '../../../../content/restoran/mini-dogra.json';
import { MALZEME_ADI, urunId, type Malzeme, type MalzemeDurumu, type MiniBaglam, type MiniGirdi, type MiniOturum, type MiniOyun, type Urun } from '../arayuz';
import { ezil, hickir, hopla, kipirda, leke, mirilti, parilti, ritimTing, sac, sumkur, tikirTikir, TITRESIM, ucur } from './efekt';
import { alet, eski, kaseEl, kirpikBoy, konumla, parcaEl, rafSimge, RENK } from './gorsel';
import { bittiMi, dilimSayisi, itis, kes, kesimOzeti, kiy, ortadanGecti, sebzeKoy, seriPerde, seriSay, silkele, soy, tanim, yonBul, type Gorunum, type Parca, type SebzeDurum } from './mantik';
import './dogra.css';

const M = metin.mino;
/** Rafta olabilecekler (kesim kuralı olanlar) */
const KESILIR: Malzeme[] = ['domates', 'salatalik', 'sogan', 'biber', 'maydanoz', 'havuc', 'patates', 'limon', 'marul'];
/** Babaanne'nin mırıltısı: maydanoz ritmi (vuruş arası ms) ve tolerans */
const RITIM_MS = 520;
const RITIM_PAY = 140;
/** soğan: kaçıncı kesimde ağlar, kaçıncıda "Ağlamıyorum!" */
const AGLA_KESIM = 3;
const AGLAMIYORUM_KESIM = 9;
/** kaydırma bu kadar px'i geçmezse dokunuş sayılır */
const DOKUNUS_PX = 14;

interface Tahtada {
  d: SebzeDurum;
  yuva: number;
  els: Map<number, HTMLElement>;
  bittiDendi: boolean;
  sayilan: number;
}

interface KaseKaydi {
  m: Malzeme;
  ozet: MalzemeDurumu;
  g: Gorunum;
  n: number;
}

export const oyun: MiniOyun = {
  ad: 'dogra',
  istasyon: 'tezgah',
  simge: () => {
    const u = alet('bicak');
    return u ? h('img.rs-dg-simge', { src: u, alt: '', draggable: 'false' }) : h('span.rs-dg-simge-yt');
  },
  baslat(b, g) {
    return dograBaslat(b, g);
  },
};

function dograBaslat(b: MiniBaglam, g: MiniGirdi): MiniOturum {
  const yas = g.yas;
  const raftakiler = (g.malzemeler.filter((m) => KESILIR.includes(m)) as Malzeme[]).slice(0, yas === 'kucuk' ? 5 : 8);
  if (!raftakiler.length) raftakiler.push('domates', 'salatalik', 'sogan');
  const kapasite = yas === 'kucuk' ? 2 : 3;
  const olaylar: string[] = [];
  let odulde = false;
  const olay = (ad: string) => {
    olaylar.push(ad);
    kok.dataset.olay = ad;
  };

  // ------------------------------------------------------------ DOM
  const kok = h('div.rs-dogra', { 'data-yas': yas });
  const raf = h('div.rs-dg-raf');
  const tahta = h('div.rs-dg-tahta');
  const lekeKat = h('div.rs-dg-leke-kat');
  const parcaKat = h('div.rs-dg-parcalar');
  tahta.append(lekeKat, parcaKat);
  const kaseKutu = h('button.rs-dg-kase', { type: 'button', 'aria-label': 'Kâse' });
  const bicakUrl = alet('bicak');
  const bicak = h('div.rs-dg-bicak', { 'aria-hidden': 'true' }, bicakUrl ? h('img', { src: bicakUrl, alt: '', draggable: 'false' }) : h('i.rs-dg-bicak-yt'));
  const izSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  izSvg.setAttribute('class', 'rs-dg-iz');
  const izYol = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  izSvg.append(izYol);
  const dalga = h('div.rs-dg-dalga', { 'aria-hidden': 'true' }, h('i'), h('i'));
  const elUrl = alet('kino-el-mendil') ?? null;
  const kinoEl = alet('kino-el') ?? eski('karakter/kino-yeni/el-sag');
  const mendil = h(
    'button.rs-dg-mendil',
    { type: 'button', 'aria-label': 'Mendil' },
    elUrl ? h('img', { src: elUrl, alt: '', draggable: 'false' }) : h('span.rs-dg-mendil-yt', {}, kinoEl ? h('img', { src: kinoEl, alt: '', draggable: 'false' }) : null, h('i')),
  );
  kok.append(raf, tahta, kaseKutu, izSvg, bicak, dalga, mendil);
  if (g.ozelIstek && !Array.isArray(g.ozelIstek.deger)) kok.append(istekKarti(g.ozelIstek.deger as { malzeme: Malzeme; sayi?: number; kesim?: string }));
  b.kok.append(kok);

  // raf
  const rafEl = new Map<Malzeme, HTMLElement>();
  for (const m of raftakiler) {
    const btn = h('button.rs-dg-raf-oge', { type: 'button', 'aria-label': MALZEME_ADI[m], 'data-malzeme': m }, rafSimge(m));
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      rafaDokun(m, btn);
    });
    raf.append(btn);
    rafEl.set(m, btn);
  }

  // ------------------------------------------------------------ yerleşim (telefon önce: yatay ve dikey)
  let bw = 400;
  let bh = 260;
  let yatay = true;
  const tahtadakiler: Tahtada[] = [];
  const kase: KaseKaydi[] = [];

  function yerlestir() {
    const W = kok.clientWidth || b.kok.clientWidth;
    const H = kok.clientHeight || b.kok.clientHeight;
    if (!W || !H) return;
    yatay = W >= H;
    kok.dataset.yon = yatay ? 'yatay' : 'dikey';
    const kr = kok.getBoundingClientRect();
    const tr = b.tepsi.el.getBoundingClientRect();
    const mr = b.mino.el.getBoundingClientRect();
    const n = raftakiler.length;
    // raf: üstte, geri düğmesinin sağından
    const solBos = 78;
    const rafEn = W - solBos - 10;
    let s = Math.max(64, Math.min(84, yatay ? H * 0.2 : 76, rafEn / n - 8));
    let satir = Math.ceil((n * (s + 8)) / rafEn);
    if (satir > 1) s = Math.max(64, Math.min(s, rafEn / Math.ceil(n / satir) - 8));
    satir = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(rafEn / (s + 8)))));
    raf.style.cssText = `left:${solBos}px;top:8px;width:${rafEn}px;--s:${s}px`;
    const rafAlt = 8 + satir * (s + 8);
    // tahta
    let tx: number, ty: number;
    if (yatay) {
      const ust = rafAlt + 4;
      const altBos = 10;
      const yuk = H - ust - altBos;
      bw = Math.min(W * 0.6, yuk * 1.62);
      bh = Math.min(yuk, bw / 1.5);
      tx = (W - bw) / 2;
      // Mino köşesi tahtanın altına girmesin
      const minoSag = mr.width ? mr.right - kr.left : 0;
      if (tx < minoSag + 4 && mr.top - kr.top < ust + bh) tx = Math.min(minoSag + 4, W - bw - 140);
      ty = ust + (yuk - bh) / 2;
      const ks = Math.max(80, Math.min(120, W - (tx + bw) - 24, (tr.top - kr.top) - ty - 20));
      kaseKutu.style.cssText = `left:${tx + bw + (W - tx - bw - ks) / 2}px;top:${Math.max(ty + 8, Math.min(ty + bh * 0.42 - ks / 2, tr.top - kr.top - ks - 14))}px;width:${ks}px;height:${ks}px`;
    } else {
      bw = W - 20;
      bh = Math.min(bw / 1.18, H * 0.42);
      tx = 10;
      // tahta + kâse, raf ile Mino/tepsi şeridi arasında ortalanır
      const ks = 112;
      const altSerit = Math.max(120, H - (tr.top - kr.top) + 10);
      const bosluk = H - rafAlt - altSerit - (bh + 14 + ks);
      ty = rafAlt + 10 + Math.max(0, bosluk / 2);
      kaseKutu.style.cssText = `left:${(W - ks) / 2}px;top:${ty + bh + 14}px;width:${ks}px;height:${ks}px`;
    }
    tahta.style.cssText = `left:${tx}px;top:${ty}px;width:${bw}px;height:${bh}px`;
    for (const t of tahtadakiler) for (const p of t.d.parcalar) {
      const el = t.els.get(p.id);
      if (el) konumla(el, t.d.ad, p, bw, bh, tanim(t.d.ad).en, tanim(t.d.ad).oran);
    }
  }
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => yerlestir()) : null;
  ro?.observe(kok);
  yerlestir();

  // ------------------------------------------------------------ yuvalar
  const yuvalar = (): [number, number][] =>
    kapasite === 2
      ? [
          [0.3, 0.52],
          [0.7, 0.52],
        ]
      : yatay
        ? [
            [0.2, 0.52],
            [0.53, 0.5],
            [0.83, 0.52],
          ]
        : [
            [0.28, 0.3],
            [0.72, 0.3],
            [0.5, 0.74],
          ];

  // ------------------------------------------------------------ çizim
  const soyulduMu = (t: Tahtada) => t.d.ad === 'sogan' && t.d.kabuk === 0;
  function parcaCiz(t: Tahtada, p: Parca): HTMLElement {
    const el = parcaEl(t.d.ad, p, soyulduMu(t));
    el.dataset.sebze = String(t.d.id);
    el.dataset.parca = String(p.id);
    if (p.cekirdek) cekirdekCiz(el, p.cekirdek);
    if (p.centik !== undefined) centikCiz(el, p);
    konumla(el, t.d.ad, p, bw, bh, tanim(t.d.ad).en, tanim(t.d.ad).oran);
    parcaKat.append(el);
    t.els.set(p.id, el);
    return el;
  }
  function cekirdekCiz(el: HTMLElement, n: number) {
    el.querySelectorAll('.rs-p2-cekirdek').forEach((c) => c.remove());
    for (let i = 0; i < n; i++) {
      const c = h('i.rs-p2-cekirdek');
      c.style.left = `${32 + (i % 3) * 13}%`;
      c.style.top = `${30 + Math.floor(i / 3) * 22 + (i % 2) * 6}%`;
      el.append(c);
    }
  }
  function centikCiz(el: HTMLElement, p: Parca) {
    el.querySelector('.rs-dg-centik')?.remove();
    if (p.centik === undefined) return;
    const c = h('i.rs-dg-centik');
    // sert sebzenin kesim ekseni: havuç dik durur (y), patates yatar (x)
    if (tanimEksen(el) === 'y') c.style.cssText = `top:${p.centik * 100}%;left:8%;right:8%;height:3px`;
    else c.style.cssText = `left:${p.centik * 100}%;top:8%;bottom:8%;width:3px`;
    el.append(c);
  }
  const tanimEksen = (el: HTMLElement) => tanim(el.dataset.malzeme as Malzeme).eksen;

  /** Parçanın ekran dikdörtgeni (kok içi px) */
  function parcaRect(t: Tahtada, p: Parca) {
    const tl = parseFloat(tahta.style.left) || 0;
    const tt = parseFloat(tahta.style.top) || 0;
    let w = p.w * bw;
    let hh = p.h * bw;
    if (p.gorunum === 'kirpik') [w, hh] = kirpikBoy(t.d.ad, p, bw, tanim(t.d.ad).en, tanim(t.d.ad).oran);
    // küçük parçalar da parmakla yakalansın (en az 34 px)
    return { x: tl + p.x * bw, y: tt + p.y * bh, w: Math.max(w, 34), h: Math.max(hh, 34) };
  }
  const tahtaNokta = (x: number, y: number) => ({ x: (x - (parseFloat(tahta.style.left) || 0)) / bw, y: (y - (parseFloat(tahta.style.top) || 0)) / bh });

  // ------------------------------------------------------------ raf → tahta
  let sonAdSoz = 0;
  function rafaDokun(m: Malzeme, btn: HTMLElement) {
    if (odulde) return;
    b.dokunsal(TITRESIM.hafif);
    b.ses.cal('hop', { perde: 1.1 });
    ezil(btn, 1.4);
    if (performance.now() - sonAdSoz > 1300 && !konusuyorMu()) {
      sonAdSoz = performance.now();
      const ad = (M.ad as Record<string, string>)[m];
      if (ad) void b.mino.soyle(ad);
    }
    // boş yuva; yoksa en eski sebze kâseye kayar (yer açılır)
    const dolu = new Set(tahtadakiler.map((t) => t.yuva));
    let yuva = yuvalar().findIndex((_, i) => !dolu.has(i));
    if (yuva < 0) {
      const eski = tahtadakiler[0];
      yuva = eski.yuva;
      kaseyeAl(eski);
    }
    const [x, y] = yuvalar()[yuva];
    const d = sebzeKoy(m, x, y, yas);
    const t: Tahtada = { d, yuva, els: new Map(), bittiDendi: false, sayilan: 0 };
    tahtadakiler.push(t);
    const el = parcaCiz(t, d.parcalar[0]);
    // raftan kavisle uç (döndürmeden), ezilerek kon
    const br = btn.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    const dx = br.left + br.width / 2 - (er.left + er.width / 2);
    const dy = br.top + br.height / 2 - (er.top + er.height / 2);
    try {
      el.animate(
        [
          { transform: `translate(${dx}px,${dy}px) scale(0.45)` },
          { transform: `translate(${dx * 0.45}px,${dy * 0.45 - 60}px) scale(0.8,0.86)`, offset: 0.55 },
          { transform: 'translate(0,0) scale(1.1,0.88)', offset: 0.85 },
          { transform: 'translate(0,0) scale(1,1)' },
        ],
        { duration: TEST_MODU ? 40 : 420, easing: 'cubic-bezier(.35,.1,.45,1)' },
      ).finished.then(
        () => b.ses.cal('pof', { guc: 0.5 }),
        () => undefined,
      );
    } catch {
      /* yok say */
    }
    tamamDenetle();
    ipucuGuncelle();
  }

  // ------------------------------------------------------------ tahta → kâse
  function kaseyeAl(t: Tahtada, hizli = false) {
    const i = tahtadakiler.indexOf(t);
    if (i < 0) return;
    tahtadakiler.splice(i, 1);
    const ozet = kesimOzeti(t.d, yas);
    const baskin = baskinGorunum(t.d);
    kase.push({ m: t.d.ad, ozet, g: baskin, n: Math.max(1, Math.min(6, t.d.parcalar.length)) });
    const kr = kaseKutu.getBoundingClientRect();
    let k = 0;
    for (const [, el] of t.els) {
      const r = el.getBoundingClientRect();
      const gecikme = hizli ? 0 : k++ * 18;
      window.setTimeout(
        () => {
          void ucur(el, kr.left + kr.width / 2 - (r.left + r.width / 2), kr.top + kr.height * 0.45 - (r.top + r.height / 2), hizli ? 260 : 380, -40).then(() => el.remove());
        },
        TEST_MODU ? 0 : gecikme,
      );
    }
    window.setTimeout(
      () => {
        kaseCiz();
        ezil(kaseKutu, 1.4);
        b.ses.cal('pof', { guc: 0.6 });
      },
      TEST_MODU ? 10 : 380,
    );
    tamamDenetle();
  }
  function kaseCiz() {
    kaseKutu.replaceChildren(kaseEl(kase.map((x) => ({ m: x.m, g: x.g, n: x.n }))));
    kaseKutu.dataset.dolu = String(kase.length);
  }
  kaseCiz();
  kaseKutu.addEventListener('click', () => {
    // kâseye dokununca işi biten sebzeler kâseye kayar (tahtada yer açılır)
    if (odulde) return;
    const biten = tahtadakiler.filter((t) => bittiMi(t.d, yas) || t.d.kesim > 0);
    if (!biten.length) {
      kipirda(kaseKutu);
      return;
    }
    biten.forEach((t) => kaseyeAl(t));
    ipucuGuncelle();
  });

  // ------------------------------------------------------------ bıçak ve kaydırma
  let iz: { x: number; y: number; t: number }[] = [];
  let kayma: { id: number; x0: number; y0: number; x: number; y: number; yol: number; kesti: Set<number>; soyulan: Tahtada | null; t0: number; kesimVar: boolean } | null = null;
  let seri = 0;
  let sonKesim = 0;
  let sonTok = 0;
  let izSon = 0;

  function bicakGoster(x: number, y: number) {
    // bıçak parmağın biraz üstünde (parmak aracı örtmez)
    bicak.style.transform = `translate(${x}px,${y - 34}px)`;
    bicak.classList.add('rs-gorunur');
  }
  function izCiz() {
    const simdi = performance.now();
    iz = iz.filter((p) => simdi - p.t < 160);
    izYol.setAttribute('points', iz.map((p) => `${p.x},${p.y}`).join(' '));
  }

  kok.addEventListener('pointerdown', (e) => {
    if (odulde) return;
    const hedef = e.target as HTMLElement;
    if (hedef.closest('.rs-dg-raf, .rs-dg-kase, .rs-dg-mendil, button')) return;
    const kr = kok.getBoundingClientRect();
    const x = e.clientX - kr.left;
    const y = e.clientY - kr.top;
    // tahtanın çok dışındaysa kaydırma başlamaz
    const tl = parseFloat(tahta.style.left) || 0;
    const tt = parseFloat(tahta.style.top) || 0;
    if (x < tl - 40 || x > tl + bw + 40 || y < tt - 40 || y > tt + bh + 40) return;
    e.preventDefault();
    try {
      kok.setPointerCapture(e.pointerId);
    } catch {
      /* yok say */
    }
    kayma = { id: e.pointerId, x0: x, y0: y, x, y, yol: 0, kesti: new Set(), soyulan: null, t0: performance.now(), kesimVar: false };
    iz = [{ x, y, t: performance.now() }];
    izSvg.classList.add('rs-gorunur');
    izCiz();
    // aynı karede: bıçak görünür
    bicakGoster(x, y);
    // soğanın kuru kabuğuna basıldıysa: kabuğu çekip soyma (bıçak çekilir)
    const alt = altindaki(x, y);
    if (alt && alt.t.d.ad === 'sogan' && alt.t.d.kabuk > 0) {
      kayma.soyulan = alt.t;
      bicak.classList.remove('rs-gorunur');
      kok.classList.add('rs-dg-tutuyor');
      kipirda(alt.el, 3, 180);
      b.ses.cal('citir', { guc: 0.35 });
      return;
    }
    // maydanoz: dokunuş bir vuruş (ritim)
    if (alt && tanim(alt.t.d.ad).bicim === 'demet') {
      vurus(alt.t, x, y);
      kayma.kesti.add(-alt.t.d.id);
      kayma.kesimVar = true;
    }
  });

  kok.addEventListener('pointermove', (e) => {
    if (!kayma || e.pointerId !== kayma.id) return;
    const kr = kok.getBoundingClientRect();
    const olaylar2 = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : [];
    const noktalar = olaylar2.length ? olaylar2 : [e];
    for (const pe of noktalar) {
      const x = pe.clientX - kr.left;
      const y = pe.clientY - kr.top;
      const ax = kayma.x;
      const ay = kayma.y;
      kayma.yol += Math.hypot(x - ax, y - ay);
      kayma.x = x;
      kayma.y = y;
      if (kayma.soyulan) {
        // soğandan başlayan kaydırma başka bir sebzeyi keserse soyma değil kesimdir (kesim yutulmasın)
        const soyulan = kayma.soyulan;
        kesimleriBul(ax, ay, x, y, soyulan);
        if (!kayma) break;
        if (kayma.kesimVar) {
          kayma.soyulan = null;
          kok.classList.remove('rs-dg-tutuyor');
          continue;
        }
        soymaDene(soyulan, x, y);
        continue;
      }
      kesimleriBul(ax, ay, x, y);
    }
    bicakGoster(kayma.x, kayma.y);
    if (performance.now() - izSon > 12) {
      izSon = performance.now();
      iz.push({ x: kayma.x, y: kayma.y, t: performance.now() });
      izCiz();
    }
  });

  const birak = (e: PointerEvent) => {
    if (!kayma || e.pointerId !== kayma.id) return;
    const k = kayma;
    kayma = null;
    kok.classList.remove('rs-dg-tutuyor');
    bicak.classList.remove('rs-gorunur');
    window.setTimeout(() => {
      iz = [];
      izCiz();
      izSvg.classList.remove('rs-gorunur');
    }, 90);
    if (k.soyulan || k.kesimVar) return;
    const alt = altindaki(k.x0, k.y0);
    if (k.yol < DOKUNUS_PX) {
      // dokunuş: biber yarımı silkelenir; öbür sebze kıpırdar; boş tahta "tok"
      if (alt) {
        if (alt.p.cekirdek) silkeleYap(alt.t, alt.p, alt.el);
        else {
          kipirda(alt.el, 4);
          b.ses.cal('tok', { guc: 0.45, perde: 1.15 });
        }
      } else bosTahta(k.x0, k.y0);
      return;
    }
    // hiçbir şeye değmeyen kaydırma: boş tahtaya kesim
    if (k.yol > 50) bosTahta(k.x, k.y);
  };
  kok.addEventListener('pointerup', birak);
  kok.addEventListener('pointercancel', birak);

  function bosTahta(x: number, y: number) {
    b.ses.cal('tok');
    b.dokunsal(TITRESIM.hafif);
    const n = tahtaNokta(x, y);
    sac(tahta, n.x * bw, n.y * bh, 'kabuk', '#D9B27A', 2, { boy: 6, guc: 0.4 });
    if (performance.now() - sonTok > 2200) {
      sonTok = performance.now();
      void b.mino.tepki('zipla', 600);
      olay('tok');
    }
  }

  /** Noktanın altındaki en üstteki parça */
  function altindaki(x: number, y: number): { t: Tahtada; p: Parca; el: HTMLElement } | null {
    for (let i = tahtadakiler.length - 1; i >= 0; i--) {
      const t = tahtadakiler[i];
      for (let j = t.d.parcalar.length - 1; j >= 0; j--) {
        const p = t.d.parcalar[j];
        const r = parcaRect(t, p);
        if (Math.abs(x - r.x) <= r.w / 2 + 4 && Math.abs(y - r.y) <= r.h / 2 + 4) {
          const el = t.els.get(p.id);
          if (el) return { t, p, el };
        }
      }
    }
    return null;
  }

  function kesimleriBul(ax: number, ay: number, x: number, y: number, haric?: Tahtada) {
    if (!kayma) return;
    const yon = yonBul(x - kayma.x0 || x - ax, y - kayma.y0 || y - ay);
    for (const t of tahtadakiler.slice()) {
      if (t === haric) continue;
      if (!tahtadakiler.includes(t)) continue;
      // maydanoz: kaydırmada bir kez vurulur
      if (tanim(t.d.ad).bicim === 'demet') {
        if (kayma.kesti.has(-t.d.id)) continue;
        const r = t.d.parcalar.map((p) => parcaRect(t, p));
        const g = r.find((q) => ortadanGecti(ax, ay, x, y, q, 6));
        if (g) {
          kayma.kesti.add(-t.d.id);
          kayma.kesimVar = true;
          vurus(t, x, y);
        }
        continue;
      }
      for (const p of t.d.parcalar.slice()) {
        if (kayma.kesti.has(p.id)) continue;
        const r = parcaRect(t, p);
        const g = ortadanGecti(ax, ay, x, y, r, 6);
        if (!g) continue;
        kayma.kesti.add(p.id);
        kayma.kesimVar = true;
        const once = new Set(t.d.parcalar.map((q) => q.id));
        kesimYap(t, p, yon, g.x, g.y);
        // bu kesimde doğan parçalar aynı kaydırmada yeniden kesilmez
        for (const q of t.d.parcalar) if (!once.has(q.id)) kayma?.kesti.add(q.id);
        if (!kayma) return;
      }
    }
  }

  // ------------------------------------------------------------ kesimin kendisi
  let soganKesim = 0;
  let agliyor = false;
  let aglamaZaman = 0;
  let aglamiyorumDendi = false;

  function kesimYap(t: Tahtada, p: Parca, yon: 'dik' | 'yatay', x: number, y: number) {
    const n = tahtaNokta(x, y);
    const eskiEl = t.els.get(p.id);
    const kabukVardi = t.d.kabuk > 0;
    const sonuc = kes(t.d, p.id, yon, n.x, n.y, yas);
    const simdi = performance.now();
    seri = seriSay(seri, simdi - sonKesim);
    sonKesim = simdi;
    const perde = seriPerde(seri);
    const renk = RENK[t.d.ad] ?? ['#ccc', '#eee', '#fff'];
    const px = n.x * bw;
    const py = n.y * bh;

    if (sonuc.olay === 'kabuk' || sonuc.olay === 'kabukBitti') {
      b.ses.cal('citir', { perde });
      b.dokunsal(TITRESIM.hafif);
      if (eskiEl) kipirda(eskiEl, 5);
      sac(tahta, px, py, 'kabuk', '#C9934E', 2, { guc: 0.9, yerdeKal: true, boy: 15 });
      if (sonuc.olay === 'kabukBitti') soyuldu(t);
      return;
    }
    if (sonuc.olay === 'centik') {
      b.ses.cal('kitir', { perde: perde * 0.85, guc: 0.6 });
      b.dokunsal(TITRESIM.centik);
      if (eskiEl) {
        centikCiz(eskiEl, p);
        kipirda(eskiEl, 3, 200);
        ezil(eskiEl, 0.6);
      }
      bicak.classList.add('rs-dg-sikisti');
      window.setTimeout(() => bicak.classList.remove('rs-dg-sikisti'), 160);
      if (t.d.centik === 1 && !kabukVardi) {
        olay('sert');
        if (!konusuyorMu()) void b.mino.soyle(M.sert);
      }
      return;
    }
    if (sonuc.olay === 'yok') {
      b.ses.cal(sonuc.ses, { perde, guc: 0.5 });
      if (eskiEl) ezil(eskiEl, 0.8);
      return;
    }

    // ses + titreşim (aynı karede)
    b.ses.cal(sonuc.ses, { perde, guc: sonuc.olay === 'ikiye' && t.d.ad === 'domates' ? 1 : 0.85 });
    b.dokunsal(sonuc.olay === 'ikiye' && t.d.ad === 'domates' ? TITRESIM.slap : TITRESIM.kesim);

    // eski parçaların elemanları gider, yeniler eski yerden açılır (FLIP)
    const eskiler = sonuc.silinen.map((id) => t.els.get(id)).filter((x): x is HTMLElement => !!x);
    const eskiParca = sonuc.silinen.length === 1 ? { x: p.x, y: p.y } : null;
    for (const id of sonuc.silinen) {
      const el = t.els.get(id);
      t.els.delete(id);
      if (sonuc.olay !== 'pure') el?.remove();
    }
    for (const id of sonuc.yeni) {
      const q = t.d.parcalar.find((z) => z.id === id);
      if (!q) continue;
      const el = parcaCiz(t, q);
      dogusOynat(el, q, eskiParca ?? { x: n.x, y: n.y }, sonuc.olay);
    }
    // yerinde değişen parça (yarım küçüldü, küp küçüldü, çentik silindi)
    for (const q of t.d.parcalar) {
      if (sonuc.yeni.includes(q.id)) continue;
      const el = t.els.get(q.id);
      if (!el) continue;
      konumla(el, t.d.ad, q, bw, bh, tanim(t.d.ad).en, tanim(t.d.ad).oran);
      if (q.id === p.id) {
        if (q.cekirdek !== undefined) cekirdekCiz(el, q.cekirdek);
        centikCiz(el, q);
        ezil(el, 1);
      }
    }

    // malzemeye özel anlar
    if (sonuc.olay === 'ikiye' && t.d.ad === 'domates') {
      // kocaman "şlap": iki yana su fışkırır, tahtada leke kalır
      sac(tahta, px, py, 'damla', renk[0], 9, { yon: Math.PI, yay: 1.1, guc: 1.4 });
      sac(tahta, px, py, 'damla', renk[0], 9, { yon: 0, yay: 1.1, guc: 1.4 });
      leke(lekeKat, px, py + 6, renk[0], 70);
      olay('slap');
      void b.mino.tepki('sasir', 700);
    } else if (sonuc.olay === 'pure') {
      // eski parçalar ortaya akar, "vıcık"
      const pr = t.d.parcalar[0];
      for (const el of eskiler) {
        const lx = parseFloat(el.style.left);
        const ly = parseFloat(el.style.top);
        void ucur(el, pr.x * bw - lx, pr.y * bh - ly, 220, -10).then(() => el.remove());
      }
      leke(lekeKat, pr.x * bw, pr.y * bh, renk[0], 90);
      sac(tahta, pr.x * bw, pr.y * bh, 'damla', renk[0], 10, { guc: 1.1 });
      olay('pure');
      void b.mino.tepki('sasir', 900);
      void b.mino.soyle(M.pure);
    } else {
      if (t.d.ad === 'domates' || t.d.ad === 'limon') sac(tahta, px, py, 'damla', renk[t.d.ad === 'limon' ? 0 : 1], 3, { guc: 0.7 });
      if (t.d.ad === 'salatalik') sac(tahta, px, py, 'damla', '#D6F0B0', 2, { guc: 0.5 });
      if (sonuc.dokulen) sac(tahta, px, py, 'cekirdek', renk[2], sonuc.dokulen * 2, { guc: 0.7, yerdeKal: true, boy: 7 });
      if (t.d.ad === 'domates' && sonuc.olay === 'kesti' && Math.random() < 0.35) leke(lekeKat, px, py, renk[0], 30);
    }

    if (t.d.ad === 'sogan') soganKesildi();
    if (sonuc.olay === 'ikiye' && t.d.ad === 'biber') olay('biber-ikiye');
    if (sonuc.olay !== 'pure') itisCiz();
    diliSay(t);
    tamamDenetle();
    ipucuGuncelle();
  }

  /** Yeni parçanın doğuşu: bölünen parçalar eski yerden ayrılır; dilim yana devrilir (yassılaşarak), küp sıçrar */
  function dogusOynat(el: HTMLElement, q: Parca, kaynak: { x: number; y: number }, olay2: string) {
    const dx = (kaynak.x - q.x) * bw;
    const dy = (kaynak.y - q.y) * bh;
    const devrik = q.gorunum !== 'kirpik' && q.gorunum !== 'yarim';
    const ms = TEST_MODU ? 30 : olay2 === 'ikiye' ? 260 : devrik ? 300 : 170;
    try {
      el.animate(
        devrik
          ? [
              { transform: `translate(${dx}px,${dy}px) scale(0.35,1.05)` },
              { transform: `translate(${dx * 0.3}px,${dy * 0.3 - 16}px) scale(0.75,1.1)`, offset: 0.45 },
              { transform: 'translate(0,0) scale(1.12,0.86)', offset: 0.8 },
              { transform: 'translate(0,0) scale(1,1)' },
            ]
          : olay2 === 'ikiye'
            ? [
                { transform: `translate(${dx}px,${dy}px) scale(1.12,0.86)` },
                { transform: `translate(${-dx * 0.08}px,${-dy * 0.08}px) scale(0.94,1.06)`, offset: 0.6 },
                { transform: 'translate(0,0) scale(1,1)' },
              ]
            : [{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'translate(0,0) scale(1.04,0.96)', offset: 0.7 }, { transform: 'translate(0,0) scale(1,1)' }],
        { duration: ms, easing: 'cubic-bezier(.2,.8,.3,1)' },
      );
    } catch {
      /* yok say */
    }
  }

  /** Parçalar birbirini iter (yığılmasın); kayanlar yumuşakça yeni yerine geçer */
  function itisCiz() {
    const hepsi: { t: Tahtada; p: Parca }[] = [];
    for (const t of tahtadakiler) for (const p of t.d.parcalar) hepsi.push({ t, p });
    const once = new Map(hepsi.map(({ p }) => [p.id, [p.x, p.y] as const]));
    const degisen = itis(hepsi.map((x) => x.p), bw / bh);
    for (const { t, p } of hepsi) {
      if (!degisen.has(p.id)) continue;
      const el = t.els.get(p.id);
      const o = once.get(p.id)!;
      if (!el) continue;
      konumla(el, t.d.ad, p, bw, bh, tanim(t.d.ad).en, tanim(t.d.ad).oran);
      const dx = (o[0] - p.x) * bw;
      const dy = (o[1] - p.y) * bh;
      if (Math.hypot(dx, dy) < 1) continue;
      try {
        el.animate([{ translate: `${dx}px ${dy}px` }, { translate: '0 0' }], { duration: TEST_MODU ? 20 : 220, easing: 'cubic-bezier(.2,.8,.3,1)' });
      } catch {
        /* yok say */
      }
    }
  }

  function soyuldu(t: Tahtada) {
    olay('soyuldu');
    b.ses.cal('ting', { guc: 0.6 });
    for (const p of t.d.parcalar) {
      const eski = t.els.get(p.id);
      eski?.remove();
      const el = parcaCiz(t, p);
      hopla(el, 10);
    }
    const r = parcaRect(t, t.d.parcalar[0]);
    parilti(kok, r.x, r.y, 5, 36);
    ipucuGuncelle();
  }

  function soymaDene(t: Tahtada, x: number, y: number) {
    if (!kayma) return;
    if (Math.hypot(x - kayma.x0, y - kayma.y0) < 34) return;
    const sonuc = soy(t.d);
    if (sonuc === 'yok') return;
    const yon = Math.atan2(y - kayma.y0, x - kayma.x0);
    const n = tahtaNokta(kayma.x0, kayma.y0);
    b.ses.cal('citir', { perde: 1 + (3 - t.d.kabuk) * 0.06 });
    b.dokunsal(TITRESIM.hafif);
    sac(tahta, n.x * bw, n.y * bh, 'kabuk', '#C9934E', 3, { yon, yay: 0.6, guc: 1.6, yerdeKal: true, boy: 17 });
    const el = t.els.get(t.d.parcalar[0].id);
    if (el) ezil(el, 1.2);
    olay('kabuk');
    // bir çekişte bir kabuk; parmak yeniden başlasın
    kayma.x0 = x;
    kayma.y0 = y;
    if (sonuc === 'kabukBitti') {
      kayma.soyulan = null;
      kok.classList.remove('rs-dg-tutuyor');
      bicakGoster(x, y);
      soyuldu(t);
    }
  }

  function silkeleYap(t: Tahtada, p: Parca, el: HTMLElement) {
    const n = silkele(t.d, p.id);
    if (!n) return;
    b.ses.cal('pit', { perde: 1.2 });
    b.dokunsal(TITRESIM.hafif);
    hopla(el, 12, 260);
    cekirdekCiz(el, p.cekirdek ?? 0);
    const renk = RENK.biber!;
    sac(tahta, p.x * bw, p.y * bh, 'cekirdek', renk[2], n * 3, { yon: -Math.PI / 2, yay: 2.4, guc: 0.9, yerdeKal: true, boy: 7 });
    olay('silkele');
    ipucuGuncelle();
  }

  // maydanoz: Babaanne'nin mırıltısı (ritim). Maydanoz tahtadayken çalar.
  let ritimBas = 0;
  let ritimZaman = 0;
  let ritimSayac = 0;
  let ritimUyan = 0;
  function ritimKur() {
    const var_ = tahtadakiler.some((t) => tanim(t.d.ad).bicim === 'demet' && !bittiMi(t.d, yas));
    if (var_ && !ritimZaman) {
      ritimBas = performance.now();
      ritimSayac = 0;
      kok.classList.add('rs-dg-ritim');
      ritimZaman = window.setInterval(() => {
        mirilti(ritimSayac++);
        kok.style.setProperty('--ritim', String(ritimSayac % 2));
      }, RITIM_MS);
    } else if (!var_ && ritimZaman) {
      clearInterval(ritimZaman);
      ritimZaman = 0;
      kok.classList.remove('rs-dg-ritim');
    }
  }
  function vurus(t: Tahtada, x: number, y: number) {
    const n = tahtaNokta(x, y);
    const sonuc = kiy(t.d, n.x, n.y, yas);
    const simdi = performance.now();
    seri = seriSay(seri, simdi - sonKesim);
    sonKesim = simdi;
    b.ses.cal('citir', { perde: seriPerde(seri) });
    b.dokunsal(TITRESIM.kesim);
    for (const id of sonuc.silinen) {
      t.els.get(id)?.remove();
      t.els.delete(id);
    }
    for (const id of sonuc.yeni) {
      const q = t.d.parcalar.find((z) => z.id === id);
      if (q) dogusOynat(parcaCiz(t, q), q, { x: n.x, y: n.y }, 'kesti');
    }
    for (const q of t.d.parcalar) {
      const el = t.els.get(q.id);
      if (el && !sonuc.yeni.includes(q.id)) {
        konumla(el, t.d.ad, q, bw, bh, tanim(t.d.ad).en, tanim(t.d.ad).oran);
        ezil(el, 1);
      }
    }
    // bıçak tak diye iner
    bicak.classList.remove('rs-dg-vur');
    void bicak.offsetWidth;
    bicak.classList.add('rs-dg-vur');
    // ritme uydu mu: mırıltının vuruşuna yakın
    const faz = ritimZaman ? (simdi - ritimBas) % RITIM_MS : RITIM_MS / 2;
    const uydu = !!ritimZaman && (faz < RITIM_PAY || faz > RITIM_MS - RITIM_PAY);
    if (uydu) {
      ritimUyan++;
      ritimTing(ritimUyan);
      sac(tahta, n.x * bw, n.y * bh, 'yaprak', '#4CAF3F', 7, { yon: -Math.PI / 2, yay: 2.6, guc: 1.2, boy: 10 });
      sac(tahta, n.x * bw, n.y * bh, 'yaprak', '#8FD06E', 4, { yon: -Math.PI / 2, yay: 2.6, guc: 1, boy: 9 });
      olay('ritim');
      if (ritimUyan === 4 && !konusuyorMu()) void b.mino.soyle(M.ritim);
    } else sac(tahta, n.x * bw, n.y * bh, 'yaprak', '#4CAF3F', 2, { guc: 0.5, boy: 8 });
    ritimKur();
    tamamDenetle();
    ipucuGuncelle();
  }

  function soganKesildi() {
    soganKesim++;
    aglamaZaman = performance.now();
    if (soganKesim === AGLA_KESIM && !agliyor) aglamaBasla();
    if (agliyor && soganKesim >= AGLAMIYORUM_KESIM && !aglamiyorumDendi) {
      aglamiyorumDendi = true;
      olay('aglamiyorum');
      void b.mino.soyle(M.aglamiyorum).then(() => {
        hickir();
        void b.mino.tepki('zipla', 700);
        window.setTimeout(() => {
          if (agliyor) void b.mino.tepki('agla', Infinity);
        }, TEST_MODU ? 40 : 750);
      });
    }
  }
  let aglaDenetim = 0;
  function aglamaBasla() {
    agliyor = true;
    olay('agla');
    void b.mino.tepki('agla', Infinity);
    kok.classList.add('rs-dg-agliyor');
    void b.mino.soyle(M.agla);
    // Kino kapıdan mendil uzatır
    window.setTimeout(
      () => {
        if (!agliyor) return;
        mendil.classList.add('rs-gorunur');
        b.ses.cal('hop', { perde: 0.9 });
      },
      TEST_MODU ? 40 : 1100,
    );
    // soğan kesilmezse bir süre sonra kendiliğinden geçer
    aglaDenetim = window.setInterval(() => {
      if (agliyor && performance.now() - aglamaZaman > (TEST_MODU ? 3000 : 14000)) aglamaBitir(false);
    }, 500);
  }
  function aglamaBitir(mendilIle: boolean) {
    if (!agliyor) return;
    agliyor = false;
    clearInterval(aglaDenetim);
    kok.classList.remove('rs-dg-agliyor');
    mendil.classList.remove('rs-gorunur');
    b.mino.dur();
    if (mendilIle) {
      sumkur();
      olay('mendil');
      void b.mino.tepki('sevin', 1200);
      window.setTimeout(() => void b.mino.soyle(M.mendil), TEST_MODU ? 0 : 500);
    }
    // yeniden ağlayabilsin (yeni soğanda)
    soganKesim = 0;
  }
  mendil.addEventListener('click', () => {
    b.dokunsal(TITRESIM.hafif);
    ezil(mendil, 1.4);
    aglamaBitir(true);
  });

  /** 5-6: Mino kesilen dilimleri sayar (Bir! İki! ... Beş!); özel istekte (adet) o sebzeninkini */
  function diliSay(t: Tahtada) {
    if (yas !== 'buyuk') return;
    const istek = g.ozelIstek?.tur === 'adet' ? (g.ozelIstek.deger as { malzeme: Malzeme }).malzeme : null;
    if (istek && istek !== t.d.ad) return;
    const n = dilimSayisi(t.d);
    if (n <= t.sayilan || n > 5) {
      t.sayilan = Math.max(t.sayilan, n);
      return;
    }
    t.sayilan = n;
    const soz = (M.say as Record<string, string>)[String(n)];
    if (soz && !konusuyorMu()) void b.mino.soyle(soz);
  }

  // ------------------------------------------------------------ doğal son ve ipucu
  let hoplandi = false;
  function tamamDenetle() {
    for (const t of tahtadakiler) {
      if (!t.bittiDendi && bittiMi(t.d, yas)) {
        t.bittiDendi = true;
        if (!t.d.pure) {
          b.ses.cal('ting', { guc: 0.5 });
          const r = parcaRect(t, t.d.parcalar[0]);
          parilti(kok, r.x, r.y, 4, 30);
        }
      }
    }
    const hepsi = tahtadakiler.length > 0 && tahtadakiler.every((t) => bittiMi(t.d, yas));
    if (hepsi && !hoplandi) {
      hoplandi = true;
      b.tepsi.hopla();
      olay('dogalSon');
    }
    if (!hepsi) hoplandi = false;
    ritimKur();
    kok.dataset.durum = JSON.stringify(ozetDurum());
  }

  function ipucuGuncelle() {
    if (odulde) {
      b.ipucu.hedef(null);
      return;
    }
    const ilk = tahtadakiler.find((t) => !bittiMi(t.d, yas));
    if (!ilk) {
      if (!tahtadakiler.length && !kase.length) {
        const oneri = raftakiler[0];
        b.ipucu.hedef({ el: () => rafEl.get(oneri) ?? null, soz: M.ipucu.bos, hareket: 'dokun' });
      } else b.ipucu.hedef({ el: () => b.tepsi.el, soz: M.ipucu.bitti, hareket: 'dokun' });
      return;
    }
    const el = () => ilk.els.get(ilk.d.parcalar[0]?.id ?? -1) ?? null;
    if (ilk.d.kabuk > 0) b.ipucu.hedef({ el, soz: M.ipucu.kabuk, hareket: 'kaydir-yatay' });
    else if (tanim(ilk.d.ad).bicim === 'demet') b.ipucu.hedef({ el, soz: M.ipucu.maydanoz, hareket: 'dokun' });
    else if (ilk.d.parcalar.some((p) => p.cekirdek)) {
      const p = ilk.d.parcalar.find((q) => q.cekirdek)!;
      b.ipucu.hedef({ el: () => ilk.els.get(p.id) ?? null, soz: M.ipucu.cekirdek, hareket: 'dokun' });
    } else {
      const soz = (M.ipucu.butun as Record<string, string>)[ilk.d.ad];
      const bp = ilk.d.parcalar.find((p) => p.gorunum === 'kirpik' || p.gorunum === 'yarim') ?? ilk.d.parcalar[0];
      b.ipucu.hedef({ el: () => ilk.els.get(bp.id) ?? null, soz, hareket: tanim(ilk.d.ad).eksen === 'y' && yas === 'kucuk' ? 'kaydir-yatay' : 'kaydir-dik' });
    }
  }
  ipucuGuncelle();

  // ------------------------------------------------------------ ürün ve ödül anı
  function baskinGorunum(d: SebzeDurum): Gorunum {
    const say = new Map<Gorunum, number>();
    for (const p of d.parcalar) say.set(p.gorunum, (say.get(p.gorunum) ?? 0) + 1);
    return [...say].sort((a, c) => c[1] - a[1])[0]?.[0] ?? 'kirpik';
  }
  function urunYap(): Urun | null {
    if (!kase.length) return null;
    const malzemeler: Partial<Record<Malzeme, MalzemeDurumu>> = {};
    const sayi = new Map<Malzeme, number>();
    for (const k of kase) {
      const e = malzemeler[k.m];
      sayi.set(k.m, (sayi.get(k.m) ?? 0) + 1);
      if (!e) malzemeler[k.m] = { ...k.ozet };
      else {
        // aynı malzeme birden çok kez: en çok işlenmiş kesim, adet toplanır; püre baskın
        const once = KESIM_SIRA.indexOf(e.kesim ?? 'butun');
        const yeni = KESIM_SIRA.indexOf(k.ozet.kesim ?? 'butun');
        malzemeler[k.m] = { adet: e.adet + k.ozet.adet, kesim: yeni > once ? k.ozet.kesim : e.kesim };
      }
    }
    const tane = kase.length;
    const porsiyon = tane <= 1 ? 'az' : tane >= (yas === 'kucuk' ? 4 : 5) ? 'kocaman' : 'normal';
    const icerik = kase.map((x) => ({ m: x.m, g: x.g, n: x.n }));
    const ozellik = { malzemeler, porsiyon, sicak: false } as Urun['ozellik'];
    return { id: urunId('dogranmis'), tur: 'dogranmis', yemek: g.tarif, ozellik, gorsel: () => kaseEl(icerik) };
  }

  let coz: (u: Urun[]) => void = () => undefined;
  const bitti = new Promise<Urun[]>((r) => (coz = r));
  b.tepsi.dinle(() => {
    if (odulde) return;
    if (!tahtadakiler.length && !kase.length) {
      coz([]);
      return;
    }
    void odulAni();
  });

  async function odulAni() {
    odulde = true;
    b.ipucu.hedef(null);
    olay('yelpaze');
    const bekle = (ms: number) => new Promise<void>((r) => window.setTimeout(r, TEST_MODU ? Math.min(ms, 30) : ms));
    // dilimler tahtada kendi kendine yelpaze gibi dizilir
    tikirTikir();
    for (const t of tahtadakiler) yelpaze(t);
    await bekle(760);
    // kâseye kayar
    for (const t of tahtadakiler.slice()) kaseyeAl(t, true);
    await bekle(420);
    b.ses.cal('ting');
    const kr = kaseKutu.getBoundingClientRect();
    parilti(kok, kr.left - kok.getBoundingClientRect().left + kr.width / 2, kr.top - kok.getBoundingClientRect().top + kr.height / 2, 7, 50);
    await bekle(260);
    const u = urunYap();
    // kâse tepsiye kayar
    const tr = b.tepsi.el.getBoundingClientRect();
    await ucur(kaseKutu, tr.left + tr.width / 2 - (kr.left + kr.width / 2), tr.top + tr.height / 2 - (kr.top + kr.height / 2), 360, -30);
    coz(u ? [u] : []);
  }

  /** Bir sebzenin parçalarını yuvasının çevresinde yay biçiminde dizer (üst üste binen kartlar gibi) */
  function yelpaze(t: Tahtada) {
    const ps = t.d.parcalar;
    const n = ps.length;
    const [cx, cy] = yuvalar()[t.yuva] ?? [0.5, 0.5];
    const yay = Math.min(1.9, 0.35 * n);
    const r = 0.13;
    ps.forEach((p, i) => {
      const a = -Math.PI / 2 + (n === 1 ? 0 : -yay / 2 + (yay * i) / (n - 1));
      const nx = cx + (Math.cos(a) * r) / 1.1;
      const ny = cy + 0.1 + (Math.sin(a) * r * bw) / bh;
      const el = t.els.get(p.id);
      if (!el) return;
      const dx = (p.x - nx) * bw;
      const dy = (p.y - ny) * bh;
      p.x = nx;
      p.y = ny;
      konumla(el, t.d.ad, p, bw, bh, tanim(t.d.ad).en, tanim(t.d.ad).oran);
      el.style.zIndex = String(10 + i);
      try {
        el.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'translate(0,-8px) scale(1.05,0.95)', offset: 0.75 }, { transform: 'translate(0,0)' }], {
          duration: TEST_MODU ? 30 : 380,
          delay: TEST_MODU ? 0 : i * 22,
          easing: 'cubic-bezier(.3,.9,.4,1)',
          fill: 'backwards',
        });
      } catch {
        /* yok say */
      }
    });
  }

  // e2e ve önizleme: durum özeti
  function ozetDurum() {
    return {
      tahta: tahtadakiler.map((t) => ({ ad: t.d.ad, parca: t.d.parcalar.length, kesim: t.d.kesim, kabuk: t.d.kabuk, bitti: bittiMi(t.d, yas), ozet: kesimOzeti(t.d, yas) })),
      kase: kase.map((k) => ({ m: k.m, ...k.ozet })),
      agliyor,
    };
  }
  const pencere = window as unknown as { __rsDogra?: unknown };
  pencere.__rsDogra = { olaylar, durum: ozetDurum, agliyor: () => agliyor };

  return {
    bitti,
    kapat() {
      ro?.disconnect();
      clearInterval(ritimZaman);
      clearInterval(aglaDenetim);
      b.mino.dur();
      kok.remove();
    },
  };
}

const KESIM_SIRA = ['butun', 'yarim', 'iri', 'dilim', 'serit', 'cubuk', 'ince', 'kup', 'kiyim', 'pure'];

/** 5-6 özel istek kartı: malzeme + istenen sayı (nokta) ya da kesim */
function istekKarti(d: { malzeme: Malzeme; sayi?: number; kesim?: string }): HTMLElement {
  const kart = h('div.rs-dg-istek', { 'aria-hidden': 'true' }, h('span.rs-dg-istek-resim', {}, rafSimge(d.malzeme)));
  if (d.sayi) {
    const noktalar = h('span.rs-dg-istek-nokta');
    for (let i = 0; i < d.sayi; i++) noktalar.append(h('i'));
    kart.append(noktalar);
  } else if (d.kesim) {
    const p = parcaEl(d.malzeme, { id: 0, gorunum: d.kesim === 'kup' ? 'kup' : 'dilim', x: 0, y: 0, w: 0, h: 0 });
    p.classList.add('rs-dg-istek-kesim');
    kart.append(p);
  }
  return kart;
}
