/**
 * Yandan yürüyen karakter (ortak): Adobe'nin yan görünüş iskeleti (assets/karakter-iskelet/<ad>-profil.svg + .json)
 * varsa karakter yandan, Mino'nun yürüyüşüyle aynı döngüyle yürür (src/mino/yuruyus.ts: temas → çöküş → geçiş →
 * yükseliş; bacaklar kalçadan ±24 döner, kollar ters, gövde iner-kalkar, kafa / kulak / kuyruk geriden gelir).
 * İskelet yoksa yandanVar(ad) false döner; çağıran bugünkü gibi önden yürütür (hiçbir şey bozulmaz).
 *
 * Katmanlar (standart; ekip/film/FILM-REHBERI.md §5): kuyruk, kulak-arka, bacak-arka, kol-arka, bacak-on, govde,
 * kol-on, kafa, kulak-on, goz, agiz (+ gizli goz-kapali). Çizim sağa bakar; sola yürürken aynalanır (yon = -1).
 * Bacakların yere değen geometrisi (pati zarfı) çizimden tarayıcıda bir kez ölçülür (patiKoseleri): yeni bir
 * iskelet (tavşan, ördek …) dosyası gelince kod değişmeden yürür; basan pati yerde kaymaz.
 *
 * İlerleme: yol (çizim birimi) yürüyüşle birlikte her karede artar; çağıran karakteri yol kadar ilerletirse
 * (onKare) adım uzunluğu ile ilerleme hızı eşleşir, ayaklar kaymaz.
 */
import { h, TEST_MODU } from '../ui/dom';
import { PATI_OLCUM, patiKoseleri, yuruyusGeometrisi, yuruyusPozu, type BacakAdi, type YuruyusGeometri } from '../mino/yuruyus';
import { iskeletBilgisi, iskeletVar, svgGetir, type IskeletBilgi } from './karakter';
import { YANDAN_OLCULER } from './yandan-olcu';

export const profilAdi = (ad: string) => `${ad}-profil`;
/** Bu karakterin yan görünüş iskeleti var mı */
export const yandanVar = (ad: string) => iskeletVar(profilAdi(ad));

/** Yürürken döngünün girdiği yer: geçiş evresine yakın (bacaklar kapalı, ilk adım doğal açılır) */
const BASLANGIC_FAZ = 0.2;

interface Yuklu {
  svg: string;
  bilgi: IskeletBilgi;
  geo: YuruyusGeometri;
}

const onbellek = new Map<string, Promise<Yuklu | null>>();

/** Bir katmanın resmindeki opak piksellerin satır uçları (çizim biriminde) */
async function opakNoktalar(g: Element | null): Promise<[number, number][]> {
  const im = g?.querySelector('image');
  if (!im) return [];
  const href = im.getAttribute('href') ?? im.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
  if (!href) return [];
  const [x, y, w, hh] = ['x', 'y', 'width', 'height'].map((a) => Number(im.getAttribute(a) ?? 0));
  const resim = new Image();
  resim.src = href;
  await resim.decode();
  const cw = resim.naturalWidth;
  const ch = resim.naturalHeight;
  if (!cw || !ch) return [];
  const tuval = document.createElement('canvas');
  tuval.width = cw;
  tuval.height = ch;
  const c = tuval.getContext('2d', { willReadFrequently: true });
  if (!c) return [];
  c.drawImage(resim, 0, 0);
  const veri = c.getImageData(0, 0, cw, ch).data;
  const kx = w / cw;
  const ky = hh / ch;
  const nokta: [number, number][] = [];
  for (let j = 0; j < ch; j++) {
    let sol = -1;
    let sag = -1;
    for (let i = 0; i < cw; i++) {
      if (veri[(j * cw + i) * 4 + 3] >= PATI_OLCUM.ESIK) {
        if (sol < 0) sol = i;
        sag = i;
      }
    }
    if (sol < 0) continue;
    for (const [i, dj] of [[sol, 0], [sol, 1], [sag + 1, 0], [sag + 1, 1]]) nokta.push([x + i * kx, y + (j + dj) * ky]);
  }
  return nokta;
}

/** Yan görünüşü indirir ve bacaklarını ölçer (karakter başına bir kez); yoksa / olmazsa null */
export function yandanYukle(ad: string): Promise<Yuklu | null> {
  let p = onbellek.get(ad);
  if (!p) {
    p = (async () => {
      const bilgi = iskeletBilgisi(profilAdi(ad));
      if (!bilgi || !yandanVar(ad)) return null;
      const d = bilgi.donme;
      if (!d['bacak-on'] || !d['bacak-arka'] || !d.govde) return null;
      const svg = await svgGetir(profilAdi(ad));
      if (!svg) return null;
      const belge = new DOMParser().parseFromString(svg, 'image/svg+xml');
      const pati = {} as Record<BacakAdi, [number, number][]>;
      for (const b of ['bacak-on', 'bacak-arka'] as const) {
        const noktalar = await opakNoktalar(belge.getElementById(b));
        if (!noktalar.length) return null;
        const alt = Math.max(...noktalar.map((n) => n[1]));
        const kose = patiKoseleri(noktalar, d[b][1], PATI_OLCUM.ALT_PAY * (alt - d[b][1]));
        if (kose.length < 2) return null;
        pati[b] = kose;
      }
      const zemin = Math.max(pati['bacak-on'][0][1], pati['bacak-arka'][0][1]);
      const geo = yuruyusGeometrisi({ donme: { 'bacak-on': d['bacak-on'], 'bacak-arka': d['bacak-arka'], govde: d.govde }, zemin, pati, olcu: YANDAN_OLCULER[ad] });
      return { svg, bilgi, geo };
    })().catch(() => null);
    onbellek.set(ad, p);
  }
  return p;
}

export class YandanKarakter {
  readonly el: HTMLElement;
  readonly ad: string;
  /** yan görünüş kuruldu mu (iskelet yoksa ya da yüklenemezse false) */
  readonly hazir: Promise<boolean>;
  /** geometri (kurulunca) */
  geo: YuruyusGeometri | null = null;
  /** true: döngü ilerlemez */
  duraklat = false;
  /** görünmüyorken ve dururken kare hesaplanmaz */
  gorunur = true;
  /** her karede, poz çizildikten sonra: toplam yol (çizim birimi) */
  onKare: ((yol: number) => void) | null = null;
  private g = new Map<string, SVGGElement>();
  private beden: SVGGElement | null = null;
  private kafaEkleri: SVGGElement[] = [];
  private dn: Record<string, [number, number]> = {};
  private raf = 0;
  private son = performance.now();
  private t = 0;
  private faz = 0;
  private guc = 0;
  private hedefGuc = 0;
  private hiz = 1.6;
  private _yol = 0;
  private sonrakiKirp = 1.2 + Math.random() * 2;
  private kirpBas = -1;
  private konusuyor = false;

  constructor(ad: string) {
    this.ad = ad;
    this.el = h('div.yk-yandan', { 'aria-hidden': 'true', 'data-yandan': ad });
    this.hazir = yandanYukle(ad).then((y) => {
      if (!y || this.raf === 0) return false;
      this.kur(y);
      return true;
    });
    this.kare = this.kare.bind(this);
    this.raf = requestAnimationFrame(this.kare);  }

  private kur(y: Yuklu) {
    const kap = h('div.yk-cizim', { html: y.svg.replace(/<\?xml[^>]*>/, '') });
    const svg = kap.querySelector('svg');
    if (!svg) return;
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.setAttribute('aria-hidden', 'true');
    // bütün katmanlar bir beden grubunda (iniş-kalkış, eğim, basılma); kimlikler sayfada çakışmasın
    const beden = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    for (const g of [...svg.querySelectorAll<SVGGElement>(':scope > g[id]')]) {
      const id = g.id;
      g.removeAttribute('id');
      g.dataset.parca = id;
      if (y.bilgi.gizli.includes(id)) {
        g.removeAttribute('display');
        g.style.display = 'none';
      }
      this.g.set(id, g);
    }
    // katman sırası JSON'daki "sira"dan (arkadan öne)
    for (const id of y.bilgi.sira) {
      const g = this.g.get(id);
      if (g) beden.appendChild(g);
    }
    svg.appendChild(beden);
    this.beden = beden;
    for (const [id, el] of this.g) if (!ZINCIR.has(id) && y.bilgi.bagli[id] === 'kafa') this.kafaEkleri.push(el);
    this.dn = y.bilgi.donme;
    this.geo = y.geo;
    this.el.replaceChildren(kap);
    this.ciz();
  }

  /** Yürümeye başla (ya da hızını değiştir); adimHizi: döngü / sn (bir döngü = iki adım) */
  yuru(adimHizi = 1.6) {
    this.hiz = adimHizi;
    if (this.hedefGuc === 0 && this.guc < 0.05) this.faz = BASLANGIC_FAZ;
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

  /** Şimdiye kadar alınan yol (çizim birimi) */
  get yol() {
    return this._yol;
  }

  /** Durma sırasında (dur() anından tam duruşa) alınacak yaklaşık yol (çizim birimi) */
  frenYolu() {
    if (TEST_MODU || !this.geo) return 0;
    return this.hiz * this.geo.donguYolu * 0.051;
  }

  /** Yön: 1 sağa, -1 sola (çizim sağa bakar) */
  set yon(y: 1 | -1) {
    this.el.style.setProperty('--yk-yon', String(y));
  }

  /** Yürüyüşü bir anda dondurur (görseller ve testler için): faz 0..1, guc 0..1 */
  evre(faz: number, guc = 1) {
    this.duraklat = true;
    this.faz = ((faz % 1) + 1) % 1;
    this.guc = this.hedefGuc = guc;
    this.t = 0;
    this.sonrakiKirp = Infinity;
    this.ciz();
  }

  konus(acik: boolean) {
    this.konusuyor = acik;
  }

  /** İskelet katmanının grubu (film: parçaya eşya takmak için, ör. Kino'nun ağzındaki elma); kurulmadıysa null */
  parcaG(ad: string): SVGGElement | null {
    return this.g.get(ad) ?? null;
  }

  kapat() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.onKare = null;
  }

  private kare(simdi: number) {
    this.raf = requestAnimationFrame(this.kare);
    const dt = Math.min(0.1, Math.max(0, (simdi - this.son) / 1000));
    this.son = simdi;
    if (this.duraklat) return;
    this.t += dt;
    // güç: başlarken ~0.15 sn, dururken ~0.2 sn (Mino'nunkiyle aynı)
    const k = TEST_MODU ? 1 : Math.min(1, dt * (this.hedefGuc > this.guc ? 14 : 11));
    this.guc += (this.hedefGuc - this.guc) * k;
    if (this.hedefGuc === 0 && this.guc < 0.01) this.guc = 0;
    if (this.guc > 0 && this.geo) {
      const df = dt * this.hiz * Math.max(0.35, this.guc);
      this.faz = (this.faz + df) % 1;
      // adım uzunluğu yürüyüş gücüyle orantılı: ilerleme onunla aynı (pati kaymaz)
      this._yol += df * this.geo.donguYolu * this.guc;
    }
    if (!this.gorunur && this.guc === 0) return;
    this.ciz();
    this.onKare?.(this._yol);
  }

  private don(ad: string, derece: number, ek = '') {
    const [x, y] = this.dn[ad] ?? [1024, 1024];
    return `${ek}rotate(${derece.toFixed(2)} ${x} ${y})`;
  }

  private ciz() {
    const geo = this.geo;
    if (!geo || !this.beden) return;
    const g = this.g;
    const t = this.t;
    const z = yuruyusPozu(this.faz, this.guc, t, geo);
    const set = (id: string, tr: string) => g.get(id)?.setAttribute('transform', tr);

    const [ax, ay] = geo.donme.govde;
    this.beden.setAttribute(
      'transform',
      `translate(0 ${z.bob.toFixed(1)}) rotate(${z.egim.toFixed(2)} ${ax} ${ay}) translate(${ax} ${ay}) scale(${z.sx.toFixed(4)} ${z.sy.toFixed(4)}) translate(${-ax} ${-ay})`,
    );
    set('bacak-on', this.don('bacak-on', z.bacakOn, `translate(0 ${z.bacakOnY.toFixed(1)}) `));
    set('bacak-arka', this.don('bacak-arka', z.bacakArka, `translate(0 ${z.bacakArkaY.toFixed(1)}) `));
    set('kol-on', this.don('kol-on', z.kolOn));
    set('kol-arka', this.don('kol-arka', z.kolArka));
    // kuşlarda kol yerine kanat: yürürken yalnız hafif kıpırdar (Adobe: kanat-on ±5)
    set('kanat-on', this.don('kanat-on', z.kolOn * 0.25));
    set('kanat-arka', this.don('kanat-arka', z.kolArka * 0.25));
    const kafaT = this.don('kafa', z.kafa, `translate(0 ${z.kafaY.toFixed(1)}) `);
    set('kafa', kafaT);
    set('kulak-on', `${kafaT} ${this.don('kulak-on', -z.kulak)}`);
    set('kulak-arka', `${kafaT} ${this.don('kulak-arka', -z.kulak * 0.8)}`);
    if (t > this.sonrakiKirp) {
      this.kirpBas = t;
      this.sonrakiKirp = t + 2.2 + Math.random() * 3;
    }
    const kapali = this.kirpBas >= 0 && t - this.kirpBas < 0.14 && g.has('goz-kapali');
    set('goz', kafaT);
    set('goz-kapali', kafaT);
    const goz = g.get('goz');
    const gozK = g.get('goz-kapali');
    if (goz) goz.style.display = kapali ? 'none' : '';
    if (gozK) gozK.style.display = kapali ? '' : 'none';
    const [mx, my] = this.dn.agiz ?? [1360, 990];
    const acik = this.konusuyor ? 1 + Math.abs(Math.sin(t * 15)) * 0.7 : 1;
    set('agiz', `${kafaT} translate(${mx} ${my}) scale(1 ${acik.toFixed(3)}) translate(${-mx} ${-my})`);
    set('kuyruk', this.don('kuyruk', z.kuyruk));
    // standart dışı, kafaya bağlı ek katmanlar kafayla gider
    for (const el of this.kafaEkleri) el.setAttribute('transform', kafaT);
  }
}

/** ciz()'in kendisi yerleştirdiği katmanlar */
const ZINCIR = new Set(['bacak-on', 'bacak-arka', 'kol-on', 'kol-arka', 'kanat-on', 'kanat-arka', 'kafa', 'kulak-on', 'kulak-arka', 'goz', 'goz-kapali', 'agiz', 'kuyruk', 'govde']);
