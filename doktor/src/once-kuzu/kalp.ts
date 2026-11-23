// Stetoskop mantığı: uç kalbe yaklaştıkça güm-güm sıklaşır ve yükselir; kalbin üstünde kesintisiz beklenince hasta kıkırdar.
// Kuzu'da aynı bekleme daha kısadır (oyuncak davul). Saf mantık: DOM ve ses yok.

const sinirla = (v: number) => Math.max(0, Math.min(1, v));

/** Ucun kalbe yakınlığı (0 uzak … 1 tam üstünde). yaricap: atışın duyulmaya başladığı uzaklık. */
export const yakinlik = (uzaklik: number, yaricap: number): number => sinirla(1 - uzaklik / Math.max(1, yaricap));
/** İki atış arası (ms): uzakta sakin, kalbin üstünde hızlı. */
export const atisAraligi = (y: number): number => 980 - 560 * sinirla(y);
/** Atışın ses düzeyi (kazanç). */
export const atisKazanci = (y: number): number => 0.3 + 0.9 * sinirla(y);
/** Atışın çalma hızı: yakında biraz daha tiz. */
export const atisHizi = (y: number): number => 0.94 + 0.12 * sinirla(y);

/** Yaşa göre kalpte bekleme süresi (ms) ve kalp noktasının yarıçapı (sahne birimi). */
export const kalpAyari = (kucukYas: boolean) => ({ beklemeMs: kucukYas ? 1200 : 2000, yaricap: kucukYas ? 95 : 62 });

/** Hedefin üstünde kesintisiz bekleme sayacı: hedeften çıkınca sıfırlanır. */
export class Bekleme {
  private birikenMs = 0;
  private tamamlandi = false;
  constructor(private readonly hedefMs: number) {}
  /** ustunde: uç hedefin içinde mi; dt: geçen süre (ms). Bekleme tamamlandığı karede (bir kez) true döner. */
  adim(ustunde: boolean, dt: number): boolean {
    if (this.tamamlandi) return false;
    if (!ustunde) { this.birikenMs = 0; return false; }
    this.birikenMs += Math.max(0, dt);
    if (this.birikenMs >= this.hedefMs) { this.tamamlandi = true; return true; }
    return false;
  }
  get oran(): number { return this.tamamlandi ? 1 : sinirla(this.birikenMs / this.hedefMs); }
  get bitti(): boolean { return this.tamamlandi; }
  sifirla() { this.birikenMs = 0; this.tamamlandi = false; }
}

/** Atış zamanlayıcısı: her karede çağrılır; atış anında yakınlığı döndürür, değilse null. Uzakta (y = 0) atış yok. */
export class Nabiz {
  private sonAtis = -Infinity;
  adim(simdiMs: number, y: number): number | null {
    if (y <= 0) return null;
    if (simdiMs - this.sonAtis < atisAraligi(y)) return null;
    this.sonAtis = simdiMs;
    return y;
  }
}
