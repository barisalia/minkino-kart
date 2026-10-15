/**
 * Uyku Vakti (ekip/senaryo/GECE-ISI.md): çocuk Mino ile Kino'yu yatırır. Oyuncaklar sepete (Kino'nun kemiği Kino'ya),
 * yastıklar, battaniyeler (Kino bir kez tekmeler), perde ve "İyi geceler, Ay!", gece lambası; ikisi uyur ve uygulama
 * sabah 06:00'ya kadar uyuyan odada açılır (ebeveyn kapısı uyandırır). Her adım ya dokunarak ya sürükleyerek yapılır,
 * hiç dokunulmazsa yardım merdiveniyle (4 / 10 / 18 sn) kendiliğinden ilerler; hiçbir şey kilitlenmez.
 *
 * Karakterler kendi motorlarıyla oynar (Mino: src/mino/mino.ts, Kino: src/karakter/karakter.ts): yalnız poz, ifade,
 * ezilme-esneme ve bütün gövde hareketi; kol ya da parça döndürülmez. Eşyalar Gemini çizimleri (assets/uyku/*.webp,
 * ekip/illustrator/uyku-isle.cjs); dosya yoksa sade yer tutucu (düz renk, kalın kahve kontur).
 * Özellik UYKU_ACIK bayrağının arkasında (uyku-mantik.ts); denemek için ?uyku=1 (&saat=21).
 */
import './uyku.css';
import uykuJson from '../../content/uyku.json';
import { DosyaMuzik, fonDosyasi } from '../../src/audio/dosya-muzik';
import { efekt, KINO_SESI, konus, sus } from '../../src/audio/ses';
import { Karakter, type Poz as KPoz } from '../../src/karakter/karakter';
import '../../src/karakter/karakter.css';
import { Mino } from '../../src/mino/mino';
import { ebeveynKapisiAc } from '../../src/ui/ebeveyn-kapisi';
import { KREM } from '../../src/ui/gecis';
import { h, sure, svg, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { elSurukle, icinde } from '../../kino-otobus/src/dokunsal';
import { acilisDurumu, aksamMi, kayitOku, simdiBul, type Adim, type Sahip, type UykuKaydi, UYKU_ANAHTAR, uykuEtkin, yardimBasamagi } from './uyku-mantik';

const AZ = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const Q = () => new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
const MINO_TON = 1.12;
const CUMLE = uykuJson;

// ---------------------------------------------------------------- durum (localStorage)
/** Özellik açık mı (bayrak ya da ?uyku=1) */
export const uykuEtkinMi = () => uykuEtkin(Q());
/** Şu an (?saat= taklidiyle) */
export const uykuSimdi = () => simdiBul(Q());
export const aksamMiSimdi = () => aksamMi(uykuSimdi().getHours());

function kayitAl(): UykuKaydi | null {
  try {
    return kayitOku(localStorage.getItem(UYKU_ANAHTAR));
  } catch {
    return null;
  }
}
function kayitYaz(k: UykuKaydi | null) {
  try {
    if (k) localStorage.setItem(UYKU_ANAHTAR, JSON.stringify(k));
    else localStorage.removeItem(UYKU_ANAHTAR);
  } catch {
    /* depolama yok: kilit tutulmaz */
  }
}
/** Açılışta: uyuyan oda kilidi, sabah selamı ya da hiçbiri (bayrak kapalıyken hep 'yok') */
export function uykuAcilisi(): 'kilit' | 'gunaydin' | 'yok' {
  if (!uykuEtkinMi()) return 'yok';
  return acilisDurumu(kayitAl(), uykuSimdi());
}
/** Sabah selamı söylendi: bir daha söylenmez */
export function gunaydinSoylendi() {
  const k = kayitAl();
  if (k) kayitYaz({ ...k, gunaydin: true });
}
/** Ebeveyn kapısından geçildi: kilit silinir */
export const uykuKilidiniSil = () => kayitYaz(null);

/** Uyuyan odada mı (Android geri tuşu: uygulamadan çıkılır, kilit bozulmaz; ritüelde menüye dönülür) */
export const uykuOdadaMi = () => document.querySelector<HTMLElement>('.ug-u-oda')?.dataset.adim === 'oda';

/** Menüden / Ebeveyn Köşesi'nden uyku ekranına: krem perde iner, sonra ekran değişir (perdeyi uyku ekranı açar) */
export function uykuyaGec(app: Uygulama) {
  if (TEST_MODU || AZ) {
    app.git('uyku');
    return;
  }
  const p = h('div.ug-u-gecis', { 'aria-hidden': 'true', style: `background:${KREM}` });
  document.body.append(p);
  void p.offsetWidth;
  p.classList.add('ac');
  window.setTimeout(() => app.git('uyku'), 320);
}
function perdeyiKaldir() {
  const p = document.querySelector<HTMLElement>('.ug-u-gecis');
  if (!p) return;
  p.classList.remove('ac');
  window.setTimeout(() => p.remove(), 420);
}

// ---------------------------------------------------------------- görseller
const RESIMLER = import.meta.glob<string>('../../assets/uyku/*.webp', { eager: true, query: '?url', import: 'default' });
const OLCU_DOSYA = import.meta.glob<{ olcu: Record<string, [number, number]> }>('../../assets/uyku/olcu.json', { eager: true, import: 'default' });
const OLCU: Record<string, [number, number]> = Object.values(OLCU_DOSYA)[0]?.olcu ?? {};

/** Gemini U1 (oda) ve U2 (yatak) sayfalarından kesilen 23 dosya */
export const VARLIKLAR = [
  'pencere-acik', 'pencere-kapali', 'hali', 'komodin', 'lamba-sonuk', 'lamba-yanik', 'oyuncak-sepeti', 'raf', 'resim',
  'sepet', 'sepet-on', 'minder', 'minder-on', 'yastik-mino', 'yastik-kino', 'battaniye-mino', 'battaniye-kino',
  'yigin-mino', 'yigin-kino', 'top', 'kupler', 'tren', 'kemik',
] as const;
type Varlik = (typeof VARLIKLAR)[number];
const resim = (ad: Varlik): string | undefined => RESIMLER[`../../assets/uyku/${ad}.webp`];
/** Uyku görseli (menüdeki ay lambası); dosya yoksa undefined */
export const uykuResmi = resim;
/** Henüz gelmemiş (yer tutucuyla çizilen) görseller */
export const eksikVarliklar = () => VARLIKLAR.filter((a) => !resim(a));

/** Yer tutucunun en / boy oranı (görsel gelince olcu.json'daki gerçek oran) */
const ORAN_YEDEK: Record<Varlik, number> = {
  'pencere-acik': 0.95, 'pencere-kapali': 0.95, hali: 3.4, komodin: 1.05, 'lamba-sonuk': 0.9, 'lamba-yanik': 0.9,
  'oyuncak-sepeti': 1.6, raf: 2.4, resim: 1.25, sepet: 2.2, 'sepet-on': 2.2, minder: 2.4, 'minder-on': 2.4,
  'yastik-mino': 1.6, 'yastik-kino': 1.6, 'battaniye-mino': 2.4, 'battaniye-kino': 2.6, 'yigin-mino': 1.7,
  'yigin-kino': 1.7, top: 1, kupler: 0.8, tren: 1.3, kemik: 2.1,
};
const oran = (ad: Varlik) => {
  const o = OLCU[ad];
  return resim(ad) && o ? o[0] / o[1] : ORAN_YEDEK[ad];
};
/** Yer tutucu rengi (düz; gradyan yok) */
const RENK: Partial<Record<Varlik, string>> = {
  'pencere-acik': '#2f3f7c', 'pencere-kapali': '#f4e3c0', hali: '#f2c9b4', komodin: '#c98d55', 'lamba-sonuk': '#f3ead2',
  'lamba-yanik': '#ffd75e', 'oyuncak-sepeti': '#d9a964', raf: '#c98d55', resim: '#fffaf0', sepet: '#d8a866',
  'sepet-on': '#c8954f', minder: '#9cc8ec', 'minder-on': '#86b6e0', 'yastik-mino': '#fff1d6', 'yastik-kino': '#ffe08a',
  'battaniye-mino': '#f6b8c8', 'battaniye-kino': '#b9b3ee', 'yigin-mino': '#f6b8c8', 'yigin-kino': '#b9b3ee',
  top: '#ef7d6b', kupler: '#b8dca0', tren: '#e9b067', kemik: '#a9d2f2',
};

// ---------------------------------------------------------------- yerleşim (GECE-ISI.md §7)
/**
 * x: yatay merkez (sahnenin %'si), y: taban (sahnenin %'si) ya da ust: tepe (%); w / hh: CSS genişlik / yükseklik
 * (yatayda cqh, dikeyde cqw: ekranın kısa kenarına göre).
 */
interface Yer {
  x: number;
  y?: number;
  ust?: number;
  w?: string;
  hh?: string;
  /** taban yerine bir başkasının üstüne oturur (komodinin üstündeki lamba) */
  ustunde?: string;
  /** en çok bu yükseklik (resim kutuda oranını korur: object-fit contain) */
  enCokBoy?: string;
  gizli?: boolean;
}
type Yerlesim = Record<string, Yer>;
const YATAY: Yerlesim = {
  pencere: { x: 50, ust: 6, hh: '44cqh' },
  raf: { x: 15, y: 30, w: '27cqh' },
  resim: { x: 85, y: 35, hh: '21cqh' },
  hali: { x: 50, y: 99, w: '50cqw', enCokBoy: '24cqh' },
  komodin: { x: 48, y: 71, w: '17cqh' },
  lamba: { x: 48, ustunde: 'komodin', w: '19cqh' },
  'yatak-mino': { x: 28, y: 71.5, w: '37cqh' },
  'yatak-kino': { x: 69, y: 71.5, w: '48cqh' },
  'mino-ayakta': { x: 28, y: 81, hh: '40cqh' },
  'kino-ayakta': { x: 69, y: 81, hh: '44cqh' },
  'mino-yatakta': { x: 28, y: 71, hh: '40cqh' },
  'kino-yatakta': { x: 69, y: 71.3, hh: '44cqh' },
  'yastik-mino-bekle': { x: 8, y: 95, w: '20cqh' },
  'yastik-kino-bekle': { x: 19, y: 95, w: '21cqh' },
  'yastik-mino-yatak': { x: 33, y: 60, w: '20cqh' },
  'yastik-kino-yatak': { x: 75, y: 59, w: '23cqh' },
  'battaniye-mino-bekle': { x: 8, y: 95, w: '22cqh' },
  'battaniye-kino-bekle': { x: 19, y: 95, w: '22cqh' },
  'battaniye-mino-yatak': { x: 28, y: 72, w: '38cqh', enCokBoy: '16cqh' },
  'battaniye-kino-yatak': { x: 69, y: 72, w: '49cqh', enCokBoy: '17cqh' },
  'yigin-kino': { x: 84, y: 82, w: '20cqh' },
  top: { x: 38, y: 95, w: '12cqh' },
  kupler: { x: 47, y: 95, w: '10.5cqh' },
  tren: { x: 56.5, y: 95, w: '15cqh' },
  kemik: { x: 65.5, y: 94, w: '15cqh' },
  'oyuncak-sepeti': { x: 89, y: 98, w: '22cqh' },
};
const DIKEY: Yerlesim = {
  pencere: { x: 50, ust: 5, w: '62cqw', enCokBoy: '40cqh' },
  raf: { x: 0, y: 0, gizli: true },
  resim: { x: 0, y: 0, gizli: true },
  hali: { x: 50, y: 92.5, w: '86cqw', enCokBoy: '15cqh' },
  komodin: { x: 50, y: 63, w: '15cqw' },
  lamba: { x: 50, ustunde: 'komodin', w: '17cqw' },
  'yatak-mino': { x: 26, y: 66, w: '34cqw' },
  'yatak-kino': { x: 72, y: 66, w: '42cqw' },
  'mino-ayakta': { x: 26, y: 74, hh: '36cqw' },
  'kino-ayakta': { x: 72, y: 74, hh: '40cqw' },
  'mino-yatakta': { x: 26, y: 65.7, hh: '36cqw' },
  'kino-yatakta': { x: 72, y: 65.8, hh: '40cqw' },
  'yastik-mino-bekle': { x: 15, y: 90.5, w: '21cqw' },
  'yastik-kino-bekle': { x: 36, y: 90.5, w: '22cqw' },
  'yastik-mino-yatak': { x: 31, y: 60.5, w: '18cqw' },
  'yastik-kino-yatak': { x: 78, y: 60, w: '20cqw' },
  'battaniye-mino-bekle': { x: 15, y: 91, w: '21cqw' },
  'battaniye-kino-bekle': { x: 36, y: 91, w: '22cqw' },
  'battaniye-mino-yatak': { x: 26, y: 66.6, w: '35cqw', enCokBoy: '15cqw' },
  'battaniye-kino-yatak': { x: 72, y: 66.6, w: '43cqw', enCokBoy: '16cqw' },
  'yigin-kino': { x: 82, y: 76.5, w: '19cqw' },
  top: { x: 15, y: 90, w: '12cqw' },
  kupler: { x: 33.2, y: 90, w: '10cqw' },
  tren: { x: 51.4, y: 90, w: '14cqw' },
  kemik: { x: 71.4, y: 89.5, w: '14cqw' },
  'oyuncak-sepeti': { x: 90, y: 94, w: '19cqw' },
};

// ---------------------------------------------------------------- yardımcılar
const IPTAL = Symbol('iptal');
const yatayMi = () => innerWidth >= innerHeight;

interface Esya {
  el: HTMLElement;
  ic: HTMLElement;
}

/** Eşya kutusu: dış (yer + taşınma), iç (ezilme-esneme); içerik resim ya da yer tutucu */
function esyaKur(ad: Varlik, sinif: string, ...ek: Varlik[]): Esya {
  const ic = h('div.ug-u-ic');
  for (const a of [ad, ...ek]) {
    const url = resim(a);
    const katman = url
      ? h('img.ug-u-resim', { src: url, alt: '', draggable: 'false', decoding: 'async', 'data-katman': a })
      : h(`div.ug-u-yer${a.endsWith('-on') ? '.ug-u-yer-on' : ''}`, { 'data-katman': a, style: `--renk:${RENK[a] ?? '#eee'}` });
    ic.append(katman);
  }
  const el = h(`div.ug-u-esya.${sinif}`, { 'data-ad': ad, style: `--oran:${oran(ad).toFixed(4)}` }, ic);
  return { el, ic };
}

/** Parabolik yay (FLIP): el (dx, dy) uzaktan yerine yükseklik kadar kavis çizerek gelir; ek: her karede ek dönüşüm */
function yayOynat(el: HTMLElement, dx: number, dy: number, yukseklik: number, ms: number, o: { olcek?: number; aci?: number; easing?: string } = {}) {
  if (AZ || (!dx && !dy && !yukseklik)) return Promise.resolve();
  const n = 12;
  const kare: Keyframe[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = dx * (1 - t);
    const y = dy * (1 - t) - 4 * yukseklik * t * (1 - t);
    const s = (o.olcek ?? 1) + (1 - (o.olcek ?? 1)) * t;
    const a = (o.aci ?? 0) * Math.sin(t * Math.PI);
    kare.push({ transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${a.toFixed(2)}deg) scale(${s.toFixed(3)})`, offset: t });
  }
  return el.animate(kare, { duration: sure(ms), easing: o.easing ?? 'cubic-bezier(.35,.1,.45,1)' }).finished.then(
    () => undefined,
    () => undefined,
  );
}

/** Yatay kayarak hop: translateX x0'dan x1'e, yükseklik kadar kavis; son konumda kalır (fill) */
function kayHop(el: HTMLElement, x0: number, x1: number, yukseklik: number, ms: number) {
  if (AZ) return Promise.resolve();
  const kare: Keyframe[] = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    kare.push({ transform: `translate(${(x0 + (x1 - x0) * t).toFixed(1)}px, ${(-4 * yukseklik * t * (1 - t)).toFixed(1)}px)`, offset: t });
  }
  return el.animate(kare, { duration: sure(ms), easing: 'ease-in-out', fill: 'forwards' }).finished.then(
    () => undefined,
    () => undefined,
  );
}

/** Ezilme-esneme (taban pivotlu): [sx, sy] dizisi */
function ezEsne(el: HTMLElement, adimlar: [number, number][], ms: number, koken = '50% 100%') {
  if (AZ) return Promise.resolve();
  el.style.transformOrigin = koken;
  const kare = [{ transform: 'scale(1, 1)' }, ...adimlar.map(([x, y]) => ({ transform: `scale(${x}, ${y})` })), { transform: 'scale(1, 1)' }];
  return el.animate(kare, { duration: sure(ms), easing: 'ease-out' }).finished.then(
    () => undefined,
    () => undefined,
  );
}

const merkez = (r: DOMRect): [number, number] => [r.left + r.width / 2, r.top + r.height / 2];

// ---------------------------------------------------------------- ekran
export interface UykuParam {
  /** doğrudan uyuyan oda (kilitli açılış) */
  oda?: boolean;
}

export function uykuEkrani(app: Uygulama, param?: UykuParam): Ekran {
  const q = Q();
  const yardimAcik = !(TEST_MODU && q.get('yardim') === '0');
  const yardimOlcek = TEST_MODU ? 0.02 : 1;
  let kapandi = false;
  const zamanlar: number[] = [];
  const sonra = (ms: number, fn: () => void) => zamanlar.push(window.setTimeout(fn, sure(ms)));
  const bekle = (ms: number) =>
    new Promise<void>((coz, red) => {
      zamanlar.push(window.setTimeout(() => (kapandi ? red(IPTAL) : coz()), sure(ms)));
    });
  const devam = () => {
    if (kapandi) throw IPTAL;
  };

  // ------------------------------------------------ sahne
  const kok = h('div.ug-u-oda', { 'data-adim': 'acilis' });
  const adimYaz = (a: Adim) => (kok.dataset.adim = a);
  const duvar = h('div.ug-u-duvar', { 'aria-hidden': 'true' }, h('i.ug-u-lambri'));
  const zemin = h('div.ug-u-zemin', { 'aria-hidden': 'true' });

  const pencere = esyaKur('pencere-acik', 'ug-u-pencere', 'pencere-kapali');
  pencere.el.dataset.durum = 'acik';
  const raf = esyaKur('raf', 'ug-u-raf');
  const tablo = esyaKur('resim', 'ug-u-tablo');
  const hali = esyaKur('hali', 'ug-u-hali');
  const komodin = esyaKur('komodin', 'ug-u-komodin');
  const lamba = esyaKur('lamba-sonuk', 'ug-u-lamba', 'lamba-yanik');
  lamba.el.dataset.durum = 'sonuk';
  const isik = h('div.ug-u-isik', { 'aria-hidden': 'true' });
  const yatak: Record<Sahip, Esya> = { mino: esyaKur('sepet', 'ug-u-yatak'), kino: esyaKur('minder', 'ug-u-yatak') };
  const yatakOn: Record<Sahip, Esya> = { mino: esyaKur('sepet-on', 'ug-u-yatak-on'), kino: esyaKur('minder-on', 'ug-u-yatak-on') };
  const yastik: Record<Sahip, Esya> = { mino: esyaKur('yastik-mino', 'ug-u-yastik'), kino: esyaKur('yastik-kino', 'ug-u-yastik') };
  const battaniye: Record<Sahip, Esya> = { mino: esyaKur('battaniye-mino', 'ug-u-battaniye'), kino: esyaKur('battaniye-kino', 'ug-u-battaniye') };
  const yigin = esyaKur('yigin-kino', 'ug-u-yigin');
  const OYUNCAKLAR = ['top', 'kupler', 'tren'] as const;
  const oyuncak = Object.fromEntries(OYUNCAKLAR.map((a) => [a, esyaKur(a, 'ug-u-oyuncak')])) as Record<(typeof OYUNCAKLAR)[number], Esya>;
  const kemik = esyaKur('kemik', 'ug-u-oyuncak');
  const sepet = esyaKur('oyuncak-sepeti', 'ug-u-sepet');
  for (const s of ['mino', 'kino'] as const) {
    yatak[s].el.dataset.sahip = yatakOn[s].el.dataset.sahip = yastik[s].el.dataset.sahip = battaniye[s].el.dataset.sahip = s;
  }
  const gece = h('div.ug-u-gece', { 'aria-hidden': 'true' });
  const zKatman = h('div.ug-u-zler', { 'aria-hidden': 'true' });
  const elIpucu = h('div.ug-u-el', { 'aria-hidden': 'true' }, svg(IKON.el));

  // ------------------------------------------------ karakterler (kendi motorlarıyla)
  const mino = new Mino();
  const kino = new Karakter('kino', h('div'));
  let kinoGozKapali = false;
  kino.ekHareket = (p: KPoz) => {
    if (kinoGozKapali) p.gozKapali = true;
  };
  const karKur = (kim: Sahip, ic: HTMLElement) => {
    const nefes = h('div.ug-u-nefes', {}, ic);
    const sek = h('div.ug-u-sek', {}, nefes);
    const el = h('div.ug-u-kar', { 'data-kim': kim, 'data-yer': '' }, sek);
    return { el, sek, nefes };
  };
  const MK = karKur('mino', mino.el);
  const KK = karKur('kino', h('div.ug-u-kino-ic', {}, kino.el));
  const kar: Record<Sahip, typeof MK> = { mino: MK, kino: KK };

  const kapi = h('button.ug-kapi.ug-u-kapi', { type: 'button', 'aria-label': 'Ebeveyn köşesi' }, h('span.ug-kapi-daire', {}, svg(IKON.ebeveyn)));
  const kose = h('div.ug-u-kose', {}, kapi);

  kok.append(
    duvar, zemin, pencere.el, raf.el, tablo.el, hali.el, komodin.el, yatak.mino.el, yatak.kino.el, yastik.mino.el, yastik.kino.el,
    MK.el, KK.el, yatakOn.mino.el, yatakOn.kino.el, battaniye.mino.el, battaniye.kino.el, yigin.el, sepet.el,
    ...OYUNCAKLAR.map((a) => oyuncak[a].el), kemik.el, gece, isik, lamba.el, zKatman, elIpucu, kose,
  );

  // ------------------------------------------------ yerleşim: her öğenin bir "yer" anahtarı; yön değişince yeniden
  const yerler = new Map<HTMLElement, string>();
  const yerUygula = (el: HTMLElement, anahtar: string) => {
    const tablo_ = yatayMi() ? YATAY : DIKEY;
    const y = tablo_[anahtar];
    if (!y) return;
    el.dataset.yer = anahtar;
    el.style.display = y.gizli ? 'none' : '';
    if (y.gizli) return;
    el.style.left = `${y.x}%`;
    el.style.width = y.w ?? 'auto';
    el.style.height = y.hh ?? 'auto';
    el.style.maxHeight = y.enCokBoy ?? '';
    if (y.ust !== undefined) {
      el.style.top = `${y.ust}%`;
      el.style.translate = '-50% 0';
    } else if (y.ustunde) {
      const alt = tablo_[y.ustunde];
      const altOran = oran('komodin');
      el.style.top = `calc(${alt.y}% - ${alt.w} / ${altOran.toFixed(4)} + 0.6cqmin)`;
      el.style.translate = '-50% -100%';
    } else {
      el.style.top = `${y.y}%`;
      el.style.translate = '-50% -100%';
    }
  };
  const yerAta = (el: HTMLElement, anahtar: string) => {
    yerler.set(el, anahtar);
    yerUygula(el, anahtar);
  };
  const herYer = () => {
    for (const [el, a] of yerler) yerUygula(el, a);
    kok.classList.toggle('ug-u-yatay', yatayMi());
    kok.classList.toggle('ug-u-dikey', !yatayMi());
    kok.classList.toggle('ug-u-kisa', yatayMi() && innerHeight <= 375);
  };
  yerAta(pencere.el, 'pencere');
  yerAta(raf.el, 'raf');
  yerAta(tablo.el, 'resim');
  yerAta(hali.el, 'hali');
  yerAta(komodin.el, 'komodin');
  yerAta(lamba.el, 'lamba');
  for (const s of ['mino', 'kino'] as const) {
    yerAta(yatak[s].el, `yatak-${s}`);
    yerAta(yatakOn[s].el, `yatak-${s}`);
    yerAta(yastik[s].el, `yastik-${s}-bekle`);
    yerAta(battaniye[s].el, `battaniye-${s}-bekle`);
    yerAta(kar[s].el, `${s}-ayakta`);
  }
  yerAta(yigin.el, 'yigin-kino');
  for (const a of OYUNCAKLAR) yerAta(oyuncak[a].el, a);
  yerAta(kemik.el, 'kemik');
  yerAta(sepet.el, 'oyuncak-sepeti');
  herYer();
  const boyut = () => {
    herYer();
    isikYerlestir();
  };
  addEventListener('resize', boyut);

  // görünürlük: başta yastık, battaniye, yığın gizli
  const goster = (el: HTMLElement, acik: boolean) => el.classList.toggle('ug-u-yok', !acik);
  for (const s of ['mino', 'kino'] as const) {
    goster(yastik[s].el, false);
    goster(battaniye[s].el, false);
  }
  goster(yigin.el, false);

  /** Karakter yatakta mı (yatağın ön kenarı önüne gelir) */
  const yatakta: Record<Sahip, boolean> = { mino: false, kino: false };

  /** FLIP: eleman yeni yerine yay çizerek gider */
  const tasi = async (el: HTMLElement, anahtar: string, yukseklik: number, ms: number, o: { olcek?: number; aci?: number; ortada?: () => void } = {}) => {
    const a = el.getBoundingClientRect();
    for (const an of el.getAnimations()) an.cancel();
    el.style.transform = '';
    yerAta(el, anahtar);
    const b = el.getBoundingClientRect();
    const dx = a.left + a.width / 2 - (b.left + b.width / 2);
    const dy = a.bottom - b.bottom;
    if (o.ortada) zamanlar.push(window.setTimeout(o.ortada, sure(ms * 0.5)));
    await yayOynat(el, dx, dy, yukseklik, ms, { olcek: o.olcek ?? (b.width ? a.width / b.width : 1), aci: o.aci });
  };
  /** Bir noktaya (ekran) yay çizerek uçar; yerini değiştirmez (sonra gizlenir ya da başka yere bağlanır) */
  const ucur = (el: HTMLElement, hedef: [number, number], yukseklik: number, ms: number, olcekSon = 1) => {
    if (AZ) return Promise.resolve();
    const r = el.getBoundingClientRect();
    const tx = el.style.transform;
    const m = /translate\(([-\d.]+)px, ([-\d.]+)px\)/.exec(tx);
    const x0 = m ? +m[1] : 0;
    const y0 = m ? +m[2] : 0;
    const [cx, cy] = merkez(r);
    const dx = hedef[0] - cx;
    const dy = hedef[1] - cy;
    const kare: Keyframe[] = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const s = 1 + (olcekSon - 1) * t;
      kare.push({ transform: `translate(${(x0 + dx * t).toFixed(1)}px, ${(y0 + dy * t - 4 * yukseklik * t * (1 - t)).toFixed(1)}px) scale(${s.toFixed(3)})`, offset: t });
    }
    return el.animate(kare, { duration: sure(ms), easing: 'cubic-bezier(.35,.1,.45,1)', fill: 'forwards' }).finished.then(
      () => undefined,
      () => undefined,
    );
  };
  /** Sürüklemeden sonra yerine "boing" diye geri seker */
  const geriSek = async (el: HTMLElement) => {
    const tx = el.style.transform;
    el.style.transform = '';
    el.classList.remove('ug-u-tutuluyor');
    efekt.sicrama();
    if (AZ) return;
    await el
      .animate([{ transform: tx || 'none' }, { transform: 'translate(0,0) scale(0.94, 1.06)', offset: 0.7 }, { transform: 'none' }], { duration: sure(420), easing: 'cubic-bezier(.3,1.4,.5,1)' })
      .finished.catch(() => undefined);
  };

  // ------------------------------------------------ konuşma
  const minoSoyle = async (t: string) => {
    devam();
    await konus(t, { ton: MINO_TON });
    devam();
  };
  const kinoSoyle = async (t: string) => {
    devam();
    mino.agizSus = true;
    kino.konus(true);
    try {
      await konus(t, KINO_SESI);
    } finally {
      kino.konus(false);
      mino.agizSus = false;
    }
    devam();
  };

  // ------------------------------------------------ bütün gövde hareketleri (parça dönmez)
  /** Yerinde zıplama: yükseklik karakter boyunun oranı */
  const hopla = async (kim: Sahip, oran_ = 0.25, ms = 380) => {
    const k = kar[kim];
    const boy = k.el.getBoundingClientRect().height;
    await ezEsne(k.sek, [[1.06, 0.92]], 110);
    await yayOynat(k.el, 0, 0.001, boy * oran_, ms);
    await ezEsne(k.sek, [[1.06, 0.9], [0.98, 1.04]], 220);
  };
  /** Başını sallar gibi: bütün gövde sağa-sola ±3 px */
  const sallan = (kim: Sahip, px = 3, ms = 520) => {
    if (AZ) return Promise.resolve();
    return kar[kim].sek
      .animate([{ transform: 'none' }, { transform: `translateX(${px}px)` }, { transform: `translateX(${-px}px)` }, { transform: `translateX(${px}px)` }, { transform: `translateX(${-px}px)` }, { transform: 'none' }], { duration: sure(ms) })
      .finished.catch(() => undefined);
  };
  /** Yatağa hop: yay (boyun %25'i), yarıda ön kenarın arkasına geçer, iniş ezilmesi */
  const yatagaGir = async (kim: Sahip) => {
    const k = kar[kim];
    const boy = k.el.getBoundingClientRect().height;
    await ezEsne(k.sek, [[1.06, 0.92]], 120);
    await tasi(k.el, `${kim}-yatakta`, boy * 0.25, 380, {
      olcek: 1,
      ortada: () => {
        yatakta[kim] = true;
        k.el.classList.add('ug-u-yatakta');
      },
    });
    yatakta[kim] = true;
    k.el.classList.add('ug-u-yatakta');
    if (kim === 'mino') void mino.otur(true);
    await ezEsne(k.sek, [[1.06, 0.9], [0.98, 1.04]], 260);
  };

  // ------------------------------------------------ ipucu eli ve yardım merdiveni
  const ipucuGoster = (hedef: HTMLElement | null) => {
    if (!hedef) {
      elIpucu.classList.remove('acik');
      return;
    }
    const k = kok.getBoundingClientRect();
    const r = hedef.getBoundingClientRect();
    elIpucu.style.left = `${r.left - k.left + r.width / 2}px`;
    elIpucu.style.top = `${r.top - k.top + r.height * 0.55}px`;
    elIpucu.classList.add('acik');
  };
  class Yardim {
    private bas = performance.now();
    private seviye = 0;
    private zaman = 0;
    constructor(
      private hedef: () => HTMLElement | null,
      private tekrar: () => void,
      private kendisi: () => void,
    ) {
      if (!yardimAcik) return;
      this.zaman = window.setInterval(() => this.bak(), TEST_MODU ? 20 : 250);
      zamanlar.push(this.zaman);
    }
    /** ilerleme oldu: merdiven baştan */
    sifirla() {
      this.bas = performance.now();
      this.seviye = 0;
      ipucuGoster(null);
    }
    private bak() {
      if (kapandi) return this.dur();
      if (mesgul > 0) {
        this.bas = performance.now() - Math.min(performance.now() - this.bas, 3000 * yardimOlcek);
        return;
      }
      const s = yardimBasamagi(performance.now() - this.bas, yardimOlcek);
      if (s === this.seviye) return;
      this.seviye = s;
      if (s === 1) ipucuGoster(this.hedef());
      if (s === 2) this.tekrar();
      if (s === 3) {
        ipucuGoster(null);
        this.kendisi();
        this.bas = performance.now();
        this.seviye = 0;
      }
    }
    dur() {
      clearInterval(this.zaman);
      ipucuGoster(null);
    }
  }
  /** Bir hareket oynarken (yay, konuşma) yardım beklemesi ilerlemez */
  let mesgul = 0;
  const mesgulIken = async <T>(fn: () => Promise<T>): Promise<T> => {
    mesgul++;
    try {
      return await fn();
    } finally {
      mesgul--;
    }
  };

  /** Dokunuş ya da sürükleme: aynı öğeye ikisi de bağlanır. hedefler: bırakılınca hangi kutuya düştüğü */
  const etkilesim = (e: Esya, o: { aktif: () => boolean; dokun: () => void; birak: (x: number, y: number) => boolean }) => {
    e.el.classList.add('ug-u-dokun');
    e.el.addEventListener('click', () => {
      if (!o.aktif()) return;
      efekt.dokunma();
      o.dokun();
    });
    let dx = 0;
    let dy = 0;
    const birak = elSurukle(e.el, {
      aktif: o.aktif,
      basla() {
        dx = 0;
        dy = 0;
        for (const an of e.el.getAnimations()) an.cancel();
        e.el.classList.add('ug-u-tutuluyor');
        efekt.dokunma();
      },
      tasi(_x, _y, ddx, ddy) {
        dx += ddx;
        dy += ddy;
        e.el.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(1.08)`;
      },
      birak(x, y) {
        if (!o.aktif() || !o.birak(x, y)) void geriSek(e.el);
        else e.el.classList.remove('ug-u-tutuluyor');
      },
    });
    birakicilar.push(birak);
  };
  const birakicilar: (() => void)[] = [];

  // ------------------------------------------------ adım 1: oyuncaklar sepete, kemik Kino'ya
  let sepette = 0;
  let kemikAlindi = false;
  const toplandi = new Set<string>();
  let oyuncakBitti: (() => void) | null = null;
  const oyuncakIlerle = () => {
    if (sepette >= OYUNCAKLAR.length && kemikAlindi) oyuncakBitti?.();
  };
  const sepeteAt = async (ad: (typeof OYUNCAKLAR)[number]) => {
    if (toplandi.has(ad)) return;
    toplandi.add(ad);
    const e = oyuncak[ad];
    e.el.classList.remove('ug-u-tutuluyor');
    e.el.dataset.durum = 'sepette';
    const s = sepet.el.getBoundingClientRect();
    await mesgulIken(async () => {
      await ucur(e.el, [s.left + s.width / 2, s.top + s.height * 0.35], Math.max(40, s.height * 0.9), 520, 0.75);
      goster(e.el, false);
      efekt.yapis();
      void ezEsne(sepet.ic, [[1.06, 0.88], [0.97, 1.08]], 300);
      sepette++;
      yardim1?.sifirla();
      const sayi = CUMLE.hazir.sayilar[sepette - 1];
      if (sepette === OYUNCAKLAR.length) {
        mino.tepki('mir');
        void hopla('mino', 0.22);
        // kemik hâlâ halıdaysa Kino kendisi koşup alır
        if (!kemikAlindi) sonra(1400, () => void kemikAl());
      }
      if (sayi) await minoSoyle(sayi).catch(() => undefined);
    });
    oyuncakIlerle();
  };
  const kemikKinoya = () => {
    for (const an of kemik.el.getAnimations()) an.cancel();
    for (const p of ['transform', 'left', 'top', 'width', 'height', 'translate', 'display'] as const) kemik.el.style[p] = '';
    kemik.el.classList.add('ug-u-kemik-kino');
    KK.sek.append(kemik.el);
    yerler.delete(kemik.el);
  };
  const kemikAl = async () => {
    if (kemikAlindi) return;
    kemikAlindi = true;
    kemik.el.dataset.durum = 'kino';
    kemik.el.classList.remove('ug-u-tutuluyor');
    await mesgulIken(async () => {
      const kr = KK.el.getBoundingClientRect();
      // kemik havaya fırlar, Kino bütün gövdesiyle zıplayıp kapar
      const tepe: [number, number] = [kr.left + kr.width / 2, kr.top + kr.height * 0.35];
      void ucur(kemik.el, tepe, kr.height * 0.35, 520, 1);
      await bekle(200);
      await ezEsne(KK.sek, [[1.07, 0.9]], 110);
      await yayOynat(KK.el, 0, 0.001, kr.height * 0.25, 380);
      // kemik Kino'nun önüne yapışır (karakterle birlikte yatağa gider)
      kemikKinoya();
      efekt.yapis();
      await ezEsne(KK.sek, [[1.07, 0.9], [0.98, 1.04]], 260);
      kino.ifade('keyif', 2200);
      void kino.oynat('huy', 1400);
      yardim1?.sifirla();
      await kinoSoyle(CUMLE.kino.kemik).catch(() => undefined);
    });
    oyuncakIlerle();
  };
  /** Kino oyuncağa hoplar, burnuyla iter, oyuncak sepete yuvarlanır, Kino yerine hoplar (yardımın son basamağı) */
  const kinoIter = async (ad: (typeof OYUNCAKLAR)[number]) => {
    if (toplandi.has(ad)) return;
    await mesgulIken(async () => {
      const kr = KK.el.getBoundingClientRect();
      const or = oyuncak[ad].el.getBoundingClientRect();
      const dx = Math.max(-kr.width * 1.1, Math.min(kr.width * 1.1, or.left + or.width / 2 - (kr.left + kr.width / 2)));
      await kayHop(KK.el, 0, dx, kr.height * 0.18, 420);
      void ezEsne(KK.sek, [[1.06, 0.92], [0.98, 1.03]], 240);
      void kino.oynat('kokla', 600);
      await bekle(420);
      void sepeteAt(ad);
      await bekle(250);
      await kayHop(KK.el, dx, 0, kr.height * 0.15, 420);
      for (const an of KK.el.getAnimations()) an.cancel();
      void ezEsne(KK.sek, [[1.06, 0.92], [0.98, 1.03]], 240);
    });
  };
  let yardim1: Yardim | null = null;
  const adim1Aktif = () => kok.dataset.adim === 'oyuncak';
  for (const ad of OYUNCAKLAR) {
    etkilesim(oyuncak[ad], {
      aktif: () => adim1Aktif() && !toplandi.has(ad),
      dokun: () => void sepeteAt(ad),
      birak: (x, y) => {
        if (!icinde(sepet.el.getBoundingClientRect(), x, y, 40)) return false;
        void sepeteAt(ad);
        return true;
      },
    });
  }
  etkilesim(kemik, {
    aktif: () => adim1Aktif() && !kemikAlindi,
    dokun: () => void kemikAl(),
    birak: (x, y) => {
      if (!icinde(KK.el.getBoundingClientRect(), x, y, 30)) return false;
      void kemikAl();
      return true;
    },
  });

  // ------------------------------------------------ adım 2: yastıklar
  const yastikYerde: Record<Sahip, boolean> = { mino: false, kino: false };
  let yastikBitti: (() => void) | null = null;
  let yardim2: Yardim | null = null;
  const yatagaKoy = async (s: Sahip) => {
    if (yastikYerde[s]) return;
    yastikYerde[s] = true;
    const e = yastik[s];
    e.el.classList.remove('ug-u-tutuluyor');
    e.el.dataset.durum = 'yatakta';
    yardim2?.sifirla();
    await mesgulIken(async () => {
      await tasi(e.el, `yastik-${s}-yatak`, 60, 460);
      e.el.classList.add('ug-u-yerinde');
      efekt.pof();
      await ezEsne(e.ic, [[1.08, 0.86], [0.97, 1.05]], 280);
      await yatagaGir(s);
    });
    if (yastikYerde.mino && yastikYerde.kino) yastikBitti?.();
  };
  /** Bırakılan nokta hangi yatağın üstünde */
  const hangiYatak = (x: number, y: number): Sahip | null => {
    for (const s of ['mino', 'kino'] as const) {
      const r = yatak[s].el.getBoundingClientRect();
      const kr = kar[s].el.getBoundingClientRect();
      if (icinde(r, x, y, 26) || icinde(kr, x, y, 0)) return s;
    }
    return null;
  };
  const yanlisYatak = (esyaSahibi: Sahip) => {
    // sahibi başını sallar (bütün gövde) ve kendi eşyasına bakar
    void sallan(esyaSahibi);
    if (esyaSahibi === 'mino') {
      mino.bak(-1);
      sonra(900, () => mino.bak(0));
    } else void kino.oynat('bak', 900);
  };
  for (const s of ['mino', 'kino'] as const) {
    etkilesim(yastik[s], {
      aktif: () => kok.dataset.adim === 'yastik' && !yastikYerde[s] && !yastik[s].el.classList.contains('ug-u-yok'),
      dokun: () => void yatagaKoy(s),
      birak: (x, y) => {
        const y_ = hangiYatak(x, y);
        if (y_ === s) {
          void yatagaKoy(s);
          return true;
        }
        if (y_) yanlisYatak(s);
        return false;
      },
    });
  }

  // ------------------------------------------------ adım 3: battaniyeler (Kino bir kez tekmeler)
  const ortulu: Record<Sahip, boolean> = { mino: false, kino: false };
  let tekmeOldu = false;
  let yigindaMi = false;
  let battaniyeBitti: (() => void) | null = null;
  let yardim3: Yardim | null = null;
  const battaniyeIn = async (e: Esya) => {
    // tepe pivotlu dalgalanma, sallanarak oturur
    if (AZ) return;
    e.ic.style.transformOrigin = '50% 0';
    await e.ic
      .animate(
        [
          { transform: 'translateX(0) scale(1, 1.1)' },
          { transform: 'translateX(6px) scale(1, 0.95)', offset: 0.4 },
          { transform: 'translateX(-4px) scale(1, 1.02)', offset: 0.72 },
          { transform: 'translateX(0) scale(1, 1)' },
        ],
        { duration: sure(620), easing: 'ease-out' },
      )
      .finished.catch(() => undefined);
  };
  const ort = async (s: Sahip) => {
    if (ortulu[s] || (s === 'kino' && yigindaMi)) return;
    const e = battaniye[s];
    e.el.classList.remove('ug-u-tutuluyor');
    yardim3?.sifirla();
    if (s === 'mino') {
      ortulu.mino = true;
      e.el.dataset.durum = 'ortulu';
      await mesgulIken(async () => {
        await tasi(e.el, 'battaniye-mino-yatak', 70, 480);
        efekt.pof();
        await battaniyeIn(e);
        void mino.poz('sarilma');
        await minoSoyle(CUMLE.mino.sicacik).catch(() => undefined);
      });
    } else {
      ortulu.kino = true;
      e.el.dataset.durum = 'ortulu';
      await mesgulIken(async () => {
        await tasi(e.el, 'battaniye-kino-yatak', 70, 480);
        efekt.pof();
        await battaniyeIn(e);
        if (tekmeOldu) {
          kino.ifade('keyif', 1600);
          await kinoSoyle(CUMLE.kino.tamam).catch(() => undefined);
          return;
        }
        // komik an: 1 sn sonra Kino tekmeler, battaniye havaya kalkıp yere yığılır
        tekmeOldu = true;
        await bekle(1000);
        ortulu.kino = false;
        e.el.dataset.durum = 'ucuyor';
        void yayOynat(KK.el, 0, 0.001, 4, 220);
        void ezEsne(KK.sek, [[1.04, 0.95]], 220);
        efekt.pof();
        const hedef = yigin.el.getBoundingClientRect();
        const r = e.el.getBoundingClientRect();
        const dx = hedef.left + hedef.width / 2 - (r.left + r.width / 2);
        const dy = hedef.bottom - r.bottom;
        if (!AZ)
          await e.el
            .animate(
              [
                { transform: 'none' },
                { transform: 'translate(0, -40px) rotate(8deg)', offset: 0.35 },
                { transform: `translate(${dx * 0.7}px, ${dy * 0.5 - 30}px) rotate(8deg) scale(0.8)`, offset: 0.7 },
                { transform: `translate(${dx}px, ${dy}px) rotate(0deg) scale(0.55)` },
              ],
              { duration: sure(700), easing: 'ease-in-out' },
            )
            .finished.catch(() => undefined);
        goster(e.el, false);
        yerAta(e.el, 'yigin-kino');
        goster(yigin.el, true);
        yigindaMi = true;
        yigin.el.dataset.durum = 'yerde';
        efekt.pof();
        void ezEsne(yigin.ic, [[1.12, 0.8], [0.96, 1.06]], 320);
        kino.ifade('keyif', 1800);
        await kinoSoyle(CUMLE.kino.ayak).catch(() => undefined);
        mino.bak(1);
        await minoSoyle(CUMLE.mino.ortun_dustu).catch(() => undefined);
        mino.bak(0);
      });
      yardim3?.sifirla();
    }
    if (ortulu.mino && ortulu.kino) battaniyeBitti?.();
  };
  /** Yığından yeniden örtülür (bu kez yerinde kalır) */
  const yiginOrt = async () => {
    if (!yigindaMi) return;
    yigindaMi = false;
    yigin.el.classList.remove('ug-u-tutuluyor');
    goster(yigin.el, false);
    yigin.el.style.transform = '';
    const e = battaniye.kino;
    yerAta(e.el, 'yigin-kino');
    goster(e.el, true);
    await ort('kino');
  };
  for (const s of ['mino', 'kino'] as const) {
    etkilesim(battaniye[s], {
      aktif: () => kok.dataset.adim === 'battaniye' && !ortulu[s] && battaniye[s].el.dataset.durum !== 'ucuyor' && !battaniye[s].el.classList.contains('ug-u-yok'),
      dokun: () => void ort(s),
      birak: (x, y) => {
        const y_ = hangiYatak(x, y);
        if (y_ === s) {
          void ort(s);
          return true;
        }
        if (y_) yanlisYatak(s);
        return false;
      },
    });
  }
  etkilesim(yigin, {
    aktif: () => kok.dataset.adim === 'battaniye' && yigindaMi,
    dokun: () => void yiginOrt(),
    birak: (x, y) => {
      if (hangiYatak(x, y) !== 'kino') return false;
      void yiginOrt();
      return true;
    },
  });

  // ------------------------------------------------ adım 4: perde ve Ay
  let perdeKapandi = false;
  let perdeBitti: (() => void) | null = null;
  const perdeKapat = async () => {
    if (perdeKapandi) return;
    perdeKapandi = true;
    await mesgulIken(async () => {
      mino.bak(1);
      await minoSoyle(CUMLE.mino.ay).catch(() => undefined);
      await kinoSoyle(CUMLE.kino.hav).catch(() => undefined);
      mino.bak(0);
      pencere.el.dataset.durum = 'kapali';
      efekt.dalga();
      const kapali = pencere.ic.querySelector<HTMLElement>('[data-katman="pencere-kapali"]');
      if (kapali && !AZ) {
        kapali.style.transformOrigin = '50% 0';
        await kapali
          .animate([{ transform: 'scaleY(0.96)', opacity: 0 }, { transform: 'scaleY(1.03)', opacity: 1, offset: 0.45 }, { transform: 'scaleY(1)', opacity: 1 }], { duration: sure(420), easing: 'ease-out' })
          .finished.catch(() => undefined);
      }
    });
    perdeBitti?.();
  };
  pencere.el.classList.add('ug-u-dokun');
  pencere.el.addEventListener('click', () => {
    if (kok.dataset.adim !== 'perde') return;
    efekt.dokunma();
    void perdeKapat();
  });

  // ------------------------------------------------ adım 5: gece lambası
  let lambaYandi = false;
  let lambaBitti: (() => void) | null = null;
  const isikYerlestir = () => {
    const k = kok.getBoundingClientRect();
    const r = lamba.el.getBoundingClientRect();
    const cap = r.width * 2.3;
    isik.style.width = isik.style.height = `${cap}px`;
    isik.style.left = `${r.left - k.left + r.width / 2 - cap / 2}px`;
    isik.style.top = `${r.top - k.top + r.height * 0.45 - cap / 2}px`;
  };
  const lambaYak = async (hizli = false) => {
    if (lambaYandi) return;
    lambaYandi = true;
    await mesgulIken(async () => {
      efekt.tink();
      if (!hizli) await ezEsne(lamba.ic, [[1.1, 0.86], [0.96, 1.08]], 200);
      lamba.el.dataset.durum = 'yanik';
      isikYerlestir();
      kok.classList.add('ug-u-gece-acik');
      await bekle(hizli ? 0 : 1200);
    });
    lambaBitti?.();
  };
  lamba.el.classList.add('ug-u-dokun');
  lamba.el.addEventListener('click', () => {
    if (kok.dataset.adim !== 'lamba') return;
    void lambaYak();
  });

  // ------------------------------------------------ adım 6-7: uyku ve uyuyan oda
  let zZaman = 0;
  const zUret = () => {
    if (AZ || kapandi) return;
    let sira = 0;
    const bir = () => {
      if (kapandi) return;
      const kim: Sahip = sira++ % 2 ? 'kino' : 'mino';
      const k = kok.getBoundingClientRect();
      const r = kar[kim].el.getBoundingClientRect();
      const z = h('span.ug-u-z', {}, 'z');
      z.style.left = `${r.left - k.left + r.width * (kim === 'mino' ? 0.72 : 0.7)}px`;
      z.style.top = `${r.top - k.top + r.height * 0.06}px`;
      zKatman.append(z);
      z.animate([{ transform: 'translateY(0)', opacity: 0 }, { opacity: 0.9, offset: 0.3 }, { transform: 'translateY(-40px)', opacity: 0 }], { duration: 2800, easing: 'ease-out' }).finished.then(
        () => z.remove(),
        () => z.remove(),
      );
    };
    bir();
    zZaman = window.setInterval(bir, 1500);
  };
  const ninni = new DosyaMuzik(fonDosyasi('ninni-sozsuz'), 0.25);
  const ninniCal = (ms: number) => {
    if (!ninni.var) return;
    ninni.baslat();
    sonra(ms, () => ninni.durdur());
  };
  /** Kino uykuda: gözler kapalı, keyif ağzı (ifade değil, yalnız ağız katmanı: keyif ifadesi gözü yarı açık gösterir) */
  const kinoUykuAgzi = (acik: boolean) => {
    kino.ek('agiz-keyif', acik);
    kino.gizle('agiz', acik);
    kino.gizle('dil', acik);
  };
  const uyut = () => {
    mino.uyu();
    kinoGozKapali = true;
    kino.ifade(null);
    MK.nefes.classList.add('uyuyor');
    KK.nefes.classList.add('uyuyor');
    kok.classList.add('ug-u-uyudu');
  };
  /** Uykudaki karaktere dokununca: kıpırdar (titrer, ezilir), uyku cümlesi; uyanmaz */
  let kipirMesgul = false;
  const kipirda = async (kim: Sahip) => {
    if (kipirMesgul) return;
    kipirMesgul = true;
    efekt.dokunma();
    try {
      void sallan(kim, 2, 300);
      await ezEsne(kar[kim].sek, [[1.04, 0.95]], 300);
      if (kim === 'mino') await minoSoyle(CUMLE.mino.uykulu).catch(() => undefined);
      else {
        // konuşurken dudak senkronu kendi ağzını kullanır, sonra keyif ağzına döner
        kinoUykuAgzi(false);
        await kinoSoyle(CUMLE.kino.horul).catch(() => undefined);
        kinoUykuAgzi(true);
      }
    } finally {
      kipirMesgul = false;
    }
  };
  const kilitYaz = () => kayitYaz({ bitti: uykuSimdi().getTime() });
  const odaKur = () => {
    adimYaz('oda');
    // 60 sn sonra örtü biraz daha koyulaşır (ekran daha az ışık verir)
    zamanlar.push(window.setTimeout(() => kok.classList.add('ug-u-koyu'), TEST_MODU ? 60 : 60_000));
  };

  // ritüel sırasında karaktere dokununca küçük tepki
  for (const kim of ['mino', 'kino'] as const) {
    kar[kim].el.addEventListener('pointerdown', () => {
      const a = kok.dataset.adim;
      if (a === 'oda' || a === 'uyku') {
        if (a === 'oda') void kipirda(kim);
        return;
      }
      if (mesgul) return;
      efekt.dokunma();
      if (kim === 'mino') mino.tepki('mir');
      else {
        void kino.oynat('huy', 1200);
        kino.ifade('keyif', 1200);
      }
    });
  }

  // ------------------------------------------------ ebeveyn köşesi: kilit silinir, menüye
  kapi.addEventListener('click', async () => {
    efekt.dokunma();
    if (await ebeveynKapisiAc(app.kok)) {
      uykuKilidiniSil();
      app.git('menu');
    }
  });

  // ------------------------------------------------ son durum (kilitli açılış ya da ritüel sonu)
  const sonDurum = () => {
    for (const a of OYUNCAKLAR) goster(oyuncak[a].el, false);
    if (!kemikAlindi) {
      kemikAlindi = true;
      kemikKinoya();
    }
    for (const s of ['mino', 'kino'] as const) {
      goster(yastik[s].el, true);
      yerAta(yastik[s].el, `yastik-${s}-yatak`);
      goster(battaniye[s].el, true);
      yerAta(battaniye[s].el, `battaniye-${s}-yatak`);
      yerAta(kar[s].el, `${s}-yatakta`);
      kar[s].el.classList.add('ug-u-yatakta');
      yatakta[s] = true;
    }
    goster(yigin.el, false);
    void mino.otur(true);
    void mino.poz('sarilma');
    pencere.el.dataset.durum = 'kapali';
    lamba.el.dataset.durum = 'yanik';
    kok.classList.add('ug-u-gece-acik');
    isikYerlestir();
    uyut();
    kinoUykuAgzi(true);
  };

  // ------------------------------------------------ akış
  const ritual = async () => {
    // 0) açılış: ikisi de esner, Mino davet eder
    await bekle(600);
    mino.tepki('esne');
    await bekle(400);
    void kino.oynat('huy', 1400);
    kino.ifade('keyif', 1600);
    await bekle(1700);
    await minoSoyle(CUMLE.mino.davet);
    // 1) oyuncaklar
    adimYaz('oyuncak');
    const kalanOyuncak = () => OYUNCAKLAR.find((a) => !toplandi.has(a));
    yardim1 = new Yardim(
      () => {
        const a = kalanOyuncak();
        return a ? oyuncak[a].el : !kemikAlindi ? kemik.el : null;
      },
      () => void minoSoyle(CUMLE.mino.oyuncak).catch(() => undefined),
      () => {
        const a = kalanOyuncak();
        if (a) void kinoIter(a);
        else if (!kemikAlindi) void kemikAl();
      },
    );
    await minoSoyle(CUMLE.mino.oyuncak);
    await new Promise<void>((coz) => {
      oyuncakBitti = coz;
      oyuncakIlerle();
    });
    yardim1.dur();
    // üç oyuncak bitti, kemik hâlâ halıdaysa Kino kendisi koşup alır
    while (mesgul) await bekle(100);
    devam();
    await bekle(500);

    // 2) yastıklar: soldan hoplayarak gelir
    adimYaz('yastik');
    for (const s of ['mino', 'kino'] as const) {
      const e = yastik[s];
      goster(e.el, true);
      if (!AZ) void yayOynat(e.el, -innerWidth * 0.25, 0.001, 50, 560);
    }
    efekt.ucus();
    await minoSoyle(CUMLE.mino.yastik);
    yardim2 = new Yardim(
      () => (!yastikYerde.mino ? yastik.mino.el : !yastikYerde.kino ? yastik.kino.el : null),
      () => void minoSoyle(CUMLE.mino.yastik).catch(() => undefined),
      () => void yatagaKoy(!yastikYerde.mino ? 'mino' : 'kino'),
    );
    await new Promise<void>((coz) => {
      yastikBitti = coz;
      if (yastikYerde.mino && yastikYerde.kino) coz();
    });
    yardim2.dur();
    while (mesgul) await bekle(100);
    devam();
    await bekle(400);

    // 3) battaniyeler
    adimYaz('battaniye');
    for (const s of ['mino', 'kino'] as const) {
      const e = battaniye[s];
      goster(e.el, true);
      if (!AZ) void yayOynat(e.el, -innerWidth * 0.25, 0.001, 50, 560);
    }
    efekt.ucus();
    await minoSoyle(CUMLE.mino.battaniye);
    yardim3 = new Yardim(
      () => (!ortulu.mino ? battaniye.mino.el : yigindaMi ? yigin.el : !ortulu.kino ? battaniye.kino.el : null),
      () => void minoSoyle(CUMLE.mino.battaniye).catch(() => undefined),
      () => {
        // Mino battaniyeye doğru seker, battaniye uçup örtülür
        if (yatakta.mino) void hopla('mino', 0.12, 300);
        if (!ortulu.mino) void ort('mino');
        else if (yigindaMi) void yiginOrt();
        else if (!ortulu.kino) void ort('kino');
      },
    );
    await new Promise<void>((coz) => {
      battaniyeBitti = coz;
      if (ortulu.mino && ortulu.kino) coz();
    });
    yardim3.dur();
    while (mesgul) await bekle(100);
    devam();
    await bekle(400);

    // 4) perde ve Ay
    adimYaz('perde');
    const yardim4 = new Yardim(
      () => pencere.el,
      () => {
        mino.bak(1);
        sonra(1200, () => mino.bak(0));
      },
      () => {
        // Kino yatağında doğrulur, pencereye bakar; perde kendisi kapanır
        if (!AZ) void KK.el.animate([{ transform: 'none' }, { transform: `translateY(${-KK.el.getBoundingClientRect().height * 0.08}px)`, offset: 0.4 }, { transform: 'none' }], { duration: sure(900) });
        void kino.oynat('bak', 900);
        sonra(500, () => void perdeKapat());
      },
    );
    await new Promise<void>((coz) => (perdeBitti = coz));
    yardim4.dur();
    await bekle(300);

    // 5) gece lambası
    adimYaz('lamba');
    await minoSoyle(CUMLE.mino.lamba);
    const yardim5 = new Yardim(
      () => lamba.el,
      () => void minoSoyle(CUMLE.mino.lamba).catch(() => undefined),
      () => {
        // Mino lambaya bakar (kol kalkmaz), lamba kendisi yanar
        void mino.poz('isaret-sag', { kol: false });
        sonra(500, () => void lambaYak());
        sonra(1600, () => void mino.poz('sarilma'));
      },
    );
    await new Promise<void>((coz) => (lambaBitti = coz));
    yardim5.dur();
    void mino.poz('sarilma');

    // 6) uyku
    adimYaz('uyku');
    ninniCal(15_000);
    uyut();
    await bekle(900);
    await minoSoyle(CUMLE.mino.iyi_geceler);
    await kinoSoyle(CUMLE.kino.iyi_geceler);
    kinoUykuAgzi(true);
    zUret();
    kilitYaz();
    odaKur();
  };

  if (param?.oda) {
    sonDurum();
    odaKur();
    ninniCal(6000);
    sonra(500, zUret);
  } else
    void ritual().catch((e) => {
      if (e !== IPTAL) console.warn('Uyku ritüeli', e);
    });
  requestAnimationFrame(() => {
    isikYerlestir();
    perdeyiKaldir();
  });

  return {
    el: kok,
    kapat() {
      kapandi = true;
      sus();
      zamanlar.forEach((t) => {
        clearTimeout(t);
        clearInterval(t);
      });
      clearInterval(zZaman);
      removeEventListener('resize', boyut);
      birakicilar.forEach((b) => b());
      ninni.durdur();
      mino.kapat();
      kino.kapat();
      perdeyiKaldir();
    },
  };
}
