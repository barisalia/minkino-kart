// "Oku ve bul" (Ceren'le oku'nun ısınması, 21 Kasım): DOM'suz kurallar. Çocuk tek bir sözcüğü kendi okur (ses yok),
// resimlerden doğrusunu seçer. Yalnız çocuğun bitirdiği harflerle yazılan sözcükler gelir (cümlelerdeki kural).
// 4 yaş: iki heceli sözcük, iki resim. 5+: iki ya da üç heceli, üç resim. Oturumda 5 sözcük; bir önceki oturumun
// sözcükleri gelmez; en az görülen önce. Çeldiriciler aynı harfle başlayan ya da benzer uzunlukta sözcükler.
import { bilinenHarfler, harfleri, type CumleYasi } from './cumle-okuma-kurallari';

export interface OkuBulSozcuk { id: string; ad: string; heceler: string[] }
export interface OkuBulTuru { hedef: string; secenekler: string[] }
export interface OkuBulGecmis { gorulme: Record<string, number>; son: string[] }

export const OTURUM = 5;
const kucuk = (s: string) => s.normalize('NFC').toLocaleLowerCase('tr');
/** Yeni içerikte olmayacaklar: çilek (kural, 15 Kasım) ve iki sözcüklü adlar (tek taş, tek sözcük). */
const uygunAd = (s: OkuBulSozcuk) => !/çilek/i.test(s.ad) && !/\s/.test(s.ad.trim());

/** Çocuğun okuyabileceği hedef sözcükler: bütün harfleri bitmiş, yaşa uygun hece sayısı. */
export function okunabilirSozcukler(liste: readonly OkuBulSozcuk[], bitenHarfler: string[], yas: CumleYasi): OkuBulSozcuk[] {
  if (yas === '2-3') return [];
  const bilinen = bilinenHarfler(bitenHarfler);
  const enCok = yas === '4' ? 2 : 3;
  return liste.filter((s) => uygunAd(s) && s.heceler.length >= 2 && s.heceler.length <= enCok && harfleri(s.ad).every((h) => bilinen.has(h)));
}

type Rnd = () => number;
const karistir = <T>(l: readonly T[], rnd: Rnd): T[] => { const a = [...l]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/** Çeldiriciler: önce hedefle aynı harfle başlayanlar, sonra uzunluğu en yakın olanlar (tahminle bulunmasın). */
export function celdiriciler(hedef: OkuBulSozcuk, liste: readonly OkuBulSozcuk[], adet: number, rnd: Rnd): OkuBulSozcuk[] {
  const bas = kucuk(hedef.ad)[0], boy = hedef.ad.length;
  const aday = liste.filter((s) => s.id !== hedef.id && uygunAd(s) && kucuk(s.ad) !== kucuk(hedef.ad));
  const puan = (s: OkuBulSozcuk) => (kucuk(s.ad)[0] === bas ? 0 : 10) + Math.abs(s.ad.length - boy);
  return karistir(aday, rnd).sort((a, b) => puan(a) - puan(b)).slice(0, adet);
}

/** Bir oturum: en az görülen önce, bir önceki oturumda gelenler hariç (yetmezse onlarla tamamlanır). */
export function okuBulOturumu(liste: readonly OkuBulSozcuk[], bitenHarfler: string[], yas: CumleYasi, gecmis: OkuBulGecmis, rnd: Rnd = Math.random): OkuBulTuru[] {
  const okunur = okunabilirSozcukler(liste, bitenHarfler, yas);
  const say = (s: OkuBulSozcuk) => gecmis.gorulme[s.id] ?? 0;
  const sirala = (l: OkuBulSozcuk[]) => karistir(l, rnd).sort((a, b) => say(a) - say(b));
  const secilen = [...sirala(okunur.filter((s) => !gecmis.son.includes(s.id))), ...sirala(okunur.filter((s) => gecmis.son.includes(s.id)))].slice(0, OTURUM);
  const resimSayisi = yas === '4' ? 2 : 3;
  return secilen.map((h) => ({ hedef: h.id, secenekler: karistir([h, ...celdiriciler(h, liste, resimSayisi - 1, rnd)], rnd).map((s) => s.id) }));
}

/** Oturum bitince geçmiş: görülme sayıları artar, "son" bu oturumun sözcükleri olur. */
export function gecmisiYaz(gecmis: OkuBulGecmis, turlar: readonly OkuBulTuru[]): OkuBulGecmis {
  const gorulme = { ...gecmis.gorulme };
  for (const t of turlar) gorulme[t.hedef] = (gorulme[t.hedef] ?? 0) + 1;
  return { gorulme, son: turlar.map((t) => t.hedef) };
}
