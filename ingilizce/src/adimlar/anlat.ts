/**
 * Anlat (Seviye 2): yeni bir cümle kalıbıyla ilk karşılaşma. Resim anlamı gösterir, Polly cümleyi söyler, sözcükler
 * bantta sırayla yanar, sonra çocuk kendi sesiyle söyler. Ceren kalıbı dersin ilk ifadesinde bir kez açıklar; her cümleyi
 * tek tek çevirmez (anlamı resim taşır).
 *
 * 19 Kasım 2026 (Barış: "tekrara düşmeden, çocuğun algısını oyunda tut"): dört cümle art arda aynı ekranla geliyordu.
 * Artık her cümlenin resmi başka yolla ortaya çıkar ve çocuk onu kendisi açar: 1. cümle hazır gelir (Ceren anlatır),
 * 2. kapkara gölge, 3. parça parça kareler, 4. Polly'ye dokununca. Yavaş söyleyiş yalnız ilk cümlede kendiliğinden
 * gelir, sonra kaplumbağa düğmesinde (tempo düşmesin).
 */
import { h } from '../../../src/ui/dom';
import { cumleBandi, gorselCiz } from '../gorsel';
import { cizim, dugme, harfleriYak, hareket, ipucuKur, kisi, kutla, simgeDugme } from '../kit';
import { mikrofonAc } from '../mikrofon';
import { tik } from '../ses';
import { ovgu, sira as soyleSirasi, soylet, yasam, yuzYuze, type AdimKurucu } from './ortak';

type Acilis = 'hazir' | 'golge' | 'parca' | 'polly';
const ACILIS: readonly Acilis[] = ['hazir', 'golge', 'parca', 'polly'];

export const anlatKur: AdimKurucu<'anlat'> = (b, a) => {
  const y = yasam();
  const f = a.ifade;
  const acilis = ACILIS[a.sira % ACILIS.length];
  const { tahta } = yuzYuze(b.alan, 'ing-tanis ing-anlat');
  let asama: 'bekle' | 'kapali' | 'tanitim' | 'soyle' | 'bitti' = 'bekle';

  // ---- resim kartı: açılış türüne göre
  const resimEl = h('span.ing-kapak-resim', {}, gorselCiz(f.g));
  let kalan: HTMLElement[] = [];
  let kart: HTMLElement;
  if (acilis === 'hazir') {
    kart = h('div.ing-anlat-kart', {}, gorselCiz(f.g));
  } else if (acilis === 'golge') {
    kart = dugme('ing-kapak ing-siluet ing-anlat-gizli', 'Gölgeye dokun, ne olduğunu gör', () => void kartaDokun(), resimEl, h('span.ing-siluet-soru', { 'aria-hidden': 'true' }, '?'));
  } else if (acilis === 'parca') {
    kalan = Array.from({ length: 9 }, (_, i) => { const k = h('span.ing-kareli-kare'); k.style.setProperty('--i', String(i)); return k; });
    kart = dugme('ing-kapak ing-kareli ing-anlat-gizli', 'Karelere dokun, altındakini gör', () => void kartaDokun(), resimEl, h('span.ing-kareli-izgara', { 'aria-hidden': 'true' }, ...kalan));
  } else {
    kart = dugme('ing-kapak ing-kutu ing-anlat-gizli', 'Polly’ye dokun, resmi göstersin', () => void kartaDokun(), h('span.ing-kutu-arka', { 'aria-hidden': 'true' }, '?'), resimEl);
  }
  const polly = kisi('polly', 'ing-polly-tunek');
  if (acilis === 'polly') {
    polly.classList.add('ing-polly-cagir');
    polly.addEventListener('click', () => void ac());
  }

  const bant = cumleBandi(f);
  const yavas = dugme('ing-yavas', 'Yavaş söyle', () => { tik.dokun(); harfleriYak(bant, 1800); void y.soyle(f.yavas ?? f.ses); }, cizim('ui/kaplumbaga'));
  const dinle = simgeDugme('hoparlor', 'Cümleyi yeniden dinle', () => soyle(), 'ing-dinle');
  const altlik = h('div.ing-tanis-alt');
  tahta.append(h('div.ing-kart-yuva', {}, kart, polly), bant, h('div.ing-kumanda', {}, yavas, dinle), altlik);
  yavas.hidden = true; dinle.hidden = true; bant.hidden = true;

  function soyle() { harfleriYak(bant, 1100); void y.soyle(f.ses); }

  function kartaDokun() {
    if (asama === 'soyle') { soyle(); return; }
    // Polly açılışında kart da açar (küçük çocuk Polly'yi bulamazsa takılmasın)
    void ac();
  }

  /** Çocuğun dokunuşu: gölge renklenir, kareler üçer üçer düşer, Polly resmi gösterir */
  async function ac() {
    if (asama !== 'kapali') return;
    if (acilis === 'parca') {
      for (let n = 0; n < 3 && kalan.length; n++) kalan.splice(Math.floor(Math.random() * kalan.length), 1)[0].classList.add('ing-dustu');
      tik.dokun();
      if (kalan.length) { ipucuKur(() => kart, 2500); return; }
    }
    asama = 'tanitim';
    ipucuKur(undefined);
    polly.classList.remove('ing-polly-cagir');
    tik.yapis();
    kart.classList.add('ing-acik');
    if (!(await y.dur(acilis === 'golge' ? 450 : 320))) return;
    kutla(kart);
    await tanit();
  }

  async function tanit() {
    const surer = y.yeniAkis();
    bant.hidden = false;
    harfleriYak(bant, 1100);
    if (!(await y.soyle(f.ses)) || !surer()) return;
    // yavaş söyleyiş yalnız dersin ilk cümlesinde kendiliğinden gelir; sonra kaplumbağa düğmesinde
    if (f.yavas && a.sira === 0) {
      if (!(await y.dur(250))) return;
      harfleriYak(bant, 2000);
      if (!(await y.soyle(f.yavas)) || !surer()) return;
    }
    asama = 'soyle';
    yavas.hidden = !f.yavas; dinle.hidden = false;
    if (!(await y.soyle(soyleSirasi()))) return;
    await soylet(altlik, y, { beklenen: f.en, ornek: f.yavas });
    if (!y.acik) return;
    asama = 'bitti';
    kutla(kart);
    void hareket('polly', 'sevin');
    if (!(await y.soyle(ovgu()))) return;
    b.bitti();
  }

  async function akis() {
    // mikrofon izni dersin başında istenmiş olur; söyleme sırası gelince hazırdır
    void mikrofonAc();
    if (a.aciklama && !(await y.soyle(a.aciklama))) return;
    kart.classList.add('ing-geldi');
    if (acilis === 'hazir') { asama = 'tanitim'; await tanit(); return; }
    asama = 'kapali';
    ipucuKur(() => (acilis === 'polly' ? polly : kart), 2500);
  }

  if (acilis === 'hazir') kart.addEventListener('click', () => { if (asama === 'soyle') soyle(); });
  b.tekrarla(() => { if (asama === 'soyle') soyle(); });
  void akis();
  return () => y.kapat();
};
