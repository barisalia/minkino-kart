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
import { konus, sus } from '../../src/audio/ses';
import { h, TEST_MODU } from '../../src/ui/dom';
import { esyaCiz, ESYA_ORAN } from './esya';
import { FILM_EFEKT } from './efekt';
import { filmMuzik, type Ruh } from './muzik';
import { Oyuncu } from './oyuncu';

const FILM_GORSEL = import.meta.glob<string>('../../assets/film/*/arka-*.webp', { eager: true, query: '?url', import: 'default' });
const PAZAR_GORSEL = import.meta.glob<string>('../../assets/pazar/tezgah.webp', { eager: true, query: '?url', import: 'default' });

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
}
export interface OyuncuTanim extends Konum {
  /** 'mino' ya da karakter adı (kopek, tavsan, ordek…) */
  tip: string;
}
export interface EsyaTanim extends Konum {
  tip: string;
  katman?: Katman;
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
  gecis?: 'iris' | 'karar';
  oyuncular?: Record<string, OyuncuTanim>;
  esyalar?: Record<string, EsyaTanim>;
  olaylar: Olay[];
  /** kadrajda her zaman tam görünecek oyuncu / eşyalar (kamera olayı "tut" ile değiştirir) */
  tut?: string[];
  /** Mino'nun pazar tezgâhı (tezgah.webp) sahnede dursun mu */
  tezgah?: boolean;
}
export interface FilmDosya {
  baslik: string;
  film: string;
  ogretir?: string;
  /** false: cümleler henüz seslendirme hattına girmez (animatik) */
  seslendir?: boolean;
  sahneler: (Sahne | { ogut: string })[];
}
/**
 * Katmanlar (arkadan öne): uzak (gök, tepeler) · tezgahlar (pazar tezgâhları, flamalar) · zemin (taş zemin, yan
 * kasalar) · orta (oyuncular, eşyalar) · on. Zemin ön katman derinliğinde (1.25) ama karakterlerin arkasında çizilir:
 * ayaklar ve gölgeler zeminin üstünde kalsın.
 */
type Katman = 'uzak' | 'tezgahlar' | 'zemin' | 'orta' | 'on';
const DERINLIK: Record<Katman, number> = { uzak: 0.55, tezgahlar: 1, zemin: 1.25, orta: 1, on: 1.25 };

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
  constructor(readonly k: Konum, cocuk: HTMLElement, readonly oran: number) {
    this.x = k.x;
    this.y = k.y;
    this.don = k.don ?? 0;
    this.yon = k.yon ?? 1;
    this.saydam = k.gizli ? 0 : 1;
    this.ic = h('div.fl-ic', {}, cocuk);
    this.el = h('div.fl-nesne', { style: `width:${k.w}%;aspect-ratio:${oran};z-index:${k.z ?? 5}` }, this.ic);
  }
  /** oyuncunun ayak altı gölgesi (dönmez, çevrilmez) */
  golgeEkle() {
    this.el.prepend(h('i.fl-golge'));
  }
  /** dünya ölçüsü (px) */
  uygula() {
    this.el.style.left = `${this.x}%`;
    this.el.style.bottom = `${this.y}%`;
    this.el.style.opacity = String(this.saydam);
    this.ic.style.transform = `translateY(${(-this.sekme).toFixed(2)}%) rotate(${this.don.toFixed(2)}deg) scale(${(this.yon * this.olcek).toFixed(3)}, ${this.olcek.toFixed(3)})`;
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
  }

  /** Oynatmayı başlatır (çözülünce film bitmiştir) */
  async oynat(): Promise<void> {
    this.son = performance.now();
    this.raf = requestAnimationFrame((t) => this.kare(t));
    if (this.muzik) filmMuzik.baslat('nese');
    for (const s of this.dosya.sahneler) {
      if (this.bitti) return;
      if ('ogut' in s) {
        this.el.dataset.bitti = '1';
        break;
      }
      await this.sahneOyna(s);
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
  }

  /** film saatiyle bekle (sn) */
  private bekle(sn: number): Promise<void> {
    return new Promise((coz) => this.bekleyenler.push({ t: this.saat + sn, coz }));
  }

  private tween(sure: number, egri: string | undefined, adim: (u: number) => void, bitti?: () => void) {
    this.tweenler.push({ bas: this.saat, sure: Math.max(0.001, sure), egri: EGRI[egri ?? 'yumusak'] ?? EGRI.yumusak, adim, bitti });
  }

  // ---------------------------------------------------------------- sahne
  private async sahneOyna(s: Sahne) {
    this.kur(s);
    this.sahneBas = this.saat;
    this.olaylar = [...s.olaylar].sort((a, b) => a.t - b.t);
    this.siradaki = 0;
    this.gecis(true, s.gecis);
    await this.bekle(s.sure);
    if (this.bitti) return;
    this.gecis(false, s.gecis);
    await this.bekle(0.7);
    this.altyazi.classList.remove('acik');
  }

  private kur(s: Sahne) {
    this.oyuncular.forEach((o) => o.kapat());
    this.oyuncular.clear();
    this.nesneler.clear();
    Object.values(this.katmanlar).forEach((k) => k.replaceChildren());
    this.tezgahVar = !!s.tezgah;
    this.arka(s.arka);
    for (const [id, o] of Object.entries(s.oyuncular ?? {})) {
      const oy = new Oyuncu(o.tip);
      const n = new Nesne(o, oy.el, oy.oran);
      n.el.dataset.oyuncu = id;
      n.golgeEkle();
      this.oyuncular.set(id, oy);
      this.nesneler.set(id, n);
      this.katmanlar.orta.append(n.el);
    }
    for (const [id, e] of Object.entries(s.esyalar ?? {})) {
      const n = new Nesne(e, esyaCiz(e.tip, this.dosya.film), ESYA_ORAN[e.tip] ?? 1);
      n.el.dataset.esya = id;
      // karakter pozları (mino-sarilma) oyuncu gibi gölgeli
      if (e.tip.startsWith('mino-')) n.golgeEkle();
      this.nesneler.set(id, n);
      this.katmanlar[e.katman ?? 'orta'].append(n.el);
    }
    this.kam = { x: s.kamera[0], y: s.kamera[1], z: s.kamera[2] };
    this.tut = s.tut ?? [];
    this.konusan = null;
    this.duzelt = { x: 0, y: 0 };
    this.ilkKare = true;
    this.isikAyarla(s.isik ?? 0);
    this.el.dataset.sahne = s.ad;
  }

  /**
   * Arka plan. Pazar: filmin katmanlı çizimi (assets/film/<film>/arka-uzak, -orta, -on; ortak 16:9 çerçeve) dünyanın
   * altına tam genişlikte oturur; uzak katmanın üstü gök rengiyle devam eder. Mino'nun tezgâhı istenirse ortada.
   */
  private arka(ad: string) {
    if (ad !== 'pazar') return;
    const film = (x: string) => FILM_GORSEL[`../../assets/film/${this.dosya.film}/${x}.webp`] ?? '';
    const resim = (x: string) => h('img.fl-arka', { src: film(x), alt: '', draggable: 'false' });
    this.katmanlar.uzak.append(resim('arka-uzak'), this.isikUzak);
    this.katmanlar.tezgahlar.append(resim('arka-orta'));
    this.katmanlar.zemin.append(resim('arka-on'));
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
      const vw = (100 * W) / (S * this.kam.z);
      const vh = (100 * H) / (S * this.kam.z);
      const m = 3;
      const x = this.kam.x;
      const y = this.kam.y;
      const kx = r - l + 2 * m > vw ? (l + r) / 2 : Math.min(l - m + vw / 2, Math.max(r + m - vw / 2, x));
      const ky = alt - ust + 2 * m > vh ? (ust + alt) / 2 : Math.min(ust - m + vh / 2, Math.max(alt + m - vh / 2, y));
      hx = kx - x;
      hy = ky - y;
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
    for (const [ad, el] of Object.entries(this.katmanlar) as [Katman, HTMLElement][]) {
      const d = DERINLIK[ad];
      const z = 1 + (this.kam.z - 1) * d;
      const fx = S / 2 + (((this.kam.x + this.duzelt.x) / 100) * S - S / 2) * d;
      const fy = S / 2 + (((this.kam.y + this.duzelt.y) / 100) * S - S / 2) * d;
      let tx = W / 2 - fx * z;
      let ty = H / 2 - fy * z;
      // dünyanın kenarı görünmesin
      tx = Math.min(0, Math.max(W - S * z, tx));
      ty = Math.min(0, Math.max(H - S * z, ty));
      el.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${z.toFixed(4)})`;
    }
  }

  // ---------------------------------------------------------------- geçiş
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
    const n = this.nesneler.get(o.kim);
    const oy = this.oyuncular.get(o.kim);
    if (!n) return;
    switch (o.yap) {
      case 'git': {
        const a = { x: n.x, y: n.y, don: n.don, olcek: n.olcek };
        const b = { x: Number(o.x ?? a.x), y: Number(o.y ?? a.y), don: Number(o.don ?? a.don), olcek: Number(o.olcek ?? a.olcek) };
        const yay = Number(o.yay ?? 0);
        const yuru = o.yuru !== false && !!oy;
        if (yuru && b.x !== a.x) n.yon = b.x > a.x ? 1 : -1;
        if (yuru) oy?.yuru(sure / this.hiz);
        this.tween(sure, egri ?? (yuru ? 'dogrusal' : 'yumusak'), (u) => {
          n.x = a.x + (b.x - a.x) * u;
          n.y = a.y + (b.y - a.y) * u + yay * 4 * u * (1 - u);
          n.don = a.don + (b.don - a.don) * u;
          n.olcek = a.olcek + (b.olcek - a.olcek) * u;
          // kendi yürüyüşü olmayan (Mino) adım adım seker
          n.sekme = yuru && oy?.tip === 'mino' ? Math.abs(Math.sin(u * Math.PI * Math.max(2, Math.round(sure * 3)))) * 5 : 0;
        }, () => (n.sekme = 0));
        return;
      }
      case 'don':
        n.yon = Number(o.yon) === -1 ? -1 : 1;
        return;
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
      case 'soyle':
        this.soyle(o.kim, String(o.metin), o.sure as number | undefined, oy);
        return;
    }
  }

  /** Alt yazı + (animatikte) cihaz sesi + konuşan karakterin ağzı */
  private soyle(kim: string, metin: string, sure?: number, oy?: Oyuncu) {
    const sn = sure ?? 0.9 + metin.length * 0.075;
    this.altKim.textContent = kim ? (this.dosya as unknown as { adlar?: Record<string, string> }).adlar?.[kim] ?? kim : '';
    this.altMetin.textContent = metin;
    this.altyazi.classList.toggle('anlatici', !kim);
    this.altyazi.classList.add('acik');
    this.altZaman = this.saat + sn;
    this.el.dataset.sonSoz = metin;
    // konuşma sırasında müzik kısılır (ducking)
    if (this.muzik) filmMuzik.kis(sn / this.hiz);
    if (oy) {
      oy.konus(true);
      this.konusan = kim;
      void this.bekle(sn * 0.85).then(() => {
        oy.konus(false);
        if (this.konusan === kim) this.konusan = null;
      });
    }
    if (this.ses) void konus(metin, { ton: kim === 'mino' ? 1.12 : kim ? 0.9 : 1 });
  }

  private parilti(x: number, y: number) {
    const p = h('div.fl-parilti', { style: `left:${x}%;bottom:${y}%` }, ...Array.from({ length: 8 }, (_, i) => h('i', { style: `--a:${i * 45}deg` })));
    this.katmanlar.orta.append(p);
    setTimeout(() => p.remove(), 1200);
    FILM_EFEKT.parilti();
  }
}
