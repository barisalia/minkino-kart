/**
 * Söyle ve kazan: dersin son adımı. Çıkartma soluk durur; Polly kelimeyi SÖYLEMEZ, yalnız sorar ("What is it?",
 * "Who is it?" …). Çocuk resme bakıp kelimeyi kendi hatırlar ve söyler (18 Kasım 2026, Barış: "öğretme, kendi
 * söylesin"). Bilemezse ipucu gelir: 1. ıskada Polly kelimeyi söyler ve yazısı görünür, 2. ıskada yavaş söyler,
 * 3. ıskada yıldız kalır. Söyleyince çıkartma renklenir, Polly "Yes! Cow." der, çıkartma albüme uçar.
 */
import { h } from '../../../src/ui/dom';
import { IKON } from '../../../src/ui/ikonlar';
import { cikartmaResmi, harfleriYak, hareket, kelimeBandi, kisi, kutla, ucur } from '../kit';
import { tik } from '../ses';
import type { Kelime } from '../icerik';
import { ovgu, soylet, yasam, yuzYuze, type AdimKurucu } from './ortak';

/** Polly'nin sorusu: kelimenin türüne uygun (hareket resminde Kino bir şey yapar; aile resminde biri vardır) */
function soruSesi(w: Kelime): string {
  if (w.tur === 'kisi') return 'en/g-who-is-it';
  if (w.tur === 'eylem') return 'en/g-what-is-kino-doing';
  if (w.tur === 'renk') return 'en/g-what-color';
  return 'en/g-what-is-it';
}

export const soyleKur: AdimKurucu<'soyle'> = (b, a) => {
  const y = yasam();
  let no = 0, bekliyor = false;
  const { tahta } = yuzYuze(b.alan, 'ing-soyle');
  const album = h('div.ing-album-hedef', { 'aria-hidden': 'true', html: IKON.album });
  const cerceve = h('div.ing-cikartma-cerceve');
  const bantYeri = h('div.ing-bant-yeri');
  const altlik = h('div.ing-tanis-alt');
  const sira = h('div.ing-cikartma-sira', { 'aria-hidden': 'true' });
  tahta.append(album, h('div.ing-kart-yuva', {}, cerceve, kisi('polly', 'ing-polly-tunek')), bantYeri, altlik, sira);

  function siraCiz() {
    sira.replaceChildren(...a.kelimeler.map((w, i) => {
      const el = cikartmaResmi(w, 'ing-mini-cikartma');
      if (i >= no) el.classList.add('ing-gri');
      return el;
    }));
  }

  async function kelime() {
    const w = a.kelimeler[no];
    siraCiz();
    const cikartma = cikartmaResmi(w, 'ing-cikartma ing-soluk');
    // kelimenin yazısı cevaptır: ipucuna ya da doğru söyleyişe kadar gizli
    const bant = kelimeBandi(w);
    bant.hidden = true;
    const bantAc = () => { if (bant.hidden) { bant.hidden = false; harfleriYak(bant, 600); } };
    cerceve.replaceChildren(cikartma);
    bantYeri.replaceChildren(bant);
    if (!(await y.soyle(soruSesi(w)))) return;
    bekliyor = true;
    await soylet(altlik, y, {
      beklenen: w.en,
      rakipler: a.kelimeler.map((k) => k.en),
      ornek: `en/w-${w.id}-yavas`,
      ipucu: ['en/g-listen', `en/w-${w.id}`],
      ipucuOncesi: bantAc,
    });
    if (!y.acik) return;
    bekliyor = false;
    cikartma.classList.remove('ing-soluk');
    cikartma.classList.add('ing-kazanildi');
    kutla(cikartma);
    tik.yapis();
    void hareket('polly', 'sevin');
    bantAc();
    if (!(await y.soyle('en/g-yes', `en/w-${w.id}`))) return;
    await ucur(cikartma, album, { kucul: 0.18 });
    if (!y.acik) return;
    album.classList.remove('ing-zipla'); void album.offsetWidth; album.classList.add('ing-zipla');
    cikartma.remove();
    no++;
    if (no >= a.kelimeler.length) {
      siraCiz();
      if (!(await y.soyle(ovgu()))) return;
      b.bitti();
      return;
    }
    void kelime();
  }

  // yeniden dinle: soru yinelenir (cevap verilmez; ipucu ıskada gelir)
  b.tekrarla(() => { if (bekliyor) void y.soyle(soruSesi(a.kelimeler[no])); });
  void (async () => {
    siraCiz();
    if (b.ilkKez('soyle') && !(await y.soyle('tr/c-soyle-giris'))) return;
    void kelime();
  })();
  return () => y.kapat();
};
