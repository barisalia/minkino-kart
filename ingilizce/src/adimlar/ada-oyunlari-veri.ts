/**
 * 13–24. adalara özel oyunlar (20 Kasım 2026) · DOM'suz veri: planlar, çizim listeleri, Polly'nin ve Ceren'in sözleri.
 * Her oyun adanın 6. dersinde (cümle şenliği) Polly'nin Dürbünü'nün yerini alır; çizimi ya da sesi eksikse ders o adımı
 * oynar (yedek). Oyunların kendisi ayrı dosyalarda: kino-nerede.ts (Evim), kino-yardim.ts (Duygular),
 * hava-penceresi.ts (Hava), kino-gunu.ts (Günüm), lokum-piknik.ts (Sofra). Ses betiği ve testler bu dosyayı okur.
 */
import type { SesMetni } from '../icerik';
import type { Yas } from '../plan';
import { ADA_OYUNU2, adaOyunuCizimleri2, adaOyunuPlani2, adaOyunuSesleri2, adaOyunuSesMetinleri2, adaOyunuSoruSayisi2, type AdaOyunu2 } from './ada-oyunlari-veri2';

type Rnd = () => number;
const karistir = <T>(l: readonly T[], rnd: Rnd): T[] => { const a = [...l]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// ---------------------------------------------------------------- Evim · Knock, Knock! Where is Kino?
/** Oda kelimesi → Seviye 2'deki cümlesi ("Kino is in the kitchen.") ve resmi (Paket 20) */
export const ODALAR = { kitchen: 'evim-a1', bathroom: 'evim-a2', bedroom: 'evim-a3', garden: 'evim-a4' } as const;
export type Oda = keyof typeof ODALAR;

// ---------------------------------------------------------------- Duygular · Help Kino!
/** Kino'nun derdi → ona iyi gelen şey (daha önceki adaların kelimeleri) */
export const DERTLER = { hungry: 'apple', thirsty: 'water', sleepy: 'bed', sad: 'teddy-bear' } as const;
export type Dert = keyof typeof DERTLER;

// ---------------------------------------------------------------- Hava · Polly's Weather Window
/** Pencerede görünen hava → Polly'nin cümlesi ve o havada giyilecek iki giysi (Kino'yu Giydir katmanları) */
export const HAVALAR = {
  sun: { ses: 'en/i-hava-a3', giysiler: ['hat', 't-shirt'] },
  rain: { ses: 'en/i-hava-a4', giysiler: ['jacket', 'shoes'] },
  snow: { ses: 'en/g-its-snowy', giysiler: ['scarf', 'socks'] },
} as const;
export type Hava = keyof typeof HAVALAR;

// ---------------------------------------------------------------- Günüm · Kino's Day
/** Günün dört karesi: sabah iki iş, gündüz bir oyun, akşam kitap. Her işin cümlesi Seviye 2'den. */
export const ISLER = { 'wake-up': 'en/i-gunum-a1', wash: 'en/i-gunum-a2', brush: 'en/i-gunum-a3', read: 'en/i-gunum-a4', sing: 'en/i-gunum-b1', draw: 'en/i-gunum-b2', play: 'en/i-gunum-b3' } as const;
export type Is = keyof typeof ISLER;
const GUN_SIRASI: readonly (readonly Is[])[] = [['wake-up'], ['wash', 'brush'], ['play', 'draw', 'sing'], ['read']];
const GUN_KELIMELERI = ['wake-up', 'wash', 'brush', 'read', 'draw', 'sing', 'play', 'hug'] as const;

// ---------------------------------------------------------------- Sofra · Lokum's Snack Picnic
export const YIYECEKLER = ['cake', 'apple', 'banana', 'pear', 'egg'] as const;
export type Yiyecek = typeof YIYECEKLER[number];
export type Boy = 'big' | 'small';
export interface PiknikSecenegi { yiyecek: Yiyecek; boy?: Boy }
const AN: Partial<Record<Yiyecek, true>> = { apple: true, egg: true };

export type AdaOyunu =
  | { ad: 'nerede'; odalar: Oda[]; turlar: Oda[] }
  | { ad: 'yardim'; turlar: { dert: Dert; secenekler: string[] }[] }
  | { ad: 'pencere'; turlar: { hava: Hava; giysiler: string[]; raf: string[] }[] }
  | { ad: 'gun'; turlar: { is: Is; secenekler: string[] }[] }
  | { ad: 'piknik'; turlar: { hedef: PiknikSecenegi; secenekler: PiknikSecenegi[] }[] }
  | AdaOyunu2;
export type AdaOyunAdi = AdaOyunu['ad'];

/** Hangi adanın 6. dersinde hangi oyun */
export const ADA_OYUNU: Record<string, AdaOyunAdi> = { evim: 'nerede', duygular: 'yardim', hava: 'pencere', gunum: 'gun', sofra: 'piknik', ...ADA_OYUNU2 };

export const piknikKimligi = (s: PiknikSecenegi) => (s.boy ? `${s.boy}-${s.yiyecek}` : s.yiyecek);

/** Bir adanın oyununun planı (oyunu olmayan adada null) */
export function adaOyunuPlani(uniteId: string, yas: Yas, rnd: Rnd = Math.random): AdaOyunu | null {
  const kucuk = yas === '2-3', buyuk = yas === '5+';
  switch (ADA_OYUNU[uniteId]) {
    case 'nerede': {
      const odalar = karistir(Object.keys(ODALAR) as Oda[], rnd).slice(0, kucuk ? 3 : 4);
      return { ad: 'nerede', odalar, turlar: karistir(odalar, rnd).slice(0, buyuk ? 4 : 3) };
    }
    case 'yardim': {
      const dertler = karistir(Object.keys(DERTLER) as Dert[], rnd).slice(0, kucuk ? 2 : buyuk ? 4 : 3);
      return {
        ad: 'yardim', turlar: dertler.map((dert) => {
          const diger = karistir(Object.values(DERTLER).filter((x) => x !== DERTLER[dert]), rnd).slice(0, kucuk ? 1 : 2);
          return { dert, secenekler: karistir([DERTLER[dert], ...diger], rnd) };
        }),
      };
    }
    case 'pencere': {
      const havalar = karistir(Object.keys(HAVALAR) as Hava[], rnd).slice(0, 2);
      return {
        ad: 'pencere', turlar: havalar.map((hava) => {
          const giysiler = HAVALAR[hava].giysiler.slice(0, kucuk ? 1 : 2) as string[];
          const diger = karistir(Object.values(HAVALAR).flatMap((x) => x.giysiler).filter((g) => !HAVALAR[hava].giysiler.includes(g as never)), rnd).slice(0, kucuk ? 1 : 2);
          return { hava, giysiler, raf: karistir([...giysiler, ...diger], rnd) };
        }),
      };
    }
    case 'gun': {
      // çeldiriciler günün öbür işlerinden değil (şeride konan resim yeniden seçenek olmasın)
      const gunun = GUN_SIRASI.map((secilebilir) => secilebilir[Math.floor(rnd() * secilebilir.length)]);
      return {
        ad: 'gun', turlar: gunun.map((is, i) => {
          const diger = karistir(GUN_KELIMELERI.filter((x) => !gunun.includes(x as Is) && !GUN_SIRASI[i].includes(x as Is)), rnd).slice(0, kucuk ? 1 : 2);
          return { is, secenekler: karistir([is, ...diger], rnd) };
        }),
      };
    }
    case 'piknik': {
      const yiyecekler = karistir(YIYECEKLER, rnd);
      const turlar = yiyecekler.slice(0, kucuk ? 3 : 4).map((y, i) => {
        if (kucuk) {
          const diger = yiyecekler.find((x) => x !== y)!;
          return { hedef: { yiyecek: y }, secenekler: karistir<PiknikSecenegi>([{ yiyecek: y }, { yiyecek: diger }], rnd) };
        }
        const boy: Boy = (i + Math.floor(rnd() * 2)) % 2 ? 'big' : 'small';
        const ters: Boy = boy === 'big' ? 'small' : 'big';
        const diger = yiyecekler.filter((x) => x !== y)[i % 3];
        const secenekler: PiknikSecenegi[] = [{ yiyecek: y, boy }, { yiyecek: y, boy: ters }, { yiyecek: diger, boy }];
        if (yas === '5+') secenekler.push({ yiyecek: diger, boy: ters });
        return { hedef: { yiyecek: y, boy }, secenekler: karistir(secenekler, rnd) };
      });
      return { ad: 'piknik', turlar };
    }
    default: return adaOyunuPlani2(uniteId, yas, rnd);
  }
}

/** Tur sayısı (yıldız hesabı) */
export const adaOyunuSoruSayisi = (o: AdaOyunu): number => (o.ad === 'pencere' ? o.turlar.reduce((t, x) => t + x.giysiler.length, 0)
  : o.ad === 'nerede' || o.ad === 'yardim' || o.ad === 'gun' || o.ad === 'piknik' ? o.turlar.length : adaOyunuSoruSayisi2(o));

// ---------------------------------------------------------------- çizimler

/** Oyunun açılması için diskte olması gereken çizimler (assets/ingilizce/<yol>.webp) */
export function adaOyunuCizimleri(o: AdaOyunu): string[] {
  switch (o.ad) {
    case 'nerede': return o.odalar.flatMap((d) => [`kelime/${d}`, `eylem/kino-in-${d}`]);
    case 'yardim': return ['kelime/happy', ...o.turlar.flatMap((t) => [`kelime/${t.dert}`, ...t.secenekler.map((s) => `kelime/${s}`)])];
    case 'pencere': return ['oyun/hava/pencere', 'oyun/hava/perde-sol', 'oyun/hava/perde-sag', 'oyun/giydir/kino-0', 'oyun/giydir/kino-1',
      ...o.turlar.flatMap((t) => [`kelime/${t.hava}`, ...t.raf.flatMap((g) => [`kelime/${g}`, `oyun/giydir/${g}`])])];
    case 'gun': return ['kelime/sun', 'kelime/moon', ...o.turlar.flatMap((t) => t.secenekler.map((s) => `kelime/${s}`))];
    case 'piknik': return ['oyun/piknik/fon', 'oyun/piknik/lokum-bekler', 'oyun/piknik/lokum-yiyor', 'oyun/piknik/lokum-mutlu', ...o.turlar.flatMap((t) => t.secenekler.map((s) => `kelime/${s.yiyecek}`))];
    default: return adaOyunuCizimleri2(o);
  }
}

// ---------------------------------------------------------------- sesler

const hece = (s: string) => (s.toLowerCase().match(/[aeiouy]+/g) ?? []).length || 1;
const polly = (id: string, metin: string): SesMetni => ({ id: `en/g-${id}`, kim: 'polly', dil: 'en', metin, hece: hece(metin) });
const ceren = (id: string, metin: string): SesMetni => ({ id: `tr/c-${id}-giris`, kim: 'ceren', dil: 'tr', metin, hece: (metin.toLocaleLowerCase('tr').match(/[aeıioöuü]/g) ?? []).length });

const ad = (y: Yiyecek, boy?: Boy) => (boy ? `a ${boy} ${y}` : `${AN[y] ? 'an' : 'a'} ${y}`);
/** "Lokum wants a big apple." · küçüklerde boysuz: "Lokum wants an apple." */
export const piknikSozu = (s: PiknikSecenegi) => `en/g-lokum-${piknikKimligi(s)}`;

/** Bu oyunların yeni kayıtları (her biri ayrı ElevenLabs isteği; scripts/ingilizce-ses.ts --id) */
export function adaOyunuSesMetinleri(): SesMetni[] {
  return [
    ceren('nerede', 'Kino evde saklandı! Polly, Kino’nun hangi odada olduğunu söyleyecek. İyi dinle ve o odaya dokun.'),
    polly('knock-knock', 'Knock, knock! Where is Kino?'),
    polly('found-kino', 'You found Kino! Well done!'),
    ceren('yardim', 'Kino’nun bir derdi var. Polly ne olduğunu söyleyecek. Kino’ya ne lazım, sen bul ve ona ver!'),
    polly('help-kino', 'Let’s help Kino!'),
    ...(Object.keys(DERTLER) as Dert[]).map((d) => polly(`oh-no-${d}`, `Oh no! Kino is ${d}!`)),
    polly('here-you-are', 'Here you are, Kino!'),
    polly('not-that', 'Hmm, not that one!'),
    ceren('pencere', 'Kino dışarı çıkmak istiyor. Önce perdeyi aç, havaya bak. Sonra Polly’nin söylediği giysiyi Kino’ya giydir.'),
    polly('open-curtains', 'Open the curtains! Let’s look outside.'),
    polly('its-snowy', 'It’s snowy today.'),
    polly('lets-go-out', 'Kino is ready. Let’s go outside!'),
    ceren('gun', 'Bu, Kino’nun bir günü! Polly, Kino’nun ne yaptığını söyleyecek. Doğru resmi bul, günün şeridine koy.'),
    polly('good-morning-kino', 'Good morning, Kino!'),
    polly('good-night-kino', 'Good night, Kino!'),
    ceren('piknik', 'Lokum’la piknikteyiz! Polly, Lokum’un ne istediğini söyleyecek. Büyük mü, küçük mü, iyi dinle!'),
    polly('picnic-time', 'It’s picnic time!'),
    ...YIYECEKLER.flatMap((y) => [undefined, 'big', 'small'].map((boy) => {
      const s: PiknikSecenegi = { yiyecek: y, boy: boy as Boy | undefined };
      return polly(`lokum-${piknikKimligi(s)}`, `Lokum wants ${ad(y, s.boy)}.`);
    })),
    ...adaOyunuSesMetinleri2(),
  ];
}

/** Bir planın çaldığı bütün kayıtlar (ders ekranı önceden yükler; hazır denetimi) */
export function adaOyunuSesleri(o: AdaOyunu): string[] {
  const s = new Set<string>(['en/g-yes', 'en/g-thank-you']);
  switch (o.ad) {
    case 'nerede':
      ['tr/c-nerede-giris', 'en/g-knock-knock', 'en/g-found-kino', 'en/g-not-there'].forEach((x) => s.add(x));
      o.odalar.forEach((d) => { s.add(`en/i-${ODALAR[d]}`); s.add(`en/w-${d}`); });
      break;
    case 'yardim':
      ['tr/c-yardim-giris', 'en/g-help-kino', 'en/g-here-you-are', 'en/g-not-that', 'en/i-duygular-a1'].forEach((x) => s.add(x));
      o.turlar.forEach((t) => { s.add(`en/g-oh-no-${t.dert}`); t.secenekler.forEach((x) => s.add(`en/w-${x}`)); });
      break;
    case 'pencere':
      ['tr/c-pencere-giris', 'en/g-open-curtains', 'en/g-lets-go-out'].forEach((x) => s.add(x));
      o.turlar.forEach((t) => { s.add(HAVALAR[t.hava].ses); t.raf.forEach((g) => { s.add(`en/w-${g}`); s.add(`en/g-put-on-${g}`); }); });
      break;
    case 'gun':
      ['tr/c-gun-giris', 'en/g-good-morning-kino', 'en/g-good-night-kino', 'en/g-not-that'].forEach((x) => s.add(x));
      o.turlar.forEach((t) => { s.add(ISLER[t.is]); t.secenekler.forEach((x) => s.add(`en/w-${x}`)); });
      break;
    case 'piknik':
      ['tr/c-piknik-giris', 'en/g-picnic-time', 'en/g-yummy', 'en/g-not-that'].forEach((x) => s.add(x));
      o.turlar.forEach((t) => { s.add(piknikSozu(t.hedef)); t.secenekler.forEach((x) => s.add(`en/w-${x.yiyecek}`)); });
      break;
    default: return adaOyunuSesleri2(o);
  }
  return [...s];
}
