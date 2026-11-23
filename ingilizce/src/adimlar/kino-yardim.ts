/**
 * Duygular adası · Help Kino! (6. ders): Kino üzgün, aç, susamış ya da uykulu gelir. Polly "Oh no! Kino is hungry!" der;
 * çocuk masadaki şeylerden Kino'ya iyi geleni seçer (elma, su, yatak, oyuncak ayı). Seçtiği şey Kino'ya uçar,
 * Kino mutlu olur ("Here you are, Kino!" · "Kino is happy." · "Thank you!").
 * 2–3 yaş iki dert, iki seçenek; 4 yaş üç dert; 5+ dört dert, üçer seçenek.
 * Çizim: Kino'nun duygu resimleri (Paket 17) ve önceki adaların kelime resimleri. Yeni çizim yok.
 */
import { h } from '../../../src/ui/dom';
import { hareket, kutla, ucur, ziplat } from '../kit';
import { DERTLER, type AdaOyunu } from './ada-oyunlari-veri';
import { kelimeKarti, secimBaslat } from './ada-secim';
import { oyunDuzeni, yasam, type AdimBaglami } from './ortak';

export function kinoYardimKur(b: AdimBaglami, o: Extract<AdaOyunu, { ad: 'yardim' }>): () => void {
  const y = yasam();
  const { masa } = oyunDuzeni(b.alan, 'ing-ao ing-ao-yardim');
  const kino = h('div.ing-ao-kino');
  const yazi = h('p.ing-ao-yazi', { lang: 'en-US', 'aria-live': 'polite' });
  const kartlar = h('div.ing-secenekler.ing-ao-kartlar');
  masa.append(h('div.ing-ao-sahne', {}, kino, yazi), kartlar);
  const goster = (id: string) => { kino.replaceChildren(kelimeKarti(id, 'ing-ao-kino-resim').el); kino.dataset.his = id; };

  secimBaslat({
    b, y, kutu: kartlar, turSayisi: o.turlar.length,
    tur: (i) => {
      const t = o.turlar[i];
      const hedef: string = DERTLER[t.dert];
      return {
        hedef, kelime: t.dert, soru: [`en/g-oh-no-${t.dert}`],
        kartlar: t.secenekler.map((s) => kelimeKarti(s)),
        hazirla: async () => { goster(t.dert); yazi.textContent = `Kino is ${t.dert}.`; return y.dur(250); },
      };
    },
    yanlis: (id) => [`en/w-${id}`, 'en/g-not-that'],
    dogru: async (_i, d) => {
      await ucur(d, kino, { kucul: 0.45 });
      if (!(await y.soyle('en/g-here-you-are'))) return false;
      goster('happy');
      yazi.textContent = 'Kino is happy.';
      kutla(kino);
      void ziplat(kino.firstElementChild as HTMLElement);
      void hareket('polly', 'sevin');
      if (!(await y.soyle('en/i-duygular-a1', 'en/g-thank-you'))) return false;
      return y.dur(450);
    },
    giris: async () => (!b.ilkKez('ao-yardim') || (await y.soyle('tr/c-yardim-giris'))) && y.soyle('en/g-help-kino'),
  });
  return () => y.kapat();
}
