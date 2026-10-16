/**
 * KAZAN (ocak) · mercimek çorbası. ekip/senaryo/RESTORAN.md §8 M7, §3c, §4c.
 *
 * Rafta: tepsiden gelen doğranmış kâseler (havuç, soğan...), mercimek kavanozu, tuz, pul biber, nane, limon.
 * Hepsi gerçek seçim; hiçbiri zorunlu değil.
 *   - Malzeme kazana dökülür (şlap, sıçrama); mercimek avuç avuç (tane tane şıkırtı).
 *   - Kepçeyle büyük daireler: akıntı olur, parçalar kazanda döner, renkler birleşir. Fokur fokur kabarcıklar.
 *   - Baharat kavanozu kazanın üstünde SALLANDIKÇA serper (her yön değişimi bir serpme); dokunuş bir serpme.
 *     Limon: dokununca damla damla sıkılır.
 *   - MİNO TADIMI: dolu kepçe Mino'ya götürülünce Mino tadar ve dolaylı söyler: "Tuzlu! Su, su!" (yanakları
 *     kızarır), "Acı acı acı!" (kulaklarından buhar), "Ekşi ekşi!" (ekşi yüz), "Biraz tatsız…", "Daha pişmemiş…",
 *     "Su gibi!", "Mmm! Nefis!". Kaç kez tadarsa tadsın ceza yok.
 *   - Kâseye: dolu kepçe kâseye gider (şlurp). 3-4'te doldurma çizgisinde durur; 5-6'da taşabilir: taşan çorba
 *     tezgâha yayılır, Mino yalar, porsiyon kocaman olur (Baba sever).
 *   - Ödül: kıvamı tutunca kazanın üstünde kalp şeklinde buhar.
 * Kazan ocakta kendi pişer: geri çıkılınca arkaPlanda fokurdamaya devam eder, dönünce kaldığı yerden.
 */
import { konusuyorMu } from '../../../../src/audio/ses';
import { h, TEST_MODU } from '../../../../src/ui/dom';
import metin from '../../../../content/restoran/mini-kazan.json';
import { MALZEME_ADI, urunId, type ArkaIs, type Kesim, type Malzeme, type MalzemeDurumu, type MiniBaglam, type MiniGirdi, type MiniOturum, type MiniOyun, type Urun, type YemekOzelligi } from '../arayuz';
import { ezil, kipirda, parilti, sac, TITRESIM, ucur } from '../dogra/efekt';
import { parcaEl } from '../dogra/gorsel';
import type { Gorunum } from '../dogra/mantik';
import { surukle } from '../dogra/surukle';
import { Elde, merkez, minoYuzune, olayci, p5Ses, rafOge, rafYerlestir, resimYa, YUKARI, type RafOge } from '../kir-cirp/ortak';
import { bosKazan, CIZGI, corbaRengi, hazir as hazirMi, icerikVar, kasePorsiyon, kazanPis, kazanPisme, kepceDok, kepceKaristir, tadim, yeniMalzeme, type KazanDurum, type Tat } from './mantik';
import './kazan.css';

const M = metin.mino;
const GOR: Record<Kesim, Gorunum> = { butun: 'kup', yarim: 'yarim', iri: 'kup', dilim: 'dilim', ince: 'dilim', kup: 'kup', serit: 'serit', cubuk: 'cubuk', kiyim: 'kiyim', pure: 'pure' };
type RafTur = 'kase' | 'mercimek' | 'tuz' | 'pulbiber' | 'nane' | 'limon';

interface Kaseli {
  id: string;
  malzemeler: Partial<Record<Malzeme, MalzemeDurumu>>;
  ornek?: boolean;
}
interface KazanKayit {
  d: KazanDurum;
  kesim: Partial<Record<Malzeme, Kesim>>;
  kullanilan: string[];
  t: number;
}

export const oyun: MiniOyun = {
  ad: 'kazan',
  istasyon: 'ocak',
  simge: () => resimYa('alet/kazan-corba', 'kazan', 'rs-kz-simge'),
  baslat: (b, g) => kazanBaslat(b, g),
};

/** Tepside ve masada çorba kâsesi (kutusunu doldurur) */
export function corbaKase(renk: string, dolum: number): HTMLElement {
  const el = h('span.rs-p5-urun-kase.rs-kz-urun');
  el.style.setProperty('--ic', renk);
  el.style.setProperty('--dolum', String(Math.min(1, dolum)));
  return el;
}

function kazanBaslat(b: MiniBaglam, g: MiniGirdi): MiniOturum {
  const yas = g.yas;
  const kok = h('div.rs-p5-oyun.rs-kazan', { 'data-yas': yas });
  const { olaylar, olay } = olayci(kok);
  const onceki = g.devam as KazanKayit | undefined;
  let d: KazanDurum = onceki ? JSON.parse(JSON.stringify(onceki.d)) : bosKazan();
  const kesimler: Partial<Record<Malzeme, Kesim>> = onceki ? { ...onceki.kesim } : {};
  const kullanilan: string[] = onceki ? onceki.kullanilan.slice() : [];

  // raftaki kâseler: tepsiden (servis edilmeyen, malzemeli, kullanılmamış); deneme sayfasında örnek kâse
  const kaseler: Kaseli[] = g.tepsi
    .filter((u) => !u.servis && u.tur !== 'tabak' && !kullanilan.includes(u.id) && Object.keys(u.ozellik.malzemeler).length && u.tur !== 'hamur' && !u.ozellik.pisme)
    .map((u) => ({ id: u.id, malzemeler: u.ozellik.malzemeler }));
  if (!kaseler.length && !onceki && (g.tarif === 'corba' || !g.tarif) && !g.tepsi.length) {
    kaseler.push({ id: 'ornek', ornek: true, malzemeler: { havuc: { adet: 4, kesim: 'kup' }, sogan: { adet: 3, kesim: 'kup' } } });
  }

  // ------------------------------------------------------------ DOM
  const raf = h('div.rs-p5-raf');
  const kazan = h('div.rs-kz-kazan');
  const corba = h('div.rs-kz-corba');
  const taneKat = h('div.rs-kz-taneler');
  const parcaKat = h('div.rs-kz-parcalar');
  const kabarcikKat = h('div.rs-kz-kabarciklar');
  corba.append(taneKat, parcaKat, kabarcikKat);
  kazan.append(h('i.rs-kz-kulp.rs-sol'), h('i.rs-kz-kulp.rs-sag'), h('i.rs-kz-agiz'), corba);
  const kase = h('div.rs-kz-kase', {}, h('i.rs-kz-kase-dis'), h('i.rs-kz-kase-ic', {}, h('i.rs-kz-kase-corba'), h('i.rs-kz-cizgi')));
  const kaseCorba = kase.querySelector<HTMLElement>('.rs-kz-kase-corba')!;
  const tasma = h('i.rs-kz-tasma', { hidden: true });
  const kepce = h('div.rs-kz-kepce', { role: 'button', 'aria-label': 'Kepçe' }, h('i.rs-kz-kepce-sap'), h('i.rs-kz-kepce-bas', {}, h('i.rs-kz-kepce-ic')));
  const kepceIc = kepce.querySelector<HTMLElement>('.rs-kz-kepce-ic')!;
  const eldeKat = h('div.rs-kz-elde-kat');
  const buharKat = h('div.rs-kz-buhar-kat');
  kok.append(tasma, kazan, kase, raf, kepce, buharKat, eldeKat);
  b.kok.append(kok);
  const elde = new Elde(eldeKat, kok);

  const rafOgeleri: (RafOge<RafTur> & { kase?: Kaseli })[] = [];
  for (const k of kaseler) {
    const ic = h('span.rs-kz-raf-kase');
    let i = 0;
    for (const [m, md] of Object.entries(k.malzemeler)) {
      for (let n = 0; n < Math.min(md!.adet, 4); n++, i++) {
        const p = parcaEl(m as Malzeme, { id: 0, gorunum: GOR[md!.kesim ?? 'kup'], x: 0, y: 0, w: 0, h: 0 });
        p.classList.add('rs-p2-kase-parca');
        const a = i * 2.39996;
        const r = 24 * Math.sqrt((i + 0.5) / 8);
        p.style.left = `${50 + Math.cos(a) * r}%`;
        p.style.top = `${50 + Math.sin(a) * r}%`;
        ic.append(p);
      }
    }
    const el = rafOge(raf, rafOgeleri, 'kase', ic, 'Kâse');
    rafOgeleri[rafOgeleri.length - 1].kase = k;
    el.dataset.kase = k.id;
  }
  const mercimekRaf = rafOge(raf, rafOgeleri, 'mercimek', resimYa('alet/mercimek-kavanozu', 'mercimek'), MALZEME_ADI.mercimek);
  rafOge(raf, rafOgeleri, 'tuz', resimYa('alet/tuzluk', 'tuz'), MALZEME_ADI.tuz);
  rafOge(raf, rafOgeleri, 'pulbiber', resimYa('alet/pulbiber', 'pulbiber'), MALZEME_ADI.pulbiber);
  rafOge(raf, rafOgeleri, 'nane', resimYa('alet/nane-kavanozu', 'nane'), 'Nane');
  const limonRaf = rafOge(raf, rafOgeleri, 'limon', resimYa('alet/limon-yarim', 'limon'), MALZEME_ADI.limon);

  // ------------------------------------------------------------ yerleşim
  let cx = 300;
  let cy = 220;
  let R = 130;
  let Ri = 110;
  let kx = 600;
  let ky = 200;
  let kR = 60;
  let dinlenme = { x: 0, y: 0 };
  let kepceTutuluyor = false;
  function yerlestir() {
    const W = kok.clientWidth;
    const H = kok.clientHeight;
    if (!W || !H) return;
    const yatay = W >= H;
    kok.dataset.yon = yatay ? 'yatay' : 'dikey';
    const rafAlt = rafYerlestir(kok, raf, yatay);
    if (yatay) {
      const yuk = H - rafAlt - 14;
      R = Math.min(yuk * 0.5, W * 0.2);
      cx = Math.max(W * 0.36, R + 120);
      cy = rafAlt + 6 + yuk / 2;
      kR = Math.max(48, Math.min(R * 0.48, (W - cx - R - 40) * 0.3));
      kx = W - kR - 26;
      ky = rafAlt + kR + 16;
      dinlenme = { x: cx + R + 56, y: cy + R * 0.1 };
    } else {
      R = Math.min(W * 0.38, (H - rafAlt) * 0.24);
      cx = W / 2;
      cy = rafAlt + 34 + R;
      kR = Math.max(48, R * 0.5);
      kx = W * 0.3;
      ky = cy + R + 50 + kR;
      dinlenme = { x: W * 0.74, y: cy + R + 46 };
    }
    Ri = R * 0.84;
    kazan.style.cssText = `left:${cx - R}px;top:${cy - R}px;width:${R * 2}px;height:${R * 2}px`;
    kase.style.cssText = `left:${kx - kR}px;top:${ky - kR}px;width:${kR * 2}px;height:${kR * 2}px`;
    tasma.style.cssText = `left:${kx - kR * 1.45}px;top:${ky - kR * 1.3}px;width:${kR * 2.9}px;height:${kR * 2.7}px`;
    if (!kepceTutuluyor) kepceKoy(dinlenme.x, dinlenme.y);
  }
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => yerlestir()) : null;
  ro?.observe(kok);
  const kazanda = (x: number, y: number, pay = 1) => Math.hypot(x - cx, y - cy) < R * pay;
  const kasede = (x: number, y: number) => Math.hypot(x - kx, y - ky) < kR * 1.25;
  const minoda = (x: number, y: number) => {
    const m = merkez(b.mino.el, kok);
    return Math.abs(x - m.x) < Math.max(60, m.w * 0.6) && Math.abs(y - m.y) < Math.max(70, m.h * 0.6);
  };
  function kepceKoy(x: number, y: number) {
    kepce.style.transform = `translate(${x}px,${y}px)`;
  }

  // ------------------------------------------------------------ kazandaki parçalar (akıntıyla döner)
  interface Yuzen {
    el: HTMLElement;
    a: number;
    r: number;
    faz: number;
  }
  const yuzenler: Yuzen[] = [];
  let akim = 0;
  function parcaEkle(m: Malzeme, kesim: Kesim, n: number, kaynak?: { x: number; y: number }) {
    for (let i = 0; i < n; i++) {
      const el = parcaEl(m, { id: 0, gorunum: GOR[kesim] ?? 'kup', x: 0, y: 0, w: 0, h: 0 });
      el.classList.add('rs-kz-parca');
      parcaKat.append(el);
      const y: Yuzen = { el, a: Math.random() * Math.PI * 2, r: 0.2 + Math.sqrt(Math.random()) * 0.55, faz: Math.random() * 6 };
      yuzenler.push(y);
      yuzenKoy(y, 0);
      if (kaynak) {
        const p = { x: cx + Math.cos(y.a) * y.r * Ri, y: cy + Math.sin(y.a) * y.r * Ri };
        try {
          el.animate([{ translate: `${kaynak.x - p.x}px ${kaynak.y - p.y}px`, scale: '0.7' }, { translate: '0 -12px', scale: '1.1 0.9', offset: 0.75 }, { translate: '0 0', scale: '1' }], {
            duration: TEST_MODU ? 30 : 380,
            delay: TEST_MODU ? 0 : i * 30,
            easing: 'cubic-bezier(.3,.6,.4,1)',
            fill: 'backwards',
          });
        } catch {
          /* yok say */
        }
      }
    }
  }
  function yuzenKoy(y: Yuzen, t: number) {
    const bob = Math.sin(t * 2 + y.faz) * 0.015;
    y.el.style.left = `${50 + Math.cos(y.a) * (y.r + bob) * 50}%`;
    y.el.style.top = `${50 + Math.sin(y.a) * (y.r + bob) * 50}%`;
  }
  function taneEkle(n: number) {
    for (let i = 0; i < n; i++) {
      const el = h('i.rs-kz-tane');
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 0.8;
      el.style.left = `${50 + Math.cos(a) * r * 50}%`;
      el.style.top = `${50 + Math.sin(a) * r * 50}%`;
      taneKat.append(el);
    }
  }
  // geri dönüşte kazandakiler yeniden çizilir
  for (const [m, n] of Object.entries(d.malzemeler)) parcaEkle(m as Malzeme, kesimler[m as Malzeme] ?? 'kup', Math.min(n ?? 0, 6));
  taneEkle(Math.min(40, d.mercimek * 8));
  if (onceki) d.p = kazanPis(d, (performance.now() - onceki.t) / 1000);

  function dokulme(renk: string, x: number, y: number, guc = 1) {
    b.ses.cal('slap', { guc: 0.5 * guc, perde: 1.3 });
    b.dokunsal(TITRESIM.slap);
    sac(kok, x, y, 'damla', renk, 6, { yon: -Math.PI / 2, yay: 2.4, guc: 0.9 * guc, boy: 9 });
    ezil(corba, 0.5);
  }

  // ------------------------------------------------------------ raftan kazana
  function kaseDok(k: Kaseli, kaynak: { x: number; y: number }) {
    if (!k.ornek) kullanilan.push(k.id);
    rafOgeleri.find((o) => o.kase === k)?.el.classList.add('rs-kullanildi');
    for (const [m, md] of Object.entries(k.malzemeler)) {
      const mm = m as Malzeme;
      d.malzemeler[mm] = (d.malzemeler[mm] ?? 0) + md!.adet;
      kesimler[mm] = md!.kesim ?? 'kup';
      parcaEkle(mm, md!.kesim ?? 'kup', Math.min(md!.adet, 6), kaynak);
    }
    d.karisim = yeniMalzeme(d.karisim);
    dokulme(corbaRengi(d), cx, cy);
    olay('dokuldu');
    durumGuncelle();
  }
  function mercimekAt(kaynak?: { x: number; y: number }) {
    if (d.mercimek >= 6) return void kipirda(mercimekRaf, 4);
    const ilk = !d.mercimek;
    d.mercimek++;
    d.karisim = yeniMalzeme(d.karisim);
    p5Ses.tane();
    taneEkle(8);
    const p = kaynak && kazanda(kaynak.x, kaynak.y, 0.9) ? kaynak : { x: cx + (Math.random() - 0.5) * Ri, y: cy + (Math.random() - 0.5) * Ri };
    sac(kok, p.x, p.y, 'cekirdek', '#E8642C', 8, { guc: 0.5, boy: 6 });
    window.setTimeout(() => dokulme(corbaRengi(d), p.x, p.y, 0.6), TEST_MODU ? 0 : 120);
    if (ilk && !konusuyorMu()) void b.mino.soyle(M.ad.mercimek);
    olay('mercimek');
    durumGuncelle();
  }
  function serp(tur: 'tuz' | 'pulbiber' | 'nane', x?: number) {
    const ilk = tur === 'tuz' ? !d.tuz : tur === 'pulbiber' ? !d.aci : !d.nane;
    if (tur === 'tuz') d.tuz++;
    else if (tur === 'pulbiber') d.aci++;
    else d.nane++;
    b.ses.cal('citir', { guc: 0.3, perde: tur === 'nane' ? 1.2 : 1.6 });
    b.dokunsal(TITRESIM.hafif);
    const px = x ?? cx + (Math.random() - 0.5) * Ri * 0.8;
    sac(kok, px, cy - Ri * 0.2, 'cekirdek', tur === 'tuz' ? '#FFFFFF' : tur === 'pulbiber' ? '#C8321E' : '#3D8C3A', 8, { yon: Math.PI / 2, yay: 1.1, guc: 0.6, boy: 4 });
    if (tur !== 'tuz') {
      // pul biber ve nane çorbanın üstünde benek benek kalır
      const el = h('i.rs-kz-benek', { 'data-tur': tur });
      el.style.left = `${50 + ((px - cx) / Ri) * 50 + (Math.random() - 0.5) * 10}%`;
      el.style.top = `${42 + Math.random() * 16}%`;
      taneKat.append(el);
    }
    if (ilk && !konusuyorMu()) void b.mino.soyle(tur === 'tuz' ? M.ad.tuz : tur === 'pulbiber' ? M.ad.pulbiber : M.ad.nane);
    olay(tur);
    durumGuncelle();
  }
  function limonSik(x?: number) {
    const ilk = !d.eksi;
    d.eksi++;
    b.ses.cal('pit', { perde: 1.5, guc: 0.5 });
    b.dokunsal(TITRESIM.hafif);
    const px = x ?? cx + Ri * 0.2;
    sac(kok, px, cy - Ri * 0.3, 'damla', '#F7E36A', 5, { yon: Math.PI / 2, yay: 0.8, guc: 0.6, boy: 7 });
    ezil(limonRaf, 1.2);
    if (ilk && !konusuyorMu()) void b.mino.soyle(M.ad.limon);
    olay('limon');
    durumGuncelle();
  }

  for (const o of rafOgeleri) {
    const el = o.el;
    let yonX = 0;
    let sonX = 0;
    let serpti = 0;
    surukle(el, kok, {
      basla: (x, y) => {
        if (el.classList.contains('rs-kullanildi')) return false;
        elde.al(el, x, y, o.tur === 'kase' ? 'rs-kz-elde-kase' : '');
        el.classList.add('rs-p5-tutuldu');
        yonX = 0;
        serpti = 0;
        sonX = x;
        b.ses.cal('hop', { perde: 1.1, guc: 0.35 });
      },
      hareket: (x, y) => {
        elde.tasi(x, y);
        // baharat: kazanın üstünde sallandıkça serper (yön değişimi = bir serpme)
        if ((o.tur === 'tuz' || o.tur === 'pulbiber' || o.tur === 'nane') && kazanda(x, y - YUKARI, 1.05)) {
          const dx = x - sonX;
          if (Math.abs(dx) > 3) {
            const yon = Math.sign(dx);
            if (yonX && yon !== yonX) {
              serp(o.tur, x);
              serpti++;
              if (elde.el) ezil(elde.el, 0.8, 120);
            }
            yonX = yon;
          }
        }
        sonX = x;
      },
      birak: (x, y) => {
        el.classList.remove('rs-p5-tutuldu');
        const ici = kazanda(x, y - YUKARI, 1.1);
        elde.birak(ici && (o.tur === 'kase' || o.tur === 'mercimek') ? null : el);
        if (!ici) return;
        if (o.tur === 'kase' && o.kase) kaseDok(o.kase, { x, y: y - YUKARI });
        else if (o.tur === 'mercimek') mercimekAt({ x, y: y - YUKARI });
        else if (o.tur === 'limon') limonSik(x);
        else if (!serpti) serp(o.tur as "tuz" | "pulbiber" | "nane", x);
      },
      dokun: () => {
        el.classList.remove('rs-p5-tutuldu');
        elde.birak();
        ezil(el, 1.3);
        if (o.tur === 'kase' && o.kase) return kaseDok(o.kase, merkez(el, kok));
        if (o.tur === 'mercimek') return mercimekAt();
        if (o.tur === 'limon') return limonSik();
        serp(o.tur as 'tuz' | 'pulbiber' | 'nane');
      },
    });
  }

  // ------------------------------------------------------------ kepçe: karıştır, doldur, tattır
  let dolu = false;
  let sonK = { x: 0, y: 0 };
  let kepceYol = 0;
  function kepceDolu(v: boolean) {
    dolu = v;
    kepce.classList.toggle('rs-dolu', v);
    kepceIc.style.background = corbaRengi(d);
  }
  function karistir(kx2: number, ky2: number, dx: number, dy: number) {
    const yol = Math.hypot(dx, dy);
    if (yol < 0.5) return;
    // teğet hız: akıntı
    const rx = kx2 - cx;
    const ry = ky2 - cy;
    const l = Math.hypot(rx, ry) || 1;
    const teget = (rx * dy - ry * dx) / l / Ri;
    akim = Math.max(-3, Math.min(3, akim + teget * 0.6));
    if (icerikVar(d)) {
      const once = d.karisim;
      d.karisim = kepceKaristir(d.karisim, yol, Ri, yas);
      if (Math.floor(once * 8) !== Math.floor(d.karisim * 8)) renkCiz();
    }
    if ((kepceYol += yol) > 70) {
      kepceYol = 0;
      b.ses.cal('siril', { guc: 0.18, perde: 0.8 + Math.random() * 0.2 });
      if (icerikVar(d) && Math.random() < 0.5) b.ses.cal('fokur', { guc: 0.5 });
    }
    if (!dolu) kepceDolu(true);
    durumGuncelle(false);
  }
  surukle(kepce, kok, {
    basla: (x, y) => {
      kepceTutuluyor = true;
      kepce.classList.add('rs-tutuluyor');
      sonK = { x, y: y - 26 };
      kepceKoy(x, y - 26);
      b.ses.cal('tik', { guc: 0.35, perde: 0.8 });
    },
    hareket: (x, y) => {
      const tx = x;
      const ty = y - 26;
      kepceKoy(tx, ty);
      if (kazanda(tx, ty, 0.84)) karistir(tx, ty, tx - sonK.x, ty - sonK.y);
      sonK = { x: tx, y: ty };
    },
    birak: (x, y) => kepceBirak(x, y - 26),
    dokun: () => {
      // dokununca kepçe kazanda kendi kendine bir tur döner
      kepceTutuluyor = true;
      const adim = TEST_MODU ? 6 : 22;
      const r = Ri * 0.5;
      let i = 0;
      sonK = { x: cx + r, y: cy };
      const z = window.setInterval(() => {
        const a = (i / adim) * Math.PI * 2;
        const tx = cx + Math.cos(a) * r;
        const ty = cy + Math.sin(a) * r;
        kepceKoy(tx, ty);
        karistir(tx, ty, tx - sonK.x, ty - sonK.y);
        sonK = { x: tx, y: ty };
        if (++i > adim) {
          clearInterval(z);
          kepceBirak(-1, -1);
        }
      }, 40);
      zamanlar.push(z);
    },
  });
  const zamanlar: number[] = [];
  function kepceBirak(x: number, y: number) {
    kepce.classList.remove('rs-tutuluyor');
    kepceTutuluyor = false;
    if (dolu && kasede(x, y)) kaseyeDok();
    else if (minoda(x, y)) tadimYap();
    else if (dolu && !kazanda(x, y, 1)) kepceDolu(false);
    kepceKoy(dinlenme.x, dinlenme.y);
    if (d.karisim > 0.05) olay('karistir');
    durumGuncelle();
  }
  function kaseyeDok() {
    if (!icerikVar(d)) {
      // yalnız su: yine dökülür ama Mino güler
      if (!konusuyorMu()) void b.mino.soyle(M.tat.su);
    }
    const s = kepceDok(d.dolum, yas);
    d.dolum = s.dolum;
    kepceDolu(false);
    p5Ses.slurp();
    b.dokunsal(TITRESIM.hafif);
    ezil(kase, 0.6);
    kaseCiz();
    olay('kaseye');
    if (s.dondu) olay('cizgi');
    if (s.tasti && !d.tasti) {
      d.tasti = true;
      tasma.hidden = false;
      tasma.style.background = corbaRengi(d);
      sac(kok, kx, ky, 'damla', corbaRengi(d), 8, { guc: 1.2, boy: 10 });
      olay('tasti');
      window.setTimeout(
        () => {
          if (kapandi) return;
          void b.mino.tepki('tat', 1500);
          void b.mino.soyle(M.tasti);
        },
        TEST_MODU ? 10 : 250,
      );
    }
  }
  function kaseCiz() {
    kaseCorba.style.setProperty('--dolum', String(Math.min(1, d.dolum)));
    kaseCorba.style.background = corbaRengi(d);
    kase.classList.toggle('rs-cizgide', d.dolum >= CIZGI - 0.01);
  }
  /** Mino tadar ve dolaylı söyler */
  function tadimYap() {
    if (!dolu) {
      void b.mino.tepki('sasir', 900);
      if (!konusuyorMu()) void b.mino.soyle(M.bos);
      olay('tadim-bos');
      return;
    }
    kepceDolu(false);
    const t: Tat = tadim(d);
    olay(`tadim-${t}`);
    p5Ses.slurp();
    void b.mino.tepki('tat', TEST_MODU ? 30 : 700).then(() => {
      if (kapandi) return;
      if (t === 'tuzlu') {
        minoYuzune(kok, b.mino, 'kizar', 2400);
        void b.mino.tepki('sasir', 1600);
      } else if (t === 'aci') {
        minoYuzune(kok, b.mino, 'kizar', 2400);
        const m = merkez(b.mino.el, kok);
        sac(kok, m.x - m.w * 0.3, m.y - m.h * 0.25, 'buhar', '#fff', 2, { yon: -Math.PI / 2, yay: 0.4, guc: 0.6 });
        sac(kok, m.x + m.w * 0.3, m.y - m.h * 0.25, 'buhar', '#fff', 2, { yon: -Math.PI / 2, yay: 0.4, guc: 0.6 });
        void b.mino.tepki('zipla', 1400);
      } else if (t === 'eksi') void b.mino.tepki('eksi', 1500);
      else if (t === 'mmm') {
        void b.mino.tepki('sevin', 1200);
        const m = merkez(b.mino.el, kok);
        parilti(kok, m.x, m.y - m.h * 0.2, 5, 40);
      } else void b.mino.tepki('bak', 1200);
      void b.mino.soyle(M.tat[t]);
    });
  }

  // ------------------------------------------------------------ zaman: pişme, kabarcık, akıntı
  let fokur: { guc(g: number): void; dur(): void } | null = null;
  let sonT = performance.now();
  let sonKabarcik = 0;
  let fokurDendi = false;
  let kapandi = false;
  const zaman = window.setInterval(() => {
    const t = performance.now();
    const sn = (t - sonT) / 1000;
    sonT = t;
    const onceP = d.p;
    d.p = kazanPis(d, sn * (TEST_MODU && new URLSearchParams(location.search).has('hizli') ? 8 : 1));
    // akıntı yavaşlar; parçalar döner
    akim *= Math.pow(0.35, sn);
    for (const y of yuzenler) {
      y.a += (akim * 0.9 + 0.06) * sn;
      yuzenKoy(y, t / 1000);
    }
    if (icerikVar(d)) {
      if (!fokur) fokur = b.ses.dongu('fokur');
      fokur.guc(Math.min(1, 0.25 + d.p * 0.3));
      // kabarcık: ısındıkça sıklaşır
      const ara = d.p < 0.5 ? 1400 : d.p < 1.5 ? 650 : 380;
      if (t - sonKabarcik > ara) {
        sonKabarcik = t;
        kabarcik();
      }
      if (onceP < 1 && d.p >= 1 && !fokurDendi) {
        fokurDendi = true;
        if (!konusuyorMu()) void b.mino.soyle(M.fokur);
        olay('fokur');
      }
    }
    if (Math.floor(onceP * 4) !== Math.floor(d.p * 4)) renkCiz();
    durumGuncelle(false);
  }, 60);
  function kabarcik() {
    const el = h('i.rs-kz-kabarcik');
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * 0.75;
    el.style.left = `${50 + Math.cos(a) * r * 50}%`;
    el.style.top = `${50 + Math.sin(a) * r * 50}%`;
    el.style.setProperty('--b', `${8 + Math.random() * 10}px`);
    kabarcikKat.append(el);
    try {
      el.animate([{ transform: 'scale(0.2)', opacity: 0.9 }, { transform: 'scale(1)', opacity: 1, offset: 0.7 }, { transform: 'scale(1.25)', opacity: 0 }], { duration: TEST_MODU ? 60 : 700, easing: 'ease-out', fill: 'forwards' }).finished.then(
        () => el.remove(),
        () => el.remove(),
      );
    } catch {
      el.remove();
    }
  }
  function renkCiz() {
    const r = corbaRengi(d);
    corba.style.background = r;
    corba.dataset.pisme = kazanPisme(d.p);
    // pişince malzemeler çözülür (renge karışır)
    const coz = Math.min(0.65, d.p * 0.22 + d.karisim * 0.15);
    parcaKat.style.opacity = String(1 - coz);
    taneKat.style.setProperty('--coz', String(1 - Math.min(0.8, d.p * 0.3)));
    if (dolu) kepceIc.style.background = r;
    kaseCiz();
  }

  // ------------------------------------------------------------ doğal son (kalp buhar), ipucu
  let hazirDi = false;
  function kalpBuhar() {
    const n = TEST_MODU ? 6 : 14;
    const olc = Ri * 0.034;
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      const el = h('i.rs-kz-kalp-buhar');
      el.style.left = `${cx + x * olc}px`;
      el.style.top = `${cy - Ri * 0.35 + y * olc}px`;
      buharKat.append(el);
      try {
        el.animate([{ opacity: 0, transform: 'translateY(10px) scale(0.5)' }, { opacity: 0.95, transform: 'translateY(0) scale(1)', offset: 0.3 }, { opacity: 0.9, transform: 'translateY(-14px) scale(1.05)', offset: 0.75 }, { opacity: 0, transform: 'translateY(-30px) scale(1.2)' }], {
          duration: TEST_MODU ? 80 : 2200,
          delay: TEST_MODU ? 0 : i * 30,
          easing: 'ease-out',
          fill: 'both',
        }).finished.then(
          () => el.remove(),
          () => el.remove(),
        );
      } catch {
        el.remove();
      }
    }
  }
  function durumGuncelle(ipucuDa = true) {
    const hz = hazirMi(d, yas);
    if (hz && !hazirDi) {
      hazirDi = true;
      kalpBuhar();
      b.ses.cal('ting');
      b.tepsi.hopla();
      void b.mino.tepki('sevin', 1000);
      if (!konusuyorMu()) void b.mino.soyle(M.hazir);
      olay('kalp');
    }
    kok.dataset.durum = JSON.stringify(ozet());
    if (ipucuDa) ipucuGuncelle();
  }
  function ipucuGuncelle() {
    if (odulde) return b.ipucu.hedef(null);
    if (!icerikVar(d)) {
      const ilk = rafOgeleri.find((o) => o.tur === 'kase' && !o.el.classList.contains('rs-kullanildi'))?.el ?? mercimekRaf;
      return b.ipucu.hedef({ el: () => ilk, soz: M.ipucu.bos, hareket: 'surukle', nereye: () => kazan });
    }
    if (d.karisim < 0.999) return b.ipucu.hedef({ el: () => kepce, soz: M.ipucu.karistir, hareket: 'daire' });
    if (!hazirMi(d, yas)) return b.ipucu.hedef({ el: () => kepce, soz: M.ipucu.pisiyor, hareket: 'daire' });
    if (d.dolum < 0.3) return b.ipucu.hedef({ el: () => kepce, soz: M.ipucu.kase, hareket: 'surukle', nereye: () => kase });
    b.ipucu.hedef({ el: () => b.tepsi.el, soz: M.ipucu.bitti, hareket: 'dokun' });
  }

  // ------------------------------------------------------------ ürün, ödül anı, arka plan
  function urunYap(): Urun | null {
    if (!icerikVar(d)) return null;
    const malzemeler: YemekOzelligi['malzemeler'] = {};
    if (d.mercimek) malzemeler.mercimek = { adet: d.mercimek };
    for (const [m, n] of Object.entries(d.malzemeler)) if (n) malzemeler[m as Malzeme] = { adet: n, kesim: kesimler[m as Malzeme] };
    if (d.eksi) malzemeler.limon = { adet: d.eksi };
    const ozellik: YemekOzelligi = {
      malzemeler,
      pisme: kazanPisme(d.p),
      sicak: true,
      dolum: +Math.min(1, d.dolum).toFixed(2),
      porsiyon: kasePorsiyon(d.dolum, d.tasti),
      karisim: +d.karisim.toFixed(2),
    };
    if (d.tuz) ozellik.tuz = Math.min(3, d.tuz);
    if (d.aci) ozellik.aci = Math.min(3, d.aci);
    if (d.eksi) ozellik.eksi = Math.min(3, d.eksi);
    const renk = corbaRengi(d);
    const dol = d.dolum;
    return { id: urunId('corba'), tur: 'corba', yemek: 'corba', servis: true, ozellik, kullanilan: kullanilan.slice(), gorsel: () => corbaKase(renk, dol), kazan: { nane: d.nane, tasti: d.tasti } } as Urun & { kazan: { nane: number; tasti: boolean } };
  }
  let odulde = false;
  let coz: (u: Urun[]) => void = () => undefined;
  const bittiSoz = new Promise<Urun[]>((r) => (coz = r));
  b.tepsi.dinle(() => {
    if (odulde) return;
    if (!icerikVar(d)) return coz([]);
    odulde = true;
    b.ipucu.hedef(null);
    olay('odul');
    // kâse boşsa kepçe kendisi doldurur (çocuk istediği an çıkabilir)
    if (d.dolum < 0.3) {
      d.dolum = CIZGI;
      p5Ses.slurp();
      kaseCiz();
    }
    b.ses.cal('ting');
    parilti(kok, kx, ky, 7, kR);
    sac(kok, kx, ky - kR * 0.3, 'buhar', '#fff', 4, { yon: -Math.PI / 2, yay: 1.2, guc: 0.6, boy: 30 });
    const u = urunYap();
    window.setTimeout(
      () => {
        const t = merkez(b.tepsi.el, kok);
        void ucur(kase, t.x - kx, t.y - ky, 380, -30).then(() => coz(u ? [u] : []));
      },
      TEST_MODU ? 20 : 700,
    );
  });

  function ozet() {
    return { ...d, p: +d.p.toFixed(2), karisim: +d.karisim.toFixed(3), pisme: kazanPisme(d.p), dolu, tat: tadim(d) };
  }
  (window as unknown as { __rsKazan?: unknown }).__rsKazan = {
    olaylar,
    durum: ozet,
    merkez: () => ({ cx, cy, R, Ri, kx, ky, kR }),
    pisir: (sn: number) => {
      d.p = kazanPis(d, sn);
      renkCiz();
      durumGuncelle();
    },
  };
  yerlestir();
  renkCiz();
  durumGuncelle();

  return {
    bitti: bittiSoz,
    arkaPlanda(): ArkaIs | null {
      if (!icerikVar(d) || odulde) return null;
      const durum: KazanKayit = JSON.parse(JSON.stringify({ d, kesim: kesimler, kullanilan, t: performance.now() }));
      return {
        durum,
        isaret: () => {
          const p = kazanPis(durum.d, (performance.now() - durum.t) / 1000);
          return { ses: 'fokur', buhar: p >= 0.8, pisme: kazanPisme(p) };
        },
      };
    },
    kapat() {
      kapandi = true;
      ro?.disconnect();
      clearInterval(zaman);
      zamanlar.forEach((z) => clearInterval(z));
      fokur?.dur();
      kok.remove();
    },
  };
}
