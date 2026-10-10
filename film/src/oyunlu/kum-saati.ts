/**
 * OYUN 1 · Kum Saati (oyunlu-bolum-01.md): kamera aynanın içindedir; Kino'nun "Iii" dişlerinin üstünde yavaşça
 * gezinen bir köpük topu vardır. Çocuk parmağıyla (fırçayla) onun peşinden gider. Fırça köpüğün üstündeyken köpük
 * kayar, geçtiği dişler parlar, kum saatinden kum akar. Parmak köpükten ayrılırsa köpük ve kum durur, köpük parlayıp
 * bekler (ceza yok). Kum bitince Kino gargara yapar, tükürür, "Iii".
 *
 * Bu oyun hangi oyunumuza benziyor, farkı ne? Mino Banyo / Kino'nun Otobüsü'ndeki ovalamaya (parmakla sürtmek)
 * benziyor. Fark: orada DURAN bir leke silinene kadar ovulur; burada HAREKET EDEN bir hedefin peşinden gidilir ve
 * amaç SÜRE'dir (kum bitene kadar her yeri gezmek). Oyunlarımızda iz sürme ve süre fikri yok.
 *
 * Yaş: 3-4 köpük düz çizgide yavaş gider (üst sıra sağdan sola ~8 sn, alt sıra soldan sağa ~8 sn), dokunma alanı
 * 120 px. 5-6 köpük yukarı-aşağı küçük zikzaklarla dört bölgeyi gezer (üst sağ, üst sol, alt sol, alt sağ; ~6'şar sn),
 * her bölge bitince Kino sayar; dokunma alanı 90 px.
 *
 * Sahne "ayna uzayında" (F) çizilir: oyunun son kadrajının css pikselleri. Köprüde (kamera aynaya süzülürken) aynı
 * çizim aynanın camına kırpılıp küçültülerek basılır; oyun kadrajına varınca F = ekran. Yani kesme yok.
 */
import { carp, type Matris } from '../kukla';
import { Aktor, eliGotur, heceAgzi, kirp, kolCoz, kuyrukSalla, nefes, yeniDurus, type Durus } from './aktor';
import { kucagaOtur, kucakCiz, kucakDurusu, lokumKucakta } from './kucak';
import { DIS, disAgzi, disNoktasi, firca, gulusEgrisi, hayaletEl, KONTUR, kopukTopu, kumSaati, parilti } from './cizim';
import { YardimMerdiveni, type Basamak } from './yardim';

export interface SahneSes {
  soyle(id: string): number;
  aktif(kim: string): { metin: string; x: number } | null;
  efekt(ad: string, n?: number): void;
}
/** dokunuş (F pikseli) */
export interface Parmak {
  bas: boolean;
  x: number;
  y: number;
}
interface Parcacik {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  omur: number;
  yas: number;
  tur: 'parilti' | 'kopuk';
}
export type Evre = 'once' | 'oyun' | 'bitis' | 'sonra';

const ters = (m: Matris): Matris => {
  const d = m[0] * m[3] - m[1] * m[2];
  return [m[3] / d, -m[1] / d, -m[2] / d, m[0] / d, (m[2] * m[5] - m[3] * m[4]) / d, (m[1] * m[4] - m[0] * m[5]) / d];
};
const uyg = (m: Matris, p: [number, number]): [number, number] => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
const sinirla = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const yumusak = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));

/** köpüğün yolu (kafa kit karesinde), u 0..1 (zamanla düzgün ilerler) */
export function kopukYolu(u: number, buyuk: boolean): { p: [number, number]; sira: 'ust' | 'alt'; bolge: number } {
  const [mx, my] = DIS.merkez;
  const xR = mx + DIS.yariGen * 0.8, xL = mx - DIS.yariGen * 0.8;
  const ustY = (x: number) => my - 58 + gulusEgrisi(x - mx);
  const altY = (x: number) => my + 58 + gulusEgrisi(x - mx) * 0.6;
  const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
  u = sinirla(u, 0, 1);
  if (!buyuk) {
    if (u < 0.47) {
      const x = lerp(xR, xL, u / 0.47);
      return { p: [x, ustY(x)], sira: 'ust', bolge: 0 };
    }
    if (u < 0.53) {
      const k = yumusak((u - 0.47) / 0.06);
      return { p: [xL - Math.sin(Math.PI * k) * 22, lerp(ustY(xL), altY(xL), k)], sira: k < 0.5 ? 'ust' : 'alt', bolge: 0 };
    }
    const x = lerp(xL, xR, (u - 0.53) / 0.47);
    return { p: [x, altY(x)], sira: 'alt', bolge: 1 };
  }
  // 5-6: dört bölge, yukarı-aşağı zikzak (doğru fırçalama hareketi)
  const b = Math.min(3, Math.floor(u * 4));
  const k = u * 4 - b;
  const A = 30, DONGU = 4.5;
  const zik = Math.sin(2 * Math.PI * DONGU * k) * A * Math.min(1, k * 8, (1 - k) * 8);
  if (b === 0) {
    const x = lerp(xR, mx, k);
    return { p: [x, ustY(x) + zik], sira: 'ust', bolge: 0 };
  }
  if (b === 1) {
    const x = lerp(mx, xL, k);
    return { p: [x, ustY(x) + zik], sira: 'ust', bolge: 1 };
  }
  if (b === 2) {
    const x = lerp(xL, mx, k);
    const gec = yumusak(k / 0.14);
    return { p: [x, lerp(ustY(x), altY(x), gec) + zik * gec], sira: gec < 0.5 ? 'ust' : 'alt', bolge: 2 };
  }
  const x = lerp(mx, xR, k);
  return { p: [x, altY(x) + zik], sira: 'alt', bolge: 3 };
}

export class AynaSahnesi {
  evre: Evre = 'once';
  /** oyun içi süre, bitiş süresi */
  ot = 0;
  bt = 0;
  /** köpüğün yol oranı (0..1) */
  u = 0;
  /** dişlerin parlaklığı (12) */
  dis = new Array(12).fill(0);
  private disHedef = new Array(12).fill(0);
  private disSayisi = 0;
  parmak: Parmak = { bas: false, x: 0, y: 0 };
  /** fırçanın başı (F) */
  private fb: [number, number] = [0, 0];
  private fbHazir = false;
  yardim: YardimMerdiveni;
  /** Kino kendisi fırçalıyor (yardım): kalan sn (Infinity: bitirene kadar), hız çarpanı */
  private oto: { kalan: number; hiz: number } | null = null;
  private hapsu = -10;
  private elGoster = -10;
  private parcaciklar: Parcacik[] = [];
  private sayilan = 0;
  private sonFircaSesi = 0;
  private sonKumSesi = 0;
  private sonKikir = 0;
  private sirit = 0;
  /** bu karede çocuk fırçalıyor mu */
  fircaliyor = false;
  bitti = false;
  /** sonuç: kaç kaçırma, kim bitirdi (kayıt / kalıcı iz) */
  sonuc: { cocuk: boolean; sure: number } | null = null;

  // yerleşim (F pikseli)
  W = 844;
  H = 390;
  dikey = false;
  private kapsa = { x: -200, y: -800, w: 1240, h: 1600 };
  r = 40;
  /** köprüde yansımaların aynaya girişi 0..1 (Kino sağdan, Anne ile Lokum soldan kayar) */
  giris = 1;
  /** kum saatinin yansıması (Anne lavaboya koyunca görünür) */
  kumGorunur = true;
  private taban = { kx: 0, ax: 0 };

  constructor(
    readonly kino: Aktor,
    readonly anne: Aktor,
    readonly lokum: Aktor,
    readonly yasBuyuk: boolean,
    izle: boolean,
    readonly ses: SahneSes,
    /** banyonun önceden yumuşatılmış küçük hâli (aynadaki uzak arka plan) */
    public yansima: HTMLImageElement | null = null,
  ) {
    this.yardim = new YardimMerdiveni(izle);
    kino.k.sinirla = false;
    anne.k.sinirla = false;
    lokum.k.sinirla = false;
  }

  /** F uzayını ekrana göre kurar; kapsa: köprüde camın F'deki karşılığı (arka plan onu örtmeli) */
  yerlestir(W: number, H: number, kapsa: { x: number; y: number; w: number; h: number }) {
    this.W = W;
    this.H = H;
    this.dikey = H > W;
    this.kapsa = kapsa;
    const kisa = Math.min(W, H);
    this.r = sinirla(40 * (kisa / 390), 36, 64);
    const k = this.kino, a = this.anne;
    k.nokta = [790, 700];
    a.nokta = [1000, 600];
    if (!this.dikey) {
      k.o = (0.9 * H) / 912;
      k.x = W * 0.6;
      k.y = H * 0.43;
      a.o = k.o * 0.52;
      a.x = W * 0.13;
      a.y = H * 0.27;
    } else {
      k.o = (0.98 * W) / 900;
      k.x = W * 0.52;
      k.y = H * 0.3;
      a.o = k.o * 0.5;
      a.x = W * 0.16;
      a.y = H * 0.62;
    }
    this.lokum.o = a.o;
    this.lokum.nokta = [650, 1320];
    this.taban = { kx: k.x, ax: a.x };
    this.kaydir();
  }
  /** köprüde yansımalar aynaya kayarak girer (Kino sağdan, Anne ile Lokum soldan) */
  private kaydir() {
    const gr = yumusak(this.giris);
    this.kino.x = this.taban.kx + (1 - gr) * this.W * 1.4;
    this.anne.x = this.taban.ax - (1 - gr) * this.W * 1.0;
    kucagaOtur(this.anne, this.lokum);
  }

  /** kum saati (F): alt orta noktası ve boyu */
  private get kumYeri() {
    const { W, H } = this;
    return this.dikey ? { x: W * 0.5, y: H * 0.985, w: W * 0.25, h: W * 0.33 } : { x: W * 0.255, y: H * 0.985, w: H * 0.24, h: H * 0.32 };
  }
  get kum() {
    return this.evre === 'sonra' || this.evre === 'bitis' ? 1 : this.u;
  }

  /** köpüğün F konumu */
  kopukF(): [number, number] {
    const kafa = carp(this.kino.dunya(), this.kino.k.matris('kafa'));
    return uyg(kafa, kopukYolu(this.u, this.yasBuyuk).p);
  }
  private burunF(): [number, number] {
    const kafa = carp(this.kino.dunya(), this.kino.k.matris('kafa'));
    return uyg(kafa, [723, 800]);
  }

  /** oyunu başlatır: köpük belirir, anlatıcı çağırır */
  basla() {
    this.evre = 'oyun';
    this.ot = 0;
    this.ses.efekt('kopuk');
    const s = this.ses.soyle('o1-cagri');
    if (this.yasBuyuk) this.sonraSoyle.push({ t: s + 0.3, id: 'o1-yukari' });
  }
  private sonraSoyle: { t: number; id: string }[] = [];

  dokun(tur: 'bas' | 'kay' | 'kalk', x: number, y: number) {
    this.parmak = { bas: tur !== 'kalk', x, y };
    if (tur === 'bas' && this.evre === 'oyun') this.ilkDokunus(x, y);
  }

  private ilkDokunus(x: number, y: number) {
    const [fx, fy] = this.kopukF();
    const R = this.alan();
    if (Math.hypot(x - fx, y - fy) <= R) return;
    const [nx, ny] = this.burunF();
    if (Math.hypot(x - nx, y - ny) < this.kino.o * 120) return; // burun: hapşırık adim()'da
    if (this.yardim.kacir() === 'el-tut') this.otoBaslat(3, 1, 'o1-bak');
  }
  private alan() {
    return (this.yasBuyuk ? 45 : 60) * (Math.min(this.W, this.H) / 390) * this.yardim.miknatis;
  }
  private otoBaslat(kalan: number, hiz: number, soz?: string) {
    this.oto = { kalan, hiz };
    if (soz) this.ses.soyle(soz);
  }

  /** dt ilerlet; tS: sahnenin saati (canlılık) */
  adim(dt: number, tS: number) {
    // ---- oyun mantığı
    this.fircaliyor = false;
    if (this.evre === 'oyun') {
      this.ot += dt;
      for (const s of [...this.sonraSoyle]) if (this.ot >= s.t) {
        this.ses.soyle(s.id);
        this.sonraSoyle.splice(this.sonraSoyle.indexOf(s), 1);
      }
      const [fx, fy] = this.kopukF();
      const p = this.parmak;
      const hapsuyor = tS - this.hapsu < 1.4;
      if (p.bas && !hapsuyor) {
        if (Math.hypot(p.x - fx, p.y - fy) <= this.alan()) this.fircaliyor = true;
        else {
          const [nx, ny] = this.burunF();
          if (Math.hypot(p.x - nx, p.y - ny) < this.kino.o * 120 && tS - this.hapsu > 4) this.hapsuBaslat(tS);
        }
      }
      const basamak = this.yardim.adim(dt, this.fircaliyor);
      if (basamak) this.basamak(basamak, tS);
      let hiz = 0;
      if (this.fircaliyor) hiz = 1;
      else if (this.oto) {
        hiz = this.oto.hiz;
        this.oto.kalan -= dt;
        if (this.oto.kalan <= 0) this.oto = null;
      }
      if (hiz > 0 && !hapsuyor) this.ilerle(dt * hiz, tS);
      if (this.u >= 1) this.bitisBaslat();
    } else if (this.evre === 'bitis') {
      const once = this.bt;
      this.bt += dt;
      const gec = (t: number) => once < t && this.bt >= t;
      if (gec(0.55)) this.ses.efekt('gulu');
      if (gec(1.95)) this.ses.efekt('pft');
      if (gec(2.25)) this.ses.soyle('o1-pft');
      if (gec(2.8)) {
        this.ses.efekt('parilti');
        this.ses.soyle('o1-bitti');
        for (let i = 0; i < 3; i++) this.parcacikAt('parilti', ...this.agizF([712 + (i - 1) * 200, 900 - (i === 1 ? 140 : 40)]), 1.2);
      }
      if (this.bt > 4.9) this.bitti = true;
    }
    // dişlerin parlaması yumuşak
    for (let i = 0; i < 12; i++) this.dis[i] += (this.disHedef[i] - this.dis[i]) * Math.min(1, dt * 6);
    // parçacıklar
    for (const q of this.parcaciklar) {
      q.yas += dt;
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      q.vy += (q.tur === 'kopuk' ? 900 : 60) * dt;
    }
    this.parcaciklar = this.parcaciklar.filter((q) => q.yas < q.omur);
    this.pozlar(dt, tS);
  }

  private agizF(p: [number, number]): [number, number] {
    return uyg(carp(this.kino.dunya(), this.kino.k.matris('kafa')), p);
  }

  private ilerle(du_sn: number, tS: number) {
    const sure = this.yasBuyuk ? 24 : 16;
    const once = kopukYolu(this.u, this.yasBuyuk);
    this.u = Math.min(1, this.u + du_sn / sure);
    const simdi = kopukYolu(this.u, this.yasBuyuk);
    // geçilen diş
    const w = (DIS.yariGen * 1.76) / 6;
    const x0 = DIS.merkez[0] - DIS.yariGen * 0.88;
    const i = Math.max(0, Math.min(5, Math.floor((simdi.p[0] - x0) / w)));
    const j = (simdi.sira === 'ust' ? 0 : 6) + i;
    if (!this.disHedef[j]) {
      this.disHedef[j] = 1;
      this.ses.efekt('ting', this.disSayisi++ % 9);
      this.parcacikAt('parilti', ...this.agizF(disNoktasi(j)), 0.7);
    }
    // 5-6: bölge bitince Kino sayar
    if (this.yasBuyuk && simdi.bolge > once.bolge && this.sayilan < 4) {
      this.ses.soyle(['o1-bir', 'o1-iki', 'o1-uc'][this.sayilan++]);
    }
    if (tS - this.sonFircaSesi > 0.3) {
      this.sonFircaSesi = tS;
      this.ses.efekt('fircala');
    }
    if (tS - this.sonKumSesi > 0.5) {
      this.sonKumSesi = tS;
      this.ses.efekt('kum');
    }
    // fırçalarken minik köpük kabarcıkları dişlerden uçar
    if (Math.random() < 0.18) {
      const [fx, fy] = this.kopukF();
      this.parcacikAt('kopuk', fx + (Math.random() - 0.5) * this.r, fy - this.r * 0.3, 0.6);
    }
  }

  private bitisBaslat() {
    this.evre = 'bitis';
    this.bt = 0;
    this.u = 1;
    this.disHedef.fill(1);
    if (this.yasBuyuk && this.sayilan < 4) this.ses.soyle('o1-dort');
    this.sayilan = 4;
    this.ses.efekt('ding');
    this.oto = null;
    this.sonuc = { cocuk: !this.yardim.bitiriyor, sure: this.ot };
  }

  private basamak(b: Basamak, tS: number) {
    if (b === 'parla') this.ses.efekt('can');
    else if (b === 'soyle') {
      this.ses.soyle('o1-yardim');
      this.elGoster = tS;
    } else if (b === 'goster') this.otoBaslat(3, 1, 'o1-bak');
    else this.otoBaslat(Infinity, 2.6, 'o1-bitirim');
  }

  private hapsuBaslat(tS: number) {
    this.hapsu = tS;
    this.ses.efekt('hapsu');
    this.hapsuSoz = true;
  }
  private hapsuSoz = false;

  private parcacikAt(tur: Parcacik['tur'], x: number, y: number, omur: number) {
    const a = Math.random() * Math.PI * 2, h = tur === 'kopuk' ? 60 + Math.random() * 80 : 20;
    this.parcaciklar.push({ x, y, vx: Math.cos(a) * h, vy: tur === 'kopuk' ? -120 - Math.random() * 120 : -30, r: tur === 'kopuk' ? this.r * (0.1 + Math.random() * 0.12) : this.r * 0.38, omur, yas: 0, tur });
  }

  // ---------------------------------------------------------------- duruşlar
  private pozlar(dt: number, t: number) {
    const k = this.kino, a = this.anne, l = this.lokum;
    this.kaydir();
    // ---- Kino
    const d = yeniDurus();
    nefes(d, t, 0.32, 0.1, 0.8);
    d.agiz = 'agiz-az';
    const [fx] = this.evre === 'oyun' ? this.kopukF() : [k.x];
    const fark = (fx - k.x) / (k.o * 900);
    d.gozler = this.evre === 'oyun' ? (fark < -0.1 ? 'gozler-sola' : fark > 0.12 ? 'gozler-saga' : 'gozler-acik') : 'gozler-acik';
    if (this.fircaliyor || this.oto) d.kafaA += 1.8 * Math.sin(t * 7);
    // hapşırık
    const hx = t - this.hapsu;
    if (hx >= 0 && hx < 1.4) {
      const al = yumusak(hx / 0.45) * (1 - yumusak((hx - 0.45) / 0.12));
      const at = hx >= 0.45 ? Math.exp(-(hx - 0.45) * 4) : 0;
      d.kafaA += -5 * al + 7 * at;
      d.kafaY += -26 * al + 30 * at;
      d.gozler = hx < 0.9 ? 'gozler-kapali' : 'gozler-yari';
      d.kaslar = 'kaslar-kalkik';
      d.agiz = hx < 0.45 ? 'agiz-o' : 'agiz-genis';
      if (hx >= 0.45 && this.hapsuSoz) {
        this.hapsuSoz = false;
        this.ses.soyle('o1-hapsu');
        const [nx, ny] = this.burunF();
        for (let i = 0; i < 9; i++) this.parcacikAt('kopuk', nx, ny, 0.9);
        this.sonKikir = t - 10;
      }
    }
    // bitiş: gargara, tükürme
    if (this.evre === 'bitis') {
      const b = this.bt;
      const g = yumusak((b - 0.4) / 0.25) * (1 - yumusak((b - 1.75) / 0.2));
      d.yanak = g * (0.85 + 0.15 * Math.sin(b * 26));
      if (g > 0.05) {
        d.agiz = 'agiz-az';
        d.gozler = 'gozler-yari';
        d.kafaA += 3 * Math.sin(b * 9) * g;
      }
      const tu = Math.exp(-Math.max(0, b - 1.95) * 5) * (b > 1.85 ? 1 : 0);
      d.kafaA += 6 * tu;
      d.kafaY += 34 * tu;
      if (b > 1.85 && b < 2.6) d.agiz = 'agiz-o';
      if (b > 2.6) {
        d.gozler = 'gozler-mutlu';
        d.kaslar = 'kaslar-kalkik';
      }
    }
    if (this.evre === 'sonra') d.gozler = 'gozler-mutlu';
    kirp(d, t, 3);
    // fırça kolu: kolCoz ile (kit karesinde, gövdenin içinde)
    k.yaz(d);
    this.firciKolu(d, dt);
    k.yaz(d);
    k.adim(dt);

    // ---- Anne (Lokum'u kucağında tutar, Kino'ya bakar, gülümser)
    const da = yeniDurus();
    nefes(da, t, 0.27, 0.4);
    da.gozler = 'gozler-saga';
    da.kafaA = 3;
    if (this.evre === 'bitis' && this.bt > 2.4) da.gozler = 'gozler-mutlu';
    if (t - this.hapsu > 0.5 && t - this.hapsu < 2) {
      da.gozler = 'gozler-mutlu';
      da.agiz = 'agiz-genis';
    }
    kirp(da, t, 11);
    kuyrukSalla(da, t, 0.9, 5);
    kucakDurusu(da);
    a.yaz(da);
    a.adim(dt);
    // Lokum: Anne'nin kalçasında; minik pembe fırçayla Kino'yu taklit eder
    const dl = yeniDurus();
    nefes(dl, t, 0.42, 0.2);
    dl.gozler = 'gozler-saga';
    dl.agiz = 'agiz-e';
    dl.kafaA = -4 + 3 * Math.sin(t * 2.2);
    // kikir: hapşırıkta ve ara ara
    const kk = t - this.sonKikir;
    if (kk > 7 && this.evre === 'oyun') this.sonKikir = t;
    const kikir = t - this.hapsu > 0.7 && t - this.hapsu < 1.8;
    if ((kk < 0.9 && this.evre === 'oyun') || kikir) {
      dl.gozler = 'gozler-mutlu';
      dl.agiz = 'agiz-kahkaha';
      dl.kalcaY += 8 * Math.abs(Math.sin(t * 14));
      if (kikir && t - this.hapsu < 0.75) this.ses.efekt('kikir');
    }
    if (this.evre === 'bitis' && this.bt > 2.15 && this.bt < 2.8) {
      dl.agiz = 'agiz-o';
      dl.yanak = 0.6;
    }
    const sl = this.ses.aktif('lokum');
    if (sl) dl.agiz = heceAgzi(sl.metin, sl.x)?.agiz ?? dl.agiz;
    lokumKucakta(dl);
    kirp(dl, t, 5);
    kuyrukSalla(dl, t, 2.2, 12);
    // sol el (ekranın sağı) minik fırçayı burnuna götürür
    eliGotur(dl, l, 'sol', [700 + 30 * Math.sin(t * 7), 760], 1);
    kucagaOtur(a, l);
    l.yaz(dl);
    l.adim(dt);
  }

  /** Kino'nun sağ eli (ekranın solu) fırçayı tutar; fırçanın başı köpüğün / parmağın üstünde */
  private firciKolu(d: Durus, dt: number) {
    const k = this.kino;
    k.k.hesapla();
    const ag = this.agizF([712, 1000]);
    let hedef: [number, number];
    if (this.evre === 'oyun') {
      const [fx, fy] = this.kopukF();
      if (this.parmak.bas && !(this.oto && !this.fircaliyor)) hedef = [this.parmak.x, this.parmak.y];
      else if (this.oto) hedef = [fx, fy];
      else hedef = [fx + this.r * 0.2, fy + this.r * 1.3];
    } else if (this.evre === 'bitis') {
      hedef = [ag[0] - this.r * 2.2, ag[1] + this.r * 3.5 + Math.min(1, this.bt) * this.r * 2];
    } else hedef = [ag[0] - this.r * 1.8, ag[1] + this.r * 1.6];
    // başı fazla uzağa gitmesin (kol boyu)
    const m = k.o * 520;
    hedef = [sinirla(hedef[0], ag[0] - m, ag[0] + m * 0.7), sinirla(hedef[1], ag[1] - m * 0.6, ag[1] + m)];
    if (!this.fbHazir) {
      this.fb = hedef;
      this.fbHazir = true;
    }
    const e = 1 - Math.exp(-dt * 16);
    this.fb = [this.fb[0] + (hedef[0] - this.fb[0]) * e, this.fb[1] + (hedef[1] - this.fb[1]) * e];
    // el: fırça sapının ucunda
    const L = this.fircaBoy;
    const yon = this.fircaYonu;
    const el: [number, number] = [this.fb[0] + Math.cos(yon) * L * 0.78, this.fb[1] + Math.sin(yon) * L * 0.78];
    const gm = carp(k.dunya(), k.k.matris('govde'));
    const hedefKit = uyg(ters(gm), el);
    const omuz: [number, number] = [590, 1300], dirsek: [number, number] = [483, 1515], bilek: [number, number] = [452, 1640];
    // eldeki tutuş noktası bileğin biraz altında: hedefi bilek için düzelt
    const h2: [number, number] = [hedefKit[0] + 10, hedefKit[1] - 70];
    let sec: [number, number] = [0, 0], enY = -Infinity;
    for (const buk of [1, -1] as const) {
      const [a1] = kolCoz(omuz, dirsek, bilek, h2, buk);
      const r = (a1 * Math.PI) / 180;
      const ey = omuz[1] + (dirsek[0] - omuz[0]) * Math.sin(r) + (dirsek[1] - omuz[1]) * Math.cos(r);
      if (ey > enY) {
        enY = ey;
        sec = kolCoz(omuz, dirsek, bilek, h2, buk);
      }
    }
    d.kolSag = sec[0];
    d.dirsekSag = sec[1];
    d.elSag = -(sec[0] + sec[1]) + 40;
  }
  private get fircaBoy() {
    return this.kino.o * 360;
  }
  private get fircaYonu() {
    return (122 * Math.PI) / 180;
  }

  // ---------------------------------------------------------------- çizim
  /** M: F → canvas pikseli (DPR dahil); tS: sahne saati */
  ciz(ctx: CanvasRenderingContext2D, M: Matris, tS: number) {
    const { W, H } = this;
    ctx.save();
    ctx.setTransform(...M);
    // arka plan: banyonun aynadaki görüntüsü (çevrilmiş, önceden yumuşatılmış; uzakta)
    const kp = this.kapsa;
    const ys = this.yansima;
    if (ys) {
      const boy = Math.max(kp.h, (kp.w / ys.width) * ys.height) * 1.08;
      const gen = (boy / ys.height) * ys.width;
      ctx.save();
      ctx.translate(kp.x + kp.w / 2, kp.y + kp.h / 2);
      ctx.scale(-1, 1);
      ctx.drawImage(ys, -gen / 2, -boy / 2, gen, boy);
      ctx.restore();
    }
    ctx.fillStyle = 'rgba(210,235,250,0.18)';
    ctx.fillRect(kp.x - 10, kp.y - 10, kp.w + 20, kp.h + 20);
    // Anne + Lokum (uzakta, küçük): Anne'nin sol kolu Lokum'un önünden sarar
    const Mf = M;
    kucakCiz(ctx, Mf, this.anne, this.lokum, (c, m) => this.lokumFircasi(c, m, tS));
    // Kino: beden, "Iii" ağzı, burun, köpük, fırça, fırçayı tutan kol
    const k = this.kino;
    const gargara = this.evre === 'bitis' && this.bt > 0.35 && this.bt < 2.65;
    const hapsuyor = tS - this.hapsu >= 0 && tS - this.hapsu < 1.3;
    k.ciz(ctx, Mf, { haric: ['kol-sag', 'kol-ust-sag-dikis', 'burun'] });
    if (!gargara && !hapsuyor) {
      const kafa = carp(Mf, carp(k.dunya(), k.k.matris('kafa')));
      ctx.setTransform(...kafa);
      const ac = this.evre === 'once' ? Math.min(1, this.sirit) : this.evre === 'bitis' ? Math.min(1, Math.max(0.6, (this.bt - 2.65) / 0.3)) : 1;
      disAgzi(ctx, this.dis, ac);
    }
    k.ciz(ctx, Mf, { yalniz: ['burun'] });
    // köpük
    ctx.setTransform(...Mf);
    if (this.evre === 'oyun') {
      const [fx, fy] = this.kopukF();
      const bekliyor = !this.fircaliyor && !this.oto;
      const nabiz = this.yardim.parla || (bekliyor && this.ot > 1.2) ? 0.5 + 0.5 * Math.sin(tS * 6) : 0;
      const parla = bekliyor ? (this.yasBuyuk && !this.yardim.parla ? 0.35 : 0.75) : 0.15;
      const giris = Math.min(1, this.ot / 0.35);
      ctx.save();
      ctx.translate(fx, fy);
      ctx.scale(giris, giris);
      kopukTopu(ctx, this.r, tS, nabiz, parla);
      ctx.restore();
    } else if (this.evre === 'bitis' && this.bt < 0.5) {
      const [fx, fy] = this.agizF(kopukYolu(1, this.yasBuyuk).p);
      ctx.save();
      ctx.globalAlpha = 1 - this.bt / 0.5;
      ctx.translate(fx, fy);
      kopukTopu(ctx, this.r * (1 + this.bt), tS);
      ctx.restore();
    }
    // fırça (Kino'nun yeşil fırçası): başı fb'de, sap sol aşağı
    if (!gargara || this.bt < 0.6) {
      ctx.save();
      ctx.translate(this.fb[0], this.fb[1]);
      ctx.rotate(this.fircaYonu);
      ctx.scale(1, -1);
      firca(ctx, this.fircaBoy, '#5fb85a', this.fircaliyor || this.oto ? 1 : 0, tS);
      ctx.restore();
    }
    k.ciz(ctx, Mf, { yalniz: ['kol-sag', 'kol-ust-sag-dikis'] });
    // lavabonun kenarı (önde) ve kum saati
    ctx.setTransform(...Mf);
    this.lavaboKenari(ctx);
    const ky = this.kumYeri;
    if (this.kumGorunur) {
      ctx.save();
      ctx.translate(ky.x, ky.y - ky.h * 0.06);
      kumSaati(ctx, ky.w, ky.h, this.kum, this.fircaliyor || (!!this.oto && this.evre === 'oyun'), tS, this.evre === 'bitis' ? Math.max(0, 1 - this.bt / 1.5) : 0);
      ctx.restore();
    }
    // parçacıklar
    for (const q of this.parcaciklar) {
      const g = 1 - q.yas / q.omur;
      ctx.save();
      ctx.globalAlpha = Math.min(1, g * 2);
      ctx.translate(q.x, q.y);
      if (q.tur === 'parilti') {
        ctx.rotate(q.yas * 3);
        parilti(ctx, q.r * (0.6 + 0.6 * Math.sin(Math.PI * Math.min(1, q.yas / q.omur))));
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, q.r, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.lineWidth = q.r * 0.25;
        ctx.strokeStyle = 'rgba(64,19,18,0.75)';
        ctx.stroke();
      }
      ctx.restore();
    }
    // ayna camı: hafif çapraz parlamalar
    ctx.save();
    ctx.globalAlpha = 0.09;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(W * 0.02, -H * 0.2);
    ctx.lineTo(W * 0.1, -H * 0.2);
    ctx.lineTo(-W * 0.05, H * 1.2);
    ctx.lineTo(-W * 0.13, H * 1.2);
    ctx.fill();
    ctx.restore();
    // hayalet el (yardım 10 sn): köpükten başlayıp yolun ilerisine doğru sürükler
    const ex = tS - this.elGoster;
    if (this.evre === 'oyun' && ex >= 0 && ex < 4.2) {
      const dongu = (ex % 2.1) / 2.1;
      const u2 = Math.min(1, this.u + 0.12 * yumusak((dongu - 0.25) / 0.6));
      const kafa = carp(k.dunya(), k.k.matris('kafa'));
      const [hx, hy] = uyg(kafa, kopukYolu(u2, this.yasBuyuk).p);
      const sayd = Math.min(1, ex / 0.3, (4.2 - ex) / 0.3) * Math.min(1, dongu / 0.1, (1 - dongu) / 0.1);
      ctx.translate(hx, hy);
      hayaletEl(ctx, this.r * 1.5, sayd, dongu > 0.15 && dongu < 0.85 ? 1 : 0);
    }
    ctx.restore();
  }

  /** "Iii" köprüde yavaşça açılır (0..1) */
  siritAyarla(g: number) {
    this.sirit = g;
  }

  private lavaboKenari(ctx: CanvasRenderingContext2D) {
    const { W, H } = this;
    const c = Math.max(3, this.kino.o * 8.5);
    const y0 = this.dikey ? H * 0.9 : H * 0.92;
    const x1 = this.dikey ? W * 1.1 : W * 0.5;
    ctx.beginPath();
    ctx.moveTo(-W * 0.2, y0);
    ctx.lineTo(x1 - H * 0.06, y0);
    ctx.quadraticCurveTo(x1, y0, x1 + H * 0.02, y0 + H * 0.08);
    ctx.lineTo(x1 + H * 0.05, y0 + H * 0.16);
    ctx.lineTo(-W * 0.2, y0 + H * 0.16);
    ctx.closePath();
    ctx.fillStyle = '#fbfaf6';
    ctx.fill();
    ctx.lineWidth = c;
    ctx.strokeStyle = KONTUR;
    ctx.stroke();
    ctx.fillStyle = 'rgba(190,200,215,0.45)';
    ctx.fillRect(-W * 0.2, y0 + H * 0.035, x1 + W * 0.2 - H * 0.02, H * 0.02);
  }

  private lokumFircasi(ctx: CanvasRenderingContext2D, M: Matris, tS: number) {
    const l = this.lokum;
    l.k.hesapla();
    const el = carp(M, carp(l.dunya(), l.k.matris('el-sol')));
    ctx.save();
    ctx.setTransform(...el);
    ctx.translate(820, 1120);
    ctx.rotate(-2.3 + 0.08 * Math.sin(tS * 9));
    ctx.scale(1, -1);
    firca(ctx, 300, '#f08bb0', 0.5, tS);
    ctx.restore();
  }
}
