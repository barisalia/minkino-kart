/**
 * Hangisi? (Seviye 2 ve 3): Polly bir ifade söyler ("A small cow."), çocuk resimlerden doğru olana dokunur.
 * Seçenekler aynı dersin ifadeleridir; çoğu yalnız bir özelliğiyle ayrılır (büyük inek / küçük inek), çocuk cümlenin
 * tamamını dinlemek zorunda kalır. Yanlış resme dokununca o resmin cümlesini duyar; ceza yoktur.
 * Hikâye dersinde aynı adım "cümleyi dinle, resmini bul" olarak oynanır.
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import { gorselCiz } from '../gorsel';
import { dugme, hareket, ipucuKur, kutla, salla } from '../kit';
import type { IfadeSorusu } from '../plan';
import { balonYaz, oyunDuzeni, soruBalonu, yasam, type AdimKurucu } from './ortak';

export const tarifKur: AdimKurucu<'tarif'> = (b, a) => {
  const y = yasam();
  let no = 0, kilit = true, yanlis = 0, soru: IfadeSorusu = a.sorular[0];
  const onaylanan = new Set<string>();
  const tekrarSoz = () => { if (!kilit) void y.soyle(soru.hedef.ses); };
  // hikâye dersinde seçenekler hikâyenin resimleridir (yatay kutu)
  const { masa } = oyunDuzeni(b.alan, a.giris === 'tr/c-hikaye-bul' ? 'ing-bul ing-tarif ing-hikaye-sorusu' : 'ing-bul ing-tarif', tekrarSoz);
  const secenekler = h('div.ing-secenekler');
  masa.append(secenekler);
  const balon = soruBalonu(masa);
  const dogruDugme = () => secenekler.querySelector<HTMLElement>(`[data-ifade="${soru.hedef.id}"]`);

  async function soruGoster() {
    soru = a.sorular[no];
    yanlis = 0; kilit = true;
    balonYaz(balon, soru.hedef.en);
    secenekler.dataset.adet = String(soru.secenekler.length);
    if (TEST_MODU) secenekler.dataset.hedef = soru.hedef.id;
    secenekler.replaceChildren(...soru.secenekler.map((f, i) => {
      const d = dugme('ing-secim ing-secim-gorsel', f.tr, () => void sec(f.id, d), gorselCiz(f.g));
      d.dataset.ifade = f.id;
      d.style.setProperty('--n', String(i));
      return d;
    }));
    if (!(await y.soyle(soru.hedef.ses))) return;
    kilit = false;
    ipucuKur(() => (yanlis >= 2 ? dogruDugme() : null), 5000);
  }

  async function sec(id: string, d: HTMLButtonElement) {
    if (kilit) return;
    const hedef = soru.hedef;
    if (id !== hedef.id) {
      if (yanlis === 0) b.hata();
      yanlis++;
      salla(d);
      kilit = true;
      // dokunduğu resmin cümlesini duyar, sonra soru yinelenir
      const dokunulan = soru.secenekler.find((f) => f.id === id);
      if (!(await y.soyle(...(dokunulan ? [dokunulan.ses] : []), hedef.ses))) return;
      if (yanlis >= 2) dogruDugme()?.classList.add('ing-parla');
      kilit = false;
      return;
    }
    kilit = true;
    ipucuKur(undefined);
    d.classList.add('ing-dogru');
    secenekler.classList.add('ing-bitti');
    kutla(d);
    if (no % 2 === 0) void hareket('polly', 'sevin');
    // cümle ilk kez bilindiğinde bir kez daha duyulur; sonraki bilişlerde yalnız "Yes!" (aynı söz yinelenmez)
    const ilk = !onaylanan.has(hedef.id);
    onaylanan.add(hedef.id);
    if (!(await y.soyle('en/g-yes', ...(ilk ? [hedef.ses] : [])))) return;
    secenekler.classList.remove('ing-bitti');
    no++;
    if (no >= a.sorular.length) { b.bitti(); return; }
    void soruGoster();
  }

  b.tekrarla(tekrarSoz);
  void (async () => {
    if (b.ilkKez(`tarif-${a.giris}`) && !(await y.soyle(a.giris))) return;
    void soruGoster();
  })();
  return () => y.kapat();
};
