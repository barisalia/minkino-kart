// Derslerin "canlanma anları" için ortak parçalar (Keşfet, Mıknatıslar, Boyama). Paket H7, CLAUDE-ASTRA-MESAJLAR.md, 19 Kasım.
// Astra'nın çizimleri assets/alfabe/{kesif,miknatis,boyama}/ altına gelince kendiliğinden kullanılır; gelene kadar her an
// yalnız ışık, renk ve hareketle (yıldız simgesi, renk damlası) yaşanır. Test kipinde test kendi yer tutucusunu verebilir.
import { TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import './canlanma.css';

const cizimler = import.meta.glob<string>('../../assets/alfabe/{kesif,miknatis,boyama,odul,hece-koprusu,posta-kutusu,kurabiye}/*.webp', { eager: true, query: '?url', import: 'default' });
/** 'kesif/buyutec' gibi bir ad: dosya varsa adresi, yoksa undefined. */
export function canlanmaCizimi(ad: string): string | undefined {
  const deneme = TEST_MODU ? (window as { __canlanma?: Record<string, string> }).__canlanma?.[ad] : undefined;
  return deneme ?? cizimler['../../assets/alfabe/' + ad + '.webp'];
}
/** Sıralı kareler (ör. 'miknatis/kivilcim-0…2'): üçü de varsa liste, yoksa boş. */
export function canlanmaKareleri(ad: string, adet: number): string[] {
  const kareler = Array.from({ length: adet }, (_, i) => canlanmaCizimi(ad + '-' + i));
  return kareler.every(Boolean) ? kareler as string[] : [];
}
export const azHareket = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Bir anın bütün hareketlerini ve zamanlayıcılarını tutar; adım kapanınca hepsi birden durur, eklenen öğeler kalkar. */
export class An {
  private hareketler = new Set<Animation>();
  private zamanlar = new Set<number>();
  private ogeler = new Set<Element>();
  hareket(oge: Element, kareler: Keyframe[], ayar: KeyframeAnimationOptions): Animation {
    const a = oge.animate(kareler, ayar);
    this.hareketler.add(a);
    void a.finished.then(() => this.hareketler.delete(a), () => this.hareketler.delete(a));
    return a;
  }
  sonra(ms: number, is: () => void) {
    const z = window.setTimeout(() => { this.zamanlar.delete(z); is(); }, ms);
    this.zamanlar.add(z);
  }
  ekle<T extends Element>(kap: Element, oge: T): T { kap.append(oge); this.ogeler.add(oge); return oge; }
  kaldir(oge: Element) { oge.remove(); this.ogeler.delete(oge); }
  durdur() {
    for (const a of this.hareketler) a.cancel();
    for (const z of this.zamanlar) clearTimeout(z);
    for (const o of this.ogeler) o.remove();
    this.hareketler.clear(); this.zamanlar.clear(); this.ogeler.clear();
  }
}

/** Kabın içine, (x, y) noktasından dışa saçılan küçük ışıklar. Kıvılcım kareleri varsa onlar oynar. */
export function isikSac(an: An, kap: HTMLElement, x: number, y: number,
  ayar: { adet?: number; uzaklik?: number; boy?: number; renk?: string; kareler?: string[]; sure?: number } = {}) {
  const { adet = 6, uzaklik = 34, boy = 20, renk = '#f6c445', kareler = [], sure = 780 } = ayar;
  if (kareler.length) {
    // Astra'nın kıvılcımı: tek görsel, üç kare art arda, sonra söner.
    const img = an.ekle(kap, document.createElement('img'));
    img.className = 'cn-kare'; img.alt = ''; img.draggable = false; img.src = kareler[0];
    const b = boy * 4;
    Object.assign(img.style, { left: x - b / 2 + 'px', top: y - b / 2 + 'px', width: b + 'px', height: b + 'px' });
    const adim = sure / (kareler.length + 1);
    kareler.forEach((k, i) => an.sonra(adim * i, () => { img.src = k; }));
    an.hareket(img, [{ opacity: 1, transform: 'scale(.8)' }, { opacity: 1, transform: 'scale(1)', offset: .7 }, { opacity: 0, transform: 'scale(1.05)' }],
      { duration: sure, easing: 'ease-out', fill: 'forwards' }).finished.then(() => an.kaldir(img), () => {});
    return;
  }
  // Işıkların ortasında bir an parlayan sıcak ışık halesi: saçılan yıldızlar küçük kalsa da an okunur.
  const hale = an.ekle(kap, document.createElement('i'));
  hale.className = 'cn-hale'; hale.setAttribute('aria-hidden', 'true');
  const hb = uzaklik * 2.1;
  Object.assign(hale.style, { left: x - hb / 2 + 'px', top: y - hb / 2 + 'px', width: hb + 'px', height: hb + 'px' });
  an.hareket(hale, [{ transform: 'scale(.25)', opacity: 0 }, { transform: 'scale(.8)', opacity: .95, offset: .3 }, { transform: 'scale(1.15)', opacity: 0 }],
    { duration: sure * .9, easing: 'ease-out', fill: 'forwards' }).finished.then(() => an.kaldir(hale), () => {});
  for (let i = 0; i < adet; i++) {
    const isik = an.ekle(kap, document.createElement('i'));
    isik.className = 'cn-isik'; isik.setAttribute('aria-hidden', 'true'); isik.innerHTML = IKON.yildiz;
    isik.style.color = renk;
    const olcek = .55 + ((i * 37) % 10) / 22, b = boy * olcek;
    Object.assign(isik.style, { left: x - b / 2 + 'px', top: y - b / 2 + 'px', width: b + 'px', height: b + 'px' });
    const aci = (i / adet) * Math.PI * 2 + (i % 2 ? .3 : -.2), u = uzaklik * (.75 + (i % 3) * .18);
    const dx = Math.cos(aci) * u, dy = Math.sin(aci) * u;
    an.hareket(isik, [
      { transform: 'translate(0,0) scale(.3) rotate(0deg)', opacity: 0 },
      { transform: 'translate(' + dx * .6 + 'px,' + dy * .6 + 'px) scale(1.15) rotate(35deg)', opacity: 1, offset: .3 },
      { transform: 'translate(' + dx * .9 + 'px,' + dy * .9 + 'px) scale(.9) rotate(70deg)', opacity: 1, offset: .72 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.4) rotate(95deg)', opacity: 0 },
    ], { duration: sure + (i % 3) * 60, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' }).finished.then(() => an.kaldir(isik), () => {});
  }
}

/** Bir öğenin kaba göre yeri (kap position: relative olmalı). */
export function kabaGore(kap: HTMLElement, oge: Element) {
  const k = kap.getBoundingClientRect(), r = oge.getBoundingClientRect();
  return { x: r.left - k.left, y: r.top - k.top, w: r.width, h: r.height, cx: r.left - k.left + r.width / 2, cy: r.top - k.top + r.height / 2 };
}
