/**
 * Mino ile Kino'nun Pasta Otobüsü: Kino'nun işleri (ekip/senaryo/mino-kino-pasta.md §1b). Kino müşteriyi karşılar
 * (pencereye hop, kulaklar kalkar, patisini sallar), servis tabağının yanından koşar ("Buyurun!"), mutlu müşteride
 * Mino'yla çak yapar, günün hedefi tutunca zıplar; eski işleri (pervane kuyruk) de burada.
 *
 * Kural: hiçbir hareket bekletmez. Hepsi ateşle-unut (WAAPI + iskelet pozu); hareket sürerken Kino'nun çizimi
 * dokunuş almaz (data-kino-is), çocuğun bir sonraki dokunuşu her an tezgâha gider. Kino yerinden ancak boş yere kadar
 * kayar: fırın, istasyonlar, Mino ve ekran kenarı ölçülür (kutusu hiçbirine binmez).
 */
import type { Karakter, Poz } from '../../src/karakter/karakter';
import { AZ_HAREKET } from './gorsel';

/** Kino'nun işleri (test bunları data-kino-is'ten okur) */
export type KinoIsAdi = 'selam' | 'servis' | 'cak' | 'zipla';

/** Kalkık kol: iskelette kol-*-yukari katmanı varsa (yoksa yalnız beden hareketi) */
const YUK_ESIK = 30;

export class KinoIsci {
  /** hareket kabı: Kino'nun yerindeki (CSS ile konmuş) kutunun içinde; hop ve koşu bunu taşır */
  readonly hareket: HTMLElement;
  private pervaneBas = -9;
  private kulakBas = -9;
  private salla: { bas: number; sure: number; yan: 'sol' | 'sag' } | null = null;
  private kalk: { bas: number; sure: number; yan: 'sol' | 'sag'; aci: number } | null = null;
  private istif: { bas: number; sure: number; yan: 'sol' | 'sag' } | null = null;
  private bitis = 0;
  private zaman = 0;
  private anim: Animation | null = null;

  constructor(
    private kino: Karakter,
    private yer: HTMLElement,
  ) {
    this.hareket = yer.firstElementChild as HTMLElement;
    kino.ekHareket = (p) => this.poz(p);
  }

  private get t() {
    return performance.now() / 1000;
  }

  /** O karedeki ek duruş: pervane kuyruk, kalkık kulaklar, sallanan / kalkık pati */
  private poz(p: Poz) {
    const t = this.t;
    const g = t - this.pervaneBas;
    if (g < 1.4) {
      const z = Math.max(0, Math.min(1, g / 0.15, (1.4 - g) / 0.25));
      p.kuyruk += 40 * Math.sin(g * 40) * z;
      p.y -= 4 * Math.abs(Math.sin(g * 9)) * z;
      p.kulakSol += 10 * Math.sin(g * 18) * z;
      p.kulakSag += 10 * Math.sin(g * 18 + 1) * z;
    }
    const k = t - this.kulakBas;
    if (k < 0.9) {
      // kulaklar dikilir (sevinçle), sonra iner
      const z = Math.max(0, Math.min(1, k / 0.12, (0.9 - k) / 0.3));
      p.kulakSol += 14 * z;
      p.kulakSag += 14 * z;
      p.kafa -= 2 * z;
    }
    let sol = 0;
    let sag = 0;
    const s = this.salla;
    if (s) {
      const u = (t - s.bas) / s.sure;
      if (u >= 1) this.salla = null;
      else {
        // patisini sallar: kol kalkar, üç kez sallanır
        const z = Math.max(0, Math.min(1, u / 0.15, (1 - u) / 0.2));
        const a = (120 + 22 * Math.sin(u * Math.PI * 6)) * z;
        if (s.yan === 'sol') sol = a;
        else sag = a;
      }
    }
    const c = this.kalk;
    if (c) {
      const u = (t - c.bas) / c.sure;
      if (u >= 1) this.kalk = null;
      else {
        // pati havaya: hızla kalkar, bir an durur (çak), iner
        const z = Math.max(0, Math.min(1, u / 0.25, (1 - u) / 0.3));
        if (c.yan === 'sol') sol = Math.max(sol, c.aci * z);
        else sag = Math.max(sag, c.aci * z);
      }
    }
    const d = this.istif;
    if (d) {
      const u = (t - d.bas) / d.sure;
      if (u >= 1) this.istif = null;
      else {
        // jeton dizer: pati jetonlara uzanıp kalkar (kısa, sık), baş o yana eğik
        const z = Math.max(0, Math.min(1, u / 0.08, (1 - u) / 0.12));
        const a = (55 + 25 * Math.sin(u * d.sure * Math.PI * 7)) * z;
        if (d.yan === 'sol') sol = Math.max(sol, a);
        else sag = Math.max(sag, a);
        p.kafa += (d.yan === 'sag' ? 5 : -5) * z;
      }
    }
    const kv = this.kino;
    const ks = sol >= YUK_ESIK && !!kv.parcaG('kol-sol-yukari');
    const kg = sag >= YUK_ESIK && !!kv.parcaG('kol-sag-yukari');
    kv.ek('kol-sol-yukari', ks);
    kv.ek('kol-sag-yukari', kg);
    kv.gizle('kol-sol', ks);
    kv.gizle('kol-sag', kg);
    p.yukSol = ks ? sol : 0;
    p.yukSag = kg ? sag : 0;
  }

  /** Bir iş başlar: süresince Kino'nun çizimi dokunuş almaz, test için adı yazılır */
  private basla(ad: KinoIsAdi, ms: number) {
    this.yer.dataset.kinoIs = ad;
    this.bitis = Math.max(this.bitis, performance.now() + ms);
    const z = ++this.zaman;
    window.setTimeout(() => {
      if (z === this.zaman) delete this.yer.dataset.kinoIs;
    }, ms);
  }

  /** Kuyruk pervane olur, iki kez hoplar (fırın pişince, yanığı yerken) */
  pervane() {
    this.pervaneBas = this.t;
    if (this.kino.ifadeVar('heyecan')) this.kino.ifade('heyecan', 1400);
  }

  /** Kino'nun görünen kutusu (çizimin kendisi) */
  kutu(): DOMRect {
    return (this.kino.el.querySelector('svg') ?? this.kino.el).getBoundingClientRect();
  }

  private oynat(kare: Keyframe[], ms: number, easing = 'ease-out') {
    if (AZ_HAREKET) return;
    this.anim?.cancel();
    this.anim = this.hareket.animate(kare, { duration: ms, easing });
  }

  /**
   * Müşteriyi karşılar: pencereye bir hop (0.4 sn), kulaklar kalkar, müşteriye doğru patisini sallar. Sesi
   * (Hoş geldin!) çağıran söyletir.
   */
  selam(musteriX: number) {
    this.basla('selam', 1000);
    this.kulakBas = this.t;
    const r = this.kutu();
    this.salla = { bas: this.t, sure: 1, yan: musteriX < r.left + r.width / 2 ? 'sol' : 'sag' };
    this.oynat(
      [
        { transform: 'none' },
        { transform: 'translateY(-26%) scale(.96, 1.05)', offset: 0.45 },
        { transform: 'translateY(2%) scale(1.06, .94)', offset: 0.8 },
        { transform: 'none' },
      ],
      400,
    );
    if (this.kino.ifadeVar('heyecan')) this.kino.ifade('heyecan', 900);
  }

  /**
   * Servis: tabak uçarken (ms) Kino yolun ilk yarısında müşteriye doğru koşar (patisi tabağın altındaymış gibi
   * kalkık), sonra yerine döner. engeller: Kino'nun binmemesi gereken kutular (fırın, istasyonlar, Mino, ekran).
   */
  servis(hedefX: number, ms: number, engeller: DOMRect[], sinir: DOMRect) {
    const r = this.kutu();
    const orta = r.left + r.width / 2;
    const yon = hedefX >= orta ? 1 : -1;
    const istenen = Math.min(Math.abs(hedefX - orta) * 0.5, r.width * 0.6);
    const dx = yon * Math.min(istenen, bosluk(r, yon, engeller, sinir));
    this.basla('servis', ms + 260);
    this.kalk = { bas: this.t, sure: ms / 1000, yan: yon > 0 ? 'sag' : 'sol', aci: 80 };
    this.kulakBas = this.t;
    const x = `${dx.toFixed(1)}px`;
    // koşu: küçük hoplarla ileri (ilk yarı), pencerede bir an, sonra yerine
    this.oynat(
      [
        { transform: 'none' },
        { transform: `translate(calc(${x} * .25), -7%)`, offset: 0.12 },
        { transform: `translate(calc(${x} * .5), 0)`, offset: 0.24 },
        { transform: `translate(calc(${x} * .8), -7%)`, offset: 0.36 },
        { transform: `translate(${x}, 0)`, offset: 0.5 },
        { transform: `translate(${x}, -4%)`, offset: 0.62 },
        { transform: `translate(${x}, 0)`, offset: 0.7 },
        { transform: 'none' },
      ],
      ms + 260,
      'linear',
    );
  }

  /** Çak: pati Mino'ya doğru havaya kalkar (0.5 sn); yan: Mino ekranda Kino'nun solunda mı sağında mı */
  cak(minoYonu: 'sol' | 'sag', ms = 500, engeller: DOMRect[] = [], sinir?: DOMRect) {
    this.basla('cak', ms);
    this.kulakBas = this.t;
    this.kalk = { bas: this.t, sure: ms / 1000, yan: minoYonu, aci: 120 };
    // Mino'ya doğru küçük bir sıçrayış (yan yanaysalar patiler buluşur); fırına, istasyona binmeden
    const r = this.kutu();
    const yon = minoYonu === 'sag' ? 1 : -1;
    const dx = sinir ? yon * Math.min(r.width * 0.3, bosluk(r, yon, engeller, sinir)) : 0;
    const x = `${dx.toFixed(1)}px`;
    this.oynat(
      [
        { transform: 'none' },
        { transform: `translate(${x}, -12%) rotate(${yon * 6}deg)`, offset: 0.35 },
        { transform: `translate(${x}, -10%) rotate(${yon * 6}deg)`, offset: 0.6 },
        { transform: 'none' },
      ],
      ms,
    );
  }

  /** Akşam: jetonları kuleye dizer (pati o yana uzanıp kalkar), ms boyunca */
  istifle(yan: 'sol' | 'sag', ms: number) {
    this.istif = { bas: this.t, sure: ms / 1000, yan };
  }
  /** Dizmeyi bitir (çocuk kumbaraya erken dokundu) */
  istifBitir() {
    this.istif = null;
  }

  /** Hedef tamam: iki kez zıplar */
  zipla() {
    this.basla('zipla', 900);
    this.kulakBas = this.t;
    this.oynat(
      [
        { transform: 'none' },
        { transform: 'translateY(-28%)', offset: 0.22 },
        { transform: 'translateY(0) scale(1.06, .94)', offset: 0.45 },
        { transform: 'translateY(-22%)', offset: 0.7 },
        { transform: 'none' },
      ],
      900,
    );
  }

  /** İş sürüyor mu (yalnız gösterim) */
  get mesgul() {
    return performance.now() < this.bitis;
  }

  kapat() {
    this.anim?.cancel();
    this.kino.ekHareket = null;
  }
}

/**
 * Kino'nun kutusu bir eşyayla dikeyde bu oranın altında örtüşüyorsa (ayakları rafın arkasındaki kâsenin kepçe ucunu
 * sıyırır gibi) o eşya yolunu kesmez: gövdesi o eşyanın üstüne binmez. Test de aynı ölçüyü kullanır.
 */
export const DIKEY_PAY = 0.25;
type Kutu = { left: number; right: number; top: number; bottom: number };
/** Kino'nun gövdesi bu eşyanın üstüne biniyor mu (dikey örtüşme payın üstünde ve yatay örtüşme var) */
export function biner(r: Kutu, e: Kutu): boolean {
  const dikey = Math.min(r.bottom, e.bottom) - Math.max(r.top, e.top);
  const yatay = Math.min(r.right, e.right) - Math.max(r.left, e.left);
  return dikey > (r.bottom - r.top) * DIKEY_PAY && yatay > 1;
}

/**
 * Kutu (r) yon yönünde kaç piksel kayabilir: dikeyde (payın üstünde) örtüşen en yakın engele (ya da sınırın
 * kenarına) kadar, 4 px pay bırakarak. Engelin içindeyse 0.
 */
export function bosluk(r: Kutu, yon: number, engeller: Kutu[], sinir: { left: number; right: number }): number {
  let en = yon > 0 ? sinir.right - r.right : r.left - sinir.left;
  for (const e of engeller) {
    if (Math.min(r.bottom, e.bottom) - Math.max(r.top, e.top) <= (r.bottom - r.top) * DIKEY_PAY) continue;
    if (yon > 0 && e.left >= r.right - 1) en = Math.min(en, e.left - r.right);
    else if (yon < 0 && e.right <= r.left + 1) en = Math.min(en, r.left - e.right);
    else if (!(e.right <= r.left || e.left >= r.right)) return 0;
  }
  return Math.max(0, en - 4);
}
