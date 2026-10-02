/**
 * Pasta otobüsünün müşterisi: ortak karakter (src/karakter: önden iskelet, ifadeler, dudak senkronu) ve yan görünüşü
 * varsa yandan yürüyüş (src/karakter/yandan.ts). Boylar tek tablodan (src/karakter/boy.ts): çocuklar Mino'nun ~1.35
 * katı, hayvanlar tablodaki boyda.
 *
 * Katmanlar: .ps-musteri (sırası: yeri, boyu) > .ps-m-yol (yürüyüş, WAAPI) > gölge + gövde (önden + yandan çizim)
 * ve başının üstünde sipariş balonu (sabır kalbiyle).
 */
import { BOY, boyOrani, boyTipi, CIZIM, altPayi, ustPayi, yanOlcek } from '../../src/karakter/boy';
import { Karakter, type Poz } from '../../src/karakter/karakter';
import { YandanKarakter, yandanVar } from '../../src/karakter/yandan';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { susIkon, urunSvg } from './cizim';
import { AZ_HAREKET } from './gorsel';
import { type Kalem, type Parti, type Siparis } from './model';

/** test modunda yandan yürüyüş kapalı (hızlı testler); &yandan=1 açar */
const yandanZorla = typeof location !== 'undefined' && new URLSearchParams(location.search).get('yandan') === '1';
const yandanYururMu = (ad: string) => yandanVar(ad) && !AZ_HAREKET && (!TEST_MODU || yandanZorla);
const GIZLI = '0.001';
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, AZ_HAREKET ? Math.min(ms, 200) : sure(ms)));
const ras = (a: number, b: number) => a + Math.random() * (b - a);

/** Kutunun genişliği, en uzun müşterinin (çocuk) görünen boyuna oranla */
export function boyCarpani(ad: string): number {
  const tip = boyTipi(ad);
  const c = CIZIM[ad];
  if (!tip || !c) return 1;
  return BOY[tip] / BOY.cocuk / boyOrani(c);
}

/** Kalemin örnek çizimi (siparişte istenen hâli) */
export function kalemCizimi(k: Kalem, sinif = 'ps-b-parca'): string {
  const susler = k.sus ? Array.from({ length: k.susAdet }, () => k.sus!) : [];
  return urunSvg({ urun: k.urun, sekil: k.sekil, hal: 'pismis', renk: k.urun === 'kurabiye' ? k.renk : null, yigin: k.urun === 'kapkek' ? Array.from({ length: k.yigin }, () => k.renk) : [], susler, hamur: '#F3B54A', golge: false }, sinif);
}
/** Verilen partinin çizimi (tabakta yapılan hâli) */
export function partiCizimi(p: Parti, sinif = 'ps-b-parca'): string[] {
  return p.parcalar.map((x) => urunSvg({ urun: p.urun, sekil: p.sekil, hal: 'pismis', renk: x.renk, yigin: x.yigin, susler: x.susler, hamur: '#F3B54A', golge: false }, sinif));
}

/** Sipariş balonunun resmi (yazı yok): her kalem bir grup; mantık siparişinde tavşanın kurabiyesi + 1 çilek */
export function siparisResmi(sip: Siparis, tavsanResmi?: string): HTMLElement {
  if (sip.mantik) {
    const m = sip.mantik;
    return h(
      'div.ps-b-ic.ps-b-mantik',
      {},
      h('div.ps-b-kalem', { 'data-i': '0' }, tavsanResmi ? h('img.ps-b-kimin', { src: tavsanResmi, alt: '', draggable: 'false' }) : null, h('span.ps-b-grup', { html: kalemCizimi(m.kalem) })),
      h('b.ps-b-arti', {}, `+${m.fazla}`),
      h('span.ps-b-grup.ps-b-tek', { html: susIkon('cilek') }),
    );
  }
  return h(
    'div.ps-b-ic',
    {},
    ...sip.kalemler.map((k, i) =>
      h('div.ps-b-kalem', { 'data-i': String(i), 'data-adet': String(k.adet) }, h('span.ps-b-grup', { html: Array.from({ length: k.adet }, () => kalemCizimi(k)).join('') }), h('i.ps-b-tamam')),
    ),
  );
}
export class PastaMusteri {
  readonly el: HTMLElement;
  readonly ad: string;
  readonly sip: Siparis;
  readonly karakter: Karakter;
  readonly balon: HTMLElement;
  readonly balonIc: HTMLElement;
  /** verilen partiler (kalem sırasıyla) */
  readonly verilen: (Parti | null)[];
  /** sabır kalbinin doluluğu 0..1 */
  sabir = 0;
  uyuyor = false;
  /** bir kez bile uyukladı mı (bahşiş kaçar) */
  uyudu = false;
  /** tezgâha vardı, sipariş alınabilir */
  hazir = false;
  /** servis edildi, gidiyor */
  bitti = false;
  private yol: HTMLElement;
  private govde: HTMLElement;
  private yan: YandanKarakter | null = null;
  private yanKap: HTMLElement | null = null;
  private sabirEl: HTMLElement;
  private zzz: HTMLElement;
  private uykuBas = 0;

  constructor(sip: Siparis, tavsanResmi?: string) {
    this.sip = sip;
    this.ad = sip.musteri;
    this.verilen = sip.kalemler.map(() => null);
    const ad = this.ad;
    this.karakter = new Karakter(ad, h('div'));
    const kutular: HTMLElement[] = [this.karakter.el];
    if (yandanYururMu(ad)) {
      this.yan = new YandanKarakter(ad);
      this.yan.gorunur = false;
      const on = CIZIM[ad];
      const yan = CIZIM[`${ad}-profil`];
      const olcek = yanOlcek(ad);
      const alt = on && yan ? (altPayi(on) - altPayi(yan) * olcek) * 100 : 0;
      this.yanKap = h('div.ps-m-yan', { style: `opacity:${GIZLI};width:${(olcek * 100).toFixed(2)}%;left:${((1 - olcek) * 50).toFixed(2)}%;bottom:${alt.toFixed(2)}%` }, this.yan.el);
      kutular.push(this.yanKap);
    }
    this.govde = h('div.ps-m-govde', {}, ...kutular);
    this.zzz = h('div.ps-m-zzz', { 'aria-hidden': 'true' }, h('span', {}, 'z'), h('span', {}, 'z'), h('span', {}, 'Z'));
    this.yol = h('div.ps-m-yol', {}, this.govde, this.zzz);
    this.sabirEl = h('div.ps-sabir', { 'aria-hidden': 'true' }, h('i.ps-sabir-bos'), h('i.ps-sabir-dolu'));
    this.balonIc = siparisResmi(sip, tavsanResmi);
    this.balon = h('div.ps-balon', {}, this.balonIc, this.sabirEl);
    const c = CIZIM[ad];
    this.el = h(
      'div.ps-musteri',
      {
        'data-musteri': ad,
        role: 'button',
        'aria-label': ad,
        style: `--oran:${boyCarpani(ad).toFixed(4)};--alt:${c ? altPayi(c).toFixed(4) : 0};--ust:${c ? ustPayi(c).toFixed(4) : 0}`,
      },
      this.yol,
      // dokunma alanı: yalnız tezgâhın üstünde görünen gövde (komşu müşterinin önünü kapatmaz)
      h('i.ps-m-dokun'),
      this.balon,
    );
    this.karakter.ekHareket = (p, t) => this.poz(p, t);
    void this.karakter.hazir.then(() => this.yanakTak());
  }

  /** Sabırsızlanınca kızaran yanaklar: kafa katmanına (kafa dönünce yanak da döner), ağzın iki yanına */
  private yanakTak() {
    const kafa = this.karakter.parcaG('kafa');
    if (!kafa || kafa.querySelector('.ps-yanak')) return;
    const [ax, ay] = this.karakter.k.agiz;
    const cocuk = boyTipi(this.ad) === 'cocuk';
    const dx = cocuk ? 118 : 230;
    const r = cocuk ? 40 : 66;
    const x = ax * 2048;
    const y = ay * 2048 - (cocuk ? 46 : 90);
    kafa.insertAdjacentHTML(
      'beforeend',
      `<g class="ps-yanak"><ellipse cx="${x - dx}" cy="${y}" rx="${r}" ry="${r * 0.62}" fill="#FF4F6E"/><ellipse cx="${x + dx}" cy="${y}" rx="${r}" ry="${r * 0.62}" fill="#FF4F6E"/></g>`,
    );
  }

  /** Sabırsız mı (kalp dolmaya yakın, uyumuyor): yanaklar kızarır, ayağını vurur, kaşlar çatılır */
  private get sabirsiz() {
    return this.sabir > 0.6 && !this.uyuyor && this.hazir && !this.bitti;
  }

  /** Uyuklarken: gözler kapalı, baş yana düşmüş, yavaş nefes. Sabırsızken ayak vurur gibi hoplar. */
  private poz(p: Poz, t: number) {
    if (this.sabirsiz && !this.karakter.mesgul && !AZ_HAREKET) {
      const vur = Math.max(0, Math.sin(t * 9));
      p.y -= 1.2 * vur;
      p.sy *= 1 - 0.015 * vur;
      p.kas = 0.8;
      p.kafa += Math.sin(t * 4.5) * 2.5;
      p.bacakSag += 6 * vur;
    }
    if (!this.uyuyor) return;
    const u = Math.min(1, (performance.now() - this.uykuBas) / 600);
    p.gozKapali = true;
    p.kafa += 7 * u + Math.sin(t * 1.2) * 1.5;
    p.kafaY += 1.5 * u;
    p.kulakSol -= 6 * u;
    p.kulakSag -= 6 * u;
    p.sy *= 1 + Math.sin(t * 1.3) * 0.012;
  }

  private async yanHazir(): Promise<YandanKarakter | null> {
    const yan = this.yan;
    if (!yan) return null;
    const hazir = await Promise.race([yan.hazir, new Promise<boolean>((r) => setTimeout(() => r(false), 900))]);
    return hazir && this.el.isConnected ? yan : null;
  }

  /** Yandan yürür: her karede alınan yol kadar ilerler (pati kaymaz). bas, hedef: px */
  private yuruYandan(yan: YandanKarakter, bas: number, hedef: number, dur: boolean): Promise<void> {
    const w = this.yanKap?.offsetWidth || this.el.offsetWidth || 200;
    const birim = w / 2048;
    const yon = hedef >= bas ? 1 : -1;
    yan.yon = yon;
    const yol0 = yan.yol;
    let durdu = false;
    const git = (x: number) => (this.yol.style.transform = `translateX(${x.toFixed(1)}px)`);
    git(bas);
    // küçük karakter kısa adımlarla uzun yolu yürür: yürüyüş en çok ~3 sn sürsün diye adım sıklaşır (pati kaymaz)
    const dongu = Math.abs(hedef - bas) / Math.max(1, (yan.geo?.donguYolu ?? 900) * birim);
    const adimHizi = Math.max(1.5, Math.min(3.6, Math.max(1000 / (2 * this.karakter.k.adim), dongu / 3)));
    return new Promise((coz) => {
      const emniyet = setTimeout(() => {
        yan.onKare = null;
        coz();
      }, 9000);
      yan.onKare = (yol) => {
        const x = bas + yon * (yol - yol0) * birim;
        git(x);
        const kalan = (hedef - x) * yon;
        if (!dur) {
          if (kalan <= 0) {
            clearTimeout(emniyet);
            yan.onKare = null;
            coz();
          }
          return;
        }
        if (!durdu && kalan <= yan.frenYolu() * birim) {
          durdu = true;
          yan.dur();
        }
        if (durdu && yan.yurume < 0.12) {
          clearTimeout(emniyet);
          yan.onKare = null;
          coz();
        }
      };
      yan.yuru(adimHizi);
    });
  }

  /** Önden ↔ yandan dönüş: kısa sıkışma ve zıplama */
  private async don(yandan: boolean) {
    const yan = this.yanKap;
    if (!yan) return;
    const on = this.karakter.el;
    const [giden, gelen] = yandan ? [on, yan] : [yan, on];
    this.govde.animate(
      [{ transform: 'none' }, { transform: 'scale(1.08, .9)', offset: 0.22 }, { transform: 'translateY(-6%) scale(.96, 1.05)', offset: 0.55 }, { transform: 'scale(1.05, .95)', offset: 0.82 }, { transform: 'none' }],
      { duration: 420 },
    );
    await bekle(90);
    giden.style.opacity = GIZLI;
    gelen.style.opacity = '1';
    if (this.yan) this.yan.gorunur = yandan;
    gelen.animate([{ transform: 'scaleX(.7)' }, { transform: 'scaleX(1.06)', offset: 0.7 }, { transform: 'scaleX(1)' }], { duration: 150 });
    await bekle(260);
  }

  /** Soldan yürüyerek yerine gelir (bas: px, yerinin solundan ne kadar uzakta başlar) */
  async gel(bas: number) {
    const yan = await this.yanHazir();
    if (yan) {
      this.karakter.el.style.opacity = GIZLI;
      this.yanKap!.style.opacity = '1';
      yan.gorunur = true;
      this.el.classList.add('ps-yandan');
      await this.yuruYandan(yan, bas, 0, true);
      this.yol.animate([{ transform: this.yol.style.transform || 'none' }, { transform: 'translateX(0)' }], { duration: 260, easing: 'ease-out' });
      this.yol.style.transform = '';
      await this.don(false);
      this.el.classList.remove('ps-yandan');
    } else {
      const k = this.karakter.k;
      const ms = Math.max(700, Math.min(2200, Math.abs(bas) * 3.2));
      const a = this.yol.animate([{ transform: `translateX(${bas}px)` }, { transform: 'translateX(0)' }], { duration: AZ_HAREKET ? 200 : sure(ms), easing: 'cubic-bezier(.25,.1,.35,1)', fill: 'both' });
      void this.karakter.oynat('yuru', Math.max(1, Math.round(ms / k.adim)) * k.adim);
      await a.finished.catch(() => undefined);
      a.cancel();
    }
    await this.karakter.oynat('var', 380);
    this.hazir = true;
    this.el.classList.add('ps-hazir');
  }

  /** Sağa doğru yürüyerek gider (hedef px) */
  async git(hedef: number) {
    this.hazir = false;
    this.el.classList.remove('ps-hazir');
    this.el.classList.add('ps-gidiyor');
    const yan = this.yan && (await this.yanHazir());
    if (yan) {
      yan.yon = 1;
      await this.don(true);
      this.el.classList.add('ps-yandan');
      await this.yuruYandan(yan, 0, hedef, false);
      return;
    }
    const ms = Math.max(700, Math.min(1800, Math.abs(hedef) * 2.6));
    const a = this.yol.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${hedef}px)` }], { duration: AZ_HAREKET ? 200 : sure(ms), easing: 'cubic-bezier(.5,0,.75,.4)', fill: 'forwards' });
    void this.karakter.oynat('yuru', ms);
    await a.finished.catch(() => undefined);
  }

  /** Sabır kalbini günceller (0..1); dolunca uyuklar */
  sabirGuncelle(s: number) {
    this.sabir = Math.max(0, Math.min(1, s));
    this.sabirEl.style.setProperty('--s', this.sabir.toFixed(3));
    this.sabirEl.classList.toggle('ps-sabir-az', this.sabir > 0.75);
    this.el.classList.toggle('ps-sabirsiz', this.sabirsiz);
    if (this.sabir >= 1 && !this.uyuyor) this.uyu();
  }

  uyu() {
    this.uyuyor = true;
    this.uyudu = true;
    this.uykuBas = performance.now();
    this.el.classList.add('ps-uyuyor');
  }
  /** Uyandı: sabır yarıya iner */
  uyan() {
    if (!this.uyuyor) return;
    this.uyuyor = false;
    this.el.classList.remove('ps-uyuyor');
    this.sabirGuncelle(0.5);
    void this.karakter.oynat('sevin', 500);
  }

  konus(acik: boolean) {
    this.karakter.konus(acik);
  }

  /** Kafasını hafifçe sallar / zıplar (dokununca) */
  dikkat() {
    if (!this.karakter.mesgul) void this.karakter.oynat('bak', 700);
    this.balon.classList.remove('ps-zipla');
    void this.balon.offsetWidth;
    this.balon.classList.add('ps-zipla');
  }

  /** Kalem teslim alındı (çok kalemlide: o kalemin üstünde tik) */
  kalemAlindi(i: number) {
    this.balonIc.querySelector(`.ps-b-kalem[data-i="${i}"]`)?.classList.add('ps-alindi');
  }

  /** Balon ile verilen yan yana: farklı olan şeyler bir an parlar */
  karsilastir(farklar: string[][]) {
    const yanYana = h('div.ps-b-verilen');
    this.verilen.forEach((p, i) => {
      if (!p) return;
      const f = farklar[i] ?? [];
      yanYana.append(h(`div.ps-b-kalem${f.length ? '.ps-fark' : ''}`, { 'data-fark': f.join(' ') }, h('span.ps-b-grup', { html: partiCizimi(p).join('') })));
      const kalem = this.balonIc.querySelector<HTMLElement>(`.ps-b-kalem[data-i="${i}"]`);
      if (kalem && f.length) {
        kalem.classList.add('ps-fark');
        kalem.dataset.fark = f.join(' ');
      }
    });
    this.balon.append(yanYana);
    this.balon.classList.add('ps-karsilastir');
  }

  /** Yer: tabaktaki ilk parça ağzının önüne gelir, üç ısırıkta biter (kırıntılar) */
  async ye(resim: string) {
    const [ax, ay] = this.karakter.k.agiz;
    const lokma = h('div.ps-m-lokma', { style: `left:${ax * 100}%;top:${ay * 100}%`, html: resim });
    this.yol.append(lokma);
    await lokma
      .animate([{ transform: 'translate(-50%, -50%) translateY(60%) scale(.2)', opacity: 0 }, { transform: 'translate(-50%, -50%) scale(1.1)', opacity: 1, offset: 0.7 }, { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 }], {
        duration: sure(360),
        easing: 'cubic-bezier(.3,1.5,.5,1)',
        fill: 'forwards',
      })
      .finished.catch(() => undefined);
    void this.karakter.oynat('ye', 1100);
    for (let i = 0; i < 3; i++) {
      const kalan = 1 - (i + 1) / 3;
      lokma.animate([{ transform: `translate(-50%, -50%) scale(${(kalan + 1 / 3).toFixed(2)})` }, { transform: `translate(-50%, -50%) scale(${Math.max(0.05, kalan).toFixed(2)}) rotate(${i % 2 ? -8 : 8}deg)` }], {
        duration: sure(200),
        fill: 'forwards',
      });
      this.kirinti(ax, ay);
      await bekle(320);
    }
    lokma.remove();
  }

  private kirinti(ax: number, ay: number) {
    if (AZ_HAREKET || TEST_MODU) return;
    for (let i = 0; i < 6; i++) {
      const p = h('i.ps-m-kirinti', { style: `left:${ax * 100}%;top:${ay * 100}%` });
      this.yol.append(p);
      const dx = ras(-50, 50);
      const dy = ras(-40, -12);
      p.animate([{ transform: 'translate(0,0)', opacity: 1 }, { transform: `translate(${dx * 0.6}px, ${dy}px)`, opacity: 1, offset: 0.35 }, { transform: `translate(${dx}px, ${-dy * 1.8}px) rotate(120deg)`, opacity: 0 }], {
        duration: 650,
        easing: 'ease-out',
      }).finished.then(
        () => p.remove(),
        () => p.remove(),
      );
    }
  }

  /** Sevinç dansı */
  dans() {
    const d = this.karakter.k.dans;
    return this.karakter.oynat('dans', d === 'gobek' ? 1400 : 1300);
  }

  /** Sevinçli ifade: varsa 'mutlu', yoksa gülen ağız (agiz-gulus / agiz-gulumse); kahkaha gibi hafif zıplama */
  mutlu(ms = 1600) {
    this.el.classList.remove('ps-sabirsiz');
    if (this.karakter.ifadeVar('mutlu')) {
      this.karakter.ifade('mutlu', ms);
      return;
    }
    const agiz = ['agiz-gulus', 'agiz-gulumse'].find((id) => this.karakter.parcaG(id));
    if (!agiz) return;
    this.karakter.ek(agiz, true);
    this.karakter.gizle('agiz', true);
    clearTimeout(this.gulusZaman);
    this.gulusZaman = window.setTimeout(() => {
      this.karakter.ek(agiz, false);
      this.karakter.gizle('agiz', false);
    }, TEST_MODU ? 30 : ms);
  }
  private gulusZaman = 0;

  kapat() {
    clearTimeout(this.gulusZaman);
    this.karakter.kapat();
    this.yan?.kapat();
    this.el.getAnimations({ subtree: true }).forEach((a) => a.cancel());
  }
}
