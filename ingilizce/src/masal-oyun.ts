/**
 * Masal Oyunu (22 Kasım 2026, Barış: "masalda önce güzel bir hikâye anlatsın, sonra oyun olsun… sorular sorulmalı ama
 * devamlı ses soruyorsun, tekrara kaçıyorsun… 'What can you see in the lake?' gibi; cevap görselle"). Masal bittikten sonra
 * Polly hikâyeyle ilgili kısa sorular sorar, çocuk doğru resme dokunur. Mikrofon yok.
 *
 * Her sorunun cevabı ve seçenekleri kelime çizimleridir (`kelime/<id>`); `sayfa`: cevabın göründüğü masal sayfası (yanlışta
 * ipucu olarak o sayfanın resmi gelir). Sorunun sesi `en/g-mq-<ada>-<sıra>` (Polly). Çizimi ya da sesi eksik soru oyuna
 * girmez; soru üçten azsa masalın kendi sayfalarından "Find the picture!" soruları eklenir.
 */
export interface MasalSorusu {
  /** Polly'nin sorusu */
  soru: string;
  cevap: string;
  /** cevap dahil, 2–3 kelime */
  secenekler: readonly string[];
  /** cevabın göründüğü sayfa (0'dan) */
  sayfa: number;
}

const q = (soru: string, cevap: string, digerleri: string[], sayfa: number): MasalSorusu => ({ soru, cevap, secenekler: [cevap, ...digerleri], sayfa });

export const MASAL_SORULARI: Record<string, readonly MasalSorusu[]> = {
  ciftlik: [q('What big animal does Kino see?', 'cow', ['horse', 'sheep'], 1), q('What small animal does Kino see?', 'duck', ['cat', 'mouse'], 2)],
  renkler: [q("What color is Kino's balloon?", 'red', ['blue', 'yellow'], 0), q("What color is Polly's balloon?", 'blue', ['green', 'red'], 1)],
  sayilar: [q('What does Kino see?', 'duck', ['cow', 'cat'], 0), q('How many ducks at the end?', 'three', ['one', 'two'], 2)],
  yiyecekler: [q('What does Kino eat?', 'apple', ['banana', 'bread'], 1), q('What does Kino drink?', 'milk', ['water', 'cheese'], 2)],
  oyuncaklar: [q('What is in the box?', 'ball', ['doll', 'drum'], 1), q('What else is in the box?', 'robot', ['kite', 'teddy-bear'], 2)],
  ailem: [q('Where is Dad?', 'dad', ['mom', 'sister'], 1), q('Where is Grandma?', 'grandma', ['grandpa', 'teacher'], 2)],
  yuzum: [q("It's morning. What is in the sky?", 'sun', ['moon', 'star'], 0), q('What does Kino wash?', 'hands', ['feet', 'ears'], 1)],
  kiyafetler: [q('Is it hot or cold today?', 'cold', ['hot'], 0), q('What does Kino put on first?', 'jacket', ['dress', 'socks'], 1), q('What does Kino put on his head?', 'hat', ['shoes', 'scarf'], 2)],
  odam: [q('Who is hiding?', 'cat', ['dog', 'mouse'], 0), q('Where is the cat?', 'box', ['bed', 'chair'], 3)],
  tasitlar: [q('What does Kino ride first?', 'bus', ['car', 'plane'], 0), q('What goes on the water?', 'boat', ['train', 'truck'], 2), q('Who does Kino visit?', 'grandma', ['teacher', 'friend'], 3)],
  hareketler: [q('What does Kino do first?', 'run', ['swim', 'clap'], 0), q('What does Kino do at the end?', 'sleep', ['jump', 'dance'], 3)],
  vahsi: [q('What big animal does Kino see?', 'elephant', ['lion', 'giraffe'], 1), q('What can the frog do?', 'jump', ['swim', 'sleep'], 3)],
  meyve: [q('What does Kino pick first?', 'carrot', ['potato', 'corn'], 1), q('What red food does Kino pick?', 'tomato', ['banana', 'lemon'], 2)],
  hava: [q('What comes after the big cloud?', 'rain', ['snow', 'wind'], 2), q('What does Kino see at the end?', 'rainbow', ['moon', 'snow'], 3)],
  doga: [q('Where does Kino walk?', 'river', ['mountain', 'grass'], 0), q('What does Kino see at night?', 'moon', ['sun', 'rainbow'], 2)],
  okul: [q('Who does Kino say hello to?', 'teacher', ['mom', 'grandpa'], 3)],
  sayilar2: [q('What does Kino see in the sky?', 'star', ['sun', 'cloud'], 1)],
  // Masal 2.0 · Kino at the Lake (adimlar/masal2-veri.ts); sayfa: göl masalının sayfası
  gol: [q('What big animal does Kino see?', 'cow', ['horse', 'sheep'], 1), q("What color is Kino's hat?", 'blue', ['red', 'yellow'], 0), q("Who has Kino's hat?", 'duck', ['cat', 'dog'], 3)],
  // Masal 2.0 v2 · Kino at the Lake, güçlü hâli (ekip/ingilizce/MASAL-GOL-V2.md)
  gol2: [q("What color is Kino's hat?", 'blue', ['red', 'yellow'], 0), q('Who has a banana?', 'duck', ['frog', 'cow'], 3), q('What does the frog have?', 'leaf', ['hat', 'banana'], 4)],
  // Masal 2.0 · Lokum at the Beach (Renkler adası)
  kumsal: [q('What color is the bucket?', 'yellow', ['red', 'blue'], 0), q('Who is in the bucket?', 'crab', ['fish', 'snail'], 3), q('What is on top of the castle?', 'starfish', ['ball', 'boat'], 4)],
};

/** Sorunun ses kimliği */
export const masalSorusuSesi = (uniteId: string, sira: number): string => `en/g-mq-${uniteId}-${sira + 1}`;

/** Ses listesi için: bütün soruların Polly sözleri (ad → [metin, hece]) */
export function masalSorusuSozleri(): Record<string, [string, number]> {
  const hece = (s: string) => Math.max(1, s.split(/\s+/).reduce((t, w) => t + Math.max(1, (w.toLowerCase().replace(/[^a-z]/g, '').replace(/e$/, '').match(/[aeiouy]+/g) ?? []).length), 0));
  return Object.fromEntries(Object.entries(MASAL_SORULARI).flatMap(([u, l]) => l.map((x, i): [string, [string, number]] => [masalSorusuSesi(u, i).slice('en/g-'.length), [x.soru, hece(x.soru)]])));
}
