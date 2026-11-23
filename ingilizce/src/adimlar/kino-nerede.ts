/**
 * Evim adası · Knock, Knock! Where is Kino? (6. ders): evin odaları karanlık. Kapı vurulur, Polly "Where is Kino?" der ve
 * cevabı söyler ("Kino is in the kitchen."). Çocuk o odaya dokunur: oda aydınlanır, Kino orada görünür.
 * 2–3 yaş üç oda üç tur; 4 yaş dört oda üç tur; 5+ dört oda dört tur ve son turda cümleyi çocuk söyler.
 * Çizim: odaların kelime resimleri (Paket 17) ve "Kino is in the …" cümle resimleri (Paket 20). Yeni çizim yok.
 */
import { h } from '../../../src/ui/dom';
import { kutla } from '../kit';
import { ODALAR, type AdaOyunu, type Oda } from './ada-oyunlari-veri';
import { cizimYa, kelimeKarti, secimBaslat } from './ada-secim';
import { oyunDuzeni, soylet, yasam, type AdimBaglami } from './ortak';

const CUMLE: Record<Oda, string> = { kitchen: 'Kino is in the kitchen', bathroom: 'Kino is in the bathroom', bedroom: 'Kino is in the bedroom', garden: 'Kino is in the garden' };

export function kinoNeredeKur(b: AdimBaglami, o: Extract<AdaOyunu, { ad: 'nerede' }>): () => void {
  const y = yasam();
  const { masa } = oyunDuzeni(b.alan, 'ing-ao ing-ao-nerede');
  const ev = h('div.ing-ao-ev');
  ev.dataset.odalar = String(o.odalar.length);
  const altyazi = h('p.ing-ao-yazi', { lang: 'en-US', 'aria-live': 'polite' });
  masa.append(ev, altyazi);
  const ses = (d: Oda) => `en/i-${ODALAR[d]}`;

  secimBaslat({
    b, y, kutu: ev, turSayisi: o.turlar.length,
    tur: (i) => {
      const hedef = o.turlar[i];
      return {
        hedef, kelime: hedef, soru: ['en/g-knock-knock', ses(hedef)],
        kartlar: o.odalar.map((d) => kelimeKarti(d, 'ing-ao-oda')),
        hazirla: async () => { altyazi.textContent = ''; return y.dur(200); },
      };
    },
    yanlis: (id) => ['en/g-not-there', `en/w-${id}`],
    dogru: async (i, d, t) => {
      const oda = t.hedef as Oda;
      d.classList.add('ing-ao-isik');
      const kino = cizimYa(`eylem/kino-in-${oda}`, 'ing-ao-oda-kino', 'Kino');
      d.append(kino);
      kutla(d);
      altyazi.textContent = CUMLE[oda] + '.';
      if (!(await y.soyle('en/g-yes', ses(oda)))) return false;
      // 5+: son turda cümleyi çocuk söyler (mikrofon yoksa yıldız düğmesi)
      if (b.yas === '5+' && i === o.turlar.length - 1) {
        if (!(await y.soyle('en/g-now-you'))) return false;
        await soylet(masa, y, { beklenen: CUMLE[oda], ornek: ses(oda) });
        if (!y.acik) return false;
      }
      return y.dur(500);
    },
    giris: async () => (!b.ilkKez('ao-nerede') || (await y.soyle('tr/c-nerede-giris'))),
    bitis: async () => y.soyle('en/g-found-kino'),
  });
  return () => y.kapat();
}
