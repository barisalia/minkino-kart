/**
 * Kitaplar bölümü: kitaplık → kitabı alma (3D) → okuma.
 *
 * - Kitaplık: rafta düz kapaklar (hazır kitaplar); öbür fikirler "yakında" sırtları.
 * - Kitabı alma: kapağa dokununca kitap öne gelir; sırt, sayfa kalınlığı, gölge ve hafif eğilme belirir. Okuma modu
 *   seçilir ("Bana oku" / "Kendim bakayım"), kitap düzleşir ve kapak açılır.
 * - Okuma (tasarım: ekip/kitap/TASARIM-ONERILERI.md, öneri C): yatayda açık iki sayfa; sol sayfanın üstünde resim
 *   kenardan kenara (çerçevesiz), yazı resmin altından başlar, sağ sayfada sürer. Dikeyde tek sayfa (üstte resim, altta
 *   yazı). Kapak, raf ve tutulan kitap aynı dille: üstte çizim, altta kitabın renginde başlık. Sayfa parmakla sürüklenerek kıvrılır
 *   ve çevrilir (yaprak.ts) ya da köşesine dokunarak. "Bana oku"da sayfa okunur, otomatik çevrilmez.
 * - Kaldığı yer, mod ve bulunan sürprizler cihazda (kayit.ts).
 */
import { efekt, sesiAc, sus } from '../../src/audio/ses';
import { geriDinle } from '../../src/kabuk/yon';
import { TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { Sahne } from './canli';
import { ilerleme, kayitOku, kayitYaz, type OkumaModu } from './kayit';
import { MetinSayfasi, ebeveynSayfasi } from './metin';
import { satirSoyle } from './kitap-ses';
import { Okuyucu } from './okuyucu';
import type { KitapIcerik, Kim, SayfaCanli } from './tipler';
import { kitapVarliklari, sayfaAnahtari, type KitapVarliklari } from './varlik';
import { kitapOlcusu, resimEnCok, SON_SAYFA, VARSAYILAN_KAYNAK, type KitapOlcu } from './yerlesim';
import { Yaprak } from './yaprak';

export interface RafKitabi {
  id: string;
  baslik: string;
  renk: string;
  /** Hazır kitap (yoksa "yakında" sırtı) */
  icerik?: KitapIcerik;
  canli?: Record<number, SayfaCanli>;
}

/** Dik kapağın altındaki seri adı */
function seriAdi(): HTMLElement {
  const s = document.createElement('div');
  s.className = 'kt-seri';
  s.textContent = 'Mino ile Kino';
  return s;
}

const sure = (ms: number) => (TEST_MODU ? Math.min(ms, 40) : ms);
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const kare = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

function dugme(sinif: string, ikon: string, etiket: string, tik: () => void): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `yuvarlak kucuk ${sinif}`;
  b.setAttribute('aria-label', etiket);
  b.innerHTML = `<span class="ikon" aria-hidden="true">${ikon}</span>`;
  b.addEventListener('click', (e) => {
    e.stopPropagation();
    efekt.dokunma();
    tik();
  });
  return b;
}

/** Bir sayfa yüzü: kitabın sol / sağ sayfası ya da dikeyde tek sayfa */
interface Yuz {
  el: HTMLElement;
  sahne?: Sahne;
  /** Sayfanın metni (okuma bundan); yatayda sağ sayfanın yüzünde */
  metin?: MetinSayfasi;
  /** Yatayda sol sayfa: aynı metnin resim altındaki parçası (solEl) bu yüzde durur */
  metinSol?: MetinSayfasi;
}

export class Kitaplik {
  readonly el: HTMLElement;
  private raf: HTMLElement;
  private sahneEl: HTMLElement;
  private geriBtn: HTMLButtonElement;
  private modBtn: HTMLButtonElement;
  private durum: 'raf' | 'tutuluyor' | 'acik' = 'raf';
  private kitap: RafKitabi | null = null;
  /** Son sayfa (ebeveyn sayfası + Son): 0 kapak, 1..n sayfalar, n + 1 son; kitaba göre (1. kitap 15, 2. kitap 14) */
  private get son() {
    return (this.kitap?.icerik?.sayfalar.length ?? SON_SAYFA - 1) + 1;
  }
  private varlik: KitapVarliklari = kitapVarliklari('');
  private olcu: KitapOlcu = kitapOlcusu(innerWidth, innerHeight);
  /** Sayfa resimlerinin kaynak boyu (yerlesim.json → kapak.boy); resim alanı bunu aşmaz */
  private kaynak(): [number, number] {
    return this.varlik.yerlesim.sayfalar.kapak?.boy ?? VARSAYILAN_KAYNAK;
  }
  private okuyucu = new Okuyucu();
  /** Canlanan anın sözü: yenisi gelince eskisi biter */
  private sozTur = 0;
  private mod: OkumaModu = 'oku';
  private sayfa = 0;
  // açık kitap
  private kitapEl: HTMLElement | null = null;
  private sol: Yuz | null = null;
  private sag: Yuz | null = null;
  private yaprak: Yaprak | null = null;
  private cevriliyor = false;
  private suruklendi = false;
  private tutulan: { el: HTMLElement; yuz: Yuz; golge: HTMLElement; modlar: HTMLElement } | null = null;
  /** Raftaki hazır kitapların kapakları: kitap id → kapak düğmesi, kapak sahnesi, resim kaynağının boyu */
  private rafKapaklar = new Map<string, { kapak: HTMLElement; sahne: Sahne; kaynak: [number, number] }>();
  /** Tutulan / açılan kitabın raftaki kapağı (geri uçuş, rafa dönüş) */
  private get rafKapak(): HTMLElement | null {
    return (this.kitap && this.rafKapaklar.get(this.kitap.id)?.kapak) || null;
  }

  constructor(
    private kitaplar: RafKitabi[],
    private cikis: () => void,
  ) {
    this.el = document.createElement('div');
    this.el.className = 'mk-kok kt-kok';
    this.el.dataset.durum = 'raf';
    this.raf = document.createElement('div');
    this.raf.className = 'kt-raf-ekran';
    this.sahneEl = document.createElement('div');
    this.sahneEl.className = 'kt-sahne';
    this.geriBtn = dugme('kt-geri', IKON.geri, 'Geri', () => this.geri());
    this.modBtn = dugme('kt-mod', IKON.hoparlor, 'Bana oku', () => this.modDegistir(this.mod === 'oku' ? 'bak' : 'oku'));
    this.el.append(this.raf, this.sahneEl, this.geriBtn, this.modBtn);
    this.el.addEventListener('pointerdown', () => sesiAc(), { capture: true });
    this.el.addEventListener('contextmenu', (e) => e.preventDefault());
    const k = kayitOku();
    if (k.mod) this.mod = k.mod;
    this.modGoster();
    this.rafKur();
    addEventListener('resize', () => this.yenidenOlcu());
    geriDinle(() => {
      if (this.durum === 'raf') return false;
      this.geri();
      return true;
    });
    // test / izleme
    (window as unknown as { __kitap: unknown }).__kitap = {
      durum: () => this.durum,
      sayfa: () => this.sayfa,
      mod: () => this.mod,
      cevriliyor: () => this.cevriliyor,
      okunan: () => this.okuyucu.gecmis.slice(),
      okuyor: () => this.okuyucu.aktif,
      kaynak: () => ({ ...this.okuyucu.kaynak }),
      sahne: () => (this.sol?.sahne ?? this.sag?.sahne)?.durum() ?? null,
      olcu: () => this.olcu,
      cevir: (yon: 1 | -1) => this.cevir(yon),
    };
  }

  // ---------------------------------------------------------------- kitaplık

  private rafKur() {
    this.raf.replaceChildren();
    this.rafKapaklar.clear();
    const raflar = document.createElement('div');
    raflar.className = 'kt-raflar';
    for (const k of this.kitaplar) {
      const oge = document.createElement('div');
      oge.className = 'kt-raf-oge';
      if (k.icerik) {
        const kapak = document.createElement('button');
        kapak.type = 'button';
        kapak.className = 'kt-raf-kapak';
        kapak.dataset.kitap = k.id;
        kapak.setAttribute('aria-label', k.baslik);
        kapak.style.setProperty('--kapak', k.renk);
        const varlik = kitapVarliklari(k.id);
        const s = new Sahne({ no: 0, renk: k.icerik.kapak.renk, tarif: k.icerik.kapak.tarif, etiket: 'Kapak', canli: k.canli?.[0], varlik });
        const ad = document.createElement('div');
        ad.className = 'kt-kapak-baslik';
        ad.textContent = k.baslik;
        kapak.append(s.el, ad, seriAdi());
        kapak.addEventListener('click', () => this.tut(k, kapak));
        this.rafKapaklar.set(k.id, { kapak, sahne: s, kaynak: varlik.yerlesim.sayfalar.kapak?.boy ?? VARSAYILAN_KAYNAK });
        oge.append(kapak);
      } else {
        const sirt = document.createElement('button');
        sirt.type = 'button';
        sirt.className = 'kt-sirt-kitap';
        sirt.style.setProperty('--sirt', k.renk);
        sirt.style.setProperty('--uz', String(k.baslik.length));
        sirt.setAttribute('aria-label', `${k.baslik} (yakında)`);
        const ad = document.createElement('span');
        ad.className = 'kt-sirt-ad';
        ad.textContent = k.baslik;
        const yakinda = document.createElement('span');
        yakinda.className = 'kt-yakinda';
        yakinda.textContent = 'yakında';
        sirt.append(ad, yakinda);
        sirt.addEventListener('click', () => {
          efekt.tink();
          sirt.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-7%)' }, { transform: 'translateY(0)' }, { transform: 'translateY(-2%)' }, { transform: 'translateY(0)' }], { duration: 480, easing: 'ease-out' });
        });
        oge.append(sirt);
      }
      raflar.append(oge);
    }
    this.raf.append(raflar);
    this.rafOlcu();
  }

  /**
   * Raf ölçüleri: kapak açık kitabın sayfa oranında (tutulunca aynı kitap öne gelir); sırtlar kapağın %80-98'i.
   * Kapakta çizim üstte kenardan kenara (netlik: kaynak eni / 3'ü aşmaz), altında kitabın renginde başlık.
   */
  private rafOlcu() {
    const w = innerWidth;
    const h = innerHeight;
    const yatay = w > h;
    const o = kitapOlcusu(w, h);
    const oran = o.pw / o.ph;
    const kapakH = Math.round(yatay ? Math.min(h * 0.42, 240) : Math.min(w * 0.5, 260));
    const kapakW = Math.round(kapakH * oran);
    this.raf.style.setProperty('--kapak-h', `${kapakH}px`);
    this.raf.style.setProperty('--kapak-w', `${kapakW}px`);
    for (const { sahne, kaynak } of this.rafKapaklar.values()) {
      const rw = Math.min(kapakW, resimEnCok(kaynak));
      const rh = Math.round(rw / sahne.oran);
      const pay = (kapakW - rw) / 2;
      // yatık kapak: resim üstte, başlık altta; dik kapak: başlık üstte, resim ortanın biraz üstünde
      const ust = yatay ? pay : Math.round((kapakH - rh) * 0.46);
      Object.assign(sahne.el.style, { left: `${pay}px`, top: `${ust}px`, width: `${rw}px`, height: `${rh}px` });
      const kap = sahne.el.parentElement;
      kap?.classList.toggle('kt-dik', !yatay);
      kap?.style.setProperty('--baslik-ust', yatay ? `${rh + 2 * pay}px` : '0px');
      kap?.style.setProperty('--baslik-alt', yatay ? '0px' : `${kapakH - ust}px`);
      sahne.boyutla(rw, rh);
    }
  }

  // ---------------------------------------------------------------- kitabı alma (3D)

  private kapakYuzu(k: RafKitabi, varlik: KitapVarliklari, canli: boolean): Yuz {
    const ic = k.icerik!;
    const el = document.createElement('div');
    el.className = 'kt-sayfa kt-kapak-yuz';
    el.style.setProperty('--kapak', k.renk);
    const sahne = new Sahne({ no: 0, renk: ic.kapak.renk, tarif: ic.kapak.tarif, etiket: 'Kapak', canli: k.canli?.[0], varlik, soz: (kim, m) => this.soz(kim, m), bulundu: (id) => this.bulundu(0, id) });
    const metin = new MetinSayfasi(ic.kapak.satirlar, { baslik: ic.baslik, satirTik: (i) => this.satirOku(i, 0) });
    metin.el.classList.add('kt-kapak-metin');
    // dikey kapakta başlık resmin üstünde, kapak sözü altında (solEl); yatayda ikisi de resmin altında
    metin.solEl.classList.add('kt-kapak-metin', 'kt-kapak-alt');
    el.append(sahne.el, metin.el, metin.solEl, seriAdi());
    if (canli) sahne.okumaSuruyor = () => this.okuyucu.aktif;
    return { el, sahne, metin };
  }

  private tut(k: RafKitabi, kapakEl: HTMLElement) {
    if (this.durum !== 'raf' || !k.icerik) return;
    efekt.cevir();
    this.kitap = k;
    this.varlik = kitapVarliklari(k.id);
    this.durum = 'tutuluyor';
    this.el.dataset.durum = 'tutuluyor';
    this.olcu = kitapOlcusu(innerWidth, innerHeight, this.kaynak());
    const { pw, ph } = this.olcu;
    // tutulan kitap: ön kapak + sırt + sayfa kalınlığı (üst, alt, yan) + arka kapak
    const kutu = document.createElement('div');
    kutu.className = 'kt-tutulan';
    kutu.style.setProperty('--kapak', k.renk);
    Object.assign(kutu.style, { width: `${pw}px`, height: `${ph}px` });
    const yuz = this.kapakYuzu(k, this.varlik, true);
    yuz.el.classList.add('kt-t-on');
    const parca = (s: string) => {
      const d = document.createElement('div');
      d.className = s;
      return d;
    };
    kutu.append(parca('kt-t-arka'), parca('kt-t-sirt'), parca('kt-t-kenar'), parca('kt-t-ust'), parca('kt-t-alt'), yuz.el);
    const golge = parca('kt-t-golge');
    Object.assign(golge.style, { width: `${pw}px`, height: `${Math.round(ph * 0.16)}px` });
    const modlar = document.createElement('div');
    modlar.className = 'kt-modlar';
    const modDugme = (m: OkumaModu, ikon: string, yazi: string) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `kt-mod-sec kt-mod-${m}`;
      b.dataset.mod = m;
      b.innerHTML = `<span class="ikon" aria-hidden="true">${ikon}</span><span>${yazi}</span>`;
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        efekt.secim();
        void this.ac(m);
      });
      return b;
    };
    modlar.append(modDugme('oku', IKON.hoparlor, 'Bana oku'), modDugme('bak', IKON.goz, 'Kendim bakayım'));
    this.sahneEl.replaceChildren(golge, kutu, modlar);
    // yazı kitap sahnedeyken ölçülür (sığdırma için yüzün gerçek boyu gerekir)
    this.yuzBoyutla(yuz, pw, ph);
    this.tutulan = { el: kutu, yuz, golge, modlar };
    yuz.sahne?.baslat();
    // FLIP: raftaki kapağın yerinden öne
    const r = kapakEl.getBoundingClientRect();
    const hedef = this.tutulanYeri();
    const s = r.height / ph;
    kutu.style.transition = 'none';
    kutu.style.transform = `translate3d(${r.left}px, ${r.top}px, 0) scale(${s})`;
    kapakEl.style.visibility = 'hidden';
    void kutu.offsetWidth;
    kutu.style.transition = `transform ${sure(700)}ms cubic-bezier(.25,.8,.3,1)`;
    kutu.style.transform = hedef.donusum;
    golge.style.transform = hedef.golge;
    window.setTimeout(() => this.el.classList.add('kt-mod-acik'), sure(450));
  }

  /** Tutulan kitabın yeri: yatayda solda (modlar sağda), dikeyde üstte (modlar altta); hafif eğik */
  private tutulanYeri(egik = true) {
    const { pw, ph } = this.olcu;
    const w = innerWidth;
    const h = innerHeight;
    const yatay = w > h;
    const s = yatay ? Math.min(1, (h * 0.8) / ph, (w * 0.5) / pw) : Math.min(1, (h * 0.58) / ph, (w * 0.78) / pw);
    const x = yatay ? w * 0.3 - (pw * s) / 2 : (w - pw * s) / 2;
    const y = yatay ? (h - ph * s) / 2 : h * 0.1;
    const don = egik ? ' rotateY(17deg) rotateX(-9deg)' : '';
    return {
      donusum: `translate3d(${x}px, ${y}px, 0) scale(${s})${don}`,
      golge: `translate3d(${x + pw * s * 0.1}px, ${y + ph * s * 0.93}px, 0) scale(${s})`,
    };
  }

  /**
   * Yüzün ölçüleri. Resim çizimin oranında ve netlik sınırında (kitapOlcusu), sayfanın üstünde kenardan kenara
   * (sayfa çizimden genişse eşit payla ortada). Yazı resmin altından başlar: yatayda sol sayfada resmin altına sığan
   * satırlar, kalanı sağ sayfada (MetinSayfasi.sigdir böler); dikeyde hepsi resmin altında. Kapakta resmin altında
   * başlık. Resim büyütülmez, kırpılmaz.
   */
  private yuzBoyutla(y: Yuz, w: number, h: number) {
    Object.assign(y.el.style, { width: `${w}px`, height: `${h}px` });
    const { resimW, resimH } = this.olcu;
    const kapak = y.el.classList.contains('kt-kapak-yuz');
    const rw = Math.min(resimW, w);
    const rh = Math.round((rw * resimH) / resimW);
    const pay = Math.max(0, Math.round((w - rw) / 2));
    y.el.style.setProperty('--resim-h', `${y.sahne ? rh + 2 * pay : 0}px`);
    // dikey kapak (uzun): resim ortanın biraz üstünde, başlık üstünde, kapak sözü altında
    const dikKapak = kapak && h > w * 1.2;
    y.el.classList.toggle('kt-dik', dikKapak);
    const ust = dikKapak ? Math.round((h - rh) * 0.46) : pay;
    if (kapak && y.metin) {
      Object.assign(y.metin.el.style, dikKapak ? { top: '0px', bottom: 'auto', height: `${ust}px` } : { top: '', bottom: '', height: '' });
      Object.assign(y.metin.solEl.style, dikKapak ? { top: `${ust + rh}px`, height: `${h - ust - rh}px` } : { top: '', height: '' });
      y.metin.solEl.classList.toggle('kt-yok', !dikKapak);
    }
    if (y.sahne) {
      Object.assign(y.sahne.el.style, { left: `${pay}px`, top: `${ust}px`, width: `${rw}px`, height: `${rh}px` });
      y.sahne.el.classList.toggle('kt-pay', pay > 0);
      y.sahne.boyutla(rw, rh);
    }
    // yatay sol sayfa: metnin resim altındaki parçası (en az iki satırlık yer yoksa gizli)
    if (y.metinSol) y.metinSol.solEl.classList.toggle('kt-yok', h - rh - 2 * pay < 64);
    if (y.metin) {
      if (kapak) y.metin.sigdir(dikKapak ? Math.min(34, w * 0.1) : Math.min(30, h * 0.085), 11);
      // en büyük boy sayfa enine göre (telefonda 23-25 px, tablette 30-34 px)
      else y.metin.sigdir(this.olcu.yatay ? Math.max(23, Math.min(30, w * 0.058)) : Math.max(25, Math.min(34, w * 0.046)), 13);
    }
    const eb = y.el.querySelector<HTMLElement>('.kt-ebeveyn');
    if (eb) {
      const ic = eb.querySelector<HTMLElement>('.kt-metin-ic')!;
      for (let px = 17; px >= 11; px -= 0.5) {
        eb.style.setProperty('--yazi', `${px}px`);
        const cs = getComputedStyle(eb);
        if (ic.scrollHeight <= eb.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) break;
      }
    }
  }

  // ---------------------------------------------------------------- açma

  private async ac(mod: OkumaModu) {
    if (this.durum !== 'tutuluyor' || !this.tutulan || !this.kitap?.icerik) return;
    this.modDegistir(mod, false);
    const t = this.tutulan;
    this.el.classList.remove('kt-mod-acik');
    // kitap düzleşir ve okuma yerine gelir (kapak sağ sayfanın yerinde)
    const { pw, x, y, yatay } = this.olcu;
    const kx = yatay ? x + pw : x;
    t.el.style.transition = `transform ${sure(600)}ms cubic-bezier(.4,.1,.3,1)`;
    t.el.style.transform = `translate3d(${kx}px, ${y}px, 0) scale(1)`;
    t.golge.style.opacity = '0';
    await bekle(sure(640));
    const ilk = ilerleme(this.kitap.id).sayfa;
    const hedef = ilk >= 1 && ilk < this.son ? ilk : 1;
    // açık kitaba geç: önce kapalı (sayfa 0), sonra kapak açılır
    t.yuz.sahne?.durdur();
    this.durum = 'acik';
    this.el.dataset.durum = 'acik';
    this.tutulan = null;
    this.acikKur(0);
    await kare();
    // "Bana oku": anlatıcı kapaktaki sözü okur (kapalı kitabın kapağında), sonra kapak açılır
    if (this.mod === 'oku' && this.sag?.metin) {
      const okundu = await this.okuyucu.sayfaOku(this.sag.metin, 'kapak');
      if (!okundu || this.durum !== 'acik' || this.sayfa !== 0) return;
      await bekle(sure(250));
    }
    await this.cevir(1, hedef, sure(900));
  }

  /** Açık kitabın iskeleti: cilt, sayfa kalınlıkları, oluk gölgesi, köşeler */
  private acikKur(sayfa: number) {
    this.okuyucu.dur();
    this.sol?.sahne?.durdur();
    this.sag?.sahne?.durdur();
    const { pw, ph, x, y, yatay } = this.olcu;
    const k = document.createElement('div');
    k.className = `kt-kitap ${yatay ? 'kt-yatay' : 'kt-dikey'}`;
    k.style.setProperty('--kapak', this.kitap!.renk);
    Object.assign(k.style, { left: `${x}px`, top: `${y}px`, width: `${yatay ? pw * 2 : pw}px`, height: `${ph}px` });
    const cilt = document.createElement('div');
    cilt.className = 'kt-cilt';
    const kalinSol = document.createElement('div');
    kalinSol.className = 'kt-kalinlik kt-kalinlik-sol';
    const kalinSag = document.createElement('div');
    kalinSag.className = 'kt-kalinlik kt-kalinlik-sag';
    const oluk = document.createElement('div');
    oluk.className = 'kt-oluk';
    const ileri = document.createElement('button');
    ileri.type = 'button';
    ileri.className = 'kt-kose kt-kose-ileri';
    ileri.setAttribute('aria-label', 'Sonraki sayfa');
    ileri.addEventListener('click', (e) => {
      e.stopPropagation();
      void this.cevir(1);
    });
    const geri = document.createElement('button');
    geri.type = 'button';
    geri.className = 'kt-kose kt-kose-geri';
    geri.setAttribute('aria-label', 'Önceki sayfa');
    geri.addEventListener('click', (e) => {
      e.stopPropagation();
      void this.cevir(-1);
    });
    const altGolge = document.createElement('div');
    altGolge.className = 'kt-alt-golge';
    k.append(cilt, kalinSol, kalinSag, oluk, altGolge, ileri, geri);
    this.kitapEl = k;
    this.surukleKur(k);
    this.sahneEl.replaceChildren(k);
    this.sayfaKur(sayfa);
  }

  /** Durağan açık sayfa(lar)ı kurar */
  private sayfaKur(sayfa: number) {
    const k = this.kitapEl!;
    this.sol?.sahne?.durdur();
    this.sag?.sahne?.durdur();
    this.sol?.el.remove();
    this.sag?.el.remove();
    this.sayfa = sayfa;
    const { yatay } = this.olcu;
    if (yatay) {
      this.sag = this.yuzYap(sayfa, 'sag');
      this.sol = this.yuzYap(sayfa, 'sol', this.sag.metin);
    } else {
      this.sol = null;
      this.sag = this.yuzYap(sayfa, 'tek');
    }
    const oluk = k.querySelector('.kt-oluk')!;
    for (const y of [this.sol, this.sag]) if (y) k.insertBefore(y.el, oluk);
    this.yuzleriOlc();
    k.dataset.sayfa = String(sayfa);
    k.classList.toggle('kt-kapali', sayfa === 0);
    k.classList.toggle('kt-sonda', sayfa === this.son);
    this.kalinlikGoster();
    for (const y of [this.sol, this.sag]) {
      if (y?.sahne) {
        y.sahne.okumaSuruyor = () => this.okuyucu.aktif;
        y.sahne.baslat();
      }
    }
    this.kaydet();
  }

  private yuzleriOlc() {
    const { pw, ph, yatay } = this.olcu;
    if (this.sol) {
      this.sol.el.style.left = '0px';
      this.yuzBoyutla(this.sol, pw, ph);
    }
    if (this.sag) {
      this.sag.el.style.left = yatay ? `${pw}px` : '0px';
      this.yuzBoyutla(this.sag, pw, ph);
    }
  }

  /** Sayfa yüzü: yatayda sol = resim, sağ = yazı; dikeyde tek = resim + yazı. 0 = kapak, son = ebeveyn + son */
  private yuzYap(sayfa: number, yer: 'sol' | 'sag' | 'tek', ortak?: MetinSayfasi): Yuz {
    const ic = this.kitap!.icerik!;
    const el = document.createElement('div');
    el.className = `kt-sayfa kt-sayfa-${yer}`;
    if (sayfa === 0) {
      if (yer === 'sol') {
        el.classList.add('kt-bos');
        return { el };
      }
      const y = this.kapakYuzu(this.kitap!, this.varlik, true);
      y.el.classList.add(`kt-sayfa-${yer}`);
      return y;
    }
    if (sayfa === this.son) {
      if (yer === 'sol' || yer === 'tek') el.append(ebeveynSayfasi(ic.ebeveyn));
      if (yer === 'sag' || yer === 'tek') el.append(this.sonSayfasi());
      el.classList.add('kt-son');
      return { el };
    }
    const s = ic.sayfalar[sayfa - 1];
    const y: Yuz = { el };
    if (yer !== 'sag') {
      y.sahne = new Sahne({ no: sayfa, renk: s.renk, tarif: s.tarif, canli: this.kitap!.canli?.[sayfa], varlik: this.varlik, soz: (kim, m) => this.soz(kim, m), bulundu: (id) => this.bulundu(sayfa, id) });
      el.append(y.sahne.el);
    }
    if (yer === 'sol' && ortak) {
      // aynı sayfanın metni: resmin altına sığan satırlar burada durur (bölme sağ yüz ölçülürken)
      y.metinSol = ortak;
      el.append(ortak.solEl);
    }
    if (yer !== 'sol') {
      y.metin = new MetinSayfasi(s.satirlar, { no: sayfa, satirTik: (i) => this.satirOku(i, sayfa), yuz: (kim) => this.yuzResmi(kim) });
      el.append(y.metin.el);
    }
    return y;
  }

  /** Konuşanın küçük yüzü: kitabın kendi çiziminden; yoksa (çizimi gelmemiş kitap) aynı karakterin ilk kitaptaki yüzü */
  private yuzResmi(kim: Kim): string | null {
    const ad = `yuz-${kim}.webp`;
    return this.varlik.url(ad) ?? kitapVarliklari('okul').url(ad);
  }

  private sonSayfasi(): HTMLElement {
    const el = document.createElement('div');
    el.className = 'kt-son-ic';
    const son = document.createElement('div');
    son.className = 'kt-son-yazi';
    son.textContent = 'Son';
    // bulunan uğur böcekleri (her sayfada bir tane): düz noktalar
    const ugur = document.createElement('div');
    ugur.className = 'kt-ugurlar';
    const bulunan = ilerleme(this.kitap!.id).bulunan;
    for (let i = 0; i < this.son; i++) {
      const n = document.createElement('span');
      n.className = (bulunan[sayfaAnahtari(i)] ?? []).includes('ugur') ? 'kt-ug-nokta kt-dolu' : 'kt-ug-nokta';
      ugur.append(n);
    }
    const dugmeler = document.createElement('div');
    dugmeler.className = 'kt-son-dugmeler';
    const bastan = dugme('kt-bastan', IKON.tekrar, 'Baştan oku', () => void this.bastan());
    const rafa = dugme('kt-rafa', IKON.izgara, 'Kitaplığa dön', () => this.rafaDon());
    dugmeler.append(bastan, rafa);
    el.append(son, ugur, dugmeler);
    return el;
  }

  private kalinlikGoster() {
    const k = this.kitapEl!;
    const oran = this.sayfa / this.son;
    k.style.setProperty('--sol-kalin', `${(this.sayfa === 0 ? 0 : 2 + 7 * oran).toFixed(1)}px`);
    k.style.setProperty('--sag-kalin', `${(2 + 7 * (1 - oran)).toFixed(1)}px`);
  }

  // ---------------------------------------------------------------- sayfa çevirme

  private izinli(yon: 1 | -1) {
    return yon === 1 ? this.sayfa < this.son : this.sayfa > (this.olcu.yatay ? 0 : 0);
  }

  /** Çevirme için yaprak kurar: alttaki sayfalar hedefe geçer, yaprak eski sayfanın kopyasını taşır */
  private yaprakKur(yon: 1 | -1, hedef: number): { bitir: () => void; iptal: () => void } {
    const k = this.kitapEl!;
    const { pw, ph, yatay } = this.olcu;
    this.okuyucu.dur();
    const eskiSol = this.sol;
    const eskiSag = this.sag;
    eskiSol?.sahne?.durdur();
    eskiSag?.sahne?.durdur();
    const yeniSag = this.yuzYap(hedef, yatay ? 'sag' : 'tek');
    const yeniSol = yatay ? this.yuzYap(hedef, 'sol', yeniSag.metin) : null;
    // ölç (kopyalar doğru boyda olsun)
    const olcBunu = (y: Yuz | null, sol: boolean) => {
      if (!y) return;
      y.el.style.left = sol || !yatay ? '0px' : `${pw}px`;
      this.yuzBoyutla(y, pw, ph);
    };
    const oluk = k.querySelector('.kt-oluk')!;
    // yer tutucu ölçümü için önce kitaba (görünmez) eklenir
    for (const [y, sol] of [[yeniSol, true], [yeniSag, false]] as const) {
      if (!y) continue;
      y.el.style.visibility = 'hidden';
      k.insertBefore(y.el, oluk);
      olcBunu(y, sol);
    }
    let yaprak: Yaprak;
    const altGolge = k.querySelector<HTMLElement>('.kt-alt-golge')!;
    if (yatay) {
      if (yon === 1) {
        // sağ sayfa (yazı) sola döner; arkasında hedefin sol sayfası (resim). Altta: sol eski kalır, sağ yeni.
        yaprak = new Yaprak({ x: pw, y: 0, w: pw, h: ph, omurga: 'sol', aci0: 0, aci1: -180, on: eskiSag!.el, arka: yeniSol!.el });
        eskiSag!.el.style.visibility = 'hidden';
        yeniSag.el.style.visibility = '';
        altGolge.className = 'kt-alt-golge kt-ag-sag';
      } else {
        yaprak = new Yaprak({ x: 0, y: 0, w: pw, h: ph, omurga: 'sag', aci0: 0, aci1: 180, on: eskiSol!.el, arka: yeniSag.el });
        eskiSol!.el.style.visibility = 'hidden';
        yeniSol!.el.style.visibility = '';
        altGolge.className = 'kt-alt-golge kt-ag-sol';
      }
    } else if (yon === 1) {
      yaprak = new Yaprak({ x: 0, y: 0, w: pw, h: ph, omurga: 'sol', aci0: 0, aci1: -180, on: eskiSag!.el, arka: null });
      eskiSag!.el.style.visibility = 'hidden';
      yeniSag.el.style.visibility = '';
      altGolge.className = 'kt-alt-golge kt-ag-tek';
    } else {
      // dikey geri: önceki sayfa soldan gelip üstü kapatır
      yaprak = new Yaprak({ x: 0, y: 0, w: pw, h: ph, omurga: 'sol', aci0: -180, aci1: 0, on: yeniSag.el, arka: null });
      altGolge.className = 'kt-alt-golge kt-ag-tek';
    }
    k.insertBefore(yaprak.el, altGolge.nextSibling);
    this.yaprak = yaprak;
    const temizle = () => {
      yaprak.kaldir();
      this.yaprak = null;
      altGolge.style.opacity = '0';
    };
    return {
      bitir: () => {
        temizle();
        eskiSol?.el.remove();
        eskiSag?.el.remove();
        for (const y of [yeniSol, yeniSag]) if (y) y.el.style.visibility = '';
        this.sol = yeniSol;
        this.sag = yeniSag;
        this.sayfa = hedef;
        k.dataset.sayfa = String(hedef);
        k.classList.toggle('kt-kapali', hedef === 0);
        k.classList.toggle('kt-sonda', hedef === this.son);
        this.kalinlikGoster();
        for (const y of [this.sol, this.sag]) {
          if (y?.sahne) {
            y.sahne.okumaSuruyor = () => this.okuyucu.aktif;
            y.sahne.baslat();
          }
        }
        this.kaydet();
      },
      iptal: () => {
        temizle();
        yeniSol?.sahne?.durdur();
        yeniSag.sahne?.durdur();
        yeniSol?.el.remove();
        yeniSag.el.remove();
        for (const y of [eskiSol, eskiSag]) if (y) y.el.style.visibility = '';
        eskiSol?.sahne?.baslat();
        eskiSag?.sahne?.baslat();
      },
    };
  }

  private golgeAyarla(p: number) {
    const g = this.kitapEl?.querySelector<HTMLElement>('.kt-alt-golge');
    if (g) g.style.opacity = (Math.sin(Math.PI * p) * 0.55).toFixed(3);
  }

  /** Dokunarak (köşe) çevirme: yaprak kendiliğinden döner */
  async cevir(yon: 1 | -1, hedef = this.sayfa + yon, ms = 760, okuma = true) {
    if (this.durum !== 'acik' || this.cevriliyor || !this.izinli(yon)) return;
    this.cevriliyor = true;
    efekt.sayfa();
    const c = this.yaprakKur(yon, hedef);
    await this.oynat(0, 1, sure(ms));
    c.bitir();
    this.cevriliyor = false;
    if (okuma) this.cevrildi();
  }

  private oynat(p0: number, p1: number, ms: number): Promise<void> {
    return new Promise((coz) => {
      const bas = performance.now();
      const adim = (t: number) => {
        const u = Math.min(1, (t - bas) / Math.max(1, ms));
        // yumuşak başla, yumuşak dur
        const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        const p = p0 + (p1 - p0) * e;
        this.yaprak?.ayarla(p);
        this.golgeAyarla(p);
        if (u < 1) requestAnimationFrame(adim);
        else coz();
      };
      requestAnimationFrame(adim);
    });
  }

  private cevrildi() {
    this.etkilesim();
    if (this.mod === 'oku') void this.sayfayiOku();
  }

  private async sayfayiOku() {
    const m = this.sag?.metin;
    if (!m || this.sayfa === 0 || this.sayfa === this.son) return;
    const benimSayfa = this.sayfa;
    this.okuyucu.hazirla(m);
    await bekle(sure(450));
    if (this.sayfa !== benimSayfa || this.cevriliyor || this.mod !== 'oku') return;
    await this.okuyucu.sayfaOku(m, sayfaAnahtari(this.sayfa));
  }

  private satirOku(i: number, sayfa: number) {
    this.etkilesim();
    const m = this.durum === 'tutuluyor' ? this.tutulan?.yuz.metin : sayfa === this.sayfa ? this.sag?.metin : undefined;
    if (!m) return;
    void this.okuyucu.tekSatir(m, sayfaAnahtari(sayfa), i);
  }

  /** Parmakla sürükleme: yatay hareket 10 px'i geçince yaprak parmağı izler */
  private surukleKur(k: HTMLElement) {
    let bas: { x: number; y: number; t: number; id: number } | null = null;
    let c: { bitir: () => void; iptal: () => void } | null = null;
    let yon: 1 | -1 = 1;
    let p = 0;
    let son = { x: 0, t: 0, v: 0 };
    let raf = 0;
    let bekleyenP = 0;
    const ciz = () => {
      raf = 0;
      this.yaprak?.ayarla(bekleyenP);
      this.golgeAyarla(bekleyenP);
    };
    k.addEventListener('pointerdown', (e) => {
      this.etkilesim();
      if (this.cevriliyor || !e.isPrimary) return;
      bas = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId };
      this.suruklendi = false;
      son = { x: e.clientX, t: performance.now(), v: 0 };
    });
    k.addEventListener('pointermove', (e) => {
      if (!bas || e.pointerId !== bas.id) return;
      const dx = e.clientX - bas.x;
      const dy = e.clientY - bas.y;
      const simdi = performance.now();
      son = { x: e.clientX, t: simdi, v: (e.clientX - son.x) / Math.max(1, simdi - son.t) };
      if (!c) {
        if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
        yon = dx < 0 ? 1 : -1;
        if (!this.izinli(yon) || this.cevriliyor) {
          bas = null;
          return;
        }
        this.suruklendi = true;
        this.cevriliyor = true;
        k.setPointerCapture(e.pointerId);
        efekt.sayfa();
        c = this.yaprakKur(yon, this.sayfa + yon);
      }
      p = Math.min(1, Math.max(0, (-dx * yon) / (this.olcu.pw * 1.15)));
      bekleyenP = p;
      if (!raf) raf = requestAnimationFrame(ciz);
    });
    const birak = async (e: PointerEvent) => {
      if (!bas || e.pointerId !== bas.id) return;
      bas = null;
      if (!c) return;
      const cc = c;
      c = null;
      if (raf) cancelAnimationFrame(raf), (raf = 0);
      // hızlı fiske de çevirir
      const tamam = p > 0.33 || -son.v * yon > 0.45;
      await this.oynat(p, tamam ? 1 : 0, sure(Math.max(140, 420 * (tamam ? 1 - p : p))));
      if (tamam) {
        cc.bitir();
        this.cevriliyor = false;
        this.cevrildi();
      } else {
        cc.iptal();
        this.cevriliyor = false;
      }
    };
    k.addEventListener('pointerup', (e) => void birak(e));
    k.addEventListener('pointercancel', (e) => void birak(e));
    // sürüklemeden sonra gelen tıklama sahnede bir şey tetiklemesin
    k.addEventListener(
      'click',
      (e) => {
        if (this.suruklendi) {
          e.stopPropagation();
          e.preventDefault();
          this.suruklendi = false;
        }
      },
      { capture: true },
    );
  }

  // ---------------------------------------------------------------- mod, ses, kayıt

  private modDegistir(m: OkumaModu, oku = true) {
    this.mod = m;
    const k = kayitOku();
    k.mod = m;
    kayitYaz(k);
    this.modGoster();
    if (m === 'bak') this.okuyucu.dur();
    else if (oku && this.durum === 'acik') void this.sayfayiOku();
  }

  private modGoster() {
    this.modBtn.innerHTML = `<span class="ikon" aria-hidden="true">${this.mod === 'oku' ? IKON.hoparlor : IKON.goz}</span>`;
    this.modBtn.setAttribute('aria-label', this.mod === 'oku' ? 'Bana oku açık' : 'Kendim bakayım');
    this.modBtn.dataset.mod = this.mod;
  }

  /** Karakter sözü (canlanan an): okuma sürerken söylenmez (anlatıcıyı kesmesin); kaydı yoksa sessiz (robot ses yok) */
  private soz(kim: Kim, metin: string) {
    if (this.okuyucu.aktif) return;
    const tur = ++this.sozTur;
    void satirSoyle(kim, metin, { iptal: () => tur !== this.sozTur || this.okuyucu.aktif });
  }

  private bulundu(sayfa: number, id: string) {
    if (!this.kitap) return;
    const i = ilerleme(this.kitap.id);
    const a = sayfaAnahtari(sayfa);
    const l = (i.bulunan[a] ??= []);
    if (!l.includes(id)) l.push(id);
    kayitYaz(kayitOku());
  }

  private kaydet() {
    if (!this.kitap) return;
    const i = ilerleme(this.kitap.id);
    if (this.sayfa === this.son) {
      if (i.sayfa !== 0) i.bitti++;
      i.sayfa = 0;
    } else if (this.sayfa > 0) i.sayfa = this.sayfa;
    kayitYaz(kayitOku());
  }

  private etkilesim() {
    this.sol?.sahne?.etkilesim();
    this.sag?.sahne?.etkilesim();
  }

  // ---------------------------------------------------------------- geri, ölçü

  private async bastan() {
    if (this.durum !== 'acik') return;
    this.okuyucu.dur();
    this.sayfaKur(1);
    this.cevrildi();
  }

  private rafaDon() {
    this.okuyucu.dur();
    sus();
    this.sol?.sahne?.durdur();
    this.sag?.sahne?.durdur();
    this.tutulan?.yuz.sahne?.durdur();
    this.sol = this.sag = null;
    this.tutulan = null;
    this.kitapEl = null;
    this.yaprak = null;
    this.cevriliyor = false;
    this.durum = 'raf';
    this.el.dataset.durum = 'raf';
    this.el.classList.remove('kt-mod-acik');
    this.sahneEl.replaceChildren();
    if (this.rafKapak) {
      this.rafKapak.style.visibility = '';
      this.rafKapak.animate([{ transform: 'translateY(-6%) scale(1.04)' }, { transform: 'none' }], { duration: sure(380), easing: 'ease-out' });
    }
  }

  private geri() {
    if (this.durum === 'raf') {
      sus();
      this.cikis();
      return;
    }
    if (this.durum === 'tutuluyor' && this.tutulan && this.rafKapak) {
      // kitap rafa geri uçar
      const r = this.rafKapak.getBoundingClientRect();
      const t = this.tutulan;
      t.el.style.transition = `transform ${sure(450)}ms ease-in`;
      t.el.style.transform = `translate3d(${r.left}px, ${r.top}px, 0) scale(${r.height / this.olcu.ph})`;
      t.golge.style.opacity = '0';
      this.el.classList.remove('kt-mod-acik');
      window.setTimeout(() => this.rafaDon(), sure(460));
      return;
    }
    this.rafaDon();
  }

  private yenidenOlcu() {
    this.rafOlcu();
    const yeni = kitapOlcusu(innerWidth, innerHeight, this.kaynak());
    const degisti = yeni.yatay !== this.olcu.yatay || yeni.pw !== this.olcu.pw || yeni.ph !== this.olcu.ph;
    this.olcu = yeni;
    if (!degisti) return;
    if (this.durum === 'acik') {
      this.cevriliyor = false;
      this.yaprak?.kaldir();
      this.yaprak = null;
      this.acikKur(this.sayfa);
    } else if (this.durum === 'tutuluyor' && this.tutulan) {
      const { pw, ph } = this.olcu;
      Object.assign(this.tutulan.el.style, { width: `${pw}px`, height: `${ph}px`, transition: 'none' });
      this.yuzBoyutla(this.tutulan.yuz, pw, ph);
      const h = this.tutulanYeri();
      this.tutulan.el.style.transform = h.donusum;
      this.tutulan.golge.style.transform = h.golge;
    }
  }
}
