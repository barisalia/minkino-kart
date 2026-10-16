/**
 * Menü tahtası (§3a.2, ≤ 15 sn): kara tahtada boş yuvalar (3-4 yaşta 2, 5-6 yaşta 3); açılmış tarif kartları altta.
 * Çocuk istediğine dokunur, kart tahtaya uçar ve Mino adını söyler; tahtadaki karta dokununca geri iner. Yuvalar
 * dolunca servis zili hoplar, zile dokununca gün başlar. Müşteriler yalnız menüdeki yemeklerden ister: bugün hangi
 * mini oyunların oynanacağını çocuk seçer.
 *
 * Seçim yoksa (açık tarif yuva kadar ya da az; Gün 1) tarifler kendiliğinden tek tek yerleşir (kısa gösteri).
 * Dün alınan yeni tarif yuvada hazır gelir (bir müşteri onu mutlaka ister); çocuk istersen indirir.
 * İpucu: 12 sn dokunulmazsa bir kart kıpırdar, 20 sn'de Mino durumu bir daha söyler; emir yok.
 */
import { h, sure, TEST_MODU } from '../../../src/ui/dom';
import { menuOnerisi, menuSecimiVar, menuYuvasi } from '../ekonomi';
import type { Yas } from '../mini/arayuz';
import { L } from '../model';
import { sesler } from '../sesler';
import defterJson from '../../../content/restoran/defter.json';
import { yemekResmi } from './istek-gorsel';

const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, TEST_MODU ? Math.min(ms, 20) : ms));

export interface MenuSecenek {
  yas: Yas;
  acik: string[];
  dunku: string[];
  yeni: string | null;
  soyle: (metin: string) => Promise<void>;
}

export function menuTahtasi(kap: HTMLElement, s: MenuSecenek): { bitti: Promise<string[]>; el: HTMLElement; kapat(): void } {
  const n = menuYuvasi(s.yas);
  const secimVar = menuSecimiVar(s.acik, s.yas);
  const yuvalar: (string | null)[] = Array.from({ length: n }, () => null);
  const tahta = h('div.rs-mt-tahta', {}, h('span.rs-mt-cerceve'));
  const yuvaEls = yuvalar.map((_, i) => {
    const y = h('button.rs-mt-yuva', { type: 'button', 'data-i': String(i), 'aria-label': 'Menü yuvası' });
    y.addEventListener('click', () => indir(i));
    tahta.append(y);
    return y;
  });
  const raf = h('div.rs-mt-raf');
  const zil = h('button.rs-mt-zil', { type: 'button', 'aria-label': 'Lokantayı aç' }, h('span.rs-mt-zil-govde'));
  zil.hidden = true;
  const el = h('div.rs-menu-tahtasi', { 'data-secim': secimVar ? '1' : '0' }, tahta, raf, zil);
  kap.append(el);

  const kartlar = new Map<string, HTMLElement>();
  for (const t of s.acik) {
    const k = h('button.rs-mt-kart', { type: 'button', 'data-tarif': t, 'aria-label': t }, h('span.rs-mt-resim', {}, yemekResmi(t)));
    k.addEventListener('click', () => koy(t));
    kartlar.set(t, k);
    raf.append(k);
  }

  let coz: (m: string[]) => void = () => undefined;
  const bitti = new Promise<string[]>((r) => (coz = r));
  let kapandi = false;
  let sonDokunus = performance.now();
  let ipucuAdim = 0;

  const ciz = () => {
    yuvalar.forEach((t, i) => {
      const y = yuvaEls[i];
      y.replaceChildren(...(t ? [h('span.rs-mt-resim', {}, yemekResmi(t))] : []));
      y.dataset.dolu = t ? '1' : '';
    });
    for (const [t, k] of kartlar) k.classList.toggle('rs-mt-tahtada', yuvalar.includes(t));
    const dolu = yuvalar.every(Boolean) || yuvalar.filter(Boolean).length >= s.acik.length;
    if (dolu && zil.hidden) {
      zil.hidden = false;
      zil.classList.remove('rs-hopla');
      void zil.offsetWidth;
      zil.classList.add('rs-hopla');
      sesler.cal('zil', { guc: 0.5 });
    } else if (!dolu) zil.hidden = true;
  };

  const ucur = (kaynak: HTMLElement, hedef: HTMLElement) => {
    try {
      const a = kaynak.getBoundingClientRect();
      const b = hedef.getBoundingClientRect();
      hedef.animate([{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / Math.max(1, b.width)})` }, { transform: 'none' }], { duration: sure(320), easing: 'cubic-bezier(.3,1.4,.5,1)' });
    } catch {
      /* yok say */
    }
  };

  function koy(t: string) {
    if (kapandi) return;
    sonDokunus = performance.now();
    if (yuvalar.includes(t)) {
      indir(yuvalar.indexOf(t));
      return;
    }
    const i = yuvalar.indexOf(null);
    if (i < 0) {
      // tahta dolu: kart kıpırdar (yer yok), zil hoplar
      kartlar.get(t)?.classList.add('rs-kipir');
      window.setTimeout(() => kartlar.get(t)?.classList.remove('rs-kipir'), 900);
      zil.classList.remove('rs-hopla');
      void zil.offsetWidth;
      zil.classList.add('rs-hopla');
      return;
    }
    yuvalar[i] = t;
    ciz();
    ucur(kartlar.get(t)!, yuvaEls[i]);
    sesler.cal('pit');
    void s.soyle((L.tarif as Record<string, string>)[t] ?? '');
  }
  function indir(i: number) {
    if (kapandi || !yuvalar[i]) return;
    sonDokunus = performance.now();
    const t = yuvalar[i]!;
    yuvalar[i] = null;
    // boşluk kalmasın: arkadakiler öne kayar
    const kalan = yuvalar.filter(Boolean) as string[];
    yuvalar.fill(null);
    kalan.forEach((x, j) => (yuvalar[j] = x));
    ciz();
    ucur(yuvaEls[Math.min(i, n - 1)], kartlar.get(t)!);
    sesler.cal('hop', { guc: 0.5 });
  }
  const bitir = () => {
    if (kapandi) return;
    const m = yuvalar.filter(Boolean) as string[];
    if (!m.length) return;
    kapandi = true;
    clearInterval(ipucu);
    sesler.cal('zil');
    el.classList.add('rs-mt-cikis');
    window.setTimeout(() => el.remove(), TEST_MODU ? 10 : sure(420));
    void s.soyle(defterJson.mino.menu_tamam);
    coz(m);
  };
  zil.addEventListener('click', bitir);

  // ipucu: 12 sn kart kıpırdar, 20 sn Mino durumu bir daha söyler
  const ipucu = window.setInterval(() => {
    if (kapandi) return;
    const gecen = performance.now() - sonDokunus;
    if (gecen > 12000 && ipucuAdim === 0) {
      ipucuAdim = 1;
      const bos = [...kartlar.entries()].find(([t]) => !yuvalar.includes(t))?.[1];
      bos?.classList.add('rs-kipir');
      window.setTimeout(() => bos?.classList.remove('rs-kipir'), 900);
    } else if (gecen > 20000 && ipucuAdim === 1) {
      ipucuAdim = 2;
      void s.soyle(defterJson.mino.menu);
    } else if (gecen < 12000) ipucuAdim = 0;
  }, 500);

  void (async () => {
    ciz();
    const oneri = menuOnerisi(s.acik, s.dunku, s.yas, s.yeni);
    if (!secimVar) {
      // seçim yok: tarifler kendiliğinden yerleşir (Mino adlarını söyler), zil kendisi çalar
      await bekle(500);
      for (const t of oneri) {
        if (kapandi) return;
        koy(t);
        await bekle(1100);
      }
      await bekle(500);
      bitir();
      return;
    }
    if (s.yeni && s.acik.includes(s.yeni)) {
      await bekle(400);
      koy(s.yeni);
    }
    await s.soyle(defterJson.mino.menu);
  })();

  return {
    el,
    bitti,
    kapat() {
      kapandi = true;
      clearInterval(ipucu);
      el.remove();
    },
  };
}
