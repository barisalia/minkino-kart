/**
 * Çizilecek resimler: tuvalin 0..1 kare koordinatında basit çizgi şablonları.
 * Her çizgi bir "parçaya" aittir (kuyruk, kanat…). Parçalar hem eksik parça bulmada hem de canlanmada kullanılır.
 */
import canlan from '../../content/canlan.json';

export type Nokta = [number, number];
export type Mod = 'iz' | 'nokta' | 'kopya' | 'hafiza';
export const MODLAR: Mod[] = ['iz', 'nokta', 'kopya', 'hafiza'];

export interface SablonCizgi {
  parca: string;
  n: Nokta[];
  kapali?: boolean;
}

/** Canlanma hareketleri (şablon koordinatında). */
export type Hareket =
  | { tip: 'don'; pivot: Nokta; aci: number; hiz: number; faz?: number }
  | { tip: 'cevir'; pivot: Nokta; hiz: number }
  | { tip: 'olcek'; pivot: Nokta; x: number; y: number; hiz: number; faz?: number }
  | { tip: 'zipla'; yukseklik: number; hiz: number; zemin: number }
  | { tip: 'kaydir'; dx: number; dy: number; hiz: number; faz?: number }
  | { tip: 'dalga'; genlik: number; boy: number; hiz: number; eksen: 'x' | 'y' };

export type Yol = 'yuz' | 'git' | 'yuksel' | 'suzul';
/** Canlanan resme dokununca hafif tepki */
export type Tepki = 'atis' | 'zipla' | 'salla' | 'don' | 'titre';
export type Sahne = 'gok' | 'deniz' | 'okyanus' | 'cayir' | 'gece' | 'yol' | 'kar';

export interface Resim {
  id: string;
  ad: string;
  zorluk: 1 | 2 | 3;
  renk: string;
  sahne: Sahne;
  cizgiler: SablonCizgi[];
  /** Eksik sayılmayan küçük parçalar (göz gibi) */
  kucukParcalar?: string[];
  /** zemin: yere basan resimde çizimin alt kenarının sahnedeki yeri (0..1) */
  canlan: { tum?: Hareket[]; parca?: Record<string, Hareket[]>; yol?: Yol; renkler?: Record<string, string>; zemin?: number; tepki?: Tepki };
}

// ---------- şekil yardımcıları ----------
const R = Math.PI / 180;
export function yay(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n = 28): Nokta[] {
  const p: Nokta[] = [];
  for (let i = 0; i <= n; i++) {
    const a = (a0 + ((a1 - a0) * i) / n) * R;
    p.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return p;
}
/** Kapalı daire/elips (tepeden başlar, saat yönünde). */
export const daire = (cx: number, cy: number, r: number, ry = r, n = 32) => yay(cx, cy, r, ry, -90, 270, n);

function kalpSekli(cx: number, cy: number, s: number): Nokta[] {
  const p: Nokta[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = (i / 40) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    p.push([cx + (x / 17) * s, cy - (y / 17) * s]);
  }
  return p;
}

function yildizSekli(cx: number, cy: number, dis: number, ic: number): Nokta[] {
  const p: Nokta[] = [];
  for (let i = 0; i <= 10; i++) {
    const a = (-90 + i * 36) * R;
    const r = i % 2 ? ic : dis;
    p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return p;
}

function bulutSekli(): Nokta[] {
  return [
    ...yay(0.3, 0.52, 0.11, 0.11, 90, 270, 14),
    ...yay(0.44, 0.4, 0.14, 0.14, 180, 330, 16),
    ...yay(0.62, 0.42, 0.12, 0.12, 200, 360, 14),
    ...yay(0.72, 0.53, 0.1, 0.1, 270, 450, 12),
    [0.3, 0.63],
  ];
}

const ad = (id: string) => (canlan.resimler as Record<string, string>)[id] ?? id;

export const RESIMLER: Resim[] = [
  {
    id: 'top', ad: ad('top'), zorluk: 1, renk: '#F0413F', sahne: 'cayir',
    cizgiler: [
      { parca: 'top', n: daire(0.5, 0.5, 0.3), kapali: true },
      { parca: 'serit', n: yay(0.5, 0.95, 0.42, 0.42, 232, 308, 16) },
    ],
    kucukParcalar: ['serit'],
    canlan: { tepki: 'zipla', zemin: 0.9, tum: [{ tip: 'zipla', yukseklik: 0.16, hiz: 0.9, zemin: 0.8 }] },
  },
  {
    id: 'gunes', ad: ad('gunes'), zorluk: 1, renk: '#FF8A2B', sahne: 'gok',
    cizgiler: [
      { parca: 'yuz', n: daire(0.5, 0.5, 0.17), kapali: true },
      ...Array.from({ length: 8 }, (_, i): SablonCizgi => {
        const a = i * 45 * R;
        return { parca: 'isinlar', n: [[0.5 + 0.25 * Math.cos(a), 0.5 + 0.25 * Math.sin(a)], [0.5 + 0.37 * Math.cos(a), 0.5 + 0.37 * Math.sin(a)]] };
      }),
    ],
    canlan: { tepki: 'salla', tum: [{ tip: 'olcek', pivot: [0.5, 0.5], x: 1.06, y: 1.06, hiz: 1.2 }], parca: { isinlar: [{ tip: 'cevir', pivot: [0.5, 0.5], hiz: 0.12 }] } },
  },
  {
    id: 'kalp', ad: ad('kalp'), zorluk: 1, renk: '#FF4F8B', sahne: 'gok',
    cizgiler: [{ parca: 'kalp', n: kalpSekli(0.5, 0.5, 0.36), kapali: true }],
    canlan: { tepki: 'atis', tum: [{ tip: 'olcek', pivot: [0.5, 0.55], x: 1.14, y: 1.14, hiz: 1.3 }], yol: 'suzul' },
  },
  {
    id: 'gokkusagi', ad: ad('gokkusagi'), zorluk: 1, renk: '#9B5CE0', sahne: 'gok',
    cizgiler: [
      { parca: 'dis', n: yay(0.5, 0.72, 0.38, 0.38, 180, 360, 30) },
      { parca: 'orta', n: yay(0.5, 0.72, 0.28, 0.28, 180, 360, 24) },
      { parca: 'ic', n: yay(0.5, 0.72, 0.18, 0.18, 180, 360, 18) },
    ],
    canlan: { tepki: 'atis',
      tum: [{ tip: 'olcek', pivot: [0.5, 0.72], x: 1.04, y: 1.08, hiz: 0.8 }],
      yol: 'suzul',
      renkler: { dis: '#F0413F', orta: '#FFC72C', ic: '#3E9DF2' },
    },
  },
  {
    id: 'bulut', ad: ad('bulut'), zorluk: 1, renk: '#3E9DF2', sahne: 'gok',
    cizgiler: [
      { parca: 'bulut', n: bulutSekli(), kapali: true },
      { parca: 'yagmur', n: [[0.38, 0.7], [0.35, 0.8]] },
      { parca: 'yagmur', n: [[0.52, 0.7], [0.49, 0.8]] },
      { parca: 'yagmur', n: [[0.66, 0.7], [0.63, 0.8]] },
    ],
    kucukParcalar: ['yagmur'],
    canlan: { tepki: 'titre', tum: [{ tip: 'kaydir', dx: 0.08, dy: 0, hiz: 0.18 }], parca: { yagmur: [{ tip: 'kaydir', dx: 0, dy: 0.03, hiz: 1.6 }] } },
  },
  {
    id: 'yildiz', ad: ad('yildiz'), zorluk: 2, renk: '#FFB000', sahne: 'gece',
    cizgiler: [{ parca: 'yildiz', n: yildizSekli(0.5, 0.52, 0.36, 0.15), kapali: true }],
    canlan: { tepki: 'don', tum: [{ tip: 'don', pivot: [0.5, 0.52], aci: 14, hiz: 0.7 }, { tip: 'olcek', pivot: [0.5, 0.52], x: 1.08, y: 1.08, hiz: 1.4 }], yol: 'suzul' },
  },
  {
    id: 'balik', ad: ad('balik'), zorluk: 2, renk: '#FF8A2B', sahne: 'deniz',
    cizgiler: [
      { parca: 'govde', n: daire(0.52, 0.5, 0.26, 0.17), kapali: true },
      { parca: 'kuyruk', n: [[0.26, 0.5], [0.12, 0.36], [0.12, 0.64], [0.26, 0.5]], kapali: true },
      { parca: 'goz', n: daire(0.66, 0.45, 0.025, 0.025, 10), kapali: true },
    ],
    kucukParcalar: ['goz'],
    canlan: { tepki: 'salla', yol: 'yuz', parca: { kuyruk: [{ tip: 'olcek', pivot: [0.26, 0.5], x: 0.55, y: 1, hiz: 2.4 }] } },
  },
  {
    id: 'ev', ad: ad('ev'), zorluk: 2, renk: '#F0413F', sahne: 'cayir',
    cizgiler: [
      { parca: 'duvar', n: [[0.26, 0.47], [0.26, 0.86], [0.74, 0.86], [0.74, 0.47]] },
      { parca: 'cati', n: [[0.2, 0.49], [0.5, 0.18], [0.8, 0.49], [0.2, 0.49]], kapali: true },
      { parca: 'kapi', n: [[0.44, 0.86], [0.44, 0.66], [0.56, 0.66], [0.56, 0.86]] },
    ],
    canlan: { tepki: 'zipla',
      tum: [{ tip: 'olcek', pivot: [0.5, 0.86], x: 1.05, y: 0.94, hiz: 1.1 }, { tip: 'don', pivot: [0.5, 0.86], aci: 4, hiz: 0.55 }],
      parca: { cati: [{ tip: 'don', pivot: [0.2, 0.49], aci: -7, hiz: 0.55, faz: 0.2 }] },
    },
  },
  {
    id: 'elma', ad: ad('elma'), zorluk: 2, renk: '#E5322D', sahne: 'cayir',
    cizgiler: [
      { parca: 'govde', n: daire(0.5, 0.58, 0.27, 0.26), kapali: true },
      { parca: 'sap', n: [[0.5, 0.32], [0.53, 0.17]] },
      { parca: 'yaprak', n: [[0.54, 0.24], ...yay(0.63, 0.2, 0.09, 0.05, 180, 360, 8).slice(1), ...yay(0.63, 0.2, 0.09, 0.05, 0, 180, 8).slice(1)], kapali: true },
    ],
    kucukParcalar: ['yaprak'],
    canlan: { tepki: 'zipla', tum: [{ tip: 'zipla', yukseklik: 0.12, hiz: 0.8, zemin: 0.84 }], parca: { yaprak: [{ tip: 'don', pivot: [0.54, 0.24], aci: 18, hiz: 1.2 }] } },
  },
  {
    id: 'agac', ad: ad('agac'), zorluk: 2, renk: '#3FA535', sahne: 'cayir',
    cizgiler: [
      { parca: 'tepe', n: daire(0.5, 0.38, 0.26, 0.24), kapali: true },
      { parca: 'govde', n: [[0.44, 0.61], [0.44, 0.88]] },
      { parca: 'govde', n: [[0.56, 0.61], [0.56, 0.88]] },
    ],
    canlan: { tepki: 'salla', parca: { tepe: [{ tip: 'don', pivot: [0.5, 0.62], aci: 6, hiz: 0.5 }, { tip: 'olcek', pivot: [0.5, 0.62], x: 1.05, y: 1.03, hiz: 0.9 }] } },
  },
  {
    id: 'balon', ad: ad('balon'), zorluk: 2, renk: '#9B5CE0', sahne: 'gok',
    cizgiler: [
      { parca: 'balon', n: daire(0.5, 0.36, 0.2, 0.24), kapali: true },
      { parca: 'ip', n: [[0.5, 0.6], [0.47, 0.68], [0.53, 0.76], [0.47, 0.84], [0.5, 0.9]] },
    ],
    canlan: { tepki: 'zipla', yol: 'yuksel', parca: { ip: [{ tip: 'dalga', genlik: 0.025, boy: 0.18, hiz: 1.3, eksen: 'y' }] } },
  },
  {
    id: 'yilan', ad: ad('yilan'), zorluk: 2, renk: '#5DBE3F', sahne: 'cayir',
    cizgiler: [
      { parca: 'govde', n: Array.from({ length: 33 }, (_, i): Nokta => [0.12 + (i / 32) * 0.62, 0.58 + 0.1 * Math.sin((i / 32) * Math.PI * 3)]) },
      { parca: 'bas', n: daire(0.8, 0.56, 0.065), kapali: true },
    ],
    canlan: { tepki: 'salla', tum: [{ tip: 'dalga', genlik: 0.035, boy: 0.33, hiz: 0.9, eksen: 'x' }], yol: 'suzul' },
  },
  {
    id: 'kardan', ad: ad('kardan'), zorluk: 2, renk: '#3E9DF2', sahne: 'kar',
    cizgiler: [
      { parca: 'alt', n: daire(0.5, 0.66, 0.21), kapali: true },
      { parca: 'ust', n: daire(0.5, 0.32, 0.13), kapali: true },
    ],
    canlan: { tepki: 'salla', tum: [{ tip: 'don', pivot: [0.5, 0.87], aci: 5, hiz: 0.6 }], parca: { ust: [{ tip: 'don', pivot: [0.5, 0.45], aci: 12, hiz: 0.8 }] } },
  },
  {
    id: 'araba', ad: ad('araba'), zorluk: 3, renk: '#3E9DF2', sahne: 'yol',
    cizgiler: [
      { parca: 'govde', n: [[0.12, 0.64], [0.12, 0.5], [0.3, 0.5], [0.38, 0.34], [0.64, 0.34], [0.73, 0.5], [0.88, 0.5], [0.88, 0.64], [0.12, 0.64]], kapali: true },
      { parca: 'teker1', n: daire(0.3, 0.67, 0.08, 0.08, 20), kapali: true },
      { parca: 'teker2', n: daire(0.7, 0.67, 0.08, 0.08, 20), kapali: true },
    ],
    canlan: { tepki: 'zipla',
      yol: 'git',
      zemin: 0.93,
      parca: {
        govde: [{ tip: 'kaydir', dx: 0, dy: 0.008, hiz: 3 }],
        teker1: [{ tip: 'cevir', pivot: [0.3, 0.67], hiz: 1.4 }],
        teker2: [{ tip: 'cevir', pivot: [0.7, 0.67], hiz: 1.4 }],
      },
    },
  },
  {
    id: 'tekne', ad: ad('tekne'), zorluk: 3, renk: '#F0413F', sahne: 'okyanus',
    cizgiler: [
      { parca: 'govde', n: [[0.14, 0.62], [0.86, 0.62], [0.72, 0.8], [0.28, 0.8], [0.14, 0.62]], kapali: true },
      { parca: 'direk', n: [[0.5, 0.62], [0.5, 0.16]] },
      { parca: 'yelken', n: [[0.5, 0.18], [0.78, 0.55], [0.5, 0.55]] },
    ],
    canlan: { tepki: 'salla',
      zemin: 0.86,
      tum: [{ tip: 'don', pivot: [0.5, 0.8], aci: 7, hiz: 0.55 }, { tip: 'kaydir', dx: 0, dy: 0.02, hiz: 0.55, faz: 0.25 }],
      parca: { yelken: [{ tip: 'olcek', pivot: [0.5, 0.4], x: 1.12, y: 1, hiz: 1.1 }] },
    },
  },
  {
    id: 'cicek', ad: ad('cicek'), zorluk: 3, renk: '#FF4F8B', sahne: 'cayir',
    cizgiler: [
      { parca: 'orta', n: daire(0.5, 0.32, 0.065, 0.065, 16), kapali: true },
      ...Array.from({ length: 5 }, (_, i): SablonCizgi => {
        const a = (-90 + i * 72) * R;
        return { parca: 'yapraklar', n: daire(0.5 + 0.14 * Math.cos(a), 0.32 + 0.14 * Math.sin(a), 0.07, 0.07, 16), kapali: true };
      }),
      { parca: 'sap', n: [[0.5, 0.46], [0.5, 0.88]] },
      { parca: 'yaprak', n: [[0.5, 0.72], ...yay(0.6, 0.66, 0.1, 0.05, 150, 330, 8).slice(1), ...yay(0.6, 0.66, 0.1, 0.05, -30, 150, 8).slice(1)], kapali: true },
    ],
    kucukParcalar: ['yaprak'],
    canlan: { tepki: 'salla',
      tum: [{ tip: 'don', pivot: [0.5, 0.88], aci: 8, hiz: 0.45 }],
      parca: { yapraklar: [{ tip: 'cevir', pivot: [0.5, 0.32], hiz: 0.1 }], orta: [{ tip: 'olcek', pivot: [0.5, 0.32], x: 1.15, y: 1.15, hiz: 1.2 }] },
    },
  },
  {
    id: 'kelebek', ad: ad('kelebek'), zorluk: 3, renk: '#9B5CE0', sahne: 'gok',
    cizgiler: [
      { parca: 'govde', n: [[0.5, 0.3], [0.5, 0.74]] },
      { parca: 'sol_kanat', n: daire(0.35, 0.4, 0.14, 0.12, 24), kapali: true },
      { parca: 'sol_kanat', n: daire(0.38, 0.62, 0.1, 0.09, 20), kapali: true },
      { parca: 'sag_kanat', n: daire(0.65, 0.4, 0.14, 0.12, 24), kapali: true },
      { parca: 'sag_kanat', n: daire(0.62, 0.62, 0.1, 0.09, 20), kapali: true },
      { parca: 'anten', n: [[0.5, 0.3], [0.43, 0.17]] },
      { parca: 'anten', n: [[0.5, 0.3], [0.57, 0.17]] },
    ],
    kucukParcalar: ['anten'],
    canlan: { tepki: 'zipla',
      yol: 'suzul',
      tum: [{ tip: 'kaydir', dx: 0.1, dy: 0.05, hiz: 0.2 }],
      parca: {
        sol_kanat: [{ tip: 'olcek', pivot: [0.5, 0.5], x: 0.35, y: 1, hiz: 2 }],
        sag_kanat: [{ tip: 'olcek', pivot: [0.5, 0.5], x: 0.35, y: 1, hiz: 2 }],
        anten: [{ tip: 'don', pivot: [0.5, 0.3], aci: 8, hiz: 2 }],
      },
    },
  },
  {
    id: 'kedi', ad: ad('kedi'), zorluk: 3, renk: '#FF8A2B', sahne: 'cayir',
    cizgiler: [
      { parca: 'yuz', n: daire(0.5, 0.56, 0.27, 0.24), kapali: true },
      { parca: 'sol_kulak', n: [[0.29, 0.43], [0.27, 0.17], [0.44, 0.33]] },
      { parca: 'sag_kulak', n: [[0.71, 0.43], [0.73, 0.17], [0.56, 0.33]] },
      { parca: 'gozler', n: daire(0.41, 0.52, 0.03, 0.03, 10), kapali: true },
      { parca: 'gozler', n: daire(0.59, 0.52, 0.03, 0.03, 10), kapali: true },
      { parca: 'biyik', n: [[0.36, 0.64], [0.16, 0.6]] },
      { parca: 'biyik', n: [[0.36, 0.68], [0.16, 0.72]] },
      { parca: 'biyik', n: [[0.64, 0.64], [0.84, 0.6]] },
      { parca: 'biyik', n: [[0.64, 0.68], [0.84, 0.72]] },
    ],
    kucukParcalar: ['gozler'],
    canlan: { tepki: 'zipla',
      tum: [{ tip: 'don', pivot: [0.5, 0.8], aci: 6, hiz: 0.6 }],
      parca: {
        sol_kulak: [{ tip: 'don', pivot: [0.36, 0.38], aci: -10, hiz: 1.3 }],
        sag_kulak: [{ tip: 'don', pivot: [0.64, 0.38], aci: 10, hiz: 1.3, faz: 0.3 }],
        biyik: [{ tip: 'olcek', pivot: [0.5, 0.66], x: 1.1, y: 1, hiz: 2.2 }],
      },
    },
  },
  {
    id: 'dinozor', ad: ad('dinozor'), zorluk: 3, renk: '#3FA535', sahne: 'cayir',
    cizgiler: [
      { parca: 'govde', n: daire(0.44, 0.6, 0.22, 0.14), kapali: true },
      { parca: 'boyun', n: [[0.58, 0.52], [0.66, 0.3], [0.7, 0.21], [0.8, 0.19], [0.85, 0.24], [0.79, 0.29], [0.72, 0.31], [0.66, 0.55], [0.58, 0.52]], kapali: true },
      { parca: 'kuyruk', n: [[0.23, 0.56], [0.06, 0.68], [0.25, 0.67], [0.23, 0.56]], kapali: true },
      { parca: 'bacaklar', n: [[0.34, 0.72], [0.34, 0.86]] },
      { parca: 'bacaklar', n: [[0.41, 0.74], [0.41, 0.86]] },
      { parca: 'bacaklar', n: [[0.5, 0.74], [0.5, 0.86]] },
      { parca: 'bacaklar', n: [[0.57, 0.72], [0.57, 0.86]] },
      { parca: 'dikenler', n: [[0.3, 0.48], [0.34, 0.41], [0.38, 0.47], [0.42, 0.4], [0.46, 0.46], [0.5, 0.4], [0.54, 0.47]] },
    ],
    kucukParcalar: ['dikenler'],
    canlan: {
      tepki: 'zipla',
      zemin: 0.9,
      renkler: { dikenler: '#FF8A2B' },
      parca: {
        boyun: [{ tip: 'don', pivot: [0.62, 0.54], aci: 6, hiz: 0.6 }],
        kuyruk: [{ tip: 'don', pivot: [0.24, 0.62], aci: 12, hiz: 1 }],
        bacaklar: [{ tip: 'kaydir', dx: 0, dy: 0.006, hiz: 1.2 }],
      },
    },
  },
  {
    id: 'roket', ad: ad('roket'), zorluk: 2, renk: '#F0413F', sahne: 'gece',
    cizgiler: [
      { parca: 'govde', n: [...yay(0.5, 0.38, 0.12, 0.24, 180, 360, 20), [0.62, 0.68], [0.38, 0.68], [0.38, 0.38]], kapali: true },
      { parca: 'pencere', n: daire(0.5, 0.42, 0.055), kapali: true },
      { parca: 'kanatlar', n: [[0.38, 0.54], [0.27, 0.72], [0.38, 0.68], [0.38, 0.54]], kapali: true },
      { parca: 'kanatlar', n: [[0.62, 0.54], [0.73, 0.72], [0.62, 0.68], [0.62, 0.54]], kapali: true },
      { parca: 'alev', n: [[0.42, 0.71], [0.46, 0.84], [0.5, 0.75], [0.54, 0.86], [0.58, 0.71]] },
    ],
    kucukParcalar: ['alev'],
    canlan: {
      tepki: 'titre',
      yol: 'yuksel',
      renkler: { alev: '#FF8A2B' },
      tum: [{ tip: 'kaydir', dx: 0.004, dy: 0, hiz: 7 }],
      parca: { alev: [{ tip: 'olcek', pivot: [0.5, 0.71], x: 1.12, y: 1.35, hiz: 3.2 }] },
    },
  },
  {
    id: 'kopek', ad: ad('kopek'), zorluk: 2, renk: '#A0522D', sahne: 'cayir',
    cizgiler: [
      { parca: 'yuz', n: daire(0.5, 0.56, 0.23, 0.21), kapali: true },
      { parca: 'sol_kulak', n: daire(0.27, 0.53, 0.07, 0.15, 24), kapali: true },
      { parca: 'sag_kulak', n: daire(0.73, 0.53, 0.07, 0.15, 24), kapali: true },
      { parca: 'gozler', n: daire(0.42, 0.5, 0.025, 0.025, 10), kapali: true },
      { parca: 'gozler', n: daire(0.58, 0.5, 0.025, 0.025, 10), kapali: true },
      { parca: 'burun', n: daire(0.5, 0.6, 0.05, 0.035, 14), kapali: true },
      { parca: 'agiz', n: yay(0.5, 0.64, 0.08, 0.06, 20, 160, 12) },
    ],
    kucukParcalar: ['gozler', 'burun', 'agiz'],
    canlan: {
      tepki: 'zipla',
      zemin: 0.86,
      tum: [{ tip: 'don', pivot: [0.5, 0.78], aci: 5, hiz: 0.6 }],
      parca: {
        sol_kulak: [{ tip: 'don', pivot: [0.28, 0.39], aci: 12, hiz: 1.4 }],
        sag_kulak: [{ tip: 'don', pivot: [0.72, 0.39], aci: -12, hiz: 1.4, faz: 0.2 }],
      },
    },
  },
  {
    id: 'ucak', ad: ad('ucak'), zorluk: 3, renk: '#3E9DF2', sahne: 'gok',
    cizgiler: [
      { parca: 'govde', n: [[0.2, 0.46], [0.72, 0.46], ...yay(0.72, 0.53, 0.11, 0.07, -90, 90, 14).slice(1), [0.22, 0.6], [0.2, 0.46]], kapali: true },
      { parca: 'kuyruk', n: [[0.2, 0.46], [0.11, 0.25], [0.31, 0.46], [0.2, 0.46]], kapali: true },
      { parca: 'kanat', n: [[0.42, 0.56], [0.32, 0.76], [0.43, 0.76], [0.55, 0.56], [0.42, 0.56]], kapali: true },
      { parca: 'camlar', n: daire(0.48, 0.52, 0.022, 0.022, 10), kapali: true },
      { parca: 'camlar', n: daire(0.57, 0.52, 0.022, 0.022, 10), kapali: true },
      { parca: 'camlar', n: daire(0.66, 0.52, 0.022, 0.022, 10), kapali: true },
    ],
    kucukParcalar: ['camlar'],
    canlan: {
      tepki: 'salla',
      yol: 'git',
      tum: [{ tip: 'don', pivot: [0.5, 0.55], aci: 4, hiz: 0.5 }, { tip: 'kaydir', dx: 0, dy: 0.03, hiz: 0.4 }],
      parca: { kanat: [{ tip: 'olcek', pivot: [0.45, 0.56], x: 1, y: 0.9, hiz: 1.2 }] },
    },
  },
  {
    id: 'tavsan', ad: ad('tavsan'), zorluk: 2, renk: '#FF7EB6', sahne: 'cayir',
    cizgiler: [
      { parca: 'yuz', n: daire(0.5, 0.62, 0.2, 0.18), kapali: true },
      { parca: 'sol_kulak', n: daire(0.42, 0.28, 0.055, 0.17, 24), kapali: true },
      { parca: 'sag_kulak', n: daire(0.58, 0.28, 0.055, 0.17, 24), kapali: true },
      { parca: 'gozler', n: daire(0.44, 0.58, 0.022, 0.022, 10), kapali: true },
      { parca: 'gozler', n: daire(0.56, 0.58, 0.022, 0.022, 10), kapali: true },
      { parca: 'biyik', n: [[0.4, 0.67], [0.26, 0.64]] },
      { parca: 'biyik', n: [[0.4, 0.7], [0.26, 0.73]] },
      { parca: 'biyik', n: [[0.6, 0.67], [0.74, 0.64]] },
      { parca: 'biyik', n: [[0.6, 0.7], [0.74, 0.73]] },
    ],
    kucukParcalar: ['gozler', 'biyik'],
    canlan: {
      tepki: 'zipla',
      zemin: 0.88,
      tum: [{ tip: 'zipla', yukseklik: 0.07, hiz: 0.7, zemin: 0.8 }],
      parca: {
        sol_kulak: [{ tip: 'don', pivot: [0.42, 0.45], aci: -9, hiz: 1.1 }],
        sag_kulak: [{ tip: 'don', pivot: [0.58, 0.45], aci: 9, hiz: 1.1, faz: 0.3 }],
      },
    },
  },
  {
    id: 'ordek', ad: ad('ordek'), zorluk: 2, renk: '#FF8A2B', sahne: 'okyanus',
    cizgiler: [
      { parca: 'govde', n: daire(0.47, 0.63, 0.23, 0.13), kapali: true },
      { parca: 'bas', n: daire(0.66, 0.4, 0.1), kapali: true },
      { parca: 'gaga', n: [[0.745, 0.36], [0.91, 0.415], [0.745, 0.47], [0.745, 0.36]], kapali: true },
      { parca: 'kanat', n: daire(0.44, 0.61, 0.1, 0.055, 20), kapali: true },
    ],
    kucukParcalar: ['gaga'],
    canlan: {
      tepki: 'salla',
      yol: 'yuz',
      zemin: 0.8,
      parca: {
        bas: [{ tip: 'don', pivot: [0.64, 0.5], aci: 8, hiz: 0.8 }],
        gaga: [{ tip: 'don', pivot: [0.64, 0.5], aci: 8, hiz: 0.8 }],
        kanat: [{ tip: 'olcek', pivot: [0.36, 0.61], x: 1.08, y: 1.2, hiz: 1.6 }],
      },
    },
  },
];

export const resim = (id: string) => RESIMLER.find((r) => r.id === id);

/** Yaşa göre önerilen mod: 3 iz, 4 nokta, 5 bakarak, 6 hafızadan. */
export function yasModu(yas: number | null | undefined): Mod {
  if (!yas || yas <= 3) return 'iz';
  if (yas === 4) return 'nokta';
  if (yas === 5) return 'kopya';
  return 'hafiza';
}
