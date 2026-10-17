/**
 * BULAŞIK (lavabo) · ekip/senaryo/RESTORAN.md §8 M15, §3a/10 (zorunlu değil; ritmi sakin, yoğun günün nefesi).
 *
 * Kino'nun topladığı kirli tabaklar lavabonun yanında yığın olur (lokanta verir: MiniGirdi.kirliTabaklar).
 *   - Üstteki tabak leğene kayar. Lekeler o tabakta yenen yemekten (salata yeşil-kırmızı, çorba turuncu halka ...).
 *   - SÜNGER: tabağın üstünde gezdir (daire çizerek ov): köpük çıkar, lekeler söner (3-4: iki tur, 5-6 daha çok;
 *     5-6'da kenarda küçük gizli bir leke de var). 3-4 dokunuş yolu: süngere dokununca en kirli lekeyi kendisi ovar.
 *   - DETERJAN: sıkınca köpük ve ovma hızlanır; dördüncü sıkışta KÖPÜK DAĞI (komik): bir balon Mino'nun burnuna
 *     konar, hapşırır.
 *   - Köpüklü tabağı musluğun altına götür (ya da musluğa / tabağa dokun): şırıl şırıl, köpük akar, gıcır gıcır parlar.
 *   - Temiz tabak rafa (dokun ya da götür): "tın", sıradaki kirli tabak yığından leğene kayar.
 *   - GİZLİ (§9): köpük balonları uçuşur, dokununca "pıt" diye patlar; en büyüğüne dokununca içinde Lokum'un yüzü
 *     belirir ve kıkırdar.
 *   - Ödül: raftaki tabaklar sırayla parlar ("tın tın tın"), Babaanne'nin bahşiş jetonu rafa düşer (lokanta kasaya
 *     ekler). Ürün: 'bulasik' (yemek değil; lokanta yığından düşer, bahşişi kasaya koyar).
 */
import { konusuyorMu } from '../../../../src/audio/ses';
import { h, TEST_MODU } from '../../../../src/ui/dom';
import metin from '../../../../content/restoran/mini-bulasik.json';
import { urunId, type MiniBaglam, type MiniGirdi, type MiniOturum, type MiniOyun, type Urun } from '../arayuz';
import { ezil, hopla, kipirda, parilti, sac, TITRESIM, ucur } from '../dogra/efekt';
import { surukle } from '../dogra/surukle';
import { merkez, olayci, YUKARI } from '../kir-cirp/ortak';
import { kafaEl, p6Ses } from '../yogur/ortak';
import { bitti as hepsiBitti, deterjanSik, durula, enKirli, kirliTabak, ov, type Tabak } from './mantik';
import './bulasik.css';

const M = metin.mino;

export const oyun: MiniOyun = {
  ad: 'bulasik',
  istasyon: 'lavabo',
  simge: () => h('span.rs-bl-simge', {}, h('i.rs-bl-simge-tabak'), h('i.rs-bl-simge-sunger')),
  baslat: (b, g) => bulasikBaslat(b, g),
};

/** Raf ve tabak küçük görünüşü (deneme sayfası sonucu) */
function rafGorsel(n: number): HTMLElement {
  const el = h('span.rs-bl-raf-gorsel');
  for (let i = 0; i < Math.min(6, n); i++) el.append(h('i', { style: `left:${12 + i * 13}%` }));
  return el;
}

function bulasikBaslat(b: MiniBaglam, g: MiniGirdi): MiniOturum {
  const yas = g.yas;
  const kok = h('div.rs-p5-oyun.rs-bulasik', { 'data-yas': yas });
  const { olaylar, olay } = olayci(kok);
  let kapandi = false;
  const zamanlar: number[] = [];
  const zaman = (f: () => void, ms: number) => zamanlar.push(window.setTimeout(f, TEST_MODU ? Math.min(ms, 30) : ms));
  const turler = (g.kirliTabaklar?.length ? g.kirliTabaklar : ['tabak', 'corba', 'kofte']).slice(0, 6);
  const tabaklar: Tabak[] = turler.map((t, i) => kirliTabak(t, yas, 7 + i * 13 + turler.length));

  // ------------------------------------------------------------ DOM
  const legen = h('div.rs-bl-legen', {}, h('i.rs-bl-legen-ic'), h('i.rs-bl-su'), h('i.rs-bl-su-kopuk'));
  const musluk = h('div.rs-bl-musluk', { role: 'button', 'aria-label': 'Musluk' }, h('i.rs-bl-musluk-boru'), h('i.rs-bl-musluk-agiz'), h('i.rs-bl-musluk-kol.rs-sol'), h('i.rs-bl-musluk-kol.rs-sag'));
  const akis = h('i.rs-bl-akis', { hidden: true });
  const yigin = h('div.rs-bl-yigin');
  const raf = h('div.rs-bl-raf', {}, h('i.rs-bl-raf-taban'), ...Array.from({ length: 7 }, (_, i) => h('i.rs-bl-raf-cubuk', { style: `--i:${i}` })));
  const rafTabak = h('div.rs-bl-raf-tabaklar');
  raf.append(rafTabak);
  const tabakKat = h('div.rs-bl-tabak-kat');
  const sunger = h('div.rs-bl-sunger', { role: 'button', 'aria-label': 'Sünger' }, h('i.rs-bl-sunger-sari'), h('i.rs-bl-sunger-yesil'));
  const deterjan = h('div.rs-bl-deterjan', { role: 'button', 'aria-label': 'Deterjan' }, h('i.rs-bl-deterjan-sise'), h('i.rs-bl-deterjan-kapak'));
  const balonKat = h('div.rs-bl-balonlar');
  const efektKat = h('div.rs-bl-efekt');
  kok.append(yigin, legen, akis, musluk, raf, tabakKat, deterjan, sunger, balonKat, efektKat);
  b.kok.append(kok);

  // ------------------------------------------------------------ yerleşim
  let L = { x: 0, y: 0, w: 0, h: 0 };
  let tc = { x: 0, y: 0 };
  let tR = 100;
  let rafR = { x: 0, y: 0, w: 0, h: 0 };
  let yiginYer = { x: 0, y: 0 };
  let sungerYer = { x: 0, y: 0 };
  let deterjanYer = { x: 0, y: 0 };
  let muslukYer = { x: 0, y: 0 };
  let sungerTutuluyor = false;
  function yerlestir() {
    const W = kok.clientWidth;
    const H = kok.clientHeight;
    if (!W || !H) return;
    const yatay = W >= H;
    kok.dataset.yon = yatay ? 'yatay' : 'dikey';
    if (yatay) {
      const solBos = Math.max(150, W * 0.19);
      const sagBos = Math.max(170, W * 0.22);
      L = { x: solBos, y: 54, w: W - solBos - sagBos, h: H - 54 - 14 };
      yiginYer = { x: solBos / 2 + 22, y: 140 };
      rafR = { x: W - sagBos + 14, y: 22, w: sagBos - 30, h: Math.min(H * 0.48, 190) };
      sungerYer = { x: solBos * 0.62 + 10, y: H * 0.62 };
      deterjanYer = { x: W - sagBos / 2, y: rafR.y + rafR.h + 46 };
    } else {
      L = { x: 14, y: 196, w: W - 28, h: Math.min(W * 1.02, H * 0.46) };
      yiginYer = { x: W * 0.27, y: 112 };
      rafR = { x: W * 0.52, y: 30, w: W * 0.44, h: 150 };
      sungerYer = { x: W * 0.3, y: L.y + L.h + 70 };
      deterjanYer = { x: W * 0.62, y: L.y + L.h + 70 };
    }
    tR = Math.max(70, Math.min(L.w * 0.3, L.h * 0.38));
    tc = { x: L.x + L.w / 2, y: L.y + L.h * 0.56 };
    muslukYer = { x: L.x + L.w / 2, y: L.y };
    legen.style.cssText = `left:${L.x}px;top:${L.y}px;width:${L.w}px;height:${L.h}px`;
    musluk.style.cssText = `left:${muslukYer.x - 46}px;top:${muslukYer.y - 30}px`;
    akis.style.cssText = `left:${tc.x - 18}px;top:${muslukYer.y + 26}px;height:${tc.y - muslukYer.y - 26}px`;
    raf.style.cssText = `left:${rafR.x}px;top:${rafR.y}px;width:${rafR.w}px;height:${rafR.h}px`;
    yigin.style.cssText = `left:${yiginYer.x - tR * 0.62}px;top:${yiginYer.y - tR * 0.62}px;width:${tR * 1.24}px;height:${tR * 1.24}px`;
    if (!sungerTutuluyor) sungerKoy(sungerYer.x, sungerYer.y);
    deterjan.style.transform = `translate(${deterjanYer.x}px,${deterjanYer.y}px)`;
    yiginCiz();
    if (aktif) tabakYerlestir(aktif);
    rafCiz();
  }
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => yerlestir()) : null;
  ro?.observe(kok);
  const sungerKoy = (x: number, y: number) => (sunger.style.transform = `translate(${x}px,${y}px)`);

  // ------------------------------------------------------------ tabak çizimi
  interface TabakEl {
    t: Tabak;
    el: HTMLElement;
    lekeEl: HTMLElement[];
    kopukKat: HTMLElement;
  }
  function tabakEl(t: Tabak): TabakEl {
    const lekeKat = h('div.rs-bl-lekeler');
    const lekeEl = t.lekeler.map((l, k) => {
      // leke: bir ana bulaş + iki küçük sıçrantı (yemek artığı)
      const e = h('i.rs-bl-leke', { 'data-gizli': l.gizli ? '1' : '' }, h('b', { style: `left:${18 + ((k * 37) % 50)}%;top:${-20 + ((k * 23) % 30)}%` }), h('b', { style: `left:${70 - ((k * 29) % 40)}%;top:${78 + ((k * 17) % 22)}%` }));
      e.style.cssText = `left:${50 + l.u * 50}%;top:${50 + l.v * 50}%;width:${l.r * 100}%;height:${l.r * 86}%;--renk:${l.renk};opacity:${l.kir}`;
      lekeKat.append(e);
      return e;
    });
    const kopukKat = h('div.rs-bl-kopukler');
    const el = h('div.rs-bl-tabak', { role: 'button', 'aria-label': 'Tabak', 'data-durum': t.durum }, h('i.rs-bl-tabak-zemin'), lekeKat, kopukKat, h('i.rs-bl-tabak-parilti'));
    return { t, el, lekeEl, kopukKat };
  }
  let aktif: TabakEl | null = null;
  const yigindakiler = () => tabaklar.filter((t) => t.durum === 'kirli' && t !== aktif?.t);
  function yiginCiz() {
    yigin.replaceChildren();
    const kalan = yigindakiler();
    kalan.slice(0, 5).forEach((t, i) => {
      const e = h('i.rs-bl-yigin-tabak', { style: `--i:${i}` });
      if (i === kalan.slice(0, 5).length - 1) {
        // en üstteki tabağın lekeleri görünür
        for (const l of t.lekeler.filter((x) => !x.gizli)) e.append(h('b', { style: `left:${50 + l.u * 50}%;top:${50 + l.v * 50}%;width:${l.r * 100}%;height:${l.r * 86}%;background:${l.renk}` }));
      }
      yigin.append(e);
    });
    yigin.dataset.adet = String(kalan.length);
  }
  function tabakYerlestir(te: TabakEl) {
    te.el.style.cssText = `left:${tc.x - tR}px;top:${tc.y - tR}px;width:${tR * 2}px;height:${tR * 2}px`;
  }
  function lekeCiz(te: TabakEl) {
    te.t.lekeler.forEach((l, i) => (te.lekeEl[i].style.opacity = String(Math.max(0, l.kir))));
    te.el.dataset.durum = te.t.durum;
  }
  /** Sıradaki kirli tabak yığından leğene kayar */
  function siradaki() {
    const t = yigindakiler()[0];
    if (!t) {
      aktif = null;
      return;
    }
    const te = tabakEl(t);
    aktif = te;
    tabakKat.append(te.el);
    tabakYerlestir(te);
    tabakBagla(te);
    yiginCiz();
    try {
      te.el.animate([{ transform: `translate(${yiginYer.x - tc.x}px,${yiginYer.y - tc.y}px) scale(0.62)` }, { transform: 'translate(0,-16px) scale(1.04,0.96)', offset: 0.75 }, { transform: 'none' }], { duration: TEST_MODU ? 30 : 460, easing: 'cubic-bezier(.3,.6,.4,1)' });
    } catch {
      /* yok say */
    }
    zaman(() => {
      b.ses.cal('slap', { guc: 0.35, perde: 1.4 });
      sac(kok, tc.x, tc.y + tR * 0.9, 'damla', '#9fd8f2', 5, { yon: -Math.PI / 2, yay: 2.2, guc: 0.8, boy: 8 });
    }, 380);
    olay('tabakGeldi');
    durumGuncelle();
  }

  // ------------------------------------------------------------ sünger: ov
  let ovYol = 0;
  let kopukYol = 0;
  let sonS = { x: 0, y: 0 };
  function kopukEkle(te: TabakEl, x: number, y: number, n = 1) {
    if (te.kopukKat.childElementCount > 46) return;
    for (let i = 0; i < n; i++) {
      const e = h('i.rs-bl-kopuk');
      const u = ((x - tc.x) / tR) * 50 + 50 + (Math.random() - 0.5) * 10;
      const v = ((y - tc.y) / tR) * 50 + 50 + (Math.random() - 0.5) * 10;
      const s = 7 + Math.random() * 9;
      e.style.cssText = `left:${u}%;top:${v}%;width:${s}%;height:${s}%`;
      te.kopukKat.append(e);
    }
  }
  function ovma(x: number, y: number, yol: number) {
    const te = aktif;
    if (!te || te.t.durum !== 'kirli') return;
    const u = (x - tc.x) / tR;
    const v = (y - tc.y) / tR;
    if (Math.hypot(u, v) > 1.05) return;
    const biten = ov(te.t, u, v, yol / tR, yas);
    lekeCiz(te);
    if ((kopukYol += yol) > 16) {
      kopukYol = 0;
      kopukEkle(te, x, y);
    }
    if ((ovYol += yol) > 36) {
      ovYol = 0;
      p6Ses.sik(0.9 + Math.random() * 0.25);
      b.dokunsal(TITRESIM.hafif);
    }
    for (const l of biten) {
      olay(l.gizli ? 'gizliLeke' : 'lekeBitti');
      b.ses.cal('kopuk', { guc: 0.6 });
    }
    if ((te.t.durum as string) === 'kopuklu') kopuklendi(te);
  }
  function kopuklendi(te: TabakEl) {
    te.el.dataset.durum = 'kopuklu';
    for (let i = 0; i < 10; i++) kopukEkle(te, tc.x + (Math.random() - 0.5) * tR * 1.2, tc.y + (Math.random() - 0.5) * tR * 1.2);
    b.ses.cal('kopuk');
    olay('kopuklu');
    if (!olaylar.slice(0, -1).includes('kopuklu') && !konusuyorMu()) void b.mino.soyle(M.kopuk);
    durumGuncelle();
  }
  surukle(sunger, kok, {
    basla: (x, y) => {
      sungerTutuluyor = true;
      sunger.classList.add('rs-tutuluyor');
      sungerKoy(x, y - YUKARI);
      sonS = { x, y: y - YUKARI };
      p6Ses.sik(1.1);
    },
    hareket: (x, y) => {
      const p = { x, y: y - YUKARI };
      sungerKoy(p.x, p.y);
      ovma(p.x, p.y, Math.hypot(p.x - sonS.x, p.y - sonS.y));
      sonS = p;
    },
    birak: () => {
      sungerTutuluyor = false;
      sunger.classList.remove('rs-tutuluyor');
      sungerKoy(sungerYer.x, sungerYer.y);
      durumGuncelle();
    },
    dokun: () => {
      // dokununca sünger en kirli lekeyi kendisi ovar (3-4 yolu; 5-6'da da çalışır)
      const te = aktif;
      const l = te && te.t.durum === 'kirli' ? enKirli(te.t) : undefined;
      if (!te || !l) {
        kipirda(sunger, 4);
        p6Ses.sik(1.2);
        sungerTutuluyor = false;
        return;
      }
      sungerTutuluyor = true;
      sunger.classList.add('rs-tutuluyor');
      const lx = tc.x + l.u * tR;
      const ly = tc.y + l.v * tR;
      const adim = TEST_MODU ? 8 : 26;
      let i = 0;
      let son = { x: lx + 18, y: ly };
      const z = window.setInterval(() => {
        const a = (i / 9) * Math.PI * 2;
        const p = { x: lx + Math.cos(a) * 18, y: ly + Math.sin(a) * 18 };
        sungerKoy(p.x, p.y);
        ovma(p.x, p.y, TEST_MODU ? 200 : Math.hypot(p.x - son.x, p.y - son.y) * 1.25);
        son = p;
        if (++i > adim || l.kir <= 0) {
          clearInterval(z);
          if (l.kir > 0 && te.t.durum === 'kirli') {
            l.kir = 0;
            if (te.t.lekeler.every((x) => x.kir <= 0)) te.t.durum = 'kopuklu';
            lekeCiz(te);
            if (te.t.durum === 'kopuklu') kopuklendi(te);
          }
          sungerTutuluyor = false;
          sunger.classList.remove('rs-tutuluyor');
          sungerKoy(sungerYer.x, sungerYer.y);
          durumGuncelle();
        }
      }, 45);
      zamanlar.push(z);
    },
  });

  // ------------------------------------------------------------ deterjan
  function deterjanBas() {
    const te = aktif;
    b.ses.cal('kopuk');
    p6Ses.pit(0.7);
    ezil(deterjan, 1.4);
    b.dokunsal(TITRESIM.hafif);
    if (!te) return;
    const { dag } = deterjanSik(te.t);
    // tabağa yeşil bir damla deterjan, köpük kabarır
    const d = h('i.rs-bl-deterjan-damla');
    const u = 40 + Math.random() * 20;
    const v = 40 + Math.random() * 20;
    d.style.cssText = `left:${u}%;top:${v}%`;
    te.kopukKat.append(d);
    kopukEkle(te, tc.x + (u - 50) * tR * 0.02, tc.y + (v - 50) * tR * 0.02, 3);
    sac(kok, tc.x, tc.y, 'kopuk', '#ffffff', 5, { yon: -Math.PI / 2, yay: 2.4, guc: 0.8, boy: 16 });
    olay('deterjan');
    if (dag) kopukDagi();
    durumGuncelle();
  }
  surukle(deterjan, kok, {
    basla: () => {
      deterjan.classList.add('rs-tutuluyor');
    },
    birak: (x, y) => {
      deterjan.classList.remove('rs-tutuluyor');
      deterjan.style.transform = `translate(${deterjanYer.x}px,${deterjanYer.y}px)`;
      if (Math.hypot(x - tc.x, y - YUKARI - tc.y) < tR * 1.2) deterjanBas();
    },
    hareket: (x, y) => (deterjan.style.transform = `translate(${x}px,${y - YUKARI}px)`),
    dokun: () => {
      deterjan.classList.remove('rs-tutuluyor');
      deterjanBas();
    },
  });
  /** Komik: köpük dağı leğeni kaplar, bir balon Mino'nun burnuna konar, Mino hapşırır */
  function kopukDagi() {
    olay('kopukDagi');
    const dag = h('div.rs-bl-dag', {}, ...Array.from({ length: 14 }, (_, i) => h('i', { style: `left:${(i * 37) % 72}%;top:${8 + ((i * 23) % 58)}%;width:${26 + ((i * 13) % 16)}%;height:${30 + ((i * 11) % 16)}%` })));
    dag.style.cssText = `left:${L.x + L.w * 0.08}px;top:${L.y + L.h * 0.06}px;width:${L.w * 0.84}px;height:${L.h * 0.9}px`;
    efektKat.append(dag);
    try {
      dag.animate([{ transform: 'translateY(30%) scale(0.4)', opacity: 0 }, { transform: 'translateY(-4%) scale(1.06)', opacity: 1, offset: 0.6 }, { transform: 'none', opacity: 1 }], { duration: TEST_MODU ? 30 : 700, easing: 'cubic-bezier(.3,.7,.4,1.2)' });
    } catch {
      /* yok say */
    }
    void b.mino.tepki('sasir', 900);
    if (!konusuyorMu()) void b.mino.soyle(M.dag);
    // bir balon Mino'nun burnuna
    zaman(() => {
      if (kapandi) return;
      const m = merkez(b.mino.el, kok);
      const bal = h('i.rs-bl-balon.rs-burun');
      const bs = Math.max(26, m.w * 0.24);
      bal.style.cssText = `left:${m.x - bs / 2}px;top:${m.y - m.h * 0.12 - bs / 2}px;width:${bs}px;height:${bs}px`;
      efektKat.append(bal);
      try {
        bal.animate([{ transform: `translate(${tc.x - m.x}px,${tc.y - m.y}px) scale(0.5)` }, { transform: 'none' }], { duration: TEST_MODU ? 30 : 900, easing: 'ease-in-out' });
      } catch {
        /* yok say */
      }
      zaman(() => {
        bal.remove();
        p6Ses.pit(1.3);
        void b.mino.tepki('hapsir', 1200);
        void b.mino.soyle(M.hapsu);
        olay('hapsu');
        const mm = merkez(b.mino.el, kok);
        sac(kok, mm.x, mm.y - mm.h * 0.1, 'kopuk', '#fff', 6, { guc: 1, boy: 12 });
      }, 1200);
    }, 600);
    // dağ yavaşça söner
    zaman(() => {
      try {
        void dag.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(10%) scale(0.9)' }], { duration: TEST_MODU ? 30 : 900, fill: 'forwards' }).finished.then(
          () => dag.remove(),
          () => dag.remove(),
        );
      } catch {
        dag.remove();
      }
    }, 3800);
  }

  // ------------------------------------------------------------ musluk: durula; raf
  let akiyor = false;
  let siril: { guc(g: number): void; dur(): void } | null = null;
  function suAc(ms = 1300): Promise<void> {
    return new Promise((r) => {
      if (akiyor) return r();
      akiyor = true;
      akis.hidden = false;
      musluk.classList.add('rs-acik');
      siril = b.ses.dongu('siril');
      siril.guc(0.8);
      zaman(() => {
        akiyor = false;
        akis.hidden = true;
        musluk.classList.remove('rs-acik');
        siril?.dur();
        siril = null;
        r();
      }, ms);
    });
  }
  async function durulaOyna(te: TabakEl) {
    if (te.t.durum === 'temiz' || te.t.durum === 'rafta') return rafaKoy(te);
    tabakYerlestir(te);
    const sonuc = durula(te.t);
    olay(sonuc === 'temiz' ? 'durula' : 'durulaKirli');
    await suAc(sonuc === 'temiz' ? 1300 : 800);
    if (kapandi) return;
    if (sonuc === 'temiz') {
      // köpük aşağı akar, tabak parlar
      for (const k of [...te.kopukKat.children] as HTMLElement[]) {
        try {
          k.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(40px)' }], { duration: TEST_MODU ? 20 : 500, fill: 'forwards', delay: Math.random() * 200 });
        } catch {
          /* yok say */
        }
      }
      zaman(() => te.kopukKat.replaceChildren(), 700);
      te.el.dataset.durum = 'temiz';
      p6Ses.gicir();
      b.ses.cal('ting');
      parilti(kok, tc.x + tR * 0.3, tc.y - tR * 0.3, 5, tR * 0.5);
      if (!olaylar.includes('piril') && !konusuyorMu()) void b.mino.soyle(M.piril);
      olay('piril');
    } else {
      lekeCiz(te);
      kipirda(te.el, 5);
      if (!konusuyorMu()) void b.mino.soyle(M.hala);
    }
    durumGuncelle();
  }
  musluk.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    ezil(musluk, 1);
    p6Ses.tink(0.8);
    if (aktif && aktif.t.durum !== 'temiz') void durulaOyna(aktif);
    else void suAc(700);
  });
  let rafSirasi = 0;
  const raftakiler: { el: HTMLElement; i: number }[] = [];
  function rafCiz() {
    for (const r of raftakiler) r.el.style.cssText = rafYeri(r.i);
  }
  const rafYeri = (i: number) => {
    const w = rafR.w / 7;
    return `left:${rafR.x + w * (i + 0.6)}px;top:${rafR.y + rafR.h * 0.06}px;width:${w * 0.86}px;height:${rafR.h * 0.8}px`;
  };
  function rafaKoy(te: TabakEl) {
    if (te.t.durum !== 'temiz') return;
    te.t.durum = 'rafta';
    const i = rafSirasi++;
    const kenar = h('i.rs-bl-raftaki', { 'data-tur': te.t.tur });
    efektKat.append(kenar);
    kenar.style.cssText = rafYeri(i);
    raftakiler.push({ el: kenar, i });
    const r = kenar.getBoundingClientRect();
    const k = kok.getBoundingClientRect();
    void ucur(te.el, r.left - k.left + r.width / 2 - tc.x, r.top - k.top + r.height / 2 - tc.y, 380, -60).then(() => te.el.remove());
    kenar.style.visibility = 'hidden';
    zaman(() => {
      kenar.style.visibility = '';
      hopla(kenar, 6, 240);
      p6Ses.tin(i);
      b.dokunsal(TITRESIM.hafif);
    }, 380);
    olay('rafta');
    aktif = null;
    zaman(() => {
      if (!kapandi) siradaki();
    }, 520);
    durumGuncelle();
  }
  function tabakBagla(te: TabakEl) {
    surukle(te.el, kok, {
      basla: () => {
        if (odulde) return false;
        te.el.classList.add('rs-tutuluyor');
        b.ses.cal('tik', { guc: 0.4 });
      },
      hareket: (x, y) => {
        te.el.style.left = `${x - tR}px`;
        te.el.style.top = `${y - YUKARI - tR}px`;
      },
      birak: (x, y) => {
        te.el.classList.remove('rs-tutuluyor');
        const p = { x, y: y - YUKARI };
        const muslukta = Math.hypot(p.x - muslukYer.x, p.y - (muslukYer.y + tR * 0.5)) < tR * 0.9;
        const rafta = p.x > rafR.x - 20 && p.x < rafR.x + rafR.w + 20 && p.y > rafR.y - 20 && p.y < rafR.y + rafR.h + 30;
        if (rafta && te.t.durum === 'temiz') return rafaKoy(te);
        tabakYerlestir(te);
        if (muslukta) void durulaOyna(te);
      },
      dokun: () => {
        te.el.classList.remove('rs-tutuluyor');
        if (te.t.durum === 'temiz') return rafaKoy(te);
        if (te.t.durum === 'kopuklu') return void durulaOyna(te);
        // kirli tabağa dokunmak: tabak "tık" der
        kipirda(te.el, 3);
        b.ses.cal('tik');
      },
    });
  }

  // ------------------------------------------------------------ köpük balonları (gizli: en büyüğünde Lokum)
  let balonSay = 0;
  let lokumGosterildi = false;
  const buyukZaman = performance.now() + (TEST_MODU ? 400 : 7000);
  const balonUret = window.setInterval(
    () => {
      if (kapandi || odulde) return;
      const buyuk = !lokumGosterildi && performance.now() > buyukZaman && !balonKat.querySelector('.rs-buyuk');
      if (balonKat.childElementCount > 5 && !buyuk) return;
      balonCikar(buyuk);
    },
    TEST_MODU ? 200 : 1500,
  );
  function balonCikar(buyuk: boolean) {
    balonSay++;
    const s = buyuk ? Math.max(84, tR * 0.9) : 26 + Math.random() * 26;
    const x0 = L.x + L.w * (0.2 + Math.random() * 0.6);
    const y0 = L.y + L.h * 0.8;
    const bal = h(`button.rs-bl-balon${buyuk ? '.rs-buyuk' : ''}`, { type: 'button', 'aria-label': 'Köpük' });
    bal.style.cssText = `left:${x0 - s / 2}px;top:${y0 - s / 2}px;width:${Math.max(64, s)}px;height:${Math.max(64, s)}px;--s:${s}px`;
    balonKat.append(bal);
    const dx = (Math.random() - 0.5) * 120;
    const dy = -(y0 + s + 20);
    const sure = buyuk ? 9000 : 5200 + Math.random() * 2000;
    const an = bal.animate(
      [
        { transform: 'translate(0,0) scale(0.3)', opacity: 0 },
        { transform: `translate(${dx * 0.2}px,${dy * 0.12}px) scale(1)`, opacity: 1, offset: 0.1 },
        { transform: `translate(${dx * 0.6}px,${dy * 0.55}px) scale(1.02,0.98)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${dx}px,${dy}px) scale(1)`, opacity: 0.9 },
      ],
      { duration: TEST_MODU ? Math.max(sure / 4, 1500) : sure, easing: 'ease-in-out', fill: 'forwards' },
    );
    an.finished.then(
      () => bal.remove(),
      () => undefined,
    );
    bal.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const r = bal.getBoundingClientRect();
      const k = kok.getBoundingClientRect();
      const cx = r.left - k.left + r.width / 2;
      const cy = r.top - k.top + r.height / 2;
      an.pause();
      if (buyuk) return lokumBalon(bal, an, cx, cy, s);
      an.cancel();
      bal.remove();
      p6Ses.pit(0.9 + Math.random() * 0.4);
      sac(kok, cx, cy, 'kopuk', '#ffffff', 5, { guc: 0.6, boy: 7 });
      olay('pit');
    });
  }
  /** Gizli sürpriz: en büyük balonun içinde Lokum'un yüzü belirir, kıkırdar, sonra balon patlar */
  function lokumBalon(bal: HTMLElement, an: Animation, cx: number, cy: number, s: number) {
    lokumGosterildi = true;
    olay('lokumBalon');
    const kafa = kafaEl('lokum');
    kafa.yuz('mutlu', 'kahkaha');
    const kap = h('div.rs-bl-lokum', {}, kafa.el);
    const w = Math.min(s * 0.8, kafa.kaynakEn / 3);
    kap.style.cssText = `left:${cx - w / 2}px;top:${cy - (w / kafa.oran) / 2}px;width:${w}px;height:${w / kafa.oran}px`;
    efektKat.append(kap);
    bal.classList.add('rs-icinde');
    p6Ses.kikir();
    hopla(kap, 8, 300);
    zaman(() => {
      kafa.yuz('kapali', 'kahkaha');
      p6Ses.kikir();
    }, 700);
    zaman(() => {
      an.cancel();
      bal.remove();
      kap.remove();
      p6Ses.pit(0.7);
      sac(kok, cx, cy, 'kopuk', '#ffffff', 8, { guc: 1, boy: 10 });
      olay('lokumPatladi');
    }, 1900);
  }

  // ------------------------------------------------------------ doğal son, ipucu
  let hoplandi = false;
  function durumGuncelle() {
    if (!hoplandi && hepsiBitti(tabaklar)) {
      hoplandi = true;
      b.tepsi.hopla();
      olay('dogalSon');
      void b.mino.tepki('sevin', 1200);
      if (!konusuyorMu()) void b.mino.soyle(M.bitti);
    }
    kok.dataset.durum = JSON.stringify(ozet());
    ipucuGuncelle();
  }
  let sonIpucu = '';
  function ipucuGuncelle() {
    let anahtar = 'yok';
    let hedef: Parameters<typeof b.ipucu.hedef>[0] = null;
    const te = aktif;
    if (odulde) anahtar = 'odul';
    else if (te?.t.durum === 'kirli') {
      anahtar = `kirli-${te.t.id}`;
      hedef = { el: () => sunger, soz: M.ipucu.kirli, hareket: 'surukle', nereye: () => te.el };
    } else if (te?.t.durum === 'kopuklu') {
      anahtar = `kopuklu-${te.t.id}`;
      hedef = { el: () => te.el, soz: M.ipucu.kopuklu, hareket: 'surukle', nereye: () => musluk };
    } else if (te?.t.durum === 'temiz') {
      anahtar = `temiz-${te.t.id}`;
      hedef = { el: () => te.el, soz: M.ipucu.temiz, hareket: 'surukle', nereye: () => raf };
    } else if (hepsiBitti(tabaklar)) {
      anahtar = 'bitti';
      hedef = { el: () => b.tepsi.el, soz: M.ipucu.bitti, hareket: 'dokun' };
    }
    if (anahtar === sonIpucu) return;
    sonIpucu = anahtar;
    b.ipucu.hedef(hedef);
  }

  // ------------------------------------------------------------ ödül: raf parlar, Babaanne'nin bahşişi
  let odulde = false;
  let coz: (u: Urun[]) => void = () => undefined;
  const bittiSoz = new Promise<Urun[]>((r) => (coz = r));
  b.tepsi.dinle(() => {
    if (odulde) return;
    const temiz = tabaklar.filter((t) => t.durum === 'rafta').length;
    if (!temiz) return coz([]);
    odulde = true;
    olay('odul');
    durumGuncelle();
    void (async () => {
      const bekle = (ms: number) => new Promise<void>((r) => window.setTimeout(r, TEST_MODU ? Math.min(ms, 20) : ms));
      for (const r of raftakiler) {
        r.el.classList.add('rs-parla');
        p6Ses.tin(r.i);
        const m = merkez(r.el, kok);
        parilti(kok, m.x, m.y - m.h * 0.2, 2, 16);
        await bekle(170);
      }
      // Babaanne'nin bahşiş jetonu rafa düşer
      const jeton = h('i.rs-bl-jeton');
      const jx = rafR.x + rafR.w / 2;
      const jy = rafR.y + rafR.h + 4;
      jeton.style.cssText = `left:${jx - 22}px;top:${jy - 22}px`;
      efektKat.append(jeton);
      try {
        await jeton.animate([{ transform: 'translateY(-160px) scale(0.6)', opacity: 0 }, { transform: 'translateY(0) scale(1.15,0.85)', opacity: 1, offset: 0.8 }, { transform: 'none', opacity: 1 }], { duration: TEST_MODU ? 30 : 520, easing: 'cubic-bezier(.5,0,.7,1)' }).finished;
      } catch {
        /* yok say */
      }
      b.ses.cal('cin');
      olay('bahsis');
      void b.mino.tepki('sevin', 1200);
      await b.mino.soyle(M.bahsis);
      await bekle(300);
      const t = merkez(b.tepsi.el, kok);
      await ucur(jeton, t.x - jx, t.y - jy, 380, -40);
      coz([{ id: urunId('bulasik'), tur: 'bulasik', ozellik: { malzemeler: {} }, gorsel: () => rafGorsel(temiz), temiz, bahsis: 1 } as Urun & { temiz: number; bahsis: number }]);
    })();
  });

  function ozet() {
    return {
      tabaklar: tabaklar.map((t) => ({ tur: t.tur, durum: t.durum, kir: +t.lekeler.reduce((s, l) => s + l.kir, 0).toFixed(2), deterjan: t.deterjan })),
      aktif: aktif?.t.id ?? null,
      balon: balonSay,
    };
  }
  (window as unknown as { __rsBulasik?: unknown }).__rsBulasik = {
    olaylar,
    durum: ozet,
    merkez: () => ({ tc, tR, L, rafR, muslukYer }),
    balonlar: () =>
      [...balonKat.querySelectorAll<HTMLElement>('.rs-bl-balon')].map((e) => {
        const r = e.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, buyuk: e.classList.contains('rs-buyuk') };
      }),
    lekeYeri: () => {
      const te = aktif;
      if (!te) return [];
      const r = te.el.getBoundingClientRect();
      return te.t.lekeler.filter((l) => l.kir > 0).map((l) => ({ x: r.left + r.width / 2 + l.u * (r.width / 2), y: r.top + r.height / 2 + l.v * (r.height / 2) }));
    },
  };
  yerlestir();
  siradaki();
  if (!konusuyorMu()) void b.mino.soyle(M.geldi);

  return {
    bitti: bittiSoz,
    kapat() {
      kapandi = true;
      ro?.disconnect();
      clearInterval(balonUret);
      zamanlar.forEach((z) => {
        clearTimeout(z);
        clearInterval(z);
      });
      siril?.dur();
      kok.remove();
    },
  };
}
