// Deneyler · Paket D6+ deneyleri (D7–D12): mıknatıs, gölge, buz, tohum, rampa, bardaklarla müzik. Kurallar ve doğruluk
// tabloları deney-mantik.ts'te; sahne, Ceren, Kino, kart, sürükleme ve bitiş main.ts'te (Baglam ile gelir). Her deneyin
// akışı aynı kalıp: MERAK (Ceren sorar) → TAHMİN (4+; ceza yok, "Bakalım!") → DENE (çocuğun eli) → GÖR VE SÖYLE.
// Her deney kendi çizimleri ve Ceren'in kayıtları gelince seçim ekranına girer (hazir.ts → deneyAcik).
import { efektCikisi, sesMotorunuAc } from '../../src/audio/motor';
import { oyunSesi } from '../../alfabe/src/oyun-sesi';
import { yuzde } from '../../matematik/src/ders-iskelet';
import {
  BARDAK_TONU, BUZ_ADIM, BUZ_YERLERI, BUZ_ZAMANI, CEKER, M_ADI, R_ADI, SEVIYELER, TOHUM_GUNU, buzPlani, erimeSirasi,
  filizHali, golgeOrani, golgePlani, golgeVardi, inisSuresi, miknatisAkisi, miknatisNesneleri, mSonucSozu, mSorSozu, muzikPlani,
  rampaHareketi, rampaPlani, tohumPlani, type BuzYeri, type DeneyId, type Egim, type GolgeAdimi, type MNesne, type RNesne, type Seviye,
  type YasKumesi,
} from './deney-mantik';

type Birakis = { el: HTMLElement; hedef: HTMLElement; bas: DOMRect };
/** main.ts'in sahnesinden gelen ortak parçalar. */
export type Baglam = {
  alan: HTMLElement;
  kart: HTMLElement;
  dunya: HTMLElement;
  sakin: boolean;
  hizli: boolean;
  kume: () => YasKumesi;
  gelis: (id: DeneyId) => number;
  kutu: (x: number, alt: number, h: number, en: number) => string;
  resim: (ad: string, sinif?: string, ek?: string) => string;
  konus: (id: string, a: number, yonerge?: boolean) => Promise<boolean>;
  bekle: (ms: number, a: number) => Promise<boolean>;
  canli: (a: number) => boolean;
  isaretle: (adim: string) => void;
  yonerge: (id: string) => void;
  cerenPoz: (p: 'sorar' | 'bekler' | 'sevinir') => void;
  kinoPoz: (p: 'merak' | 'saskin' | 'sevinc', ms?: number) => void;
  zipla: (el: Element | null | undefined, guc?: number) => void;
  salla: (el: Element) => void;
  ucur: (el: HTMLElement, bas: DOMRect | undefined, ms?: number) => Promise<void>;
  kaydir: (el: HTMLElement, degistir: () => void, ms: number, easing?: string, egim?: number) => Promise<void>;
  bitince: (an: Animation, ms: number) => Promise<void>;
  tasi: (el: HTMLElement, kap: HTMLElement, stil: string, ms?: number, bas?: DOMRect) => Promise<void>;
  dokunusBekle: <T>(secenekler: readonly (readonly [HTMLElement, T])[], soz: () => string, o?: { kabul?: (d: T) => boolean; bosta?: boolean }) => Promise<T | undefined>;
  birakisBekle: (tasinanlar: readonly HTMLElement[], hedefler: readonly HTMLElement[], soz: () => string, dokunHedef?: HTMLElement) => Promise<Birakis | undefined>;
  kartAc: (tur: string, ic: string) => void;
  kartKapat: () => Promise<void>;
  adim: (kur: (bitir: (tamam: boolean) => void) => () => void) => Promise<boolean>;
  bostaIzle: (ipucu: () => void, soz: () => string) => { dokundu: () => void; dur: () => void };
  sus: () => void;
  bitis: (id: DeneyId, a: number) => Promise<void>;
};

const ORAN = 0.5625;
/** Bir düğme (dokunulan çizim). */
function dugmeEl(b: Baglam, sinif: string, ad: string, cizim: string, stil: string, veri: Record<string, string> = {}) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = sinif;
  el.setAttribute('aria-label', ad);
  el.style.cssText = stil;
  for (const [k, v] of Object.entries(veri)) el.dataset[k] = v;
  el.innerHTML = b.resim(cizim, 'dn-resim');
  b.alan.append(el);
  return el;
}
/** Tahmin kartı: iki seçenek (resimleri yan yana kurulmuş küçük sahneler); seçilen işaretlenir, "Bakalım!". */
async function ikiSecenek<T extends string>(b: Baglam, a: number, soz: string, secenekler: readonly (readonly [T, string, string])[]): Promise<T | undefined> {
  b.kartAc('ikili', secenekler.map(([d, ad, ic]) => '<button type="button" class="dn-secenek" data-secenek="' + d + '" aria-label="' + ad + '">' + ic + '</button>').join(''));
  const dugmeler = Array.from(b.kart.querySelectorAll<HTMLElement>('.dn-secenek'));
  b.cerenPoz('sorar');
  const p = b.dokunusBekle(dugmeler.map((el) => [el, el.dataset.secenek as T] as const), () => soz);
  if (!(await b.konus(soz, a, true))) return undefined;
  b.cerenPoz('bekler');
  const t = await p;
  if (!t) return undefined;
  dugmeler.find((el) => el.dataset.secenek === t)?.classList.add('secildi');
  b.kart.dataset.tahmin = t;
  oyunSesi('kagit');
  if (!(await b.konus('bakalim', a))) return undefined;
  await b.kartKapat();
  return t;
}
/** Küçük sahne katmanı (tahmin kartında): resim, kutunun yüzdesiyle yerleşir. */
const mini = (b: Baglam, ad: string, sol: number, ust: number, en: number, boy: number, ek = '') =>
  '<span class="dn-mini-parca" style="left:' + sol + '%;top:' + ust + '%;width:' + en + '%;height:' + boy + '%;' + ek + '">' + b.resim(ad, 'dn-resim') + '</span>';

// ================= D7 · Mıknatıs neyi çeker? =================
/** Masadaki nesne yerleri (200 × 200, taban y 190) ve mıknatısın evi (260 × 260; uçlar altta). */
const M = { yer5: [0.12, 0.2, 0.28, 0.72, 0.8], yer4: [0.2, 0.28, 0.72, 0.8], alt: 0.785, h: 0.12, ev: { x: 0.5, alt: 0.56, h: 0.2 }, asili: [-0.045, 0.045, 0] };
export async function miknatis(b: Baglam, a: number) {
  const k = b.kume(), plan = miknatisAkisi(k), nesneler = miknatisNesneleri(k, b.gelis('miknatis'));
  const yerler = nesneler.length === 4 ? M.yer4 : M.yer5;
  const evde = () => b.kutu(M.ev.x, M.ev.alt, M.ev.h, 1);
  const mk = dugmeEl(b, 'dn-miknatis', 'Mıknatıs', 'miknatis', evde());
  /** Mıknatısa yapışanlar: uçlarının altında asılı (en çok üç). */
  const asili: HTMLElement[] = [];
  const asiliYer = (i: number, x = M.ev.x, alt = M.ev.alt) => b.kutu(x + M.asili[i % 3], alt + M.h * 0.92, M.h, 1);
  const nesneEl = (n: MNesne, x: number) => dugmeEl(b, 'dn-nesne dn-m-nesne', M_ADI[n], n, b.kutu(x, M.alt, M.h, 1), { nesne: n });
  const elemanlar = nesneler.map((n, i) => nesneEl(n, yerler[i]));

  async function dene(el: HTMLElement, n: MNesne): Promise<boolean> {
    el.classList.add('sirada');
    b.isaretle('mk-dene');
    if (plan.tahmin) {
      b.isaretle('mk-tahmin');
      const t = await ikiSecenek(b, a, mSorSozu(n), [
        // Çeker: nesne mıknatısın uçlarına değiyor. Çekmez: arada açık boşluk.
        ['ceker', 'Çeker', mini(b, 'miknatis', 22, 2, 56, 50) + mini(b, n, 30, 45, 40, 40)],
        ['cekmez', 'Çekmez', mini(b, 'miknatis', 22, 2, 56, 50) + mini(b, n, 32, 66, 36, 32)],
      ]);
      if (t === undefined) return false;
      b.isaretle('mk-dene');
    }
    b.cerenPoz('bekler');
    // Çocuk mıknatısı nesneye götürür (sürükle ya da mıknatısa dokun).
    const p = b.birakisBekle([mk], [el], () => 'mk-yaklastir', el);
    if (!(await b.konus('mk-yaklastir', a, true))) return false;
    const s = await p;
    if (!s) return false;
    el.classList.remove('sirada');
    const x = parseFloat(el.style.left) / 100 + parseFloat(el.style.width) / 200;
    const ustu = M.alt - M.h;
    await b.tasi(mk, b.alan, b.kutu(x, ustu + 0.012, M.ev.h, 1), 380, s.bas);
    if (CEKER[n]) {
      // Tık! Nesne mıknatısın uçlarına sıçrar; birlikte evine döner, uçlarda asılı kalır.
      oyunSesi('miknatis');
      await b.kaydir(el, () => { el.style.cssText = asiliYer(asili.length, x, ustu + 0.012); }, 180, 'cubic-bezier(.5,0,.9,.4)');
      el.classList.add('yapisti');
      b.kinoPoz('saskin', 1200);
      await Promise.all([b.kaydir(mk, () => { mk.style.cssText = evde(); }, 520), b.kaydir(el, () => { el.style.cssText = asiliYer(asili.length); }, 520)]);
      asili.push(el);
    } else {
      // Çekmez: nesne yerinde kalır; mıknatıs biraz bekler, evine döner.
      if (!(await b.bekle(500, a))) return false;
      await b.kaydir(mk, () => { mk.style.cssText = evde(); }, 480);
    }
    el.dataset.sonuc = CEKER[n] ? 'cekti' : 'cekmedi';
    b.cerenPoz(CEKER[n] ? 'sevinir' : 'bekler');
    return b.konus(mSonucSozu(n), a);
  }

  b.isaretle('mk-giris');
  b.cerenPoz('sorar');
  b.kinoPoz('merak');
  if (!(await b.konus('mk-giris', a, true))) return;
  for (const [i, n] of nesneler.entries()) if (!(await dene(elemanlar[i], n))) return;
  if (plan.surpriz) {
    b.isaretle('mk-surpriz');
    const anahtar = nesneEl('anahtar', 0.5);
    void b.ucur(anahtar, b.dunya.querySelector('.cd-ceren')?.getBoundingClientRect(), 480);
    b.kinoPoz('saskin', 1500);
    if (!(await b.konus('mk-surpriz', a))) return;
    if (!(await dene(anahtar, 'anahtar'))) return;
    b.isaretle('mk-neden');
    b.cerenPoz('sorar');
    if (!(await b.konus('mk-neden', a, true))) return;
  }
  b.cerenPoz('sevinir');
  b.kinoPoz('sevinc', 1500);
  if (!(await b.konus('mk-sonuc', a, true))) return;
  await b.bitis('miknatis', a);
}

// ================= D8 · Gölge büyür, küçülür =================
/**
 * Perde arkada (golge-perdesi 900 × 600), tavşan önünde (400 × 400), fener masanın önünde yol üstünde: t = 0 uzak (sol ön),
 * t = 1 yakın. Fener yatay çizilir (ağzı sağda), yola göre döndürülür. Gölge perdenin içinde, ışık kaynağından tavşanın
 * geçtiği doğru üstünde ve golgeOrani(t) büyüklüğünde (perdenin dışına taşan kesilir).
 */
const G = {
  perde: { x: 0.55, alt: 0.52, h: 0.38, en: 1.5 },
  tavsan: { x: 0.5, alt: 0.585, h: 0.17 },
  uzak: { x: 0.3, y: 0.77 }, yakin: { x: 0.4, y: 0.65 },
  fener: { h: 0.085, en: 1.8 },
};
/** Perdenin beyaz bezi (900 × 600 tuvalde x 60…840, y 40…520): gölge yalnız burada görünür. */
const BEZ = { sol: 60 / 900, ust: 40 / 600, en: 780 / 900, boy: 480 / 600 };
export async function golge(b: Baglam, a: number) {
  const k = b.kume(), plan = golgePlani(k, b.gelis('golge'));
  const P = G.perde, pw = P.h * ORAN * P.en, pSol = P.x - pw / 2, pUst = P.alt - P.h;
  b.alan.insertAdjacentHTML('beforeend',
    '<div class="dn-perde" style="' + b.kutu(P.x, P.alt, P.h, P.en) + '">' + b.resim('golge-perdesi', 'dn-resim') +
      '<div class="dn-golge-alan"><div class="dn-golge" hidden>' + b.resim('tavsan-golgesi', 'dn-resim') + '</div></div></div>' +
    '<div class="dn-huzme" hidden>' + b.resim('isik-huzmesi', 'dn-resim') + '</div>' +
    '<div class="dn-tavsan" style="' + b.kutu(G.tavsan.x, G.tavsan.alt, G.tavsan.h, 1) + '">' + b.resim('oyuncak-tavsan', 'dn-resim') + '</div>');
  const golgeEl = b.alan.querySelector<HTMLElement>('.dn-golge')!;
  const huzme = b.alan.querySelector<HTMLElement>('.dn-huzme')!;
  const fener = dugmeEl(b, 'dn-fener', 'El feneri', 'el-feneri-kapali', '');
  fener.innerHTML = b.resim('el-feneri-kapali', 'dn-resim dn-fener-kapali') + b.resim('el-feneri-acik', 'dn-resim dn-fener-acik');
  fener.dataset.acik = '0';
  let t = plan.baslangic;
  const tavsanY = G.tavsan.alt - G.tavsan.h / 2;
  /** Feneri, ışığı ve gölgeyi t'ye göre kurar. */
  function kur() {
    const fx = G.uzak.x + (G.yakin.x - G.uzak.x) * t, fy = G.uzak.y + (G.yakin.y - G.uzak.y) * t;
    const fh = G.fener.h, fw = fh * ORAN * G.fener.en;
    // Fenerin ağzı (tuvalde sağ orta) fx, fy'de; fener tavşanın ortasına bakar.
    const aci = Math.atan2((tavsanY - fy) * ORAN, G.tavsan.x - fx);
    fener.style.cssText = 'left:' + yuzde(fx - fw) + ';top:' + yuzde(fy - fh / 2) + ';width:' + yuzde(fw) + ';height:' + yuzde(fh) + ';transform-origin:100% 50%;rotate:' + aci.toFixed(3) + 'rad';
    fener.dataset.t = t.toFixed(2);
    const oran = golgeOrani(t);
    golgeEl.dataset.oran = oran.toFixed(2);
    // Gölgenin ortası: ışık → tavşan doğrusunun perdeye düştüğü yer; büyüklüğü tavşan × oran (perdeye göre yüzde).
    const gx = fx + (G.tavsan.x - fx) * oran, gy = fy + (tavsanY - fy) * oran;
    const gh = G.tavsan.h * oran, gw = gh * ORAN;
    // Gölge yalnız perdenin bezine düşer (bezin dışı kesilir): konum bezin kutusuna göre.
    const bz = { x: pSol + BEZ.sol * pw, y: pUst + BEZ.ust * P.h, w: BEZ.en * pw, h: BEZ.boy * P.h };
    golgeEl.style.cssText = 'left:' + yuzde((gx - gw / 2 - bz.x) / bz.w) + ';top:' + yuzde((gy - gh / 2 - bz.y) / bz.h) + ';width:' + yuzde(gw / bz.w) + ';height:' + yuzde(gh / bz.h);
    // Işık hüzmesi: fenerin ağzından perdenin ortasına (600 × 300 koni, dar ucu solda).
    const hx = P.x, hy = pUst + P.h / 2, uz = Math.hypot(hx - fx, (hy - fy) * ORAN), ha = Math.atan2((hy - fy) * ORAN, hx - fx);
    const hh = Math.max(0.12, uz * 0.6);
    huzme.style.cssText = 'left:' + yuzde(fx) + ';top:' + yuzde(fy - hh / 2 / ORAN) + ';width:' + yuzde(uz) + ';height:' + yuzde(hh / ORAN) + ';transform-origin:0 50%;rotate:' + ha.toFixed(3) + 'rad';
  }
  kur();
  const ac = (acik: boolean) => {
    fener.dataset.acik = acik ? '1' : '0';
    huzme.hidden = !acik;
    golgeEl.hidden = !acik;
    b.dunya.dataset.fener = acik ? 'acik' : 'kapali';
    oyunSesi('kutu');
  };
  /** Çocuk feneri yoluna göre sürükler ya da dokunur (her dokunuş bir adım); hedefe varınca biter. */
  function tasi(adim: GolgeAdimi) {
    return b.adim((bitir) => {
      const bos = b.bostaIzle(() => b.zipla(fener, 0.4), () => 'gl-' + adim);
      let bas: { id: number; x: number; y: number; t: number } | undefined, kaydi = false;
      const ilerle = (yeni: number) => {
        t = Math.max(0, Math.min(1, yeni));
        kur();
        if (golgeVardi(adim, t)) { b.sus(); bitir(true); }
      };
      const yol = () => {
        const r = b.dunya.getBoundingClientRect();
        return { ux: (G.uzak.x) * r.width + r.left, uy: G.uzak.y * r.height + r.top, vx: (G.yakin.x - G.uzak.x) * r.width, vy: (G.yakin.y - G.uzak.y) * r.height };
      };
      fener.onpointerdown = (e) => {
        if (!e.isPrimary || e.button !== 0) return;
        bos.dokundu();
        bas = { id: e.pointerId, x: e.clientX, y: e.clientY, t };
        kaydi = false;
        try { fener.setPointerCapture(e.pointerId); } catch { /* eski tarayıcı */ }
      };
      fener.onpointermove = (e) => {
        if (!bas || e.pointerId !== bas.id) return;
        if (!kaydi && Math.hypot(e.clientX - bas.x, e.clientY - bas.y) < 8) return;
        kaydi = true;
        bos.dokundu();
        // Parmağın yerini fener yoluna izdüşür.
        const y = yol(), px = e.clientX - y.ux, py = e.clientY - y.uy;
        ilerle((px * y.vx + py * y.vy) / (y.vx * y.vx + y.vy * y.vy));
      };
      fener.onpointerup = (e) => {
        if (!bas || e.pointerId !== bas.id) return;
        const dokundu = !kaydi;
        bas = undefined;
        if (dokundu) { b.zipla(fener, 0.25); ilerle(t + (adim === 'yaklastir' ? 0.25 : -0.25)); }
      };
      fener.onpointercancel = () => { bas = undefined; };
      fener.onclick = (e) => { if (e.detail === 0) ilerle(t + (adim === 'yaklastir' ? 0.25 : -0.25)); };
      return () => { bos.dur(); fener.onpointerdown = fener.onpointermove = fener.onpointerup = fener.onpointercancel = fener.onclick = null; };
    });
  }

  b.isaretle('gl-giris');
  b.cerenPoz('sorar');
  b.kinoPoz('merak');
  if (!(await b.konus('gl-giris', a))) return;
  // Feneri yak.
  b.isaretle('gl-yak');
  fener.classList.add('sirada');
  const p = b.dokunusBekle([[fener, true]], () => 'gl-yak');
  if (!(await b.konus('gl-yak', a, true))) return;
  if ((await p) === undefined) return;
  fener.classList.remove('sirada');
  ac(true);
  b.kinoPoz('saskin', 1500);
  b.cerenPoz('sevinir');
  if (!(await b.konus('gl-golge', a))) return;
  for (const [i, adim] of plan.adimlar.entries()) {
    if (plan.tahmin && i === 0) {
      b.isaretle('gl-tahmin');
      const buyuk = mini(b, 'tavsan-golgesi', 15, 5, 70, 90), kucuk = mini(b, 'tavsan-golgesi', 32, 35, 36, 50);
      const t0 = await ikiSecenek(b, a, 'gl-tahmin-' + adim, [['buyur', 'Büyür', buyuk], ['kuculur', 'Küçülür', kucuk]]);
      if (t0 === undefined) return;
    }
    b.isaretle('gl-' + adim);
    b.cerenPoz('bekler');
    const ps = tasi(adim);
    if (!(await b.konus('gl-' + adim, a, true))) return;
    if (!(await ps)) return;
    b.cerenPoz('sevinir');
    b.kinoPoz(adim === 'yaklastir' ? 'saskin' : 'sevinc', 1500);
    oyunSesi('parilti');
    if (!(await b.konus(adim === 'yaklastir' ? 'gl-buyudu' : 'gl-kuculdu', a))) return;
  }
  if (plan.sondur) {
    b.isaretle('gl-sondur');
    fener.classList.add('sirada');
    b.cerenPoz('bekler');
    const p2 = b.dokunusBekle([[fener, true]], () => 'gl-sondur');
    if (!(await b.konus('gl-sondur', a, true))) return;
    if ((await p2) === undefined) return;
    fener.classList.remove('sirada');
    ac(false);
    if (!(await b.konus('gl-yok', a))) return;
    b.cerenPoz('sorar');
    if (!(await b.konus('gl-neden', a, true))) return;
  }
  await b.bitis('golge', a);
}

// ================= D9 · Buz nerede çabuk erir? =================
/** Üç yer masanın önünde: solda güneş ışığı (pencereden), ortada gölgelik, sağda ılık su kabı. Buz 220 × 160 (taban y 150). */
const BZ = {
  x: { gunes: 0.36, golge: 0.57, su: 0.78 } as Record<BuzYeri, number>,
  /** Buz telefonda da en az 44 px (dünya yüksekliğinin 0,12'si). */
  buz: { h: 0.12, en: 220 / 160, alt: 0.78, suAlt: 0.7 },
  bas: [0.05, 0.13, 0.21], basAlt: 0.8,
};
export async function buz(b: Baglam, a: number) {
  const k = b.kume(), plan = buzPlani(k, b.gelis('buz'));
  const yerEl: Record<BuzYeri, HTMLElement> = {
    gunes: dugmeEl(b, 'dn-buz-yer', 'Güneş', 'gunes-isigi', b.kutu(BZ.x.gunes, 0.8, 0.22, 500 / 300), { yer: 'gunes' }),
    golge: dugmeEl(b, 'dn-buz-yer', 'Gölge', 'golgelik', b.kutu(BZ.x.golge, 0.8, 0.26, 360 / 300), { yer: 'golge' }),
    su: dugmeEl(b, 'dn-buz-yer', 'Ilık su', 'ilik-su-kabi', b.kutu(BZ.x.su, 0.8, 0.18, 360 / 220), { yer: 'su' }),
  };
  const buzlar = BZ.bas.map((x, i) => dugmeEl(b, 'dn-buz', 'Buz', 'buz-tam', b.kutu(x, BZ.basAlt, BZ.buz.h, BZ.buz.en), { i: String(i) }));
  const yerdeki: Partial<Record<BuzYeri, HTMLElement>> = {};
  const buzYeri = (y: BuzYeri) => b.kutu(BZ.x[y], y === 'su' ? BZ.buz.suAlt : BZ.buz.alt, BZ.buz.h, BZ.buz.en);
  let zaman = 0;
  function guncelle() {
    for (const y of BUZ_YERLERI) {
      const el = yerdeki[y];
      if (!el) continue;
      const h = BUZ_ZAMANI[y][zaman];
      el.dataset.hal = h;
      el.hidden = h === 'yok';
      el.innerHTML = h === 'yok' ? '' : b.resim(h === 'su' ? 'su-birikintisi' : 'buz-' + h, 'dn-resim');
    }
    b.dunya.dataset.zaman = String(zaman);
  }

  b.isaretle('bz-giris');
  b.cerenPoz('sorar');
  b.kinoPoz('merak');
  if (!(await b.konus('bz-giris', a))) return;
  // Buzları üç yere koy (sürükle ya da önce buza, sonra yere dokun).
  b.isaretle('bz-koy');
  b.yonerge('bz-koy');
  let ilk = true;
  while (Object.keys(yerdeki).length < 3) {
    const kalan = buzlar.filter((el) => !Object.values(yerdeki).includes(el));
    const bos = BUZ_YERLERI.filter((y) => !yerdeki[y]).map((y) => yerEl[y]);
    b.cerenPoz('bekler');
    const p = b.birakisBekle(kalan, bos, () => 'bz-koy', bos.length === 1 ? bos[0] : undefined);
    if (ilk) { ilk = false; if (!(await b.konus('bz-koy', a, true))) return; }
    const s = await p;
    if (!s) return;
    const y = s.hedef.dataset.yer as BuzYeri;
    yerdeki[y] = s.el;
    s.el.dataset.yer = y;
    await b.tasi(s.el, b.alan, buzYeri(y), 380, s.bas);
    oyunSesi(y === 'su' ? 'damla' : 'kutu');
  }
  guncelle();
  if (plan.tahmin) {
    b.isaretle('bz-tahmin');
    const soz = plan.soru === 'ilk' ? 'bz-tahmin-ilk' : 'bz-tahmin-son';
    b.cerenPoz('sorar');
    // Buz yerinin üstünde durur: yerine de buzuna da dokunmak o yeri seçer.
    const p = b.dokunusBekle(BUZ_YERLERI.flatMap((y) => [[yerEl[y], y] as const, [yerdeki[y]!, y] as const]), () => soz);
    if (!(await b.konus(soz, a, true))) return;
    const t = await p;
    if (!t) return;
    yerEl[t].classList.add('tahmin');
    b.dunya.dataset.tahmin = t;
    oyunSesi('kagit');
    if (!(await b.konus('bakalim', a))) return;
  }
  // Zaman: her dokunuş bir süre geçirir; Ceren eriyenleri söyler. Sonraki dokunuş Ceren konuşurken de alınır (dokununca susar).
  b.isaretle('bz-zaman');
  const dokunus = () => b.dokunusBekle(BUZ_YERLERI.flatMap((y) => [[yerEl[y], y] as const, ...(yerdeki[y] && !yerdeki[y]!.hidden ? [[yerdeki[y]!, y] as const] : [])]), () => 'bz-dokun');
  b.cerenPoz('bekler');
  let p = dokunus();
  if (!(await b.konus('bz-dokun', a, true))) return;
  while (zaman < BUZ_ADIM) {
    if ((await p) === undefined) return;
    zaman++;
    oyunSesi('damla');
    guncelle();
    if (zaman < BUZ_ADIM) p = dokunus();
    const soz = zaman === 1 ? 'bz-kuculuyor' : zaman === 3 ? 'bz-su-eridi' : zaman === 4 ? 'bz-gunes-eridi' : '';
    if (soz) { b.kinoPoz('saskin', 1200); if (!(await b.konus(soz, a))) return; }
  }
  if (!(await b.konus('bz-golge-duruyor', a))) return;
  b.isaretle('bz-sonuc');
  b.cerenPoz('sevinir');
  b.dunya.dataset.sira = erimeSirasi().join(',');
  if (!(await b.konus('bz-sonuc', a, true))) return;
  if (plan.neden) { b.cerenPoz('sorar'); if (!(await b.konus('bz-neden', a, true))) return; }
  await b.bitis('buz', a);
}

// ================= D10 · Tohum nasıl büyür? =================
/** Saksı ve filizler aynı tuvalde (300 × 420, taban y 410); tohum 120 × 120; sulama kabı 360 × 300 (ağzı solda). */
const TH = { saksi: { h: 0.3, en: 300 / 420, alt: 0.82 }, x1: [0.5], x2: [0.38, 0.62], tohum: { h: 0.12, alt: 0.64 }, kap: { x: 0.82, alt: 0.82, h: 0.2, en: 1.2 } };
export async function tohum(b: Baglam, a: number) {
  const k = b.kume(), plan = tohumPlani(k, b.gelis('tohum'));
  const xs = plan.saksi === 1 ? TH.x1 : TH.x2;
  const saksiStili = (x: number) => b.kutu(x, TH.saksi.alt, TH.saksi.h, TH.saksi.en);
  const saksilar = xs.map((x, i) => {
    const el = dugmeEl(b, 'dn-saksi', plan.saksi === 1 ? 'Saksı' : i === plan.sulanan ? 'Sulanan saksı' : 'Susuz saksı', 'saksi-bos', saksiStili(x), { i: String(i) });
    el.insertAdjacentHTML('beforeend', '<span class="dn-bitki"></span>');
    return el;
  });
  // Tohumlar masanın arkasında ortada (bir saksıda tek tohum, iki saksıda yan yana iki).
  const tohumlar = xs.map((_, i) => dugmeEl(b, 'dn-tohum', 'Tohum', 'tohum', b.kutu(0.5 + (i - (xs.length - 1) / 2) * 0.08, TH.tohum.alt, TH.tohum.h, 1), { i: String(i) }));
  const kapEv = () => b.kutu(TH.kap.x, TH.kap.alt, TH.kap.h, TH.kap.en);
  const kap = dugmeEl(b, 'dn-sulama', 'Sulama kabı', 'sulama-kabi', kapEv());
  const sulanan = saksilar[plan.sulanan];
  let gun = 0;
  const bitkiyiKur = () => saksilar.forEach((s, i) => {
    const h = filizHali(gun, i === plan.sulanan);
    const yer = s.querySelector<HTMLElement>('.dn-bitki')!;
    yer.innerHTML = h ? b.resim(h, 'dn-resim') : '';
    s.dataset.bitki = h ?? 'yok';
  });
  /** Kap saksının üstüne gelir, eğilir, su döker (damla sesi), evine döner. */
  async function sula(s: HTMLElement, bas?: DOMRect) {
    const x = parseFloat(s.style.left) / 100 + parseFloat(s.style.width) / 200;
    await b.tasi(kap, b.alan, b.kutu(x + 0.07, TH.saksi.alt - TH.saksi.h * 0.62, TH.kap.h, TH.kap.en), 420, bas ?? kap.getBoundingClientRect());
    kap.classList.add('dokuyor');
    oyunSesi('damla');
    await b.bekle(b.sakin || b.hizli ? 0 : 650, a);
    oyunSesi('damla');
    kap.classList.remove('dokuyor');
    s.dataset.sulandi = '1';
    await b.kaydir(kap, () => { kap.style.cssText = kapEv(); }, 420);
  }
  /** Çocuk kabı saksıya götürür (sürükle ya da kaba dokun: kendiliğinden sulanacak saksıya gider). */
  async function sulaAdimi(soz: string, yonerge: boolean): Promise<boolean> {
    b.isaretle('th-sula');
    sulanan.classList.add('sirada');
    b.cerenPoz('bekler');
    const p = b.birakisBekle([kap], [sulanan], () => soz, sulanan);
    if (yonerge && !(await b.konus(soz, a, true))) return false;
    if (!yonerge) b.yonerge(soz);
    const s = await p;
    if (!s) return false;
    sulanan.classList.remove('sirada');
    await sula(sulanan, s.bas);
    return b.canli(a);
  }

  b.isaretle('th-giris');
  b.cerenPoz('sorar');
  b.kinoPoz('merak');
  if (!(await b.konus('th-giris', a))) return;
  // Tohumları saksılara koy.
  b.isaretle('th-ek');
  const ekSoz = plan.saksi === 1 ? 'th-ek' : 'th-ek-iki';
  let soylendi = false;
  const ekilen = new Set<HTMLElement>();
  while (ekilen.size < saksilar.length) {
    const bos = saksilar.filter((s) => !ekilen.has(s));
    const kalan = tohumlar.filter((t) => !t.dataset.ekildi);
    b.cerenPoz('bekler');
    const p = b.birakisBekle(kalan, bos, () => ekSoz, bos.length === 1 ? bos[0] : undefined);
    if (!soylendi) { soylendi = true; if (!(await b.konus(ekSoz, a, true))) return; }
    const s = await p;
    if (!s) return;
    ekilen.add(s.hedef);
    s.hedef.dataset.ekildi = '1';
    s.el.dataset.ekildi = '1';
    // Tohum toprağa girer.
    await b.tasi(s.el, s.hedef, 'left:40%;top:30%;width:20%;height:14%', 380, s.bas);
    oyunSesi('kagit');
    await b.bekle(b.sakin || b.hizli ? 0 : 200, a);
    s.el.hidden = true;
  }
  if (!(await sulaAdimi(plan.saksi === 1 ? 'th-sula' : 'th-sula-biri', true))) return;
  if (plan.tahmin) {
    b.isaretle('th-tahmin');
    b.cerenPoz('sorar');
    const p = b.dokunusBekle(saksilar.map((s, i) => [s, i] as const), () => 'th-tahmin');
    if (!(await b.konus('th-tahmin', a, true))) return;
    const t = await p;
    if (t === undefined) return;
    saksilar[t].classList.add('tahmin');
    b.dunya.dataset.tahmin = String(t);
    oyunSesi('kagit');
    if (!(await b.konus('bakalim', a))) return;
  }
  // Günler: her sabah sulanan saksı sulanır; gece geçer, bitki büyür.
  for (gun = 1; gun <= TOHUM_GUNU; gun++) {
    b.isaretle('th-gun');
    b.dunya.classList.add('dn-gece');
    await b.bekle(b.sakin || b.hizli ? 0 : 900, a);
    b.dunya.classList.remove('dn-gece');
    bitkiyiKur();
    b.dunya.dataset.gun = String(gun);
    b.kinoPoz('saskin', 1200);
    oyunSesi('parilti');
    if (!(await b.konus('th-gun-' + gun, a))) return;
    if (gun === 2 && plan.saksi === 2 && !(await b.konus('th-susuz', a))) return;
    if (gun < TOHUM_GUNU && !(await sulaAdimi('th-her-gun', gun === 1))) return;
  }
  b.isaretle('th-sonuc');
  b.cerenPoz('sevinir');
  b.kinoPoz('sevinc', 1500);
  if (!(await b.konus(plan.saksi === 1 ? 'th-sonuc-tek' : 'th-sonuc-iki', a, true))) return;
  if (plan.neden) { b.cerenPoz('sorar'); if (!(await b.konus('th-neden', a, true))) return; }
  await b.bitis('tohum', a);
}

// ================= D11 · Rampadan ne iner? =================
/**
 * Rampa 900 × 360 (yüksek ucu solda); üst yüzü düz bir çizgi: az eğimde (100, 170) → (880, 330), dik rampada (100, 40) →
 * (880, 330). Nesneler 200 × 200 (taban y 190); bekleme yeri solda masada. İnen nesne rampanın ucundan masaya çıkar.
 */
const RP = { rampa: { x: 0.52, alt: 0.8, h: 0.3, en: 900 / 360 }, cizgi: { az: [100, 170, 880, 330], dik: [100, 40, 880, 330] }, n: { h: 0.1 }, bekle: [0.13, 0.21, 0.29], beklemeAlt: 0.8 };
export async function rampa(b: Baglam, a: number) {
  const k = b.kume(), plan = rampaPlani(k, b.gelis('rampa'));
  const R = RP.rampa, rw = R.h * ORAN * R.en, rSol = R.x - rw / 2, rUst = R.alt - R.h;
  let egim: Egim = 'az';
  const rampaEl = dugmeEl(b, 'dn-rampa', 'Rampa', 'rampa-az', b.kutu(R.x, R.alt, R.h, R.en));
  rampaEl.dataset.egim = 'az';
  const hepsi = [...new Set([...plan.az, ...plan.dik])] as RNesne[];
  const nesneler = new Map(hepsi.map((n, i) => [n, dugmeEl(b, 'dn-nesne dn-r-nesne', R_ADI[n], n, b.kutu(RP.bekle[i], RP.beklemeAlt, RP.n.h, 1), { nesne: n })]));
  const beklemeYeri = (n: RNesne) => b.kutu(RP.bekle[hepsi.indexOf(n)], RP.beklemeAlt, RP.n.h, 1);
  /** Rampa çizgisinde s (0 tepe, 1 uç) noktasına tabanı oturan nesnenin kutusu ve eğimi. */
  function cizgide(s: number) {
    const [x1, y1, x2, y2] = RP.cizgi[egim];
    const cx = x1 + (x2 - x1) * s, cy = y1 + (y2 - y1) * s;
    const x = rSol + (cx / 900) * rw, alt = rUst + (cy / 360) * R.h;
    const aci = Math.atan2(((y2 - y1) / 360) * R.h * ORAN, ((x2 - x1) / 900) * rw);
    return { stil: b.kutu(x, alt, RP.n.h, 1) + ';transform-origin:50% 95%;rotate:' + aci.toFixed(3) + 'rad', aci };
  }
  async function dene(n: RNesne, tahmin: boolean): Promise<boolean> {
    const el = nesneler.get(n)!;
    // Rampanın tepesine koy.
    b.isaretle('rp-koy');
    el.classList.add('sirada');
    b.cerenPoz('bekler');
    const p = b.birakisBekle([el], [rampaEl], () => 'rp-koy', rampaEl);
    if (!(await b.konus('rp-koy', a, true))) return false;
    const s = await p;
    if (!s) return false;
    el.classList.remove('sirada');
    await b.tasi(el, b.alan, cizgide(0.04).stil, 400, s.bas);
    if (tahmin) {
      b.isaretle('rp-tahmin');
      const rampaMini = mini(b, 'rampa-' + egim, 4, 30, 92, 60);
      const t = await ikiSecenek(b, a, 'rp-tahmin-kutu', [
        ['iner', 'İner', rampaMini + mini(b, n, 76, 52, 18, 30)],
        ['kalir', 'Kalır', rampaMini + mini(b, n, 8, egim === 'az' ? 22 : 6, 18, 30)],
      ]);
      if (t === undefined) return false;
    }
    // Bırak!
    b.isaretle('rp-birak');
    el.classList.add('sirada');
    const p2 = b.dokunusBekle([[el, true]], () => 'rp-birak');
    if (!(await b.konus('rp-birak', a, true))) return false;
    if ((await p2) === undefined) return false;
    el.classList.remove('sirada');
    const h = rampaHareketi(n, egim), ms = b.sakin || b.hizli ? 0 : inisSuresi(n, egim);
    el.dataset.hareket = h;
    if (h === 'kalir') {
      b.salla(el);
      if (!(await b.bekle(700, a))) return false;
    } else {
      const son = cizgide(1);
      el.classList.add(h === 'yuvarlanir' ? 'yuvarlaniyor' : h === 'tekerlek' ? 'tekerlekli' : 'kayiyor');
      el.style.setProperty('--inis', ms + 'ms');
      oyunSesi(h === 'kayar' ? 'kagit' : 'damla');
      await b.kaydir(el, () => { el.style.cssText = son.stil + ';--inis:' + ms + 'ms'; }, ms, 'cubic-bezier(.5,0,.75,.6)');
      await b.kaydir(el, () => { el.style.cssText = b.kutu(rSol + rw + 0.05, rUst + (RP.cizgi[egim][3] / 360) * R.h, RP.n.h, 1); }, ms ? 380 : 0, 'ease-out');
      el.classList.remove('yuvarlaniyor', 'tekerlekli', 'kayiyor');
      oyunSesi('kutu');
    }
    b.kinoPoz(h === 'kalir' ? 'saskin' : 'sevinc', 1300);
    const soz = h === 'kalir' ? 'rp-kutu-kaldi' : h === 'kayar' ? 'rp-kutu-kaydi' : egim === 'dik' && n === 'top' ? 'rp-top-hizli' : n === 'top' ? 'rp-top' : 'rp-araba';
    if (!(await b.konus(soz, a))) return false;
    // Nesne bekleme yerine döner.
    await b.kaydir(el, () => { el.style.cssText = beklemeYeri(n); delete el.dataset.hareket; }, 420);
    return b.canli(a);
  }

  b.isaretle('rp-giris');
  b.cerenPoz('sorar');
  b.kinoPoz('merak');
  if (!(await b.konus('rp-giris', a))) return;
  for (const n of plan.az) if (!(await dene(n, plan.tahminKutu && n === 'kup-kutu'))) return;
  // Rampayı dikleştir.
  b.isaretle('rp-dik');
  rampaEl.classList.add('sirada');
  b.cerenPoz('bekler');
  const p = b.dokunusBekle([[rampaEl, true]], () => 'rp-dik');
  if (!(await b.konus('rp-dik', a, true))) return;
  if ((await p) === undefined) return;
  rampaEl.classList.remove('sirada');
  egim = 'dik';
  rampaEl.dataset.egim = 'dik';
  rampaEl.innerHTML = b.resim('rampa-dik', 'dn-resim');
  oyunSesi('kutu');
  b.zipla(rampaEl, 0.3);
  for (const n of plan.dik) if (!(await dene(n, false))) return;
  b.isaretle('rp-sonuc');
  b.cerenPoz('sevinir');
  if (!(await b.konus('rp-sonuc', a, true))) return;
  if (plan.neden) { b.cerenPoz('sorar'); if (!(await b.konus('rp-neden', a, true))) return; }
  await b.bitis('rampa', a);
}

// ================= D12 · Bardaklarla müzik =================
declare global { interface Window { __bardakSesleri?: number[] } }
/** Cam bardağa tahta çubukla vuruş: temel ton ve hızla sönen iki üst ses (cam tınısı). Müzik değil, efekt kanalında tek vuruş. */
export function bardakSesi(s: Seviye) {
  window.__bardakSesleri?.push(s);
  const ctx = sesMotorunuAc(), cikis = efektCikisi();
  if (!ctx || !cikis) return;
  const f = BARDAK_TONU[s], t0 = ctx.currentTime;
  for (const [kat, guc, sure] of [[1, 0.2, 1.5], [2.32, 0.045, 0.55], [4.25, 0.02, 0.3]] as const) {
    const ton = ctx.createOscillator(), g = ctx.createGain();
    ton.type = 'sine';
    ton.frequency.setValueAtTime(f * kat, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(guc, t0 + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + sure);
    ton.connect(g).connect(cikis);
    ton.onended = () => { ton.disconnect(); g.disconnect(); };
    ton.start(t0);
    ton.stop(t0 + sure + 0.02);
  }
}
/** Bardak 300 × 380 (taban y 370), su seviyeleri aynı tuvalde; vuruş çubuğu Paket D'nin karıştırma çubuğu. */
const MZ = { x: [0.32, 0.44, 0.56, 0.68], alt: 0.82, h: 0.26, en: 300 / 380, cubuk: { x: 0.82, alt: 0.8, h: 0.3, en: 80 / 440 } };
export async function muzik(b: Baglam, a: number) {
  const k = b.kume(), plan = muzikPlani(k, b.gelis('muzik'));
  const bardaklar = plan.dizilis.map((s, i) => {
    const el = dugmeEl(b, 'dn-muzik-bardagi', 'Bardak', 'muzik-bardagi', b.kutu(MZ.x[i], MZ.alt, MZ.h, MZ.en), { seviye: String(s) });
    el.innerHTML = b.resim('su-seviye-' + s, 'dn-resim dn-su') + b.resim('muzik-bardagi', 'dn-resim');
    return el;
  });
  const bardak = (s: Seviye) => bardaklar[plan.dizilis.indexOf(s)];
  const cubukEv = () => b.kutu(MZ.cubuk.x, MZ.cubuk.alt, MZ.cubuk.h, MZ.cubuk.en);
  const cubuk = document.createElement('div');
  cubuk.className = 'dn-vurus-cubugu';
  cubuk.style.cssText = cubukEv();
  cubuk.innerHTML = b.resim('karistirma-cubugu', 'dn-resim');
  b.alan.append(cubuk);
  /** Çubuk bardağa gelir, vurur (ses), bardak titrer. */
  async function vur(el: HTMLElement) {
    const s = Number(el.dataset.seviye) as Seviye;
    const x = parseFloat(el.style.left) / 100 + parseFloat(el.style.width) / 200;
    cubuk.style.cssText = b.kutu(x + 0.035, MZ.alt - MZ.h * 0.28, MZ.cubuk.h, MZ.cubuk.en) + ';transform-origin:50% 95%;rotate:-28deg';
    bardakSesi(s);
    el.dataset.calindi = '1';
    if (!b.sakin && !b.hizli) {
      el.animate([{ transform: 'none' }, { transform: 'translateX(-1.5%)' }, { transform: 'translateX(1.5%)' }, { transform: 'none' }], { duration: 220 });
      cubuk.animate([{ rotate: '-28deg' }, { rotate: '-8deg' }, { rotate: '-28deg' }], { duration: 220, easing: 'ease-out' });
    }
    await b.bekle(b.sakin || b.hizli ? 0 : 420, a);
  }
  const cubuguKaldir = () => { cubuk.style.cssText = cubukEv(); };
  /** Ceren bardakları inceden kalına çalar (su az → çok). */
  async function incedenKalina(): Promise<boolean> {
    for (const s of SEVIYELER) { await vur(bardak(s)); if (!(await b.bekle(b.sakin || b.hizli ? 0 : 280, a))) return false; }
    cubuguKaldir();
    return b.canli(a);
  }

  b.isaretle('mz-giris');
  b.cerenPoz('sorar');
  b.kinoPoz('merak');
  // Serbest çalma: dört bardağın hepsine bir kez vurulur.
  const p0 = b.adim((bitir) => {
    const bos = b.bostaIzle(() => bardaklar.forEach((el) => { if (!el.dataset.calindi) b.zipla(el, 0.4); }), () => 'mz-giris');
    for (const el of bardaklar) el.onpointerdown = (e) => {
      if (!e.isPrimary || e.button !== 0) return;
      bos.dokundu();
      b.sus();
      void vur(el).then(() => { if (bardaklar.every((x) => x.dataset.calindi)) bitir(true); });
    };
    for (const el of bardaklar) el.onclick = (e) => { if (e.detail === 0) void vur(el).then(() => { if (bardaklar.every((x) => x.dataset.calindi)) bitir(true); }); };
    return () => { bos.dur(); for (const el of bardaklar) el.onpointerdown = el.onclick = null; };
  });
  if (!(await b.konus('mz-giris', a, true))) return;
  b.cerenPoz('bekler');
  if (!(await p0)) return;
  if (!(await b.bekle(500, a))) return;
  cubuguKaldir();
  if (plan.tahmin) {
    b.isaretle('mz-tahmin');
    b.cerenPoz('sorar');
    const p = b.dokunusBekle(bardaklar.map((el) => [el, Number(el.dataset.seviye) as Seviye] as const), () => 'mz-tahmin');
    if (!(await b.konus('mz-tahmin', a, true))) return;
    const t = await p;
    if (t === undefined) return;
    bardak(t).classList.add('tahmin');
    b.dunya.dataset.tahmin = String(t);
    oyunSesi('kagit');
    if (!(await b.konus('bakalim', a))) return;
  }
  b.isaretle('mz-dinle');
  if (!(await b.konus('mz-dinle', a))) return;
  if (!(await incedenKalina())) return;
  if (plan.tahmin && !(await b.konus('mz-kalin', a))) return;
  if (plan.sirala) {
    // Çocuk az sudan çok suya doğru çalar: yanlış bardak sallanır, ilk yanlışta Ceren ipucu verir.
    b.isaretle('mz-sirala');
    b.cerenPoz('bekler');
    let sira = 0, ipucu = false;
    bardaklar.forEach((el) => delete el.dataset.calindi);
    const p = b.adim((bitir) => {
      const bos = b.bostaIzle(() => b.zipla(bardak(SEVIYELER[sira]), 0.4), () => 'mz-sirala');
      const dokun = (el: HTMLElement) => {
        bos.dokundu();
        const s = Number(el.dataset.seviye);
        if (s !== SEVIYELER[sira]) {
          b.salla(el);
          if (!ipucu) { ipucu = true; void b.konus('mz-ipucu', a); }
          return;
        }
        b.sus();
        sira++;
        b.dunya.dataset.sira = String(sira);
        void vur(el).then(() => { if (sira >= SEVIYELER.length) bitir(true); });
      };
      for (const el of bardaklar) {
        el.onpointerdown = (e) => { if (e.isPrimary && e.button === 0) dokun(el); };
        el.onclick = (e) => { if (e.detail === 0) dokun(el); };
      }
      return () => { bos.dur(); for (const el of bardaklar) el.onpointerdown = el.onclick = null; };
    });
    if (!(await b.konus('mz-sirala', a, true))) return;
    if (!(await p)) return;
    cubuguKaldir();
    b.cerenPoz('sevinir');
    b.kinoPoz('sevinc', 1500);
    oyunSesi('parilti');
    if (!(await b.konus('mz-indi', a))) return;
  }
  for (const hedef of plan.kulak) {
    // Kulak oyunu: Ceren bir bardağın sesini çalar (bardağa dokunmadan); çocuk hangi bardak olduğunu bulur.
    b.isaretle('mz-kulak');
    b.dunya.dataset.kulak = String(hedef);
    b.cerenPoz('sorar');
    if (!(await b.konus('mz-kulak', a, true))) return;
    for (;;) {
      bardakSesi(hedef);
      const p = b.dokunusBekle(bardaklar.map((el) => [el, Number(el.dataset.seviye) as Seviye] as const), () => 'mz-kulak');
      const t = await p;
      if (t === undefined) return;
      await vur(bardak(t));
      cubuguKaldir();
      if (t === hedef) { oyunSesi('parilti'); b.kinoPoz('sevinc', 1200); if (!(await b.konus('mz-kulak-evet', a))) return; break; }
      if (!(await b.konus('mz-kulak-tekrar', a))) return;
    }
  }
  delete b.dunya.dataset.kulak;
  b.isaretle('mz-sonuc');
  b.cerenPoz('sevinir');
  if (!(await b.konus('mz-sonuc', a, true))) return;
  if (plan.neden) { b.cerenPoz('sorar'); if (!(await b.konus('mz-neden', a, true))) return; }
  await b.bitis('muzik', a);
}

export const YENI_DENEYLER: Partial<Record<DeneyId, (b: Baglam, a: number) => Promise<void>>> = { miknatis, golge, buz, tohum, rampa, muzik };
