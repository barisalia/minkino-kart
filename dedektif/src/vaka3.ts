/**
 * Vaka 3 "Kaybolan Yıldız Kurabiyeler": oyunun akışı (ekip/senaryo/dedektif-vaka3.md). Motor Vaka 1 ve 2'ninki: dünya
 * + kamera (dunya.ts), oyuncular (Mino, Kino), büyüteç, kart sorgusu (sorgu.ts), poz ekleri, çizgi roman (roman.ts).
 * Sahneler dunya3.ts, kart sahneleri sorgu3.ts, görseller resimler3.ts (tek harita: Gemini çizimi ya da yer tutucu).
 *
 * Giriş (otobüsün içi, tepside 2 kurabiye; Kino'nun burnunda kırıntı: "Bu benim ekmeğim!") → Halka 1 (un halkaları;
 * boş yerleri say; 2 / 4 / 6 kurabiye) → Halka 2 (pervazda kırıntı; kapı / pencere / baca) → Halka 3 (üç patika;
 * tohum / havuç / yıldız şeker; yıldız şeker izi ağaca) → Halka 4 (el izi + kızıl tüy; kuş / sincap / kirpi) →
 * Kovuklar (baykuş, yuva, sarkan kuyruk) → Fındık fırlar, yanakları şiş: "Mmf mmf!" → Halka 5 (kovuğun içi; aç /
 * kış kileri / parti) → Final (pof pof; dört kurabiyeyi say; "Bir tane alabilir miyim?"; iki kurabiyeyi Fındık'a
 * sürükle; palamut Kino'nun burnunda; pencerede yeni kurabiye) → Ödül: çizgi roman; "Vaka Dosyam"a üçüncü vaka.
 *
 * Hiçbir adım kilitlenmez (10 sn'de Kino koklar, 7 sn'de parmak, 2 yanlışta doğru parlar). Yalnız transform / opacity.
 * Test / gösterim: ?test=1&ekran=vaka3&adim=kim (giris, sayi, cikis, yol, kim, kovuk, neden, final, roman); kökte data-adim.
 */
import { efekt } from '../../src/audio/ses';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { Buyutec, type BuyutecHedef } from '../../src/ui/buyutec';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { konfetiPatlat } from '../../src/ui/konfeti';
import { sesDugmesi, yuvarlakDugme } from '../../src/ui/ortak';
import D from '../../content/dedektif.json';
import { DosyaSeridi } from './dosya';
import { AZ_HAREKET, Dunya, type KadrajKaynak, type Oda } from './dunya';
import { agacSahnesi, kilerSahnesi, otobusIc, otobusYani } from './dunya3';
import { Efekt, oynat, parmak, parmaklariDurdur, pop } from './efekt';
import { vakaCozuldu } from './kayit';
import { tekTekrar } from './konusma-sira';
import { Dosya, izNotasi, K, M, ODA_H, YARDIM, type IpucuTanim, type Kadraj } from './mantik';
import {
  ADIMLAR3,
  F3,
  FINDIK_BOY,
  FINDIK_YERI,
  halka3,
  HALKALAR3,
  K3,
  KADRAJ3,
  KARTLAR3,
  KOVUKLAR,
  KovukArama,
  M3,
  OTOBUS,
  ROMAN3,
  Sayma,
  SEKER_IZI,
  SekerIzi,
  V3,
  VERILECEK,
  type Adim3,
  type Halka3,
  type IpucuTanim3,
} from './mantik3';
import { Oyuncular } from './oyuncular';
import { pozlariYukle } from './poz';
import { resim } from './resimler';
import { hazirla3 } from './resimler3';
import { kareleriGetir, romanKur, sirayla } from './roman';
import { Fon, muzikCal, ses } from './sesler';
import { sorgu, type Oturma } from './sorgu';
import { demekGoster, type Ortak } from './sorgu2';
import { cikisDogru, cikisYanlis, kimDogru, kimYanlis3, nedenDogru, nedenYanlis, sayiDogru, sayiYanlis, tuyKabar, yolDogru, yolYanlis } from './sorgu3';

export interface Vaka3Param {
  adim?: Adim3;
}

function tohumlu(t: number): () => number {
  let s = t >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const px = (v: number) => `${v.toFixed(1)}px`;
const tutar = (a: Animation | null | undefined) => (a ? a.finished.then(() => undefined, () => undefined) : Promise.resolve());
const img = (ad: string, sinif = '') => h(`img${sinif ? '.' + sinif : ''}`, { src: resim(ad) ?? '', alt: '', draggable: 'false' });
const guvenle = (f: () => void) => {
  try {
    f();
  } catch {
    /* yok say */
  }
};

/** Kart sorusunun halkaya özel parçaları */
const OTURMA3: Record<string, Oturma> = {
  sayi: { x: 0.5, y: 0.5, w: 0.55, sade: false, don: -4 },
  cikis: { x: 0.62, y: 0.5, w: 0.5, sade: false, don: 6 },
  yol: { x: 0.5, y: 0.42, w: 0.42, sade: true, don: 0 },
  kim: { x: 0.36, y: 0.5, w: 0.5, sade: false, don: -6 },
  neden: { x: 0.36, y: 0.48, w: 0.48, sade: false, don: -5 },
};

class Vaka3 {
  readonly el: HTMLElement;
  private dunya: Dunya;
  private oy = new Oyuncular();
  private efekt: Efekt;
  private dosya: Dosya;
  private serit: DosyaSeridi | null = null;
  private seritYer: HTMLElement;
  private ara: HTMLElement;
  private buyutec!: Buyutec;
  private fon = new Fon();
  private ic!: Oda;
  private yani!: Oda;
  private agac!: Oda;
  private kiler!: Oda;
  private kapali = false;
  private zamanlar: number[] = [];
  private temizlik: (() => void)[] = [];
  private rnd: () => number;
  private bulusSayisi = 0;
  private ortak: Ortak;
  private boyutSonrasi: (() => void) | null = null;
  /** Fındık (dünyada, ağacın dibinde): kap ve resmi */
  private findik: HTMLElement | null = null;
  private findikResim: HTMLImageElement | null = null;
  /** Kino'nun burnundaki şey (kırıntı, palamut) */
  private burun: HTMLElement | null = null;

  constructor(
    private app: Uygulama,
    private baslangic: Adim3,
  ) {
    const q = new URLSearchParams(location.search);
    this.rnd = q.has('tohum') ? tohumlu(Number(q.get('tohum'))) : TEST_MODU ? tohumlu(7) : Math.random;
    if (TEST_MODU && Number(q.get('kokla')) > 0) YARDIM.koklaSn = Number(q.get('kokla')) / 1000;
    this.dosya = Dosya.adimdan(baslangic, ADIMLAR3, HALKALAR3);
    this.dunya = new Dunya((w, hh) => this.guvenli(w, hh));
    this.ara = h('div.dd-ara');
    this.seritYer = h('div.dd-dosya.dd-v3-dosya-yer', { 'data-goz': '5' });
    const geri = yuvarlakDugme(IKON.geri, 'Geri', () => this.app.git('acilis'), 'kucuk dd-geri');
    const tekrar = yuvarlakDugme(IKON.tekrar, 'Tekrar dinle', () => this.oy.tekrar(), 'kucuk dd-tekrar');
    const sesD = sesDugmesi();
    sesD.classList.add('kucuk');
    this.el = h('div.dd-vaka.dd-vaka3', { 'data-adim': 'yukleniyor', 'data-vaka': 'vaka3' }, this.dunya.el, this.oy.el, this.ara, h('div.dd-ust', {}, geri, this.seritYer, h('div.dd-ust-sag', {}, tekrar, sesD)));
    this.efekt = new Efekt(this.el);
    this.el.append(this.efekt.el, this.oy.balonKatman);
    this.ortak = { kok: this.el, efekt: this.efekt, oy: this.oy, rnd: this.rnd, kapandi: () => this.kapali, bekle: this.bekle, adim: (a) => this.adim(a) };
    this.el.classList.add('dd-yukleniyor');
    this.oy.mino.el.addEventListener('pointerdown', () => {
      this.oy.minoTepki('gidik');
      efekt.dokunma();
    });
    this.oy.kinoYer.addEventListener('pointerdown', () => {
      efekt.dokunma();
      this.oy.kinoOynat('sevin', 800);
      this.oy.kinoIfade('heyecan', 800);
    });
    void this.oy.mino.poz(null);
    pozlariYukle();
    void this.oy.mino.dedektif({ sapka: baslangic !== 'giris' });
    if (baslangic !== 'giris') this.oy.mino.el.classList.add('dd-sapkali');
    void this.kur();
  }

  /** Görseller hazırlanır (yer tutucular bir kez kurulur), sahneler ve dosya şeridi kurulur, akış başlar */
  private async kur() {
    await hazirla3();
    if (this.kapali) return;
    const serit = new DosyaSeridi(this.dosya);
    this.serit = serit;
    this.seritYer.replaceWith(serit.el);
    // girişteki kurabiye fotoğrafı Halka 3'ün gözünde durur
    if (ADIMLAR3.indexOf(this.baslangic) > ADIMLAR3.indexOf('giris') && ADIMLAR3.indexOf(this.baslangic) <= ADIMLAR3.indexOf('yol')) serit.ipucu('yol', resim('v3/foto-kurabiye') ?? '');
    // kart resimleri şimdiden yüklenir (kartlar açılınca boş beyaz kutu görünmesin)
    for (const k of Object.values(KARTLAR3)) new Image().src = resim(k.resim) ?? '';
    this.ic = otobusIc(halka3('sayi').ipuclari.concat(halka3('cikis').ipuclari));
    this.yani = otobusYani(halka3('yol').ipuclari);
    this.agac = agacSahnesi(halka3('kim').ipuclari);
    this.kiler = kilerSahnesi(halka3('neden').ipuclari as IpucuTanim3[]);
    const ilk = this.odaAdimi(this.baslangic);
    this.dunya.kur(ilk, 'genel');
    this.buyutec = new Buyutec({
      kap: this.ara,
      kaynak: () => this.dunya.oda!.el,
      resim: resim('buyutec'),
      yaricap: () => {
        const r = this.ara.getBoundingClientRect();
        return Math.max(48, Math.min(120, Math.min(r.width, r.height) * (r.width > r.height ? 0.2 : 0.15)));
      },
      yakinlik: (hd, oran) => this.yakinlik(hd, oran),
      gordu: (hd) => this.gordu(hd),
      dokundu: (hd) => void this.dokundu(hd),
    });
    this.buyutec.goster(false);
    this.dunya.kameraBitti = () => this.buyutec.yenile();
    const boyut = () => {
      this.dunya.yenile();
      this.buyutec.yenile();
      requestAnimationFrame(() => {
        if (this.kapali) return;
        this.boyutSonrasi?.();
        this.findikBoyla();
      });
    };
    window.addEventListener('resize', boyut);
    this.temizle(() => window.removeEventListener('resize', boyut));
    void this.akis(this.baslangic);
  }

  // ---------------------------------------------------------------- yaşam döngüsü
  kapat() {
    this.kapali = true;
    this.zamanlar.forEach(clearTimeout);
    this.zamanlar = [];
    const t = this.temizlik;
    this.temizlik = [];
    t.forEach(guvenle);
    // el ipuçları (aramanın, saymanın, şeker izinin, kurabiye vermenin, kuyruğun) hep birlikte durur
    this.parmakBirak();
    parmaklariDurdur(this.el);
    this.fon.durdur();
    this.buyutec?.kapat();
    this.oy.kapat();
  }
  /** Kapanınca yapılacak iş; ekran çoktan kapandıysa (geç kurulan iş) hemen yapılır */
  private temizle(f: () => void) {
    if (this.kapali) guvenle(f);
    else this.temizlik.push(f);
  }
  /**
   * Bekler. Ekran kapandıysa hiç dönmez: bekleyen akış (final, palamut, son) orada durur, sonraki ses / müzik çalmaz
   * (kapat() kurulmuş zamanlayıcıları da siler: onları bekleyenler de dönmez).
   */
  private bekle = (ms: number): Promise<void> =>
    new Promise((r) => {
      if (this.kapali) return;
      this.zamanlar.push(window.setTimeout(r, sure(ms)));
    });
  private sonra(ms: number, fn: () => void): number {
    if (this.kapali) return 0;
    const z = window.setTimeout(() => !this.kapali && fn(), sure(ms));
    this.zamanlar.push(z);
    return z;
  }
  /** setInterval: kapanınca durur. Geç kurulan da: ekran kapandıysa hiç kurulmaz, kurulduysa ilk tıkta kendini siler. */
  private aralik(fn: () => void, ms: number): () => void {
    if (this.kapali) return () => undefined;
    const z = window.setInterval(() => {
      if (this.kapali) return clearInterval(z);
      fn();
    }, ms);
    const dur = () => clearInterval(z);
    this.temizle(dur);
    return dur;
  }
  private adim(ad: string) {
    this.el.dataset.adim = ad;
  }
  private guvenli(w: number, hh: number): [number, number, number, number] {
    const ust = Math.min(86, hh * 0.14);
    if (w > hh * 1.15) return [w * 0.14, ust, w * 0.86, hh * 0.98];
    return [w * 0.04, ust, w * 0.96, hh * 0.76];
  }
  private dar() {
    const { w, h: hh } = this.dunya.boyut;
    return w < hh * 1.15;
  }
  /** Dar ekranda kamera oda oranındaki bir x'e ortalanır (dikey korunur); genişte kadraj aynen (dönünce yeniden kurulur) */
  private ortala(x: () => number, k: () => Kadraj, yari = 0.12): () => Kadraj {
    return () => {
      const kd = k();
      if (!this.dar()) return kd;
      const cx = x();
      return [cx - yari, kd[1], cx + yari, kd[3]];
    };
  }
  private orta = (kd: Kadraj) => (kd[0] + kd[2]) / 2;
  private kd = (kd: Kadraj, x = this.orta(kd), yari = 0.12) => this.ortala(() => x, () => kd, yari);
  private minoDunyaW() {
    return (this.oy.minoYer.getBoundingClientRect().width || 140) / Math.max(0.05, this.dunya.olcek);
  }
  private odaAdimi(a: Adim3): Oda {
    if (a === 'giris' || a === 'sayi' || a === 'cikis') return this.ic;
    if (a === 'yol') return this.yani;
    if (a === 'neden') return this.kiler;
    return this.agac;
  }
  private async odaya(oda: Oda, kd: KadrajKaynak, yon: 1 | -1 = 1) {
    if (this.dunya.oda === oda) return this.dunya.git(kd, 1000);
    ses.vuus();
    await this.dunya.gec(oda, kd, yon);
  }
  private get s(): DosyaSeridi {
    return this.serit!;
  }

  // ---------------------------------------------------------------- akış
  private async akis(bas: Adim3) {
    const sira = ADIMLAR3.slice(ADIMLAR3.indexOf(bas));
    const resimler = [this.ic, this.yani, this.agac, this.kiler].map((o) => o.el.querySelector<HTMLImageElement>('img.dd-zemin')!);
    await Promise.race([Promise.all(resimler.map((i) => i.decode().catch(() => undefined))), this.bekle(TEST_MODU ? 50 : 3500)]);
    this.el.classList.remove('dd-yukleniyor');
    if (this.kapali) return;
    this.fon.baslat();
    for (const a of sira) {
      if (this.kapali) return;
      if (a === 'giris') await this.giris();
      else if (a === 'sayi') await this.sayiHalkasi();
      else if (a === 'cikis') await this.cikisHalkasi();
      else if (a === 'yol') await this.yolHalkasi();
      else if (a === 'kim') await this.kimHalkasi(sira[0] === 'kim');
      else if (a === 'kovuk') await this.kovukArama(sira[0] === 'kovuk');
      else if (a === 'neden') await this.nedenHalkasi(sira[0] === 'neden');
      else if (a === 'final') await this.final(sira[0] === 'final');
      else if (a === 'roman') await this.roman();
    }
  }

  // ---------------------------------------------------------------- giriş
  private async giris() {
    const { oy, dunya } = this;
    this.adim('giris');
    dunya.kur(this.ic, this.kd(KADRAJ3.ic, 0.5, 0.14));
    const giris = -Math.min(460, window.innerWidth * 0.55);
    void oy.kaydir('mino', giris, 0, 0, 0);
    void oy.kaydir('kino', Math.min(520, window.innerWidth * 0.7), 0, 0, 0);
    await this.bekle(500);
    // Kino koşa koşa tepsinin önüne gelir; kamera tepsiye yaklaşır (yalnız tepsi)
    oy.kinoIfade('heyecan', 900);
    await oy.kaydir('kino', 0, 0, 900, 22);
    if (this.kapali) return;
    void dunya.git(this.kd(KADRAJ3.tepsi, undefined, 0.14), 1000);
    await this.bekle(500);
    // yakın plan: kurabiyenin üstünün fotoğrafı (flaş) dosyaya girer
    this.fotoCek();
    oy.kinoIfade('saskin', 2400);
    void oy.zipla('kino', 12, 420);
    const minoGel = oy.minoYuruyerekGel(giris, 1700);
    await oy.soyle(K3.alti, 'kino');
    await minoGel;
    if (this.kapali) return;
    // Mino döner: Kino'nun burnunda kırıntı
    this.burunaKoy('v3/ipucu-kirinti', 0.18);
    oy.mino.bak(0.7);
    oy.minoTepki('kararsiz', 1.4);
    await oy.soyle(M3.burun);
    if (this.kapali) return;
    // Kino kızarır, ekmeğini çıkarır
    oy.el.classList.add('dd-kino-kizardi');
    void oy.kinoPozu.goster('kino-utanc');
    const ekmek = img('v3/ekmek', 'dd-v3-ekmek');
    oy.kinoYer.querySelector('.dd-kino-kutu')?.append(ekmek);
    if (!AZ_HAREKET) void ekmek.animate([{ transform: 'translate(-50%, -50%) scale(0.2) rotate(-30deg)', opacity: 0 }, { transform: 'translate(-50%, -50%) scale(1.1) rotate(6deg)', opacity: 1, offset: 0.6 }, { transform: 'translate(-50%, -50%) scale(1) rotate(0)', opacity: 1 }], { duration: sure(520), easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'forwards' });
    else ekmek.style.cssText += ';transform:translate(-50%,-50%);opacity:1';
    ses.pop();
    await oy.soyle(K3.ekmek, 'kino');
    oy.minoTepki('gidik');
    await this.bekle(400);
    void oy.kinoPozu.birak();
    oy.el.classList.remove('dd-kino-kizardi');
    void tutar(ekmek.animate([{ opacity: 1 }, { opacity: 0 }], { duration: sure(300), fill: 'forwards' })).then(() => ekmek.remove());
    this.burunTemizle();
    if (this.kapali) return;
    // şapka Mino'nun başına düşer: "Bu bir vaka!"
    void dunya.git(this.kd(KADRAJ3.ic, 0.5, 0.14), 900);
    oy.minoTepki('sasir');
    await oy.mino.dedektif({ sapka: true });
    if (this.kapali) return;
    oy.mino.el.classList.add('dd-sapkali');
    oynat(oy.mino.el, 'dd-sapka-dus');
    ses.pop();
    this.sonra(220, () => {
      const [x, y] = this.efekt.merkez(oy.mino.el, 0.5, 0.12);
      this.efekt.parilti(x, y, 8, 0.8);
    });
    await this.bekle(420);
    await oy.mino.dedektif({ buyutec: true });
    if (this.kapali) return;
    ses.vaka();
    oy.minoTepki('zipla');
    oynat(this.el, 'dd-vaka-flas');
    oy.kinoIfade('heyecan', 1400);
    await oy.soyle(M.vaka);
    if (this.kapali) return;
    oy.kinoOynat('sevin', 800);
    await oy.soyle(M.buyutec);
    await oy.mino.dedektif({ buyutec: false });
  }

  /** Flaş: tepsideki kurabiyenin yakın planı dosyanın üçüncü gözüne uçar */
  private fotoCek() {
    const kk = this.el.getBoundingClientRect();
    const flas = h('div.dd-v3-flas');
    this.el.append(flas);
    this.sonra(500, () => flas.remove());
    ses.ting();
    const tp = this.ic.e.tepsi;
    if (!tp) return;
    const [x0, y0] = this.efekt.merkez(tp, 0.28, 0.42);
    const [x1, y1] = this.efekt.merkez(this.s.goz('yol'));
    const boy = Math.min(kk.width, kk.height) * 0.32;
    const foto = h('div.dd-uc-foto', { style: `width:${px(boy)};height:${px(boy)}` }, img('v3/foto-kurabiye'));
    void this.efekt.ucur(foto, [x0, y0], [x1, y1], { ms: 900, kavis: -60, boy0: 0.4, boy1: 0.2, don: -10, gecikme: 300 }).then(() => {
      if (this.kapali) return;
      ses.yapis();
      this.s.ipucu('yol', resim('v3/foto-kurabiye') ?? '');
    });
  }
  /** Kino'nun burnuna bir şey koyar (kutunun oranı) */
  private burunaKoy(ad: string, en: number) {
    this.burunTemizle();
    const kutu = this.oy.kinoYer.querySelector('.dd-kino-kutu');
    if (!kutu) return null;
    const b = img(ad, 'dd-v3-burun');
    b.style.width = `${(en * 100).toFixed(0)}%`;
    kutu.append(b);
    this.burun = b;
    void pop(b, 1.3);
    return b;
  }
  private burunTemizle() {
    this.burun?.remove();
    this.burun = null;
  }

  // ---------------------------------------------------------------- büyüteçle arama (Vaka 1 ve 2'nin kalıbı)
  private aramaBitti: (() => void) | null = null;
  private aramaTemizle: (() => void) | null = null;
  private aramaIpuclari: IpucuTanim[] = [];
  private aranan: Halka3 | null = null;
  private aramaOdasi: Oda | null = null;
  private buyutecGosterildi = false;
  private sonBulus = 0;
  private koklaniyor = false;
  private parmakDur: (() => void) | null = null;
  private dokunZaman = 0;
  private sonIsilti = 0;
  /** kovuk aramasında görülen / dokunulan hedefin kendi işi (kart halkalarında null) */
  private ozelGordu: ((id: string) => void) | null = null;
  private ozelDokundu: ((id: string) => void) | null = null;

  private parmakBirak() {
    this.parmakDur?.();
    this.parmakDur = null;
  }
  private ipucuEl(id: string): HTMLElement | null {
    return this.aramaOdasi?.e[`ipucu-${id}`] ?? null;
  }

  /** İpuçlarını büyüteçle bul (hepsi): kart halkaları; kovuk araması kendi hedefleriyle (ozelGordu / ozelDokundu) */
  private ara_(ipuclari: IpucuTanim[], hk: Halka3 | null, oda: Oda, ad: string): Promise<void> {
    const kalan = ipuclari.filter((t) => !hk || !this.dosya.goz(hk.id).ipuclari.includes(t.id));
    if (!kalan.length) return Promise.resolve();
    this.adim(`ara-${ad}`);
    this.aramaOdasi = oda;
    this.aramaIpuclari = kalan;
    return new Promise<void>((coz) => {
      this.aramaBitti = coz;
      this.aranan = hk;
      const hedefler: BuyutecHedef[] = kalan.map((t) => ({ id: t.id, yer: () => this.dunya.merkez(this.ipucuEl(t.id)!) }));
      this.buyutec.hedefleriKur(hedefler);
      for (const t of kalan) this.ipucuEl(t.id)?.classList.add('dd-aranan');
      this.buyutec.goster(true);
      this.buyutec.yenile();
      const r = this.ara.getBoundingClientRect();
      const g = this.guvenli(r.width, r.height);
      if (!this.buyutecGosterildi) {
        this.buyutecGosterildi = true;
        const [mx, my] = this.efekt.merkez(this.oy.mino.el, 0.36, 0.42);
        void this.buyutec.git(mx, my, 0).then(() => this.buyutec.git((g[0] + g[2]) / 2 - r.width * 0.12, (g[1] + g[3]) / 2 - r.height * 0.08, 700));
        this.sonra(900, () => {
          if (this.kapali || (hk && this.dosya.goz(hk.id).ipuclari.length)) return;
          const lens = this.buyutec.el;
          this.parmakDur = parmak(this.el, () => lens.getBoundingClientRect(), () => {
            const b = lens.getBoundingClientRect();
            return new DOMRect(b.left + b.width * 0.9, b.top + b.height * 0.1, b.width, b.height);
          });
          this.sonra(3600, () => this.parmakBirak());
        });
      } else {
        const gw = g[2] - g[0];
        const gh = g[3] - g[1];
        const adaylar: [number, number][] = [
          [g[0] + gw * 0.5, g[1] + gh * 0.4],
          [g[0] + gw * 0.22, g[1] + gh * 0.4],
          [g[0] + gw * 0.78, g[1] + gh * 0.4],
          [g[0] + gw * 0.5, g[1] + gh * 0.18],
        ];
        const uzaklik = ([x, y]: [number, number]) => Math.min(...hedefler.map((hd) => Math.hypot(hd.yer().x - x, hd.yer().y - y)));
        const [bx, by] = adaylar.reduce((a, b) => (uzaklik(b) > uzaklik(a) ? b : a));
        void this.buyutec.git(bx, by, 500);
      }
      this.sonBulus = performance.now();
      this.aramaTemizle = this.aralik(() => {
        if (this.koklaniyor) return;
        if (performance.now() - this.sonBulus > YARDIM.koklaSn * 1000) {
          const sec = this.ozelGordu ? kalan.filter((x) => x.id === 'kuyruk') : kalan;
          const t = sec.find((x) => !(hk && this.dosya.goz(hk.id).ipuclari.includes(x.id)) && !this.buyutec.gorulduMu(x.id));
          if (t) void this.kokla(t);
        }
      }, 1000);
    });
  }
  /**
   * Arama biter: koku yardımı, koklamaya giden Kino, el ipucu, "dokun!" zamanlayıcısı durur; aranan yerlerin işaretleri
   * (soluk gölge + göz kırpan yıldız: dd-aranan, nabız halkası: dd-goruldu) söner. Görülmemiş ipucu yine gizli kalır
   * (bt-gizli), görülmüş olan (ör. uyuyan baykuş) sahnenin parçası olarak sade durur.
   */
  private aramayiBitir() {
    this.aramaTemizle?.();
    this.aramaTemizle = null;
    this.koklaIptal();
    clearTimeout(this.dokunZaman);
    this.parmakBirak();
    for (const t of this.aramaIpuclari) {
      const el = this.ipucuEl(t.id);
      if (!el) continue;
      el.classList.remove('dd-aranan', 'dd-goruldu');
      el.style.removeProperty('--yakin');
    }
    this.buyutec.goster(false);
    const c = this.aramaBitti;
    this.aramaBitti = null;
    c?.();
  }

  private yakinlik(hd: BuyutecHedef, oran: number) {
    const el = this.ipucuEl(hd.id);
    el?.style.setProperty('--yakin', oran.toFixed(2));
    const simdi = performance.now();
    if (oran > 0.5 && simdi - this.sonIsilti > 260 - oran * 120) {
      this.sonIsilti = simdi;
      const { x, y, r } = hd.yer();
      const k = this.el.getBoundingClientRect();
      const a = this.ara.getBoundingClientRect();
      this.efekt.isilti(x + a.left - k.left, y + a.top - k.top, r * 1.2);
      ses.isilti(oran);
    }
  }

  private gordu(hd: BuyutecHedef) {
    const el = this.ipucuEl(hd.id);
    if (!el) return;
    el.classList.remove('bt-gizli');
    el.classList.add('dd-goruldu');
    this.buyutec.yenile();
    ses.ting();
    this.parmakBirak();
    const [x, y] = this.efekt.merkez(el);
    this.efekt.halka(x, y, Math.max(40, el.getBoundingClientRect().width * 0.7));
    this.sonBulus = performance.now();
    if (this.ozelGordu) {
      this.ozelGordu(hd.id);
      return;
    }
    const b = M.buldun;
    void this.oy.soyle(b[this.bulusSayisi++ % b.length]);
    this.oy.minoTepki('sevinc');
    this.oy.kinoIfade('heyecan', 900);
    clearTimeout(this.dokunZaman);
    this.dokunZaman = this.sonra(YARDIM.dokunSn * 1000, () => {
      if (!el.classList.contains('dd-goruldu')) return;
      this.parmakBirak();
      this.parmakDur = parmak(this.el, () => el.getBoundingClientRect());
      void this.oy.soyle(M.dokun);
    });
  }

  private async dokundu(hd: BuyutecHedef) {
    const el = this.ipucuEl(hd.id);
    if (!el || !el.classList.contains('dd-goruldu')) return;
    if (this.ozelDokundu) {
      this.ozelDokundu(hd.id);
      return;
    }
    const hk = this.aranan;
    const t = this.aramaIpuclari.find((x) => x.id === hd.id);
    if (!hk || !t) return;
    this.buyutec.bitir(hd.id);
    clearTimeout(this.dokunZaman);
    this.parmakBirak();
    el.classList.remove('dd-goruldu');
    el.classList.add('dd-alindi');
    this.sonBulus = performance.now();
    this.dosya.ipucuEkle(hk.id, t.id);
    ses.buldun();
    efekt.dogru();
    const [x0, y0] = this.efekt.merkez(el);
    this.efekt.halka(x0, y0, 70);
    const foto = resim(t.foto ?? t.resim) ?? '';
    const goz = this.s.goz(hk.id);
    const [x1, y1] = this.efekt.merkez(goz);
    const kart = h('div.dd-uc-foto', {}, h('img', { src: foto, alt: '', draggable: 'false' }));
    const kk = this.el.getBoundingClientRect();
    const boy = Math.min(kk.width, kk.height) * 0.36;
    kart.style.width = `${boy}px`;
    kart.style.height = `${boy}px`;
    await this.efekt.ucur(kart, [x0, y0], [kk.width / 2, kk.height * 0.45], { ms: 420, kavis: -30, boy0: 0.35, boy1: 1, don: 4 });
    if (this.kapali) return;
    await this.efekt.ucur(kart, [kk.width / 2, kk.height * 0.45], [x1, y1], { ms: 560, kavis: -60, boy0: 1, boy1: 0.2, don: -12, gecikme: 260 });
    if (this.kapali) return;
    ses.yapis();
    this.s.ipucu(hk.id, foto);
    if (this.dosya.ipuclariTamam(hk.id)) this.aramayiBitir();
    else await this.oy.soyle(M.bir_daha);
  }

  /** Koklamaya giden Kino'yu geri çağırır (arama bitince: kart sorusu açılırken Kino önde kalmasın) */
  private koklaIptal() {
    this.koklaNesil++;
    if (!this.koklaniyor) return;
    this.koklaniyor = false;
    this.koku?.remove();
    this.koku = null;
    this.oy.el.classList.remove('dd-onde');
    if (this.el.dataset.adim?.startsWith('kokla-')) this.adim(this.koklaOnceki);
    if (!this.kapali) void this.oy.don('kino', 500);
  }
  private koklaNesil = 0;
  private koklaOnceki = '';
  private koku: HTMLElement | null = null;

  private async kokla(t: IpucuTanim) {
    const el = this.ipucuEl(t.id);
    if (!el) return;
    this.koklaniyor = true;
    const nesil = ++this.koklaNesil;
    const bitti = () => this.kapali || nesil !== this.koklaNesil;
    const { oy } = this;
    const m = this.dunya.merkez(el);
    const a = this.ara.getBoundingClientRect();
    const k = this.el.getBoundingClientRect();
    const tx = m.x + a.left - k.left;
    const ty = m.y + a.top - k.top;
    const kinoH = oy.kinoYer.getBoundingClientRect().height;
    const sag = tx < k.width / 2;
    const fx = tx + (sag ? 1 : -1) * Math.max(70, kinoH * 0.42);
    const fy = Math.min(k.height - 6, ty + kinoH * 0.38);
    const onceki = this.el.dataset.adim ?? '';
    this.koklaOnceki = onceki;
    this.adim(`kokla-${t.id}`);
    oy.el.classList.add('dd-onde');
    await oy.git('kino', fx, fy, 900, 50);
    if (bitti()) return;
    oy.kinoOynat('kokla', 1800);
    ses.kokla();
    const koku = h('i.dd-koku', { style: `left:${tx}px;top:${ty}px` });
    this.koku = koku;
    this.efekt.el.append(koku);
    this.sonra(3200, () => koku.remove());
    await oy.soyle(K.kokla, 'kino');
    if (bitti()) return;
    await this.bekle(700);
    if (bitti()) return;
    await oy.don('kino', 800);
    if (bitti()) return;
    oy.el.classList.remove('dd-onde');
    this.koku = null;
    this.sonBulus = performance.now();
    this.koklaniyor = false;
    if (this.el.dataset.adim === `kokla-${t.id}`) this.adim(onceki);
  }

  // ---------------------------------------------------------------- kart halkası (ortak)
  private async kartSorusu(hk: Halka3, yanlisAni: Parameters<typeof sorgu>[0]['yanlisAni'], dogruAni?: () => Promise<void>, parlaAni?: () => void) {
    if (this.kapali) return;
    this.adim(`soru-${hk.id}`);
    const t0 = hk.ipuclari[0];
    const ilkSoru = hk.id === 'sayi';
    const foto = resim(hk.foto ?? t0.foto ?? t0.resim) ?? '';
    const ek = hk.ekFoto ? resim(hk.ekFoto) : null;
    // Halka 3: soru girişteki fotoğrafa bakarak sorulur; fotoğraf bir kez parlar
    if (hk.id === 'yol') this.sonra(700, () => oynat(this.el.querySelector('.dd-sorgu .dd-delil'), 'dd-isil'));
    await sorgu({
      kok: this.el,
      efekt: this.efekt,
      oy: this.oy,
      halka: hk,
      kartlar: KARTLAR3,
      foto,
      ekFoto: ek,
      oturma: OTURMA3[hk.id],
      yanlisAni,
      dogruAni,
      parlaAni,
      goz: () => this.s.goz(hk.id),
      ilk: ilkSoru,
      rnd: this.rnd,
      kapandi: () => this.kapali,
      bekle: this.bekle,
      adim: (a) => this.adim(a),
    });
    if (this.kapali) return;
    this.dosya.demekEkle(hk.id);
    this.s.demek(hk.id);
    ses.muhur();
    this.adim(`demek-${hk.id}`);
  }

  // ---------------------------------------------------------------- Halka 1: kaç kurabiye kayıp?
  private async sayiHalkasi() {
    const { oy } = this;
    const hk = halka3('sayi');
    this.s.aktif('sayi');
    oy.yerlesim('iki');
    await this.odaya(this.ic, this.kd(hk.kadraj, undefined, 0.13));
    if (this.kapali) return;
    oy.yerlesim('iki', 'kenar');
    await this.ara_(hk.ipuclari, hk, this.ic, 'sayi');
    if (this.kapali) return;
    // boş yerleri say: her dokunuşta halkanın içinde rakam ve bir nota
    await this.say(this.ic.e.sayac, M3.say, 'say');
    // rakamlar soru açılırken söner (kartların arkasında kalmasın)
    this.ic.e.sayac.classList.add('dd-v3-rakam-gizli');
    oy.yerlesim('iki');
    if (this.kapali) return;
    await this.kartSorusu(hk, sayiYanlis(this.ortak), () => sayiDogru(this.ortak));
    this.ic.e.sayac.classList.remove('acik', 'dd-v3-sayildi');
  }

  /** Dokunarak sayma (Halka 1 ve final): düğmelere sırayla dokunulur, rakam belirir; 7 sn'de parmak */
  private say(kap: HTMLElement, soz: string, ad: string): Promise<void> {
    const dugmeler = [...kap.querySelectorAll<HTMLElement>(':scope > button')];
    const sayma = new Sayma(dugmeler.length);
    kap.classList.add('acik');
    this.el.classList.add('dd-sahne-is');
    this.adim(ad);
    void this.oy.soyle(soz);
    return new Promise<void>((coz) => {
      let son = performance.now();
      let dur: (() => void) | null = null;
      const tik = (i: number) => {
        const n = sayma.dokun(i);
        if (n === null) return;
        dur?.();
        dur = null;
        son = performance.now();
        const d = dugmeler[i];
        d.classList.add('sayildi');
        d.querySelector('b')!.textContent = String(n);
        ses.iz(izNotasi(n * 2));
        void pop(d, 1.25);
        const [x, y] = this.efekt.merkez(d);
        this.efekt.parilti(x, y, 5, 0.45);
        this.oy.minoTepki(n % 2 ? 'evet' : 'sevinc');
        if (sayma.bitti) {
          yardimDur();
          this.el.classList.remove('dd-sahne-is');
          kap.classList.add('dd-v3-sayildi');
          this.sonra(600, coz);
        }
      };
      dugmeler.forEach((d, i) => d.addEventListener('click', () => tik(i)));
      const yardimDur = this.aralik(() => {
        if (dur) return;
        if (performance.now() - son > YARDIM.surukleSn * 1000) {
          const i = sayma.siradaki;
          if (i === null) return;
          dur = parmak(this.el, () => dugmeler[i].getBoundingClientRect());
        }
      }, 500);
    });
  }

  // ---------------------------------------------------------------- Halka 2: nereden çıktı?
  private async cikisHalkasi() {
    const { oy } = this;
    const hk = halka3('cikis');
    this.s.aktif('cikis');
    oy.yerlesim('iki');
    await this.odaya(this.ic, this.kd(hk.kadraj, 0.55, 0.14));
    if (this.kapali) return;
    oy.yerlesim('iki', 'kenar');
    await this.ara_(hk.ipuclari, hk, this.ic, 'cikis');
    oy.yerlesim('iki');
    if (this.kapali) return;
    await this.kartSorusu(hk, cikisYanlis(this.ortak), () => cikisDogru(this.ortak));
    if (this.kapali) return;
    await this.kinoPencere();
  }

  /** Kino rahatlar: kafasını pencerenin aralığına sokmaya çalışır, kulağı takılır, güler */
  private async kinoPencere() {
    const { oy, dunya } = this;
    this.adim('kino-pencere');
    const p = OTOBUS.pencere;
    await dunya.git(this.kd(KADRAJ3.pencere, 0.5, 0.14), 800);
    if (this.kapali) return;
    const [wx, wy] = dunya.ekranda((p.x0 + p.x1) / 2, p.y1 + 0.04);
    const kinoH = oy.kinoYer.getBoundingClientRect().height;
    const k = this.el.getBoundingClientRect();
    oy.el.classList.add('dd-onde');
    await oy.git('kino', Math.min(k.width - kinoH * 0.3, wx + kinoH * 0.2), Math.min(k.height - 6, wy + kinoH * 0.55), 900, 30);
    if (this.kapali) return;
    const kutu = oy.kinoYer.querySelector<HTMLElement>('.dd-kino-kutu');
    // kafa aralığa: sıkışır (çizim en çok %8 esner)
    if (kutu && !AZ_HAREKET) void kutu.animate([{ transform: 'scale(1, 1)' }, { transform: 'translateY(-6%) scale(0.93, 1.06)', offset: 0.4 }, { transform: 'translateY(-6%) scale(0.92, 1.07)', offset: 0.7 }, { transform: 'scale(1, 1)' }], { duration: sure(1500), easing: 'ease-in-out' });
    const t0 = performance.now();
    oy.kinoEkHareket((po, t) => {
      const g = Math.max(0, 1 - (performance.now() - t0) / sure(2200));
      po.kulakSol += (-34 + Math.sin(t * 18) * 8) * g;
      po.kafa += Math.sin(t * 7) * 4 * g;
    });
    oy.kinoIfade('saskin', 1200);
    ses.sek();
    await oy.soyle(K3.kocaman, 'kino');
    oy.kinoEkHareket(null);
    oy.kinoIfade('heyecan', 1200);
    oy.kinoOynat('sevin', 900);
    oy.minoTepki('gidik');
    await this.bekle(600);
    await oy.don('kino', 800);
    oy.el.classList.remove('dd-onde');
  }

  // ---------------------------------------------------------------- Halka 3: hangi yol?
  private async yolHalkasi() {
    const { oy, dunya } = this;
    const hk = halka3('yol');
    this.s.aktif('yol');
    oy.yerlesim('iki');
    await this.odaya(this.yani, this.kd(hk.kadraj, undefined, 0.13), 1);
    if (this.kapali) return;
    oy.yerlesim('iki', 'kenar');
    await this.ara_(hk.ipuclari, hk, this.yani, 'yol');
    oy.yerlesim('iki');
    if (this.kapali) return;
    await this.kartSorusu(hk, yolYanlis(this.ortak), () => yolDogru(this.ortak));
    if (this.kapali) return;
    // iz sürme: yıldız şekerler ağaca kadar
    await this.sekerIzi();
    if (this.kapali) return;
    ses.vuus();
    await dunya.gec(this.agac, this.kd(KADRAJ3.agac, 0.5, 0.16), 1);
    if (this.kapali) return;
    await demekGoster(this.ortak, hk.demekResim, hk.demekKi, this.s.goz('yol'));
    if (this.kapali) return;
    this.dosya.demekEkle('yol');
    this.s.demek('yol');
    this.adim('demek-yol');
  }

  /** Yıldız şeker izi: sırayla dokun ya da parmağı üstünden kaydır; her şekerde yükselen nota; kamera ağaca ilerler */
  private sekerIzi(): Promise<void> {
    const { oy, dunya } = this;
    const iz = new SekerIzi();
    const sekerler = [...this.yani.e.iz.querySelectorAll<HTMLElement>('.dd-v3-seker')];
    const kadraj = (): Kadraj => {
      const i = iz.siradaki ?? SEKER_IZI.length - 1;
      const x = SEKER_IZI[Math.min(SEKER_IZI.length - 1, i + 1)].x;
      return this.dar() ? [x - 0.13, 0.55, x + 0.11, 1] : [Math.max(0, Math.min(0.5, x - 0.42)), 0.5, Math.min(1, Math.max(x + 0.12, 0.5)), 1];
    };
    this.boyutSonrasi = () => void dunya.git(kadraj, 0);
    this.yani.e.iz.classList.add('acik');
    oy.yerlesim('iki', 'kenar');
    this.adim('seker-izi');
    this.el.classList.add('dd-sahne-is');
    void dunya.git(kadraj, 800);
    void oy.soyle(M.izleri_takip);
    return new Promise<void>((coz) => {
      let son = performance.now();
      let dur: (() => void) | null = null;
      const al = (i: number) => {
        const r = iz.dokun(i);
        if (!r.alindi) {
          if (i > iz.alinan) oynat(sekerler[iz.alinan], 'dd-titre');
          return;
        }
        dur?.();
        dur = null;
        son = performance.now();
        const el = sekerler[i];
        el.classList.add('dd-yandi');
        ses.iz(izNotasi(r.sira + 2));
        void pop(el.querySelector('img'), 1.4);
        const [x, y] = this.efekt.merkez(el);
        this.efekt.parilti(x, y, 5, 0.5);
        if (r.bitti) {
          bitir();
          return;
        }
        // kamera sıradaki şekere ilerler
        const sr = sekerler[iz.siradaki!].getBoundingClientRect();
        const k = this.el.getBoundingClientRect();
        if (sr.right > k.right - k.width * 0.12 || sr.left < k.left + k.width * 0.05) void dunya.git(kadraj, 700);
      };
      sekerler.forEach((s, i) => s.addEventListener('click', () => al(i)));
      // parmak üstünden kayınca da alınır
      let basili = false;
      const bas = () => (basili = true);
      const kalk = () => (basili = false);
      const kay = (e: PointerEvent) => {
        if (!basili) return;
        const i = iz.siradaki;
        if (i === null) return;
        const r = sekerler[i].getBoundingClientRect();
        const p = Math.max(24, r.width);
        if (Math.abs(e.clientX - (r.left + r.width / 2)) < p && Math.abs(e.clientY - (r.top + r.height / 2)) < p) al(i);
      };
      this.el.addEventListener('pointerdown', bas);
      window.addEventListener('pointerup', kalk);
      window.addEventListener('pointermove', kay);
      const yardimDur = this.aralik(() => {
        if (dur) return;
        if (performance.now() - son > YARDIM.izSn * 1000) {
          const i = iz.siradaki;
          if (i === null) return;
          void dunya.git(kadraj, 600);
          dur = parmak(this.el, () => sekerler[i].getBoundingClientRect());
        }
      }, 500);
      const sok = () => {
        yardimDur();
        this.el.removeEventListener('pointerdown', bas);
        window.removeEventListener('pointerup', kalk);
        window.removeEventListener('pointermove', kay);
      };
      this.temizle(sok);
      const bitir = () => {
        sok();
        dur?.();
        dur = null;
        this.boyutSonrasi = null;
        this.el.classList.remove('dd-sahne-is');
        oy.yerlesim('iki');
        sekerler.forEach((s, i) => this.sonra(i * 70, () => oynat(s, 'dd-sec')));
        void dunya.git([0.62, 0.45, 1, 1], 900);
        this.sonra(900, coz);
      };
    });
  }

  // ---------------------------------------------------------------- Halka 4: ağaçta kim yaşıyor?
  private async kimHalkasi(dogrudan: boolean) {
    const { oy, dunya } = this;
    const hk = halka3('kim');
    this.s.aktif('kim');
    oy.yerlesim('iki');
    if (dogrudan) dunya.kur(this.agac, this.kd(hk.kadraj, 0.47, 0.13));
    else await this.odaya(this.agac, this.kd(hk.kadraj, 0.47, 0.13));
    if (this.kapali) return;
    oy.yerlesim('iki', 'kenar');
    await this.ara_(hk.ipuclari, hk, this.agac, 'kim');
    oy.yerlesim('iki');
    if (this.kapali) return;
    await this.kartSorusu(hk, kimYanlis3(this.ortak), () => kimDogru(this.ortak), () => tuyKabar(this.ortak));
  }

  // ---------------------------------------------------------------- kovuklar: hangisinde?
  private async kovukArama(dogrudan: boolean) {
    const { oy, dunya } = this;
    this.s.aktif(null);
    oy.yerlesim('iki', 'kenar');
    if (dogrudan) dunya.kur(this.agac, this.kd(KADRAJ3.kovuklar, 0.5, 0.14));
    else await dunya.git(this.kd(KADRAJ3.kovuklar, 0.5, 0.14), 900);
    if (this.kapali) return;
    const arama = new KovukArama();
    const e = this.agac.e;
    // kovuktan yıldız kırıntılar düşer (ara ara)
    const dusDur = this.aralik(() => !arama.bitti && this.kirintiDusur(), sure(1400));
    const hedefler: IpucuTanim[] = (['baykus', 'yuva', 'kuyruk'] as const).map((id) => ({ id, oda: 'agac', resim: '', x: 0, y: 0, h: 0, gizli: true }));
    let kuyrukBekliyor = false;
    this.ozelGordu = (id) => {
      arama.gor(id as 'baykus' | 'yuva' | 'kuyruk');
      if (id === 'kuyruk') {
        oy.minoTepki('sasir');
        void oy.soyle(M3.kuyruga);
        this.parmakDur = parmak(this.el, () => e['ipucu-kuyruk'].getBoundingClientRect());
      } else oy.minoTepki('sevinc');
    };
    this.ozelDokundu = (id) => {
      this.parmakBirak();
      // baykuş tepki verirken (sallanıp "Şşş" derken) yeni dokunuş yok sayılır: sözü sıraya birikip akışı geciktirmez
      if (id === 'baykus') this.baykusTek(() => this.baykusUyan());
      else if (id === 'yuva') this.yuvaSalla();
      else if (id === 'kuyruk' && !kuyrukBekliyor) {
        kuyrukBekliyor = true;
        // ilk dokunuş: kuyruk "fırr" diye kaçar; arama biter, kuyruk yeniden sarkınca ikinci dokunuş Fındık'ı çıkarır
        void this.kuyrukKac().then(() => {
          arama.kuyruk();
          this.aramayiBitir();
        });
      }
    };
    await this.ara_(hedefler, null, this.agac, 'kovuk');
    // ikinci dokunuş: kuyruk yeniden sarkar, çocuk ona dokununca Fındık fırlar
    this.ozelGordu = null;
    this.ozelDokundu = null;
    if (this.kapali) return;
    await this.kuyrukIkinci(arama);
    dusDur();
    if (this.kapali) return;
    await this.findikFirlar();
    if (this.kapali) return;
    await this.komikAn();
  }

  private kirintiDusur() {
    const kap = this.agac.e.kirintilar;
    if (!kap || AZ_HAREKET || TEST_MODU) return;
    const k = img('v3/kirinti-tek', 'dd-v3-kirinti');
    k.style.left = `${(-30 + Math.random() * 60).toFixed(0)}px`;
    kap.append(k);
    void tutar(k.animate([{ transform: 'translate(-50%, 0) rotate(0)', opacity: 0 }, { transform: 'translate(-50%, 20px) rotate(90deg)', opacity: 1, offset: 0.2 }, { transform: `translate(-50%, ${ODA_H * 0.13}px) rotate(400deg)`, opacity: 0 }], { duration: 1600, easing: 'ease-in' })).then(() => k.remove());
  }
  /** Baykuş tepkisi tek seferde bir tane (sırada ya da sürerken yeni dokunuş yok sayılır) */
  private baykusTek = tekTekrar();
  /** Baykuş bir an uyanır: "Şşş, uyuyorum!" (balonda), sonra yine uyur. Döner: sallanma ve söz bitince. */
  private baykusUyan(): Promise<void> {
    const el = this.agac.e['ipucu-baykus'];
    const b = el.querySelector<HTMLElement>('.dd-v3-baykus');
    ses.hu();
    const an = b && !AZ_HAREKET ? b.animate([{ transform: 'translate(-50%, 0) rotate(0)' }, { transform: 'translate(-50%, -8%) rotate(-6deg)', offset: 0.3 }, { transform: 'translate(-50%, -8%) rotate(5deg)', offset: 0.6 }, { transform: 'translate(-50%, 0) rotate(0)' }], { duration: sure(1200), easing: 'ease-in-out' }) : null;
    this.oy.konukBagla(null, el, -0.1);
    return Promise.all([tutar(an), this.oy.soyle(V3.balon.baykus, 'balon')]).then(() => undefined);
  }
  private yuvaSalla() {
    const y = this.agac.e.yuva;
    ses.hisirti();
    if (y && !AZ_HAREKET) void y.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(3deg)' }, { transform: 'rotate(-1deg)' }, { transform: 'rotate(0)' }], { duration: sure(800), easing: 'ease-in-out' });
  }
  /** Kuyruk "fırr" diye içeri kaçar (dudağın arkasına) */
  private async kuyrukKac() {
    const el = this.agac.e['ipucu-kuyruk'];
    ses.firr();
    el.classList.add('dd-v3-kacti');
    this.oy.kinoIfade('saskin', 1200);
    await this.bekle(700);
  }
  /** Kuyruk yeniden sarkar; dokununca Fındık çıkar (dokunuş: kuyruğun kendisi; 5 sn'de parmak) */
  private kuyrukIkinci(arama: KovukArama): Promise<void> {
    const el = this.agac.e['ipucu-kuyruk'];
    if (arama.bitti) return Promise.resolve();
    this.adim('kuyruk');
    this.el.classList.add('dd-sahne-is');
    el.classList.remove('dd-v3-kacti');
    el.classList.add('dd-v3-dokunulur');
    ses.firr();
    return new Promise<void>((coz) => {
      const z = this.sonra(5000, () => {
        this.parmakBirak();
        this.parmakDur = parmak(this.el, () => el.getBoundingClientRect());
      });
      const tik = () => {
        clearTimeout(z);
        this.parmakBirak();
        el.removeEventListener('click', tik);
        arama.kuyruk();
        this.el.classList.remove('dd-sahne-is');
        el.classList.remove('dd-v3-dokunulur');
        coz();
      };
      el.addEventListener('click', tik);
    });
  }

  /** Fındık kovuktan fırlar: ağzın içinde yükselir, kavisle ağacın dibine iner (yanakları şiş) */
  private async findikFirlar() {
    const { oy, dunya } = this;
    this.adim('findik');
    const e = this.agac.e;
    e['ipucu-kuyruk'].classList.add('dd-gizli');
    const a = KOVUKLAR.alt;
    void dunya.git(this.kd(KADRAJ3.findik, FINDIK_YERI.x - 0.04, 0.13), 700);
    this.findik = h('div.dd-v3-findik', {}, h('div.dd-v3-findik-ic2', {}, (this.findikResim = img('v3/findik-yanak', 'dd-v3-findik-resim') as HTMLImageElement)));
    e.findikDis.append(this.findik);
    e.findikDis.style.left = px(FINDIK_YERI.x * this.agac.W);
    e.findikDis.style.top = px(FINDIK_YERI.y * ODA_H);
    this.findikBoyla();
    await this.bekle(300);
    if (this.kapali) return;
    const dx = (a.x - FINDIK_YERI.x) * this.agac.W;
    const dy = (a.y + a.ry * 0.4 - FINDIK_YERI.y) * ODA_H;
    ses.firr();
    this.temizle(muzikCal('film-surpriz', 0.45));
    if (!AZ_HAREKET)
      await tutar(
        this.findik.animate(
          [
            { transform: `translate(${dx}px, ${dy}px) scale(0.3)`, opacity: 0 },
            { transform: `translate(${dx}px, ${dy - 40}px) scale(0.7)`, opacity: 1, offset: 0.25 },
            { transform: `translate(${dx * 0.5}px, ${dy - 160}px) scale(1) rotate(-12deg)`, opacity: 1, offset: 0.6 },
            { transform: 'translate(0, 0) scale(1.06, 0.94)', opacity: 1, offset: 0.88 },
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
          ],
          { duration: sure(1000), easing: 'cubic-bezier(.3,.7,.4,1)', fill: 'forwards' },
        ),
      );
    if (this.kapali) return;
    this.findik.style.opacity = '1';
    ses.pop();
    const [x, y] = this.efekt.merkez(this.findik, 0.5, 0.4);
    this.efekt.parilti(x, y, 10, 0.8);
    oy.kinoIfade('saskin', 1600);
    oy.minoTepki('sasir');
    await this.bekle(400);
  }
  /** Fındık'ın boyu: Mino'nun bu çekimdeki boyunun 0.6'sı */
  private findikBoyla() {
    if (!this.findik) return;
    const minoH = this.minoDunyaW() * (1790 / 1360);
    const b = minoH * FINDIK_BOY * 1.05;
    this.findik.style.width = px(b);
    this.findik.style.height = px(b);
  }
  private findikPoz(ad: 'findik' | 'findik-yanak' | 'findik-utangac' | 'findik-sarilma') {
    if (!this.findikResim) return;
    const r = this.findikResim;
    const ic = r.parentElement;
    if (ic && !AZ_HAREKET) void ic.animate([{ transform: 'scale(1.07, 0.93)' }, { transform: 'scale(0.96, 1.05)', offset: 0.55 }, { transform: 'scale(1)' }], { duration: sure(380), easing: 'cubic-bezier(.3,.7,.4,1)' });
    r.src = resim(`v3/${ad}`) ?? r.src;
  }
  private findikKonus(soz: string) {
    if (this.findik) this.oy.konukBagla(null, this.findik, 0.04);
    const ic = this.findik?.querySelector<HTMLElement>('.dd-v3-findik-ic2');
    const an = ic && !AZ_HAREKET ? ic.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-3%) scale(1.02, 0.98)' }, { transform: 'translateY(0)' }], { duration: sure(300), iterations: 6 }) : null;
    return this.oy.soyle(soz, 'findik').finally(() => an?.cancel());
  }

  /** Komik an: "Kurabiyelerimiz nerede?" → "Mmf! Mmf mmf!" (her mmf'te bir kırıntı Kino'nun burnuna) */
  private async komikAn() {
    const { oy } = this;
    this.adim('mmf');
    oy.kinoPoz('isaret');
    oy.kinoIfade('saskin', 1400);
    await oy.soyle(K3.nerede, 'kino');
    oy.kinoPoz(null);
    if (this.kapali || !this.findik) return;
    const soz = this.findikKonus(F3.mmf);
    for (let i = 0; i < 3; i++) {
      this.sonra(250 + i * 520, () => void this.kirintiPuskur(i === 2));
    }
    await soz;
    if (this.kapali) return;
    await this.bekle(400);
    oy.kinoIfade('saskin', 2000);
    oy.minoTepki('gidik');
    await oy.soyle(M3.yut);
    if (this.kapali) return;
    // iki kez çiğner, yanaklar biraz iner ama hâlâ şiş; kafasını sallar
    const ic = this.findik.querySelector<HTMLElement>('.dd-v3-findik-ic2');
    for (let i = 0; i < 2; i++) {
      ses.hapHap();
      if (ic && !AZ_HAREKET) await tutar(ic.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06, 0.95)' }, { transform: 'scale(0.97, 1.03)' }, { transform: 'scale(1)' }], { duration: sure(500) }));
      else await this.bekle(500);
      if (this.kapali) return;
    }
    if (ic && !AZ_HAREKET) await tutar(ic.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-8deg)' }, { transform: 'rotate(8deg)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(0)' }], { duration: sure(800) }));
    if (this.kapali) return;
    this.oy.konukBagla(null, this.findik);
  }
  /** Fındık'ın ağzından kırıntı fışkırır, Kino'nun burnuna konar */
  private async kirintiPuskur(son: boolean) {
    if (!this.findik) return;
    const [x0, y0] = this.efekt.merkez(this.findik, 0.36, 0.52);
    const kutu = this.oy.kinoYer.querySelector<HTMLElement>('.dd-kino-kutu');
    if (!kutu) return;
    const [x1, y1] = this.efekt.merkez(kutu, 0.52, 0.45);
    ses.pit();
    await this.efekt.ucur(img('v3/ipucu-kirinti', 'dd-v3-ucan-kirinti'), [x0, y0], [x1, y1], { ms: 420, kavis: -50, boy0: 0.6, boy1: 1, don: 200 });
    if (this.kapali) return;
    if (son) this.burunaKoy('v3/ipucu-kirinti', 0.18);
    void this.oy.zipla('kino', 6, 300);
  }

  // ---------------------------------------------------------------- Halka 5: neden aldı?
  private async nedenHalkasi(dogrudan: boolean) {
    const { oy, dunya } = this;
    const hk = halka3('neden');
    this.s.aktif('neden');
    if (!dogrudan) {
      oy.minoTepki('kararsiz', 1.2);
      await oy.soyle(M3.kovuga);
      if (this.kapali) return;
    }
    // kamera kovuğun içine girer (yakın plan; ağız çerçeve gibi önde)
    oy.yerlesim('iki');
    if (dogrudan) dunya.kur(this.kiler, this.kd(hk.kadraj, undefined, 0.14));
    else await this.odaya(this.kiler, this.kd(hk.kadraj, undefined, 0.14), 1);
    if (this.kapali) return;
    oy.yerlesim('iki', 'kenar');
    await this.ara_(hk.ipuclari, hk, this.kiler, 'neden');
    oy.yerlesim('iki');
    if (this.kapali) return;
    await this.kartSorusu(hk, nedenYanlis(this.ortak), () => nedenDogru(this.ortak));
  }

  // ---------------------------------------------------------------- final: sormak
  private async final(dogrudan: boolean) {
    const { oy, dunya } = this;
    this.s.aktif(null);
    this.adim('final');
    const e = this.agac.e;
    if (dunya.oda !== this.agac) {
      if (dogrudan) dunya.kur(this.agac, this.kd(KADRAJ3.final, 0.5, 0.15));
      else await this.odaya(this.agac, this.kd(KADRAJ3.final, 0.5, 0.15), -1);
    } else await dunya.git(this.kd(KADRAJ3.final, 0.5, 0.15), 800);
    if (this.kapali) return;
    oy.yerlesim('iki', 'kenar');
    e['ipucu-kuyruk'].classList.add('dd-gizli');
    if (!this.findik) {
      this.findik = h('div.dd-v3-findik', { style: 'opacity:1' }, h('div.dd-v3-findik-ic2', {}, (this.findikResim = img('v3/findik-yanak', 'dd-v3-findik-resim') as HTMLImageElement)));
      e.findikDis.append(this.findik);
      e.findikDis.style.left = px(FINDIK_YERI.x * this.agac.W);
      e.findikDis.style.top = px(FINDIK_YERI.y * ODA_H);
    }
    this.findikBoyla();
    await this.bekle(400);
    // 1) "pof, pof!": iki kurabiye ağzından düşer; ikisi kovuktan gelir; yan yana dizilir
    const kurabiyeler = [...e.kurabiyeler.querySelectorAll<HTMLElement>('.dd-v3-final-kurabiye')];
    for (let i = 0; i < 2; i++) {
      if (this.kapali) return;
      ses.pof();
      if (i === 1) this.findikPoz('findik');
      await this.kurabiyeGetir(kurabiyeler[i], this.findik, 0.36, 0.5);
      if (this.kapali) return;
      await this.bekle(250);
    }
    const alt = KOVUKLAR.alt;
    for (let i = 2; i < 4; i++) {
      if (this.kapali) return;
      const [hx, hy] = dunya.ekranda(alt.x, alt.y);
      await this.kurabiyeGetir(kurabiyeler[i], null, hx, hy);
    }
    // kurabiyeler uçarken çıkıldıysa sayma (yardım zamanlayıcısı, söz) hiç başlamaz
    if (this.kapali) return;
    oy.kinoIfade('heyecan', 1400);
    // 2) "Hadi sayalım!": dört kurabiyeye dokun
    await this.say(e.kurabiyeler, M3.sayalim, 'final-say');
    if (this.kapali) return;
    oy.minoTepki('sevinc');
    await oy.soyle(M3.bir_dort);
    e.kurabiyeler.classList.remove('acik');
    e.kurabiyeler.classList.add('dd-v3-rakam-gizli');
    if (this.kapali) return;
    // 3) Fındık utangaç: "Herkesin sandım."
    this.adim('sormak');
    this.findikPoz('findik-utangac');
    await this.findikKonus(F3.sandim);
    if (this.kapali) return;
    oy.kinoIfade('mutlu', 1600);
    await oy.soyle(K3.sorsaydin, 'kino');
    if (this.kapali) return;
    // 4) bir adım öne çıkar, patilerini birleştirir: "Bir tane alabilir miyim?"
    this.findikPoz('findik');
    if (!AZ_HAREKET && this.findik) await tutar(this.findik.animate([{ transform: 'translate(0, 0)' }, { transform: `translate(${-this.findik.offsetWidth * 0.12}px, -14px)`, offset: 0.5 }, { transform: `translate(${-this.findik.offsetWidth * 0.18}px, 0)` }], { duration: sure(600), easing: 'ease-in-out', fill: 'forwards' }));
    if (this.kapali) return;
    await this.bekle(300);
    await this.findikKonus(F3.alabilir);
    if (this.kapali) return;
    oy.kinoOynat('sevin', 900);
    oy.kinoIfade('heyecan', 1400);
    await oy.soyle(K3.tabii, 'kino');
    if (this.kapali) return;
    // 5) iki kurabiyeyi Fındık'ın patisine sürükle
    await this.kurabiyeVer(kurabiyeler.slice(0, VERILECEK));
    if (this.kapali) return;
    // 6) sarılır, kuyruğu kalp yapar (kalpler)
    this.adim('saril');
    this.findikPoz('findik-sarilma');
    ses.sicak();
    this.kalpler();
    oy.minoTepki('saril');
    await this.bekle(1400);
    if (this.kapali) return;
    // 7) kovuğa koşar, parlak bir palamut getirir; Kino burnunda dengeler, düşürür; herkes güler
    await this.palamutHediye();
    if (this.kapali) return;
    // 8) son: otobüste yeni kurabiye, pencerede Fındık'ın tabelası
    await this.son();
  }

  /** Kurabiye bir yerden (Fındık'ın ağzı ya da kovuk) yerdeki yerine uçar (düğme görünür) */
  private async kurabiyeGetir(dugme: HTMLElement, kaynak: HTMLElement | null, ox: number, oy_: number) {
    const [x0, y0] = kaynak ? this.efekt.merkez(kaynak, ox, oy_) : [ox, oy_];
    const [x1, y1] = this.efekt.merkez(dugme);
    const w = dugme.getBoundingClientRect().width || 60;
    await this.efekt.ucur(img('v3/kurabiye', 'dd-v3-ucan-kurabiye2'), [x0, y0], [x1, y1], { ms: 520, kavis: -80, boy0: 0.5, boy1: 1, don: 200 });
    if (this.kapali) return;
    dugme.style.width = '';
    dugme.classList.add('gorunur');
    void w;
    ses.tik();
  }

  /** İki kurabiyeyi Fındık'ın patisine sürükle (dokunmak da olur): kurabiye patiye uçar, kaybolur */
  private kurabiyeVer(kurabiyeler: HTMLElement[]): Promise<void> {
    this.adim('ver');
    this.el.classList.add('dd-sahne-is');
    const hedef = () => this.findik!.getBoundingClientRect();
    let kalan = kurabiyeler.length;
    return new Promise<void>((coz) => {
      let dur: (() => void) | null = null;
      let z = 0;
      const ipucu = () => {
        clearTimeout(z);
        z = this.sonra(4000, () => {
          const k = kurabiyeler.find((x) => !x.classList.contains('verildi'));
          dur?.();
          if (k) dur = parmak(this.el, () => k.getBoundingClientRect(), hedef);
        });
      };
      ipucu();
      const yakin = (x: number, y: number) => {
        const b = hedef();
        return Math.hypot(x - (b.left + b.width / 2), y - (b.top + b.height * 0.6)) < b.width * 0.75 + 30;
      };
      for (const k of kurabiyeler) {
        k.classList.add('dd-v3-tasinir');
        let s: { id: number; x0: number; y0: number; tasindi: boolean } | null = null;
        const ver = async () => {
          k.classList.add('verildi');
          const a = k.getBoundingClientRect();
          const kk = this.el.getBoundingClientRect();
          const [hx, hy] = this.efekt.merkez(this.findik!, 0.42, 0.62);
          k.style.visibility = 'hidden';
          await this.efekt.ucur(img('v3/kurabiye', 'dd-v3-ucan-kurabiye2'), [a.left - kk.left + a.width / 2, a.top - kk.top + a.height / 2], [hx, hy], { ms: 420, kavis: -40, boy1: 0.8 });
          if (this.kapali) return;
          ses.tik();
          efekt.dogru();
          this.efekt.parilti(hx, hy, 6, 0.5);
          this.oy.kinoIfade('heyecan', 900);
          if (--kalan <= 0) {
            clearTimeout(z);
            this.el.classList.remove('dd-sahne-is');
            coz();
          } else ipucu();
        };
        k.addEventListener('pointerdown', (e) => {
          if (k.classList.contains('verildi')) return;
          clearTimeout(z);
          dur?.();
          dur = null;
          s = { id: e.pointerId, x0: e.clientX, y0: e.clientY, tasindi: false };
          k.setPointerCapture?.(e.pointerId);
          k.classList.add('dd-tutuldu');
          ses.kart();
        });
        k.addEventListener('pointermove', (e) => {
          if (!s || e.pointerId !== s.id) return;
          if (Math.hypot(e.clientX - s.x0, e.clientY - s.y0) > 8) s.tasindi = true;
          k.style.translate = `${((e.clientX - s.x0) / Math.max(0.05, this.dunya.olcek)).toFixed(0)}px ${((e.clientY - s.y0) / Math.max(0.05, this.dunya.olcek)).toFixed(0)}px`;
        });
        const birak = async (e: PointerEvent) => {
          if (!s || e.pointerId !== s.id) return;
          const { tasindi } = s;
          s = null;
          k.classList.remove('dd-tutuldu');
          if (!tasindi || yakin(e.clientX, e.clientY)) {
            k.style.translate = '';
            await ver();
            return;
          }
          const t = k.style.translate || '0px 0px';
          await tutar(k.animate([{ translate: t }, { translate: '0px 0px' }], { duration: sure(380), easing: 'cubic-bezier(.3,1.2,.5,1)' }));
          k.style.translate = '';
          if (!this.kapali) ipucu();
        };
        k.addEventListener('pointerup', (e) => void birak(e));
        k.addEventListener('pointercancel', (e) => void birak(e));
      }
    });
  }

  /** Kalpler (kuyruk kalp şekli yapar: bir an) */
  private kalpler() {
    if (!this.findik) return;
    const [x, y] = this.efekt.merkez(this.findik, 0.62, 0.3);
    for (let i = 0; i < 5; i++) {
      const k = img('v3/kalp', 'dd-v3-kalp');
      k.style.cssText = `left:${x}px;top:${y}px;width:${26 + i * 4}px`;
      this.efekt.el.append(k);
      void tutar(AZ_HAREKET ? null : k.animate([{ transform: 'translate(-50%, -50%) scale(0.2)', opacity: 0 }, { transform: `translate(-50%, -50%) translate(${(i - 2) * 26}px, ${-40 - i * 12}px) scale(1)`, opacity: 1, offset: 0.4 }, { transform: `translate(-50%, -50%) translate(${(i - 2) * 40}px, ${-110 - i * 14}px) scale(0.8)`, opacity: 0 }], { duration: sure(1500), delay: sure(i * 120), easing: 'ease-out', fill: 'both' })).then(() => k.remove());
    }
  }

  /** Fındık kovuğa koşar, palamut getirir; palamut Kino'nun burnunda sallanır, düşer; herkes güler */
  private async palamutHediye() {
    const { oy, dunya } = this;
    if (!this.findik) return;
    this.adim('palamut');
    const f = this.findik;
    const a = KOVUKLAR.alt;
    const dx = (a.x - FINDIK_YERI.x) * this.agac.W;
    const dy = (a.y + a.ry * 0.3 - FINDIK_YERI.y) * ODA_H;
    this.findikPoz('findik');
    if (!AZ_HAREKET) await tutar(f.animate([{ transform: getComputedStyle(f).transform === 'none' ? 'translate(0,0)' : getComputedStyle(f).transform, opacity: 1 }, { transform: `translate(${dx * 0.5}px, ${dy - 80}px)`, opacity: 1, offset: 0.5 }, { transform: `translate(${dx}px, ${dy}px) scale(0.5)`, opacity: 0 }], { duration: sure(700), easing: 'ease-in', fill: 'forwards' }));
    if (this.kapali) return;
    ses.hisirti();
    await this.bekle(600);
    if (!AZ_HAREKET) await tutar(f.animate([{ transform: `translate(${dx}px, ${dy}px) scale(0.5)`, opacity: 0 }, { transform: `translate(${dx * 0.5}px, ${dy - 80}px)`, opacity: 1, offset: 0.5 }, { transform: 'translate(0, 0)', opacity: 1 }], { duration: sure(700), easing: 'ease-out', fill: 'forwards' }));
    if (this.kapali) return;
    // palamut Fındık'ın patisinden Kino'nun burnuna
    const kutu = oy.kinoYer.querySelector<HTMLElement>('.dd-kino-kutu');
    if (!kutu) return;
    const [x0, y0] = this.efekt.merkez(f, 0.45, 0.55);
    const [x1, y1] = this.efekt.merkez(kutu, 0.52, 0.36);
    ses.kart();
    await this.efekt.ucur(img('v3/palamut', 'dd-v3-ucan-palamut'), [x0, y0], [x1, y1], { ms: 620, kavis: -90, boy0: 0.6, boy1: 1, don: 360 });
    if (this.kapali) return;
    const p = this.burunaKoy('v3/palamut', 0.2);
    if (p) p.classList.add('dd-v3-palamut-burun');
    oy.kinoIfade('saskin', 2600);
    oy.kinoEkHareket((po, t) => {
      po.kafa += Math.sin(t * 6) * 6;
    });
    if (p && !AZ_HAREKET) await tutar(p.animate([{ rotate: '0deg' }, { rotate: '-18deg' }, { rotate: '14deg' }, { rotate: '-22deg' }, { rotate: '10deg' }], { duration: sure(1600), easing: 'ease-in-out' }));
    else await this.bekle(1600);
    oy.kinoEkHareket(null);
    if (this.kapali) return;
    // düşer
    if (p && !AZ_HAREKET) await tutar(p.animate([{ transform: 'translate(-50%, -50%)', opacity: 1 }, { transform: 'translate(-50%, 300%) rotate(220deg)', opacity: 1, offset: 0.7 }, { transform: 'translate(-50%, 260%) rotate(260deg)', opacity: 0 }], { duration: sure(800), easing: 'ease-in', fill: 'forwards' }));
    if (this.kapali) return;
    ses.tok();
    this.burunTemizle();
    oy.kinoOynat('sevin', 1200);
    oy.kinoIfade('heyecan', 1800);
    oy.minoTepki('gidik');
    void dunya;
    const ic = f.querySelector<HTMLElement>('.dd-v3-findik-ic2');
    if (ic && !AZ_HAREKET) void ic.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-10%)' }, { transform: 'translateY(0)' }], { duration: sure(380), iterations: 3 });
    await this.bekle(1300);
  }

  /** Son: otobüste yeni kurabiye (palamut kurabiyesi); pencerede Fındık'ın soru balonlu tabelası; Fındık pencereye gelir */
  private async son() {
    const { oy, dunya } = this;
    this.adim('son');
    const e = this.ic.e;
    oy.yerlesim('iki');
    await this.odaya(this.ic, this.kd(KADRAJ3.son, 0.5, 0.15), -1);
    if (this.kapali) return;
    e.yeni.classList.add('acik');
    e.tabela.classList.add('acik');
    ses.pop();
    await this.bekle(500);
    // Fındık pencerede belirir (pervazın arkasında), balonu gösterir
    e.pervaz.classList.add('acik');
    e.findik.classList.add('acik');
    ses.firr();
    await this.bekle(600);
    oynat(e.tabela, 'dd-v3-goster');
    const [tx, ty] = this.efekt.merkez(e.tabela, 0.75, 0.3);
    this.efekt.parilti(tx, ty, 6, 0.5);
    await this.bekle(700);
    if (this.kapali) return;
    // Kino palamut kurabiyesini uzatır
    oy.kinoOynat('sevin', 900);
    const [kx, ky] = this.efekt.merkez(e.yeni);
    const [fx, fy] = this.efekt.merkez(e.findik, 0.45, 0.6);
    e.yeni.classList.remove('acik');
    await this.efekt.ucur(img('v3/palamut-kurabiye', 'dd-v3-ucan-palamut'), [kx, ky], [fx, fy], { ms: 600, kavis: -60, boy0: 1, boy1: 0.9 });
    // uçuş sürerken çıkıldıysa kutlama müziği menüde çalmasın
    if (this.kapali) return;
    e.findik.querySelector('img')!.src = resim('v3/findik-sarilma') ?? '';
    ses.sicak();
    this.efekt.parilti(fx, fy, 10, 0.8);
    this.temizle(muzikCal('film-kutlama', 0.5));
    const r = this.el.getBoundingClientRect();
    if (!AZ_HAREKET) konfetiPatlat(this.el, r.width / 2, r.height * 0.3, 80);
    oy.minoTepki('dans');
    oy.kinoOynat('sevin', 1200);
    oy.kinoIfade('heyecan', 2000);
    await this.bekle(1800);
    void dunya;
  }

  // ---------------------------------------------------------------- ödül: çizgi roman
  private async roman() {
    if (this.kapali) return;
    this.adim('roman');
    this.fon.durdur();
    for (const hk of HALKALAR3)
      if (!this.dosya.goz(hk.id).demek) {
        this.dosya.demekEkle(hk.id);
        this.s.demek(hk.id);
      }
    const r = romanKur(ROMAN3, V3.vaka, 'vaka3');
    this.el.append(r.el);
    const gozler = ['sayi', 'cikis', 'yol', 'neden'].map((id) => this.s.goz(id));
    efekt.ucus();
    await kareleriGetir(r, gozler, (i) => ses.kare(i));
    if (this.kapali) return;
    const durdur = sirayla(r, 4400);
    await this.oy.soyle(M3.hikaye);
    durdur();
    if (this.kapali) return;
    r.kareler.forEach((k) => k.classList.remove('okunuyor'));
    r.muhur.classList.add('bas');
    ses.muhur();
    vakaCozuldu('vaka3');
    const kr = this.el.getBoundingClientRect();
    if (!AZ_HAREKET) konfetiPatlat(this.el, kr.width / 2, kr.height * 0.25, 110);
    await this.bekle(500);
    const dugme = (etiket: string, ikon: string, sinif: string, fn: () => void) => {
      const b = h(`button.dd-roman-dugme.${sinif}`, { type: 'button' }, h('span.dd-rd-ikon', { html: ikon }), h('span', {}, etiket));
      b.addEventListener('click', () => {
        efekt.dokunma();
        fn();
      });
      return b;
    };
    r.alt.append(
      dugme(D.yazi.dosya, IKON.album, 'dd-rd-dosya', () => this.app.git('dosya')),
      dugme(D.yazi.tekrar, IKON.tekrar, 'dd-rd-tekrar', () => this.app.git('vaka3', { adim: 'giris' })),
    );
    r.alt.classList.add('acik');
    this.adim('bitti');
  }
}

export function vaka3Ekrani(app: Uygulama, p?: Vaka3Param): Ekran {
  const v = new Vaka3(app, p?.adim ?? 'giris');
  return { el: v.el, kapat: () => v.kapat() };
}
