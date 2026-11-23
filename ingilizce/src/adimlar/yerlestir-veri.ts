/**
 * Sahneye Taşı (22 Kasım 2026) · DOM'suz veri: sahneler, yerleşim kutuları, plan, çizim ve ses listeleri.
 *
 * Neden: Odam, Yiyecekler ve Vahşi adalarında dokuz dersin hepsi ortak kalıpla dönüyordu (adaya özel tek etkinlik yoktu;
 * Barış: "az tekrar, çok çeşit"). Bu üç adada 2. derste Eksik'in, şenlikte Obur'u Besle'nin yerine adanın kendi sahnesi gelir:
 * Polly bir kelime söyler, çocuk o eşyayı raftan tutup sahneye SÜRÜKLER (dokun-bul değil); eşya yerine oturur ve canlanır
 * (lamba yanar, balık sıçrar, aslan kükrer), karakter sevinir. Hepsi yerleşince sahnenin tamamı birlikte canlanır.
 *
 * Çizimler (Astra, Paket 34): her sahne 1600 × 1000 aynı tuvalde katman katman. `fon` dolu zemindir; karakterin iki pozu ve
 * her eşya ayrı, şeffaf zeminli katmandır ve tuvalde aşağıdaki kutunun içine çizilir. Kod katmanları üst üste koyar.
 * Çizimi ya da Ceren'in giriş sözü gelmeden ders bu adımı açmaz, yedeği oynar (taslakta yer tutucuyla açılır).
 */
import type { Kelime, SesMetni } from '../icerik';
import type { Yas } from '../plan';

type Rnd = () => number;
const karistir = <T>(l: readonly T[], rnd: Rnd): T[] => { const a = [...l]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/** Eşya yerine oturunca çalan küçük hareket (yerlestir.css) */
export type CanliHareket = 'sek' | 'esne' | 'salla' | 'parla' | 'sallan' | 'yuz' | 'ucus' | 'kivril' | 'egil';

/** Tuvaldeki kutu, yüzde olarak: sol, üst, genişlik, yükseklik (1600 × 1000 tuvalde) */
export type Kutu = readonly [number, number, number, number];

export interface SahneYeri { kutu: Kutu; hareket: CanliHareket }

export interface YerlestirSahnesi {
  ad: 'oda' | 'ogle' | 'safari';
  uniteId: string;
  /** karakter (onaylı kadro) ve tuvaldeki kutusu */
  kim: 'kino' | 'mino' | 'zipzip';
  kimKutu: Kutu;
  /** taslak kipinde fonun yerine düz renk */
  renk: string;
  yerler: Readonly<Record<string, SahneYeri>>;
  giris: SesMetni;
  son: SesMetni;
}

const hece = (s: string) => (s.toLowerCase().match(/[aeiouy]+/g) ?? []).length || 1;
const polly = (id: string, metin: string): SesMetni => ({ id, kim: 'polly', dil: 'en', metin, hece: hece(metin) });
const ceren = (id: string, metin: string): SesMetni => ({ id, kim: 'ceren', dil: 'tr', metin, hece: (metin.toLocaleLowerCase('tr').match(/[aeıioöuü]/g) ?? []).length });

export const YERLESTIR_SAHNELERI: readonly YerlestirSahnesi[] = [
  {
    ad: 'oda', uniteId: 'odam', kim: 'kino', kimKutu: [36, 28, 18, 68], renk: '#f6ead8',
    yerler: {
      door: { kutu: [3, 16, 13, 70], hareket: 'esne' },
      window: { kutu: [20, 12, 14, 26], hareket: 'parla' },
      clock: { kutu: [63, 8, 8, 13], hareket: 'salla' },
      bed: { kutu: [72, 52, 26, 42], hareket: 'sek' },
      lamp: { kutu: [56, 26, 6, 66], hareket: 'parla' },
      box: { kutu: [62, 76, 9, 16], hareket: 'sek' },
      table: { kutu: [16, 64, 12, 28], hareket: 'esne' },
      chair: { kutu: [28, 58, 7, 34], hareket: 'sek' },
    },
    giris: ceren('tr/c-yr-oda-giris', 'Kino\'nun odası bomboş! Polly bir eşyanın adını söyleyecek. Sen o eşyayı tut, odaya sürükle.'),
    son: polly('en/g-yr-oda-son', 'What a nice room, Kino!'),
  },
  {
    ad: 'ogle', uniteId: 'yiyecekler', kim: 'mino', kimKutu: [38, 10, 24, 60], renk: '#fdf1dc',
    yerler: {
      milk: { kutu: [4, 46, 8, 32], hareket: 'salla' },
      water: { kutu: [13, 50, 7, 28], hareket: 'salla' },
      bread: { kutu: [21, 58, 9, 20], hareket: 'sek' },
      cheese: { kutu: [30, 62, 7, 16], hareket: 'sek' },
      egg: { kutu: [63, 64, 6, 14], hareket: 'salla' },
      apple: { kutu: [70, 60, 7, 18], hareket: 'sek' },
      banana: { kutu: [78, 62, 10, 16], hareket: 'sek' },
      pear: { kutu: [89, 56, 7, 22], hareket: 'sek' },
    },
    giris: ceren('tr/c-yr-ogle-giris', 'Mino çok acıkmış! Polly\'nin söylediği yiyeceği tut, Mino\'nun masasına sürükle.'),
    son: polly('en/g-yr-ogle-son', 'Yummy, yummy! Mino is happy.'),
  },
  {
    ad: 'safari', uniteId: 'vahsi', kim: 'zipzip', kimKutu: [2, 38, 14, 58], renk: '#dff1d6',
    yerler: {
      bird: { kutu: [22, 6, 7, 12], hareket: 'ucus' },
      monkey: { kutu: [30, 14, 9, 26], hareket: 'sallan' },
      giraffe: { kutu: [44, 4, 14, 60], hareket: 'egil' },
      elephant: { kutu: [60, 36, 20, 42], hareket: 'esne' },
      lion: { kutu: [82, 30, 15, 30], hareket: 'esne' },
      snake: { kutu: [46, 72, 10, 16], hareket: 'kivril' },
      frog: { kutu: [32, 80, 7, 11], hareket: 'sek' },
      fish: { kutu: [20, 68, 8, 14], hareket: 'yuz' },
    },
    giris: ceren('tr/c-yr-safari-giris', 'Zıpzıp hayvanları görmek istiyor! Polly\'nin söylediği hayvanı tut, ormana sürükle.'),
    son: polly('en/g-yr-safari-son', 'Look at all the animals!'),
  },
];

export const yerlestirSahnesi = (uniteId: string | undefined) => YERLESTIR_SAHNELERI.find((s) => s.uniteId === uniteId);

/** Çizim yolları (assets/ingilizce/<yol>.webp) */
export const sahneYolu = (s: Pick<YerlestirSahnesi, 'ad'>, parca: string) => `oyun/yerlestir/${s.ad}-${parca}`;
export const yerlestirCizimleri = (s: YerlestirSahnesi): string[] => [sahneYolu(s, 'fon'), sahneYolu(s, `${s.kim}-0`), sahneYolu(s, `${s.kim}-1`), ...Object.keys(s.yerler).map((id) => sahneYolu(s, id))];

export interface YerlestirPlani { sahne: YerlestirSahnesi['ad']; hedefler: Kelime[]; raf: Kelime[] }

/** Hedefler (2–3 yaş 3, diğerleri 4) sırayla taşınır; rafta bir iki eşya fazladan durur (çeldirici, adanın kendi kelimesi) */
export function yerlestirPlani(uniteId: string, hedefler: readonly Kelime[], raf: readonly Kelime[], yas: Yas, rnd: Rnd): YerlestirPlani | null {
  const s = yerlestirSahnesi(uniteId);
  if (!s) return null;
  const yeri = (w: Kelime) => !!s.yerler[w.id];
  const secilen = karistir(hedefler.filter(yeri), rnd).slice(0, yas === '2-3' ? 3 : 4);
  if (secilen.length < 2) return null;
  const fazla = karistir(raf.filter((w) => yeri(w) && !secilen.some((x) => x.id === w.id)), rnd).slice(0, yas === '2-3' ? 1 : 2);
  return { sahne: s.ad, hedefler: secilen, raf: karistir([...secilen, ...fazla], rnd) };
}

/** Adımın kayıtları: Ceren'in girişi, Polly'nin sonu, kelimeler ve cümleleri; hayvanların efekti varsa o da */
export function yerlestirSesleri(p: YerlestirPlani, efektVar: (id: string) => boolean = () => false): string[] {
  const s = YERLESTIR_SAHNELERI.find((x) => x.ad === p.sahne)!;
  return [s.giris.id, s.son.id, 'en/g-yes', ...p.raf.map((w) => `en/w-${w.id}`), ...p.hedefler.flatMap((w) => [`en/c-${w.id}`, ...(efektVar(w.id) ? [`efekt/${w.id}`] : [])])];
}

/** Ses betiği için (scripts/ingilizce-ses.ts) */
export const yerlestirSesMetinleri = (): SesMetni[] => YERLESTIR_SAHNELERI.flatMap((s) => [s.giris, s.son]);
