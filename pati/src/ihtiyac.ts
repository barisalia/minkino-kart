/**
 * Pati Dükkânı: günün saf mantığı (DOM yok, birim testli: tests/unit/pati-ihtiyac.test.ts).
 *
 * - Gün planı (content/pati.json → gun1): hangi hayvan, hangi ihtiyaç. Sıra küçük bir rastgelelikle karışır; aynı hayvan
 *   art arda gelmez.
 * - Aynı anda açık ihtiyaç: 3-4 yaşta 1, 5-6 yaşta en çok 2 (aynı hayvanda iki ihtiyaç olmaz).
 * - Bir ihtiyaç kapanınca sonraki 4-8 sn sonra açılır (baskı yok ama salon hep canlı).
 * - Hiçbir ihtiyaç süreyle kötüleşmez: yardım merdiveni (5 sn bakış, 10 sn Nehir söyler, 18 sn "Bak, böyle!",
 *   30 sn "Birlikte bitirelim") en sonunda işi birlikte bitirir; çocuk hiç dokunmasa da gün akşama döner.
 */

export type HayvanAdi = 'findik' | 'tarcin' | 'piril';
export type IhtiyacTuru = 'ac' | 'oyun' | 'usudu';
export type Yas = 'kucuk' | 'buyuk';
/** Bakım rafındaki eşyalar */
export type EsyaAdi = 'mama' | 'top' | 'kus' | 'minder' | 'yem';

export const HAYVANLAR: readonly HayvanAdi[] = ['findik', 'tarcin', 'piril'];

export interface Ihtiyac {
  id: number;
  hayvan: HayvanAdi;
  tur: IhtiyacTuru;
}

/** Hangi ihtiyacı hangi eşya giderir */
export function gerekenEsya(hayvan: HayvanAdi, tur: IhtiyacTuru): EsyaAdi {
  if (tur === 'ac') return hayvan === 'piril' ? 'yem' : 'mama';
  if (tur === 'usudu') return 'minder';
  return hayvan === 'tarcin' ? 'kus' : 'top';
}

/** Yakın çekimde o hayvanın bakım rafı (en büyük eşya önce; balığın rafında minder yok) */
export function rafEsyalari(hayvan: HayvanAdi): EsyaAdi[] {
  if (hayvan === 'findik') return ['mama', 'top', 'minder', 'kus'];
  if (hayvan === 'tarcin') return ['kus', 'minder', 'mama', 'top'];
  return ['yem', 'top', 'kus'];
}

/** Bir bakımın kaç adımda bittiği (mama: iki ölçek; top: iki atış; kuş: iki yakalama; yem: 3-4 iki tutam, 5-6 bir tutam) */
export function adimSayisi(e: EsyaAdi, yas: Yas): number {
  if (e === 'minder') return 1;
  if (e === 'yem') return yas === 'buyuk' ? 1 : 2;
  return 2;
}

export const enCokAcik = (yas: Yas) => (yas === 'buyuk' ? 2 : 1);
/** İki ihtiyaç arası bekleme (ms) */
export const aralik = (rnd: () => number) => 4000 + Math.floor(rnd() * 4000);
/** Günün ilk ihtiyacı açılıştan bu kadar sonra (ms) */
export const ILK_BEKLEME = 2500;

/** Yardım merdiveni (ihtiyaç açıldıktan sonra ms) */
export const YARDIM = { balon: 3000, bakis: 5000, soyle: 10000, goster: 18000, birlikte: 30000 } as const;
export type YardimAdimi = keyof typeof YARDIM;
/** Bu ihtiyaç bu yaşta düşünce balonu gösterir mi (yalnız 3-4) */
export const balonVar = (yas: Yas) => yas === 'kucuk';
/** Açılıştan bu yana geçen süreye göre ulaşılmış yardım adımları (balon yalnız 3-4) */
export function yardimAdimlari(gecen: number, yas: Yas): YardimAdimi[] {
  return (Object.keys(YARDIM) as YardimAdimi[]).filter((a) => gecen >= YARDIM[a] && (a !== 'balon' || balonVar(yas)));
}

/** Planı küçük bir rastgelelikle karıştırır: aynı hayvan art arda gelmez, her ihtiyaç bir kez */
export function planKaristir(plan: readonly [HayvanAdi, IhtiyacTuru][], rnd: () => number = Math.random): [HayvanAdi, IhtiyacTuru][] {
  for (let deneme = 0; deneme < 40; deneme++) {
    const d = plan.map((p) => [...p] as [HayvanAdi, IhtiyacTuru]);
    for (let i = d.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [d[i], d[j]] = [d[j], d[i]];
    }
    if (d.every((p, i) => i === 0 || p[0] !== d[i - 1][0])) return d;
  }
  return plan.map((p) => [...p] as [HayvanAdi, IhtiyacTuru]);
}

/** Günün akışı: tik(t) zamanı gelen ihtiyaçları açar, kapat(id, t) biten ihtiyacı kapatır */
export class GunAkisi {
  readonly acik: Ihtiyac[] = [];
  readonly biten: Ihtiyac[] = [];
  readonly kalan: Ihtiyac[];
  private sonraki: number;
  private no = 0;
  constructor(
    plan: readonly [HayvanAdi, IhtiyacTuru][],
    private yas: Yas,
    private rnd: () => number = Math.random,
    baslangic = 0,
    ilkBekleme = ILK_BEKLEME,
  ) {
    this.kalan = plan.map(([hayvan, tur]) => ({ id: ++this.no, hayvan, tur }));
    this.sonraki = baslangic + ilkBekleme;
  }

  /** t anında açılan yeni ihtiyaçlar */
  tik(t: number): Ihtiyac[] {
    const yeni: Ihtiyac[] = [];
    while (t >= this.sonraki && this.acik.length < enCokAcik(this.yas)) {
      const i = this.kalan.findIndex((k) => !this.acik.some((a) => a.hayvan === k.hayvan));
      if (i < 0) break;
      const [ih] = this.kalan.splice(i, 1);
      this.acik.push(ih);
      yeni.push(ih);
      // 5-6'da ikinci ihtiyaç da hemen değil, biraz sonra açılır
      this.sonraki = t + aralik(this.rnd);
    }
    return yeni;
  }

  /** İhtiyaç giderildi: sonraki en erken 4-8 sn sonra */
  kapat(id: number, t: number): Ihtiyac | null {
    const i = this.acik.findIndex((a) => a.id === id);
    if (i < 0) return null;
    const [ih] = this.acik.splice(i, 1);
    this.biten.push(ih);
    this.sonraki = Math.max(this.sonraki, t + aralik(this.rnd));
    return ih;
  }

  /** Bu hayvanın açık ihtiyacı */
  hayvaninki(h: HayvanAdi): Ihtiyac | undefined {
    return this.acik.find((a) => a.hayvan === h);
  }

  get bitti(): boolean {
    return this.kalan.length === 0 && this.acik.length === 0;
  }
}

/** Günün fotoğrafı: en çok tekrarlanan an (eşitlikte ilk olan); hiç an yoksa null */
export function gununAni(sayac: Readonly<Record<string, number>>): string | null {
  let en: string | null = null;
  for (const [an, n] of Object.entries(sayac)) if (n > 0 && (en === null || n > sayac[en])) en = an;
  return en;
}
