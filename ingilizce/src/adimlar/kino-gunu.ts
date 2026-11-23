/**
 * Günüm adası · Kino's Day (6. ders): ekranın üstünde günün şeridi, dört kare: üçünün üstünde güneş, sonuncusunda ay.
 * "Good morning, Kino!" ile gün başlar. Polly Kino'nun ne yaptığını söyler ("Kino wakes up."), çocuk doğru resmi seçer,
 * resim şeridin sıradaki karesine uçar. Sıra: uyanma → yüz yıkama ya da diş fırçalama → oyun, resim ya da şarkı →
 * akşam kitap. Gün dolunca "Good night, Kino!". 2–3 yaşta ikişer, büyüklerde üçer seçenek.
 * Çizim: Günüm adasının kelime resimleri, güneş ve ay (Paket 17). Yeni çizim yok.
 */
import { h } from '../../../src/ui/dom';
import { kutla, ucur, ziplat } from '../kit';
import { ISLER, type AdaOyunu } from './ada-oyunlari-veri';
import { kelimeKarti, secimBaslat } from './ada-secim';
import { oyunDuzeni, yasam, type AdimBaglami } from './ortak';

export function kinoGunuKur(b: AdimBaglami, o: Extract<AdaOyunu, { ad: 'gun' }>): () => void {
  const y = yasam();
  const { masa } = oyunDuzeni(b.alan, 'ing-ao ing-ao-gun');
  const kareler = o.turlar.map((_, i) => h('div.ing-ao-gun-kare', { 'data-vakit': i === o.turlar.length - 1 ? 'gece' : 'gunduz' },
    kelimeKarti(i === o.turlar.length - 1 ? 'moon' : 'sun', 'ing-ao-vakit').el, h('div.ing-ao-gun-yuva')));
  const serit = h('div.ing-ao-serit', {}, ...kareler);
  const kartlar = h('div.ing-secenekler.ing-ao-kartlar');
  masa.append(serit, kartlar);

  secimBaslat({
    b, y, kutu: kartlar, turSayisi: o.turlar.length,
    tur: (i) => {
      const t = o.turlar[i];
      return {
        hedef: t.is, kelime: t.is, soru: [ISLER[t.is]],
        kartlar: t.secenekler.map((s) => kelimeKarti(s)),
        hazirla: async () => {
          kareler.forEach((k, j) => k.classList.toggle('ing-ao-simdi', j === i));
          if (i === o.turlar.length - 1) serit.dataset.gece = 'true';
          return y.dur(300);
        },
      };
    },
    yanlis: (id) => [`en/w-${id}`, 'en/g-not-that'],
    dogru: async (i, d, t) => {
      const yuva = kareler[i].querySelector<HTMLElement>('.ing-ao-gun-yuva')!;
      await ucur(d, yuva);
      const resim = kelimeKarti(t.hedef, 'ing-ao-gun-resim').el;
      yuva.replaceChildren(resim);
      kareler[i].classList.remove('ing-ao-simdi');
      kareler[i].classList.add('ing-ao-dolu');
      kutla(resim);
      void ziplat(resim);
      if (!(await y.soyle('en/g-yes', `en/w-${t.hedef}`))) return false;
      return y.dur(350);
    },
    giris: async () => (!b.ilkKez('ao-gun') || (await y.soyle('tr/c-gun-giris'))) && y.soyle('en/g-good-morning-kino'),
    bitis: async () => { kutla(serit); return y.soyle('en/g-good-night-kino'); },
  });
  return () => y.kapat();
}
