/**
 * Etkinlik 2 · Sayı kartı (rakam ile miktarı eşleme). Rüzgâr sepetlerin etiketlerini uçurmuş: rakam kartı, içinde o
 * kadar elma olan sepete sürüklenir; "tık" diye yapışır, Mino sayar ("Bir, iki, üç. Üç!"). Yanlışta kart geri kayar,
 * Mino o sepetteki elmaları sayar. 3 sepet × 2 tur. Kino: 6'yı ters tutup "Dokuz!" der (5-6 yaş).
 */
import O from '../../../content/okul.json';
import { h, TEST_MODU } from '../../../src/ui/dom';
import { gorsel } from '../cizim';
import { oynat, tasi } from '../efekt';
import { etkinlikKaydet } from '../etkinlik';
import { Ipucu, rakamKarti, type Sahne } from '../sahne';
import { kartUyar, sepetTurlari } from '../sayi';
import { ses } from '../sesler';
import { geriGonder, hedefliSurukle } from '../surukle';

const M = O.mino.sayi_karti;

function sepetEl(adet: number, i: number): HTMLElement {
  const elmalar = Array.from({ length: adet }, (_, k) => h('span.ok-mini-elma', { style: `--k:${k}` }, h('img', { src: gorsel('meyveler/elma'), alt: '', draggable: 'false' })));
  return h(
    'div.ok-e2-sepet',
    { 'data-adet': String(adet), style: `--i:${i}` },
    h('img.ok-sepet-resim', { src: gorsel('pazar/sepet'), alt: '', draggable: 'false' }),
    h('div.ok-e2-elmalar', { 'data-n': String(adet) }, ...elmalar),
    h('img.ok-sepet-resim.ok-sepet-on', { src: gorsel('pazar/sepet'), alt: '', draggable: 'false' }),
    h('div.ok-e2-yuva'),
  );
}

async function tur(s: Sahne, adetler: number[], kinoTuru: boolean) {
  const sepetler = adetler.map((a, i) => sepetEl(a, i));
  const kartlar = s.karistir(adetler).map((n, i) => {
    const k = rakamKarti(n, 'ok-etiket');
    k.style.setProperty('--i', String(i));
    return k;
  });
  // sepetler oyun alanında, rüzgârın uçurduğu etiketler aşağıda (cevap şeridinde): sepetler büyük görünsün
  s.alan.replaceChildren(h('div.ok-e2', {}, h('div.ok-e2-sepetler', {}, ...sepetler)));
  s.secim.replaceChildren(h('div.ok-e2-etiketler', {}, ...kartlar.map((k) => h('div.ok-e2-yer', {}, k))));
  const sepetiSay = async (sepet: HTMLElement) => {
    const el = [...sepet.querySelectorAll('.ok-mini-elma')];
    await s.sayarak(el.length, (i) => oynat(el[i - 1], 'ok-zipla'));
  };

  if (kinoTuru) {
    await s.soyle(M.giris);
    if (s.yas >= 5) {
      const alti = kartlar.find((k) => k.dataset.sayi === '6');
      await s.kinoHata({
        kino: O.kino.dokuz,
        once: () => alti?.classList.add('ok-ters'),
        mino: M.ters,
        sonra: async () => {
          alti?.classList.remove('ok-ters');
          ses.tik();
          await s.bekle(350);
          await s.say(6);
        },
      });
    } else {
      await s.kinoHata({ kino: O.kino.hepsi, poz: 'kalk', mino: M.gorelim });
    }
  }
  await s.soyle(M.soru);
  s.adim('surukle');

  let kalan = sepetler.length;
  let mesgul = false;
  await new Promise<void>((coz) => {
    for (const k of kartlar) {
      const n = Number(k.dataset.sayi);
      const dogruSepet = sepetler.find((sp) => kartUyar(n, Number(sp.dataset.adet)) && !sp.dataset.dolu);
      const ipucu = new Ipucu(() => [k, dogruSepet]);
      if (TEST_MODU && dogruSepet) dogruSepet.dataset.hedefSayi = String(n);
      const birak = hedefliSurukle({
        el: k,
        hedefler: () => sepetler.filter((sp) => !sp.dataset.dolu),
        aktif: () => !mesgul && !k.dataset.yapisti && !s.kapandi(),
        birak: async (sp) => {
          if (!sp) return geriGonder(k);
          if (kartUyar(n, Number(sp.dataset.adet))) {
            mesgul = true;
            k.dataset.yapisti = '1';
            sp.dataset.dolu = '1';
            ipucu.sifirla();
            tasi(k, sp.querySelector('.ok-e2-yuva')!);
            k.style.transform = '';
            ses.tik();
            oynat(sp, 'ok-yapis');
            await sepetiSay(sp);
            await s.say(n);
            kalan--;
            mesgul = false;
            if (kalan === 0) coz();
            return;
          }
          mesgul = true;
          geriGonder(k);
          s.nazik(sp);
          ipucu.yanlis();
          await s.soyle(M.bakalim);
          await sepetiSay(sp);
          mesgul = false;
        },
      });
      s.kapaninca(birak);
    }
  });
  await s.ovgu(s.alan);
  s.secim.replaceChildren();
}

etkinlikKaydet({
  id: 'sayi-karti',
  bolge: 'sayi',
  ad: O.arayuz.etkinlikler['sayi-karti'],
  ucretsiz: true,
  async oyna(s) {
    const turlar = sepetTurlari(s.yas, s.rnd);
    s.turlar(turlar.length);
    for (let i = 0; i < turlar.length; i++) {
      if (s.kapandi()) return;
      s.tur(i);
      await tur(s, turlar[i], i === 0);
    }
    s.tur(turlar.length);
  },
});
