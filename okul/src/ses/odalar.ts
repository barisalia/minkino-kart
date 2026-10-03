/**
 * Ses Kulesi odaları (Ünite 1): her harf bir oda (A N E T İ L), her oda 5 etkinlik (4-5 dk), oda sonunda çıkartma.
 *  1. Sesin odası: Mino sesi söyler; büyük-küçük harf + 2 resim. Harfe dokun: ses + zıplama; resme dokun: uzatılmış kelime.
 *  2. İlk ses avı: 3 resim, bu sesle başlayana dokun. Yanlışa ceza yok: Mino kelimeyi söyler, Kino tatlı bir şaka yapar.
 *  3. Harfi izle: önce büyük, sonra küçük harf; yeşil noktadan, oku izleyerek (bağışlayıcı takip: harf-yolu.ts).
 *  4. Hangisi farklı?: 4 harften farklı olana dokun (önce büyük, sonra küçük).
 *  5. Sesli kutu: bu sesle başlayanları harfli sepete, ötekileri öbür sepete sürükle (okul/src/surukle.ts).
 * Kino her etkinlikte komik bir hata yapar, çocuk düzeltir. Çocuk yarıda çıkarsa kaldığı etkinlikten devam eder (oda-kayit.ts).
 */
import './ses.css';
import { efekt } from '../../../src/audio/ses';
import type { Soylenecek } from '../../../src/audio/konusma';
import { h, sure, TEST_MODU } from '../../../src/ui/dom';
import { IKON } from '../../../src/ui/ikonlar';
import { gorsel, kus, LOKOMOTIF, ton, vagon } from '../cizim';
import { Dallar, kusBoyu } from '../dal';
import { AZ_HAREKET, oynat } from '../efekt';
import { etkinlikKaydet } from '../etkinlik';
import { Ipucu, type Sahne } from '../sahne';
import { ses } from '../sesler';
import { geriGonder, hedefliSurukle } from '../surukle';
import { HARF_YOLU, izBaslat, izGecis, izOran, izToleransi, kinoYolu, yolD, type Iz } from './harf-yolu';
import { avSozu, avTurlari, farkliTurlari, HARFLER, kelime, kutuTuru, ODA_ADIMLARI, odaId, odaSesiSozu, ORTAK, SES_ICERIK as S, sesleBaslar, type Harf } from './harfler';
import { odaAdimi, odaAdimiYaz, ODA_ANAHTARI } from './oda-kayit';
import { esyaAdres, kahramanEl, kuleKatAdres, pozla, pozVar, resimAdres, resimEl } from './resim';
import type { Nokta } from '../../../canlan/src/resimler';

const M = S.mino;
const K = S.kino;
const NS = 'http://www.w3.org/2000/svg';
const q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();
/** test ya da gösterim (?onizleme=1): kısayollar (&sesadim, &sestur) ve izleme yolu öznitelikte */
const GOSTERIM = TEST_MODU || q.has('onizleme');

// ---------------------------------------------------------------- ortak parçalar
/** Rengin koyu tonu (harfin yumuşak 3B gölgesi; siyah kontur yok) */
export function koyu(hex: string, k = 0.68): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.round(((n >> 16) & 255) * k);
  const g = Math.round(((n >> 8) & 255) * k);
  const b = Math.round((n & 255) * k);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
export const harfStil = (hf: Harf) => `--r:${hf.renk};--rk:${koyu(hf.renk)}`;
const harfYazi = (t: string, sinif = '') => h(`span.ok-ses-harf${sinif}`, { 'aria-hidden': 'true' }, t);

/** Odanın çıkartması / durak simgesi: büyük harf ve odanın resmi (A'lı arı) */
export function odaSimgesi(hf: Harf): string {
  const r = resimAdres(hf.oda[0]);
  return `<span class="ok-ses-simge" style="${harfStil(hf)}"><b>${hf.buyuk}</b>${r ? `<img class="ok-resim" src="${r}" alt="" draggable="false">` : ''}</span>`;
}

/**
 * Dokununca söyler (sıradaki tek söz): konuşma sürerken dokunulursa o bitince söylenir, üst üste birikmez.
 * Görsel tepki (zıplama) her dokunuşta hemen olur.
 */
function dinleyici(s: Sahne) {
  let sirada = false;
  return (soz: Soylenecek) => {
    if (sirada || s.kapandi()) return;
    sirada = true;
    void s.soyle(soz).finally(() => (sirada = false));
  };
}

/** Bekleme ipucu: çocuk ms boyunca bir şey yapmazsa fn (parlat, el gezdir); her hareket sayacı sıfırlar */
function bosBekleme(s: Sahne, ms: number, fn: () => void) {
  let z = 0;
  const kur = () => {
    clearTimeout(z);
    if (!s.kapandi()) z = window.setTimeout(() => (fn(), kur()), TEST_MODU ? ms * 2 : ms);
  };
  s.kapaninca(() => clearTimeout(z));
  return { kur, dur: () => clearTimeout(z) };
}

function resimKarti(k: string, hf: Harf, i: number): HTMLButtonElement {
  return h('button.ok-ses-kart', { type: 'button', 'data-kelime': k, 'aria-label': kelime(k).ad, style: `--i:${i}` }, resimEl(k, hf.renk));
}

/** Harfin küçük levhası (oyun alanının üstünde): dokununca sesi; doğru resimler buna uçar */
function sesLevhasi(s: Sahne, hf: Harf, dinlet: (soz: Soylenecek) => void): HTMLButtonElement {
  const b = h('button.ok-ses-levha.ok-ses-levha-kucuk', { type: 'button', style: harfStil(hf), 'aria-label': `${hf.buyuk} sesi` }, harfYazi(hf.buyuk), harfYazi(hf.kucuk, '.ok-ses-kucuk'), h('i.ok-ses-hoparlor', { html: IKON.hoparlor }));
  b.addEventListener('click', () => {
    if (s.kapandi()) return;
    oynat(b, 'ok-ses-zipla');
    dinlet(hf.ses);
  });
  return b;
}

const sec = <T>(a: T[], i: number) => a[i % a.length];

// ---------------------------------------------------------------- 1 · Sesin odası
async function tanis(s: Sahne, hf: Harf) {
  const dinlet = dinleyici(s);
  const levha = h('button.ok-ses-levha', { type: 'button', style: harfStil(hf), 'aria-label': hf.buyuk, 'data-hedef': 'harf' }, harfYazi(hf.buyuk), harfYazi(hf.kucuk, '.ok-ses-kucuk'));
  const kartlar = hf.oda.map((k, i) => resimKarti(k, hf, i));
  // odanın kahramanı (A: arı) ilk kartta; uçarak gelir
  const kahraman = kahramanEl(hf.oda[0], hf.renk);
  kartlar[0].replaceChildren(kahraman);
  s.alan.replaceChildren(h('div.ok-ses-tanis', {}, kartlar[0], levha, kartlar[1]));
  s.secim.replaceChildren();
  const dokunulan = new Set<HTMLElement>();
  let giris = true;
  let ilkHarf = true;
  let coz = () => {};
  const tamam = new Promise<void>((r) => (coz = r));
  const sira = () => [levha, ...kartlar].find((e) => !dokunulan.has(e));
  const ipucu = bosBekleme(s, 6000, () => {
    if (giris) return;
    const e = sira();
    e?.classList.add('ok-ipucu');
    if (e) oynat(e, 'ok-ses-zipla');
  });
  const isaretle = (e: HTMLElement) => {
    e.classList.remove('ok-ipucu');
    if (!dokunulan.has(e)) {
      dokunulan.add(e);
      e.classList.add('ok-ses-dinlendi');
    }
    ipucu.kur();
    if (!sira() && !giris) coz();
  };
  levha.addEventListener('click', () => {
    if (s.kapandi()) return;
    oynat(levha, 'ok-ses-zipla');
    ses.pit(3);
    if (!giris && ilkHarf) {
      // ilk dokunuş: "Aaa! Sen de söyle!" (herhangi bir ses katılım sayılır; dinlenmez), sonra resimler
      ilkHarf = false;
      void (async () => {
        await s.soyle([hf.ses, M.sen_de]);
        await s.bekle(900);
        kartlar.forEach((k) => !dokunulan.has(k) && k.classList.add('ok-ses-davet'));
        if (kartlar.some((k) => !dokunulan.has(k))) await s.soyle(M.resim_dokun);
        isaretle(levha);
      })();
      return;
    }
    dinlet(hf.ses);
    if (giris) dokunulan.add(levha);
    else if (!ilkHarf) isaretle(levha);
  });
  for (const k of kartlar) {
    k.addEventListener('click', () => {
      if (s.kapandi()) return;
      oynat(k, 'ok-ses-zipla');
      efekt.dokunma();
      k.classList.remove('ok-ses-davet');
      if (k === kartlar[0]) pozla(kahraman, 'mutlu', 1100);
      dinlet(kelime(k.dataset.kelime!).uzun);
      if (giris) dokunulan.add(k);
      else isaretle(k);
    });
  }

  s.adim('tanis');
  oynat(levha, 'ok-ses-gel');
  void kahramanGelsin(s, hf, kahraman);
  await s.soyle(odaSesiSozu(hf));
  oynat(levha, 'ok-ses-zipla');
  // Kino'nun hatası: odanın sesini kendi sesi sanır
  await s.kinoHata({
    kino: K.oda,
    poz: 'kalk',
    mino: M.kino_ses,
    sonra: async () => {
      oynat(levha, 'ok-ses-zipla');
      await s.soyle(hf.ses);
    },
  });
  giris = false;
  ilkHarf = !dokunulan.has(levha);
  dokunulan.delete(levha);
  levha.classList.add('ok-ses-davet');
  await s.soyle(M.harf_dokun);
  ipucu.kur();
  s.adim('tanis-dokun');
  await tamam;
  ipucu.dur();
  levha.classList.remove('ok-ses-davet');
  await s.bekle(300);
  pozla(kahraman, 'mutlu', 1400);
  await s.ovgu(levha);
}

/** Kahraman ekranın kenarından uçarak kartına konar (konunca ezilip toparlanır) */
async function kahramanGelsin(s: Sahne, hf: Harf, kahraman: HTMLElement) {
  if (AZ_HAREKET) return;
  kahraman.style.visibility = 'hidden';
  await s.bekle(250);
  const hedef = s.efekt.merkez(kahraman);
  ses.kanat();
  await s.efekt.ucur(h('div.ok-ses-ucan', {}, kahramanEl(hf.oda[0], hf.renk, 'ucan')), [-80, hedef[1] - 120], hedef, { ms: 1150, kavis: -110, boy0: 0.7, boy1: 1, don: 8 });
  kahraman.style.visibility = '';
  oynat(kahraman, 'ok-ses-kon');
  ses.pit(2);
}

// ---------------------------------------------------------------- 2 · İlk ses avı
/**
 * Her turda başka bir sahne (aynı üç kart üç kez değil): 1) resimler hediye kutularından uzanır, 2) oyuncak trenin vagonlarında
 * gelir, 3) balonlara bağlı süzülür. Kartlar aynı düğmeler; sahne yalnız yerleşim ve canlılık.
 */
function avSahnesi(t: number, kartlar: HTMLButtonElement[]): HTMLElement {
  const tur = (['hediye', 'tren', 'balon'] as const)[t % 3];
  if (tur === 'hediye') {
    const kutu = ['film/esya/hediye-kutusu', 'renkler/hediye', 'film/esya/hediye-kutusu'];
    return h(
      'div.ok-ses-hediyeler',
      { 'data-sahne': tur },
      ...kartlar.map((k, i) => h('div.ok-ses-hediye', { style: `--i:${i};${i === 2 ? ton(4) : ''}` }, k, h('img.ok-ses-hediye-resim.ok-tonlu', { src: esyaAdres(kutu[i]), alt: '', draggable: 'false' }))),
    );
  }
  if (tur === 'tren') {
    const vagonlar = kartlar.map((k, i) => h('div.ok-ses-vagon', { style: `--i:${i}` }, k, h('span.ok-ses-vagon-resim', { html: vagon(i + 1) })));
    return h('div.ok-ses-tren', { 'data-sahne': tur }, ...vagonlar, h('span.ok-ses-lokomotif', { html: LOKOMOTIF() }));
  }
  return h(
    'div.ok-ses-balonlar',
    { 'data-sahne': tur },
    ...kartlar.map((k, i) => h('div.ok-ses-balon', { style: `--i:${i};${ton(i * 2 + 1)}` }, h('img.ok-ses-balon-resim.ok-tonlu', { src: resimAdres('balon'), alt: '', draggable: 'false' }), k)),
  );
}

async function av(s: Sahne, hf: Harf) {
  const dinlet = dinleyici(s);
  const levha = sesLevhasi(s, hf, dinlet);
  // kahraman harfin yanında bekler; doğru resim bulununca sevinir
  const kahraman = kahramanEl(hf.oda[0], hf.renk);
  kahraman.addEventListener('click', () => (pozla(kahraman, 'mutlu', 900), oynat(kahraman, 'ok-ses-zipla')));
  const ust = h('div.ok-ses-av-ust', {}, levha, kahraman);
  const turlar = avTurlari(hf, s.rnd);
  let saka = 0;
  // gösterim / test: &sestur=2 ile doğrudan üçüncü sahne
  const ilkTur = GOSTERIM ? Math.min(turlar.length - 1, Number(q.get('sestur')) || 0) : 0;
  for (let t = ilkTur; t < turlar.length; t++) {
    if (s.kapandi()) return;
    const tur = turlar[t];
    const kartlar = tur.secenekler.map((k, i) => resimKarti(k, hf, i));
    const dogruEl = kartlar.find((k) => k.dataset.kelime === tur.dogru)!;
    if (TEST_MODU) dogruEl.dataset.dogru = '1';
    const sahne = avSahnesi(t, kartlar);
    s.alan.replaceChildren(h('div.ok-ses-av', { 'data-sahne': sahne.dataset.sahne }, ust, sahne));
    s.el.dataset.sesTur = String(t);
    if (sahne.dataset.sahne === 'tren') ses.duduk();
    await s.soyle(avSozu(hf));
    if (t === 0) {
      // Kino yanlış resmi seçer; Mino o kelimeyi söyler: başka bir sesle başlıyor
      const yanlis = kartlar.find((k) => k !== dogruEl)!;
      await s.kinoHata({
        kino: K.avi,
        once: () => {
          yanlis.classList.add('ok-ses-kino-sec');
          oynat(yanlis, 'ok-ses-zipla');
        },
        sonra: async () => {
          await s.soyle([kelime(yanlis.dataset.kelime!).uzun, M.baska]);
          yanlis.classList.remove('ok-ses-kino-sec');
          await s.soyle(avSozu(hf));
        },
      });
    }
    s.adim('av');
    const ipucu = new Ipucu(() => [dogruEl]);
    const bekle = bosBekleme(s, 9000, () => void s.soyle(avSozu(hf)));
    bekle.kur();
    let mesgul = false;
    await new Promise<void>((coz) => {
      for (const k of kartlar) {
        k.addEventListener('click', async () => {
          if (mesgul || s.kapandi()) return;
          mesgul = true;
          bekle.kur();
          const ad = k.dataset.kelime!;
          if (sesleBaslar(ad, hf)) {
            bekle.dur();
            ses.tik();
            k.classList.add('ok-dogru');
            kartlar.forEach((x) => x !== k && x.classList.add('ok-solgun'));
            k.closest('.ok-ses-balon')?.classList.add('ok-ses-uc');
            k.closest('.ok-ses-hediye')?.classList.add('ok-ses-acildi');
            // resim harfin levhasına uçar ("arı vızıldayarak harfin üstüne konar")
            if (!AZ_HAREKET) void s.efekt.ucur(h('div.ok-ses-ucan', {}, resimEl(ad, hf.renk)), s.efekt.merkez(k), s.efekt.merkez(levha), { ms: 650, boy1: 0.55, kavis: -80 }).then(() => oynat(levha, 'ok-ses-zipla'));
            pozla(kahraman, 'mutlu', 1500);
            oynat(kahraman, 'ok-ses-zipla');
            await s.soyle(kelime(ad).uzun);
            await s.ovgu(k);
            const tren = k.closest('.ok-ses-tren');
            if (tren) {
              ses.duduk();
              tren.classList.add('ok-ses-git');
              await s.bekle(700);
            }
            coz();
            return;
          }
          s.nazik(k);
          ipucu.yanlis();
          await s.soyle([kelime(ad).uzun, M.baska]);
          if (ipucu.sayi === 1) {
            s.kinoOynat('huy', 900);
            await s.soyle(sec(K.saka, saka++), 'kino');
          }
          await s.soyle(hf.ses);
          mesgul = false;
        });
      }
    });
    await s.bekle(250);
  }
  delete s.el.dataset.sesTur;
}

// ---------------------------------------------------------------- 3 · Harfi izle
function yolEl(d: string, sinif: string): SVGPathElement {
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', d);
  p.setAttribute('class', sinif);
  return p;
}
function daireEl(p: Nokta, r: number, sinif: string): SVGCircleElement {
  const c = document.createElementNS(NS, 'circle');
  c.setAttribute('cx', (p[0] * 100).toFixed(2));
  c.setAttribute('cy', (p[1] * 100).toFixed(2));
  c.setAttribute('r', String(r));
  c.setAttribute('class', sinif);
  return c;
}

/** El ipucu: bir çizginin üstünden kayar */
async function elGezdir(kagit: HTMLElement, cizgiler: Nokta[][], s: Sahne) {
  const el = h('div.ok-el', { html: IKON.el });
  kagit.append(el);
  for (const c of cizgiler) {
    if (s.kapandi()) break;
    const kare = c.length > 1 ? c.map((p) => ({ left: `${p[0] * 100}%`, top: `${p[1] * 100}%` })) : [{ left: `${c[0][0] * 100}%`, top: `${c[0][1] * 100}%` }, { left: `${c[0][0] * 100}%`, top: `${c[0][1] * 100 + 3}%` }];
    await el.animate(kare, { duration: sure(c.length > 1 ? 1100 : 500), easing: 'ease-in-out', fill: 'forwards' }).finished.catch(() => undefined);
  }
  el.remove();
}

async function izleTur(s: Sahne, hf: Harf, harf: string, ilk: boolean) {
  const yollar = HARF_YOLU[harf] ?? [];
  const tol = izToleransi(s.yas);
  const izler: Iz[] = yollar.map(izBaslat);
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('class', 'ok-ses-iz-svg');
  const g = (sinif: string) => {
    const e = document.createElementNS(NS, 'g');
    e.setAttribute('class', sinif);
    svg.append(e);
    return e;
  };
  const zemin = g('ok-ses-iz-zemin');
  const kesik = g('ok-ses-iz-kesik');
  const kinoG = g('ok-ses-iz-kino');
  const dolguG = g('ok-ses-iz-dolgu');
  const isaretG = g('ok-ses-iz-isaret');
  const dolgular = izler.map((iz) => {
    if (iz.n.length === 1) {
      zemin.append(daireEl(iz.n[0], 7, 'ok-ses-iz-nokta-zemin'));
      const d = daireEl(iz.n[0], 6.2, 'ok-ses-iz-nokta');
      dolguG.append(d);
      return d;
    }
    const d = yolD(iz.n);
    zemin.append(yolEl(d, ''));
    kesik.append(yolEl(d, ''));
    const p = yolEl(d, 'ok-ses-iz-cizgi');
    p.setAttribute('pathLength', '1');
    dolguG.append(p);
    return p;
  });
  const kalem = daireEl([0.5, 0.5], 4.5, 'ok-ses-iz-kalem');
  svg.append(kalem);
  // harf bitince kahramana dönüşür (A → arı) ve uçup gider
  const resimK = h('div.ok-ses-iz-resim', {}, kahramanEl(hf.oda[0], hf.renk, 'ucan'));
  const kagit = h('div.ok-ses-kagit', { style: harfStil(hf), 'data-harf': harf }, svg, resimK);
  if (GOSTERIM) {
    kagit.dataset.yol = JSON.stringify(yollar);
    (kagit as unknown as { __iz: Iz[] }).__iz = izler;
  }
  s.alan.replaceChildren(h('div.ok-ses-izle', {}, kagit));

  let aktif = 0;
  /** Başlangıç noktası (yeşil) ve yön oku: yalnız sıradaki çizgide */
  const isaretler = () => {
    isaretG.replaceChildren();
    const iz = izler[aktif];
    if (!iz) return;
    isaretG.append(daireEl(iz.n[0], 6, 'ok-ses-iz-bas'));
    if (iz.n.length > 1) {
      // yön oku: çizginin yanında (üstüne binmez), gövdeli ok; yeşil noktadan biraz ileride
      const k = Math.min(iz.n.length - 1, 12);
      const [x0, y0] = iz.n[0];
      const [x1, y1] = iz.n[k];
      const L = Math.hypot(x1 - x0, y1 - y0) || 1;
      const [ux, uy] = [(x1 - x0) / L, (y1 - y0) / L];
      // dik yön: harfin ortasına bakan yan tercih edilir
      let [px, py] = [-uy, ux];
      if ((0.5 - x1) * px + (0.5 - y1) * py < 0) [px, py] = [-px, -py];
      const cx = (x0 + x1) / 2 + px * 0.1;
      const cy = (y0 + y1) / 2 + py * 0.1;
      const a = (Math.atan2(uy, ux) * 180) / Math.PI;
      const ok = document.createElementNS(NS, 'g');
      ok.setAttribute('class', 'ok-ses-iz-ok');
      ok.setAttribute('transform', `translate(${(cx * 100).toFixed(2)} ${(cy * 100).toFixed(2)}) rotate(${a.toFixed(1)})`);
      ok.innerHTML = '<path class="ok-ses-iz-ok-dis" d="M-7 0 H5 M0 -5 L6 0 L0 5"/><path d="M-7 0 H5 M0 -5 L6 0 L0 5"/>';
      isaretG.append(ok);
    }
  };
  const ciz = (i: number) => {
    const e = dolgular[i];
    const o = izOran(izler[i]);
    if (e instanceof SVGPathElement) {
      e.style.strokeDasharray = '1 1';
      e.style.strokeDashoffset = String(1 - o);
      e.style.opacity = o > 0 ? '1' : '0';
    } else (e as SVGElement).style.opacity = izler[i].bitti ? '1' : '0';
  };
  dolgular.forEach((_, i) => ciz(i));
  isaretler();

  if (ilk) {
    await s.soyle(M.izle_buyuk);
    // Kino harfi ters çizer; Mino: "Ters oldu! Bak, böyle." ve el doğru yolu gösterir
    const ters = kinoYolu(harf, hf.kino);
    await s.kinoHata({
      kino: ORTAK.kinoCiz,
      poz: 'kalk',
      once: async () => {
        for (const c of ters) {
          if (c.length === 1) {
            kinoG.append(daireEl(c[0], 5, 'ok-ses-iz-kino-nokta'));
            continue;
          }
          const p = yolEl(yolD(c), '');
          p.setAttribute('pathLength', '1');
          kinoG.append(p);
          await p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: sure(650), fill: 'forwards' }).finished.catch(() => undefined);
        }
      },
      mino: ORTAK.ters,
      sonra: async () => {
        kinoG.classList.add('ok-silin');
        await s.bekle(300);
        kinoG.replaceChildren();
        await elGezdir(kagit, yollar, s);
      },
    });
    await s.soyle(M.izle_bas);
  } else await s.soyle(M.izle_kucuk);
  s.adim('izle');

  let son: Nokta | null = null;
  let id: number | null = null;
  let kalemSes = 0;
  let ipucuSayi = 0;
  let bitti = false;
  const nokta = (e: PointerEvent): Nokta => {
    const r = svg.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
  };
  await new Promise<void>((coz) => {
    const cizgiBitti = () => {
      const iz = izler[aktif];
      ciz(aktif);
      ses.tik();
      const p = iz.n[iz.n.length - 1];
      const r = svg.getBoundingClientRect();
      const k = s.el.getBoundingClientRect();
      s.efekt.parilti(r.left - k.left + p[0] * r.width, r.top - k.top + p[1] * r.height, 6, 0.7);
      aktif++;
      ipucuSayi = 0;
      isaretler();
      if (aktif >= izler.length) {
        bitti = true;
        bekle.dur();
        void tamamla().then(coz);
      }
    };
    const bekle = bosBekleme(s, 7000, () => {
      if (bitti || id !== null) return;
      ipucuSayi++;
      if (ipucuSayi >= 3) {
        // emek verdi: Mino o çizgiyi birlikte tamamlar (ceza yok)
        const iz = izler[aktif];
        iz.i = iz.n.length - 1;
        iz.bitti = true;
        cizgiBitti();
        return;
      }
      oynat(isaretG, 'ok-ses-zipla');
      void elGezdir(kagit, [yollar[aktif]], s);
    });
    const tamamla = async () => {
      // 1) harf parlar ve zıplar, 2) toplanıp küçülür (hazırlık), 3) yerinden kahraman çıkar (A → arı), 4) uçup gider
      kagit.classList.add('ok-ses-tamam');
      ses.sihir();
      const [x, y] = s.efekt.merkez(kagit);
      s.efekt.parilti(x, y, 12, 1.4);
      await s.bekle(650);
      kagit.classList.add('ok-ses-donus');
      oynat(resimK, 'ok-ses-cik');
      ses.pit(4);
      await s.soyle([hf.ses, kelime(hf.oda[0]).uzun]);
      if (!AZ_HAREKET && !s.kapandi()) {
        const bas = s.efekt.merkez(resimK);
        resimK.style.visibility = 'hidden';
        ses.kanat();
        void s.efekt.ucur(h('div.ok-ses-ucan', {}, kahramanEl(hf.oda[0], hf.renk, 'ucan')), bas, [s.el.clientWidth + 120, bas[1] - 200], { ms: 1400, kavis: -160, boy1: 0.7, don: 14 });
      }
      await s.ovgu(kagit);
    };
    svg.addEventListener('pointerdown', (e) => {
      if (bitti || id !== null || s.kapandi() || s.el.dataset.adim !== 'izle') return;
      e.preventDefault();
      id = e.pointerId;
      try {
        svg.setPointerCapture(id);
      } catch {
        /* yok say */
      }
      const p = nokta(e);
      son = null;
      kalem.style.opacity = '1';
      tasi(p);
    });
    const tasi = (p: Nokta) => {
      kalem.setAttribute('cx', (p[0] * 100).toFixed(2));
      kalem.setAttribute('cy', (p[1] * 100).toFixed(2));
      const iz = izler[aktif];
      if (!iz) return;
      if (izGecis(iz, son, p, tol)) {
        bekle.kur();
        ciz(aktif);
        if (iz.i - kalemSes > 6) {
          kalemSes = iz.i;
          ses.kalem();
        }
        if (iz.bitti) {
          kalemSes = 0;
          cizgiBitti();
        }
      }
      son = p;
    };
    svg.addEventListener('pointermove', (e) => {
      if (e.pointerId !== id || bitti) return;
      tasi(nokta(e));
    });
    const birak = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      id = null;
      son = null;
      kalem.style.opacity = '0';
    };
    svg.addEventListener('pointerup', birak);
    svg.addEventListener('pointercancel', birak);
    bekle.kur();
  });
  await s.bekle(500);
}

async function izle(s: Sahne, hf: Harf) {
  await izleTur(s, hf, hf.buyuk, true);
  if (s.kapandi()) return;
  await izleTur(s, hf, hf.kucuk, false);
}

// ---------------------------------------------------------------- 4 · Hangisi farklı?
async function farkli(s: Sahne, hf: Harf) {
  const turlar = farkliTurlari(hf, s.rnd);
  for (let t = 0; t < turlar.length; t++) {
    if (s.kapandi()) return;
    const tur = turlar[t];
    // dala konmuş dört kuş, her birinin göğsünde bir harf; farklı olan kuş cik cik uçup gider
    const taslar = tur.harfler.map((x, i) =>
      h('button.ok-ses-tas', { type: 'button', style: `${harfStil(hf)};--i:${i}`, 'data-harf': x, 'aria-label': x }, h('span.ok-ses-kus', { html: kus(i + t) }), h('span.ok-ses-tabela', {}, harfYazi(x))),
    );
    const dogruEl = taslar[tur.farkli];
    if (TEST_MODU) dogruEl.dataset.dogru = '1';
    const dallar = new Dallar('ok-ses-dallar');
    const kap = h('div.ok-ses-farkli', {}, dallar.el);
    s.alan.replaceChildren(kap);
    dallar.duzenle(4, s.alan.clientWidth || 360, kusBoyu(kap));
    taslar.forEach((b, i) => dallar.tunek(i).append(b));
    ses.kanat();
    s.el.dataset.sesTur = String(t);
    await s.soyle(M.farkli);
    if (t === 0) {
      // Kino aynı harflerden birini farklı sanır
      const ayni = taslar[(tur.farkli + 1) % 4];
      await s.kinoHata({
        kino: K.farkli,
        once: () => {
          ayni.classList.add('ok-ses-kino-sec');
          oynat(ayni, 'ok-ses-zipla');
        },
        mino: M.farkli_kino,
        sonra: () => {
          ayni.classList.remove('ok-ses-kino-sec');
        },
      });
    }
    s.adim('farkli');
    const ipucu = new Ipucu(() => [dogruEl]);
    let mesgul = false;
    await new Promise<void>((coz) => {
      for (const b of taslar) {
        b.addEventListener('click', async () => {
          if (mesgul || s.kapandi()) return;
          mesgul = true;
          if (b === dogruEl) {
            ses.tik();
            ses.cik(2);
            ses.kanat();
            b.classList.add('ok-dogru');
            taslar.forEach((x, i) => x !== b && window.setTimeout(() => oynat(x, 'ok-ses-zipla'), i * 90));
            // farklı kuş uçar gider
            const [x0, y0] = s.efekt.merkez(b);
            const w = s.el.clientWidth;
            b.classList.add('ok-ses-saklan');
            if (!AZ_HAREKET) void s.efekt.ucur(h('div.ok-ses-ucan', { html: b.innerHTML, style: harfStil(hf) }), [x0, y0], [x0 < w / 2 ? -80 : w + 80, -60], { ms: 1100, kavis: -120, boy1: 0.7, don: x0 < w / 2 ? -20 : 20 });
            await s.ovgu(b);
            coz();
            return;
          }
          s.nazik(b);
          ses.cik(0);
          ipucu.yanlis();
          await s.soyle(ORTAK.tekrar);
          mesgul = false;
        });
      }
    });
    await s.bekle(250);
  }
  delete s.el.dataset.sesTur;
}

// ---------------------------------------------------------------- 5 · Sesli kutu
function sepetEl(tur: 'ses' | 'diger', hf: Harf): { el: HTMLElement; ic: HTMLElement } {
  const ic = h('div.ok-ses-sepet-ic');
  const resim = (on: boolean) => h(`img.ok-sepet-resim${on ? '.ok-sepet-on' : ''}`, { src: gorsel('pazar/sepet'), alt: '', draggable: 'false' });
  const etiket = tur === 'ses' ? h('span.ok-ses-etiket', { style: harfStil(hf) }, harfYazi(hf.buyuk), harfYazi(hf.kucuk, '.ok-ses-kucuk')) : null;
  const el = h(`div.ok-ses-sepet.ok-ses-sepet-${tur}`, { 'data-sepet': tur, 'aria-label': tur === 'ses' ? `${hf.buyuk} sepeti` : S.arayuz.sepet }, resim(false), ic, resim(true), etiket);
  return { el, ic };
}

async function kutu(s: Sahne, hf: Harf) {
  const dinlet = dinleyici(s);
  const tur = kutuTuru(hf, s.rnd);
  const sesS = sepetEl('ses', hf);
  const kahraman = kahramanEl(hf.oda[0], hf.renk);
  sesS.el.append(h('span.ok-ses-sepet-kahraman', {}, kahraman));
  const digerS = sepetEl('diger', hf);
  const tepsi = h('div.ok-ses-tepsi');
  const kartlar = tur.hepsi.map((k, i) => {
    const b = resimKarti(k, hf, i);
    b.classList.add('ok-ses-tasinir');
    if (TEST_MODU) b.dataset.sepet = sesleBaslar(k, hf) ? 'ses' : 'diger';
    tepsi.append(h('div.ok-ses-tepsi-yuva', {}, b));
    return b;
  });
  s.alan.replaceChildren(h('div.ok-ses-kutu', {}, tepsi, h('div.ok-ses-sepetler', {}, sesS.el, digerS.el)));
  const kalan = () => kartlar.filter((k) => !k.dataset.yerde);
  const sepeteKoy = (k: HTMLElement, sepet: { el: HTMLElement; ic: HTMLElement }) => {
    k.dataset.yerde = '1';
    k.style.transition = 'none';
    k.style.transform = '';
    const n = sepet.ic.children.length;
    sepet.ic.append(h('span.ok-ses-sepet-resim', { style: `--k:${n}` }, resimEl(k.dataset.kelime!, hf.renk)));
    k.classList.add('ok-gitti');
    ses.dus();
    efekt.yapis();
    oynat(sepet.el, 'ok-yapis');
  };

  await s.soyle(M.kutu);
  oynat(sesS.el, 'ok-ses-zipla');
  await s.soyle(M.kutu_diger);
  oynat(digerS.el, 'ok-ses-zipla');
  // Kino öteki bir resmi ses sepetine atar; Mino: "Bu öbür sepete!" ve resim tepsiye geri zıplar
  const yanlis = kartlar.find((k) => !sesleBaslar(k.dataset.kelime!, hf));
  if (yanlis) {
    await s.kinoHata({
      kino: K.kutu,
      poz: 'kalk',
      once: async () => {
        yanlis.classList.add('ok-ses-saklan');
        if (!AZ_HAREKET) await s.efekt.ucur(h('div.ok-ses-ucan', {}, resimEl(yanlis.dataset.kelime!, hf.renk)), s.efekt.merkez(s.kinoYer), s.efekt.merkez(sesS.el, 0.5, 0.4), { ms: 700, boy0: 0.6, boy1: 0.6, kavis: -120 });
        oynat(sesS.el, 'ok-yapis');
      },
      sonra: async () => {
        await s.soyle([kelime(yanlis.dataset.kelime!).uzun, M.kutu_kino]);
        if (!AZ_HAREKET) await s.efekt.ucur(h('div.ok-ses-ucan', {}, resimEl(yanlis.dataset.kelime!, hf.renk)), s.efekt.merkez(sesS.el, 0.5, 0.4), s.efekt.merkez(yanlis), { ms: 600, boy0: 0.6, boy1: 1, kavis: -90 });
        yanlis.classList.remove('ok-ses-saklan');
        oynat(yanlis, 'ok-ses-zipla');
      },
    });
  }
  s.adim('kutu');
  let mesgul = false;
  await new Promise<void>((coz) => {
    for (const k of kartlar) {
      const ad = k.dataset.kelime!;
      const dogruSepet = sesleBaslar(ad, hf) ? sesS : digerS;
      const ipucu = new Ipucu(() => [dogruSepet.el]);
      // dokunup bırakmak (sürüklemeden) yalnız kelimeyi söyletir
      let x0 = 0;
      let y0 = 0;
      let kaydi = false;
      k.addEventListener('pointerdown', (e) => {
        x0 = e.clientX;
        y0 = e.clientY;
        kaydi = false;
      });
      k.addEventListener('pointermove', (e) => {
        if (Math.hypot(e.clientX - x0, e.clientY - y0) > 12) kaydi = true;
      });
      const kapat = hedefliSurukle({
        el: k,
        hedefler: () => [sesS.el, digerS.el],
        aktif: () => !mesgul && !s.kapandi() && !k.dataset.yerde && s.el.dataset.adim === 'kutu',
        basla: () => {
          efekt.dokunma();
          dinlet(kelime(ad).uzun);
        },
        birak: async (hedef) => {
          if (!hedef || !kaydi) return geriGonder(k);
          if (hedef === dogruSepet.el) {
            ipucu.sifirla();
            sepeteKoy(k, dogruSepet);
            const [x, y] = s.efekt.merkez(dogruSepet.el, 0.5, 0.4);
            s.efekt.parilti(x, y, 7);
            if (dogruSepet === sesS) {
              pozla(kahraman, 'mutlu', 1000);
              oynat(kahraman, 'ok-ses-zipla');
            }
            if (!kalan().length) {
              mesgul = true;
              pozla(kahraman, 'mutlu');
              await s.ovgu(sesS.el);
              await s.soyle(M.kutu_tamam);
              coz();
            }
            return;
          }
          // yanlış sepet: resim nazikçe tepsiye döner, Mino kelimeyi ve sesi söyler
          geriGonder(k);
          mesgul = true;
          s.nazik(hedef);
          ipucu.yanlis();
          await s.soyle(dogruSepet === sesS ? [kelime(ad).uzun, hf.ses] : [kelime(ad).uzun, M.baska]);
          mesgul = false;
        },
      });
      s.kapaninca(kapat);
    }
  });
}

// ---------------------------------------------------------------- odalar
const ADIMLAR: Record<(typeof ODA_ADIMLARI)[number], (s: Sahne, hf: Harf) => Promise<void>> = { tanis, av, izle, farkli, kutu };


if (TEST_MODU && q.has('sifirla')) {
  try {
    localStorage.removeItem(ODA_ANAHTARI);
  } catch {
    /* yok say */
  }
}

for (const hf of HARFLER) {
  const id = odaId(hf);
  etkinlikKaydet({
    id,
    bolge: 'ses',
    ad: S.arayuz.oda.replace('{Harf}', hf.buyuk),
    ucretsiz: hf.id === 'a',
    simge: () => odaSimgesi(hf),
    async oyna(s) {
      s.el.dataset.harf = hf.id;
      s.el.style.cssText += `;${harfStil(hf)}`;
      // kulenin odası: sıcak taş duvar; odanın rengiyle hafif ışık, duvarda kocaman harf ve kahramanın gölgesi
      const kat = kuleKatAdres();
      if (kat) {
        s.el.querySelector('.ok-park')?.after(
          h('div.ok-park.ok-ses-oda-arka', { 'aria-hidden': 'true', style: `background-image:url("${kat}")` }, h('span.ok-ses-duvar-harf', {}, hf.buyuk), pozVar(hf.oda[0], 'ucan') ? h('span.ok-ses-duvar-kahraman', {}, kahramanEl(hf.oda[0], hf.renk, 'ucan')) : null),
        );
      }
      const n = ODA_ADIMLARI.length;
      s.turlar(n);
      // kaldığı yerden (test: &sesadim=2)
      let bas = Math.min(n - 1, odaAdimi(id));
      if (GOSTERIM && q.has('sesadim')) bas = Math.max(0, Math.min(n, Number(q.get('sesadim')) || 0));
      if (bas > 0) {
        s.tur(bas);
        await s.soyle(M.devam);
      }
      for (let i = bas; i < n; i++) {
        if (s.kapandi()) return;
        s.tur(i);
        s.el.dataset.sesAdim = ODA_ADIMLARI[i];
        await ADIMLAR[ODA_ADIMLARI[i]](s, hf);
        if (s.kapandi()) return;
        odaAdimiYaz(id, i + 1 < n ? i + 1 : 0);
      }
      s.tur(n);
      const kahraman = kahramanEl(hf.oda[0], hf.renk, 'mutlu');
      s.alan.replaceChildren(h('div.ok-ses-final-kap', {}, h('div.ok-ses-levha.ok-ses-final', { style: harfStil(hf) }, harfYazi(hf.buyuk), harfYazi(hf.kucuk, '.ok-ses-kucuk')), kahraman));
      oynat(kahraman, 'ok-ses-kon');
      s.konfeti(0.5, 0.4, 90);
      efekt.konfeti();
      s.minoTepki('dans', 1.4);
      s.kinoOynat('dans', 1400);
      await s.soyle([hf.ses, M.oda_bitti]);
      await s.bekle(1200);
    },
  });
}
