/**
 * SAR (mermer tezgâh) · sigara böreği. ekip/senaryo/RESTORAN.md §8 M16 (v1.1), §3c.
 *
 * Mermerde yufka üçgeni; rafta peynir, maydanoz ve su kâseleri. Yanda kızgın yağlı tava.
 *   - Peynir kâsesini yufkanın geniş kenarı boyunca gezdir: peynir çizgisi uzar (dokununca kendisi bir çizgi koyar).
 *     Maydanoz serpilir.
 *   - Yufkayı yukarı kaydır: rulo olur (3-4: iki, 5-6: dört kaydırma; 3-4'te dokunuş da bir adım).
 *   - Ucuna su: yapışır, parlar; rulo yandaki tabağa kayar, yeni yufka gelir.
 *   - ÇOK PEYNİR (komik): rulo kapanırken peynir iki uçtan fışkırır; börek yine pişer, yenir.
 *   - Ruloyu tavaya götür (ya da dokun): cızzz, kabarcıklar, çiğ → az → altın → çıtır (kömür yok). Tavadaki ruloya
 *     dokununca tabağa çıkar. Tava ocakta kendi pişirir (geri çıkılınca arkaPlanda).
 *   - Ödül: börekler tabakta dizilir, maydanoz yaprağı, parıltı; tabak tepsiye (masaya servis).
 * Not (P3): Kızart mini oyunu 'borek-cig' kabul edince kızartma oradan da yapılabilir; şimdilik tava bu oyunda.
 */
import { konusuyorMu } from '../../../../src/audio/ses';
import { h, TEST_MODU } from '../../../../src/ui/dom';
import metin from '../../../../content/restoran/mini-sar.json';
import { MALZEME_ADI, urunId, type ArkaIs, type MiniBaglam, type MiniGirdi, type MiniOturum, type MiniOyun, type Urun } from '../arayuz';
import { ezil, hopla, kipirda, parilti, sac, TITRESIM, ucur } from '../dogra/efekt';
import { surukle } from '../dogra/surukle';
import { Elde, merkez, olayci, rafOge, rafYerlestir, YUKARI, type RafOge } from '../kir-cirp/ortak';
import { p6Ses } from '../yogur/ortak';
import { borekOzelligi, kizart, PEYNIR_COK, peynirKoy, pismeAdi, ruloYap, suSur, yeniBorek, type Borek } from './mantik';
import './sar.css';

const M = metin.mino;
type RafTur = 'peynir' | 'maydanoz' | 'su';

export const oyun: MiniOyun = {
  ad: 'sar',
  istasyon: 'mermer',
  simge: () => h('span.rs-sr-simge', {}, ruloEl(yeniBorek())),
  baslat: (b, g) => sarBaslat(b, g),
};

/** Bir rulo (üstten): kutusunu doldurur */
export function ruloEl(br: Borek): HTMLElement {
  return h('i.rs-sr-rulo', { 'data-pisme': pismeAdi(br.p), 'data-fiskirdi': br.fiskirdi ? '1' : '' }, h('b.rs-sol'), h('b.rs-sag'));
}
/** Tabakta börekler */
export function borekTabakGorsel(bs: Borek[]): HTMLElement {
  const el = h('span.rs-sr-tabak-gorsel', {}, h('i.rs-sr-yaprak'));
  bs.forEach((br, i) => {
    const e = ruloEl(br);
    e.style.cssText = `position:absolute;left:18%;right:18%;height:14%;top:${24 + i * (48 / Math.max(1, bs.length - 1 || 1))}%`;
    el.append(e);
  });
  return el;
}

interface SarKayit {
  bitmis: Borek[];
  yagdakiler: number[];
  t: number;
}

function sarBaslat(b: MiniBaglam, g: MiniGirdi): MiniOturum {
  const yas = g.yas;
  const kok = h('div.rs-p5-oyun.rs-sar', { 'data-yas': yas });
  const { olaylar, olay } = olayci(kok);
  let kapandi = false;
  const zamanlar: number[] = [];
  const zaman = (f: () => void, ms: number) => zamanlar.push(window.setTimeout(f, TEST_MODU ? Math.min(ms, 30) : ms));
  const EN_COK = yas === 'kucuk' ? 3 : 4;
  const onceki = g.devam as SarKayit | undefined;

  // ------------------------------------------------------------ DOM
  const raf = h('div.rs-p5-raf');
  const mermer = h('div.rs-sr-mermer');
  const yufkaKat = h('div.rs-sr-yufka-kat');
  const tava = h('div.rs-sr-tava', {}, h('i.rs-sr-tava-sap'), h('i.rs-sr-tava-govde'), h('i.rs-sr-yag'));
  const tabak = h('div.rs-sr-tabak');
  const ruloKat = h('div.rs-sr-rulolar');
  const eldeKat = h('div.rs-sr-elde-kat');
  const efektKat = h('div.rs-sr-efekt');
  kok.append(mermer, tava, tabak, yufkaKat, ruloKat, raf, efektKat, eldeKat);
  b.kok.append(kok);
  const elde = new Elde(eldeKat, kok);
  const rafOgeleri: RafOge<RafTur>[] = [];
  const kase = (tur: RafTur) => h('span.rs-sr-kase', { 'data-tur': tur }, h('b'));
  rafOge(raf, rafOgeleri, 'peynir', kase('peynir'), MALZEME_ADI.peynir);
  rafOge(raf, rafOgeleri, 'maydanoz', kase('maydanoz'), MALZEME_ADI.maydanoz);
  const suRaf = rafOge(raf, rafOgeleri, 'su', kase('su'), 'Su');

  // ------------------------------------------------------------ yerleşim
  let my = { x: 0, y: 0, w: 0, h: 0 };
  let yf = { x: 0, y: 0, w: 0, h: 0 };
  let tv = { x: 0, y: 0, r: 0 };
  let tb = { x: 0, y: 0, w: 0, h: 0 };
  let ruloW = 120;
  function yerlestir() {
    const W = kok.clientWidth;
    const H = kok.clientHeight;
    if (!W || !H) return;
    const yatay = W >= H;
    kok.dataset.yon = yatay ? 'yatay' : 'dikey';
    const rafAlt = rafYerlestir(kok, raf, yatay);
    if (yatay) {
      const x0 = Math.max(118, W * 0.14);
      my = { x: x0, y: rafAlt + 8, w: W * 0.46, h: H - rafAlt - 18 };
      const sagX = my.x + my.w + 16;
      const sagW = W - sagX - 14;
      tv = { x: sagX + sagW / 2, y: rafAlt + 10 + Math.min(sagW * 0.36, (H - rafAlt) * 0.3), r: Math.min(sagW * 0.36, (H - rafAlt) * 0.3) };
      tb = { x: sagX + 8, y: tv.y + tv.r + 10, w: Math.min(sagW - 16 - Math.max(90, W * 0.14), sagW * 0.62), h: Math.max(64, H - (tv.y + tv.r + 10) - 12) };
    } else {
      my = { x: 14, y: rafAlt + 10, w: W - 28, h: Math.min(H * 0.38, W * 0.9) };
      tv = { x: W * 0.32, y: my.y + my.h + 16 + W * 0.22, r: W * 0.22 };
      tb = { x: W * 0.58, y: my.y + my.h + 20, w: W * 0.38, h: W * 0.3 };
    }
    yf = { x: my.x + my.w * 0.12, y: my.y + my.h * 0.1, w: my.w * 0.76, h: my.h * 0.8 };
    ruloW = yf.w * 0.62;
    mermer.style.cssText = `left:${my.x}px;top:${my.y}px;width:${my.w}px;height:${my.h}px`;
    tava.style.cssText = `left:${tv.x - tv.r}px;top:${tv.y - tv.r}px;width:${tv.r * 2}px;height:${tv.r * 2}px`;
    tabak.style.cssText = `left:${tb.x}px;top:${tb.y}px;width:${tb.w}px;height:${tb.h}px`;
    if (aktif) yufkaCiz();
    rulolariYerlestir();
  }
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => yerlestir()) : null;
  ro?.observe(kok);

  // ------------------------------------------------------------ yufka
  let aktif: { br: Borek; el: HTMLElement; peynirEl: HTMLElement; ruloEl: HTMLElement } | null = null;
  const bitmis: { br: Borek; el: HTMLElement; yer: 'tabak' | 'tava' }[] = [];
  function yeniYufka() {
    if (bitmis.length >= EN_COK) {
      aktif = null;
      return;
    }
    const br = yeniBorek();
    const peynirEl = h('i.rs-sr-peynir');
    const ruloE = ruloEl(br);
    ruloE.classList.add('rs-sr-sarilan');
    const el = h('div.rs-sr-yufka', { role: 'button', 'aria-label': 'Yufka' }, h('i.rs-sr-ucgen'), peynirEl, ruloE, h('i.rs-sr-uc'));
    yufkaKat.append(el);
    aktif = { br, el, peynirEl, ruloEl: ruloE };
    yufkaCiz();
    yufkaBagla();
    try {
      el.animate([{ transform: 'translateX(-60%) scale(0.8)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: TEST_MODU ? 20 : 360, easing: 'cubic-bezier(.3,.7,.4,1)' });
    } catch {
      /* yok say */
    }
    durumGuncelle();
  }
  function yufkaCiz() {
    if (!aktif) return;
    const { br, el, peynirEl, ruloEl: r } = aktif;
    el.style.cssText = `left:${yf.x}px;top:${yf.y}px;width:${yf.w}px;height:${yf.h}px`;
    el.style.setProperty('--rulo', br.rulo.toFixed(3));
    el.dataset.yapisti = br.yapisti ? '1' : '';
    el.dataset.rulo = br.rulo >= 1 ? 'tam' : br.rulo > 0 ? 'yarim' : '';
    peynirEl.style.setProperty('--peynir', String(Math.min(1, br.peynir)));
    peynirEl.dataset.cok = br.peynir >= PEYNIR_COK ? '1' : '';
    peynirEl.dataset.maydanoz = String(Math.min(4, br.maydanoz));
    r.style.opacity = br.rulo > 0 ? '1' : '0';
    r.dataset.fiskirdi = br.fiskirdi ? '1' : '';
  }

  // yufka: yukarı kaydır → rulo; dokun (3-4) → bir adım; rulo bittiyse dokun → su (yapıştır)
  function yufkaBagla() {
    const a = aktif!;
    let y0 = 0;
    let adimY = 0;
    surukle(a.el, kok, {
      basla: (_x, y) => {
        if (aktif !== a) return false;
        y0 = y;
        adimY = y;
        ezil(a.el, 0.3, 120);
        p6Ses.fir(1.2);
      },
      hareket: (_x, y) => {
        if (aktif !== a) return;
        // her 34 px yukarı kaydırma bir rulo adımı
        if (adimY - y > 34) {
          adimY = y;
          ruloAdim();
        }
        void y0;
      },
      birak: () => undefined,
      dokun: () => {
        if (aktif !== a) return;
        if (a.br.rulo >= 1) return suyaBas();
        if (yas === 'kucuk') ruloAdim();
        else {
          kipirda(a.el, 3);
          p6Ses.fir(0.9);
        }
      },
    });
  }
  function ruloAdim() {
    const a = aktif;
    if (!a || a.br.rulo >= 1) return;
    const { bitti, fiskirdi } = ruloYap(a.br, yas);
    p6Ses.fir(1 + a.br.rulo * 0.3);
    b.dokunsal(TITRESIM.hafif);
    olay('rulo');
    yufkaCiz();
    if (olaylar.filter((o) => o === 'rulo').length === 1 && !konusuyorMu()) void b.mino.soyle(M.rulo);
    if (fiskirdi) peynirFiskir();
    if (bitti) olay('ruloBitti');
    durumGuncelle();
  }
  /** Komik: çok peynir, rulo kapanırken iki uçtan fışkırır */
  function peynirFiskir() {
    olay('fiskirdi');
    const r = aktif!.ruloEl.getBoundingClientRect();
    const k = kok.getBoundingClientRect();
    const y = r.top - k.top + r.height / 2;
    sac(kok, r.left - k.left, y, 'damla', '#FFF8E6', 7, { yon: Math.PI, yay: 0.9, guc: 1.3, boy: 11 });
    sac(kok, r.right - k.left, y, 'damla', '#FFF8E6', 7, { yon: 0, yay: 0.9, guc: 1.3, boy: 11 });
    p6Ses.slop();
    b.ses.cal('vicik', { perde: 1.3 });
    void b.mino.tepki('sasir', 900);
    zaman(() => {
      void b.mino.tepki('sevin', 900);
      if (!konusuyorMu()) void b.mino.soyle(M.fiskirdi);
    }, 500);
  }
  function suyaBas() {
    const a = aktif;
    if (!a) return;
    if (!suSur(a.br)) {
      kipirda(suRaf, 3);
      return;
    }
    olay('yapisti');
    b.ses.cal('siril', { guc: 0.3, perde: 1.4 });
    p6Ses.gicir();
    yufkaCiz();
    const r = merkez(a.ruloEl, kok);
    parilti(kok, r.x, r.y, 5, r.w * 0.4);
    if (!olaylar.slice(0, -1).includes('yapisti') && !konusuyorMu()) void b.mino.soyle(M.yapisti);
    // rulo tabağa kayar, yeni yufka gelir
    zaman(() => {
      if (kapandi || aktif !== a) return;
      const e = ruloEl(a.br);
      ruloKat.append(e);
      const kayit = { br: a.br, el: e, yer: 'tabak' as const };
      bitmis.push(kayit);
      ruloBagla(kayit);
      rulolariYerlestir();
      const hedef = merkez(e, kok);
      try {
        e.animate([{ transform: `translate(${r.x - hedef.x}px,${r.y - hedef.y}px)` }, { transform: 'none' }], { duration: TEST_MODU ? 20 : 380, easing: 'cubic-bezier(.3,.6,.4,1)' });
      } catch {
        /* yok say */
      }
      a.el.remove();
      aktif = null;
      zaman(() => yeniYufka(), 300);
      durumGuncelle();
    }, 500);
    durumGuncelle();
  }

  // ------------------------------------------------------------ raf: peynir, maydanoz, su
  const tabandaMi = (x: number, y: number) => x > yf.x - 10 && x < yf.x + yf.w + 10 && y > yf.y + yf.h * 0.62 && y < yf.y + yf.h + 24;
  const yufkadaMi = (x: number, y: number) => x > yf.x - 20 && x < yf.x + yf.w + 20 && y > yf.y - 20 && y < yf.y + yf.h + 20;
  for (const o of rafOgeleri) {
    const el = o.el;
    let sonX = 0;
    surukle(el, kok, {
      basla: (x, y) => {
        elde.al(el, x, y, 'rs-sr-elde');
        el.classList.add('rs-p5-tutuldu');
        sonX = x;
        b.ses.cal('hop', { perde: 1.1, guc: 0.35 });
      },
      hareket: (x, y) => {
        elde.tasi(x, y);
        const a = aktif;
        if (o.tur === 'peynir' && a && a.br.rulo === 0 && tabandaMi(x, y - YUKARI)) {
          const yol = Math.abs(x - sonX);
          if (yol > 2) {
            peynirKoy(a.br, yol / (yf.w * 0.9));
            if (Math.random() < 0.35) b.ses.cal('citir', { guc: 0.2, perde: 1.6 });
            yufkaCiz();
            olay('peynir');
          }
        }
        sonX = x;
      },
      birak: (x, y) => {
        el.classList.remove('rs-p5-tutuldu');
        elde.birak(el);
        const a = aktif;
        if (!a) return;
        if (o.tur === 'maydanoz' && yufkadaMi(x, y - YUKARI)) maydanozSerp();
        else if (o.tur === 'su' && yufkadaMi(x, y - YUKARI)) suyaBas();
        durumGuncelle();
      },
      dokun: () => {
        el.classList.remove('rs-p5-tutuldu');
        elde.birak();
        ezil(el, 1.3);
        const a = aktif;
        if (!a) return kipirda(el, 3);
        if (o.tur === 'peynir') {
          if (a.br.rulo > 0) return kipirda(el, 3);
          peynirKoy(a.br, a.br.peynir >= 1 ? 0.7 : 1);
          b.ses.cal('citir', { guc: 0.3, perde: 1.5 });
          yufkaCiz();
          olay('peynir');
          if (!olaylar.slice(0, -1).includes('peynir') && !konusuyorMu()) void b.mino.soyle(M.ad.peynir);
        } else if (o.tur === 'maydanoz') maydanozSerp();
        else suyaBas();
        durumGuncelle();
      },
    });
  }
  function maydanozSerp() {
    const a = aktif;
    if (!a) return;
    a.br.maydanoz = Math.min(4, a.br.maydanoz + 1);
    b.ses.cal('citir', { guc: 0.25, perde: 1.2 });
    yufkaCiz();
    olay('maydanoz');
    if (!olaylar.slice(0, -1).includes('maydanoz') && !konusuyorMu()) void b.mino.soyle(M.ad.maydanoz);
  }

  // ------------------------------------------------------------ rulolar: tabak ↔ tava
  function rulolariYerlestir() {
    const tabaktakiler = bitmis.filter((k) => k.yer === 'tabak');
    const tavadakiler = bitmis.filter((k) => k.yer === 'tava');
    const rh = Math.max(26, Math.min(42, ruloW * 0.24));
    const rw = Math.min(ruloW * 0.7, tb.w * 0.82);
    tabaktakiler.forEach((k, i) => {
      const y = tb.y + tb.h * 0.22 + i * (rh * 0.9);
      k.el.style.cssText = `left:${tb.x + (tb.w - rw) / 2}px;top:${y}px;width:${rw}px;height:${rh}px`;
    });
    const tw = tv.r * 1.2;
    tavadakiler.forEach((k, i) => {
      const y = tv.y - tv.r * 0.45 + i * (rh * 1.05);
      k.el.style.cssText = `left:${tv.x - tw / 2}px;top:${y}px;width:${tw}px;height:${rh}px`;
    });
  }
  function ruloBagla(k: { br: Borek; el: HTMLElement; yer: 'tabak' | 'tava' }) {
    k.el.setAttribute('role', 'button');
    surukle(k.el, kok, {
      basla: () => {
        if (odulde) return false;
        k.el.classList.add('rs-tutuluyor');
      },
      hareket: (x, y) => {
        k.el.style.left = `${x - k.el.offsetWidth / 2}px`;
        k.el.style.top = `${y - YUKARI - k.el.offsetHeight / 2}px`;
      },
      birak: (x, y) => {
        k.el.classList.remove('rs-tutuluyor');
        const tavada = Math.hypot(x - tv.x, y - YUKARI - tv.y) < tv.r * 1.05;
        yerDegis(k, tavada ? 'tava' : 'tabak');
      },
      dokun: () => {
        k.el.classList.remove('rs-tutuluyor');
        yerDegis(k, k.yer === 'tava' ? 'tabak' : 'tava');
      },
    });
  }
  function yerDegis(k: { br: Borek; el: HTMLElement; yer: 'tabak' | 'tava' }, yer: 'tabak' | 'tava') {
    const onceki_ = k.yer;
    k.yer = yer;
    k.br.yagda = yer === 'tava';
    if (yer === 'tava' && onceki_ !== 'tava') {
      b.ses.cal('ciz', { guc: 1 });
      sac(kok, tv.x, tv.y, 'damla', '#F7D774', 5, { guc: 0.8, boy: 6 });
      olay('yaga');
      if (!olaylar.slice(0, -1).includes('yaga') && !konusuyorMu()) void b.mino.soyle(M.ciz);
    } else if (yer === 'tabak' && onceki_ === 'tava') {
      b.ses.cal('pof', { guc: 0.5 });
      olay('tabaga');
    }
    rulolariYerlestir();
    durumGuncelle();
  }

  // ------------------------------------------------------------ zaman: kızartma
  let cizDongu: { guc(g: number): void; dur(): void } | null = null;
  let sonT = performance.now();
  let sonKabarcik = 0;
  const hizli = TEST_MODU && new URLSearchParams(location.search).has('hizli') ? 8 : 1;
  const zamanlayici = window.setInterval(() => {
    const t = performance.now();
    const sn = ((t - sonT) / 1000) * hizli;
    sonT = t;
    const yagda = bitmis.filter((k) => k.yer === 'tava');
    kizartAdimi(sn);
    tava.classList.toggle('rs-cizirdiyor', yagda.length > 0);
    if (yagda.length) {
      if (!cizDongu) cizDongu = b.ses.dongu('ciz');
      cizDongu.guc(Math.min(1, 0.35 + yagda.length * 0.15));
      if (t - sonKabarcik > 260) {
        sonKabarcik = t;
        const k = yagda[Math.floor(Math.random() * yagda.length)];
        const r = merkez(k.el, kok);
        sac(kok, r.x + (Math.random() - 0.5) * r.w, r.y + r.h * 0.5, 'kopuk', '#FFF3B8', 1, { yon: -Math.PI / 2, yay: 1.4, guc: 0.3, boy: 6 });
      }
    } else if (cizDongu) {
      cizDongu.dur();
      cizDongu = null;
    }
    durumGuncelle(false);
  }, 100);
  /** Tavadakiler sn saniye kızarır; renk değişiminde kıpırdar, altın ve çıtırda Mino söyler */
  function kizartAdimi(sn: number) {
    for (const k of bitmis.filter((x) => x.yer === 'tava')) {
      const once = pismeAdi(k.br.p);
      kizart(k.br, sn);
      const ad = pismeAdi(k.br.p);
      if (ad === once) continue;
      k.el.dataset.pisme = ad;
      kipirda(k.el, 3, 220);
      if (ad === 'altin' && !olaylar.includes('altin')) {
        olay('altin');
        b.ses.cal('ting', { guc: 0.6 });
        if (!konusuyorMu()) void b.mino.soyle(M.altin);
      }
      if (ad === 'citir' && !olaylar.includes('citir')) {
        olay('citir');
        if (!konusuyorMu()) void b.mino.soyle(M.citir);
      }
    }
  }

  // geri dönüşte tavadakiler ve tabaktakiler
  if (onceki) {
    const sn = (performance.now() - onceki.t) / 1000;
    onceki.bitmis.forEach((br, i) => {
      if (onceki.yagdakiler.includes(i)) kizart(br, sn);
      const e = ruloEl(br);
      ruloKat.append(e);
      const k = { br, el: e, yer: (br.yagda ? 'tava' : 'tabak') as 'tava' | 'tabak' };
      bitmis.push(k);
      ruloBagla(k);
    });
  }

  // ------------------------------------------------------------ doğal son, ipucu
  let hoplandi = false;
  const hazirMi = () => bitmis.length >= (yas === 'kucuk' ? 2 : 3) && bitmis.every((k) => k.br.p >= 2);
  function durumGuncelle(ipucuDa = true) {
    if (!hoplandi && hazirMi()) {
      hoplandi = true;
      b.tepsi.hopla();
      olay('dogalSon');
      void b.mino.tepki('sevin', 1000);
      if (!konusuyorMu()) void b.mino.soyle(M.hazir);
    }
    kok.dataset.durum = JSON.stringify(ozet());
    if (ipucuDa) ipucuGuncelle();
  }
  let sonIpucu = '';
  function ipucuGuncelle() {
    let anahtar = '';
    let hedef: Parameters<typeof b.ipucu.hedef>[0] = null;
    const a = aktif;
    const cig = bitmis.find((k) => k.yer === 'tabak' && k.br.p < 2);
    if (odulde) anahtar = 'odul';
    else if (cig && (!a || bitmis.length >= 2)) {
      anahtar = `yag-${bitmis.indexOf(cig)}`;
      hedef = { el: () => cig.el, soz: M.ipucu.yag, hareket: 'surukle', nereye: () => tava };
    } else if (a && a.br.peynir === 0 && a.br.rulo === 0) {
      anahtar = 'peynir';
      hedef = { el: () => rafOgeleri[0].el, soz: M.ipucu.peynir, hareket: 'surukle', nereye: () => a.el };
    } else if (a && a.br.rulo < 1) {
      anahtar = 'rulo';
      hedef = { el: () => a.el, soz: M.ipucu.rulo, hareket: 'kaydir-dik' };
    } else if (a && !a.br.yapisti) {
      anahtar = 'su';
      hedef = { el: () => suRaf, soz: M.ipucu.su, hareket: 'surukle', nereye: () => a.ruloEl };
    } else if (bitmis.some((k) => k.yer === 'tava')) {
      anahtar = 'pisiyor';
      hedef = { el: () => tava, soz: M.ipucu.pisiyor, hareket: 'dokun' };
    } else {
      anahtar = 'bitti';
      hedef = { el: () => b.tepsi.el, soz: M.ipucu.bitti, hareket: 'dokun' };
    }
    if (anahtar === sonIpucu) return;
    sonIpucu = anahtar;
    b.ipucu.hedef(hedef);
  }

  // ------------------------------------------------------------ ödül
  let odulde = false;
  let coz: (u: Urun[]) => void = () => undefined;
  const bittiSoz = new Promise<Urun[]>((r) => (coz = r));
  b.tepsi.dinle(() => {
    if (odulde) return;
    if (!bitmis.length) return coz([]);
    odulde = true;
    olay('odul');
    ipucuGuncelle();
    void (async () => {
      const bekle = (ms: number) => new Promise<void>((r) => window.setTimeout(r, TEST_MODU ? Math.min(ms, 20) : ms));
      // tavadakiler tabağa çıkar
      for (const k of bitmis) {
        k.yer = 'tabak';
        k.br.yagda = false;
      }
      rulolariYerlestir();
      p6Ses.ezgi([69, 72, 76, 81], 0.09);
      for (const k of bitmis) {
        hopla(k.el, 8, 260);
        p6Ses.tin(bitmis.indexOf(k));
        await bekle(150);
      }
      const t0 = merkez(tabak, kok);
      parilti(kok, t0.x, t0.y, 7, t0.w * 0.4);
      b.ses.cal('ting');
      await bekle(500);
      const snap = bitmis.map((k) => ({ ...k.br }));
      const u: Urun = { id: urunId('borek'), tur: 'borek', yemek: 'borek', servis: true, butun: true, ozellik: borekOzelligi(snap), gorsel: () => borekTabakGorsel(snap) };
      const t = merkez(b.tepsi.el, kok);
      await Promise.all([tabak, ...bitmis.map((k) => k.el)].map((e) => ucur(e, t.x - t0.x, t.y - t0.y, 380, -30)));
      coz([u]);
    })();
  });

  function ozet() {
    return {
      aktif: aktif ? { peynir: +aktif.br.peynir.toFixed(2), maydanoz: aktif.br.maydanoz, rulo: +aktif.br.rulo.toFixed(2), yapisti: aktif.br.yapisti, fiskirdi: aktif.br.fiskirdi } : null,
      bitmis: bitmis.map((k) => ({ yer: k.yer, p: +k.br.p.toFixed(2), pisme: pismeAdi(k.br.p), fiskirdi: k.br.fiskirdi })),
    };
  }
  (window as unknown as { __rsSar?: unknown }).__rsSar = {
    olaylar,
    durum: ozet,
    /** test: zamanı ileri sar (gerçek döngüyle aynı adım) */
    pisir: (sn: number) => {
      for (let i = 0; i < Math.ceil(sn * 4); i++) kizartAdimi(sn / Math.ceil(sn * 4));
      durumGuncelle();
    },
  };
  yerlestir();
  yeniYufka();

  return {
    bitti: bittiSoz,
    arkaPlanda(): ArkaIs | null {
      if (odulde || !bitmis.some((k) => k.yer === 'tava')) return null;
      const durum: SarKayit = { bitmis: bitmis.map((k) => ({ ...k.br })), yagdakiler: bitmis.map((k, i) => (k.yer === 'tava' ? i : -1)).filter((i) => i >= 0), t: performance.now() };
      return {
        durum,
        isaret: () => {
          const sn = (performance.now() - durum.t) / 1000;
          const p = Math.min(...durum.yagdakiler.map((i) => Math.min(3.6, durum.bitmis[i].p + sn * 0.5)));
          return { ses: 'ciz', buhar: true, pisme: pismeAdi(p) };
        },
      };
    },
    kapat() {
      kapandi = true;
      ro?.disconnect();
      clearInterval(zamanlayici);
      zamanlar.forEach((z) => clearTimeout(z));
      cizDongu?.dur();
      kok.remove();
    },
  };
}
