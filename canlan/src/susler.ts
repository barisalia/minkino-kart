/**
 * Her resmin güzelleşme bilgisi (şablon koordinatında, 0..1):
 * - boya: parçaların önerilen rengi (liste kartı ve "sihirli boya")
 * - alanlar: açık çizgili parçaların boyanacak alanı (ör. evin duvarı üç kenarla çizilir)
 * - sus: canlanınca beliren süsler (yüz, yanak, parlama, pencere…) — ait oldukları parçayla birlikte oynar
 */
import type { Nokta } from './resimler';

export interface Sus {
  parca: string;
  svg: string;
}
export interface Guzellik {
  boya: Record<string, string>;
  alanlar?: Record<string, Nokta[][]>;
  sus: Sus[];
}

const K = '#5a3617'; // Minkino kontur rengi
const G = '#3b2314'; // göz
const f = (v: number) => +v.toFixed(4);

/** Sevimli yüz: parlak gözler, gülümseme, pembe yanaklar. s: yüz büyüklüğü. */
function yuz(cx: number, cy: number, s: number, yanak = true): string {
  const goz = (x: number) =>
    `<ellipse cx="${f(x)}" cy="${f(cy - 0.08 * s)}" rx="${f(0.085 * s)}" ry="${f(0.12 * s)}" fill="${G}"/>` +
    `<circle cx="${f(x + 0.03 * s)}" cy="${f(cy - 0.13 * s)}" r="${f(0.035 * s)}" fill="#fff"/>`;
  const agiz = `<path d="M${f(cx - 0.18 * s)} ${f(cy + 0.13 * s)}Q${f(cx)} ${f(cy + 0.34 * s)} ${f(cx + 0.18 * s)} ${f(cy + 0.13 * s)}" fill="none" stroke="${G}" stroke-width="${f(0.055 * s)}" stroke-linecap="round"/>`;
  const yanaklar = yanak
    ? [-1, 1].map((k) => `<ellipse cx="${f(cx + k * 0.52 * s)}" cy="${f(cy + 0.12 * s)}" rx="${f(0.12 * s)}" ry="${f(0.07 * s)}" fill="#ff7eb6" opacity=".6"/>`).join('')
    : '';
  return goz(cx - 0.3 * s) + goz(cx + 0.3 * s) + agiz + yanaklar;
}

/** Yuvarlak şekillerde sol üstte parlama. */
function parilti(cx: number, cy: number, r: number): string {
  const a = (d: number) => [cx + 0.7 * r * Math.cos((d * Math.PI) / 180), cy + 0.7 * r * Math.sin((d * Math.PI) / 180)];
  const [x1, y1] = a(195);
  const [x2, y2] = a(245);
  return `<path d="M${f(x1)} ${f(y1)}A${f(0.7 * r)} ${f(0.7 * r)} 0 0 1 ${f(x2)} ${f(y2)}" fill="none" stroke="#fff" stroke-width="${f(0.11 * r)}" stroke-linecap="round" opacity=".8"/>`;
}

/** Dört köşeli pırıltı. */
function pirilti(x: number, y: number, s: number, renk = '#fff'): string {
  return `<path d="M${f(x)} ${f(y - s)}Q${f(x)} ${f(y)} ${f(x + s)} ${f(y)}Q${f(x)} ${f(y)} ${f(x)} ${f(y + s)}Q${f(x)} ${f(y)} ${f(x - s)} ${f(y)}Q${f(x)} ${f(y)} ${f(x)} ${f(y - s)}Z" fill="${renk}"/>`;
}

/** Konturlu minik bulut (iç çizgiler görünmesin diye önce konturlu, sonra düz daireler). */
function bulutcuk(x: number, y: number, s: number): string {
  const d: [number, number, number][] = [[-0.5, 0.15, 0.45], [0, -0.1, 0.6], [0.5, 0.15, 0.45]];
  const daire = (k: boolean) => d.map(([a, b, r]) => `<circle cx="${f(x + a * s)}" cy="${f(y + b * s)}" r="${f(r * s)}" fill="#fff"${k ? ` stroke="${K}" stroke-width="${f(0.12 * s)}"` : ''}/>`).join('');
  return daire(true) + daire(false);
}

const damla = (x: number, y: number) => `<path d="M${f(x)} ${f(y - 0.035)}Q${f(x + 0.028)} ${f(y)} ${f(x)} ${f(y + 0.014)}Q${f(x - 0.028)} ${f(y)} ${f(x)} ${f(y - 0.035)}Z" fill="#3E9DF2" stroke="${K}" stroke-width=".007"/>`;
const pencere = (x: number, y: number, w: number) =>
  `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(w)}" rx="${f(w * 0.15)}" fill="#BDE7FF" stroke="${K}" stroke-width=".012"/>` +
  `<path d="M${f(x + w / 2)} ${f(y)}v${f(w)}M${f(x)} ${f(y + w / 2)}h${f(w)}" stroke="${K}" stroke-width=".01"/>`;
const jant = (x: number, y: number) =>
  `<circle cx="${x}" cy="${y}" r=".036" fill="#D9D9D9" stroke="${K}" stroke-width=".01"/><path d="M${x} ${f(y - 0.036)}v.072M${f(x - 0.036)} ${y}h.072" stroke="${K}" stroke-width=".01"/>`;
const gozBebegi = (x: number, y: number, r: number) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${G}"/><circle cx="${f(x + r * 0.35)}" cy="${f(y - r * 0.4)}" r="${f(r * 0.38)}" fill="#fff"/>`;
const yanak = (x: number, y: number, rx: number) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${f(rx * 0.6)}" fill="#ff7eb6" opacity=".6"/>`;

export const SUS: Record<string, Guzellik> = {
  top: {
    boya: { top: '#F0413F' },
    sus: [{ parca: 'top', svg: parilti(0.5, 0.5, 0.3) + yuz(0.5, 0.55, 0.19) }],
  },
  gunes: {
    boya: { yuz: '#FFC72C' },
    sus: [{ parca: 'yuz', svg: parilti(0.5, 0.5, 0.17) + yuz(0.5, 0.53, 0.12) }],
  },
  kalp: {
    boya: { kalp: '#FF4F8B' },
    sus: [
      { parca: 'kalp', svg: `<path d="M.27 .39Q.28 .3 .37 .28" fill="none" stroke="#fff" stroke-width=".03" stroke-linecap="round" opacity=".8"/>` + yuz(0.5, 0.5, 0.14) },
      { parca: 'kalp', svg: pirilti(0.84, 0.2, 0.035, '#FFC72C') + pirilti(0.16, 0.74, 0.028, '#FFC72C') },
    ],
  },
  gokkusagi: {
    boya: {},
    sus: [{ parca: 'dis', svg: bulutcuk(0.13, 0.73, 0.075) + bulutcuk(0.87, 0.73, 0.075) + pirilti(0.5, 0.2, 0.03, '#FFC72C') }],
  },
  bulut: {
    boya: { bulut: '#FFFFFF' },
    sus: [
      { parca: 'bulut', svg: yuz(0.5, 0.5, 0.1) },
      { parca: 'yagmur', svg: damla(0.34, 0.83) + damla(0.48, 0.83) + damla(0.62, 0.83) },
    ],
  },
  yildiz: {
    boya: { yildiz: '#FFC72C' },
    sus: [{ parca: 'yildiz', svg: yuz(0.5, 0.56, 0.09) + pirilti(0.82, 0.18, 0.03) + pirilti(0.18, 0.84, 0.025) }],
  },
  balik: {
    boya: { govde: '#FF8A2B', kuyruk: '#FFC72C' },
    sus: [
      {
        parca: 'govde',
        svg:
          `<path d="M.42 .345Q.5 .21 .63 .35" fill="#FFC72C" stroke="${K}" stroke-width=".014" stroke-linejoin="round"/>` +
          `<path d="M.42 .45q.05 .05 0 .1M.5 .43q.055 .07 0 .14" stroke="#fff" stroke-width=".014" fill="none" opacity=".7" stroke-linecap="round"/>` +
          `<path d="M.71 .57Q.745 .6 .78 .565" stroke="${G}" stroke-width=".014" fill="none" stroke-linecap="round"/>` +
          yanak(0.68, 0.55, 0.028) +
          `<circle cx=".86" cy=".36" r=".018" fill="none" stroke="#fff" stroke-width=".008"/><circle cx=".9" cy=".27" r=".012" fill="none" stroke="#fff" stroke-width=".007"/>`,
      },
      { parca: 'goz', svg: gozBebegi(0.662, 0.452, 0.018) },
    ],
  },
  ev: {
    boya: { duvar: '#FFE0A8', cati: '#F0413F', kapi: '#A0522D' },
    alanlar: {
      duvar: [[[0.26, 0.47], [0.26, 0.86], [0.74, 0.86], [0.74, 0.47]]],
      kapi: [[[0.44, 0.86], [0.44, 0.66], [0.56, 0.66], [0.56, 0.86]]],
    },
    sus: [
      { parca: 'duvar', svg: pencere(0.3, 0.55, 0.1) + pencere(0.6, 0.55, 0.1) },
      { parca: 'kapi', svg: `<circle cx=".535" cy=".77" r=".013" fill="#FFC72C" stroke="${K}" stroke-width=".006"/>` },
      { parca: 'cati', svg: `<circle cx=".5" cy=".37" r=".042" fill="#BDE7FF" stroke="${K}" stroke-width=".012"/>` + pirilti(0.5, 0.37, 0.018, '#fff') },
    ],
  },
  elma: {
    boya: { govde: '#F0413F', yaprak: '#5DBE3F' },
    sus: [{ parca: 'govde', svg: parilti(0.5, 0.58, 0.27) + yuz(0.5, 0.62, 0.15) }],
  },
  agac: {
    boya: { tepe: '#5DBE3F', govde: '#A0522D' },
    alanlar: { govde: [[[0.44, 0.61], [0.44, 0.88], [0.56, 0.88], [0.56, 0.61]]] },
    sus: [
      {
        parca: 'tepe',
        svg:
          parilti(0.5, 0.38, 0.25) +
          [[0.37, 0.33], [0.6, 0.27], [0.63, 0.47], [0.42, 0.5]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".032" fill="#F0413F" stroke="${K}" stroke-width=".01"/><circle cx="${f(x - 0.01)}" cy="${f(y - 0.012)}" r=".009" fill="#fff"/>`).join(''),
      },
    ],
  },
  balon: {
    boya: { balon: '#9B5CE0' },
    sus: [
      { parca: 'balon', svg: parilti(0.5, 0.36, 0.21) + yuz(0.5, 0.4, 0.12) + `<path d="M.47 .635L.53 .635L.5 .595Z" fill="#9B5CE0" stroke="${K}" stroke-width=".01" stroke-linejoin="round"/>` },
    ],
  },
  yilan: {
    boya: { bas: '#5DBE3F' },
    sus: [
      { parca: 'bas', svg: gozBebegi(0.785, 0.545, 0.014) + gozBebegi(0.82, 0.545, 0.014) + `<path d="M.864 .575L.9 .58M.9 .58l.016-.012M.9 .58l.016 .012" stroke="#F0413F" stroke-width=".009" stroke-linecap="round"/>` },
    ],
  },
  kardan: {
    boya: { alt: '#FFFFFF', ust: '#FFFFFF' },
    sus: [
      {
        parca: 'ust',
        svg:
          `<rect x=".42" y=".12" width=".16" height=".1" rx=".01" fill="${G}"/><rect x=".42" y=".19" width=".16" height=".022" fill="#F0413F"/><rect x=".375" y=".21" width=".25" height=".028" rx=".012" fill="${G}"/>` +
          gozBebegi(0.46, 0.3, 0.015) + gozBebegi(0.54, 0.3, 0.015) +
          `<path d="M.5 .325L.6 .345L.5 .36Z" fill="#FF8A2B" stroke="${K}" stroke-width=".007" stroke-linejoin="round"/>` +
          [[0.455, 0.39], [0.477, 0.402], [0.5, 0.407], [0.523, 0.402], [0.545, 0.39]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".007" fill="${G}"/>`).join('') +
          `<path d="M.385 .435Q.5 .49 .615 .435L.615 .475Q.5 .53 .385 .475Z" fill="#F0413F" stroke="${K}" stroke-width=".008"/><path d="M.57 .48L.6 .56L.55 .56L.54 .49" fill="#F0413F" stroke="${K}" stroke-width=".008"/>` +
          yanak(0.42, 0.36, 0.02) + yanak(0.58, 0.36, 0.02),
      },
      { parca: 'alt', svg: [0.6, 0.68, 0.76].map((y) => `<circle cx=".5" cy="${y}" r=".017" fill="${G}"/>`).join('') },
    ],
  },
  araba: {
    boya: { govde: '#3E9DF2', teker1: '#3b3b3b', teker2: '#3b3b3b' },
    sus: [
      {
        parca: 'govde',
        svg:
          `<path d="M.38 .48L.43 .38L.5 .38L.5 .48Z" fill="#BDE7FF" stroke="${K}" stroke-width=".01" stroke-linejoin="round"/>` +
          `<path d="M.53 .48L.53 .38L.62 .38L.67 .48Z" fill="#BDE7FF" stroke="${K}" stroke-width=".01" stroke-linejoin="round"/>` +
          `<circle cx=".86" cy=".555" r=".02" fill="#FFC72C" stroke="${K}" stroke-width=".007"/><rect x=".12" y=".54" width=".025" height=".03" fill="#F0413F"/>`,
      },
      { parca: 'teker1', svg: jant(0.3, 0.67) },
      { parca: 'teker2', svg: jant(0.7, 0.67) },
    ],
  },
  tekne: {
    boya: { govde: '#F0413F', yelken: '#FFFFFF' },
    alanlar: { yelken: [[[0.5, 0.18], [0.78, 0.55], [0.5, 0.55]]] },
    sus: [
      { parca: 'direk', svg: `<path d="M.5 .17L.5 .08L.61 .12Z" fill="#FFC72C" stroke="${K}" stroke-width=".009" stroke-linejoin="round"/>` },
      { parca: 'govde', svg: [0.35, 0.5, 0.65].map((x) => `<circle cx="${x}" cy=".7" r=".026" fill="#BDE7FF" stroke="${K}" stroke-width=".01"/>`).join('') },
    ],
  },
  cicek: {
    boya: { orta: '#FFC72C', yapraklar: '#FF7EB6', yaprak: '#5DBE3F' },
    sus: [
      { parca: 'orta', svg: yuz(0.5, 0.33, 0.045, false) },
      { parca: 'yaprak', svg: `<path d="M.52 .715Q.6 .665 .685 .655" stroke="#2f7d22" stroke-width=".008" fill="none" stroke-linecap="round"/>` },
    ],
  },
  kelebek: {
    boya: { sol_kanat: '#9B5CE0', sag_kanat: '#9B5CE0' },
    sus: [
      { parca: 'sol_kanat', svg: `<circle cx=".34" cy=".39" r=".045" fill="#FFC72C" stroke="${K}" stroke-width=".008"/><circle cx=".38" cy=".62" r=".03" fill="#FF7EB6" stroke="${K}" stroke-width=".008"/>` },
      { parca: 'sag_kanat', svg: `<circle cx=".66" cy=".39" r=".045" fill="#FFC72C" stroke="${K}" stroke-width=".008"/><circle cx=".62" cy=".62" r=".03" fill="#FF7EB6" stroke="${K}" stroke-width=".008"/>` },
      { parca: 'govde', svg: `<circle cx=".5" cy=".285" r=".04" fill="${G}"/><circle cx=".488" cy=".275" r=".009" fill="#fff"/><circle cx=".512" cy=".275" r=".009" fill="#fff"/>` },
      { parca: 'anten', svg: `<circle cx=".43" cy=".17" r=".016" fill="${G}"/><circle cx=".57" cy=".17" r=".016" fill="${G}"/>` },
    ],
  },
  kedi: {
    boya: { yuz: '#FFB35C', sol_kulak: '#FFB35C', sag_kulak: '#FFB35C' },
    alanlar: {
      sol_kulak: [[[0.29, 0.43], [0.27, 0.17], [0.44, 0.33]]],
      sag_kulak: [[[0.71, 0.43], [0.73, 0.17], [0.56, 0.33]]],
    },
    sus: [
      { parca: 'sol_kulak', svg: `<path d="M.315 .37L.3 .245L.39 .325Z" fill="#FF9EBB"/>` },
      { parca: 'sag_kulak', svg: `<path d="M.685 .37L.7 .245L.61 .325Z" fill="#FF9EBB"/>` },
      { parca: 'gozler', svg: gozBebegi(0.41, 0.52, 0.02) + gozBebegi(0.59, 0.52, 0.02) },
      {
        parca: 'yuz',
        svg:
          `<path d="M.478 .595L.522 .595L.5 .622Z" fill="#FF7EB6" stroke="${K}" stroke-width=".006" stroke-linejoin="round"/>` +
          `<path d="M.5 .622q-.022 .03-.048 .006M.5 .622q.022 .03 .048 .006" stroke="${G}" stroke-width=".01" fill="none" stroke-linecap="round"/>` +
          yanak(0.36, 0.62, 0.04) + yanak(0.64, 0.62, 0.04),
      },
    ],
  },
};
