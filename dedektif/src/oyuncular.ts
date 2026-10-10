/**
 * Dedektif Mino'nun oyuncuları (ekranın önünde duran sunucular): Mino (dedektif şapkalı, src/mino), Kino (iskelet) ve
 * Pamuk (iskelet: assets/karakter-iskelet/pamuk). Boylar tek tablodan (src/karakter/boy.ts): Kino Mino'nun 0.74'ü,
 * Pamuk Mino kadar. Hepsi nefes alır ve göz kırpar (Mino ve Karakter kendi döngüleriyle).
 *
 * Konuşma sırayla: Mino = anlatıcı sesi; Kino = kendi sesi (dudak senkronu); kart hayvanları ve Pamuk anlatıcının
 * tonlu sesi. Söz, konuşanın başının üstünde kısa bir balonda yazar.
 */
import { KINO_SESI, konus } from '../../src/audio/ses';
import type { KonusmaSecenegi, Soylenecek } from '../../src/audio/konusma';
import { altPayi, boyGenislik, CIZIM } from '../../src/karakter/boy';
import { Karakter, type HareketAdi, type Poz } from '../../src/karakter/karakter';
import { Mino, minoDedektifYukle, type Tepki } from '../../src/mino/mino';
import { MINO_DONGU_YOLU, MINO_KUTU_GENISLIK, YuruyenMino } from '../../src/mino/mino-profil';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { AZ_HAREKET } from './dunya';
import { BalonNobeti, tekTekrar } from './konusma-sira';
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
  mino: {},
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
/** balonu olan konuşan: Mino, Kino ya da konuk (Pamuk'un balonu) */
const balonSahibi = (kim: Kim): 'mino' | 'kino' | 'pamuk' | null => (kim === 'kart' ? null : kim === 'mino' || kim === 'kino' ? kim : 'pamuk');
/** Kart hayvanlarının tonu (zürafa kalın, ördek ince) */
export const KART_TON: Record<string, number> = { zurafa: 0.8, ordek: 1.32, siyah: 0.9 };

export type KinoPoz = 'dusun' | 'kalk' | 'isaret' | 'otur' | null;

/** Balon: konuşanın başının üstünde, kısa süre */
function balon(): HTMLElement {
  return h('div.dd-balon', { 'aria-hidden': 'true' }, h('span'));
}

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
  private balonlar: Record<'mino' | 'kino' | 'pamuk', HTMLElement> = { mino: balon(), kino: balon(), pamuk: balon() };
  /** balonlar her şeyin üstünde ayrı bir katmanda (kartların, fotoğrafın üstünde); konuşanın başına göre konur */
  readonly balonKatman: HTMLElement;
  private pamukKaynak: HTMLElement | null = null;
  private sapkaSvg: string | null = null;
  private sira: Promise<void> = Promise.resolve();
  private balonNobeti = new BalonNobeti<'mino' | 'kino' | 'pamuk'>();
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
      if (!this.sapkaSvg || !this.mino.dedektifSu.sapka) return null;
      // şapkanın iskeletteki sınırı (mino-dedektif-svg.ts: translate(985 560) scale(0.7) translate(-1545 -822), resim 942×708)
      return h('div.dd-poz-sapka', { html: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="649 68.6 659.4 495.6">${this.sapkaSvg}</svg>` });
    };
    this.kinoYer = h('div.dd-oyuncu.dd-kino-yer', { 'data-oyuncu': 'kino', style: `--ko:${KINO_ORAN.toFixed(3)};--ka:${KINO_ALT.toFixed(3)}` }, this.kinoHareket);
    this.el = h('div.dd-oyuncular', { style: `--ko:${KINO_ORAN.toFixed(3)}` }, this.minoYer, this.kinoYer);
    this.balonKatman = h('div.dd-balonlar', { 'aria-hidden': 'true' }, this.balonlar.mino, this.balonlar.kino, this.balonlar.pamuk);
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

  kapat() {
    this.kapali = true;
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
      const metin = (Array.isArray(soz) ? soz : [soz]).filter(Boolean).join(' ');
      const secenek: KonusmaSecenegi = ton ? { ...SES[kim], ton } : SES[kim];
      this.son = { soz, kim, ton };
      const bs = balonSahibi(kim);
      const b = bs ? this.balonlar[bs] : null;
      // bu sözün balon açılışı: aynı konuşanın önceki sözünün kapanışı bu sözü kapatmaz
      const nesil = bs ? this.balonNobeti.ac(bs) : 0;
      if (b && bs) {
        b.querySelector('span')!.textContent = metin;
        b.classList.remove('acik');
        this.balonKonumla(b, bs);
        void b.offsetWidth;
        b.classList.add('acik');
        // konuşan yürür / kenara çekilirse balon başını izler (açık kaldıkça; yeni söz kendi izlemesini kurar)
        const bk = bs;
        const takip = () => {
          if (this.kapali || !this.balonNobeti.gecerli(bk, nesil) || !b.classList.contains('acik')) return;
          this.balonKonumla(b, bk);
          requestAnimationFrame(takip);
        };
        requestAnimationFrame(takip);
      }
      if (kim === 'kino') this.kino.konus(true);
      if (bs === 'pamuk') this.pamuk?.konus(true);
      this.mino.agizSus = kim !== 'mino';
      try {
        await konus(soz, secenek);
        if (TEST_MODU) await new Promise((r) => setTimeout(r, 10));
      } finally {
        this.mino.agizSus = false;
        if (kim === 'kino') this.kino.konus(false);
        if (bs === 'pamuk') this.pamuk?.konus(false);
        if (b && bs) setTimeout(() => this.balonNobeti.gecerli(bs, nesil) && b.classList.remove('acik'), sure(700));
      }
    });
    this.sira = is.catch(() => undefined);
    return is;
  }
  /** Balonu konuşanın başının üstüne koyar; ekranın kenarından taşmaz (kuyruğu yine başı gösterir) */
  private balonKonumla(b: HTMLElement, kim: 'mino' | 'kino' | 'pamuk') {
    const kap = this.balonKatman.getBoundingClientRect();
    const kaynak = kim === 'mino' ? this.mino.el : kim === 'kino' ? this.kino.el : (this.pamukKaynak ?? this.pamuk?.el);
    if (!kaynak) return;
    const r = kaynak.getBoundingClientRect();
    // başın tepesi: Mino'nun kutusu kulaklardan başlar (şapka biraz üstte); Kino ve Pamuk'un kare tuvalinde üstte boşluk var
    const ust = kim === 'mino' ? r.top - r.height * 0.02 : r.top + r.height * (kim === 'pamuk' && this.pamukKaynak ? this.konukTepe : 0.1);
    const x = r.left - kap.left + r.width / 2;
    const yUst = ust - kap.top - 4;
    const pay = 8;
    b.style.left = `${x.toFixed(1)}px`;
    b.style.removeProperty('max-width');
    /** balonu [sol, sag] aralığına sığdırır (kuyruk yine başı gösterir); balonun ekrandaki kutusunu döner */
    const yerlestir = (sol: number, sag: number) => {
      const y = Math.max(b.offsetHeight + 70, yUst);
      b.style.top = `${y.toFixed(1)}px`;
      const bw = b.offsetWidth;
      let kay = 0;
      if (x - bw / 2 < sol) kay = sol - (x - bw / 2);
      if (x + bw / 2 > sag) kay = sag - (x + bw / 2);
      // kuyruk balonun içinde kalsın
      kay = Math.max(-bw / 2 + 22, Math.min(bw / 2 - 22, kay));
      b.style.setProperty('--kay', `${kay.toFixed(1)}px`);
      return { l: x + kay - bw / 2, r: x + kay + bw / 2, t: y - b.offsetHeight, b: y };
    };
    let k = yerlestir(pay, kap.width - pay);
    // sorgu kartları, delil fotoğrafı: balon onların üstüne binmez. Konuşanın yanındaki boş şeride daralır (yazı
    // alt alta iner, balon yukarı uzar), kuyruk başı göstermeye devam eder.
    const kok = this.balonKatman.parentElement;
    const engeller = kok
      ? [...kok.querySelectorAll('.dd-sorgu:not(.kapaniyor) .dd-kart:not(.dd-cekil), .dd-sorgu:not(.kapaniyor) .dd-delil, .dd-sorgu:not(.kapaniyor) .dd-cali-foto')]
          .map((e) => e.getBoundingClientRect())
          .filter((e) => e.width && e.height)
          .map((e) => ({ l: e.left - kap.left - 6, r: e.right - kap.left + 6, t: e.top - kap.top - 6, b: e.bottom - kap.top + 6 }))
      : [];
    const carpar = (a: typeof k) => engeller.filter((e) => a.l < e.r && a.r > e.l && a.t < e.b && a.b > e.t);
    for (let deneme = 0; deneme < 3; deneme++) {
      const c = carpar(k);
      if (!c.length) break;
      // dikeyde balonla çakışan engellerin, konuşanın iki yanındaki en yakın kenarları: boş şerit
      let sol = pay;
      let sag = kap.width - pay;
      for (const e of engeller) {
        if (!(k.t < e.b && k.b > e.t)) continue;
        if ((e.l + e.r) / 2 < x) sol = Math.max(sol, e.r);
        else sag = Math.min(sag, e.l);
      }
      if (sag - sol < 84) break;
      b.style.maxWidth = `${Math.floor(sag - sol)}px`;
      k = yerlestir(sol, sag);
    }
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
  kinoPoz(p: KinoPoz) {
    const k = this.kino;
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
    const a = hareket.animate(
      [
        { transform: yarida && simdi !== 'none' ? simdi : `translate(${x0}px, ${y0}px)` },
        { transform: `translate(${(x0 + dx) / 2}px, ${Math.min(y0, dy) - (AZ_HAREKET ? 0 : yay)}px) rotate(${yon * 3}deg)`, offset: 0.5 },
        { transform: `translate(${dx}px, ${dy}px)` },
      ],
      { duration: sure(AZ_HAREKET ? 200 : ms), easing: 'cubic-bezier(.45,.1,.4,1)', fill: 'forwards' },
    );
    await a.finished.catch(() => undefined);
  }
  /**
   * Mino yandan yürüyerek gelir: ekranda dx px uzaktan (eksi: soldan) yerine; adımlar yola göre (pati kaymaz).
   * Yan çizim yüklenmediyse önden sekerek gelir.
   */
  async minoYuruyerekGel(dx: number, ms = 1600) {
    const el = this.minoHareket;
    const genis = this.minoYer.offsetWidth || 1;
    const sn = sure(ms) / 1000;
    const dongu = (Math.abs(dx) / genis) * (MINO_KUTU_GENISLIK / MINO_DONGU_YOLU);
    this.yuruyen.el.classList.toggle('sola', dx > 0);
    const yandan = !AZ_HAREKET && this.yuruyen.yuru(Math.min(4.5, Math.max(1.2, dongu / Math.max(0.1, sn))));
    if (!yandan) return this.kaydir('mino', 0, 0, ms, 30);
    this.konumlar.set(this.minoYer, [0, 0]);
    el.getAnimations().forEach((x) => x.cancel());
    const a = el.animate([{ transform: `translate(${dx}px, 0)` }, { transform: 'translate(0, 0)' }], { duration: sure(ms), easing: 'linear', fill: 'forwards' });
    await a.finished.catch(() => undefined);
    this.yuruyen.dur();
    this.yuruyen.el.classList.remove('sola');
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
