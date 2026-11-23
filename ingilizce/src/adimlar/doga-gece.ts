/**
 * Doğa adası · Day and Night (6. ders): gökyüzü sırayla gündüz ve gece olur ("It's day!" / "It's night!"). Polly o
 * vakitte görülen şeyi sorar ("Where is the moon?"); çocuk seçer, seçtiği göğe çıkar ve orada kalır. Çeldiriciler öbür
 * vaktin şeyleri (gündüz soruda ay ve yıldız). Sonunda "Good night, moon and stars!". Çizim: kelime resimleri (yeni yok).
 */
import { h } from '../../../src/ui/dom';
import { kutla, ucur } from '../kit';
import type { AdaOyunu2 } from './ada-oyunlari-veri2';
import { kelimeKarti, secimBaslat } from './ada-secim';
import { oyunDuzeni, yasam, type AdimBaglami } from './ortak';

export function dogaGeceKur(b: AdimBaglami, o: Extract<AdaOyunu2, { ad: 'gece' }>): () => void {
  const y = yasam();
  const { masa } = oyunDuzeni(b.alan, 'ing-ao ing-ao-gece');
  const gok = h('div.ing-ao-gok', { 'data-vakit': 'day' });
  const yer = h('div.ing-ao-gok-yer', {}, kelimeKarti('tree', 'ing-ao-gok-agac').el);
  const yazi = h('p.ing-ao-yazi', { lang: 'en-US', 'aria-live': 'polite' });
  const kartlar = h('div.ing-secenekler.ing-ao-kartlar');
  gok.append(yer);
  masa.append(gok, yazi, kartlar);

  secimBaslat({
    b, y, kutu: kartlar, turSayisi: o.turlar.length,
    tur: (i) => {
      const t = o.turlar[i];
      return {
        hedef: t.hedef, kelime: t.hedef, soru: [`en/q-${t.hedef}`], kartlar: t.secenekler.map((s) => kelimeKarti(s)),
        hazirla: async () => {
          gok.dataset.vakit = t.vakit;
          // vakit değişince göğe çıkmış şeyler o vakte göre kalır ya da iner
          gok.querySelectorAll<HTMLElement>('.ing-ao-gok-sey').forEach((el) => { el.hidden = el.dataset.vakit !== t.vakit; });
          yazi.textContent = t.vakit === 'day' ? 'It’s day!' : 'It’s night!';
          return (await y.dur(500)) && y.soyle(t.vakit === 'day' ? 'en/g-its-day' : 'en/g-its-night');
        },
      };
    },
    yanlis: (id) => [`en/w-${id}`, 'en/g-not-that'],
    dogru: async (i, d, t) => {
      const sey = kelimeKarti(t.hedef, 'ing-ao-gok-sey').el;
      sey.dataset.vakit = o.turlar[i].vakit;
      sey.dataset.sira = String(i);
      gok.append(sey);
      await ucur(d, sey, { kucul: 0.5 });
      kutla(sey);
      if (!(await y.soyle('en/g-yes', `en/w-${t.hedef}`))) return false;
      return y.dur(300);
    },
    giris: async () => !b.ilkKez('ao-gece') || y.soyle('tr/c-gece-giris'),
    bitis: async () => {
      gok.dataset.vakit = 'night';
      gok.querySelectorAll<HTMLElement>('.ing-ao-gok-sey').forEach((el) => { el.hidden = el.dataset.vakit !== 'night'; });
      yazi.textContent = 'Good night, moon and stars!';
      return y.soyle('en/g-good-night-moon');
    },
  });
  return () => y.kapat();
}
