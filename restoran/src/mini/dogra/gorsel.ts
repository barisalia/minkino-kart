/**
 * P2 mini oyunlarının (Doğra, Tava, Tabakla) ortak görselleri: resim bulma + parça çizimi.
 *
 * Gemini sayfaları (§11b R-Gün 1: sebze-domates, sebze-salatalik, sebze-sogan-biber, mutfak-aletleri-1; R-Gün 2:
 * efekt-sayfasi; R-Gün 3: sebze-patates-havuc, sebze-yesillik, yiyecek-tava) kesilince `assets/restoran/yiyecek/*`,
 * `alet/*`, `efekt/*` olur (ekip/illustrator/restoran/mini-p2-isle.cjs). Kod değişmez: dosya varsa o çizilir.
 * Gelmeyenler için:
 *   - bütün sebze: var olan Recraft meyve-sebze resimleri (assets/meyveler, 560 px; netlik sınırı 186 css px)
 *   - kesit, dilim, küp, püre, tava içi: SADE YER TUTUCU (düz renk + kahve kontur, CSS). Bitmiş çizim değildir.
 * Hiçbir resim kaynak pikselinin üstünde çizilmez (src/ui/netlik.ts, NETLIK_DPR = 3).
 */
import { h } from '../../../../src/ui/dom';
import { NETLIK_DPR } from '../../../../src/ui/netlik';
import type { Malzeme } from '../arayuz';
import type { Gorunum, Parca } from './mantik';
import './parca.css';

const YENI = import.meta.glob<string>('../../../../assets/restoran/{yiyecek,alet,efekt}/*.{webp,png}', { eager: true, query: '?url', import: 'default' });
const ESKI = import.meta.glob<string>(
  ['../../../../assets/meyveler/{domates,salatalik,biber,havuc,patates,limon,muz,cilek,elma,portakal}.webp', '../../../../assets/film/mino-karpuz/bicak.webp', '../../../../assets/dedektif2/yumurta-catlak.webp', '../../../../assets/pasta/kavanoz-bal-1.webp', '../../../../assets/karakter/kino-yeni/el-sag.webp'],
  { eager: true, query: '?url', import: 'default' },
);

/** Doğal boylar (netlik sınırı için; resim yüklenmeden de bilinsin). Yeni Gemini resimleri yüklenince ölçülür. */
const BOY: Record<string, [number, number]> = {
  'meyveler/domates': [560, 560],
  'meyveler/salatalik': [560, 560],
  'meyveler/biber': [560, 560],
  'meyveler/havuc': [560, 560],
  'meyveler/patates': [560, 560],
  'meyveler/limon': [560, 560],
  'meyveler/muz': [560, 560],
  'meyveler/cilek': [560, 560],
  'meyveler/elma': [560, 560],
  'meyveler/portakal': [560, 560],
  'film/mino-karpuz/bicak': [1200, 294],
  'dedektif2/yumurta-catlak': [278, 352],
  'pasta/kavanoz-bal-1': [285, 356],
  'karakter/kino-yeni/el-sag': [296, 300],
};
/** Eski resimlerde görünen kısmın kutusu [x0, x1, y0, y1] (saydam kenar boşluğu kesilir) */
const KUTU: Record<string, [number, number, number, number]> = {
  'meyveler/domates': [0.05, 0.946, 0.043, 0.955],
  'meyveler/salatalik': [0.043, 0.955, 0.114, 0.884],
  'meyveler/biber': [0.045, 0.954, 0.043, 0.955],
  'meyveler/havuc': [0.179, 0.82, 0.043, 0.955],
  'meyveler/patates': [0.045, 0.955, 0.073, 0.923],
  'meyveler/limon': [0.093, 0.905, 0.043, 0.955],
  'meyveler/muz': [0.113, 0.886, 0.043, 0.955],
  'meyveler/cilek': [0.107, 0.889, 0.043, 0.955],
};

function tablo(g: Record<string, string>, kok: RegExp): Map<string, string> {
  const en = new Map<string, { n: number; url: string }>();
  for (const [yol, url] of Object.entries(g)) {
    const m = kok.exec(yol.replace(/\\/g, '/'));
    if (!m) continue;
    const ad = m[1];
    const n = (m[2] ? Number(m[2]) : 0) * 2 + (m[3] === 'webp' ? 1 : 0);
    const e = en.get(ad);
    if (!e || n > e.n) en.set(ad, { n, url });
  }
  return new Map([...en].map(([a, v]) => [a, v.url]));
}
const YENI_T = tablo(YENI, /assets\/restoran\/(.+?)(?:-(\d+))?\.(webp|png)$/);
const ESKI_T = tablo(ESKI, /assets\/(.+?)()\.(webp)$/);

/** 'yiyecek/domates-dilim' → yeni Gemini kesiti ya da null */
export const yeni = (yol: string): string | null => YENI_T.get(yol) ?? null;
/** Var olan eski resim ('meyveler/domates') */
export const eski = (yol: string): string | null => ESKI_T.get(yol) ?? null;

/** Bir resmin doğal boyu: bilinen tablo, yoksa yüklenince ölçülen (o ana kadar varsayılan 1024) */
const olculen = new Map<string, [number, number]>();
export function dogal(yol: string, url: string): [number, number] {
  if (BOY[yol]) return BOY[yol];
  const o = olculen.get(url);
  if (o) return o;
  const i = new Image();
  i.onload = () => olculen.set(url, [i.naturalWidth, i.naturalHeight]);
  i.src = url;
  return [1024, 1024];
}
/** Netlik: bu resim en çok kaç css px eninde çizilir (kaynak px / 3) */
export const enCokCss = (yol: string, url: string) => dogal(yol, url)[0] / NETLIK_DPR;

/** Bütün sebzenin resmi: önce yeni Gemini kesiti, yoksa eski meyve-sebze resmi, o da yoksa null (yer tutucu) */
export function butunResim(m: Malzeme, soyuldu = false): { url: string; yol: string; kutu: [number, number, number, number] } | null {
  const s = soyuldu ? yeni(`yiyecek/${m}-soyulmus`) : null;
  if (s) return { url: s, yol: `yiyecek/${m}-soyulmus`, kutu: [0, 1, 0, 1] };
  const y = yeni(`yiyecek/${m}-butun`);
  if (y) return { url: y, yol: `yiyecek/${m}-butun`, kutu: [0, 1, 0, 1] };
  const e = eski(`meyveler/${m}`);
  if (e) return { url: e, yol: `meyveler/${m}`, kutu: KUTU[`meyveler/${m}`] ?? [0, 1, 0, 1] };
  return null;
}

/** Görünüm → Gemini kesit adı (sebze sayfasındaki kare) */
const KESIT_ADI: Partial<Record<Gorunum, string>> = {
  yarim: 'yarim',
  dilim: 'dilim',
  yarimdilim: 'yarimay',
  serit: 'serit',
  cubuk: 'cubuk',
  kup: 'kup',
  kiyim: 'kiyim',
  pure: 'pure',
};

/** Yer tutucu renkleri: [kabuk/dış, iç, çekirdek] */
export const RENK: Partial<Record<Malzeme, [string, string, string]>> = {
  domates: ['#E8483A', '#F26B5B', '#F7D26A'],
  salatalik: ['#3E8E3A', '#CDEBA6', '#F4F7D9'],
  sogan: ['#C98B4E', '#F4E6F2', '#D9B8D6'],
  biber: ['#3F9B36', '#BFE59A', '#FFF6D8'],
  maydanoz: ['#2F8A2E', '#58B24A', '#8FD06E'],
  havuc: ['#E9772A', '#F7A040', '#FFD08A'],
  patates: ['#A87444', '#F4DE9C', '#FBEFC4'],
  limon: ['#F2CF2A', '#FBEA8A', '#FFF8D2'],
  marul: ['#6DB33F', '#C6EA92', '#E9F8CF'],
  muz: ['#F2D24A', '#FBF0C0', '#E8D79A'],
  cilek: ['#E0384A', '#F7A0A8', '#FFE08A'],
  zeytin: ['#3F3530', '#5A4B43', '#7A665B'],
  ekmek: ['#C8853E', '#F3D9A4', '#FBEBCB'],
  yumurta: ['#FFF8EC', '#FFFFFF', '#FFC83A'],
};
const renk = (m: Malzeme) => RENK[m] ?? ['#B9B9B9', '#E6E6E6', '#F4F4F4'];
/** Soyulmuş sebzenin kesit kenarı (kabuk yok: dış halka iç rengin bir ton koyusu; Soy'dan gelen patates, havuç...) */
const SOYULMUS_DIS: Partial<Record<Malzeme, string>> = { patates: '#EBCB78', havuc: '#F48A2E', salatalik: '#A8D27A' };

/**
 * Bir parçanın elemanı (Doğra tahtası, Tabakla tabağı, kâse): `px` tahta eni (css px). Konum ve boy dışarıda verilir
 * (konumla()). Kirpik: bütün resmin penceresi (overflow hidden). Öbürleri: Gemini kesiti ya da sade yer tutucu.
 * Zincir (arayuz.ts Hal): soyuldu = kesitte kabuk halkası yok; temiz true = yıkanmış (parlak), false = lavabo açık
 * ama yıkanmamış (bütün kısımda küçük toprak lekesi); undefined = sorulmaz, eskisi gibi.
 */
export function parcaEl(m: Malzeme, p: Parca, soyuldu = false, temiz?: boolean): HTMLElement {
  const el = h('div.rs-p2-parca', { 'data-malzeme': m, 'data-gorunum': p.gorunum, 'aria-hidden': 'true' });
  const [dis, ic, cek] = renk(m);
  el.style.setProperty('--dis', dis);
  el.style.setProperty('--ic', ic);
  el.style.setProperty('--cek', cek);
  if (p.taraf) el.dataset.taraf = p.taraf;
  if (soyuldu) {
    el.dataset.soyuldu = '1';
    const sd = SOYULMUS_DIS[m];
    if (sd) el.style.setProperty('--dis', sd);
  }
  if (temiz === true) el.dataset.temiz = '1';
  if (temiz === false) el.dataset.toprak = '1';
  if (p.gorunum === 'kirpik') {
    const b = butunResim(m, soyuldu);
    if (b) {
      const img = h('img.rs-p2-butun', { src: b.url, alt: '', draggable: 'false' }) as HTMLImageElement;
      el.append(img);
      el.dataset.resim = '1';
      // soyulmuş resmi gelmediyse eski bütün resim açık tonla (Soy'daki yer tutucuyla aynı)
      if (soyuldu && !b.yol.endsWith('-soyulmus')) el.dataset.soyulmusYt = '1';
    } else {
      el.dataset.yertutucu = '1';
      el.append(h('i.rs-p2-butun.rs-p2-butun-yt'));
    }
    if (temiz === false) el.append(h('i.rs-p2-toprak'));
    if (temiz === true) el.append(h('i.rs-p2-parlak'));
    return el;
  }
  const ad = KESIT_ADI[p.gorunum];
  const u = (soyuldu && ad ? yeni(`yiyecek/${m}-soyulmus-${ad}`) : null) ?? (ad ? yeni(`yiyecek/${m}-${ad}`) : null) ?? (ad === 'serit' ? yeni(`yiyecek/${m}-halka`) : null) ?? (m === 'ekmek' ? yeni('alet/ekmek') : null);
  if (u) {
    el.append(h('img.rs-p2-kesit', { src: u, alt: '', draggable: 'false' }));
    el.dataset.resim = '1';
  } else {
    el.dataset.yertutucu = '1';
    el.append(h('i.rs-p2-ic'));
  }
  return el;
}

/**
 * Parçayı tahta pikseline yerleştirir: bw, bh tahtanın css boyu. Kirpik parçada içteki resim bütünün boyunda
 * kaydırılır (pencere). Netlik: bütün resmin eni kaynak/3'ü geçmez (en: sebze bütününün tahta eni cinsinden boyu).
 */
export function konumla(el: HTMLElement, m: Malzeme, p: Parca, bw: number, bh: number, butunEn: number, butunOran: number) {
  el.style.left = `${p.x * bw}px`;
  el.style.top = `${p.y * bh}px`;
  if (p.gorunum === 'kirpik') {
    const b = butunResim(m, !!el.dataset.soyuldu);
    const r = p.r ?? [0, 1, 0, 1];
    // bütünün görünen eni (css) — netlik sınırıyla
    let W = butunEn * bw;
    if (b) {
      const k = b.kutu;
      const tamEn = W / (k[1] - k[0]);
      const sinir = enCokCss(b.yol, b.url);
      if (tamEn > sinir) W = sinir * (k[1] - k[0]);
    }
    const H = W * butunOran;
    const w = (r[1] - r[0]) * W;
    const hh = (r[3] - r[2]) * H;
    el.style.width = `${w}px`;
    el.style.height = `${hh}px`;
    el.style.marginLeft = `${-w / 2}px`;
    el.style.marginTop = `${-hh / 2}px`;
    const img = el.querySelector<HTMLElement>('.rs-p2-butun');
    if (img) {
      const k = b?.kutu ?? [0, 1, 0, 1];
      // görünen kutu (k) W×H'ye otursun: tam resim eni W/(k1-k0), boyu H/(k3-k2)
      const tw = W / (k[1] - k[0]);
      const th = H / (k[3] - k[2]);
      img.style.width = `${tw}px`;
      img.style.height = `${th}px`;
      img.style.left = `${-(k[0] + r[0] * (k[1] - k[0])) * tw}px`;
      img.style.top = `${-(k[2] + r[2] * (k[3] - k[2])) * th}px`;
    }
    return;
  }
  const w = p.w * bw;
  const hh = p.h * bw;
  el.style.width = `${w}px`;
  el.style.height = `${hh}px`;
  el.style.marginLeft = `${-w / 2}px`;
  el.style.marginTop = `${-hh / 2}px`;
}

/** Kirpik parçanın ekrandaki gerçek boyu (vuruş alanı için): konumla ile aynı hesap, px */
export function kirpikBoy(m: Malzeme, p: Parca, bw: number, butunEn: number, butunOran: number, soyuldu = false): [number, number] {
  const b = butunResim(m, soyuldu);
  let W = butunEn * bw;
  if (b) {
    const k = b.kutu;
    const sinir = enCokCss(b.yol, b.url);
    if (W / (k[1] - k[0]) > sinir) W = sinir * (k[1] - k[0]);
  }
  const r = p.r ?? [0, 1, 0, 1];
  return [(r[1] - r[0]) * W, (r[3] - r[2]) * W * butunOran];
}

/** Rafın simgesi (raftaki malzeme): resim ya da sade yer tutucu daire */
export function rafSimge(m: Malzeme): HTMLElement {
  const y = yeni(`yiyecek/${m}-raf`) ?? yeni(`yiyecek/${m}-butun`);
  const b = y ? { url: y } : butunResim(m);
  const el = h('span.rs-p2-raf-simge', { 'data-malzeme': m });
  const [dis, ic] = renk(m);
  el.style.setProperty('--dis', dis);
  el.style.setProperty('--ic', ic);
  if (b) el.append(h('img', { src: b.url, alt: '', draggable: 'false' }));
  else el.dataset.yertutucu = '1';
  return el;
}

/** Alet resmi (bıçak, spatula, tava...) ya da null */
export function alet(ad: string): string | null {
  return yeni(`alet/${ad}`) ?? (ad === 'bicak' ? eski('film/mino-karpuz/bicak') : ad === 'yumurta-catlak' ? eski('dedektif2/yumurta-catlak') : ad === 'bal' ? eski('pasta/kavanoz-bal-1') : null);
}
/** Efekt resmi (efekt sayfasından) ya da null */
export const efektResmi = (ad: string) => yeni(`efekt/${ad}`);

/**
 * Kâse görünümü (Doğra'nın çıktısı; tepside ve tabakta): içinde malzemelerin küçük parçaları. Kutusunu doldurur
 * (100% × 100%), yalnız yüzde konumlu: her boyda aynı görünür.
 */
export function kaseEl(icerik: { m: Malzeme; g: Gorunum; n: number; s?: boolean }[]): HTMLElement {
  const kase = h('div.rs-p2-kase');
  const kaseResim = yeni('alet/kase');
  if (kaseResim) kase.append(h('img.rs-p2-kase-resim', { src: kaseResim, alt: '', draggable: 'false' }));
  const ic = h('div.rs-p2-kase-ic');
  kase.append(ic);
  let i = 0;
  const toplam = Math.max(1, icerik.reduce((t, x) => t + Math.min(x.n, 6), 0));
  for (const { m, g, n, s } of icerik) {
    for (let k = 0; k < Math.min(n, 6); k++, i++) {
      // altın açı sarmalı: dolu ve düzgün yayılır
      const a = i * 2.39996;
      const r = 30 * Math.sqrt((i + 0.5) / toplam);
      const p: Parca = { id: 0, gorunum: g === 'kirpik' ? 'kup' : g, x: 0, y: 0, w: 0, h: 0 };
      const el = parcaEl(m, p, s);
      el.classList.add('rs-p2-kase-parca');
      el.style.left = `${50 + Math.cos(a) * r}%`;
      el.style.top = `${50 + Math.sin(a) * r}%`;
      ic.append(el);
    }
  }
  return kase;
}
