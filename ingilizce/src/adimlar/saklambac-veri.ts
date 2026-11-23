/**
 * Hide & Seek with Mino · DOM'suz veri ve kurallar: yerler (oda fonunun yüzdesi), plan, Polly'nin ve Ceren'in sözleri.
 * Oyun adımı adimlar/saklambac.ts; ses betiği (scripts/ingilizce-ses.ts --id) ve testler bu dosyayı okur.
 */
import type { SesMetni } from '../icerik';
import type { Adim, Yas } from '../plan';

export type Edat = 'in' | 'on' | 'under' | 'next to';
export type YerId = 'kutu-ic' | 'masa-ust' | 'masa-alt' | 'yatak-ust' | 'sandalye-ust' | 'sandalye-yan';
export type Nesne = 'ball' | 'teddy-bear';
export interface SaklambacTuru { tur: 'bul' | 'koy'; yer: YerId; nesne?: Nesne }

interface Yer {
  edat: Edat;
  esya: 'box' | 'table' | 'bed' | 'chair';
  /** dokunma bölgesi, oda fonunun yüzdesi: sol, üst, sağ, alt */
  bolge: [number, number, number, number];
  /** konan oyuncağın ve bulunan Mino'nun ayak noktası (yüzde) */
  dayanak: [number, number];
  /** Mino burada saklanabiliyorsa onun pozu (oda fonuyla aynı tuval) */
  mino?: string;
}
/** Oda fonu 1600 × 900; eşyalar Paket 23'teki piksel yerlerinde (CIZIM-ISLERI.md). Yer çizgisi y 810 = %90.
 *  Bölgeler Astra'nın teslim ettiği odada ölçüldü (20 Kasım): sandalye oturağı y≈525, kutunun ağzı y≈555, şilte y≈560. */
export const YERLER: Record<YerId, Yer> = {
  'kutu-ic': { edat: 'in', esya: 'box', bolge: [58, 56, 70, 84], dayanak: [64, 72], mino: 'mino-kutuda' },
  'masa-ust': { edat: 'on', esya: 'table', bolge: [30, 30, 54, 52], dayanak: [42, 52.2] },
  'masa-alt': { edat: 'under', esya: 'table', bolge: [33, 57, 51, 90], dayanak: [42, 90], mino: 'mino-masa-altinda' },
  'yatak-ust': { edat: 'on', esya: 'bed', bolge: [74, 40, 99, 64], dayanak: [86, 62.2], mino: 'mino-yatakta' },
  'sandalye-ust': { edat: 'on', esya: 'chair', bolge: [4, 44, 16, 66], dayanak: [10, 58.4] },
  'sandalye-yan': { edat: 'next to', esya: 'chair', bolge: [17, 55, 28, 90], dayanak: [22.5, 90], mino: 'mino-sandalye-yaninda' },
};
const EDATLAR: Record<Yas, Edat[]> = { '2-3': ['in', 'on'], '4': ['in', 'on', 'under'], '5+': ['in', 'on', 'under', 'next to'] };
const ESYA_ADI: Record<Yer['esya'], string> = { box: 'the box', table: 'the table', bed: 'the bed', chair: 'the chair' };
const NESNE_ADI: Record<Nesne, string> = { ball: 'the ball', 'teddy-bear': 'the teddy bear' };
export const NESNE_CIZIMI: Record<Nesne, string> = { ball: 'top', 'teddy-bear': 'ayi' };
export const yerSozu = (id: YerId) => `${YERLER[id].edat} ${ESYA_ADI[YERLER[id].esya]}`;
export const edatKimligi = (e: Edat) => e.replace(' ', '-');

// ---------------------------------------------------------------- plan

type Rnd = () => number;
const karistir = <T>(l: readonly T[], rnd: Rnd): T[] => { const a = [...l]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/** Dört tur: bul, koy, bul, koy. Aynı yer iki kez gelmez; yaşın en yeni sözü (4: under, 5+: next to) en az bir kez. */
export function saklambacPlani(yas: Yas, rnd: Rnd = Math.random): Extract<Adim, { tip: 'saklambac' }> {
  const edatlar = EDATLAR[yas], yeni = edatlar[edatlar.length - 1];
  const izinli = (Object.keys(YERLER) as YerId[]).filter((id) => edatlar.includes(YERLER[id].edat));
  for (let deneme = 0; deneme < 200; deneme++) {
    const bul = karistir(izinli.filter((id) => YERLER[id].mino), rnd).slice(0, 2);
    const koy = karistir(izinli.filter((id) => !bul.includes(id)), rnd).slice(0, 2);
    if (bul.length < 2 || koy.length < 2) continue;
    if (yas !== '2-3' && ![...bul, ...koy].some((id) => YERLER[id].edat === yeni)) continue;
    const ilkNesne: Nesne = rnd() < 0.5 ? 'ball' : 'teddy-bear';
    const ikinci: Nesne = ilkNesne === 'ball' ? 'teddy-bear' : 'ball';
    return { tip: 'saklambac', turlar: [{ tur: 'bul', yer: bul[0] }, { tur: 'koy', yer: koy[0], nesne: ilkNesne }, { tur: 'bul', yer: bul[1] }, { tur: 'koy', yer: koy[1], nesne: ikinci }] };
  }
  throw new Error('saklambaç planı kurulamadı: ' + yas);
}

// ---------------------------------------------------------------- sesler

const hece = (s: string) => (s.toLocaleLowerCase('tr').match(/[aeıioöuüy]+/g) ?? []).length || 1;
const polly = (id: string, metin: string): SesMetni => ({ id: `en/g-${id}`, kim: 'polly', dil: 'en', metin, hece: hece(metin) });
const buyukBas = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** Polly'nin ve Ceren'in bu oyundaki bütün sözleri (her biri ayrı ElevenLabs isteği; scripts/ingilizce-ses.ts --id). */
export function saklambacSesMetinleri(): SesMetni[] {
  const yerler = Object.keys(YERLER) as YerId[];
  return [
    { id: 'tr/c-saklambac-giris', kim: 'ceren', dil: 'tr', metin: 'Mino saklandı! Polly soruyor, sen bul. Sonra oyuncağı Polly’nin dediği yere koy.', hece: 30 },
    polly('hide-and-seek', 'Let’s play hide and seek!'),
    polly('where-is-mino', 'Where is Mino?'),
    polly('not-there', 'Hmm, not there!'),
    ...yerler.filter((id) => YERLER[id].mino).map((id) => polly(`mino-${id}`, `Mino is ${yerSozu(id)}!`)),
    ...yerler.flatMap((id) => (['ball', 'teddy-bear'] as Nesne[]).flatMap((n) => [
      polly(`put-${n}-${id}`, `Put ${NESNE_ADI[n]} ${yerSozu(id)}!`),
      polly(`is-${n}-${id}`, `${buyukBas(NESNE_ADI[n])} is ${yerSozu(id)}!`),
    ])),
    ...(['in', 'on', 'under', 'next to'] as Edat[]).map((e): SesMetni => ({ id: `en/w-${edatKimligi(e)}`, kim: 'polly', dil: 'en', metin: buyukBas(e) + '.', hece: hece(e) })),
  ];
}
/** Bir planın çalacağı kayıtlar (ders ekranı önceden yükler; hazır denetimi) */
export function saklambacSesleri(a: Extract<Adim, { tip: 'saklambac' }>): string[] {
  const idler = new Set(['tr/c-saklambac-giris', 'en/g-hide-and-seek', 'en/g-where-is-mino', 'en/g-not-there', 'en/g-yes', 'en/g-now-you']);
  for (const t of a.turlar) {
    idler.add(`en/w-${edatKimligi(YERLER[t.yer].edat)}`);
    if (t.tur === 'bul') idler.add(`en/g-mino-${t.yer}`);
    else { idler.add(`en/g-put-${t.nesne}-${t.yer}`); idler.add(`en/g-is-${t.nesne}-${t.yer}`); }
  }
  return [...idler];
}
