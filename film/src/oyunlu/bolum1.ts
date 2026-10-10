/**
 * Kino'nun Bir Günü (oyunlu-bolum-01.md): ilk oynanır parça. Sahne 1 "Günaydın" (M1 çocuk odası, sabah) →
 * kararma → Sahne 2 "Lavabo" (M3 banyo, sabah) → köprü: kamera aynanın içine süzülür → OYUN 1 Kum Saati →
 * kamera aynadan çıkar → dönüş → kararma.
 *
 * Dünya = arka planın pikseli (2752×1536). Oyuncu ölçeği o (dünya / kit birimi): kitler aynı birimde, aynı o ile
 * basılınca boylar aile-boy.json'daki gibi (Anne = Kino × 1.6, Lokum = Kino × 0.7).
 * Hikâye parçaları zamanın saf fonksiyonu: aynı t → aynı kare (kayıt ve an tekrarı için).
 */
import type { KuklaIskelet, Matris } from '../kukla';
import { carp } from '../kukla';
import { Aktor, aralik, eliGotur, heceAgzi, kirp, kolKaldir, kuyrukSalla, nefes, tasan, yeniDurus, type Durus } from './aktor';
import { bezelyeBalonu, damla, firca, gunesHuzmesi, havlu, KONTUR, kumSaati, macun, tabure, tup } from './cizim';
import { kostumGiydir, PIJAMA } from './kostum';
import { kucagaOtur, kucakCiz, kucakDurusu, KUCAK, lokumKucakta } from './kucak';
import { AynaSahnesi, type Parmak } from './kum-saati';
import { kameraKaris, kameraMatris, kameraYolu, type Kamera, type KameraAnahtar, type Ortam, type Segment, type Sozler } from './oynatici';
import { efekt, muzik, muzikSon } from './ses';
import kinoJson from '../../../assets/karakter/kino-yeni/kino-yeni.json';
import anneJson from '../../../assets/karakter/anne/anne.json';
import lokumJson from '../../../assets/karakter/lokum/lokum.json';

const KIT_GORSEL: Record<string, string> = import.meta.glob<string>('../../../assets/karakter/{kino-yeni,anne,lokum}/**/*.webp', { eager: true, query: '?url', import: 'default' });
const MEKAN: Record<string, string> = import.meta.glob<string>('../../../assets/film-seri2/{oda-sabah,oda-sabah-yorgan,oda-sabah-karyola,banyo-sabah,banyo-sabah-yumusak}.webp', { eager: true, query: '?url', import: 'default' });
const mekan = (ad: string) => MEKAN[`../../../assets/film-seri2/${ad}.webp`];

const resim = async (a: string) => {
  const i = new Image();
  i.src = a;
  await i.decode();
  return i;
};

// ---------------------------------------------------------------- akış (zaman çizelgesi kurucu)
interface AkisOlay {
  t: number;
  tur: 'soz' | 'efekt' | 'muzik' | 'muzikSon';
  id: string;
  n?: number;
  ses?: number;
}
class Akis {
  t = 0;
  olaylar: AkisOlay[] = [];
  an: Record<string, number> = {};
  constructor(private readonly sozler: Sozler) {}
  bekle(s: number) {
    this.t += s;
    return this;
  }
  isaret(ad: string) {
    this.an[ad] = this.t;
    return this;
  }
  soz(id: string, sonra = 0.35, ad = id) {
    this.olaylar.push({ t: this.t, tur: 'soz', id });
    this.an[ad] = this.t;
    this.an[`${ad}:son`] = this.t + this.sozler.sure(id);
    this.t += this.sozler.sure(id) + sonra;
    return this;
  }
  efekt(id: string, dt = 0, n?: number) {
    this.olaylar.push({ t: this.t + dt, tur: 'efekt', id, n });
    return this;
  }
  muzik(id: string, ses = 0.4, dt = 0) {
    this.olaylar.push({ t: this.t + dt, tur: 'muzik', id, ses });
    return this;
  }
  muzikSon(dt = 0) {
    this.olaylar.push({ t: this.t + dt, tur: 'muzikSon', id: '' });
    return this;
  }
}

/** bölümün ortak hâli (oyuncular, görseller, sözler, saat) */
export interface BolumBaglam {
  sozler: Sozler;
  saat: () => number;
  yasBuyuk: boolean;
  izle: boolean;
  /** kayıt: oyunu sanal parmak oynar */
  simule: boolean;
}

class HikayeParcasi implements Segment {
  private son = -1;
  constructor(
    readonly ad: string,
    readonly sure: number,
    private readonly olaylar: AkisOlay[],
    private readonly b: BolumBaglam,
    private readonly ileri: (t: number, dt: number, o: Ortam) => void,
    private readonly cizici: (t: number, o: Ortam) => void,
    private readonly kararma: (t: number) => number,
    private readonly baslarken?: () => void,
  ) {}
  basla(t0: number) {
    this.son = t0 - 1e-6;
    this.baslarken?.();
    // ortadan başlarken (an tekrarı) o ana kadarki son müzik çalar
    if (t0 > 0) {
      const m = [...this.olaylar].filter((o) => o.tur === 'muzik' && o.t <= t0).pop();
      if (m) muzik({ ad: m.id, ses: m.ses, dongu: true, gec: 0.8 });
    }
  }
  adim(t: number, dt: number, o: Ortam) {
    for (const e of this.olaylar) {
      if (e.t <= this.son || e.t > t) continue;
      if (e.tur === 'soz') this.b.sozler.soyle(e.id, this.b.saat() - (t - e.t));
      else if (e.tur === 'efekt') efekt(e.id, e.n);
      else if (e.tur === 'muzik') muzik({ ad: e.id, ses: e.ses, dongu: true, gec: 1.2 });
      else muzikSon(1.4);
    }
    this.son = t;
    this.ileri(t, dt, o);
    return t >= this.sure;
  }
  ciz(t: number, o: Ortam) {
    this.cizici(t, o);
  }
  karanlik(t: number) {
    return this.kararma(t);
  }
}

// ---------------------------------------------------------------- arka plan ve kamera
interface Mekan {
  img: HTMLImageElement;
  /** dikey kadrajda resmin üstü / altı bu satır bantlarının tekrarıyla sürer (sahnenin devamı, siyah değil) */
  ust: [number, number];
  alt: [number, number];
}
function arkaCiz(o: Ortam, m: Mekan, kam: Matris) {
  const { ctx, dpr, H } = o;
  ctx.setTransform(kam[0] * dpr, 0, 0, kam[3] * dpr, kam[4] * dpr, kam[5] * dpr);
  const s = kam[3];
  const ymin = -kam[5] / s, ymax = (H - kam[5]) / s;
  const W = m.img.width, Y = m.img.height;
  if (ymin < 0) {
    const [a, b] = m.ust, P = b - a;
    for (let y = a - P; y + P > ymin; y -= P) ctx.drawImage(m.img, 0, a, W, P, 0, y, W, P + 1);
  }
  if (ymax > Y) {
    const [a, b] = m.alt, P = b - a;
    for (let y = a + P; y < ymax; y += P) ctx.drawImage(m.img, 0, a, W, P, 0, y - 1, W, P + 1);
  }
  ctx.drawImage(m.img, 0, 0);
}
/** yatayda kamera resmin dışına taşmaz; dikeyde yalnız yatay sınır */
function sinirliKamera(k: Kamera, o: Ortam, img: { width: number; height: number }): Kamera {
  const g = Math.min(k.g, img.width);
  const gy = (g * o.H) / o.W;
  const x = Math.max(g / 2, Math.min(img.width - g / 2, k.x));
  const y = o.dikey || gy > img.height ? k.y : Math.max(gy / 2, Math.min(img.height - gy / 2, k.y));
  return { x, y, g };
}
const dprli = (m: Matris, dpr: number): Matris => [m[0] * dpr, m[1] * dpr, m[2] * dpr, m[3] * dpr, m[4] * dpr, m[5] * dpr];


// ---------------------------------------------------------------- bölüm
export interface Bolum {
  parcalar: Segment[];
  yukle(): Promise<void>;
  /** an tekrarı: kum saati oyununun parçası ve içindeki başlangıç anı */
  anBaslangic: { i: number; t: number };
  ayna: AynaSahnesi;
  /** test / kayıt: köpüğün ekran (css) konumu */
  kopukEkran(): [number, number] | null;
}

export function bolumKur(b: BolumBaglam): Bolum {
  const kinoIsk = kostumGiydir(kinoJson as unknown as KuklaIskelet, PIJAMA);
  const adres = (klasor: string) => (d: string) => KIT_GORSEL[`../../../assets/karakter/${klasor}/${d}`];
  const kino = new Aktor('kino', kinoIsk, adres('kino-yeni'));
  const anne = new Aktor('anne', anneJson as unknown as KuklaIskelet, adres('anne'));
  const lokum = new Aktor('lokum', lokumJson as unknown as KuklaIskelet, adres('lokum'));
  const kinoA = new Aktor('kino', kostumGiydir(kinoJson as unknown as KuklaIskelet, PIJAMA), adres('kino-yeni'));
  const anneA = new Aktor('anne', anneJson as unknown as KuklaIskelet, adres('anne'));
  const lokumA = new Aktor('lokum', lokumJson as unknown as KuklaIskelet, adres('lokum'));
  lokum.nokta = [650, 1320];

  let oda: Mekan, banyo: Mekan;
  let yorgan: HTMLImageElement, karyola: HTMLImageElement;
  const ses = {
    soyle: (id: string) => b.sozler.soyle(id, b.saat()),
    aktif: (kim: string) => b.sozler.aktif(kim, b.saat()),
    efekt: (ad: string, n?: number) => efekt(ad, n),
  };
  const sesAgzi = (d: Durus, kim: string, guc = 1) => {
    const s = b.sozler.aktif(kim, b.saat());
    if (!s) return false;
    const h = heceAgzi(s.metin, s.x);
    if (h) {
      d.agiz = h.agiz;
      d.kafaY += -9 * h.guc * guc;
      d.kafaA += 1.5 * Math.sin(s.x * 7) * h.guc * guc;
    }
    return true;
  };

  // ================================================================ SAHNE 1 · Günaydın (M1, sabah)
  const ODA_O = 0.275;
  const a1 = new Akis(b.sozler);
  a1.muzik('film-merak', 0.32, 0.2).efekt('kus', 0.6).efekt('kus', 2.6);
  a1.bekle(1.4).soz('s1-anl1', 0.25);
  a1.isaret('zipla').soz('s1-lok1', 0.2);
  a1.isaret('kulak1').bekle(0.6).isaret('kulak2').bekle(0.7).isaret('esne').efekt('esne').bekle(1.5).isaret('otur').bekle(1.0);
  a1.soz('s1-kino1', 0.3);
  a1.isaret('anneGel').efekt('ayak', 0.4).efekt('ayak', 1.2).efekt('ayak', 2.0).bekle(2.5).isaret('anneAl').efekt('hop', 0.3).bekle(1.5);
  a1.soz('s1-anne1', 0.25);
  a1.isaret('firla').efekt('hop', 0.3).efekt('inen', 0.95).soz('s1-kino2', 0.3);
  a1.soz('s1-anne2', 0.3);
  a1.soz('s1-kino3', 0.35, 'buyudum');
  a1.soz('s1-anl2', 0.2);
  a1.isaret('kos').efekt('kosu', 0.2).efekt('ayak', 0.5).efekt('ayak', 0.8).efekt('ayak', 1.1);
  a1.bekle(0.6).soz('s1-lok2', 0.2).bekle(0.9).isaret('karar');
  const S1_SURE = a1.t + 1.0;
  const A1 = a1.an;

  const kam1: KameraAnahtar[] = [
    { t: 0, yatay: { x: 600, y: 960, g: 1350 }, dikey: { x: 430, y: 900, g: 820 } },
    { t: A1.zipla + 0.3, yatay: { x: 1300, y: 900, g: 2350 }, dikey: { x: 1880, y: 860, g: 820 }, gecis: 1.3 },
    { t: A1.kulak1 + 0.4, yatay: { x: 900, y: 930, g: 1800 }, dikey: { x: 430, y: 900, g: 820 }, gecis: 1.1 },
    { t: A1.otur + 0.8, yatay: { x: 1300, y: 900, g: 2350 }, dikey: { x: 560, y: 880, g: 980 } },
    { t: A1.anneGel + 1.6, yatay: { x: 1376, y: 880, g: 2500 }, dikey: { x: 2000, y: 840, g: 1100 }, gecis: 1.6 },
    { t: A1.firla + 1.4, yatay: { x: 1450, y: 900, g: 2200 }, dikey: { x: 1500, y: 880, g: 1500 }, gecis: 1.3 },
    { t: A1.buyudum + 0.6, yatay: { x: 1350, y: 900, g: 1800 }, dikey: { x: 1100, y: 880, g: 1000 }, gecis: 1.0 },
    { t: A1.kos + 1.2, yatay: { x: 1700, y: 880, g: 2300 }, dikey: { x: 2050, y: 850, g: 1200 }, gecis: 1.4 },
  ];
  // Kino'nun yataktan fırlayışı: kalça yerden yatağa
  const YATAK_KALCA: [number, number] = [532, 985];
  const YER_KALCA: [number, number] = [1010, 1330 - (2290 - 1760) * ODA_O];
  const ANNE_YER: [number, number] = [2090, 1330];
  const LOKUM_KARYOLA: [number, number] = [1905, 1062 - (1600 - 1320) * ODA_O];
  const KARYOLA_UST = 790;

  let s1KinoOnde = false;
  let s1LokumOnde = false;

  function s1Kino(t: number): Durus {
    const d = yeniDurus();
    kino.o = ODA_O;
    kino.nokta = [845, 1760];
    const otur = aralik(t, A1.otur, A1.otur + 1.0);
    const zip0 = A1.firla, zipKalk = zip0 + 0.3, zipIn = zip0 + 0.95;
    // yatıyor → oturuyor
    if (t < zipKalk) {
      kino.x = YATAK_KALCA[0];
      kino.y = YATAK_KALCA[1];
      kino.don = -80 * (1 - tasan(otur, 1.2));
      s1KinoOnde = false;
    }
    if (t < A1.otur + 0.3) {
      // uyku: derin, yavaş nefes; kulaklar yastığa yayılmış
      nefes(d, t, 0.2, 0, 1.8);
      d.gozler = 'gozler-kapali';
      d.agiz = 'agiz-az';
      const k1 = tasan(aralik(t, A1.kulak1, A1.kulak1 + 0.35), 1.8), k2 = tasan(aralik(t, A1.kulak2, A1.kulak2 + 0.35), 1.8);
      d.kulakSag = 8 - 26 * k1;
      d.kulakSol = -8 + 26 * k2;
      // üstteki kol yorganın üstünde, gövde boyunca
      d.kolSol = -20;
      d.dirsekSol = 30;
      // esneme: ağız kocaman, kulaklar havaya
      const es = aralik(t, A1.esne, A1.esne + 0.35) * (1 - aralik(t, A1.esne + 1.15, A1.esne + 1.5));
      if (es > 0) {
        d.agiz = es > 0.3 ? 'agiz-kahkaha' : 'agiz-o';
        d.kaslar = 'kaslar-kalkik';
        d.kulakSag -= 18 * es;
        d.kulakSol += 18 * es;
        d.kafaA += -6 * es;
        kolKaldir(d, 'sag', es, 150, 30);
        kolKaldir(d, 'sol', es, 150, 30);
      }
      if (t > A1.esne + 1.2) d.gozler = 'gozler-yari';
    } else {
      nefes(d, t, 0.34);
      d.gozler = t < A1.otur + 0.8 ? 'gozler-yari' : 'gozler-saga';
      d.kaslar = 'kaslar-kalkik';
      d.kafaA = 4 * (1 - otur);
    }
    // "Günaydın, Lokum!" el sallar
    const sal = aralik(t, A1['s1-kino1'] - 0.1, A1['s1-kino1'] + 0.3) * (1 - aralik(t, A1['s1-kino1:son'], A1['s1-kino1:son'] + 0.4));
    if (sal > 0) {
      kolKaldir(d, 'sol', tasan(sal, 1.3), 120, 40 + 25 * Math.sin((t - A1['s1-kino1']) * 14));
      d.gozler = 'gozler-mutlu';
    }
    // fırla: çömel, sıçra, yere in
    if (t >= zip0 - 0.1) {
      const comel = aralik(t, zip0 - 0.1, zipKalk) * (1 - aralik(t, zipKalk, zipKalk + 0.1));
      d.govdeSy -= 0.05 * comel;
      d.kafaY += 20 * comel;
      if (t >= zipKalk) {
        const u = Math.min(1, (t - zipKalk) / (zipIn - zipKalk));
        const e = u * u * (3 - 2 * u);
        kino.don = 0;
        kino.x = YATAK_KALCA[0] + (YER_KALCA[0] - YATAK_KALCA[0]) * e;
        kino.y = YATAK_KALCA[1] + (YER_KALCA[1] - YATAK_KALCA[1]) * u - 360 * Math.sin(Math.PI * u);
        if (kino.y + 150 < 944) s1KinoOnde = true;
        if (u < 1) {
          d.ayakSag = { x: -30, y: -90 * Math.sin(Math.PI * u), egim: -10 };
          d.ayakSol = { x: 30, y: -90 * Math.sin(Math.PI * u), egim: 10 };
          kolKaldir(d, 'sag', Math.sin(Math.PI * u), 150, 20);
          kolKaldir(d, 'sol', Math.sin(Math.PI * u), 150, 20);
          d.gozler = 'gozler-mutlu';
          d.agiz = 'agiz-genis';
        }
        const ini = aralik(t, zipIn, zipIn + 0.12) * (1 - aralik(t, zipIn + 0.12, zipIn + 0.45));
        d.kalcaY += 40 * ini;
        d.govdeSy -= 0.05 * ini;
      }
    }
    // "Yaşasın!" iki kol havada
    const yas = aralik(t, zipIn + 0.1, zipIn + 0.35) * (1 - aralik(t, A1['s1-kino2:son'], A1['s1-kino2:son'] + 0.35));
    if (yas > 0 && t > zipIn) {
      kolKaldir(d, 'sag', tasan(yas, 1.3), 135, 15);
      kolKaldir(d, 'sol', tasan(yas, 1.3), 135, 15);
      d.gozler = 'gozler-mutlu';
      d.kalcaY += -14 * Math.abs(Math.sin((t - zipIn) * 9)) * yas;
    }
    if (t > zipIn + 0.2) {
      d.gozler = d.gozler === 'gozler-acik' ? 'gozler-saga' : d.gozler;
      kuyrukSalla(d, t, 2.6, 14);
    }
    // "Ben büyüdüm artık!": göğüs gerer, eller belde, kuyruk dik
    const bu = aralik(t, A1.buyudum - 0.2, A1.buyudum + 0.25) * (1 - aralik(t, A1['buyudum:son'] + 0.2, A1['buyudum:son'] + 0.6));
    if (bu > 0) {
      d.govdeSy += 0.03 * bu;
      d.kafaA += -5 * bu;
      d.kafaY += -14 * bu;
      d.kolSag += 38 * bu;
      d.kolSol -= 38 * bu;
      d.dirsekSag -= 120 * bu;
      d.dirsekSol += 120 * bu;
      d.elSag += 30 * bu;
      d.elSol -= 30 * bu;
      d.kuyruk = -28 * bu + 4 * Math.sin(t * 12) * bu;
      d.kaslar = 'kaslar-kalkik';
      d.gozler = t > A1.buyudum + 0.9 ? 'gozler-mutlu' : 'gozler-acik';
    }
    // koridora koşar (sağa)
    if (t > A1.kos) {
      const u = (t - A1.kos) / 0.24;
      const ilerle = Math.min(1, (t - A1.kos) / 2.2);
      kino.x = YER_KALCA[0] + (2950 - YER_KALCA[0]) * (ilerle * ilerle * (3 - 2 * ilerle) * 0.4 + ilerle * 0.6);
      const kalk = Math.abs(Math.sin(Math.PI * u));
      const n = Math.floor(u) % 2 ? 1 : -1;
      d.ayakSag = { x: 20 * n, y: n > 0 ? -70 * kalk : 0 };
      d.ayakSol = { x: -20 * n, y: n < 0 ? -70 * kalk : 0 };
      d.kalcaY += -30 * kalk;
      d.govdeA += 6;
      d.kolSag += 25 * n;
      d.kolSol += 25 * n;
      d.dirsekSag -= 50;
      d.dirsekSol += 50;
      d.gozler = 'gozler-saga';
      d.agiz = 'agiz-genis';
      kuyrukSalla(d, t, 4, 18);
    }
    if (t > A1.otur + 0.3) sesAgzi(d, 'kino');
    kirp(d, t, 1);
    return d;
  }

  function s1Lokum(t: number): Durus {
    const d = yeniDurus();
    nefes(d, t, 0.45, 0.3);
    lokum.o = ODA_O;
    const al = aralik(t, A1.anneAl, A1.anneAl + 1.1);
    if (al <= 0) {
      lokum.x = LOKUM_KARYOLA[0];
      lokum.y = LOKUM_KARYOLA[1];
      s1LokumOnde = false;
      // parmaklıkları tutar
      d.kolSag = 150;
      d.kolSol = -150;
      d.dirsekSag = -40;
      d.dirsekSol = 40;
      d.gozler = t < A1.kulak1 + 1 ? 'gozler-sola' : 'gozler-sola';
      d.agiz = 'agiz-genis';
      // zıplar (Abi! Abi!) ve sonra sabırsız sallanır
      const z = t > A1.zipla - 0.4 && t < A1.anneGel + 0.5;
      if (z) {
        const ph = (t - A1.zipla + 0.4) * 2.6;
        const h = Math.abs(Math.sin(Math.PI * ph));
        lokum.y -= 26 * h;
        d.kalcaY += 0;
        d.dirsekSag += 30 * h;
        d.dirsekSol -= 30 * h;
        d.gozler = 'gozler-mutlu';
      } else d.kalcaA = 3 * Math.sin(t * 1.4);
      if (t > A1.anneGel) d.gozler = 'gozler-saga';
    } else {
      const u = Math.min(1, al);
      const kuc = anne.dunyaNoktasi('kalca', KUCAK);
      lokum.x = LOKUM_KARYOLA[0] + (kuc[0] - LOKUM_KARYOLA[0]) * u;
      lokum.y = LOKUM_KARYOLA[1] + (kuc[1] - LOKUM_KARYOLA[1]) * u - 320 * Math.sin(Math.PI * u);
      if (lokum.y + 90 < KARYOLA_UST) s1LokumOnde = true;
      kolKaldir(d, 'sag', 1 - u, 150, -40);
      kolKaldir(d, 'sol', 1 - u, 150, -40);
      lokumKucakta(d);
      d.gozler = u < 1 ? 'gozler-mutlu' : 'gozler-sola';
      d.agiz = u < 1 ? 'agiz-kahkaha' : 'agiz-genis';
      if (t > A1.firla + 0.9 && t < A1.firla + 2.4) {
        d.gozler = 'gozler-mutlu';
        d.agiz = 'agiz-kahkaha';
        lokum.y -= 10 * Math.abs(Math.sin(t * 12));
      }
      // Kino koşarken arkasından el uzatır
      const uz = aralik(t, A1.kos + 0.5, A1.kos + 0.9);
      if (uz > 0) {
        d.kolSol -= 100 * uz;
        d.dirsekSol -= 10 * uz;
        d.gozler = 'gozler-saga';
        d.kaslar = 'kaslar-uzgun';
        d.agiz = 'agiz-o';
      }
    }
    sesAgzi(d, 'lokum', 0.6);
    kirp(d, t, 7);
    kuyrukSalla(d, t, 2.4, 10);
    return d;
  }

  function s1Anne(t: number): Durus {
    const d = yeniDurus();
    nefes(d, t, 0.27, 0.6);
    anne.o = ODA_O;
    const yol = aralik(t, A1.anneGel, A1.anneGel + 2.3);
    anne.x = 2950 + (ANNE_YER[0] - 2950) * yol;
    anne.y = ANNE_YER[1];
    anne.gorunur = t > A1.anneGel;
    d.gozler = 'gozler-sola';
    if (yol > 0 && yol < 1) {
      const u = (t - A1.anneGel) / 0.38;
      const kalk = Math.abs(Math.sin(Math.PI * u));
      const n = Math.floor(u) % 2 ? 1 : -1;
      d.ayakSag = { x: 16 * n, y: n > 0 ? -60 * kalk : 0 };
      d.ayakSol = { x: -16 * n, y: n < 0 ? -60 * kalk : 0 };
      d.kalcaY += -14 * kalk;
      d.kolSag += 8 * n;
      d.kolSol += 8 * n;
    }
    // Lokum'u karyoladan alır
    const uz = aralik(t, A1.anneAl - 0.3, A1.anneAl + 0.2) * (1 - aralik(t, A1.anneAl + 0.6, A1.anneAl + 1.1));
    d.kolSag += 120 * uz;
    d.kolSol -= 40 * uz;
    d.dirsekSag += 20 * uz;
    d.dirsekSol -= 60 * uz;
    d.govdeA += -5 * uz;
    if (t > A1.anneAl + 0.6) kucakDurusu(d);
    if (t > A1.buyudum + 0.6 && t < A1.kos) d.gozler = 'gozler-mutlu';
    if (t > A1.kos + 0.3) d.gozler = 'gozler-saga';
    sesAgzi(d, 'anne', 0.7);
    kirp(d, t, 13);
    kuyrukSalla(d, t, 1.0, 6);
    return d;
  }

  const s1Ileri = (t: number, dt: number) => {
    kino.yaz(s1Kino(t));
    kino.adim(dt);
    anne.yaz(s1Anne(t));
    anne.adim(dt);
    lokum.yaz(s1Lokum(t));
    lokum.adim(dt);
  };
  const s1Ciz = (t: number, o: Ortam) => {
    const kam = sinirliKamera(kameraYolu(kam1, t, o.dikey), o, oda.img);
    const K = kameraMatris(kam, o.W, o.H);
    arkaCiz(o, oda, K);
    const M = dprli(K, o.dpr);
    const { ctx } = o;
    // sabah güneşi: pencereden yastığa
    ctx.setTransform(...M);
    gunesHuzmesi(ctx, [960, 640], [240, 940], 170, 260, 1 - aralik(t, A1.otur, A1.otur + 3));
    if (!s1LokumOnde) lokum.ciz(ctx, M);
    ctx.setTransform(...M);
    ctx.drawImage(karyola, 1556, 726);
    if (!s1KinoOnde) {
      kino.ciz(ctx, M);
      ctx.setTransform(...M);
      ctx.drawImage(yorgan, 284, 920);
    }
    if (s1LokumOnde) kucakCiz(ctx, M, anne, lokum);
    else anne.ciz(ctx, M);
    if (s1KinoOnde) kino.ciz(ctx, M);
  };
  const s1 = new HikayeParcasi('sahne1-gunaydin', S1_SURE, a1.olaylar, b, s1Ileri, s1Ciz, (t) => Math.max(1 - t / 1.0, aralik(t, S1_SURE - 0.9, S1_SURE)), () => {
    kino.gorunur = true;
  });

  // ================================================================ SAHNE 2 · Lavabo (M3, sabah)
  const BAN_O = 0.31;
  const CAM = { x: 287, y: 209, w: 386, h: 563 };
  const TABURE: [number, number] = [770, 1405];
  const KINO_YER: [number, number] = [770, 1405 - 118];
  const ANNE2: [number, number] = [1010, 1392];
  const KUM_YER: [number, number] = [592, 908];
  const a2 = new Akis(b.sozler);
  a2.muzik('film-merak', 0.3, 0.1);
  a2.bekle(0.9).isaret('sicrat1').efekt('sapir', 0.45).bekle(1.1).isaret('sicrat2').efekt('sapir', 0.45).bekle(0.9);
  a2.soz('s2-lok1', 0.2).efekt('kikir', -0.6);
  a2.isaret('kurula').bekle(1.7).isaret('pofuduk').efekt('pof').bekle(1.4);
  a2.isaret('macun').efekt('macun', 0.3).bekle(1.7);
  a2.soz('s2-kino1', 0.3);
  a2.soz('s2-anne1', 0.25, 'bezelye').efekt('pit', 0.6);
  a2.isaret('cep').bekle(0.9).isaret('koy').efekt('tak', 0.35).bekle(0.7);
  a2.soz('s2-anne2', 0.3);
  a2.soz('s2-anl1', 0.2);
  a2.isaret('kopru').muzik('banyo-sozsuz', 0.28, 0.6).bekle(2.6);
  const S2A_SURE = a2.t;
  const A2 = a2.an;
  const KOPRU_SURE = 2.6;

  const kam2: KameraAnahtar[] = [
    { t: 0, yatay: { x: 960, y: 900, g: 2300 }, dikey: { x: 860, y: 960, g: 1000 } },
    { t: A2.kurula, yatay: { x: 880, y: 940, g: 1900 }, dikey: { x: 800, y: 980, g: 820 }, gecis: 1.4 },
    { t: A2.bezelye + 0.6, yatay: { x: 900, y: 940, g: 1950 }, dikey: { x: 860, y: 980, g: 900 }, gecis: 1.2 },
    { t: A2['s2-anl1'] + 0.4, yatay: { x: 760, y: 860, g: 1650 }, dikey: { x: 640, y: 900, g: 780 }, gecis: 1.6 },
  ];
  /** aynanın içi (oyun kadrajı): camın ortası, camı taşmayacak kadar yakın */
  const aynaKamera = (o: Ortam): Kamera => (o.dikey ? { x: 480, y: 490, g: 230 } : { x: 480, y: 600, g: 340 });
  const ayna = new AynaSahnesi(kinoA, anneA, lokumA, b.yasBuyuk, b.izle, ses);

  /** aynanın önü: köprünün ilk yarısında kamera aynayı ortalar (Kino kadrajın kenarına kayar), sonra içine girer */
  const aynaOnu = (o: Ortam): Kamera => (o.dikey ? { x: 480, y: 540, g: 700 } : { x: 480, y: 560, g: 1150 });
  /** banyo + aynadaki yansıma; kopru (doğrusal zaman): 0 geniş plan .. 1 aynanın içi */
  function banyoCiz(o: Ortam, genis: Kamera, kopru: number, t: number, cizGercek: (M: Matris) => void) {
    const ak = aynaKamera(o);
    const g0 = sinirliKamera(genis, o, banyo.img);
    const ODA = 0.38;
    const kam = kopru <= 0 ? g0 : kopru < ODA ? kameraKaris(g0, sinirliKamera(aynaOnu(o), o, banyo.img), kopru / ODA) : kameraKaris(sinirliKamera(aynaOnu(o), o, banyo.img), ak, (kopru - ODA) / (1 - ODA));
    const K = kameraMatris(kam, o.W, o.H);
    const K1 = kameraMatris(ak, o.W, o.H);
    // F (oyun kadrajı) → ekran: K ∘ K1⁻¹
    const s = K[0] / K1[0];
    const F: Matris = [s, 0, 0, s, K[4] - s * K1[4], K[5] - s * K1[5]];
    const kapsa = { x: CAM.x * K1[0] + K1[4] - 20, y: CAM.y * K1[3] + K1[5] - 20, w: CAM.w * K1[0] + 40, h: CAM.h * K1[3] + 40 };
    ayna.yerlestir(o.W, o.H, kapsa);
    const { ctx } = o;
    if (kopru < 0.999) arkaCiz(o, banyo, K);
    // ayna camı: kırp, yansımayı bas
    const M = dprli(K, o.dpr);
    ctx.save();
    ctx.setTransform(...M);
    ctx.beginPath();
    ctx.rect(CAM.x, CAM.y, CAM.w, CAM.h);
    ctx.clip();
    ayna.ciz(ctx, dprli(F, o.dpr), t);
    ctx.restore();
    if (kopru < 0.999) cizGercek(M);
  }

  // ---- Sahne 2 duruşları
  const damlalar = (() => {
    const d: { vx: number; vy: number; r: number }[] = [];
    for (let i = 0; i < 16; i++) {
      const a = -Math.PI / 2 + (((i * 0.61803) % 1) - 0.5) * 2.6;
      const h = 380 + ((i * 0.37) % 1) * 420;
      d.push({ vx: Math.cos(a) * h, vy: Math.sin(a) * h, r: 9 + (i % 3) * 4 });
    }
    return d;
  })();
  /** macun kulesinin boyu (0..1) ve bezelyeye inişi */
  const kuleBoyu = (t: number) => aralik(t, A2.macun + 0.3, A2.macun + 1.8) * (1 - aralik(t, A2.bezelye + 0.5, A2.bezelye + 1.0));
  const kuleVar = (t: number) => t > A2.macun + 0.3;

  function s2Kino(t: number): Durus {
    const d = yeniDurus();
    kino.o = BAN_O;
    kino.nokta = [kino.ortaX, kino.zemin];
    kino.don = 0;
    kino.x = KINO_YER[0];
    kino.y = KINO_YER[1];
    kino.gorunur = true;
    nefes(d, t, 0.33, 0.1);
    d.gozler = 'gozler-sola';
    // su çarpma (iki kez): lavaboya eğil, avuçla, yüze çarp
    for (const [bas, guc] of [[A2.sicrat1, 0.7], [A2.sicrat2, 1]] as const) {
      const in_ = aralik(t, bas, bas + 0.3) * (1 - aralik(t, bas + 0.3, bas + 0.5));
      const cik = aralik(t, bas + 0.3, bas + 0.45) * (1 - aralik(t, bas + 0.6, bas + 0.85));
      d.govdeA += -7 * in_;
      eliGotur(d, kino, 'sag', [300, 1230], in_);
      eliGotur(d, kino, 'sol', [760, 1330], in_);
      eliGotur(d, kino, 'sag', [560, 990], cik);
      eliGotur(d, kino, 'sol', [1010, 990], cik);
      if (cik > 0.2) {
        d.gozler = 'gozler-kapali';
        d.agiz = 'agiz-genis';
        d.kafaA += -5 * guc * cik;
        d.kafaY += -10 * cik;
      }
      if (in_ > 0.2) d.gozler = 'gozler-sola';
    }
    // havluyla kurulama: eller yanaklarda, ovalar
    const ku = aralik(t, A2.kurula, A2.kurula + 0.3) * (1 - aralik(t, A2.pofuduk - 0.1, A2.pofuduk + 0.2));
    if (ku > 0) {
      const o1 = 22 * Math.sin(t * 15), o2 = 22 * Math.sin(t * 15 + 2);
      eliGotur(d, kino, 'sag', [560, 980 + o1], ku);
      eliGotur(d, kino, 'sol', [1010, 980 + o2], ku);
      d.gozler = 'gozler-kapali';
      d.kafaA += 4 * Math.sin(t * 9) * ku;
    }
    // pofuduk: şaşkın göz, sonra güler
    if (t > A2.pofuduk && t < A2.macun) {
      d.gozler = t < A2.pofuduk + 0.7 ? 'gozler-saskin' : 'gozler-mutlu';
      d.kaslar = 'kaslar-kalkik';
      d.agiz = 'agiz-o';
    }
    // macun: tüp sağ elde (ekranın solu), fırça sol elde; eller göğüs önünde buluşur
    const mc = aralik(t, A2.macun - 0.4, A2.macun) * (1 - aralik(t, A2.koy + 0.2, A2.koy + 0.7));
    if (mc > 0) {
      eliGotur(d, kino, 'sag', [600, 1470], mc);
      eliGotur(d, kino, 'sol', [1060, 1440], mc);
      d.gozler = t > A2.bezelye ? 'gozler-saga' : 'gozler-sola';
      d.kafaA += -3 * mc;
      d.kafaY += 12 * mc;
      if (t > A2.macun + 0.4 && t < A2['s2-kino1']) d.kaslar = 'kaslar-kalkik';
      if (t > A2['s2-kino1'] - 0.2 && t < A2.bezelye) {
        d.kaslar = 'kaslar-uzgun';
        d.gozler = 'gozler-acik';
      }
    }
    if (t > A2.koy - 0.2 && t < A2.kopru) d.gozler = 'gozler-sola';
    // köprü: aynaya döner, fırçayı ağzına götürür
    const kp = aralik(t, A2.kopru, A2.kopru + 0.8);
    if (kp > 0) {
      kino.x += 110 * kp;
      d.govdeA += -5 * kp;
      d.kafaA += -6 * kp;
      d.gozler = 'gozler-sola';
      d.agiz = 'agiz-e';
      eliGotur(d, kino, 'sol', [960, 1060], kp);
    }
    sesAgzi(d, 'kino');
    kirp(d, t, 1);
    kuyrukSalla(d, t, 1.8, 10);
    return d;
  }

  /** dünya noktası → oyuncunun gövde karesi (kolCoz için) */
  const govdeKaresi = (a: Aktor, p: [number, number]): [number, number] => {
    a.k.hesapla();
    const gm = carp(a.dunya(), a.k.matris('govde'));
    const det = gm[0] * gm[3] - gm[1] * gm[2];
    const hx = p[0] - gm[4], hy = p[1] - gm[5];
    return [(gm[3] * hx - gm[2] * hy) / det, (-gm[1] * hx + gm[0] * hy) / det];
  };
  function s2Anne(t: number): Durus {
    const d = yeniDurus();
    anne.o = BAN_O;
    anne.x = ANNE2[0];
    anne.y = ANNE2[1];
    anne.gorunur = true;
    nefes(d, t, 0.27, 0.6);
    kucakDurusu(d);
    d.gozler = 'gozler-sola';
    // pofuduk Kino'ya gülümsemesini saklar: eli ağzına
    const sak = aralik(t, A2.pofuduk + 0.1, A2.pofuduk + 0.4) * (1 - aralik(t, A2.macun - 0.3, A2.macun));
    eliGotur(d, anne, 'sag', [960, 1020], sak);
    if (sak > 0.3) d.gozler = 'gozler-mutlu';
    // bezelye: sağ el (ekranın solu) fırçadaki fazla macunu alır; sonra cebinden kum saatini çıkarır, lavaboya koyar
    const bz = aralik(t, A2.bezelye - 0.1, A2.bezelye + 0.4) * (1 - aralik(t, A2.bezelye + 1.0, A2.cep + 0.1));
    const cep = aralik(t, A2.cep - 0.05, A2.cep + 0.3) * (1 - aralik(t, A2.cep + 0.45, A2.cep + 0.7));
    const koy = aralik(t, A2.cep + 0.5, A2.koy + 0.3) * (1 - aralik(t, A2.koy + 0.6, A2.koy + 1.1));
    d.govdeA += -10 * bz - 12 * koy;
    let hedef: [number, number] | null = null;
    if (bz > 0) hedef = kuleUcu();
    if (cep > 0) hedef = anne.dunyaNoktasi('kalca', [760, 2000]);
    if (koy > 0) hedef = [KUM_YER[0] + 20, KUM_YER[1] - 70];
    const g = Math.max(bz, cep, koy);
    if (hedef && g > 0) {
      anne.yaz(d);
      const kit = govdeKaresi(anne, hedef);
      eliGotur(d, anne, 'sag', [kit[0] + 20, kit[1] - 70], g);
      d.gozler = 'gozler-sola';
    }
    if (t > A2.koy + 0.6 && t < A2.kopru) d.gozler = 'gozler-mutlu';
    sesAgzi(d, 'anne', 0.7);
    kirp(d, t, 13);
    kuyrukSalla(d, t, 1.0, 6);
    return d;
  }
  function s2Lokum(t: number): Durus {
    const d = yeniDurus();
    nefes(d, t, 0.42, 0.2);
    lokumKucakta(d);
    d.gozler = 'gozler-sola';
    d.agiz = 'agiz-genis';
    // su sıçrayınca kıkırdar
    const k = t > A2.sicrat2 + 0.5 && t < A2['s2-lok1:son'] + 0.6;
    if (k) {
      d.gozler = 'gozler-mutlu';
      d.agiz = 'agiz-kahkaha';
      d.kalcaY -= 26 * Math.abs(Math.sin(t * 13));
      kolKaldir(d, 'sag', aralik(t, A2.sicrat2 + 0.5, A2.sicrat2 + 0.8), 110, 40);
    }
    if (t > A2.pofuduk && t < A2.pofuduk + 1.3) {
      d.gozler = 'gozler-mutlu';
      d.agiz = 'agiz-kahkaha';
    }
    // minik pembe fırçasıyla taklit: fırçayı burnuna sürer
    eliGotur(d, lokum, 'sol', [700 + 30 * Math.sin(t * 7), 760], 1);
    sesAgzi(d, 'lokum', 0.6);
    kirp(d, t, 7);
    kuyrukSalla(d, t, 2.2, 10);
    return d;
  }
  /** Lokum'un pembe fırçası (sol elde, başı burnunda) */
  const lokumFircasi = (lk: Aktor) => (ctx: CanvasRenderingContext2D, M: Matris) => {
    lk.k.hesapla();
    const el = carp(M, carp(lk.dunya(), lk.k.matris('el-sol')));
    ctx.save();
    ctx.setTransform(...el);
    ctx.translate(820, 1120);
    ctx.rotate(-2.3);
    ctx.scale(1, -1);
    firca(ctx, 300, '#f08bb0');
    ctx.restore();
  };

  /** Kino'nun fırçası sol elinde: başı (dünya) */
  const FIRCA_L = 420;
  const fircaBasi = (): [number, number] => {
    const y = kino.dunyaNoktasi('el-sol', [1284, 1690]);
    return [y[0] - FIRCA_L * BAN_O * 0.78, y[1] - 4];
  };
  const kuleUcu = (): [number, number] => {
    const p = fircaBasi();
    return [p[0], p[1] - 70 * BAN_O * 4];
  };

  function s2Ileri(t: number, dt: number) {
    anne.yaz(s2Anne(t));
    anne.adim(dt);
    kucagaOtur(anne, lokum);
    lokum.yaz(s2Lokum(t));
    lokum.adim(dt);
    kino.yaz(s2Kino(t));
    kino.adim(dt);
    ayna.giris = aralik(t, A2.kopru, A2.kopru + 1.1);
    ayna.kumGorunur = t > A2.koy;
    ayna.siritAyarla(aralik(t, A2.kopru + 0.6, A2.kopru + 1.5));
    ayna.adim(dt, b.saat());
  }

  /** Kino'nun elindeki eşyalar ve sahne efektleri (dünya biriminde) */
  function s2Esyalar(ctx: CanvasRenderingContext2D, M: Matris, t: number) {
    kino.k.hesapla();
    // havlu: omzunda; kurularken iki elin arasında (kısa bir çapraz geçişle)
    const ku = aralik(t, A2.kurula, A2.kurula + 0.3) * (1 - aralik(t, A2.pofuduk - 0.1, A2.pofuduk + 0.2));
    const elde = Math.max(0, Math.min(1, (ku - 0.25) / 0.45));
    if (elde > 0) {
      const a = kino.dunyaNoktasi('el-sag', [430, 1700]), b2 = kino.dunyaNoktasi('el-sol', [1280, 1700]);
      ctx.save();
      ctx.setTransform(...M);
      ctx.globalAlpha = elde;
      havlu(ctx, a, b2, 46, 2.6);
      ctx.restore();
    }
    if (elde < 1) {
      const g = carp(M, carp(kino.dunya(), kino.k.matris('govde')));
      ctx.save();
      ctx.setTransform(...g);
      ctx.globalAlpha = 1 - elde;
      ctx.beginPath();
      ctx.moveTo(1000, 1070);
      ctx.quadraticCurveTo(1110, 1020, 1185, 1110);
      ctx.lineTo(1160, 1400);
      ctx.quadraticCurveTo(1095, 1440, 1035, 1400);
      ctx.closePath();
      ctx.fillStyle = '#62b56a';
      ctx.fill();
      ctx.lineWidth = 8.5;
      ctx.strokeStyle = KONTUR;
      ctx.stroke();
      ctx.strokeStyle = '#f2e7b8';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(1050, 1360);
      ctx.lineTo(1150, 1366);
      ctx.stroke();
      ctx.restore();
    }
    // fırça sol elde (ekranın sağı): dünyada yatay, başı sola (lavaboya doğru), kıllar yukarı; el sapın önünde
    const bas = fircaBasi();
    ctx.save();
    ctx.setTransform(...M);
    ctx.translate(bas[0], bas[1]);
    ctx.rotate(-0.12);
    firca(ctx, FIRCA_L * BAN_O, '#5fb85a');
    if (kuleVar(t)) {
      ctx.translate(0, -FIRCA_L * BAN_O * 0.17);
      macun(ctx, 24 * (0.55 + 0.45 * kuleBoyu(t)), kuleBoyu(t));
    }
    ctx.restore();
    kino.ciz(ctx, M, { yalniz: ['el-sol'] });
    // macun tüpü: lavabonun kenarında durur; macun anında sağ ele (ekranın solu) gelir, ağzı fırçaya dönük
    const mc = aralik(t, A2.macun - 0.4, A2.macun) * (1 - aralik(t, A2.bezelye - 0.2, A2.bezelye + 0.3));
    const yer: [number, number] = [455, 895];
    const el = kino.dunyaNoktasi('el-sag', [440, 1700]);
    ctx.save();
    ctx.setTransform(...M);
    ctx.translate(yer[0] + (el[0] + 24 - yer[0]) * mc, yer[1] + (el[1] - 8 - yer[1]) * mc - Math.sin(Math.PI * mc) * 40);
    ctx.rotate(-0.15 * mc);
    tup(ctx, 300 * BAN_O, aralik(t, A2.macun + 0.3, A2.macun + 1.6));
    ctx.restore();
    if (mc > 0.5) kino.ciz(ctx, M, { yalniz: ['el-sag'] });
    // bezelye balonu (resimle bilgi): fırçanın üstünde
    const bb = aralik(t, A2.bezelye + 0.9, A2.bezelye + 1.3) * (1 - aralik(t, A2.koy, A2.koy + 0.4));
    if (bb > 0) {
      const p = fircaBasi();
      ctx.setTransform(...M);
      ctx.translate(p[0] - 120, p[1] - 70);
      bezelyeBalonu(ctx, 52, tasan(bb, 1.4));
    }
    // su damlaları
    ctx.setTransform(...M);
    for (const [bas, guc] of [[A2.sicrat1, 0.7], [A2.sicrat2, 1]] as const) {
      const x = t - bas - 0.42;
      if (x < 0 || x > 1.1) continue;
      const yuz = kino.dunyaNoktasi('kafa', [712, 940]);
      for (const dm of damlalar) {
        const px = yuz[0] + dm.vx * x * guc - 40, py = yuz[1] + dm.vy * x * guc + 0.5 * 1800 * x * x;
        ctx.save();
        ctx.globalAlpha = Math.min(1, (1.1 - x) * 3);
        ctx.translate(px, py);
        ctx.rotate(Math.atan2(dm.vy + 1800 * x, dm.vx) + Math.PI / 2);
        damla(ctx, dm.r * guc);
        ctx.restore();
      }
    }
    // pofuduk: yanaklarda ve tepede kabarık tüy tutamları (beyaz, kontürlü, sivri)
    const pf = aralik(t, A2.pofuduk - 0.05, A2.pofuduk + 0.12) * (1 - aralik(t, A2.macun + 0.4, A2.macun + 1.4));
    if (pf > 0) {
      const kafa = carp(M, carp(kino.dunya(), kino.k.matris('kafa')));
      ctx.save();
      ctx.setTransform(...kafa);
      const tutam = (x: number, y: number, aci: number, boy: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(aci);
        ctx.scale(pf, pf);
        ctx.beginPath();
        ctx.moveTo(-34, 10);
        ctx.quadraticCurveTo(-26, -boy * 0.6, 0, -boy);
        ctx.quadraticCurveTo(8, -boy * 0.5, 14, -boy * 0.62);
        ctx.quadraticCurveTo(30, -boy * 0.35, 34, 10);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.lineWidth = 8.5;
        ctx.strokeStyle = KONTUR;
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.restore();
      };
      // yanaklar (yüzün iki yanı) ve tepe
      tutam(470, 900, -1.9, 70);
      tutam(470, 980, -2.2, 62);
      tutam(980, 900, 1.9, 70);
      tutam(985, 975, 2.2, 60);
      tutam(700, 300, -0.25, 80);
      tutam(790, 290, 0.1, 92);
      tutam(880, 300, 0.4, 76);
      ctx.restore();
    }
  }

  /** kum saati: Anne'nin cebinden çıkar, lavabonun kenarına konur (Kino'nun arkasında kalır) */
  function kumSaatiCiz(ctx: CanvasRenderingContext2D, M: Matris, t: number) {
    if (t <= A2.cep + 0.3) return;
    ctx.save();
    ctx.setTransform(...M);
    const kon = aralik(t, A2.koy + 0.05, A2.koy + 0.35);
    let x = KUM_YER[0], y = KUM_YER[1];
    if (kon < 1) {
      const e = anne.dunyaNoktasi('el-sag', [652, 2080]);
      x = e[0] + (x - e[0]) * kon;
      y = e[1] + 50 + (y - e[1] - 50) * kon;
    }
    ctx.translate(x, y);
    const g = Math.min(1, (t - A2.cep - 0.3) / 0.25);
    ctx.scale(g, g);
    kumSaati(ctx, 62, 84, ayna.kum, false, t);
    ctx.restore();
  }

  function s2GercekCiz(M: Matris, t: number, ctx: CanvasRenderingContext2D) {
    kucakCiz(ctx, M, anne, lokum, lokumFircasi(lokum));
    kumSaatiCiz(ctx, M, t);
    ctx.setTransform(...M);
    ctx.save();
    ctx.translate(TABURE[0], TABURE[1]);
    tabure(ctx, 270, 125);
    ctx.restore();
    kino.ciz(ctx, M);
    s2Esyalar(ctx, M, t);
  }

  const s2aKamera = (t: number, o: Ortam) => kameraYolu(kam2, t, o.dikey);
  const s2a = new HikayeParcasi(
    'sahne2-lavabo',
    S2A_SURE,
    a2.olaylar,
    b,
    s2Ileri,
    (t, o) => {
      const kp = Math.max(0, Math.min(1, (t - A2.kopru - 0.2) / (KOPRU_SURE - 0.2)));
      banyoCiz(o, s2aKamera(t, o), kp, b.saat(), (M) => s2GercekCiz(M, t, o.ctx));
    },
    (t) => 1 - Math.min(1, t / 0.9),
    () => {
      ayna.evre = 'once';
    },
  );

  // ================================================================ OYUN 1 · Kum Saati
  let simParmak: Parmak = { bas: false, x: 0, y: 0 };
  const oyun: Segment = {
    ad: 'oyun1-kum-saati',
    basla() {
      ayna.giris = 1;
      ayna.siritAyarla(1);
      ayna.basla();
    },
    adim(_t, dt, o) {
      if (b.simule) {
        simParmak = sanalParmak(ayna.ot, ayna.kopukF(), ayna, o);
        ayna.parmak = simParmak;
      }
      ayna.adim(dt, b.saat());
      return ayna.bitti;
    },
    ciz(_t, o) {
      banyoCiz(o, s2aKamera(S2A_SURE, o), 1, b.saat(), () => undefined);
      if (b.simule && simParmak.bas && ayna.evre === 'oyun') parmakCiz(o, simParmak);
    },
    dokun(tur, x, y) {
      if (!b.simule) ayna.dokun(tur, x, y);
    },
  };

  // ================================================================ SAHNE 2 · dönüş
  const a3 = new Akis(b.sozler);
  a3.bekle(0.6).muzik('film-merak', 0.3, 0.6).isaret('iii').bekle(1.6).soz('s2-lok2', 0.3).efekt('kikir', -0.2);
  a3.soz('s2-anl2', 0.3);
  a3.soz('s2-anne3', 0.3).efekt('kikir', 0.2);
  a3.bekle(0.8).muzikSon(0.2).isaret('son').bekle(1.2);
  const A3 = a3.an;
  const S2B_SURE = a3.t;
  function s2bIleri(t: number, dt: number) {
    // gerçek dünya: Kino aynanın önünde, "Iii"; Lokum taklit eder; Anne güler
    const da = yeniDurus();
    anne.o = BAN_O;
    anne.x = ANNE2[0];
    anne.y = ANNE2[1];
    nefes(da, t, 0.27, 0.6);
    kucakDurusu(da);
    da.gozler = t > A3['s2-anne3'] ? 'gozler-mutlu' : 'gozler-sola';
    if (t > A3['s2-anne3:son'] - 0.3) {
      da.agiz = 'agiz-kahkaha';
      da.kafaA = -3;
    }
    sesAgzi(da, 'anne', 0.7);
    kirp(da, t, 13);
    anne.yaz(da);
    anne.adim(dt);
    kucagaOtur(anne, lokum);
    const dl = yeniDurus();
    nefes(dl, t, 0.42, 0.2);
    lokumKucakta(dl);
    dl.gozler = 'gozler-sola';
    // Lokum da "Iii" yapar: iki minik dişini gösterir
    dl.agiz = t > A3['s2-lok2'] - 0.1 && t < A3['s2-lok2:son'] + 0.8 ? 'agiz-e' : 'agiz-genis';
    if (t > A3['s2-lok2:son'] + 0.8) {
      dl.gozler = 'gozler-mutlu';
      dl.agiz = 'agiz-kahkaha';
    }
    eliGotur(dl, lokum, 'sol', [760, 900], 1);
    kirp(dl, t, 7);
    kuyrukSalla(dl, t, 2.4, 12);
    lokum.yaz(dl);
    lokum.adim(dt);
    const d = yeniDurus();
    kino.o = BAN_O;
    kino.x = KINO_YER[0] + 110;
    kino.y = KINO_YER[1];
    nefes(d, t, 0.33);
    d.govdeA = -6;
    d.kafaA = -6 + 3 * Math.sin(t * 2);
    d.agiz = 'agiz-e';
    d.gozler = t > A3.iii + 1 ? 'gozler-mutlu' : 'gozler-sola';
    d.kaslar = 'kaslar-kalkik';
    d.kolSol = 40;
    d.dirsekSol = 30;
    kirp(d, t, 1);
    kuyrukSalla(d, t, 3.2, 22);
    kino.yaz(d);
    kino.adim(dt);
    ayna.evre = 'sonra';
    ayna.adim(dt, b.saat());
  }
  const s2b = new HikayeParcasi(
    'sahne2-donus',
    S2B_SURE,
    a3.olaylar,
    b,
    s2bIleri,
    (t, o) => {
      const kp = 1 - Math.min(1, t / 2.4);
      banyoCiz(o, s2aKamera(S2A_SURE, o), kp, b.saat(), (M) => s2GercekCiz(M, A2.kopru + 0.81, o.ctx));
    },
    (t) => aralik(t, S2B_SURE - 1.1, S2B_SURE),
  );

  const parcalar = [s1, s2a, oyun, s2b];
  let yukleniyor: Promise<void> | null = null;
  return {
    parcalar,
    ayna,
    anBaslangic: { i: 1, t: Math.max(0, A2.cep - 1.5) },
    /** bütün görselleri yükler ve çözer (bir kez; kapak ekranındayken başlar, oynatırken bekleme olmasın) */
    yukle() {
      yukleniyor ??= (async () => {
        const [o, oy, ok, bn, by] = await Promise.all(['oda-sabah', 'oda-sabah-yorgan', 'oda-sabah-karyola', 'banyo-sabah', 'banyo-sabah-yumusak'].map((a) => resim(mekan(a))));
        oda = { img: o, ust: [0, 80], alt: [1440, 1536] };
        banyo = { img: bn, ust: [165, 348], alt: [1500, 1536] };
        yorgan = oy;
        karyola = ok;
        ayna.yansima = by;
        await Promise.all([kino, anne, lokum, kinoA, anneA, lokumA].map((a) => a.yukle()));
      })();
      return yukleniyor;
    },
    kopukEkran() {
      return ayna.evre === 'oyun' ? ayna.kopukF() : null;
    },
  };
}

// ---------------------------------------------------------------- kayıt: sanal oyuncu
/**
 * MP4/WebM tanıtım kaydında oyunu bir çocuk oynar gibi: önce bekler (köpük parlar), parmağını köpüğe koyup peşinden
 * gider, bir ara parmak buruna kayar (hapşırık), bırakır (köpük bekler), yeniden bulur ve bitirir.
 */
function sanalParmak(ot: number, kopuk: [number, number], a: AynaSahnesi, o: Ortam): Parmak {
  const gecikme = (x: number) => Math.sin(x * 2.3) * a.r * 0.25;
  const p: Parmak = { bas: false, x: kopuk[0] + a.r * 0.15 + gecikme(ot), y: kopuk[1] + a.r * 0.2 + gecikme(ot + 1) };
  void o;
  if (ot < 2.4) return { bas: false, x: p.x + 80, y: p.y + 120 };
  if (ot < 7.6) return { ...p, bas: true };
  if (ot < 8.2) {
    const burun = a.kino.dunyaNoktasi('kafa', [723, 790]);
    return { bas: ot > 7.85, x: burun[0], y: burun[1] };
  }
  if (ot < 10.4) return { bas: false, x: p.x, y: p.y };
  return { ...p, bas: true };
}
function parmakCiz(o: Ortam, p: Parmak) {
  const { ctx, dpr } = o;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.beginPath();
  ctx.arc(p.x, p.y, 22, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(64,19,18,0.55)';
  ctx.stroke();
}
