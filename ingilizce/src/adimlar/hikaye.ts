/**
 * Hikâye (Seviye 3): dört resimlik kısa bir hikâye. Ceren Türkçe bir cümleyle neyin anlatılacağını söyler, Polly
 * her resmi bir cümleyle anlatır (sözcükler sırayla yanar), çocuk ileri düğmesiyle sayfayı çevirir.
 * Ardından aynı dersin "Hangisi?" adımı cümleyi sorar (resmini bul) ve "Sıraya Diz" adımı hikâyeyi yeniden kurdurur.
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import type { Ifade } from '../icerik2';
import { cumleBandi, gorselCiz } from '../gorsel';
import { dugme, harfleriYak, hareket, ipucuKur, kutla, noktalar, salla } from '../kit';
import { tik } from '../ses';
import { dugmeResmi } from '../varlik';
import { oyunDuzeni, ovgu, yasam, type AdimKurucu } from './ortak';

export const hikayeKur: AdimKurucu<'hikaye'> = (b, a) => {
  const y = yasam();
  const sayfalar = a.hikaye.sayfalar;
  let no = 0, bekliyor = false;
  const tekrarSoz = () => { if (bekliyor) anlat(); };
  const { masa } = oyunDuzeni(b.alan, 'ing-hikaye', tekrarSoz);
  const baslik = h('h2.ing-hikaye-baslik', {}, h('span', { lang: 'en-US' }, a.hikaye.en), h('small', {}, a.hikaye.tr));
  const sayfaYeri = h('div.ing-hikaye-sayfa');
  const bantYeri = h('div.ing-hikaye-bant');
  const ileriResmi = dugmeResmi('ileri');
  const ileri = dugme('ing-hikaye-ileri', 'Sonraki resim', () => void sonraki(), ileriResmi ? h('img', { src: ileriResmi, alt: '', draggable: 'false' }) : h('span', { 'aria-hidden': 'true' }, '▶'));
  const sayac = h('div.ing-hikaye-sayac');
  masa.append(baslik, sayfaYeri, h('div.ing-hikaye-alt', {}, bantYeri, ileri), sayac);
  // Masal Kitaplığı: masal sahnesi. 22 Kasım 2026 (Barış: "görseller tam oturmamış"): açık kitabın dik sayfası 4:3
  // masal resmini kırpıyor, Kino'nun yüzü kesiliyordu. Artık resim kırpılmadan büyük durur, altında söz bandı; sayfa
  // çevrilirken resim kayarak gelir, okunurken yavaşça yaklaşır.
  const kitapResmi = a.kitap;
  const kitap = h('div.ing-masal-sahne');
  if (kitapResmi) {
    kitap.append(sayfaYeri, bantYeri);
    masa.insertBefore(kitap, masa.querySelector('.ing-hikaye-alt'));
    masa.classList.add('ing-masalda');
  }
  ileri.hidden = true;
  let bant: HTMLElement | undefined;

  function anlat() { harfleriYak(bant ?? null, 1600); void y.soyle(sayfalar[no].ses); }

  async function sayfaGoster() {
    const f = sayfalar[no];
    bekliyor = false;
    ileri.hidden = true;
    sayac.replaceChildren(noktalar(sayfalar.length, no));
    if (kitapResmi && no > 0) { tik.sec(); kitap.classList.remove('ing-cevir'); void kitap.offsetWidth; kitap.classList.add('ing-cevir'); }
    const resimKutusu = dugme('ing-hikaye-resim', f.tr, () => { if (bekliyor) anlat(); }, gorselCiz(f.g));
    sayfaYeri.replaceChildren(resimKutusu);
    bant = cumleBandi(f, 'ing-kur-bant');
    bantYeri.replaceChildren(bant);
    harfleriYak(bant, 1600);
    if (!(await y.soyle(f.ses))) return;
    bekliyor = true;
    ileri.hidden = false;
    ipucuKur(() => ileri, 3500);
  }

  async function sonraki() {
    if (!bekliyor) return;
    bekliyor = false;
    tik.sec();
    ipucuKur(undefined);
    no++;
    if (no < sayfalar.length) { void sayfaGoster(); return; }
    no = sayfalar.length - 1;
    ileri.hidden = true;
    kutla(sayfaYeri);
    void hareket('polly', 'sevin');
    if (!(await y.soyle('en/g-the-end'))) return;
    b.bitti();
  }

  b.tekrarla(tekrarSoz);
  void (async () => {
    if (!(await y.soyle('tr/c-hikaye-giris', a.aciklama, 'en/g-story-time'))) return;
    void sayfaGoster();
  })();
  return () => y.kapat();
};

/** Sıraya Diz: hikâyenin resimleri karışık durur; çocuk önce olana, sonra sıradakine dokunarak hikâyeyi yeniden kurar */
export const siralaKur: AdimKurucu<'sirala'> = (b, a) => {
  const y = yasam();
  let siradaki = 0, kilit = true, yanlis = 0;
  const { masa } = oyunDuzeni(b.alan, 'ing-sirala', () => {});
  const serit = h('div.ing-sirala-serit');
  const resimler = h('div.ing-sirala-resimler');
  const bantYeri = h('div.ing-hikaye-bant');
  masa.append(serit, resimler, bantYeri);
  serit.replaceChildren(...a.sayfalar.map((_, i) => h('span.ing-sirala-yuva', {}, h('b', {}, String(i + 1)))));
  const dogruResim = () => resimler.querySelector<HTMLElement>(`[data-ifade="${a.sayfalar[siradaki]?.id}"]:not(.ing-kullanildi)`);

  async function dokun(f: Ifade, d: HTMLButtonElement) {
    if (kilit || d.classList.contains('ing-kullanildi')) return;
    if (f.id !== a.sayfalar[siradaki].id) {
      if (yanlis === 0) b.hata();
      yanlis++;
      salla(d);
      if (yanlis >= 2) dogruResim()?.classList.add('ing-parla');
      return;
    }
    kilit = true; yanlis = 0;
    ipucuKur(undefined);
    tik.yapis();
    resimler.querySelectorAll('.ing-parla').forEach((x) => x.classList.remove('ing-parla'));
    d.classList.add('ing-kullanildi');
    const yuva = serit.children[siradaki] as HTMLElement;
    yuva.replaceChildren(gorselCiz(f.g));
    yuva.classList.add('ing-dolu');
    const bant = cumleBandi(f, 'ing-kur-bant');
    bantYeri.replaceChildren(bant);
    harfleriYak(bant, 1600);
    siradaki++;
    if (!(await y.soyle(f.ses))) return;
    if (siradaki < a.sayfalar.length) { kilit = false; ipucuKur(() => (yanlis >= 2 ? dogruResim() : null), 6000); return; }
    serit.classList.add('ing-tamam');
    kutla(serit);
    void hareket('polly', 'sevin');
    if (!(await y.soyle(ovgu()))) return;
    b.bitti();
  }

  resimler.replaceChildren(...a.karisik.map((f, i) => {
    const d = dugme('ing-sirala-resim', f.tr, () => void dokun(f, d), gorselCiz(f.g));
    d.dataset.ifade = f.id;
    d.style.setProperty('--n', String(i));
    if (TEST_MODU) d.dataset.sira = String(a.sayfalar.findIndex((x) => x.id === f.id));
    return d;
  }));

  void (async () => {
    if (!(await y.soyle('tr/c-sirala-giris'))) return;
    kilit = false;
    ipucuKur(() => (yanlis >= 2 ? dogruResim() : null), 6000);
  })();
  return () => y.kapat();
};
