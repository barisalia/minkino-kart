/**
 * Fener Avı: Oyunlar bölümünün tek oyunu (18 Kasım 2026, Barış: "oyunları sil, 1 tane adam akıllı oyun yap, elit").
 *
 * Adada gece olmuştur. Sahne kararır; çocuğun parmağı (fareyle imleç) bir fener ışığıdır. Polly sorar ("Where is the
 * cow?"), çocuk ışığı gezdirip arar, bulunca dokunur: nesne ışıl ışıl yanar, zıplar, Polly "Yes! It's a cow." der,
 * resmi alttaki fener kavanozuna uçar. Yanlış nesneye dokununca o nesne kendi adını söyler (yine öğretir), Polly soruyu
 * yineler; ikinci yanlışta aranan nesne parıldar (kolay olsun, kimse takılmasın). Sahnenin soruları bitince ışıklar
 * yanar, bütün sahne canlanır; sıradaki ada. Küçüklerde fener ışığı daha geniştir.
 *
 * Çizim yok: sahne ve nesneler Astra'nın ada çizimleri; gece ve ışık yalnız CSS katmanıdır.
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import type { Kelime } from '../icerik';
import type { Adim } from '../plan';
import { cikartmaResmi, dugme, hareket, ipucuKur, kelimeBandi, kelimeResmi, kutla, salla, ucur, ziplat } from '../kit';
import { tik } from '../ses';
import { sahneResmi } from '../varlik';
import { oyunDuzeni, yasam, type AdimKurucu } from './ortak';
import { yer } from './resim';

export const fenerKur: AdimKurucu<'fener'> = (b, a) => {
  const y = yasam();
  let sahneNo = 0, no = 0, yanlis = 0, kilit = true;
  const soru = () => a.sahneler[sahneNo]?.sorular[no];
  const tekrarSoz = () => { const w = soru(); if (!kilit && w) void y.soyle(`en/q-${w.id}`); };
  const { masa } = oyunDuzeni(b.alan, 'ing-resim-oyunu ing-fener-oyunu', tekrarSoz);
  const sahne = h('div.ing-sahne.ing-fener-sahne');
  const gece = h('div.ing-fener-gece', { 'aria-hidden': 'true' });
  const etiket = h('div.ing-sahne-etiket');
  // fener kavanozu: bulunan her şeyin küçük resmi buraya uçar (bütün oyunun soruları)
  const kavanoz = h('div.ing-fener-kavanoz', { 'aria-hidden': 'true' });
  const yuvalar: HTMLElement[] = [];
  for (const x of a.sahneler) for (const w of x.sorular) {
    const yuva = h('span.ing-fener-yuva', { 'data-kelime': w.id });
    yuvalar.push(yuva);
    kavanoz.append(yuva);
  }
  masa.append(sahne, kavanoz);
  let nesneler = new Map<string, { d: HTMLElement; resimEl: HTMLElement; w: Kelime }>();
  let bulunanSayisi = 0;

  /** Fener ışığı: sahnenin yüzdesi olarak konum; yarıçap sahne genişliğine göre (küçüklerde daha geniş) */
  const genislik = b.yas === '2-3' ? 0.25 : b.yas === '4' ? 0.21 : 0.18;
  const yaricapAyarla = () => sahne.style.setProperty('--fr', `${Math.round(sahne.clientWidth * genislik)}px`);
  const isik = (x: number, yy: number) => {
    sahne.style.setProperty('--fx', `${Math.max(0, Math.min(100, x)).toFixed(1)}%`);
    sahne.style.setProperty('--fy', `${Math.max(0, Math.min(100, yy)).toFixed(1)}%`);
  };
  const isikOlay = (e: PointerEvent) => {
    const r = sahne.getBoundingClientRect();
    if (!r.width) return;
    isik(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
  };
  sahne.addEventListener('pointermove', isikOlay);
  sahne.addEventListener('pointerdown', isikOlay);
  const boyut = new ResizeObserver(yaricapAyarla);
  boyut.observe(sahne);
  y.kapaninca(() => boyut.disconnect());

  /** Işığı bir nesnenin üstüne kaydırır (bulununca ve ipucunda) */
  function isigiGotur(el: HTMLElement) {
    const s = sahne.getBoundingClientRect(), r = el.getBoundingClientRect();
    if (!s.width) return;
    isik(((r.left + r.width / 2 - s.left) / s.width) * 100, ((r.top + r.height / 2 - s.top) / s.height) * 100);
  }

  function etiketGoster(w: Kelime) {
    etiket.replaceChildren(kelimeBandi(w));
    etiket.classList.remove('ing-gorunur'); void etiket.offsetWidth; etiket.classList.add('ing-gorunur');
  }

  function sahneKur() {
    const x = a.sahneler[sahneNo];
    const fon = sahneResmi(x.uniteId);
    sahne.style.backgroundImage = fon ? `url("${fon}")` : '';
    sahne.classList.remove('ing-sabah');
    sahne.replaceChildren(gece, etiket);
    etiket.classList.remove('ing-gorunur');
    nesneler = new Map();
    x.kelimeler.forEach((w, i) => {
      const [sol, alt, gen] = yer(x.uniteId, w, i);
      const resimEl = kelimeResmi(w);
      const d = dugme('ing-nesne', w.tr, () => void dokun(w), resimEl, h('span.ing-nesne-hit'));
      d.dataset.kelime = w.id;
      d.style.cssText = `left:${sol}%;bottom:${alt}%;width:${gen}%;z-index:${100 - Math.round(alt)}`;
      d.style.setProperty('--n', String(i));
      sahne.append(d);
      nesneler.set(w.id, { d, resimEl, w });
    });
    isik(50, 55);
    yaricapAyarla();
  }

  async function dokun(w: Kelime) {
    if (kilit) return;
    const hedef = soru();
    const n = nesneler.get(w.id);
    if (!hedef || !n) return;
    if (w.id !== hedef.id) {
      if (yanlis === 0) b.hata();
      yanlis++;
      kilit = true;
      ipucuKur(undefined);
      // yanlış nesne de bir an yanar ve adını söyler: çocuk aradığını bulamasa da bir şey öğrenir
      n.d.classList.add('ing-fener-yanik');
      salla(n.d);
      etiketGoster(w);
      if (!(await y.soyle(`en/w-${w.id}`, `en/q-${hedef.id}`))) return;
      n.d.classList.remove('ing-fener-yanik');
      etiket.classList.remove('ing-gorunur');
      const aranan = nesneler.get(hedef.id);
      if (yanlis >= 2 && aranan) { aranan.d.classList.add('ing-fener-ipucu'); isigiGotur(aranan.d); }
      kilit = false;
      ipucuKur(() => nesneler.get(hedef.id)?.resimEl, 4500);
      return;
    }
    kilit = true;
    ipucuKur(undefined);
    b.cevap(hedef.id, yanlis === 0);
    n.d.classList.remove('ing-fener-ipucu');
    n.d.classList.add('ing-fener-bulundu');
    isigiGotur(n.d);
    tik.dogru();
    kutla(n.resimEl);
    void ziplat(n.resimEl, w);
    etiketGoster(w);
    if (bulunanSayisi % 2 === 0) void hareket('polly', 'sevin');
    const yuva = yuvalar[bulunanSayisi];
    // Polly "Yes! It's a cow." derken resim kavanoza uçar (tempo düşmesin: ikisi aynı anda)
    const ucus = (async () => {
      if (!yuva || !(await y.dur(650))) return;
      await ucur(n.resimEl, yuva, { kucul: 0.2 });
      if (!y.acik) return;
      yuva.replaceChildren(cikartmaResmi(w, 'ing-mini-cikartma'));
      yuva.classList.add('ing-dolu');
      tik.yapis();
    })();
    const [surdu] = await Promise.all([y.soyle('en/g-yes', `en/c-${hedef.id}`), ucus]);
    if (!surdu || !y.acik) return;
    bulunanSayisi++;
    etiket.classList.remove('ing-gorunur');
    no++;
    if (no < a.sahneler[sahneNo].sorular.length) return void sor();
    await sabah();
  }

  /** Sahnenin soruları bitti: ışıklar yanar, her şey sırayla zıplar; sonra sıradaki ada ya da oyun sonu */
  async function sabah() {
    sahne.classList.add('ing-sabah');
    tik.konfeti(true);
    void hareket('polly', 'sevin');
    const hepsi = [...nesneler.values()];
    hepsi.forEach((n, i) => y.sonra(() => void ziplat(n.resimEl, n.w), 250 + i * 140));
    if (!(await y.soyle('en/g-wow'))) return;
    if (!(await y.dur(600 + hepsi.length * 140))) return;
    sahneNo++;
    if (sahneNo >= a.sahneler.length) { b.bitti(); return; }
    no = 0;
    sahne.classList.add('ing-fener-gecis');
    if (!(await y.dur(450))) return;
    sahneKur();
    sahne.classList.remove('ing-fener-gecis');
    if (!(await y.dur(500))) return;
    void sor();
  }

  async function sor() {
    yanlis = 0; kilit = true;
    const w = soru();
    if (!w) return;
    if (TEST_MODU) sahne.dataset.hedef = w.id;
    if (!(await y.soyle(`en/q-${w.id}`))) return;
    kilit = false;
    // ipucu eli aranan nesneyi gösterir (kolay olsun: kimse karanlıkta kaybolmasın)
    ipucuKur(() => nesneler.get(w.id)?.resimEl, b.yas === '2-3' ? 6000 : 8000);
  }

  b.tekrarla(tekrarSoz);
  void (async () => {
    sahneKur();
    if (b.ilkKez('fener') && !(await y.soyle('tr/c-resim-bul'))) return;
    void sor();
  })();
  return () => { ipucuKur(undefined); y.kapat(); };
};

/** Oyunun sesleri (ders başında önceden yüklenir) */
export function fenerSesleri(a: Extract<Adim, { tip: 'fener' }>): string[] {
  const idler = new Set<string>(['tr/c-resim-bul', 'en/g-yes', 'en/g-wow']);
  for (const x of a.sahneler) {
    for (const w of x.kelimeler) idler.add(`en/w-${w.id}`);
    for (const w of x.sorular) { idler.add(`en/q-${w.id}`); idler.add(`en/c-${w.id}`); }
  }
  return [...idler];
}
