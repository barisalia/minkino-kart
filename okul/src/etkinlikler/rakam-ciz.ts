/**
 * Etkinlik 8 · Rakamı çiz (rakam şekli, çizgi çalışması; Çiz Canlansın'ın parmakla çizme ve puanlama kodu).
 * Mino çimlerin üstüne kesik çizgiyle bir rakam çizmiş: yeşil noktadan başlayıp parmakla üstünden geçilir; çizgi
 * şablona çekilir (canlan/src/puan.ts → toparla). Doğru çizilince rakam canlanır: 1 mum, 2 kuğu, 3 kuş … Puan yok.
 * Kino rakamı ters çizer (Ɛ): "Ters oldu! Bak, böyle." 3-4 yaş 1-5, 5-6 yaş 1-9; her oturumda 3 rakam.
 */
import O from '../../../content/okul.json';
import { puanla, toparla, uzunluk } from '../../../canlan/src/puan';
import type { Nokta } from '../../../canlan/src/resimler';
import { h, sure, TEST_MODU } from '../../../src/ui/dom';
import { IKON } from '../../../src/ui/ikonlar';
import { AZ_HAREKET, oynat } from '../efekt';
import { etkinlikKaydet } from '../etkinlik';
import { canlanmaSusu, KABUL, RAKAM_YOLU, rakamResmi, yolD } from '../rakam';
import type { Sahne } from '../sahne';
import { cizimRakamlari } from '../sayi';
import { ses } from '../sesler';

const M = O.mino.rakam_ciz;
const NS = 'http://www.w3.org/2000/svg';
const CANLAN = O.canlan as Record<string, string>;
const RENK = ['#F0413F', '#FF8A2B', '#5DBE3F', '#3E9DF2', '#9B5CE0', '#FF7EB6'];

function yolEl(d: string, sinif: string): SVGPathElement {
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', d);
  p.setAttribute('class', sinif);
  return p;
}

/** Bir çizginin üstünden kayan el (ipucu) */
async function elGezdir(kagit: HTMLElement, yollar: Nokta[][], s: Sahne) {
  const el = h('div.ok-el', { html: IKON.el });
  kagit.append(el);
  for (const y of yollar) {
    if (s.kapandi()) break;
    const kare = y.filter((_, i) => i % 2 === 0 || i === y.length - 1).map((p) => ({ left: `${p[0] * 100}%`, top: `${p[1] * 100}%` }));
    await el.animate(kare, { duration: sure(Math.max(700, uzunluk(y) * 1500)), easing: 'linear', fill: 'forwards' }).finished.catch(() => undefined);
  }
  el.remove();
}

async function tur(s: Sahne, n: number, ilk: boolean, renk: string) {
  const yollar = RAKAM_YOLU[n];
  const resim = rakamResmi(n);
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('class', 'ok-cizim-svg');
  const sablon = document.createElementNS(NS, 'g');
  for (const y of yollar) {
    sablon.append(yolEl(yolD(y), 'ok-sablon-dis'), yolEl(yolD(y), 'ok-sablon'));
  }
  // başlangıç noktaları (yeşil) ve ok
  yollar.forEach((y, i) => {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', String(y[0][0] * 100));
    c.setAttribute('cy', String(y[0][1] * 100));
    c.setAttribute('r', '5.5');
    c.setAttribute('class', 'ok-baslangic');
    c.dataset.i = String(i);
    sablon.append(c);
  });
  const murekkep = document.createElementNS(NS, 'g');
  murekkep.setAttribute('class', 'ok-murekkep');
  murekkep.style.setProperty('--renk', renk);
  const sus = document.createElementNS(NS, 'g');
  sus.setAttribute('class', 'ok-sus');
  svg.append(sablon, murekkep, sus);
  const kagit = h('div.ok-kagit', { 'data-rakam': String(n) }, svg);
  if (TEST_MODU) kagit.dataset.yol = JSON.stringify(yollar);
  s.alan.replaceChildren(h('div.ok-e8', {}, kagit));

  if (ilk) {
    // Kino ters çizer
    await s.soyle(M.giris);
    const ters = yollar.map((y) => yolEl(yolD(y, true), 'ok-kino-cizgi'));
    await s.kinoHata({
      kino: O.kino.ciz,
      poz: 'kalk',
      once: async () => {
        for (const t of ters) {
          murekkep.append(t);
          const L = t.getTotalLength?.() ?? 300;
          t.style.strokeDasharray = `${L}`;
          await t.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: sure(900), fill: 'forwards' }).finished.catch(() => undefined);
        }
      },
      mino: M.ters,
      sonra: async () => {
        await elGezdir(kagit, yollar, s);
        ters.forEach((t) => t.remove());
      },
    });
  } else await s.soyle(M.giris);
  s.adim('ciz');

  let yanlis = 0;
  const cizgiler: Nokta[][] = [];
  const ciz: SVGPathElement[] = [];
  let simdiki: Nokta[] | null = null;
  let simdikiEl: SVGPathElement | null = null;
  let id: number | null = null;
  let bitti = false;
  const nokta = (e: PointerEvent): Nokta => {
    const r = svg.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
  };
  const sablonUzunluk = yollar.reduce((t, y) => t + uzunluk(y), 0);

  await new Promise<void>((coz) => {
    const temizle = () => {
      cizgiler.length = 0;
      ciz.forEach((c) => c.remove());
      ciz.length = 0;
    };
    const degerlendir = async () => {
      const p = puanla(resim, cizgiler, 'iz', s.yas);
      // çizgi şablona çekilir (Çiz Canlansın'daki gibi): çocuğun çizgisi ama düzgün
      const duz = toparla(resim, cizgiler, p.donusum, 0.6);
      duz.forEach((c, i) => ciz[i]?.setAttribute('d', yolD(c)));
      if (p.kapsama >= KABUL.kapsama && p.isabet >= KABUL.isabet) {
        bitti = true;
        await canlan();
        coz();
        return;
      }
      const toplam = cizgiler.reduce((t, c) => t + uzunluk(c), 0);
      if (toplam > sablonUzunluk * 1.35 || (cizgiler.length >= yollar.length && p.kapsama < 0.4)) {
        yanlis++;
        s.nazik(kagit);
        temizle();
        if (yanlis >= 3) {
          // emek verdi: üçüncü denemeden sonra Mino birlikte çizer, rakam yine canlanır (ceza yok)
          bitti = true;
          await elGezdir(kagit, yollar, s);
          for (const y of yollar) {
            const e = yolEl(yolD(y), 'ok-cizgi');
            murekkep.append(e);
          }
          await canlan();
          coz();
          return;
        }
        await s.soyle(M.tekrar);
        if (yanlis >= 2) {
          kagit.classList.add('ok-ipucu');
          await elGezdir(kagit, yollar, s);
        }
      }
    };
    const canlan = async () => {
      ses.sihir();
      kagit.classList.remove('ok-ipucu');
      kagit.classList.add('ok-canli');
      sus.innerHTML = canlanmaSusu(n);
      const [x, y] = s.efekt.merkez(kagit);
      s.efekt.parilti(x, y, 12, 1.4);
      await s.soyle(CANLAN[String(n)] ?? `${n}!`);
      await s.ovgu(kagit);
    };
    svg.addEventListener('pointerdown', (e) => {
      if (bitti || id !== null || s.kapandi() || s.el.dataset.adim !== 'ciz') return;
      e.preventDefault();
      id = e.pointerId;
      try {
        svg.setPointerCapture(id);
      } catch {
        /* yok say */
      }
      simdiki = [nokta(e)];
      simdikiEl = yolEl(yolD(simdiki), 'ok-cizgi');
      murekkep.append(simdikiEl);
    });
    svg.addEventListener('pointermove', (e) => {
      if (e.pointerId !== id || !simdiki || !simdikiEl) return;
      const p = nokta(e);
      const son = simdiki[simdiki.length - 1];
      if (Math.hypot(p[0] - son[0], p[1] - son[1]) < 0.006) return;
      simdiki.push(p);
      simdikiEl.setAttribute('d', yolD(simdiki));
      if (simdiki.length % 6 === 0) ses.kalem();
    });
    const birak = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      id = null;
      if (simdiki && simdikiEl && simdiki.length > 1) {
        cizgiler.push(simdiki);
        ciz.push(simdikiEl);
        void degerlendir();
      } else simdikiEl?.remove();
      simdiki = null;
      simdikiEl = null;
    };
    svg.addEventListener('pointerup', birak);
    svg.addEventListener('pointercancel', birak);
  });
  if (!AZ_HAREKET) oynat(kagit, 'ok-zipla');
  await s.bekle(600);
}

etkinlikKaydet({
  id: 'rakam-ciz',
  bolge: 'sayi',
  ad: O.arayuz.etkinlikler['rakam-ciz'],
  async oyna(s) {
    const rakamlar = cizimRakamlari(s.yas, s.rnd);
    s.turlar(rakamlar.length);
    for (let i = 0; i < rakamlar.length; i++) {
      if (s.kapandi()) return;
      s.tur(i);
      await tur(s, rakamlar[i], i === 0, RENK[i % RENK.length]);
    }
    s.tur(rakamlar.length);
  },
});
