/**
 * Ceren Öğretmen ile İngilizceye Merhaba · Seviye 2 (cümleler) ve Seviye 3 (konuşma) içeriği.
 *
 * Her adanın Seviye 1'den sonra altı dersi daha vardır (ders numaraları icerik.ts → DersNo):
 *   Seviye 2 · 4. ders: yeni kalıp A (4 ifade)   5. ders: yeni kalıp B (4 ifade)   6. ders: cümle şenliği (A + B)
 *   Seviye 3 · 7. ders: soru–cevap (Polly sorar)  8. ders: cümle kurma (uzun cümleler)  9. ders: hikâye (4 resim)
 *
 * TEK KAYNAK: ifadeler, parçaları (cümle kurma taşları), resim tarifleri ve seslendirilecek metinler buradadır.
 * Ses dosyaları: ifade en/i-<id> (+ Seviye 2'de yavaş okunuşu en/i-<id>-yavas), cümle taşı en/p-<taş>,
 * soru en/s-<id>, Ceren'in ders açıklaması tr/d-<ünite>-<a|b|s|h>. Var olan kelime kayıtları (en/c-…, en/q-…,
 * en/w-…) yeniden üretilmez, olduğu gibi kullanılır.
 * Çizimler: bir ifadenin resmi ya kelime resimlerinden kodla dizilir (üç ördek, büyük inek, kedi ve köpek) ya da
 * Astra'nın o ifadeye özel çizimidir (`ozel`: renkli/…, yer/…, eylem/…, hikaye/…). Liste: ekip/ingilizce/CIZIM-ISLERI.md.
 */
import { masalSorusuSozleri } from './masal-oyun';
import { UNITELER, cumle, kelimeBul, type DersNo, type SesMetni, type Unite } from './icerik';
import { YENI_POLLY_SOZLERI2, yeniIlerisi } from './icerik3';

// ---------------------------------------------------------------- türler

/** Kino'nun ifadedeki rolü: sever (mmm), sevmez (istemem), elinde tutar */
export type KinoPozu = 'sev' | 'sevme' | 'tut';

/** Bir ifadenin resmi nasıl kurulur */
export interface Gorsel {
  /** kelime resmi: assets/ingilizce/kelime/<k>.webp */
  k?: string;
  /** aynı resimden kaç tane ("three ducks") */
  adet?: number;
  /** büyük / küçük çizilir ("a big cow") */
  boy?: 'big' | 'small';
  /** yanına ikinci kelime resmi ("a cat and a dog") */
  ile?: string;
  /** Astra'nın bu ifadeye özel çizimi: assets/ingilizce/<ozel>.webp */
  ozel?: string;
  /** yanında Kino durur */
  kino?: KinoPozu;
  /** üstünde kalp ("I love my mom") */
  kalp?: true;
}

/** Cümle kurma taşı: cümlenin bir parçası; dokununca kendi sesi duyulur */
export interface Parca {
  en: string;
  g?: Gorsel;
  /** resmi olmayan işlev sözleri için simge: assets/ingilizce/ui/soz-<ad>.webp (yoksa taş yalnız yazıyla durur) */
  simge?: string;
  ses: string;
}

export interface Ifade {
  id: string;
  en: string;
  tr: string;
  g: Gorsel;
  parcalar: Parca[];
  ses: string;
  /** yavaş okunuş (yalnız Seviye 2'nin yeni ifadelerinde) */
  yavas?: string;
}

/** Soru–cevap turu: Polly sorar, çocuk cevaba dokunur */
export interface Sohbet {
  ses: string;
  en: string;
  tr: string;
  g: Gorsel;
  dogru: Ifade;
  /** sabit seçenekler (evet / hayır gibi); yoksa çeldiriciler öbür turların cevaplarından gelir */
  secenekler?: Ifade[];
  /** çocuğun kendi cevabı: iki seçenek de doğrudur ("Do you like apples?") */
  serbest?: true;
}

export interface KalipDersi { ad: string; aciklama: string; ifadeler: Ifade[] }
export interface Hikaye { en: string; tr: string; giris: string; sayfalar: Ifade[] }
export interface Ilerisi {
  a: KalipDersi;
  b: KalipDersi;
  sohbet: { aciklama: string; turlar: Sohbet[] };
  kur: Ifade[];
  hikaye: Hikaye;
}

// ---------------------------------------------------------------- kurucular

const dizgi = (s: string) => s.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim().replace(/ /g, '-');

/** İşlev sözlerinin simgeleri (Astra çizer: ui/soz-<ad>.webp). Tabloda olmayan söz yalnız yazıyla durur. */
const SIMGE: Record<string, string> = {
  'i-see': 'gor', 'i-like': 'sev', 'i-dont-like': 'sevme', 'i-have': 'var', 'i-love': 'kalp', and: 've',
  'a-big': 'buyuk', big: 'buyuk', 'a-small': 'kucuk', small: 'kucuk',
  'is-on': 'ustunde', 'is-under': 'altinda', 'is-in': 'icinde',
};

/**
 * Taş tarifi: [yazı, kaynak]. Kaynak: 'w:cow' kelime resmi ve kaydı · 'c:duck' kelime resmi, çoğul kaydı (en/p-ducks) ·
 * 'r:kisi/kino-0' hazır bir çizim · 'p' işlev sözü (simgesi SIMGE tablosundan, kaydı en/p-<söz>).
 */
type Tas = [en: string, kaynak: string];
function parca([en, kaynak]: Tas): Parca {
  const ayrac = kaynak.indexOf(':');
  const tur = ayrac < 0 ? kaynak : kaynak.slice(0, ayrac), ad = ayrac < 0 ? '' : kaynak.slice(ayrac + 1);
  if (tur === 'w') return { en, g: { k: ad }, ses: `en/w-${ad}` };
  if (tur === 'c') return { en, g: { k: ad }, ses: `en/p-${dizgi(en)}` };
  if (tur === 'r') return { en, g: { ozel: ad }, ses: `en/p-${dizgi(en)}` };
  const s = dizgi(en);
  return { en, simge: SIMGE[s] ? `ui/soz-${SIMGE[s]}` : undefined, ses: `en/p-${s}` };
}

function f(id: string, en: string, tr: string, g: Gorsel, taslar: Tas[] = [], ek: Partial<Ifade> = {}): Ifade {
  return { id, en, tr, g, parcalar: taslar.map(parca), ses: `en/i-${id}`, ...ek };
}
/** Seviye 2'nin yeni ifadeleri yavaş da okunur (başka bir kaydı yeniden kullanan ifade hariç) */
const yavasli = (liste: Ifade[]): Ifade[] => liste.map((x) => (x.ses === `en/i-${x.id}` ? { ...x, yavas: `en/i-${x.id}-yavas` } : x));
const kalip = (ad: string, aciklama: string, ifadeler: Ifade[]): KalipDersi => ({ ad, aciklama, ifadeler: yavasli(ifadeler) });

/** Kelimenin Seviye 1'deki cümlesi cevap olarak: "It's a cow." (kaydı zaten var: en/c-cow) */
function kc(kelimeId: string): Ifade {
  const w = kelimeBul(kelimeId)!;
  return { id: `c-${kelimeId}`, en: cumle(w), tr: w.tr, g: { k: kelimeId }, parcalar: [], ses: `en/c-${kelimeId}` };
}
const ortakCevap = (ad: string, en: string, tr: string, ozel: string): Ifade => ({ id: `g-${ad}`, en, tr, g: { ozel }, parcalar: [], ses: `en/g-${ad}` });
const EVET_SEVERIM = ortakCevap('yes-i-do', 'Yes, I do.', 'Evet, severim.', 'ui/evet');
const HAYIR_SEVMEM = ortakCevap('no-i-dont', "No, I don't.", 'Hayır, sevmem.', 'ui/hayir');
const EVET_OYLE = ortakCevap('yes-it-is', 'Yes, it is.', 'Evet, öyle.', 'ui/evet');
const HAYIR_DEGIL = ortakCevap('no-it-isnt', "No, it isn't.", 'Hayır, değil.', 'ui/hayir');

/** Ortak sorulu turlar: her resim için aynı soru ("What is it?"), cevap resme göre değişir */
const ayniSoru = (ad: string, en: string, tr: string, turlar: [Gorsel, Ifade][]): Sohbet[] =>
  turlar.map(([g, dogru]) => ({ ses: `en/g-${ad}`, en, tr, g, dogru }));
/** Üniteye özel soru (kaydı en/s-<id>) */
const ozelSoru = (id: string, en: string, tr: string, g: Gorsel, dogru: Ifade, ek: Partial<Sohbet> = {}): Sohbet => ({ ses: `en/s-${id}`, en, tr, g, dogru, ...ek });

const sayfa = (unite: string, n: number, en: string, tr: string, ek: Partial<Ifade> = {}): Ifade =>
  f(`${unite}-h${n}`, en, tr, { ozel: `hikaye/${unite}-${n}` }, [], ek);

const o = (ozel: string): Gorsel => ({ ozel });

// ---------------------------------------------------------------- içerik

function kur(): Record<string, Ilerisi> {
  const s: Record<string, Ilerisi> = {};

  // 1 · Çiftlik: büyük – küçük · ve
  {
    const a = kalip('Big · Small', "Şimdi büyük ve küçük demeyi öğreniyoruz. Resme bak, Polly'yi dinle!", [
      f('ciftlik-a1', 'A big cow.', 'Büyük bir inek.', { k: 'cow', boy: 'big' }, [['A big', 'p'], ['cow', 'w:cow']]),
      f('ciftlik-a2', 'A small cow.', 'Küçük bir inek.', { k: 'cow', boy: 'small' }, [['A small', 'p'], ['cow', 'w:cow']]),
      f('ciftlik-a3', 'A big dog.', 'Büyük bir köpek.', { k: 'dog', boy: 'big' }, [['A big', 'p'], ['dog', 'w:dog']]),
      f('ciftlik-a4', 'A small dog.', 'Küçük bir köpek.', { k: 'dog', boy: 'small' }, [['A small', 'p'], ['dog', 'w:dog']]),
    ]);
    const b = kalip('And', 'Şimdi iki hayvan birden geliyor. Polly ikisini birlikte söyleyecek.', [
      f('ciftlik-b1', 'A cat and a dog.', 'Bir kedi ve bir köpek.', { k: 'cat', ile: 'dog' }, [['A cat', 'w:cat'], ['and', 'p'], ['a dog', 'w:dog']]),
      f('ciftlik-b2', 'A cow and a horse.', 'Bir inek ve bir at.', { k: 'cow', ile: 'horse' }, [['A cow', 'w:cow'], ['and', 'p'], ['a horse', 'w:horse']]),
      f('ciftlik-b3', 'A duck and a sheep.', 'Bir ördek ve bir koyun.', { k: 'duck', ile: 'sheep' }, [['A duck', 'w:duck'], ['and', 'p'], ['a sheep', 'w:sheep']]),
      f('ciftlik-b4', 'A cat and a duck.', 'Bir kedi ve bir ördek.', { k: 'cat', ile: 'duck' }, [['A cat', 'w:cat'], ['and', 'p'], ['a duck', 'w:duck']]),
    ]);
    s.ciftlik = {
      a, b,
      sohbet: { aciklama: 'Polly, bu ne diye soracak. Doğru cevaba dokun.', turlar: ayniSoru('what-is-it', 'What is it?', 'Bu ne?', ['cow', 'duck', 'horse', 'sheep'].map((k): [Gorsel, Ifade] => [{ k }, kc(k)])) },
      kur: [
        f('ciftlik-k1', 'I see a big cow.', 'Büyük bir inek görüyorum.', { k: 'cow', boy: 'big' }, [['I see', 'p'], ['a big', 'p'], ['cow', 'w:cow']]),
        f('ciftlik-k2', 'I see a small dog.', 'Küçük bir köpek görüyorum.', { k: 'dog', boy: 'small' }, [['I see', 'p'], ['a small', 'p'], ['dog', 'w:dog']]),
        f('ciftlik-k3', 'I see a cat and a dog.', 'Bir kedi ve bir köpek görüyorum.', { k: 'cat', ile: 'dog' }, [['I see', 'p'], ['a cat', 'w:cat'], ['and', 'p'], ['a dog', 'w:dog']]),
        f('ciftlik-k4', 'I see a duck and a sheep.', 'Bir ördek ve bir koyun görüyorum.', { k: 'duck', ile: 'sheep' }, [['I see', 'p'], ['a duck', 'w:duck'], ['and', 'p'], ['a sheep', 'w:sheep']]),
      ],
      hikaye: {
        en: 'Kino at the Farm', tr: 'Kino Çiftlikte', giris: 'Kino çiftliğe gitmiş. Bakalım kimleri görecek?',
        sayfalar: [
          sayfa('ciftlik', 1, 'Kino is at the farm.', 'Kino çiftlikte.'),
          sayfa('ciftlik', 2, 'He sees a big cow.', 'Büyük bir inek görüyor.'),
          sayfa('ciftlik', 3, 'He sees a small duck.', 'Küçük bir ördek görüyor.'),
          sayfa('ciftlik', 4, 'Goodbye, cow! Goodbye, duck!', 'Güle güle inek! Güle güle ördek!'),
        ],
      },
    };
  }

  // 2 · Renkler: renk + nesne
  {
    const a = kalip('A red ball', 'İngilizcede önce rengi, sonra adını söyleriz. Dinle!', [
      f('renkler-a1', 'A red ball.', 'Kırmızı bir top.', o('renkli/ball-red'), [['A red', 'w:red'], ['ball', 'w:ball']]),
      f('renkler-a2', 'A blue ball.', 'Mavi bir top.', o('renkli/ball-blue'), [['A blue', 'w:blue'], ['ball', 'w:ball']]),
      f('renkler-a3', 'A red car.', 'Kırmızı bir araba.', o('renkli/car-red'), [['A red', 'w:red'], ['car', 'w:car']]),
      f('renkler-a4', 'A blue car.', 'Mavi bir araba.', o('renkli/car-blue'), [['A blue', 'w:blue'], ['car', 'w:car']]),
    ]);
    const b = kalip('A yellow kite', 'Şimdi uçurtmalar ve balonlar geliyor. Rengine iyi bak!', [
      f('renkler-b1', 'A yellow kite.', 'Sarı bir uçurtma.', o('renkli/kite-yellow'), [['A yellow', 'w:yellow'], ['kite', 'w:kite']]),
      f('renkler-b2', 'A green kite.', 'Yeşil bir uçurtma.', o('renkli/kite-green'), [['A green', 'w:green'], ['kite', 'w:kite']]),
      f('renkler-b3', 'A pink balloon.', 'Pembe bir balon.', o('oyun/balon-pembe'), [['A pink', 'w:pink'], ['balloon', 'w:balloon']]),
      f('renkler-b4', 'An orange balloon.', 'Turuncu bir balon.', o('oyun/balon-turuncu'), [['An orange', 'w:orange'], ['balloon', 'w:balloon']]),
    ]);
    s.renkler = {
      a, b,
      sohbet: { aciklama: 'Polly, ne renk diye soracak. Doğru cevaba dokun.', turlar: ayniSoru('what-color', 'What color is it?', 'Ne renk?', [
        [o('renkli/ball-red'), kc('red')], [o('renkli/car-blue'), kc('blue')], [o('renkli/kite-yellow'), kc('yellow')], [o('renkli/kite-green'), kc('green')],
      ]) },
      kur: [
        f('renkler-k1', 'I see a red ball.', 'Kırmızı bir top görüyorum.', o('renkli/ball-red'), [['I see', 'p'], ['a red', 'w:red'], ['ball', 'w:ball']]),
        f('renkler-k2', 'I see a blue car.', 'Mavi bir araba görüyorum.', o('renkli/car-blue'), [['I see', 'p'], ['a blue', 'w:blue'], ['car', 'w:car']]),
        f('renkler-k3', 'I have a green kite.', 'Yeşil bir uçurtmam var.', { ozel: 'renkli/kite-green', kino: 'tut' }, [['I have', 'p'], ['a green', 'w:green'], ['kite', 'w:kite']]),
        f('renkler-k4', 'I have a pink balloon.', 'Pembe bir balonum var.', { ozel: 'oyun/balon-pembe', kino: 'tut' }, [['I have', 'p'], ['a pink', 'w:pink'], ['balloon', 'w:balloon']]),
      ],
      hikaye: {
        en: 'Two Balloons', tr: 'İki Balon', giris: 'Kino ile Polly balonlarıyla oynuyor. Dinle, bak ne oluyor!',
        sayfalar: [
          sayfa('renkler', 1, 'Kino has a red balloon.', "Kino'nun kırmızı bir balonu var."),
          sayfa('renkler', 2, 'Polly has a blue balloon.', "Polly'nin mavi bir balonu var."),
          sayfa('renkler', 3, 'Oh no! The red balloon is gone.', 'Eyvah! Kırmızı balon gitti.'),
          sayfa('renkler', 4, 'Here you are, Kino. Thank you, Polly!', 'Al bakalım Kino. Teşekkürler Polly!'),
        ],
      },
    };
  }

  // 3 · Sayılar: sayı + çoğul
  {
    const a = kalip('One apple · two apples', 'Bir taneyse kelime aynı kalır. Birden çoksa sonuna bir ses eklenir. Dinle, farkı duy!', [
      f('sayilar-a1', 'One apple.', 'Bir elma.', { k: 'apple', adet: 1 }, [['One', 'w:one'], ['apple', 'w:apple']]),
      f('sayilar-a2', 'Two apples.', 'İki elma.', { k: 'apple', adet: 2 }, [['Two', 'w:two'], ['apples', 'c:apple']]),
      f('sayilar-a3', 'Three balls.', 'Üç top.', { k: 'ball', adet: 3 }, [['Three', 'w:three'], ['balls', 'c:ball']]),
      f('sayilar-a4', 'Four balls.', 'Dört top.', { k: 'ball', adet: 4 }, [['Four', 'w:four'], ['balls', 'c:ball']]),
    ]);
    const b = kalip('Five ducks', 'Şimdi hayvanları sayıyoruz. Önce say, sonra dinle!', [
      f('sayilar-b1', 'Five ducks.', 'Beş ördek.', { k: 'duck', adet: 5 }, [['Five', 'w:five'], ['ducks', 'c:duck']]),
      f('sayilar-b2', 'Six ducks.', 'Altı ördek.', { k: 'duck', adet: 6 }, [['Six', 'w:six'], ['ducks', 'c:duck']]),
      f('sayilar-b3', 'Two cats.', 'İki kedi.', { k: 'cat', adet: 2 }, [['Two', 'w:two'], ['cats', 'c:cat']]),
      f('sayilar-b4', 'Three cats.', 'Üç kedi.', { k: 'cat', adet: 3 }, [['Three', 'w:three'], ['cats', 'c:cat']]),
    ]);
    s.sayilar = {
      a, b,
      sohbet: { aciklama: 'Polly, kaç tane diye soracak. Say ve cevabına dokun.', turlar: ayniSoru('how-many', 'How many?', 'Kaç tane?', b.ifadeler.map((x): [Gorsel, Ifade] => [x.g, x])) },
      kur: [
        f('sayilar-k1', 'I see three balls.', 'Üç top görüyorum.', { k: 'ball', adet: 3 }, [['I see', 'p'], ['three', 'w:three'], ['balls', 'c:ball']]),
        f('sayilar-k2', 'I see five ducks.', 'Beş ördek görüyorum.', { k: 'duck', adet: 5 }, [['I see', 'p'], ['five', 'w:five'], ['ducks', 'c:duck']]),
        f('sayilar-k3', 'I have two apples.', 'İki elmam var.', { k: 'apple', adet: 2, kino: 'tut' }, [['I have', 'p'], ['two', 'w:two'], ['apples', 'c:apple']]),
        f('sayilar-k4', 'I have four balls.', 'Dört topum var.', { k: 'ball', adet: 4, kino: 'tut' }, [['I have', 'p'], ['four', 'w:four'], ['balls', 'c:ball']]),
      ],
      hikaye: {
        en: 'One, Two, Three!', tr: 'Bir, İki, Üç!', giris: 'Kino gölün kıyısında ördekleri sayıyor. Sen de onunla say!',
        sayfalar: [
          sayfa('sayilar', 1, 'Kino sees one duck.', 'Kino bir ördek görüyor.'),
          sayfa('sayilar', 2, 'Now he sees two ducks.', 'Şimdi iki ördek görüyor.'),
          sayfa('sayilar', 3, 'Now he sees three ducks!', 'Şimdi üç ördek görüyor!'),
          sayfa('sayilar', 4, 'One, two, three. Hello, ducks!', 'Bir, iki, üç. Merhaba ördekler!'),
        ],
      },
    };
  }

  // 4 · Yiyecekler: severim – sevmem · ve
  {
    const a = kalip("I like · I don't like", 'Kino bazı yiyecekleri seviyor, bazılarını sevmiyor. Yüzüne bak ve dinle!', [
      f('yiyecekler-a1', 'I like bananas.', 'Muz severim.', { k: 'banana', kino: 'sev' }, [['I like', 'p'], ['bananas', 'c:banana']]),
      f('yiyecekler-a2', "I don't like bananas.", 'Muz sevmem.', { k: 'banana', kino: 'sevme' }, [["I don't like", 'p'], ['bananas', 'c:banana']]),
      f('yiyecekler-a3', 'I like milk.', 'Süt severim.', { k: 'milk', kino: 'sev' }, [['I like', 'p'], ['milk', 'w:milk']]),
      f('yiyecekler-a4', "I don't like milk.", 'Süt sevmem.', { k: 'milk', kino: 'sevme' }, [["I don't like", 'p'], ['milk', 'w:milk']]),
    ]);
    const b = kalip('Apples and pears', 'Kino iki şeyi birden seviyor. İkisini birlikte söyleyelim.', [
      f('yiyecekler-b1', 'I like apples and pears.', 'Elma ve armut severim.', { k: 'apple', ile: 'pear', kino: 'sev' }, [['I like', 'p'], ['apples', 'c:apple'], ['and', 'p'], ['pears', 'c:pear']]),
      f('yiyecekler-b2', 'I like bread and cheese.', 'Ekmek ve peynir severim.', { k: 'bread', ile: 'cheese', kino: 'sev' }, [['I like', 'p'], ['bread', 'w:bread'], ['and', 'p'], ['cheese', 'w:cheese']]),
      f('yiyecekler-b3', 'I like milk and bread.', 'Süt ve ekmek severim.', { k: 'milk', ile: 'bread', kino: 'sev' }, [['I like', 'p'], ['milk', 'w:milk'], ['and', 'p'], ['bread', 'w:bread']]),
      f('yiyecekler-b4', 'I like bananas and apples.', 'Muz ve elma severim.', { k: 'banana', ile: 'apple', kino: 'sev' }, [['I like', 'p'], ['bananas', 'c:banana'], ['and', 'p'], ['apples', 'c:apple']]),
    ]);
    const sever = (n: number, k: string, cogulu: string, tr: string): Sohbet =>
      ozelSoru(`yiyecekler-${n}`, `Do you like ${cogulu}?`, `${tr} sever misin?`, { k }, EVET_SEVERIM, { secenekler: [EVET_SEVERIM, HAYIR_SEVMEM], serbest: true });
    s.yiyecekler = {
      a, b,
      sohbet: { aciklama: 'Polly sana, sever misin diye soracak. Seversen yeşile, sevmezsen kırmızıya dokun.', turlar: [sever(1, 'apple', 'apples', 'Elma'), sever(2, 'banana', 'bananas', 'Muz'), sever(3, 'milk', 'milk', 'Süt'), sever(4, 'cheese', 'cheese', 'Peynir')] },
      kur: [b.ifadeler[0], a.ifadeler[1], b.ifadeler[1], a.ifadeler[3]],
      hikaye: {
        en: 'Kino is Hungry', tr: 'Kino Acıktı', giris: "Kino'nun karnı acıkmış. Bakalım ne yiyecek?",
        sayfalar: [
          sayfa('yiyecekler', 1, 'Kino is hungry.', 'Kino acıktı.'),
          sayfa('yiyecekler', 2, 'He eats an apple. Yummy!', 'Bir elma yiyor. Nefis!'),
          sayfa('yiyecekler', 3, 'He drinks milk. Yummy!', 'Süt içiyor. Nefis!'),
          sayfa('yiyecekler', 4, 'Now Kino is happy.', 'Şimdi Kino mutlu.'),
        ],
      },
    };
  }

  // 5 · Oyuncaklar: bende var
  {
    const a = kalip('I have a ball', 'Kino oyuncaklarını gösteriyor. Bende var demeyi öğreniyoruz.', [
      f('oyuncaklar-a1', 'I have a ball.', 'Bir topum var.', { k: 'ball', kino: 'tut' }, [['I have', 'p'], ['a ball', 'w:ball']]),
      f('oyuncaklar-a2', 'I have a kite.', 'Bir uçurtmam var.', { k: 'kite', kino: 'tut' }, [['I have', 'p'], ['a kite', 'w:kite']]),
      f('oyuncaklar-a3', 'I have a robot.', 'Bir robotum var.', { k: 'robot', kino: 'tut' }, [['I have', 'p'], ['a robot', 'w:robot']]),
      f('oyuncaklar-a4', 'I have a doll.', 'Bir bebeğim var.', { k: 'doll', kino: 'tut' }, [['I have', 'p'], ['a doll', 'w:doll']]),
    ]);
    const b = kalip('I have two balls', 'Kaç oyuncağı var? Şimdi sayısını da söylüyoruz.', [
      f('oyuncaklar-b1', 'I have two balls.', 'İki topum var.', { k: 'ball', adet: 2, kino: 'tut' }, [['I have', 'p'], ['two', 'w:two'], ['balls', 'c:ball']]),
      f('oyuncaklar-b2', 'I have three balls.', 'Üç topum var.', { k: 'ball', adet: 3, kino: 'tut' }, [['I have', 'p'], ['three', 'w:three'], ['balls', 'c:ball']]),
      f('oyuncaklar-b3', 'I have two robots.', 'İki robotum var.', { k: 'robot', adet: 2, kino: 'tut' }, [['I have', 'p'], ['two', 'w:two'], ['robots', 'c:robot']]),
      f('oyuncaklar-b4', 'I have three robots.', 'Üç robotum var.', { k: 'robot', adet: 3, kino: 'tut' }, [['I have', 'p'], ['three', 'w:three'], ['robots', 'c:robot']]),
    ]);
    s.oyuncaklar = {
      a, b,
      sohbet: { aciklama: "Polly Kino'ya, nen var diye soracak. Doğru cevaba dokun.", turlar: ayniSoru('what-do-you-have', 'What do you have?', 'Nen var?', a.ifadeler.map((x): [Gorsel, Ifade] => [x.g, x])) },
      kur: [
        f('oyuncaklar-k1', 'I have a big robot.', 'Büyük bir robotum var.', { k: 'robot', boy: 'big', kino: 'tut' }, [['I have', 'p'], ['a big', 'p'], ['robot', 'w:robot']]),
        f('oyuncaklar-k2', 'I have a small ball.', 'Küçük bir topum var.', { k: 'ball', boy: 'small', kino: 'tut' }, [['I have', 'p'], ['a small', 'p'], ['ball', 'w:ball']]),
        f('oyuncaklar-k3', 'I have two kites.', 'İki uçurtmam var.', { k: 'kite', adet: 2, kino: 'tut' }, [['I have', 'p'], ['two', 'w:two'], ['kites', 'c:kite']]),
        f('oyuncaklar-k4', 'I have a red ball.', 'Kırmızı bir topum var.', { ozel: 'renkli/ball-red', kino: 'tut' }, [['I have', 'p'], ['a red', 'w:red'], ['ball', 'w:ball']]),
      ],
      hikaye: {
        en: 'The Toy Box', tr: 'Oyuncak Kutusu', giris: "Kino'nun büyük bir kutusu var. İçinde neler var acaba?",
        sayfalar: [
          sayfa('oyuncaklar', 1, 'Kino has a big box.', "Kino'nun büyük bir kutusu var."),
          sayfa('oyuncaklar', 2, 'A ball is in the box.', 'Kutuda bir top var.'),
          sayfa('oyuncaklar', 3, 'A robot is in the box.', 'Kutuda bir robot var.'),
          sayfa('oyuncaklar', 4, "Let's play, Polly!", 'Hadi oynayalım Polly!'),
        ],
      },
    };
  }

  // 6 · Ailem: she / he · I love
  {
    const a = kalip('She · He', 'Kızlar ve erkekler için başka söz kullanırız. Dinle, farkı duy!', [
      f('ailem-a1', 'She is my mom.', 'O benim annem.', { k: 'mom' }, [['She is', 'p'], ['my mom', 'w:mom']]),
      f('ailem-a2', 'He is my dad.', 'O benim babam.', { k: 'dad' }, [['He is', 'p'], ['my dad', 'w:dad']]),
      f('ailem-a3', 'She is my sister.', 'O benim kız kardeşim.', { k: 'sister' }, [['She is', 'p'], ['my sister', 'w:sister']]),
      f('ailem-a4', 'He is my grandpa.', 'O benim dedem.', { k: 'grandpa' }, [['He is', 'p'], ['my grandpa', 'w:grandpa']]),
    ]);
    const b = kalip('I love', 'Şimdi çok seviyorum demeyi öğreniyoruz.', [
      f('ailem-b1', 'I love my mom.', 'Annemi çok seviyorum.', { k: 'mom', kalp: true }, [['I love', 'p'], ['my mom', 'w:mom']]),
      f('ailem-b2', 'I love my dad.', 'Babamı çok seviyorum.', { k: 'dad', kalp: true }, [['I love', 'p'], ['my dad', 'w:dad']]),
      f('ailem-b3', 'I love my grandma.', 'Babaannemi çok seviyorum.', { k: 'grandma', kalp: true }, [['I love', 'p'], ['my grandma', 'w:grandma']]),
      f('ailem-b4', 'I love my friend.', 'Arkadaşımı çok seviyorum.', { k: 'friend', kalp: true }, [['I love', 'p'], ['my friend', 'w:friend']]),
    ]);
    s.ailem = {
      a, b,
      sohbet: { aciklama: 'Polly, bu kim diye soracak. Doğru cevaba dokun.', turlar: ayniSoru('who-is-it', 'Who is it?', 'Bu kim?', a.ifadeler.map((x): [Gorsel, Ifade] => [x.g, x])) },
      kur: [a.ifadeler[1], a.ifadeler[2], b.ifadeler[0], b.ifadeler[2]],
      hikaye: {
        en: 'My Family', tr: 'Benim Ailem', giris: 'Kino bize ailesinin fotoğraflarını gösteriyor.',
        sayfalar: [
          sayfa('ailem', 1, 'This is my mom.', 'Bu benim annem.', { ses: 'en/c-mom' }),
          sayfa('ailem', 2, 'This is my dad.', 'Bu benim babam.', { ses: 'en/c-dad' }),
          sayfa('ailem', 3, 'This is my grandma.', 'Bu benim babaannem.', { ses: 'en/c-grandma' }),
          sayfa('ailem', 4, 'I love my family!', 'Ailemi çok seviyorum!'),
        ],
      },
    };
  }

  // 7 · Yüzüm: kaç tane · yap bakalım
  {
    const a = kalip('I have two eyes', 'Kaç gözün var, kaç burnun var? Sayarak söylüyoruz.', [
      f('yuzum-a1', 'I have two eyes.', 'İki gözüm var.', { k: 'eyes' }, [['I have', 'p'], ['two', 'w:two'], ['eyes', 'w:eyes']]),
      f('yuzum-a2', 'I have two ears.', 'İki kulağım var.', { k: 'ears' }, [['I have', 'p'], ['two', 'w:two'], ['ears', 'w:ears']]),
      f('yuzum-a3', 'I have one nose.', 'Bir burnum var.', { k: 'nose' }, [['I have', 'p'], ['one', 'w:one'], ['nose', 'w:nose']]),
      f('yuzum-a4', 'I have one mouth.', 'Bir ağzım var.', { k: 'mouth' }, [['I have', 'p'], ['one', 'w:one'], ['mouth', 'w:mouth']]),
    ]);
    const b = kalip('Close your eyes', 'Polly ne derse Kino onu yapıyor. Sen de onunla yap!', [
      f('yuzum-b1', 'Close your eyes.', 'Gözlerini kapat.', o('eylem/kino-close-eyes'), [['Close', 'p'], ['your eyes', 'w:eyes']]),
      f('yuzum-b2', 'Open your mouth.', 'Ağzını aç.', o('eylem/kino-open-mouth'), [['Open', 'p'], ['your mouth', 'w:mouth']]),
      f('yuzum-b3', 'Wash your hands.', 'Ellerini yıka.', o('eylem/kino-wash-hands'), [['Wash', 'p'], ['your hands', 'w:hands']]),
      f('yuzum-b4', 'Stamp your feet.', 'Ayaklarını yere vur.', o('eylem/kino-stamp-feet'), [['Stamp', 'p'], ['your feet', 'w:feet']], { ses: 'en/c-feet' }),
    ]);
    s.yuzum = {
      a, b,
      sohbet: { aciklama: 'Polly, bu ne diye soracak. Doğru cevaba dokun.', turlar: ayniSoru('what-is-it', 'What is it?', 'Bu ne?', [
        [{ k: 'nose' }, f('yuzum-s1', "It's my nose.", 'Bu benim burnum.', { k: 'nose' })],
        [{ k: 'mouth' }, f('yuzum-s2', "It's my mouth.", 'Bu benim ağzım.', { k: 'mouth' })],
        [{ k: 'eyes' }, f('yuzum-s3', 'They are my eyes.', 'Bunlar benim gözlerim.', { k: 'eyes' })],
        [{ k: 'ears' }, f('yuzum-s4', 'They are my ears.', 'Bunlar benim kulaklarım.', { k: 'ears' })],
      ]) },
      kur: [a.ifadeler[0], a.ifadeler[2], b.ifadeler[0], b.ifadeler[2]],
      hikaye: {
        en: 'Good Morning, Kino', tr: 'Günaydın Kino', giris: 'Sabah olmuş, Kino uyanıyor. Bakalım neler yapacak?',
        sayfalar: [
          sayfa('yuzum', 1, 'Good morning, Kino!', 'Günaydın Kino!'),
          sayfa('yuzum', 2, 'Wash your hands.', 'Ellerini yıka.', { ses: 'en/i-yuzum-b3' }),
          sayfa('yuzum', 3, 'Brush your teeth.', 'Dişlerini fırçala.'),
          sayfa('yuzum', 4, "Kino is ready. Let's go!", 'Kino hazır. Hadi gidelim!'),
        ],
      },
    };
  }

  // 8 · Kıyafetler: renk + kıyafet · büyük – küçük
  {
    const a = kalip('A red hat', 'Önce rengi, sonra kıyafeti söylüyoruz. Rengine iyi bak!', [
      f('kiyafetler-a1', 'A red hat.', 'Kırmızı bir şapka.', o('renkli/hat-red'), [['A red', 'w:red'], ['hat', 'w:hat']]),
      f('kiyafetler-a2', 'A blue hat.', 'Mavi bir şapka.', o('renkli/hat-blue'), [['A blue', 'w:blue'], ['hat', 'w:hat']]),
      f('kiyafetler-a3', 'Yellow socks.', 'Sarı çoraplar.', o('renkli/socks-yellow'), [['Yellow', 'w:yellow'], ['socks', 'w:socks']]),
      f('kiyafetler-a4', 'Green socks.', 'Yeşil çoraplar.', o('renkli/socks-green'), [['Green', 'w:green'], ['socks', 'w:socks']]),
    ]);
    const b = kalip('Big shoes', 'Bazı kıyafetler büyük, bazıları küçük. Hangisi, dinle!', [
      f('kiyafetler-b1', 'A big hat.', 'Büyük bir şapka.', { k: 'hat', boy: 'big' }, [['A big', 'p'], ['hat', 'w:hat']]),
      f('kiyafetler-b2', 'A small hat.', 'Küçük bir şapka.', { k: 'hat', boy: 'small' }, [['A small', 'p'], ['hat', 'w:hat']]),
      f('kiyafetler-b3', 'Big shoes.', 'Büyük ayakkabılar.', { k: 'shoes', boy: 'big' }, [['Big', 'p'], ['shoes', 'w:shoes']]),
      f('kiyafetler-b4', 'Small shoes.', 'Küçük ayakkabılar.', { k: 'shoes', boy: 'small' }, [['Small', 'p'], ['shoes', 'w:shoes']]),
    ]);
    s.kiyafetler = {
      a, b,
      sohbet: { aciklama: 'Polly, ne renk diye soracak. Doğru cevaba dokun.', turlar: ayniSoru('what-color', 'What color is it?', 'Ne renk?', [
        [o('renkli/hat-red'), kc('red')], [o('renkli/hat-blue'), kc('blue')], [o('renkli/socks-yellow'), kc('yellow')], [o('renkli/socks-green'), kc('green')],
      ]) },
      kur: [
        f('kiyafetler-k1', 'I have a red hat.', 'Kırmızı bir şapkam var.', { ozel: 'renkli/hat-red', kino: 'tut' }, [['I have', 'p'], ['a red', 'w:red'], ['hat', 'w:hat']]),
        f('kiyafetler-k2', 'I have green socks.', 'Yeşil çoraplarım var.', { ozel: 'renkli/socks-green', kino: 'tut' }, [['I have', 'p'], ['green', 'w:green'], ['socks', 'w:socks']]),
        f('kiyafetler-k3', 'Put on your shoes.', 'Ayakkabılarını giy.', { k: 'shoes' }, [['Put on', 'p'], ['your shoes', 'w:shoes']], { ses: 'en/c-shoes' }),
        f('kiyafetler-k4', 'Put on your jacket.', 'Ceketini giy.', { k: 'jacket' }, [['Put on', 'p'], ['your jacket', 'w:jacket']], { ses: 'en/c-jacket' }),
      ],
      hikaye: {
        en: "It's Cold!", tr: 'Hava Soğuk!', giris: 'Dışarıda kar yağıyor. Kino dışarı çıkmadan önce ne giyecek?',
        sayfalar: [
          sayfa('kiyafetler', 1, "It's cold today.", 'Bugün hava soğuk.'),
          sayfa('kiyafetler', 2, 'Put on your jacket, Kino.', 'Ceketini giy Kino.'),
          sayfa('kiyafetler', 3, 'Put on your hat, Kino.', 'Şapkanı giy Kino.'),
          sayfa('kiyafetler', 4, "Now Kino is warm. Let's play!", 'Şimdi Kino üşümüyor. Hadi oynayalım!'),
        ],
      },
    };
  }

  // 9 · Odam: üstünde – altında – içinde
  {
    const a = kalip('On · Under', 'Üstünde mi, altında mı? Resme bak ve dinle!', [
      f('odam-a1', 'The cat is on the bed.', 'Kedi yatağın üstünde.', o('yer/cat-on-bed'), [['The cat', 'w:cat'], ['is on', 'p'], ['the bed', 'w:bed']]),
      f('odam-a2', 'The cat is under the bed.', 'Kedi yatağın altında.', o('yer/cat-under-bed'), [['The cat', 'w:cat'], ['is under', 'p'], ['the bed', 'w:bed']]),
      f('odam-a3', 'The ball is on the table.', 'Top masanın üstünde.', o('yer/ball-on-table'), [['The ball', 'w:ball'], ['is on', 'p'], ['the table', 'w:table']]),
      f('odam-a4', 'The ball is under the table.', 'Top masanın altında.', o('yer/ball-under-table'), [['The ball', 'w:ball'], ['is under', 'p'], ['the table', 'w:table']]),
    ]);
    const b = kalip('In', 'Şimdi de içinde demeyi öğreniyoruz. Kutunun içinde ne var?', [
      f('odam-b1', 'The ball is in the box.', 'Top kutunun içinde.', o('yer/ball-in-box'), [['The ball', 'w:ball'], ['is in', 'p'], ['the box', 'w:box']]),
      f('odam-b2', 'The cat is in the box.', 'Kedi kutunun içinde.', o('yer/cat-in-box'), [['The cat', 'w:cat'], ['is in', 'p'], ['the box', 'w:box']]),
      f('odam-b3', 'The ball is on the chair.', 'Top sandalyenin üstünde.', o('yer/ball-on-chair'), [['The ball', 'w:ball'], ['is on', 'p'], ['the chair', 'w:chair']]),
      f('odam-b4', 'The cat is on the chair.', 'Kedi sandalyenin üstünde.', o('yer/cat-on-chair'), [['The cat', 'w:cat'], ['is on', 'p'], ['the chair', 'w:chair']]),
    ]);
    const nerede = (ses: string, en: string, tr: string, x: Ifade): Sohbet => ({ ses, en, tr, g: x.g, dogru: x });
    s.odam = {
      a, b,
      sohbet: { aciklama: 'Polly, nerede diye soracak. Doğru cevaba dokun.', turlar: [
        nerede('en/q-cat', 'Where is the cat?', 'Kedi nerede?', a.ifadeler[0]),
        nerede('en/q-ball', 'Where is the ball?', 'Top nerede?', a.ifadeler[3]),
        nerede('en/q-cat', 'Where is the cat?', 'Kedi nerede?', b.ifadeler[1]),
        nerede('en/q-ball', 'Where is the ball?', 'Top nerede?', b.ifadeler[2]),
      ] },
      kur: [a.ifadeler[0], a.ifadeler[3], b.ifadeler[1], b.ifadeler[2]],
      hikaye: {
        en: 'Where is the Cat?', tr: 'Kedi Nerede?', giris: 'Kino kedisini arıyor. Sen de onunla ara!',
        sayfalar: [
          sayfa('odam', 1, 'Where is the cat?', 'Kedi nerede?', { ses: 'en/q-cat' }),
          sayfa('odam', 2, 'Is it under the bed? No!', 'Yatağın altında mı? Hayır!'),
          sayfa('odam', 3, 'Is it on the chair? No!', 'Sandalyenin üstünde mi? Hayır!'),
          sayfa('odam', 4, 'The cat is in the box!', 'Kedi kutunun içinde!', { ses: 'en/i-odam-b2' }),
        ],
      },
    };
  }

  // 10 · Taşıtlar: görüyorum + sayı · ile gidiyorum
  {
    const a = kalip('I see two cars', 'Kino yolda taşıtları sayıyor. Kaç tane görüyor, dinle!', [
      f('tasitlar-a1', 'I see two cars.', 'İki araba görüyorum.', { k: 'car', adet: 2 }, [['I see', 'p'], ['two', 'w:two'], ['cars', 'c:car']]),
      f('tasitlar-a2', 'I see three cars.', 'Üç araba görüyorum.', { k: 'car', adet: 3 }, [['I see', 'p'], ['three', 'w:three'], ['cars', 'c:car']]),
      f('tasitlar-a3', 'I see two planes.', 'İki uçak görüyorum.', { k: 'plane', adet: 2 }, [['I see', 'p'], ['two', 'w:two'], ['planes', 'c:plane']]),
      f('tasitlar-a4', 'I see three planes.', 'Üç uçak görüyorum.', { k: 'plane', adet: 3 }, [['I see', 'p'], ['three', 'w:three'], ['planes', 'c:plane']]),
    ]);
    const b = kalip('I go by bus', 'Kino yolculuğa çıkıyor. Neyle gidiyor, dinle!', [
      f('tasitlar-b1', 'I go by bus.', 'Otobüsle gidiyorum.', o('eylem/kino-by-bus'), [['I go', 'p'], ['by bus', 'w:bus']]),
      f('tasitlar-b2', 'I go by train.', 'Trenle gidiyorum.', o('eylem/kino-by-train'), [['I go', 'p'], ['by train', 'w:train']]),
      f('tasitlar-b3', 'I go by boat.', 'Tekneyle gidiyorum.', o('eylem/kino-by-boat'), [['I go', 'p'], ['by boat', 'w:boat']]),
      f('tasitlar-b4', 'I go by bike.', 'Bisikletle gidiyorum.', o('eylem/kino-by-bike'), [['I go', 'p'], ['by bike', 'w:bike']]),
    ]);
    s.tasitlar = {
      a, b,
      sohbet: { aciklama: 'Polly, ne görüyorsun diye soracak. Doğru cevaba dokun.', turlar: ayniSoru('what-do-you-see', 'What do you see?', 'Ne görüyorsun?', ['car', 'bus', 'train', 'plane'].map((k): [Gorsel, Ifade] => [{ k }, kc(k)])) },
      kur: [
        f('tasitlar-k1', 'I see a big bus.', 'Büyük bir otobüs görüyorum.', { k: 'bus', boy: 'big' }, [['I see', 'p'], ['a big', 'p'], ['bus', 'w:bus']]),
        f('tasitlar-k2', 'I see a small car.', 'Küçük bir araba görüyorum.', { k: 'car', boy: 'small' }, [['I see', 'p'], ['a small', 'p'], ['car', 'w:car']]),
        f('tasitlar-k3', 'I see two boats.', 'İki tekne görüyorum.', { k: 'boat', adet: 2 }, [['I see', 'p'], ['two', 'w:two'], ['boats', 'c:boat']]),
        b.ifadeler[1],
      ],
      hikaye: {
        en: "Kino's Trip", tr: "Kino'nun Yolculuğu", giris: 'Kino uzun bir yolculuğa çıkıyor. Bakalım kime gidiyor?',
        sayfalar: [
          sayfa('tasitlar', 1, 'Kino is on the bus.', 'Kino otobüste.'),
          sayfa('tasitlar', 2, 'Kino is on the train.', 'Kino trende.'),
          sayfa('tasitlar', 3, 'Kino is on the boat.', 'Kino teknede.'),
          sayfa('tasitlar', 4, 'Hello, Grandma! Hello, Grandpa!', 'Merhaba babaanne! Merhaba dede!'),
        ],
      },
    };
  }

  // 11 · Hareketler: şimdi ne yapıyor
  {
    const a = kalip('Kino is jumping', 'Kino şimdi ne yapıyor? Resme bak ve dinle!', [
      f('hareketler-a1', 'Kino is jumping.', 'Kino zıplıyor.', { k: 'jump' }, [['Kino', 'r:kisi/kino-0'], ['is jumping', 'w:jump']]),
      f('hareketler-a2', 'Kino is running.', 'Kino koşuyor.', { k: 'run' }, [['Kino', 'r:kisi/kino-0'], ['is running', 'w:run']]),
      f('hareketler-a3', 'Kino is sleeping.', 'Kino uyuyor.', { k: 'sleep' }, [['Kino', 'r:kisi/kino-0'], ['is sleeping', 'w:sleep']]),
      f('hareketler-a4', 'Kino is eating.', 'Kino yemek yiyor.', { k: 'eat' }, [['Kino', 'r:kisi/kino-0'], ['is eating', 'w:eat']]),
    ]);
    const b = kalip('The cat is sleeping', 'Şimdi hayvanlar ne yapıyor? Dinle ve bak!', [
      f('hareketler-b1', 'The cat is sleeping.', 'Kedi uyuyor.', o('eylem/cat-sleeping'), [['The cat', 'w:cat'], ['is sleeping', 'w:sleep']]),
      f('hareketler-b2', 'The dog is running.', 'Köpek koşuyor.', o('eylem/dog-running'), [['The dog', 'w:dog'], ['is running', 'w:run']]),
      f('hareketler-b3', 'The duck is eating.', 'Ördek yemek yiyor.', o('eylem/duck-eating'), [['The duck', 'w:duck'], ['is eating', 'w:eat']]),
      f('hareketler-b4', 'The horse is jumping.', 'At zıplıyor.', o('eylem/horse-jumping'), [['The horse', 'w:horse'], ['is jumping', 'w:jump']]),
    ]);
    s.hareketler = {
      a, b,
      sohbet: { aciklama: 'Polly, Kino ne yapıyor diye soracak. Doğru cevaba dokun.', turlar: ayniSoru('what-is-kino-doing', 'What is Kino doing?', 'Kino ne yapıyor?', a.ifadeler.map((x): [Gorsel, Ifade] => [x.g, x])) },
      kur: [a.ifadeler[0], a.ifadeler[2], b.ifadeler[0], b.ifadeler[1]],
      hikaye: {
        en: "Kino's Day", tr: "Kino'nun Günü", giris: 'Kino bugün hiç durmuyor. Bakalım gün boyu neler yapıyor?',
        sayfalar: [
          sayfa('hareketler', 1, 'Kino is running.', 'Kino koşuyor.', { ses: 'en/i-hareketler-a2' }),
          sayfa('hareketler', 2, 'Kino is eating.', 'Kino yemek yiyor.', { ses: 'en/i-hareketler-a4' }),
          sayfa('hareketler', 3, 'Kino is drinking.', 'Kino su içiyor.'),
          sayfa('hareketler', 4, 'Kino is sleeping. Good night, Kino!', 'Kino uyuyor. İyi geceler Kino!'),
        ],
      },
    };
  }

  // 12 · Vahşi hayvanlar: büyük – küçük · yapabilir
  {
    const a = kalip('The elephant is big', 'Fil büyük, kurbağa küçük. Dinle, hangisi?', [
      f('vahsi-a1', 'The elephant is big.', 'Fil büyük.', { k: 'elephant', boy: 'big' }, [['The elephant', 'w:elephant'], ['is', 'p'], ['big', 'p']]),
      f('vahsi-a2', 'The frog is small.', 'Kurbağa küçük.', { k: 'frog', boy: 'small' }, [['The frog', 'w:frog'], ['is', 'p'], ['small', 'p']]),
      f('vahsi-a3', 'The lion is big.', 'Aslan büyük.', { k: 'lion', boy: 'big' }, [['The lion', 'w:lion'], ['is', 'p'], ['big', 'p']]),
      f('vahsi-a4', 'The bird is small.', 'Kuş küçük.', { k: 'bird', boy: 'small' }, [['The bird', 'w:bird'], ['is', 'p'], ['small', 'p']]),
    ]);
    const b = kalip('The fish can swim', 'Hangi hayvan ne yapabilir? Resme bak ve dinle!', [
      f('vahsi-b1', 'The fish can swim.', 'Balık yüzebilir.', o('eylem/fish-swimming'), [['The fish', 'w:fish'], ['can', 'p'], ['swim', 'p']]),
      f('vahsi-b2', 'The bird can fly.', 'Kuş uçabilir.', o('eylem/bird-flying'), [['The bird', 'w:bird'], ['can', 'p'], ['fly', 'p']]),
      f('vahsi-b3', 'The frog can jump.', 'Kurbağa zıplayabilir.', o('eylem/frog-jumping'), [['The frog', 'w:frog'], ['can', 'p'], ['jump', 'w:jump']]),
      f('vahsi-b4', 'The monkey can climb.', 'Maymun tırmanabilir.', o('eylem/monkey-climbing'), [['The monkey', 'w:monkey'], ['can', 'p'], ['climb', 'p']]),
    ]);
    const buyukMu = (n: number, k: string, en: string, tr: string, boy: 'big' | 'small', evet: boolean): Sohbet =>
      ozelSoru(`vahsi-${n}`, en, tr, { k, boy }, evet ? EVET_OYLE : HAYIR_DEGIL, { secenekler: [EVET_OYLE, HAYIR_DEGIL] });
    s.vahsi = {
      a, b,
      sohbet: { aciklama: 'Polly soracak. Doğruysa yeşile, yanlışsa kırmızıya dokun.', turlar: [
        buyukMu(1, 'elephant', 'Is the elephant big?', 'Fil büyük mü?', 'big', true),
        buyukMu(2, 'frog', 'Is the frog big?', 'Kurbağa büyük mü?', 'small', false),
        buyukMu(3, 'bird', 'Is the bird small?', 'Kuş küçük mü?', 'small', true),
        buyukMu(4, 'lion', 'Is the lion small?', 'Aslan küçük mü?', 'big', false),
      ] },
      kur: [
        f('vahsi-k1', 'I see a big lion.', 'Büyük bir aslan görüyorum.', { k: 'lion', boy: 'big' }, [['I see', 'p'], ['a big', 'p'], ['lion', 'w:lion']]),
        a.ifadeler[0], b.ifadeler[0], b.ifadeler[2],
      ],
      hikaye: {
        en: 'In the Jungle', tr: 'Ormanda', giris: 'Kino ormanda geziyor. Sessiz ol, hayvanlar yakında!',
        sayfalar: [
          sayfa('vahsi', 1, 'Kino is in the jungle.', 'Kino ormanda.'),
          sayfa('vahsi', 2, 'He sees a big elephant.', 'Büyük bir fil görüyor.'),
          sayfa('vahsi', 3, 'He sees a small frog.', 'Küçük bir kurbağa görüyor.'),
          sayfa('vahsi', 4, 'The frog can jump. Jump, Kino, jump!', 'Kurbağa zıplayabilir. Zıpla Kino, zıpla!'),
        ],
      },
    };
  }

  return s;
}

export const ILERISI: Record<string, Ilerisi> = {
  ...kur(),
  // 13–24. adalar (icerik3.ts): kurucular buradan verilir
  ...yeniIlerisi({ f, kalip, kc, sayfa, o, ayniSoru, ozelSoru, EVET_OYLE, HAYIR_DEGIL, EVET_SEVERIM, HAYIR_SEVMEM }),
};
export const ilerisi = (u: Unite): Ilerisi => ILERISI[u.id];

/** Ders başlıkları (ada panelinde ve ders üstünde görünür) */
export const DERS_ADI: Record<DersNo, string> = {
  0: '1. ders', 1: '2. ders', 2: 'Şenlik', 3: 'Yeni cümleler', 4: 'Yeni cümleler', 5: 'Cümle şenliği', 6: 'Soru – cevap', 7: 'Cümle kur', 8: 'Hikâye',
};
/** Dersin adı; Çiftlik adasının ilk üç dersi hayvan dersleridir ve hayvan sayısıyla anılır (12 · 30 · 100) */
export const dersAdi = (uniteId: string, no: number): string =>
  uniteId === 'ciftlik' && no <= 2 ? ['12 hayvan', '30 hayvan', '100 hayvan'][no] : DERS_ADI[no as keyof typeof DERS_ADI];
export const SEVIYE_ADI: Record<1 | 2 | 3, string> = { 1: 'Kelimeler', 2: 'Cümleler', 3: 'Konuşma' };

// ---------------------------------------------------------------- ortak sözler (Seviye 2 ve 3)

/** Polly'nin Seviye 2 ve 3'te kullandığı ortak sorular ve cevaplar (en/g-<ad>) */
export const POLLY_SOZLERI2: Record<string, [metin: string, hece: number]> = {
  'what-color': ['What color is it?', 5],
  'what-do-you-have': ['What do you have?', 4],
  'what-do-you-see': ['What do you see?', 4],
  'what-is-kino-doing': ['What is Kino doing?', 6],
  'yes-i-do': ['Yes, I do.', 3],
  'no-i-dont': ["No, I don't.", 3],
  'yes-it-is': ['Yes, it is.', 3],
  'no-it-isnt': ["No, it isn't.", 4],
  'story-time': ['Story time!', 3],
  'the-end': ['The end!', 2],
  // selamlaşmanın günlük sözleri (plan.ts → Rutin)
  'how-are-you': ['How are you?', 3],
  'im-fine': ["I'm fine, thank you!", 4],
  'whats-your-name': ["What's your name?", 3],
  'my-name-is-polly': ['My name is Polly.', 5],
  'how-old-are-you': ['How old are you?', 4],
  'im-three': ["I'm three.", 2],
  // Kino'yu Giydir (kıyafetler adası): Polly'nin komutları ve fotoğraf anı
  'put-on-hat': ['Put on the hat!', 4],
  'put-on-shoes': ['Put on the shoes!', 4],
  'put-on-socks': ['Put on the socks!', 4],
  'put-on-t-shirt': ['Put on the T-shirt!', 5],
  'put-on-pants': ['Put on the pants!', 4],
  'put-on-jacket': ['Put on the jacket!', 5],
  'put-on-dress': ['Put on the dress!', 4],
  'put-on-scarf': ['Put on the scarf!', 4],
  'kino-ready': ['Wow! Kino is ready!', 5],
  'say-cheese': ['Say cheese!', 3],
  // Masal Oyunu (masal-oyun.ts): sayfa sorusunun girişi; soruların kendisi aşağıda masalSorusuSozleri'nden
  'find-the-picture': ['Find the picture!', 4],
  // Şakacı Polly (adimlar/sasirt.ts)
  'oops-silly-polly': ['Oops! Silly Polly!', 5],
  'look-again': ['Hmm… look again!', 4],
  ...masalSorusuSozleri(),
  // Hayvanat Bahçesi'nin bölümleri ve kapanışı (Çiftlik adası, 3. ders)
  'bahce-deniz': ['The sea!', 2],
  'bahce-kus': ['Birds!', 1],
  'bahce-bocek': ['Bugs!', 1],
  'bahce-orman': ['The forest!', 3],
  'bahce-vahsi': ['Wild animals!', 4],
  'bahce-yavru': ['Baby animals!', 4],
  'yuz-hayvan': ['One hundred animals!', 6],
  // 13–24. adaların ortak soruları (icerik3.ts)
  ...YENI_POLLY_SOZLERI2,
};

/** Ceren Öğretmen'in Seviye 2 ve 3 yönergeleri (tr/c-<ad>; her biri ayrı kayıt, en çok üç kısa cümle) */
export const CEREN_SOZLERI2: Record<string, string> = {
  'tarif-giris': "Polly'yi dinle. Söylediği hangisi, ona dokun.",
  'kur-giris': "Şimdi cümle kuruyoruz. Polly'yi dinle, parçalara sırayla dokun.",
  'senlik2-giris': 'Cümle şenliği! Öğrendiğimiz cümlelerle oynayalım.',
  'hikaye-giris': 'Hikâye zamanı! Polly anlatacak, sen resimlere bak.',
  'hikaye-bul': 'Şimdi Polly bir cümle söyleyecek. Hangi resim, sen göster.',
  'sirala-giris': 'Hikâyeyi sıraya dizelim. Önce ne oldu? Resimlere sırayla dokun.',
  'cumle-bitti': 'Bugün yeni cümleler öğrendin.',
  'konusma-bitti': 'Artık İngilizce konuşuyorsun. Harikasın!',
  'hikaye-bitti': 'Bir hikâyeyi İngilizce dinledin. Aferin sana!',
  // yeni oyunlar (17 Kasım gece)
  'dogrumu-giris': 'Polly bir cümle söyleyecek. Resme uyuyorsa yeşile, uymuyorsa kırmızıya dokun.',
  'yakala-giris': 'Polly dürbünüyle bakıyor. Söylediği resim gelince hemen dokun!',
  'soyle2-giris': 'Şimdi sıra sende. Polly söylesin, sen de onun gibi söyle.',
  'anlat-sen': 'Şimdi hikâyeyi sen anlat. Polly söylesin, sen de onun gibi söyle.',
  'saykoy-giris': 'Polly kaç tane istiyor, dinle. O kadarını tepsiye koy, sonra yeşile dokun.',
  'posta-giris': 'Polly mektup getirdi. Mektup kimin, dinle. Onu doğru eve götür.',
  'giydir-giris': "Kino giyinmek istiyor. Polly'yi dinle, söylediği giysiye dokun.",
  'masal-giris': 'Burası masal kitaplığı. Bir kitaba dokun, Polly sana okusun.',
  'masal-kilitli': 'Bu masal, adasının kelimelerini öğrenince açılır.',
  'gecit-giris': 'Hayvanlar geliyor! Gölgesine dokun, kim olduğunu gör.',
  'sasirt-giris': 'Polly bazen şaka yapar! Doğru söylerse yeşile, yanlış söylerse kırmızıya dokun.',
  'masal-oyun-giris': 'Şimdi masal oyunu! Polly masalla ilgili soracak, doğru resme dokun.',
  'bahce-giris': 'Hayvanat bahçesine hoş geldin! Polly hayvanları tanıtacak, sonra sana soracak.',
  'sensor-giris': 'Şimdi sen sor, Polly cevap versin.',
  'rutin-nasilsin': 'Polly sana nasılsın diye soruyor. Hadi, onun gibi cevap ver.',
  'rutin-adin': 'Polly adını soruyor. Sen de kendi adını söyle.',
  'rutin-yasin': 'Polly kaç yaşında olduğunu soruyor. Sen de kendi yaşını söyle.',
};

// ---------------------------------------------------------------- ders içerikleri ve ses listeleri

const tekil = <T extends { id: string }>(liste: T[]): T[] => [...new Map(liste.map((x) => [x.id, x])).values()];

/** Dersin kullandığı ifadeler (resim ve ses hazırlığı denetimi için); Seviye 1 derslerinde boş */
export function dersIfadeleri(u: Unite, no: DersNo): Ifade[] {
  const x = ILERISI[u.id];
  if (!x || no < 3) return [];
  switch (no) {
    case 3: return x.a.ifadeler;
    case 4: return x.b.ifadeler;
    case 5: return [...x.a.ifadeler, ...x.b.ifadeler];
    case 6: return tekil(x.sohbet.turlar.flatMap((t) => [t.dogru, ...(t.secenekler ?? [])]));
    case 7: return x.kur;
    default: return x.hikaye.sayfalar;
  }
}

/** Dersin kullandığı resim tarifleri (ifadelerin ve soru turlarının) */
export function dersGorselleri(u: Unite, no: DersNo): Gorsel[] {
  const x = ILERISI[u.id];
  if (!x || no < 3) return [];
  const ifadeler = dersIfadeleri(u, no);
  return [...ifadeler.map((i) => i.g), ...(no === 6 ? x.sohbet.turlar.map((t) => t.g) : []), ...ifadeler.flatMap((i) => i.parcalar.flatMap((p) => (p.g ? [p.g] : [])))];
}

/** Dersin Ceren açıklaması (tr/d-<ünite>-<a|b|s|h>); cümle şenliği ve cümle kurma ortak yönergeyi kullanır */
export function dersAciklamasi(u: Unite, no: DersNo): string | undefined {
  return no === 3 ? `tr/d-${u.id}-a` : no === 4 ? `tr/d-${u.id}-b` : no === 6 ? `tr/d-${u.id}-s` : no === 8 ? `tr/d-${u.id}-h` : undefined;
}

/** Dersin çalabileceği bütün ses kimlikleri (hazırlık denetimi ve ön yükleme) */
export function dersSesKimlikleri(u: Unite, no: DersNo): string[] {
  const x = ILERISI[u.id];
  if (!x || no < 3) return [];
  const ifadeler = dersIfadeleri(u, no);
  const idler = new Set<string>();
  for (const i of ifadeler) {
    idler.add(i.ses);
    if (i.yavas && (no === 3 || no === 4)) idler.add(i.yavas);
    for (const p of i.parcalar) idler.add(p.ses);
  }
  if (no === 6) for (const t of x.sohbet.turlar) idler.add(t.ses);
  const aciklama = dersAciklamasi(u, no);
  if (aciklama) idler.add(aciklama);
  return [...idler];
}

const TR_HECE = (metin: string) => (metin.match(/[aeıioöuüAEIİOÖUÜ]/g) ?? []).length;
const EN_HECE = (metin: string) => metin.toLowerCase().replace(/[^a-z' ]/g, ' ').split(/\s+/).filter(Boolean)
  .reduce((t, s) => t + Math.max(1, (s.replace(/e\b/, '').match(/[aeiouy]+/g) ?? []).length), 0);
const polly = (id: string, metin: string, yavas = false): SesMetni => ({ id, kim: 'polly', dil: 'en', metin, hece: EN_HECE(metin), ...(yavas ? { yavas: true as const } : {}) });
const ceren = (id: string, metin: string): SesMetni => ({ id, kim: 'ceren', dil: 'tr', metin, hece: TR_HECE(metin) });
const buyukBas = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Bir ünitenin Seviye 2 ve 3 kayıtları (yalnız bu dosyaya özgü olanlar; kelime kayıtları icerik.ts'ten gelir) */
export function ilerisiSesleri(u: Unite): SesMetni[] {
  const x = ILERISI[u.id];
  if (!x) return [];
  const liste: SesMetni[] = [
    ceren(`tr/d-${u.id}-a`, x.a.aciklama), ceren(`tr/d-${u.id}-b`, x.b.aciklama), ceren(`tr/d-${u.id}-s`, x.sohbet.aciklama), ceren(`tr/d-${u.id}-h`, x.hikaye.giris),
  ];
  const ifadeler = tekil([...x.a.ifadeler, ...x.b.ifadeler, ...x.kur, ...x.hikaye.sayfalar, ...x.sohbet.turlar.flatMap((t) => [t.dogru, ...(t.secenekler ?? [])])]);
  for (const i of ifadeler) {
    if (i.ses === `en/i-${i.id}`) liste.push(polly(i.ses, i.en));
    if (i.yavas) liste.push(polly(i.yavas, i.en, true));
  }
  for (const t of x.sohbet.turlar) if (t.ses.startsWith('en/s-')) liste.push(polly(t.ses, t.en));
  return tekil(liste);
}

/** Cümle taşlarının kayıtları (bütün ünitelerde ortak: "I see", "and", "ducks" …) */
export function parcaSesleri(): SesMetni[] {
  const liste: SesMetni[] = [];
  for (const u of UNITELER) {
    const x = ILERISI[u.id];
    if (!x) continue;
    for (const i of [...x.a.ifadeler, ...x.b.ifadeler, ...x.kur]) {
      for (const p of i.parcalar) if (p.ses.startsWith('en/p-')) liste.push(polly(p.ses, `${buyukBas(p.en)}.`));
    }
  }
  return tekil(liste);
}

/** Seviye 2 ve 3'ün üniteden bağımsız ortak kayıtları */
export function ortakSesler2(): SesMetni[] {
  return [
    ...Object.entries(POLLY_SOZLERI2).map(([ad, [metin, hece]]): SesMetni => ({ id: `en/g-${ad}`, kim: 'polly', dil: 'en', metin, hece })),
    ...Object.entries(CEREN_SOZLERI2).map(([ad, metin]) => ceren(`tr/c-${ad}`, metin)),
    ...parcaSesleri(),
  ];
}
