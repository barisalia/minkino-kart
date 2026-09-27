/**
 * Mino'nun YANDAN görünüşü ve yürüyüşü (yeniden kullanılabilir parça: film, Sesli Maceralar, oyunlar).
 *
 * - MinoProfil: Adobe'nin profil iskeleti (ekip/mino/mino-profil.svg → scripts/mino/profil.mjs → mino-profil-svg.ts).
 *   Katmanlar arkadan öne: kuyruk, kulak-arka, bacak-arka, kol-arka, bacak-on, govde, kol-on, fular, kafa, kulak-on,
 *   goz, agiz (+ gizli goz-kapali). Çizim sağa bakar; sola yürürken dışarıdan aynalanır (scaleX(-1)).
 *   Yürüme döngüsü: bacaklar kalçadan karşılıklı (±15°, daha fazlasında kalçada boşluk görünür), kollar ters,
 *   gövde her adımda iner-kalkar ve hafifçe öne eğilir, kafa / kulak / kuyruk / fular geriden gelir (follow-through).
 *   Dururken nefes alır, göz kırpar.
 * - YuruyenMino: önden Mino (mino.ts) + profil. Yürürken yana döner (kısa daraltma + geçiş), durunca bacaklar
 *   toparlanır ve yumuşakça önden çizime döner. Profil yüklenmemişse önden kalır (hiçbir şey bozulmaz).
 *
 * Ağır (gömülü WebP ~210 KB): ilk kullanımda bir kez tembel yüklenir; minoProfilYukle() ile önceden yüklenebilir.
 */
import { h, TEST_MODU } from '../ui/dom';
import { Mino } from './mino';

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

/** Yürüyüş ölçüleri (derece / çizim birimi) */
const BACAK = 18;
/**
 * Kollar küçük salınır: gövde katmanında kolun arkası doldurulmuş (bulanık) bölge var, fazla salınınca görünüyor.
 * Arka kol gövdenin arkasında, biraz daha serbest.
 */
const KOL_ON = 5;
const KOL_ARKA = 8;
/** bacakların gövdeye birleştiği yükseklik (eğmenin sabit çizgisi) ve patilerin tabanı (çizim birimi) */
const DIKIS_Y = 1725;
const TABAN_Y = 1895;
/** bir tam döngüde (iki adım) gövdenin aldığı yol (çizim birimi): her adımda basan pati 2·h·tan(BACAK) geri kayar */
export const MINO_DONGU_YOLU = 4 * (TABAN_Y - DIKIS_Y) * Math.tan((BACAK * Math.PI) / 180);
/** Profil ve önden çizimin kutusu (viewBox genişliği; mino-svg ile aynı) */
export const MINO_KUTU_GENISLIK = 1360;

const sin = Math.sin;
const TAM = Math.PI * 2;

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
    if (this.hedefGuc === 0 && this.guc < 0.05) this.faz = 0;
    this.hedefGuc = 1;
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
    // dururken bacak döngüsü en yakın dinlenme noktasına (faz 0 / 0.5) doğru tamamlanır, yarıda donmaz
    if (this.guc > 0) this.faz = (this.faz + dt * this.hiz * Math.max(0.35, this.guc)) % 1;
    if (!this.gorunur && this.guc === 0) return;
    this.ciz();
  }

  private don(ad: string, derece: number, ek = '') {
    const [x, y] = this.p[ad] ?? [1024, 1024];
    return `${ek}rotate(${derece.toFixed(2)} ${x} ${y})`;
  }

  /**
   * Bacak: kalçadan döndürmek yerine gövdenin alt çizgisinden (DIKIS_Y) yatay eğme. Böylece bacağın gövdeyle
   * birleştiği dikiş yerinde kalır (dönmede dikiş eğilip kontur kesikleri ve beyaz boşluklar görünüyordu),
   * pati ise yere paralel kalır (basan ayak düz basar). derece: + ayak geriye.
   */
  private bacak(derece: number) {
    const e = Math.tan((derece * Math.PI) / 180);
    return `matrix(1 0 ${(-e).toFixed(4)} 1 ${(e * DIKIS_Y).toFixed(2)} 0)`;
  }

  private ciz() {
    if (!this.yuklu) return;
    const g = this.g;
    const t = this.t;
    const w = this.guc;
    const a = TAM * this.faz;
    const s = sin(a);
    const adim = (gecikme: number) => sin(2 * a - gecikme);
    const nefes = sin(t * 2.1);

    // gövde: adım ritminde iner-kalkar (bacaklar açıkken aşağıda, geçişte yukarıda), hafifçe öne eğilir;
    // basışta hafif basılma, yükselişte uzama
    const [ax, ay] = this.p.govde ?? [1100, 1880];
    const inis = s * s; // 0 geçiş, 1 bacaklar en açık
    const bob = w * (-20 * (1 - inis) + 4) + (1 - w) * 0;
    const egim = w * 3.2;
    const sy = 1 + w * (0.022 * (1 - inis) - 0.018 * inis) + (1 - w) * nefes * 0.008;
    const sx = 1 - w * (0.012 * (1 - inis) - 0.012 * inis);
    g.beden?.setAttribute(
      'transform',
      `translate(0 ${bob.toFixed(1)}) rotate(${egim.toFixed(2)} ${ax} ${ay}) translate(${ax} ${ay}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(${-ax} ${-ay})`,
    );

    // bacaklar karşılıklı, kollar ters (yakın kol yakın bacağın tersine)
    g['bacak-on']?.setAttribute('transform', this.bacak(w * BACAK * s));
    g['bacak-arka']?.setAttribute('transform', this.bacak(-w * BACAK * s));
    g['kol-on']?.setAttribute('transform', this.don('kol-on', -w * KOL_ON * s + (1 - w) * nefes * 1.2));
    g['kol-arka']?.setAttribute('transform', this.don('kol-arka', w * KOL_ARKA * s + (1 - w) * nefes * 1.2));

    // kafa: adımı biraz geriden izler; dururken hafif bakınma
    const kafa = w * 1.8 * adim(0.9) + (1 - w) * sin(t * 0.9) * 1.6;
    const kafaT = this.don('kafa', kafa, `translate(0 ${(w * 5 * adim(0.7)).toFixed(1)}) `);
    g.kafa?.setAttribute('transform', kafaT);
    // kafaya bağlılar: önce kafanın dönüşü, sonra kendi dönüşü
    const kulak = w * 5 * adim(1.7) + sin(t * 1.7) * 1.4;
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
    const acik = this.konusuyor ? 1 + Math.abs(sin(t * 15)) * 0.7 : 1;
    g.agiz?.setAttribute('transform', `${kafaT} translate(${mx} ${my - 20}) scale(1 ${acik.toFixed(3)}) translate(${-mx} ${-(my - 20)})`);

    // kuyruk: yürürken kalkık, adımla dalgalanır (geriden gelir); dururken yavaş sallanır
    g.kuyruk?.setAttribute('transform', this.don('kuyruk', w * (5 + 7 * adim(1.3)) + sin(t * 2.3) * 4 * (1 - w * 0.5)));
    // fular: rüzgârda hafif dalga
    g.fular?.setAttribute('transform', this.don('fular', w * 2.5 * adim(1.5) + (1 - w) * nefes * 0.6));
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

  konus(acik: boolean) {
    this.mino.agizOyna(acik);
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

