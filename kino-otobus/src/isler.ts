/**
 * Kino'nun Otobüsü: yan işler (isteğe bağlı, 10-20 sn, hiçbir şeyi beklemez; süre, ceza, hata yok).
 *
 * 1. Temizlik: yoğun bir andan sonra tezgâha dondurma damlar. Lekeye dokununca parmağın altında sünger belirir;
 *    ovdukça leke solar, köpük çıkar, gıcırdar. Hepsi silinince tezgâh pırıl pırıl parlar, Kino sevinir.
 *    5-6 yaşta bir sinek de gelir (dokununca vızzz diye kaçar). Dokunuş da siler (iki dokunuş bir leke).
 * 2. Külah yapımı (sabah hazırlığı ve külah azalınca): kumbaranın üstündeki külah makinesi parlar. Dokununca tezgâh
 *    açılır: (5-6: hamuru dök) → kapağı bas (cızz, buhar) → altın gofreti yuvarla → üç taze külah rafa uçar.
 *    Her adım dokunuşla da olur; çarpı ya da dışarıya dokunmak işi bırakır (hiçbir şey kaybolmaz).
 */
import K from '../../content/kino-otobus.json';
import { efekt as ortakEfekt } from '../../src/audio/ses';
import type { Karakter } from '../../src/karakter/karakter';
import { h, sure, svg, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { elSurukle, icinde, Tutulan } from './dokunsal';
import { AZ_HAREKET, Efekt, salla } from './efekt';
import { HAMUR_DOLU_MS, kulahAdimlari, lekelerUret, sil, temizlikAyari, YUVARLA_YOL, type KulahAdimi, type Leke } from './el-isi';
import type { Yas } from './model';
import { dondurmaciKino } from './otobus';
import { ses } from './sesler';
import { gorsel, type VarlikAdi } from './varliklar';

const sakin = () => TEST_MODU || AZ_HAREKET;
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, sakin() ? Math.min(ms, 60) : sure(ms)));

export interface IsOrtami {
  efekt: Efekt;
  yas: Yas;
  /** tasarım birimi (px) */
  u: () => number;
  kapandi: () => boolean;
  /** sahnedeki Kino'nun küçük sevinci (kulak, hop) */
  kinoSevin: () => void;
  /** seyrek konuşma (sıradaysa söylenmez) */
  soyle: (soz: string, kim: 'mino' | 'kino') => void;
  kirazSapka: boolean;
}

// ================================================================ 1. temizlik
interface LekeEl {
  l: Leke;
  el: HTMLElement;
}

export class Temizlik {
  /** lekelerin katmanı: tezgâh çizgisinde (alt katın tepesi), kamerayla birlikte yakınlaşır */
  readonly el = h('div.ko-lekeler');
  private lekeler: LekeEl[] = [];
  private sinek: HTMLElement | null = null;
  private zaman: number[] = [];
  constructor(private o: IsOrtami) {}

  get sayi() {
    return this.lekeler.length;
  }

  /** Lekeler tezgâha damlar (xler: alt katın eninin yüzdesi) */
  dus(xler: number[]) {
    const yeni = lekelerUret(this.o.yas, Math.floor(Math.random() * 3));
    yeni.forEach((l, i) => {
      const x = xler[i % xler.length];
      const gorselEl = h('span.ko-leke-g', { html: gorsel(`leke-${l.tat}` as VarlikAdi) });
      const el = h('div.ko-leke', { 'data-leke': String(l.id), role: 'button', 'aria-label': 'leke', style: `left:${x.toFixed(2)}%;--kir:1;--i:${i}` }, gorselEl);
      this.el.append(el);
      const le = { l, el };
      this.lekeler.push(le);
      this.ovma(le);
      if (!sakin()) {
        this.zaman.push(window.setTimeout(() => ses.damla(i), 260 + i * 140));
        gorselEl.animate(
          [
            { transform: 'translateY(-260%) scale(.35, .6)', opacity: 0 },
            { transform: 'translateY(-20%) scale(.6, 1.1)', opacity: 1, offset: 0.55 },
            { transform: 'translateY(0) scale(1.25, .7)', offset: 0.75 },
            { transform: 'none' },
          ],
          { duration: 520, delay: i * 140, easing: 'cubic-bezier(.5,0,.6,1)', fill: 'backwards' },
        );
      }
    });
    this.el.dataset.sayi = String(this.lekeler.length);
    if (temizlikAyari(this.o.yas).sinek) this.zaman.push(window.setTimeout(() => this.sinekGel(), sakin() ? 30 : 1400));
  }

  /** Lekeye basınca sünger: ovdukça siler (bütün lekelerin üstünden geçer), dokunuş da siler */
  private ovma(le: LekeEl) {
    let sunger: Tutulan | null = null;
    let yol = 0;
    let kopukYol = 0;
    let sesYol = 0;
    let kimlik: number | null = null;
    let kimildadi = false;
    const u = () => this.o.u();
    // leke silinip DOM'dan kalkınca da sünger parmağı izlesin diye hareket ve bırakma pencereden dinlenir
    const dinle = (ac: boolean) => {
      if (ac) {
        window.addEventListener('pointermove', kaydir);
        window.addEventListener('pointerup', birak);
        window.addEventListener('pointercancel', birak);
      } else {
        window.removeEventListener('pointermove', kaydir);
        window.removeEventListener('pointerup', birak);
        window.removeEventListener('pointercancel', birak);
      }
    };
    le.el.addEventListener('pointerdown', (e) => {
      if (kimlik !== null) return;
      e.preventDefault();
      kimlik = e.pointerId;
      kimildadi = false;
      yol = 0;
      const en = 64 * u();
      sunger = new Tutulan(this.o.efekt, gorsel('sunger'), { sinif: 'ko-sunger', en, boy: en * (100 / 140), tx: 0.5, ty: 0.6 });
      sunger.yer(e.clientX, e.clientY);
      ses.gicir();
      dinle(true);
      this.birakicilar.add(dinleKapat);
    });
    const dinleKapat = () => {
      dinle(false);
      sunger?.kaldir();
      sunger = null;
      kimlik = null;
    };
    const kaydir = (e: PointerEvent) => {
      if (e.pointerId !== kimlik || !sunger) return;
      const k = sunger.nokta(0.5, 0.6);
      const kutu = this.o.efekt.kutu();
      const dx = e.clientX - (k[0] + kutu.left);
      const dy = e.clientY - (k[1] + kutu.top);
      const d = Math.hypot(dx, dy) / u();
      if (d < 0.5) return;
      kimildadi = kimildadi || d > 4;
      sunger.yer(e.clientX, e.clientY, dx);
      sunger.buyut(1 + Math.sin(yol / 6) * 0.06);
      yol += d;
      kopukYol += d;
      sesYol += d;
      for (const x of [...this.lekeler]) if (icinde(x.el.getBoundingClientRect(), e.clientX, e.clientY, 8 * u())) this.sil(x, d);
      if (kopukYol > 18) {
        kopukYol = 0;
        this.o.efekt.kopuk(e.clientX - kutu.left, e.clientY - kutu.top, u());
      }
      if (sesYol > 70) {
        sesYol = 0;
        ses.gicir();
      }
    };
    const birak = (e: PointerEvent) => {
      if (e.pointerId !== kimlik) return;
      kimlik = null;
      dinle(false);
      this.birakicilar.delete(dinleKapat);
      // dokunuş: o lekeyi yarıya kadar siler, sünger bir kez sürtünür
      if (!kimildadi && this.lekeler.includes(le)) {
        this.sil(le, null);
        if (sunger && !sakin()) sunger.ic.animate([{ transform: 'translateX(-14%) rotate(-8deg)' }, { transform: 'translateX(14%) rotate(8deg)' }, { transform: 'none' }], { duration: 260 });
        const r = le.el.getBoundingClientRect();
        const k = this.o.efekt.kutu();
        this.o.efekt.kopuk(r.left - k.left + r.width / 2, r.top - k.top + r.height / 2, u());
      }
      const s = sunger;
      sunger = null;
      if (s) window.setTimeout(() => void s.don_(null), sakin() ? 0 : 280);
    };
  }
  /** süren ovmalar (ekran kapanınca pencere dinleyicileri kalkar) */
  private birakicilar = new Set<() => void>();

  private sil(le: LekeEl, yolU: number | null) {
    const kalan = sil(le.l, yolU);
    le.el.style.setProperty('--kir', kalan.toFixed(3));
    if (kalan > 0) return;
    // leke kalktı: pıt, parıltı
    this.lekeler = this.lekeler.filter((x) => x !== le);
    this.el.dataset.sayi = String(this.lekeler.length);
    const r = le.el.getBoundingClientRect();
    const k = this.o.efekt.kutu();
    const [x, y] = [r.left - k.left + r.width / 2, r.top - k.top + r.height / 2];
    ses.pit(this.lekeler.length);
    this.o.efekt.parilti(x, y, 5, 0.6);
    le.el.classList.add('ko-silindi');
    window.setTimeout(() => le.el.remove(), sakin() ? 0 : 320);
    if (!this.lekeler.length) this.parla();
  }

  /** Hepsi silindi: tezgâh boyunca parıltı geçer, Kino sevinir */
  private parla() {
    ses.piril();
    ortakEfekt.dogru();
    this.o.kinoSevin();
    this.o.soyle(K.kino.piril, 'kino');
    const parilti = h('i.ko-tezgah-parla', { 'aria-hidden': 'true' });
    this.el.append(parilti);
    window.setTimeout(() => parilti.remove(), sakin() ? 0 : 1200);
    const r = this.el.getBoundingClientRect();
    const k = this.o.efekt.kutu();
    for (let i = 0; i < 4; i++) this.o.efekt.parilti(r.left - k.left + (r.width * (i + 0.5)) / 4, r.top - k.top, 3, 0.5, '#FFF4A8');
    if (this.sinek) this.kov(false);
  }

  /** 5-6: sinek pencereden gelir, bir lekenin üstünde vızıldar */
  private sinekGel() {
    if (this.o.kapandi() || this.sinek || !this.lekeler.length) return;
    const hedef = this.lekeler[this.lekeler.length - 1].el;
    const s = h('div.ko-sinek', { role: 'button', 'aria-label': 'sinek', style: hedef.style.cssText.match(/left:[^;]+/)?.[0] ?? '', html: `<span class="ko-sinek-ic">${gorsel('sinek')}</span>` });
    this.sinek = s;
    this.el.append(s);
    s.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.kov(true);
    });
    if (!sakin()) {
      ses.vizz();
      const u = this.o.u();
      s.animate(
        [
          { transform: `translate(${-120 * u}px, ${-170 * u}px)` },
          { transform: `translate(${40 * u}px, ${-110 * u}px)`, offset: 0.35 },
          { transform: `translate(${-30 * u}px, ${-60 * u}px)`, offset: 0.7 },
          { transform: 'none' },
        ],
        { duration: 1100, easing: 'ease-in-out' },
      );
    }
    s.classList.add('ko-vizil');
  }

  /** Sinek kaçar (dokunuldu: Kino havlar) */
  private kov(dokunuldu: boolean) {
    const s = this.sinek;
    if (!s) return;
    this.sinek = null;
    ses.vizz();
    if (dokunuldu) {
      this.o.kinoSevin();
      this.o.soyle(K.kino.hav, 'kino');
      const r = s.getBoundingClientRect();
      const k = this.o.efekt.kutu();
      this.o.efekt.pof(r.left - k.left + r.width / 2, r.top - k.top + r.height / 2, 0.6);
    }
    s.classList.remove('ko-vizil');
    if (sakin()) return s.remove();
    const u = this.o.u();
    const yon = Math.random() < 0.5 ? -1 : 1;
    s.animate(
      [{ transform: 'none' }, { transform: `translate(${yon * 60 * u}px, ${-80 * u}px) rotate(${yon * 20}deg)`, offset: 0.4 }, { transform: `translate(${yon * 260 * u}px, ${-260 * u}px) rotate(${yon * 40}deg)`, opacity: 0 }],
      { duration: 800, easing: 'ease-in', fill: 'forwards' },
    ).finished.then(
      () => s.remove(),
      () => s.remove(),
    );
  }

  kapat() {
    this.zaman.forEach(clearTimeout);
    this.birakicilar.forEach((f) => f());
  }
}

// ================================================================ 2. külah yapımı
/** Külah butonunda iç içe külahlar (rafta kaç külah: 1-4) */
export function kulahYigini(stok: number): string {
  const n = Math.max(1, Math.min(4, stok));
  return `<span class="ko-kulah-yigin" data-stok="${n}">${Array.from({ length: n }, (_, i) => `<span class="ko-kulah-yigin-k" style="--i:${i};--n:${n}">${gorsel('kulah')}</span>`).join('')}</span>`;
}

/** Kumbaranın üstündeki küçük külah makinesi (iş köşesi): külah azalınca parlar, buhar çıkarır */
export function isKosesi(ac: () => void): { el: HTMLButtonElement; isVar: (var_: boolean) => void } {
  const el = h('button.ko-is-kosesi', { type: 'button', 'aria-label': 'Külah yap' }, h('span.ko-is-kosesi-g', { html: gorsel('kulah-makinesi') }), h('span.ko-is-kosesi-k', { html: gorsel('kulah-makinesi-kapak') }), h('i.ko-is-kosesi-raf', { 'aria-hidden': 'true' })) as HTMLButtonElement;
  el.addEventListener('click', () => {
    ortakEfekt.dokunma();
    salla(el, 'ko-bas');
    ac();
  });
  return {
    el,
    isVar: (var_) => {
      el.classList.toggle('ko-is-var', var_);
    },
  };
}

/**
 * Külah yapma tezgâhı (açılır pencere). bitti: üç külahın ekran yerleri (efekt katmanına göre); kapat: işi bıraktı.
 */
export class KulahPaneli {
  readonly el: HTMLElement;
  private kino: Karakter;
  private adimlar: KulahAdimi[];
  private adim = 0;
  private hamur = 0;
  private kapandi = false;
  private kaldir: (() => void)[] = [];
  private kart: HTMLElement;
  private makine: HTMLElement;
  private kapak: HTMLElement;
  private plaka: HTMLElement;
  private hamurEl: HTMLElement;
  private disk: HTMLElement;
  private surahi: HTMLElement | null = null;
  private kalip: HTMLElement;
  private kulahlar: HTMLElement;
  private mesgul = false;
  /** panelin kendi efekt katmanı (sahnenin efektleri panelin altında kalır) */
  private ef: Efekt;
  constructor(
    private o: IsOrtami,
    private bitti: (kulahlar: [number, number][]) => void,
    private birakti: () => void,
  ) {
    this.adimlar = kulahAdimlari(o.yas);
    this.kino = dondurmaciKino(o.kirazSapka);
    this.hamurEl = h('i.ko-is-hamur', { 'aria-hidden': 'true' });
    this.disk = h('div.ko-is-disk', { html: gorsel('kulah-hamuru') });
    this.plaka = h('div.ko-is-plaka', {}, this.hamurEl, this.disk);
    this.kapak = h('div.ko-is-kapak', { html: gorsel('kulah-makinesi-kapak') });
    this.makine = h('div.ko-is-makine', { role: 'button', 'aria-label': 'Külah makinesi' }, h('div.ko-is-makine-g', { html: gorsel('kulah-makinesi') }), this.plaka, this.kapak);
    this.kalip = h('div.ko-is-kalip', { html: gorsel('kulah') });
    this.kulahlar = h('div.ko-is-kulahlar');
    if (this.adimlar[0] === 'hamur') this.surahi = h('div.ko-is-surahi', { role: 'button', 'aria-label': 'Hamur', html: gorsel('hamur-surahi') });
    const kapatDugme = h('button.ko-is-kapat', { type: 'button', 'aria-label': 'Kapat' }, svg(IKON.kapat));
    kapatDugme.addEventListener('click', () => this.kapat(true));
    this.kart = h(
      'div.ko-is-kart',
      {},
      h('div.ko-is-duvar', { 'aria-hidden': 'true' }),
      h('div.ko-is-kino', {}, this.kino.el),
      h('div.ko-is-tezgah', { 'aria-hidden': 'true' }),
      this.makine,
      this.kalip,
      this.kulahlar,
      this.surahi,
      kapatDugme,
    );
    this.el = h('div.ko-is-panel', { 'data-yas': o.yas }, this.kart);
    this.ef = new Efekt(this.el);
    this.el.append(this.ef.el);
    // dışarıya dokunmak işi bırakır
    this.el.addEventListener('pointerdown', (e) => {
      if (e.target === this.el) this.kapat(true);
    });
    this.baglaMakine();
    this.baglaDisk();
    if (this.surahi) this.baglaSurahi(this.surahi);
    // 3-4: hamur hazır (Kino dökmüş)
    if (this.adimlar[0] !== 'hamur') this.hamurAyarla(1);
    this.adimGoster();
    if (!sakin()) {
      this.kart.animate([{ transform: 'scale(.6)', opacity: 0 }, { transform: 'scale(1.04)', opacity: 1, offset: 0.7 }, { transform: 'none' }], { duration: 320, easing: 'ease-out' });
      void this.kino.oynat('var', 700);
    }
    ses.vuup();
  }

  private get suanki(): KulahAdimi | 'bitti' {
    return this.adimlar[this.adim] ?? 'bitti';
  }
  private adimGoster() {
    this.el.dataset.adim = this.suanki;
    for (const e of [this.makine, this.disk, this.surahi]) e?.classList.remove('ko-sirada');
    const parlayan = this.suanki === 'hamur' ? this.surahi : this.suanki === 'bas' ? this.makine : this.suanki === 'yuvarla' ? this.disk : null;
    parlayan?.classList.add('ko-sirada');
  }
  private ilerle() {
    this.adim++;
    this.adimGoster();
    if (!sakin()) void this.kino.oynat('sevin', 600);
    if (this.suanki === 'bitti') void this.son();
  }
  private hamurAyarla(d: number) {
    this.hamur = d;
    this.hamurEl.style.setProperty('--d', d.toFixed(3));
  }
  private ekranYeri(e: Element, ox = 0.5, oy = 0.5): [number, number] {
    return this.ef.merkez(e, ox, oy);
  }

  // ---- hamur (5-6): sürahi makinenin üstüne sürüklenir, tutuldukça hamur yayılır; dokunuş da döker
  private baglaSurahi(s: HTMLElement) {
    let tut: Tutulan | null = null;
    let son = 0;
    let raf = 0;
    let ustunde = false;
    const dongu = (t: number) => {
      if (!tut) return;
      const ms = son ? t - son : 0;
      son = t;
      if (ustunde && this.hamur < 1) {
        this.hamurAyarla(Math.min(1, this.hamur + ms / HAMUR_DOLU_MS));
        if (this.hamur >= 1) {
          ses.pop();
          this.akis(false);
        }
      }
      raf = requestAnimationFrame(dongu);
    };
    this.kaldir.push(
      elSurukle(s, {
        aktif: () => this.suanki === 'hamur' && !this.mesgul,
        basla: (x, y) => {
          const r = s.getBoundingClientRect();
          tut = new Tutulan(this.ef, gorsel('hamur-surahi'), { sinif: 'ko-tut-surahi', en: r.width, boy: r.height, tx: 0.5, ty: 0.55 });
          tut.yer(x, y);
          s.classList.add('ko-tasiniyor');
          son = 0;
          raf = requestAnimationFrame(dongu);
        },
        tasi: (x, y, dx) => {
          if (!tut) return;
          tut.yer(x, y, dx);
          ustunde = icinde(this.makine.getBoundingClientRect(), x, y, 20 * this.o.u());
          tut.dondur(ustunde ? -75 : 0);
          this.akis(ustunde && this.hamur < 1, tut);
        },
        birak: () => {
          cancelAnimationFrame(raf);
          this.akis(false);
          const t = tut;
          tut = null;
          ustunde = false;
          s.classList.remove('ko-tasiniyor');
          if (t) void t.don_(null, 0);
          // biraz döktüyse kalanı kendiliğinden yayılır
          if (this.hamur > 0.15) void this.hamurTamamla();
        },
      }),
    );
    s.addEventListener('click', () => {
      if (this.suanki !== 'hamur' || this.mesgul) return;
      void this.hamurOtomatik();
    });
  }
  /** sürahinin ağzından plakaya hamur şeridi */
  private akisEl: HTMLElement | null = null;
  private akis(acik: boolean, tut?: Tutulan) {
    if (!acik || !tut || sakin()) {
      this.akisEl?.remove();
      this.akisEl = null;
      return;
    }
    const [ax, ay] = tut.nokta(0.08, 0.2);
    const [px, py] = this.ekranYeri(this.plaka, 0.5, 0.5);
    if (!this.akisEl) {
      this.akisEl = h('i.ko-hamur-akis');
      this.ef.el.append(this.akisEl);
    }
    const boy = Math.max(4, py - ay);
    this.akisEl.style.cssText = `left:${((ax + px) / 2).toFixed(1)}px;top:${ay.toFixed(1)}px;height:${boy.toFixed(1)}px`;
  }
  private async hamurOtomatik() {
    if (!this.surahi) return;
    this.mesgul = true;
    ses.slurp();
    if (!sakin()) {
      const r = this.surahi.getBoundingClientRect();
      const m = this.makine.getBoundingClientRect();
      const dx = m.left + m.width * 0.62 - (r.left + r.width / 2);
      const dy = m.top - r.height * 0.15 - (r.top + r.height / 2);
      await this.surahi.animate(
        [{ transform: 'none' }, { transform: `translate(${dx}px, ${dy}px) rotate(-75deg)`, offset: 0.35 }, { transform: `translate(${dx}px, ${dy}px) rotate(-80deg)`, offset: 0.75 }, { transform: 'none' }],
        { duration: sure(1100), easing: 'ease-in-out' },
      ).ready;
    }
    for (let i = 1; i <= 8; i++) {
      await bekle(70);
      if (this.kapandi) return;
      this.hamurAyarla(i / 8);
    }
    this.mesgul = false;
    await this.hamurTamamla();
  }
  private async hamurTamamla() {
    if (this.suanki !== 'hamur') return;
    this.mesgul = true;
    for (let d = this.hamur; d < 1; d += 0.2) {
      this.hamurAyarla(Math.min(1, d));
      await bekle(50);
    }
    this.hamurAyarla(1);
    ses.pop();
    const [x, y] = this.ekranYeri(this.plaka);
    this.ef.parilti(x, y, 4, 0.5, '#FFE29A');
    // sürahi kenara çekilir, kalıp gelir
    this.surahi?.classList.add('ko-gitti');
    this.mesgul = false;
    this.ilerle();
  }

  // ---- kapağı bas: dokun ya da kapağı aşağı sürükle
  private baglaMakine() {
    let inis = 0;
    this.kaldir.push(
      elSurukle(this.kapak, {
        aktif: () => this.suanki === 'bas' && !this.mesgul,
        basla: () => {
          inis = 0;
        },
        tasi: (_x, _y, _dx, dy) => {
          inis = Math.max(0, inis + dy);
          this.kapak.style.setProperty('--in', Math.min(1, inis / (40 * this.o.u())).toFixed(3));
          if (inis > 30 * this.o.u()) void this.bas();
        },
        birak: () => {
          if (this.suanki === 'bas' && !this.mesgul) this.kapak.style.setProperty('--in', '0');
        },
      }),
    );
    this.makine.addEventListener('click', () => {
      if (this.suanki === 'bas' && !this.mesgul) void this.bas();
      else if (this.suanki === 'hamur' && !this.mesgul) void this.hamurOtomatik();
    });
  }
  private async bas() {
    if (this.mesgul || this.suanki !== 'bas') return;
    this.mesgul = true;
    this.makine.classList.add('ko-kapali');
    this.kapak.style.setProperty('--in', '1');
    ses.tak();
    salla(this.makine, 'ko-ezil');
    const [x, y] = this.ekranYeri(this.makine, 0.5, 0.25);
    this.ef.buhar(x, y, 5);
    if (!sakin()) void this.kino.oynat('bak', 700);
    await bekle(750);
    if (this.kapandi) return;
    this.ef.buhar(x, y, 3);
    // pişti: kapak kalkar, hamur altın gofret olmuş
    this.makine.classList.remove('ko-kapali');
    this.kapak.style.setProperty('--in', '0');
    this.makine.classList.add('ko-pisti');
    ses.pop();
    this.ef.parilti(x, y + 20, 6, 0.6, '#FFE45C');
    await bekle(250);
    if (this.kapandi) return;
    this.mesgul = false;
    this.ilerle();
  }

  // ---- yuvarla: gofreti sürükle (ya da dokun), kalıbın üstünde külah olur
  private baglaDisk() {
    let yol = 0;
    let tut: Tutulan | null = null;
    this.kaldir.push(
      elSurukle(this.disk, {
        aktif: () => this.suanki === 'yuvarla' && !this.mesgul,
        basla: (x, y) => {
          yol = 0;
          const r = this.disk.getBoundingClientRect();
          tut = new Tutulan(this.ef, gorsel('kulah-hamuru'), { sinif: 'ko-tut-disk', en: r.width, boy: r.height });
          tut.yer(x, y);
          this.disk.classList.add('ko-tasiniyor');
        },
        tasi: (x, y, dx, dy) => {
          if (!tut) return;
          yol += Math.hypot(dx, dy) / this.o.u();
          tut.yer(x, y, dx);
          tut.dondur(yol * 3);
          // yuvarlandıkça incelir (rulo)
          tut.buyut(1 - Math.min(0.35, yol / YUVARLA_YOL / 3));
          if (yol >= YUVARLA_YOL) {
            const t = tut;
            tut = null;
            t.kaldir();
            void this.yuvarla(true);
          }
        },
        birak: () => {
          const t = tut;
          tut = null;
          this.disk.classList.remove('ko-tasiniyor');
          if (!t) return;
          t.kaldir();
          // azıcık da yuvarladıysa rulo tamamlanır
          if (yol > 12) void this.yuvarla(true);
        },
      }),
    );
    this.disk.addEventListener('click', () => {
      if (this.suanki === 'yuvarla' && !this.mesgul) void this.yuvarla(false);
    });
  }
  private async yuvarla(suruklendi: boolean) {
    if (this.mesgul || this.suanki !== 'yuvarla') return;
    this.mesgul = true;
    ses.firr();
    this.disk.classList.remove('ko-tasiniyor');
    if (!sakin()) {
      const d = this.disk.getBoundingClientRect();
      const k = this.kalip.getBoundingClientRect();
      const dx = k.left + k.width / 2 - (d.left + d.width / 2);
      const dy = k.top + k.height * 0.4 - (d.top + d.height / 2);
      await this.disk
        .animate(
          suruklendi
            ? [{ transform: `translate(${dx}px, ${dy}px) scale(.7, .7)`, opacity: 1 }, { transform: `translate(${dx}px, ${dy}px) scale(.12, .7) rotate(20deg)`, opacity: 0 }]
            : [{ transform: 'none' }, { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 30}px) rotate(200deg) scale(.8, .8)`, offset: 0.5 }, { transform: `translate(${dx}px, ${dy}px) rotate(360deg) scale(.12, .7)`, opacity: 0 }],
          { duration: sure(suruklendi ? 260 : 600), easing: 'ease-in', fill: 'forwards' },
        )
        .finished.catch(() => undefined);
    }
    if (this.kapandi) return;
    this.disk.classList.add('ko-gitti');
    this.kalip.classList.add('ko-oldu');
    salla(this.kalip, 'ko-zipla');
    ses.pop();
    const [x, y] = this.ekranYeri(this.kalip);
    this.ef.parilti(x, y, 8, 0.7, '#FFE45C');
    this.mesgul = false;
    this.ilerle();
  }

  // ---- son: üç taze külah rafta, sonra tezgâhtaki yığına uçar
  private async son() {
    for (let i = 0; i < 3; i++) {
      if (this.kapandi) return;
      const k = h('span.ko-is-yeni', { style: `--i:${i}`, html: gorsel('kulah') });
      this.kulahlar.append(k);
      ses.pit(i);
      salla(k, 'ko-pit');
      await bekle(170);
    }
    this.o.kinoSevin();
    this.o.soyle(K.kino.taze, 'kino');
    if (!sakin()) void this.kino.oynat('dans', 900);
    await bekle(650);
    if (this.kapandi) return;
    const yerler = [...this.kulahlar.children].map((c) => this.o.efekt.merkez(c));
    this.kapat(false);
    this.bitti(yerler);
  }

  kapat(birakti = false) {
    if (this.kapandi) return;
    this.kapandi = true;
    this.kaldir.forEach((f) => f());
    this.akis(false);
    this.kino.kapat();
    if (birakti) {
      ses.vuup(true);
      this.birakti();
    }
    if (sakin()) return this.el.remove();
    this.el.classList.add('ko-kapaniyor');
    window.setTimeout(() => this.el.remove(), 220);
  }
}
