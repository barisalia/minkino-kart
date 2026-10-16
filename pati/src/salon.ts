/**
 * Pati Dükkânı v2 · Salon: satın alınan yavruların köşeleri (PATI-V2 §4c), mutluluk (3 kalp), dans ve jeton.
 * Paket 2 bunu kaydırmalı dükkânın bir bölümü yapar (dukkan.ts) ve hayvana dokununca Bakım Odası'nı açar
 * (SalonOrtam.hayvanSecildi). Kalp kaynakları paket 2-3'te kalpKazan() ile gelir.
 *
 *  - Yeni yavru kapıdan girer, hoplaya hoplaya kendi oyuğuna gider, koklar. Nehir: "Hoş geldin!"
 *  - İsim tabelası: hayvanın adı. Dokununca 9 ad (kendi adı + 8 ortak ad) açılır; her ada dokununca Nehir adı söyler,
 *    hayvan yeni adına döner, bir kez zıplar. İsteğe bağlı.
 *  - Minder: 4 renk. Biri oyuğa sürüklenir (ya da dokunulur): minder yay çizip iner, hayvan döner ve üstüne yatar.
 *    Minderini ilk bulması 1 kalp.
 *  - Okşama: parmakla YAVAŞ sürtünce gözlerini kapayıp yaslanır (kedi mırlar), kalp dolar. HIZLI sürtünce irkilir
 *    (komik, cezasız). Dokununca kendi sevimli hareketi.
 *  - 3 kalp: kalpler zıplar, hayvan 3 dans pozuyla ritimde dans eder, ayağının dibine jeton düşer. Jetona dokununca
 *    kumbaraya uçar; 6 sn içinde toplanmazsa kendisi uçar. Hiçbir jeton kaybolmaz (kayda hemen yazılır).
 *  - Hiçbir şey kötüleşmez; hiçbir animasyon girdiyi kilitlemez.
 */
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { elSurukle, icinde, Tutulan } from '../../kino-otobus/src/dokunsal';
import type { Efekt } from '../../kino-otobus/src/efekt';
import { dolapEl, ezil, isimTabelasi, jetonEl, jetonUcur, KalpSirasi, minderEl, type Kumbara } from './arayuz';
import { Dekor } from './dekor';
import { jetonParcalari } from './ekonomi';
import { Hayvan } from './hayvan';
import { adSecenekleri, hayvanBilgi, KALP_SAYISI, MINDERLER, NEHIR2, type MinderRenk, type Yas } from './katalog';
import type { PatiKayit, SahipHayvan } from './kayit';
import { dansBitti, dinleniyor, kalpEkle, type KalpKaynagi } from './mutluluk';
import type { Nehir } from './nehir';
import { ses } from './sesler';
import { dolayliHareket } from './bakim-odasi';
import { IHTIYAC_HAL } from './hayvan';
import type { YardimAdimi } from './ihtiyac';
import { ihtiyacCekmecesi } from './katalog';
import { IP, IP_KUTU, pozAdresi, pozVar, SALON, type Poz } from './varliklar';

const AZ = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const sakin = () => AZ || TEST_MODU;
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, sure(ms)));
const ras = (a: number, b: number) => a + Math.random() * (b - a);

/** Salonun üç oyuğu (salon-gunduz çizimi, sahne birimi; v1 sahne.ts KOSE ile aynı) */
const OYUK = [
  { x0: 690, y0: 490, x1: 1289, y1: 1045 },
  { x0: 1373, y0: 490, x1: 1979, y1: 1045 },
  { x0: 2062, y0: 490, x1: 2658, y1: 1045 },
];
/** Oyuğun kesiti (dikey telefonda oyuklar bu kesitlerle 2 sütun dizilir; yatayda çizimin üstünde aynı yerde) */
const KESIT = OYUK.map((k) => ({ x0: k.x0 - 34, y0: k.y0 - 92, x1: k.x1 + 34, y1: k.y1 + 64 }));
const ZEMIN = 1034;
/** Mantar pano (salon-gunduz çizimi, sol duvar; sahne birimi) */
const PANO = { x0: 382, y0: 500 };
const BOY = 430;
const MINDER_EN = 380;
/** Minderin üstünde hayvan bu kadar yükselir */
const MINDER_YUK = 30;
/** Okşamanın kalbi: aynı hayvana en çok bu aralıkla (yoksa üç okşamada dans: bakım odası paket 2'de asıl kaynak) */
const OKSAMA_KALP_MS = TEST_MODU ? 200 : 4500;
/** Düşen jeton bu kadar sonra kendisi kumbaraya uçar */
const JETON_KENDI_MS = 6000;
/** Hayvanın sözü: kayıtlı "X sana bayıldı!" (v1) yalnız kendi adıyla; yoksa "Çok mutlu!" */
const BAYILDI: Record<string, string> = { findik: 'Fındık sana bayıldı!', tarcin: 'Tarçın sana bayıldı!', piril: 'Pırıl sana bayıldı!' };

interface Yer {
  i: number;
  /** oyuğun kesiti: hayvan, minder ve dokunma alanı burada (yerel birim: kesitin sol üstü 0,0) */
  kap: HTMLElement;
  alan: HTMLElement;
  sahip: SahipHayvan | null;
  hayvan: Hayvan | null;
  minder: HTMLElement | null;
  kalpler: KalpSirasi;
  tabela: HTMLButtonElement;
  mesgul: boolean;
  sonOksamaKalp: number;
  sonDokunma: number;
}

export interface SalonOrtam {
  efekt: Efekt;
  nehir: Nehir;
  kumbara: Kumbara;
  kayit: PatiKayit;
  kaydet: () => void;
  yas: () => Yas;
  /** paket 2: hayvana dokununca Bakım Odası (yoksa okşama ve dokunuş burada) */
  hayvanSecildi?: (h: SahipHayvan) => boolean;
  etkilesim?: () => void;
  /** lamba ipi çekildi (akşam / gece; dükkân karar verir) */
  ipCek?: () => void;
  /** hayvan uyuyor mu (akşam: yatağını seçen hayvan uyur) */
  uyuyor?: (id: string) => boolean;
}

export class Salon {
  readonly el: HTMLElement;
  readonly dekor: Dekor;
  private ui: HTMLElement;
  private tepsi: HTMLElement;
  private adlar: HTMLElement;
  private yerler: Yer[] = [];
  private birak: (() => void)[] = [];
  private zamanlar: number[] = [];
  private kapandi = false;
  private adYer: Yer | null = null;
  private dusenler = new Set<HTMLElement>();
  private toplanan = 0;
  private sonEtkilesim = performance.now();
  /** 3-4 resim balonları (yardım merdiveni 25 sn): hayvan → balon */
  private balonlar = new Map<string, HTMLElement>();
  /** lamba ipi: salon çiziminin kendi ipi (yatay) ya da sağ üstte sarkan ip (dikey) */
  readonly ip: HTMLElement;
  private ipOrtu: HTMLElement;
  private ipAlan: HTMLButtonElement;
  /** panodaki polaroidler (yatay; mantar pano çizimin üstünde) */
  private pano: HTMLElement;

  constructor(private o: SalonOrtam) {
    this.dekor = new Dekor(SALON, { yatay: { x0: 690, y0: 430, x1: 2658, y1: 1150 }, dikey: { x0: 670, y0: 60, x1: 2678, y1: 1120 }, dikeyUst: (H) => Math.max(40, H * 0.06) });
    this.ui = h('div.pt-salon-ui');
    this.tepsi = h('div.pt-tepsi', { 'aria-label': 'Minderler' });
    this.adlar = h('div.pt-adlar', { role: 'dialog', 'aria-label': 'Adlar' });
    this.el = h('div.pt-panel.pt-salon-panel', { 'data-panel': 'salon' }, this.dekor.el, this.ui, this.tepsi, this.adlar);
    OYUK.forEach((k, i) => {
      const ks = KESIT[i];
      const alan = h('div.pt-yer', { 'data-yer': String(i), style: `left:${k.x0 - ks.x0}px;top:${k.y0 - 40 - ks.y0}px;width:${k.x1 - k.x0}px;height:${k.y1 - k.y0 + 70}px` });
      const kap = h('div.pt-oyuk', { 'data-oyuk': String(i), style: `width:${ks.x1 - ks.x0}px;height:${ks.y1 - ks.y0}px;--x0:${ks.x0}px;--y0:${ks.y0}px;--salon:url("${SALON}")` }, alan);
      this.dekor.katman.append(kap);
      const kalpler = new KalpSirasi(KALP_SAYISI);
      const tabela = isimTabelasi('');
      tabela.dataset.yer = String(i);
      tabela.addEventListener('click', () => this.adlariAc(this.yerler[i]));
      kalpler.el.dataset.yer = String(i);
      this.ui.append(kalpler.el, tabela);
      const yer: Yer = { i, kap, alan, sahip: null, hayvan: null, minder: null, kalpler, tabela, mesgul: false, sonOksamaKalp: 0, sonDokunma: 0 };
      this.oksamaBagla(yer);
      this.yerler.push(yer);
    });
    for (const r of MINDERLER) {
      const b = h('button.pt-minder-sec', { type: 'button', 'data-renk': r, 'aria-label': r }, minderEl(r)) as HTMLButtonElement;
      b.addEventListener('click', () => {
        const hedef = this.minderHedefi();
        if (hedef) void this.minderKoy(hedef, r, b);
      });
      this.birak.push(elSurukle(b, this.minderSurukle(r, b)));
      this.tepsi.append(b);
    }
    this.adlar.addEventListener('click', (e) => {
      if (e.target === this.adlar) this.adlariKapat();
    });
    // lamba ipi: çizimdeki ip duvar rengiyle örtülür, kesilmiş ip tam üstüne oturur (çekilince esner)
    const [ix0, iy0, ix1, iy1] = IP_KUTU;
    this.ipOrtu = h('div.pt-ip-ortu', { style: `left:${ix0 + 6}px;top:${iy0 + 6}px;width:${ix1 - ix0 - 12}px;height:${iy1 - iy0 - 12}px` });
    this.ip = h('div.pt-ip', { style: `left:${ix0}px;top:${iy0}px;width:${ix1 - ix0}px;height:${iy1 - iy0}px` }, h('img', { src: IP, alt: '', draggable: 'false' }));
    this.ipAlan = h('button.pt-ip-alan2', { type: 'button', 'aria-label': 'Lamba ipi' }) as HTMLButtonElement;
    this.ipBagla();
    this.pano = h('div.pt-pano');
    this.dekor.katman.append(this.ipOrtu, this.ip, this.pano);
    this.el.append(this.ipAlan);
    this.dekor.degisti = () => this.yerlesim();
    this.kur();
    requestAnimationFrame(() => this.dekor.kur());
    this.zamanlar.push(window.setInterval(() => this.canli(), 900));
  }

  // ---------------------------------------------------------------- kurulum
  /** Kayıttaki salon hayvanlarını yerlerine koyar */
  kur() {
    for (const yer of this.yerler) this.yerBosalt(yer);
    for (const s of this.o.kayit.hayvanlar.filter((x) => x.kose === 'salon')) {
      const yer = this.yerler[s.yer];
      if (!yer) continue;
      this.yerDoldur(yer, s);
      yer.hayvan!.x = this.ortaX(yer);
    }
    this.tepsiGuncelle();
    this.uiYerlesim();
  }
  /** oyuğun ortası ve zemin (kesitin yerel biriminde) */
  private ortaX = (yer: Yer) => (OYUK[yer.i].x0 + OYUK[yer.i].x1) / 2 - KESIT[yer.i].x0;
  private zemin = (yer: Yer) => ZEMIN - KESIT[yer.i].y0;
  /** Kesitin yerel noktası → ekran (client) noktası */
  private ekranda(yer: Yer, x: number, y: number): [number, number] {
    const r = yer.kap.getBoundingClientRect();
    const s = r.width / (yer.kap.offsetWidth || 1);
    return [r.left + x * s, r.top + y * s];
  }
  private olcek(yer: Yer) {
    return yer.kap.getBoundingClientRect().width / (yer.kap.offsetWidth || 1);
  }

  /** Yatay: kesitler çizimin üstünde kendi yerinde. Dikey: 2 sütun (ölçek ≤ 1/3, netlik); tepsi altlarında */
  private yerlesim() {
    const W = this.el.clientWidth || 844;
    const H = this.el.clientHeight || 390;
    const dikey = H > W;
    this.el.classList.toggle('pt-dikey', dikey);
    if (!dikey) {
      for (const yer of this.yerler) {
        const ks = KESIT[yer.i];
        if (yer.kap.parentElement !== this.dekor.katman) this.dekor.katman.append(yer.kap);
        yer.kap.classList.remove('pt-kesit');
        yer.kap.style.transform = `translate(${ks.x0}px, ${ks.y0}px)`;
      }
    } else {
      const kw = KESIT[0].x1 - KESIT[0].x0;
      const kh = KESIT[0].y1 - KESIT[0].y0;
      const pay = 12;
      const ara = 10;
      const s = Math.min(1 / 3, (W - 2 * pay - ara) / (2 * kw));
      const sol = (W - (2 * kw * s + ara)) / 2;
      const ust = Math.max(70, H * 0.085);
      this.yerler.forEach((yer, i) => {
        const c = i % 2;
        const r = Math.floor(i / 2);
        if (yer.kap.parentElement !== this.el) this.el.insertBefore(yer.kap, this.ui);
        yer.kap.classList.add('pt-kesit');
        yer.kap.style.transform = `translate(${(sol + c * (kw * s + ara)).toFixed(1)}px, ${(ust + r * (kh * s + ara)).toFixed(1)}px) scale(${s.toFixed(5)})`;
      });
      this.el.style.setProperty('--salon-alt', `${(ust + 2 * kh * s + ara).toFixed(0)}px`);
      // tepsi: üçüncü oyuğun yanında
      this.el.style.setProperty('--tepsi-sol', `${(sol + kw * s + ara).toFixed(0)}px`);
      this.el.style.setProperty('--tepsi-ust', `${(ust + kh * s + ara).toFixed(0)}px`);
      this.el.style.setProperty('--tepsi-en', `${(kw * s).toFixed(0)}px`);
    }
    this.uiYerlesim();
    this.ipYerlesim();
    this.balonYerlesim();
    // ilk kurulumda ölçüler bir kare sonra oturur (kalpler ve tabelalar üst üste kalıyordu)
    requestAnimationFrame(() => {
      if (this.kapandi) return;
      this.uiYerlesim();
      this.ipYerlesim();
      this.balonYerlesim();
    });
  }
  private yerBosalt(yer: Yer) {
    yer.hayvan?.kapat();
    yer.hayvan?.el.remove();
    yer.minder?.remove();
    yer.hayvan = null;
    yer.minder = null;
    yer.sahip = null;
    yer.alan.dataset.hayvan = '';
    yer.kalpler.el.classList.add('pt-gizli');
    yer.tabela.classList.add('pt-gizli');
  }
  private yerDoldur(yer: Yer, s: SahipHayvan, x = this.ortaX(yer)) {
    yer.sahip = s;
    const hv = new Hayvan({ ad: s.id, boy: BOY, x, y: this.zemin(yer) });
    yer.hayvan = hv;
    yer.alan.dataset.hayvan = s.id;
    this.halUygula(yer);
    yer.kap.insertBefore(hv.el, yer.alan);
    if (s.minder) this.minderCiz(yer, s.minder);
    yer.kalpler.ayarla(s.kalp);
    yer.kalpler.el.classList.remove('pt-gizli');
    yer.tabela.querySelector('.pt-tabela-ad')!.textContent = s.ad;
    yer.tabela.classList.remove('pt-gizli');
  }
  private minderCiz(yer: Yer, r: MinderRenk) {
    yer.minder?.remove();
    const m = minderEl(r, 'pt-oyuk-minder');
    m.style.cssText += `;left:${this.ortaX(yer) - MINDER_EN / 2}px;top:${this.zemin(yer) - 128}px;width:${MINDER_EN}px`;
    m.dataset.yer = String(yer.i);
    yer.kap.insertBefore(m, yer.hayvan?.el ?? yer.alan);
    yer.minder = m;
    yer.hayvan?.minderde(true, MINDER_YUK);
  }

  /** Kalp sırası ve tabela ekranda (dekor ölçeğinden bağımsız, okunur boyda) */
  private uiYerlesim() {
    const p = this.el.getBoundingClientRect();
    for (const yer of this.yerler) {
      const k = OYUK[yer.i];
      const ks = KESIT[yer.i];
      const [x, y] = this.ekranda(yer, (k.x0 + k.x1) / 2 - ks.x0, k.y0 + 30 - ks.y0);
      yer.kalpler.el.style.transform = `translate(${(x - p.left).toFixed(1)}px, ${(y - p.top).toFixed(1)}px) translate(-50%, 0)`;
      const [tx, ty] = this.ekranda(yer, (k.x0 + k.x1) / 2 - ks.x0, k.y1 + 8 - ks.y0);
      yer.tabela.style.transform = `translate(${(tx - p.left).toFixed(1)}px, ${(ty - p.top).toFixed(1)}px) translate(-50%, 0)`;
    }
    if (!this.el.classList.contains('pt-dikey')) {
      const [, alt] = this.dekor.ekrana(0, OYUK[0].y1 + 12);
      this.el.style.setProperty('--salon-alt', `${alt.toFixed(0)}px`);
    }
  }

  // ---------------------------------------------------------------- yeni yavru
  /** Satın alınan yavru kapıdan girer, oyuğuna hoplar, koklar; tabela ve minderler belirir */
  async yeniGeldi(s: SahipHayvan) {
    const yer = this.yerler[s.yer];
    if (!yer) return;
    this.yerBosalt(yer);
    // kapıdan (soldan) girer; dikeyde kesitin solundan
    this.yerDoldur(yer, s, this.el.classList.contains('pt-dikey') ? -160 : 260 - KESIT[yer.i].x0);
    const hv = yer.hayvan!;
    yer.kalpler.el.classList.add('pt-gizli');
    yer.tabela.classList.add('pt-gizli');
    yer.mesgul = true;
    this.uiYerlesim();
    try {
      hv.sesi(1);
      await hv.zipla(70, 460, 'sevinc');
      await hv.yuru(this.ortaX(yer), 900);
      await hv.kokla();
      void this.o.nehir.soyle(NEHIR2.hos_geldin);
      yer.tabela.classList.remove('pt-gizli');
      ezil(yer.tabela, 1.6, 360);
      await bekle(250);
      yer.kalpler.el.classList.remove('pt-gizli');
      ezil(yer.kalpler.el, 1.4);
      this.tepsiGuncelle(true);
    } finally {
      yer.mesgul = false;
    }
  }

  // ---------------------------------------------------------------- isim
  private adlariAc(yer: Yer) {
    if (!yer.sahip) return;
    this.etkilesim();
    if (this.adYer === yer) return this.adlariKapat();
    this.adYer = yer;
    const s = yer.sahip;
    this.adlar.replaceChildren(
      h(
        'div.pt-adlar-kart',
        {},
        ...adSecenekleri(s.id).map((ad) => {
          const b = h(`button.pt-ad${ad === s.ad ? '.secili' : ''}`, { type: 'button', 'data-ad': ad }, ad);
          b.addEventListener('click', () => this.adSec(yer, ad, b));
          return b;
        }),
      ),
    );
    this.adlar.classList.add('acik');
    ezil(this.adlar.firstElementChild, 1.2, 320);
  }
  adlariKapat() {
    this.adlar.classList.remove('acik');
    this.adYer = null;
  }
  private adSec(yer: Yer, ad: string, b: HTMLElement) {
    if (!yer.sahip || !yer.hayvan) return;
    void this.o.nehir.soyle(`${ad}!`);
    for (const x of this.adlar.querySelectorAll('.pt-ad')) x.classList.toggle('secili', x === b);
    ezil(b, 1.4);
    if (yer.sahip.ad !== ad) {
      yer.sahip.ad = ad;
      this.o.kaydet();
      yer.tabela.querySelector('.pt-tabela-ad')!.textContent = ad;
      ezil(yer.tabela, 1.4);
      // yeni adına döner, bir kez zıplar
      const hv = yer.hayvan;
      hv.bak(hv.x + 400 * (hv.bakis > 0 ? -1 : 1));
      void hv.zipla(60, 440, 'sevinc');
      hv.sesi(1);
    }
  }

  // ---------------------------------------------------------------- minder
  /** Minderi olmayan en yeni hayvan (dokunulan minder ona gider) */
  private minderHedefi(): Yer | null {
    const bos = this.yerler.filter((y) => y.sahip && !y.sahip.minder);
    if (bos.length) return bos[bos.length - 1];
    return this.secilenYer ?? null;
  }
  private secilenYer: Yer | null = null;
  /** Tepsi: minderi olmayan hayvan varsa (ya da bir minderin üstüne dokunulunca) görünür */
  private tepsiGuncelle(yeni = false) {
    const goster = this.yerler.some((y) => y.sahip && !y.sahip.minder) || !!this.secilenYer;
    const once = this.tepsi.classList.contains('acik');
    this.tepsi.classList.toggle('acik', goster);
    if (goster && (!once || yeni) && !sakin()) {
      [...this.tepsi.children].forEach((c, i) =>
        (c as HTMLElement).animate([{ transform: 'translateY(60px) scale(.7)', opacity: 0 }, { transform: 'translateY(-8px) scale(1.06, .94)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }], { duration: 420, delay: 80 * i, easing: 'ease-out', fill: 'backwards' }),
      );
    }
  }

  private minderSurukle(r: MinderRenk, b: HTMLButtonElement) {
    let tut: Tutulan | null = null;
    return {
      basla: (x: number, y: number) => {
        this.etkilesim();
        const rr = b.getBoundingClientRect();
        tut = new Tutulan(this.o.efekt, minderEl(r), { en: rr.width, boy: rr.height * 0.8, sinif: 'pt-tutulan-minder' });
        tut.yer(x, y);
        b.classList.add('pt-tutuldu');
      },
      tasi: (x: number, y: number, dx: number) => tut?.yer(x, y, dx),
      birak: (x: number, y: number) => {
        b.classList.remove('pt-tutuldu');
        const t = tut;
        tut = null;
        if (!t) return;
        const yer = this.yerler.find((y_) => y_.sahip && icinde(y_.alan.getBoundingClientRect(), x, y, 6));
        if (yer) {
          t.kaldir();
          void this.minderKoy(yer, r, b, [x, y]);
        } else {
          const rr = b.getBoundingClientRect();
          void t.don_([rr.left + rr.width / 2, rr.top + rr.height / 2], 260);
        }
      },
    };
  }

  /** Minder yay çizip oyuğa iner; hayvan döner ve üstüne yatar. İlk minder: 1 kalp */
  private async minderKoy(yer: Yer, r: MinderRenk, kaynak: HTMLElement, nokta?: [number, number]) {
    const s = yer.sahip;
    const hv = yer.hayvan;
    if (!s || !hv) return;
    this.etkilesim();
    const ilk = !s.minder;
    s.minder = r;
    this.o.kaydet();
    this.secilenYer = null;
    this.tepsiGuncelle();
    // uçuş: tepsiden (ya da parmaktan) oyuğun zeminine
    const k = this.o.efekt.kutu();
    const rr = kaynak.getBoundingClientRect();
    const bas: [number, number] = nokta ?? [rr.left + rr.width / 2, rr.top + rr.height / 2];
    const [hx, hy] = this.ekranda(yer, this.ortaX(yer), this.zemin(yer) - 30);
    const enCss = MINDER_EN * this.olcek(yer);
    ses.fis();
    if (!sakin()) {
      const ucan = minderEl(r);
      ucan.style.width = `${Math.min(rr.width, enCss).toFixed(0)}px`;
      await this.o.efekt.ucur(ucan, [bas[0] - k.left, bas[1] - k.top], [hx - k.left, hy - k.top], { ms: 520, kavis: -90, boy1: enCss / Math.max(1, Math.min(rr.width, enCss)) });
    }
    this.minderCiz(yer, r);
    ezil(yer.minder, 1.6, 320);
    ses.pit();
    // hayvan döner ve yatar (uyku pozu kısa), sonra kalkar
    yer.mesgul = true;
    try {
      hv.cevir();
      await bekle(160);
      hv.cevir();
      await hv.anlik(pozVar(s.id, 'uyku') ? 'uyku' : 'fircalanma', 1300);
      hv.ezil(1.2);
      if (hv.tur === 'kedi') ses.mir();
      if (ilk) this.kalpKazan(s.id, 'minder');
    } finally {
      yer.mesgul = false;
    }
  }

  // ---------------------------------------------------------------- okşama ve dokunuş
  private oksamaBagla(yer: Yer) {
    const el = yer.alan;
    el.style.touchAction = 'none';
    let id: number | null = null;
    let sx = 0;
    let sy = 0;
    let st = 0;
    let yol = 0;
    let hizli = 0;
    let yavas = 0;
    let tetik = 0;
    el.addEventListener('pointerdown', (e) => {
      if (!yer.sahip || id !== null) return;
      id = e.pointerId;
      sx = e.clientX;
      sy = e.clientY;
      st = performance.now();
      yol = hizli = yavas = 0;
      tetik = 0;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* yok say */
      }
    });
    el.addEventListener('pointermove', (e) => {
      if (e.pointerId !== id) return;
      const t = performance.now();
      const d = Math.hypot(e.clientX - sx, e.clientY - sy);
      const dt = Math.max(1, t - st);
      const v = d / dt;
      yol += d;
      if (d > 2) {
        if (v > 1.8) hizli += d;
        else yavas += d;
      }
      sx = e.clientX;
      sy = e.clientY;
      st = t;
      // yeterince sürtüldü: hızlıysa irkilir, yavaşsa okşanır (sürtmeye devam: ~her 140 px'te yeniden)
      if (yol - tetik > 140) {
        tetik = yol;
        if (hizli > yavas * 1.2) void this.irkil(yer);
        else void this.oksa(yer);
        hizli = yavas = 0;
      }
    });
    const son = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      id = null;
      if (yol < 14 && e.type === 'pointerup') this.dokun(yer);
    };
    el.addEventListener('pointerup', son);
    el.addEventListener('pointercancel', son);
  }

  private dokun(yer: Yer) {
    this.etkilesim();
    const s = yer.sahip;
    if (!s || !yer.hayvan) return;
    if (this.o.hayvanSecildi?.(s)) return;
    // minderine dokunulan hayvanın minderi değiştirilebilir (tepsi açılır)
    if (s.minder) {
      this.secilenYer = yer;
      this.tepsiGuncelle(true);
    }
    if (yer.mesgul) return;
    yer.hayvan.sesi(1);
    void yer.hayvan.zipla(50, 420, 'sevinc');
  }

  private async oksa(yer: Yer) {
    const s = yer.sahip;
    const hv = yer.hayvan;
    if (!s || !hv) return;
    this.etkilesim();
    if (hv.tur === 'kedi') ses.mir();
    else hv.sesi(1);
    const r = hv.kutu();
    const k = this.o.efekt.kutu();
    this.o.efekt.kalpler(r.left - k.left + r.width / 2, r.top - k.top + r.height * 0.3, 3);
    void hv.oksan(1100);
    const simdi = performance.now();
    if (simdi - yer.sonOksamaKalp >= OKSAMA_KALP_MS && !yer.mesgul) {
      yer.sonOksamaKalp = simdi;
      this.kalpKazan(s.id, 'oksama');
    }
  }

  private async irkil(yer: Yer) {
    const hv = yer.hayvan;
    if (!hv || yer.mesgul) return;
    this.etkilesim();
    await hv.irkil();
  }

  // ---------------------------------------------------------------- mutluluk, dans, jeton
  /**
   * Bir kalp kazanır (KANCA: paket 2 Bakım Odası 'sever' / 'olur', paket 3 ziyaretçi). Dinlenirken kalp dolmaz.
   * Üçüncü kalp: dans ve jeton.
   */
  kalpKazan(id: string, kaynak: KalpKaynagi) {
    const yer = this.yerler.find((y) => y.sahip?.id === id);
    const s = yer?.sahip;
    if (!yer || !s || !yer.hayvan) return;
    const sonuc = kalpEkle(s, Date.now());
    yer.alan.dataset.son = kaynak;
    if (!sonuc.eklendi) return;
    this.o.kaydet();
    const i = s.kalp - 1;
    // uçan kalp: hayvandan kalp sırasına
    const r = yer.hayvan.kutu();
    const [hx, hy] = yer.kalpler.nokta(i);
    const k = this.o.efekt.kutu();
    if (!sakin()) {
      const uc = h('span.pt-ucan-kalp', { html: '<svg viewBox="0 0 34 31"><path d="M17 28.5C7 21 2.5 15.6 2.5 9.8 2.5 5.4 5.9 2.5 10 2.5c3 0 5.4 1.7 7 4.2 1.6-2.5 4-4.2 7-4.2 4.1 0 7.5 2.9 7.5 7.3 0 5.8-4.5 11.2-14.5 18.7z" fill="#F2606B" stroke="#3B2416" stroke-width="2.6" stroke-linejoin="round"/></svg>' });
      void this.o.efekt.ucur(uc, [r.left - k.left + r.width / 2, r.top - k.top + r.height * 0.3], [hx - k.left, hy - k.top], { ms: 520, kavis: -50 }).then(() => {
        yer.kalpler.doldur(i);
        ses.kalp(i);
      });
    } else {
      yer.kalpler.doldur(i);
      ses.kalp(i);
    }
    if (sonuc.dans) void this.dans(yer);
  }

  private async dans(yer: Yer) {
    const s = yer.sahip!;
    const hv = yer.hayvan!;
    yer.mesgul = true;
    yer.alan.dataset.dans = '1';
    try {
      await bekle(620);
      await yer.kalpler.bosalt();
      const ad = s.ad === hayvanBilgi(s.id).ad ? BAYILDI[s.id] : undefined;
      void this.o.nehir.soyle(ad ?? NEHIR2.cok_mutlu);
      const r = hv.kutu();
      const k = this.o.efekt.kutu();
      this.o.efekt.parilti(r.left - k.left + r.width / 2, r.top - k.top + r.height * 0.4, 10, 1.1, '#FFE45C');
      await hv.dans(8, 380, (i) => ses.dansNota(i));
      if (this.kapandi) return;
      const n = dansBitti(s, Date.now(), this.o.yas());
      // jeton kayda hemen yazılır (hiçbiri kaybolmaz); kumbara toplanınca artar
      this.o.kayit.jeton += n;
      this.o.kaydet();
      await hv.zipla(60, 420, 'sevinc');
      this.jetonDusur(yer, n);
    } finally {
      yer.mesgul = false;
      delete yer.alan.dataset.dans;
    }
  }

  /** Hayvanın ayağının dibine jetonlar düşer (5-6'da beşlikler büyük jeton) */
  private jetonDusur(yer: Yer, n: number) {
    const parca = jetonParcalari(n, this.o.yas());
    const p = this.el.getBoundingClientRect();
    const [cx, cy] = this.ekranda(yer, yer.hayvan?.x ?? this.ortaX(yer), this.zemin(yer) - 6);
    const ax = cx - p.left;
    const ay = cy - p.top;
    parca.forEach((v, i) => {
      const j = h('button.pt-dusen-jeton', { type: 'button', 'aria-label': 'Jeton', 'data-deger': String(v) }, jetonEl(v));
      // hayvanın iki yanına, oyuğun tabanına (tabelanın ve hayvanın üstüne binmez)
      const dx = (i % 2 ? 1 : -1) * (70 + Math.floor(i / 2) * 40) * Math.min(1, this.olcek(yer) / 0.3) + ras(-4, 4);
      j.style.transform = `translate(${(ax + dx).toFixed(0)}px, ${(ay - 8).toFixed(0)}px)`;
      this.ui.append(j);
      this.dusenler.add(j);
      j.addEventListener('click', () => this.jetonTopla(j, v));
      if (!sakin())
        j.animate(
          [
            { transform: `translate(${ax.toFixed(0)}px, ${(ay - 70).toFixed(0)}px) scale(.6)` },
            { transform: `translate(${(ax + dx * 0.6).toFixed(0)}px, ${(ay - 110).toFixed(0)}px) scale(1)`, offset: 0.35 },
            { transform: `translate(${(ax + dx).toFixed(0)}px, ${(ay - 8).toFixed(0)}px) scale(1.15, .85)`, offset: 0.75 },
            { transform: `translate(${(ax + dx).toFixed(0)}px, ${(ay - 8).toFixed(0)}px) scale(1)` },
          ],
          { duration: 620, delay: i * 90, easing: 'ease-in', fill: 'backwards' },
        );
      ses.jeton(i);
      window.setTimeout(() => this.jetonTopla(j, v), sure(JETON_KENDI_MS));
    });
  }

  /** Düşen jeton kumbaraya uçar */
  jetonTopla(j: HTMLElement, v: number) {
    if (!this.dusenler.has(j)) return;
    this.dusenler.delete(j);
    this.etkilesim();
    const r = j.getBoundingClientRect();
    j.remove();
    const sira = this.toplanan++;
    void jetonUcur(this.o.efekt, [r.left + r.width / 2, r.top + r.height / 2], this.o.kumbara.agiz(), v, 420).then(() => {
      this.o.kumbara.ayarla(this.o.kumbara.jeton + v);
      this.o.kumbara.yut();
      ses.jeton(sira);
      if (!this.dusenler.size) {
        this.toplanan = 0;
        this.o.kumbara.ayarla(this.o.kayit.jeton);
      }
    });
  }
  /** Yerde kalan bütün jetonlar kumbaraya (panel değişirken) */
  jetonlariTopla() {
    for (const j of [...this.dusenler]) this.jetonTopla(j, Number(j.dataset.deger) || 1);
  }

  // ---------------------------------------------------------------- canlılık
  private etkilesim() {
    this.sonEtkilesim = performance.now();
    this.o.etkilesim?.();
  }
  private sonrakiCanli = performance.now() + 3000;
  private canli() {
    if (this.kapandi || this.el.closest('[data-panel-gizli]')) return;
    const simdi = performance.now();
    if (simdi < this.sonrakiCanli) return;
    this.sonrakiCanli = simdi + ras(3000, 6000);
    const dolu = this.yerler.filter((y) => y.hayvan && !y.mesgul);
    if (!dolu.length) return;
    const yer = dolu[Math.floor(Math.random() * dolu.length)];
    const hv = yer.hayvan!;
    // uzun sessizlikte (20 sn) hayvan çocuğa bakıp zıplar (dolaylı: "benimle ilgilen")
    if (simdi - this.sonEtkilesim > 20000 && yer.sahip && !dinleniyor(yer.sahip, Date.now())) {
      this.sonEtkilesim = simdi;
      hv.sesi(2);
      void hv.zipla(70, 460, 'sevinc');
      return;
    }
    const z = Math.random();
    if (z < 0.3) void hv.zipla(34, 380);
    else if (z < 0.55) {
      hv.cevir();
      window.setTimeout(() => !this.kapandi && hv.cevir(), sure(ras(900, 1700)));
    } else if (z < 0.8) void hv.anlik('goz', 600);
    else void hv.gerin();
  }

  // ---------------------------------------------------------------- ihtiyaç, yardım merdiveni, uyku
  /** Hayvanın hâli: uyuyorsa uyku, ihtiyacı varsa onun pozu, yoksa boş */
  private halUygula(yer: Yer) {
    const s = yer.sahip;
    const hv = yer.hayvan;
    if (!s || !hv) return;
    hv.halAyarla(this.o.uyuyor?.(s.id) ? 'uyku' : s.ihtiyac ? IHTIYAC_HAL[s.ihtiyac] : 'bos');
  }

  /** Bir hayvanın kalpleri ve hâli kayıttan yeniden (Bakım Odası'ndan dönünce, ihtiyaç açılınca) */
  hayvanDurumu(id: string) {
    const yer = this.yerler.find((y) => y.sahip?.id === id);
    if (!yer?.sahip) return;
    yer.kalpler.ayarla(yer.sahip.kalp);
    this.halUygula(yer);
    if (!yer.sahip.ihtiyac) this.balonGoster(id, false);
  }
  /** Yerleşimi yeniden ölç (panel görünür olunca) */
  yerlesimYenile() {
    this.dekor.kur();
  }
  /** Hepsi */
  hepsiniYenile() {
    for (const y of this.yerler) if (y.sahip) this.hayvanDurumu(y.sahip.id);
  }
  /** Hayvanın sesi (ihtiyacı açılınca; salon görünürken) */
  hayvanSesi(id: string) {
    const yer = this.yerler.find((y) => y.sahip?.id === id);
    if (yer?.hayvan && !yer.mesgul) {
      yer.hayvan.sesi(1);
      yer.hayvan.ezil(1.2);
    }
  }

  /** Yardım merdiveninin bir adımı (salon görünürken): 12 sn dolaylı hareket, 25 sn 3-4 balonu */
  yardim(id: string, adim: YardimAdimi) {
    const yer = this.yerler.find((y) => y.sahip?.id === id);
    const s = yer?.sahip;
    const hv = yer?.hayvan;
    if (!yer || !s?.ihtiyac || !hv) return;
    if (adim === 'dolayli' && !yer.mesgul) {
      const k = this.o.efekt.kutu();
      void dolayliHareket(hv, s.ihtiyac, this.o.efekt, (x, y) => {
        const [ex, ey] = this.ekranda(yer, x, y);
        return [ex - k.left, ey - k.top];
      });
    } else if (adim === 'balon') this.balonGoster(id, true);
  }

  /** 3-4 resim balonu: ihtiyacın genel resmi, oyuğun üstünde (hayvanın başının yanında) */
  balonGoster(id: string, goster: boolean) {
    const yer = this.yerler.find((y) => y.sahip?.id === id);
    let b = this.balonlar.get(id);
    const ih = yer?.sahip?.ihtiyac;
    if (!goster || !yer || !ih) {
      if (b) {
        b.remove();
        this.balonlar.delete(id);
      }
      return;
    }
    const c = ihtiyacCekmecesi(ih);
    if (!b || b.dataset.cekmece !== c) {
      b?.remove();
      b = h('div.pt-balon2.acik.pt-salon-balon', { 'data-hayvan': id, 'data-cekmece': c }, h('span.pt-balon2-ic', {}, dolapEl(c)), h('i.pt-balon2-k1'), h('i.pt-balon2-k2'));
      this.ui.append(b);
      this.balonlar.set(id, b);
      ezil(b.firstElementChild, 1.6, 420);
    }
    this.balonYerlesim();
  }
  private balonYerlesim() {
    const p = this.el.getBoundingClientRect();
    for (const [id, b] of this.balonlar) {
      const yer = this.yerler.find((y) => y.sahip?.id === id);
      if (!yer) continue;
      const k = OYUK[yer.i];
      const ks = KESIT[yer.i];
      const [x, y] = this.ekranda(yer, k.x1 - 150 - ks.x0, k.y0 + 150 - ks.y0);
      b.style.transform = `translate(${(x - p.left).toFixed(1)}px, ${(y - p.top).toFixed(1)}px)`;
    }
  }

  // ---------------------------------------------------------------- lamba ipi
  private ipBagla() {
    let y0 = 0;
    let cekildi = false;
    const cek = () => {
      if (cekildi) return;
      cekildi = true;
      this.etkilesim();
      ses.cit();
      if (!sakin()) this.ip.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(1.35)', offset: 0.35 }, { transform: 'scaleY(0.92)', offset: 0.7 }, { transform: 'scaleY(1)' }], { duration: 520, easing: 'ease-out' });
      this.o.ipCek?.();
      window.setTimeout(() => (cekildi = false), sure(900));
    };
    this.ipAlan.addEventListener('pointerdown', (e) => {
      y0 = e.clientY;
      try {
        this.ipAlan.setPointerCapture(e.pointerId);
      } catch {
        /* yok say */
      }
    });
    this.ipAlan.addEventListener('pointermove', (e) => {
      if (e.buttons && e.clientY - y0 > 18) cek();
    });
    this.ipAlan.addEventListener('click', cek);
  }
  /** Yatay: ip çizimdeki yerinde, dokunma alanı onun çevresinde. Dikey: ip sağ üstte sarkar */
  private ipYerlesim() {
    const dikey = this.el.classList.contains('pt-dikey');
    const p = this.el.getBoundingClientRect();
    if (!dikey) {
      if (this.ip.parentElement !== this.dekor.katman) {
        const [ix0, iy0, ix1, iy1] = IP_KUTU;
        this.ip.style.cssText = `left:${ix0}px;top:${iy0}px;width:${ix1 - ix0}px;height:${iy1 - iy0}px`;
        this.dekor.katman.append(this.ipOrtu, this.ip);
      }
      this.ip.classList.remove('pt-ip-dikey');
    } else {
      if (this.ip.parentElement !== this.el) this.el.insertBefore(this.ip, this.ui);
      this.ipOrtu.remove();
      this.ip.classList.add('pt-ip-dikey');
      this.ip.style.cssText = '';
    }
    const r = this.ip.getBoundingClientRect();
    if (!r.width) return;
    const w = Math.max(56, r.width * 3);
    const hh = Math.max(84, r.height * 1.6);
    this.ipAlan.style.cssText = `left:${(r.left - p.left + r.width / 2 - w / 2).toFixed(0)}px;top:${(r.top - p.top).toFixed(0)}px;width:${w.toFixed(0)}px;height:${hh.toFixed(0)}px`;
  }
  /** İp bir kez kıpırdar (akşam: "Işığı kapatalım") */
  ipKipirdat() {
    if (sakin()) return;
    this.ip.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(1.12)', offset: 0.3 }, { transform: 'scaleY(0.96)', offset: 0.6 }, { transform: 'scaleY(1)' }], { duration: 600, easing: 'ease-in-out' });
  }

  // ---------------------------------------------------------------- pano (günün fotoğrafları)
  /**
   * Mantar pano (salon çiziminde, sol duvarda): son 4 polaroid küçük asılı. Yalnız yatay (dikeyde çizim görünmez).
   * an: "hayvan:poz"
   */
  panoKur(pano: readonly string[]) {
    const son = pano.slice(-4);
    this.pano.replaceChildren(
      ...son.map((an, i) => {
        const [id, poz] = an.split(':');
        return h('span.pt-pano-foto', { 'data-an': an, style: `left:${PANO.x0 + (i % 2) * 125}px;top:${PANO.y0 + Math.floor(i / 2) * 160}px;--egim:${i % 2 ? 4 : -5}deg` }, h('img', { src: pozAdresi(id, (poz || 'bos') as Poz).url, alt: '', draggable: 'false' }));
      }),
    );
  }
  /** Panonun ekrandaki ortası (uçan fotoğrafın hedefi); dikeyde null */
  panoNoktasi(): [number, number] | null {
    if (this.el.classList.contains('pt-dikey')) return null;
    const [x, y] = this.dekor.ekrana(PANO.x0 + 120, PANO.y0 + 150);
    const r = this.el.getBoundingClientRect();
    return [r.left + x, r.top + y];
  }
  /** Gece: salonun gece çizimi (G7) ve oyuk kesitleri */
  gece(var_: boolean, gece: string | null) {
    const url = var_ && gece ? gece : SALON;
    this.dekor.resim.src = url;
    for (const y of this.yerler) y.kap.style.setProperty('--salon', `url("${url}")`);
    this.el.classList.toggle('pt-gece-resimli', var_ && !!gece);
  }

  /** Test ve dükkân için: yerlerdeki hayvanlar */
  get durum() {
    return this.yerler.map((y) => (y.sahip ? { yer: y.i, id: y.sahip.id, ad: y.sahip.ad, minder: y.sahip.minder, kalp: y.sahip.kalp, dans: y.sahip.dans, mesgul: y.mesgul } : null));
  }
  get dusenJeton() {
    return this.dusenler.size;
  }

  kapat() {
    this.kapandi = true;
    for (const z of this.zamanlar) clearInterval(z);
    for (const f of this.birak) f();
    for (const y of this.yerler) y.hayvan?.kapat();
    this.dekor.kapat();
  }
}
