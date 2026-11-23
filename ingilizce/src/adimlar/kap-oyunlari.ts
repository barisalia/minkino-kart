/**
 * Kâseye / çantaya koyma oyunları (6. ders): Meyve "Fruit Salad" ve Okul "Pack the Bag". Polly ne isterse
 * ("Put the cherry in the bowl!", "Put the book in your bag!") çocuk onu seçer; seçtiği kaba uçar ve orada kalır,
 * kap tur tur dolar. Kâseye sebze, çantaya oyuncak girmez (çeldirici). Çizim: kelime/bowl ve kelime/bag (Paket 17).
 */
import { h } from '../../../src/ui/dom';
import { kutla, ucur } from '../kit';
import { MEYVELER, type AdaOyunu2 } from './ada-oyunlari-veri2';
import { kelimeKarti, secimBaslat } from './ada-secim';
import { oyunDuzeni, yasam, type AdimBaglami } from './ortak';

type KapOyunu = Extract<AdaOyunu2, { ad: 'salata' } | { ad: 'canta' }>;

export function kapOyunuKur(b: AdimBaglami, o: KapOyunu): () => void {
  const y = yasam();
  const salata = o.ad === 'salata';
  const { masa } = oyunDuzeni(b.alan, `ing-ao ing-ao-kapoyun ing-ao-${o.ad}`);
  const ic = h('div.ing-ao-kap-ici');
  const kap = h('div.ing-ao-kap', {}, kelimeKarti(salata ? 'bowl' : 'bag', 'ing-ao-kap-resim').el, ic);
  const kartlar = h('div.ing-secenekler.ing-ao-kartlar');
  masa.append(h('div.ing-ao-sahne', {}, kap), kartlar);

  secimBaslat({
    b, y, kutu: kartlar, turSayisi: o.turlar.length,
    tur: (i) => {
      const t = o.turlar[i];
      return { hedef: t.hedef, kelime: t.hedef, soru: [`en/g-${salata ? 'bowl' : 'bag'}-${t.hedef}`], kartlar: t.secenekler.map((s) => kelimeKarti(s)) };
    },
    // kâseye sebze uzatılırsa Polly meyve salatasına girmediğini söyler
    yanlis: (id) => [`en/w-${id}`, salata && !(MEYVELER as readonly string[]).includes(id) ? 'en/g-not-in-salad' : 'en/g-not-that'],
    dogru: async (_i, d, t) => {
      await ucur(d, ic, { kucul: 0.4 });
      const parca = kelimeKarti(t.hedef, 'ing-ao-kap-parca').el;
      ic.append(parca);
      kutla(kap);
      if (!(await y.soyle('en/g-yes', `en/w-${t.hedef}`))) return false;
      return y.dur(300);
    },
    giris: async () => (!b.ilkKez(`ao-${o.ad}`) || (await y.soyle(`tr/c-${o.ad}-giris`))) && y.soyle(salata ? 'en/g-fruit-salad' : 'en/g-pack-bag'),
    bitis: async () => { kutla(kap); return y.soyle(salata ? 'en/g-yummy-salad' : 'en/g-ready-school'); },
  });
  return () => y.kapat();
}
