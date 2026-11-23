// Deneyler · Köpüren Renk Volkanı (Paket Deney-Y3; yönetici 23 Kasım gecesi, CEVAP-09 Yön 3 "Çılgın Köpük, Renk ve Basınç
// Tezgâhı"ndan tek deney). Gerçek bilim, güvenli malzeme: gıda boyasıyla renklendirilmiş sirke, karbonat, oyuncak volkan.
// DOM'suz kurallar:
// - Renk karışımı: üç ana renk (kırmızı, sarı, mavi) kolbada karışır; ikisi ara rengi verir (turuncu, yeşil, mor), üçü birden
//   kahverengi ("çamur") yapar. Aynı renk iki kez dökülürse renk değişmez, yalnız sıvı artar.
// - Tepkime: sirke (asit) karbonatla (baz) buluşunca karbondioksit gazı çıkar, gaz köpüğü şişirir. Sıra fark etmez: karbonat
//   volkandayken sirke dökülürse de, sirke volkandayken karbonat konursa da köpürür. Kuru karbonat tek başına köpürmez.
// - Köpüğün büyüklüğü dökülen sirkenin miktarıyla artar (karbonat bol): 1, 2 ya da 3 ölçek.
export type Renk = 'kirmizi' | 'sari' | 'mavi';
export type Karisim = Renk | 'turuncu' | 'yesil' | 'mor' | 'kahve';
export type Yas = 'minik' | 'dort' | 'bes';
export type Boy = 1 | 2 | 3;

export const RENKLER: readonly Renk[] = ['kirmizi', 'sari', 'mavi'];
/** Kolba en çok üç ölçek sirke alır. */
export const KOLBA_EN_COK = 3;

/** Dökülen renklerden karışımın rengi (boşsa null). */
export function karisim(dokulen: readonly Renk[]): Karisim | null {
  const s = new Set(dokulen);
  if (s.size === 0) return null;
  if (s.size === 3) return 'kahve';
  if (s.size === 1) return dokulen[0];
  if (s.has('kirmizi') && s.has('sari')) return 'turuncu';
  if (s.has('sari') && s.has('mavi')) return 'yesil';
  return 'mor';
}

/** Ekranda sıvının ve köpüğün boyası (Astra'nın açık renkli çizimi bununla çarpılır: kontur koyu kalır). */
export const BOYA: Record<Karisim, string> = {
  kirmizi: '#ff5a5f', sari: '#ffd23f', mavi: '#3aa0ff', turuncu: '#ff9a3c', yesil: '#5ccf5a', mor: '#b16cf0', kahve: '#a8734a',
};

export type Patlama = { renk: Karisim; boy: Boy };
/** Volkanın ağzı: karbonat var mı, içinde bekleyen sirke (rengi ve miktarı). */
export type Krater = { karbonat: boolean; sivi: Karisim | null; miktar: number };

export type DokSonucu = { tur: 'doldu'; renk: Karisim; miktar: number } | { tur: 'dolu' };
export type KasikSonucu = { tur: 'kondu' } | { tur: 'zaten' } | { tur: 'patlama'; p: Patlama };
export type KolbaSonucu = { tur: 'bos' } | { tur: 'bekliyor' } | { tur: 'patlama'; p: Patlama };

/** Deney tezgâhı: kolba, volkanın ağzı. Her eylemin sonucu sahneye ne olacağını söyler. */
export class Tezgah {
  kolba: Renk[] = [];
  krater: Krater = { karbonat: false, sivi: null, miktar: 0 };

  /** Şişeden kolbaya bir ölçek renkli sirke (2–3 yaşta bir dokunuş iki ölçek döker; kolba en çok üç alır). */
  dok(r: Renk, olcek = 1): DokSonucu {
    if (this.kolba.length >= KOLBA_EN_COK) return { tur: 'dolu' };
    for (let i = 0; i < olcek && this.kolba.length < KOLBA_EN_COK; i++) this.kolba.push(r);
    return { tur: 'doldu', renk: karisim(this.kolba)!, miktar: this.kolba.length };
  }
  /** Kaşıkla karbonat volkana: sirke bekliyorsa köpürür. */
  kasik(): KasikSonucu {
    if (this.krater.sivi) {
      const p: Patlama = { renk: this.krater.sivi, boy: boyu(this.krater.miktar) };
      this.temizle();
      return { tur: 'patlama', p };
    }
    if (this.krater.karbonat) return { tur: 'zaten' };
    this.krater.karbonat = true;
    return { tur: 'kondu' };
  }
  /** Kolbayı volkana boşalt: karbonat varsa köpürür, yoksa sirke volkanda bekler. */
  kolbayiBosalt(): KolbaSonucu {
    const renk = karisim(this.kolba);
    if (!renk) return { tur: 'bos' };
    const miktar = this.kolba.length;
    this.kolba = [];
    if (this.krater.karbonat) {
      this.temizle();
      return { tur: 'patlama', p: { renk, boy: boyu(miktar) } };
    }
    // Volkanda bekleyen sirkeye eklenir (renkler karışır).
    const once = this.krater.sivi;
    this.krater.sivi = once ? karisimAdlar([once, renk]) : renk;
    this.krater.miktar = Math.min(KOLBA_EN_COK, this.krater.miktar + miktar);
    return { tur: 'bekliyor' };
  }
  /** Köpük bitince volkan yıkanır. */
  temizle() { this.krater = { karbonat: false, sivi: null, miktar: 0 }; }
}
const boyu = (miktar: number): Boy => (Math.max(1, Math.min(3, miktar)) as Boy);

/** İki karışımın birleşimi (ana renk bileşenleri üzerinden). */
const BILESEN: Record<Karisim, Renk[]> = {
  kirmizi: ['kirmizi'], sari: ['sari'], mavi: ['mavi'], turuncu: ['kirmizi', 'sari'], yesil: ['sari', 'mavi'], mor: ['kirmizi', 'mavi'],
  kahve: ['kirmizi', 'sari', 'mavi'],
};
export const karisimAdlar = (k: readonly Karisim[]): Karisim => karisim(k.flatMap((x) => BILESEN[x]))!;
/** Bir ara rengin hangi iki ana renkten olduğu (ipucu: o şişeler parlar). */
export const bilesenleri = (k: Karisim): readonly Renk[] => BILESEN[k];

/** Ceren'in hedefi: istenen renk ve (5+ yaşta) kocaman köpük. */
export type Hedef = { renk: Karisim; boy?: Boy };
/**
 * Yaşa göre tur (her girişte iki ya da üç volkan; "bir daha" denince sıradaki hedefler):
 * - 2–3 yaş: hedef yok, serbest; üç volkan, her renk sürpriz. Karbonat volkanda hazır.
 * - 4 yaş: iki ara renk (mor, yeşil; sonra turuncu, mor; …).
 * - 5+ yaş: bir ara renk, sonra kocaman (üç ölçek) bir ara renk.
 */
export function tur(yas: Yas, tekrar = 0): { hedefler: (Hedef | null)[]; karbonatHazir: boolean } {
  const ara: Karisim[] = ['mor', 'yesil', 'turuncu'];
  const a = ara[tekrar % 3], b = ara[(tekrar + 1) % 3];
  if (yas === 'minik') return { hedefler: [null, null, null], karbonatHazir: true };
  if (yas === 'dort') return { hedefler: [{ renk: a }, { renk: b }], karbonatHazir: false };
  return { hedefler: [{ renk: b }, { renk: a, boy: 3 }], karbonatHazir: false };
}
/** Patlama hedefi tuttu mu (hedef yoksa her köpük olur). */
export const tuttu = (h: Hedef | null, p: Patlama) => !h || (p.renk === h.renk && (!h.boy || p.boy >= h.boy));
