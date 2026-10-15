/**
 * Pati Dükkânı: bir hayvanın canlılığı. PARÇA DÖNDÜRME YOK (Barış'ın kuralı): hareket yalnız
 * - poz değiştirme (Gemini'nin çizdiği hazır pozlar; geçişte 120 ms ezilme-esneme, "kesme" değil "zıplama" gibi),
 * - bütün gövde: nefes (taban pivotlu), zıplama yayı, iniş ezilmesi, titreme, sallanma, yürüme adımları,
 * - göz kırpma (göz yaması 140 ms; yaması olmayan hayvanda kapalı).
 * Yalnız transform ve opacity. Poz sayfası gelmemişse hayvan tek resimle (kadro kesimi) aynı hareketleri yapar.
 *
 * Katmanlar: .pt-hayvan (sahnedeki yer: ayakların ortası) > .pt-yon (aynalama) > .pt-hareket (zıplama, WAAPI)
 * > .pt-dongu (hâlin döngüsü, CSS: data-hal) > .pt-nefes (CSS) > .pt-poz (ezilme) > img (+ göz yaması)
 */
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import type { HayvanAdi } from './ihtiyac';
import { ses } from './sesler';
import { gozYamasi, pozAdresi, type Poz } from './varliklar';

export type Hal = 'bos' | 'ac' | 'oyun' | 'usudu' | 'uyku' | 'uykulu';
const HAL_POZ: Record<Hal, Poz> = { bos: 'bos', ac: 'ac', oyun: 'oyun', usudu: 'usudu', uyku: 'uyku', uykulu: 'uykulu' };
const AZ = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const ras = (a: number, b: number) => a + Math.random() * (b - a);
const bitir = (a: Animation) => a.finished.then(
  () => undefined,
  () => undefined,
);

export interface HayvanAyar {
  ad: HayvanAdi;
  /** boy (sahne birimi; resmin yüksekliği) */
  boy: number;
  /** ayakların ortası (sahne birimi) */
  x: number;
  y: number;
  /** balık: akvaryumun içi (yüzme alanı, sahne birimi) */
  alan?: { x0: number; x1: number; y0: number; y1: number };
}

export class Hayvan {
  readonly ad: HayvanAdi;
  readonly el: HTMLElement;
  readonly resim: HTMLImageElement;
  private yonEl: HTMLElement;
  private hareketEl: HTMLElement;
  private donguEl: HTMLElement;
  private pozEl: HTMLElement;
  private goz: HTMLImageElement | null = null;
  private zz: HTMLElement;
  /** şu anki yer (ayaklar, sahne birimi) */
  x: number;
  y: number;
  readonly evX: number;
  readonly evY: number;
  /** 1 sağa, -1 sola bakar */
  private yon = 1;
  hal: Hal = 'bos';
  private poz: Poz = 'bos';
  /** geçici poz (yiyor, sevinç…) bitince hâlin pozuna dönülür */
  private gecici: Poz | null = null;
  private kirpZaman = 0;
  private yuzRaf = 0;
  private hedef: [number, number] | null = null;
  private kapandi = false;
  /** yüzerken başka işe (yeme) çağrıldıysa */
  private mesgul = false;

  constructor(readonly ayar: HayvanAyar) {
    this.ad = ayar.ad;
    this.x = this.evX = ayar.x;
    this.y = this.evY = ayar.y;
    this.resim = h('img.pt-resim', { src: pozAdresi(this.ad, 'bos').url, alt: '', draggable: 'false' }) as HTMLImageElement;
    const yama = gozYamasi(this.ad);
    if (yama) this.goz = h('img.pt-goz-yama', { src: yama.url, alt: '', style: `left:${yama.x * 100}%;top:${yama.y * 100}%;width:${yama.w * 100}%;height:${yama.h * 100}%` }) as HTMLImageElement;
    this.pozEl = h('div.pt-poz', {}, this.resim, this.goz);
    this.donguEl = h('div.pt-dongu', {}, h('div.pt-nefes', {}, this.pozEl));
    this.hareketEl = h('div.pt-hareket', {}, this.donguEl);
    this.yonEl = h('div.pt-yon', {}, this.hareketEl);
    this.zz = h('div.pt-zz', { 'aria-hidden': 'true' }, h('i', {}, 'z'), h('i', {}, 'z'), h('i', {}, 'z'));
    this.el = h(`div.pt-hayvan.pt-${this.ad}`, { 'data-hayvan': this.ad, 'data-hal': 'bos', style: `--boy:${ayar.boy}px` }, this.yonEl, this.zz);
    // en-boy oranı resimden (bütün pozlar aynı tuvalde)
    const oran = () => this.resim.naturalWidth && this.el.style.setProperty('--oran', (this.resim.naturalWidth / this.resim.naturalHeight).toFixed(4));
    this.resim.addEventListener('load', oran);
    oran();
    this.yerlestir();
    this.kirpZaman = performance.now() + ras(2400, 5400);
    if (ayar.alan) this.yuzmeBaslat();
    else this.kirpDongusu();
  }

  /** resmin ekrandaki kutusu (bırakma hedefi, efektler) */
  kutu(): DOMRect {
    return this.resim.getBoundingClientRect();
  }

  private yerlestir() {
    this.el.style.transform = `translate(${this.x.toFixed(1)}px, ${this.y.toFixed(1)}px)`;
  }

  private bakYon(y: number) {
    if (y === this.yon) return;
    this.yon = y;
    this.yonEl.style.transform = y < 0 ? 'scaleX(-1)' : '';
    this.ezil(0.9);
  }
  /** bir noktaya (sahne x) doğru döner */
  bak(x: number) {
    if (Math.abs(x - this.x) > 8) this.bakYon(x < this.x ? -1 : 1);
  }

  // ---------------------------------------------------------------- poz ve hâl
  /** Poz değişimi: resim değişir, gövde ezilip esner (120 ms) */
  private pozGoster(p: Poz) {
    const { url } = pozAdresi(this.ad, p);
    const eski = this.resim.getAttribute('src');
    this.poz = p;
    if (eski !== url) {
      this.resim.src = url;
      this.ezil();
    }
    this.el.dataset.poz = p;
    // göz yaması yalnız ana pozun üstüne oturur
    if (this.goz) this.goz.hidden = p !== 'bos';
  }

  /** Ezilme-esneme (taban pivotlu): scaleY 0.92 → 1.06 → 1 */
  ezil(guc = 1) {
    if (AZ || TEST_MODU) return;
    const a = 0.08 * guc;
    this.pozEl.animate(
      [
        { transform: 'scale(1, 1)' },
        { transform: `scale(${1 + a * 0.6}, ${1 - a})`, offset: 0.35 },
        { transform: `scale(${1 - a * 0.4}, ${1 + a * 0.75})`, offset: 0.7 },
        { transform: 'scale(1, 1)' },
      ],
      { duration: 160, easing: 'ease-out' },
    );
  }

  /** Hâl: pozu ve döngü hareketini belirler (ihtiyaç bedenle gösterilir) */
  halAyarla(hal: Hal) {
    this.hal = hal;
    this.el.dataset.hal = hal;
    // gerçek pozu yoksa kod beden hareketiyle anlatır (CSS: [data-yedek])
    this.el.toggleAttribute('data-yedek', !pozAdresi(this.ad, HAL_POZ[hal]).gercek);
    if (!this.gecici) this.pozGoster(HAL_POZ[hal]);
    this.zz.classList.toggle('acik', hal === 'uyku');
    if (this.ayar.alan) this.hedef = null;
  }

  /** Geçici poz (ms sonra hâlin pozuna döner) */
  async anlik(p: Poz, ms: number) {
    this.gecici = p;
    this.pozGoster(p);
    this.el.toggleAttribute('data-anlik-yedek', !pozAdresi(this.ad, p).gercek);
    this.el.dataset.anlik = p;
    await new Promise((r) => setTimeout(r, sure(ms)));
    if (this.gecici !== p) return;
    this.gecici = null;
    delete this.el.dataset.anlik;
    this.el.removeAttribute('data-anlik-yedek');
    if (!this.kapandi) this.pozGoster(HAL_POZ[this.hal]);
  }

  // ---------------------------------------------------------------- bütün gövde hareketleri
  /** Zıplama: çömel, yaylan, havada (isteğe bağlı poz), iniş ezilmesi. yuk: sahne birimi. dx: yatay yol */
  async zipla(yuk = 90, ms = 560, havaPozu?: Poz, dx = 0) {
    if (this.kapandi) return;
    if (havaPozu) {
      this.gecici = havaPozu;
      this.pozGoster(havaPozu);
    }
    ses.hop();
    if (!AZ && !TEST_MODU) {
      await bitir(
        this.hareketEl.animate(
          [
            { transform: 'translate(0, 0) scale(1, 1)' },
            { transform: 'translate(0, 0) scale(1.08, 0.88)', offset: 0.15 },
            { transform: `translate(${(dx * 0.5).toFixed(0)}px, ${-yuk}px) scale(0.95, 1.08)`, offset: 0.5, easing: 'ease-in' },
            { transform: `translate(${dx.toFixed(0)}px, 0) scale(1.1, 0.86)`, offset: 0.86 },
            { transform: `translate(${dx.toFixed(0)}px, 0) scale(1, 1)` },
          ],
          { duration: ms, easing: 'ease-out' },
        ),
      );
    }
    // yatay yol: animasyon bitince yer kalıcı olur (geri sıçramaz)
    if (dx) {
      this.x += dx;
      this.yerlestir();
    }
    ses.pit();
    if (havaPozu && this.gecici === havaPozu) {
      this.gecici = null;
      this.pozGoster(HAL_POZ[this.hal]);
    }
  }

  /** Sevinç: sevinç pozu, iki zıplama, sesi */
  async sevin() {
    this.sesi(2);
    await this.zipla(110, 560, 'sevinc');
    await this.zipla(60, 420, 'sevinc');
  }

  /** Gerinme (uyanırken): önce ezilir, uzun esner */
  async gerin() {
    ses.gerin();
    if (AZ || TEST_MODU) return;
    await bitir(
      this.hareketEl.animate(
        [
          { transform: 'scale(1, 1)' },
          { transform: 'scale(1.12, 0.82)', offset: 0.3 },
          { transform: 'scale(0.94, 1.12)', offset: 0.7 },
          { transform: 'scale(1, 1)' },
        ],
        { duration: 900, easing: 'ease-in-out' },
      ),
    );
  }

  /** "Hı?": iki küçük öne eğilme (koklama), yanlış eşyaya cezasız tepki */
  async kokla() {
    ses.hi();
    if (AZ || TEST_MODU) return;
    const k = 18 * this.yon;
    await bitir(
      this.hareketEl.animate(
        [
          { transform: 'translate(0, 0) scale(1, 1)' },
          { transform: `translate(${k}px, 6px) scale(1.03, 0.96)`, offset: 0.25 },
          { transform: 'translate(0, 0) scale(1, 1)', offset: 0.5 },
          { transform: `translate(${k}px, 6px) scale(1.03, 0.96)`, offset: 0.75 },
          { transform: 'translate(0, 0) scale(1, 1)' },
        ],
        { duration: 700, easing: 'ease-in-out' },
      ),
    );
  }

  /** Dokununca kendi sevimli hareketi (boş dokunuş): küçük zıplama ya da baloncuk */
  async dokunuldu() {
    this.sesi(1);
    if (this.ayar.alan) {
      this.ezil(1.2);
      return;
    }
    await this.zipla(50, 420);
  }

  /** Hayvanın kendi sesi */
  sesi(kez = 1) {
    if (this.ad === 'findik') ses.hav(kez);
    else if (this.ad === 'tarcin') ses.miyav();
    else for (let i = 0; i < kez + 1; i++) setTimeout(() => ses.blup(i), i * 140);
  }

  /** Yürüyerek bir yere gider (adım adım küçük yaylanmalar; yüzüne doğru döner). x: sahne birimi */
  async yuru(x: number, hiz = 700) {
    if (this.kapandi) return;
    const yol = x - this.x;
    if (Math.abs(yol) < 4) return;
    this.bakYon(yol < 0 ? -1 : 1);
    const ms = sure(Math.max(260, (Math.abs(yol) / hiz) * 1000));
    const adim = Math.max(1, Math.round(ms / 220));
    const kare: Keyframe[] = [];
    for (let i = 0; i <= adim * 2; i++) kare.push({ transform: `translateY(${i % 2 ? -14 : 0}px) scale(${i % 2 ? '0.98, 1.03' : '1, 1'})` });
    if (!AZ && !TEST_MODU) this.donguEl.animate(kare, { duration: ms, easing: 'linear' });
    this.el.style.transition = `transform ${ms}ms cubic-bezier(.4,.1,.5,1)`;
    this.x = x;
    this.yerlestir();
    await new Promise((r) => setTimeout(r, ms));
    this.el.style.transition = '';
  }

  /** Minderin üstüne çıkar / iner (minder ayağının dibinde, gövde biraz yükselir) */
  minderde(var_: boolean, yukseklik = 46) {
    this.y = this.evY + (var_ ? -yukseklik : 0);
    this.yerlestir();
  }

  /** Eve (köşesindeki yerine) döner ve sağa bakar */
  async eveDon() {
    await this.yuru(this.evX);
    this.bakYon(1);
  }

  // ---------------------------------------------------------------- göz kırpma
  private kirpDongusu() {
    if (!this.goz || this.kapandi) return;
    const adim = () => {
      if (this.kapandi) return;
      const t = performance.now();
      if (t >= this.kirpZaman && this.poz === 'bos' && this.goz) {
        this.goz.classList.add('acik');
        setTimeout(() => this.goz?.classList.remove('acik'), 140);
        this.kirpZaman = t + ras(2400, 5400);
      }
      setTimeout(adim, 200);
    };
    adim();
  }

  // ---------------------------------------------------------------- balık: yüzme
  private yuzmeBaslat() {
    const alan = this.ayar.alan!;
    let once = performance.now();
    let faz = Math.random() * 6;
    let kuyruk = 0;
    const adim = (t: number) => {
      if (this.kapandi) return;
      const dt = Math.min(0.05, (t - once) / 1000);
      once = t;
      faz += dt;
      if (!this.mesgul && this.hal === 'uyku') {
        // uyurken yavaşça dibe süzülür, kıpırdamaz
        if (this.y < alan.y1 - 2) {
          this.y += 30 * dt;
          this.yerlestir();
        }
      } else if (!this.mesgul) {
        const ust = this.hal === 'ac';
        if (!this.hedef || Math.hypot(this.hedef[0] - this.x, this.hedef[1] - this.y) < 20) {
          this.hedef = [ras(alan.x0, alan.x1), ust ? alan.y0 + ras(0, 30) : ras(alan.y0 + 60, alan.y1)];
        }
        const hiz = this.hal === 'uykulu' ? 40 : ust ? 140 : 90;
        const [hx, hy] = this.hedef;
        const d = Math.hypot(hx - this.x, hy - this.y) || 1;
        this.x += ((hx - this.x) / d) * hiz * dt;
        this.y += ((hy - this.y) / d) * hiz * dt * 0.6 + Math.sin(faz * 2.2) * 8 * dt;
        if (Math.abs(hx - this.x) > 10) this.bakYon(hx < this.x ? -1 : 1);
        this.yerlestir();
        // kuyruk: iki yüzme karesi arasında geçiş (poz sayfası gelince)
        kuyruk += dt;
        if (kuyruk > 0.45 && !this.gecici && this.hal === 'bos') {
          kuyruk = 0;
          const p: Poz = this.poz === 'bos' ? 'yuz2' : 'bos';
          if (pozAdresi(this.ad, p).gercek) this.pozGoster(p);
        }
      }
      this.yuzRaf = requestAnimationFrame(adim);
    };
    this.yuzRaf = requestAnimationFrame(adim);
  }

  /** Balık bir noktaya (sahne birimi) yüzer ve oradaki yemi yutar */
  async yemeGit(x: number, y: number) {
    this.mesgul = true;
    this.bak(x);
    const ms = sure(Math.min(900, Math.max(300, Math.hypot(x - this.x, y - this.y) * 2.2)));
    this.el.style.transition = `transform ${ms}ms cubic-bezier(.3,.6,.4,1)`;
    // ağzı (önü) yemin üstüne gelsin: resmin ortası yemin biraz gerisinde; resmin altı suyun içinde kalır
    const alan = this.ayar.alan;
    this.x = x - this.ayar.boy * 0.45 * this.yon;
    this.y = alan ? Math.max(alan.y0, Math.min(alan.y1, y + this.ayar.boy * 0.6)) : y;
    this.yerlestir();
    await new Promise((r) => setTimeout(r, ms));
    this.el.style.transition = '';
    ses.blup(2);
    await this.anlik('yiyor', 420);
    this.mesgul = false;
  }

  /** Balık: çok yem yedi, karnı şişti (kıkırdar gibi) */
  async sisir() {
    ses.blup(3);
    if (AZ || TEST_MODU) return;
    await bitir(this.pozEl.animate([{ transform: 'scale(1,1)' }, { transform: 'scale(1.16, 1.1)', offset: 0.3 }, { transform: 'scale(1.12, 1.08)', offset: 0.7 }, { transform: 'scale(1,1)' }], { duration: 1100, easing: 'ease-in-out' }));
  }

  kapat() {
    this.kapandi = true;
    cancelAnimationFrame(this.yuzRaf);
  }
}
