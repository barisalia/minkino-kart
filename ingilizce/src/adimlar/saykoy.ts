/**
 * Say ve Koy (sayılı kalıpların cümle şenliği): Polly kaç tane istediğini söyler ("Three ducks."), çocuk o kadarını
 * tepsiye tek tek koyar; her koyuşta Polly sayar ("One … two … three"). Bitince yeşil düğmeye basar. Fazla ya da eksik
 * koyduysa Polly tepsidekinin sayısını söyler ve cümleyi yineler; ceza yoktur. Tepsideki resme dokununca geri alınır.
 * Cümleyi anlamak burada bir iş yapmaktır: çocuk resmi seçmez, kendisi kurar.
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import { SAYI_KELIMELERI } from '../icerik';
import { cikartmaResmi, cizim, dugme, hareket, ipucuKur, kutla, salla } from '../kit';
import type { SayKoyTuru } from '../plan';
import { tik } from '../ses';
import { resim } from '../varlik';
import { balonYaz, oyunDuzeni, soruBalonu, yasam, type AdimKurucu } from './ortak';

const EN_COK = 8;

export const sayKoyKur: AdimKurucu<'saykoy'> = (b, a) => {
  const y = yasam();
  let no = 0, kilit = true, yanlis = 0, adet = 0, tur: SayKoyTuru = a.turlar[0];
  const tekrarSoz = () => { if (!kilit) void y.soyle(tur.ifade.ses); };
  const { masa } = oyunDuzeni(b.alan, 'ing-saykoy', tekrarSoz);
  const yuvalar = Array.from({ length: EN_COK }, () => h('span.ing-tepsi-yuva'));
  const tepsi = h('div.ing-tepsi', {}, ...yuvalar);
  // Astra'nın tepsi çizimi geldiyse (oyun/tepsi: 2:1, sekiz gözlü) zemin o olur; gelene kadar tepsi kodla çizilmiş bir karttır
  const tepsiCizimi = resim('oyun/tepsi');
  if (tepsiCizimi) { tepsi.classList.add('ing-tepsi-cizim'); tepsi.style.backgroundImage = `url("${tepsiCizimi}")`; }
  const kaynak = dugme('ing-saykoy-kaynak', 'Bir tane koy', () => ekle());
  const tamam = dugme('ing-oy ing-evet ing-saykoy-tamam', 'Tamam', () => void bitir(), cizim('ui/evet'), h('strong', { lang: 'en-US' }, 'OK'));
  masa.append(h('div.ing-tepsi-yeri', {}, tepsi), h('div.ing-saykoy-alt', {}, kaynak, tamam));
  const balon = soruBalonu(masa);
  const sayiSesi = (n: number) => `en/w-${SAYI_KELIMELERI[n - 1]}`;

  function turGoster() {
    tur = a.turlar[no];
    kilit = true; yanlis = 0; adet = 0;
    for (const yuva of yuvalar) { yuva.replaceChildren(); yuva.classList.remove('ing-dolu', 'ing-ipucu'); }
    tepsi.classList.remove('ing-tamam');
    tamam.disabled = true;
    kaynak.replaceChildren(cikartmaResmi(tur.kelime), h('b', { 'aria-hidden': 'true' }, '+'));
    balonYaz(balon, tur.ifade.en);
    if (TEST_MODU) tepsi.dataset.hedef = String(tur.adet);
    void (async () => {
      if (!(await y.soyle(tur.ifade.ses))) return;
      kilit = false;
      // ne yapacağını bulamayan çocuğa önce kaynak, tepsi dolunca yeşil düğme gösterilir
      ipucuKur(() => (adet === 0 ? kaynak : adet === tur.adet ? tamam : null), 5000);
    })();
  }

  function ekle() {
    if (kilit || adet >= EN_COK) return;
    const yuva = yuvalar[adet];
    yuva.replaceChildren(dugme('ing-tepsi-parca', `${tur.kelime.tr}, geri al`, () => cikar(), cikartmaResmi(tur.kelime)));
    yuva.classList.add('ing-dolu');
    adet++;
    tamam.disabled = false;
    tik.yapis();
    // Polly koyulanı sayar
    void y.soyle(sayiSesi(adet));
  }

  function cikar() {
    if (kilit || adet === 0) return;
    adet--;
    yuvalar[adet].replaceChildren();
    yuvalar[adet].classList.remove('ing-dolu');
    tamam.disabled = adet === 0;
    tik.dokun();
  }

  async function bitir() {
    if (kilit || adet === 0) return;
    kilit = true;
    ipucuKur(undefined);
    if (adet !== tur.adet) {
      if (yanlis === 0) b.hata();
      yanlis++;
      salla(tepsi);
      // tepsidekinin sayısını duyar, sonra istenen cümle yinelenir; iki yanlıştan sonra dolacak yuvalar parlar
      if (!(await y.soyle(sayiSesi(adet), tur.ifade.ses))) return;
      if (yanlis >= 2) yuvalar.forEach((yuva, i) => yuva.classList.toggle('ing-ipucu', i < tur.adet));
      kilit = false;
      return;
    }
    tepsi.classList.add('ing-tamam');
    for (const yuva of yuvalar) yuva.classList.remove('ing-ipucu');
    kutla(tepsi);
    void hareket('polly', 'sevin');
    if (!(await y.soyle('en/g-yes', tur.ifade.ses))) return;
    if (!(await y.dur(300))) return;
    no++;
    if (no >= a.turlar.length) { b.bitti(); return; }
    turGoster();
  }

  b.tekrarla(tekrarSoz);
  void (async () => {
    if (!a.turlar.length) { b.bitti(); return; }
    if (b.ilkKez('saykoy') && !(await y.soyle('tr/c-saykoy-giris'))) return;
    turGoster();
  })();
  return () => y.kapat();
};
