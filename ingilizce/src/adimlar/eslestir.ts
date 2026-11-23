/**
 * Eşleştir: kapalı kartlar; çevrilen her kart adını söyler. Aynı iki resmi bulan çocuk kelimeyi her çevirişte
 * yeniden duyar. Dört yaş ve üstü içindir (küçük grupta oynatılmaz).
 */
import { h } from '../../../src/ui/dom';
import type { Kelime } from '../icerik';
import { cizim, dugme, kelimeResmi, kutla } from '../kit';
import { karistir } from '../plan';
import { tik } from '../ses';
import { oyunDuzeni, yasam, type AdimKurucu } from './ortak';

export const eslestirKur: AdimKurucu<'eslestir'> = (b, a) => {
  const y = yasam();
  let kilit = true, acik: { w: Kelime; el: HTMLButtonElement } | undefined, kalan = a.kelimeler.length;
  const yanilan = new Set<string>();
  const { masa } = oyunDuzeni(b.alan, 'ing-eslestir');
  const izgara = h('div.ing-kartlar', { 'data-adet': a.kelimeler.length * 2 });
  masa.append(izgara);

  const deste = karistir([...a.kelimeler, ...a.kelimeler], Math.random);
  izgara.replaceChildren(...deste.map((w, i) => {
    const arka = h('span.ing-kart-arka', {}, cizim('oyun/kart-arka') ?? h('span.ing-kart-arka-yer', {}, '?'));
    const on = h('span.ing-kart-on', {}, kelimeResmi(w));
    const d = dugme('ing-hafiza-karti', 'Kapalı kart', () => void cevir(w, d), arka, on);
    d.style.setProperty('--n', String(i));
    return d;
  }));

  async function cevir(w: Kelime, d: HTMLButtonElement) {
    if (kilit || d.classList.contains('ing-acik')) return;
    tik.sec();
    d.classList.add('ing-acik');
    d.setAttribute('aria-label', w.tr);
    void y.soyle(`en/w-${w.id}`);
    if (!acik) { acik = { w, el: d }; return; }
    const ilk = acik;
    acik = undefined;
    kilit = true;
    if (ilk.w.id === w.id) {
      if (!(await y.dur(450))) return;
      ilk.el.classList.add('ing-eslesti'); d.classList.add('ing-eslesti');
      kutla(d);
      b.cevap(w.id, !yanilan.has(w.id));
      kalan--;
      if (!(await y.soyle(`en/c-${w.id}`))) return;
      if (kalan === 0) { b.bitti(); return; }
    } else {
      if (!yanilan.has(ilk.w.id)) { yanilan.add(ilk.w.id); b.hata(); }
      yanilan.add(w.id);
      if (!(await y.dur(1100))) return;
      ilk.el.classList.remove('ing-acik'); d.classList.remove('ing-acik');
      ilk.el.setAttribute('aria-label', 'Kapalı kart'); d.setAttribute('aria-label', 'Kapalı kart');
    }
    kilit = false;
  }

  b.tekrarla(() => { if (!kilit) void y.soyle('tr/c-eslestir-giris'); });
  void (async () => {
    if (b.ilkKez('eslestir') && !(await y.soyle('tr/c-eslestir-giris'))) return;
    kilit = false;
  })();
  return () => y.kapat();
};
