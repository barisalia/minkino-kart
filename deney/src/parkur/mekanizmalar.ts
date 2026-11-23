// Deneyler · Zincirleme Top Parkuru: parça türleri (motor.ts → Mekanizma). Her biri gerçek bir fizik fikrini gösterir:
// rampa (eğik düzlem), trambolin (esneklik), huni (dönerek iniş), kaykay (eylemsizlik: kaykay durur, top uçar), yay (gerilen
// yay fırlatır; az ya da çok germe ıskalatır), su değirmeni (akan su çarkı döndürür, kova topu kaldırır), körük ve balon
// (hava balonu şişirir, şişen balon iter). Bütün ölçüler fon pikseli; bölümlerin yerleşimi bolumler.ts'te.
import { G, TOP_R, atis, type Dogru, type Dunya, type Kutu, type Mekanizma, type Nokta, type Top } from './motor';

const R = TOP_R;

/** Yalnız yüzey veren parça: rampa, raf, köprü, takoz, oluk ve kalasın kendisi. */
export class YuzeyParca implements Mekanizma {
  constructor(readonly id: string, readonly kutu: Kutu, readonly cizgiler: readonly Dogru[]) {}
  yuzeyler() { return this.cizgiler; }
  sifirla() {}
}

/** Trambolin: aşağı inen top bezin hizasını geçince hedefe fırlar (esneyip geri iter). */
export class Trambolin implements Mekanizma {
  /** Son basılıştan beri geçen süre (sn; sıkışma görüntüsü). */
  basildi = 99;
  constructor(
    readonly id: string, readonly kutu: Kutu, readonly bez: Dogru, readonly yanlar: readonly Dogru[],
    readonly hedef: Nokta, readonly ucus: number,
  ) {}
  yuzeyler() { return this.yanlar; }
  adim(h: number) { this.basildi += h; }
  yakala(t: Top, oncekiY: number, d: Dunya) {
    const [a, b] = this.bez;
    if (t.vy > 0 && t.x >= a.x && t.x <= b.x && oncekiY + R <= a.y + 2 && t.y + R >= a.y) {
      t.y = a.y - R;
      const v = atis(t, this.hedef, this.ucus);
      t.vx = v.vx;
      t.vy = v.vy;
      this.basildi = 0;
      d.olay({ tur: 'boing' });
    }
    return false;
  }
  sifirla() { this.basildi = 99; }
}

/** Huni: yukarıdan inen top ağza girince iki buçuk tur daralan sarmalla döner, çıkıştan dik iner; kanal sağa taşır. */
export class Huni implements Mekanizma {
  static SURE = 0.62;
  private u: { t: number; y0: number; yon: number } | null = null;
  constructor(
    readonly id: string, readonly kutu: Kutu,
    readonly agiz: { y: number; sol: number; sag: number }, readonly cikis: { y: number; sol: number; sag: number },
    readonly kanal: Dogru, readonly ayak: Dogru,
  ) {}
  get orta() { return (this.cikis.sol + this.cikis.sag) / 2; }
  yuzeyler() { return [this.kanal, this.ayak]; }
  yakala(t: Top, _o: number, d: Dunya) {
    const A = this.agiz;
    if (t.vy > 0 && t.x > A.sol + 6 && t.x < A.sag - 6 && t.y + R > A.y && t.y < A.y + 40) {
      this.u = { t: 0, y0: t.y, yon: t.vx >= 0 ? 1 : -1 };
      d.olay({ tur: 'huni-gir' });
      return true;
    }
    return false;
  }
  tasi(t: Top, h: number, d: Dunya) {
    const u = this.u!;
    u.t += h;
    const s = Math.min(1, u.t / Huni.SURE);
    const faz = u.yon * Math.PI * 2 * 2.5 * s;
    const genlik = (this.agiz.sag - this.agiz.sol) / 2 - R - 8;
    t.x = this.orta + genlik * (1 - s) * Math.cos(faz + Math.PI);
    t.y = u.y0 + (this.cikis.y - R + 6 - u.y0) * s * s;
    t.olcek = 1 - 0.12 * (1 - s) * (0.5 - 0.5 * Math.cos(faz));
    t.aci += u.yon * 14 * h;
    if (s < 1) return false;
    t.olcek = 1;
    t.x = this.orta;
    t.vx = 0;
    t.vy = 280;
    this.u = null;
    d.olay({ tur: 'huni-cik' });
    return true;
  }
  sifirla() { this.u = null; }
}

/**
 * Kaykay: masada bekler. Top güvertesine inince kaykay topla birlikte sağa gider (yavaşlayarak). Takoz yerindeyse kaykay
 * takoza çarpıp durur, top eylemsizlikle uçar (boşluğun üstünden karşı masaya); takoz yoksa kaykay masanın ucundan
 * topla birlikte düşer (komik, kaçış). Beklerken arka yüzü ve güvertesi engeldir.
 */
export class Kaykay implements Mekanizma {
  x = 0;
  v = 0;
  durum: 'bekle' | 'gidiyor' | 'durdu' | 'dustu' = 'bekle';
  dusus = { y: 0, vy: 0, aci: 0 };
  private tasiyor = false;
  constructor(
    readonly id: string, readonly kutu: Kutu,
    /** Güverte üst yüzü (y) ve kutuya göre güvertenin solu/sağı. */
    readonly guverte: { y: number; sol: number; sag: number },
    /** Takozun kimliği ve kaykayın burnunun duracağı x (takozun sol yüzü). */
    readonly takoz: { id: string; x: number },
    /** Masanın ucu: takoz yoksa burnu buraya gelince düşer. */
    readonly masaUcu: number,
    /** Durunca topun uçuşu: iniş noktası ve süresi. */
    readonly ucus: { hedef: Nokta; sure: number },
    readonly yavaslama = 60,
  ) {}
  /** Güvertenin dünyadaki sol, sağ kenarı (o anki yer). */
  private sinir() { return { sol: this.kutu.x + this.x + this.guverte.sol, sag: this.kutu.x + this.x + this.guverte.sag }; }
  yuzeyler(): readonly Dogru[] {
    if (this.durum === 'dustu' || this.tasiyor) return [];
    const s = this.sinir(), y = this.guverte.y;
    // Arka yüz (topu durdurur) ve güverte.
    return [[{ x: s.sol, y }, { x: s.sag, y }], [{ x: s.sol - 4, y: y + 4 }, { x: s.sol - 4, y: this.kutu.y + this.kutu.h }]];
  }
  yakala(t: Top, _o: number, d: Dunya) {
    if (this.durum !== 'bekle') return false;
    const s = this.sinir();
    if (t.x > s.sol + 6 && t.x < s.sag - 6 && t.y + R >= this.guverte.y - 2 && t.y < this.guverte.y && t.vy >= 0) {
      this.durum = 'gidiyor';
      this.tasiyor = true;
      this.v = Math.max(260, Math.hypot(t.vx, t.vy) * 0.78);
      t.y = this.guverte.y - R;
      d.olay({ tur: 'kaykay-bin' });
      return true;
    }
    return false;
  }
  tasi(t: Top, h: number, d: Dunya) {
    if (this.durum === 'gidiyor' || this.durum === 'dustu') {
      // Top güvertenin ortasının biraz önünde, kaykayla gider ve döner.
      const s = this.sinir();
      t.x = (s.sol + s.sag) / 2 + 10;
      t.y = this.durum === 'dustu' ? this.dusus.y + this.guverte.y - R : this.guverte.y - R;
      t.vx = this.durum === 'dustu' ? this.v * 0.15 : this.v;
      t.vy = this.durum === 'dustu' ? this.dusus.vy : 0;
      t.aci += (this.v / R) * h;
      if (this.durum === 'dustu' && this.dusus.y > 130) { this.tasiyor = false; return true; }
      return false;
    }
    if (this.durum === 'durdu') {
      // Kaykay takoza çarptı: top yoluna devam eder (eylemsizlik), karşı masaya uçar.
      const v = atis(t, this.ucus.hedef, this.ucus.sure);
      t.vx = v.vx;
      t.vy = v.vy;
      this.tasiyor = false;
      d.olay({ tur: 'ucus' });
      return true;
    }
    return false;
  }
  adim(h: number, d: Dunya) {
    if (this.durum === 'gidiyor') {
      this.v = Math.max(120, this.v - this.yavaslama * h);
      this.x += this.v * h;
      const burun = this.kutu.x + this.x + this.kutu.w;
      if (d.var(this.takoz.id) && burun >= this.takoz.x) {
        this.x -= burun - this.takoz.x;
        this.durum = 'durdu';
        d.olay({ tur: 'kaykay-dur' });
      } else if (burun >= this.masaUcu + this.kutu.w * 0.5) {
        this.durum = 'dustu';
        d.olay({ tur: 'kaykay-dus' });
      }
    } else if (this.durum === 'dustu') {
      this.dusus.vy += G * h;
      this.dusus.y += this.dusus.vy * h;
      this.dusus.aci += 2.2 * h;
      this.x += this.v * 0.5 * h;
    }
  }
  mesgul() { return this.durum === 'gidiyor'; }
  sifirla() { this.x = 0; this.v = 0; this.durum = 'bekle'; this.tasiyor = false; this.dusus = { y: 0, vy: 0, aci: 0 }; }
}

/**
 * Yay: kabına düşen top yayı sıkıştırır (0,3 sn), yay açılınca top hedefe fırlar. Germe (güç) 1 az, 2 orta, 3 çok: ortada
 * top rafa iner; azda yetişemez geri düşer, çokta rafı aşıp duvara çarpar (komik). Kap: üstten açık, iki yanı yüzey.
 */
export class Yay implements Mekanizma {
  guc: 1 | 2 | 3 = 2;
  bas = 0;
  /** Bu koşuda kaç kez fırlattı: az germede top kaba geri düşer; üçüncüde yay yorulur, top kapta kalır. */
  atislar = 0;
  private u: { t: number; x0: number; y0: number } | null = null;
  constructor(
    readonly id: string, readonly kutu: Kutu,
    /** Kabın içi: sol, sağ ve dibi (topun merkezinin ineceği y). */
    readonly kap: { sol: number; sag: number; dip: number },
    /** Orta germede iniş noktası ve süresi; az ve çok bunun ölçeği. */
    readonly hedef: Nokta, readonly sure: number,
    readonly olcekler: Record<1 | 2 | 3, number> = { 1: 0.68, 2: 1, 3: 1.5 },
  ) {}
  yuzeyler(): readonly Dogru[] {
    const k = this.kap, ust = k.dip - 55;
    const govde = this.kutu.x + 6, zemin = this.kutu.y + this.kutu.h;
    return [
      [{ x: k.sol - R, y: ust }, { x: k.sol - R, y: k.dip + R }], [{ x: k.sag + R, y: ust }, { x: k.sag + R, y: k.dip + R }],
      [{ x: govde, y: k.dip + R }, { x: govde, y: zemin }],
    ];
  }
  yakala(t: Top, _o: number, d: Dunya) {
    const k = this.kap;
    if (!this.u && this.atislar < 3 && t.vy > 0 && t.x >= k.sol - 4 && t.x <= k.sag + 4 && t.y >= k.dip - 6) {
      this.u = { t: 0, x0: t.x, y0: k.dip };
      t.y = k.dip;
      d.olay({ tur: 'yay-bas' });
      return true;
    }
    return false;
  }
  tasi(t: Top, h: number, d: Dunya) {
    const u = this.u!;
    u.t += h;
    const s = Math.min(1, u.t / 0.3);
    this.bas = Math.sin(Math.min(1, s) * Math.PI / 2);
    t.x = u.x0 + ((this.kap.sol + this.kap.sag) / 2 - u.x0) * s;
    t.y = u.y0 + 18 * this.bas;
    t.vx = 0; t.vy = 0;
    if (s < 1) return false;
    const c = (this.kap.sol + this.kap.sag) / 2;
    const o = this.olcekler[this.guc];
    const hedef = { x: c + (this.hedef.x - c) * o, y: this.hedef.y - (o - 1) * 40 };
    const v = atis(t, hedef, this.sure * Math.sqrt(o));
    t.vx = v.vx;
    t.vy = v.vy;
    this.bas = 0;
    this.u = null;
    this.atislar++;
    d.olay({ tur: 'yay-firlat', guc: this.guc });
    return true;
  }
  mesgul() { return !!this.u; }
  sifirla() { this.u = null; this.bas = 0; this.atislar = 0; }
}

/** Musluk kolu: top çarpınca kol devrilir, depodan su akar (oluk varsa çarka, yoksa masaya taşar). Sabit parça. */
export class Musluk implements Mekanizma {
  acik = false;
  t = 0;
  constructor(readonly id: string, readonly kutu: Kutu, readonly kol: Dogru, readonly olukId: string) {}
  yuzeyler() { return this.acik ? [] : [this.kol]; }
  adim(h: number, d: Dunya) {
    if (!this.acik) {
      const t = d.top, [a, b] = this.kol;
      if (t.mod === 'serbest' && t.x + R >= a.x - 8 && t.x - R <= b.x + 4 && t.y + R >= Math.min(a.y, b.y) && t.vx > 20) {
        this.acik = true;
        this.t = 0;
        d.olay({ tur: 'musluk' });
      }
      return;
    }
    const once = this.t;
    this.t += h;
    if (once < 0.3 && this.t >= 0.3) d.olay(d.var(this.olukId) ? { tur: 'su' } : { tur: 'su-tasti' });
  }
  mesgul() { return this.acik && this.t < 0.6; }
  /** Su çarka akıyor mu (açıldıktan 0,3 sn sonra, oluk yerindeyse). */
  akiyor(d: Dunya) { return this.acik && this.t >= 0.3 && d.var(this.olukId); }
  sifirla() { this.acik = false; this.t = 0; }
}

/**
 * Su değirmeni: oluktan dökülen su sağdaki kanatlara çarpar, çark saat yönünde döner. Alttaki kovaya giren top yukarı taşınır,
 * tepede kova eğilince top sağdaki yüksek kanala yuvarlanır. Su yoksa çark durur, top kovada kalır (kaçış).
 */
export class Degirmen implements Mekanizma {
  aci = 0;
  w = 0;
  private kova = -1;
  private bekle = 0;
  constructor(
    readonly id: string, readonly kutu: Kutu, readonly merkez: Nokta, readonly yaricap: number,
    readonly kovaSayisi: number, readonly musluk: Musluk,
    /** Tepedeki bırakış: topun bırakılacağı açı (radyan, 0 sağ, saat yönü artı) ve bırakış hızı. */
    readonly birakis: { aci: number; vx: number; vy: number },
    readonly hiz = 1.6,
  ) {}
  /** k. kovanın açısı (en alttan başlar: π/2). */
  kovaAcisi(k: number) { return Math.PI / 2 + this.aci + (k * 2 * Math.PI) / this.kovaSayisi; }
  kovaYeri(k: number): Nokta {
    const a = this.kovaAcisi(k);
    return { x: this.merkez.x + this.yaricap * Math.cos(a), y: this.merkez.y + this.yaricap * Math.sin(a) };
  }
  yuzeyler(): readonly Dogru[] {
    // Çarkın ayakları ve alttaki kovanın arka duvarı (top kovanın içine yuvarlanıp durur).
    const alt = { x: this.merkez.x, y: this.merkez.y + this.yaricap };
    return [[{ x: alt.x + 34, y: alt.y - 60 }, { x: alt.x + 34, y: alt.y + 40 }]];
  }
  yakala(t: Top, _o: number, d: Dunya) {
    if (this.kova >= 0) return false;
    // En alttaki kovaya en yakın kova.
    let en = -1, uz = 1e9;
    for (let k = 0; k < this.kovaSayisi; k++) {
      const p = this.kovaYeri(k);
      const u = Math.hypot(t.x - p.x, t.y - (p.y - R + 8));
      if (u < uz) { uz = u; en = k; }
    }
    if (uz < 36 && Math.sin(this.kovaAcisi(en)) > 0.85) {
      this.kova = en;
      this.bekle = 0;
      d.olay({ tur: 'kova-al' });
      return true;
    }
    return false;
  }
  tasi(t: Top, h: number, d: Dunya) {
    const p = this.kovaYeri(this.kova);
    t.x = p.x;
    t.y = p.y - R + 8;
    t.vx = 0; t.vy = 0;
    t.aci += this.w * h;
    this.bekle += h;
    // Kova tepeyi geçip bırakış açısına gelince top kanala.
    const a = ((this.kovaAcisi(this.kova) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const hedef = ((this.birakis.aci % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    if (this.w > 0 && Math.abs(a - hedef) < this.w * h * 1.5 + 0.02) {
      t.vx = this.birakis.vx;
      t.vy = this.birakis.vy;
      this.kova = -1;
      d.olay({ tur: 'kova-birak' });
      return true;
    }
    return false;
  }
  adim(h: number, d: Dunya) {
    const hedefW = this.musluk.akiyor(d) && d.var(this.id) ? this.hiz : 0;
    this.w += (hedefW - this.w) * Math.min(1, h * 2.5);
    this.aci += this.w * h;
  }
  mesgul() { return this.w > 0.2 && this.kova >= 0; }
  takili() { return this.kova >= 0 && this.w < 0.05; }
  sifirla() { this.aci = 0; this.w = 0; this.kova = -1; this.bekle = 0; }
}

/**
 * Körük ve balon: yuvarlanan top körüğün pedalına basar; hortum yerindeyse hava balona gider, balon şişip ilk dominoyu iter.
 * Hortum ya da balon yoksa hava "fısss" diye kaçar (komik), zincir durur.
 */
export class Koruk implements Mekanizma {
  basildi = false;
  t = 0;
  /** Balonun şişkinliği 0…1. */
  sisme = 0;
  private itti = false;
  constructor(
    readonly id: string, readonly kutu: Kutu,
    /** Pedalın üst yüzü (topun basacağı yer) ve pedalın sağındaki durdurucu duvar. */
    readonly pedal: Dogru, readonly duvar: Dogru,
    readonly hortumId: string, readonly balonId: string,
    /** Balon tam şişince dominoya değer (şişkinlik eşiği). */
    readonly itmeEsigi = 0.82,
    readonly sure = 1.3,
  ) {}
  yuzeyler(): readonly Dogru[] { return [this.basildi ? [{ x: this.pedal[0].x, y: this.pedal[0].y + 14 }, { x: this.pedal[1].x, y: this.pedal[1].y + 14 }] : this.pedal, this.duvar]; }
  adim(h: number, d: Dunya) {
    if (!this.basildi) {
      const t = d.top, [a, b] = this.pedal;
      if (t.mod === 'serbest' && t.x >= a.x && t.x <= b.x && t.y + R >= a.y - 3 && t.y < a.y) {
        this.basildi = true;
        this.t = 0;
        d.olay({ tur: 'koruk' });
        d.olay(d.var(this.hortumId) && d.var(this.balonId) ? { tur: 'balon-sisir' } : { tur: 'hava-kacti' });
      }
      return;
    }
    this.t += h;
    if (d.var(this.hortumId) && d.var(this.balonId)) {
      this.sisme = Math.min(1, this.t / this.sure);
      if (!this.itti && this.sisme >= this.itmeEsigi) {
        this.itti = true;
        d.olay({ tur: 'balon-it' });
        d.dominolar.it(0, 3.2, d);
      }
    }
  }
  mesgul() { return this.basildi && this.t < this.sure + 0.2; }
  sifirla() { this.basildi = false; this.t = 0; this.sisme = 0; this.itti = false; }
}
