/**
 * Mikrofon: sesi kare kare (1024 örnek) analiz eder. Ses KAYDEDİLMEZ; her kare işlenip atılır.
 * iPhone'da ses düzeltmeleri (yankı, gürültü bastırma, otomatik seviye) kapatılmak istenir;
 * telefonun gerçekten ne yaptığı `ayarlar` ile görülür.
 */
import { ozellikCikar, type Ozellik } from './analiz';

export interface Istek {
  yankiIptal: boolean;
  gurultuBastir: boolean;
  otoSeviye: boolean;
}

export class Mikrofon {
  ctx: AudioContext | null = null;
  private akis: MediaStream | null = null;
  private islemci: ScriptProcessorNode | null = null;
  private kaynak: MediaStreamAudioSourceNode | null = null;
  private tampon = new Float32Array(2048);
  /** Telefonun uyguladığı gerçek ayarlar */
  ayarlar: MediaTrackSettings = {};
  onKare: (o: Ozellik) => void = () => undefined;
  /** Ham örnekler (papağan gibi anında geri çalan oyunlar için; saklanmaz) */
  onHam: ((g: Float32Array) => void) | null = null;
  /** son 3 saniyenin dB değerleri (grafik için) */
  gecmis: number[] = [];

  get ornekHizi() {
    return this.ctx?.sampleRate ?? 48000;
  }
  get kareSuresi() {
    return 1024 / this.ornekHizi;
  }

  /** ortak: oyunun kendi ses bağlamı (iki ayrı bağlam iOS'ta sorun çıkarabilir) */
  async ac(i: Istek, ortak?: AudioContext | null) {
    this.kapat();
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = ortak ?? (this.ctx && this.ctx.state !== 'closed' ? this.ctx : new AC());
    await this.ctx.resume();
    this.akis = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: i.yankiIptal, noiseSuppression: i.gurultuBastir, autoGainControl: i.otoSeviye, channelCount: 1 },
      video: false,
    });
    const iz = this.akis.getAudioTracks()[0];
    this.ayarlar = iz?.getSettings?.() ?? {};
    this.kaynak = this.ctx.createMediaStreamSource(this.akis);
    this.islemci = this.ctx.createScriptProcessor(1024, 1, 1);
    const sessiz = this.ctx.createGain();
    sessiz.gain.value = 0;
    this.kaynak.connect(this.islemci);
    this.islemci.connect(sessiz).connect(this.ctx.destination);
    this.islemci.onaudioprocess = (e) => {
      const g = e.inputBuffer.getChannelData(0);
      this.onHam?.(g);
      this.tampon.copyWithin(0, g.length);
      this.tampon.set(g, this.tampon.length - g.length);
      const o = ozellikCikar(this.tampon, this.ornekHizi);
      this.gecmis.push(o.db);
      if (this.gecmis.length > Math.round(3 / this.kareSuresi)) this.gecmis.shift();
      this.onKare(o);
    };
  }

  kapat() {
    this.islemci?.disconnect();
    this.kaynak?.disconnect();
    this.akis?.getTracks().forEach((t) => t.stop());
    this.islemci = null;
    this.kaynak = null;
    this.akis = null;
  }
}
