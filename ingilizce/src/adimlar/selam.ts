/**
 * Selam ve veda: her dersin açılış ve kapanış töreni. "Hello!" ve "Goodbye!" her derste yinelenerek öğrenilir.
 * Polly selam verir, Ceren Türkçe açıklar, çocuk el sallama düğmesine dokunarak karşılık verir.
 * Üst seviye derslerinde selamdan sonra günlük bir söz gelir (plan.ts → Rutin): Polly sorar ("How are you?"), ilk
 * karşılaşmalarda Ceren Türkçe açıklar ve Polly cevabı örnek olarak söyler ("I'm fine, thank you!"), çocuk kendi
 * sesiyle cevaplar. Üç söz dersten derse döner; alışınca açıklama ve örnek kalkar, Polly sorar ve çocuk cevaplar.
 */
import { h } from '../../../src/ui/dom';
import { cizim, dugme, hareket, ipucuKur, kisi, kutla } from '../kit';
import { sesAdresi } from '../varlik';
import type { Rutin, RutinAdi } from '../plan';
import { tik } from '../ses';
import { ovgu, soylet, yasam, yuzYuze, type AdimKurucu, type Yasam } from './ortak';

/** Günlük sözler: soru, Polly'nin örnek cevabı, Ceren'in açıklaması. `beklenen`: söz tanıyan cihazda aranacak söz (ad ve yaş çocuğa göre değişir, aranmaz). */
export const RUTIN_SOZLERI: Record<RutinAdi, { soru: string; soruSes: string; cevap: string; cevapSes: string; aciklama: string; beklenen?: string }> = {
  nasilsin: { soru: 'How are you?', soruSes: 'en/g-how-are-you', cevap: "I'm fine, thank you!", cevapSes: 'en/g-im-fine', aciklama: 'tr/c-rutin-nasilsin', beklenen: "I'm fine" },
  adin: { soru: "What's your name?", soruSes: 'en/g-whats-your-name', cevap: 'My name is Polly.', cevapSes: 'en/g-my-name-is-polly', aciklama: 'tr/c-rutin-adin' },
  yasin: { soru: 'How old are you?', soruSes: 'en/g-how-old-are-you', cevap: "I'm three.", cevapSes: 'en/g-im-three', aciklama: 'tr/c-rutin-yasin' },
};
export const rutinSesleri = (r: Rutin): string[] => { const s = RUTIN_SOZLERI[r.ad]; return [s.soruSes, s.cevapSes, s.aciklama]; };

function sahne(alan: HTMLElement, yazi: string) {
  const { tahta } = yuzYuze(alan, 'ing-selam');
  const balon = h('div.ing-soz-balonu', { lang: 'en-US' }, yazi);
  const polly = kisi('polly', 'ing-polly-buyuk');
  const el = dugme('ing-el-salla', 'El salla', () => {}, cizim('ui/el-salla'));
  el.hidden = true;
  const altlik = h('div.ing-selam-alt');
  tahta.append(h('div.ing-selam-sahne', {}, balon, polly), el, altlik);
  return { balon, el, altlik };
}

function balonaYaz(balon: HTMLElement, yazi: string) {
  balon.textContent = yazi;
  balon.classList.toggle('ing-uzun', yazi.length > 14);
  balon.classList.remove('ing-gorunur'); void balon.offsetWidth; balon.classList.add('ing-gorunur');
}

/** Günlük söz: Polly sorar, (ilk karşılaşmalarda Ceren açıklar ve Polly örnek cevap verir), çocuk cevaplar */
async function rutinOyna(r: Rutin, y: Yasam, balon: HTMLElement, altlik: HTMLElement): Promise<boolean> {
  const s = RUTIN_SOZLERI[r.ad];
  balonaYaz(balon, s.soru);
  if (!(await y.soyle(s.soruSes))) return false;
  if (r.aciklamali) {
    if (!(await y.soyle(s.aciklama))) return false;
    balonaYaz(balon, s.cevap);
    if (!(await y.soyle(s.cevapSes))) return false;
  }
  await soylet(altlik, y, { beklenen: s.beklenen, ornek: s.cevapSes });
  if (!y.acik) return false;
  void hareket('polly', 'sevin');
  return y.soyle(ovgu());
}

export const selamKur: AdimKurucu<'selam'> = (b, a) => {
  const y = yasam();
  const { balon, el, altlik } = sahne(b.alan, 'Hello!');
  let sallandi = false;

  async function akis() {
    const surer = y.yeniAkis();
    if (a.ilk) { await y.soyle('tr/c-hosgeldin', 'tr/c-polly-tanit'); if (!surer()) return; }
    balon.classList.add('ing-gorunur');
    void hareket('polly', 'selam', 2);
    await y.soyle('en/g-hello'); if (!surer()) return;
    await y.soyle(a.ilk ? 'tr/c-selam-ver' : 'tr/c-selam-kisa'); if (!surer()) return;
    el.hidden = false;
    ipucuKur(() => el, 3500);
  }

  el.addEventListener('click', async () => {
    if (sallandi) return;
    sallandi = true;
    y.yeniAkis();
    tik.sec();
    ipucuKur(undefined);
    el.classList.add('ing-sallandi');
    void hareket('ceren', 'selam');
    void hareket('polly', 'sevin');
    if (!(await y.soyle('en/g-hello'))) return;
    if (a.rutin) {
      el.hidden = true;
      if (!(await rutinOyna(a.rutin, y, balon, altlik))) return;
    }
    if (a.giris && !(await y.soyle(a.giris))) return;
    b.bitti();
  });

  b.tekrarla(() => { if (!sallandi) void akis(); });
  void akis();
  return () => y.kapat();
};

export const vedaKur: AdimKurucu<'veda'> = (b) => {
  const y = yasam();
  const { balon, el } = sahne(b.alan, 'Goodbye!');
  let sallandi = false;

  async function akis() {
    const surer = y.yeniAkis();
    await y.soyle('tr/c-veda'); if (!surer()) return;
    balon.classList.add('ing-gorunur');
    void hareket('polly', 'selam', 2);
    await y.soyle('en/g-goodbye'); if (!surer()) return;
    el.hidden = false;
    ipucuKur(() => el, 3500);
  }

  el.addEventListener('click', async () => {
    if (sallandi) return;
    sallandi = true;
    y.yeniAkis();
    tik.sec();
    ipucuKur(undefined);
    el.classList.add('ing-sallandi');
    // çocuğun el sallamasına anında karşılık: yıldızlar, Ceren ve Polly el sallar; Polly "See you soon!" der
    // (önceden aynı "Goodbye!" art arda ikinci kez çalıyordu)
    kutla(el);
    void hareket('ceren', 'selam');
    void hareket('polly', 'selam');
    if (!(await y.soyle(sesAdresi('en/g-see-you-soon') ? 'en/g-see-you-soon' : 'en/g-goodbye'))) return;
    b.bitti();
  });

  b.tekrarla(() => { if (!sallandi) void akis(); });
  void akis();
  return () => y.kapat();
};
