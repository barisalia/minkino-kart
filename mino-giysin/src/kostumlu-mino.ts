/**
 * Kostümlü Mino: src/mino/mino.ts + kostüm katmanları (mino.kostum()), fırlat-yakala, kafadan çıkarıp atma, ayna.
 *
 * Kollar dönmez; poz() / otur() çağrılmaz. Hareket ifade(), tepki() ve bütün gövdenin ötelenip ezilip esnemesiyle
 * (.mg-mino-ic, taban pivotlu). Uçan parçalar ekranın uçuş katmanında (.mg-ucus) uçar; varınca "pof" bulutu değişimi
 * örter ve parça Mino'daki yerine oturur (bölge eşleme yok: nereye bırakılırsa bırakılsın kendi yerine).
 */
import { Mino, MINO_KOSTUM_YERLERI, type MinoKostumYer } from '../../src/mino/mino';
import { h, TEST_MODU } from '../../src/ui/dom';
import { bekle, hopla, kavis, ms, oynat, type Nokta } from './anim';
import { parca, yerDegistir, type Giyili, type ParcaId } from './model';
import { ikonResmi, parcaKostum, parcaResmi } from './resimler';
import { ses } from './ses';

/** Mino çiziminin viewBox'ı (src/mino/mino-svg.ts) */
const VB = { x: 344, y: 140, w: 1360, h: 1790 };
/** ayak tabanı (çizimin y'si): kutunun bu oranı */
export const MINO_TABAN = (1885 - VB.y) / VB.h;
export const MINO_ORAN = VB.h / VB.w;

export class KostumluMino {
  readonly mino = new Mino();
  /** bütün gövde hareketi (yürüme, zıplama, ezilme): taban pivotlu */
  readonly ic: HTMLElement;
  readonly el: HTMLElement;
  giyili: Giyili = {};

  constructor(giyili: Giyili = {}) {
    this.ic = h('div.mg-mino-ic', {}, this.mino.el);
    this.el = h('div.mg-mino', { 'data-kim': 'mino' }, this.ic);
    this.giydir(giyili);
  }

  /** Kostümü animasyonsuz uygular */
  giydir(g: Giyili) {
    this.giyili = { ...g };
    const ayar: Partial<Record<MinoKostumYer, ReturnType<typeof parcaKostum> | null>> = {};
    for (const y of MINO_KOSTUM_YERLERI) {
      const id = this.giyili[y];
      ayar[y] = id ? parcaKostum(id) : null;
    }
    this.mino.kostum(ayar);
    this.el.dataset.giyili = MINO_KOSTUM_YERLERI.map((y) => this.giyili[y] ?? '').join(',');
  }

  /** Mino çiziminin bir noktası, kabın (ekranın) koordinatında */
  nokta(x: number, y: number, kap: HTMLElement): Nokta {
    const p = this.mino.ekranNoktasi(x, y);
    const r = kap.getBoundingClientRect();
    return { x: p.x - r.left, y: p.y - r.top };
  }
  /** Çizim biriminin ekrandaki px karşılığı */
  olcek(): number {
    const r = this.mino.el.querySelector('svg')?.getBoundingClientRect();
    return r && r.width ? r.width / VB.w : 0.2;
  }
  /** Parçanın Mino'daki merkezi ve ekrandaki boyu (kabın koordinatında) */
  yerKutusu(id: ParcaId | 'bas-bahce-cicek', kap: HTMLElement): { x: number; y: number; w: number; h: number } {
    const [x, y, w, hh] = parcaKostum(id).kutu;
    const m = this.nokta(x + w / 2, y + hh / 2, kap);
    const o = this.olcek();
    return { x: m.x, y: m.y, w: w * o, h: hh * o };
  }

  /**
   * Parçayı fırlat-yakala ile giydirir: parça kaynaktan (kabın koordinatında) yay çizerek uçar, Mino hazırlanıp
   * (çömelir) zıplar, "pof" ve parça yerinde. Aynı yerde başka parça varsa önce o çıkarılıp atılır (atilan çağrılır:
   * nereye düşeceğine çağıran karar verir). Dönen söz parça yerine oturunca çözülür.
   */
  async giy(id: ParcaId, kaynak: Nokta, kaynakEn: number, kap: HTMLElement, katman: HTMLElement, atilan?: (eski: ParcaId, cikis: Nokta, boy: { w: number; h: number }) => void): Promise<ParcaId | null> {
    const { giyili, eski } = yerDegistir(this.giyili, id);
    if (!eski && this.giyili[parca(id).yer] === id) return null;
    const p = parca(id);
    // eski parça: kafadan / gövdeden yukarı kayar ve omzun üstünden geriye uçar (çağıran kondurur)
    if (eski) {
      const k = this.yerKutusu(eski, kap);
      this.giyili = { ...this.giyili, [p.yer]: undefined };
      this.giydir(this.giyili);
      void oynat(this.ic, [{ transform: 'translate(0,0)' }, { transform: 'translate(-6px, 4px) scale(1.03, 0.96)', offset: 0.3 }, { transform: 'translate(0,0)' }], 380);
      this.mino.tepki('hayir', 0.6);
      atilan?.(eski, { x: k.x, y: k.y }, { w: k.w, h: k.h });
      await bekle(200);
    }
    const hedef = this.yerKutusu(id, kap);
    const ucan = h('img.mg-ucan', { src: parcaResmi(id), alt: '', draggable: 'false', style: `width:${hedef.w}px;height:${hedef.h}px` });
    katman.append(ucan);
    ses.firlat();
    const s0 = Math.min(1, kaynakEn / Math.max(hedef.w, hedef.h));
    // hazırlık: çömelir, sonra zıplar (yakalama anı uçuşun sonuna denk gelir)
    void oynat(this.ic, [{ transform: 'scale(1,1)' }, { transform: 'scale(1.06, 0.92)' }, { transform: 'scale(1,1)' }], 300);
    const sure = TEST_MODU ? 20 : 560;
    window.setTimeout(() => this.mino.tepki('zipla', 0.62), ms(sure * 0.35));
    await kavis(ucan, kaynak, { x: hedef.x, y: hedef.y }, sure, { s0, s1: 1 });
    this.pof(katman, { x: hedef.x, y: hedef.y }, Math.max(hedef.w, hedef.h) * 0.9);
    ses.pof();
    this.giydir(giyili);
    ucan.remove();
    ses.hop();
    void hopla(this.ic, 0.4, 360);
    return eski;
  }

  /** Kod efekti "pof" bulutu (0.25 sn): değişimi örter */
  pof(katman: HTMLElement, n: Nokta, cap: number) {
    const b = h('div.mg-pof', { style: `left:${n.x}px;top:${n.y}px;width:${cap}px;height:${cap}px` }, ...Array.from({ length: 6 }, (_, i) => h('i', { style: `--a:${i}` })));
    katman.append(b);
    window.setTimeout(() => b.remove(), ms(420));
  }

  /** Parçayı Mino'dan çıkarıp kaba (dolaba) geri yollar: kafadan yukarı kayar, sonra uçar */
  cikar(yer: MinoKostumYer) {
    this.giyili = { ...this.giyili, [yer]: undefined };
    this.giydir(this.giyili);
  }

  /** Ayna: Mino aynaya doğru iki adım kayar, sevinir, döner */
  async aynayaBak(dx: number) {
    const adim = (x: number) => oynat(this.ic, [{ transform: `translateX(${x - dx / 2}px) translateY(0) scale(1,1)` }, { transform: `translateX(${x - dx / 4}px) translateY(-10px) scale(0.97,1.04)`, offset: 0.5 }, { transform: `translateX(${x}px) translateY(0) scale(1.04,0.96)` }], 240, { fill: 'forwards' });
    await adim(dx / 2);
    await adim(dx);
    this.mino.bak(Math.sign(dx));
    this.mino.tepki('sevinc');
    await bekle(1100);
    this.mino.bak(0);
    await oynat(this.ic, [{ transform: `translateX(${dx}px)` }, { transform: 'translateX(0)' }], 420, { fill: 'forwards' });
    this.ic.getAnimations().forEach((a) => a.cancel());
  }

  /** Dolap / sepet ikonunun adresi (uçuşun başındaki küçük resim için de) */
  static ikon(id: ParcaId) {
    return ikonResmi(id);
  }

  kapat() {
    this.mino.kapat();
  }
}

/** Atılan parça: bir yerden bir yere yay çizerek uçar (omzun üstünden geriye); hedefte küçülüp kaybolabilir */
export async function parcaUcur(katman: HTMLElement, id: ParcaId, a: Nokta, b: Nokta, boy: { w: number; h: number }, s1 = 0.5, sure = 620): Promise<void> {
  const el = h('img.mg-ucan', { src: parcaResmi(id), alt: '', draggable: 'false', style: `width:${boy.w}px;height:${boy.h}px` });
  katman.append(el);
  await kavis(el, a, b, sure, { s0: 1, s1, tepe: -Math.max(110, Math.abs(b.x - a.x) * 0.45) });
  el.remove();
}
