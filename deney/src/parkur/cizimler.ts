// Deneyler · Zincirleme Top Parkuru: Astra'nın çizimleri (assets/deney/parkur/*.webp; Paket Deney-Y1 ve Deney-A1). Kare dizileri
// (dönen top, sallanan zil, şişen balon…) üst üste dizilmiş resimlerle oynatılır: kare değişince yalnız görünürlük değişir,
// çözme gecikmesi yok. Dizi henüz gelmediyse tek çizim CSS hareketiyle oynar (sahne.ts). Test kipinde eksik çizimin yerinde
// adı yazılı kesikli kutu.
import type { Kutu } from './motor';

const resimler = import.meta.glob<string>('../../../assets/deney/parkur/*.webp', { eager: true, query: '?url', import: 'default' });
export const cizim = (ad: string) => resimler['../../../assets/deney/parkur/' + ad + '.webp'] as string | undefined;
export const var_ = (ad: string) => !!cizim(ad);
export const hepsiVar = (adlar: readonly string[]) => adlar.every(var_);
/** Bir dizinin kareleri (ad-0, ad-1, …) — hepsi varsa adları, yoksa boş. */
export function dizi(ad: string, adet: number, bas = 0): string[] {
  const a = Array.from({ length: adet }, (_, i) => ad + '-' + (i + bas));
  return hepsiVar(a) ? a : [];
}

/** Dünyada (fon pikseli) bir kutu: yüzde olarak yerleşir (sahne ölçeklenince birlikte). */
export function yuzde(k: Kutu, el: HTMLElement, w: number, h: number) {
  el.style.left = (k.x / w) * 100 + '%';
  el.style.top = (k.y / h) * 100 + '%';
  el.style.width = (k.w / w) * 100 + '%';
  el.style.height = (k.h / h) * 100 + '%';
}
/** Tek çizimli öğe (yoksa adı yazılı yer tutucu). */
export function resimEl(ad: string, sinif: string) {
  const el = document.createElement('div');
  el.className = 'pk-oge ' + sinif;
  const url = cizim(ad);
  if (url) el.innerHTML = '<img src="' + url + '" alt="" draggable="false">';
  else el.dataset.ad = ad;
  return el;
}
/** Kare dizisi: üst üste resimler; `goster(i)` yalnız i. kareyi açar. Dizi yoksa `bos` true (tek çizimle oynanır). */
export class Kareler {
  readonly el: HTMLElement;
  readonly imgs: HTMLImageElement[] = [];
  private simdi = -1;
  private zaman = 0;
  constructor(readonly adlar: readonly string[], sinif: string, yedek?: string) {
    this.el = document.createElement('div');
    this.el.className = 'pk-oge pk-kareler ' + sinif;
    for (const ad of adlar) {
      const i = document.createElement('img');
      i.src = cizim(ad)!;
      i.alt = '';
      i.draggable = false;
      this.el.append(i);
      this.imgs.push(i);
    }
    if (!adlar.length) {
      const url = yedek ? cizim(yedek) : undefined;
      // Dizi yok: tek çizim hep görünür.
      if (url) this.el.innerHTML = '<img class="acik" src="' + url + '" alt="" draggable="false">';
      else this.el.dataset.ad = yedek ?? sinif;
    }
    this.goster(0);
  }
  get bos() { return !this.adlar.length; }
  goster(i: number) {
    if (this.bos) return;
    const k = ((i % this.imgs.length) + this.imgs.length) % this.imgs.length;
    if (k === this.simdi) return;
    this.imgs[this.simdi]?.classList.remove('acik');
    this.imgs[k].classList.add('acik');
    this.simdi = k;
  }
  /** Zamanla ilerleyen kare (fps); döngü değilse sonda kalır. */
  ilerle(dt: number, fps: number, dongu = true) {
    if (this.bos) return;
    this.zaman += dt;
    const i = Math.floor(this.zaman * fps);
    this.goster(dongu ? i : Math.min(i, this.imgs.length - 1));
  }
  basaSar() { this.zaman = 0; this.goster(0); }
}

/** Karakter pozları: yeni pozun çizimi gelmediyse Y1'in en yakın pozu. */
export const KINO_YEDEK: Record<string, string> = {
  'kino-gul': 'kino-sevin', 'kino-alkis': 'kino-sevin', 'kino-saskin-2': 'kino-saskin', 'kino-gozkapa': 'kino-saskin',
  'kino-isaret': 'kino-sevin', 'kino-zipla': 'kino-sevin', 'kino-dusun': 'kino-bekle-0', 'kino-islak': 'kino-saskin',
  'kino-tezahurat': 'kino-sevin', 'kino-kulak-kapa': 'kino-sevin',
};
export const CEREN_YEDEK: Record<string, string> = {
  'ceren-isaret': 'ceren-bekle', 'ceren-saskin': 'ceren-gul', 'ceren-dusun': 'ceren-bekle', 'ceren-tezahurat': 'ceren-alkis',
  'ceren-goz': 'ceren-bekle', 'ceren-anlat': 'ceren-bekle', 'ceren-kulak-kapa': 'ceren-alkis', 'ceren-zipla': 'ceren-alkis',
  'ceren-sevinc-2': 'ceren-alkis', 'ceren-ipucu': 'ceren-bekle',
};
export const KINO_POZLARI = ['kino-bekle-0', 'kino-bekle-1', 'kino-saskin', 'kino-sevin', ...Object.keys(KINO_YEDEK)] as const;
export const CEREN_POZLARI = ['ceren-bekle', 'ceren-alkis', 'ceren-gul', ...Object.keys(CEREN_YEDEK)] as const;
export type KinoPoz = (typeof KINO_POZLARI)[number];
export type CerenPoz = (typeof CEREN_POZLARI)[number];
