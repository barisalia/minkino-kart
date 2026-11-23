/**
 * Balon Patlat: resimli balonlar yükselir, Polly bir kelime söyler, çocuk o balonu patlatır.
 * Balonlar yanıt gelene kadar dönüp durur (süre baskısı ve kaybetme yok). Yanlış balona dokununca o resmin adını duyar.
 */
import { h } from '../../../src/ui/dom';
import { cizim, dugme, hareket, kelimeResmi, kutla, salla } from '../kit';
import type { Soru } from '../plan';
import { tik } from '../ses';
import { resim } from '../varlik';
import { kelimeMetni } from '../icerik';
import { balonYaz, oyunDuzeni, soruBalonu, yasam, type AdimKurucu } from './ortak';

const RENKLER = ['kirmizi', 'mavi', 'sari', 'yesil', 'pembe'];
/** Renk kelimesinin balon çizimi (oyun/balon-<ad>.webp) */
const RENK_BALONU: Record<string, string> = { red: 'kirmizi', blue: 'mavi', yellow: 'sari', green: 'yesil', pink: 'pembe', orange: 'turuncu' };

export const balonKur: AdimKurucu<'balon'> = (b, a) => {
  const y = yasam();
  let no = 0, kilit = true, yanlis = 0, soru: Soru = a.sorular[0], hatirlatma = 0;
  const { masa } = oyunDuzeni(b.alan, 'ing-balon-oyunu', () => { if (!kilit) void y.soyle(`en/w-${soru.hedef.id}`); });
  const gok = h('div.ing-gok');
  masa.append(gok);
  const yazi = soruBalonu(masa);

  function hatirlat() {
    clearTimeout(hatirlatma);
    // çocuk beklerse kelime arada bir yinelenir
    hatirlatma = y.sonra(() => { if (!kilit) void y.soyle(`en/w-${soru.hedef.id}`).then(hatirlat); else hatirlat(); }, 5200);
  }

  async function soruGoster() {
    soru = a.sorular[no];
    yanlis = 0; kilit = true;
    balonYaz(yazi, kelimeMetni(soru.hedef).replace('.', '!'));
    const adet = soru.secenekler.length;
    const kayma = Math.floor(Math.random() * RENKLER.length);
    // renk sorusu: her seçeneğin kendi renginde balonu varsa balonlar resimsiz, yalnız renkleriyle uçar
    const renkTuru = soru.secenekler.every((w) => w.tur === 'renk' && !!resim(`oyun/balon-${RENK_BALONU[w.id]}`));
    gok.replaceChildren(...soru.secenekler.map((w, i) => {
      const renk = renkTuru ? RENK_BALONU[w.id] : RENKLER[(i + kayma) % RENKLER.length];
      const govde = h('span.ing-balon-govde', {}, cizim(`oyun/balon-${renk}`, 'ing-balon-cizim'), renkTuru ? null : kelimeResmi(w));
      const d = dugme('ing-balon', w.tr, () => void patlat(w.id, d), govde);
      d.dataset.kelime = w.id;
      d.dataset.renk = renk;
      // balonlar yan yana kulvarlarda, farklı hız ve gecikmeyle yükselir
      d.style.setProperty('--x', `${((i + 0.5) / adet) * 100}%`);
      d.style.setProperty('--sure', `${7 + ((i * 1.7 + no) % 3)}s`);
      d.style.setProperty('--gecikme', `${-(i * 2.3 + (no % 2)) % 6}s`);
      return d;
    }));
    if (!(await y.soyle(`en/w-${soru.hedef.id}`))) return;
    kilit = false;
    hatirlat();
  }

  async function patlat(id: string, d: HTMLButtonElement) {
    if (kilit) return;
    const hedef = soru.hedef;
    if (id !== hedef.id) {
      if (yanlis === 0) b.hata();
      yanlis++;
      salla(d.firstElementChild!);
      kilit = true;
      if (!(await y.soyle(`en/w-${id}`, `en/w-${hedef.id}`))) return;
      if (yanlis >= 2) gok.querySelector(`[data-kelime="${hedef.id}"]`)?.classList.add('ing-parla');
      kilit = false;
      hatirlat();
      return;
    }
    kilit = true;
    clearTimeout(hatirlatma);
    b.cevap(hedef.id, yanlis === 0);
    tik.yapis();
    kutla(d);
    d.classList.add('ing-patladi');
    const pat = cizim('oyun/balon-pat', 'ing-balon-pat');
    if (pat) d.append(pat);
    gok.classList.add('ing-dagil');
    if (no % 2 === 0) void hareket('polly', 'sevin');
    if (!(await y.soyle('en/g-yes', `en/c-${hedef.id}`))) return;
    gok.classList.remove('ing-dagil');
    no++;
    if (no >= a.sorular.length) b.bitti();
    else void soruGoster();
  }

  b.tekrarla(() => { if (!kilit) void y.soyle(`en/w-${soru.hedef.id}`); });
  void (async () => {
    if (b.ilkKez('balon') && !(await y.soyle('tr/c-balon-giris'))) return;
    void soruGoster();
  })();
  return () => { clearTimeout(hatirlatma); y.kapat(); };
};
