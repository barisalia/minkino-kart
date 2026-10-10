/**
 * Veriyle sürülen sahne (content/film2/*.json → bicim.ts): oyunlu bölüm oynatıcısının (film/src/oyunlu/oynatici.ts)
 * bir parçası (Segment). Arka plan ve kamera oyunlu oynatıcınınkiyle aynı (mekan.ts, kameraYolu), oyuncular kesme
 * kukla (Aktor), duruşlar hareket.ts'ten. Hikâye zamanın saf fonksiyonudur: aynı t → aynı kare (kayıt kare kare).
 */
import type { KuklaIskelet, Matris } from '../kukla';
import { aralik } from '../kukla';
import { konusmaAgzi, konusmaGucu, type Zarf } from '../kukla-ses';
import { Aktor, heceAgzi, yeniDurus } from '../oyunlu/aktor';
import { kostumGiydir, PIJAMA, type Kostum } from '../oyunlu/kostum';
import { kucagaOtur, kucakCiz, kucakDurusu, lokumKucakta } from '../oyunlu/kucak';
import { arkaCiz, dprli, resim, sinirliKamera, type Mekan } from '../oyunlu/mekan';
import { bacakKur, Ikincil } from '../kukla-hareket';
import { kameraMatris, kameraYolu, type KameraAnahtar, type Ortam, type Segment, type Sozler } from '../oyunlu/oynatici';
import { zamanla, type Cizelge, type CozulenReplik, type Esya, type Olay, type Sahne, type Seri } from './bicim';
import { albumCiz, albumYakin, baslikCiz, battaniye, blokCiz, jenerikCiz, kartCiz, logoCiz } from './gorsel';
import { OyuncuHareket, type Cevre, type Kare, type Komut } from './hareket';

const KIT_JSON: Record<string, unknown> = import.meta.glob('../../../assets/karakter/*/*.json', { eager: true, import: 'default' });
const KIT_GORSEL: Record<string, string> = import.meta.glob<string>('../../../assets/karakter/*/**/*.webp', { eager: true, query: '?url', import: 'default' });
const SERI2_GORSEL: Record<string, string> = import.meta.glob<string>('../../../assets/film-seri2/*.{webp,png}', { eager: true, query: '?url', import: 'default' });
const MINKINO: Record<string, string> = import.meta.glob<string>('../../../assets/uygulama/logo-minkino-asil.webp', { eager: true, query: '?url', import: 'default' });
const KOSTUM: Record<string, Kostum> = { pijama: PIJAMA };

const seri2Adres = (ad: string) => SERI2_GORSEL[`../../../assets/film-seri2/${ad}.webp`] ?? SERI2_GORSEL[`../../../assets/film-seri2/${ad}.png`] ?? null;
/** kit yolu (seri.json → kitler) → iskelet ve parça adresleri; kit henüz yoksa null */
export function kitBul(yol: string): { iskelet: KuklaIskelet; klasor: string } | null {
  const j = KIT_JSON[`../../../assets/karakter/${yol}`] as KuklaIskelet | undefined;
  return j ? { iskelet: j, klasor: yol.split('/')[0] } : null;
}
const kitAdres = (klasor: string) => (d: string) => KIT_GORSEL[`../../../assets/karakter/${klasor}/${d}`];

const resimOnbellek = new Map<string, Promise<HTMLImageElement | null>>();
function gorselYukle(ad: string): Promise<HTMLImageElement | null> {
  let p = resimOnbellek.get(ad);
  if (!p) {
    const a = seri2Adres(ad);
    p = a ? resim(a).catch(() => null) : Promise.resolve(null);
    resimOnbellek.set(ad, p);
  }
  return p;
}

/** Sahnelerin ortak hâli */
export interface SahneBaglam {
  seri: Seri;
  sozler: Sozler;
  /** film saati (sn) */
  saat: () => number;
  /** replik kimliği → kayıt (yoksa yok) */
  sesler: Map<string, { url: string; sure: number; zarf: Zarf }>;
  /** eksik parçalar (kit, mekân, görsel, ses …): önizleme ve kayıt listeler */
  eksik: Set<string>;
  /** bölümün kimliği (fotoğraf görselleri: <bolum>-f1) */
  bolum: string;
}

interface OyuncuCalisma {
  h: OyuncuHareket;
  a: Aktor;
  kare: Kare | null;
}
interface EsyaCalisma {
  ad: string;
  tanim: Esya;
  komutlar: Komut[];
  img: HTMLImageElement | null;
  sonBag: { x: number; y: number; don: number } | null;
  birakma: Map<number, { x: number; y: number }>;
}

export class BolumSahnesi implements Segment {
  readonly ad: string;
  readonly cizelge: Cizelge;
  private oyuncular = new Map<string, OyuncuCalisma>();
  private esyalar: EsyaCalisma[] = [];
  private mekan: Mekan | null = null;
  private duz: { renk: string; boyut: [number, number] } | null = null;
  private kamera: KameraAnahtar[] = [];
  private son = -1;
  private logo: HTMLImageElement | null = null;
  private minkino: HTMLImageElement | null = null;
  private fotolar = new Map<number, HTMLImageElement | null>();
  private fotoOyuncu = new Map<string, Aktor>();
  private katman: HTMLCanvasElement | null = null;
  readonly cevre: Cevre;
  /** kapak: oyuncuların çevresinde beyaz kenar */
  vurgu = false;

  constructor(
    readonly s: Sahne,
    readonly b: SahneBaglam,
  ) {
    this.ad = s.kimlik;
    this.cizelge = zamanla(s, (r) => b.sesler.get(r.kimlik)?.sure);
    for (const r of this.cizelge.replikler) {
      const k = b.sesler.get(r.kimlik);
      if (k) b.sozler.sureler[r.kimlik] = k.sure;
      else b.eksik.add(`ses: ${r.kimlik} (${r.kim}) "${r.metin}"`);
    }
    const coz = this.cizelge.coz;
    const mt = b.seri.mekanlar[s.mekan];
    const varsayilanO = mt?.olcek ?? 0.275;
    // ---- oyuncular
    const olaylar = (s.olaylar ?? []).map((o) => ({ o, t0: coz(o.t) }));
    for (const [ad, tanim] of Object.entries(s.oyuncular)) {
      const yol = b.seri.kitler[tanim.kit];
      const kit = yol ? kitBul(yol) : null;
      if (!kit) {
        b.eksik.add(`kit: ${tanim.kit} (assets/karakter/${yol ?? tanim.kit})`);
        continue;
      }
      let isk = kit.iskelet;
      if (tanim.kostum) {
        const k = KOSTUM[tanim.kostum];
        if (k) isk = kostumGiydir(isk, k);
        else b.eksik.add(`kostüm: ${tanim.kit}/${tanim.kostum}`);
      }
      const a = new Aktor(ad, isk, kitAdres(kit.klasor));
      const komutlar: Komut[] = olaylar.filter((x) => x.o.kim === ad).map((x) => ({ t0: x.t0, t1: OyuncuHareket.bitis(x.o.yap, x.o, x.t0), yap: x.o.yap, o: x.o }));
      const kalca = isk.parcalar.kalca.pivot;
      const h = new OyuncuHareket(ad, { ...tanim, o: tanim.o ?? varsayilanO }, komutlar, { ayak: [kalca[0], isk.zemin], kalca });
      this.oyuncular.set(ad, { h, a, kare: null });
    }
    // ---- eşyalar
    for (const [ad, tanim] of Object.entries(s.esyalar ?? {})) {
      const komutlar: Komut[] = olaylar.filter((x) => x.o.kim === ad).map((x) => ({ t0: x.t0, t1: x.t0 + (typeof x.o.sure === 'number' ? x.o.sure : x.o.yap === 'birak' ? 0.45 : x.o.yap === 'dus' ? 0.7 : 0), yap: x.o.yap, o: x.o }));
      komutlar.sort((a, c) => a.t0 - c.t0);
      this.esyalar.push({ ad, tanim, komutlar, img: null, sonBag: null, birakma: new Map() });
    }
    // ---- kamera
    this.kamera = s.kamera.map((k) => {
      const t = coz(k.t);
      let x = k.x ?? 0, y = k.y ?? 0;
      if (k.odak) {
        const p = this.oyuncular.get(k.odak);
        if (p) {
          const q = p.h.konum(t);
          const boy = (p.a.zemin - p.a.k.iskelet.parcalar.kafa.pivot[1]) * (p.h.tanim.o ?? varsayilanO);
          x = q.x + (k.x ?? 0);
          y = q.y - boy * 0.7 + (k.y ?? 0);
        }
      }
      const kam = { x, y, g: k.g };
      return { t, yatay: kam, dikey: kam, gecis: k.gecis ?? 2 };
    });
    this.kamera.sort((a, c) => a.t - c.t);
    if (s.taslak) b.eksik.add(`sahneleme: ${s.kimlik} "${s.ad}" taslak (yalnız replikler ve kaba yerleşim)`);
    const self = this;
    this.cevre = {
      agiz: (kim, t) => self.agiz(kim, t),
      konusan: (t) => {
        for (const r of self.cizelge.replikler) if (r.kim !== 'anlatici' && t >= r.bas && t < r.son) return r.kim;
        return null;
      },
      konum: (kim, t) => self.oyuncular.get(kim)?.h.konum(t) ?? null,
      replikIfade: (kim, t) => {
        for (const r of self.cizelge.replikler) if (r.kim === kim && r.ifade && t >= r.bas - 0.15 && t < r.son + 0.3) return r.ifade;
        return null;
      },
    };
  }

  get sure() {
    return this.cizelge.sure;
  }

  private replik(kim: string, t: number): CozulenReplik | null {
    for (const r of this.cizelge.replikler) if (r.kim === kim && t >= r.bas && t < r.son) return r;
    return null;
  }
  /** konuşma ağzı: kayıt varsa ses zarfından, yoksa metnin hece ritminden */
  private agiz(kim: string, t: number): { agiz: string; guc: number } | null {
    const r = this.replik(kim, t);
    if (!r) return null;
    const k = this.b.sesler.get(r.kimlik);
    if (k) {
      const z = [{ ...k.zarf, t: r.bas }];
      const a = konusmaAgzi(z, t);
      if (!a) return null;
      return { agiz: a, guc: konusmaGucu(z, t) };
    }
    return heceAgzi(r.metin, t - r.bas);
  }

  async yukle() {
    const s = this.s, b = this.b;
    const mt = b.seri.mekanlar[s.mekan];
    if (mt?.resim) {
      const img = await gorselYukle(mt.resim);
      if (img) this.mekan = { img, ust: mt.ust ?? [0, 80], alt: mt.alt ?? [img.height - 96, img.height] };
      else b.eksik.add(`mekân: ${s.mekan} (assets/film-seri2/${mt.resim}.webp)`);
    }
    if (!this.mekan) this.duz = { renk: mt?.renk ?? '#cfc3b0', boyut: mt?.boyut ?? [2752, 1536] };
    for (const e of this.esyalar) {
      if (e.tanim.resim) {
        e.img = await gorselYukle(e.tanim.resim);
        if (!e.img) b.eksik.add(`görsel: ${e.tanim.resim} (assets/film-seri2/)`);
      } else if (e.tanim.tur === 'albüm' || e.tanim.tur === 'blok') b.eksik.add(`eşya çizimi: ${e.ad} (${e.tanim.tur}; şimdilik kodla yer tutucu)`);
    }
    if (s.yazilar?.some((y) => y.tur === 'logo')) {
      this.logo = await gorselYukle('logo');
      if (!this.logo) b.eksik.add('görsel: dizi logosu (assets/film-seri2/logo.webp; şimdilik yuvarlak yazı)');
    }
    if (s.yazilar?.some((y) => y.tur === 'minkino')) {
      const a = Object.values(MINKINO)[0];
      this.minkino = a ? await resim(a).catch(() => null) : null;
    }
    for (const e of s.ekler ?? []) {
      for (const n of [e.sayfa]) {
        const ad = `${b.bolum}-f${n}`;
        const img = await gorselYukle(ad);
        this.fotolar.set(n, img);
        if (!img) b.eksik.add(`görsel: albüm fotoğrafı ${ad} (assets/film-seri2/${ad}.webp; şimdilik kuklalarla yer tutucu)`);
      }
      for (const k of ['anne', 'baba', 'kino', 'lokum', 'dede']) {
        if (this.fotoOyuncu.has(k)) continue;
        const yol = b.seri.kitler[k];
        const kit = yol ? kitBul(yol) : null;
        if (kit) this.fotoOyuncu.set(k, new Aktor(k, kit.iskelet, kitAdres(kit.klasor)));
      }
    }
    await Promise.all([...[...this.oyuncular.values()].map((o) => o.a), ...this.fotoOyuncu.values()].map((a) => a.yukle()));
  }

  basla(t0: number) {
    this.son = t0 - 1e-6;
    for (const o of this.oyuncular.values()) o.a.ik = new Ikincil();
    // ortadan başlarken o an süren replikler
    for (const r of this.cizelge.replikler) if (r.bas < t0 && r.son > t0) this.b.sozler.soyle(r.kimlik, this.b.saat() - (t0 - r.bas));
    // yaylar otursun
    for (let i = 0; i < 6; i++) this.ilerlet(t0, 1 / 30);
  }

  adim(t: number, dt: number, _o: Ortam) {
    for (const r of this.cizelge.replikler) if (r.bas > this.son && r.bas <= t) this.b.sozler.soyle(r.kimlik, this.b.saat() - (t - r.bas));
    this.son = t;
    this.ilerlet(t, dt);
    return t >= this.cizelge.sure;
  }

  private ilerlet(t: number, dt: number) {
    const tasiyan = new Map<string, string>();
    for (const [ad, o] of this.oyuncular) if (o.h.tanim.kucakta && this.oyuncular.has(o.h.tanim.kucakta)) tasiyan.set(o.h.tanim.kucakta, ad);
    for (const [ad, o] of this.oyuncular) {
      // kucaktaki, taşıyanla birlikte kurulur
      if (o.h.tanim.kucakta && this.oyuncular.has(o.h.tanim.kucakta)) continue;
      const k = o.h.kare(t, this.cevre);
      if (tasiyan.has(ad)) kucakDurusu(k.d);
      o.kare = k;
      const a = o.a;
      a.yaz(k.d);
      // oturuşta bacaklar kitin sınırından da kısa katlanır (uyluk kameraya bakar)
      if (k.otur > 0) for (const t of ['sag', 'sol'] as const) bacakKur(a.k, t, t === 'sag' ? k.d.ayakSag : k.d.ayakSol, k.d.kalcaA, k.d.kalcaY, 0.55 - 0.4 * k.otur);
      const so = o.h.tanim.o ?? 0.275;
      const kalca = a.k.iskelet.parcalar.kalca.pivot;
      a.o = so;
      a.don = k.don;
      a.nokta = [kalca[0], kalca[1]];
      a.x = k.x + so * (kalca[0] - a.ortaX);
      a.y = k.y + so * (kalca[1] - a.zemin) + k.havaY * so;
      a.gorunur = k.gorunur;
      const tasinan = tasiyan.get(ad);
      a.adim(dt);
      if (tasinan) {
        const l = this.oyuncular.get(tasinan)!;
        // taşınanın duruşu taşıyandan sonra: önce kendi karesi, sonra kucağa oturur
        const lk = l.h.kare(t, this.cevre);
        lokumKucakta(lk.d);
        l.kare = lk;
        l.a.yaz(lk.d);
        l.a.don = 0;
        kucagaOtur(a, l.a);
        l.a.gorunur = lk.gorunur && k.gorunur;
        l.a.adim(dt);
      }
    }
    // eşyaların bağ noktaları (bırakıldıkları an için)
    for (const e of this.esyalar) {
      const bag = this.bagDurumu(e, t);
      if (bag) {
        const p = this.oyuncular.get(bag.hedef);
        if (p) {
          p.a.k.hesapla();
          const q = p.a.dunyaNoktasi(bag.parca, bag.nokta);
          e.sonBag = { x: q[0], y: q[1], don: p.a.don };
        }
      }
    }
  }

  /** eşyanın şu anki bağı (bagla … birak) */
  private bagDurumu(e: EsyaCalisma, t: number): { hedef: string; parca: string; nokta?: [number, number] } | null {
    let bag = e.tanim.bagli ? { ...e.tanim.bagli } : null;
    for (const k of e.komutlar) {
      if (k.t0 > t) break;
      if (k.yap === 'bagla') bag = { hedef: k.o.hedef as string, parca: k.o.parca as string, nokta: k.o.nokta as [number, number] | undefined };
      else if (k.yap === 'birak' || k.yap === 'kay' || k.yap === 'dus') bag = null;
    }
    return bag;
  }

  /** eşyanın konumu, görünürlüğü, z'si ve sayısal değerleri */
  private esyaHali(e: EsyaCalisma, t: number) {
    const tn = e.tanim;
    let x = tn.x, y = tn.y, don = tn.don ?? 0, gorunur = tn.gorunur ?? true, z = tn.z ?? 5;
    let bagli = !!tn.bagli;
    for (const k of e.komutlar) {
      if (k.t0 > t) break;
      const o = k.o;
      const u = k.t1 > k.t0 ? Math.min(1, (t - k.t0) / (k.t1 - k.t0)) : 1;
      if (k.yap === 'bagla') bagli = true;
      else if (k.yap === 'birak') {
        let bas = e.birakma.get(k.t0);
        if (!bas) {
          bas = e.sonBag ? { x: e.sonBag.x, y: e.sonBag.y } : { x, y };
          e.birakma.set(k.t0, bas);
        }
        bagli = false;
        const hx = typeof o.x === 'number' ? o.x : bas.x, hy = typeof o.y === 'number' ? o.y : bas.y + 120;
        x = bas.x + (hx - bas.x) * u;
        // düşüş: hızlanarak iner, küçük bir sekme
        const sek = u >= 1 ? 0 : u > 0.8 ? Math.sin(((u - 0.8) / 0.2) * Math.PI) * 18 : 0;
        y = bas.y + (hy - bas.y) * Math.min(1, (u / 0.8) ** 2) - sek;
        don = (typeof o.don === 'number' ? o.don : 20) * u;
      } else if (k.yap === 'dus') {
        bagli = false;
        const hx = typeof o.x === 'number' ? o.x : x, hy = typeof o.y === 'number' ? o.y : y;
        x = hx;
        const e2 = u < 0.7 ? (u / 0.7) ** 2 : 1;
        const sek = u >= 0.7 && u < 1 ? Math.sin(((u - 0.7) / 0.3) * Math.PI) * 30 : 0;
        y = hy - 700 * (1 - e2) - sek;
      } else if (k.yap === 'kay') {
        bagli = false;
        const hx = typeof o.x === 'number' ? o.x : x, hy = typeof o.y === 'number' ? o.y : y;
        const s = u * u * (3 - 2 * u);
        x = x + (hx - x) * s;
        y = y + (hy - y) * s;
      } else if (k.yap === 'goster') gorunur = true;
      else if (k.yap === 'gizle') gorunur = false;
      else if (k.yap === 'z') z = typeof o.deger === 'number' ? o.deger : z;
    }
    if (bagli && e.sonBag) {
      x = e.sonBag.x;
      y = e.sonBag.y;
    }
    return { x, y, don, gorunur, z };
  }

  private deger(e: EsyaCalisma, alan: string, t: number): number {
    let v = e.tanim.deger?.[alan] ?? 0;
    for (const k of e.komutlar) {
      if (k.t0 > t) break;
      if (k.yap !== 'ayarla' || k.o.alan !== alan) continue;
      const g = typeof k.o.gecis === 'number' ? k.o.gecis : 0.5;
      const hedef = k.o.deger as number;
      v = g <= 0 ? hedef : v + (hedef - v) * aralik(t, k.t0, k.t0 + g);
    }
    return v;
  }

  karanlik(t: number) {
    const k = this.s.kararma ?? {};
    const gir = k.gir ?? 0.8, cik = k.cik ?? 0.8;
    return Math.max(gir > 0 ? 1 - Math.min(1, t / gir) : 0, cik > 0 ? aralik(t, this.sure - cik, this.sure) : 0);
  }

  ciz(t: number, o: Ortam) {
    const { ctx, dpr, W, H } = o;
    const boyut = this.mekan ? { width: this.mekan.img.width, height: this.mekan.img.height } : { width: this.duz!.boyut[0], height: this.duz!.boyut[1] };
    const kam = sinirliKamera(kameraYolu(this.kamera, t, false), o, boyut);
    const K = kameraMatris(kam, W, H);
    const M = dprli(K, dpr);
    if (this.mekan) {
      if (this.s.arkaBulanik) ctx.filter = `blur(${this.s.arkaBulanik * dpr}px)`;
      arkaCiz(o, this.mekan, K);
      ctx.filter = 'none';
    } else {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = this.duz!.renk;
      ctx.fillRect(0, 0, W * dpr, H * dpr);
      if (!this.b.seri.mekanlar[this.s.mekan]?.renk) {
        // mekân görseli yok: yer tutucu
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = 'rgba(64,19,18,0.5)';
        ctx.font = `600 ${Math.round(H * 0.035)}px Fredoka, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(`mekân bekleniyor: ${this.s.mekan}`, W / 2, H * 0.12);
      }
    }
    // çizim listesi: oyuncular ve eşyalar z sırasıyla
    type Ogeler = { z: number; sira: number; ciz: (c: CanvasRenderingContext2D) => void };
    const liste: Ogeler[] = [];
    const tasiyan = new Map<string, string>();
    for (const [ad, x] of this.oyuncular) if (x.h.tanim.kucakta && this.oyuncular.has(x.h.tanim.kucakta)) tasiyan.set(x.h.tanim.kucakta, ad);
    let i = 0;
    for (const [ad, x] of this.oyuncular) {
      if (x.h.tanim.kucakta && this.oyuncular.has(x.h.tanim.kucakta)) continue;
      const k = x.kare;
      if (!k) continue;
      liste.push({
        z: k.z,
        sira: i++,
        ciz: (c) => {
          const pen = x.h.tanim.pencere;
          if (pen) {
            c.save();
            c.setTransform(...M);
            c.beginPath();
            c.rect(...pen.kirp);
            c.clip();
          }
          const tasinan = tasiyan.get(ad);
          if (tasinan) kucakCiz(c, M, x.a, this.oyuncular.get(tasinan)!.a);
          else x.a.ciz(c, M, k.yalniz || k.haric ? { yalniz: k.yalniz, haric: k.haric } : undefined);
          if (pen) {
            c.restore();
            if (pen.on && this.mekan) {
              c.setTransform(...M);
              const [px, py, pw, ph] = pen.on;
              c.drawImage(this.mekan.img, px, py, pw, ph, px, py, pw, ph);
            }
          }
        },
      });
    }
    for (const e of this.esyalar) {
      const hal = this.esyaHali(e, t);
      if (!hal.gorunur) continue;
      liste.push({ z: hal.z, sira: i++, ciz: (c) => this.esyaCiz(c, e, hal, t, M) });
    }
    liste.sort((a, c) => a.z - c.z || a.sira - c.sira);
    if (this.vurgu) this.vurguluCiz(o, liste);
    else for (const x of liste) x.ciz(ctx);
    // ekler (tam ekran yakın plan) ve yazılar
    this.eklerCiz(t, o);
    this.yazilarCiz(t, o);
  }

  /** kapak: oyuncular ayrı katmanda, çevresinde beyaz kenar ve yumuşak gölge */
  private vurguluCiz(o: Ortam, liste: { ciz: (c: CanvasRenderingContext2D) => void }[]) {
    const { ctx } = o;
    const kat = (this.katman ??= document.createElement('canvas'));
    kat.width = ctx.canvas.width;
    kat.height = ctx.canvas.height;
    const c = kat.getContext('2d')!;
    for (const x of liste) x.ciz(c);
    c.setTransform(1, 0, 0, 1, 0, 0);
    const r = Math.max(4, ctx.canvas.width * 0.005);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.shadowColor = 'rgba(64,19,18,0.45)';
    ctx.shadowBlur = r * 3;
    ctx.shadowOffsetY = r;
    const beyaz = document.createElement('canvas');
    beyaz.width = kat.width;
    beyaz.height = kat.height;
    const bc = beyaz.getContext('2d')!;
    for (let a = 0; a < 16; a++) bc.drawImage(kat, Math.cos((a / 16) * Math.PI * 2) * r, Math.sin((a / 16) * Math.PI * 2) * r);
    bc.globalCompositeOperation = 'source-in';
    bc.fillStyle = '#ffffff';
    bc.fillRect(0, 0, beyaz.width, beyaz.height);
    ctx.drawImage(beyaz, 0, 0);
    ctx.shadowColor = 'transparent';
    ctx.drawImage(kat, 0, 0);
    ctx.restore();
  }

  private esyaCiz(c: CanvasRenderingContext2D, e: EsyaCalisma, hal: { x: number; y: number; don: number }, t: number, M: Matris) {
    const tn = e.tanim;
    c.save();
    c.setTransform(...M);
    c.translate(hal.x, hal.y);
    if (hal.don) c.rotate((hal.don * Math.PI) / 180);
    const s = tn.olcek ?? 1;
    if (tn.tur === 'resim' && e.img) {
      c.scale(s, s);
      c.drawImage(e.img, 0, 0);
    } else if (tn.tur === 'battaniye' && e.img) {
      c.scale(s, s);
      let titre = this.deger(e, 'titre', t);
      if (tn.canli) {
        const a = this.agiz(tn.canli, t);
        if (a) titre += a.guc * 0.5;
        titre += hickirAgirlik(this.s.olaylar ?? [], tn.canli, t, this.cizelge.coz);
      }
      battaniye(c, e.img, this.deger(e, 'tumsek', t), tn.deger?.merkez ?? 0.5, titre, t);
    } else if (tn.tur === 'albüm') {
      albumCiz(c, 120 * s, this.deger(e, 'ac', t));
    } else if (tn.tur === 'blok') {
      blokCiz(c, 70 * s, tn.renk ?? '#e5483f');
    }
    c.restore();
  }

  private eklerCiz(t: number, o: Ortam) {
    const { ctx, W, H, dpr } = o;
    for (const e of this.s.ekler ?? []) {
      const t0 = this.cizelge.coz(e.t), t1 = this.cizelge.coz(e.son), g = e.gecis ?? 0.7;
      if (t < t0 || t > t1) continue;
      const a = aralik(t, t0, t0 + g) * (1 - aralik(t, t1 - g, t1));
      if (a <= 0) continue;
      const kat = (this.katman ??= document.createElement('canvas'));
      kat.width = ctx.canvas.width;
      kat.height = ctx.canvas.height;
      const c = kat.getContext('2d')!;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      const [y0, y1] = e.yakin ?? [1, 1.12];
      const u = (t - t0) / Math.max(0.01, t1 - t0);
      const yakin = y0 * Math.pow(y1 / y0, u * u * (3 - 2 * u));
      albumYakin(c, W, H, e.sayfa, yakin, t, (n, x, y, w, h) => this.fotoCiz(c, n, x, y, w, h));
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = a;
      ctx.drawImage(kat, 0, 0);
      ctx.restore();
    }
  }

  /** albüm fotoğrafı: Gemini görseli varsa o, yoksa kuklalarla kurulmuş yer tutucu */
  private fotoCiz(c: CanvasRenderingContext2D, n: number, x: number, y: number, w: number, h: number) {
    const img = this.fotolar.get(n);
    if (img) {
      const s = Math.max(w / img.width, h / img.height);
      c.drawImage(img, x + (w - img.width * s) / 2, y + (h - img.height * s) / 2, img.width * s, img.height * s);
      return;
    }
    // zemin: duvar ve kilim
    const g = c.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, n >= 100 ? '#bfe3f2' : '#fbe3c2');
    g.addColorStop(0.72, n >= 100 ? '#e6f4fa' : '#f4cfa5');
    g.addColorStop(0.72, n >= 100 ? '#9fd27d' : '#d9a066');
    g.addColorStop(1, n >= 100 ? '#86c063' : '#c98a4b');
    c.fillStyle = g;
    c.fillRect(x, y, w, h);
    if (n >= 100) {
      // küçük süs fotoğraf: güneşli bahçe
      c.fillStyle = '#ffd27a';
      c.beginPath();
      c.arc(x + w * 0.78, y + h * 0.25, h * 0.12, 0, Math.PI * 2);
      c.fill();
      return;
    }
    const oy = (ad: string) => this.fotoOyuncu.get(ad);
    const ayak = y + h * 0.97;
    const kur = (a: Aktor, px: number, o: number, ayar: (d: ReturnType<typeof yeniDurus>) => void) => {
      const d = yeniDurus();
      d.gozler = 'gozler-mutlu';
      d.agiz = 'agiz-genis';
      ayar(d);
      a.yaz(d);
      a.o = o;
      a.don = 0;
      a.nokta = [a.ortaX, a.zemin];
      a.x = px;
      a.y = ayak;
      a.k.hesapla();
    };
    // kuklalar mutlak dönüşümle çizer: fotoğrafın (döndürülmüş) karesi taban olur
    const T = c.getTransform();
    const kimlik: Matris = [T.a, T.b, T.c, T.d, T.e, T.f];
    c.save();
    if (n === 1) {
      // bebek Kino'ya herkes bakıyor (bebek Kino: Lokum kiti, seri kitabındaki gibi)
      const o = (h * 0.98) / (2038 * 1.6);
      const anne = oy('anne'), dede = oy('dede') ?? oy('baba'), lokum = oy('lokum');
      if (dede) {
        kur(dede, x + w * 0.74, o, (d) => {
          d.gozler = 'gozler-sola';
        });
        dede.ciz(c, kimlik);
      }
      if (anne && lokum) {
        kur(anne, x + w * 0.36, o, (d) => {
          kucakDurusu(d);
          d.gozler = 'gozler-saga';
        });
        const dl = yeniDurus();
        lokumKucakta(dl);
        dl.gozler = 'gozler-mutlu';
        dl.agiz = 'agiz-kahkaha';
        lokum.yaz(dl);
        lokum.don = 0;
        kucagaOtur(anne, lokum);
        kucakCiz(c, kimlik, anne, lokum);
      }
    } else {
      // Lokum'un ilk günü: üç yaşındaki Kino kucağında bebek Lokum
      const kino = oy('kino'), lokum = oy('lokum');
      const o = (h * 0.8) / 2038;
      if (kino) {
        kur(kino, x + w * 0.44, o, (d) => {
          // kollar önde, kucaktaki kardeşi sarar
          d.kolSag = -16;
          d.kolSol = 16;
          d.dirsekSag = -88;
          d.dirsekSol = 88;
          d.gozler = 'gozler-mutlu';
          d.kafaA = -5;
        });
        kino.ciz(c, kimlik, { haric: ['kol-sag', 'kol-sol', 'kol-ust-sag-dikis', 'kol-ust-sol-dikis'] });
      }
      if (lokum) {
        const ol = o * 0.5;
        kur(lokum, x + w * 0.47, ol, (d) => {
          d.gozler = 'gozler-sola';
          d.agiz = 'agiz-o';
          d.kafaA = -10;
        });
        lokum.y = ayak - h * 0.2;
        lokum.ciz(c, kimlik);
        // kundak
        c.setTransform(T);
        c.fillStyle = '#bfe3f2';
        c.strokeStyle = '#401312';
        c.lineWidth = w * 0.008;
        c.beginPath();
        c.ellipse(x + w * 0.47, ayak - h * 0.2 - 300 * ol, 330 * ol, 330 * ol, 0, 0, Math.PI * 2);
        c.fill();
        c.stroke();
      }
      if (kino) kino.ciz(c, kimlik, { yalniz: ['kol-sag', 'kol-sol'] });
    }
    c.restore();
  }

  private yazilarCiz(t: number, o: Ortam) {
    const { ctx, W, H, dpr } = o;
    for (const y of this.s.yazilar ?? []) {
      const t0 = this.cizelge.coz(y.t), t1 = this.cizelge.coz(y.son);
      if (t < t0 || t > t1) continue;
      const cikis = (t1 - t) / 0.5;
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (y.tur === 'logo') logoCiz(ctx, W, H, t - t0, cikis, this.logo);
      else if (y.tur === 'baslik') baslikCiz(ctx, W, H, y.metin ?? '', t - t0, cikis);
      else if (y.tur === 'kart') kartCiz(ctx, W, H, y.metin ?? '', Math.min(1, (t - t0) / 0.6, cikis));
      else if (y.tur === 'minkino' || y.tur === 'jenerik') jenerikCiz(ctx, W, H, y.satirlar ?? (y.metin ? [y.metin] : []), Math.min(1, (t - t0) / 0.6, cikis), y.tur === 'minkino' ? this.minkino : null);
      ctx.restore();
    }
  }
}

/** battaniyenin altındaki oyuncunun hıçkırığı: tümsek zıplar */
function hickirAgirlik(olaylar: Olay[], kim: string, t: number, coz: (z: string | number) => number): number {
  let g = 0;
  for (const o of olaylar) {
    if (o.kim !== kim || o.yap !== 'hickir') continue;
    const t0 = coz(o.t), s = typeof o.sure === 'number' ? o.sure : 0.45;
    if (t >= t0 && t < t0 + s) g += Math.sin((Math.PI * (t - t0)) / s);
  }
  return g * 0.6;
}
