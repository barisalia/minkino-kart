/**
 * Obur'u Besle: Harf Atölyesi'ndeki Obur burada da aç. Polly bir kelime söyler, çocuk o kartı Obur'a verir.
 * Obur doğru kartı yer, yanlış kartı geri verir (yanlış kartın adı da söylenir).
 */
import { h } from '../../../src/ui/dom';
import { dugme, hareket, ipucuKur, kelimeResmi, kutla, salla, ucur } from '../kit';
import type { Soru } from '../plan';
import { tik } from '../ses';
import { obur } from '../varlik';
import { kelimeMetni } from '../icerik';
import { balonYaz, oyunDuzeni, soruBalonu, yasam, type AdimKurucu } from './ortak';

export const besleKur: AdimKurucu<'besle'> = (b, a) => {
  const y = yasam();
  let no = 0, kilit = true, yanlis = 0, soru: Soru = a.sorular[0];
  const { masa } = oyunDuzeni(b.alan, 'ing-besle', () => { if (!kilit) void y.soyle(`en/w-${soru.hedef.id}`); });
  const oburEl = h('img.ing-obur', { src: obur('bekle') ?? '', alt: 'Obur', draggable: 'false' });
  const tepsi = h('div.ing-secenekler.ing-tepsi');
  const orta = h('div.ing-besle-orta', {}, tepsi, oburEl);
  masa.append(orta);
  const yazi = soruBalonu(masa);
  const oburHali = (hal: 'ac' | 'bekle' | 'eksi' | 'tok') => { const adres = obur(hal); if (adres) oburEl.src = adres; oburEl.dataset.hal = hal; };

  async function soruGoster() {
    soru = a.sorular[no];
    yanlis = 0; kilit = true;
    balonYaz(yazi, kelimeMetni(soru.hedef).replace('.', '!'));
    oburHali('bekle');
    tepsi.dataset.adet = String(soru.secenekler.length);
    tepsi.replaceChildren(...soru.secenekler.map((w, i) => {
      const d = dugme('ing-secim', w.tr, () => void ver(w.id, d), kelimeResmi(w));
      d.dataset.kelime = w.id;
      d.style.setProperty('--n', String(i));
      return d;
    }));
    if (!(await y.dur(300))) return;
    oburHali('ac');
    if (!(await y.soyle(`en/w-${soru.hedef.id}`))) return;
    kilit = false;
    ipucuKur(() => (yanlis >= 2 ? tepsi.querySelector(`[data-kelime="${soru.hedef.id}"]`) : null), 5000);
  }

  async function ver(id: string, d: HTMLButtonElement) {
    if (kilit) return;
    kilit = true;
    const hedef = soru.hedef;
    d.classList.add('ing-ucuyor');
    await ucur(d, oburEl, { kucul: 0.3, sure: 520 });
    if (!y.acik) return;
    if (id !== hedef.id) {
      if (yanlis === 0) b.hata();
      yanlis++;
      oburHali('eksi');
      tik.yanlis();
      d.classList.remove('ing-ucuyor');
      salla(d);
      if (!(await y.soyle(`en/w-${id}`))) return;
      oburHali('ac');
      if (!(await y.soyle(`en/w-${hedef.id}`))) return;
      kilit = false;
      return;
    }
    ipucuKur(undefined);
    b.cevap(hedef.id, yanlis === 0);
    oburHali('tok');
    tik.yapis();
    kutla(oburEl);
    d.classList.add('ing-yendi');
    if (no % 2 === 0) void hareket('polly', 'sevin');
    if (!(await y.soyle('en/g-yummy', `en/c-${hedef.id}`))) return;
    no++;
    if (no >= a.sorular.length) b.bitti();
    else void soruGoster();
  }

  b.tekrarla(() => { if (!kilit) void y.soyle(`en/w-${soru.hedef.id}`); });
  void (async () => {
    if (b.ilkKez('besle') && !(await y.soyle('tr/c-besle-giris'))) return;
    void soruGoster();
  })();
  return () => y.kapat();
};
