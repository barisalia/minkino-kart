import { efekt, konus } from '../../audio/ses';
import { metin } from '../../audio/metin';
import { refCoz } from '../../engine/katalog';
import { bekle, h, karistir, sure, TEST_MODU } from '../../ui/dom';
import { izgaraSigdir } from '../../ui/hareket';
import { kartArkasi, kartEl, refAdi } from '../../ui/kart';
import type { SoruBaglam } from '../oyun';

/** HAFIZA: kapalı kartları çevir, aynı olan çiftleri bul. */
export function hafizaCiz(b: SoruBaglam) {
  const s = b.soru;
  b.alan.classList.add('gostergesiz');
  const kartlar = karistir([...s.kartlar, ...s.kartlar]);
  const izgara = h('div.izgara.hafiza');
  let acik: HTMLElement[] = [];
  let kilit = true;
  let bulunan = 0;
  let iptal = false;
  b.temizlik(() => (iptal = true));

  const elemanlar = kartlar.map((g, i) => {
    const anahtar = refCoz(g).kart ?? refCoz(g).yazi ?? String(i);
    const el = h(
      'button.hafiza-kart',
      { type: 'button', 'data-cift': anahtar, 'aria-label': 'Kapalı kart' },
      h('div.hafiza-dondur', {}, h('div.hafiza-arka', {}, kartArkasi()), h('div.hafiza-on', {}, kartEl(g))),
    );
    el.addEventListener('click', async () => {
      if (kilit || el.classList.contains('acik')) return;
      efekt.cevir();
      el.classList.add('acik');
      acik.push(el);
      if (acik.length < 2) return;
      kilit = true;
      const [a, c] = acik;
      acik = [];
      if (a.dataset.cift === c.dataset.cift) {
        await bekle(sure(350));
        if (iptal) return;
        a.classList.add('eslesti');
        c.classList.add('eslesti');
        efekt.eslesti();
        bulunan++;
        if (bulunan === s.kartlar.length) {
          b.dogru(c, metin('hafiza_bitti'));
          return;
        }
        void konus(`${metin('hafiza_eslesti')} ${refAdi(g)}!`);
        kilit = false;
      } else {
        await bekle(sure(1000));
        if (iptal) return;
        efekt.cevir();
        a.classList.remove('acik');
        c.classList.remove('acik');
        kilit = false;
      }
    });
    izgara.append(el);
    return el;
  });

  b.temizlik(izgaraSigdir(b.secenek, izgara, kartlar.length, { enBuyuk: 200 }));
  b.secenek.append(izgara);

  // Başta kartları kısa bir süre göster, sonra kapat
  void (async () => {
    elemanlar.forEach((e) => e.classList.add('acik'));
    await bekle(TEST_MODU ? 10 : 900 + kartlar.length * 180);
    if (iptal) return;
    efekt.cevir();
    elemanlar.forEach((e) => e.classList.remove('acik'));
    await bekle(sure(450));
    kilit = false;
  })();
}
