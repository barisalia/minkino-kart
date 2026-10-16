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
import { birlesim, genislet, kesisir, yuzKutulari, type YuzKutulari } from '../../src/karakter/yuz';
import { AZ_HAREKET, type Efekt } from './efekt';
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

/** Figürün tezgâh çizgisinin üstünde kalan payı (üstten): çoğu karakterde bel (%57) */
const GORUNEN_PAY = 0.57;
/**
 * Kendi payı olanlar. Mino'nun başı iri (ağzı figürün %56'sında): bel hizasında ağzı tezgâh çizgisine denk geliyordu.
 * Göğsü ve kolları da görünsün diye %74'ü tezgâhın üstünde ve biraz büyük: yüzü ve tadımdaki dondurma tezgâhın üstünde.
 * Basamak / tabure yok; yalnız ölçek ve dikey yer.
 */
const OZEL: Record<string, { pay: number; olcek: number }> = { mino: { pay: 0.74, olcek: 1.08 } };

/**
 * Karakterin kutusu (müşteri katının yüksekliği = 1): kutunun eni ve tabandan aşağı kayması. Görünen kısım figürün
 * üst %57'si (bel tezgâh çizgisinde; Mino: OZEL).
 */
export function kutuOlcu(ad: string, olcek = 1): { en: number; alt: number; oran: string } {
  const c = CIZIM[ad] ?? CIZIM.kino;
  const [kw, kh] = c.kutu;
  const fig = (c.taban - c.tepe) / kh;
  const oz = OZEL[ad];
  const figurBoy = (gorunenOran(ad) / GORUNEN_PAY) * olcek * (oz?.olcek ?? 1);
  const kutuBoy = figurBoy / fig;
  const bel = c.tepe / kh + (oz?.pay ?? GORUNEN_PAY) * fig;
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
    // --kisi-o: telefonda (pencere boydan sınırlıyken) karakterler biraz küçülür (gun.ts → olc)
    const stil = `width:calc(var(--pen-h) * var(--kisi-o, 1) * ${o.en.toFixed(4)});bottom:calc(var(--pen-h) * (var(--kisi-o, 1) * ${o.alt.toFixed(4)} + var(--kisi-kalk, 0)));aspect-ratio:${o.oran}`;
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
    // Mino müşteri dans yerine yerinde hoplar (sevinç): dansın yana salınışı yüzünü Kino'nun başının arkasına sokuyordu
    const t = ({ var: 'selam', sevin: 'sevinc', dans: 'sevinc', ye: 'ham', bak: 'evet', yuru: 'zipla' } as const)[ad];
    this.mino?.tepki(t);
    return bekle(ms);
  }
  mutlu(ms: number) {
    if (this.karakter?.ifadeVar('mutlu')) this.karakter.ifade('mutlu', ms);
    else if (this.karakter?.ifadeVar('heyecan')) this.karakter.ifade('heyecan', ms);
    this.mino?.tepki('sevinc');
  }
  saskin(ms: number) {
    if (this.karakter?.ifadeVar('saskin')) this.karakter.ifade('saskin', ms);
    if (this.karakter) void this.oynat('var', 420);
    this.mino?.tepki('sasir');
  }
  gozKapa(ms: number) {
    if (this.karakter?.ifadeVar('keyif')) this.karakter.ifade('keyif', ms);
  }
  /** Göz + kaş ve ağız kutuları (ekran) */
  yuz(): YuzKutulari {
    return yuzKutulari(this.el);
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
    this.kisiler = sip.ikinci ? [new Kisi(sip.musteri, 0.82), new Kisi(sip.ikinci, 0.82)] : [new Kisi(sip.musteri)];
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

  /**
   * İstek balonu yüzün önüne binmesin (dar dikey telefonda Mino, sevinip hoplarken balonun altına kayıyordu): balon
   * yüzden dışa doğru (pencerenin içinde kalarak) kayar, yer yetmezse dış kenarından küçülür.
   */
  balonuYuzdenAyir() {
    const b = this.balon;
    if (!b.isConnected) return;
    b.style.translate = '';
    b.style.scale = '';
    const y = this.yuz().yuz;
    const r = b.getBoundingClientRect();
    if (!y || !r.width) return;
    const yuz = genislet(y, (y.right - y.left) * 0.12);
    const solda = r.left + r.width / 2 < (yuz.left + yuz.right) / 2;
    // balonun yüze bakan kuyruğu (::after) da sayılır
    const kuyruk = r.width * 0.12;
    const rk = { left: solda ? r.left : r.left - kuyruk, right: solda ? r.right + kuyruk : r.right, top: r.top, bottom: r.bottom };
    if (!kesisir(yuz, rk)) return;
    const pen = (b.closest('.ko-pencere') ?? document.body).getBoundingClientRect();
    const tasma = solda ? rk.right - yuz.left : yuz.right - rk.left;
    const yer = Math.max(0, solda ? r.left - pen.left - 2 : pen.right - 2 - r.right);
    const kay = Math.min(tasma, yer);
    const kalan = tasma - kay;
    // yakın çekimde (kamera büyütmüş) ölçüler ekranda büyük: kayma balonun kendi ölçeğine çevrilir
    const ana = b.parentElement;
    const buyutme = ana && ana.offsetWidth ? Math.max(0.2, ana.getBoundingClientRect().width / ana.offsetWidth) : 1;
    if (kay > 0.5) b.style.translate = `${((solda ? -kay : kay) / buyutme).toFixed(1)}px 0`;
    if (kalan > 0.5) {
      b.style.transformOrigin = solda ? '0 50%' : '100% 50%';
      b.style.scale = Math.max(0.6, (r.width - kalan) / r.width).toFixed(3);
    }
  }

  /** Farklı olan parçalar balonda bir an parlar */
  karsilastir(farklar: Fark[][]) {
    const f = [...new Set(farklar.flat())];
    this.balon.dataset.fark = f.join(' ');
    this.balon.classList.add('ko-farkli');
    window.setTimeout(() => this.balon.classList.remove('ko-farkli'), TEST_MODU ? 50 : 1800);
  }

  /** Bütün kişilerin yüz kutuları birlikte (paylaşmada iki kardeş) */
  yuz(): YuzKutulari {
    const y = this.kisiler.map((k) => k.yuz());
    const goz = birlesim(y.map((x) => x.goz));
    const agiz = birlesim(y.map((x) => x.agiz));
    return { goz, agiz, yuz: birlesim([goz, agiz]) };
  }

  /**
   * Dondurmanın tadımdaki yeri (ekran): ortası ağzın ortası, görünen tepesi alt dudakta (göz ve kaşlar hep açıkta).
   * Ağız kutusu yoksa (iskelet yüklenmeden) kişiliğin ağız noktası.
   */
  lokmaYeri(): { x: number; ust: number; en: number } {
    const k = this.anaKisi;
    const kr = k.el.getBoundingClientRect();
    const { goz, agiz } = k.yuz();
    const [ax, ay] = k.agiz();
    const x = agiz ? (agiz.left + agiz.right) / 2 : kr.left + kr.width * ax;
    const temas = agiz ? agiz.bottom - (agiz.bottom - agiz.top) * 0.15 : kr.top + kr.height * ay;
    return { x, ust: Math.max(temas, goz ? goz.bottom + 2 : -1e9), en: kr.width * 0.6 };
  }

  /**
   * Tadım: dondurma ağzın hemen ALTINA gelir (tepesi alt dudağa değer; göz ve kaşlar hep açıkta), gözlerini kapayıp yalar
   * (girdi kilitlenmez). resim: kulenin kopyası. Pencere tezgâh çizgisinde kesildiği için dondurma efekt katmanında
   * durur: müşteri onu tezgâhın üstünde tutar. Pamuk pembe dondurmada yanakları kızarır; ayının burnuna dondurma bulaşır.
   */
  async tat(resim: HTMLElement, pembe: boolean, efekt: Efekt) {
    const k = this.anaKisi;
    const kat = efekt.kutu();
    const yer = this.lokmaYeri();
    const lokma = h('div.ko-m-lokma.ko-m-lokma-alt', { style: `left:${(yer.x - kat.left).toFixed(1)}px;top:${(yer.ust - kat.top).toFixed(1)}px;width:${yer.en.toFixed(1)}px` }, resim);
    efekt.el.append(lokma);
    // görünen dondurmanın (kap ve top çizimleri) tepesi tam alt dudakta (kule kutunun tabanından yukarı çizilir)
    // (kule kutusu sıfır yükseklikte, çizim tabandan yukarı taşar: ölçüler px; yüzde kullanılmaz, dönüşüm kökü çizimin tepesi)
    const kutu = lokma.getBoundingClientRect();
    const cizim = birlesim([...lokma.querySelectorAll('.ko-g, img, svg')].map((e) => e.getBoundingClientRect()));
    const fark = cizim ? cizim.top - kutu.top : 0;
    const yb = cizim ? cizim.bottom - cizim.top : 0;
    lokma.style.top = `${(yer.ust - kat.top - fark).toFixed(1)}px`;
    lokma.style.transformOrigin = `${(kutu.width / 2).toFixed(1)}px ${fark.toFixed(1)}px`;
    const tx = `translateX(${(-kutu.width / 2).toFixed(1)}px)`;
    const ty = (oran: number) => `translateY(${(yb * oran).toFixed(1)}px)`;
    lokma.style.transform = `${tx} scale(.3)`;
    // Mino yerinde hoplar (sevinç, 'ham'): dondurma yerinde kalırsa başı inince dondurma ağzını ve gözlerinin altını
    // örtüyordu. Patisinde tutar gibi yüzü izler (tepesi hep alt dudakta, yumuşak).
    let takip = 0;
    if (k.mino && !AZ_HAREKET) {
      let sx = yer.x - kat.left;
      let sy = yer.ust - kat.top - fark;
      const izle = () => {
        if (!lokma.isConnected) return;
        const y = this.lokmaYeri();
        const kt = efekt.kutu();
        sx += (y.x - kt.left - sx) * 0.4;
        sy += (y.ust - kt.top - fark - sy) * 0.4;
        lokma.style.left = `${sx.toFixed(1)}px`;
        lokma.style.top = `${sy.toFixed(1)}px`;
        takip = requestAnimationFrame(izle);
      };
      takip = requestAnimationFrame(izle);
    }
    if (this.ad === 'pamuk' && pembe) this.el.classList.add('ko-kizardi');
    if (this.ad === 'ayi') this.el.classList.add('ko-burun');
    await lokma.animate([{ transform: `${tx} ${ty(0.12)} scale(.3)`, opacity: 0 }, { transform: `${tx} ${ty(0)} scale(1)`, opacity: 1 }], { duration: sure(300), easing: 'cubic-bezier(.3,1.5,.5,1)', fill: 'forwards' }).finished.catch(() => undefined);
    k.gozKapa(1100);
    void k.oynat('ye', 1000);
    for (const kk of this.kisiler.slice(1)) void kk.oynat('ye', 1000);
    for (let i = 0; i < 2; i++) {
      // yalar: dondurma ağza doğru hafifçe uzanıp iner (tepesi ağzın ortasını geçmez)
      lokma.animate([{ transform: `${tx} ${ty(0)} scale(1)` }, { transform: `${tx} ${ty(-0.03)} scale(.96, 1.03)` }, { transform: `${tx} ${ty(0)} scale(1)` }], { duration: sure(300) });
      await bekle(330);
    }
    await lokma.animate([{ transform: `${tx} ${ty(0)} scale(1)`, opacity: 1 }, { opacity: 0, transform: `${tx} ${ty(0.18)} scale(.6)` }], { duration: sure(260), fill: 'forwards' }).finished.catch(() => undefined);
    cancelAnimationFrame(takip);
    lokma.remove();
  }

  /** Başın üstü (efekt katmanına göre): kalpler, konfeti burada açılır, yüze inmez. yari: efektin yarı boyu (px) */
  basUstu(efekt: Efekt, yari: number): [number, number] {
    const k = efekt.kutu();
    const { goz, yuz } = this.yuz();
    if (!goz || !yuz) return efekt.merkez(this.el, 0.5, 0.12);
    const alin = goz.top - (goz.bottom - goz.top) * 0.5;
    return [(yuz.left + yuz.right) / 2 - k.left, Math.max(yari, alin - yari - k.top)];
  }

  mutlu(ms = 1600) {
    for (const k of this.kisiler) k.mutlu(ms);
  }
  /** Şaşkın yüz ("farklı oldu"): iri gözler, küçük "o" ağız, gövde kısa basılıp toparlanır */
  saskin(ms = 700) {
    for (const k of this.kisiler) k.saskin(ms);
  }
  dans() {
    return Promise.all(this.kisiler.map((k) => k.oynat('dans', 1100)));
  }
  kapat() {
    for (const k of this.kisiler) k.kapat();
    this.el.getAnimations({ subtree: true }).forEach((a) => a.cancel());
  }
}
