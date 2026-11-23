/**
 * Cümle Hafızası (Seviye 2 şenliği): kapalı kartlar; çevrilen her kart cümlesini söyler. Aynı iki resmi bulan çocuk
 * cümleyi her çevirişte yeniden duyar. Çiftlerin özneleri birbirinden farklıdır (büyük inek ile küçük inek aynı destede
 * olmaz: plan.ts → farkliOzneler).
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import type { Gorsel, Ifade } from '../icerik2';
import { gorselCiz } from '../gorsel';
import { cizim, dugme, hareket, kutla } from '../kit';
import { karistir } from '../plan';
import { tik } from '../ses';
import { oyunDuzeni, ovgu, yasam, type AdimKurucu } from './ortak';

export const hafiza2Kur: AdimKurucu<'hafiza2'> = (b, a) => {
  const y = yasam();
  let kilit = true, acik: { f: Ifade; el: HTMLButtonElement } | undefined, kalan = a.ifadeler.length;
  const yanilan = new Set<string>();
  const { masa } = oyunDuzeni(b.alan, 'ing-eslestir ing-hafiza2');
  const izgara = h('div.ing-kartlar', { 'data-adet': a.ifadeler.length * 2 });
  masa.append(izgara);

  const deste = karistir([...a.ifadeler, ...a.ifadeler], Math.random);
  izgara.replaceChildren(...deste.map((f, i) => {
    const arka = h('span.ing-kart-arka', {}, cizim('oyun/kart-arka') ?? h('span.ing-kart-arka-yer', {}, '?'));
    // kart küçük olduğu için yüzünde yalnız nesneler durur (Kino'lu resimde elma ile armut karta sığmayacak kadar küçülüyordu)
    const nesneler: Gorsel = { ...f.g };
    delete nesneler.kino;
    const on = h('span.ing-kart-on', {}, gorselCiz(nesneler));
    const d = dugme('ing-hafiza-karti', 'Kapalı kart', () => void cevir(f, d), arka, on);
    d.style.setProperty('--n', String(i));
    if (TEST_MODU) d.dataset.ifade = f.id;
    return d;
  }));

  async function cevir(f: Ifade, d: HTMLButtonElement) {
    if (kilit || d.classList.contains('ing-acik')) return;
    tik.sec();
    d.classList.add('ing-acik');
    d.setAttribute('aria-label', f.tr);
    const soz = y.soyle(f.ses);
    if (!acik) { acik = { f, el: d }; return; }
    const ilk = acik;
    acik = undefined;
    kilit = true;
    // ikinci kartın cümlesi bitene kadar beklenir (söz yarıda kesilmesin)
    if (!(await soz)) return;
    if (ilk.f.id === f.id) {
      ilk.el.classList.add('ing-eslesti'); d.classList.add('ing-eslesti');
      kutla(d);
      kalan--;
      if (kalan === 0) {
        void hareket('polly', 'sevin');
        if (!(await y.soyle(ovgu()))) return;
        b.bitti();
        return;
      }
      if (!(await y.dur(300))) return;
    } else {
      if (!yanilan.has(ilk.f.id)) { yanilan.add(ilk.f.id); b.hata(); }
      yanilan.add(f.id);
      if (!(await y.dur(700))) return;
      ilk.el.classList.remove('ing-acik'); d.classList.remove('ing-acik');
      ilk.el.setAttribute('aria-label', 'Kapalı kart'); d.setAttribute('aria-label', 'Kapalı kart');
    }
    kilit = false;
  }

  b.tekrarla(() => { if (!kilit) void y.soyle('tr/c-eslestir-giris'); });
  void (async () => {
    if (!a.ifadeler.length) { b.bitti(); return; }
    if (b.ilkKez('eslestir') && !(await y.soyle('tr/c-eslestir-giris'))) return;
    kilit = false;
  })();
  return () => y.kapat();
};
