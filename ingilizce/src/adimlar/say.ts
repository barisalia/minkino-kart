/**
 * Kaç Tane? (Sayılar ünitesine özel): masada birkaç tane aynı şey durur, Polly sorar ("How many?"), çocuk doğru rakama
 * dokunur. Bilince Polly hepsini tek tek sayar, sayılan zıplar: sayı kelimesi gerçek bir sayma işine bağlanır.
 * İki yanlıştan sonra Polly birlikte sayar ve doğru rakam parlar.
 */
import { h } from '../../../src/ui/dom';
import { SAYI_KELIMELERI } from '../icerik';
import { cizim, dugme, hareket, ipucuKur, kelimeResmi, kutla, salla, ziplat } from '../kit';
import type { SayTuru } from '../plan';
import { balonYaz, oyunDuzeni, soruBalonu, yasam, type AdimKurucu } from './ortak';

export const sayKur: AdimKurucu<'say'> = (b, a) => {
  const y = yasam();
  let no = 0, kilit = true, yanlis = 0, tur: SayTuru = a.turlar[0];
  const { masa } = oyunDuzeni(b.alan, 'ing-say', () => { if (!kilit) void y.soyle('en/g-how-many'); });
  const tezgah = h('div.ing-say-tezgah');
  const secenekler = h('div.ing-secenekler');
  masa.append(tezgah, secenekler);
  const balon = soruBalonu(masa);
  let nesneler: HTMLElement[] = [];

  /** Polly tek tek sayar; sayılan nesne zıplar */
  async function birlikteSay(): Promise<boolean> {
    for (let i = 0; i < tur.adet; i++) {
      nesneler[i]?.classList.add('ing-sayildi');
      void ziplat(nesneler[i], tur.nesne ?? undefined);
      if (!(await y.soyle(`en/w-${SAYI_KELIMELERI[i]}`))) return false;
    }
    return true;
  }

  async function turGoster() {
    tur = a.turlar[no];
    yanlis = 0; kilit = true;
    balonYaz(balon, 'How many?');
    nesneler = Array.from({ length: tur.adet }, (_, i) => {
      const el = tur.nesne ? kelimeResmi(tur.nesne, 'ing-say-nesne') : h('span.ing-resim.ing-say-nesne', {}, cizim('ui/yildiz'));
      el.style.setProperty('--n', String(i));
      return el;
    });
    tezgah.dataset.adet = String(tur.adet);
    tezgah.replaceChildren(...nesneler);
    secenekler.dataset.adet = String(tur.secenekler.length);
    secenekler.replaceChildren(...tur.secenekler.map((w, i) => {
      const d = dugme('ing-secim', w.tr, () => void sec(w.id, d), kelimeResmi(w));
      d.dataset.kelime = w.id;
      d.style.setProperty('--n', String(i));
      return d;
    }));
    if (!(await y.dur(350 + tur.adet * 90)) || !(await y.soyle('en/g-how-many'))) return;
    kilit = false;
    ipucuKur(() => (yanlis >= 2 ? secenekler.querySelector(`[data-kelime="${tur.hedef.id}"]`) : null), 5000);
  }

  async function sec(id: string, d: HTMLButtonElement) {
    if (kilit) return;
    if (id !== tur.hedef.id) {
      if (yanlis === 0) b.hata();
      yanlis++;
      salla(d);
      kilit = true;
      if (!(await y.soyle(`en/w-${id}`))) return;
      if (yanlis >= 2) {
        // birlikte sayalım: doğru rakam parlar
        if (!(await birlikteSay())) return;
        nesneler.forEach((el) => el.classList.remove('ing-sayildi'));
        secenekler.querySelector(`[data-kelime="${tur.hedef.id}"]`)?.classList.add('ing-parla');
      } else if (!(await y.soyle('en/g-how-many'))) return;
      kilit = false;
      return;
    }
    kilit = true;
    ipucuKur(undefined);
    b.cevap(tur.hedef.id, yanlis === 0);
    d.classList.add('ing-dogru');
    secenekler.classList.add('ing-bitti');
    kutla(d);
    if (no % 2 === 0) void hareket('polly', 'sevin');
    if (!(await y.soyle('en/g-yes')) || !(await birlikteSay())) return;
    if (!(await y.dur(350))) return;
    secenekler.classList.remove('ing-bitti');
    no++;
    if (no >= a.turlar.length) b.bitti();
    else void turGoster();
  }

  b.tekrarla(() => { if (!kilit) void y.soyle('en/g-how-many'); });
  void (async () => {
    if (b.ilkKez('say') && !(await y.soyle('tr/c-say-giris'))) return;
    void turGoster();
  })();
  return () => y.kapat();
};
