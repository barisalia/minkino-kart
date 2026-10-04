/**
 * "Salıncak Kimin?" oyun mantığı (DOM'suz, birim testli: tests/unit/macera-salincak.test.ts).
 * Senaryo: ekip/senaryo/salincak.md. Yaş farkı yalnız senaryonun dediği yerlerde: sahne 1 (itiş zamanlaması),
 * 2 (5 ya da 10 sallanış), 5 (ses bandı), 7 (tekerleme uzunluğu).
 *
 * Algılama kilitli ses sisteminden gelir (ekip/SES-SISTEMI.md); burada yalnız oyunun yorumu ve hızı var:
 * sarkaç fiziği, itiş penceresi, sayma kuralı, kaydırak ilerlemesi, yumuşak / sert itiş, tekerlemenin alkışları.
 */

/** İki yaş grubu: 3-4 ve 5-6 */
export const kucukMu = (yas: number) => yas <= 4;

export interface SalincakAyar {
  /** sahne 1: itiş yalnız salıncak yanına gelince (halka parlarken) mi sayılır (5-6) */
  hopPencere: boolean;
  /** sahne 1: salıncağı en yükseğe çıkaran itiş sayısı */
  hopSayisi: number;
  /** sahne 2: herkese kaç sallanış */
  sayi: number;
  /** sahne 4: kaç kayış */
  kayis: number;
  /** sahne 5: Mino için gereken yumuşak itiş */
  yumusakItis: number;
  /** sahne 5: 3-4 yaşta yalnız bağırma "sert" sayılır; 5-6 yaşta konuşmanın üst bölümü de */
  darBant: boolean;
  /** sahne 6: Ege için fısıltı itişi */
  fisiltiItis: number;
  /** sahne 7: tekerlemenin kaç dizesi */
  dize: number;
}

export function salincakAyar(yas: number): SalincakAyar {
  const k = kucukMu(yas);
  return {
    hopPencere: !k,
    hopSayisi: 4,
    sayi: k ? 5 : 10,
    kayis: 2,
    yumusakItis: k ? 2 : 3,
    darBant: !k,
    fisiltiItis: 3,
    dize: k ? 2 : 4,
  };
}

/** Kolaylık: her yaşta 2. denemede kabul (1 yanlıştan sonra) */
export const kabulMu = (yanlis: number) => yanlis >= 1;
/** Parmak ipucu: bu kadar saniyede ya da 2 yanlışta */
export const IPUCU_SURE = 8;

// ---------------------------------------------------------------- sarkaç
/** Salıncağın açısal hızı (rad/sn; periyot 2π/ω ≈ 2.1 sn: çocuğun takip edebileceği, canlı bir salınım) */
export const OMEGA = 3;
/** En büyük açı (rad, ~28°): oturak çerçevenin iç ayağına değmez */
export const EN_BUYUK_ACI = 0.49;
/** Doğal sürtünme (1/sn): itilmeyen salıncak yavaş yavaş durur */
export const SURTUNME = 0.16;

/**
 * Basit sarkaç: θ'' = −ω²·sin θ − c·θ'. Açı + sağa. İtiş salınımın yönünde hız ekler; genlik EN_BUYUK_ACI'yı
 * geçmez (yumuşakça sınırlanır). Yarı-örtük Euler (kararlı), dt küçük parçalara bölünür.
 */
export class Sarkac {
  aci = 0;
  hiz = 0;
  /** son geçilen uç: 1 sağ, −1 sol (sayma ve gıcırtı için) */
  sonUc = 0;
  /** her sağ uca varışta (çocuğa en yakın uç) */
  onUc: ((yon: 1 | -1, genlik: number) => void) | null = null;
  constructor(
    readonly omega = OMEGA,
    public surtunme = SURTUNME,
    public enBuyuk = EN_BUYUK_ACI,
  ) {}

  /** Genlik tahmini (küçük açı): uçtaki açı */
  get genlik() {
    return Math.hypot(this.aci, this.hiz / this.omega);
  }

  tik(dt: number, surtunmeCarpan = 1) {
    const n = Math.max(1, Math.ceil(dt / 0.01));
    const h = dt / n;
    for (let i = 0; i < n; i++) {
      const once = this.hiz;
      this.hiz += (-this.omega * this.omega * Math.sin(this.aci) - this.surtunme * surtunmeCarpan * this.hiz) * h;
      this.aci += this.hiz * h;
      // uç: hız işaret değiştirdi
      if (once > 0 && this.hiz <= 0) this.uc(1);
      else if (once < 0 && this.hiz >= 0) this.uc(-1);
    }
    this.sinirla();
  }

  private uc(yon: 1 | -1) {
    this.sonUc = yon;
    this.onUc?.(yon, this.genlik);
  }

  /** Genliği sınırın altında tut (enerjiyi ölçekle) */
  private sinirla() {
    const g = this.genlik;
    if (g > this.enBuyuk) {
      const k = this.enBuyuk / g;
      this.aci *= k;
      this.hiz *= k;
    }
  }

  /**
   * İtiş: genliğe `artis` (rad) kadar ekler. Salıncak duruyorsa sağdan sola itilir gibi başlar (hız −);
   * sallanıyorsa o anki yönde hızlanır.
   */
  it(artis: number) {
    const g = this.genlik;
    const yeni = Math.min(this.enBuyuk, g + artis);
    if (g < 0.01) {
      this.hiz = -yeni * this.omega * 0.9;
      return;
    }
    const k = yeni / g;
    this.aci *= k;
    this.hiz *= k;
  }

  /** Genliği doğrudan ayarla (sahne başı: salıncak zaten sallanıyor) */
  genlikYap(g: number) {
    const s = this.genlik;
    if (s < 0.005) {
      this.aci = Math.min(g, this.enBuyuk);
      this.hiz = 0;
      return;
    }
    const k = Math.min(g, this.enBuyuk) / s;
    this.aci *= k;
    this.hiz *= k;
  }

  durdur() {
    this.aci = 0;
    this.hiz = 0;
  }

  /** Evre (rad): 0 = sağ uç, π = sol uç */
  get evre() {
    return Math.atan2(-this.hiz / this.omega, this.aci);
  }
}

/**
 * 5-6 yaş itiş penceresi: salıncak sağ uca (çocuğa en yakın uç, ekranda halka) ±pay sn yakınken açık.
 * Salıncak neredeyse duruyorsa her zaman açık (ilk itiş).
 */
export function itisPenceresi(s: { aci: number; hiz: number; omega: number }, pay = 0.4): boolean {
  const g = Math.hypot(s.aci, s.hiz / s.omega);
  if (g < 0.05) return true;
  const evre = Math.atan2(-s.hiz / s.omega, s.aci);
  return Math.abs(evre) / s.omega <= pay;
}

/** Sahne 1: bir itişin genliğe katkısı (dört itişte en yükseğe) */
export const hopArtisi = (hopSayisi: number) => EN_BUYUK_ACI / hopSayisi + 0.01;

// ---------------------------------------------------------------- sahne 2: sayma
/**
 * Her alkış ancak salıncak bir salınımı tamamladıysa (son sayıdan beri sağ uçtan geçtiyse) sayılır.
 * İlk alkış hemen sayılır.
 */
export class SalinimSayaci {
  sayi = 0;
  private hazir = true;
  /** salıncak sağ uca vardı */
  uc() {
    this.hazir = true;
  }
  /** alkış: sayıldıysa true */
  alkis(): boolean {
    if (!this.hazir) return false;
    this.hazir = false;
    this.sayi++;
    return true;
  }
  get bekliyor() {
    return !this.hazir;
  }
}

/** Sayının Türkçe söylenişi (mevcut kayıtlar: "Bir!" … "On!") */
export const SAYILAR = ['Bir!', 'İki!', 'Üç!', 'Dört!', 'Beş!', 'Altı!', 'Yedi!', 'Sekiz!', 'Dokuz!', 'On!'];
export const sayiSoyle = (n: number) => SAYILAR[Math.max(1, Math.min(10, n)) - 1];

/** Can'ın yüzü: bekledikçe asılır (0 gülüyor … 1 surat asık); her sayıda biraz açılır */
export const canYuzu = (sayi: number, hedef: number) => Math.max(0, 1 - sayi / Math.max(1, hedef));

// ---------------------------------------------------------------- sahne 3: sus, salıncak dursun
/** Sessizlikte (ya da basılı tutarken) sürtünme katsayısı; ses çıkınca itiş */
export const SUS_SURTUNME = 2;
export const TUT_SURTUNME = 4;
/** Salıncak bu genliğin altına inince durmuş sayılır */
export const DURMA_GENLIK = 0.035;
/** Ses gelince (Kino sevinir) salıncak bu kadar itilir */
export const SES_ITISI = 0.14;

// ---------------------------------------------------------------- sahne 4: kaydırak
/** Uzun ses: sesin sürdüğü her saniye kaydırağın bu kadarı (0..1) gidilir (~2.2 sn'lik "vııı") */
export const KAYMA_HIZI = 0.45;
/** Ses kesilince bu kadar saniye sonra parmak ipucu */
export const KAYMA_IPUCU = 5;
/** Kaydırak ilerlemesi: ses varken ilerler, yokken frenler (yerinde kalır) */
export function kaydirakIlerle(ilerleme: number, dt: number, ses: boolean, hiz = KAYMA_HIZI): number {
  if (!ses) return ilerleme;
  return Math.min(1, ilerleme + dt * hiz);
}
/** Parmak: Kino'yu kaydırak boyunca sürüklerken ilerleme (0..1) yalnız ileri gider, büyük sıçramalar kırpılır */
export function surukleIlerle(ilerleme: number, parmak: number): number {
  // yolun sonuna yakın parmak sona varmış sayılır
  const p = parmak >= 0.9 ? 1 : Math.max(0, Math.min(1, parmak));
  if (p <= ilerleme) return ilerleme;
  return Math.min(p, ilerleme + 0.35);
}

// ---------------------------------------------------------------- sahne 5 ve 6: yumuşak itiş
export type Itis = 'yumusak' | 'sert';

/**
 * Söyleyişin yorumu (ege-seviye.ts → Soyleyis). Mino (sahne 5): 3-4 yaşta yalnız bağırma (en az 0.15 sn) sert;
 * 5-6 yaşta konuşmanın üst bölümü de ("yuksek") sert.
 */
export function minoItisi(sonuc: 'fisilti' | 'kisik' | 'yuksek', bagirmaSure: number, darBant: boolean): Itis {
  if (darBant) return sonuc === 'yuksek' ? 'sert' : 'yumusak';
  return bagirmaSure >= 0.15 ? 'sert' : 'yumusak';
}
/** Ege (sahne 6): fısıltı ve kısık ses yumuşak, yüksek ses sert */
export const egeItisi = (sonuc: 'fisilti' | 'kisik' | 'yuksek'): Itis => (sonuc === 'yuksek' ? 'sert' : 'yumusak');

/**
 * Parmakla itiş: kısa ve yavaş kaydırma (ya da dokunuş) yumuşak; uzun ve hızlı kaydırma sert.
 * yol: oturak genişliğine oranla yol, sure: sn.
 */
export function parmakItisi(yol: number, sure: number): Itis {
  const hiz = yol / Math.max(0.05, sure);
  return yol > 1.6 && hiz > 3.2 ? 'sert' : 'yumusak';
}
/** Yumuşak itişin genliği (Mino'nun istediği hafif sallanma) ve sertin (fırlatır) */
export const YUMUSAK_GENLIK = 0.16;
export const SERT_GENLIK = EN_BUYUK_ACI;

// ---------------------------------------------------------------- sahne 7: tekerleme
/** src/audio/sarki-kayit.ts → sarkiTablosu() çıktısının burada kullanılan kısmı */
export interface RitimTablosu {
  satirlar: { basMs: number; bitMs: number }[][];
  vuruslar: number[];
  sonMs: number;
}
export interface RitimTur {
  /** kayıtta dizenin başı ve sonu (ms) */
  basMs: number;
  bitMs: number;
  /** dizenin vurgulu vuruşları (ms, dosyanın başından); çocuk bunları alkışlar */
  vuruslar: number[];
  /** vuruş aralığı (ms) */
  ara: number;
}

/** Dizelerin başladığı an (ms, dosyanın başından) */
export function dizeBaslari(t: RitimTablosu): number[] {
  return t.satirlar.filter((s) => s.length).map((s) => Math.min(...s.map((h) => h.basMs)));
}

/**
 * Kayıttan ritim turları (kural: şarkılı görevde ritim tablosu kayıttan çıkar): her dize bir tur; dizenin içindeki
 * vuruşlardan ikisi (ilki ve üçüncüsü: "SAL-la sal-la SA-lın-cak") alkışlanır. dize: kaç dize (3-4: 2, 5-6: 4).
 */
export function ritimTurlari(t: RitimTablosu, dize: number): RitimTur[] {
  const baslar = dizeBaslari(t);
  const turlar: RitimTur[] = [];
  for (let i = 0; i < Math.min(dize, baslar.length); i++) {
    const bas = baslar[i];
    const son = i + 1 < baslar.length ? baslar[i + 1] : t.sonMs + 250;
    const icerde = t.vuruslar.filter((v) => v >= bas - 120 && v < son - 120);
    const secilen = icerde.length >= 3 ? [icerde[0], icerde[2]] : icerde.slice(0, 2);
    if (secilen.length < 2) continue;
    turlar.push({ basMs: Math.max(0, bas - 150), bitMs: son - 60, vuruslar: secilen, ara: secilen[1] - secilen[0] });
  }
  return turlar;
}

/**
 * Yankının sonucu: çocuk dizeyi dinledikten sonra vuruş kadar alkışlar. Tolerans geniş: sayı ±1 (en az 2) doğru;
 * 5-6 yaşta alkışlar arası da çok kopuk olmamalı (vuruş aralığının 3 katından kısa).
 */
export function yankiSonuc(zamanlar: number[], n: number, ara: number, sikiMi: boolean): 'dogru' | 'az' | 'cok' {
  if (zamanlar.length < Math.max(2, n - 1)) return 'az';
  if (zamanlar.length > n + 1) return 'cok';
  if (sikiMi) {
    for (let i = 1; i < zamanlar.length; i++) if (zamanlar[i] - zamanlar[i - 1] > ara * 3) return 'az';
  }
  return 'dogru';
}
