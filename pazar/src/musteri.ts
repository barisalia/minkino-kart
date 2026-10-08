/**
 * Pazar müşterisi: ortak karakter bileşeninin (src/karakter) üstüne pazara özgü davranış.
 * Kendi yürüyüşüyle soldan tezgâha gelir, beklerken huyunu gösterir, isteğini söylerken ağzı oynar,
 * yanlış üründe kafasını sallar; doğru üründe ürünü ağzına götürüp ısırır ("nyam" kırıntıları), kendi dansını yapar,
 * sonra kendi yürüyüşüyle gider. Karakterin iskeleti (assets/karakter-iskelet) varsa parça parça, yoksa tek görselle.
 *
 * Katmanlar: .pz-musteri (yol: giriş/çıkış, WAAPI) > balon + gölge + karakter (duruş: karakter motoru).
 */
import { Karakter } from '../../src/karakter/karakter';
import { YandanKarakter, yandanVar, yandanYukle } from '../../src/karakter/yandan';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { tozKalkar } from './gorsel';

const AZ = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
/** test modunda yandan yürüyüş kapalı (hızlı testler); &yandan=1 ile açılır */
const yandanZorla = typeof location !== 'undefined' && new URLSearchParams(location.search).get('yandan') === '1';
/** Bu müşteri yandan yürüyerek mi gelir: yan görünüş iskeleti var, hareket azaltılmamış */
const yandanYururMu = (ad: string) => yandanVar(ad) && !AZ && (!TEST_MODU || yandanZorla);
/**
 * Önden / yandan çizimden görünmeyeni: tam 0 değil. Tarayıcı saydamlığı 0 olan katmanı hiç boyamaz; açılınca
 * gömülü resimleri yeniden çözerken bir kare boş kalıyordu (dönüşte karakter bir an kayboluyordu).
 */
const GIZLI = '0.001';
const bekle = (x: number) => new Promise<void>((r) => setTimeout(r, ms(x)));

/** Ekran açılırken müşterilerin yan görünüşlerini önceden hazırlar (varsa) */
export function musteriHazirla(ad: string) {
  if (yandanYururMu(ad)) void yandanYukle(ad);
}
const ms = (x: number) => (AZ ? Math.min(x, 200) : sure(x));
const ras = (a: number, b: number) => a + Math.random() * (b - a);
/** Yüz buruşturunca başın yanındaki titrek çizgiler ve beğenince uçan kalp (kalın kahve kontur) */
const BRR =
  '<svg viewBox="0 0 80 40" aria-hidden="true"><g fill="none" stroke="#5a3617" stroke-width="5" stroke-linecap="round"><path d="M6 8q6-6 12 0t12 0"/><path d="M4 22q6-6 12 0t12 0"/><path d="M50 8q6-6 12 0t12 0"/><path d="M52 22q6-6 12 0t12 0"/></g></svg>';
const KALP =
  '<svg viewBox="0 0 40 36" aria-hidden="true"><path d="M20 33C8 25 3 18 3 11a8.5 8.5 0 0 1 17-2 8.5 8.5 0 0 1 17 2c0 7-5 14-17 22z" fill="#ff5a7a" stroke="#5a3617" stroke-width="3.5" stroke-linejoin="round"/><ellipse cx="11" cy="10" rx="3.5" ry="2.5" fill="#fff" opacity=".7"/></svg>';

export class Musteri {
  readonly el: HTMLElement;
  readonly ad: string;
  readonly karakter: Karakter;
  private huyZaman = 0;
  private mesgul = false;

  /** yan görünüşü olan karakter (assets/karakter-iskelet/<ad>-profil.*): kenardan yandan yürüyerek gelir, gider */
  private yan: YandanKarakter | null = null;
  private yanKap: HTMLElement | null = null;
  private govde: HTMLElement;

  constructor(ad: string, cizim: HTMLElement, balon: HTMLElement) {
    this.ad = ad;
    this.karakter = new Karakter(ad, cizim);
    this.govde = h('div.pz-m-govde', {}, this.karakter.el);
    if (yandanYururMu(ad)) {
      this.yan = new YandanKarakter(ad);
      this.yan.gorunur = false;
      this.yanKap = h('div.pz-m-yan', { style: `opacity:${GIZLI}` }, this.yan.el);
      this.govde.append(this.yanKap);
    }
    this.el = h('div.pz-musteri.pz-kisilik', { 'data-musteri': ad, 'data-yuruyus': this.karakter.k.yuruyus }, balon, h('i.pz-m-golge'), this.govde);
  }

  private get k() {
    return this.karakter.k;
  }

  /** Yan görünüş kullanılabiliyorsa onu döner (yüklenmesi uzarsa null: önden yürür) */
  private async yanHazir(): Promise<YandanKarakter | null> {
    const yan = this.yan;
    if (!yan) return null;
    const hazir = await Promise.race([yan.hazir, new Promise<boolean>((r) => setTimeout(() => r(false), 900))]);
    return hazir && this.el.isConnected ? yan : null;
  }

  /** Adım hızı (döngü / sn; bir döngü iki adım): kişiliğin adım süresinden, makul sınırlarda */
  private get adimHizi() {
    return Math.max(1.5, Math.min(2.3, 1000 / (2 * this.k.adim)));
  }

  /**
   * Önden ↔ yandan dönüş: giden çizim daralıp kaybolur, gelen o anda belirip taşarak genişler (Mino'nun dönüşüyle
   * aynı dil); bütün beden kısa bir sıkışma + zıplama yapar, yere inerken ayakların dibinde toz kalkar.
   */
  private async don(yandan: boolean) {
    const yan = this.yanKap;
    if (!yan) return;
    const on = this.karakter.el;
    const [giden, gelen] = yandan ? [on, yan] : [yan, on];
    const govde = this.govde.animate(
      [
        { transform: 'none' },
        { transform: 'scale(1.08, 0.9)', offset: 0.22, easing: 'cubic-bezier(0.3, 0, 0.4, 1)' },
        { transform: 'translateY(-6%) scale(0.96, 1.05)', offset: 0.55, easing: 'cubic-bezier(0.5, 0, 0.8, 0.6)' },
        { transform: 'scale(1.06, 0.94)', offset: 0.82, easing: 'ease-out' },
        { transform: 'none' },
      ],
      { duration: 420 },
    );
    await bekle(90);
    await giden.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0.7)' }], { duration: 90, easing: 'ease-in' }).finished.catch(() => undefined);
    giden.style.opacity = GIZLI;
    gelen.style.opacity = '1';
    if (this.yan) this.yan.gorunur = yandan;
    gelen.animate([{ transform: 'scaleX(0.7)' }, { transform: 'scaleX(1.06)', offset: 0.7 }, { transform: 'scaleX(1)' }], { duration: 150, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1.2)' });
    await bekle(120);
    // ayaklar yere inerken toz (ayak çizgisi çizimin ~%88'inde)
    tozKalkar(this.el, 0.5, 0.88);
    await govde.finished.catch(() => undefined);
  }

  /** Yandan yürür: her karede tam alınan yol kadar ilerler (adım ile ilerleme eşleşir, pati kaymaz) */
  private yuruYandan(yan: YandanKarakter, bas: number, hedef: number, dur: boolean): Promise<void> {
    const w = this.el.offsetWidth || 300;
    const birim = w / 2048;
    const yon = hedef >= bas ? 1 : -1;
    yan.yon = yon;
    const yol0 = yan.yol;
    let durdu = false;
    const git = (x: number) => (this.el.style.transform = `translateX(${x.toFixed(1)}px)`);
    git(bas * w);
    return new Promise((coz) => {
      yan.onKare = (yol) => {
        const x = bas * w + yon * (yol - yol0) * birim;
        git(x);
        const kalan = (hedef * w - x) * yon;
        if (!dur) {
          if (kalan <= 0) coz();
          return;
        }
        if (!durdu && kalan <= yan.frenYolu() * birim) {
          durdu = true;
          yan.dur();
        }
        if (durdu && yan.yurume < 0.12) {
          yan.onKare = null;
          coz();
        }
      };
      yan.yuru(this.adimHizi);
    });
  }

  /** Kendi yürüyüşüyle soldan tezgâha gelir; varınca basıp durur */
  async gel() {
    this.mesgul = true;
    const yan = await this.yanHazir();
    if (yan) {
      // yandan: kenarın dışından yürür, tezgâhta durur, önden görünüşe döner
      this.karakter.el.style.opacity = GIZLI;
      this.yanKap!.style.opacity = '1';
      yan.gorunur = true;
      this.el.classList.add('pz-yandan');
      await this.yuruYandan(yan, -0.95, 0, true);
      const x = new DOMMatrixReadOnly(getComputedStyle(this.el).transform).m41;
      // durduğu yer ile tezgâhtaki yeri arasındaki minik fark dönüşün zıplamasında kapanır
      this.el.animate([{ transform: `translateX(${x}px)` }, { transform: 'translateX(0)' }], { duration: 300, easing: 'ease-out' });
      this.el.style.transform = '';
      await this.don(false);
      this.el.classList.remove('pz-yandan');
      await this.karakter.oynat('var', 360);
      this.mesgul = false;
      return;
    }
    const k = this.k;
    const yol: Keyframe[] =
      k.yuruyus === 'uc'
        ? [
            { transform: 'translate(-110%, -120%)', easing: 'cubic-bezier(0.3, 0.1, 0.4, 1)' },
            { transform: 'translate(-30%, -45%)', offset: 0.6, easing: 'cubic-bezier(0.4, 0, 0.3, 1)' },
            { transform: 'translate(0, 0)' },
          ]
        : [{ transform: 'translateX(-120%)', easing: k.yuruyus === 'agir' ? 'cubic-bezier(0.3, 0, 0.5, 1)' : 'cubic-bezier(0.25, 0.1, 0.35, 1)' }, { transform: 'translateX(0)' }];
    const git = this.el.animate(yol, { duration: ms(k.gelis), fill: 'both' });
    // adım sayısı tam olsun: varışta ayak yere basmış olur
    const adim = Math.max(1, Math.round(k.gelis / k.adim));
    void this.karakter.oynat('yuru', adim * k.adim);
    await git.finished.catch(() => undefined);
    git.cancel();
    await this.karakter.oynat('var', 420);
    this.mesgul = false;
  }

  /** Beklerken ara sıra kendi huyunu gösterir */
  bekle(acik: boolean) {
    clearTimeout(this.huyZaman);
    if (!acik || AZ || TEST_MODU) return;
    const plan = () => {
      this.huyZaman = window.setTimeout(async () => {
        if (!this.el.isConnected) return;
        if (!this.mesgul && !this.karakter.mesgul) await this.karakter.oynat('huy', this.k.huy === 'esne' ? 1700 : 1000);
        plan();
      }, ras(2600, 4800));
    };
    plan();
  }

  /** İsteğini söylerken ağzı açılıp kapanır */
  konus(acik: boolean) {
    this.karakter.konus(acik);
  }

  /** Yanlış ürün: kafasını iki yana sallar; üzgün ifadesi olan karakter kısa süre üzülür */
  hayir() {
    this.karakter.ifade('uzgun', 1500);
    return this.karakter.oynat('hayir', 650);
  }

  /** Ürünü alır, ağzına götürüp üç ısırıkta yer (her ısırıkta kırıntılar, "Nyam!"); para ise yalnız sevinir */
  async ye(resim: HTMLElement | null, renk: string, nyam: string) {
    this.mesgul = true;
    this.bekle(false);
    if (!resim) return;
    const [ax, ay] = this.k.agiz;
    const lokma = h('div.pz-m-lokma', { style: `left:${ax * 100}%;top:${ay * 100}%` }, resim);
    this.el.append(lokma);
    await lokma
      .animate(
        [
          { transform: 'translate(-50%, -50%) translate(-60%, 60%) scale(0.2)', opacity: 0 },
          { transform: 'translate(-50%, -50%) scale(1.15)', opacity: 1, offset: 0.7 },
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        ],
        { duration: ms(380), easing: 'cubic-bezier(0.3, 1.5, 0.5, 1)', fill: 'forwards' },
      )
      .finished.catch(() => undefined);
    // "Nyam!" başın sağ üstünde, kulağın yanında (yüzü örtmez); sol kıyıdan taşmaz
    const yazi = h('b.pz-m-nyam', { style: `left:${ax * 100 + 30}%;top:${ay * 100 - 36}%` }, nyam);
    this.el.append(yazi);
    void this.karakter.oynat('ye', 1100);
    await new Promise((r) => setTimeout(r, ms(120)));
    for (let i = 0; i < 3; i++) {
      const kalan = 1 - (i + 1) / 3;
      lokma.animate(
        [{ transform: `translate(-50%, -50%) scale(${(kalan + 1 / 3).toFixed(2)})` }, { transform: `translate(-50%, -50%) scale(${Math.max(0.05, kalan).toFixed(2)}) rotate(${i % 2 ? -8 : 8}deg)` }],
        { duration: ms(200), fill: 'forwards' },
      );
      this.kirinti(ax, ay, renk);
      await new Promise((r) => setTimeout(r, ms(330)));
    }
    lokma.remove();
    setTimeout(() => yazi.remove(), ms(500));
  }

  /** Kırıntı parçacıkları: ağızdan saçılıp yerçekimiyle düşer */
  private kirinti(ax: number, ay: number, renk: string) {
    if (AZ || TEST_MODU) return;
    for (let i = 0; i < 6; i++) {
      const p = h('i.pz-m-kirinti', { style: `left:${ax * 100}%;top:${ay * 100}%;background:${renk}` });
      this.el.append(p);
      const dx = ras(-60, 60);
      const dy = ras(-50, -15);
      p.animate(
        [
          { transform: 'translate(0, 0) scale(1)', opacity: 1 },
          { transform: `translate(${dx * 0.6}px, ${dy}px) scale(0.9)`, opacity: 1, offset: 0.35, easing: 'ease-in' },
          { transform: `translate(${dx}px, ${-dy * 1.6}px) scale(0.6) rotate(120deg)`, opacity: 0 },
        ],
        { duration: 650, easing: 'ease-out' },
      ).finished.then(
        () => p.remove(),
        () => p.remove(),
      );
    }
  }

  /**
   * Meyve suyu içer: bardak ağzının önüne gelir, pipetten üç yudum (her yudumda sıvı azalır, ağız oynar).
   * bardak: Bardak elemanı (blender.ts), sivi: onun sıvı katmanı.
   */
  async ic(bardak: HTMLElement, sivi: HTMLElement) {
    this.mesgul = true;
    this.bekle(false);
    const [ax, ay] = this.k.agiz;
    const yer = h('div.pz-m-bardak', { style: `left:${ax * 100}%;top:${ay * 100}%` }, bardak);
    this.el.append(yer);
    await yer
      .animate(
        [
          { transform: 'translate(-70%, 30%) translate(-40%, 40%) scale(.5) rotate(-10deg)', opacity: 0 },
          { transform: 'translate(-70%, 30%) scale(1.08) rotate(4deg)', opacity: 1, offset: 0.7 },
          { transform: 'translate(-70%, 30%) scale(1) rotate(0)', opacity: 1 },
        ],
        { duration: ms(360), easing: 'cubic-bezier(0.3, 1.4, 0.5, 1)', fill: 'forwards' },
      )
      .finished.catch(() => undefined);
    void this.karakter.oynat('ye', 1150);
    for (let i = 0; i < 3; i++) {
      const once = 1 - i / 3;
      const sonra = 1 - (i + 1) / 3;
      sivi.animate([{ transform: `scaleY(${once.toFixed(2)})` }, { transform: `scaleY(${Math.max(0.02, sonra).toFixed(2)})` }], { duration: ms(260), easing: 'ease-in', fill: 'forwards' });
      // yudum: bardak hafifçe eğilir
      yer.animate([{ rotate: '0deg' }, { rotate: '-7deg' }, { rotate: '0deg' }], { duration: ms(320), easing: 'ease-in-out' });
      await new Promise((r) => setTimeout(r, ms(360)));
    }
    await yer.animate([{ opacity: 1 }, { opacity: 0, transform: 'translate(-70%, 60%) scale(.6)' }], { duration: ms(240), fill: 'forwards' }).finished.catch(() => undefined);
    yer.remove();
  }

  /**
   * Yanlış renk: yüzünü buruşturur. Gözler sıkılır, kafa geri kaçar, kulaklar düşer, bütün beden titrer,
   * ağız "ıyy" diye açılır; üzgün ifadesi olan karakterde o da görünür. Başın yanında titrek çizgiler.
   */
  async burus() {
    this.mesgul = true;
    this.karakter.ifade('uzgun', 1500);
    const k = this.karakter;
    let t0 = -1;
    const sure = AZ ? 0.4 : TEST_MODU ? 0.03 : 1.3;
    k.ekHareket = (p, t) => {
      if (t0 < 0) t0 = t;
      const u = (t - t0) / sure;
      if (u >= 1) {
        k.ekHareket = null;
        return;
      }
      const z = Math.min(1, u / 0.12, (1 - u) / 0.25);
      const titre = AZ ? 0 : Math.sin(t * 70);
      p.gozKapali = z > 0.3;
      p.kafa -= 7 * z;
      p.kafaY -= 1.2 * z;
      p.kulakSol -= 14 * z;
      p.kulakSag -= 14 * z;
      p.sx *= 1 + 0.035 * titre * z;
      p.sy *= 1 - 0.05 * z - 0.03 * titre * z;
      p.don += 2.5 * titre * z;
      p.kolSol += 20 * z;
      p.kolSag += 20 * z;
      p.agizAcik = z > 0.4 ? 0.8 : 0;
    };
    if (!AZ && !TEST_MODU) {
      const [ax, ay] = this.k.agiz;
      const cizgi = h('i.pz-m-brr', { style: `left:${ax * 100}%;top:${ay * 100 - 28}%`, html: BRR });
      this.el.append(cizgi);
      setTimeout(() => cizgi.remove(), 1300);
    }
    await new Promise((r) => setTimeout(r, sure * 1000 + 60));
    k.ekHareket = null;
    this.mesgul = false;
    this.bekle(true);
  }

  /** Beğendi: başının üstünde kalpler uçuşur */
  kalpler() {
    if (AZ || TEST_MODU) return;
    const [ax, ay] = this.k.agiz;
    for (let i = 0; i < 5; i++) {
      const k = h('i.pz-m-kalp', { style: `left:${ax * 100 + ras(-18, 18)}%;top:${ay * 100 - 20}%;--g:${i * 110}ms;--dx:${ras(-30, 30).toFixed(0)}px`, html: KALP });
      this.el.append(k);
      setTimeout(() => k.remove(), 1500 + i * 110);
    }
  }

  /** Kendi sevinç dansı */
  dans() {
    const d = this.k.dans;
    return this.karakter.oynat('dans', d === 'gobek' || d === 'don' || d === 'kanat' ? 1400 : d === 'salto' ? 1100 : 1300);
  }

  /** Sevinçle kendi yürüyüşüyle sola doğru gider */
  async git() {
    this.mesgul = true;
    this.bekle(false);
    const yan = this.yan && (await this.yan.hazir) && this.el.isConnected ? this.yan : null;
    if (yan) {
      // önden yana döner (sola bakar), yandan yürüyerek kenardan çıkar
      yan.yon = -1;
      await this.don(true);
      this.el.classList.add('pz-yandan');
      await this.yuruYandan(yan, 0, -1.05, false);
      return;
    }
    const k = this.k;
    const sure = Math.max(700, k.gelis * 0.7);
    const yol: Keyframe[] = k.yuruyus === 'uc' ? [{ transform: 'translate(0, 0)' }, { transform: 'translate(-120%, -130%)' }] : [{ transform: 'translateX(0)' }, { transform: 'translateX(-125%)' }];
    const git = this.el.animate(yol, { duration: ms(sure), easing: 'cubic-bezier(0.5, 0, 0.75, 0.4)', fill: 'forwards' });
    void this.karakter.oynat('yuru', sure);
    await git.finished.catch(() => undefined);
  }

  kapat() {
    clearTimeout(this.huyZaman);
    this.karakter.kapat();
    this.yan?.kapat();
    this.el.getAnimations({ subtree: true }).forEach((a) => a.cancel());
  }
}
