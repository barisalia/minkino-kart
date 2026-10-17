/**
 * Sayfa resmi ve canlanan anlar (Sahne).
 *
 * Katman yöntemi (ekip/antigravity/KITAP-DOSYA-ADLARI.md): zemin (hareketli karakterler silinmiş sahne) + her hareketli
 * katmanın hareket sayfasından kesilmiş pozları (aynı ölçek, aynı taban çizgisi) + küçük parça dizileri (kuyruk, kulak).
 * Hareket: poz değişimi, ezilme-esneme, kayma. Döndürme yok.
 *
 * Resim yokken sade yer tutucu: düz renk, sayfa numarası, kısa tarif; katmanlar adı yazan düz kutular (aynı dokunma
 * ve hareketle). Kodla süslü çizim yok.
 *
 * Kare kare: bütün hareket transform/opacity ile (GPU), resimler önceden yüklenir, poz değişimi yalnız `hidden`.
 */
import { efekt } from '../../src/audio/ses';
import type { Adim, CanliAn, Efekt, KatmanTanim, Kim, Kutu, SayfaCanli } from './tipler';
import { sayfaAnahtari, type KitapVarliklari, type YerlesimKatman } from './varlik';
import { VARSAYILAN_KAYNAK } from './yerlesim';

/** Boşta bu kadar kalınca bulunmamış bir şey çok hafif kıpırdar (Barış: "şuna dokun" yok, ipucu geç ve dolaylı) */
export const IPUCU_MS = 20_000;
/** Uğur böceğinin eni (resmin oranı; kitap.css .kt-ugur ile aynı) */
const UGUR_BOY = 0.1;

const yuzde = (v: number) => `${(v * 100).toFixed(3)}%`;
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

interface Katman {
  t: KatmanTanim;
  dis: HTMLElement;
  ic: HTMLElement;
  pozlar: HTMLElement[];
  parcalar: Map<string, HTMLElement[]>;
  kutu: Kutu;
  poz: number;
  mesgul: number;
}

export interface SahneSecenek {
  /** Sayfa numarası (0 = kapak) */
  no: number;
  renk: string;
  tarif: string;
  /** Kapak: yer tutucuda numara yerine yazılır */
  etiket?: string;
  canli?: SayfaCanli;
  varlik: KitapVarliklari;
  /** Karakter sözü (kitabın kaydıyla; kayıt yoksa sessiz): okuma sürerken söylenmez; söylendiyse true */
  soz?: (kim: Kim, metin: string) => void;
  /** Bir an ya da uğur böceği ilk kez bulundu */
  bulundu?: (id: string) => void;
}

const EFEKT_KARE: Record<Efekt, { k: Keyframe[]; ms: number; easing?: string }> = {
  ez: { k: [{ transform: 'scale(1,1)' }, { transform: 'scale(1.1,0.88)' }, { transform: 'scale(0.97,1.04)' }, { transform: 'scale(1,1)' }], ms: 380 },
  esne: { k: [{ transform: 'scale(1,1)' }, { transform: 'scale(0.92,1.1)' }, { transform: 'scale(1.03,0.97)' }, { transform: 'scale(1,1)' }], ms: 420 },
  zipla: {
    k: [
      { transform: 'translateY(0) scale(1.06,0.92)', offset: 0 },
      { transform: 'translateY(-16%) scale(0.95,1.07)', offset: 0.4 },
      { transform: 'translateY(0) scale(1.08,0.9)', offset: 0.8 },
      { transform: 'translateY(0) scale(1,1)', offset: 1 },
    ],
    ms: 480,
  },
  nefes: { k: [{ transform: 'scale(1,1)' }, { transform: 'scale(1.015,1.04)' }, { transform: 'scale(1,1)' }], ms: 1600, easing: 'ease-in-out' },
  salla: { k: [{ transform: 'translateX(0)' }, { transform: 'translateX(-3%)' }, { transform: 'translateX(3%)' }, { transform: 'translateX(0)' }], ms: 420 },
  kipir: { k: [{ transform: 'scale(1,1)' }, { transform: 'scale(1.035,0.97)' }, { transform: 'scale(0.99,1.02)' }, { transform: 'scale(1,1)' }], ms: 320 },
};

export class Sahne {
  readonly el: HTMLElement;
  private tuval: HTMLElement;
  private katmanlar = new Map<string, Katman>();
  private ugurEl: HTMLElement;
  private ugurKareler: HTMLElement[] = [];
  private zamanlayicilar: number[] = [];
  private calisiyor = false;
  private iptal = 0;
  private sira = new Map<string, number>();
  private sonEtkilesim = performance.now();
  private ipucuSayaci = 0;
  readonly bulunan = new Set<string>();
  /** Resim (zemin) geldi mi; yoksa yer tutucu */
  readonly resimli: boolean;
  /** Sayfa resminin eni / boyu (resim yoksa yer tutucu kare) */
  readonly oran: number;
  /** Yalnız tam sayfa resmi var (zemin/poz katmanı yok): anlar hafif efektle oynar */
  readonly tamSayfa: boolean;
  private parilti: HTMLElement | null = null;
  private parcaciklar: HTMLElement[] = [];
  private parcacikSira = 0;
  private sonTamDokunus = new Map<string, number>();
  /** Okuma sürüyor mu (ipucu ve söz beklesin) */
  okumaSuruyor: () => boolean = () => false;

  constructor(private o: SahneSecenek) {
    const anahtar = sayfaAnahtari(o.no);
    const y = o.varlik.yerlesim.sayfalar[anahtar];
    const zemin = o.varlik.url(y?.zemin) ?? o.varlik.url(y?.tam);
    this.resimli = !!zemin;
    // resim yokken yer tutucu, gelecek çizimin oranında (16:9)
    this.oran = zemin ? (y?.boy ? y.boy[0] / y.boy[1] : 1) : VARSAYILAN_KAYNAK[0] / VARSAYILAN_KAYNAK[1];
    this.tamSayfa = !!y?.tam && !y?.zemin && !!zemin;
    this.tuval = document.createElement('div');
    this.tuval.className = 'kt-tuval';
    this.el = document.createElement('div');
    this.el.className = 'kt-resim';
    this.el.dataset.sayfa = anahtar;
    this.el.append(this.tuval);
    if (zemin) {
      const i = new Image();
      i.className = 'kt-zemin';
      i.alt = '';
      i.decoding = 'async';
      i.draggable = false;
      i.src = zemin;
      this.tuval.append(i);
    } else {
      // yer tutucu: düz renk, sayfa numarası, kısa tarif
      this.tuval.style.background = o.renk;
      const yt = document.createElement('div');
      yt.className = 'kt-yertutucu';
      const no = document.createElement('div');
      no.className = 'kt-yt-no';
      no.textContent = o.etiket ?? String(o.no);
      const tarif = document.createElement('div');
      tarif.className = 'kt-yt-tarif';
      tarif.textContent = o.tarif;
      yt.append(no, tarif);
      this.tuval.append(yt);
    }
    // canlı katmanlar yalnız zemin varken resimli; tam resim (zemin yok) gelmişse karakterler zaten resimde
    const canliKatman = !y?.tam || !!y?.zemin;
    for (const t of o.canli?.katmanlar ?? []) {
      if (!canliKatman) continue;
      this.katmanKur(t, y?.katmanlar);
    }
    if (this.tamSayfa) {
      this.tamKur();
      this.ugurEl = this.ugurKur(o.canli?.tam?.ugur ?? o.canli?.ugur, true);
      return;
    }
    for (const [ad, k] of Object.entries(o.canli?.bolgeler ?? {})) {
      const b = document.createElement('div');
      b.className = 'kt-bolge';
      b.dataset.bolge = ad;
      Object.assign(b.style, { left: yuzde(k[0]), top: yuzde(k[1]), width: yuzde(k[2]), height: yuzde(k[3]) });
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        this.dokunuldu(`bolge:${ad}`);
      });
      this.tuval.append(b);
    }
    this.ugurEl = this.ugurKur(y?.ugur ?? o.canli?.ugur);
  }

  private katmanKur(t: KatmanTanim, yer?: Record<string, YerlesimKatman>) {
    const kaynak = t.kaynak ? yer?.[t.kaynak[0]] : yer?.[t.id];
    const resimler = (kaynak?.pozlar ?? []).map((a) => this.o.varlik.url(a));
    const tumu = t.kaynak ? [resimler[t.kaynak[1] - 1] ?? null] : resimler;
    const resimli = tumu.length > 0 && tumu.every(Boolean);
    let kutu: Kutu = t.yer;
    if (resimli && kaynak?.kutu && !t.yerSabit) kutu = kaynak.kutu;
    const dis = document.createElement('div');
    dis.className = 'kt-katman';
    dis.dataset.katman = t.id;
    const ic = document.createElement('div');
    ic.className = 'kt-katman-ic';
    dis.append(ic);
    const k: Katman = { t, dis, ic, pozlar: [], parcalar: new Map(), kutu, poz: t.ana ?? 1, mesgul: 0 };
    if (resimli) {
      for (const u of tumu) {
        const i = new Image();
        i.className = 'kt-poz';
        i.alt = '';
        i.draggable = false;
        i.decoding = 'async';
        i.src = u!;
        ic.append(i);
        k.pozlar.push(i);
      }
      // parçalar pozun ARKASINDA (kuyruk/kulak kökü gövdenin arkasına girer)
      for (const [ad, p] of Object.entries(kaynak?.parcalar ?? {})) {
        const kap = document.createElement('div');
        kap.className = 'kt-parca';
        kap.dataset.parca = ad;
        Object.assign(kap.style, { left: yuzde(p.kutu[0]), top: yuzde(p.kutu[1]), width: yuzde(p.kutu[2]), height: yuzde(p.kutu[3]) });
        const kareler = p.kareler.map((a) => {
          const i = new Image();
          i.alt = '';
          i.draggable = false;
          i.src = this.o.varlik.url(a) ?? '';
          i.hidden = true;
          kap.append(i);
          return i;
        });
        ic.prepend(kap);
        k.parcalar.set(ad, kareler);
      }
    } else {
      const yt = document.createElement('div');
      yt.className = 'kt-katman-yt';
      yt.textContent = t.ad;
      ic.append(yt);
      dis.classList.add('kt-yt');
    }
    Object.assign(dis.style, { left: yuzde(kutu[0]), top: yuzde(kutu[1]), width: yuzde(kutu[2]), height: yuzde(kutu[3]) });
    if (t.gizli) dis.classList.add('kt-gizli');
    if (!t.dokunulmaz)
      dis.addEventListener('click', (e) => {
        e.stopPropagation();
        this.dokunuldu(t.id);
      });
    else dis.classList.add('kt-dokunulmaz');
    this.katmanlar.set(t.id, k);
    this.pozGoster(k, k.poz);
    for (const p of t.hep ?? []) this.parcaGoster(k, p, 1);
    this.tuval.append(dis);
  }

  /** Tam sayfa: çizimdeki karakterlerin üstünde görünmez dokunma bölgeleri ve parıltı katmanı */
  private tamKur() {
    for (const [hedef, kk] of Object.entries(this.o.canli?.tam?.yerler ?? {})) {
      const kutular = (Array.isArray(kk[0]) ? kk : [kk]) as Kutu[];
      for (const k of kutular) {
        const b = document.createElement('div');
        b.className = 'kt-bolge kt-tam-bolge';
        b.dataset.hedef = hedef;
        Object.assign(b.style, { left: yuzde(k[0]), top: yuzde(k[1]), width: yuzde(k[2]), height: yuzde(k[3]) });
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          this.tamDokun(hedef, e);
        });
        this.tuval.append(b);
      }
    }
    const p = document.createElement('div');
    p.className = 'kt-parilti';
    p.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 18; i++) {
      const s = document.createElement('i');
      p.append(s);
      this.parcaciklar.push(s);
    }
    this.tuval.append(p);
    this.parilti = p;
  }

  /** Parıltı: noktadan saçılan küçük yıldızlar (transform/opacity) */
  private parilda(x: number, y: number, adet = 7, buyuk = 1) {
    if (!this.parilti) return;
    const w = this.tuval.clientWidth || 1;
    for (let i = 0; i < adet; i++) {
      const s = this.parcaciklar[this.parcacikSira++ % this.parcaciklar.length];
      const a = (i / adet) * Math.PI * 2 + Math.random() * 0.6;
      const d = w * (0.05 + Math.random() * 0.05) * buyuk;
      const b = (0.6 + Math.random() * 0.6) * buyuk;
      s.getAnimations().forEach((q) => q.cancel());
      s.style.left = `${x}px`;
      s.style.top = `${y}px`;
      s.animate(
        [
          { transform: 'translate(-50%, -50%) scale(0.2)', opacity: 0 },
          { transform: `translate(calc(-50% + ${(Math.cos(a) * d * 0.45).toFixed(1)}px), calc(-50% + ${(Math.sin(a) * d * 0.45).toFixed(1)}px)) scale(${b.toFixed(2)})`, opacity: 1, offset: 0.35 },
          { transform: `translate(calc(-50% + ${(Math.cos(a) * d).toFixed(1)}px), calc(-50% + ${(Math.sin(a) * d).toFixed(1)}px)) scale(0.1)`, opacity: 0 },
        ],
        { duration: 650 + Math.random() * 200, easing: 'ease-out' },
      );
    }
  }

  /** Tam sayfada bir ana dokunuldu: parıltı + ses (+ karakter sözü) + resmin ufak sekmesi; karakter kesilmez */
  private tamDokun(hedef: string, e: MouseEvent) {
    this.etkilesim();
    const an = (this.o.canli?.anlar ?? []).find((a) => a.dokun.includes(hedef));
    const r = this.tuval.getBoundingClientRect();
    const sx = r.width / (this.tuval.offsetWidth || r.width || 1);
    const x = (e.clientX - r.left) / (sx || 1);
    const y = (e.clientY - r.top) / (sx || 1);
    this.parilda(x, y);
    if (!an || !this.calisiyor) return;
    const simdi = performance.now();
    if (simdi - (this.sonTamDokunus.get(an.id) ?? -1e9) < 450) return;
    this.sonTamDokunus.set(an.id, simdi);
    if (!this.bulunan.has(an.id)) {
      this.bulunan.add(an.id);
      this.o.bulundu?.(an.id);
    }
    let adimlar = an.adimlar;
    if (an.sirali) {
      const i = this.sira.get(an.id) ?? 0;
      adimlar = an.sirali[i % an.sirali.length];
      this.sira.set(an.id, i + 1);
    }
    const ses = adimlar.find((a) => a.efekt)?.efekt ?? (adimlar.some((a) => a.ef === 'ez') ? 'pof' : adimlar.some((a) => a.ef === 'zipla' || a.ef === 'esne') ? 'sicrama' : 'tink');
    efekt[ses]?.();
    const soz = adimlar.find((a) => a.soz)?.soz;
    if (soz) this.o.soz?.(soz.kim, soz.metin);
    this.el.dataset.oynayan = an.id;
    this.el.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-2.2%)' }, { transform: 'translateY(0)' }, { transform: 'translateY(-0.7%)' }, { transform: 'translateY(0)' }], { duration: 420, easing: 'ease-out' });
  }

  private ugurKur(yer?: [number, number], cizili = false): HTMLElement {
    const u = document.createElement('button');
    u.type = 'button';
    u.className = cizili ? 'kt-ugur kt-ugur-cizili' : 'kt-ugur';
    u.setAttribute('aria-label', 'Uğur böceği');
    const [x, y] = yer ?? [0.5, 0.05];
    Object.assign(u.style, { left: yuzde(x), top: yuzde(y) });
    if (cizili) {
      // uğur böceği çizimin içinde: yalnız dokunma alanı (görünmez), dokununca parıltı
      u.addEventListener('click', (e) => {
        e.stopPropagation();
        this.etkilesim();
        if (!this.bulunan.has('ugur')) {
          this.bulunan.add('ugur');
          this.o.bulundu?.('ugur');
        }
        efekt.tink();
        this.parilda(u.offsetLeft + u.offsetWidth / 2, u.offsetTop + u.offsetHeight / 2, 9, 0.7);
      });
      this.tuval.append(u);
      return u;
    }
    const kareler = (this.o.varlik.yerlesim.ugur ?? []).map((a) => this.o.varlik.url(a));
    if (kareler.length && kareler.every(Boolean)) {
      for (const a of kareler) {
        const i = new Image();
        i.alt = '';
        i.draggable = false;
        i.src = a!;
        i.hidden = this.ugurKareler.length > 0;
        u.append(i);
        this.ugurKareler.push(i);
      }
    } else u.classList.add('kt-ugur-yt');
    u.addEventListener('click', (e) => {
      e.stopPropagation();
      void this.ugurKanat();
    });
    this.tuval.append(u);
    return u;
  }

  /** Tuval boyu: çizim oranıyla sığar (kırpılmaz); resim yoksa yer tutucu alanı kaplar */
  boyutla(w: number, h: number) {
    if (this.resimli) {
      // çizim kırpılmaz, oranıyla sığar (resim alanı zaten çizimin oranında: kitapOlcusu)
      const tw = Math.min(w, h * this.oran);
      const th = tw / this.oran;
      Object.assign(this.tuval.style, { width: `${tw}px`, height: `${th}px`, left: `${(w - tw) / 2}px`, top: `${(h - th) / 2}px`, fontSize: `${tw / 100}px` });
      return;
    }
    // yer tutucu: resim alanını kırpmadan kaplar (numara ve tarif hep görünür)
    Object.assign(this.tuval.style, { width: `${w}px`, height: `${h}px`, left: '0px', top: '0px', fontSize: `${Math.min(w, h * this.oran) / 100}px` });
  }

  baslat() {
    if (this.calisiyor) return;
    this.calisiyor = true;
    const benim = ++this.iptal;
    this.sonEtkilesim = performance.now();
    for (const an of this.o.canli?.anlar ?? []) {
      if (an.acilista) void this.oynat(an, benim, true);
      if (an.bosta) this.bostaKur(an, benim);
    }
    this.zamanlayicilar.push(window.setInterval(() => this.ipucuBak(), 1000));
  }

  durdur() {
    this.calisiyor = false;
    this.iptal++;
    for (const z of this.zamanlayicilar) clearTimeout(z), clearInterval(z);
    this.zamanlayicilar = [];
    for (const k of this.katmanlar.values()) {
      k.mesgul = 0;
      k.ic.getAnimations().forEach((a) => a.cancel());
      k.dis.style.transform = '';
      k.dis.style.transition = '';
      k.dis.classList.toggle('kt-gizli', !!k.t.gizli);
      this.pozGoster(k, k.t.ana ?? 1);
      for (const [ad] of k.parcalar) this.parcaGoster(k, ad, (k.t.hep ?? []).includes(ad) ? 1 : 0);
    }
    this.ugurEl.style.transform = '';
    this.sira.clear();
  }

  /** Kitaptan: çocuk dokundu / sürükledi (ipucu sayacı baştan) */
  etkilesim() {
    this.sonEtkilesim = performance.now();
  }

  private bostaKur(an: CanliAn, benim: number) {
    const sonraki = () => {
      if (benim !== this.iptal) return;
      const z = window.setTimeout(() => {
        if (benim !== this.iptal) return;
        if (!this.anMesgul(an)) void this.oynat(an, benim, true);
        sonraki();
      }, an.bosta! * (0.75 + Math.random() * 0.5));
      this.zamanlayicilar.push(z);
    };
    sonraki();
  }

  private anKatmanlari(an: CanliAn): Katman[] {
    const adimlar = an.sirali ? an.sirali.flat() : an.adimlar;
    const ids = new Set(adimlar.map((a) => a.k).filter((k): k is string => !!k && k !== 'ugur'));
    return [...ids].map((id) => this.katmanlar.get(id)).filter((k): k is Katman => !!k);
  }

  private anMesgul(an: CanliAn) {
    return this.anKatmanlari(an).some((k) => k.mesgul > 0);
  }

  /** Bir katmana ya da bölgeye dokunuldu */
  dokunuldu(hedef: string) {
    this.etkilesim();
    if (!this.calisiyor) return;
    const an = (this.o.canli?.anlar ?? []).find((a) => a.dokun.includes(hedef));
    if (!an) return;
    if (this.anMesgul(an)) {
      // oynarken yeniden dokunmak: çok küçük bir kıpırtı (cevap var ama sahne bozulmaz)
      const k = this.katmanlar.get(hedef);
      if (k) this.efektOyna(k, 'kipir');
      return;
    }
    if (!this.bulunan.has(an.id)) {
      this.bulunan.add(an.id);
      this.o.bulundu?.(an.id);
    }
    void this.oynat(an, this.iptal, false);
  }

  private async oynat(an: CanliAn, benim: number, kendiliginden: boolean) {
    let adimlar = an.adimlar;
    if (an.sirali) {
      if (kendiliginden) return;
      const i = this.sira.get(an.id) ?? 0;
      adimlar = an.sirali[i % an.sirali.length];
      this.sira.set(an.id, i + 1);
    }
    const kat = this.anKatmanlari(an);
    kat.forEach((k) => k.mesgul++);
    try {
      for (const a of adimlar) {
        if (benim !== this.iptal) return;
        this.adimUygula(a);
        if (!a.birlikte) await bekle(a.ms ?? 0);
      }
    } finally {
      kat.forEach((k) => (k.mesgul = Math.max(0, k.mesgul - 1)));
    }
  }

  private adimUygula(a: Adim) {
    if (a.efekt) efekt[a.efekt]?.();
    if (a.soz) this.o.soz?.(a.soz.kim, a.soz.metin);
    if (!a.k) return;
    if (a.k === 'ugur') {
      if (a.kay) this.kaydir(this.ugurEl, a.kay, a.ms ?? 300, UGUR_BOY);
      return;
    }
    const k = this.katmanlar.get(a.k);
    if (!k) return;
    if (a.gor !== undefined) k.dis.classList.toggle('kt-gizli', !a.gor);
    if (a.poz) this.pozGoster(k, a.poz);
    if (a.parca) this.parcaGoster(k, a.parca[0], a.parca[1]);
    if (a.kay) this.kaydir(k.dis, a.kay, a.ms ?? 300, k.kutu[2], k.kutu[3]);
    if (a.ef) this.efektOyna(k, a.ef);
  }

  /** Kayma: resmin oranı → öğenin kendi boyunun yüzdesi (ekran boyu değişse de doğru) */
  private kaydir(el: HTMLElement, [dx, dy]: [number, number], ms: number, w: number, h = w) {
    el.style.transition = `transform ${ms}ms cubic-bezier(.3,.7,.4,1)`;
    el.style.transform = dx || dy ? `translate(${((dx / w) * 100).toFixed(2)}%, ${((dy / h) * 100).toFixed(2)}%)` : '';
  }

  private efektOyna(k: Katman, ef: Efekt) {
    const e = EFEKT_KARE[ef];
    k.ic.animate(e.k, { duration: e.ms, easing: e.easing ?? 'ease-out' });
  }

  private pozGoster(k: Katman, poz: number) {
    k.poz = poz;
    k.dis.dataset.poz = String(poz);
    k.pozlar.forEach((p, i) => (p.hidden = i !== poz - 1));
  }

  private parcaGoster(k: Katman, ad: string, kare: number) {
    k.dis.dataset[`parca${ad.replace(/-./g, (m) => m[1].toUpperCase()).replace(/^./, (m) => m.toUpperCase())}`] = String(kare);
    const kareler = k.parcalar.get(ad);
    if (!kareler) return;
    kareler.forEach((p, i) => (p.hidden = i !== kare - 1));
  }

  private async ugurKanat() {
    this.etkilesim();
    if (!this.bulunan.has('ugur')) {
      this.bulunan.add('ugur');
      this.o.bulundu?.('ugur');
    }
    efekt.tink();
    if (this.ugurKareler.length) {
      for (const i of [1, 2, 3, 2, 3, 1, 0]) {
        this.ugurKareler.forEach((k, j) => (k.hidden = j !== i));
        await bekle(90);
      }
    } else this.ugurEl.animate([{ transform: 'scale(1,1)' }, { transform: 'scale(1.5,0.8)' }, { transform: 'scale(1,1)' }, { transform: 'scale(1.5,0.8)' }, { transform: 'scale(1,1)' }], { duration: 520 });
  }

  /** 20 sn hiçbir şey yapılmadıysa bulunmamış bir şey bir kez, çok hafif kıpırdar (yönlendirme yok) */
  private ipucuBak() {
    if (!this.calisiyor || this.okumaSuruyor()) {
      this.sonEtkilesim = Math.max(this.sonEtkilesim, performance.now() - IPUCU_MS + 4000);
      return;
    }
    if (performance.now() - this.sonEtkilesim < IPUCU_MS) return;
    this.sonEtkilesim = performance.now();
    if (this.tamSayfa) {
      // tam sayfa: bulunmamış bir anın bölgesinde birkaç küçük parıltı (yönlendirme yok)
      const yerler = this.o.canli?.tam?.yerler ?? {};
      const adaylar = (this.o.canli?.anlar ?? []).filter((a) => !this.bulunan.has(a.id) && a.dokun.some((d) => d in yerler));
      const an = adaylar[this.ipucuSayaci++ % Math.max(1, adaylar.length)];
      const el = an ? this.tuval.querySelector<HTMLElement>(`.kt-tam-bolge[data-hedef="${an.dokun.find((d) => d in yerler)}"]`) : !this.bulunan.has('ugur') ? this.ugurEl : null;
      if (el) {
        el.dataset.ipucu = String(this.ipucuSayaci);
        this.parilda(el.offsetLeft + el.offsetWidth / 2, el.offsetTop + el.offsetHeight * 0.4, 4, 0.55);
      }
      return;
    }
    const anlar = (this.o.canli?.anlar ?? []).filter((a) => a.dokun.length && !this.bulunan.has(a.id));
    const sec = anlar[this.ipucuSayaci++ % Math.max(1, anlar.length)];
    if (sec) {
      const id = sec.dokun[0];
      const k = this.katmanlar.get(id);
      const el = k?.ic ?? this.tuval.querySelector<HTMLElement>(`[data-bolge="${id.replace('bolge:', '')}"]`);
      if (el) {
        el.dataset.ipucu = String(this.ipucuSayaci);
        el.animate(EFEKT_KARE.kipir.k, { duration: 520, easing: 'ease-in-out' });
      }
      return;
    }
    if (!this.bulunan.has('ugur')) {
      this.ugurEl.dataset.ipucu = String(this.ipucuSayaci);
      this.ugurEl.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25,0.9)' }, { transform: 'scale(1)' }], { duration: 420 });
    }
  }

  /** Test/izleme: katmanların pozları */
  durum() {
    return Object.fromEntries([...this.katmanlar].map(([id, k]) => [id, { poz: k.poz, gizli: k.dis.classList.contains('kt-gizli'), mesgul: k.mesgul > 0 }]));
  }
}
