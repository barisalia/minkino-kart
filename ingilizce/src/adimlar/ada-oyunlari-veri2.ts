/**
 * 13–24. adaların oyunları, ikinci dalga (21 Kasım 2026) · DOM'suz veri. İlk dalga ve ortak tipler: ada-oyunlari-veri.ts.
 * Meyve "Fruit Salad" · Doğa "Day and Night" · Okul "Pack the Bag" · Şekiller "Big or Small?" · Park "Let's Play!" ·
 * Vücudum "Touch Your Knees!" · Sayılar 2 "Count to Ten". Her biri adanın 6. dersinde Dürbün'ün yerine; çizimi ya da sesi
 * eksikse ders Dürbün'ü oynar. Yeni çizim yalnız Vücudum'da (İngilizce Paket 27-K: Kino'nun tam boy önden çizimi).
 */
import type { SesMetni } from '../icerik';
import type { Yas } from '../plan';
import { bilmeceOturumSesleri, farkliOturumSesleri, type BilmeceTuru, type FarkliOyunTuru } from './bilmece-veri';

type Rnd = () => number;
const karistir = <T>(l: readonly T[], rnd: Rnd): T[] => { const a = [...l]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export const MEYVELER = ['grapes', 'watermelon', 'cherry', 'lemon', 'apple', 'banana', 'pear'] as const;
const SEBZELER = ['carrot', 'tomato', 'potato', 'corn'] as const;
export const OKUL_ESYASI = ['book', 'pencil', 'crayon', 'paper', 'scissors'] as const;
const OYUNCAKLAR = ['ball', 'teddy-bear', 'kite', 'drum'] as const;
export const SEKILLER = ['circle', 'square', 'triangle', 'heart'] as const;
export const PARK = { slide: 'park-a1', swing: 'park-a2', seesaw: 'park-a3', sand: 'park-a4' } as const;
export type ParkYeri = keyof typeof PARK;
/** Vücudum: Kino'nun tam boy çiziminde (Paket 27-K, 800 × 1200) dokunma bölgeleri, tuvalin yüzdesi: sol, üst, sağ, alt */
export const BEDEN: Record<string, readonly [number, number, number, number][]> = {
  hair: [[33, 2, 67, 12]],
  shoulders: [[20, 37, 38, 45], [62, 37, 80, 45]],
  arms: [[6, 40, 22, 60], [78, 40, 94, 60]],
  fingers: [[2, 60, 18, 70], [82, 60, 98, 70]],
  tummy: [[38, 50, 62, 64]],
  knees: [[30, 74, 48, 82], [52, 74, 70, 82]],
  toes: [[24, 92, 48, 99], [52, 92, 76, 99]],
  teeth: [[42, 24, 58, 31]],
};
export type Bolge = keyof typeof BEDEN & string;

export type AdaOyunu2 =
  | { ad: 'salata'; turlar: { hedef: string; secenekler: string[] }[] }
  | { ad: 'gece'; turlar: { vakit: 'day' | 'night'; hedef: string; secenekler: string[] }[] }
  | { ad: 'canta'; turlar: { hedef: string; secenekler: string[] }[] }
  | { ad: 'boy'; turlar: { sekil: string; boy: 'big' | 'small'; secenekler: string[] }[] }
  | { ad: 'oyun'; turlar: ParkYeri[]; yerler: ParkYeri[] }
  | { ad: 'dokun'; turlar: Bolge[] }
  | { ad: 'say10'; son: number }
  /** Renkli Kino (Oyunlar; yol haritası #5): renkler + kıyafetler. Polly "Put on the red hat!" der. */
  | { ad: 'renkli'; renkler: Renk[]; giysiler: Giysi[]; turlar: { giysi: Giysi; renk: Renk }[] }
  /** Polly's Riddles ve Odd One Out (Oyunlar; bilmece-veri.ts) */
  | { ad: 'bilmece'; turlar: BilmeceTuru[] }
  | { ad: 'farkli'; turlar: FarkliOyunTuru[] };
export type AdaOyunAdi2 = AdaOyunu2['ad'];

// ---------------------------------------------------------------- Renkli Kino
export const RENKLER = ['red', 'blue', 'yellow', 'green'] as const;
export type Renk = typeof RENKLER[number];
/** Katman sırası alttan üste (Kino'yu Giydir ile aynı) */
export const RENKLI_GIYSILER = ['socks', 't-shirt', 'jacket', 'hat'] as const;
export type Giysi = typeof RENKLI_GIYSILER[number];
export const renkliKimlik = (renk: string, giysi: string) => `${renk}-${giysi}`;
const GIYSI_ADI: Record<Giysi, string> = { socks: 'socks', 't-shirt': 'T-shirt', jacket: 'jacket', hat: 'hat' };

/** 2–3 yaş iki renk, iki giysi (şapka, çorap); 4 yaş dört giysi, üç renk; 5+ dört giysi, dört renk. Sonuç cümlesi şapka ile çorabı söyler. */
export function renkliPlani(yas: Yas, rnd: Rnd = Math.random): Extract<AdaOyunu2, { ad: 'renkli' }> {
  const renkler = karistir(RENKLER, rnd).slice(0, yas === '2-3' ? 2 : yas === '4' ? 3 : 4);
  const giysiler: Giysi[] = yas === '2-3' ? ['socks', 'hat'] : [...RENKLI_GIYSILER];
  const turlar = karistir(giysiler, rnd).map((giysi) => ({ giysi, renk: renkler[Math.floor(rnd() * renkler.length)] }));
  return { ad: 'renkli', renkler, giysiler, turlar };
}
export const renkliSonuc = (o: Extract<AdaOyunu2, { ad: 'renkli' }>) => {
  const renk = (g: Giysi) => o.turlar.find((t) => t.giysi === g)!.renk;
  return { id: `en/g-rk-${renk('hat')}-hat-${renk('socks')}-socks`, metin: `A ${renk('hat')} hat and ${renk('socks')} socks!` };
};

export const ADA_OYUNU2: Record<string, AdaOyunAdi2> = { meyve: 'salata', doga: 'gece', okul: 'canta', sekiller: 'boy', park: 'oyun', vucudum: 'dokun', sayilar2: 'say10' };
/** Şekiller kartının kimliği: "big-circle" */
export const boyKimligi = (boy: string, sekil: string) => `${boy}-${sekil}`;

export function adaOyunuPlani2(uniteId: string, yas: Yas, rnd: Rnd): AdaOyunu2 | null {
  const kucuk = yas === '2-3', buyuk = yas === '5+';
  const tur = kucuk ? 3 : 4, secenek = kucuk ? 2 : 3;
  const sec = (hedefler: readonly string[], celdirici: readonly string[]) => karistir(hedefler, rnd).slice(0, tur).map((hedef) => ({
    hedef, secenekler: karistir([hedef, ...karistir([...celdirici, ...hedefler].filter((x) => x !== hedef), rnd).slice(0, secenek - 1)], rnd),
  }));
  switch (ADA_OYUNU2[uniteId]) {
    // kâseye yalnız meyve girer; çeldiricide bir sebze de olur
    case 'salata': return { ad: 'salata', turlar: sec(MEYVELER, SEBZELER) };
    case 'canta': return { ad: 'canta', turlar: sec(OKUL_ESYASI, OYUNCAKLAR) };
    case 'gece': {
      const gunduz = karistir(['sun', 'flower'], rnd), gece = karistir(['moon', 'star'], rnd);
      const turlar = [0, 1, 2, 3].slice(0, tur).map((i) => {
        const vakit = i % 2 === 0 ? 'day' as const : 'night' as const;
        const hedef = (vakit === 'day' ? gunduz : gece)[Math.floor(i / 2)];
        // çeldirici öbür vaktin şeyleri: gündüz soruda ay ve yıldız, gece soruda güneş ve çiçek
        const ters = vakit === 'day' ? gece : gunduz;
        return { vakit, hedef, secenekler: karistir([hedef, ...ters.slice(0, secenek - 1)], rnd) };
      });
      return { ad: 'gece', turlar };
    }
    case 'boy': {
      const sekiller = karistir(SEKILLER, rnd).slice(0, tur);
      return {
        ad: 'boy', turlar: sekiller.map((sekil, i) => {
          const boy = (i + Math.floor(rnd() * 2)) % 2 ? 'big' as const : 'small' as const;
          const diger = SEKILLER.filter((x) => x !== sekil)[i % 3];
          const s = [boyKimligi('big', sekil), boyKimligi('small', sekil)];
          if (!kucuk) s.push(boyKimligi(boy, diger));
          return { sekil, boy, secenekler: karistir(s, rnd) };
        }),
      };
    }
    case 'oyun': {
      const yerler = karistir(Object.keys(PARK) as ParkYeri[], rnd).slice(0, kucuk ? 3 : 4);
      return { ad: 'oyun', yerler, turlar: karistir(yerler, rnd).slice(0, tur) };
    }
    case 'dokun': {
      const bolgeler = Object.keys(BEDEN) as Bolge[];
      return { ad: 'dokun', turlar: karistir(bolgeler.filter((b) => b !== 'teeth' || buyuk), rnd).slice(0, kucuk ? 4 : buyuk ? 7 : 6) };
    }
    case 'say10': return { ad: 'say10', son: kucuk ? 5 : buyuk ? 12 : 10 };
    case 'renkli': return renkliPlani(yas, rnd);
    default: return null;
  }
}

export const adaOyunuSoruSayisi2 = (o: AdaOyunu2): number => (o.ad === 'say10' ? o.son : o.turlar.length);

export const SAYI_ADI = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'] as const;
const BALON_RENKLERI = ['kirmizi', 'mavi', 'sari', 'yesil', 'turuncu', 'pembe'] as const;
export const balonRengi = (n: number) => BALON_RENKLERI[(n - 1) % BALON_RENKLERI.length];

export function adaOyunuCizimleri2(o: AdaOyunu2): string[] {
  switch (o.ad) {
    case 'salata': return ['kelime/bowl', ...o.turlar.flatMap((t) => t.secenekler.map((s) => `kelime/${s}`))];
    case 'canta': return ['kelime/bag', ...o.turlar.flatMap((t) => t.secenekler.map((s) => `kelime/${s}`))];
    case 'gece': return ['kelime/sun', 'kelime/moon', 'kelime/star', 'kelime/flower', 'kelime/tree'];
    case 'boy': return SEKILLER.map((s) => `kelime/${s}`);
    case 'oyun': return o.yerler.flatMap((y) => [`kelime/${y}`, `eylem/kino-${y === 'sand' ? 'in' : 'on'}-${y}`]);
    case 'dokun': return ['oyun/vucut/kino'];
    case 'say10': return [...new Set(Array.from({ length: o.son }, (_, i) => `oyun/balon-${balonRengi(i + 1)}`)), 'oyun/balon-pat'];
    case 'renkli': return ['oyun/giydir/kino-0', 'oyun/giydir/kino-1', 'oyun/renkli/kart', ...o.giysiler.flatMap((g) => o.renkler.flatMap((r) => [`oyun/renkli/${renkliKimlik(r, g)}`, `oyun/renkli/raf-${renkliKimlik(r, g)}`]))];
    case 'bilmece': return [...new Set(o.turlar.flatMap((t) => t.secenekler.map((w) => `kelime/${w}`)))];
    case 'farkli': return [...new Set(o.turlar.flatMap((t) => t.kartlar.map((w) => `kelime/${w}`)))];
  }
}

const hece = (s: string) => (s.toLowerCase().match(/[aeiouy]+/g) ?? []).length || 1;
const polly = (id: string, metin: string): SesMetni => ({ id: `en/g-${id}`, kim: 'polly', dil: 'en', metin, hece: hece(metin) });
const ceren = (id: string, metin: string): SesMetni => ({ id: `tr/c-${id}-giris`, kim: 'ceren', dil: 'tr', metin, hece: (metin.toLocaleLowerCase('tr').match(/[aeıioöuü]/g) ?? []).length });
const BEDEN_SOZU: Record<string, string> = { hair: 'your hair', shoulders: 'your shoulders', arms: 'your arms', fingers: 'your fingers', tummy: 'your tummy', knees: 'your knees', toes: 'your toes', teeth: 'your teeth' };

/** Yeni kayıtlar (her biri ayrı ElevenLabs isteği; scripts/ingilizce-ses.ts --id) */
export function adaOyunuSesMetinleri2(): SesMetni[] {
  return [
    ceren('salata', 'Polly meyve salatası yapıyor! Polly hangi meyveyi isterse, onu bul ve kâseye koy.'),
    polly('fruit-salad', 'Let’s make a fruit salad!'),
    ...MEYVELER.map((m) => polly(`bowl-${m}`, `Put the ${m === 'grapes' ? 'grapes' : m} in the bowl!`)),
    polly('yummy-salad', 'Yummy! A fruit salad!'),
    polly('not-in-salad', 'Hmm, not in a fruit salad!'),
    ceren('gece', 'Bazen gündüz, bazen gece! Gökyüzüne bak, Polly ne arıyor, sen bul.'),
    polly('its-day', 'It’s day!'),
    polly('its-night', 'It’s night!'),
    polly('good-night-moon', 'Good night, moon and stars!'),
    ceren('canta', 'Okul zamanı! Polly ne derse, onu bul ve çantaya koy.'),
    polly('pack-bag', 'Let’s pack your bag!'),
    ...OKUL_ESYASI.map((e) => polly(`bag-${e}`, `Put the ${e} in your bag!`)),
    polly('ready-school', 'Ready for school!'),
    ceren('boy', 'Büyük mü, küçük mü? Polly hangisini isterse ona dokun.'),
    ...SEKILLER.flatMap((s) => [polly(`find-big-${s}`, `Find the big ${s}!`), polly(`find-small-${s}`, `Find the small ${s}!`)]),
    ceren('oyun', 'Parktayız! Polly Kino’yu nereye çağırıyor? Dinle ve oraya dokun.'),
    polly('go-slide', 'Let’s go on the slide!'),
    polly('go-swing', 'Let’s go on the swing!'),
    polly('go-seesaw', 'Let’s go on the seesaw!'),
    polly('go-sand', 'Let’s play in the sand!'),
    ceren('dokun', 'Polly bir yer söyleyecek, sen Kino’da o yere dokun. Gittikçe hızlanacak!'),
    ...Object.keys(BEDEN).map((b) => polly(`touch-${b}`, `Touch ${BEDEN_SOZU[b]}!`)),
    polly('faster', 'Faster!'),
    ceren('say10', 'Balonlarda sayılar var! Polly sayacak, sen o balonu patlat. Sırayla, birden başla!'),
    polly('count-ten', 'Let’s count to ten!'),
    polly('count-twelve', 'Let’s count to twelve!'),
    polly('count-five', 'Let’s count to five!'),
    polly('great-counting', 'Great counting!'),
    ceren('renkli', 'Kino giyinecek! Polly hem rengi hem giysiyi söyleyecek. İyi dinle, doğru renkteki giysiyi Kino’ya giydir.'),
    polly('rk-giris', 'Let’s dress Kino in colors!'),
    ...RENKLI_GIYSILER.flatMap((g) => RENKLER.map((r) => polly(`rk-${renkliKimlik(r, g)}`, `Put on the ${r} ${GIYSI_ADI[g]}!`))),
    ...RENKLER.flatMap((sapka) => RENKLER.map((corap) => polly(`rk-${sapka}-hat-${corap}-socks`, `A ${sapka} hat and ${corap} socks!`))),
  ];
}

export function adaOyunuSesleri2(o: AdaOyunu2): string[] {
  const s = new Set<string>(['en/g-yes', 'en/g-not-that', 'en/g-well-done', `tr/c-${o.ad}-giris`]);
  switch (o.ad) {
    case 'salata': ['en/g-fruit-salad', 'en/g-yummy-salad', 'en/g-not-in-salad'].forEach((x) => s.add(x)); o.turlar.forEach((t) => { s.add(`en/g-bowl-${t.hedef}`); t.secenekler.forEach((x) => s.add(`en/w-${x}`)); }); break;
    case 'canta': ['en/g-pack-bag', 'en/g-ready-school'].forEach((x) => s.add(x)); o.turlar.forEach((t) => { s.add(`en/g-bag-${t.hedef}`); t.secenekler.forEach((x) => s.add(`en/w-${x}`)); }); break;
    case 'gece': ['en/g-its-day', 'en/g-its-night', 'en/g-good-night-moon'].forEach((x) => s.add(x)); o.turlar.forEach((t) => { s.add(`en/q-${t.hedef}`); t.secenekler.forEach((x) => s.add(`en/w-${x}`)); }); break;
    case 'boy': o.turlar.forEach((t) => { s.add(`en/g-find-${t.boy}-${t.sekil}`); s.add(`en/w-${t.sekil}`); }); break;
    case 'oyun': o.yerler.forEach((y) => { s.add(`en/g-go-${y}`); s.add(`en/i-${PARK[y]}`); s.add(`en/w-${y}`); }); break;
    case 'dokun': s.add('en/g-faster'); o.turlar.forEach((b) => s.add(`en/g-touch-${b}`)); break;
    case 'say10': s.add(o.son === 12 ? 'en/g-count-twelve' : o.son === 5 ? 'en/g-count-five' : 'en/g-count-ten'); s.add('en/g-great-counting'); for (let n = 1; n <= o.son; n++) s.add(`en/w-${SAYI_ADI[n]}`); break;
    case 'renkli':
      ['en/g-rk-giris', 'en/g-say-cheese', 'en/g-kino-ready', renkliSonuc(o).id].forEach((x) => s.add(x));
      o.turlar.forEach((t) => s.add(`en/g-rk-${renkliKimlik(t.renk, t.giysi)}`));
      o.renkler.forEach((r) => s.add(`en/w-${r}`)); o.giysiler.forEach((g) => s.add(`en/w-${g}`));
      break;
    case 'bilmece': bilmeceOturumSesleri(o.turlar).forEach((x) => s.add(x)); break;
    case 'farkli': farkliOturumSesleri(o.turlar).forEach((x) => s.add(x)); break;
  }
  return [...s];
}
