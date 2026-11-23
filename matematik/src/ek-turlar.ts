// Matematik · ek turların kapısı (tur-sirasi.ts → EK, EK_TURLAR, etkinSira). Bir yeni tur ancak Astra'nın bütün
// çizimleri ve Ceren'in bütün sözleri yerindeyse açılır; açık değilse sırada hiç görünmez (eski tur onun yerine oynamaz).
// Test kipinde (?test=1) yeni turlar ?yeniturlar=1 ile, Tahterevalli ?tahterevalli=1 ile açılır.
// DOM'a dokunmaz: kayit.ts ve veli-ozet.ts de kullanır (sayfa açılırken, birim testlerinde).
import { GEREKLI_CIZIMLER as TV_CIZIM, GEREKLI_SESLER as TV_SES } from './tahterevalli-mantik';
import { EK, ekAdi, type Kose, type Yol } from './tur-sirasi';
import { YENI_CIZIMLER, YENI_KLASOR, YENI_SOZ, type YeniTur } from './yeni-turlar';

const cizimler = import.meta.glob<string>([
  '../../assets/matematik/iki-kase/*.webp', '../../assets/matematik/sakli-findik/*.webp', '../../assets/matematik/takim-cantasi/*.webp',
  '../../assets/matematik/elma-sandik/*.webp', '../../assets/matematik/kurabiye/*.webp', '../../assets/matematik/sayi-treni/*.webp',
  '../../assets/matematik/balonlar/*.webp', '../../assets/matematik/kek-firini/*.webp', '../../assets/matematik/asansor/*.webp',
  '../../assets/matematik/yeni-sekiller/*.webp', '../../assets/matematik/resim-yap/*.webp', '../../assets/matematik/buyuyen-fener/*.webp',
  '../../assets/matematik/senlik-bayraklari/*.webp', '../../assets/matematik/kino-calgi/*.webp',
  '../../assets/matematik/surahi/*.webp', '../../assets/matematik/butun-yarim/*.webp', '../../assets/matematik/kino-gunu/*.webp',
  '../../assets/matematik/tahterevalli/*.webp', '../../assets/matematik/ritmik-ziplama/*.webp', '../../assets/matematik/esit-paylasim/*.webp',
  '../../assets/matematik/roket-geri-sayim/*.webp', '../../assets/matematik/kelebek-kanadi/*.webp', '../../assets/matematik/meyve-grafigi/*.webp',
  '../../assets/matematik/saklambac/*.webp', '../../assets/matematik/kaydirak-sirasi/*.webp', '../../assets/matematik/aile-sofrasi/*.webp', '../../assets/matematik/es-kartlar/*.webp', '../../assets/matematik/sekil-kutusu/*.webp',
  '../../assets/matematik/ders/onluk/rakam-0.webp',
], { eager: true, import: 'default', query: '?url' });
const sesler = import.meta.glob<string>(['../../assets/matematik/ses/*.mp3', '../../assets/matematik/tahterevalli/ses/*.mp3'], { eager: true, import: 'default', query: '?url' });

const arama = typeof location === 'undefined' ? new URLSearchParams() : new URLSearchParams(location.search);
const TEST = arama.has('test');

const hazirMi = (yt: YeniTur) =>
  YENI_CIZIMLER[yt].every((ad) => !!cizimler['../../assets/matematik/' + YENI_KLASOR[yt] + '/' + ad + '.webp']) &&
  (Object.values(YENI_SOZ[yt]) as number[]).every((i) => !!sesler['../../assets/matematik/ses/ses-' + i + '.mp3']) &&
  // Ritimde 20, 30… iki basamaklı yazılır: 0 rakam bloğu (Astra M6) şart.
  (!['ritim', 'roket'].includes(yt) || !!cizimler['../../assets/matematik/ders/onluk/rakam-0.webp']);
const tahterevalliHazir = () =>
  TV_CIZIM.every((ad) => !!cizimler['../../assets/matematik/tahterevalli/' + ad + '.webp']) &&
  TV_SES.every((id) => !!sesler['../../assets/matematik/tahterevalli/ses/' + id + '.mp3']);

const onbellek = new Map<string, boolean>();
/** Yeni tur açık mı (çizimleri ve sözleri tamam; test kipinde ?yeniturlar=1). */
export function turAcik(yt: YeniTur): boolean {
  if (!onbellek.has(yt)) onbellek.set(yt, TEST ? arama.has('yeniturlar') : hazirMi(yt));
  return onbellek.get(yt)!;
}
/** Ek tur kodu sırada görünür mü (tur-sirasi.ts → etkinSira). Eski turlar (kod < 100) her zaman açıktır. */
export function ekAcik(n: number): boolean {
  if (n < 100) return true;
  if (n === EK.tahterevalli) {
    if (!onbellek.has('tahterevalli')) onbellek.set('tahterevalli', TEST ? arama.has('tahterevalli') : tahterevalliHazir());
    return onbellek.get('tahterevalli')!;
  }
  const ad = ekAdi(n);
  return !!ad && turAcik(ad as YeniTur);
}
/** Ek tur kodunun yeni tur adı (Tahterevalli ayrı modülde: undefined). */
export const ekYeniTur = (n: number): YeniTur | undefined => {
  const ad = ekAdi(n);
  return ad && ad !== 'tahterevalli' ? (ad as YeniTur) : undefined;
};
export type { Kose, Yol };
