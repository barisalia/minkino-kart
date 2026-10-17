/**
 * Pati Dükkânı v2 · açılmış köşeler (Kemirgen Rafı, Akvaryum, Kuş Köşesi, Bahçe, Sürüngen Köşesi; PATI-V2 §4d).
 * Her köşe dükkân şeridinde kendi bölümü: iki yuva, her yuvada bir hayvan (kalpleri ve ad tabelasıyla).
 *
 *  - Hayvana dokununca Bakım Odası açılır (salon gibi). Ziyaretçi bekliyorsa dokunulan hayvan ziyaretçiye hoplar.
 *  - Hayvan nefes alır, göz kırpar, arada zıplar ya da döner; ihtiyacı olan bedeniyle gösterir; balık yüzer.
 *  - Ad tabelası: dokununca 9 ad (kendi adı + 8 ortak ad).
 *  - ARKA PLAN: Gemini köşe çizimi (kemirgen-rafi, akvaryum-duvari, kus-kosesi, surungen-kosesi, bahce) gelince o çizim;
 *    gelene kadar SADE YER TUTUCU: düz duvar, düz zemin şeridi, iki yuva çerçevesi (akvaryumda iki düz mavi tank).
 *    Kodla süslü çizim yok.
 *  - Netlik: yuvalar ölçeklenir (≤ 1/3); hayvanın css boyu kaynak pikselinin üçte birini aşmaz.
 */
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { ezil, isimTabelasi, KalpSirasi, oksamaBagla } from './arayuz';
import { ENCOK_OLCEK } from './dekor';
import { Hayvan, IHTIYAC_HAL } from './hayvan';
import { adSecenekleri, HAYVAN_IDLERI, hayvanBilgi, KALP_SAYISI, NEHIR2, type KoseAdi } from './katalog';
import type { PatiKayit, SahipHayvan } from './kayit';
import type { Nehir } from './nehir';
import { ses } from './sesler';
import { enCokCssBoy, hayvanGorseliVar, KOSE_ARKA, pozAdresi } from './varliklar';

const ras = (a: number, b: number) => a + Math.random() * (b - a);
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, sure(ms)));
/** Yuvanın tasarım ölçüsü (birim) ve hayvanın ayakları */
const YW = 700;
const YH = 640;
const AYAK: [number, number] = [YW / 2, YH - 70];
const BOY = 420;

interface KoseYeri {
  i: number;
  el: HTMLElement;
  sahne: HTMLElement;
  alan: HTMLElement;
  sahip: SahipHayvan | null;
  hayvan: Hayvan | null;
  kalpler: KalpSirasi;
  tabela: HTMLButtonElement;
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
  private yerler: KoseYeri[] = [];
  private adlar: HTMLElement;
  private ro: ResizeObserver | null = null;
  private zaman = 0;
  private kapandi = false;

  constructor(
    readonly kose: KoseAdi,
    private o: KoseOrtam,
  ) {
    const arka = KOSE_ARKA[kose];
    this.adlar = h('div.pt-adlar', { role: 'dialog', 'aria-label': 'Adlar' });
    this.adlar.addEventListener('click', (e) => {
      if (e.target === this.adlar) this.adlar.classList.remove('acik');
    });
    const yuvalar = h('div.pt-kose-yuvalar');
    for (let i = 0; i < 2; i++) {
      const alan = h('div.pt-kose-alan', { 'data-kose-yer': String(i) });
      const sahne = h('div.pt-kose-sahne', { style: `width:${YW}px;height:${YH}px` }, alan);
      const kalpler = new KalpSirasi(KALP_SAYISI);
      const tabela = isimTabelasi('');
      const el = h('div.pt-kose-yuva', { 'data-yuva': String(i), 'data-tur': kose }, sahne, kalpler.el, tabela);
      const yer: KoseYeri = { i, el, sahne, alan, sahip: null, hayvan: null, kalpler, tabela };
      tabela.addEventListener('click', () => this.adlariAc(yer));
      oksamaBagla(alan, {
        oksa: () => void yer.hayvan?.oksan(1000),
        irkil: () => void yer.hayvan?.irkil(),
        dokun: () => this.dokun(yer),
      });
      // ziyaretçiye sürükleme (parmak yuvanın dışına çıkınca bırakılan yer sorulur)
      alan.addEventListener('pointerup', (e) => {
        const r = alan.getBoundingClientRect();
        const disarida = e.clientX < r.left - 20 || e.clientX > r.right + 20 || e.clientY < r.top - 20 || e.clientY > r.bottom + 20;
        if (disarida && yer.sahip && this.o.birakildi?.(yer.sahip, e.clientX, e.clientY)) e.stopPropagation();
      });
      this.yerler.push(yer);
      yuvalar.append(el);
    }
    this.el = h(
      `div.pt-panel.pt-kose-acik${arka ? '' : '.pt-yer-tutucu-kose'}`,
      { 'data-panel': `kose-${kose}`, 'data-kose': kose, style: arka ? `background-image:url("${arka}")` : '' },
      arka ? null : h('div.pt-kose-zemin'),
      yuvalar,
      this.adlar,
    );
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
      yer.el.querySelector('.pt-kose-golge2')?.remove();
      if (!s) {
        // boş yuva: köşenin henüz alınmamış yavrusunun gölgesi (dolaylı: "burası birini bekliyor")
        const aday = HAYVAN_IDLERI.find((id) => hayvanBilgi(id).kose === this.kose && hayvanGorseliVar(id) && !this.o.kayit.hayvanlar.some((x) => x.id === id));
        if (aday) {
          const g = h('button.pt-kose-golge2', { type: 'button', 'data-golge': aday, 'aria-label': aday }, h('img', { src: pozAdresi(aday, 'bos').url, alt: '', draggable: 'false' }));
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
      const balik = this.kose === 'akvaryum';
      const hv = new Hayvan({ ad: s.id, boy: BOY, x: AYAK[0], y: balik ? YH / 2 : AYAK[1], alan: balik ? { x0: 140, x1: YW - 140, y0: 160, y1: YH - 120 } : undefined });
      yer.hayvan = hv;
      yer.sahne.insertBefore(hv.el, yer.alan);
      yer.tabela.querySelector('.pt-tabela-ad')!.textContent = s.ad;
      this.hayvanDurumu(s.id);
    }
    this.yerlesim();
  }

  private yerlesim() {
    const W = this.el.clientWidth || 844;
    const H = this.el.clientHeight || 390;
    const dikey = H > W;
    this.el.classList.toggle('pt-dikey', dikey);
    // iki yuva yan yana; yuva ölçeği ≤ 1/3 (netlik) ve ekrana sığar
    const s = Math.min(ENCOK_OLCEK, (W * (dikey ? 0.46 : 0.4)) / YW, (H * (dikey ? 0.4 : 0.66)) / YH);
    for (const yer of this.yerler) {
      yer.sahne.style.transform = `scale(${s.toFixed(5)})`;
      yer.el.style.width = `${(YW * s).toFixed(0)}px`;
      yer.el.style.height = `${(YH * s).toFixed(0)}px`;
      // hayvanın css boyu kaynak pikseli / 3'ü aşmasın
      if (yer.hayvan) {
        const kaynak = enCokCssBoy(pozAdresi(yer.hayvan.ad, 'bos').url);
        if (kaynak) yer.hayvan.boyAyarla(Math.min(BOY, kaynak / s));
        const hb = yer.hayvan.ayar.boy;
        yer.alan.style.cssText = `left:${AYAK[0] - hb * 0.5}px;top:${(this.kose === 'akvaryum' ? 120 : AYAK[1] - hb)}px;width:${hb}px;height:${this.kose === 'akvaryum' ? YH - 200 : hb + 30}px`;
      }
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
    const dolu = this.yerler.filter((y) => y.hayvan);
    if (!dolu.length || Math.random() < 0.45) return;
    const hv = dolu[Math.floor(Math.random() * dolu.length)].hayvan!;
    const z = Math.random();
    if (z < 0.35) void hv.zipla(30, 380);
    else if (z < 0.65) {
      hv.cevir();
      window.setTimeout(() => !this.kapandi && hv.cevir(), sure(ras(900, 1700)));
    } else if (z < 0.85) void hv.anlik('goz', 600);
    else if (!TEST_MODU) void bekle(0).then(() => hv.sesi(1));
  }

  get durum() {
    return this.yerler.map((y) => (y.sahip ? { yer: y.i, id: y.sahip.id, ad: y.sahip.ad, kalp: y.sahip.kalp } : null));
  }

  kapat() {
    this.kapandi = true;
    clearInterval(this.zaman);
    this.ro?.disconnect();
    for (const y of this.yerler) y.hayvan?.kapat();
  }
}

/** Ses: perdenin arkasından o köşenin sesi */
export function koseSesi(k: KoseAdi) {
  if (k === 'akvaryum') [0, 1, 2].forEach((i) => setTimeout(() => ses.blup(i), i * 140));
  else if (k === 'kus' || k === 'bahce') ses.cikcik(3);
  else if (k === 'kemirgen') ses.vuik(2);
  else ses.hop();
}
