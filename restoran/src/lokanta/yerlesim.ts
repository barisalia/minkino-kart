/**
 * Lokantanın büyümesi (§6b): alınan masalar, süsler, mutfağa gelen aletler ve bahçe. Yerler sahnenin yüzdesi (olcek.ts
 * YERLESIM gibi); Gemini lokanta / bahçe çizimleri gelince yalnız buradaki tablolar düzeltilir.
 *
 * - Masa yuvaları: salon 0-3 (olcek.ts YERLESIM.masalar), bahçe 4-5 (sahnenin sağındaki ikinci resim: x > 100).
 * - Süs yuvaları: tavan (avize), duvar (resim), zemin (saksı, bitki, akvaryum). Örtü yuvasız: bütün masalara.
 * - Alet yuvaları: mutfakta iki boş yer (içecek tezgâhı, fırın); mangal bahçedeki mangal yuvasına.
 * - Yuva seçimi: alınan şey için boş yuvalar kesik çizgili halkayla görünür, çocuk birine dokunur (ipucu merdiveni
 *   yalnız 12 sn sonra halkaları kıpırdatır; emir yok).
 *
 * Görseller: önce `assets/restoran/sus/<ad>` (Gemini sus-1 sayfası), yoksa projede onaylı stilde var olan eşya
 * (saksı, bitki, akvaryum, duvar resmi, sarkan lamba). Hiçbiri kaynak pikselinin üstüne büyütülmez (cssEnCok).
 */
import { h, sure, TEST_MODU } from '../../../src/ui/dom';
import { NETLIK_DPR } from '../../../src/ui/netlik';
import { kalem, SUS_YUVALARI, type SusYeri } from '../ekonomi';
import type { Istasyon } from '../mini/arayuz';
import { YERLESIM, type Yer, type Yon } from '../olcek';
import { varlik } from '../varliklar';

// ---------------------------------------------------------------- yerler (sahne yüzdesi)

export interface Kutu {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Bahçe: lokantanın sağında, aynı boyda ikinci resim (x 100-200) */
export const BAHCE: Record<Yon, { masalar: Yer[]; mangal: Kutu }> = {
  yatay: {
    masalar: [
      { x: 128, y: 86 },
      { x: 165, y: 88 },
    ],
    mangal: { x: 178, y: 42, w: 12, h: 20 },
  },
  dikey: {
    masalar: [
      { x: 130, y: 70 },
      { x: 170, y: 86 },
    ],
    mangal: { x: 140, y: 32, w: 22, h: 12 },
  },
};

/** Masa yuvasının yeri (ön kenarın ortası) */
export function masaYeri(yuva: string, yon: Yon): Yer {
  const i = Number(yuva);
  if (i < 4) return YERLESIM[yon].masalar[i];
  return BAHCE[yon].masalar[i - 4] ?? BAHCE[yon].masalar[0];
}

/** Süs yuvaları: süsün tabanının (asılıysa tepesinin) ortası */
export const SUS_YER: Record<Yon, Record<string, Yer>> = {
  yatay: {
    'tavan-1': { x: 30, y: 9.5 },
    'tavan-2': { x: 48, y: 9.5 },
    'duvar-1': { x: 64, y: 20 },
    'duvar-2': { x: 93, y: 11 },
    // lokanta-yatay çizimi (2026-10-17): masa 2 x 86,6'daki zemin lekesine geçti; saksılar masaların arasına
    'zemin-1': { x: 74.6, y: 78 },
    'zemin-2': { x: 50, y: 97 },
    'zemin-3': { x: 3.5, y: 97 },
  },
  dikey: {
    'tavan-1': { x: 33, y: 2 },
    'tavan-2': { x: 64, y: 2 },
    'duvar-1': { x: 80, y: 11 },
    'duvar-2': { x: 50, y: 1.5 },
    'zemin-1': { x: 50, y: 99 },
    'zemin-2': { x: 84, y: 56 },
    'zemin-3': { x: 20, y: 56 },
  },
};

/**
 * Mutfaktaki alet yuvaları (yeni istasyon düğmeleri; olcek.ts YERLESIM.istasyon kutularıyla aynı biçim).
 * Yatay: Gemini lokanta-yatay çiziminde istenen iki boş duvar boşluğu (ocakla mermer arası, en sağ) YOK (ocak ile
 * mermer bitişik, sağda kasa duvara dayalı). Alınan aletler sol duvara, pencerenin altına (zeminde) dizilir.
 */
export const ALET_YER: Record<Yon, Kutu[]> = {
  yatay: [
    { x: 16.5, y: 50, w: 9.5, h: 18 },
    { x: 27, y: 50, w: 9.5, h: 18 },
  ],
  dikey: [
    { x: 30, y: 34, w: 19, h: 9 },
    { x: 50, y: 34, w: 19, h: 9 },
  ],
};

/** Yeni istasyonların hangi alet yuvasına gittiği: alınış sırasıyla (mangal bahçede) */
export function aletKutusu(ist: Istasyon, sira: Istasyon[], yon: Yon): Kutu | null {
  if (ist === 'mangal') return BAHCE[yon].mangal;
  const mutfak = sira.filter((i) => i !== 'mangal');
  const n = mutfak.indexOf(ist);
  return n >= 0 ? (ALET_YER[yon][n] ?? null) : null;
}

// ---------------------------------------------------------------- süs görselleri

/** Onaylı stilde var olan eşyalar (Gemini sus-1 sayfası gelene kadar ya da kalıcı) */
const VAR_OLAN = import.meta.glob<string>(
  [
    '../../../assets/film-seri2/esya/saksi.webp',
    '../../../assets/elektrik/saksi.webp',
    '../../../assets/pati/kose-akvaryum.webp',
    '../../../assets/uyku/resim.webp',
    '../../../assets/kino-otobus/lamba.webp',
    '../../../assets/pasta/kumbara-kavanoz-1.webp',
  ],
  { eager: true, query: '?url', import: 'default' },
);
const varOlan = (yol: string) => VAR_OLAN[`../../../assets/${yol}.webp`] ?? null;

interface SusGorsel {
  /** kaynak ve doğal boy (px) */
  yedek: string;
  dogal: [number, number];
  /** ekrandaki yükseklik (boy birimi; Mino = 1) */
  boy: number;
}
const SUS_GORSEL: Record<string, SusGorsel> = {
  saksi: { yedek: 'film-seri2/esya/saksi', dogal: [794, 1024], boy: 1.05 },
  bitki: { yedek: 'elektrik/saksi', dogal: [279, 399], boy: 1.15 },
  akvaryum: { yedek: 'pati/kose-akvaryum', dogal: [707, 615], boy: 1.25 },
  resim: { yedek: 'uyku/resim', dogal: [395, 336], boy: 0.95 },
  avize: { yedek: 'kino-otobus/lamba', dogal: [497, 1024], boy: 1.25 },
};

/** Süsün resmi ve en çok kaç css px boyunda çizilebileceği (netlik: css × 3 ≤ doğal) */
export function susResmi(id: string): { url: string; enCokH: number; boy: number; oran: number } | null {
  const g = SUS_GORSEL[id];
  if (!g) return null;
  const gemini = varlik(`sus/${id}`);
  const url = gemini ?? varOlan(g.yedek);
  if (!url) return null;
  // Gemini çizimi (sus-1, 2752 genişliğinde sayfadan) yedekten büyüktür; boyu bilinmiyorsa yedeğin sınırı kalır
  return { url, enCokH: g.dogal[1] / NETLIK_DPR, boy: g.boy, oran: g.dogal[0] / g.dogal[1] };
}
export const kumbaraResmi = () => varlik('ui/kumbara') ?? varOlan('pasta/kumbara-kavanoz-1');

/** Bir süsün sahnedeki görünümü (asılı olanlar tepesinden, diğerleri tabanından) */
export function susEl(id: string, yuva: string): HTMLElement {
  const r = susResmi(id);
  const asili = yuva.startsWith('tavan') || yuva.startsWith('duvar');
  const el = h('div.rs-sus', { 'data-sus': id, 'data-yuva': yuva, 'data-asili': asili ? '1' : undefined });
  if (r) {
    el.style.setProperty('--rs-sus-boy', String(r.boy));
    el.style.setProperty('--rs-sus-enCok', `${r.enCokH.toFixed(1)}px`);
    el.style.setProperty('--rs-sus-oran', r.oran.toFixed(4));
    el.append(h('img', { src: r.url, alt: '', draggable: 'false' }));
  } else el.classList.add('rs-sus-yok');
  return el;
}

/** Süs katmanı: kayıttaki yerleşimi çizer / günceller */
export function susleriCiz(kap: HTMLElement, sus: Record<string, string>, yon: Yon) {
  for (const e of kap.querySelectorAll<HTMLElement>('.rs-sus')) if (sus[e.dataset.yuva ?? ''] !== e.dataset.sus) e.remove();
  for (const [yuva, id] of Object.entries(sus)) {
    let e = kap.querySelector<HTMLElement>(`.rs-sus[data-yuva="${yuva}"]`);
    if (!e) {
      e = susEl(id, yuva);
      kap.append(e);
    }
    const y = SUS_YER[yon][yuva];
    if (!y) continue;
    e.style.left = `${y.x}%`;
    e.style.top = `${y.y}%`;
    e.style.zIndex = yuva.startsWith('zemin') ? String(Math.round(y.y * 10) + 1) : '12';
  }
}

// ---------------------------------------------------------------- yuva seçimi

export interface YuvaSecimi {
  /** çocuğun dokunduğu yuva */
  secildi: Promise<string>;
  /** ipucu merdiveni için halkalar */
  halkalar: () => HTMLElement[];
  iptal(): void;
}

/**
 * Boş yuvaları kesik çizgili halkayla gösterir; çocuk birine dokununca çözülür. Masa yuvası masanın kendisi kadar,
 * süs yuvası süs kadar. Halkalar yavaşça nefes alır (sürekli parlama değil); 12 sn'de bir kıpır (ipucu.ts).
 */
export function yuvaSec(kap: HTMLElement, yuvalar: string[], tur: 'masa' | SusYeri, yon: Yon, onIzleme?: (yuva: string) => HTMLElement | null): YuvaSecimi {
  let coz: (y: string) => void = () => undefined;
  const secildi = new Promise<string>((r) => (coz = r));
  const els: HTMLElement[] = [];
  let bitti = false;
  for (const y of yuvalar) {
    const yer = tur === 'masa' ? masaYeri(y, yon) : SUS_YER[yon][y];
    if (!yer) continue;
    const b = h('button.rs-yuva', { type: 'button', 'data-tur': tur, 'data-yuva': y, 'aria-label': 'Buraya' });
    b.style.left = `${yer.x}%`;
    b.style.top = `${yer.y}%`;
    const on = onIzleme?.(y);
    if (on) b.append(on);
    b.addEventListener('click', () => {
      if (bitti) return;
      bitti = true;
      b.classList.add('rs-secili');
      for (const e of els) if (e !== b) e.classList.add('rs-sondu');
      window.setTimeout(() => temizle(), TEST_MODU ? 10 : sure(260));
      coz(y);
    });
    els.push(b);
    kap.append(b);
  }
  const temizle = () => els.forEach((e) => e.remove());
  return {
    secildi,
    halkalar: () => els.filter((e) => e.isConnected),
    iptal() {
      bitti = true;
      temizle();
    },
  };
}

/** Sahnenin kaç ekran genişliği olduğu (bahçe varsa 2) */
export const sahneGenisligi = (bolum: string[]) => (bolum.includes('bahce') ? 2 : 1);

/** Gerekli süs türü: kalem kimliğinden (yerleştirme ekranı için) */
export const susYeri = (id: string): SusYeri | null => kalem(id)?.yer ?? null;
export const susYuvalariTumu = SUS_YUVALARI;
