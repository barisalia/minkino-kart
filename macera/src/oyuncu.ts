/**
 * Oyuncu: sahnedeki bir karakter (Ada, konuklar). Pozlar (normal, şapkalı, alkış, şaşkın, dans, saklanıyor, dilek)
 * tam görsel değişimiyle, hareketler (zıplama, dans, sallanma, yürüme) kodla yapılır.
 * Poz görselleri: assets/parti-ifade/<ad>/<poz>.webp (tasarımcılar Gemini ile üretir). Olmayan poz yerine normal
 * çizim + kodla hareket kullanılır; şapka yoksa çizimin üstüne ayrı şapka takılır.
 */
import { h } from '../../src/ui/dom';
import { adres } from './gorsel';

export type Poz = 'normal' | 'sapkali' | 'alkis' | 'saskin' | 'dans' | 'saklaniyor' | 'dilek' | 'mutlu';
const POZLAR: Poz[] = ['normal', 'sapkali', 'alkis', 'saskin', 'dans', 'saklaniyor', 'dilek', 'mutlu'];
/** Tasarımcı görsellerinde şapkalı çizilen pozlar */
const SAPKALI = new Set<Poz>(['sapkali', 'alkis', 'saskin', 'dans', 'saklaniyor']);

export interface OyuncuSecenek {
  ad: string;
  /** normal çizimin yolu, ör. 'hayvanlar/tavsan' */
  resim: string;
  /** şapkanın kafadaki yeri (karakter kutusuna göre %): x merkez, y alt, genişlik, eğim */
  sapka?: { x: number; y: number; w: number; d?: number };
  /** sahnedeki genişlik (sahne genişliğinin %'si) */
  boy?: number;
  /** çizimin en/boy oranı (kare değilse) */
  oran?: number;
}

const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export class Oyuncu {
  readonly el: HTMLElement;
  readonly ad: string;
  private resimler = new Map<Poz, HTMLImageElement>();
  private hareket: HTMLElement;
  private sapkaEl: HTMLElement | null = null;
  private balonEl: HTMLElement;
  private simdiki: Poz = 'normal';
  private sapkaTakili = false;
  private gecici = 0;

  constructor(s: OyuncuSecenek) {
    this.ad = s.ad;
    const govde = h('div.mc-oy-govde');
    for (const p of POZLAR) {
      const url = adres(`parti-ifade/${s.ad}/${p}`) || (p === 'normal' ? adres(s.resim) : '');
      if (!url) continue;
      const img = h('img.mc-oy-resim', { src: url, alt: '', draggable: 'false', 'data-poz': p }) as HTMLImageElement;
      this.resimler.set(p, img);
      govde.append(img);
    }
    if (s.sapka) {
      const { x, y, w, d = 0 } = s.sapka;
      this.sapkaEl = h('img.mc-oy-sapka', { src: adres('parti/sapka'), alt: '', draggable: 'false', style: `--sx:${x}%;--sy:${y}%;--sw:${w}%;--sd:${d}deg` });
      govde.append(this.sapkaEl);
    }
    this.hareket = h('div.mc-oy-hareket', {}, govde);
    this.balonEl = h('div.mc-oy-balon');
    this.el = h('div.mc-oyuncu', { 'data-ad': s.ad, style: `--w:${s.boy ?? 24};--ar:${s.oran ?? 1}` }, h('i.mc-oy-golge'), this.hareket, this.balonEl);
    this.goster('normal');
  }

  /** Şapkayı tak/çıkar: şapkalı poz görseli varsa onu, yoksa ayrı şapkayı kullanır */
  sapkaTak(tak = true) {
    this.sapkaTakili = tak;
    this.goster(this.simdiki);
  }

  private goster(p: Poz) {
    const sapkaliVar = this.resimler.has('sapkali');
    let hedef: Poz = this.resimler.has(p) ? p : 'normal';
    if (hedef === 'normal' && this.sapkaTakili && sapkaliVar) hedef = 'sapkali';
    this.resimler.forEach((img, k) => {
      const onceki = img.classList.contains('aktif');
      img.classList.toggle('aktif', k === hedef);
      // yeni poz üstte belirir, eskisi kısa süre altta kalır: geçişte karakter saydamlaşmaz
      if (onceki && k !== hedef) {
        img.classList.add('onceki');
        setTimeout(() => img.classList.remove('onceki'), 160);
      }
    });
    // ayrı şapka yalnızca gösterilen görselde şapka yoksa takılır (tasarımcıların poz görselleri şapkalıdır)
    const gorseldeSapkaVar = hedef !== 'normal' && SAPKALI.has(hedef) && !(this.ad === 'ada' && hedef === 'saskin');
    this.sapkaEl?.classList.toggle('acik', this.sapkaTakili && !gorseldeSapkaVar);
    this.el.dataset.poz = p;
  }

  /** Poz ver; ms verilirse o süre sonra eski hâline döner */
  poz(p: Poz, ms = 0) {
    clearTimeout(this.gecici);
    this.simdiki = ms ? this.simdiki : p;
    this.goster(p);
    if (ms) this.gecici = window.setTimeout(() => this.goster(this.simdiki), ms);
  }

  private oynat(kf: Keyframe[], ms: number, easing = 'ease-in-out') {
    return this.hareket.animate(kf, { duration: ms, easing }).finished.catch(() => undefined);
  }

  zipla(yukseklik = 28) {
    return this.oynat(
      [
        { transform: 'translateY(0) scale(1, 1)' },
        { transform: 'translateY(0) scale(1.12, 0.86)', offset: 0.15 },
        { transform: `translateY(-${yukseklik}%) scale(0.92, 1.1)`, offset: 0.45 },
        { transform: 'translateY(0) scale(1.14, 0.86)', offset: 0.72 },
        { transform: 'translateY(0) scale(0.97, 1.03)', offset: 0.86 },
        { transform: 'translateY(0) scale(1, 1)' },
      ],
      680,
    );
  }

  /** Bir dans figürü (sağa-sola, zıplayarak) */
  dansEt() {
    const yon = Math.random() < 0.5 ? -1 : 1;
    return this.oynat(
      [
        { transform: 'translate(0, 0) rotate(0)' },
        { transform: `translate(${yon * 6}%, -10%) rotate(${yon * 10}deg)`, offset: 0.3 },
        { transform: `translate(${-yon * 6}%, -4%) rotate(${-yon * 8}deg)`, offset: 0.65 },
        { transform: 'translate(0, 0) rotate(0)' },
      ],
      620,
    );
  }

  /** Kıkırdama / kıpırdanma */
  kipir() {
    return this.oynat([{ transform: 'rotate(0)' }, { transform: 'rotate(-5deg) scale(1.03, 0.97)' }, { transform: 'rotate(5deg)' }, { transform: 'rotate(0)' }], 520);
  }

  /** Sürekli hafif sallanma (şarkıda) */
  sallan(acik: boolean) {
    this.el.classList.toggle('sallaniyor', acik);
  }

  /** Konuşma balonu */
  async balon(yazi: string, ms = 1400) {
    this.balonEl.textContent = yazi;
    this.balonEl.classList.remove('acik');
    void this.balonEl.offsetWidth;
    this.balonEl.classList.add('acik');
    await bekle(ms);
    this.balonEl.classList.remove('acik');
  }

  /** Sahnede bir yere yürü/koş (x: sahne genişliğinin %'si, merkez; y: alttan %) */
  async git(x: number, y: number, ms = 900) {
    this.el.style.transitionDuration = `${ms}ms`;
    this.el.style.setProperty('--x', String(x));
    this.el.style.setProperty('--y', String(y));
    this.el.classList.add('yuruyor');
    await bekle(ms);
    this.el.classList.remove('yuruyor');
  }

  /** Anında konumla (geçişsiz) */
  koy(x: number, y: number) {
    this.el.style.transitionDuration = '0ms';
    this.el.style.setProperty('--x', String(x));
    this.el.style.setProperty('--y', String(y));
  }

  set katman(z: number) {
    this.el.style.zIndex = String(z);
  }
}
