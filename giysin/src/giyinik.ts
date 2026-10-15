/**
 * Giyinik Kino: ortak Kino iskeleti (src/karakter/karakter.ts) + üstüne giysi katmanları.
 * Giysiler iskeletin SVG'sine <image> olarak girer (aynı 2048 tuval); her karede bağlı olduğu parçanın dönüşünü
 * alır (bere, şapka, gözlük → kafa; eldiven, tutulan eşyalar → kollar; gerisi gövde). Kollar bu oyunda dönmez
 * (mont kolları gövdeyle). Açık şemsiye Kino'nun arkasında çizilir (sap başın arkasından geçer, kanca önde).
 * Yalnız transform / opacity.
 */
import { Karakter } from '../../src/karakter/karakter';
import { h } from '../../src/ui/dom';
import { ACIK_SEMSIYE, ARKA_PARCA, GIYSILER, giysi, KAPALI_SEMSIYE, PARCA_YERI, parcaDosyasi, type GiysiId } from './model';
import { resim } from './resimler';

const NS = 'http://www.w3.org/2000/svg';
const KOL_SAG = ['eldiven-sag', 'sepet', 'sepet-pati', 'kova', 'kova-pati', 'semsiye-acik', 'semsiye-kapali', 'semsiye-kanca', 'semsiye-pati'];
const BAGLI: Record<string, string> = { bere: 'kafa', sapka: 'kafa', gozluk: 'kafa', 'eldiven-sol': 'kol-sol', ...Object.fromEntries(KOL_SAG.map((p) => [p, 'kol-sag'])) };

export class GiyinikKino {
  readonly k: Karakter;
  readonly el: HTMLElement;
  private katman = new Map<string, SVGGElement>();
  private ic = new Map<string, SVGGElement>();
  private raf = 0;
  private kok: SVGGElement | null = null;
  private arka: SVGGElement | null = null;
  private giyili = new Set<GiysiId>();
  private semsiye = false;
  /** geçici sıra (sıra şakası: atkı montun içinde kaybolur) */
  private ozelSira: GiysiId[] | null = null;
  /** ek ağırlık: yalnız bu oyunun hareketleri (titreme, sarılma) için */
  titreme = 0;
  kuyrukPervane = 0;
  /** ıslak: kulaklar sarkar, kuyruk iner (0-1) */
  islak = 0;
  /** silkinme: ıslak köpek gibi baştan kuyruğa sallanır (0-1) */
  silkin = 0;
  /**
   * Bakış: gözler o yana (iskeletin goz-bak-sol / goz-bak-sag katmanı; katman değişimi, parça dönmez). Sürüklenen
   * giysi yaklaşınca ona bakar. Bir ifade açıkken ifadenin gözü kalır. null: karşıya bakar.
   */
  bakYan: 'sol' | 'sag' | null = null;
  /**
   * Takip: sürüklenen giysinin ekrandaki yeri (null: takip yok). Varken Kino heyecanlanır: kaşlar kalkar (şaşkın göz
   * setinin kopyası), ağız açık sevinç (agiz-heyecan), göz bebekleri giysiye kayar (yalnız öteleme; parça dönmez).
   * bakYan'dan önce gelir. Bir ifade açıkken ifadenin yüzü kalır.
   */
  takip: { x: number; y: number } | null = null;
  /** takip gözünün katmanı ve iki gözün bebek grubu (bebek + parıltılar) */
  private takipG: SVGGElement | null = null;
  private bebekler: SVGGElement[] = [];
  /** göz bebeğinin şu anki kayması (tuval birimi); hedefe yumuşak yaklaşır */
  private bebek: [number, number] = [0, 0];

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
      if (this.islak) {
        p.kulakSol -= 10 * this.islak;
        p.kulakSag -= 10 * this.islak;
        p.kafaY += 1.5 * this.islak;
        p.kuyruk -= 25 * this.islak;
      }
      if (this.silkin) {
        p.kafa += Math.sin(t * 48) * 9 * this.silkin;
        p.kulakSol += Math.sin(t * 48 + 0.6) * 28 * this.silkin;
        p.kulakSag += Math.sin(t * 48 + 0.6) * 28 * this.silkin;
        p.x += Math.sin(t * 48 + 1.2) * 1.2 * this.silkin;
        p.kuyruk += Math.sin(t * 40) * 40 * this.silkin;
      }
      if (this.kuyrukPervane) p.kuyruk = (t * 900 * this.kuyrukPervane) % 360;
      this.bakisUygula();
    };
    void this.k.hazir.then(() => this.kur());
  }

  private bakisSon: 'sol' | 'sag' | null = null;
  private takipSon = false;
  private bakisUygula() {
    const k = this.k;
    const takip = !k.ifadeSu && !!this.takip && !!this.takipG;
    if (takip !== this.takipSon) {
      this.takipSon = takip;
      this.takipG!.style.opacity = takip ? '1' : '0';
      k.ek('agiz-heyecan', takip);
      k.gizle('agiz', takip);
      k.gizle('dil', takip);
      if (!takip) this.bebek = [0, 0];
      this.bakisSon = null;
      k.ek('goz-bak-sol', false);
      k.ek('goz-bak-sag', false);
      k.gizle('goz-sol', takip);
      k.gizle('goz-sag', takip);
    }
    if (takip) {
      this.takipCiz();
      return;
    }
    const yan = !k.ifadeSu && this.bakYan && k.parcaG(`goz-bak-${this.bakYan}`) ? this.bakYan : null;
    if (yan === this.bakisSon) return;
    this.bakisSon = yan;
    k.ek('goz-bak-sol', yan === 'sol');
    k.ek('goz-bak-sag', yan === 'sag');
    k.gizle('goz-sol', !!yan);
    k.gizle('goz-sag', !!yan);
  }

  /** Takip gözü kafayla birlikte durur; göz bebekleri giysiye doğru kayar (en çok beyazın kenarına kadar) */
  private takipCiz() {
    const g = this.takipG!;
    const t = this.k.parcaG('goz-saskin')?.style.transform ?? '';
    if (g.style.transform !== t) g.style.transform = t;
    const r = this.k.el.querySelector('svg')?.getBoundingClientRect();
    let hx = 0;
    let hy = 0;
    if (r?.width && this.takip) {
      // iki gözün ortası tuvalde ~ (965, 758) / 2048
      const dx = this.takip.x - (r.left + (965 / 2048) * r.width);
      const dy = this.takip.y - (r.top + (758 / 2048) * r.height);
      const d = Math.hypot(dx, dy) || 1;
      // yakında da belirgin: Kino'nun çeyrek eninden uzakta tam kayma
      const g2 = Math.min(1, d / (r.width * 0.25));
      hx = (dx / d) * g2 * 46;
      hy = (dy / d) * g2 * 40;
    }
    const [bx, by] = this.bebek;
    this.bebek = [bx + (hx - bx) * 0.35, by + (hy - by) * 0.35];
    const tr = `translate(${this.bebek[0].toFixed(1)}px, ${this.bebek[1].toFixed(1)}px)`;
    for (const b of this.bebekler) b.style.transform = tr;
  }

  /** goz-saskin'in kopyası (kalkık kaşlı iri gözler); her gözün bebeği ve parıltıları bir grupta, kaydırılabilir */
  private takipKur() {
    const kaynak = this.k.parcaG('goz-saskin');
    if (!kaynak) return;
    const g = kaynak.cloneNode(true) as SVGGElement;
    g.dataset.parca = 'goz-takip';
    g.style.opacity = '0';
    const el = [...g.querySelectorAll('ellipse')];
    // sıra: [beyaz, bebek, parıltı, parıltı] × 2 göz
    for (let i = 0; i + 3 < el.length && i < 8; i += 4) {
      const grup = document.createElementNS(NS, 'g') as SVGGElement;
      el[i].after(grup);
      grup.append(el[i + 1], el[i + 2], el[i + 3]);
      this.bebekler.push(grup);
    }
    kaynak.after(g);
    this.takipG = g;
  }

  private gorunur(p: string, id: GiysiId) {
    if (!this.giyili.has(id)) return false;
    if (ACIK_SEMSIYE.has(p)) return this.semsiye;
    if (KAPALI_SEMSIYE.has(p)) return !this.semsiye;
    return true;
  }

  private kur() {
    const svg = this.k.el.querySelector('svg');
    if (!svg) return;
    this.kok = document.createElementNS(NS, 'g') as SVGGElement;
    this.kok.setAttribute('class', 'gy-giysiler');
    this.arka = document.createElementNS(NS, 'g') as SVGGElement;
    this.arka.setAttribute('class', 'gy-giysiler-arka');
    for (const g of GIYSILER)
      for (const p of g.parcalar) {
        const yer = PARCA_YERI[p];
        if (!yer) continue;
        const [x, y, w, hh] = yer;
        const dis = document.createElementNS(NS, 'g') as SVGGElement;
        const ic = document.createElementNS(NS, 'g') as SVGGElement;
        ic.setAttribute('class', 'gy-giysi-ic');
        ic.style.transformOrigin = `${x + w / 2}px ${y + hh / 2}px`;
        const im = document.createElementNS(NS, 'image');
        im.setAttribute('href', resim(`giysi/${parcaDosyasi(p)}`));
        im.setAttribute('x', String(x));
        im.setAttribute('y', String(y));
        im.setAttribute('width', String(w));
        im.setAttribute('height', String(hh));
        ic.append(im);
        dis.append(ic);
        dis.style.opacity = '0';
        dis.dataset.giysi = g.id;
        dis.dataset.parca = p;
        this.katman.set(p, dis);
        this.ic.set(p, ic);
        (ARKA_PARCA.has(p) ? this.arka : this.kok).append(dis);
      }
    svg.insertBefore(this.arka, svg.firstChild);
    svg.append(this.kok);
    this.sirala();
    this.ekleriKur();
    this.takipKur();
    // iskelet yüklenmeden giydirilenler (dış sahne, test kısayolu) şimdi görünür
    this.goster();
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

  private goster() {
    for (const g of GIYSILER) for (const p of g.parcalar) {
      const k = this.katman.get(p);
      if (k) k.style.opacity = this.gorunur(p, g.id) ? '1' : '0';
    }
  }

  private sirala() {
    if (!this.kok) return;
    const sira = this.ozelSira ?? GIYSILER.map((g) => g.id).sort((a, b) => giysi(a).z - giysi(b).z);
    for (const id of sira) for (const p of giysi(id).parcalar) {
      const g = this.katman.get(p);
      if (g && !ARKA_PARCA.has(p)) this.kok.append(g);
    }
  }

  private pit(p: string) {
    this.ic.get(p)?.animate(
      [
        { transform: 'scale(1.22, 0.86)', opacity: 0.4 },
        { transform: 'scale(0.92, 1.1)', opacity: 1, offset: 0.45 },
        { transform: 'scale(1.03, 0.97)', offset: 0.75 },
        { transform: 'scale(1)' },
      ],
      { duration: 320, easing: 'cubic-bezier(.3,.7,.4,1)' },
    );
  }

  /** Giysi görünür / gizli; pit: oturma esnemesi (0,3 sn) */
  giy(id: GiysiId, acik: boolean, pit = false) {
    if (acik) this.giyili.add(id);
    else this.giyili.delete(id);
    if (id === 'semsiye' && !acik) this.semsiye = false;
    this.goster();
    if (acik && pit) for (const p of giysi(id).parcalar) if (this.gorunur(p, id)) this.pit(p);
  }

  private ekler: { ad: string; dosya: string; yer: [number, number, number, number]; onceki: string; bagli: string; g?: SVGGElement }[] = [];

  /**
   * Giysi olmayan ek çizim (sepetteki çiçek demeti): `onceki` parçanın hemen arkasına; başta gizli.
   * İskelet yüklenmeden çağrılabilir.
   */
  ekParca(ad: string, dosya: string, yer: [number, number, number, number], onceki: string, bagli = 'kol-sag') {
    this.ekler.push({ ad, dosya, yer, onceki, bagli });
    if (this.kok) this.ekleriKur();
  }

  private ekleriKur() {
    for (const e of this.ekler) {
      if (e.g || !this.kok) continue;
      const [x, y, w, hh] = e.yer;
      const dis = document.createElementNS(NS, 'g') as SVGGElement;
      const ic = document.createElementNS(NS, 'g') as SVGGElement;
      ic.style.transformOrigin = `${x + w / 2}px ${y + hh}px`;
      const im = document.createElementNS(NS, 'image');
      im.setAttribute('href', resim(e.dosya));
      for (const [k, v] of [['x', x], ['y', y], ['width', w], ['height', hh]] as const) im.setAttribute(k, String(v));
      ic.append(im);
      dis.append(ic);
      dis.style.opacity = '0';
      dis.dataset.ek = e.ad;
      e.g = dis;
      this.katman.set(e.ad, dis);
      this.ic.set(e.ad, ic);
      BAGLI[e.ad] = e.bagli;
      const sonra = this.katman.get(e.onceki);
      if (sonra?.parentNode) sonra.parentNode.insertBefore(dis, sonra);
      else this.kok.append(dis);
    }
  }

  /** Ek çizimi göster / gizle; pit: yaylanarak belirir */
  ekGoster(ad: string, acik: boolean, olcek = 1) {
    const g = this.katman.get(ad);
    const ic = this.ic.get(ad);
    if (!g || !ic) return;
    g.style.opacity = acik ? '1' : '0';
    if (acik) ic.animate([{ transform: `scale(${olcek * 0.6})` }, { transform: `scale(${olcek * 1.12})`, offset: 0.6 }, { transform: `scale(${olcek})` }], { duration: 380, easing: 'cubic-bezier(.3,.7,.4,1)', fill: 'forwards' });
  }

  /** Şemsiye "pof!" diye açılır (kubbe kancanın üstünden yaylanarak büyür) */
  semsiyeAc(acik = true, anim = true) {
    this.semsiye = acik;
    this.goster();
    if (!acik || !anim) return;
    const ic = this.ic.get('semsiye-acik');
    const [x, y, w, hh] = PARCA_YERI['semsiye-acik'];
    if (!ic) return;
    ic.style.transformOrigin = `${x + w * 0.6}px ${y + hh * 0.85}px`;
    ic.animate(
      [
        { transform: 'scale(0.15, 0.5)', opacity: 0.2 },
        { transform: 'scale(1.12, 0.9)', opacity: 1, offset: 0.45 },
        { transform: 'scale(0.96, 1.05)', offset: 0.72 },
        { transform: 'scale(1)' },
      ],
      { duration: 520, easing: 'cubic-bezier(.3,.7,.4,1)' },
    );
    void y;
  }

  get semsiyeAcik() {
    return this.semsiye;
  }

  /** Bir parçaya (ör. botun üstüne çekilen çorap) geçici dönüşüm; null kaldırır */
  parcaDonusum(p: string, tr: string | null, ms = 260) {
    const ic = this.ic.get(p);
    if (!ic) return;
    const hedef = tr ?? 'none';
    ic.animate([{ transform: getComputedStyle(ic).transform === 'none' ? 'none' : getComputedStyle(ic).transform }, { transform: hedef }], { duration: ms, easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'forwards' });
  }

  /** Bir parçanın iç katmanında kısa animasyon (şapka uçar, gözlük kayar …) */
  parcaOynat(p: string, kare: Keyframe[], sec: KeyframeAnimationOptions): Promise<void> {
    const ic = this.ic.get(p);
    if (!ic) return Promise.resolve();
    return ic.animate(kare, sec).finished.then(
      () => undefined,
      () => undefined,
    );
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
