/**
 * Filmde bir oyuncu: Mino (src/mino, katmanlı iskelet; yürürken yandan iskelete döner) ya da ortak karakter bileşeni
 * (src/karakter: köpek, tavşan, ördek… iskelet varsa parça parça, yoksa tek görsel). Motor ikisini aynı arayüzle yönetir.
 *
 * Duruş (durus): sahneye özel, yumuşak geçişli beden dili (kulak düşer, kuyruk durur, baş eğilir, patiyle kuyruk
 * tutulur…). Hedef değerler verilir, oyuncu oraya süreyle (üstel yumuşatma) varır; hazır tepkilerin üstüne eklenir.
 * Taşıma (tasi / al / birak): eşya bir parçaya takılır (ör. Kino'nun kafasındaki elma), parçayla birlikte döner.
 */
import type { KonusBilgi } from '../../src/audio/dudak';
import { Karakter, type HareketAdi, type Poz } from '../../src/karakter/karakter';
import { Mino, minoIfadeleriYukle, type MinoEkPoz, type MinoIfade, type Tepki } from '../../src/mino/mino';
import { MINO_DONGU_YOLU, MINO_KUTU_GENISLIK, minoProfilYukle, YuruyenMino } from '../../src/mino/mino-profil';
import { h, TEST_MODU } from '../../src/ui/dom';

// film açılınca Mino'nun ifade ekleri ve yandan iskeleti önceden yüklensin (ilk kullanımda gecikme olmasın)
void minoIfadeleriYukle();
void minoProfilYukle();

const HAYVAN = import.meta.glob<string>('../../assets/hayvanlar/*.webp', { eager: true, query: '?url', import: 'default' });

/** Mino'nun adım hızı sınırları (döngü / sn; bir döngü iki adım): çok yavaşta sürünür, çok hızlıda koşar gibi olur */
const ADIM_EN_AZ = 1.2;
const ADIM_EN_COK = 2.8;

/**
 * Kino (ekip/kino): iskelet kutusunun altında boş pay (ayaklar 1888'de biter; 2048'lik kutu) ve eklem sınırları
 * (banyo ile aynı: kol omuzdan en çok 20°, kuyruk kökünden -8 … 20°; fazlasında dikiş yeri açılıyor).
 */
const KARAKTER_ALT: Record<string, number> = { kino: 160 / 2048 };
const KOL_EN_COK: Record<string, number> = { kino: 20 };
const KUYRUK_SINIR: Record<string, [number, number]> = { kino: [-8, 20] };
/** önden çizimi asimetrik (göz lekesi): aynalanmaz */
const YON_SABIT = new Set(['kino']);

/**
 * Mino'nun yolda olan ifadeleri (Adobe: kafa-uzgun + goz-uzgun + agiz-uzgun, goz-saskin + agiz-saskin,
 * goz-odak + agiz-dil) ve gelene kadar yerine kullanılan en yakın mevcut ifade (null: yüz normal, beden dili duruşla).
 */
const MINO_YEDEK: Record<string, string | null> = { uzgun: 'kararsiz', saskin: null, odak: null };
const destek = new Map<string, Promise<boolean>>();
/** Mino'nun bu ifadesi hazır mı: ifade eklerinde katmanı (m-<ad>) ve stil kuralı (.ifade-<ad>) var mı */
function minoIfadeDestek(ad: string): Promise<boolean> {
  let p = destek.get(ad);
  if (!p) {
    p = minoIfadeleriYukle().then((svg) => {
      if (!svg?.includes(`m-${ad}`)) return false;
      for (const s of document.styleSheets) {
        try {
          for (const r of s.cssRules) if ((r as CSSStyleRule).selectorText?.includes(`.ifade-${ad}`)) return true;
        } catch {
          /* başka kaynaktan stil */
        }
      }
      return false;
    });
    destek.set(ad, p);
  }
  return p;
}

/**
 * Duruş alanları. Karakter (iskelet): kulak (+ dikilir, - düşer), kafa (eğilme °), kafaY (% boyun, + aşağı),
 * kol / kolSol / kolSag (+ dışa kalkar, - içe), kuyruk (kökten açı °), salla (kendi kuyruk sallamasının çarpanı),
 * pervane (hızlı kuyruk sallama genliği), hop (sevinç hopu), y (beden, + aşağı: eğilme), don (beden eğimi),
 * sx / sy (ezilme), goz (1: kapalı), dil (1: dil dışarıda), adim (sessiz, küçük adımlarla yürüyüş), titre,
 * patiKuyruk (1: kuyruğunu patisiyle tutar; 'pati-kuyruk' eki yoksa kolSag / kuyruk açısıyla).
 * Mino: kafaAci, kafaY, govdeAci, ziplaY (- yükselir), sx, sy, kolSol, kolSag, kuyrukAci, gozKay, gulum (-1 üzgün … 1),
 * agiz (0 kapalı … 1), goz (1: kapalı).
 */
type Durus = Record<string, number>;
const MINO_ALAN = ['kafaAci', 'kafaY', 'govdeAci', 'ziplaY', 'sx', 'sy', 'kolSol', 'kolSag', 'kuyrukAci', 'gozKay', 'gulum', 'agiz', 'goz'] as const;
const KARAKTER_ALAN = ['kulak', 'kulakSol', 'kulakSag', 'kafa', 'kafaY', 'kol', 'kolSol', 'kolSag', 'kuyruk', 'salla', 'pervane', 'hop', 'y', 'don', 'sx', 'sy', 'goz', 'dil', 'adim', 'titre', 'patiKuyruk'] as const;
/** varsayılanlar (duruş "normal"e dönerken) */
const VARSAYILAN: Durus = { salla: 1, sx: 1, sy: 1 };
const deger = (d: Durus, k: string) => d[k] ?? VARSAYILAN[k] ?? 0;

export class Oyuncu {
  readonly el: HTMLElement;
  /** kutunun en/boy oranı */
  readonly oran: number;
  /** kutunun altındaki boş pay (kutu yüksekliğine oranı): ayaklar y'ye basar */
  readonly alt: number;
  /** yürürken aynalanmaz */
  readonly yonSabit: boolean;
  private mino: Mino | null = null;
  private yuruyen: YuruyenMino | null = null;
  private karakter: Karakter | null = null;
  /** üst üste binen yürüyüşlerde yalnız sonuncusu bitince durulur */
  private yuruNo = 0;
  /** duruş: şimdiki değerler, hedefler ve varış süreleri (sn) */
  private simdi: Durus = {};
  private hedef: Durus = {};
  private sure: Durus = {};
  private raf = 0;
  private son = performance.now();
  private durdu = false;
  private konusuyor = false;
  /** sessiz adım (karakterin kendi hoplayan yürüyüşü yerine): bitiş zamanı */
  private adimBitis = 0;
  private t = 0;

  constructor(
    readonly tip: string,
    /** film hızı (test modunda hızlı): duruş süreleri buna göre kısalır */
    private readonly hiz = 1,
  ) {
    this.alt = KARAKTER_ALT[tip] ?? 0;
    this.yonSabit = YON_SABIT.has(tip);
    if (tip === 'mino') {
      this.yuruyen = new YuruyenMino();
      this.mino = this.yuruyen.mino;
      // filmde Mino'nun ağzını yalnız motor açar (konus): başkasının cümlesinde oynamasın
      this.mino.agizSus = true;
      this.el = h('div.fl-oyuncu.fl-mino', {}, this.yuruyen.el);
      this.oran = 1360 / 1790;
    } else {
      const url = HAYVAN[`../../assets/hayvanlar/${tip}.webp`] ?? '';
      this.karakter = new Karakter(tip, h('img', { src: url, alt: '', draggable: 'false' }));
      this.karakter.ekHareket = (p, t) => this.karakterPoz(p, t);
      this.el = h('div.fl-oyuncu', { 'data-tip': tip }, this.karakter.el);
      this.oran = 1;
    }
    this.raf = requestAnimationFrame((t) => this.kare(t));
  }

  /** Tepki / hareket (Mino: zipla, sasir, dans, zorlan, sersem, kararsiz, uzat…; karakter: dans, huy, kokla, bak, hayir, ye…) */
  tepki(ad: string, sure?: number) {
    if (this.mino) this.mino.tepki(ad as Tepki, sure);
    else this.karakter?.oynat(ad as HareketAdi, (sure ?? 1.2) * 1000);
  }

  /**
   * Yürüyüş hareketi (karakterin kendi yürüyüşü); yol motorda. sure: gerçek saniye, mesafe: kendi genişliği
   * cinsinden yatay yol. Mino yana yürüyorsa yandan iskelete döner ve adımlarını yola göre ayarlar.
   * stil 'sessiz': karakter hoplamadan, küçük adımlarla (çekingen) yürür.
   * Dönüş: bu yürüyüşün numarası (bitince yuruBitti'ye verilir) ve karakterin kendi yürüyüşü var mı
   * (yoksa motor sektirir).
   */
  yuru(sure: number, mesafe = 0, stil?: string): { no: number; kendi: boolean } {
    const no = ++this.yuruNo;
    if (this.yuruyen) {
      if (mesafe < 0.2 || sure <= 0) return { no, kendi: false };
      const dongu = (mesafe * MINO_KUTU_GENISLIK) / MINO_DONGU_YOLU;
      const hiz = Math.min(ADIM_EN_COK, Math.max(ADIM_EN_AZ, dongu / sure));
      return { no, kendi: this.yuruyen.yuru(hiz) };
    }
    if (stil === 'sessiz') {
      this.adimBitis = this.t + sure;
      return { no, kendi: true };
    }
    this.karakter?.oynat('yuru', sure * 1000);
    return { no, kendi: true };
  }

  /** Yürüyüş yolu bitti (motor); Mino durur ve önden çizime döner */
  yuruBitti(no: number) {
    if (no === this.yuruNo) this.yuruyen?.dur();
  }

  ifade(ad: string | null, ms = 0) {
    if (this.mino) {
      const m = this.mino;
      const no = ++this.ifadeNo;
      // yolda olan çizimler (üzgün, şaşkın, odak): katmanı ve kuralı gelmişse o, yoksa en yakın mevcut ifade
      if (ad && ad in MINO_YEDEK)
        void minoIfadeDestek(ad).then((d) => no === this.ifadeNo && void m.ifade((d ? ad : MINO_YEDEK[ad]) as MinoIfade | null, ms));
      else void m.ifade(ad as MinoIfade | null, ms);
      return;
    }
    const k = this.karakter;
    if (!k) return;
    const no = ++this.ifadeNo;
    k.ifade(ad, ms);
    // iskelet henüz yüklenmediyse (sahne başı) yüklenince uygula; bu arada yenisi istendiyse vazgeç
    if (ad && !k.ifadeVar(ad)) void k.hazir.then(() => no === this.ifadeNo && k.ifade(ad, ms));
  }
  private ifadeNo = 0;

  /** Karakterin gizli eki (ör. Kino'nun dil-disarida'sı) */
  ek(ad: string, acik: boolean) {
    this.karakter?.ek(ad, acik);
  }

  /** Mino'nun bakışı: -1 sola, 0 karşıya, 1 sağa */
  bak(yon: number) {
    this.mino?.bak(yon);
  }

  /** Konuşuyor: ağzı sese göre oynar (bilgi: cümle ve MP4 kaydında önceden çıkarılmış ağız dizisi) */
  konus(acik: boolean, bilgi?: KonusBilgi) {
    this.konusuyor = acik;
    if (this.yuruyen) this.yuruyen.konus(acik, bilgi);
    else this.karakter?.konus(acik, true, bilgi);
  }

  /** Başka biri konuşurken Mino'nun ağzı sesle oynamasın */
  sustur(s: boolean) {
    if (this.mino) this.mino.agizSus = s;
  }

  duraklat(d: boolean) {
    this.durdu = d;
    if (this.yuruyen) this.yuruyen.duraklat = d;
  }

  kapat() {
    cancelAnimationFrame(this.raf);
    this.yuruyen?.kapat();
    this.karakter?.kapat();
  }

  // ---------------------------------------------------------------- duruş
  /**
   * Yeni duruş hedefleri (verilmeyen alanlar olduğu gibi kalır; 'normal': 1 hepsini varsayılana döndürür).
   * sure: gerçek saniye, 0: hemen.
   */
  durus(d: Durus, sure: number) {
    const alanlar: readonly string[] = this.mino ? MINO_ALAN : KARAKTER_ALAN;
    if (d.normal) for (const k of alanlar) if (k in this.hedef) this.hedef[k] = VARSAYILAN[k] ?? 0;
    for (const k of alanlar) if (typeof d[k] === 'number') this.hedef[k] = d[k];
    for (const k of Object.keys(this.hedef)) {
      this.sure[k] = TEST_MODU ? 0 : sure;
      if (!(k in this.simdi)) this.simdi[k] = VARSAYILAN[k] ?? 0;
      if (sure <= 0 || TEST_MODU) this.simdi[k] = this.hedef[k];
    }
    this.minoPozYaz();
  }

  private kare(ms: number) {
    this.raf = requestAnimationFrame((t) => this.kare(t));
    const dt = Math.min(0.1, Math.max(0, (ms - this.son) / 1000));
    this.son = ms;
    if (this.durdu) return;
    this.t += dt;
    // üstel yaklaşma: süre sonunda hedefin ~%95'i
    for (const k of Object.keys(this.hedef)) {
      const s = this.sure[k] / Math.max(1e-3, this.hiz);
      const a = s <= 0 ? 1 : 1 - Math.exp((-3 * dt) / s);
      this.simdi[k] += (this.hedef[k] - this.simdi[k]) * a;
    }
    this.minoPozYaz();
  }

  private minoPozYaz() {
    if (!this.mino) return;
    const d = this.simdi;
    if (!Object.keys(d).length) return;
    const e: MinoEkPoz = {};
    for (const k of MINO_ALAN) if (k in d) e[k] = d[k];
    this.mino.ekPoz = e;
  }

  /** Karakter (iskelet) pozuna duruşu ekler; eklem sınırları en son */
  private karakterPoz(p: Poz, t: number) {
    const d = this.simdi;
    const v = (k: string) => deger(d, k);
    const S = Math.sin;
    // kendi kuyruk sallaması (bekleme) çarpanla; üstüne hızlı "pervane"
    p.kuyruk = p.kuyruk * v('salla') + v('kuyruk') + v('pervane') * S(t * 30);
    p.kulakSol += v('kulak') + v('kulakSol');
    p.kulakSag += v('kulak') + v('kulakSag');
    p.kafa += v('kafa');
    p.kafaY += v('kafaY');
    p.kolSol += v('kol') + v('kolSol');
    p.kolSag += v('kol') + v('kolSag');
    p.y += v('y');
    p.don += v('don');
    p.sx *= v('sx');
    p.sy *= v('sy');
    if (v('goz') > 0.5) p.gozKapali = true;
    // sevinç hopu: yay gibi zıplar, inişte basılır; kulaklar geriden gelir
    const hop = v('hop');
    if (hop > 0.01) {
      const s = Math.abs(S(t * 8));
      p.y -= hop * s;
      const bas = s < 0.18 ? 1 - s / 0.18 : 0;
      p.sx *= 1 + 0.06 * bas * Math.min(1, hop / 6);
      p.sy *= 1 - 0.07 * bas * Math.min(1, hop / 6) + 0.03 * s;
      p.kulakSol += 10 * Math.cos(t * 8) * Math.min(1, hop / 6);
      p.kulakSag += 10 * Math.cos(t * 8 + 0.4) * Math.min(1, hop / 6);
    }
    // titreme (kule sallanırken heyecan / korku): küçük hızlı sarsıntı
    const titre = v('titre');
    if (titre > 0.01) {
      p.x += 0.8 * titre * S(t * 60);
      p.kafa += 1.5 * titre * S(t * 47);
    }
    // sessiz adım: küçük, iki yana yalpalayan adımlar (hoplamaz), kulaklar adımla sallanır
    const adim = this.t < this.adimBitis ? Math.min(1, (this.adimBitis - this.t) / 0.15) : 0;
    const genlik = Math.max(adim, v('adim'));
    if (genlik > 0.01) {
      const faz = t * 9;
      p.y -= 1.6 * Math.abs(S(faz)) * genlik;
      p.don += 2.5 * S(faz) * genlik;
      p.kafa -= 1.5 * S(faz) * genlik;
      p.kulakSol += 3 * S(faz + 0.8) * genlik;
      p.kulakSag -= 3 * S(faz + 0.8) * genlik;
    }
    // konuşurken başı hafifçe sallanır (ağız çizimi ifadeye bağlı olsa da konuştuğu belli olsun)
    if (this.konusuyor) p.kafaY -= 0.6 * Math.abs(S(t * 9));
    if (this.karakter) {
      const dil = v('dil') > 0.5;
      this.karakter.ek('dil-disarida', dil);
      // kuyruğunu patisiyle tutar: iskelette 'pati-kuyruk' eki (Adobe, yolda) varsa o görünür, kuyruk durur, kol
      // kalkmaz; yoksa kol ve kuyruk açısıyla (patiyi kuyruğa indirir) — duruştaki kolSag / kuyruk bu yedek içindir
      const tut = v('patiKuyruk') > 0.5;
      const pati = tut && !!this.karakter.parcaG('pati-kuyruk');
      this.karakter.ek('pati-kuyruk', pati);
      if (pati) {
        p.kolSag -= v('kolSag');
        p.kuyruk = 0;
      }
    }
    // eklem sınırları (dikiş yeri açılmasın)
    const kol = KOL_EN_COK[this.tip];
    if (kol !== undefined) {
      p.kolSol = Math.min(p.kolSol, kol);
      p.kolSag = Math.min(p.kolSag, kol);
    }
    const ks = KUYRUK_SINIR[this.tip];
    if (ks) p.kuyruk = Math.max(ks[0], Math.min(ks[1], p.kuyruk));
  }

  // ---------------------------------------------------------------- taşıma
  /** Parçanın SVG grubu (Mino: g / k / kl / kr; karakter: iskelet katmanı) */
  private parca(ad: string): SVGGElement | null {
    if (this.mino) {
      const sinif: Record<string, string> = { govde: 'g', kafa: 'k', 'kol-sol': 'kl', 'kol-sag': 'kr', kuyruk: 'q' };
      return this.mino.el.querySelector<SVGGElement>(`svg > g.${sinif[ad] ?? 'g'}`);
    }
    return this.karakter?.parcaG(ad) ?? null;
  }
  /** parça hazır olunca (karakter iskeleti yüklenince) */
  private parcaHazir(ad: string): Promise<SVGGElement | null> {
    const g = this.parca(ad);
    if (g || !this.karakter) return Promise.resolve(g);
    return this.karakter.hazir.then(() => this.parca(ad));
  }

  /** Parçaya eşya takar (çizim birimleriyle merkez, genişlik, açı) */
  tasi(ad: string, url: string, parca: string, x: number, y: number, w: number, oran: number, don = 0): Promise<void> {
    return this.parcaHazir(parca).then((g) => {
      if (!g) return;
      g.querySelector(`[data-tasinan="${ad}"]`)?.remove();
      const hh = w / oran;
      const im = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      im.setAttribute('href', url);
      im.setAttribute('x', String(x - w / 2));
      im.setAttribute('y', String(y - hh / 2));
      im.setAttribute('width', String(w));
      im.setAttribute('height', String(hh));
      im.setAttribute('transform', `rotate(${don} ${x} ${y})`);
      im.dataset.tasinan = ad;
      im.dataset.x = String(x);
      im.dataset.y = String(y);
      im.dataset.w = String(w);
      im.dataset.don = String(don);
      g.append(im);
    });
  }

  /**
   * Parçanın ekran ↔ çizim dönüşümü: parçaya üç geçici nokta konur, ekrandaki yerlerinden afin matris çıkarılır
   * (parçanın, karakterin ve kameranın bütün dönüşümleri dahil; tarayıcıdan bağımsız).
   */
  private matris(g: SVGGElement) {
    const nokta = (x: number, y: number) => {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      c.setAttribute('x', String(x));
      c.setAttribute('y', String(y));
      c.setAttribute('width', '0.01');
      c.setAttribute('height', '0.01');
      c.setAttribute('fill', 'none');
      g.append(c);
      const r = c.getBoundingClientRect();
      c.remove();
      return { x: r.left, y: r.top };
    };
    const o = nokta(0, 0);
    const ax = nokta(1000, 0);
    const ay = nokta(0, 1000);
    const a = (ax.x - o.x) / 1000, b = (ax.y - o.y) / 1000, c = (ay.x - o.x) / 1000, d = (ay.y - o.y) / 1000;
    const det = a * d - b * c;
    return {
      ekrana: (x: number, y: number) => ({ x: o.x + a * x + c * y, y: o.y + b * x + d * y }),
      cizime: (sx: number, sy: number) => {
        const px = sx - o.x, py = sy - o.y;
        return { x: (d * px - c * py) / det, y: (-b * px + a * py) / det };
      },
      olcek: Math.hypot(a, b),
      aci: (Math.atan2(b, a) * 180) / Math.PI,
    };
  }

  /** Ekrandaki bir eşyayı (merkez, genişlik px, açı) aynı yerde parçaya takar */
  al(ad: string, url: string, parca: string, merkez: { x: number; y: number }, genislik: number, oran: number, don: number) {
    const g = this.parca(parca);
    if (!g) return;
    const m = this.matris(g);
    const p = m.cizime(merkez.x, merkez.y);
    void this.tasi(ad, url, parca, p.x, p.y, genislik / m.olcek, oran, don - m.aci);
  }

  /** Parçadaki eşyayı bırakır: ekrandaki merkezi, genişliği (px) ve açısı döner */
  birak(ad: string, parca?: string): { x: number; y: number; w: number; don: number } | null {
    const kok = this.mino?.el ?? this.karakter?.el;
    const im = kok?.querySelector<SVGImageElement>(`[data-tasinan="${ad}"]`);
    const g = (parca ? this.parca(parca) : null) ?? (im?.parentNode as SVGGElement | null);
    if (!im || !g) return null;
    const m = this.matris(g);
    const e = m.ekrana(Number(im.dataset.x), Number(im.dataset.y));
    im.remove();
    return { x: e.x, y: e.y, w: Number(im.dataset.w) * m.olcek, don: Number(im.dataset.don) + m.aci };
  }
}
