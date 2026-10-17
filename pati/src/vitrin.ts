/**
 * Pati Dükkânı v2 · Yavru Vitrini (PATI-V2 §4b). Çocuk İSTEDİĞİ yavruyu seçer, jetonla alır.
 *
 *  - 6 cam bölme (vitrin-ic çizimi). Bölmedeki yavru nefes alır, göz kırpar, arada kendi hareketini yapar.
 *  - Tanışma: yavruya dokununca kendi huyunu gösterir, Nehir abla tek cümleyle anlatır ("Tarçın biraz nazlı.").
 *    Talimat yok: ne "dokun" ne "sürükle" denir.
 *  - Satın alma: yavru bölmeden taşıma sepetine sürüklenir; dokunarak da olur (tanıştığı yavruya bir daha dokununca ya
 *    da sepete dokununca yavru sepete hoplar). Jetonlar kumbaradan etikete yay çizerek uçar, Nehir sayar ("Bir! İki!
 *    Üç!"; 5-6: "Beş! Altı! Yedi!"), en çok ~2 sn.
 *  - Jeton yetmezse: eksikler etikette boş daire kalır, jetonlar kumbaraya döner, yavru sepetten bölmesine geri
 *    zıplar ve el sallar. "Biraz daha jeton lazım." Kilit, gri ekran yok.
 *  - Yer yoksa: "Önce ona bir köşe açalım." (köşe mağazası paket 3)
 *  - Dolaylı ipucu (geç): 20 sn kimse dokunmazsa bir yavru cama yaslanır; 40 sn'de sepet bir kez kıpırdar. Parlama, ok,
 *    el yok.
 *
 * Yerleşim: yatay telefonda vitrin çizimi ekranı kaplar (ölçek 0,307 ≤ 1/3). Dikeyde bölmeler aynı çizimden kesit
 * (arka plan konumu) olarak 2 sütun × 3 sıra dizilir (ölçek ≤ 1/3); 6. bölmenin önündeki sepet onunla birlikte.
 */
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { elSurukle, icinde, Tutulan } from '../../kino-otobus/src/dokunsal';
import type { Efekt } from '../../kino-otobus/src/efekt';
import { Etiket, ezil, jetonUcur, type Kumbara } from './arayuz';
import { Dekor, ENCOK_OLCEK, type Bolge } from './dekor';
import { fiyat, odemeDizisi, satinAl, vitrin, yerVar } from './ekonomi';
import { Hayvan } from './hayvan';
import { hayvanBilgi, NEHIR2, type Yas } from './katalog';
import type { PatiKayit, SahipHayvan } from './kayit';
import type { Nehir } from './nehir';
import { ses } from './sesler';
import { hayvanGorseliVar, pozAdresi, VITRIN } from './varliklar';

const AZ = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const sakin = () => AZ || TEST_MODU;
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, sure(ms)));
const ras = (a: number, b: number) => a + Math.random() * (b - a);

// ---------------------------------------------------------------- vitrin-ic çiziminin ölçüleri (sahne birimi)
const KOLON = [765, 1375, 2005];
const SATIR = [280, 772];
const BOLME_W = 575;
const BOLME_H = 490;
/** Bölmenin kutusu (çizimde) */
const bolgeAl = (i: number): Bolge => {
  const x0 = KOLON[i % 3];
  const y0 = SATIR[Math.floor(i / 3)];
  return { x0, y0, x1: x0 + BOLME_W, y1: y0 + BOLME_H };
};
/** Bölmede yavrunun ayakları (yastığın üstü) ve boyu, bölmenin içinde */
const AYAK = (i: number): [number, number] => [BOLME_W / 2, i < 3 ? 348 : 320];
const YAVRU_BOY = (i: number) => (i < 3 ? 270 : 258);
/** Etiketin yeri (bölmenin içinde; 6. bölmenin tahta yuvası sepetin arkasında: etiket sola) */
const ETIKET_YER = (i: number): [number, number] => [i === 5 ? 120 : BOLME_W / 2, i < 3 ? 444 : 432];
/** Taşıma sepeti (tezgâhın üstünde) ve önü (yavru içinde otursun diye; aynı çizimin kesiti) */
const SEPET: Bolge = { x0: 2150, y0: 1020, x1: 2585, y1: 1420 };
const SEPET_ON = [[2172, 1205], [2205, 1196], [2230, 1215], [2280, 1240], [2340, 1251], [2440, 1251], [2510, 1232], [2545, 1210], [2578, 1205], [2565, 1300], [2520, 1395], [2440, 1410], [2270, 1410], [2210, 1385], [2180, 1300]];
const SEPET_AYAK: [number, number] = [2362 - SEPET.x0, 1292 - SEPET.y0];
const SEPET_BOY = 250;
/** Dikeyde 6. bölmenin kesiti sepeti de içine alır */
const BOLME5_DIKEY_H = SEPET.y1 - SATIR[1];

interface Bolme {
  i: number;
  el: HTMLElement;
  bolge: Bolge;
  id: string | null;
  hayvan: Hayvan | null;
  etiket: Etiket | null;
  tanisti: number;
  mesgul: boolean;
}

export interface VitrinOrtam {
  efekt: Efekt;
  nehir: Nehir;
  kumbara: Kumbara;
  kayit: PatiKayit;
  kaydet: () => void;
  yas: () => Yas;
  /** satın alındı: dükkân yavruyu köşesine götürür */
  alindi: (h: SahipHayvan) => void;
  /** dokunuldu (dolaylı ipucu sayacı sıfırlanır) */
  etkilesim?: () => void;
}

export class Vitrin {
  readonly el: HTMLElement;
  readonly dekor: Dekor;
  private bolmeler: Bolme[] = [];
  private sepet: HTMLElement;
  private sepetHayvan: Hayvan | null = null;
  private secili: number | null = null;
  private aliniyor = false;
  private kapandi = false;
  private birak: (() => void)[] = [];
  private zamanlar: number[] = [];
  private sonEtkilesim = performance.now();
  private ipucu = 0;
  /** açılış: bölmeler boş (yavrular sonra gelir) */
  bos = false;

  constructor(private o: VitrinOrtam) {
    this.dekor = new Dekor(VITRIN, { yatay: { x0: 700, y0: 240, x1: 2620, y1: 1420 }, dikey: { x0: 700, y0: 240, x1: 2620, y1: 1420 } });
    this.el = h('div.pt-panel.pt-vitrin', { 'data-panel': 'vitrin' }, this.dekor.el);
    for (let i = 0; i < 6; i++) {
      const b = bolgeAl(i);
      const el = h('div.pt-bolme', { 'data-bolme': String(i), style: `width:${BOLME_W}px;height:${BOLME_H}px;--x0:${b.x0}px;--y0:${b.y0}px;--vitrin:url("${VITRIN}")` });
      const bolme: Bolme = { i, el, bolge: b, id: null, hayvan: null, etiket: null, tanisti: 0, mesgul: false };
      el.addEventListener('click', () => this.bolmeDokun(bolme));
      this.birak.push(elSurukle(el, this.surukleme(bolme)));
      this.bolmeler.push(bolme);
    }
    // sepet: kesitin önü (yavrunun alt yarısını örter)
    const on = h('div.pt-sepet-on', { style: `clip-path:polygon(${SEPET_ON.map(([x, y]) => `${x - SEPET.x0}px ${y - SEPET.y0}px`).join(',')});--x0:${SEPET.x0}px;--y0:${SEPET.y0}px;--vitrin:url("${VITRIN}")` });
    this.sepet = h('div.pt-sepet', { style: `width:${SEPET.x1 - SEPET.x0}px;height:${SEPET.y1 - SEPET.y0}px;--x0:${SEPET.x0}px;--y0:${SEPET.y0}px`, 'aria-label': 'Taşıma sepeti' }, h('div.pt-sepet-ic'), on);
    this.sepet.addEventListener('click', () => this.sepetDokun());
    this.dekor.degisti = () => this.yerlesim();
    this.yenile();
    requestAnimationFrame(() => this.dekor.kur());
    this.zamanlar.push(window.setInterval(() => this.canli(), 900));
  }

  // ---------------------------------------------------------------- yerleşim (yatay: çizim; dikey: kesitler)
  yerlesim() {
    const W = this.el.clientWidth || 844;
    const H = this.el.clientHeight || 390;
    const dikey = H > W;
    this.el.classList.toggle('pt-dikey', dikey);
    const sepetBolme = this.bolmeler[5];
    if (!dikey) {
      for (const b of this.bolmeler) {
        if (b.el.parentElement !== this.dekor.katman) this.dekor.katman.append(b.el);
        b.el.classList.remove('pt-kesit');
        b.el.style.transform = `translate(${b.bolge.x0}px, ${b.bolge.y0}px)`;
        b.el.style.height = `${BOLME_H}px`;
      }
      this.dekor.katman.append(this.sepet);
      this.sepet.style.transform = `translate(${SEPET.x0}px, ${SEPET.y0}px)`;
      return;
    }
    // dikey: 2 sütun × 3 sıra; ölçek ≤ 1/3 (netlik)
    const pay = 10;
    const ara = 8;
    const ust = Math.max(64, H * 0.08);
    const s = Math.min(ENCOK_OLCEK, (W - 2 * pay - ara) / (2 * BOLME_W));
    const sol = (W - (2 * BOLME_W * s + ara)) / 2;
    const sira = [0, 1, 2, 3, 4, 5];
    let y = ust;
    for (let r = 0; r < 3; r++) {
      let enYuksek = 0;
      for (let c = 0; c < 2; c++) {
        const b = this.bolmeler[sira[r * 2 + c]];
        const bh = b === sepetBolme ? BOLME5_DIKEY_H : BOLME_H;
        if (b.el.parentElement !== this.el) this.el.append(b.el);
        b.el.classList.add('pt-kesit');
        b.el.style.height = `${bh}px`;
        b.el.style.transform = `translate(${(sol + c * (BOLME_W * s + ara)).toFixed(1)}px, ${y.toFixed(1)}px) scale(${s.toFixed(5)})`;
        enYuksek = Math.max(enYuksek, bh * s);
      }
      y += (r === 2 ? BOLME_H * s : enYuksek) + ara;
    }
    sepetBolme.el.append(this.sepet);
    this.sepet.style.transform = `translate(${SEPET.x0 - sepetBolme.bolge.x0}px, ${SEPET.y0 - sepetBolme.bolge.y0}px)`;
    this.el.style.setProperty('--izgara-alt', `${(y + (BOLME5_DIKEY_H - BOLME_H) * s).toFixed(0)}px`);
  }

  // ---------------------------------------------------------------- bölmeleri doldur
  /** Kayda göre vitrini kurar (alınanlar gider, sırası gelenler gelir) */
  yenile() {
    const liste = vitrin(this.o.kayit, hayvanGorseliVar);
    for (const b of this.bolmeler) {
      const id = this.bos ? null : liste[b.i];
      if (b.id === id && (id === null || b.hayvan)) {
        b.etiket?.el.remove();
        if (id) this.etiketKur(b);
        continue;
      }
      b.hayvan?.kapat();
      b.hayvan?.el.remove();
      b.etiket?.el.remove();
      b.hayvan = null;
      b.etiket = null;
      b.id = id;
      b.tanisti = 0;
      b.el.dataset.hayvan = id ?? '';
      if (!id) continue;
      const [ax, ay] = AYAK(b.i);
      b.hayvan = new Hayvan({ ad: id, boy: YAVRU_BOY(b.i), x: ax, y: ay });
      b.el.append(b.hayvan.el);
      this.etiketKur(b);
    }
    // tek başına kalan sepet yavrusu
    if (this.sepetHayvan && !this.aliniyor) {
      this.sepetHayvan.kapat();
      this.sepetHayvan.el.remove();
      this.sepetHayvan = null;
    }
  }
  private etiketKur(b: Bolme) {
    if (!b.id) return;
    b.etiket = new Etiket(fiyat(b.id, this.o.yas()), this.o.yas());
    const [ex, ey] = ETIKET_YER(b.i);
    b.etiket.el.style.cssText = `left:${ex}px;top:${ey}px`;
    b.el.append(b.etiket.el);
  }

  /** Görünen yavrular (test ve ön yükleme) */
  get liste(): (string | null)[] {
    return this.bolmeler.map((b) => b.id);
  }

  // ---------------------------------------------------------------- açılış
  /** Yavrular sırayla bölmelerine gelir (yastığın arkasından hoplayarak) */
  async yavrularGelsin(aralik = 420) {
    this.bos = false;
    this.yenile();
    for (const b of this.bolmeler) {
      if (!b.hayvan) continue;
      b.hayvan.el.classList.add('pt-gizli');
      b.etiket?.el.classList.add('pt-gizli');
    }
    for (const b of this.bolmeler) {
      if (!b.hayvan || this.kapandi) continue;
      const hv = b.hayvan;
      hv.el.classList.remove('pt-gizli');
      void hv.zipla(70, 480, 'sevinc');
      hv.sesi(1);
      await bekle(aralik * 0.5);
      b.etiket?.el.classList.remove('pt-gizli');
      ezil(b.etiket?.el, 1.4);
      await bekle(aralik * 0.5);
    }
  }
  /** Sonraki açılışlar: yavrular kapıya bakar, zıplar */
  async selam() {
    for (const b of this.bolmeler) {
      if (!b.hayvan) continue;
      const hv = b.hayvan;
      void (async () => {
        await bekle(ras(0, 500));
        hv.sesi(1);
        await hv.zipla(60, 460, 'sevinc');
      })();
    }
  }

  /** Mağazanın "Yavrular" sayfasından seçilen yavru bölmesinde kendini gösterir (tanışma; satın almaz) */
  async goster(id: string) {
    this.yenile();
    const b = this.bolmeler.find((x) => x.id === id);
    if (!b?.hayvan || b.mesgul) return;
    await bekle(300);
    await this.tanis(b);
  }

  // ---------------------------------------------------------------- tanışma
  private bolmeDokun(b: Bolme) {
    this.etkilesim();
    if (!b.hayvan || !b.id || b.mesgul || this.aliniyor) {
      if (!b.id) ezil(b.el.querySelector('.pt-dekor-resim'), 1);
      return;
    }
    const simdi = performance.now();
    // tanıştığı yavruya yeniden dokunmak: yavru sepete hoplar (satın alma denemesi)
    if (this.secili === b.i && b.tanisti && simdi - b.tanisti > sure(700)) {
      void this.satinAlmayiDene(b, null);
      return;
    }
    this.secili = b.i;
    this.el.dataset.secili = String(b.i);
    void this.tanis(b);
  }

  private sepetDokun() {
    this.etkilesim();
    const b = this.secili !== null ? this.bolmeler[this.secili] : null;
    if (b && b.hayvan && !b.mesgul && !this.aliniyor) {
      void this.satinAlmayiDene(b, null);
      return;
    }
    ezil(this.sepet, 1.2);
    ses.pit();
  }

  /** Yavrunun kendi huyu: hareket + Nehir'in tek cümlesi (ilk tanışmada) */
  private async tanis(b: Bolme) {
    const hv = b.hayvan!;
    const bilgi = hayvanBilgi(b.id!);
    const ilk = !b.tanisti;
    b.tanisti = performance.now();
    b.mesgul = true;
    b.el.dataset.tanisti = '1';
    // önce hayvanın kendi cümlesi (Fıstık ile Duman'ın huyu ikisi de "uykucu"), yoksa huyun cümlesi
    const soz = (NEHIR2.tanisma as Record<string, string>)[b.id!] ?? (NEHIR2.huy as Record<string, string>)[bilgi.huy];
    if (ilk && soz) void this.o.nehir.soyle(soz);
    try {
      switch (bilgi.huy) {
        case 'coskulu':
          // Fındık: yerinde durmaz, cama atılıp yalar
          hv.sesi(2);
          await hv.zipla(90, 420, 'sevinc');
          await hv.zipla(60, 360, 'oyun');
          await hv.anlik('sevinc', 500);
          break;
        case 'nazli':
          // Tarçın: kuyruğunu kovalar (döner döner), sonra burnunu havaya diker
          hv.sesi(1);
          for (let i = 0; i < 3; i++) {
            hv.cevir();
            await hv.zipla(26, 240);
          }
          await hv.gerin();
          break;
        case 'utangac':
          // Pofuduk: kulaklarını indirip saklanır, sonra yavaşça bakar
          ses.burun(1);
          await hv.buzul(1500);
          hv.sesi(1);
          break;
        case 'uykucu':
        case 'tembel':
          await hv.anlik('uyku', 1100);
          await hv.gerin();
          break;
        case 'cesur':
          hv.sesi(2);
          await hv.zipla(110, 480, 'sevinc');
          await hv.zipla(110, 480, 'sevinc');
          break;
        default:
          hv.sesi(1);
          await hv.zipla(70, 460, 'sevinc');
          await hv.gerin();
      }
    } finally {
      b.mesgul = false;
    }
  }

  // ---------------------------------------------------------------- sürükleme
  private surukleme(b: Bolme) {
    let tut: Tutulan | null = null;
    let ustunde = false;
    return {
      aktif: () => !!b.hayvan && !b.mesgul && !this.aliniyor,
      basla: (x: number, y: number) => {
        this.etkilesim();
        const hv = b.hayvan!;
        const r = hv.kutu();
        tut = new Tutulan(this.o.efekt, h('img.pt-tutulan-resim', { src: hv.resim.currentSrc || hv.resim.src, alt: '', draggable: 'false' }), { en: r.width, boy: r.height, sinif: 'pt-tutulan-yavru', tx: 0.5, ty: 0.55 });
        tut.yer(x, y);
        hv.el.classList.add('pt-gizli');
        hv.sesi(1);
        this.secili = b.i;
        ustunde = false;
      },
      tasi: (x: number, y: number, dx: number) => {
        if (!tut) return;
        tut.yer(x, y, dx);
        const yeni = icinde(this.sepet.getBoundingClientRect(), x, y, 12);
        if (yeni && !ustunde) ezil(this.sepet, 0.8);
        ustunde = yeni;
        this.sepet.classList.toggle('pt-hedef', yeni);
      },
      birak: (x: number, y: number) => {
        const t = tut;
        tut = null;
        this.sepet.classList.remove('pt-hedef');
        if (!t) return;
        if (icinde(this.sepet.getBoundingClientRect(), x, y, 12) && b.hayvan) {
          t.kaldir();
          void this.satinAlmayiDene(b, [x, y]);
          return;
        }
        // sepete değil: yavru bölmesine döner
        const r = b.hayvan?.kutu();
        void t.don_(r ? [r.left + r.width / 2, r.top + r.height * 0.55] : null, 260).then(() => {
          b.hayvan?.el.classList.remove('pt-gizli');
          b.hayvan?.ezil(1.2);
        });
      },
    };
  }

  // ---------------------------------------------------------------- satın alma
  /** Yavru sepete hoplar; jetonlar uçar; yeterse alınır, yetmezse yavru bölmesine döner */
  private async satinAlmayiDene(b: Bolme, birakma: [number, number] | null) {
    if (this.aliniyor || !b.id || !b.hayvan) return;
    this.aliniyor = true;
    b.mesgul = true;
    this.el.dataset.aliniyor = '1';
    const id = b.id;
    const yas = this.o.yas();
    const hv = b.hayvan;
    try {
      // 1) yavru sepete hoplar
      await this.sepeteHopla(b, birakma);
      if (this.kapandi) return;
      // yer yok (köşesi dolu ya da kapalı): sepetten geri döner
      if (!yerVar(this.o.kayit, id)) {
        ses.hmm();
        await this.o.nehir.soyle(NEHIR2.kose_lazim).catch(() => undefined);
        await this.bolmeyeDon(b);
        return;
      }
      // 2) jetonlar kumbaradan etikete
      const f = fiyat(id, yas);
      const odeme = odemeDizisi(f, this.o.kayit.jeton, yas);
      const et = b.etiket!;
      et.odemeBasla();
      let gosterilen = this.o.kumbara.jeton;
      let odenen = 0;
      for (let i = 0; i < odeme.ucan.length && !this.kapandi; i++) {
        const v = odeme.ucan[i];
        gosterilen -= v;
        this.o.kumbara.ayarla(gosterilen);
        this.o.kumbara.yut();
        const hedef = et.yuvaNoktasi(odenen + v);
        // uçarken bir sonraki çıkar: toplam ≤ ~2 sn
        await jetonUcur(this.o.efekt, this.o.kumbara.agiz(), hedef, v, 300);
        odenen += v;
        et.goster(odenen);
        ses.jeton(i);
        void this.o.nehir.soyle(odeme.soz[i]);
        await bekle(odeme.ucan.length > 4 ? 120 : 200);
      }
      if (odeme.eksik === 0) {
        const sonuc = satinAl(this.o.kayit, id, yas);
        if (sonuc.durum !== 'tamam') throw new Error(`satın alınamadı: ${sonuc.durum}`);
        this.o.kaydet();
        this.o.kumbara.ayarla(this.o.kayit.jeton);
        // etiketteki jetonlar parlayıp söner, yavru sepette sevinir
        const r = et.el.getBoundingClientRect();
        const k = this.o.efekt.kutu();
        this.o.efekt.parilti(r.left - k.left + r.width / 2, r.top - k.top + r.height / 2, 8, 1, '#FFE45C');
        et.el.classList.add('pt-odendi');
        ses.ksilofon();
        if (this.sepetHayvan) void this.sepetHayvan.sevin();
        await this.o.nehir.soyle(NEHIR2.yasasin).catch(() => undefined);
        b.hayvan = null;
        hv.kapat();
        hv.el.remove();
        b.id = null;
        b.etiket?.el.remove();
        b.etiket = null;
        this.secili = null;
        delete this.el.dataset.secili;
        this.o.alindi(sonuc.hayvan);
        return;
      }
      // 3) yetmedi: eksikler boş daire kalır, jetonlar kumbaraya döner
      et.eksikNabiz();
      ses.hmm();
      const soz = this.o.nehir.soyle(NEHIR2.jeton_az).catch(() => undefined);
      await bekle(700);
      const geri = [...odeme.ucan].reverse();
      let kalan = odenen;
      for (const v of geri) {
        if (this.kapandi) break;
        const kaynak = et.yuvaNoktasi(kalan);
        kalan -= v;
        et.goster(kalan, true);
        await jetonUcur(this.o.efekt, kaynak, this.o.kumbara.agiz(), v, 240);
        gosterilen += v;
        this.o.kumbara.ayarla(gosterilen);
        this.o.kumbara.yut();
      }
      this.o.kumbara.ayarla(this.o.kayit.jeton);
      et.goster(0);
      await soz;
      await this.bolmeyeDon(b);
    } finally {
      this.aliniyor = false;
      b.mesgul = false;
      delete this.el.dataset.aliniyor;
    }
  }

  /** Bölmedeki yavru (ya da parmaktan bırakılan) yay çizerek sepete hoplar; sepette oturur */
  private async sepeteHopla(b: Bolme, birakma: [number, number] | null) {
    const hv = b.hayvan!;
    const r0 = hv.kutu();
    const url = pozAdresi(b.id!, 'sevinc').url;
    // sepetteki yavru (sepetin içinde, önünün arkasında)
    const sh = new Hayvan({ ad: b.id!, boy: SEPET_BOY, x: SEPET_AYAK[0], y: SEPET_AYAK[1] });
    sh.el.classList.add('pt-gizli', 'pt-sepette');
    this.sepet.querySelector('.pt-sepet-ic')!.append(sh.el);
    this.sepetHayvan?.kapat();
    this.sepetHayvan?.el.remove();
    this.sepetHayvan = sh;
    await new Promise((r) => requestAnimationFrame(r));
    const r1 = sh.kutu();
    hv.el.classList.add('pt-gizli');
    if (!sakin()) {
      const k = this.o.efekt.kutu();
      const bas: [number, number] = birakma ?? [r0.left + r0.width / 2, r0.top + r0.height / 2];
      const img = h('img.pt-ucan-yavru', { src: url, alt: '', style: `width:${r0.width.toFixed(0)}px;height:${r0.height.toFixed(0)}px` });
      ses.hop();
      await this.o.efekt.ucur(img, [bas[0] - k.left, bas[1] - k.top], [r1.left - k.left + r1.width / 2, r1.top - k.top + r1.height / 2], { ms: 560, kavis: -110, boy1: r1.height / Math.max(1, r0.height) });
    }
    sh.el.classList.remove('pt-gizli');
    ses.pit();
    ezil(this.sepet, 1.4, 320);
    sh.ezil(1.6);
  }

  /** Sepetteki yavru bölmesine geri zıplar ve el sallar (cezasız) */
  private async bolmeyeDon(b: Bolme) {
    const sh = this.sepetHayvan;
    const hv = b.hayvan;
    if (!hv) return;
    if (sh && !sakin()) {
      const r0 = sh.kutu();
      hv.el.classList.remove('pt-gizli');
      hv.el.style.visibility = 'hidden';
      const r1 = hv.kutu();
      hv.el.style.visibility = '';
      hv.el.classList.add('pt-gizli');
      const k = this.o.efekt.kutu();
      sh.el.classList.add('pt-gizli');
      const img = h('img.pt-ucan-yavru', { src: pozAdresi(b.id!, 'sevinc').url, alt: '', style: `width:${r0.width.toFixed(0)}px;height:${r0.height.toFixed(0)}px` });
      ses.hop();
      await this.o.efekt.ucur(img, [r0.left - k.left + r0.width / 2, r0.top - k.top + r0.height / 2], [r1.left - k.left + r1.width / 2, r1.top - k.top + r1.height / 2], { ms: 520, kavis: -90, boy1: r1.height / Math.max(1, r0.height) });
    }
    sh?.kapat();
    sh?.el.remove();
    if (this.sepetHayvan === sh) this.sepetHayvan = null;
    hv.el.classList.remove('pt-gizli');
    ses.pit();
    // el sallar: sevinç pozu, iki küçük zıplama, sesi
    hv.sesi(1);
    await hv.zipla(40, 360, 'sevinc');
    await hv.zipla(30, 320, 'sevinc');
  }

  // ---------------------------------------------------------------- canlılık ve dolaylı ipucu
  private etkilesim() {
    this.sonEtkilesim = performance.now();
    this.ipucu = 0;
    this.o.etkilesim?.();
  }
  private sonrakiCanli = performance.now() + 2500;
  /** Kimse dokunmasa da vitrin yaşar: bir yavru kendi hareketini yapar; uzun sessizlikte dolaylı ipucu */
  private canli() {
    if (this.kapandi || this.aliniyor || !this.el.isConnected || this.el.closest('[data-panel-gizli]')) return;
    const simdi = performance.now();
    const dolu = this.bolmeler.filter((b) => b.hayvan && !b.mesgul);
    if (!dolu.length) return;
    const sessiz = simdi - this.sonEtkilesim;
    if (sessiz > 20000 && this.ipucu === 0) {
      // 20 sn: bir yavru cama yaslanır (zıplayıp ezilir, kendi sesi)
      this.ipucu = 1;
      const b = dolu[Math.floor(Math.random() * dolu.length)];
      b.hayvan!.sesi(2);
      void b.hayvan!.zipla(50, 420, 'sevinc').then(() => b.hayvan?.ezil(2));
      return;
    }
    if (sessiz > 40000 && this.ipucu === 1) {
      // 40 sn: sepet bir kez kıpırdar
      this.ipucu = 2;
      ezil(this.sepet, 1.6, 420);
      ses.pit();
      return;
    }
    if (simdi < this.sonrakiCanli) return;
    this.sonrakiCanli = simdi + ras(2600, 5200);
    const b = dolu[Math.floor(Math.random() * dolu.length)];
    const hv = b.hayvan!;
    const z = Math.random();
    if (z < 0.35) void hv.zipla(36, 380);
    else if (z < 0.6) {
      hv.cevir();
      window.setTimeout(() => !this.kapandi && hv.cevir(), sure(ras(900, 1600)));
    } else if (z < 0.8) void hv.anlik(hv.tur === 'kopek' ? 'oyun' : 'goz', 700);
    else void hv.gerin();
  }

  kapat() {
    this.kapandi = true;
    for (const z of this.zamanlar) clearInterval(z);
    for (const f of this.birak) f();
    for (const b of this.bolmeler) b.hayvan?.kapat();
    this.sepetHayvan?.kapat();
    this.dekor.kapat();
  }
}
