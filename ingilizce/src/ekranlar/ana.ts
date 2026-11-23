/**
 * Ana ekran: solda Ceren Öğretmen karşılar ve tek düğmeyle sıradaki derse sokar; sağda bölümler durur
 * (Dersler · Oyunlar · Kelimelerim). Veli köşesi sağ üstte, ebeveyn kapısının arkasında.
 */
import { sayfaAdresi } from '../../../src/kabuk/sayfa';
import { h } from '../../../src/ui/dom';
import { IKON } from '../../../src/ui/ikonlar';
import { TUM_DERSLER, UNITELER } from '../icerik';
import { dersAdi } from '../icerik2';
import { dersBittiMi, haftaDurumu, oku, seri, siradakiDers, toplamYildiz } from '../ilerleme';
import { cizim, dugme, hareket, kelimeResmi, kisi } from '../kit';
import { konus, sesAcikMi, tik } from '../ses';
import { acikKelimeler, adaResmi, dersHazir, dugmeResmi, sesAdresi, uniteHazir } from '../varlik';
import { adaSahnesi } from './adalar';
import type { Gezinme } from './ders';
import { kitaplikHazir, masalAcik, masalAdalari } from './masallar';
import { abcGirisi, abcHazir } from './abc';
import { anaSahne } from './ana-sahne';
import { sohbetAc, sohbetHazir, sohbetHazirla } from './sohbet';

export function anaEkran(kok: HTMLElement, git: Gezinme & { album(): void; buyukler(): void; agacEvi(): void }): () => void {
  const kayit = oku();
  const siradaki = siradakiDers(kayit, (d) => dersHazir(d.unite, d.no));
  const baslanmis = Object.keys(kayit.dersler).length > 0;
  const bitenDers = TUM_DERSLER.filter((d) => dersBittiMi(kayit, d.id)).length;

  const ev = h('a.ing-simge.ing-ev', { href: sayfaAdresi('../'), 'aria-label': 'Minkino menüsüne dön' });
  const evResmi = dugmeResmi('ev');
  if (evResmi) ev.append(h('img', { src: evResmi, alt: '', draggable: 'false' })); else ev.innerHTML = IKON.ev;
  const yildizSayaci = h('div.ing-sayac', { 'aria-label': `${toplamYildiz(kayit)} yıldız` }, cizim('ui/yildiz'), h('strong', {}, String(toplamYildiz(kayit))));
  const buyukler = dugme('ing-buyukler', 'Büyükler için', () => { tik.dokun(); git.buyukler(); }, h('span', { html: IKON.ebeveyn }), 'Büyükler için');
  const ust = h('header.ing-ust', {}, ev, h('div.ing-ust-orta', {}, h('h1.ing-baslik', {}, 'İngilizceye Merhaba')), h('div.ing-ust-sag', {}, yildizSayaci, buyukler));
  // 23 Kasım (Barış: "ağaç evine gerek yok, ne olduğunu anlamadım"): ana ekrandan giriş kaldırıldı; ekran ?ekran=agac ile durur

  if (abcHazir()) ust.querySelector('.ing-ust-sag')?.prepend(abcGirisi(() => (git as typeof git & { abc?(): void }).abc?.()));
  // sol: Ceren + Polly + sıradaki ders düğmesi
  const selamYazisi = baslanmis ? 'Dersimize devam edelim mi?' : 'Hoş geldin! Hadi başlayalım.';
  const balon = h('div.ing-soz-balonu.ing-gorunur', {}, selamYazisi);
  const selamla = () => { void hareket('ceren', 'selam'); void konus(baslanmis ? 'tr/c-ana-devam' : 'tr/c-ana'); };
  const ceren = dugme('ing-ana-ceren', 'Ceren Öğretmen’i dinle', selamla, kisi('ceren'));
  const polly = dugme('ing-ana-polly', 'Polly', () => { if (sohbetHazir('polly')) { sohbetAc(kok, 'polly'); return; } void hareket('polly', 'selam'); void konus('en/g-hello'); }, kisi('polly'));

  let devam: HTMLElement;
  if (siradaki) {
    const ilkKelime = siradaki.unite.kelimeler[siradaki.no === 1 ? 4 : 0];
    devam = dugme('ing-devam', baslanmis ? 'Derse devam et' : 'Derse başla', () => { tik.sec(); git.ders({ tur: 'ders', uniteId: siradaki.unite.id, no: siradaki.no }); },
      kelimeResmi(ilkKelime, 'ing-devam-resim'),
      h('span.ing-devam-yazi', {}, h('strong', {}, baslanmis ? 'Derse devam et' : 'Derse başla'), h('small', {}, `${siradaki.unite.tr} · ${dersAdi(siradaki.unite.id, siradaki.no)}`)),
      h('span.ing-ok', { 'aria-hidden': 'true' }, '▶'));
  } else {
    devam = dugme('ing-devam', 'Günün tekrarı', () => { tik.sec(); git.ders({ tur: 'tekrar' }); },
      h('span.ing-devam-yazi', {}, h('strong', {}, 'Günün Tekrarı'), h('small', {}, 'Bütün dersleri bitirdin!')), h('span.ing-ok', { 'aria-hidden': 'true' }, '▶'));
    if (!kayit.cikartmalar.length) (devam as HTMLButtonElement).disabled = true;
  }
  const sol = h('div.ing-ana-sol', {}, ceren, balon, polly, devam);

  // sağ: bölümler
  const bolum = (sinif: string, ad: string, alt: string, cizimYolu: string, yedek: Node | null, tikla: () => void) => {
    const gorsel = cizim(cizimYolu) ?? yedek;
    return dugme(`ing-bolum ${sinif}`, ad, () => { tik.sec(); tikla(); }, h('span.ing-bolum-resim', {}, gorsel), h('span.ing-bolum-yazi', {}, h('strong', {}, ad), h('small', {}, alt)));
  };
  const adaYedek = (() => {
    const ada = adaResmi('kasaba-ada');
    const kap = h('span.ing-bolum-ada');
    if (ada) kap.append(h('img.ing-ada-zemin', { src: ada, alt: '' }));
    const sahne = adaSahnesi('ciftlik', 3);
    if (sahne) kap.append(sahne);
    return kap;
  })();
  const oyunYedek = cizim('kelime/ball');
  const albumYedek = h('span.ing-bolum-album', { html: IKON.album });
  const sag = h('div.ing-bolumler', {},
    bolum('ing-bolum-dersler', 'Dersler', `${bitenDers} / ${TUM_DERSLER.filter((d) => dersHazir(d.unite, d.no)).length} ders`, 'ui/bolum-dersler', adaYedek, () => git.adalar()),
    bolum('ing-bolum-oyunlar', 'Oyunlar', 'Öğrendiklerinle oyna', 'ui/bolum-oyunlar', oyunYedek, () => git.oyunlar()),
    ...(kitaplikHazir() ? [bolum('ing-bolum-masallar', 'Masallar', `${masalAdalari().filter((u) => masalAcik(kayit, u)).length} / ${masalAdalari().length} masal`, 'ui/bolum-masallar', cizim('kitap/ciftlik') ?? h('span.ing-bolum-album', { html: IKON.album }), () => git.masallar())] : []),
    bolum('ing-bolum-album', 'Kelimelerim', `${kayit.cikartmalar.length} / ${UNITELER.filter(uniteHazir).flatMap(acikKelimeler).length} kelime`, 'ui/bolum-kelimelerim', albumYedek, () => git.album()),
  );

  // bu hafta çalışılan günler: baskısız küçük bir gösterge (kaçırılan gün için uyarı yok)
  const hafta = haftaDurumu(kayit, Date.now());
  const artArda = seri(kayit, Date.now());
  const gunAdlari = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  const serit = h('span.ing-hafta', { role: 'img', 'aria-label': `Bu hafta ${hafta.gunler.filter(Boolean).length} gün çalıştın${artArda > 1 ? `, ${artArda} gün üst üste` : ''}` });
  hafta.gunler.forEach((dolu, i) => {
    const nokta = h(dolu ? 'i.ing-dolu' : 'i', { title: gunAdlari[i] });
    if (i === hafta.bugun) nokta.classList.add('ing-bugun');
    const yildiz = dolu ? cizim('ui/yildiz') : null;
    if (yildiz) nokta.append(yildiz);
    serit.append(nokta);
  });
  sag.querySelector('.ing-bolum-dersler .ing-bolum-yazi')?.append(serit);

  if (kitaplikHazir()) sag.classList.add('ing-bolumler-dort');
  // sahne hâli (23 Kasım, Astra ING-UI-A): parçaların hepsi geldiyse ana ekran ağaç ev sınıfıdır
  const sahne = anaSahne({
    dersler: () => git.adalar(),
    oyunlar: () => git.oyunlar(),
    masallar: kitaplikHazir() ? () => git.masallar() : null,
    kelimeler: () => git.album(),
    devam: siradaki
      ? { yazi: baslanmis ? 'Derse devam et' : 'Derse başla', alt: `${siradaki.unite.tr} · ${dersAdi(siradaki.unite.id, siradaki.no)}`, ac: () => git.ders({ tur: 'ders', uniteId: siradaki.unite.id, no: siradaki.no }) }
      : kayit.cikartmalar.length ? { yazi: 'Günün Tekrarı', alt: 'Bütün dersleri bitirdin!', ac: () => git.ders({ tur: 'tekrar' }) } : null,
    selam: baslanmis ? 'tr/c-ana-devam' : 'tr/c-ana',
    // 23 Kasım (Barış: "tıkladığımız karakterle sohbet edebilelim"): Polly'ye dokununca kısa İngilizce sohbet
    karakter: (id) => {
      if (id !== 'kino' && sohbetHazir(id)) { sohbetAc(kok, id); return; }
      // sohbeti olmayan karakter el sallar ve selam verir: Kino kendi sesiyle "Hi!", öbürleri Polly'nin "Hello!"su
      void konus(id === 'kino' && sesAdresi('en/k-hi') ? 'en/k-hi' : 'en/g-hello');
    },
    sohbetVar: (['polly', 'mino', 'zipzip', 'lokum'] as const).filter((id) => sohbetHazir(id)),
  });
  sohbetHazirla();
  if (sahne) { kok.append(sahne.kok, ust); ust.classList.add('ing-ust-sahne'); return () => sahne.birak(); }
  kok.append(ust, h('section.ing-ana', {}, sol, sag));
  // tarayıcı ilk dokunuştan önce ses çalmaz: Ceren ancak ses açıldıysa kendiliğinden selam verir
  if (sesAcikMi()) window.setTimeout(selamla, 350);
  return () => {};
}
