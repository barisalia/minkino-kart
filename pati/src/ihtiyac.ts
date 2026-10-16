/**
 * Pati Dükkânı v2: ihtiyaç saati ve yardım merdiveni (saf, DOM yok; tests/unit/pati-ihtiyac.test.ts). PATI-V2 §7a, §8d.
 *
 * İhtiyaç saati:
 *  - Her hayvan tek bir ihtiyaç gösterir; bir ihtiyaç kapanınca o hayvanın sıradakisi 20-40 sn sonra açılır.
 *  - Aynı anda en çok 2 (3-4) ya da 3 (5-6) hayvan bir şey ister.
 *  - Dans eden hayvan 30 sn dinlenir (bu sürede ihtiyaç açılmaz).
 *  - 3-4: aç, susuz, sıkılmış, uykulu (kirli: temizlik çekmecesi alınınca). 5-6: + kirli; hasta yalnız 3 hayvandan sonra.
 *  - Aynı hayvanda aynı ihtiyaç art arda gelmez.
 *  - Hiçbir ihtiyaç süreyle kötüleşmez; bekleyen hayvanın hâli yalnız daha belirgin olur (yardım merdiveni).
 *
 * Yardım merdiveni (ihtiyaç açıldıktan sonra): 0 sn beden pozu + sesi · 12 sn dolaylı bir hareket · 25 sn 3-4'te küçük
 * resim balonu (ihtiyacın genel resmi), 5-6'da Nehir abla beden dilini söyler · 40 sn yalnız doğru çekmecenin kulpu bir
 * kez kıpırdar. Asla parlayan eşya, ok, el, "şuna dokun".
 */
import type { IhtiyacAdi } from './katalog';

export type Yas = 'kucuk' | 'buyuk';

/** Merdiven adımlarının zamanı (ms, ihtiyaç açıldıktan sonra) */
export const YARDIM = { dolayli: 12000, balon: 25000, kulp: 40000 } as const;
/** 'balon': 3-4 resim balonu; 'soz': 5-6 Nehir'in beden dili sözü (ikisi aynı anda: 25 sn) */
export type YardimAdimi = 'dolayli' | 'balon' | 'soz' | 'kulp';

/** Açıldıktan bu yana geçen süreye göre ulaşılmış merdiven adımları */
export function yardimAdimlari(gecen: number, yas: Yas): YardimAdimi[] {
  const a: YardimAdimi[] = [];
  if (gecen >= YARDIM.dolayli) a.push('dolayli');
  if (gecen >= YARDIM.balon) a.push(yas === 'kucuk' ? 'balon' : 'soz');
  if (gecen >= YARDIM.kulp) a.push('kulp');
  return a;
}

/** Aynı anda en çok kaç hayvan bir şey ister */
export const enCokAcik = (yas: Yas) => (yas === 'buyuk' ? 3 : 2);
/** Bir hayvanın iki ihtiyacı arası (ms) */
export const ARALIK: readonly [number, number] = [20000, 40000];
/** Yeni gelen (ya da oyun açılınca) hayvanın ilk ihtiyacı (ms) */
export const ILK: readonly [number, number] = [8000, 16000];
/** Danstan sonra dinlenme (ms) */
export const DANS_DINLENME = 30000;
/** 5-6'da "hasta" ihtiyacı kaç hayvandan sonra açılır */
export const HASTA_ESIK = 3;

export interface SaatSecenek {
  yas: Yas;
  /** temizlik çekmecesi var mı (3-4'te mağazadan; 5-6 baştan) */
  temizlik?: boolean;
  /** dükkândaki hayvan sayısı (hasta için) */
  hayvanSayisi: number;
}

/** Bu hayvanda bu yaşta açılabilecek ihtiyaçlar (hayvanın kendi listesinden) */
export function acilabilir(hayvaninki: readonly IhtiyacAdi[], s: SaatSecenek): IhtiyacAdi[] {
  return hayvaninki.filter((ih) => {
    if (ih === 'kirli') return s.yas === 'buyuk' || !!s.temizlik;
    if (ih === 'hasta') return s.yas === 'buyuk' && s.hayvanSayisi >= HASTA_ESIK;
    return true;
  });
}

/** Saatin gördüğü hayvan (kayıttaki SahipHayvan'ın alt kümesi) */
export interface SaatHayvani {
  id: string;
  ihtiyac: IhtiyacAdi | null;
  sonDans: number;
}

/**
 * İhtiyaç saati. Zaman dışarıdan verilir (ms; testte sahte saat). Açılan ihtiyaç hayvanın kendi alanına yazılır
 * (kayıtta kalır); açılış zamanı yalnız bellekte (yardım merdiveni için).
 * sonDans Date.now() zamanıyla tutulur (kayıt): dinlenme için ayrıca `simdiDuvar` verilir.
 */
export class IhtiyacSaati {
  private sonraki = new Map<string, number>();
  private son = new Map<string, IhtiyacAdi>();
  private acilis = new Map<string, number>();
  /** durdu (akşam: ihtiyaç açılmaz) */
  durdu = false;

  constructor(
    private rnd: () => number = Math.random,
    private aralikMs: readonly [number, number] = ARALIK,
    private ilkMs: readonly [number, number] = ILK,
    private dinlenmeMs = DANS_DINLENME,
  ) {}

  private ras([a, b]: readonly [number, number]) {
    return a + Math.floor(this.rnd() * (b - a));
  }

  /**
   * t anında açılan ihtiyaçlar. hayvanlar: dükkândakiler (yeni gelenin ilk ihtiyacı ILK sonra).
   * simdiDuvar: sonDans ile karşılaştırılan duvar saati (Date.now; testte t ile aynı verilebilir).
   */
  tik(t: number, hayvanlar: SaatHayvani[], s: SaatSecenek, ihtiyaclari: (id: string) => readonly IhtiyacAdi[], simdiDuvar = t): { id: string; ihtiyac: IhtiyacAdi }[] {
    const yeni: { id: string; ihtiyac: IhtiyacAdi }[] = [];
    for (const h of hayvanlar) {
      if (!this.sonraki.has(h.id)) this.sonraki.set(h.id, t + this.ras(this.ilkMs));
      // kayıttan gelen açık ihtiyacın merdiveni oyun açılınca baştan başlar
      if (h.ihtiyac && !this.acilis.has(h.id)) this.acilis.set(h.id, t);
    }
    if (this.durdu) return yeni;
    let acik = hayvanlar.filter((h) => h.ihtiyac).length;
    // en uzun bekleyen önce
    const sira = hayvanlar.filter((h) => !h.ihtiyac).sort((a, b) => this.sonraki.get(a.id)! - this.sonraki.get(b.id)!);
    for (const h of sira) {
      if (acik >= enCokAcik(s.yas)) break;
      if (t < this.sonraki.get(h.id)!) continue;
      if (h.sonDans > 0 && simdiDuvar - h.sonDans < this.dinlenmeMs) continue;
      const liste = acilabilir(ihtiyaclari(h.id), s);
      const secenek = liste.length > 1 ? liste.filter((x) => x !== this.son.get(h.id)) : liste;
      if (!secenek.length) continue;
      const ih = secenek[Math.floor(this.rnd() * secenek.length)];
      this.ac(h, ih, t);
      yeni.push({ id: h.id, ihtiyac: ih });
      acik++;
    }
    return yeni;
  }

  /** İhtiyacı açar (saatin kendisi; ders: süt karnını ağrıttı; test) */
  ac(h: SaatHayvani, ih: IhtiyacAdi, t: number) {
    h.ihtiyac = ih;
    this.son.set(h.id, ih);
    this.acilis.set(h.id, t);
  }

  /** İhtiyaç giderildi: sıradaki 20-40 sn sonra */
  kapat(h: SaatHayvani, t: number) {
    h.ihtiyac = null;
    this.acilis.delete(h.id);
    this.sonraki.set(h.id, t + this.ras(this.aralikMs));
  }

  /** Açık ihtiyacın açılış zamanı (merdiven); yoksa null */
  acilisZamani(id: string): number | null {
    return this.acilis.get(id) ?? null;
  }

  /** Sıradaki ihtiyaç zamanı (test) */
  sonrakiZaman(id: string) {
    return this.sonraki.get(id) ?? null;
  }

  /** Bütün hayvanların sıradaki ihtiyacını en erken t + ms'ye iter (akşamdan sabaha) */
  ertele(t: number, ms: number) {
    for (const [id, z] of this.sonraki) this.sonraki.set(id, Math.max(z, t + ms));
  }
}

/** Günün fotoğrafı: en çok tekrarlanan an (eşitlikte ilk olan); hiç an yoksa null */
export function gununAni(sayac: Readonly<Record<string, number>>): string | null {
  let en: string | null = null;
  for (const [an, n] of Object.entries(sayac)) if (n > 0 && (en === null || n > sayac[en])) en = an;
  return en;
}
