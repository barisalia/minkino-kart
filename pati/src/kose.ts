/**
 * Pati Dükkânı v2 · açılmış köşeler (Kemirgen Rafı, Akvaryum, Kuş Köşesi, Bahçe, Sürüngen Köşesi; PATI-V2 §4d).
 * Her köşe dükkân şeridinde kendi bölümü: iki yuva (çizimdeki iki habitat), her yuvada bir hayvan (kalpleri ve ad
 * tabelasıyla).
 *
 *  - ARKA PLAN: Recraft vektör çizimi (assets/pati/<ad>.svg, 2048×1170 birim; düz karşıdan, hayvansız). Habitatların
 *    içi KOSE_PLANI'nda ölçüldü (hayvanın ayak noktası, en çok boyu, balığın su alanı, dikey kesit).
 *      yatay telefon: çizim ekranı kaplar (SVG, sonsuz net), hayvanlar kendi habitatlarının içinde.
 *      dikey telefon: iki habitat salon gibi KESİT kartı olarak alt alta (aynı çizimin parçası, çerçeveli).
 *  - Hayvana dokununca Bakım Odası açılır (salon gibi). Ziyaretçi bekliyorsa dokunulan hayvan ziyaretçiye hoplar.
 *  - Hayvan nefes alır, göz kırpar, arada zıplar ya da döner; ihtiyacı olan bedeniyle gösterir; balık suda yüzer.
 *  - Ad tabelası: dokununca 9 ad (kendi adı + 8 ortak ad).
 *  - Boş yuva: köşenin henüz alınmamış (çizimi olan) yavrusunun gölgesi; yavrusu kalmadıysa habitat boş durur.
 *  - Bahçe: gece misafiri Diken'in evi ("Diken yabani, evi bahçe."): gündüz evinin önünde durur (satılmaz, Bakım Odası
 *    yok); dokununca koklar, zıplar. Gece dükkâna gelir (ziyaret.ts geceMisafiri), o yüzden gece bahçede görünmez.
 *  - Netlik: arka plan SVG (sınırsız); hayvanın css boyu kaynak pikselinin üçte birini aşmaz.
 */
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { ezil, isimTabelasi, KalpSirasi, oksamaBagla } from './arayuz';
import { Hayvan, IHTIYAC_HAL } from './hayvan';
import { adSecenekleri, HAYVAN_IDLERI, hayvanBilgi, KALP_SAYISI, NEHIR2, type KoseAdi } from './katalog';
import type { PatiKayit, SahipHayvan } from './kayit';
import type { Nehir } from './nehir';
import { ses } from './sesler';
import { enCokCssBoy, hayvanGorseliVar, KOSE_ARKA, KOSE_H, KOSE_W, pozAdresi } from './varliklar';

const ras = (a: number, b: number) => a + Math.random() * (b - a);
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, sure(ms)));

export interface Kutu {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}
export interface YuvaPlani {
  /** habitatın kesiti (dikeyde kart; yatayda hayvanın kabı). Çizim birimi */
  kesit: Kutu;
  /** hayvanın ayaklarının ortası (çizim birimi) */
  x: number;
  y: number;
  /** hayvanın en çok boyu (çizim birimi; netlik sınırı ayrıca) */
  boy: number;
  /** balık: ayak noktasının (resmin altı) yüzebileceği alan */
  su?: Kutu;
  /** kalplerin yüksekliği (yoksa kesitin üstü; kuş kafesinde zincir değil halkanın üstü) */
  kalpY?: number;
}
export interface KosePlani {
  yuva: [YuvaPlani, YuvaPlani];
  /** Bahçe: Diken'in yeri (yuva 1'in kesitinde) */
  diken?: { x: number; y: number; boy: number };
  /**
   * Çizimin sol kenarının renk şeritleri ([renk, başladığı y]): yatayda çizim Nehir'in (sol alt) arkasından sağa kayınca
   * soldaki boşluk duvar ve zeminin devamıyla dolar (çizimin kendi renkleri, kenarından ölçüldü)
   */
  kenar: [string, number][];
}

/**
 * Habitatların ölçüleri (assets/pati/<ad>.svg, viewBox 2048×1170). Hayvan habitatın tabanına (talaş, kum, tünek, çim)
 * basar; içteki evin/taşın önünde durur.
 */
export const KOSE_PLANI: Record<Exclude<KoseAdi, 'salon'>, KosePlani> = {
  // iki cam kafes (sol: ev solda; sağ: ev sağda); talaş üstü y≈800
  kemirgen: {
    yuva: [
      { kesit: { x0: 60, y0: 330, x1: 730, y1: 870 }, x: 495, y: 805, boy: 280 },
      { kesit: { x0: 1300, y0: 330, x1: 1985, y1: 870 }, x: 1515, y: 805, boy: 280 },
    ],
    kenar: [['#fff1d6', 0], ['#d28348', 983], ['#f2bb75', 992]],
  },
  // iki akvaryum dolabın üstünde; su 485-910 / 1090-1525 × 425-640, dipte taşlar
  akvaryum: {
    yuva: [
      { kesit: { x0: 395, y0: 350, x1: 985, y1: 720 }, x: 700, y: 620, boy: 150, su: { x0: 570, y0: 580, x1: 825, y1: 665 } },
      { kesit: { x0: 1020, y0: 350, x1: 1610, y1: 720 }, x: 1300, y: 620, boy: 150, su: { x0: 1175, y0: 580, x1: 1440, y1: 665 } },
    ],
    kenar: [['#fff0d3', 0], ['#6c1b0f', 20], ['#fff0d3', 24], ['#6c1b0f', 1051], ['#f2bc7a', 1056]],
  },
  // iki asılı yuvarlak kafes; kuş tünekte (üstü y≈478; hareket sayfasının pozlarında pençeler resmin altında)
  kus: {
    yuva: [
      { kesit: { x0: 80, y0: 170, x1: 640, y1: 745 }, x: 330, y: 484, boy: 205, kalpY: 222 },
      { kesit: { x0: 695, y0: 170, x1: 1280, y1: 745 }, x: 948, y: 484, boy: 205, kalpY: 222 },
    ],
    kenar: [['#fff5de', 0], ['#601b10', 1020], ['#ecaa63', 1026], ['#d69456', 1115], ['#f4bf7a', 1116]],
  },
  // sol: lambalı kum teraryumu (kaplumbağa lambanın altında, taşın önünde); sağ: dallı dik teraryum
  surungen: {
    yuva: [
      { kesit: { x0: 300, y0: 310, x1: 1005, y1: 800 }, x: 600, y: 755, boy: 230 },
      { kesit: { x0: 1055, y0: 90, x1: 1525, y1: 800 }, x: 1290, y: 740, boy: 200 },
    ],
    kenar: [['#fef2d6', 0], ['#651c14', 857], ['#f5be76', 862]],
  },
  // sol: bank ve laleler; sağ: Diken'in evi ve havuz
  bahce: {
    yuva: [
      { kesit: { x0: 400, y0: 420, x1: 1010, y1: 900 }, x: 640, y: 880, boy: 200 },
      { kesit: { x0: 1040, y0: 290, x1: 2048, y1: 900 }, x: 1640, y: 900, boy: 200 },
    ],
    diken: { x: 1265, y: 735, boy: 190 },
    kenar: [['#fef3d7', 0], ['#6a1c18', 727], ['#bed78d', 732], ['#6a1c18', 1093], ['#f1bc72', 1099]],
  },
};

interface KoseYeri {
  i: number;
  plan: YuvaPlani;
  /** habitatın kabı (yerel birim: kesitin sol üstü 0,0) */
  el: HTMLElement;
  alan: HTMLElement;
  sahip: SahipHayvan | null;
  hayvan: Hayvan | null;
  kalpler: KalpSirasi;
  tabela: HTMLButtonElement;
  /** kabın ölçeği (css px / çizim birimi) */
  s: number;
}

export interface KoseOrtam {
  kayit: PatiKayit;
  kaydet: () => void;
  nehir: Nehir;
  /** hayvana dokunuldu (Bakım Odası ya da bekleyen ziyaretçi); true: iş görüldü */
  hayvanSecildi: (s: SahipHayvan) => boolean;
  /** hayvan parmakla sürüklenip bırakıldı (ziyaretçiye verme); true: iş görüldü */
  birakildi?: (s: SahipHayvan, x: number, y: number) => boolean;
  /** uyuyor mu (akşam) */
  uyuyor?: (id: string) => boolean;
  /** boş yuvaya dokunuldu: o köşenin vitrindeki yavrusu kendini gösterir */
  bosYuva?: (id: string) => void;
  etkilesim: () => void;
}

export class KosePaneli {
  readonly el: HTMLElement;
  private plan: KosePlani;
  private yerler: KoseYeri[] = [];
  private adlar: HTMLElement;
  /** yatay: bütün çizim (SVG) ve yuvaların kabı */
  private dekor: HTMLElement;
  private sahne: HTMLElement;
  private ui: HTMLElement;
  private diken: Hayvan | null = null;
  private dikenAlan: HTMLElement | null = null;
  private dikenSoyledi = false;
  private ro: ResizeObserver | null = null;
  private zaman = 0;
  private kapandi = false;

  constructor(
    readonly kose: KoseAdi,
    private o: KoseOrtam,
  ) {
    const arka = KOSE_ARKA[kose];
    this.plan = KOSE_PLANI[kose as Exclude<KoseAdi, 'salon'>];
    this.adlar = h('div.pt-adlar', { role: 'dialog', 'aria-label': 'Adlar' });
    this.adlar.addEventListener('click', (e) => {
      if (e.target === this.adlar) this.adlar.classList.remove('acik');
    });
    // sol kenarın devamı (çizimin altında, 4 birim içeri girer: kenarda dikiş kalmaz)
    const k = this.plan.kenar;
    const kenar = h('div.pt-kose-kenar', { style: `background:linear-gradient(to bottom, ${k.map(([r, y0], i) => `${r} ${y0}px ${i + 1 < k.length ? `${k[i + 1][1]}px` : '100%'}`).join(', ')})` });
    this.sahne = h(
      'div.pt-kose-sahne',
      { style: `width:${KOSE_W}px;height:${KOSE_H}px` },
      kenar,
      arka ? h('img.pt-kose-resim', { src: arka, alt: '', draggable: 'false' }) : null,
    );
    this.dekor = h('div.pt-kose-dekor', {}, this.sahne);
    this.ui = h('div.pt-kose-ui');
    this.plan.yuva.forEach((plan, i) => {
      const k = plan.kesit;
      const alan = h('div.pt-kose-alan', { 'data-kose-yer': String(i) });
      const el = h('div.pt-kose-yuva', { 'data-yuva': String(i), 'data-tur': kose, style: `width:${k.x1 - k.x0}px;height:${k.y1 - k.y0}px;--x0:${k.x0}px;--y0:${k.y0}px` }, alan);
      const kalpler = new KalpSirasi(KALP_SAYISI);
      const tabela = isimTabelasi('');
      this.ui.append(kalpler.el, tabela);
      const yer: KoseYeri = { i, plan, el, alan, sahip: null, hayvan: null, kalpler, tabela, s: 0.4 };
      tabela.addEventListener('click', () => this.adlariAc(yer));
      oksamaBagla(alan, {
        oksa: () => void yer.hayvan?.oksan(1000),
        irkil: () => void yer.hayvan?.irkil(),
        dokun: () => this.dokun(yer),
      });
      // ziyaretçiye sürükleme (parmak habitatın dışına çıkınca bırakılan yer sorulur)
      alan.addEventListener('pointerup', (e) => {
        const r = alan.getBoundingClientRect();
        const disarida = e.clientX < r.left - 20 || e.clientX > r.right + 20 || e.clientY < r.top - 20 || e.clientY > r.bottom + 20;
        if (disarida && yer.sahip && this.o.birakildi?.(yer.sahip, e.clientX, e.clientY)) e.stopPropagation();
      });
      this.yerler.push(yer);
    });
    this.el = h(
      'div.pt-panel.pt-kose-acik',
      { 'data-panel': `kose-${kose}`, 'data-kose': kose, style: arka ? `--kose:url("${arka}")` : '' },
      this.dekor,
      ...this.yerler.map((y) => y.el),
      this.ui,
      this.adlar,
    );
    this.dikenKur();
    this.kur();
    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(() => this.yerlesim());
      this.ro.observe(this.el);
    }
    this.zaman = window.setInterval(() => this.canli(), 1100);
  }

  /** Kayıttaki bu köşenin hayvanlarını yerlerine koyar */
  kur() {
    for (const yer of this.yerler) {
      const s = this.o.kayit.hayvanlar.find((x) => x.kose === this.kose && x.yer === yer.i) ?? null;
      if (yer.sahip === s && yer.hayvan) continue;
      yer.hayvan?.kapat();
      yer.hayvan?.el.remove();
      yer.hayvan = null;
      yer.sahip = s;
      yer.el.dataset.hayvan = s?.id ?? '';
      yer.kalpler.el.classList.toggle('pt-gizli', !s);
      yer.tabela.classList.toggle('pt-gizli', !s);
      yer.alan.classList.toggle('pt-gizli', !s);
      yer.el.querySelector('.pt-kose-golge2')?.remove();
      const p = yer.plan;
      const k = p.kesit;
      if (!s) {
        // boş yuva: köşenin henüz alınmamış yavrusunun gölgesi (dolaylı: "burası birini bekliyor"); her boş yuvada başka
        // bir yavru (Fıstık ve Kurabiye). Yavrusu kalmadıysa (akvaryumda tek balık) habitat boş durur.
        const adaylar = HAYVAN_IDLERI.filter((id) => hayvanBilgi(id).kose === this.kose && hayvanGorseliVar(id) && !this.o.kayit.hayvanlar.some((x) => x.id === id));
        const sira = this.yerler.filter((x) => x.i < yer.i && !this.o.kayit.hayvanlar.some((h_) => h_.kose === this.kose && h_.yer === x.i)).length;
        const aday = adaylar[sira];
        if (aday) {
          const boy = p.boy;
          const ust = p.y - boy - k.y0;
          const g = h(
            'button.pt-kose-golge2',
            { type: 'button', 'data-golge': aday, 'aria-label': aday, style: `left:${p.x - k.x0 - boy * 0.7}px;top:${ust}px;width:${boy * 1.4}px;height:${boy}px` },
            h('img', { src: pozAdresi(aday, 'bos').url, alt: '', draggable: 'false' }),
          );
          g.addEventListener('click', () => {
            this.o.etkilesim();
            ezil(g, 1.4, 360);
            koseSesi(this.kose);
            this.o.bosYuva?.(aday);
          });
          yer.el.append(g);
        }
        continue;
      }
      const su = p.su ? { x0: p.su.x0 - k.x0, x1: p.su.x1 - k.x0, y0: p.su.y0 - k.y0, y1: p.su.y1 - k.y0 } : undefined;
      const hv = new Hayvan({ ad: s.id, boy: p.boy, x: p.x - k.x0, y: p.y - k.y0, alan: su });
      yer.hayvan = hv;
      yer.el.insertBefore(hv.el, yer.alan);
      yer.tabela.querySelector('.pt-tabela-ad')!.textContent = s.ad;
      this.hayvanDurumu(s.id);
    }
    this.yerlesim();
  }

  /** Bahçe: Diken evinin önünde (satılmaz; dokununca koklar) */
  private dikenKur() {
    const d = this.plan.diken;
    // resmi: diken-* poz sayfası gelince o, yoksa kadro-b-diken (varliklar.pozAdresi)
    if (!d || !hayvanGorseliVar('diken')) return;
    const yer = this.yerler[1];
    const k = yer.plan.kesit;
    const hv = new Hayvan({ ad: 'diken', boy: d.boy, x: d.x - k.x0, y: d.y - k.y0 });
    hv.el.classList.add('pt-kose-diken');
    const alan = h('div.pt-kose-alan.pt-kose-diken', { 'data-diken': '1' });
    alan.addEventListener('click', () => {
      this.o.etkilesim();
      ses.burun(2);
      void hv.zipla(40, 400, 'sevinc');
      if (!this.dikenSoyledi) {
        this.dikenSoyledi = true;
        void this.o.nehir.soyle(NEHIR2.ders2.diken_yabani).catch(() => undefined);
      }
    });
    yer.el.append(hv.el, alan);
    this.diken = hv;
    this.dikenAlan = alan;
  }

  /** Çizim biriminden panelin içindeki css noktasına (yuvanın kabı üzerinden) */
  private ekrana(yer: KoseYeri, x: number, y: number): [number, number] {
    const t = /translate\(([-\d.]+)px, ([-\d.]+)px\)/.exec(yer.el.style.transform);
    const tx = t ? Number(t[1]) : 0;
    const ty = t ? Number(t[2]) : 0;
    return [tx + (x - yer.plan.kesit.x0) * yer.s, ty + (y - yer.plan.kesit.y0) * yer.s];
  }

  private yerlesim() {
    const W = this.el.clientWidth || 844;
    const H = this.el.clientHeight || 390;
    const dikey = H > W;
    this.el.classList.toggle('pt-dikey', dikey);
    if (!dikey) {
      // Çizim ekranı kaplar (SVG: büyütmek netliği bozmaz). Habitatlar üst çubuğun (70 px) altında ve Nehir'in (sol alt,
      // ~150 px) sağında kalsın: gerekirse çizim biraz küçülür (ekranın boyunu yine kaplar) ve sağa kayar; soldaki
      // boşluk çizimin kendi duvar/zemin renkleriyle dolar (kenar).
      const ks = this.plan.yuva.map((y) => y.kesit);
      const rx0 = Math.min(...ks.map((k) => k.x0));
      const rx1 = Math.max(...ks.map((k) => k.x1));
      const ry0 = Math.min(...ks.map((k) => k.y0));
      const ry1 = Math.max(...ks.map((k) => k.y1));
      const ust = Math.min(70, H * 0.18);
      const sol = Math.min(150, W * 0.18);
      const kapla = Math.max(W / KOSE_W, H / KOSE_H);
      const sigar = Math.min((W - sol - 8) / (rx1 - rx0), (H - ust) / (ry1 - ry0));
      const s = Math.max(H / KOSE_H, Math.min(kapla, sigar));
      const tx = Math.max(W - KOSE_W * s, Math.min(0, W / 2 - s * (rx0 + rx1) / 2), sol - s * rx0);
      const ty = Math.max(H - KOSE_H * s, Math.min(0, (ust + H) / 2 - s * (ry0 + ry1) / 2));
      this.sahne.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${s.toFixed(5)})`;
      for (const yer of this.yerler) {
        const k = yer.plan.kesit;
        yer.s = s;
        yer.el.classList.remove('pt-kesit');
        yer.el.style.transform = `translate(${(tx + k.x0 * s).toFixed(1)}px, ${(ty + k.y0 * s).toFixed(1)}px) scale(${s.toFixed(5)})`;
      }
    } else {
      // iki habitat kesit kartı alt alta (salonun dikey düzeni gibi); alt kısım Nehir ve kumbaranın
      const pay = 16;
      const ara = 50;
      const ust = Math.max(84, H * 0.1);
      const alt = Math.max(ust + 300, H - 290);
      const enW = W - 2 * pay;
      const enH = (alt - ust - ara) / 2;
      let y = ust;
      for (const yer of this.yerler) {
        const k = yer.plan.kesit;
        const kw = k.x1 - k.x0;
        const kh = k.y1 - k.y0;
        const s = Math.min(enW / kw, enH / kh);
        yer.s = s;
        yer.el.classList.add('pt-kesit');
        yer.el.style.transform = `translate(${((W - kw * s) / 2).toFixed(1)}px, ${y.toFixed(1)}px) scale(${s.toFixed(5)})`;
        y += kh * s + ara;
      }
      this.el.style.setProperty('--kose-alt', `${(y - ara + 34).toFixed(0)}px`);
    }
    for (const yer of this.yerler) {
      const p = yer.plan;
      const k = p.kesit;
      if (yer.hayvan) {
        // hayvanın css boyu kaynak pikseli / 3'ü aşmasın
        const kaynak = enCokCssBoy(pozAdresi(yer.hayvan.ad, 'bos').url);
        yer.hayvan.boyAyarla(kaynak ? Math.min(p.boy, kaynak / yer.s) : p.boy);
        const hb = yer.hayvan.ayar.boy;
        if (p.su) yer.alan.style.cssText = `left:${p.su.x0 - k.x0 - hb * 0.6}px;top:${p.su.y0 - k.y0 - hb}px;width:${p.su.x1 - p.su.x0 + hb * 1.2}px;height:${p.su.y1 - p.su.y0 + hb}px`;
        else yer.alan.style.cssText = `left:${p.x - k.x0 - hb * 0.65}px;top:${p.y - k.y0 - hb}px;width:${hb * 1.3}px;height:${hb + 30}px`;
      }
      // kalpler kesitin üstünde, tabela altında (ekranın biriminde: kendi boyunda, ölçeklenmez)
      const [hx, hy] = this.ekrana(yer, p.x, p.kalpY ?? k.y0);
      const [, ty] = this.ekrana(yer, p.x, k.y1);
      yer.kalpler.el.style.cssText = `left:${hx.toFixed(0)}px;top:${hy.toFixed(0)}px`;
      yer.tabela.style.left = `${hx.toFixed(0)}px`;
      yer.tabela.style.top = `${ty.toFixed(0)}px`;
    }
    if (this.diken && this.plan.diken) {
      const yer = this.yerler[1];
      const d = this.plan.diken;
      const k = yer.plan.kesit;
      const kaynak = enCokCssBoy(pozAdresi('diken', 'bos').url);
      this.diken.boyAyarla(kaynak ? Math.min(d.boy, kaynak / yer.s) : d.boy);
      const hb = this.diken.ayar.boy;
      this.dikenAlan!.style.cssText = `left:${d.x - k.x0 - hb * 0.65}px;top:${d.y - k.y0 - hb}px;width:${hb * 1.3}px;height:${hb + 20}px`;
    }
  }

  private dokun(yer: KoseYeri) {
    this.o.etkilesim();
    if (!yer.sahip || !yer.hayvan) return;
    if (this.o.hayvanSecildi(yer.sahip)) return;
    yer.hayvan.sesi(1);
    void yer.hayvan.zipla(50, 420, 'sevinc');
  }

  private adlariAc(yer: KoseYeri) {
    const s = yer.sahip;
    if (!s) return;
    this.o.etkilesim();
    this.adlar.replaceChildren(
      h(
        'div.pt-adlar-kart',
        {},
        ...adSecenekleri(s.id).map((ad) => {
          const b = h(`button.pt-ad${ad === s.ad ? '.secili' : ''}`, { type: 'button', 'data-ad': ad }, ad);
          b.addEventListener('click', () => {
            void this.o.nehir.soyle(`${ad}!`);
            for (const x of this.adlar.querySelectorAll('.pt-ad')) x.classList.toggle('secili', x === b);
            ezil(b, 1.4);
            if (s.ad === ad) return;
            s.ad = ad;
            this.o.kaydet();
            yer.tabela.querySelector('.pt-tabela-ad')!.textContent = ad;
            ezil(yer.tabela, 1.4);
            yer.hayvan?.sesi(1);
            void yer.hayvan?.zipla(60, 440, 'sevinc');
          });
          return b;
        }),
      ),
    );
    this.adlar.classList.add('acik');
  }

  /** Kalpler ve hâl kayıttan */
  hayvanDurumu(id: string) {
    const yer = this.yerler.find((y) => y.sahip?.id === id);
    if (!yer?.sahip || !yer.hayvan) return;
    yer.kalpler.ayarla(yer.sahip.kalp);
    yer.hayvan.halAyarla(this.o.uyuyor?.(id) ? 'uyku' : yer.sahip.ihtiyac ? IHTIYAC_HAL[yer.sahip.ihtiyac] : 'bos');
  }
  hepsiniYenile() {
    for (const y of this.yerler) if (y.sahip) this.hayvanDurumu(y.sahip.id);
  }
  /** Bu köşede mi */
  icinde = (id: string) => this.yerler.some((y) => y.sahip?.id === id);
  /** Hayvanın ekrandaki kutusu (ziyaretçiye hoplama başlangıcı) */
  hayvanKutusu(id: string): DOMRect | null {
    return this.yerler.find((y) => y.sahip?.id === id)?.hayvan?.kutu() ?? null;
  }
  /** Ziyarete giden hayvan yuvasında görünmez olur (dönünce yeniden) */
  gizle(id: string, gizli: boolean) {
    const yer = this.yerler.find((y) => y.sahip?.id === id);
    yer?.hayvan?.el.classList.toggle('pt-ziyarette', gizli);
    if (!gizli && yer?.hayvan) void yer.hayvan.zipla(50, 420, 'sevinc');
  }
  /** Yeni gelen hayvan yuvasına hoplar (satın alınca) */
  async yeniGeldi(s: SahipHayvan) {
    this.kur();
    const yer = this.yerler.find((y) => y.sahip?.id === s.id);
    if (!yer?.hayvan) return;
    yer.hayvan.sesi(2);
    await yer.hayvan.zipla(80, 480, 'sevinc');
    void this.o.nehir.soyle(NEHIR2.yeni_ev);
    ezil(yer.tabela, 1.6, 360);
  }
  /** Yardım merdiveni (köşe görünürken): 12 sn dolaylı hareket (bütün gövde), 25 sn 3-4 balonu salondaki gibi değil, ses */
  yardim(id: string) {
    const hv = this.yerler.find((y) => y.sahip?.id === id)?.hayvan;
    if (!hv) return;
    hv.sesi(1);
    void hv.zipla(30, 380);
  }

  private canli() {
    if (this.kapandi || this.el.hasAttribute('data-panel-gizli')) return;
    const dolu = [...this.yerler.filter((y) => y.hayvan).map((y) => y.hayvan!), ...(this.diken ? [this.diken] : [])];
    if (!dolu.length || Math.random() < 0.45) return;
    const hv = dolu[Math.floor(Math.random() * dolu.length)];
    const z = Math.random();
    if (z < 0.35) void hv.zipla(30, 380);
    else if (z < 0.65) {
      hv.cevir();
      window.setTimeout(() => !this.kapandi && hv.cevir(), sure(ras(900, 1700)));
    } else if (z < 0.85) void hv.anlik('goz', 600);
    else if (!TEST_MODU && hv !== this.diken) void bekle(0).then(() => hv.sesi(1));
  }

  get durum() {
    return this.yerler.map((y) => (y.sahip ? { yer: y.i, id: y.sahip.id, ad: y.sahip.ad, kalp: y.sahip.kalp } : null));
  }

  kapat() {
    this.kapandi = true;
    clearInterval(this.zaman);
    this.ro?.disconnect();
    for (const y of this.yerler) y.hayvan?.kapat();
    this.diken?.kapat();
  }
}

/** Ses: perdenin arkasından o köşenin sesi */
export function koseSesi(k: KoseAdi) {
  if (k === 'akvaryum') [0, 1, 2].forEach((i) => setTimeout(() => ses.blup(i), i * 140));
  else if (k === 'kus' || k === 'bahce') ses.cikcik(3);
  else if (k === 'kemirgen') ses.vuik(2);
  else ses.hop();
}
