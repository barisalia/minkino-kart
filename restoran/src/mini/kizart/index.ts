/**
 * KIZART (fritöz, tel sepet, külah, tuzluk, ketçap; ocak, üstten) · ekip/senaryo/RESTORAN.md §8 M11, §3c, §1d.
 *
 * Rafta patates çubukları (tepsiden gelen soyulmuş / doğranmış patates de), havuç, soğan halkası...: sepete ne
 * konacağı çocuğun seçimi. Her dokunuş bir avuç.
 *  - Sepeti aşağı (yağa) götür: "cızzz", köpük, buhar; yağ fokurdar. Dokununca da dalar / kalkar.
 *  - Yağdayken sepeti sağa sola salla: parçalar zıplar, eşit kızarır. 5-6: sallamazsan üsttekiler soluk kalır.
 *  - Yukarı çek: süzülür (damlalar). Külaha götür: parçalar külaha dökülür.
 *  - Tuzluğu külahın üstünde salla (az ya da çok); ketçap şişesiyle külaha nokta nokta (desen yok, yalnız nokta).
 * Pişme: çiğ → az → altın → çıtır; çıtır son durak, kömür yok. Fritöz arka planda pişer: geri çıkınca pişmeye devam
 * eder (ArkaIs), dönünce kaldığı yerden.
 * Komik: çok tuz = tuz bulutu Mino'ya gider, Mino hapşırır. Çok bekleyen patates "Kıtır kıtır!" olur (Baba bayılır).
 * Ödül: külahtaki patatesler "kıtır kıtır" zıplar, yelpaze olur, külah tepsiye kayar.
 * Çıktı: `{ tur: 'kizartma', yemek: 'patates', servis: true, ozellik: { malzemeler, pisme, tuz, sus, porsiyon, sicak } }`.
 */
import { h } from '../../../../src/ui/dom';
import metin from '../../../../content/restoran/mini-kizart.json';
import { MALZEME_ADI, urunId, type ArkaIs, type Malzeme, type MiniBaglam, type MiniGirdi, type MiniOturum, type MiniOyun, type Urun } from '../arayuz';
import { ezil, hopla, kipirda, parilti, sac, ucur } from '../dogra/efekt';
import { rafSimge, RENK } from '../dogra/gorsel';
import { surukle } from '../dogra/surukle';
import { bekle, istasyonCizimi, konumaKay, hapsu, hisir, nota, odulEzgi, olayKaydi, resim, sureMs } from '../yika/ortak';
import { rastgele } from '../yika/mantik';
import { avucEkle, cogunluk, kesimi, kizartmaOzeti, pismeAdi, salla, sepetPis, SEPET_EN_COK, TUZ, tuzEkle, type Parca } from './mantik';
import './kizart.css';

const M = metin.mino;
const KIZARIR: Malzeme[] = ['patates', 'havuc', 'sogan', 'biber', 'ekmek'];

interface KizartDurum {
  sepet: Parca[];
  kulah: Parca[];
  tuz: number;
  ketcap: { x: number; y: number }[];
  yagda: boolean;
  t: number;
}

export const oyun: MiniOyun = {
  ad: 'kizart',
  istasyon: 'ocak',
  simge: () => {
    const u = resim('alet/fritoz');
    return u ? h('img.rs-kzr-simge', { src: u, alt: '', draggable: 'false' }) : h('span.rs-kzr-simge-yt');
  },
  baslat(b, g) {
    return kizartBaslat(b, g);
  },
};

function kizartBaslat(b: MiniBaglam, g: MiniGirdi): MiniOturum {
  const yas = g.yas;
  const r = rastgele(g.test ? 11 : Date.now());
  let raftakiler = KIZARIR.filter((m) => g.malzemeler.includes(m));
  if (!raftakiler.includes('patates')) raftakiler.unshift('patates');
  for (const m of ['havuc', 'sogan'] as Malzeme[]) if (raftakiler.length < 3 && !raftakiler.includes(m)) raftakiler.push(m);
  raftakiler = raftakiler.slice(0, yas === 'kucuk' ? 3 : 4);

  const kok = h('div.rs-kizart', { 'data-yas': yas });
  const cizimVar = istasyonCizimi('ocak');
  const { olaylar, olay } = olayKaydi(kok);
  const raf = h('div.rs-kzr-raf');
  const fritozUrl = resim('alet/fritoz');
  const fritoz = h('div.rs-kzr-fritoz', {}, fritozUrl ? h('img.rs-kzr-fritoz-resim', { src: fritozUrl, alt: '', draggable: 'false' }) : h('i.rs-kzr-yag'), h('i.rs-kzr-kabarcik'));
  const sepetIc = h('div.rs-kzr-sepet-ic');
  const sepetEl = h('div.rs-kzr-sepet', { 'data-durum': 'havada' }, h('i.rs-kzr-sap'), h('i.rs-kzr-tel'), sepetIc, h('i.rs-kzr-yag-perde'));
  const kulahIc = h('div.rs-kzr-kulah-ic');
  const ketcapKat = h('div.rs-kzr-ketcap-kat');
  const kulahUrl = resim('alet/kulah');
  const kulah = h('div.rs-kzr-kulah', {}, kulahIc, kulahUrl ? h('img.rs-kzr-kulah-resim', { src: kulahUrl, alt: '', draggable: 'false' }) : h('i.rs-kzr-kulah-kagit'), ketcapKat);
  const tuzUrl = resim('alet/tuzluk');
  const tuzluk = h('button.rs-kzr-tuzluk', { type: 'button', 'aria-label': 'Tuzluk' }, tuzUrl ? h('img', { src: tuzUrl, alt: '', draggable: 'false' }) : h('i.rs-kzr-tuzluk-yt'));
  const ketUrl = resim('alet/ketcap');
  const ketcap = h('button.rs-kzr-ketcap', { type: 'button', 'aria-label': 'Ketçap' }, ketUrl ? h('img', { src: ketUrl, alt: '', draggable: 'false' }) : h('i.rs-kzr-ketcap-yt'));
  const efektKat = h('div.rs-kzr-efekt');
  const altlik = h('i.rs-kzr-altlik');
  kok.append(altlik, fritoz, kulah, sepetEl, tuzluk, ketcap, raf, efektKat);
  b.kok.append(kok);

  // tepsiden gelen patates (Soy, Doğra) önce kullanılır
  const tepsidenPatates = g.tepsi.filter((u) => (u.ozellik.malzemeler.patates?.adet ?? 0) > 0);
  const kullanilan: string[] = [];

  for (const m of raftakiler) {
    const btn = h('button.rs-kzr-raf-oge', { type: 'button', 'aria-label': MALZEME_ADI[m], 'data-malzeme': m }, rafSimge(m), h('i.rs-kzr-raf-kesim', { 'data-kesim': kesimi(m) }));
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      rafaDokun(m, btn);
    });
    raf.append(btn);
  }

  // ------------------------------------------------------------ durum (arka planda pişmişse oradan)
  const onceki = g.devam as KizartDurum | undefined;
  const sepet: Parca[] = onceki?.sepet ?? [];
  const kulahta: Parca[] = onceki?.kulah ?? [];
  let tuz = onceki?.tuz ?? 0;
  const ketcapNokta: { x: number; y: number }[] = onceki?.ketcap ?? [];
  let durum: 'havada' | 'yagda' | 'tasiniyor' = 'havada';
  if (onceki?.yagda) sepetPis(sepet, (performance.now() - onceki.t) / 1000, yas);

  // ------------------------------------------------------------ yerleşim
  let W = 800;
  let H = 400;
  const F = { cx: 300, cy: 240, w: 300, h: 200 };
  const KL = { cx: 600, cy: 240, w: 96, h: 130 };
  const TZ = { x: 720, y: 140 };
  const KT = { x: 720, y: 230 };
  let sx = 0;
  let sy = 0;
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
    // ocak çiziminde (ve yer tutucuda) iki göz: yatayda %30 / %70 genişlikte, dikeyde (çizim döner) %30 / %70 yükseklikte.
    // Fritöz bir gözün, külah (ahşap altlığıyla) öbür gözün üstünde.
    if (yatay) {
      F.cx = W * 0.3;
      F.cy = H * 0.5 + 6;
      F.h = Math.min(2 * (F.cy - rafAlt) - 6, H * 0.62);
      F.w = Math.min(F.h * 1.52, W * 0.38);
      F.h = F.w / 1.52;
      KL.w = Math.min(118, W * 0.14);
      KL.h = KL.w * 1.35;
      KL.cx = W * 0.7;
      KL.cy = H * 0.5 + 4;
      TZ.x = Math.min(W - 46, W * 0.7 + Math.max(110, W * 0.14));
      TZ.y = Math.max(rafAlt + 40, H * 0.36);
      KT.x = TZ.x;
      KT.y = Math.min(H - 150, TZ.y + 100);
    } else if (!cizimVar) {
      // yer tutucu arka plan dikeyde dönmez: iki göz yan yana ortada; fritöz ikisini de örter
      F.cx = W / 2;
      F.cy = H * 0.5;
      F.w = Math.min(W * 0.82, 340);
      F.h = F.w / 1.52;
      KL.w = Math.min(112, W * 0.28);
      KL.h = KL.w * 1.35;
      KL.cx = W / 2;
      KL.cy = Math.min(H * 0.78, H - 200);
      TZ.x = W * 0.14 + 16;
      TZ.y = KL.cy - 40;
      KT.x = W * 0.86 - 16;
      KT.y = KL.cy - 40;
    } else {
      F.cx = W / 2;
      F.cy = Math.max(H * 0.3, rafAlt + 120);
      F.w = Math.min(W * 0.8, 340);
      F.h = F.w / 1.52;
      KL.w = Math.min(118, W * 0.3);
      KL.h = KL.w * 1.35;
      KL.cx = W / 2;
      KL.cy = H * 0.68;
      TZ.x = W * 0.14 + 20;
      TZ.y = KL.cy - 50;
      KT.x = W * 0.86 - 20;
      KT.y = KL.cy - 50;
    }
    altlik.style.cssText = `left:${KL.cx - KL.w * 1.05}px;top:${KL.cy - KL.w * 1.05}px;width:${KL.w * 2.1}px;height:${KL.w * 2.1}px`;
    fritoz.style.cssText = `left:${F.cx - F.w / 2}px;top:${F.cy - F.h / 2}px;width:${F.w}px;height:${F.h}px`;
    kulah.style.cssText = `left:${KL.cx - KL.w / 2}px;top:${KL.cy - KL.h / 2}px;width:${KL.w}px;height:${KL.h}px`;
    sepetEl.style.width = `${F.w * 0.74}px`;
    sepetEl.style.height = `${F.h * 0.7}px`;
    if (!tutuluyor) {
      tuzluk.style.transform = `translate(${TZ.x - 32}px,${TZ.y - 36}px)`;
      ketcap.style.transform = `translate(${KT.x - 32}px,${KT.y - 40}px)`;
    }
    if (durum !== 'tasiniyor') sepetKonum(durum === 'yagda' ? F.cx : F.cx, durum === 'yagda' ? F.cy : F.cy - F.h * 0.2);
    kulahCiz();
  }
  function sepetKonum(x: number, y: number, kay = false) {
    sx = x;
    sy = y;
    const w = F.w * 0.74;
    const hh = F.h * 0.7;
    const t = `translate(${x - w / 2}px,${y - hh / 2}px)`;
    if (kay) konumaKay(sepetEl, t, 160);
    else sepetEl.style.transform = t;
  }
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => yerlestir()) : null;
  ro?.observe(kok);

  // ------------------------------------------------------------ parçalar
  const parcaElleri = new Map<Parca, HTMLElement>();
  function parcaEl(x: Parca): HTMLElement {
    let el = parcaElleri.get(x);
    if (el) return el;
    const kesim = kesimi(x.m);
    const u = resim(`yiyecek/${x.m}-${kesim === 'serit' ? 'halka' : kesim}`);
    el = h('i.rs-kzr-parca', { 'data-malzeme': x.m, 'data-kesim': kesim }, u ? h('img', { src: u, alt: '', draggable: 'false' }) : null);
    el.style.setProperty('--renk', RENK[x.m]?.[1] ?? '#f4de9c');
    parcaElleri.set(x, el);
    return el;
  }
  function renkCiz() {
    for (const [x, el] of parcaElleri) el.dataset.pisme = pismeAdi(x.p);
  }
  function sepetCiz() {
    sepetIc.replaceChildren();
    sepet.forEach((x, i) => {
      const el = parcaEl(x);
      // altın açı yayılımı (sepetin içinde); üst katman biraz kayık ve önde
      const a = i * 2.39996;
      const rr = 34 * Math.sqrt((i + 0.5) / Math.max(6, sepet.length));
      el.style.left = `${50 + Math.cos(a) * rr * 1.25}%`;
      el.style.top = `${48 + Math.sin(a) * rr}%`;
      el.dataset.ust = x.ust ? '1' : '';
      sepetIc.append(el);
    });
    renkCiz();
  }
  function kulahCiz(yelpaze = false) {
    kulahIc.replaceChildren();
    const n = kulahta.length;
    kulahta.forEach((x, i) => {
      const el = parcaEl(x);
      const k = n > 1 ? i / (n - 1) : 0.5;
      const yay = yelpaze ? 1.25 : 0.8;
      el.style.left = `${50 + (k - 0.5) * 70 * yay}%`;
      el.style.top = `${(yelpaze ? 30 : 38) + Math.abs(k - 0.5) * (yelpaze ? 34 : 22) + (i % 3) * 4}%`;
      el.dataset.ust = '';
      kulahIc.append(el);
    });
    ketcapKat.replaceChildren(
      ...ketcapNokta.map((p) => {
        const d = h('i.rs-kzr-ketcap-nokta');
        d.style.left = `${p.x}%`;
        d.style.top = `${p.y}%`;
        return d;
      }),
    );
    renkCiz();
  }

  function rafaDokun(m: Malzeme, btn: HTMLElement) {
    if (odulde) return;
    ezil(btn, 1.2);
    b.dokunsal(8);
    void b.mino.soyle((M.ad as Record<string, string>)[m] ?? `${MALZEME_ADI[m]}!`);
    if (sepet.length >= SEPET_EN_COK) {
      kipirda(sepetEl, 5, 300);
      b.ses.cal('tok', { perde: 1.2 });
      return;
    }
    if (m === 'patates' && tepsidenPatates.length) {
      const u = tepsidenPatates.shift()!;
      kullanilan.push(u.id);
    }
    const yeni = avucEkle(sepet, m, yas);
    sepetCiz();
    // raftan sepete bir avuç uçar (aynı karede)
    const br = btn.getBoundingClientRect();
    const kr = kok.getBoundingClientRect();
    const bx = br.left - kr.left + br.width / 2;
    const by = br.top - kr.top + br.height / 2;
    yeni.forEach((x, i) => {
      const el = parcaEl(x);
      const er = el.getBoundingClientRect();
      const ex = er.left - kr.left + er.width / 2;
      const ey = er.top - kr.top + er.height / 2;
      try {
        el.animate(
          [
            { translate: `${bx - ex}px ${by - ey}px`, opacity: 0.4 },
            { translate: `${(bx - ex) / 2}px ${(by - ey) / 2 - 40}px`, opacity: 1, offset: 0.5 },
            { translate: '0 0' },
          ],
          { duration: sureMs(300 + i * 40), easing: 'ease-in' },
        );
      } catch {
        /* yok say */
      }
    });
    window.setTimeout(() => {
      if (kapandi) return;
      b.ses.cal(durum === 'yagda' ? 'ciz' : 'tok', { perde: 1.4, guc: 0.5 });
      if (durum === 'yagda') kopuk(0.6);
    }, sureMs(300));
    olay('sepet');
    ipucuGuncelle();
  }

  // ------------------------------------------------------------ yağ: dal, salla, kaldır
  let cizDongu: { guc(g: number): void; dur(): void } | null = null;
  let altinDendi = false;
  let citirDendi = false;
  let cizzDendi = false;
  function kopuk(guc = 1) {
    sac(efektKat, sx, sy, 'kopuk', 'rgba(255,250,225,0.95)', Math.round(8 * guc), { yay: 6.3, guc: 0.6 * guc, boy: 14 });
    sac(efektKat, sx, sy - F.h * 0.2, 'buhar', '#fff', Math.round(3 * guc), { yon: -Math.PI / 2, yay: 1.2 });
  }
  function dal() {
    if (durum === 'yagda') return;
    durum = 'yagda';
    sepetEl.dataset.durum = 'yagda';
    kok.classList.add('rs-yagda');
    sepetKonum(F.cx, F.cy, true);
    try {
      sepetEl.animate([{ scale: '1.08' }, { scale: '0.96 1.03', offset: 0.6 }, { scale: '1' }], { duration: sureMs(260), easing: 'ease-out' });
    } catch {
      /* yok say */
    }
    b.ses.cal('ciz', { perde: 1, guc: 1 });
    hisir(0, 0.45, 5200, 2600, 0.12, 'highpass');
    b.dokunsal(16);
    kopuk(sepet.length ? 1.2 : 0.4);
    cizDongu?.dur();
    cizDongu = b.ses.dongu('ciz');
    cizDongu.guc(sepet.length ? 0.9 : 0.3);
    if (sepet.length && !cizzDendi) {
      cizzDendi = true;
      void b.mino.soyle(M.cizz);
    }
    olay('dal');
    ipucuGuncelle();
  }
  function kaldir() {
    if (durum !== 'yagda') return;
    durum = 'havada';
    sepetEl.dataset.durum = 'havada';
    kok.classList.remove('rs-yagda');
    cizDongu?.dur();
    cizDongu = null;
    sepetKonum(F.cx, F.cy - F.h * 0.2, true);
    b.ses.cal('pof', { perde: 1.5, guc: 0.4 });
    // süzülür: yağ damlaları
    sac(efektKat, sx, sy + F.h * 0.2, 'yag', '#f2c14e', 6, { yon: Math.PI / 2, yay: 0.8, guc: 0.6 });
    olay('kaldir');
    ipucuGuncelle();
  }
  let sonYon = 0;
  let sallaYol = 0;
  function sallandi() {
    salla(sepet, r);
    sepetCiz();
    sepet.forEach((x, i) => {
      const el = parcaElleri.get(x);
      if (el && i % 2 === 0) hopla(el, 8 + r() * 8, 220);
    });
    b.ses.cal('kitir', { perde: 1.1 + r() * 0.3, guc: 0.45 });
    b.dokunsal(8);
    sac(efektKat, sx + (r() - 0.5) * F.w * 0.4, sy - F.h * 0.25, 'yag', '#f7d36b', 2, { yon: -Math.PI / 2, yay: 1.4, guc: 0.6 });
    olay('salla');
  }

  // sepet: sürükle / dokun
  let tutuluyor = false;
  let x0 = 0;
  let y0 = 0;
  surukle(sepetEl, kok, {
    basla(x, y) {
      if (odulde) return false;
      x0 = x;
      y0 = y;
      sallaYol = 0;
      sonYon = 0;
      // aynı karede: sepet tutulur (kalkar)
      sepetEl.classList.add('rs-tutuldu');
      b.dokunsal(6);
      return true;
    },
    hareket(x, y, hz) {
      if (durum === 'yagda') {
        if (y - y0 < -Math.max(46, F.h * 0.28)) {
          kaldir();
          durum = 'tasiniyor';
          sepetEl.dataset.durum = 'tasiniyor';
        } else {
          // salla: yağın içinde sağa sola
          const dx = Math.max(-F.w * 0.1, Math.min(F.w * 0.1, x - x0));
          sepetKonum(F.cx + dx, F.cy);
          const yon = Math.sign(hz.vx);
          sallaYol += Math.abs(hz.vx) * 16;
          if (yon && sonYon && yon !== sonYon && Math.abs(hz.vx) > 0.25 && sallaYol > 18) {
            sallaYol = 0;
            sallandi();
          }
          if (yon) sonYon = yon;
          return;
        }
      }
      durum = 'tasiniyor';
      sepetEl.dataset.durum = 'tasiniyor';
      sepetKonum(x, y - 14);
      ipucuGuncelle();
    },
    birak(x, y) {
      sepetEl.classList.remove('rs-tutuldu');
      if (durum === 'yagda') {
        sepetKonum(F.cx, F.cy, true);
        return;
      }
      if (Math.abs(x - KL.cx) < KL.w * 0.9 && Math.abs(y - KL.cy) < KL.h * 0.75) {
        dok();
        durum = 'havada';
        sepetEl.dataset.durum = 'havada';
        sepetKonum(F.cx, F.cy - F.h * 0.2, true);
      } else if (Math.abs(x - F.cx) < F.w / 2 && Math.abs(y - F.cy) < F.h / 2 + 10) {
        dal();
      } else {
        durum = 'havada';
        sepetEl.dataset.durum = 'havada';
        sepetKonum(F.cx, F.cy - F.h * 0.2, true);
      }
      ipucuGuncelle();
    },
    dokun() {
      sepetEl.classList.remove('rs-tutuldu');
      if (durum === 'yagda') kaldir();
      else dal();
    },
  });

  function dok() {
    if (!sepet.length) {
      kipirda(kulah, 4, 260);
      b.ses.cal('tok');
      return;
    }
    const kr = kok.getBoundingClientRect();
    const tasinan = sepet.splice(0, sepet.length);
    const once = new Map(tasinan.map((x) => [x, parcaElleri.get(x)!.getBoundingClientRect()]));
    kulahta.push(...tasinan);
    sepetCiz();
    kulahCiz();
    for (const x of tasinan) {
      const el = parcaElleri.get(x)!;
      const a = once.get(x)!;
      const n = el.getBoundingClientRect();
      try {
        el.animate([{ translate: `${a.left - n.left}px ${a.top - n.top}px` }, { translate: `${(a.left - n.left) / 2}px ${(a.top - n.top) / 2 - 40}px`, offset: 0.5 }, { translate: '0 0' }], { duration: sureMs(380), easing: 'ease-in' });
      } catch {
        /* yok say */
      }
    }
    void kr;
    window.setTimeout(() => {
      if (kapandi) return;
      b.ses.cal('kitir', { perde: 1.3 });
      ezil(kulah, 0.8);
    }, sureMs(360));
    olay('kulah');
    if (!hopladi && kulahta.length >= 4 && kulahta.filter((x) => x.p >= 1).length >= 3) {
      hopladi = true;
      window.setTimeout(() => !kapandi && b.tepsi.hopla(), sureMs(500));
    }
    ipucuGuncelle();
  }
  let hopladi = false;

  // ------------------------------------------------------------ pişme zamanlayıcısı
  let son = performance.now();
  const zaman = window.setInterval(() => {
    const t = performance.now();
    const dt = (t - son) / 1000;
    son = t;
    if (durum !== 'yagda' || !sepet.length || odulde) return;
    sepetPis(sepet, dt, yas);
    renkCiz();
    const c = cogunluk(sepet);
    cizDongu?.guc(c === 'altin' || c === 'citir' ? 0.55 : 0.9);
    if (!altinDendi && (c === 'altin' || c === 'citir')) {
      altinDendi = true;
      parilti(efektKat, sx, sy, 7, F.w * 0.3);
      b.ses.cal('ting');
      sac(efektKat, sx - 20, sy - F.h * 0.25, 'buhar', '#fff', 2, { yon: -Math.PI / 2, yay: 0.6 });
      void b.mino.soyle(M.altin);
      olay('altin');
      ipucuGuncelle();
    }
    if (!citirDendi && c === 'citir') {
      citirDendi = true;
      void b.mino.soyle(M.citir);
      olay('citir');
    }
  }, 100);

  // ------------------------------------------------------------ tuzluk ve ketçap
  const kulahUstunde = (x: number, y: number) => Math.abs(x - KL.cx) < KL.w * 0.85 && y > KL.cy - KL.h * 0.95 && y < KL.cy + KL.h * 0.2;
  let tuzYol = 0;
  let bulutOldu = false;
  function tuzSerp(x: number, y: number) {
    tuz = tuzEkle(tuz, yas);
    b.ses.cal('tik', { perde: 1.6 + r() * 0.3, guc: 0.5 });
    hisir(0, 0.08, 6000, 4000, 0.05, 'highpass');
    sac(efektKat, x, y + 26, 'un', '#ffffff', 6, { yon: Math.PI / 2, yay: 0.7, guc: 0.5, boy: 4 });
    olay('tuz');
    if (!bulutOldu && tuz >= TUZ.bulut) void tuzBulutu();
  }
  async function tuzBulutu() {
    bulutOldu = true;
    olay('tuz-bulutu');
    const mr = b.mino.el.getBoundingClientRect();
    const kr = kok.getBoundingClientRect();
    const hx = mr.left - kr.left + mr.width * 0.5;
    const hy = mr.top - kr.top + mr.height * 0.42;
    const bulut = h('i.rs-kzr-bulut');
    bulut.style.transform = `translate(${KL.cx}px,${KL.cy - KL.h * 0.5}px)`;
    efektKat.append(bulut);
    hisir(0, 0.6, 2000, 6000, 0.08);
    await ucur(bulut, hx - KL.cx, hy - (KL.cy - KL.h * 0.5), 900, -60);
    if (kapandi) return;
    bulut.classList.add('rs-dagil');
    hapsu();
    void b.mino.tepki('hapsir', 1000);
    await bekle(600);
    bulut.remove();
    if (!kapandi) void b.mino.soyle(M.tuz);
  }
  let ketcapSon = 0;
  function ketcapKoy(x: number, y: number) {
    const kr = kulah.getBoundingClientRect();
    const k = kok.getBoundingClientRect();
    const px = ((x - (kr.left - k.left)) / kr.width) * 100;
    const py = ((y - (kr.top - k.top)) / kr.height) * 100;
    ketcapNokta.push({ x: Math.max(14, Math.min(86, px)), y: Math.max(14, Math.min(48, py)) });
    kulahCiz();
    const son = ketcapKat.lastElementChild as HTMLElement | null;
    if (son) ezil(son, 1.4);
    b.ses.cal('vicik', { perde: 1.2 + r() * 0.2, guc: 0.6 });
    b.dokunsal(8);
    if (ketcapNokta.length === 1) void b.mino.soyle(M.ketcap);
    olay('ketcap');
  }
  function aracKur(el: HTMLElement, ev: { x: number; y: number }, ne: 'tuz' | 'ketcap') {
    surukle(el, kok, {
      basla(x, y) {
        if (odulde) return false;
        tutuluyor = true;
        el.classList.add('rs-tutuldu');
        el.style.transform = `translate(${x - 32}px,${y - 86}px)`;
        tuzYol = 0;
        return true;
      },
      hareket(x, y, hz) {
        el.style.transform = `translate(${x - 32}px,${y - 86}px)`;
        const ucY = y - 60;
        if (!kulahUstunde(x, ucY)) return;
        if (ne === 'tuz') {
          tuzYol += hz.v * 16;
          if (tuzYol > 34) {
            tuzYol = 0;
            ezil(el, 1);
            tuzSerp(x, ucY);
          }
        } else if (performance.now() - ketcapSon > 320) {
          ketcapSon = performance.now();
          ezil(el, 1.2);
          ketcapKoy(x, ucY + 24);
        }
      },
      birak() {
        tutuluyor = false;
        el.classList.remove('rs-tutuldu');
        konumaKay(el, `translate(${ev.x - 32}px,${ev.y - (ne === 'tuz' ? 36 : 40)}px)`);
        ipucuGuncelle();
      },
      dokun() {
        tutuluyor = false;
        el.classList.remove('rs-tutuldu');
        ezil(el, 1.2);
        if (ne === 'tuz') tuzSerp(KL.cx + (r() - 0.5) * KL.w * 0.4, KL.cy - KL.h * 0.5);
        else ketcapKoy(KL.cx + (r() - 0.5) * KL.w * 0.5, KL.cy - KL.h * 0.3);
        konumaKay(el, `translate(${ev.x - 32}px,${ev.y - (ne === 'tuz' ? 36 : 40)}px)`);
      },
    });
  }
  aracKur(tuzluk, TZ, 'tuz');
  aracKur(ketcap, KT, 'ketcap');

  // ------------------------------------------------------------ ipucu
  function ipucuGuncelle() {
    if (odulde) return b.ipucu.hedef(null);
    if (durum === 'yagda') {
      const c = cogunluk(sepet);
      if (yas === 'buyuk' && (c === 'altin' || c === 'citir') && sepet.some((x) => x.ust && x.p < 1.6)) return b.ipucu.hedef({ el: () => sepetEl, soz: M.ipucu.ust, hareket: 'kaydir-yatay' });
      if (c === 'altin' || c === 'citir') return b.ipucu.hedef({ el: () => sepetEl, soz: M.ipucu.pisiyor, hareket: 'surukle', nereye: () => kulah });
      return b.ipucu.hedef({ el: () => sepetEl, soz: M.ipucu.pisiyor, hareket: 'kaydir-yatay' });
    }
    if (sepet.length) {
      if (sepet.every((x) => x.p < 1)) return b.ipucu.hedef({ el: () => sepetEl, soz: M.ipucu.cig, hareket: 'surukle', nereye: () => fritoz });
      return b.ipucu.hedef({ el: () => sepetEl, soz: M.ipucu.kulah, hareket: 'surukle', nereye: () => kulah });
    }
    if (kulahta.length) return b.ipucu.hedef({ el: () => b.tepsi.el, soz: M.ipucu.bitti, hareket: 'dokun' });
    b.ipucu.hedef({ el: () => raf.firstElementChild as HTMLElement | null, soz: M.ipucu.bos, hareket: 'dokun' });
  }

  // ------------------------------------------------------------ tepsi: ödül ve ürün
  let odulde = false;
  let kapandi = false;
  let coz: (u: Urun[]) => void = () => undefined;
  const bitti = new Promise<Urun[]>((rr) => (coz = rr));
  b.tepsi.dinle(() => {
    if (odulde) return;
    if (!sepet.length && !kulahta.length) return coz([]);
    odulde = true;
    ipucuGuncelle();
    void odul();
  });

  async function odul() {
    olay('odul');
    if (durum === 'yagda') kaldir();
    if (sepet.length) {
      dok();
      await bekle(420);
    }
    // külahtaki patatesler kıtır kıtır zıplar, yelpaze olur
    kulahCiz(true);
    let i = 0;
    for (const x of kulahta) {
      const el = parcaElleri.get(x);
      if (el && i < 12) {
        hopla(el, 12, 240);
        b.ses.cal('kitir', { perde: 1 + i * 0.04, guc: 0.5 });
        await bekle(70);
      }
      i++;
    }
    parilti(efektKat, KL.cx, KL.cy - KL.h * 0.4, 6, KL.w * 0.6);
    odulEzgi([77, 81, 84, 89], 0.09);
    nota(72, 0, 0.1, 'triangle', 0.06);
    await bekle(520);
    const tr = b.tepsi.el.getBoundingClientRect();
    const kr = kok.getBoundingClientRect();
    await ucur(kulah, tr.left - kr.left + tr.width / 2 - KL.cx, tr.top - kr.top + tr.height / 2 - KL.cy, 420, -40);
    const ozellik = kizartmaOzeti(kulahta, tuz, ketcapNokta.length);
    const patates = (ozellik.malzemeler.patates?.adet ?? 0) * 2 >= kulahta.length;
    const liste = kulahta.map((x) => ({ m: x.m, p: x.p }));
    const noktalar = ketcapNokta.slice();
    coz([{ id: urunId('kizartma'), tur: 'kizartma', yemek: patates ? 'patates' : undefined, servis: true, kullanilan: kullanilan.slice(), ozellik, gorsel: () => kulahGorsel(liste, noktalar) }]);
  }

  (window as unknown as { __rsKizart?: unknown }).__rsKizart = {
    olaylar,
    durum: () => ({
      raf: raftakiler.slice(),
      durum,
      sepet: sepet.map((x) => ({ m: x.m, p: +x.p.toFixed(2), ust: x.ust })),
      kulah: kulahta.map((x) => ({ m: x.m, p: +x.p.toFixed(2) })),
      tuz,
      ketcap: ketcapNokta.length,
      fritoz: { ...F },
      kulahYer: { ...KL },
      tuzluk: { ...TZ },
      ketcapYer: { ...KT },
    }),
    pisir: (sn: number) => {
      sepetPis(sepet, sn, yas);
      renkCiz();
    },
  };
  sepetCiz();
  yerlestir();
  if (onceki?.yagda) dal();
  ipucuGuncelle();

  return {
    bitti,
    arkaPlanda(): ArkaIs | null {
      if (odulde || (!sepet.length && !kulahta.length)) return null;
      const d: KizartDurum = { sepet: sepet.map((x) => ({ ...x })), kulah: kulahta.map((x) => ({ ...x })), tuz, ketcap: ketcapNokta.slice(), yagda: durum === 'yagda', t: performance.now() };
      return {
        durum: d,
        isaret: () => {
          if (!d.yagda || !d.sepet.length) return { ses: 'yok', buhar: false };
          const kopya = d.sepet.map((x) => ({ ...x }));
          sepetPis(kopya, (performance.now() - d.t) / 1000, yas);
          return { ses: 'ciz', buhar: true, pisme: cogunluk(kopya) };
        },
      };
    },
    kapat() {
      kapandi = true;
      ro?.disconnect();
      clearInterval(zaman);
      cizDongu?.dur();
      kok.remove();
    },
  };
}

/** Tepside ve masada küçük hâli: külahta kızartma (kutusunu doldurur) */
export function kulahGorsel(liste: { m: Malzeme; p: number }[], ketcap: { x: number; y: number }[]): HTMLElement {
  const ic = h('div.rs-kzr-kulah-ic');
  const n = Math.min(liste.length, 12);
  liste.slice(0, 12).forEach((x, i) => {
    const kesim = kesimi(x.m);
    const u = resim(`yiyecek/${x.m}-${kesim === 'serit' ? 'halka' : kesim}`);
    const el = h('i.rs-kzr-parca', { 'data-malzeme': x.m, 'data-kesim': kesim, 'data-pisme': pismeAdi(x.p) }, u ? h('img', { src: u, alt: '', draggable: 'false' }) : null);
    el.style.setProperty('--renk', RENK[x.m]?.[1] ?? '#f4de9c');
    const k = n > 1 ? i / (n - 1) : 0.5;
    el.style.left = `${50 + (k - 0.5) * 80}%`;
    el.style.top = `${32 + Math.abs(k - 0.5) * 30}%`;
    ic.append(el);
  });
  const kat = h('div.rs-kzr-ketcap-kat', {}, ...ketcap.map((p) => {
    const d = h('i.rs-kzr-ketcap-nokta');
    d.style.left = `${p.x}%`;
    d.style.top = `${p.y}%`;
    return d;
  }));
  return h('div.rs-kzr-urun', {}, h('div.rs-kzr-kulah', {}, ic, h('i.rs-kzr-kulah-kagit'), kat));
}
