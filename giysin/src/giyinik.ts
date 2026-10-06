/**
 * Giyinik Kino: ortak Kino iskeleti (src/karakter/karakter.ts) + üstüne giysi katmanları.
 * Giysiler iskeletin SVG'sine <image> olarak girer (aynı 2048 tuval); her karede bağlı olduğu parçanın dönüşünü
 * alır (bere, gözlük → kafa; eldiven → kollar; gerisi gövde). Kollar bu oyunda dönmez (mont kolları gövdeyle).
 * Yalnız transform / opacity.
 */
import { Karakter } from '../../src/karakter/karakter';
import { h } from '../../src/ui/dom';
import { GIYSILER, giysi, PARCA_YERI, type GiysiId } from './model';
import { resim } from './resimler';

const NS = 'http://www.w3.org/2000/svg';
const BAGLI: Record<string, string> = { bere: 'kafa', gozluk: 'kafa', 'eldiven-sol': 'kol-sol', 'eldiven-sag': 'kol-sag' };

export class GiyinikKino {
  readonly k: Karakter;
  readonly el: HTMLElement;
  private katman = new Map<string, SVGGElement>();
  private ic = new Map<string, SVGGElement>();
  private raf = 0;
  private kok: SVGGElement | null = null;
  private giyili = new Set<GiysiId>();
  /** geçici sıra (sıra şakası: atkı montun içinde kaybolur) */
  private ozelSira: GiysiId[] | null = null;
  /** ek ağırlık: yalnız bu oyunun hareketleri (titreme, sarılma) için */
  titreme = 0;
  kuyrukPervane = 0;

  constructor() {
    this.k = new Karakter('kino', h('img', { src: resim('kino-yedek'), alt: '', draggable: 'false' }));
    this.el = h('div.gy-kino', {}, this.k.el);
    this.k.ekHareket = (p, t) => {
      p.kolSol = 0;
      p.kolSag = 0;
      if (this.titreme) {
        p.x += Math.sin(t * 70) * 0.5 * this.titreme;
        p.kafa += Math.sin(t * 55) * 2.2 * this.titreme;
        p.kulakSol += Math.sin(t * 40) * 6 * this.titreme;
        p.kulakSag += Math.sin(t * 43) * 6 * this.titreme;
      }
      if (this.kuyrukPervane) p.kuyruk = (t * 900 * this.kuyrukPervane) % 360;
    };
    void this.k.hazir.then(() => this.kur());
  }

  private kur() {
    const svg = this.k.el.querySelector('svg');
    if (!svg) return;
    this.kok = document.createElementNS(NS, 'g') as SVGGElement;
    this.kok.setAttribute('class', 'gy-giysiler');
    for (const g of GIYSILER)
      for (const p of g.parcalar) {
        const [x, y, w, hh] = PARCA_YERI[p];
        const dis = document.createElementNS(NS, 'g') as SVGGElement;
        const ic = document.createElementNS(NS, 'g') as SVGGElement;
        ic.setAttribute('class', 'gy-giysi-ic');
        ic.style.transformOrigin = `${x + w / 2}px ${y + hh / 2}px`;
        const im = document.createElementNS(NS, 'image');
        im.setAttribute('href', resim(`giysi/${p}`));
        im.setAttribute('x', String(x));
        im.setAttribute('y', String(y));
        im.setAttribute('width', String(w));
        im.setAttribute('height', String(hh));
        ic.append(im);
        dis.append(ic);
        dis.style.opacity = '0';
        dis.dataset.giysi = g.id;
        this.katman.set(p, dis);
        this.ic.set(p, ic);
        this.kok.append(dis);
      }
    svg.append(this.kok);
    this.sirala();
    const kare = () => {
      this.raf = requestAnimationFrame(kare);
      for (const [p, g] of this.katman) {
        if (g.style.opacity === '0') continue;
        const kaynak = this.k.parcaG(BAGLI[p] ?? 'govde');
        const t = kaynak?.style.transform ?? '';
        if (g.style.transform !== t) g.style.transform = t;
      }
    };
    kare();
  }

  private sirala() {
    if (!this.kok) return;
    const sira = this.ozelSira ?? GIYSILER.map((g) => g.id).sort((a, b) => giysi(a).z - giysi(b).z);
    for (const id of sira) for (const p of giysi(id).parcalar) {
      const g = this.katman.get(p);
      if (g) this.kok.append(g);
    }
  }

  /** Giysi görünür / gizli; pit: oturma esnemesi (0,3 sn) */
  giy(id: GiysiId, acik: boolean, pit = false) {
    if (acik) this.giyili.add(id);
    else this.giyili.delete(id);
    for (const p of giysi(id).parcalar) {
      const g = this.katman.get(p);
      if (!g) continue;
      g.style.opacity = acik ? '1' : '0';
      if (acik && pit) this.ic.get(p)?.animate(
        [
          { transform: 'scale(1.22, 0.86)', opacity: 0.4 },
          { transform: 'scale(0.92, 1.1)', opacity: 1, offset: 0.45 },
          { transform: 'scale(1.03, 0.97)', offset: 0.75 },
          { transform: 'scale(1)' },
        ],
        { duration: 320, easing: 'cubic-bezier(.3,.7,.4,1)' },
      );
    }
  }

  /** Bir parçaya (ör. botun üstüne çekilen çorap) geçici dönüşüm; null kaldırır */
  parcaDonusum(p: string, tr: string | null, ms = 260) {
    const ic = this.ic.get(p);
    if (!ic) return;
    const hedef = tr ?? 'none';
    ic.animate([{ transform: getComputedStyle(ic).transform === 'none' ? 'none' : getComputedStyle(ic).transform }, { transform: hedef }], { duration: ms, easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'forwards' });
  }

  /** Geçici katman sırası (null: normal) */
  sira(ids: GiysiId[] | null) {
    this.ozelSira = ids;
    this.sirala();
  }

  /** Parçayı (görünür hâlde) düşürür: ağırlıkla aşağı kayar, söner */
  dusur(id: GiysiId, ms = 520): Promise<void> {
    const anim = giysi(id).parcalar.map((p) =>
      this.ic.get(p)?.animate(
        [{ transform: 'none', opacity: 1 }, { transform: 'translate(0px, -40px) rotate(-6deg)', opacity: 1, offset: 0.25 }, { transform: 'translate(30px, 260px) rotate(14deg)', opacity: 0 }],
        { duration: ms, easing: 'cubic-bezier(.5,0,.8,.6)' },
      ),
    );
    return Promise.all(anim.map((a) => a?.finished.catch(() => undefined))).then(() => {
      this.giy(id, false);
    });
  }

  get giyilenler(): ReadonlySet<GiysiId> {
    return this.giyili;
  }

  kapat() {
    cancelAnimationFrame(this.raf);
    this.k.kapat();
  }
}
