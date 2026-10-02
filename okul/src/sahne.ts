/**
 * Etkinlik ekranının ortak sahnesi (bütün ünitelerin etkinlikleri bunu kullanır):
 *  - park arka planı (assets/film/park), üst çubuk (geri, söz balonu, tur noktaları, ses)
 *  - oyun alanı (alan), cevap şeridi (secim), solda Mino, sağda Kino (boylar src/karakter/boy.ts)
 *  - konuşma sırası: Mino = anlatıcı sesi (Mino'nun ağzı oynar), Kino = Kino'nun sesi (dudak senkronu), hayvanlar tonlu
 *  - sayı kartları, ipucu (2 yanlıştan sonra doğru cevap parlar), övgü, nazik "bir daha bakalım" (ceza yok)
 *  - Kino'nun hata anı (kinoHata): Kino komik bir hata yapar, Mino yakalar, çocuk düzeltir
 */
import O from '../../content/okul.json';
import { efekt, KINO_SESI, konus } from '../../src/audio/ses';
import type { KonusmaSecenegi, Soylenecek } from '../../src/audio/konusma';
import { altPayi, boyGenislik, CIZIM } from '../../src/karakter/boy';
import { Karakter, type HareketAdi, type Poz } from '../../src/karakter/karakter';
import { Mino, type Tepki } from '../../src/mino/mino';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { sesDugmesi, yuvarlakDugme } from '../../src/ui/ortak';
import { konfetiPatlat } from '../../src/ui/konfeti';
import { gorsel, parkAdres } from './cizim';
import { AZ_HAREKET, Efekt, oynat } from './efekt';
import { enBuyuk, karistir, sayiSozu, type Rnd, type Yas } from './sayi';
import { ses } from './sesler';

/** Kino'nun kutusu (kare) Mino'nun kutu genişliğine göre: Kino, Mino'nun 0.74 boyu (boy.ts) */
export const KINO_ORAN = boyGenislik('kino', 1);
export const KINO_ALT = altPayi(CIZIM.kino);

export type KinoPoz = 'dusun' | 'kalk' | 'otur' | 'isaret' | null;

/** Konuşan: Mino (anlatıcı), Kino ya da sahnedeki bir hayvan (anlatıcı sesi, tonlu) */
export type Konusan = 'mino' | 'kino' | Oyuncu;

/** Sahnedeki bir hayvan (tavşan, ayı …): ortak iskelet, boy tablosundaki boyunda */
export interface Oyuncu {
  ad: string;
  el: HTMLElement;
  k: Karakter;
  ton: number;
}

/** Yanlış sayacı: 2 yanlıştan sonra doğru cevap(lar) hafifçe parlar */
export class Ipucu {
  private n = 0;
  constructor(private hedefler: () => (Element | null | undefined)[]) {}
  /** yanlış oldu; kaçıncı yanlış */
  yanlis(): number {
    this.n++;
    if (this.n >= 2) this.parlat();
    return this.n;
  }
  get sayi() {
    return this.n;
  }
  parlat() {
    for (const e of this.hedefler()) e?.classList.add('ok-ipucu');
  }
  sifirla() {
    this.n = 0;
    for (const e of this.hedefler()) e?.classList.remove('ok-ipucu');
  }
}

/** Büyük okunur rakam kartı (cevap şeridinde ya da sürüklenen etiket) */
export function rakamKarti(n: number, sinif = ''): HTMLButtonElement {
  return h(`button.ok-rakam${sinif ? '.' + sinif.split(' ').join('.') : ''}`, { type: 'button', 'data-sayi': String(n), 'aria-label': String(n), style: `--r:${RAKAM_RENK[n % RAKAM_RENK.length]}` }, h('b', {}, String(n)));
}
export const RAKAM_RENK = ['#9B5CE0', '#F0413F', '#FF8A2B', '#FFC72C', '#5DBE3F', '#3E9DF2', '#FF7EB6', '#2EC4B6', '#9B5CE0', '#F0413F', '#FF8A2B'];

export interface SahneSecenek {
  id: string;
  yas: Yas;
  rnd: Rnd;
  /** park orta katmanı: salıncaklı (arka-orta) ya da kaydıraklı (arka-orta-2); null: yok */
  orta?: 'arka-orta' | 'arka-orta-2' | null;
  geri: () => void;
  ilkKez: boolean;
}

export class Sahne {
  readonly el: HTMLElement;
  readonly yas: Yas;
  readonly enBuyuk: number;
  readonly rnd: Rnd;
  readonly alan: HTMLElement;
  readonly secim: HTMLElement;
  readonly mino = new Mino();
  readonly kino = new Karakter('kino', h('div'));
  readonly minoYer: HTMLElement;
  readonly kinoYer: HTMLElement;
  readonly efekt: Efekt;
  readonly ilkKez: boolean;
  private yazi = h('span.ok-balon-yazi');
  private sonSoz: Soylenecek = '';
  private sonKim: Konusan = 'mino';
  private kinoBalon = h('div.ok-kino-balon', { 'aria-hidden': 'true' });
  private turlarEl = h('div.ok-turlar', { 'aria-hidden': 'true' });
  private kinoHareket: HTMLElement;
  private kapali = false;
  private zamanlar: number[] = [];
  private temizlikler: (() => void)[] = [];
  private sira: Promise<void> = Promise.resolve();
  private yukSol = 0;
  private yukSag = 0;

  constructor(o: SahneSecenek) {
    this.yas = o.yas;
    this.enBuyuk = enBuyuk(o.yas);
    this.rnd = o.rnd;
    this.ilkKez = o.ilkKez;
    const arka = (ad: string, sinif: string) => h(`div.${sinif}`, { style: `background-image:url("${parkAdres(ad)}")` });
    const orta = o.orta === undefined ? 'arka-orta' : o.orta;
    this.alan = h('div.ok-alan');
    this.secim = h('div.ok-secim');
    this.minoYer = h('div.ok-mino-yer', {}, this.mino.el);
    this.kinoHareket = h('div.ok-kino-hareket', {}, h('i.ok-golge'), this.kino.el, this.kinoBalon);
    this.kinoYer = h('div.ok-kino-yer', { 'data-karakter-kap': 'kino', style: `--ko:${KINO_ORAN.toFixed(3)};--ka:${KINO_ALT.toFixed(3)}` }, this.kinoHareket);
    const balon = h('div.baslik-balon.ok-balon', {}, yuvarlakDugme(IKON.hoparlor, 'Tekrar dinle', () => this.tekrarDinle(), 'kucuk'), this.yazi);
    const geri = yuvarlakDugme(IKON.geri, 'Geri', () => o.geri(), 'kucuk ok-geri');
    this.el = h(
      'div.ok-etkinlik',
      { 'data-etkinlik': o.id },
      h('div.ok-park', { 'aria-hidden': 'true' }, arka('arka-uzak', 'ok-gok'), orta ? arka(orta, 'ok-orta') : null, arka('arka-on', 'ok-on')),
      h('div.ust-cubuk.ok-ust', {}, geri, h('div.orta', {}, balon, this.turlarEl), sesDugmesi()),
      h('div.ok-govde', {}, this.alan, this.secim, this.minoYer, this.kinoYer),
    );
    this.efekt = new Efekt(this.el);
    this.el.append(this.efekt.el);
    // dokununca tepki (canlılık)
    this.mino.el.addEventListener('pointerdown', () => this.minoTepki('gidik'));
    this.kinoYer.addEventListener('pointerdown', () => {
      efekt.dokunma();
      this.kinoOynat('sevin', 800);
      this.kinoIfade('heyecan', 800);
    });
    this.kino.ekHareket = (p: Poz) => {
      p.yukSol = this.yukSol;
      p.yukSag = this.yukSag;
    };
  }

  // ---------------------------------------------------------------- yaşam döngüsü
  kapandi() {
    return this.kapali;
  }
  kapaninca(fn: () => void) {
    this.temizlikler.push(fn);
  }
  kapat() {
    this.kapali = true;
    this.zamanlar.forEach(clearTimeout);
    this.temizlikler.forEach((f) => {
      try {
        f();
      } catch {
        /* yok say */
      }
    });
    this.mino.kapat();
    this.kino.kapat();
  }
  /** Bekler (test modunda kısa); sahne kapanınca da çözülür */
  bekle(ms: number): Promise<void> {
    return new Promise((r) => {
      if (this.kapali) return r();
      this.zamanlar.push(window.setTimeout(r, sure(ms)));
    });
  }
  sonra(ms: number, fn: () => void) {
    this.zamanlar.push(window.setTimeout(() => !this.kapali && fn(), sure(ms)));
  }

  // ---------------------------------------------------------------- konuşma
  /** Sırayla söyler (öncekinin bitmesini bekler). Mino'nun sözleri üst balonda, Kino'nunki başının üstünde yazar. */
  soyle(soz: Soylenecek, kim: Konusan = 'mino'): Promise<void> {
    const is = this.sira.then(async () => {
      if (this.kapali) return;
      const metin = (Array.isArray(soz) ? soz : [soz]).filter(Boolean).join(' ');
      let secenek: KonusmaSecenegi = {};
      if (kim === 'mino') {
        this.yazi.textContent = metin;
        this.sonSoz = soz;
        this.sonKim = kim;
      } else if (kim === 'kino') {
        secenek = KINO_SESI;
        this.kinoBalon.textContent = metin;
        this.kinoBalon.classList.add('acik');
        this.kino.konus(true);
      } else {
        secenek = { ton: kim.ton };
        kim.k.konus(true);
        kim.el.dataset.konusuyor = '1';
        const b = kim.el.querySelector('.ok-oyuncu-balon');
        if (b) {
          b.textContent = metin;
          b.classList.add('acik');
        }
      }
      this.mino.agizSus = kim !== 'mino';
      try {
        await konus(soz, secenek);
      } finally {
        this.mino.agizSus = false;
        if (kim === 'kino') {
          this.kino.konus(false);
          const b = this.kinoBalon;
          this.sonra(600, () => b.classList.remove('acik'));
        } else if (kim !== 'mino') {
          kim.k.konus(false);
          delete kim.el.dataset.konusuyor;
          const b = kim.el.querySelector('.ok-oyuncu-balon');
          this.sonra(600, () => b?.classList.remove('acik'));
        }
      }
    });
    this.sira = is.catch(() => undefined);
    return is;
  }
  private tekrarDinle() {
    if (this.sonSoz) void konus(this.sonSoz, this.sonKim === 'kino' ? KINO_SESI : {});
  }
  /** Üst balonun yazısı (söylemeden) */
  yaz(t: string) {
    this.yazi.textContent = t;
    this.sonSoz = t;
  }
  /** "Bir!", "İki!" … */
  say(n: number, kim: Konusan = 'mino') {
    return this.soyle(sayiSozu(n), kim);
  }
  /** 1'den n'e sayar; her sayıda her(i) çağrılır (elmalar sırayla parlar) */
  async sayarak(n: number, her?: (i: number) => void) {
    for (let i = 1; i <= n; i++) {
      if (this.kapali) return;
      her?.(i);
      ses.pit(i - 1);
      await Promise.all([this.say(i), this.bekle(380)]);
    }
  }
  /** Övgü: Mino zıplar, Kino sevinir, "Aferin!" */
  async ovgu(el?: Element | null) {
    efekt.dogru();
    this.minoTepki('zipla');
    this.kinoOynat('sevin', 900);
    this.kinoIfade('heyecan', 1000);
    if (el) {
      const [x, y] = this.efekt.merkez(el);
      this.efekt.parilti(x, y, 9);
    }
    const o = O.mino.ovgu;
    await this.soyle(o[Math.floor(this.rnd() * o.length)]);
  }
  /** Nazik "bir daha bakalım": ceza yok; nesne hafifçe sallanır, Mino düşünür */
  nazik(el?: Element | null) {
    ses.hmm();
    oynat(el, 'ok-hmm');
    this.minoTepki('kararsiz', 1.2);
    this.kinoIfade('saskin', 900);
  }

  // ---------------------------------------------------------------- tur noktaları
  turlar(n: number) {
    this.turlarEl.replaceChildren(...Array.from({ length: n }, () => h('i')));
  }
  tur(biten: number) {
    [...this.turlarEl.children].forEach((e, i) => e.classList.toggle('tamam', i < biten));
    this.el.dataset.tur = String(biten);
  }
  /** Ekranın hangi adımda olduğu (testler ve gösterim için) */
  adim(ad: string) {
    this.el.dataset.adim = ad;
  }

  // ---------------------------------------------------------------- karakterler
  minoTepki(t: Tepki, sn?: number) {
    if (!AZ_HAREKET) this.mino.tepki(t, sn);
  }
  kinoOynat(ad: HareketAdi, ms: number) {
    if (!AZ_HAREKET) void this.kino.oynat(ad, ms);
  }
  kinoIfade(ad: string | null, ms = 0) {
    if (!ad || this.kino.ifadeVar(ad)) this.kino.ifade(ad, ms);
  }
  /**
   * Kino'nun duruşu: düşünür (pati çenede), kalk (iki kol havada), otur, işaret (bir kol kalkık, gözler o yana).
   * Katmanlar iskelette yoksa (yüklenmediyse) bir şey olmaz.
   */
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
  /**
   * Kino sahnede bir yere gider (ekran noktasına, ayakları oraya basar) zıplayarak; kinoDon() ile yerine döner.
   */
  async kinoGit(x: number, y: number, ms = 700): Promise<void> {
    const r = this.kinoYer.getBoundingClientRect();
    const k = this.el.getBoundingClientRect();
    const ayakX = r.left - k.left + r.width / 2;
    const ayakY = r.bottom - k.top - r.height * KINO_ALT;
    await this.kinoKaydir(x - ayakX, y - ayakY, ms);
  }
  kinoDon(ms = 600) {
    return this.kinoKaydir(0, 0, ms);
  }
  private kinoKonum: [number, number] = [0, 0];
  private async kinoKaydir(dx: number, dy: number, ms: number) {
    const [x0, y0] = this.kinoKonum;
    this.kinoKonum = [dx, dy];
    this.kinoOynat('yuru', ms);
    const a = this.kinoHareket.animate(
      [
        { transform: `translate(${x0}px, ${y0}px)` },
        { transform: `translate(${(x0 + dx) / 2}px, ${Math.min(y0, dy) - 40}px)`, offset: 0.5 },
        { transform: `translate(${dx}px, ${dy}px)` },
      ],
      { duration: sure(AZ_HAREKET ? 200 : ms), easing: 'cubic-bezier(.45,.1,.4,1)', fill: 'forwards' },
    );
    await a.finished.catch(() => undefined);
  }

  /** Sahneye bir hayvan koyar (tavşan, ayı, ördek, maymun …): boy tablosundaki boyunda, gölgesiyle */
  oyuncu(ad: string, ton = 1.12): Oyuncu {
    const yedekUrl = gorsel(`hayvanlar/${ad}`);
    const k = new Karakter(ad, yedekUrl ? h('img', { src: yedekUrl, alt: '', draggable: 'false' }) : h('div'));
    const c = CIZIM[ad];
    const el = h(
      'div.ok-oyuncu',
      { 'data-oyuncu': ad, style: `--oo:${boyGenislik(ad, 1).toFixed(3)};--oa:${(c ? altPayi(c) : 0.05).toFixed(3)}` },
      h('i.ok-golge'),
      k.el,
      h('div.ok-oyuncu-balon', { 'aria-hidden': 'true' }),
    );
    this.kapaninca(() => k.kapat());
    return { ad, el, k, ton };
  }

  // ---------------------------------------------------------------- Kino'nun hata anı
  /**
   * Kino komik bir hata yapar (kendi sesiyle), Mino yakalar ve düzeltir; çocuk "bilen" taraf olur.
   * once: Kino konuşurken oynayan görüntü (ör. aynı elmayı iki kez gösterir); sonra: Mino'dan sonra (ör. kart döner).
   */
  async kinoHata(o: { kino: string; mino?: string; kinoSon?: string; poz?: KinoPoz; once?: () => Promise<void> | void; sonra?: () => Promise<void> | void }) {
    if (this.kapali) return;
    this.el.dataset.kinoHata = '1';
    const onceki = this.el.dataset.adim ?? 'oyun';
    this.adim('kino-hata');
    this.kinoPoz(o.poz === undefined ? 'isaret' : o.poz);
    this.kinoIfade('heyecan', 1600);
    this.kinoOynat('sevin', 700);
    await Promise.all([this.soyle(o.kino, 'kino'), o.once?.()]);
    this.kinoPoz(null);
    if (o.mino) {
      this.minoTepki('sasir');
      void this.mino.poz('isaret-sag');
      this.kinoIfade('saskin', 1400);
      await this.soyle(o.mino);
      void this.mino.poz(null);
    }
    await o.sonra?.();
    if (o.kinoSon) {
      this.kinoIfade('keyif', 1400);
      this.kinoOynat('huy', 900);
      await this.soyle(o.kinoSon, 'kino');
    }
    this.adim(onceki === 'kino-hata' ? 'oyun' : onceki);
  }

  // ---------------------------------------------------------------- sayı kartları
  /**
   * Cevap şeridinde sayı kartları; doğru karta dokunulunca çözülür. Yanlışta kart nazikçe sallanır, `yanlis`
   * çağrılır (ör. Mino elmaları sayar); 2 yanlıştan sonra doğru kart parlar.
   */
  kartSec(sayilar: number[], dogru: number, o: { yanlis?: (n: number) => Promise<void> | void } = {}): Promise<void> {
    const kartlar = sayilar.map((n, i) => {
      const b = rakamKarti(n, 'ok-cevap');
      b.style.setProperty('--i', String(i));
      if (TEST_MODU && n === dogru) b.dataset.dogru = '1';
      return b;
    });
    const ipucu = new Ipucu(() => kartlar.filter((k) => Number(k.dataset.sayi) === dogru));
    this.secim.replaceChildren(h('div.ok-kartlar', {}, ...kartlar));
    this.adim('kart');
    let mesgul = false;
    return new Promise<void>((coz) => {
      for (const b of kartlar) {
        b.addEventListener('click', async () => {
          if (mesgul || this.kapali) return;
          const n = Number(b.dataset.sayi);
          if (n === dogru) {
            mesgul = true;
            ses.tik();
            b.classList.add('ok-dogru');
            kartlar.forEach((k) => k !== b && k.classList.add('ok-solgun'));
            await this.ovgu(b);
            await this.say(dogru);
            this.secim.replaceChildren();
            coz();
            return;
          }
          mesgul = true;
          this.nazik(b);
          ipucu.yanlis();
          await (o.yanlis ? o.yanlis(n) : this.soyle(O.mino.tekrar));
          mesgul = false;
        });
      }
    });
  }

  /** Konfeti (ekranın bir noktasından) */
  konfeti(x = 0.5, y = 0.35, adet = 80) {
    if (AZ_HAREKET) return;
    const r = this.el.getBoundingClientRect();
    konfetiPatlat(this.el, r.width * x, r.height * y, adet);
  }

  /** Karışık sıra (sahnenin rastgelesiyle) */
  karistir<T>(a: T[]): T[] {
    return karistir(a, this.rnd);
  }
}

