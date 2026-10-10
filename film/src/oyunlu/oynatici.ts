/**
 * Oyunlu çizgi filmin oynatıcısı (tek canvas): bölüm parçalar (segment) dizisidir; hikâye parçası zamanın saf
 * fonksiyonudur, oyun parçası çocuğun dokunuşuyla ilerler. Hikâyeden oyuna geçişte kesme yok: kamera aynı dünyada
 * süzülür (OYUNLU-FORMAT §2). Sahneler arası geçiş kararmayla.
 *
 * - Saat: kendi saatimiz (duraklatılır). Kayıtta (?kayit=1) sahte saat: kare kare ilerler, gerçek zaman beklenmez.
 * - Kamera: { x, y, g } dünya merkezi ve görünen genişlik (dünya birimi). Dünya = arka planın pikseli (2752×1536).
 * - Altyazı ve başlık canvas'a çizilir (kayda girer); duraklat düğmesi DOM'da (kayda girmez).
 */
import type { Matris } from '../kukla';
import { sozSuresi } from './aktor';
import { sesDurum } from './ses';

export interface Kamera {
  x: number;
  y: number;
  /** görünen genişlik (dünya birimi) */
  g: number;
}
/** dünya → css pikseli */
export function kameraMatris(k: Kamera, W: number, H: number): Matris {
  const s = W / k.g;
  return [s, 0, 0, s, W / 2 - s * k.x, H / 2 - s * k.y];
}
const yumusat = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
/** iki kamera arası: konum doğrusal, genişlik üstel (yakınlaşma eşit hızda hissedilir) */
export function kameraKaris(a: Kamera, b: Kamera, u: number, egri = yumusat): Kamera {
  const e = egri(u);
  return { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e, g: a.g * Math.pow(b.g / a.g, e) };
}
export interface KameraAnahtar {
  t: number;
  yatay: Kamera;
  dikey: Kamera;
  /** bu anahtara varış süresi (sn; varsayılan 1.6) */
  gecis?: number;
}
/** anahtar kareli kamera yolu: her anahtar kendi anından geçiş süresi kadar önce yola çıkar */
export function kameraYolu(anahtar: KameraAnahtar[], t: number, dikey: boolean): Kamera {
  const sec = (a: KameraAnahtar) => (dikey ? a.dikey : a.yatay);
  let k = sec(anahtar[0]);
  for (let i = 1; i < anahtar.length; i++) {
    const a = anahtar[i], g = a.gecis ?? 1.6;
    if (t <= a.t - g) break;
    k = kameraKaris(k, sec(a), (t - (a.t - g)) / g);
  }
  return k;
}

// ---------------------------------------------------------------- sözler (altyazı + ağız)
export interface SozTanim {
  kim: string;
  metin: string;
  tur?: 'oyun';
}
export interface CalanSoz extends SozTanim {
  id: string;
  bas: number;
  sure: number;
}
export class Sozler {
  calan: CalanSoz[] = [];
  constructor(readonly tablo: Record<string, SozTanim>) {}
  sure(id: string) {
    const s = this.tablo[id];
    return s ? sozSuresi(s.metin, s.kim === 'anlatici') : 0;
  }
  /** cümleyi başlatır (saat: film saati); süresini döner */
  soyle(id: string, saat: number): number {
    const s = this.tablo[id];
    if (!s) return 0;
    const sure = this.sure(id);
    // aynı kişinin önceki cümlesi biter (üst üste konuşmaz)
    this.calan = this.calan.filter((c) => c.kim !== s.kim && saat < c.bas + c.sure + 1.2);
    this.calan.push({ ...s, id, bas: saat, sure });
    return sure;
  }
  /** kişinin şu an söylediği cümle ve cümlenin içindeki saniye */
  aktif(kim: string, saat: number): { metin: string; x: number } | null {
    for (const c of this.calan) if (c.kim === kim && saat >= c.bas && saat < c.bas + c.sure) return { metin: c.metin, x: saat - c.bas };
    return null;
  }
  /** ekrandaki altyazı: en son başlayan, bitişinden 0,6 sn sonrasına kadar */
  altyazi(saat: number): CalanSoz | null {
    let en: CalanSoz | null = null;
    for (const c of this.calan) if (saat >= c.bas && saat < c.bas + c.sure + 0.6 && (!en || c.bas > en.bas)) en = c;
    return en;
  }
  temizle() {
    this.calan = [];
  }
}

// ---------------------------------------------------------------- parça
export interface Ortam {
  ctx: CanvasRenderingContext2D;
  /** css pikseli */
  W: number;
  H: number;
  dpr: number;
  dikey: boolean;
  /** film saati (sn) */
  saat: number;
}
export interface Segment {
  ad: string;
  /** parça başlarken (t0: parçanın içinden başlama, an tekrarı) */
  basla(t0: number): void;
  /** t: parçanın içindeki saniye; dönüş true: parça bitti */
  adim(t: number, dt: number, o: Ortam): boolean;
  ciz(t: number, o: Ortam): void;
  /** ekranın kararması 0..1 */
  karanlik?(t: number): number;
  dokun?(tur: 'bas' | 'kay' | 'kalk', x: number, y: number): void;
}

const ALTYAZI_RENK: Record<string, string> = { anlatici: '#ffe9a8', kino: '#b8f0a0', anne: '#ffd27a', lokum: '#ffc4dc' };
const KISI_ADI: Record<string, string> = { anlatici: '', kino: 'Kino', anne: 'Anne', lokum: 'Lokum' };

export class Oynatici {
  readonly ctx: CanvasRenderingContext2D;
  W = 844;
  H = 390;
  dpr = 1;
  saat = 0;
  duraklat = false;
  i = 0;
  t = 0;
  bitti = false;
  /** bölüm adı (başlık kartı) ve başlığın göründüğü an aralığı */
  baslik: { metin: string; ust: string; bas: number; son: number } | null = null;
  onParca?: (ad: string) => void;
  onBitti?: () => void;

  constructor(
    readonly tuval: HTMLCanvasElement,
    readonly parcalar: Segment[],
    readonly sozler: Sozler,
  ) {
    this.ctx = tuval.getContext('2d')!;
  }

  boyutla(W: number, H: number, dpr: number) {
    this.W = W;
    this.H = H;
    this.dpr = dpr;
    this.tuval.width = Math.round(W * dpr);
    this.tuval.height = Math.round(H * dpr);
    this.tuval.style.width = `${W}px`;
    this.tuval.style.height = `${H}px`;
  }

  get ortam(): Ortam {
    return { ctx: this.ctx, W: this.W, H: this.H, dpr: this.dpr, dikey: this.H > this.W, saat: this.saat };
  }
  get parca(): Segment | undefined {
    return this.parcalar[this.i];
  }

  baslat(i = 0, t0 = 0) {
    this.i = i;
    this.t = t0;
    this.bitti = false;
    this.parcalar[i].basla(t0);
    this.onParca?.(this.parcalar[i].ad);
  }

  /** dt kadar ilerler (duraklatılmışsa durur) */
  adim(dt: number) {
    if (this.duraklat || this.bitti) return;
    this.saat += dt;
    sesDurum.saat = this.saat;
    this.t += dt;
    const p = this.parca!;
    if (p.adim(this.t, dt, this.ortam)) {
      if (this.i + 1 >= this.parcalar.length) {
        this.bitti = true;
        this.onBitti?.();
        return;
      }
      this.i++;
      this.t = 0;
      this.parca!.basla(0);
      this.onParca?.(this.parca!.ad);
    }
  }

  ciz() {
    const o = this.ortam;
    const { ctx } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#20160f';
    ctx.fillRect(0, 0, this.tuval.width, this.tuval.height);
    const p = this.parca;
    if (!p) return;
    p.ciz(this.t, o);
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const k = p.karanlik?.(this.t) ?? 0;
    if (k > 0) {
      ctx.fillStyle = `rgba(32,22,15,${Math.min(1, k)})`;
      ctx.fillRect(0, 0, this.W, this.H);
    }
    this.baslikCiz();
    this.altyaziCiz();
  }

  private baslikCiz() {
    const b = this.baslik;
    if (!b || this.saat < b.bas || this.saat > b.son) return;
    const { ctx, W, H } = this;
    const g = Math.min(1, (this.saat - b.bas) / 0.6, (b.son - this.saat) / 0.6);
    const kisa = Math.min(W, H * 1.6);
    ctx.save();
    ctx.globalAlpha = g;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const y = H * (this.H > this.W ? 0.2 : 0.22) - (1 - g) * 8;
    ctx.font = `600 ${Math.round(kisa * 0.035)}px Fredoka, system-ui, sans-serif`;
    ctx.lineWidth = kisa * 0.012;
    ctx.strokeStyle = 'rgba(64,19,18,0.75)';
    ctx.fillStyle = '#ffe9a8';
    ctx.strokeText(b.ust, W / 2, y - kisa * 0.055);
    ctx.fillText(b.ust, W / 2, y - kisa * 0.055);
    ctx.font = `700 ${Math.round(kisa * 0.075)}px Fredoka, system-ui, sans-serif`;
    ctx.lineWidth = kisa * 0.018;
    ctx.strokeStyle = '#401312';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#ffffff';
    ctx.strokeText(b.metin, W / 2, y + kisa * 0.02);
    ctx.fillText(b.metin, W / 2, y + kisa * 0.02);
    ctx.restore();
  }

  private altyaziCiz() {
    const s = this.sozler.altyazi(this.saat);
    if (!s) return;
    const { ctx, W, H } = this;
    const kisa = Math.min(W, H * 1.7);
    const oyun = s.tur === 'oyun' || this.parca?.ad.startsWith('oyun');
    const boy = Math.round(kisa * (oyun ? 0.034 : 0.038));
    const g = Math.min(1, (this.saat - s.bas) / 0.18, (s.bas + s.sure + 0.6 - this.saat) / 0.25);
    ctx.save();
    ctx.globalAlpha = Math.max(0, g);
    ctx.font = `600 ${boy}px Fredoka, system-ui, sans-serif`;
    const ad = KISI_ADI[s.kim] ?? '';
    const metin = ad ? `${ad}: ${s.metin}` : s.metin;
    const satirlar = sar(ctx, metin, W * 0.86);
    const gen = Math.max(...satirlar.map((l) => ctx.measureText(l).width)) + boy * 1.4;
    const yuk = satirlar.length * boy * 1.25 + boy * 0.7;
    // oyunda üstte (hedefleri örtmesin), hikâyede altta
    const y = oyun ? Math.max(8, H * 0.03) : H - yuk - Math.max(10, H * 0.04);
    ctx.fillStyle = 'rgba(40,24,16,0.62)';
    ctx.beginPath();
    ctx.roundRect((W - gen) / 2, y, gen, yuk, boy * 0.6);
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    satirlar.forEach((l, i) => {
      const yy = y + boy * 0.35 + boy * 1.25 * (i + 0.5);
      if (ad && i === 0) {
        // konuşanın adı renkli
        const tam = ctx.measureText(l).width;
        const adG = ctx.measureText(`${ad}: `).width;
        ctx.textAlign = 'left';
        ctx.fillStyle = ALTYAZI_RENK[s.kim] ?? '#fff';
        ctx.fillText(`${ad}:`, W / 2 - tam / 2, yy);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(l.slice(ad.length + 2), W / 2 - tam / 2 + adG, yy);
        ctx.textAlign = 'center';
      } else {
        ctx.fillStyle = s.kim === 'anlatici' ? ALTYAZI_RENK.anlatici : '#ffffff';
        ctx.fillText(l, W / 2, yy);
      }
    });
    ctx.restore();
  }
}

function sar(ctx: CanvasRenderingContext2D, metin: string, en: number): string[] {
  const k = metin.split(' ');
  const satir: string[] = [];
  let s = '';
  for (const w of k) {
    const d = s ? `${s} ${w}` : w;
    if (ctx.measureText(d).width > en && s) {
      satir.push(s);
      s = w;
    } else s = d;
  }
  if (s) satir.push(s);
  return satir;
}
