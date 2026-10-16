/**
 * Pati Dükkânı v2 · Bakım Odası (asıl oyun; PATI-V2 §4e). Salondaki hayvana dokununca açılır. Ayrı, tam çözünürlüklü bir
 * sahne (bakim-odasi çizimi, 2752×1536): hayvan masanın üstünde, sağda bakım dolabı. Yakın çekim (zoom) yok.
 *
 *  - Dolap: çekmece önlerinde yalnız resim (kâse, damla, top, fırça, yastık, bantlı kalp). 3-4'te 4 çekmece (mama, su,
 *    oyuncak, yatak), 5-6'da 6. HİÇBİR çekmece "doğru" diye işaretlenmez.
 *  - Çekmece açılınca eşyaları (3-4: 3, 5-6: 4-6) dolabın önünde büyük (≥ 88 px) durur. Üstte bütün çekmecelerin
 *    küçük resimleri: başka çekmeceye geçilir; açık çekmeceye ya da odaya dokununca kapanır.
 *  - Eşya hayvana sürüklenir ya da dokununca hayvana uçar. El işi (bakim.ts): kâse konur, top atılır, tüy değnek
 *    sallanır, fırça sürtülür, sprey basılı tutulur, yatak altına iner, örtü örtülür.
 *  - Tepki (tercih.ts): sever ★ (büyük sevinç), olur (küçük sevinç), sevmez (komik sahne; cezasız: kalp düşmez, jeton
 *    gitmez, eşya çekmecesine döner), başka ihtiyaç (koklar), ders (5-6: önce sever, sonra karnı guruldar → hasta).
 *  - İhtiyacı giderilen hayvan: kalp + jeton. Üç kalp: dans + jeton. Sevdiği eşya ilk kez bulununca altın kalp etiketi
 *    o eşyaya yapışır, bir jeton daha, Hayvan Defteri'ne yazılır. İhtiyacı yokken de her şey denenir: sevdiği eşya küçük
 *    bir sevinç verir ve deftere yazılır, jeton düşmez.
 *  - Okşama: yavaş sürtünce gözlerini kapatıp yaslanır, hızlı sürtünce irkilir.
 *  - Öbür hayvan bir şey isterse sol kenarda küçük yuvarlak pencerede yüzü belirir; dokununca o hayvana geçilir.
 *  - Yardım merdiveni (dükkân sayar): 12 sn dolaylı hareket, 25 sn balon (3-4) / Nehir'in beden dili sözü (5-6),
 *    40 sn yalnız doğru çekmecenin kulpu bir kez kıpırdar. Parlama, ok, el yok.
 *  - Hiçbir animasyon girdiyi kilitlemez: yeni bir eşya ya da hayvan seçilince süren tepki kesilir.
 *
 * Yerleşim: yatay telefonda çizim ekranı kaplar (ölçek ≤ 1/3); dolap çizimin kendi yerinde. Dikeyde üstte oda
 * (masa ve hayvan), altta dolap (aynı çizimin kesiti, ölçek ≤ 1/3).
 */
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { elSurukle, icinde, Tutulan } from '../../kino-otobus/src/dokunsal';
import type { Efekt } from '../../kino-otobus/src/efekt';
import { Sallama } from '../../kino-otobus/src/el-isi';
import { dogalBoyu, NETLIK_DPR } from '../../src/ui/netlik';
import { DusenJetonlar, dolapEl, esyaEl, ezil, KalpSirasi, oksamaBagla, ucanKalpEl, type Kumbara } from './arayuz';
import { anAdi, IS_GEREK, ISTE_POZ, komik, kullanim, SURTUS_YOL, tutarakMi, type Gag, type Kullanim } from './bakim';
import { Dekor, ENCOK_OLCEK } from './dekor';
import { kazanc } from './ekonomi';
import { Hayvan, IHTIYAC_HAL } from './hayvan';
import type { IhtiyacSaati, YardimAdimi } from './ihtiyac';
import { CEKMECELER, esyaBilgi, hayvanBilgi, KALP_SAYISI, NEHIR2, type CekmeceAdi, type IhtiyacAdi, type Yas } from './katalog';
import type { PatiKayit, SahipHayvan } from './kayit';
import { dansBitti, kalpEkle } from './mutluluk';
import type { Nehir } from './nehir';
import { ses } from './sesler';
import { cekmece as cekmeceIci, cekmeceAcik, defterYaz, tepki, type Tepki } from './tercih';
import { ALTIN_KALP, BAKIM_ODASI, enCokCssBoy, esyaResmi, pozAdresi, pozVar, SALON, type Poz } from './varliklar';

const AZ = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const sakin = () => AZ || TEST_MODU;
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, sure(ms)));
const ras = (a: number, b: number) => a + Math.random() * (b - a);

// ---------------------------------------------------------------- bakim-odasi çiziminin ölçüleri (sahne birimi)
/** Masadaki minderin ortası: hayvanın ayakları */
const MASA: [number, number] = [892, 1066];
/** Masanın üstü (eşyalar bu çizgide durur) ve kullanılabilir genişliği */
const MASA_X0 = 430;
const MASA_X1 = 1330;
/** Dolap (kesit) ve çekmeceler (dolabın içinde, kesitin yerel birimi) */
const DOLAP = { x0: 1700, y0: 430, x1: 2690, y1: 1300 };
const C_KOL = [1775 - DOLAP.x0, 2213 - DOLAP.x0];
const C_SAT = [531 - DOLAP.y0, 761 - DOLAP.y0, 993 - DOLAP.y0];
const C_W = 402;
const C_H = 199;
/** Çekmecelerin sırası (soldan sağa, üstten alta) */
const SIRA: CekmeceAdi[] = ['mama', 'su', 'oyuncak', 'temizlik', 'yatak', 'ecza'];
/** Hayvanın en çok css boyu (PATI-V2 §4: DPR 3'te ~220) */
const ENCOK_CSS = 220;
/** Okşamanın kalbi aynı hayvana en çok bu aralıkla */
const OKSAMA_KALP_MS = TEST_MODU ? 200 : 4500;
/** Süt kedinin karnını bu kadar sonra ağrıtır (ders) */
const DERS_SONRA = (esya: string) => (esya === 'sut-kasesi' ? 20000 : 1800);

export interface OdaOrtam {
  efekt: Efekt;
  nehir: Nehir;
  kumbara: Kumbara;
  kayit: PatiKayit;
  kaydet: () => void;
  yas: () => Yas;
  saat: IhtiyacSaati;
  /** saat zamanı (ms; testte hızlı) */
  simdi: () => number;
  /** odadan çık (dükkâna) */
  cik: () => void;
  /** hayvanın durumu değişti (salon kalpleri ve hâli) */
  degisti: (s: SahipHayvan) => void;
  /** günün anı (polaroid) */
  an: (ad: string) => void;
  /** akşam: yatağını seçen hayvan uyudu */
  uyudu?: (s: SahipHayvan) => void;
  aksam: () => boolean;
  etkilesim: () => void;
  /** bir ★ ilk kez bulundu (defter: Uzman denetimi) */
  kesif?: (id: string) => void;
}

/** Masadaki (sahnedeki) bir eşya */
interface Sahnede {
  el: HTMLElement;
  esya: string;
}

export class BakimOdasi {
  readonly el: HTMLElement;
  private dekor: Dekor;
  private dolap: HTMLElement;
  private cekmeceler = new Map<CekmeceAdi, HTMLButtonElement>();
  private tepsi: HTMLElement;
  private sekmeler: HTMLElement;
  private izgara: HTMLElement;
  private ui: HTMLElement;
  private kalpler: KalpSirasi;
  private balon: HTMLElement;
  private cagri: HTMLButtonElement;
  private alan: HTMLElement;
  private jetonlar: DusenJetonlar;
  sahip: SahipHayvan | null = null;
  hayvan: Hayvan | null = null;
  acikCekmece: CekmeceAdi | null = null;
  private islem = 0;
  private sahnede: Sahnede[] = [];
  private birak: (() => void)[] = [];
  private esyaBirak: (() => void)[] = [];
  private yanlis = 0;
  private sevmediDendi = false;
  private ihtiyacAnahtari = '';
  private gecmis = new Map<string, Record<string, number>>();
  private sonOksamaKalp = 0;
  private cagriId: string | null = null;
  private zamanlar: number[] = [];
  private kapandi = false;
  /** son tepki (test) */
  sonTepki: { esya: string; tepki: Tepki; gag?: Gag } | null = null;
  /** bir tepki ya da dans sürüyor (test) */
  mesgul = false;

  constructor(private o: OdaOrtam) {
    const url = BAKIM_ODASI ?? SALON;
    this.dekor = new Dekor(url, { yatay: { x0: 300, y0: 230, x1: 2700, y1: 1380 }, dikey: { x0: 330, y0: 330, x1: 1460, y1: 1300 }, dikeyUst: () => 66 }, 'pt-oda-dekor');
    this.alan = h('div.pt-oda-alan', { 'aria-label': 'Hayvan' });
    this.dekor.katman.append(this.alan);
    this.dolap = h('div.pt-dolap', { style: `width:${DOLAP.x1 - DOLAP.x0}px;height:${DOLAP.y1 - DOLAP.y0}px;--x0:${DOLAP.x0}px;--y0:${DOLAP.y0}px;--oda:url("${url}")` });
    SIRA.forEach((c, i) => {
      const b = h('button.pt-cekmece', { type: 'button', 'data-cekmece': c, 'aria-label': c, style: `left:${C_KOL[i % 2]}px;top:${C_SAT[Math.floor(i / 2)]}px;width:${C_W}px;height:${C_H}px` }, h('span.pt-cekmece-on', {}, dolapEl(c))) as HTMLButtonElement;
      b.addEventListener('click', () => this.cekmeceDokun(c));
      this.cekmeceler.set(c, b);
      this.dolap.append(b);
    });
    this.dekor.katman.append(this.dolap);
    this.sekmeler = h('div.pt-sekmeler');
    this.izgara = h('div.pt-esyalar');
    this.tepsi = h('div.pt-tepsi2', { 'aria-label': 'Çekmece' }, this.sekmeler, this.izgara);
    this.kalpler = new KalpSirasi(KALP_SAYISI);
    this.kalpler.el.classList.add('pt-oda-kalpler');
    this.balon = h('div.pt-balon2', { 'aria-hidden': 'true' });
    this.cagri = h('button.pt-cagri', { type: 'button', 'aria-label': 'Öbür hayvan' }) as HTMLButtonElement;
    this.cagri.addEventListener('click', () => {
      const s = this.o.kayit.hayvanlar.find((x) => x.id === this.cagriId);
      if (s) this.ac(s);
    });
    this.ui = h('div.pt-oda-ui', {}, this.balon, this.kalpler.el, this.cagri);
    this.el = h('div.pt-oda', { 'data-acik': '0', 'aria-hidden': 'true' }, this.dekor.el, this.tepsi, this.ui);
    this.jetonlar = new DusenJetonlar(this.ui, o.efekt, o.kumbara, () => o.kayit.jeton, o.yas, () => this.etkilesim());
    // odanın boş yerine dokununca açık çekmece kapanır
    this.dekor.el.addEventListener('click', (e) => {
      if ((e.target as Element).closest('.pt-cekmece, .pt-oda-alan')) return;
      this.cekmeceKapa();
    });
    this.birak.push(
      oksamaBagla(this.alan, {
        oksa: () => this.oksa(),
        irkil: () => void this.irkil(),
        dokun: () => this.dokun(),
      }),
    );
    this.dekor.degisti = () => this.yerlesim();
    requestAnimationFrame(() => this.dekor.kur());
  }

  get acik() {
    return this.el.dataset.acik === '1';
  }

  // ---------------------------------------------------------------- açma / kapama
  /** Hayvanın odasını açar (cekmece: akşam yatak çekmecesi açık gelir) */
  ac(s: SahipHayvan, cekmece?: CekmeceAdi) {
    this.etkilesim();
    this.kes();
    this.jetonlar.hepsiniTopla();
    this.hayvan?.kapat();
    this.hayvan?.el.remove();
    this.sahip = s;
    this.yanlis = 0;
    this.sevmediDendi = false;
    const hv = new Hayvan({ ad: s.id, boy: 600, x: MASA[0], y: MASA[1] });
    this.hayvan = hv;
    this.dekor.katman.insertBefore(hv.el, this.alan);
    this.halGuncelle();
    this.kalpler.ayarla(s.kalp);
    this.alan.dataset.hayvan = s.id;
    this.el.dataset.hayvan = s.id;
    const yeniAcilis = !this.acik;
    this.el.dataset.acik = '1';
    this.el.removeAttribute('aria-hidden');
    for (const [c, b] of this.cekmeceler) b.classList.toggle('pt-kapali-cekmece', !this.cekmeceVar(c));
    this.cekmeceKapa(true);
    this.balonGuncelle(false);
    this.dekor.kur();
    if (!sakin()) {
      if (yeniAcilis) this.el.animate([{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }], { duration: 420, easing: 'cubic-bezier(.3,.9,.4,1)' });
      void bekle(yeniAcilis ? 380 : 0).then(() => this.hayvan === hv && void hv.zipla(60, 440, 'sevinc'));
    }
    hv.sesi(1);
    if (cekmece) void bekle(yeniAcilis ? 500 : 0).then(() => this.sahip === s && this.cekmeceAc(cekmece));
    this.cagriGuncelle();
  }

  /** Odayı kapatır (dükkâna dönülür); yerdeki jetonlar kumbaraya */
  kapa() {
    if (!this.acik) return;
    this.kes();
    this.jetonlar.hepsiniTopla();
    this.cekmeceKapa(true);
    this.el.dataset.acik = '0';
    this.el.setAttribute('aria-hidden', 'true');
    const hv = this.hayvan;
    this.hayvan = null;
    this.sahip = null;
    if (hv) {
      hv.kapat();
      hv.el.remove();
    }
    if (!sakin()) this.el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(100%)' }], { duration: 360, easing: 'ease-in' });
  }

  /** Süren tepkiyi keser, masadaki eşyaları kaldırır */
  private kes() {
    this.islem++;
    for (const x of this.sahnede) x.el.remove();
    this.sahnede = [];
    this.mesgul = false;
    this.hayvan?.pusu(false);
    void this.hayvan?.batir(0, 1);
  }

  private cekmeceVar(c: CekmeceAdi) {
    return cekmeceAcik(c, this.o.yas());
  }

  /** Hayvanın hâli ihtiyacına göre (ihtiyacı yoksa boş) */
  halGuncelle() {
    const s = this.sahip;
    const hv = this.hayvan;
    if (!s || !hv) return;
    hv.halAyarla(s.ihtiyac ? IHTIYAC_HAL[s.ihtiyac] : 'bos');
    const anahtar = `${s.id}:${s.ihtiyac ?? ''}:${this.o.saat.acilisZamani(s.id) ?? ''}`;
    if (anahtar !== this.ihtiyacAnahtari) {
      this.ihtiyacAnahtari = anahtar;
      this.yanlis = 0;
      this.sevmediDendi = false;
      this.balonGuncelle(false);
    }
    this.kalpler.ayarla(s.kalp);
  }

  // ---------------------------------------------------------------- yerleşim
  private yerlesim() {
    const W = this.el.clientWidth || 844;
    const H = this.el.clientHeight || 390;
    const dikey = H > W;
    this.el.classList.toggle('pt-dikey', dikey);
    const s = this.dekor.s;
    // hayvanın boyu: en çok 220 css px ve kaynak pikseli / 3 (netlik)
    if (this.hayvan) {
      const kaynak = enCokCssBoy(pozAdresi(this.hayvan.ad, 'bos').url) ?? ENCOK_CSS;
      this.hayvan.boyAyarla(Math.min(ENCOK_CSS, kaynak) / s);
    }
    const hb = this.hayvan?.ayar.boy ?? 600;
    this.alan.style.cssText = `left:${MASA[0] - hb * 0.42}px;top:${MASA[1] - hb * 0.98}px;width:${hb * 0.84}px;height:${hb * 1.02}px`;
    if (!dikey) {
      if (this.dolap.parentElement !== this.dekor.katman) this.dekor.katman.append(this.dolap);
      this.dolap.classList.remove('pt-kesit');
      this.dolap.style.transform = `translate(${DOLAP.x0}px, ${DOLAP.y0}px)`;
    } else {
      const dw = DOLAP.x1 - DOLAP.x0;
      const dh = DOLAP.y1 - DOLAP.y0;
      const o = Math.min(ENCOK_OLCEK, (W - 24) / dw);
      const odaAlt = this.dekor.ekrana(0, 1536)[1];
      const ust = Math.min(odaAlt + 10, H - dh * o - 16);
      if (this.dolap.parentElement !== this.el) this.el.insertBefore(this.dolap, this.tepsi);
      this.dolap.classList.add('pt-kesit');
      this.dolap.style.transform = `translate(${((W - dw * o) / 2).toFixed(1)}px, ${ust.toFixed(1)}px) scale(${o.toFixed(5)})`;
      this.el.style.setProperty('--oda-alt', `${odaAlt.toFixed(0)}px`);
    }
    this.uiYerlesim();
  }

  /** Tepsi dolabın üstünde; balon hayvanın başının yanında */
  private uiYerlesim() {
    const p = this.el.getBoundingClientRect();
    const d = this.dolap.getBoundingClientRect();
    if (d.width > 0) {
      const pay = 6;
      this.tepsi.style.left = `${(d.left - p.left - pay).toFixed(0)}px`;
      this.tepsi.style.top = `${(d.top - p.top - pay).toFixed(0)}px`;
      this.tepsi.style.width = `${(d.width + 2 * pay).toFixed(0)}px`;
      this.tepsi.style.height = `${(d.height + 2 * pay).toFixed(0)}px`;
    }
    const hv = this.hayvan;
    if (hv) {
      const [bx, by] = this.dekor.ekrana(hv.x + hv.ayar.boy * 0.42, hv.y - hv.ayar.boy * 1.02);
      this.balon.style.transform = `translate(${bx.toFixed(0)}px, ${Math.max(70, by).toFixed(0)}px)`;
    }
  }

  // ---------------------------------------------------------------- çekmeceler
  private cekmeceDokun(c: CekmeceAdi) {
    this.etkilesim();
    const b = this.cekmeceler.get(c)!;
    if (!this.cekmeceVar(c)) {
      // kilitli değil, boş: tık eder, kıpırdar (3-4'te temizlik ve ecza; paket 3'te mağazadan)
      ses.cekmece(false);
      ezil(b, 0.8, 240);
      return;
    }
    if (this.acikCekmece === c) return this.cekmeceKapa();
    this.cekmeceAc(c);
  }

  /** Çekmeceyi açar: eşyaları dolabın önünde (3-4: 3, 5-6: 4-6) */
  cekmeceAc(c: CekmeceAdi) {
    const s = this.sahip;
    if (!s || !this.cekmeceVar(c)) return;
    ses.cekmece(true);
    this.acikCekmece = c;
    this.el.dataset.cekmece = c;
    for (const [ad, b] of this.cekmeceler) b.classList.toggle('pt-cekili', ad === c);
    // sekmeler: bütün çekmecelerin küçük resmi
    this.sekmeler.replaceChildren(
      ...SIRA.filter((x) => this.cekmeceVar(x)).map((x) => {
        const b = h(`button.pt-sekme${x === c ? '.secili' : ''}`, { type: 'button', 'data-cekmece': x, 'aria-label': x }, dolapEl(x));
        b.addEventListener('click', () => {
          this.etkilesim();
          if (x === this.acikCekmece) this.cekmeceKapa();
          else this.cekmeceAc(x);
        });
        return b;
      }),
    );
    for (const f of this.esyaBirak) f();
    this.esyaBirak = [];
    const esyalar = cekmeceIci(s.id, c, this.o.yas());
    // sıra her açılışta karışık (hiçbir yer "doğru yer" olmasın)
    for (let i = esyalar.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [esyalar[i], esyalar[j]] = [esyalar[j], esyalar[i]];
    }
    this.izgara.dataset.adet = String(esyalar.length);
    this.izgara.replaceChildren(
      ...esyalar.map((e, i) => {
        const b = h('button.pt-esya', { type: 'button', 'data-esya': e, 'aria-label': e, style: `--i:${i}` }, esyaEl(e)) as HTMLButtonElement;
        netlikSinirla(b);
        if (this.o.kayit.defter[s.id]?.[e] === 'sever') b.append(altinKalpEl());
        b.addEventListener('click', () => {
          if (b.classList.contains('pt-kullanimda')) return;
          void this.dene(e, b, null);
        });
        this.esyaBirak.push(elSurukle(b, this.surukle(e, b)));
        return b;
      }),
    );
    this.tepsi.classList.add('acik');
    this.uiYerlesim();
    if (!sakin()) {
      this.tepsi.animate([{ transform: 'translateY(14px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 220, easing: 'ease-out' });
      [...this.izgara.children].forEach((x, i) =>
        (x as HTMLElement).animate([{ transform: 'translateY(30px) scale(.7, 1.2)', opacity: 0 }, { transform: 'translateY(-10px) scale(1.08, .92)', opacity: 1, offset: 0.65 }, { transform: 'none', opacity: 1 }], { duration: 380, delay: 60 + 70 * i, easing: 'ease-out', fill: 'backwards' }),
      );
    }
  }

  cekmeceKapa(sessiz = false) {
    if (!this.acikCekmece && !this.tepsi.classList.contains('acik')) return;
    if (!sessiz) ses.cekmece(false);
    this.acikCekmece = null;
    delete this.el.dataset.cekmece;
    this.tepsi.classList.remove('acik');
    for (const b of this.cekmeceler.values()) b.classList.remove('pt-cekili');
    for (const f of this.esyaBirak) f();
    this.esyaBirak = [];
  }

  private esyaDugmesi(e: string) {
    return this.izgara.querySelector<HTMLElement>(`.pt-esya[data-esya="${e}"]`);
  }
  private esyaMerkez(e: string): [number, number] | null {
    const b = this.esyaDugmesi(e);
    if (!b || !b.isConnected) return null;
    const r = b.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  }

  // ---------------------------------------------------------------- sürükleme
  private tutBoy(e: string) {
    const b = this.esyaDugmesi(e);
    const t = b ? Math.min(b.clientWidth, b.clientHeight) * 1.05 : 100;
    const u = esyaResmi(e);
    const d = u ? dogalBoyu(u) : null;
    return d ? Math.min(t, Math.max(d[0], d[1]) / NETLIK_DPR) : t;
  }
  /** Hayvanın üstünde mi (ekran noktası) */
  private ustunde(x: number, y: number, pay = 16) {
    return icinde(this.alan.getBoundingClientRect(), x, y, pay);
  }

  private surukle(e: string, b: HTMLButtonElement) {
    let tut: Tutulan | null = null;
    const k = kullanim(e);
    let no = 0;
    let ilerleme = 0;
    let yol = 0;
    let sonX = 0;
    let sonY = 0;
    let sonT = 0;
    let gagOldu = false;
    let t: Tepki = 'olur';
    let raf = 0;
    const sallama = new Sallama();
    const tutma: [number, number] = e === 'tuy-degnek' ? [0.12, 0.9] : [0.5, 0.55];
    const bitti = () => (tutarakMi(k) ? ilerleme >= IS_GEREK[k as 'firca' | 'sprey' | 'salla'] : false);
    // sprey: hayvanın üstünde tutuldukça zaman ilerler
    const spreyDongu = (zaman: number) => {
      if (!tut) return;
      const dt = Math.min(64, zaman - (sonT || zaman));
      sonT = zaman;
      if (this.ustunde(sonX, sonY)) {
        ilerleme += dt;
        if (Math.random() < 0.25) {
          ses.sprey();
          this.damlalar(sonX, sonY + 20, 3);
        }
        if (!gagOldu && t === 'sevmez' && ilerleme > 280) {
          gagOldu = true;
          void tut.don_(this.esyaMerkez(e), 260);
          tut = null;
          b.classList.remove('pt-tutuldu');
          void this.tepkiOyna(e, t, no, true);
          return;
        }
        if (bitti()) return birak_(sonX, sonY);
      }
      raf = requestAnimationFrame(spreyDongu);
    };
    const birak_ = (x: number, y: number) => {
      cancelAnimationFrame(raf);
      b.classList.remove('pt-tutuldu');
      this.hayvan?.pusu(false);
      const tt = tut;
      tut = null;
      if (!tt) return;
      const ust = this.ustunde(x, y, 30);
      if (tutarakMi(k)) {
        void tt.don_(this.esyaMerkez(e), 280);
        if (gagOldu) return;
        // tutarak iş: yarım kaldıysa hayvanın üstünde bırakınca kendiliğinden biter
        if (ust || ilerleme > 0) void this.tepkiOyna(e, t, no, true);
        else this.islem++;
        return;
      }
      if (!ust) {
        this.islem++;
        void tt.don_(this.esyaMerkez(e), 280);
        return;
      }
      tt.kaldir();
      void this.dene(e, b, [x, y]);
    };
    return {
      aktif: () => !!this.sahip && !b.classList.contains('pt-kullanimda'),
      basla: (x: number, y: number) => {
        this.etkilesim();
        const boy = this.tutBoy(e);
        tut = new Tutulan(this.o.efekt, esyaEl(e), { en: boy, boy, sinif: 'pt-tutulan-esya', tx: tutma[0], ty: tutma[1] });
        tut.yer(x, y);
        b.classList.add('pt-tutuldu');
        sonX = x;
        sonY = y;
        sonT = 0;
        ilerleme = yol = 0;
        gagOldu = false;
        if (tutarakMi(k) && this.sahip) {
          // tutarak yapılan işte tepki şimdiden bellidir (fırça ilk sürtüşte, sprey ilk damlada)
          this.kes();
          no = this.islem;
          t = this.tepkiHesapla(e);
          if (k === 'sprey') raf = requestAnimationFrame(spreyDongu);
          if (k === 'salla') this.hayvan?.pusu(t !== 'sevmez');
        }
      },
      tasi: (x: number, y: number, dx: number, dy: number) => {
        if (!tut) return;
        tut.yer(x, y, dx);
        const hv = this.hayvan;
        if (hv && (k === 'salla' || k === 'firca')) hv.bak(this.dekorNokta(x, y)[0]);
        if (k === 'firca' && this.ustunde(x, y) && !gagOldu) {
          yol += Math.hypot(x - sonX, y - sonY);
          if (yol >= SURTUS_YOL) {
            yol = 0;
            ilerleme++;
            this.surtus(e, t);
            if (t === 'sevmez') {
              gagOldu = true;
              void tut.don_(this.esyaMerkez(e), 260);
              tut = null;
              b.classList.remove('pt-tutuldu');
              void this.tepkiOyna(e, t, no, true);
              return;
            }
            if (bitti()) {
              sonX = x;
              sonY = y;
              return birak_(x, y);
            }
          }
        }
        if (k === 'salla' && this.ustunde(x, y, 120) && !gagOldu && sallama.ekle(dx, dy)) {
          ilerleme++;
          ses.tikir(ilerleme);
          if (t === 'sevmez') {
            gagOldu = true;
            void tut.don_(this.esyaMerkez(e), 260);
            tut = null;
            b.classList.remove('pt-tutuldu');
            void this.tepkiOyna(e, t, no, true);
            return;
          }
          if (bitti()) {
            sonX = x;
            sonY = y;
            return birak_(x, y);
          }
        }
        sonX = x;
        sonY = y;
      },
      birak: (x: number, y: number) => birak_(x, y),
    };
  }

  /** Ekran noktası → sahne birimi */
  private dekorNokta(x: number, y: number): [number, number] {
    const r = this.dekor.sahne.getBoundingClientRect();
    const s = this.dekor.s || 0.3;
    return [(x - r.left) / s, (y - r.top) / s];
  }
  /** Sahne birimi → efekt katmanı noktası */
  private efektNokta(x: number, y: number): [number, number] {
    const r = this.dekor.sahne.getBoundingClientRect();
    const k = this.o.efekt.kutu();
    const s = this.dekor.s || 0.3;
    return [r.left - k.left + x * s, r.top - k.top + y * s];
  }

  // ---------------------------------------------------------------- deneme
  /** Bu eşyanın bu hayvana tepkisi (açık çekmecenin ihtiyacı için) */
  private tepkiHesapla(e: string): Tepki {
    const s = this.sahip!;
    const ih = CEKMECELER[esyaBilgi(e).cekmece].ihtiyac;
    const g = this.gecmis.get(s.id) ?? {};
    return tepki(s.id, ih, e, this.o.yas(), g);
  }

  /**
   * Eşyayı dener: dokunuş (nokta null: eşya çekmeceden hayvana uçar) ya da bırakma (nokta: parmağın yeri). Tutarak
   * yapılan işlerde dokunuş işi kendiliğinden yapar (iki sürtüş, kısa sprey, değnek sallanır).
   */
  async dene(e: string, kaynak: HTMLElement | null, nokta: [number, number] | null) {
    const s = this.sahip;
    const hv = this.hayvan;
    if (!s || !hv) return;
    this.etkilesim();
    this.kes();
    const no = this.islem;
    const t = this.tepkiHesapla(e);
    const k = kullanim(e);
    this.mesgul = true;
    kaynak?.classList.add('pt-kullanimda');
    try {
      if (tutarakMi(k)) await this.kendiligindenTut(e, k, t, no);
      if (no !== this.islem) return;
      await this.tepkiOyna(e, t, no, tutarakMi(k), nokta);
    } finally {
      kaynak?.classList.remove('pt-kullanimda');
    }
  }

  /** Dokunuşla tutarak iş: eşya hayvanın üstüne uçar, kendiliğinden sürtülür / sıkılır / sallanır */
  private async kendiligindenTut(e: string, k: Kullanim, t: Tepki, no: number) {
    const hv = this.hayvan!;
    const bas = this.esyaMerkez(e);
    const boy = this.tutBoy(e);
    const kk = this.o.efekt.kutu();
    const [hx, hy] = this.efektNokta(hv.x + hv.ayar.boy * 0.1, hv.y - hv.ayar.boy * (k === 'salla' ? 1.05 : 0.6));
    if (bas && !sakin()) {
      const u = esyaEl(e);
      u.style.cssText = `display:block;width:${boy}px;height:${boy}px`;
      await this.o.efekt.ucur(u, [bas[0] - kk.left, bas[1] - kk.top], [hx, hy], { ms: 360, kavis: -50 });
    }
    if (no !== this.islem) return;
    const tut = new Tutulan(this.o.efekt, esyaEl(e), { en: boy, boy, sinif: 'pt-tutulan-esya', tx: e === 'tuy-degnek' ? 0.12 : 0.5, ty: e === 'tuy-degnek' ? 0.9 : 0.55 });
    const adim = k === 'firca' ? 2 : k === 'sprey' ? 1 : 3;
    if (k === 'salla' && t !== 'sevmez') hv.pusu(true);
    for (let i = 0; i < adim && no === this.islem; i++) {
      for (let j = 0; j < 6; j++) {
        const f = Math.sin((j / 6) * Math.PI * 2);
        tut.yer(hx + kk.left + f * (k === 'sprey' ? 6 : 46), hy + kk.top + (k === 'salla' ? Math.cos((j / 6) * Math.PI * 2) * 18 : 0), f * 10);
        if (k === 'sprey' && j % 2 === 0) {
          ses.sprey();
          this.damlalar(hx + kk.left, hy + kk.top + 20, 4);
        }
        await bekle(70);
      }
      if (k === 'firca') this.surtus(e, t);
      if (k === 'salla') ses.tikir(i);
      if (t === 'sevmez') break;
    }
    hv.pusu(false);
    await tut.don_(this.esyaMerkez(e), 260);
  }

  /** Bir fırça sürtüşü: ses, gövde yayılır; sever / olur: keyif pozu */
  private surtus(e: string, t: Tepki) {
    const hv = this.hayvan;
    if (!hv) return;
    void e;
    ses.firca();
    hv.ezil(0.9);
    if (t === 'sever' || t === 'olur') {
      void hv.anlik('fircalanma', 700);
      if (hv.tur === 'kedi') ses.mir();
      const [x, y] = this.efektNokta(hv.x, hv.y - hv.ayar.boy * 0.55);
      this.o.efekt.parilti(x, y, 3, 0.6, '#FFF4DD');
    }
  }

  /** Su damlaları (sprey, ıslanma); ekran noktası */
  private damlalar(x: number, y: number, adet: number) {
    if (sakin()) return;
    const k = this.o.efekt.kutu();
    for (let i = 0; i < adet; i++) {
      const d = h('i.pt-damla', { style: `left:${x - k.left + ras(-24, 24)}px;top:${y - k.top}px` });
      this.o.efekt.el.append(d);
      const a = d.animate(
        [
          { transform: 'translate(-50%, -50%) scale(.6)', opacity: 1 },
          { transform: `translate(-50%, -50%) translate(${ras(-16, 16).toFixed(0)}px, ${ras(50, 90).toFixed(0)}px) scale(1)`, opacity: 0.9, offset: 0.8 },
          { transform: `translate(-50%, -50%) translate(${ras(-18, 18).toFixed(0)}px, ${ras(70, 110).toFixed(0)}px) scale(.8)`, opacity: 0 },
        ],
        { duration: ras(420, 620), delay: i * 50, easing: 'cubic-bezier(.4,0,.9,.6)', fill: 'backwards' },
      );
      void a.finished.then(() => d.remove(), () => d.remove());
    }
  }

  // ---------------------------------------------------------------- masadaki eşya
  /**
   * Eşyayı sahneye koyar (sahne birimi; x: ortası, y: tabanı). en: istenen en (birim; netlik sınırıyla küçülür).
   * on: hayvanın önünde mi (örtü, kutu) yoksa arkasında mı (yatak, kâse)
   */
  private koy(e: string, x: number, y: number, en: number, on = false): HTMLElement {
    const s = this.dekor.s || 0.3;
    const el = h('div.pt-sahne-esya', { 'data-esya': e, style: `left:${(x - en / 2).toFixed(0)}px;top:${y.toFixed(0)}px;width:${en.toFixed(0)}px;z-index:${on ? 4 : 1}` }, esyaEl(e));
    // netlik: kaynak pikseli / 3'ten büyük gösterilmez
    const img = el.querySelector('img');
    const sinir = () => {
      if (!img?.naturalWidth) return;
      const enCok = img.naturalWidth / NETLIK_DPR / s;
      if (en > enCok) {
        el.style.width = `${enCok.toFixed(0)}px`;
        el.style.left = `${(x - enCok / 2).toFixed(0)}px`;
      }
    };
    if (img) {
      if (img.complete) sinir();
      else img.addEventListener('load', sinir);
    }
    if (on || !this.hayvan) this.dekor.katman.insertBefore(el, this.alan);
    else this.dekor.katman.insertBefore(el, this.hayvan.el);
    this.sahnede.push({ el, esya: e });
    return el;
  }

  /** Eşya kaynaktan (çekmece ya da parmak) sahnedeki yerine yay çizerek iner */
  private async indir(el: HTMLElement, kaynak: [number, number] | null, ms = 460) {
    if (sakin()) return;
    const r = el.getBoundingClientRect();
    const hedef: [number, number] = [r.left + r.width / 2, r.top + r.height / 2];
    if (!kaynak) return void el.animate([{ opacity: 0, transform: 'translateY(-30px) scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 260 });
    const s = this.dekor.s || 0.3;
    const dx = (kaynak[0] - hedef[0]) / s;
    const dy = (kaynak[1] - hedef[1]) / s;
    await el
      .animate(
        [
          { transform: `translate(${dx}px, ${dy}px) scale(.8)` },
          { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 160}px) scale(1.04, .96)`, offset: 0.5 },
          { transform: 'translate(0, 0) scale(1.12, .84)', offset: 0.85 },
          { transform: 'none' },
        ],
        { duration: ms, easing: 'ease-in-out' },
      )
      .finished.catch(() => undefined);
  }

  /** Sahnedeki eşya kalkar (söner ya da yere düşer) */
  private async kaldir(el: HTMLElement, dus = false) {
    if (!sakin()) await el.animate(dus ? [{ transform: 'none', opacity: 1 }, { transform: 'translateY(160px)', opacity: 0 }] : [{ opacity: 1 }, { opacity: 0, transform: 'translateY(-20px)' }], { duration: dus ? 420 : 300, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => undefined);
    el.remove();
    this.sahnede = this.sahnede.filter((x) => x.el !== el);
  }

  // ---------------------------------------------------------------- tepki
  /** Eşyanın el işi ve hayvanın tepkisi; sonunda sonuç (defter, kalp, jeton) */
  private async tepkiOyna(e: string, t: Tepki, no: number, tutarakBitti: boolean, nokta: [number, number] | null = null) {
    const s = this.sahip;
    const hv = this.hayvan;
    if (!s || !hv || no !== this.islem) return;
    this.mesgul = true;
    const k = kullanim(e);
    const ih = CEKMECELER[esyaBilgi(e).cekmece].ihtiyac;
    const boy = hv.ayar.boy;
    const yon = hv.bakis;
    const kaynak = nokta ?? this.esyaMerkez(e);
    const dur = () => no !== this.islem || this.kapandi;
    const gag = t === 'sevmez' ? komik(hv.tur, e) : undefined;
    this.sonTepki = { esya: e, tepki: t, gag };
    // geçmiş (ders): bu eşya bu hayvana kaç kez verildi
    const g = this.gecmis.get(s.id) ?? {};
    g[e] = (g[e] ?? 0) + 1;
    this.gecmis.set(s.id, g);

    let poz: Poz = 'sevinc';
    if (t === 'sevmez') {
      await this.gagOyna(gag!, e, k, kaynak, no);
    } else if (t === 'baska-ihtiyac') {
      // ilgilenir ama ihtiyacı değil: koklar, merakla bakar
      if (!tutarakBitti) {
        const el = this.koy(e, MASA[0] + yon * boy * 0.55, MASA[1] + 8, boy * 0.4);
        await this.indir(el, kaynak);
        hv.bak(MASA[0] + yon * 400);
        await hv.kokla();
        if (pozVar(hv.ad, 'saskin')) await hv.anlik('saskin', 600);
        if (!dur()) await this.kaldir(el);
      } else await hv.kokla();
    } else {
      poz = await this.isiYap(e, k, ih, t, kaynak, tutarakBitti, no);
    }
    if (dur()) return;
    this.sonuc(s, e, ih, t, poz);
    this.mesgul = false;
  }

  /** sever / olur / ders: eşyanın el işi + ihtiyacın keyif pozu. Dönen: polaroid pozu */
  private async isiYap(e: string, k: Kullanim, ih: IhtiyacAdi, t: Tepki, kaynak: [number, number] | null, tutarakBitti: boolean, no: number): Promise<Poz> {
    const hv = this.hayvan!;
    const boy = hv.ayar.boy;
    const yon = hv.bakis;
    const dur = () => no !== this.islem || this.kapandi;
    const keyif = ISTE_POZ[ih];
    const sever = t === 'sever';
    if (k === 'kap') {
      const el = this.koy(e, Math.max(MASA_X0 + 80, Math.min(MASA_X1 - 80, MASA[0] + yon * boy * 0.5)), MASA[1] + 14, boy * 0.42);
      el.style.transform = '';
      el.classList.add('pt-taban');
      await this.indir(el, kaynak);
      if (dur()) return keyif;
      ses.pit();
      hv.bak(MASA[0] + yon * 400);
      await bekle(180);
      // yer / içer: keyif pozu, her lokmada gövde yayılır
      const icme = ih === 'susuz';
      void hv.anlik(keyif === 'yiyor' && !pozVar(hv.ad, 'yiyor') ? 'ac' : keyif, sever ? 2000 : 1500);
      for (let i = 0; i < (sever ? 5 : 3) && !dur(); i++) {
        if (icme) ses.lap(1);
        else if (hv.tur === 'kopek') ses.hapir();
        else ses.tikir(i);
        hv.ezil(0.7);
        await bekle(360);
      }
      if (dur()) return keyif;
      void this.kaldir(el);
    } else if (k === 'at') {
      await this.topOyunu(e, t, kaynak, no);
    } else if (k === 'yatak') {
      const el = this.koy(e, MASA[0], MASA[1] + 30, boy * 0.95);
      el.classList.add('pt-taban');
      await this.indir(el, kaynak);
      if (dur()) return 'uyku';
      ses.fis();
      hv.cevir();
      await bekle(170);
      hv.cevir();
      hv.halAyarla('uyku');
      if (hv.tur === 'kedi') ses.mir();
      await bekle(sever ? 2400 : 1700);
      if (dur()) return 'uyku';
      hv.halAyarla('bos');
      await hv.gerin();
      void this.kaldir(el);
      return 'uyku';
    } else if (k === 'ortu') {
      const el = this.koy(e, MASA[0] - yon * boy * 0.05, MASA[1] - boy * 0.42, boy * 0.78, true);
      await this.indir(el, kaynak);
      if (dur()) return 'fircalanma';
      ses.fis();
      void hv.anlik('fircalanma', sever ? 2000 : 1500);
      for (let i = 0; i < 3 && !dur(); i++) {
        ezil(el, 0.6, 400);
        await bekle(500);
      }
      if (dur()) return 'fircalanma';
      void this.kaldir(el);
    } else if (k === 'ver') {
      const x = Math.max(MASA_X0 + 60, Math.min(MASA_X1 - 60, MASA[0] + yon * boy * 0.62));
      const el = this.koy(e, x, MASA[1] + 10, boy * 0.45);
      el.classList.add('pt-taban');
      await this.indir(el, kaynak);
      if (dur()) return 'oyun';
      hv.bak(x);
      await hv.anlik(pozVar(hv.ad, 'oyun') ? 'oyun' : 'sevinc', 500);
      await hv.zipla(60, 420, 'oyun', (x - hv.x) * 0.25);
      if (dur()) return 'oyun';
      await hv.zipla(40, 380, 'sevinc', (MASA[0] - hv.x));
      void this.kaldir(el);
    } else if (tutarakBitti) {
      // fırça, sprey, tüy değnek: iş bitti; ihtiyacın keyfi
      if (k === 'salla') {
        const hedef = MASA[0] + yon * 160;
        await hv.zipla(Math.min(220, boy * 0.35), 620, pozVar(hv.ad, 'atla') ? 'atla' : 'oyun', (hedef - hv.x) * 0.6);
        ses.miyav();
        await hv.zipla(30, 300, undefined, MASA[0] - hv.x);
      } else if (k === 'sprey') {
        await hv.anlik(pozVar(hv.ad, 'islak') ? 'islak' : keyif, 900);
        await hv.anlik(pozVar(hv.ad, 'silkelen') ? 'silkelen' : keyif, 600);
      } else await hv.anlik(keyif, 900);
    }
    if (dur()) return keyif;
    // sevinç: sever büyük (iki zıplama), olur küçük
    if (sever) await hv.sevin();
    else {
      hv.sesi(1);
      await hv.zipla(36, 380);
    }
    return keyif;
  }

  /** Top, yumak, frizbi: atılır, masada seker; köpek getirir, kedi kovalar */
  private async topOyunu(e: string, t: Tepki, kaynak: [number, number] | null, no: number) {
    const hv = this.hayvan!;
    const boy = hv.ayar.boy;
    const yon = hv.bakis;
    const dur = () => no !== this.islem || this.kapandi;
    const inis = Math.max(MASA_X0 + 40, Math.min(MASA_X1 - 40, MASA[0] + yon * boy * 0.75));
    const el = this.koy(e, inis, MASA[1] - boy * 0.12, boy * 0.19);
    el.classList.add('pt-taban');
    ses.boing();
    await this.indir(el, kaynak, 620);
    if (dur()) return;
    ses.pit();
    if (!sakin()) void el.animate([{ transform: 'none' }, { transform: 'translateY(-90px)', offset: 0.4 }, { transform: 'none', offset: 0.75 }, { transform: 'translateY(-24px)', offset: 0.88 }, { transform: 'none' }], { duration: 700, easing: 'ease-in-out' });
    hv.bak(inis);
    if (t === 'sever' && hv.tur === 'kopek') {
      // getirir: koşar, ağzına alır, geri döner, ayağının dibine bırakır
      await hv.zipla(30, 300);
      await hv.yuru(inis - yon * boy * 0.3, 900);
      if (dur()) return;
      el.style.opacity = '0';
      void hv.anlik(pozVar(hv.ad, 'top') ? 'top' : 'oyun', 1300);
      await hv.yuru(MASA[0], 800);
      hv.bak(MASA[0] + yon * 400);
      el.style.opacity = '';
      void this.kaldir(el);
      return;
    }
    // kovalar: pusu, atlar, topun yanına konar
    hv.pusu(true);
    await bekle(380);
    hv.pusu(false);
    if (dur()) return;
    await hv.zipla(90, 560, pozVar(hv.ad, 'atla') ? 'atla' : 'oyun', (inis - hv.x) * 0.7);
    if (!sakin()) el.animate([{ transform: 'none' }, { transform: `translateX(${yon * 60}px)` }], { duration: 400, fill: 'forwards' });
    await bekle(300);
    if (dur()) return;
    await hv.yuru(MASA[0], 700);
    void this.kaldir(el);
  }

  /** Komik tepki (sevmez): cezasız, kısa, eşya çekmecesine döner */
  private async gagOyna(gag: Gag, e: string, k: Kullanim, kaynak: [number, number] | null, no: number) {
    const hv = this.hayvan!;
    const boy = hv.ayar.boy;
    const yon = hv.bakis;
    const dur = () => no !== this.islem || this.kapandi;
    const varsa = (p: Poz, yedek: Poz): Poz => (pozVar(hv.ad, p) ? p : yedek);
    // tutarak yapılmayan eşya önce hayvanın yanına iner
    let el: HTMLElement | null = null;
    if (!tutarakMi(k) && gag !== 'kafaya-gecer' && gag !== 'ortu-alti' && gag !== 'hapsir') {
      const x = Math.max(MASA_X0 + 60, Math.min(MASA_X1 - 60, MASA[0] + yon * boy * 0.55));
      el = this.koy(e, x, MASA[1] + 12, boy * (k === 'yatak' ? 0.6 : k === 'at' ? 0.2 : 0.36));
      el.classList.add('pt-taban');
      await this.indir(el, kaynak);
      if (dur()) return;
      hv.bak(x);
    }
    switch (gag) {
      case 'burun-cevir': {
        await hv.kokla();
        if (dur()) break;
        void hv.anlik(varsa('begenmedi', 'bos'), 1400);
        hv.cevir();
        if (el && !sakin()) el.animate([{ transform: 'none' }, { transform: `translateX(${yon * 70}px)` }], { duration: 380, easing: 'ease-out', fill: 'forwards' });
        ses.hmm();
        await bekle(1100);
        if (!dur()) hv.cevir();
        break;
      }
      case 'iyy': {
        await hv.kokla();
        void hv.anlik(varsa('iyy', 'begenmedi'), 1300);
        ses.hmm();
        await hv.titre(500);
        await bekle(500);
        break;
      }
      case 'damla': {
        await hv.kokla();
        void hv.anlik(varsa('saskin', 'bos'), 1100);
        const [x, y] = this.efektNokta(hv.x + yon * boy * 0.3, hv.y - boy * 0.95);
        const kk = this.o.efekt.kutu();
        this.damlalar(x + kk.left, y + kk.top, 1);
        ses.damla();
        await bekle(260);
        await hv.titre(300);
        await bekle(500);
        break;
      }
      case 'islak': {
        ses.sprey();
        void hv.anlik(varsa('islak', 'begenmedi'), 1500);
        await hv.titre(500);
        await bekle(700);
        if (dur()) break;
        void hv.anlik(varsa('silkelen', 'saskin'), 900);
        const [x, y] = this.efektNokta(hv.x, hv.y - boy * 0.5);
        const kk = this.o.efekt.kutu();
        for (let i = 0; i < 3; i++) this.damlalar(x + kk.left + ras(-60, 60), y + kk.top - ras(0, 40), 4);
        await hv.titre(700);
        break;
      }
      case 'kutuya-kac': {
        // ıslanır, tüyleri diken diken; karton kutuya kaçar, kutudan yalnız başı bakar
        ses.sprey();
        void hv.anlik(varsa('islak', 'saskin'), 900);
        await hv.titre(600);
        if (dur()) break;
        const kx = MASA[0] - yon * boy * 0.2;
        const kutu = this.koy('karton-kutu', kx, MASA[1] - boy * 0.5, boy * 0.82, true);
        kutu.classList.add('pt-kutu-kacis');
        await this.indir(kutu, null);
        ses.kutu();
        await hv.zipla(140, 520, varsa('saskin', 'bos'), kx - hv.x);
        void hv.batir(boy * 0.5, 280);
        await bekle(1900);
        if (dur()) break;
        void hv.anlik('goz', 500);
        await bekle(500);
        await hv.batir(0, 300);
        await hv.zipla(70, 420, undefined, MASA[0] - hv.x);
        void this.kaldir(kutu);
        break;
      }
      case 'hapsir': {
        await hv.kokla();
        if (dur()) break;
        void hv.anlik(varsa('hapsirma', 'saskin'), 900);
        ses.hapsu();
        const [nx, ny] = this.efektNokta(hv.x + yon * boy * 0.42, hv.y - boy * 0.62);
        this.o.efekt.pof(nx, ny, 0.7, '#fff');
        // eşya kafasına yapışır, sonra kayıp düşer
        const kafa = this.koy(e, hv.x + yon * boy * 0.08, hv.y - boy * 1.02, boy * 0.3, true);
        kafa.classList.add('pt-kafada');
        await hv.titre(300);
        await bekle(1300);
        if (!dur()) await this.kaldir(kafa, true);
        break;
      }
      case 'kafaya-gecer': {
        // kutu kafasına geçer, kör kör yürür
        const kutu = this.koy(e, hv.x + yon * boy * 0.12, hv.y - boy * 1.08, boy * 0.56, true);
        await this.indir(kutu, kaynak);
        ses.kutu();
        void hv.anlik(varsa('saskin', 'bos'), 2600);
        const git = async (x: number) => {
          if (dur()) return;
          const dx = x - hv.x;
          if (!sakin()) kutu.animate([{ translate: '0 0' }, { translate: `${dx}px 0` }], { duration: sure(Math.max(260, (Math.abs(dx) / 500) * 1000)), fill: 'forwards' });
          await hv.yuru(x, 500);
        };
        const x0 = hv.x;
        await git(Math.max(MASA_X0 + 120, x0 - 150));
        await git(Math.min(MASA_X1 - 120, x0 + 150));
        await git(x0);
        if (!dur()) await this.kaldir(kutu, true);
        break;
      }
      case 'esne': {
        await hv.kokla();
        if (el && !sakin()) el.animate([{ transform: 'none' }, { transform: `translateX(${yon * 90}px)` }], { duration: 500, easing: 'ease-out', fill: 'forwards' });
        void hv.anlik(varsa('esneme', 'uykulu'), 1400);
        ses.gerin();
        await bekle(1300);
        break;
      }
      case 'urker': {
        void hv.anlik(varsa('saskin', 'bos'), 900);
        await hv.irkil();
        await hv.buzul(1200);
        if (dur()) break;
        await hv.kokla();
        break;
      }
      case 'sicak': {
        void hv.anlik(varsa('iyy', 'begenmedi'), 1200);
        await hv.zipla(80, 460, undefined, -yon * 160);
        await bekle(500);
        if (!dur()) await hv.zipla(50, 420, undefined, MASA[0] - hv.x);
        break;
      }
      case 'ortu-alti': {
        // örtünün altında kalır: örtü kıpırdar, sonra kayar, şaşkın bakar
        const ortu = this.koy(e, hv.x, hv.y - boy * 0.92, boy * 1.0, true);
        ortu.classList.add('pt-ortu-ustte');
        await this.indir(ortu, kaynak);
        ses.fis();
        for (let i = 0; i < 4 && !dur(); i++) {
          ezil(ortu, 1.2, 300);
          await bekle(380);
        }
        if (dur()) break;
        void this.kaldir(ortu, true);
        await hv.anlik(varsa('saskin', 'bos'), 900);
        break;
      }
    }
    if (el && !dur()) await this.kaldir(el);
  }

  // ---------------------------------------------------------------- sonuç: defter, kalp, jeton
  private sonuc(s: SahipHayvan, e: string, ih: IhtiyacAdi, t: Tepki, poz: Poz) {
    const hv = this.hayvan;
    if (!hv) return;
    let jeton = 0;
    const ilk = defterYaz(this.o.kayit, s.id, e, t === 'ders' ? 'olur' : t);
    if (ilk) {
      jeton += kazanc('ilk_sever', this.o.yas());
      this.altinKalpYapistir(e);
      this.o.kesif?.(s.id);
    }
    const iyi = t === 'sever' || t === 'olur' || t === 'ders';
    const giderdi = iyi && s.ihtiyac === ih;
    if (giderdi) {
      jeton += kazanc(t === 'sever' ? 'sever' : 'olur', this.o.yas());
      this.o.saat.kapat(s, this.o.simdi());
      this.o.an(anAdi(s.id, poz));
      hv.halAyarla('bos');
      this.balonGuncelle(false);
    } else if (t === 'sevmez' && s.ihtiyac) {
      this.yanlis++;
      if (!this.sevmediDendi && this.yanlis >= (this.o.yas() === 'buyuk' ? 3 : 2)) {
        this.sevmediDendi = true;
        void this.o.nehir.soyle(NEHIR2.sevmedi);
      }
    }
    if (jeton > 0) this.jetonVer(jeton);
    this.o.kaydet();
    if (giderdi) this.kalpKazan(s);
    // ders (5-6): önce sevdi, sonra karnı guruldar → hasta
    if (t === 'ders') {
      const b = hayvanBilgi(s.id).ders;
      window.setTimeout(() => {
        if (this.kapandi || !this.o.kayit.hayvanlar.includes(s)) return;
        ses.gurul();
        this.o.saat.ac(s, b?.sonuc ?? 'hasta', this.o.simdi());
        this.o.kaydet();
        if (this.sahip === s) {
          this.halGuncelle();
          void this.hayvan?.titre(500);
        }
        this.o.degisti(s);
        const soz = b ? (NEHIR2.ders as Record<string, string>)[b.soz] : null;
        void this.o.nehir.soyle(soz ?? NEHIR2.karin);
      }, sure(DERS_SONRA(e)));
    }
    // akşam: yatağını beğenen hayvan uyur
    if (this.o.aksam() && iyi && ih === 'uykulu') {
      hv.halAyarla('uyku');
      void bekle(1200).then(() => this.sahip === s && this.o.uyudu?.(s));
    }
    this.o.degisti(s);
  }

  /** Altın kalp etiketi: eşyanın çekmecedeki resmine yapışır (ilk bulunan ★) */
  private altinKalpYapistir(e: string) {
    const hv = this.hayvan;
    const b = this.esyaDugmesi(e);
    ses.ksilofon();
    if (hv) {
      const [x, y] = this.efektNokta(hv.x, hv.y - hv.ayar.boy * 0.7);
      this.o.efekt.parilti(x, y, 10, 1.1, '#FFD23F');
    }
    if (!b || b.querySelector('.pt-altin-kalp')) return;
    const k = altinKalpEl();
    b.append(k);
    ezil(k, 2, 420);
  }

  /** Jeton hayvanın iki yanına düşer; kayda hemen yazılır */
  private jetonVer(n: number) {
    const hv = this.hayvan;
    if (!hv) return;
    this.o.kayit.jeton += n;
    const p = this.ui.getBoundingClientRect();
    const [x, y] = this.dekor.ekrana(hv.x, hv.y);
    const r = this.dekor.el.getBoundingClientRect();
    this.jetonlar.dusur(n, x + r.left - p.left, y + r.top - p.top, hv.ayar.boy * (this.dekor.s || 0.3) * 0.5);
  }

  /** Kalp: hayvandan kalp sırasına uçar; üçüncüsü dans */
  private kalpKazan(s: SahipHayvan, kaynak: 'sever' | 'olur' | 'oksama' = 'sever') {
    const hv = this.hayvan;
    if (!hv) return;
    const sonuc = kalpEkle(s, Date.now());
    if (!sonuc.eklendi) return;
    void kaynak;
    this.o.kaydet();
    const i = s.kalp - 1;
    const r = hv.kutu();
    const k = this.o.efekt.kutu();
    const [hx, hy] = this.kalpler.nokta(i);
    if (!sakin()) {
      void this.o.efekt.ucur(ucanKalpEl(), [r.left - k.left + r.width / 2, r.top - k.top + r.height * 0.3], [hx - k.left, hy - k.top], { ms: 520, kavis: -50 }).then(() => {
        this.kalpler.doldur(i);
        ses.kalp(i);
      });
    } else {
      this.kalpler.doldur(i);
      ses.kalp(i);
    }
    this.o.degisti(s);
    if (sonuc.dans) void this.dans(s);
  }

  private async dans(s: SahipHayvan) {
    const hv = this.hayvan;
    if (!hv) return;
    const no = this.islem;
    this.mesgul = true;
    await bekle(620);
    if (this.sahip !== s) return;
    await this.kalpler.bosalt();
    void this.o.nehir.soyle(NEHIR2.cok_mutlu);
    const [x, y] = this.efektNokta(hv.x, hv.y - hv.ayar.boy * 0.6);
    this.o.efekt.parilti(x, y, 10, 1.1, '#FFE45C');
    await hv.dans(8, 380, (i) => ses.dansNota(i));
    if (this.sahip !== s) return;
    const n = dansBitti(s, Date.now(), this.o.yas());
    this.o.an(anAdi(s.id, 'dans-a'));
    this.jetonVer(n);
    this.o.kaydet();
    this.o.degisti(s);
    await hv.zipla(60, 420, 'sevinc');
    if (no === this.islem) this.mesgul = false;
  }

  // ---------------------------------------------------------------- okşama ve dokunuş
  private oksa() {
    const s = this.sahip;
    const hv = this.hayvan;
    if (!s || !hv) return;
    this.etkilesim();
    if (hv.tur === 'kedi') ses.mir();
    else hv.sesi(1);
    const r = hv.kutu();
    const k = this.o.efekt.kutu();
    this.o.efekt.kalpler(r.left - k.left + r.width / 2, r.top - k.top + r.height * 0.3, 3);
    void hv.oksan(1100);
    const simdi = performance.now();
    if (simdi - this.sonOksamaKalp >= OKSAMA_KALP_MS && !this.mesgul) {
      this.sonOksamaKalp = simdi;
      this.kalpKazan(s, 'oksama');
    }
  }
  private async irkil() {
    this.etkilesim();
    if (!this.mesgul) await this.hayvan?.irkil();
  }
  private dokun() {
    this.etkilesim();
    this.cekmeceKapa();
    if (this.mesgul) return;
    const hv = this.hayvan;
    if (!hv) return;
    hv.sesi(1);
    void hv.zipla(50, 420, 'sevinc');
  }

  // ---------------------------------------------------------------- yardım merdiveni (dükkân çağırır)
  /** Merdivenin bir adımı (o hayvanın açık ihtiyacı için; dükkân her adımı bir kez çağırır) */
  yardim(adim: YardimAdimi) {
    const s = this.sahip;
    const hv = this.hayvan;
    if (!s?.ihtiyac || !hv) return;
    const ih = s.ihtiyac;
    if (adim === 'dolayli' && !this.mesgul) void dolayliHareket(hv, ih, this.o.efekt, (x, y) => this.efektNokta(x, y));
    else if (adim === 'balon') this.balonGuncelle(true);
    else if (adim === 'kulp') this.kulpKipirdat();
  }

  /** 3-4 resim balonu: ihtiyacın genel resmi (çekmece önündeki resim), eşya değil */
  balonGuncelle(goster: boolean) {
    const ih = this.sahip?.ihtiyac;
    const acik = goster && !!ih && this.o.yas() === 'kucuk';
    if (acik) {
      const c = (Object.keys(CEKMECELER) as CekmeceAdi[]).find((x) => CEKMECELER[x].ihtiyac === ih)!;
      if (this.balon.dataset.cekmece !== c) this.balon.replaceChildren(h('span.pt-balon2-ic', {}, dolapEl(c)), h('i.pt-balon2-k1'), h('i.pt-balon2-k2'));
      this.balon.dataset.cekmece = c;
      if (!this.balon.classList.contains('acik')) {
        this.balon.classList.add('acik');
        this.uiYerlesim();
        ezil(this.balon.firstElementChild, 1.6, 420);
      }
    } else {
      this.balon.classList.remove('acik');
      delete this.balon.dataset.cekmece;
    }
  }

  /** 40 sn: yalnız doğru çekmecenin kulpu bir kez kıpırdar (çekmece açıksa onun küçük resmi) */
  kulpKipirdat() {
    const ih = this.sahip?.ihtiyac;
    if (!ih) return;
    const c = (Object.keys(CEKMECELER) as CekmeceAdi[]).find((x) => CEKMECELER[x].ihtiyac === ih)!;
    if (!this.cekmeceVar(c)) return;
    const hedef = this.acikCekmece ? this.sekmeler.querySelector<HTMLElement>(`.pt-sekme[data-cekmece="${c}"]`) : this.cekmeceler.get(c)!;
    if (!hedef) return;
    hedef.dataset.kipir = String(Number(hedef.dataset.kipir ?? 0) + 1);
    ses.cekmece(false);
    if (sakin()) return;
    hedef.animate(
      [{ translate: '0 0' }, { translate: '-5px 0' }, { translate: '5px 0' }, { translate: '-3px 0' }, { translate: '0 0' }],
      { duration: 420, easing: 'ease-in-out' },
    );
  }

  // ---------------------------------------------------------------- çağrı penceresi
  /** Öbür hayvan bir şey isterse sol kenarda yüzü belirir */
  cagriGuncelle() {
    const s = this.sahip;
    const oteki = s ? this.o.kayit.hayvanlar.find((x) => x !== s && x.ihtiyac) : undefined;
    const id = oteki?.id ?? null;
    if (id === this.cagriId) return;
    this.cagriId = id;
    if (!oteki) {
      this.cagri.classList.remove('acik');
      return;
    }
    const poz = IHTIYAC_HAL[oteki.ihtiyac!] as Poz;
    this.cagri.replaceChildren(h('img', { src: pozAdresi(oteki.id, poz).url, alt: '', draggable: 'false' }));
    this.cagri.dataset.hayvan = oteki.id;
    this.cagri.classList.add('acik');
    ezil(this.cagri, 1.6, 420);
  }

  // ---------------------------------------------------------------- yardımcılar
  private etkilesim() {
    this.o.etkilesim();
  }

  /** Test: odadaki durum */
  get durum() {
    return {
      acik: this.acik,
      hayvan: this.sahip?.id ?? null,
      ihtiyac: this.sahip?.ihtiyac ?? null,
      kalp: this.sahip?.kalp ?? 0,
      cekmece: this.acikCekmece,
      esyalar: [...this.izgara.querySelectorAll<HTMLElement>('.pt-esya')].map((b) => b.dataset.esya!),
      cekmeceler: SIRA.filter((c) => this.cekmeceVar(c)),
      sonTepki: this.sonTepki,
      mesgul: this.mesgul,
      balon: this.balon.classList.contains('acik'),
      cagri: this.cagri.classList.contains('acik') ? this.cagriId : null,
      dusenJeton: this.jetonlar.sayi,
    };
  }

  kapat() {
    this.kapandi = true;
    this.kes();
    for (const z of this.zamanlar) clearTimeout(z);
    for (const f of this.birak) f();
    for (const f of this.esyaBirak) f();
    this.hayvan?.kapat();
    this.dekor.kapat();
  }
}

/** Altın kalp etiketi (ui-jeton altın kalbi; yoksa sade düz altın kalp) */
function altinKalpEl(): HTMLElement {
  return ALTIN_KALP
    ? h('span.pt-altin-kalp', {}, h('img', { src: ALTIN_KALP, alt: '' }))
    : h('span.pt-altin-kalp.pt-yer-tutucu', { html: '<svg viewBox="0 0 34 31" aria-hidden="true"><path d="M17 28.5C7 21 2.5 15.6 2.5 9.8 2.5 5.4 5.9 2.5 10 2.5c3 0 5.4 1.7 7 4.2 1.6-2.5 4-4.2 7-4.2 4.1 0 7.5 2.9 7.5 7.3 0 5.8-4.5 11.2-14.5 18.7z" fill="#FFD23F" stroke="#3B2416" stroke-width="2.6" stroke-linejoin="round"/></svg>' });
}

/** Resim yüklenince kaynak pikseli / 3'ten büyük gösterilmez (netlik) */
function netlikSinirla(kap: HTMLElement) {
  const img = kap.querySelector('img');
  if (!img) return;
  const f = () => {
    if (!img.naturalWidth) return;
    img.style.maxWidth = `min(100%, ${img.naturalWidth / NETLIK_DPR}px)`;
    img.style.maxHeight = `min(100%, ${img.naturalHeight / NETLIK_DPR}px)`;
  };
  if (img.complete) f();
  else img.addEventListener('load', f);
}

/**
 * 12 sn: hayvanın dolaylı bir hareketi (§8d): aç → kabını arar gibi koklar; susuz → soluyarak titrer; kirli → kaşınır,
 * toz bulutu; sıkılmış → iç çeker, bir yana bir yana bakar; uykulu → kocaman esner; hasta → hapşırır.
 */
export async function dolayliHareket(hv: Hayvan, ih: IhtiyacAdi, efekt: Efekt, nokta: (x: number, y: number) => [number, number]) {
  const boy = hv.ayar.boy;
  if (ih === 'ac') {
    hv.cevir();
    await hv.kokla();
    hv.cevir();
    await hv.kokla();
  } else if (ih === 'susuz') {
    ses.lap(2);
    await hv.titre(500);
  } else if (ih === 'kirli') {
    void hv.anlik(pozVar(hv.ad, 'silkelen') ? 'silkelen' : 'kirli', 700);
    const [x, y] = nokta(hv.x, hv.y - boy * 0.4);
    efekt.pof(x, y, 0.9, '#C9A27A');
    await hv.titre(600);
  } else if (ih === 'sikildi') {
    hv.ezil(1.4);
    hv.cevir();
    await bekle(700);
    hv.cevir();
  } else if (ih === 'uykulu') {
    ses.gerin();
    await hv.anlik(pozVar(hv.ad, 'esneme') ? 'esneme' : 'uykulu', 1300);
  } else if (ih === 'hasta') {
    void hv.anlik(pozVar(hv.ad, 'hapsirma') ? 'hapsirma' : 'hasta', 800);
    ses.hapsu();
    const [x, y] = nokta(hv.x + hv.bakis * boy * 0.4, hv.y - boy * 0.6);
    efekt.pof(x, y, 0.6, '#fff');
  }
}
