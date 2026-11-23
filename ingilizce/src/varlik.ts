/**
 * Çizim ve ses dosyalarına erişim. Dosya doğru adla doğru klasöre gelince (ekip/ingilizce/CIZIM-ISLERI.md)
 * uygulamada kendiliğinden bulunur; kodda yer ayarı gerekmez.
 *
 * Yarım iş görünmez: bir ünite ancak çekirdek kelimelerinin çizimi ve bütün sesleri tamamsa açılır (`uniteHazir`);
 * sonradan eklenen kelime kendi çizimi ve sesi gelince derse girer (`kelimeAcik`); Seviye 2 ve 3 dersleri kendi
 * çizimleri ve sesleri tamamsa açılır (`dersHazir`). Çizimi gelmemiş bir oyun da listede görünmez (`oyunHazir`).
 * Geliştirirken `?taslak` ile her şey yer tutucularla açılır.
 */
import dosyaAdresleri from 'virtual:ingilizce-dosyalar';
import { kelimeBul, kelimeSesleri, ortakSesler, type DersNo, type Kelime, type Unite } from './icerik';
import { dersGorselleri, dersIfadeleri, dersSesKimlikleri, ortakSesler2, type Gorsel, type KinoPozu } from './icerik2';

/**
 * Çizim ve ses tablosu: assets/ingilizce'e göre yol ("kelime/cow.webp", "ses/en/w-cow.mp3") → adres.
 * Tablo `virtual:ingilizce-dosyalar` modülünden gelir (ingilizce/vite-dosyalar.ts): geliştirme sunucusunda klasör
 * doğrudan okunur, derlemede dosyalar paketlenir. (`import.meta.glob` bin beş yüz dosyada geliştirme sunucusunu
 * dakikalarca kilitliyordu.)
 */
const dosyalar = new Map<string, string>(Object.entries(dosyaAdresleri));
const cerenAgiz = import.meta.glob<string>('../../assets/alfabe/ceren-konus/[0-3].webp', { eager: true, query: '?url', import: 'default' });
const oburHalleri = import.meta.glob<string>('../../assets/alfabe/obur/*.webp', { eager: true, query: '?url', import: 'default' });
const adaZemini = import.meta.glob<string>('../../assets/ada-arkaplan/*.webp', { eager: true, query: '?url', import: 'default' });
const dugmeler = import.meta.glob<string>('../../assets/hazirlik/dugmeler/{ev,ileri,dinle,tekrar,tamam}.webp', { eager: true, query: '?url', import: 'default' });

/** Geliştirme görünümü: hazır olmayan üniteler ve oyunlar da yer tutucularla açılır */
export const TASLAK = typeof location !== 'undefined' && new URLSearchParams(location.search).has('taslak');

/** assets/ingilizce/<yol>.webp */
export const resim = (yol: string): string | undefined => dosyalar.get(`${yol}.webp`);
/** assets/ingilizce/ses/<id>.mp3 */
export const sesAdresi = (id: string): string | undefined => dosyalar.get(`ses/${id}.mp3`);
/** Polly'nin Şarkıları: onaylanmış şarkı dosyası (assets/ingilizce/sarki/<id>.mp3) */
export const sarkiAdresi = (id: string): string | undefined => dosyalar.get(`sarki/${id}.mp3`);

/** Numaralı kare dizisi: 'kisi/polly-konus' → polly-konus-0, -1, -2 … (sıralı; hiç yoksa boş) */
export function kareler(onEk: string): string[] {
  const liste: string[] = [];
  for (let i = 0; i < 12; i++) {
    const r = resim(`${onEk}-${i}`);
    if (!r) break;
    liste.push(r);
  }
  return liste;
}

/** Ceren'in konuşma kareleri (Harf Atölyesi ile ortak çizim) */
export const cerenKonusma = (): string[] => [0, 1, 2, 3].map((i) => cerenAgiz[`../../assets/alfabe/ceren-konus/${i}.webp`]).filter(Boolean);
/** Obur'un hâlleri (Harf Atölyesi ile ortak çizim): ac, bekle, eksi, tok */
export const obur = (hal: 'ac' | 'bekle' | 'eksi' | 'tok'): string | undefined => oburHalleri[`../../assets/alfabe/obur/${hal}.webp`];
export const adaResmi = (ad: 'kasaba-ada' | 'kasaba-deniz'): string | undefined => adaZemini[`../../assets/ada-arkaplan/${ad}.webp`];
export const dugmeResmi = (ad: 'ev' | 'ileri' | 'dinle' | 'tekrar' | 'tamam'): string | undefined => dugmeler[`../../assets/hazirlik/dugmeler/${ad}.webp`];

export const kelimeResmiAdresi = (w: Kelime): string | undefined => resim(`kelime/${w.id}`);
/** Kelimenin zıplama kareleri (varsa): kelime/<id>-z0 … z3 */
export const kelimeKareleri = (w: Kelime): string[] => [0, 1, 2, 3].map((i) => resim(`kelime/${w.id}-z${i}`)).filter((x): x is string => !!x);

/** Adanın sahne parçaları: ada/<unite>-set + hareketli parçalar */
export function adaParcalari(uniteId: string): { ad: string; adres: string }[] {
  const onEk = `ada/${uniteId}-`;
  return [...dosyalar.entries()]
    .filter(([yol]) => yol.startsWith(onEk) && yol.endsWith('.webp'))
    .map(([yol, adres]) => ({ ad: yol.slice(onEk.length, -5), adres }))
    .sort((a, b) => a.ad.localeCompare(b.ad));
}

const kelimeEksikleri = (w: Kelime): string[] => {
  const eksik: string[] = [];
  if (!kelimeResmiAdresi(w)) eksik.push(`çizim kelime/${w.id}`);
  for (const s of kelimeSesleri(w)) if (!sesAdresi(s.id)) eksik.push(`ses ${s.id}`);
  if (w.efekt && !sesAdresi(`efekt/${w.id}`)) eksik.push(`ses efekt/${w.id}`);
  return eksik;
};

const acikKelime = new Map<string, boolean>();

/** Hayvan derslerinin hayvanı (ünite kelimesi ya da ek hayvan) açık mı: çizimi ve altı kaydı tamamsa; taslakta çizimi yeter */
export function hayvanAcik(w: Kelime): boolean {
  if (TASLAK) return !!kelimeResmiAdresi(w);
  let a = acikHayvan.get(w.id);
  if (a === undefined) { a = kelimeEksikleri(w).length === 0; acikHayvan.set(w.id, a); }
  return a;
}
const acikHayvan = new Map<string, boolean>();
/**
 * Kelime derslerde, albümde ve oyunlarda görünür mü. Ünitenin çekirdek kelimeleri ünite açıksa hep görünür;
 * sonradan eklenen kelime (`ek`) kendi çizimi ve bütün sesleri gelince görünür.
 */
export function kelimeAcik(w: Kelime): boolean {
  if (!w.ek || TASLAK) return true;
  let a = acikKelime.get(w.id);
  if (a === undefined) { a = kelimeEksikleri(w).length === 0; acikKelime.set(w.id, a); }
  return a;
}
/** Ünitenin çocuğa gösterilen kelimeleri */
export const acikKelimeler = (u: Unite): Kelime[] => u.kelimeler.filter(kelimeAcik);

const eksikListesi = (u: Unite): string[] => {
  const eksik: string[] = [];
  for (const w of u.kelimeler) {
    if (!w.ek) eksik.push(...kelimeEksikleri(w));
  }
  if (!sesAdresi(`tr/u-${u.id}`)) eksik.push(`ses tr/u-${u.id}`);
  return eksik;
};

let ortakTamam: boolean | undefined;
/** Polly'nin, Ceren'in ve Kino'nun ortak sözleri kayıtlı mı */
export function ortakHazir(): boolean {
  ortakTamam ??= ortakSesler().every((s) => !!sesAdresi(s.id));
  return ortakTamam;
}

const hazirlik = new Map<string, boolean>();
/** Ünitenin çizimleri ve sesleri tamam mı (taslak görünümünde her ünite açık sayılır) */
export function uniteHazir(u: Unite): boolean {
  if (TASLAK) return true;
  let h = hazirlik.get(u.id);
  if (h === undefined) { h = ortakHazir() && eksikListesi(u).length === 0; hazirlik.set(u.id, h); }
  return h;
}
/** Üretim durumu için: ünitenin eksik dosyaları (çekirdek kelimeler + sonradan eklenenler) */
export const uniteEksikleri = (u: Unite): string[] => [...eksikListesi(u), ...u.kelimeler.filter((w) => w.ek).flatMap(kelimeEksikleri)];

/** Kino'nun ifadelerdeki pozları: sever, sevmez (Astra'nın çizimleri), elinde tutar (kart tutan Kino) */
export const KINO_POZU: Record<KinoPozu, string> = { sev: 'kisi/kino-begen', sevme: 'kisi/kino-begenme', tut: 'kisi/kino-kart-1' };

/** Resim tarifinin eksik çizimleri (boşsa resim kurulabilir) */
export function gorselEksikleri(g: Gorsel): string[] {
  const eksik: string[] = [];
  const kelime = (id: string) => { const w = kelimeBul(id); if (!w || !kelimeResmiAdresi(w)) eksik.push(`kelime/${id}`); };
  if (g.ozel) { if (!resim(g.ozel)) eksik.push(g.ozel); } else if (g.k) kelime(g.k);
  if (g.ile) kelime(g.ile);
  if (g.kino && !resim(KINO_POZU[g.kino])) eksik.push(KINO_POZU[g.kino]);
  if (g.kalp && !resim('ui/soz-kalp')) eksik.push('ui/soz-kalp');
  return eksik;
}

let ortak2Tamam: boolean | undefined;
const ortak2Hazir = (): boolean => (ortak2Tamam ??= ortakSesler2().every((s) => !!sesAdresi(s.id)));

/** Seviye 2 ve 3 dersinin eksik dosyaları (çizim ve ses); Seviye 1 derslerinde ünitenin eksikleri */
export function dersEksikleri(u: Unite, no: DersNo): string[] {
  if (no < 3) return eksikListesi(u);
  const eksik = new Set<string>();
  for (const g of dersGorselleri(u, no)) for (const e of gorselEksikleri(g)) eksik.add(`çizim ${e}`);
  for (const i of dersIfadeleri(u, no)) for (const p of i.parcalar) if (p.simge && !resim(p.simge)) eksik.add(`çizim ${p.simge}`);
  for (const id of dersSesKimlikleri(u, no)) if (!sesAdresi(id)) eksik.add(`ses ${id}`);
  // 7. ders (soru–cevap) sonunda Seviye 2'nin ifadeleriyle kısa bir "Hangisi?" turu yapar
  if (no === 6) for (const i of dersIfadeleri(u, 5)) { if (!sesAdresi(i.ses)) eksik.add(`ses ${i.ses}`); for (const e of gorselEksikleri(i.g)) eksik.add(`çizim ${e}`); }
  return [...eksik];
}

const dersHazirligi = new Map<string, boolean>();
/** Ders açılabilir mi: ünitesi açık, kendi çizimleri ve sesleri tamam; üst seviyeler ancak altındaki seviye de hazırsa */
export function dersHazir(u: Unite, no: DersNo): boolean {
  if (TASLAK) return true;
  if (no < 3) return uniteHazir(u);
  const anahtar = `${u.id}-${no}`;
  let h = dersHazirligi.get(anahtar);
  if (h === undefined) {
    h = uniteHazir(u) && ortak2Hazir() && dersEksikleri(u, no).length === 0 && (no < 6 || [3, 4, 5].every((n) => dersHazir(u, n as DersNo)));
    dersHazirligi.set(anahtar, h);
  }
  return h;
}

/** Bir oyunun kendine özel çizimleri geldi mi */
export function oyunHazir(tip: 'balon' | 'eksik' | 'eslestir' | 'besle' | 'ogret' | 'bul' | 'say' | 'yap' | 'kapi'): boolean {
  if (TASLAK) return true;
  switch (tip) {
    case 'balon': return ['kirmizi', 'mavi', 'sari', 'yesil'].every((r) => !!resim(`oyun/balon-${r}`));
    case 'eksik': return !!resim('oyun/perde');
    case 'eslestir': return !!resim('oyun/kart-arka');
    case 'besle': return !!obur('ac') && !!obur('tok');
    case 'kapi': return !!resim('kelime/door');
    default: return true;
  }
}

/** Ünitenin konuşan resim sahnesi (assets/ingilizce/sahne/<unite>.webp) */
export const sahneResmi = (uniteId: string): string | undefined => resim(`sahne/${uniteId}`);
