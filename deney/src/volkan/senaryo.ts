// Deneyler · Köpüren Renk Volkanı (Paket Deney-Y3, ikinci yazım; yönetici 23 Kasım: "Top Parkuru derinliğinde"). Senaryonun
// DOM'suz kuralları. Altı aşama:
//  1 · Hazırlık: önce önlük, sonra gözlük (güvenlik önce), sonra tezgâh örtüsü serilir. Sıra dışı dokunuş komik bir uyarıdır.
//  2 · Malzemeler: malzeme çekmecesinden volkan, kolba, karbonat kavanozu ve şişe sepeti tezgâhtaki yerlerine (2–3 yaşta
//      ikisi; öbürleri yerinde gelir).
//  3–4 · Renk ve köpük: kurallar karisim.ts'te (renkler kolbada karışır; sirke karbonatla buluşunca köpürür).
//  5 · İkinci tur: çocuk seçer: başka bir renk ya da kocaman volkan (dev volkan, köpük daha büyük).
//  6 · Temizlik ve ödül: sünger köpük birikintilerini siler; deney defterine çıkartma yapışır.
import { tur as renkTuru, type Hedef, type Karisim, type Yas } from './karisim';

export type Asama = 'hazirlik' | 'malzeme' | 'deney' | 'secim' | 'temizlik' | 'odul' | 'bitti';
export type HazirlikAdimi = 'onluk' | 'gozluk' | 'ortu';
export const HAZIRLIK: readonly HazirlikAdimi[] = ['onluk', 'gozluk', 'ortu'];
export type Malzeme = 'volkan' | 'kolba' | 'kavanoz' | 'sepet';
export const MALZEMELER: readonly Malzeme[] = ['volkan', 'kolba', 'kavanoz', 'sepet'];
export type Secim = 'renk' | 'dev';

/** Yaşa göre çekmeceden konan malzemeler (gerisi yerinde gelir). */
export const CEKMECEDE: Record<Yas, readonly Malzeme[]> = {
  minik: ['volkan', 'sepet'],
  dort: ['volkan', 'kolba', 'kavanoz', 'sepet'],
  bes: ['volkan', 'kolba', 'kavanoz', 'sepet'],
};
/** Köpük birikintisi sayısı (temizlik): 2–3 yaşta 2, büyüklerde 3; dev volkanda bir fazla. */
export const birikintiSayisi = (yas: Yas, dev: boolean) => (yas === 'minik' ? 2 : 3) + (dev ? 1 : 0);

export type HazirlikSonucu = { tur: 'oldu'; adim: HazirlikAdimi; bitti: boolean } | { tur: 'once'; gereken: HazirlikAdimi } | { tur: 'zaten' };

export class Senaryo {
  asama: Asama = 'hazirlik';
  readonly giyilen = new Set<HazirlikAdimi>();
  readonly konan = new Set<Malzeme>();
  /** Turlar: 1. tur hedefi, 2. tur seçime göre. */
  tur = 1;
  secim: Secim | null = null;
  /** Temizlikte birikintilerin kalan oranı (1 dolu, 0 temiz). */
  birikinti: number[] = [];
  readonly hedefler: (Hedef | null)[];
  constructor(readonly yas: Yas, tekrar = 0) {
    for (const m of MALZEMELER) if (!CEKMECEDE[yas].includes(m)) this.konan.add(m);
    this.hedefler = renkTuru(yas, tekrar).hedefler;
  }
  /** "Bir daha": önlük, gözlük, örtü ve malzemeler yerinde kalır; doğrudan deney. */
  hazirlikAtla() {
    for (const a of HAZIRLIK) this.giyilen.add(a);
    for (const m of MALZEMELER) this.konan.add(m);
    this.asama = 'deney';
  }
  /** Hazırlık adımı: önlük, gözlük, örtü sırayla (güvenlik önce). */
  hazirla(a: HazirlikAdimi): HazirlikSonucu {
    if (this.asama !== 'hazirlik') return { tur: 'zaten' };
    if (this.giyilen.has(a)) return { tur: 'zaten' };
    const gereken = HAZIRLIK.find((x) => !this.giyilen.has(x))!;
    if (a !== gereken) return { tur: 'once', gereken };
    this.giyilen.add(a);
    const bitti = this.giyilen.size === HAZIRLIK.length;
    if (bitti) this.asama = this.konan.size === MALZEMELER.length ? 'deney' : 'malzeme';
    return { tur: 'oldu', adim: a, bitti };
  }
  /** Malzeme tezgâhtaki yerine kondu. Hepsi konunca deney başlar. */
  koy(m: Malzeme) {
    if (this.asama !== 'malzeme' || this.konan.has(m)) return false;
    this.konan.add(m);
    if (this.konan.size === MALZEMELER.length) this.asama = 'deney';
    return true;
  }
  /** O turun hedefi: 1. turda yaşın ilk hedefi; 2. turda "başka renk" yaşın ikinci hedefi, "kocaman volkan" o renk üç ölçek. */
  hedef(): Hedef | null {
    if (this.tur === 1) return this.hedefler[0] ?? null;
    const h2 = this.hedefler[1] ?? null;
    if (this.secim === 'dev') return h2 ? { renk: h2.renk, boy: 3 } : null;
    return h2;
  }
  /** Köpük oldu: hedef tuttuysa tur biter (1. turdan sonra seçim, 2. turdan sonra temizlik). */
  kopurdu(tuttu: boolean) {
    if (this.asama !== 'deney' || !tuttu) return false;
    if (this.tur === 1) { this.asama = 'secim'; return true; }
    this.asama = 'temizlik';
    this.birikinti = Array.from({ length: birikintiSayisi(this.yas, this.secim === 'dev') }, () => 1);
    return true;
  }
  sec(s: Secim) {
    if (this.asama !== 'secim') return false;
    this.secim = s;
    this.tur = 2;
    this.asama = 'deney';
    return true;
  }
  /** Sünger bir birikintinin üstünden geçti: kalan biraz azalır; hepsi temizlenince ödül. */
  sil(i: number, miktar = 0.34) {
    if (this.asama !== 'temizlik' || !(i in this.birikinti)) return false;
    this.birikinti[i] = Math.max(0, this.birikinti[i] - miktar);
    if (this.birikinti.every((x) => x === 0)) this.asama = 'odul';
    return true;
  }
  odulAlindi() { if (this.asama === 'odul') this.asama = 'bitti'; }
}
/** Çıkartmanın köpük rengi: son turun rengi (2. tur başka renkse o). */
export const cikartmaRengi = (renkler: Karisim[]): Karisim => renkler[renkler.length - 1] ?? 'mor';
