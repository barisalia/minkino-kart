/**
 * RENDELE (ahşap tezgâh) · ekip/senaryo/RESTORAN.md §8 M4, §1d, §4c.
 *
 * Rafta kaşar, havuç, elma ve rafın köşesinden kafasını uzatan bir domates: hangisi rendelenecek çocuğun seçimi.
 *   - Seçilen malzeme rendenin üstüne kayar. Parmakla aşağı yukarı ritimle sürtülür (malzeme parmağı izler, yalnız
 *     rende boyunca): her sürtmede hışırtı, malzeme kısalır, yanında rende yığını kar gibi büyür (parçalar sahnede
 *     kalır). Havuç sert ("kıtır"), elma yumuşak.
 *   - DOMATES: ilk sürtmede "fışşş!": her yer kırmızı, tezgâhta lekeler, Mino'nun yüzü domates benekli; gülüşürler.
 *     Domates rendesi yine kullanılır (menemene konur).
 *   - Boş rendeye sürtmek metal "tıkır tıkır" yapar, Mino zıplar.
 *   - 3-4: her sürtme belirgin bir yığın. 5-6: özel istekte "az" ya da "çok" (yığın küçük / büyük).
 *   - Ödül: malzeme bitince yığın tepeden bir kez kar gibi "pof" eder; tepsi hoplar.
 * Parça döndürme yok, büyütme yok; dokunuşla aynı karede görüntü ve ses.
 */
import { konusuyorMu } from '../../../../src/audio/ses';
import { h, TEST_MODU } from '../../../../src/ui/dom';
import metin from '../../../../content/restoran/mini-rendele.json';
import { MALZEME_ADI, urunId, type MiniBaglam, type MiniGirdi, type MiniOturum, type MiniOyun, type Urun, type YemekOzelligi } from '../arayuz';
import { ezil, hopla, leke, parilti, sac, TITRESIM, ucur } from '../dogra/efekt';
import { butunResim, enCokCss } from '../dogra/gorsel';
import { surukle } from '../dogra/surukle';
import { Elde, merkez, minoYuzune, olayci, p5Ses, rafOge, rafYerlestir, resim, resimYa, YUKARI, type RafOge } from '../kir-cirp/ortak';
import { istekTuttu, RENDE_MALZEMELER, rendeAdet, rendePorsiyon, surt, yiginBoyu, type RendeMalzeme } from './mantik';
import './rendele.css';

const M = metin.mino;
/** Rende tellerinin rengi (yer tutucu) ve yığın rengi */
const RENK: Record<RendeMalzeme, [string, string]> = {
  kasar: ['#FFE07A', '#F2C84A'],
  havuc: ['#F29A3C', '#E9772A'],
  elma: ['#F7F0C6', '#D9443A'],
  domates: ['#E8483A', '#C7302A'],
};

export const oyun: MiniOyun = {
  ad: 'rendele',
  istasyon: 'tezgah',
  simge: () => resimYa('alet/rende', 'rende', 'rs-rd-simge'),
  baslat: (b, g) => rendeleBaslat(b, g),
};

/** Tepside: kâsede rende yığınları (kutusunu doldurur) */
export function rendeKase(miktar: Partial<Record<RendeMalzeme, number>>): HTMLElement {
  const el = h('span.rs-p5-urun-kase.rs-rd-urun');
  let i = 0;
  const toplam = Object.values(miktar).reduce((a, x) => a + (x ?? 0), 0) || 1;
  for (const [m, n] of Object.entries(miktar) as [RendeMalzeme, number][]) {
    const adet = Math.max(3, Math.round((n / toplam) * 18));
    for (let k = 0; k < adet; k++, i++) {
      const t = h('i.rs-rd-tel', { 'data-m': m });
      const a = i * 2.39996;
      const r = 30 * Math.sqrt((i + 0.5) / 22);
      t.style.left = `${50 + Math.cos(a) * r}%`;
      t.style.top = `${50 + Math.sin(a) * r}%`;
      t.style.setProperty('--r1', RENK[m][0]);
      t.style.setProperty('--r2', RENK[m][1]);
      el.append(t);
    }
  }
  return el;
}

/** Bütün malzemenin görüntüsü: Gemini kesiti, yoksa var olan meyve-sebze resmi, kaşarda sade kalıp */
function malzemeGorsel(m: RendeMalzeme): { el: HTMLElement; oran: number; enCok: number } {
  const y = resim(`yiyecek/${m}-butun`) ?? (m === 'kasar' ? resim('yiyecek/kasar-kalip') : null);
  if (y) return { el: h('img.rs-rd-m-resim', { src: y, alt: '', draggable: 'false' }), oran: 1, enCok: enCokCss(`yiyecek/${m}`, y) };
  if (m !== 'kasar') {
    const b = butunResim(m);
    if (b) return { el: h('img.rs-rd-m-resim', { src: b.url, alt: '', draggable: 'false' }), oran: 1, enCok: enCokCss(b.yol, b.url) };
  }
  return { el: h('i.rs-p5-yt', { 'data-yt': m === 'kasar' ? 'kasar' : m }), oran: 0.62, enCok: 9999 };
}

function rendeleBaslat(b: MiniBaglam, g: MiniGirdi): MiniOturum {
  const yas = g.yas;
  const kok = h('div.rs-p5-oyun.rs-rendele', { 'data-yas': yas });
  const { olaylar, olay } = olayci(kok);
  const miktar: Partial<Record<RendeMalzeme, number>> = {};

  // ------------------------------------------------------------ DOM
  const raf = h('div.rs-p5-raf');
  const rende = h('div.rs-rd-rende', { role: 'button', 'aria-label': 'Rende' }, resimYa('alet/rende', 'rende'));
  const lekeKat = h('div.rs-rd-leke-kat');
  const yiginKat = h('div.rs-rd-yiginlar');
  const malzemeKat = h('div.rs-rd-malzeme-kat');
  const eldeKat = h('div.rs-rd-elde-kat');
  const istekKart = h('div.rs-rd-istek', { hidden: true });
  kok.append(lekeKat, rende, yiginKat, malzemeKat, raf, istekKart, eldeKat);
  b.kok.append(kok);
  const elde = new Elde(eldeKat, kok);

  const rafOgeleri: RafOge<RendeMalzeme>[] = [];
  for (const m of RENDE_MALZEMELER) {
    const gor = malzemeGorsel(m).el;
    const el = rafOge(raf, rafOgeleri, m, h('span.rs-rd-raf-ic', {}, gor), MALZEME_ADI[m]);
    // domates gizli: rafın köşesinden yarısı görünür (yine de 64 px'lik düğme)
    if (m === 'domates') el.classList.add('rs-rd-gizli');
  }

  // 5-6 özel istek: az / çok (lokanta 'adet' isteğiyle verir: sayı ≤ 1 az, ≥ 2 çok; deneme sayfasında &ozel=az|cok)
  const ozel = ((): 'az' | 'cok' | null => {
    const o = g.ozelIstek;
    if (o?.tur === 'adet' && !Array.isArray(o.deger) && 'sayi' in o.deger) return o.deger.sayi <= 1 ? 'az' : 'cok';
    const q = TEST_MODU && yas === 'buyuk' ? new URLSearchParams(location.search).get('ozel') : null;
    return q === 'az' || q === 'cok' ? q : null;
  })();
  if (ozel) {
    istekKart.hidden = false;
    istekKart.dataset.istek = ozel;
    istekKart.append(h('i.rs-rd-istek-yigin'));
  }

  // ------------------------------------------------------------ yerleşim
  let gx = 300;
  let gy = 200;
  let gw = 110;
  let gh = 260;
  /** yığınların taban noktaları (malzeme sırasıyla doldurulur) */
  let yiginYer: { x: number; y: number }[] = [];
  let yatayMi = true;
  function yerlestir() {
    const W = kok.clientWidth;
    const H = kok.clientHeight;
    if (!W || !H) return;
    yatayMi = W >= H;
    kok.dataset.yon = yatayMi ? 'yatay' : 'dikey';
    const rafAlt = rafYerlestir(kok, raf, yatayMi);
    if (yatayMi) {
      gh = Math.min(H - rafAlt - 22, 300);
      gw = gh * 0.42;
      gx = Math.max(W * 0.36, gw / 2 + 150);
      gy = rafAlt + 8 + gh / 2;
      const x0 = gx + gw / 2 + 70;
      const ara = Math.min(96, (W - 130 - x0) / 3);
      yiginYer = [0, 1, 2, 3].map((i) => ({ x: x0 + i * ara, y: gy + gh * 0.12 + (i % 2) * 34 }));
      istekKart.style.left = `${W - 118}px`;
      istekKart.style.top = `${rafAlt + 8}px`;
    } else {
      gh = Math.min((H - rafAlt) * 0.46, W * 1.1);
      gw = gh * 0.42;
      gx = W * 0.5;
      gy = rafAlt + 14 + gh / 2;
      const y0 = gy + gh / 2 + 110;
      yiginYer = [0, 1, 2, 3].map((i) => ({ x: W * 0.3 + (i % 2) * W * 0.4, y: y0 + Math.floor(i / 2) * 96 }));
      istekKart.style.left = `${W - 110}px`;
      istekKart.style.top = `${gy - 30}px`;
    }
    rende.style.cssText = `left:${gx - gw / 2}px;top:${gy - gh / 2}px;width:${gw}px;height:${gh}px`;
    if (uzerinde) {
      olc();
      malzemeKoy();
    }
    yiginlar.forEach((y, i) => {
      const p = yiginYer[i] ?? yiginYer[yiginYer.length - 1];
      y.el.style.left = `${p.x}px`;
      y.el.style.top = `${p.y}px`;
    });
  }
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => yerlestir()) : null;
  ro?.observe(kok);
  const rendede = (x: number, y: number, pay = 0) => Math.abs(x - gx) < gw / 2 + 30 + pay && Math.abs(y - gy) < gh / 2 + 30 + pay;
  /** rendenin dişli yüzeyi (sapı hariç): üst %18 sap */
  const yuzUst = () => gy - gh / 2 + gh * 0.2;
  const yuzAlt = () => gy + gh / 2 - gh * 0.06;

  // ------------------------------------------------------------ yığınlar
  interface Yigin {
    m: RendeMalzeme;
    el: HTMLElement;
    n: number;
  }
  const yiginlar: Yigin[] = [];
  function yiginBul(m: RendeMalzeme): Yigin {
    let y = yiginlar.find((x) => x.m === m);
    if (!y) {
      const el = h('div.rs-rd-yigin', { 'data-m': m });
      const p = yiginYer[yiginlar.length] ?? yiginYer[yiginYer.length - 1];
      el.style.left = `${p.x}px`;
      el.style.top = `${p.y}px`;
      yiginKat.append(el);
      y = { m, el, n: 0 };
      yiginlar.push(y);
    }
    return y;
  }
  const EN_COK_TEL = 140;
  function telEkle(y: Yigin) {
    y.n++;
    if (y.el.childElementCount >= EN_COK_TEL) return;
    const i = y.el.childElementCount;
    // höyük: yarı elips, büyüdükçe genişler ve yükselir; yeni teller üstte
    const rx = 12 + Math.sqrt(i) * 3.6;
    const ry = 5 + Math.sqrt(i) * 4.4;
    const x = (Math.random() * 2 - 1) * rx;
    const tepe = ry * (1 - (x / rx) * (x / rx));
    const t = h(y.m === 'domates' ? 'i.rs-rd-pure' : 'i.rs-rd-tel', { 'data-m': y.m, 'data-yon': i % 3 ? 'y' : 'd' });
    t.style.setProperty('--r1', RENK[y.m][0]);
    t.style.setProperty('--r2', RENK[y.m][1]);
    t.style.transform = `translate(${x}px,${-Math.pow(Math.random(), 0.6) * tepe}px)`;
    y.el.append(t);
  }

  // ------------------------------------------------------------ rendenin üstündeki malzeme
  let uzerinde: { m: RendeMalzeme; kalan: number; el: HTMLElement; ic: HTMLElement; w: number; h: number; y: number } | null = null;
  /** malzemenin rende üstündeki boyu (rende boyu değişince yeniden) */
  function olc() {
    const u = uzerinde;
    if (!u) return;
    const gor = malzemeGorsel(u.m);
    u.w = Math.min(gw * 0.78, gor.enCok);
    u.h = u.w / gor.oran;
  }
  function malzemeKoy() {
    const u = uzerinde;
    if (!u) return;
    const gorunen = Math.max(0.1, u.kalan) * u.h;
    u.el.style.cssText = `left:${gx - u.w / 2}px;top:${u.y - gorunen / 2}px;width:${u.w}px;height:${gorunen}px`;
    u.ic.style.cssText = `width:${u.w}px;height:${u.h}px`;
  }
  function rendeyeKoy(m: RendeMalzeme, kaynak?: { x: number; y: number }) {
    if (uzerinde) {
      if (uzerinde.m === m) return;
      // öteki malzeme rafa döner
      const eski = uzerinde;
      const hedef = merkez(rafOgeleri.find((o) => o.tur === eski.m)!.el, kok);
      const c = merkez(eski.el, kok);
      void ucur(eski.el, hedef.x - c.x, hedef.y - c.y, 260, -30).then(() => eski.el.remove());
      uzerinde = null;
    }
    const ic = h('div.rs-rd-m-ic', {}, malzemeGorsel(m).el);
    const el = h('div.rs-rd-malzeme', { 'data-m': m, role: 'button', 'aria-label': MALZEME_ADI[m] }, ic);
    malzemeKat.append(el);
    uzerinde = { m, kalan: 1, el, ic, w: 0, h: 0, y: yuzUst() + 10 };
    olc();
    malzemeKoy();
    uzerinde.y = yuzUst() + uzerinde.h / 2;
    malzemeKoy();
    if (kaynak) {
      const c = merkez(el, kok);
      try {
        el.animate([{ transform: `translate(${kaynak.x - c.x}px,${kaynak.y - c.y}px) scale(0.6)` }, { transform: 'translate(0,-10px) scale(1.06,0.94)', offset: 0.8 }, { transform: 'none' }], { duration: TEST_MODU ? 30 : 320, easing: 'ease-out' });
      } catch {
        /* yok say */
      }
    }
    b.ses.cal('hop', { perde: 1.1, guc: 0.5 });
    if (!konusuyorMu()) void b.mino.soyle(M.ad[m]);
    if (m === 'domates') void b.mino.tepki('bak', 900);
    olay(`sec-${m}`);
    durumGuncelle();
  }
  for (const o of rafOgeleri) {
    surukle(o.el, kok, {
      basla: (x, y) => {
        elde.al(o.el, x, y, 'rs-rd-elde');
      },
      hareket: (x, y) => elde.tasi(x, y),
      birak: (x, y) => {
        if (rendede(x, y - YUKARI)) {
          elde.birak();
          rendeyeKoy(o.tur, { x, y: y - YUKARI });
        } else elde.birak(o.el);
      },
      dokun: () => {
        elde.birak();
        rendeyeKoy(o.tur, merkez(o.el, kok));
      },
    });
  }

  // ------------------------------------------------------------ sürtme (rendenin her yerinden: malzeme parmağı izler)
  let sonY = 0;
  let yolSes = 0;
  let yolTel = 0;
  let bosDendi = false;
  let fisOldu = false;
  let tutuyor = false;
  rende.addEventListener('pointerdown', (e) => basla(e));
  malzemeKat.addEventListener('pointerdown', (e) => basla(e));
  function basla(e: PointerEvent) {
    e.preventDefault();
    const kr = kok.getBoundingClientRect();
    const y = e.clientY - kr.top;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* yok say */
    }
    tutuyor = true;
    sonY = y;
    if (uzerinde) {
      uzerinde.el.classList.add('rs-tutuluyor');
      ezil(uzerinde.el, 0.5, 120);
      p5Ses.hisir(0.9, uzerinde.m === 'havuc');
    } else {
      p5Ses.metal();
      ezil(rende, 0.3, 120);
    }
  }
  const hareket = (e: PointerEvent) => {
    if (!tutuyor) return;
    const kr = kok.getBoundingClientRect();
    const y = e.clientY - kr.top;
    const dy = y - sonY;
    sonY = y;
    surtme(dy);
  };
  const birak = () => {
    if (!tutuyor) return;
    tutuyor = false;
    uzerinde?.el.classList.remove('rs-tutuluyor');
    durumGuncelle();
  };
  for (const el of [rende, malzemeKat]) {
    el.addEventListener('pointermove', hareket);
    el.addEventListener('pointerup', birak);
    el.addEventListener('pointercancel', birak);
  }
  function surtme(dy: number) {
    const u = uzerinde;
    if (!u) {
      // boş rende: tıkır tıkır
      if ((yolSes += Math.abs(dy)) > 34) {
        yolSes = 0;
        p5Ses.metal();
        if (!bosDendi) {
          bosDendi = true;
          olay('bosRende');
          void b.mino.tepki('zipla', 700);
          if (!konusuyorMu()) void b.mino.soyle(M.bos);
        }
      }
      return;
    }
    // malzeme rende yüzeyinde kalır; sürtme yolu = gerçekten alınan yol
    const yari = (Math.max(0.1, u.kalan) * u.h) / 2;
    const yeniY = Math.max(yuzUst() + yari, Math.min(yuzAlt() - yari, u.y + dy));
    const yol = Math.abs(yeniY - u.y);
    u.y = yeniY;
    if (yol < 0.3) return malzemeKoy();
    const s = surt(u.kalan, yol, gh * 0.74, u.m, yas);
    u.kalan = s.kalan;
    miktar[u.m] = (miktar[u.m] ?? 0) + s.rende;
    malzemeKoy();
    const y = yiginBul(u.m);
    if ((yolTel += yol) > 7) {
      const n = Math.floor(yolTel / 7);
      yolTel -= n * 7;
      for (let i = 0; i < n; i++) telEkle(y);
      if (Math.random() < 0.5) {
        const yp = merkez(y.el, kok);
        sac(kok, gx + gw * 0.42, u.y, 'cekirdek', RENK[u.m][0], 1, { yon: Math.atan2(yp.y - u.y, yp.x - gx), yay: 0.4, guc: 1.4, boy: 6 });
      }
    }
    if ((yolSes += yol) > 16) {
      yolSes = 0;
      p5Ses.hisir(0.85 + Math.min(0.4, yol * 0.03) + Math.random() * 0.1, u.m === 'havuc');
      if (u.m === 'havuc' && Math.random() < 0.3) b.ses.cal('kitir', { guc: 0.4 });
      b.dokunsal(TITRESIM.hafif);
    }
    if (u.m === 'domates' && !fisOldu) domatesFis();
    if (u.kalan <= 0) bitti(u);
    istekKontrol();
    durumGuncelle(false);
  }
  /** Domates rendesi: fışşş! her yer kırmızı, Mino'nun yüzü benekli */
  function domatesFis() {
    fisOldu = true;
    olay('fis');
    p5Ses.fis();
    b.dokunsal(TITRESIM.slap);
    const u = uzerinde!;
    sac(kok, gx, u.y, 'damla', '#E8483A', 22, { guc: 4, boy: 12 });
    const W = kok.clientWidth;
    const H = kok.clientHeight;
    for (let i = 0; i < 6; i++) leke(lekeKat, gx + (Math.random() - 0.5) * W * 0.6, u.y + (Math.random() - 0.5) * H * 0.5, '#E8483A', 26 + Math.random() * 30);
    window.setTimeout(
      () => {
        if (kapandi) return;
        minoYuzune(kok, b.mino, 'domates', 3600);
        void b.mino.tepki('sasir', 700).then(() => {
          if (kapandi) return;
          void b.mino.tepki('sevin', 1400);
          void b.mino.soyle(M.fis);
        });
      },
      TEST_MODU ? 10 : 220,
    );
  }
  function bitti(u: NonNullable<typeof uzerinde>) {
    uzerinde = null;
    u.el.remove();
    const y = yiginBul(u.m);
    const p = merkez(y.el, kok);
    yiginPof(y);
    b.tepsi.hopla();
    void b.mino.tepki('sevin', 1000);
    if (!konusuyorMu()) void b.mino.soyle(olaylar.includes('malzemeBitti') ? M.kar : M.bitti);
    olay('malzemeBitti');
    parilti(kok, p.x, p.y - 20, 5, 34);
  }
  /** Yığın tepeden bir kez kar gibi "pof" eder */
  function yiginPof(y: Yigin) {
    const p = merkez(y.el, kok);
    const tepe = p.y - (6 + Math.sqrt(Math.min(y.n, EN_COK_TEL)) * 4.2);
    b.ses.cal('pof', { perde: 1.2 });
    hopla(y.el, 6, 300);
    sac(kok, p.x, tepe, 'un', RENK[y.m][0], 9, { yon: -Math.PI / 2, yay: 2.2, guc: 0.9, boy: 7 });
    olay('pof');
  }

  // ------------------------------------------------------------ özel istek, ipucu
  const toplamRende = () => Object.entries(miktar).reduce((a, [m, x]) => a + (m === 'domates' ? 0 : (x ?? 0)), 0);
  let istekDendi = false;
  function istekKontrol() {
    if (!ozel) return;
    const t = istekTuttu(toplamRende(), ozel);
    istekKart.classList.toggle('rs-tuttu', t);
    if (t && !istekDendi) {
      istekDendi = true;
      b.ses.cal('ting', { perde: 1.1 });
      const m = merkez(istekKart, kok);
      parilti(kok, m.x, m.y, 5, 30);
      if (!konusuyorMu()) void b.mino.soyle(ozel === 'az' ? M.az : M.cok);
    }
    if (!t) istekDendi = false;
  }
  function durumGuncelle(ipucuDa = true) {
    kok.dataset.durum = JSON.stringify(ozet());
    if (ipucuDa) ipucuGuncelle();
  }
  function ipucuGuncelle() {
    if (odulde) return b.ipucu.hedef(null);
    if (uzerinde) return b.ipucu.hedef({ el: () => uzerinde?.el ?? null, soz: M.ipucu.surt, hareket: 'kaydir-dik' });
    if (!yiginlar.length) return b.ipucu.hedef({ el: () => rafOgeleri[0].el, soz: M.ipucu.bos, hareket: 'surukle', nereye: () => rende });
    b.ipucu.hedef({ el: () => b.tepsi.el, soz: M.ipucu.bitti, hareket: 'dokun' });
  }

  // ------------------------------------------------------------ ürün, ödül anı
  function urunYap(): Urun | null {
    const var_ = (Object.entries(miktar) as [RendeMalzeme, number][]).filter(([, x]) => x > 0.01);
    if (!var_.length) return null;
    const malzemeler: YemekOzelligi['malzemeler'] = {};
    for (const [m, x] of var_) malzemeler[m] = { adet: rendeAdet(x), rende: true, kesim: m === 'domates' ? 'pure' : 'ince' };
    const toplam = var_.reduce((a, [, x]) => a + x, 0);
    const ozellik: YemekOzelligi = { malzemeler, porsiyon: rendePorsiyon(toplam), sicak: false };
    if (miktar.elma) ozellik.tatli = 1;
    const kopya = { ...miktar };
    return { id: urunId('rende'), tur: 'rende', yemek: g.tarif, ozellik, gorsel: () => rendeKase(kopya), rende: kopya } as Urun & { rende: Partial<Record<RendeMalzeme, number>> };
  }
  let odulde = false;
  let kapandi = false;
  let coz: (u: Urun[]) => void = () => undefined;
  const bittiSoz = new Promise<Urun[]>((r) => (coz = r));
  b.tepsi.dinle(() => {
    if (odulde) return;
    const u = urunYap();
    if (!u) return coz([]);
    odulde = true;
    b.ipucu.hedef(null);
    olay('odul');
    for (const y of yiginlar) yiginPof(y);
    b.ses.cal('ting');
    window.setTimeout(
      () => {
        const t = merkez(b.tepsi.el, kok);
        const ucanlar = yiginlar.map((y) => {
          const p = merkez(y.el, kok);
          return ucur(y.el, t.x - p.x, t.y - p.y, 400, -40);
        });
        if (uzerinde) uzerinde.el.remove();
        void Promise.all(ucanlar).then(() => coz([u]));
      },
      TEST_MODU ? 20 : 700,
    );
  });

  function ozet() {
    return { miktar: Object.fromEntries(Object.entries(miktar).map(([k, v]) => [k, +(v ?? 0).toFixed(3)])), uzerinde: uzerinde ? { m: uzerinde.m, kalan: +uzerinde.kalan.toFixed(3) } : null, yigin: yiginlar.map((y) => ({ m: y.m, n: y.n, boy: yiginBoyu(miktar[y.m] ?? 0) })) };
  }
  (window as unknown as { __rsRendele?: unknown }).__rsRendele = {
    olaylar,
    durum: ozet,
    merkez: () => ({ gx, gy, gw, gh, ust: yuzUst(), alt: yuzAlt() }),
  };
  yerlestir();
  durumGuncelle();

  return {
    bitti: bittiSoz,
    kapat() {
      kapandi = true;
      ro?.disconnect();
      kok.remove();
    },
  };
}
