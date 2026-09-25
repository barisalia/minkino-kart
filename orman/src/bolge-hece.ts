/**
 * Hece Mağarası: kelimeyi hecelerine göre alkışla (Türkçe heceleme kurala bağlı: hecele()).
 * 3 yaş: baykuş önce gösterir · 4 yaş: kendi adı (büyük yazar) · 5 yaş: resmin adı · 6 yaş: 4 heceli kelimeler, hangisi uzun.
 */
import O from '../../content/orman.json';
import { h } from '../../src/ui/dom';
import { buyukHarfBas } from '../../src/audio/metin';
import type { Yas } from '../../src/engine/types';
import { hecele } from '../../ses-testi/src/analiz';
import { Alkis, type Baglam, type GorevFabrika } from './gorev';
import { parilti, resim } from './gorsel';
import { kaydet, kayit } from './ilerleme';
import { adim, davul, hmm } from './sesler';

const E = O.hece;

interface Kelime {
  ad: string;
  /** görsel yolu (yoksa yazı) */
  resim?: string;
}
const K = (ad: string, resim?: string): Kelime => ({ ad, resim });
const KELIME = {
  top: K('top', 'renkler/top'),
  kedi: K('kedi', 'hayvanlar/kedi'),
  balik: K('balık', 'hayvanlar/balik'),
  elma: K('elma', 'meyveler/elma'),
  araba: K('araba', 'tasitlar/araba'),
  fil: K('fil', 'hayvanlar/fil'),
  kelebek: K('kelebek', 'hayvanlar/kelebek'),
  zurafa: K('zürafa', 'hayvanlar/zurafa'),
  domates: K('domates', 'meyveler/domates'),
  kaplumbaga: K('kaplumbağa', 'hayvanlar/kaplumbaga'),
  helikopter: K('helikopter', 'tasitlar/helikopter'),
  maymun: K('maymun', 'hayvanlar/maymun'),
  karpuz: K('karpuz', 'meyveler/karpuz'),
};

/** Baykuş gösterir: her heceye bir davul vuruşu, balon yanar */
async function goster(balonlar: HTMLElement[]) {
  for (const b of balonlar) {
    davul(false, 0.4);
    b.classList.add('yandi');
    await new Promise((r) => setTimeout(r, 520));
  }
  await new Promise((r) => setTimeout(r, 300));
  balonlar.forEach((b) => b.classList.remove('yandi'));
}

function heceGorevi(k: Kelime, sec: { demo: boolean; goster: boolean; isimMi?: boolean }): GorevFabrika {
  return (b, bitti) => {
    const heceler = hecele(k.ad);
    const a = new Alkis(b.ayar, 1.5);
    const balonlar = heceler.map((hc) => h('span.or-hece', {}, sec.goster ? hc : ''));
    const kutu = h('div.or-hece-kutu', {}, k.resim ? resim(k.resim, 'or-hece-resim', k.ad) : h('div.or-hece-isim', {}, buyukHarfBas(k.ad)), h('div.or-heceler', {}, ...balonlar));
    b.sahne.append(kutu);
    let bitmis = false;
    let mesgul = false;
    let hata = 0;
    const tekrar = async () => {
      mesgul = true;
      if (!sec.isimMi) await b.soyle(`${buyukHarfBas(k.ad)}!`);
      if (sec.demo || hata >= 2) await goster(balonlar);
      a.sifirla();
      mesgul = false;
    };
    a.onAlkis = (n) => {
      if (mesgul || bitmis) return;
      davul(false, 0.25);
      const bl = balonlar[n - 1];
      if (bl) {
        bl.classList.add('yandi');
        bl.textContent = heceler[n - 1];
      } else balonlar[balonlar.length - 1]?.parentElement?.classList.add('fazla');
      if (n <= heceler.length) adim(n * 2);
    };
    a.onSeri = (s) => {
      if (mesgul || bitmis) return;
      if (s.length === heceler.length) {
        bitmis = true;
        balonlar.forEach((bl, i) => (bl.textContent = heceler[i]));
        kutu.classList.add('tamam');
        parilti(b.sahne, 0.5, 0.4);
        setTimeout(bitti, 1300);
        return;
      }
      hata++;
      hmm();
      setTimeout(() => {
        balonlar.forEach((bl) => {
          bl.classList.remove('yandi');
          if (!sec.goster) bl.textContent = '';
        });
        kutu.querySelector('.or-heceler')?.classList.remove('fazla');
        void tekrar();
      }, 900);
    };
    return {
      yonerge: sec.isimMi ? E.ad : sec.demo ? E.dinle : E.resim,
      yazi: sec.goster ? heceler.join(' · ') : undefined,
      basla: () => void tekrar(),
      kare: (o) => a.kare(o),
      tik: () => a.tik(),
      bas: () => a.dokun(),
    };
  };
}

/** 4 yaş: kendi adı. Ad yazılı değilse büyük yazsın (ya da geçilsin). */
const isimGorevi: GorevFabrika = (b: Baglam, bitti) => {
  if (b.isim) return heceGorevi(K(b.isim), { demo: true, goster: true, isimMi: true })(b, bitti);
  let ic: ReturnType<GorevFabrika> | null = null;
  const girdi = h('input.or-isim-girdi', { type: 'text', placeholder: 'Çocuğun adı', 'aria-label': 'Çocuğun adı', maxlength: 16, autocomplete: 'off' }) as HTMLInputElement;
  const tamam = h('button.dugme', { type: 'button' }, 'Tamam');
  const gec = h('button.ince-dugme', { type: 'button' }, 'Geç');
  const form = h('div.or-isim-form', {}, h('b', {}, 'Büyükler için'), h('span', {}, 'Adını yazın, hecelerini birlikte alkışlasın.'), girdi, h('div', {}, tamam, ' ', gec));
  b.sahne.append(form);
  const basla = (ad: string) => {
    form.remove();
    if (ad) {
      kayit.isim = ad;
      kaydet();
      b.isim = ad;
    }
    ic = heceGorevi(ad ? K(ad) : KELIME.kedi, { demo: true, goster: true, isimMi: !!ad })(b, bitti);
    b.yaz(ic.yazi ?? ic.yonerge);
    void b.soyle(ic.yonerge).then(() => ic?.basla?.());
  };
  tamam.addEventListener('click', () => basla(girdi.value.trim().replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜâîû]/g, '')));
  gec.addEventListener('click', () => basla(''));
  return {
    yonerge: '',
    yazi: 'Büyüğün adını yazsın',
    kare: (o) => ic?.kare?.(o),
    tik: (dt) => ic?.tik?.(dt),
    bas: (p) => ic?.bas?.(p),
  };
};

/** 6 yaş: hangisi daha uzun? (dokun) */
function uzunGorevi(x: Kelime, y: Kelime): GorevFabrika {
  return (b, bitti) => {
    const hx = hecele(x.ad).length;
    const hy = hecele(y.ad).length;
    const kart = (k: Kelime, n: number, diger: number) => {
      const el = h('button.or-uzun-kart', { type: 'button', 'aria-label': k.ad }, resim(k.resim!, '', k.ad), h('span.or-heceler.kucuk', {}));
      el.addEventListener('click', async () => {
        if (el.classList.contains('secildi')) return;
        void b.soyle(`${buyukHarfBas(k.ad)}!`);
        if (n > diger) {
          el.classList.add('secildi');
          [xEl, yEl].forEach((c, i) => {
            const hc = hecele((i ? y : x).ad);
            c.querySelector('.or-heceler')!.replaceChildren(...hc.map((s) => h('span.or-hece.yandi', {}, s)));
          });
          parilti(b.sahne, 0.5, 0.45);
          setTimeout(bitti, 1600);
        } else {
          hmm();
          el.classList.remove('salla');
          void el.offsetWidth;
          el.classList.add('salla');
        }
      });
      return el;
    };
    const xEl = kart(x, hx, hy);
    const yEl = kart(y, hy, hx);
    b.sahne.append(h('div.or-uzun', {}, xEl, yEl));
    return { yonerge: E.uzun };
  };
}

export function heceGorevleri(yas: Yas): GorevFabrika[] {
  const d = { demo: true, goster: true };
  if (yas <= 3) return [heceGorevi(KELIME.top, d), heceGorevi(KELIME.kedi, d), heceGorevi(KELIME.balik, d)];
  if (yas === 4) return [isimGorevi, heceGorevi(KELIME.elma, d), heceGorevi(KELIME.araba, { demo: false, goster: true })];
  const s = { demo: false, goster: false };
  if (yas === 5) return [heceGorevi(KELIME.maymun, s), heceGorevi(KELIME.kelebek, s), heceGorevi(KELIME.zurafa, s)];
  return [heceGorevi(KELIME.kaplumbaga, s), uzunGorevi(KELIME.fil, KELIME.domates), heceGorevi(KELIME.helikopter, s)];
}
