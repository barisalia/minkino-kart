/**
 * Film motoru: sahne dosyasını (content/film/<film>.json) zaman çizelgesiyle oynatır.
 *
 * - Saat: kendi saatimiz (duraklatılabilir; ?test=1'de hızlı). Olaylar, kamera, eşya ve oyuncu yolları bu saate bağlı
 *   tween'lerle ilerler; karakterlerin kendi canlılığı (nefes, göz kırpma, tepkiler) kendi motorlarında sürer.
 * - Dünya: kare (2048'lik çizimler gibi); konumlar dünyanın %'si (x yatay merkez, y alttan, w genişlik).
 * - Katmanlar: uzak / orta / on ayrı derinlikte; kamera yaklaşınca ve kayınca farklı hızda hareket eder (parallax).
 * - Işık tonu (akşamüstü), sahne geçişi (iris / kararma), alt yazı, sonda öğüt kartı.
 * Yalnız transform / opacity.
 */
import { diziSuresi, dudakDizisi } from '../../src/audio/dudak';
import type { KonusmaSecenegi } from '../../src/audio/konusma';
import { baglam } from '../../src/audio/motor';
import { sarkiTablosu, sozleEsle, type SarkiJson, type SarkiTablosu } from '../../src/audio/sarki-kayit';
import { KINO_SESI, konus, sus } from '../../src/audio/ses';
import { iskeletVar, svgGetir } from '../../src/karakter/karakter';
import { yandanYukle } from '../../src/karakter/yandan';
import { h, TEST_MODU } from '../../src/ui/dom';
import { esyaAdresi, esyaCiz, ESYA_ALT, ESYA_MERKEZ, ESYA_ORAN } from './esya';
import { FILM_EFEKT } from './efekt';
import { dosyaTamponu, filmMuzik, type DosyaSecenegi, type Ruh } from './muzik';
import { Oyuncu } from './oyuncu';

// ---------------------------------------------------------------- MP4 kaydı (?kayit=1; scripts/film/mp4.mjs)
/**
 * Kayıt modu: film sahte saatle kare kare çekilir; ses çalınmaz, olaylar zamanıyla günlüğe yazılır ve sonra aynı
 * efekt / müzik / konuşma koduyla çevrimdışı işlenir (film/src/kayit.ts). Normal oynatmada hiçbir şey değişmez.
 */
export const KAYIT = typeof location !== 'undefined' && new URLSearchParams(location.search).has('kayit');
export interface SesOlayi {
  /** performance.now() / 1000 (sahte saat) */
  t: number;
  tur: 'efekt' | 'muzik' | 'konus';
  ad: string;
  arg?: unknown;
}
export const sesGunlugu: SesOlayi[] = [];
/** çevrimdışı işlerken aynı işlevler yeniden çağrılır: o sırada günlük tutulmaz */
export const gunlukDurum = { kapali: false };
export function sesGunlugeYaz(tur: SesOlayi['tur'], ad: string, arg?: unknown) {
  if (KAYIT && !gunlukDurum.kapali) sesGunlugu.push({ t: performance.now() / 1000, tur, ad, arg });
}
if (KAYIT) {
  // efektler ve müzik çağrıldığı an günlüğe (bağlam olmadığı için gerçekte ses çıkmaz)
  for (const ad of Object.keys(FILM_EFEKT)) {
    const f = FILM_EFEKT[ad];
    FILM_EFEKT[ad] = () => {
      sesGunlugeYaz('efekt', ad);
      f();
    };
  }
  const m = filmMuzik as unknown as Record<string, (...a: unknown[]) => void>;
  for (const ad of ['baslat', 'degis', 'kis', 'duraklat', 'dur', 'dosyaCal', 'dosyaSon']) {
    const f = m[ad].bind(filmMuzik);
    m[ad] = (...a: unknown[]) => {
      sesGunlugeYaz('muzik', ad, a[0]);
      f(...a);
    };
  }
}

/** Konuşanın sesi (kim: '' anlatıcı). Kino: kendi sesi varsa o, yoksa anlatıcı sesinin kalın tonu (maceralarla aynı yol) */
export const konusSecenegi = (kim: string): KonusmaSecenegi =>
  kim === 'kino' ? KINO_SESI : { karakter: kim || null, ton: kim === 'mino' ? 1.12 : kim ? 0.9 : 1 };

// Yalnız filmlerin kullandığı arka plan klasörleri (film / malzeme / ev / park) pakete girer: assets/film'de henüz
// filmi olmayan sahneler (orman, plaj, kar …) uygulamayı ~6 MB büyütüyordu. Yeni film yeni bir klasör kullanırsa
// buraya eklenir (tests/unit/film-arka.test.ts denetler).
const FILM_GORSEL = import.meta.glob<string>('../../assets/film/{ev,park,mino-karpuz}/arka-*.webp', { eager: true, query: '?url', import: 'default' });
const PAZAR_GORSEL = import.meta.glob<string>('../../assets/pazar/tezgah.webp', { eager: true, query: '?url', import: 'default' });
/** Şarkı kayıtlarının hece / vuruş tabloları (assets/muzik/<ad>.json; kayıt <ad>-sozlu.mp3, <ad>-sozsuz.mp3) */
const SARKILAR = import.meta.glob<SarkiJson>('../../assets/muzik/*.json', { eager: true, import: 'default' });
const sarkiJson = (ad: string): SarkiJson | undefined => SARKILAR[`../../assets/muzik/${ad}.json`];
/** şarkı dosyasının adı: sözlü (karaoke) ya da sözsüz (fon) */
const sarkiDosyasi = (o: Olay) => `${String(o.ad)}-${o.sozsuz ? 'sozsuz' : 'sozlu'}`;

// ---------------------------------------------------------------- sahne dosyası
export interface Konum {
  x: number;
  y: number;
  w: number;
  z?: number;
  gizli?: boolean;
  /** 1 sağa, -1 sola bakar */
  yon?: 1 | -1;
  don?: number;
  /** bu dünya çizgisinin altı görünmez (kasanın arkasına eğilen karakter) */
  kirp?: number;
  /** gölgenin düştüğü zemin (dünya y): havadaki eşyanın gölgesi yerde kalır */
  zemin?: number;
}
/** Karakterin bir parçasına takılı eşya (ör. Kino'nun kafasındaki elma): parçayla birlikte hareket eder */
export interface TasiTanim {
  /** eşya tipi (görseli) */
  tip: string;
  /** takılan parça: Mino 'govde' | 'kafa' | 'kol-sol' | 'kol-sag'; karakter iskelet katmanı ('kafa', 'govde'…) */
  parca: string;
  /** çizim birimleriyle (Mino 1360×1790 kutusu, karakter 2048) merkez, genişlik, açı */
  x: number;
  y: number;
  w: number;
  don?: number;
  /** olaylarda bu adla bırakılır */
  ad?: string;
}
export interface OyuncuTanim extends Konum {
  /** 'mino' ya da karakter adı (kopek, tavsan, ordek…) */
  tip: string;
  /** true: yan görünüşle (assets/karakter-iskelet/<tip>-profil): yandan yürür / koşar, dururken yandan nefes alır. Çizim sağa bakar (yon: -1 sola) */
  yan?: boolean;
  /** sahne başında parçalarına takılı eşyalar */
  tasi?: TasiTanim[];
  /** sahne başındaki duruş (Oyuncu.durus) */
  durus?: Record<string, number>;
  /** sahne başındaki yüz ifadesi */
  ifade?: string;
}
export interface EsyaTanim extends Konum {
  tip: string;
  katman?: Katman;
  /** yere temas gölgesi */
  golge?: boolean;
  /** "en parlak" eşya: üstünde yumuşak parıltı */
  parla?: boolean;
}
export interface Olay {
  t: number;
  kim: string;
  yap: string;
  [k: string]: unknown;
}
export interface Sahne {
  ad: string;
  sure: number;
  arka: string;
  kamera: [number, number, number];
  isik?: number;
  /** ışığın tonu: akşamüstü (varsayılan) ya da sabah (açık, altın sarısı) */
  isikTon?: 'aksam' | 'sabah';
  /** kes: önceki sahneden doğrudan kesme (iris / kararma yok; konumlar sürer) */
  gecis?: 'iris' | 'karar' | 'kes';
  /** kes geçişinde önceki karenin sönme süresi (sn, varsayılan 0.6) */
  caprazSure?: number;
  oyuncular?: Record<string, OyuncuTanim>;
  esyalar?: Record<string, EsyaTanim>;
  olaylar: Olay[];
  /** kadrajda her zaman tam görünecek oyuncu / eşyalar (kamera olayı "tut" ile değiştirir) */
  tut?: string[];
  /** Mino'nun pazar tezgâhı (tezgah.webp) sahnede dursun mu */
  tezgah?: boolean;
  /** park: orta katman çizimi bu kadar (dünya genişliğinin %'si) sağa kayar (kaydırak ön çalıların arkasında kalmasın) */
  ortaKaydir?: number;
  /**
   * park: orta katman (kaydırak, kum havuzu, ağaç) bu yerdeki (dünya %: x, y alttan; zeminde) nokta çevresinde büyür.
   * Çocuklar boy tablosuyla (src/karakter/boy.ts) büyüyünce kaydırak da orantılı büyüsün, çocuk kaydırağa sığsın.
   */
  ortaBuyut?: { olcek: number; x: number; y: number };
}
export interface FilmDosya {
  baslik: string;
  film: string;
  ogretir?: string;
  /** false: cümleler henüz seslendirme hattına girmez (animatik) */
  seslendir?: boolean;
  /** false: film başında sentez (Web Audio) müziği başlamaz; müzik yalnız sahnedeki dosya olaylarından gelir */
  sentez?: boolean;
  /** kendi çizimi olmayan arka plan / eşyalar için başka filmin klasörü (assets/film/<malzeme>/) */
  malzeme?: string;
  sahneler: (Sahne | { ogut: string })[];
}
/**
 * Katmanlar (arkadan öne): uzak (gök, tepeler) · tezgahlar (pazar tezgâhları, flamalar) · zemin (taş zemin, yan
 * kasalar) · orta (oyuncular, eşyalar) · on. Zemin ön katman derinliğinde (1.25) ama karakterlerin arkasında çizilir:
 * ayaklar ve gölgeler zeminin üstünde kalsın.
 */
type Katman = 'uzak' | 'tezgahlar' | 'zemin' | 'orta' | 'on';
const DERINLIK: Record<Katman, number> = { uzak: 0.55, tezgahlar: 1, zemin: 1.25, orta: 1, on: 1.25 };
/** evde duvar pazarın göğü kadar uzak değil: daha az kayar (oda derinliği) */
const EV_UZAK_DERINLIK = 0.8;

// ---------------------------------------------------------------- eğriler ve tween
const EGRI: Record<string, (u: number) => number> = {
  dogrusal: (u) => u,
  yumusak: (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2),
  cik: (u) => 1 - Math.pow(1 - u, 3),
  dus: (u) => u * u,
  yay: (u) => 1 + 2.4 * Math.pow(u - 1, 3) + 1.4 * Math.pow(u - 1, 2),
};
interface Tween {
  bas: number;
  sure: number;
  egri: (u: number) => number;
  adim: (u: number) => void;
  bitti?: () => void;
}

/** Yerleşik nesne: oyuncu ya da eşya. Film tarafı hareketi (yol, dönme, çevirme, görünürlük) burada. */
class Nesne {
  readonly el: HTMLElement;
  readonly ic: HTMLElement;
  x: number;
  y: number;
  don: number;
  olcek = 1;
  yon: 1 | -1;
  saydam: number;
  /** yürürken film tarafı sekme (Mino gibi yürüyüş hareketi olmayanlar için) */
  sekme = 0;
  /** dünya ekseninde basılma (squash & stretch): + yayvanlaşır, - incelip uzar; alt kenar yerinde kalır */
  ez = 0;
  /** kutunun altındaki boş pay (kutu yüksekliğinin oranı): ayak / eşyanın alt kenarı tam y'de durur */
  alt = 0;
  /** dönme noktasının kutudaki yüksekliği (üstten, 0..1): ezilmede alt kenarı sabit tutmak için */
  merkezY: number;
  /** bu dünya çizgisinin (y) altı görünmez: kasanın arkasına eğilen karakterin zeminin altına inen kısmı */
  kirp: number | null = null;
  /** gölgenin düştüğü zemin (dünya y); null: gölge nesnenin dibinde (temas gölgesi) */
  zemin: number | null = null;
  golge: HTMLElement | null = null;
  /** salla olayının sırası: yenisi gelince eskisi biter */
  sallaNo = 0;
  constructor(readonly k: Konum, cocuk: HTMLElement, readonly oran: number, merkez?: [number, number]) {
    this.x = k.x;
    this.y = k.y;
    this.don = k.don ?? 0;
    this.yon = k.yon ?? 1;
    this.saydam = k.gizli ? 0 : 1;
    this.merkezY = merkez ? merkez[1] / 100 : 0.5;
    this.ic = h('div.fl-ic', merkez ? { style: `transform-origin:${merkez[0]}% ${merkez[1]}%` } : {}, cocuk);
    this.el = h('div.fl-nesne', { style: `width:${k.w}%;aspect-ratio:${oran};z-index:${k.z ?? 5}` }, this.ic);
  }
  /** oyuncunun ayak altı gölgesi (dönmez, çevrilmez) */
  golgeEkle() {
    this.golge = h('i.fl-golge');
    this.el.prepend(this.golge);
  }
  /** kutunun dünya yüksekliği */
  get boy() {
    return this.k.w / this.oran;
  }
  /** dünya ölçüsü (px) */
  uygula() {
    const H = this.boy;
    const alt = this.y - this.alt * H;
    this.el.style.left = `${this.x}%`;
    this.el.style.bottom = `${alt}%`;
    this.el.style.opacity = String(this.saydam);
    // ezilme: dünya ekseninde, alt kenar yerinde kalır (yalnız kullanılınca; eski filmlerde dönüşüm aynı)
    const ez = this.ez ? `translateY(${(this.ez * (1 - this.alt - this.merkezY) * 100).toFixed(2)}%) scale(${(1 + this.ez).toFixed(3)}, ${(1 - this.ez).toFixed(3)}) ` : '';
    this.ic.style.transform = `translateY(${(-this.sekme).toFixed(2)}%) ${ez}rotate(${this.don.toFixed(2)}deg) scale(${(this.yon * this.olcek).toFixed(3)}, ${this.olcek.toFixed(3)})`;
    if (this.kirp !== null) this.el.style.clipPath = `inset(-300% -300% ${Math.max(0, ((this.kirp - alt) / H) * 100).toFixed(2)}% -300%)`;
    else if (this.el.style.clipPath) this.el.style.clipPath = '';
    // gölge: altında boşluk varsa zemine düşer, yükseldikçe küçülüp solar
    if (this.golge) {
      const g = this.golge.style;
      g.bottom = `${(this.alt * 100 - 1.5).toFixed(2)}%`;
      const yuk = this.zemin === null ? 0 : Math.max(0, this.y - this.zemin);
      if (yuk > 0.01 || g.transform) {
        const s = Math.max(0.3, 1 - yuk / (H * 1.6));
        g.transform = yuk > 0.01 ? `translateY(${((yuk / (H * 0.07)) * 100).toFixed(1)}%) scale(${s.toFixed(3)})` : '';
        g.opacity = yuk > 0.01 ? s.toFixed(3) : '';
      }
    }
  }
}

export interface FilmSecenek {
  /** oynatma hızı (test modunda hızlı) */
  hiz?: number;
  /** cihaz sesiyle konuşma (animatik); false: yalnız alt yazı */
  ses?: boolean;
  /** film müziği (Web Audio); test modunda kapalı */
  muzik?: boolean;
  bitti?: () => void;
}

/** Çalan şarkının karaokesi (Film.sarkiBasla) */
interface Karaoke {
  /** başladığı an (film saati, sn) */
  bas: number;
  t: SarkiTablosu;
  heceler: HTMLElement[];
  satirlar: HTMLElement[];
  kutu: HTMLElement;
  top: HTMLElement;
  /** görünen satır, son yanan hece, hece şu an söyleniyor mu */
  satir: number;
  hece: number;
  simdi: boolean;
  /** erken söndürüldüğü an (film saati, sn) */
  bitis: number;
}

export class Film {
  readonly el: HTMLElement;
  private dunya: HTMLElement;
  private katmanlar: Record<Katman, HTMLElement>;
  private isikEl: HTMLElement;
  /** akşam ışığı uzak katmanda biraz daha güçlü */
  private isikUzak: HTMLElement;
  private iris: HTMLElement;
  private altyazi: HTMLElement;
  private altKim: HTMLElement;
  private altMetin: HTMLElement;
  private saat = 0;
  private sahneBas = 0;
  private duraklat = false;
  private raf = 0;
  private son = 0;
  private tweenler: Tween[] = [];
  private bekleyenler: { t: number; coz: () => void }[] = [];
  private olaylar: Olay[] = [];
  private siradaki = 0;
  private nesneler = new Map<string, Nesne>();
  private oyuncular = new Map<string, Oyuncu>();
  private kam = { x: 50, y: 50, z: 1 };
  /** güvenli alan: kadrajda tutulacaklar ve kameranın buna göre yumuşak düzeltmesi */
  private tut: string[] = [];
  private konusan: string | null = null;
  private duzelt = { x: 0, y: 0 };
  private altZaman = 0;
  private bitti = false;
  private tezgahVar = false;
  /** ev arka planı: duvar (uzak) daha az kayar */
  private evMi = false;
  private ortaKaydir = 0;
  private ortaBuyut: Sahne['ortaBuyut'] | null = null;
  private readonly hiz: number;
  private readonly ses: boolean;
  private readonly muzik: boolean;

  constructor(
    private readonly dosya: FilmDosya,
    private readonly secenek: FilmSecenek = {},
  ) {
    this.hiz = secenek.hiz ?? (TEST_MODU ? 12 : 1);
    this.ses = secenek.ses ?? !TEST_MODU;
    this.muzik = secenek.muzik ?? !TEST_MODU;
    this.katmanlar = {
      uzak: h('div.fl-katman.fl-uzak'),
      tezgahlar: h('div.fl-katman.fl-tezgahlar'),
      zemin: h('div.fl-katman.fl-zemin'),
      orta: h('div.fl-katman.fl-orta'),
      on: h('div.fl-katman.fl-on'),
    };
    this.dunya = h('div.fl-dunya', {}, ...Object.values(this.katmanlar));
    this.isikUzak = h('div.fl-isik-uzak');
    this.isikEl = h('div.fl-isik');
    this.iris = h('div.fl-iris', {}, h('i'));
    this.altKim = h('b.fl-alt-kim');
    this.altMetin = h('span.fl-alt-metin');
    this.altyazi = h('div.fl-altyazi', { 'aria-live': 'polite' }, this.altKim, this.altMetin);
    this.el = h('div.fl-sahne', {}, this.dunya, this.isikEl, this.iris, this.altyazi);
    this.onYukle();
  }

  /** Bütün sahnelerin görselleri baştan yüklenmeye başlar: sonraki sahneler açılınca eşyalar geç belirmesin */
  private onYukle() {
    const d = this.dosya;
    const adresler = new Set<string>();
    for (const x of ['arka-uzak', 'arka-orta', 'arka-orta-2', 'arka-on']) {
      const u = FILM_GORSEL[`../../assets/film/${d.film}/${x}.webp`] ?? (d.malzeme ? FILM_GORSEL[`../../assets/film/${d.malzeme}/${x}.webp`] : undefined);
      if (u) adresler.add(u);
    }
    for (const s of d.sahneler) {
      if ('ogut' in s) continue;
      // şarkı kaydı önceden çözülür: karaoke film saatiyle ilerler, kayıt geç başlamasın
      const c = baglam();
      if (c)
        for (const o of s.olaylar) {
          if (o.kim === 'sarki' && o.yap === 'basla') void dosyaTamponu(c, sarkiDosyasi(o));
          // sahnenin dosya müzikleri de (geç inen parça olayından sonra başlamasın)
          else if (this.muzik && o.kim === 'muzik' && o.yap === 'dosya') void dosyaTamponu(c, String(o.ad));
        }
      for (const e of Object.values(s.esyalar ?? {})) {
        const u = esyaAdresi(e.tip, d.film, d.malzeme);
        if (u) adresler.add(u);
      }
      for (const o of Object.values(s.oyuncular ?? {})) {
        for (const t of o.tasi ?? []) {
          const u = esyaAdresi(t.tip, d.film, d.malzeme);
          if (u) adresler.add(u);
        }
        // karakter iskeletleri (önden ve yandan) önceden indirilir / ölçülür: sahne açılınca gecikme olmasın
        if (o.tip !== 'mino') {
          if (o.yan) void yandanYukle(o.tip);
          else if (iskeletVar(o.tip)) void svgGetir(o.tip);
        }
      }
    }
    for (const u of adresler) new Image().src = u;
  }

  /** Oynatmayı başlatır (çözülünce film bitmiştir) */
  async oynat(): Promise<void> {
    this.son = performance.now();
    this.raf = requestAnimationFrame((t) => this.kare(t));
    if (this.muzik && this.dosya.sentez !== false) filmMuzik.baslat('nese');
    const liste = this.dosya.sahneler;
    for (const [i, s] of liste.entries()) {
      if (this.bitti) return;
      if ('ogut' in s) {
        this.el.dataset.bitti = '1';
        break;
      }
      const sonraki = liste[i + 1];
      await this.sahneOyna(s, !!sonraki && !('ogut' in sonraki) && sonraki.gecis === 'kes');
    }
    if (this.muzik) filmMuzik.dur(4);
    this.secenek.bitti?.();
  }

  get duraklatildi() {
    return this.duraklat;
  }

  duraklatDegistir(d = !this.duraklat) {
    this.duraklat = d;
    this.el.classList.toggle('duraklatildi', d);
    this.el.getAnimations({ subtree: true }).forEach((a) => (d ? a.pause() : a.play()));
    this.oyuncular.forEach((o) => o.duraklat(d));
    if (d) sus();
    if (this.muzik) filmMuzik.duraklat(d);
  }

  kapat() {
    this.bitti = true;
    cancelAnimationFrame(this.raf);
    this.oyuncular.forEach((o) => o.kapat());
    sus();
    if (this.muzik) filmMuzik.dur(0.5);
  }

  // ---------------------------------------------------------------- saat
  private kare(t: number) {
    this.raf = requestAnimationFrame((x) => this.kare(x));
    const dt = Math.min(0.1, (t - this.son) / 1000);
    this.son = t;
    if (!this.duraklat) this.saat += dt * this.hiz;
    const s = this.saat;
    // olaylar
    while (this.siradaki < this.olaylar.length && this.olaylar[this.siradaki].t <= s - this.sahneBas) this.olayYap(this.olaylar[this.siradaki++]);
    // tween'ler
    this.tweenler = this.tweenler.filter((tw) => {
      const u = Math.min(1, Math.max(0, (s - tw.bas) / Math.max(1e-6, tw.sure)));
      tw.adim(tw.egri(u));
      if (u >= 1) tw.bitti?.();
      return u < 1;
    });
    // beklemeler
    this.bekleyenler = this.bekleyenler.filter((b) => (s >= b.t ? (b.coz(), false) : true));
    if (this.altZaman && s > this.altZaman) {
      this.altZaman = 0;
      this.altyazi.classList.remove('acik');
    }
    this.nesneler.forEach((n) => n.uygula());
    this.kameraUygula();
    if (this.karaoke) this.karaokeGuncelle(this.karaoke);
  }

  /** film saatiyle bekle (sn) */
  private bekle(sn: number): Promise<void> {
    return new Promise((coz) => this.bekleyenler.push({ t: this.saat + sn, coz }));
  }

  private tween(sure: number, egri: string | undefined, adim: (u: number) => void, bitti?: () => void) {
    this.tweenler.push({ bas: this.saat, sure: Math.max(0.001, sure), egri: EGRI[egri ?? 'yumusak'] ?? EGRI.yumusak, adim, bitti });
  }

  // ---------------------------------------------------------------- sahne
  /** kesme: sonraki sahne doğrudan başlar (kapanış geçişi ve bekleme yok) */
  private async sahneOyna(s: Sahne, kesme = false) {
    // kesme bile sert değil: önceki sahnenin son karesi yeni sahnenin üstünde yumuşakça söner (çapraz geçiş)
    const onceki = s.gecis === 'kes' && this.dunya.childElementCount && this.katmanlar.orta.childElementCount ? (this.dunya.cloneNode(true) as HTMLElement) : null;
    const eskiKam = { ...this.kam };
    this.kur(s);
    if (onceki) {
      this.capraz(onceki, Number(s.caprazSure ?? 0.6));
      // kamera da yeni çerçeveye sıçramaz: önceki sahnenin kadrajından süzülerek gelir (sahnenin kendi kamera olayı bunu ezer)
      const hedef = { ...this.kam };
      this.kam = eskiKam;
      this.tween(1, 'yumusak', (u) => {
        this.kam = { x: eskiKam.x + (hedef.x - eskiKam.x) * u, y: eskiKam.y + (hedef.y - eskiKam.y) * u, z: eskiKam.z + (hedef.z - eskiKam.z) * u };
      });
    }
    this.sahneBas = this.saat;
    this.olaylar = [...s.olaylar].sort((a, b) => a.t - b.t);
    this.siradaki = 0;
    if (s.gecis !== 'kes') this.gecis(true, s.gecis);
    await this.bekle(s.sure);
    if (this.bitti || kesme) return;
    this.gecis(false, s.gecis === 'kes' ? 'iris' : s.gecis);
    await this.bekle(0.7);
    this.altyazi.classList.remove('acik');
  }

  private kur(s: Sahne) {
    this.oyuncular.forEach((o) => o.kapat());
    this.oyuncular.clear();
    this.nesneler.clear();
    // önceki sahnenin süren tween'leri (kesmede kamera / yol) yeni sahneye karışmasın
    this.tweenler = [];
    Object.values(this.katmanlar).forEach((k) => k.replaceChildren());
    this.tezgahVar = !!s.tezgah;
    this.evMi = s.arka === 'ev';
    this.ortaKaydir = s.ortaKaydir ?? 0;
    this.ortaBuyut = s.ortaBuyut ?? null;
    this.arka(s.arka);
    for (const [id, o] of Object.entries(s.oyuncular ?? {})) {
      const oy = new Oyuncu(o.tip, this.hiz, !!o.yan);
      const n = new Nesne(o, oy.el, oy.oran);
      n.el.dataset.oyuncu = id;
      n.alt = oy.alt;
      n.merkezY = 0.6;
      n.kirp = o.kirp ?? null;
      n.zemin = o.zemin ?? null;
      n.golgeEkle();
      for (const t of o.tasi ?? []) oy.tasi(t.ad ?? t.tip, esyaAdresi(t.tip, this.dosya.film, this.dosya.malzeme) ?? '', t.parca, t.x, t.y, t.w, (ESYA_ORAN[t.tip] ?? 1), t.don ?? 0);
      if (o.durus) oy.durus(o.durus, 0);
      if (o.ifade) oy.ifade(o.ifade);
      this.oyuncular.set(id, oy);
      this.nesneler.set(id, n);
      this.katmanlar.orta.append(n.el);
    }
    for (const [id, e] of Object.entries(s.esyalar ?? {})) {
      const n = new Nesne(e, esyaCiz(e.tip, this.dosya.film, this.dosya.malzeme), ESYA_ORAN[e.tip] ?? 1, ESYA_MERKEZ[e.tip]);
      n.el.dataset.esya = id;
      n.el.dataset.tip = e.tip;
      this.esyaTip.set(id, e.tip);
      n.alt = ESYA_ALT[e.tip] ?? 0;
      n.kirp = e.kirp ?? null;
      n.zemin = e.zemin ?? null;
      // karakter pozları (mino-sarilma) oyuncu gibi gölgeli
      if (e.tip.startsWith('mino-') || e.golge) n.golgeEkle();
      if (e.parla) n.ic.append(h('i.fl-parla'));
      this.nesneler.set(id, n);
      this.katmanlar[e.katman ?? 'orta'].append(n.el);
    }
    this.kam = { x: s.kamera[0], y: s.kamera[1], z: s.kamera[2] };
    this.tut = s.tut ?? [];
    this.konusan = null;
    this.duzelt = { x: 0, y: 0 };
    this.ilkKare = true;
    this.isikAyarla(s.isik ?? 0);
    this.el.classList.toggle('sabah', s.isikTon === 'sabah');
    this.el.dataset.sahne = s.ad;
  }

  /**
   * Arka plan. Pazar: filmin katmanlı çizimi (assets/film/<film>/arka-uzak, -orta, -on; ortak 16:9 çerçeve) dünyanın
   * altına tam genişlikte oturur; uzak katmanın üstü gök rengiyle devam eder. Mino'nun tezgâhı istenirse ortada.
   */
  private arka(ad: string) {
    this.katmanlar.uzak.classList.toggle('fl-ev', ad === 'ev');
    // Ev (assets/film/ev): uzak (duvar, pencere, saat) · orta (kanepe, lamba, kitaplık) · ön (tahta zemin, halı, sepet,
    // küpler, tren). Orta ve ön oyuncularla aynı derinlikte (ayaklar zeminden kaymaz; kanepedeki oturuş yerinde kalır);
    // duvar biraz geride (EV_UZAK_DERINLIK) ve 1.2 büyük çizilir: yakınlaşınca üstünde boşluk görünmez.
    if (ad === 'ev') {
      const resimE = (x: string, sinif = '') => h(`img.fl-arka${sinif}`, { src: FILM_GORSEL[`../../assets/film/ev/${x}.webp`] ?? '', alt: '', draggable: 'false' });
      this.katmanlar.uzak.append(resimE('arka-uzak', '.fl-ev-duvar'), this.isikUzak);
      this.katmanlar.tezgahlar.append(resimE('arka-orta'), resimE('arka-on'));
      // dikey / kare MP4 kadrajında dünyanın altı görünür: tahta zemin aşağı sürer
      if (document.body.dataset.kadraj === 'dolu') this.katmanlar.zemin.append(h('div.fl-zemin-alt.fl-ev-zemin'));
      return;
    }
    // Park (assets/film/park): uzak (gök, tepeler) · orta ya da orta-2 (salıncak / kaydırak, ağaçlar, bank) · ön (çimen, çalılar).
    // 'park': kaydırak ve kum havuzlu ikinci orta katman; 'park-salincak': salıncak, çit ve tahterevalli.
    if (ad === 'park' || ad === 'park-salincak') {
      const resimP = (x: string) => h('img.fl-arka', { src: FILM_GORSEL[`../../assets/film/park/${x}.webp`] ?? '', alt: '', draggable: 'false' });
      this.katmanlar.uzak.append(resimP('arka-uzak'), this.isikUzak);
      const orta = resimP(ad === 'park' ? 'arka-orta-2' : 'arka-orta');
      // orta katmanı yana kaydır (%): kaydırak, ön çalıların arkasında kalmasın
      if (this.ortaKaydir) orta.style.left = `${this.ortaKaydir}%`;
      // orta katmanı zemindeki bir nokta çevresinde büyüt (resim dünyanın altında, 16:9: yüksekliği dünyanın %56.25'i)
      const b = this.ortaBuyut;
      if (b) {
        const H = (100 * 9) / 16;
        orta.style.transformOrigin = `${(b.x - this.ortaKaydir).toFixed(2)}% ${(((H - b.y) / H) * 100).toFixed(2)}%`;
        orta.style.transform = `scale(${b.olcek})`;
      }
      // çimen (arka-on) altta, oyun aletleri onun ÜSTÜNDE: kaydırak ve kum havuzu çimenin arkasında kalmasın; hepsi
      // oyuncularla aynı derinlikte (kamera yakınlaşınca ayaklar zeminden kaymaz)
      this.katmanlar.tezgahlar.append(resimP('arka-on'), orta);
      // dikey / kare MP4 kadrajında dünyanın altı görünür: çimen aşağı sürer
      if (document.body.dataset.kadraj === 'dolu') this.katmanlar.zemin.append(h('div.fl-zemin-alt.fl-park-zemin'));
      return;
    }
    if (ad !== 'pazar') return;
    // filmin kendi çizimi yoksa ortak malzeme klasörü (ör. Elma Kulesi karpuz filminin pazarını kullanır)
    const film = (x: string) => FILM_GORSEL[`../../assets/film/${this.dosya.film}/${x}.webp`] ?? (this.dosya.malzeme ? FILM_GORSEL[`../../assets/film/${this.dosya.malzeme}/${x}.webp`] : undefined) ?? '';
    const resim = (x: string) => h('img.fl-arka', { src: film(x), alt: '', draggable: 'false' });
    this.katmanlar.uzak.append(resim('arka-uzak'), this.isikUzak);
    this.katmanlar.tezgahlar.append(resim('arka-orta'));
    this.katmanlar.zemin.append(resim('arka-on'));
    // dikey / kare MP4 kadrajında dünyanın altı görünür: taş zemin aşağı doğru sürer
    if (document.body.dataset.kadraj === 'dolu') {
      // kasasız taş zemin uzantısı (scripts/film/zemin-uzanti.mjs): dikey ayna / düz / ayna dizilir, dikiş olmaz
      const zemin = film('arka-zemin') || film('arka-on');
      const bant = (ayna: boolean) => h(`img${ayna ? '.ayna' : ''}`, { src: zemin, alt: '', draggable: 'false' });
      this.katmanlar.zemin.append(h('div.fl-zemin-alt', {}, bant(true), bant(false), bant(true)));
    }
    if (this.tezgahVar) {
      const stand = new Nesne({ x: 50, y: 5, w: 62, z: 1 }, h('img.fl-esya-resim', { src: PAZAR_GORSEL['../../assets/pazar/tezgah.webp'] ?? '', alt: '', draggable: 'false' }), 1);
      stand.el.dataset.esya = 'stand';
      this.nesneler.set('stand', stand);
      this.katmanlar.orta.append(stand.el);
    }
  }

  private isikAyarla(v: number) {
    this.isikEl.style.opacity = String(v);
    this.isikUzak.style.opacity = String(Math.min(1, v * 0.8));
  }

  // ---------------------------------------------------------------- kamera
  private ilkKare = true;

  /**
   * Güvenli alan: konuşan karakter ve "tut" listesindekiler kadrajdan taşmasın. Kamera hedefi korunur, yalnız
   * gerektiği kadar (yumuşakça) kaydırılır. Sığmıyorsa bu nesnelerin ortasına bakılır.
   */
  /** MP4 dikey / kare kadraj (?kadraj=dolu): kamera ek yakınlığı (tut alanına göre, yumuşak) */
  private zCarpan = 1;
  private dolu(W: number, H: number) {
    return document.body.dataset.kadraj === 'dolu' && H >= W;
  }

  private guvenliAlan(W: number, H: number, S: number) {
    const idler = [...new Set([...this.tut, ...(this.konusan ? [this.konusan] : [])])];
    let l = Infinity, r = -Infinity, ust = Infinity, alt = -Infinity;
    for (const id of idler) {
      const n = this.nesneler.get(id);
      if (!n || n.saydam < 0.5) continue;
      const w = n.k.w * n.olcek;
      const hh = w / n.oran;
      l = Math.min(l, n.x - w / 2);
      r = Math.max(r, n.x + w / 2);
      ust = Math.min(ust, 100 - (n.y + hh));
      alt = Math.max(alt, 100 - n.y);
    }
    let hx = 0, hy = 0;
    if (l < Infinity) {
      const vw = (100 * W) / (S * this.kam.z * this.zCarpan);
      const vh = (100 * H) / (S * this.kam.z * this.zCarpan);
      const m = 3;
      const x = this.kam.x;
      const y = this.kam.y;
      const kx = r - l + 2 * m > vw ? (l + r) / 2 : Math.min(l - m + vw / 2, Math.max(r + m - vw / 2, x));
      const ky = alt - ust + 2 * m > vh ? (ust + alt) / 2 : Math.min(ust - m + vh / 2, Math.max(alt + m - vh / 2, y));
      hx = kx - x;
      hy = ky - y;
    }
    // duraklatılmışken kamera tamamen durur (yumuşak düzeltme de beklemede kalır)
    if (this.duraklat && !this.ilkKare) return;
    // dikey / kare: karakterler ekran yüksekliğinin ~%40'ı olacak kadar yaklaş; tut alanı sığmıyorsa sığacak kadar
    if (this.dolu(W, H)) {
      const hedef = H > W * 1.3 ? 1.5 : 1.28;
      const c = l < Infinity ? Math.min(hedef, Math.max(0.75, 1 / this.kam.z, (100 * W) / (S * this.kam.z * (r - l + 8)))) : hedef;
      this.zCarpan += (c - this.zCarpan) * (this.ilkKare ? 1 : 0.06);
    }
    const k = this.ilkKare ? 1 : 0.12;
    this.ilkKare = false;
    this.duzelt.x += (hx - this.duzelt.x) * k;
    this.duzelt.y += (hy - this.duzelt.y) * k;
  }

  private kameraUygula() {
    const W = this.el.clientWidth;
    const H = this.el.clientHeight;
    const S = Math.max(W, H);
    this.dunya.style.width = this.dunya.style.height = `${S}px`;
    this.guvenliAlan(W, H, S);
    // MP4 dikey / kare kadraj (?kadraj=dolu): dünyanın altı taş zeminle sürer (fl-zemin-alt), sahne alt üçte bire çıkar
    // pay, zemin bantlarının (ayna + düz: dünyanın ~%19'u) ekrandaki yüksekliğini aşmasın: uzaklaşınca altta boşluk kalmasın
    const pay = this.dolu(W, H) ? Math.min(H * (H > W * 1.3 ? 0.16 : 0.1), 0.17 * S * this.kam.z * this.zCarpan) : 0;
    for (const [ad, el] of Object.entries(this.katmanlar) as [Katman, HTMLElement][]) {
      const d = ad === 'uzak' && this.evMi ? EV_UZAK_DERINLIK : DERINLIK[ad];
      const z = 1 + (this.kam.z * this.zCarpan - 1) * d;
      const fx = S / 2 + (((this.kam.x + this.duzelt.x) / 100) * S - S / 2) * d;
      const fy = S / 2 + (((this.kam.y + this.duzelt.y) / 100) * S - S / 2) * d;
      let tx = W / 2 - fx * z;
      let ty = H / 2 - fy * z;
      // dünyanın kenarı görünmesin
      tx = Math.min(0, Math.max(W - S * z, tx));
      ty = Math.min(0, Math.max(H - S * z - pay, ty - pay * 0.85));
      el.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${z.toFixed(4)})`;
    }
  }

  // ---------------------------------------------------------------- geçiş
  /** Çapraz geçiş: önceki sahnenin kopyası yeni dünyanın hemen üstünde (ışık ve alt yazının altında) söner */
  private capraz(kopya: HTMLElement, sure: number) {
    kopya.classList.add('fl-capraz');
    kopya.setAttribute('aria-hidden', 'true');
    // kopya yalnız resim: oyuncu / eşya adları ve katman adı taşımaz (seçiciler yeni sahneyi bulsun)
    for (const e of kopya.querySelectorAll<HTMLElement>('[data-oyuncu],[data-esya],[data-tip],[data-tasinan]')) {
      delete e.dataset.oyuncu;
      delete e.dataset.esya;
      delete e.dataset.tip;
      delete e.dataset.tasinan;
    }
    kopya.querySelector('.fl-orta')?.classList.replace('fl-orta', 'fl-orta-kopya');
    // Karakterler ve eşyalar yarı saydam görünmesin (başka kadrajın gökyüzü üstünde grimsi hayalet olur): kopyada yalnız
    // arka plan kalır, kopya yeni dünyanın ALTINDA tam opak durur; yeni sahnenin arka plan katmanları üstünde belirir,
    // oyuncular ve eşyalar (orta katman) baştan tam opak.
    kopya.querySelectorAll('.fl-orta-kopya, .fl-on').forEach((e) => e.remove());
    // kopyadaki SVG kimlikleri yeni sahnedekilerden sonra gelsin (url(#…) yeni çizimi göstersin)
    this.dunya.after(kopya);
    kopya.style.zIndex = '0';
    this.dunya.style.zIndex = '1';
    const arka = [this.katmanlar.uzak, this.katmanlar.tezgahlar, this.katmanlar.zemin, this.katmanlar.on];
    const yaz = (v: string) => arka.forEach((k) => (k.style.opacity = v));
    yaz('0');
    this.tween(sure, 'yumusak', (u) => yaz(String(u)), () => {
      yaz('');
      kopya.remove();
    });
  }

  private gecis(ac: boolean, tur: Sahne['gecis'] = 'iris') {
    const i = this.iris;
    i.classList.toggle('karar', tur === 'karar');
    const [a, b] = ac ? [0, 1] : [1, 0];
    this.tween(0.7, ac ? 'cik' : 'dus', (u) => {
      const v = a + (b - a) * u;
      i.style.setProperty('--iris', String(v));
    });
  }

  // ---------------------------------------------------------------- olaylar
  private olayYap(o: Olay) {
    const sure = Number(o.sure ?? 0.8);
    const egri = o.egri as string | undefined;
    if (o.kim === 'kamera') {
      if (Array.isArray(o.tut)) this.tut = o.tut as string[];
      const a = { ...this.kam };
      const [x, y, z] = [Number(o.x ?? a.x), Number(o.y ?? a.y), Number(o.z ?? a.z)];
      this.tween(sure, egri ?? 'yumusak', (u) => {
        this.kam = { x: a.x + (x - a.x) * u, y: a.y + (y - a.y) * u, z: a.z + (z - a.z) * u };
      });
      return;
    }
    if (o.kim === 'isik') {
      const a = Number(this.isikEl.style.opacity || 0);
      const b = Number(o.deger ?? 0);
      this.tween(sure, 'yumusak', (u) => this.isikAyarla(a + (b - a) * u));
      return;
    }
    if (o.kim === 'muzik') {
      if (!this.muzik) return;
      if (o.yap === 'ruh') filmMuzik.degis(String(o.ad) as Ruh);
      else if (o.yap === 'dur') filmMuzik.dur(Number(o.sure ?? 2));
      // dosya müziği (assets/muzik/film-*.mp3): { yap: 'dosya', ad: 'film-merak', ses, dongu, gec, ustune }; 'dosya-dur': söner
      else if (o.yap === 'dosya') filmMuzik.dosyaCal({ ad: String(o.ad), ses: o.ses as number | undefined, dongu: o.dongu as boolean | undefined, gec: o.gec as number | undefined, ustune: o.ustune as boolean | undefined } satisfies DosyaSecenegi);
      else if (o.yap === 'dosya-dur') filmMuzik.dosyaSon(Number(o.sure ?? 1.5));
      // durdurulan müzik yeniden (ör. hüzünlü sessizlikten sonra yumuşak tema)
      else if (o.yap === 'baslat') filmMuzik.baslat(String(o.ad ?? 'nese') as Ruh);
      return;
    }
    if (o.kim === 'toz') {
      this.toz(Number(o.x), Number(o.y), Number(o.adet ?? 5), Number(o.yon ?? 0), Number(o.boy ?? 1));
      return;
    }
    if (o.kim === 'efekt') {
      FILM_EFEKT[o.yap]?.();
      return;
    }
    if (o.kim === 'parilti') {
      this.parilti(Number(o.x), Number(o.y));
      return;
    }
    if (o.kim === 'anlatici') {
      if (o.yap === 'soyle') this.soyle('', String(o.metin), o.sure as number | undefined);
      return;
    }
    if (o.kim === 'sarki') {
      if (o.yap === 'basla') this.sarkiBasla(o);
      else if (o.yap === 'dur') this.sarkiBitir(Number(o.sure ?? 1.2));
      return;
    }
    const n = this.nesneler.get(o.kim);
    const oy = this.oyuncular.get(o.kim);
    if (!n) return;
    switch (o.yap) {
      case 'git': {
        const a = { x: n.x, y: n.y, don: n.don, olcek: n.olcek, ez: n.ez };
        const b = { x: Number(o.x ?? a.x), y: Number(o.y ?? a.y), don: Number(o.don ?? a.don), olcek: Number(o.olcek ?? a.olcek), ez: Number(o.ez ?? a.ez) };
        const yay = Number(o.yay ?? 0);
        const yuru = o.yuru !== false && !!oy;
        // önden çizimi asimetrik karakterler (Kino'nun göz lekesi) yürürken aynalanmaz
        // cevir: false → yön değişmez (küçük yan adım: patiler yer değiştirmesin)
        if (yuru && b.x !== a.x && !oy?.yonSabit && o.cevir !== false) n.yon = b.x > a.x ? 1 : -1;
        // Mino yana yürürken yandan iskeletiyle gerçek adım atar; yolu kısaysa ya da profil yoksa önden seker
        const adim = yuru && oy ? oy.yuru(sure / this.hiz, Math.abs(b.x - a.x) / n.k.w, o.stil as string | undefined) : null;
        const sek = !!adim && !adim.kendi;
        this.tween(sure, egri ?? (yuru ? 'dogrusal' : 'yumusak'), (u) => {
          n.x = a.x + (b.x - a.x) * u;
          n.y = a.y + (b.y - a.y) * u + yay * 4 * u * (1 - u);
          n.don = a.don + (b.don - a.don) * u;
          n.olcek = a.olcek + (b.olcek - a.olcek) * u;
          n.ez = a.ez + (b.ez - a.ez) * u;
          n.sekme = sek ? Math.abs(Math.sin(u * Math.PI * Math.max(2, Math.round(sure * 3)))) * 5 : 0;
        }, () => {
          n.sekme = 0;
          if (adim) oy?.yuruBitti(adim.no);
        });
        return;
      }
      case 'don':
        n.yon = Number(o.yon) === -1 ? -1 : 1;
        return;
      case 'yer':
        // anında konum (ışınlama): x, y, don, olcek, ez, yon verilenler değişir (yolculuk yok; üst üste tween'lerin başlangıç karışıklığı olmaz)
        n.x = Number(o.x ?? n.x);
        n.y = Number(o.y ?? n.y);
        n.don = Number(o.don ?? n.don);
        n.olcek = Number(o.olcek ?? n.olcek);
        n.ez = Number(o.ez ?? n.ez);
        if (o.yon !== undefined) n.yon = Number(o.yon) === -1 ? -1 : 1;
        return;
      case 'yerine': {
        // Aynı karakterin başka görünümü (ör. yandan koşan Kino → önden Kino): bu oyuncu gizlenir, hedef oyuncu aynı yerde
        // belirir (konum, açı, ezilme, ölçek aktarılır); gelen çizim yatayda kısa bir sıkışmayla açılır (dönüş hissi)
        const n2 = this.nesneler.get(String(o.hedef));
        if (!n2) return;
        n2.x = Number(o.x ?? n.x);
        n2.y = Number(o.y ?? n.y);
        n2.don = n.don;
        n2.olcek = n.olcek;
        n2.sekme = 0;
        if (o.yon !== undefined) n2.yon = Number(o.yon) === -1 ? -1 : 1;
        oy?.dur();
        // iki çizim kısa bir çapraz geçişle yer değiştirir (birden belirme yok)
        n2.saydam = 0;
        this.tween(0.24, 'cik', (u) => {
          n2.ez = 0.16 * (1 - u);
          n2.saydam = Math.min(1, u * 2.2);
          n.saydam = Math.max(0, 1 - u * 1.6);
        }, () => {
          n2.ez = 0;
          n2.saydam = 1;
          n.saydam = 0;
        });
        return;
      }
      case 'goster':
      case 'gizle': {
        const a = n.saydam;
        const b = o.yap === 'goster' ? 1 : 0;
        this.tween(Number(o.sure ?? 0.3), 'yumusak', (u) => (n.saydam = a + (b - a) * u));
        return;
      }
      case 'titre': {
        const a = n.don;
        this.tween(sure, 'dogrusal', (u) => (n.don = a + Math.sin(u * Math.PI * 14) * 4 * (1 - u)));
        return;
      }
      case 'bas': {
        // çarpma: basılıp toparlanır
        this.tween(Number(o.sure ?? 0.35), 'dogrusal', (u) => (n.olcek = 1 - 0.12 * Math.sin(u * Math.PI) * (1 - u)));
        return;
      }
      case 'tepki':
        oy?.tepki(String(o.ad), o.sure === undefined ? undefined : Number(o.sure) / this.hiz);
        return;
      case 'ifade':
        oy?.ifade(o.ad ? String(o.ad) : null, o.sure === undefined ? 0 : (Number(o.sure) * 1000) / this.hiz);
        return;
      case 'soyle': {
        // agiz: konuşanın sesi kim'den, ağzı başka bir oyuncudan (ör. yan görünüşteki Kino: kim 'kino', agiz 'kinoy')
        const agizId = o.agiz ? String(o.agiz) : undefined;
        this.soyle(o.kim, String(o.metin), o.sure as number | undefined, agizId ? this.oyuncular.get(agizId) : oy, agizId);
        return;
      }
      case 'sek':
        this.sek(n, o, sure);
        return;
      case 'salla': {
        // sallanma: kökünden açı (don) ya da yatay (x) salınım; sonum: gittikçe söner, zarf: yumuşak başlar / biter
        const no = ++n.sallaNo;
        const eksen = o.eksen === 'x' ? 'x' : 'don';
        const A = Number(o.genlik ?? 8);
        const f = Number(o.hiz ?? 2);
        const sonum = o.sonum !== false;
        let son = 0;
        this.tween(sure, 'dogrusal', (u) => {
          // yenisi başladıysa bu salınımın payı geri alınır, eşya kendi yerinden devam eder
          if (no !== n.sallaNo) {
            n[eksen] -= son;
            son = 0;
            return;
          }
          const z = sonum ? Math.pow(1 - u, 1.5) : Math.min(1, u / 0.08, (1 - u) / 0.12);
          const v = A * Math.sin(u * sure * f * Math.PI * 2) * z;
          n[eksen] += v - son;
          son = v;
        });
        return;
      }
      case 'kirp':
        n.kirp = o.y === null || o.y === undefined ? null : Number(o.y);
        return;
      case 'zemin':
        n.zemin = o.y === null || o.y === undefined ? null : Number(o.y);
        return;
      case 'z':
        n.el.style.zIndex = String(o.z);
        return;
      case 'parla':
        // eşyanın üstünde minik yıldız ışıltı (acik: false kaldırır)
        n.ic.querySelector(':scope > .fl-parla')?.remove();
        if (o.acik !== false) n.ic.append(h('i.fl-parla'));
        return;
      case 'durus':
        oy?.durus(o as unknown as Record<string, number>, Number(o.sure ?? 0.4) / this.hiz);
        return;
      case 'ek':
        oy?.ek(String(o.ad), o.acik !== false);
        return;
      case 'bak':
        oy?.bak(Number(o.yon ?? 0));
        return;
      case 'al':
        this.al(o.kim, String(o.esya), String(o.parca ?? 'govde'));
        return;
      case 'birak':
        this.birak(o.kim, String(o.esya), o.parca as string | undefined);
        return;
    }
  }

  /**
   * Sekerek yuvarlanma (elmalar, top): hedef x'e giderken zıplar; her inişte basılır (squash), sekme yüksekliği
   * azalır, yuvarlak eşya yol boyunca kendi çevresinde döner. Gölge zeminde kalır.
   * o: x, y (zemin), yukseklik (ilk sekme; 0: düz yuvarlanır), sekme (iniş sayısı), efekt (her inişte), don (ek dönüş)
   */
  private sek(n: Nesne, o: Olay, sure: number) {
    const a = { x: n.x, y: n.y, don: n.don };
    const hx = Number(o.x ?? a.x);
    const zemin = Number(o.y ?? a.y);
    const h0 = Number(o.yukseklik ?? 6);
    const say = Math.max(1, Math.round(Number(o.sekme ?? 3)));
    const efekt = o.efekt as string | undefined;
    const yuvarla = o.yuvarla !== false;
    n.zemin = zemin;
    // parçalar: [düşüş (başlangıç yüksekliğinden), sekme 1…, yerde yuvarlanma]; süreler √yükseklikle orantılı
    const dus = Math.max(0, a.y - zemin);
    const yuk = Array.from({ length: say - 1 }, (_, i) => h0 * Math.pow(0.42, i));
    const pay = [Math.sqrt(dus + 0.05), ...yuk.map((y) => 2 * Math.sqrt(y))];
    const yuvarlanma = Number(o.yuvarlan ?? 0.35);
    pay.push(pay.reduce((s, x) => s + x, 0) * yuvarlanma);
    const top = pay.reduce((s, x) => s + x, 0);
    const sinir: number[] = [];
    pay.reduce((s, x) => (sinir.push((s + x) / top), s + x), 0);
    // her inişten önceki yükseklik (basılmanın gücü)
    const inisYuk = [dus, ...yuk];
    // dönüş: yuvarlanan yol / çevre (eşyanın genişliğine göre) + istenen ek dönüş
    const cevre = Math.PI * n.k.w * 0.85;
    const donus = (yuvarla ? ((hx - a.x) / cevre) * 360 : 0) + Number(o.don ?? 0);
    let inisSay = 0;
    const ezSure = 0.09;
    this.tween(sure, 'dogrusal', (u) => {
      // yatay: yavaşlayarak (sürtünme)
      const ux = 1 - Math.pow(1 - u, 1.8);
      n.x = a.x + (hx - a.x) * ux;
      n.don = a.don + donus * ux;
      let i = sinir.findIndex((s) => u < s);
      if (i < 0) i = pay.length - 1;
      const bas = i === 0 ? 0 : sinir[i - 1];
      const v = Math.min(1, (u - bas) / Math.max(1e-6, sinir[i] - bas));
      if (i === 0) n.y = zemin + dus * (1 - v * v); // yerçekimiyle hızlanan düşüş
      else if (i <= yuk.length) n.y = zemin + yuk[i - 1] * 4 * v * (1 - v);
      else n.y = zemin;
      // iniş: efekt + basılıp toparlanma (squash)
      if (i > inisSay && inisSay < inisYuk.length) {
        inisSay = i;
        if (efekt) FILM_EFEKT[efekt]?.();
      }
      const d = i === 0 ? 1 : (u - sinir[i - 1]) * sure;
      const guc = i === 0 ? 0 : Math.min(0.22, 0.06 + (inisYuk[i - 1] ?? 0) * 0.03);
      n.ez = d < ezSure && i <= inisYuk.length ? guc * Math.sin((d / ezSure) * Math.PI) : 0;
    }, () => {
      n.y = zemin;
      n.ez = 0;
    });
  }

  // ---------------------------------------------------------------- taşıma (eşya ↔ karakter parçası)
  /** orta katmanın ekrandaki kutusu: ekran ↔ dünya dönüşümü */
  private dunyaya(sx: number, sy: number) {
    const L = this.katmanlar.orta.getBoundingClientRect();
    return { x: ((sx - L.left) / L.width) * 100, y: ((L.bottom - sy) / L.height) * 100, olcek: L.width / 100 };
  }

  /**
   * Eşya karakterin parçasına geçer (ör. Mino elmayı alır): eşya olduğu yerde gizlenir, aynı yerde, aynı boyda
   * parçaya takılı bir kopya görünür; parça dönünce o da döner. Fark görünmez.
   */
  private al(kim: string, esya: string, parca: string) {
    const oy = this.oyuncular.get(kim);
    const n = this.nesneler.get(esya);
    if (!oy || !n) return;
    const r = n.el.getBoundingClientRect();
    const tip = (this.esyaTip.get(esya) ?? esya);
    oy.al(esya, esyaAdresi(tip, this.dosya.film, this.dosya.malzeme) ?? '', parca, { x: r.left + r.width / 2, y: r.top + r.height / 2 }, r.width * n.olcek, ESYA_ORAN[tip] ?? 1, n.don * n.yon);
    n.saydam = 0;
  }

  /** Parçadaki eşya bırakılır: dünyadaki eşya takılı kopyanın yerine, boyuna ve açısına oturur, kopya kalkar */
  private birak(kim: string, esya: string, parca?: string) {
    const oy = this.oyuncular.get(kim);
    const n = this.nesneler.get(esya);
    if (!oy || !n) return;
    const k = oy.birak(esya, parca);
    if (!k) return;
    const d = this.dunyaya(k.x, k.y);
    const w = k.w / d.olcek;
    n.olcek = w / n.k.w;
    const H = n.boy;
    n.x = d.x;
    n.y = d.y - H / 2 + n.alt * H;
    n.don = k.don * n.yon;
    n.saydam = 1;
    n.uygula();
  }
  private esyaTip = new Map<string, string>();

  /** Toz bulutu: yumuşak, yuvarlak toz topakları kabarıp dağılır (kayma, çarpma) */
  private toz(x: number, y: number, adet: number, yon: number, boy: number) {
    const p = h('div.fl-toz', { style: `left:${x}%;bottom:${y}%;--boy:${boy}` },
      ...Array.from({ length: adet }, (_, i) => {
        const a = (i / Math.max(1, adet - 1) - 0.5) * 2;
        const dx = (yon ? yon * (40 + 90 * Math.abs(a)) : a * 110) * (0.8 + 0.4 * ((i * 37) % 10) / 10);
        const dy = -(30 + 50 * (1 - Math.abs(a)));
        return h('i', { style: `--dx:${dx.toFixed(0)}%;--dy:${dy.toFixed(0)}%;--s:${(0.7 + 0.5 * ((i * 53) % 10) / 10).toFixed(2)};animation-delay:${(i * 0.035).toFixed(3)}s` });
      }));
    this.katmanlar.orta.append(p);
    setTimeout(() => p.remove(), 1400 / this.hiz + 200);
  }

  /** Alt yazı + (animatikte) cihaz sesi + konuşan karakterin ağzı */
  private soyle(kim: string, metin: string, sure?: number, oy?: Oyuncu, agizId?: string) {
    const sn = sure ?? 0.9 + metin.length * 0.075;
    this.altKim.textContent = kim ? (this.dosya as unknown as { adlar?: Record<string, string> }).adlar?.[kim] ?? kim : '';
    this.altMetin.textContent = metin;
    this.altyazi.classList.toggle('anlatici', !kim);
    this.altyazi.classList.add('acik');
    this.altZaman = this.saat + sn;
    this.el.dataset.sonSoz = metin;
    // konuşma sırasında müzik kısılır (ducking)
    if (this.muzik) filmMuzik.kis(sn / this.hiz);
    // yalnız konuşanın ağzı sesle oynar (Kino konuşurken Mino susar)
    this.oyuncular.forEach((o, id) => o.sustur(!!kim && id !== kim));
    const konusSecenek = konusSecenegi(kim);
    const ses = this.ses ? konus(metin, konusSecenek) : null;
    sesGunlugeYaz('konus', metin, konusSecenek);
    // konuşanın ağzı oynar (dudak senkronu): karakter kendi cümlesinde; anlatıcı cümlesinde (anlatıcı = Mino'nun
    // sesi) sahnede görünen Mino varsa o, yoksa kimse
    const minoN = this.nesneler.get('mino');
    const agiz = oy ?? (!kim && minoN && minoN.saydam >= 0.5 ? this.oyuncular.get('mino') : undefined);
    if (agiz) {
      const agizKim = agizId ?? (kim || 'mino');
      // MP4 kaydı: ses çalmıyor, ağız kaydın önceden çıkarılmış zarfıyla (film/src/kayit.ts hazırlar)
      const dizi = KAYIT ? dudakDizisi(metin, konusSecenek.karakter) : null;
      agiz.konus(true, { metin, dizi });
      this.konusan = agizKim;
      const no = (this.konusNo.get(agiz) ?? 0) + 1;
      this.konusNo.set(agiz, no);
      // ağız en az tahmini süre, kayıt çalıyorsa (ya da dizisi varsa) sonuna kadar açık
      void Promise.all([this.bekle(Math.max(sn * 0.85, dizi ? diziSuresi(dizi) * this.hiz : 0)), ses]).then(() => {
        if (this.konusNo.get(agiz) !== no) return;
        agiz.konus(false);
        if (this.konusan === agizKim) this.konusan = null;
      });
    }
  }
  /** oyuncu başına son cümlenin numarası (eski cümlenin bitişi yenisinin ağzını kapatmasın) */
  private konusNo = new Map<Oyuncu, number>();

  // ---------------------------------------------------------------- şarkı (karaoke)
  /**
   * Şarkı: kayıt (assets/muzik/<ad>-sozlu.mp3; "sozsuz": true → <ad>-sozsuz.mp3, fon) dosya müziği gibi çalar. Sözlüyse
   * heceler kaydın tablosundaki zamanlarla (assets/muzik/<ad>.json) altta karaoke gibi yanar: film saatiyle ilerler
   * (duraklayınca durur, MP4 kaydında da aynı). Bir satır görünür; sonraki satır ilk hecesinden az önce gelir; top
   * söylenen hecenin üstüne zıplar. o: ad, soz (satırların yazımı), ses, gec, yer ('ust': görüntünün üstünde).
   * Şarkı sahne geçişlerinde sürer.
   */
  private karaoke: Karaoke | null = null;

  private sarkiBasla(o: Olay) {
    if (this.muzik) filmMuzik.dosyaCal({ ad: sarkiDosyasi(o), ses: Number(o.ses ?? 0.7), gec: Number(o.gec ?? 0.2) });
    this.karaoke?.kutu.remove();
    this.karaoke = null;
    const j = sarkiJson(String(o.ad));
    if (!j || o.sozsuz) return;
    const t = sarkiTablosu(j);
    const soz = Array.isArray(o.soz) ? (o.soz as string[]) : [];
    const yazim = soz.length ? sozleEsle(soz, t.heceler.map((x) => x.hece)) : t.heceler.map((x, i) => ({ yazi: x.hece, kelime: i, satir: x.satir }));
    const heceler = t.heceler.map((_, i) => h('span.fl-hece', {}, yazim[i].yazi));
    // heceler kelime kelime (kelime arası boşluk), satır satır
    const satirlar = t.satirlar.map((s) => {
      const kelimeler = new Map<number, HTMLElement>();
      for (const x of s) {
        const i = t.heceler.indexOf(x);
        if (!kelimeler.has(yazim[i].kelime)) kelimeler.set(yazim[i].kelime, h('span.fl-kelime'));
        kelimeler.get(yazim[i].kelime)!.append(heceler[i]);
      }
      return h('div.fl-k-satir', {}, ...kelimeler.values());
    });
    const top = h('i.fl-k-top');
    // yer 'ust': görüntünün üstünde (dans eden karakterlerin ayakları altta kapanmasın)
    const kutu = h(`div.fl-karaoke${o.yer === 'ust' ? '.ust' : ''}`, { 'aria-hidden': 'true' }, h('span.fl-k-nota', {}, '♪'), ...satirlar, top);
    this.el.append(kutu);
    this.karaoke = { bas: this.saat, t, heceler, satirlar, kutu, top, satir: -2, hece: -2, simdi: false, bitis: Infinity };
    this.el.dataset.sarki = String(o.ad);
  }

  /** Şarkı erken söner (kayıt yumuşakça kısılır, karaoke kapanır) */
  private sarkiBitir(sn: number) {
    if (this.muzik) filmMuzik.dosyaSon(sn);
    if (this.karaoke) this.karaoke.bitis = this.saat;
  }

  private karaokeGuncelle(k: Karaoke) {
    const ms = (this.saat - k.bas) * 1000;
    const t = k.t;
    let satir = -1;
    t.satirlar.forEach((s, i) => {
      if (ms >= s[0].basMs - 450) satir = i;
    });
    const bitti = ms > t.sonMs + 900 || this.saat > k.bitis + 0.3;
    if (bitti) satir = -1;
    let hece = -1;
    for (let i = 0; i < t.heceler.length && t.heceler[i].basMs <= ms; i++) hece = i;
    const simdi = hece >= 0 && ms < t.heceler[hece].bitMs + 120;
    if (satir !== k.satir) {
      k.satir = satir;
      // kutu kapanırken son satır görünür kalır (solarken boş kutu görünmesin)
      if (satir >= 0) k.satirlar.forEach((e, i) => e.classList.toggle('acik', i === satir));
      k.kutu.classList.toggle('acik', satir >= 0);
    }
    if (hece !== k.hece || simdi !== k.simdi) {
      k.hece = hece;
      k.simdi = simdi;
      k.heceler.forEach((e, i) => {
        e.classList.toggle('gecti', i < hece || (i === hece && !simdi));
        e.classList.toggle('simdi', i === hece && simdi);
      });
      // top söylenen hecenin üstüne zıplar
      const r = k.heceler[hece]?.getBoundingClientRect();
      const p = k.kutu.getBoundingClientRect();
      if (r && satir >= 0 && t.heceler[hece].satir === satir) {
        k.top.style.transform = `translate(${(r.left - p.left + r.width / 2).toFixed(1)}px, ${(r.top - p.top).toFixed(1)}px)`;
        k.top.classList.add('gorunur');
      } else k.top.classList.remove('gorunur');
    }
    if (bitti) {
      k.kutu.dataset.bitti = '1';
      this.karaoke = null;
    }
  }

  private parilti(x: number, y: number) {
    const p = h('div.fl-parilti', { style: `left:${x}%;bottom:${y}%` }, ...Array.from({ length: 8 }, (_, i) => h('i', { style: `--a:${i * 45}deg` })));
    this.katmanlar.orta.append(p);
    setTimeout(() => p.remove(), 1200);
    FILM_EFEKT.parilti();
  }
}
