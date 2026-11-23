/**
 * Park adası · Let's Play! (6. ders): altta parkın oyun yerleri (kaydırak, salıncak, tahterevalli, kum). Polly Kino'yu
 * birine çağırır ("Let's go on the slide!"); çocuk o yere dokununca üstteki pencerede Kino orada oynar ("Kino is on the
 * slide."). Çizim: kelime resimleri ve Seviye 2'nin "Kino is on the …" cümle resimleri (Paket 20). Yeni çizim yok.
 */
import { h } from '../../../src/ui/dom';
import { hareket, kutla } from '../kit';
import { PARK, type AdaOyunu2, type ParkYeri } from './ada-oyunlari-veri2';
import { cizimYa, kelimeKarti, secimBaslat } from './ada-secim';
import { oyunDuzeni, yasam, type AdimBaglami } from './ortak';

const CUMLE: Record<ParkYeri, string> = { slide: 'Kino is on the slide.', swing: 'Kino is on the swing.', seesaw: 'Kino is on the seesaw.', sand: 'Kino is in the sand.' };

export function parkOyunKur(b: AdimBaglami, o: Extract<AdaOyunu2, { ad: 'oyun' }>): () => void {
  const y = yasam();
  const { masa } = oyunDuzeni(b.alan, 'ing-ao ing-ao-park');
  const pencere = h('div.ing-ao-park-resim');
  const yazi = h('p.ing-ao-yazi', { lang: 'en-US', 'aria-live': 'polite' });
  const kartlar = h('div.ing-secenekler.ing-ao-kartlar');
  masa.append(h('div.ing-ao-sahne', {}, pencere), yazi, kartlar);

  secimBaslat({
    b, y, kutu: kartlar, turSayisi: o.turlar.length,
    tur: (i) => {
      const yerId = o.turlar[i];
      return {
        hedef: yerId, kelime: yerId, soru: [`en/g-go-${yerId}`], kartlar: o.yerler.map((x) => kelimeKarti(x)),
        hazirla: async () => { pencere.replaceChildren(); yazi.textContent = ''; return y.dur(200); },
      };
    },
    yanlis: (id) => [`en/w-${id}`, 'en/g-not-that'],
    dogru: async (_i, _d, t) => {
      const yerId = t.hedef as ParkYeri;
      const resim = cizimYa(`eylem/kino-${yerId === 'sand' ? 'in' : 'on'}-${yerId}`, 'ing-ao-park-kino', `Kino · ${yerId}`);
      pencere.replaceChildren(resim);
      kutla(pencere);
      void hareket('polly', 'sevin');
      yazi.textContent = CUMLE[yerId];
      if (!(await y.soyle('en/g-yes', `en/i-${PARK[yerId]}`))) return false;
      return y.dur(500);
    },
    giris: async () => !b.ilkKez('ao-oyun') || y.soyle('tr/c-oyun-giris'),
    bitis: async () => y.soyle('en/g-well-done'),
  });
  return () => y.kapat();
}
