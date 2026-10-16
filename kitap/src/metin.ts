/**
 * Sayfanın yazı alanı: senaryonun metni, büyük ve sıcak yazıyla (uygulamanın yazı tipi Fredoka). Konuşma satırları
 * karakter rengiyle ayrışır; ses etiketleri ([giggles] …) basılmaz. "Bana oku"da okunan kelime vurgulanır.
 * Yazı boyu sayfa kutusuna sığan en büyük boydur (14-30 px).
 */
import type { Kim, Satir } from './tipler';

export interface KarakterBilgi {
  ad: string;
  /** Krem sayfa üstünde okunaklı (kontrast ≥ 4.5) */
  renk: string;
  /** Cihaz sesinin tonu (kayıt yokken) */
  ton: number;
  /** Ses kaydı karakter adı (content/seslendirme.json → karakter_sesleri) */
  karakter?: string;
}

export const KARAKTERLER: Record<Kim, KarakterBilgi> = {
  anlatici: { ad: '', renk: '#3B2416', ton: 1 },
  kino: { ad: 'Kino', renk: '#2F7A1F', ton: 0.92, karakter: 'kino' },
  anne: { ad: 'Anne', renk: '#8A5A00', ton: 1.02 },
  baba: { ad: 'Baba', renk: '#9C1F36', ton: 0.78 },
  lokum: { ad: 'Lokum', renk: '#B8336F', ton: 1.35 },
  mino: { ad: 'Mino', renk: '#B5500A', ton: 1.18 },
  ogretmen: { ad: 'Öğretmen', renk: '#6A3FB5', ton: 1.06 },
  bulut: { ad: 'Bulut', renk: '#2C5A94', ton: 1.12 },
  tombi: { ad: 'Tombi', renk: '#7A4A1C', ton: 0.8 },
  cocuklar: { ad: 'Çocuklar', renk: '#B42A2A', ton: 1.2 },
  ses: { ad: '', renk: '#C2410C', ton: 1 },
};

/** Cihaz sesinin okuyacağı / sayfaya basılan metin: ses etiketleri silinmiş (src/audio/konusma.ts ile aynı kural) */
export const etiketsiz = (m: string) => m.replace(/\[[^\]]*\]\s*/g, '').trim();

/** Kelimeler ve etiketsiz metindeki başlangıç yerleri (cihaz sesinin 'boundary' sırasıyla eşleşir) */
export function kelimeler(m: string): { k: string; bas: number }[] {
  const t = etiketsiz(m);
  const c: { k: string; bas: number }[] = [];
  for (const e of t.matchAll(/\S+/g)) c.push({ k: e[0], bas: e.index! });
  return c;
}

export interface MetinSecenek {
  /** Kapak: büyük başlık */
  baslik?: string;
  /** Alt köşedeki sayfa numarası */
  no?: number;
  /** Satıra dokununca (o satır okunur) */
  satirTik?: (i: number) => void;
}

export class MetinSayfasi {
  readonly el: HTMLElement;
  private ic: HTMLElement;
  private satirEl: HTMLElement[] = [];
  private kelimeEl: HTMLElement[][] = [];
  private bas: number[][] = [];

  constructor(
    readonly satirlar: Satir[],
    o: MetinSecenek = {},
  ) {
    this.el = document.createElement('div');
    this.el.className = 'kt-metin';
    this.ic = document.createElement('div');
    this.ic.className = 'kt-metin-ic';
    this.el.append(this.ic);
    if (o.baslik) {
      const b = document.createElement('h1');
      b.className = 'kt-baslik';
      b.textContent = o.baslik;
      this.ic.append(b);
    }
    satirlar.forEach((s, i) => {
      const bilgi = KARAKTERLER[s.kim];
      const p = document.createElement('p');
      p.className = `kt-satir kt-${s.kim}`;
      p.style.setProperty('--renk', bilgi.renk);
      p.dataset.kim = s.kim;
      if (bilgi.ad && s.kim !== 'anlatici') {
        const ad = document.createElement('span');
        ad.className = 'kt-kim';
        ad.textContent = bilgi.ad;
        p.append(ad);
      }
      const govde = document.createElement('span');
      govde.className = 'kt-soz';
      const kel = kelimeler(s.metin);
      const els: HTMLElement[] = [];
      kel.forEach((w, j) => {
        const sp = document.createElement('span');
        sp.className = 'kt-k';
        sp.textContent = w.k;
        govde.append(sp);
        if (j < kel.length - 1) govde.append(' ');
        els.push(sp);
      });
      p.append(govde);
      if (o.satirTik)
        p.addEventListener('click', (e) => {
          e.stopPropagation();
          o.satirTik!(i);
        });
      this.ic.append(p);
      this.satirEl.push(p);
      this.kelimeEl.push(els);
      this.bas.push(kel.map((w) => w.bas));
    });
    if (o.no) {
      const n = document.createElement('div');
      n.className = 'kt-no';
      n.textContent = String(o.no);
      this.el.append(n);
    }
  }

  /** Kutuya sığan en büyük yazı boyu (px) */
  sigdir(enBuyuk = 30, enKucuk = 14) {
    let a = enKucuk;
    let b = enBuyuk;
    const cs = getComputedStyle(this.el);
    const sigar = (px: number) => {
      this.el.style.setProperty('--yazi', `${px}px`);
      const bos = this.el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      return this.ic.scrollHeight <= bos - 1 && this.ic.scrollWidth <= this.ic.clientWidth + 1;
    };
    if (sigar(b)) return b;
    while (b - a > 0.5) {
      const m = (a + b) / 2;
      if (sigar(m)) a = m;
      else b = m;
    }
    sigar(a);
    return a;
  }

  /** Okunan satır ve kelime (satır -1: vurgu yok) */
  vurgula(satir: number, kelime = -1) {
    this.satirEl.forEach((p, i) => p.classList.toggle('kt-okunan', i === satir));
    this.kelimeEl.forEach((ks, i) => ks.forEach((k, j) => k.classList.toggle('kt-simdi', i === satir && j === kelime)));
  }

  /** Etiketsiz metindeki karakter sırasından kelime numarası */
  kelimeBul(satir: number, karakter: number): number {
    const b = this.bas[satir] ?? [];
    let i = 0;
    while (i + 1 < b.length && b[i + 1] <= karakter) i++;
    return i;
  }

  kelimeSayisi(satir: number) {
    return this.bas[satir]?.length ?? 0;
  }
}

/** Ebeveyn sayfası (okunmaz) */
export function ebeveynSayfasi(e: { baslik: string; sorular: string[]; not: string }): HTMLElement {
  const el = document.createElement('div');
  el.className = 'kt-metin kt-ebeveyn';
  const ic = document.createElement('div');
  ic.className = 'kt-metin-ic';
  const ust = document.createElement('div');
  ust.className = 'kt-eb-ust';
  ust.textContent = 'Anne-babalar için';
  const b = document.createElement('h2');
  b.textContent = e.baslik;
  const ol = document.createElement('ol');
  for (const s of e.sorular) {
    const li = document.createElement('li');
    li.textContent = s;
    ol.append(li);
  }
  const n = document.createElement('p');
  n.className = 'kt-eb-not';
  n.textContent = e.not;
  ic.append(ust, b, ol, n);
  el.append(ic);
  return el;
}
