/**
 * Polly Diyor ki (Hareketler ünitesine özel): Polly bir komut verir ("Jump!"), çocuk hareket kartına dokunur,
 * sahnedeki büyük Kino o hareketi yapar. Yanlış karta dokunursa Kino onu yapar ve Polly o hareketin adını söyler
 * (yanlış da öğretir, ceza yok); sonra komut yinelenir. Ceren çocuğu da harekete çağırır: hareket ederek öğrenme.
 */
import { h } from '../../../src/ui/dom';
import type { Kelime } from '../icerik';
import { dugme, hareket, ipucuKur, kelimeResmi, kisi, kutla, salla, ziplat } from '../kit';
import type { Soru } from '../plan';
import { balonYaz, oyunDuzeni, soruBalonu, yasam, type AdimKurucu } from './ortak';

export const yapKur: AdimKurucu<'yap'> = (b, a) => {
  const y = yasam();
  let no = 0, kilit = true, yanlis = 0, soru: Soru = a.sorular[0];
  const { masa } = oyunDuzeni(b.alan, 'ing-yap', () => { if (!kilit) void y.soyle(`en/q-${soru.hedef.id}`); });
  const sahne = h('div.ing-yap-sahne');
  const duran = kisi('kino', 'ing-yap-kino');
  const poz = h('div.ing-yap-poz');
  sahne.append(duran, poz);
  const kartlar = h('div.ing-secenekler');
  masa.append(sahne, kartlar);
  const balon = soruBalonu(masa);

  /** Sahnedeki Kino'ya hareketi yaptırır (hareketin çizimi büyük gösterilir ve zıplar) */
  function yaptir(w: Kelime): HTMLElement {
    const resimEl = kelimeResmi(w);
    poz.replaceChildren(resimEl);
    sahne.classList.add('ing-hareketli');
    void ziplat(resimEl, w);
    return resimEl;
  }
  function dinlen() { sahne.classList.remove('ing-hareketli'); poz.replaceChildren(); }

  async function soruGoster() {
    soru = a.sorular[no];
    yanlis = 0; kilit = true;
    dinlen();
    balonYaz(balon, soru.hedef.q ?? `${soru.hedef.en}!`);
    kartlar.dataset.adet = String(soru.secenekler.length);
    kartlar.replaceChildren(...soru.secenekler.map((w, i) => {
      const d = dugme('ing-secim', w.tr, () => void sec(w, d), kelimeResmi(w));
      d.dataset.kelime = w.id;
      d.style.setProperty('--n', String(i));
      return d;
    }));
    if (!(await y.soyle(`en/q-${soru.hedef.id}`))) return;
    kilit = false;
    ipucuKur(() => (yanlis >= 2 ? kartlar.querySelector(`[data-kelime="${soru.hedef.id}"]`) : null), 5000);
  }

  async function sec(w: Kelime, d: HTMLButtonElement) {
    if (kilit) return;
    const hedef = soru.hedef;
    kilit = true;
    if (w.id !== hedef.id) {
      if (yanlis === 0) b.hata();
      yanlis++;
      salla(d);
      // Kino dokunulan hareketi yapar; Polly onun adını söyler, sonra komutu yineler
      yaptir(w);
      if (!(await y.soyle(`en/w-${w.id}`))) return;
      dinlen();
      if (!(await y.soyle(`en/q-${hedef.id}`))) return;
      if (yanlis >= 2) kartlar.querySelector(`[data-kelime="${hedef.id}"]`)?.classList.add('ing-parla');
      kilit = false;
      return;
    }
    ipucuKur(undefined);
    b.cevap(hedef.id, yanlis === 0);
    d.classList.add('ing-dogru');
    kartlar.classList.add('ing-bitti');
    const resimEl = yaptir(hedef);
    kutla(resimEl);
    if (no % 2 === 0) void hareket('polly', 'sevin');
    if (!(await y.soyle('en/g-yes', `en/c-${hedef.id}`))) return;
    void ziplat(resimEl, hedef);
    if (!(await y.dur(500))) return;
    kartlar.classList.remove('ing-bitti');
    no++;
    if (no >= a.sorular.length) b.bitti();
    else void soruGoster();
  }

  b.tekrarla(() => { if (!kilit) void y.soyle(`en/q-${soru.hedef.id}`); });
  void (async () => {
    if (b.ilkKez('yap') && !(await y.soyle('tr/c-yap-giris'))) return;
    void soruGoster();
  })();
  return () => y.kapat();
};
