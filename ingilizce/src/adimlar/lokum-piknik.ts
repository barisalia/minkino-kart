/**
 * Sofra adası · Lokum's Snack Picnic (6. ders): Lokum piknik örtüsünde boş tabağıyla bekler. Polly Lokum'un ne istediğini
 * söyler ("Lokum wants a big apple."), çocuk doğru yiyeceği ve doğru boyu seçer; yiyecek tabağa uçar, Lokum yer
 * ("Yummy!" · "Thank you!"). 2–3 yaş boysuz, iki yiyecek arasından; 4 yaş üç kart (aynı yiyeceğin büyüğü ve küçüğü +
 * başka bir yiyecek); 5+ dört kart. Büyük ve küçük aynı resmin iki boyudur (Şekiller adasının big / small'u).
 * Çizim: piknik fonu ve Lokum'un üç pozu (İngilizce Paket 26), yiyeceklerin kelime resimleri. Gelmeden ders yedek adımı
 * oynar; taslak ve test kipinde yer tutucuyla açılır.
 */
import { h } from '../../../src/ui/dom';
import { kutla, ucur } from '../kit';
import { piknikKimligi, piknikSozu, type AdaOyunu, type PiknikSecenegi } from './ada-oyunlari-veri';
import { cizimYa, kelimeKarti, secimBaslat, type Kart } from './ada-secim';
import { oyunDuzeni, yasam, type AdimBaglami } from './ortak';

const POZLAR = ['lokum-bekler', 'lokum-yiyor', 'lokum-mutlu'] as const;
type Poz = typeof POZLAR[number];

export function lokumPiknikKur(b: AdimBaglami, o: Extract<AdaOyunu, { ad: 'piknik' }>): () => void {
  const y = yasam();
  const { masa } = oyunDuzeni(b.alan, 'ing-ao ing-ao-piknik');
  const ortu = h('div.ing-ao-ortu');
  const fon = cizimYa('oyun/piknik/fon', 'ing-ao-ortu-fon', '');
  ortu.append(fon);
  const lokum = h('div.ing-ao-lokum');
  for (const p of POZLAR) {
    const el = cizimYa(`oyun/piknik/${p}`, 'ing-ao-lokum-poz', 'Lokum');
    el.dataset.poz = p;
    lokum.append(el);
  }
  const tabak = h('div.ing-ao-tabak');
  ortu.append(lokum, tabak);
  const yazi = h('p.ing-ao-yazi', { lang: 'en-US', 'aria-live': 'polite' });
  const kartlar = h('div.ing-secenekler.ing-ao-kartlar');
  masa.append(ortu, yazi, kartlar);
  const poz = (p: Poz) => { lokum.dataset.poz = p; };
  poz('lokum-bekler');

  const kart = (s: PiknikSecenegi): Kart => {
    const k = kelimeKarti(s.yiyecek, 'ing-ao-yiyecek');
    if (s.boy) k.el.dataset.boy = s.boy;
    return { id: piknikKimligi(s), etiket: s.boy ? `${s.boy === 'big' ? 'büyük' : 'küçük'} ${k.etiket}` : k.etiket, el: k.el };
  };
  const yazisi = (s: PiknikSecenegi) => `Lokum wants ${s.boy ? `a ${s.boy}` : /^[ae]/.test(s.yiyecek) ? 'an' : 'a'} ${s.yiyecek}.`;

  secimBaslat({
    b, y, kutu: kartlar, turSayisi: o.turlar.length,
    tur: (i) => {
      const t = o.turlar[i];
      return {
        hedef: piknikKimligi(t.hedef), kelime: t.hedef.yiyecek, soru: [piknikSozu(t.hedef)],
        kartlar: t.secenekler.map(kart),
        hazirla: async () => { poz('lokum-bekler'); tabak.replaceChildren(); yazi.textContent = yazisi(t.hedef); return y.dur(250); },
      };
    },
    // yanlış yiyecekte adını duyar; doğru yiyeceğin öbür boyunda yalnız "Hmm, not that one!"
    yanlis: (id, t) => {
      const yiyecek = id.replace(/^(big|small)-/, '');
      return yiyecek === t.kelime ? ['en/g-not-that'] : [`en/w-${yiyecek}`, 'en/g-not-that'];
    },
    dogru: async (i, d) => {
      const t = o.turlar[i];
      await ucur(d, tabak, { kucul: t.hedef.boy === 'small' ? 0.45 : 0.7 });
      tabak.replaceChildren(kart(t.hedef).el);
      poz('lokum-yiyor');
      if (!(await y.soyle('en/g-yummy'))) return false;
      tabak.replaceChildren();
      poz('lokum-mutlu');
      kutla(lokum);
      if (!(await y.soyle('en/g-thank-you'))) return false;
      return y.dur(400);
    },
    giris: async () => (!b.ilkKez('ao-piknik') || (await y.soyle('tr/c-piknik-giris'))) && y.soyle('en/g-picnic-time'),
  });
  return () => y.kapat();
}
