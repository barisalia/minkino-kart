/**
 * Konuşan anne (Bölüm 2): tasarımcının katmanlı ayakta çizimi (ekip/ege/anne.svg → assets/karakter-iskelet/anne.*):
 * gövde (ağzı boyanmış anne.webp) + asıl ağız + gizli 6 konuşma ağzı (agiz-kapali, -az, -orta, -yuvarlak, -dis,
 * -gulumse; ekip/ege/IFADELER.md "Anne"). Ortak Karakter bileşeniyle ağız dudak senkronuyla oynar (src/audio/dudak.ts).
 *
 * Görünüm anne.webp ile birebir aynı kalsın diye iskelet img'nin üstüne, aynı kutuya konur ve yalnız ağız bölgesi
 * çizilir: gövde katmanı ağzın çevresine kırpılır (orası tasarımcının ten rengine boyadığı yama), üstünde konuşma
 * ağzı. Anne susarken (asıl ağız) iskelet hiç görünmez, img olduğu gibi görünür: boyut, konum, piksel aynı.
 * - Gövde kıpırdamaz (ortak bileşenin nefesi / eğilmesi kapalı): yürüme, esneme, sallama eskisi gibi dış kutuda.
 * - Yalnız ayakta pozunda (ege.css): kanepe / sarılma pozları ayrı resim (konuşma ağzı yok), onlarda iskelet gizli.
 * - Seslendirilen cümle (ege.ts anneSoyle): ağız çalan kayda göre; balon cümlesi (sessiz): metnin hece ritmiyle.
 */
import { iskeletBilgisi, iskeletVar, Karakter } from '../../src/karakter/karakter';
import '../../src/karakter/karakter.css';
import { h } from '../../src/ui/dom';

export const anneIskeletVar = () => iskeletVar('anne');

/** Ağız yaması (tuval px, 428×1143): boyanmış bölge x 162–266, y 438–466 ve ağızların taşması için pay */
const YAMA = { x: 146, y: 424, w: 136, h: 58 };

let kimlik = 0;

export class AnneIskelet {
  readonly el: HTMLElement;
  private k: Karakter;
  /** seslendirilen cümle (anneSoyle): metni; null: sesli konuşmuyor */
  private sesli: string | null = null;
  private yeniSesli = false;
  private balonAcik = false;
  private balonMetin = '';

  /** balonEl: annenin sessiz balonu (açıkken ağız metnin ritmiyle oynar). hazir: iskelet kuruldu, çizimi çözüldü */
  constructor(
    private balonEl: HTMLElement,
    hazir: () => void,
  ) {
    this.k = new Karakter('anne', h('div'));
    this.el = h('div.eg-anne-iskelet.susuyor', { 'aria-hidden': 'true' }, this.k.el);
    this.k.ekHareket = (p) => {
      // gövde sabit: iskelet img'nin tam üstünde kalsın
      p.x = 0;
      p.y = 0;
      p.don = 0;
      p.sx = 1;
      p.sy = 1;
      p.kafa = 0;
      p.kafaY = 0;
      p.agizAcik = 0;
      this.agiz();
      // asıl ağız görünüyorsa (susuyor) iskelet gizli: img olduğu gibi
      const asil = this.k.parcaG('agiz');
      this.el.classList.toggle('susuyor', !asil || asil.style.opacity !== '0');
    };
    void this.k.hazir.then(async () => {
      const svg = this.el.querySelector('svg');
      const govde = this.k.parcaG('govde');
      if (!svg || !govde) return;
      // gövde yalnız ağız yamasında çizilir (gerisi alttaki img)
      const b = iskeletBilgisi('anne');
      const [tw, th] = b?.tuval ?? [428, 1143];
      const id = `eg-anne-yama-${++kimlik}`;
      const ns = 'http://www.w3.org/2000/svg';
      const kp = document.createElementNS(ns, 'clipPath');
      kp.id = id;
      kp.setAttribute('clipPathUnits', 'userSpaceOnUse');
      const r = document.createElementNS(ns, 'rect');
      r.setAttribute('x', String(YAMA.x));
      r.setAttribute('y', String(YAMA.y));
      r.setAttribute('width', String(Math.min(YAMA.w, tw - YAMA.x)));
      r.setAttribute('height', String(Math.min(YAMA.h, th - YAMA.y)));
      kp.append(r);
      const defs = document.createElementNS(ns, 'defs');
      defs.append(kp);
      svg.prepend(defs);
      govde.setAttribute('clip-path', `url(#${id})`);
      // gömülü resim önceden çözülsün (ilk konuşmada boş kare olmasın)
      await Promise.all(
        [...svg.querySelectorAll('image')].map((im) => {
          const src = im.getAttribute('href') ?? im.getAttribute('xlink:href');
          if (!src) return undefined;
          const i = new Image();
          i.src = src;
          return i.decode().catch(() => undefined);
        }),
      );
      hazir();
    });
  }

  /** Seslendirilen cümle başlıyor (metin) ya da bitti (null) */
  konus(metin: string | null) {
    this.sesli = metin;
    this.yeniSesli = !!metin;
  }

  /** Her kare: kim konuşuyor → ağız. Sesli cümle önce; yoksa balon açıkken metnin ritmi */
  private agiz() {
    if (this.sesli !== null) {
      if (this.yeniSesli) this.k.konus(true, true, { metin: this.sesli });
      else this.k.konus(true, true);
      this.yeniSesli = false;
      this.balonAcik = false;
      return;
    }
    const acik = this.balonEl.classList.contains('acik');
    const metin = this.balonEl.textContent ?? '';
    // yeni balon (ya da açıkken metni değişti): ritim baştan
    if (acik && (!this.balonAcik || metin !== this.balonMetin)) this.k.konus(true, false, { metin });
    else if (!acik) this.k.konus(false);
    this.balonAcik = acik;
    this.balonMetin = acik ? metin : '';
  }

  kapat() {
    this.k.kapat();
  }
}
