import { kayitlariHazirla } from './audio/kayit';
import { sayfaAdresi } from './kabuk/sayfa';
import { sesiAc, sus } from './audio/ses';
import { h, sure, TEST_MODU } from './ui/dom';
import { sayfaAcildi, sayfadanCik } from './ui/gecis';

export interface Ekran {
  el: HTMLElement;
  kapat?: () => void;
}

/** Ekran adı (kart oyunu: acilis, yas, temalar, oyun, turSonu, album, ebeveyn, mino; diğer oyunlar kendi ekranlarını kaydeder). */
export type EkranAdi = string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fabrika = (app: Uygulama, param: any) => Ekran;

const kayit = new Map<EkranAdi, Fabrika>();
export function ekranKaydet(ad: EkranAdi, f: Fabrika) {
  kayit.set(ad, f);
}

export interface BaslatSecenekleri {
  /** Ana Minkino uygulamasına dönüş (gömülü kullanımda). Verilirse açılışta "geri" düğmesi görünür. */
  cikis?: () => void;
}

/**
 * Tek başına açılan oyun sayfasından (/kartlar/, /pazar/ …) sitenin kökündeki ana menüye döner.
 * Menüden gelindiyse geçmişte geri gidilir; değilse sayfa menüyle değiştirilir. Eskiden her dönüş geçmişe yeni bir
 * menü ekliyordu (menü → oyun → menü …): Android'in geri tuşu menüde uygulamadan çıkmak yerine oyuna geri giriyordu.
 */
export const anaMenuyeDon = () => {
  const menu = new URL('../', location.href);
  // krem perde iner, ses kısılır, sonra menüye geçilir (bir anda kopma / beyaz parlama yok)
  sayfadanCik(() => {
    if (menudenGelindi(menu)) history.back();
    else location.replace(sayfaAdresi(menu.href));
  }, menu.href);
};

function menudenGelindi(menu: URL): boolean {
  try {
    if (!document.referrer || history.length < 2) return false;
    const r = new URL(document.referrer);
    return r.origin === menu.origin && r.pathname.replace(/index\.html$/, '') === menu.pathname.replace(/index\.html$/, '');
  } catch {
    return false;
  }
}

export class Uygulama {
  readonly kok: HTMLElement;
  readonly secenekler: BaslatSecenekleri;
  private aktif: Ekran | null = null;
  aktifAd: EkranAdi | null = null;
  private gecmis: { ad: EkranAdi; param: unknown }[] = [];

  constructor(kok: HTMLElement, secenekler: BaslatSecenekleri = {}) {
    this.kok = kok;
    this.secenekler = secenekler;
    kok.classList.add('mk-kok');
    if (TEST_MODU) kok.classList.add('test-modu');
    kok.replaceChildren(h('div.zemin'));
    void kayitlariHazirla();
    // İlk dokunuşta ses motorlarını aç (iOS kuralı)
    const ac = () => sesiAc();
    kok.addEventListener('pointerdown', ac, { capture: true });
    kok.addEventListener('keydown', ac, { capture: true });
    kok.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  git(ad: EkranAdi, param?: unknown) {
    const f = kayit.get(ad);
    if (!f) throw new Error(`Ekran yok: ${ad}`);
    sus();
    const eski = this.aktif;
    if (eski) {
      eski.kapat?.();
      eski.el.classList.add('cikiyor');
      setTimeout(() => eski.el.remove(), sure(440));
    }
    if (this.aktifAd && this.aktifAd !== ad) this.gecmis.push({ ad: this.aktifAd, param: this.sonParam });
    if (this.gecmis.length > 10) this.gecmis.shift();
    this.sonParam = param;
    let yeni: Ekran;
    try {
      yeni = f(this, param);
    } catch (hata) {
      console.warn('Ekran açılamadı', ad, hata);
      yeni = this.hataEkrani();
    }
    yeni.el.classList.add('ekran');
    yeni.el.dataset.ekran = ad;
    this.kok.append(yeni.el);
    // ilk ekran çizilince sayfanın krem geçiş perdesi açılır (src/ui/gecis.ts)
    if (!eski) sayfaAcildi(yeni.el);
    this.aktif = yeni;
    this.aktifAd = ad;
  }
  private sonParam: unknown;

  /** Beklenmedik bir hatada çocuğu boş ekranda bırakmayan toparlanma ekranı. */
  private hataEkrani(): Ekran {
    const dugme = h('button.dugme', { type: 'button' }, 'Baştan başla');
    dugme.addEventListener('click', () => this.git('acilis'));
    return { el: h('div.yukleniyor', {}, h('div', { style: 'display:grid;gap:18px;justify-items:center;text-align:center' }, h('div', {}, 'Hımm, bir şey ters gitti.'), dugme)) };
  }

  /** Bir önceki ekrana dön (yoksa temalar). */
  geri() {
    const onceki = this.gecmis.pop();
    if (onceki) {
      this.aktifAd = null;
      this.git(onceki.ad, onceki.param);
    } else this.git('temalar');
  }

  kapat() {
    sus();
    this.aktif?.kapat?.();
    this.kok.replaceChildren();
  }
}
