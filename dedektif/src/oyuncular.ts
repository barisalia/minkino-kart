import { resim, yeniOdalar } from './resimler';
import { adimOynat } from './adim';
/**
 * Dedektif Mino'nun oyuncuları (ekranın önünde duran sunucular): Mino (dedektif şapkalı, src/mino), Kino (iskelet) ve
 * Pamuk (iskelet: assets/karakter-iskelet/pamuk). Boylar tek tablodan (src/karakter/boy.ts): Kino Mino'nun 0.74'ü,
 * Pamuk Mino kadar. Hepsi nefes alır ve göz kırpar (Mino ve Karakter kendi döngüleriyle).
 *
 * Konuşma sırayla: Mino = anlatıcı sesi; Kino = kendi sesi (dudak senkronu); kart hayvanları ve Pamuk anlatıcının
 * tonlu sesi. Söz, konuşanın başının üstünde kısa bir balonda yazar.
 */
import { KINO_SESI, konus, konusuyorMu } from '../../src/audio/ses';
import type { KonusmaSecenegi, Soylenecek } from '../../src/audio/konusma';
import { altPayi, boyGenislik, CIZIM } from '../../src/karakter/boy';
import { Karakter, type HareketAdi, type Poz } from '../../src/karakter/karakter';
import { Mino, minoDedektifYukle, type Tepki } from '../../src/mino/mino';
import { YuruyenMino } from '../../src/mino/mino-profil';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { AZ_HAREKET } from './dunya';
import { tekTekrar } from './konusma-sira';
import { AGIZ_VAR, CizgiAgiz, KINO_SOL, kinoTemel, kinoYonuKoy, minoTemel } from './cizgi-agiz';
import { PozYuvasi } from './poz';

/** Kino'nun kutusu Mino'nun kutu genişliğine göre (Mino kutusu 1360 × 1790; Kino 0.74 boy) */
export const KINO_ORAN = boyGenislik('kino', 1);
export const KINO_ALT = altPayi(CIZIM.kino);
export const PAMUK_ORAN = boyGenislik('pamuk', 1);
export const PAMUK_ALT = altPayi(CIZIM.pamuk);

/** Konuşanlar. Vaka 2'nin konukları (Vakvak Anne, Karabaş, tavşan, Ada) Pamuk'un balonunu kullanır (aynı anda biri). */
export type Kim = 'mino' | 'kino' | 'pamuk' | 'kart' | 'ordek' | 'kopek' | 'tavsan' | 'ada' | 'findik' | 'balon';
/** Konuşanın sesi: kart hayvanları, Pamuk ve konuklar anlatıcı kaydının tonlu çalınışı */
export const SES: Record<Kim, KonusmaSecenegi> = {
  // Mino'nun kendi sesi (Seri 2): kaydı olan cümle onunla, olmayan anlatıcı sesiyle çalar
  mino: { karakter: 'mino' },
  kino: KINO_SESI,
  pamuk: { ton: 1.22 },
  kart: {},
  ordek: { ton: 1.18 },
  kopek: { ton: 0.86 },
  tavsan: { ton: 1.26 },
  ada: { ton: 1.12 },
  // Vaka 3: Fındık anlatıcı sesinin ince, hızlı tonu; 'balon' yalnız balonda yazan konuk sözü (kuş, tavşan, kirpi,
  // baykuş): seslendirilmez, cihaz sesine de düşmez (sözün süresi kadar balon açık kalır)
  findik: { ton: 1.36 },
  balon: { cihazSesi: false },
};
/** ağzı oynayan konuşan: Mino, Kino ya da konuk (Pamuk'un yeri; kart hayvanı yok) */
const balonSahibi = (kim: Kim): 'mino' | 'kino' | 'pamuk' | null => (kim === 'kart' ? null : kim === 'mino' || kim === 'kino' ? kim : 'pamuk');
/** Kart hayvanlarının tonu (zürafa kalın, ördek ince) */
export const KART_TON: Record<string, number> = { zurafa: 0.8, ordek: 1.32, siyah: 0.9 };

export type KinoPoz = 'dusun' | 'kalk' | 'isaret' | 'otur' | null;


/** Oyuncuların ekrandaki dizilişi (Oyuncular.yerlesim) */
type Yerlesim = 'iki' | 'sol' | 'sag' | 'kenar';
/** Dikey (dar) ekran mı (vakaların dar() ölçüsüyle aynı: en < boy × 1.15) */
const ekranDar = () => window.innerWidth < window.innerHeight * 1.15;

export class Oyuncular {
  readonly el: HTMLElement;
  readonly mino = new Mino();
  /** Mino yandan yürüyebilir (girişte odaya yürüyerek girer): önden ↔ yandan sarmal */
  readonly yuruyen = new YuruyenMino(this.mino);
  readonly kino = new Karakter('kino', h('div'));
  pamuk: Karakter | null = null;
  readonly minoYer: HTMLElement;
  readonly kinoYer: HTMLElement;
  pamukYer: HTMLElement | null = null;
  private minoHareket: HTMLElement;
  private kinoHareket: HTMLElement;
  private pamukHareket: HTMLElement | null = null;
  private pamukKaynak: HTMLElement | null = null;
  private sapkaSvg: string | null = null;
  private sira: Promise<void> = Promise.resolve();
  private kapali = false;
  private yukSol = 0;
  private yukSag = 0;
  private kinoEk: ((p: Poz, t: number) => void) | null = null;
  /** son söylenen (tekrar dinle) */
  son: { soz: Soylenecek; kim: Kim; ton?: number } | null = null;

  /** poz ekleri (poz.ts): iskeletin yerine kısa süre tek resim */
  readonly minoPoz: PozYuvasi;
  readonly kinoPozu: PozYuvasi;
  pamukPoz: PozYuvasi | null = null;

  /** Yeni çizgi: konuşan ağız ve Kino'nun yönü (cizgi-agiz.ts; çizimler yoksa döngü kurulmaz) */
  private agizlar: { mino: CizgiAgiz; kino: CizgiAgiz } | null = null;
  private konusan: 'mino' | 'kino' | null = null;
  /** Kino sola mı bakıyor (sola dönük çizimler varsa); hedef: baktığı / gösterdiği şeyin ekrandaki x'i */
  kinoSol = false;
  private kinoHedefX: number | null = null;
  private cizgiRaf = 0;

  constructor() {
    window.addEventListener('resize', this.yonDegisti);
    this.minoHareket = h('div.dd-hareket', {}, h('i.dd-golge'), this.yuruyen.el);
    this.minoYer = h('div.dd-oyuncu.dd-mino-yer', { 'data-oyuncu': 'mino' }, this.minoHareket);
    const kinoKutu = h('div.dd-kino-kutu', {}, this.kino.el);
    this.kinoHareket = h('div.dd-hareket', {}, h('i.dd-golge'), kinoKutu);
    this.minoPoz = PozYuvasi.mino(this.yuruyen.el, this.mino.el);
    this.kinoPozu = PozYuvasi.kino(kinoKutu, this.kino.el);
    // rahatlayan Mino da dedektif şapkasını çıkarmaz: şapka (iskeletteki çizim) pozun başına konur
    void minoDedektifYukle().then((e) => (this.sapkaSvg = e?.sapka ?? null));
    this.minoPoz.ekler['mino-rahat'] = () => {
      // yeni çizgide şapka resmin içinde
      if (yeniOdalar) return null;
      if (!this.sapkaSvg || !this.mino.dedektifSu.sapka) return null;
      // şapkanın iskeletteki sınırı (mino-dedektif-svg.ts: translate(985 560) scale(0.7) translate(-1545 -822), resim 942×708)
      return h('div.dd-poz-sapka', { html: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="649 68.6 659.4 495.6">${this.sapkaSvg}</svg>` });
    };
    this.kinoYer = h('div.dd-oyuncu.dd-kino-yer', { 'data-oyuncu': 'kino', style: `--ko:${KINO_ORAN.toFixed(3)};--ka:${KINO_ALT.toFixed(3)}` }, this.kinoHareket);
    this.el = h('div.dd-oyuncular', { style: `--ko:${KINO_ORAN.toFixed(3)}` }, this.minoYer, this.kinoYer);
    if (AGIZ_VAR) this.agizlar = { mino: new CizgiAgiz(this.mino.el, () => minoTemel(this.mino.el)), kino: new CizgiAgiz(this.kino.el, () => kinoTemel(this.kino.el, this.kinoSol), this.kino.hazir) };
    if (AGIZ_VAR || KINO_SOL) this.cizgiRaf = requestAnimationFrame(this.cizgiKare);
    this.kino.ekHareket = (p, t) => {
      p.yukSol = this.yukSol;
      p.yukSag = this.yukSag;
      this.kinoEk?.(p, t);
    };
  }

  /** Pamuk (final ve çizgi roman öncesi): ekranın önünde, Mino'nun yanında */
  pamukEkle(): Karakter {
    if (this.pamukYer && this.pamukEkran) return this.pamukEkran;
    this.pamukEkran = new Karakter('pamuk', h('div'));
    this.pamuk = this.pamukEkran;
    const kutu = h('div.dd-pamuk-kutu', {}, this.pamukEkran.el);
    this.pamukHareket = h('div.dd-hareket', {}, h('i.dd-golge'), kutu);
    this.pamukPoz = PozYuvasi.pamuk(kutu, this.pamukEkran.el);
    this.pamukYer = h('div.dd-oyuncu.dd-pamuk-yer', { 'data-oyuncu': 'pamuk', style: `--po:${PAMUK_ORAN.toFixed(3)};--pa:${PAMUK_ALT.toFixed(3)}` }, this.pamukHareket);
    this.el.append(this.pamukYer);
    this.pamukKaynak = null;
    return this.pamukEkran;
  }
  private pamukEkran: Karakter | null = null;
  /** Yatak odasındaki (dünyadaki) Pamuk konuşsun: balon onun başına göre konur */
  pamukBagla(k: Karakter, kap: HTMLElement) {
    this.pamuk = k;
    this.pamukKaynak = kap;
  }
  /**
   * Vaka 2: konuşan konuk (dünyadaki Vakvak Anne, Ada; sorgudaki Karabaş, tavşan). Balon kap'ın başına konur
   * (tepe: kabın üstünden aşağı, kabın boyunun oranı: tuvalin üstündeki boşluk), ağız Karakter'in (varsa).
   */
  konukBagla(k: Karakter | null, kap: HTMLElement, tepe = 0.1) {
    this.pamuk = k;
    this.pamukKaynak = kap;
    this.konukTepe = tepe;
  }
  private konukTepe = 0.1;

  /** Her kare: Kino baktığı yere dönük (sola dönük çizim varsa), konuşanın ağzı sese göre */
  private cizgiKare = () => {
    if (this.kapali) return;
    if (KINO_SOL) {
      const r = this.kino.el.getBoundingClientRect();
      if (r.width) {
        const hedef = this.kinoHedefX ?? window.innerWidth / 2;
        const orta = r.left + r.width / 2;
        // küçük oynamalarda yön titremesin: hedefin 12 px yakınında eski yön kalır
        const sol = Math.abs(orta - hedef) < 12 ? this.kinoSol : orta > hedef;
        if (sol !== this.kinoSol || this.kino.el.dataset.yon === undefined) {
          this.kinoSol = sol;
          kinoYonuKoy(this.kino.el, sol);
        }
      }
    }
    if (this.agizlar) {
      const simdi = performance.now();
      const ses = konusuyorMu();
      this.agizlar.mino.kare(simdi, ses && this.konusan === 'mino');
      this.agizlar.kino.kare(simdi, ses && this.konusan === 'kino');
    }
    this.cizgiRaf = requestAnimationFrame(this.cizgiKare);
  };
  /** Kino'nun pozu, hedef (ekran x'i; yoksa ekranın ortası) solundaysa ve sola dönük eşi çizildiyse o */
  kinoYonlu<A extends 'kino-tahmin' | 'kino-koklama'>(ad: A, hedefX?: number): A | `${A}-sol` {
    const r = this.kino.el.getBoundingClientRect();
    const sol = r.width > 0 && r.left + r.width / 2 > (hedefX ?? window.innerWidth / 2) + 12;
    return sol && resim(`poz-${ad}-sol`) ? `${ad}-sol` : ad;
  }
  /** Kino şu ekran noktasına bakar / onu gösterir (null: ekranın ortası) */
  kinoBak(x: number | null) {
    this.kinoHedefX = x;
  }

  kapat() {
    this.kapali = true;
    cancelAnimationFrame(this.cizgiRaf);
    this.minoPoz.temizle();
    this.kinoPozu.temizle();
    this.pamukPoz?.temizle();
    this.mino.kapat();
    this.kino.kapat();
    this.pamuk?.kapat();
    this.pamukEkran?.kapat();
    window.removeEventListener('resize', this.yonDegisti);
  }

  // ---------------------------------------------------------------- konuşma
  /** Sırayla söyler (öncekinin bitmesini bekler); ton: kart hayvanının tonu */
  soyle(soz: Soylenecek, kim: Kim = 'mino', ton?: number): Promise<void> {
    const is = this.sira.then(async () => {
      if (this.kapali) return;
      this.son = { soz, kim, ton };
      // konuşma balonu yok (Barış 18 Kasım: "gerek yok konuşma balonlarına"): ses ve ağız yeter
      const bs = balonSahibi(kim);
      if (kim === 'kino') this.kino.konus(true);
      if (bs === 'pamuk') this.pamuk?.konus(true);
      this.mino.agizSus = kim !== 'mino';
      this.konusan = kim === 'mino' || kim === 'kino' ? kim : null;
      if (this.konusan) this.agizlar?.[this.konusan].hazirla((Array.isArray(soz) ? soz : [soz]).filter(Boolean).join(' '));
      try {
        const secenek: KonusmaSecenegi = ton ? { ...SES[kim], ton } : SES[kim];
        await konus(soz, secenek);
        if (TEST_MODU) await new Promise((r) => setTimeout(r, 10));
      } finally {
        this.konusan = null;
        this.mino.agizSus = false;
        if (kim === 'kino') this.kino.konus(false);
        if (bs === 'pamuk') this.pamuk?.konus(false);
      }
    });
    this.sira = is.catch(() => undefined);
    return is;
  }
  /** Son cümleyi tekrar söyler (art arda dokunuşlar birikmez: sırada ya da çalmakta en çok bir tekrar) */
  tekrar() {
    const s = this.son;
    if (s) this.tekrarla(() => this.soyle(s.soz, s.kim, s.ton));
  }
  private tekrarla = tekTekrar();

  // ---------------------------------------------------------------- Mino
  minoTepki(t: Tepki, sn?: number) {
    if (!AZ_HAREKET) this.mino.tepki(t, sn);
  }

  // ---------------------------------------------------------------- Kino
  kinoOynat(ad: HareketAdi, ms: number) {
    if (!AZ_HAREKET) void this.kino.oynat(ad, ms);
  }
  kinoIfade(ad: string | null, ms = 0) {
    if (!ad || this.kino.ifadeVar(ad)) this.kino.ifade(ad, ms);
  }
  /** Kino'nun duruşu (Kino iskeletinin katmanları): düşünür, kalk, işaret, otur */
  kinoPoz(p: KinoPoz, hedefX?: number) {
    // gösterdiği şeye dönük (sola dönük çizimler geldiyse); gösterme bitince ekranın ortasına
    this.kinoBak(p === 'isaret' && hedefX !== undefined ? hedefX : null);
    // yeni çizgi: Kino bir kartı gösterirken Astra'nın "tahmin" pozu (iskelet hareketli kalır, poz kısa süre)
    if (yeniOdalar) {
      if (p === 'isaret') void this.kinoPozu.goster(this.kinoYonlu('kino-tahmin', hedefX));
      else if (this.kinoPozu.su === 'kino-tahmin' || this.kinoPozu.su === 'kino-tahmin-sol') void this.kinoPozu.birak();
    }
    const k = this.kino;
    k.el.dataset.poz = p ?? 'dur';
    const var_ = (id: string) => !!k.parcaG(id);
    const dusun = p === 'dusun' && var_('goz-dusun');
    for (const id of ['goz-dusun', 'agiz-dusun', 'kol-sag-dusun']) k.ek(id, dusun);
    const bak = p === 'isaret' && var_('goz-bak-sag');
    k.ek('goz-bak-sag', bak);
    k.gizle('goz-sol', dusun || bak);
    k.gizle('goz-sag', dusun || bak);
    k.gizle('agiz', dusun);
    k.gizle('dil', dusun);
    const otur = p === 'otur' && var_('govde-oturma');
    k.ek('govde-oturma', otur);
    k.ek('kuyruk-oturma', otur);
    k.gizle('govde', otur);
    k.gizle('kuyruk', otur);
    const kalkSag = (p === 'kalk' || p === 'isaret') && var_('kol-sag-yukari');
    const kalkSol = p === 'kalk' && var_('kol-sol-yukari');
    k.ek('kol-sag-yukari', kalkSag);
    k.ek('kol-sol-yukari', kalkSol);
    k.gizle('kol-sol', kalkSol);
    k.gizle('kol-sag', dusun || kalkSag);
    this.yukSag = kalkSag ? (p === 'isaret' ? 80 : 140) : 0;
    this.yukSol = kalkSol ? 140 : 0;
  }
  /** Kino'ya kodla ek hareket (ör. koklarken burnu iner kalkar) */
  kinoEkHareket(f: ((p: Poz, t: number) => void) | null) {
    this.kinoEk = f;
  }

  // ---------------------------------------------------------------- yer değiştirme (ekran px, ayak noktası)
  private konumlar = new Map<HTMLElement, [number, number]>();
  /** Oyuncunun ayaklarının ekrandaki yeri (sahne kökü px) */
  ayak(yer: HTMLElement): [number, number] {
    const r = yer.getBoundingClientRect();
    const k = this.el.getBoundingClientRect();
    const [dx, dy] = this.konumlar.get(yer) ?? [0, 0];
    const alt = yer === this.kinoYer ? KINO_ALT : yer === this.pamukYer ? PAMUK_ALT : 0.012;
    return [r.left - k.left + r.width / 2 + dx, r.bottom - k.top - r.height * alt + dy];
  }
  /** Oyuncu ekrandaki bir noktaya (ayakları oraya) yürür / zıplar; dön() ile yerine */
  async git(kim: 'mino' | 'kino' | 'pamuk', x: number, y: number, ms = 700, yay = 40) {
    const yer = kim === 'mino' ? this.minoYer : kim === 'kino' ? this.kinoYer : this.pamukYer;
    if (!yer) return;
    const [ax, ay] = this.ayak(yer);
    const [x0, y0] = this.konumlar.get(yer) ?? [0, 0];
    await this.kaydir(kim, x0 + (x - ax), y0 + (y - ay), ms, yay);
  }
  /** Yerine döner */
  don(kim: 'mino' | 'kino' | 'pamuk', ms = 600) {
    return this.kaydir(kim, 0, 0, ms, 30);
  }
  /** Ekran px kadar kayar (yerine göre) */
  async kaydir(kim: 'mino' | 'kino' | 'pamuk', dx: number, dy: number, ms = 700, yay = 40) {
    const yer = kim === 'mino' ? this.minoYer : kim === 'kino' ? this.kinoYer : this.pamukYer;
    const hareket = kim === 'mino' ? this.minoHareket : kim === 'kino' ? this.kinoHareket : this.pamukHareket;
    if (!yer || !hareket) return;
    const [x0, y0] = this.konumlar.get(yer) ?? [0, 0];
    this.konumlar.set(yer, [dx, dy]);
    if (kim === 'kino') this.kinoOynat('yuru', ms);
    if (kim === 'pamuk' && this.pamuk && !AZ_HAREKET) void this.pamuk.oynat('yuru', ms);
    const yon = dx < x0 ? -1 : 1;
    // önceki (kalıcı) kaydırmalar birikmesin: yeni kayma şimdiki yerden başlar. Önceki kayma yarıda kesildiyse
    // (ör. koklamaya giderken arama bitti) o anki yerinden başlar, hedefine sıçramaz.
    const surenler = hareket.getAnimations();
    const yarida = surenler.some((x) => x.playState === 'running');
    const simdi = yarida ? getComputedStyle(hareket).transform : 'none';
    surenler.forEach((x) => x.cancel());
    const yuru = kim !== 'pamuk' && Math.abs(dx-x0) > 3;
    const dur = yuru ? adimOynat(kim==='kino'?this.kino.el.parentElement!:this.yuruyen.el, kim, dx<x0, sure(ms)) : undefined;
    const a = hareket.animate(
      [
        { transform: yarida && simdi !== 'none' ? simdi : `translate(${x0}px, ${y0}px)` },
        { transform: `translate(${(x0 + dx) / 2}px, ${(yuru ? (y0+dy)/2 : Math.min(y0,dy) - (AZ_HAREKET ? 0 : yay))}px) rotate(${yuru ? 0 : yon * 3}deg)`, offset: 0.5 },
        { transform: `translate(${dx}px, ${dy}px)` },
      ],
      { duration: sure(AZ_HAREKET ? 200 : ms), easing: 'cubic-bezier(.45,.1,.4,1)', fill: 'forwards' },
    );
    await a.finished.catch(() => undefined);
    dur?.();
  }
  /**
   * Pamuk ekranda bir eşyanın (ör. masadaki lamba) önüne düştüyse sola çekilir; Mino'ya değmez. Dar ekranda kamera
   * yaklaşınca masa ortaya gelir: Pamuk'un başı lambanın üstüne binmesin. Çakışma yoksa hiçbir şey olmaz.
   */
  async pamukKenaraCek(engel: Element | null | undefined, ms = 700) {
    const yer = this.pamukYer;
    if (!yer || !engel) return;
    const l = engel.getBoundingClientRect();
    if (!l.width || !l.height) return;
    const p = yer.getBoundingClientRect();
    const m = this.minoYer.getBoundingClientRect();
    // çizimlerin kutusu saydam kenarlı: gövde kutunun ortasındaki ~%60'ı
    const pSol = p.left + p.width * 0.2;
    const pSag = p.right - p.width * 0.2;
    if (pSag <= l.left || pSol >= l.right || p.bottom <= l.top || p.top >= l.bottom) return;
    const [x0, y0] = this.konumlar.get(yer) ?? [0, 0];
    const lambadan = l.left - 12 - pSag;
    const minodan = m.right - m.width * 0.2 + 8 - pSol;
    const dx = Math.max(lambadan, minodan);
    if (dx > -2) return;
    await this.kaydir('pamuk', x0 + dx, y0, ms, 12);
  }
  /**
   * Mino yandan yürüyerek gelir: ekranda dx px uzaktan (eksi: soldan) yerine; adımlar yola göre (pati kaymaz).
   * Yan çizim yüklenmediyse önden sekerek gelir.
   */
  async minoYuruyerekGel(dx: number, ms = 1600) {
    const el = this.minoHareket;
    const dur = adimOynat(this.yuruyen.el, 'mino', dx > 0, sure(ms));
    this.konumlar.set(this.minoYer, [0, 0]);
    el.getAnimations().forEach((x) => x.cancel());
    const a = el.animate([{ transform: `translate(${dx}px, 0)` }, { transform: 'translate(0, 0)' }], { duration: sure(ms), easing: 'linear', fill: 'forwards' });
    await a.finished.catch(() => undefined);
    dur();
  }

  /** Yerinde zıplama (esneyip basılır) */
  zipla(kim: 'mino' | 'kino' | 'pamuk', yukseklik = 18, ms = 620) {
    const yer = kim === 'mino' ? this.minoYer : kim === 'kino' ? this.kinoYer : this.pamukYer;
    const govde = yer?.querySelector<HTMLElement>(':scope > .dd-hareket > :is(.mino-yuruyen, .dd-kino-kutu, .dd-pamuk-kutu)');
    if (!govde || AZ_HAREKET) return Promise.resolve();
    return govde
      .animate(
        [
          { transform: 'translateY(0) scale(1, 1)' },
          { transform: 'translateY(0) scale(1.06, 0.95)', offset: 0.18 },
          { transform: `translateY(-${yukseklik * 0.85}%) scale(0.96, 1.05)`, offset: 0.4 },
          { transform: `translateY(-${yukseklik}%) scale(1, 1)`, offset: 0.52 },
          { transform: 'translateY(0) scale(1.06, 0.95)', offset: 0.8 },
          { transform: 'translateY(0) scale(1, 1)' },
        ],
        { duration: sure(ms), easing: 'cubic-bezier(0.45, 0, 0.3, 1)' },
      )
      .finished.catch(() => undefined);
  }
  /**
   * Yerleşim: iki yan (Mino solda, Kino sağda), ikisi solda, ikisi sağda, kenar (ikisi de ekranın kenarına çekilir).
   * dar verilirse dikey (dar) ekranda o kullanılır; telefon işin ortasında dönünce yerleşim yeni yöne geçer
   * (ör. dikeyde kenara çekilmiş Mino ile Kino yatayda yarı ekran dışında kalmasın).
   */
  yerlesim(d: Yerlesim, dar?: Yerlesim) {
    this.yonlu = dar ? [d, dar] : null;
    this.el.dataset.yerlesim = dar && ekranDar() ? dar : d;
  }
  private yonlu: [Yerlesim, Yerlesim] | null = null;
  private yonDegisti = () => {
    if (this.yonlu && !this.kapali) this.el.dataset.yerlesim = ekranDar() ? this.yonlu[1] : this.yonlu[0];
  };
}
