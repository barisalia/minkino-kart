/**
 * Küçük 2B çember fiziği (Tart Bakalım'ın leğeni). Bağımlılık yok, DOM yok: birim testli (tests/unit/fizik.test.ts).
 *
 * - Cisimler çember: yerçekimi, sekme, sürtünme ve yuvarlanma (açısal hız; meyve dönerek yuvarlanır).
 * - Duvarlar çizgi parçaları (leğenin iç kesiti + görünmez yan duvarlar).
 * - Alt adımlı (4 × 240 Hz) dürtü çözücü; konum düzeltmesi. ≤15 cisim için her karede ~100 çift: telefonda ucuz.
 * - Uyku: duran cisim uyur (hesaplanmaz, çizilmez); uyuyan cisim öteki cisimlere sabit engeldir, böylece yığın
 *   titremeden durur. Sert çarpma, itme ya da altından cisim alınınca uyanır.
 * - Görsel ezilme yayı (ez): çarpınca cisim yumuşakça basılıp yaylanır; çizim bunu ölçek olarak kullanır.
 * Koordinatlar: x sağa, y aşağı (ekran gibi); açı CSS rotate yönünde (saat yönü).
 */

export interface Cisim {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** yarıçap (birim) */
  r: number;
  /** fizik kütlesi (r² ile orantılı) */
  m: number;
  /** açı (radyan) ve açısal hız */
  a: number;
  w: number;
  /** sekme (0..1) */
  sek: number;
  uyuyor: boolean;
  /** hareketsiz geçen süre (sn) */
  dur: number;
  /** bir yere değdi mi (terazide ağırlığı sayılır) */
  degdi: boolean;
  /** parmakta: fizik dışı (konumunu dışarıdan alır) */
  tutuluyor: boolean;
  /** görsel ezilme (0: yok, +: basık) ve hızı */
  ez: number;
  ezHiz: number;
  /** son çarpma sesi zamanı (sn, dünya saati) */
  sonSes: number;
}

export interface Duvar {
  ax: number;
  ay: number;
  bx: number;
  by: number;
}

export interface Carpma {
  c: Cisim;
  /** yaklaşma hızı (birim/sn) */
  hiz: number;
  /** öteki cisim (duvarsa null) */
  diger: Cisim | null;
  /** ilk değişi mi */
  ilk: boolean;
}

const ALT_ADIM = 4;
const TEKRAR = 2;
/** bu hızın altındaki çarpma sekmez (durgun temas) */
const SEKME_ESIGI = 70;
/** uyuyanı uyandıran çarpma hızı */
const UYANDIR = 140;
/** sürtünme: duvar (pirinç leğen) ve meyve-meyve (yuvarlak meyveler birbirinin üstünden kayıp yuvarlanır) */
const SURTUNME = 0.5;
const SURTUNME_MEYVE = 0.22;
const UYKU_HIZ = 9;
const UYKU_SURE = 0.45;
const EN_HIZ = 1100;

export class Dunya {
  g = 1500;
  readonly cisimler: Cisim[] = [];
  readonly duvarlar: Duvar[] = [];
  /** dünya saati (sn) */
  t = 0;
  /** çarpma bildirimi (ses, ezilme, sayma) */
  carpinca: ((c: Carpma) => void) | null = null;
  private sira = 0;

  duvar(ax: number, ay: number, bx: number, by: number) {
    this.duvarlar.push({ ax, ay, bx, by });
  }

  /** Noktalardan çoklu çizgi (leğenin kesiti) */
  cizgi(n: [number, number][]) {
    for (let i = 0; i + 1 < n.length; i++) this.duvar(n[i][0], n[i][1], n[i + 1][0], n[i + 1][1]);
  }

  ekle(x: number, y: number, r: number, o: Partial<Cisim> = {}): Cisim {
    const c: Cisim = { id: ++this.sira, x, y, vx: 0, vy: 0, r, m: r * r, a: 0, w: 0, sek: 0.32, uyuyor: false, dur: 0, degdi: false, tutuluyor: false, ez: 0, ezHiz: 0, sonSes: -1, ...o };
    this.cisimler.push(c);
    return c;
  }

  cikar(c: Cisim) {
    const i = this.cisimler.indexOf(c);
    if (i >= 0) this.cisimler.splice(i, 1);
    // altından cisim alındı: herkes uyanır, yığın yeniden oturur
    this.uyandir();
  }

  uyandir(c?: Cisim) {
    for (const x of c ? [c] : this.cisimler) {
      x.uyuyor = false;
      x.dur = 0;
    }
  }

  /** Hepsi uyuyor mu (görsel yay da durdu mu): döngü durabilir */
  get sakin() {
    return this.cisimler.every((c) => (c.uyuyor || c.tutuluyor) && Math.abs(c.ez) < 0.002 && Math.abs(c.ezHiz) < 0.02);
  }

  /** Sarsma: her cisme küçük rastgele itki (leğene hafif dokunuş) */
  sars(guc: number, rnd: () => number = Math.random) {
    for (const c of this.cisimler) {
      if (c.tutuluyor) continue;
      c.uyuyor = false;
      c.dur = 0;
      c.vy -= guc * (0.6 + rnd() * 0.5);
      c.vx += guc * (rnd() - 0.5) * 0.7;
      c.w += (rnd() - 0.5) * 6;
    }
  }

  adim(dt: number) {
    dt = Math.min(dt, 1 / 30);
    if (dt <= 0) return;
    const h = dt / ALT_ADIM;
    for (let s = 0; s < ALT_ADIM; s++) {
      this.t += h;
      for (const c of this.cisimler) {
        if (c.uyuyor || c.tutuluyor) continue;
        c.vy += this.g * h;
        const v = Math.hypot(c.vx, c.vy);
        if (v > EN_HIZ) {
          c.vx *= EN_HIZ / v;
          c.vy *= EN_HIZ / v;
        }
        c.x += c.vx * h;
        c.y += c.vy * h;
        c.a += c.w * h;
        // havada hafif sönüm
        c.w *= 1 - 0.4 * h;
      }
      for (let k = 0; k < TEKRAR; k++) {
        const bildir = k === 0;
        const n = this.cisimler.length;
        for (let i = 0; i < n; i++) {
          const a = this.cisimler[i];
          if (a.tutuluyor) continue;
          for (let j = i + 1; j < n; j++) {
            const b = this.cisimler[j];
            if (b.tutuluyor || (a.uyuyor && b.uyuyor)) continue;
            this.ciftCoz(a, b, h, bildir);
          }
          if (!a.uyuyor) for (const d of this.duvarlar) this.duvarCoz(a, d, h, bildir);
        }
      }
    }
    // uyku ve ezilme yayı (karede bir)
    for (const c of this.cisimler) {
      if (!c.uyuyor && !c.tutuluyor) {
        if (c.degdi && Math.hypot(c.vx, c.vy) < UYKU_HIZ && Math.abs(c.w) < 0.6) {
          c.dur += dt;
          if (c.dur > UYKU_SURE) {
            c.uyuyor = true;
            c.vx = c.vy = c.w = 0;
          }
        } else c.dur = 0;
      }
      if (c.ez || c.ezHiz) {
        // jöle gibi: sert yay, orta sönüm
        c.ezHiz += (-520 * c.ez - 15 * c.ezHiz) * dt;
        c.ez += c.ezHiz * dt;
        if (Math.abs(c.ez) < 0.002 && Math.abs(c.ezHiz) < 0.02) c.ez = c.ezHiz = 0;
      }
    }
  }

  private carpti(c: Cisim, hiz: number, diger: Cisim | null) {
    const ilk = !c.degdi;
    c.degdi = true;
    if (hiz > SEKME_ESIGI * 0.8) {
      // ezilme: hızla orantılı, sınırlı
      c.ezHiz += Math.min(3.2, hiz * 0.0065);
    }
    this.carpinca?.({ c, hiz, diger, ilk });
  }

  /** Çember ↔ durağan engel (duvar ya da uyuyan cisim): n engelden cisme doğru birim normal */
  private engel(c: Cisim, nx: number, ny: number, pen: number, bildir: boolean, diger: Cisim | null) {
    c.x += nx * pen;
    c.y += ny * pen;
    const vn = c.vx * nx + c.vy * ny;
    if (vn >= 0) return;
    if (bildir) this.carpti(c, -vn, diger);
    const e = -vn > SEKME_ESIGI ? c.sek : 0;
    const jn = -(1 + e) * vn;
    c.vx += jn * nx;
    c.vy += jn * ny;
    // sürtünme + yuvarlanma: temas noktası kaymasın (disk: I = m r² / 2)
    const tx = -ny;
    const ty = nx;
    const u = c.vx * tx + c.vy * ty - c.w * c.r;
    const jt = Math.max(-SURTUNME * jn, Math.min(SURTUNME * jn, -u / 3));
    c.vx += jt * tx;
    c.vy += jt * ty;
    c.w += (-2 * jt) / c.r;
    // yuvarlanma direnci: yerde dönen meyve yavaş yavaş durur
    c.w *= 0.996;
  }

  private duvarCoz(c: Cisim, d: Duvar, _h: number, bildir: boolean) {
    const ex = d.bx - d.ax;
    const ey = d.by - d.ay;
    const L = ex * ex + ey * ey;
    let t = L ? ((c.x - d.ax) * ex + (c.y - d.ay) * ey) / L : 0;
    t = Math.max(0, Math.min(1, t));
    const qx = d.ax + ex * t;
    const qy = d.ay + ey * t;
    const dx = c.x - qx;
    const dy = c.y - qy;
    const uz = Math.hypot(dx, dy);
    if (uz >= c.r || uz < 1e-6) return;
    this.engel(c, dx / uz, dy / uz, c.r - uz, bildir, null);
  }

  private ciftCoz(a: Cisim, b: Cisim, _h: number, bildir: boolean) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const R = a.r + b.r;
    if (Math.abs(dx) > R || Math.abs(dy) > R) return;
    const uz = Math.hypot(dx, dy);
    if (uz >= R) return;
    const nx = uz > 1e-6 ? dx / uz : 0;
    const ny = uz > 1e-6 ? dy / uz : -1;
    const pen = R - uz;
    // uyuyan cisim sabit engel; sert gelen çarpma onu uyandırır
    if (a.uyuyor || b.uyuyor) {
      const [uyanik, uyuyan, sx, sy] = a.uyuyor ? [b, a, -nx, -ny] : [a, b, nx, ny];
      const vn = uyanik.vx * sx + uyanik.vy * sy;
      if (-vn > UYANDIR) {
        uyuyan.uyuyor = false;
        uyuyan.dur = 0;
      } else {
        this.engel(uyanik, sx, sy, pen, bildir, uyuyan);
        return;
      }
    }
    const ia = 1 / a.m;
    const ib = 1 / b.m;
    const top = ia + ib;
    a.x += nx * pen * (ia / top);
    a.y += ny * pen * (ia / top);
    b.x -= nx * pen * (ib / top);
    b.y -= ny * pen * (ib / top);
    const vn = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
    if (vn >= 0) return;
    if (bildir) {
      this.carpti(a, -vn, b);
      this.carpti(b, -vn, a);
    }
    const e = -vn > SEKME_ESIGI ? Math.min(a.sek, b.sek) : 0;
    const jn = (-(1 + e) * vn) / top;
    a.vx += jn * ia * nx;
    a.vy += jn * ia * ny;
    b.vx -= jn * ib * nx;
    b.vy -= jn * ib * ny;
    const tx = -ny;
    const ty = nx;
    const kayma = a.vx * tx + a.vy * ty - a.w * a.r - (b.vx * tx + b.vy * ty + b.w * b.r);
    const jt = Math.max(-SURTUNME_MEYVE * jn, Math.min(SURTUNME_MEYVE * jn, -kayma / (3 * top)));
    a.vx += jt * ia * tx;
    a.vy += jt * ia * ty;
    b.vx -= jt * ib * tx;
    b.vy -= jt * ib * ty;
    a.w += (-2 * jt * ia) / a.r;
    b.w += (-2 * jt * ib) / b.r;
  }
}
