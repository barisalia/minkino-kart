/**
 * Oyuncu: sahnedeki bir karakter (Ada, konuklar). Pozlar (normal, şapkalı, alkış, şaşkın, dans, saklanıyor, dilek)
 * tam görsel değişimiyle, hareketler (zıplama, dans, sallanma, yürüme) kodla yapılır.
 * Poz görselleri: assets/parti-ifade/<ad>/<poz>.webp (tasarımcılar Gemini ile üretir). Olmayan poz yerine normal
 * çizim + kodla hareket kullanılır; şapka yoksa çizimin üstüne ayrı şapka takılır.
 */
import { h } from '../../src/ui/dom';
import { adres } from './gorsel';

export type Poz = 'normal' | 'sapkali' | 'alkis' | 'saskin' | 'dans' | 'dans2' | 'saklaniyor' | 'dilek' | 'mutlu' | 'selam';
const POZLAR: Poz[] = ['normal', 'sapkali', 'alkis', 'saskin', 'dans', 'dans2', 'saklaniyor', 'dilek', 'mutlu', 'selam'];
/** Tasarımcı görsellerinde şapkalı çizilen pozlar */
const SAPKALI = new Set<Poz>(['sapkali', 'alkis', 'saskin', 'dans', 'dans2']);

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
/** Hareketi azalt tercihi: bakınma yok, zıplamalar alçak, titreşim yok */
export const AZ_HAREKET = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const rastgele = (a: number, b: number) => a + Math.random() * (b - a);

// Kolay kullanım için hazır eğriler (anahtar kare başına): fırlama yavaşlar, düşüş hızlanır, iniş yumuşar
const EGRI = {
  cik: 'cubic-bezier(0.2, 0.75, 0.35, 1)',
  dus: 'cubic-bezier(0.55, 0, 0.85, 0.35)',
  yumusak: 'cubic-bezier(0.45, 0, 0.3, 1)',
  topla: 'cubic-bezier(0.3, 1.5, 0.5, 1)',
};

/**
 * Anahtar karelerdeki dikey konumdan gölge kareleri üretir: karakter yükseldikçe gölge küçülür ve silikleşir.
 * translateY(-30%) ya da translate(x, -30%) biçimlerini okur.
 */
function golgeKareleri(kf: Keyframe[]): Keyframe[] {
  return kf.map((k) => {
    const t = String(k.transform ?? '');
    const m = t.match(/translateY\((-?[\d.]+)%\)/) ?? t.match(/translate\([^,)]+,\s*(-?[\d.]+)%\)/);
    const y = m ? Math.max(0, -Number(m[1])) : 0;
    const s = Math.max(0.45, 1 - y / 70);
    const g: Keyframe = { transform: `scale(${s.toFixed(3)})`, opacity: Math.max(0.35, 1 - y / 90) };
    if (k.offset !== undefined) g.offset = k.offset;
    if (k.easing) g.easing = k.easing;
    return g;
  });
}

/** Dans figürleri (alkış başına bir figür; hepsi ayak tabanından döner, esneyip sıkışır) */
export type Figur = 'zipla' | 'yanAdim' | 'don' | 'twist' | 'kalca' | 'egilKalk' | 'takla' | 'selam';
export const FIGURLER: Figur[] = ['yanAdim', 'zipla', 'twist', 'don', 'kalca', 'egilKalk', 'selam', 'takla'];

export class Oyuncu {
  readonly el: HTMLElement;
  readonly ad: string;
  private resimler = new Map<Poz, HTMLImageElement>();
  private hareket: HTMLElement;
  /** bakınma / ağırlık aktarma katmanı (hareketin içinde, nefesin dışında) */
  private bakis: HTMLElement;
  private golge: HTMLElement;
  private bosZaman = 0;
  private yuruyor = false;
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
    this.bakis = h('div.mc-oy-bakis', {}, govde);
    this.hareket = h('div.mc-oy-hareket', {}, this.bakis);
    this.balonEl = h('div.mc-oy-balon');
    this.golge = h('i.mc-oy-golge');
    // nefes/bekleme döngüleri herkeste aynı anda ve aynı hızda olmasın
    const faz = (-Math.random() * 3).toFixed(2);
    const nefes = rastgele(2.6, 3.5).toFixed(2);
    this.el = h('div.mc-oyuncu', { 'data-ad': s.ad, style: `--w:${s.boy ?? 24};--ar:${s.oran ?? 1};--faz:${faz}s;--nefes:${nefes}s` }, this.golge, this.hareket, this.balonEl);
    this.goster('normal');
    if (!AZ_HAREKET) this.bosPlanla();
  }

  // ---------------------------------------------------------------- boşta: ara sıra bakınma, ağırlık aktarma
  private bosPlanla() {
    clearTimeout(this.bosZaman);
    this.bosZaman =window.setTimeout(() => this.bosHareket(), rastgele(2500, 6500));
  }

  /** Karakter boştaysa küçük bir bakınma ya da kıpırtı yapar (hareket / yürüyüş sırasında yapmaz) */
  private bosHareket() {
    // sahneden kaldırıldıysa döngü biter
    if (!this.el.isConnected && this.el.dataset.baglandi) return;
    if (this.el.isConnected) this.el.dataset.baglandi = '1';
    const mesgul = this.yuruyor || this.hareket.getAnimations().length > 0 || this.el.classList.contains('gizli');
    if (this.el.isConnected && !mesgul) {
      const yon = Math.random() < 0.5 ? -1 : 1;
      const tur = Math.random();
      const kf: Keyframe[] =
        tur < 0.55
          ? // bakınma: başını bir yana çevirir gibi eğilir, biraz durur, döner
            [
              { transform: 'rotate(0) translateX(0)' },
              { transform: `rotate(${yon * 3.5}deg) translateX(${yon * 1.5}%)`, offset: 0.25, easing: EGRI.yumusak },
              { transform: `rotate(${yon * 3}deg) translateX(${yon * 1.5}%)`, offset: 0.7, easing: EGRI.yumusak },
              { transform: 'rotate(0) translateX(0)' },
            ]
          : tur < 0.85
            ? // ağırlığını öbür ayağına verir
              [
                { transform: 'translateX(0) rotate(0)' },
                { transform: `translateX(${yon * 2.5}%) rotate(${-yon * 2}deg) scale(1.02, 0.98)`, offset: 0.4, easing: EGRI.yumusak },
                { transform: 'translateX(0) rotate(0)' },
              ]
            : // küçük sevinç kıpırtısı (topuk kaldırma)
              [
                { transform: 'translateY(0) scale(1, 1)' },
                { transform: 'translateY(0) scale(1.04, 0.95)', offset: 0.2, easing: EGRI.cik },
                { transform: 'translateY(-4%) scale(0.98, 1.03)', offset: 0.45, easing: EGRI.dus },
                { transform: 'translateY(0) scale(1.03, 0.97)', offset: 0.7, easing: EGRI.topla },
                { transform: 'translateY(0) scale(1, 1)' },
              ];
      this.bakis.animate(kf, { duration: tur < 0.55 ? rastgele(1400, 2000) : 900, easing: 'linear' });
    }
    this.bosPlanla();
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

  /** Hareket katmanında bir animasyon; gölge dikey konuma göre kendiliğinden küçülüp büyür */
  private oynat(kf: Keyframe[], ms: number, easing = 'ease-in-out') {
    const secenek: KeyframeAnimationOptions = { duration: ms, easing };
    this.golge.animate(golgeKareleri(kf), secenek);
    return this.hareket.animate(kf, secenek).finished.catch(() => undefined);
  }

  /**
   * Zıplama: önce çömelir (hazırlık), fırlarken uzar, tepede yuvarlaklaşır, inişte basılır, sonra toparlanır.
   * Fırlama yavaşlayarak, düşüş hızlanarak (anahtar kare başına eğri).
   */
  zipla(yukseklik = 28) {
    const y = AZ_HAREKET ? yukseklik * 0.4 : yukseklik;
    return this.oynat(
      [
        { transform: 'translateY(0) scale(1, 1)', easing: EGRI.yumusak },
        { transform: 'translateY(0) scale(1.14, 0.84)', offset: 0.2, easing: EGRI.cik },
        { transform: `translateY(-${y * 0.85}%) scale(0.9, 1.12)`, offset: 0.38, easing: EGRI.cik },
        { transform: `translateY(-${y}%) scale(1, 1)`, offset: 0.5, easing: EGRI.dus },
        { transform: `translateY(-${y * 0.3}%) scale(0.94, 1.08)`, offset: 0.66, easing: EGRI.dus },
        { transform: 'translateY(0) scale(1.18, 0.82)', offset: 0.74, easing: EGRI.topla },
        { transform: 'translateY(0) scale(0.97, 1.04)', offset: 0.88, easing: EGRI.yumusak },
        { transform: 'translateY(0) scale(1, 1)' },
      ],
      760,
      'linear',
    );
  }

  /** Sevinç: çömelip zıplar, alkış pozu (tepki dalgasında komşular daha küçüğünü yapar) */
  sevin(yukseklik = 20, ms = 900) {
    this.poz('alkis', ms);
    return this.zipla(yukseklik);
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

  /** Dans figürü: yon = 1 sağa, -1 sola (karşılıklı ayna figürler için); ms figür süresi */
  figur(f: Figur, yon: 1 | -1 = 1, ms = 640) {
    const Y = yon;
    const kf: Record<Figur, Keyframe[]> = {
      zipla: [
        { transform: 'translateY(0) scale(1, 1)' },
        { transform: 'translateY(0) scale(1.16, 0.82)', offset: 0.18 },
        { transform: 'translateY(-34%) scale(0.9, 1.12)', offset: 0.45 },
        { transform: 'translateY(-38%) scale(1, 1) rotate(0)', offset: 0.55 },
        { transform: 'translateY(0) scale(1.18, 0.84)', offset: 0.8 },
        { transform: 'translateY(0) scale(1, 1)' },
      ],
      yanAdim: [
        { transform: 'translate(0, 0) rotate(0)' },
        { transform: `translate(${Y * 16}%, -12%) rotate(${Y * 8}deg)`, offset: 0.25 },
        { transform: `translate(${Y * 22}%, 0) scale(1.08, 0.92)`, offset: 0.45 },
        { transform: `translate(${Y * 6}%, -10%) rotate(${-Y * 6}deg)`, offset: 0.72 },
        { transform: 'translate(0, 0) rotate(0)' },
      ],
      don: [
        { transform: 'translateY(0) scale(1, 1)' },
        { transform: 'translateY(0) scale(1.12, 0.88)', offset: 0.16 },
        { transform: 'translateY(-14%) scale(0.55, 1.05)', offset: 0.3 },
        { transform: 'translateY(-18%) scale(-0.55, 1.05)', offset: 0.36 },
        { transform: 'translateY(-22%) scale(-1, 1.03)', offset: 0.5 },
        { transform: 'translateY(-18%) scale(-0.55, 1.05)', offset: 0.64 },
        { transform: 'translateY(-14%) scale(0.55, 1.05)', offset: 0.7 },
        { transform: 'translateY(0) scale(1.12, 0.9)', offset: 0.86 },
        { transform: 'translateY(0) scale(1, 1)' },
      ],
      twist: [
        { transform: 'rotate(0) scale(1, 1)' },
        { transform: `rotate(${Y * 12}deg) scale(1.06, 0.9)`, offset: 0.2 },
        { transform: `rotate(${-Y * 12}deg) scale(1.06, 0.9)`, offset: 0.45 },
        { transform: `rotate(${Y * 10}deg) scale(1.04, 0.94)`, offset: 0.7 },
        { transform: 'rotate(0) scale(1, 1)' },
      ],
      kalca: [
        { transform: 'skewX(0) translateX(0)' },
        { transform: `skewX(${Y * 12}deg) translateX(${-Y * 4}%)`, offset: 0.2 },
        { transform: `skewX(${-Y * 12}deg) translateX(${Y * 4}%)`, offset: 0.4 },
        { transform: `skewX(${Y * 12}deg) translateX(${-Y * 4}%)`, offset: 0.6 },
        { transform: `skewX(${-Y * 10}deg) translateX(${Y * 3}%)`, offset: 0.8 },
        { transform: 'skewX(0) translateX(0)' },
      ],
      egilKalk: [
        { transform: 'translateY(0) scale(1, 1)' },
        { transform: 'translateY(0) scale(1.2, 0.72)', offset: 0.35 },
        { transform: `translateY(-26%) scale(0.88, 1.16) rotate(${Y * 6}deg)`, offset: 0.62 },
        { transform: 'translateY(0) scale(1.08, 0.92)', offset: 0.85 },
        { transform: 'translateY(0) scale(1, 1)' },
      ],
      selam: [
        { transform: 'rotate(0) translateY(0)' },
        { transform: `rotate(${Y * 14}deg) translateY(-4%)`, offset: 0.3 },
        { transform: `rotate(${Y * 14}deg) translateY(-4%) scale(1.04)`, offset: 0.6 },
        { transform: 'rotate(0) translateY(0)' },
      ],
      takla: [
        { transform: 'translateY(0) rotate(0) scale(1, 1)' },
        { transform: 'translateY(0) rotate(0) scale(1.15, 0.8)', offset: 0.15 },
        { transform: `translateY(-50%) rotate(${Y * 180}deg) scale(0.95, 1.05)`, offset: 0.5 },
        { transform: `translateY(-8%) rotate(${Y * 350}deg) scale(1, 1)`, offset: 0.8 },
        { transform: `translateY(0) rotate(${Y * 360}deg) scale(1.12, 0.88)`, offset: 0.9 },
        { transform: `translateY(0) rotate(${Y * 360}deg) scale(1, 1)` },
      ],
    };
    // takla ve dönüşte ağırlık merkezinden dönsün
    this.hareket.style.transformOrigin = f === 'takla' ? '50% 55%' : '';
    return this.oynat(kf[f], f === 'takla' ? ms * 1.3 : ms, 'cubic-bezier(0.45, 0, 0.3, 1)');
  }

  /** Sahneye giriş: el sallar gibi sallanıp zıplar */
  async selamVer() {
    this.poz('selam', 1100);
    await this.figur('selam', 1, 520);
    await this.figur('selam', -1, 520);
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

  /**
   * Sahnede bir yere yürü (x: sahne genişliğinin %'si, merkez; y: alttan %).
   * Yalnız transform ile: yeni yer hemen yazılır, karakter eski yerinden oraya "translate" ile kayar (FLIP).
   * Adım ritminde sekip gidiş yönüne eğilir; başlarken hafif geri yaslanır, varınca basıp toparlanır.
   */
  async git(x: number, y: number, ms = 900) {
    const x0 = this.el.offsetLeft;
    const y0 = this.el.offsetTop;
    this.koy(x, y);
    const dx = x0 - this.el.offsetLeft;
    const dy = y0 - this.el.offsetTop;
    if (Math.hypot(dx, dy) < 1) {
      await bekle(ms);
      return;
    }
    const yon = dx > 0 ? -1 : 1;
    this.el.style.setProperty('--yon', String(yon));
    // adım süresi mesafeye göre: kısa yolda ufak ve sık, uzun yolda ölçülü
    this.el.style.setProperty('--adim', `${Math.max(0.3, Math.min(0.46, ms / 2400))}s`);
    this.yuruyor = true;
    this.el.classList.add('yuruyor');
    const yol = this.el.animate([{ translate: `${dx}px ${dy}px` }, { translate: '0 0' }], { duration: ms, easing: 'cubic-bezier(0.4, 0, 0.3, 1)' });
    await yol.finished.catch(() => undefined);
    this.el.classList.remove('yuruyor');
    this.yuruyor = false;
    // varış: ağırlık öne gider, basar, toparlanır
    void this.oynat(
      [
        { transform: 'rotate(0) scale(1, 1)' },
        { transform: `rotate(${yon * 3}deg) scale(1.06, 0.94)`, offset: 0.35, easing: EGRI.topla },
        { transform: 'rotate(0) scale(1, 1)' },
      ],
      320,
      'linear',
    );
  }

  /** Anında konumla (geçişsiz) */
  koy(x: number, y: number) {
    this.el.getAnimations().forEach((a) => a.cancel());
    this.el.style.setProperty('--x', String(x));
    this.el.style.setProperty('--y', String(y));
  }

  set katman(z: number) {
    this.el.style.zIndex = String(z);
  }
}
