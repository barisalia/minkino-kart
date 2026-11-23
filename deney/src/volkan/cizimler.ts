// Deneyler · Köpüren Renk Volkanı: Astra'nın çizimleri (assets/deney/volkan/*.webp; Paket Deney-Y3 ikinci yazım). Kare dizileri
// (köpüğün doğuşu, taşması, akışı; Kino'nun önlük giymesi…) üst üste dizilmiş resimlerle oynar: kare değişince yalnız görünürlük
// değişir, çözme gecikmesi yok. Dizi henüz gelmediyse tek çizim CSS hareketiyle oynar; o da yoksa test kipinde adı yazılı kesikli
// kutu. Boyanan çizimler (sıvı, köpük, damla): Astra çok açık gri çizer, kod rengi çarpar (kontur koyu kalır).
const resimler = import.meta.glob<string>('../../../assets/deney/volkan/*.webp', { eager: true, query: '?url', import: 'default' });
export const cizim = (ad: string) => resimler['../../../assets/deney/volkan/' + ad + '.webp'] as string | undefined;
export const var_ = (ad: string) => !!cizim(ad);
/** Bir dizinin kareleri (ad-0, ad-1, …): hepsi varsa adları, yoksa boş. */
export function dizi(ad: string, adet: number): string[] {
  const a = Array.from({ length: adet }, (_, i) => ad + '-' + i);
  return a.every(var_) ? a : [];
}

/** Tek kare: resim (boyalıysa üstünde aynı biçimde maske, renk çarpılır). Çizim yoksa adı yazılı yer tutucu. */
function kareEl(ad: string, boyali: boolean) {
  const el = document.createElement('div');
  el.className = 'vk-kare';
  const url = cizim(ad);
  if (!url) { el.dataset.ad = ad; return el; }
  el.innerHTML = '<img src="' + url + '" alt="" draggable="false">';
  if (boyali) {
    const b = document.createElement('i');
    b.className = 'vk-boya';
    b.style.setProperty('mask-image', 'url("' + url + '")');
    b.style.setProperty('-webkit-mask-image', 'url("' + url + '")');
    el.append(b);
  }
  return el;
}
/** Tek çizimli öğe. */
export function resimEl(ad: string, sinif: string, boyali = false) {
  const el = document.createElement('div');
  el.className = 'vk-oge ' + sinif + (boyali ? ' vk-boyali' : '');
  const k = kareEl(ad, boyali);
  k.classList.add('acik');
  if (k.dataset.ad) el.dataset.ad = ad;
  el.append(k);
  return el;
}

/**
 * Kare dizisi: üst üste kareler; `goster(i)` yalnız i. kareyi açar. Dizi gelmediyse `yedek` çizim tek kare olarak durur (`bos` true,
 * hareketi CSS yapar); o da yoksa yer tutucu.
 */
export class Kareler {
  readonly el: HTMLElement;
  readonly kareler: HTMLElement[] = [];
  private simdi = -1;
  private zaman = 0;
  constructor(readonly adlar: readonly string[], sinif: string, ops: { yedek?: string; boyali?: boolean; ad?: string } = {}) {
    this.el = document.createElement('div');
    this.el.className = 'vk-oge vk-kareler ' + sinif + (ops.boyali ? ' vk-boyali' : '');
    const liste = adlar.length ? adlar : ops.yedek && var_(ops.yedek) ? [ops.yedek] : [];
    for (const ad of liste) {
      const k = kareEl(ad, !!ops.boyali);
      this.el.append(k);
      this.kareler.push(k);
    }
    if (!liste.length) this.el.dataset.ad = ops.ad ?? ops.yedek ?? sinif;
    this.goster(0);
  }
  /** Gerçek dizi yok (tek çizim ya da yer tutucu). */
  get bos() { return !this.adlar.length; }
  get adet() { return this.kareler.length; }
  goster(i: number) {
    if (!this.kareler.length) return;
    const k = Math.max(0, Math.min(this.kareler.length - 1, i));
    if (k === this.simdi) return;
    this.kareler[this.simdi]?.classList.remove('acik');
    this.kareler[k].classList.add('acik');
    this.simdi = k;
  }
  /** Zamanla ilerleyen kare (fps); döngü değilse sonda kalır. */
  ilerle(dt: number, fps: number, dongu = true) {
    if (!this.kareler.length) return;
    this.zaman += dt;
    const i = Math.floor(this.zaman * fps);
    this.goster(dongu ? i % this.kareler.length : i);
  }
  basaSar() { this.zaman = 0; this.simdi = -1; for (const k of this.kareler) k.classList.remove('acik'); this.goster(0); }
  /** Kareleri sırayla bir kez oynatır (kare başına `ms`); dizi yoksa aynı süre bekler. */
  oynat(ms: number, bekle: (ms: number) => Promise<void>) {
    this.basaSar();
    const n = Math.max(1, this.adlar.length);
    let p = Promise.resolve();
    for (let i = 1; i < n; i++) p = p.then(() => bekle(ms)).then(() => this.goster(i));
    return p.then(() => bekle(ms));
  }
}

/** Karakter pozları: yeni pozun çizimi gelmediyse en yakın poz (sonunda temel poz; o da yoksa yer tutucu). */
export const KINO_YEDEK: Record<string, string> = {
  'kino-hazir-1': 'kino-hazir-0', 'kino-hazir-isaret': 'kino-hazir-0', 'kino-onluklu': 'kino-hazir-0',
  'kino-bekle-0': 'kino-onluklu', 'kino-bekle-1': 'kino-bekle-0', 'kino-isaret': 'kino-bekle-0', 'kino-dusun': 'kino-bekle-0',
  'kino-merak': 'kino-bekle-0', 'kino-saskin': 'kino-merak', 'kino-kahkaha': 'kino-bekle-0', 'kino-iyy': 'kino-merak',
  'kino-alkis': 'kino-kahkaha', 'kino-geri': 'kino-saskin', 'kino-hapsir-0': 'kino-merak', 'kino-hapsir-1': 'kino-kahkaha',
  'kino-gozluk-kopuk': 'kino-iyy', 'kino-sil': 'kino-bekle-0',
};
export const LOKUM_YEDEK: Record<string, string> = {
  'lokum-ilk-1': 'lokum-ilk-0', 'lokum-bekle-0': 'lokum-ilk-0', 'lokum-bekle-1': 'lokum-bekle-0', 'lokum-egil': 'lokum-bekle-0',
  'lokum-uzat': 'lokum-bekle-0', 'lokum-gul': 'lokum-bekle-0', 'lokum-alkis': 'lokum-gul', 'lokum-zipla': 'lokum-gul',
  'lokum-saskin': 'lokum-bekle-0', 'lokum-saklan': 'lokum-saskin', 'lokum-iyy': 'lokum-saskin',
};
/** Kare dizileri (giyinme): Kino'nun önlüğü ve gözlüğü, Lokum'un gözlüğü. */
export const GIYINME = { 'kino-onluk': 3, 'kino-gozluk': 3, 'lokum-gozluk': 2 } as const;
export const KINO_POZLARI = ['kino-hazir-0', ...Object.keys(KINO_YEDEK)];
export const LOKUM_POZLARI = ['lokum-ilk-0', ...Object.keys(LOKUM_YEDEK)];
/** Bir pozun gösterilecek çizimi (yedek zinciri; hiçbiri yoksa istenen ad, yer tutucu olur). */
export function pozCiz(ad: string, yedek: Record<string, string>) {
  let a: string | undefined = ad;
  for (let i = 0; a && i < 8; i++) { if (var_(a)) return a; a = yedek[a]; }
  return ad;
}

/** Sayfanın açılması için gereken çizimler (gerisi gelene dek yedekle oynar). */
export const TEMEL = [
  'volkan-fon', 'onluk', 'gozluk', 'ortu', 'volkan', 'kolba', 'kolba-sivi', 'kavanoz', 'kasik', 'karbonat', 'sepet', 'sepet-on',
  'sise-kirmizi', 'sise-sari', 'sise-mavi', 'akis-1', 'kopuk-kabar-0', 'birikinti-0', 'sunger', 'tarif-kart', 'damla',
  'secim-renk', 'secim-dev', 'defter-acik', 'cikartma', 'cikartma-kopuk', 'kino-hazir-0', 'kino-onluklu', 'kino-bekle-0', 'lokum-ilk-0',
  'lokum-bekle-0',
] as const;
