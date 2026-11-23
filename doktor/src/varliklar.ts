// Minik Doktor örneğinin çizimleri: assets/doktor/ornek/*.webp (Antigravity, ISTEK-08; macentası temizlenmiş, saydam).
// Gerçek sayfada çizimlerden biri eksikse oyun açılmaz. Yer tutucu yalnız test kipinde (?test) üretilir; sahnede hareket
// eden her şey çizimin kendisidir, kodla çizim yapılmaz.
import { TEST_MODU } from '../../src/ui/dom';

const dosyalar = import.meta.glob<string>('../../assets/doktor/ornek/*.webp', { eager: true, query: '?url', import: 'default' });

export const CIZIMLER = [
  'fon-muayene',
  'zipzip-korkulu', 'zipzip-gulumseyen', 'zipzip-zipla', 'zipzip-ayakta-gosteriyor',
  'kino-merhaba', 'kino-gosteriyor', 'kino-sevinc',
  'diz-temiz', 'diz-camur', 'diz-cizik', 'diz-yaprak',
  'stetoskop', 'buyutec', 'cimbiz', 'pamuk-islak', 'alet-tepsisi', 'yildiz-cikartma', 'damga', 'saglik-karnesi',
  'bant-yildiz', 'bant-kalp', 'bant-gokkusagi', 'bant-pati',
] as const;
export type Cizim = (typeof CIZIMLER)[number];

const adres = (ad: Cizim) => dosyalar['../../assets/doktor/ornek/' + ad + '.webp'];
export const eksikCizimler = CIZIMLER.filter(ad => !adres(ad));
/** Bütün çizimler diskteyse ya da test kipindeysek oyun açılır. */
export const oyunAcilir = eksikCizimler.length === 0 || TEST_MODU;

// Test kipi yer tutucuları: yalnız konum ve boyut denemesi için düz kutu ve ad. Diz katmanları aynı 2048×1152 tuvalde,
// gerçek çizimlerdeki gibi yerinde durur (silme yüzdesi ve yaprak bulma bunlarla da çalışsın).
const YER_TUTUCU: Record<Cizim, [number, number, string, string?]> = {
  'fon-muayene': [2752, 1548, '#e7dcf3'],
  'zipzip-korkulu': [620, 760, '#f3a35b'], 'zipzip-gulumseyen': [620, 760, '#f6b26b'],
  'zipzip-zipla': [640, 900, '#f6b26b'], 'zipzip-ayakta-gosteriyor': [560, 900, '#f6b26b'],
  'kino-merhaba': [560, 940, '#fbfbf6'], 'kino-gosteriyor': [640, 940, '#fbfbf6'], 'kino-sevinc': [600, 940, '#fbfbf6'],
  'diz-temiz': [2048, 1152, '', '<ellipse cx="1024" cy="640" rx="560" ry="470" fill="#f3a35b"/><rect x="430" y="0" width="1190" height="240" rx="60" fill="#f3e6c8"/>'],
  'diz-camur': [2048, 1152, '', '<path d="M760 520c80-120 330-150 470-70 150 80 150 250 40 330-120 90-390 90-500 0-80-70-80-170-10-260z" fill="#7b5532"/>'],
  'diz-cizik': [2048, 1152, '', '<path d="M900 600l230-40M930 680l200-30" stroke="#f29bb0" stroke-width="26" stroke-linecap="round"/>'],
  'diz-yaprak': [2048, 1152, '', '<ellipse cx="1430" cy="470" rx="95" ry="52" fill="#58b04f" transform="rotate(-25 1430 470)"/><path d="M1510 430l120-60" stroke="#3d7f36" stroke-width="18" stroke-linecap="round"/>'],
  'stetoskop': [520, 760, '#e0524d'], 'buyutec': [600, 900, '#f19a3e'], 'cimbiz': [260, 900, '#c9ced6'],
  'pamuk-islak': [520, 440, '#ffffff'], 'alet-tepsisi': [1600, 520, '#bfe3f3'], 'yildiz-cikartma': [440, 420, '#f8d23c'],
  'damga': [380, 560, '#b0743c'], 'saglik-karnesi': [1400, 900, '#fff6e0'],
  'bant-yildiz': [900, 320, '#f4d9b4'], 'bant-kalp': [900, 320, '#f7c9d4'], 'bant-gokkusagi': [900, 320, '#d6ecf7'], 'bant-pati': [900, 320, '#ead8c0'],
};
function yerTutucu(ad: Cizim): string {
  const [g, y, renk, ic] = YER_TUTUCU[ad];
  const govde = ic ?? '<rect x="8" y="8" width="' + (g - 16) + '" height="' + (y - 16) + '" rx="' + Math.min(g, y) * 0.12 +
    '" fill="' + renk + '" stroke="#2b2b2b" stroke-width="8"/><text x="50%" y="50%" font-family="sans-serif" font-size="' +
    Math.min(g, y) * 0.09 + '" text-anchor="middle" dominant-baseline="middle" fill="#2b2b2b">' + ad + '</text>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="' + g +
    '" height="' + y + '" viewBox="0 0 ' + g + ' ' + y + '">' + govde + '</svg>');
}

export const cizimAdresi = (ad: Cizim): string => adres(ad) ?? yerTutucu(ad);

const resimler = new Map<Cizim, HTMLImageElement>();
/** Bütün çizimleri yükleyip çözer: sahnenin ilk karesi tam yüklü açılır. */
export async function cizimleriYukle(): Promise<void> {
  await Promise.all(CIZIMLER.map(async ad => {
    const r = new Image();
    r.decoding = 'async';
    r.src = cizimAdresi(ad);
    try { await r.decode(); } catch { await new Promise(t => { r.onload = r.onerror = t; }); }
    resimler.set(ad, r);
  }));
}
export function resim(ad: Cizim): HTMLImageElement {
  const r = resimler.get(ad);
  if (!r) throw new Error('çizim yüklenmedi: ' + ad);
  return r;
}
export function img(ad: Cizim, sinif = ''): HTMLImageElement {
  const r = document.createElement('img');
  r.src = cizimAdresi(ad);
  r.alt = '';
  r.draggable = false;
  r.decoding = 'sync';
  if (sinif) r.className = sinif;
  return r;
}

export interface Leke { x: number; y: number; g: number; y2: number; sol: number; ust: number; }
/** Çizimin saydam olmayan bölgesinin kutusu (tuvalin oranı olarak, 0–1). Diz katmanlarında çizik, çamur ve yaprağın yeri
 *  böyle bulunur; yerleşim elle sayılmaz. */
export function opakKutu(ad: Cizim, esik = 40): Leke {
  const r = resim(ad);
  const G = 256, Y = Math.max(1, Math.round(256 * r.naturalHeight / r.naturalWidth));
  const c = document.createElement('canvas'); c.width = G; c.height = Y;
  const x = c.getContext('2d', { willReadFrequently: true })!;
  x.drawImage(r, 0, 0, G, Y);
  const v = x.getImageData(0, 0, G, Y).data;
  let s = G, u = Y, sa = -1, al = -1;
  for (let j = 0; j < Y; j++) for (let i = 0; i < G; i++) if (v[(j * G + i) * 4 + 3] > esik) {
    if (i < s) s = i; if (i > sa) sa = i; if (j < u) u = j; if (j > al) al = j;
  }
  if (sa < 0) return { x: 0.5, y: 0.5, g: 0, y2: 0, sol: 0.5, ust: 0.5 };
  return { x: (s + sa + 1) / 2 / G, y: (u + al + 1) / 2 / Y, g: (sa - s + 1) / G, y2: (al - u + 1) / Y, sol: s / G, ust: u / Y };
}
/** Çizimin, verilen noktaya en uzak opak pikseli (0–1): yaprağın dışarı bakan sapı. */
export function enUzakNokta(ad: Cizim, ox: number, oy: number, esik = 60): { x: number; y: number } {
  const r = resim(ad);
  const G = 256, Y = Math.max(1, Math.round(256 * r.naturalHeight / r.naturalWidth));
  const c = document.createElement('canvas'); c.width = G; c.height = Y;
  const x = c.getContext('2d', { willReadFrequently: true })!;
  x.drawImage(r, 0, 0, G, Y);
  const v = x.getImageData(0, 0, G, Y).data;
  let en = -1, bx = 0.5, by = 0.5;
  for (let j = 0; j < Y; j++) for (let i = 0; i < G; i++) if (v[(j * G + i) * 4 + 3] > esik) {
    const d = (i / G - ox) ** 2 + ((j / Y - oy) * Y / G) ** 2;
    if (d > en) { en = d; bx = i / G; by = j / Y; }
  }
  return { x: bx, y: by };
}
