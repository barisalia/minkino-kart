/**
 * Kino'nun Otobüsü müşterisi: pencerede belden yukarı görünür (bel tezgâh çizgisinde, herkes ortak taban çizgisinde),
 * yanında resimli istek balonu (yazı yok). Hazır iskeletler (src/karakter) ve Mino (src/mino). Paylaşmada iki kardeş
 * yan yana. Boylar tek tablodan (src/karakter/boy.ts), pencereye sığsın diye yumuşatılarak.
 *
 * Ölçüler CSS'te --pen-h (müşteri katının yüksekliği) cinsinden: ölçüm yok, ekran dönünce kendiliğinden uyar.
 */
import { BOY, boyTipi, CIZIM } from '../../src/karakter/boy';
import { Karakter } from '../../src/karakter/karakter';
import { Mino } from '../../src/mino/mino';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { ARTI, GUNES, OK, TER } from './cizim';
import { AZ_HAREKET } from './efekt';
import { kuleCiz, kuleOlcu, type KuleVeri } from './kule';
import { type Fark, type Istenen, type Siparis } from './model';
import { gorsel, topAdi } from './varliklar';

/** bir fazla balonunda kimin dondurması olduğu: hayvanın kart resmi (assets/hayvanlar) */
const YUZLER = import.meta.glob<string>('../../assets/hayvanlar/{tavsan,ayi,ordek,kus,maymun,inek,kopek}.webp', { eager: true, query: '?url', import: 'default' });

const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, AZ_HAREKET ? Math.min(ms, 200) : sure(ms)));

/** Pencerede görünen boy (müşteri katının oranı): çocuk 0.9, küçükler yumuşatılmış (kuş bile seçilsin) */
export function gorunenOran(ad: string): number {
  const tip = ad === 'mino' ? 'mino' : boyTipi(ad);
  const b = tip ? BOY[tip] : 1;
  return Math.max(0.6, Math.min(1.02, 0.9 * Math.sqrt(b / BOY.cocuk)));
}

/**
 * Karakterin kutusu (müşteri katının yüksekliği = 1): kutunun eni ve tabandan aşağı kayması. Görünen kısım figürün
 * üst %57'si (bel tezgâh çizgisinde).
 */
export function kutuOlcu(ad: string, olcek = 1): { en: number; alt: number; oran: string } {
  const c = CIZIM[ad] ?? CIZIM.kino;
  const [kw, kh] = c.kutu;
  const fig = (c.taban - c.tepe) / kh;
  const gorunen = gorunenOran(ad) * olcek;
  const kutuBoy = gorunen / 0.57 / fig;
  const bel = c.tepe / kh + 0.57 * fig;
  return { en: (kutuBoy * kw) / kh, alt: -kutuBoy * (1 - bel), oran: `${kw} / ${kh}` };
}

/** İstenenin balondaki kule verisi (örüntüde gizli top "?") */
export const istenenKule = (d: Istenen, gizli?: number): KuleVeri => ({
  kap: d.kap,
  toplar: d.toplar.map((t, i) => (i === gizli ? '?' : t)),
  sos: d.sos,
  susler: Object.entries(d.susler).flatMap(([s, n]) => Array.from({ length: n ?? 0 }, () => s as KuleVeri['susler'][number])),
});

/** Balondaki kulenin --t'si: balonun iç yüksekliğine (--pen-h × oran) sığar */
function kuleKutu(d: KuleVeri, oran: number): HTMLElement {
  const o = kuleOlcu(d.kap, d.toplar.length, d.susler.length > 0);
  const k = kuleCiz(d, { sinif: 'ko-b-kule' });
  k.style.setProperty('--t', `calc(var(--pen-h) * ${(oran / Math.max(o.boy, 1.6)).toFixed(4)})`);
  return k;
}

/** İstek balonunun resmi */
export function balonResmi(sip: Siparis): HTMLElement {
  const ic = h('div.ko-b-ic', { 'data-tur': sip.tur });
  const kule = (d: Istenen, oran = 0.6, gizli?: number) => h('div.ko-b-parca', {}, kuleKutu(istenenKule(d, gizli), oran));
  if (sip.tur === 'birFazla' && sip.referans) {
    const yuz = YUZLER[`../../assets/hayvanlar/${sip.referans.musteri}.webp`];
    const son = sip.istek[0].toplar.at(-1)!;
    const tek = son === 'serin' ? '' : gorsel(topAdi(son));
    // tavşanın külahı + bir top
    ic.append(
      h('div.ko-b-referans', { 'data-musteri': sip.referans.musteri }, kule(sip.referans.dondurma, 0.5), yuz ? h('img.ko-b-yuz', { src: yuz, alt: '', draggable: 'false' }) : null),
      h('i.ko-b-isaret', { html: ARTI }),
      h('div.ko-b-tek', { style: 'width:calc(var(--pen-h) * .2);height:calc(var(--pen-h) * .15)', html: tek }),
    );
  } else if (sip.tur === 'paylasma' && sip.kupaResmi) {
    // büyük kupa (bütün toplar) → iki kâse
    const hepsi = sip.istek.flatMap((d) => d.toplar);
    ic.append(kule({ kap: 'kupa', toplar: [...hepsi], sos: null, susler: {} }, 0.5), h('i.ko-b-isaret.ko-b-ok', { html: OK }), h('div.ko-b-iki', {}, kule({ ...sip.istek[0], toplar: [] }, 0.2), kule({ ...sip.istek[1], toplar: [] }, 0.2)));
  } else if (sip.istek.length === 2) {
    ic.append(kule(sip.istek[0], 0.42), kule(sip.istek[1], 0.42));
  } else {
    if (sip.tur === 'sicak') ic.append(h('i.ko-b-gunes', { html: GUNES }));
    ic.append(kule(sip.istek[0], 0.62, sip.gizli));
  }
  return ic;
}

/** Müşterinin içindeki tek karakter (iskelet ya da Mino) */
class Kisi {
  readonly el: HTMLElement;
  readonly karakter: Karakter | null = null;
  readonly mino: Mino | null = null;
  constructor(
    readonly ad: string,
    olcek = 1,
  ) {
    const o = kutuOlcu(ad, olcek);
    const stil = `width:calc(var(--pen-h) * ${o.en.toFixed(4)});bottom:calc(var(--pen-h) * ${o.alt.toFixed(4)});aspect-ratio:${o.oran}`;
    if (ad === 'mino') {
      this.mino = new Mino();
      this.el = h('div.ko-kisi.ko-kisi-mino', { style: stil }, this.mino.el);
    } else {
      this.karakter = new Karakter(ad, h('div'));
      this.el = h('div.ko-kisi', { style: stil }, this.karakter.el);
    }
  }
  get hazir(): Promise<void> {
    return this.karakter?.hazir ?? Promise.resolve();
  }
  oynat(ad: 'var' | 'sevin' | 'dans' | 'ye' | 'bak' | 'yuru', ms: number): Promise<void> {
    if (this.karakter) return this.karakter.oynat(ad, ms);
    const t = ({ var: 'selam', sevin: 'sevinc', dans: 'dans', ye: 'ham', bak: 'evet', yuru: 'zipla' } as const)[ad];
    this.mino?.tepki(t);
    return bekle(ms);
  }
  mutlu(ms: number) {
    if (this.karakter?.ifadeVar('mutlu')) this.karakter.ifade('mutlu', ms);
    else if (this.karakter?.ifadeVar('heyecan')) this.karakter.ifade('heyecan', ms);
    this.mino?.tepki('sevinc');
  }
  gozKapa(ms: number) {
    if (this.karakter?.ifadeVar('keyif')) this.karakter.ifade('keyif', ms);
  }
  agiz(): [number, number] {
    if (this.karakter) return this.karakter.k.agiz;
    const a = this.mino!.agizKonumu();
    const r = this.el.getBoundingClientRect();
    return r.width ? [(a.x - r.left) / r.width, (a.y - r.top) / Math.max(1, r.height)] : [0.5, 0.45];
  }
  kapat() {
    this.karakter?.kapat();
    this.mino?.kapat();
  }
}

export class Musteri {
  readonly el: HTMLElement;
  readonly ad: string;
  readonly sip: Siparis;
  readonly balon: HTMLElement;
  readonly kisiler: Kisi[];
  /** geldi, istek alınabilir */
  hazir = false;
  /** verildi (tadıyor ya da gidiyor) */
  bitti = false;
  private yol: HTMLElement;
  private balonIc: HTMLElement;

  constructor(
    sip: Siparis,
    readonly taraf: 'sol' | 'sag',
  ) {
    this.sip = sip;
    this.ad = sip.musteri;
    this.kisiler = sip.ikinci ? [new Kisi(sip.musteri, 0.74), new Kisi(sip.ikinci, 0.74)] : [new Kisi(sip.musteri)];
    this.balonIc = balonResmi(sip);
    this.balon = h('div.ko-balon', { 'data-tur': sip.tur }, this.balonIc, h('b.ko-balon-soz', { 'aria-hidden': 'true' }));
    const ter = sip.terli ? h('div.ko-ter', { 'aria-hidden': 'true' }, h('i', { html: TER }), h('i', { html: TER })) : null;
    this.yol = h('div.ko-m-yol', {}, h('div.ko-m-govde', { 'data-adet': String(this.kisiler.length) }, ...this.kisiler.map((k) => k.el)), ter);
    this.el = h('div.ko-musteri', { 'data-musteri': this.ad, 'data-taraf': taraf, 'data-tur': sip.tur, role: 'button', 'aria-label': this.ad }, this.yol);
  }

  get hazirSoz(): Promise<void> {
    return Promise.all(this.kisiler.map((k) => k.hazir)).then(() => undefined);
  }
  get anaKisi(): Kisi {
    return this.kisiler[0];
  }

  /** Pencerenin kenarından kayarak gelir (yürür gibi hoplayarak) */
  async gel() {
    const x = this.taraf === 'sol' ? -120 : 120;
    this.balon.classList.add('ko-balon-gizli');
    const ms = TEST_MODU || AZ_HAREKET ? 60 : 650;
    for (const k of this.kisiler) void k.oynat('yuru', ms);
    await this.yol.animate([{ transform: `translateX(${x}%)` }, { transform: 'none' }], { duration: ms, easing: 'cubic-bezier(.25,.8,.35,1)', fill: 'backwards' }).finished.catch(() => undefined);
    for (const k of this.kisiler) void k.oynat('var', 400);
    this.balon.classList.remove('ko-balon-gizli');
    this.balon.classList.add('ko-balon-acil');
    this.hazir = true;
    this.el.classList.add('ko-hazir');
  }

  /** Gider: kendi tarafına kayar */
  async git() {
    this.hazir = false;
    this.el.classList.remove('ko-hazir');
    this.balon.classList.add('ko-balon-gizli');
    const x = this.taraf === 'sol' ? -130 : 130;
    const ms = TEST_MODU || AZ_HAREKET ? 60 : 600;
    for (const k of this.kisiler) void k.oynat('yuru', ms);
    await this.yol.animate([{ transform: 'none' }, { transform: `translateX(${x}%)` }], { duration: ms, easing: 'cubic-bezier(.5,0,.75,.4)', fill: 'forwards' }).finished.catch(() => undefined);
  }

  /** Dokununca: kafasını kaldırır, balon zıplar */
  dikkat() {
    void this.anaKisi.oynat('bak', 600);
    this.balon.classList.remove('ko-zipla');
    void this.balon.offsetWidth;
    this.balon.classList.add('ko-zipla');
  }

  /** Balonda kısa söz (seslendirilmez): "Mmm!", "Soğuk!" … */
  soz(metin: string) {
    const b = this.balon.querySelector<HTMLElement>('.ko-balon-soz');
    if (!b) return;
    b.textContent = metin;
    b.classList.remove('ko-soz-acil');
    void b.offsetWidth;
    b.classList.add('ko-soz-acil');
  }

  /** Farklı olan parçalar balonda bir an parlar */
  karsilastir(farklar: Fark[][]) {
    const f = [...new Set(farklar.flat())];
    this.balon.dataset.fark = f.join(' ');
    this.balon.classList.add('ko-farkli');
    window.setTimeout(() => this.balon.classList.remove('ko-farkli'), TEST_MODU ? 50 : 1800);
  }

  /**
   * Tadım: dondurma ağzının önüne gelir; gözlerini kapayıp yalar (girdi kilitlenmez). resim: kulenin kopyası.
   * Pamuk pembe dondurmada yanakları kızarır; ayının burnuna dondurma bulaşır.
   */
  async tat(resim: HTMLElement, pembe: boolean) {
    const k = this.anaKisi;
    const [ax, ay] = k.agiz();
    const lokma = h('div.ko-m-lokma', { style: `left:${ax * 100}%;top:${ay * 100}%` }, resim);
    k.el.append(lokma);
    if (this.ad === 'pamuk' && pembe) this.el.classList.add('ko-kizardi');
    if (this.ad === 'ayi') this.el.classList.add('ko-burun');
    await lokma.animate([{ transform: 'translate(-50%, -30%) scale(.3)', opacity: 0 }, { transform: 'translate(-50%, -40%) scale(1)', opacity: 1 }], { duration: sure(300), easing: 'cubic-bezier(.3,1.5,.5,1)', fill: 'forwards' }).finished.catch(() => undefined);
    k.gozKapa(1100);
    void k.oynat('ye', 1000);
    for (const kk of this.kisiler.slice(1)) void kk.oynat('ye', 1000);
    for (let i = 0; i < 2; i++) {
      lokma.animate([{ transform: 'translate(-50%, -40%) scale(1)' }, { transform: 'translate(-50%, -46%) scale(.94, 1.04)' }, { transform: 'translate(-50%, -40%) scale(1)' }], { duration: sure(300) });
      await bekle(330);
    }
    await lokma.animate([{ opacity: 1 }, { opacity: 0, transform: 'translate(-50%, -20%) scale(.6)' }], { duration: sure(260), fill: 'forwards' }).finished.catch(() => undefined);
    lokma.remove();
  }

  mutlu(ms = 1600) {
    for (const k of this.kisiler) k.mutlu(ms);
  }
  dans() {
    return Promise.all(this.kisiler.map((k) => k.oynat('dans', 1100)));
  }
  kapat() {
    for (const k of this.kisiler) k.kapat();
    this.el.getAnimations({ subtree: true }).forEach((a) => a.cancel());
  }
}
