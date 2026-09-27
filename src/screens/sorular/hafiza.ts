import { efekt, konus } from '../../audio/ses';
import { metin } from '../../audio/metin';
import { eslestiCumlesi } from '../../audio/cumleler';
import { refCoz } from '../../engine/katalog';
import { bekle, h, karistir, sure, TEST_MODU } from '../../ui/dom';
import { izgaraSigdir } from '../../ui/hareket';
import { cevir, eslesmeyenSallan, eslesmeZipla, hafizaKartiEl } from '../../ui/hafizaKart';
import { refAdi } from '../../ui/kart';
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
    const el = hafizaKartiEl(g, refCoz(g).kart ?? refCoz(g).yazi ?? String(i));
    el.addEventListener('click', async () => {
      if (kilit || el.classList.contains('acik') || acik.includes(el)) return;
      efekt.cevir();
      acik.push(el);
      const donus = cevir(el, true);
      if (acik.length < 2) return;
      kilit = true;
      const [a, c] = acik;
      acik = [];
      await donus;
      if (iptal) return;
      if (a.dataset.cift === c.dataset.cift) {
        await bekle(sure(150));
        if (iptal) return;
        a.classList.add('eslesti');
        c.classList.add('eslesti');
        eslesmeZipla(a);
        eslesmeZipla(c, 70);
        efekt.eslesti();
        bulunan++;
        if (bulunan === s.kartlar.length) {
          b.dogru(c, [metin('hafiza_bitti')]);
          return;
        }
        b.sevin();
        void konus(eslestiCumlesi(refAdi(g)));
        kilit = false;
      } else {
        await bekle(sure(800));
        if (iptal) return;
        await Promise.all([eslesmeyenSallan(a), eslesmeyenSallan(c)]);
        efekt.cevir();
        await Promise.all([cevir(a, false), cevir(c, false, 60)]);
        kilit = false;
      }
    });
    izgara.append(el);
    return el;
  });

  b.temizlik(izgaraSigdir(b.secenek, izgara, kartlar.length, { enBuyuk: 200 }));
  b.secenek.append(izgara);

  // Kartlar dağıtılınca kısa bir süre dalga hâlinde açılır, sonra kapanır
  void (async () => {
    await b.hazir;
    if (iptal) return;
    efekt.cevir();
    await Promise.all(elemanlar.map((e, i) => cevir(e, true, i * 45)));
    await bekle(TEST_MODU ? 10 : 900 + kartlar.length * 180);
    if (iptal) return;
    efekt.cevir();
    await Promise.all(elemanlar.map((e, i) => cevir(e, false, i * 45)));
    if (!iptal) kilit = false;
  })();
}
