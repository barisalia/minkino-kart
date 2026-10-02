/**
 * Krema deseni ve kurabiye yüzü: şablonlar ve parmak çizgisinin şablona eşlenmesi (saf mantık, DOM yok; birim
 * testleri buradan sınar). Tasarım: ekip/senaryo/pasta-otobusu-v2.md 1a, 1c.
 *
 * Koordinatlar kurabiye çiziminin 100×100 kutusunda. Her şeklin içinde desenin oturduğu bir kutu var (yıldızın içi dar,
 * ayın içi ince). Şablon = hedefler: çizgi (zigzag, dalga, kalp, gülen ağız) ya da nokta (krema noktaları, göz, yanak).
 *
 * Eşleme toleranslı (4-7 yaş): çizginin kabulü için noktalarının yarısından fazlası şablona yakın olmalı (karalama
 * sayılmaz); şablonun %78'i bir kabul edilmiş çizgiyle örtülünce desen tamam. Yön önemsiz, birkaç parça çizgi olur.
 */
import type { Sekil } from './model';

export type Desen = 'duz' | 'zigzag' | 'dalga' | 'nokta' | 'kalp';
export type Yuz = 'gulen' | 'saskin' | 'kirpan';
export type Nokta = [number, number];

export const DESENLER: Desen[] = ['duz', 'zigzag', 'dalga', 'nokta', 'kalp'];
export const YUZLER: Yuz[] = ['gulen', 'saskin', 'kirpan'];

export type HedefParca = 'krema' | 'goz' | 'yanak' | 'agiz';
export interface Hedef {
  tur: 'cizgi' | 'nokta';
  parca: HedefParca;
  /** çizgide noktalar (kapalıysa ilk nokta sonda tekrar edilir), noktada tek eleman */
  yol: Nokta[];
}

/** Desenin (ve yüzün) şeklin içindeki kutusu: merkez ve yarı genişlik / yarı yükseklik */
export const DESEN_KUTU: Record<Sekil, { cx: number; cy: number; w: number; h: number }> = {
  yuvarlak: { cx: 50, cy: 50, w: 27, h: 21 },
  kalp: { cx: 50, cy: 43, w: 25, h: 17 },
  yildiz: { cx: 50, cy: 56, w: 19, h: 15 },
  ay: { cx: 36, cy: 57, w: 12, h: 19 },
};

/**
 * Desen görselinin (assets/pasta/desen-zigzag, desen-nokta; Gemini) kurabiyedeki yeri: kremanın ortasında, kurabiye
 * eninin ~%70'i (yıldızda ve ayda biraz dar). Şablon görselin kendi çizgisinden: bitince görsel tam şablonun üstüne oturur.
 */
export const DESEN_YERI: Record<Sekil, { cx: number; cy: number; w: number }> = {
  yuvarlak: { cx: 50, cy: 48, w: 70 },
  kalp: { cx: 50, cy: 43, w: 64 },
  yildiz: { cx: 50, cy: 55, w: 56 },
  ay: { cx: 37, cy: 56, w: 44 },
};
/** Görsellerin en/boy oranı (boy / en) */
export const DESEN_ORAN = { zigzag: 103 / 255, nokta: 139 / 253, cizgi: 0.4 };
/** Desenin kutusu (kurabiye birimi): görsel ve şablon aynı kutuda */
export function desenKutusu(s: Sekil, oran: number) {
  const k = DESEN_YERI[s];
  const hh = k.w * oran;
  return { x: k.cx - k.w / 2, y: k.cy - hh / 2, w: k.w, h: hh };
}
/** desen-zigzag görselinin orta çizgisi (görselin oranı olarak; inceltme ile ölçüldü) */
const ZIGZAG_ORTA: Nokta[] = [
  [0.055, 0.762], [0.102, 0.602], [0.165, 0.456], [0.227, 0.33], [0.29, 0.223], [0.353, 0.184], [0.4, 0.252], [0.384, 0.408], [0.369, 0.563], [0.373, 0.641],
  [0.435, 0.612], [0.498, 0.534], [0.561, 0.427], [0.624, 0.379], [0.678, 0.408], [0.682, 0.563], [0.663, 0.718], [0.714, 0.728], [0.776, 0.67], [0.839, 0.583], [0.902, 0.505], [0.933, 0.466],
];
/** desen-nokta görselindeki dokuz nokta (4-3-2 üçgen) */
const NOKTA_YERI: Nokta[] = [
  [0.094, 0.164], [0.365, 0.164], [0.635, 0.164], [0.903, 0.165], [0.233, 0.487], [0.5, 0.486], [0.767, 0.486], [0.363, 0.826], [0.632, 0.828],
];
const round = (v: number) => Math.round(v * 100) / 100;
const kutuda = (k: { x: number; y: number; w: number; h: number }, [fx, fy]: Nokta): Nokta => [round(k.x + fx * k.w), round(k.y + fy * k.h)];

/** Parametrik eğri (t 0..1 → kutunun oranı 0..1) */
function egri(k: { x: number; y: number; w: number; h: number }, n: number, f: (t: number) => Nokta): Nokta[] {
  return Array.from({ length: n + 1 }, (_, i) => kutuda(k, f(i / n)));
}

/** Desenin şablonu (düz kaplama: şablonsuz, tek dokunuş) */
export function desenHedefleri(d: Desen, s: Sekil): Hedef[] {
  switch (d) {
    case 'duz':
      return [];
    case 'zigzag': {
      const k = desenKutusu(s, DESEN_ORAN.zigzag);
      return [{ tur: 'cizgi', parca: 'krema', yol: ZIGZAG_ORTA.map((p) => kutuda(k, p)) }];
    }
    case 'dalga': {
      const k = desenKutusu(s, DESEN_ORAN.cizgi);
      return [{ tur: 'cizgi', parca: 'krema', yol: egri(k, 32, (t) => [0.04 + 0.92 * t, 0.5 - 0.36 * Math.sin(t * Math.PI * 3)]) }];
    }
    case 'kalp': {
      // kalp eğrisi (x = 16 sin³t, y = 13 cos t - 5 cos 2t - 2 cos 3t - cos 4t), kutuya sığdırılmış
      const k = desenKutusu(s, 0.8);
      const kk = { x: k.x + k.w * 0.18, y: k.y, w: k.w * 0.64, h: k.h };
      return [
        {
          tur: 'cizgi',
          parca: 'krema',
          yol: egri(kk, 40, (u) => {
            const t = u * Math.PI * 2;
            const x = 16 * Math.sin(t) ** 3;
            const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
            return [0.5 + x / 34, 0.42 - y / 34];
          }),
        },
      ];
    }
    case 'nokta': {
      const k = desenKutusu(s, DESEN_ORAN.nokta);
      return NOKTA_YERI.map((p) => ({ tur: 'nokta', parca: 'krema', yol: [kutuda(k, p)] }));
    }
  }
}

/**
 * Yüzün yeri (kurabiye-yuz-goz, kurabiye-yuz-agiz görselleri): gözler üst yarıda, ağız altında. w: yüzün eni.
 */
export const YUZ_YERI: Record<Sekil, { cx: number; cy: number; w: number }> = {
  yuvarlak: { cx: 50, cy: 50, w: 72 },
  kalp: { cx: 50, cy: 45, w: 64 },
  yildiz: { cx: 50, cy: 56, w: 50 },
  ay: { cx: 36, cy: 57, w: 40 },
};
/** Göz görselinin kutusu (iki göz bir arada; 236×119) */
export function gozKutusu(s: Sekil) {
  const y = YUZ_YERI[s];
  const w = y.w * 0.52;
  const hh = (w * 119) / 236;
  return { x: y.cx - w / 2, y: y.cy - y.w * 0.17 - hh / 2, w, h: hh };
}
/** Ağız görselinin kutusu (gülen ağız; 277×124) */
export function agizKutusu(s: Sekil) {
  const y = YUZ_YERI[s];
  const w = y.w * 0.44;
  const hh = (w * 124) / 277;
  return { x: y.cx - w / 2, y: y.cy + y.w * 0.13 - hh / 2, w, h: hh };
}

/** Yüzün şablonu: iki göz (dokunuş; göz kırpanda sağ göz kısa bir krema çizgisi), iki yanak, ağız (çizgi) */
export function yuzHedefleri(y: Yuz, s: Sekil): Hedef[] {
  const gk = gozKutusu(s);
  const ak = agizKutusu(s);
  const yy = YUZ_YERI[s];
  const goz = (fx: number): Hedef => ({ tur: 'nokta', parca: 'goz', yol: [kutuda(gk, [fx, 0.49])] });
  const yanak = (dx: number): Hedef => ({ tur: 'nokta', parca: 'yanak', yol: [[round(yy.cx + dx * yy.w * 0.36), round(yy.cy + yy.w * 0.06)]] });
  const kirp: Hedef = { tur: 'cizgi', parca: 'agiz', yol: egri(gk, 8, (t) => [0.56 + 0.36 * t, 0.56 - 0.3 * Math.sin(t * Math.PI)]) };
  const agiz: Hedef =
    y === 'saskin'
      ? { tur: 'cizgi', parca: 'agiz', yol: egri(ak, 24, (t) => [0.5 + 0.2 * Math.cos(t * Math.PI * 2), 0.5 + 0.42 * Math.sin(t * Math.PI * 2)]) }
      : { tur: 'cizgi', parca: 'agiz', yol: egri(ak, 16, (t) => [0.08 + 0.84 * t, 0.3 + 0.5 * Math.sin(t * Math.PI)]) };
  return [goz(0.255), y === 'kirpan' ? kirp : goz(0.741), yanak(-1), yanak(1), agiz];
}

// ---------------------------------------------------------------- geometri
const uzak = (a: Nokta, b: Nokta) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** Noktanın bir doğru parçasına uzaklığı */
function parcaUzak(p: Nokta, a: Nokta, b: Nokta): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = dx * dx + dy * dy;
  const t = l ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l)) : 0;
  return uzak(p, [a[0] + t * dx, a[1] + t * dy]);
}

/** Noktanın bir çizgiye (kırık çizgi; tek noktaysa o noktaya) uzaklığı */
export function cizgiyeUzak(p: Nokta, yol: readonly Nokta[]): number {
  if (!yol.length) return Infinity;
  if (yol.length === 1) return uzak(p, yol[0]);
  let en = Infinity;
  for (let i = 1; i < yol.length; i++) en = Math.min(en, parcaUzak(p, yol[i - 1], yol[i]));
  return en;
}

/** Çizgiyi eşit aralıklı noktalarla yeniden örnekler (adim: birim) */
export function ornekle(yol: readonly Nokta[], adim = 2): Nokta[] {
  if (yol.length < 2) return yol.slice();
  const c: Nokta[] = [yol[0]];
  let kalan = adim;
  for (let i = 1; i < yol.length; i++) {
    let [ax, ay] = yol[i - 1];
    const [bx, by] = yol[i];
    let l = uzak([ax, ay], [bx, by]);
    while (l >= kalan) {
      const t = kalan / l;
      ax += (bx - ax) * t;
      ay += (by - ay) * t;
      c.push([ax, ay]);
      l -= kalan;
      kalan = adim;
    }
    kalan -= l;
  }
  const son = yol[yol.length - 1];
  if (uzak(c[c.length - 1], son) > adim * 0.3) c.push(son);
  return c;
}

/** Çizginin uzunluğu */
export const uzunluk = (yol: readonly Nokta[]) => yol.reduce((t, p, i) => (i ? t + uzak(yol[i - 1], p) : 0), 0);

// ---------------------------------------------------------------- eşleme
/** Varsayılan tolerans (birim): kurabiye kutusu 100 birim; çocuk parmağı için cömert */
export const TOLERANS = 8;
/** Şablonun bu oranı örtülünce çizgi tamam */
export const KAPSAMA_ESIK = 0.78;
/** Çizginin kabulü: noktalarının bu oranı şablonun 2 tolerans yakınında olmalı */
export const KABUL_ESIK = 0.55;

/** Parmak çizgisi bu hedefe mi (karalama değil mi): noktalarının çoğu şablona yakın, ne çok kısa ne çok uzun */
export function cizgiKabul(h: Hedef, cizgi: readonly Nokta[], tol = TOLERANS): boolean {
  if (h.tur !== 'cizgi' || cizgi.length < 2) return false;
  const c = ornekle(cizgi, 1.5);
  const yakin = c.filter((p) => cizgiyeUzak(p, h.yol) <= tol * 2).length;
  const l = uzunluk(cizgi);
  // karalama (gidip gelen, şablondan çok uzun çizgi) sayılmaz
  return yakin / c.length >= KABUL_ESIK && l >= Math.min(12, uzunluk(h.yol) * 0.2) && l <= uzunluk(h.yol) * 2.5 + 20;
}

/** Şablonun, kabul edilmiş çizgilerce örtülen oranı (0..1) */
export function kapsama(h: Hedef, cizgiler: readonly (readonly Nokta[])[], tol = TOLERANS): number {
  const o = ornekle(h.yol, 2);
  if (!o.length) return 0;
  const parmak = cizgiler.map((c) => ornekle(c, 1.5));
  const ortulen = o.filter((p) => parmak.some((c) => c.some((q) => uzak(p, q) <= tol))).length;
  return ortulen / o.length;
}

/** Dokunuş bu noktaya mı (biraz daha geniş tolerans: tek dokunuş) */
export const noktaIsabet = (h: Hedef, p: Nokta, tol = TOLERANS) => h.tur === 'nokta' && uzak(p, h.yol[0]) <= tol * 1.6;

export interface Eslesme {
  /** her hedef tamam mı */
  tamam: boolean[];
  /** her çizgi hedefinin örtülme oranı (nokta: 0 / 1) */
  oran: number[];
  /** bütün şablon tamam */
  bitti: boolean;
}

/**
 * Çizgiler ve dokunuşlar şablona ne kadar uyuyor. Her çizgi kendisine en yakın çizgi hedefine sayılır ve yalnız kabul
 * edilirse örter; dokunuş en yakın nokta hedefini doldurur.
 */
export function desenEsle(hedefler: readonly Hedef[], cizgiler: readonly (readonly Nokta[])[], dokunuslar: readonly Nokta[] = [], tol = TOLERANS): Eslesme {
  const kabul: Nokta[][][] = hedefler.map(() => []);
  for (const c of cizgiler) {
    const i = enYakinHedef(hedefler, c, 'cizgi');
    if (i >= 0 && cizgiKabul(hedefler[i], c, tol)) kabul[i].push(c.slice());
  }
  const vurulan = hedefler.map(() => false);
  for (const p of dokunuslar) {
    const i = enYakinHedef(hedefler, [p], 'nokta');
    if (i >= 0 && noktaIsabet(hedefler[i], p, tol)) vurulan[i] = true;
  }
  const oran = hedefler.map((h, i) => (h.tur === 'nokta' ? (vurulan[i] ? 1 : 0) : kapsama(h, kabul[i], tol)));
  const tamam = hedefler.map((h, i) => (h.tur === 'nokta' ? vurulan[i] : oran[i] >= KAPSAMA_ESIK));
  return { tamam, oran, bitti: tamam.every(Boolean) };
}

/** Bir çizginin (ya da dokunuşun) en yakın olduğu hedef (yalnız o türden; yoksa -1) */
export function enYakinHedef(hedefler: readonly Hedef[], c: readonly Nokta[], tur: Hedef['tur'], haric: readonly boolean[] = []): number {
  let en = -1;
  let enUzak = Infinity;
  const o = c.length > 1 ? ornekle(c, 3) : c;
  hedefler.forEach((h, i) => {
    if (h.tur !== tur || haric[i]) return;
    const d = o.reduce((t, p) => t + cizgiyeUzak(p, h.yol), 0) / Math.max(1, o.length);
    if (d < enUzak) {
      enUzak = d;
      en = i;
    }
  });
  return en;
}

/** SVG yolu ("M x y L …"; kapalıysa Z) */
export const yolD = (yol: readonly Nokta[]) => {
  if (!yol.length) return '';
  const kapali = yol.length > 2 && uzak(yol[0], yol[yol.length - 1]) < 0.5;
  return `M${yol.map(([x, y]) => `${round(x)} ${round(y)}`).join('L')}${kapali ? 'Z' : ''}`;
};

// ---------------------------------------------------------------- serpinti
/** Serpinti: tane sayısından seviye (0 yok, 1 az, 2 bol). Az salla az, çok salla çok. */
export const SERPINTI_BOL = 12;
export const EN_COK_SERPINTI = 26;
export const serpintiSeviye = (tane: number) => (tane <= 0 ? 0 : tane < SERPINTI_BOL ? 1 : 2);
/** Siparişte (balonda) seviye kadar tane çizilir */
export const SEVIYE_TANE = [0, 6, 16];

/**
 * Tanelerin (ya da serpinti görselinin açılan parçalarının) kurabiye üstündeki yerleri; her zaman aynı sırayla: canlı
 * serpinti ile son çizim aynı görünür.
 */
export function serpintiYerleri(s: Sekil, n: number): { x: number; y: number; a: number; r: number }[] {
  const k = DESEN_KUTU[s];
  const c: { x: number; y: number; a: number; r: number }[] = [];
  for (let i = 0; i < Math.min(n, EN_COK_SERPINTI); i++) {
    // altın açı sarmalı: kutunun içine dengeli dağılır
    const t = (i + 0.6) / EN_COK_SERPINTI;
    const ac = i * 2.39996;
    const r = Math.sqrt(t) * 1.15;
    c.push({ x: round(k.cx + Math.cos(ac) * r * k.w), y: round(k.cy + Math.sin(ac) * r * k.h * 1.1), a: (i * 67) % 180, r: i % 6 });
  }
  return c;
}
