import { kart as kartBul, refCoz } from '../engine/katalog';
import type { Kart, KartGirdi, KartRef } from '../engine/types';
import { h } from './dom';

// Yalnız kart resimlerinin klasörleri (content/sorular → "gorsel"). Eskiden bütün assets/**/*.webp alınıyordu:
// mağaza ekran görüntüleri, pasta/ege… çizimleri de Kartlar paketine (ve uygulamaya) boşuna giriyordu.
// Yeni bir kart klasörü eklenirse buraya da yazılır (tests/unit/kart-gorsel.test.ts denetler).
export const KART_GORSEL_KLASORLERI = ['hayvanlar', 'meyveler', 'renkler', 'tasitlar'] as const;
const gorseller = import.meta.glob<string>(['../../assets/{hayvanlar,meyveler,renkler,tasitlar}/**/*.webp'], {
  eager: true,
  query: '?url',
  import: 'default',
});
const minoResmi = import.meta.glob<string>('../../assets/karakter/mino.webp', { eager: true, query: '?url', import: 'default' });
const gorselMap = new Map<string, string>();
for (const [yol, url] of Object.entries({ ...gorseller, ...minoResmi })) gorselMap.set(yol.replace('../../assets/', ''), url);

export const KONTUR = '#5a3617';
const RENKLER = ['#F0413F', '#3E9DF2', '#5DBE3F', '#FF8A2B', '#9B5CE0', '#FFC72C'];

export function gorselUrl(k: Kart | undefined): string | undefined {
  return k?.gorsel ? gorselMap.get(k.gorsel) : undefined;
}

let onYuklendi = false;
/** Kart resimleri (~2 MB) tema seçilirken önceden yüklenir: kartlar bir an boş durup resim sonradan belirmesin */
export function kartResimleriniYukle(): void {
  if (onYuklendi || typeof Image === 'undefined') return;
  onYuklendi = true;
  for (const url of gorselMap.values()) {
    const i = new Image();
    i.decoding = 'async';
    i.src = url;
  }
}

export function gorselVarMi(k: Kart): boolean {
  return !!gorselUrl(k);
}

/** Bir kartın kısa, konuşulabilir adı. */
export function refAdi(g: KartGirdi): string {
  const r = refCoz(g);
  if (r.yazi) return r.yazi;
  return kartBul(r.kart ?? '')?.ad ?? '';
}

// ---------- SVG çizimleri ----------
function parlama(): string {
  return `<ellipse cx="34" cy="28" rx="11" ry="6" transform="rotate(-30 34 28)" fill="#fff" opacity=".55"/><circle cx="24" cy="38" r="3" fill="#fff" opacity=".5"/>`;
}

function acik(hex: string, oran = 0.35): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const k = (c: number) => Math.round(c + (255 - c) * oran);
  return `rgb(${k(r)},${k(g)},${k(b)})`;
}

let gradSayac = 0;
function dolgu(hex: string): [string, string] {
  const id = `g${++gradSayac}`;
  return [`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${acik(hex)}"/><stop offset="1" stop-color="${hex}"/></linearGradient></defs>`, `url(#${id})`];
}

const SEKIL_YOLLARI: Record<string, string> = {
  daire: '<circle cx="50" cy="50" r="38"/>',
  kare: '<rect x="14" y="14" width="72" height="72" rx="9"/>',
  ucgen: '<path d="M50 12 91 84H9z"/>',
  dikdortgen: '<rect x="6" y="26" width="88" height="50" rx="8"/>',
  yildiz: `<path d="${yildizYolu(50, 53, 42, 18)}"/>`,
  kalp: '<path d="M50 88C22 68 8 52 8 33 8 19 19 10 31 10c9 0 15 5 19 12 4-7 10-12 19-12 12 0 23 9 23 23 0 19-14 35-42 55z"/>',
  oval: '<ellipse cx="50" cy="50" rx="43" ry="29"/>',
};

function yildizYolu(cx: number, cy: number, R: number, r: number): string {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r : R;
    d += `${i ? 'L' : 'M'}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`;
  }
  return d + 'z';
}

export function sekilSvg(sekil: string, renk: string): string {
  const [defs, fill] = dolgu(renk);
  const govde = (SEKIL_YOLLARI[sekil] ?? SEKIL_YOLLARI.daire).replace('/>', ` fill="${fill}" stroke="${KONTUR}" stroke-width="5" stroke-linejoin="round"/>`);
  return `<svg viewBox="0 0 100 100" class="kart-svg">${defs}${govde}${parlama()}</svg>`;
}

export function boyaSvg(renk: string): string {
  const [defs, fill] = dolgu(renk);
  return `<svg viewBox="0 0 100 100" class="kart-svg">${defs}
  <path d="M50 10c15 0 21 9 31 13 12 5 12 21 8 31-4 11 3 22-9 31-11 8-23 3-33 5-14 3-27-2-32-13-5-11 2-19-1-31-3-13 3-26 17-31 7-3 12-5 19-5z" fill="${fill}" stroke="${KONTUR}" stroke-width="5" stroke-linejoin="round"/>
  <circle cx="88" cy="84" r="5.5" fill="${fill}" stroke="${KONTUR}" stroke-width="3.5"/><circle cx="12" cy="88" r="4" fill="${fill}" stroke="${KONTUR}" stroke-width="3"/>
  ${parlama()}</svg>`;
}

export function sepetSvg(renk: string): string {
  const [defs, fill] = dolgu(renk);
  return `<svg viewBox="0 0 100 100" class="kart-svg sepet">${defs}
  <path d="M22 44c0-16 12-28 28-28s28 12 28 28" fill="none" stroke="${KONTUR}" stroke-width="6" stroke-linecap="round"/>
  <path d="M8 44h84l-9 40c-1 5-5 8-10 8H27c-5 0-9-3-10-8z" fill="${fill}" stroke="${KONTUR}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M14 58h72M17 72h66M36 46l3 44M64 46l-3 44M50 46v44" stroke="${KONTUR}" stroke-width="3" opacity=".35"/>
  <rect x="5" y="38" width="90" height="12" rx="6" fill="${fill}" stroke="${KONTUR}" stroke-width="5"/>
  <ellipse cx="24" cy="42" rx="8" ry="2.5" fill="#fff" opacity=".6"/></svg>`;
}

// ---------- Kart içeriği ----------
function resimEl(k: Kart, sinif = 'kart-resim'): HTMLElement {
  const url = gorselUrl(k);
  const yerTutucu = () => h('div.yer-tutucu', { 'data-bekliyor': k.id }, h('span', {}, k.ad));
  if (!url) return yerTutucu();
  const img = h('img', { class: sinif, src: url, alt: k.ad, draggable: 'false', decoding: 'async' });
  img.addEventListener('error', () => img.replaceWith(yerTutucu()), { once: true });
  // resim henüz yüklenmediyse kart bir an bembeyaz durup resim birden belirmesin: yüklenince yumuşakça gelir
  if (!img.complete) {
    img.classList.add('kart-yukleniyor');
    img.addEventListener('load', () => img.classList.remove('kart-yukleniyor'), { once: true });
  }
  return img;
}

/**
 * Renk ve şekil kartlarının resimleri (assets/renkler): boya kutusu, renk sepeti, parlak şekil.
 * Resim yoksa (yeni bir renk/şekil eklendi ama çizilmedi) eski SVG çizimine düşülür.
 */
export function renkResmi(onek: 'boya' | 'sepet' | 'sekil', k: Kart): string | undefined {
  const ad = onek === 'sekil' ? k.deger : k.id.replace(/^renk-/, '');
  return ad ? gorselMap.get(`renkler/${onek}-${ad}.webp`) : undefined;
}

function cizimResim(url: string, alt: string): HTMLElement {
  const img = h('img', { class: 'kart-resim', src: url, alt, draggable: 'false', decoding: 'async' });
  if (!img.complete) {
    img.classList.add('kart-yukleniyor');
    img.addEventListener('load', () => img.classList.remove('kart-yukleniyor'), { once: true });
  }
  return img;
}

/**
 * Boy sırası soruları (olcek 0.3-1): en küçük kart telefonda da seçilebilir büyüklükte kalsın diye
 * görünen ölçek 0.5 + 0.5·olcek (0.3 → 0.65, 1 → 1). Sıra ve aradaki fark korunur.
 */
export function gorunenOlcek(olcek: number): number {
  return Math.round((0.5 + 0.5 * Math.max(0, Math.min(1, olcek))) * 1000) / 1000;
}

function sayiRengi(n: number): string {
  return RENKLER[n % RENKLER.length];
}

function icerik(r: KartRef, ornekGoster: boolean): HTMLElement {
  if (r.yazi) {
    const uz = r.yazi.length;
    return h('div.kart-yazi', { style: `--uz:${uz}` }, r.yazi);
  }
  const k = kartBul(r.kart ?? '');
  if (!k) return h('div.yer-tutucu', {}, h('span', {}, '?'));
  const adet = r.adet ?? 1;

  if (adet > 1 || r.carpi) {
    const grup = h('div.kart-grup', { 'data-adet': adet });
    for (let i = 0; i < adet; i++) {
      const tek = h('div.grup-oge', {}, tekIcerik(k, ornekGoster));
      if (r.carpi && i >= adet - r.carpi) tek.classList.add('carpi');
      grup.append(tek);
    }
    return grup;
  }
  return tekIcerik(k, ornekGoster);
}

function tekIcerik(k: Kart, ornekGoster = false): HTMLElement {
  switch (k.tur) {
    case 'renk': {
      const url = renkResmi('boya', k);
      return url ? cizimResim(url, k.ad) : h('div.kart-cizim', { html: boyaSvg(k.deger ?? '#ccc') });
    }
    case 'sekil': {
      const url = renkResmi('sekil', k);
      return url ? cizimResim(url, k.ad) : h('div.kart-cizim', { html: sekilSvg(k.deger ?? 'daire', k.renk ?? '#3E9DF2') });
    }
    case 'sayi': {
      const n = Number(k.deger);
      const noktalar = h('div.sayi-noktalar');
      for (let i = 0; i < n; i++) noktalar.append(h('i', { style: `--r:${sayiRengi(n)}` }));
      return h('div.kart-sayi', { style: `--r:${sayiRengi(n)}` }, h('b', {}, k.deger ?? ''), n > 0 ? noktalar : null);
    }
    case 'harf': {
      const ornek = k.ornek ? kartBul(k.ornek) : undefined;
      const idx = k.deger ? k.deger.charCodeAt(0) : 0;
      return h(
        'div.kart-harf',
        { style: `--r:${RENKLER[idx % RENKLER.length]}` },
        h('b', {}, k.deger ?? ''),
        ornekGoster && ornek && gorselVarMi(ornek) ? resimEl(ornek, 'harf-ornek') : null,
      );
    }
    default:
      return resimEl(k);
  }
}

export interface KartSecenek {
  sinif?: string;
  /** Harf kartlarında örnek resmi göster (albümde). Oyunda cevabı ele vermesin diye kapalı. */
  ornek?: boolean;
  /**
   * Geniş (yatay) kart. Verilmezse 4+ adetli kart geniş olur. Bir dizide kartlar aynı boyda olsun diye
   * dizinin tamamı için `diziGenis()` ile verilir.
   */
  genis?: boolean;
}

/** Dizide 4+ adetli kart varsa hepsi geniş: biri ötekilerden küçük/farklı durmasın. */
export function diziGenis(girdiler: KartGirdi[]): boolean {
  return girdiler.some((g) => (refCoz(g).adet ?? 1) >= 4);
}

/** Bir kart referansını kart elemanına çevirir. */
export function kartEl(g: KartGirdi, sec: KartSecenek = {}): HTMLElement {
  const r = refCoz(g);
  const k = r.kart ? kartBul(r.kart) : undefined;
  const bicim = r.bicim ?? 'normal';
  const el = h(`div.kart.bicim-${bicim}${k ? `.tur-${k.tur}` : ''}${r.yazi ? '.tur-yazi' : ''}`, {
    'data-kart': r.kart ?? r.yazi ?? '',
  });
  if (sec.sinif) el.classList.add(...sec.sinif.split(' '));
  if (r.olcek) el.style.setProperty('--olcek', String(gorunenOlcek(r.olcek)));
  if (sec.genis ?? (r.adet ?? 1) >= 4) el.classList.add('genis');

  let ic: HTMLElement;
  if (bicim === 'renk' && k) {
    const url = renkResmi('sepet', k);
    ic = url ? cizimResim(url, k.ad) : h('div.kart-cizim', { html: sepetSvg(k.deger ?? '#ccc') });
  } else {
    ic = icerik(r, !!sec.ornek);
  }
  el.append(h('div.kart-ic', {}, ic));
  return el;
}

/** Kart dizisi için yükseklik/genişlik oranı (hepsi geniş kartsa yatay oran). */
export function diziOrani(girdiler: KartGirdi[]): number {
  return diziGenis(girdiler) ? 0.78 : 1.12;
}

/** Kartın arka yüzü: Mino ile Kino madalyonlu mor desen (resim kartlar.css'te; resim yoksa CSS deseni + rozet). */
export function kartArkasi(): HTMLElement {
  return h('div.kart-arka', {}, h('div.arka-rozet', {}, h('span', {}, 'm')));
}
