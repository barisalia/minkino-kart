/**
 * SOY (soyacak ve kabuk kovası; tezgâh, üstten) · ekip/senaryo/RESTORAN.md §8 M3, §9.12, §1d.
 *
 * Rafta patates, havuç, salatalık, portakal...: hangisini soyacağı çocuğun seçimi. Sebze tahtanın ortasına gelir.
 *  - Soyacağı sebzenin boyunca sürükle: soyacak parmağın biraz üstünde durur (aynı karede), geçtiği şeridin rengi
 *    değişir (patates kahveden kreme), kabuk uzun bir şerit olarak kıvrılıp kovaya düşer ("çıtır", seri soymada ton
 *    yükselir). Bir yüz bitince sebze döner: 3-4'te kendiliğinden, 5-6'da yanına dokununca.
 *  - Komik: soyulmuşu soymaya devam edersen sebze incelir, sonunda kürdan kadar kalır; Mino onu bıyık gibi takar.
 *  - Gizli (5-6, portakal): parmağı kaldırmadan daire çizilirse tek parça spiral kabuk: Lokum alttan çıkar, kabuk
 *    başına taç olur. Parmak erken kalkarsa spiral kopar, parçalar kovaya.
 * Ödül: kovadaki kabuklar kule olur, kova "dolu!" diye zıplar; soyulmuşlar kâseyle tepsiye kayar.
 * Çıktı: `{ tur: 'soyulmus', ozellik: { malzemeler: { m: { adet, soyuldu } } } }`.
 */
import { h } from '../../../../src/ui/dom';
import metin from '../../../../content/restoran/mini-soy.json';
import { MALZEME_ADI, urunId, type Malzeme, type MiniBaglam, type MiniGirdi, type MiniOturum, type MiniOyun, type Urun } from '../arayuz';
import { ezil, hopla, kipirda, parilti, sac } from '../dogra/efekt';
import { RENK, rafSimge } from '../dogra/gorsel';
import { aciFarki } from '../yika/mantik';
import { bakanKur, bekle, kikir, nota, odulEzgi, olayKaydi, resim, sebzeEl, sureMs, type Sebze, uc } from '../yika/ortak';
import { fircala, incelt, kaplama, ornekler, SOY, SPIRAL_ACI, SPIRAL_BANT, soyOzeti, soymaOrani, yeniSebze, yuzBitti, yuzTamam, type Nokta, type SoyDurum } from './mantik';
import './soy.css';

const M = metin.mino;
const SOYULUR: Malzeme[] = ['patates', 'havuc', 'salatalik', 'portakal', 'elma'];
/** soyulunca görünen iç renk (yer tutucu; Gemini `yiyecek/<m>-soyulmus` gelince resim) */
const IC: Partial<Record<Malzeme, string>> = { patates: '#F6E3A8', havuc: '#FBA35A', salatalik: '#D6EFB0', portakal: '#FFF1D6', elma: '#FFF0C8' };
const SVG = 'http://www.w3.org/2000/svg';

interface Tahtada {
  d: SoyDurum;
  s: Sebze;
  ic: HTMLElement;
  svg: SVGSVGElement;
  ornek: Nokta[];
  soyulan: Uint8Array;
  boy: number;
  x: number;
  y: number;
  donBekliyor: boolean;
}
interface Kasede {
  m: Malzeme;
  oran: number;
  kurdan: boolean;
  el: HTMLElement;
}

export const oyun: MiniOyun = {
  ad: 'soy',
  istasyon: 'tezgah',
  simge: () => {
    const u = resim('alet/soyacak');
    return u ? h('img.rs-sy-simge', { src: u, alt: '', draggable: 'false' }) : h('span.rs-sy-simge-yt');
  },
  baslat(b, g) {
    return soyBaslat(b, g);
  },
};

function soyBaslat(b: MiniBaglam, g: MiniGirdi): MiniOturum {
  const yas = g.yas;
  const K = SOY[yas];
  let raftakiler = SOYULUR.filter((m) => g.malzemeler.includes(m));
  for (const m of ['patates', 'havuc', 'salatalik'] as Malzeme[]) if (raftakiler.length < 3 && !raftakiler.includes(m)) raftakiler.push(m);
  // 5-6: portakal hep rafta (spiral kabuk tacı); dolap hep dolu
  if (yas === 'buyuk' && !raftakiler.includes('portakal')) raftakiler.push('portakal');
  raftakiler = raftakiler.slice(0, yas === 'kucuk' ? 3 : 5);

  const kok = h('div.rs-soy', { 'data-yas': yas });
  const { olaylar, olay } = olayKaydi(kok);
  const raf = h('div.rs-sy-raf');
  const tahta = h('div.rs-sy-tahta');
  const kovaUrl = resim('alet/kabuk-kovasi');
  const kova = h('div.rs-sy-kova', { 'data-resim': kovaUrl ? '1' : '' }, kovaUrl ? h('img.rs-sy-kova-resim', { src: kovaUrl, alt: '', draggable: 'false' }) : h('i.rs-sy-kova-govde'), h('div.rs-sy-yigin'), kovaUrl ? null : h('i.rs-sy-kova-on'));
  const yigin = kova.querySelector<HTMLElement>('.rs-sy-yigin')!;
  const kase = h('div.rs-sy-kase', {}, h('i.rs-sy-kase-govde'), h('div.rs-sy-kase-ic'));
  const kaseIc = kase.querySelector<HTMLElement>('.rs-sy-kase-ic')!;
  const sebzeKat = h('div.rs-sy-sebze-kat');
  const soyacakUrl = resim('alet/soyacak');
  const soyacak = h('div.rs-sy-soyacak', { 'aria-hidden': 'true' }, soyacakUrl ? h('img', { src: soyacakUrl, alt: '', draggable: 'false' }) : h('i.rs-sy-soyacak-yt', {}, h('i'), h('i')));
  const efektKat = h('div.rs-sy-efekt');
  kok.append(tahta, kase, kova, sebzeKat, raf, soyacak, efektKat);
  b.kok.append(kok);
  const lokum = bakanKur(kok, 'lokum');

  for (const m of raftakiler) {
    const btn = h('button.rs-sy-raf-oge', { type: 'button', 'aria-label': MALZEME_ADI[m], 'data-malzeme': m }, rafSimge(m));
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      rafaDokun(m, btn);
    });
    raf.append(btn);
  }

  // ------------------------------------------------------------ yerleşim
  let W = 800;
  let H = 400;
  const T = { cx: 330, cy: 230, w: 360, h: 240 };
  const KV = { x: 600, y: 300, w: 104 };
  const KS = { x: 700, y: 150, w: 120 };
  const DIN = { x: 560, y: 180 };
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
    // tahta: istasyon-tezgah çizimindeki (ve yer tutucudaki) kesme tahtası: yatayda %22-78 × %16-86; dikeyde çizim döner
    if (yatay) {
      T.w = W * 0.56;
      T.cx = W * 0.5;
      T.h = H - rafAlt - 14;
      T.cy = rafAlt + T.h / 2 + 4;
      KV.w = Math.min(104, W * 0.13);
      KV.x = Math.max(70, W * 0.11);
      KV.y = H * 0.5 + KV.w * 0.2;
      KS.w = Math.min(124, W * 0.17);
      KS.x = W * 0.89;
      KS.y = Math.max(rafAlt + KS.w * 0.45, H * 0.42);
      DIN.x = W * 0.86;
      DIN.y = Math.min(H - 130, KS.y + KS.w * 0.75);
    } else {
      T.w = W * 0.7;
      T.cx = W * 0.49;
      T.h = H * 0.56;
      T.cy = Math.max(H * 0.5, rafAlt + T.h / 2);
      KV.w = Math.min(100, W * 0.25);
      KV.x = W * 0.46;
      KV.y = H - KV.w * 0.42 - 12;
      KS.w = Math.min(112, W * 0.28);
      KS.x = W * 0.24;
      KS.y = T.cy + T.h / 2 + KS.w * 0.3;
      DIN.x = W - 34;
      DIN.y = T.cy;
    }
    tahta.style.cssText = `left:${T.cx - T.w / 2}px;top:${T.cy - T.h / 2}px;width:${T.w}px;height:${T.h}px`;
    kova.style.cssText = `left:${KV.x - KV.w / 2}px;top:${KV.y - KV.w * 0.62}px;width:${KV.w}px;height:${KV.w * 1.0}px`;
    kase.style.cssText = `left:${KS.x - KS.w / 2}px;top:${KS.y - KS.w * 0.4}px;width:${KS.w}px;height:${KS.w * 0.8}px`;
    if (!tutuluyor) soyacak.style.transform = `translate(${DIN.x}px,${DIN.y}px)`;
    if (aktif) aktifYerlestir(aktif);
  }
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => yerlestir()) : null;
  ro?.observe(kok);

  // ------------------------------------------------------------ tahtadaki sebze
  let aktif: Tahtada | null = null;
  const kasede: Kasede[] = [];
  let kabukSay = 0;
  let odulde = false;
  let kapandi = false;

  function aktifYerlestir(t: Tahtada) {
    t.boy = Math.max(90, Math.min(T.h * 0.96, T.w * 0.7, t.s.enCok));
    t.x = T.cx;
    t.y = T.cy;
    t.s.el.style.cssText = `width:${t.boy}px;height:${t.boy}px;transform:translate(${t.x - t.boy / 2}px,${t.y - t.boy / 2}px)`;
    t.svg.setAttribute('viewBox', `0 0 ${t.boy} ${t.boy}`);
    const e = t.s.govde;
    const el = t.svg.querySelector('ellipse')!;
    el.setAttribute('cx', String((e.cx / 100) * t.boy));
    el.setAttribute('cy', String((e.cy / 100) * t.boy));
    el.setAttribute('rx', String((e.rx / 100) * t.boy * 0.97));
    el.setAttribute('ry', String((e.ry / 100) * t.boy * 0.97));
    el.setAttribute('transform', `rotate(${e.a} ${(e.cx / 100) * t.boy} ${(e.cy / 100) * t.boy})`);
    inceUygula(t);
  }
  function inceUygula(t: Tahtada) {
    const e = t.s.govde;
    t.ic.style.transformOrigin = `${e.cx}% ${e.cy}%`;
    t.ic.style.transform = t.d.ince < 1 ? `rotate(${e.a}deg) scale(${0.85 + 0.15 * t.d.ince},${t.d.ince}) rotate(${-e.a}deg)` : '';
  }

  function rafaDokun(m: Malzeme, btn: HTMLElement) {
    if (odulde) return;
    ezil(btn, 1.2);
    b.dokunsal(8);
    void b.mino.soyle((M.ad as Record<string, string>)[m] ?? `${MALZEME_ADI[m]}!`);
    if (aktif) kaseyeKoy(aktif);
    const s = sebzeEl(m);
    const ic = h('div.rs-sy-ic');
    // sebze resmi iç sarmalda (incelince yalnız o daralır); soyulan şeritler gövde elipsine kırpılır
    while (s.el.firstChild) ic.append(s.el.firstChild);
    const svg = document.createElementNS(SVG, 'svg');
    svg.setAttribute('class', 'rs-sy-soyulan');
    const kid = `rs-sy-kirp-${Math.random().toString(36).slice(2, 8)}`;
    svg.innerHTML = `<defs><clipPath id="${kid}"><ellipse/></clipPath></defs><g clip-path="url(#${kid})" fill="none" stroke="${IC[m] ?? '#fff3d6'}" stroke-linecap="round" stroke-linejoin="round"></g>`;
    ic.append(svg);
    s.el.append(ic);
    s.el.classList.add('rs-sy-sebze');
    const t: Tahtada = { d: yeniSebze(m), s, ic, svg, ornek: ornekler(s.govde.rx, s.govde.ry), soyulan: new Uint8Array(0), boy: 100, x: 0, y: 0, donBekliyor: false };
    t.soyulan = new Uint8Array(t.ornek.length);
    aktif = t;
    sebzeKat.append(s.el);
    aktifYerlestir(t);
    const br = btn.getBoundingClientRect();
    const kr = kok.getBoundingClientRect();
    try {
      s.el.animate(
        [
          { translate: `${br.left - kr.left + br.width / 2 - t.x}px ${br.top - kr.top + br.height / 2 - t.y}px`, scale: '0.4' },
          { translate: '0 -30px', scale: '0.9', offset: 0.6 },
          { translate: '0 0', scale: '1.05 0.92', offset: 0.88 },
          { translate: '0 0', scale: '1' },
        ],
        { duration: sureMs(360), easing: 'ease-in' },
      );
    } catch {
      /* yok say */
    }
    window.setTimeout(() => !kapandi && b.ses.cal('tok', { perde: 0.8, guc: 0.7 }), sureMs(320));
    olay('tahta');
    ipucuGuncelle();
  }

  function kaseyeKoy(t: Tahtada) {
    const oran = soymaOrani(t.d, kaplama(t.soyulan), yas);
    const el = h('div.rs-sy-kase-oge');
    const s = sebzeEl(t.d.m, t.d.soyuldu);
    if (t.d.soyuldu) s.el.dataset.soyuldu = '1';
    el.append(s.el);
    const i = kasede.length;
    el.style.cssText = `left:${18 + ((i * 23) % 52)}%;top:${4 + ((i * 17) % 30)}%`;
    kasede.push({ m: t.d.m, oran, kurdan: false, el });
    kaseIc.append(el);
    // tahtadan kâseye kayar
    const kr = kase.getBoundingClientRect();
    const kk = kok.getBoundingClientRect();
    const dx = kr.left - kk.left + kr.width / 2 - t.x;
    const dy = kr.top - kk.top + kr.height / 2 - t.y;
    const eski = t.s.el;
    void uc(eski, dx, dy, 360, -40).then(() => eski.remove());
    hopla(kase, 6, 260);
    if (aktif === t) aktif = null;
  }

  // ------------------------------------------------------------ soyma (parmak)
  let id: number | null = null;
  let tutuluyor = false;
  let son: { x: number; y: number } | null = null;
  let sonG: Nokta | null = null;
  let cizgi: SVGPolylineElement | null = null;
  let cizgiNokta: string[] = [];
  let boyunca = 0;
  let toplamYol = 0;
  let sesYol = 0;
  let seri = 0;
  let sonKesik = 0;
  let baslangic = { x: 0, y: 0, t: 0 };
  // spiral (5-6 portakal)
  let spiralAci = 0;
  let spiralSon: number | null = null;
  let spiralKirik = false;
  let spiralTamam = false;
  let spiralBobin: HTMLElement | null = null;

  const yerel = (e: PointerEvent) => {
    const r = kok.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  /** kap px → gövde ekseni (U, V) */
  function govdeye(t: Tahtada, x: number, y: number): Nokta & { u: number; v: number } {
    const e = t.s.govde;
    const lx = x - (t.x - t.boy / 2) - (e.cx / 100) * t.boy;
    const ly = y - (t.y - t.boy / 2) - (e.cy / 100) * t.boy;
    const a = (e.a * Math.PI) / 180;
    const u = (lx * Math.cos(a) + ly * Math.sin(a)) / ((e.rx / 100) * t.boy);
    const v = (-lx * Math.sin(a) + ly * Math.cos(a)) / ((e.ry / 100) * t.boy * t.d.ince);
    return { u, v, U: (u * e.rx) / e.ry, V: v };
  }
  const spiralModu = (t: Tahtada) => yas === 'buyuk' && t.d.m === 'portakal' && !t.d.soyuldu && !spiralKirik && !spiralTamam;
  const fircaPx = (t: Tahtada) => K.firca * 2 * (t.s.govde.ry / 100) * t.boy * t.d.ince;

  kok.addEventListener('pointerdown', (e) => {
    if (id !== null || odulde || !aktif) return;
    const p = yerel(e);
    if (Math.abs(p.x - T.cx) > T.w / 2 + 30 || Math.abs(p.y - T.cy) > T.h / 2 + 30) return;
    e.preventDefault();
    id = e.pointerId;
    try {
      kok.setPointerCapture(e.pointerId);
    } catch {
      /* yok say */
    }
    tutuluyor = true;
    // aynı karede: soyacak parmağın biraz üstünde belirir
    soyacak.classList.add('rs-tutuluyor');
    soyacak.style.transform = `translate(${p.x}px,${p.y - 34}px)`;
    baslangic = { x: p.x, y: p.y, t: performance.now() };
    son = p;
    sonG = null;
    boyunca = 0;
    cizgi = null;
    cizgiNokta = [];
    spiralSon = null;
    const g0 = govdeye(aktif, p.x, p.y);
    if (g0.u * g0.u + g0.v * g0.v <= 1.1) {
      b.ses.cal('citir', { perde: 1.05, guc: 0.45 });
      b.dokunsal(6);
    }
  });

  kok.addEventListener('pointermove', (e) => {
    if (e.pointerId !== id || !aktif) return;
    const p = yerel(e);
    soyacak.style.transform = `translate(${p.x}px,${p.y - 34}px)`;
    const t = aktif;
    const d = son ? Math.hypot(p.x - son.x, p.y - son.y) : 0;
    son = p;
    if (spiralModu(t)) return spiralIlerle(t, p.x, p.y, d);
    if (t.donBekliyor) return;
    const gp = govdeye(t, p.x, p.y);
    const ustunde = gp.u * gp.u + gp.v * gp.v <= 1.05;
    if (!ustunde) {
      sonG = null;
      return;
    }
    if (!cizgi) {
      cizgi = document.createElementNS(SVG, 'polyline');
      cizgi.setAttribute('stroke-width', String(fircaPx(t)));
      t.svg.querySelector('g')!.append(cizgi);
      cizgiNokta = [];
    }
    const lx = p.x - (t.x - t.boy / 2);
    const ly = p.y - (t.y - t.boy / 2);
    cizgiNokta.push(`${lx.toFixed(1)},${ly.toFixed(1)}`);
    cizgi.setAttribute('points', cizgiNokta.join(' '));
    if (sonG) {
      boyunca += d;
      toplamYol += d;
      sesYol += d;
      if (!t.d.soyuldu) {
        fircala(t.ornek, t.soyulan, sonG, gp, K.firca);
        if (yuzBitti(kaplama(t.soyulan), yas)) yuzBittiOlay(t);
      }
      if (sesYol > 26) {
        sesYol = 0;
        const now = performance.now();
        seri = now - sonKesik < 900 ? Math.min(seri + 1, 8) : 0;
        sonKesik = now;
        b.ses.cal('citir', { perde: 1 + seri * 0.05, guc: 0.55 });
        b.dokunsal(6);
        // kabuk kırıntısı kopar
        sac(efektKat, p.x, p.y + 6, 'kabuk', RENK[t.d.m]?.[0] ?? '#a87444', 1, { yon: Math.PI / 2, yay: 1.6, guc: 0.4, boy: 10 });
      }
    }
    sonG = gp;
  });

  function yuzBittiOlay(t: Tahtada) {
    const s = yuzTamam(t.d, yas);
    olay(s === 'don' ? 'yuz' : 'soyuldu');
    if (s === 'soyuldu') return soyulduOlay(t);
    nota(81, 0, 0.12, 'sine', 0.08);
    if (K.kendiDon) {
      t.donBekliyor = true;
      window.setTimeout(() => !kapandi && aktif === t && don(t), sureMs(380));
    } else {
      t.donBekliyor = true;
      kipirda(t.s.el, 5, 320);
      ipucuGuncelle();
    }
  }

  async function don(t: Tahtada) {
    if (!t.donBekliyor) return;
    t.donBekliyor = false;
    olay('don');
    b.ses.cal('hop', { perde: 0.9 });
    try {
      await t.s.el.animate([{ scale: '1 1' }, { scale: '0.08 1.05', offset: 0.5 }, { scale: '1 1' }], { duration: sureMs(320), easing: 'ease-in-out' }).finished;
    } catch {
      /* yok say */
    }
    // yeni yüz: şeritler temizlenir
    t.svg.querySelector('g')!.replaceChildren();
    t.soyulan.fill(0);
    cizgi = null;
    ipucuGuncelle();
  }

  function soyulduOlay(t: Tahtada) {
    t.donBekliyor = false;
    // bütün gövde soyuldu: Gemini soyulmuş resmi varsa o, yoksa gövde iç rengiyle dolu (yer tutucu)
    const u = resim(`yiyecek/${t.d.m}-soyulmus`);
    const img = t.ic.querySelector<HTMLImageElement>('.rs-p3-sebze-resim');
    if (u && img) {
      img.src = u;
      t.svg.querySelector('g')!.replaceChildren();
    } else {
      const g0 = t.svg.querySelector('g')!;
      g0.replaceChildren();
      const e = t.s.govde;
      const dolu = document.createElementNS(SVG, 'ellipse');
      dolu.setAttribute('cx', String((e.cx / 100) * t.boy));
      dolu.setAttribute('cy', String((e.cy / 100) * t.boy));
      dolu.setAttribute('rx', String((e.rx / 100) * t.boy * 0.96));
      dolu.setAttribute('ry', String((e.ry / 100) * t.boy * 0.96));
      dolu.setAttribute('transform', `rotate(${e.a} ${(e.cx / 100) * t.boy} ${(e.cy / 100) * t.boy})`);
      dolu.setAttribute('fill', IC[t.d.m] ?? '#fff3d6');
      dolu.setAttribute('stroke', '#3b2416');
      dolu.setAttribute('stroke-width', '3');
      dolu.setAttribute('class', 'rs-sy-dolu');
      t.svg.append(dolu);
    }
    t.s.el.dataset.soyuldu = '1';
    parilti(efektKat, t.x, t.y, 7, t.boy * 0.4);
    b.ses.cal('ting');
    ezil(t.s.el, 1);
    void b.mino.soyle(M.soyuldu);
    if (!hopladi) b.tepsi.hopla();
    hopladi = true;
    ipucuGuncelle();
  }
  let hopladi = false;

  const birak = (e: PointerEvent) => {
    if (e.pointerId !== id) return;
    id = null;
    tutuluyor = false;
    soyacak.classList.remove('rs-tutuluyor');
    soyacak.style.transform = `translate(${DIN.x}px,${DIN.y}px)`;
    const t = aktif;
    if (!t) return;
    const p = yerel(e);
    const kisa = Math.hypot(p.x - baslangic.x, p.y - baslangic.y) < 14 && performance.now() - baslangic.t < 450;
    if (kisa) {
      // dokunuş: (5-6) bekleyen yüz varsa sebze döner
      if (t.donBekliyor) void don(t);
      else ezil(t.s.el, 0.6);
      return;
    }
    if (spiralAci > 0 && !spiralTamam && !spiralKirik && t.d.m === 'portakal' && yas === 'buyuk') spiralKopar(t);
    if (boyunca > 22) kabukDus(t, p.x, p.y, boyunca);
    // soyulmuşu soymaya devam: incelir, sonunda kürdan
    if (t.d.soyuldu && boyunca > 40 && t.s.el.dataset.soyuldu && !spiralSimdiBitti) {
      const kurdan = incelt(t.d);
      inceUygula(t);
      b.ses.cal('kitir', { perde: 1.2 + (1 - t.d.ince) * 0.6 });
      olay('incelt');
      if (kurdan) void kurdanOl(t);
      else if (t.d.ince < 0.7 && !inceDendi) {
        inceDendi = true;
        void b.mino.soyle(M.ince);
      }
    }
    spiralSimdiBitti = false;
    boyunca = 0;
    cizgi = null;
    sonG = null;
    ipucuGuncelle();
  };
  let inceDendi = false;
  let spiralSimdiBitti = false;
  kok.addEventListener('pointerup', birak);
  kok.addEventListener('pointercancel', birak);

  // ------------------------------------------------------------ kabuk şeridi kovaya
  function kabukEl(m: Malzeme, uzun: number): HTMLElement {
    const u = resim(`yiyecek/${m}-kabuk`);
    const el = h('i.rs-sy-kabuk', { 'data-malzeme': m });
    el.style.setProperty('--kabuk', RENK[m]?.[0] ?? '#a87444');
    el.style.setProperty('--ic', IC[m] ?? '#fff3d6');
    el.style.width = `${uzun}px`;
    if (u) el.append(h('img', { src: u, alt: '', draggable: 'false' }));
    else {
      // sade kıvrık şerit (yer tutucu): dalgalı bir bant
      const s = document.createElementNS(SVG, 'svg');
      s.setAttribute('viewBox', '0 0 100 30');
      s.setAttribute('preserveAspectRatio', 'none');
      s.innerHTML = '<path d="M4 18 C 16 4, 26 30, 38 15 S 60 2, 72 16 S 90 28, 96 12" fill="none" stroke="#3b2416" stroke-width="11" stroke-linecap="round"/><path d="M4 18 C 16 4, 26 30, 38 15 S 60 2, 72 16 S 90 28, 96 12" fill="none" stroke="var(--kabuk)" stroke-width="6.5" stroke-linecap="round"/>';
      el.append(s);
    }
    return el;
  }
  function kabukDus(t: Tahtada, x: number, y: number, yol: number) {
    const uz = Math.max(34, Math.min(96, yol * 0.45));
    const el = kabukEl(t.d.m, uz);
    el.style.transform = `translate(${x - uz / 2}px,${y - 10}px)`;
    efektKat.append(el);
    const kx = KV.x - uz / 2 + (Math.random() - 0.5) * KV.w * 0.3;
    const ky = KV.y - KV.w * 0.35;
    b.ses.cal('citir', { perde: 0.9, guc: 0.4 });
    void uc(el, kx - (x - uz / 2), ky - (y - 10), 520, -70).then(() => {
      el.remove();
      yiginaEkle(t.d.m);
    });
  }
  function yiginaEkle(m: Malzeme) {
    if (kapandi) return;
    kabukSay++;
    const parca = kabukEl(m, KV.w * 0.5);
    const i = kabukSay - 1;
    parca.style.cssText += `;left:${12 + ((i * 37) % 44)}%;bottom:${30 + Math.min(i, 14) * 3.2}%;${i % 2 ? 'scale:-1 1;' : ''}`;
    yigin.append(parca);
    b.ses.cal('pof', { perde: 1.6, guc: 0.35 });
    ezil(kova, 0.6);
    olay('kova');
  }

  // ------------------------------------------------------------ kürdan: Mino'nun bıyığı (komik)
  async function kurdanOl(t: Tahtada) {
    olay('kurdan');
    aktif = null;
    const el = t.s.el;
    // incecik sebze tahtadan kalkar, Mino'nun ağzının üstüne uçar
    const mr = b.mino.el.getBoundingClientRect();
    const kr = kok.getBoundingClientRect();
    const mx = mr.left - kr.left + mr.width * 0.5;
    const my = mr.top - kr.top + mr.height * 0.44;
    const u = resim(`yiyecek/${t.d.m}-kurdan`);
    const biyik = h('i.rs-sy-biyik', { 'data-malzeme': t.d.m }, u ? h('img', { src: u, alt: '', draggable: 'false' }) : null);
    biyik.style.setProperty('--kabuk', IC[t.d.m] ?? '#fba35a');
    const bw = Math.max(46, mr.width * 0.56);
    biyik.style.cssText += `;width:${bw}px;transform:translate(${t.x - bw / 2}px,${t.y}px)`;
    efektKat.append(biyik);
    el.remove();
    b.ses.cal('boing', { perde: 1.4 });
    await uc(biyik, mx - t.x, my - t.y, 640, -80);
    if (kapandi) return;
    biyik.getAnimations().forEach((a) => a.cancel());
    biyik.style.transform = `translate(${mx - bw / 2}px,${my}px)`;
    biyik.classList.add('rs-takili');
    ezil(biyik, 1.4);
    void b.mino.tepki('sevin', 1600);
    kikir();
    void b.mino.soyle(M.biyik);
    ipucuGuncelle();
  }

  // ------------------------------------------------------------ spiral portakal kabuğu (5-6, gizli ödül)
  function spiralIlerle(t: Tahtada, x: number, y: number, d: number) {
    const e = t.s.govde;
    const cx = t.x - t.boy / 2 + (e.cx / 100) * t.boy;
    const cy = t.y - t.boy / 2 + (e.cy / 100) * t.boy;
    const R = (e.rx / 100) * t.boy;
    const rr = Math.hypot(x - cx, y - cy) / R;
    if (rr < SPIRAL_BANT[0] || rr > SPIRAL_BANT[1]) {
      spiralSon = null;
      return;
    }
    const a = Math.atan2(y - cy, x - cx);
    if (spiralSon !== null) {
      const once = spiralAci;
      spiralAci += Math.abs(aciFarki(spiralSon, a));
      boyunca += d;
      // soyulan bant: dıştan içe spiral (gövde koordinatında), parmak ilerledikçe
      const adim = 0.12;
      for (let th = once; th < spiralAci; th += adim) {
        const r1 = 0.95 * (1 - th / SPIRAL_ACI);
        const r2 = 0.95 * (1 - Math.min(spiralAci, th + adim) / SPIRAL_ACI);
        fircala(t.ornek, t.soyulan, { U: Math.cos(th) * r1, V: Math.sin(th) * r1 }, { U: Math.cos(th + adim) * r2, V: Math.sin(th + adim) * r2 }, 0.3);
      }
      spiralCiz(t);
      sesYol += d;
      if (sesYol > 24) {
        sesYol = 0;
        b.ses.cal('citir', { perde: 1 + (spiralAci / SPIRAL_ACI) * 0.5, guc: 0.5 });
        b.dokunsal(5);
      }
      bobinBuyut(t, spiralAci / SPIRAL_ACI);
      if (spiralAci >= SPIRAL_ACI) {
        spiralTamam = true;
        spiralSimdiBitti = true;
        void spiralTac(t);
      }
    }
    spiralSon = a;
  }
  function spiralCiz(t: Tahtada) {
    const e = t.s.govde;
    const g0 = t.svg.querySelector('g')!;
    let yol = g0.querySelector<SVGPolylineElement>('polyline.rs-sy-spiral-yol');
    if (!yol) {
      yol = document.createElementNS(SVG, 'polyline');
      yol.setAttribute('class', 'rs-sy-spiral-yol');
      yol.setAttribute('stroke-width', String(0.62 * (e.ry / 100) * t.boy));
      g0.append(yol);
    }
    const nk: string[] = [];
    for (let th = 0; th <= spiralAci; th += 0.1) {
      const r = 0.95 * (1 - th / SPIRAL_ACI);
      nk.push(`${((e.cx / 100) * t.boy + Math.cos(th) * r * (e.rx / 100) * t.boy).toFixed(1)},${((e.cy / 100) * t.boy + Math.sin(th) * r * (e.ry / 100) * t.boy).toFixed(1)}`);
    }
    yol.setAttribute('points', nk.join(' '));
  }
  function bobinBuyut(t: Tahtada, oran: number) {
    if (!spiralBobin) {
      spiralBobin = spiralEl();
      spiralBobin.classList.add('rs-sy-bobin');
      efektKat.append(spiralBobin);
    }
    const w = 30 + oran * t.boy * 0.5;
    spiralBobin.style.cssText = `width:${w}px;height:${w * 0.7}px;transform:translate(${t.x + t.boy * 0.42 - w / 2}px,${t.y - t.boy * 0.5 - w * 0.2}px)`;
  }
  function spiralEl(): HTMLElement {
    const u = resim('yiyecek/portakal-spiral');
    const el = h('i.rs-sy-spiral');
    if (u) el.append(h('img', { src: u, alt: '', draggable: 'false' }));
    else {
      const s = document.createElementNS(SVG, 'svg');
      s.setAttribute('viewBox', '0 0 100 70');
      const nk: string[] = [];
      for (let th = 0; th < Math.PI * 2 * 2.3; th += 0.15) {
        const r = 4 + th * 2.6;
        nk.push(`${(50 + Math.cos(th) * r * 1.15).toFixed(1)},${(38 + Math.sin(th) * r * 0.62 - th * 1.2).toFixed(1)}`);
      }
      s.innerHTML = `<polyline points="${nk.join(' ')}" fill="none" stroke="#3b2416" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${nk.join(' ')}" fill="none" stroke="#f28c28" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
      el.append(s);
    }
    return el;
  }
  function spiralKopar(t: Tahtada) {
    spiralKirik = true;
    olay('spiral-koptu');
    b.ses.cal('citir', { perde: 0.8 });
    if (spiralBobin) {
      const bb = spiralBobin;
      spiralBobin = null;
      const r = bb.getBoundingClientRect();
      const kr = kok.getBoundingClientRect();
      void uc(bb, KV.x - (r.left - kr.left + r.width / 2), KV.y - KV.w * 0.3 - (r.top - kr.top + r.height / 2), 520, -60).then(() => {
        bb.remove();
        yiginaEkle(t.d.m);
        yiginaEkle(t.d.m);
      });
    }
  }
  async function spiralTac(t: Tahtada) {
    olay('spiral');
    // portakal bütünüyle soyuldu
    t.d.bitenYuz = K.yuz;
    t.d.soyuldu = true;
    soyulduOlay(t);
    void b.mino.soyle(M.spiral);
    const bobin = spiralBobin;
    spiralBobin = null;
    if (!bobin) return;
    nota(84, 0, 0.14, 'sine', 0.1);
    nota(88, 0.12, 0.14, 'sine', 0.1);
    nota(91, 0.24, 0.3, 'sine', 0.1);
    await bekle(500);
    if (kapandi) return;
    // Lokum alttan çıkar, kabuk başına taç olur
    const lx = Math.min(W - 120, Math.max(150, T.cx + T.w * 0.36));
    await lokum.gel('alt', lx, Math.min(H * 0.5, 230));
    if (kapandi) return;
    lokum.yuz('saskin', 'o');
    const tepe = lokum.nokta('tepe');
    const r = bobin.getBoundingClientRect();
    const kr = kok.getBoundingClientRect();
    await uc(bobin, tepe.x - (r.left - kr.left + r.width / 2), tepe.y - (r.top - kr.top + r.height / 2), 620, -90);
    if (kapandi) return;
    bobin.remove();
    const tac = spiralEl();
    const en = Math.min(120, r.width * 1.1);
    lokum.basinaKoy(tac, en);
    olay('tac');
    lokum.yuz('mutlu', 'kahkaha');
    hopla(lokum.el.firstElementChild as HTMLElement, 12, 360);
    kikir();
    odulEzgi([76, 79, 83, 88], 0.08);
    void b.mino.soyle(M.tac);
    await bekle(2600);
    if (!kapandi && !odulde) await lokum.git();
  }

  // ------------------------------------------------------------ ipucu
  function ipucuGuncelle() {
    if (odulde) return b.ipucu.hedef(null);
    const t = aktif;
    if (!t) {
      if (!kasede.length) return b.ipucu.hedef({ el: () => raf.firstElementChild as HTMLElement | null, soz: M.ipucu.bos, hareket: 'dokun' });
      return b.ipucu.hedef({ el: () => b.tepsi.el, soz: M.ipucu.bitti, hareket: 'dokun' });
    }
    if (t.donBekliyor) return b.ipucu.hedef({ el: () => t.s.el, soz: M.ipucu.don, hareket: 'dokun' });
    if (!t.d.soyuldu) return b.ipucu.hedef({ el: () => t.s.el, soz: M.ipucu.kabuk, hareket: t.d.m === 'portakal' && yas === 'buyuk' ? 'daire' : 'kaydir-yatay' });
    b.ipucu.hedef({ el: () => b.tepsi.el, soz: M.ipucu.bitti, hareket: 'dokun' });
  }

  // ------------------------------------------------------------ tepsi: ödül ve ürün
  let coz: (u: Urun[]) => void = () => undefined;
  const bitti = new Promise<Urun[]>((r) => (coz = r));
  b.tepsi.dinle(() => {
    if (odulde) return;
    if (!aktif && !kasede.length) return coz([]);
    odulde = true;
    ipucuGuncelle();
    void odul();
  });

  async function odul() {
    olay('odul');
    if (aktif) kaseyeKoy(aktif);
    await bekle(380);
    // kovadaki kabuklar kule olur, kova "dolu!" diye zıplar
    const parcalar = [...yigin.children] as HTMLElement[];
    parcalar.forEach((p, i) => {
      p.style.left = `${22 + (i % 2) * 8}%`;
      p.style.bottom = `${32 + i * (52 / Math.max(6, parcalar.length))}%`;
    });
    if (parcalar.length) {
      hopla(kova, 18, 380);
      b.ses.cal('boing', { perde: 1.1 });
      if (parcalar.length >= 4) void b.mino.soyle(M.kova);
    }
    await bekle(420);
    let i = 0;
    for (const k of kasede) {
      if (k.oran >= 0.75) {
        const r = k.el.getBoundingClientRect();
        const kr = kok.getBoundingClientRect();
        parilti(efektKat, r.left - kr.left + r.width / 2, r.top - kr.top + r.height / 2, 4, 26);
        nota(79 + i * 2, 0, 0.14, 'sine', 0.08);
        i++;
        await bekle(120);
      }
    }
    odulEzgi([74, 77, 81, 86]);
    await bekle(380);
    const tr = b.tepsi.el.getBoundingClientRect();
    const kr = kok.getBoundingClientRect();
    await uc(kase, tr.left - kr.left + tr.width / 2 - KS.x, tr.top - kr.top + tr.height / 2 - KS.y, 420, -40);
    const liste = kasede.map((k) => ({ m: k.m, oran: k.oran, kurdan: k.kurdan }));
    const ozellik = soyOzeti(liste);
    const gosterilen = kasede.map((k) => ({ m: k.m, soyuldu: k.oran >= 0.75 }));
    if (!Object.keys(ozellik.malzemeler).length) return coz([]);
    coz([{ id: urunId('soyulmus'), tur: 'soyulmus', ozellik, gorsel: () => soyulmusGorsel(gosterilen) }]);
  }

  (window as unknown as { __rsSoy?: unknown }).__rsSoy = {
    olaylar,
    durum: () => ({
      raf: raftakiler.slice(),
      aktif: aktif ? { m: aktif.d.m, yuz: aktif.d.bitenYuz, kaplama: +kaplama(aktif.soyulan).toFixed(2), soyuldu: aktif.d.soyuldu, ince: +aktif.d.ince.toFixed(2), donBekliyor: aktif.donBekliyor, x: aktif.x, y: aktif.y, boy: aktif.boy, govde: aktif.s.govde } : null,
      kase: kasede.map((k) => ({ m: k.m, oran: +k.oran.toFixed(2) })),
      kabuk: kabukSay,
      spiral: { aci: +spiralAci.toFixed(2), kirik: spiralKirik, tamam: spiralTamam },
      tahta: { ...T },
    }),
  };
  yerlestir();
  ipucuGuncelle();

  return {
    bitti,
    kapat() {
      kapandi = true;
      ro?.disconnect();
      lokum.sil();
      kok.remove();
    },
  };
}

/** Tepsideki küçük hâli: kâsede soyulmuş sebzeler */
export function soyulmusGorsel(liste: { m: Malzeme; soyuldu: boolean }[]): HTMLElement {
  const el = h('div.rs-sy-urun');
  liste.slice(0, 4).forEach((x, i) => {
    const s = sebzeEl(x.m, x.soyuldu);
    if (x.soyuldu) s.el.dataset.soyuldu = '1';
    s.el.style.cssText = `left:${14 + (i % 2) * 30}%;top:${8 + Math.floor(i / 2) * 24}%;width:56%;height:56%`;
    el.append(s.el);
  });
  return el;
}
