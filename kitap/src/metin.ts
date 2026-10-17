/**
 * Sayfanın yazı alanı: senaryonun metni, büyük ve sıcak kitap yazısıyla (Fraunces, yumuşak; kitap/yazi/ içinde
 * paketli, internet istemez). Anlatının ilk harfi süslü baş harf; konuşma satırları karakter rengiyle ve konuşanın
 * küçük yüzüyle (madalyon) ayrışır; ses etiketleri ([giggles] …) basılmaz. "Bana oku"da okunan kelimenin altı
 * yumuşak bir kalemle çizilir. Yazı boyu sayfa kutusuna sığan en büyük boydur.
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
  babaanne: { ad: 'Babaanne', renk: '#7A3F8F', ton: 0.98 },
  dede: { ad: 'Dede', renk: '#4A5A6A', ton: 0.74 },
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

/** Satırdaki kelimelerin tahmini bitiş anları (harf birimi; noktalamadan sonra kısa duraklama) */
export function kelimeAgirliklari(metin: string): number[] {
  let t = 0;
  return kelimeler(metin).map((w) => {
    t += w.k.replace(/[^\p{L}\p{N}]/gu, '').length + 1.2 + (/[.!?]$/.test(w.k) ? 5 : /[,:;]$/.test(w.k) ? 2.5 : /\.\.\.$/.test(w.k) ? 6 : 0);
    return t;
  });
}

export interface MetinSecenek {
  /** Kapak: büyük başlık */
  baslik?: string;
  /** Alt ortadaki sayfa numarası */
  no?: number;
  /** Satıra dokununca (o satır okunur) */
  satirTik?: (i: number) => void;
  /** Konuşanın küçük yüzü (madalyon): kitabın kendi çiziminden kırpılmış resim; yoksa adının baş harfi */
  yuz?: (kim: Kim) => string | null;
}

/**
 * Bir sayfanın metni. Yatayda iki parçaya bölünebilir: baştaki satırlar sol sayfada resmin altına (solEl), kalanı
 * sağ sayfaya (el). Bölme ve yazı boyu sigdir()'de: iki kutuya da sığan en büyük boy; resmin altında yer varsa ilk
 * satır oraya gelir (sayfada boş krem kalmasın). Okuma ve vurgu bölünmeden bağımsız (satırlar aynı öğeler).
 */
export class MetinSayfasi {
  readonly el: HTMLElement;
  /** Sol sayfada resmin altındaki parça (yalnız yatayda kitaba eklenir) */
  readonly solEl: HTMLElement;
  private ic: HTMLElement;
  private solIc: HTMLElement;
  private satirEl: HTMLElement[] = [];
  private kelimeEl: HTMLElement[][] = [];
  private bas: number[][] = [];
  /** Sol parçadaki satır sayısı */
  solda = 0;

  constructor(
    readonly satirlar: Satir[],
    o: MetinSecenek = {},
  ) {
    this.el = document.createElement('div');
    this.el.className = 'kt-metin';
    this.ic = document.createElement('div');
    this.ic.className = 'kt-metin-ic';
    this.el.append(this.ic);
    this.solEl = document.createElement('div');
    this.solEl.className = 'kt-metin kt-metin-sol';
    this.solIc = document.createElement('div');
    this.solIc.className = 'kt-metin-ic';
    this.solEl.append(this.solIc);
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
      // sayfanın ilk satırı anlatıcıysa süslü baş harf
      if (i === 0 && s.kim === 'anlatici' && !o.baslik) p.classList.add('kt-ilk');
      if (bilgi.ad && s.kim !== 'anlatici') {
        p.classList.add('kt-konusma');
        const ad = document.createElement('span');
        ad.className = 'kt-kim';
        ad.setAttribute('role', 'img');
        ad.setAttribute('aria-label', bilgi.ad);
        const url = o.yuz?.(s.kim);
        if (url) {
          const r = document.createElement('img');
          r.alt = '';
          r.draggable = false;
          r.decoding = 'async';
          r.src = url;
          ad.append(r);
        } else {
          ad.classList.add('kt-kim-harf');
          ad.textContent = bilgi.ad.charAt(0);
        }
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

  /** Baştaki k satırı sol parçaya, kalanı sağa koyar (sıra korunur) */
  private bol(k: number) {
    this.solda = k;
    this.satirEl.forEach((p, i) => (i < k ? this.solIc : this.ic).append(p));
    this.solEl.classList.toggle('kt-bos', k === 0);
  }

  private sigiyor(kutu: HTMLElement, ic: HTMLElement) {
    const cs = getComputedStyle(kutu);
    const bos = kutu.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    return ic.scrollHeight <= bos - 1 && ic.scrollWidth <= ic.clientWidth + 1;
  }

  /**
   * Kutuya sığan en büyük yazı boyu (px). Sol parça kitaba eklenmiş ve yeri varsa iki kutu birlikte: önce resmin
   * altına sığdığı kadar satır, kalanı sağa; ilk satır sola ancak çok küçük boyda sığıyorsa hepsi sağda.
   */
  sigdir(enBuyuk = 30, enKucuk = 14) {
    const iki = this.solEl.isConnected && this.solEl.clientHeight > 0;
    const yaz = (px: number) => {
      this.el.style.setProperty('--yazi', `${px}px`);
      this.solEl.style.setProperty('--yazi', `${px}px`);
    };
    /** px boyunda sığar mı; enAz: sola en az bu kadar satır */
    const sigar = (px: number, enAz: number) => {
      yaz(px);
      this.bol(0);
      if (!iki) return this.sigiyor(this.el, this.ic);
      let k = 0;
      while (k < this.satirEl.length) {
        this.bol(k + 1);
        if (!this.sigiyor(this.solEl, this.solIc)) {
          this.bol(k);
          break;
        }
        k++;
      }
      return k >= enAz && this.sigiyor(this.el, this.ic);
    };
    const ara = (enAz: number) => {
      if (sigar(enBuyuk, enAz)) return enBuyuk;
      if (!sigar(enKucuk, enAz)) return 0;
      let a = enKucuk;
      let b = enBuyuk;
      while (b - a > 0.5) {
        const m = (a + b) / 2;
        if (sigar(m, enAz)) a = m;
        else b = m;
      }
      return a;
    };
    // resmin altında yer varsa ilk satır oraya (boy en çok 2 px küçülür); yoksa hepsi sağda
    const birli = iki ? ara(1) : 0;
    const serbest = ara(0) || enKucuk;
    const solaBir = birli > 0 && birli >= serbest - 2;
    const px = solaBir ? birli : serbest;
    sigar(px, solaBir ? 1 : 0);
    return px;
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
