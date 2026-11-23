/**
 * Şakacı Polly (22 Kasım 2026; Barış: "dersler bir süre sonra sıkacak gibi, eğlence ver"; Antigravity ONERI-09 "Silly Polly").
 * Polly dersin bir kelimesinin resmini gösterir ve ya doğrusunu ya da bilerek komik bir yanlışı sorar ("Is it an
 * elephant?" der ama resimde elma vardır). Çocuk yeşil "Yes" ya da kırmızı "No" ile cevap verir. Polly'nin şakası
 * yakalanınca Polly şaşırır, kanatlarını başına götürür: "Oops! Silly Polly!" ve doğrusunu söyler; çocuk kendini
 * Polly'den akıllı hisseder. Her turda bir şaka mutlaka vardır; sırası karışıktır.
 * Doğru–yanlış seçme işi Doğru mu? ile aynıdır ama burada kelime düzeyinde ve gülmece içindir (1. seviyede kısa mola).
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import { cizim, dugme, hareket, ipucuKur, kelimeResmi, kutla, salla } from '../kit';
import { tik } from '../ses';
import { balonYaz, oyunDuzeni, soruBalonu, yasam, type AdimKurucu } from './ortak';
import { evetHayir } from '../icerik';

export const sasirtKur: AdimKurucu<'sasirt'> = (b, a) => {
  const y = yasam();
  let no = 0, kilit = true, yanlis = 0;
  const tur = () => a.turlar[no];
  const saka = () => tur().soylenen.id !== tur().goster.id;
  const sor = () => { if (!kilit) void y.soyle(`en/y-${tur().soylenen.id}`); };
  const { masa } = oyunDuzeni(b.alan, 'ing-dogrumu ing-sasirt', sor);
  const resimYeri = h('div.ing-dogrumu-resim.ing-sasirt-resim');
  const evet = dugme('ing-oy ing-evet', 'Yes, evet', () => void oyVer(true), cizim('ui/evet'), h('strong', { lang: 'en-US' }, 'Yes'));
  const hayir = dugme('ing-oy ing-hayir', 'No, hayır', () => void oyVer(false), cizim('ui/hayir'), h('strong', { lang: 'en-US' }, 'No'));
  const oylar = h('div.ing-oylar', {}, evet, hayir);
  masa.append(resimYeri, oylar);
  const balon = soruBalonu(masa);
  const dogruDugme = () => (saka() ? hayir : evet);

  async function turGoster() {
    const t = tur();
    kilit = true; yanlis = 0;
    oylar.classList.remove('ing-bitti');
    resimYeri.classList.remove('ing-sasirt-yakalandi');
    for (const d of [evet, hayir]) d.classList.remove('ing-dogru', 'ing-parla');
    resimYeri.replaceChildren(kelimeResmi(t.goster));
    resimYeri.classList.remove('ing-geldi'); void resimYeri.offsetWidth; resimYeri.classList.add('ing-geldi');
    // Polly resim için soru sorar ("Is it a sheep?"); şakada soru bilerek yanlıştır
    balonYaz(balon, evetHayir(t.soylenen));
    if (TEST_MODU) oylar.dataset.hedef = saka() ? 'hayir' : 'evet';
    // Polly gösterip söyler (şakada kıkırdar gibi göz kırpan "selam" hareketiyle)
    void hareket('polly', 'selam');
    if (!(await y.soyle(`en/y-${t.soylenen.id}`))) return;
    kilit = false;
    ipucuKur(() => (yanlis >= 1 ? dogruDugme() : null), 5000);
  }

  async function oyVer(evetDedi: boolean) {
    if (kilit) return;
    const t = tur();
    const d = evetDedi ? evet : hayir;
    if (evetDedi === saka()) {
      // yanılış: Polly "Hmm… look again!" der, söz bir daha duyulur; doğru düğme parlar
      if (yanlis === 0) b.hata();
      yanlis++;
      salla(d);
      kilit = true;
      if (!(await y.soyle('en/g-look-again', `en/y-${t.soylenen.id}`))) return;
      dogruDugme().classList.add('ing-parla');
      kilit = false;
      return;
    }
    kilit = true;
    ipucuKur(undefined);
    d.classList.remove('ing-parla');
    d.classList.add('ing-dogru');
    oylar.classList.add('ing-bitti');
    if (saka()) {
      // şaka yakalandı: Polly şaşırır, resim sevinçle zıplar, doğrusu söylenir
      tik.yapis();
      resimYeri.classList.add('ing-sasirt-yakalandi');
      kutla(resimYeri);
      void hareket('polly', 'saskin');
      if (!(await y.soyle('en/g-oops-silly-polly', `en/w-${t.goster.id}`))) return;
    } else {
      kutla(resimYeri);
      void hareket('polly', 'sevin');
      if (!(await y.soyle('en/g-yes'))) return;
    }
    if (!(await y.dur(250))) return;
    no++;
    if (no >= a.turlar.length) { b.bitti(); return; }
    void turGoster();
  }

  b.tekrarla(sor);
  void (async () => {
    if (!a.turlar.length) { b.bitti(); return; }
    // Ceren tanıtırken kart boş durmasın: ilk resim baştan görünür
    resimYeri.replaceChildren(kelimeResmi(a.turlar[0].goster));
    if (b.ilkKez('sasirt') && !(await y.soyle('tr/c-sasirt-giris'))) return;
    void turGoster();
  })();
  return () => { ipucuKur(undefined); y.kapat(); };
};
