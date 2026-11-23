// "Mino'nun Harf Kurabiyesi"nin saf kuralları (tests/unit/alfabe-kurabiye.test.ts sınar).
// Görsel harf ayrımı: birbirine benzeyen çiftler (O/Ö, U/Ü, C/Ç, S/Ş, I/İ, G/Ğ, B/D). Yalnız çocuğun iki harfini de
// bitirdiği çiftler oynanır. Tepside 3 aranan ve 2 (2–3 yaş) ya da 3 (4 yaş) eş harf. Yanlışta harfin farkı parlar:
// eş harfte olmayan çizgiler (nokta, çengel, yay); B/D'de karın(lar). Eksik işaret (O'da Ö'nün noktaları) kesik çizgiyle görünür.
import dersler from './harfler.json';
import { kalemYollari } from './yollar';

export const CIFTLER: readonly (readonly [string, string])[] = [['O', 'Ö'], ['U', 'Ü'], ['C', 'Ç'], ['S', 'Ş'], ['I', 'İ'], ['G', 'Ğ'], ['B', 'D']];
export const HEDEF_SAYISI = 3;
const BELIRTEC: Record<string, string> = { 'ç': 'cc', 'ş': 'ss', 'ı': 'ii', 'ö': 'oo', 'ü': 'uu', 'ğ': 'gg' };
const belirtec = (harf: string) => { const k = harf.toLocaleLowerCase('tr'); return BELIRTEC[k] ?? k; };
export const kucuk = (harf: string) => harf.toLocaleLowerCase('tr');

/** İki harfi de bilinen çiftler. bilinen: çocuğun bitirdiği küçük harfler. */
export const uygunCiftler = (bilinen: ReadonlySet<string>) => CIFTLER.filter(([a, b]) => bilinen.has(kucuk(a)) && bilinen.has(kucuk(b)));

/** n. tepsi: çiftler sırayla döner, her turda aranan harf çiftin öbür harfine geçer. */
export function siradakiTepsi(ciftler: readonly (readonly [string, string])[], n: number): { hedef: string; es: string } | undefined {
  if (!ciftler.length) return;
  const [a, b] = ciftler[n % ciftler.length];
  return Math.floor(n / ciftler.length) % 2 ? { hedef: b, es: a } : { hedef: a, es: b };
}

/** Tepsideki kurabiyeler: 3 aranan, yaşa göre 2 ya da 3 eş harf; karışık, aynı harf yan yana az gelsin diye sırayla dağıtılmış. */
export function tepsiHarfleri(hedef: string, es: string, yas: '2-3' | '4', rastgele = Math.random): string[] {
  const liste = [...Array(HEDEF_SAYISI).fill(hedef), ...Array(yas === '4' ? 3 : 2).fill(es)];
  for (let i = liste.length - 1; i > 0; i--) { const j = Math.floor(rastgele() * (i + 1)); [liste[i], liste[j]] = [liste[j], liste[i]]; }
  return liste;
}

export const isteSesi = (hedef: string) => 'kurabiye-iste-' + belirtec(hedef);
export const farkSesi = (hedef: string, yanlis: string) => 'kurabiye-fark-' + belirtec(hedef) + '-' + belirtec(yanlis);
/** Harfin kendi sesi: dersin model kaydı (ünlüde "Ööö", ünsüzde çapa sözcük "Ceviz"; ünsüz tek başına okunmaz). */
export function harfSesi(harf: string): string {
  const d = (dersler as { id: string; upper: string }[]).find(x => x.upper === harf);
  return d ? d.id + '-model' : '';
}

/** Kurabiyenin üstündeki harf çizgileri; fark: eş harfte olmayan çizgilerin sırası; hayalet: eşte olup bunda olmayan işaretler. */
export function harfCizgileri(harf: string, es: string): { cizgiler: string[]; fark: number[]; hayalet: string[] } {
  const bu = kalemYollari(harf) ?? [], o = kalemYollari(es) ?? [];
  const bd = new Set([harf, es]).size === 2 && [harf, es].every(h => h === 'B' || h === 'D');
  const fark = bd ? bu.map((_, i) => i).filter(i => i > 0) : bu.map((y, i) => (o.includes(y) ? -1 : i)).filter(i => i >= 0);
  const hayalet = bd ? [] : o.filter(y => !bu.includes(y));
  return { cizgiler: bu, fark, hayalet };
}
