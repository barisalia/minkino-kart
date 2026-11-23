/**
 * Polly'nin Dürbünü (Seviye 2 şenliği): Polly dürbününden bakar ve gördüğünü söyler. Resimler mercekten sırayla geçer;
 * çocuk söylenen resim mercekteyken merceğe dokunur. Süre baskısı ve kaybetme yoktur: resimler doğru olana dokunulana
 * kadar dönüp durur, tur tamamlanınca cümle yeniden söylenir. Yanlış resme dokununca o resmin cümlesini duyar.
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import type { Ifade } from '../icerik2';
import { gorselCiz } from '../gorsel';
import { cizim, dugme, hareket, kutla, pozBirak, pozTut, salla } from '../kit';
import type { IfadeSorusu } from '../plan';
import { tik } from '../ses';
import { balonYaz, oyunDuzeni, soruBalonu, yasam, yonerge, type AdimKurucu } from './ortak';

export const yakalaKur: AdimKurucu<'yakala'> = (b, a) => {
  const y = yasam();
  let no = 0, kilit = true, yanlis = 0, sira = 0, zaman = 0, soru: IfadeSorusu = a.sorular[0], mercekte: Ifade | undefined;
  const onaylanan = new Set<string>();
  // bir resmin mercekte kalma süresi: küçüklerde daha uzun (testte sürücünün dokunmaya yetişeceği kadar)
  const kalis = TEST_MODU ? 2200 : b.yas === '2-3' ? 3400 : 2600;
  const tekrarSoz = () => { if (!kilit) void y.soyle(soru.hedef.ses); };
  const { masa } = oyunDuzeni(b.alan, 'ing-yakala', tekrarSoz);
  const ic = h('span.ing-mercek-ic');
  const mercek = dugme('ing-mercek', 'Mercekteki resim', () => void dokun(), ic, cizim('oyun/durbun-cerceve', 'ing-mercek-cerceve'));
  const sayac = h('div.ing-mercek-sayac', { 'aria-hidden': 'true' });
  masa.append(h('div.ing-mercek-yeri', {}, mercek), sayac);
  const balon = soruBalonu(masa);

  function goster() {
    const adet = soru.secenekler.length;
    mercekte = soru.secenekler[sira % adet];
    ic.replaceChildren(h('span.ing-mercek-resim', {}, gorselCiz(mercekte.g)));
    mercek.dataset.ifade = mercekte.id;
    // iki yanlıştan ya da iki boş turdan sonra söylenen resim gelince mercek parlar
    mercek.classList.toggle('ing-parla', (yanlis >= 2 || sira >= adet * 2) && mercekte.id === soru.hedef.id);
    [...sayac.children].forEach((n, i) => n.classList.toggle('ing-simdi', i === sira % adet));
  }

  /** Polly dürbününü gözüne götürür (çizimi geldiyse: kisi/polly-durbun-0) */
  const bak = () => pozTut('polly', 'durbun-0');

  function don() {
    clearTimeout(zaman);
    zaman = y.sonra(() => {
      if (kilit) return;
      sira++;
      goster();
      // tur tamamlanınca cümle yeniden söylenir (çocuk kaçırdıysa bir daha duyar); Polly söylerken dürbünü indirir
      if (sira % soru.secenekler.length === 0) { pozBirak('polly'); void y.soyle(soru.hedef.ses).then(() => { if (!kilit) bak(); }); }
      don();
    }, kalis);
  }

  async function soruGoster() {
    soru = a.sorular[no];
    yanlis = 0; kilit = true; sira = 0;
    mercek.classList.remove('ing-dogru');
    balonYaz(balon, soru.hedef.en);
    sayac.replaceChildren(...soru.secenekler.map(() => h('i')));
    if (TEST_MODU) mercek.dataset.hedef = soru.hedef.id;
    goster();
    if (!(await y.soyle(soru.hedef.ses))) return;
    kilit = false;
    bak();
    don();
  }

  async function dokun() {
    if (kilit || !mercekte) return;
    const f = mercekte, hedef = soru.hedef;
    clearTimeout(zaman);
    kilit = true;
    pozBirak('polly');
    if (f.id !== hedef.id) {
      if (yanlis === 0) b.hata();
      yanlis++;
      salla(mercek);
      // dokunduğu resmin cümlesini duyar, sonra aranan cümle yinelenir ve resimler dönmeye devam eder
      if (!(await y.soyle(f.ses, hedef.ses))) return;
      kilit = false;
      sira++;
      goster();
      bak();
      don();
      return;
    }
    tik.yapis();
    mercek.classList.remove('ing-parla');
    mercek.classList.add('ing-dogru');
    kutla(mercek);
    void hareket('polly', 'sevin');
    const ilk = !onaylanan.has(hedef.id);
    onaylanan.add(hedef.id);
    if (!(await y.soyle('en/g-yes', ...(ilk ? [hedef.ses] : [])))) return;
    if (!(await y.dur(250))) return;
    no++;
    if (no >= a.sorular.length) { b.bitti(); return; }
    void soruGoster();
  }

  b.tekrarla(tekrarSoz);
  void (async () => {
    if (!a.sorular.length) { b.bitti(); return; }
    if (b.ilkKez('yakala') && !(await y.soyle(yonerge('tr/c-yakala-giris', 'tr/c-tarif-giris')))) return;
    void soruGoster();
  })();
  return () => { clearTimeout(zaman); pozBirak('polly'); y.kapat(); };
};
