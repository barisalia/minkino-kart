/**
 * Odd One Out (Oyunlar, 2–3 yaştan; 21 Kasım 2026): dört kart (küçüklerde üç), biri ötekilerin kategorisinde değil.
 * Polly "Which one is not an animal?" diye sorar; çocuk farklı olanı seçer, kart zıplar, Polly açıklar: "The apple is not
 * an animal. It's a fruit!" Yanlışta o kartın adı ve "Hmm, not that one!", soru yinelenir. Oturumda dört tur, her biri
 * başka kategori (animals, food, toys, clothes, vehicles, family, colors). Veri: bilmece-veri.ts. Yeni çizim yok.
 */
import { h } from '../../../src/ui/dom';
import { kutla, ziplat } from '../kit';
import { aciklamaSesi, soruSesi, KATEGORILER, type FarkliOyunTuru } from './bilmece-veri';
import { kelimeKarti, resimleriOnYukle, secimBaslat } from './ada-secim';
import { oyunDuzeni, yasam, type AdimBaglami } from './ortak';

export function farkliOlanKur(b: AdimBaglami, o: { turlar: FarkliOyunTuru[] }): () => void {
  const y = yasam();
  const { masa } = oyunDuzeni(b.alan, 'ing-ao ing-ao-farkli');
  // giriş konuşması sırasında ekran boş kalmasın: başlık büyük yazılır
  const yazi = h('p.ing-ao-yazi.ing-ao-fo-baslik', { lang: 'en-US', 'aria-live': 'polite' }, 'Find the odd one out!');
  const kartlar = h('div.ing-secenekler.ing-ao-kartlar.ing-ao-fo-kartlar');
  masa.append(yazi, kartlar);
  resimleriOnYukle(o.turlar.flatMap((t) => t.kartlar));

  secimBaslat({
    b, y, kutu: kartlar, turSayisi: o.turlar.length,
    tur: (i) => {
      const t = o.turlar[i];
      return {
        hedef: t.tur.farkli, kelime: t.tur.farkli, soru: [soruSesi(t.tur.kategori)], kartlar: t.kartlar.map((w) => kelimeKarti(w)),
        hazirla: async () => { yazi.classList.remove('ing-ao-fo-baslik'); yazi.textContent = KATEGORILER[t.tur.kategori].soru; return y.dur(250); },
      };
    },
    yanlis: (id) => [`en/w-${id}`, 'en/g-not-that'],
    dogru: async (i, d) => {
      const t = o.turlar[i];
      kutla(d);
      void ziplat(d.querySelector<HTMLElement>('.ing-resim'));
      // öbür kartlar bir aile gibi yan yana durur, farklı olan öne çıkar
      d.parentElement?.querySelectorAll('.ing-ao-kart').forEach((k) => { if (k !== d) k.classList.add('ing-ao-fo-es'); });
      yazi.textContent = t.tur.aciklama;
      if (!(await y.soyle(aciklamaSesi(t.tur)))) return false;
      return y.dur(600);
    },
    giris: async () => (!b.ilkKez('ao-farkli') || (await y.soyle('tr/c-farkli-giris'))) && y.soyle('en/g-odd-one-out'),
    bitis: async () => y.soyle('en/g-well-done'),
  });
  return () => y.kapat();
}
