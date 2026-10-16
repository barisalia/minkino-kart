/**
 * Kino'nun Otobüsü müşterisi: pencerede belden yukarı görünür (bel tezgâh çizgisinde, herkes ortak taban çizgisinde),
 * yanında istek balonu (yazı yok): resimli istekte tam dondurma, ipuçlu istekte tek ipucu resmi, sürprizde "?" külah.
 * Paylaşmada iki kişi yan yana. Boylar tek tablodan (src/karakter/boy.ts), pencereye sığsın diye yumuşatılarak.
 *
 * Kaynaklar (V3 §6): hazır iskeletler (src/karakter) ve Mino (src/mino); Kino'nun ailesi kitleri (kit-musteri.ts,
 * dinlenme duruşu); durağan resimler (G-OT1 yeni karakterleri, Nehir abla: tek resim, hareket bütün gövdeye).
 * Parça döndürme yok: poz / yüz değişimi ve ezilme-esneme. Görsel kaynak pikselinin üstüne büyütülmez (DPR 3).
 *
 * Ölçüler CSS'te --pen-h (müşteri katının yüksekliği) cinsinden: ölçüm yok, ekran dönünce kendiliğinden uyar.
 */
import { BOY, boyTipi, CIZIM, type BoyTipi, type Cizim } from '../../src/karakter/boy';
import { Karakter } from '../../src/karakter/karakter';
import { Mino } from '../../src/mino/mino';
import { NETLIK_DPR } from '../../src/ui/netlik';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { ARTI, GUNES, KALP, KONTUR, OK, TER } from './cizim';
import { birlesim, genislet, kesisir, yuzKutulari, type YuzKutulari } from '../../src/karakter/yuz';
import { AZ_HAREKET, salla, type Efekt } from './efekt';
import { KitKisi, kitOlcu } from './kit-musteri';
import { kuleCiz, kuleOlcu, type KuleVeri } from './kule';
import { musteriTanim, type Fark, type Gag, type Ipucu, type Istenen, type MusteriTanim, type Siparis } from './model';
import { duraganResim, gorsel, sosUstAdi, susAdi, topAdi } from './varliklar';

/** bir fazla balonunda kimin dondurması olduğu: hayvanın kart resmi (assets/hayvanlar) */
const YUZLER = import.meta.glob<string>('../../assets/hayvanlar/{tavsan,ayi,ordek,kus,maymun,inek,kopek}.webp', { eager: true, query: '?url', import: 'default' });
/** meyveli ipucu: meyve sepeti (assets/meyveler) */
const MEYVE = import.meta.glob<string>('../../assets/meyveler/{cilek,limon,portakal}.webp', { eager: true, query: '?url', import: 'default' });

const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, AZ_HAREKET ? Math.min(ms, 200) : sure(ms)));

/** Müşterinin boy tablosundaki adı (Kino'nun annesi Ege'nin annesiyle karışmasın) */
const boyAdi = (ad: string): BoyTipi | undefined => (ad === 'anne' && musteriTanim(ad)?.kaynak === 'kit' ? 'seri2-anne' : ad === 'mino' ? 'mino' : boyTipi(ad));

/** Pencerede görünen boy (müşteri katının oranı): çocuk 0.9, küçükler yumuşatılmış (kuş bile seçilsin) */
export function gorunenOran(ad: string): number {
  const tip = boyAdi(ad);
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

/**
 * Kendi belini bilen çizimler (kit, durağan resim): figürün boyu tablodan (herkesle aynı ölçek), bel tezgâh
 * çizgisinde. Dikey yer kutunun kendi boyunun yüzdesiyle (translate): genişlik sınırlansa da (netlik) bel yerinde kalır.
 */
function belliKutu(ad: string, c: Cizim, belOran: number, olcek: number, enCokPx: number): string {
  const [kw, kh] = c.kutu;
  const fig = (c.taban - c.tepe) / kh;
  const figurBoy = (gorunenOran(ad) / GORUNEN_PAY) * olcek;
  const kutuBoy = figurBoy / fig;
  const belKutu = c.tepe / kh + belOran * fig;
  const en = (kutuBoy * kw) / kh;
  return `width:min(calc(var(--pen-h) * var(--kisi-o, 1) * ${en.toFixed(4)}), ${enCokPx.toFixed(0)}px);aspect-ratio:${kw} / ${kh};bottom:calc(var(--pen-h) * var(--kisi-kalk, 0));translate:0 ${((1 - belKutu) * 100).toFixed(2)}%`;
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

// ---------------------------------------------------------------- ipucu resimleri (balonda yazı yok)
const K = KONTUR;
/** kocaman ağız (çok acıkmış) */
const AGIZ_IPUCU = `<svg viewBox="0 0 60 50" aria-hidden="true"><path d="M6 14Q30 4 54 14Q56 44 30 46Q4 44 6 14Z" fill="#B8434F" stroke="${K}" stroke-width="3.5" stroke-linejoin="round"/><path d="M14 34Q30 26 46 34Q40 44 30 44Q20 44 14 34Z" fill="#FF8DA0"/><path d="M10 15Q30 9 50 15L48 20Q30 15 12 20Z" fill="#fff" stroke="${K}" stroke-width="2"/></svg>`;
/** kahverengi lekeli bıyık (çikolatalı bir şey) */
const BIYIK_IPUCU = `<svg viewBox="0 0 70 40" aria-hidden="true"><path d="M35 14Q22 2 8 12Q4 24 14 26Q24 26 35 18Q46 26 56 26Q66 24 62 12Q48 2 35 14Z" fill="#8A5634" stroke="${K}" stroke-width="3.5" stroke-linejoin="round"/><path d="M20 22Q22 34 18 37Q14 34 16 24ZM50 22Q48 34 52 37Q56 34 54 24Z" fill="#6E3B22" stroke="${K}" stroke-width="2.5"/></svg>`;
const damla = (renk: string) => TER.replace('#8ED3F2', renk);
const kalpRenk = (renk: string) => KALP.replace('#FF5A7A', renk);

/** İpucunun resmi (5-6'da top sayısı: altta kesik çizgili boş toplar) */
function ipucuResmi(ip: Ipucu): HTMLElement {
  const i = (html: string, sinif = '') => h(`i.ko-ip-ikon${sinif}`, { html });
  let ana: HTMLElement;
  switch (ip.ozellik) {
    case 'serin':
      ana = h('span.ko-ip-serin', {}, i(GUNES, '.ko-ip-gunes'), i(TER, '.ko-ip-ter'), i(TER, '.ko-ip-ter.ko-ip-ter2'));
      break;
    case 'pembe':
      ana = i(kalpRenk('#FF8DB4'), '.ko-ip-kalp');
      break;
    case 'kocaman':
      ana = i(AGIZ_IPUCU, '.ko-ip-agiz');
      break;
    case 'cikolata':
      ana = h('span.ko-ip-cikolata', {}, i(BIYIK_IPUCU, '.ko-ip-biyik'), h('i.ko-ip-sos', { html: gorsel(sosUstAdi('cikolata')) }));
      break;
    case 'ikiRenk':
      ana = h('span.ko-ip-iki', {}, i(damla('#FF8DB4')), i(damla('#FFE45C')));
      break;
    case 'meyveli': {
      const m = Object.values(MEYVE);
      ana = h('span.ko-ip-meyve', {}, ...m.map((u, j) => h('img.ko-ip-meyve-r', { src: u, alt: '', draggable: 'false', style: `--j:${j}` })));
      break;
    }
    case 'yeni': {
      const html = ip.yeni?.tat ? gorsel(topAdi(ip.yeni.tat)) : ip.yeni?.sus ? gorsel(susAdi(ip.yeni.sus)) : '';
      ana = h('span.ko-ip-yeni', {}, h('i.ko-ip-yeni-r', { html }), h('i.ko-ip-parilti'));
      break;
    }
  }
  const toplar = ip.top ? h('span.ko-ip-toplar', { 'data-n': String(ip.top) }, ...Array.from({ length: ip.top }, () => h('i.ko-ip-top'))) : null;
  return h('div.ko-b-ipucu', { 'data-ipucu': ip.ozellik }, ana, toplar);
}

/** İstek balonunun resmi */
export function balonResmi(sip: Siparis): HTMLElement {
  const ic = h('div.ko-b-ic', { 'data-tur': sip.tur });
  const kule = (d: Istenen, oran = 0.6, gizli?: number) => h('div.ko-b-parca', {}, kuleKutu(istenenKule(d, gizli), oran));
  if (sip.tur === 'ipucu' && sip.ipucu) {
    ic.append(ipucuResmi(sip.ipucu));
  } else if (sip.tur === 'surpriz') {
    // "sen seç": soru işaretli boş külah
    ic.append(h('div.ko-b-surpriz', {}, h('div.ko-b-parca', {}, kuleKutu({ kap: 'kulah', toplar: ['?'], sos: null, susler: [] }, 0.6))));
  } else if (sip.tur === 'birFazla' && sip.referans) {
    const yuz = YUZLER[`../../assets/hayvanlar/${sip.referans.musteri}.webp`];
    const son = sip.istek[0].toplar.at(-1)!;
    // tavşanın külahı + bir top
    ic.append(
      h('div.ko-b-referans', { 'data-musteri': sip.referans.musteri }, kule(sip.referans.dondurma, 0.5), yuz ? h('img.ko-b-yuz', { src: yuz, alt: '', draggable: 'false' }) : null),
      h('i.ko-b-isaret', { html: ARTI }),
      h('div.ko-b-tek', { style: 'width:calc(var(--pen-h) * .2);height:calc(var(--pen-h) * .15)', html: gorsel(topAdi(son)) }),
    );
  } else if (sip.tur === 'paylasma' && sip.kupaResmi) {
    // büyük kupa (bütün toplar) → iki kâse
    const hepsi = sip.istek.flatMap((d) => d.toplar);
    ic.append(kule({ kap: 'kupa', toplar: [...hepsi], sos: null, susler: {} }, 0.5), h('i.ko-b-isaret.ko-b-ok', { html: OK }), h('div.ko-b-iki', {}, kule({ ...sip.istek[0], toplar: [] }, 0.2), kule({ ...sip.istek[1], toplar: [] }, 0.2)));
  } else if (sip.istek.length === 2) {
    ic.append(kule(sip.istek[0], 0.42), kule(sip.istek[1], 0.42));
  } else {
    ic.append(kule(sip.istek[0], 0.62, sip.gizli));
  }
  return ic;
}

// ---------------------------------------------------------------- kişi (iskelet, Mino, kit, durağan resim)

/** Durağan resim (tek resim): yüz işaretleri, bütün gövde hareketi */
class ResimKisi {
  readonly el: HTMLElement;
  readonly govde: HTMLElement;
  readonly hazir: Promise<void>;
  constructor(
    readonly ad: string,
    stil: string,
  ) {
    const r = duraganResim(ad)!;
    const o = r.olcu;
    const yuzde = (v: number, t: number) => `${((v / t) * 100).toFixed(2)}%`;
    const [x0, y0, x1, y1] = o.yuz;
    const gozAlt = y0 + (y1 - y0) * 0.55;
    const img = h('img.ko-resim-kisi', { src: r.url, alt: '', draggable: 'false', decoding: 'async' }) as HTMLImageElement;
    this.govde = h(
      'div.ko-resim-govde',
      {},
      img,
      h('i.m-goz.ko-yuz-isaret', { style: `left:${yuzde(x0, o.en)};top:${yuzde(y0, o.boy)};width:${yuzde(x1 - x0, o.en)};height:${yuzde(gozAlt - y0, o.boy)}` }),
      h('i.m-agiz.ko-yuz-isaret', { style: `left:${yuzde(o.agiz[0] - (x1 - x0) * 0.2, o.en)};top:${yuzde(o.agiz[1] - (y1 - y0) * 0.08, o.boy)};width:${yuzde((x1 - x0) * 0.4, o.en)};height:${yuzde((y1 - y0) * 0.16, o.boy)}` }),
    );
    this.el = h('div.ko-kisi.ko-kisi-resim', { style: stil, 'data-resim': ad }, this.govde);
    this.hazir = img.decode().catch(() => undefined);
  }
}

/** Müşterinin içindeki tek karakter */
class Kisi {
  readonly el: HTMLElement;
  readonly karakter: Karakter | null = null;
  readonly mino: Mino | null = null;
  readonly kit: KitKisi | null = null;
  readonly resim: ResimKisi | null = null;
  constructor(
    readonly ad: string,
    olcek = 1,
  ) {
    const t = musteriTanim(ad);
    if (t?.kaynak === 'kit') {
      const c = kitOlcu(ad)!;
      this.kit = new KitKisi(ad, belliKutu(ad, { kutu: c.kutu, tepe: c.tepe, taban: c.taban }, c.bel, olcek, c.kutu[0] / NETLIK_DPR));
      this.el = this.kit.el;
      return;
    }
    if (t?.kaynak === 'duragan') {
      const r = duraganResim(ad)!;
      const o = r.olcu;
      // boy kulaksız ölçülür (Zıpzıp): figür "bas"tan tabana
      const tepe = o.bas ?? o.tepe;
      const bel = (o.bel - tepe) / (o.taban - tepe);
      this.resim = new ResimKisi(ad, belliKutu(ad, { kutu: [o.en, o.boy], tepe, taban: o.taban }, bel, olcek, o.en / NETLIK_DPR));
      this.el = this.resim.el;
      return;
    }
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
    return this.karakter?.hazir ?? this.kit?.hazir ?? this.resim?.hazir ?? Promise.resolve();
  }
  /** Bütün gövde hareketi olan (yüz seti olmayan) durağan resim: ezilme-esneme ile */
  private resimOynat(ad: 'var' | 'sevin' | 'dans' | 'ye' | 'bak' | 'yuru', ms: number): Promise<void> {
    if (TEST_MODU || AZ_HAREKET || !this.resim) return bekle(Math.min(ms, 60));
    const hop = (y: number): Keyframe[] => [
      { transform: 'none' },
      { transform: 'scale(1.05, 0.92)', offset: 0.15 },
      { transform: `translateY(${-y}%) scale(0.96, 1.06)`, offset: 0.45 },
      { transform: 'scale(1.04, 0.94)', offset: 0.8 },
      { transform: 'none' },
    ];
    const k: Keyframe[] =
      ad === 'sevin' || ad === 'dans'
        ? [...hop(8).slice(0, 4), ...hop(6).slice(1)]
        : ad === 'ye'
          ? [{ transform: 'none' }, { transform: 'scale(1.03, 0.96)' }, { transform: 'none' }, { transform: 'scale(1.03, 0.96)' }, { transform: 'none' }]
          : ad === 'yuru'
            ? [{ transform: 'none' }, { transform: 'translateY(-3%)' }, { transform: 'none' }, { transform: 'translateY(-3%)' }, { transform: 'none' }]
            : ad === 'bak'
              ? [{ transform: 'none' }, { transform: 'translateY(-2%) scale(0.98, 1.03)', offset: 0.4 }, { transform: 'none' }]
              : hop(3);
    return this.resim.govde
      .animate(k, { duration: Math.max(200, ms), easing: 'ease-in-out', composite: 'add' })
      .finished.then(
        () => undefined,
        () => undefined,
      );
  }
  oynat(ad: 'var' | 'sevin' | 'dans' | 'ye' | 'bak' | 'yuru', ms: number): Promise<void> {
    if (this.karakter) return this.karakter.oynat(ad, ms);
    if (this.kit) return this.kit.oynat(ad, ms);
    if (this.resim) return this.resimOynat(ad, ms);
    // Mino müşteri dans yerine yerinde hoplar (sevinç): dansın yana salınışı yüzünü Kino'nun başının arkasına sokuyordu
    const t = ({ var: 'selam', sevin: 'sevinc', dans: 'sevinc', ye: 'ham', bak: 'evet', yuru: 'zipla' } as const)[ad];
    this.mino?.tepki(t);
    return bekle(ms);
  }
  mutlu(ms: number) {
    if (this.karakter?.ifadeVar('mutlu')) this.karakter.ifade('mutlu', ms);
    else if (this.karakter?.ifadeVar('heyecan')) this.karakter.ifade('heyecan', ms);
    this.kit?.mutlu(ms);
    this.mino?.tepki('sevinc');
  }
  saskin(ms: number) {
    if (this.karakter?.ifadeVar('saskin')) this.karakter.ifade('saskin', ms);
    if (this.karakter) void this.oynat('var', 420);
    this.kit?.saskin(ms);
    if (this.resim) void this.resimOynat('var', 380);
    this.mino?.tepki('sasir');
  }
  gozKapa(ms: number) {
    if (this.karakter?.ifadeVar('keyif')) this.karakter.ifade('keyif', ms);
    this.kit?.gozKapa(ms);
  }
  /** balondaki söz okunurken ağız oynar (kit; iskelet konuşma ağzı) */
  konus(acik: boolean) {
    this.kit?.konus(acik);
    this.karakter?.konus(acik, false);
  }
  /** Göz + kaş ve ağız kutuları (ekran) */
  yuz(): YuzKutulari {
    return yuzKutulari(this.el);
  }
  agiz(): [number, number] {
    if (this.karakter) return this.karakter.k.agiz;
    if (this.mino) {
      const a = this.mino.agizKonumu();
      const r = this.el.getBoundingClientRect();
      return r.width ? [(a.x - r.left) / r.width, (a.y - r.top) / Math.max(1, r.height)] : [0.5, 0.45];
    }
    const a = this.el.querySelector('.m-agiz')?.getBoundingClientRect();
    const r = this.el.getBoundingClientRect();
    return a && r.width ? [(a.left + a.width / 2 - r.left) / r.width, (a.top + a.height / 2 - r.top) / Math.max(1, r.height)] : [0.5, 0.3];
  }
  kapat() {
    this.karakter?.kapat();
    this.mino?.kapat();
    this.kit?.kapat();
  }
}

export class Musteri {
  readonly el: HTMLElement;
  readonly ad: string;
  readonly sip: Siparis;
  readonly tanim: MusteriTanim | undefined;
  readonly balon: HTMLElement;
  readonly kisiler: Kisi[];
  /** geldi, istek alınabilir */
  hazir = false;
  /** verildi (tadıyor ya da gidiyor) */
  bitti = false;
  private yol: HTMLElement;
  private govde: HTMLElement;
  private balonIc: HTMLElement;

  constructor(
    sip: Siparis,
    readonly taraf: 'sol' | 'sag',
  ) {
    this.sip = sip;
    this.ad = sip.musteri;
    this.tanim = musteriTanim(sip.musteri);
    this.kisiler = sip.ikinci ? [new Kisi(sip.musteri, 0.82), new Kisi(sip.ikinci, 0.82)] : [new Kisi(sip.musteri)];
    this.balonIc = balonResmi(sip);
    this.balon = h('div.ko-balon', { 'data-tur': sip.tur }, this.balonIc, h('b.ko-balon-soz', { 'aria-hidden': 'true' }));
    this.govde = h('div.ko-m-govde', { 'data-adet': String(this.kisiler.length) }, ...this.kisiler.map((k) => k.el));
    this.yol = h('div.ko-m-yol', {}, this.govde);
    this.el = h('div.ko-musteri', { 'data-musteri': this.ad, 'data-taraf': taraf, 'data-tur': sip.tur, 'data-kaynak': this.tanim?.kaynak ?? 'iskelet', role: 'button', 'aria-label': this.ad }, this.yol);
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
    this.ezEsnet();
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

  /** Poz değişiminde ezilme-esneme (120 ms: scaleY 0.92 → 1.06 → 1; tabandan) */
  ezEsnet() {
    if (TEST_MODU || AZ_HAREKET) return;
    this.govde.animate([{ transform: 'none' }, { transform: 'scale(1.04, 0.92)', offset: 0.35 }, { transform: 'scale(0.98, 1.06)', offset: 0.7 }, { transform: 'none' }], { duration: 180, easing: 'ease-out', composite: 'add' });
  }

  /** Dokununca: kafasını kaldırır, balon zıplar */
  dikkat() {
    void this.anaKisi.oynat('bak', 600);
    this.ezEsnet();
    this.balon.classList.remove('ko-zipla');
    void this.balon.offsetWidth;
    this.balon.classList.add('ko-zipla');
  }

  /**
   * Geç ipucu (12 sn): istekteki eksik şeye BAKAR (bütün gövde o yana eğilip uzanır) ve dudak yalar. Parlamaz, el
   * yok; çocuk bakışı izler.
   */
  bak(hedef: Element | null) {
    this.el.classList.add('ko-bakiyor');
    window.setTimeout(() => this.el.classList.remove('ko-bakiyor'), 1600);
    void this.anaKisi.oynat('bak', 900);
    if (!hedef || TEST_MODU || AZ_HAREKET) return;
    const r = hedef.getBoundingClientRect();
    const b = this.el.getBoundingClientRect();
    const yon = Math.sign(r.left + r.width / 2 - (b.left + b.width / 2)) || 1;
    this.govde.animate(
      [{ transform: 'none' }, { transform: `translateX(${yon * 5}%) translateY(2%) scale(0.98, 1.03)`, offset: 0.3 }, { transform: `translateX(${yon * 5}%) translateY(2%) scale(0.98, 1.03)`, offset: 0.75 }, { transform: 'none' }],
      { duration: 1500, easing: 'ease-in-out', composite: 'add' },
    );
    this.anaKisi.mutlu(500);
  }

  /** Balonda kısa söz (seslendirilmez ya da kaydı sonra gelir): "Mmm!", "Ben önce!" … uzun: istek cümlesi */
  soz(metin: string, uzun = false) {
    const b = this.balon.querySelector<HTMLElement>('.ko-balon-soz');
    if (!b) return;
    b.textContent = metin;
    b.classList.remove('ko-soz-acil', 'ko-soz-uzun');
    void b.offsetWidth;
    b.classList.add('ko-soz-acil');
    b.classList.toggle('ko-soz-uzun', uzun);
    // konuşur gibi (kitlerde ağız oynar)
    const k = this.anaKisi;
    k.konus(true);
    window.setTimeout(() => k.konus(false), TEST_MODU ? 30 : Math.min(2600, 500 + metin.length * 70));
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
    if (kay > 0.5) b.style.translate = `${(solda ? -kay : kay).toFixed(1)}px 0`;
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
    return { x, ust: Math.max(temas, goz ? goz.bottom + 2 : -1e9), en: Math.min(kr.width * 0.6, 120) };
  }

  /**
   * Tadım: dondurma ağzın hemen ALTINA gelir (tepesi alt dudağa değer; göz ve kaşlar hep açıkta), gözlerini kapayıp yalar
   * (girdi kilitlenmez). resim: kulenin kopyası. Pencere tezgâh çizgisinde kesildiği için dondurma efekt katmanında
   * durur: müşteri onu tezgâhın üstünde tutar. Pamuk pembe dondurmada yanakları kızarır; ayının burnuna dondurma bulaşır.
   * kemir: dondurmadan sonra külahı da yer (Bıdık; alttan kısalır, "kıtır").
   */
  async tat(resim: HTMLElement, pembe: boolean, efekt: Efekt, o: { kemir?: () => void } = {}) {
    const k = this.anaKisi;
    const kat = efekt.kutu();
    const yer = this.lokmaYeri();
    const lokma = h('div.ko-m-lokma.ko-m-lokma-alt', { style: `left:${(yer.x - kat.left).toFixed(1)}px;top:${(yer.ust - kat.top).toFixed(1)}px;width:${yer.en.toFixed(1)}px` }, resim);
    efekt.el.append(lokma);
    // görünen dondurmanın (kap ve top çizimleri) tepesi tam alt dudakta (kule kutunun tabanından yukarı çizilir)
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
    if (o.kemir) {
      // Bıdık külahı da yer: üç ısırık, her ısırıkta külah alttan kısalır
      for (let i = 1; i <= 3; i++) {
        lokma.style.clipPath = `inset(0 0 ${(i * 22).toFixed(0)}% 0)`;
        o.kemir();
        salla(this.govde, 'ko-hop');
        await bekle(260);
      }
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
    this.ezEsnet();
  }
  /** Bayıldı: gözler kapalı yalar, iki hop (bütün gövde), kalpler gun.ts'te */
  bayildi(ms = 1800) {
    for (const k of this.kisiler) {
      k.gozKapa(700);
      window.setTimeout(() => k.mutlu(ms), TEST_MODU ? 10 : 700);
    }
    this.el.classList.remove('ko-bayildi');
    void this.el.offsetWidth;
    this.el.classList.add('ko-bayildi');
    window.setTimeout(() => this.el.classList.remove('ko-bayildi'), TEST_MODU ? 50 : 1400);
  }
  /**
   * Komik an (sevmediği ya da farklı): şaşkın yüz, sonra gag (MVP: titreme ve "!"; ekşide büzülme, kocaman kulede
   * gömülme). Sonra güler.
   */
  async komik(gag: Gag | undefined) {
    this.saskin(700);
    this.el.dataset.gag = gag ?? 'farkli';
    this.el.classList.add('ko-komik');
    await bekle(TEST_MODU ? 30 : 900);
    this.el.classList.remove('ko-komik');
    delete this.el.dataset.gag;
    this.mutlu(1200);
  }
  dans() {
    return Promise.all(this.kisiler.map((k) => k.oynat('dans', 1100)));
  }
  kapat() {
    for (const k of this.kisiler) k.kapat();
    this.el.getAnimations({ subtree: true }).forEach((a) => a.cancel());
  }
}
