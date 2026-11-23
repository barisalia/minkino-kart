/**
 * Polly's Riddles (dinlediğini anlama, 4 ve 5+) ve Odd One Out (kategori, 2–3 yaştan) · DOM'suz veri (21 Kasım 2026).
 * Oyunlar bölümünde iki kart; oyunlar adimlar/bilmece.ts ve adimlar/farkli-olan.ts. Yeni çizim yok: kelime kartları.
 * Bilmeceler ve turlar yalnız çocuğun kelime derslerini bitirdiği adaların kelimeleriyle kurulur (izinli adalar ekrandan
 * gelir; taslak ve test kipinde hepsi). Her cümle ayrı Polly kaydı (scripts/ingilizce-ses.ts --id).
 */
import type { SesMetni } from '../icerik';
import type { Yas } from '../plan';

type Rnd = () => number;
const karistir = <T>(l: readonly T[], rnd: Rnd): T[] => { const a = [...l]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const kimlik = (metin: string) => metin.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---------------------------------------------------------------- Polly's Riddles

export interface Bilmece { ada: string; hedef: string; ipuclari: readonly string[]; cevap: string }
const b = (ada: string, hedef: string, cevap: string, ...ipuclari: string[]): Bilmece => ({ ada, hedef, ipuclari, cevap });

/** 56 bilmece, ada sırasıyla. Kalıplar adalarda öğretilenler: renk, büyük/küçük, ses, "It can …", "You put it on …". */
export const BILMECELER: readonly Bilmece[] = [
  b('ciftlik', 'cow', 'It’s a cow.', 'It is an animal.', 'It is big.', 'It says moo.'),
  b('ciftlik', 'duck', 'It’s a duck.', 'It is an animal.', 'It can swim.', 'It says quack.'),
  b('ciftlik', 'sheep', 'It’s a sheep.', 'It is white.', 'It says baa.'),
  b('ciftlik', 'dog', 'It’s a dog.', 'It is an animal.', 'It says woof.'),
  b('ciftlik', 'cat', 'It’s a cat.', 'It is small.', 'It says meow.'),
  b('ciftlik', 'horse', 'It’s a horse.', 'It is big.', 'It says neigh.'),
  b('ciftlik', 'chicken', 'It’s a chicken.', 'It is small.', 'It says cluck.'),
  b('yiyecekler', 'banana', 'It’s a banana.', 'It is yellow.', 'It is a fruit.'),
  b('yiyecekler', 'apple', 'It’s an apple.', 'It is red.', 'It is a fruit.'),
  b('yiyecekler', 'pear', 'It’s a pear.', 'It is green.', 'It is a fruit.'),
  b('yiyecekler', 'milk', 'It’s milk.', 'You drink it.', 'A cow gives it.'),
  b('yiyecekler', 'egg', 'It’s an egg.', 'You eat it.', 'A chicken gives it.'),
  b('oyuncaklar', 'ball', 'It’s a ball.', 'It is a toy.', 'You can kick it.'),
  b('oyuncaklar', 'kite', 'It’s a kite.', 'It is a toy.', 'It can fly.'),
  b('oyuncaklar', 'drum', 'It’s a drum.', 'It is a toy.', 'It says boom, boom.'),
  b('oyuncaklar', 'teddy-bear', 'It’s a teddy bear.', 'It is a toy.', 'It is soft.', 'You hug it.'),
  b('oyuncaklar', 'balloon', 'It’s a balloon.', 'It is red.', 'It can go pop!'),
  b('yuzum', 'eyes', 'They are eyes.', 'You have two.', 'You see with them.'),
  b('yuzum', 'ears', 'They are ears.', 'You have two.', 'You hear with them.'),
  b('yuzum', 'nose', 'It’s a nose.', 'You have one.', 'You smell with it.'),
  b('yuzum', 'mouth', 'It’s a mouth.', 'You eat with it.', 'You talk with it.'),
  b('kiyafetler', 'hat', 'It’s a hat.', 'You put it on your head.'),
  b('kiyafetler', 'shoes', 'They are shoes.', 'You put them on your feet.', 'You walk in them.'),
  b('kiyafetler', 'socks', 'They are socks.', 'You put them on your feet.', 'They go in your shoes.'),
  b('kiyafetler', 'scarf', 'It’s a scarf.', 'It is cold today.', 'You put it on your neck.'),
  b('odam', 'bed', 'It’s a bed.', 'It is in your room.', 'You sleep in it.'),
  b('odam', 'chair', 'It’s a chair.', 'You sit on it.'),
  b('odam', 'clock', 'It’s a clock.', 'It says tick-tock.'),
  b('odam', 'door', 'It’s a door.', 'You open it.', 'You close it.'),
  b('tasitlar', 'plane', 'It’s a plane.', 'It is big.', 'It can fly.'),
  b('tasitlar', 'boat', 'It’s a boat.', 'It goes on the water.'),
  b('tasitlar', 'train', 'It’s a train.', 'It has many wheels.', 'It says choo-choo.'),
  b('tasitlar', 'bike', 'It’s a bike.', 'It has two wheels.', 'You ride it.'),
  b('tasitlar', 'rocket', 'It’s a rocket.', 'It goes up, up, up!', 'It goes to the moon.'),
  b('vahsi', 'lion', 'It’s a lion.', 'It is an animal.', 'It says roar.'),
  b('vahsi', 'elephant', 'It’s an elephant.', 'It is very big.', 'It has a long nose.'),
  b('vahsi', 'fish', 'It’s a fish.', 'It can swim.', 'It lives in water.'),
  b('vahsi', 'bird', 'It’s a bird.', 'It can fly.', 'It says tweet.'),
  b('vahsi', 'frog', 'It’s a frog.', 'It is green.', 'It can jump.'),
  b('vahsi', 'monkey', 'It’s a monkey.', 'It is an animal.', 'It likes bananas.'),
  b('vahsi', 'snake', 'It’s a snake.', 'It is green.', 'It says hiss.'),
  b('meyve', 'grapes', 'They are grapes.', 'They are green.', 'They are small.', 'They are fruit.'),
  b('meyve', 'watermelon', 'It’s a watermelon.', 'It is big.', 'It is green.', 'It is red inside.'),
  b('meyve', 'cherry', 'It’s a cherry.', 'It is red.', 'It is small.', 'It is a fruit.'),
  b('meyve', 'lemon', 'It’s a lemon.', 'It is yellow.', 'It is a fruit.'),
  b('meyve', 'carrot', 'It’s a carrot.', 'It is orange.', 'Rabbits like it.'),
  b('meyve', 'corn', 'It’s corn.', 'It is yellow.', 'It is not a fruit.'),
  b('hava', 'sun', 'It’s the sun.', 'It is in the sky.', 'It is hot.'),
  b('hava', 'snow', 'It’s snow.', 'It is white.', 'It is cold.'),
  b('hava', 'rain', 'It’s rain.', 'It is water.', 'It comes from a cloud.'),
  b('hava', 'rainbow', 'It’s a rainbow.', 'It is in the sky.', 'It has many colors.'),
  b('doga', 'moon', 'It’s the moon.', 'It is in the sky.', 'You see it at night.'),
  b('doga', 'tree', 'It’s a tree.', 'It is big.', 'It is green.', 'Birds live in it.'),
  b('doga', 'flower', 'It’s a flower.', 'It is red.', 'Bees like it.'),
  b('doga', 'leaf', 'It’s a leaf.', 'It is green.', 'It is on a tree.'),
  b('doga', 'mountain', 'It’s a mountain.', 'It is very big.', 'It has snow on top.'),
];

const bilmeceKimligi = (x: Bilmece) => `${x.ada}-${x.hedef}`;
export const ipucuSesi = (metin: string) => `en/g-rd-${kimlik(metin)}`;
export const cevapSesi = (x: Bilmece) => `en/g-rd-yes-${x.hedef}`;
/** Çoğul bilmecede (eyes, ears, shoes, socks, grapes) soru "What are they?" */
export const cogulMu = (x: Bilmece) => x.cevap.startsWith('They ');
export const soruMetni = (x: Bilmece) => (cogulMu(x) ? 'What are they?' : 'What is it?');
export const bilmeceSoruSesi = (x: Bilmece) => (cogulMu(x) ? 'en/g-what-are-they' : 'en/g-what-is-it');

// Her ipucunun uyduğu kelimeler (56 bilmece kelimesi içinde, karttaki çizime bakılarak; 21 Kasım). Bir bilmecenin
// herhangi bir ipucuna uyan kelime o bilmecede çeldirici olmaz: "It is big. It can fly." bilmecesinde balon (uçar),
// "It is white. It is cold." bilmecesinde süt gelmez. Göreli ipuçlarında (big, small, soft) liste geniş tutuldu.
const BUYUK = ['cow', 'horse', 'lion', 'elephant', 'plane', 'train', 'boat', 'rocket', 'bed', 'door', 'tree', 'mountain', 'watermelon', 'sun', 'moon', 'rainbow'];
const KUCUK = ['cat', 'duck', 'chicken', 'bird', 'fish', 'frog', 'cherry', 'grapes', 'egg', 'apple', 'banana', 'pear', 'lemon', 'carrot', 'corn', 'leaf', 'flower', 'socks', 'shoes', 'hat', 'ball', 'kite', 'drum', 'teddy-bear', 'balloon', 'nose', 'eyes', 'ears', 'mouth', 'clock', 'milk'];
const MEYVE = ['banana', 'apple', 'pear', 'cherry', 'lemon', 'grapes', 'watermelon'];
const YESIL = ['pear', 'grapes', 'frog', 'snake', 'tree', 'leaf', 'watermelon', 'mountain', 'corn'];
const HAYVAN = ['cow', 'duck', 'sheep', 'dog', 'cat', 'horse', 'chicken', 'lion', 'elephant', 'fish', 'bird', 'frog', 'monkey', 'snake'];
const OYUNCAK = ['ball', 'kite', 'drum', 'teddy-bear', 'balloon'];
const YIYECEK = [...MEYVE, 'egg', 'milk', 'carrot', 'corn'];
const GOKTE = ['sun', 'moon', 'rainbow', 'bird', 'plane', 'kite', 'balloon', 'rocket', 'rain', 'snow'];
export const IPUCU_UYANLAR: Readonly<Record<string, readonly string[]>> = {
  'It is an animal.': HAYVAN,
  'It is big.': BUYUK,
  'It is very big.': BUYUK,
  'It is small.': KUCUK,
  'They are small.': KUCUK,
  'It is a fruit.': MEYVE,
  'They are fruit.': MEYVE,
  'It is not a fruit.': [], // aşağıda: meyve olmayan her şey
  'It is green.': YESIL,
  'They are green.': YESIL,
  'It is red.': ['apple', 'balloon', 'ball', 'cherry', 'flower', 'drum', 'scarf', 'boat', 'rocket', 'watermelon'],
  'It is yellow.': ['banana', 'lemon', 'corn', 'duck', 'sun', 'moon', 'hat', 'clock', 'socks', 'lion'],
  'It is white.': ['sheep', 'chicken', 'snow', 'milk', 'rocket', 'plane'],
  'It is orange.': ['carrot', 'fish', 'cat', 'chair', 'bed'],
  'It is a toy.': OYUNCAK,
  'It is soft.': ['teddy-bear', 'sheep', 'socks', 'scarf', 'cat', 'dog', 'chicken', 'duck', 'bed', 'hat'],
  'It is cold.': ['snow', 'milk', 'rain'],
  'It is cold today.': ['scarf', 'hat', 'snow'],
  'It is hot.': ['sun'],
  'It is water.': ['rain', 'snow'],
  'It is in the sky.': GOKTE,
  'It is in your room.': ['bed', 'chair', 'clock', 'door', 'teddy-bear', 'ball', 'drum', 'kite', 'balloon', 'socks', 'shoes', 'hat'],
  'It is on a tree.': ['leaf', 'apple', 'cherry', 'pear', 'lemon', 'bird', 'monkey'],
  'It is red inside.': ['watermelon'],
  'It can swim.': ['duck', 'fish', 'frog', 'dog', 'snake'],
  'It can fly.': ['kite', 'plane', 'bird', 'balloon', 'rocket'],
  'It can jump.': ['frog', 'monkey', 'cat', 'dog', 'horse', 'lion'],
  'It can go pop!': ['balloon'],
  'It lives in water.': ['fish', 'frog', 'duck'],
  'It goes on the water.': ['boat', 'duck', 'fish'],
  'It goes up, up, up!': ['rocket', 'balloon', 'kite', 'plane', 'bird'],
  'It goes to the moon.': ['rocket'],
  'It has two wheels.': ['bike'],
  'It has many wheels.': ['train'],
  'It has a long nose.': ['elephant'],
  'It has many colors.': ['rainbow', 'rocket', 'boat', 'train'],
  'It has snow on top.': ['mountain'],
  'It comes from a cloud.': ['rain', 'snow'],
  'It likes bananas.': ['monkey'],
  'Rabbits like it.': ['carrot'],
  'Bees like it.': ['flower'],
  'Birds live in it.': ['tree'],
  'It says moo.': ['cow'],
  'It says quack.': ['duck'],
  'It says baa.': ['sheep'],
  'It says woof.': ['dog'],
  'It says meow.': ['cat'],
  'It says neigh.': ['horse'],
  'It says cluck.': ['chicken'],
  'It says roar.': ['lion'],
  'It says tweet.': ['bird'],
  'It says hiss.': ['snake'],
  'It says boom, boom.': ['drum'],
  'It says tick-tock.': ['clock'],
  'It says choo-choo.': ['train'],
  'You drink it.': ['milk'],
  'You eat it.': YIYECEK,
  'A cow gives it.': ['milk'],
  'A chicken gives it.': ['egg'],
  'You can kick it.': ['ball', 'balloon'],
  'You hug it.': ['teddy-bear', 'cat', 'dog'],
  'You have two.': ['eyes', 'ears', 'shoes', 'socks'],
  'You have one.': ['nose', 'mouth'],
  'You see with them.': ['eyes'],
  'You hear with them.': ['ears'],
  'You smell with it.': ['nose'],
  'You eat with it.': ['mouth'],
  'You talk with it.': ['mouth'],
  'You put it on your head.': ['hat'],
  'You put it on your neck.': ['scarf'],
  'You put them on your feet.': ['shoes', 'socks'],
  'You walk in them.': ['shoes'],
  'They go in your shoes.': ['socks'],
  'You sleep in it.': ['bed'],
  'You sit on it.': ['chair', 'bike', 'horse', 'bed'],
  'You open it.': ['door', 'milk'],
  'You close it.': ['door', 'milk'],
  'You ride it.': ['bike', 'horse', 'train', 'boat', 'plane'],
  'You see it at night.': ['moon'],
};
const BILMECE_KELIMELERI = BILMECELER.map((x) => x.hedef);
/** Bu ipucuna uyan kelimeler */
export function ipucunaUyanlar(metin: string): readonly string[] {
  if (metin === 'It is not a fruit.') return BILMECE_KELIMELERI.filter((w) => !MEYVE.includes(w));
  return IPUCU_UYANLAR[metin] ?? [];
}
/** Bu bilmecede çeldirici olamayacak kelimeler: hedef ve ipuçlarından herhangi birine uyan her kelime */
export function celdiriciOlamaz(x: Bilmece): Set<string> {
  return new Set([x.hedef, ...x.ipuclari.flatMap(ipucunaUyanlar)]);
}

export interface BilmeceTuru { bilmece: Bilmece; secenekler: string[] }

/**
 * Bir oturumun dört bilmecesi: yalnız izinli adalardan; bir önceki oturumda gelenler gelmez (yetmezse gelebilir).
 * Seçenekler: doğru kelime + iki çeldirici. Çeldirici başka adadan (Yüzüm kartları birbirine benzer) ve hiçbir ipucuna
 * uymaz (celdiriciOlamaz). İki çeldirici bulunamayan bilmece o oturuma alınmaz.
 */
export function bilmecePlani(izinli: ReadonlySet<string>, onceki: readonly string[], yas: Yas, rnd: Rnd = Math.random, acik: (id: string) => boolean = () => true): BilmeceTuru[] {
  const havuz = BILMECELER.filter((x) => izinli.has(x.ada) && acik(x.hedef));
  const adet = 3; void yas;
  const turu = (bilmece: Bilmece): BilmeceTuru | null => {
    const yasak = celdiriciOlamaz(bilmece);
    const diger = [...new Set(karistir(havuz.filter((x) => x.ada !== bilmece.ada && !yasak.has(x.hedef)), rnd).map((x) => x.hedef))].slice(0, adet - 1);
    return diger.length < adet - 1 ? null : { bilmece, secenekler: karistir([bilmece.hedef, ...diger], rnd) };
  };
  const kurulabilen = havuz.map(turu).filter((t): t is BilmeceTuru => !!t);
  const taze = kurulabilen.filter((t) => !onceki.includes(bilmeceKimligi(t.bilmece)));
  return [...karistir(taze, rnd), ...karistir(kurulabilen.filter((t) => !taze.includes(t)), rnd)].slice(0, 4);
}
export const bilmeceKimlikleri = (turlar: readonly BilmeceTuru[]) => turlar.map((t) => bilmeceKimligi(t.bilmece));

// ---------------------------------------------------------------- Odd One Out

export type Kategori = 'animal' | 'food' | 'toy' | 'clothes' | 'vehicle' | 'family' | 'color';
/** Kategorinin kelimeleri ve geldiği adalar */
export const KATEGORILER: Record<Kategori, { soru: string; kelimeler: readonly (readonly [string, string])[] }> = {
  animal: { soru: 'Which one is not an animal?', kelimeler: [['cow', 'ciftlik'], ['duck', 'ciftlik'], ['sheep', 'ciftlik'], ['dog', 'ciftlik'], ['cat', 'ciftlik'], ['horse', 'ciftlik'], ['lion', 'vahsi'], ['elephant', 'vahsi'], ['monkey', 'vahsi'], ['frog', 'vahsi']] },
  food: { soru: 'Which one is not food?', kelimeler: [['apple', 'yiyecekler'], ['banana', 'yiyecekler'], ['pear', 'yiyecekler'], ['bread', 'yiyecekler'], ['cheese', 'yiyecekler'], ['grapes', 'meyve'], ['watermelon', 'meyve'], ['carrot', 'meyve'], ['tomato', 'meyve']] },
  toy: { soru: 'Which one is not a toy?', kelimeler: [['ball', 'oyuncaklar'], ['teddy-bear', 'oyuncaklar'], ['doll', 'oyuncaklar'], ['kite', 'oyuncaklar'], ['robot', 'oyuncaklar'], ['drum', 'oyuncaklar']] },
  clothes: { soru: 'Which one is not clothes?', kelimeler: [['hat', 'kiyafetler'], ['shoes', 'kiyafetler'], ['socks', 'kiyafetler'], ['t-shirt', 'kiyafetler'], ['pants', 'kiyafetler'], ['jacket', 'kiyafetler']] },
  vehicle: { soru: 'Which one is not a vehicle?', kelimeler: [['car', 'tasitlar'], ['bus', 'tasitlar'], ['train', 'tasitlar'], ['plane', 'tasitlar'], ['boat', 'tasitlar'], ['bike', 'tasitlar']] },
  family: { soru: 'Which one is not family?', kelimeler: [['mom', 'ailem'], ['dad', 'ailem'], ['sister', 'ailem'], ['grandma', 'ailem'], ['grandpa', 'ailem']] },
  color: { soru: 'Which one is not a color?', kelimeler: [['red', 'renkler'], ['blue', 'renkler'], ['yellow', 'renkler'], ['green', 'renkler'], ['orange', 'renkler'], ['pink', 'renkler']] },
};

/** Farklı olan: kategori, farklı kelime (adası) ve Polly'nin açıklaması (her biri ayrı kayıt) */
export interface FarkliTur { kategori: Kategori; farkli: string; ada: string; aciklama: string }
const f = (kategori: Kategori, farkli: string, ada: string, aciklama: string): FarkliTur => ({ kategori, farkli, ada, aciklama });
/** 35 tur */
export const FARKLI_TURLAR: readonly FarkliTur[] = [
  f('animal', 'apple', 'yiyecekler', 'The apple is not an animal. It’s a fruit!'),
  f('animal', 'banana', 'yiyecekler', 'The banana is not an animal. It’s a fruit!'),
  f('animal', 'ball', 'oyuncaklar', 'The ball is not an animal. It’s a toy!'),
  f('animal', 'car', 'tasitlar', 'The car is not an animal. It’s a vehicle!'),
  f('animal', 'hat', 'kiyafetler', 'The hat is not an animal. You put it on your head!'),
  f('animal', 'carrot', 'meyve', 'The carrot is not an animal. It’s a vegetable!'),
  f('food', 'duck', 'ciftlik', 'The duck is not food. It’s an animal!'),
  f('food', 'cat', 'ciftlik', 'The cat is not food. It’s an animal!'),
  f('food', 'kite', 'oyuncaklar', 'The kite is not food. It’s a toy!'),
  f('food', 'bus', 'tasitlar', 'The bus is not food. It’s a vehicle!'),
  f('food', 'socks', 'kiyafetler', 'The socks are not food. You put them on your feet!'),
  f('toy', 'pear', 'yiyecekler', 'The pear is not a toy. It’s a fruit!'),
  f('toy', 'dog', 'ciftlik', 'The dog is not a toy. It’s an animal!'),
  f('toy', 'shoes', 'kiyafetler', 'The shoes are not toys. You put them on your feet!'),
  f('toy', 'cheese', 'yiyecekler', 'The cheese is not a toy. It’s food!'),
  f('toy', 'lion', 'vahsi', 'The lion is not a toy. It’s an animal!'),
  f('clothes', 'cow', 'ciftlik', 'The cow is not clothes. It’s an animal!'),
  f('clothes', 'apple', 'yiyecekler', 'The apple is not clothes. It’s a fruit!'),
  f('clothes', 'drum', 'oyuncaklar', 'The drum is not clothes. It’s a toy!'),
  f('clothes', 'plane', 'tasitlar', 'The plane is not clothes. It’s a vehicle!'),
  f('clothes', 'grapes', 'meyve', 'The grapes are not clothes. They are fruit!'),
  f('vehicle', 'horse', 'ciftlik', 'The horse is not a vehicle. It’s an animal!'),
  f('vehicle', 'banana', 'yiyecekler', 'The banana is not a vehicle. It’s a fruit!'),
  f('vehicle', 'teddy-bear', 'oyuncaklar', 'The teddy bear is not a vehicle. It’s a toy!'),
  f('vehicle', 'jacket', 'kiyafetler', 'The jacket is not a vehicle. You put it on!'),
  f('vehicle', 'elephant', 'vahsi', 'The elephant is not a vehicle. It’s an animal!'),
  f('family', 'sheep', 'ciftlik', 'The sheep is not family. It’s an animal!'),
  f('family', 'robot', 'oyuncaklar', 'The robot is not family. It’s a toy!'),
  f('family', 'bread', 'yiyecekler', 'The bread is not family. It’s food!'),
  f('family', 'boat', 'tasitlar', 'The boat is not family. It’s a vehicle!'),
  f('color', 'duck', 'ciftlik', 'The duck is not a color. It’s an animal!'),
  f('color', 'ball', 'oyuncaklar', 'The ball is not a color. It’s a toy!'),
  f('color', 'apple', 'yiyecekler', 'The apple is not a color. It’s a fruit!'),
  f('color', 'train', 'tasitlar', 'The train is not a color. It’s a vehicle!'),
  f('color', 'monkey', 'vahsi', 'The monkey is not a color. It’s an animal!'),
];

export const soruSesi = (k: Kategori) => `en/g-odd-q-${k}`;
export const aciklamaSesi = (t: FarkliTur) => `en/g-odd-${t.kategori}-${t.farkli}`;
export interface FarkliOyunTuru { tur: FarkliTur; kartlar: string[] }

/** Oturumda dört tur, her turda başka kategori; 2–3 yaşta iki eş + farklı (üç kart), büyüklerde üç eş + farklı (dört kart) */
export function farkliPlani(izinli: ReadonlySet<string>, yas: Yas, rnd: Rnd = Math.random, acik: (id: string) => boolean = () => true): FarkliOyunTuru[] {
  const es = yas === '2-3' ? 2 : 3;
  const esAdaylari = (k: Kategori) => KATEGORILER[k].kelimeler.filter(([w, a]) => izinli.has(a) && acik(w)).map(([w]) => w);
  const uygun = FARKLI_TURLAR.filter((t) => izinli.has(t.ada) && acik(t.farkli) && esAdaylari(t.kategori).length >= es);
  const secilen: FarkliTur[] = [];
  for (const t of karistir(uygun, rnd)) {
    if (secilen.length >= 4) break;
    if (!secilen.some((x) => x.kategori === t.kategori)) secilen.push(t);
  }
  for (const t of karistir(uygun, rnd)) { if (secilen.length >= 4) break; if (!secilen.includes(t)) secilen.push(t); }
  return secilen.map((tur) => {
    const esler = karistir(esAdaylari(tur.kategori), rnd).slice(0, es);
    return { tur, kartlar: karistir([tur.farkli, ...esler], rnd) };
  });
}

// ---------------------------------------------------------------- sesler

const hece = (s: string) => (s.toLowerCase().match(/[aeiouy]+/g) ?? []).length || 1;
const polly = (id: string, metin: string): SesMetni => ({ id, kim: 'polly', dil: 'en', metin, hece: hece(metin) });
const ceren = (id: string, metin: string): SesMetni => ({ id, kim: 'ceren', dil: 'tr', metin, hece: (metin.toLocaleLowerCase('tr').match(/[aeıioöuü]/g) ?? []).length });

export function bilmeceSesMetinleri(): SesMetni[] {
  const ipuclari = [...new Set(BILMECELER.flatMap((x) => x.ipuclari))];
  return [
    ceren('tr/c-bilmece-giris', 'Polly bilmece soracak! Dikkatle dinle. Polly neyi anlatıyor? Resmine dokun.'),
    ceren('tr/c-farkli-giris', 'Bu resimlerden biri ötekilere benzemiyor. Polly soracak, sen farklı olanı bul!'),
    polly('en/g-riddle-time', 'Riddle time! Listen.'),
    polly('en/g-odd-one-out', 'Find the odd one out!'),
    polly('en/g-listen-again', 'Listen again.'),
    polly('en/g-what-are-they', 'What are they?'),
    ...ipuclari.map((m) => polly(ipucuSesi(m), m)),
    ...[...new Map(BILMECELER.map((x) => [x.hedef, x])).values()].map((x) => polly(cevapSesi(x), `Yes! ${x.cevap}`)),
    ...(Object.keys(KATEGORILER) as Kategori[]).map((k) => polly(soruSesi(k), KATEGORILER[k].soru)),
    ...FARKLI_TURLAR.map((t) => polly(aciklamaSesi(t), t.aciklama)),
  ];
}

export function bilmeceOturumSesleri(turlar: readonly BilmeceTuru[]): string[] {
  const s = new Set(['tr/c-bilmece-giris', 'en/g-riddle-time', 'en/g-listen-again', 'en/g-well-done']);
  for (const t of turlar) { t.bilmece.ipuclari.forEach((m) => s.add(ipucuSesi(m))); s.add(bilmeceSoruSesi(t.bilmece)); s.add(cevapSesi(t.bilmece)); t.secenekler.forEach((w) => s.add(`en/w-${w}`)); }
  return [...s];
}
export function farkliOturumSesleri(turlar: readonly FarkliOyunTuru[]): string[] {
  const s = new Set(['tr/c-farkli-giris', 'en/g-odd-one-out', 'en/g-not-that', 'en/g-well-done']);
  for (const t of turlar) { s.add(soruSesi(t.tur.kategori)); s.add(aciklamaSesi(t.tur)); t.kartlar.forEach((w) => s.add(`en/w-${w}`)); }
  return [...s];
}
