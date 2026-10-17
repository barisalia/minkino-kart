/**
 * YOĞUR VE YUVARLA (mermer tezgâh) · köfte. ekip/senaryo/RESTORAN.md §8 M8, §1d, §4c.
 *
 * Kâsede köfte harcı; rafta kıyılmış soğan, maydanoz, biber, tuz (5-6: pul biber) ve tepsiden gelen kâseler.
 *   - Harca malzeme eklenir (bırak ya da dokun): benekler bir köşede öbek durur.
 *   - YOĞUR: harca bastır-bırak (ya da iki parmakla sıkıştır) → "vıcık", parmak izi, benekler dağılır, renk birleşir
 *     (3-4: üç, 5-6: beş sıkıştırma). Yeni malzeme gelince yeniden karıştırmak gerekir.
 *   - KOPAR: harçta parmağı tut → avuç parmağın altında büyür (ne kadar tutarsan o kadar: minicik … kocaman), tahtaya
 *     götür. 3-4 dokunuş yolu: karışmış harca dokununca orta boy bir avuç kendisi tahtaya kopar.
 *   - YUVARLA: tahtadaki pütürlü topağın üstünde daire çiz → top olur (3-4'te dokununca kendi yuvarlanır).
 *   - BASTIR: topa dokun → yassı köfte; bastırmaya devam edersen ince, sonra İNCECİK KREP (komik: Mino onu yüzüne
 *     maske yapar, kıkırdar; krep yine köftedir).
 *   - 5-6: köfteler aynı boyda olursa yıldızlar; ödülde Mino sayar.
 *   - Ödül: köfteler siniye sıralanır, sırayla "boing" zıplar, sini tepsiye kayar.
 * Parça döndürme yok, büyütme yok; dokunuşla aynı karede görüntü ve ses.
 */
import { konusuyorMu } from '../../../../src/audio/ses';
import { h, TEST_MODU } from '../../../../src/ui/dom';
import metin from '../../../../content/restoran/mini-yogur.json';
import { MALZEME_ADI, urunId, type Malzeme, type MalzemeDurumu, type MiniBaglam, type MiniGirdi, type MiniOturum, type MiniOyun, type Urun } from '../arayuz';
import { ezil, hopla, kipirda, parilti, sac, TITRESIM, ucur } from '../dogra/efekt';
import { surukle } from '../dogra/surukle';
import { Elde, merkez, olayci, rafOge, rafYerlestir, YUKARI, type RafOge } from '../kir-cirp/ortak';
import { ayniBoy, bastir, bicimli, bosDurum, boyAdi, dogalSon, geriKoy, HARC_BASTA, kofteOzelligi, kopar, koparBoyu, malzemeEkle, sik, topakCap, yuvarla, type Topak } from './mantik';
import { p6Ses } from './ortak';
import './yogur.css';

const M = metin.mino;
type RafTur = 'kase' | 'sogan' | 'maydanoz' | 'biber' | 'tuz' | 'pulbiber';
const KIYIM: Malzeme[] = ['sogan', 'maydanoz', 'biber'];
/** benek renkleri */
export const BENEK: Partial<Record<Malzeme | 'tuz' | 'pulbiber', string>> = {
  sogan: '#FFF4E2',
  maydanoz: '#3C9A3A',
  biber: '#4FB043',
  pulbiber: '#C8321E',
  tuz: '#FFFFFF',
  domates: '#E8483A',
  havuc: '#F08A2C',
};

export const oyun: MiniOyun = {
  ad: 'yogur',
  istasyon: 'mermer',
  simge: () => h('span.rs-yg-simge', {}, h('i.rs-yg-kofte', { 'data-sekil': 'top' })),
  baslat: (b, g) => yogurBaslat(b, g),
};

/** Bir köftenin görünüşü (tahtada, sinide, mangalda): kutusunu doldurur. benekler: [renk, x%, y%] */
export function kofteEl(sekil: Topak['sekil'], benekler: [string, number, number][], pisme?: string): HTMLElement {
  const el = h('i.rs-yg-kofte', { 'data-sekil': sekil, 'data-pisme': pisme ?? 'cig' });
  for (const [renk, x, y] of benekler) {
    const b = h('b');
    b.style.cssText = `left:${x}%;top:${y}%;background:${renk}`;
    el.append(b);
  }
  return el;
}

/** Tepside: sini üstünde köfteler (kutusunu doldurur) */
export function siniGorsel(kofteler: { sekil: Topak['sekil']; boy: number; benek: [string, number, number][] }[], pisme?: string): HTMLElement {
  const el = h('span.rs-yg-sini-gorsel');
  const n = Math.max(1, kofteler.length);
  const sutun = Math.min(3, n);
  const satir = Math.ceil(n / sutun);
  kofteler.forEach((k, i) => {
    const c = i % sutun;
    const r = Math.floor(i / sutun);
    const e = kofteEl(k.sekil, k.benek, pisme);
    const w = Math.min(34, 70 / sutun) * Math.min(1.25, Math.sqrt(k.boy));
    e.style.cssText = `position:absolute;width:${w}%;aspect-ratio:1;left:${(100 / (sutun + 1)) * (c + 1) - w / 2}%;top:${(100 / (satir + 1)) * (r + 1)}%;translate:0 -50%`;
    el.append(e);
  });
  return el;
}

interface TopakEl {
  t: Topak;
  el: HTMLElement;
  yuva: number;
  benek: [string, number, number][];
}

function yogurBaslat(b: MiniBaglam, g: MiniGirdi): MiniOturum {
  const yas = g.yas;
  const kok = h('div.rs-p5-oyun.rs-yogur', { 'data-yas': yas });
  const { olaylar, olay } = olayci(kok);
  const d = bosDurum();
  const kullanilan: string[] = [];
  let kapandi = false;
  const zamanlar: number[] = [];
  const zaman = (f: () => void, ms: number) => zamanlar.push(window.setTimeout(f, TEST_MODU ? Math.min(ms, 30) : ms));

  // ------------------------------------------------------------ DOM
  const raf = h('div.rs-p5-raf');
  const kase = h('div.rs-yg-kase', { role: 'button', 'aria-label': 'Köfte harcı' });
  const harc = h('div.rs-yg-harc');
  const benekKat = h('div.rs-yg-benekler');
  const izKat = h('div.rs-yg-izler');
  harc.append(benekKat, izKat);
  kase.append(h('i.rs-yg-kase-dis'), h('i.rs-yg-kase-ic'), harc);
  const tahta = h('div.rs-yg-tahta', {}, h('i.rs-yg-tahta-damar'));
  const topakKat = h('div.rs-yg-topaklar');
  const eldeKat = h('div.rs-yg-elde-kat');
  const yildizKat = h('div.rs-yg-yildizlar');
  kok.append(tahta, kase, raf, topakKat, yildizKat, eldeKat);
  b.kok.append(kok);
  const elde = new Elde(eldeKat, kok);

  // raf: tepsiden gelen kâseler (doğranmış, kullanılmamış) + kıyılmış soğan, maydanoz, biber, tuz (+5-6 pul biber)
  const rafOgeleri: (RafOge<RafTur> & { urun?: Urun })[] = [];
  const kaseIcerik = (malz: Partial<Record<Malzeme, MalzemeDurumu>>) => {
    const ic = h('span.rs-yg-raf-kase');
    let i = 0;
    for (const [m, md] of Object.entries(malz)) {
      for (let n = 0; n < Math.min(md!.adet, 5); n++, i++) {
        const a = i * 2.39996;
        const r = 26 * Math.sqrt((i + 0.5) / 9);
        const e = h('b', { style: `left:${50 + Math.cos(a) * r}%;top:${50 + Math.sin(a) * r}%;background:${BENEK[m as Malzeme] ?? '#9bc46a'}` });
        ic.append(e);
      }
    }
    return ic;
  };
  for (const u of g.tepsi.filter((u) => !u.servis && u.tur === 'dogranmis' && Object.keys(u.ozellik.malzemeler).length)) {
    rafOge(raf, rafOgeleri, 'kase', kaseIcerik(u.ozellik.malzemeler), 'Kâse');
    rafOgeleri[rafOgeleri.length - 1].urun = u;
  }
  const kiyimlar = KIYIM.filter((m) => g.malzemeler.includes(m) || m !== 'biber');
  for (const m of kiyimlar) rafOge(raf, rafOgeleri, m as RafTur, kaseIcerik({ [m]: { adet: 5 } }), MALZEME_ADI[m]);
  rafOge(raf, rafOgeleri, 'tuz', h('i.rs-yg-yt', { 'data-yt': 'tuz' }), MALZEME_ADI.tuz);
  if (yas === 'buyuk') rafOge(raf, rafOgeleri, 'pulbiber', h('i.rs-yg-yt', { 'data-yt': 'pulbiber' }), MALZEME_ADI.pulbiber);

  // ------------------------------------------------------------ yerleşim
  let kx = 250;
  let ky = 230;
  let kR = 120;
  let taban = 64;
  let yuvaW = 120;
  let yuvaH = 100;
  let yuvalar: { x: number; y: number }[] = [];
  let tb = { x: 0, y: 0, w: 0, h: 0 };
  function yerlestir() {
    const W = kok.clientWidth;
    const H = kok.clientHeight;
    if (!W || !H) return;
    const yatay = W >= H;
    kok.dataset.yon = yatay ? 'yatay' : 'dikey';
    const rafAlt = rafYerlestir(kok, raf, yatay);
    if (yatay) {
      const yuk = H - rafAlt - 12;
      kR = Math.min(yuk * 0.47, W * 0.17);
      kx = Math.max(W * 0.3, kR + 112);
      ky = rafAlt + 4 + yuk / 2;
      const x0 = kx + kR + 26;
      tb = { x: x0, y: rafAlt + 8, w: W - x0 - 18, h: H - rafAlt - 8 - Math.max(96, H * 0.25) };
    } else {
      kR = Math.min(W * 0.34, (H - rafAlt) * 0.2);
      kx = W / 2;
      ky = rafAlt + 18 + kR;
      const y0 = ky + kR + 22;
      tb = { x: 14, y: y0, w: W - 28, h: H - y0 - Math.max(108, W * 0.28) };
    }
    const sutun = 3;
    const satir = 2;
    yuvaW = tb.w / sutun;
    yuvaH = tb.h / satir;
    taban = Math.max(50, Math.min(84, Math.min(yuvaW, yuvaH) * 0.68));
    yuvalar = [];
    for (let r = 0; r < satir; r++) for (let c = 0; c < sutun; c++) yuvalar.push({ x: tb.x + (tb.w / sutun) * (c + 0.5), y: tb.y + (tb.h / satir) * (r + 0.5) });
    kase.style.cssText = `left:${kx - kR}px;top:${ky - kR}px;width:${kR * 2}px;height:${kR * 2}px`;
    tahta.style.cssText = `left:${tb.x}px;top:${tb.y}px;width:${tb.w}px;height:${tb.h}px`;
    harcCiz();
    for (const te of topaklar) topakYerlestir(te);
  }
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => yerlestir()) : null;
  ro?.observe(kok);

  // ------------------------------------------------------------ harç: benekler, izler, karışma
  interface Benek {
    el: HTMLElement;
    renk: string;
    x: number;
    y: number;
  }
  const benekler: Benek[] = [];
  function harcCiz() {
    const oran = d.harc / HARC_BASTA;
    const s = d.harc <= 0 ? 0 : 0.42 + 0.58 * Math.sqrt(oran);
    harc.style.setProperty('--olcek', s.toFixed(3));
    harc.style.setProperty('--karisim', d.karisim.toFixed(2));
    harc.dataset.bos = d.harc <= 0 ? '1' : '';
    kase.dataset.karisti = d.karisim >= 1 ? '1' : '';
  }
  function benekEkle(renk: string, n: number, odak: { x: number; y: number }) {
    for (let i = 0; i < n; i++) {
      const el = h('b.rs-yg-benek');
      el.style.background = renk;
      const x = Math.max(12, Math.min(88, odak.x + (Math.random() - 0.5) * 22));
      const y = Math.max(12, Math.min(88, odak.y + (Math.random() - 0.5) * 22));
      benekKat.append(el);
      const be = { el, renk, x, y };
      benekKoy(be);
      benekler.push(be);
    }
  }
  function benekKoy(be: Benek) {
    be.el.style.left = `${be.x}%`;
    be.el.style.top = `${be.y}%`;
  }
  /** Sıkıştırma: benekler dağılır (her sıkmada eşit dağılıma yaklaşır) */
  function benekDagit(guc: number) {
    for (const be of benekler) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 38;
      be.x += (50 + Math.cos(a) * r - be.x) * guc;
      be.y += (50 + Math.sin(a) * r - be.y) * guc;
      benekKoy(be);
    }
  }
  /** Parmak izi (harcın üstünde, kap içi yüzde) */
  function iz(x: number, y: number) {
    const e = h('i.rs-yg-iz');
    e.style.left = `${x}%`;
    e.style.top = `${y}%`;
    izKat.append(e);
    try {
      e.animate([{ opacity: 0.9, transform: 'translate(-50%,-50%) scale(1.15)' }, { opacity: 0.75, transform: 'translate(-50%,-50%) scale(1)', offset: 0.2 }, { opacity: 0, transform: 'translate(-50%,-50%) scale(1)' }], { duration: TEST_MODU ? 500 : 1400, fill: 'forwards' }).finished.then(
        () => e.remove(),
        () => e.remove(),
      );
    } catch {
      e.remove();
    }
  }
  const harcYuzde = (x: number, y: number) => {
    const r = harc.getBoundingClientRect();
    const k = kok.getBoundingClientRect();
    return { x: ((x - (r.left - k.left)) / Math.max(1, r.width)) * 100, y: ((y - (r.top - k.top)) / Math.max(1, r.height)) * 100 };
  };
  const harcta = (x: number, y: number) => d.harc > 0 && Math.hypot(x - kx, y - ky) < kR * 0.9;

  let sikmaNo = 0;
  /** bastır-bırak: bir sıkıştırma */
  function sikistir(x: number, y: number, ikiParmak = false) {
    sikmaNo++;
    const { karisti } = sik(d, yas);
    benekDagit(ikiParmak ? 0.6 : 0.42);
    p6Ses.vicik(1 + (sikmaNo % 4) * 0.06);
    b.dokunsal(TITRESIM.kesim);
    ezil(harc, ikiParmak ? 1.6 : 1.1, 200);
    olay('sik');
    if (sikmaNo === 1 && !konusuyorMu()) void b.mino.soyle(M.vicik);
    if (karisti) {
      olay('karisti');
      b.ses.cal('ting');
      parilti(kok, kx, ky - kR * 0.2, 6, kR * 0.5);
      void b.mino.tepki('sevin', 1000);
      if (!konusuyorMu()) void b.mino.soyle(M.hazir);
    }
    harcCiz();
    durumGuncelle();
    void x;
    void y;
  }

  // ------------------------------------------------------------ raftan harca
  function malzemeKoy(tur: RafTur, kaynak?: { x: number; y: number }, oge?: RafOge<RafTur> & { urun?: Urun }) {
    if (d.harc <= 0) {
      p6Ses.tink();
      void b.mino.tepki('zipla', 800);
      if (!konusuyorMu()) void b.mino.soyle(M.harc_bitti);
      return;
    }
    const odak = kaynak && harcta(kaynak.x, kaynak.y) ? harcYuzde(kaynak.x, kaynak.y) : { x: 35 + Math.random() * 30, y: 30 + Math.random() * 30 };
    if (tur === 'kase' && oge?.urun) {
      const u = oge.urun;
      kullanilan.push(u.id);
      oge.el.classList.add('rs-kullanildi');
      for (const [m, md] of Object.entries(u.ozellik.malzemeler)) {
        for (let i = 0; i < Math.min(3, md!.adet); i++) malzemeEkle(d, m as Malzeme);
        benekEkle(BENEK[m as Malzeme] ?? '#9bc46a', Math.min(8, md!.adet * 2), odak);
      }
    } else {
      malzemeEkle(d, tur as Malzeme | 'tuz' | 'pulbiber');
      benekEkle(BENEK[tur as Malzeme] ?? '#fff', tur === 'tuz' ? 5 : 7, odak);
      const ilk = olaylar.filter((o) => o === `ekle-${tur}`).length === 0;
      if (ilk && !konusuyorMu()) void b.mino.soyle((M.ad as Record<string, string>)[tur] ?? '');
    }
    b.ses.cal(tur === 'tuz' || tur === 'pulbiber' ? 'citir' : 'pit', { guc: 0.5, perde: tur === 'tuz' ? 1.7 : 1.1 });
    b.dokunsal(TITRESIM.hafif);
    ezil(harc, 0.6);
    olay(`ekle-${tur}`);
    if (tur === 'pulbiber' && d.aci >= 3) {
      // çok acı: Mino'nun burnu sızlar (dolaylı)
      void b.mino.tepki('hapsir', 1200);
      sac(kok, kx, ky, 'cekirdek', '#C8321E', 6, { yon: -Math.PI / 2, yay: 2, guc: 0.6, boy: 4 });
    }
    harcCiz();
    durumGuncelle();
  }
  for (const o of rafOgeleri) {
    const el = o.el;
    surukle(el, kok, {
      basla: (x, y) => {
        if (el.classList.contains('rs-kullanildi')) return false;
        elde.al(el, x, y, 'rs-yg-elde-kase');
        el.classList.add('rs-p5-tutuldu');
        b.ses.cal('hop', { perde: 1.1, guc: 0.35 });
      },
      hareket: (x, y) => elde.tasi(x, y),
      birak: (x, y) => {
        el.classList.remove('rs-p5-tutuldu');
        const ici = Math.hypot(x - kx, y - YUKARI - ky) < kR * 1.05;
        elde.birak(ici ? null : el);
        if (ici) malzemeKoy(o.tur, { x, y: y - YUKARI }, o);
      },
      dokun: () => {
        el.classList.remove('rs-p5-tutuldu');
        elde.birak();
        ezil(el, 1.3);
        malzemeKoy(o.tur, undefined, o);
      },
    });
  }

  // ------------------------------------------------------------ kâse: sıkıştır, kopar
  interface Basili {
    id: number;
    x0: number;
    y0: number;
    t0: number;
    x: number;
    y: number;
    avuc: HTMLElement | null;
    boy: number;
  }
  let basili: Basili | null = null;
  const parmaklar = new Map<number, { x: number; y: number }>();
  let ikiParmakSayildi = false;
  const yer = (e: PointerEvent) => {
    const r = kok.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const yuvaBos = () => {
    const dolu = new Set(topaklar.map((t) => t.yuva));
    return yuvalar.findIndex((_, i) => !dolu.has(i));
  };
  let avucRaf = 0;
  function avucBuyut() {
    if (!basili?.avuc || kapandi) return;
    const ms = performance.now() - basili.t0 - 160;
    const icinde = Math.hypot(basili.x - kx, basili.y - ky) < kR * 0.95;
    if (icinde) basili.boy = koparBoyu(ms, d.harc);
    const cap = topakCap({ boy: basili.boy, sekil: 'putur' }, taban);
    basili.avuc.style.width = `${cap}px`;
    basili.avuc.style.height = `${cap}px`;
    basili.avuc.style.transform = `translate(${basili.x - cap / 2}px,${basili.y - YUKARI - cap / 2}px)`;
    avucRaf = requestAnimationFrame(avucBuyut);
  }
  function avucBaslat() {
    if (!basili || basili.avuc) return;
    if (yuvaBos() < 0) {
      kipirda(tahta, 6);
      if (!konusuyorMu()) void b.mino.soyle(M.doldu);
      olay('doldu');
      return;
    }
    const el = h('div.rs-yg-avuc');
    el.append(kofteEl('putur', benekOrnek()));
    eldeKat.append(el);
    basili.avuc = el;
    basili.boy = koparBoyu(0, d.harc);
    p6Ses.slop();
    b.dokunsal(TITRESIM.hafif);
    olay('avuc');
    avucBuyut();
  }
  kase.addEventListener('pointerdown', (e) => {
    const p = yer(e);
    parmaklar.set(e.pointerId, p);
    try {
      kase.setPointerCapture(e.pointerId);
    } catch {
      /* yok say */
    }
    e.preventDefault();
    // aynı karede: parmak izi + ses
    if (d.harc > 0) {
      const hy = harcYuzde(p.x, p.y);
      iz(hy.x, hy.y);
      ezil(harc, 0.5, 120);
      p6Ses.vicik(0.9);
    } else {
      p6Ses.tink();
      kipirda(kase, 5);
      void b.mino.tepki('zipla', 700);
      if (!konusuyorMu()) void b.mino.soyle(M.harc_bitti);
      olay('harcBitti');
      return;
    }
    if (parmaklar.size === 2 && basili && !basili.avuc) {
      // iki parmak: sıkıştır
      ikiParmakSayildi = true;
      const [a, c] = [...parmaklar.values()];
      iz(harcYuzde(a.x, a.y).x, harcYuzde(a.x, a.y).y);
      sikistir((a.x + c.x) / 2, (a.y + c.y) / 2, true);
      return;
    }
    if (basili) return;
    ikiParmakSayildi = false;
    basili = { id: e.pointerId, x0: p.x, y0: p.y, t0: performance.now(), x: p.x, y: p.y, avuc: null, boy: 0.6 };
    // tutarsan avuç belirir (harç karışmamış olsa da: pütürlü köfte de olur)
    zaman(() => {
      if (basili && basili.id === e.pointerId && !ikiParmakSayildi && Math.hypot(basili.x - basili.x0, basili.y - basili.y0) < 14) avucBaslat();
    }, 300);
  });
  kase.addEventListener('pointermove', (e) => {
    if (parmaklar.has(e.pointerId)) parmaklar.set(e.pointerId, yer(e));
    if (!basili || e.pointerId !== basili.id) return;
    const p = yer(e);
    basili.x = p.x;
    basili.y = p.y;
    if (!basili.avuc && !ikiParmakSayildi && Math.hypot(p.x - basili.x0, p.y - basili.y0) > 16) avucBaslat();
  });
  const kaseBirak = (e: PointerEvent) => {
    parmaklar.delete(e.pointerId);
    if (!basili || e.pointerId !== basili.id) return;
    const bs = basili;
    basili = null;
    cancelAnimationFrame(avucRaf);
    const p = yer(e);
    if (bs.avuc) return avucBirak(bs, p.x, p.y - YUKARI);
    if (ikiParmakSayildi) return;
    // kısa basış: karışmamışsa sıkıştır; karışmışsa (dokunuş yolu) orta boy bir avuç kendisi kopar
    if (d.karisim < 1 || performance.now() - bs.t0 > 420) sikistir(p.x, p.y);
    else otomatikKopar();
  };
  kase.addEventListener('pointerup', kaseBirak);
  kase.addEventListener('pointercancel', kaseBirak);

  function benekOrnek(): [string, number, number][] {
    // harçtaki beneklerden rastgele birkaçı (karıştıysa dağınık, karışmadıysa öbek)
    const n = Math.min(7, benekler.length);
    const out: [string, number, number][] = [];
    const karisik = d.karisim >= 0.99;
    for (let i = 0; i < n; i++) {
      const be = benekler[Math.floor(Math.random() * benekler.length)];
      const a = i * 2.39996;
      const r = karisik ? 30 * Math.sqrt((i + 0.5) / n) : 12 * Math.random();
      out.push([be.renk, (karisik ? 50 : 34) + Math.cos(a) * r, (karisik ? 50 : 38) + Math.sin(a) * r]);
    }
    return out;
  }

  function avucBirak(bs: Basili, x: number, y: number) {
    const el = bs.avuc!;
    const t = kopar(d, bs.boy);
    harcCiz();
    if (!t) {
      el.remove();
      return;
    }
    // tahtaya bırakılan yere en yakın boş yuva; tahtanın dışına bırakılırsa da ilk boş yuvaya (ceza yok)
    let yuva = yuvaBos();
    const ust = x > tb.x - 20 && x < tb.x + tb.w + 20 && y > tb.y - 20 && y < tb.y + tb.h + 20;
    if (ust) {
      const dolu = new Set(topaklar.map((q) => q.yuva));
      let en = Infinity;
      yuvalar.forEach((yv, i) => {
        if (dolu.has(i)) return;
        const m = Math.hypot(yv.x - x, yv.y - y);
        if (m < en) {
          en = m;
          yuva = i;
        }
      });
    }
    if (yuva < 0) {
      geriKoy(d, t);
      harcCiz();
      el.remove();
      return;
    }
    const benek = [...el.querySelectorAll<HTMLElement>('b')].map((x2) => [x2.style.background, parseFloat(x2.style.left), parseFloat(x2.style.top)] as [string, number, number]);
    el.remove();
    topakEkle(t, yuva, benek, { x, y });
  }
  function otomatikKopar() {
    const yuva = yuvaBos();
    if (yuva < 0) {
      kipirda(tahta, 6);
      if (!konusuyorMu()) void b.mino.soyle(M.doldu);
      olay('doldu');
      return;
    }
    const t = kopar(d, Math.min(1, d.harc));
    harcCiz();
    if (!t) return;
    p6Ses.slop();
    topakEkle(t, yuva, benekOrnek(), { x: kx, y: ky - kR * 0.2 });
  }

  // ------------------------------------------------------------ tahtadaki topaklar: yuvarla, bastır
  const topaklar: TopakEl[] = [];
  function topakYerlestir(te: TopakEl) {
    const y = yuvalar[te.yuva];
    if (!y) return;
    const cap = Math.min(topakCap(te.t, taban), yuvaW * 1.02, yuvaH * 1.12);
    te.el.style.cssText = `left:${y.x - cap / 2}px;top:${y.y - cap / 2}px;width:${cap}px;height:${cap}px;z-index:${te.t.sekil === 'krep' ? 3 : 2}`;
  }
  function topakCiz(te: TopakEl) {
    const k = te.el.firstElementChild as HTMLElement;
    k.dataset.sekil = te.t.sekil;
    k.style.setProperty('--yuvarlak', te.t.yuvarlak.toFixed(2));
    te.el.dataset.sekil = te.t.sekil;
    te.el.dataset.boy = boyAdi(te.t.boy);
    topakYerlestir(te);
  }
  function topakEkle(t: Topak, yuva: number, benek: [string, number, number][], kaynak: { x: number; y: number }) {
    const el = h('div.rs-yg-topak', { role: 'button', 'aria-label': 'Köfte' }, kofteEl('putur', benek));
    topakKat.append(el);
    const te: TopakEl = { t, el, yuva, benek };
    topaklar.push(te);
    topakCiz(te);
    const y = yuvalar[yuva];
    try {
      el.animate([{ transform: `translate(${kaynak.x - y.x}px,${kaynak.y - y.y}px) scale(0.85)` }, { transform: 'translate(0,-14px) scale(1.06,0.94)', offset: 0.75 }, { transform: 'none' }], { duration: TEST_MODU ? 30 : 360, easing: 'cubic-bezier(.3,.6,.4,1)' });
    } catch {
      /* yok say */
    }
    b.ses.cal('pof', { guc: 0.5, perde: 1.2 - Math.min(0.4, (t.boy - 1) * 0.3) });
    olay('kopti');
    const ba = boyAdi(t.boy);
    if (ba === 'kocaman' && !olaylar.includes('kocaman')) {
      olay('kocaman');
      void b.mino.tepki('sasir', 1100);
      if (!konusuyorMu()) void b.mino.soyle(M.kocaman);
    } else if (ba === 'kucuk' && !olaylar.includes('minik')) {
      olay('minik');
      if (!konusuyorMu()) void b.mino.soyle(M.minik);
    }
    topakBagla(te);
    durumGuncelle();
  }
  function topBitti(te: TopakEl) {
    p6Ses.boing(1);
    b.dokunsal(TITRESIM.kesim);
    const m = merkez(te.el, kok);
    parilti(kok, m.x, m.y, 4, m.w * 0.6);
    hopla(te.el, 10, 280);
    olay('top');
    if (!olaylar.slice(0, -1).includes('top') && !konusuyorMu()) void b.mino.soyle(M.top);
    topakCiz(te);
    aynimi();
    durumGuncelle();
  }
  function topakBagla(te: TopakEl) {
    let aci0 = 0;
    let topla = 0;
    let fir = 0;
    let basildi = false;
    let tutulan: number | null = null;
    let x0 = 0;
    let y0 = 0;
    let t0 = 0;
    let enUzak = 0;
    const el = te.el;
    const merk = () => {
      const r = el.getBoundingClientRect();
      const k = kok.getBoundingClientRect();
      return { x: r.left - k.left + r.width / 2, y: r.top - k.top + r.height / 2, r: r.width / 2 };
    };
    el.addEventListener('pointerdown', (e) => {
      if (odulde || tutulan !== null) return;
      e.preventDefault();
      e.stopPropagation();
      tutulan = e.pointerId;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* yok say */
      }
      const p = yer(e);
      const c = merk();
      x0 = p.x;
      y0 = p.y;
      t0 = performance.now();
      enUzak = 0;
      aci0 = Math.atan2(p.y - c.y, p.x - c.x);
      topla = 0;
      basildi = true;
      // aynı karede: avuç topağı kavrar (hafif ezilir)
      el.classList.add('rs-tutuluyor');
      p6Ses.fir(0.9);
    });
    el.addEventListener('pointermove', (e) => {
      if (e.pointerId !== tutulan) return;
      const p = yer(e);
      const c = merk();
      enUzak = Math.max(enUzak, Math.hypot(p.x - x0, p.y - y0));
      if (te.t.sekil !== 'putur') return;
      const r = Math.hypot(p.x - c.x, p.y - c.y);
      if (r < 4 || r > c.r * 3.2) return;
      const a = Math.atan2(p.y - c.y, p.x - c.x);
      let da = a - aci0;
      if (da > Math.PI) da -= Math.PI * 2;
      if (da < -Math.PI) da += Math.PI * 2;
      aci0 = a;
      topla += Math.abs(da);
      // avucun içinde yuvarlanırken topak parmağa doğru hafifçe kayar (döndürme yok)
      const k = te.el.firstElementChild as HTMLElement;
      k.style.translate = `${Math.cos(a) * 3}px ${Math.sin(a) * 3}px`;
      if ((fir += Math.abs(da)) > 0.7) {
        fir = 0;
        p6Ses.fir(1 + Math.min(0.6, Math.abs(da)));
      }
      const oldu = yuvarla(te.t, Math.abs(da), yas);
      k.style.setProperty('--yuvarlak', te.t.yuvarlak.toFixed(2));
      if (oldu) {
        k.style.translate = '';
        topBitti(te);
      }
    });
    const birak = (e: PointerEvent) => {
      if (e.pointerId !== tutulan) return;
      tutulan = null;
      el.classList.remove('rs-tutuluyor');
      (te.el.firstElementChild as HTMLElement).style.translate = '';
      if (!basildi) return;
      basildi = false;
      const kisa = enUzak < 12 && performance.now() - t0 < 420 && topla < 0.6;
      if (!kisa) return;
      if (te.t.sekil === 'putur' && yas === 'kucuk') kendiYuvarlan(te);
      else bastirOyna(te);
    };
    el.addEventListener('pointerup', birak);
    el.addEventListener('pointercancel', birak);
  }
  /** 3-4 dokunuş yolu: topak avuçta kendisi bir tur yuvarlanır */
  function kendiYuvarlan(te: TopakEl) {
    const k = te.el.firstElementChild as HTMLElement;
    const adim = TEST_MODU ? 3 : 10;
    let i = 0;
    const z = window.setInterval(() => {
      const a = (i / adim) * Math.PI * 2;
      k.style.translate = `${Math.cos(a) * 4}px ${Math.sin(a) * 4}px`;
      if (i % 3 === 0) p6Ses.fir(1.1);
      yuvarla(te.t, (Math.PI * 2) / adim, yas);
      k.style.setProperty('--yuvarlak', te.t.yuvarlak.toFixed(2));
      if (++i > adim || te.t.sekil !== 'putur') {
        clearInterval(z);
        k.style.translate = '';
        if (te.t.sekil === 'putur') {
          te.t.yuvarlak = 1;
          te.t.sekil = 'top';
        }
        topBitti(te);
      }
    }, 45);
    zamanlar.push(z);
  }
  function bastirOyna(te: TopakEl) {
    if (te.t.sekil === 'krep') {
      // krep artık bastırılmaz: kıpırdar
      kipirda(te.el, 4);
      p6Ses.flap();
      return;
    }
    const s = bastir(te.t);
    olay(`bastir-${s}`);
    b.dokunsal(TITRESIM.slap);
    const k = te.el.firstElementChild as HTMLElement;
    try {
      k.animate([{ transform: 'scale(1,1)' }, { transform: 'scale(1.18,0.78)', offset: 0.35 }, { transform: 'scale(0.96,1.04)', offset: 0.7 }, { transform: 'none' }], { duration: TEST_MODU ? 30 : 260, easing: 'ease-out' });
    } catch {
      /* yok say */
    }
    if (s === 'krep') {
      p6Ses.flap();
      topakCiz(te);
      krepMaske(te);
    } else {
      p6Ses.pat(s === 'ince' ? 0.7 : 1);
      topakCiz(te);
    }
    aynimi();
    durumGuncelle();
  }
  /** Komik başarısızlık: incecik krep Mino'nun yüzüne maske olur, sonra tahtaya döner */
  function krepMaske(te: TopakEl) {
    olay('krep');
    void b.mino.tepki('sasir', 700);
    if (!konusuyorMu()) void b.mino.soyle(M.krep);
    zaman(() => {
      if (kapandi || odulde) return;
      const mr = b.mino.el.getBoundingClientRect();
      const kr = kok.getBoundingClientRect();
      if (!mr.width) return;
      const w = mr.width * 0.62;
      const maske = h('div.rs-yg-maske', {}, kofteEl('krep', te.benek));
      const hx = mr.left - kr.left + mr.width / 2;
      const hy = mr.top - kr.top + mr.height * 0.36;
      maske.style.cssText = `left:${hx - w / 2}px;top:${hy - w / 2}px;width:${w}px;height:${w}px`;
      kok.append(maske);
      const c = merkez(te.el, kok);
      te.el.style.visibility = 'hidden';
      try {
        maske.animate([{ transform: `translate(${c.x - hx}px,${c.y - hy}px) scale(1.6)` }, { transform: 'translate(0,-20px) scale(1.1,0.9)', offset: 0.7 }, { transform: 'none' }], { duration: TEST_MODU ? 30 : 420, easing: 'cubic-bezier(.3,.6,.4,1)' });
      } catch {
        /* yok say */
      }
      zaman(() => {
        p6Ses.kikir();
        olay('maske');
        void b.mino.tepki('sevin', 1400);
        void b.mino.soyle(M.maske);
      }, 420);
      zaman(() => {
        if (kapandi) return;
        void ucur(maske, c.x - hx, c.y - hy, 380, -50).then(() => {
          maske.remove();
          te.el.style.visibility = '';
          b.ses.cal('pof', { guc: 0.4 });
        });
      }, 2600);
    }, 280);
  }
  let ayniDendi = false;
  function aynimi() {
    if (yas !== 'buyuk' || ayniDendi || !ayniBoy(d.topaklar)) return;
    ayniDendi = true;
    olay('ayni');
    b.ses.cal('ting', { perde: 1.2 });
    for (const te of topaklar.filter((x) => bicimli(x.t))) {
      const m = merkez(te.el, kok);
      parilti(yildizKat, m.x, m.y, 3, m.w * 0.5);
    }
    void b.mino.tepki('sevin', 1200);
    if (!konusuyorMu()) void b.mino.soyle(M.ayni);
  }

  // ------------------------------------------------------------ doğal son, ipucu
  let hoplandi = false;
  function durumGuncelle() {
    if (!hoplandi && dogalSon(d, yas)) {
      hoplandi = true;
      b.tepsi.hopla();
      olay('dogalSon');
      if (!konusuyorMu()) void b.mino.soyle(M.dogal);
    }
    kok.dataset.durum = JSON.stringify(ozet());
    ipucuGuncelle();
  }
  function ipucuGuncelle() {
    if (odulde) return b.ipucu.hedef(null);
    const putur = topaklar.find((te) => te.t.sekil === 'putur');
    if (putur) return b.ipucu.hedef({ el: () => putur.el, soz: M.ipucu.putur, hareket: yas === 'kucuk' ? 'dokun' : 'daire' });
    if (d.harc > 0 && d.karisim < 1) return b.ipucu.hedef({ el: () => harc, soz: M.ipucu.karismadi, hareket: 'dokun' });
    if (d.harc > 0 && !topaklar.length) return b.ipucu.hedef({ el: () => harc, soz: M.ipucu.harc_hazir, hareket: 'surukle', nereye: () => tahta });
    b.ipucu.hedef({ el: () => b.tepsi.el, soz: M.ipucu.bitti, hareket: 'dokun' });
  }

  // ------------------------------------------------------------ ödül anı: siniye sıra, boing, tepsiye
  let odulde = false;
  let coz: (u: Urun[]) => void = () => undefined;
  const bittiSoz = new Promise<Urun[]>((r) => (coz = r));
  b.tepsi.dinle(() => {
    if (odulde) return;
    if (!topaklar.length) return coz([]);
    odulde = true;
    b.ipucu.hedef(null);
    olay('odul');
    void (async () => {
      const bekle = (ms: number) => new Promise<void>((r) => window.setTimeout(r, TEST_MODU ? Math.min(ms, 20) : ms));
      // sini tahtanın ortasına gelir; köfteler sıra sıra dizilir
      const sini = h('div.rs-yg-sini');
      const caplar = topaklar.map((te) => te.el.offsetWidth);
      const sw = Math.min(tb.w * 0.96, caplar.reduce((t, c) => t + c * 0.92, 0) + taban * 0.6);
      const sh = Math.min(tb.h * 0.9, Math.max(...caplar) * 1.2);
      const sx = tb.x + tb.w / 2;
      const sy = tb.y + tb.h / 2;
      sini.style.cssText = `left:${sx - sw / 2}px;top:${sy - sh / 2}px;width:${sw}px;height:${sh}px`;
      topakKat.prepend(sini);
      const toplamCap = caplar.reduce((t, c) => t + c, 0);
      const sik = Math.min(1, (sw - taban * 0.4) / Math.max(1, toplamCap));
      const xler: number[] = [];
      let gx = sx - (toplamCap * sik) / 2;
      for (const c of caplar) {
        xler.push(gx + (c * sik) / 2);
        gx += c * sik;
      }
      await Promise.all(
        topaklar.map((te, i) => {
          const m = merkez(te.el, kok);
          const hx = xler[i];
          return ucur(te.el, hx - m.x, sy - m.y, 300, -24);
        }),
      );
      // köfteler sinide kalır (yeni yerleri yazılır, uçuş animasyonu bırakılır)
      topaklar.forEach((te, i) => {
        const hx = xler[i];
        const cap = te.el.offsetWidth;
        te.el.getAnimations().forEach((a) => a.cancel());
        te.el.style.left = `${hx - cap / 2}px`;
        te.el.style.top = `${sy - cap / 2}px`;
      });
      p6Ses.ezgi([67, 71, 74, 79], 0.09);
      for (let i = 0; i < topaklar.length; i++) {
        const te = topaklar[i];
        hopla(te.el.firstElementChild as HTMLElement, 16, 300);
        p6Ses.boing(i);
        b.dokunsal(TITRESIM.hafif);
        if (yas === 'buyuk' && i < 6) void b.mino.soyle((M.say as Record<string, string>)[String(i + 1)] ?? '');
        await bekle(yas === 'buyuk' ? 520 : 200);
      }
      parilti(kok, sx, sy - sh * 0.3, 6, sw * 0.4);
      b.ses.cal('ting');
      await bekle(400);
      const u = urunYap();
      const t = merkez(b.tepsi.el, kok);
      const kayan = [sini, ...topaklar.map((te) => te.el)];
      await Promise.all(kayan.map((e) => ucur(e, t.x - sx, t.y - sy, 380, -30)));
      coz([u]);
    })();
  });

  function urunYap(): Urun {
    const ozellik = kofteOzelligi(d);
    const snap = topaklar.map((te) => ({ sekil: te.t.sekil, boy: te.t.boy, benek: te.benek }));
    return {
      id: urunId('kofte-cig'),
      tur: 'kofte-cig',
      yemek: 'kofte',
      ozellik,
      kullanilan: kullanilan.slice(),
      gorsel: () => siniGorsel(snap),
      // mangal köfteleri bu biçim ve beneklerle çizer
      kofteler: snap,
    } as Urun & { kofteler: typeof snap };
  }

  function ozet() {
    return {
      harc: d.harc,
      karisim: +d.karisim.toFixed(2),
      sikma: d.sikma,
      eklenen: d.eklenen,
      tuz: d.tuz,
      aci: d.aci,
      topaklar: d.topaklar.map((t) => ({ boy: t.boy, sekil: t.sekil, yuvarlak: +t.yuvarlak.toFixed(2) })),
    };
  }
  (window as unknown as { __rsYogur?: unknown }).__rsYogur = {
    olaylar,
    durum: ozet,
    merkez: () => ({ kx, ky, kR, tb, yuvalar, taban }),
    topakYeri: () => topaklar.map((te) => {
      const r = te.el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, sekil: te.t.sekil };
    }),
  };
  yerlestir();
  durumGuncelle();

  return {
    bitti: bittiSoz,
    kapat() {
      kapandi = true;
      ro?.disconnect();
      cancelAnimationFrame(avucRaf);
      zamanlar.forEach((z) => {
        clearTimeout(z);
        clearInterval(z);
      });
      kok.remove();
    },
  };
}
