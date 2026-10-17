/**
 * Pati Dükkânı v2: ortak arayüz parçaları (kumbara, jeton, fiyat etiketi, kalp sırası, isim tabelası, minder).
 * Görseller ui-jeton sayfasından (Gün 1, yarın); gelene kadar SADE YER TUTUCU: Pasta'nın jetonu ve kavanozu, düz kalp
 * (SVG yolu), krem levha. Kodla süslü çizim yok. Yazı yok; 5-6'da yalnız rakam.
 * Animasyon yalnız transform / opacity (WAAPI); hiçbiri girdiyi kilitlemez.
 */
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import type { Efekt } from '../../kino-otobus/src/efekt';
import { BUYUK_JETON as BUYUK, doluYuvalar, etiketYuvalari, jetonParcalari } from './ekonomi';
import { esyaBilgi, type CekmeceAdi, type MinderRenk, type Yas } from './katalog';
import { ses } from './sesler';
import { BUYUK_JETON, dolapEtiketi, dolapResmi, esyaResmi, ISIM_TABELASI, JETON, KALP_BOS, KALP_DOLU, KUMBARA, MINDER_BEYAZ, MINDER_YEDEK } from './varliklar';

const AZ = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const sakin = () => AZ || TEST_MODU;

/** Ezilme-esneme (taban pivotlu): poz değişmeyen arayüz parçası için kısa canlılık */
export function ezil(el: Element | null | undefined, guc = 1, ms = 260) {
  if (!el || sakin()) return;
  const a = 0.1 * guc;
  // scale özelliği: öğenin kendi transform'u (konumu) bozulmaz
  (el as HTMLElement).animate(
    [
      { scale: '1 1' },
      { scale: `${1 + a * 0.7} ${1 - a}`, offset: 0.3 },
      { scale: `${1 - a * 0.4} ${1 + a * 0.8}`, offset: 0.65 },
      { scale: '1 1' },
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

// ---------------------------------------------------------------- eşya ve çekmece resimleri (Bakım Odası, defter)
/**
 * Çekmece önlerinin SADE YER TUTUCUSU (ui-dolap sayfası gelene kadar): tek renkli düz resim, koyu kahve kontur.
 * Kâse, damla, top, fırça, yastık, bantlı kalp. Kodla süslü çizim yok.
 */
const K = '#3B2416';
const PIKTO: Record<CekmeceAdi, string> = {
  mama: `<path d="M10 30h44c-2 13-11 20-22 20S12 43 10 30z" fill="#F2A65A" stroke="${K}" stroke-width="3.5" stroke-linejoin="round"/><circle cx="22" cy="27" r="4" fill="#B5703A" stroke="${K}" stroke-width="2.5"/><circle cx="31" cy="25" r="4" fill="#B5703A" stroke="${K}" stroke-width="2.5"/><circle cx="40" cy="27" r="4" fill="#B5703A" stroke="${K}" stroke-width="2.5"/>`,
  su: `<path d="M32 8C26 20 17 29 17 39a15 15 0 0 0 30 0c0-10-9-19-15-31z" fill="#7EC8F0" stroke="${K}" stroke-width="3.5" stroke-linejoin="round"/>`,
  oyuncak: `<circle cx="32" cy="32" r="19" fill="#F2606B" stroke="${K}" stroke-width="3.5"/><path d="M15 26c11 5 23 5 34 0" fill="none" stroke="${K}" stroke-width="3"/>`,
  temizlik: `<rect x="12" y="28" width="40" height="13" rx="5" fill="#E9B77A" stroke="${K}" stroke-width="3.5"/><path d="M17 41v9M24 41v9M31 41v9M38 41v9M45 41v9" stroke="${K}" stroke-width="3" stroke-linecap="round"/><rect x="26" y="12" width="12" height="16" rx="4" fill="#C98A4B" stroke="${K}" stroke-width="3.5"/>`,
  yatak: `<path d="M12 24c6-5 34-5 40 0 3 6 3 14 0 20-6 5-34 5-40 0-3-6-3-14 0-20z" fill="#B9A6E8" stroke="${K}" stroke-width="3.5" stroke-linejoin="round"/>`,
  ecza: `<path d="M32 50C19 41 12 34 12 25c0-6 5-11 11-11 4 0 7 2 9 5 2-3 5-5 9-5 6 0 11 5 11 11 0 9-7 16-20 25z" fill="#F2606B" stroke="${K}" stroke-width="3.5" stroke-linejoin="round"/><rect x="21" y="25" width="22" height="9" rx="4" fill="#FFF4DD" stroke="${K}" stroke-width="3"/>`,
};
const piktogram = (c: CekmeceAdi, sinif: string) => h(`span.${sinif}.pt-yer-tutucu`, { 'data-cekmece': c, html: `<svg viewBox="0 0 64 64" aria-hidden="true">${PIKTO[c]}</svg>` });

/**
 * Çekmece önünün resmi: ui-dolap sayfası gelince çekmece önünün tamamı; gelene kadar o çekmecenin onaylı eşya çizimi
 * etiket gibi (kâse, su kabı, top, fırça, minder, yara bandı; varliklar.ts → dolapEtiketi); o da yoksa sade piktogram.
 */
export function dolapEl(c: CekmeceAdi): HTMLElement {
  const u = dolapResmi(c);
  if (u) return h('span.pt-dolap-resim', { 'data-cekmece': c }, h('img', { src: u, alt: '', draggable: 'false' }));
  const e = dolapEtiketi(c);
  if (e) return h('span.pt-dolap-resim.pt-dolap-etiket', { 'data-cekmece': c }, h('img', { src: e, alt: '', draggable: 'false' }));
  return piktogram(c, 'pt-dolap-resim');
}

/** Eşyanın resmi (esya-<ad>; yoksa çekmecesinin sade piktogramı) */
export function esyaEl(id: string): HTMLElement {
  const u = esyaResmi(id);
  if (u) return h('span.pt-esya-resim', { 'data-esya': id }, h('img', { src: u, alt: '', draggable: 'false' }));
  const e = piktogram(esyaBilgi(id).cekmece, 'pt-esya-resim');
  e.dataset.esya = id;
  return e;
}

// ---------------------------------------------------------------- düşen jetonlar
/**
 * Hayvanın iki yanına düşen jetonlar (5-6'da beşlikler büyük). Dokununca kumbaraya uçar; 6 sn içinde toplanmazsa
 * kendisi uçar. Kayda çağıran hemen yazar (hiçbiri kaybolmaz); kumbara göstergesi uçuş bitince artar.
 */
export class DusenJetonlar {
  private dusenler = new Set<HTMLElement>();
  private toplanan = 0;
  constructor(
    private katman: HTMLElement,
    private efekt: Efekt,
    private kumbara: Kumbara,
    private kayitJeton: () => number,
    private yas: () => Yas,
    private etkilesim: () => void = () => undefined,
  ) {}

  /** katman içinde (ax, ay) noktasının iki yanına n jeton; yay: hayvanın yarı eni (jetonlar onun dışına düşer) */
  dusur(n: number, ax: number, ay: number, yay = 70) {
    jetonParcalari(n, this.yas()).forEach((v, i) => {
      const j = h('button.pt-dusen-jeton', { type: 'button', 'aria-label': 'Jeton', 'data-deger': String(v) }, jetonEl(v));
      const dx = (i % 2 ? 1 : -1) * (yay + Math.floor(i / 2) * 40) + (Math.random() * 8 - 4);
      j.style.transform = `translate(${(ax + dx).toFixed(0)}px, ${(ay - 8).toFixed(0)}px)`;
      this.katman.append(j);
      this.dusenler.add(j);
      j.addEventListener('click', () => this.topla(j, v));
      if (!sakin())
        j.animate(
          [
            { transform: `translate(${ax.toFixed(0)}px, ${(ay - 70).toFixed(0)}px) scale(.6)` },
            { transform: `translate(${(ax + dx * 0.6).toFixed(0)}px, ${(ay - 110).toFixed(0)}px) scale(1)`, offset: 0.35 },
            { transform: `translate(${(ax + dx).toFixed(0)}px, ${(ay - 8).toFixed(0)}px) scale(1.15, .85)`, offset: 0.75 },
            { transform: `translate(${(ax + dx).toFixed(0)}px, ${(ay - 8).toFixed(0)}px) scale(1)` },
          ],
          { duration: 620, delay: i * 90, easing: 'ease-in', fill: 'backwards' },
        );
      ses.jeton(i);
      window.setTimeout(() => this.topla(j, v), sure(6000));
    });
  }

  topla(j: HTMLElement, v: number) {
    if (!this.dusenler.has(j)) return;
    this.dusenler.delete(j);
    this.etkilesim();
    const r = j.getBoundingClientRect();
    j.remove();
    const sira = this.toplanan++;
    void jetonUcur(this.efekt, [r.left + r.width / 2, r.top + r.height / 2], this.kumbara.agiz(), v, 420).then(() => {
      this.kumbara.ayarla(Math.min(this.kayitJeton(), this.kumbara.jeton + v));
      this.kumbara.yut();
      ses.jeton(sira);
      if (!this.dusenler.size) {
        this.toplanan = 0;
        this.kumbara.ayarla(this.kayitJeton());
      }
    });
  }

  hepsiniTopla() {
    for (const j of [...this.dusenler]) this.topla(j, Number(j.dataset.deger) || 1);
  }

  get sayi() {
    return this.dusenler.size;
  }
}

// ---------------------------------------------------------------- okşama
/**
 * Parmakla okşama (v1 kuralı): YAVAŞ sürtünce okşanır, HIZLI sürtünce irkilir (komik, cezasız); kısa dokunuş ayrı.
 * Dönen: dinleyicileri kaldırır.
 */
export function oksamaBagla(el: HTMLElement, o: { oksa: () => void; irkil: () => void; dokun: () => void }): () => void {
  el.style.touchAction = 'none';
  let id: number | null = null;
  let sx = 0;
  let sy = 0;
  let st = 0;
  let yol = 0;
  let hizli = 0;
  let yavas = 0;
  let tetik = 0;
  const bas = (e: PointerEvent) => {
    if (id !== null) return;
    id = e.pointerId;
    sx = e.clientX;
    sy = e.clientY;
    st = performance.now();
    yol = hizli = yavas = tetik = 0;
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* yok say */
    }
  };
  const kay = (e: PointerEvent) => {
    if (e.pointerId !== id) return;
    const t = performance.now();
    const d = Math.hypot(e.clientX - sx, e.clientY - sy);
    const v = d / Math.max(1, t - st);
    yol += d;
    if (d > 2) {
      if (v > 1.8) hizli += d;
      else yavas += d;
    }
    sx = e.clientX;
    sy = e.clientY;
    st = t;
    if (yol - tetik > 140) {
      tetik = yol;
      if (hizli > yavas * 1.2) o.irkil();
      else o.oksa();
      hizli = yavas = 0;
    }
  };
  const son = (e: PointerEvent) => {
    if (e.pointerId !== id) return;
    id = null;
    if (yol < 14 && e.type === 'pointerup') o.dokun();
  };
  el.addEventListener('pointerdown', bas);
  el.addEventListener('pointermove', kay);
  el.addEventListener('pointerup', son);
  el.addEventListener('pointercancel', son);
  return () => {
    el.removeEventListener('pointerdown', bas);
    el.removeEventListener('pointermove', kay);
    el.removeEventListener('pointerup', son);
    el.removeEventListener('pointercancel', son);
  };
}

/** Uçan kalp (ui-jeton kalbi gelince o; yoksa düz kalp) */
export function ucanKalpEl(): HTMLElement {
  return KALP_DOLU ? h('span.pt-ucan-kalp', {}, h('img', { src: KALP_DOLU, alt: '' })) : h('span.pt-ucan-kalp', { html: KALP_SVG(true) });
}
