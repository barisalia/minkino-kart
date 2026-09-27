/**
 * "Mino Banyo Yapmıyor!" görselleri.
 * Recraft çizimleri tasarımcı tarafından kesilip assets/banyo/<ad>.webp olarak konur; kod dosyayı kendiliğinden
 * kullanır. Dosya yoksa stil kuralına uygun (kalın koyu kahve kontur, parlak vurgu, yumuşak degrade) sade SVG
 * yer tutucu çizilir. Çamur, köpük, damla, buhar, buğu her zaman kodla çizilir (banyo-efekt.ts).
 *
 * Küvet iki parçadır: kuvet-arka (arka kenar + iç) ve kuvet-on (ön kenar + gövde + ayaklar). İkisi AYNI tuvalde
 * (kaynak kuvet.webp çerçevesi, 1216×896) kesilmelidir; üst üste konunca hizalanır.
 */
import { h } from '../../src/ui/dom';

const RESIMLER = import.meta.glob<string>('../../assets/banyo/*.webp', { eager: true, query: '?url', import: 'default' });

export type EsyaAdi =
  | 'arkaplan'
  | 'kuvet-arka'
  | 'kuvet-on'
  | 'musluk-kirmizi'
  | 'musluk-mavi'
  | 'agizlik'
  | 'tipa'
  | 'kopuk'
  | 'sampuan'
  | 'dus'
  | 'havlu-turuncu'
  | 'havlu-mavi'
  | 'tarak'
  | 'sepet'
  | 'ordek'
  | 'top'
  | 'ayna'
  | 'paspas';

/** 'kuvet-on' → adres (yoksa '') */
export const banyoAdres = (ad: EsyaAdi) => RESIMLER[`../../assets/banyo/${ad}.webp`] ?? '';
export const cizimVar = (ad: EsyaAdi) => !!banyoAdres(ad);

const K = '#3a1210'; // kontur (Mino'nun çizgisiyle aynı)

/** Parlak vurgu (beyaz, yarı saydam yuvarlak çizgi) */
const vurgu = (d: string, g = 10) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="${g}" stroke-linecap="round" opacity=".75"/>`;

/** Sade yer tutucular: viewBox, çizim */
const YER_TUTUCU: Partial<Record<EsyaAdi, [string, string]>> = {
  'kuvet-arka': [
    '0 0 1216 896',
    `<defs><linearGradient id="bnKA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9dde2"/><stop offset="1" stop-color="#f4f6f8"/></linearGradient></defs>
    <ellipse cx="608" cy="245" rx="566" ry="112" fill="#fbfcfd" stroke="${K}" stroke-width="9"/>
    <ellipse cx="608" cy="250" rx="500" ry="90" fill="url(#bnKA)" stroke="${K}" stroke-width="6"/>
    ${vurgu('M150 214 Q330 170 560 162', 12)}`,
  ],
  'kuvet-on': [
    '0 0 1216 896',
    `<defs><linearGradient id="bnKO" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#eef1f4"/><stop offset="1" stop-color="#d5dbe1"/></linearGradient>
    <linearGradient id="bnAy" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3c77a"/><stop offset="1" stop-color="#c98d3c"/></linearGradient></defs>
    <path d="M250 690 q-30 40 -70 58 q-30 16 -8 28 q60 10 110 -12 q30 -20 30 -60 z M966 690 q30 40 70 58 q30 16 8 28 q-60 10 -110 -12 q-30 -20 -30 -60 z" fill="url(#bnAy)" stroke="${K}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M108 250 A500 90 0 0 0 1108 250 L1174 245 C1160 520 1010 712 608 718 C206 712 56 520 42 245 Z" fill="url(#bnKO)" stroke="${K}" stroke-width="9" stroke-linejoin="round"/>
    <path d="M60 300 Q608 440 1156 300" fill="none" stroke="#c9d0d7" stroke-width="7" stroke-linecap="round"/>
    ${vurgu('M140 380 Q180 560 300 650', 16)}${vurgu('M1080 400 Q1060 500 1020 560', 12)}${vurgu('M430 356 Q608 380 800 356', 9)}`,
  ],
  'musluk-kirmizi': ['0 0 200 190', musluk('#e8453c', '#b72b25')],
  'musluk-mavi': ['0 0 200 190', musluk('#5b8fd1', '#36649f')],
  agizlik: [
    '0 0 260 170',
    `<defs><linearGradient id="bnAg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6d48f"/><stop offset="1" stop-color="#c98d3c"/></linearGradient></defs>
    <path d="M232 160 L232 70 Q232 22 180 22 L60 22 Q24 22 24 58 L24 80 L64 80 L64 64 Q64 60 70 60 L180 60 Q194 60 194 74 L194 160 Z" fill="url(#bnAg)" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>
    <ellipse cx="44" cy="82" rx="26" ry="9" fill="#8a5a22" stroke="${K}" stroke-width="6"/>
    ${vurgu('M80 34 L176 34', 7)}`,
  ],
  tipa: [
    '0 0 160 130',
    `<path d="M30 40 Q80 22 130 40 L118 100 Q80 118 42 100 Z" fill="#a8764a" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>
    <ellipse cx="80" cy="40" rx="50" ry="14" fill="#c4935f" stroke="${K}" stroke-width="6"/>
    <circle cx="80" cy="22" r="11" fill="#d9d2c5" stroke="${K}" stroke-width="6"/>${vurgu('M50 60 L56 90', 6)}`,
  ],
  kopuk: [
    '0 0 130 210',
    `<defs><linearGradient id="bnKp" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f7b8c4"/><stop offset="1" stop-color="#e58aa0"/></linearGradient></defs>
    <rect x="56" y="8" width="18" height="40" rx="7" fill="#f0a3b4" stroke="${K}" stroke-width="6"/>
    <rect x="38" y="42" width="54" height="26" rx="9" fill="#f0a3b4" stroke="${K}" stroke-width="6"/>
    <rect x="14" y="64" width="102" height="138" rx="40" fill="url(#bnKp)" stroke="${K}" stroke-width="7"/>
    ${vurgu('M34 96 L34 160', 9)}<circle cx="80" cy="130" r="14" fill="#fff" opacity=".7"/><circle cx="96" cy="108" r="7" fill="#fff" opacity=".7"/>`,
  ],
  sampuan: [
    '0 0 120 210',
    `<defs><linearGradient id="bnSm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9fd07a"/><stop offset="1" stop-color="#4fa55a"/></linearGradient></defs>
    <rect x="34" y="8" width="52" height="30" rx="8" fill="#6cbf6a" stroke="${K}" stroke-width="6"/>
    <rect x="14" y="34" width="92" height="168" rx="30" fill="url(#bnSm)" stroke="${K}" stroke-width="7"/>
    ${vurgu('M34 60 L34 150', 9)}`,
  ],
  dus: [
    '0 0 200 250',
    `<path d="M112 128 Q120 200 160 214 Q196 224 190 180" fill="none" stroke="${K}" stroke-width="20" stroke-linecap="round"/>
    <path d="M112 128 Q120 200 160 214 Q196 224 190 180" fill="none" stroke="#e9edf1" stroke-width="10" stroke-linecap="round"/>
    <path d="M92 70 L126 132" stroke="${K}" stroke-width="30" stroke-linecap="round"/><path d="M92 70 L126 132" stroke="#f2f4f6" stroke-width="18" stroke-linecap="round"/>
    <ellipse cx="66" cy="60" rx="54" ry="46" transform="rotate(-28 66 60)" fill="#f4f6f8" stroke="${K}" stroke-width="7"/>
    <ellipse cx="60" cy="58" rx="38" ry="31" transform="rotate(-28 60 58)" fill="#9aa6b2" stroke="${K}" stroke-width="4"/>
    <g fill="#4e5a66">${Array.from({ length: 9 }, (_, i) => `<circle cx="${46 + (i % 3) * 14}" cy="${44 + Math.floor(i / 3) * 14}" r="3.4"/>`).join('')}</g>`,
  ],
  'havlu-turuncu': ['0 0 240 140', havlu('#f39a45', '#d8702a')],
  'havlu-mavi': ['0 0 240 140', havlu('#6c9bd8', '#4572b0')],
  tarak: [
    '0 0 90 230',
    `<path d="M20 10 Q60 6 64 30 L64 150 Q66 190 50 222 Q30 226 30 200 Q34 160 20 140 Z" fill="#f7c948" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>
    <g stroke="${K}" stroke-width="5" stroke-linecap="round">${Array.from({ length: 10 }, (_, i) => `<path d="M64 ${20 + i * 12} L84 ${20 + i * 12}"/>`).join('')}</g>${vurgu('M34 30 L34 120', 7)}`,
  ],
  sepet: [
    '0 0 230 230',
    `<path d="M70 70 Q115 -6 160 70" fill="none" stroke="${K}" stroke-width="18"/><path d="M70 70 Q115 -6 160 70" fill="none" stroke="#c9955a" stroke-width="9"/>
    <path d="M18 76 L212 76 L190 214 Q115 228 40 214 Z" fill="#d6a468" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>
    <g stroke="#9c6a36" stroke-width="4">${Array.from({ length: 6 }, (_, i) => `<path d="M${24 + i * 2} ${100 + i * 20} L${206 - i * 2} ${100 + i * 20}"/>`).join('')}${Array.from({ length: 9 }, (_, i) => `<path d="M${40 + i * 19} 80 L${46 + i * 17} 214"/>`).join('')}</g>
    <rect x="12" y="66" width="206" height="22" rx="10" fill="#c9955a" stroke="${K}" stroke-width="7"/>`,
  ],
  ordek: [
    '0 0 230 200',
    `<path d="M40 120 Q40 186 120 188 Q206 188 214 116 Q200 132 176 126 Q170 92 140 92 Q162 64 150 38 Q132 8 96 12 Q60 18 58 56 Q58 78 74 94 Q44 96 40 120 Z" fill="#ffd23f" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M52 54 Q18 54 14 66 Q22 80 58 72 Z" fill="#ff8a3d" stroke="${K}" stroke-width="6" stroke-linejoin="round"/>
    <circle cx="98" cy="46" r="10" fill="${K}"/><circle cx="101" cy="42" r="3.5" fill="#fff"/>
    <path d="M100 136 Q130 170 170 138" fill="none" stroke="#e8a722" stroke-width="7" stroke-linecap="round"/>${vurgu('M82 24 Q70 30 70 44', 7)}`,
  ],
  top: [
    '0 0 120 120',
    `<circle cx="60" cy="60" r="52" fill="#fff" stroke="${K}" stroke-width="7"/>
    <path d="M14 44 Q60 30 106 60 M18 80 Q60 58 102 88" fill="none" stroke="#e8453c" stroke-width="16"/>
    <circle cx="60" cy="60" r="52" fill="none" stroke="${K}" stroke-width="7"/>${vurgu('M34 30 Q44 22 56 20', 7)}`,
  ],
  // finaldeki büyük ayna (yakın çekim): arka plandaki aynanın çerçevesiyle aynı renkler, iki kişi sığsın diye geniş
  ayna: [
    '0 0 300 380',
    `<defs><linearGradient id="bnAc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3d3a1"/><stop offset="1" stop-color="#c98d56"/></linearGradient></defs>
    <ellipse cx="150" cy="190" rx="142" ry="182" fill="url(#bnAc)" stroke="${K}" stroke-width="8"/>
    <ellipse cx="150" cy="190" rx="118" ry="156" fill="#e7f6ff" stroke="${K}" stroke-width="6"/>
    <path d="M40 120 Q60 60 110 34" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".7"/>`,
  ],
};

function musluk(renk: string, koyu: string) {
  return `<path d="M52 160 Q52 108 100 104 Q148 108 148 160 Z" fill="${renk}" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>
    <rect x="30" y="152" width="140" height="22" rx="11" fill="${koyu}" stroke="${K}" stroke-width="7"/>
    <rect x="86" y="58" width="28" height="52" rx="8" fill="${renk}" stroke="${K}" stroke-width="7"/>
    <path d="M22 46 Q60 36 100 50 Q140 36 178 46 Q186 62 178 70 Q140 64 100 72 Q60 64 22 70 Q14 60 22 46 Z" fill="${renk}" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>
    <circle cx="100" cy="56" r="18" fill="${renk}" stroke="${K}" stroke-width="7"/>${vurgu('M36 52 L70 50', 6)}${vurgu('M68 130 Q76 118 90 116', 7)}`;
}
function havlu(renk: string, koyu: string) {
  return `<path d="M24 40 Q120 18 214 40 Q230 60 214 78 Q120 60 24 80 Q10 60 24 40 Z" fill="${renk}" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M24 80 Q120 60 214 78 Q232 100 214 120 Q120 100 24 124 Q8 100 24 80 Z" fill="${koyu}" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>
    ${vurgu('M50 44 Q110 30 170 38', 7)}`;
}

/**
 * Eşyanın görseli: tasarımcı dosyası varsa <img>, yoksa yer tutucu SVG. Sınıflar: bn-esya, bn-<ad>, (yedek) bn-yedek.
 */
export function esya(ad: EsyaAdi, sinif = '', alt = '', cizimZorla = false): HTMLElement {
  const url = cizimZorla ? '' : banyoAdres(ad);
  const s = `.bn-esya.bn-g-${ad}${sinif ? '.' + sinif : ''}`;
  if (url) return h(`img${s}` as 'img', { src: url, alt, draggable: 'false' });
  const yt = YER_TUTUCU[ad];
  const el = h(`div${s}.bn-yedek` as 'div', { role: 'img', 'aria-label': alt });
  if (yt) el.innerHTML = `<svg viewBox="${yt[0]}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${yt[1]}</svg>`;
  return el;
}

// ---------------------------------------------------------------- yalnız kodla çizilenler
/** Fular (boyun atkısı üçgeni); Mino kırmızı, Kino mavi */
export function fularSvg(renk: 'kirmizi' | 'mavi'): string {
  const [a, b] = renk === 'kirmizi' ? ['#f03137', '#b81e24'] : ['#4d8fe0', '#2f64ad'];
  return `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M10 26 Q100 58 190 26 Q176 50 150 60 L108 138 Q100 150 92 138 L50 60 Q24 50 10 26 Z" fill="${a}" stroke="${K}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M60 64 L100 132 L140 64" fill="none" stroke="${b}" stroke-width="6" stroke-linecap="round"/>
    <circle cx="100" cy="52" r="14" fill="${b}" stroke="${K}" stroke-width="6"/>${vurgu('M40 44 Q70 56 96 58', 6)}</svg>`;
}

/** Askılık (duvardaki ahşap çubuk, iki topuzlu) — arka plandaki askılık ekranda görünmüyorsa çizilir */
export const ASKILIK_SVG = `<svg viewBox="0 0 300 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="8" y="14" width="284" height="44" rx="10" fill="#e4b27c" stroke="${K}" stroke-width="7"/>${vurgu('M26 26 L270 26', 6)}
  <g fill="#d99a5e" stroke="${K}" stroke-width="6"><circle cx="90" cy="46" r="20"/><circle cx="210" cy="46" r="20"/></g>
  <g fill="#fff" opacity=".7"><circle cx="84" cy="40" r="5"/><circle cx="204" cy="40" r="5"/></g></svg>`;

/** Raf (ördeğin yeri) */
export const RAF_SVG = `<svg viewBox="0 0 300 70" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M40 30 L70 30 L60 64 Z M230 30 L260 30 L240 64 Z" fill="#c98d56" stroke="${K}" stroke-width="6" stroke-linejoin="round"/>
  <rect x="6" y="8" width="288" height="26" rx="8" fill="#e4b27c" stroke="${K}" stroke-width="7"/>${vurgu('M24 18 L276 18', 5)}</svg>`;

/** Duş perdesi (Mino'nun saklandığı): çubuk + dalgalı kumaş */
export const PERDE_SVG = `<svg viewBox="0 0 220 520" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs><linearGradient id="bnPr" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#bfe6f0"/><stop offset=".5" stop-color="#e6f7fb"/><stop offset="1" stop-color="#a9d9e8"/></linearGradient></defs>
  <rect x="0" y="6" width="220" height="16" rx="8" fill="#c9d0d7" stroke="${K}" stroke-width="6"/>
  <path d="M18 22 Q40 34 62 22 Q84 34 106 22 Q128 34 150 22 Q172 34 196 22 L204 500 Q180 516 156 500 Q132 516 108 500 Q84 516 60 500 Q36 516 12 500 Z" fill="url(#bnPr)" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>
  <g fill="none" stroke="#8cc3d6" stroke-width="5" stroke-linecap="round"><path d="M62 40 L60 490"/><path d="M106 40 L108 490"/><path d="M150 40 L156 490"/></g>
  <g fill="#fff" opacity=".85"><circle cx="40" cy="120" r="12"/><circle cx="130" cy="210" r="16"/><circle cx="84" cy="330" r="11"/><circle cx="170" cy="400" r="13"/></g>
  <g fill="#ffd23f" stroke="${K}" stroke-width="3"><circle cx="40" cy="14" r="7"/><circle cx="84" cy="14" r="7"/><circle cx="128" cy="14" r="7"/><circle cx="172" cy="14" r="7"/></g></svg>`;

/** Parmak ipucu: işaret eden el */
export const EL_SVG = `<svg viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M44 14 Q44 2 56 2 Q68 2 68 14 L68 64 Q76 56 86 60 Q96 64 94 76 Q104 72 110 80 Q116 90 110 102 L104 122 Q96 146 70 146 L52 146 Q30 146 22 124 L10 92 Q6 80 16 76 Q28 72 34 84 L44 100 Z" fill="#fff4e3" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>
  <path d="M68 64 L68 88 M86 62 L88 90" fill="none" stroke="${K}" stroke-width="5" stroke-linecap="round"/>${vurgu('M52 12 L52 60', 5)}</svg>`;
