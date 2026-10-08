/**
 * Büyüteç: çocuğun parmağıyla sahnede gezdirdiği mercek (ortak bileşen; Dedektif Mino).
 *
 * - Mercek sahnenin bir kopyasını büyütülmüş gösterir. Kaynakta `bt-gizli` sınıflı öğeler çıplak gözle görünmez
 *   (opacity 0), merceğin içinde görünür: "büyütecin altında izler belirir". `bt-yok` sınıflılar kopyaya hiç girmez.
 * - Hedefler (gizli ipuçları): mercek yaklaştıkça `yakinlik(h, 0..1)` (sıcak-soğuk ışıltı), merceğin içine girince bir
 *   kez `gordu(h)` (parıltı + "ting"); görülmüş hedefe dokununca `dokundu(h)` (iki adım: önce gör, sonra dokun).
 * - Bir yere dokunmak (sürüklemeden) merceği tam oraya getirir; sürüklerken mercek parmağın biraz üstünde durur.
 * - Yalnız transform / opacity; dokunuşu hiçbir zaman bekletmez. Mercek parmağın biraz üstünde durur (parmak örtmesin).
 *
 * Koordinatlar: `kap` katmanına göre px. `kaynak` (sahne) kap ile aynı sol üst köşeden başlayan bir kapta durmalı
 * (ikisi de ekranı kaplar); kaynağın kendi transform'u (kamera) kopyada da aynen kalır.
 *
 *   const b = new Buyutec({ kap, kaynak: () => dunyaEl, hedefler: [{ id: 'tuy', yer: () => ({ x, y, r }) }], gordu, dokundu });
 *   b.yenile(); // kamera ya da gizli öğeler değişince
 */
import { h, sure, TEST_MODU } from './dom';

export interface BuyutecHedef {
  id: string;
  /** hedefin kap içindeki merkezi ve yarıçapı (px); kamera kayınca da doğru olsun diye her seferinde sorulur */
  yer: () => { x: number; y: number; r: number };
}

export interface BuyutecSecenek {
  /** büyütecin içinde gezdiği ve dokunuşları dinlediği katman */
  kap: HTMLElement;
  /** büyütülen sahne (yenile() her çağrıldığında kopyası alınır) */
  kaynak: () => HTMLElement;
  hedefler?: BuyutecHedef[];
  /** büyütme (varsayılan 1.75) */
  olcek?: number;
  /** merceğin yarıçapı (px); varsayılan ekranın kısa kenarının ~%15'i */
  yaricap?: () => number;
  /** büyütecin resmi (halka + sap, cam şeffaf); yoksa halka ve sap CSS ile */
  resim?: string | null;
  /** hedefe yakınlık değişti (0 uzak … 1 merceğin ortasında) */
  yakinlik?: (h: BuyutecHedef, oran: number) => void;
  /** hedef merceğin içine ilk kez girdi */
  gordu?: (h: BuyutecHedef) => void;
  /** görülmüş hedefe dokunuldu */
  dokundu?: (h: BuyutecHedef) => void;
  /** mercek kımıldadı (yardım zamanlayıcıları için) */
  oynadi?: () => void;
}

const AZ = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const mesafe = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by);

export class Buyutec {
  readonly el: HTMLElement;
  private cam: HTMLElement;
  private ic: HTMLElement;
  private x = 0;
  private y = 0;
  private R = 60;
  private k: number;
  private gorulen = new Set<string>();
  private biten = new Set<string>();
  private yakin = new Map<string, number>();
  private surukle: { id: number; x0: number; y0: number; t0: number; ofx: number; ofy: number; tasindi: boolean } | null = null;
  private acik = true;
  private kapandi = false;
  hedefler: BuyutecHedef[];

  constructor(private s: BuyutecSecenek) {
    this.k = s.olcek ?? 1.75;
    this.hedefler = s.hedefler ?? [];
    this.ic = h('div.bt-ic');
    this.cam = h('div.bt-cam', {}, this.ic, h('i.bt-yansima'), h('i.bt-isilti'));
    const cerceve = s.resim ? h('img.bt-resim', { src: s.resim, alt: '', draggable: 'false' }) : h('div.bt-cerceve', {}, h('i.bt-sap'), h('i.bt-halka'));
    this.el = h('div.bt-mercek', { 'aria-hidden': 'true' }, this.cam, cerceve);
    s.kap.append(this.el);
    s.kap.classList.add('bt-kap');
    s.kap.addEventListener('pointerdown', this.basildi);
    window.addEventListener('pointermove', this.kimildadi, { passive: true });
    window.addEventListener('pointerup', this.birakti);
    window.addEventListener('pointercancel', this.birakti);
    window.addEventListener('resize', this.boyut);
    this.boyut();
    const r = s.kap.getBoundingClientRect();
    this.konumla(r.width / 2, r.height / 2);
  }

  // ---------------------------------------------------------------- dışarıdan
  /** Merceğin merkezi (kap px) */
  get konum(): [number, number] {
    return [this.x, this.y];
  }
  get yaricap() {
    return this.R;
  }
  /** Sahnenin kopyasını tazeler (kamera kaydı, gizli öğe bulundu, boyut değişti) */
  yenile() {
    if (this.kapandi) return;
    const kaynak = this.s.kaynak();
    const k = kaynak.cloneNode(true) as HTMLElement;
    k.classList.add('bt-kopya');
    for (const e of k.querySelectorAll('.bt-yok')) e.remove();
    k.removeAttribute('id');
    for (const e of k.querySelectorAll('[id]')) e.removeAttribute('id');
    // kaynağın kendi kabındaki yeri (kap ile aynı köşe varsayılır; küçük kayma da karşılanır)
    const kr = this.s.kap.getBoundingClientRect();
    const pr = (kaynak.offsetParent as HTMLElement | null)?.getBoundingClientRect() ?? kr;
    const sarg = h('div.bt-kaynak', { style: `left:${(pr.left - kr.left).toFixed(1)}px;top:${(pr.top - kr.top).toFixed(1)}px;width:${pr.width.toFixed(1)}px;height:${pr.height.toFixed(1)}px` }, k);
    this.ic.replaceChildren(sarg);
    this.ciz();
  }
  /** Merceği göster / gizle (gizliyken dokunuşlara karışmaz) */
  goster(acik: boolean) {
    this.acik = acik;
    this.el.classList.toggle('bt-gizlendi', !acik);
    this.s.kap.classList.toggle('bt-kapali', !acik);
    if (!acik) this.surukle = null;
  }
  /** Mercek bir noktaya kayar (ipucu gösterme, giriş); ms 0: hemen. Kayarken hedef aramaz: bulmak çocuğun işi */
  async git(x: number, y: number, ms = 600) {
    const [x0, y0] = [this.x, this.y];
    if (!ms || TEST_MODU || AZ) {
      this.konumla(x, y, false);
      return;
    }
    // kayarken her karede hedefler de denetlenir (yalnız transform)
    const bas = performance.now();
    const sn = sure(ms);
    await new Promise<void>((coz) => {
      const adim = (t: number) => {
        if (this.kapandi || this.surukle) return coz();
        const u = Math.min(1, (t - bas) / sn);
        const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        this.konumla(x0 + (x - x0) * e, y0 + (y - y0) * e, false);
        if (u < 1) requestAnimationFrame(adim);
        else coz();
      };
      requestAnimationFrame(adim);
    });
  }
  /** Hedef artık bitti (dokunuldu): yakınlık ve dokunma denetiminden çıkar */
  bitir(id: string) {
    this.biten.add(id);
    this.yakin.delete(id);
  }
  /** Hedefleri baştan kurar (yeni ipuçları) */
  hedefleriKur(hedefler: BuyutecHedef[]) {
    this.hedefler = hedefler;
    this.gorulen.clear();
    this.biten.clear();
    this.yakin.clear();
  }
  /** Görülmüş mü */
  gorulduMu(id: string) {
    return this.gorulen.has(id);
  }
  /** Camda parlama süpürmesi (bir şey bulununca) */
  parla() {
    this.el.classList.remove('bt-parla');
    void this.el.offsetWidth;
    this.el.classList.add('bt-parla');
  }
  kapat() {
    this.kapandi = true;
    this.s.kap.removeEventListener('pointerdown', this.basildi);
    window.removeEventListener('pointermove', this.kimildadi);
    window.removeEventListener('pointerup', this.birakti);
    window.removeEventListener('pointercancel', this.birakti);
    window.removeEventListener('resize', this.boyut);
    this.s.kap.classList.remove('bt-kap', 'bt-kapali', 'bt-suruklen');
    this.el.remove();
  }

  // ---------------------------------------------------------------- iç
  private boyut = () => {
    const r = this.s.kap.getBoundingClientRect();
    this.R = this.s.yaricap?.() ?? Math.max(44, Math.min(110, Math.min(r.width, r.height) * 0.15));
    this.el.style.setProperty('--bt-r', `${this.R.toFixed(1)}px`);
    this.ciz();
  };

  private konumla(x: number, y: number, denetle = true) {
    const r = this.s.kap.getBoundingClientRect();
    // merceğin ortası kabın içinde kalır (kenarda yarısı dışarı taşabilir)
    this.x = Math.max(this.R * 0.3, Math.min(r.width - this.R * 0.3, x));
    this.y = Math.max(this.R * 0.3, Math.min(r.height - this.R * 0.3, y));
    this.ciz();
    if (denetle) this.denetle();
  }

  private ciz() {
    const { x, y, R, k } = this;
    this.el.style.transform = `translate3d(${(x - R).toFixed(1)}px, ${(y - R).toFixed(1)}px, 0)`;
    this.ic.style.transform = `translate3d(${(R - x * k).toFixed(1)}px, ${(R - y * k).toFixed(1)}px, 0) scale(${k})`;
    this.el.dataset.x = String(Math.round(x));
    this.el.dataset.y = String(Math.round(y));
  }

  private denetle() {
    if (!this.acik) return;
    let enYakin = 0;
    for (const hd of this.hedefler) {
      if (this.biten.has(hd.id)) continue;
      const { x, y, r } = hd.yer();
      const d = mesafe(this.x, this.y, x, y);
      const oran = Math.max(0, Math.min(1, 1 - (d - r * 0.5) / (this.R * 3)));
      enYakin = Math.max(enYakin, oran);
      if (Math.abs((this.yakin.get(hd.id) ?? -1) - oran) > 0.02) {
        this.yakin.set(hd.id, oran);
        this.s.yakinlik?.(hd, oran);
      }
      // merceğin içine girdi: merkezi camın iç kısmında
      if (!this.gorulen.has(hd.id) && d < this.R * 0.72 + r * 0.35) {
        this.gorulen.add(hd.id);
        this.parla();
        this.s.gordu?.(hd);
      }
    }
    this.el.style.setProperty('--bt-yakin', enYakin.toFixed(2));
  }

  private basildi = (e: PointerEvent) => {
    if (!this.acik || this.kapandi || this.surukle) return;
    if (e.button !== undefined && e.button > 0) return;
    const r = this.s.kap.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    // dokunmatikte mercek parmağın biraz üstünde (parmak camı örtmesin); farede imlecin tam altında
    const dokunmatik = e.pointerType === 'touch';
    const ofy = dokunmatik ? -this.R * 0.85 : 0;
    // merceğin kendisinden tutulduysa olduğu yerden sürüklenir (zıplamaz)
    const ustunde = mesafe(px, py, this.x, this.y) < this.R * 1.05;
    const ofx = ustunde ? this.x - px : 0;
    const ofy2 = ustunde ? this.y - py : ofy;
    this.surukle = { id: e.pointerId, x0: px, y0: py, t0: performance.now(), ofx, ofy: ofy2, tasindi: false };
    this.s.kap.classList.add('bt-suruklen');
    this.el.classList.add('bt-tutuldu');
    if (!ustunde) this.konumla(px + ofx, py + ofy2);
    this.s.oynadi?.();
  };

  private kimildadi = (e: PointerEvent) => {
    const s = this.surukle;
    if (!s || e.pointerId !== s.id) return;
    const r = this.s.kap.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    if (mesafe(px, py, s.x0, s.y0) > 10) s.tasindi = true;
    this.konumla(px + s.ofx, py + s.ofy);
    this.s.oynadi?.();
  };

  private birakti = (e: PointerEvent) => {
    const s = this.surukle;
    if (!s || e.pointerId !== s.id) return;
    this.surukle = null;
    this.s.kap.classList.remove('bt-suruklen');
    this.el.classList.remove('bt-tutuldu');
    const r = this.s.kap.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    const dokunus = !s.tasindi && performance.now() - s.t0 < 600;
    if (!dokunus) return;
    // dokunuş: önceden görülmüş bir hedefe mi dokunuldu (iki adım: önce mercekle gör, sonra dokun)
    const onceden = new Set(this.gorulen);
    let secilen: BuyutecHedef | null = null;
    let enIyi = Infinity;
    for (const hd of this.hedefler) {
      if (!onceden.has(hd.id) || this.biten.has(hd.id)) continue;
      const { x, y, r: hr } = hd.yer();
      const d = mesafe(px, py, x, y);
      if (d < hr * 1.4 + 28 && d < enIyi) {
        enIyi = d;
        secilen = hd;
      }
    }
    // başka bir yere dokunuldu: mercek tam oraya gelir (parmağın altına; bakmak için)
    if (!secilen) this.konumla(px, py);
    if (secilen) this.s.dokundu?.(secilen);
  };
}
