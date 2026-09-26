/**
 * Davul Köyü: alkış. 3 yaş havai fişek · 4 yaş say ve alkışla (1-5) · 5 yaş ritim (uzun-kısa) · 6 yaş uzun ritim ve toplama.
 * Ritim tempoya göre değil, vuruş aralarının birbirine göre uzun/kısa olmasına göre değerlendirilir.
 */
import O from '../../content/orman.json';
import { h } from '../../src/ui/dom';
import { efekt } from '../../src/audio/ses';
import type { Yas } from '../../src/engine/types';
import { ritimAyniMi } from '../../ses-testi/src/analiz';
import { Alkis, type GorevFabrika } from './gorev';
import { fisek, parilti, RENKLER, resim } from './gorsel';
import { kulak } from './kulak';
import { adim, davul, hmm } from './sesler';

const D = O.davul;
const MEYVE = ['elma', 'cilek', 'portakal', 'armut', 'kiraz'];

/** 3 yaş: her alkışta havai fişek */
function fisekGorevi(adet: number): GorevFabrika {
  return (b, bitti) => {
    const a = new Alkis(b.ayar);
    const sayac = h('div.or-fisek-sayac', {}, ...Array.from({ length: adet }, () => h('i')));
    b.sahne.append(sayac);
    let n = 0;
    a.onAlkis = () => {
      if (n >= adet) return;
      kulak.sustur(450);
      efekt.konfeti(true);
      fisek(b.sahne, 0.2 + Math.random() * 0.6, 0.15 + Math.random() * 0.3, RENKLER[n % RENKLER.length]);
      sayac.children[n]?.classList.add('yandi');
      n++;
      if (n === adet) setTimeout(bitti, 1200);
    };
    return {
      yonerge: D.fisek,
      kare: (o) => a.kare(o),
      tik: () => a.tik(),
      bas: () => a.dokun(),
    };
  };
}

/** Meyveler: sayı kadar (gruplar: toplama için) */
function meyveler(gruplar: number[], tur: number): { el: HTMLElement; ogeler: HTMLElement[] } {
  const ad = MEYVE[tur % MEYVE.length];
  const ogeler: HTMLElement[] = [];
  const el = h('div.or-meyveler');
  gruplar.forEach((n, g) => {
    if (g > 0) el.append(h('b.or-arti', {}, '+'));
    const grup = h('div.or-meyve-grup');
    for (let i = 0; i < n; i++) {
      const m = h('div.or-meyve', {}, resim(`meyveler/${ad}`, '', ad));
      ogeler.push(m);
      grup.append(m);
    }
    el.append(grup);
  });
  return { el, ogeler };
}

/** 4 yaş: say ve o kadar alkışla · 6 yaş: iki grubu topla ve alkışla */
function sayGorevi(gruplar: number[]): GorevFabrika {
  return (b, bitti) => {
    const a = new Alkis(b.ayar);
    const hedef = gruplar.reduce((x, y) => x + y, 0);
    const m = meyveler(gruplar, b.tur);
    b.sahne.append(m.el);
    let bitmis = false;
    a.onAlkis = (n) => {
      davul(true, 0.35);
      m.ogeler[n - 1]?.classList.add('yandi');
      if (n <= hedef) adim(n);
    };
    a.onSeri = (s) => {
      if (bitmis) return;
      if (s.length === hedef) {
        bitmis = true;
        parilti(b.sahne, 0.5, 0.45);
        setTimeout(bitti, 1000);
        return;
      }
      hmm();
      void b.soyle(s.length > hedef ? D.fazla : D.az);
      setTimeout(() => m.ogeler.forEach((o) => o.classList.remove('yandi')), 700);
    };
    return {
      yonerge: gruplar.length > 1 ? D.topla : D.say,
      yazi: gruplar.length > 1 ? `${gruplar.join(' + ')} = ?` : undefined,
      kare: (o) => a.kare(o),
      tik: () => a.tik(),
      bas: () => a.dokun(),
    };
  };
}

/** Ritim: maymun davulla çalar (u = uzun ara, k = kısa ara), çocuk aynısını alkışlar */
function ritimGorevi(kalip: ('u' | 'k')[]): GorevFabrika {
  return (b, bitti) => {
    const a = new Alkis(b.ayar, 1.6);
    const ARA = { k: 0.38, u: 0.85 };
    const zamanlar = [0];
    for (const k of kalip) zamanlar.push(zamanlar[zamanlar.length - 1] + ARA[k]);
    const toplam = zamanlar[zamanlar.length - 1];
    const hedefSira = h('div.or-ritim.hedef', {}, ...zamanlar.map((t) => h('i', { style: `--x:${t / toplam}` })));
    const cocukSira = h('div.or-ritim.cocuk');
    const davulEl = h('div.or-davul', {}, resim('hayvanlar/maymun', 'or-davulcu', 'Maymun'), resim('orman-esya/davul', 'or-davul-resim', 'Davul'));
    const dinle = h('button.or-dinle', { type: 'button', 'aria-label': 'Tekrar dinle' }, '♪');
    b.sahne.append(davulEl, hedefSira, cocukSira, dinle);
    let caliyor = false;
    let bitmis = false;
    let deneme = 0;
    const cal = async () => {
      caliyor = true;
      a.sifirla();
      cocukSira.replaceChildren();
      const t0 = performance.now();
      for (let i = 0; i < zamanlar.length; i++) {
        await new Promise((r) => setTimeout(r, Math.max(0, t0 + zamanlar[i] * 1000 - performance.now())));
        davul(true, 0.5);
        davulEl.classList.remove('vur');
        void davulEl.offsetWidth;
        davulEl.classList.add('vur');
        hedefSira.children[i]?.classList.add('yandi');
      }
      await new Promise((r) => setTimeout(r, 500));
      hedefSira.querySelectorAll('.yandi').forEach((e) => e.classList.remove('yandi'));
      kulak.sustur(300);
      a.sifirla();
      cocukSira.replaceChildren();
      caliyor = false;
    };
    a.onAlkis = () => {
      if (caliyor) return;
      davul(false, 0.25);
      cocukSira.append(h('i'));
    };
    a.onSeri = (s) => {
      if (caliyor || bitmis) return;
      const ilk = s[0];
      const son = s[s.length - 1] - ilk || 1;
      cocukSira.replaceChildren(...s.map((t) => h('i', { style: `--x:${(t - ilk) / son}` })));
      cocukSira.classList.add('yerlesti');
      deneme++;
      const sayiTutar = s.length === zamanlar.length;
      const kalipTutar = sayiTutar && ritimAyniMi(zamanlar, s);
      // 5 yaş: iki denemeden sonra sayı tutması yeter
      if (kalipTutar || (sayiTutar && b.yas <= 5 && deneme >= 3)) {
        bitmis = true;
        parilti(b.sahne, 0.5, 0.4);
        setTimeout(bitti, 1100);
        return;
      }
      hmm();
      setTimeout(() => {
        cocukSira.classList.remove('yerlesti');
        void cal();
      }, 1400);
    };
    dinle.addEventListener('click', () => !caliyor && void cal());
    return {
      yonerge: D.ritim,
      basla: () => void cal(),
      kare: (o) => a.kare(o),
      tik: () => a.tik(),
      bas: () => a.dokun(),
    };
  };
}

export function davulGorevleri(yas: Yas): GorevFabrika[] {
  if (yas <= 3) return [fisekGorevi(3), fisekGorevi(4), fisekGorevi(5)];
  if (yas === 4) return [sayGorevi([2]), sayGorevi([3]), sayGorevi([4])];
  if (yas === 5) return [ritimGorevi(['k', 'k']), ritimGorevi(['u', 'k']), ritimGorevi(['u', 'k', 'k'])];
  return [ritimGorevi(['k', 'k', 'u', 'k']), sayGorevi([2, 3]), ritimGorevi(['u', 'k', 'k', 'u', 'k'])];
}
