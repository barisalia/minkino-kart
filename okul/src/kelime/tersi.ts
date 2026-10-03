/**
 * Kelime Köprüsü 3 · Tersi ne? (zıt anlamlılar). Kino bugün her şeyin tersini yapar: Mino "Perdeyi aç Kino!" der,
 * Kino perdeyi kapatır ("Kapattım!"). Sahnede Kino'nun yaptığı durur; çocuk iki karttan doğrusunu seçer ("Hangisi
 * açık?"), kart sahneye uçar ve Mino zıddını söyler: "Açık! Tersi kapalı."
 * Çiftler: açık-kapalı (perde), büyük-küçük (top), sıcak-soğuk (çorba, dondurma), uzun-kısa (tren), dolu-boş (sepet),
 * ıslak-kuru (havlu; ıslak havlunun görseli gelince oyuna girer).
 */
import { h } from '../../../src/ui/dom';
import { kirpik, ton } from '../cizim';
import { oynat } from '../efekt';
import { etkinlikKaydet } from '../etkinlik';
import type { Sahne } from '../sahne';
import { tersTurlari, type TersCift } from './model';
import { dokunSec, KA, KK, KM, simge } from './ortak';
import { kses } from './ses';
import { gorselEl, hazir, kelimeGorsel } from './resim';

type Taraf = 'a' | 'b';

/** Trenin görünüşü: lokomotif + vagonlar (aynı ölçek; uzun 3, kısa 0 vagon) */
function tren(vagon: number): HTMLElement {
  const vagonlar = Array.from({ length: vagon }, (_, i) => h('span.ok-k-vagon', { html: kirpik('okul/vagon', 'ok-tonlu ok-ayna', ton(i)) }));
  return h('span.ok-k-tren', { 'data-vagon': String(vagon) }, ...vagonlar, h('img.ok-k-lokomotif', { src: kelimeGorsel('tasitlar/tren'), alt: '', draggable: 'false' }));
}

/** Sepet: dolu (elmalar) ya da boş */
function sepet(dolu: boolean): HTMLElement {
  const elmalar = dolu ? Array.from({ length: 5 }, (_, i) => h('img.ok-k-sepet-elma', { src: kelimeGorsel('meyveler/elma'), alt: '', draggable: 'false', style: `--i:${i}` })) : [];
  return h('span.ok-k-dolu-sepet', {}, h('img.ok-resim', { src: kelimeGorsel('pazar/sepet'), alt: '', draggable: 'false' }), ...elmalar);
}

/** Çiftin bir durumunun görüntüsü (sahnede ve kartta aynı) */
export function gorunus(c: TersCift, t: Taraf): HTMLElement {
  const a = t === 'a';
  const kutu = (...c2: HTMLElement[]) => h(`span.ok-k-gorunus`, { 'data-cift': c.id, 'data-taraf': t }, ...c2);
  switch (c.id) {
    case 'acik':
      return kutu(gorselEl(a ? 'ege/perde-acik' : 'ege/perde-kapali'));
    case 'buyuk':
      return kutu(gorselEl('renkler/top', a ? 'ok-k-buyuk' : 'ok-k-kucuk'));
    case 'sicak':
      return kutu(gorselEl(a ? 'renkler/corba' : 'renkler/dondurma'));
    case 'uzun':
      return kutu(tren(a ? 3 : 0));
    case 'dolu':
      return kutu(sepet(a));
    case 'kuru':
      return kutu(gorselEl(a ? 'banyo/havlu-mavi' : 'okul/kelime/havlu-islak'));
  }
}

async function tur(s: Sahne, c: TersCift, ilk: boolean) {
  const S = KM.tersi.ciftler[c.id];
  const pano = h('div.ok-k-pano', { 'data-cift': c.id });
  s.alan.replaceChildren(h('div.ok-k-tersi', {}, pano));
  s.secim.replaceChildren();
  if (ilk) await s.soyle(KM.tersi.giris);
  await s.soyle(S.iste);
  // Kino tersini yapar: panoya zıplar, sahnede onun yaptığı belirir
  const [x, y] = s.efekt.merkez(pano, 0.85, 0.95);
  await s.kinoHata({
    kino: KK.tersi[c.id],
    poz: 'kalk',
    once: async () => {
      await s.kinoGit(x, y, 600);
      kses.ters();
      s.kinoOynat('huy', 700);
      pano.replaceChildren(gorunus(c, 'b'));
      oynat(pano, 'ok-k-ters-don');
    },
    mino: ilk ? KM.tersi.yakala : undefined,
  });
  await s.kinoDon(500);
  if (ilk) await s.soyle(KM.tersi.sen);

  const kartlar = s.karistir<Taraf>(['a', 'b']).map((t, i) => {
    const k = h('button.ok-k-kart.ok-k-ters-kart.ok-k-gel', { type: 'button', 'data-taraf': t, style: `--i:${i}`, 'aria-label': t === 'a' ? S.a : S.b }, gorunus(c, t));
    return k;
  });
  s.secim.replaceChildren(h('div.ok-k-ters-kartlar', {}, ...kartlar));
  s.adim('sec');
  await s.soyle(S.soru);
  const k = await dokunSec(s, kartlar, (x) => x.dataset.taraf === 'a', {
    yanlis: async () => {
      // dokunduğu durumun adı ("Kapalı!"), sonra soru
      await s.soyle(S.b);
      await s.soyle(S.soru);
    },
  });
  // doğru kart sahneye uçar, Kino'nun yaptığının yerini alır
  const icerik = gorunus(c, 'a');
  icerik.classList.add('ok-k-ucan-gorunus');
  const [x0, y0] = s.efekt.merkez(k);
  const [x1, y1] = s.efekt.merkez(pano);
  k.classList.add('ok-k-gitti');
  await s.efekt.ucur(icerik, [x0, y0], [x1, y1], { ms: 520, boy0: 0.6, boy1: 1 });
  pano.replaceChildren(gorunus(c, 'a'));
  oynat(pano, 'ok-k-ters-don');
  kses.boing();
  await s.ovgu(pano);
  s.kinoIfade('utangac', 1200);
  await s.soyle(S.ters);
  s.secim.replaceChildren();
}

etkinlikKaydet({
  id: 'kelime-tersi',
  bolge: 'kelime',
  ad: KA.etkinlikler['kelime-tersi'],
  simge: () => simge(['ege/perde-acik', 'ok-ks-tam']),
  async oyna(s) {
    const turlar = tersTurlari(s.yas, s.rnd, hazir);
    s.turlar(turlar.length);
    for (let i = 0; i < turlar.length; i++) {
      if (s.kapandi()) return;
      s.tur(i);
      await tur(s, turlar[i], i === 0);
    }
    s.tur(turlar.length);
  },
});
