/**
 * Cümle Kur (Seviye 2 ve 3): Polly bir cümle söyler, taşlar karışık durur; çocuk taşlara cümledeki sırayla dokunur.
 * Her taş dokununca kendi sesini söyler (okuma bilmeyen çocuk taşı resminden ve sesinden tanır). Doğru taş şeride
 * yerleşir; yanlış taş sallanır ve adını söyler, ceza yoktur. Cümle tamamlanınca Polly bütününü söyler ve sözcükler
 * sırayla yanar. Adımın son cümlesini çocuk kendi sesiyle de söyler.
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import type { Parca } from '../icerik2';
import { cumleBandi, gorselCiz, tasIcerigi } from '../gorsel';
import { dugme, harfleriYak, hareket, ipucuKur, kutla, salla } from '../kit';
import type { KurTuru } from '../plan';
import { tik } from '../ses';
import { ovgu, sira as soyleSirasi, soylet, yasam, oyunDuzeni, type AdimKurucu } from './ortak';

const ayni = (a: Parca, b: Parca) => a.en.toLowerCase() === b.en.toLowerCase();

export const kurKur: AdimKurucu<'kur'> = (b, a) => {
  const y = yasam();
  let no = 0, kilit = true, yanlis = 0, siradaki = 0, tur: KurTuru = a.turlar[0];
  const tekrarSoz = () => { if (!kilit) void y.soyle(tur.ifade.ses); };
  const { masa } = oyunDuzeni(b.alan, 'ing-kur', tekrarSoz);
  const resimYeri = h('div.ing-kur-resim');
  const serit = h('div.ing-kur-serit', { 'aria-label': 'Cümle' });
  const taslar = h('div.ing-kur-taslar');
  const altlik = h('div.ing-kur-alt');
  masa.append(resimYeri, serit, taslar, altlik);
  const dogruTas = () => [...taslar.querySelectorAll<HTMLElement>('.ing-tas:not(.ing-kullanildi)')].find((d) => d.dataset.en === tur.ifade.parcalar[siradaki]?.en.toLowerCase());

  async function turGoster() {
    tur = a.turlar[no];
    kilit = true; yanlis = 0; siradaki = 0;
    altlik.replaceChildren();
    resimYeri.replaceChildren(gorselCiz(tur.ifade.g));
    serit.classList.remove('ing-tamam');
    serit.replaceChildren(...tur.ifade.parcalar.map(() => h('span.ing-kur-yuva')));
    taslar.replaceChildren(...tur.taslar.map((p, i) => {
      const d = dugme('ing-tas', p.en, () => void dokun(p, d), ...tasIcerigi(p));
      d.dataset.en = p.en.toLowerCase();
      d.style.setProperty('--n', String(i));
      // testte doğru sıra okunabilsin: taşın cümledeki yeri (fazladan taş -1)
      if (TEST_MODU) d.dataset.sira = String(tur.ifade.parcalar.findIndex((x) => ayni(x, p)));
      return d;
    }));
    if (!(await y.soyle(tur.ifade.ses))) return;
    kilit = false;
    ipucuKur(() => (yanlis >= 2 ? dogruTas() : null), 6000);
  }

  async function dokun(p: Parca, d: HTMLButtonElement) {
    if (kilit || d.classList.contains('ing-kullanildi')) return;
    const beklenen = tur.ifade.parcalar[siradaki];
    if (!ayni(p, beklenen)) {
      if (yanlis === 0) b.hata();
      yanlis++;
      salla(d);
      kilit = true;
      // dokunduğu taşın sesini duyar; iki yanlıştan sonra sıradaki taş parlar
      if (!(await y.soyle(p.ses))) return;
      if (yanlis >= 2) dogruTas()?.classList.add('ing-parla');
      kilit = false;
      return;
    }
    kilit = true;
    ipucuKur(undefined);
    tik.yapis();
    taslar.querySelectorAll('.ing-parla').forEach((x) => x.classList.remove('ing-parla'));
    d.classList.add('ing-kullanildi');
    const yuva = serit.children[siradaki] as HTMLElement;
    const kopya = h('span.ing-tas.ing-yerinde', {}, ...tasIcerigi(p));
    yuva.replaceChildren(kopya);
    yuva.classList.add('ing-dolu');
    siradaki++;
    if (!(await y.soyle(p.ses))) return;
    if (siradaki < tur.ifade.parcalar.length) { kilit = false; return; }
    await tamamla();
  }

  async function tamamla() {
    serit.classList.add('ing-tamam');
    kutla(serit);
    void hareket('polly', 'sevin');
    const bant = cumleBandi(tur.ifade, 'ing-kur-bant');
    altlik.replaceChildren(bant);
    harfleriYak(bant, 1200);
    if (!(await y.soyle(tur.ifade.ses))) return;
    // adımın son cümlesini çocuk da söyler
    if (no === a.turlar.length - 1) {
      if (!(await y.soyle(soyleSirasi()))) return;
      await soylet(altlik, y, { beklenen: tur.ifade.en, ornek: tur.ifade.yavas });
      if (!y.acik) return;
      if (!(await y.soyle(ovgu()))) return;
    } else if (!(await y.dur(350))) return;
    no++;
    if (no >= a.turlar.length) { b.bitti(); return; }
    void turGoster();
  }

  b.tekrarla(tekrarSoz);
  void (async () => {
    if (!a.turlar.length) { b.bitti(); return; }
    if (b.ilkKez('kur') && !(await y.soyle('tr/c-kur-giris'))) return;
    void turGoster();
  })();
  return () => y.kapat();
};
