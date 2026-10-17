/**
 * SÜTLAÇ (ocak + küçük fırın) · ekip/senaryo/RESTORAN.md §8 M17 (v1.1): Kazan ve Fırın'ın yeni hareketlerle tekrarı
 * değil, kendi küçük oyunu: kâselere seviyeyle dök, fırında üstünü kızart, tarçın kavanozunu salla. Bulut'un en sevdiği.
 *
 * Rafta süt, pirinç, şeker, tarçın (tepsiden Kır-Çırp'ın şekerli sütü de gelir).
 *   - Tencereye süt, pirinç, şeker (avuç avuç / kaşık kaşık). Kepçeyle daire çiz: koyulaşır (renk kremaya döner).
 *   - Dolu kepçeyi kâsenin üstünde tut: tuttukça dolar (3-4 çizgide durur; 5-6 taşabilir: tepsiye taşar, Mino yalar).
 *     3-4 dokunuş yolu: kâseye dokununca kepçe kendisi doldurur.
 *   - Kâseler tepsisiyle fırına (fırına dokun): kapak camından tepeler kızarır; bir daha dokununca çıkar.
 *     Fırın kendi pişirir (geri çıkılınca arkaPlanda).
 *   - Tarçın kavanozunu kâselerin üstünde salla (yön değişimi bir serpme; dokununca her kâseye bir serpme).
 *   - Ödül: kâseler parlar, buhar kalbi; Mino "Bulut buna bayılır!" (dolaylı keşif ipucu).
 */
import { konusuyorMu } from '../../../../src/audio/ses';
import { h, TEST_MODU } from '../../../../src/ui/dom';
import metin from '../../../../content/restoran/mini-sutlac.json';
import { MALZEME_ADI, urunId, type ArkaIs, type MiniBaglam, type MiniGirdi, type MiniOturum, type MiniOyun, type Urun } from '../arayuz';
import { ezil, hopla, kipirda, parilti, sac, TITRESIM, ucur } from '../dogra/efekt';
import { surukle } from '../dogra/surukle';
import { Elde, merkez, minoYuzune, olayci, p5Ses, rafOge, rafYerlestir, YUKARI, type RafOge } from '../kir-cirp/ortak';
import { p6Ses } from '../yogur/ortak';
import { bosKase, bosTencere, CIZGI, doldur, firinda, icerikVar, karistir, pismeAdi, sutlacOzelligi, type Kase, type Tencere } from './mantik';
import './sutlac.css';

const M = metin.mino;
type RafTur = 'sut' | 'pirinc' | 'seker' | 'tarcin';

export const oyun: MiniOyun = {
  ad: 'sutlac',
  istasyon: 'ocak',
  simge: () => h('span.rs-sl-simge', {}, kaseEl({ dolum: 0.85, tasti: false, p: 2.2, tarcin: 2 })),
  baslat: (b, g) => sutlacBaslat(b, g),
};

/** Sütlaç kâsesi (üstten): kutusunu doldurur */
export function kaseEl(k: Kase): HTMLElement {
  const el = h('span.rs-sl-kase', { 'data-pisme': pismeAdi(k.p) }, h('i.rs-sl-kase-ic', {}, h('i.rs-sl-sutlac'), h('i.rs-sl-cizgi'), h('i.rs-sl-tarcin')));
  kaseGuncelle(el, k);
  return el;
}
function kaseGuncelle(el: HTMLElement, k: Kase) {
  el.style.setProperty('--dolum', String(Math.min(1, k.dolum)));
  el.style.setProperty('--kizar', String(Math.min(1, k.p / 3)));
  el.style.setProperty('--tarcin', String(Math.min(1, k.tarcin / 3)));
  el.dataset.pisme = pismeAdi(k.p);
  el.dataset.tasti = k.tasti ? '1' : '';
}
/** Tepside / masada: kâseler küçük tepside */
export function sutlacGorsel(ks: Kase[]): HTMLElement {
  const el = h('span.rs-sl-tepsi-gorsel');
  const dolu = ks.filter((k) => k.dolum > 0.1);
  dolu.forEach((k, i) => {
    const e = kaseEl(k);
    const w = Math.min(44, 86 / Math.max(1, dolu.length));
    e.style.cssText = `position:absolute;width:${w}%;aspect-ratio:1;left:${(100 / (dolu.length + 1)) * (i + 1) - w / 2}%;top:50%;translate:0 -50%`;
    kaseGuncelle(e, k);
    el.append(e);
  });
  return el;
}

interface SutlacKayit {
  t: Tencere;
  kaseler: Kase[];
  firinda: boolean;
  zaman: number;
}

function sutlacBaslat(b: MiniBaglam, g: MiniGirdi): MiniOturum {
  const yas = g.yas;
  const kok = h('div.rs-p5-oyun.rs-sutlac', { 'data-yas': yas });
  const { olaylar, olay } = olayci(kok);
  let kapandi = false;
  const zamanlar: number[] = [];
  const zaman = (f: () => void, ms: number) => zamanlar.push(window.setTimeout(f, TEST_MODU ? Math.min(ms, 30) : ms));
  const onceki = g.devam as SutlacKayit | undefined;
  const t: Tencere = onceki ? { ...onceki.t } : bosTencere();
  const kaseler: Kase[] = onceki ? onceki.kaseler.map((k) => ({ ...k })) : [bosKase(), bosKase(), bosKase()];
  let firinIcinde = onceki?.firinda ?? false;
  const kullanilan: string[] = [];
  // Kır-Çırp'ın şekerli sütü (sut-karisimi) tepsideyse tencereye o konur
  const hazirSut = !onceki ? g.tepsi.find((u) => u.tur === 'sut-karisimi') : undefined;
  if (hazirSut) {
    t.sut = Math.max(1, hazirSut.ozellik.malzemeler.sut?.adet ?? 1);
    t.seker = hazirSut.ozellik.malzemeler.seker?.adet ?? 0;
    kullanilan.push(hazirSut.id);
  }

  // ------------------------------------------------------------ DOM
  const raf = h('div.rs-p5-raf');
  const tencere = h('div.rs-sl-tencere', {}, h('i.rs-sl-tencere-dis'), h('i.rs-sl-kulp.rs-sol'), h('i.rs-sl-kulp.rs-sag'), h('i.rs-sl-ic', {}, h('i.rs-sl-taneler'), h('i.rs-sl-kabarcik')));
  const ic = tencere.querySelector<HTMLElement>('.rs-sl-ic')!;
  const kepce = h('div.rs-sl-kepce', { role: 'button', 'aria-label': 'Kepçe' }, h('i.rs-sl-kepce-sap'), h('i.rs-sl-kepce-bas', {}, h('i.rs-sl-kepce-ic')));
  const tepsi = h('div.rs-sl-tepsi');
  const kaseEller = kaseler.map((k) => {
    const e = kaseEl(k);
    e.setAttribute('role', 'button');
    tepsi.append(e);
    return e;
  });
  const firin = h('div.rs-sl-firin', { role: 'button', 'aria-label': 'Fırın' }, h('i.rs-sl-firin-govde'), h('i.rs-sl-firin-cam', {}, h('i.rs-sl-firin-isik')), h('i.rs-sl-firin-dugme'));
  const eldeKat = h('div.rs-sl-elde-kat');
  const efektKat = h('div.rs-sl-efekt');
  kok.append(tencere, tepsi, firin, raf, kepce, efektKat, eldeKat);
  b.kok.append(kok);
  const elde = new Elde(eldeKat, kok);
  const rafOgeleri: RafOge<RafTur>[] = [];
  const ikon = (tur: RafTur) => h('i.rs-sl-yt', { 'data-yt': tur });
  rafOge(raf, rafOgeleri, 'sut', ikon('sut'), MALZEME_ADI.sut);
  const pirincRaf = rafOge(raf, rafOgeleri, 'pirinc', ikon('pirinc'), MALZEME_ADI.pirinc);
  rafOge(raf, rafOgeleri, 'seker', ikon('seker'), MALZEME_ADI.seker);
  const tarcinRaf = rafOge(raf, rafOgeleri, 'tarcin', ikon('tarcin'), MALZEME_ADI.tarcin);

  // ------------------------------------------------------------ yerleşim
  let cx = 240;
  let cy = 220;
  let R = 110;
  let tp = { x: 0, y: 0, w: 0, h: 0 };
  let fr = { x: 0, y: 0, w: 0, h: 0 };
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
      R = Math.min(yuk * 0.44, W * 0.16);
      cx = Math.max(W * 0.27, R + 114);
      cy = rafAlt + 6 + yuk / 2;
      const x0 = cx + R + 30;
      const sagSutun = Math.max(150, W * 0.2);
      tp = { x: x0, y: rafAlt + 16, w: W - x0 - sagSutun - 10, h: Math.min(yuk * 0.5, 130) };
      fr = { x: W - sagSutun, y: rafAlt + 10, w: sagSutun - 16, h: Math.min(yuk - 110, (sagSutun - 16) * 0.9) };
      dinlenme = { x: x0 + 20, y: tp.y + tp.h + 50 };
    } else {
      R = Math.min(W * 0.3, (H - rafAlt) * 0.18);
      cx = W * 0.36;
      cy = rafAlt + 20 + R;
      tp = { x: 14, y: cy + R + 26, w: W - 28, h: Math.min(130, W * 0.32) };
      fr = { x: W * 0.12, y: tp.y + tp.h + 18, w: W * 0.5, h: W * 0.42 };
      dinlenme = { x: W * 0.84, y: cy };
    }
    tencere.style.cssText = `left:${cx - R}px;top:${cy - R}px;width:${R * 2}px;height:${R * 2}px`;
    tepsi.style.cssText = `left:${tp.x}px;top:${tp.y}px;width:${tp.w}px;height:${tp.h}px`;
    firin.style.cssText = `left:${fr.x}px;top:${fr.y}px;width:${fr.w}px;height:${fr.h}px`;
    if (!kepceTutuluyor) kepceKoy(dinlenme.x, dinlenme.y);
    tepsiYerineCiz();
  }
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => yerlestir()) : null;
  ro?.observe(kok);
  const kepceKoy = (x: number, y: number) => (kepce.style.transform = `translate(${x}px,${y}px)`);
  const tencerede = (x: number, y: number, pay = 1) => Math.hypot(x - cx, y - cy) < R * 0.86 * pay;
  /** tepsi fırındaysa fırının içinde görünür (kapak camından) */
  function tepsiYerineCiz() {
    tepsi.classList.toggle('rs-firinda', firinIcinde);
    firin.classList.toggle('rs-dolu', firinIcinde);
    if (firinIcinde) tepsi.style.cssText = `left:${fr.x + fr.w * 0.14}px;top:${fr.y + fr.h * 0.28}px;width:${fr.w * 0.72}px;height:${fr.h * 0.42}px`;
    else tepsi.style.cssText = `left:${tp.x}px;top:${tp.y}px;width:${tp.w}px;height:${tp.h}px`;
  }

  // ------------------------------------------------------------ tencere: süt, pirinç, şeker
  function tencereCiz() {
    ic.style.setProperty('--sut', String(Math.min(1, t.sut / 2)));
    ic.style.setProperty('--kivam', t.kivam.toFixed(2));
    ic.style.setProperty('--kalan', t.kalan.toFixed(2));
    ic.dataset.pirinc = String(Math.min(4, t.pirinc));
    ic.dataset.bos = !t.sut && !t.pirinc ? '1' : '';
  }
  function ekle(tur: RafTur, kaynak?: { x: number; y: number }) {
    if (tur === 'tarcin') return tarcinSerp();
    if (tur === 'sut') {
      t.sut = Math.min(3, t.sut + 1);
      p5Ses.likir(1);
    } else if (tur === 'pirinc') {
      t.pirinc = Math.min(4, t.pirinc + 1);
      p5Ses.tane();
      sac(kok, kaynak?.x ?? cx, kaynak?.y ?? cy, 'cekirdek', '#FFFDF5', 6, { guc: 0.5, boy: 5 });
    } else {
      t.seker = Math.min(4, t.seker + 1);
      p5Ses.kasik(true);
    }
    t.kivam *= 0.6;
    ezil(ic, 0.5);
    b.dokunsal(TITRESIM.hafif);
    olay(`ekle-${tur}`);
    if (olaylar.filter((o) => o === `ekle-${tur}`).length === 1 && !konusuyorMu()) void b.mino.soyle((M.ad as Record<string, string>)[tur]);
    tencereCiz();
    durumGuncelle();
  }

  // ------------------------------------------------------------ tarçın: kâselerin üstünde salla
  function tarcinSerp(x?: number) {
    const hedefler = x === undefined ? kaseler.map((_, i) => i).filter((i) => kaseler[i].dolum > 0.1) : [kaseYakin(x)].filter((i): i is number => i !== null && kaseler[i].dolum > 0.1);
    if (!hedefler.length || firinIcinde) {
      kipirda(tarcinRaf, 3);
      return;
    }
    for (const i of hedefler) {
      kaseler[i].tarcin = Math.min(4, kaseler[i].tarcin + 1);
      kaseGuncelle(kaseEller[i], kaseler[i]);
      const m = merkez(kaseEller[i], kok);
      sac(kok, m.x, m.y - m.h * 0.3, 'cekirdek', '#8A4A2A', 6, { yon: Math.PI / 2, yay: 1.2, guc: 0.5, boy: 3 });
    }
    b.ses.cal('citir', { guc: 0.25, perde: 1.4 });
    olay('tarcin');
    if (olaylar.filter((o) => o === 'tarcin').length === 1 && !konusuyorMu()) void b.mino.soyle(M.ad.tarcin);
    durumGuncelle();
  }
  const kaseYakin = (x: number): number | null => {
    let en = Infinity;
    let i: number | null = null;
    kaseEller.forEach((e, k) => {
      const m = merkez(e, kok);
      const d = Math.abs(m.x - x);
      if (d < en && d < m.w) {
        en = d;
        i = k;
      }
    });
    return i;
  };

  for (const o of rafOgeleri) {
    const el = o.el;
    let yonX = 0;
    let sonX = 0;
    surukle(el, kok, {
      basla: (x, y) => {
        elde.al(el, x, y, 'rs-sl-elde');
        el.classList.add('rs-p5-tutuldu');
        b.ses.cal('hop', { perde: 1.1, guc: 0.35 });
        yonX = 0;
        sonX = x;
      },
      hareket: (x, y) => {
        elde.tasi(x, y);
        if (o.tur === 'tarcin' && y - YUKARI > tp.y - 60 && y - YUKARI < tp.y + tp.h + 20) {
          const dx = x - sonX;
          if (Math.abs(dx) > 4) {
            const yon = Math.sign(dx);
            if (yonX && yon !== yonX) {
              tarcinSerp(x);
              if (elde.el) ezil(elde.el, 0.8, 120);
            }
            yonX = yon;
          }
        }
        sonX = x;
      },
      birak: (x, y) => {
        el.classList.remove('rs-p5-tutuldu');
        const ici = tencerede(x, y - YUKARI, 1.15);
        elde.birak(ici && o.tur !== 'tarcin' ? null : el);
        if (ici && o.tur !== 'tarcin') ekle(o.tur, { x, y: y - YUKARI });
      },
      dokun: () => {
        el.classList.remove('rs-p5-tutuldu');
        elde.birak();
        ezil(el, 1.3);
        ekle(o.tur);
      },
    });
  }

  // ------------------------------------------------------------ kepçe: karıştır, kâselere dök
  let dolu = false;
  let sonK = { x: 0, y: 0 };
  let dokYer: number | null = null;
  let firYol = 0;
  function kepceDolu(v: boolean) {
    dolu = v;
    kepce.classList.toggle('rs-dolu', v);
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
      const p = { x, y: y - 26 };
      kepceKoy(p.x, p.y);
      if (tencerede(p.x, p.y)) {
        const yol = Math.hypot(p.x - sonK.x, p.y - sonK.y);
        karistirma(yol);
        if (icerikVar(t) && t.kalan > 0) kepceDolu(true);
        dokYer = null;
      } else if (dolu) dokYer = kaseYakinNokta(p.x, p.y);
      sonK = p;
    },
    birak: () => {
      kepceTutuluyor = false;
      kepce.classList.remove('rs-tutuluyor');
      dokYer = null;
      kepceKoy(dinlenme.x, dinlenme.y);
      durumGuncelle();
    },
    dokun: () => {
      // dokununca kepçe tencerede kendisi bir tur döner
      kepceTutuluyor = true;
      const adim = TEST_MODU ? 6 : 22;
      let i = 0;
      const r = R * 0.45;
      sonK = { x: cx + r, y: cy };
      const z = window.setInterval(() => {
        const a = (i / adim) * Math.PI * 2;
        const p = { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
        kepceKoy(p.x, p.y);
        karistirma(Math.hypot(p.x - sonK.x, p.y - sonK.y) * (TEST_MODU ? 4 : 1));
        sonK = p;
        if (++i > adim) {
          clearInterval(z);
          kepceTutuluyor = false;
          if (icerikVar(t)) kepceDolu(true);
          kepceKoy(dinlenme.x, dinlenme.y);
          durumGuncelle();
        }
      }, 40);
      zamanlar.push(z);
    },
  });
  const kaseYakinNokta = (x: number, y: number): number | null => {
    if (firinIcinde) return null;
    let i: number | null = null;
    kaseEller.forEach((e, k) => {
      const m = merkez(e, kok);
      if (Math.hypot(m.x - x, m.y - y) < m.w * 0.7) i = k;
    });
    return i;
  };
  function karistirma(yol: number) {
    if (yol < 0.5) return;
    const { koyulasti } = karistir(t, yol, R, yas);
    if ((firYol += yol) > 70) {
      firYol = 0;
      b.ses.cal('siril', { guc: 0.15, perde: 0.9 });
    }
    tencereCiz();
    if (koyulasti) {
      olay('koyulasti');
      b.ses.cal('ting');
      parilti(kok, cx, cy - R * 0.2, 6, R * 0.5);
      void b.mino.tepki('sevin', 900);
      if (!konusuyorMu()) void b.mino.soyle(M.koyulasti);
      durumGuncelle();
    }
  }
  // kâseye: kepçe kâsenin üstünde durdukça dolar; 3-4 dokunuş yolu: kâseye dokununca kendisi doldurur
  kaseEller.forEach((e, i) => {
    e.addEventListener('pointerdown', (ev) => {
      if (firinIcinde || odulde) return;
      ev.preventDefault();
      if (!icerikVar(t) || t.kalan <= 0 || kaseler[i].dolum >= CIZGI) {
        kipirda(e, 3);
        b.ses.cal('tik');
        return;
      }
      // kepçe gelir, çizgiye kadar doldurur
      const m = merkez(e, kok);
      kepceKoy(m.x, m.y - m.h * 0.2);
      kepceTutuluyor = true;
      const z = window.setInterval(() => {
        const s = doldur(kaseler[i], t, 0.1 * (TEST_MODU ? 4 : 1), 'kucuk');
        dolumCiz(i);
        if (s.durdu || kaseler[i].dolum >= CIZGI) {
          clearInterval(z);
          kepceTutuluyor = false;
          kepceKoy(dinlenme.x, dinlenme.y);
          olay('kaseDoldu');
          durumGuncelle();
        }
      }, 100);
      zamanlar.push(z);
    });
  });
  function dolumCiz(i: number) {
    kaseGuncelle(kaseEller[i], kaseler[i]);
    tencereCiz();
    if (Math.random() < 0.3) p5Ses.slurp();
  }

  // ------------------------------------------------------------ fırın
  function firinDokun() {
    if (odulde) return;
    if (!firinIcinde && !kaseler.some((k) => k.dolum > 0.1)) {
      kipirda(firin, 4);
      p6Ses.tink(0.7);
      return;
    }
    firinIcinde = !firinIcinde;
    p5Ses.kay();
    ezil(firin, 0.6);
    tepsiYerineCiz();
    olay(firinIcinde ? 'firina' : 'firindan');
    if (firinIcinde && !olaylar.slice(0, -1).includes('firina') && !konusuyorMu()) void b.mino.soyle(M.firin);
    if (!firinIcinde) {
      const m = merkez(tepsi, kok);
      sac(kok, m.x, m.y - m.h * 0.3, 'buhar', '#fff', 4, { yon: -Math.PI / 2, yay: 1.2, guc: 0.6 });
    }
    durumGuncelle();
  }
  firin.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    firinDokun();
  });
  tepsi.addEventListener('pointerdown', (e) => {
    if (!firinIcinde) return;
    e.preventDefault();
    e.stopPropagation();
    firinDokun();
  });

  // ------------------------------------------------------------ zaman: dolum (kepçe üstte), fırın, kabarcık
  let sonT = performance.now();
  let fokur: { guc(g: number): void; dur(): void } | null = null;
  const hizli = TEST_MODU && new URLSearchParams(location.search).has('hizli') ? 8 : 1;
  if (onceki && onceki.firinda) {
    const sn = (performance.now() - onceki.zaman) / 1000;
    for (const k of kaseler) firinda(k, sn);
  }
  const zamanlayici = window.setInterval(() => {
    const tt = performance.now();
    const sn = ((tt - sonT) / 1000) * hizli;
    sonT = tt;
    if (dokYer !== null && dolu && kepceTutuluyor) {
      const i = dokYer;
      const s = doldur(kaseler[i], t, sn, yas);
      dolumCiz(i);
      if (s.tasti) tasma(i);
      if (s.durdu) dokYer = null;
      if (t.kalan <= 0) kepceDolu(false);
    }
    if (firinIcinde) {
      for (let i = 0; i < kaseler.length; i++) {
        const once = pismeAdi(kaseler[i].p);
        firinda(kaseler[i], sn);
        kaseGuncelle(kaseEller[i], kaseler[i]);
        if (once !== pismeAdi(kaseler[i].p) && pismeAdi(kaseler[i].p) === 'altin' && !olaylar.includes('altin')) {
          olay('altin');
          b.ses.cal('ting', { guc: 0.6 });
          if (!konusuyorMu()) void b.mino.soyle(M.altin);
        }
      }
      if (Math.random() < 0.15) p5Ses.citirti();
    }
    if (icerikVar(t) && t.kalan > 0) {
      if (!fokur) fokur = b.ses.dongu('fokur');
      fokur.guc(0.25 + t.kivam * 0.25);
    } else if (fokur) {
      fokur.dur();
      fokur = null;
    }
    durumGuncelle(false);
  }, 100);
  function tasma(i: number) {
    olay('tasti');
    const m = merkez(kaseEller[i], kok);
    sac(kok, m.x, m.y, 'damla', '#FFF6E2', 8, { guc: 1.1, boy: 9 });
    minoYuzune(kok, b.mino, 'kopuk', 2200);
    zaman(() => {
      void b.mino.tepki('tat', 1400);
      if (!konusuyorMu()) void b.mino.soyle(M.tasti);
    }, 250);
  }

  // ------------------------------------------------------------ doğal son, ipucu
  let hoplandi = false;
  const hazirMi = () => kaseler.filter((k) => k.dolum > 0.1).length >= 2 && kaseler.every((k) => k.dolum <= 0.1 || k.p >= 2) && !firinIcinde && kaseler.some((k) => k.tarcin > 0);
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
    const doluKase = kaseler.filter((k) => k.dolum > 0.1);
    if (odulde) anahtar = 'odul';
    else if (!icerikVar(t)) {
      anahtar = 'bos';
      hedef = { el: () => (t.sut ? pirincRaf : rafOgeleri[0].el), soz: M.ipucu.bos, hareket: 'surukle', nereye: () => tencere };
    } else if (t.kivam < 1) {
      anahtar = 'karistir';
      hedef = { el: () => kepce, soz: M.ipucu.karistir, hareket: 'daire' };
    } else if (doluKase.length < 2 && t.kalan > 0) {
      anahtar = 'kase';
      hedef = { el: () => kepce, soz: M.ipucu.kase, hareket: 'surukle', nereye: () => kaseEller.find((_, i) => kaseler[i].dolum < 0.1) ?? kaseEller[0] };
    } else if (doluKase.some((k) => k.p < 2) && !firinIcinde) {
      anahtar = 'firin';
      hedef = { el: () => firin, soz: M.ipucu.firin, hareket: 'dokun' };
    } else if (firinIcinde) {
      anahtar = 'firinda';
      hedef = null;
    } else if (!kaseler.some((k) => k.tarcin > 0)) {
      anahtar = 'tarcin';
      hedef = { el: () => tarcinRaf, soz: M.ipucu.tarcin, hareket: 'kaydir-yatay' };
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
    if (!kaseler.some((k) => k.dolum > 0.1)) return coz([]);
    odulde = true;
    olay('odul');
    ipucuGuncelle();
    void (async () => {
      const bekle = (ms: number) => new Promise<void>((r) => window.setTimeout(r, TEST_MODU ? Math.min(ms, 20) : ms));
      if (firinIcinde) {
        firinIcinde = false;
        tepsiYerineCiz();
        await bekle(300);
      }
      p6Ses.ezgi([67, 72, 76, 79], 0.1);
      for (const e of kaseEller) {
        hopla(e, 8, 260);
        p6Ses.tin(kaseEller.indexOf(e));
        await bekle(160);
      }
      const m = merkez(tepsi, kok);
      parilti(kok, m.x, m.y - m.h * 0.2, 7, m.w * 0.35);
      sac(kok, m.x, m.y - m.h * 0.3, 'buhar', '#fff', 3, { yon: -Math.PI / 2, yay: 0.8, guc: 0.6 });
      b.ses.cal('ting');
      void b.mino.tepki('sevin', 1200);
      if (!konusuyorMu()) void b.mino.soyle(M.bulut);
      await bekle(700);
      const snapT = { ...t };
      const snapK = kaseler.map((k) => ({ ...k }));
      const u: Urun = { id: urunId('sutlac'), tur: 'sutlac', yemek: 'sutlac', servis: true, butun: true, ozellik: sutlacOzelligi(snapT, snapK), kullanilan: kullanilan.slice(), gorsel: () => sutlacGorsel(snapK) };
      const tt = merkez(b.tepsi.el, kok);
      await ucur(tepsi, tt.x - m.x, tt.y - m.y, 380, -30);
      coz([u]);
    })();
  });

  function ozet() {
    return { t: { ...t, kivam: +t.kivam.toFixed(2), kalan: +t.kalan.toFixed(2) }, kaseler: kaseler.map((k) => ({ dolum: +k.dolum.toFixed(2), tasti: k.tasti, pisme: pismeAdi(k.p), tarcin: k.tarcin })), firinda: firinIcinde };
  }
  (window as unknown as { __rsSutlac?: unknown }).__rsSutlac = {
    olaylar,
    durum: ozet,
    merkez: () => ({ cx, cy, R }),
    pisir: (sn: number) => {
      for (let i = 0; i < kaseler.length; i++) {
        firinda(kaseler[i], sn);
        kaseGuncelle(kaseEller[i], kaseler[i]);
      }
      durumGuncelle();
    },
  };
  yerlestir();
  tencereCiz();
  kaseler.forEach((k, i) => kaseGuncelle(kaseEller[i], k));
  durumGuncelle();

  return {
    bitti: bittiSoz,
    arkaPlanda(): ArkaIs | null {
      if (odulde || !firinIcinde) return null;
      const durum: SutlacKayit = { t: { ...t }, kaseler: kaseler.map((k) => ({ ...k })), firinda: true, zaman: performance.now() };
      return {
        durum,
        isaret: () => {
          const sn = (performance.now() - durum.zaman) / 1000;
          const p = Math.min(...durum.kaseler.filter((k) => k.dolum > 0.1).map((k) => Math.min(3.6, k.p + sn * 0.45)));
          return { ses: 'yok', buhar: true, pisme: pismeAdi(Number.isFinite(p) ? p : 0) };
        },
      };
    },
    kapat() {
      kapandi = true;
      void kapandi;
      ro?.disconnect();
      clearInterval(zamanlayici);
      zamanlar.forEach((z) => {
        clearTimeout(z);
        clearInterval(z);
      });
      fokur?.dur();
      kok.remove();
    },
  };
}
