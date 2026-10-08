/**
 * Mino'nun Pasta Otobüsü: çizimler (SVG metni). Gemini görseli gelen eşyada görsel kullanılır (resimler.ts:
 * assets/pasta/<ad>.webp); gelmeyenlerde kod çizimi yedektir. Yedek stil: ince, sıcak kahve kontur #6b3a1f (Barış,
 * 2026-10-02: "siyah siyah duruyor"), yumuşak gölge, beyaz parlama.
 *
 * Kurabiye ve kapkek çizimleri tek kaynaktan: tepsi, fırın, tabak ve sipariş balonu aynı çizimi kullanır.
 * Hamurun rengi CSS değişkeninden (--hamur): fırında pişerken kod yalnız bu rengi değiştirir.
 */
import { agizKutusu, DESEN_ORAN, desenHedefleri, desenKutusu, gozKutusu, serpintiYerleri, yolD, YUZ_YERI, yuzHedefleri, type Desen, type Hedef, type Yuz } from './desen';
import { BOYA, ICECEK_KODU, RENK_KODU, type Boy, type Icecek, type Renk, type Sekil, type Sus, type Urun } from './model';
import { KREMA_DIK, seritAdlari, kalipAdlari, kapkekAdlari, kavanozAdlari, kremaAdlari, kurabiyeAdlari, resim, susParcaAdlari, yuva, type KurabiyeHal } from './resimler';

export const K = '#6b3a1f';
/** Konturları inceltir (kod çizimleri ilk hâlinde kalın çizilmişti): kahve konturun kalınlığı ×0.62 */
export const ince = (s: string) => s.replace(/stroke="#6b3a1f" stroke-width="([\d.]+)"/g, (_, n: string) => `stroke="${K}" stroke-width="${(Number(n) * 0.62).toFixed(2)}"`);
/**
 * Görseli eski çizimin kutusunda (viewBox) gösteren SVG: CSS'teki boyutlar aynı kalır. hiza: görselin kutudaki yeri
 * (preserveAspectRatio; 'none' = kutuya yayılır: tepsi, tabak perspektifte biraz basık durur).
 */
export const resimSvg = (url: string, w: number, h: number, hiza = 'xMidYMax meet', ek = '') =>
  `<svg class="ps-r" viewBox="0 0 ${w} ${h}" preserveAspectRatio="${hiza === 'none' ? 'none' : 'xMidYMid meet'}" aria-hidden="true" overflow="visible">${ek}<image href="${url}" width="${w}" height="${h}" preserveAspectRatio="${hiza}"/></svg>`;
/** Kurabiye görselinin 100×100 kutudaki yeri (görsellerin ortak tuvali 298×277; merkezleri aynı) */
const kImg = (url: string, ek = '') => `<image href="${url}" x="-4" y="-2" width="108" height="104" preserveAspectRatio="xMidYMid meet"${ek}/>`;

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
/**
 * Süslerin kurabiye üstündeki yerleri (Barış: "çilekler olmuş mu?"; 2026-10-02): küçük (kurabiye eninin %22-28'i),
 * kremanın üstüne dengeli dağılır: 1 ortada, 2 yan yana, 3 üçgen, 4-5 halka. Şeklin içinde kalır (yıldızda ve ayda
 * dar). Her süs biraz farklı boyda ve hafif döner (±20°, her zaman aynı: rastgele ama kararlı).
 */
/**
 * Süslerin oturduğu alan: kremanın görünen yüzünün ortası (kremalı kurabiye görsellerinde ölçüldü: yuvarlakta ve kalpte
 * krema yukarıda, y≈43; yıldızda beş kolun ortası y≈52; kurabiyenin kalınlığı altta). Eskiden yıldızda ve yuvarlakta
 * süsler fazla aşağıda duruyordu (Barış). bk: süsün boy çarpanı (yıldızın içi dar).
 */
const SUS_ALAN: Record<Sekil, { cx: number; cy: number; rx: number; ry: number; bk: number }> = {
  yuvarlak: { cx: 50, cy: 43, rx: 18, ry: 13, bk: 1 },
  kalp: { cx: 50, cy: 43.5, rx: 16, ry: 11, bk: 1 },
  yildiz: { cx: 50, cy: 51.5, rx: 12.5, ry: 11, bk: 0.9 },
  ay: { cx: 35, cy: 57, rx: 8, ry: 15, bk: 0.85 },
};
/** n süsün yerleri: x, y, boy (birim), dönme (derece). Ağırlık merkezi kremanın ortasında. */
export function susYerleri(sekil: Sekil, n: number, tohum = 0): { x: number; y: number; w: number; a: number }[] {
  const k = SUS_ALAN[sekil];
  if (n <= 0) return [];
  const yerler: [number, number][] =
    n === 1
      ? [[0, 0]]
      : n === 2
        ? [[-0.8, 0.05], [0.8, -0.05]]
        : n === 3
          ? [[0, -0.8], [-0.85, 0.42], [0.85, 0.42]]
          : Array.from({ length: n }, (_, i) => {
              const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
              return [Math.cos(a), Math.sin(a)] as [number, number];
            });
  return yerler.map(([fx, fy], i) => {
    const h = (i * 7919 + tohum * 104729 + n * 31) % 97;
    return { x: k.cx + fx * k.rx, y: k.cy + fy * k.ry, w: (n === 1 ? 32 : 27 + (h % 4)) * k.bk, a: ((h * 13) % 31) - 15 };
  });
}

/**
 * Süsün görseli (Gemini: susler-<ad>). Sade sürümde hep aynı parça (bütün çilek): çocuk süsleri sayar, yarım çilek
 * "başka bir süs" gibi görünüp kafa karıştırıyordu. Yoksa yedek: küçük renkli yuvarlak.
 */
const SUS_RENGI: Record<Sus, string> = { cilek: '#FF4D5E', havuc: '#FF8A2B', bal: '#FFB321', muz: '#FFF1A8', cikolata: '#6B3A1E' };
function susGorseli(s: Sus): string | null {
  return resim(susParcaAdlari(s));
}
/** Süsün yumuşak gölgesi (küçük, soluk) */
const SUS_GOLGE = 'filter:drop-shadow(0 1.1px .9px rgba(80,40,20,.42))';
/** Bir süs: merkez (x, y), en w birim, dönme a (i: eski imza, kullanılmıyor) */
export function susSvg(s: Sus, x: number, y: number, w = 24, a = 0, _i = 0): string {
  const u = susGorseli(s);
  const ic = u
    ? `<image href="${u}" x="${(-w / 2).toFixed(2)}" y="${(-w / 2).toFixed(2)}" width="${w.toFixed(2)}" height="${w.toFixed(2)}" preserveAspectRatio="xMidYMid meet"/>`
    : `<circle r="${(w * 0.3).toFixed(2)}" fill="${SUS_RENGI[s]}" stroke="${K}" stroke-width=".8"/><circle cx="${(-w * 0.1).toFixed(2)}" cy="${(-w * 0.1).toFixed(2)}" r="${(w * 0.07).toFixed(2)}" fill="#fff" opacity=".8"/>`;
  return `<g class="ps-sus" data-sus="${s}" transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${a})" style="${SUS_GOLGE}">${ic}</g>`;
}
/** Süsün tek başına simgesi (süs kabı, sipariş balonu, Kino'nun yediği, uçan süs): aynı görsel */
export const susIkon = (s: Sus, i = 0) => `<svg viewBox="-12 -12 24 24" aria-hidden="true" overflow="visible">${susSvg(s, 0, 0, 22, 0, i)}</svg>`;
/** Süsler kurabiyenin ya da kapkeğin üstüne dağılmış */
function susDiz(sekil: Sekil, susler: readonly Sus[] = [], dy = 0): string {
  const l = susler.slice(0, 5);
  return `<g class="ps-susler">${susYerleri(sekil, l.length, l.length)
    .map((p, i) => susSvg(l[i], p.x, p.y + dy, p.w, p.a, i))
    .join('')}</g>`;
}

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
  /** yanmış (Kino yer) */
  yanik?: boolean;
  /** fırının içinde: görsel varsa çiğ → altın → yanık görselleri pişme oranıyla (CSS --p, --y) geçişir */
  firin?: boolean;
  /** krema deseni (düz: kaplama; öbürleri pişmiş kurabiyenin üstünde renkli krema şeridi) */
  desen?: Desen | null;
  /** serpinti tanesi sayısı */
  serpinti?: number;
  yuz?: Yuz | null;
  /** kapkekte doğum günü mumu sayısı; sonuk: üflendi */
  mum?: number;
  mumSonuk?: boolean;
}
const hamurDolgu = (o: CizimSecenek) => (o.hamur ? o.hamur : 'var(--hamur, #F3B54A)');

/** Hamur topu (tepsiye düşen) */
function hamurTopu(golge: boolean): string {
  return `${golge ? '<ellipse cx="50" cy="84" rx="26" ry="6" fill="#3A1210" opacity=".18"/>' : ''}<path d="M24 66C22 48 34 34 50 34C66 34 78 48 76 66C75 79 25 79 24 66Z" fill="#FBF0DC" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><path d="M32 52C34 45 41 41 47 41" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><ellipse cx="62" cy="68" rx="6" ry="3" fill="#EFD9B4"/>`;
}

/** Kremanın kenarından akan damlalar: [x, y, boy] (krema şeklinin alt kenarında) */
const DAMLA: Record<Sekil, [number, number, number][]> = {
  yuvarlak: [
    [31, 71, 3],
    [44, 79, 8],
    [62, 77.5, 4],
  ],
  yildiz: [
    [44, 73, 6],
    [56, 73, 3],
    [33, 79, 2],
  ],
  kalp: [
    [44, 72.5, 7],
    [58, 70.5, 3],
    [33, 63.5, 2],
  ],
  ay: [
    [42, 80.5, 7],
    [31, 76.5, 3],
    [55, 78, 2],
  ],
}

/** Kremanın parlaması: kaplamanın üstünde yumuşak beyaz parlama ve minik yıldız (desen ve serpinti siparişe göre ayrı) */
const PARLA: Record<Sekil, { parla: [number, number, number]; yildiz: [number, number] }> = {
  yuvarlak: { parla: [31, 25, -22], yildiz: [74, 22] },
  kalp: { parla: [29, 27, -30], yildiz: [70, 22] },
  yildiz: { parla: [41, 39, -35], yildiz: [60, 32] },
  ay: { parla: [27, 36, -50], yildiz: [44, 26] },
};
const SERPINTI_RENK = ['#FF5A7A', '#6CC4FF', '#FFD84A', '#7FE0C4', '#B98BFF', '#FFFFFF', '#FF9A3D', '#FF5A7A', '#6CC4FF'];
const parilti = (x: number, y: number, r: number) =>
  `<path d="M${x} ${y - r}Q${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y}Q${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r}Q${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y}Q${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r}Z" fill="#fff"/>`;
export function kremaSusu(sekil: Sekil): string {
  const d = PARLA[sekil];
  const [px, py, pa] = d.parla;
  return `<g class="ps-krema-susu"><ellipse cx="${px}" cy="${py}" rx="8" ry="3.2" fill="#fff" opacity=".6" transform="rotate(${pa} ${px} ${py})"/>${parilti(d.yildiz[0], d.yildiz[1], 4.2)}</g>`;
}

/** Krema şeridinin dokusu (Gemini: krema-serit-<renk>) varsa SVG deseni olarak; yoksa düz renk (desen kreması beyaz) */
const BEYAZ_KREMA = '#FFFDF7';
function seritBoya(renk: Renk | null): { tanim: string; boya: string } {
  const u = renk ? resim(seritAdlari(renk)) : null;
  if (!u || !renk) return { tanim: '', boya: renk ? RENK_KODU[renk] : BEYAZ_KREMA };
  const id = `ps-serit-${renk}`;
  return { tanim: `<defs><pattern id="${id}" patternUnits="userSpaceOnUse" width="16" height="16"><image href="${u}" width="16" height="16" preserveAspectRatio="xMidYMid slice"/></pattern></defs>`, boya: `url(#${id})` };
}

/** Bir krema şeridi (parmak yolu ya da şablon): koyu kenar, renk, parlak çizgi */
export function kremaSeridi(d: string, renk: Renk | null = null, kalin = 5.6): string {
  const { tanim, boya } = seritBoya(renk);
  return `${tanim}<path d="${d}" fill="none" stroke="${K}" stroke-opacity=".42" stroke-width="${(kalin + 1.8).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 .9)"/><path d="${d}" fill="none" stroke="${boya}" stroke-width="${kalin}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#fff" stroke-opacity=".72" stroke-width="${(kalin * 0.28).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" transform="translate(-.5 -.9)"/>`;
}
/** Krema noktası */
export function kremaNoktasi(x: number, y: number, renk: Renk | null = null, r = 4): string {
  const c = renk ? RENK_KODU[renk] : BEYAZ_KREMA;
  return `<circle cx="${x}" cy="${y + 0.9}" r="${r + 0.6}" fill="${K}" opacity=".35"/><circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><path d="M${x - r * 0.55} ${y - r * 0.15}A${r * 0.6} ${r * 0.6} 0 0 1 ${x - r * 0.05} ${y - r * 0.62}" fill="none" stroke="#fff" stroke-width="${(r * 0.32).toFixed(2)}" stroke-linecap="round" opacity=".85"/>`;
}

/**
 * Desen katmanı: kremanın üstünde beyaz krema deseni (görsel: desen-zigzag, desen-nokta; kurabiye eninin ~%70'i).
 * Görseli olmayan desenler (dalga, kalp) aynı kutuda beyaz krema şeridi.
 */
export function desenKatmani(sekil: Sekil, desen: Desen): string {
  const gorsel = desen === 'duz' ? null : yuva(({ zigzag: 'desenZigzag', nokta: 'desenNokta', dalga: 'desenDalga', kalp: 'desenKalp' } as const)[desen]);
  if (gorsel) {
    const k = desenKutusu(sekil, desen === 'zigzag' || desen === 'nokta' ? DESEN_ORAN[desen] : desen === 'kalp' ? 0.8 : DESEN_ORAN.cizgi);
    return `<g class="ps-desen" data-desen="${desen}" style="${SUS_GOLGE}"><image href="${gorsel}" x="${k.x}" y="${k.y}" width="${k.w}" height="${k.h}" preserveAspectRatio="none"/></g>`;
  }
  const h = desenHedefleri(desen, sekil);
  return `<g class="ps-desen" data-desen="${desen}">${h.map((x) => (x.tur === 'nokta' ? kremaNoktasi(x.yol[0][0], x.yol[0][1]) : kremaSeridi(yolD(x.yol)))).join('')}</g>`;
}

/** Göz kırpma çizgisi görseli (varsa) */
function kirpmaGorseli(h: Hedef, sekil: Sekil): string | null {
  const u = yuva('yuzKirpma');
  if (!u || h.parca !== 'agiz' || h.yol.length > 12) return null;
  const k = gozKutusu(sekil);
  return `<image href="${u}" x="${k.x + k.w / 2}" y="${k.y}" width="${k.w / 2}" height="${k.h}" preserveAspectRatio="xMidYMid meet" style="${SUS_GOLGE}"/>`;
}
/**
 * Yüzün bir parçası (görsel: kurabiye-yuz-goz iki göz bir arada, kurabiye-yuz-agiz gülen ağız). Göz: görselin o yarısı;
 * ağız: gülen ağız görseli; şaşkın (O) ağız ve göz kırpma çizgisi görseli olmadığından krema çizgisi; yanak: pembe.
 */
export function yuzParcasi(h: Hedef, sekil: Sekil = 'yuvarlak', yuz: Yuz = 'gulen'): string {
  const gozU = yuva('yuzGoz');
  const agizU = yuva('yuzAgiz');
  if (h.parca === 'goz' && h.tur === 'nokta' && gozU) {
    // iki gözün yarısı: iç içe svg ile kırpılır
    const k = gozKutusu(sekil);
    const sol = h.yol[0][0] < k.x + k.w / 2;
    return `<svg x="${sol ? k.x : k.x + k.w / 2}" y="${k.y}" width="${k.w / 2}" height="${k.h}" viewBox="${sol ? 0 : 118} 0 118 119" overflow="hidden" style="${SUS_GOLGE}"><image href="${gozU}" width="236" height="119"/></svg>`;
  }
  const kirp = kirpmaGorseli(h, sekil);
  if (kirp) return kirp;
  if (h.parca === 'agiz' && h.tur === 'cizgi' && yuz !== 'saskin' && agizU && h.yol.length > 12) {
    const k = agizKutusu(sekil);
    return `<image href="${agizU}" x="${k.x}" y="${k.y}" width="${k.w}" height="${k.h}" preserveAspectRatio="none" style="${SUS_GOLGE}"/>`;
  }
  if (h.parca === 'agiz' && h.tur === 'cizgi' && yuz === 'saskin') {
    const k = agizKutusu(sekil);
    const u = yuva('yuzAgizSaskin');
    if (u) return `<image href="${u}" x="${k.x + k.w * 0.25}" y="${k.y - k.h * 0.1}" width="${k.w * 0.5}" height="${k.h * 1.2}" preserveAspectRatio="xMidYMid meet" style="${SUS_GOLGE}"/>`;
    return `<ellipse cx="${k.x + k.w / 2}" cy="${k.y + k.h / 2}" rx="${k.w * 0.19}" ry="${k.h * 0.42}" fill="#C8405A" stroke="#3A1410" stroke-width="1.6"/><ellipse cx="${k.x + k.w / 2}" cy="${k.y + k.h * 0.72}" rx="${k.w * 0.11}" ry="${k.h * 0.14}" fill="#F48AA0"/>`;
  }
  if (h.tur === 'cizgi') return `<path d="${yolD(h.yol)}" fill="none" stroke="#4A2412" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="${yolD(h.yol)}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1" stroke-linecap="round" transform="translate(-.4 -.7)"/>`;
  const [x, y] = h.yol[0];
  if (h.parca === 'goz') {
    const u = yuva('yuzGoz');
    if (u) return `<image href="${u}" x="${x - 5}" y="${y - 5.5}" width="10" height="11" preserveAspectRatio="xMidYMid meet"/>`;
    return `<ellipse cx="${x}" cy="${y + 0.8}" rx="3.9" ry="4.5" fill="${K}" opacity=".3"/><path d="M${x} ${y - 5}C${x + 2} ${y - 2.4} ${x + 3.8} ${y - 0.6} ${x + 3.8} ${y + 1.2}A3.8 3.8 0 0 1 ${x - 3.8} ${y + 1.2}C${x - 3.8} ${y - 0.6} ${x - 2} ${y - 2.4} ${x} ${y - 5}Z" fill="#4A2412"/><circle cx="${x - 1.3}" cy="${y}" r="1.1" fill="#fff" opacity=".9"/>`;
  }
  const u = yuva('yuzYanak');
  if (u) return `<image href="${u}" x="${x - 5}" y="${y - 4}" width="10" height="8" preserveAspectRatio="xMidYMid meet"/>`;
  return `<ellipse cx="${x}" cy="${y}" rx="5" ry="3.2" fill="#FF7FA8" opacity=".75"/><ellipse cx="${x - 1.4}" cy="${y - 1}" rx="1.5" ry=".8" fill="#fff" opacity=".7"/>`;
}
export const yuzKatmani = (sekil: Sekil, yuz: Yuz) => `<g class="ps-yuz" data-yuz="${yuz}">${yuzHedefleri(yuz, sekil).map((h) => yuzParcasi(h, sekil, yuz)).join('')}</g>`;

/** Bir serpinti tanesi (renkli şeker çubuğu) */
export const serpintiTanesi = (x: number, y: number, a: number, r: number) =>
  `<rect x="${(x - 1.3).toFixed(2)}" y="${(y - 3.3).toFixed(2)}" width="2.6" height="6.6" rx="1.3" fill="${SERPINTI_RENK[r % SERPINTI_RENK.length]}" stroke="${K}" stroke-opacity=".4" stroke-width=".7" transform="rotate(${a} ${x} ${y})"/>`;
/** Serpinti katmanı: n tane, her zaman aynı yerlerde (canlı serpinti ile aynı görünür) */
let maskeNo = 0;
/**
 * Serpinti katmanı (görsel: susler-serpinti, kurabiyenin üstünde tek katman). Bol serpintide (12+ tane) görselin tamamı,
 * azda yalnız n dairelik kısmı görünür (her zaman aynı yerler: canlı serpinti ile son çizim aynı). Görsel yoksa tane tane.
 */
export function serpintiKatmani(sekil: Sekil, n: number): string {
  if (n <= 0) return '';
  const u = resim(['susler-serpinti']);
  if (!u) return `<g class="ps-serpinti" data-tane="${n}">${serpintiYerleri(sekil, n).map((t) => serpintiTanesi(t.x, t.y, t.a, t.r)).join('')}</g>`;
  const k = serpintiKutusu(sekil);
  const img = `<image href="${u}" x="${k.x}" y="${k.y}" width="${k.w}" height="${k.h}" preserveAspectRatio="xMidYMid meet"/>`;
  if (n >= SERPINTI_TAM) return `<g class="ps-serpinti" data-tane="${n}" style="${SUS_GOLGE}">${img}</g>`;
  const id = `ps-sm-${++maskeNo}`;
  const daireler = serpintiYerleri(sekil, n)
    .map((t) => `<circle cx="${t.x}" cy="${t.y}" r="${SERPINTI_DAIRE}" fill="#fff"/>`)
    .join('');
  return `<g class="ps-serpinti" data-tane="${n}" style="${SUS_GOLGE}"><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">${daireler}</mask><g mask="url(#${id})">${img}</g></g>`;
}
/** Serpinti görselinin kutusu: kurabiyenin üstünü kaplar */
export function serpintiKutusu(sekil: Sekil) {
  const y = YUZ_YERI[sekil];
  const w = y.w * 1.08;
  const hh = (w * 156) / 263;
  return { x: y.cx - w / 2, y: y.cy - hh / 2 - 2, w, h: hh };
}
/** Bu kadar taneden sonra görselin tamamı */
export const SERPINTI_TAM = 12;
/** Açılan dairelerin yarıçapı (birim) */
export const SERPINTI_DAIRE = 8.5;

/** Doğum günü mumları: kapkeğin tepesinde (yTaban: mumların dibi); sönükte alev yok, minik duman */
export function mumKatmani(n: number, yTaban: number, sonuk = false): string {
  if (n <= 0) return '';
  const mum = sonuk ? yuva('mumSonuk') ?? yuva('mum') : yuva('mum');
  const renk = ['#6CC4FF', '#FF8CC0', '#FFD84A', '#7FE0C4', '#B98BFF', '#FF9A3D'];
  const c = Array.from({ length: n }, (_, i) => {
    const x = 50 + (i - (n - 1) / 2) * 7.4;
    const y = yTaban - (i % 2 ? 1.5 : 0);
    if (mum && !sonuk) return `<image href="${mum}" x="${x - 4}" y="${y - 22}" width="8" height="22" preserveAspectRatio="xMidYMax meet"/>`;
    const govde = `<rect x="${x - 1.9}" y="${y - 13}" width="3.8" height="13" rx="1.2" fill="#fff" stroke="${K}" stroke-width=".9"/><path d="M${x - 1.9} ${y - 10}L${x + 1.9} ${y - 12}M${x - 1.9} ${y - 5.5}L${x + 1.9} ${y - 7.5}" stroke="${renk[i % renk.length]}" stroke-width="1.6"/>`;
    const alev = sonuk
      ? `<path class="ps-mum-duman" d="M${x} ${y - 14}q-1.5-2 0-4t0-4" fill="none" stroke="#B8AFA8" stroke-width="1" stroke-linecap="round" opacity=".8"/>`
      : `<path class="ps-mum-alev" d="M${x} ${y - 21}C${x + 2.6} ${y - 18} ${x + 2.4} ${y - 14.5} ${x} ${y - 14}C${x - 2.4} ${y - 14.5} ${x - 2.6} ${y - 18} ${x} ${y - 21}Z" fill="#FFB321" stroke="${K}" stroke-width=".6"/><path d="M${x} ${y - 18.5}C${x + 1} ${y - 17} ${x + 0.9} ${y - 15.4} ${x} ${y - 15.2}C${x - 0.9} ${y - 15.4} ${x - 1} ${y - 17} ${x} ${y - 18.5}Z" fill="#FFF3A0"/>`;
    return govde + alev;
  });
  return `<g class="ps-mumlar" data-mum="${n}">${c.join('')}</g>`;
}

/** Krema: şeklin küçültülmüşü, alt kenarından akan damlalar, parlak çizgi ve beyaz parıltı noktaları */
function kremaKatmani(sekil: Sekil, renk: Renk): string {
  const yol = SEKIL_YOLU[sekil];
  const [mx, my] = KREMA_MERKEZ[sekil];
  const c = RENK_KODU[renk];
  const kucult = (k: number) => `translate(${mx} ${my}) scale(${k}) translate(-${mx} -${my})`;
  const damla = DAMLA[sekil];
  // önce damlalar (konturlu), sonra krema, sonra birleşme yerini kapatan konturusuz yama: kenar akıyor gibi
  const damlalar = damla.map(([x, y, b]) => `<path d="M${x - 4.2} ${y - 3}V${y + b}A4.2 4.2 0 0 0 ${x + 4.2} ${y + b}V${y - 3}Z" fill="${c}" stroke="${K}" stroke-width="3" stroke-linejoin="round"/>`).join('');
  const yama = damla.map(([x, y, b]) => `<rect x="${x - 2.7}" y="${y - 5}" width="5.4" height="${b * 0.6 + 6}" fill="${c}"/><ellipse cx="${x - 1.3}" cy="${y + b - 0.5}" rx="1.1" ry="1.8" fill="#fff" opacity=".75"/>`).join('');
  return `<g class="ps-krema">${damlalar}<path d="${yol}" fill="${c}" stroke="${K}" stroke-width="3.5" stroke-linejoin="round" transform="${kucult(0.8)}"/>${yama}<path d="${yol}" fill="none" stroke="#fff" stroke-opacity=".65" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="16 70" transform="${kucult(0.6)}"/><path d="${yol}" fill="none" stroke="${K}" stroke-opacity=".12" stroke-width="4" stroke-dasharray="40 30" stroke-dashoffset="-40" transform="${kucult(0.68)}"/>${kremaSusu(sekil)}</g>`;
}

/** Kremalı mı (renkli kaplama; desen kaplamanın üstünde beyaz krema) */
const duzKrema = (o: CizimSecenek) => !!o.renk;
/** Kurabiyenin üst katmanları: desen (düz değilse), yüz, serpinti (süsler ayrı, en üstte) */
function ustKatman(o: CizimSecenek, sekil: Sekil): string {
  const desen = o.renk && o.desen && o.desen !== 'duz' ? desenKatmani(sekil, o.desen) : '';
  return desen + (o.yuz ? yuzKatmani(sekil, o.yuz) : '') + serpintiKatmani(sekil, o.serpinti ?? 0);
}

function kurabiye(o: CizimSecenek): string {
  const sekil = o.sekil ?? 'yuvarlak';
  const yol = SEKIL_YOLU[sekil];
  const golge = o.golge !== false ? `<path d="${yol}" fill="#3A1210" opacity=".18" transform="translate(3 10)"/>` : '';
  // kalınlık: aynı şekil biraz aşağıda, koyu (kurabiye tombul dursun)
  const yan = `<path d="${yol}" style="fill:${hamurDolgu(o)}" stroke="${K}" stroke-width="5" stroke-linejoin="round" transform="translate(0 6)"/><path d="${yol}" fill="${K}" opacity=".26" transform="translate(0 6)"/>`;
  const govde = `<path class="ps-k-govde" d="${yol}" style="fill:${hamurDolgu(o)}" stroke="${K}" stroke-width="5" stroke-linejoin="round"/>`;
  // pişmiş kurabiyenin kenarında hafif koyu halka ve doku noktaları
  const doku =
    o.hal === 'cig'
      ? `<path d="${yol}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3" transform="translate(50 50) scale(.84) translate(-50 -50)"/>`
      : `<path d="${yol}" fill="none" stroke="#9A5A1E" stroke-opacity=".28" stroke-width="6" transform="translate(50 50) scale(.88) translate(-50 -50)"/><g fill="#8A4A1A" opacity=".35"><circle cx="40" cy="44" r="1.8"/><circle cx="58" cy="40" r="1.8"/><circle cx="62" cy="60" r="1.8"/><circle cx="44" cy="62" r="1.8"/><circle cx="52" cy="52" r="1.5"/></g>`;
  const krema = duzKrema(o) ? kremaKatmani(sekil, o.renk!) : '';
  const parlama = duzKrema(o) ? '' : `<path d="M28 32C32 26 38 23 44 22" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="4.5" stroke-linecap="round"/><circle cx="24" cy="40" r="2.4" fill="#fff" opacity=".7"/>`;
  return golge + yan + govde + doku + krema + parlama + ustKatman(o, sekil) + susDiz(sekil, o.susler);
}

/** Krema yığını (kapkek): i. kat, alttan */
function yigin(renk: Renk, i: number): string {
  const y = 52 - i * 12;
  const w = 31 - i * 7;
  const c = RENK_KODU[renk];
  return `<g class="ps-yigin" data-renk="${renk}"><path d="M${50 - w} ${y + 6}C${50 - w - 4} ${y - 4} ${50 - w + 6} ${y - 11} ${50 - w / 2} ${y - 9}C${50 - w / 3} ${y - 17} ${50 + w / 3} ${y - 17} ${50 + w / 2} ${y - 9}C${50 + w - 6} ${y - 11} ${50 + w + 4} ${y - 4} ${50 + w} ${y + 6}C${50 + w / 2} ${y + 10} ${50 - w / 2} ${y + 10} ${50 - w} ${y + 6}Z" fill="${c}" stroke="${K}" stroke-width="3.5" stroke-linejoin="round"/><path d="M${50 - w / 2} ${y - 3}C${50 - w / 4} ${y - 8} ${50} ${y - 8} ${50 + w / 6} ${y - 5}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2.6" stroke-linecap="round"/></g>`;
}

function kapkek(o: CizimSecenek): string {
  const golge = o.golge !== false ? '<ellipse cx="50" cy="94" rx="28" ry="5" fill="#3A1210" opacity=".2"/>' : '';
  // kâğıt kalıp: pembe-beyaz pileler, sağ yanı gölgeli, üst kenarı dalgalı
  const kap = `<path d="M21 61L79 61L70 92L30 92Z" fill="#fff" stroke="${K}" stroke-width="4.5" stroke-linejoin="round"/><g stroke="#FF8CC0" stroke-width="4.5"><path d="M31 63L35 90M43 63L45 90M55 63L54 90M67 63L64 90"/></g><path d="M62 62L79 61L70 92L58 92Z" fill="${K}" opacity=".14"/><path d="M21 61L79 61L70 92L30 92Z" fill="none" stroke="${K}" stroke-width="4.5" stroke-linejoin="round"/><path d="M19 62Q24 66 29 62Q34 66 39 62Q44 66 50 62Q56 66 61 62Q66 66 71 62Q76 66 81 62" fill="none" stroke="${K}" stroke-width="3.5" stroke-linejoin="round"/>`;
  const kubbe =
    o.hal === 'top' || o.hal === 'cig'
      ? `<path d="M23 63C23 54 34 50 50 50C66 50 77 54 77 63Z" style="fill:${hamurDolgu(o)}" stroke="${K}" stroke-width="4.5" stroke-linejoin="round"/><path d="M32 57C36 54 41 53 45 53" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3" stroke-linecap="round"/>`
      : `<path d="M19 64C17 47 32 36 50 36C68 36 83 47 81 64Z" style="fill:${hamurDolgu(o)}" stroke="${K}" stroke-width="4.5" stroke-linejoin="round"/><path d="M62 40C74 45 80 54 79 63L66 63C68 54 66 46 62 40Z" fill="${K}" opacity=".16"/><path d="M29 52C32 45 39 41 46 40" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="4" stroke-linecap="round"/><circle cx="26" cy="58" r="2" fill="#fff" opacity=".6"/>`;
  const yy = (o.yigin ?? []).slice(0, 3);
  const katlar = yy.map((r, i) => yigin(r, i)).join('');
  const tepe = yy.length ? 52 - (yy.length - 1) * 12 - 16 : 36;
  const susler = kapkekSusleri(o.susler, tepe);
  return golge + kap + kubbe + `<g class="ps-yiginlar">${katlar}${yiginSusu(yy.length)}</g>${susler}` + mumKatmani(o.mum ?? 0, tepe + 6, o.mumSonuk);
}

/** Kapkek kremasının üstüne şeker serpintisi (görsel: susler-serpinti, küçük) */
function yiginSusu(n: number): string {
  if (!n) return '';
  const u = resim(['susler-serpinti']);
  if (u) {
    const ust = 52 - (n - 1) * 12;
    const w = (31 - (n - 1) * 7) * 1.5;
    return `<g class="ps-krema-susu"><image href="${u}" x="${50 - w / 2}" y="${ust - 12}" width="${w}" height="${w * 0.6}" preserveAspectRatio="xMidYMid meet"/></g>`;
  }
  const ust = 52 - (n - 1) * 12;
  const w = 31 - (n - 1) * 7;
  const yerler: [number, number, number][] = [[-0.55, -3, 30], [-0.2, -9, -40], [0.25, -8, 60], [0.6, -2, -20], [0.05, 1, 80]];
  const s = yerler
    .map(([fx, dy, a], i) => {
      const x = 50 + fx * w;
      const y = ust + dy;
      return `<rect x="${x - 1.2}" y="${y - 3}" width="2.4" height="6" rx="1.2" fill="${SERPINTI_RENK[i]}" stroke="${K}" stroke-opacity=".35" stroke-width=".6" transform="rotate(${a} ${x} ${y})"/>`;
    })
    .join('');
  return `<g class="ps-krema-susu">${s}${parilti(50 + w * 0.45, ust - 12, 3.6)}</g>`;
}


/**
 * Kurabiye görselle (assets/pasta/kurabiye-<şekil>-<hâl>): hâline göre; fırında çiğ → altın → yanık görselleri pişme
 * oranıyla geçişir. Desenli kremada pişmiş (altın) kurabiye + renkli krema şeridi. Gereken görsel yoksa null (kod
 * çizimi kullanılır: ay şekli, mor krema …).
 */
function kurabiyeResim(o: CizimSecenek): string | null {
  const sekil = o.sekil ?? 'yuvarlak';
  const r = (hal: KurabiyeHal, renk?: Renk | null) => resim(kurabiyeAdlari(sekil, hal, renk));
  let ic: string | null = null;
  if (o.hal === 'top') {
    const u = r('hamur-topu');
    ic = u && kImg(u);
  } else if (o.hal === 'cig') {
    const u = r('cig');
    ic = u && kImg(u);
  } else if (o.yanik) {
    const u = r('yanik');
    ic = u && kImg(u);
  } else if (duzKrema(o)) {
    const u = r('krema', o.renk);
    ic = u && `<g class="ps-krema">${kImg(u)}</g>`;
  } else if (o.firin) {
    const [c, a, y] = [r('cig'), r('altin'), r('yanik')];
    ic = c && a && y ? kImg(c) + kImg(a, ' class="ps-k-altin"') + kImg(y, ' class="ps-k-yanik"') : null;
  } else {
    const u = r('altin');
    ic = u && kImg(u);
  }
  if (!ic) return null;
  const golge = o.golge !== false ? `<ellipse cx="50" cy="91" rx="36" ry="6" fill="${K}" opacity=".16"/>` : '';
  return golge + ic + ustKatman(o, sekil) + susDiz(sekil, o.susler);
}

/**
 * Kapkek görselle (cupcake-pismis; tabana hizalı): gövde görsel, krema yığınları ve süsler kod çizimi (kubbenin üstüne).
 * Fırında görsel pişme oranıyla solgundan altına döner (CSS .ps-kk-firin: --p, --y).
 */
/** Kapkeğin tepesindeki süsler: 1 ortada, 2 yan yana, 3 üçgen (küçük, hafif dönük, gölgeli) */
function kapkekSusleri(susler: readonly Sus[] = [], tepe: number): string {
  const l = susler.slice(0, 3);
  const yer: [number, number][] = l.length === 1 ? [[0, 0]] : l.length === 2 ? [[-7, 1], [7, -1]] : [[0, -6], [-8, 3], [8, 3]];
  return `<g class="ps-susler">${l.map((x, i) => susSvg(x, 50 + yer[i][0], tepe + yer[i][1], 22 + ((i * 5) % 5), ((i * 17 + l.length * 7) % 41) - 20, i)).join('')}</g>`;
}

function kapkekResim(o: CizimSecenek): string | null {
  const u = resim(kapkekAdlari(o.hal !== 'pismis')) ?? (o.hal === 'pismis' ? null : resim(kapkekAdlari(false)));
  if (!u) return null;
  const golge = o.golge !== false ? `<ellipse cx="50" cy="95" rx="30" ry="5" fill="${K}" opacity=".16"/>` : '';
  const sinif = o.firin || o.hal !== 'pismis' ? ' class="ps-kk-firin"' : o.yanik ? ' class="ps-kk-yanik"' : '';
  const yy = (o.yigin ?? []).slice(0, 3);
  const tepe = yy.length ? 52 - (yy.length - 1) * 12 - 26 : 24;
  const susler = kapkekSusleri(o.susler, tepe);
  return golge + `<image href="${u}" x="8" y="4" width="84" height="92" preserveAspectRatio="xMidYMax meet"${sinif}/>` + `<g class="ps-yiginlar" transform="translate(0 -10)">${ince(yy.map((r, i) => yigin(r, i)).join(''))}${yiginSusu(yy.length)}</g>${susler}` + mumKatmani(o.mum ?? 0, tepe + 6, o.mumSonuk);
}

/** Kurabiye ya da kapkek (100×100 viewBox) */
export function urunSvg(o: CizimSecenek, sinif = 'ps-urun-svg'): string {
  const ic =
    (o.urun === 'kurabiye' ? kurabiyeResim(o) : kapkekResim(o)) ??
    ince(o.hal === 'top' && o.urun === 'kurabiye' ? hamurTopu(o.golge !== false) : o.urun === 'kapkek' ? kapkek(o) : kurabiye(o));
  return `<svg class="${sinif}" viewBox="0 0 100 100" aria-hidden="true" overflow="visible">${ic}</svg>`;
}

// ---------------------------------------------------------------- içecek
/** Bardağın iç kutusu (100×100): üst ve alt kenarın y'si, yarı genişlikler; çizgi iç yüksekliğin %80'inde */
export const BARDAK_IC: Record<Boy, { ust: number; alt: number; wu: number; wa: number }> = {
  kucuk: { ust: 42, alt: 92, wu: 21, wa: 16 },
  buyuk: { ust: 14, alt: 92, wu: 24, wa: 18 },
};
export const CIZGI_ORAN = 0.8;
/** Bardak: cam, içinde içecek (dolum: çizgiye oranla), çizgi işareti; kakaoda köpük, limonatada limon ve pipet */
export function bardakSvg(o: { icecek: Icecek | null; boy: Boy; dolum: number; cizgi?: boolean; golge?: boolean }, sinif = 'ps-bardak-svg'): string {
  const b = BARDAK_IC[o.boy];
  const ic = b.alt - b.ust;
  const xAt = (y: number) => b.wa + ((b.wu - b.wa) * (b.alt - y)) / ic;
  const doluY = Math.max(b.ust - 2, b.alt - ic * CIZGI_ORAN * Math.max(0, Math.min(1.25, o.dolum)));
  const cizgiY = b.alt - ic * CIZGI_ORAN;
  const renk = o.icecek ? ICECEK_KODU[o.icecek] : '#fff';
  const sivi =
    o.icecek && o.dolum > 0.01
      ? `<path d="M${50 - xAt(doluY)} ${doluY}L${50 + xAt(doluY)} ${doluY}L${50 + b.wa} ${b.alt}L${50 - b.wa} ${b.alt}Z" fill="${renk}"/><path d="M${50 + xAt(doluY) - 7} ${doluY + 2}L${50 + b.wa - 5} ${b.alt - 2}L${50 + b.wa} ${b.alt}L${50 + xAt(doluY)} ${doluY}Z" fill="${K}" opacity=".12"/><ellipse cx="50" cy="${doluY}" rx="${xAt(doluY)}" ry="2.4" fill="#fff" opacity=".45"/>` +
        (o.icecek === 'kakao' && o.dolum > 0.5 ? `<g fill="#F7E6D2" stroke="${K}" stroke-opacity=".3" stroke-width=".6"><circle cx="${50 - xAt(doluY) * 0.5}" cy="${doluY - 1}" r="3.2"/><circle cx="50" cy="${doluY - 2}" r="3.8"/><circle cx="${50 + xAt(doluY) * 0.5}" cy="${doluY - 1}" r="3"/></g>` : '') +
        (o.dolum > 1 + 0.13 ? `<path d="M${50 + xAt(b.ust)} ${b.ust}q3 6 1 12q-1 3 2 5" fill="none" stroke="${renk}" stroke-width="3.2" stroke-linecap="round"/>` : '')
      : '';
  const ekler =
    o.icecek === 'limonata' && o.dolum > 0.5
      ? `<path d="M${50 + 6} ${b.ust - 14}L${50 + 2} ${b.alt - 6}" stroke="#FF5A7A" stroke-width="3.2" stroke-linecap="round"/><path d="M${50 + 6} ${b.ust - 14}L${50 + 2} ${b.alt - 6}" stroke="#fff" stroke-width="1.2" stroke-dasharray="3 3"/><g transform="translate(${50 - b.wu + 2} ${b.ust + 1})"><circle r="7" fill="#FFE45C" stroke="${K}" stroke-width="1.4"/><circle r="5" fill="#FFF6B8"/><path d="M0-5V5M-5 0H5M-3.5-3.5L3.5 3.5M3.5-3.5L-3.5 3.5" stroke="#F2C430" stroke-width=".8"/></g>`
      : '';
  const camYol = `M${50 - b.wu - 2} ${b.ust - 3}L${50 + b.wu + 2} ${b.ust - 3}L${50 + b.wa + 1.5} ${b.alt + 3}Q50 ${b.alt + 5} ${50 - b.wa - 1.5} ${b.alt + 3}Z`;
  const gorsel = yuva(o.boy === 'kucuk' ? 'bardakKucuk' : 'bardakBuyuk');
  const cam = gorsel
    ? `<image href="${gorsel}" x="${50 - b.wu - 8}" y="${b.ust - 8}" width="${(b.wu + 8) * 2}" height="${b.alt - b.ust + 14}" preserveAspectRatio="none"/>`
    : `<path d="${camYol}" fill="#E8F6FF" fill-opacity=".28" stroke="${K}" stroke-width="2.4" stroke-linejoin="round"/><path d="M${50 - b.wu + 3} ${b.ust + 4}L${50 - b.wa + 3} ${b.alt - 6}" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".8"/><ellipse cx="50" cy="${b.ust - 3}" rx="${b.wu + 2}" ry="2.6" fill="none" stroke="${K}" stroke-width="1.6" opacity=".6"/>`;
  const cizgi = o.cizgi ? `<path class="ps-dolum-cizgi" d="M${50 - xAt(cizgiY) - 3} ${cizgiY}H${50 + xAt(cizgiY) + 3}" stroke="#FF5A7A" stroke-width="2" stroke-dasharray="4 2.5" stroke-linecap="round"/><path d="M${50 + xAt(cizgiY) + 3} ${cizgiY - 3}l4 3l-4 3z" fill="#FF5A7A"/>` : '';
  const golge = o.golge !== false ? `<ellipse cx="50" cy="${b.alt + 4}" rx="${b.wa + 8}" ry="3" fill="${K}" opacity=".18"/>` : '';
  return `<svg class="${sinif}" viewBox="0 0 100 100" aria-hidden="true" overflow="visible">${golge}${sivi}${ekler}${cam}${cizgi}</svg>`;
}

/** İçeceğin simgesi (makinenin musluğunda, sipariş balonunda): süt kutusu, kakao fincanı, limon */
export function icecekIkon(i: Icecek): string {
  if (i === 'sut')
    return ince(`<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M12 14L16 6H24L28 14V35H12Z" fill="#fff" stroke="${K}" stroke-width="3" stroke-linejoin="round"/><path d="M12 20H28V29H12Z" fill="#6CC4FF"/><path d="M16 6H24" stroke="${K}" stroke-width="3"/><circle cx="20" cy="24.5" r="2.6" fill="#fff"/></svg>`);
  if (i === 'kakao')
    return ince(`<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M8 14H30L28 32C28 35 25 36 22 36H16C13 36 10 35 10 32Z" fill="#FF8CC0" stroke="${K}" stroke-width="3" stroke-linejoin="round"/><path d="M30 18C36 18 36 27 29 27" fill="none" stroke="${K}" stroke-width="3"/><ellipse cx="19" cy="14" rx="11" ry="3" fill="#9A5B35" stroke="${K}" stroke-width="2.4"/><path d="M15 9q-2-3 0-6M21 9q-2-3 0-6" fill="none" stroke="${K}" stroke-width="2" stroke-linecap="round" opacity=".5"/></svg>`);
  return ince(`<svg viewBox="0 0 40 40" aria-hidden="true"><ellipse cx="20" cy="22" rx="15" ry="11" fill="#FFE45C" stroke="${K}" stroke-width="3"/><path d="M5 22H35" stroke="#F2C430" stroke-width="2"/><path d="M18 11C18 6 22 4 26 5C25 9 22 11 18 11Z" fill="#7FD06B" stroke="${K}" stroke-width="2.2" stroke-linejoin="round"/><ellipse cx="13" cy="18" rx="3.5" ry="2" fill="#fff" opacity=".8"/></svg>`);
}

/** İçecek makinesi (yedek kod çizimi): pembe gövde, üç musluk, üstünde üç cam hazne (süt, kakao, limonata) */
export const ICECEK_MAKINESI_KOD = ince(`<svg viewBox="0 0 160 124" aria-hidden="true" overflow="visible"><ellipse cx="80" cy="119" rx="70" ry="5" fill="${K}" opacity=".2"/><rect x="8" y="44" width="144" height="72" rx="14" fill="#FF8CC0" stroke="${K}" stroke-width="4.5"/><path d="M18 52H142" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".5"/><rect x="16" y="96" width="128" height="12" rx="5" fill="#C9D4DE" stroke="${K}" stroke-width="3.5"/>${(
  [
    [33, 'sut'],
    [80, 'kakao'],
    [127, 'limonata'],
  ] as const
)
  .map(
    ([x, i]) =>
      `<rect x="${x - 19}" y="6" width="38" height="40" rx="10" fill="#E8F6FF" fill-opacity=".7" stroke="${K}" stroke-width="4"/><rect x="${x - 15}" y="18" width="30" height="24" rx="6" fill="${ICECEK_KODU[i]}"/><path d="M${x - 12} 12V30" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".8"/><rect x="${x - 7}" y="58" width="14" height="16" rx="4" fill="#C9D4DE" stroke="${K}" stroke-width="3.5"/><rect x="${x - 4}" y="72" width="8" height="8" rx="2" fill="#9AA9B6" stroke="${K}" stroke-width="3"/>`,
  )
  .join('')}</svg>`);

// ---------------------------------------------------------------- bulaşık, yıldız, işaretler
/** Tabak yığını (üst üste n tabak; kirli: kırıntılı, krema lekeli) */
export function tabakYigini(n: number, kirli: boolean): string {
  const u = yuva(kirli ? 'kirliTabak' : 'temizTabak');
  const c = Array.from({ length: n }, (_, i) => {
    const y = 52 - i * 8;
    const x = 30 + (kirli ? [0, 3, -2, 4, -3, 2][i % 6] : 0);
    if (u) return `<image href="${u}" x="${x - 26}" y="${y - 12}" width="52" height="20" preserveAspectRatio="none"/>`;
    return `<ellipse cx="${x}" cy="${y + 2}" rx="26" ry="7" fill="#E9F0F6" stroke="${K}" stroke-width="2"/><ellipse cx="${x}" cy="${y}" rx="26" ry="7" fill="#fff" stroke="${K}" stroke-width="2"/><ellipse cx="${x}" cy="${y}" rx="17" ry="4" fill="none" stroke="#FF8CC0" stroke-width="1.6" stroke-dasharray="2 3"/>${
      kirli ? `<g fill="#C98A4B"><circle cx="${x - 6}" cy="${y - 1}" r="1.6"/><circle cx="${x + 5}" cy="${y + 1}" r="1.3"/><circle cx="${x + 1}" cy="${y - 2}" r="1"/></g><path d="M${x + 6} ${y - 2}q4 1 2 3" fill="none" stroke="#FF8CC0" stroke-width="2" stroke-linecap="round"/>` : ''
    }`;
  });
  return ince(`<svg viewBox="0 0 60 64" aria-hidden="true" overflow="visible">${c.join('')}</svg>`);
}
/** Bulaşık simgesi (Kino'nun görev balonunda): köpüklü tabak */
export const BULASIK_IKON = ince(`<svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="30" rx="18" ry="7" fill="#fff" stroke="${K}" stroke-width="3"/><ellipse cx="24" cy="29" rx="11" ry="3.6" fill="none" stroke="#6CC4FF" stroke-width="2"/><g fill="#E8F6FF" stroke="${K}" stroke-width="2"><circle cx="14" cy="17" r="6"/><circle cx="25" cy="12" r="7.5"/><circle cx="35" cy="18" r="5"/></g><g fill="#fff"><circle cx="12" cy="15" r="1.8"/><circle cx="23" cy="9.5" r="2.2"/></g></svg>`);
/** Gün hedefinin yıldızı */
export const YILDIZ_SVG = ince(`<svg viewBox="0 0 100 100" aria-hidden="true"><path d="${yildizYolu(50, 54, 46, 22)}" fill="#C98A12" transform="translate(0 4)"/><path d="${yildizYolu(50, 52, 46, 22)}" fill="#FFD23F" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><path d="M34 40L44 36" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/></svg>`);
export const yildizSvg = () => {
  const u = yuva('yildiz');
  return u ? resimSvg(u, 100, 100, 'xMidYMid meet') : YILDIZ_SVG;
};
/** Şekersiz işareti: serpinti taneleri, üstü kırmızı çizili daire (Ege bebek) */
export const SEKERSIZ = (() => {
  const u = yuva('sekersiz');
  if (u) return resimSvg(u, 100, 100, 'xMidYMid meet');
  const t = [
    [-5, -3, 30, 0],
    [3, -5, -40, 1],
    [5, 3, 60, 2],
    [-3, 5, -20, 3],
    [0, 0, 80, 4],
  ];
  return ince(`<svg viewBox="-14 -14 28 28" aria-hidden="true"><circle r="12" fill="#fff" stroke="${K}" stroke-width="1.6"/>${t.map(([x, y, a, r]) => serpintiTanesi(x, y, a, r)).join('')}<circle r="11" fill="none" stroke="#FF3B4E" stroke-width="2.6"/><path d="M-7.8-7.8L7.8 7.8" stroke="#FF3B4E" stroke-width="2.6" stroke-linecap="round"/></svg>`);
})();
/** Serpinti seviyesi simgesi (balonda, yanında: 1 ya da 3 tane) */
export function serpintiIkon(seviye: number): string {
  const t = seviye >= 2 ? [[-6, 2, 30, 0], [0, -4, -40, 1], [6, 2, 60, 2]] : [[0, 0, 30, 0]];
  return `<svg viewBox="-12 -12 24 24" aria-hidden="true">${t.map(([x, y, a, r]) => serpintiTanesi(x, y, a, r).replace('width="2.6" height="6.6"', 'width="3.4" height="9"')).join('')}</svg>`;
}

// ---------------------------------------------------------------- istasyonlar
/** Kurabiye kalıbı: şeklin kalın renkli kenarı (iç boş), parlak plastik; panoda çivisine asılı */
const KALIP_RENK: Record<string, string> = { yuvarlak: '#FF6F7D', yildiz: '#FFC22E', kalp: '#FF7EB6', ay: '#8E7CFF', kapkek: '#4FC3B0' };
function kalipKod(k: Sekil | 'kapkek'): string {
  if (k === 'kapkek') {
    // kapkek kâğıtları: üst üste üç kâğıt kalıp
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><ellipse cx="50" cy="93" rx="32" ry="5" fill="${K}" opacity=".18"/><path d="M16 36L84 36L74 88L26 88Z" fill="#fff" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><g stroke="${KALIP_RENK.kapkek}" stroke-width="6"><path d="M29 39L35 85M43 39L46 85M57 39L54 85M71 39L65 85"/></g><path d="M62 37L84 36L74 88L60 88Z" fill="${K}" opacity=".12"/><path d="M16 36L84 36L74 88L26 88Z" fill="none" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><path d="M12 36Q18 42 24 36Q30 42 36 36Q42 42 50 36Q58 42 64 36Q70 42 76 36Q82 42 88 36" fill="#fff" stroke="${K}" stroke-width="4.5" stroke-linejoin="round"/><path d="M14 26Q20 32 26 26Q32 32 38 26Q44 32 50 26Q56 32 62 26Q68 32 74 26Q80 32 86 26" fill="none" stroke="${K}" stroke-width="4" stroke-linejoin="round" opacity=".55"/><path d="M24 44L28 70" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/></svg>`;
  }
  const yol = SEKIL_YOLU[k];
  return `<svg viewBox="-6 -6 112 112" aria-hidden="true"><path d="${yol}" fill="none" stroke="${K}" stroke-opacity=".18" stroke-width="16" stroke-linejoin="round" transform="translate(4 8)"/><path d="${yol}" fill="none" stroke="${K}" stroke-width="17" stroke-linejoin="round"/><path d="${yol}" fill="none" stroke="${KALIP_RENK[k]}" stroke-width="9.5" stroke-linejoin="round"/><path d="${yol}" fill="none" stroke="${K}" stroke-opacity=".18" stroke-width="4" stroke-linejoin="round" transform="translate(1.5 2.5)"/><path d="${yol}" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="3" stroke-linecap="round" stroke-dasharray="12 46" stroke-linejoin="round"/></svg>`;
}

/** Hamur kâsesi: büyük mavi seramik kâse; içinde kabaran hamur (.ps-hamur-kabarik), tahta kaşık, un tozu */
const HAMUR_KABI_KOD = ince(`<svg viewBox="0 0 160 132" aria-hidden="true" overflow="visible"><ellipse cx="80" cy="125" rx="62" ry="7" fill="${K}" opacity=".2"/><ellipse cx="80" cy="54" rx="70" ry="17" fill="#2B86C6" stroke="${K}" stroke-width="5"/><path d="M112 34L146 2" stroke="${K}" stroke-width="13" stroke-linecap="round"/><path d="M112 34L146 2" stroke="#E7A862" stroke-width="6.5" stroke-linecap="round"/><path d="M140 7L145 3" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/><g class="ps-hamur-kabarik"><path d="M18 60C14 42 34 26 56 28C64 13 96 11 104 26C126 22 148 40 142 60Z" fill="#FBF0DC" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><path d="M104 27C120 26 138 38 140 54C128 46 116 40 104 40Z" fill="${K}" opacity=".08"/><path d="M34 42C40 34 50 31 58 32" fill="none" stroke="#fff" stroke-width="5.5" stroke-linecap="round"/><path d="M70 22C76 18 84 17 90 19" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/><g fill="#EFD9B4"><ellipse cx="86" cy="42" rx="5" ry="3"/><ellipse cx="112" cy="48" rx="4" ry="2.4"/><ellipse cx="54" cy="50" rx="3.5" ry="2.2"/></g></g><path d="M10 56A70 17 0 0 0 150 56C150 96 120 122 80 122C40 122 10 96 10 56Z" fill="#59B7F0" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><path d="M14 74C30 82 130 82 146 74" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/><path d="M14 74C30 82 130 82 146 74" fill="none" stroke="#FF8CC0" stroke-width="3.5" stroke-linecap="round"/><g fill="#fff" opacity=".9"><circle cx="40" cy="96" r="4"/><circle cx="62" cy="104" r="4"/><circle cx="88" cy="105" r="4"/><circle cx="114" cy="98" r="4"/><circle cx="132" cy="88" r="3.5"/></g><path d="M112 84C126 82 140 74 146 64C146 92 126 114 98 120C110 108 114 96 112 84Z" fill="${K}" opacity=".14"/><path d="M22 82C26 98 38 110 54 115" fill="none" stroke="#fff" stroke-width="6" stroke-opacity=".55" stroke-linecap="round"/><path d="M10 56A70 17 0 0 0 150 56" fill="none" stroke="${K}" stroke-width="5"/><path d="M24 60A62 11 0 0 0 66 70" fill="none" stroke="#B9E4FF" stroke-width="4" stroke-linecap="round"/><g fill="#fff"><circle cx="24" cy="18" r="2.6" opacity=".9"/><circle cx="16" cy="30" r="1.8" opacity=".8"/><circle cx="150" cy="40" r="2.2" opacity=".8"/></g></svg>`);

/** Krema torbası: krema renginde sıkma torbası, ucu metal huni, tahta tutacağın deliğine takılı */
function kremaKod(r: Renk): string {
  const c = RENK_KODU[r];
  return `<svg viewBox="0 0 80 132" aria-hidden="true" overflow="visible"><ellipse cx="40" cy="127" rx="28" ry="4.5" fill="${K}" opacity=".2"/><path d="M31 84H49L45 102H35Z" fill="#D5DEE6" stroke="${K}" stroke-width="4" stroke-linejoin="round"/><path d="M36 87L38 100M44 87L42 100" stroke="#9AA9B6" stroke-width="2"/><path d="M10 100H70L66 124H14Z" fill="#E7A862" stroke="${K}" stroke-width="4.5" stroke-linejoin="round"/><path d="M52 100H70L66 124H54Z" fill="${K}" opacity=".14"/><ellipse cx="40" cy="100" rx="30" ry="5" fill="#F4C287" stroke="${K}" stroke-width="4"/><ellipse cx="40" cy="100" rx="11" ry="2.6" fill="${K}" opacity=".55"/><path d="M14 106H60" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/><path d="M11 32C11 22 69 22 69 32L50 88H30Z" fill="${c}" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><path d="M50 30C60 31 66 32 68 34L50 86L44 86Z" fill="${K}" opacity=".14"/><path d="M11 32C11 22 69 22 69 32L65 44C56 39 24 39 15 44Z" fill="#fff" stroke="${K}" stroke-width="4.5" stroke-linejoin="round"/><path d="M29 24C29 13 36 6 40 4C44 6 51 13 51 24Z" fill="#fff" stroke="${K}" stroke-width="4" stroke-linejoin="round"/><rect x="29" y="17" width="22" height="7" rx="3.5" fill="${c}" stroke="${K}" stroke-width="3"/><path d="M21 50L33 80" stroke="#fff" stroke-width="5.5" stroke-linecap="round" stroke-opacity=".6"/><circle cx="20" cy="38" r="2.4" fill="#fff" opacity=".9"/><path d="M57 52C55 58 53 62 52 64" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".4"/><circle cx="58" cy="99" r="3.4" fill="${c}" stroke="${K}" stroke-width="2"/></svg>`;
}

/** Süsün kavanoz kapağı rengi */
const SUS_RENK: Record<Sus, string> = { cilek: '#FF5A7A', havuc: '#FF8A2B', bal: '#FFB321', muz: '#FFD84A', cikolata: '#A0643A' };
/** Süs kavanozu: cam kavanoz, içi süs dolu, ağzından taşıyor (üstteki yığın .ps-kap-ust) */
function susKabiKod(s: Sus, adet = 5): string {
  const ic: [number, number][] = [
    [32, 94],
    [50, 96],
    [68, 93],
    [40, 80],
    [60, 79],
    [30, 66],
    [50, 64],
    [70, 66],
    [41, 52],
    [60, 52],
  ];
  const ust: [number, number][] = [
    [34, 28],
    [50, 20],
    [66, 28],
    [42, 32],
    [58, 32],
  ];
  const icler = ic.map(([x, y]) => susSvg(s, x, y, 24)).join('');
  const yigin = ust
    .slice(0, adet)
    .map(([x, y]) => susSvg(s, x, y, 27))
    .join('');
  const kr = SUS_RENK[s];
  return `<svg viewBox="0 0 100 116" aria-hidden="true" overflow="visible"><ellipse cx="50" cy="111" rx="40" ry="5" fill="${K}" opacity=".2"/><g class="ps-kap-ic">${icler}</g><path d="M17 46C17 40 21 36 27 36H73C79 36 83 40 83 46V96C83 104 77 108 69 108H31C23 108 17 104 17 96Z" fill="#DDF3FF" fill-opacity=".34" stroke="${K}" stroke-width="5"/><path d="M68 40C76 42 80 46 80 54V94C80 101 76 105 70 106C74 100 75 94 75 86V54C75 48 72 43 68 40Z" fill="#7FB8D8" opacity=".35"/><path d="M26 48V94" stroke="#fff" stroke-width="6.5" stroke-linecap="round" opacity=".8"/><path d="M34 46V54" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/><rect x="21" y="29" width="58" height="13" rx="6.5" fill="${kr}" stroke="${K}" stroke-width="4.5"/><path d="M27 33H58" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/><g class="ps-kap-ust">${yigin}</g></svg>`;
}

/** Fırın tepsisi (metal, kenarlı, içinde pişirme kâğıdı) */
const TEPSI_KOD = ince(`<svg viewBox="0 0 200 80" preserveAspectRatio="none" aria-hidden="true"><ellipse cx="100" cy="72" rx="94" ry="6" fill="${K}" opacity=".2"/><rect x="0" y="34" width="20" height="16" rx="6" fill="#B9C6D2" stroke="${K}" stroke-width="4.5"/><rect x="180" y="34" width="20" height="16" rx="6" fill="#B9C6D2" stroke="${K}" stroke-width="4.5"/><path d="M10 28H190L180 66H20Z" fill="#B9C6D2" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><path d="M22 34H178L171 60H29Z" fill="#FFF3DC" stroke="#E2C8A0" stroke-width="2.5" stroke-linejoin="round"/><path d="M150 34H178L171 60H146Z" fill="${K}" opacity=".06"/><path d="M18 31H182" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".85"/><path d="M10 28H190" stroke="${K}" stroke-width="5" stroke-linecap="round"/></svg>`);

/** Servis tabağı: büyük beyaz pasta tabağı, pembe noktalı kenar */
const TABAK_KOD = ince(`<svg viewBox="0 0 220 100" preserveAspectRatio="none" aria-hidden="true"><ellipse cx="110" cy="88" rx="100" ry="9" fill="${K}" opacity=".2"/><path d="M8 54C8 74 52 84 110 84C168 84 212 74 212 54" fill="#E9F0F6" stroke="${K}" stroke-width="5"/><ellipse cx="110" cy="52" rx="104" ry="32" fill="#fff" stroke="${K}" stroke-width="5"/><ellipse cx="110" cy="52" rx="92" ry="26" fill="none" stroke="#FF9CC8" stroke-width="6" stroke-dasharray="2 13" stroke-linecap="round"/><ellipse cx="110" cy="54" rx="76" ry="19" fill="#FFF4F8" stroke="#F3D3E0" stroke-width="2.5"/><path d="M28 42C44 30 70 24 96 23" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M150 76C172 74 192 68 202 60" fill="none" stroke="${K}" stroke-opacity=".12" stroke-width="5" stroke-linecap="round"/></svg>`);

/** Kasa (eski usul yazar kasa): turkuaz gövde, tuşlar, ekran, pembe çekmece, yan kol */
const KASA_KOD = ince(`<svg viewBox="0 0 120 112" aria-hidden="true" overflow="visible"><ellipse cx="60" cy="106" rx="52" ry="6" fill="${K}" opacity=".2"/><path d="M104 56H116V38" fill="none" stroke="${K}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="116" cy="34" r="6" fill="#FF5A7A" stroke="${K}" stroke-width="3.5"/><rect x="60" y="6" width="46" height="30" rx="7" fill="#fff" stroke="${K}" stroke-width="4.5"/><rect x="66" y="12" width="34" height="17" rx="3" fill="#2E4A44"/><g fill="#FFD84A"><rect x="70" y="16" width="5" height="9" rx="1.5"/><rect x="78" y="16" width="5" height="9" rx="1.5"/><rect x="86" y="16" width="5" height="9" rx="1.5"/></g><path d="M14 46C14 40 18 36 24 36H96C102 36 106 40 106 46V76H14Z" fill="#4FC3B0" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><path d="M80 38H96C102 38 104 42 104 46V74H84Z" fill="${K}" opacity=".12"/><g fill="#fff" stroke="${K}" stroke-width="2.6"><rect x="22" y="44" width="13" height="9" rx="3"/><rect x="39" y="44" width="13" height="9" rx="3"/><rect x="56" y="44" width="13" height="9" rx="3"/><rect x="22" y="58" width="13" height="9" rx="3"/><rect x="39" y="58" width="13" height="9" rx="3"/><rect x="56" y="58" width="13" height="9" rx="3"/></g><rect x="74" y="44" width="22" height="23" rx="5" fill="#FF8CC0" stroke="${K}" stroke-width="2.6"/><path d="M20 42C22 40 26 39 30 39" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".7"/><path d="M6 76H114V94C114 99 110 102 105 102H15C10 102 6 99 6 94Z" fill="#FF8CC0" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><path d="M90 78H112V94C112 98 108 100 104 100H92Z" fill="${K}" opacity=".12"/><rect x="48" y="84" width="24" height="8" rx="4" fill="#FFD84A" stroke="${K}" stroke-width="3"/><path d="M12 82H40" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/></svg>`);

/**
 * Arka duvar rafı: tahta raf, üstünde pasta standı, şeker kavanozu, kapkek ve makaronlar (yalnız süs; tıklanmaz).
 * viewBox 240×100.
 */
const RAF_SUSLERI_KOD = ince(`<svg viewBox="0 0 240 100" aria-hidden="true" overflow="visible"><g fill="#C98A4B" stroke="${K}" stroke-width="4" stroke-linejoin="round"><path d="M22 90L22 100L40 90Z"/><path d="M218 90L218 100L200 90Z"/></g><rect x="4" y="80" width="232" height="12" rx="4" fill="#E7A862" stroke="${K}" stroke-width="4.5"/><path d="M10 84H230" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".5"/><path d="M44 80L48 66H56L60 80Z" fill="#fff" stroke="${K}" stroke-width="4" stroke-linejoin="round"/><ellipse cx="52" cy="64" rx="34" ry="6" fill="#fff" stroke="${K}" stroke-width="4"/><rect x="26" y="28" width="52" height="34" rx="9" fill="#FF9CC8" stroke="${K}" stroke-width="4.5"/><path d="M60 30H70C75 30 78 33 78 38V58C78 60 76 62 74 62H64Z" fill="${K}" opacity=".12"/><path d="M26 42H78" stroke="#fff" stroke-width="5"/><path d="M26 36C26 30 30 27 36 27H68C74 27 78 30 78 36C78 42 74 44 72 40C70 46 64 46 62 40C60 47 54 47 52 41C50 47 44 47 42 41C40 46 34 46 32 40C30 44 26 42 26 36Z" fill="#fff" stroke="${K}" stroke-width="4" stroke-linejoin="round"/><circle cx="52" cy="20" r="7" fill="#FF3B4E" stroke="${K}" stroke-width="3.5"/><path d="M52 13C53 8 56 6 59 5" fill="none" stroke="${K}" stroke-width="3" stroke-linecap="round"/><circle cx="49.5" cy="18" r="2" fill="#fff"/><path d="M98 44C98 40 101 38 105 38H131C135 38 138 40 138 44V76C138 79 135 81 131 81H105C101 81 98 79 98 76Z" fill="#DDF3FF" fill-opacity=".45" stroke="${K}" stroke-width="4"/><g><circle cx="108" cy="70" r="3" fill="#FF5A7A"/><circle cx="118" cy="74" r="3" fill="#6CC4FF"/><circle cx="128" cy="69" r="3" fill="#FFD84A"/><circle cx="112" cy="60" r="3" fill="#7FE0C4"/><circle cx="125" cy="58" r="3" fill="#B98BFF"/><circle cx="118" cy="50" r="3" fill="#FF8A2B"/><circle cx="108" cy="49" r="3" fill="#FF5A7A"/><circle cx="129" cy="47" r="3" fill="#6CC4FF"/></g><path d="M104 46V74" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".8"/><rect x="100" y="30" width="36" height="9" rx="4.5" fill="#FF8CC0" stroke="${K}" stroke-width="3.5"/><g transform="translate(146 30) scale(.5)">${kapkek({ urun: 'kapkek', sekil: null, hal: 'pismis', yigin: ['pembe', 'pembe'], susler: ['cilek'], hamur: '#F3B54A', golge: false })}</g><g stroke="${K}" stroke-width="3.5"><ellipse cx="216" cy="74" rx="16" ry="6" fill="#B98BFF"/><ellipse cx="216" cy="66" rx="15" ry="5" fill="#fff"/><ellipse cx="216" cy="60" rx="16" ry="6" fill="#7FE0C4"/><ellipse cx="216" cy="52" rx="15" ry="5" fill="#fff"/><ellipse cx="216" cy="46" rx="16" ry="6" fill="#FFB0CF"/></g></svg>`);

/** Kapı / dolap kapağı deseni (tezgâhın ön paneli; arkada boya rengi görünür): CSS background-image için */
export const KAPAK_DESENI = `url("data:image/svg+xml,${encodeURIComponent(ince(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 64"><rect x="8" y="6" width="204" height="52" rx="12" fill="#FFF6EC" stroke="${K}" stroke-width="4"/><rect x="20" y="15" width="180" height="34" rx="8" fill="none" stroke="${K}" stroke-opacity=".22" stroke-width="3"/><path d="M110 26C106 22 100 22 100 28C100 32 105 35 110 39C115 35 120 32 120 28C120 22 114 22 110 26Z" fill="#FF8CC0" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"/><path d="M16 12H60" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>`))}")`;

/** Jeton: altın para, ortasında yıldız */
const JETON_KOD = ince(`<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="54" r="40" fill="#C98A12"/><circle cx="50" cy="48" r="40" fill="#FFD23F" stroke="${K}" stroke-width="6"/><circle cx="50" cy="48" r="29" fill="none" stroke="#F0A818" stroke-width="5"/><path d="${yildizYolu(50, 50, 20, 9)}" fill="#FFB300" stroke="#C47F00" stroke-width="3" stroke-linejoin="round"/><path d="M27 30C33 22 41 18 50 18" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-opacity=".75"/></svg>`);

/** Kumbara (pembe domuzcuk) */
const KUMBARA_KOD = ince(`<svg viewBox="0 0 140 110" aria-hidden="true"><ellipse cx="70" cy="104" rx="50" ry="5" fill="${K}" opacity=".2"/><g fill="#FF8CC0" stroke="${K}" stroke-width="5" stroke-linejoin="round"><rect x="34" y="78" width="16" height="22" rx="6"/><rect x="88" y="78" width="16" height="22" rx="6"/><path d="M40 30L46 12L60 26Z"/><path d="M16 60C16 36 40 22 70 22C102 22 124 38 124 60C124 82 102 94 70 94C40 94 16 84 16 60Z"/></g><path d="M118 54C128 50 132 44 128 40" fill="none" stroke="${K}" stroke-width="4" stroke-linecap="round"/><rect x="58" y="26" width="26" height="7" rx="3.5" fill="${K}"/><g><ellipse cx="22" cy="62" rx="11" ry="13" fill="#FFB3D6" stroke="${K}" stroke-width="4.5"/><ellipse cx="19" cy="59" rx="2" ry="3" fill="${K}"/><ellipse cx="25" cy="59" rx="2" ry="3" fill="${K}"/></g><circle cx="42" cy="48" r="5" fill="${K}"/><circle cx="43.5" cy="46.5" r="1.6" fill="#fff"/><path d="M60 40C70 34 86 34 96 40" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-opacity=".6"/></svg>`);

/** Pastacı şapkası (dükkân rafında tek başına) */
const SAPKA_KOD = ince(`<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M24 62C10 60 6 44 16 36C20 22 36 20 42 26C46 14 64 14 66 26C74 20 90 26 86 40C96 46 90 62 76 62Z" fill="#fff" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><path d="M26 58H74V82C74 86 71 88 67 88H33C29 88 26 86 26 82Z" fill="#fff" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><path d="M26 66H74" stroke="#FF8CC0" stroke-width="6"/><path d="M30 34C32 28 38 25 44 26" fill="none" stroke="#E6EEF5" stroke-width="5" stroke-linecap="round"/></svg>`);

/**
 * Mino'nun kafasına takılan pastacı şapkası (Mino'nun çizim koordinatı: viewBox 344 140 1360 1790; kafanın tepesi
 * ~y 290, ortası x 1024). Kulakların arasına oturur, hafif yana yatık.
 */
const MINO_SAPKA_KOD = ince(`<g class="ps-mino-sapka" transform="rotate(-6 1024 330)"><path d="M800 330C700 330 660 220 740 170C740 70 860 40 920 100C950 0 1100 0 1120 100C1180 40 1310 80 1300 180C1380 230 1340 330 1250 330Z" fill="#fff" stroke="${K}" stroke-width="20" stroke-linejoin="round"/><path d="M790 300H1258V380C1258 395 1246 404 1232 404H816C802 404 790 395 790 380Z" fill="#fff" stroke="${K}" stroke-width="20" stroke-linejoin="round"/><path d="M790 328H1258" stroke="#FF8CC0" stroke-width="26"/><path d="M800 180C820 130 870 110 920 120" fill="none" stroke="#E4ECF4" stroke-width="22" stroke-linecap="round"/></g>`);

/**
 * Kino'nun unlu yüzü (Kino iskeletinin 2048'lik koordinatı; kafa katmanına eklenir: kafa dönünce un da döner).
 * Burnun üstünde ve yanakta un lekeleri; "çilekli ağız": ağzın kenarında kırmızı çilek suyu (aşırınca görünür).
 */
export const KINO_UN = `<g class="ps-kino-un" opacity=".92"><path d="M1060 760C1100 720 1180 730 1196 772C1214 816 1150 840 1112 826C1070 840 1030 800 1060 760Z" fill="#fff"/><circle cx="1210" cy="740" r="14" fill="#fff"/><circle cx="1036" cy="740" r="10" fill="#fff"/><path d="M700 900C730 868 790 872 800 904C812 940 760 952 734 940C706 946 684 922 700 900Z" fill="#fff"/><circle cx="820" cy="890" r="10" fill="#fff"/><path d="M880 470C910 446 960 452 966 478C972 504 930 512 908 504C884 508 866 490 880 470Z" fill="#fff" opacity=".9"/></g>`;
export const KINO_CILEK_AGIZ = `<g class="ps-kino-cilek" opacity="0"><path d="M880 1010C905 1000 930 1004 950 1016C965 1030 940 1046 910 1040C885 1036 866 1022 880 1010Z" fill="#FF4D5E"/><circle cx="975" cy="1028" r="12" fill="#FF4D5E"/><circle cx="866" cy="1030" r="9" fill="#FF4D5E"/></g>`;

/** Okul binası (Gün 3: okul önü; uzaktaki tepelerin önünde) */
const OKUL_KOD = ince(`<svg viewBox="0 0 520 300" aria-hidden="true"><ellipse cx="260" cy="292" rx="250" ry="10" fill="${K}" opacity=".12"/><rect x="250" y="16" width="5" height="60" fill="${K}"/><path d="M255 18H300L292 30L300 42H255Z" fill="#FF5A5F" stroke="${K}" stroke-width="4" stroke-linejoin="round"/><path d="M60 120L260 52L460 120Z" fill="#FF6F5E" stroke="${K}" stroke-width="7" stroke-linejoin="round"/><rect x="74" y="118" width="372" height="170" fill="#FFE9B8" stroke="${K}" stroke-width="7"/><rect x="214" y="80" width="92" height="50" fill="#FFE9B8" stroke="${K}" stroke-width="6"/><circle cx="260" cy="104" r="17" fill="#fff" stroke="${K}" stroke-width="5"/><path d="M260 92V104L268 110" stroke="${K}" stroke-width="4" stroke-linecap="round" fill="none"/><g fill="#8ED3FF" stroke="${K}" stroke-width="5"><rect x="100" y="146" width="56" height="46" rx="6"/><rect x="364" y="146" width="56" height="46" rx="6"/><rect x="100" y="214" width="56" height="46" rx="6"/><rect x="364" y="214" width="56" height="46" rx="6"/></g><g stroke="#fff" stroke-width="4" stroke-opacity=".8"><path d="M108 156L122 150M372 156L386 150M108 224L122 218M372 224L386 218"/></g><path d="M222 288V196C222 176 240 166 260 166C280 166 298 176 298 196V288Z" fill="#5DBE3F" stroke="${K}" stroke-width="6" stroke-linejoin="round"/><path d="M260 168V288" stroke="${K}" stroke-width="5"/><circle cx="248" cy="232" r="4" fill="#FFD84A"/><circle cx="272" cy="232" r="4" fill="#FFD84A"/><g fill="#FF8CC0" stroke="${K}" stroke-width="3"><circle cx="180" cy="140" r="7"/><circle cx="340" cy="140" r="7"/></g></svg>`);

/** Otobüsün parçaları (kod çizimi ve resimli otobüs ortak): kapak açılınca görünen iç, dışarı kayan tezgâh, tenteye dönen şerit */
const OB_ACIK = `<g class="ps-ob-acik"><rect x="148" y="78" width="352" height="166" rx="12" fill="#FFE6C2" stroke="${K}" stroke-width="7"/><rect x="160" y="92" width="328" height="18" rx="6" fill="#FFD29A"/><g fill="#FFB0CF" stroke="${K}" stroke-width="3"><circle cx="190" cy="100" r="7"/><circle cx="458" cy="100" r="7"/></g></g>`;
const OB_TEZGAH = `<g class="ps-ob-tezgah"><path d="M134 236H514L526 264H122Z" fill="#E0A060" stroke="${K}" stroke-width="7" stroke-linejoin="round"/><path d="M140 246H508" stroke="#fff" stroke-width="5" stroke-opacity=".5" stroke-linecap="round"/></g>`;
const OB_TENTE = `<g class="ps-ob-tente"><path d="M142 72H506V92C506 104 494 110 482 104C470 110 458 110 446 104C434 110 422 110 410 104C398 110 386 110 374 104C362 110 350 110 338 104C326 110 314 110 302 104C290 110 278 110 266 104C254 110 242 110 230 104C218 110 206 110 194 104C182 110 170 110 158 104C150 108 142 102 142 92Z" fill="#fff" stroke="${K}" stroke-width="6" stroke-linejoin="round"/><g fill="#FF5A7A"><path d="M178 74H214V104C206 108 194 110 186 104L178 106Z"/><path d="M250 74H286V104C278 108 266 110 258 104L250 106Z"/><path d="M322 74H358V104C350 108 338 110 330 104L322 106Z"/><path d="M394 74H430V104C422 108 410 110 402 104L394 106Z"/><path d="M466 74H502V100C494 106 482 108 474 104L466 106Z"/></g></g>`;
/** Otobüs (yandan; sağa bakar). Kapak açılınca tente olur, tezgâh dışarı kayar. Boya: CSS --boya / --boya-koyu */
const OTOBUS_KOD = ince(`<svg class="ps-otobus-svg" viewBox="0 0 640 420" aria-hidden="true" overflow="visible">
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
${OB_ACIK}
</g>
${OB_TEZGAH}
<g class="ps-ob-kapak"><g class="ps-ob-panel"><rect x="142" y="72" width="364" height="178" rx="14" style="fill:var(--boya,#FF8CC0)" stroke="${K}" stroke-width="7"/><path d="M160 92H488" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-opacity=".5"/><rect x="290" y="210" width="68" height="16" rx="8" fill="#fff" stroke="${K}" stroke-width="5"/>
<g transform="translate(324 162)"><circle r="44" fill="#F3B54A" stroke="${K}" stroke-width="6"/><circle r="34" fill="#FF8CC0" stroke="${K}" stroke-width="4"/><g stroke-width="5" stroke-linecap="round"><path d="M-16-12l6-4" stroke="#fff"/><path d="M10-18l7 3" stroke="#6CC4FF"/><path d="M-20 8l3 7" stroke="#FFD84A"/><path d="M14 10l-6 5" stroke="#fff"/><path d="M-2 20l7 2" stroke="#7FE0C4"/><path d="M0-4l4 4" stroke="#FFD84A"/></g><path d="M-26-14C-22-24-12-30-2-31" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-opacity=".7"/></g>
<g stroke-width="7" stroke-linecap="round"><path d="M188 140l10-6" stroke="#FFD84A"/><path d="M212 196l8 6" stroke="#6CC4FF"/><path d="M450 136l-8 7" stroke="#fff"/><path d="M432 196l10 2" stroke="#FFD84A"/><path d="M240 120l2 9" stroke="#fff"/><path d="M406 118l6 6" stroke="#7FE0C4"/></g></g>
${OB_TENTE}</g>
<g class="ps-ob-teker" data-teker="arka"><circle cx="150" cy="334" r="46" fill="#4A3A3A" stroke="${K}" stroke-width="7"/><circle cx="150" cy="334" r="22" fill="#E8EEF4" stroke="${K}" stroke-width="5"/><path d="M150 316V352M132 334H168" stroke="${K}" stroke-width="5" stroke-linecap="round"/></g>
<g class="ps-ob-teker" data-teker="on"><circle cx="500" cy="334" r="46" fill="#4A3A3A" stroke="${K}" stroke-width="7"/><circle cx="500" cy="334" r="22" fill="#E8EEF4" stroke="${K}" stroke-width="5"/><path d="M500 316V352M482 334H518" stroke="${K}" stroke-width="5" stroke-linecap="round"/></g>
</svg>`);

/**
 * Otobüs görselinde (assets/pasta/otobus-*.webp, 640:420 tuval; resimler.ts → YUVA.otobus) hareketli parçaların yeri
 * (kod çiziminin yerleri; çizim başka yerdeyse burası ölçülür): yan kapak (açılınca üstten katlanıp kalkar, ardından
 * kodun tentesi, içi ve tezgâhı görünür) ve tekerlekler (giriş sırasında görselin kendi tekerleği döner).
 */
export const OTOBUS_YERI = {
  kapak: { x: 142, y: 72, w: 364, h: 178 },
  teker: [
    { ad: 'arka', x: 150, y: 334, r: 50 },
    { ad: 'on', x: 500, y: 334, r: 50 },
  ],
  /**
   * Ayrı çizilmiş tekerlek (assets/pasta/teker-*.webp: kare, tekerlek tuvali dolduruyor) otobüs görselinin kendi
   * tekerleğinin tam üstüne oturur: merkezler görselden ölçüldü (gri lastik ~43 + kontur), yarıçap eskisini örter.
   * Lastik yerinde durur (parlaması üstte kalsın), jant (yarıçapın `jant` oranı içi) döner.
   */
  cizimTeker: [
    { ad: 'arka', x: 150.5, y: 333, r: 48 },
    { ad: 'on', x: 499.2, y: 333, r: 48 },
  ],
  jant: 0.58,
};

/** Rengin 0-1 kanalları */
function kanallar(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
const PARLAKLIK = [0.2126, 0.7152, 0.0722] as const;

/**
 * Pembeyi hedef renge boyayan renk matrisi (feColorMatrix values, 20 sayı): pikselin parlaklığı korunur; pembe gövde
 * tam hedef renk olur, gölgeli pembe aynı oranda koyu hedef rengi, parlama açık hedef rengi (renk tonu döndürmek
 * sarıyı turuncu, naneyi koyu yeşil yapıyordu).
 */
export function boyaMatrisi(hedef: string, taban: string = BOYA.pembe.govde): string {
  const t = kanallar(taban);
  const lt = t[0] * PARLAKLIK[0] + t[1] * PARLAKLIK[1] + t[2] * PARLAKLIK[2];
  const satir = (c: number) => PARLAKLIK.map((w) => +((c / lt) * w).toFixed(4)).join(' ') + ' 0 0';
  const [r, g, b] = kanallar(hedef);
  return `${satir(r)} ${satir(g)} ${satir(b)} 0 0 0 1 0`;
}

/**
 * Pembe maske (iki feColorMatrix alfa satırı, çarpılır): kırmızı > yeşil VE mavi > yeşil. Kırmızı, turuncu, sarı
 * (mavi ≤ yeşil), cam ve süs mavisi (kırmızı < yeşil), beyaz, kahve kontur maskenin dışında kalır.
 */
export const PEMBE_MASKE = ['0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 4 -4 0 0 -0.4', '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -6 6 0 -0.2'] as const;

/**
 * Otobüs görselinin boyası (dükkândan alınan nane, limon): yalnız pembe gövde boyanır (PEMBE_MASKE); cam, tekerlek,
 * beyaz şeritler olduğu gibi kalır. Pembe (görselin kendi rengi) filtresiz.
 */
function boyaFiltreleri(): string {
  return Object.entries(BOYA)
    .filter(([ad]) => ad !== 'pembe')
    .map(
      ([ad, b]) =>
        `<filter id="ps-boya-${ad}" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%">` +
        `<feColorMatrix in="SourceGraphic" type="matrix" values="${boyaMatrisi(b.govde)}" result="d"/>` +
        `<feColorMatrix in="SourceGraphic" type="matrix" values="${PEMBE_MASKE[0]}" result="m1"/>` +
        `<feColorMatrix in="SourceGraphic" type="matrix" values="${PEMBE_MASKE[1]}" result="m2"/>` +
        `<feComposite in="m1" in2="m2" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="m"/>` +
        `<feComposite in="d" in2="m" operator="in" result="b"/>` +
        `<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="b"/></feMerge></filter>`,
    )
    .join('');
}

/** Görselli otobüsün boya filtresi (CSS --boya-filtre); pembe: filtresiz */
export const boyaFiltresi = (ad: string) => (ad in BOYA && ad !== 'pembe' ? `url(#ps-boya-${ad})` : 'none');

/**
 * Otobüs: görsel varsa görsel (kapalı otobüs), yoksa kod çizimi. Görselli otobüste aynı sınıflar ve yerler: gövde
 * (.ps-ob-govde, korna zıplaması), yan kapak (.ps-ob-panel: görselin kapak bölgesi, açılınca katlanır), tente / iç /
 * tezgâh (kod parçaları, açılınca çıkar), tekerlekler (.ps-ob-teker: görselin tekerleği, girişte döner).
 */
export function otobusSvg(url: string | null, tekerUrl: string | null = null): string {
  if (!url) return OTOBUS_KOD;
  const { kapak: k, teker, cizimTeker, jant } = OTOBUS_YERI;
  const img = (ek = '') => `<image class="ps-ob-boyali" href="${url}" width="640" height="420" preserveAspectRatio="xMidYMax meet"${ek}/>`;
  const kirp =
    `<clipPath id="ps-ob-kapak-kirp" clipPathUnits="userSpaceOnUse"><rect x="${k.x}" y="${k.y}" width="${k.w}" height="${k.h}"/></clipPath>` +
    (tekerUrl ? cizimTeker.map((t) => ({ ...t, r: +(t.r * jant).toFixed(2) })) : teker)
      .map((t) => `<clipPath id="ps-ob-teker-${t.ad}" clipPathUnits="userSpaceOnUse"><circle cx="${t.x}" cy="${t.y}" r="${t.r}"/></clipPath>`)
      .join('');
  // Çizilmiş tekerlek varsa: altta duran lastik (tam görsel), üstünde dönen jant (aynı görselin ortası).
  // Yoksa otobüs görselinin kendi tekerleği kırpılıp döner.
  const tekerler = tekerUrl
    ? cizimTeker
        .map((t) => {
          const resimT = (ek = '') => `<image href="${tekerUrl}" x="${t.x - t.r}" y="${t.y - t.r}" width="${t.r * 2}" height="${t.r * 2}"${ek}/>`;
          return (
            `<g class="ps-ob-lastik" data-teker="${t.ad}">${resimT()}</g>` +
            `<g class="ps-ob-teker" data-teker="${t.ad}" style="transform-box:view-box;transform-origin:${t.x}px ${t.y}px">${resimT(` clip-path="url(#ps-ob-teker-${t.ad})"`)}</g>`
          );
        })
        .join('')
    : teker
        .map((t) => `<g class="ps-ob-teker" data-teker="${t.ad}" style="transform-box:view-box;transform-origin:${t.x}px ${t.y}px">${img(` clip-path="url(#ps-ob-teker-${t.ad})"`)}</g>`)
        .join('');
  return ince(
    `<svg class="ps-otobus-svg ps-otobus-resimli" viewBox="0 0 640 420" aria-hidden="true" overflow="visible"><defs>${kirp}${boyaFiltreleri()}</defs>` +
      `<ellipse class="ps-ob-golge" cx="320" cy="392" rx="300" ry="16" fill="${K}" opacity=".2"/>` +
      `<g class="ps-ob-govde">${img()}${OB_ACIK}</g>${OB_TEZGAH}` +
      `<g class="ps-ob-kapak"><g class="ps-ob-panel" style="transform-box:view-box;transform-origin:${k.x + k.w / 2}px ${k.y}px">${img(' clip-path="url(#ps-ob-kapak-kirp)"')}</g>${OB_TENTE}</g>` +
      `${tekerler}</svg>`,
  );
}

/** Akşamın kapanışında üstteki tabela (sevimli bulut) ve küçük yıldızlar için yıldız yolu */
export const YILDIZ_YOLU = yildizYolu(50, 52, 44, 21);

/** Kalp (beğeni / sabır kalbi çerçevesi) */
export const KALP_YOLU = 'M20 34C8 26 2 19 2 11.5A8.7 8.7 0 0 1 20 8A8.7 8.7 0 0 1 38 11.5C38 19 32 26 20 34Z';
const KALP_KOD = ince(`<svg viewBox="0 0 40 36" aria-hidden="true"><path d="${KALP_YOLU}" fill="#FF5A7A" stroke="${K}" stroke-width="3.5" stroke-linejoin="round"/><ellipse cx="11" cy="10" rx="3.5" ry="2.5" fill="#fff" opacity=".75"/></svg>`);

// ---------------------------------------------------------------- görsel yuvaları (görsel varsa o, yoksa kod çizimi)
const ya = (url: string | null, w: number, h: number, kod: string, hiza?: string, ek?: string) => (url ? resimSvg(url, w, h, hiza, ek) : kod);
/** Kurabiye kalıbı (görsel: kalip-<şekil>) */
export const kalipSvg = (k: Sekil | 'kapkek') => ya(resim(kalipAdlari(k)), 100, 100, kalipKod(k), 'xMidYMid meet');
/** Krema torbası (görsel: krema-<renk>) */
export const kremaSvg = (r: Renk) => ya(resim(kremaAdlari(r)), 100, 104, kremaKod(r));
/** Tezgâhtaki tutacakta dik duran krema torbası (görsel döndürülür, ucu aşağıda); görsel yoksa kod çizimi */
export function kremaDikSvg(r: Renk): string {
  const u = resim(kremaAdlari(r));
  if (!u) return kremaKod(r);
  const d = KREMA_DIK;
  return `<svg class="ps-r ps-krema-dik" viewBox="${d.x} ${d.y} ${d.w} ${d.h}" preserveAspectRatio="xMidYMax meet" aria-hidden="true" overflow="visible"><image href="${u}" width="338" height="355" transform="rotate(${d.aci} ${d.cx} ${d.cy})"/></svg>`;
}
/** Süs kavanozu (görsel: kavanoz-<süs>) */
export const susKabiSvg = (s: Sus, adet = 5) => ya(resim(kavanozAdlari(s)), 100, 116, susKabiKod(s, adet));
/** Hamur kâsesi: görselde kâse ve arkasında tahta kaşık (kâse .ps-hamur-kabarik: dokununca kabarır) */
export const HAMUR_KABI = (() => {
  const kase = yuva('hamurKasesi');
  if (!kase) return HAMUR_KABI_KOD;
  const kasik = yuva('kasik');
  const k = kasik ? `<image href="${kasik}" x="78" y="-26" width="86" height="70" preserveAspectRatio="xMidYMid meet" transform="rotate(-8 121 9)"/>` : '';
  return `<svg class="ps-r" viewBox="0 0 160 132" aria-hidden="true" overflow="visible">${k}<g class="ps-hamur-kabarik"><image href="${kase}" x="0" y="0" width="160" height="130" preserveAspectRatio="xMidYMax meet"/></g></svg>`;
})();
export const TEPSI = ya(yuva('tepsi'), 200, 80, TEPSI_KOD, 'none');
export const TABAK = ya(yuva('tabak'), 220, 100, TABAK_KOD, 'none');
export const KASA = ya(yuva('kasa'), 120, 112, KASA_KOD);
export const JETON = ya(yuva('jeton'), 100, 100, JETON_KOD, 'xMidYMid meet');
export const KUMBARA = ya(yuva('kumbara'), 140, 110, KUMBARA_KOD);
export const RAF_SUSLERI = RAF_SUSLERI_KOD;
export const SAPKA = SAPKA_KOD;
export const MINO_SAPKA = MINO_SAPKA_KOD;
export const OKUL = OKUL_KOD;
export const OTOBUS = otobusSvg(yuva('otobus'), yuva('teker'));
export const KALP = KALP_KOD;
