// Deneyler · Zincirleme Top Parkuru: bölümler (yönetici 23 Kasım gecesi, Barış: "uzat, ikinci bölüm ekle"). Her bölüm yeni bir
// parçayla gelir, kolaydan zora; sonda bütün parçaların sırayla çalıştığı "mega zincir". Ölçüler fon pikseli; Astra'nın
// Paket Deney-A1 brief'iyle birebir (CLAUDE-ASTRA-MESAJLAR.md). Her çağrı yeni mekanizma örnekleri verir (durum taşırlar).
// Her yerleşir parça gerçekten gereklidir: yokken top kaçar (birim testi: tests/unit/deney-parkur-bolumler.test.ts).
//  1 · Trambolin (Deney-Y1'in onaylı sahnesi): rampa, trambolin, huni.
//  2 · Kaykay: kaykay topu taşır, takoza çarpıp durur; top eylemsizlikle iki masa arasındaki boşluğun üstünden uçar.
//  3 · Yay ve pota: yay topu potaya fırlatır; germe az olursa yetişmez. Pota direğin solunda, ağı direğin altından sağa.
//  4 · Su değirmeni: top musluğun kolunu devirir, su oluktan çarka akar, kova topu tepeye taşır, kanal teknenin üstünden iner.
//  5 · Körük ve balon: top kutunun üstündeki körüğe basar, hava hortumdan balona gider, şişen balon ilk dominoyu iter.
//  6 · Mega zincir: hepsi bir arada, iki ekran genişliğinde; sonunda çan kulesi (mega.ts).
import { n, TOP_R, type BolumTanimi, type Dogru, type Dunya, type Kutu, type Mekanizma, type Nokta, type Top, type Yas } from './motor';
import { Degirmen, Huni, Kaykay, Koruk, Musluk, Trambolin, Yay, YuzeyParca } from './mekanizmalar';

const R = TOP_R;
export const FON = { w: 1672, h: 941 } as const;
export const ZEMIN_Y = 690;
const K = (x: number, y: number, w: number, h: number): Kutu => ({ x, y, w, h });

/** Ortak başlangıç kulesi (her bölümün fonunda solda; kırmızı kol önünde). */
export const KULE = {
  platform: [n(80, 300), n(170, 300)] as Dogru,
  rampa: [n(170, 300), n(430, 350)] as Dogru,
  topBasi: n(128, 300 - R),
  itis: 170,
  kol: { taban: K(40, 410, 140, 160), pivot: n(110, 520), sap: { w: 140, h: 200, pivot: n(70, 190) }, aci: 55 },
} as const;
/** Ortak bitiş: dominolar (bölüme göre üç ya da dört) ve masa zili. */
export const DOMINO = { w: 44, h: 140, renkler: ['kirmizi', 'sari', 'yesil', 'mavi'] } as const;
const DORT_DOMINO = [1180, 1270, 1360, 1450] as const;
const UC_DOMINO = [1270, 1360, 1450] as const;
export const ZIL = { kutu: K(1485, ZEMIN_Y - 108, 150, 110), dugme: n(1560, 592) };
const masa = (x0: number, x1: number): Dogru => [n(x0, ZEMIN_Y), n(x1, ZEMIN_Y)];
const dominolar = (ortalar: readonly number[]) => ({ ortalar, w: DOMINO.w, h: DOMINO.h, zeminY: ZEMIN_Y });
const zil = { tur: 'zil' as const, dugme: ZIL.dugme, kutu: ZIL.kutu };

export type ParcaBilgi = {
  /** Mekanizma kimliği (motor). */
  id: string;
  /** Çizim adı (assets/deney/parkur/<cizim>.webp) ve yerdeki kutusu. */
  cizim: string;
  kutu: Kutu;
  /** Çocuğun koyabileceği parça mı (çekmecede durur)? Sabit parça hep yerinde. */
  yerlesir: boolean;
};
export type Bolum = BolumTanimi & {
  ad: string;
  /** Bölümün yeni parçası (haritadaki durak simgesi). */
  yeni: string;
  fon: string;
  parcalar: readonly ParcaBilgi[];
  /** Yaşa göre çekmecedeki (eksik) parçalar; kalan yerleşir parçalar yerinde gelir. */
  eksik: Record<Yas, readonly string[]>;
  /** 3. bölüm: yayın başlangıç germesi yaşa göre (5+ yaşta az: çocuk ayarlar). */
  yayGucu?: Record<Yas, 1 | 2 | 3>;
};

// ----- 1 · Trambolin (Deney-Y1, onaylı çizimler) -----
function bolum1(): Bolum {
  const huni = new Huni('huni', K(920, 388, 230, 302), { y: 400, sol: 935, sag: 1105 }, { y: 560, sol: 978, sag: 1062 }, [n(985, 590), n(1135, 650)], [n(975, 600), n(975, 690)]);
  const tram = new Trambolin('trambolin', K(690, 602, 240, 90), [n(705, 622), n(915, 622)], [[n(698, 626), n(698, 690)], [n(922, 626), n(922, 690)]], n((935 + 1105) / 2, 400 - 8), 0.9);
  const rampa = new YuzeyParca('rampa', K(440, 360, 240, 330), [[n(450, 372), n(650, 412)]]);
  return {
    no: 1, ad: 'Trambolin', yeni: 'trambolin', fon: 'parkur-fon',
    dunya: FON, zeminY: ZEMIN_Y, topBasi: KULE.topBasi, itis: KULE.itis,
    sabit: [KULE.platform, KULE.rampa], masalar: [masa(-200, FON.w + 200)], dusmeY: 2000,
    mekanizmalar: [rampa, huni, tram],
    parcalar: [
      { id: 'rampa', cizim: 'parca-rampa', kutu: rampa.kutu, yerlesir: true },
      { id: 'huni', cizim: 'parca-huni', kutu: huni.kutu, yerlesir: true },
      { id: 'trambolin', cizim: 'parca-trambolin', kutu: tram.kutu, yerlesir: true },
    ],
    eksik: { minik: ['rampa'], dort: ['rampa', 'trambolin'], bes: ['rampa', 'huni', 'trambolin'] },
    dominolar: dominolar(DORT_DOMINO), final: zil,
  };
}

// ----- 2 · Kaykay: iki masa, aralarında boşluk (x 1100…1200); karşı masada üç domino ve zil -----
export const B2 = {
  masaA: 1100, masaB: 1200,
  rampa: { kutu: K(440, 356, 280, 210), yuzey: [n(448, 366), n(700, 560)] as Dogru },
  kaykay: { kutu: K(700, 600, 200, 90), guverte: { y: 642, sol: 12, sag: 188 } },
  takoz: { kutu: K(1040, 630, 56, 60), yuzey: [[n(1042, 690), n(1042, 640)], [n(1042, 640), n(1094, 640)]] as Dogru[] },
  ucus: { hedef: n(1228, 640), sure: 0.5 },
};
function bolum2(): Bolum {
  const rampa = new YuzeyParca('rampa', B2.rampa.kutu, [B2.rampa.yuzey]);
  const takoz = new YuzeyParca('takoz', B2.takoz.kutu, B2.takoz.yuzey);
  const kaykay = new Kaykay('kaykay', B2.kaykay.kutu, B2.kaykay.guverte, { id: 'takoz', x: 1042 }, B2.masaA, B2.ucus);
  return {
    no: 2, ad: 'Kaykay', yeni: 'kaykay', fon: 'parkur-fon-2',
    dunya: FON, zeminY: ZEMIN_Y, topBasi: KULE.topBasi, itis: KULE.itis,
    sabit: [KULE.platform, KULE.rampa, [n(B2.masaA, ZEMIN_Y), n(B2.masaA, ZEMIN_Y + 200)], [n(B2.masaB, ZEMIN_Y), n(B2.masaB, ZEMIN_Y + 200)]],
    masalar: [masa(-200, B2.masaA), masa(B2.masaB, FON.w + 200)], dusmeY: 840,
    mekanizmalar: [rampa, takoz, kaykay],
    parcalar: [
      { id: 'rampa', cizim: 'k2-rampa', kutu: rampa.kutu, yerlesir: true },
      { id: 'kaykay', cizim: 'k2-kaykay', kutu: B2.kaykay.kutu, yerlesir: true },
      { id: 'takoz', cizim: 'k2-takoz', kutu: takoz.kutu, yerlesir: true },
    ],
    eksik: { minik: ['kaykay'], dort: ['rampa', 'kaykay'], bes: ['rampa', 'kaykay', 'takoz'] },
    dominolar: dominolar(UC_DOMINO), final: zil,
  };
}

// ----- 3 · Yay ve pota -----
export const B3 = {
  /** İki eğimli rampa: önce yatık, sonra kabın soluna dik iner (top kaba düşer). */
  rampa: { kutu: K(440, 356, 360, 170), yuzey: [n(448, 366), n(700, 438)] as Dogru, dik: [n(700, 438), n(772, 492)] as Dogru },
  yay: { kutu: K(740, 470, 170, 220), kap: { sol: 792, sag: 852, dip: 545 } },
  /** Pota: çember x 920…1020 (y 372); direk ve pano x 1050 (y 120…690). Ağ direğin altından sağa, kanalın başına. */
  pota: { kutu: K(890, 120, 200, 400), cember: { sol: 920, sag: 1020, y: 372 }, direk: [n(1050, 120), n(1050, 690)] as Dogru, ag: n(970, 440), cikis: n(1090, 480) },
  kanal: { kutu: K(1060, 470, 200, 220), yuzey: [n(1070, 500), n(1238, 648)] as Dogru },
  /** Yüksek kavis: top çembere yukarıdan iner (orta germe). */
  hedef: n(970, 380), sure: 0.95,
};
/** Pota: çemberin içinden inen top ağdan süzülür, direğin altından sağa geçer (0,5 sn), kanala bırakılır. */
export class Pota implements Mekanizma {
  private u: { t: number; x0: number; y0: number } | null = null;
  constructor(readonly id: string, readonly kutu: Kutu) {}
  protected cember() { return B3.pota.cember; }
  protected yol() { return { ag: B3.pota.ag, cikis: B3.pota.cikis }; }
  yuzeyler(): readonly Dogru[] {
    const c = B3.pota.cember;
    // Çemberin iki ucu (topa çarpan küçük kenarlar).
    return [[n(c.sol - 6, c.y), n(c.sol, c.y)], [n(c.sag, c.y), n(c.sag + 6, c.y)]];
  }
  yakala(t: Top, oncekiY: number, d: Dunya) {
    const c = this.cember();
    if (!this.u && t.vy > 0 && t.x > c.sol + 4 && t.x < c.sag - 4 && oncekiY <= c.y && t.y >= c.y) {
      this.u = { t: 0, x0: t.x, y0: t.y };
      d.olay({ tur: 'pota' });
      return true;
    }
    return false;
  }
  tasi(t: Top, h: number) {
    const u = this.u!, { ag: a, cikis: c } = this.yol();
    u.t += h;
    const s = Math.min(1, u.t / 0.5);
    // Önce ağdan aşağı (yarı süre), sonra direğin altından çıkışa.
    if (s < 0.5) { const k = s / 0.5; t.x = u.x0 + (a.x - u.x0) * k; t.y = u.y0 + (a.y - u.y0) * k; }
    else { const k = (s - 0.5) / 0.5; t.x = a.x + (c.x - a.x) * k; t.y = a.y + (c.y - a.y) * k; }
    t.olcek = 1 - 0.1 * Math.sin(s * Math.PI);
    t.vx = 0; t.vy = 0;
    if (s < 1) return false;
    t.olcek = 1;
    t.vx = 90;
    t.vy = 60;
    this.u = null;
    return true;
  }
  mesgul() { return !!this.u; }
  sifirla() { this.u = null; }
}
function bolum3(): Bolum {
  const rampa = new YuzeyParca('rampa', B3.rampa.kutu, [B3.rampa.yuzey, B3.rampa.dik]);
  const yay = new Yay('yay', B3.yay.kutu, B3.yay.kap, B3.hedef, B3.sure);
  const pota = new Pota('pota', B3.pota.kutu);
  const kanal = new YuzeyParca('kanal', B3.kanal.kutu, [B3.kanal.yuzey]);
  return {
    no: 3, ad: 'Yay', yeni: 'yay', fon: 'parkur-fon-3',
    dunya: FON, zeminY: ZEMIN_Y, topBasi: KULE.topBasi, itis: KULE.itis,
    sabit: [KULE.platform, KULE.rampa, B3.pota.direk], masalar: [masa(-200, FON.w + 200)], dusmeY: 2000,
    mekanizmalar: [rampa, yay, pota, kanal],
    parcalar: [
      { id: 'rampa', cizim: 'k3-rampa', kutu: rampa.kutu, yerlesir: true },
      { id: 'yay', cizim: 'k3-yay', kutu: B3.yay.kutu, yerlesir: true },
      { id: 'pota', cizim: 'k3-pota', kutu: B3.pota.kutu, yerlesir: true },
      { id: 'kanal', cizim: 'k3-kanal', kutu: B3.kanal.kutu, yerlesir: false },
    ],
    eksik: { minik: ['yay'], dort: ['rampa', 'yay'], bes: ['rampa', 'yay', 'pota'] },
    yayGucu: { minik: 2, dort: 2, bes: 1 },
    dominolar: dominolar(UC_DOMINO), final: zil,
  };
}

// ----- 4 · Su değirmeni -----
export const B4 = {
  /** Masadaki kâse (fonda): rampa yokken kuleden düşen top içine düşer, kalır. */
  kase: [[n(604, 690), n(616, 640)], [n(756, 690), n(744, 640)]] as Dogru[],
  /** Uzun rampa: kuleden kâsenin üstünden masaya. */
  rampa: { kutu: K(440, 356, 400, 330), yuzey: [n(448, 366), n(800, 610)] as Dogru, alt: [n(800, 610), n(830, 680)] as Dogru },
  /** Musluk kolu masada (top çarpınca devrilir). Depo ve musluk fonda, sağda yukarıda (x 1150…1350, y 80…250). */
  musluk: { kutu: K(846, 590, 50, 100), kol: [n(870, 690), n(870, 600)] as Dogru },
  /** Oluk: musluğun ağzından (1180, 255) çarkın sağ kanatlarına (1175, 440). */
  oluk: { kutu: K(1120, 230, 170, 250) },
  degirmen: { kutu: K(820, 325, 380, 380), merkez: n(1010, 515), yaricap: 172, kova: 6 },
  /** Su teknesi (fonda): çarkın sağ altında, x 1080…1225; düşen topu tutar. */
  tekne: [[n(1070, 690), n(1070, 560)], [n(1235, 690), n(1235, 585)]] as Dogru[],
  /** Çarkın tepesinden teknenin üstünden dominolara inen kanal. */
  kanal: { kutu: K(1030, 310, 240, 340), yuzey: [n(1048, 338), n(1238, 560)] as Dogru, inis: [n(1238, 560), n(1250, 640)] as Dogru },
};
function bolum4(): Bolum {
  const rampa = new YuzeyParca('rampa', B4.rampa.kutu, [B4.rampa.yuzey, B4.rampa.alt]);
  const musluk = new Musluk('musluk', B4.musluk.kutu, B4.musluk.kol, 'oluk');
  const oluk = new YuzeyParca('oluk', B4.oluk.kutu, []);
  const degirmen = new Degirmen('degirmen', B4.degirmen.kutu, B4.degirmen.merkez, B4.degirmen.yaricap, B4.degirmen.kova, musluk, { aci: -Math.PI / 2 + 0.45, vx: 190, vy: -60 }, 2.1);
  const kanal = new YuzeyParca('kanal', B4.kanal.kutu, [B4.kanal.yuzey, B4.kanal.inis]);
  return {
    no: 4, ad: 'Su değirmeni', yeni: 'degirmen', fon: 'parkur-fon-4',
    dunya: FON, zeminY: ZEMIN_Y, topBasi: KULE.topBasi, itis: KULE.itis,
    sabit: [KULE.platform, KULE.rampa, ...B4.kase, ...B4.tekne], masalar: [masa(-200, FON.w + 200)], dusmeY: 2000,
    mekanizmalar: [rampa, musluk, oluk, degirmen, kanal],
    parcalar: [
      { id: 'rampa', cizim: 'k4-rampa', kutu: rampa.kutu, yerlesir: true },
      { id: 'oluk', cizim: 'k4-oluk', kutu: oluk.kutu, yerlesir: true },
      { id: 'kanal', cizim: 'k4-kanal', kutu: kanal.kutu, yerlesir: true },
      { id: 'musluk', cizim: 'k4-musluk-kol', kutu: musluk.kutu, yerlesir: false },
      { id: 'degirmen', cizim: 'k4-cark', kutu: degirmen.kutu, yerlesir: false },
    ],
    eksik: { minik: ['oluk'], dort: ['rampa', 'oluk'], bes: ['rampa', 'oluk', 'kanal'] },
    dominolar: dominolar(UC_DOMINO), final: zil,
  };
}

// ----- 5 · Körük ve balon -----
export const B5 = {
  /** Körük bir sandığın üstünde (sandık x 700…900, üstü y 520); rampa kuleden sandığa iner. */
  sandik: [[n(702, 520), n(702, ZEMIN_Y)], [n(702, 520), n(720, 520)]] as Dogru[],
  rampa: { kutu: K(440, 356, 290, 180), yuzey: [n(448, 366), n(712, 520)] as Dogru },
  koruk: { kutu: K(700, 430, 220, 260), pedal: [n(720, 520), n(880, 520)] as Dogru, duvar: [n(892, 430), n(892, 520)] as Dogru },
  /** Hortum: körükten balonun ağzına (sandığın yanından aşağı, yerde). */
  hortum: { kutu: K(870, 560, 250, 130) },
  /** Balon direğe bağlı; ortası (1085, 600), tam şişince yarıçap 75 (ilk dominoya değer). */
  balon: { kutu: K(990, 480, 190, 210), orta: n(1085, 600), yaricap: 75 },
};
function bolum5(): Bolum {
  const rampa = new YuzeyParca('rampa', B5.rampa.kutu, [B5.rampa.yuzey]);
  const koruk = new Koruk('koruk', B5.koruk.kutu, B5.koruk.pedal, B5.koruk.duvar, 'hortum', 'balon');
  const hortum = new YuzeyParca('hortum', B5.hortum.kutu, []);
  const balon = new YuzeyParca('balon', B5.balon.kutu, []);
  return {
    no: 5, ad: 'Balon', yeni: 'balon', fon: 'parkur-fon-5',
    dunya: FON, zeminY: ZEMIN_Y, topBasi: KULE.topBasi, itis: KULE.itis,
    sabit: [KULE.platform, KULE.rampa, ...B5.sandik], masalar: [masa(-200, FON.w + 200)], dusmeY: 2000,
    mekanizmalar: [rampa, koruk, hortum, balon],
    parcalar: [
      { id: 'rampa', cizim: 'k5-rampa', kutu: rampa.kutu, yerlesir: true },
      { id: 'hortum', cizim: 'k5-hortum', kutu: hortum.kutu, yerlesir: true },
      { id: 'balon', cizim: 'k5-balon', kutu: balon.kutu, yerlesir: true },
      { id: 'koruk', cizim: 'k5-koruk', kutu: koruk.kutu, yerlesir: false },
    ],
    eksik: { minik: ['hortum'], dort: ['rampa', 'hortum'], bes: ['rampa', 'hortum', 'balon'] },
    dominolar: dominolar(DORT_DOMINO), final: zil,
  };
}

// ----- 6 · Mega zincir (iki ekran: 3344 × 941; fon iki yarı: mega-fon-1, mega-fon-2) -----
// Kule → rampa → trambolin → huni → uzun kanal → kaykay (uzun yolculuk) → takoz: top boşluğun üstünden potaya uçar → ağ, kanal →
// körüğün pedalı → balon şişer → dört domino → çan kulesi.
export const B6 = {
  dunya: { w: 3344, h: 941 },
  masaA: 1760, masaB: 1860,
  /** Huninin uzun kanalı: kaykayın güvertesinin üstüne bırakır. */
  huniKanal: [n(985, 590), n(1190, 612)] as Dogru,
  kaykay: { kutu: K(1200, 600, 200, 90), guverte: { y: 642, sol: 12, sag: 188 } },
  takoz: { kutu: K(1700, 630, 56, 60), yuzey: [[n(1702, 690), n(1702, 640)], [n(1702, 640), n(1754, 640)]] as Dogru[] },
  /** Kaykay durunca top potaya uçar: çember x 1900…2000 (y 470), direk x 2030. */
  pota: { kutu: K(1870, 220, 200, 400), cember: { sol: 1900, sag: 2000, y: 470 }, direk: [n(2030, 220), n(2030, 690)] as Dogru, ag: n(1950, 540), cikis: n(2072, 580) },
  ucus: { hedef: n(1950, 480), sure: 0.72 },
  potaKanal: { kutu: K(2040, 560, 200, 130), yuzey: [n(2050, 600), n(2210, 668)] as Dogru },
  koruk: { kutu: K(2250, 560, 200, 130), pedal: [n(2262, 690), n(2400, 690)] as Dogru, duvar: [n(2412, 600), n(2412, 690)] as Dogru },
  hortum: { kutu: K(2380, 600, 200, 90) },
  balon: { kutu: K(2460, 480, 190, 210), orta: n(2555, 600), yaricap: 75 },
  dominolar: [2650, 2740, 2830, 2920],
  can: { kutu: K(2960, 70, 340, 620), dugme: n(3030, 592) },
};
/** Mega zincirin potası (bölüm 3'ün potasıyla aynı iş, kendi yerinde). */
class MegaPota extends Pota {
  override yuzeyler(): readonly Dogru[] { const c = B6.pota.cember; return [[n(c.sol - 6, c.y), n(c.sol, c.y)], [n(c.sag, c.y), n(c.sag + 6, c.y)]]; }
  protected override cember() { return B6.pota.cember; }
  protected override yol() { return { ag: B6.pota.ag, cikis: B6.pota.cikis }; }
}
function bolum6(): Bolum {
  const b1 = bolum1();
  const rampa = b1.mekanizmalar[0] as YuzeyParca;
  const h0 = b1.mekanizmalar[1] as Huni;
  const huni = new Huni('huni', h0.kutu, h0.agiz, h0.cikis, B6.huniKanal, h0.ayak);
  const tram = b1.mekanizmalar[2] as Trambolin;
  const takoz = new YuzeyParca('takoz', B6.takoz.kutu, B6.takoz.yuzey);
  const kaykay = new Kaykay('kaykay', B6.kaykay.kutu, B6.kaykay.guverte, { id: 'takoz', x: 1702 }, B6.masaA, B6.ucus);
  const pota = new MegaPota('pota', B6.pota.kutu);
  const potaKanal = new YuzeyParca('pota-kanal', B6.potaKanal.kutu, [B6.potaKanal.yuzey]);
  const koruk = new Koruk('koruk', B6.koruk.kutu, B6.koruk.pedal, B6.koruk.duvar, 'hortum', 'balon');
  const hortum = new YuzeyParca('hortum', B6.hortum.kutu, []);
  const balon = new YuzeyParca('balon', B6.balon.kutu, []);
  const W = B6.dunya.w;
  return {
    no: 6, ad: 'Mega zincir', yeni: 'can', fon: 'mega-fon',
    dunya: B6.dunya, zeminY: ZEMIN_Y, topBasi: KULE.topBasi, itis: KULE.itis,
    sabit: [KULE.platform, KULE.rampa, [n(B6.masaA, ZEMIN_Y), n(B6.masaA, ZEMIN_Y + 200)], [n(B6.masaB, ZEMIN_Y), n(B6.masaB, ZEMIN_Y + 200)], B6.pota.direk],
    masalar: [masa(-200, B6.masaA), masa(B6.masaB, W + 200)], dusmeY: 840,
    mekanizmalar: [rampa, huni, tram, takoz, kaykay, pota, potaKanal, koruk, hortum, balon],
    parcalar: [
      { id: 'rampa', cizim: 'parca-rampa', kutu: rampa.kutu, yerlesir: true },
      { id: 'trambolin', cizim: 'parca-trambolin', kutu: tram.kutu, yerlesir: true },
      { id: 'huni', cizim: 'mega-huni', kutu: huni.kutu, yerlesir: true },
      { id: 'kaykay', cizim: 'k2-kaykay', kutu: B6.kaykay.kutu, yerlesir: true },
      { id: 'takoz', cizim: 'k2-takoz', kutu: takoz.kutu, yerlesir: true },
      { id: 'pota', cizim: 'mega-pota', kutu: pota.kutu, yerlesir: false },
      { id: 'pota-kanal', cizim: 'mega-pota-kanal', kutu: potaKanal.kutu, yerlesir: false },
      { id: 'koruk', cizim: 'mega-koruk', kutu: koruk.kutu, yerlesir: false },
      { id: 'hortum', cizim: 'mega-hortum', kutu: hortum.kutu, yerlesir: true },
      { id: 'balon', cizim: 'k5-balon', kutu: balon.kutu, yerlesir: true },
    ],
    eksik: {
      minik: ['trambolin', 'kaykay'],
      dort: ['rampa', 'trambolin', 'kaykay', 'hortum'],
      bes: ['rampa', 'trambolin', 'huni', 'kaykay', 'takoz', 'hortum'],
    },
    dominolar: dominolar(B6.dominolar), final: { tur: 'can', dugme: B6.can.dugme, kutu: B6.can.kutu },
  };
}

export const BOLUM_SAYISI = 6;
export function bolum(no: number): Bolum {
  switch (no) {
    case 2: return bolum2();
    case 3: return bolum3();
    case 4: return bolum4();
    case 5: return bolum5();
    case 6: return bolum6();
    default: return bolum1();
  }
}
/** Bölümün mekanizmalarından yaşa göre yerinde gelenler (eksik olmayanlar ve sabitler). */
export function yerindekiler(b: Bolum, yas: Yas): string[] {
  const eksik = new Set(b.eksik[yas]);
  return b.mekanizmalar.map((m) => m.id).filter((id) => !eksik.has(id));
}
export type { Nokta };
