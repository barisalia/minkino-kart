/**
 * KIR VE ÇIRP (mermer tezgâh) · ekip/senaryo/RESTORAN.md §8 M5, §1d, §4c.
 *
 * Rafta yumurta sepeti, süt, un, şeker: hangisinden ne kadar konacağı çocuğun seçimi (pankek hamuru, menemen için
 * çırpılmış yumurta, sütlaç için şekerli süt: ürün içinden tanınır).
 *   - Yumurta: kâsenin kenarına iki kez vur (tık: çatlak, çat: açılır, sarısı "pıt" diye düşer). Çok hızlı vurursan
 *     kabuk kâseye düşer: KABUK AVI. Kabuk sıvıda süzülür, parmak değince kayıp kaçar ("Kaçıyor!"), 3-4'te ikinci,
 *     5-6'da üçüncü dokunuşta yakalanır ve kâsenin yanındaki kabuk yığınına uçar. Bütün yumurtayı kâseye atarsan
 *     kendi çatlar, iki kabuk birden düşer. 3-4 için dokunuş yolu: yumurta kenara zıplar, dokundukça vurur.
 *   - Süt: şişe kâsenin üstünde durdukça akar (lıkır lıkır). Un ve şeker kaşık kaşık: her dördüncü kaşık unda bulut
 *     kalkar, Mino'nun yüzü bembeyaz olur, hapşırır.
 *   - Çırp: tel kâsede daire (ya da yay) çizdikçe katmanlar karışır, sarı-beyazdan kremaya döner. 5-6'da un topakları
 *     telin altında patlar. Çok hızlı çırparsan köpük Mino'nun yüzüne sıçrar, Mino yalar.
 *   - Ödül: pürüzsüz olunca yüzeyde parlak bir spiral, "ting", tepsi hoplar.
 * Parça döndürme yok, büyütme yok; dokunuşla aynı karede görüntü ve ses.
 */
import { konusuyorMu } from '../../../../src/audio/ses';
import { h, TEST_MODU } from '../../../../src/ui/dom';
import metin from '../../../../content/restoran/mini-kir-cirp.json';
import { MALZEME_ADI, urunId, type MiniBaglam, type MiniGirdi, type MiniOturum, type MiniOyun, type Urun, type YemekOzelligi } from '../arayuz';
import { ezil, hopla, kipirda, parilti, sac, TITRESIM, ucur } from '../dogra/efekt';
import { surukle } from '../dogra/surukle';
import {
  AGIRLIK,
  bitti as hamurBitti,
  bosDurum,
  EN_COK_YUMURTA,
  ekle,
  icerikVar,
  kabukYakalandi,
  karisikRenk,
  katmanaEkle,
  katmanlariCirp,
  kenaraVurdu,
  KOPUK_HIZ,
  ortalamaKarisim,
  SERT_VURUS,
  unBulutu,
  urunTuru,
  type Katman,
} from './mantik';
import { Elde, merkez, minoYuzune, olayci, p5Ses, rafOge, rafYerlestir, resimYa, YUKARI, type RafOge } from './ortak';
import './kir-cirp.css';

const M = metin.mino;
type RafTur = 'yumurta' | 'sut' | 'un' | 'seker';

export const oyun: MiniOyun = {
  ad: 'kir-cirp',
  istasyon: 'mermer',
  simge: () => resimYa('alet/cirpma-teli', 'tel', 'rs-kc-simge'),
  baslat: (b, g) => kirCirpBaslat(b, g),
};

/** Tepside ve masada küçük kâse: içi karışımın rengi (kutusunu doldurur) */
export function cirpKase(renk: string, karisim: number): HTMLElement {
  const el = h('span.rs-p5-urun-kase', { 'data-karisim': karisim >= 0.999 ? 'tam' : 'az' });
  el.style.setProperty('--ic', renk);
  return el;
}

function kirCirpBaslat(b: MiniBaglam, g: MiniGirdi): MiniOturum {
  const yas = g.yas;
  const kok = h('div.rs-p5-oyun.rs-kir-cirp', { 'data-yas': yas });
  const { olaylar, olay } = olayci(kok);
  let d = bosDurum();
  const katmanlar: (Katman & { el: HTMLElement })[] = [];

  // ------------------------------------------------------------ DOM
  const raf = h('div.rs-p5-raf');
  const kase = h('div.rs-kc-kase');
  const ic = h('div.rs-kc-ic');
  const sivi = h('i.rs-kc-sivi');
  const lekeKat = h('div.rs-kc-lekeler');
  const izKat = h('div.rs-kc-iz');
  const topakKat = h('div.rs-kc-topaklar');
  const spiral = h('div.rs-kc-spiral', { 'aria-hidden': 'true', html: '<svg viewBox="-50 -50 100 100"><path d="M0 0 C4 -3 8 2 5 7 C1 13 -9 10 -11 2 C-13 -8 -3 -16 8 -14 C20 -12 24 2 18 12 C11 23 -8 25 -18 15 C-28 5 -26 -14 -13 -22 C0 -30 20 -26 27 -14"/></svg>' });
  ic.append(sivi, lekeKat, izKat, topakKat, spiral);
  kase.append(h('i.rs-kc-kase-dis'), ic);
  const kabukKat = h('div.rs-kc-kabuklar');
  const yigin = h('div.rs-kc-yigin', { 'aria-hidden': 'true' });
  const telUrl = resimYa('alet/cirpma-teli', 'tel');
  const tel = h('div.rs-kc-tel', { role: 'button', 'aria-label': 'Çırpma teli' }, telUrl);
  const akis = h('i.rs-kc-akis', { hidden: true });
  const eldeKat = h('div.rs-kc-elde-kat');
  const istekKart = h('div.rs-kc-istek', { hidden: true });
  kok.append(kase, yigin, kabukKat, akis, raf, tel, istekKart, eldeKat);
  b.kok.append(kok);
  const elde = new Elde(eldeKat, kok);

  const rafOgeleri: RafOge<RafTur>[] = [];
  const yumurtaRaf = rafOge(raf, rafOgeleri, 'yumurta', resimYa('alet/yumurta-sepeti', 'sepet'), MALZEME_ADI.yumurta);
  const sutRaf = rafOge(raf, rafOgeleri, 'sut', resimYa('alet/sut-sisesi', 'sut'), MALZEME_ADI.sut);
  const unRaf = rafOge(raf, rafOgeleri, 'un', resimYa('alet/un-kavanozu', 'un'), MALZEME_ADI.un);
  const sekerRaf = rafOge(raf, rafOgeleri, 'seker', resimYa('alet/seker-kavanozu', 'seker'), MALZEME_ADI.seker);

  // 5-6 özel istek: "iki yumurtalı" (lokanta verir; deneme sayfasında &ozel=2)
  const ozelSayi = (() => {
    const o = g.ozelIstek;
    if (o?.tur === 'adet' && !Array.isArray(o.deger) && 'sayi' in o.deger && o.deger.malzeme === 'yumurta') return o.deger.sayi;
    const q = TEST_MODU && yas === 'buyuk' ? Number(new URLSearchParams(location.search).get('ozel')) : 0;
    return q > 0 ? Math.min(EN_COK_YUMURTA, q) : 0;
  })();
  if (ozelSayi) {
    istekKart.hidden = false;
    for (let i = 0; i < ozelSayi; i++) istekKart.append(h('i.rs-kc-istek-yumurta'));
  }

  // ------------------------------------------------------------ yerleşim
  let cx = 300;
  let cy = 220;
  let R = 120;
  let Ri = 96;
  let dinlenme = { x: 0, y: 0 };
  let telTutuluyor = false;
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
      cx = Math.max(W * 0.42, R + 130);
      cy = rafAlt + 6 + yuk / 2;
      dinlenme = { x: cx + R + 64, y: cy + 10 };
      yigin.style.cssText = `left:${cx - R - 26}px;top:${cy + R * 0.78}px`;
      istekKart.style.left = `${cx + R + 24}px`;
      istekKart.style.top = `${rafAlt + 6}px`;
    } else {
      R = Math.min(W * 0.4, (H - rafAlt) * 0.25);
      cx = W / 2;
      cy = rafAlt + 30 + R;
      dinlenme = { x: cx + R * 0.5, y: cy + R + 84 };
      yigin.style.cssText = `left:${cx - R * 0.9}px;top:${cy + R + 20}px`;
      istekKart.style.left = `${W - 110}px`;
      istekKart.style.top = `${cy + R + 16}px`;
    }
    Ri = R * 0.8;
    kase.style.cssText = `left:${cx - R}px;top:${cy - R}px;width:${R * 2}px;height:${R * 2}px`;
    if (!telTutuluyor) telKoy(dinlenme.x, dinlenme.y);
    for (const k of kabuklar) kabukKoy(k);
  }
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => yerlestir()) : null;
  ro?.observe(kok);
  const kasede = (x: number, y: number, pay = 1) => Math.hypot(x - cx, y - cy) < R * pay;
  const icten = (u: number, v: number) => ({ x: cx + u * Ri, y: cy + v * Ri });
  function telKoy(x: number, y: number) {
    tel.style.transform = `translate(${x}px,${y}px)`;
  }

  // ------------------------------------------------------------ katmanlar (yumurta sarısı, süt göleti, un, şeker)
  function katmanEkle(tur: Katman["tur"], u: number, v: number, w: number = AGIRLIK[tur]) {
    const el = h('i.rs-kc-katman', { 'data-katman': tur });
    el.style.left = `${50 + u * 50}%`;
    el.style.top = `${50 + v * 50}%`;
    lekeKat.append(el);
    katmanlar.push({ tur, w, m: 0, el });
    try {
      el.animate([{ transform: 'scale(0.3)', opacity: 0.4 }, { transform: 'scale(1.15,0.85)', opacity: 1, offset: 0.6 }, { transform: 'scale(1)' }], { duration: TEST_MODU ? 30 : 300, easing: 'ease-out' });
    } catch {
      /* yok say */
    }
    return katmanlar[katmanlar.length - 1];
  }
  function karisimCiz() {
    d.karisim = ortalamaKarisim(katmanlar);
    const tam = hamurBitti(d);
    for (const k of katmanlar) {
      const o = tam ? 0 : Math.max(0, 1 - k.m * 1.1);
      k.el.style.opacity = String(o);
      if (k.tur === 'sut') k.el.style.setProperty('--boy', String(Math.min(1.6, 0.6 + k.w * 0.35)));
    }
    sivi.style.background = karisikRenk(d);
    sivi.style.opacity = icerikVar(d) ? String(Math.min(1, 0.15 + d.karisim * 1.1)) : '0';
    ic.dataset.karisim = String(Math.round(d.karisim * 10) / 10);
  }

  // ------------------------------------------------------------ yumurta: kenara iki vuruş
  let kenardaki: HTMLElement | null = null;
  function yumurtaKir(x: number, y: number, sert: boolean) {
    // sarısı vurulan yerden biraz içeri düşer
    const ux = (x - cx) / Ri;
    const uy = (y - cy) / Ri;
    const l = Math.hypot(ux, uy) || 1;
    const k = (Math.min(l, 0.5) / l) * 0.85;
    d = ekle(d, 'yumurta', 1, yas);
    b.ses.cal('cat');
    b.dokunsal(TITRESIM.kesim);
    sac(kok, x, y, 'kabuk', '#FFF3DC', 2, { yon: -Math.PI / 2, yay: 2.4, guc: 1.3, boy: 22 });
    const n = d.yumurta;
    window.setTimeout(
      () => {
        b.ses.cal('pit');
        katmanEkle('yumurta', ux * k, uy * k);
        karisimCiz();
        if (yas === 'buyuk' || ozelSayi) {
          const soz = (M.say as Record<string, string>)[String(n)];
          if (soz) void b.mino.soyle(soz);
        } else if (n === 1) void b.mino.soyle(M.ad.yumurta);
        istekKontrol();
        durumGuncelle();
      },
      TEST_MODU ? 0 : 130,
    );
    if (sert) kabukDusur(x, y);
    olay('yumurtaKirildi');
    if (d.yumurta >= EN_COK_YUMURTA) yumurtaRaf.classList.add('rs-p5-tutuldu');
  }
  function vurus(el: HTMLElement, hiz: number, x: number, y: number): boolean {
    const n = Number(el.dataset.vurus ?? '0') + 1;
    el.dataset.vurus = String(n);
    const sert = hiz > SERT_VURUS[yas];
    if (n === 1) {
      b.ses.cal('tik');
      b.dokunsal(TITRESIM.hafif);
      el.classList.add('rs-catlak');
      ezil(el, 1.2);
      olay('tik');
      if (sert) kabukDusur(x, y);
      return false;
    }
    yumurtaKir(x, y, sert);
    return true;
  }
  let oncekiUzak = Infinity;
  let kirildi = false;
  surukle(yumurtaRaf, kok, {
    basla: (x, y) => {
      if (d.yumurta >= EN_COK_YUMURTA) {
        kipirda(yumurtaRaf, 4);
        return false;
      }
      const el = elde.al(yumurtaRaf, x, y, 'rs-kc-elde-yumurta');
      el.replaceChildren(resimYa('alet/yumurta', 'yumurta'));
      el.dataset.vurus = '0';
      oncekiUzak = Infinity;
      kirildi = false;
      b.ses.cal('hop', { perde: 1.2, guc: 0.4 });
    },
    hareket: (x, y, hiz) => {
      if (kirildi || !elde.el) return;
      elde.tasi(x, y);
      const uzak = Math.hypot(x - cx, y - YUKARI - cy);
      if (kenaraVurdu(oncekiUzak, uzak, R, yas) && vurus(elde.el, hiz.v, x, y - YUKARI)) {
        kirildi = true;
        elde.birak();
      }
      oncekiUzak = uzak;
    },
    birak: (x, y) => {
      if (kirildi) return;
      const el = elde.el;
      if (el && kasede(x, y - YUKARI, 0.8)) {
        // bütün yumurta kâseye: hop, kendi çatlar, iki kabuk birden (komik)
        elde.el = null;
        b.ses.cal('boing');
        hopla(el, 18, 280);
        window.setTimeout(
          () => {
            el.remove();
            olay('butunYumurta');
            void b.mino.tepki('sasir', 900);
            yumurtaKir(x, y - YUKARI, false);
            kabukDusur(x, y - YUKARI);
            kabukDusur(x, y - YUKARI);
          },
          TEST_MODU ? 10 : 300,
        );
        return;
      }
      elde.birak(yumurtaRaf);
    },
    dokun: () => {
      elde.birak();
      if (d.yumurta >= EN_COK_YUMURTA) return void kipirda(yumurtaRaf, 4);
      if (kenardaki) return kenardakiVur();
      // 3-4 yolu: yumurta kâsenin kenarına zıplar ve bir kez vurur; bir daha dokununca açılır
      const el = h('button.rs-kc-kenar-yumurta', { type: 'button', 'aria-label': MALZEME_ADI.yumurta }, resimYa('alet/yumurta', 'yumurta'));
      const p = kenarNokta();
      el.style.transform = `translate(${p.x}px,${p.y}px)`;
      eldeKat.append(el);
      kenardaki = el;
      vurus(el, 0, p.x, p.y);
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        kenardakiVur();
      });
      durumGuncelle();
    },
  });
  const kenarNokta = () => { const a = -1.05 + (d.yumurta % 3) * 0.45; return { x: cx + Math.cos(a) * R * 1.02, y: cy + Math.sin(a) * R * 1.02 }; };
  function kenardakiVur() {
    if (!kenardaki) return;
    const p = kenarNokta();
    if (vurus(kenardaki, 0, p.x, p.y)) {
      kenardaki.remove();
      kenardaki = null;
    }
  }

  // ------------------------------------------------------------ KABUK AVI: kaygan kabuk sıvıda süzülür
  interface Kabuk {
    el: HTMLElement;
    u: number;
    v: number;
    vu: number;
    vv: number;
    n: number;
  }
  const kabuklar: Kabuk[] = [];
  let kaciyorDendi = false;
  function kabukKoy(k: Kabuk) {
    const p = icten(k.u, k.v);
    k.el.style.transform = `translate(${p.x}px,${p.y}px)`;
  }
  function kabukDusur(x: number, y: number) {
    d = { ...d, kabuk: d.kabuk + 1 };
    olay('kabukKasede');
    const el = h('button.rs-kc-kabuk', { type: 'button', 'aria-label': 'Kabuk' }, resimYa('yiyecek/yumurta-kabuk-parca', 'kabuk', 'rs-kc-kabuk-resim'));
    const a = Math.random() * Math.PI * 2;
    const k: Kabuk = { el, u: Math.max(-0.5, Math.min(0.5, (x - cx) / Ri)), v: Math.max(-0.5, Math.min(0.5, (y - cy) / Ri)), vu: Math.cos(a) * 0.12, vv: Math.sin(a) * 0.12, n: 0 };
    kabuklar.push(k);
    kabukKat.append(el);
    kabukKoy(k);
    try {
      (el.firstElementChild as HTMLElement).animate([{ transform: 'translateY(-30px) scale(0.8)' }, { transform: 'translateY(0) scale(1.15,0.85)', offset: 0.75 }, { transform: 'none' }], { duration: TEST_MODU ? 20 : 300, easing: 'ease-in' });
    } catch {
      /* yok say */
    }
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      kabukDokun(k, e);
    });
    durumGuncelle();
  }
  function kabukDokun(k: Kabuk, e: PointerEvent) {
    k.n++;
    b.dokunsal(TITRESIM.hafif);
    if (!kabukYakalandi(k.n, yas)) {
      // parmaktan kayar: parmağın tersine fırlar
      const kr = kok.getBoundingClientRect();
      const p = icten(k.u, k.v);
      const dx = p.x - (e.clientX - kr.left);
      const dy = p.y - (e.clientY - kr.top);
      const l = Math.hypot(dx, dy) || 1;
      k.vu = (dx / l) * 1.6 + (Math.random() - 0.5) * 0.4;
      k.vv = (dy / l) * 1.6 + (Math.random() - 0.5) * 0.4;
      b.ses.cal('pit', { perde: 1.4 + k.n * 0.12 });
      ezil(k.el.firstElementChild as HTMLElement, 1.4);
      olay('kaciyor');
      if (!kaciyorDendi) {
        kaciyorDendi = true;
        void b.mino.tepki('sevin', 800);
        void b.mino.soyle(M.kaciyor);
      }
      return;
    }
    // yakalandı: kâsenin yanındaki kabuk yığınına uçar (sahnede kalır)
    const i = kabuklar.indexOf(k);
    if (i >= 0) kabuklar.splice(i, 1);
    d = { ...d, kabuk: Math.max(0, d.kabuk - 1) };
    b.ses.cal('hop', { perde: 1.2 });
    olay('kabukCikti');
    const p = icten(k.u, k.v);
    const y = merkez(yigin, kok);
    k.el.style.pointerEvents = "none";
    void ucur(k.el, y.x - p.x + (Math.random() - 0.5) * 20, y.y - p.y + (Math.random() - 0.5) * 8, 380, -60).then(() => {
      k.el.remove();
      const parca = resimYa('yiyecek/yumurta-kabuk-parca', 'kabuk', 'rs-kc-kabuk-resim');
      parca.style.transform = `translate(${(yigin.childElementCount % 4) * 9 - 12}px,${-Math.floor(yigin.childElementCount / 4) * 6}px)`;
      yigin.append(parca);
    });
    if (!d.kabuk) {
      void b.mino.tepki('sevin', 900);
      if (!konusuyorMu()) void b.mino.soyle(M.yakaladin);
    }
    durumGuncelle();
  }
  // kabuklar sıvıda süzülür (yavaş), kenardan seker
  let sonT = performance.now();
  const zaman = window.setInterval(() => {
    const t = performance.now();
    const dt = Math.min(0.1, (t - sonT) / 1000);
    sonT = t;
    for (const k of kabuklar) {
      k.u += k.vu * dt;
      k.v += k.vv * dt;
      const l = Math.hypot(k.u, k.v);
      if (l > 0.72) {
        const nu = k.u / l;
        const nv = k.v / l;
        const dot = k.vu * nu + k.vv * nv;
        if (dot > 0) {
          k.vu -= 2 * dot * nu;
          k.vv -= 2 * dot * nv;
        }
        k.u = nu * 0.72;
        k.v = nv * 0.72;
      }
      // sürtünme: hızlı kaçış yavaşlar, ama hep biraz süzülür
      const hz = Math.hypot(k.vu, k.vv);
      const hedef = 0.12;
      const f = hz > hedef ? Math.max(hedef / hz, 1 - dt * 1.8) : 1;
      k.vu *= f;
      k.vv *= f;
      kabukKoy(k);
    }
  }, 33);

  // ------------------------------------------------------------ süt: şişe kâsenin üstünde durdukça akar
  let sutZaman = 0;
  let sutKatman: (Katman & { el: HTMLElement }) | null = null;
  let siril: { guc(g: number): void; dur(): void } | null = null;
  function sutAk(miktar: number) {
    if (d.sut >= 3) return;
    const ilk = d.sut === 0;
    d = ekle(d, 'sut', miktar, yas);
    if (!sutKatman) sutKatman = katmanEkle('sut', 0.1, 0.12, miktar * AGIRLIK.sut);
    else katmanaEkle(sutKatman, miktar * AGIRLIK.sut);
    if (ilk) {
      olay('sut');
      if (!konusuyorMu()) void b.mino.soyle(M.ad.sut);
    }
    karisimCiz();
  }
  function akisGoster(x: number, y: number) {
    akis.hidden = false;
    const ust = y - YUKARI + 20;
    const alt = cy + R * 0.1;
    akis.style.cssText = `left:${x - 5}px;top:${ust}px;height:${Math.max(10, alt - ust)}px`;
  }
  surukle(sutRaf, kok, {
    basla: (x, y) => {
      elde.al(sutRaf, x, y, 'rs-kc-elde-sise');
      b.ses.cal('hop', { perde: 1.1, guc: 0.4 });
    },
    hareket: (x, y) => {
      elde.tasi(x, y);
      const dok = kasede(x, y - YUKARI, 1.05);
      if (dok) akisGoster(x, y);
      else akis.hidden = true;
      if (dok && !sutZaman) {
        siril = b.ses.dongu('siril');
        siril.guc(0.5);
        sutZaman = window.setInterval(() => {
          sutAk(0.06);
          if (Math.random() < 0.3) p5Ses.likir(0.9 + Math.random() * 0.3);
        }, 90);
      } else if (!dok && sutZaman) sutDur();
    },
    birak: () => {
      sutDur();
      akis.hidden = true;
      elde.birak(sutRaf);
      durumGuncelle();
    },
    dokun: () => {
      elde.birak();
      ezil(sutRaf, 1.3);
      p5Ses.likir();
      sac(kok, cx + Ri * 0.1, cy, 'damla', '#ffffff', 4, { yon: -Math.PI / 2, yay: 2, guc: 0.5 });
      sutAk(0.5);
      durumGuncelle();
    },
  });
  function sutDur() {
    clearInterval(sutZaman);
    sutZaman = 0;
    siril?.dur();
    siril = null;
  }

  // ------------------------------------------------------------ un ve şeker: kaşık kaşık
  function kasik(tur: 'un' | 'seker', x?: number, y?: number) {
    const ilk = !d[tur];
    d = ekle(d, tur, 1, yas);
    const u = x !== undefined ? Math.max(-0.55, Math.min(0.55, (x - cx) / Ri)) : (Math.random() - 0.5) * 0.9;
    const v = y !== undefined ? Math.max(-0.55, Math.min(0.55, (y - cy) / Ri)) : (Math.random() - 0.5) * 0.9;
    katmanEkle(tur, u, v);
    const p = icten(u, v);
    p5Ses.kasik(tur === 'seker');
    b.dokunsal(TITRESIM.hafif);
    sac(kok, p.x, p.y, 'un', tur === 'un' ? '#fffaf0' : '#ffffff', tur === 'un' ? 7 : 5, { guc: 0.5, boy: tur === 'un' ? 9 : 4, yercekim: false });
    olay(tur);
    if (tur === 'un') {
      // 5-6: topaklar
      while (topakKat.childElementCount < d.topak) {
        const t = h('i.rs-kc-topak');
        const a = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * 0.62;
        t.dataset.u = String(Math.cos(a) * r);
        t.dataset.v = String(Math.sin(a) * r);
        t.style.left = `${50 + Math.cos(a) * r * 50}%`;
        t.style.top = `${50 + Math.sin(a) * r * 50}%`;
        topakKat.append(t);
      }
      if (unBulutu(d.un)) unBulutuKalk(p.x, p.y);
      else if (ilk && !konusuyorMu()) void b.mino.soyle(M.ad.un);
    } else if (ilk && !konusuyorMu()) void b.mino.soyle(M.ad.seker);
    karisimCiz();
    durumGuncelle();
  }
  /** Her dördüncü kaşıkta un bulutu: Mino'nun yüzü bembeyaz, hapşırır */
  function unBulutuKalk(x: number, y: number) {
    olay('unBulutu');
    b.ses.cal('pof', { perde: 0.8 });
    const m = merkez(b.mino.el, kok);
    const a = Math.atan2(m.y - m.h * 0.2 - y, m.x - x);
    sac(kok, x, y, 'buhar', '#fff', 8, { yon: a, yay: 0.9, guc: 2.6, boy: 46 });
    window.setTimeout(
      () => {
        if (kapandi) return;
        minoYuzune(kok, b.mino, 'un', 2800);
        void b.mino.tepki('hapsir', 1300);
        window.setTimeout(() => p5Ses.hapsu(), TEST_MODU ? 0 : 250);
        void b.mino.soyle(M.hapsu);
        olay('hapsu');
      },
      TEST_MODU ? 20 : 380,
    );
  }
  for (const [el, tur] of [
    [unRaf, 'un'],
    [sekerRaf, 'seker'],
  ] as const) {
    surukle(el, kok, {
      basla: (x, y) => {
        elde.al(el, x, y, 'rs-kc-elde-kavanoz');
        b.ses.cal('hop', { perde: 1, guc: 0.35 });
      },
      hareket: (x, y) => elde.tasi(x, y),
      birak: (x, y) => {
        if (kasede(x, y - YUKARI, 1.1)) {
          elde.birak();
          kasik(tur, x, y - YUKARI);
        } else elde.birak(el);
      },
      dokun: () => {
        elde.birak();
        ezil(el, 1.3);
        kasik(tur);
      },
    });
  }

  // ------------------------------------------------------------ çırpma teli
  let sonTel = { x: 0, y: 0 };
  let izSayac = 0;
  let telSes = 0;
  let sonKopuk = -1e9;
  function cirpYol(tx: number, ty: number, yol: number, hiz: number) {
    if (!kasede(tx, ty, 0.84) || yol < 0.5) return;
    if (icerikVar(d)) {
      katmanlariCirp(katmanlar, yol, R, yas);
      karisimCiz();
    }
    // iz: kremamsı nokta, söner (karışma hissi)
    if ((izSayac += yol) > 14 && icerikVar(d)) {
      izSayac = 0;
      const n = h('i.rs-kc-iz-nokta');
      n.style.left = `${50 + ((tx - cx) / Ri) * 50}%`;
      n.style.top = `${50 + ((ty - cy) / Ri) * 50}%`;
      n.style.background = karisikRenk(d);
      izKat.append(n);
      try {
        n.animate([{ opacity: 0.9, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.6,0.7)' }], { duration: TEST_MODU ? 40 : 700, easing: 'ease-out', fill: 'forwards' }).finished.then(
          () => n.remove(),
          () => n.remove(),
        );
      } catch {
        n.remove();
      }
    }
    if ((telSes += yol) > 44) {
      telSes = 0;
      p5Ses.tel(0.9 + Math.random() * 0.25);
      if (icerikVar(d) && Math.random() < 0.3) b.ses.cal('kopuk', { guc: 0.4 });
    }
    // tel kabukları ve topakları iter / patlatır
    for (const k of kabuklar) {
      const p = icten(k.u, k.v);
      const uz = Math.hypot(p.x - tx, p.y - ty);
      if (uz < R * 0.3) {
        k.vu += ((p.x - tx) / (uz || 1)) * 0.5;
        k.vv += ((p.y - ty) / (uz || 1)) * 0.5;
      }
    }
    for (const t of [...topakKat.children] as HTMLElement[]) {
      const p = icten(Number(t.dataset.u), Number(t.dataset.v));
      if (Math.hypot(p.x - tx, p.y - ty) < R * 0.22) {
        t.remove();
        d = { ...d, topak: Math.max(0, d.topak - 1) };
        b.ses.cal('pit', { perde: 1.1 + Math.random() * 0.3, guc: 0.7 });
        sac(kok, p.x, p.y, 'un', '#fffaf0', 3, { guc: 0.4, boy: 6, yercekim: false });
        olay('topak');
      }
    }
    // çok hızlı çırpma: köpük Mino'nun yüzüne
    const t0 = performance.now();
    if (hiz > KOPUK_HIZ[yas] && icerikVar(d) && t0 - sonKopuk > (TEST_MODU ? 200 : 2600)) {
      sonKopuk = t0;
      kopukSicra(tx, ty);
    }
    durumGuncelle(false);
  }
  function kopukSicra(x: number, y: number) {
    olay('kopuk');
    b.ses.cal('kopuk');
    const m = merkez(b.mino.el, kok);
    const a = Math.atan2(m.y - m.h * 0.2 - y, m.x - x);
    sac(kok, x, y, 'kopuk', '#fffaf0', 6, { yon: a, yay: 0.6, guc: 3.2, boy: 14, yercekim: false });
    window.setTimeout(
      () => {
        if (kapandi) return;
        minoYuzune(kok, b.mino, 'kopuk', 2400);
        void b.mino.tepki('tat', 1400);
        if (!konusuyorMu()) void b.mino.soyle(M.kopuk);
        olay('kopukMino');
      },
      TEST_MODU ? 20 : 300,
    );
  }
  surukle(tel, kok, {
    basla: (x, y) => {
      telTutuluyor = true;
      tel.classList.add('rs-tutuluyor');
      sonTel = { x, y: y - 30 };
      telKoy(x, y - 30);
      b.ses.cal('tik', { guc: 0.4 });
    },
    hareket: (x, y, hiz) => {
      const tx = x;
      const ty = y - 30;
      telKoy(tx, ty);
      const yol = Math.hypot(tx - sonTel.x, ty - sonTel.y);
      sonTel = { x: tx, y: ty };
      cirpYol(tx, ty, yol, hiz.v);
    },
    birak: () => telBirak(),
    dokun: () => {
      // dokununca tel kâsede kendi kendine bir tur çırpar
      telTutuluyor = true;
      const adim = TEST_MODU ? 6 : 20;
      let i = 0;
      const r = Ri * 0.5;
      sonTel = { x: cx + r, y: cy };
      const z = window.setInterval(() => {
        const a = (i / adim) * Math.PI * 2;
        const tx = cx + Math.cos(a) * r;
        const ty = cy + Math.sin(a) * r;
        telKoy(tx, ty);
        cirpYol(tx, ty, Math.hypot(tx - sonTel.x, ty - sonTel.y), 0.5);
        sonTel = { x: tx, y: ty };
        if (++i > adim) {
          clearInterval(z);
          telBirak();
        }
      }, 40);
      zamanlar.push(z);
    },
  });
  const zamanlar: number[] = [];
  function telBirak() {
    telTutuluyor = false;
    tel.classList.remove('rs-tutuluyor');
    telKoy(dinlenme.x, dinlenme.y);
    if (d.karisim > 0.05) olay('cirp');
    durumGuncelle();
  }

  // ------------------------------------------------------------ özel istek, doğal son, ipucu
  function istekKontrol() {
    if (!ozelSayi) return;
    const tuttu = d.yumurta === ozelSayi;
    istekKart.classList.toggle('rs-tuttu', tuttu);
    if (tuttu) {
      b.ses.cal('ting', { perde: 1.1 });
      const m = merkez(istekKart, kok);
      parilti(kok, m.x, m.y, 5, 30);
    }
  }
  let puruzsuz = false;
  function durumGuncelle(ipucuDa = true) {
    const son = hamurBitti(d);
    if (son && !puruzsuz) {
      puruzsuz = true;
      spiral.style.setProperty('--renk', karisikRenk(d));
      spiral.classList.add('rs-gorunur');
      karisimCiz();
      b.ses.cal('ting');
      parilti(kok, cx, cy, 7, Ri * 0.7);
      b.tepsi.hopla();
      void b.mino.tepki('sevin', 1000);
      if (!konusuyorMu()) void b.mino.soyle(M.puruzsuz);
      olay('puruzsuz');
    } else if (!son && puruzsuz) {
      puruzsuz = false;
      spiral.classList.remove('rs-gorunur');
    }
    kok.dataset.durum = JSON.stringify(ozet());
    if (ipucuDa) ipucuGuncelle();
  }
  function ipucuGuncelle() {
    if (odulde) return b.ipucu.hedef(null);
    if (kenardaki) return b.ipucu.hedef({ el: () => kenardaki, soz: M.ipucu.catlak, hareket: 'dokun' });
    if (!icerikVar(d)) return b.ipucu.hedef({ el: () => yumurtaRaf, soz: M.ipucu.bos, hareket: 'surukle', nereye: () => kase });
    if (kabuklar.length) return b.ipucu.hedef({ el: () => kabuklar[0]?.el ?? null, soz: M.ipucu.kabuk, hareket: 'dokun' });
    if (d.karisim < 0.999) return b.ipucu.hedef({ el: () => tel, soz: M.ipucu.cirp, hareket: 'daire' });
    if (d.topak) return b.ipucu.hedef({ el: () => tel, soz: M.ipucu.topak, hareket: 'daire' });
    b.ipucu.hedef({ el: () => b.tepsi.el, soz: M.ipucu.bitti, hareket: 'dokun' });
  }

  // ------------------------------------------------------------ ürün, ödül anı
  function urunYap(): Urun | null {
    if (!icerikVar(d)) return null;
    const { tur, yemek } = urunTuru(d);
    const malzemeler: YemekOzelligi['malzemeler'] = {};
    if (d.yumurta) malzemeler.yumurta = { adet: d.yumurta, kesim: d.karisim > 0.6 ? 'ince' : d.karisim > 0.15 ? 'iri' : 'butun' };
    if (d.sut) malzemeler.sut = { adet: Math.max(1, Math.round(d.sut * 2)) };
    if (d.un) malzemeler.un = { adet: d.un };
    if (d.seker) malzemeler.seker = { adet: d.seker };
    const ozellik: YemekOzelligi = { malzemeler, karisim: +d.karisim.toFixed(2), sicak: false };
    if (d.seker) ozellik.tatli = Math.min(3, d.seker);
    const renk = karisikRenk(d);
    const k = +d.karisim.toFixed(2);
    return { id: urunId(tur), tur, yemek: g.tarif && g.tarif !== yemek && tur !== 'hamur' ? g.tarif : yemek, ozellik, gorsel: () => cirpKase(renk, k), kirCirp: { kabuk: d.kabuk, topak: d.topak } } as Urun & { kirCirp: { kabuk: number; topak: number } };
  }
  let odulde = false;
  let kapandi = false;
  let coz: (u: Urun[]) => void = () => undefined;
  const bittiSoz = new Promise<Urun[]>((r) => (coz = r));
  b.tepsi.dinle(() => {
    if (odulde) return;
    if (!icerikVar(d)) return coz([]);
    odulde = true;
    b.ipucu.hedef(null);
    olay('odul');
    b.ses.cal('ting');
    spiral.style.setProperty('--renk', karisikRenk(d));
    spiral.classList.add('rs-gorunur', 'rs-parla');
    parilti(kok, cx, cy, 8, Ri * 0.8);
    const u = urunYap();
    window.setTimeout(
      () => {
        const t = merkez(b.tepsi.el, kok);
        void ucur(kase, t.x - cx, t.y - cy, 380, -30).then(() => coz(u ? [u] : []));
      },
      TEST_MODU ? 20 : 650,
    );
  });

  function ozet() {
    return { ...d, karisim: +d.karisim.toFixed(3), kabukKasede: kabuklar.length, katman: katmanlar.length };
  }
  (window as unknown as { __rsKirCirp?: unknown }).__rsKirCirp = {
    olaylar,
    durum: ozet,
    merkez: () => ({ cx, cy, R, Ri }),
    kabukYeri: () => kabuklar.map((k) => icten(k.u, k.v)),
  };
  yerlestir();
  karisimCiz();
  durumGuncelle();

  return {
    bitti: bittiSoz,
    kapat() {
      kapandi = true;
      ro?.disconnect();
      clearInterval(zaman);
      zamanlar.forEach((z) => clearInterval(z));
      sutDur();
      kok.remove();
    },
  };
}
