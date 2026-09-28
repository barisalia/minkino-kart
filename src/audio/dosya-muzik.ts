/**
 * Dosyadan döngülü fon müziği (Gemini kayıtları: assets/muzik/menu-dongu.mp3, ege-fon.mp3). Dosya repoda yoksa
 * `var` false olur ve hiçbir şey çalmaz (bağlantı hazır: dosya eklenince kendiliğinden çalar). Kısık çalar,
 * konuşma sırasında sesi düşer (ducking), müzik ayarına / sessize almaya uyar. Tarayıcı ilk dokunuştan önce
 * çaldırmazsa ilk dokunuşta başlar.
 */
import { durum } from '../engine/ilerleme';
import { TEST_MODU } from '../ui/dom';
import { konusuyorMu } from './konusma';

// Yalnız bu iki dosya pakete girer; yoksa sözlük boş kalır (derleme bozulmaz)
const DOSYALAR = import.meta.glob<string>('../../assets/muzik/{menu-dongu,ege-fon}.mp3', { eager: true, query: '?url', import: 'default' });

export type FonAdi = 'menu-dongu' | 'ege-fon';
export const fonDosyasi = (ad: FonAdi): string | null => DOSYALAR[`../../assets/muzik/${ad}.mp3`] ?? null;

/** Konuşma sırasında fonun düştüğü oran */
export const DUCK_ORAN = 0.3;

/** Fonun hedef ses düzeyi (0..1): müzik kapalıysa 0; konuşurken düşer */
export function fonSeviyesi(ayar: { muzik: boolean; seviye: number }, konusuyor: boolean, taban: number): number {
  if (!ayar.muzik) return 0;
  return Math.max(0, Math.min(1, taban * ayar.seviye * (konusuyor ? DUCK_ORAN : 1)));
}

export class DosyaMuzik {
  private ses: HTMLAudioElement | null = null;
  private zaman: number | undefined;
  private bekleyen: (() => void) | null = null;
  private simdi = 0;
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
    return this.zaman !== undefined;
  }

  baslat() {
    if (!this.url || TEST_MODU || this.zaman !== undefined) return;
    this.ses ??= Object.assign(new Audio(this.url), { loop: true, preload: 'auto' });
    const ses = this.ses;
    this.simdi = 0;
    ses.volume = 0;
    const dene = () =>
      ses.play().catch(() => {
        // tarayıcı dokunuşsuz çaldırmadı: ilk dokunuşta yeniden dene
        if (this.bekleyen) return;
        const f = () => {
          this.bekleyen = null;
          document.removeEventListener('pointerdown', f, true);
          if (this.zaman !== undefined) void ses.play().catch(() => undefined);
        };
        this.bekleyen = () => document.removeEventListener('pointerdown', f, true);
        document.addEventListener('pointerdown', f, true);
      });
    void dene();
    // ses düzeyi yumuşakça hedefe gider (açılış, ducking, sessize alma)
    this.zaman = window.setInterval(() => {
      const hedef = fonSeviyesi(durum.i.ayarlar, konusuyorMu(), this.taban);
      this.simdi += (hedef - this.simdi) * 0.25;
      if (Math.abs(hedef - this.simdi) < 0.003) this.simdi = hedef;
      ses.volume = Math.max(0, Math.min(1, this.simdi));
    }, 80);
  }

  durdur() {
    clearInterval(this.zaman);
    this.zaman = undefined;
    this.bekleyen?.();
    this.bekleyen = null;
    this.ses?.pause();
  }
}
