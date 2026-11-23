/**
 * Sen Sor (Seviye 3): roller değişir. Soru – cevap adımında Polly sordu, çocuk cevapladı; burada çocuk sorar, Polly
 * cevaplar. Resim görünür, soru bantta yazar; Polly soruyu bir kez örnek olarak söyler (aynı soru yeniden geldiğinde
 * örnek yinelenmez), çocuk kendi sesiyle sorar, Polly resme bakıp tam cümleyle cevap verir.
 * Soru sormak konuşmanın öbür yarısıdır: çocuk yalnız cevap veren değil, konuşmayı başlatan olur.
 */
import { h } from '../../../src/ui/dom';
import { cumleBandi, gorselCiz } from '../gorsel';
import { harfleriYak, hareket, kutla, pozBirak, pozTut } from '../kit';
import type { SenSorTuru } from '../plan';
import { balonYaz, oyunDuzeni, ovgu, sira as soyleSirasi, soruBalonu, soylet, yasam, yonerge, type AdimKurucu } from './ortak';

export const senSorKur: AdimKurucu<'sensor'> = (b, a) => {
  const y = yasam();
  let no = 0, bekliyor = false, tur: SenSorTuru = a.turlar[0], bant: HTMLElement | undefined;
  const ornek = () => { harfleriYak(bant ?? null, 1100); void y.soyle(tur.soru.ses); };
  const tekrarSoz = () => { if (bekliyor) ornek(); };
  const { masa } = oyunDuzeni(b.alan, 'ing-sohbet ing-sensor', tekrarSoz);
  const resimYeri = h('div.ing-sohbet-resim');
  const bantYeri = h('div.ing-sensor-bant');
  const altlik = h('div.ing-kur-alt');
  masa.append(resimYeri, h('div.ing-sensor-sag', {}, bantYeri, altlik));
  // Polly'nin cevabı kendi balonunda yazar
  const balon = soruBalonu(masa);

  async function turGoster() {
    tur = a.turlar[no];
    bekliyor = false;
    balon.classList.remove('ing-gorunur');
    resimYeri.replaceChildren(gorselCiz(tur.soru.g));
    resimYeri.classList.remove('ing-geldi'); void resimYeri.offsetWidth; resimYeri.classList.add('ing-geldi');
    bant = cumleBandi({ id: tur.soru.ses, en: tur.soru.en, tr: tur.soru.tr });
    bantYeri.replaceChildren(bant);
    if (tur.ornekli) {
      harfleriYak(bant, 1100);
      if (!(await y.soyle(tur.soru.ses))) return;
    }
    if (no === 0 && !(await y.soyle(soyleSirasi()))) return;
    bekliyor = true;
    // çocuk sorarken Polly kanadını kulağına götürüp dinler (çizimi geldiyse: kisi/polly-dinle-0)
    pozTut('polly', 'dinle-0');
    await soylet(altlik, y, { beklenen: tur.soru.en });
    pozBirak('polly');
    if (!y.acik) return;
    bekliyor = false;
    // Polly cevaplar
    balonYaz(balon, tur.cevap.en);
    kutla(resimYeri);
    void hareket('polly', 'sevin');
    if (!(await y.soyle(tur.cevap.ses))) return;
    if (!(await y.dur(600))) return;
    no++;
    if (no >= a.turlar.length) {
      if (!(await y.soyle(ovgu()))) return;
      b.bitti();
      return;
    }
    void turGoster();
  }

  bantYeri.addEventListener('click', () => { if (bekliyor) ornek(); });
  b.tekrarla(tekrarSoz);
  void (async () => {
    if (!a.turlar.length) { b.bitti(); return; }
    if (b.ilkKez('sensor') && !(await y.soyle(yonerge('tr/c-sensor-giris', 'tr/c-sen-soyle')))) return;
    void turGoster();
  })();
  return () => { pozBirak('polly'); y.kapat(); };
};
