/**
 * Şekiller adası · Big or Small? (6. ders): kartlarda aynı şeklin büyüğü ve küçüğü (aynı resmin iki boyu), büyüklerde
 * bir de başka şekil. Polly "Find the big circle!" der; çocuk doğru boyu ve doğru şekli seçer. Yanlış boyda Polly
 * "Hmm, not that one!" der ve isteğini yineler. Çizim: şekillerin kelime resimleri (yeni yok).
 */
import { h } from '../../../src/ui/dom';
import { kutla, ziplat } from '../kit';
import { boyKimligi, type AdaOyunu2 } from './ada-oyunlari-veri2';
import { kelimeKarti, secimBaslat, type Kart } from './ada-secim';
import { oyunDuzeni, yasam, type AdimBaglami } from './ortak';

export function sekilBoyKur(b: AdimBaglami, o: Extract<AdaOyunu2, { ad: 'boy' }>): () => void {
  const y = yasam();
  const { masa } = oyunDuzeni(b.alan, 'ing-ao ing-ao-boy');
  const kartlar = h('div.ing-secenekler.ing-ao-kartlar.ing-ao-boy-kartlar');
  masa.append(kartlar);
  const kart = (id: string): Kart => {
    const [boy, sekil] = id.split('-') as ['big' | 'small', string];
    const k = kelimeKarti(sekil, 'ing-ao-boy-resim');
    k.el.dataset.boy = boy;
    return { id, etiket: `${boy === 'big' ? 'büyük' : 'küçük'} ${k.etiket}`, el: k.el };
  };

  secimBaslat({
    b, y, kutu: kartlar, turSayisi: o.turlar.length,
    tur: (i) => {
      const t = o.turlar[i];
      return { hedef: boyKimligi(t.boy, t.sekil), kelime: t.sekil, soru: [`en/g-find-${t.boy}-${t.sekil}`], kartlar: t.secenekler.map(kart) };
    },
    yanlis: (id, t) => {
      const sekil = id.split('-')[1];
      return sekil === t.kelime ? ['en/g-not-that'] : [`en/w-${sekil}`, 'en/g-not-that'];
    },
    dogru: async (_i, d, t) => {
      kutla(d);
      void ziplat(d.querySelector<HTMLElement>('.ing-resim'));
      if (!(await y.soyle('en/g-yes', `en/w-${t.kelime}`))) return false;
      return y.dur(350);
    },
    giris: async () => !b.ilkKez('ao-boy') || y.soyle('tr/c-boy-giris'),
    bitis: async () => y.soyle('en/g-well-done'),
  });
  return () => y.kapat();
}

