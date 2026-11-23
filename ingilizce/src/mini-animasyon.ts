/**
 * Mini animasyon oynatıcısı (22 Kasım 2026). Veri ve mantık: mini-animasyon-veri.ts.
 * Dört poz aynı kutuda üst üste durur; sırayla görünür ve her geçişte küçük bir CSS yayı çalar (esne, sek, yaylan …).
 * - Görünür olunca oynar (TUR_SAYISI tur, sonra ilk pozda durur), ekrandan çıkınca durur.
 * - Dokununca bir tur daha oynar ve Polly sözcüğü söyler (dokunma kendinde değilse sahibi oynat() çağırır).
 * - prefers-reduced-motion: ilk pozda durur.
 * - Dört pozdan biri bile yoksa hiç görünmez (null); yer tutucu yalnız taslak kipinde.
 */
import { h, sure } from '../../src/ui/dom';
import { MINI_ANIMASYONLAR, TUR_SAYISI, pozYolu, type MiniAnimasyon } from './mini-animasyon-veri';
import { konus } from './ses';
import { resim, TASLAK } from './varlik';
import './mini-animasyon.css';

const azHareket = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Dört pozu da gelmiş mi */
export const animasyonHazir = (a: MiniAnimasyon) => [0, 1, 2, 3].every((n) => !!resim(pozYolu(a, n)));
/** Görünsün mü: hazırsa; taslak kipinde yer tutucuyla her zaman */
export const animasyonGorunur = (a: MiniAnimasyon) => animasyonHazir(a) || TASLAK;
export const gorunurAnimasyonlar = () => MINI_ANIMASYONLAR.filter(animasyonGorunur);

export interface MiniOynatici {
  el: HTMLElement;
  /** baştan `tur` tur oynar */
  oynat(tur?: number): void;
  /** durur, ilk poza döner */
  durdur(): void;
}

export interface MiniSecenek {
  sinif?: string;
  /** kendisi düğme olsun: dokununca bir tur oynar ve Polly sözcüğü söyler */
  dokun?: boolean;
  /** görünür olunca kendiliğinden başlamasın (sahibi oynat() çağırır; ör. kelime kutudan çıkınca) */
  bekle?: boolean;
}

export function miniAnimasyon(a: MiniAnimasyon, o: MiniSecenek = {}): MiniOynatici | null {
  if (!animasyonGorunur(a)) return null;
  const pozlar = [0, 1, 2, 3].map((n) => {
    const adres = resim(pozYolu(a, n));
    return adres ? h('img', { src: adres, alt: '', draggable: 'false', 'data-n': n }) : h('span.ing-ma-yer', { 'data-n': n }, `${a.id} · ${n + 1}`);
  });
  const govde = h('span.ing-ma-govde', { 'aria-hidden': 'true' }, ...pozlar);
  const etiket = a.ses.map((s) => s.replace(/^en\/[wg]-/, '')).join(', ');
  const el = o.dokun ? h('button.ing-ma', { type: 'button', 'aria-label': `${etiket}: dokun, bir daha oynasın` }) : h('span.ing-ma', { role: 'img', 'aria-label': etiket });
  if (o.sinif) el.classList.add(...o.sinif.split(' ').filter(Boolean));
  el.dataset.mini = a.id;
  el.append(govde);

  let zaman = 0, kalan = 0, gorunur = false, oynuyor = false;
  const temizle = () => { if (zaman) window.clearTimeout(zaman); zaman = 0; };
  const sonra = (ms: number, fn: () => void) => { temizle(); zaman = window.setTimeout(fn, sure(ms)); };

  function poz(n: number, yaySiz = false) {
    el.dataset.poz = String(n);
    govde.className = 'ing-ma-govde';
    const yay = a.kareler[n].yay;
    if (yaySiz || yay === 'yok' || azHareket()) return;
    void govde.offsetWidth; // aynı yay art arda gelse de yeniden başlasın
    govde.classList.add(`ing-ma-yay-${yay}`);
  }

  function adim(n: number) {
    if (!el.isConnected) { durdur(); return; }
    poz(n);
    sonra(a.kareler[n].ms, () => {
      if (n < 3) { adim(n + 1); return; }
      kalan--;
      poz(0, true);
      if (kalan > 0 && (gorunur || o.bekle)) sonra(a.ara, () => adim(1));
      else { oynuyor = false; el.dataset.oynuyor = 'false'; el.dataset.bitti = 'true'; }
    });
  }

  function oynat(tur = 1) {
    if (azHareket()) { poz(0, true); return; }
    temizle();
    kalan = tur; oynuyor = true;
    el.dataset.oynuyor = 'true';
    delete el.dataset.bitti;
    adim(0);
  }
  function durdur() { temizle(); oynuyor = false; el.dataset.oynuyor = 'false'; poz(0, true); }

  poz(0, true);
  el.dataset.oynuyor = 'false';

  // görünür olunca oynar, çıkınca durur
  if (typeof IntersectionObserver !== 'undefined') {
    const gozcu = new IntersectionObserver((girdiler) => {
      for (const g of girdiler) {
        gorunur = g.isIntersecting;
        if (!el.isConnected) { gozcu.disconnect(); durdur(); return; }
        if (gorunur && !oynuyor && !o.bekle && el.dataset.bitti !== 'true') oynat(TUR_SAYISI);
        else if (!gorunur && oynuyor && !o.bekle) durdur();
      }
    }, { threshold: 0.4 });
    gozcu.observe(el);
  } else if (!o.bekle) window.setTimeout(() => { gorunur = true; oynat(TUR_SAYISI); }, 0);

  if (o.dokun) el.addEventListener('click', () => { oynat(1); void konus(...a.ses); });
  return { el, oynat, durdur };
}
