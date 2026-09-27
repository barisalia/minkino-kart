/**
 * Mino'nun YANDAN görünüşü ve yürüyüşü (yeniden kullanılabilir parça: film, Sesli Maceralar, oyunlar).
 *
 * - MinoProfil: Adobe'nin profil iskeleti (ekip/mino/mino-profil.svg → scripts/mino/profil.mjs → mino-profil-svg.ts).
 *   Katmanlar arkadan öne: kuyruk, kulak-arka, bacak-arka, kol-arka, bacak-on, govde, kol-on, fular, kafa, kulak-on,
 *   goz, agiz (+ gizli goz-kapali). Çizim sağa bakar; sola yürürken dışarıdan aynalanır (scaleX(-1)).
 *   Yürüme döngüsü (yuruyus.ts): çizgi film yürüyüşü, her adım temas → çöküş → geçiş → yükseliş. Bacaklar kalçadaki
 *   dönme noktalarından öne ve geriye eşit döner (yakın ±24°, uzak ±23°: iki adım aynı yolu alır; basan pati yerde
 *   kaymaz, havadaki kalkar), kollar ters yönde ±19-22° sallanır, gövde adım ritminde iner-kalkar ve öne eğilir,
 *   kafa / kulak (±9) / kuyruk / fular geriden gelir (follow-through).
 *   Dururken nefes alır, göz kırpar.
 * - YuruyenMino: önden Mino (mino.ts) + profil. Yürürken yana döner (kısa daraltma + geçiş), durunca bacaklar
 *   toparlanır ve yumuşakça önden çizime döner. Profil yüklenmemişse önden kalır (hiçbir şey bozulmaz).
 *
 * Ağır (gömülü WebP ~210 KB): ilk kullanımda bir kez tembel yüklenir; minoProfilYukle() ile önceden yüklenebilir.
 */
import type { KonusBilgi } from '../audio/dudak';
import { AGIZ_ACIKLIK } from '../audio/dudak-mantik';
import { h, TEST_MODU } from '../ui/dom';
import { Mino } from './mino';
import { yuruyusPozu } from './yuruyus';

export { MINO_DONGU_YOLU } from './yuruyus';

type ProfilModul = typeof import('./mino-profil-svg');
let yukleme: Promise<ProfilModul | null> | null = null;
export function minoProfilYukle(): Promise<ProfilModul | null> {
  yukleme ??= import('./mino-profil-svg').then(
    (m) => m,
    () => null,
  );
  return yukleme;
}

const KATMANLAR = ['kuyruk', 'kulak-arka', 'bacak-arka', 'kol-arka', 'bacak-on', 'govde', 'kol-on', 'fular', 'kafa', 'kulak-on', 'goz', 'agiz', 'goz-kapali'] as const;
type Katman = (typeof KATMANLAR)[number];

/** Profil ve önden çizimin kutusu (viewBox genişliği; mino-svg ile aynı) */
export const MINO_KUTU_GENISLIK = 1360;
/** Yürümeye başlarken döngünün girdiği yer: geçiş evresine yakın (bacaklar kapalı, ilk adım doğal açılır) */
const BASLANGIC_FAZ = 0.2;

const sin = Math.sin;

export class MinoProfil {
  readonly el: HTMLElement;
  /** profil çizimi yüklendi mi (yüklenemezse false) */
  readonly hazir: Promise<boolean>;
  /** true: yürüyüş döngüsü ilerlemez (film duraklatılınca) */
  duraklat = false;
  private g: Partial<Record<Katman | 'beden', SVGGElement>> = {};
  private p: Record<string, [number, number]> = {};
  private yuklu = false;
  private raf = 0;
  private son = performance.now();
  private t = 0;
  /** adım döngüsü (0..1 = iki adım) */
  private faz = 0;
  /** yürüyüş gücü 0..1 (yumuşak başlar, yumuşak biter) */
  private guc = 0;
  private hedefGuc = 0;
  /** döngü / sn */
  private hiz = 1.6;
  private sonrakiKirp = 1.2 + Math.random() * 2;
  private kirpBas = -1;
  private konusuyor = false;
  /** Konuşurken ağzın açıklığı (0..1; dudak senkronu, önden Mino'nun şeklinden). null: kendi ritmi */
  aciklik: (() => number) | null = null;
  /** görünmüyorken ve dururken kare hesaplanmaz */
  gorunur = true;

  constructor() {
    this.el = h('div.mino-profil', { 'aria-hidden': 'true' });
    this.hazir = minoProfilYukle().then((m) => {
      if (!m) return false;
      this.el.innerHTML = m.MINO_PROFIL_SVG;
      this.p = m.MINO_PROFIL_DONME;
      this.g.beden = this.el.querySelector<SVGGElement>('.mp-beden') ?? undefined;
      for (const k of KATMANLAR) this.g[k] = this.el.querySelector<SVGGElement>(`.mp-${k}`) ?? undefined;
      this.yuklu = true;
      this.ciz();
      return true;
    });
    this.kare = this.kare.bind(this);
    this.raf = requestAnimationFrame(this.kare);
  }

  /** Yürümeye başla (ya da hızını değiştir); adimHizi: döngü / sn (bir döngü = iki adım) */
  yuru(adimHizi = 1.6) {
    this.hiz = adimHizi;
    if (this.hedefGuc === 0 && this.guc < 0.05) this.faz = BASLANGIC_FAZ;
    this.hedefGuc = 1;
  }

  /**
   * Yürüyüşü bir anda dondurur (evre görselleri ve testler için): faz 0..1 (iki adım; 0 ve 0.5 temas,
   * ~0.07 çöküş, 0.25 geçiş, ~0.35 yükseliş), guc 0..1.
   */
  evre(faz: number, guc = 1) {
    this.duraklat = true;
    this.faz = ((faz % 1) + 1) % 1;
    this.guc = this.hedefGuc = guc;
    this.t = 0;
    this.sonrakiKirp = Infinity;
    this.ciz();
  }

  /** Dur: bacaklar yumuşakça dinlenme duruşuna döner */
  dur() {
    this.hedefGuc = 0;
  }

  /** Yürüyüş gücü (0 = tam durdu) */
  get yurume() {
    return this.guc;
  }

  konus(acik: boolean) {
    this.konusuyor = acik;
  }

  kapat() {
    cancelAnimationFrame(this.raf);
  }

  private kare(simdi: number) {
    this.raf = requestAnimationFrame(this.kare);
    const dt = Math.min(0.1, Math.max(0, (simdi - this.son) / 1000));
    this.son = simdi;
    if (this.duraklat) return;
    this.t += dt;
    // güç: başlarken ~0.15 sn, dururken ~0.2 sn
    const k = TEST_MODU ? 1 : Math.min(1, dt * (this.hedefGuc > this.guc ? 14 : 11));
    this.guc += (this.hedefGuc - this.guc) * k;
    if (this.hedefGuc === 0 && this.guc < 0.01) this.guc = 0;
    // dururken döngü yavaşlayarak sürer, güç sıfırlanırken bacaklar dinlenme duruşunda toplanır (yarıda donmaz)
    if (this.guc > 0) this.faz = (this.faz + dt * this.hiz * Math.max(0.35, this.guc)) % 1;
    if (!this.gorunur && this.guc === 0) return;
    this.ciz();
  }

  private don(ad: string, derece: number, ek = '') {
    const [x, y] = this.p[ad] ?? [1024, 1024];
    return `${ek}rotate(${derece.toFixed(2)} ${x} ${y})`;
  }

  private ciz() {
    if (!this.yuklu) return;
    const g = this.g;
    const t = this.t;
    const z = yuruyusPozu(this.faz, this.guc, t);

    // beden (bütün katmanlar): önce yere göre basılma / uzama, sonra öne eğim, sonra iniş-kalkış
    const [ax, ay] = this.p.govde ?? [1100, 1880];
    g.beden?.setAttribute(
      'transform',
      `translate(0 ${z.bob.toFixed(1)}) rotate(${z.egim.toFixed(2)} ${ax} ${ay}) translate(${ax} ${ay}) scale(${z.sx.toFixed(4)} ${z.sy.toFixed(4)}) translate(${-ax} ${-ay})`,
    );

    // bacaklar kalçadan döner (patiyi yere oturtan dikey kayma + havadakinin kalkması), kollar ters
    g['bacak-on']?.setAttribute('transform', this.don('bacak-on', z.bacakOn, `translate(0 ${z.bacakOnY.toFixed(1)}) `));
    g['bacak-arka']?.setAttribute('transform', this.don('bacak-arka', z.bacakArka, `translate(0 ${z.bacakArkaY.toFixed(1)}) `));
    g['kol-on']?.setAttribute('transform', this.don('kol-on', z.kolOn));
    g['kol-arka']?.setAttribute('transform', this.don('kol-arka', z.kolArka));

    // kafa: gövdenin iniş-kalkışını biraz geriden izler; dururken hafif bakınma
    const kafaT = this.don('kafa', z.kafa, `translate(0 ${z.kafaY.toFixed(1)}) `);
    g.kafa?.setAttribute('transform', kafaT);
    // kafaya bağlılar: önce kafanın dönüşü, sonra kendi dönüşü
    const kulak = z.kulak;
    g['kulak-on']?.setAttribute('transform', `${kafaT} ${this.don('kulak-on', -kulak)}`);
    g['kulak-arka']?.setAttribute('transform', `${kafaT} ${this.don('kulak-arka', -kulak * 0.8)}`);
    // göz kırpma
    if (t > this.sonrakiKirp) {
      this.kirpBas = t;
      this.sonrakiKirp = t + 2.2 + Math.random() * 3;
    }
    const kapali = this.kirpBas >= 0 && t - this.kirpBas < 0.14;
    g.goz?.setAttribute('transform', kafaT);
    g['goz-kapali']?.setAttribute('transform', kafaT);
    if (g.goz) g.goz.style.display = kapali ? 'none' : '';
    if (g['goz-kapali']) g['goz-kapali'].style.display = kapali ? '' : 'none';
    // ağız: konuşurken çizili ağız aşağı doğru açılıp kapanır
    const [mx, my] = this.p.agiz ?? [1510, 995];
    const acik = this.konusuyor ? 1 + (this.aciklik ? this.aciklik() : Math.abs(sin(t * 15))) * 0.7 : 1;
    g.agiz?.setAttribute('transform', `${kafaT} translate(${mx} ${my - 20}) scale(1 ${acik.toFixed(3)}) translate(${-mx} ${-(my - 20)})`);

    // kuyruk: adımla dalgalanır (geriden gelir, ±6); dururken yavaş sallanır. fular: adımın ardından dalga
    g.kuyruk?.setAttribute('transform', this.don('kuyruk', z.kuyruk));
    g.fular?.setAttribute('transform', this.don('fular', z.fular));
  }
}

/**
 * Önden Mino + yandan Mino. Oyun / film yalnız yuru() ve dur() çağırır; yön (aynalama) dışarıdan verilir
 * (film: nesnenin scaleX'i) ya da yon ile.
 */
export class YuruyenMino {
  readonly el: HTMLElement;
  readonly mino: Mino;
  readonly profil: MinoProfil;
  private profilHazir = false;
  private donusZaman = 0;

  constructor(mino = new Mino()) {
    this.mino = mino;
    this.profil = new MinoProfil();
    this.profil.gorunur = false;
    // yandan ağız, önden Mino'nun dudak şekline göre açılır
    this.profil.aciklik = () => AGIZ_ACIKLIK[this.mino.agizSekliSu];
    this.el = h('div.mino-yuruyen', {}, this.mino.el, this.profil.el);
    void this.profil.hazir.then((v) => (this.profilHazir = v));
  }

  /** Yan dönüp yürür. adimHizi: döngü / sn. Profil henüz yüklenmediyse false döner (çağıran önden sektirir). */
  yuru(adimHizi = 1.6): boolean {
    if (!this.profilHazir) return false;
    clearTimeout(this.donusZaman);
    this.profil.gorunur = true;
    this.profil.yuru(adimHizi);
    this.el.classList.add('yandan');
    return true;
  }

  /** Durur; bacaklar toparlanınca önden çizime döner */
  dur() {
    if (!this.el.classList.contains('yandan')) return;
    this.profil.dur();
    clearTimeout(this.donusZaman);
    this.donusZaman = window.setTimeout(
      () => {
        this.el.classList.remove('yandan');
        window.setTimeout(() => {
          if (!this.el.classList.contains('yandan')) this.profil.gorunur = false;
        }, 400);
      },
      TEST_MODU ? 0 : 170,
    );
  }

  get yandan() {
    return this.el.classList.contains('yandan');
  }

  /** Yön: 1 sağa, -1 sola (film kendi aynaladığı için kullanmaz) */
  set yon(y: 1 | -1) {
    this.el.style.setProperty('--mino-yon', String(y));
  }

  /** Konuşuyor (bilgi: cümle ve filmin MP4 kaydında ağız dizisi; Mino.agizOyna) */
  konus(acik: boolean, bilgi?: KonusBilgi) {
    this.mino.agizOyna(acik, bilgi);
    this.profil.konus(acik);
  }

  set duraklat(d: boolean) {
    this.profil.duraklat = d;
  }

  kapat() {
    clearTimeout(this.donusZaman);
    this.mino.kapat();
    this.profil.kapat();
  }
}

