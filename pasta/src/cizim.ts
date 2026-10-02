/**
 * Mino'nun Pasta Otobüsü: kodla çizilen bütün çizimler (SVG metni). Stil: kalın kahve kontur #3A1210, parlak düz
 * renk, yumuşak gölge, beyaz parlama; iştah açıcı (Gemini'den görsel gelirse yalnız bu dosya değişir).
 *
 * Kurabiye ve kapkek çizimleri tek kaynaktan: tepsi, fırın, tabak ve sipariş balonu aynı çizimi kullanır.
 * Hamurun rengi CSS değişkeninden (--hamur): fırında pişerken kod yalnız bu rengi değiştirir.
 */
import { RENK_KODU, type Renk, type Sekil, type Sus, type Urun } from './model';

export const K = '#3A1210';

// ---------------------------------------------------------------- şekiller (100×100)
function yildizYolu(cx: number, cy: number, R: number, r: number): string {
  const n: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r : R;
    n.push(`${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`);
  }
  return `M${n.join('L')}Z`;
}
export const SEKIL_YOLU: Record<Sekil, string> = {
  yuvarlak: 'M50 12a38 38 0 1 1 0 76a38 38 0 1 1 0-76z',
  yildiz: yildizYolu(50, 53, 44, 22),
  kalp: 'M50 87C26 71 9 56 9 37C9 22 20 13 32 13C40 13 46 17 50 24C54 17 60 13 68 13C80 13 91 22 91 37C91 56 74 71 50 87Z',
  ay: 'M55 12.3A38 38 0 1 0 87.1 58.2A28 28 0 1 1 55 12.3Z',
};
/** Kremanın küçüldüğü merkez (şeklin gövdesinin ortası) */
const KREMA_MERKEZ: Record<Sekil, [number, number]> = { yuvarlak: [50, 50], yildiz: [50, 54], kalp: [50, 46], ay: [36, 56] };
/** Süslerin kurabiye üstündeki yerleri (1-3 süs) */
const SUS_YERI: Record<Sekil, [number, number][][]> = {
  yuvarlak: [[[50, 50]], [[37, 50], [63, 50]], [[50, 36], [36, 61], [64, 61]]],
  yildiz: [[[50, 54]], [[39, 56], [61, 56]], [[50, 40], [38, 62], [62, 62]]],
  kalp: [[[50, 46]], [[36, 40], [64, 40]], [[34, 38], [66, 38], [50, 62]]],
  ay: [[[33, 60]], [[26, 48], [42, 72]], [[25, 42], [30, 62], [48, 76]]],
};

// ---------------------------------------------------------------- süsler (merkez 0,0; ~22 birim)
const SUS_CIZIM: Record<Sus, string> = {
  cilek: `<path d="M0 11C-8 7-10-1-9-5C-7-9 7-9 9-5C10-1 8 7 0 11Z" fill="#FF4D5E" stroke="${K}" stroke-width="2.4" stroke-linejoin="round"/><path d="M-7-6L-2-5L0-9L2-5L7-6L4-2L0-4L-4-2Z" fill="#4CC25A" stroke="${K}" stroke-width="2" stroke-linejoin="round"/><g fill="#FFE7A3"><ellipse cx="-4" cy="1" rx="1.1" ry="1.5"/><ellipse cx="3.5" cy="0" rx="1.1" ry="1.5"/><ellipse cx="0" cy="5" rx="1.1" ry="1.5"/></g><ellipse cx="-4.5" cy="-3" rx="2" ry="1.2" fill="#fff" opacity=".7"/>`,
  havuc: `<circle r="8.5" fill="#FF8A2B" stroke="${K}" stroke-width="2.4"/><circle r="5" fill="#FFB56B"/><circle r="1.6" fill="#E86E10"/><g stroke="#E86E10" stroke-width="1.2" stroke-linecap="round"><path d="M0-4.6v-2.4M0 4.6v2.4M-4.6 0h-2.4M4.6 0h2.4"/></g><ellipse cx="-3.5" cy="-4.5" rx="2" ry="1" fill="#fff" opacity=".6"/>`,
  bal: `<path d="M0-11C4-5 8-1 8 3.5A8 8 0 0 1-8 3.5C-8-1-4-5 0-11Z" fill="#FFB321" stroke="${K}" stroke-width="2.4" stroke-linejoin="round"/><path d="M-3.5 1.5A4 4 0 0 0-1 6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/>`,
  muz: `<circle r="8.5" fill="#FFF1A8" stroke="${K}" stroke-width="2.4"/><circle r="5.2" fill="none" stroke="#F2D46A" stroke-width="1.6"/><g fill="#8A5A2B"><circle cx="0" cy="-2" r="1"/><circle cx="-1.8" cy="1.4" r="1"/><circle cx="1.8" cy="1.4" r="1"/></g><ellipse cx="-3.5" cy="-4.5" rx="2" ry="1" fill="#fff" opacity=".7"/>`,
  cikolata: `<path d="M0-10C3-6 9-2 8.5 3.5C8 8-8 8-8.5 3.5C-9-2-3-6 0-10Z" fill="#7A4526" stroke="${K}" stroke-width="2.4" stroke-linejoin="round"/><path d="M-3-2C-2-4 0-6 0-6" fill="none" stroke="#B07A50" stroke-width="2" stroke-linecap="round"/>`,
};
export const susSvg = (s: Sus, x: number, y: number, k = 1, ek = '') => `<g class="ps-sus" data-sus="${s}" transform="translate(${x} ${y}) scale(${k})"${ek}>${SUS_CIZIM[s]}</g>`;
/** Süsün tek başına simgesi (süs kabı, sipariş balonu) */
export const susIkon = (s: Sus) => `<svg viewBox="-12 -12 24 24" aria-hidden="true">${SUS_CIZIM[s]}</svg>`;

// ---------------------------------------------------------------- kurabiye / kapkek
export type Hal = 'top' | 'cig' | 'pismis';
export interface CizimSecenek {
  urun: Urun;
  sekil: Sekil | null;
  hal: Hal;
  renk?: Renk | null;
  yigin?: Renk[];
  susler?: Sus[];
  /** hamur rengi (yoksa CSS değişkeni --hamur, o da yoksa altın) */
  hamur?: string;
  /** gölge çizilsin mi */
  golge?: boolean;
}
const hamurDolgu = (o: CizimSecenek) => (o.hamur ? o.hamur : 'var(--hamur, #F3B54A)');

/** Hamur topu (tepsiye düşen) */
function hamurTopu(golge: boolean): string {
  return `${golge ? '<ellipse cx="50" cy="84" rx="26" ry="6" fill="#3A1210" opacity=".18"/>' : ''}<path d="M24 66C22 48 34 34 50 34C66 34 78 48 76 66C75 79 25 79 24 66Z" fill="#FBF0DC" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><path d="M32 52C34 45 41 41 47 41" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><ellipse cx="62" cy="68" rx="6" ry="3" fill="#EFD9B4"/>`;
}

function kurabiye(o: CizimSecenek): string {
  const sekil = o.sekil ?? 'yuvarlak';
  const yol = SEKIL_YOLU[sekil];
  const golge = o.golge !== false ? `<path d="${yol}" fill="#3A1210" opacity=".16" transform="translate(3 6)"/>` : '';
  const govde = `<path class="ps-k-govde" d="${yol}" style="fill:${hamurDolgu(o)}" stroke="${K}" stroke-width="5" stroke-linejoin="round"/>`;
  // pişmiş kurabiyenin kenarında hafif koyu halka ve doku noktaları
  const doku =
    o.hal === 'cig'
      ? `<path d="${yol}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3" transform="translate(50 50) scale(.84) translate(-50 -50)"/>`
      : `<path d="${yol}" fill="none" stroke="#3A1210" stroke-opacity=".14" stroke-width="5" transform="translate(50 50) scale(.86) translate(-50 -50)"/><g fill="#3A1210" opacity=".18"><circle cx="40" cy="44" r="1.6"/><circle cx="58" cy="40" r="1.6"/><circle cx="62" cy="60" r="1.6"/><circle cx="44" cy="62" r="1.6"/></g>`;
  const [mx, my] = KREMA_MERKEZ[sekil];
  const krema = o.renk
    ? `<g class="ps-krema"><path d="${yol}" fill="${RENK_KODU[o.renk]}" stroke="${K}" stroke-width="3.5" stroke-linejoin="round" transform="translate(${mx} ${my}) scale(.78) translate(-${mx} -${my})"/><path d="${yol}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-dasharray="14 60" transform="translate(${mx} ${my}) scale(.62) translate(-${mx} -${my})"/></g>`
    : '';
  const parlama = o.renk ? '' : `<path d="M30 30C34 25 39 23 44 22" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="4" stroke-linecap="round"/>`;
  const susler = (o.susler ?? [])
    .slice(0, 3)
    .map((s, i, a) => {
      const [x, y] = SUS_YERI[sekil][a.length - 1][i];
      return susSvg(s, x, y, 1.05);
    })
    .join('');
  return golge + govde + doku + krema + parlama + `<g class="ps-susler">${susler}</g>`;
}

/** Krema yığını (kapkek): i. kat, alttan */
function yigin(renk: Renk, i: number): string {
  const y = 52 - i * 12;
  const w = 31 - i * 7;
  const c = RENK_KODU[renk];
  return `<g class="ps-yigin" data-renk="${renk}"><path d="M${50 - w} ${y + 6}C${50 - w - 4} ${y - 4} ${50 - w + 6} ${y - 11} ${50 - w / 2} ${y - 9}C${50 - w / 3} ${y - 17} ${50 + w / 3} ${y - 17} ${50 + w / 2} ${y - 9}C${50 + w - 6} ${y - 11} ${50 + w + 4} ${y - 4} ${50 + w} ${y + 6}C${50 + w / 2} ${y + 10} ${50 - w / 2} ${y + 10} ${50 - w} ${y + 6}Z" fill="${c}" stroke="${K}" stroke-width="3.5" stroke-linejoin="round"/><path d="M${50 - w / 2} ${y - 3}C${50 - w / 4} ${y - 8} ${50} ${y - 8} ${50 + w / 6} ${y - 5}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2.6" stroke-linecap="round"/></g>`;
}

function kapkek(o: CizimSecenek): string {
  const golge = o.golge !== false ? '<ellipse cx="50" cy="93" rx="27" ry="5" fill="#3A1210" opacity=".18"/>' : '';
  const kap = `<path d="M22 62L78 62L70 91L30 91Z" fill="#fff" stroke="${K}" stroke-width="4.5" stroke-linejoin="round"/><g stroke="#FF9CC8" stroke-width="4"><path d="M33 64L36 89M45 64L46 89M55 64L54 89M67 64L64 89"/></g><path d="M22 62L78 62L70 91L30 91Z" fill="none" stroke="${K}" stroke-width="4.5" stroke-linejoin="round"/>`;
  const kubbe =
    o.hal === 'top' || o.hal === 'cig'
      ? `<path d="M23 63C23 54 34 50 50 50C66 50 77 54 77 63Z" style="fill:${hamurDolgu(o)}" stroke="${K}" stroke-width="4.5" stroke-linejoin="round"/>`
      : `<path d="M20 64C18 48 32 38 50 38C68 38 82 48 80 64Z" style="fill:${hamurDolgu(o)}" stroke="${K}" stroke-width="4.5" stroke-linejoin="round"/><path d="M30 52C33 46 39 43 45 42" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3.5" stroke-linecap="round"/>`;
  const yy = (o.yigin ?? []).slice(0, 3);
  const katlar = yy.map((r, i) => yigin(r, i)).join('');
  const tepe = yy.length ? 52 - (yy.length - 1) * 12 - 16 : 36;
  const susler = (o.susler ?? []).slice(0, 3).map((s, i, a) => susSvg(s, 50 + (i - (a.length - 1) / 2) * 13, tepe, 1)).join('');
  return golge + kap + kubbe + `<g class="ps-yiginlar">${katlar}</g><g class="ps-susler">${susler}</g>`;
}

/** Kurabiye ya da kapkek (100×100 viewBox) */
export function urunSvg(o: CizimSecenek, sinif = 'ps-urun-svg'): string {
  const ic = o.hal === 'top' && o.urun === 'kurabiye' ? hamurTopu(o.golge !== false) : o.urun === 'kapkek' ? kapkek(o) : kurabiye(o);
  return `<svg class="${sinif}" viewBox="0 0 100 100" aria-hidden="true" overflow="visible">${ic}</svg>`;
}

// ---------------------------------------------------------------- istasyonlar
/** Kurabiye kalıbı: şeklin kalın renkli kenarı (iç boş) */
const KALIP_RENK: Record<string, string> = { yuvarlak: '#FF6F7D', yildiz: '#FFC22E', kalp: '#FF7EB6', ay: '#8E7CFF', kapkek: '#4FC3B0' };
export function kalipSvg(k: Sekil | 'kapkek'): string {
  if (k === 'kapkek') {
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><ellipse cx="50" cy="90" rx="30" ry="5" fill="${K}" opacity=".16"/><path d="M18 40L82 40L72 86L28 86Z" fill="#fff" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><g stroke="${KALIP_RENK.kapkek}" stroke-width="6"><path d="M31 43L36 83M45 43L47 83M55 43L53 83M69 43L64 83"/></g><path d="M18 40L82 40L72 86L28 86Z" fill="none" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><ellipse cx="50" cy="40" rx="32" ry="6" fill="#fff" stroke="${K}" stroke-width="4"/></svg>`;
  }
  const yol = SEKIL_YOLU[k];
  return `<svg viewBox="-4 -4 108 108" aria-hidden="true"><path d="${yol}" fill="none" stroke="${K}" stroke-opacity=".16" stroke-width="15" stroke-linejoin="round" transform="translate(3 6)"/><path d="${yol}" fill="none" stroke="${K}" stroke-width="15" stroke-linejoin="round"/><path d="${yol}" fill="none" stroke="${KALIP_RENK[k]}" stroke-width="8" stroke-linejoin="round"/><path d="${yol}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2.5" stroke-dasharray="10 40" stroke-linejoin="round"/></svg>`;
}

/** Hamur kabı: mavi seramik kâse, içinde kabarık hamur ve tahta kaşık */
export const HAMUR_KABI = `<svg viewBox="0 0 120 110" aria-hidden="true"><ellipse cx="60" cy="102" rx="44" ry="6" fill="${K}" opacity=".18"/><path d="M78 20L96 4" stroke="${K}" stroke-width="11" stroke-linecap="round"/><path d="M78 20L96 4" stroke="#E0A060" stroke-width="5" stroke-linecap="round"/><path d="M22 46C22 30 40 20 60 20C80 20 98 30 98 46Z" fill="#FBF0DC" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><path d="M36 34C42 28 50 26 58 26" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M10 46H110C110 76 90 98 60 98C30 98 10 76 10 46Z" fill="#59B7F0" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><path d="M14 58H106" stroke="#fff" stroke-width="5" stroke-opacity=".7"/><path d="M20 66C24 80 36 88 50 90" fill="none" stroke="#fff" stroke-width="5" stroke-opacity=".45" stroke-linecap="round"/><path d="M10 46H110" stroke="${K}" stroke-width="5" stroke-linecap="round"/></svg>`;

/** Krema şişesi (sıkma torbası şişe): gövde krema renginde, ucu beyaz */
export function kremaSvg(r: Renk): string {
  const c = RENK_KODU[r];
  return `<svg viewBox="0 0 70 110" aria-hidden="true"><ellipse cx="35" cy="104" rx="22" ry="4.5" fill="${K}" opacity=".18"/><path d="M27 18L35 3L43 18Z" fill="#fff" stroke="${K}" stroke-width="4.5" stroke-linejoin="round"/><circle cx="35" cy="4" r="3.5" fill="${c}" stroke="${K}" stroke-width="2.5"/><rect x="22" y="15" width="26" height="12" rx="4" fill="#fff" stroke="${K}" stroke-width="4.5"/><path d="M14 38C14 30 22 26 35 26C48 26 56 30 56 38V90C56 98 48 101 35 101C22 101 14 98 14 90Z" fill="${c}" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><rect x="21" y="52" width="28" height="26" rx="9" fill="#fff" stroke="${K}" stroke-width="3.5"/><path d="M35 72C29 68 26 65 26 61C26 58 28 56 31 56C33 56 34.5 57 35 58.5C35.5 57 37 56 39 56C42 56 44 58 44 61C44 65 41 68 35 72Z" fill="${c}" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"/><path d="M20 40V86" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-opacity=".6"/></svg>`;
}

/** Süs kabı: küçük kâse, üstü süs dolu */
export function susKabiSvg(s: Sus, adet = 5): string {
  const yer: [number, number][] = [
    [34, 40],
    [52, 34],
    [70, 40],
    [43, 47],
    [61, 47],
  ];
  const ust = yer
    .slice(0, adet)
    .map(([x, y]) => susSvg(s, x, y, 1.15))
    .join('');
  return `<svg viewBox="0 0 104 90" aria-hidden="true" overflow="visible"><ellipse cx="52" cy="84" rx="38" ry="5" fill="${K}" opacity=".18"/><g class="ps-kap-ust">${ust}</g><path d="M10 48H94C94 70 76 82 52 82C28 82 10 70 10 48Z" fill="#FFF3D6" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><path d="M16 58C22 70 34 75 46 76" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-opacity=".8"/><path d="M10 48H94" stroke="${K}" stroke-width="5" stroke-linecap="round"/><path d="M24 62C34 66 70 66 80 62" fill="none" stroke="#FFB0CF" stroke-width="5" stroke-linecap="round"/></svg>`;
}

/** Fırın tepsisi (metal, kenarlı) */
export const TEPSI = `<svg viewBox="0 0 200 70" preserveAspectRatio="none" aria-hidden="true"><ellipse cx="100" cy="64" rx="92" ry="5" fill="${K}" opacity=".18"/><path d="M6 22H194L186 58H14Z" fill="#C9D4DE" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><path d="M16 30H184" stroke="#fff" stroke-width="4" stroke-opacity=".8" stroke-linecap="round"/><path d="M6 22H194" stroke="${K}" stroke-width="5" stroke-linecap="round"/></svg>`;

/** Servis tabağı */
export const TABAK = `<svg viewBox="0 0 200 80" preserveAspectRatio="none" aria-hidden="true"><ellipse cx="100" cy="72" rx="90" ry="7" fill="${K}" opacity=".18"/><ellipse cx="100" cy="44" rx="94" ry="28" fill="#fff" stroke="${K}" stroke-width="5"/><ellipse cx="100" cy="44" rx="80" ry="21" fill="none" stroke="#7CC8F2" stroke-width="5"/><ellipse cx="100" cy="46" rx="62" ry="14" fill="#F4FAFF"/><path d="M30 36C40 28 60 24 80 23" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`;

/** Fırının gövdesi (gözler DOM'da üstüne gelir) */
export const FIRIN_GOVDE = `<svg viewBox="0 0 300 150" preserveAspectRatio="none" aria-hidden="true"><ellipse cx="150" cy="146" rx="140" ry="5" fill="${K}" opacity=".2"/><rect x="6" y="6" width="288" height="134" rx="22" fill="#FF6F7D" stroke="${K}" stroke-width="6"/><rect x="16" y="14" width="268" height="18" rx="9" fill="#FF97A2"/><path d="M22 128H278" stroke="#D84E5C" stroke-width="6" stroke-linecap="round"/><g fill="#FFD84A" stroke="${K}" stroke-width="3"><circle cx="40" cy="23" r="6"/><circle cx="62" cy="23" r="6"/></g><rect x="200" y="17" width="70" height="12" rx="6" fill="#fff" stroke="${K}" stroke-width="3"/></svg>`;

/** Kasa (yazar kasa) */
export const KASA = `<svg viewBox="0 0 100 100" aria-hidden="true"><ellipse cx="50" cy="94" rx="40" ry="5" fill="${K}" opacity=".2"/><rect x="58" y="10" width="30" height="22" rx="6" fill="#fff" stroke="${K}" stroke-width="4.5"/><path d="M14 40C14 34 18 30 24 30H76C82 30 86 34 86 40V70H14Z" fill="#4FC3B0" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><g fill="#fff" stroke="${K}" stroke-width="2.5"><rect x="24" y="40" width="12" height="8" rx="3"/><rect x="40" y="40" width="12" height="8" rx="3"/><rect x="24" y="52" width="12" height="8" rx="3"/><rect x="40" y="52" width="12" height="8" rx="3"/></g><rect x="60" y="40" width="18" height="20" rx="4" fill="#FFD84A" stroke="${K}" stroke-width="2.5"/><path d="M8 70H92V84C92 88 89 90 85 90H15C11 90 8 88 8 84Z" fill="#FF8CC0" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><circle cx="50" cy="80" r="4" fill="#FFD84A" stroke="${K}" stroke-width="2.5"/></svg>`;

/** Jeton: altın para, ortasında yıldız */
export const JETON = `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="54" r="40" fill="#C98A12"/><circle cx="50" cy="48" r="40" fill="#FFD23F" stroke="${K}" stroke-width="6"/><circle cx="50" cy="48" r="29" fill="none" stroke="#F0A818" stroke-width="5"/><path d="${yildizYolu(50, 50, 20, 9)}" fill="#FFB300" stroke="#C47F00" stroke-width="3" stroke-linejoin="round"/><path d="M27 30C33 22 41 18 50 18" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-opacity=".75"/></svg>`;

/** Kumbara (pembe domuzcuk) */
export const KUMBARA = `<svg viewBox="0 0 140 110" aria-hidden="true"><ellipse cx="70" cy="104" rx="50" ry="5" fill="${K}" opacity=".2"/><g fill="#FF8CC0" stroke="${K}" stroke-width="5" stroke-linejoin="round"><rect x="34" y="78" width="16" height="22" rx="6"/><rect x="88" y="78" width="16" height="22" rx="6"/><path d="M40 30L46 12L60 26Z"/><path d="M16 60C16 36 40 22 70 22C102 22 124 38 124 60C124 82 102 94 70 94C40 94 16 84 16 60Z"/></g><path d="M118 54C128 50 132 44 128 40" fill="none" stroke="${K}" stroke-width="4" stroke-linecap="round"/><rect x="58" y="26" width="26" height="7" rx="3.5" fill="${K}"/><g><ellipse cx="22" cy="62" rx="11" ry="13" fill="#FFB3D6" stroke="${K}" stroke-width="4.5"/><ellipse cx="19" cy="59" rx="2" ry="3" fill="${K}"/><ellipse cx="25" cy="59" rx="2" ry="3" fill="${K}"/></g><circle cx="42" cy="48" r="5" fill="${K}"/><circle cx="43.5" cy="46.5" r="1.6" fill="#fff"/><path d="M60 40C70 34 86 34 96 40" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-opacity=".6"/></svg>`;

/** Pastacı şapkası (dükkân rafında tek başına) */
export const SAPKA = `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M24 62C10 60 6 44 16 36C20 22 36 20 42 26C46 14 64 14 66 26C74 20 90 26 86 40C96 46 90 62 76 62Z" fill="#fff" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><path d="M26 58H74V82C74 86 71 88 67 88H33C29 88 26 86 26 82Z" fill="#fff" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><path d="M26 66H74" stroke="#FF8CC0" stroke-width="6"/><path d="M30 34C32 28 38 25 44 26" fill="none" stroke="#E6EEF5" stroke-width="5" stroke-linecap="round"/></svg>`;

/**
 * Mino'nun kafasına takılan pastacı şapkası (Mino'nun çizim koordinatı: viewBox 344 140 1360 1790; kafanın tepesi
 * ~y 290, ortası x 1024). Kulakların arasına oturur, hafif yana yatık.
 */
export const MINO_SAPKA = `<g class="ps-mino-sapka" transform="rotate(-6 1024 330)"><path d="M800 330C700 330 660 220 740 170C740 70 860 40 920 100C950 0 1100 0 1120 100C1180 40 1310 80 1300 180C1380 230 1340 330 1250 330Z" fill="#fff" stroke="${K}" stroke-width="20" stroke-linejoin="round"/><path d="M790 300H1258V380C1258 395 1246 404 1232 404H816C802 404 790 395 790 380Z" fill="#fff" stroke="${K}" stroke-width="20" stroke-linejoin="round"/><path d="M790 328H1258" stroke="#FF8CC0" stroke-width="26"/><path d="M800 180C820 130 870 110 920 120" fill="none" stroke="#E4ECF4" stroke-width="22" stroke-linecap="round"/></g>`;

/**
 * Kino'nun unlu yüzü (Kino iskeletinin 2048'lik koordinatı; kafa katmanına eklenir: kafa dönünce un da döner).
 * Burnun üstünde ve yanakta un lekeleri; "çilekli ağız": ağzın kenarında kırmızı çilek suyu (aşırınca görünür).
 */
export const KINO_UN = `<g class="ps-kino-un" opacity=".92"><path d="M1060 760C1100 720 1180 730 1196 772C1214 816 1150 840 1112 826C1070 840 1030 800 1060 760Z" fill="#fff"/><circle cx="1210" cy="740" r="14" fill="#fff"/><circle cx="1036" cy="740" r="10" fill="#fff"/><path d="M700 900C730 868 790 872 800 904C812 940 760 952 734 940C706 946 684 922 700 900Z" fill="#fff"/><circle cx="820" cy="890" r="10" fill="#fff"/><path d="M880 470C910 446 960 452 966 478C972 504 930 512 908 504C884 508 866 490 880 470Z" fill="#fff" opacity=".9"/></g>`;
export const KINO_CILEK_AGIZ = `<g class="ps-kino-cilek" opacity="0"><path d="M880 1010C905 1000 930 1004 950 1016C965 1030 940 1046 910 1040C885 1036 866 1022 880 1010Z" fill="#FF4D5E"/><circle cx="975" cy="1028" r="12" fill="#FF4D5E"/><circle cx="866" cy="1030" r="9" fill="#FF4D5E"/></g>`;

/** Okul binası (Gün 3: okul önü; uzaktaki tepelerin önünde) */
export const OKUL = `<svg viewBox="0 0 520 300" aria-hidden="true"><ellipse cx="260" cy="292" rx="250" ry="10" fill="${K}" opacity=".12"/><rect x="250" y="16" width="5" height="60" fill="${K}"/><path d="M255 18H300L292 30L300 42H255Z" fill="#FF5A5F" stroke="${K}" stroke-width="4" stroke-linejoin="round"/><path d="M60 120L260 52L460 120Z" fill="#FF6F5E" stroke="${K}" stroke-width="7" stroke-linejoin="round"/><rect x="74" y="118" width="372" height="170" fill="#FFE9B8" stroke="${K}" stroke-width="7"/><rect x="214" y="80" width="92" height="50" fill="#FFE9B8" stroke="${K}" stroke-width="6"/><circle cx="260" cy="104" r="17" fill="#fff" stroke="${K}" stroke-width="5"/><path d="M260 92V104L268 110" stroke="${K}" stroke-width="4" stroke-linecap="round" fill="none"/><g fill="#8ED3FF" stroke="${K}" stroke-width="5"><rect x="100" y="146" width="56" height="46" rx="6"/><rect x="364" y="146" width="56" height="46" rx="6"/><rect x="100" y="214" width="56" height="46" rx="6"/><rect x="364" y="214" width="56" height="46" rx="6"/></g><g stroke="#fff" stroke-width="4" stroke-opacity=".8"><path d="M108 156L122 150M372 156L386 150M108 224L122 218M372 224L386 218"/></g><path d="M222 288V196C222 176 240 166 260 166C280 166 298 176 298 196V288Z" fill="#5DBE3F" stroke="${K}" stroke-width="6" stroke-linejoin="round"/><path d="M260 168V288" stroke="${K}" stroke-width="5"/><circle cx="248" cy="232" r="4" fill="#FFD84A"/><circle cx="272" cy="232" r="4" fill="#FFD84A"/><g fill="#FF8CC0" stroke="${K}" stroke-width="3"><circle cx="180" cy="140" r="7"/><circle cx="340" cy="140" r="7"/></g></svg>`;

/** Otobüs (yandan; sağa bakar). Kapak açılınca tente olur, tezgâh dışarı kayar. Boya: CSS --boya / --boya-koyu */
export const OTOBUS = `<svg class="ps-otobus-svg" viewBox="0 0 640 420" aria-hidden="true" overflow="visible">
<ellipse class="ps-ob-golge" cx="320" cy="392" rx="300" ry="16" fill="${K}" opacity=".2"/>
<g class="ps-ob-govde">
<g class="ps-ob-tabela"><rect x="250" y="8" width="140" height="10" rx="5" fill="${K}"/><path d="M276 18V44M364 18V44" stroke="${K}" stroke-width="7"/>
<g transform="translate(320 -34)"><path d="M-30 6L30 6L24 40L-24 40Z" fill="#fff" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><g stroke="#FF9CC8" stroke-width="5"><path d="M-17 9L-14 37M-5 9L-4 37M5 9L4 37M17 9L14 37"/></g><path d="M-30 6L30 6L24 40L-24 40Z" fill="none" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><path d="M-36 10C-40-6-24-16-14-12C-12-28 12-28 14-12C24-16 40-6 36 10Z" fill="#FF8CC0" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><path d="M-22-6C-18-12-10-14-4-13" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-opacity=".7"/><circle cx="0" cy="-28" r="9" fill="#FF4D5E" stroke="${K}" stroke-width="4"/><circle cx="-3" cy="-31" r="2.5" fill="#fff"/></g></g>
<path d="M60 56H548C584 56 612 84 616 124L626 300C627 318 614 330 596 330H44C28 330 18 318 18 302V98C18 74 36 56 60 56Z" style="fill:var(--boya,#FF8CC0)" stroke="${K}" stroke-width="8" stroke-linejoin="round"/>
<path d="M30 92C30 76 44 68 60 68H546C566 68 584 80 592 98" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-opacity=".55"/>
<path d="M20 268H624" style="stroke:var(--boya-koyu,#E2609E)" stroke-width="22"/>
<g fill="#fff" stroke="${K}" stroke-width="3"><circle cx="70" cy="268" r="5"/><circle cx="110" cy="268" r="5"/><circle cx="520" cy="268" r="5"/><circle cx="560" cy="268" r="5"/></g>
<path d="M520 84H556C580 84 596 104 598 126L602 196H520Z" fill="#9EDCFF" stroke="${K}" stroke-width="7" stroke-linejoin="round"/><path d="M534 98L560 98" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-opacity=".8"/>
<rect x="38" y="84" width="88" height="96" rx="16" fill="#9EDCFF" stroke="${K}" stroke-width="7"/><path d="M52 100L80 100" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-opacity=".8"/>
<rect x="604" y="230" width="24" height="26" rx="8" fill="#FFF3A0" stroke="${K}" stroke-width="6"/>
<rect x="6" y="294" width="40" height="22" rx="9" fill="#C9D4DE" stroke="${K}" stroke-width="6"/><rect x="598" y="294" width="40" height="22" rx="9" fill="#C9D4DE" stroke="${K}" stroke-width="6"/>
<g class="ps-ob-acik"><rect x="148" y="78" width="352" height="166" rx="12" fill="#FFE6C2" stroke="${K}" stroke-width="7"/><rect x="160" y="92" width="328" height="18" rx="6" fill="#FFD29A"/><g fill="#FFB0CF" stroke="${K}" stroke-width="3"><circle cx="190" cy="100" r="7"/><circle cx="458" cy="100" r="7"/></g></g>
</g>
<g class="ps-ob-tezgah"><path d="M134 236H514L526 264H122Z" fill="#E0A060" stroke="${K}" stroke-width="7" stroke-linejoin="round"/><path d="M140 246H508" stroke="#fff" stroke-width="5" stroke-opacity=".5" stroke-linecap="round"/></g>
<g class="ps-ob-kapak"><g class="ps-ob-panel"><rect x="142" y="72" width="364" height="178" rx="14" style="fill:var(--boya,#FF8CC0)" stroke="${K}" stroke-width="7"/><path d="M160 92H488" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-opacity=".5"/><rect x="290" y="210" width="68" height="16" rx="8" fill="#fff" stroke="${K}" stroke-width="5"/>
<g transform="translate(324 162)"><circle r="44" fill="#F3B54A" stroke="${K}" stroke-width="6"/><circle r="34" fill="#FF8CC0" stroke="${K}" stroke-width="4"/><g stroke-width="5" stroke-linecap="round"><path d="M-16-12l6-4" stroke="#fff"/><path d="M10-18l7 3" stroke="#6CC4FF"/><path d="M-20 8l3 7" stroke="#FFD84A"/><path d="M14 10l-6 5" stroke="#fff"/><path d="M-2 20l7 2" stroke="#7FE0C4"/><path d="M0-4l4 4" stroke="#FFD84A"/></g><path d="M-26-14C-22-24-12-30-2-31" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-opacity=".7"/></g>
<g stroke-width="7" stroke-linecap="round"><path d="M188 140l10-6" stroke="#FFD84A"/><path d="M212 196l8 6" stroke="#6CC4FF"/><path d="M450 136l-8 7" stroke="#fff"/><path d="M432 196l10 2" stroke="#FFD84A"/><path d="M240 120l2 9" stroke="#fff"/><path d="M406 118l6 6" stroke="#7FE0C4"/></g></g>
<g class="ps-ob-tente"><path d="M142 72H506V92C506 104 494 110 482 104C470 110 458 110 446 104C434 110 422 110 410 104C398 110 386 110 374 104C362 110 350 110 338 104C326 110 314 110 302 104C290 110 278 110 266 104C254 110 242 110 230 104C218 110 206 110 194 104C182 110 170 110 158 104C150 108 142 102 142 92Z" fill="#fff" stroke="${K}" stroke-width="6" stroke-linejoin="round"/><g fill="#FF5A7A"><path d="M178 74H214V104C206 108 194 110 186 104L178 106Z"/><path d="M250 74H286V104C278 108 266 110 258 104L250 106Z"/><path d="M322 74H358V104C350 108 338 110 330 104L322 106Z"/><path d="M394 74H430V104C422 108 410 110 402 104L394 106Z"/><path d="M466 74H502V100C494 106 482 108 474 104L466 106Z"/></g></g></g>
<g class="ps-ob-teker" data-teker="arka"><circle cx="150" cy="334" r="46" fill="#4A3A3A" stroke="${K}" stroke-width="7"/><circle cx="150" cy="334" r="22" fill="#E8EEF4" stroke="${K}" stroke-width="5"/><path d="M150 316V352M132 334H168" stroke="${K}" stroke-width="5" stroke-linecap="round"/></g>
<g class="ps-ob-teker" data-teker="on"><circle cx="500" cy="334" r="46" fill="#4A3A3A" stroke="${K}" stroke-width="7"/><circle cx="500" cy="334" r="22" fill="#E8EEF4" stroke="${K}" stroke-width="5"/><path d="M500 316V352M482 334H518" stroke="${K}" stroke-width="5" stroke-linecap="round"/></g>
</svg>`;

/** Akşamın kapanışında üstteki tabela (sevimli bulut) ve küçük yıldızlar için yıldız yolu */
export const YILDIZ_YOLU = yildizYolu(50, 52, 44, 21);

/** Kalp (beğeni / sabır kalbi çerçevesi) */
export const KALP_YOLU = 'M20 34C8 26 2 19 2 11.5A8.7 8.7 0 0 1 20 8A8.7 8.7 0 0 1 38 11.5C38 19 32 26 20 34Z';
export const KALP = `<svg viewBox="0 0 40 36" aria-hidden="true"><path d="${KALP_YOLU}" fill="#FF5A7A" stroke="${K}" stroke-width="3.5" stroke-linejoin="round"/><ellipse cx="11" cy="10" rx="3.5" ry="2.5" fill="#fff" opacity=".75"/></svg>`;
