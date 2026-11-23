/**
 * Ne Eksik?: rafta resimler durur, Polly hepsini sayar, perde kapanır, biri kaybolur. "What's missing?"
 * Çocuk kelimeyi resim önünde yokken hatırlamak zorunda kalır (geri çağırmanın en güçlü biçimi).
 */
import { h } from '../../../src/ui/dom';
import { cizim, dugme, ipucuKur, kelimeResmi, kutla, salla, ziplat } from '../kit';
import type { EksikTuru } from '../plan';
import { tik } from '../ses';
import { oyunDuzeni, yasam, type AdimKurucu } from './ortak';

export const eksikKur: AdimKurucu<'eksik'> = (b, a) => {
  const y = yasam();
  let no = 0, kilit = true, yanlis = 0, tur: EksikTuru = a.turlar[0];
  const { masa } = oyunDuzeni(b.alan, 'ing-eksik', () => { if (!kilit) void y.soyle('en/g-whats-missing'); });
  const raf = h('div.ing-raf');
  const perde = h('div.ing-perde', { 'aria-hidden': 'true' }, cizim('oyun/perde', 'ing-perde-sol'), cizim('oyun/perde', 'ing-perde-sag'));
  const sahne = h('div.ing-eksik-sahne', {}, raf, perde);
  const secenekler = h('div.ing-secenekler');
  masa.append(sahne, secenekler);

  async function turGoster() {
    tur = a.turlar[no];
    yanlis = 0; kilit = true;
    secenekler.replaceChildren();
    perde.classList.remove('ing-kapali');
    const yuvalar = tur.gosterilen.map((w) => {
      const yuva = h('span.ing-raf-yuva', { 'data-kelime': w.id }, kelimeResmi(w));
      return yuva;
    });
    raf.replaceChildren(...yuvalar);
    if (!(await y.dur(350))) return;
    // Polly raftakileri tek tek sayar
    for (let i = 0; i < tur.gosterilen.length; i++) {
      const w = tur.gosterilen[i];
      yuvalar[i].classList.add('ing-vurgu');
      void ziplat(yuvalar[i].firstElementChild as HTMLElement, w);
      if (!(await y.soyle(`en/w-${w.id}`))) return;
      yuvalar[i].classList.remove('ing-vurgu');
    }
    tik.ucus();
    perde.classList.add('ing-kapali');
    if (!(await y.dur(750))) return;
    const eksikYuva = yuvalar.find((el) => el.dataset.kelime === tur.eksik.id)!;
    eksikYuva.classList.add('ing-bos');
    perde.classList.remove('ing-kapali');
    if (!(await y.dur(550))) return;
    if (!(await y.soyle('en/g-whats-missing', ...(b.ilkKez('eksik-sor') ? ['tr/c-eksik-sor'] : [])))) return;
    secenekler.dataset.adet = String(tur.secenekler.length);
    secenekler.replaceChildren(...tur.secenekler.map((w, i) => {
      const d = dugme('ing-secim', w.tr, () => void sec(w.id, d), kelimeResmi(w));
      d.dataset.kelime = w.id;
      d.style.setProperty('--n', String(i));
      return d;
    }));
    kilit = false;
    ipucuKur(() => (yanlis >= 2 ? secenekler.querySelector(`[data-kelime="${tur.eksik.id}"]`) : null), 5000);
  }

  async function sec(id: string, d: HTMLButtonElement) {
    if (kilit) return;
    if (id !== tur.eksik.id) {
      if (yanlis === 0) b.hata();
      yanlis++;
      salla(d);
      kilit = true;
      // dokunduğu resim hâlâ rafta: orada zıplar ve adını söyler
      const rafta = raf.querySelector<HTMLElement>(`[data-kelime="${id}"] .ing-resim`);
      const w = tur.gosterilen.find((x) => x.id === id);
      void ziplat(rafta, w);
      if (!(await y.soyle(`en/w-${id}`, 'en/g-whats-missing'))) return;
      kilit = false;
      return;
    }
    kilit = true;
    ipucuKur(undefined);
    b.cevap(tur.eksik.id, yanlis === 0);
    const yuva = raf.querySelector<HTMLElement>(`[data-kelime="${id}"]`)!;
    yuva.classList.remove('ing-bos');
    kutla(yuva);
    void ziplat(yuva.firstElementChild as HTMLElement, tur.eksik);
    if (!(await y.soyle('en/g-yes', `en/c-${tur.eksik.id}`))) return;
    no++;
    if (no >= a.turlar.length) b.bitti();
    else void turGoster();
  }

  b.tekrarla(() => { if (!kilit) void y.soyle('en/g-whats-missing'); });
  void (async () => {
    if (b.ilkKez('eksik') && !(await y.soyle('tr/c-eksik-giris'))) return;
    void turGoster();
  })();
  return () => y.kapat();
};
