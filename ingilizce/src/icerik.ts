/**
 * Ceren Öğretmen ile İngilizceye Merhaba · müfredat (Seviye 1: 24 ünite × 8 kelime = 192 kelime; 13–24. adalar icerik3.ts).
 * Seviye 2 (cümleler) ve Seviye 3 (konuşma, cümle kurma, hikâye) içeriği: icerik2.ts.
 *
 * TEK KAYNAK: kelimeler, cümle kalıpları ve seslendirilecek bütün metinler buradan türetilir
 * (ses üretimi: scripts/ingilizce-ses.ts, üretim durumu: scripts/ingilizce-uretim.ts).
 * Dosya adları kelimenin `id`'sinden gelir: çizim assets/ingilizce/kelime/<id>.webp,
 * sesler assets/ingilizce/ses/en/w-<id>.mp3 (kelime), w-<id>-yavas, c-<id> (cümle), q-<id> (bulma sorusu),
 * y-<id> (evet/hayır sorusu); Türkçesi tr/k-<id>.
 */

import { YENI_UNITELER } from './icerik3';

export type Tur = 'tekil' | 'cogul' | 'sayilamaz' | 'renk' | 'sayi' | 'kisi' | 'eylem';

export interface Kelime {
  id: string;
  en: string;
  tr: string;
  tur: Tur;
  /** "an apple" */
  an?: true;
  /** tanışmada önce sesi gelir (assets/ingilizce/ses/efekt/<id>.mp3) */
  efekt?: true;
  /** İngilizce hece sayısı (ses kaydının süresi denetlenirken kullanılır) */
  hece: number;
  /**
   * Ünitenin 7. ve 8. kelimesi (17 Kasım 2026'da eklendi: derste 3 yerine 4 kelime). Çizimi ve sesi gelene kadar
   * derslerde, albümde ve oyunlarda görünmez (varlik.ts → kelimeAcik); ünite geri kalan kelimeleriyle açık kalır.
   */
  ek?: true;
  /** düzensiz çoğul ("sheep", "buses"); yoksa sonuna s gelir */
  cogulu?: string;
  /** kalıp dışı cümleler */
  c?: string;
  q?: string;
  y?: string;
}

export interface Unite {
  id: string;
  no: number;
  en: string;
  tr: string;
  /** ünitenin pastel rengi (ada etiketi, ders zemini) */
  renk: string;
  /** tanışmada resmin içinden çıktığı kapak: 'ahir' (kapılı ahır) ya da 'kutu' (sürpriz kutusu) */
  kapak: 'ahir' | 'kutu';
  /** Ceren'in ünite girişi (Türkçe, tek kısa cümle) */
  giris: string;
  /** ilk dördü 1. dersin, son dördü 2. dersin kelimeleri; 3. ders (şenlik) hepsini birleştirir */
  kelimeler: Kelime[];
}

const k = (id: string, en: string, tr: string, tur: Tur, hece: number, ek: Partial<Kelime> = {}): Kelime => ({ id, en, tr, tur, hece, ...ek });

export const UNITELER: Unite[] = [
  {
    id: 'ciftlik', no: 1, en: 'Farm', tr: 'Çiftlik', renk: '#bfe3a4', kapak: 'ahir',
    giris: 'Bugün çiftliğe gidiyoruz. Bakalım ahırda kimler var?',
    kelimeler: [
      k('sheep', 'sheep', 'koyun', 'tekil', 1, { efekt: true, cogulu: 'sheep' }),
      k('cow', 'cow', 'inek', 'tekil', 1, { efekt: true }),
      k('duck', 'duck', 'ördek', 'tekil', 1, { efekt: true }),
      k('cat', 'cat', 'kedi', 'tekil', 1, { efekt: true }),
      k('dog', 'dog', 'köpek', 'tekil', 1, { efekt: true }),
      k('horse', 'horse', 'at', 'tekil', 1, { efekt: true }),
      k('chicken', 'chicken', 'tavuk', 'tekil', 2, { efekt: true, ek: true }),
      k('pig', 'pig', 'domuz', 'tekil', 1, { efekt: true, ek: true }),
    ],
  },
  {
    id: 'renkler', no: 2, en: 'Colors', tr: 'Renkler', renk: '#f9c6d3', kapak: 'kutu',
    giris: 'Bugün boyalarımızı açıyoruz. Hangi renkler çıkacak?',
    kelimeler: [
      k('red', 'red', 'kırmızı', 'renk', 1),
      k('blue', 'blue', 'mavi', 'renk', 1),
      k('yellow', 'yellow', 'sarı', 'renk', 2),
      k('green', 'green', 'yeşil', 'renk', 1),
      k('orange', 'orange', 'turuncu', 'renk', 2),
      k('pink', 'pink', 'pembe', 'renk', 1),
      k('purple', 'purple', 'mor', 'renk', 2, { ek: true }),
      k('black', 'black', 'siyah', 'renk', 1, { ek: true }),
    ],
  },
  {
    id: 'sayilar', no: 3, en: 'Numbers', tr: 'Sayılar', renk: '#ffe08a', kapak: 'kutu',
    giris: 'Bugün İngilizce saymayı öğreniyoruz.',
    kelimeler: [
      k('one', 'one', 'bir', 'sayi', 1),
      k('two', 'two', 'iki', 'sayi', 1),
      k('three', 'three', 'üç', 'sayi', 1),
      k('four', 'four', 'dört', 'sayi', 1),
      k('five', 'five', 'beş', 'sayi', 1),
      k('six', 'six', 'altı', 'sayi', 1),
      k('seven', 'seven', 'yedi', 'sayi', 2, { ek: true }),
      k('eight', 'eight', 'sekiz', 'sayi', 1, { ek: true }),
    ],
  },
  {
    id: 'yiyecekler', no: 4, en: 'Food', tr: 'Yiyecekler', renk: '#ffc9a3', kapak: 'kutu',
    giris: 'Karnımız acıktı. Sepette neler var, bakalım.',
    kelimeler: [
      k('apple', 'apple', 'elma', 'tekil', 2, { an: true, c: 'I like apples.' }),
      k('banana', 'banana', 'muz', 'tekil', 3, { c: 'I like bananas.' }),
      k('pear', 'pear', 'armut', 'tekil', 1, { c: 'I like pears.' }),
      k('milk', 'milk', 'süt', 'sayilamaz', 1, { c: 'I like milk.' }),
      k('bread', 'bread', 'ekmek', 'sayilamaz', 1, { c: 'I like bread.' }),
      k('cheese', 'cheese', 'peynir', 'sayilamaz', 1, { c: 'I like cheese.' }),
      k('egg', 'egg', 'yumurta', 'tekil', 1, { an: true, c: 'I like eggs.', ek: true }),
      k('water', 'water', 'su', 'sayilamaz', 2, { c: 'I like water.', ek: true }),
    ],
  },
  {
    id: 'oyuncaklar', no: 5, en: 'Toys', tr: 'Oyuncaklar', renk: '#c9c2f0', kapak: 'kutu',
    giris: 'Oyuncak kutusunu açıyoruz!',
    kelimeler: [
      k('ball', 'ball', 'top', 'tekil', 1, { c: "It's my ball." }),
      k('teddy-bear', 'teddy bear', 'oyuncak ayı', 'tekil', 3, { c: "It's my teddy bear." }),
      k('doll', 'doll', 'bebek', 'tekil', 1, { c: "It's my doll." }),
      k('kite', 'kite', 'uçurtma', 'tekil', 1, { c: "It's my kite." }),
      k('robot', 'robot', 'robot', 'tekil', 2, { c: "It's my robot." }),
      k('drum', 'drum', 'davul', 'tekil', 1, { c: "It's my drum." }),
      k('balloon', 'balloon', 'balon', 'tekil', 2, { c: "It's my balloon.", ek: true }),
      k('puzzle', 'puzzle', 'yapboz', 'tekil', 2, { c: "It's my puzzle.", ek: true }),
    ],
  },
  {
    id: 'ailem', no: 6, en: 'My Family', tr: 'Ailem', renk: '#ffd2ab', kapak: 'kutu',
    giris: "Kino bize ailesini tanıtacak.",
    kelimeler: [
      k('mom', 'mom', 'anne', 'kisi', 1),
      k('dad', 'dad', 'baba', 'kisi', 1),
      k('sister', 'sister', 'kız kardeş', 'kisi', 2),
      k('grandma', 'grandma', 'babaanne', 'kisi', 2),
      k('grandpa', 'grandpa', 'dede', 'kisi', 2),
      k('friend', 'friend', 'arkadaş', 'kisi', 1),
      k('family', 'family', 'aile', 'kisi', 3, { cogulu: 'families', ek: true }),
      k('teacher', 'teacher', 'öğretmen', 'kisi', 2, { ek: true }),
    ],
  },
  {
    id: 'yuzum', no: 7, en: 'My Body', tr: 'Yüzüm', renk: '#f8c8a8', kapak: 'kutu',
    giris: "Bugün Kino'nun yüzüne bakıyoruz.",
    kelimeler: [
      k('eyes', 'eyes', 'gözler', 'cogul', 1, { c: 'Touch your eyes.' }),
      k('ears', 'ears', 'kulaklar', 'cogul', 1, { c: 'Touch your ears.' }),
      k('nose', 'nose', 'burun', 'tekil', 1, { c: 'Touch your nose.' }),
      k('mouth', 'mouth', 'ağız', 'tekil', 1, { c: 'Touch your mouth.' }),
      k('hands', 'hands', 'eller', 'cogul', 1, { c: 'Clap your hands.' }),
      k('feet', 'feet', 'ayaklar', 'cogul', 1, { c: 'Stamp your feet.' }),
      k('head', 'head', 'baş', 'tekil', 1, { c: 'Touch your head.', ek: true }),
      k('legs', 'legs', 'bacaklar', 'cogul', 1, { c: 'Touch your legs.', ek: true }),
    ],
  },
  {
    id: 'kiyafetler', no: 8, en: 'Clothes', tr: 'Kıyafetler', renk: '#a9d8c4', kapak: 'kutu',
    giris: 'Kino giyiniyor. Dolapta neler var?',
    kelimeler: [
      k('hat', 'hat', 'şapka', 'tekil', 1, { c: 'Put on your hat.' }),
      k('shoes', 'shoes', 'ayakkabılar', 'cogul', 1, { c: 'Put on your shoes.' }),
      k('socks', 'socks', 'çoraplar', 'cogul', 1, { c: 'Put on your socks.' }),
      k('t-shirt', 'T-shirt', 'tişört', 'tekil', 2, { c: 'Put on your T-shirt.' }),
      k('pants', 'pants', 'pantolon', 'cogul', 1, { c: 'Put on your pants.' }),
      k('jacket', 'jacket', 'ceket', 'tekil', 2, { c: 'Put on your jacket.' }),
      k('dress', 'dress', 'elbise', 'tekil', 1, { c: 'Put on your dress.', cogulu: 'dresses', ek: true }),
      k('scarf', 'scarf', 'atkı', 'tekil', 1, { c: 'Put on your scarf.', ek: true }),
    ],
  },
  {
    id: 'odam', no: 9, en: 'My Room', tr: 'Odam', renk: '#a5d2e7', kapak: 'kutu',
    giris: "Bugün Kino'nun odasındayız.",
    kelimeler: [
      k('bed', 'bed', 'yatak', 'tekil', 1),
      k('chair', 'chair', 'sandalye', 'tekil', 1),
      k('table', 'table', 'masa', 'tekil', 2),
      k('lamp', 'lamp', 'lamba', 'tekil', 1),
      k('door', 'door', 'kapı', 'tekil', 1),
      k('window', 'window', 'pencere', 'tekil', 2),
      k('box', 'box', 'kutu', 'tekil', 1, { cogulu: 'boxes', ek: true }),
      k('clock', 'clock', 'saat', 'tekil', 1, { ek: true }),
    ],
  },
  {
    id: 'tasitlar', no: 10, en: 'Vehicles', tr: 'Taşıtlar', renk: '#b9d7f5', kapak: 'kutu',
    giris: 'Düt düt! Bugün taşıtlara biniyoruz.',
    kelimeler: [
      k('car', 'car', 'araba', 'tekil', 1, { efekt: true, c: 'I see a car.' }),
      k('bus', 'bus', 'otobüs', 'tekil', 1, { efekt: true, c: 'I see a bus.', cogulu: 'buses' }),
      k('train', 'train', 'tren', 'tekil', 1, { efekt: true, c: 'I see a train.' }),
      k('plane', 'plane', 'uçak', 'tekil', 1, { efekt: true, c: 'I see a plane.' }),
      k('boat', 'boat', 'tekne', 'tekil', 1, { efekt: true, c: 'I see a boat.' }),
      k('bike', 'bike', 'bisiklet', 'tekil', 1, { efekt: true, c: 'I see a bike.' }),
      k('truck', 'truck', 'kamyon', 'tekil', 1, { efekt: true, c: 'I see a truck.', ek: true }),
      k('rocket', 'rocket', 'roket', 'tekil', 2, { efekt: true, c: 'I see a rocket.', ek: true }),
    ],
  },
  {
    id: 'hareketler', no: 11, en: 'Actions', tr: 'Hareketler', renk: '#f7c964', kapak: 'kutu',
    giris: 'Ayağa kalk! Bugün hareket ediyoruz.',
    kelimeler: [
      k('jump', 'jump', 'zıpla', 'eylem', 1, { q: 'Jump!', y: 'Is Kino jumping?' }),
      k('run', 'run', 'koş', 'eylem', 1, { q: 'Run!', y: 'Is Kino running?' }),
      k('clap', 'clap', 'alkışla', 'eylem', 1, { q: 'Clap!', y: 'Is Kino clapping?' }),
      k('sleep', 'sleep', 'uyu', 'eylem', 1, { q: 'Sleep!', y: 'Is Kino sleeping?' }),
      k('eat', 'eat', 'ye', 'eylem', 1, { q: 'Eat!', y: 'Is Kino eating?' }),
      k('drink', 'drink', 'iç', 'eylem', 1, { q: 'Drink!', y: 'Is Kino drinking?' }),
      k('dance', 'dance', 'dans et', 'eylem', 1, { q: 'Dance!', y: 'Is Kino dancing?', ek: true }),
      k('swim', 'swim', 'yüz', 'eylem', 1, { q: 'Swim!', y: 'Is Kino swimming?', ek: true }),
    ],
  },
  {
    id: 'vahsi', no: 12, en: 'Wild Animals', tr: 'Vahşi Hayvanlar', renk: '#cfe5a0', kapak: 'kutu',
    giris: 'Bugün ormana gidiyoruz. Sessiz ol, hayvanlar yakında.',
    kelimeler: [
      k('lion', 'lion', 'aslan', 'tekil', 2, { efekt: true, c: 'I see a lion.' }),
      k('monkey', 'monkey', 'maymun', 'tekil', 2, { efekt: true, c: 'I see a monkey.' }),
      k('elephant', 'elephant', 'fil', 'tekil', 3, { an: true, efekt: true, c: 'I see an elephant.' }),
      k('bird', 'bird', 'kuş', 'tekil', 1, { efekt: true, c: 'I see a bird.' }),
      k('fish', 'fish', 'balık', 'tekil', 1, { c: 'I see a fish.', cogulu: 'fish' }),
      k('frog', 'frog', 'kurbağa', 'tekil', 1, { efekt: true, c: 'I see a frog.' }),
      k('giraffe', 'giraffe', 'zürafa', 'tekil', 2, { c: 'I see a giraffe.', ek: true }),
      k('snake', 'snake', 'yılan', 'tekil', 1, { efekt: true, c: 'I see a snake.', ek: true }),
    ],
  },
  // 13–24. adalar (20 Kasım 2026): icerik3.ts
  ...YENI_UNITELER,
];

export const TUM_KELIMELER: Kelime[] = UNITELER.flatMap((u) => u.kelimeler);

// ---------------------------------------------------------------- hayvanlar (20 Kasım 2026)

/**
 * Barış: "3 hayvanla bitirdin… 1. derste 10–15, 2. derste 30, 3. derste 100 hayvan". Ünitelerin 96 kelimesinin dışında
 * kalan 84 hayvan. Çiftlik adasının ilk üç dersinde (Hayvan Geçidi, Hayvanat Bahçesi) ve oyunlarda kullanılır; kayıtları
 * kelimelerinkiyle aynı altılıdır (kelimeSesleri), çizimleri `kelime/<id>`. Ünitelerin kelime listesine ve albüme girmezler.
 * Çizimi ya da sesi gelmeyen hayvan hiçbir yerde görünmez (ders.ts → hayvanAcik).
 */
export const EK_HAYVANLAR: Kelime[] = [
  k('rabbit', 'rabbit', 'tavşan', 'tekil', 2),
  k('goat', 'goat', 'keçi', 'tekil', 1),
  k('mouse', 'mouse', 'fare', 'tekil', 1),
  k('donkey', 'donkey', 'eşek', 'tekil', 2),
  k('tiger', 'tiger', 'kaplan', 'tekil', 2),
  k('bear', 'bear', 'ayı', 'tekil', 1),
  k('zebra', 'zebra', 'zebra', 'tekil', 2),
  k('panda', 'panda', 'panda', 'tekil', 2),
  k('penguin', 'penguin', 'penguen', 'tekil', 2),
  k('turtle', 'turtle', 'kaplumbağa', 'tekil', 2),
  k('crocodile', 'crocodile', 'timsah', 'tekil', 3),
  k('kangaroo', 'kangaroo', 'kanguru', 'tekil', 3),
  k('hippo', 'hippo', 'su aygırı', 'tekil', 2),
  k('butterfly', 'butterfly', 'kelebek', 'tekil', 3),
  k('dolphin', 'dolphin', 'yunus', 'tekil', 2),
  k('whale', 'whale', 'balina', 'tekil', 1),
  k('shark', 'shark', 'köpekbalığı', 'tekil', 1),
  k('octopus', 'octopus', 'ahtapot', 'tekil', 3, { an: true }),
  k('crab', 'crab', 'yengeç', 'tekil', 1),
  k('starfish', 'starfish', 'deniz yıldızı', 'tekil', 2),
  k('seal', 'seal', 'fok', 'tekil', 1),
  k('jellyfish', 'jellyfish', 'denizanası', 'tekil', 3),
  k('seahorse', 'seahorse', 'denizatı', 'tekil', 2),
  k('walrus', 'walrus', 'mors', 'tekil', 2),
  k('owl', 'owl', 'baykuş', 'tekil', 1, { an: true }),
  k('parrot', 'parrot', 'papağan', 'tekil', 2),
  k('eagle', 'eagle', 'kartal', 'tekil', 2, { an: true }),
  k('flamingo', 'flamingo', 'flamingo', 'tekil', 3),
  k('peacock', 'peacock', 'tavus kuşu', 'tekil', 2),
  k('swan', 'swan', 'kuğu', 'tekil', 1),
  k('ostrich', 'ostrich', 'devekuşu', 'tekil', 2, { an: true }),
  k('pigeon', 'pigeon', 'güvercin', 'tekil', 2),
  k('rooster', 'rooster', 'horoz', 'tekil', 2),
  k('turkey', 'turkey', 'hindi', 'tekil', 2),
  k('goose', 'goose', 'kaz', 'tekil', 1),
  k('toucan', 'toucan', 'tukan', 'tekil', 2),
  k('crow', 'crow', 'karga', 'tekil', 1),
  k('woodpecker', 'woodpecker', 'ağaçkakan', 'tekil', 3),
  k('bee', 'bee', 'arı', 'tekil', 1),
  k('ant', 'ant', 'karınca', 'tekil', 1, { an: true }),
  k('ladybug', 'ladybug', 'uğur böceği', 'tekil', 3),
  k('spider', 'spider', 'örümcek', 'tekil', 2),
  k('snail', 'snail', 'salyangoz', 'tekil', 1),
  k('worm', 'worm', 'solucan', 'tekil', 1),
  k('caterpillar', 'caterpillar', 'tırtıl', 'tekil', 4),
  k('dragonfly', 'dragonfly', 'yusufçuk', 'tekil', 3),
  k('grasshopper', 'grasshopper', 'çekirge', 'tekil', 3),
  k('beetle', 'beetle', 'böcek', 'tekil', 2),
  k('fox', 'fox', 'tilki', 'tekil', 1),
  k('wolf', 'wolf', 'kurt', 'tekil', 1),
  k('deer', 'deer', 'geyik', 'tekil', 1),
  k('squirrel', 'squirrel', 'sincap', 'tekil', 2),
  k('hedgehog', 'hedgehog', 'kirpi', 'tekil', 2),
  k('raccoon', 'raccoon', 'rakun', 'tekil', 2),
  k('bat', 'bat', 'yarasa', 'tekil', 1),
  k('beaver', 'beaver', 'kunduz', 'tekil', 2),
  k('skunk', 'skunk', 'kokarca', 'tekil', 1),
  k('otter', 'otter', 'su samuru', 'tekil', 2, { an: true }),
  k('rhino', 'rhino', 'gergedan', 'tekil', 2),
  k('camel', 'camel', 'deve', 'tekil', 2),
  k('cheetah', 'cheetah', 'çita', 'tekil', 2),
  k('leopard', 'leopard', 'leopar', 'tekil', 2),
  k('gorilla', 'gorilla', 'goril', 'tekil', 3),
  k('koala', 'koala', 'koala', 'tekil', 3),
  k('polar-bear', 'polar bear', 'kutup ayısı', 'tekil', 3),
  k('sloth', 'sloth', 'tembel hayvan', 'tekil', 1),
  k('lizard', 'lizard', 'kertenkele', 'tekil', 2),
  k('chameleon', 'chameleon', 'bukalemun', 'tekil', 4),
  k('meerkat', 'meerkat', 'mirket', 'tekil', 2),
  k('llama', 'llama', 'lama', 'tekil', 2),
  k('ox', 'ox', 'öküz', 'tekil', 1, { an: true }),
  k('moose', 'moose', 'sığın', 'tekil', 1),
  k('lamb', 'lamb', 'kuzu', 'tekil', 1),
  k('puppy', 'puppy', 'yavru köpek', 'tekil', 2),
  k('kitten', 'kitten', 'yavru kedi', 'tekil', 2),
  k('chick', 'chick', 'civciv', 'tekil', 1),
  k('pony', 'pony', 'midilli', 'tekil', 2),
  k('bull', 'bull', 'boğa', 'tekil', 1),
  k('hamster', 'hamster', 'hamster', 'tekil', 2),
  k('goldfish', 'goldfish', 'japon balığı', 'tekil', 2),
  k('duckling', 'duckling', 'ördek yavrusu', 'tekil', 2),
  k('calf', 'calf', 'buzağı', 'tekil', 1),
  k('tadpole', 'tadpole', 'iribaş', 'tekil', 2),
  k('foal', 'baby horse', 'tay', 'tekil', 3),
];

export type HayvanGrubu = 'deniz' | 'kus' | 'bocek' | 'orman' | 'vahsi' | 'yavru';
/** Hayvan derslerinin hayvanları: 1. derste 12 (şarkıdakilerle aynı), 2. derste 18 yeni (toplam 30), 3. derste 70 yeni (toplam 100) */
export const HAYVAN_DERSI_1: readonly string[] = ['cow', 'duck', 'sheep', 'cat', 'dog', 'horse', 'chicken', 'bird', 'goat', 'mouse', 'donkey', 'rabbit'];
export const HAYVAN_DERSI_2: readonly string[] = ['pig', 'lion', 'monkey', 'elephant', 'fish', 'frog', 'giraffe', 'snake', 'tiger', 'bear', 'zebra', 'panda', 'penguin', 'turtle', 'crocodile', 'kangaroo', 'hippo', 'butterfly'];
/** 3. ders: Hayvanat Bahçesi'nin altı bölümü (70 yeni hayvan) */
export const HAYVAN_BOLUMLERI: readonly { grup: HayvanGrubu; en: string; tr: string; renk: string; hayvanlar: readonly string[] }[] = [
  { grup: 'deniz', en: 'The sea', tr: 'Deniz', renk: '#bfe6f5', hayvanlar: ['dolphin', 'whale', 'shark', 'octopus', 'crab', 'starfish', 'seal', 'jellyfish', 'seahorse', 'walrus'] },
  { grup: 'kus', en: 'Birds', tr: 'Kuşlar', renk: '#d7ecff', hayvanlar: ['owl', 'parrot', 'eagle', 'flamingo', 'peacock', 'swan', 'ostrich', 'pigeon', 'rooster', 'turkey', 'goose', 'toucan', 'crow', 'woodpecker'] },
  { grup: 'bocek', en: 'Bugs', tr: 'Böcekler', renk: '#e3f4c9', hayvanlar: ['bee', 'ant', 'ladybug', 'spider', 'snail', 'worm', 'caterpillar', 'dragonfly', 'grasshopper', 'beetle'] },
  { grup: 'orman', en: 'The forest', tr: 'Orman', renk: '#d4ecd0', hayvanlar: ['fox', 'wolf', 'deer', 'squirrel', 'hedgehog', 'raccoon', 'bat', 'beaver', 'skunk', 'otter'] },
  { grup: 'vahsi', en: 'Wild animals', tr: 'Vahşi doğa', renk: '#f6e3bd', hayvanlar: ['rhino', 'camel', 'cheetah', 'leopard', 'gorilla', 'koala', 'polar-bear', 'sloth', 'lizard', 'chameleon', 'meerkat', 'llama', 'ox', 'moose'] },
  { grup: 'yavru', en: 'Baby animals', tr: 'Yavrular', renk: '#fde2e6', hayvanlar: ['lamb', 'puppy', 'kitten', 'chick', 'pony', 'bull', 'hamster', 'goldfish', 'duckling', 'calf', 'tadpole', 'foal'] },
];

/** Sayı kelimeleri sayma sırasıyla: SAYI_KELIMELERI[2] === 'three' (Kaç Tane? oyunu ve birlikte sayma) */
export const SAYI_KELIMELERI: readonly string[] = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
/** Sayı kelimesinin değeri (1–8); sayı değilse 0 */
export const sayiDegeri = (w: Kelime): number => SAYI_KELIMELERI.indexOf(w.id) + 1;
// sözlük ek hayvanları da tanır: oyunlar ve kayıt listeleri kelimeBul ile çalışır
const KELIME_SOZLUGU = new Map([...TUM_KELIMELER, ...EK_HAYVANLAR].map((w) => [w.id, w]));
export const kelimeBul = (id: string): Kelime | undefined => KELIME_SOZLUGU.get(id);
export const uniteBul = (id: string): Unite | undefined => UNITELER.find((u) => u.id === id);
export const kelimeninUnitesi = (id: string): Unite | undefined => UNITELER.find((u) => u.kelimeler.some((w) => w.id === id));

const tanimlik = (w: Kelime) => (w.an ? 'an' : 'a');
const buyukBas = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** Türkçe büyük harf: "inek" → "İnek" (noktalı İ) */
const buyukBasTr = (s: string) => s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);

/** Çoğul: "ducks", "sheep", "buses" (zaten çoğul olan kelime olduğu gibi kalır) */
export const cogul = (w: Kelime): string => (w.tur === 'cogul' ? w.en : w.cogulu ?? `${w.en}s`);

/** Kelimenin tek başına söylenişi: "Sheep." */
export const kelimeMetni = (w: Kelime): string => `${buyukBas(w.en)}.`;

/** Tanıtım cümlesi: "It's a sheep." */
export function cumle(w: Kelime): string {
  if (w.c) return w.c;
  switch (w.tur) {
    case 'tekil': return `It's ${tanimlik(w)} ${w.en}.`;
    case 'cogul': return `They are ${w.en}.`;
    case 'sayilamaz': case 'renk': return `It's ${w.en}.`;
    case 'sayi': return `Number ${w.en}.`;
    case 'kisi': return `This is my ${w.en}.`;
    case 'eylem': return `I can ${w.en}!`;
  }
}

/** Bulma sorusu: "Where is the sheep?" */
export function soru(w: Kelime): string {
  if (w.q) return w.q;
  switch (w.tur) {
    case 'tekil': case 'sayilamaz': return `Where is the ${w.en}?`;
    case 'cogul': return `Where are the ${w.en}?`;
    case 'renk': return `Which one is ${w.en}?`;
    case 'sayi': return `Where is number ${w.en}?`;
    case 'kisi': return `Where is my ${w.en}?`;
    case 'eylem': return `Who can ${w.en}?`;
  }
}

/** Evet / hayır sorusu: "Is it a sheep?" */
export function evetHayir(w: Kelime): string {
  if (w.y) return w.y;
  switch (w.tur) {
    case 'tekil': return `Is it ${tanimlik(w)} ${w.en}?`;
    case 'cogul': return `Are they ${w.en}?`;
    case 'sayilamaz': case 'renk': return `Is it ${w.en}?`;
    case 'sayi': return `Is it number ${w.en}?`;
    case 'kisi': return `Is it my ${w.en}?`;
    case 'eylem': return `Can you ${w.en}?`;
  }
}

// ---------------------------------------------------------------- dersler

/**
 * Ünitenin dokuz dersi. Seviye 1 (kelimeler): 0, 1 yeni kelime dersleri, 2 şenlik. Seviye 2 (cümleler): 3, 4 yeni kalıp,
 * 5 cümle şenliği. Seviye 3 (konuşma): 6 soru–cevap, 7 cümle kurma, 8 hikâye. Seviye 2 ve 3'ün içeriği icerik2.ts'te.
 */
export type DersNo = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type Seviye = 1 | 2 | 3;
export const DERS_NOLARI: readonly DersNo[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];
export const seviyesi = (no: DersNo): Seviye => (Math.floor(no / 3) + 1) as Seviye;
export const seviyeDersleri = (s: Seviye): DersNo[] => [0, 1, 2].map((i) => ((s - 1) * 3 + i) as DersNo);
export const dersKimligi = (u: Unite, no: DersNo): string => `${u.id}-${no + 1}`;
/** Bir derste öğretilen yeni kelime sayısı */
export const DERS_KELIME_SAYISI = 4;

/** Dersin yeni kelimeleri: 1. ders ilk dört, 2. ders son dört; öbür derslerde yeni kelime yok */
export function yeniKelimeler(u: Unite, no: DersNo): Kelime[] {
  return no === 0 ? u.kelimeler.slice(0, DERS_KELIME_SAYISI) : no === 1 ? u.kelimeler.slice(DERS_KELIME_SAYISI, DERS_KELIME_SAYISI * 2) : [];
}

/** Dersin çalıştığı bütün kelimeler (şenlikte ve üst seviyelerde ünitenin hepsi) */
export function dersKelimeleri(u: Unite, no: DersNo): Kelime[] {
  return no >= 2 ? u.kelimeler : yeniKelimeler(u, no);
}

export interface Ders { unite: Unite; no: DersNo; id: string; seviye: Seviye }

/**
 * Bütün dersler, önerilen yol sırasıyla (sarmal): bir adanın kelimeleri öğrenildikten iki ada sonra o adaya cümleler
 * için, beş ada sonra konuşma için geri dönülür. Böylece kelime, cümle ve hikâye dersleri art arda değil sırayla gelir;
 * üst seviyenin kullandığı sayılar, renkler ve nesneler o sırada çoktan öğrenilmiş olur.
 */
export const TUM_DERSLER: Ders[] = UNITELER
  .flatMap((unite, i) => DERS_NOLARI.map((no) => {
    const seviye = seviyesi(no);
    const sira = (seviye === 1 ? i : seviye === 2 ? i + 2.5 : i + 5.7) * 10 + (no % 3);
    return { ders: { unite, no, id: dersKimligi(unite, no), seviye }, sira };
  }))
  .sort((a, b) => a.sira - b.sira)
  .map((x) => x.ders);
export const dersBul = (id: string): Ders | undefined => TUM_DERSLER.find((d) => d.id === id);

// ---------------------------------------------------------------- seslendirilecek metinler

/** mino, zipzip, lokum: ana ekranda oturan karakterler (23 Kasım; İngilizce sohbet, kendi klon sesleriyle) */
export type Konusan = 'polly' | 'ceren' | 'kino' | 'mino' | 'zipzip' | 'lokum';
export interface SesMetni {
  /** assets/ingilizce/ses/<id>.mp3 */
  id: string;
  kim: Konusan;
  dil: 'en' | 'tr';
  metin: string;
  /** yavaş söyleyiş (ayrı kayıt; normal kaydın yavaşlatılmışı değil) */
  yavas?: true;
  /** konuşma süresi denetimi için hece sayısı */
  hece: number;
}

/** Polly'nin her derste kullandığı kısa İngilizce sözler */
export const POLLY_SOZLERI: Record<string, [metin: string, hece: number]> = {
  'hello': ['Hello!', 2],
  'goodbye': ['Goodbye!', 2],
  // vedada çocuk el sallayınca Polly'nin cevabı (aynı "Goodbye!" art arda iki kez çalıyordu)
  'see-you-soon': ['See you soon!', 3],
  'yes': ['Yes!', 1],
  'no': ['No!', 1],
  'great-job': ['Great job!', 2],
  'well-done': ['Well done!', 2],
  'wow': ['Wow!', 1],
  'listen': ['Listen!', 2],
  'look': ['Look!', 1],
  'your-turn': ['Your turn!', 2],
  'try-again': ['Try again!', 3],
  'whats-missing': ["What's missing?", 3],
  'who-is-it': ['Who is it?', 3],
  'what-is-it': ['What is it?', 3],
  'thank-you': ['Thank you!', 2],
  'yummy': ['Yummy!', 2],
  'how-many': ['How many?', 3],
};

/**
 * Polly'nin çeşitleme sözleri (övgüler ve "sıra sende" sözleri hep aynı olmasın diye). Kaydı gelen söz sıraya girer;
 * gelmeden de uygulama açılır (ünitenin hazır sayılması bunlara bağlı değildir).
 */
export const POLLY_EK_SOZLERI: Record<string, [metin: string, hece: number]> = {
  'super': ['Super!', 2],
  'good-job': ['Good job!', 2],
  'excellent': ['Excellent!', 3],
  'say-it': ['Say it!', 2],
  'now-you': ['Now you!', 2],
};

/** Ceren Öğretmen'in yönergeleri (Türkçe; her biri ayrı kayıt, en çok üç kısa cümle) */
export const CEREN_SOZLERI: Record<string, string> = {
  'hosgeldin': 'Hoş geldin! Ben Ceren Öğretmen.',
  'polly-tanit': 'Bu da Polly. Polly yalnızca İngilizce konuşur.',
  'selam-ver': 'Polly sana merhaba dedi. Hadi, sen de ona el salla!',
  'selam-kisa': "Polly'ye merhaba diyelim!",
  'ana': 'Hoş geldin! Bugün ne yapalım?',
  'ana-devam': 'Dersimize devam edelim mi?',
  'tekrar-giris': "Önce hatırlayalım. Polly'yi dinle, doğru resme dokun.",
  'tanis-giris': 'Şimdi yeni kelimeler öğreniyoruz.',
  'kapak-ahir': 'Bu ses kimin? Kapıya dokun, görelim.',
  'kapak-kutu': 'Kutunun içinde ne var? Dokun, görelim.',
  'sen-soyle': 'Şimdi sen söyle!',
  'dokun-devam': 'Söyleyince yıldıza dokun.',
  'bul-giris': "Polly'yi dinle, doğru resme dokun.",
  'bir-daha': 'Bir daha dinleyelim.',
  'ogret-giris': 'Kino İngilizce öğreniyor. Ona yardım edelim mi? Doğruysa yeşile, yanlışsa kırmızıya dokun.',
  'ogret-ver': "Doğrusunu Kino'ya göster.",
  'balon-giris': "Polly'nin söylediği balonu patlat!",
  'eksik-giris': 'Resimlere iyi bak. Biri kaybolacak!',
  'eksik-sor': 'Hangisi kayboldu?',
  'besle-giris': "Obur acıkmış! Polly'nin söylediğini Obur'a ver.",
  'eslestir-giris': 'Aynı iki resmi bul.',
  'say-giris': 'Kaç tane var? Say, doğru sayıya dokun.',
  'yap-giris': 'Polly ne derse Kino onu yapacak. Sen de onunla birlikte yap!',
  'kapi-giris': 'Kapı çalıyor! Polly kimin geldiğini söyleyecek. Sen de resmine dokun.',
  'resim-giris': 'Resimdeki her şeye dokun, adını dinle.',
  'resim-bul': 'Şimdi Polly soracak, sen göster.',
  'soyle-giris': 'Çıkartma zamanı! Kelimeyi söyle, çıkartman albüme uçsun.',
  'aferin-1': 'Aferin sana!',
  'aferin-2': 'Harikasın!',
  'aferin-3': 'Çok güzel söyledin!',
  'aferin-4': 'Tam isabet!',
  'veda': "Bugünlük bu kadar. Polly'ye güle güle diyelim!",
  'ders-bitti': 'Bugün yeni kelimeler öğrendin.',
  'unite-bitti': 'Bütün kelimeleri öğrendin. Adan canlandı!',
  'oyunlar': 'Hangi oyunu oynayalım?',
  'oyun-kilitli': 'Bu oyun için önce biraz ders yapalım.',
  'album': 'Bunlar senin kelimelerin. Dokun, dinle.',
  'tekrar-gunu': 'Günün tekrarı! Bakalım hangilerini hatırlıyorsun?',
};

/**
 * Kino'nun kısa tepkileri (Türkçe). 18 Kasım 2026, Barış: "kino ingilizcede bu mu dışında bir şey demiyor".
 * Kino'ya Öğret'te her soruda başka söz söyler (KINO_SORU · KINO_HATA · KINO_OGRENDI). Ses: çizgi filmdeki Kino.
 */
export const KINO_SOZLERI: Record<string, string> = {
  'bu-mu': 'Bu mu?',
  'hmm': 'Hımm…',
  'yasasin': 'Yaşasın!',
  'ogrendim': 'Öğrendim!',
  'tesekkurler': 'Teşekkür ederim!',
  'bu-mu-acaba': 'Acaba bu mu?',
  'buldum-galiba': 'Buldum galiba!',
  'sence': 'Sence bu mu?',
  'bak-bak': 'Bak, bak! Bu mu?',
  'sanirim-bu': 'Sanırım bu!',
  'hay-aksi': 'Hay aksi!',
  'aa-yanlis': 'Aa, yanlışmış!',
  'tamam-anladim': 'Tamam, anladım!',
  'cok-guzel': 'Çok güzel!',
  'artik-biliyorum': 'Artık biliyorum!',
};
/** Kino resmi kaldırırken (soru başı) */
export const KINO_SORU = ['bu-mu', 'buldum-galiba', 'hmm', 'sence', 'bak-bak', 'bu-mu-acaba', 'sanirim-bu'] as const;
/** Kino yanlış resmi kaldırdığı anlaşılınca */
export const KINO_HATA = ['hay-aksi', 'aa-yanlis'] as const;
/** Çocuk doğrusunu gösterince */
export const KINO_OGRENDI = ['ogrendim', 'tamam-anladim', 'yasasin', 'artik-biliyorum', 'cok-guzel'] as const;

const TR_HECE = (metin: string) => (metin.match(/[aeıioöuüAEIİOÖUÜ]/g) ?? []).length;
const EN_CUMLE_HECE = (metin: string, kelimeHece: number) => {
  // kalıbın geri kalanındaki sesli harf öbekleri + kelimenin kendi hece sayısı (yaklaşık; yalnız süre alt sınırı için)
  const govde = metin.toLowerCase().replace(/[^a-z' ]/g, ' ').split(/\s+/).filter(Boolean);
  const say = (s: string) => Math.max(1, (s.replace(/e\b/, '').match(/[aeiouy]+/g) ?? []).length);
  return Math.max(kelimeHece, govde.reduce((t, s) => t + say(s), 0));
};

/** Bir kelimenin beş İngilizce kaydı + Türkçe karşılığı */
export function kelimeSesleri(w: Kelime): SesMetni[] {
  return [
    { id: `en/w-${w.id}`, kim: 'polly', dil: 'en', metin: kelimeMetni(w), hece: w.hece },
    { id: `en/w-${w.id}-yavas`, kim: 'polly', dil: 'en', metin: kelimeMetni(w), yavas: true, hece: w.hece },
    { id: `en/c-${w.id}`, kim: 'polly', dil: 'en', metin: cumle(w), hece: EN_CUMLE_HECE(cumle(w), w.hece) },
    { id: `en/q-${w.id}`, kim: 'polly', dil: 'en', metin: soru(w), hece: EN_CUMLE_HECE(soru(w), w.hece) },
    { id: `en/y-${w.id}`, kim: 'polly', dil: 'en', metin: evetHayir(w), hece: EN_CUMLE_HECE(evetHayir(w), w.hece) },
    { id: `tr/k-${w.id}`, kim: 'ceren', dil: 'tr', metin: `${buyukBasTr(w.tr)} demek.`, hece: TR_HECE(w.tr) + 2 },
  ];
}

/** Üniteden bağımsız ortak kayıtlar (Polly'nin sözleri, Ceren'in yönergeleri, Kino'nun tepkileri) */
export function ortakSesler(): SesMetni[] {
  return [
    ...Object.entries(POLLY_SOZLERI).map(([ad, [metin, hece]]): SesMetni => ({ id: `en/g-${ad}`, kim: 'polly', dil: 'en', metin, hece })),
    ...Object.entries(CEREN_SOZLERI).map(([ad, metin]): SesMetni => ({ id: `tr/c-${ad}`, kim: 'ceren', dil: 'tr', metin, hece: TR_HECE(metin) })),
    ...Object.entries(KINO_SOZLERI).map(([ad, metin]): SesMetni => ({ id: `tr/kino-${ad}`, kim: 'kino', dil: 'tr', metin, hece: TR_HECE(metin) })),
  ];
}

/** Çeşitleme sözlerinin kayıtları (isteğe bağlı; bkz. POLLY_EK_SOZLERI) */
export function ekSesler(): SesMetni[] {
  return Object.entries(POLLY_EK_SOZLERI).map(([ad, [metin, hece]]): SesMetni => ({ id: `en/g-${ad}`, kim: 'polly', dil: 'en', metin, hece }));
}

/** Bir ünitenin bütün kayıtları (kelimeler + ünite girişi) */
export function uniteSesleri(u: Unite): SesMetni[] {
  return [
    { id: `tr/u-${u.id}`, kim: 'ceren', dil: 'tr', metin: u.giris, hece: TR_HECE(u.giris) },
    ...u.kelimeler.flatMap(kelimeSesleri),
  ];
}

/** Ses efektleri: tanışmada önce duyulan sesler (hayvan, taşıt) */
export const efektKimligi = (w: Kelime): string => `efekt/${w.id}`;
