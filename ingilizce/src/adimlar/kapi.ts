/**
 * Kapıda Kim Var? (Ailem ünitesine özel): kapı çalar, Polly "Who is it?" der ve geleni söyler ("Mom."). Çocuk
 * kartlardan doğru kişiye dokununca kapı açılır, o kişi kapıda belirir ("This is my mom."). Yanlış karta dokununca
 * o kişinin adını duyar; kapı kapalı kalır. Dinleyip bulmanın ödülü kapının açılmasıdır.
 */
import { h } from '../../../src/ui/dom';
import type { Kelime } from '../icerik';
import { cizim, dugme, hareket, ipucuKur, kelimeResmi, kutla, salla, ziplat } from '../kit';
import type { Soru } from '../plan';
import { tik } from '../ses';
import { sahneResmi } from '../varlik';
import { balonYaz, oyunDuzeni, soruBalonu, yasam, type AdimKurucu } from './ortak';

export const kapiKur: AdimKurucu<'kapi'> = (b, a) => {
  const y = yasam();
  let no = 0, kilit = true, yanlis = 0, soru: Soru = a.sorular[0];
  const sorSoz = () => { if (!kilit) void y.soyle('en/g-who-is-it', `en/w-${soru.hedef.id}`); };
  const { masa } = oyunDuzeni(b.alan, 'ing-kapi', sorSoz);
  // kapıya özel giriş fonu (sahne/kapi.webp) gelince o kullanılır; o zamana kadar salon
  const fon = sahneResmi('kapi') ?? sahneResmi('ailem');
  const ozelFon = !!sahneResmi('kapi');
  const sahne = h('div.ing-kapi-sahne');
  if (fon) sahne.style.backgroundImage = `url("${fon}")`;
  sahne.classList.toggle('ing-ozel-fon', ozelFon);
  const gelen = h('div.ing-kapi-gelen');
  const kapi = h('div.ing-kapi-kanat', {}, cizim('kelime/door'));
  sahne.append(gelen, kapi);
  const kartlar = h('div.ing-secenekler');
  masa.append(sahne, kartlar);
  const balon = soruBalonu(masa);

  /** Tak tak: kapı iki kez vurulur */
  async function cal(): Promise<boolean> {
    for (let i = 0; i < 2; i++) {
      tik.yapis();
      kapi.classList.remove('ing-vuruldu'); void kapi.offsetWidth; kapi.classList.add('ing-vuruldu');
      if (!(await y.dur(330))) return false;
    }
    return true;
  }

  async function soruGoster() {
    soru = a.sorular[no];
    yanlis = 0; kilit = true;
    sahne.classList.remove('ing-acik');
    gelen.replaceChildren();
    balonYaz(balon, 'Who is it?');
    kartlar.dataset.adet = String(soru.secenekler.length);
    kartlar.replaceChildren(...soru.secenekler.map((w, i) => {
      const d = dugme('ing-secim', w.tr, () => void sec(w, d), kelimeResmi(w));
      d.dataset.kelime = w.id;
      d.style.setProperty('--n', String(i));
      return d;
    }));
    if (!(await y.dur(350)) || !(await cal())) return;
    if (!(await y.soyle('en/g-who-is-it', `en/w-${soru.hedef.id}`))) return;
    kilit = false;
    ipucuKur(() => (yanlis >= 2 ? kartlar.querySelector(`[data-kelime="${soru.hedef.id}"]`) : null), 5000);
  }

  async function sec(w: Kelime, d: HTMLButtonElement) {
    if (kilit) return;
    const hedef = soru.hedef;
    kilit = true;
    if (w.id !== hedef.id) {
      if (yanlis === 0) b.hata();
      yanlis++;
      salla(d);
      if (!(await y.soyle(`en/w-${w.id}`)) || !(await cal())) return;
      if (!(await y.soyle(`en/w-${hedef.id}`))) return;
      if (yanlis >= 2) kartlar.querySelector(`[data-kelime="${hedef.id}"]`)?.classList.add('ing-parla');
      kilit = false;
      return;
    }
    ipucuKur(undefined);
    b.cevap(hedef.id, yanlis === 0);
    d.classList.add('ing-dogru');
    kartlar.classList.add('ing-bitti');
    // kapı açılır, gelen kişi kapıda belirir
    const kisiResmi = kelimeResmi(hedef);
    gelen.replaceChildren(kisiResmi);
    tik.ucus();
    sahne.classList.add('ing-acik');
    if (!(await y.dur(450))) return;
    kutla(kisiResmi);
    void ziplat(kisiResmi, hedef);
    if (no % 2 === 0) void hareket('polly', 'sevin');
    if (!(await y.soyle('en/g-yes', `en/c-${hedef.id}`))) return;
    if (!(await y.dur(450))) return;
    kartlar.classList.remove('ing-bitti');
    no++;
    if (no >= a.sorular.length) b.bitti();
    else void soruGoster();
  }

  b.tekrarla(sorSoz);
  void (async () => {
    if (b.ilkKez('kapi') && !(await y.soyle('tr/c-kapi-giris'))) return;
    void soruGoster();
  })();
  return () => y.kapat();
};
