/**
 * Polly'nin Şarkıları: adaya bir çocuk şarkısı. Şarkıyı Barış Gemini'den üretir (ElevenLabs'te müzik üretilmez);
 * dosya kırpılıp `assets/ingilizce/sarki/<id>.mp3` olarak eklenir. Satır ve sözcük zamanları Scribe'ın sözcük
 * zamanlarından gelir (ms, kırpılmış dosyaya göre): sözcük o anda büyür ve yanar, hayvan o anda sahneye çıkar.
 */
/** [metin, başlangıç ms, rol]: selam ("Hello") · hayvan (adı, kendi renginde) · ses ("Moo!") · duz */
export type SarkiSozu = readonly [metin: string, ms: number, rol: 'selam' | 'hayvan' | 'ses' | 'duz'];
export interface SarkiSatiri {
  t: number;
  /** satırın hayvanı: adı geçince sahneye çıkar, sesini konuşma balonuyla söyler */
  hayvan?: string;
  renk?: string;
  ses?: string;
  sozler: readonly SarkiSozu[];
}
export interface Sarki {
  id: string;
  uniteId: string;
  en: string;
  tr: string;
  satirlar: readonly SarkiSatiri[];
  /** "I love the animals!": bütün hayvanlar birlikte zıplar (ms) */
  hepsi?: number;
}

export const SARKILAR: readonly Sarki[] = [
  {
    // Gemini (Barış, 20 Kasım 2026): "The Cow Says", 3,2 – 67,2 sn arası kırpıldı, yumuşak giriş ve çıkış
    id: 'the-cow-says', uniteId: 'ciftlik', en: 'The Cow Says', tr: 'İnek ne der?', hepsi: 53400,
    satirlar: [
      { t: 1360, hayvan: 'cow', renk: '#7a5230', ses: 'Moo!', sozler: [['Hello,', 1360, 'selam'], ['cow!', 2040, 'hayvan'], ['The', 2920, 'duz'], ['cow', 3100, 'hayvan'], ['says,', 3640, 'duz'], ['“Moo!”', 4160, 'ses']] },
      { t: 5520, hayvan: 'duck', renk: '#e0a800', ses: 'Quack!', sozler: [['Hello,', 5520, 'selam'], ['duck!', 6260, 'hayvan'], ['The', 7040, 'duz'], ['duck', 7300, 'hayvan'], ['says,', 7800, 'duz'], ['“Quack!”', 8320, 'ses']] },
      { t: 9700, hayvan: 'sheep', renk: '#6b7fa3', ses: 'Baa!', sozler: [['Hello,', 9700, 'selam'], ['sheep!', 10360, 'hayvan'], ['The', 11260, 'duz'], ['sheep', 11440, 'hayvan'], ['says,', 11980, 'duz'], ['“Baa!”', 12500, 'ses']] },
      { t: 13860, hayvan: 'cat', renk: '#ef7d1a', ses: 'Meow!', sozler: [['Hello,', 13860, 'selam'], ['cat!', 14600, 'hayvan'], ['The', 15420, 'duz'], ['cat', 15640, 'hayvan'], ['says,', 16140, 'duz'], ['“Meow!”', 16660, 'ses']] },
      { t: 18040, hayvan: 'dog', renk: '#a0522d', ses: 'Woof!', sozler: [['Hello,', 18040, 'selam'], ['dog!', 18800, 'hayvan'], ['The', 19620, 'duz'], ['dog', 19840, 'hayvan'], ['says,', 20340, 'duz'], ['“Woof!”', 20880, 'ses']] },
      { t: 22220, hayvan: 'horse', renk: '#8b4513', ses: 'Neigh!', sozler: [['Hello,', 22220, 'selam'], ['horse!', 22940, 'hayvan'], ['The', 23820, 'duz'], ['horse', 24020, 'hayvan'], ['says,', 24520, 'duz'], ['“Neigh!”', 25040, 'ses']] },
      { t: 26400, hayvan: 'chicken', renk: '#d62828', ses: 'Cluck!', sozler: [['Hello,', 26400, 'selam'], ['chicken!', 27120, 'hayvan'], ['The', 27980, 'duz'], ['chicken', 28160, 'hayvan'], ['says,', 28740, 'duz'], ['“Cluck!”', 29180, 'ses']] },
      { t: 30580, hayvan: 'bird', renk: '#1e88e5', ses: 'Tweet!', sozler: [['Hello,', 30580, 'selam'], ['bird!', 31340, 'hayvan'], ['The', 32120, 'duz'], ['bird', 32380, 'hayvan'], ['says,', 32880, 'duz'], ['“Tweet!”', 33360, 'ses']] },
      { t: 34740, hayvan: 'goat', renk: '#5f6b6d', ses: 'Maa!', sozler: [['Hello,', 34740, 'selam'], ['goat!', 35520, 'hayvan'], ['The', 36320, 'duz'], ['goat', 36560, 'hayvan'], ['says,', 37040, 'duz'], ['“Maa!”', 37560, 'ses']] },
      { t: 38940, hayvan: 'mouse', renk: '#8e5bd8', ses: 'Squeak!', sozler: [['Hello,', 38940, 'selam'], ['mouse!', 39680, 'hayvan'], ['The', 40500, 'duz'], ['mouse', 40720, 'hayvan'], ['says,', 41200, 'duz'], ['“Squeak!”', 41680, 'ses']] },
      { t: 43100, hayvan: 'donkey', renk: '#6d6875', ses: 'Hee-haw!', sozler: [['Hello,', 43100, 'selam'], ['donkey!', 43840, 'hayvan'], ['The', 44700, 'duz'], ['donkey', 44900, 'hayvan'], ['says,', 45420, 'duz'], ['“Hee-haw!”', 45900, 'ses']] },
      { t: 47280, hayvan: 'rabbit', renk: '#e8559a', ses: 'Hop!', sozler: [['Hello,', 47280, 'selam'], ['rabbit!', 48040, 'hayvan'], ['The', 48840, 'duz'], ['rabbit', 49100, 'hayvan'], ['can', 49840, 'duz'], ['hop!', 50120, 'ses']] },
      { t: 52600, sozler: [['I', 52600, 'duz'], ['love', 52740, 'selam'], ['the', 53040, 'duz'], ['animals!', 53400, 'hayvan']] },
      { t: 56920, sozler: [['Goodbye', 56920, 'selam'], ['for', 59500, 'duz'], ['now!', 60780, 'duz']] },
    ],
  },
];

export const adaninSarkisi = (uniteId: string): Sarki | undefined => SARKILAR.find((s) => s.uniteId === uniteId);
export const sarkiBul = (id: string): Sarki | undefined => SARKILAR.find((s) => s.id === id);
