/**
 * Kelime Köprüsü 1 · Dinle, bul (kelime ve resim eşleme). Derenin gölünde resimli taşlar yüzer. Mino bir kelime
 * söyler ("Kedi!"), çocuk o resmin taşına dokunur: Kino taşın üstüne zıplar, taş suya hafifçe gömülüp su sıçratır.
 * Yanlış taş sallanır, adı söylenir ("Ördek!"), sonra aranan kelime yeniden (ceza yok; 2 yanlıştan sonra doğru taş
 * parlar). Büyük kulak düğmesi kelimeyi tekrar söyletir. 3-4 yaş 3, 5-6 yaş 4 taş.
 * Kino (ilk tur): köpeğin taşına zıplar: "Kedi! İşte burada!" Mino: "O köpek Kino, senin gibi!"
 */
import { h, svg } from '../../../src/ui/dom';
import { IKON } from '../../../src/ui/ikonlar';
import { oynat } from '../efekt';
import { etkinlikKaydet } from '../etkinlik';
import type { Sahne } from '../sahne';
import { dinleTurlari, kelime, kelimeSozu, type DinleTuru } from './model';
import { dokunSec, KA, KK, KM, sicrat, simge } from './ortak';
import { hazir, kelimeEl, kelimeGorsel } from './resim';
import { kses } from './ses';

/** Göldeki resimli taş */
function golTasi(id: string, i: number): HTMLButtonElement {
  return h(
    'button.ok-k-gol-tas',
    { type: 'button', 'data-kelime': id, 'aria-label': kelime(id).ad, style: `--i:${i}` },
    h('img.ok-k-gol-tas-resim', { src: kelimeGorsel('film/esya/tas'), alt: '', draggable: 'false' }),
    h('span.ok-k-madalyon', {}, kelimeEl(id)),
  );
}

/** Kino taşın üstüne zıplar; taş gömülür, su sıçrar */
async function kinoZipla(s: Sahne, tas: HTMLElement) {
  const [x, y] = s.efekt.merkez(tas, 0.5, 0.3);
  await s.kinoGit(x, y, 600);
  kses.boing();
  kses.sicrama();
  oynat(tas, 'ok-k-bas');
  const [sx, sy] = s.efekt.merkez(tas, 0.5, 0.85);
  sicrat(s.efekt, sx, sy);
  s.kinoOynat('sevin', 700);
}

async function tur(s: Sahne, t: DinleTuru, ilk: boolean) {
  const taslar = t.secenekler.map(golTasi);
  s.alan.replaceChildren(
    h('div.ok-k-gol', { 'data-n': String(taslar.length) }, h('img.ok-k-gol-su', { src: kelimeGorsel('orman-esya/golet'), alt: '', draggable: 'false' }), h('div.ok-k-gol-taslar', {}, ...taslar)),
  );
  taslar.forEach((x, i) => {
    x.classList.add('ok-k-gel');
    x.style.setProperty('--i', String(i));
  });
  kses.sicrama();
  // kulak düğmesi: kelimeyi yeniden dinlet
  const kulak = h('button.ok-k-kulak', { type: 'button', 'aria-label': 'Tekrar dinle' }, svg(IKON.hoparlor));
  kulak.addEventListener('click', () => {
    oynat(kulak, 'ok-yapis');
    void s.soyle(kelimeSozu(t.hedef));
  });
  s.secim.replaceChildren(kulak);

  if (ilk) {
    await s.soyle(KM.dinle.giris);
    await s.soyle(kelimeSozu(t.hedef));
    // Kino köpeğin (kendisi gibi) taşına zıplar
    const kopek = taslar.find((k) => k.dataset.kelime === 'kopek');
    if (kopek)
      await s.kinoHata({
        kino: KK.dinle,
        poz: null,
        once: () => kinoZipla(s, kopek),
        mino: KM.dinle.yakala,
        kinoSon: KK.dinle_son,
        sonra: () => s.kinoDon(500),
      });
  }
  const k = await dokunSec(s, taslar, (x) => x.dataset.kelime === t.hedef, {
    adim: 'sec',
    soru: kelimeSozu(t.hedef),
    yanlis: async (x) => {
      kses.sicrama();
      const [sx, sy] = s.efekt.merkez(x, 0.5, 0.85);
      sicrat(s.efekt, sx, sy, '#6cc4ff', 6, 0.6);
      // dokunduğu resmin adı, sonra aranan kelime
      await s.soyle(kelimeSozu(x.dataset.kelime ?? ''));
      await s.soyle(kelimeSozu(t.hedef));
    },
  });
  await kinoZipla(s, k);
  await s.ovgu(k);
  await Promise.all([s.soyle(kelimeSozu(t.hedef)), s.kinoDon(500)]);
  s.secim.replaceChildren();
}

etkinlikKaydet({
  id: 'kelime-dinle',
  bolge: 'kelime',
  ad: KA.etkinlikler['kelime-dinle'],
  ucretsiz: true,
  simge: () => simge(['hayvanlar/kedi', 'ok-ks-tam']),
  async oyna(s) {
    const turlar = dinleTurlari(s.yas, s.rnd, hazir);
    s.turlar(turlar.length);
    for (let i = 0; i < turlar.length; i++) {
      if (s.kapandi()) return;
      s.tur(i);
      await tur(s, turlar[i], i === 0);
    }
    s.tur(turlar.length);
  },
});
