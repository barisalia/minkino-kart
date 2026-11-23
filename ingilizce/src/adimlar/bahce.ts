/**
 * Hayvanat Bahçesi (Çiftlik adasının 3. dersi, "100 hayvan"): altı bölüm (deniz, kuşlar, böcekler, orman, vahşi doğa,
 * yavrular). Her bölümde Polly bölümün adını söyler ("The sea!"), hayvanlar sırayla belirir ve adları söylenir; sonra Polly
 * bir iki hayvanı sorar ("Where is the octopus?"), çocuk bulur. Bölümler arası çocuk istediği hayvana dokunup adını duyar.
 * Sonunda derslerde tanıdığı bütün hayvanlar (yüz) dalga dalga ekrana dolar, sayaç yüze kadar sayar.
 *
 * Fonlar (Astra, Paket 16): `sahne/bahce-<grup>`; gelene kadar bölümün açık renginde düz bir sahne.
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import { HAYVAN_BOLUMLERI, HAYVAN_DERSI_1, HAYVAN_DERSI_2, kelimeBul, type Kelime } from '../icerik';
import { cikartmaResmi, hareket, ipucuKur, kareZipla, kareleriHazirla, kutla, salla, sesVeAd } from '../kit';
import type { BahceBolumu } from '../plan';
import { tik } from '../ses';
import { resim } from '../varlik';
import { balonYaz, oyunDuzeni, ovgu, soruBalonu, yasam, type AdimKurucu } from './ortak';

export const bahceKur: AdimKurucu<'bahce'> = (b, a) => {
  const y = yasam();
  let bolumNo = 0, asama: 'tanit' | 'sor' | 'serbest' | 'bitti' = 'tanit', soruNo = 0, yanlis = 0;
  const serit = h('div.ing-bahce-serit');
  const cipler = a.bolumler.map((x, i) => {
    const ilk = x.hayvanlar[0];
    const c = h('span.ing-bahce-cip', {}, ilk ? cikartmaResmi(ilk) : '', h('b', {}, x.tr));
    c.style.setProperty('--renk', x.renk);
    c.style.setProperty('--n', String(i));
    return c;
  });
  serit.append(...cipler);
  const alan = h('div.ing-bahce-alan');
  const izgara = h('div.ing-bahce-izgara');
  const ad = h('p.ing-bahce-ad', { lang: 'en-US' });
  // Polly ve Ceren yan sütunda (öbür oyunlar gibi); Polly'ye dokununca soru yinelenir
  const { masa } = oyunDuzeni(b.alan, 'ing-bahce', () => { if (asama === 'sor') void y.soyle(`en/q-${bolum().sorular[soruNo].id}`); });
  alan.append(izgara);
  // 21 Kasım (Barış: "koca ekranda ufacık, mobilde neredeyse görünmüyor"): soru balonu ve hayvanın adı ayrı satır
  // kaplamaz, sahnenin göğüne biner; sahne bütün alanı alır, hayvanlar ızgarayı doldurur
  masa.append(serit, alan);
  const balon = soruBalonu(masa);
  alan.append(balon, ad);
  let dugmeler: HTMLButtonElement[] = [];

  const bolum = (): BahceBolumu => a.bolumler[bolumNo];
  const ziplat = (d: HTMLElement) => { d.classList.remove('ing-zipla'); void d.offsetWidth; d.classList.add('ing-zipla'); };
  // çizilmiş zıplama kareleri (gelmiş hayvanlarda) önceden indirilir
  kareleriHazirla(a.bolumler.flatMap((x) => x.hayvanlar));
  const adYaz = (w: Kelime) => {
    ad.replaceChildren(h('strong', {}, w.en), h('small', {}, w.tr));
    ad.classList.remove('ing-geldi'); void ad.offsetWidth; ad.classList.add('ing-geldi');
  };

  async function bolumAc() {
    const x = bolum();
    asama = 'tanit'; soruNo = 0;
    cipler.forEach((c, i) => { c.classList.toggle('ing-simdi', i === bolumNo); c.classList.toggle('ing-tamam', i < bolumNo); });
    const fon = resim(`sahne/bahce-${x.grup}`);
    alan.style.backgroundImage = fon ? `url("${fon}")` : '';
    alan.style.setProperty('--renk', x.renk);
    alan.classList.toggle('ing-fonlu', !!fon);
    balon.classList.remove('ing-gorunur');
    ad.replaceChildren();
    izgara.dataset.adet = String(x.hayvanlar.length);
    dugmeler = x.hayvanlar.map((w, i) => {
      const d = h('button.ing-bahce-hayvan', { type: 'button', 'aria-label': `${w.en}, ${w.tr}` }, cikartmaResmi(w)) as HTMLButtonElement;
      d.dataset.kelime = w.id;
      d.style.setProperty('--n', String(i));
      d.addEventListener('click', () => void dokun(w, d));
      return d;
    });
    izgara.replaceChildren(...dugmeler);
    alan.classList.remove('ing-geldi'); void alan.offsetWidth; alan.classList.add('ing-geldi');
    if (!(await y.soyle(`en/g-bahce-${x.grup}`))) return;
    // hayvanlar sırayla belirir, her biri adıyla
    for (let i = 0; i < dugmeler.length; i++) {
      const d = dugmeler[i], w = x.hayvanlar[i];
      d.classList.add('ing-belirdi', 'ing-parliyor');
      adYaz(w);
      if (!(await y.soyle(`en/w-${w.id}`))) return;
      d.classList.remove('ing-parliyor');
    }
    ad.replaceChildren();
    await soruSor();
  }

  async function soruSor() {
    const x = bolum();
    if (soruNo >= x.sorular.length) { await sonraki(); return; }
    const w = x.sorular[soruNo];
    asama = 'sor'; yanlis = 0;
    ad.replaceChildren(); // ad ile soru balonu aynı yerde: soru gelince ad kalkar
    balonYaz(balon, `Where is the ${w.en}?`);
    if (TEST_MODU) izgara.dataset.hedef = w.id;
    if (!(await y.soyle(`en/q-${w.id}`))) return;
    ipucuKur(() => (yanlis >= 2 ? dugmeler.find((d) => d.dataset.kelime === w.id) : null), 5000);
  }

  async function dokun(w: Kelime, d: HTMLButtonElement) {
    if (asama === 'bitti') return;
    if (asama !== 'sor') {
      // tanıtım ve geçişlerde: dokunulan hayvan zıplar, adını söyler
      if (asama === 'serbest' || d.classList.contains('ing-belirdi')) { tik.dokun(); ziplat(d); void kareZipla(d, w); adYaz(w); void sesVeAd(w, y.soyle, `en/w-${w.id}`); }
      return;
    }
    const hedef = bolum().sorular[soruNo];
    if (w.id !== hedef.id) {
      if (yanlis === 0) b.hata();
      yanlis++;
      salla(d);
      asama = 'tanit';
      if (!(await y.soyle(`en/w-${w.id}`, `en/q-${hedef.id}`))) return;
      if (yanlis >= 2) dugmeler.find((x) => x.dataset.kelime === hedef.id)?.classList.add('ing-parla');
      asama = 'sor';
      return;
    }
    asama = 'tanit';
    ipucuKur(undefined);
    d.classList.remove('ing-parla');
    d.classList.add('ing-bulundu');
    ziplat(d); void kareZipla(d, w); kutla(d); adYaz(w);
    balon.classList.remove('ing-gorunur');
    if (soruNo % 2 === 0) void hareket('polly', 'sevin');
    // bulunan hayvan önce kendi sesini çıkarır, sonra Polly sevinir
    if (!(await sesVeAd(w, y.soyle, 'en/g-yes', `en/c-${w.id}`))) return;
    soruNo++;
    await soruSor();
  }

  async function sonraki() {
    asama = 'serbest';
    if (!(await y.dur(500))) return;
    bolumNo++;
    if (bolumNo < a.bolumler.length) { await bolumAc(); return; }
    await final();
  }

  /** Kapanış: derslerde tanınan bütün hayvanlar dalga dalga gelir, sayaç yüze kadar sayar */
  async function final() {
    asama = 'bitti';
    cipler.forEach((c) => { c.classList.remove('ing-simdi'); c.classList.add('ing-tamam'); });
    balon.classList.remove('ing-gorunur');
    ad.replaceChildren();
    const hepsi = [...HAYVAN_DERSI_1, ...HAYVAN_DERSI_2, ...HAYVAN_BOLUMLERI.flatMap((x) => x.hayvanlar)]
      .map((id) => kelimeBul(id)).filter((w): w is Kelime => !!w && !!resim(`kelime/${w.id}`));
    const sayac = h('strong.ing-bahce-sayac', {}, '0');
    const duvar = h('div.ing-bahce-duvar', {}, ...hepsi.map((w, i) => { const s = h('span', {}, cikartmaResmi(w)); s.style.setProperty('--n', String(i)); return s; }));
    alan.classList.add('ing-final');
    alan.style.backgroundImage = '';
    // duvar ızgaranın tek hücresine sıkışmasın: ızgara düz kutuya döner, duvar bütün alanı kaplar
    izgara.dataset.adet = 'duvar';
    izgara.replaceChildren(duvar);
    masa.append(h('div.ing-bahce-sayac-yer', {}, sayac, h('small', {}, 'animals')));
    // sayaç hayvanların gelişiyle birlikte sayar
    const sure = TEST_MODU ? 50 : 2600;
    const bas = performance.now();
    await new Promise<void>((bitti) => {
      const say = () => {
        const n = Math.min(hepsi.length, Math.round(((performance.now() - bas) / sure) * hepsi.length));
        sayac.textContent = String(n);
        if (n >= hepsi.length || !y.acik) bitti(); else requestAnimationFrame(say);
      };
      requestAnimationFrame(say);
    });
    if (!y.acik) return;
    kutla(sayac);
    void hareket('polly', 'sevin');
    if (!(await y.soyle(hepsi.length >= 100 ? 'en/g-yuz-hayvan' : ovgu()))) return;
    if (!(await y.dur(500))) return;
    b.bitti();
  }

  b.tekrarla(() => {
    if (asama === 'sor') void y.soyle(`en/q-${bolum().sorular[soruNo].id}`);
  });
  void (async () => {
    if (!a.bolumler.length) { b.bitti(); return; }
    if (b.ilkKez('bahce') && !(await y.soyle('tr/c-bahce-giris'))) return;
    await bolumAc();
  })();
  return () => { ipucuKur(undefined); y.kapat(); };
};
