// Ölçü tezgâhı · "Bulut'un Tahterevalli Dengesi" (danışman CEVAP-06 C2-2): DOM'suz kurallar (birim testleri buradan sınar).
// Tur kodu: tahterevalli.ts. Çizimler: Astra Paket M13 (assets/matematik/tahterevalli/), sözler: tahterevalli-sozler.json.
// Sol uçta balkabağı (5+ ikinci turda yanında sulama kabı), sağ uca çocuk tahta küp koyar. Ağırlık küp birimiyle:
// tahta, eksik küp sayısına göre sola yatık durur; her küpte biraz düzelir; fazlasında sağa yatar; eşitte düz.
import sozler from './tahterevalli-sozler.json';
import { gelisSorusu, type Havuzlar } from './derinlik';

export type TYol = 'minik' | 'dort' | 'bes';
export const yasYolu = (yas: number | null): TYol => (yas !== null && yas < 4 ? 'minik' : yas === 4 ? 'dort' : 'bes');
export type Nesne = 'balkabagi' | 'sulama-kabi';
export type Tur = { nesneler: readonly { ad: Nesne; kup: number }[]; hedef: number; soz: 'giris' | 'ikinci' };
const tur = (nesneler: { ad: Nesne; kup: number }[], soz: Tur['soz']): Tur => ({ nesneler, hedef: nesneler.reduce((t, n) => t + n.kup, 0), soz });

/**
 * Yaşa göre turlar (yönetici: 2–3 yaş balkabağı 2 küp, 4 yaş 3–4, 5+ 4–6 ve ikinci turda iki nesne). 4 yaşta yeniden
 * oynayışta balkabağı 3 ile 4 arasında değişir (aynı iş iki kez olmaz). 5+ ikinci tur başka iş: iki nesnenin toplamı.
 */
export function turlar(yol: TYol, tekrar = 0): readonly Tur[] {
  // Gelişe göre (derinlik.ts; denge sesleri 2–6 küp): 2–3 yaş 2 → 3 → 4 (ya da 3); 4 yaş 3 → 4 → 5 (ya da 6);
  // 5+ 4 ve 4 + 2 → 5 ve 3 + 2 → 6 ve 4 + 2 (ya da 5 ve 3 + 3).
  const b = (kup: number) => tur([{ ad: 'balkabagi', kup }], 'giris');
  const iki = (a: number, s: number) => tur([{ ad: 'balkabagi', kup: a }, { ad: 'sulama-kabi', kup: s }], 'ikinci');
  const h: Havuzlar<readonly Tur[]> = yol === 'minik' ? [[[b(2)]], [[b(3)]], [[b(4)], [b(3)]]]
    : yol === 'dort' ? [[[b(3)]], [[b(4)]], [[b(5)], [b(6)]]]
      : [[[b(4), iki(4, 2)]], [[b(5), iki(3, 2)]], [[b(6), iki(4, 2)], [b(5), iki(3, 3)]]];
  return gelisSorusu(h, tekrar);
}

/** En büyük yatıklık (derece): park tahterevallisi gibi, uç yere değmeden. */
export const EN_ACI = 11;
/**
 * Tahtanın açısı: eksik küp başına eşit adımla düzelir (eksi: sol aşağıda), fazlada sağa yatar; eşitte 0. Tek bir küp
 * fazlası bile belirgin görünsün diye fazla tarafı en az üçte bir yatıklıktır.
 */
export function aci(kup: number, hedef: number): number {
  if (kup === hedef) return 0;
  if (kup < hedef) return -EN_ACI * ((hedef - kup) / hedef);
  return Math.min(EN_ACI, EN_ACI * Math.max(1 / 3, (kup - hedef) / hedef));
}
export type Durum = 'agir' | 'denge' | 'fazla';
export const durum = (kup: number, hedef: number): Durum => (kup === hedef ? 'denge' : kup < hedef ? 'agir' : 'fazla');
/** Yığında kaç küp var: hedef + 2 (fazla koymak mümkün olsun, tahta kendisi göstersin). */
export const yiginBoyu = (hedef: number) => hedef + 2;
export const dengeSesi = (hedef: number) => 'denge_' + hedef;

/**
 * Yaylanan tahta (park fiziği): açısal yay ve sönüm. `adim` bir kareyi ilerletir (saniye); hafif sönümlü olduğu için
 * hedef açıya bir iki kez salınarak oturur.
 */
export const YAY = { sertlik: 48, sonum: 6.5 };
export function yayAdimi(s: { aci: number; hiz: number }, hedef: number, dt: number) {
  const d = Math.min(dt, 1 / 30);
  const ivme = -YAY.sertlik * (s.aci - hedef) - YAY.sonum * s.hiz;
  const hiz = s.hiz + ivme * d;
  return { aci: s.aci + hiz * d, hiz };
}

export const GEREKLI_CIZIMLER: readonly string[] = [
  'bahce', 'mesnet', 'kol', 'balkabagi', 'kup', 'sulama-kabi', 'bulut-otur', 'bulut-kikirda', 'lokum-izle', 'lokum-alkis',
];
export const GEREKLI_SESLER: readonly string[] = Object.keys(sozler);
