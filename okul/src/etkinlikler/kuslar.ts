/**
 * Etkinlik 9 · Kuşlar geldi! (yalnız 5-6 yaş; 5'e kadar toplama ve çıkarma). Dalda kuşlar var: "Bir kuş daha geldi!
 * Şimdi kaç kuş var?" ya da "Bir kuş uçtu. Kaç kuş kaldı?" Görsel hep ekranda; çocuk kuşlara dokunarak sayar, sonucu
 * 3 karttan seçer. Kino kuşların arasındaki kelebeği de sayar: "Bir, iki, üç, dört!" Çocuk yalnız kuşları sayar.
 */
import O from '../../../content/okul.json';
import { h } from '../../../src/ui/dom';
import { KELEBEK, kus } from '../cizim';
import { Dallar, kusBoyu } from '../dal';
import { oynat } from '../efekt';
import { etkinlikKaydet } from '../etkinlik';
import type { Sahne } from '../sahne';
import { kusSonucu, kusTurlari, secenekler, type KusTuru } from '../sayi';
import { ses } from '../sesler';

const M = O.mino.kuslar;

async function tur(s: Sahne, t: KusTuru, ilk: boolean, renkBas: number) {
  const dallar = new Dallar();
  const kok = h('div.ok-e9', {}, dallar.el);
  s.alan.replaceChildren(kok);
  await s.bekle(20);
  // dallar kuş sayısına göre: karşılıklı iki dal, tek uzun dal ya da iki kat (kuşlar 64 px'ten küçülmez)
  const enCok = Math.max(t.a, t.tur === 'topla' ? t.a + t.b : t.a);
  dallar.duzenle(enCok + (ilk ? 1 : 0), kok.getBoundingClientRect().width || 360, kusBoyu(kok));
  const tunek = (i: number) => dallar.tunek(i);

  let sayac = 0;
  const kuslar: HTMLElement[] = [];
  const kusYap = (i: number) => {
    const b = h('button.ok-kus.ok-e9-kus', { type: 'button', 'aria-label': 'Kuş', style: `--i:${i}`, html: kus(renkBas + i) });
    b.append(h('b.ok-rozet-sayi'));
    b.addEventListener('click', () => {
      if (b.dataset.sayildi || b.classList.contains('ok-uctu') || s.kapandi()) return;
      b.dataset.sayildi = '1';
      sayac++;
      b.querySelector('b')!.textContent = String(sayac);
      ses.cik(sayac);
      oynat(b, 'ok-zipla');
      void s.say(sayac);
    });
    kuslar.push(b);
    return b;
  };
  for (let i = 0; i < t.a; i++) tunek(i).append(kusYap(i));
  let kelebek: HTMLElement | null = null;
  if (ilk) {
    kelebek = h('button.ok-kelebek', { type: 'button', 'aria-label': 'Kelebek', html: KELEBEK() });
    kelebek.addEventListener('click', () => oynat(kelebek, 'ok-cirp'));
    // kelebek son konuk sayılır (karşılıklı dallarda ikinci dala düşer), kuşların arasına girer
    const t = tunek(enCok);
    t.insertBefore(kelebek, t.children[1] ?? null);
  }
  if (ilk) await s.soyle(M.giris);

  // kuş gelir ya da uçar
  await s.bekle(300);
  if (t.tur === 'topla') {
    await s.soyle(t.b === 1 ? M.gel_1 : M.gel_2);
    for (let i = 0; i < t.b; i++) {
      const b = kusYap(t.a + i);
      b.classList.add('ok-geliyor');
      tunek(t.a + i).append(b);
      ses.kanat();
      await s.bekle(500);
      b.classList.remove('ok-geliyor');
    }
  } else {
    await s.soyle(t.b === 1 ? M.git_1 : M.git_2);
    for (let i = 0; i < t.b; i++) {
      const b = kuslar[kuslar.length - 1 - i];
      b.classList.add('ok-uctu');
      ses.kanat();
      await s.bekle(400);
    }
  }
  const sonuc = kusSonucu(t);
  if (ilk && kelebek) {
    // Kino kelebeği de sayar
    const k = kelebek;
    await s.kinoHata({
      kino: O.kino.say,
      once: async () => {
        const hepsi = [...kok.querySelectorAll<HTMLElement>('.ok-e9-kus:not(.ok-uctu), .ok-kelebek')];
        for (const e of hepsi) {
          oynat(e, 'ok-zipla');
          await s.bekle(260);
        }
      },
      mino: M.kelebek,
      sonra: () => oynat(k, 'ok-cirp'),
    });
  }
  await s.soyle(t.tur === 'topla' ? M.kac : M.kaldi);
  s.adim('say');
  await s.kartSec(secenekler(sonuc, 5, s.rnd), sonuc, {
    yanlis: async () => {
      await s.soyle(O.mino.sayalim);
      const kalan = kuslar.filter((k) => !k.classList.contains('ok-uctu'));
      kalan.forEach((k) => (k.querySelector('b')!.textContent = ''));
      await s.sayarak(kalan.length, (i) => {
        const k = kalan[i - 1];
        oynat(k, 'ok-zipla');
        k.querySelector('b')!.textContent = String(i);
      });
    },
  });
}

etkinlikKaydet({
  id: 'kuslar',
  bolge: 'sayi',
  ad: O.arayuz.etkinlikler.kuslar,
  yasEnAz: 5,
  async oyna(s) {
    const turlar = kusTurlari(s.rnd);
    s.turlar(turlar.length);
    for (let i = 0; i < turlar.length; i++) {
      if (s.kapandi()) return;
      s.tur(i);
      await tur(s, turlar[i], i === 0, i * 2);
    }
    s.tur(turlar.length);
  },
});
