/**
 * Mino — konuşan, tepki veren kedi karakteri.
 * Vektör çizim katmanlara ayrılmıştır (kafa, gövde, iki kol, kuyruk; ekip/mino/mino-final.svg → scripts/mino/rig.mjs);
 * hareketler CSS değişkenleriyle her karede güncellenir. Ağız, konuşma sesinin gücüne göre açılıp kapanır.
 */
import { Dudak, type AgizSekli, type KonusBilgi } from '../audio/dudak';
import { AGIZ_SEKILLERI } from '../audio/dudak-mantik';
import { konusuyorMu } from '../audio/ses';
import { h, TEST_MODU } from '../ui/dom';
import { KUYRUK_OTUR, kolCoz, KOL_EN_COK, OTUR_Y, pozKolu, type MinoKolYan, type MinoPoz } from './mino-poz';
import { MINO_SVG } from './mino-svg';

export type { MinoKolYan, MinoPoz } from './mino-poz';

// Dönme noktaları (çizimin 2048'lik koordinatları; tasarımcının önerisi)
const BOYUN = { x: 1024, y: 1240 };
const KUYRUK = { x: 1250, y: 1680 };
const AYAK = { x: 1024, y: 1885 };
const KOL_SOL = { x: 840, y: 1290 };
const KOL_SAG = { x: 1205, y: 1290 };
/** ağzın üst kenarı (bıyık çizgisinin iki ucu) ve genişliği */
const AGIZ = { x: 1024, y: 992, g: 168 };
/** Zıplama miktarları eski çizimin ölçeğinde yazıldı; yeni çizim daha büyük */
const OLCEK = 1.35;

/**
 * İfade ekleri ayrı pakette (gömülü WebP, ağır): yalnız gerektiğinde bir kez yüklenir. Film açılışta önceden çağırır.
 */
let ifadeYukleme: Promise<string | null> | null = null;
export function minoIfadeleriYukle(): Promise<string | null> {
  ifadeYukleme ??= import('./mino-ifade-svg').then(
    (m) => m.MINO_IFADE_SVG,
    () => null,
  );
  return ifadeYukleme;
}
/** İfade kafaları (üzgün: kulakları sarkık kafa): ifade ekleriyle aynı tembel pakette */
let ifadeKafaYukleme: Promise<string | null> | null = null;
function minoIfadeKafaYukle(): Promise<string | null> {
  ifadeKafaYukleme ??= import('./mino-ifade-svg').then(
    (m) => m.MINO_IFADE_KAFA_SVG,
    () => null,
  );
  return ifadeKafaYukleme;
}

/**
 * Hâl ekleri (sırılsıklam, pofuduk; tam vektör, ağır): ifade ekleri gibi ayrı pakette, yalnız hal() ilk
 * çağrılınca bir kez yüklenir. Önceden yüklemek için çağrılabilir (banyo açılışta).
 */
let halYukleme: Promise<Record<string, string> | null> | null = null;
export function minoHalleriYukle(): Promise<Record<string, string> | null> {
  halYukleme ??= import('./mino-hal-svg').then(
    (m) => m.MINO_HAL_SVG,
    () => null,
  );
  return halYukleme;
}
/** Tüm beden hâli: asıl kafa / gövde / kuyruk (pofudukta kollar da) çizimin hâl sürümüyle değişir */
export type MinoHal = 'islak' | 'pofuduk';

/**
 * Burun ekleri (kaşıntı, burun tut, hapşu; tam vektör, ~40 KB): film ifadelerinden ayrı, kendi küçük paketinde;
 * yalnız ifade() bunlardan biriyle ilk çağrılınca bir kez yüklenir. Önceden yüklemek için çağrılabilir (Ege açılışta).
 */
let burunYukleme: Promise<Record<'kafa' | 'yuz' | 'kol' | 'pati', string> | null> | null = null;
export function minoBurunYukle(): Promise<Record<'kafa' | 'yuz' | 'kol' | 'pati', string> | null> {
  burunYukleme ??= import('./mino-burun-svg').then(
    (m) => m.MINO_BURUN_SVG,
    () => null,
  );
  return burunYukleme;
}

/**
 * Poz ekleri (kalkık kollar, oturma, düşünme, işaret, sarılma; tam vektör, ~90 KB): kendi küçük paketinde, yalnız
 * kol() / otur() / poz() ilk gerektiğinde bir kez yüklenir. Önceden yüklemek için çağrılabilir (film açılışta).
 */
let pozYukleme: Promise<Record<'kuyruk' | 'govde' | 'yuz' | 'kol', string> | null> | null = null;
export function minoPozYukle(): Promise<Record<'kuyruk' | 'govde' | 'yuz' | 'kol', string> | null> {
  pozYukleme ??= import('./mino-poz-svg').then(
    (m) => m.MINO_POZ_SVG,
    () => null,
  );
  return pozYukleme;
}

/**
 * Dedektif ekleri (şapka, büyüteç; ~190 KB gömülü WebP; ekip/mino/IFADELER.md "Dedektif Mino"): kendi küçük paketinde,
 * yalnız dedektif() ilk çağrılınca bir kez yüklenir (scripts/mino/dedektif.mjs → mino-dedektif-svg.ts).
 */
let dedektifYukleme: Promise<Record<'sapka' | 'buyutec', string> | null> | null = null;
export function minoDedektifYukle(): Promise<Record<'sapka' | 'buyutec', string> | null> {
  dedektifYukleme ??= import('./mino-dedektif-svg').then(
    (m) => m.MINO_DEDEKTIF_SVG,
    () => null,
  );
  return dedektifYukleme;
}

/** Burun ifadeleri (ekip/mino/IFADELER.md, "Burun ekleri"; Ege 8. sahne) */
export type MinoBurunIfade = 'burun-kasinti' | 'burun-tut' | 'hapsu';
const burunMu = (ad: MinoIfade): ad is MinoBurunIfade => ad === 'burun-kasinti' || ad === 'burun-tut' || ad === 'hapsu';
/**
 * Film ifadeleri (mino-final.svg gizli ekleri; ekip/mino/IFADELER.md) ve burun ifadeleri. Film 2: 'uzgun' (kulakları
 * sarkık kafa + yalvaran bakış), 'saskin' (kocaman gözler, "o" ağız), 'odak' (kısık gözler, dil ucu dışarıda).
 * Elektrikler Kesildi!: 'av' (ışığa kilitlenmiş kısık gözler, dikey göz bebeği, sıkılmış ağız).
 */
export type MinoIfade = 'zorlanma' | 'sersem' | 'kararsiz' | 'goz-kirp' | 'uzgun' | 'saskin' | 'odak' | 'av' | MinoBurunIfade;
/**
 * ifade() ayarı. ms: bu süre sonra normale döner (0: null verilene kadar).
 * boy (yalnız hapşu): 'buyuk' HAPŞU (püf tam "pat" 0.85 → 1.05, kafa sarsılır; varsayılan), 'kucuk' hıpşu (küçük, soluk püf, hafif sarsıntı).
 */
export interface MinoIfadeAyar {
  ms?: number;
  boy?: 'kucuk' | 'buyuk';
}
/** Burun eklerinin dönme / ölçek noktaları (çizimin 2048'lik koordinatları; IFADELER.md) */
const OMUZ_SOL = { x: 892, y: 1312 };
const OMUZ_SAG = { x: 1156, y: 1312 };
const PUF = { x: 1024, y: 1080 };
const BURUN_UCU = { x: 1024, y: 915 };
const YANAK = { x: 1024, y: 1010 };
/** omuzdan pati bileğine dikey uzaklık: kafa inip kalkınca kol bu oranla kısalıp uzar (pati burunda kalsın) */
const KOL_BOY = 312;
/** Bu tepkiler kendi ifadesini de açar (yalnız filmde kullanılır; oyunlarda değişiklik yok) */
const TEPKI_IFADE: Partial<Record<string, MinoIfade>> = { zorlan: 'zorlanma', sersem: 'sersem', kararsiz: 'kararsiz' };

/**
 * Son dört (selam, duzelt, sun, sevinc) pazarın tezgâh hareketleri: el sallama, meyveleri düzeltme,
 * hazırlık-takipli uzatma, kısa sevinç. Eski tepkiler aynen durur.
 */
export type Tepki = 'gidik' | 'mir' | 'zipla' | 'hapsu' | 'sasir' | 'hayir' | 'evet' | 'ham' | 'dans' | 'esne' | 'uzat' | 'zorlan' | 'sersem' | 'kararsiz' | 'saril' | 'kolac' | 'selam' | 'duzelt' | 'sun' | 'sevinc';

/**
 * Film duruşu: açılar derece, kafaY / ziplaY çizim birimi (+ aşağı), sx / sy çarpan, gulum ve agiz eklenir
 * (gulum -1.6: üzgün ağız), goz 1: gözler kapalı.
 */
export type MinoEkPoz = Partial<Record<'kafaAci' | 'kafaY' | 'govdeAci' | 'ziplaY' | 'sx' | 'sy' | 'kolSol' | 'kolSag' | 'kuyrukAci' | 'gozKay' | 'gulum' | 'agiz' | 'goz', number>>;

interface Durum {
  tepki: Tepki | null;
  tepkiBas: number;
  tepkiSure: number;
  uyuyor: boolean;
  kirpBas: number;
  sonrakiKirp: number;
  agiz: number;
  bak: number;
}

function ara(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
const sin = Math.sin;
const cos = Math.cos;
const donus = (p: { x: number; y: number }, derece: number, sx = 1, sy = 1, tx = 0, ty = 0) =>
  `translate(${p.x + tx}px, ${p.y + ty}px) rotate(${derece}deg) scale(${sx}, ${sy}) translate(${-p.x}px, ${-p.y}px)`;

/**
 * Ağız: 0 = kapalı gülümseme (ω), 1 = kocaman açık. Tasarımcının ağız katmanıyla aynı biçim:
 * burundan inen çizgi, üst kenarı ω olan ağız, altta dil.
 */
function agizYollari(acik: number, gulum: number, en = 1) {
  const { x: cx, y: ust, g } = AGIZ;
  const burunAlt = 956;
  if (acik < 0.06) {
    // kapalı: burun çizgisi + kedi gülümsemesi (ω)
    const orta = ust - 4;
    const cukur = ust + 14 + 26 * gulum;
    const cizgi = `M${cx} ${burunAlt}V${orta}M${cx - 80} ${ust - 14}Q${cx - 44} ${cukur + 6} ${cx} ${orta}Q${cx + 44} ${cukur + 6} ${cx + 80} ${ust - 14}`;
    return { ic: '', dil: '', cizgi };
  }
  // en: ağzın genişlik çarpanı (dudak senkronu: yuvarlak "o" dar, dişler "i/s" geniş)
  const gen = g * (1 - acik * 0.18) * en;
  const x0 = cx - gen / 2;
  const x1 = cx + gen / 2;
  const derin = 10 + acik * 108;
  const alt = ust + derin;
  // üst kenar: iki yanda aşağı, ortada burna doğru kalkan ω
  const tepe = ust - 16 - 10 * gulum;
  const ic = `M${x0} ${ust}Q${(x0 + cx) / 2} ${ust + 4} ${cx} ${tepe}Q${(x1 + cx) / 2} ${ust + 4} ${x1} ${ust}Q${x1 + 8} ${ust + derin * 0.85} ${cx} ${alt}Q${x0 - 8} ${ust + derin * 0.85} ${x0} ${ust}Z`;
  const dilY = alt - 8;
  const dil = acik < 0.3 ? '' : `M${cx - 44} ${dilY}Q${cx} ${dilY - 40 * acik} ${cx + 44} ${dilY}Q${cx} ${dilY + 8} ${cx - 44} ${dilY}Z`;
  // ağız kenarı + yanlarda yanağa kıvrılan uçlar + burun çizgisi
  const cizgi = `${ic}M${x0} ${ust}Q${x0 - 18} ${ust - 18} ${x0 - 36} ${ust - 40}M${x1} ${ust}Q${x1 + 18} ${ust - 18} ${x1 + 36} ${ust - 40}M${cx} ${burunAlt}V${tepe}`;
  return { ic, dil, cizgi };
}

/**
 * Dudak senkronunun şekilleri kod ağzıyla (Adobe'nin ağız katmanları gelene kadar; gelince onlar kullanılır).
 * gulumse burada yok: dinlenirken Mino'nun kendi (tepkiye göre) ağzı kalır.
 */
const KOD_AGZI: Record<Exclude<AgizSekli, 'gulumse'>, { acik: number; en: number; gulum: number }> = {
  kapali: { acik: 0, en: 1, gulum: 0.5 },
  az: { acik: 0.32, en: 0.95, gulum: 0.6 },
  orta: { acik: 0.82, en: 1, gulum: 0.8 },
  yuvarlak: { acik: 0.62, en: 0.62, gulum: 0.1 },
  dis: { acik: 0.24, en: 1.15, gulum: 0.9 },
};

export class Mino {
  readonly el: HTMLElement;
  private kok: SVGSVGElement;
  private agizIc: SVGPathElement;
  private dil: SVGPathElement;
  private agizCizgi: SVGPathElement;
  private zzz: HTMLElement;
  private raf = 0;
  private bas = performance.now();
  private d: Durum = { tepki: null, tepkiBas: 0, tepkiSure: 0, uyuyor: false, kirpBas: -1, sonrakiKirp: 1.5, agiz: 0.8, bak: 0 };

  constructor() {
    this.zzz = h('div.mino-zzz', { 'aria-hidden': 'true' }, h('span', {}, 'z'), h('span', {}, 'z'), h('span', {}, 'Z'));
    this.el = h('div.mino', { html: MINO_SVG });
    this.el.append(this.zzz);
    this.kok = this.el.querySelector('svg')!;
    this.agizIc = this.el.querySelector('.m-agiz-ic')!;
    this.dil = this.el.querySelector('.m-dil')!;
    this.agizCizgi = this.el.querySelector('.m-agiz-cizgi')!;
    this.agizG = this.el.querySelector('.m-agiz');
    // Adobe'nin ağız şekilleri (agiz-kapali … agiz-gulumse; scripts/mino/rig.mjs): altısı da varsa kullanılır
    const sekiller = new Map([...this.el.querySelectorAll<SVGGElement>('.m-agiz-sekil')].map((g) => [g.dataset.sekil as AgizSekli, g]));
    if (AGIZ_SEKILLERI.every((s) => sekiller.has(s))) this.agizKatman = sekiller;
    this.kare = this.kare.bind(this);
    this.raf = requestAnimationFrame(this.kare);
  }

  /** Kısa bir tepki animasyonu oynat. */
  tepki(t: Tepki, sure?: number) {
    const varsayilan: Record<Tepki, number> = { gidik: 1.6, mir: 2.2, zipla: 0.9, hapsu: 1.2, sasir: 1.1, hayir: 1.0, evet: 0.9, ham: 1.4, dans: 2.4, esne: 2.2, uzat: 1.3, zorlan: 1.6, sersem: 1.6, kararsiz: 3, saril: 1.2, kolac: 1.4, selam: 1.4, duzelt: 1.7, sun: 1.5, sevinc: 1.0 };
    this.d.tepki = t;
    const ifd = TEPKI_IFADE[t];
    if (ifd) void this.ifade(ifd, (sure ?? varsayilan[t]) * 1000);
    this.d.tepkiBas = this.zaman();
    this.d.tepkiSure = sure ?? varsayilan[t];
    if (t !== 'esne') this.uyan();
  }

  uyu() {
    this.d.uyuyor = true;
    this.el.classList.add('uyuyor');
  }

  uyan() {
    this.d.uyuyor = false;
    this.el.classList.remove('uyuyor');
  }

  get uyuyorMu() {
    return this.d.uyuyor;
  }

  /** Şu an bir tepki oynuyor mu (boştaki canlılık döngüsü üst üste binmesin diye) */
  get mesgul() {
    return !!this.d.tepki;
  }

  /**
   * Bakış yönü: -1 sola, 0 karşıya, 1 sağa (gözler kayar, baş hafifçe o yana döner; yumuşak geçiş).
   * Varsayılan 0: bakışı kullanmayan oyunlarda hiçbir şey değişmez.
   */
  bak(yon: number) {
    this.bakisHedef = Math.max(-1, Math.min(1, yon));
  }
  private bakisHedef = 0;
  private bakis = 0;

  /** Ekran koordinatında ağzın merkezi (yiyecek uçurmak için). */
  agizKonumu(): { x: number; y: number } {
    const r = this.kok.getBoundingClientRect();
    const vb = this.kok.viewBox.baseVal;
    return { x: r.left + ((AGIZ.x - vb.x) / vb.width) * r.width, y: r.top + ((AGIZ.y + 30 - vb.y) / vb.height) * r.height };
  }

  /** Dokunulan noktanın hangi bölgeye denk geldiği. */
  bolge(x: number, y: number): 'kafa' | 'burun' | 'gobek' | 'kuyruk' | 'ayak' {
    const r = this.kok.getBoundingClientRect();
    const vb = this.kok.viewBox.baseVal;
    const vx = vb.x + ((x - r.left) / r.width) * vb.width;
    const vy = vb.y + ((y - r.top) / r.height) * vb.height;
    if (Math.hypot(vx - 1024, vy - 915) < 75) return 'burun';
    if (vx > 1300 && vy > 1180) return 'kuyruk';
    if (vy < BOYUN.y - 20) return 'kafa';
    if (vy > 1680) return 'ayak';
    return 'gobek';
  }

  /**
   * Yüz ifadesi (çizilmiş ek katmanlar): açıkken ilgili gözler, kod ağzı ve yanaklar yerini ifadenin çizimine bırakır.
   * ayar: ms (sayı ya da { ms }) verilirse o süre sonra normale döner; null normale döndürür.
   * Burun ifadeleri: 'burun-kasinti' (burun seğirir), 'burun-tut' (kollar kalkar, patiler burunda, yanaklar şişer, titrer),
   * 'hapsu' ({ boy: 'buyuk' } HAPŞU: püf "pat" + kafa sarsıntısı; { boy: 'kucuk' } hıpşu).
   * Ekler henüz yüklenmediyse yüklenir; dönen söz ifade göründüğünde (ya da vazgeçildiğinde) çözülür.
   */
  ifade(ad: MinoIfade | null, ayar: number | MinoIfadeAyar = 0): Promise<void> {
    const { ms = 0, boy = 'buyuk' } = typeof ayar === 'number' ? { ms: ayar } : ayar;
    for (const c of [...this.el.classList]) if (c.startsWith('ifade-')) this.el.classList.remove(c);
    clearTimeout(this.ifadeZaman);
    this.ifadeAd = null;
    this.ifadeIstek++;
    this.burunSifirla();
    if (!ad) return Promise.resolve();
    // ekler henüz yüklenmediyse yükle; yüklenince (hâlâ isteniyorsa) göster, yoksa sessizce vazgeç
    const istek = this.ifadeIstek;
    return (burunMu(ad) ? this.burunEkle() : this.ifadeleriEkle()).then((tamam) => {
      if (!tamam || istek !== this.ifadeIstek) return;
      this.ifadeAd = ad;
      this.burunBas = this.zaman();
      this.burunBoy = boy;
      this.el.classList.add(`ifade-${ad}`);
      if (ms) this.ifadeZaman = window.setTimeout(() => void this.ifade(null), TEST_MODU ? 30 : ms);
    });
  }
  /** Açık ifade (yoksa null) */
  get ifadeSu(): MinoIfade | null {
    return this.ifadeAd;
  }
  private ifadeIstek = 0;
  private ifadeEklendi = false;

  /** Bu Mino'ya burun eklerini koyar (paylaşılan tembel yükleme; yuvalar: mino-burun-svg.ts, scripts/mino/rig.mjs) */
  private async burunEkle(): Promise<boolean> {
    if (this.burunEklendi) return true;
    const ekler = await minoBurunYukle();
    const k = this.kok.querySelector<SVGGElement>(':scope > .k');
    const kafaHal = k?.querySelector(':scope > .m-hal');
    if (!ekler || !k || !kafaHal) return false;
    if (this.burunEklendi) return true;
    // hapşu kafası asıl kafanın (ve hâlinin) hemen üstüne, göz / ağız eklerinin altına
    kafaHal.insertAdjacentHTML('afterend', ekler.kafa);
    k.insertAdjacentHTML('beforeend', ekler.yuz);
    // burnu tutan kollar kafanın ve fuların üstünde, patiler en üstte
    this.kok.insertAdjacentHTML('beforeend', ekler.kol + ekler.pati);
    this.burunParca = {
      burun: this.kok.querySelector('.m-burun-burun'),
      yanak: this.kok.querySelector('.m-burun-yanak'),
      puf: this.kok.querySelector('.m-hapsu-puf'),
      kolSol: this.kok.querySelector('.m-burun-kol-sol'),
      kolSag: this.kok.querySelector('.m-burun-kol-sag'),
    };
    this.burunEklendi = true;
    return true;
  }
  private burunEklendi = false;
  private burunParca: Record<'burun' | 'yanak' | 'puf' | 'kolSol' | 'kolSag', SVGGElement | null> | null = null;
  /** burun ifadesinin başladığı an (kodla canlandırma için) ve hapşunun boyu */
  private burunBas = 0;
  private burunBoy: 'kucuk' | 'buyuk' = 'buyuk';
  /** burun eklerinin kodla verilen dönüşümlerini bırakır (bir sonraki açılışta baştan başlasın) */
  private burunSifirla() {
    if (!this.burunParca) return;
    for (const e of Object.values(this.burunParca)) {
      if (!e) continue;
      e.style.transform = '';
      e.style.opacity = '';
    }
  }

  /** Bu Mino'nun kafasına ifade eklerini koyar (paylaşılan tembel yükleme) */
  private async ifadeleriEkle(): Promise<boolean> {
    if (this.ifadeEklendi) return true;
    const svg = await minoIfadeleriYukle();
    const kafa = await minoIfadeKafaYukle();
    const yer = this.el.querySelector('.m-ifadeler');
    if (!svg || !yer) return false;
    if (!this.ifadeEklendi) {
      yer.innerHTML = svg;
      // ifade kafaları (üzgün): asıl kafanın hemen üstüne, göz / ağız eklerinin altına (hapşu kafası gibi)
      const kafaHal = this.kok.querySelector(':scope > .k > .m-hal');
      if (kafa && kafaHal) kafaHal.insertAdjacentHTML('afterend', kafa);
    }
    this.ifadeEklendi = true;
    return true;
  }
  private ifadeAd: MinoIfade | null = null;
  private ifadeZaman = 0;

  /**
   * Beden hâli (ekip/mino/IFADELER.md "Hâl ekleri"): 'islak' sırılsıklam, 'pofuduk' kabarmış tüy, null normal.
   * Ekler henüz yüklenmediyse yüklenince (hâlâ isteniyorsa) uygulanır; dönen söz uygulandığında çözülür.
   */
  hal(ad: MinoHal | null): Promise<void> {
    this.halIstek = ad;
    if (!ad) {
      this.halUygula(null);
      return Promise.resolve();
    }
    return this.halleriEkle().then((tamam) => {
      if (tamam && this.halIstek === ad) this.halUygula(ad);
    });
  }
  get halAd(): MinoHal | null {
    return this.halIstek;
  }
  private halIstek: MinoHal | null = null;
  private halEklendi = false;
  private halUygula(ad: MinoHal | null) {
    this.el.classList.toggle('hal-islak', ad === 'islak');
    this.el.classList.toggle('hal-pofuduk', ad === 'pofuduk');
  }
  /** Bu Mino'nun yuvalarına (m-hal) hâl eklerini koyar (paylaşılan tembel yükleme) */
  private async halleriEkle(): Promise<boolean> {
    if (this.halEklendi) return true;
    const haller = await minoHalleriYukle();
    if (!haller) return false;
    if (!this.halEklendi) for (const yuva of this.el.querySelectorAll<SVGGElement>('.m-hal')) yuva.innerHTML = haller[yuva.dataset.yer ?? ''] ?? '';
    this.halEklendi = true;
    return true;
  }

  // ---------------------------------------------------------------- pozlar (IFADELER.md: kalkık kollar, oturma, film 3)
  /**
   * Kolun temel açısı (derece, + = dışa / yukarı; iki kol için aynı yön anlamı). Bekleme ve tepki hareketleri üstüne
   * eklenir. Toplam ~30°'yi geçince asıl kol gizlenir, kalkık kol (kol-*-yukari) aynı açıyla görünür (en çok 160°).
   * 0: normal kol (varsayılan; eskisi gibi en çok 24°). Kino'daki karşılığı: duruş yukSol / yukSag.
   */
  kol(yan: MinoKolYan, aci: number) {
    this.kolPoz[yan] = Number.isFinite(aci) ? aci : 0;
    if (this.kolPoz[yan] > 0) void this.pozEkle();
  }
  /** kol() ile verilen temel açılar */
  get kolAcilari(): Readonly<Record<MinoKolYan, number>> {
    return this.kolPoz;
  }
  private kolPoz: Record<MinoKolYan, number> = { sol: 0, sag: 0 };

  /**
   * Oturur (true) / kalkar (false): gövde ve kuyruk oturan çizimle değişir, karakter ~50 birim aşağı iner (zemine
   * oturur). Kollar, kalkık kollar, fular ve kafa aynı kalır. Dönen söz çizim hazır olunca çözülür.
   */
  otur(acik: boolean): Promise<void> {
    this.oturIstek = acik;
    return acik ? this.pozEkle().then(() => undefined) : Promise.resolve();
  }
  get oturuyor(): boolean {
    return this.oturIstek;
  }
  private oturIstek = false;

  /**
   * Tam beden pozu: 'dusun' (sağ pati çenede, gözler yukarı, "hımm" ağzı), 'isaret-sag' / 'isaret-sol' (o yana bakan
   * gözler + o yandaki kalkık kol 85°), 'sarilma' (kollar göğüste çapraz, gözler kapalı, kapalı gülümseme), null: yok.
   * ayar.kol false: işarette kol kalkmaz, yalnız gözler o yana bakar (film duruşu "bakan"). Konuşurken pozun ağzı
   * konuşma ağzına bırakılır. Bir ifade (ifade()) açıksa pozun yüzü gizlenir, kolları kalır.
   */
  poz(ad: MinoPoz | null, ayar: { kol?: boolean } = {}): Promise<void> {
    this.pozIstek = ad;
    this.pozKol = ayar.kol ?? true;
    return ad ? this.pozEkle().then(() => undefined) : Promise.resolve();
  }
  get pozSu(): MinoPoz | null {
    return this.pozIstek;
  }
  private pozIstek: MinoPoz | null = null;
  private pozKol = true;

  /** Bu Mino'ya poz eklerini koyar (paylaşılan tembel yükleme; yuvalar: mino-poz-svg.ts, scripts/mino/rig.mjs) */
  private pozEkle(): Promise<boolean> {
    this.pozEkleme ??= minoPozYukle().then((ekler) => {
      const q = this.kok.querySelector(':scope > .q > .m-hal');
      const g = this.kok.querySelector(':scope > .g > .m-hal');
      const k = this.kok.querySelector(':scope > .k');
      if (!ekler || !q || !g || !k) return false;
      // oturan kuyruk / gövde asıl çizimin (ve hâlinin) hemen üstüne; yüz kafanın sonuna; kollar en üste
      q.insertAdjacentHTML('afterend', ekler.kuyruk);
      g.insertAdjacentHTML('afterend', ekler.govde);
      k.insertAdjacentHTML('beforeend', ekler.yuz);
      this.kok.insertAdjacentHTML('beforeend', ekler.kol);
      this.pozEklendi = true;
      return true;
    });
    return this.pozEkleme;
  }
  private pozEkleme: Promise<boolean> | null = null;
  private pozEklendi = false;

  /**
   * Dedektif Mino (IFADELER.md "Dedektif Mino"): sapka = kareli dedektif şapkası (kafada, en üstte); buyutec = sol
   * gözünün önünde büyüteç tutan kol (asıl sol kol ve sol göz gizlenir; camdaki göz sabit resim olduğu için büyüteç
   * açıkken göz kırpma ve mutlu göz atlanır). Verilmeyen alan değişmez. Dönen söz çizim hazır olunca çözülür.
   */
  dedektif(ayar: { sapka?: boolean; buyutec?: boolean }): Promise<void> {
    if (ayar.sapka !== undefined) this.dedektifIstek.sapka = ayar.sapka;
    if (ayar.buyutec !== undefined) this.dedektifIstek.buyutec = ayar.buyutec;
    const uygula = () => {
      this.el.classList.toggle('dedektif-sapka', this.dedektifIstek.sapka);
      this.el.classList.toggle('dedektif-buyutec', this.dedektifIstek.buyutec);
    };
    if (!this.dedektifIstek.sapka && !this.dedektifIstek.buyutec) {
      uygula();
      return Promise.resolve();
    }
    this.dedektifEkleme ??= minoDedektifYukle().then((ekler) => {
      const k = this.kok.querySelector(':scope > .k');
      if (!ekler || !k) return false;
      k.insertAdjacentHTML('beforeend', ekler.buyutec + ekler.sapka);
      return true;
    });
    return this.dedektifEkleme.then((tamam) => {
      if (!tamam) return;
      // sonradan eklenen yüz ekleri (poz, ifade) şapkanın üstüne binmesin: şapka hep kafanın en sonunda
      const k = this.kok.querySelector(':scope > .k');
      const sapka = k?.querySelector(':scope > .m-dedektif-sapka');
      if (k && sapka && k.lastElementChild !== sapka) k.append(sapka);
      uygula();
    });
  }
  /** dedektif() ile istenen ekler */
  get dedektifSu(): Readonly<{ sapka: boolean; buyutec: boolean }> {
    return this.dedektifIstek;
  }
  private dedektifIstek = { sapka: false, buyutec: false };
  private dedektifEkleme: Promise<boolean> | null = null;

  /**
   * Film/animatik: Mino konuşuyor (açıkken ağız sese göre oynar; ses yoksa metnin ritmiyle). bilgi: cümle ve
   * (filmin MP4 kaydında) önceden çıkarılmış ağız dizisi.
   */
  agizOyna(acik: boolean, bilgi?: KonusBilgi) {
    this.agizZorla = acik;
    if (acik) this.dudak.hazirla(bilgi);
  }
  private agizZorla = false;
  private dudak = new Dudak();
  private agizG: SVGGElement | null = null;
  private agizKatman: Map<AgizSekli, SVGGElement> | null = null;
  private agizKatmanSon: AgizSekli | null = null;
  private agizEn = 1;
  /** Dudak senkronunun şu anki şekli (yandan Mino da buna göre açar) */
  agizSekliSu: AgizSekli = 'gulumse';
  /** Başka bir karakter konuşurken (ör. Kino) Mino'nun ağzı oynamasın */
  agizSus = false;
  /**
   * Film duruşu (film/src/oyuncu.ts → durus): tepki ve bekleme hareketlerinin üstüne eklenen beden dili
   * (üzgün: baş eğik, kuyruk sarkık, ağız aşağı…). null: yok (oyunlarda değişiklik yok).
   */
  ekPoz: MinoEkPoz | null = null;
  /**
   * Gözler sıkıca kapalı (ifade eki olmadan; ör. banyoda köpük kaçmasın). Hâl çizimleriyle (sırılsıklam,
   * pofuduk) de temiz çalışır. Varsayılan false: diğer oyunlarda değişiklik yok.
   */
  gozZorla = false;

  kapat() {
    cancelAnimationFrame(this.raf);
  }

  private zaman() {
    return (performance.now() - this.bas) / 1000;
  }

  private kare() {
    this.raf = requestAnimationFrame(this.kare);
    const t = this.zaman();
    const d = this.d;
    const uyku = d.uyuyor ? 1 : 0;

    // Temel (bekleme) hareketleri
    let nefes = sin(t * (uyku ? 1.3 : 2.1)) * (uyku ? 0.022 : 0.012);
    let kafaAci = sin(t * 0.9) * 2.2 + (uyku ? 7 : 0);
    let kafaY = uyku ? 14 : 0;
    let kuyrukAci = sin(t * (uyku ? 0.8 : 2.4)) * (uyku ? 3 : 6);
    let govdeAci = 0;
    let ziplaY = 0;
    let sx = 1;
    let sy = 1 + nefes;
    let gozKapali = uyku;
    let mutlu = 0;
    let agizHedef = uyku ? 0 : 0.72;
    let gulum = 1;
    let gozKay = 0;
    // kollar: derece, + = dışa/yukarı kalkar (iki kol için aynı yön anlamı)
    let kolSol = sin(t * (uyku ? 1.3 : 2.1)) * 1.5;
    let kolSag = sin(t * (uyku ? 1.3 : 2.1) + 0.4) * 1.5;

    // Göz kırpma
    if (!uyku && t > d.sonrakiKirp) {
      d.kirpBas = t;
      d.sonrakiKirp = t + 2.2 + Math.random() * 3.2;
    }
    if (d.kirpBas >= 0) {
      const k = (t - d.kirpBas) / 0.16;
      if (k < 1) gozKapali = Math.max(gozKapali, sin(k * Math.PI));
    }

    // Tepkiler
    if (d.tepki) {
      const e = (t - d.tepkiBas) / d.tepkiSure; // 0..1
      if (e >= 1) d.tepki = null;
      else {
        const zarf = sin(Math.min(1, e) * Math.PI); // yumuşak başlayıp biten
        switch (d.tepki) {
          case 'gidik':
            govdeAci = sin(t * 38) * 4 * zarf;
            kafaAci += sin(t * 30) * 5 * zarf;
            sy += sin(t * 25) * 0.03 * zarf;
            mutlu = zarf > 0.15 ? 1 : 0;
            agizHedef = 0.95;
            kolSol += (6 + sin(t * 34) * 5) * zarf;
            kolSag += (6 + sin(t * 34 + 1.5) * 5) * zarf;
            break;
          case 'mir':
            kafaAci += 10 * zarf;
            mutlu = zarf > 0.2 ? 1 : 0;
            agizHedef = 0.05;
            kuyrukAci += sin(t * 6) * 9 * zarf;
            break;
          case 'zipla': {
            const p = Math.min(1, e / 0.85);
            ziplaY = -Math.max(0, sin(p * Math.PI)) * 190;
            const bas = e < 0.12 ? sin((e / 0.12) * Math.PI) : 0;
            sx = 1 + bas * 0.1;
            sy = 1 - bas * 0.12 + (ziplaY < -20 ? 0.05 : 0);
            kuyrukAci += 5 * zarf;
            agizHedef = 1;
            // havadayken iki kol da kalkar
            kolSol += 22 * Math.max(0, sin(p * Math.PI));
            kolSag += 22 * Math.max(0, sin(p * Math.PI));
            break;
          }
          case 'hapsu':
            if (e < 0.55) {
              kafaAci -= 9 * (e / 0.55);
              kafaY -= 12 * (e / 0.55);
              gozKapali = Math.max(gozKapali, e / 0.55);
              agizHedef = 0.55;
            } else {
              const f = (e - 0.55) / 0.45;
              kafaAci += 14 * sin(Math.min(1, f * 2) * Math.PI) - 9 * (1 - f);
              kafaY += 18 * sin(Math.min(1, f * 2) * Math.PI);
              gozKapali = 1;
              agizHedef = 1;
              kolSol += 12 * sin(Math.min(1, f * 2) * Math.PI);
              kolSag += 12 * sin(Math.min(1, f * 2) * Math.PI);
            }
            break;
          case 'sasir':
            ziplaY = -sin(Math.min(1, e * 2) * Math.PI) * 60;
            sy += 0.04 * zarf;
            agizHedef = 1;
            gulum = -0.2;
            kolSol += 16 * zarf;
            kolSag += 16 * zarf;
            break;
          case 'hayir':
            kafaAci += sin(e * Math.PI * 6) * 9 * zarf;
            agizHedef = 0.08;
            gulum = -0.6;
            kolSol -= 4 * zarf;
            kolSag -= 4 * zarf;
            break;
          case 'evet':
            kafaY += sin(e * Math.PI * 4) * 16 * zarf;
            mutlu = 1;
            agizHedef = 0.9;
            // el sallama (sağ kol)
            kolSag += (15 + sin(e * Math.PI * 6) * 8) * zarf;
            break;
          case 'ham': {
            const cig = Math.abs(sin(e * Math.PI * 7));
            agizHedef = cig * 0.75;
            mutlu = 1;
            sx = 1 + 0.03 * zarf;
            kolSol -= 6 * zarf;
            kolSag -= 6 * zarf;
            kafaAci += sin(e * Math.PI * 3.5) * 4;
            break;
          }
          case 'dans':
            govdeAci = sin(e * Math.PI * 8) * 8;
            kafaAci += sin(e * Math.PI * 8 + 0.6) * 8;
            ziplaY = -Math.abs(sin(e * Math.PI * 8)) * 60 * zarf;
            kuyrukAci += sin(e * Math.PI * 8) * 12;
            // kollar sırayla kalkar
            kolSol += (10 + sin(e * Math.PI * 8) * 12) * zarf;
            kolSag += (10 - sin(e * Math.PI * 8) * 12) * zarf;
            mutlu = 1;
            agizHedef = 0.95;
            break;
          case 'esne':
            agizHedef = 1.1 * zarf;
            gozKapali = Math.max(gozKapali, zarf);
            kafaAci -= 8 * zarf;
            sy += 0.03 * zarf;
            // esnerken gerinir
            kolSol += 18 * zarf;
            kolSag += 18 * zarf;
            break;
          case 'uzat': {
            // bir şeyi (sol yandaki) karşısındakine uzatır: öne/sola eğilir, doğrulur, sol kolu kalkar, gülümser
            const tut = Math.min(1, e / 0.25, (1 - e) / 0.25);
            ziplaY = -150 * tut;
            govdeAci = -7 * tut;
            kafaAci -= 6 * tut;
            kolSol += 26 * tut;
            kolSag += 6 * tut;
            mutlu = tut > 0.4 ? 1 : 0;
            agizHedef = 0.85;
            break;
          }
          case 'zorlan': {
            // ağır bir şeyi kaldırmaya çalışır: çömelir, titrer, yanaklar şişer (ağız kapalı, gözler sıkılı)
            const tut = Math.min(1, e / 0.2, (1 - e) / 0.15);
            sy -= 0.07 * tut;
            sx += 0.05 * tut;
            govdeAci = sin(t * 55) * 1.8 * tut;
            kafaAci += sin(t * 48) * 2 * tut;
            kolSol += 18 * tut;
            kolSag += 18 * tut;
            gozKapali = Math.max(gozKapali, tut > 0.5 ? 1 : 0);
            agizHedef = 0;
            gulum = -0.3;
            break;
          }
          case 'sersem': {
            // sersem ama mutlu: başı daire çizerek sallanır, gözler mutlu
            kafaAci += sin(e * Math.PI * 5) * 9 * zarf;
            govdeAci = sin(e * Math.PI * 5 + 1) * 3 * zarf;
            kafaY += cos(e * Math.PI * 5) * 6 * zarf;
            mutlu = 1;
            agizHedef = 0.6;
            break;
          }
          case 'saril': {
            // (sarılma çizimi gelene kadar) sağdaki bir şeye yaslanır, kolları iki yana açık, mutlu
            const tut = Math.min(1, e / 0.2, (1 - e) / 0.2);
            govdeAci = 8 * tut;
            kafaAci += 7 * tut;
            kolSol += 22 * tut;
            kolSag += 22 * tut;
            sy -= 0.03 * tut;
            mutlu = tut > 0.4 ? 1 : 0;
            agizHedef = 0.2;
            break;
          }
          case 'kolac': {
            // "Gelin!": kollarını kocaman açar, hafifçe zıplar
            const tut = Math.min(1, e / 0.15, (1 - e) / 0.2);
            kolSol += 24 * tut;
            kolSag += 24 * tut;
            ziplaY = -Math.max(0, sin(Math.min(1, e / 0.4) * Math.PI)) * 60;
            mutlu = tut > 0.5 ? 1 : 0;
            agizHedef = 0.9;
            break;
          }
          case 'selam': {
            // müşteriye el sallar: sağ kol kalkar ve üç kez sallanır, baş o yana yatar, gülümser
            const tut = Math.min(1, e / 0.15, (1 - e) / 0.2);
            kolSag += (KOL_EN_COK - 6 + sin(e * Math.PI * 7) * 8) * tut;
            kafaAci += 6 * tut;
            govdeAci = sin(e * Math.PI * 7) * 1.5 * tut;
            kuyrukAci += sin(t * 7) * 8 * tut;
            mutlu = tut > 0.4 ? 1 : 0;
            agizHedef = 0.7;
            break;
          }
          case 'duzelt': {
            // tezgâhtaki meyveleri düzeltir: öne eğilir, patileri sırayla dokunur, sonra doğrulup bakar
            const tut = Math.min(1, e / 0.2, (1 - e) / 0.25);
            ziplaY = 38 * tut;
            govdeAci = -3 * tut;
            kafaAci -= 7 * tut;
            const dokun = e > 0.2 && e < 0.8 ? sin(e * Math.PI * 9) : 0;
            kolSol += (4 + Math.max(0, dokun) * 10) * tut;
            kolSag += (4 + Math.max(0, -dokun) * 10) * tut;
            gozKay -= 10 * tut;
            agizHedef = 0.12;
            gulum = 1;
            break;
          }
          case 'sun': {
            // hazırlık → uzatma → takip: önce geri çekilip çömelir, sonra öne atılır (hafif fazlasıyla),
            // bir an tutar, bırakınca geri gelirken küçük bir sekme yapar
            let cek = 0;
            let at = 0;
            if (e < 0.18) cek = sin((e / 0.18) * Math.PI * 0.5);
            else if (e < 0.3) {
              const u = (e - 0.18) / 0.12;
              cek = 1 - u;
              at = u * 1.15;
            } else if (e < 0.42) at = 1.15 - 0.15 * ((e - 0.3) / 0.12);
            else if (e < 0.72) at = 1 + sin((e - 0.42) * 20) * 0.03;
            else {
              const u = (e - 0.72) / 0.28;
              at = Math.max(0, 1 - u * 1.25) - Math.max(0, sin(Math.min(1, (u - 0.8) / 0.2) * Math.PI)) * 0.12;
            }
            sy -= 0.07 * cek;
            sx += 0.05 * cek;
            govdeAci = 5 * cek - 8 * at;
            ziplaY = 30 * cek - 140 * Math.max(0, at);
            kafaAci += 4 * cek - 6 * at;
            kolSol += -6 * cek + 26 * Math.max(0, at);
            kolSag += -4 * cek + 8 * Math.max(0, at);
            kuyrukAci += 10 * at;
            mutlu = at > 0.5 ? 1 : 0;
            agizHedef = at > 0.3 ? 0.85 : 0.2;
            break;
          }
          case 'sevinc': {
            // kısa sevinç: iki küçük hop, kollar havada, gözler mutlu
            const hop = Math.abs(sin(e * Math.PI * 2));
            ziplaY = -90 * hop * zarf;
            const bas = hop < 0.15 ? 1 - hop / 0.15 : 0;
            sx = 1 + 0.06 * bas * zarf;
            sy = 1 - 0.07 * bas * zarf + 0.03 * hop;
            kolSol += KOL_EN_COK * zarf;
            kolSag += KOL_EN_COK * zarf;
            kuyrukAci += sin(t * 9) * 12 * zarf;
            mutlu = 1;
            agizHedef = 1;
            break;
          }
          case 'kararsiz': {
            // kararsız: bir sağa bir sola bakar (başı yatar, gözler kayar), kuyruk ucu kıvrılır
            const bak = e < 0.2 ? -1 : e < 0.45 ? 1 : e < 0.7 ? -1 : 1;
            gozKay = bak * 22 * zarf;
            kafaAci += bak * 8 * zarf;
            govdeAci = bak * 2 * zarf;
            kuyrukAci += sin(t * 5) * 14 * zarf;
            agizHedef = 0.1;
            gulum = -0.2;
            break;
          }
        }
      }
    }

    // Bakış yönü (bak()): gözler kayar, baş hafifçe o yana döner (varsayılan 0: değişiklik yok)
    this.bakis = ara(this.bakis, this.bakisHedef, TEST_MODU ? 1 : 0.07);
    if (this.bakis) {
      gozKay += this.bakis * 26;
      kafaAci += this.bakis * 4;
    }

    // Burun ifadeleri (ifade()): çizilmiş eklerin kodla canlanan kısımları (yalnız transform / opacity)
    const bp = this.burunParca;
    const bi = this.ifadeAd;
    if (bp && bi && burunMu(bi)) {
      const b = TEST_MODU ? 1 : t - this.burunBas; // ifade açılalı geçen süre (sn)
      if (bi === 'burun-kasinti') {
        // burun seğirir: her ~0.8 sn'de kısa bir kabarma, baş hafifçe kalkıp "koklar"
        const u = (b % 0.8) / 0.8;
        const seg = u < 0.22 ? sin((u / 0.22) * Math.PI) : 0;
        bp.burun?.style.setProperty('transform', donus(BURUN_UCU, 0, 1 + 0.07 * seg, 1 + 0.05 * seg));
        kafaY -= 4 * seg;
      } else if (bi === 'burun-tut') {
        // yanaklar şişer (hafif fazlasıyla açılır, sonra nefes gibi kabarıp iner); baş ve gövde minik titrer
        const ac = Math.min(1, b / 0.28);
        const sis = sin(ac * Math.PI * 0.5) + sin(ac * Math.PI) * 0.35 + (ac >= 1 ? sin((b - 0.28) * 4.5) * 0.25 : 0);
        bp.yanak?.style.setProperty('transform', donus(YANAK, 0, 0.92 + 0.1 * sis, 0.95 + 0.06 * sis));
        kafaAci += sin(t * 47) * 0.9;
        kafaY += sin(t * 53) * 1.6;
        govdeAci += sin(t * 41) * 0.35;
      } else {
        // hapşu: püf "pat" (0.85 → 1.05 → 1; hıpşuda küçük ve soluk), kafa kısa sarsılır
        const buyuk = this.burunBoy === 'buyuk';
        const p = Math.min(1, b / 0.32);
        const pat = p < 0.55 ? ara(0.85, 1.05, sin((p / 0.55) * Math.PI * 0.5)) : ara(1.05, 1, (p - 0.55) / 0.45);
        // hıpşu: yarım "pat" (0.85 → 0.95); daha küçüğü sarsıntı çizgilerini kafanın üstüne bindirir
        const olcek = buyuk ? pat : 0.85 + (pat - 0.85) * 0.5;
        bp.puf?.style.setProperty('transform', donus(PUF, 0, olcek, olcek));
        bp.puf?.style.setProperty('opacity', String(Math.min(1, b / 0.06) * (buyuk ? 1 : 0.7)));
        const sars = Math.max(0, 1 - b / 0.55) * (buyuk ? 1 : 0.35);
        kafaAci += sin(b * 42) * 7 * sars;
        kafaY += 18 * sin(Math.min(1, b / 0.3) * Math.PI) * (buyuk ? 1 : 0.4);
        sy -= 0.04 * sars;
        sx += 0.03 * sars;
      }
    }

    // Film duruşu (ekPoz): tepkilerin üstüne eklenir (yoksa hiçbir şey değişmez)
    const ep = this.ekPoz;
    if (ep) {
      kafaAci += ep.kafaAci ?? 0;
      kafaY += ep.kafaY ?? 0;
      govdeAci += ep.govdeAci ?? 0;
      ziplaY += ep.ziplaY ?? 0;
      sx *= ep.sx ?? 1;
      sy *= ep.sy ?? 1;
      kolSol += ep.kolSol ?? 0;
      kolSag += ep.kolSag ?? 0;
      kuyrukAci += ep.kuyrukAci ?? 0;
      gozKay += ep.gozKay ?? 0;
      gulum += ep.gulum ?? 0;
      agizHedef = Math.max(0, agizHedef + (ep.agiz ?? 0));
      if ((ep.goz ?? 0) > 0.5) gozKapali = Math.max(gozKapali, 1);
    }

    // Pozlar (kol / otur / poz): yalnız çizimleri yüklendiyse (yoksa hiçbir şey değişmez)
    const pozVar = this.pozEklendi;
    const pz = pozVar ? this.pozIstek : null;
    const otur = pozVar && this.oturIstek;
    if (pz === 'sarilma') {
      // gözler kapalı, kapalı gülümseme (Adobe agiz-gulumse; yoksa kod ağzı)
      gozKapali = 1;
      mutlu = 0;
      agizHedef = 0;
      gulum = 1;
    } else if (pz === 'dusun') mutlu = 0;

    // Konuşurken ağız sese göre şekil alır (dudak senkronu: src/audio/dudak.ts); susunca gülümsemeye döner
    const konusuyor = ((konusuyorMu() && !this.agizSus) || this.agizZorla) && !uyku;
    const sekil = this.dudak.kare(performance.now(), konusuyor);
    this.agizSekliSu = sekil;
    let en = 1;
    if (konusuyor) mutlu = 0;
    if (sekil !== 'gulumse' && !uyku) {
      const k = KOD_AGZI[sekil];
      agizHedef = k.acik;
      en = k.en;
      gulum = k.gulum;
      mutlu = 0;
    }
    // Adobe'nin ağız katmanları varsa konuşurken onlar görünür (kod ağzı gizlenir)
    // (sarılırken susunca Adobe'nin kapalı gülümsemesi)
    const katman = this.agizKatman && !this.ifadeAd ? (konusuyor ? sekil : pz === 'sarilma' ? 'gulumse' : null) : null;
    if (katman !== this.agizKatmanSon) {
      this.agizKatmanSon = katman;
      for (const [ad, g] of this.agizKatman ?? []) g.style.display = ad === katman ? 'inline' : 'none';
      if (this.agizG) this.agizG.style.display = katman ? 'none' : '';
    }
    if (this.ifadeAd === 'goz-kirp') {
      agizHedef = 0;
      gulum = 1;
    }
    if (this.gozZorla) {
      gozKapali = 1;
      mutlu = 0;
    }
    // büyüteç açıkken camdaki göz sabit resim: kapalı / mutlu göz çizgisi camın yanında yamalı durmasın
    if (this.dedektifIstek.buyutec && this.el.classList.contains('dedektif-buyutec')) {
      gozKapali = 0;
      mutlu = 0;
    }
    d.agiz = ara(d.agiz, agizHedef, TEST_MODU ? 1 : 0.35);
    this.agizEn = ara(this.agizEn, en, TEST_MODU ? 1 : 0.35);

    // Uygula
    const s = this.el.style;
    const govde = `translate(0px, ${ziplaY * OLCEK + (otur ? OTUR_Y : 0)}px) ` + donus(AYAK, govdeAci, sx, sy);
    s.setProperty('--govde', govde);
    // kafa fazla yukarı kalkarsa fuların üstünde boynun konturu görünür: yukarı en çok 6 birim
    const kafaYS = Math.max(-6, kafaY);
    s.setProperty('--kafa', donus(BOYUN, kafaAci, 1, 1, 0, kafaYS));
    // burnu tutan kollar (gövdeye bağlı) omuzdan kafayla aynı açıda döner, kafa inip kalkınca uzar / kısalır: patiler burunda kalır
    if (bp && bi === 'burun-tut') {
      const boy = 1 - kafaYS / KOL_BOY; // kafa inerse (kafaY > 0) burun omza yaklaşır
      bp.kolSol?.style.setProperty('transform', donus(OMUZ_SOL, kafaAci, 1, boy));
      bp.kolSag?.style.setProperty('transform', donus(OMUZ_SAG, kafaAci, 1, boy));
    }
    // oturan kuyruk kendi kökünden sallanır
    s.setProperty('--kuyruk', donus(otur ? KUYRUK_OTUR : KUYRUK, kuyrukAci));
    // kollar: poz yoksa eskisi gibi (-8 … 24°); kol() / işaret açısıyla 30°'yi geçince kalkık kol (sarılırken ikisi de,
    // düşünürken sağ kol kendi çiziminde)
    const kolTemel = (yan: MinoKolYan) => (pz === 'sarilma' || (pz === 'dusun' && yan === 'sag') ? 0 : this.kolPoz[yan] || (this.pozKol ? pozKolu(pz, yan) : 0));
    const ks = kolCoz(kolTemel('sol'), kolSol, pozVar);
    const kg = kolCoz(kolTemel('sag'), kolSag, pozVar);
    s.setProperty('--kol-sol', donus(KOL_SOL, ks.aci));
    s.setProperty('--kol-sag', donus(KOL_SAG, -kg.aci));
    if (pozVar) {
      s.setProperty('--kol-sol-yuk', donus(KOL_SOL, ks.yukari ? ks.aci : 0));
      s.setProperty('--kol-sag-yuk', donus(KOL_SAG, kg.yukari ? -kg.aci : 0));
      const c = this.el.classList;
      const yuz = !!pz && !this.ifadeAd;
      c.toggle('otur', otur);
      c.toggle('kol-sol-yukari', ks.yukari && pz !== 'sarilma');
      c.toggle('kol-sag-yukari', kg.yukari && pz !== 'sarilma' && pz !== 'dusun');
      c.toggle('poz-dusun', pz === 'dusun');
      c.toggle('poz-sarilma', pz === 'sarilma');
      c.toggle('poz-dusun-yuz', yuz && pz === 'dusun');
      c.toggle('poz-dusun-agiz', yuz && pz === 'dusun' && !konusuyor);
      c.toggle('poz-bak-sag', yuz && pz === 'isaret-sag');
      c.toggle('poz-bak-sol', yuz && pz === 'isaret-sol');
    }
    s.setProperty('--goz-kay', `${gozKay.toFixed(1)}px`);
    s.setProperty('--golge', String(1 - Math.min(0.5, -ziplaY / 400)));
    // Göz: açık çizim ↔ kapalı / mutlu göz çizgisi (katman değişimi; kırpma anında)
    this.el.classList.toggle('mutlu', mutlu > 0.5);
    this.el.classList.toggle('gozkapali', mutlu <= 0.5 && gozKapali > 0.5);
    const { ic, dil, cizgi } = agizYollari(Math.max(0, d.agiz), gulum, this.agizEn);
    this.agizIc.setAttribute('d', ic);
    this.dil.setAttribute('d', dil);
    this.agizCizgi.setAttribute('d', cizgi);
  }
}
