/**
 * Oyunlar (pratik bölümü): derste öğrenilen kelimelerle serbest oyun. 18 Kasım 2026'da eski dokuz oyun kaldırıldı
 * (derslerdeki adımların tekrarıydı; Barış: "1 tane adam akıllı oyun yap"): tek oyun Fener Avı, altında Günün Tekrarı.
 * Fener Avı, bir adanın en az üç kelimesi öğrenilince açılır.
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import { IKON } from '../../../src/ui/ikonlar';
import { bugunTekrarEdildi, ogrenilenler, oku } from '../ilerleme';
import { kelimeBul } from '../icerik';
import { cizim, dugme, kisi, salla, simgeDugme } from '../kit';
import { saklambacHazir } from '../adimlar/saklambac';
import { adaOyunuHazir, renkliPlani } from '../adimlar/ada-oyunlari';
import { bilmeceOyunu, farkliOyunu } from '../adimlar/bilmece-plan';
import { konus, sesAcikMi, tik } from '../ses';
import { yer } from '../adimlar/resim';
import { TASLAK, kelimeResmiAdresi, sahneResmi } from '../varlik';
import { fenerAdaylari, fenerOrnekAdasi, type Gezinme } from './ders';
import { oyunSahnesi } from './oyun-sahne';

export function oyunlarEkrani(kok: HTMLElement, git: Gezinme): () => void {
  const kayit = oku();
  const ogrenilen = ogrenilenler(kayit).length;
  const yapildi = bugunTekrarEdildi(kayit, Date.now());
  const ust = h('header.ing-ust', {},
    simgeDugme('geri', 'Ana ekrana dön', () => git.ana(), 'ing-geri'),
    h('div.ing-ust-orta', {}, h('h1.ing-baslik', {}, 'Oyunlar')),
    h('div.ing-ust-sag'),
  );
  const ceren = kisi('ceren', 'ing-oyunlar-ceren');
  const kilitliUyari = (el: Element) => { salla(el); void konus('tr/c-oyun-kilitli'); };

  const gunluk = dugme('ing-gunluk', 'Günün Tekrarı', () => {
    if (ogrenilen < 3) { kilitliUyari(gunluk); return; }
    tik.sec(); git.ders({ tur: 'tekrar' });
  },
    h('span.ing-gunluk-resim', {}, kisi('polly')),
    h('span.ing-gunluk-yazi', {}, h('strong', {}, 'Günün Tekrarı'), h('small', {}, yapildi ? 'Bugün yaptın. Bir daha?' : 'Bakalım hangilerini hatırlıyorsun?')),
    yapildi ? h('span.ing-gunluk-tamam', { 'aria-hidden': 'true', html: IKON.onay }) : h('span.ing-ok', { 'aria-hidden': 'true' }, '▶'),
  );
  if (ogrenilen < 3) gunluk.classList.add('ing-kilitli');

  // Tek oyun: Fener Avı (18 Kasım 2026). Kartın resmi oyunun ilk adası; gece ve fener ışığı CSS katmanıdır.
  const adaylar = fenerAdaylari(kayit);
  const fenerAcik = adaylar.length > 0;
  const kartFonu = sahneResmi(adaylar[0]?.uniteId ?? 'ciftlik');
  const kartResmi = h('span.ing-fener-kart-resim', { 'aria-hidden': 'true' }, h('span.ing-fener-gece'));
  if (kartFonu) kartResmi.style.backgroundImage = `url("${kartFonu}")`;
  // kartta adanın sakinleri de durur (oyundaki yerlerinde); fener ışığı üstlerinde gezinir
  const ilkAda = adaylar[0] ?? fenerOrnekAdasi();
  ilkAda?.kelimeler.forEach((w, i) => {
    const adres = kelimeResmiAdresi(w);
    if (!adres) return;
    const [sol, alt, gen] = yer(ilkAda.uniteId, w, i);
    const el = h('span.ing-fener-kart-nesne', {}, h('img', { src: adres, alt: '', draggable: 'false' }));
    el.style.cssText = `left:${sol}%;bottom:${alt}%;width:${gen}%;z-index:${100 - Math.round(alt)}`;
    kartResmi.append(el);
  });
  const fener = dugme('ing-fener-karti', 'Fener Avı', () => {
    if (!fenerAcik) { kilitliUyari(fener); return; }
    tik.sec(); git.ders({ tur: 'fener' });
  }, kartResmi, h('span.ing-fener-kart-yazi', {}, h('strong', {}, 'Fener Avı'), h('small', {}, 'Adada gece oldu! Feneri gezdir, Polly’nin sorduğunu bul.')),
  fenerAcik ? h('span.ing-ok', { 'aria-hidden': 'true' }, '▶') : h('span.ing-oyun-kilit', { 'aria-hidden': 'true', html: IKON.kilit }));
  fener.dataset.oyun = 'fener';
  if (!fenerAcik) fener.classList.add('ing-kilitli');

  // Hayvanat Bahçesi (20 Kasım 2026): Çiftlik adasının 3. dersi "100 hayvan" bitince açılır; kartta bölümlerin hayvanları
  const bahceAcik = TASLAK || TEST_MODU || !!kayit.dersler['ciftlik-3'];
  const bahceResmi = h('span.ing-bahce-kart-resim', { 'aria-hidden': 'true' },
    ...['dolphin', 'owl', 'ladybug', 'fox', 'koala', 'chick', 'octopus', 'flamingo', 'hedgehog', 'camel'].map((id) => { const w = kelimeBul(id); const adres = w && kelimeResmiAdresi(w); return adres ? h('img', { src: adres, alt: '', draggable: 'false' }) : null; }));
  const bahce = dugme('ing-bahce-karti', 'Hayvanat Bahçesi', () => {
    if (!bahceAcik) { kilitliUyari(bahce); return; }
    tik.sec(); git.ders({ tur: 'bahce' });
  }, bahceResmi, h('span.ing-fener-kart-yazi', {}, h('strong', {}, 'Hayvanat Bahçesi'), h('small', {}, 'Yüz hayvanı gez: deniz, kuşlar, böcekler, orman…')),
  bahceAcik ? h('span.ing-ok', { 'aria-hidden': 'true' }, '▶') : h('span.ing-oyun-kilit', { 'aria-hidden': 'true', html: IKON.kilit }));
  bahce.dataset.oyun = 'bahce';
  if (!bahceAcik) bahce.classList.add('ing-kilitli');

  // Hide & Seek with Mino (20 Kasım 2026): in, on, under, next to. Çizimi ve sesi gelince görünür (taslak ve testte hep).
  const saklambac = saklambacHazir() ? dugme('ing-bahce-karti ing-saklambac-karti', 'Hide & Seek', () => { tik.sec(); git.ders({ tur: 'saklambac' }); },
    h('span.ing-bahce-kart-resim', { 'aria-hidden': 'true' }, cizim('oyun/saklambac/mino-buldum') ?? kisi('polly')),
    h('span.ing-fener-kart-yazi', {}, h('strong', {}, 'Hide & Seek'), h('small', {}, 'Mino saklandı! Nerede? In, on, under…')),
    h('span.ing-ok', { 'aria-hidden': 'true' }, '▶')) : null;
  if (saklambac) saklambac.dataset.oyun = 'saklambac';

  // Renkli Kino (21 Kasım 2026): çizimi ve sesi gelince görünür; Renkler ve Kıyafetler adalarının kelime dersleri bitince açılır
  const renkliAcik = TASLAK || TEST_MODU || (!!kayit.dersler['renkler-3'] && !!kayit.dersler['kiyafetler-3']);
  const renkli = TASLAK || TEST_MODU || adaOyunuHazir(renkliPlani('5+')) ? dugme('ing-bahce-karti ing-renkli-karti', 'Renkli Kino', () => {
    if (!renkliAcik) { kilitliUyari(renkli!); return; }
    tik.sec(); git.ders({ tur: 'renkli' });
  }, h('span.ing-bahce-kart-resim', { 'aria-hidden': 'true' }, cizim('oyun/renkli/kart') ?? kisi('kino')),
  h('span.ing-fener-kart-yazi', {}, h('strong', {}, 'Renkli Kino'), h('small', {}, 'Kırmızı şapka, mavi çorap… Kino’yu renk renk giydir!')),
  renkliAcik ? h('span.ing-ok', { 'aria-hidden': 'true' }, '▶') : h('span.ing-oyun-kilit', { 'aria-hidden': 'true', html: IKON.kilit })) : null;
  if (renkli) { renkli.dataset.oyun = 'renkli'; if (!renkliAcik) renkli.classList.add('ing-kilitli'); }

  // Polly's Riddles (4 ve 5+) ve Odd One Out (21 Kasım 2026): yalnız bitirilen adaların kelimeleri; dört tur kurulunca açılır
  const kucukOyun = (sinif: string, oyun: 'bilmece' | 'farkli', ad: string, alt: string, resim: string, acikMi: boolean) => {
    const d = dugme(`ing-bahce-karti ing-kucuk-oyun ${sinif}`, ad, () => {
      if (!acikMi) { kilitliUyari(d); return; }
      tik.sec(); git.ders({ tur: oyun });
    }, h('span.ing-bahce-kart-resim', { 'aria-hidden': 'true' }, cizim(`kelime/${resim}`) ?? kisi('polly')),
    h('span.ing-fener-kart-yazi', {}, h('strong', {}, ad), h('small', {}, alt)),
    acikMi ? h('span.ing-ok', { 'aria-hidden': 'true' }, '▶') : h('span.ing-oyun-kilit', { 'aria-hidden': 'true', html: IKON.kilit }));
    d.dataset.oyun = oyun;
    if (!acikMi) d.classList.add('ing-kilitli');
    return d;
  };
  const bilmece = git.yas === '2-3' ? null : kucukOyun('ing-bilmece-karti', 'bilmece', 'Polly’s Riddles', 'Polly anlatıyor, sen bul!', 'banana', !!bilmeceOyunu(kayit, git.yas));
  const farkli = kucukOyun('ing-farkli-karti', 'farkli', 'Odd One Out', 'Hangisi farklı?', 'apple', !!farkliOyunu(kayit, git.yas));

  // sahne hâli (23 Kasım, Astra ING-UI-B): parçaların hepsi geldiyse Oyunlar bölümü bir oyun parkıdır
  const park = (acik: boolean, ac: () => void, el: HTMLElement | null) => (el ? { acik, ac: () => { tik.sec(); ac(); }, kilitliUyari: () => void konus('tr/c-oyun-kilitli') } : null);
  const sahne = oyunSahnesi({
    fener: park(fenerAcik, () => git.ders({ tur: 'fener' }), fener),
    bahce: park(bahceAcik, () => git.ders({ tur: 'bahce' }), bahce),
    saklambac: park(true, () => git.ders({ tur: 'saklambac' }), saklambac),
    renkli: park(renkliAcik, () => git.ders({ tur: 'renkli' }), renkli),
    bilmece: bilmece ? park(!bilmece.classList.contains('ing-kilitli'), () => git.ders({ tur: 'bilmece' }), bilmece) : null,
    farkli: park(!farkli.classList.contains('ing-kilitli'), () => git.ders({ tur: 'farkli' }), farkli),
    gunluk: park(ogrenilen >= 3, () => git.ders({ tur: 'tekrar' }), gunluk),
  });
  if (sahne) {
    ust.classList.add('ing-ust-sahne');
    kok.append(sahne.kok, ust);
    if (sesAcikMi()) window.setTimeout(() => void konus(ogrenilen < 3 ? 'tr/c-oyun-kilitli' : 'tr/c-oyunlar'), 300);
    return () => sahne.birak();
  }
  kok.append(ust, h('section.ing-oyunlar', {}, h('div.ing-oyunlar-sol', {}, ceren), h('div.ing-oyunlar-sag', {}, fener, bahce, ...(saklambac ? [saklambac] : []), ...(renkli ? [renkli] : []), ...(bilmece ? [bilmece] : []), farkli, gunluk)));
  if (sesAcikMi()) window.setTimeout(() => void konus(ogrenilen < 3 ? 'tr/c-oyun-kilitli' : 'tr/c-oyunlar'), 300);
  return () => {};
}
