/**
 * Kesme kukla için hareket yardımcıları (önden görünüş): bacak çözücü (ayak yere basar), yürüyüş döngüsü,
 * ikincil hareket (kulak, kuyruk, el sarkması: yaylarla gecikme ve sallanma).
 * Kukla: film/src/kukla.ts. Parça adları Kino kitinin adları (sag = karakterin sağı = ekranın solu).
 */
import { Kukla, Yay } from './kukla';

const DERECE = 180 / Math.PI;
export type Taraf = 'sag' | 'sol';

/** Ayağın dinlenme yerinden farkı (kare birimi): y < 0 kalkık; egim derece; olcek kameraya yaklaşan ayak için */
export interface AyakHedef {
  x: number;
  y: number;
  egim?: number;
  olcek?: number;
}

/**
 * Bacağı ayak hedefine göre kurar: uyluk kalçadan ayağa doğru döner, baldır uyluğun içinde kayarak bacağı
 * kısaltır / uzatır (önden görünüşte öne kalkan bacak kısalır). Ayakkabı yere paralel kalır.
 * kalcaA / kalcaY: kalça parçasının açısı ve aşağı kayması (ayak dünyada sabit kalsın diye düşülür).
 */
export function bacakKur(k: Kukla, t: Taraf, h: AyakHedef, kalcaA = 0, kalcaY = 0) {
  const pr = k.iskelet.parcalar;
  const kalca = pr[`bacak-ust-${t}`].pivot, bilek = pr[`ayak-${t}`].pivot;
  const dx = bilek[0] - kalca[0], dy = bilek[1] - kalca[1];
  let vx = dx + h.x, vy = dy + h.y - kalcaY;
  // kalçanın kendi dönüşünü geri al (uyluk kalçanın çocuğu)
  const r = -kalcaA / DERECE;
  [vx, vy] = [vx * Math.cos(r) - vy * Math.sin(r), vx * Math.sin(r) + vy * Math.cos(r)];
  const a = (Math.atan2(vy, vx) - Math.atan2(dy, dx)) * DERECE;
  // bacak boyu: uyluk kalçadan boyuna ölçeklenir (baldır onun içinde); içe kayan baldırda olduğu gibi kenarda
  // basamak kalmaz. Ayakkabı ölçeği geri alır (ayakkabı ezilmez).
  const boy = Math.hypot(dx, dy), sy = Math.max(0.55, Math.min(1.15, Math.hypot(vx, vy) / boy));
  k.poz[`bacak-ust-${t}`] = { a, sy };
  k.poz[`bacak-alt-${t}`] = {};
  const o = h.olcek ?? 1;
  k.poz[`ayak-${t}`] = { a: -(kalcaA + a) + (h.egim ?? 0), sx: o, sy: o / sy };
}

/**
 * Kameraya doğru (ya da çapraz) yürüyüş: adım evresine göre iki ayağın hedefi, kalça inip kalkması ve yana yatması.
 * u: adım sayacı (0, 1, 2 … her tam sayı bir adım; çift adımda sağ ayak havada), adim: bir adımda kökün aldığı yol
 * (kare birimi, [x, y]: y > 0 kameraya yaklaşır), genlik: 0..1 (başta ve sonda adımlar kısalır).
 */
export function yuruyusPozu(u: number, adim: [number, number], genlik = 1) {
  const n = Math.floor(u), p = u - n;
  const yarim: [number, number] = [(adim[0] / 2) * genlik, (adim[1] / 2) * genlik];
  const havada: Taraf = n % 2 === 0 ? 'sag' : 'sol';
  const yer: Taraf = havada === 'sag' ? 'sol' : 'sag';
  // havadaki ayak arkadan öne, yumuşak; yerdeki ayak kök ilerledikçe geriye kayar (dünyada sabit)
  const e = 0.5 - 0.5 * Math.cos(Math.PI * p);
  const kalk = Math.sin(Math.PI * p);
  const ayak: Record<Taraf, AyakHedef> = {
    [havada]: { x: -yarim[0] + 2 * yarim[0] * e, y: -yarim[1] + 2 * yarim[1] * e - 112 * kalk * genlik, egim: (havada === 'sag' ? -6 : 6) * kalk * genlik, olcek: 1 + 0.05 * kalk * genlik },
    [yer]: { x: yarim[0] - 2 * yarim[0] * p, y: yarim[1] - 2 * yarim[1] * p },
  } as Record<Taraf, AyakHedef>;
  // kalça: ayak değerken en altta, bacak dikken en üstte; yerdeki bacağa doğru yatar ve kayar
  const yon = yer === 'sag' ? -1 : 1;
  return {
    ayak,
    kalcaY: (22 - 42 * kalk) * genlik,
    kalcaA: yon * 2.2 * kalk * genlik,
    kalcaX: yon * 10 * kalk * genlik,
    /** kol sallama: havadaki bacağın karşı kolu öne (önden: hafif içe, dirsek bükülür) */
    kolSalla: (havada === 'sag' ? 1 : -1) * Math.sin(Math.PI * p) * genlik,
    kalk,
    havada,
  };
}

/** Kafa, kulak, kuyruk ve ellerin yaylı gecikmesi. Her karede adim() sonra uygula(). */
export class Ikincil {
  kulakSag = new Yay(150, 6.5);
  kulakSol = new Yay(150, 6.5);
  kuyruk = new Yay(200, 9);
  elSag = new Yay(260, 13);
  elSol = new Yay(260, 13);
  kafaY = new Yay(320, 18);
  kafaA = new Yay(260, 16);
  private onceki: { p: [number, number]; v: [number, number]; aci: number; w: number; kolSag: number; kolSol: number; wSag: number; wSol: number } | null = null;

  /**
   * kok: kuklanın sahnedeki kayması (kare birimi; yürüyüş, zıplama), dt saniye.
   * Kulaklar kafanın ivmesine karşı sallanır; zıplarken (aşağı ivme) dışa açılır.
   */
  adim(k: Kukla, kok: [number, number], dt: number) {
    k.hesapla();
    const kp = k.nokta('kafa');
    const p: [number, number] = [kp[0] + kok[0], kp[1] + kok[1]];
    const aci = (k.poz.kalca?.a ?? 0) + (k.poz.govde?.a ?? 0) + (k.poz.kafa?.a ?? 0);
    const kolAci = (t: Taraf) => aci - (k.poz.kafa?.a ?? 0) + (k.poz[`kol-ust-${t}`]?.a ?? 0) + (k.poz[`kol-alt-${t}`]?.a ?? 0);
    const kolSag = kolAci('sag'), kolSol = kolAci('sol');
    const o = this.onceki ?? { p, v: [0, 0], aci, w: 0, kolSag, kolSol, wSag: 0, wSol: 0 };
    const v: [number, number] = [(p[0] - o.p[0]) / dt, (p[1] - o.p[1]) / dt];
    // ivme: hız farkı (yumuşatılmış: tek karelik sıçramalar kulağı titretmesin)
    const ivme: [number, number] = [((v[0] - o.v[0]) / dt) * 0.5, ((v[1] - o.v[1]) / dt) * 0.5];
    const w = (aci - o.aci) / dt, alfa = (w - o.w) / dt;
    const wSag = (kolSag - o.kolSag) / dt, wSol = (kolSol - o.kolSol) / dt;
    const aSag = (wSag - o.wSag) / dt, aSol = (wSol - o.wSol) / dt;
    this.onceki = { p, v, aci, w, kolSag, kolSol, wSag, wSol };
    const sinir = (x: number, m: number) => Math.max(-m, Math.min(m, x));
    // kulak: + saat yönü. sag kulak (ekranın solu) dışa = +, sol kulak dışa = -
    const yatay = sinir(ivme[0], 9000) * 0.22, dikey = sinir(ivme[1], 16000) * 0.27;
    this.kulakSag.adim(0, dt, yatay + dikey - alfa * 0.55);
    this.kulakSol.adim(0, dt, yatay - dikey - alfa * 0.55);
    this.kuyruk.adim(0, dt, -yatay * 0.8 - dikey * 0.5 - alfa * 0.4);
    this.elSag.adim(0, dt, -aSag * 0.35 + yatay * 0.3);
    this.elSol.adim(0, dt, -aSol * 0.35 + yatay * 0.3);
    this.kafaY.adim(0, dt, -sinir(ivme[1], 16000) * 0.012);
    this.kafaA.adim(0, dt, -alfa * 0.08 + yatay * 0.04);
  }

  /** Yayların değerlerini pozun üstüne ekler (sınırlı) */
  uygula(k: Kukla) {
    const ekle = (ad: string, alan: 'a' | 'y', d: number, m: number) => {
      const e = (k.poz[ad] ??= {});
      // yumuşak sınır: tepede düzleşip "takılmasın"
      e[alan] = (e[alan] ?? 0) + m * Math.tanh(d / m);
    };
    ekle('kulak-sag', 'a', this.kulakSag.x, 21);
    ekle('kulak-sol', 'a', this.kulakSol.x, 21);
    ekle('kuyruk', 'a', this.kuyruk.x, 30);
    ekle('el-sag', 'a', this.elSag.x, 30);
    ekle('el-sol', 'a', this.elSol.x, 30);
    ekle('kafa', 'y', this.kafaY.x, 24);
    ekle('kafa', 'a', this.kafaA.x, 6);
  }
}
