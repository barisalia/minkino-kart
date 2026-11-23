/**
 * Tanış: yeni kelimeyle ilk karşılaşma. Önce merak (kapalı kapak; hayvanda önce sesi), sonra resim çıkar,
 * Polly kelimeyi söyler (normal, ardından yavaş), Ceren Türkçesini söyler, çocuk kendi sesiyle söyler,
 * Polly de onu överken kelimeyi cümle içinde kullanır. Sıra: dinle → gör → anla → söyle.
 * 18 Kasım 2026: dört kelimenin hepsi aynı kutudan çıkıyordu ("aynı kafada"); açılış artık değişir (kutu · gölge ·
 * parça parça · kutu) ve yavaş söyleyiş yalnız ilk kelimede kendiliğinden gelir.
 * 17 Kasım 2026: kelime tanışmada art arda beş kez söyleniyordu ("çok tekrar var"); cümle ayrı bir dinleme olmaktan
 * çıktı, övgüyle birleşti; övgüden sonra kelime bir daha yinelenmiyor.
 */
import { h } from '../../../src/ui/dom';
import { cumle, efektKimligi, type Kelime } from '../icerik';
import { cizim, dugme, harfleriYak, hareket, ipucuKur, kelimeBandi, kelimeResmi, kisi, kutla, simgeDugme, ziplat } from '../kit';
import { mikrofonAc } from '../mikrofon';
import { efektCal, tik } from '../ses';
import { resim } from '../varlik';
import { miniAnimasyon, type MiniOynatici } from '../mini-animasyon';
import { TUR_SAYISI, dersAnahtari, kelimeninAnimasyonu } from '../mini-animasyon-veri';
import { ovgu, sira, soylet, yasam, yuzYuze, type AdimKurucu } from './ortak';

/** Kapak: ünite 'ahir' ise kapılı ahır, değilse sürpriz kutusu (çizimi yoksa arkası dönük kart) */
function kapakKur(w: Kelime, tur: 'ahir' | 'kutu'): { el: HTMLElement; dugme: HTMLButtonElement; resimEl: HTMLElement } {
  const resimEl = kelimeResmi(w, 'ing-kapak-resim');
  const ahirVar = tur === 'ahir' && resim('kapak/ahir-govde') && resim('kapak/ahir-kapi-sol') && resim('kapak/ahir-kapi-sag');
  if (ahirVar) {
    const kapilar = h('span.ing-ahir-kapilar', {}, cizim('kapak/ahir-kapi-sol', 'ing-kapi-sol'), cizim('kapak/ahir-kapi-sag', 'ing-kapi-sag'));
    const b = dugme('ing-kapak ing-ahir', 'Kapıya dokun, aç', () => {}, cizim('kapak/ahir-govde', 'ing-ahir-govde'), resimEl, kapilar);
    return { el: b, dugme: b, resimEl };
  }
  // çizilmiş sürpriz kutusu: gövde ve kapak aynı tuvalde; kapak kalkar, resim kutudan çıkar
  if (resim('kapak/kutu-govde') && resim('kapak/kutu-kapak')) {
    const b = dugme('ing-kapak ing-hediye', 'Kutuya dokun, aç', () => {}, cizim('kapak/kutu-govde', 'ing-hediye-govde'), resimEl, cizim('kapak/kutu-kapak', 'ing-hediye-kapak'));
    return { el: b, dugme: b, resimEl };
  }
  const arka = h('span.ing-kutu-arka', { 'aria-hidden': 'true' }, '?');
  const b = dugme('ing-kapak ing-kutu', 'Karta dokun, aç', () => {}, arka, resimEl);
  return { el: b, dugme: b, resimEl };
}

interface Gizli { el: HTMLElement; dugme: HTMLButtonElement; resimEl: HTMLElement; dokun?: () => boolean }

/** Gölge: resim kapkara bir gölge olarak durur; dokununca renkleri gelir (çocuk önce şekilden tahmin eder) */
function golgeKur(w: Kelime): Gizli {
  const resimEl = kelimeResmi(w, 'ing-kapak-resim');
  const b = dugme('ing-kapak ing-siluet', 'Gölgeye dokun, kim olduğunu gör', () => {}, resimEl, h('span.ing-siluet-soru', { 'aria-hidden': 'true' }, '?'));
  return { el: b, dugme: b, resimEl };
}

/** Parça parça: resim dokuz renkli karenin altında; her dokunuşta üç kare uçar, üçüncü dokunuşta resim çıkar */
function parcaKur(w: Kelime): Gizli {
  const resimEl = kelimeResmi(w, 'ing-kapak-resim');
  const kareler = Array.from({ length: 9 }, (_, i) => { const k = h('span.ing-kareli-kare'); k.style.setProperty('--i', String(i)); return k; });
  const b = dugme('ing-kapak ing-kareli', 'Karelere dokun, altındakini gör', () => {}, resimEl, h('span.ing-kareli-izgara', { 'aria-hidden': 'true' }, ...kareler));
  let kalan = [...kareler];
  const dokun = () => {
    for (let n = 0; n < 3 && kalan.length; n++) {
      const k = kalan.splice(Math.floor(Math.random() * kalan.length), 1)[0];
      k.classList.add('ing-dustu');
    }
    tik.dokun();
    return kalan.length === 0;
  };
  return { el: b, dugme: b, resimEl, dokun };
}

/**
 * Kelimenin ortaya çıkışı derste değişir (18 Kasım 2026, Barış: "aynı kafada gitmişsin, çeşit ekle"):
 * 1. kelime kutudan (ya da ahırdan), 2. gölgeden, 3. parça parça, 4. yine kutudan. Hepsi Astra'nın çizimi; gölge ve
 * kareler yalnız CSS katmanıdır.
 */
const ACILIS = ['kapak', 'golge', 'parca', 'kapak'] as const;

export const tanisKur: AdimKurucu<'tanis'> = (b, a) => {
  const y = yasam();
  const w = a.kelime;
  const { tahta } = yuzYuze(b.alan, 'ing-tanis');
  const acilis = ACILIS[a.sira % ACILIS.length];
  const kapak: Gizli = acilis === 'golge' ? golgeKur(w) : acilis === 'parca' ? parcaKur(w) : kapakKur(w, b.unite?.kapak ?? 'kutu');
  // hareketi olan kelimede düz resmin yerine mini animasyon (22 Kasım 2026); derste aynı animasyon iki kez oynamaz
  const ma = kelimeninAnimasyonu(w.id);
  let mini: MiniOynatici | null = ma ? miniAnimasyon(ma, { bekle: true }) : null;
  if (mini && ma && b.ilkKez(dersAnahtari(ma))) kapak.resimEl.replaceChildren(mini.el);
  else mini = null;
  const bant = kelimeBandi(w);
  const cumleYazisi = h('p.ing-cumle', { lang: 'en-US' }, cumle(w));
  const polly = kisi('polly', 'ing-polly-tunek');
  const yavas = dugme('ing-yavas', 'Yavaş söyle', () => { tik.dokun(); void y.soyle(`en/w-${w.id}-yavas`); }, cizim('ui/kaplumbaga'));
  const dinle = simgeDugme('hoparlor', `${w.en} kelimesini yeniden dinle`, () => { harfleriYak(bant, 600); void y.soyle(`en/w-${w.id}`); }, 'ing-dinle');
  const kumanda = h('div.ing-kumanda', {}, yavas, bant, dinle);
  const altlik = h('div.ing-tanis-alt');
  tahta.append(h('div.ing-kart-yuva', {}, kapak.el, polly), kumanda, cumleYazisi, altlik);
  bant.hidden = true; cumleYazisi.hidden = true; yavas.hidden = true; dinle.hidden = true;
  let asama: 'kapali' | 'tanitim' | 'soyle' | 'bitti' = 'kapali';

  // dersin ilk kelimesinde Ceren kapağı anlatır; sonraki kelimelerde yalnız ses ve ipucu eli (yeniden dinle isterse yine anlatır)
  const anlat = b.ilkKez('kapak');
  async function merak(yeniden = false) {
    const surer = y.yeniAkis();
    // Ceren'in kapak açıklaması yalnız kutu ve ahır içindir; gölge ve kareler kendini anlatır (ipucu eli gösterir)
    if (acilis === 'kapak' && (anlat || yeniden)) await y.soyle(b.unite?.kapak === 'ahir' ? 'tr/c-kapak-ahir' : 'tr/c-kapak-kutu');
    if (!surer() || asama !== 'kapali') return;
    if (w.efekt) { kapak.el.classList.add('ing-titre'); await efektCal(efektKimligi(w)); kapak.el.classList.remove('ing-titre'); }
    if (surer() && asama === 'kapali') ipucuKur(() => kapak.dugme, 3000);
  }

  async function ac() {
    if (asama !== 'kapali') return;
    asama = 'tanitim';
    y.yeniAkis();
    ipucuKur(undefined);
    // mikrofon izni çocuğun bu dokunuşunda istenir; söyleme sırası gelince hazır olur
    void mikrofonAc();
    tik.yapis();
    kapak.el.classList.add('ing-acik');
    kapak.dugme.setAttribute('aria-label', `${w.en}, ${w.tr}`);
    if (!(await y.dur(380))) return;
    if (mini) mini.oynat(TUR_SAYISI); else void ziplat(kapak.resimEl, w);
    bant.hidden = false;
    harfleriYak(bant, 600);
    if (!(await y.soyle(`en/w-${w.id}`))) return;
    // yavaş söyleyiş yalnız dersin ilk kelimesinde kendiliğinden gelir; sonra kaplumbağa düğmesinde (tempo düşmesin)
    if (a.sira === 0 && (!(await y.dur(250)) || !(await y.soyle(`en/w-${w.id}-yavas`)))) return;
    if (!(await y.soyle(`tr/k-${w.id}`))) return;
    await soyleAsamasi();
  }

  async function soyleAsamasi() {
    asama = 'soyle';
    // tanıtım bitti: çocuk artık kelimeyi istediği kadar yeniden (ve yavaş) dinleyebilir
    yavas.hidden = false; dinle.hidden = false;
    // 22 Kasım 2026 (Barış: "devamlı ses soruyorsun, tekrara kaçıyorsun"): çocuk kelimeyi her tanışmada ve dersin sonunda
    // iki kez söylüyordu. Artık tanışmada yalnız dersin ilk kelimesini söyler (söylemeyi öğrenir); öbürlerini dersin
    // sonundaki söyleme adımında, hepsi birlikte.
    const soylesin = a.sira === 0;
    if (soylesin) {
      if (!(await y.soyle(b.ilkKez('sen-soyle') ? 'tr/c-sen-soyle' : sira()))) return;
      await soylet(altlik, y, { beklenen: w.en, rakipler: b.unite?.kelimeler.map((k) => k.en), ornek: `en/w-${w.id}-yavas` });
      if (!y.acik) return;
    }
    asama = 'bitti';
    kutla(kapak.resimEl);
    if (mini) mini.oynat(1); else void ziplat(kapak.resimEl, w);
    void hareket('polly', 'sevin');
    cumleYazisi.hidden = false;
    if (!(await y.soyle(...(soylesin ? [ovgu()] : []), `en/c-${w.id}`))) return;
    b.bitti();
  }

  kapak.dugme.addEventListener('click', () => {
    if (asama === 'kapali') { if (!kapak.dokun || kapak.dokun()) void ac(); else ipucuKur(() => kapak.dugme, 2500); }
    else if (asama === 'soyle') { if (mini) mini.oynat(1); else void ziplat(kapak.resimEl, w); harfleriYak(bant, 600); void y.soyle(`en/w-${w.id}`); }
  });
  b.tekrarla(() => {
    if (asama === 'kapali') void merak(true);
    else if (asama === 'soyle') { harfleriYak(bant, 600); void y.soyle(`en/w-${w.id}`, `tr/k-${w.id}`); }
  });
  void merak();
  return () => { mini?.durdur(); y.kapat(); };
};
