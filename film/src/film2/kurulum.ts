/**
 * Bölüm kurulumu: bölüm dosyasının parçaları → sahneler (BolumSahnesi), oynatıcı (tek canvas), ses karışımı planı ve
 * altyazı satırları. YouTube kaydı (film/src/film2/main.ts) ve uygulama oynatıcısı (ekran.ts) aynı kurulumu kullanır;
 * fark yalnız ses dosyalarının kaynağı (tam kalite / uygulama için sıkıştırılmış) ve kare saatinin nereden geldiği.
 */
import { zarfCikar } from '../kukla-ses';
import { filmMuzikAdresi } from '../muzik';
import { Oynatici, Sozler, type SozTanim } from '../oyunlu/oynatici';
import { etiketsiz, type Sahne, type Seri } from './bicim';
import { efektVar, type KarisimPlani } from './karisim';
import { BolumSahnesi, type SahneBaglam } from './sahne';

export const FPS = 30;

export interface Kurulum {
  parcalar: BolumSahnesi[];
  /** parçaların bölüm saatindeki başlangıçları (kare sınırında) */
  baslar: number[];
  toplam: number;
  oynatici: Oynatici;
  plan: KarisimPlani;
  altyazi: { bas: number; son: number; metin: string }[];
  eksik: Set<string>;
}

export interface KurulumSecenek {
  seri: Seri;
  /** bölüm kimliği kısa: b01 (albüm fotoğrafları b01-f1) */
  bolum: string;
  sahneler: Sahne[];
  tuval: HTMLCanvasElement;
  /** replik kimliği → ses dosyası adresi */
  sesAdresi: (kimlik: string) => string | null;
  kazancDb?: number;
}

async function sesleriHazirla(sahneler: Sahne[], sesAdresi: KurulumSecenek['sesAdresi']) {
  const sesler: SahneBaglam['sesler'] = new Map();
  await Promise.all(
    sahneler.flatMap((s) =>
      s.replikler.map(async (r) => {
        const url = sesAdresi(r.kimlik);
        if (!url) return;
        try {
          const zarf = await zarfCikar(url, r.metin, 0, FPS);
          sesler.set(r.kimlik, { url, sure: zarf.zarf.length / FPS, zarf });
        } catch (e) {
          console.warn('ses okunamadı', r.kimlik, e);
        }
      }),
    ),
  );
  return sesler;
}

export async function kur(o: KurulumSecenek): Promise<Kurulum> {
  const tablo: Record<string, SozTanim> = {};
  for (const s of o.sahneler) for (const r of s.replikler) tablo[r.kimlik] = { kim: r.kim, metin: r.metin };
  const sozler = new Sozler(tablo);
  const eksik = new Set<string>();
  const sesler = await sesleriHazirla(o.sahneler, o.sesAdresi);
  let oynatici!: Oynatici;
  const b: SahneBaglam = { seri: o.seri, sozler, saat: () => oynatici.saat, sesler, eksik, bolum: o.bolum };
  const parcalar = o.sahneler.map((s) => new BolumSahnesi(s, b));
  oynatici = new Oynatici(o.tuval, parcalar, sozler);
  await Promise.all(parcalar.map((p) => p.yukle()));
  const baslar: number[] = [];
  let T = 0;
  const plan: KarisimPlani = { sure: 0, sesler: [], muzik: [], efektler: [], konusma: [], kazancDb: o.kazancDb };
  const altyazi: Kurulum['altyazi'] = [];
  for (const p of parcalar) {
    // sahne süresi kare sınırına yuvarlanır: görüntü ve ses aynı saati sayar
    const sure = Math.ceil(p.sure * FPS - 1e-6) / FPS;
    baslar.push(T);
    const c = p.cizelge;
    for (const r of c.replikler) {
      const k = sesler.get(r.kimlik);
      if (k) {
        plan.sesler.push({ url: k.url, t: T + r.bas });
        plan.konusma.push([T + r.bas, T + r.son]);
      }
      altyazi.push({ bas: T + r.bas, son: T + r.son, metin: etiketsiz(r.metin) });
    }
    const muzik = (p.s.muzik ?? []).map((m) => ({ ...m, t: c.coz(m.t) })).sort((a, z) => a.t - z.t);
    muzik.forEach((m, i) => {
      if (!m.ad) return;
      if (!filmMuzikAdresi(m.ad)) {
        eksik.add(`müzik: assets/muzik/${m.ad}.mp3`);
        return;
      }
      const sonraki = muzik[i + 1];
      const son = Math.min(sure, sonraki ? sonraki.t + (sonraki.gir ?? 1) * 0.5 : sure);
      plan.muzik.push({ ad: m.ad, t: T + m.t, son: T + son, ses: m.ses ?? 0.35, gir: m.gir ?? 1, cik: m.cik ?? 1.2, dongu: m.dongu ?? true });
    });
    for (const e of p.s.efektler ?? []) {
      if (!efektVar(e.ad)) {
        eksik.add(`efekt: ${e.ad} (assets/film-seri2/efekt/${e.ad}.mp3)`);
        continue;
      }
      plan.efektler.push({ ad: e.ad, t: T + c.coz(e.t), ses: e.ses ?? 1 });
    }
    T += sure;
  }
  plan.sure = T;
  return { parcalar, baslar, toplam: T, oynatici, plan, altyazi, eksik };
}

/** bölüm saati T → parça ve parçanın içindeki an */
export function bul(k: Kurulum, T: number): [number, number] {
  let i = 0;
  while (i + 1 < k.baslar.length && T >= k.baslar[i + 1] - 1e-9) i++;
  return [i, T - k.baslar[i]];
}

/**
 * Sürücü: oynatıcının çizimini (kararma, altyazı) kullanır, saati kendisi sayar (kare sınırları kesin, ileri sarma).
 * git(T): T anına getirir (parça değişirse yeni parça başlar); ilerle(T): önceki kareden T'ye küçük adımlarla.
 */
export class Surucu {
  i = -1;
  T = 0;
  constructor(readonly k: Kurulum) {}
  git(T: number, dt = 1 / FPS, atla = false) {
    const o = this.k.oynatici;
    const [i, t] = bul(this.k, T);
    o.saat = T;
    if (i !== this.i || atla) {
      if (atla) o.sozler.temizle();
      this.i = i;
      o.i = i;
      this.k.parcalar[i].basla(t);
    }
    o.t = t;
    this.k.parcalar[i].adim(t, dt, o.ortam);
    this.T = T;
  }
  /** gerçek zamanlı oynatma: büyük aralığı kare kare (yaylar kararlı) */
  ilerle(T: number) {
    const dt = Math.max(1e-4, T - this.T);
    const n = Math.min(30, Math.ceil(dt / (1 / FPS)));
    const bas = this.T;
    for (let j = 1; j <= n; j++) this.git(bas + (dt * j) / n, dt / n);
  }
  ciz() {
    this.k.oynatici.ciz();
  }
}
