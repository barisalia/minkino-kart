/**
 * PİDE FIRINI · hamur aç, malzeme diz, kürekle fırına ver. ekip/senaryo/RESTORAN.md §8 M10, §3c, §7c.
 *
 * İki yer, tek oyun (kamera kayar, büyütme yok):
 *   1. MERMER TEZGÂH (üstten): hamur topu, merdane, rafta kaşar rendesi (Rendele'den gelir), sucuk, yumurta, domates,
 *      biber, un serpme.
 *      - Merdane hamurun üstünde sürüklendikçe hamur o yönde uzar: tek yöne kayık pide, iki yöne yuvarlak. Şekli
 *        çocuk belirler. Çok açarsan incelir, ortası delinir: Mino delikten bakar, "Pencereli pide!" (pişince delik
 *        kalp olur).
 *      - Malzeme serbest dizilir (hafif mıknatıs; uzağa bırakılan tezgâhta kalır). Yumurta hamurun kenarına iki kez
 *        vurulur, ortaya dökülür. Kocaman malzeme dağı mümkün.
 *      - Kenar: 5-6'da kenara iki dokunuş kıvırır; 3-4'te küreğe alınınca kendiliğinden kıvrılır.
 *      - Fırın küreği hamurun altına sürülünce (ya da küreğe dokununca) pide küreğe biner, kamera fırına kayar.
 *   2. TAŞ FIRIN (önden): kürek fırının ağzına itilip bırakılır; pide fırında kendi pişer (kabarır, renk değişir;
 *      çıtır son durak). Almak için boş kürek ağza itilir ve geri çekilir. Fırın arka planda da pişirir.
 *   3. ÖDÜL: pide tezgâha döner, buhar üfler, dilimlenmiş durur; bir dilim çekilince PEYNİR UZAR (kodla iplik), kopar.
 */
import { konusuyorMu } from '../../../../src/audio/ses';
import { h, TEST_MODU } from '../../../../src/ui/dom';
import metin from '../../../../content/restoran/mini-pide.json';
import { MALZEME_ADI, urunId, type ArkaIs, type Malzeme, type MiniBaglam, type MiniGirdi, type MiniOturum, type MiniOyun, type Urun, type YemekOzelligi } from '../arayuz';
import { ezil, hopla, parilti, sac, TITRESIM, ucur } from '../dogra/efekt';
import { parcaEl } from '../dogra/gorsel';
import { surukle } from '../dogra/surukle';
import { Elde, istasyonResmi, merkez, olayci, p5Ses, rafOge, rafYerlestir, resimYa, YUKARI, type RafOge } from '../kir-cirp/ortak';
import { kenaraVurdu, SERT_VURUS } from '../tava/mantik';
import {
  delik as delikHesap,
  EN_COK,
  firinPis,
  hamurda,
  kabarma,
  KENAR_DOKUNUS,
  kenardaMi,
  merdane,
  miknatis,
  pidePisme,
  pidePorsiyon,
  sekil as sekilHesap,
  topHamur,
  type Hamur,
} from './mantik';
import './pide.css';

const M = metin.mino;
type RafTur = 'kasar' | 'sucuk' | 'yumurta' | 'domates' | 'biber' | 'un';
type Faz = 'hamur' | 'firin' | 'sunum';
/** Fırının ağzı (önden çizimin içinde; Gemini 'istasyon-firin' gelince bu oranlar çizime hizalanır: ORTAK_NOTLAR) */
const FIRIN_AGZI = { x: 0.5, y: 0.5, w: 0.3, h: 0.24 } as const;

interface Parca {
  m: Malzeme;
  /** hamurun yarı eni / yarı boyu cinsinden konum (-1..1); hamur açılınca birlikte açılır */
  u: number;
  v: number;
  tur: 'tel' | 'dilim' | 'parca' | 'sari';
}
interface PideKayit {
  hamur: Hamur;
  parcalar: Parca[];
  kivrik: boolean;
  p: number;
  kullanilan: string[];
  t: number;
}

export const oyun: MiniOyun = {
  ad: 'pide',
  istasyon: 'firin',
  simge: () => resimYa('yiyecek/pide-kasarli', 'kurek', 'rs-pd-simge'),
  baslat: (b, g) => pideBaslat(b, g),
};

/** Tepside ve masada pişmiş pide (kutusunu doldurur; yüzde konumlu) */
export function pideGorsel(hm: Hamur, parcalar: Parca[], pisme: string, delik: number): HTMLElement {
  const el = h('span.rs-pd-urun', { 'data-pisme': pisme });
  const en = hm.en / EN_COK.en;
  const boy = hm.boy / EN_COK.en;
  const ic = h('span.rs-pd-urun-hamur', { 'data-delik': delik > 0 ? '1' : '0' });
  ic.style.cssText = `width:${Math.max(30, en * 96)}%;height:${Math.max(30, boy * 96)}%`;
  for (const p of parcalar.slice(0, 40)) {
    const t = h('i.rs-pd-urun-p', { 'data-m': p.m, 'data-tur': p.tur });
    t.style.left = `${50 + p.u * 46}%`;
    t.style.top = `${50 + p.v * 46}%`;
    ic.append(t);
  }
  el.append(ic);
  return el;
}

function pideBaslat(b: MiniBaglam, g: MiniGirdi): MiniOturum {
  const yas = g.yas;
  const kok = h('div.rs-p5-oyun.rs-pide', { 'data-yas': yas });
  const { olaylar, olay } = olayci(kok);
  const onceki = g.devam as PideKayit | undefined;
  let hamur: Hamur = onceki ? { ...onceki.hamur } : topHamur();
  const parcalar: Parca[] = onceki ? onceki.parcalar.map((p) => ({ ...p })) : [];
  let kivrik = onceki?.kivrik ?? false;
  let p = onceki ? firinPis(onceki.p, (performance.now() - onceki.t) / 1000) : 0;
  const kullanilan: string[] = onceki ? onceki.kullanilan.slice() : [];
  let faz: Faz = onceki ? 'firin' : 'hamur';
  /** pide nerede: tezgâhta, küreğin üstünde, fırının içinde, dışarıda (pişmiş) */
  let yer: 'tezgah' | 'kurek' | 'firin' | 'disari' = onceki ? 'firin' : 'tezgah';
  const sayac: Partial<Record<Malzeme, number>> = {};
  for (const pc of parcalar) sayac[pc.m] = (sayac[pc.m] ?? 0) + (pc.tur === 'tel' ? 0.1 : 1);

  // tepsiden: kaşar rendesi (Rendele), varsa
  const rendeUrun = g.tepsi.find((u) => u.tur === 'rende' && u.ozellik.malzemeler.kasar && !kullanilan.includes(u.id));

  // ------------------------------------------------------------ DOM
  const mermerUrl = istasyonResmi('mermer');
  const firinUrl = istasyonResmi('firin');
  const mermer = h('div.rs-pd-mermer', { 'data-resim': mermerUrl ? '1' : '0' });
  if (mermerUrl) mermer.style.backgroundImage = `url("${mermerUrl}")`;
  const firinPanel = h('div.rs-pd-firin-panel', { 'data-resim': firinUrl ? '1' : '0' });
  const kubbe = h('div.rs-pd-kubbe', { hidden: !!firinUrl }, h('i.rs-pd-kubbe-govde'), h('i.rs-pd-baca'));
  const agiz = h('div.rs-pd-agiz', {}, h('i.rs-pd-kor'));
  firinPanel.append(kubbe, agiz);
  const sahne = h('div.rs-pd-sahne', {}, mermer, firinPanel);
  const unKat = h('div.rs-pd-un-kat');
  const pide = h('div.rs-pd-pide');
  const hamurEl = h('div.rs-pd-hamur');
  const ustKat = h('div.rs-pd-ust');
  pide.append(h('span.rs-pd-hamur-sar', {}, hamurEl), ustKat);
  const tezgahKat = h('div.rs-pd-tezgah-kat');
  const merdaneEl = h('div.rs-pd-merdane', { role: 'button', 'aria-label': 'Merdane' }, resimYa('alet/merdane', 'merdane'));
  const kurek = h('div.rs-pd-kurek', { role: 'button', 'aria-label': 'Fırın küreği', 'data-yon': 'yatay' }, h('i.rs-pd-kurek-sap'), h('i.rs-pd-kurek-agiz'));
  const profil = h('div.rs-pd-profil', { hidden: true }, h('i.rs-pd-profil-ust'));
  const dilimKat = h('div.rs-pd-dilimler', { hidden: true });
  const ipSvg = h('div.rs-pd-ip', { 'aria-hidden': 'true', html: '<svg width="100%" height="100%"></svg>' });
  const raf = h('div.rs-p5-raf');
  const eldeKat = h('div.rs-pd-elde-kat');
  kok.append(sahne, unKat, tezgahKat, pide, profil, dilimKat, ipSvg, merdaneEl, kurek, raf, eldeKat);
  b.kok.append(kok);
  const elde = new Elde(eldeKat, kok);

  const rafOgeleri: RafOge<RafTur>[] = [];
  const kasarRaf = rafOge(raf, rafOgeleri, 'kasar', resimYa('yiyecek/kasar-rende', 'kase', 'rs-p5-resim'), MALZEME_ADI.kasar);
  (kasarRaf.firstElementChild as HTMLElement).style.setProperty('--ic', '#ffe07a');
  kasarRaf.classList.add('rs-pd-kasar-kase');
  rafOge(raf, rafOgeleri, 'sucuk', resimYa('yiyecek/sucuk-dilim', 'sucuk'), MALZEME_ADI.sucuk);
  const yumurtaRaf = rafOge(raf, rafOgeleri, 'yumurta', resimYa('alet/yumurta', 'yumurta'), MALZEME_ADI.yumurta);
  rafOge(raf, rafOgeleri, 'domates', resimYa('yiyecek/domates-kup', 'kase'), MALZEME_ADI.domates);
  rafOge(raf, rafOgeleri, 'biber', resimYa('yiyecek/biber-halka', 'kase'), MALZEME_ADI.biber);
  rafOge(raf, rafOgeleri, 'un', resimYa('alet/un-serpme', 'serpme'), MALZEME_ADI.un);
  for (const o of rafOgeleri) if (o.tur === 'domates' || o.tur === 'biber') (o.el.firstElementChild as HTMLElement).style.setProperty('--ic', o.tur === 'domates' ? '#F26B5B' : '#9CCB63');

  // ------------------------------------------------------------ yerleşim
  let W = 844;
  let H = 390;
  let px = 360;
  let py = 230;
  let r0 = 60;
  let yatay = true;
  let merdaneYer = { x: 0, y: 0 };
  let kurekYer = { x: 0, y: 0 };
  let agizYer = { x: 0, y: 0, w: 200, h: 100 };
  let tutulan: 'merdane' | 'kurek' | null = null;
  function yerlestir() {
    W = kok.clientWidth;
    H = kok.clientHeight;
    if (!W || !H) return;
    yatay = W >= H;
    kok.dataset.yon = yatay ? 'yatay' : 'dikey';
    const rafAlt = rafYerlestir(kok, raf, yatay);
    if (yatay) {
      r0 = Math.min((H - rafAlt - 26) / (2 * EN_COK.boy), (W * 0.6) / (2 * EN_COK.en));
      px = Math.max(W * 0.42, EN_COK.en * r0 + 120);
      py = rafAlt + 8 + (H - rafAlt - 8) / 2;
      merdaneYer = { x: Math.min(W - 230, px + EN_COK.en * r0 + 40), y: py + r0 * 1.1 };
      kurekYer = { x: W - 70, y: rafAlt + 24 + r0 };
    } else {
      r0 = Math.min((W - 30) / (2 * EN_COK.en), (H - rafAlt) * 0.14);
      px = W / 2;
      py = rafAlt + 30 + EN_COK.boy * r0;
      merdaneYer = { x: W * 0.36, y: py + EN_COK.boy * r0 + 48 };
      kurekYer = { x: W * 0.62, y: py + EN_COK.boy * r0 + 130 };
    }
    // fırın ağzı (önden): çizim varsa oranları, yoksa yer tutucu kubbenin ağzı
    agizYer = { x: W * FIRIN_AGZI.x, y: H * FIRIN_AGZI.y, w: Math.min(W * FIRIN_AGZI.w, H * 0.7), h: Math.min(H * FIRIN_AGZI.h, W * 0.2) };
    if (!yatay) agizYer = { x: W / 2, y: H * 0.42, w: W * 0.6, h: H * 0.1 };
    const kw = agizYer.w * 1.7;
    kubbe.style.cssText = `left:${agizYer.x - kw / 2}px;top:${agizYer.y - agizYer.h * 2.1}px;width:${kw}px;height:${agizYer.h * 2.9}px`;
    agiz.style.cssText = `left:${agizYer.x - agizYer.w / 2}px;top:${agizYer.y - agizYer.h / 2}px;width:${agizYer.w}px;height:${agizYer.h}px`;
    pideCiz();
    if (tutulan !== 'merdane') merdaneKoy(merdaneYer.x, merdaneYer.y);
    if (tutulan !== 'kurek') kurekDinlen();
    if (faz === 'firin') profilCiz();
  }
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => yerlestir()) : null;
  ro?.observe(kok);

  // ------------------------------------------------------------ hamur ve üstündekiler
  let delikDendi = false;
  const sekilDendi = new Set<string>();
  function pideCiz() {
    const rx = hamur.en * r0;
    const ry = hamur.boy * r0;
    pide.style.cssText = `left:${px - rx}px;top:${py - ry}px;width:${rx * 2}px;height:${ry * 2}px`;
    pide.dataset.sekil = sekilHesap(hamur);
    pide.classList.toggle('rs-kivrik', kivrik);
    pide.dataset.pisme = pidePisme(p);
    const dl = delikHesap(hamur, yas);
    const r = dl * Math.min(rx, ry) * 0.42;
    pide.dataset.delik = dl > 0 ? '1' : '0';
    pide.classList.toggle('rs-delikli', dl > 0);
    if (dl > 0) {
      const maske = yer === 'disari' && p >= 1 ? kalpMaske(r) : `radial-gradient(circle ${r}px at 50% 50%, transparent ${Math.max(0, r - 1)}px, #000 ${r}px)`;
      hamurEl.style.setProperty('mask', maske);
      hamurEl.style.setProperty('-webkit-mask', maske);
      if (yer === 'disari' && p >= 1) {
        hamurEl.style.setProperty('mask-composite', 'exclude');
        hamurEl.style.setProperty('-webkit-mask-composite', 'xor');
      }
    } else {
      hamurEl.style.removeProperty('mask');
      hamurEl.style.removeProperty('-webkit-mask');
    }
    // ince hamur biraz daha açık renk
    hamurEl.style.setProperty('--ince', String(Math.min(1, (hamur.en * hamur.boy - 1) / 4)));
  }
  function kalpMaske(r: number) {
    const s = r * 2.4;
    const kalp = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 30'%3E%3Cpath d='M16 29 C6 21 0 15 0 8.5 C0 3.5 3.8 0 8.3 0 C11.5 0 14.4 1.9 16 4.8 C17.6 1.9 20.5 0 23.7 0 C28.2 0 32 3.5 32 8.5 C32 15 26 21 16 29Z'/%3E%3C/svg%3E\")";
    return `${kalp} center / ${s}px ${s * 0.94}px no-repeat, linear-gradient(#000, #000)`;
  }
  function parcaCiz(pc: Parca, yeni: boolean, kaynak?: { x: number; y: number }) {
    let el: HTMLElement;
    if (pc.tur === 'tel') el = h('i.rs-pd-tel');
    else if (pc.tur === 'dilim') el = h('i.rs-pd-sucuk');
    else if (pc.tur === 'sari') el = h('i.rs-pd-sari');
    else {
      el = parcaEl(pc.m, { id: 0, gorunum: pc.m === 'biber' ? 'serit' : 'kup', x: 0, y: 0, w: 0, h: 0 });
      el.classList.add('rs-pd-parca');
    }
    el.dataset.m = pc.m;
    el.style.left = `${50 + pc.u * 50}%`;
    el.style.top = `${50 + pc.v * 50}%`;
    ustKat.append(el);
    if (yeni && kaynak) {
      const hedef = { x: px + pc.u * hamur.en * r0, y: py + pc.v * hamur.boy * r0 };
      try {
        el.animate([{ translate: `${kaynak.x - hedef.x}px ${kaynak.y - hedef.y}px`, scale: '0.7' }, { translate: '0 -10px', scale: '1.1 0.9', offset: 0.8 }, { translate: '0 0', scale: '1' }], {
          duration: TEST_MODU ? 30 : 320,
          easing: 'cubic-bezier(.3,.6,.4,1)',
          fill: 'backwards',
        });
      } catch {
        /* yok say */
      }
    }
  }
  for (const pc of parcalar) parcaCiz(pc, false);

  // ------------------------------------------------------------ merdane
  function merdaneKoy(x: number, y: number) {
    merdaneEl.style.transform = `translate(${x}px,${y}px)`;
  }
  let sonM = { x: 0, y: 0 };
  let merdaneSes = 0;
  function ac(mx: number, my: number, dx: number, dy: number) {
    if (yer !== 'tezgah' || !hamurda(mx - px, my - py, hamur, r0, 1.15)) return;
    if (Math.hypot(dx, dy) < 0.4) return;
    hamur = merdane(hamur, dx, dy, r0, yas);
    // üstündeki malzeme ezilmez: yerinde kalır (yüzde konum, hamurla açılır)
    pideCiz();
    if ((merdaneSes += Math.hypot(dx, dy)) > 22) {
      merdaneSes = 0;
      p5Ses.merdane(0.9 + Math.random() * 0.2);
      b.dokunsal(TITRESIM.hafif);
      if (Math.random() < 0.25) sac(kok, mx, my, 'un', '#fffaf0', 2, { guc: 0.4, boy: 6, yercekim: false });
    }
    const sk = sekilHesap(hamur);
    if ((sk === 'kayik' || sk === 'yuvarlak') && !sekilDendi.has(sk)) {
      sekilDendi.add(sk);
      olay(`sekil-${sk}`);
      if (!konusuyorMu()) void b.mino.soyle(sk === 'kayik' ? M.kayik : M.yuvarlak);
    }
    if (delikHesap(hamur, yas) > 0 && !delikDendi) {
      delikDendi = true;
      olay('pencere');
      b.ses.cal('pof', { perde: 1.3 });
      void b.mino.tepki('bak', 1600);
      void b.mino.soyle(M.pencere);
    }
    durumGuncelle(false);
  }
  surukle(merdaneEl, kok, {
    basla: (x, y) => {
      if (faz !== 'hamur') return false;
      tutulan = 'merdane';
      merdaneEl.classList.add('rs-tutuluyor');
      sonM = { x, y: y - 20 };
      merdaneKoy(x, y - 20);
      b.ses.cal('tik', { guc: 0.3, perde: 0.7 });
    },
    hareket: (x, y) => {
      const mx = x;
      const my = y - 20;
      merdaneKoy(mx, my);
      ac(mx, my, mx - sonM.x, my - sonM.y);
      sonM = { x: mx, y: my };
    },
    birak: () => merdaneBirak(),
    dokun: () => {
      if (faz !== 'hamur' || yer !== 'tezgah') return;
      // dokununca merdane hamurun üstünden bir kez yatay geçer
      tutulan = 'merdane';
      const adim = TEST_MODU ? 5 : 16;
      let i = 0;
      const x0 = px - hamur.en * r0 * 0.8;
      const x1 = px + hamur.en * r0 * 0.8;
      sonM = { x: x0, y: py };
      const z = window.setInterval(() => {
        const mx = x0 + ((x1 - x0) * i) / adim;
        merdaneKoy(mx, py);
        ac(mx, py, mx - sonM.x, 0);
        sonM = { x: mx, y: py };
        if (++i > adim) {
          clearInterval(z);
          merdaneBirak();
        }
      }, 40);
      zamanlar.push(z);
    },
  });
  const zamanlar: number[] = [];
  function merdaneBirak() {
    tutulan = null;
    merdaneEl.classList.remove('rs-tutuluyor');
    merdaneKoy(merdaneYer.x, merdaneYer.y);
    if (sekilHesap(hamur) !== 'top') olay('acildi');
    durumGuncelle();
  }

  // ------------------------------------------------------------ malzeme diz
  function koy(tur: RafTur, x: number, y: number, kaynak: { x: number; y: number }) {
    const yerP = miknatis(x - px, y - py, hamur, r0);
    if (!yerP) {
      // tezgâhta kalır (pidenin dışında; ürüne girmez)
      const el = h('i.rs-pd-tezgahta', { 'data-m': tur });
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      tezgahKat.append(el);
      b.ses.cal('tok', { guc: 0.4 });
      olay('tezgahta');
      return;
    }
    const u = yerP.x / (hamur.en * r0);
    const v = yerP.y / (hamur.boy * r0);
    const m = tur as Malzeme;
    const ilk = !sayac[m];
    let yeniler: Parca[] = [];
    if (tur === 'kasar') {
      yeniler = Array.from({ length: 12 }, () => {
        const a = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * 0.32;
        return { m, u: clampU(u + Math.cos(a) * r), v: clampU(v + Math.sin(a) * r * 1.2), tur: 'tel' as const };
      });
      sayac.kasar = (sayac.kasar ?? 0) + 1;
      if (rendeUrun && !kullanilan.includes(rendeUrun.id)) kullanilan.push(rendeUrun.id);
      p5Ses.kasik(true);
    } else if (tur === 'sucuk' || tur === 'domates' || tur === 'biber') {
      yeniler = Array.from({ length: 3 }, (_, i) => {
        const a = i * 2.1 + Math.random();
        return { m, u: clampU(u + Math.cos(a) * 0.18), v: clampU(v + Math.sin(a) * 0.22), tur: tur === 'sucuk' ? ('dilim' as const) : ('parca' as const) };
      });
      sayac[m] = (sayac[m] ?? 0) + 3;
      b.ses.cal(tur === 'domates' ? 'slap' : 'pit', { guc: 0.4, perde: 1.3 });
    }
    for (const pc of yeniler) {
      parcalar.push(pc);
      parcaCiz(pc, true, kaynak);
    }
    b.dokunsal(TITRESIM.hafif);
    ezil(hamurEl, 0.3, 120);
    olay(`koy-${tur}`);
    if (ilk && !konusuyorMu()) void b.mino.soyle(M.ad[tur]);
    malzemeDagi();
    durumGuncelle();
  }
  const clampU = (x: number) => Math.max(-0.82, Math.min(0.82, x));
  let dagDendi = false;
  function malzemeDagi() {
    if (dagDendi || pidePorsiyon(toplamMalzeme(), hamur) !== 'kocaman') return;
    dagDendi = true;
    olay('dag');
    void b.mino.tepki('sasir', 1200);
    void b.mino.soyle(M.dag);
  }
  const toplamMalzeme = () => Object.entries(sayac).reduce((a, [m, n]) => a + (m === 'kasar' ? (n ?? 0) * 3 : (n ?? 0)), 0);
  function unSerp(x?: number, y?: number) {
    const ux = x ?? px + (Math.random() - 0.5) * hamur.en * r0 * 2.4;
    const uy = y ?? py + (Math.random() - 0.5) * hamur.boy * r0 * 2.2;
    p5Ses.kasik(false);
    sac(kok, ux, uy, 'un', '#fffaf0', 8, { guc: 0.7, boy: 7, yercekim: false });
    const el = h('i.rs-pd-un');
    el.style.left = `${ux}px`;
    el.style.top = `${uy}px`;
    unKat.append(el);
    if (unKat.childElementCount > 14) unKat.firstElementChild?.remove();
    if (!olaylar.includes('un') && !konusuyorMu()) void b.mino.soyle(M.ad.un);
    olay('un');
  }

  // yumurta: hamurun kenarına iki vuruş, ortaya dökülür (3-4: dokunuşla kenara zıplar)
  let kenardaki: HTMLElement | null = null;
  const normUzak = (x: number, y: number) => Math.sqrt(((x - px) / (hamur.en * r0)) ** 2 + ((y - py) / (hamur.boy * r0)) ** 2) * 100;
  function yumurtaVur(el: HTMLElement, hiz: number, x: number, y: number): boolean {
    const n = Number(el.dataset.vurus ?? '0') + 1;
    el.dataset.vurus = String(n);
    if (n === 1) {
      b.ses.cal('tik');
      el.classList.add('rs-catlak');
      ezil(el, 1.2);
      olay('tik');
      return false;
    }
    b.ses.cal('cat');
    b.dokunsal(TITRESIM.kesim);
    sac(kok, x, y, 'kabuk', '#FFF3DC', 2, { yon: -Math.PI / 2, yay: 2.4, guc: 1.2, boy: 20 });
    // sarısı ortaya (biraz rastgele)
    const pc: Parca = { m: 'yumurta', u: (Math.random() - 0.5) * 0.3, v: (Math.random() - 0.5) * 0.3, tur: 'sari' };
    parcalar.push(pc);
    window.setTimeout(
      () => {
        b.ses.cal('pit');
        parcaCiz(pc, true, { x, y });
        durumGuncelle();
      },
      TEST_MODU ? 0 : 120,
    );
    sayac.yumurta = (sayac.yumurta ?? 0) + 1;
    if (hiz > SERT_VURUS[yas]) sac(kok, x, y, 'kabuk', '#FFF3DC', 1, { guc: 0.4, boy: 14, yerdeKal: true });
    olay('koy-yumurta');
    if (sayac.yumurta === 1 && !konusuyorMu()) void b.mino.soyle(M.ad.yumurta);
    return true;
  }
  let oncekiU = Infinity;
  let kirildi = false;
  surukle(yumurtaRaf, kok, {
    basla: (x, y) => {
      if (faz !== 'hamur' || yer !== 'tezgah') return false;
      const el = elde.al(yumurtaRaf, x, y);
      el.dataset.vurus = '0';
      oncekiU = Infinity;
      kirildi = false;
    },
    hareket: (x, y, hiz) => {
      if (kirildi || !elde.el) return;
      elde.tasi(x, y);
      const u = normUzak(x, y - YUKARI);
      if (kenaraVurdu(oncekiU, u, 100, yas) && yumurtaVur(elde.el, hiz.v, x, y - YUKARI)) {
        kirildi = true;
        elde.birak();
      }
      oncekiU = u;
    },
    birak: () => {
      if (!kirildi) elde.birak(yumurtaRaf);
    },
    dokun: () => {
      elde.birak();
      if (faz !== 'hamur' || yer !== 'tezgah') return;
      if (kenardaki) return kenardakiVur();
      const el = h('button.rs-pd-kenar-yumurta', { type: 'button', 'aria-label': MALZEME_ADI.yumurta }, resimYa('alet/yumurta', 'yumurta'));
      const k = kenarNokta();
      el.style.transform = `translate(${k.x}px,${k.y}px)`;
      eldeKat.append(el);
      kenardaki = el;
      yumurtaVur(el, 0, k.x, k.y);
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        kenardakiVur();
      });
      durumGuncelle();
    },
  });
  const kenarNokta = () => ({ x: px + hamur.en * r0 * 0.7, y: py - hamur.boy * r0 * 0.75 });
  function kenardakiVur() {
    if (!kenardaki) return;
    const k = kenarNokta();
    if (yumurtaVur(kenardaki, 0, k.x, k.y)) {
      kenardaki.remove();
      kenardaki = null;
    }
  }
  for (const o of rafOgeleri) {
    if (o.tur === 'yumurta') continue;
    surukle(o.el, kok, {
      basla: (x, y) => {
        if (faz !== 'hamur' || yer !== 'tezgah') return false;
        elde.al(o.el, x, y);
      },
      hareket: (x, y) => elde.tasi(x, y),
      birak: (x, y) => {
        elde.birak();
        if (o.tur === 'un') unSerp(x, y - YUKARI);
        else koy(o.tur, x, y - YUKARI, { x, y: y - YUKARI });
      },
      dokun: () => {
        elde.birak();
        if (faz !== 'hamur' || yer !== 'tezgah') return;
        ezil(o.el, 1.3);
        if (o.tur === 'un') return unSerp();
        const a = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * 0.6;
        koy(o.tur, px + Math.cos(a) * r * hamur.en * r0, py + Math.sin(a) * r * hamur.boy * r0, merkez(o.el, kok));
      },
    });
  }

  // kenar kıvırma (5-6): hamurun kenarına iki dokunuş
  let kenarDokunus = 0;
  pide.addEventListener('pointerdown', (e) => {
    if (faz !== 'hamur' || yer !== 'tezgah' || kivrik) return;
    const kr = kok.getBoundingClientRect();
    const x = e.clientX - kr.left - px;
    const y = e.clientY - kr.top - py;
    if (!kenardaMi(x, y, hamur, r0)) return void ezil(hamurEl, 0.4, 120);
    e.preventDefault();
    kenarDokunus++;
    b.ses.cal('tik', { perde: 0.8 + kenarDokunus * 0.1 });
    ezil(pide, 0.5, 140);
    if (kenarDokunus >= KENAR_DOKUNUS) kenarKivir();
  });
  function kenarKivir() {
    if (kivrik) return;
    kivrik = true;
    pideCiz();
    b.ses.cal('hop', { perde: 1.2 });
    hopla(pide, 6, 260);
    olay('kenar');
    if (!konusuyorMu()) void b.mino.soyle(M.kenar);
    durumGuncelle();
  }

  // ------------------------------------------------------------ fırın küreği
  function kurekKoy(x: number, y: number) {
    kurek.style.transform = `translate(${x}px,${y}px)`;
  }
  /** fırın önünde küreğin dinlendiği yer: ağzın altında */
  const firinOnu = () => ({ x: agizYer.x, y: Math.min(H - 70, agizYer.y + agizYer.h * 1.6) });
  function kurekDinlen() {
    if (faz === 'hamur') kurekKoy(kurekYer.x, kurekYer.y);
    else if (faz === 'firin') {
      const f = firinOnu();
      kurekKoy(f.x, f.y);
    } else kurekKoy(W + 200, H);
    if (faz === 'firin' && yer === 'kurek') profilCiz();
  }
  let kurekBas = { x: 0, y: 0 };
  surukle(kurek, kok, {
    basla: (x, y) => {
      if (faz === 'sunum') return false;
      tutulan = 'kurek';
      kurek.classList.add('rs-tutuluyor');
      kurekBas = { x, y };
      b.ses.cal('tik', { guc: 0.3, perde: 0.6 });
    },
    hareket: (x, y) => {
      if (faz === 'hamur') {
        kurekKoy(x, y - 10);
        return;
      }
      // fırında: kürek yalnız ağza doğru (yukarı-aşağı) gider
      const f = firinOnu();
      const ky = Math.max(agizYer.y, Math.min(f.y + 40, f.y + (y - kurekBas.y)));
      kurekKoy(f.x, ky);
      if (yer === 'kurek') profilCiz(ky);
      // boş kürek ağza girdi: pide küreğe biner
      if (yer === 'firin' && ky <= agizYer.y + agizYer.h * 0.2) pideKurege();
    },
    birak: (x, y) => kurekBirak(x, y),
    dokun: () => kurekDokun(),
  });
  function kurekBirak(x: number, y: number) {
    tutulan = null;
    kurek.classList.remove('rs-tutuluyor');
    if (faz === 'hamur') {
      if (hamurda(x - px, y - 10 - py, hamur, r0, 1.05)) return firinaGec();
      kurekDinlen();
      return;
    }
    const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(kurek.style.transform);
    const ky = m ? +m[2] : firinOnu().y;
    if (yer === 'kurek' && ky <= agizYer.y + agizYer.h * 0.35) return firinaBirak();
    if (yer === 'kurek' && pisti) return disariAl();
    kurekDinlen();
    if (yer === 'kurek') profilCiz();
  }
  function kurekDokun() {
    tutulan = null;
    kurek.classList.remove('rs-tutuluyor');
    if (faz === 'hamur') return firinaGec();
    // 3-4 yolu: kürek kendisi ağza gider; pide içerideyse alıp çıkar
    const f = firinOnu();
    if (yer === 'kurek') {
      kurekKoy(f.x, agizYer.y);
      profilCiz(agizYer.y);
      window.setTimeout(() => firinaBirak(), TEST_MODU ? 20 : 260);
    } else if (yer === 'firin') {
      kurekKoy(f.x, agizYer.y);
      window.setTimeout(
        () => {
          pideKurege();
          kurekKoy(f.x, f.y);
          profilCiz(f.y);
          window.setTimeout(() => disariAl(), TEST_MODU ? 20 : 300);
        },
        TEST_MODU ? 20 : 260,
      );
    }
  }

  // tezgâhtan fırına: pide küreğe biner, kamera kayar (büyütme yok)
  function firinaGec() {
    if (faz !== 'hamur') return;
    if (kenardaki) {
      kenardaki.remove();
      kenardaki = null;
    }
    if (!kivrik && yas === 'kucuk') kenarKivir();
    yer = 'kurek';
    faz = 'firin';
    olay('kurege');
    p5Ses.kay();
    const c = merkez(kurek, kok);
    void ucur(kurek, px - c.x, py - c.y, 260, -10).then(() => {
      if (kapandi) return;
      kok.dataset.faz = 'firin';
      pide.hidden = true;
      kurek.dataset.yon = 'dikey';
      kurekDinlen();
      kurek.getAnimations().forEach((a) => a.cancel());
      profil.hidden = false;
      profilCiz();
      durumGuncelle();
    });
  }
  function firinaBirak() {
    yer = 'firin';
    olay('firinda');
    p5Ses.kay();
    b.dokunsal(TITRESIM.kesim);
    profilCiz();
    kurekDinlen();
    void b.mino.tepki('zipla', 700);
    if (!konusuyorMu()) void b.mino.soyle(M.firinda);
    durumGuncelle();
  }
  function pideKurege() {
    if (yer !== 'firin') return;
    yer = 'kurek';
    b.ses.cal('tok', { guc: 0.4, perde: 0.8 });
    olay('kurekteki');
  }
  let pisti = false;
  function disariAl() {
    if (yer !== 'kurek' || faz !== 'firin') return;
    yer = 'disari';
    faz = 'sunum';
    olay('cikti');
    p5Ses.kay();
    kok.dataset.faz = 'sunum';
    profil.hidden = true;
    kurekDinlen();
    sunumKur();
    durumGuncelle();
  }

  // önden pide (fırında ve kürekte): kenardan görünüş, kabarır, renk değişir
  function profilCiz(kurekY?: number) {
    const en = Math.min(agizYer.w * 0.82, hamur.en * r0 * 1.6);
    const kb = kabarma(p);
    const yuk = 12 + kb * 14 + Math.min(10, toplamMalzeme() * 0.5);
    let y: number;
    if (yer === 'firin') y = agizYer.y + agizYer.h * 0.32;
    else {
      const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(kurek.style.transform);
      y = (kurekY ?? (m ? +m[2] : firinOnu().y)) - 8;
    }
    profil.style.cssText = `left:${agizYer.x - en / 2}px;top:${y - yuk}px;width:${en}px;height:${yuk}px`;
    profil.dataset.pisme = pidePisme(p);
    profil.dataset.yer = yer;
    profil.style.setProperty('--malzeme', String(Math.min(1, toplamMalzeme() / 20)));
  }

  // ------------------------------------------------------------ zaman: fırın pişirir
  let sonT = performance.now();
  let sonPisme = pidePisme(p);
  let sonCitirti = 0;
  let sonBuhar = 0;
  const zaman = window.setInterval(() => {
    const t = performance.now();
    const sn = (t - sonT) / 1000;
    sonT = t;
    if (yer !== 'firin') return;
    p = firinPis(p, sn * (TEST_MODU && new URLSearchParams(location.search).has('hizli') ? 8 : 1));
    profilCiz();
    if (t - sonCitirti > (TEST_MODU ? 400 : 380 + Math.random() * 500)) {
      sonCitirti = t;
      p5Ses.citirti();
    }
    if (p >= 1 && t - sonBuhar > (TEST_MODU ? 400 : 1100)) {
      sonBuhar = t;
      sac(kok, agizYer.x + (Math.random() - 0.5) * agizYer.w * 0.5, agizYer.y - agizYer.h * 0.3, 'buhar', '#fff', 1, { yon: -Math.PI / 2, yay: 0.6, guc: 0.5 });
    }
    const pd = pidePisme(p);
    if (pd !== sonPisme) {
      sonPisme = pd;
      pisti = p >= 1;
      olay(`pisme-${pd}`);
      if (pd === 'az' && !konusuyorMu()) void b.mino.soyle(M.kabardi);
      if (pd === 'altin') {
        b.ses.cal('ting');
        parilti(kok, agizYer.x, agizYer.y, 6, agizYer.w * 0.35);
        void b.mino.tepki('sevin', 900);
        if (!konusuyorMu()) void b.mino.soyle(M.altin);
      }
      if (pd === 'citir') {
        b.ses.cal('kitir');
        if (!konusuyorMu()) void b.mino.soyle(M.citir);
      }
      durumGuncelle();
    }
  }, 120);
  pisti = p >= 1;

  // ------------------------------------------------------------ ödül: dilimler, peynir uzar
  interface Dilim {
    el: HTMLElement;
    i: number;
  }
  const dilimler: Dilim[] = [];
  const DILIM = 5;
  let peynirVar = false;
  let uzadiDendi = false;
  let koptu = 0;
  function sunumKur() {
    peynirVar = (sayac.kasar ?? 0) > 0;
    // pide tezgâhta yeniden çizilir (pişmiş renk, delik kalp, eriyen peynir); dilimlere ayrılır
    pide.hidden = false;
    pide.classList.add('rs-pd-pismis');
    pideCiz();
    pide.hidden = true;
    dilimKat.hidden = false;
    dilimKat.replaceChildren();
    const rx = hamur.en * r0;
    const ry = hamur.boy * r0;
    const w = (rx * 2) / DILIM;
    for (let i = 0; i < DILIM; i++) {
      const kopya = pide.cloneNode(true) as HTMLElement;
      kopya.hidden = false;
      kopya.style.cssText = `left:${-i * w}px;top:0;width:${rx * 2}px;height:${ry * 2}px`;
      const el = h('div.rs-pd-dilim', { 'data-i': String(i) }, kopya);
      el.style.cssText = `left:${px - rx + i * w}px;top:${py - ry}px;width:${w + 0.5}px;height:${ry * 2}px`;
      dilimKat.append(el);
      dilimler.push({ el, i });
      dilimSurukle({ el, i });
    }
    b.ses.cal('pof');
    sac(kok, px, py - ry * 0.4, 'buhar', '#fff', 6, { yon: -Math.PI / 2, yay: 1.4, guc: 0.8, boy: 40 });
    void b.mino.tepki('sevin', 1200);
    void b.mino.soyle(delikHesap(hamur, yas) > 0 ? M.kalp : M.cikti);
    if (delikHesap(hamur, yas) > 0) olay('kalp');
    b.tepsi.hopla();
  }
  function dilimSurukle(dl: Dilim) {
    let dx = 0;
    let dy = 0;
    let tut = { x: 0, y: 0 };
    let koptuBu = false;
    surukle(dl.el, kok, {
      basla: (x, y) => {
        if (odulde) return false;
        dl.el.classList.add("rs-tutuluyor");
        const c0 = dilimMerkez(dl);
        tut = { x: x - c0.x, y: y - c0.y };
        koptuBu = false;
        b.ses.cal('tik', { guc: 0.3 });
      },
      hareket: (x, y) => {
        const c0 = dilimMerkez(dl);
        dx = x - c0.x - tut.x;
        dy = y - c0.y - tut.y;
        dl.el.style.transform = `translate(${dx}px,${dy}px)`;
        if (!koptuBu) ipCiz(dl, dx, dy);
        const uz = Math.hypot(dx, dy);
        if (peynirVar && uz > 50 && !uzadiDendi) {
          uzadiDendi = true;
          olay('peynirUzadi');
          void b.mino.tepki('sevin', 1000);
          void b.mino.soyle(M.uzadi);
        }
        if (peynirVar && !koptuBu && uz > Math.max(130, r0 * 2.1)) {
          koptuBu = true;
          ipKopar(dl, dx, dy);
        }
      },
      birak: () => dilimGeri(dl),
      dokun: () => {
        // dokunuşta dilim biraz kalkar, peynir uzar ve geri döner
        const c0 = dilimMerkez(dl);
        let t = 0;
        const z = window.setInterval(() => {
          t++;
          const k = Math.sin((t / 12) * Math.PI);
          dl.el.style.transform = `translate(0,${-k * 60}px)`;
          ipCiz(dl, 0, -k * 60);
          if (t >= 12) {
            clearInterval(z);
            dilimGeri(dl);
          }
        }, TEST_MODU ? 5 : 30);
        zamanlar.push(z);
        void c0;
        if (peynirVar && !uzadiDendi) {
          uzadiDendi = true;
          olay('peynirUzadi');
          void b.mino.soyle(M.uzadi);
        }
      },
    });
  }
  const dilimMerkez = (dl: Dilim) => {
    const rx = hamur.en * r0;
    const w = (rx * 2) / DILIM;
    return { x: px - rx + dl.i * w + w / 2, y: py };
  };
  /** Peynir ipleri: dilimin iki kenarından komşu dilime (kodla, SVG yay) */
  const ipler = new Map<number, SVGPathElement[]>();
  function ipCiz(dl: Dilim, dx: number, dy: number) {
    const svg = ipSvg.firstElementChild as SVGSVGElement;
    let yollar = ipler.get(dl.i);
    if (!peynirVar) return;
    if (!yollar) {
      yollar = [];
      for (let k = 0; k < 8; k++) {
        const yol = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        yol.setAttribute('class', k % 2 ? 'rs-pd-ip-ic' : 'rs-pd-ip-dis');
        svg.append(yol);
        yollar.push(yol);
      }
      ipler.set(dl.i, yollar);
    }
    const rx = hamur.en * r0;
    const ry = hamur.boy * r0;
    const w = (rx * 2) / DILIM;
    const sol = px - rx + dl.i * w;
    const uz = Math.hypot(dx, dy);
    const kal = Math.max(1.4, 7 - uz / 26);
    for (let k = 0; k < 4; k++) {
      const yy = py - ry * 0.45 + k * ry * 0.3;
      // komşu kenar: sol ya da sağ (dilimin hangi yana çekildiğine göre ikisi de)
      const kenarX = k % 2 ? sol : sol + w;
      if ((k % 2 && dl.i === 0) || (!(k % 2) && dl.i === DILIM - 1)) {
        yollar[k * 2].setAttribute('d', '');
        yollar[k * 2 + 1].setAttribute('d', '');
        continue;
      }
      const x2 = kenarX + dx;
      const y2 = yy + dy;
      const sark = 10 + uz * 0.25;
      const d = `M${kenarX} ${yy} Q${(kenarX + x2) / 2} ${(yy + y2) / 2 + sark} ${x2} ${y2}`;
      yollar[k * 2].setAttribute('d', d);
      yollar[k * 2].style.strokeWidth = String(kal + 2);
      yollar[k * 2 + 1].setAttribute('d', d);
      yollar[k * 2 + 1].style.strokeWidth = String(kal);
    }
  }
  function ipTemizle(dl: Dilim) {
    for (const y of ipler.get(dl.i) ?? []) y.remove();
    ipler.delete(dl.i);
  }
  function ipKopar(dl: Dilim, dx: number, dy: number) {
    if (!ipler.has(dl.i)) return;
    ipTemizle(dl);
    koptu++;
    olay('peynirKoptu');
    for (let i = 0; i < 4; i++) window.setTimeout(() => p5Ses.ip(i), TEST_MODU ? 0 : i * 50);
    const c = dilimMerkez(dl);
    sac(kok, c.x + dx / 2, c.y + dy / 2, 'damla', '#FFE07A', 5, { guc: 0.5, boy: 6 });
    if (koptu === 1) {
      b.tepsi.hopla();
      parilti(kok, c.x + dx, c.y + dy, 5, 30);
    }
  }
  function dilimGeri(dl: Dilim) {
    dl.el.classList.remove('rs-tutuluyor');
    const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(dl.el.style.transform);
    const x = m ? +m[1] : 0;
    const y = m ? +m[2] : 0;
    ipTemizle(dl);
    try {
      dl.el.animate([{ transform: `translate(${x}px,${y}px)` }, { transform: 'translate(0,0) scale(1.03,0.97)', offset: 0.8 }, { transform: 'none' }], { duration: TEST_MODU ? 20 : 260, easing: 'ease-out' });
    } catch {
      /* yok say */
    }
    dl.el.style.transform = '';
    b.ses.cal('pof', { guc: 0.4, perde: 1.4 });
  }

  // ------------------------------------------------------------ ipucu
  function durumGuncelle(ipucuDa = true) {
    kok.dataset.durum = JSON.stringify(ozet());
    if (ipucuDa) ipucuGuncelle();
  }
  function ipucuGuncelle() {
    if (odulde) return b.ipucu.hedef(null);
    if (faz === 'hamur') {
      if (kenardaki) return b.ipucu.hedef({ el: () => kenardaki, hareket: 'dokun' });
      if (sekilHesap(hamur) === 'top') return b.ipucu.hedef({ el: () => merdaneEl, soz: M.ipucu.top, hareket: 'kaydir-yatay' });
      if (!parcalar.length) return b.ipucu.hedef({ el: () => kasarRaf, soz: M.ipucu.bos, hareket: 'surukle', nereye: () => pide });
      if (yas === 'buyuk' && !kivrik) return b.ipucu.hedef({ el: () => pide, soz: M.ipucu.kenar, hareket: 'dokun' });
      return b.ipucu.hedef({ el: () => kurek, soz: M.ipucu.firin, hareket: 'surukle', nereye: () => pide });
    }
    if (faz === 'firin') {
      if (yer === 'kurek' && !pisti) return b.ipucu.hedef({ el: () => kurek, soz: M.ipucu.firin, hareket: 'surukle', nereye: () => agiz });
      if (yer === 'firin' && !pisti) return b.ipucu.hedef(null);
      return b.ipucu.hedef({ el: () => kurek, soz: M.ipucu.pisiyor, hareket: 'surukle', nereye: () => agiz });
    }
    if (peynirVar && !koptu) return b.ipucu.hedef({ el: () => dilimler[2]?.el ?? null, soz: M.ipucu.peynir, hareket: 'surukle' });
    b.ipucu.hedef({ el: () => b.tepsi.el, soz: M.ipucu.bitti, hareket: 'dokun' });
  }

  // ------------------------------------------------------------ ürün, ödül anı, arka plan
  function urunYap(): Urun {
    const malzemeler: YemekOzelligi['malzemeler'] = {};
    for (const [m, n] of Object.entries(sayac)) if (n) malzemeler[m as Malzeme] = { adet: m === 'kasar' ? Math.max(1, Math.round(n * 3)) : Math.round(n), rende: m === 'kasar' || undefined, kesim: m === 'sucuk' ? 'dilim' : m === 'biber' ? 'serit' : m === 'domates' ? 'kup' : undefined };
    const ozellik: YemekOzelligi = { malzemeler, pisme: pidePisme(p), sicak: p >= 1, porsiyon: pidePorsiyon(toplamMalzeme(), hamur) };
    const dl = delikHesap(hamur, yas);
    const hm = { ...hamur };
    const ps = parcalar.map((x) => ({ ...x }));
    const pisme = pidePisme(p);
    return {
      id: urunId('pide'),
      tur: 'pide',
      yemek: 'pide',
      servis: true,
      ozellik,
      kullanilan: kullanilan.slice(),
      gorsel: () => pideGorsel(hm, ps, pisme, dl),
      pide: { sekil: sekilHesap(hamur), delik: dl > 0, kivrik },
    } as Urun & { pide: { sekil: string; delik: boolean; kivrik: boolean } };
  }
  let odulde = false;
  let kapandi = false;
  let coz: (u: Urun[]) => void = () => undefined;
  const bittiSoz = new Promise<Urun[]>((r) => (coz = r));
  b.tepsi.dinle(() => {
    if (odulde) return;
    // hiçbir şey yapılmadıysa tepsiye bir şey gitmez
    if (faz === 'hamur' && sekilHesap(hamur) === 'top' && !parcalar.length) return coz([]);
    odulde = true;
    b.ipucu.hedef(null);
    olay('odul');
    b.ses.cal('ting');
    const u = urunYap();
    const el = faz === 'sunum' ? dilimKat : faz === 'firin' ? profil : pide;
    const c = merkez(el, kok);
    parilti(kok, c.x, c.y, 7, 60);
    sac(kok, c.x, c.y - 20, 'buhar', '#fff', 4, { yon: -Math.PI / 2, yay: 1.2, guc: 0.6, boy: 34 });
    window.setTimeout(
      () => {
        const t = merkez(b.tepsi.el, kok);
        void ucur(el, t.x - c.x, t.y - c.y, 420, -40).then(() => coz([u]));
      },
      TEST_MODU ? 20 : 700,
    );
  });

  function ozet() {
    return { faz, yer, hamur: { en: +hamur.en.toFixed(2), boy: +hamur.boy.toFixed(2) }, sekil: sekilHesap(hamur), delik: +delikHesap(hamur, yas).toFixed(2), kivrik, parca: parcalar.length, sayac, p: +p.toFixed(2), pisme: pidePisme(p), koptu };
  }
  (window as unknown as { __rsPide?: unknown }).__rsPide = {
    olaylar,
    durum: ozet,
    merkez: () => ({ px, py, r0, agiz: agizYer, kurek: merkez(kurek, kok), merdane: merkez(merdaneEl, kok) }),
    pisir: (sn: number) => {
      p = firinPis(p, sn);
      sonT = performance.now();
    },
  };
  if (onceki) {
    kok.dataset.faz = 'firin';
    pide.hidden = true;
    kurek.dataset.yon = 'dikey';
    profil.hidden = false;
  }
  yerlestir();
  durumGuncelle();

  return {
    bitti: bittiSoz,
    arkaPlanda(): ArkaIs | null {
      if (faz !== 'firin' || yer !== 'firin' || odulde) return null;
      const durum: PideKayit = JSON.parse(JSON.stringify({ hamur, parcalar, kivrik, p, kullanilan, t: performance.now() }));
      return {
        durum,
        isaret: () => {
          const pp = firinPis(durum.p, (performance.now() - durum.t) / 1000);
          return { ses: 'yok', buhar: pp >= 1, pisme: pidePisme(pp) };
        },
      };
    },
    kapat() {
      kapandi = true;
      ro?.disconnect();
      clearInterval(zaman);
      zamanlar.forEach((z) => clearInterval(z));
      kok.remove();
    },
  };
}
