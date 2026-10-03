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
import { Mino, type Tepki } from '../../src/mino/mino';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { AZ_HAREKET } from './dunya';

/** Kino'nun kutusu Mino'nun kutu genişliğine göre (Mino kutusu 1360 × 1790; Kino 0.74 boy) */
export const KINO_ORAN = boyGenislik('kino', 1);
export const KINO_ALT = altPayi(CIZIM.kino);
export const PAMUK_ORAN = boyGenislik('pamuk', 1);
export const PAMUK_ALT = altPayi(CIZIM.pamuk);

export type Kim = 'mino' | 'kino' | 'pamuk' | 'kart';
/** Konuşanın sesi: kart hayvanları ve Pamuk anlatıcı kaydının tonlu çalınışı */
export const SES: Record<Kim, KonusmaSecenegi> = {
  mino: {},
  kino: KINO_SESI,
  pamuk: { ton: 1.22 },
  kart: {},
};
/** Kart hayvanlarının tonu (zürafa kalın, ördek ince) */
export const KART_TON: Record<string, number> = { zurafa: 0.8, ordek: 1.32, siyah: 0.9 };

export type KinoPoz = 'dusun' | 'kalk' | 'isaret' | 'otur' | null;

/** Balon: konuşanın başının üstünde, kısa süre */
function balon(): HTMLElement {
  return h('div.dd-balon', { 'aria-hidden': 'true' }, h('span'));
}

export class Oyuncular {
  readonly el: HTMLElement;
  readonly mino = new Mino();
  readonly kino = new Karakter('kino', h('div'));
  pamuk: Karakter | null = null;
  readonly minoYer: HTMLElement;
  readonly kinoYer: HTMLElement;
  pamukYer: HTMLElement | null = null;
  private minoHareket: HTMLElement;
  private kinoHareket: HTMLElement;
  private pamukHareket: HTMLElement | null = null;
  private balonlar: Record<'mino' | 'kino' | 'pamuk', HTMLElement> = { mino: balon(), kino: balon(), pamuk: balon() };
  private sira: Promise<void> = Promise.resolve();
  private kapali = false;
  private yukSol = 0;
  private yukSag = 0;
  private kinoEk: ((p: Poz, t: number) => void) | null = null;
  /** son söylenen (tekrar dinle) */
  son: { soz: Soylenecek; kim: Kim; ton?: number } | null = null;

  constructor() {
    this.minoHareket = h('div.dd-hareket', {}, h('i.dd-golge'), this.mino.el, this.balonlar.mino);
    this.minoYer = h('div.dd-oyuncu.dd-mino-yer', { 'data-oyuncu': 'mino' }, this.minoHareket);
    this.kinoHareket = h('div.dd-hareket', {}, h('i.dd-golge'), h('div.dd-kino-kutu', {}, this.kino.el), this.balonlar.kino);
    this.kinoYer = h('div.dd-oyuncu.dd-kino-yer', { 'data-oyuncu': 'kino', style: `--ko:${KINO_ORAN.toFixed(3)};--ka:${KINO_ALT.toFixed(3)}` }, this.kinoHareket);
    this.el = h('div.dd-oyuncular', {}, this.minoYer, this.kinoYer);
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
    this.pamukHareket = h('div.dd-hareket', {}, h('i.dd-golge'), h('div.dd-pamuk-kutu', {}, this.pamukEkran.el), this.balonlar.pamuk);
    this.pamukYer = h('div.dd-oyuncu.dd-pamuk-yer', { 'data-oyuncu': 'pamuk', style: `--po:${PAMUK_ORAN.toFixed(3)};--pa:${PAMUK_ALT.toFixed(3)}` }, this.pamukHareket);
    this.el.append(this.pamukYer);
    return this.pamukEkran;
  }
  private pamukEkran: Karakter | null = null;
  /** Yatak odasındaki (dünyadaki) Pamuk konuşsun: balon onun kabına taşınır */
  pamukBagla(k: Karakter, kap: HTMLElement) {
    this.pamuk = k;
    kap.append(this.balonlar.pamuk);
  }

  kapat() {
    this.kapali = true;
    this.mino.kapat();
    this.kino.kapat();
    this.pamuk?.kapat();
    this.pamukEkran?.kapat();
  }

  // ---------------------------------------------------------------- konuşma
  /** Sırayla söyler (öncekinin bitmesini bekler); ton: kart hayvanının tonu */
  soyle(soz: Soylenecek, kim: Kim = 'mino', ton?: number): Promise<void> {
    const is = this.sira.then(async () => {
      if (this.kapali) return;
      const metin = (Array.isArray(soz) ? soz : [soz]).filter(Boolean).join(' ');
      const secenek: KonusmaSecenegi = ton ? { ...SES[kim], ton } : SES[kim];
      this.son = { soz, kim, ton };
      const b = kim === 'kart' ? null : this.balonlar[kim];
      if (b) {
        b.querySelector('span')!.textContent = metin;
        b.classList.remove('acik');
        void b.offsetWidth;
        b.classList.add('acik');
      }
      if (kim === 'kino') this.kino.konus(true);
      if (kim === 'pamuk') this.pamuk?.konus(true);
      this.mino.agizSus = kim !== 'mino';
      try {
        await konus(soz, secenek);
        if (TEST_MODU) await new Promise((r) => setTimeout(r, 10));
      } finally {
        this.mino.agizSus = false;
        if (kim === 'kino') this.kino.konus(false);
        if (kim === 'pamuk') this.pamuk?.konus(false);
        if (b) setTimeout(() => b.classList.remove('acik'), sure(700));
      }
    });
    this.sira = is.catch(() => undefined);
    return is;
  }
  /** Son cümleyi tekrar söyler */
  tekrar() {
    const s = this.son;
    if (s) void this.soyle(s.soz, s.kim, s.ton);
  }

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
  /** Kino'nun duruşu (okul/src/sahne.ts kinoPoz ile aynı katmanlar): düşünür, kalk, işaret, otur */
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
    const a = hareket.animate(
      [
        { transform: `translate(${x0}px, ${y0}px)` },
        { transform: `translate(${(x0 + dx) / 2}px, ${Math.min(y0, dy) - (AZ_HAREKET ? 0 : yay)}px) rotate(${yon * 3}deg)`, offset: 0.5 },
        { transform: `translate(${dx}px, ${dy}px)` },
      ],
      { duration: sure(AZ_HAREKET ? 200 : ms), easing: 'cubic-bezier(.45,.1,.4,1)', fill: 'forwards' },
    );
    await a.finished.catch(() => undefined);
  }
  /** Yerinde zıplama (esneyip basılır) */
  zipla(kim: 'mino' | 'kino' | 'pamuk', yukseklik = 18, ms = 620) {
    const yer = kim === 'mino' ? this.minoYer : kim === 'kino' ? this.kinoYer : this.pamukYer;
    const govde = yer?.querySelector<HTMLElement>(':scope > .dd-hareket > :is(.mino, .dd-kino-kutu, .dd-pamuk-kutu)');
    if (!govde || AZ_HAREKET) return Promise.resolve();
    return govde
      .animate(
        [
          { transform: 'translateY(0) scale(1, 1)' },
          { transform: 'translateY(0) scale(1.12, 0.86)', offset: 0.18 },
          { transform: `translateY(-${yukseklik * 0.85}%) scale(0.92, 1.1)`, offset: 0.4 },
          { transform: `translateY(-${yukseklik}%) scale(1, 1)`, offset: 0.52 },
          { transform: 'translateY(0) scale(1.14, 0.86)', offset: 0.8 },
          { transform: 'translateY(0) scale(1, 1)' },
        ],
        { duration: sure(ms), easing: 'cubic-bezier(0.45, 0, 0.3, 1)' },
      )
      .finished.catch(() => undefined);
  }
  /** Yerleşim: iki yan (Mino solda, Kino sağda), ikisi solda, ikisi sağda, kenar (ikisi de ekranın kenarına çekilir) */
  yerlesim(d: 'iki' | 'sol' | 'sag' | 'kenar') {
    this.el.dataset.yerlesim = d;
  }
}
