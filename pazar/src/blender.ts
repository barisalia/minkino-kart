/**
 * Meyve Suyu Köşesi: şeffaf blender ve bardak (SVG + kod, görsel dosya yok; stil kuralı: parlak, kalın koyu kahve kontur).
 *
 * Katmanlar (arkadan öne): sürahinin arka camı → içi (sıvı, girdap parçacıkları, meyveler, bıçak) → ön cam
 * (kontur, parlama, kapak, sap, musluk) → motor ve bardak altlığı → musluktan akan su → bardak.
 * Karıştırma: motor titrer, bıçak döner, meyveler girdaba kapılıp parçalanır, renk sıvıda yavaş yavaş oluşur.
 * Dökme: musluk kolu iner, su bardağa akar, sürahi boşalır, bardak dolar, pipet takılır.
 * Yalnız transform / opacity (WAAPI ve CSS); hareketi azalt tercihinde sade.
 */
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { blenderSesi, dokmeSesi, plopSesi } from './meyvesuyu-ses';

const K = '#5a3617';
export const AZ = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const SADE = AZ || TEST_MODU;
const ras = (a: number, b: number) => a + Math.random() * (b - a);
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Ortak degrade tanımları (sayfada bir kez; kimlikler ms- önekli) */
const TANIMLAR = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <linearGradient id="ms-kirmizi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6b5e"/><stop offset=".55" stop-color="#f0413f"/><stop offset="1" stop-color="#c92f2d"/></linearGradient>
  <linearGradient id="ms-krem" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#f1dcc0"/></linearGradient>
  <linearGradient id="ms-cam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e6f5ff" stop-opacity=".75"/><stop offset=".5" stop-color="#d4ecff" stop-opacity=".35"/><stop offset="1" stop-color="#bfe0ff" stop-opacity=".7"/></linearGradient>
  <linearGradient id="ms-metal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9aa6b2"/><stop offset=".5" stop-color="#f4f8fb"/><stop offset="1" stop-color="#8a96a3"/></linearGradient>
</defs></svg>`;

// ---- blender (viewBox 330 × 360) ----
const JAR = 'M150 44 L164 272 Q166 282 176 282 H280 Q290 282 292 272 L306 44 Z';
const ARKA = `<svg class="ms-b-arka" viewBox="0 0 330 360" aria-hidden="true">
  <path d="${JAR}" fill="url(#ms-cam)"/>
  <ellipse cx="228" cy="48" rx="76" ry="8" fill="#cfe8ff" opacity=".6"/>
</svg>`;
const ON = `<svg class="ms-b-on" viewBox="0 0 330 360" aria-hidden="true">
  <!-- sap -->
  <path d="M300 78 Q330 80 326 120 L318 214 Q314 240 288 236" fill="none" stroke="${K}" stroke-width="22" stroke-linecap="round"/>
  <path d="M300 78 Q330 80 326 120 L318 214 Q314 240 288 236" fill="none" stroke="#e9f6ff" stroke-width="10" stroke-linecap="round" opacity=".9"/>
  <!-- sürahi konturu ve cam parlaması -->
  <path d="${JAR}" fill="none" stroke="${K}" stroke-width="8" stroke-linejoin="round"/>
  <path d="M170 70 L180 250" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".75"/>
  <path d="M188 70 L192 120" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6"/>
  <path d="M290 96 L283 230" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".4"/>
  <!-- ölçü çizgileri -->
  <path d="M274 110h16M276 150h14M278 190h12M280 230h10" stroke="${K}" stroke-width="4" stroke-linecap="round" opacity=".45"/>
  <!-- kapak -->
  <rect x="142" y="26" width="172" height="26" rx="12" fill="url(#ms-kirmizi)" stroke="${K}" stroke-width="7"/>
  <rect x="206" y="8" width="44" height="24" rx="10" fill="url(#ms-kirmizi)" stroke="${K}" stroke-width="7"/>
  <path d="M154 34h60" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55"/>
  <!-- musluk: borusu, ağzı -->
  <rect x="96" y="194" width="74" height="22" rx="9" fill="url(#ms-metal)" stroke="${K}" stroke-width="7"/>
  <rect x="87" y="190" width="26" height="46" rx="10" fill="url(#ms-kirmizi)" stroke="${K}" stroke-width="7"/>
  <path d="M95 200v22" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".6"/>
</svg>`;
/** Musluk kolu ayrı: dökerken iner */
const KOL = `<svg class="ms-b-kol" viewBox="0 0 330 360" aria-hidden="true">
  <path d="M100 190 L126 166" stroke="${K}" stroke-width="16" stroke-linecap="round"/>
  <path d="M100 190 L126 166" stroke="#ffc72c" stroke-width="7" stroke-linecap="round"/>
  <circle cx="128" cy="164" r="10" fill="#ffc72c" stroke="${K}" stroke-width="6"/>
</svg>`;
const MOTOR = `<svg class="ms-b-motor" viewBox="0 0 330 360" aria-hidden="true">
  <!-- bardak altlığı -->
  <rect x="36" y="334" width="130" height="18" rx="9" fill="url(#ms-metal)" stroke="${K}" stroke-width="7"/>
  <path d="M50 340h100" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>
  <!-- sürahinin oturduğu bilezik -->
  <rect x="160" y="268" width="136" height="26" rx="8" fill="#3f3f4f" stroke="${K}" stroke-width="7"/>
  <!-- motor gövdesi -->
  <path d="M156 292 H300 Q312 292 310 304 L302 344 Q300 354 290 354 H166 Q156 354 154 344 L146 304 Q144 292 156 292 Z" fill="url(#ms-kirmizi)" stroke="${K}" stroke-width="8" stroke-linejoin="round"/>
  <path d="M162 302 H290" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".5"/>
  <!-- düğme -->
  <g class="ms-b-dugme">
    <circle cx="228" cy="326" r="17" fill="#ffc72c" stroke="${K}" stroke-width="6"/>
    <circle cx="223" cy="320" r="5" fill="#fff" opacity=".8"/>
  </g>
  <circle cx="176" cy="326" r="6" fill="#7ed957" stroke="${K}" stroke-width="4" class="ms-b-isik"/>
</svg>`;
const BICAK = `<svg viewBox="0 0 60 20" aria-hidden="true"><path d="M4 8 Q18 2 30 10 Q42 18 56 12" fill="none" stroke="${K}" stroke-width="7" stroke-linecap="round"/><path d="M4 8 Q18 2 30 10 Q42 18 56 12" fill="none" stroke="url(#ms-metal)" stroke-width="3" stroke-linecap="round"/><circle cx="30" cy="11" r="5" fill="#9aa6b2" stroke="${K}" stroke-width="3"/></svg>`;
/** Sıvının üstündeki dalga (iki dalga boyu: kaydıkça kesintisiz) */
const DALGA = (renk: string) =>
  `<svg viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden="true"><path d="M0 10 Q25 0 50 10 T100 10 T150 10 T200 10 V20 H0 Z" fill="${renk}"/></svg>`;

// ---- bardak (viewBox 84 × 82) ----
const BARDAK_YOL = 'M4 4 L12 74 Q13 80 20 80 H64 Q71 80 72 74 L80 4 Z';
const BARDAK_ARKA = `<svg class="ms-bd-arka" viewBox="0 0 84 82" aria-hidden="true"><path d="${BARDAK_YOL}" fill="url(#ms-cam)"/></svg>`;
const BARDAK_ON = `<svg class="ms-bd-on" viewBox="0 0 84 82" aria-hidden="true">
  <path d="${BARDAK_YOL}" fill="none" stroke="${K}" stroke-width="6" stroke-linejoin="round"/>
  <path d="M14 14 L19 66" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".75"/>
  <path d="M68 16 L66 34" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/>
</svg>`;
const PIPET = `<svg class="ms-bd-pipet" viewBox="0 0 40 110" aria-hidden="true">
  <path d="M8 104 L20 22 Q22 10 34 6" fill="none" stroke="${K}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M8 104 L20 22 Q22 10 34 6" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M8 104 L20 22 Q22 10 34 6" fill="none" stroke="#f0413f" stroke-width="6" stroke-dasharray="7 7" stroke-linecap="butt"/>
</svg>`;

/** Kodla çizilmiş yaban mersini (assets/meyveler'de yok): üç parlak mavi tane, taç, kalın kahve kontur */
export const YABANMERSINI = `<svg class="pz-resim" viewBox="0 0 120 120" role="img" aria-hidden="true">
  <defs><radialGradient id="ms-mersin" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#8fc3ff"/><stop offset=".5" stop-color="#3e6fd8"/><stop offset="1" stop-color="#28389a"/></radialGradient></defs>
  <g stroke="${K}" stroke-width="6">
    <circle cx="40" cy="74" r="28" fill="url(#ms-mersin)"/>
    <circle cx="82" cy="78" r="26" fill="url(#ms-mersin)"/>
    <circle cx="62" cy="42" r="27" fill="url(#ms-mersin)"/>
  </g>
  <g fill="#28389a" stroke="${K}" stroke-width="3" stroke-linejoin="round">
    <path d="M62 30 l5 7 8 -1 -5 6 3 8 -8 -3 -6 5 -1 -8 -7 -4 8 -3z" transform="translate(-3 0) scale(.9) translate(6 3)"/>
  </g>
  <g fill="#fff" opacity=".7"><ellipse cx="30" cy="62" rx="7" ry="4" transform="rotate(-30 30 62)"/><ellipse cx="74" cy="68" rx="6" ry="3.5" transform="rotate(-30 74 68)"/><ellipse cx="52" cy="30" rx="7" ry="4" transform="rotate(-30 52 30)"/></g>
</svg>`;

/** Düğme ikonu: pipetli portakal suyu bardağı */
export const BARDAK_IKON = `<svg viewBox="0 0 48 48" aria-hidden="true">
  <path d="M30 14 L34 3 L40 5" fill="none" stroke="${K}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M30 14 L34 3 L40 5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9 12 L13 42 Q13.5 45 17 45 H31 Q34.5 45 35 42 L39 12 Z" fill="#fff" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M11.4 22 L13.6 41.5 Q14 43 16.6 43 H31.4 Q34 43 34.4 41.5 L36.6 22 Z" fill="#ff8a2b"/>
  <path d="M15 17 L17 38" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>
  <circle cx="36" cy="12" r="6" fill="#ffc72c" stroke="${K}" stroke-width="3.5"/>
</svg>`;

let tanimlarEklendi = false;
function tanimlariEkle() {
  if (tanimlarEklendi || typeof document === 'undefined') return;
  tanimlarEklendi = true;
  document.body.append(h('div', { html: TANIMLAR, 'aria-hidden': 'true', style: 'position:absolute;width:0;height:0;overflow:hidden' }));
}

/** Bardak: ayrı bir eleman (müşteriye uçar, müşteri içer) */
export class Bardak {
  readonly el: HTMLElement;
  readonly sivi: HTMLElement;
  readonly pipet: HTMLElement;
  constructor(renk = '#ffc72c') {
    tanimlariEkle();
    this.sivi = h('div.ms-bd-sivi', { style: `--su:${renk}` }, h('i.ms-bd-kopuk'));
    this.pipet = h('div.ms-bd-pipet-yer', { html: PIPET });
    this.el = h('div.ms-bardak', { role: 'img', 'aria-label': 'Meyve suyu' }, h('div.ms-bd-arka-yer', { html: BARDAK_ARKA }), h('div.ms-bd-ic', {}, this.sivi), this.pipet, h('div.ms-bd-on-yer', { html: BARDAK_ON }));
  }
  renk(r: string) {
    this.sivi.style.setProperty('--su', r);
  }
  /** 0..1 doluluk (anında) */
  dolu(o: number) {
    this.sivi.style.transform = `scaleY(${o})`;
  }
}

export class Blender {
  readonly el: HTMLElement;
  /** meyvelerin konduğu yer (sürahinin içi) */
  readonly meyveler: HTMLElement;
  readonly bardak: Bardak;
  private ic: HTMLElement;
  private sivi: HTMLElement;
  private siviRenk: HTMLElement;
  private sonuc: HTMLElement;
  private dalga: HTMLElement;
  private girdap: HTMLElement;
  private bicak: HTMLElement;
  private akis: HTMLElement;
  private kol: HTMLElement;
  private sesDur: (() => void) | null = null;
  calisiyor = false;

  constructor() {
    tanimlariEkle();
    this.meyveler = h('div.ms-meyveler');
    this.siviRenk = h('div.ms-sivi-renkler');
    this.sonuc = h('i.ms-sivi-sonuc');
    this.dalga = h('div.ms-dalga');
    this.sivi = h('div.ms-sivi', {}, this.siviRenk, this.sonuc, this.dalga, h('i.ms-sivi-parlak'));
    this.girdap = h('div.ms-girdap');
    this.bicak = h('div.ms-bicak', { html: BICAK });
    this.ic = h('div.ms-b-ic', {}, this.sivi, this.girdap, this.meyveler, this.bicak);
    this.akis = h('div.ms-akis', {}, h('i'));
    this.kol = h('div.ms-b-kol-yer', { html: KOL });
    this.bardak = new Bardak();
    this.bardak.dolu(0);
    this.el = h(
      'div.ms-blender',
      { role: 'region', 'aria-label': 'Blender' },
      h('div.ms-b-katman', { html: ARKA }),
      this.ic,
      h('div.ms-b-katman', { html: ON }),
      this.kol,
      h('div.ms-b-katman.ms-b-motor-yer', { html: MOTOR }),
      this.akis,
      h('div.ms-bardak-yer', {}, this.bardak.el),
    );
    this.sivi.style.transform = 'translateY(102%)';
  }

  /** İçindeki meyveler (sıra: konuluş) */
  get icindekiler(): string[] {
    return [...this.meyveler.querySelectorAll<HTMLElement>('.pz-urun')].map((e) => e.dataset.urun ?? '');
  }

  /** Meyve içeri düştü: sürahi hafifçe sekip "plop", küçük sıçrama damlaları */
  dustu(renk: string) {
    plopSesi();
    this.el.classList.remove('ms-plop');
    void this.el.offsetWidth;
    this.el.classList.add('ms-plop');
    if (SADE) return;
    for (let i = 0; i < 5; i++) {
      const d = h('i.ms-damla', { style: `background:${renk};left:${ras(30, 70)}%` });
      this.ic.append(d);
      const dx = ras(-26, 26);
      d.animate(
        [
          { transform: 'translate(0, 0) scale(1)', opacity: 1 },
          { transform: `translate(${dx}px, ${-ras(18, 40)}px) scale(.9)`, opacity: 1, offset: 0.45, easing: 'ease-in' },
          { transform: `translate(${dx * 1.5}px, 10px) scale(.5)`, opacity: 0 },
        ],
        { duration: 520, easing: 'ease-out' },
      ).finished.then(
        () => d.remove(),
        () => d.remove(),
      );
    }
  }

  /** Düğmeye basılabilir mi (içinde meyve var): motor düğmesi nabız gibi atar */
  hazir(acik: boolean) {
    this.el.classList.toggle('ms-hazir', acik);
  }

  /**
   * Karıştırır: renkler = meyvelerin suyu (girdaptaki parçacıklar), sonuc = oluşacak renk.
   * Meyveler girdaba kapılıp küçülür, parçacıklar döner, sıvı yükselir, renk yavaşça sonuca döner.
   */
  async karistir(renkler: string[], sonuc: string) {
    this.calisiyor = true;
    this.hazir(false);
    this.el.classList.add('ms-basti');
    await bekle(sure(160));
    this.el.classList.remove('ms-basti');
    this.el.classList.add('ms-donuyor');
    const toplam = SADE ? sure(AZ ? 600 : 30) : 2600;
    this.sesDur = blenderSesi(toplam / 1000);

    // sıvının renk katmanları: her meyvenin rengi bir girdap lekesi, üstte sonuç rengi yavaşça belirir
    this.siviRenk.replaceChildren(
      ...renkler.map((r, i) => h('i.ms-leke', { style: `background:${r};--a:${Math.round((i * 360) / Math.max(1, renkler.length))}deg` })),
    );
    this.sonuc.style.background = sonuc;
    this.dalga.innerHTML = DALGA(sonuc);
    this.sonuc.style.opacity = '0';
    this.dalga.style.opacity = '0';

    // meyveler girdaba kapılır: döner, küçülür, yukarı savrulur
    const meyveler = [...this.meyveler.children] as HTMLElement[];
    meyveler.forEach((m, i) =>
      m.animate(
        [
          { transform: 'none', opacity: 1 },
          { transform: `translate(${i % 2 ? 12 : -12}%, -30%) rotate(${i % 2 ? 200 : -200}deg) scale(.7)`, opacity: 1, offset: 0.5 },
          { transform: `translate(0, -60%) rotate(${i % 2 ? 540 : -540}deg) scale(.05)`, opacity: 0 },
        ],
        { duration: SADE ? 1 : 900 + i * 120, easing: 'cubic-bezier(.5,0,.6,1)', fill: 'forwards' },
      ),
    );
    // parçacıklar: her meyveden renkli parçalar girdapta döner (iç halka hızlı, dış halka yavaş)
    if (!SADE) {
      renkler.forEach((r, i) => {
        for (let k = 0; k < 7; k++) {
          const yaricap = ras(14, 40);
          const p = h('i.ms-parca', { style: `--r:${yaricap.toFixed(0)}%;--g:${-ras(0, 1).toFixed(2)}s;--h:${(0.45 + yaricap / 90).toFixed(2)}s;--b:${ras(0.6, 1.2).toFixed(2)}` }, h('b', { style: `background:${r}` }));
          this.girdap.append(p);
          p.animate([{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.6 }, { opacity: 0 }], { duration: toplam, delay: 250 + i * 120, fill: 'both' });
        }
      });
    }
    // sıvı yükselir; renk lekeleri döner, sonuç rengi yavaşça oluşur
    const yuksel = this.sivi.animate([{ transform: 'translateY(102%)' }, { transform: 'translateY(30%)', offset: 0.55 }, { transform: 'translateY(26%)' }], { duration: toplam * 0.8, delay: SADE ? 0 : 200, easing: 'cubic-bezier(.4,0,.3,1)', fill: 'forwards' });
    const renklen = [this.sonuc, this.dalga].map((e) => e.animate([{ opacity: 0 }, { opacity: 0, offset: 0.35 }, { opacity: 1 }], { duration: toplam, easing: 'ease-in-out', fill: 'forwards' }));
    await Promise.all([yuksel.finished, ...renklen.map((a) => a.finished)].map((p) => p.catch(() => undefined)));
    this.sivi.style.transform = 'translateY(26%)';
    yuksel.cancel();
    this.sonuc.style.opacity = '1';
    this.dalga.style.opacity = '1';
    renklen.forEach((a) => a.cancel());
    this.siviRenk.replaceChildren();
    this.meyveler.replaceChildren();
    this.girdap.replaceChildren();
    this.el.classList.remove('ms-donuyor');
    this.sesDur?.();
    this.sesDur = null;
    // durunca sıvı bir kez çalkalanır
    this.el.classList.add('ms-durdu');
    await bekle(sure(420));
    this.el.classList.remove('ms-durdu');
  }

  /** Musluktan bardağa döker: kol iner, su akar, bardak dolar, sürahi boşalır, pipet takılır */
  async dok(renk: string) {
    this.bardak.renk(renk);
    this.akis.style.setProperty('--su', renk);
    this.el.classList.add('ms-dokuyor');
    const t = SADE ? sure(AZ ? 500 : 30) : 1500;
    dokmeSesi(t / 1000);
    const bosal = this.sivi.animate([{ transform: 'translateY(26%)' }, { transform: 'translateY(102%)' }], { duration: t, delay: SADE ? 0 : 160, easing: 'ease-in', fill: 'forwards' });
    const dol = this.bardak.sivi.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(.12)', offset: 0.15 }, { transform: 'scaleY(1)' }], { duration: t, delay: SADE ? 0 : 220, easing: 'ease-out', fill: 'forwards' });
    await Promise.all([bosal.finished, dol.finished].map((p) => p.catch(() => undefined)));
    this.bardak.dolu(1);
    dol.cancel();
    this.sivi.style.transform = 'translateY(102%)';
    bosal.cancel();
    this.el.classList.remove('ms-dokuyor');
    // pipet takılır (küçük sekme)
    this.bardak.el.classList.add('ms-pipetli');
    await bekle(sure(380));
    this.calisiyor = false;
  }

  /** Yeni bardak: eskisi gitti, boş bardak altlığa sekerek konur */
  yeniBardak() {
    const b = this.bardak;
    b.el.classList.remove('ms-pipetli', 'ms-gitti');
    b.dolu(0);
    b.el.classList.remove('ms-yeni');
    void b.el.offsetWidth;
    b.el.classList.add('ms-yeni');
  }

  /** Her şeyi boşalt (yanlışta meyveler tezgâha döner, sürahi temizlenir) */
  bosalt() {
    this.meyveler.replaceChildren();
    this.girdap.replaceChildren();
    this.siviRenk.replaceChildren();
    this.sivi.style.transform = 'translateY(102%)';
    this.hazir(false);
  }

  kapat() {
    this.sesDur?.();
    this.el.getAnimations({ subtree: true }).forEach((a) => a.cancel());
  }
}
