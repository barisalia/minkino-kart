/**
 * YIKA (lavabo: leğen, musluk, süzgeç; üstten) · ekip/senaryo/RESTORAN.md §8 M2, §1d.
 *
 * Rafta çamurlu sebzeler: hangisini yıkayacağı çocuğun seçimi (yıkamadan geçmek de bir seçim). Rafa dokununca Mino
 * adını söyler, sebze leğene "plop" diye düşer (su halkası, damlalar).
 *  - Ov: leğendeki sebzenin üstünde parmakla daire çiz: köpük çıkar, çamur lekeleri tek tek söner. 3-4: iki ovalama
 *    turu bir lekeyi siler (iki büyük leke). 5-6: sebze başına 2-4 küçük leke, hepsini bulmak gerek (yakından ovulan
 *    leke silinir).
 *  - Durula: sebzeyi leğenden musluğun altına götür: musluk kendiliğinden açılır (şırıl), köpük akar, sebze parlar
 *    ("ting"). Musluğa dokununca da açılır / kapanır.
 *  - Süzgeç: sebze süzgece bırakılır, orada kalır (çocuk ne yaptığını görür).
 * Sürpriz: marulun yaprağı arasında uğur böceği. Ovalayınca çıkar, Mino'nun burnuna konar; Mino şaşırır, hapşırır,
 * böcek uçup gider. Komik: köpüklü sebze durulanmadan süzgece giderse köpükler Mino'ya uçar, Mino hapşırır.
 * Ödül: temiz sebzeler süzgeçte sırayla parlar ("ting" yükselir), süzgeç damlar ve tepsiye kayar.
 * Çıktı: `{ tur: 'yikanmis', ozellik: { malzemeler: { m: { adet, temiz } }, temiz } }`.
 */
import { h } from '../../../../src/ui/dom';
import metin from '../../../../content/restoran/mini-yika.json';
import { MALZEME_ADI, urunId, type Malzeme, type MiniBaglam, type MiniGirdi, type MiniOturum, type MiniOyun, type Urun } from '../arayuz';
import { ezil, hopla, kipirda, parilti, sac } from '../dogra/efekt';
import { rafSimge } from '../dogra/gorsel';
import { aciFarki, durula, kopukEkle, lekeOv, lekeUret, rastgele, temizMi, TUR_ACI, turSil, yikamaOzeti, type YikananSebze } from './mantik';
import { bekle, elipsIcinde, elipsNokta, hapsu, istasyonCizimi, kikir, nota, odulEzgi, olayKaydi, pirpir, resim, sebzeEl, sureMs, type Sebze, uc } from './ortak';
import './yika.css';

const M = metin.mino;
/** Yıkanabilenler (raftaki sıra) */
const YIKANIR: Malzeme[] = ['domates', 'salatalik', 'biber', 'marul', 'havuc', 'patates', 'maydanoz', 'limon', 'elma', 'sogan'];
/** Uğur böceğinin saklandığı yeşillik */
const YAPRAKLI: Malzeme[] = ['marul', 'maydanoz'];

interface Kovadaki extends YikananSebze {
  id: number;
  s: Sebze;
  lekeEl: HTMLElement[];
  kopukEl: HTMLElement;
  yer: 'legen' | 'el' | 'suzgec';
  x: number;
  y: number;
  boy: number;
  /** ovma: son açı ve bu turda biriken */
  aci: number | null;
  turAci: number;
  ovulan: number;
  ugur: boolean;
  parladi: boolean;
}

export const oyun: MiniOyun = {
  ad: 'yika',
  istasyon: 'lavabo',
  simge: () => {
    const u = resim('alet/legen');
    return u ? h('img.rs-yk-simge', { src: u, alt: '', draggable: 'false' }) : h('span.rs-yk-simge-yt');
  },
  baslat(b, g) {
    return yikaBaslat(b, g);
  },
};

function yikaBaslat(b: MiniBaglam, g: MiniGirdi): MiniOturum {
  const yas = g.yas;
  const r = rastgele(g.test ? 7 : Date.now());
  // raf: girdi malzemelerinden yıkanabilenler; uğur böceği için bir yeşillik hep var (pazardan çamurlu kasa)
  let raftakiler = YIKANIR.filter((m) => g.malzemeler.includes(m));
  if (!raftakiler.some((m) => YAPRAKLI.includes(m))) raftakiler.unshift('marul');
  for (const m of ['domates', 'salatalik', 'havuc'] as Malzeme[]) if (raftakiler.length < 3 && !raftakiler.includes(m)) raftakiler.push(m);
  raftakiler = raftakiler.slice(0, yas === 'kucuk' ? 4 : 6);
  if (!raftakiler.some((m) => YAPRAKLI.includes(m))) raftakiler[raftakiler.length - 1] = 'marul';
  const ugurMalzeme = raftakiler.find((m) => YAPRAKLI.includes(m))!;
  let ugurVar = true;

  const kok = h('div.rs-yika', { 'data-yas': yas });
  const { olaylar, olay } = olayKaydi(kok);
  if (istasyonCizimi('lavabo')) kok.dataset.cizim = '1';
  const raf = h('div.rs-yk-raf');
  const legen = h('div.rs-yk-legen', {}, h('i.rs-yk-su-yuzu'), h('i.rs-yk-halka'));
  const suzgec = h('div.rs-yk-suzgec');
  const musluk = h('button.rs-yk-musluk', { type: 'button', 'aria-label': 'Musluk' }, h('i.rs-yk-musluk-bas'), h('i.rs-yk-musluk-agiz'));
  const su = h('div.rs-yk-su', { 'aria-hidden': 'true' });
  const sebzeKat = h('div.rs-yk-sebzeler');
  const efektKat = h('div.rs-yk-efekt');
  kok.append(legen, suzgec, su, musluk, sebzeKat, raf, efektKat);
  b.kok.append(kok);

  const rafEl = new Map<Malzeme, HTMLElement>();
  for (const m of raftakiler) {
    const btn = h('button.rs-yk-raf-oge', { type: 'button', 'aria-label': MALZEME_ADI[m], 'data-malzeme': m }, rafSimge(m), h('i.rs-yk-raf-camur'));
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      rafaDokun(m, btn);
    });
    raf.append(btn);
    rafEl.set(m, btn);
  }

  // ------------------------------------------------------------ yerleşim (telefon önce: yatay ve dikey)
  let W = 800;
  let H = 400;
  const L = { cx: 300, cy: 220, R: 120 };
  const S = { cx: 650, cy: 200, R: 90 };
  const MU = { x: 480, ust: 110, alt: 260 };
  function yerlestir() {
    W = kok.clientWidth || b.kok.clientWidth;
    H = kok.clientHeight || b.kok.clientHeight;
    if (!W || !H) return;
    const yatay = W >= H;
    kok.dataset.yon = yatay ? 'yatay' : 'dikey';
    const n = raf.childElementCount || 1;
    const solBos = 82;
    const rafEn = W - solBos - 10;
    let s = Math.max(64, Math.min(80, yatay ? H * 0.2 : 74, rafEn / n - 8));
    const sigan = Math.max(1, Math.floor(rafEn / (s + 8)));
    const satir = Math.ceil(n / sigan);
    if (satir > 1) s = Math.max(64, Math.min(s, rafEn / Math.ceil(n / satir) - 8));
    raf.style.cssText = `left:${solBos}px;top:8px;width:${rafEn}px;--s:${s}px`;
    const rafAlt = 8 + satir * (s + 8) + 4;
    if (yatay) {
      const alan = H - rafAlt;
      L.R = Math.min(alan / 2 - 8, W * 0.19);
      L.cx = Math.max(W * 0.34, 120 + L.R * 0.9);
      L.cy = rafAlt + alan / 2;
      MU.x = L.cx + L.R + Math.max(56, W * 0.075);
      MU.ust = rafAlt - 4;
      MU.alt = L.cy + L.R * 0.35;
      S.R = Math.min(L.R * 0.78, (W - MU.x - 70) / 2, 110);
      S.cx = Math.min(W - S.R - 18, MU.x + 64 + S.R);
      S.cy = Math.min(rafAlt + S.R + 14, H - 118 - S.R * 0.6);
    } else {
      const alan = H - rafAlt;
      L.R = Math.min(W * 0.36, alan * 0.2);
      L.cx = W * 0.42;
      L.cy = rafAlt + L.R + 12;
      MU.x = W * 0.5;
      MU.ust = L.cy + L.R + 6;
      MU.alt = MU.ust + Math.max(120, alan * 0.2);
      S.R = Math.min(W * 0.27, 100);
      S.cx = W * 0.5;
      S.cy = Math.min(MU.alt + S.R + 24, H - 110 - S.R * 0.5);
    }
    legen.style.cssText = `left:${L.cx - L.R}px;top:${L.cy - L.R}px;width:${L.R * 2}px;height:${L.R * 2}px`;
    suzgec.style.cssText = `left:${S.cx - S.R}px;top:${S.cy - S.R}px;width:${S.R * 2}px;height:${S.R * 2}px`;
    musluk.style.cssText = yatay ? `left:${MU.x - 36}px;top:${MU.ust}px` : `left:${Math.min(W - 84, L.cx + L.R + 4)}px;top:${MU.ust - 72}px`;
    su.style.cssText = `left:${MU.x - 22}px;top:${MU.ust + (yatay ? 48 : 0)}px;height:${MU.alt - MU.ust - (yatay ? 48 : 0)}px`;
    for (const k of sebzeler) yerineKoy(k, false);
  }
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => yerlestir()) : null;
  ro?.observe(kok);

  // ------------------------------------------------------------ sebzeler
  const sebzeler: Kovadaki[] = [];
  let sayac = 0;
  const legende = () => sebzeler.filter((k) => k.yer === 'legen');
  const suzgecte = () => sebzeler.filter((k) => k.yer === 'suzgec');

  function lekeCiz(k: Kovadaki) {
    for (const el of k.lekeEl) el.remove();
    k.lekeEl = k.lekeler.map((l) => {
      const p = elipsNokta(k.s.govde, 100, 100, l.u, l.v);
      const cap = l.boy * Math.min(k.s.govde.rx, k.s.govde.ry) * 1.25;
      const u = resim(`yiyecek/camur-${l.sekil}`);
      const el = h('i.rs-yk-leke', { 'data-sekil': l.sekil }, u ? h('img', { src: u, alt: '', draggable: 'false' }) : null);
      el.style.cssText = `left:${p.x - cap / 2}%;top:${p.y - cap / 2}%;width:${cap}%;height:${cap}%;opacity:${l.kir}`;
      k.s.el.append(el);
      return el;
    });
  }

  function boyHesap(k: Kovadaki): number {
    const yer = k.yer === 'suzgec' ? S.R * (suzgecte().length > 2 ? 0.66 : suzgecte().length > 1 ? 0.78 : 0.95) : L.R * (legende().length > 1 ? 0.86 : 1.08);
    return Math.max(56, Math.min(yer, k.s.enCok));
  }
  function hedef(k: Kovadaki): { x: number; y: number } {
    if (k.yer === 'legen') {
      const l = legende();
      const i = l.indexOf(k);
      if (l.length <= 1) return { x: L.cx, y: L.cy };
      const a = -Math.PI / 2 + (i / l.length) * Math.PI * 2 + 0.6;
      return { x: L.cx + Math.cos(a) * L.R * 0.36, y: L.cy + Math.sin(a) * L.R * 0.3 };
    }
    const s = suzgecte();
    const i = s.indexOf(k);
    const a = i * 2.39996;
    const rr = S.R * 0.42 * Math.sqrt((i % 6) / 6 + 0.02);
    return { x: S.cx + Math.cos(a) * rr, y: S.cy + Math.sin(a) * rr - Math.floor(i / 6) * 8 };
  }
  function konumla(k: Kovadaki) {
    k.s.el.style.width = `${k.boy}px`;
    k.s.el.style.height = `${k.boy}px`;
    k.s.el.style.transform = `translate(${k.x - k.boy / 2}px,${k.y - k.boy / 2}px)`;
  }
  function yerineKoy(k: Kovadaki, kayarak = true) {
    if (k.yer === 'el') return;
    const eski = { x: k.x, y: k.y };
    k.boy = boyHesap(k);
    const t = hedef(k);
    k.x = t.x;
    k.y = t.y;
    k.s.el.dataset.yer = k.yer;
    konumla(k);
    if (kayarak && (Math.abs(eski.x - t.x) > 2 || Math.abs(eski.y - t.y) > 2)) {
      try {
        k.s.el.animate([{ translate: `${eski.x - t.x}px ${eski.y - t.y}px` }, { translate: '0 0' }], { duration: sureMs(260), easing: 'ease-out' });
      } catch {
        /* yok say */
      }
    }
  }
  const herkesYerine = () => sebzeler.forEach((x) => yerineKoy(x));

  function rafaDokun(m: Malzeme, btn: HTMLElement) {
    if (odulde) return;
    // aynı karede: düğme ezilir, sebze raftan kalkar
    ezil(btn, 1.2);
    b.dokunsal(8);
    void b.mino.soyle((M.ad as Record<string, string>)[m] ?? `${MALZEME_ADI[m]}!`);
    // leğen doluysa en eski sebze kendiliğinden süzgece hoplar (yer açar)
    const l = legende();
    if (l.length >= 2) {
      const eski = l[0];
      eski.yer = 'suzgec';
      suzgeceIndi(eski);
    }
    const s = sebzeEl(m);
    const k: Kovadaki = {
      id: ++sayac,
      m,
      s,
      lekeler: lekeUret(yas, r),
      lekeEl: [],
      kopuk: 0,
      kopukEl: h('i.rs-yk-kopuk-kat'),
      suzgecte: false,
      yer: 'legen',
      x: 0,
      y: 0,
      boy: 80,
      aci: null,
      turAci: 0,
      ovulan: 0,
      ugur: ugurVar && m === ugurMalzeme,
      parladi: false,
    };
    if (k.ugur) ugurVar = false;
    s.el.classList.add('rs-yk-sebze');
    s.el.dataset.id = String(k.id);
    s.el.append(k.kopukEl);
    lekeCiz(k);
    if (k.ugur) {
      const u = resim('yiyecek/ugur-bocegi');
      const p = elipsNokta(s.govde, 100, 100, 0.25, -0.35);
      const ub = h('i.rs-yk-ugur', {}, u ? h('img', { src: u, alt: '', draggable: 'false' }) : null);
      ub.style.left = `${p.x}%`;
      ub.style.top = `${p.y}%`;
      s.el.append(ub);
    }
    sebzeler.push(k);
    sebzeKat.append(s.el);
    herkesYerine();
    // raftan leğene kavisle düşer
    const br = btn.getBoundingClientRect();
    const kr = kok.getBoundingClientRect();
    const bx = br.left - kr.left + br.width / 2;
    const by = br.top - kr.top + br.height / 2;
    try {
      s.el.animate(
        [
          { translate: `${bx - k.x}px ${by - k.y}px`, scale: '0.45' },
          { translate: `${(bx - k.x) / 2}px ${(by - k.y) / 2 - 60}px`, scale: '0.8', offset: 0.55 },
          { translate: '0 0', scale: '1.06 0.9', offset: 0.88 },
          { translate: '0 0', scale: '1' },
        ],
        { duration: sureMs(380), easing: 'ease-in' },
      );
    } catch {
      /* yok say */
    }
    window.setTimeout(() => plop(k), sureMs(330));
    olay('legen');
    ipucuGuncelle();
  }

  function plop(k: Kovadaki) {
    if (kapandi) return;
    b.ses.cal('pof', { perde: 1.3, guc: 0.7 });
    b.ses.cal('siril', { perde: 1.2, guc: 0.4 });
    sac(efektKat, k.x, k.y, 'damla', '#9ad8ee', 7, { yon: -Math.PI / 2, yay: 2.6, guc: 1.2 });
    const halka = legen.querySelector<HTMLElement>('.rs-yk-halka');
    if (halka) {
      halka.classList.remove('rs-oyna');
      void halka.offsetWidth;
      halka.classList.add('rs-oyna');
    }
  }

  // ------------------------------------------------------------ musluk ve su
  let suAcik = false;
  let suKendi = false;
  let suDongu: { guc(g: number): void; dur(): void } | null = null;
  let suKapat = 0;
  function suAc(ac: boolean, kendi = false) {
    if (ac === suAcik) return;
    suAcik = ac;
    suKendi = ac && kendi;
    kok.classList.toggle('rs-su-akiyor', ac);
    musluk.classList.toggle('rs-acik', ac);
    if (ac) {
      suDongu = b.ses.dongu('siril');
      suDongu.guc(0.7);
      if (!kendi) void b.mino.soyle(M.siril);
      olay('musluk');
    } else {
      suDongu?.dur();
      suDongu = null;
    }
  }
  musluk.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    ezil(musluk, 1.2);
    b.ses.cal('tik', { perde: 0.8 });
    suAc(!suAcik);
  });
  const muslukAltinda = (x: number, y: number) => Math.abs(x - MU.x) < Math.max(56, L.R * 0.5) && y > MU.ust - 10 && y < MU.alt + 50;

  // ------------------------------------------------------------ parmak: ov, taşı, durula, bırak
  let tutulan: Kovadaki | null = null;
  let ovulen: Kovadaki | null = null;
  let id: number | null = null;
  let son = { x: 0, y: 0, t: 0 };
  let kopukSes = 0;
  let dokunsalYol = 0;
  let odulde = false;
  let kapandi = false;

  const yerel = (e: PointerEvent) => {
    const rr = kok.getBoundingClientRect();
    return { x: e.clientX - rr.left, y: e.clientY - rr.top };
  };
  const altindaki = (x: number, y: number, liste: Kovadaki[]) =>
    liste
      .slice()
      .reverse()
      .find((k) => elipsIcinde(k.s.govde, k.boy, k.boy, x - (k.x - k.boy / 2), y - (k.y - k.boy / 2), 1.25));
  const legendeMi = (x: number, y: number, pay = 1) => Math.hypot(x - L.cx, y - L.cy) < L.R * pay;
  const suzgecteMi = (x: number, y: number) => Math.hypot(x - S.cx, y - S.cy) < S.R * 1.25;

  kok.addEventListener('pointerdown', (e) => {
    if (id !== null || odulde) return;
    const p = yerel(e);
    const sk = altindaki(p.x, p.y, suzgecte());
    const lk = legendeMi(p.x, p.y, 1.08) ? altindaki(p.x, p.y, legende()) ?? (legende().length === 1 ? legende()[0] : null) : null;
    if (!sk && !lk) {
      if (legendeMi(p.x, p.y)) {
        // boş leğen: su dalgalanır (aynı karede)
        b.ses.cal('siril', { perde: 1.4, guc: 0.3 });
        sac(efektKat, p.x, p.y, 'damla', '#9ad8ee', 4, { yon: -Math.PI / 2, yay: 2 });
      }
      return;
    }
    e.preventDefault();
    id = e.pointerId;
    try {
      kok.setPointerCapture(e.pointerId);
    } catch {
      /* yok say */
    }
    son = { x: p.x, y: p.y, t: performance.now() };
    if (sk) {
      tut(sk, p.x, p.y);
    } else if (lk) {
      ovulen = lk;
      lk.aci = Math.atan2(p.y - lk.y, p.x - lk.x);
      lk.s.el.classList.add('rs-ovuluyor');
      // aynı karede: parmağın altında köpük + ses
      kopukBalon(p.x, p.y, 1.2);
      b.ses.cal('kopuk', { perde: 1, guc: 0.6 });
    }
  });

  function tut(k: Kovadaki, x: number, y: number) {
    ovulen?.s.el.classList.remove('rs-ovuluyor');
    ovulen = null;
    tutulan = k;
    k.yer = 'el';
    k.s.el.dataset.yer = 'el';
    k.s.el.classList.add('rs-tutuldu');
    k.x = x;
    k.y = y - 26;
    konumla(k);
    b.ses.cal('hop', { perde: 1.1, guc: 0.5 });
    b.dokunsal(8);
    herkesYerine();
  }

  kok.addEventListener('pointermove', (e) => {
    if (e.pointerId !== id) return;
    const p = yerel(e);
    const t = performance.now();
    const d = Math.hypot(p.x - son.x, p.y - son.y);
    const dt = Math.max(1, t - son.t);
    son = { x: p.x, y: p.y, t };
    if (tutulan) {
      tasi(tutulan, p.x, p.y, dt);
      return;
    }
    if (!ovulen) return;
    // leğenden çıkan parmak sebzeyi alır (taşıma)
    if (!legendeMi(p.x, p.y, 1.12)) {
      tut(ovulen, p.x, p.y);
      return;
    }
    const hedefK = altindaki(p.x, p.y, legende()) ?? ovulen;
    if (hedefK !== ovulen) {
      ovulen.s.el.classList.remove('rs-ovuluyor');
      ovulen = hedefK;
      ovulen.aci = null;
      ovulen.s.el.classList.add('rs-ovuluyor');
    }
    ov(ovulen, p.x, p.y, d);
  });

  function ov(k: Kovadaki, x: number, y: number, d: number) {
    if (d < 0.5) return;
    const ox = k.x - k.boy / 2;
    const oy = k.y - k.boy / 2;
    // lekeler: yakından geçen yol siler
    for (let i = 0; i < k.lekeler.length; i++) {
      const l = k.lekeler[i];
      if (l.kir <= 0) continue;
      const pn = elipsNokta(k.s.govde, k.boy, k.boy, l.u, l.v);
      const cap = (l.boy * Math.min(k.s.govde.rx, k.s.govde.ry) * 1.25 * k.boy) / 100;
      const uz = Math.hypot(x - (ox + pn.x), y - (oy + pn.y));
      const yak = Math.max(0, Math.min(1, 1 - (uz - cap / 2) / (cap / 2 + 34)));
      const once = l.kir;
      lekeOv(l, d, yak, yas);
      lekeGuncelle(k, i, once);
    }
    // köpük
    k.kopuk = kopukEkle(k.kopuk, d);
    k.kopukEl.style.opacity = String(k.kopuk);
    k.ovulan += d;
    kopukSes += d;
    dokunsalYol += d;
    if (kopukSes > 46) {
      kopukSes = 0;
      kopukBalon(x, y, 1);
      b.ses.cal('kopuk', { perde: 0.9 + Math.random() * 0.3, guc: 0.5 });
    }
    if (dokunsalYol > 90) {
      dokunsalYol = 0;
      b.dokunsal(6);
    }
    // daire: sebzenin merkezi etrafındaki açı birikir; tur tamamlanınca
    const a = Math.atan2(y - k.y, x - k.x);
    if (k.aci !== null) k.turAci += Math.abs(aciFarki(k.aci, a));
    k.aci = a;
    if (k.turAci >= TUR_ACI) {
      k.turAci = 0;
      const l = turSil(k.lekeler, yas);
      if (l) lekeGuncelle(k, k.lekeler.indexOf(l), l.kir + 0.5);
      ezil(k.s.el, 0.8);
      b.ses.cal('kopuk', { perde: 1.3, guc: 0.8 });
      olay('tur');
    }
    if (k.ugur && k.ovulan > 200) ugurUcar(k);
  }

  function lekeGuncelle(k: Kovadaki, i: number, once: number) {
    const l = k.lekeler[i];
    const el = k.lekeEl[i];
    if (el) el.style.opacity = String(Math.max(0, l.kir));
    if (once > 0.04 && l.kir <= 0.04) {
      // leke silindi: pıt + minik parıltı
      l.kir = 0;
      if (el) el.style.opacity = '0';
      const pn = elipsNokta(k.s.govde, k.boy, k.boy, l.u, l.v);
      parilti(efektKat, k.x - k.boy / 2 + pn.x, k.y - k.boy / 2 + pn.y, 3, 18);
      b.ses.cal('pit', { perde: 1 + k.lekeler.filter((x) => x.kir <= 0).length * 0.08 });
      olay('leke');
      if (temizMi(k.lekeler)) {
        olay('temiz');
        nota(84, 0, 0.12, 'sine', 0.08);
        k.s.el.dataset.temiz = '1';
      }
      ipucuGuncelle();
    }
  }

  function kopukBalon(x: number, y: number, guc: number) {
    sac(efektKat, x, y, 'kopuk', 'rgba(255,255,255,0.95)', 3, { yon: -Math.PI / 2, yay: 3, guc: 0.35 * guc, boy: 16 });
  }

  function tasi(k: Kovadaki, x: number, y: number, dt: number) {
    k.x = x;
    k.y = y - 26;
    konumla(k);
    // musluğun altında: su kendiliğinden akar, köpük gider
    const alt = muslukAltinda(k.x, k.y);
    if (alt) {
      clearTimeout(suKapat);
      if (!suAcik) suAc(true, true);
      const once = k.kopuk;
      k.kopuk = durula(k.kopuk, dt);
      // su lekeyi çok az yumuşatır (ovmadan temizlenmez)
      for (let i = 0; i < k.lekeler.length; i++) {
        const o = k.lekeler[i].kir;
        lekeOv(k.lekeler[i], dt * 0.02, 1, yas);
        lekeGuncelle(k, i, o);
      }
      k.kopukEl.style.opacity = String(k.kopuk);
      k.s.el.classList.add('rs-islak');
      if (Math.random() < 0.25) sac(efektKat, k.x + (Math.random() - 0.5) * k.boy * 0.5, k.y + k.boy * 0.3, 'damla', '#9ad8ee', 1, { yon: Math.PI / 2, yay: 0.8, guc: 1 });
      if (once > 0 && k.kopuk === 0) {
        olay('durula');
        if (temizMi(k.lekeler) && !k.parladi) parla(k);
        ipucuGuncelle();
      }
    } else if (suAcik && suKendi) {
      clearTimeout(suKapat);
      suKapat = window.setTimeout(() => suKendi && suAc(false), sureMs(700));
    }
  }

  function parla(k: Kovadaki) {
    k.parladi = true;
    parilti(efektKat, k.x, k.y, 7, k.boy * 0.45);
    b.ses.cal('ting', { perde: 1 + suzgecte().filter((x) => x.parladi).length * 0.06 });
    if (sebzeler.filter((x) => x.parladi).length === 1) void b.mino.soyle(M.temiz);
  }

  const birak = (e: PointerEvent) => {
    if (e.pointerId !== id) return;
    id = null;
    const p = yerel(e);
    if (ovulen) {
      ovulen.s.el.classList.remove('rs-ovuluyor');
      ovulen.aci = null;
      ovulen = null;
      ipucuGuncelle();
      return;
    }
    const k = tutulan;
    tutulan = null;
    if (!k) return;
    k.s.el.classList.remove('rs-tutuldu');
    if (suKendi) {
      clearTimeout(suKapat);
      suKapat = window.setTimeout(() => suKendi && suAc(false), sureMs(500));
    }
    const temiz = temizMi(k.lekeler);
    if (suzgecteMi(p.x, p.y) || (!legendeMi(p.x, p.y, 1.2) && (k.kopuk === 0 || muslukAltinda(k.x, k.y)) && temiz)) {
      k.yer = 'suzgec';
      suzgeceIndi(k);
    } else {
      // leğene geri (leğen doluysa en eski süzgece)
      const l = legende();
      if (l.length >= 3) {
        l[0].yer = 'suzgec';
        suzgeceIndi(l[0]);
      }
      k.yer = 'legen';
      herkesYerine();
      window.setTimeout(() => plop(k), sureMs(200));
    }
    ipucuGuncelle();
  };
  kok.addEventListener('pointerup', birak);
  kok.addEventListener('pointercancel', birak);

  function suzgeceIndi(k: Kovadaki) {
    k.suzgecte = true;
    herkesYerine();
    b.ses.cal('tok', { perde: 1.5, guc: 0.6 });
    hopla(k.s.el, 8, 260);
    olay('suzgec');
    // köpüklü sebze: köpükler Mino'ya uçar, Mino hapşırır (komik)
    if (k.kopuk > 0.3) {
      k.kopuk = 0;
      k.kopukEl.style.opacity = '0';
      void kopukMinoya(k.x, k.y);
    } else if (temizMi(k.lekeler) && !k.parladi && k.kopuk === 0 && k.s.el.classList.contains('rs-islak')) parla(k);
    if (!odulde && suzgecte().length >= 2 && !legende().length && suzgecte().every((x) => temizMi(x.lekeler))) {
      if (!hopladi) b.tepsi.hopla();
      hopladi = true;
    }
  }
  let hopladi = false;

  async function kopukMinoya(x: number, y: number) {
    olay('kopuklu');
    const mr = b.mino.el.getBoundingClientRect();
    const kr = kok.getBoundingClientRect();
    const hx = mr.left - kr.left + mr.width * 0.5;
    const hy = mr.top - kr.top + mr.height * 0.4;
    for (let i = 0; i < 4; i++) {
      const bal = h('i.rs-yk-balon');
      bal.style.transform = `translate(${x}px,${y}px)`;
      efektKat.append(bal);
      void uc(bal, hx - x + (i - 1.5) * 14, hy - y + (i % 2) * 10, 700 + i * 90, -70).then(() => {
        b.ses.cal('pit', { perde: 1.4 + i * 0.1, guc: 0.6 });
        bal.remove();
      });
    }
    await bekle(820);
    if (kapandi) return;
    hapsu();
    void b.mino.tepki('hapsir', 900);
    await bekle(700);
    if (!kapandi) void b.mino.soyle(M.kopuk);
  }

  // ------------------------------------------------------------ uğur böceği (sürpriz)
  async function ugurUcar(k: Kovadaki) {
    k.ugur = false;
    const ub = k.s.el.querySelector<HTMLElement>('.rs-yk-ugur');
    if (!ub) return;
    olay('ugur');
    const br = ub.getBoundingClientRect();
    const kr = kok.getBoundingClientRect();
    const x = br.left - kr.left + br.width / 2;
    const y = br.top - kr.top + br.height / 2;
    ub.remove();
    ub.style.cssText = `left:0;top:0;transform:translate(${x}px,${y}px)`;
    ub.classList.add('rs-ucuyor');
    efektKat.append(ub);
    pirpir();
    void b.mino.soyle(M.ugur);
    const mr = b.mino.el.getBoundingClientRect();
    const nx = mr.left - kr.left + mr.width * 0.5;
    const ny = mr.top - kr.top + mr.height * 0.48;
    await uc(ub, nx - x, ny - y, 900, -90);
    if (kapandi) return;
    // burnuna kondu: Mino şaşı bakar, hapşırır
    void b.mino.tepki('sasir', 1300);
    kipirda(ub, 2, 300);
    await bekle(1100);
    if (kapandi) return;
    hapsu();
    void b.mino.tepki('hapsir', 900);
    await bekle(460);
    pirpir();
    ub.getAnimations().forEach((a) => a.cancel());
    ub.style.transform = `translate(${nx}px,${ny}px)`;
    void uc(ub, W - nx + 60, -ny - 80, 1100, -120).then(() => ub.remove());
    await bekle(500);
    if (!kapandi) {
      kikir();
      void b.mino.soyle(M.gidik);
    }
  }

  // ------------------------------------------------------------ ipucu (§4c: merdiveni çerçeve sayar)
  function ipucuGuncelle() {
    if (odulde) return b.ipucu.hedef(null);
    const l = legende();
    const kirli = l.find((k) => !temizMi(k.lekeler));
    if (kirli) return b.ipucu.hedef({ el: () => kirli.s.el, soz: M.ipucu.camur, hareket: 'daire' });
    const kopuklu = l.find((k) => k.kopuk > 0);
    if (kopuklu) return b.ipucu.hedef({ el: () => kopuklu.s.el, soz: M.ipucu.kopuk, hareket: 'surukle', nereye: () => musluk });
    if (l.length) return b.ipucu.hedef({ el: () => l[0].s.el, soz: M.ipucu.suzgec, hareket: 'surukle', nereye: () => suzgec });
    if (!sebzeler.length) return b.ipucu.hedef({ el: () => raf.firstElementChild as HTMLElement | null, soz: M.ipucu.bos, hareket: 'dokun' });
    b.ipucu.hedef({ el: () => b.tepsi.el, soz: M.ipucu.bitti, hareket: 'dokun' });
  }

  // ------------------------------------------------------------ tepsi: ödül anı ve ürün
  let coz: (u: Urun[]) => void = () => undefined;
  const bitti = new Promise<Urun[]>((rr) => (coz = rr));
  b.tepsi.dinle(() => {
    if (odulde) return;
    if (!sebzeler.length) return coz([]);
    odulde = true;
    ipucuGuncelle();
    void odul();
  });

  async function odul() {
    olay('odul');
    suAc(false);
    for (const k of legende()) {
      k.yer = 'suzgec';
      k.suzgecte = true;
    }
    if (tutulan) {
      tutulan.s.el.classList.remove('rs-tutuldu');
      tutulan.yer = 'suzgec';
      tutulan = null;
    }
    herkesYerine();
    await bekle(260);
    // temiz olanlar sırayla parlar
    const s = suzgecte();
    let i = 0;
    for (const k of s) {
      if (!temizMi(k.lekeler)) continue;
      parilti(efektKat, k.x, k.y, 5, k.boy * 0.4);
      nota(79 + i * 2, 0, 0.16, 'sine', 0.09);
      hopla(k.s.el, 10, 240);
      i++;
      await bekle(140);
    }
    odulEzgi([72, 76, 79, 84]);
    sac(efektKat, S.cx, S.cy + S.R * 0.8, 'damla', '#9ad8ee', 6, { yon: Math.PI / 2, yay: 0.9, guc: 0.7 });
    await bekle(520);
    // süzgeç tepsiye kayar
    const tr = b.tepsi.el.getBoundingClientRect();
    const kr = kok.getBoundingClientRect();
    const dx = tr.left - kr.left + tr.width / 2 - S.cx;
    const dy = tr.top - kr.top + tr.height / 2 - S.cy;
    const tasinan = [suzgec, ...s.map((k) => k.s.el)];
    await Promise.all(tasinan.map((el) => uc(el, dx, dy, 420, -40)));
    const ozellik = yikamaOzeti(s);
    const liste = s.map((k) => k.m);
    coz([{ id: urunId('yikanmis'), tur: 'yikanmis', ozellik, gorsel: () => suzgecGorsel(liste, ozellik.temiz ?? false) }]);
  }

  (window as unknown as { __rsYika?: unknown }).__rsYika = {
    olaylar,
    durum: () => ({
      raf: raftakiler.slice(),
      sebzeler: sebzeler.map((k) => ({ m: k.m, yer: k.yer, kir: k.lekeler.map((l) => +l.kir.toFixed(2)), kopuk: +k.kopuk.toFixed(2), temiz: temizMi(k.lekeler), ugur: k.ugur })),
      su: suAcik,
      legen: { ...L },
      suzgec: { ...S },
      musluk: { ...MU },
    }),
  };
  yerlestir();
  ipucuGuncelle();

  return {
    bitti,
    kapat() {
      kapandi = true;
      ro?.disconnect();
      clearTimeout(suKapat);
      suDongu?.dur();
      kok.remove();
    },
  };
}

/** Tepsideki ve masadaki küçük hâli: süzgeçte yıkanmış sebzeler (kutusunu doldurur) */
export function suzgecGorsel(liste: Malzeme[], temiz: boolean): HTMLElement {
  const el = h('div.rs-yk-urun', { 'data-temiz': temiz ? '1' : '' });
  const n = Math.min(liste.length, 5);
  liste.slice(0, 5).forEach((m, i) => {
    const s = sebzeEl(m);
    const a = i * 2.39996;
    const rr = n > 1 ? 18 : 0;
    s.el.style.cssText = `left:${50 + Math.cos(a) * rr - 26}%;top:${48 + Math.sin(a) * rr - 26}%;width:52%;height:52%`;
    el.append(s.el);
  });
  return el;
}
