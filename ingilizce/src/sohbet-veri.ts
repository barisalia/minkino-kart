/**
 * Karakterlerle sohbet (23 Kasım 2026) · DOM'suz veri.
 *
 * Barış: "Karakterlere tıklayabiliyoruz ya; tıkladığımız karakterle sohbet edebilelim, konuşmayı devam ettirelim." Ana
 * ekranda bir karaktere dokununca kısa bir İngilizce sohbet açılır: karakter sorar, çocuk üç resimli cevaptan birini seçer,
 * karakter cevaba göre konuşmayı sürdürür. Dört tur: karakterin havuzundan üç soru (her açılışta başka) ve sonda bir davet.
 * Yanlış cevap yoktur; her cevabın kendi karşılığı vardır. Cümleler kısa ve gerçek; her karakter kendi sesiyle (Polly:
 * Ruby Roo; Mino, Zıpzıp, Lokum: kendi klonları) ve kendi konusuyla:
 *   - Polly: her şeyden biraz (hayvan, yemek, renk, hava, oyun) · Mino: yemek ve meyve · Zıpzıp: oyun ve zıplama ·
 *     Lokum: uyku, oyuncak ve arkadaşı Kuzu.
 */
import type { Konusan, SesMetni } from './icerik';

export interface SohbetCevabi {
  /** kelime kimliği (resim kelime/<id>, adı en/w-<id>) ya da 'yes' / 'no' */
  id: string;
  /** karakterin karşılığı */
  en: string;
  tr: string;
  /** önce çalan ses (hayvan, taşıt) */
  efekt?: string;
}
export interface SohbetSorusu { id: string; en: string; tr: string; cevaplar: readonly SohbetCevabi[] }
export interface Soz { en: string; tr: string }

export type SohbetKarakteri = 'polly' | 'mino' | 'zipzip' | 'lokum';
export interface Sohbet {
  karakter: SohbetKarakteri;
  kim: Konusan;
  ad: string;
  acilis: Soz;
  kapanis: Soz;
  havuz: readonly SohbetSorusu[];
  /** son tur (davet; Yes / No) */
  son: SohbetSorusu;
}

const c = (id: string, en: string, tr: string, efekt?: string): SohbetCevabi => ({ id, en, tr, ...(efekt ? { efekt } : {}) });
const sor = (id: string, en: string, tr: string, cevaplar: SohbetCevabi[]): SohbetSorusu => ({ id, en, tr, cevaplar });

const POLLY: Sohbet = {
  karakter: 'polly', kim: 'polly', ad: 'Polly',
  acilis: { en: "Hi! It's me, Polly! Let's talk!", tr: 'Merhaba! Benim, Polly! Hadi konuşalım!' },
  kapanis: { en: 'Bye-bye! Come and talk again!', tr: 'Hoşça kal! Yine gel, konuşalım!' },
  havuz: [
    sor('hayvan', 'What animal do you like?', 'Hangi hayvanı seversin?', [
      c('cow', 'A cow! Moo! I like cows too!', 'İnek! Möö! Ben de inekleri severim!', 'efekt/cow'),
      c('duck', 'A duck! Quack, quack! So cute!', 'Ördek! Vak vak! Çok tatlı!', 'efekt/duck'),
      c('cat', 'A cat! Meow! Cats are soft.', 'Kedi! Miyav! Kediler yumuşacık.', 'efekt/cat'),
    ]),
    sor('yemek', "I'm hungry! What can I eat?", 'Acıktım! Ne yiyebilirim?', [
      c('apple', 'An apple! Crunch! Thank you!', 'Elma! Kıtır! Teşekkürler!'),
      c('banana', 'A banana! Yum, yum! Thank you!', 'Muz! Mmm! Teşekkürler!'),
      c('cheese', 'Cheese? Hmm… yum! Thank you!', 'Peynir mi? Hmm… nefis! Teşekkürler!'),
    ]),
    sor('renk', 'What color do you like?', 'Hangi rengi seversin?', [
      c('red', 'Red! Like my wings!', 'Kırmızı! Kanatlarım gibi!'),
      c('blue', 'Blue! Like the sky!', 'Mavi! Gökyüzü gibi!'),
      c('yellow', 'Yellow! Like the sun!', 'Sarı! Güneş gibi!'),
    ]),
    sor('soguk', "Brr! It's cold. What do I need?", 'Brr! Hava soğuk. Neye ihtiyacım var?', [
      c('hat', 'A hat! Now I am warm!', 'Şapka! Artık sıcacığım!'),
      c('jacket', 'A jacket! Now I am warm!', 'Ceket! Artık sıcacığım!'),
      c('socks', 'Socks! Now my feet are warm!', 'Çorap! Artık ayaklarım sıcacık!'),
    ]),
    sor('oyun', "Let's play! What do you want?", 'Hadi oynayalım! Ne istersin?', [
      c('ball', 'A ball! Catch it!', 'Top! Yakala!'),
      c('kite', 'A kite! Up, up, up!', 'Uçurtma! Yukarı, yukarı!'),
      c('drum', 'A drum! Boom, boom, boom!', 'Davul! Bum, bum, bum!'),
    ]),
    sor('hava', 'Look outside! What do you see?', 'Dışarı bak! Ne görüyorsun?', [
      c('sun', 'The sun! It is a sunny day!', 'Güneş! Güneşli bir gün!'),
      c('rain', 'Rain! Drip, drop! Where is my umbrella?', 'Yağmur! Damla damla! Şemsiyem nerede?'),
      c('kite', 'A kite! It is a windy day!', 'Uçurtma! Rüzgârlı bir gün!'),
    ]),
  ],
  son: sor('dans', 'Do you want to dance with me?', 'Benimle dans eder misin?', [
    c('yes', "Yay! Let's dance!", 'Yaşasın! Hadi dans edelim!'),
    c('no', "Okay! Let's clap, then! Clap, clap!", 'Tamam! O zaman alkışlayalım! Şak şak!'),
  ]),
};

/** Mino: yemek ve meyve; hep acıkmış, neşeli */
const MINO: Sohbet = {
  karakter: 'mino', kim: 'mino', ad: 'Mino',
  acilis: { en: "Hi! I'm Mino. I love food!", tr: 'Merhaba! Ben Mino. Yemeği çok severim!' },
  kapanis: { en: 'Thank you, friend! Bye-bye!', tr: 'Teşekkürler arkadaşım! Hoşça kal!' },
  havuz: [
    sor('meyve', 'What fruit do you like?', 'Hangi meyveyi seversin?', [
      c('apple', 'An apple! Red and sweet!', 'Elma! Kırmızı ve tatlı!'),
      c('banana', 'A banana! Long and yellow!', 'Muz! Uzun ve sarı!'),
      c('orange', 'An orange! So juicy!', 'Portakal! Çok sulu!'),
    ]),
    sor('kahvalti', "It's breakfast time! What do we eat?", 'Kahvaltı zamanı! Ne yiyelim?', [
      c('bread', 'Bread! Crunchy bread!', 'Ekmek! Kıtır kıtır ekmek!'),
      c('egg', 'An egg! Yummy!', 'Yumurta! Nefis!'),
      c('cheese', 'Cheese! I love cheese!', 'Peynir! Peyniri çok severim!'),
    ]),
    sor('sebze', 'What vegetable do you eat?', 'Hangi sebzeyi yersin?', [
      c('carrot', 'A carrot! Crunch, crunch!', 'Havuç! Kıtır kıtır!'),
      c('potato', 'A potato! Hot and yummy!', 'Patates! Sıcacık ve nefis!'),
      c('corn', 'Corn! Pop, pop, pop!', 'Mısır! Pıt, pıt, pıt!'),
    ]),
    sor('icecek', "I'm thirsty! What can I drink?", 'Susadım! Ne içebilirim?', [
      c('milk', 'Milk! Glug, glug! Thank you!', 'Süt! Lık lık! Teşekkürler!'),
      c('water', 'Water! Ahh, so good!', 'Su! Ohh, çok iyi geldi!'),
      c('orange', 'Orange juice! Yum!', 'Portakal suyu! Nefis!'),
    ]),
  ],
  son: sor('piknik', 'Picnic time! Do you want to come?', 'Piknik zamanı! Gelmek ister misin?', [
    c('yes', "Yay! Let's eat together!", 'Yaşasın! Hadi birlikte yiyelim!'),
    c('no', 'No? Okay! More for me! Yum!', 'Hayır mı? Tamam! Hepsi benim! Mmm!'),
  ]),
};

/** Zıpzıp: oyun ve zıplama; enerjik */
const ZIPZIP: Sohbet = {
  karakter: 'zipzip', kim: 'zipzip', ad: 'Zıpzıp',
  acilis: { en: "Hi! I'm Zipzip! Let's play!", tr: 'Merhaba! Ben Zıpzıp! Hadi oynayalım!' },
  kapanis: { en: 'That was fun! Bye-bye!', tr: 'Çok eğlenceliydi! Hoşça kal!' },
  havuz: [
    sor('zipla', 'Who can jump high?', 'Kim yükseğe zıplar?', [
      c('frog', 'A frog! Hop, hop!', 'Kurbağa! Hop, hop!', 'efekt/frog'),
      c('kangaroo', 'A kangaroo! Boing, boing!', 'Kanguru! Boing, boing!', 'efekt/kangaroo'),
      c('rabbit', 'A rabbit! Jump, jump!', 'Tavşan! Zıp, zıp!', 'efekt/rabbit'),
    ]),
    sor('oyuncak', 'What toy do you want?', 'Hangi oyuncağı istersin?', [
      c('ball', 'A ball! Kick it!', 'Top! Vur!'),
      c('kite', 'A kite! Run, run!', 'Uçurtma! Koş, koş!'),
      c('robot', 'A robot! Beep, boop!', 'Robot! Bip, bop!'),
    ]),
    sor('binelim', "Let's go! What do we ride?", 'Hadi gidelim! Neye binelim?', [
      c('bike', 'A bike! Ring, ring!', 'Bisiklet! Zırr, zırr!', 'efekt/bike'),
      c('car', 'A car! Beep, beep!', 'Araba! Düt, düt!', 'efekt/car'),
      c('bus', 'A bus! Here we go!', 'Otobüs! İşte gidiyoruz!', 'efekt/bus'),
    ]),
    sor('hareket', 'What can you do?', 'Sen ne yapabilirsin?', [
      c('run', 'Run! Fast, fast, fast!', 'Koşmak! Hızlı, hızlı!'),
      c('jump', 'Jump! Up, up, up!', 'Zıplamak! Yukarı, yukarı!'),
      c('swim', 'Swim! Splash, splash!', 'Yüzmek! Şap, şap!'),
    ]),
  ],
  son: sor('alkis', 'Can you clap with me?', 'Benimle alkışlar mısın?', [
    c('yes', 'Yay! Clap, clap, clap!', 'Yaşasın! Şak, şak, şak!'),
    c('no', "No? Okay! Let's jump, then!", 'Hayır mı? Tamam! O zaman zıplayalım!'),
  ]),
};

/** Lokum: uyku, oyuncak ve arkadaşı Kuzu (oyuncak kuzu); sakin, uykulu */
const LOKUM: Sohbet = {
  karakter: 'lokum', kim: 'lokum', ad: 'Lokum',
  acilis: { en: "Hi! I'm Lokum. I'm a little sleepy.", tr: 'Merhaba! Ben Lokum. Biraz uykum var.' },
  kapanis: { en: 'Good night! Sweet dreams!', tr: 'İyi geceler! Tatlı rüyalar!' },
  havuz: [
    sor('yatak', 'What do I need for bed?', 'Uyumak için neye ihtiyacım var?', [
      c('bed', 'My bed! Soft and warm!', 'Yatağım! Yumuşacık ve sıcacık!'),
      c('teddy-bear', 'My teddy bear! Hug, hug!', 'Oyuncak ayım! Sarıl, sarıl!'),
      c('lamp', 'My lamp! Click! Now it is dark.', 'Lambam! Tık! Şimdi karanlık.'),
    ]),
    sor('kuzu', 'This is my friend Kuzu. What is Kuzu?', 'Bu arkadaşım Kuzu. Kuzu ne?', [
      c('lamb', 'Yes! A little lamb! Baa!', 'Evet! Küçük bir kuzu! Mee!', 'efekt/lamb'),
      c('cow', 'A cow? No, no! Kuzu says baa!', 'İnek mi? Yok, yok! Kuzu mee der!'),
      c('duck', 'A duck? Silly! Kuzu says baa!', 'Ördek mi? Şaşkın! Kuzu mee der!'),
    ]),
    sor('gece', 'Look! What do you see at night?', 'Bak! Gece ne görüyorsun?', [
      c('moon', 'The moon! Hello, moon!', 'Ay! Merhaba Ay!'),
      c('star', 'A star! Twinkle, twinkle!', 'Yıldız! Pırıl, pırıl!'),
      c('sun', 'The sun? No! It is night! Silly!', 'Güneş mi? Yok! Gece oldu! Şaşkın!'),
    ]),
    sor('battaniye', 'What color is my blanket?', 'Battaniyem ne renk?', [
      c('pink', 'Pink! Like my dress!', 'Pembe! Elbisem gibi!'),
      c('blue', 'Blue! Like the night sky!', 'Mavi! Gece göğü gibi!'),
      c('purple', 'Purple! So pretty!', 'Mor! Çok güzel!'),
    ]),
  ],
  son: sor('iyigeceler', 'Can you say good night to Kuzu?', "Kuzu'ya iyi geceler der misin?", [
    c('yes', 'Good night, Kuzu! Shh…', 'İyi geceler Kuzu! Şşş…'),
    c('no', "Okay! Let's play a little more!", 'Tamam! Biraz daha oynayalım!'),
  ]),
};

export const SOHBETLER: Readonly<Record<SohbetKarakteri, Sohbet>> = { polly: POLLY, mino: MINO, zipzip: ZIPZIP, lokum: LOKUM };

/** Kayıt öneki: Polly'ninki ilk sürümde en/g-sh-…; öbür karakterlerin en/sh-<karakter>-… */
const onEk = (k: Sohbet) => (k.karakter === 'polly' ? 'en/g-sh' : `en/sh-${k.karakter}`);
export const acilisSesi = (k: Sohbet) => `${onEk(k)}-${k.karakter === 'polly' ? 'merhaba' : 'merhaba'}`;
export const kapanisSesi = (k: Sohbet) => `${onEk(k)}-hoscakal`;
export const soruSesi = (k: Sohbet, s: SohbetSorusu) => `${onEk(k)}-${s.id}`;
export const cevapSesi = (k: Sohbet, s: SohbetSorusu, cvp: SohbetCevabi) => `${onEk(k)}-${s.id}-${cvp.id}`;

/** Bir sohbetin turları: havuzdan üç farklı soru (karışık) ve son davet */
export function sohbetTurlari(k: Sohbet, rnd: () => number = Math.random): SohbetSorusu[] {
  const l = [...k.havuz];
  for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; }
  return [...l.slice(0, 3), k.son];
}

/** Bir karakterin sohbetinin bütün kayıt kimlikleri (ses hazır mı, önceden yükleme) */
export function sohbetSesleri(k: Sohbet): string[] {
  const l: string[] = [acilisSesi(k), kapanisSesi(k)];
  for (const s of [...k.havuz, k.son]) {
    l.push(soruSesi(k, s));
    s.cevaplar.forEach((cvp) => { l.push(cevapSesi(k, s, cvp)); if (cvp.efekt) l.push(cvp.efekt); if (cvp.id !== 'yes' && cvp.id !== 'no') l.push(`en/w-${cvp.id}`); });
  }
  return [...new Set(l)];
}

const hece = (s: string) => Math.max(1, s.split(/\s+/).reduce((t, w) => t + Math.max(1, (w.toLowerCase().replace(/[^a-z]/g, '').replace(/e$/, '').match(/[aeiouy]+/g) ?? []).length), 0));

/** Ses üretimi: karakterlerin sohbet kayıtları (her cümle ayrı istek, karakterin kendi sesiyle) */
export function sohbetSesMetinleri(): SesMetni[] {
  const l: SesMetni[] = [];
  for (const k of Object.values(SOHBETLER)) {
    const m = (id: string, metin: string): SesMetni => ({ id, kim: k.kim, dil: 'en', metin, hece: hece(metin) });
    l.push(m(acilisSesi(k), k.acilis.en), m(kapanisSesi(k), k.kapanis.en));
    for (const s of [...k.havuz, k.son]) {
      l.push(m(soruSesi(k, s), s.en));
      s.cevaplar.forEach((cvp) => l.push(m(cevapSesi(k, s, cvp), cvp.en)));
    }
  }
  // Kino'nun selamı (sohbeti yok; dokununca el sallar ve kendi sesiyle selam verir)
  l.push({ id: 'en/k-hi', kim: 'kino', dil: 'en', metin: "Hi! I'm Kino!", hece: 3 });
  return l;
}
