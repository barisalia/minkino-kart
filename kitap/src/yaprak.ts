/**
 * Çevrilen yaprak (CSS 3D): yaprak omurga çevresinde döner; üç şeride bölünmüştür ve dış şeritler geriden gelir
 * (kağıdın kıvrılması). Her şeridin önünde ve arkasında sayfanın o dilimi durur (önde çevrilen sayfa, arkada bir
 * sonraki sayfa). Işık: şerit açısına göre gölge. Yalnız transform + opacity (GPU), kare başına 3 dönüşüm + 6 opaklık.
 */

/** Şerit enleri (omurgadan dışa) */
const SERITLER = [0.5, 0.3, 0.2];
/** En büyük kıvrılma (derece, dış uçta toplam) */
const KIVRIM = 34;

export interface YaprakSecenek {
  /** Yaprağın kutusu (kitap içinde) */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Omurga yaprağın hangi kenarında */
  omurga: 'sol' | 'sag';
  /** Başlangıç ve bitiş açısı (derece); ileri: 0 → -180 (omurga solda) */
  aci0: number;
  aci1: number;
  /** Ön ve arka yüzün içeriği (her şerit için kopyalanır) */
  on: HTMLElement;
  arka: HTMLElement | null;
}

export class Yaprak {
  readonly el: HTMLElement;
  private seritler: HTMLElement[] = [];
  private isiklar: HTMLElement[] = [];
  private isaret: number;
  p = 0;

  constructor(private o: YaprakSecenek) {
    this.el = document.createElement('div');
    this.el.className = `kt-yaprak kt-omurga-${o.omurga}`;
    Object.assign(this.el.style, { left: `${o.x}px`, top: `${o.y}px`, width: `${o.w}px`, height: `${o.h}px` });
    // kıvrılma yönü: dış şerit dönüşün gerisinde kalır
    this.isaret = -Math.sign(o.aci1 - o.aci0) || 1;
    let ebeveyn: HTMLElement = this.el;
    let bas = 0;
    SERITLER.forEach((oran, i) => {
      const sw = o.w * oran;
      const s = document.createElement('div');
      s.className = 'kt-serit';
      // omurga solda: şerit soldan sağa dizilir, döndürme sol kenarından; sağda tersi
      const ilk = i === 0;
      Object.assign(s.style, {
        width: `${sw}px`,
        height: `${o.h}px`,
        [o.omurga === 'sol' ? 'left' : 'right']: ilk ? '0px' : '100%',
        transformOrigin: o.omurga === 'sol' ? 'left center' : 'right center',
      });
      // ön yüz: çevrilen sayfanın [bas, bas+sw] dilimi (sayfa koordinatında, omurgadan uzaklık)
      const onX = o.omurga === 'sol' ? bas : o.w - bas - sw;
      s.append(this.yuz(o.on, onX, sw, false));
      if (o.arka) {
        // arka yüz: arka sayfa omurganın öbür yanında; ayna dilimi
        const arkaX = o.omurga === 'sol' ? o.w - bas - sw : bas;
        s.append(this.yuz(o.arka, arkaX, sw, true));
      } else s.append(this.bosArka(sw));
      ebeveyn.append(s);
      this.seritler.push(s);
      ebeveyn = s;
      bas += sw;
    });
    this.ayarla(0);
  }

  private yuz(kaynak: HTMLElement, x: number, sw: number, arka: boolean): HTMLElement {
    const y = document.createElement('div');
    y.className = arka ? 'kt-yuz kt-yuz-arka' : 'kt-yuz';
    y.style.width = `${sw + 0.6}px`;
    const k = kaynak.cloneNode(true) as HTMLElement;
    k.classList.add('kt-kopya');
    k.style.visibility = '';
    for (const i of k.querySelectorAll('img')) i.decoding = 'sync';
    Object.assign(k.style, { position: 'absolute', left: `${-x}px`, top: '0px', width: `${this.o.w}px`, height: `${this.o.h}px`, margin: '0' });
    const isik = document.createElement('div');
    isik.className = 'kt-isik';
    y.append(k, isik);
    this.isiklar.push(isik);
    return y;
  }

  private bosArka(sw: number): HTMLElement {
    const y = document.createElement('div');
    y.className = 'kt-yuz kt-yuz-arka kt-kagit';
    y.style.width = `${sw + 0.6}px`;
    const isik = document.createElement('div');
    isik.className = 'kt-isik';
    y.append(isik);
    this.isiklar.push(isik);
    return y;
  }

  /** p: 0 (başlangıç) … 1 (çevrildi) */
  ayarla(p: number, kivrim = 1) {
    this.p = p;
    const { aci0, aci1 } = this.o;
    const aci = aci0 + (aci1 - aci0) * p;
    const b = Math.sin(Math.PI * Math.min(1, Math.max(0, p))) * KIVRIM * kivrim * this.isaret;
    const acilar = [aci, b * 0.45, b * 0.55];
    let mutlak = 0;
    this.seritler.forEach((s, i) => {
      s.style.transform = `rotateY(${acilar[i].toFixed(2)}deg)`;
      mutlak += acilar[i];
      // ışık: yüz bakana dik döndükçe kararır; arka yüz de aynı
      const golge = 0.32 * (1 - Math.abs(Math.cos((mutlak * Math.PI) / 180)));
      const on = this.isiklar[i * 2];
      const ar = this.isiklar[i * 2 + 1];
      if (on) on.style.opacity = golge.toFixed(3);
      if (ar) ar.style.opacity = (golge * 0.8).toFixed(3);
    });
  }

  kaldir() {
    this.el.remove();
  }
}
