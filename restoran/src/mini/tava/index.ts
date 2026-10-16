/**
 * TAVA (ocak) · sotele, yumurta kır ve karıştır, pankek dök ve çevir. ekip/senaryo/RESTORAN.md §8 M6, §3c, §1d.
 *
 * Raftaki her şey gerçek bir seçim: tepsiden gelen doğranmış kâse(ler), yumurta, (pankekte) hamur, zeytinyağı, tuz,
 * pul biber. Her şey sürüklenerek ya da dokunarak kullanılır (3-4 yaş için dokunuş yolu hep var).
 *   - Yağ gezdir: şişe tavanın üstünde durdukça yağ akar (az ya da çok).
 *   - Sotele: kâse tavaya dökülür (cızzz! buhar), spatula tavada sağa sola sürülünce parçalar itilir, renk koyulaşır.
 *   - Yumurta: kenara iki kez vur (tık, çat), sarısı "pıt" diye düşer; çok sert vurursan kabuk tavaya düşer (kaygan:
 *     üçüncü dokunuşta çıkar, "Kaçıyor!"); yumurtayı bütün atarsan kendi kendine çatlar, kabuklar tavada. Spatulayla
 *     karıştır: az karışırsa iri, çok karışırsa ince.
 *   - Pankek: kepçe tavanın üstünde durdukça hamur yayılır (ne kadar tutarsan o kadar büyük). Kabarcıklanınca yukarı
 *     fiske: havada döner (%125'e kadar büyür, yaklaşma hissi), "pof" diye iner. 5-6'da çok güçlü fiske = tavana yapışır,
 *     3 sn sonra Mino'nun başına şapka olur, sonra tavaya döner.
 * Pişme rengi: çiğ, az, altın, çıtır (cızırtı sesi değişir). Altın anında parıltı + tereyağı kokusu dalgası. Kömür yok.
 * Tava ocakta kendi pişer: geri çıkılınca `arkaPlanda` pişmeye devam eder, dönünce kaldığı yerden.
 */
import { konusuyorMu } from '../../../../src/audio/ses';
import { h, TEST_MODU } from '../../../../src/ui/dom';
import metin from '../../../../content/restoran/mini-tava.json';
import { MALZEME_ADI, urunId, type ArkaIs, type Kesim, type Malzeme, type MalzemeDurumu, type MiniBaglam, type MiniGirdi, type MiniOturum, type MiniOyun, type Pisme, type Urun, type YemekOzelligi } from '../arayuz';
import { ezil, hopla, kipirda, parilti, sac, tak, TITRESIM, ucur } from '../dogra/efekt';
import { alet, parcaEl, yeni } from '../dogra/gorsel';
import type { Gorunum } from '../dogra/mantik';
import { surukle } from '../dogra/surukle';
import {
  cevir,
  cizirti,
  fiskeMi,
  fiskeSonucu,
  HIZ,
  kabarcikMi,
  karisimEkle,
  KARISTIR_PISME,
  kenaraVurdu,
  menemenBitti,
  pankekBitti,
  pankekPis,
  pankekPisme,
  pis,
  pismeAdi,
  porsiyon,
  SERT_VURUS,
  ustYuz,
  yeniPankek,
  yumurtaKesim,
  type Pankek,
} from './mantik';
import './tava.css';

const M = metin.mino;

/** Kesimden tavadaki parça görünümü */
const GOR: Record<Kesim, Gorunum> = { butun: 'kirpik', yarim: 'yarim', iri: 'kup', dilim: 'dilim', ince: 'dilim', kup: 'kup', serit: 'serit', cubuk: 'cubuk', kiyim: 'kiyim', pure: 'pure' };

interface Kaseli {
  id: string;
  ozellik: YemekOzelligi;
  ornek?: boolean;
}

/** Arka planda süren tavanın kaydı (dönüşte MiniGirdi.devam) */
interface TavaDurum {
  yag: number;
  malzemeler: Partial<Record<Malzeme, MalzemeDurumu>>;
  kullanilan: string[];
  p: number;
  yumurta: number;
  karisim: number;
  kabuk: number;
  pankek: Pankek | null;
  tuz: number;
  aci: number;
  /** son güncelleme (performance.now) */
  t: number;
}

/** Tabakla'nın tava ürününü yemek olarak (tavasız) çizmesi için ek bilgi */
export interface TavaUrunBilgi {
  tava: { pankek: { boy: number; pisme: Pisme } | null; parcalar: { m: Malzeme; g: Gorunum; n: number }[]; yumurta: number; karisim: number; pisme: Pisme };
}

export const oyun: MiniOyun = {
  ad: 'tava',
  istasyon: 'ocak',
  simge: () => {
    const u = alet('tava');
    return u ? h('img.rs-tv-simge', { src: u, alt: '', draggable: 'false' }) : h('span.rs-tv-simge-yt');
  },
  baslat: (b, g) => tavaBaslat(b, g),
};

function tavaBaslat(b: MiniBaglam, g: MiniGirdi): MiniOturum {
  const yas = g.yas;
  const olaylar: string[] = [];
  const kok = h('div.rs-tava', { 'data-yas': yas });
  const olay = (ad: string) => {
    olaylar.push(ad);
    kok.dataset.olay = ad;
  };
  const onceki = g.devam as TavaDurum | undefined;
  const d: TavaDurum = onceki
    ? { ...onceki, pankek: onceki.pankek ? { ...onceki.pankek, yuz: [...onceki.pankek.yuz] as [number, number], tavanda: false } : null }
    : { yag: 0, malzemeler: {}, kullanilan: [], p: 0, yumurta: 0, karisim: 0, kabuk: 0, pankek: null, tuz: 0, aci: 0, t: performance.now() };

  // raftaki kâseler: tepsiden (doğranmış ve henüz kullanılmamış); deneme sayfasında örnek kâse
  const kaseler: Kaseli[] = g.tepsi.filter((u) => !u.servis && u.tur !== 'tabak' && Object.keys(u.ozellik.malzemeler).length && !d.kullanilan.includes(u.id) && u.tur !== 'hamur').map((u) => ({ id: u.id, ozellik: u.ozellik }));
  const hamurUrun = g.tepsi.find((u) => u.tur === 'hamur' || u.tur === 'pankek-hamuru');
  if (!kaseler.length && !onceki && (g.tarif === 'menemen' || (!g.tarif && g.test !== false && !g.tepsi.length))) {
    kaseler.push({ id: 'ornek', ornek: true, ozellik: { malzemeler: { domates: { adet: 5, kesim: 'kup' }, biber: { adet: 3, kesim: 'serit' } } } });
  }
  const hamurVar = !!hamurUrun || g.tarif === 'pankek' || !g.tarif;

  // ------------------------------------------------------------ DOM
  const raf = h('div.rs-tv-raf');
  const tava = h('div.rs-tv-tava');
  const tavaResim = alet('tava');
  const tavaIc = h('div.rs-tv-ic');
  const yagEl = h('i.rs-tv-yag');
  const icerik = h('div.rs-tv-icerik');
  const resimKat = h('img.rs-tv-resim', { alt: '', draggable: 'false' }) as HTMLImageElement;
  const yumurtaKat = h('div.rs-tv-yumurta-kat');
  const pankekEl = h('div.rs-tv-pankek', { hidden: true }, h('i.rs-tv-pankek-yuz'), h('span.rs-tv-kabarcik', {}, h('i'), h('i'), h('i'), h('i'), h('i')));
  const kabukKat = h('div.rs-tv-kabuk-kat');
  tavaIc.append(yagEl, icerik, resimKat, yumurtaKat, pankekEl, kabukKat);
  if (tavaResim) tava.append(h('img.rs-tv-tava-resim', { src: tavaResim, alt: '', draggable: 'false' }));
  else tava.append(h('i.rs-tv-sap'), h('i.rs-tv-govde'));
  tava.append(tavaIc);
  const spatulaUrl = alet('spatula');
  const spatula = h('div.rs-tv-spatula', { role: 'button', 'aria-label': 'Spatula' }, spatulaUrl ? h('img', { src: spatulaUrl, alt: '', draggable: 'false' }) : h('i.rs-tv-spatula-yt'));
  const eldeKat = h('div.rs-tv-elde-kat');
  kok.append(tava, raf, spatula, eldeKat);
  b.kok.append(kok);

  // ------------------------------------------------------------ yerleşim
  let spatulaTutuluyor = false;
  let cx = 300;
  let cy = 220;
  let R = 120;
  let dinlenme = { x: 0, y: 0 };
  function yerlestir() {
    const W = kok.clientWidth;
    const H = kok.clientHeight;
    if (!W || !H) return;
    const yatay = W >= H;
    kok.dataset.yon = yatay ? 'yatay' : 'dikey';
    const n = raf.childElementCount || 1;
    const solBos = 78;
    const rafEn = W - solBos - 10;
    let s = Math.max(64, Math.min(82, yatay ? H * 0.2 : 76, rafEn / n - 8));
    const sigan = Math.max(1, Math.floor(rafEn / (s + 8)));
    const satir = Math.ceil(n / sigan);
    if (satir > 1) s = Math.max(64, Math.min(s, rafEn / Math.ceil(n / satir) - 8));
    raf.style.cssText = `left:${solBos}px;top:8px;width:${rafEn}px;--s:${s}px`;
    const rafAlt = 8 + satir * (s + 8);
    if (yatay) {
      const yuk = H - rafAlt - 12;
      // tava sol ocağın üstünde (istasyon-ocak çiziminde iki göz: %30 ve %70)
      R = Math.min(yuk * 0.41, W * 0.17);
      cx = Math.max(W * 0.3, R * 2.2);
      cy = Math.max(rafAlt + R * 1.16 + 4, H * 0.5);
      dinlenme = { x: cx + R * 1.14 + 64, y: cy + 4 };
    } else {
      // dikeyde tavanın sapı aşağı bakar (üstten çizim döner; yiyecekler dik kalır)
      R = Math.min(W * 0.38, (H - rafAlt) * 0.24);
      cx = W / 2;
      cy = rafAlt + 24 + R * 1.14 + Math.max(0, (H - rafAlt - 150 - R * 3.4) / 2);
      dinlenme = { x: cx + R * 0.95, y: cy + R * 1.3 };
    }
    tava.style.cssText = `left:${cx}px;top:${cy}px;--R:${R}px`;
    if (!spatulaTutuluyor) spatula.style.transform = `translate(${dinlenme.x}px,${dinlenme.y}px)`;
    yerlesimSonra();
  }
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => yerlestir()) : null;
  ro?.observe(kok);

  const tavadaMi = (x: number, y: number, pay = 0.95) => Math.hypot(x - cx, y - cy) < R * pay;
  /** tava içi koordinat (-1..1) → kap px */
  const icten = (u: number, v: number) => ({ x: cx + u * R, y: cy + v * R });

  // ------------------------------------------------------------ tavadaki parçalar
  interface Tane {
    el: HTMLElement;
    u: number;
    v: number;
  }
  const taneler: Tane[] = [];
  function taneEkle(m: Malzeme, kesim: Kesim, n: number, kaynak?: { x: number; y: number }) {
    const gor = GOR[kesim] ?? 'kup';
    for (let i = 0; i < n; i++) {
      const k = taneler.length;
      const a = k * 2.39996 + Math.random() * 0.4;
      const r = 0.68 * Math.sqrt((k % 18) / 18 + 0.03) + Math.random() * 0.06;
      const el = parcaEl(m, { id: 0, gorunum: gor, x: 0, y: 0, w: 0, h: 0 });
      el.classList.add('rs-tv-tane');
      el.dataset.boy = gor;
      icerik.append(el);
      const t: Tane = { el, u: Math.cos(a) * r, v: Math.sin(a) * r };
      taneler.push(t);
      taneKoy(t);
      if (kaynak) {
        const hedef = icten(t.u, t.v);
        try {
          el.animate([{ transform: `translate(${kaynak.x - hedef.x}px,${kaynak.y - hedef.y}px) scale(0.7)` }, { transform: `translate(0,-14px) scale(1.1,0.9)`, offset: 0.75 }, { transform: 'translate(0,0) scale(1,1)' }], {
            duration: TEST_MODU ? 30 : 380,
            delay: TEST_MODU ? 0 : i * 28,
            easing: 'cubic-bezier(.3,.6,.4,1)',
            fill: 'backwards',
          });
        } catch {
          /* yok say */
        }
      }
    }
  }
  function taneKoy(t: Tane) {
    t.el.style.left = `${50 + t.u * 50}%`;
    t.el.style.top = `${50 + t.v * 50}%`;
  }
  // geri dönüşte tavadakiler yeniden çizilir
  for (const [m, md] of Object.entries(d.malzemeler)) taneEkle(m as Malzeme, md!.kesim ?? 'kup', Math.min(md!.adet, 8));

  // ------------------------------------------------------------ yumurta (tavada)
  const yumurtalar: HTMLElement[] = [];
  function yumurtaCiz(u: number, v: number, yeniMi: boolean) {
    const resim = yeni('alet/yumurta-tavada');
    const el = h('div.rs-tv-yumurta', {}, resim ? h('img', { src: resim, alt: '', draggable: 'false' }) : h('i.rs-tv-ak'), resim ? null : h('i.rs-tv-sari'));
    el.style.left = `${50 + u * 50}%`;
    el.style.top = `${50 + v * 50}%`;
    yumurtaKat.append(el);
    yumurtalar.push(el);
    if (yeniMi)
      try {
        el.animate([{ transform: 'scale(0.3,0.3)', opacity: 0.6 }, { transform: 'scale(1.15,0.85)', opacity: 1, offset: 0.6 }, { transform: 'scale(1,1)' }], { duration: TEST_MODU ? 30 : 320, easing: 'ease-out' });
      } catch {
        /* yok say */
      }
  }
  for (let i = 0; i < d.yumurta; i++) yumurtaCiz(-0.2 + i * 0.25, -0.1 + (i % 2) * 0.2, false);
  // geri çıkıldıysa aradaki süre kadar pişti
  if (onceki) ilerlet((performance.now() - onceki.t) / 1000);
  d.t = performance.now();

  // kabuk parçaları (kaygan)
  function kabukCiz() {
    kabukKat.replaceChildren();
    for (let i = 0; i < d.kabuk; i++) {
      const el = h('button.rs-tv-kabuk', { type: 'button', 'aria-label': 'Kabuk' });
      const u = Math.cos(i * 2.1 + 0.6) * 0.42;
      const v = Math.sin(i * 2.1 + 0.6) * 0.42;
      el.style.left = `${50 + u * 50}%`;
      el.style.top = `${50 + v * 50}%`;
      let dokunus = 0;
      el.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        dokunus++;
        b.dokunsal(TITRESIM.hafif);
        if (dokunus < 3) {
          // parmaktan kayar
          b.ses.cal('pit', { perde: 1.3 + dokunus * 0.1 });
          const nu = (Math.random() - 0.5) * 1.1;
          const nv = (Math.random() - 0.5) * 1.1;
          const r0 = el.getBoundingClientRect();
          el.style.left = `${50 + nu * 50}%`;
          el.style.top = `${50 + nv * 50}%`;
          const r1 = el.getBoundingClientRect();
          try {
            el.animate([{ transform: `translate(${r0.left - r1.left}px,${r0.top - r1.top}px)` }, { transform: 'translate(0,0) scale(1.15,0.85)', offset: 0.8 }, { transform: 'none' }], { duration: TEST_MODU ? 20 : 240, easing: 'ease-out' });
          } catch {
            /* yok say */
          }
          if (!kaciyorDendi) {
            kaciyorDendi = true;
            olay('kaciyor');
            void b.mino.tepki('sevin', 800);
            void b.mino.soyle(M.kaciyor);
          }
          return;
        }
        d.kabuk = Math.max(0, d.kabuk - 1);
        b.ses.cal('hop', { perde: 1.2 });
        olay('kabukCikti');
        void ucur(el, 0, -R * 1.5, 320, -40).then(() => kabukCiz());
      });
      kabukKat.append(el);
    }
  }
  let kaciyorDendi = false;
  kabukCiz();

  // ------------------------------------------------------------ raf
  type RafTur = 'kase' | 'yumurta' | 'hamur' | 'yag' | 'tuz' | 'pulbiber';
  const rafOgeleri: { tur: RafTur; el: HTMLElement; kase?: Kaseli }[] = [];
  function rafOge(tur: RafTur, icerikEl: HTMLElement, etiket: string, kase?: Kaseli) {
    const el = h('button.rs-tv-raf-oge', { type: 'button', 'aria-label': etiket, 'data-tur': tur }, icerikEl);
    raf.append(el);
    rafOgeleri.push({ tur, el, kase });
    return el;
  }
  for (const k of kaseler) {
    const kel = rafOge('kase', kaseGorseli(k.ozellik), 'Kâse', k);
    kel.dataset.kase = k.id;
  }
  const yumurtaRaf = rafOge('yumurta', resimYa('yumurta', 'rs-tv-yt-yumurta'), MALZEME_ADI.yumurta);
  const hamurRaf = hamurVar ? rafOge('hamur', resimYa('hamur-kasesi', 'rs-tv-yt-hamur'), 'Pankek hamuru') : null;
  const yagRaf = rafOge('yag', resimYa('zeytinyagi', 'rs-tv-yt-yag'), MALZEME_ADI.zeytinyagi);
  const tuzRaf = rafOge('tuz', resimYa('tuzluk', 'rs-tv-yt-tuz'), MALZEME_ADI.tuz);
  const biberRaf = rafOge('pulbiber', resimYa('pulbiber', 'rs-tv-yt-pulbiber'), MALZEME_ADI.pulbiber);
  yerlestir();

  function resimYa(ad: string, yt: string): HTMLElement {
    const u = alet(ad);
    return u ? h('img.rs-tv-raf-resim', { src: u, alt: '', draggable: 'false' }) : h(`i.rs-tv-yt.${yt}`);
  }

  // ------------------------------------------------------------ elde tutulan (parmağın biraz üstünde)
  let elde: HTMLElement | null = null;
  function eldeAl(kaynak: HTMLElement, x: number, y: number): HTMLElement {
    const el = h('div.rs-tv-elde', {}, (kaynak.firstElementChild as HTMLElement).cloneNode(true) as HTMLElement);
    eldeKat.append(el);
    el.style.transform = `translate(${x}px,${y - 34}px)`;
    elde = el;
    return el;
  }
  function eldeTasi(x: number, y: number) {
    if (elde) elde.style.transform = `translate(${x}px,${y - 34}px)`;
  }
  function eldeBirak(geriEl?: HTMLElement) {
    const el = elde;
    elde = null;
    if (!el) return;
    if (geriEl) {
      const r = geriEl.getBoundingClientRect();
      const kr = kok.getBoundingClientRect();
      const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(el.style.transform);
      const x = m ? +m[1] : 0;
      const y = m ? +m[2] : 0;
      void ucur(el, r.left - kr.left + r.width / 2 - x, r.top - kr.top + r.height / 2 - y, 260, -20).then(() => el.remove());
    } else el.remove();
  }

  // ------------------------------------------------------------ yağ
  let yagZaman = 0;
  function yagAk(miktar: number) {
    if (d.yag >= 1.4) return;
    if (d.yag === 0) olay('yag');
    d.yag = Math.min(1.4, d.yag + miktar);
    yagCiz(true);
  }
  function yagCiz(canli = false) {
    yagEl.style.setProperty('--yag', String(Math.min(1, d.yag)));
    yagEl.classList.toggle('rs-var', d.yag > 0);
    if (canli) ezil(yagEl, 0.4, 120);
  }
  yagCiz();
  surukle(yagRaf, kok, {
    basla: (x, y) => {
      eldeAl(yagRaf, x, y).classList.add('rs-tv-elde-sise');
      b.ses.cal('hop', { perde: 1.1, guc: 0.5 });
    },
    hareket: (x, y) => {
      eldeTasi(x, y);
      const dok = tavadaMi(x, y - 34, 1);
      elde?.classList.toggle('rs-tv-dokuyor', dok);
      if (dok && !yagZaman) {
        yagZaman = window.setInterval(() => {
          yagAk(0.07);
          if (Math.random() < 0.35) b.ses.cal('siril', { guc: 0.25, perde: 1.4 });
        }, 90);
      } else if (!dok && yagZaman) {
        clearInterval(yagZaman);
        yagZaman = 0;
      }
    },
    birak: () => {
      clearInterval(yagZaman);
      yagZaman = 0;
      eldeBirak(yagRaf);
      durumGuncelle();
    },
    dokun: () => {
      eldeBirak();
      // dokununca şişe tavanın üstüne hoplar, biraz yağ gezdirir
      ezil(yagRaf, 1.3);
      b.ses.cal('siril', { guc: 0.3, perde: 1.4 });
      yagAk(0.45);
      durumGuncelle();
    },
  });

  // ------------------------------------------------------------ tuz, pul biber
  function serp(tur: 'tuz' | 'pulbiber', el: HTMLElement) {
    if (tur === 'tuz') d.tuz++;
    else d.aci++;
    olay(tur);
    b.ses.cal('citir', { guc: 0.3, perde: 1.6 });
    b.dokunsal(TITRESIM.hafif);
    kipirda(el, 5);
    const u = (Math.random() - 0.5) * 0.6;
    const p = icten(u, -0.1);
    sac(kok, p.x, p.y - 30, 'cekirdek', tur === 'tuz' ? '#FFFFFF' : '#C8321E', 10, { yon: Math.PI / 2, yay: 1.2, guc: 0.7, boy: 4 });
    durumGuncelle();
  }
  for (const [el, tur] of [
    [tuzRaf, 'tuz'],
    [biberRaf, 'pulbiber'],
  ] as const) {
    surukle(el, kok, {
      basla: (x, y) => void eldeAl(el, x, y),
      hareket: (x, y) => eldeTasi(x, y),
      birak: (x, y) => {
        if (tavadaMi(x, y - 34, 1.05)) serp(tur, elde ?? el);
        eldeBirak(el);
      },
      dokun: () => {
        eldeBirak();
        serp(tur, el);
      },
    });
  }

  // ------------------------------------------------------------ kâse: sotele
  function kaseDok(k: Kaseli, kaynak: { x: number; y: number }) {
    if (!k.ornek) d.kullanilan.push(k.id);
    const oge = rafOgeleri.find((o) => o.kase === k);
    oge?.el.classList.add('rs-kullanildi');
    for (const [m, md] of Object.entries(k.ozellik.malzemeler)) {
      const e = d.malzemeler[m as Malzeme];
      d.malzemeler[m as Malzeme] = e ? { ...e, adet: e.adet + md!.adet } : { ...md! };
      taneEkle(m as Malzeme, md!.kesim ?? 'kup', Math.min(md!.adet, 6), kaynak);
    }
    if (k.ozellik.tuz) d.tuz += k.ozellik.tuz;
    // cızzz!
    b.ses.cal('ciz', { guc: 1 });
    b.dokunsal(TITRESIM.slap);
    sac(kok, cx, cy, 'buhar', '#fff', 6, { yon: -Math.PI / 2, yay: 2, guc: 0.8 });
    ezil(tava, 0.6);
    olay('dokuldu');
    if (!konusuyorMu()) void b.mino.soyle(M.cizz);
    void b.mino.tepki('zipla', 600);
    durumGuncelle();
  }
  for (const o of rafOgeleri.filter((x) => x.tur === 'kase')) {
    const k = o.kase!;
    surukle(o.el, kok, {
      basla: (x, y) => {
        if (o.el.classList.contains('rs-kullanildi')) return false;
        eldeAl(o.el, x, y).classList.add('rs-tv-elde-kase');
        o.el.classList.add('rs-tv-bos');
      },
      hareket: (x, y) => eldeTasi(x, y),
      birak: (x, y) => {
        o.el.classList.remove('rs-tv-bos');
        if (tavadaMi(x, y - 34, 1.1)) {
          eldeBirak();
          kaseDok(k, { x, y: y - 34 });
        } else eldeBirak(o.el);
      },
      dokun: () => {
      eldeBirak();
        if (o.el.classList.contains('rs-kullanildi')) return;
        const r = o.el.getBoundingClientRect();
        const kr = kok.getBoundingClientRect();
        kaseDok(k, { x: r.left - kr.left + r.width / 2, y: r.top - kr.top + r.height / 2 });
      },
    });
  }

  // ------------------------------------------------------------ yumurta: kenara iki vuruş
  let kenardaki: { el: HTMLElement; vurus: number } | null = null;
  function yumurtaKir(x: number, y: number, sert: boolean) {
    // sarısı tavaya düşer (vurulan yerden biraz içeri)
    const ux = (x - cx) / R;
    const uy = (y - cy) / R;
    const l = Math.hypot(ux, uy) || 1;
    const k = Math.min(l, 0.55) / l;
    const u = ux * k * 0.9;
    const v = uy * k * 0.9;
    d.yumurta++;
    b.ses.cal('cat');
    b.dokunsal(TITRESIM.kesim);
    window.setTimeout(
      () => {
        b.ses.cal('pit');
        b.ses.cal('ciz', { guc: 0.8 });
        yumurtaCiz(u, v, true);
        sac(kok, cx + u * R, cy + v * R, 'buhar', '#fff', 3, { yon: -Math.PI / 2, yay: 1.5, guc: 0.6 });
        durumGuncelle();
      },
      TEST_MODU ? 0 : 140,
    );
    // kabuk yarımları uçar
    sac(kok, x, y, 'kabuk', '#FFF3DC', 2, { yon: -Math.PI / 2, yay: 2.5, guc: 1.4, boy: 22 });
    if (sert) {
      d.kabuk++;
      olay('kabukTavada');
      kabukCiz();
    }
    olay('yumurtaKirildi');
  }
  function vurus(el: HTMLElement, hiz: number, x: number, y: number): boolean {
    const n = Number(el.dataset.vurus ?? '0') + 1;
    el.dataset.vurus = String(n);
    const sert = hiz > SERT_VURUS[yas];
    if (n === 1) {
      b.ses.cal('tik');
      b.dokunsal(TITRESIM.hafif);
      el.classList.add('rs-catlak');
      const c = alet('yumurta-catlak');
      const img = el.querySelector('img');
      if (c && img) img.src = c;
      ezil(el, 1.2);
      olay('tik');
      if (sert) {
        d.kabuk++;
        kabukCiz();
        olay('kabukTavada');
      }
      return false;
    }
    yumurtaKir(x, y, sert);
    return true;
  }
  let oncekiUzak = Infinity;
  let kirildi = false;
  surukle(yumurtaRaf, kok, {
    basla: (x, y) => {
      const el = eldeAl(yumurtaRaf, x, y);
      el.classList.add('rs-tv-elde-yumurta');
      el.dataset.vurus = '0';
      oncekiUzak = Infinity;
      kirildi = false;
      b.ses.cal('hop', { perde: 1.2, guc: 0.4 });
    },
    hareket: (x, y, hiz) => {
      if (kirildi || !elde) return;
      eldeTasi(x, y);
      const uzak = Math.hypot(x - cx, y - 34 - cy);
      if (kenaraVurdu(oncekiUzak, uzak, R, yas)) {
        if (vurus(elde, hiz.v, x, y - 34)) {
          kirildi = true;
          elde.remove();
          elde = null;
        }
      }
      oncekiUzak = uzak;
    },
    birak: (x, y) => {
      if (kirildi) return;
      if (elde && tavadaMi(x, y - 34, 0.95)) {
        // bütün yumurta tavaya: hop, kendi kendine çatlar, kabuklar tavada (komik)
        const el = elde;
        elde = null;
        b.ses.cal('boing');
        hopla(el, 20, 300);
        window.setTimeout(
          () => {
            el.remove();
            olay('butunYumurta');
            void b.mino.tepki('sasir', 900);
            yumurtaKir(x, y - 34, false);
            d.kabuk += 2;
            kabukCiz();
            olay('kabukTavada');
          },
          TEST_MODU ? 10 : 320,
        );
        return;
      }
      eldeBirak(yumurtaRaf);
    },
    dokun: () => {
      eldeBirak();
      // 3-4 yaş yolu: yumurta tavanın kenarına zıplar (tık); bir daha dokununca çat
      if (kenardaki) {
        kenardakiVur();
        return;
      }
      const resim = alet('yumurta');
      const el = h('button.rs-tv-kenar-yumurta', { type: 'button', 'aria-label': MALZEME_ADI.yumurta }, resim ? h('img', { src: resim, alt: '', draggable: 'false' }) : h('i.rs-tv-yt.rs-tv-yt-yumurta'));
      const p = icten(0.62, -0.78);
      el.style.transform = `translate(${p.x}px,${p.y}px)`;
      eldeKat.append(el);
      kenardaki = { el, vurus: 0 };
      vurus(el, 0, p.x, p.y);
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        kenardakiVur();
      });
    },
  });
  function kenardakiVur() {
    if (!kenardaki) return;
    const k = kenardaki;
    const p = icten(0.62, -0.78);
    if (vurus(k.el, 0, p.x, p.y)) {
      k.el.remove();
      kenardaki = null;
    }
  }

  // ------------------------------------------------------------ hamur: kepçeyle dök
  let dokZaman = 0;
  function hamurDok(miktar: number, x?: number, y?: number) {
    if (!d.pankek) {
      d.pankek = yeniPankek(0.35);
      olay('hamurDokuldu');
      b.ses.cal('ciz', { guc: 0.7 });
      void x;
      void y;
    } else d.pankek.boy = Math.min(1, d.pankek.boy + miktar);
    pankekCiz(true);
    durumGuncelle();
  }
  if (hamurRaf)
    surukle(hamurRaf, kok, {
      basla: (x, y) => {
        eldeAl(hamurRaf, x, y).classList.add('rs-tv-elde-kepce');
        b.ses.cal('hop', { perde: 1, guc: 0.4 });
      },
      hareket: (x, y) => {
        eldeTasi(x, y);
        const dok = tavadaMi(x, y - 34, 0.9);
        elde?.classList.toggle('rs-tv-dokuyor', dok);
        if (dok && !dokZaman) {
          hamurDok(0);
          dokZaman = window.setInterval(() => {
            if (d.pankek && d.pankek.boy < 1) {
              d.pankek.boy = Math.min(1, d.pankek.boy + 0.045);
              pankekCiz(false);
              if (Math.random() < 0.3) b.ses.cal('ciz', { guc: 0.25 });
            }
          }, 90);
        } else if (!dok && dokZaman) {
          clearInterval(dokZaman);
          dokZaman = 0;
        }
      },
      birak: () => {
        clearInterval(dokZaman);
        dokZaman = 0;
        eldeBirak(hamurRaf);
        durumGuncelle();
      },
      dokun: () => {
      eldeBirak();
        ezil(hamurRaf, 1.3);
        hamurDok(0.3);
      },
    });

  function pankekCiz(canli: boolean) {
    const p = d.pankek;
    pankekEl.hidden = !p || p.tavanda;
    if (!p) return;
    pankekEl.style.setProperty('--boy', String(p.boy));
    const ust = pismeAdi(ustYuz(p));
    const alt = pismeAdi(p.yuz[p.alt]);
    pankekEl.dataset.ust = ust;
    pankekEl.dataset.alt = alt;
    pankekEl.classList.toggle('rs-kabarcik', kabarcikMi(p) && ust === 'cig');
    // Gemini pankek kareleri varsa
    const ad = ust === 'cig' ? (kabarcikMi(p) ? 'pankek-kabarcik' : 'pankek-hamur') : ust === 'citir' ? 'pankek-citir' : 'pankek-altin';
    const u = yeni(`yiyecek/${ad}`);
    pankekEl.style.setProperty('--resim', u ? `url("${u}")` : 'none');
    pankekEl.classList.toggle('rs-resimli', !!u);
    if (canli) ezil(pankekEl, 0.5);
  }
  pankekCiz(false);

  // ------------------------------------------------------------ pankek fiskesi (tavada parmakla ya da spatulayla)
  let fiske: { x: number; y: number; t: number } | null = null;
  tava.addEventListener('pointerdown', (e) => {
    if (!d.pankek || d.pankek.tavanda || ucuyor) return;
    const kr = kok.getBoundingClientRect();
    const x = e.clientX - kr.left;
    const y = e.clientY - kr.top;
    if (Math.hypot(x - cx, y - cy) > R * d.pankek.boy * 0.75 + 20) return;
    e.preventDefault();
    try {
      tava.setPointerCapture(e.pointerId);
    } catch {
      /* yok say */
    }
    fiske = { x, y, t: performance.now() };
    ezil(pankekEl, 0.5);
    b.ses.cal('tik', { guc: 0.3, perde: 0.7 });
  });
  tava.addEventListener('pointerup', (e) => {
    if (!fiske) return;
    const kr = kok.getBoundingClientRect();
    const dy = e.clientY - kr.top - fiske.y;
    const dx = e.clientX - kr.left - fiske.x;
    const ms = performance.now() - fiske.t;
    fiske = null;
    const yukari = yas === 'kucuk' ? Math.hypot(dx, dy) : -dy;
    if (fiskeMi(yas === 'kucuk' ? -Math.hypot(dx, dy) : dy, ms, yas)) cevirOyna(yukari >= 110 ? yukari / Math.max(30, ms) : Math.min(1.9, yukari / Math.max(30, ms)));
  });
  tava.addEventListener('pointercancel', () => (fiske = null));

  let ucuyor = false;
  function cevirOyna(hiz: number) {
    const p = d.pankek;
    if (!p || ucuyor || p.tavanda) return;
    ucuyor = true;
    const sonuc = fiskeSonucu(hiz, yas);
    b.ses.cal('hop', { perde: 0.9 + Math.min(0.5, hiz * 0.1) });
    b.dokunsal(TITRESIM.kesim);
    olay('fiske');
    const ms = TEST_MODU ? 40 : 640;
    if (sonuc === 'tavan') {
      // çok güçlü: yukarı uçar, tavana yapışır
      p.tavanda = true;
      const yuk = cy + R + 80;
      const a = pankekEl.animate(
        [
          { transform: 'translateY(0) scale(1,1)' },
          { transform: `translateY(${-yuk * 0.5}px) scale(1.12,1.12)`, offset: 0.4 },
          { transform: `translateY(${-yuk}px) scale(1.25,1.25)` },
        ],
        { duration: TEST_MODU ? 40 : 420, easing: 'cubic-bezier(.2,.7,.4,1)', fill: 'forwards' },
      );
      void a.finished.then(() => {
        tak();
        olay('tavan');
        void b.mino.tepki('sasir', 1400);
        void b.mino.soyle(M.tavan);
        a.cancel();
        pankekCiz(false);
        window.setTimeout(() => sapkaOl(), TEST_MODU ? 60 : 3000);
      });
      return;
    }
    // havada döner: büyür (yaklaşma hissi, en çok %125), yassılaşıp öbür yüzü görünür, "pof" diye iner
    const yuk = Math.min(150, R * 1.1);
    const a = pankekEl.animate(
      [
        { transform: 'translateY(0) scale(1,1)' },
        { transform: `translateY(${-yuk * 0.7}px) scale(1.15,0.55)`, offset: 0.3 },
        { transform: `translateY(${-yuk}px) scale(1.25,0.04)`, offset: 0.5 },
        { transform: `translateY(${-yuk * 0.7}px) scale(1.15,0.6)`, offset: 0.7 },
        { transform: 'translateY(0) scale(1.12,0.86)', offset: 0.9 },
        { transform: 'translateY(0) scale(1,1)' },
      ],
      { duration: ms, easing: 'ease-in-out' },
    );
    window.setTimeout(
      () => {
        cevir(p);
        pankekCiz(false);
      },
      ms * 0.5,
    );
    void a.finished.then(() => {
      ucuyor = false;
      b.ses.cal('pof');
      b.dokunsal(TITRESIM.kesim);
      sac(kok, cx, cy, 'buhar', '#fff', 4, { yon: -Math.PI / 2, yay: 2, guc: 0.6 });
      durumGuncelle();
    });
  }
  /** Tavandan düşen pankek Mino'nun başına şapka olur, sonra tavaya döner */
  function sapkaOl() {
    const p = d.pankek;
    if (!p || kapandi) return;
    const kr = kok.getBoundingClientRect();
    const mr = b.mino.el.getBoundingClientRect();
    const sapka = pankekEl.cloneNode(true) as HTMLElement;
    sapka.hidden = false;
    sapka.classList.add('rs-tv-sapka');
    const w = Math.min(mr.width * 0.8, 90);
    const hx = mr.left - kr.left + mr.width / 2;
    const hy = mr.top - kr.top + mr.height * 0.12;
    sapka.style.cssText = `left:${hx - w / 2}px;top:${hy - w * 0.22}px;width:${w}px;height:${w * 0.45}px;--boy:1`;
    kok.append(sapka);
    try {
      sapka.animate([{ transform: `translateY(${-hy - 60}px)` }, { transform: 'translateY(0) scale(1.15,0.8)', offset: 0.85 }, { transform: 'none' }], { duration: TEST_MODU ? 30 : 460, easing: 'cubic-bezier(.5,0,.8,.6)' });
    } catch {
      /* yok say */
    }
    window.setTimeout(
      () => {
        b.ses.cal('pof');
        olay('sapka');
        void b.mino.tepki('sasir', 1500);
        void b.mino.soyle(M.sapka);
      },
      TEST_MODU ? 30 : 460,
    );
    window.setTimeout(
      () => {
        if (kapandi) return;
        const dx = cx - hx;
        const dy = cy - hy;
        void ucur(sapka, dx, dy, 380, -60).then(() => {
          sapka.remove();
          p.tavanda = false;
          ucuyor = false;
          pankekCiz(true);
          b.ses.cal('pof');
          durumGuncelle();
        });
      },
      TEST_MODU ? 80 : 2200,
    );
  }

  // ------------------------------------------------------------ spatula: sotele, karıştır, (pankekte) fiske
  let sonSpat = { x: 0, y: 0 };
  let karistirYol = 0;
  let cizYol = 0;
  surukle(spatula, kok, {
    basla: (x, y) => {
      spatulaTutuluyor = true;
      spatula.classList.add('rs-tutuluyor');
      spatula.style.transform = `translate(${x}px,${y - 30}px)`;
      sonSpat = { x, y: y - 30 };
      b.ses.cal('tik', { guc: 0.4 });
    },
    hareket: (x, y, hiz) => {
      const sx = x;
      const sy = y - 30;
      spatula.style.transform = `translate(${sx}px,${sy}px)`;
      const dx = sx - sonSpat.x;
      const dy = sy - sonSpat.y;
      sonSpat = { x: sx, y: sy };
      if (!tavadaMi(sx, sy, 1)) return;
      // pankek: yukarı hızlı itiş fiske sayılır
      if (d.pankek && !d.pankek.tavanda && hiz.vy < -1.4 && Math.hypot(sx - cx, sy - cy) < R * d.pankek.boy) {
        cevirOyna(-hiz.vy);
        return;
      }
      const yol = Math.hypot(dx, dy);
      if (yol < 0.5) return;
      itTaneler(sx, sy, dx, dy);
      if (d.yumurta) {
        const once = d.karisim;
        d.karisim = karisimEkle(d.karisim, yol, yas);
        if (Math.floor(once * 10) !== Math.floor(d.karisim * 10)) yumurtaKaristirCiz();
      }
      karistirYol += yol;
      d.p = Math.min(3.6, d.p + (yol / 100) * KARISTIR_PISME * (taneler.length || d.yumurta ? 1 : 0));
      cizYol += yol;
      if (cizYol > 90 && (taneler.length || d.yumurta)) {
        cizYol = 0;
        b.ses.cal('ciz', { guc: 0.35, perde: 0.9 + Math.random() * 0.3 });
        if (Math.random() < 0.4) sac(kok, sx, sy, 'buhar', '#fff', 1, { yon: -Math.PI / 2, yay: 1, guc: 0.5 });
      }
    },
    birak: () => birakSpatula(),
    dokun: () => {
      // dokununca spatula tavada kendi kendine bir tur karıştırır
      spatulaTutuluyor = true;
      const tur = TEST_MODU ? 4 : 18;
      let i = 0;
      const z = window.setInterval(() => {
        const a = (i / tur) * Math.PI * 2;
        const sx = cx + Math.cos(a) * R * 0.4;
        const sy = cy + Math.sin(a) * R * 0.4;
        const dx = sx - sonSpat.x;
        const dy = sy - sonSpat.y;
        sonSpat = { x: sx, y: sy };
        spatula.style.transform = `translate(${sx}px,${sy}px)`;
        if (i > 0) itTaneler(sx, sy, dx, dy);
        if (d.yumurta) {
          d.karisim = karisimEkle(d.karisim, 40, yas);
          yumurtaKaristirCiz();
        }
        karistirYol += 40;
        if (i % 4 === 0 && (taneler.length || d.yumurta)) b.ses.cal('ciz', { guc: 0.3 });
        if (++i > tur) {
          clearInterval(z);
          birakSpatula();
        }
      }, 40);
    },
  });
  function birakSpatula() {
    spatulaTutuluyor = false;
    spatula.classList.remove('rs-tutuluyor');
    spatula.style.transform = `translate(${dinlenme.x}px,${dinlenme.y}px)`;
    if (karistirYol > 60) olay('karistir');
    karistirYol = 0;
    durumGuncelle();
  }
  /** Spatulanın yakınındaki parçalar onun hareketiyle itilir (tava içinde kalır) */
  function itTaneler(sx: number, sy: number, dx: number, dy: number) {
    const rr = R * 0.38;
    for (const t of taneler) {
      const p = icten(t.u, t.v);
      const uz = Math.hypot(p.x - sx, p.y - sy);
      if (uz > rr) continue;
      const k = (1 - uz / rr) * 0.9;
      t.u += (dx * k) / R + (Math.random() - 0.5) * 0.02;
      t.v += (dy * k) / R + (Math.random() - 0.5) * 0.02;
      const l = Math.hypot(t.u, t.v);
      if (l > 0.8) {
        t.u *= 0.8 / l;
        t.v *= 0.8 / l;
      }
      taneKoy(t);
    }
  }
  /** Karıştıkça yumurta parçalanır: sarı-beyaz küçük parçalar */
  let yumurtaParca = 0;
  function yumurtaKaristirCiz() {
    yumurtaKat.dataset.karisim = String(Math.round(d.karisim * 10) / 10);
    yumurtaKat.style.setProperty('--karisim', String(d.karisim));
    const hedef = Math.round(d.karisim * 9 * d.yumurta);
    while (yumurtaParca < hedef) {
      const a = yumurtaParca * 2.39996;
      const r = 0.15 + 0.5 * Math.sqrt(((yumurtaParca % 12) + 1) / 12);
      const el = h('i.rs-tv-yumurta-parca');
      el.style.left = `${50 + Math.cos(a) * r * 50}%`;
      el.style.top = `${50 + Math.sin(a) * r * 50}%`;
      yumurtaKat.append(el);
      yumurtaParca++;
    }
  }
  yumurtaKaristirCiz();

  // ------------------------------------------------------------ zaman: pişme, renk, cızırtı, buhar
  let cizDongu: { guc(g: number): void; dur(): void } | null = null;
  let sonPisme: Pisme | null = null;
  let sonBuhar = 0;
  let kapandi = false;
  const yemekVar = () => taneler.length > 0 || d.yumurta > 0 || !!d.pankek;

  function ilerlet(sn: number) {
    if (taneler?.length || d.yumurta || Object.keys(d.malzemeler).length) d.p = pis(d.p, sn, d.yumurta && !Object.keys(d.malzemeler).length ? HIZ.yumurta : HIZ.sebze);
    if (d.pankek) pankekPis(d.pankek, sn);
  }
  const zaman = window.setInterval(
    () => {
      const simdi = performance.now();
      const sn = (simdi - d.t) / 1000;
      d.t = simdi;
      if (!yemekVar()) return;
      ilerlet(sn * (TEST_MODU && new URLSearchParams(location.search).has('hizli') ? 8 : 1));
      renkCiz();
      if (!cizDongu) cizDongu = b.ses.dongu('ciz');
      const pd = pismeNe();
      const c = cizirti(pd);
      cizDongu.guc(c.guc);
      if (c.buhar && simdi - sonBuhar > (TEST_MODU ? 300 : 900)) {
        sonBuhar = simdi;
        const a = Math.random() * Math.PI * 2;
        sac(kok, cx + Math.cos(a) * R * 0.4, cy + Math.sin(a) * R * 0.4, 'buhar', '#fff', 1, { yon: -Math.PI / 2, yay: 0.8, guc: 0.4 });
      }
      if (pd !== sonPisme) {
        const eski = sonPisme;
        sonPisme = pd;
        if (eski) pismeAni(pd);
      }
      if (d.pankek) pankekCiz(false);
      durumGuncelle(false);
    },
    TEST_MODU ? 120 : 250,
  );

  function pismeNe(): Pisme {
    if (d.pankek && !taneler.length && !d.yumurta) return pismeAdi(d.pankek.yuz[d.pankek.alt]);
    return pismeAdi(d.p);
  }
  function renkCiz() {
    const p = pismeAdi(d.p);
    icerik.dataset.pisme = p;
    yumurtaKat.dataset.pisme = p;
    // Gemini menemen kareleri varsa tanelerin yerine
    const sebze = taneler.length > 0;
    let ad: string | null = null;
    if (sebze && d.yumurta) ad = d.karisim < 0.6 ? 'menemen-az-karisik' : 'menemen-cok-karisik';
    else if (sebze) ad = d.p >= 2 ? 'menemen-pismis' : 'menemen-cig';
    const u = ad ? yeni(`yiyecek/${ad}`) : null;
    if (u) {
      if (!resimKat.src.endsWith(u)) resimKat.src = u;
      tavaIc.classList.add('rs-resimli');
    } else tavaIc.classList.remove('rs-resimli');
  }
  function pismeAni(p: Pisme) {
    olay(`pisme-${p}`);
    if (p === 'altin') {
      // altın anı: kısa parıltı + tereyağı kokusu dalgası (iki buhar kıvrımı)
      b.ses.cal('ting');
      parilti(kok, cx, cy, 7, R * 0.6);
      sac(kok, cx - R * 0.25, cy - R * 0.2, 'buhar', '#fff', 1, { yon: -Math.PI / 2, yay: 0.3, guc: 0.6, boy: 40 });
      sac(kok, cx + R * 0.25, cy - R * 0.2, 'buhar', '#fff', 1, { yon: -Math.PI / 2, yay: 0.3, guc: 0.6, boy: 40 });
      void b.mino.tepki('sevin', 1000);
      if (!konusuyorMu()) void b.mino.soyle(M.altin);
    } else if (p === 'citir') {
      b.ses.cal('kitir');
      if (!konusuyorMu()) void b.mino.soyle(M.citir);
    }
  }

  // ------------------------------------------------------------ doğal son, ipucu
  let hoplandi = false;
  function bittiMi() {
    if (d.pankek) return pankekBitti(d.pankek);
    return menemenBitti(d.p, d.yumurta > 0, d.karisim, taneler.length > 0);
  }
  function durumGuncelle(ipucuDa = true) {
    const b2 = bittiMi();
    if (b2 && !hoplandi) {
      hoplandi = true;
      b.tepsi.hopla();
      olay('dogalSon');
    }
    if (!b2) hoplandi = false;
    kok.dataset.durum = JSON.stringify(ozet());
    if (ipucuDa) ipucuGuncelle();
  }
  function ipucuGuncelle() {
    if (odulde) return b.ipucu.hedef(null);
    if (!yemekVar()) {
      const ilk = rafOgeleri.find((o) => o.tur === 'kase' && !o.el.classList.contains('rs-kullanildi'))?.el ?? (g.tarif === 'pankek' ? hamurRaf : null) ?? yumurtaRaf;
      return b.ipucu.hedef({ el: () => ilk, soz: M.ipucu.bos, hareket: 'surukle', nereye: () => tava });
    }
    if (d.pankek) {
      if (kabarcikMi(d.pankek) && pismeAdi(ustYuz(d.pankek)) === 'cig') return b.ipucu.hedef({ el: () => pankekEl, soz: M.ipucu.kabarcik, hareket: 'fiske' });
      if (pankekBitti(d.pankek)) return b.ipucu.hedef({ el: () => b.tepsi.el, soz: M.ipucu.bitti, hareket: 'dokun' });
      return b.ipucu.hedef(null);
    }
    if (g.tarif === 'menemen' && taneler.length && !d.yumurta) return b.ipucu.hedef({ el: () => yumurtaRaf, soz: M.ipucu.karistir, hareket: 'surukle', nereye: () => tava });
    if (d.yumurta && d.karisim < 0.5) return b.ipucu.hedef({ el: () => spatula, soz: M.ipucu.yumurta, hareket: 'daire' });
    if (bittiMi()) return b.ipucu.hedef({ el: () => b.tepsi.el, soz: M.ipucu.bitti, hareket: 'dokun' });
    b.ipucu.hedef({ el: () => spatula, soz: M.ipucu.karistir, hareket: 'daire' });
  }

  function yerlesimSonra() {
    /* tava ve spatula yerleşince ipucunun eli doğru yere gitsin: bir şey gerekmiyor (elemanlar canlı) */
  }

  // ------------------------------------------------------------ ürün, ödül anı, arka plan
  function bilgi(): TavaUrunBilgi['tava'] {
    return {
      pankek: d.pankek ? { boy: d.pankek.boy, pisme: pankekPisme(d.pankek) } : null,
      parcalar: Object.entries(d.malzemeler).map(([m, md]) => ({ m: m as Malzeme, g: GOR[md!.kesim ?? 'kup'] ?? 'kup', n: Math.min(md!.adet, 6) })),
      yumurta: d.yumurta,
      karisim: d.karisim,
      pisme: pismeAdi(d.p),
    };
  }
  function urunYap(): Urun | null {
    if (!yemekVar()) return null;
    const malzemeler: Partial<Record<Malzeme, MalzemeDurumu>> = JSON.parse(JSON.stringify(d.malzemeler));
    if (d.yumurta) malzemeler.yumurta = { adet: d.yumurta, kesim: yumurtaKesim(d.karisim) as Kesim };
    let tur: string;
    let yemek: string | undefined;
    let pisme: Pisme;
    let miktar: number;
    if (d.pankek) {
      tur = 'pankek';
      yemek = 'pankek';
      pisme = pankekPisme(d.pankek);
      miktar = d.pankek.boy >= 0.85 ? 4 : d.pankek.boy < 0.5 ? 1 : 2;
      if (hamurUrun) Object.assign(malzemeler, JSON.parse(JSON.stringify(hamurUrun.ozellik.malzemeler)));
      else {
        malzemeler.un = { adet: 1 };
        malzemeler.sut = { adet: 1 };
        malzemeler.yumurta = malzemeler.yumurta ?? { adet: 1 };
      }
    } else {
      const sebze = taneler.length > 0;
      tur = sebze && d.yumurta ? 'menemen' : d.yumurta ? 'sahanda' : 'sote';
      yemek = sebze && d.yumurta ? 'menemen' : g.tarif;
      pisme = pismeAdi(d.p);
      miktar = Object.values(d.malzemeler).reduce((t, x) => t + x!.adet, 0) / 3 + d.yumurta;
    }
    const ozellik: YemekOzelligi = { malzemeler, pisme, sicak: true, porsiyon: porsiyon(Math.round(miktar)), karisim: d.yumurta ? d.karisim : undefined };
    if (d.tuz) ozellik.tuz = Math.min(3, d.tuz);
    if (d.aci) ozellik.aci = Math.min(3, d.aci);
    const b2 = bilgi();
    const urun: Urun & TavaUrunBilgi = {
      id: urunId(tur),
      tur,
      yemek,
      ozellik,
      kullanilan: d.kullanilan.slice(),
      gorsel: () => tavaGorsel(b2, true),
      tava: b2,
    };
    return urun;
  }

  let odulde = false;
  let coz: (u: Urun[]) => void = () => undefined;
  const bitti = new Promise<Urun[]>((r) => (coz = r));
  b.tepsi.dinle(() => {
    if (odulde) return;
    if (!yemekVar()) return coz([]);
    odulde = true;
    b.ipucu.hedef(null);
    olay('odul');
    // ödül: tavada kısa parıltı, buhar, tava tepsiye kayar
    b.ses.cal('ting');
    parilti(kok, cx, cy, 8, R * 0.7);
    sac(kok, cx, cy, 'buhar', '#fff', 4, { yon: -Math.PI / 2, yay: 1.6, guc: 0.7, boy: 34 });
    const u = urunYap();
    window.setTimeout(
      () => {
        const tr = b.tepsi.el.getBoundingClientRect();
        const kr = kok.getBoundingClientRect();
        void ucur(tava, tr.left - kr.left + tr.width / 2 - cx, tr.top - kr.top + tr.height / 2 - cy, 380, -30).then(() => coz(u ? [u] : []));
      },
      TEST_MODU ? 20 : 700,
    );
  });

  function ozet() {
    return { yag: +d.yag.toFixed(2), p: +d.p.toFixed(2), pisme: pismeAdi(d.p), tane: taneler.length, yumurta: d.yumurta, karisim: +d.karisim.toFixed(2), kabuk: d.kabuk, tuz: d.tuz, aci: d.aci, pankek: d.pankek ? { ...d.pankek, ust: pismeAdi(ustYuz(d.pankek)) } : null };
  }
  (window as unknown as { __rsTava?: unknown }).__rsTava = { olaylar, durum: ozet, pisir: (sn: number) => (ilerlet(sn), renkCiz(), durumGuncelle()) };
  yerlestir();
  renkCiz();
  durumGuncelle();

  return {
    bitti,
    arkaPlanda(): ArkaIs | null {
      if (!yemekVar() || odulde) return null;
      d.t = performance.now();
      const durum: TavaDurum = JSON.parse(JSON.stringify(d));
      return {
        durum,
        isaret: () => {
          const sn = (performance.now() - durum.t) / 1000;
          const p = durum.pankek && !Object.keys(durum.malzemeler).length && !durum.yumurta ? Math.min(3.6, durum.pankek.yuz[durum.pankek.alt] + sn * HIZ.pankek) : pis(durum.p, sn, HIZ.sebze);
          return { ses: 'ciz', buhar: p >= 1, pisme: pismeAdi(p) };
        },
      };
    },
    kapat() {
      kapandi = true;
      ro?.disconnect();
      clearInterval(zaman);
      clearInterval(yagZaman);
      clearInterval(dokZaman);
      cizDongu?.dur();
      kok.remove();
    },
  };
}

/** Raftaki kâse (tepsiden gelen doğranmış): içindekilerin küçük parçaları */
function kaseGorseli(oz: YemekOzelligi): HTMLElement {
  const el = h('span.rs-tv-raf-kase');
  let i = 0;
  for (const [m, md] of Object.entries(oz.malzemeler)) {
    for (let k = 0; k < Math.min(md!.adet, 4); k++, i++) {
      const p = parcaEl(m as Malzeme, { id: 0, gorunum: GOR[md!.kesim ?? 'kup'] === 'kirpik' ? 'kup' : GOR[md!.kesim ?? 'kup'], x: 0, y: 0, w: 0, h: 0 });
      p.classList.add('rs-p2-kase-parca');
      const a = i * 2.39996;
      const r = 26 * Math.sqrt((i + 0.5) / 8);
      p.style.left = `${50 + Math.cos(a) * r}%`;
      p.style.top = `${50 + Math.sin(a) * r}%`;
      el.append(p);
    }
  }
  return el;
}

/**
 * Tava ürününün küçük görünümü (tepside, masada): tavaVar true ise tavanın içinde; false ise yalnız yemek (Tabakla'da
 * tabağa konunca). Kutusunu doldurur; yüzde konumlu.
 */
export function tavaGorsel(b: TavaUrunBilgi['tava'], tavaVar: boolean): HTMLElement {
  const el = h('div.rs-tv-mini', { 'data-tava': tavaVar ? '1' : '0', 'data-pisme': b.pisme });
  const tavaResim = alet('tava');
  if (tavaVar) el.append(tavaResim ? h('img.rs-tv-mini-tava', { src: tavaResim, alt: '', draggable: 'false' }) : h('i.rs-tv-mini-tava-yt'));
  const ic = h('div.rs-tv-mini-ic', { 'data-pisme': b.pisme });
  el.append(ic);
  if (b.pankek) {
    const pk = h('i.rs-tv-mini-pankek', { 'data-ust': b.pankek.pisme });
    const ad = b.pankek.pisme === 'citir' ? 'pankek-citir' : b.pankek.pisme === 'cig' ? 'pankek-hamur' : 'pankek-altin';
    const u = yeni(`yiyecek/${ad}`);
    if (u) pk.style.background = `center / contain no-repeat url("${u}")`;
    pk.style.setProperty('--boy', String(b.pankek.boy));
    ic.append(pk);
    return el;
  }
  let i = 0;
  const toplam = b.parcalar.reduce((t, x) => t + x.n, 0) + b.yumurta * 4;
  for (const { m, g, n } of b.parcalar)
    for (let k = 0; k < n; k++, i++) {
      const p = parcaEl(m, { id: 0, gorunum: g === 'kirpik' ? 'kup' : g, x: 0, y: 0, w: 0, h: 0 });
      p.classList.add('rs-p2-kase-parca');
      const a = i * 2.39996;
      const r = 30 * Math.sqrt((i + 0.5) / Math.max(1, toplam));
      p.style.left = `${50 + Math.cos(a) * r}%`;
      p.style.top = `${50 + Math.sin(a) * r}%`;
      ic.append(p);
    }
  for (let k = 0; k < b.yumurta * 4; k++, i++) {
    const y = h('i.rs-tv-yumurta-parca');
    const a = i * 2.39996;
    const r = 30 * Math.sqrt((i + 0.5) / Math.max(1, toplam));
    y.style.left = `${50 + Math.cos(a) * r}%`;
    y.style.top = `${50 + Math.sin(a) * r}%`;
    ic.append(y);
  }
  return el;
}
