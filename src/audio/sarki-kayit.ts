/**
 * Gemini şarkı kayıtları (assets/muzik/<ad>.json, <ad>-sozlu.mp3, <ad>-sozsuz.mp3). Barış'ın kuralı: "Oyun şarkının
 * notalarına ve ritmine göre ilerler." JSON'daki heceler (başlangıç, bitiş, nota) ve vuruşlar (ms, dosyanın
 * başından) bir tabloya çevrilir; KayitCalar kaydı çalar ve kaydın o anki zamanına göre hece / vuruş olaylarını
 * verir (karaoke, dans, alkış). Ses kilidi (ekip/SES-SISTEMI.md): kayıt çalarken `sustur` ile mikrofon dinlemez.
 */
import { durum } from '../engine/ilerleme';
import { TEST_MODU } from '../ui/dom';

/**
 * Kayıtlı şarkı / tekerleme / ninni (HTMLAudioElement Web Audio'dan geçmez, sessize alma ona kendiliğinden
 * ulaşmaz): müzik ayarına ve ses düzeyine uyar. iOS (WKWebView) volume'u yok saydığı için muted da kurulur.
 * kat: çağıranın ek kısması (0-1).
 */
export function sarkiSesiAyarla(a: HTMLMediaElement, kat = 1) {
  const { muzik, seviye } = durum.i.ayarlar;
  a.muted = !muzik;
  a.volume = muzik ? Math.max(0, Math.min(1, seviye * kat)) : 0;
}

export interface SarkiJson {
  bpm: number;
  baslangic_ms: number;
  sure_ms?: number;
  heceler: { hece: string; satir: number; basla_ms: number; bitir_ms: number; midi: number; vurus: number; tahmini?: boolean }[];
  vuruslar_ms: number[];
}

export interface SarkiHece {
  hece: string;
  satir: number;
  /** kayıtta başlangıç / bitiş (ms, dosyanın başından) */
  basMs: number;
  bitMs: number;
  /** bir sonraki heceye (aynı satırda) ya da kendi bitişine kadar (ms) */
  sureMs: number;
  midi: number;
  vurus: number;
  tahmini: boolean;
}

export interface SarkiTablosu {
  bpm: number;
  vurusMs: number;
  heceler: SarkiHece[];
  /** satır satır heceler */
  satirlar: SarkiHece[][];
  /** vuruşlar (ms, dosyanın başından, sıralı) */
  vuruslar: number[];
  /** ilk hecenin başladığı, son hecenin bittiği an (ms) */
  basMs: number;
  sonMs: number;
}

/** JSON'dan tablo: heceler zamana göre sıralı, satırlar gruplu, vuruşlar sıralı */
export function sarkiTablosu(j: SarkiJson): SarkiTablosu {
  const H = [...j.heceler].sort((a, b) => a.basla_ms - b.basla_ms);
  const heceler = H.map((x, i): SarkiHece => {
    const sonraki = H[i + 1];
    const son = sonraki && sonraki.satir === x.satir ? sonraki.basla_ms : x.bitir_ms;
    return { hece: x.hece, satir: x.satir, basMs: x.basla_ms, bitMs: x.bitir_ms, sureMs: Math.max(120, son - x.basla_ms), midi: x.midi, vurus: x.vurus, tahmini: !!x.tahmini };
  });
  const satirlar: SarkiHece[][] = [];
  for (const x of heceler) (satirlar[x.satir] ??= []).push(x);
  return {
    bpm: j.bpm,
    vurusMs: 60000 / j.bpm,
    heceler,
    satirlar: satirlar.filter(Boolean),
    vuruslar: [...j.vuruslar_ms].sort((a, b) => a - b),
    basMs: heceler[0]?.basMs ?? j.baslangic_ms,
    sonMs: Math.max(...heceler.map((x) => x.bitMs)),
  };
}

/** Karşılaştırma için hece: küçük harf, yalnız harfler ("Mino'nun" → "minonun") */
export const heceAnahtar = (s: string) => s.toLocaleLowerCase('tr').replace(/[^a-zçğıöşüâîû]/g, '');

/**
 * Kayıttaki heceleri sözlerin yazımıyla eşler (karaoke için): her hece sözdeki harfleriyle yazılır, arkasındaki
 * noktalama (’ , .) heceye eklenir; kelime: sözde kaçıncı kelime (satırlar boyunca). Dönüş hece sırasıyla.
 */
export function sozleEsle(soz: string[], heceler: string[]): { yazi: string; kelime: number; satir: number }[] {
  const harf = /[a-zçğıöşüâîûA-ZÇĞİÖŞÜÂÎÛ]/;
  const cikti: { yazi: string; kelime: number; satir: number }[] = [];
  let satir = 0;
  let i = 0;
  let kelime = -1;
  let yeniKelime = true;
  for (const hece of heceler) {
    let s = soz[satir] ?? '';
    // satır bitti: sonrakine geç
    while (satir < soz.length && !s.slice(i).match(harf)) {
      satir++;
      i = 0;
      s = soz[satir] ?? '';
      yeniKelime = true;
    }
    while (i < s.length && !harf.test(s[i])) {
      if (/\s/.test(s[i])) yeniKelime = true;
      i++;
    }
    if (yeniKelime) kelime++;
    yeniKelime = false;
    let yazi = '';
    let n = heceAnahtar(hece).length;
    while (i < s.length && n > 0) {
      if (harf.test(s[i])) n--;
      yazi += s[i++];
    }
    // hecenin arkasındaki noktalama (boşluk değil, harf değil)
    while (i < s.length && !harf.test(s[i]) && !/\s/.test(s[i])) yazi += s[i++];
    cikti.push({ yazi, kelime, satir });
  }
  return cikti;
}

/** t anında (ms, dosyanın başından) söylenen hecenin sırası; daha başlamadıysa -1 */
export function hangiHece(t: SarkiTablosu, ms: number): number {
  let k = -1;
  for (let i = 0; i < t.heceler.length && t.heceler[i].basMs <= ms; i++) k = i;
  return k;
}

/** t anına kadar geçen son vuruşun sırası; henüz vuruş yoksa -1 */
export function hangiVurus(vuruslar: number[], ms: number): number {
  let k = -1;
  for (let i = 0; i < vuruslar.length && vuruslar[i] <= ms; i++) k = i;
  return k;
}

/**
 * Alkış (dokunma) vuruşa yakın mı: en yakın vuruş ve farkı (ms). Tolerans yumuşak (varsayılan ±220 ms; 3-4 yaş için
 * geniş tutun). Uzaksa null. Algılamayla ilgisi yok: yalnız zamanlama.
 */
export function vurusaYakin(vuruslar: number[], ms: number, tolerans = 220): { sira: number; fark: number } | null {
  let en: { sira: number; fark: number } | null = null;
  vuruslar.forEach((v, i) => {
    const f = ms - v;
    if (!en || Math.abs(f) < Math.abs(en.fark)) en = { sira: i, fark: f };
  });
  const e = en as { sira: number; fark: number } | null;
  return e && Math.abs(e.fark) <= tolerans ? e : null;
}

/** Satırda (satir) verilen hecenin (anahtar olarak) ilk geçtiği yerin tablodaki sırası; yoksa -1 */
export function heceBul(t: SarkiTablosu, satir: number, hece: string): number {
  const a = heceAnahtar(hece);
  return t.heceler.findIndex((x) => x.satir === satir && heceAnahtar(x.hece) === a);
}

export interface CalmaSecenegi {
  /** kaydın adresi (sözlü ya da sözsüz); null ya da açılamazsa kayıtsız saat (yedekNota ile) */
  url: string | null;
  tablo: SarkiTablosu;
  /** mikrofonu susturur (kulak.sustur); kayıt bitene kadar sürekli çağrılır */
  sustur?: (ms: number) => void;
  onHece?: (i: number) => void;
  onVurus?: (i: number) => void;
  /** kayıt açılamazsa her hecede (müzik kutusu gibi) */
  yedekNota?: (x: SarkiHece) => void;
  /** test modunda saat bu kadar hızlı akar (kayıt çalınmaz) */
  testHizi?: number;
  /** kaydın son hecesinden sonra bu kadar daha çalar (ms) */
  kuyrukMs?: number;
}

/**
 * Kaydı çalar, kaydın kendi zamanına göre (audio.currentTime) hece / vuruş olaylarını verir. Kayıt açılamazsa
 * (izin yok, dosya yok) aynı zamanlarla sessiz saat işler, `yedekNota` notaları çalar. Test modunda kayıt çalmaz,
 * saat hızlı akar.
 */
export class KayitCalar {
  private ses: HTMLAudioElement | null = null;
  private raf = 0;
  private bitir: (() => void) | null = null;
  private bas = 0;
  private kayitli = false;
  private hiz = 1;
  private sonHece = -1;
  private sonVurus = -1;
  private bitti = false;
  constructor(private s: CalmaSecenegi) {}

  /** şarkının şu anki zamanı (ms, dosyanın başından) */
  get zaman(): number {
    if (this.kayitli && this.ses) return this.ses.currentTime * 1000;
    return (performance.now() - this.bas) * this.hiz;
  }
  get sonMs() {
    return this.s.tablo.sonMs + (this.s.kuyrukMs ?? 400);
  }

  async cal(): Promise<void> {
    const { url, sustur } = this.s;
    sustur?.(this.sonMs + 800);
    if (url && !TEST_MODU) {
      const ses = new Audio(url);
      sarkiSesiAyarla(ses);
      this.ses = ses;
      this.kayitli = await ses.play().then(
        () => true,
        () => false,
      );
    }
    if (this.bitti) {
      this.ses?.pause();
      return;
    }
    // test modunda saat hızlı akar (&sarkihiz=1: gerçek hızda, sessiz; ekran görüntüsü / ritim denemesi için)
    const q = TEST_MODU ? Number(new URLSearchParams(location.search).get('sarkihiz')) : 0;
    this.hiz = TEST_MODU ? (q > 0 ? q : (this.s.testHizi ?? 8)) : 1;
    this.bas = performance.now();
    await new Promise<void>((coz) => {
      this.bitir = coz;
      const adim = () => {
        if (this.bitti) return;
        const t = this.zaman;
        if (this.kayitli) sustur?.(Math.max(0, this.sonMs - t) + 800);
        const k = hangiHece(this.s.tablo, t);
        while (this.sonHece < k) {
          this.sonHece++;
          if (!this.kayitli) this.s.yedekNota?.(this.s.tablo.heceler[this.sonHece]);
          this.s.onHece?.(this.sonHece);
        }
        const v = hangiVurus(this.s.tablo.vuruslar, t);
        while (this.sonVurus < v) this.s.onVurus?.(++this.sonVurus);
        if (t >= this.sonMs || (this.kayitli && this.ses?.ended)) return this.durdur();
        this.raf = requestAnimationFrame(adim);
      };
      adim();
    });
  }

  /** Durdurur (kayıt yumuşakça kısılır); cal() çözülür */
  durdur() {
    if (this.bitti) return;
    this.bitti = true;
    cancelAnimationFrame(this.raf);
    const ses = this.ses;
    if (ses && !ses.paused) {
      const v0 = ses.volume;
      let n = 0;
      const kis = window.setInterval(() => {
        n++;
        ses.volume = Math.max(0, v0 * (1 - n / 6));
        if (n >= 6) {
          clearInterval(kis);
          ses.pause();
        }
      }, 60);
    }
    this.bitir?.();
    this.bitir = null;
  }
}
