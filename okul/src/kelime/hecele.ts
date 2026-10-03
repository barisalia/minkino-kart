/**
 * Kelime Köprüsü 2 · Alkışla hecele (hece sayma). Resimli kelime (karpuz) heceleri kadar taşla gelir; Mino heceleyerek
 * söyler ("Kar!", "Puz!"), her hecede bir taş parlar. Çocuk davula her hece için bir kez vurur (yalnız dokunma, mikrofon
 * yok): her vuruşta bir taş yanar ve hecesi söylenir. Tam sayıda durunca övgü ve sayı ("İki!"); fazlada "Bir fazla
 * oldu!" (ceza yok, Mino yeniden heceler); eksikte bekleyince "Biraz daha vur!".
 * Hece bölme: ses-testi'nin Türkçe hecele()'si. Kino (ilk kelime): karpuza beş kere vurur; Mino: "Kar-puz. İki!"
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import { oynat } from '../efekt';
import { etkinlikKaydet } from '../etkinlik';
import type { Sahne } from '../sahne';
import { sayiSozu } from '../sayi';
import { ses } from '../sesler';
import { heceDurumu, heceler, heceSozu, heceTurlari, kelime, kelimeSozu, KINO_HECE } from './model';
import { KA, KK, KM, simge } from './ortak';
import { kelimeEl, kelimeGorsel } from './resim';

/** Vuruş dizisinin sonu sayılan sessizlik */
const TAM_MS = 900;
const EKSIK_MS = 2600;

/** Davul tek yere bağlanır: o anki kelimenin vur'u */
const dinleyici: { vur: (() => void) | null } = { vur: null };

/** Mino heceleyerek söyler; her hecede taşı parlar */
async function heceleSoyle(s: Sahne, hs: string[], taslar: HTMLElement[]) {
  for (let i = 0; i < hs.length; i++) {
    if (s.kapandi()) return;
    const t = taslar[i];
    t.classList.add('ok-k-parla');
    oynat(t, 'ok-zipla');
    ses.pit(i);
    await Promise.all([s.soyle(heceSozu(hs[i])), s.bekle(420)]);
    t.classList.remove('ok-k-parla');
  }
}

async function tur(s: Sahne, id: string, ilk: boolean) {
  const hs = heceler(id);
  const n = hs.length;
  const taslar = hs.map((hc, i) => h('span.ok-k-hece', { style: `--i:${i}`, 'data-hece': hc }, h('img', { src: kelimeGorsel('film/esya/tas'), alt: '', draggable: 'false' }), h('b', {}, hc)));
  const fazla = h('span.ok-k-hece.ok-k-fazla', { 'aria-hidden': 'true' }, h('img', { src: kelimeGorsel('film/esya/tas'), alt: '', draggable: 'false' }));
  const resim = h('div.ok-k-hece-resim', { 'aria-label': kelime(id).ad }, kelimeEl(id));
  s.alan.replaceChildren(h('div.ok-k-hecele', { 'data-n': String(n) }, resim, h('div.ok-k-taslar', {}, ...taslar, fazla)));
  s.el.dataset.hedef = String(n);
  s.el.dataset.vurus = '0';
  const isik = (k: number) => taslar.forEach((t, i) => t.classList.toggle('ok-k-yandi', i < k));

  if (ilk) await s.soyle(KM.hecele.giris);
  await s.soyle(kelimeSozu(id));
  if (id === KINO_HECE && ilk) {
    // Kino beş kere vurur
    await s.kinoHata({
      kino: KK.hecele,
      poz: 'kalk',
      once: async () => {
        s.kinoOynat('dans', 1800);
        for (let i = 0; i < 5; i++) {
          ses.davul();
          oynat(resim, 'ok-irkil');
          oynat(fazla, 'ok-hmm');
          await s.bekle(240);
        }
      },
      mino: KM.hecele.dur,
      sonra: async () => {
        await heceleSoyle(s, hs, taslar);
        await s.soyle(sayiSozu(n));
      },
      kinoSon: KK.hecele_son,
    });
  } else {
    await s.soyle(KM.hecele.dinle);
    await heceleSoyle(s, hs, taslar);
  }
  await s.soyle(KM.hecele.sen);
  s.adim('vur');

  let vurus = 0;
  let zaman = 0;
  let mesgul = false;
  let yanlis = 0;
  await new Promise<void>((coz) => {
    const degerlendir = async () => {
      const d = heceDurumu(n, vurus);
      mesgul = true;
      if (d === 'tam') {
        dinleyici.vur = null;
        taslar.forEach((t, i) => {
          t.style.setProperty('--j', String(i));
          t.classList.add('ok-k-dans');
        });
        await s.ovgu(resim);
        await s.soyle(sayiSozu(n));
        coz();
        return;
      }
      if (d === 'fazla') {
        yanlis++;
        s.nazik(fazla);
        await s.soyle(KM.hecele.fazla);
        vurus = 0;
        s.el.dataset.vurus = '0';
        fazla.classList.remove('ok-k-yandi');
        isik(0);
        // 2 yanlıştan sonra Mino yeniden heceler (ipucu)
        if (yanlis >= 2) await heceleSoyle(s, hs, taslar);
        await s.soyle(KM.hecele.sen);
      } else {
        await s.soyle(KM.hecele.eksik);
      }
      mesgul = false;
    };
    dinleyici.vur = () => {
      if (mesgul || s.kapandi()) return;
      vurus++;
      s.el.dataset.vurus = String(vurus);
      if (vurus <= n) {
        const t = taslar[vurus - 1];
        isik(vurus);
        oynat(t, 'ok-zipla');
        ses.pit(vurus - 1);
        void s.soyle(heceSozu(hs[vurus - 1]));
      } else {
        fazla.classList.add('ok-k-yandi');
        oynat(fazla, 'ok-hmm');
      }
      clearTimeout(zaman);
      const ms = vurus < n ? EKSIK_MS : vurus === n ? TAM_MS : 500;
      zaman = window.setTimeout(() => void degerlendir(), TEST_MODU ? Math.min(ms, 150) : ms);
    };
  });
  clearTimeout(zaman);
  delete s.el.dataset.hedef;
}

etkinlikKaydet({
  id: 'kelime-hecele',
  bolge: 'kelime',
  ad: KA.etkinlikler['kelime-hecele'],
  simge: () => simge(['orman-esya/davul', 'ok-ks-davul'], ['meyveler/karpuz', 'ok-ks-karpuz']),
  async oyna(s) {
    const davul = h('button.ok-davul.ok-k-davul', { type: 'button', 'aria-label': 'Davul' }, h('img', { src: kelimeGorsel('orman-esya/davul'), alt: '', draggable: 'false' }));
    davul.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      ses.davul();
      oynat(davul, 'ok-vur');
      dinleyici.vur?.();
    });
    s.kapaninca(() => (dinleyici.vur = null));
    const turlar = heceTurlari(s.yas, s.rnd);
    s.turlar(turlar.length);
    for (let i = 0; i < turlar.length; i++) {
      if (s.kapandi()) return;
      s.tur(i);
      s.secim.replaceChildren(davul);
      await tur(s, turlar[i], i === 0);
    }
    s.tur(turlar.length);
    s.secim.replaceChildren();
  },
});
