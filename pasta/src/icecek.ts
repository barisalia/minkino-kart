/**
 * İçecek makinesi (v2 2a; "İçecek makinesi" yükseltmesiyle açılır). Makineye dokununca yakın planda açılır:
 *  1. bardak boyu seç (küçük / büyük),
 *  2. musluğa basılı tut: bardak o musluğun altına kayar ve dolar; bardakta çizgi var, çizgide bırak,
 *  3. taşarsa Kino siler (ceza yok); çizginin altında kalırsa bir daha basılı tutulur ya da Tamam.
 * Panel açıkken gün durur. Dönen: dolu bardak (Tamam'da boşsa null).
 */
import P from '../../content/pasta.json';
import { efekt } from '../../src/audio/ses';
import type { Soylenecek } from '../../src/audio/konusma';
import { h, svg, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { bardakSvg, ICECEK_MAKINESI_KOD, icecekIkon, resimSvg } from './cizim';
import { Efekt, salla } from './gorsel';
import { dolumSonucu, ICECEK_KODU, ICECEKLER, type Bardak, type Boy, type Icecek, type Kalem } from './model';
import { kalemCizimi } from './musteri';
import { yuva } from './resimler';
import { ses } from './sesler';

export interface IcecekBaglam {
  kok: HTMLElement;
  efekt: Efekt;
  soyle: (s: Soylenecek, kim?: 'mino' | 'kino', onemli?: boolean) => Promise<void>;
}

/** Bardağın çizgiye kadar dolma süresi (ms) */
export const DOLUM_MS = 1900;
/** Musluklar makine çiziminde (yatay oran) */
const MUSLUK_X: Record<Icecek, number> = { sut: 0.206, kakao: 0.5, limonata: 0.794 };
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, TEST_MODU ? Math.min(ms, 60) : ms));

/** Makinenin çizimi (görsel varsa o) */
export const makineSvg = () => {
  const u = yuva('icecekMakinesi');
  return u ? resimSvg(u, 160, 124, 'xMidYMax meet') : ICECEK_MAKINESI_KOD;
};

export function icecekPaneli(b: IcecekBaglam, hedef: Kalem | null, acik: readonly Icecek[] = ICECEKLER): Promise<Bardak | null> {
  const bardak: Bardak = { icecek: null, boy: 'kucuk', dolum: 0 };
  let boySecildi = false;
  const bardakEl = h('div.ps-bardak', { 'data-dolum': '0', 'data-boy': '' });
  const akis = h('i.ps-akis', { 'aria-hidden': 'true' });
  const bardakCiz = () => {
    bardakEl.innerHTML = bardakSvg({ ...bardak, cizgi: true });
    bardakEl.dataset.dolum = bardak.dolum.toFixed(3);
    bardakEl.dataset.icecek = bardak.icecek ?? '';
    bardakEl.dataset.boy = boySecildi ? bardak.boy : '';
  };
  const musluklar = acik.map((i) => {
    const m = h('button.ps-musluk', { type: 'button', 'data-icecek': i, 'aria-label': i, style: `--mx:${MUSLUK_X[i] * 100}%`, html: icecekIkon(i) });
    return m;
  });
  const boylar = (['kucuk', 'buyuk'] as Boy[]).map((bo) => {
    const d = h('button.ps-boy', { type: 'button', 'data-boy': bo, 'aria-label': bo === 'kucuk' ? 'Küçük bardak' : 'Büyük bardak', html: bardakSvg({ icecek: null, boy: bo, dolum: 0 }) });
    d.addEventListener('click', () => {
      if (bardak.dolum > 0) {
        ses.degil();
        salla(d, 'ps-hayir');
        return;
      }
      efekt.secim();
      boySecildi = true;
      bardak.boy = bo;
      boylar.forEach((x) => x.classList.toggle('ps-secili', x === d));
      bardakCiz();
      salla(bardakEl, 'ps-zipla');
    });
    return d;
  });
  const makine = h('div.ps-makine-buyuk', { html: makineSvg() }, ...musluklar, h('div.ps-bardak-yolu', {}, akis, bardakEl));
  const siparis = hedef ? h('div.ps-panel-siparis', { 'aria-hidden': 'true' }, h('span.ps-b-grup', { html: kalemCizimi(hedef) })) : null;
  const tamam = h('button.ps-panel-tamam', { type: 'button', 'aria-label': 'Tamam' }, svg(IKON.onay));
  const kart = h('div.ps-panel-kart.ps-icecek-kart', {}, siparis, makine, h('div.ps-boylar', {}, ...boylar), tamam);
  const panel = h('div.ps-panel.ps-icecek-panel', { role: 'dialog', 'aria-label': 'İçecek', 'data-adim': 'icecek' }, kart);
  b.kok.append(panel);
  bardakCiz();
  void b.soyle(P.mino.doldur, 'mino', false);
  panel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: TEST_MODU ? 1 : 220 });

  return new Promise<Bardak | null>((coz) => {
    let doluyor: Icecek | null = null;
    let zaman = 0;
    let son = 0;
    let bitti = false;
    const kapat = async (sonuc: Bardak | null) => {
      if (bitti) return;
      bitti = true;
      dur();
      await bekle(sonuc ? 650 : 0);
      panel.remove();
      coz(sonuc);
    };
    const adim = () => {
      if (!doluyor) return;
      const simdi = performance.now();
      bardak.dolum = Math.min(1.3, bardak.dolum + (simdi - son) / DOLUM_MS);
      son = simdi;
      bardakCiz();
      zaman = window.setTimeout(adim, 40);
      if (Math.round(bardak.dolum * 10) % 3 === 0) ses.akis(0.12);
    };
    const bas = (i: Icecek, m: HTMLElement) => (e: PointerEvent) => {
      if (bitti || doluyor) return;
      e.preventDefault();
      if (!boySecildi) {
        ses.degil();
        boylar.forEach((x) => salla(x, 'ps-ipucu'));
        return;
      }
      if (bardak.icecek && bardak.icecek !== i) {
        // başka içecek karışmaz
        ses.degil();
        salla(m, 'ps-hayir');
        return;
      }
      try {
        m.setPointerCapture(e.pointerId);
      } catch {
        /* yok say */
      }
      bardak.icecek = i;
      makine.style.setProperty('--bx', `${MUSLUK_X[i] * 100}%`);
      akis.style.setProperty('--renk', ICECEK_KODU[i]);
      makine.classList.add('ps-akiyor');
      m.classList.add('ps-basili');
      doluyor = i;
      son = performance.now();
      adim();
    };
    const dur = () => {
      clearTimeout(zaman);
      makine.classList.remove('ps-akiyor');
      musluklar.forEach((x) => x.classList.remove('ps-basili'));
      const vardi = doluyor;
      doluyor = null;
      return vardi;
    };
    const birak = () => {
      if (!dur() || bitti) return;
      const s = dolumSonucu(bardak.dolum);
      const r = bardakEl.getBoundingClientRect();
      const k = b.efekt.el.getBoundingClientRect();
      const [x, y] = [r.left - k.left + r.width / 2, r.top - k.top + r.height * 0.3];
      if (s === 'tam') {
        efekt.dogru();
        b.efekt.parilti(x, y, 8);
        void kapat({ ...bardak });
      } else if (s === 'tasti') {
        // taştı: Kino siler, bardak çizgide kalır
        void b.soyle(P.kino.sil, 'kino', false);
        ses.kay();
        bardak.dolum = 1;
        bardakCiz();
        b.efekt.pof(x, y, 0.6);
        void kapat({ ...bardak });
      } else {
        ses.degil();
        void b.soyle(P.mino.doldur, 'mino', false);
        salla(bardakEl, 'ps-ipucu');
      }
    };
    musluklar.forEach((m, n) => {
      m.addEventListener('pointerdown', bas(acik[n], m));
      m.addEventListener('pointerup', birak);
      m.addEventListener('pointercancel', birak);
      m.addEventListener('lostpointercapture', birak);
    });
    tamam.addEventListener('click', () => {
      efekt.secim();
      void kapat(bardak.dolum > 0.02 && bardak.icecek ? { ...bardak } : null);
    });
  });
}
