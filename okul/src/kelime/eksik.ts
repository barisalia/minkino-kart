/**
 * Kelime Köprüsü 6 · Eksik kelime (cümle içinde kelime anlamı). Mino bir cümle kurar, bir kelime eksik: "Kino bir …
 * yedi." Çocuk üç resimden birine dokunur, resim boşluğa uçar. Doğruysa cümle tamamlanır (Kino kemiği yer, Mino tam
 * cümleyi söyler). Yanlışta ceza yok, komik sahne: Kino çizmeyi ısırır ("Ihh! Lastik tadı var!"), bulut uçup gider,
 * fil uçmaya çalışır…; sonra resim yerine döner, Mino cümleyi yeniden okur.
 */
import { h } from '../../../src/ui/dom';
import { oynat } from '../efekt';
import { etkinlikKaydet } from '../etkinlik';
import type { Sahne } from '../sahne';
import { ses } from '../sesler';
import { eksikTurlari, type CumleId, type EksikTuru } from './model';
import { dokunSec, KA, KK, KM, resimKarti, simge } from './ortak';
import { gorselEl, hazir, kelimeEl } from './resim';

/** Cümlenin öznesi (sahnede yoksa): resim yolu */
const OZNE: Partial<Record<CumleId, string>> = { semsiye: 'canlan/bulut', havuc: 'hayvanlar/tavsan', ucak: 'film/esya/gunes' };
/** Kino'nun yediği cümleler */
const KINO_YER: CumleId[] = ['kemik', 'elma'];
const KOMIK = KK.komik as Record<string, string>;

async function tur(s: Sahne, t: EksikTuru, ilk: boolean) {
  const C = KM.eksik.cumleler[t.cumle];
  const bosluk = h('div.ok-k-bosluk', { 'aria-label': '?' }, h('b.ok-k-soru', {}, '?'));
  const ozne = OZNE[t.cumle];
  s.alan.replaceChildren(h('div.ok-k-eksik', { 'data-cumle': t.cumle }, ozne ? h('div.ok-k-ozne', {}, gorselEl(ozne)) : null, bosluk));
  const kartlar = t.secenekler.map((id, i) => {
    const k = resimKarti(id, 'ok-k-gel');
    k.style.setProperty('--i', String(i));
    return k;
  });
  s.secim.replaceChildren(h('div.ok-k-ters-kartlar', { 'data-n': '3' }, ...kartlar));
  if (ilk) await s.soyle(KM.eksik.giris);
  await s.soyle(C.soru);

  /** Seçilen resim boşluğa uçar; boşluktaki resmi döndürür */
  const bosluga = async (k: HTMLElement) => {
    const id = k.dataset.kelime ?? '';
    k.classList.add('ok-k-gitti');
    await s.efekt.ucur(kelimeEl(id, 'ok-k-ucan-oge'), s.efekt.merkez(k), s.efekt.merkez(bosluk), { ms: 480, kavis: -70, boy0: 0.7, boy1: 1.1 });
    const r = kelimeEl(id, 'ok-k-bosluk-resim');
    bosluk.replaceChildren(r);
    bosluk.classList.add('dolu');
    ses.dus();
    oynat(bosluk, 'ok-yapis');
    return r;
  };

  /** Komik sahne (ceza yok): çizmeyi Kino ısırır, bulut uçup gider, ötekiler boing diye seker */
  const komik = async (id: string, r: HTMLElement) => {
    if (id === 'cizme') {
      const [x, y] = s.efekt.merkez(bosluk, 0.9, 1);
      await s.kinoGit(x + 20, y, 550);
      s.kinoOynat('ye', 800);
      ses.ham();
      r.classList.add('ok-k-isir');
    } else if (id === 'bulut') {
      r.classList.add('ok-k-uc');
      s.kinoOynat('sevin', 800);
      ses.kanat();
    } else {
      r.classList.add('ok-k-boing');
      ses.pof();
    }
    s.kinoIfade('saskin', 1600);
    s.minoTepki('gidik');
  };
  /** Boşluktaki resim kartına döner */
  const geriKoy = async (k: HTMLElement) => {
    if (k.dataset.kelime === 'cizme') await s.kinoDon(450);
    bosluk.replaceChildren(h('b.ok-k-soru', {}, '?'));
    bosluk.classList.remove('dolu');
    k.classList.remove('ok-k-gitti');
    oynat(k, 'ok-zipla');
  };

  // Kino (ilk cümle): çizmeyi yemeye kalkar
  const cizme = ilk ? kartlar.find((k) => k.dataset.kelime === 'cizme') : undefined;
  if (cizme) {
    await s.kinoHata({
      kino: KOMIK.cizme,
      poz: null,
      once: async () => komik('cizme', await bosluga(cizme)),
      mino: KM.eksik.yakala,
      sonra: () => geriKoy(cizme),
    });
  }

  const dogru = await dokunSec(s, kartlar, (x) => x.dataset.kelime === t.dogru, {
    nazik: false,
    adim: 'sec',
    soru: cizme ? C.soru : undefined,
    yanlis: async (k) => {
      const id = k.dataset.kelime ?? '';
      await komik(id, await bosluga(k));
      await s.soyle(KOMIK[id] ?? KM.eksik.tekrar, 'kino');
      await geriKoy(k);
      await s.soyle(KM.eksik.tekrar);
      await s.soyle(C.soru);
    },
  });
  const r = await bosluga(dogru);
  const [x, y] = s.efekt.merkez(bosluk);
  s.efekt.parilti(x, y, 10);
  if (KINO_YER.includes(t.cumle)) {
    // Kino kemiği (elmayı) yer
    const [kx, ky] = s.efekt.merkez(bosluk, 0.9, 1);
    await s.kinoGit(kx + 20, ky, 550);
    s.kinoOynat('ye', 1000);
    ses.ham();
    r.classList.add('ok-k-yendi');
    await s.soyle(KK.eksik_dogru, 'kino');
    await s.kinoDon(450);
  }
  await s.ovgu();
  await s.soyle(C.tam);
  s.secim.replaceChildren();
}

etkinlikKaydet({
  id: 'kelime-eksik',
  bolge: 'kelime',
  ad: KA.etkinlikler['kelime-eksik'],
  simge: () => `<span class="ok-simge-yigin">${simge(['renkler/semsiye', 'ok-ks-tam'])}<b class="ok-ks-soru">?</b></span>`,
  async oyna(s) {
    const turlar = eksikTurlari(s.yas, s.rnd, hazir);
    s.turlar(turlar.length);
    for (let i = 0; i < turlar.length; i++) {
      if (s.kapandi()) return;
      s.tur(i);
      await tur(s, turlar[i], i === 0);
    }
    s.tur(turlar.length);
  },
});
