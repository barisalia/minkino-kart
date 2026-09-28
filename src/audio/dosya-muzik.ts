/**
 * Dosyadan döngülü fon müziği (Gemini kayıtları: assets/muzik/menu-dongu.mp3, ege-fon.mp3). Dosya repoda yoksa
 * `var` false olur ve hiçbir şey çalmaz. Kısık çalar; Web Audio'nun müzik kanalından geçtiği için konuşma sırasında
 * kısılır (motor.ts muzikKis: ducking) ve müzik ayarına / sessize almaya uyar. Döngü tıksızdır: MP3'ün başındaki ve
 * sonundaki sessizlik kırpılır, her tur bir öncekinin sonuyla kısa bir çapraz geçişle (CAPRAZ sn) üst üste biner.
 * Tarayıcı ilk dokunuştan önce ses açmazsa ilk dokunuşta başlar.
 */
import { TEST_MODU } from '../ui/dom';
import { baglam, muzikCikisi, sesMotorunuAc } from './motor';
import { muzikAyarUygula } from './muzik';

// Yalnız bu iki dosya pakete girer; yoksa sözlük boş kalır (derleme bozulmaz)
const DOSYALAR = import.meta.glob<string>('../../assets/muzik/{menu-dongu,ege-fon}.mp3', { eager: true, query: '?url', import: 'default' });

export type FonAdi = 'menu-dongu' | 'ege-fon';
export const fonDosyasi = (ad: FonAdi): string | null => DOSYALAR[`../../assets/muzik/${ad}.mp3`] ?? null;

/**
 * Döngünün çapraz geçiş süresi (sn). Kısa tutulur: dosyalar ölçü sayısına göre kesilmiş (menü 16 ölçü, Ege 9 ölçü);
 * uzun çapraz geçiş her turu kısaltıp ritmi kaydırırdı. Kırpılan uçlardaki örnekler sıfıra yakın (ölçüldü), 10 ms
 * geçiş tıkı yok eder.
 */
export const CAPRAZ = 0.01;
/** Bu düzeyin altı sessizlik sayılır (döngü kırpma) */
const ESIK = 0.0015;

/**
 * Döngü bölgesi (örnek sırası): baştaki ve sondaki sessizlik (MP3 kodlayıcı dolgusu) atılır. kanallar: her kanalın
 * örnekleri. Dönüş [bas, son) örnek.
 */
export function donguBolgesi(kanallar: ArrayLike<number>[], esik = ESIK): [number, number] {
  const n = kanallar[0]?.length ?? 0;
  const ses = (i: number) => kanallar.some((k) => Math.abs(k[i]) > esik);
  let bas = 0;
  while (bas < n && !ses(bas)) bas++;
  let son = n;
  while (son > bas && !ses(son - 1)) son--;
  return bas < son ? [bas, son] : [0, n];
}

const tampon = new Map<string, Promise<AudioBuffer | null>>();
function yukle(c: BaseAudioContext, url: string): Promise<AudioBuffer | null> {
  let p = tampon.get(url);
  if (!p) {
    p = fetch(url)
      .then((r) => r.arrayBuffer())
      .then((b) => c.decodeAudioData(b))
      .catch(() => null);
    tampon.set(url, p);
  }
  return p;
}

export class DosyaMuzik {
  private calisiyor = false;
  private cikis: GainNode | null = null;
  private kaynaklar: { src: AudioBufferSourceNode; g: GainNode }[] = [];
  private zaman: number | undefined;
  private bekleyen: (() => void) | null = null;
  /** taban: kısık döngü düzeyi (0..1) */
  constructor(
    private readonly url: string | null,
    private readonly taban = 0.35,
  ) {}
  /** dosya var mı */
  get var(): boolean {
    return !!this.url;
  }
  get caliyor(): boolean {
    return this.calisiyor;
  }

  baslat() {
    if (!this.url || TEST_MODU || this.calisiyor) return;
    this.calisiyor = true;
    const c = sesMotorunuAc();
    const kanal = muzikCikisi();
    if (!c || !kanal) return;
    // müzik kanalı ayara uysun (sessize alınmışsa 0)
    muzikAyarUygula();
    // ses bağlamı dokunuşsuz açılmadıysa ilk dokunuşta aç
    if (c.state !== 'running') {
      const f = () => {
        this.bekleyen?.();
        this.bekleyen = null;
        void c.resume();
      };
      document.addEventListener('pointerdown', f, true);
      this.bekleyen = () => document.removeEventListener('pointerdown', f, true);
    }
    const url = this.url;
    void yukle(c, url).then((b) => {
      if (!b || !this.calisiyor || baglam() !== c) return;
      const kanallar = Array.from({ length: b.numberOfChannels }, (_, i) => b.getChannelData(i));
      const [bas, son] = donguBolgesi(kanallar);
      const basSn = bas / b.sampleRate;
      const uzun = (son - bas) / b.sampleRate;
      const cikis = c.createGain();
      cikis.gain.value = 0;
      cikis.gain.setTargetAtTime(Math.min(1, this.taban), c.currentTime, 0.6);
      cikis.connect(kanal);
      this.cikis = cikis;
      // bir tur: kırpılmış bölge; sonraki tur bunun bitiminden CAPRAZ önce, çapraz geçişle başlar
      const tur = (t: number) => {
        const g = c.createGain();
        const src = c.createBufferSource();
        src.buffer = b;
        src.connect(g).connect(cikis);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(1, t + CAPRAZ);
        g.gain.setValueAtTime(1, t + uzun - CAPRAZ);
        g.gain.linearRampToValueAtTime(0, t + uzun);
        src.start(t, basSn, uzun);
        this.kaynaklar.push({ src, g });
        src.onended = () => {
          this.kaynaklar = this.kaynaklar.filter((k) => k.src !== src);
          g.disconnect();
        };
        const sonraki = t + uzun - CAPRAZ;
        // bir sonraki turu, başlamasına ~1 sn kala kur (sekme arka plandaysa bağlam askıda; saat de durur)
        this.zaman = window.setTimeout(() => {
          if (this.calisiyor) tur(sonraki);
        }, Math.max(0, (sonraki - c.currentTime - 1) * 1000));
      };
      tur(c.currentTime + 0.05);
    });
  }

  durdur() {
    this.calisiyor = false;
    clearTimeout(this.zaman);
    this.zaman = undefined;
    this.bekleyen?.();
    this.bekleyen = null;
    const c = baglam();
    const cikis = this.cikis;
    const kaynaklar = this.kaynaklar;
    this.cikis = null;
    this.kaynaklar = [];
    if (!c || !cikis) return;
    // yumuşak kısılma, sonra dur
    cikis.gain.cancelScheduledValues(c.currentTime);
    cikis.gain.setTargetAtTime(0, c.currentTime, 0.15);
    for (const k of kaynaklar) {
      try {
        k.src.stop(c.currentTime + 0.8);
      } catch {
        /* zaten durmuş */
      }
    }
    setTimeout(() => cikis.disconnect(), 1000);
  }
}

