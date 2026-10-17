/**
 * MEYVE ŞİŞ (tezgâh) · ekip/senaryo/RESTORAN.md §8 M13 (v1.1), §8b örüntü.
 *
 * Rafta doğranmış meyve kâseleri (çilek, muz, kavun, üzüm) ve bal. Tahtada şişler (3-4: iki, 5-6: üç).
 *   - Meyveyi şişin ucuna götür: "tık" diye geçer, dibe doğru kayar (dokunursan sıradaki boş şişe geçer).
 *   - Sıra tamamen çocuğun. Kendiliğinden ABAB olursa şiş parlar ("Sırayla, sırayla!").
 *   - 5-6 özel istek: ÖRÜNTÜ kartı (çilek-muz-çilek-muz-?): tamamlanınca şiş parlar, müşteri bayılır.
 *   - Dolu şişe bir meyve daha: en dipteki "pıt" diye fırlar, Mino havada yakalar, yer (komik).
 *   - Bal kavanozu şişlerin üstünde gezdirilir (ya da dokunulur): bal çizgisi.
 *   - Ödül: şişler tabakta yelpaze gibi dizilir (döndürme yok: kademeli sıra), parıltı, tabak tepsiye.
 */
import { konusuyorMu } from '../../../../src/audio/ses';
import { h, TEST_MODU } from '../../../../src/ui/dom';
import metin from '../../../../content/restoran/mini-sis.json';
import { MALZEME_ADI, urunId, type MiniBaglam, type MiniGirdi, type MiniOturum, type MiniOyun, type Urun } from '../arayuz';
import { ezil, hopla, kipirda, parilti, sac, TITRESIM, ucur } from '../dogra/efekt';
import { surukle } from '../dogra/surukle';
import { Elde, merkez, olayci, rafOge, rafYerlestir, YUKARI, type RafOge } from '../kir-cirp/ortak';
import { p6Ses } from '../yogur/ortak';
import { dolu, MEYVELER, oruntuTamam, oruntuUret, SIS_SAYI, sisOzelligi, sirayla, tak, YER_SAYI, type Meyve, type Sis } from './mantik';
import './sis.css';

const M = metin.mino;

export const oyun: MiniOyun = {
  ad: 'sis',
  istasyon: 'tezgah',
  simge: () => h('span.rs-ss-simge', {}, sisEl(['cilek', 'muz', 'kavun'], 0)),
  baslat: (b, g) => sisBaslat(b, g),
};

/** Bir meyve parçası (üstten, sade yer tutucu) */
export function meyveEl(m: Meyve): HTMLElement {
  return h('i.rs-ss-meyve', { 'data-meyve': m }, h('b'));
}
/** Şiş görünüşü (tepside, masada, simgede): kutusunu doldurur */
export function sisEl(meyveler: Meyve[], bal: number): HTMLElement {
  const el = h('span.rs-ss-sis-gorsel', { 'data-bal': bal ? '1' : '' }, h('i.rs-ss-cubuk'));
  const n = Math.max(4, meyveler.length);
  meyveler.forEach((m, i) => {
    const e = meyveEl(m);
    e.style.left = `${14 + (i + 0.5) * (72 / n)}%`;
    el.append(e);
  });
  return el;
}
/** Tabakta şişler (yelpaze: kademeli) */
export function sisTabakGorsel(sisler: { meyveler: Meyve[]; bal: number }[]): HTMLElement {
  const el = h('span.rs-ss-tabak-gorsel');
  sisler.forEach((s, i) => {
    const e = sisEl(s.meyveler, s.bal);
    e.style.cssText = `position:absolute;left:6%;right:6%;height:24%;top:${22 + i * (52 / Math.max(1, sisler.length - 1 || 1))}%;translate:${(i - (sisler.length - 1) / 2) * 6}% 0`;
    el.append(e);
  });
  return el;
}

interface SisEl {
  s: Sis;
  el: HTMLElement;
  meyveEl: HTMLElement[];
  y: number;
  parladi: boolean;
}

function sisBaslat(b: MiniBaglam, g: MiniGirdi): MiniOturum {
  const yas = g.yas;
  const kok = h('div.rs-p5-oyun.rs-sis', { 'data-yas': yas });
  const { olaylar, olay } = olayci(kok);
  let kapandi = false;
  const zamanlar: number[] = [];
  const zaman = (f: () => void, ms: number) => zamanlar.push(window.setTimeout(f, TEST_MODU ? Math.min(ms, 30) : ms));
  const yerSayi = YER_SAYI[yas];

  // ------------------------------------------------------------ DOM
  const raf = h('div.rs-p5-raf');
  const tahta = h('div.rs-ss-tahta');
  const sisKat = h('div.rs-ss-sisler');
  const eldeKat = h('div.rs-ss-elde-kat');
  const efektKat = h('div.rs-ss-efekt');
  const kart = h('div.rs-ss-oruntu', { hidden: true });
  kok.append(tahta, sisKat, raf, kart, efektKat, eldeKat);
  b.kok.append(kok);
  const elde = new Elde(eldeKat, kok);

  // 5-6 örüntü isteği (lokanta: ozelIstek 'ornek'; deneme sayfası: &ornek=1)
  const oruntu: Meyve[] | null = (() => {
    const o = g.ozelIstek;
    if (o?.tur === 'ornek' && Array.isArray(o.deger)) return (o.deger as string[]).filter((m): m is Meyve => (MEYVELER as readonly string[]).includes(m));
    if (yas === 'buyuk' && TEST_MODU && new URLSearchParams(location.search).has('ornek')) return oruntuUret(3);
    return null;
  })();
  if (oruntu) {
    kart.hidden = false;
    oruntu.forEach((m, i) => kart.append(i === oruntu.length - 1 ? h('i.rs-ss-soru', {}, h('b')) : meyveEl(m)));
  }

  type RafTur = Meyve | 'bal';
  const rafOgeleri: RafOge<RafTur>[] = [];
  const kase = (m: Meyve) => h('span.rs-ss-kase', {}, ...[0, 1, 2].map((i) => {
    const e = meyveEl(m);
    e.style.cssText = `left:${30 + i * 20}%;top:${i === 1 ? 34 : 56}%`;
    return e;
  }));
  for (const m of MEYVELER) rafOge(raf, rafOgeleri, m, kase(m), MALZEME_ADI[m]);
  const balRaf = rafOge(raf, rafOgeleri, 'bal', h('i.rs-ss-bal-kavanoz', {}, h('b')), MALZEME_ADI.bal);

  // ------------------------------------------------------------ şişler
  const sisler: SisEl[] = Array.from({ length: SIS_SAYI[yas] }, () => {
    const el = h('div.rs-ss-sis', {}, h('i.rs-ss-cubuk'), h('i.rs-ss-bal'));
    sisKat.append(el);
    return { s: { meyveler: [], bal: 0 }, el, meyveEl: [], y: 0, parladi: false };
  });

  // ------------------------------------------------------------ yerleşim
  let tb = { x: 0, y: 0, w: 0, h: 0 };
  let parca = 54;
  let sx0 = 0;
  let sx1 = 0;
  function yerlestir() {
    const W = kok.clientWidth;
    const H = kok.clientHeight;
    if (!W || !H) return;
    const yatay = W >= H;
    kok.dataset.yon = yatay ? 'yatay' : 'dikey';
    const rafAlt = rafYerlestir(kok, raf, yatay);
    if (yatay) {
      const x0 = Math.max(120, W * 0.15);
      tb = { x: x0, y: rafAlt + 8, w: W - x0 - Math.max(150, W * 0.18), h: H - rafAlt - 18 };
      kart.style.cssText = `right:14px;top:${rafAlt + 8}px`;
    } else {
      tb = { x: 14, y: rafAlt + 12, w: W - 28, h: Math.min(H * 0.5, W * 1.1) };
      kart.style.cssText = `right:14px;top:${tb.y + tb.h + 14}px`;
    }
    const n = sisler.length;
    parca = Math.max(46, Math.min(78, Math.min((tb.w * 0.78) / (yerSayi + 0.6), (tb.h / n) * 0.62)));
    sx0 = tb.x + tb.w * 0.1;
    sx1 = sx0 + parca * (yerSayi + 0.9);
    tahta.style.cssText = `left:${tb.x}px;top:${tb.y}px;width:${tb.w}px;height:${tb.h}px`;
    sisler.forEach((s, i) => {
      s.y = tb.y + (tb.h / n) * (i + 0.5);
      s.el.style.cssText = `left:${sx0 - parca * 0.4}px;top:${s.y - parca * 0.5}px;width:${sx1 - sx0 + parca * 0.9}px;height:${parca}px`;
      s.meyveEl.forEach((e, k) => meyveKoy(s, e, k));
    });
  }
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => yerlestir()) : null;
  ro?.observe(kok);
  /** k. meyvenin yeri (dipten): şişin içinde px */
  const yerX = (k: number) => parca * 0.4 + parca * (k + 0.5);
  function meyveKoy(_s: SisEl, e: HTMLElement, k: number) {
    e.style.left = `${yerX(k)}px`;
    e.style.width = e.style.height = `${parca * 0.92}px`;
  }

  // ------------------------------------------------------------ şişe tak
  let sonPerde = 1;
  function sisaTak(s: SisEl, m: Meyve, kaynak?: { x: number; y: number }) {
    const { firlayan } = tak(s.s, m, yas);
    const e = meyveEl(m);
    s.el.append(e);
    if (firlayan) {
      // en dipteki fırlar: Mino havada yakalar
      const ilk = s.meyveEl.shift()!;
      firlat(ilk, firlayan);
    }
    s.meyveEl.push(e);
    s.meyveEl.forEach((x, k) => meyveKoy(s, x, k));
    // uçtan girer, dibe kayar
    const k = s.meyveEl.length - 1;
    const ucX = sx1 - sx0 + parca * 0.4;
    const kx = kaynak ? kaynak.x - (sx0 - parca * 0.4) - yerX(k) : ucX - yerX(k);
    const ky = kaynak ? kaynak.y - s.y : 0;
    try {
      e.animate([{ transform: `translate(${kx}px, ${ky}px) scale(0.8)` }, { transform: `translate(${ucX - yerX(k)}px, 0) scale(1.08,0.92)`, offset: 0.45 }, { transform: 'translate(0,0) scale(0.96,1.04)', offset: 0.85 }, { transform: 'none' }], { duration: TEST_MODU ? 30 : 420, easing: 'cubic-bezier(.3,.6,.4,1)' });
    } catch {
      /* yok say */
    }
    sonPerde = Math.min(1.5, sonPerde + 0.04);
    zaman(() => {
      b.ses.cal('tik', { perde: sonPerde, guc: 0.7 });
      p6Ses.tink(1.1);
    }, 190);
    b.dokunsal(TITRESIM.kesim);
    olay(`tak-${m}`);
    if (olaylar.filter((o) => o.startsWith('tak-')).length === 1 && !konusuyorMu()) void b.mino.soyle(M.tik);
    // örüntü ve sırayla
    if (!s.parladi && oruntu && oruntuTamam(s.s.meyveler, oruntu)) parla(s, M.oruntu, 'oruntu');
    else if (!s.parladi && !oruntu && sirayla(s.s.meyveler) && dolu(s.s, yas)) parla(s, M.sirayla, 'sirayla');
    durumGuncelle();
  }
  function parla(s: SisEl, soz: string, ad: string) {
    s.parladi = true;
    s.el.classList.add('rs-parladi');
    olay(ad);
    b.ses.cal('ting', { perde: 1.2 });
    const r = merkez(s.el, kok);
    parilti(kok, r.x, r.y, 8, r.w * 0.4);
    void b.mino.tepki('sevin', 1100);
    if (!konusuyorMu()) void b.mino.soyle(soz);
  }
  /** Komik: dolu şişten en dipteki fırlar, Mino havada yakalar */
  function firlat(e: HTMLElement, m: Meyve) {
    olay('firladi');
    const kr = kok.getBoundingClientRect();
    const r = e.getBoundingClientRect();
    const mr = b.mino.el.getBoundingClientRect();
    const kopya = meyveEl(m);
    kopya.classList.add('rs-ss-ucan');
    kopya.style.cssText = `left:${r.left - kr.left}px;top:${r.top - kr.top}px;width:${r.width}px;height:${r.height}px`;
    efektKat.append(kopya);
    e.remove();
    p6Ses.pit(0.8);
    const dx = mr.left - kr.left + mr.width * 0.5 - (r.left - kr.left + r.width / 2);
    const dy = mr.top - kr.top + mr.height * 0.42 - (r.top - kr.top + r.height / 2);
    void ucur(kopya, dx, dy, 520, -140).then(() => {
      kopya.remove();
      p6Ses.boing(2);
      void b.mino.tepki('tat', 900);
      if (!konusuyorMu()) void b.mino.soyle(M.firladi);
      olay('hap');
    });
  }
  const yakinSis = (y: number) => {
    let en = Infinity;
    let s: SisEl | null = null;
    for (const x of sisler) {
      const m = Math.abs(x.y - y);
      if (m < en) {
        en = m;
        s = x;
      }
    }
    return en < parca * 1.1 ? s : null;
  };
  const siradakiSis = () => sisler.find((s) => !dolu(s.s, yas)) ?? sisler[sisler.length - 1];

  // ------------------------------------------------------------ bal
  function balGezdir(s: SisEl) {
    s.s.bal++;
    s.el.classList.add('rs-ballandi');
    b.ses.cal('pit', { perde: 0.8, guc: 0.5 });
    olay('bal');
    if (olaylar.filter((o) => o === 'bal').length === 1 && !konusuyorMu()) void b.mino.soyle(M.ad.bal);
    durumGuncelle();
  }

  // ------------------------------------------------------------ raf etkileşimi
  for (const o of rafOgeleri) {
    const el = o.el;
    let balYol = 0;
    let sonX = 0;
    let ballanan = new Set<SisEl>();
    surukle(el, kok, {
      basla: (x, y) => {
        elde.al(el, x, y, o.tur === 'bal' ? 'rs-ss-elde-bal' : 'rs-ss-elde-meyve');
        if (o.tur !== 'bal' && elde.el) elde.el.replaceChildren(meyveEl(o.tur));
        el.classList.add('rs-p5-tutuldu');
        b.ses.cal('hop', { perde: 1.1, guc: 0.35 });
        balYol = 0;
        sonX = x;
        ballanan = new Set();
      },
      hareket: (x, y) => {
        elde.tasi(x, y);
        if (o.tur === 'bal') {
          const s = yakinSis(y - YUKARI);
          if (s && x > sx0 - 30 && x < sx1 + 30) {
            balYol += Math.abs(x - sonX);
            if (balYol > 40 && !ballanan.has(s)) {
              ballanan.add(s);
              balGezdir(s);
            }
          }
          sonX = x;
        }
      },
      birak: (x, y) => {
        el.classList.remove('rs-p5-tutuldu');
        if (o.tur === 'bal') return elde.birak(el);
        const s = x > sx0 - parca && x < sx1 + parca * 1.6 ? yakinSis(y - YUKARI) : null;
        elde.birak(s ? null : el);
        if (s) sisaTak(s, o.tur, { x, y: y - YUKARI });
      },
      dokun: () => {
        el.classList.remove('rs-p5-tutuldu');
        elde.birak();
        ezil(el, 1.3);
        if (o.tur === 'bal') {
          for (const s of sisler) if (s.s.meyveler.length) balGezdir(s);
          if (!sisler.some((s) => s.s.meyveler.length)) kipirda(balRaf, 4);
          return;
        }
        const s = siradakiSis();
        const r = merkez(el, kok);
        sisaTak(s, o.tur, r);
        if (olaylar.filter((x) => x.startsWith('tak-')).length <= 4 && !konusuyorMu()) void b.mino.soyle((M.ad as Record<string, string>)[o.tur]);
      },
    });
  }

  // ------------------------------------------------------------ doğal son, ipucu
  let hoplandi = false;
  function durumGuncelle() {
    if (!hoplandi && sisler.every((s) => dolu(s.s, yas))) {
      hoplandi = true;
      b.tepsi.hopla();
      olay('dogalSon');
      if (!konusuyorMu()) void b.mino.soyle(M.dolu);
    }
    kok.dataset.durum = JSON.stringify(ozet());
    ipucuGuncelle();
  }
  let sonIpucu = '';
  function ipucuGuncelle() {
    let anahtar = '';
    let hedef: Parameters<typeof b.ipucu.hedef>[0] = null;
    const eksik = sisler.find((s) => !dolu(s.s, yas));
    if (odulde) anahtar = 'odul';
    else if (!sisler.some((s) => s.s.meyveler.length)) {
      anahtar = 'bos';
      hedef = { el: () => rafOgeleri[0].el, soz: M.ipucu.bos, hareket: 'surukle', nereye: () => sisler[0].el };
    } else if (eksik) {
      anahtar = `eksik-${sisler.indexOf(eksik)}`;
      hedef = { el: () => eksik.el, soz: oruntu ? M.ipucu.oruntu : M.ipucu.eksik, hareket: 'surukle', nereye: () => eksik.el };
    } else {
      anahtar = 'bitti';
      hedef = { el: () => b.tepsi.el, soz: M.ipucu.bitti, hareket: 'dokun' };
    }
    if (anahtar === sonIpucu) return;
    sonIpucu = anahtar;
    b.ipucu.hedef(hedef);
  }

  // ------------------------------------------------------------ ödül: tabakta yelpaze
  let odulde = false;
  let coz: (u: Urun[]) => void = () => undefined;
  const bittiSoz = new Promise<Urun[]>((r) => (coz = r));
  b.tepsi.dinle(() => {
    if (odulde) return;
    const dolular = sisler.filter((s) => s.s.meyveler.length);
    if (!dolular.length) return coz([]);
    odulde = true;
    olay('odul');
    ipucuGuncelle();
    void (async () => {
      const bekle = (ms: number) => new Promise<void>((r) => window.setTimeout(r, TEST_MODU ? Math.min(ms, 20) : ms));
      const tabak = h('div.rs-ss-tabak');
      const tw = Math.min(tb.w * 0.9, (sx1 - sx0) * 1.25);
      const th = Math.min(tb.h * 0.9, tw * 0.7);
      const tx = tb.x + tb.w / 2;
      const ty = tb.y + tb.h / 2;
      tabak.style.cssText = `left:${tx - tw / 2}px;top:${ty - th / 2}px;width:${tw}px;height:${th}px`;
      sisKat.prepend(tabak);
      try {
        tabak.animate([{ transform: 'scale(0.6)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: TEST_MODU ? 20 : 260, easing: 'ease-out' });
      } catch {
        /* yok say */
      }
      await bekle(260);
      // şişler kademeli yelpaze (döndürme yok): her biri biraz kayık, tabağın üstünde
      const n = dolular.length;
      await Promise.all(
        dolular.map((s, i) => {
          const r = merkez(s.el, kok);
          const hy = ty - th * 0.28 + (th * 0.56 * (i + 0.5)) / n;
          const hx = tx + (i - (n - 1) / 2) * parca * 0.4;
          return ucur(s.el, hx - r.x, hy - r.y, 360, -30);
        }),
      );
      p6Ses.ezgi([72, 76, 79, 84], 0.09);
      for (const s of dolular) {
        hopla(s.el.querySelector('.rs-ss-cubuk') as HTMLElement, 6, 240);
        p6Ses.tin(dolular.indexOf(s));
        await bekle(160);
      }
      parilti(kok, tx, ty - th * 0.2, 7, tw * 0.35);
      sac(kok, tx, ty, 'damla', '#F2B233', 3, { yon: -Math.PI / 2, yay: 1.5, guc: 0.4, boy: 7 });
      b.ses.cal('ting');
      await bekle(500);
      const snap = dolular.map((s) => ({ meyveler: s.s.meyveler.slice(), bal: s.s.bal }));
      const u: Urun = { id: urunId('sis'), tur: 'sis', yemek: 'sis', servis: true, butun: true, ozellik: sisOzelligi(dolular.map((s) => s.s)), gorsel: () => sisTabakGorsel(snap) };
      const t = merkez(b.tepsi.el, kok);
      await Promise.all([tabak, ...dolular.map((s) => s.el)].map((e) => ucur(e, t.x - tx, t.y - ty, 380, -30)));
      coz([u]);
    })();
  });

  function ozet() {
    return { sisler: sisler.map((s) => ({ meyveler: s.s.meyveler.slice(), bal: s.s.bal, parladi: s.parladi })), oruntu };
  }
  (window as unknown as { __rsSis?: unknown }).__rsSis = {
    olaylar,
    durum: ozet,
    sisYeri: () =>
      sisler.map((s) => {
        const r = s.el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, uc: r.right - parca * 0.2 };
      }),
  };
  yerlestir();
  durumGuncelle();

  return {
    bitti: bittiSoz,
    kapat() {
      kapandi = true;
      void kapandi;
      ro?.disconnect();
      zamanlar.forEach((z) => clearTimeout(z));
      kok.remove();
    },
  };
}
