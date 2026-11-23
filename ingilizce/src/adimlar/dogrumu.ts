/**
 * Doğru mu? (Seviye 2): Polly resme bakıp bir cümle söyler. Cümle resme uyuyorsa çocuk "Yes"e, uymuyorsa "No"ya dokunur.
 * "No" doğruysa Polly resmin gerçek cümlesini söyler: çocuk yanlış cümleyle doğrusunu art arda duyar ve farkı ayırt eder
 * (büyük inek / küçük inek, severim / sevmem). Yanlış cevapta ceza yoktur; cümle yeniden söylenir.
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import { gorselCiz } from '../gorsel';
import { cizim, dugme, hareket, ipucuKur, kutla, salla } from '../kit';
import type { DogruMuSorusu } from '../plan';
import { balonYaz, oyunDuzeni, soruBalonu, yasam, yonerge, type AdimKurucu } from './ortak';

/** Oyunun kendi yönergesi üretilene kadar aynı işi anlatan onaylı kayıt: "Polly soracak. Doğruysa yeşile, yanlışsa kırmızıya dokun." */
export const DOGRUMU_YEDEK_YONERGE = 'tr/d-vahsi-s';

export const dogruMuKur: AdimKurucu<'dogrumu'> = (b, a) => {
  const y = yasam();
  let no = 0, kilit = true, yanlis = 0, soru: DogruMuSorusu = a.sorular[0];
  const onaylanan = new Set<string>();
  const tekrarSoz = () => { if (!kilit) void y.soyle(soru.soylenen.ses); };
  const { masa } = oyunDuzeni(b.alan, 'ing-dogrumu', tekrarSoz);
  const resimYeri = h('div.ing-dogrumu-resim');
  const evet = dugme('ing-oy ing-evet', 'Yes, evet', () => void oyVer(true), cizim('ui/evet'), h('strong', { lang: 'en-US' }, 'Yes'));
  const hayir = dugme('ing-oy ing-hayir', 'No, hayır', () => void oyVer(false), cizim('ui/hayir'), h('strong', { lang: 'en-US' }, 'No'));
  const oylar = h('div.ing-oylar', {}, evet, hayir);
  masa.append(resimYeri, oylar);
  const balon = soruBalonu(masa);
  const dogruMu = () => soru.soylenen.id === soru.gosterilen.id;
  const dogruDugme = () => (dogruMu() ? evet : hayir);

  async function soruGoster() {
    soru = a.sorular[no];
    yanlis = 0; kilit = true;
    oylar.classList.remove('ing-bitti');
    for (const d of [evet, hayir]) d.classList.remove('ing-dogru', 'ing-parla');
    balonYaz(balon, soru.soylenen.en);
    resimYeri.replaceChildren(gorselCiz(soru.gosterilen.g));
    resimYeri.classList.remove('ing-geldi'); void resimYeri.offsetWidth; resimYeri.classList.add('ing-geldi');
    if (TEST_MODU) oylar.dataset.hedef = dogruMu() ? 'evet' : 'hayir';
    if (!(await y.soyle(soru.soylenen.ses))) return;
    kilit = false;
    ipucuKur(() => (yanlis >= 2 ? dogruDugme() : null), 5000);
  }

  async function oyVer(evetDedi: boolean) {
    if (kilit) return;
    const d = evetDedi ? evet : hayir;
    if (evetDedi !== dogruMu()) {
      if (yanlis === 0) b.hata();
      yanlis++;
      salla(d);
      kilit = true;
      // cümleyi bir daha duyar ve resme yeniden bakar; iki yanlıştan sonra doğru düğme parlar
      if (!(await y.soyle(soru.soylenen.ses))) return;
      if (yanlis >= 2) dogruDugme().classList.add('ing-parla');
      kilit = false;
      return;
    }
    kilit = true;
    ipucuKur(undefined);
    d.classList.remove('ing-parla');
    d.classList.add('ing-dogru');
    oylar.classList.add('ing-bitti');
    kutla(resimYeri);
    if (no % 2 === 0) void hareket('polly', 'sevin');
    if (dogruMu()) {
      // cümle ilk kez onaylandığında bir kez daha duyulur; sonrakilerde yalnız "Yes!"
      const ilk = !onaylanan.has(soru.soylenen.id);
      onaylanan.add(soru.soylenen.id);
      if (!(await y.soyle('en/g-yes', ...(ilk ? [soru.soylenen.ses] : [])))) return;
    } else {
      // "No!" doğru: balonda ve seste resmin gerçek cümlesi
      if (!(await y.soyle('en/g-no'))) return;
      balonYaz(balon, soru.gosterilen.en);
      onaylanan.add(soru.gosterilen.id);
      if (!(await y.soyle(soru.gosterilen.ses))) return;
    }
    if (!(await y.dur(250))) return;
    no++;
    if (no >= a.sorular.length) { b.bitti(); return; }
    void soruGoster();
  }

  b.tekrarla(tekrarSoz);
  void (async () => {
    if (!a.sorular.length) { b.bitti(); return; }
    if (b.ilkKez('dogrumu') && !(await y.soyle(yonerge('tr/c-dogrumu-giris', DOGRUMU_YEDEK_YONERGE)))) return;
    void soruGoster();
  })();
  return () => y.kapat();
};
