/**
 * Pati Dükkânı v2: ortak arayüz parçaları (kumbara, jeton, fiyat etiketi, kalp sırası, isim tabelası, minder).
 * Görseller ui-jeton sayfasından (Gün 1, yarın); gelene kadar SADE YER TUTUCU: Pasta'nın jetonu ve kavanozu, düz kalp
 * (SVG yolu), krem levha. Kodla süslü çizim yok. Yazı yok; 5-6'da yalnız rakam.
 * Animasyon yalnız transform / opacity (WAAPI); hiçbiri girdiyi kilitlemez.
 */
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import type { Efekt } from '../../kino-otobus/src/efekt';
import { BUYUK_JETON as BUYUK, doluYuvalar, etiketYuvalari, jetonParcalari } from './ekonomi';
import type { MinderRenk, Yas } from './katalog';
import { BUYUK_JETON, ISIM_TABELASI, JETON, KALP_BOS, KALP_DOLU, KUMBARA, MINDER_BEYAZ, MINDER_YEDEK } from './varliklar';

const AZ = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const sakin = () => AZ || TEST_MODU;

/** Ezilme-esneme (taban pivotlu): poz değişmeyen arayüz parçası için kısa canlılık */
export function ezil(el: Element | null | undefined, guc = 1, ms = 260) {
  if (!el || sakin()) return;
  const a = 0.1 * guc;
  (el as HTMLElement).animate(
    [
      { transform: 'scale(1, 1)' },
      { transform: `scale(${1 + a * 0.7}, ${1 - a})`, offset: 0.3 },
      { transform: `scale(${1 - a * 0.4}, ${1 + a * 0.8})`, offset: 0.65 },
      { transform: 'scale(1, 1)' },
    ],
    { duration: ms, easing: 'ease-out' },
  );
}

/** Bir jeton resmi (deger 5: büyük jeton) */
export function jetonEl(deger = 1, sinif = ''): HTMLElement {
  const buyuk = deger >= BUYUK;
  return h(`span.pt-jeton${buyuk ? '.pt-buyuk' : ''}${BUYUK_JETON || !buyuk ? '' : '.pt-yer-tutucu'}${sinif ? `.${sinif}` : ''}`, { 'data-deger': String(deger) }, h('img', { src: buyuk && BUYUK_JETON ? BUYUK_JETON : JETON, alt: '', draggable: 'false' }));
}

/** Düz kalp (ui-jeton kalbi gelene kadar yer tutucu): dolu kırmızı ya da boş krem, koyu kahve kontur */
const KALP_SVG = (dolu: boolean) =>
  `<svg viewBox="0 0 34 31" aria-hidden="true"><path d="M17 28.5C7 21 2.5 15.6 2.5 9.8 2.5 5.4 5.9 2.5 10 2.5c3 0 5.4 1.7 7 4.2 1.6-2.5 4-4.2 7-4.2 4.1 0 7.5 2.9 7.5 7.3 0 5.8-4.5 11.2-14.5 18.7z" fill="${dolu ? '#F2606B' : '#FFF4DD'}" stroke="#3B2416" stroke-width="2.6" stroke-linejoin="round"/></svg>`;
function kalpEl(dolu: boolean): HTMLElement {
  const u = dolu ? KALP_DOLU : KALP_BOS;
  return u ? h('span.pt-kalp', { 'data-dolu': dolu ? '1' : '0' }, h('img', { src: u, alt: '' })) : h('span.pt-kalp', { 'data-dolu': dolu ? '1' : '0', html: KALP_SVG(dolu) });
}

// ---------------------------------------------------------------- kumbara
/**
 * Kumbara (sağ üstte): kavanoz ve içindeki jetonlar. 3-4: jeton jeton (rakam yok), 5-6: büyük jetonlar + birlikler +
 * rakam. Jetonlar kavanozun yanında görünür (yer tutucu kavanoz saydam değil).
 */
export class Kumbara {
  readonly el: HTMLElement;
  private kavanoz: HTMLElement;
  private jetonlar: HTMLElement;
  private rakam: HTMLElement;
  private n = 0;
  constructor(private yas: () => Yas) {
    this.kavanoz = h('span.pt-kumbara-kavanoz', {}, h('img', { src: KUMBARA, alt: '', draggable: 'false' }));
    this.jetonlar = h('span.pt-kumbara-jetonlar');
    this.rakam = h('b.pt-kumbara-rakam');
    this.el = h('div.pt-kumbara', { 'aria-label': 'Kumbara', 'data-jeton': '0' }, this.kavanoz, this.jetonlar, this.rakam);
  }
  get jeton() {
    return this.n;
  }
  /** Gösterilen jeton sayısı (kayıttan ayrı: uçuş bitince artar) */
  ayarla(n: number) {
    this.n = Math.max(0, n);
    const y = this.yas();
    const p = jetonParcalari(this.n, y);
    this.jetonlar.replaceChildren(...p.map((v) => jetonEl(v)));
    this.jetonlar.dataset.adet = String(p.length);
    this.jetonlar.style.setProperty('--ust', `${-(p.length > 5 ? Math.min(13, 3 + (p.length - 5) * 2) : 3)}px`);
    this.rakam.textContent = y === 'buyuk' && this.n > 0 ? String(this.n) : '';
    this.el.dataset.jeton = String(this.n);
  }
  /** Jetonun girdiği / çıktığı nokta (ekran): kavanozun ağzı */
  agiz(): [number, number] {
    const r = this.kavanoz.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height * 0.3];
  }
  /** Bir jeton girdi: kavanoz ezilip esner */
  yut() {
    ezil(this.kavanoz, 1.2);
  }
}

// ---------------------------------------------------------------- fiyat etiketi
/** Fiyat etiketi: jeton yuvaları (boş daire → ödenince jeton) ve 5-6'da rakam */
export class Etiket {
  readonly el: HTMLElement;
  private yuvalar: HTMLElement[] = [];
  private degerler: number[] = [];
  constructor(
    readonly fiyat: number,
    yas: Yas,
  ) {
    this.degerler = etiketYuvalari(fiyat, yas);
    this.yuvalar = this.degerler.map((v) => h(`span.pt-yuva${v >= BUYUK ? '.pt-buyuk' : ''}`, { 'data-deger': String(v) }, jetonEl(v, 'pt-yuva-jeton')));
    this.el = h(`div.pt-etiket${this.degerler.length > 4 ? '.pt-iki-sira' : ''}`, { 'data-fiyat': String(fiyat) }, h('span.pt-etiket-yuvalar', {}, ...this.yuvalar), yas === 'buyuk' ? h('b.pt-etiket-rakam', {}, String(fiyat)) : null);
  }
  /** Ödeme başlar: yuvalar boş daire olur (jetonlar gelip dolduracak) */
  odemeBasla() {
    this.el.classList.add('odeme');
    this.goster(0, true);
  }
  /** Ödenen toplama göre yuvalar (dolu: jeton, boş: daire). 0: etiket fiyatı gösterir (ödeme bitti) */
  goster(odenen: number, odemede = odenen > 0) {
    const d = doluYuvalar(this.degerler, odenen);
    this.yuvalar.forEach((y, i) => y.classList.toggle('dolu', d[i]));
    this.el.classList.toggle('odeme', odemede);
  }
  /** Ödenen toplam bu kadarken jetonun ineceği yuva (ekran noktası) */
  yuvaNoktasi(odenenSonra: number): [number, number] {
    let t = 0;
    let i = this.degerler.findIndex((v) => (t += v) >= odenenSonra);
    if (i < 0) i = this.yuvalar.length - 1;
    const r = this.yuvalar[i].getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  }
  /** Eksik yuvalar bir kez nabız atar (yetmedi) */
  eksikNabiz() {
    for (const y of this.yuvalar) if (!y.classList.contains('dolu')) ezil(y, 1.6, 420);
  }
}

/** Bir jetonu efekt katmanında iki ekran noktası arasında uçurur (kavisli, dönmeden) */
export async function jetonUcur(efekt: Efekt, [x0, y0]: [number, number], [x1, y1]: [number, number], deger = 1, ms = 360, boy = 30) {
  const k = efekt.kutu();
  const j = jetonEl(deger, 'pt-ucan-jeton');
  j.style.width = j.style.height = `${deger >= BUYUK ? boy * 1.3 : boy}px`;
  await efekt.ucur(j, [x0 - k.left, y0 - k.top], [x1 - k.left, y1 - k.top], { ms, kavis: -Math.max(40, Math.abs(x1 - x0) * 0.25) });
}

// ---------------------------------------------------------------- kalp sırası
/** 3 kalplik mutluluk göstergesi; dolan kalp büyüyüp yerine oturur */
export class KalpSirasi {
  readonly el: HTMLElement;
  private kalpler: HTMLElement[] = [];
  constructor(sayi: number) {
    this.el = h('div.pt-kalpler', { 'aria-hidden': 'true' });
    for (let i = 0; i < sayi; i++) {
      const k = h('span.pt-kalp-kap', {}, kalpEl(false), kalpEl(true));
      this.kalpler.push(k);
      this.el.append(k);
    }
  }
  ayarla(n: number) {
    this.kalpler.forEach((k, i) => k.classList.toggle('dolu', i < n));
    this.el.dataset.dolu = String(n);
  }
  /** i. kalp doldu (animasyonlu) */
  doldur(i: number) {
    const k = this.kalpler[i];
    if (!k) return;
    k.classList.add('dolu');
    this.el.dataset.dolu = String(i + 1);
    if (!sakin())
      k.animate(
        [
          { transform: 'scale(0.4)', opacity: 0.4 },
          { transform: 'scale(1.45, 1.3)', opacity: 1, offset: 0.45 },
          { transform: 'scale(0.9, 1.08)', offset: 0.75 },
          { transform: 'scale(1)' },
        ],
        { duration: 520, easing: 'ease-out' },
      );
  }
  /** i. kalbin ekran ortası (uçan kalbin hedefi) */
  nokta(i: number): [number, number] {
    const r = (this.kalpler[i] ?? this.el).getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  }
  /** Dans başlarken kalpler sırayla zıplar, sonra boşalır */
  async bosalt() {
    for (let i = 0; i < this.kalpler.length; i++) {
      ezil(this.kalpler[i], 1.8, 300);
      await new Promise((r) => setTimeout(r, sure(90)));
    }
    this.ayarla(0);
  }
}

// ---------------------------------------------------------------- isim tabelası ve minder
/** İsim tabelası (yer tutucu: krem levha; ui-isim-tabelasi gelince onun üstüne yazı) */
export function isimTabelasi(ad: string): HTMLButtonElement {
  return h(`button.pt-tabela${ISIM_TABELASI ? '.pt-tabela-resimli' : ''}`, { type: 'button', style: ISIM_TABELASI ? `--tabela:url("${ISIM_TABELASI}")` : '' }, h('span.pt-tabela-ad', {}, ad)) as HTMLButtonElement;
}

/** Minder renkleri: beyaz minder gelince çarpma karışımıyla boyanır; yer tutucu battaniye ton kaydırmasıyla */
export const MINDER_RENK: Record<MinderRenk, { boya: string; ton: string }> = {
  kirmizi: { boya: '#F4868B', ton: 'hue-rotate(150deg) saturate(1.25)' },
  mavi: { boya: '#8EC5EE', ton: 'none' },
  sari: { boya: '#FFD66B', ton: 'hue-rotate(-160deg) saturate(1.6) brightness(1.12)' },
  yesil: { boya: '#9BD88E', ton: 'hue-rotate(-95deg) saturate(1.1)' },
};
export function minderEl(renk: MinderRenk, sinif = ''): HTMLElement {
  const r = MINDER_RENK[renk];
  if (MINDER_BEYAZ)
    return h(`span.pt-minder2.pt-boyali${sinif ? `.${sinif}` : ''}`, { 'data-renk': renk, style: `--boya:${r.boya};--maske:url("${MINDER_BEYAZ}")` }, h('img', { src: MINDER_BEYAZ, alt: '', draggable: 'false' }), h('i.pt-minder-boya'));
  return h(`span.pt-minder2${sinif ? `.${sinif}` : ''}`, { 'data-renk': renk, style: `--ton:${r.ton}` }, h('img', { src: MINDER_YEDEK, alt: '', draggable: 'false' }));
}
