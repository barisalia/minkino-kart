// Deneyler · Zincirleme Top Parkuru: bölümlerden bağımsız, DOM'suz, belirlenimci fizik motoru (sabit 1/240 sn adım).
// Bir bölüm (bolumler.ts) sabit yüzeylerden (kule, başlangıç rampası, masa), yerleştirilebilir parçalardan (mekanizma),
// bir domino sırasından ve bir finalden (masa zili ya da çan kulesi) oluşur. Top yerçekimiyle yuvarlanır, düşer, seker;
// mekanizmalar topu yakalar (huni döndürür, kaykay taşır, yay fırlatır, değirmenin kovası kaldırır, körük basılır) ya da
// yalnız yüzey verir (rampa, raf). Eksik parça ceza değildir: top gerçekten kaçar, durur; main.ts başa döndürür.
export type Nokta = { x: number; y: number };
export type Kutu = { x: number; y: number; w: number; h: number };
export type Dogru = readonly [Nokta, Nokta];
export const n = (x: number, y: number): Nokta => ({ x, y });

export const G = 1500;
/** Dominoların devrilme ivmesi (görsel tempo: bir dominodan ötekine ≈0,2 sn). */
export const G_DOMINO = 4200;
export const ADIM = 1 / 240;
export const TOP_R = 33;
const R = TOP_R;

export type Olay =
  | { tur: 'klank' } | { tur: 'sek'; siddet: number }
  | { tur: 'huni-gir' } | { tur: 'huni-cik' } | { tur: 'boing' }
  | { tur: 'kaykay-bin' } | { tur: 'kaykay-dur' } | { tur: 'kaykay-dus' } | { tur: 'ucus' }
  | { tur: 'yay-bas' } | { tur: 'yay-firlat'; guc: number } | { tur: 'pota' }
  | { tur: 'musluk' } | { tur: 'su' } | { tur: 'su-tasti' } | { tur: 'kova-al' } | { tur: 'kova-birak' }
  | { tur: 'koruk' } | { tur: 'balon-sisir' } | { tur: 'hava-kacti' } | { tur: 'balon-it' }
  | { tur: 'domino'; i: number } | { tur: 'sallan'; i: number }
  | { tur: 'zil' } | { tur: 'can' };

export type TopDurumu = 'bekle' | 'serbest' | 'tasiniyor';
export type Top = {
  x: number; y: number; vx: number; vy: number; aci: number; donus: number; olcek: number;
  mod: TopDurumu; temas: boolean; sahip: string | null;
};
export type Sonuc = 'basari' | 'kacti' | null;

/** Motorun mekanizmalara açtığı dünya: top, olaylar, domino sırası. */
export interface Dunya {
  top: Top;
  olay(o: Olay): void;
  dominolar: DominoSirasi;
  /** Mekanizmanın yerleşik olup olmadığı (çocuk koydu ya da bölümde sabit). */
  var(id: string): boolean;
}
export interface Mekanizma {
  readonly id: string;
  /** Yerleşikken çarpışma yüzeyleri (hareket eden parçada o anki yeri). */
  yuzeyler(d: Dunya): readonly Dogru[];
  /** Serbest topu yakalar mı (yakalarsa taşıma başlar). Yalnız hız veren parça (trambolin) false döner. */
  yakala?(t: Top, oncekiY: number, d: Dunya): boolean;
  /** Taşınan topu yürütür; bırakınca true. */
  tasi?(t: Top, h: number, d: Dunya): boolean;
  /** Kendi durumu (dönen çark, şişen balon, giden kaykay). Yerleşik değilken de çağrılır (komik sonuçlar). */
  adim?(h: number, d: Dunya): void;
  /** Bir şey sürüyorsa (çark dönüyor, balon şişiyor) top dursa da tur bitmez. */
  mesgul?(): boolean;
  /** Taşıdığı top bir yere gidemiyor mu (susuz çarkın kovası): tur kaçmış sayılır. */
  takili?(): boolean;
  sifirla(): void;
}

// ----- Domino sırası ve final -----
export type DominoTanimi = { ortalar: readonly number[]; w: number; h: number; zeminY: number };
export type FinalTanimi = { tur: 'zil' | 'can'; dugme: Nokta; kutu: Kutu };
export type DominoDurumu = 'dik' | 'duser' | 'yasli' | 'yatti';

export class DominoSirasi {
  readonly ds: { aci: number; w: number; durum: DominoDurumu }[];
  readonly sonAci: number;
  finalCaldi = false;
  private readonly I: number;
  private readonly aralik: number;
  constructor(readonly t: DominoTanimi, readonly f: FinalTanimi) {
    this.ds = t.ortalar.map(() => ({ aci: 0, w: 0, durum: 'dik' as DominoDurumu }));
    this.I = (t.w * t.w + t.h * t.h) / 3;
    this.aralik = t.ortalar.length > 1 ? t.ortalar[1] - t.ortalar[0] : 90;
    const son = { x: t.ortalar[t.ortalar.length - 1] + t.w / 2, y: t.zeminY };
    this.sonAci = Math.atan2(f.dugme.x - son.x, son.y - f.dugme.y);
  }
  sifirla() { for (const d of this.ds) Object.assign(d, { aci: 0, w: 0, durum: 'dik' }); this.finalCaldi = false; }
  /** Bir dominoyu dıştan iter (balon). */
  it(i: number, w: number, d: Dunya) {
    const x = this.ds[i];
    if (!x || x.durum !== 'dik') return;
    x.w = Math.max(x.w, w);
    x.durum = 'duser';
    d.olay({ tur: 'domino', i });
  }
  /** Topun dominoya çarpması: ilk dik (ya da sallanan) dominonun sol yüzü. */
  carpisma(t: Top, d: Dunya) {
    const { ortalar, w, h, zeminY } = this.t;
    for (let i = 0; i < this.ds.length; i++) {
      const x = this.ds[i];
      if (x.durum === 'yasli' || x.durum === 'yatti') continue;
      const sol = ortalar[i] - w / 2;
      if (t.x + R >= sol && t.x < ortalar[i] && t.y + R > zeminY - h && t.y - R < zeminY) {
        // Yavaş dokunuş itmez (top dominoya yaslanır); hızlı çarpma devirir, yavaşça çarpma sallar.
        if (t.vx > 60) {
          const ilk = x.durum === 'dik';
          x.w = Math.max(x.w, t.vx * 0.012);
          if (ilk) { x.durum = 'duser'; d.olay(x.w > 2.2 ? { tur: 'domino', i } : { tur: 'sallan', i }); }
          t.vx = -0.25 * t.vx;
        } else if (t.vx > 0) t.vx = 0;
        t.x = sol - R;
      }
      break;
    }
  }
  adim(h: number, d: Dunya) {
    const { w: DW, h: DH } = this.t;
    const ds = this.ds;
    for (let i = ds.length - 1; i >= 0; i--) {
      const x = ds[i];
      if (x.durum === 'duser' || (x.durum === 'dik' && x.w !== 0)) {
        const ivme = G_DOMINO * ((DH / 2) * Math.sin(x.aci) - (DW / 2) * Math.cos(x.aci)) / this.I;
        x.w += ivme * h;
        x.aci += x.w * h;
        if (x.aci <= 0) {
          x.aci = 0;
          x.w = Math.abs(x.w) > 0.3 ? -x.w * 0.3 : 0;
          if (x.w === 0) x.durum = 'dik';
        }
        if (x.aci > 0.05) x.durum = 'duser';
        if (i < ds.length - 1) {
          const on = ds[i + 1];
          if (on.durum === 'dik' && DH * Math.sin(x.aci) >= this.aralik - DW) {
            on.w = Math.max(on.w, x.w * 0.95, 2.6);
            on.durum = 'duser';
            x.durum = 'yasli';
            d.olay({ tur: 'domino', i: i + 1 });
          }
        } else if (!this.finalCaldi && x.aci >= this.sonAci) {
          x.aci = this.sonAci;
          x.w = 0;
          x.durum = 'yasli';
          this.finalCaldi = true;
          d.olay({ tur: this.f.tur });
        }
        if (x.aci >= Math.PI / 2) { x.aci = Math.PI / 2; x.w = 0; x.durum = 'yatti'; }
      }
      if (x.durum === 'yasli' && i < ds.length - 1) x.aci = this.yaslanma(i, ds[i + 1].aci, x.aci);
    }
  }
  devriliyor() { return this.ds.some((x) => x.durum === 'duser'); }
  /** Yaslanan dominonun açısı: sağ üst köşesi, önündekinin sol yüzüne değecek biçimde (yarılama). */
  yaslanma(i: number, b: number, simdiki: number) {
    const { ortalar, w: DW, h: DH, zeminY } = this.t;
    const P = { x: ortalar[i] + DW / 2, y: zeminY };
    const Q = { x: ortalar[i + 1] + DW / 2, y: zeminY };
    const L = { x: Q.x - DW * Math.cos(b), y: Q.y - DW * Math.sin(b) };
    const yon = { x: Math.sin(b), y: -Math.cos(b) };
    const uzaklik = (a: number) => {
      const K = { x: P.x + DH * Math.sin(a), y: P.y - DH * Math.cos(a) };
      return yon.x * (K.y - L.y) - yon.y * (K.x - L.x);
    };
    let lo = 0, hi = Math.PI / 2;
    if (uzaklik(lo) * uzaklik(hi) > 0) return simdiki;
    for (let k = 0; k < 24; k++) {
      const m = (lo + hi) / 2;
      if (uzaklik(lo) * uzaklik(m) <= 0) hi = m; else lo = m;
    }
    return Math.max(simdiki, (lo + hi) / 2);
  }
}

// ----- Bölüm -----
export type Yas = 'minik' | 'dort' | 'bes';
export type BolumTanimi = {
  no: number;
  dunya: { w: number; h: number };
  zeminY: number;
  topBasi: Nokta;
  /** Kol çekilince topun ilk hızı. */
  itis: number;
  /** Fondaki sabit yüzeyler (kule platformu, başlangıç rampası, masalar, duvarlar). Masa yüzeyleri ayrıca `masalar`. */
  sabit: readonly Dogru[];
  /** Masa(lar): yumuşak keçe, az seker (kaçan top çabuk durur). Aralarındaki boşluğa düşen top kaybolur (kaçar). */
  masalar: readonly Dogru[];
  /** Bu y'nin altına düşen top kaçmış sayılır (iki masa arası). */
  dusmeY: number;
  mekanizmalar: readonly Mekanizma[];
  dominolar: DominoTanimi;
  final: FinalTanimi;
};

export class Motor {
  readonly yerlesik = new Set<string>();
  top: Top;
  readonly dominolar: DominoSirasi;
  sonuc: Sonuc = null;
  olaylar: Olay[] = [];
  zaman = 0;
  private durgun = 0;
  private finalT = 0;
  private readonly dunya: Dunya;
  constructor(readonly b: BolumTanimi, yerlesik: Iterable<string> = []) {
    for (const p of yerlesik) this.yerlesik.add(p);
    this.top = this.ilkTop();
    this.dominolar = new DominoSirasi(b.dominolar, b.final);
    const m = this;
    this.dunya = {
      get top() { return m.top; },
      olay: (o) => { m.olaylar.push(o); },
      dominolar: this.dominolar,
      var: (id) => m.yerlesik.has(id),
    };
  }
  private ilkTop(): Top {
    return { x: this.b.topBasi.x, y: this.b.topBasi.y, vx: 0, vy: 0, aci: 0, donus: 0, olcek: 1, mod: 'bekle', temas: false, sahip: null };
  }
  get finalCaldi() { return this.dominolar.finalCaldi; }
  mekanizma<T extends Mekanizma>(id: string) { return this.b.mekanizmalar.find((x) => x.id === id) as T | undefined; }

  /** Kol çekildi: top platformdan itilir. */
  baslat() {
    if (this.top.mod !== 'bekle') return false;
    this.top.mod = 'serbest';
    this.top.vx = this.b.itis;
    this.top.vy = 0;
    this.sonuc = null;
    this.olaylar.push({ tur: 'klank' });
    return true;
  }
  /** Top, dominolar ve mekanizmalar başa. */
  sifirla() {
    this.top = this.ilkTop();
    this.dominolar.sifirla();
    for (const x of this.b.mekanizmalar) x.sifirla();
    this.sonuc = null;
    this.durgun = 0;
    this.finalT = 0;
  }
  private yuzeyler(): Dogru[] {
    const y: Dogru[] = [...this.b.sabit];
    for (const x of this.b.mekanizmalar) if (this.yerlesik.has(x.id)) y.push(...x.yuzeyler(this.dunya));
    return y;
  }
  adim(dt: number) {
    let kalan = Math.min(dt, 0.1);
    while (kalan > 1e-9) {
      const h = Math.min(ADIM, kalan);
      this.altAdim(h);
      kalan -= h;
    }
  }
  private altAdim(h: number) {
    this.zaman += h;
    for (const x of this.b.mekanizmalar) x.adim?.(h, this.dunya);
    this.topAdimi(h);
    this.dominolar.adim(h, this.dunya);
    this.sonucBak(h);
  }
  private topAdimi(h: number) {
    const t = this.top;
    if (t.mod === 'bekle') return;
    if (t.mod === 'tasiniyor') {
      const m = this.b.mekanizmalar.find((x) => x.id === t.sahip);
      if (!m || m.tasi!(t, h, this.dunya)) { t.mod = 'serbest'; t.sahip = null; }
      return;
    }
    const oncekiY = t.y;
    t.vy += G * h;
    t.x += t.vx * h;
    t.y += t.vy * h;
    t.temas = false;
    for (const [a, b] of this.yuzeyler()) if (this.carp(a, b, 0.22, 22, h)) t.temas = true;
    // Masa keçe gibi yumuşak: az seker, çabuk durur.
    for (const [a, b] of this.b.masalar) if (this.carp(a, b, 0.36, 1500, h)) t.temas = true;
    for (const m of this.b.mekanizmalar) {
      if (!this.yerlesik.has(m.id) || !m.yakala) continue;
      if (m.yakala(t, oncekiY, this.dunya)) { t.mod = 'tasiniyor'; t.sahip = m.id; return; }
    }
    this.dominolar.carpisma(t, this.dunya);
    const W = this.b.dunya.w;
    if (t.x < R) { t.x = R; t.vx = Math.abs(t.vx) * 0.4; }
    if (t.x > W - R) { t.x = W - R; t.vx = -Math.abs(t.vx) * 0.4; }
    if (t.temas) t.donus = t.vx / R;
    t.aci += t.donus * h;
  }
  /** Daire–doğru parçası çarpışması; temas varsa true. e: sekme katsayısı, mu: yuvarlanma direnci (px/sn²). */
  private carp(a: Nokta, b: Nokta, e: number, mu: number, h: number) {
    return carp(this.top, a, b, e, mu, h, this.dunya);
  }
  private sonucBak(h: number) {
    if (this.sonuc || this.top.mod === 'bekle') return;
    if (this.dominolar.finalCaldi) {
      this.finalT += h;
      if (this.finalT > 1.2) this.sonuc = 'basari';
      return;
    }
    const t = this.top;
    if (t.y > this.b.dusmeY) { this.sonuc = 'kacti'; return; }
    const mesgul = this.dominolar.devriliyor() || this.b.mekanizmalar.some((m) => m.mesgul?.());
    const sahip = t.mod === 'tasiniyor' ? this.b.mekanizmalar.find((x) => x.id === t.sahip) : undefined;
    const yavas = (t.mod === 'serbest' && t.temas && Math.hypot(t.vx, t.vy) < 10) || !!sahip?.takili?.();
    this.durgun = yavas && !mesgul ? this.durgun + h : 0;
    if (this.durgun > 0.45) this.sonuc = 'kacti';
  }
}

/** Daire–doğru parçası çarpışması (mekanizmalar da kullanır). */
export function carp(t: Top, a: Nokta, b: Nokta, e: number, mu: number, h: number, d?: Dunya) {
  const abx = b.x - a.x, aby = b.y - a.y;
  const s = Math.max(0, Math.min(1, ((t.x - a.x) * abx + (t.y - a.y) * aby) / (abx * abx + aby * aby)));
  const cx = a.x + abx * s, cy = a.y + aby * s;
  const dx = t.x - cx, dy = t.y - cy;
  const dd = Math.hypot(dx, dy);
  if (dd >= R + 0.5 || dd === 0) return false;
  const nx = dx / dd, ny = dy / dd;
  if (dd < R) { t.x += nx * (R - dd); t.y += ny * (R - dd); }
  const vn = t.vx * nx + t.vy * ny;
  if (vn < 0) {
    const sekme = -vn > 110 ? e : 0;
    t.vx -= (1 + sekme) * vn * nx;
    t.vy -= (1 + sekme) * vn * ny;
    if (-vn > 160) d?.olay({ tur: 'sek', siddet: Math.min(1, -vn / 900) });
  }
  const tx = -ny, ty = nx;
  let vt = t.vx * tx + t.vy * ty;
  const dv = mu * h;
  vt = Math.abs(vt) <= dv ? 0 : vt - Math.sign(vt) * dv;
  const vn2 = t.vx * nx + t.vy * ny;
  t.vx = vn2 * nx + vt * tx;
  t.vy = vn2 * ny + vt * ty;
  return true;
}

/** Bir noktadan hedefe `sure` saniyede düşen atışın hızı (trambolin, kaykay, yay). */
export function atis(p: Nokta, hedef: Nokta, sure: number) {
  return { vx: (hedef.x - p.x) / sure, vy: (hedef.y - p.y - 0.5 * G * sure * sure) / sure };
}

/** Bütün turu sonuna kadar oynatır (testler ve denetim için): sonuç, olaylar ve süre. */
export function oynatBolum(b: BolumTanimi, yerlesik: Iterable<string>, enCok = 20, hazirla?: (m: Motor) => void) {
  const m = new Motor(b, yerlesik);
  m.sifirla();
  hazirla?.(m);
  m.baslat();
  const olaylar: (Olay & { t: number })[] = [];
  while (!m.sonuc && m.zaman < enCok) {
    m.adim(1 / 60);
    for (const o of m.olaylar.splice(0)) olaylar.push({ ...o, t: Math.round(m.zaman * 100) / 100 });
  }
  return { sonuc: m.sonuc, sure: m.zaman, olaylar, top: { ...m.top }, dominolar: m.dominolar.ds.map((d) => ({ ...d })), motor: m };
}
