/**
 * Oyunlu çizgi filmin oyuncusu: kesme kukla (film/src/kukla.ts) + duruş + ikincil hareket (kulak, kuyruk, el yayları)
 * + canlılık (nefes, göz kırpma, konuşurken hece ritmiyle ağız). Duruşlar zamanın saf fonksiyonudur (aynı t → aynı
 * kare); yalnız yaylar kare kare ilerler. Kit birimi: Kino C karesi (assets/karakter/aile-boy.json: bütün kitler aynı
 * birimde, aynı ölçekle basılınca boylar tablodaki gibi çıkar).
 */
import { aralik, carp, Kukla, tasan, uygula, type KuklaIskelet, type Matris } from '../kukla';
import { bacakKur, Ikincil, type AyakHedef } from '../kukla-hareket';

export interface Durus {
  kalcaX: number; kalcaY: number; kalcaA: number;
  govdeA: number; govdeSy: number;
  kafaA: number; kafaY: number;
  kuyruk: number;
  kolSag: number; kolSol: number; dirsekSag: number; dirsekSol: number; elSag: number; elSol: number;
  ayakSag: AyakHedef; ayakSol: AyakHedef;
  kulakSag: number; kulakSol: number;
  gozler: string; kaslar: string; agiz: string;
  /** yanakları şişir (gargara) 0..1 */
  yanak: number;
}
export const yeniDurus = (): Durus => ({
  kalcaX: 0, kalcaY: 0, kalcaA: 0, govdeA: 0, govdeSy: 1, kafaA: 0, kafaY: 0, kuyruk: 0,
  kolSag: 0, kolSol: 0, dirsekSag: 0, dirsekSol: 0, elSag: 0, elSol: 0,
  ayakSag: { x: 0, y: 0 }, ayakSol: { x: 0, y: 0 }, kulakSag: 0, kulakSol: 0,
  gozler: 'gozler-acik', kaslar: 'kaslar-notr', agiz: 'agiz-gulumse', yanak: 0,
});

// ---------------------------------------------------------------- canlılık
export function nefes(d: Durus, t: number, hiz = 0.33, faz = 0, guc = 1) {
  const n = Math.sin(2 * Math.PI * (t * hiz + faz));
  d.govdeSy += 0.007 * n * guc;
  d.kafaY += -3.2 * n * guc;
  d.kolSag += 0.8 * n * guc;
  d.kolSol -= 0.8 * n * guc;
}
const rastgele = (n: number) => {
  const x = Math.sin(n * 12.9898 + 4.1414) * 43758.5453;
  return x - Math.floor(x);
};
/** kendiliğinden göz kırpma: 2,4-4,6 sn arayla (tohuma göre her oyuncuda başka ritim), arada bir çift kırpma */
export function kirp(d: Durus, t: number, tohum: number) {
  if (d.gozler === 'gozler-mutlu' || d.gozler === 'gozler-kapali') return;
  let a = rastgele(tohum) * 2;
  for (let i = 0; a < t + 0.3 && i < 2000; i++) {
    const x = t - a;
    if (x >= 0 && x < 0.2) {
      d.gozler = x < 0.05 || x >= 0.14 ? 'gozler-yari' : 'gozler-kapali';
      return;
    }
    a += rastgele(tohum * 31 + i) < 0.15 ? 0.32 : 2.4 + 2.2 * rastgele(tohum * 7 + i);
  }
}
export function kuyrukSalla(d: Durus, t: number, hiz: number, genlik: number) {
  d.kuyruk += genlik * Math.sin(2 * Math.PI * hiz * t);
}

// ---------------------------------------------------------------- konuşma (kayıt yok: metnin hece ritmi)
const UNLU = /[aeıioöuüâîû]/gi;
/** cümlenin söylenme süresi (sn): hece sayısı + noktalama duraklamaları; anlatıcı biraz daha yavaş */
export function sozSuresi(metin: string, anlatici = false): number {
  const hece = (metin.match(UNLU) ?? []).length;
  const durak = (metin.match(/[.!?…,]/g) ?? []).length;
  return (0.3 + hece * (anlatici ? 0.215 : 0.19) + durak * 0.22) * (anlatici ? 1.05 : 1);
}
/** konuşma anında ağız: hece ritmi (5,2 hece/sn), sesliye göre biçim; {agiz, guc} ya da null */
export function heceAgzi(metin: string, x: number): { agiz: string; guc: number } | null {
  const unluler = (metin.toLocaleLowerCase('tr').match(UNLU) ?? []) as string[];
  if (x < 0 || !unluler.length) return null;
  const u = x * 5.2;
  const i = Math.floor(u), f = u - i;
  if (i >= unluler.length) return null;
  const a = Math.sin(Math.PI * f) * (0.6 + 0.4 * rastgele(i + unluler.length));
  const s = unluler[i];
  if (a < 0.2) return { agiz: 'agiz-az', guc: a };
  if ('oöuü'.includes(s)) return { agiz: 'agiz-o', guc: a };
  if ('ıi'.includes(s)) return { agiz: a > 0.6 ? 'agiz-e' : 'agiz-az', guc: a };
  return { agiz: a < 0.55 ? 'agiz-orta' : 'agiz-genis', guc: a };
}

// ---------------------------------------------------------------- jestler
/** el sallama / kol kaldırma: g 0..1 */
export function kolKaldir(d: Durus, taraf: 'sag' | 'sol', g: number, aci = 120, dirsek = 20) {
  if (taraf === 'sag') {
    d.kolSag += aci * g;
    d.dirsekSag += dirsek * g;
  } else {
    d.kolSol -= aci * g;
    d.dirsekSol -= dirsek * g;
  }
}
export { aralik, tasan };

// ---------------------------------------------------------------- oyuncu
export class Aktor {
  readonly k: Kukla;
  ik = new Ikincil();
  /** dünyadaki kök: kit noktası `nokta` dünyada (x, y)'de, `don` derece döner, `o` dünya birimi / kit birimi */
  x = 0;
  y = 0;
  o = 0.3;
  don = 0;
  /** kökün kit noktası (varsayılan: ayakların ortası, zemin) */
  nokta: [number, number];
  gorunur = true;
  readonly ortaX: number;
  readonly zemin: number;

  constructor(
    readonly ad: string,
    iskelet: KuklaIskelet,
    adres: (dosya: string) => string,
  ) {
    this.k = new Kukla(iskelet, adres);
    this.ortaX = iskelet.parcalar.kalca.pivot[0];
    this.zemin = iskelet.zemin;
    this.nokta = [this.ortaX, this.zemin];
  }

  yukle() {
    return this.k.yukle();
  }

  /** duruşu kuklaya yazar */
  yaz(d: Durus) {
    const k = this.k;
    k.poz = {};
    const P = k.poz;
    k.secim.gozler = d.gozler;
    k.secim.kaslar = d.kaslar;
    k.secim.agiz = d.agiz;
    P.kalca = { a: d.kalcaA, x: d.kalcaX, y: d.kalcaY };
    P.govde = { a: d.govdeA, sx: 1 + (1 - d.govdeSy) * 0.5, sy: d.govdeSy };
    P.kafa = { a: d.kafaA, y: d.kafaY };
    P.kuyruk = { a: d.kuyruk };
    P['kulak-sag'] = { a: d.kulakSag };
    P['kulak-sol'] = { a: d.kulakSol };
    P['kol-ust-sag'] = { a: d.kolSag };
    P['kol-ust-sol'] = { a: d.kolSol };
    if (k.iskelet.parcalar['kol-ust-sag-dikis']) {
      const dikis = (a: number) => ({ o: Math.max(0, Math.min(1, (Math.abs(a) - 6) / 18)) });
      P['kol-ust-sag-dikis'] = dikis(d.kolSag);
      P['kol-ust-sol-dikis'] = dikis(d.kolSol);
    }
    P['kol-alt-sag'] = { a: d.dirsekSag };
    P['kol-alt-sol'] = { a: d.dirsekSol };
    P['el-sag'] = { a: d.elSag };
    P['el-sol'] = { a: d.elSol };
    if (d.yanak > 0) P.yanaklar = { sx: 1 + 0.16 * d.yanak, sy: 1 + 0.5 * d.yanak, y: 14 * d.yanak };
    bacakKur(k, 'sag', d.ayakSag, d.kalcaA, d.kalcaY);
    bacakKur(k, 'sol', d.ayakSol, d.kalcaA, d.kalcaY);
  }

  /** kit → dünya dönüşümü */
  dunya(): Matris {
    const r = (this.don * Math.PI) / 180, c = Math.cos(r) * this.o, s = Math.sin(r) * this.o;
    const [nx, ny] = this.nokta;
    return [c, s, -s, c, this.x - (c * nx - s * ny), this.y - (s * nx + c * ny)];
  }

  /** ikincil hareketi bir adım ilerletir ve yayları duruşa ekler (her karede bir kez, yaz() sonrası) */
  adim(dt: number) {
    // yaylar kökün dünyadaki kaymasını kit biriminde görür
    this.ik.adim(this.k, [this.x / this.o, this.y / this.o], dt);
    this.ik.uygula(this.k);
  }

  /** kamera: dünya → canvas pikseli */
  ciz(ctx: CanvasRenderingContext2D, kamera: Matris, secim?: { yalniz?: string[]; haric?: string[] }) {
    if (!this.gorunur) return;
    this.k.ciz(ctx, carp(kamera, this.dunya()), secim);
  }

  /** kit noktasının dünyadaki yeri (parça dönüşümleriyle; ciz() ya da k.hesapla() sonrası) */
  dunyaNoktasi(parca: string, p?: [number, number]): [number, number] {
    return uygula(this.dunya(), this.k.nokta(parca, p));
  }
}

/**
 * Eli kit karesindeki bir noktaya götürür (gövdenin dönmediği varsayılır; küçük eğilmeler tolere edilir): dirsek
 * dışarıda kalır. g 0..1 karışım (duruştaki açılarla). Kısa çizgi film kolları ağız hizasına ancak yetişir.
 */
export function eliGotur(d: Durus, a: Aktor, taraf: 'sag' | 'sol', hedef: [number, number], g = 1) {
  if (g <= 0) return;
  const p = a.k.iskelet.parcalar;
  const omuz = p[`kol-ust-${taraf}`].pivot, dirsek = p[`kol-alt-${taraf}`].pivot, bilek = p[`el-${taraf}`].pivot;
  // iki çözümden doğal olanı: dirsek aşağıda ve dışarıda
  let en: [number, number] = [0, 0], enPuan = -Infinity;
  for (const buk of [1, -1] as const) {
    const c = kolCoz(omuz, dirsek, bilek, hedef, buk);
    const r = (c[0] * Math.PI) / 180;
    const ex = omuz[0] + (dirsek[0] - omuz[0]) * Math.cos(r) - (dirsek[1] - omuz[1]) * Math.sin(r);
    const ey = omuz[1] + (dirsek[0] - omuz[0]) * Math.sin(r) + (dirsek[1] - omuz[1]) * Math.cos(r);
    const puan = ey + 0.6 * (taraf === 'sag' ? -ex : ex);
    if (puan > enPuan) {
      enPuan = puan;
      en = c;
    }
  }
  if (taraf === 'sag') {
    d.kolSag = d.kolSag * (1 - g) + en[0] * g;
    d.dirsekSag = d.dirsekSag * (1 - g) + en[1] * g;
  } else {
    d.kolSol = d.kolSol * (1 - g) + en[0] * g;
    d.dirsekSol = d.dirsekSol * (1 - g) + en[1] * g;
  }
}

/** iki kemikli kol çözücü (kit karesinde): omuz, dirsek, bilek dinlenme noktaları ve hedef; dönüş: üst ve alt kol açısı */
export function kolCoz(omuz: [number, number], dirsek: [number, number], bilek: [number, number], hedef: [number, number], buk: 1 | -1): [number, number] {
  const l1 = Math.hypot(dirsek[0] - omuz[0], dirsek[1] - omuz[1]);
  const l2 = Math.hypot(bilek[0] - dirsek[0], bilek[1] - dirsek[1]);
  const dx = hedef[0] - omuz[0], dy = hedef[1] - omuz[1];
  const d = Math.max(Math.abs(l1 - l2) + 1, Math.min(l1 + l2 - 0.5, Math.hypot(dx, dy)));
  const taban = Math.atan2(dy, dx);
  const alfa = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
  const ust = taban + buk * alfa;
  const ex = omuz[0] + Math.cos(ust) * l1, ey = omuz[1] + Math.sin(ust) * l1;
  const alt = Math.atan2(hedef[1] - ey, hedef[0] - ex);
  const dinUst = Math.atan2(dirsek[1] - omuz[1], dirsek[0] - omuz[0]);
  const dinAlt = Math.atan2(bilek[1] - dirsek[1], bilek[0] - dirsek[0]);
  const derece = (r: number) => {
    let a = (r * 180) / Math.PI;
    while (a > 180) a -= 360;
    while (a < -180) a += 360;
    return a;
  };
  const a1 = derece(ust - dinUst);
  return [a1, derece(alt - dinAlt - (ust - dinUst))];
}
