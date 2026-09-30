/**
 * "Salıncak Kimin?" parktaki çocuklar ve anne.
 *
 * Can ve Ada: tasarımcının önden iskeleti (assets/karakter-iskelet/can, ada) ortak Karakter bileşeniyle; Can
 * yürürken yan görünüşe (can-profil, src/karakter/yandan.ts) döner, adımları yola göre. Bankta ve salıncakta oturan
 * çocuk: kalçası oturakta, bacakları önden sarkar ve sallanır. Can'ın asık yüzü: ağzın yerine ters kavis, kaşlar
 * kalkık (kodla, kafa katmanına eklenir; kafa dönünce onlar da döner).
 *
 * Anne: Ege bölümündeki çizimler (assets/ege/anne.webp ayakta, anne-sariliyor.webp oturan, kollar açık); aynı
 * piksel ölçeğinde (anne-hizalama.json), baş boyu pozdan poza değişmez.
 */
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { Karakter, type Poz } from '../../src/karakter/karakter';
import { YandanKarakter, yandanVar } from '../../src/karakter/yandan';
import { ANNE_TUVAL, egeAdres } from './ege-cizim';
import { CAN_ASIK_AGIZ, CAN_UZGUN_KAS } from './salincak-cizim';
import { AZ_HAREKET } from './oyuncu';

const NS = 'http://www.w3.org/2000/svg';
const S = Math.sin;

/**
 * Çocuk ölçüleri (2048'lik çizim birimi): başın tepesi ve ayak tabanı (önden), kalça (oturunca oturağa değen),
 * yan görünüşte başın tepesi ve ayak tabanı. Ölçü: tasarımcının çizimi (scratchpad incelemesi, 2026-09-29).
 */
const OLCU: Record<'can' | 'ada', { tepe: number; taban: number; kalca: number; yanTepe: number; yanTaban: number }> = {
  can: { tepe: 250, taban: 1800, kalca: 1440, yanTepe: 230, yanTaban: 1925 },
  ada: { tepe: 50, taban: 1995, kalca: 1560, yanTepe: 60, yanTaban: 1995 },
};

export class Cocuk {
  readonly el: HTMLElement;
  readonly yol: HTMLElement;
  readonly gov: HTMLElement;
  readonly kap: HTMLElement;
  readonly kar: Karakter;
  readonly yan: YandanKarakter | null;
  private yanKap: HTMLElement | null = null;
  private balonEl: HTMLElement;
  private asik: SVGGElement | null = null;
  /** 0 neşeli … 1 surat asık */
  private uzgunluk = 0;
  private uzgunSimdi = 0;
  private oturuyor = false;
  private sayBas = -9;
  private selamBas = -9;
  private selamSure = 0;
  private sevinBas = -9;
  private zincirTut = false;
  private t = 0;
  hedefX: number | null = null;
  hedefY: number | null = null;

  constructor(readonly ad: 'can' | 'ada') {
    this.kar = new Karakter(ad, h('div'));
    this.kap = h('div.sl-cocuk-on', {}, this.kar.el);
    this.yan = yandanVar(ad) ? new YandanKarakter(ad) : null;
    const o = OLCU[ad];
    const kutular: HTMLElement[] = [this.kap];
    if (this.yan) {
      // yan görünüş aynı boyda: başın tepesi ile ayak tabanı önden çizimle aynı yerde
      const olcek = (o.taban - o.tepe) / (o.yanTaban - o.yanTepe);
      const altPay = ((2048 - o.taban) - (2048 - o.yanTaban) * olcek) / 2048;
      this.yanKap = h('div.sl-cocuk-yan', { style: `width:${(olcek * 100).toFixed(2)}%;bottom:${(altPay * 100).toFixed(2)}%` }, this.yan.el);
      kutular.push(this.yanKap);
    }
    this.balonEl = h('div.mc-oy-balon.sl-kisi-balon');
    this.gov = h('div.sl-cocuk-gov', {}, ...kutular);
    this.yol = h('div.sl-cocuk-yol', {}, h('i.sl-golge'), this.gov);
    this.el = h('div.sl-cocuk', { 'data-el': ad }, this.yol, this.balonEl);
    this.kar.ekHareket = (p, t) => this.poz(p, t);
    void this.kar.hazir.then(() => this.yuzKur());
  }

  hazir() {
    return this.kar.hazir;
  }

  /** Oturunca kalçanın kutu altından yüksekliği (kutu yüksekliğinin oranı) */
  get kalcaOran() {
    return (2048 - OLCU[this.ad].kalca) / 2048;
  }
  /** Ayak tabanının kutu altından yüksekliği (oran) */
  get tabanOran() {
    return (2048 - OLCU[this.ad].taban) / 2048;
  }
  /** Başın tepesi (kutu altından, oran) */
  get tepeOran() {
    return (2048 - OLCU[this.ad].tepe) / 2048;
  }

  private yuzKur() {
    const kafa = this.kar.parcaG('kafa');
    if (!kafa || this.ad !== 'can') return;
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'sl-asik');
    g.innerHTML = CAN_UZGUN_KAS + CAN_ASIK_AGIZ;
    g.style.opacity = '0';
    kafa.append(g);
    this.asik = g;
  }

  // ---------------------------------------------------------------- konum
  get x() {
    return Number(this.el.style.getPropertyValue('--x')) || 50;
  }
  get y() {
    return Number(this.el.style.getPropertyValue('--y')) || 0;
  }
  set katman(z: number) {
    this.el.style.zIndex = String(z);
  }
  koy(x: number, y: number) {
    this.el.style.setProperty('--x', String(x));
    this.el.style.setProperty('--y', String(y));
    this.hedefX = x;
    this.hedefY = y;
  }

  /** (x, y) noktasına yürür (dünya %, y alttan); uzun yolda yan görünüşle, adımlar yola göre */
  async git(x: number, y: number, ms = 900, yandan = true) {
    const kok = this.el.parentElement;
    this.hedefX = x;
    this.hedefY = y;
    if (!kok) return this.koy(x, y);
    const W = kok.clientWidth;
    const H = kok.clientHeight;
    const dx = ((x - this.x) / 100) * W;
    const dy = (-(y - this.y) / 100) * H;
    const genis = this.el.offsetWidth || 1;
    const yanla = yandan && !!this.yan && Math.abs(dx) > genis * 0.25;
    if (yanla && this.yan) {
      this.yan.yon = dx < 0 ? -1 : 1;
      this.el.classList.add('sl-yandan');
      const geo = this.yan.geo;
      const yolCizim = (Math.abs(dx) / Math.max(1, (this.yanKap?.offsetWidth ?? genis))) * 2048;
      const dongu = yolCizim / (geo?.donguYolu ?? 900);
      this.yan.yuru(Math.min(3, Math.max(1, dongu / Math.max(0.2, sure(ms) / 1000))));
    } else void this.kar.oynat('yuru', ms);
    const a = this.yol.animate([{ transform: 'translate(0, 0)' }, { transform: `translate(${dx}px, ${dy}px)` }], {
      duration: sure(ms),
      easing: yanla ? 'linear' : 'cubic-bezier(0.45, 0, 0.3, 1)',
      fill: 'forwards',
    });
    await a.finished.catch(() => undefined);
    this.koy(x, y);
    a.cancel();
    if (yanla) {
      this.yan?.dur();
      await new Promise((r) => setTimeout(r, sure(160)));
      this.el.classList.remove('sl-yandan');
    }
  }

  /** Yerinde zıplama (esneyip basılır) */
  zipla(yukseklik = 16, ms = 600) {
    const y = AZ_HAREKET ? yukseklik * 0.4 : yukseklik;
    this.sevinBas = this.t;
    return this.gov
      .animate(
        [
          { transform: 'translateY(0) scale(1, 1)' },
          { transform: 'translateY(0) scale(1.1, 0.88)', offset: 0.18 },
          { transform: `translateY(-${y * 0.85}%) scale(0.94, 1.08)`, offset: 0.4 },
          { transform: `translateY(-${y}%) scale(1, 1)`, offset: 0.52 },
          { transform: 'translateY(0) scale(1.12, 0.88)', offset: 0.8 },
          { transform: 'translateY(0) scale(1, 1)' },
        ],
        { duration: sure(ms), easing: 'cubic-bezier(0.45, 0, 0.3, 1)' },
      )
      .finished.catch(() => undefined);
  }

  // ---------------------------------------------------------------- duruş
  /** Oturuyor (bank, salıncak): bacaklar sallanır */
  otur(acik: boolean) {
    this.oturuyor = acik;
    this.el.classList.toggle('sl-oturuyor', acik);
  }
  /** Salıncakta: kollar yukarı, zincirleri tutar */
  zincir(acik: boolean) {
    this.zincirTut = acik;
  }
  /** Surat asıklığı (0..1); yarının üstünde asık ağız ve kalkık kaşlar görünür */
  uzgun(o: number) {
    this.uzgunluk = Math.max(0, Math.min(1, o));
  }
  ifade(ad: 'mutlu' | 'saskin' | 'dilek' | null, ms = 0) {
    this.kar.ifade(ad, ms);
  }
  /** Parmakla sayar: sağ kol kalkar, iner */
  say() {
    this.sayBas = this.t;
  }
  /** El sallar (ms) */
  selam(ms = 1400) {
    this.selamBas = this.t;
    this.selamSure = ms / 1000;
  }
  /** Sevinç: kollar havada, zıplar, gülüyor */
  sevin(ms = 1200) {
    this.kar.ifade('mutlu', ms);
    void this.kar.oynat('sevin', ms);
    this.sevinBas = this.t;
  }

  /** Konuşma balonu (seslendirilmez) */
  async balon(yazi: string, ms = 1300) {
    this.balonEl.textContent = yazi;
    this.balonEl.classList.remove('acik');
    void this.balonEl.offsetWidth;
    this.balonEl.classList.add('acik');
    await new Promise((r) => setTimeout(r, sure(ms)));
    this.balonEl.classList.remove('acik');
  }

  private poz(p: Poz, t: number) {
    this.t = t;
    // asık yüz yumuşak gelir
    this.uzgunSimdi += (this.uzgunluk - this.uzgunSimdi) * (TEST_MODU ? 1 : 0.08);
    const u = this.uzgunSimdi;
    const asikGorunsun = u > 0.5 && !this.kar.ifadeSu;
    if (this.asik) this.asik.style.opacity = asikGorunsun ? '1' : '0';
    this.kar.gizle('agiz', asikGorunsun);
    this.kar.gizle('kas', asikGorunsun);
    if (u > 0.01) {
      p.kafaY += 2.2 * u;
      p.kafa += 3 * u;
      p.kolSol -= 8 * u;
      p.kolSag -= 8 * u;
    }
    if (this.oturuyor) {
      // bacaklar önden sarkar, sırayla sallanır (asıkken ağır, neşeliyken canlı)
      const hiz = 3 + 3 * (1 - u);
      p.bacakSol += 9 * S(t * hiz);
      p.bacakSag += 9 * S(t * hiz + 2.1);
    }
    if (this.zincirTut) {
      p.kolSol += 58;
      p.kolSag += 58;
    }
    // parmakla sayma: sağ kol hızla kalkar, iner
    const ds = t - this.sayBas;
    if (ds >= 0 && ds < 0.7) {
      const z = S((ds / 0.7) * Math.PI);
      p.kolSag += 95 * z;
      p.kafa -= 3 * z;
    }
    // el sallama
    const dl = t - this.selamBas;
    if (dl >= 0 && dl < this.selamSure) {
      const z = Math.min(1, dl / 0.2, (this.selamSure - dl) / 0.25);
      p.kolSag += (100 + 18 * S(dl * 14)) * z;
    }
    // sevinç: iki kol havada
    const dv = t - this.sevinBas;
    if (dv >= 0 && dv < 1.1) {
      const z = Math.min(1, dv / 0.15, (1.1 - dv) / 0.3);
      p.kolSol += 100 * z;
      p.kolSag += 100 * z;
    }
  }

  kapat() {
    this.kar.kapat();
    this.yan?.kapat();
  }
}

// ---------------------------------------------------------------- anne
/** Anne çiziminin b ölçeği: ayakta çizim (1143 px) ~52 b boyunda */
export const ANNE_B = 52 / 1143;
export type AnneHal = 'ayakta' | 'oturuyor';

export class Anne {
  readonly el: HTMLElement;
  readonly gov: HTMLElement;
  private img: HTMLImageElement;
  private balonEl: HTMLElement;
  /** kucaktaki / eldeki Ege'nin yuvası */
  readonly kucak: HTMLElement;
  hal: AnneHal = 'ayakta';

  constructor() {
    this.img = h('img.sl-anne-resim', { src: egeAdres('anne'), alt: 'Anne', draggable: 'false' }) as HTMLImageElement;
    this.kucak = h('div.sl-anne-kucak');
    this.gov = h('div.sl-anne-gov', {}, this.img, this.kucak);
    this.balonEl = h('div.mc-oy-balon.sl-kisi-balon');
    this.el = h('div.sl-anne', { 'data-el': 'anne' }, h('i.sl-golge'), this.gov, this.balonEl);
    this.poz('ayakta');
  }

  /** Genişlik (b) */
  get genislik() {
    return ANNE_TUVAL[this.hal === 'ayakta' ? 'ayakta' : 'sariliyor'][0] * ANNE_B;
  }
  get boy() {
    return ANNE_TUVAL[this.hal === 'ayakta' ? 'ayakta' : 'sariliyor'][1] * ANNE_B;
  }

  poz(hal: AnneHal) {
    this.hal = hal;
    this.el.dataset.hal = hal;
    const ad = hal === 'ayakta' ? 'anne' : 'anne-sariliyor';
    this.img.src = egeAdres(ad) || egeAdres('anne');
    this.el.style.setProperty('--w', this.genislik.toFixed(2));
  }

  get x() {
    return Number(this.el.style.getPropertyValue('--x')) || 50;
  }
  get y() {
    return Number(this.el.style.getPropertyValue('--y')) || 0;
  }
  set katman(z: number) {
    this.el.style.zIndex = String(z);
  }

  /** Yürür: hafif iniş-kalkış ve yalpalama (tek çizim; adım adım) */
  async git(x: number, y: number, ms = 1200) {
    const kok = this.el.parentElement;
    if (!kok) return;
    const dx = ((x - this.x) / 100) * kok.clientWidth;
    const dy = (-(y - this.y) / 100) * kok.clientHeight;
    const adim = Math.max(2, Math.round(sure(ms) / 260));
    const kf: Keyframe[] = [];
    for (let i = 0; i <= adim * 2; i++) {
      const u = i / (adim * 2);
      kf.push({ translate: `${(dx * u).toFixed(1)}px ${(dy * u - (i % 2 ? 5 : 0)).toFixed(1)}px`, rotate: `${i % 2 ? 0 : i % 4 ? 1.5 : -1.5}deg` });
    }
    const a = this.el.animate(kf, { duration: sure(ms), easing: 'linear', fill: 'forwards' });
    await a.finished.catch(() => undefined);
    this.el.style.setProperty('--x', String(x));
    this.el.style.setProperty('--y', String(y));
    a.cancel();
  }

  /** "Yavaş" işareti: eğilip başını sallar */
  yavasIsaret() {
    return this.gov
      .animate([{ rotate: '0deg' }, { rotate: '-4deg' }, { rotate: '3deg' }, { rotate: '-2deg' }, { rotate: '0deg' }], { duration: sure(900), easing: 'ease-in-out' })
      .finished.catch(() => undefined);
  }
  /** Gülümseyip hafifçe sallanır */
  sevin() {
    return this.gov
      .animate([{ scale: '1 1' }, { scale: '1.03 0.97' }, { scale: '0.98 1.02' }, { scale: '1 1' }], { duration: sure(600), easing: 'ease-out' })
      .finished.catch(() => undefined);
  }

  async balon(yazi: string, ms = 1300) {
    this.balonEl.textContent = yazi;
    this.balonEl.classList.remove('acik');
    void this.balonEl.offsetWidth;
    this.balonEl.classList.add('acik');
    await new Promise((r) => setTimeout(r, sure(ms)));
    this.balonEl.classList.remove('acik');
  }
}
