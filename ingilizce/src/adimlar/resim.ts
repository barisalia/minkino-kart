/**
 * Konuşan Resim: ünitenin altı kelimesi tek bir canlı sahnede. Önce keşif (dokunulan her şey zıplar ve adını söyler),
 * hepsi bulununca Polly sorar, çocuk sahnede gösterir. Kelimeyi kart yerine sahnenin içinde yaşatır.
 */
import { h } from '../../../src/ui/dom';
import type { Kelime } from '../icerik';
import { dugme, hareket, ipucuKur, kelimeBandi, kelimeResmi, kutla, salla, ziplat } from '../kit';
import { resim, sahneResmi } from '../varlik';
import { oyunDuzeni, yasam, type AdimKurucu } from './ortak';

/**
 * Sahnedeki yerler: sol ve genişlik sahne genişliğinin, alt sahne yüksekliğinin yüzdesi. Sahne kutusu fonla aynı
 * orandadır (1672 × 941, kırpılmaz); yani değerler doğrudan fon çiziminin üstündeki yerlerdir, her ekranda aynı durur.
 * Nesne kutusu karedir: yüksekliği = genişlik × 1,78. Altı daha aşağıda olan nesne öndedir.
 * Yerleşimi olmayan ünitede (yüzüm, odam, vahşi) konuşan resim oynatılmaz; nedenleri ekip/ingilizce/GECE-ISLERI.md'de.
 */
const YERLER: Record<string, Record<string, [sol: number, alt: number, gen: number]>> = {
  ciftlik: { sheep: [6, 6, 17], cow: [27, 22, 20], duck: [48, 4, 11], cat: [64, 6, 12], dog: [52, 30, 14], horse: [74, 24, 20], chicken: [31, 1, 12], pig: [81, 2, 15] },
  // mutfak: yiyecekler ön plandaki masanın üstünde iki sıra
  yiyecekler: { apple: [13, 19, 13], banana: [38, 16, 17], pear: [70, 19, 12], milk: [27, 33, 11], bread: [45, 33, 15], cheese: [64, 33, 14], egg: [85, 19, 8], water: [81, 33, 9] },
  // atölye zemini: sekiz boya kovası iki sıra
  renkler: { red: [3, 30, 19], blue: [27, 30, 19], yellow: [51, 30, 19], green: [75, 30, 19], orange: [3, 0, 19], pink: [27, 0, 19], purple: [51, 0, 19], black: [75, 0, 19] },
  // mavi halı: rakamlar sayma sırasıyla iki sıra
  sayilar: { one: [6, 26, 15], two: [30, 26, 15], three: [54, 26, 15], four: [78, 26, 15], five: [6, 0, 15], six: [30, 0, 15], seven: [54, 0, 15], eight: [78, 0, 15] },
  oyuncaklar: { 'teddy-bear': [10, 30, 16], drum: [40, 31, 16], kite: [67, 30, 19], ball: [22, 3, 15], doll: [48, 3, 14], robot: [74, 3, 14], balloon: [87, 30, 11], puzzle: [3, 3, 15] },
  // salon: aile fotoğrafı gibi yan yana; büstlerin alt kenarı sahnenin altında kalır (kesik görünmez)
  ailem: { grandpa: [1, -5, 17], grandma: [17, -5, 17], dad: [34, -5, 17], mom: [50, -5, 17], sister: [67, -5, 16], friend: [83, -5, 16], family: [24, 46, 16], teacher: [64, 44, 15] },
  kiyafetler: { hat: [10, 28, 15], 't-shirt': [42, 26, 16], jacket: [72, 26, 16], shoes: [24, 2, 15], socks: [52, 2, 14], pants: [80, 1, 13], dress: [26, 26, 15], scarf: [5, 2, 15] },
  // yol önde, ray ortada, deniz ve gök arkada
  tasitlar: { car: [3, 10, 18], bus: [24, 6, 23], bike: [78, 10, 15], train: [14, 47, 22], boat: [50, 61, 14], plane: [27, 68, 18], truck: [52, 7, 21], rocket: [61, 66, 11] },
  // yatak odası: pencere ve kapı duvarda, eşyalar halıda
  odam: { window: [40, 64, 17], door: [70, 57, 17], bed: [3, 18, 30], table: [50, 24, 22], chair: [34, 2, 15], lamp: [80, 4, 13], clock: [19, 66, 10], box: [61, 2, 14] },
  // orman: kuş ağaçta, balık gölette, kurbağa gölün kıyısında
  vahsi: { bird: [78, 66, 11], elephant: [36, 32, 25], lion: [6, 24, 21], monkey: [72, 26, 17], fish: [44, 7, 12], frog: [64, 3, 12], giraffe: [55, 35, 19], snake: [16, 3, 13] },
  hareketler: { jump: [4, 33, 17], run: [28, 32, 18], clap: [53, 32, 16], dance: [77, 32, 17], sleep: [2, 1, 21], eat: [27, 1, 17], drink: [51, 1, 17], swim: [74, 1, 21] },
};
/** Ünitenin sahnesinde nesnelerin yeri tanımlı mı (tanımlı değilse konuşan resim adımı o ünitede oynatılmaz) */
export const sahneYerlesimiVar = (uniteId: string): boolean => !!YERLER[uniteId] || (!!BOLGELER[uniteId] && !!resim(`sahne/${uniteId}-kino`));

/**
 * Gövde sahnesi (Yüzüm): sahnede tek bir oturan Kino durur; kelimeler onun üstündeki dokunma bölgeleridir
 * (çizimin yüzdesi olarak [sol, üst, genişlik, yükseklik]; iki göz, iki kulak gibi çiftler iki bölgedir).
 * Çocuk "Where is the nose?" denince Kino'nun burnuna dokunur.
 */
const BOLGELER: Record<string, Record<string, [x: number, y: number, w: number, h: number][]>> = {
  yuzum: {
    ears: [[17, 12, 17, 32], [66, 9, 17, 34]],
    eyes: [[38, 22, 12, 11], [52, 22, 12, 11]],
    nose: [[45, 32.5, 11, 6]],
    mouth: [[43.5, 38.5, 14, 8.5]],
    hands: [[4, 39, 19, 18], [77, 39, 19, 18]],
    feet: [[22, 67, 24, 29], [54, 67, 24, 29]],
    head: [[30, 2, 40, 17]],
    legs: [[28, 57, 44, 9]],
  },
};

/** Kelimenin bu ünitenin sahnesinde yeri (ya da dokunma bölgesi) var mı */
export const sahnedeYeriVar = (uniteId: string, kelimeId: string): boolean =>
  BOLGELER[uniteId] ? !!BOLGELER[uniteId][kelimeId] : !YERLER[uniteId] || !!YERLER[uniteId][kelimeId];

/** Nesneleri kartla (yerleşimle) çizilen sahneler: Fener Avı yalnız bunlarda oynanır */
export const nesneliSahne = (uniteId: string): boolean => !!YERLER[uniteId];

/** Yerleşimi tanımlanmamış sahnede altı kelime iki sıraya dizilir (yalnız taslak görünümünde) */
export function yer(uniteId: string | undefined, w: Kelime, i: number): [number, number, number] {
  const ozel = uniteId ? YERLER[uniteId]?.[w.id] : undefined;
  if (ozel) return ozel;
  const sutun = i % 3, sira = Math.floor(i / 3);
  return [8 + sutun * 31, sira ? 8 : 40, 20];
}

export const resimKur: AdimKurucu<'resim'> = (b, a) => {
  const y = yasam();
  let asama: 'kesif' | 'bul' = 'kesif', kilit = true, no = 0, yanlis = 0;
  const bulunan = new Set<string>();
  const tekrarSoz = () => { if (!kilit && asama === 'bul') void y.soyle(`en/q-${a.sorular[no].id}`); };
  const { masa } = oyunDuzeni(b.alan, 'ing-resim-oyunu', tekrarSoz);
  const fon = sahneResmi(b.unite?.id ?? '');
  const sahne = h('div.ing-sahne');
  if (fon) sahne.style.backgroundImage = `url("${fon}")`;
  const etiket = h('div.ing-sahne-etiket');
  const sayac = h('div.ing-soru-sayaci', { 'aria-hidden': 'true' });
  masa.append(sahne, sayac);
  sahne.append(etiket);

  const nesneler = new Map<string, { d: HTMLElement; resimEl: HTMLElement; w: Kelime }>();
  const bolgeler = b.unite ? BOLGELER[b.unite.id] : undefined;
  const govdeResmi = b.unite ? resim(`sahne/${b.unite.id}-kino`) : undefined;
  if (bolgeler && govdeResmi) {
    const govde = h('div.ing-govde', {}, h('img', { src: govdeResmi, alt: 'Kino', draggable: 'false' }));
    sahne.append(govde);
    for (const w of a.kelimeler) {
      const grup = h('span.ing-bolge-grup', { 'data-kelime': w.id });
      const dugmeler = (bolgeler[w.id] ?? []).map(([x, y, gen, yuk]) => {
        const d = dugme('ing-bolge', w.tr, () => void dokun(w));
        d.style.cssText = `left:${x}%;top:${y}%;width:${gen}%;height:${yuk}%`;
        return d;
      });
      grup.append(...dugmeler);
      govde.append(grup);
      if (dugmeler[0]) nesneler.set(w.id, { d: grup, resimEl: dugmeler[0], w });
    }
  } else a.kelimeler.forEach((w, i) => {
    const [sol, alt, gen] = yer(b.unite?.id, w, i);
    const resimEl = kelimeResmi(w);
    // dokunma alanı kutunun ortasıdır: öndeki nesnenin saydam kenarı arkadaki nesneye dokunmayı engellemesin
    const d = dugme('ing-nesne', w.tr, () => void dokun(w), resimEl, h('span.ing-nesne-hit'));
    d.dataset.kelime = w.id;
    d.style.cssText = `left:${sol}%;bottom:${alt}%;width:${gen}%;z-index:${100 - Math.round(alt)}`;
    d.style.setProperty('--n', String(i));
    sahne.append(d);
    nesneler.set(w.id, { d, resimEl, w });
  });

  function sayaciCiz() {
    const toplam = asama === 'kesif' ? a.kelimeler.length : a.sorular.length;
    const dolu = asama === 'kesif' ? bulunan.size : no;
    sayac.replaceChildren(...Array.from({ length: toplam }, (_, i) => h(i < dolu ? 'i.ing-dolu' : 'i')));
  }

  function etiketGoster(w: Kelime) {
    etiket.replaceChildren(kelimeBandi(w));
    etiket.classList.remove('ing-gorunur'); void etiket.offsetWidth; etiket.classList.add('ing-gorunur');
  }

  async function dokun(w: Kelime) {
    if (kilit) return;
    const n = nesneler.get(w.id)!;
    if (asama === 'kesif') {
      void ziplat(n.resimEl, w);
      etiketGoster(w);
      const yeni = !bulunan.has(w.id);
      bulunan.add(w.id);
      n.d.classList.add('ing-bulundu');
      sayaciCiz();
      if (yeni && bulunan.size === a.kelimeler.length) {
        kilit = true;
        ipucuKur(undefined);
        if (!(await y.soyle(`en/w-${w.id}`))) return;
        kutla(sayac);
        return bulAsamasi();
      }
      void y.soyle(`en/w-${w.id}`);
      return;
    }
    const hedef = a.sorular[no];
    if (w.id !== hedef.id) {
      if (yanlis === 0) b.hata();
      yanlis++;
      salla(n.d);
      etiketGoster(w);
      kilit = true;
      if (!(await y.soyle(`en/w-${w.id}`, `en/q-${hedef.id}`))) return;
      if (yanlis >= 2) nesneler.get(hedef.id)?.d.classList.add('ing-parla');
      kilit = false;
      return;
    }
    kilit = true;
    b.cevap(hedef.id, yanlis === 0);
    n.d.classList.remove('ing-parla');
    kutla(n.resimEl);
    void ziplat(n.resimEl, w);
    etiketGoster(w);
    if (no % 2 === 0) void hareket('polly', 'sevin');
    if (!(await y.soyle('en/g-yes', `en/c-${hedef.id}`))) return;
    no++;
    sayaciCiz();
    if (no >= a.sorular.length) { b.bitti(); return; }
    void sor();
  }

  async function bulAsamasi() {
    asama = 'bul';
    etiket.classList.remove('ing-gorunur');
    nesneler.forEach((n) => n.d.classList.remove('ing-bulundu'));
    sayaciCiz();
    if (!(await y.soyle('tr/c-resim-bul'))) return;
    void sor();
  }

  async function sor() {
    yanlis = 0; kilit = true;
    if (!(await y.soyle(`en/q-${a.sorular[no].id}`))) return;
    kilit = false;
  }

  b.tekrarla(() => { if (asama === 'bul') tekrarSoz(); else if (!kilit) void y.soyle('tr/c-resim-giris'); });
  void (async () => {
    sayaciCiz();
    if (!(await y.soyle('tr/c-resim-giris'))) return;
    kilit = false;
    // keşifte ipucu eli henüz dokunulmamış bir nesneyi gösterir
    ipucuKur(() => (asama === 'kesif' ? [...nesneler.values()].find((n) => !bulunan.has(n.w.id))?.resimEl : null), 5000);
  })();
  return () => y.kapat();
};
