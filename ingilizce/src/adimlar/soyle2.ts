/**
 * Sen Söyle (Seviye 2 şenliği) ve Hikâyeyi Sen Anlat (Seviye 3): çocuk cümleleri kendi sesiyle söyler. Polly cümleyi
 * söyler, sözcükler bantta sırayla yanar, sıra çocuğa geçer; söyleyince resim renklenir ve alttaki sırada yerini alır.
 * Hikâye dersinde resimler hikâyenin sayfalarıdır: çocuk hikâyeyi baştan sona kendisi anlatmış olur.
 */
import { h } from '../../../src/ui/dom';
import { cumleBandi, gorselCiz } from '../gorsel';
import { harfleriYak, hareket, kisi, kutla } from '../kit';
import { tik } from '../ses';
import { ovgu, sira as soyleSirasi, soylet, yasam, yonerge, yuzYuze, type AdimKurucu } from './ortak';

export const soyle2Kur: AdimKurucu<'soyle2'> = (b, a) => {
  const y = yasam();
  let no = 0, bekliyor = false, bant: HTMLElement | undefined;
  const { tahta } = yuzYuze(b.alan, a.hikaye ? 'ing-soyle ing-soyle2 ing-soyle2-hikaye' : 'ing-soyle ing-soyle2');
  const kart = h('div.ing-anlat-kart.ing-soyle2-kart');
  const bantYeri = h('div.ing-bant-yeri');
  const altlik = h('div.ing-tanis-alt');
  const siraYeri = h('div.ing-cikartma-sira.ing-soyle2-sira', { 'aria-hidden': 'true' });
  tahta.append(h('div.ing-kart-yuva', {}, kart, kisi('polly', 'ing-polly-tunek')), bantYeri, altlik, siraYeri);

  function siraCiz() {
    siraYeri.replaceChildren(...a.ifadeler.map((f, i) => {
      const el = h('span.ing-soyle2-mini', {}, gorselCiz(f.g));
      if (i >= no) el.classList.add('ing-gri');
      if (i === no) el.classList.add('ing-simdi');
      return el;
    }));
  }
  const yeniden = () => { harfleriYak(bant ?? null, 1400); void y.soyle(a.ifadeler[no].ses); };

  async function cumle() {
    const f = a.ifadeler[no];
    bekliyor = false;
    siraCiz();
    kart.replaceChildren(gorselCiz(f.g));
    kart.classList.remove('ing-geldi', 'ing-kazanildi'); void kart.offsetWidth; kart.classList.add('ing-geldi');
    bant = cumleBandi(f);
    bantYeri.replaceChildren(bant);
    harfleriYak(bant, 1400);
    if (!(await y.soyle(f.ses))) return;
    // "sıra sende" yalnız ilk cümlede söylenir; sonrakilerde mikrofon doğrudan açılır (aynı söz yinelenmez)
    if (no === 0 && !(await y.soyle(soyleSirasi()))) return;
    bekliyor = true;
    await soylet(altlik, y, { beklenen: f.en, ornek: f.yavas });
    if (!y.acik) return;
    bekliyor = false;
    kart.classList.add('ing-kazanildi');
    kutla(kart);
    tik.yapis();
    void hareket('polly', 'sevin');
    no++;
    siraCiz();
    if (no >= a.ifadeler.length) {
      if (!(await y.soyle(ovgu()))) return;
      b.bitti();
      return;
    }
    if (!(await y.dur(550))) return;
    void cumle();
  }

  kart.addEventListener('click', () => { if (bekliyor) yeniden(); });
  b.tekrarla(() => { if (bekliyor) yeniden(); });
  void (async () => {
    if (!a.ifadeler.length) { b.bitti(); return; }
    siraCiz();
    if (b.ilkKez(`soyle2-${a.giris}`) && !(await y.soyle(yonerge(a.giris, 'tr/c-sen-soyle')))) return;
    void cumle();
  })();
  return () => y.kapat();
};
