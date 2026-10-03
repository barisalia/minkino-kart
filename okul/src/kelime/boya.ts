/**
 * Kelime Köprüsü 4 · Boya kovası (renk adları). Ortada boyasız (gri) bir resim, altta renkli boya kovaları. Mino rengi
 * söyler ("Kırmızı!"), çocuk o kovaya dokunur: kova eğilir, boya uçar, resim aşağıdan yukarı o renge boyanır.
 * Yanlış kovada kovanın rengi söylenir ("Mavi!"), sonra aranan renk yeniden. Sonunda boyanan resimler yan yana.
 * Kino (ilk tur): mavi kovaya atlar, maviye boyanır: "Kovaya atlıyorum! Hop!" Mino: "Kino mavi oldu!"
 */
import { h } from '../../../src/ui/dom';
import { efekt } from '../../../src/audio/ses';
import { oynat } from '../efekt';
import { etkinlikKaydet } from '../etkinlik';
import type { Sahne } from '../sahne';
import { ses } from '../sesler';
import { boyaTurlari, kelime, renk, renkSozu, type BoyaTuru } from './model';
import { dokunSec, KA, KK, KM, simge } from './ortak';
import { boya, boyanabilir } from './resim';

/** Renkli boya kovası */
function kova(r: string): HTMLButtonElement {
  const b = h('button.ok-k-kova', { type: 'button', 'data-renk': r, 'aria-label': renk(r).ad }, boyanabilir('film/esya/kova'));
  boya(b.firstElementChild as HTMLElement, renk(r).deger, false);
  return b;
}

async function tur(s: Sahne, t: BoyaTuru, ilk: boolean, biten: HTMLElement[]) {
  const nesne = boyanabilir(kelime(t.nesne).resim, 'ok-k-boya-nesne');
  const kap = h('div.ok-k-boya-kap', { 'data-nesne': t.nesne }, nesne);
  s.alan.replaceChildren(h('div.ok-k-boya-alan', {}, kap));
  oynat(kap, 'ok-yapis');
  const kovalar = t.kovalar.map((r, i) => {
    const k = kova(r);
    k.style.setProperty('--i', String(i));
    k.classList.add('ok-k-gel');
    return k;
  });
  s.secim.replaceChildren(h('div.ok-k-kovalar', { 'data-n': String(kovalar.length) }, ...kovalar));

  if (ilk) {
    await s.soyle(KM.boya.giris);
    // Kino mavi kovaya atlar, maviye boyanır
    const mavi = kovalar.find((k) => k.dataset.renk === 'mavi');
    if (mavi) {
      const [x, y] = s.efekt.merkez(mavi, 0.5, 0.35);
      await s.kinoHata({
        kino: KK.boya,
        poz: 'kalk',
        once: async () => {
          await s.kinoGit(x, y, 650);
          ses.pof();
          oynat(mavi, 'ok-hmm');
          s.kinoYer.style.setProperty('--kino-boya', renk('mavi').deger);
          s.kinoYer.classList.add('ok-k-boyali-kino');
        },
        mino: KM.boya.yakala,
        sonra: async () => {
          await s.kinoDon(550);
          s.kinoOynat('huy', 900);
          ses.kanat();
          s.kinoYer.classList.remove('ok-k-boyali-kino');
        },
        kinoSon: KK.boya_son,
      });
    }
  }
  s.adim('boya');
  await s.soyle(renkSozu(t.renk));
  const k = await dokunSec(s, kovalar, (x) => x.dataset.renk === t.renk, {
    yanlis: async (x) => {
      await s.soyle(renkSozu(x.dataset.renk ?? ''));
      await s.soyle(renkSozu(t.renk));
    },
  });
  // kova eğilir, boya damlası resme uçar, resim boyanır
  k.classList.add('ok-k-dok');
  efekt.dokunma();
  const damla = h('span.ok-k-damla', { style: `--renk:${renk(t.renk).deger}` });
  await s.efekt.ucur(damla, s.efekt.merkez(k, 0.5, 0.2), s.efekt.merkez(nesne, 0.5, 0.55), { ms: 520, kavis: -90, boy0: 0.6, boy1: 1.4 });
  ses.dus();
  boya(nesne, renk(t.renk).deger);
  await s.ovgu(nesne);
  await s.soyle(renkSozu(t.renk));
  k.classList.remove('ok-k-dok');
  biten.push(kap);
  s.secim.replaceChildren();
}

etkinlikKaydet({
  id: 'kelime-boya',
  bolge: 'kelime',
  ad: KA.etkinlikler['kelime-boya'],
  simge: () => simge(['film/esya/kova', 'ok-ks-kova']),
  async oyna(s) {
    const turlar = boyaTurlari(s.yas, s.rnd);
    const biten: HTMLElement[] = [];
    s.turlar(turlar.length);
    for (let i = 0; i < turlar.length; i++) {
      if (s.kapandi()) return;
      s.tur(i);
      await tur(s, turlar[i], i === 0, biten);
    }
    s.tur(turlar.length);
    // boyanan resimler yan yana: rengarenk
    s.alan.replaceChildren(h('div.ok-k-boya-son', {}, ...biten));
    biten.forEach((b, i) => {
      b.style.setProperty('--j', String(i));
      b.classList.add('ok-k-dans');
    });
    s.konfeti(0.5, 0.4, 60);
    await s.soyle(KM.boya.bitti);
    await s.bekle(500);
  },
});
