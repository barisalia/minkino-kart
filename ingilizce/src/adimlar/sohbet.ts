/**
 * Soru – Cevap (Seviye 3): Polly resme bakıp sorar ("What is it?", "How many?", "Where is the cat?"), çocuk cevap
 * balonlarından doğru olana dokunur; Polly cevabı tam cümleyle söyler. Her iki soruda bir çocuk cevabı kendi sesiyle
 * de söyler. "Do you like apples?" gibi sorularda iki cevap da doğrudur: çocuk kendi cevabını verir.
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import type { Ifade } from '../icerik2';
import { gorselCiz } from '../gorsel';
import { dugme, hareket, ipucuKur, kutla, salla } from '../kit';
import type { SohbetTuru } from '../plan';
import { balonYaz, oyunDuzeni, ovgu, sira as soyleSirasi, soruBalonu, soylet, yasam, type AdimKurucu } from './ortak';

export const sohbetKur: AdimKurucu<'sohbet'> = (b, a) => {
  const y = yasam();
  let no = 0, kilit = true, yanlis = 0, tur: SohbetTuru = a.turlar[0];
  const tekrarSoz = () => { if (!kilit) void y.soyle(tur.soru.ses); };
  const { masa } = oyunDuzeni(b.alan, 'ing-sohbet', tekrarSoz);
  const resimYeri = h('div.ing-sohbet-resim');
  const cevaplar = h('div.ing-cevaplar');
  const altlik = h('div.ing-kur-alt');
  masa.append(resimYeri, cevaplar, altlik);
  const balon = soruBalonu(masa);
  const dogruDugme = () => cevaplar.querySelector<HTMLElement>(`[data-ifade="${tur.soru.dogru.id}"]`);

  async function turGoster() {
    tur = a.turlar[no];
    kilit = true; yanlis = 0;
    altlik.replaceChildren();
    balonYaz(balon, tur.soru.en);
    resimYeri.replaceChildren(gorselCiz(tur.soru.g));
    cevaplar.dataset.adet = String(tur.secenekler.length);
    if (TEST_MODU) cevaplar.dataset.hedef = tur.soru.dogru.id;
    cevaplar.replaceChildren(...tur.secenekler.map((c, i) => {
      // evet / hayır cevaplarında resim simgedir; öbürlerinde cevap balonu yalnız yazıdır (resim sorunun kendisinde)
      const simge = c.g.ozel?.startsWith('ui/') ? gorselCiz(c.g, 'ing-cevap-simge') : null;
      const d = dugme('ing-cevap', c.tr, () => void sec(c, d), simge, h('strong', { lang: 'en-US' }, c.en));
      d.dataset.ifade = c.id;
      d.style.setProperty('--n', String(i));
      return d;
    }));
    if (!(await y.soyle(tur.soru.ses))) return;
    kilit = false;
    ipucuKur(() => (yanlis >= 2 ? dogruDugme() : null), 6000);
  }

  async function sec(c: Ifade, d: HTMLButtonElement) {
    if (kilit) return;
    if (!tur.soru.serbest && c.id !== tur.soru.dogru.id) {
      if (yanlis === 0) b.hata();
      yanlis++;
      salla(d);
      kilit = true;
      if (!(await y.soyle(c.ses, tur.soru.ses))) return;
      if (yanlis >= 2) dogruDugme()?.classList.add('ing-parla');
      kilit = false;
      return;
    }
    kilit = true;
    ipucuKur(undefined);
    d.classList.add('ing-dogru');
    cevaplar.classList.add('ing-bitti');
    kutla(d);
    void hareket('polly', 'sevin');
    if (!(await y.soyle(c.ses))) return;
    if (no % 2 === 1 || no === a.turlar.length - 1) {
      if (!(await y.soyle(soyleSirasi()))) return;
      await soylet(altlik, y, { beklenen: c.en, ornek: c.yavas });
      if (!y.acik) return;
      if (!(await y.soyle(ovgu()))) return;
    } else if (!(await y.dur(300))) return;
    cevaplar.classList.remove('ing-bitti');
    no++;
    if (no >= a.turlar.length) { b.bitti(); return; }
    void turGoster();
  }

  b.tekrarla(tekrarSoz);
  void (async () => {
    if (!a.turlar.length) { b.bitti(); return; }
    if (!(await y.soyle(a.aciklama))) return;
    void turGoster();
  })();
  return () => y.kapat();
};
