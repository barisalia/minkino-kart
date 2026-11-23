// Paket Harf-H14 (22 Kasım 2026): dersin en zayıf iki adımının yeni görünüşü. Astra'nın çizimleri gelene kadar oyun eski
// akışla oynar; çizimlerin HEPSİ gelince kendiliğinden açılır. Test kipinde ?h14=1 yer tutucularla açar (yalnız deneme;
// yer tutucu gerçek uygulamada hiç görünmez), ?h14=0 kapatır. Brief: CLAUDE-ASTRA-MESAJLAR.md → Paket Harf-H14.
//
//  · "Dinle ve söyle" → Ses Kutusu: konusma-dersi.ts. Çocuk söyledikçe kutunun kapağı aralanır ve sözcüğün resmi
//    kutudan yükselir; doğru söyleyince kapak fırlar, resim kutudan çıkar, Ceren alkışlar. Mikrofon yoksa çocuk kutuya
//    dokunur, her dokunuşta Ceren'le birlikte söyler (üç dokunuş). Yazı düğmesi ("Dokunarak devam et") kalkar.
//  · "Mıknatıslar" → Mıknatıslı Olta: miknatis.ts. Parçalar gölette yüzen balıkların üstünde; doğru balığa dokununca
//    mıknatıslı olta iner, balığı tutar, parça iskeledeki yerine uçar. Sözcük kurulunca resmi suyu sıçratarak çıkar.
import { TEST_MODU } from '../../src/ui/dom';

const cizimler = import.meta.glob<string>('../../assets/alfabe/{ses-kutusu,olta,ses-balonu,harf-yuzu}/*.webp', { eager: true, query: '?url', import: 'default' });

export const SES_KUTUSU_CIZIMLERI = ['kutu-arka', 'kutu-on', 'kutu-kapak', 'ceren-dinliyor', 'ceren-alkis'] as const;
export const OLTA_CIZIMLERI = ['gol', 'olta', 'balik-0', 'balik-1', 'balik-2', 'sicrama-0', 'sicrama-1'] as const;
// Paket Harf-H15 (22 Kasım): Keşfet → Ses Balonları (4 ve 5+, ses-balonlari.ts); 2–3 yaş boyama → Harf uyanır (harf-boyama.ts).
export const SES_BALONU_CIZIMLERI = ['gokyuzu', 'balon-0', 'balon-1', 'balon-2', 'patlama-0', 'patlama-1'] as const;
export const HARF_YUZU_CIZIMLERI = ['goz-acik', 'goz-kirpik', 'agiz-gulen', 'agiz-acik'] as const;
export type SesBalonuCizimi = typeof SES_BALONU_CIZIMLERI[number];
export type HarfYuzuCizimi = typeof HARF_YUZU_CIZIMLERI[number];
export type SesKutusuCizimi = typeof SES_KUTUSU_CIZIMLERI[number];
export type OltaCizimi = typeof OLTA_CIZIMLERI[number];

/** Test kipindeki istek: '1' aç, '0' kapat, null çizimlere bak */
function istek(): string | null {
  if (!TEST_MODU || typeof location === 'undefined') return null;
  return new URLSearchParams(location.search).get('h14');
}

/** H15 için test isteği: ?h15=1 / ?h15=0 */
function istek15(): string | null {
  if (!TEST_MODU || typeof location === 'undefined') return null;
  return new URLSearchParams(location.search).get('h15');
}

/** Saf karar (birim testi): çizimlerin hepsi varsa açık; test kipinde ?h14 isteği öne geçer. */
export function h14Acik(o: { eksik: number; testModu: boolean; istek: string | null }): boolean {
  if (o.testModu && o.istek !== null) return o.istek === '1';
  return o.eksik === 0;
}

const yol = (klasor: string, ad: string) => `../../assets/alfabe/${klasor}/${ad}.webp`;
/**
 * %100 boyda denetimden geçmeyen, Astra'dan yeniden istenen çizimler (22 Kasım 23:30 denetimi; CLAUDE-ASTRA-MESAJLAR.md →
 * "Harf-H14/H15 düzeltme"). Dosya diskte olsa da eksik sayılır: o adım eski görünüşüyle oynar. Yenisi gelip denetimden
 * geçince adı buradan silinir.
 *  · olta/gol: neredeyse boş, düz doygun mavi alan (bizim sıcak pastel, dolu ekran çizgimiz değil).
 *  · olta/sicrama-1: sicrama-0'la aynı su değil (biri açık pastel, öbürü koyu doygun mavi).
 *  · ses-balonu/gokyuzu: boş mavi alan, köşede iki bulut. balon-0…2: düz, doygun kırmızı/sarı, gölgesiz (pastel değil).
 */
export const DUZELTME_BEKLIYOR: ReadonlySet<string> = new Set([
  'olta/gol', 'olta/sicrama-1',
  'ses-balonu/gokyuzu', 'ses-balonu/balon-0', 'ses-balonu/balon-1', 'ses-balonu/balon-2',
]);
const eksikSay = (klasor: string, adlar: readonly string[]) =>
  adlar.filter((ad) => !cizimler[yol(klasor, ad)] || DUZELTME_BEKLIYOR.has(klasor + '/' + ad)).length;

export const sesKutusuAcik = () => h14Acik({ eksik: eksikSay('ses-kutusu', SES_KUTUSU_CIZIMLERI), testModu: TEST_MODU, istek: istek() });
export const sesBalonuAcik = () => h14Acik({ eksik: eksikSay('ses-balonu', SES_BALONU_CIZIMLERI), testModu: TEST_MODU, istek: istek15() });
export const harfYuzuAcik = () => h14Acik({ eksik: eksikSay('harf-yuzu', HARF_YUZU_CIZIMLERI), testModu: TEST_MODU, istek: istek15() });
export const oltaAcik = () => h14Acik({ eksik: eksikSay('olta', OLTA_CIZIMLERI), testModu: TEST_MODU, istek: istek() });

// Yer tutucular: yalnız test kipinde, çizim gelmeden düzeni ve hareketi denemek için (düz renkli basit şekiller).
const svg = (icerik: string, w = 600, h = 600) => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${icerik}</svg>`);
const YER_TUTUCU: Record<string, string> = {
  'kutu-arka': svg('<rect x="90" y="250" width="420" height="300" rx="18" fill="#b0577a" stroke="#30233f" stroke-width="8"/>'),
  'kutu-on': svg('<rect x="90" y="330" width="420" height="230" rx="18" fill="#ff8ab0" stroke="#30233f" stroke-width="8"/><rect x="270" y="330" width="60" height="230" fill="#ffd257" stroke="#30233f" stroke-width="6"/>'),
  'kutu-kapak': svg('<rect x="70" y="190" width="460" height="90" rx="16" fill="#ff6f9e" stroke="#30233f" stroke-width="8"/><rect x="270" y="190" width="60" height="90" fill="#ffd257" stroke="#30233f" stroke-width="6"/>'),
  'ceren-dinliyor': svg('<circle cx="313" cy="330" r="230" fill="#f2c79a" stroke="#30233f" stroke-width="8"/><text x="313" y="350" font-size="60" text-anchor="middle">dinliyor</text>', 627, 627),
  'ceren-alkis': svg('<circle cx="313" cy="330" r="230" fill="#ffd49a" stroke="#30233f" stroke-width="8"/><text x="313" y="350" font-size="60" text-anchor="middle">alkış</text>', 627, 627),
  gol: svg('<rect width="1600" height="700" fill="#bfe8f5"/><ellipse cx="800" cy="470" rx="760" ry="230" fill="#4fb2de" stroke="#30233f" stroke-width="8"/>', 1600, 700),
  olta: svg('<rect x="220" y="0" width="14" height="560" fill="#30233f"/><rect x="170" y="560" width="114" height="70" rx="14" fill="#e2463f" stroke="#30233f" stroke-width="8"/>', 400, 700),
  'balik-0': svg('<ellipse cx="270" cy="200" rx="210" ry="120" fill="#ffb84d" stroke="#30233f" stroke-width="8"/><path d="M470 200 L570 110 L570 290 Z" fill="#ffb84d" stroke="#30233f" stroke-width="8"/>', 600, 400),
  'balik-1': svg('<ellipse cx="270" cy="200" rx="210" ry="120" fill="#7fd1b9" stroke="#30233f" stroke-width="8"/><path d="M470 200 L570 110 L570 290 Z" fill="#7fd1b9" stroke="#30233f" stroke-width="8"/>', 600, 400),
  'balik-2': svg('<ellipse cx="270" cy="200" rx="210" ry="120" fill="#c3a6f0" stroke="#30233f" stroke-width="8"/><path d="M470 200 L570 110 L570 290 Z" fill="#c3a6f0" stroke="#30233f" stroke-width="8"/>', 600, 400),
  'sicrama-0': svg('<ellipse cx="300" cy="420" rx="200" ry="50" fill="#9fdcf3" stroke="#30233f" stroke-width="6"/>', 600, 500),
  gokyuzu: svg('<rect width="1600" height="900" fill="#bfe6fb"/><ellipse cx="300" cy="200" rx="160" ry="60" fill="#fff"/><ellipse cx="1250" cy="150" rx="190" ry="70" fill="#fff"/><rect y="800" width="1600" height="100" fill="#9ed88a"/>', 1600, 900),
  'balon-0': svg('<ellipse cx="300" cy="260" rx="200" ry="230" fill="#ff7a8a" stroke="#30233f" stroke-width="8"/><path d="M300 490 L300 640" stroke="#30233f" stroke-width="5"/><path d="M170 700 L430 700 L400 860 L200 860 Z" fill="#d9a066" stroke="#30233f" stroke-width="8"/>', 600, 900),
  'balon-1': svg('<ellipse cx="300" cy="260" rx="200" ry="230" fill="#7fc8ff" stroke="#30233f" stroke-width="8"/><path d="M300 490 L300 640" stroke="#30233f" stroke-width="5"/><path d="M170 700 L430 700 L400 860 L200 860 Z" fill="#d9a066" stroke="#30233f" stroke-width="8"/>', 600, 900),
  'balon-2': svg('<ellipse cx="300" cy="260" rx="200" ry="230" fill="#ffd257" stroke="#30233f" stroke-width="8"/><path d="M300 490 L300 640" stroke="#30233f" stroke-width="5"/><path d="M170 700 L430 700 L400 860 L200 860 Z" fill="#d9a066" stroke="#30233f" stroke-width="8"/>', 600, 900),
  'patlama-0': svg('<circle cx="300" cy="300" r="120" fill="#fff2a8" stroke="#30233f" stroke-width="6"/>'),
  'patlama-1': svg('<path d="M300 60 L350 250 L540 300 L350 350 L300 540 L250 350 L60 300 L250 250 Z" fill="#ffd257" stroke="#30233f" stroke-width="6"/>'),
  'goz-acik': svg('<ellipse cx="190" cy="200" rx="60" ry="80" fill="#fff" stroke="#30233f" stroke-width="10"/><circle cx="200" cy="215" r="30" fill="#30233f"/><ellipse cx="410" cy="200" rx="60" ry="80" fill="#fff" stroke="#30233f" stroke-width="10"/><circle cx="420" cy="215" r="30" fill="#30233f"/>', 600, 400),
  'goz-kirpik': svg('<path d="M130 220 Q190 270 250 220 M350 220 Q410 270 470 220" fill="none" stroke="#30233f" stroke-width="12" stroke-linecap="round"/>', 600, 400),
  'agiz-gulen': svg('<path d="M120 120 Q200 220 280 120" fill="none" stroke="#30233f" stroke-width="14" stroke-linecap="round"/>', 400, 300),
  'agiz-acik': svg('<ellipse cx="200" cy="150" rx="70" ry="80" fill="#c8475a" stroke="#30233f" stroke-width="12"/>', 400, 300),
  'sicrama-1': svg('<path d="M120 440 Q300 120 480 440 Z" fill="#9fdcf3" stroke="#30233f" stroke-width="6"/>', 600, 500),
};

function cizim(klasor: string, ad: string): string {
  return cizimler[yol(klasor, ad)] ?? (TEST_MODU ? YER_TUTUCU[ad] : '') ?? '';
}
export const sesKutusuCizimi = (ad: SesKutusuCizimi) => cizim('ses-kutusu', ad);
export const oltaCizimi = (ad: OltaCizimi) => cizim('olta', ad);
export const sesBalonuCizimi = (ad: SesBalonuCizimi) => cizim('ses-balonu', ad);
export const harfYuzuCizimi = (ad: HarfYuzuCizimi) => cizim('harf-yuzu', ad);
