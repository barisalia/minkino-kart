/**
 * Bul (ve ısınma tekrarı): Polly sorar ("Where is the cow?"), çocuk resimlerden doğru olana dokunur.
 * Yanlış resme dokununca o resmin adını duyar (her dokunuş bir şey öğretir), ceza yoktur; iki yanlıştan sonra
 * doğru resim hafifçe parlar. Kelimeler aralıklı sorulur (aynı kelime art arda gelmez).
 */
import { h } from '../../../src/ui/dom';
import { dugme, hareket, ipucuKur, kelimeResmi, kutla, salla, ziplat } from '../kit';
import type { Soru } from '../plan';
import { soru as soruMetni } from '../icerik';
import { balonYaz, oyunDuzeni, soruBalonu, yasam, type AdimKurucu } from './ortak';

export const bulKur: AdimKurucu<'bul' | 'tekrar'> = (b, a) => {
  const y = yasam();
  let no = 0, kilit = true, yanlis = 0, soru: Soru = a.sorular[0];
  const { masa } = oyunDuzeni(b.alan, 'ing-bul', () => { if (!kilit) void y.soyle(`en/q-${soru.hedef.id}`); });
  const secenekler = h('div.ing-secenekler');
  masa.append(secenekler);
  const balon = soruBalonu(masa);

  /** Sorunun kartlarını kurar (kilitli): ilk soruda kartlar adımla birlikte gelir, giriş sözü kartların üstünde söylenir
   *  (kalite denetimi, 23 Kasım: "Bul açılınca 1,3 sn boş kalıyor"). */
  function kartlariKur() {
    soru = a.sorular[no];
    yanlis = 0; kilit = true;
    balonYaz(balon, soruMetni(soru.hedef));
    secenekler.dataset.adet = String(soru.secenekler.length);
    secenekler.replaceChildren(...soru.secenekler.map((w, i) => {
      const resimEl = kelimeResmi(w);
      const d = dugme('ing-secim', w.tr, () => void sec(w.id, d, resimEl), resimEl);
      d.dataset.kelime = w.id;
      d.style.setProperty('--n', String(i));
      return d;
    }));
  }
  async function soruGoster(giris?: string) {
    if (giris && !(await y.soyle(giris))) return;
    if (!(await y.soyle(`en/q-${soru.hedef.id}`))) return;
    kilit = false;
    ipucuKur(() => (yanlis >= 2 ? secenekler.querySelector(`[data-kelime="${soru.hedef.id}"]`) : null), 5000);
  }

  async function sec(id: string, d: HTMLButtonElement, resimEl: HTMLElement) {
    if (kilit) return;
    const hedef = soru.hedef;
    if (id !== hedef.id) {
      if (yanlis === 0) b.hata();
      yanlis++;
      salla(d);
      kilit = true;
      // dokunduğu resmin adını duyar, sonra soru yinelenir
      if (!(await y.soyle(`en/w-${id}`, `en/q-${hedef.id}`))) return;
      if (yanlis >= 2) secenekler.querySelector(`[data-kelime="${hedef.id}"]`)?.classList.add('ing-parla');
      kilit = false;
      return;
    }
    kilit = true;
    ipucuKur(undefined);
    b.cevap(hedef.id, yanlis === 0);
    d.classList.add('ing-dogru');
    secenekler.classList.add('ing-bitti');
    kutla(d);
    void ziplat(resimEl, hedef);
    if (no % 2 === 0) void hareket('polly', 'sevin');
    if (!(await y.soyle('en/g-yes', `en/c-${hedef.id}`))) return;
    secenekler.classList.remove('ing-bitti');
    no++;
    if (no >= a.sorular.length) { b.bitti(); return; }
    kartlariKur();
    void soruGoster();
  }

  b.tekrarla(() => { if (!kilit) void y.soyle(`en/q-${soru.hedef.id}`); });
  kartlariKur();
  void soruGoster(b.ilkKez(a.tip) ? (a.tip === 'tekrar' ? 'tr/c-tekrar-giris' : 'tr/c-bul-giris') : undefined);
  return () => y.kapat();
};
