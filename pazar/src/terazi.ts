/**
 * Pazar terazisi (SVG + kod, görsel dosya yok): pirinç kollu, zincirle asılı iki kefeli, ibreli eski usul terazi.
 * Kol yaylı-sönümlü bir fizikle salınır: her konan meyvede ağır taraf biraz iner, dengelenince iki kefe aynı hizaya
 * gelir, ibre ortadaki yeşil bölgede durur ve kefeler parlar. Kefeler kol uçlarından sarkar, kol hızlanınca hafifçe
 * sallanır (sarkaç). Yalnız transform (rAF ile her karede) ve opacity.
 */
import { h, TEST_MODU } from '../../src/ui/dom';

const KONTUR = '#5a3617';
/** SVG çizim alanı (px ölçüleri buna göre oranlanır) */
const G = 440;
const Y = 210;
const PIVOT = { x: 220, y: 74 };
/** kolun yarı boyu (pivottan kefe askısına) */
const L = 150;
/** bir birim ağırlık farkının kolu eğdiği açı; en çok ±AZAMI */
const BIRIM_ACI = 5;
const AZAMI = 16;

const TABAN = `<svg class="pz-t-taban" viewBox="0 0 ${G} ${Y}" aria-hidden="true">
  <defs>
    <linearGradient id="pz-t-pirinc" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#b9791f"/><stop offset=".45" stop-color="#ffd978"/><stop offset=".6" stop-color="#f3b940"/><stop offset="1" stop-color="#a86a18"/>
    </linearGradient>
    <linearGradient id="pz-t-tahta" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e8a35a"/><stop offset="1" stop-color="#b8702f"/>
    </linearGradient>
  </defs>
  <!-- kadran: yarım daire, ortası yeşil (denge) -->
  <path d="M${PIVOT.x - 46} ${PIVOT.y} A46 46 0 0 1 ${PIVOT.x + 46} ${PIVOT.y}Z" fill="#fff8e8" stroke="${KONTUR}" stroke-width="4"/>
  <path class="pz-t-yesil" d="M${PIVOT.x} ${PIVOT.y}L${PIVOT.x - 12} ${PIVOT.y - 44.4}A46 46 0 0 1 ${PIVOT.x + 12} ${PIVOT.y - 44.4}Z" fill="#7ed957"/>
  ${[-60, -40, -20, 20, 40, 60].map((d) => { const r = (d - 90) * Math.PI / 180; return `<path d="M${PIVOT.x + Math.cos(r) * 36} ${PIVOT.y + Math.sin(r) * 36}L${PIVOT.x + Math.cos(r) * 44} ${PIVOT.y + Math.sin(r) * 44}" stroke="${KONTUR}" stroke-width="3" stroke-linecap="round"/>`; }).join('')}
  <!-- direk ve taban -->
  <rect x="${PIVOT.x - 8}" y="${PIVOT.y}" width="16" height="${Y - PIVOT.y - 30}" rx="6" fill="url(#pz-t-pirinc)" stroke="${KONTUR}" stroke-width="4"/>
  <path d="M${PIVOT.x - 70} ${Y - 6}Q${PIVOT.x - 66} ${Y - 34} ${PIVOT.x - 30} ${Y - 34}H${PIVOT.x + 30}Q${PIVOT.x + 66} ${Y - 34} ${PIVOT.x + 70} ${Y - 6}Z" fill="url(#pz-t-tahta)" stroke="${KONTUR}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M${PIVOT.x - 52} ${Y - 26}H${PIVOT.x + 52}" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".45"/>
</svg>`;

const KOL = `<svg class="pz-t-kol-svg" viewBox="0 0 ${G} ${Y}" aria-hidden="true">
  <!-- ibre: kola bağlı, yukarı bakar -->
  <path d="M${PIVOT.x} ${PIVOT.y}L${PIVOT.x - 4} ${PIVOT.y - 10}L${PIVOT.x} ${PIVOT.y - 42}L${PIVOT.x + 4} ${PIVOT.y - 10}Z" fill="#e2463f" stroke="${KONTUR}" stroke-width="2.5" stroke-linejoin="round"/>
  <rect x="${PIVOT.x - L - 6}" y="${PIVOT.y - 7}" width="${2 * L + 12}" height="14" rx="7" fill="url(#pz-t-pirinc)" stroke="${KONTUR}" stroke-width="4"/>
  <path d="M${PIVOT.x - L + 8} ${PIVOT.y - 2}H${PIVOT.x + L - 8}" stroke="#fff6cf" stroke-width="3" stroke-linecap="round" opacity=".8"/>
  <circle cx="${PIVOT.x - L}" cy="${PIVOT.y}" r="9" fill="url(#pz-t-pirinc)" stroke="${KONTUR}" stroke-width="4"/>
  <circle cx="${PIVOT.x + L}" cy="${PIVOT.y}" r="9" fill="url(#pz-t-pirinc)" stroke="${KONTUR}" stroke-width="4"/>
  <circle cx="${PIVOT.x}" cy="${PIVOT.y}" r="13" fill="url(#pz-t-pirinc)" stroke="${KONTUR}" stroke-width="4"/>
  <circle cx="${PIVOT.x}" cy="${PIVOT.y}" r="4" fill="${KONTUR}"/>
</svg>`;

/** Kefe: üç zincir + sığ pirinç tas; içindekiler (.pz-kefe-ic) tasın ağzında */
const KEFE = `<svg class="pz-t-kefe-svg" viewBox="0 0 130 96" aria-hidden="true">
  <path d="M65 2L10 66M65 2L120 66M65 2V62" stroke="${KONTUR}" stroke-width="2.6" stroke-dasharray="5 3" stroke-linecap="round"/>
  <circle cx="65" cy="4" r="4" fill="url(#pz-t-pirinc)" stroke="${KONTUR}" stroke-width="2.5"/>
  <path d="M4 66H126Q120 94 65 94Q10 94 4 66Z" fill="url(#pz-t-pirinc)" stroke="${KONTUR}" stroke-width="4" stroke-linejoin="round"/>
  <ellipse cx="65" cy="66" rx="61" ry="7" fill="#fff0bd" stroke="${KONTUR}" stroke-width="3.5"/>
  <path d="M20 78Q40 88 64 88" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5" fill="none"/>
</svg>`;

export class Terazi {
  readonly el: HTMLElement;
  readonly kefeSol: HTMLElement;
  readonly kefeSag: HTMLElement;
  /** kefelerin içi (ürünler buraya konur) */
  readonly icSol: HTMLElement;
  readonly icSag: HTMLElement;
  private kol: HTMLElement;
  private aci = 0;
  private hiz = 0;
  private hedef = 0;
  private esit = false;
  private raf = 0;
  private son = 0;
  private w = 0;
  private gozcu: ResizeObserver | null;

  constructor() {
    this.icSol = h('div.pz-kefe-ic');
    this.icSag = h('div.pz-kefe-ic');
    this.kefeSol = h('div.pz-t-kefe.pz-t-sol', {}, h('div.pz-t-kefe-govde', { html: KEFE }, this.icSol), h('i.pz-t-parilti'));
    this.kefeSag = h('div.pz-t-kefe.pz-t-sag', { role: 'region', 'aria-label': 'Terazinin kefesi' }, h('div.pz-t-kefe-govde', { html: KEFE }, this.icSag), h('i.pz-t-parilti'));
    this.kol = h('div.pz-t-kol', { html: KOL });
    this.el = h('div.pz-terazi', { html: TABAN }, this.kol, this.kefeSol, this.kefeSag);
    this.son = performance.now();
    this.raf = requestAnimationFrame((t) => this.kare(t));
    // genişlik vw/vh ile değişir (döndürme, tarayıcı çubuğu): kefeler px ile konduğu için yeniden ölçülür
    this.gozcu = typeof ResizeObserver === 'function' ? new ResizeObserver(this.olc) : null;
    this.gozcu?.observe(this.el);
    addEventListener('resize', this.olc);
    addEventListener('orientationchange', this.olc);
  }

  /** Kefelerdeki toplam ağırlıklar; kol yeni dengeye doğru salınır */
  agirliklar(sol: number, sag: number) {
    this.hedef = Math.max(-AZAMI, Math.min(AZAMI, (sag - sol) * BIRIM_ACI));
    this.esit = sol === sag && sol > 0;
    // yeni ağırlık gelince küçük bir itki: kefe "düşer" gibi
    this.hiz += (this.hedef - this.aci) * 1.8;
    if (!this.esit) this.el.classList.remove('dengede');
  }

  /** Kol ortada durdu ve kefeler eşit mi */
  get dengede() {
    return this.esit && Math.abs(this.aci) < 0.6 && Math.abs(this.hiz) < 4;
  }

  private kare(t: number) {
    this.raf = requestAnimationFrame((x) => this.kare(x));
    const dt = Math.min(0.05, (t - this.son) / 1000);
    this.son = t;
    if (TEST_MODU) {
      this.aci = this.hedef;
      this.hiz = 0;
    } else {
      // yaylı-sönümlü salınım (hafif fazla salınır, sonra oturur)
      const ivme = 42 * (this.hedef - this.aci) - 5.2 * this.hiz;
      this.hiz += ivme * dt;
      this.aci += this.hiz * dt;
    }
    if (!this.w) this.w = this.el.offsetWidth;
    const olcek = this.w / G;
    const r = (this.aci * Math.PI) / 180;
    const px = PIVOT.x * olcek;
    const py = PIVOT.y * olcek;
    const l = L * olcek;
    this.kol.style.transform = `rotate(${this.aci.toFixed(2)}deg)`;
    // kefeler kol uçlarından sarkar; kol hızlanınca biraz geride kalıp sallanır (sarkaç)
    const sallan = Math.max(-10, Math.min(10, -this.hiz * 0.12));
    this.kefeSol.style.transform = `translate(${(px - l * Math.cos(r)).toFixed(1)}px, ${(py - l * Math.sin(r)).toFixed(1)}px) rotate(${sallan.toFixed(2)}deg)`;
    this.kefeSag.style.transform = `translate(${(px + l * Math.cos(r)).toFixed(1)}px, ${(py + l * Math.sin(r)).toFixed(1)}px) rotate(${sallan.toFixed(2)}deg)`;
    if (this.dengede) this.el.classList.add('dengede');
  }

  /** Boyut değişince (döndürme) yeniden ölçülsün; sonraki karede kefeler yeni ölçüyle kol uçlarına oturur */
  readonly olc = () => {
    this.w = this.el.offsetWidth;
  };

  kapat() {
    cancelAnimationFrame(this.raf);
    this.gozcu?.disconnect();
    removeEventListener('resize', this.olc);
    removeEventListener('orientationchange', this.olc);
  }
}
