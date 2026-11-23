// "Gerçek his" katmanları (Barış, 22 Kasım gecesi: "gerçekten sabunladığını, sildiğini hissetmiyorsun"). Alet götürülüp
// bırakılmaz; parmağın geçtiği yerde iz bırakır. Buradaki iki katman o izi tutar:
//  · KopukKatmani: köpük öbekleri (Astra'nın `kopuk` çizimi) parmağın yolunda birikir, silinir, durulanır.
//  · SuKatmani: akan su ve sıçrayan damlalar (lavabo sahnesi; Paket Doktor-A1 gelince damla ve akış çizimleriyle çizilir).
// Hesapların saf kısmı (ızgara, damla adımı) veri.ts içinde; birim testleri oradan sınar.
import {
  KOPUK_DOLU, SAHNE, damlaUret, izgaraDolular, izgaraEkle, izgaraMiktar, izgaraSil, kopukIzgarasi, sicramaUret, suAdimi,
  type Nokta, type SuParcasi,
} from './veri';

const el = <K extends keyof HTMLElementTagNameMap>(etiket: K, sinif: string): HTMLElementTagNameMap[K] => { const e = document.createElement(etiket); e.className = sinif; return e; };
/** tuvaller sahnenin yarı çözünürlüğünde: köpük ve su yumuşak kenarlıdır, yarı çözünürlük görünmez; bellek dörtte bir */
const O = 0.5;

/** Köpük katmanı: öbekler bir kez çizilir ve kalır (tuval); miktar kaba bir ızgarada tutulur. */
export class KopukKatmani {
  readonly tuval: HTMLCanvasElement;
  private readonly g: CanvasRenderingContext2D;
  private readonly izgara = kopukIzgarasi();
  constructor(private readonly kopuk: CanvasImageSource) {
    this.tuval = el('canvas', 'vk-katman vk-kopuk-tuvali');
    this.tuval.width = SAHNE.g * O; this.tuval.height = SAHNE.y * O;
    this.g = this.tuval.getContext('2d')!;
    // ısınma: ilk çizim ve ilk silme yolu açılışta bir kez (görünmeden) çalışır
    this.g.globalAlpha = 0.01; this.g.drawImage(this.kopuk, 2, 2, 4, 4); this.g.globalAlpha = 1;
    this.g.clearRect(0, 0, 8, 8);
  }
  /** p'ye bir öbek basar (boy: sahne pikseli, aci: derece). O yer zaten köpük doluysa basmaz. */
  ekle(p: Nokta, boy: number, aci: number): boolean {
    if (izgaraMiktar(this.izgara, p, 1) >= KOPUK_DOLU) return false;
    izgaraEkle(this.izgara, p, 1);
    const g = this.g;
    g.save(); g.translate(p.x * O, p.y * O); g.rotate((aci * Math.PI) / 180);
    g.drawImage(this.kopuk, (-boy / 2) * O, (-boy / 2) * O, boy * O, boy * O);
    g.restore();
    return true;
  }
  /** p çevresindeki köpüğü siler (durulama, silme, patlama): kenarı yumuşak. guc 0–1. */
  sil(p: Nokta, yaricap: number, guc = 1): void {
    const g = this.g, r = yaricap * O;
    const gr = g.createRadialGradient(p.x * O, p.y * O, r * 0.45, p.x * O, p.y * O, r);
    gr.addColorStop(0, `rgba(0,0,0,${guc})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = gr;
    g.beginPath(); g.arc(p.x * O, p.y * O, r, 0, Math.PI * 2); g.fill(); g.restore();
    izgaraSil(this.izgara, p, yaricap * 0.8, guc);
  }
  /** p çevresindeki köpük miktarı (öbek sayısı gibi düşünülür) */
  miktar(p: Nokta, yaricap: number): number { return izgaraMiktar(this.izgara, p, yaricap); }
  /** köpüklü yerlerin merkezleri (hepsini sırayla patlatmak için) */
  dolular(): Nokta[] { return izgaraDolular(this.izgara); }
  temizle(): void { this.g.clearRect(0, 0, this.tuval.width, this.tuval.height); this.izgara.fill(0); }
}

/**
 * Su katmanı: bir kaynaktan (musluk ağzı, duş başlığı) aşağı akan su ve çarptığı yerde sıçrayan damlalar. Kaynak her
 * karede verilir; verilmezse su kesilir, havadaki damlalar düşüp biter. Çizim: Astra'nın damla çizimi verilirse o,
 * verilmezse yumuşak mavi damla (yalnız geliştirmede görülür: lavabo sahnesi A1 çizimleri olmadan açılmaz).
 */
export class SuKatmani {
  readonly tuval: HTMLCanvasElement;
  private readonly g: CanvasRenderingContext2D;
  private parcalar: SuParcasi[] = [];
  private akis: { kaynak: Nokta; hedefY: number } | null = null;
  private birikim = 0;
  private kirli = false;
  /** akarken çarpma noktasından sıçrayan damlalar: kaç ms'de bir, kaçar tane */
  aralik = 40; adet = 3;
  private readonly sutun: boolean;
  /** secenek.sutun = false: akan sütun çizilmez (onu Astra'nın akış kareleri çizer), yalnız damlalar */
  constructor(private readonly damla?: CanvasImageSource, secenek: { sutun?: boolean } = {}) {
    this.sutun = secenek.sutun ?? true;
    this.tuval = el('canvas', 'vk-katman vk-su-tuvali');
    this.tuval.width = SAHNE.g * O; this.tuval.height = SAHNE.y * O;
    this.g = this.tuval.getContext('2d')!;
  }
  /** bu karede su akıyor: kaynak ve suyun çarptığı yükseklik (sahne pikseli) */
  ak(kaynak: Nokta, hedefY: number): void { this.akis = { kaynak, hedefY }; }
  kes(): void { this.akis = null; }
  get akiyor(): boolean { return this.akis !== null; }
  get bos(): boolean { return this.akis === null && this.parcalar.length === 0; }
  /** suyun o an çarptığı nokta (köpüğü durulamak, sıçrama sesi için) */
  get carpma(): Nokta | null { return this.akis ? { x: this.akis.kaynak.x, y: this.akis.hedefY } : null; }
  /** p noktasından bir avuç damla sıçrar (pati suya girdi, pamuk kâseye daldı) */
  sicrat(p: Nokta, adet: number): void { if (this.parcalar.length < 120) this.parcalar.push(...sicramaUret(p, adet)); }
  /** p noktasından tek damla düşer */
  damlat(p: Nokta): void { if (this.parcalar.length < 120) this.parcalar.push(damlaUret(p)); }
  get damlaSayisi(): number { return this.parcalar.length; }
  /** bir kare ilerletir ve çizer */
  kare(dt: number): void {
    const g = this.g;
    if (this.akis) {
      this.birikim += dt;
      // çarpma noktasından belli aralıkla birkaç damla sıçrar
      while (this.birikim >= this.aralik) { this.birikim -= this.aralik; if (this.parcalar.length < 90) this.parcalar.push(...sicramaUret({ x: this.akis.kaynak.x, y: this.akis.hedefY }, this.adet)); }
    }
    this.parcalar = suAdimi(this.parcalar, dt);
    // boşken tuvale dokunulmaz (her karede boş tuvali silmek gereksiz iş)
    if (!this.akis && this.parcalar.length === 0 && !this.kirli) return;
    g.clearRect(0, 0, this.tuval.width, this.tuval.height);
    this.kirli = this.parcalar.length > 0 || (this.akis !== null && this.sutun);
    if (this.akis && this.sutun) {
      // akan sütun: kaynaktan çarpma noktasına, hafifçe dalgalanır
      const { kaynak, hedefY } = this.akis, t = performance.now() / 90;
      g.lineCap = 'round';
      for (const [en, renk] of [[30, '#7cc8f5'], [12, '#d9f1ff']] as const) {
        g.strokeStyle = renk; g.lineWidth = en * O;
        g.beginPath(); g.moveTo(kaynak.x * O, kaynak.y * O);
        const orta = (kaynak.y + hedefY) / 2;
        g.quadraticCurveTo((kaynak.x + Math.sin(t) * 5) * O, orta * O, (kaynak.x + Math.sin(t * 1.3) * 3) * O, hedefY * O);
        g.stroke();
      }
    }
    for (const p of this.parcalar) {
      const a = Math.min(1, p.omur / 160);
      g.globalAlpha = a;
      if (this.damla) g.drawImage(this.damla, (p.x - p.boy / 2) * O, (p.y - p.boy / 2) * O, p.boy * O, p.boy * 1.25 * O);
      else {
        // damla: hızının yönünde hafifçe uzar; üstünde küçük bir parlama
        const r = (p.boy / 2) * O, uz = 1 + Math.min(0.6, Math.hypot(p.vx, p.vy) * 0.5);
        g.fillStyle = '#8fd3ff'; g.beginPath(); g.ellipse(p.x * O, p.y * O, r, r * uz, Math.atan2(p.vy, p.vx) - Math.PI / 2, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#e9f8ff'; g.beginPath(); g.arc(p.x * O - r * 0.3, p.y * O - r * 0.3, r * 0.3, 0, Math.PI * 2); g.fill();
      }
    }
    g.globalAlpha = 1;
  }
}
