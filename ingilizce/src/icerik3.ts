/**
 * Ceren Öğretmen ile İngilizceye Merhaba · 13–24. adalar (20 Kasım 2026, Barış: "İçeriği doldur; çocuk sıfırdan İngilizce
 * öğrenmeyi bekliyor."). Her ada bugünkü kalıpla gelir: 8 kelime (Seviye 1), iki kalıp dersi ve cümle şenliği (Seviye 2),
 * soru–cevap, cümle kurma ve 4 sayfalık hikâye (Seviye 3), Ceren'in ada girişi.
 *
 * Bu dosya yalnız tür alır (`import type`): icerik.ts kelimeleri, icerik2.ts Seviye 2–3 içeriğini buradan okur; döngü yok.
 * Seviye 2–3 kurucuları (f, kalip, sayfa …) icerik2.ts'ten parametre olarak gelir.
 * Çizimler: Astra Paket 17–21 (ekip/ingilizce/CIZIM-ISLERI.md). Çizimi ya da sesi gelmeyen ada ve kelime görünmez
 * (varlik.ts); geldikçe kendiliğinden açılır.
 */
import type { Kelime, Tur, Unite } from './icerik';
import type { Gorsel, Ifade, Ilerisi, KalipDersi, Sohbet } from './icerik2';

const k = (id: string, en: string, tr: string, tur: Tur, hece: number, ek: Partial<Kelime> = {}): Kelime => ({ id, en, tr, tur, hece, ...ek });

export const YENI_UNITELER: Unite[] = [
  {
    id: 'meyve', no: 13, en: 'Fruit and Vegetables', tr: 'Meyve ve Sebze', renk: '#ffd9a8', kapak: 'kutu',
    giris: 'Bugün bostandayız. Meyve ve sebzeleri toplayalım!',
    kelimeler: [
      k('grapes', 'grapes', 'üzüm', 'cogul', 1, { c: 'I like grapes.' }),
      k('watermelon', 'watermelon', 'karpuz', 'tekil', 4),
      k('cherry', 'cherry', 'kiraz', 'tekil', 2, { cogulu: 'cherries' }),
      k('lemon', 'lemon', 'limon', 'tekil', 2),
      k('carrot', 'carrot', 'havuç', 'tekil', 2),
      k('tomato', 'tomato', 'domates', 'tekil', 3, { cogulu: 'tomatoes' }),
      k('potato', 'potato', 'patates', 'tekil', 3, { cogulu: 'potatoes', ek: true }),
      k('corn', 'corn', 'mısır', 'sayilamaz', 1, { ek: true }),
    ],
  },
  {
    id: 'hava', no: 14, en: 'Weather', tr: 'Hava', renk: '#bfe0f7', kapak: 'kutu',
    giris: 'Pencereden bakalım. Bugün hava nasıl?',
    kelimeler: [
      k('sun', 'sun', 'güneş', 'tekil', 1, { c: "It's sunny.", q: 'Where is the sun?', y: 'Is it sunny?' }),
      k('rain', 'rain', 'yağmur', 'sayilamaz', 1, { c: "It's rainy.", q: 'Where is the rain?', y: 'Is it rainy?' }),
      k('snow', 'snow', 'kar', 'sayilamaz', 1, { c: "It's snowy.", q: 'Where is the snow?', y: 'Is it snowy?' }),
      k('wind', 'wind', 'rüzgâr', 'sayilamaz', 1, { c: "It's windy.", q: 'Where is the wind?', y: 'Is it windy?' }),
      k('cloud', 'cloud', 'bulut', 'tekil', 1, { c: "It's cloudy.", y: 'Is it cloudy?' }),
      k('rainbow', 'rainbow', 'gökkuşağı', 'tekil', 2),
      k('hot', 'hot', 'sıcak', 'sayilamaz', 1, { q: 'Which one is hot?', ek: true }),
      k('cold', 'cold', 'soğuk', 'sayilamaz', 1, { q: 'Which one is cold?', ek: true }),
    ],
  },
  {
    id: 'doga', no: 15, en: 'Nature', tr: 'Doğa', renk: '#cde9b5', kapak: 'kutu',
    giris: 'Bugün doğada yürüyüşe çıkıyoruz. Etrafına iyi bak!',
    kelimeler: [
      k('tree', 'tree', 'ağaç', 'tekil', 1),
      k('flower', 'flower', 'çiçek', 'tekil', 2),
      k('leaf', 'leaf', 'yaprak', 'tekil', 1, { cogulu: 'leaves' }),
      k('grass', 'grass', 'çimen', 'sayilamaz', 1),
      k('river', 'river', 'dere', 'tekil', 2),
      k('mountain', 'mountain', 'dağ', 'tekil', 2),
      k('star', 'star', 'yıldız', 'tekil', 1, { ek: true }),
      k('moon', 'moon', 'ay', 'tekil', 1, { c: 'I see the moon.', q: 'Where is the moon?', y: 'Is it the moon?', ek: true }),
    ],
  },
  {
    id: 'evim', no: 16, en: 'My Home', tr: 'Evim', renk: '#f6d3b8', kapak: 'kutu',
    giris: "Kino bizi evine çağırdı. Hadi, içeri girelim!",
    kelimeler: [
      k('house', 'house', 'ev', 'tekil', 1, { c: 'This is my house.', q: 'Where is the house?', y: 'Is it a house?' }),
      k('kitchen', 'kitchen', 'mutfak', 'tekil', 2, { c: 'This is the kitchen.', q: 'Where is the kitchen?', y: 'Is it the kitchen?' }),
      k('bathroom', 'bathroom', 'banyo', 'tekil', 2, { c: 'This is the bathroom.', q: 'Where is the bathroom?', y: 'Is it the bathroom?' }),
      k('bedroom', 'bedroom', 'yatak odası', 'tekil', 2, { c: 'This is the bedroom.', q: 'Where is the bedroom?', y: 'Is it the bedroom?' }),
      k('garden', 'garden', 'bahçe', 'tekil', 2, { c: 'This is the garden.', q: 'Where is the garden?', y: 'Is it the garden?' }),
      k('stairs', 'stairs', 'merdiven', 'cogul', 1),
      k('roof', 'roof', 'çatı', 'tekil', 1, { c: "It's the roof.", q: 'Where is the roof?', y: 'Is it the roof?', ek: true }),
      k('key', 'key', 'anahtar', 'tekil', 1, { ek: true }),
    ],
  },
  {
    id: 'okul', no: 17, en: 'School', tr: 'Okul', renk: '#fbe39a', kapak: 'kutu',
    giris: 'Zil çaldı! Bugün Kino ile okula gidiyoruz.',
    kelimeler: [
      k('book', 'book', 'kitap', 'tekil', 1),
      k('pencil', 'pencil', 'kurşunkalem', 'tekil', 2),
      k('bag', 'bag', 'çanta', 'tekil', 1),
      k('crayon', 'crayon', 'boya kalemi', 'tekil', 2),
      k('paper', 'paper', 'kağıt', 'sayilamaz', 2),
      k('scissors', 'scissors', 'makas', 'cogul', 2),
      k('desk', 'desk', 'sıra', 'tekil', 1, { ek: true }),
      k('school', 'school', 'okul', 'tekil', 1, { c: 'This is my school.', q: 'Where is the school?', y: 'Is it a school?', ek: true }),
    ],
  },
  {
    id: 'duygular', no: 18, en: 'Feelings', tr: 'Duygular', renk: '#f7c6dc', kapak: 'kutu',
    giris: "Bugün Kino'nun yüzüne bakıp nasıl hissettiğini bulacağız.",
    kelimeler: [
      k('happy', 'happy', 'mutlu', 'sayilamaz', 2, { c: 'I am happy.', q: 'Who is happy?', y: 'Is Kino happy?' }),
      k('sad', 'sad', 'üzgün', 'sayilamaz', 1, { c: 'I am sad.', q: 'Who is sad?', y: 'Is Kino sad?' }),
      k('angry', 'angry', 'kızgın', 'sayilamaz', 2, { c: 'I am angry.', q: 'Who is angry?', y: 'Is Kino angry?' }),
      k('sleepy', 'sleepy', 'uykulu', 'sayilamaz', 2, { c: 'I am sleepy.', q: 'Who is sleepy?', y: 'Is Kino sleepy?' }),
      k('hungry', 'hungry', 'aç', 'sayilamaz', 2, { c: 'I am hungry.', q: 'Who is hungry?', y: 'Is Kino hungry?' }),
      k('thirsty', 'thirsty', 'susamış', 'sayilamaz', 2, { c: 'I am thirsty.', q: 'Who is thirsty?', y: 'Is Kino thirsty?' }),
      k('scared', 'scared', 'korkmuş', 'sayilamaz', 1, { c: 'I am scared.', q: 'Who is scared?', y: 'Is Kino scared?', ek: true }),
      k('surprised', 'surprised', 'şaşkın', 'sayilamaz', 2, { c: 'I am surprised.', q: 'Who is surprised?', y: 'Is Kino surprised?', ek: true }),
    ],
  },
  {
    id: 'sekiller', no: 19, en: 'Shapes and Sizes', tr: 'Şekil ve Boy', renk: '#d8cdf3', kapak: 'kutu',
    giris: 'Bugün şekilleri ve büyük, küçük, uzun, kısa demeyi öğreniyoruz.',
    kelimeler: [
      k('circle', 'circle', 'daire', 'tekil', 2),
      k('square', 'square', 'kare', 'tekil', 1),
      k('triangle', 'triangle', 'üçgen', 'tekil', 3),
      k('heart', 'heart', 'kalp', 'tekil', 1),
      k('big', 'big', 'büyük', 'sayilamaz', 1, { q: 'Which one is big?' }),
      k('small', 'small', 'küçük', 'sayilamaz', 1, { q: 'Which one is small?' }),
      k('long', 'long', 'uzun', 'sayilamaz', 1, { q: 'Which one is long?', ek: true }),
      k('short', 'short', 'kısa', 'sayilamaz', 1, { q: 'Which one is short?', ek: true }),
    ],
  },
  {
    id: 'sofra', no: 20, en: 'At the Table', tr: 'Sofra', renk: '#ffcfb5', kapak: 'kutu',
    giris: 'Sofra kuruldu! Lokum da bizimle yemek yiyecek.',
    kelimeler: [
      k('plate', 'plate', 'tabak', 'tekil', 1),
      k('cup', 'cup', 'fincan', 'tekil', 1),
      k('spoon', 'spoon', 'kaşık', 'tekil', 1),
      k('fork', 'fork', 'çatal', 'tekil', 1),
      k('bowl', 'bowl', 'kâse', 'tekil', 1),
      k('juice', 'juice', 'meyve suyu', 'sayilamaz', 1, { c: 'I like juice.' }),
      k('soup', 'soup', 'çorba', 'sayilamaz', 1, { c: 'I like soup.', ek: true }),
      k('cake', 'cake', 'pasta', 'tekil', 1, { c: 'I like cake.', ek: true }),
    ],
  },
  {
    id: 'park', no: 21, en: 'The Park', tr: 'Park', renk: '#c7e8c4', kapak: 'kutu',
    giris: 'Parka geldik! Kaydırak, salıncak, hepsi bizi bekliyor.',
    kelimeler: [
      k('slide', 'slide', 'kaydırak', 'tekil', 1),
      k('swing', 'swing', 'salıncak', 'tekil', 1),
      k('seesaw', 'seesaw', 'tahterevalli', 'tekil', 2),
      k('sand', 'sand', 'kum', 'sayilamaz', 1),
      k('bucket', 'bucket', 'kova', 'tekil', 2),
      k('shovel', 'shovel', 'kürek', 'tekil', 2),
      k('bench', 'bench', 'bank', 'tekil', 1, { cogulu: 'benches', ek: true }),
      k('fountain', 'fountain', 'çeşme', 'tekil', 2, { ek: true }),
    ],
  },
  {
    id: 'vucudum', no: 22, en: 'My Body 2', tr: 'Vücudum', renk: '#fcd6c4', kapak: 'kutu',
    giris: 'Kalk bakalım! Bugün Kino ile vücudumuzu tanıyoruz.',
    kelimeler: [
      k('arms', 'arms', 'kollar', 'cogul', 1, { c: 'Shake your arms.' }),
      k('fingers', 'fingers', 'parmaklar', 'cogul', 2, { c: 'Wiggle your fingers.' }),
      k('tummy', 'tummy', 'karın', 'tekil', 2, { c: 'Rub your tummy.' }),
      k('knees', 'knees', 'dizler', 'cogul', 1, { c: 'Touch your knees.' }),
      k('shoulders', 'shoulders', 'omuzlar', 'cogul', 2, { c: 'Touch your shoulders.' }),
      k('toes', 'toes', 'ayak parmakları', 'cogul', 1, { c: 'Touch your toes.' }),
      k('hair', 'hair', 'saç', 'sayilamaz', 1, { c: 'Brush your hair.', ek: true }),
      k('teeth', 'teeth', 'dişler', 'cogul', 1, { c: 'Show me your teeth.', ek: true }),
    ],
  },
  {
    id: 'gunum', no: 23, en: 'My Day', tr: 'Günüm', renk: '#ffe6a6', kapak: 'kutu',
    giris: "Günaydın! Bugün Kino'nun bir gününü birlikte geçiriyoruz.",
    kelimeler: [
      k('wake-up', 'wake up', 'uyan', 'eylem', 2, { c: 'I wake up.', q: 'Wake up!', y: 'Is Kino waking up?' }),
      k('wash', 'wash', 'yıka', 'eylem', 1, { c: 'I wash my face.', q: 'Wash!', y: 'Is Kino washing?' }),
      k('brush', 'brush', 'fırçala', 'eylem', 1, { c: 'I brush my teeth.', q: 'Brush!', y: 'Is Kino brushing?' }),
      k('read', 'read', 'oku', 'eylem', 1, { c: 'I read a book.', q: 'Read!', y: 'Is Kino reading?' }),
      k('draw', 'draw', 'çiz', 'eylem', 1, { c: 'I draw a picture.', q: 'Draw!', y: 'Is Kino drawing?' }),
      k('sing', 'sing', 'şarkı söyle', 'eylem', 1, { c: 'I sing a song.', q: 'Sing!', y: 'Is Kino singing?' }),
      k('play', 'play', 'oyna', 'eylem', 1, { c: 'I play with my ball.', q: 'Play!', y: 'Is Kino playing?', ek: true }),
      k('hug', 'hug', 'sarıl', 'eylem', 1, { c: 'I hug my teddy bear.', q: 'Hug!', y: 'Is Kino hugging?', ek: true }),
    ],
  },
  {
    id: 'sayilar2', no: 24, en: 'Numbers and Colors 2', tr: 'Sayılar ve Renkler 2', renk: '#f3d4f2', kapak: 'kutu',
    giris: 'Saymaya devam! Bugün on ikiye kadar sayıyor, yeni renkler öğreniyoruz.',
    kelimeler: [
      k('nine', 'nine', 'dokuz', 'sayi', 1),
      k('ten', 'ten', 'on', 'sayi', 1),
      k('white', 'white', 'beyaz', 'renk', 1),
      k('brown', 'brown', 'kahverengi', 'renk', 1),
      k('eleven', 'eleven', 'on bir', 'sayi', 3),
      k('twelve', 'twelve', 'on iki', 'sayi', 1),
      k('gray', 'gray', 'gri', 'renk', 1, { ek: true }),
      k('gold', 'gold', 'altın rengi', 'renk', 1, { ek: true }),
    ],
  },
];

// ---------------------------------------------------------------- Seviye 2 ve 3

type Tas = [en: string, kaynak: string];
/** icerik2.ts'in kurucuları (döngüsüz kullanım için parametre olarak gelir) */
export interface Kurucular {
  f: (id: string, en: string, tr: string, g: Gorsel, taslar?: Tas[], ek?: Partial<Ifade>) => Ifade;
  kalip: (ad: string, aciklama: string, ifadeler: Ifade[]) => KalipDersi;
  kc: (kelimeId: string) => Ifade;
  sayfa: (unite: string, n: number, en: string, tr: string, ek?: Partial<Ifade>) => Ifade;
  o: (ozel: string) => Gorsel;
  ayniSoru: (ad: string, en: string, tr: string, turlar: [Gorsel, Ifade][]) => Sohbet[];
  ozelSoru: (id: string, en: string, tr: string, g: Gorsel, dogru: Ifade, ek?: Partial<Sohbet>) => Sohbet;
  EVET_OYLE: Ifade; HAYIR_DEGIL: Ifade; EVET_SEVERIM: Ifade; HAYIR_SEVMEM: Ifade;
}

/** Bu dosyanın Polly ortak soruları (en/g-<ad>; icerik2.ts → POLLY_SOZLERI2'ye eklenir) */
export const YENI_POLLY_SOZLERI2: Record<string, [metin: string, hece: number]> = {
  'what-shape': ['What shape is it?', 4],
  'how-do-you-feel': ['How do you feel?', 4],
  'what-is-it-2': ['What is this?', 3],
};

export function yeniIlerisi(h: Kurucular): Record<string, Ilerisi> {
  const { f, kalip, kc, sayfa, o, ayniSoru, ozelSoru, EVET_OYLE, HAYIR_DEGIL, EVET_SEVERIM, HAYIR_SEVMEM } = h;
  const s: Record<string, Ilerisi> = {};
  const hikaye = (id: string, en: string, tr: string, giris: string, cumleler: [string, string][]) => ({
    en, tr, giris, sayfalar: cumleler.map(([e, t], i) => sayfa(id, i + 1, e, t)),
  });

  // 13 · Meyve ve Sebze: rica (I want …, please) · renk (The lemon is yellow.)
  s.meyve = {
    a: kalip('Can I have a lemon?', 'Bir şey isterken İngilizce kibarca sorarız. Kino ne istiyor, dinle!', [
      f('meyve-a1', 'Can I have grapes?', 'Üzüm alabilir miyim?', { k: 'grapes', kino: 'tut' }, [['Can I have', 'p'], ['grapes', 'w:grapes']]),
      f('meyve-a2', 'Can I have a lemon?', 'Bir limon alabilir miyim?', { k: 'lemon', kino: 'tut' }, [['Can I have', 'p'], ['a lemon', 'w:lemon']]),
      f('meyve-a3', 'Can I have a carrot?', 'Bir havuç alabilir miyim?', { k: 'carrot', kino: 'tut' }, [['Can I have', 'p'], ['a carrot', 'w:carrot']]),
      f('meyve-a4', 'Can I have a tomato?', 'Bir domates alabilir miyim?', { k: 'tomato', kino: 'tut' }, [['Can I have', 'p'], ['a tomato', 'w:tomato']]),
    ]),
    b: kalip('The lemon is yellow', 'Her meyvenin, her sebzenin bir rengi var. Rengini İngilizce söyleyelim!', [
      f('meyve-b1', 'The lemon is yellow.', 'Limon sarı.', { k: 'lemon' }, [['The lemon', 'w:lemon'], ['is', 'p'], ['yellow', 'w:yellow']]),
      f('meyve-b2', 'The carrot is orange.', 'Havuç turuncu.', { k: 'carrot' }, [['The carrot', 'w:carrot'], ['is', 'p'], ['orange', 'w:orange']]),
      f('meyve-b3', 'The tomato is red.', 'Domates kırmızı.', { k: 'tomato' }, [['The tomato', 'w:tomato'], ['is', 'p'], ['red', 'w:red']]),
      f('meyve-b4', 'The watermelon is green.', 'Karpuz yeşil.', { k: 'watermelon' }, [['The watermelon', 'w:watermelon'], ['is', 'p'], ['green', 'w:green']]),
    ]),
    sohbet: { aciklama: 'Polly, ne renk diye soracak. Doğru cevaba dokun.', turlar: ayniSoru('what-color', 'What color is it?', 'Ne renk?', [
      [{ k: 'lemon' }, kc('yellow')], [{ k: 'carrot' }, kc('orange')], [{ k: 'tomato' }, kc('red')], [{ k: 'watermelon' }, kc('green')],
    ]) },
    kur: [
      f('meyve-k1', 'I like grapes and cherries.', 'Üzüm ve kiraz severim.', { k: 'grapes', ile: 'cherry', kino: 'sev' }, [['I like', 'p'], ['grapes', 'w:grapes'], ['and', 'p'], ['cherries', 'c:cherry']]),
      f('meyve-k2', 'I want a big watermelon.', 'Büyük bir karpuz istiyorum.', { k: 'watermelon', boy: 'big' }, [['I want', 'p'], ['a big', 'p'], ['watermelon', 'w:watermelon']]),
      f('meyve-k3', "I don't like lemons.", 'Limon sevmem.', { k: 'lemon', kino: 'sevme' }, [["I don't like", 'p'], ['lemons', 'c:lemon']]),
      f('meyve-k4', 'I have two carrots.', 'İki havucum var.', { k: 'carrot', adet: 2, kino: 'tut' }, [['I have', 'p'], ['two', 'w:two'], ['carrots', 'c:carrot']]),
    ],
    hikaye: hikaye('meyve', 'The Big Salad', 'Kocaman Salata', 'Kino bostana gitmiş. Bakalım neler toplayacak?', [
      ['Kino is in the garden.', 'Kino bostanda.'],
      ['He picks a carrot.', 'Bir havuç topluyor.'],
      ['He picks a tomato.', 'Bir domates topluyor.'],
      ['Yummy! A big salad.', 'Nefis! Kocaman bir salata.'],
    ]),
  };

  // 14 · Hava: bugün (It's hot today.) · ve (the sun and a cloud)
  s.hava = {
    a: kalip("It's hot today", 'Bugün hava nasıl? Polly söyleyecek, sen de resme bak!', [
      f('hava-a1', "It's hot today.", 'Bugün hava sıcak.', { k: 'hot' }, [["It's", 'p'], ['hot', 'w:hot'], ['today', 'p']]),
      f('hava-a2', "It's cold today.", 'Bugün hava soğuk.', { k: 'cold' }, [["It's", 'p'], ['cold', 'w:cold'], ['today', 'p']]),
      f('hava-a3', "It's sunny today.", 'Bugün hava güneşli.', { k: 'sun' }, [["It's sunny", 'p'], ['today', 'p']]),
      f('hava-a4', "It's rainy today.", 'Bugün hava yağmurlu.', { k: 'rain' }, [["It's rainy", 'p'], ['today', 'p']]),
    ]),
    b: kalip('I see the sun and a cloud', 'Gökyüzüne bak! Polly iki şeyi birlikte söyleyecek.', [
      f('hava-b1', 'I see the sun and a cloud.', 'Güneşi ve bir bulutu görüyorum.', { k: 'sun', ile: 'cloud' }, [['I see', 'p'], ['the sun', 'w:sun'], ['and', 'p'], ['a cloud', 'w:cloud']]),
      f('hava-b2', 'I see a rainbow and a cloud.', 'Bir gökkuşağı ve bir bulut görüyorum.', { k: 'rainbow', ile: 'cloud' }, [['I see', 'p'], ['a rainbow', 'w:rainbow'], ['and', 'p'], ['a cloud', 'w:cloud']]),
      f('hava-b3', 'I see rain and snow.', 'Yağmur ve kar görüyorum.', { k: 'rain', ile: 'snow' }, [['I see', 'p'], ['rain', 'w:rain'], ['and', 'p'], ['snow', 'w:snow']]),
      f('hava-b4', 'I see the sun and a rainbow.', 'Güneşi ve bir gökkuşağını görüyorum.', { k: 'sun', ile: 'rainbow' }, [['I see', 'p'], ['the sun', 'w:sun'], ['and', 'p'], ['a rainbow', 'w:rainbow']]),
    ]),
    sohbet: { aciklama: 'Polly havayı soracak. Evet ya da hayır de, doğru cevaba dokun.', turlar: [
      ozelSoru('hava-s1', 'Is it hot?', 'Hava sıcak mı?', { k: 'hot' }, EVET_OYLE, { secenekler: [EVET_OYLE, HAYIR_DEGIL] }),
      ozelSoru('hava-s2', 'Is it sunny?', 'Hava güneşli mi?', { k: 'rain' }, HAYIR_DEGIL, { secenekler: [EVET_OYLE, HAYIR_DEGIL] }),
      ozelSoru('hava-s3', 'Is it cold?', 'Hava soğuk mu?', { k: 'cold' }, EVET_OYLE, { secenekler: [EVET_OYLE, HAYIR_DEGIL] }),
      ozelSoru('hava-s4', 'Is it snowy?', 'Kar yağıyor mu?', { k: 'sun' }, HAYIR_DEGIL, { secenekler: [EVET_OYLE, HAYIR_DEGIL] }),
    ] },
    kur: [
      f('hava-k1', "It's sunny and hot.", 'Hava güneşli ve sıcak.', { k: 'sun', ile: 'hot' }, [["It's sunny", 'p'], ['and', 'p'], ['hot', 'w:hot']]),
      f('hava-k2', "It's snowy and cold.", 'Kar yağıyor ve hava soğuk.', { k: 'snow', ile: 'cold' }, [["It's snowy", 'p'], ['and', 'p'], ['cold', 'w:cold']]),
      f('hava-k3', 'I see a big rainbow.', 'Büyük bir gökkuşağı görüyorum.', { k: 'rainbow', boy: 'big' }, [['I see', 'p'], ['a big', 'p'], ['rainbow', 'w:rainbow']]),
      f('hava-k4', "It's cold. Put on your hat.", 'Hava soğuk. Şapkanı tak.', { k: 'cold', ile: 'hat' }, [["It's", 'p'], ['cold.', 'w:cold'], ['Put on your hat', 'p']]),
    ],
    hikaye: hikaye('hava', 'Rain, Rain!', 'Yağmur, Yağmur!', 'Kino dışarıda oynuyor. Gökyüzüne iyi bak!', [
      ["It's sunny. Kino plays outside.", 'Hava güneşli. Kino dışarıda oynuyor.'],
      ['Oh! A big cloud.', 'Aa! Kocaman bir bulut.'],
      ["It's rainy now.", 'Şimdi yağmur yağıyor.'],
      ['Look! A rainbow!', 'Bak! Bir gökkuşağı!'],
    ]),
  };

  // 15 · Doğa: sayı + çoğul · ve
  s.doga = {
    a: kalip('Three flowers', 'Doğada kaç tane var? Önce say, sonra Polly ile söyle!', [
      f('doga-a1', 'Two trees.', 'İki ağaç.', { k: 'tree', adet: 2 }, [['Two', 'w:two'], ['trees', 'c:tree']]),
      f('doga-a2', 'Three flowers.', 'Üç çiçek.', { k: 'flower', adet: 3 }, [['Three', 'w:three'], ['flowers', 'c:flower']]),
      f('doga-a3', 'Four leaves.', 'Dört yaprak.', { k: 'leaf', adet: 4 }, [['Four', 'w:four'], ['leaves', 'c:leaf']]),
      f('doga-a4', 'Five stars.', 'Beş yıldız.', { k: 'star', adet: 5 }, [['Five', 'w:five'], ['stars', 'c:star']]),
    ]),
    b: kalip('The moon and the stars', 'Doğada her şey bir arada. Polly ikisini birlikte söyleyecek.', [
      f('doga-b1', 'A tree and a flower.', 'Bir ağaç ve bir çiçek.', { k: 'tree', ile: 'flower' }, [['A tree', 'w:tree'], ['and', 'p'], ['a flower', 'w:flower']]),
      f('doga-b2', 'A river and a mountain.', 'Bir dere ve bir dağ.', { k: 'river', ile: 'mountain' }, [['A river', 'w:river'], ['and', 'p'], ['a mountain', 'w:mountain']]),
      f('doga-b3', 'The moon and a star.', 'Ay ve bir yıldız.', { k: 'moon', ile: 'star' }, [['The moon', 'w:moon'], ['and', 'p'], ['a star', 'w:star']]),
      f('doga-b4', 'A leaf and the grass.', 'Bir yaprak ve çimenler.', { k: 'leaf', ile: 'grass' }, [['A leaf', 'w:leaf'], ['and', 'p'], ['the grass', 'w:grass']]),
    ]),
    sohbet: { aciklama: 'Polly, bu ne diye soracak. Doğru cevaba dokun.', turlar: ayniSoru('what-is-it', 'What is it?', 'Bu ne?', ['tree', 'flower', 'river', 'mountain'].map((x): [Gorsel, Ifade] => [{ k: x }, kc(x)])) },
    kur: [
      f('doga-k1', 'I see three flowers and a tree.', 'Üç çiçek ve bir ağaç görüyorum.', { k: 'flower', adet: 3, ile: 'tree' }, [['I see', 'p'], ['three', 'w:three'], ['flowers', 'c:flower'], ['and', 'p'], ['a tree', 'w:tree']]),
      f('doga-k2', 'I see a big mountain.', 'Büyük bir dağ görüyorum.', { k: 'mountain', boy: 'big' }, [['I see', 'p'], ['a big', 'p'], ['mountain', 'w:mountain']]),
      f('doga-k3', 'I see the moon and five stars.', 'Ayı ve beş yıldızı görüyorum.', { k: 'star', adet: 5, ile: 'moon' }, [['I see', 'p'], ['the moon', 'w:moon'], ['and', 'p'], ['five', 'w:five'], ['stars', 'c:star']]),
      f('doga-k4', 'I see a small flower.', 'Küçük bir çiçek görüyorum.', { k: 'flower', boy: 'small' }, [['I see', 'p'], ['a small', 'p'], ['flower', 'w:flower']]),
    ],
    hikaye: hikaye('doga', 'Night by the River', 'Dere Kıyısında Gece', 'Kino dere kıyısında yürüyor. Akşam oluyor, bak neler göreceğiz!', [
      ['Kino walks by the river.', 'Kino dere kıyısında yürüyor.'],
      ['He sees a big tree.', 'Büyük bir ağaç görüyor.'],
      ['Look! The moon and the stars.', 'Bak! Ay ve yıldızlar.'],
      ['Good night, river!', 'İyi geceler dere!'],
    ]),
  };

  // 16 · Evim: Kino nerede? (Kino is in the kitchen.) · I love my …
  s.evim = {
    a: kalip('Kino is in the kitchen', 'Kino evin neresinde? Polly söyleyecek, sen resme bak!', [
      f('evim-a1', 'Kino is in the kitchen.', 'Kino mutfakta.', o('eylem/kino-in-kitchen'), [['Kino', 'r:kisi/kino-kart-1'], ['is in', 'p'], ['the kitchen', 'w:kitchen']]),
      f('evim-a2', 'Kino is in the bathroom.', 'Kino banyoda.', o('eylem/kino-in-bathroom'), [['Kino', 'r:kisi/kino-kart-1'], ['is in', 'p'], ['the bathroom', 'w:bathroom']]),
      f('evim-a3', 'Kino is in the bedroom.', 'Kino yatak odasında.', o('eylem/kino-in-bedroom'), [['Kino', 'r:kisi/kino-kart-1'], ['is in', 'p'], ['the bedroom', 'w:bedroom']]),
      f('evim-a4', 'Kino is in the garden.', 'Kino bahçede.', o('eylem/kino-in-garden'), [['Kino', 'r:kisi/kino-kart-1'], ['is in', 'p'], ['the garden', 'w:garden']]),
    ]),
    b: kalip('I love my house', 'Kino evini çok seviyor. Polly, onun en sevdiği yerleri söyleyecek.', [
      f('evim-b1', 'I love my house.', 'Evimi çok severim.', { k: 'house', kalp: true }, [['I love', 'p'], ['my house', 'w:house']]),
      f('evim-b2', 'I love my garden.', 'Bahçemi çok severim.', { k: 'garden', kalp: true }, [['I love', 'p'], ['my garden', 'w:garden']]),
      f('evim-b3', 'I love my bedroom.', 'Yatak odamı çok severim.', { k: 'bedroom', kalp: true }, [['I love', 'p'], ['my bedroom', 'w:bedroom']]),
      f('evim-b4', 'I love my kitchen.', 'Mutfağımı çok severim.', { k: 'kitchen', kalp: true }, [['I love', 'p'], ['my kitchen', 'w:kitchen']]),
    ]),
    sohbet: { aciklama: 'Polly, bunu evin neresinde yaparsın diye soracak. Doğru yere dokun.', turlar: [
      ozelSoru('evim-s1', 'Where do you sleep?', 'Nerede uyursun?', o('eylem/kino-in-bedroom'), kc('bedroom')),
      ozelSoru('evim-s2', 'Where do you cook?', 'Nerede yemek pişirirsin?', o('eylem/kino-in-kitchen'), kc('kitchen')),
      ozelSoru('evim-s3', 'Where do you take a bath?', 'Nerede banyo yaparsın?', o('eylem/kino-in-bathroom'), kc('bathroom')),
      ozelSoru('evim-s4', 'Where do you play?', 'Nerede oynarsın?', o('eylem/kino-in-garden'), kc('garden')),
    ] },
    kur: [
      f('evim-k1', 'I see a house and a garden.', 'Bir ev ve bir bahçe görüyorum.', { k: 'house', ile: 'garden' }, [['I see', 'p'], ['a house', 'w:house'], ['and', 'p'], ['a garden', 'w:garden']]),
      f('evim-k2', 'I have a key.', 'Bir anahtarım var.', { k: 'key', kino: 'tut' }, [['I have', 'p'], ['a key', 'w:key']]),
      f('evim-k3', 'Kino is in the bedroom. Good night!', 'Kino yatak odasında. İyi geceler!', o('eylem/kino-in-bedroom'), [['Kino', 'r:kisi/kino-kart-1'], ['is in', 'p'], ['the bedroom.', 'w:bedroom'], ['Good night', 'p']]),
      f('evim-k4', 'I see a big house.', 'Büyük bir ev görüyorum.', { k: 'house', boy: 'big' }, [['I see', 'p'], ['a big', 'p'], ['house', 'w:house']]),
    ],
    hikaye: hikaye('evim', 'Where is the Key?', 'Anahtar Nerede?', 'Kino anahtarını kaybetmiş. Hadi, birlikte arayalım!', [
      ["Kino can't find his key.", 'Kino anahtarını bulamıyor.'],
      ['Is it in the kitchen? No!', 'Mutfakta mı? Hayır!'],
      ['Is it in the garden? No!', 'Bahçede mi? Hayır!'],
      ["It's on the roof! Thank you, Polly!", 'Çatıdaymış! Teşekkürler Polly!'],
    ]),
  };

  // 17 · Okul: I have … · renk + nesne (A red crayon.)
  s.okul = {
    a: kalip('I have a book', 'Kino okul çantasını hazırlıyor. Elinde ne var, dinle!', [
      f('okul-a1', 'I have a book.', 'Bir kitabım var.', { k: 'book', kino: 'tut' }, [['I have', 'p'], ['a book', 'w:book']]),
      f('okul-a2', 'I have a pencil.', 'Bir kurşunkalemim var.', { k: 'pencil', kino: 'tut' }, [['I have', 'p'], ['a pencil', 'w:pencil']]),
      f('okul-a3', 'I have a bag.', 'Bir çantam var.', { k: 'bag', kino: 'tut' }, [['I have', 'p'], ['a bag', 'w:bag']]),
      f('okul-a4', 'I have scissors.', 'Bir makasım var.', { k: 'scissors', kino: 'tut' }, [['I have', 'p'], ['scissors', 'w:scissors']]),
    ]),
    b: kalip('A red crayon', 'Boya kalemlerinin renkleri! Önce rengi, sonra adını söyleriz.', [
      f('okul-b1', 'A red crayon.', 'Kırmızı bir boya kalemi.', o('renkli/crayon-red'), [['A red', 'w:red'], ['crayon', 'w:crayon']]),
      f('okul-b2', 'A blue crayon.', 'Mavi bir boya kalemi.', o('renkli/crayon-blue'), [['A blue', 'w:blue'], ['crayon', 'w:crayon']]),
      f('okul-b3', 'A yellow crayon.', 'Sarı bir boya kalemi.', o('renkli/crayon-yellow'), [['A yellow', 'w:yellow'], ['crayon', 'w:crayon']]),
      f('okul-b4', 'A green crayon.', 'Yeşil bir boya kalemi.', o('renkli/crayon-green'), [['A green', 'w:green'], ['crayon', 'w:crayon']]),
    ]),
    sohbet: { aciklama: 'Polly, elinde ne var diye soracak. Doğru cevaba dokun.', turlar: ayniSoru('what-do-you-have', 'What do you have?', 'Elinde ne var?', [
      [{ k: 'book', kino: 'tut' }, f('okul-c1', 'I have a book.', 'Bir kitabım var.', { k: 'book', kino: 'tut' }, [], { ses: 'en/i-okul-a1' })],
      [{ k: 'pencil', kino: 'tut' }, f('okul-c2', 'I have a pencil.', 'Bir kurşunkalemim var.', { k: 'pencil', kino: 'tut' }, [], { ses: 'en/i-okul-a2' })],
      [{ k: 'bag', kino: 'tut' }, f('okul-c3', 'I have a bag.', 'Bir çantam var.', { k: 'bag', kino: 'tut' }, [], { ses: 'en/i-okul-a3' })],
      [{ k: 'scissors', kino: 'tut' }, f('okul-c4', 'I have scissors.', 'Bir makasım var.', { k: 'scissors', kino: 'tut' }, [], { ses: 'en/i-okul-a4' })],
    ]) },
    kur: [
      f('okul-k1', 'I have a book and a pencil.', 'Bir kitabım ve bir kurşunkalemim var.', { k: 'book', ile: 'pencil' }, [['I have', 'p'], ['a book', 'w:book'], ['and', 'p'], ['a pencil', 'w:pencil']]),
      f('okul-k2', 'I have a red crayon.', 'Kırmızı bir boya kalemim var.', o('renkli/crayon-red'), [['I have', 'p'], ['a red', 'w:red'], ['crayon', 'w:crayon']]),
      f('okul-k3', 'I see a big school.', 'Büyük bir okul görüyorum.', { k: 'school', boy: 'big' }, [['I see', 'p'], ['a big', 'p'], ['school', 'w:school']]),
      f('okul-k4', 'I have paper and scissors.', 'Kâğıdım ve makasım var.', { k: 'paper', ile: 'scissors' }, [['I have', 'p'], ['paper', 'w:paper'], ['and', 'p'], ['scissors', 'w:scissors']]),
    ],
    hikaye: hikaye('okul', 'Kino Goes to School', 'Kino Okula Gidiyor', 'Bugün Kino okula gidiyor. Bakalım okulda neler yapacak?', [
      ['Kino goes to school.', 'Kino okula gidiyor.'],
      ['He sits at his desk.', 'Sırasına oturuyor.'],
      ['He draws with a crayon.', 'Boya kalemiyle resim çiziyor.'],
      ['Hello, teacher! I love school!', 'Merhaba öğretmenim! Okulu çok seviyorum!'],
    ]),
  };

  // 18 · Duygular: Kino is happy. (üçüncü kişi) · ve
  s.duygular = {
    a: kalip('Kino is happy', 'Şimdi Kino nasıl hissediyor, Polly anlatacak. Kino’nun yüzüne bak!', [
      f('duygular-a1', 'Kino is happy.', 'Kino mutlu.', { k: 'happy' }, [['Kino is', 'p'], ['happy', 'w:happy']]),
      f('duygular-a2', 'Kino is sad.', 'Kino üzgün.', { k: 'sad' }, [['Kino is', 'p'], ['sad', 'w:sad']]),
      f('duygular-a3', 'Kino is angry.', 'Kino kızgın.', { k: 'angry' }, [['Kino is', 'p'], ['angry', 'w:angry']]),
      f('duygular-a4', 'Kino is sleepy.', 'Kino uykulu.', { k: 'sleepy' }, [['Kino is', 'p'], ['sleepy', 'w:sleepy']]),
    ]),
    b: kalip('Hungry and thirsty', 'Bazen iki şeyi birden hissederiz. Polly ikisini birlikte söyleyecek.', [
      f('duygular-b1', 'I am hungry and thirsty.', 'Acıktım ve susadım.', { k: 'hungry', ile: 'thirsty' }, [['I am', 'p'], ['hungry', 'w:hungry'], ['and', 'p'], ['thirsty', 'w:thirsty']]),
      f('duygular-b2', 'I am happy and sleepy.', 'Mutluyum ve uykum var.', { k: 'happy', ile: 'sleepy' }, [['I am', 'p'], ['happy', 'w:happy'], ['and', 'p'], ['sleepy', 'w:sleepy']]),
      f('duygular-b3', 'I am sad and hungry.', 'Üzgünüm ve acıktım.', { k: 'sad', ile: 'hungry' }, [['I am', 'p'], ['sad', 'w:sad'], ['and', 'p'], ['hungry', 'w:hungry']]),
      f('duygular-b4', 'I am happy and thirsty.', 'Mutluyum ve susadım.', { k: 'happy', ile: 'thirsty' }, [['I am', 'p'], ['happy', 'w:happy'], ['and', 'p'], ['thirsty', 'w:thirsty']]),
    ]),
    sohbet: { aciklama: 'Polly, nasıl hissediyorsun diye soracak. Kino’nun yüzüne bak, cevabına dokun.', turlar: ayniSoru('how-do-you-feel', 'How do you feel?', 'Nasıl hissediyorsun?', ['happy', 'sad', 'hungry', 'sleepy'].map((x): [Gorsel, Ifade] => [{ k: x }, kc(x)])) },
    kur: [
      f('duygular-k1', 'Kino is sleepy. Good night!', 'Kino uykulu. İyi geceler!', { k: 'sleepy' }, [['Kino is', 'p'], ['sleepy.', 'w:sleepy'], ['Good night', 'p']]),
      f('duygular-k2', 'I am hungry. I want cake.', 'Acıktım. Pasta istiyorum.', { k: 'hungry', ile: 'cake' }, [['I am', 'p'], ['hungry.', 'w:hungry'], ['I want', 'p'], ['cake', 'w:cake']]),
      f('duygular-k3', 'I am thirsty. I want water.', 'Susadım. Su istiyorum.', { k: 'thirsty', ile: 'water' }, [['I am', 'p'], ['thirsty.', 'w:thirsty'], ['I want', 'p'], ['water', 'w:water']]),
      f('duygular-k4', 'Kino is happy and surprised.', 'Kino mutlu ve şaşkın.', { k: 'happy', ile: 'surprised' }, [['Kino is', 'p'], ['happy', 'w:happy'], ['and', 'p'], ['surprised', 'w:surprised']]),
    ],
    hikaye: hikaye('duygular', "Kino's Feelings", "Kino'nun Duyguları", 'Kino bugün neler hissedecek? Yüzüne iyi bak!', [
      ['Kino is sleepy.', 'Kino uykulu.'],
      ['Now he is hungry.', 'Şimdi acıkmış.'],
      ['He eats. Now he is happy.', 'Yemek yiyor. Şimdi mutlu.'],
      ['Surprise! Polly has a cake!', 'Sürpriz! Polly pasta getirdi!'],
    ]),
  };

  // 19 · Şekil ve Boy: büyük – küçük şekiller · ve
  s.sekiller = {
    a: kalip('A big circle', 'Şekiller büyük ya da küçük olabilir. Resme bak, Polly’yi dinle!', [
      f('sekiller-a1', 'A big circle.', 'Büyük bir daire.', { k: 'circle', boy: 'big' }, [['A big', 'p'], ['circle', 'w:circle']]),
      f('sekiller-a2', 'A small circle.', 'Küçük bir daire.', { k: 'circle', boy: 'small' }, [['A small', 'p'], ['circle', 'w:circle']]),
      f('sekiller-a3', 'A big heart.', 'Büyük bir kalp.', { k: 'heart', boy: 'big' }, [['A big', 'p'], ['heart', 'w:heart']]),
      f('sekiller-a4', 'A small heart.', 'Küçük bir kalp.', { k: 'heart', boy: 'small' }, [['A small', 'p'], ['heart', 'w:heart']]),
    ]),
    b: kalip('A circle and a square', 'Şimdi iki şekil birden geliyor. Polly ikisini birlikte söyleyecek.', [
      f('sekiller-b1', 'A circle and a square.', 'Bir daire ve bir kare.', { k: 'circle', ile: 'square' }, [['A circle', 'w:circle'], ['and', 'p'], ['a square', 'w:square']]),
      f('sekiller-b2', 'A triangle and a heart.', 'Bir üçgen ve bir kalp.', { k: 'triangle', ile: 'heart' }, [['A triangle', 'w:triangle'], ['and', 'p'], ['a heart', 'w:heart']]),
      f('sekiller-b3', 'A square and a triangle.', 'Bir kare ve bir üçgen.', { k: 'square', ile: 'triangle' }, [['A square', 'w:square'], ['and', 'p'], ['a triangle', 'w:triangle']]),
      f('sekiller-b4', 'A heart and a star.', 'Bir kalp ve bir yıldız.', { k: 'heart', ile: 'star' }, [['A heart', 'w:heart'], ['and', 'p'], ['a star', 'w:star']]),
    ]),
    sohbet: { aciklama: 'Polly, bu hangi şekil diye soracak. Doğru cevaba dokun.', turlar: ayniSoru('what-shape', 'What shape is it?', 'Bu hangi şekil?', ['circle', 'square', 'triangle', 'heart'].map((x): [Gorsel, Ifade] => [{ k: x }, kc(x)])) },
    kur: [
      f('sekiller-k1', 'I see a big heart and a small star.', 'Büyük bir kalp ve küçük bir yıldız görüyorum.', { k: 'heart', ile: 'star' }, [['I see', 'p'], ['a big', 'p'], ['heart', 'w:heart'], ['and', 'p'], ['a small', 'p'], ['star', 'w:star']]),
      f('sekiller-k2', 'I have three circles.', 'Üç dairem var.', { k: 'circle', adet: 3, kino: 'tut' }, [['I have', 'p'], ['three', 'w:three'], ['circles', 'c:circle']]),
      f('sekiller-k3', 'I see two triangles.', 'İki üçgen görüyorum.', { k: 'triangle', adet: 2 }, [['I see', 'p'], ['two', 'w:two'], ['triangles', 'c:triangle']]),
      f('sekiller-k4', 'I love a big red heart.', 'Büyük kırmızı bir kalbi çok severim.', { k: 'heart', boy: 'big', kalp: true }, [['I love', 'p'], ['a big', 'p'], ['red', 'w:red'], ['heart', 'w:heart']]),
    ],
    hikaye: hikaye('sekiller', "Kino's Shape House", "Kino'nun Şekil Evi", 'Kino resim yapıyor. Hangi şekilleri çizecek, bakalım!', [
      ['Kino draws a square.', 'Kino bir kare çiziyor.'],
      ['He draws a triangle.', 'Bir üçgen çiziyor.'],
      ['He draws a circle.', 'Bir daire çiziyor.'],
      ["Look! It's a house!", 'Bak! Bir ev oldu!'],
    ]),
  };

  // 20 · Sofra: Pass the …, please. · I like … / I don't like …
  s.sofra = {
    a: kalip('Please pass the plate', 'Sofrada bir şey isterken kibarca isteriz. Polly ne istiyor, dinle!', [
      f('sofra-a1', 'Please pass the plate.', 'Tabağı uzatır mısın, lütfen.', { k: 'plate' }, [['Please pass', 'p'], ['the plate', 'w:plate']]),
      f('sofra-a2', 'Please pass the cup.', 'Fincanı uzatır mısın, lütfen.', { k: 'cup' }, [['Please pass', 'p'], ['the cup', 'w:cup']]),
      f('sofra-a3', 'Please pass the spoon.', 'Kaşığı uzatır mısın, lütfen.', { k: 'spoon' }, [['Please pass', 'p'], ['the spoon', 'w:spoon']]),
      f('sofra-a4', 'Please pass the fork.', 'Çatalı uzatır mısın, lütfen.', { k: 'fork' }, [['Please pass', 'p'], ['the fork', 'w:fork']]),
    ]),
    b: kalip("I like cake · I don't like soup", 'Kino bazı yemekleri seviyor, bazılarını sevmiyor. Yüzüne bak!', [
      f('sofra-b1', 'I like cake.', 'Pasta severim.', { k: 'cake', kino: 'sev' }, [['I like', 'p'], ['cake', 'w:cake']]),
      f('sofra-b2', "I don't like cake.", 'Pasta sevmem.', { k: 'cake', kino: 'sevme' }, [["I don't like", 'p'], ['cake', 'w:cake']]),
      f('sofra-b3', 'I like soup.', 'Çorba severim.', { k: 'soup', kino: 'sev' }, [['I like', 'p'], ['soup', 'w:soup']]),
      f('sofra-b4', "I don't like juice.", 'Meyve suyu sevmem.', { k: 'juice', kino: 'sevme' }, [["I don't like", 'p'], ['juice', 'w:juice']]),
    ]),
    sohbet: { aciklama: 'Polly sana soracak: Bunu sever misin? Sen ne düşünüyorsan ona dokun.', turlar: [
      ozelSoru('sofra-s1', 'Do you like cake?', 'Pasta sever misin?', { k: 'cake' }, EVET_SEVERIM, { secenekler: [EVET_SEVERIM, HAYIR_SEVMEM], serbest: true }),
      ozelSoru('sofra-s2', 'Do you like soup?', 'Çorba sever misin?', { k: 'soup' }, EVET_SEVERIM, { secenekler: [EVET_SEVERIM, HAYIR_SEVMEM], serbest: true }),
      ozelSoru('sofra-s3', 'Do you like juice?', 'Meyve suyu sever misin?', { k: 'juice' }, EVET_SEVERIM, { secenekler: [EVET_SEVERIM, HAYIR_SEVMEM], serbest: true }),
      ozelSoru('sofra-s4', 'Do you like milk?', 'Süt sever misin?', { k: 'milk' }, EVET_SEVERIM, { secenekler: [EVET_SEVERIM, HAYIR_SEVMEM], serbest: true }),
    ] },
    kur: [
      f('sofra-k1', 'I eat soup with a spoon.', 'Çorbayı kaşıkla içerim.', { k: 'soup', ile: 'spoon' }, [['I eat', 'p'], ['soup', 'w:soup'], ['with', 'p'], ['a spoon', 'w:spoon']]),
      f('sofra-k2', 'I drink juice from a cup.', 'Meyve suyunu fincandan içerim.', { k: 'juice', ile: 'cup' }, [['I drink', 'p'], ['juice', 'w:juice'], ['from', 'p'], ['a cup', 'w:cup']]),
      f('sofra-k3', 'I eat cake with a fork.', 'Pastayı çatalla yerim.', { k: 'cake', ile: 'fork' }, [['I eat', 'p'], ['cake', 'w:cake'], ['with', 'p'], ['a fork', 'w:fork']]),
      f('sofra-k4', 'I have a plate and a bowl.', 'Bir tabağım ve bir kâsem var.', { k: 'plate', ile: 'bowl' }, [['I have', 'p'], ['a plate', 'w:plate'], ['and', 'p'], ['a bowl', 'w:bowl']]),
    ],
    hikaye: hikaye('sofra', 'Lunch Time', 'Öğle Yemeği', 'Öğle yemeği zamanı! Kino ve Lokum sofrada.', [
      ["It's lunch time.", 'Öğle yemeği zamanı.'],
      ['Kino has soup in a bowl.', 'Kino’nun kâsesinde çorba var.'],
      ['Lokum has juice in a cup.', 'Lokum’un fincanında meyve suyu var.'],
      ['And now… cake! Yummy!', 'Ve şimdi… pasta! Nefis!'],
    ]),
  };

  // 21 · Park: Kino is on the slide. · ve
  s.park = {
    a: kalip('Kino is on the slide', 'Kino parkta nerede oynuyor? Polly söyleyecek, sen resme bak!', [
      f('park-a1', 'Kino is on the slide.', 'Kino kaydırakta.', o('eylem/kino-on-slide'), [['Kino', 'r:kisi/kino-kart-1'], ['is on', 'p'], ['the slide', 'w:slide']]),
      f('park-a2', 'Kino is on the swing.', 'Kino salıncakta.', o('eylem/kino-on-swing'), [['Kino', 'r:kisi/kino-kart-1'], ['is on', 'p'], ['the swing', 'w:swing']]),
      f('park-a3', 'Kino is on the seesaw.', 'Kino tahterevallide.', o('eylem/kino-on-seesaw'), [['Kino', 'r:kisi/kino-kart-1'], ['is on', 'p'], ['the seesaw', 'w:seesaw']]),
      f('park-a4', 'Kino is in the sand.', 'Kino kumda.', o('eylem/kino-in-sand'), [['Kino', 'r:kisi/kino-kart-1'], ['is in', 'p'], ['the sand', 'w:sand']]),
    ]),
    b: kalip('A bucket and a shovel', 'Parkta oyuncaklar bir arada. Polly ikisini birlikte söyleyecek.', [
      f('park-b1', 'A bucket and a shovel.', 'Bir kova ve bir kürek.', { k: 'bucket', ile: 'shovel' }, [['A bucket', 'w:bucket'], ['and', 'p'], ['a shovel', 'w:shovel']]),
      f('park-b2', 'A slide and a swing.', 'Bir kaydırak ve bir salıncak.', { k: 'slide', ile: 'swing' }, [['A slide', 'w:slide'], ['and', 'p'], ['a swing', 'w:swing']]),
      f('park-b3', 'A bench and a fountain.', 'Bir bank ve bir çeşme.', { k: 'bench', ile: 'fountain' }, [['A bench', 'w:bench'], ['and', 'p'], ['a fountain', 'w:fountain']]),
      f('park-b4', 'A seesaw and a ball.', 'Bir tahterevalli ve bir top.', { k: 'seesaw', ile: 'ball' }, [['A seesaw', 'w:seesaw'], ['and', 'p'], ['a ball', 'w:ball']]),
    ]),
    sohbet: { aciklama: 'Polly, Kino ne yapıyor diye soracak. Doğru cevaba dokun.', turlar: ayniSoru('what-is-kino-doing', 'What is Kino doing?', 'Kino ne yapıyor?', [
      [o('eylem/kino-on-slide'), f('park-c1', 'He is on the slide.', 'Kaydırakta.', o('eylem/kino-on-slide'))],
      [o('eylem/kino-on-swing'), f('park-c2', 'He is on the swing.', 'Salıncakta.', o('eylem/kino-on-swing'))],
      [o('eylem/kino-on-seesaw'), f('park-c3', 'He is on the seesaw.', 'Tahterevallide.', o('eylem/kino-on-seesaw'))],
      [o('eylem/kino-in-sand'), f('park-c4', 'He is in the sand.', 'Kumda oynuyor.', o('eylem/kino-in-sand'))],
    ]) },
    kur: [
      f('park-k1', 'I play in the sand with a bucket.', 'Kumda kovayla oynarım.', { k: 'sand', ile: 'bucket' }, [['I play', 'p'], ['in the sand', 'w:sand'], ['with', 'p'], ['a bucket', 'w:bucket']]),
      f('park-k2', 'I see a big slide.', 'Büyük bir kaydırak görüyorum.', { k: 'slide', boy: 'big' }, [['I see', 'p'], ['a big', 'p'], ['slide', 'w:slide']]),
      f('park-k3', 'I like the swing.', 'Salıncağı severim.', { k: 'swing', kino: 'sev' }, [['I like', 'p'], ['the swing', 'w:swing']]),
      f('park-k4', 'I have a bucket and a shovel.', 'Bir kovam ve bir küreğim var.', { k: 'bucket', ile: 'shovel', kino: 'tut' }, [['I have', 'p'], ['a bucket', 'w:bucket'], ['and', 'p'], ['a shovel', 'w:shovel']]),
    ],
    hikaye: hikaye('park', 'At the Park', 'Parkta', 'Kino parka gidiyor. Önce hangisine binecek?', [
      ['Kino goes to the park.', 'Kino parka gidiyor.'],
      ['He goes down the slide. Wheee!', 'Kaydıraktan kayıyor. Vııı!'],
      ['He plays on the swing.', 'Salıncakta sallanıyor.'],
      ['He drinks from the fountain. Bye, park!', 'Çeşmeden su içiyor. Hoşça kal park!'],
    ]),
  };

  // 22 · Vücudum: komutlar (Touch your knees.) · şarkı satırı
  s.vucudum = {
    a: kalip('Touch your toes', 'Polly bir şey söyleyecek, sen de Kino gibi yap!', [
      f('vucudum-a1', 'Shake your arms.', 'Kollarını salla.', { k: 'arms' }, [['Shake your', 'p'], ['arms', 'w:arms']]),
      f('vucudum-a2', 'Wiggle your fingers.', 'Parmaklarını oynat.', { k: 'fingers' }, [['Wiggle your', 'p'], ['fingers', 'w:fingers']]),
      f('vucudum-a3', 'Rub your tummy.', 'Karnını ovala.', { k: 'tummy' }, [['Rub your', 'p'], ['tummy', 'w:tummy']]),
      f('vucudum-a4', 'Touch your toes.', 'Ayak parmaklarına dokun.', { k: 'toes' }, [['Touch your', 'p'], ['toes', 'w:toes']]),
    ]),
    b: kalip('Knees and toes', 'Şimdi iki yere birden dokunuyoruz. Hazır mısın?', [
      f('vucudum-b1', 'Touch your knees and toes.', 'Dizlerine ve ayak parmaklarına dokun.', { k: 'knees', ile: 'toes' }, [['Touch your', 'p'], ['knees', 'w:knees'], ['and', 'p'], ['toes', 'w:toes']]),
      f('vucudum-b2', 'Touch your head and shoulders.', 'Başına ve omuzlarına dokun.', { k: 'head', ile: 'shoulders' }, [['Touch your', 'p'], ['head', 'w:head'], ['and', 'p'], ['shoulders', 'w:shoulders']]),
      f('vucudum-b3', 'Clap your hands and shake your arms.', 'Ellerini çırp ve kollarını salla.', { k: 'hands', ile: 'arms' }, [['Clap your', 'p'], ['hands', 'w:hands'], ['and', 'p'], ['shake your', 'p'], ['arms', 'w:arms']]),
      f('vucudum-b4', 'Brush your hair and your teeth.', 'Saçını ve dişlerini fırçala.', { k: 'hair', ile: 'teeth' }, [['Brush your', 'p'], ['hair', 'w:hair'], ['and', 'p'], ['your teeth', 'w:teeth']]),
    ]),
    sohbet: { aciklama: 'Polly, bunlar ne diye soracak. Doğru cevaba dokun.', turlar: ayniSoru('what-is-it-2', 'What is this?', 'Bu ne?', [
      [{ k: 'fingers' }, f('vucudum-c1', 'They are my fingers.', 'Bunlar benim parmaklarım.', { k: 'fingers' })],
      [{ k: 'knees' }, f('vucudum-c2', 'They are my knees.', 'Bunlar benim dizlerim.', { k: 'knees' })],
      [{ k: 'toes' }, f('vucudum-c3', 'They are my toes.', 'Bunlar benim ayak parmaklarım.', { k: 'toes' })],
      [{ k: 'tummy' }, f('vucudum-c4', 'It is my tummy.', 'Bu benim karnım.', { k: 'tummy' })],
    ]) },
    kur: [
      f('vucudum-k1', 'Head, shoulders, knees and toes!', 'Baş, omuzlar, dizler ve ayak parmakları!', { k: 'shoulders', ile: 'knees' }, [['Head,', 'w:head'], ['shoulders,', 'w:shoulders'], ['knees', 'w:knees'], ['and toes', 'w:toes']]),
      f('vucudum-k2', 'I have ten fingers.', 'On parmağım var.', { k: 'fingers' }, [['I have', 'p'], ['ten', 'w:ten'], ['fingers', 'w:fingers']]),
      f('vucudum-k3', 'I can touch my toes.', 'Ayak parmaklarıma dokunabilirim.', { k: 'toes' }, [['I can', 'p'], ['touch my', 'p'], ['toes', 'w:toes']]),
      f('vucudum-k4', 'I brush my teeth every day.', 'Her gün dişlerimi fırçalarım.', { k: 'teeth' }, [['I brush', 'p'], ['my teeth', 'w:teeth'], ['every day', 'p']]),
    ],
    hikaye: hikaye('vucudum', "Let's Dance!", 'Hadi Dans Edelim!', 'Müzik başlıyor! Kino dans edecek, sen de onunla hareket et.', [
      ['Kino shakes his arms.', 'Kino kollarını sallıyor.'],
      ['He touches his toes.', 'Ayak parmaklarına dokunuyor.'],
      ['He bends his knees.', 'Dizlerini büküyor.'],
      ['Shoulders up! Kino is a dancer!', 'Omuzlar yukarı! Kino bir dansçı!'],
    ]),
  };

  // 23 · Günüm: Kino wakes up. (üçüncü kişi) · Let's …!
  s.gunum = {
    a: kalip('Kino wakes up', 'Kino’nun günü başlıyor. Polly ne yaptığını anlatacak.', [
      f('gunum-a1', 'Kino wakes up.', 'Kino uyanıyor.', { k: 'wake-up' }, [['Kino', 'r:kisi/kino-kart-1'], ['wakes up', 'p']]),
      f('gunum-a2', 'Kino washes his face.', 'Kino yüzünü yıkıyor.', { k: 'wash' }, [['Kino', 'r:kisi/kino-kart-1'], ['washes his face', 'p']]),
      f('gunum-a3', 'Kino brushes his teeth.', 'Kino dişlerini fırçalıyor.', { k: 'brush' }, [['Kino', 'r:kisi/kino-kart-1'], ['brushes his teeth', 'p']]),
      f('gunum-a4', 'Kino reads a book.', 'Kino kitap okuyor.', { k: 'read' }, [['Kino', 'r:kisi/kino-kart-1'], ['reads a book', 'p']]),
    ]),
    b: kalip("Let's sing!", 'Polly bizi birlikte bir şey yapmaya çağıracak. Hadi, Kino ile sen de yap!', [
      f('gunum-b1', "Let's sing!", 'Hadi şarkı söyleyelim!', { k: 'sing' }, [["Let's", 'p'], ['sing', 'w:sing']]),
      f('gunum-b2', "Let's draw!", 'Hadi resim çizelim!', { k: 'draw' }, [["Let's", 'p'], ['draw', 'w:draw']]),
      f('gunum-b3', "Let's play!", 'Hadi oynayalım!', { k: 'play' }, [["Let's", 'p'], ['play', 'w:play']]),
      f('gunum-b4', "Let's read!", 'Hadi kitap okuyalım!', { k: 'read' }, [["Let's", 'p'], ['read', 'w:read']]),
    ]),
    sohbet: { aciklama: 'Polly, Kino ne yapıyor diye soracak. Doğru cevaba dokun.', turlar: ayniSoru('what-is-kino-doing', 'What is Kino doing?', 'Kino ne yapıyor?', [
      [{ k: 'read' }, f('gunum-c1', 'He is reading.', 'Kitap okuyor.', { k: 'read' })],
      [{ k: 'sing' }, f('gunum-c2', 'He is singing.', 'Şarkı söylüyor.', { k: 'sing' })],
      [{ k: 'draw' }, f('gunum-c3', 'He is drawing.', 'Resim çiziyor.', { k: 'draw' })],
      [{ k: 'hug' }, f('gunum-c4', 'He is hugging his teddy bear.', 'Oyuncak ayısına sarılıyor.', { k: 'hug' })],
    ]) },
    kur: [
      f('gunum-k1', 'I wake up and I wash my face.', 'Uyanırım ve yüzümü yıkarım.', { k: 'wake-up', ile: 'wash' }, [['I wake up', 'p'], ['and', 'p'], ['I wash my face', 'p']]),
      f('gunum-k2', 'I brush my teeth and I read a book.', 'Dişlerimi fırçalarım ve kitap okurum.', { k: 'brush', ile: 'read' }, [['I brush my teeth', 'p'], ['and', 'p'], ['I read a book', 'p']]),
      f('gunum-k3', 'I sing a song with Polly.', 'Polly ile şarkı söylerim.', { k: 'sing' }, [['I sing', 'p'], ['a song', 'p'], ['with Polly', 'p']]),
      f('gunum-k4', 'I hug my mom. Good night!', 'Anneme sarılırım. İyi geceler!', { k: 'hug', ile: 'mom' }, [['I hug', 'p'], ['my mom.', 'w:mom'], ['Good night', 'p']]),
    ],
    hikaye: hikaye('gunum', 'From Morning to Night', 'Sabahtan Akşama', 'Kino’nun bir günü! Sabahtan akşama neler yapıyor, dinle.', [
      ['Kino wakes up.', 'Kino uyanıyor.'],
      ['He reads a book.', 'Kitap okuyor.'],
      ['He sings with Polly.', 'Polly ile şarkı söylüyor.'],
      ['He hugs Mom. Good night!', 'Annesine sarılıyor. İyi geceler!'],
    ]),
  };

  // 24 · Sayılar ve Renkler 2: 9–12 (kelimenin kendi resmi: rakam ve altında yıldızlar; Say ve Koy en çok 8 nesne sayar) · renk + nesne
  s.sayilar2 = {
    a: kalip('Nine stars · ten stars', 'Şimdi daha çok sayıyoruz! Yıldızları say, sonra Polly ile söyle.', [
      f('sayilar2-a1', 'Nine stars.', 'Dokuz yıldız.', { k: 'nine' }, [['Nine', 'w:nine'], ['stars', 'c:star']]),
      f('sayilar2-a2', 'Ten stars.', 'On yıldız.', { k: 'ten' }, [['Ten', 'w:ten'], ['stars', 'c:star']]),
      f('sayilar2-a3', 'Eleven stars.', 'On bir yıldız.', { k: 'eleven' }, [['Eleven', 'w:eleven'], ['stars', 'c:star']]),
      f('sayilar2-a4', 'Twelve stars.', 'On iki yıldız.', { k: 'twelve' }, [['Twelve', 'w:twelve'], ['stars', 'c:star']]),
    ]),
    b: kalip('A white cloud', 'Yeni renkleri söyleyelim. Önce rengi, sonra adını!', [
      f('sayilar2-b1', 'A white cloud.', 'Beyaz bir bulut.', { k: 'cloud' }, [['A white', 'w:white'], ['cloud', 'w:cloud']]),
      f('sayilar2-b2', 'A brown horse.', 'Kahverengi bir at.', { k: 'horse' }, [['A brown', 'w:brown'], ['horse', 'w:horse']]),
      f('sayilar2-b3', 'A gray elephant.', 'Gri bir fil.', { k: 'elephant' }, [['A gray', 'w:gray'], ['elephant', 'w:elephant']]),
      f('sayilar2-b4', 'A gold star.', 'Altın rengi bir yıldız.', { k: 'star' }, [['A gold', 'w:gold'], ['star', 'w:star']]),
    ]),
    sohbet: { aciklama: 'Polly, kaç tane diye soracak. Say ve cevabına dokun.', turlar: ayniSoru('how-many', 'How many?', 'Kaç tane?', [] as [Gorsel, Ifade][]) },
    kur: [
      f('sayilar2-k1', 'I see a gray elephant and a brown horse.', 'Gri bir fil ve kahverengi bir at görüyorum.', { k: 'elephant', ile: 'horse' }, [['I see', 'p'], ['a gray', 'w:gray'], ['elephant', 'w:elephant'], ['and', 'p'], ['a brown', 'w:brown'], ['horse', 'w:horse']]),
      f('sayilar2-k2', 'I have ten stars.', 'On yıldızım var.', { k: 'ten', kino: 'tut' }, [['I have', 'p'], ['ten', 'w:ten'], ['stars', 'c:star']]),
      f('sayilar2-k3', 'I see a white cloud and the sun.', 'Beyaz bir bulut ve güneşi görüyorum.', { k: 'cloud', ile: 'sun' }, [['I see', 'p'], ['a white', 'w:white'], ['cloud', 'w:cloud'], ['and', 'p'], ['the sun', 'w:sun']]),
      f('sayilar2-k4', 'I can count to twelve!', 'On ikiye kadar sayabilirim!', { k: 'twelve' }, [['I can', 'p'], ['count to', 'p'], ['twelve', 'w:twelve']]),
    ],
    hikaye: hikaye('sayilar2', 'Counting Stars', 'Yıldızları Sayalım', 'Gece oldu. Kino gökyüzündeki yıldızları sayıyor. Sen de say!', [
      ["It's night. Kino looks up.", 'Gece oldu. Kino yukarı bakıyor.'],
      ['One, two, three… nine stars!', 'Bir, iki, üç… dokuz yıldız!'],
      ['Ten, eleven, twelve!', 'On, on bir, on iki!'],
      ['Look! A gold star. Make a wish, Kino!', 'Bak! Altın bir yıldız. Bir dilek tut Kino!'],
    ]),
  };
  // Sayılar 2'nin soru–cevabı: a dersinin ifadeleri (Kaç tane?)
  s.sayilar2.sohbet.turlar = ayniSoru('how-many', 'How many?', 'Kaç tane?', s.sayilar2.a.ifadeler.map((x): [Gorsel, Ifade] => [x.g, x]));
  return s;
}
