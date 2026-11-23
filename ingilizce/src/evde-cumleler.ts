/**
 * Büyükler için · "Evde 3 İngilizce Cümle" (20 Kasım 2026). Danışmanın paketi (ekip/antigravity/ONERI-08, bölüm 1) üstünden
 * elden geçirildi: her ada için ebeveynin gün içinde çocuğuna söyleyeceği üç kısa, doğal cümle; her biri o adanın
 * kelimelerinden en az birini taşır. Polly'nin sesiyle dinlenir: en/evde-<ada>-<1..3>.mp3, her cümle ayrı kayıt.
 * DOM'suz (ses betiği ve birim testi de okur).
 */
import type { SesMetni } from './icerik';

export interface EvdeCumle { en: string; tr: string }

export const EVDE_CUMLELER: Record<string, readonly [EvdeCumle, EvdeCumle, EvdeCumle]> = {
  ciftlik: [{ en: 'Look, a cow!', tr: 'Bak, bir inek!' }, { en: 'Where is the duck?', tr: 'Ördek nerede?' }, { en: 'Is it a sheep?', tr: 'Bu bir koyun mu?' }],
  renkler: [{ en: 'Show me something red!', tr: 'Bana kırmızı bir şey göster!' }, { en: 'I see something blue.', tr: 'Mavi bir şey görüyorum.' }, { en: 'Is it yellow or green?', tr: 'Sarı mı, yeşil mi?' }],
  sayilar: [{ en: 'Count with me: one, two, three!', tr: 'Benimle say: bir, iki, üç!' }, { en: 'Give me two, please.', tr: 'Bana iki tane ver, lütfen.' }, { en: 'How many? Five!', tr: 'Kaç tane? Beş!' }],
  yiyecekler: [{ en: 'Do you like apples?', tr: 'Elma sever misin?' }, { en: 'Drink your milk, please.', tr: 'Sütünü iç, lütfen.' }, { en: 'Water, please!', tr: 'Su, lütfen!' }],
  oyuncaklar: [{ en: 'Where is your ball?', tr: 'Topun nerede?' }, { en: 'Hug your teddy bear!', tr: 'Oyuncak ayına sarıl!' }, { en: "Let's play with the puzzle.", tr: 'Yapbozla oynayalım.' }],
  ailem: [{ en: 'Here is Mom!', tr: 'İşte annen!' }, { en: 'Say hello to Dad!', tr: 'Babana merhaba de!' }, { en: 'I love my family.', tr: 'Ailemi seviyorum.' }],
  yuzum: [{ en: 'Touch your nose!', tr: 'Burnuna dokun!' }, { en: 'Clap your hands!', tr: 'Ellerini çırp!' }, { en: 'Where are your ears?', tr: 'Kulakların nerede?' }],
  kiyafetler: [{ en: 'Put on your shoes!', tr: 'Ayakkabılarını giy!' }, { en: 'Where is your hat?', tr: 'Şapkan nerede?' }, { en: 'Take off your socks.', tr: 'Çoraplarını çıkar.' }],
  odam: [{ en: 'Open the door, please.', tr: 'Kapıyı aç, lütfen.' }, { en: 'Look out the window!', tr: 'Pencereden dışarı bak!' }, { en: 'Turn off the lamp. Good night!', tr: 'Lambayı kapat. İyi geceler!' }],
  tasitlar: [{ en: 'Look! A big bus!', tr: 'Bak! Kocaman bir otobüs!' }, { en: 'I see a red car.', tr: 'Kırmızı bir araba görüyorum.' }, { en: 'Look up! A plane!', tr: 'Yukarı bak! Bir uçak!' }],
  hareketler: [{ en: 'Jump with me!', tr: 'Benimle zıpla!' }, { en: "Let's dance together!", tr: 'Birlikte dans edelim!' }, { en: 'Time to sleep!', tr: 'Uyku zamanı!' }],
  vahsi: [{ en: 'Roar like a lion!', tr: 'Aslan gibi kükre!' }, { en: 'Look, a little bird!', tr: 'Bak, küçük bir kuş!' }, { en: 'Jump like a frog!', tr: 'Kurbağa gibi zıpla!' }],
  meyve: [{ en: 'The lemon is yellow.', tr: 'Limon sarı.' }, { en: 'Can I have a carrot?', tr: 'Bir havuç alabilir miyim?' }, { en: 'I like watermelon!', tr: 'Karpuzu severim!' }],
  hava: [{ en: 'Look outside! The sun is out.', tr: 'Dışarı bak! Güneş çıktı.' }, { en: "It's cold today!", tr: 'Bugün hava soğuk!' }, { en: 'Look! A rainbow!', tr: 'Bak! Gökkuşağı!' }],
  doga: [{ en: 'Look at the big tree!', tr: 'Şu büyük ağaca bak!' }, { en: 'Smell the flower!', tr: 'Çiçeği kokla!' }, { en: 'Good night, moon and stars!', tr: 'İyi geceler, ay ve yıldızlar!' }],
  evim: [{ en: 'Come to the kitchen!', tr: 'Mutfağa gel!' }, { en: "Let's go to the garden.", tr: 'Bahçeye çıkalım.' }, { en: 'Where is the key?', tr: 'Anahtar nerede?' }],
  okul: [{ en: 'Open your book!', tr: 'Kitabını aç!' }, { en: 'Where is your bag?', tr: 'Çantan nerede?' }, { en: "Let's draw with crayons.", tr: 'Boya kalemleriyle çizelim.' }],
  duygular: [{ en: 'How do you feel? Happy?', tr: 'Nasıl hissediyorsun? Mutlu musun?' }, { en: 'Are you hungry?', tr: 'Acıktın mı?' }, { en: 'Are you sleepy? Time for bed.', tr: 'Uykun mu geldi? Yatma vakti.' }],
  sekiller: [{ en: 'Is it big or small?', tr: 'Büyük mü, küçük mü?' }, { en: 'Find a circle!', tr: 'Bir daire bul!' }, { en: 'Which one is long?', tr: 'Hangisi uzun?' }],
  sofra: [{ en: 'Here is your spoon.', tr: 'İşte kaşığın.' }, { en: 'Put the plate on the table.', tr: 'Tabağı masaya koy.' }, { en: 'Yummy soup!', tr: 'Nefis çorba!' }],
  park: [{ en: "Let's go on the slide!", tr: 'Kaydıraktan kayalım!' }, { en: 'Sit on the swing. Hold on tight!', tr: 'Salıncağa otur. Sıkı tutun!' }, { en: 'Bring your bucket and shovel.', tr: 'Kovanı ve küreğini getir.' }],
  vucudum: [{ en: 'Shake your arms!', tr: 'Kollarını salla!' }, { en: 'Touch your knees and toes!', tr: 'Dizlerine ve ayak parmaklarına dokun!' }, { en: 'Brush your hair.', tr: 'Saçını tara.' }],
  gunum: [{ en: 'Good morning! Wake up!', tr: 'Günaydın! Uyan!' }, { en: 'Wash your face and brush your teeth.', tr: 'Yüzünü yıka, dişlerini fırçala.' }, { en: 'Give me a big hug!', tr: 'Bana kocaman sarıl!' }],
  sayilar2: [{ en: "Let's count to twelve!", tr: 'On ikiye kadar sayalım!' }, { en: 'Show me something white.', tr: 'Bana beyaz bir şey göster.' }, { en: 'Look, a gold star!', tr: 'Bak, altın bir yıldız!' }],
};

export const evdeSesKimligi = (ada: string, i: number) => `en/evde-${ada}-${i + 1}`;

const hece = (s: string) => (s.toLowerCase().match(/[aeiouy]+/g) ?? []).length || 1;

/** Polly'nin 72 kaydı (scripts/ingilizce-ses.ts --id ile üretilir) */
export function evdeSesMetinleri(): SesMetni[] {
  return Object.entries(EVDE_CUMLELER).flatMap(([ada, cumleler]) =>
    cumleler.map((c, i): SesMetni => ({ id: evdeSesKimligi(ada, i), kim: 'polly', dil: 'en', metin: c.en, hece: hece(c.en) })));
}
